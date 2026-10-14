//! Individual skill content generators - admin skill

use super::content::ContentConfig;

/// Skill file content for admin.md
pub fn generate_skill_admin_md(config: &ContentConfig) -> String {
    let base = &config.base_path;
    format!(
        r#"---
skill: admin
name: Admin
version: "{version}"
description: System administration and user management
apiBase: "{base}"
requiresAuth: true
requiresAdmin: true
---

# Admin Skill

Administrative operations requiring elevated permissions.

## User Management

### List Users (Org Admin)

```
GET {base}/orgs/{{org_id}}/members?page=1&limit=20
Authorization: Bearer <api-key>
```

### Update User Role

```
PATCH {base}/orgs/{{org_id}}/members/{{user_id}}
Authorization: Bearer <api-key>
Content-Type: application/json

{{"role": "admin"}}
```

### Remove User

```
DELETE {base}/orgs/{{org_id}}/members/{{user_id}}
Authorization: Bearer <api-key>
```

## System Settings

### Get Settings

```
GET {base}/admin/settings
Authorization: Bearer <api-key>
```

### Update Settings

```
PATCH {base}/admin/settings
Authorization: Bearer <api-key>
Content-Type: application/json

{{"settings": [{{"key": "auth_google_enabled", "value": "true"}}]}}
```

## System Admin

### List Users

```
GET {base}/admin/users?page=1&limit=20
Authorization: Bearer <api-key>
```

### List SSO Providers

```
GET {base}/admin/sso-providers
Authorization: Bearer <api-key>
```

## Audit Logs

### Query Audit Events

```
GET {base}/admin/audit?eventType=login&limit=100
Authorization: Bearer <api-key>
```

## Error Codes

| Code | Description |
|------|-------------|
| FORBIDDEN | Requires admin role |
| CANNOT_DEMOTE_OWNER | Cannot change owner's role |
| LAST_OWNER | Cannot remove last owner |
"#,
        version = config.version,
        base = base
    )
}
