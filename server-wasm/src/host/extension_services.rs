//! Capability-gated calls to another active extension's declared route.

#[cfg(not(test))]
use super::Result;
use super::SeamError;
use crate::cedros::extension::extension_services;
#[cfg(not(test))]
use crate::cedros::extension::extension_services::{ServiceRequest, ServiceResponse};

fn map_err(error: extension_services::HostError) -> SeamError {
    SeamError::ExtensionService(format!(
        "{}:{}: {}",
        error.category, error.code, error.message
    ))
}

#[cfg(not(test))]
pub fn invoke(request: &ServiceRequest) -> Result<ServiceResponse> {
    extension_services::invoke(request).map_err(map_err)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn host_error_keeps_stable_context() {
        let error = map_err(extension_services::HostError {
            code: "cedros.extension.service_failed".into(),
            category: "host_runtime_failed".into(),
            message: "service unavailable".into(),
        });
        assert_eq!(error.code(), "extension_service_error");
        assert!(error.to_string().contains("host_runtime_failed"));
        assert!(error
            .to_string()
            .contains("cedros.extension.service_failed"));
    }
}
