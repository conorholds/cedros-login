pub fn cedros_login_ai_surface() -> serde_json::Value {
    serde_json::json!({
        "packageRef": "server",
        "skills": [
            {
                "id": "cedros-login:auth-and-onboarding",
                "name": "Authentication And Onboarding",
                "description": "Discover Cedros Login authentication, account creation, verification, and password reset flows.",
                "category": "identity",
                "tags": ["auth", "onboarding", "verification"],
                "visibility": "public",
                "docs": {
                    "markdown": "# Cedros Login: Authentication And Onboarding\n\nUse Cedros Login for account creation, authentication, email verification, password reset, and federated login.\n\nKey endpoints:\n- POST {{API_BASE}}/register\n- POST {{API_BASE}}/login\n- POST {{API_BASE}}/google\n- POST {{API_BASE}}/apple\n- POST {{API_BASE}}/solana\n- POST {{API_BASE}}/forgot-password\n- POST {{API_BASE}}/reset-password\n- POST {{API_BASE}}/send-verification\n- POST {{API_BASE}}/verify-email\n"
                }
            },
            {
                "id": "cedros-login:account-security",
                "name": "Account Security",
                "description": "Manage sessions, MFA, passwords, and authenticated user security posture.",
                "category": "security",
                "tags": ["security", "sessions", "mfa"],
                "visibility": "authenticated",
                "docs": {
                    "markdown": "# Cedros Login: Account Security\n\nAuthenticated users can manage security settings, change passwords, and revoke sessions.\n\nKey endpoints:\n- POST {{API_BASE}}/logout-all\n- POST {{API_BASE}}/change-password\n- POST {{API_BASE}}/mfa/setup\n- POST {{API_BASE}}/mfa/enable\n- POST {{API_BASE}}/mfa/disable\n- GET {{API_BASE}}/mfa/status\n"
                }
            },
            {
                "id": "cedros-login:identity-admin",
                "name": "Identity Admin Operations",
                "description": "Operate user, invite, org, and admin identity workflows.",
                "category": "identity",
                "tags": ["admin", "users", "orgs"],
                "visibility": "admin",
                "docs": {
                    "markdown": "# Cedros Login: Identity Admin Operations\n\nAdmin operators can inspect users, orgs, and operational identity settings.\n\nKey endpoints:\n- GET {{API_BASE}}/admin/users\n- GET {{API_BASE}}/admin/settings\n- GET {{API_BASE}}/admin/audit\n- POST {{API_BASE}}/v1/session/introspect\n- GET {{API_BASE}}/v1/users/{userId}\n"
                }
            }
        ],
        "capabilities": [
            {
                "id": "cedros-login:data-membership-relationship",
                "name": "Data Membership Service Relationship",
                "description": "Read or idempotently provision Data's fixed membership reauthorization relationship. Generates credentials server-side and returns only readiness and a safe membership-route probe.",
                "kind": "action",
                "tags": ["identity", "capacity", "setup"],
                "visibility": "admin",
                "endpoint": { "method": "POST", "path": "/extensions/cedros-login/admin/relying-parties/data-membership" },
                "auth": { "schemes": ["bearer-token"] },
                "inputSchema": {
                    "type": "object",
                    "properties": { "action": { "type": "string", "enum": ["read", "ensure"] } },
                    "required": ["action"],
                    "additionalProperties": false
                },
                "outputSchema": {
                    "type": "object",
                    "properties": { "relationship": { "type": "object" }, "membershipProbe": { "type": "object" } },
                    "required": ["relationship"],
                    "additionalProperties": false
                }
            },
            {
                "id": "cedros-login:send-verification-email",
                "name": "Send Verification Email",
                "description": "Request a verification email for an account email address.",
                "kind": "action",
                "tags": ["auth", "verification"],
                "visibility": "public",
                "endpoint": { "method": "POST", "path": "/extensions/cedros-login/send-verification" },
                "inputSchema": {
                    "type": "object",
                    "properties": { "email": { "type": "string" } },
                    "required": ["email"],
                    "additionalProperties": false
                },
                "outputSchema": {
                    "type": "object",
                    "properties": { "message": { "type": "string" } },
                    "required": ["message"],
                    "additionalProperties": false
                }
            },
            {
                "id": "cedros-login:verify-email-token",
                "name": "Verify Email Token",
                "description": "Verify an email token. Initial account verification also returns an authenticated session; additional-address and email-change verification return a message only.",
                "kind": "action",
                "tags": ["auth", "verification"],
                "visibility": "public",
                "endpoint": { "method": "POST", "path": "/extensions/cedros-login/verify-email" },
                "inputSchema": {
                    "type": "object",
                    "properties": { "token": { "type": "string" } },
                    "required": ["token"],
                    "additionalProperties": false
                },
                "outputSchema": {
                    "type": "object",
                    "properties": {
                        "message": { "type": "string" },
                        "user": { "type": "object" },
                        "tokens": { "type": "object" },
                        "isNewUser": { "type": "boolean" },
                        "method": { "type": "string" },
                        "postLogin": { "type": "object" }
                    },
                    "additionalProperties": false
                }
            },
            {
                "id": "cedros-login:logout-all-sessions",
                "name": "Logout All Sessions",
                "description": "Revoke all active sessions for the authenticated user.",
                "kind": "action",
                "tags": ["security", "sessions"],
                "visibility": "authenticated",
                "endpoint": { "method": "POST", "path": "/extensions/cedros-login/logout-all" },
                "auth": { "schemes": ["bearer-token"] },
                "inputSchema": { "type": "object", "additionalProperties": false },
                "outputSchema": {
                    "type": "object",
                    "properties": { "message": { "type": "string" } },
                    "required": ["message"],
                    "additionalProperties": false
                }
            },
            {
                "id": "cedros-login:disable-mfa",
                "name": "Disable MFA",
                "description": "Disable MFA for the authenticated user after proving possession of a currently enrolled factor with a TOTP code or unused recovery code.",
                "kind": "action",
                "tags": ["security", "mfa"],
                "visibility": "authenticated",
                "endpoint": { "method": "POST", "path": "/extensions/cedros-login/mfa/disable" },
                "auth": { "schemes": ["bearer-token"] },
                "inputSchema": {
                    "type": "object",
                    "description": "Provide exactly one of code or recoveryCode.",
                    "properties": {
                        "code": {
                            "type": "string",
                            "minLength": 1,
                            "description": "Current authenticator app code."
                        },
                        "recoveryCode": {
                            "type": "string",
                            "minLength": 1,
                            "description": "Unused MFA recovery code."
                        }
                    },
                    "minProperties": 1,
                    "maxProperties": 1,
                    "additionalProperties": false
                },
                "outputSchema": {
                    "type": "object",
                    "properties": { "message": { "type": "string" } },
                    "required": ["message"],
                    "additionalProperties": false
                }
            }
        ]
    })
}
