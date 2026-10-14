//! Pure transactional email rendering shared by production and host previews.
use super::email_design::Design;
use super::email_layout as layout;

#[derive(serde::Serialize)]
pub struct RenderedEmail {
    #[serde(skip)]
    pub subject_customized: bool,
    pub subject: String,
    pub html: String,
    pub text: String,
}
struct Message<'a> {
    subject: String,
    heading: String,
    greeting: String,
    paragraphs: Vec<String>,
    action: Option<(&'a str, &'a str, bool)>,
    notices: Vec<String>,
    variables: Vec<(&'a str, String)>,
}
fn who(name: Option<&str>) -> &str {
    name.filter(|n| !n.trim().is_empty()).unwrap_or("there")
}
fn plural(count: i64, unit: &str) -> String {
    if count == 1 {
        format!("1 {unit}")
    } else {
        format!("{count} {unit}s")
    }
}
fn render(design: &Design, m: Message<'_>) -> RenderedEmail {
    let c = &design.copy;
    let expand = |s: &str| {
        m.variables.iter().fold(
            s.replace("{{site_name}}", &design.theme.brand_name),
            |s, (key, value)| s.replace(&format!("{{{{{key}}}}}"), value),
        )
    };
    let subject = c.subject.as_deref().map(&expand).unwrap_or(m.subject);
    let heading = c.heading.as_deref().map(&expand).unwrap_or(m.heading);
    let preheader = c
        .preheader
        .as_deref()
        .map(&expand)
        .unwrap_or_else(|| heading.clone());
    let greeting = c.greeting.as_deref().map(&expand).unwrap_or(m.greeting);
    let paragraphs = if c.introductory_paragraphs.is_empty() {
        m.paragraphs
    } else {
        c.introductory_paragraphs
            .iter()
            .map(|x| expand(x))
            .collect()
    };
    let mut text = vec![greeting.clone()];
    text.extend(paragraphs.clone());
    let heading_html = if design.published {
        layout::heading_with_theme(&heading, &design.theme)
    } else {
        layout::heading(&heading)
    };
    let mut body = heading_html + &layout::paragraph(&greeting);
    for paragraph in &paragraphs {
        body += &layout::paragraph(paragraph);
    }
    if let Some((label, url, destructive)) = m.action {
        let label = c
            .action_label
            .as_deref()
            .map(&expand)
            .unwrap_or_else(|| label.into());
        body += &if design.published {
            layout::action_with_theme(&label, url, destructive, &design.theme)
        } else {
            layout::action(&label, url, destructive)
        };
        text.push(format!("{label}:\n{url}"));
    }
    // Security notices and action URLs are always assembled by Login.
    for notice in m.notices {
        body += &if design.published {
            layout::note_with_theme(&notice, &design.theme)
        } else {
            layout::note(&notice)
        };
        text.push(notice);
    }
    if let Some(closing) = &c.closing {
        let closing = expand(closing);
        body += &layout::paragraph(&closing);
        text.push(closing);
    }
    let mut footer = design.footer.clone();
    if let Some(note) = &c.footer_note {
        footer.push(expand(note));
    }
    text.extend(footer.clone());
    let footer = if footer.is_empty() {
        "Account notification".into()
    } else {
        footer
            .iter()
            .map(|x| layout::escape_html(x))
            .collect::<Vec<_>>()
            .join("<br>")
    };
    RenderedEmail {
        subject_customized: c.subject.is_some(),
        subject,
        html: if design.published {
            layout::document_with_theme(&design.theme, &preheader, &body, &footer)
        } else {
            layout::document(&design.theme.brand_name, &preheader, &body, &footer)
        },
        text: text.join("\n\n"),
    }
}
fn button(
    design: &Design,
    kind: &str,
    name: Option<&str>,
    url: &str,
    expires: i64,
) -> RenderedEmail {
    let who = who(name);
    let (subject,heading,intro,label,unit,notice,destructive)=match kind {
  "verify"=>("Verify your email address","Verify your email","Please confirm your email address to finish setting up your account:","Verify email","hour","If you didn't create an account, you can safely ignore this email.",false),
  "instant"=>("Your sign-in link","Sign in","Use this link to sign in without a password. The link can be used once.","Sign in","minute","If you didn't request this, you can safely ignore this email.",false),
  "reset"=>("Reset your password","Reset your password","A password reset was requested for your account. Choose a new password.","Reset password","minute","If you didn't request this, you can safely ignore this email.",false),
  _=>("Confirm your account deletion","Delete your account","You requested permanent account deletion. This cannot be undone.","Delete account","hour","If you didn't request this, ignore this email. Your account will not be deleted. This action permanently deletes your account and cannot be undone.",true),
 };
    render(
        design,
        Message {
            subject: subject.into(),
            heading: heading.into(),
            greeting: format!("Hi {who},"),
            paragraphs: vec![intro.into()],
            action: Some((label, url, destructive)),
            notices: vec![
                if kind == "instant" {
                    format!(
                        "This link expires in {} and can be used once.",
                        plural(expires, unit)
                    )
                } else {
                    format!("This link expires in {}.", plural(expires, unit))
                },
                notice.into(),
            ],
            variables: vec![("user_name", who.into())],
        },
    )
}
pub fn verification(design: &Design, name: Option<&str>, url: &str, hours: i64) -> RenderedEmail {
    button(design, "verify", name, url, hours)
}
pub fn instant_link(design: &Design, name: Option<&str>, url: &str, minutes: i64) -> RenderedEmail {
    button(design, "instant", name, url, minutes)
}
pub fn password_reset(
    design: &Design,
    name: Option<&str>,
    url: &str,
    minutes: i64,
) -> RenderedEmail {
    button(design, "reset", name, url, minutes)
}
pub fn account_deletion(
    design: &Design,
    name: Option<&str>,
    url: &str,
    hours: i64,
) -> RenderedEmail {
    button(design, "delete", name, url, hours)
}
fn placeholder_org_name(name: &str) -> bool {
    let name = name.trim();
    name.is_empty()
        || [
            "default",
            "organization",
            "my organization",
            "personal workspace",
        ]
        .iter()
        .any(|p| name.eq_ignore_ascii_case(p))
}
pub fn invite(
    design: &Design,
    org_name: &str,
    inviter: Option<&str>,
    role: &str,
    url: &str,
    days: i64,
) -> RenderedEmail {
    let inviter = inviter.map(str::trim).filter(|n| !n.is_empty());
    let org = if placeholder_org_name(org_name) {
        inviter
            .map(|n| format!("{n}'s team"))
            .unwrap_or_else(|| format!("a team on {}", design.theme.brand_name))
    } else {
        org_name.trim().into()
    };
    let by = inviter
        .map(|n| format!("{n} invited you"))
        .unwrap_or_else(|| "You've been invited".into());
    render(
        design,
        Message {
            subject: format!("You've been invited to join {org}"),
            heading: format!("Join {org}"),
            greeting: format!("{by} to join {org} as {role}."),
            paragraphs: vec!["Accept the invitation to join the team.".into()],
            action: Some(("Accept invitation", url, false)),
            notices: vec![
                format!("This invitation expires in {}.", plural(days, "day")),
                "If you weren't expecting this invitation, you can ignore this email.".into(),
            ],
            variables: vec![
                ("org_name", org),
                (
                    "inviter_name",
                    inviter.unwrap_or("Your administrator").into(),
                ),
                ("role", role.into()),
            ],
        },
    )
}
pub fn security_alert(design: &Design, name: Option<&str>, detail: &str) -> RenderedEmail {
    let design = Design {
        published: design.published,
        theme: design.theme.clone(),
        copy: Default::default(),
        footer: design.footer.clone(),
    };
    render(&design,Message{subject:"Security alert on your account".into(),heading:"Security alert".into(),greeting:format!("Hi {},",who(name)),paragraphs:vec![detail.into(),format!("{} signed you out of your sessions to protect your account. If you recognize this activity, sign in again. If you don't, reset your password before signing in.",design.theme.brand_name)],action:None,notices:vec![],variables:vec![]})
}
pub fn new_device_login(
    design: &Design,
    name: Option<&str>,
    when: &str,
    ip: Option<&str>,
    device: &str,
) -> RenderedEmail {
    let design = Design {
        published: design.published,
        theme: design.theme.clone(),
        copy: Default::default(),
        footer: design.footer.clone(),
    };
    render(&design,Message{subject:"New sign-in to your account".into(),heading:"New sign-in".into(),greeting:format!("Hi {},",who(name)),paragraphs:vec![format!("{} detected a sign-in from a device you don't usually use.",design.theme.brand_name),format!("When: {when}\nDevice: {device}\nIP address: {}",ip.unwrap_or("unknown")),"If this was you, no action is needed. If you don't recognize this sign-in, reset your password.".into()],action:None,notices:vec![],variables:vec![]})
}
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn all_account_emails_share_workbench_layout_and_readable_text() {
        let url = "https://app.test/action?token=one&returnTo=%2Fadmin";
        let emails = [
            verification(&Design::built_in("Cedros"), Some("Alex & Sam"), url, 1),
            instant_link(&Design::built_in("Cedros"), Some("Alex & Sam"), url, 15),
            password_reset(&Design::built_in("Cedros"), Some("Alex & Sam"), url, 60),
            account_deletion(&Design::built_in("Cedros"), Some("Alex & Sam"), url, 24),
            invite(
                &Design::built_in("Cedros"),
                "Alex & Sam",
                Some("Dana"),
                "member",
                url,
                7,
            ),
            security_alert(
                &Design::built_in("Cedros"),
                Some("Alex & Sam"),
                "A replaced token was reused.",
            ),
            new_device_login(
                &Design::built_in("Cedros"),
                Some("Alex & Sam"),
                "6 September 2026",
                None,
                "Safari",
            ),
        ];
        for email in emails {
            assert!(email.html.contains("class=\"cd-email-card"));
            assert!(email.html.contains("prefers-color-scheme: dark"));
            assert!(email.html.contains("Alex &amp; Sam"));
            assert!(email.text.contains("Alex & Sam"));
            assert!(!email.text.contains("&amp;"));
            assert!(!email.subject.contains("&amp;"));
            assert!(!email.html.contains("#4F46E5"));
        }
    }

    #[test]
    fn token_urls_are_escaped_only_in_html_and_alerts_have_no_false_device_revocation_copy() {
        let url = "https://app.test/?token=x&next=\"quoted\"";
        let email = verification(&Design::built_in("Cedros"), Some("<Alex>"), url, 24);
        assert!(email.text.contains(url));
        assert!(email.text.contains("<Alex>"));
        assert!(!email.html.contains("Hi <Alex>"));
        assert!(email.html.contains("&amp;next=&quot;quoted&quot;"));
        let device = new_device_login(
            &Design::built_in("Cedros"),
            None,
            "today",
            None,
            "<script>bad</script>",
        );
        assert!(!device.html.contains("<script>"));
        assert!(!device.text.contains("signed you out"));
        assert!(
            security_alert(&Design::built_in("Cedros"), None, "Replaced token reused")
                .text
                .contains("reset your password")
        );
    }

    #[test]
    fn escapes_and_pluralizes() {
        assert_eq!(layout::escape_html("<b>&\"'"), "&lt;b&gt;&amp;&quot;&#x27;");
        assert_eq!(plural(1, "hour"), "1 hour");
        assert_eq!(plural(3, "day"), "3 days");
    }

    #[test]
    fn invite_subject_and_body_include_org_and_link() {
        let r = invite(
            &Design::built_in("Cedros"),
            "Acme",
            Some("Dana"),
            "member",
            "https://app.test/accept-invite?token=t",
            7,
        );
        assert_eq!(r.subject, "You've been invited to join Acme");
        assert!(r.html.contains("https://app.test/accept-invite?token=t"));
        assert!(r.text.contains("Dana invited you"));
    }

    #[test]
    fn placeholder_or_missing_account_names_never_reach_an_invitee() {
        for name in [
            "Default",
            " default ",
            "",
            "Personal Workspace",
            "Organization",
        ] {
            let named = invite(
                &Design::built_in("Cedros"),
                name,
                Some("Dana"),
                "member",
                "https://app.test/a",
                7,
            );
            assert_eq!(
                named.subject, "You've been invited to join Dana's team",
                "{name:?}"
            );
            assert!(named
                .text
                .contains("Dana invited you to join Dana's team as member."));
            assert!(!named.html.to_lowercase().contains("default"));
            let anonymous = invite(
                &Design::built_in("Cedros"),
                name,
                None,
                "member",
                "https://app.test/a",
                7,
            );
            assert_eq!(
                anonymous.subject,
                "You've been invited to join a team on Cedros"
            );
        }
        let real = invite(
            &Design::built_in("Cedros"),
            "Default Studios",
            Some("Dana"),
            "member",
            "https://app.test/a",
            7,
        );
        assert_eq!(real.subject, "You've been invited to join Default Studios");
    }

    #[test]
    fn escapes_untrusted_org_name_in_html() {
        let r = invite(
            &Design::built_in("Cedros"),
            "<script>x</script>",
            None,
            "member",
            "https://app.test/a",
            7,
        );
        assert!(!r.html.contains("<script>"));
        assert!(r.html.contains("&lt;script&gt;"));
    }

    #[test]
    fn verification_email_uses_branded_layout_and_an_absolute_action_link() {
        let rendered = verification(
            &Design::built_in("Cedros"),
            Some("Conor"),
            "https://cedros.ai/verify-email?token=abc&returnTo=%2Fportal",
            24,
        );

        assert!(rendered.html.contains(">Cedros</td>"));
        assert!(rendered.html.contains("background-color:#262626"));
        assert!(rendered
            .html
            .contains("https://cedros.ai/verify-email?token=abc&amp;returnTo=%2Fportal"));
        assert!(rendered
            .text
            .contains("https://cedros.ai/verify-email?token=abc"));
    }

    #[test]
    fn configured_brand_applies_to_every_account_email_and_security_copy() {
        let brand = "VineScribe & <Friends>";
        let url = "https://vinescribe.com/verify-email?token=test";
        let emails = [
            verification(&Design::built_in(brand), None, url, 24),
            instant_link(&Design::built_in(brand), None, url, 15),
            password_reset(&Design::built_in(brand), None, url, 60),
            account_deletion(&Design::built_in(brand), None, url, 24),
            invite(&Design::built_in(brand), "Default", None, "member", url, 7),
            security_alert(&Design::built_in(brand), None, "Replaced token reused"),
            new_device_login(&Design::built_in(brand), None, "today", None, "Safari"),
        ];
        for email in emails {
            assert!(email
                .html
                .contains(">VineScribe &amp; &lt;Friends&gt;</td>"));
            assert!(!email.html.contains("Cedros"));
            assert!(!email.text.contains("Cedros"));
            assert!(!email.html.contains("<Friends>"));
        }
    }

    #[test]
    fn published_copy_preserves_tokens_expiry_and_destructive_styling() {
        let mut design = Design::built_in("VineScribe");
        design.copy.subject = Some("Welcome {{user_name}} to {{site_name}}".into());
        design.copy.greeting = Some("Hello {{user_name}}".into());
        design.copy.heading = Some("<script>hello</script>".into());
        design.copy.action_label = Some("Continue".into());
        design.copy.introductory_paragraphs = vec!["Your account is ready.".into()];
        let email = account_deletion(
            &design,
            Some("<Alex>"),
            "https://app.test/delete?token=real&x=1",
            1,
        );
        assert_eq!(email.subject, "Welcome <Alex> to VineScribe");
        assert!(email.html.contains("&lt;script&gt;hello&lt;/script&gt;"));
        assert!(!email.html.contains("<script>"));
        assert!(email.html.contains("cd-email-danger"));
        assert!(email
            .text
            .contains("https://app.test/delete?token=real&x=1"));
        assert!(email.text.contains("expires in 1 hour"));
        assert!(email.text.contains("permanently deletes your account"));
        assert!(!email.text.contains("{{"));
        assert!(email.subject_customized);
        assert_eq!(
            crate::routes::with_subject_override(email, "email_subject_verification").subject,
            "Welcome <Alex> to VineScribe"
        );
        let email = instant_link(&design, None, "https://app.test/sign-in", 15);
        assert!(email.text.contains("can be used once"));
    }
}
