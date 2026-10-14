//! Host-compatible themed email layout layered over the shared built-in helpers.
#[path = "../../../server/src/services/email/layout.rs"]
mod built_in;
pub use built_in::{action, document, escape_html, heading, note, paragraph};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EmailHeaderMode {
    Name,
    Logo,
    LogoAndName,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EmailHeaderAlignment {
    Left,
    Center,
}

#[derive(Debug, Clone)]
pub struct EmailColorTheme {
    pub primary_button_background: String,
    pub primary_button_text: String,
    pub link: String,
    pub page_background: String,
    pub card_background: String,
    pub heading: String,
    pub body_text: String,
    pub muted_text: String,
    pub border: String,
}

#[derive(Debug, Clone)]
pub struct EmailLayoutTheme {
    pub brand_name: String,
    pub header_mode: EmailHeaderMode,
    pub header_alignment: EmailHeaderAlignment,
    pub logo_url: Option<String>,
    pub logo_alt: String,
    pub logo_width: u16,
    pub light: EmailColorTheme,
    pub dark: EmailColorTheme,
    /// Preview-only override. Production output keeps client-driven dark rules.
    pub force_dark: bool,
}

impl EmailLayoutTheme {
    pub fn default_with_brand(brand: &str) -> Self {
        Self {
            brand_name: if brand.trim().is_empty() {
                "Cedros"
            } else {
                brand
            }
            .to_string(),
            header_mode: EmailHeaderMode::Name,
            header_alignment: EmailHeaderAlignment::Left,
            logo_url: None,
            logo_alt: String::new(),
            logo_width: 160,
            light: EmailColorTheme {
                primary_button_background: "#262626".into(),
                primary_button_text: "#fafafa".into(),
                link: "#2f6c7d".into(),
                page_background: "#f5f5f5".into(),
                card_background: "#ffffff".into(),
                heading: "#171717".into(),
                body_text: "#171717".into(),
                muted_text: "#666666".into(),
                border: "#e5e5e5".into(),
            },
            dark: EmailColorTheme {
                primary_button_background: "#e5e5e5".into(),
                primary_button_text: "#262626".into(),
                link: "#7fb0bd".into(),
                page_background: "#171717".into(),
                card_background: "#262626".into(),
                heading: "#fafafa".into(),
                body_text: "#fafafa".into(),
                muted_text: "#a3a3a3".into(),
                border: "#404040".into(),
            },
            force_dark: false,
        }
    }
}

pub fn document_with_theme(
    theme: &EmailLayoutTheme,
    preheader: &str,
    body: &str,
    footer: &str,
) -> String {
    let palette = if theme.force_dark {
        &theme.dark
    } else {
        &theme.light
    };
    let brand_name = escape_html(if theme.brand_name.trim().is_empty() {
        "Cedros"
    } else {
        &theme.brand_name
    });
    let header_alignment = match theme.header_alignment {
        EmailHeaderAlignment::Left => "left",
        EmailHeaderAlignment::Center => "center",
    };
    let logo = theme
        .logo_url
        .as_deref()
        .filter(|value| !value.trim().is_empty())
        .map(|url| {
            format!(
                r#"<img src="{}" width="{}" alt="{}" style="display:inline-block;width:{}px;max-width:100%;height:auto;border:0;vertical-align:middle;">"#,
                escape_html(url),
                theme.logo_width,
                escape_html(if theme.logo_alt.trim().is_empty() { &theme.brand_name } else { &theme.logo_alt }),
                theme.logo_width,
            )
        });
    let header = match (theme.header_mode, logo) {
        (EmailHeaderMode::Logo, Some(logo)) => logo,
        (EmailHeaderMode::LogoAndName, Some(logo)) => {
            format!(
                r#"{logo}<span style="display:inline-block;margin-left:10px;vertical-align:middle;">{brand_name}</span>"#
            )
        }
        _ => brand_name,
    };
    let preview = escape_html(preheader);
    format!(
        r#"<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>{preview}</title>
<style>
@media (prefers-color-scheme: dark) {{
.cd-email-bg {{ background-color:{dark_page} !important; }}
.cd-email-card {{ background-color:{dark_card} !important; border-color:{dark_border} !important; }}
.cd-email-text {{ color:{dark_body} !important; }}
.cd-email-heading, .cd-email-card h1, .cd-email-card h2, .cd-email-card h3 {{ color:{dark_heading} !important; }}
.cd-email-muted {{ color:{dark_muted} !important; }}
.cd-email-rule {{ border-color:{dark_border} !important; }}
.cd-email-link, .cd-email-card a {{ color:{dark_link} !important; }}
.cd-email-card .cd-email-danger {{ background-color:#b91c1c !important; border-color:#b91c1c !important; color:#fafafa !important; }}
.cd-email-card .cd-email-button {{ background-color:{dark_button} !important; border-color:{dark_button} !important; color:{dark_button_text} !important; }}
}}
@media only screen and (max-width:480px) {{ .cd-email-pad {{ padding:24px 16px !important; }} }}
</style></head>
<body class="cd-email-bg cd-email-text" style="margin:0;padding:0;background-color:{page};color:{body_text};font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;-webkit-text-size-adjust:100%;">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">{preview}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" style="padding:32px 16px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
<tr><td class="cd-email-text" align="{header_alignment}" style="padding:0 0 16px;color:{body_text};font-size:16px;font-weight:600;text-align:{header_alignment};">{header}</td></tr>
<tr><td class="cd-email-card cd-email-text cd-email-pad" style="padding:32px;background-color:{card};border:1px solid {border};border-radius:8px;color:{body_text};font-size:14px;line-height:21px;overflow-wrap:anywhere;word-break:break-word;">
{body}
</td></tr>
<tr><td class="cd-email-muted" style="padding:16px 0 0;color:{muted};font-size:12px;line-height:18px;overflow-wrap:anywhere;">{footer}</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>"#,
        dark_page = theme.dark.page_background,
        dark_card = theme.dark.card_background,
        dark_border = theme.dark.border,
        dark_body = theme.dark.body_text,
        dark_heading = theme.dark.heading,
        dark_muted = theme.dark.muted_text,
        dark_link = theme.dark.link,
        dark_button = theme.dark.primary_button_background,
        dark_button_text = theme.dark.primary_button_text,
        page = palette.page_background,
        card = palette.card_background,
        border = palette.border,
        body_text = palette.body_text,
        muted = palette.muted_text,
    )
}

pub fn heading_with_theme(text: &str, theme: &EmailLayoutTheme) -> String {
    let palette = if theme.force_dark {
        &theme.dark
    } else {
        &theme.light
    };
    format!(
        r#"<h1 class="cd-email-text cd-email-heading" style="margin:0 0 24px;color:{};font-size:24px;line-height:30px;font-weight:600;">{}</h1>"#,
        palette.heading,
        escape_html(text)
    )
}

pub fn note_with_theme(text: &str, theme: &EmailLayoutTheme) -> String {
    let palette = if theme.force_dark {
        &theme.dark
    } else {
        &theme.light
    };
    format!(
        r#"<p class="cd-email-muted" style="margin:16px 0 0;color:{};font-size:12px;line-height:18px;">{}</p>"#,
        palette.muted_text,
        escape_html(text)
    )
}

pub fn action_with_theme(
    label: &str,
    url: &str,
    destructive: bool,
    theme: &EmailLayoutTheme,
) -> String {
    let label = escape_html(label);
    let url = escape_html(url);
    let palette = if theme.force_dark {
        &theme.dark
    } else {
        &theme.light
    };
    let (class, color, text_color) = if destructive {
        ("cd-email-danger", "#b91c1c", "#fafafa")
    } else {
        (
            "cd-email-button",
            palette.primary_button_background.as_str(),
            palette.primary_button_text.as_str(),
        )
    };
    format!(
        r#"<table class="cd-email-action" role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;"><tr><td bgcolor="{color}" style="border-radius:7px;"><a class="{class}" href="{url}" rel="noreferrer noopener" referrerpolicy="no-referrer" style="display:inline-block;background-color:{color};border:1px solid {color};border-radius:7px;color:{text_color};font-size:14px;font-weight:600;line-height:20px;padding:12px 16px;text-align:center;text-decoration:none;mso-padding-alt:0;"><!--[if mso]><i style="mso-font-width:100%;mso-text-raise:18pt;">&emsp;</i><![endif]-->{label}<!--[if mso]><i style="mso-font-width:100%;">&emsp;</i><![endif]--></a></td></tr></table>
<p class="cd-email-muted" style="margin:0 0 16px;color:{muted};font-size:12px;line-height:18px;">If the button doesn't work, copy and paste this link into your browser:<br><a class="cd-email-link" href="{url}" rel="noreferrer noopener" referrerpolicy="no-referrer" style="color:{link};text-decoration:underline;word-break:break-all;">{url}</a></p>"#,
        muted = palette.muted_text,
        link = palette.link,
    )
}
