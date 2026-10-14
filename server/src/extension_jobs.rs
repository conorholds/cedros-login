//! Extension job-schedule seeds (`jobSchedules[]`).
//!
//! cedros-data PR #2092 added a content-seed provisioner that, on enable,
//! materializes each `jobSchedules[]` entry whose `autoCreateOnEnable` is true
//! into a Cedros automation job dispatching the named `surfaces.server.jobs[]`
//! id on its cron cadence. Without this, declaring a server job binds it for
//! dispatch but never schedules it — so the wasm `outbox-dispatch` (transactional
//! email delivery) and `cleanup-expired-auth-data` jobs would never run, unlike
//! the standalone server which runs them on internal timers.
use serde::{Deserialize, Serialize};

/// One declared automation schedule. Mirrors cedros-data
/// `CedrosExtensionJobScheduleManifest`.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionJobScheduleManifest {
    /// Stable namespaced seed id; the idempotency key for provisioning.
    pub id: String,
    /// The registered server job id to dispatch (`surfaces.server.jobs[]`).
    pub job_id: String,
    /// Human-readable label shown for the automation job.
    pub label: String,
    /// 5-field cron expression for the cadence.
    pub cron: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timezone: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timeout_seconds: Option<u32>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub max_retries: Option<u32>,
    /// Create the schedule on enable instead of leaving the job unscheduled.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub auto_create_on_enable: Option<bool>,
}

/// Schedules for the jobs the wasm component exports, including durable OAuth
/// backing-key cleanup independently of the daily auth-data expiry sweep.
pub fn cedros_login_job_schedules() -> Vec<CedrosExtensionJobScheduleManifest> {
    vec![
        CedrosExtensionJobScheduleManifest {
            id: "cedros-login:outbox-dispatch-schedule".to_string(),
            job_id: "cedros-login:outbox-dispatch".to_string(),
            label: "Cedros Login transactional email dispatch".to_string(),
            cron: "*/2 * * * *".to_string(),
            timezone: Some("UTC".to_string()),
            timeout_seconds: Some(60),
            max_retries: Some(0),
            auto_create_on_enable: Some(true),
        },
        CedrosExtensionJobScheduleManifest {
            id: "cedros-login:cleanup-expired-auth-data-schedule".to_string(),
            job_id: "cedros-login:cleanup-expired-auth-data".to_string(),
            label: "Cedros Login expired auth-data cleanup".to_string(),
            cron: "0 3 * * *".to_string(),
            timezone: Some("UTC".to_string()),
            timeout_seconds: Some(120),
            max_retries: Some(0),
            auto_create_on_enable: Some(true),
        },
        CedrosExtensionJobScheduleManifest {
            id: "cedros-login:oauth-connection-cleanup-schedule".to_string(),
            job_id: "cedros-login:oauth-connection-cleanup".to_string(),
            label: "Cedros Login OAuth authority and backing-key cleanup".to_string(),
            cron: "*/2 * * * *".to_string(),
            timezone: Some("UTC".to_string()),
            timeout_seconds: Some(60),
            max_retries: Some(0),
            auto_create_on_enable: Some(true),
        },
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn schedules_target_declared_job_ids_and_auto_create() {
        let schedules = cedros_login_job_schedules();
        assert_eq!(schedules.len(), 3);
        for schedule in &schedules {
            assert!(schedule.job_id.starts_with("cedros-login:"));
            assert_eq!(schedule.auto_create_on_enable, Some(true));
            assert_eq!(schedule.max_retries, Some(0));
            // 5-field cron.
            assert_eq!(schedule.cron.split_whitespace().count(), 5);
        }
    }

    #[test]
    fn serializes_camelcase() {
        let value = serde_json::to_value(&cedros_login_job_schedules()[0]).unwrap();
        assert_eq!(value["jobId"], "cedros-login:outbox-dispatch");
        assert_eq!(value["autoCreateOnEnable"], true);
        assert_eq!(value["timeoutSeconds"], 60);
    }
}
