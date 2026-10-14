//! Published host presentation contract. Resolution precedes durable outbox work.
use super::email_layout::{
    EmailColorTheme, EmailHeaderAlignment, EmailHeaderMode, EmailLayoutTheme,
};
use crate::host::{self, providers, SeamError};
use serde::Deserialize;

#[derive(Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CopyOverride {
    pub subject: Option<String>,
    pub preheader: Option<String>,
    pub heading: Option<String>,
    pub greeting: Option<String>,
    #[serde(default)]
    pub introductory_paragraphs: Vec<String>,
    pub action_label: Option<String>,
    pub closing: Option<String>,
    pub footer_note: Option<String>,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Branding {
    display_name: String,
    header_mode: String,
    header_alignment: String,
    logo: Option<Logo>,
    light: Palette,
    dark: Palette,
    site_footer: String,
    support_contact: String,
    show_cedros_attribution: bool,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Logo {
    asset_id: String,
    public_url: String,
    alt_text: String,
    width: u16,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Palette {
    primary_button_background: String,
    primary_button_text: String,
    link: String,
    page_background: String,
    card_background: String,
    heading: String,
    body_text: String,
    muted_text: String,
    border: String,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Presentation {
    pub branding: Branding,
    pub copy: Option<CopyOverride>,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Response {
    contract_version: u32,
    publication_version: i64,
    template_id: String,
    locale: String,
    design: Option<Resolved>,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Resolved {
    contract_version: u32,
    publication_version: i64,
    template_id: String,
    locale: String,
    branding: Branding,
    copy: Option<CopyOverride>,
}

pub struct Design {
    pub published: bool,
    pub theme: EmailLayoutTheme,
    pub copy: CopyOverride,
    pub footer: Vec<String>,
}
impl Design {
    pub fn built_in(brand: &str) -> Self {
        Self {
            published: false,
            theme: EmailLayoutTheme::default_with_brand(brand),
            copy: CopyOverride::default(),
            footer: Vec::new(),
        }
    }
    pub fn from_presentation(value: Presentation) -> host::Result<Self> {
        let b = value.branding;
        if b.display_name.trim().is_empty() || b.display_name.contains(['\r', '\n']) {
            return Err(invalid());
        }
        let mut theme = EmailLayoutTheme::default_with_brand(&b.display_name);
        theme.header_mode = match b.header_mode.as_str() {
            "name" => EmailHeaderMode::Name,
            "logo" => EmailHeaderMode::Logo,
            "logo_and_name" => EmailHeaderMode::LogoAndName,
            _ => return Err(invalid()),
        };
        theme.header_alignment = match b.header_alignment.as_str() {
            "left" => EmailHeaderAlignment::Left,
            "center" => EmailHeaderAlignment::Center,
            _ => return Err(invalid()),
        };
        theme.light = b.light.theme()?;
        theme.dark = b.dark.theme()?;
        if let Some(logo) = b.logo {
            if !logo.public_url.starts_with("https://")
                || logo.width == 0
                || logo.width > 600
                || uuid::Uuid::parse_str(&logo.asset_id).is_err()
            {
                return Err(invalid());
            }
            theme.logo_url = Some(logo.public_url);
            theme.logo_alt = logo.alt_text;
            theme.logo_width = logo.width;
        }
        let mut footer = vec![b.site_footer, b.support_contact];
        if b.show_cedros_attribution {
            footer.push("Sent securely by Cedros".into());
        }
        footer.retain(|x| !x.trim().is_empty());
        let copy = value.copy.unwrap_or_default();
        if copy
            .subject
            .as_ref()
            .is_some_and(|x| x.contains(['\r', '\n']))
        {
            return Err(invalid());
        }
        Ok(Self {
            published: true,
            theme,
            copy,
            footer,
        })
    }
}
impl Palette {
    fn theme(self) -> host::Result<EmailColorTheme> {
        let colors = [
            &self.primary_button_background,
            &self.primary_button_text,
            &self.link,
            &self.page_background,
            &self.card_background,
            &self.heading,
            &self.body_text,
            &self.muted_text,
            &self.border,
        ];
        if colors.iter().any(|c| {
            c.len() != 7
                || !c.starts_with('#')
                || !c.as_bytes()[1..].iter().all(u8::is_ascii_hexdigit)
        }) {
            return Err(invalid());
        }
        Ok(EmailColorTheme {
            primary_button_background: self.primary_button_background,
            primary_button_text: self.primary_button_text,
            link: self.link,
            page_background: self.page_background,
            card_background: self.card_background,
            heading: self.heading,
            body_text: self.body_text,
            muted_text: self.muted_text,
            border: self.border,
        })
    }
}
fn invalid() -> SeamError {
    SeamError::Encoding("invalid system email design contract".into())
}
pub fn resolve(template_id: &str) -> host::Result<Design> {
    let response = providers::execute(
        providers::EMAIL_ACCESS,
        "email",
        "resolve-design",
        &serde_json::json!({"contractVersion":1,"templateId":template_id,"locale":"en"})
            .to_string(),
    )?;
    parse(&response, template_id)
}
fn parse(response: &str, template_id: &str) -> host::Result<Design> {
    let r: Response = host::from_json(response)?;
    if r.contract_version != 1
        || r.template_id != template_id
        || r.locale != "en"
        || r.publication_version < 0
    {
        return Err(invalid());
    }
    match r.design {
        None if r.publication_version == 0 => Ok(Design::built_in("Cedros")),
        Some(d)
            if d.contract_version == 1
                && d.publication_version == r.publication_version
                && d.template_id == r.template_id
                && d.locale == r.locale =>
        {
            Design::from_presentation(Presentation {
                branding: d.branding,
                copy: d.copy,
            })
        }
        _ => Err(invalid()),
    }
}
#[cfg(test)]
pub(crate) fn fixture() -> serde_json::Value {
    let colors = serde_json::json!({"primaryButtonBackground":"#246341","primaryButtonText":"#ffffff","link":"#246341","pageBackground":"#f5f5f5","cardBackground":"#ffffff","heading":"#171717","bodyText":"#171717","mutedText":"#666666","border":"#e5e5e5"});
    serde_json::json!({"branding":{"displayName":"VineScribe","headerMode":"name","headerAlignment":"center","logo":null,"light":colors,"dark":colors,"siteFooter":"","supportContact":"team@vinescribe.com","showCedrosAttribution":false},"copy":null})
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn null_is_explicit_legacy_default_and_contract_drift_is_rejected() {
        let response = serde_json::json!({"contractVersion":1,"publicationVersion":0,"templateId":"cedros-login/email_verification","locale":"en","design":null});
        assert_eq!(
            parse(&response.to_string(), "cedros-login/email_verification")
                .unwrap()
                .theme
                .brand_name,
            "Cedros"
        );
        assert!(parse(&response.to_string(), "cedros-login/password_reset").is_err());
        let mut bad = response;
        bad["publicationVersion"] = 1.into();
        assert!(parse(&bad.to_string(), "cedros-login/email_verification").is_err());
    }
    #[test]
    fn published_response_applies_palette_and_rejects_unsafe_css_and_logo() {
        let presentation = fixture();
        let mut resolved = presentation.clone();
        resolved["contractVersion"] = 1.into();
        resolved["publicationVersion"] = 2.into();
        resolved["templateId"] = "cedros-login/email_verification".into();
        resolved["locale"] = "en".into();
        let response = serde_json::json!({"contractVersion":1,"publicationVersion":2,"templateId":"cedros-login/email_verification","locale":"en","design":resolved});
        let design = parse(&response.to_string(), "cedros-login/email_verification").unwrap();
        let email = super::super::email_templates::verification(
            &design,
            Some("Alex"),
            "https://vinescribe.com/verify?token=test",
            24,
        );
        assert!(email.html.contains("background-color:#246341"));
        assert!(email.html.contains("text-align:center"));
        assert!(email.html.contains(">VineScribe</td>"));
        assert!(!email.html.contains("Cedros"));
        let mut invalid_css = presentation.clone();
        invalid_css["branding"]["light"]["heading"] = "red;display:none".into();
        assert!(Design::from_presentation(serde_json::from_value(invalid_css).unwrap()).is_err());
        let mut invalid_logo = presentation;
        invalid_logo["branding"]["logo"] = serde_json::json!({"assetId":"9f0557b4-5bff-4535-aa27-943f8c84610e","publicUrl":"javascript:alert(1)","altText":"logo","width":160});
        assert!(Design::from_presentation(serde_json::from_value(invalid_logo).unwrap()).is_err());
    }
}
