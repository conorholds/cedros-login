//! Workbench adapted for email: inline sRGB colors, presentation tables, system
//! fonts, and 44px touch targets. Keep in sync with Cedros Data's email layout.
//! HTML fragments passed to `document` are trusted, escaped by their renderers.

pub fn escape_html(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#x27;")
}

pub fn document(brand: &str, preheader: &str, body: &str, footer: &str) -> String {
    let brand = escape_html(if brand.trim().is_empty() {
        "Cedros"
    } else {
        brand
    });
    let preview = escape_html(preheader);
    format!(
        r#"<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>{preview}</title>
<style>
@media (prefers-color-scheme: dark) {{
.cd-email-bg {{ background-color:#171717 !important; }}
.cd-email-card {{ background-color:#262626 !important; border-color:#404040 !important; }}
.cd-email-text {{ color:#fafafa !important; }}
.cd-email-muted {{ color:#a3a3a3 !important; }}
.cd-email-rule {{ border-color:#404040 !important; }}
.cd-email-link, .cd-email-card a {{ color:#7fb0bd !important; }}
.cd-email-card .cd-email-danger {{ background-color:#b91c1c !important; border-color:#b91c1c !important; color:#fafafa !important; }}
.cd-email-card .cd-email-button {{ background-color:#e5e5e5 !important; border-color:#e5e5e5 !important; color:#262626 !important; }}
}}
@media only screen and (max-width:480px) {{ .cd-email-pad {{ padding:24px 16px !important; }} }}
</style></head>
<body class="cd-email-bg cd-email-text" style="margin:0;padding:0;background-color:#f5f5f5;color:#171717;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;-webkit-text-size-adjust:100%;">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">{preview}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" style="padding:32px 16px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
<tr><td class="cd-email-text" style="padding:0 0 16px;color:#171717;font-size:16px;font-weight:600;">{brand}</td></tr>
<tr><td class="cd-email-card cd-email-text cd-email-pad" style="padding:32px;background-color:#ffffff;border:1px solid #e5e5e5;border-radius:8px;color:#171717;font-size:14px;line-height:21px;overflow-wrap:anywhere;word-break:break-word;">
{body}
</td></tr>
<tr><td class="cd-email-muted" style="padding:16px 0 0;color:#666666;font-size:12px;line-height:18px;overflow-wrap:anywhere;">{footer}</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>"#
    )
}

pub fn heading(text: &str) -> String {
    format!(
        r#"<h1 class="cd-email-text" style="margin:0 0 24px;color:#171717;font-size:24px;line-height:30px;font-weight:600;">{}</h1>"#,
        escape_html(text)
    )
}

pub fn paragraph(text: &str) -> String {
    format!(
        r#"<p style="margin:0 0 16px;">{}</p>"#,
        escape_html(text).replace('\n', "<br>")
    )
}

pub fn note(text: &str) -> String {
    format!(
        r#"<p class="cd-email-muted" style="margin:16px 0 0;color:#737373;font-size:12px;line-height:18px;">{}</p>"#,
        escape_html(text)
    )
}

pub fn action(label: &str, url: &str, destructive: bool) -> String {
    let label = escape_html(label);
    let url = escape_html(url);
    let (class, color) = if destructive {
        ("cd-email-danger", "#b91c1c")
    } else {
        ("cd-email-button", "#262626")
    };
    format!(
        r#"<table class="cd-email-action" role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;"><tr><td bgcolor="{color}" style="border-radius:7px;"><a class="{class}" href="{url}" rel="noreferrer noopener" referrerpolicy="no-referrer" style="display:inline-block;background-color:{color};border:1px solid {color};border-radius:7px;color:#fafafa;font-size:14px;font-weight:600;line-height:20px;padding:12px 16px;text-align:center;text-decoration:none;mso-padding-alt:0;"><!--[if mso]><i style="mso-font-width:100%;mso-text-raise:18pt;">&emsp;</i><![endif]-->{label}<!--[if mso]><i style="mso-font-width:100%;">&emsp;</i><![endif]--></a></td></tr></table>
<p class="cd-email-muted" style="margin:0 0 16px;color:#737373;font-size:12px;line-height:18px;">If the button doesn't work, copy and paste this link into your browser:<br><a class="cd-email-link" href="{url}" rel="noreferrer noopener" referrerpolicy="no-referrer" style="color:#2f6c7d;text-decoration:underline;word-break:break-all;">{url}</a></p>"#
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn layout_has_email_safe_structure_and_workbench_modes() {
        let html = document(
            "Cedros",
            "Verify your email",
            &heading("Verify your email"),
            "Account notification",
        );
        assert!(html.contains("role=\"presentation\""));
        assert!(html.contains("max-width:600px"));
        assert!(html.contains("prefers-color-scheme: dark"));
        assert!(html.contains("mso-hide:all"));
        assert!(!html.contains("<script"));
    }

    #[test]
    fn action_escapes_urls_and_preserves_fallback_and_referrer_policy() {
        let html = action("Verify <email>", "https://example.test/?a=1&b=\"x\"", false);
        assert_eq!(
            html.matches("href=\"https://example.test/?a=1&amp;b=&quot;x&quot;\"")
                .count(),
            2
        );
        assert!(html.contains("Verify &lt;email&gt;"));
        assert_eq!(html.matches("referrerpolicy=\"no-referrer\"").count(), 2);
        assert!(action("Delete account", "https://example.test", true).contains("#b91c1c"));
    }

    #[test]
    fn text_slots_escape_markup() {
        assert!(document("<img>", "<script>", "", "").contains("&lt;script&gt;"));
        assert!(paragraph("<b>&\nnext").contains("&lt;b&gt;&amp;<br>next"));
        assert!(note("<b>").contains("&lt;b&gt;"));
    }
}
