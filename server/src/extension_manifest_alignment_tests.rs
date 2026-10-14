use std::collections::BTreeSet;

use super::{
    register_extension_family, CEDROS_EXTENSION_WIT_CHECKSUM, CEDROS_LOGIN_EXTENSION_VERSION,
};

#[test]
fn canonical_manifest_pins_one_version_and_current_wit() {
    let manifest = register_extension_family();
    let versions = [
        manifest.package_family.server.version.as_str(),
        manifest.package_family.react.version.as_str(),
        manifest.package_family.react_native.version.as_str(),
    ];

    assert!(versions
        .iter()
        .all(|version| *version == CEDROS_LOGIN_EXTENSION_VERSION));
    assert_eq!(
        manifest.compatibility.wit_checksum.as_deref(),
        Some(CEDROS_EXTENSION_WIT_CHECKSUM)
    );
}

#[test]
fn server_events_match_the_analytics_contract_exactly() {
    let manifest = register_extension_family();
    let analytics_ids = manifest
        .analytics
        .expect("analytics manifest")
        .events
        .into_iter()
        .map(|event| event.id)
        .collect::<BTreeSet<_>>();
    let server_events = manifest
        .surfaces
        .server
        .events
        .into_iter()
        .collect::<BTreeSet<_>>();
    assert_eq!(server_events, analytics_ids);
}

#[test]
fn data_membership_setup_requires_write_delegation_and_forbids_policy_inputs() {
    let manifest = serde_json::to_value(register_extension_family()).unwrap();
    let capability = manifest["surfaces"]["ai"]["capabilities"]
        .as_array()
        .unwrap()
        .iter()
        .find(|capability| capability["id"] == "cedros-login:data-membership-relationship")
        .expect("published Data membership setup capability");
    // The host delegates actions only for settings writers; tool delegation
    // also admits settings readers and must never provision service secrets.
    assert_eq!(capability["kind"], "action");
    assert_eq!(
        capability["auth"]["schemes"],
        serde_json::json!(["bearer-token"])
    );
    assert_eq!(
        capability["endpoint"]["path"],
        "/extensions/cedros-login/admin/relying-parties/data-membership"
    );
    assert_eq!(capability["inputSchema"]["additionalProperties"], false);
    assert_eq!(
        capability["inputSchema"]["properties"]
            .as_object()
            .unwrap()
            .len(),
        1
    );
    assert_eq!(
        capability["inputSchema"]["properties"]["action"]["enum"],
        serde_json::json!(["read", "ensure"])
    );
    assert!(manifest["surfaces"]["server"]["routes"]
        .as_array()
        .unwrap()
        .iter()
        .any(|id| id == "cedros-login:admin-data-membership-relationship"));
}
