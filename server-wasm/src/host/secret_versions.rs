//! Immutable encrypted secrets selected by a site-scoped, atomic DB pointer.
//! Only the opaque reference is stored in JSONB; secret material stays in the
//! encrypted host seam. Failed contenders never replace the published value.
use super::{db, secrets, Result, SeamError};
use serde::{Deserialize, Serialize};

const REFERENCES: db::Collection = db::Collection {
    access: db::IDENTITY_DB,
    model: "cedros-login:identity-records",
};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SecretReference {
    secret_key: String,
}

pub struct VersionedSecret {
    pub value: String,
    pub condition: db::Condition,
}

fn read(key: &str) -> Result<Option<VersionedSecret>> {
    let Some(row) = db::read_versioned::<SecretReference>(REFERENCES, &format!("secret:{key}"))?
    else {
        return Ok(None);
    };
    if !row.value.secret_key.starts_with(&format!("{key}:version:")) {
        return Err(SeamError::Secrets("invalid secret reference".into()));
    }
    let value = secrets::get(&row.value.secret_key)?
        .ok_or_else(|| SeamError::Secrets("published secret is missing".into()))?;
    Ok(Some(VersionedSecret {
        value,
        condition: row.condition,
    }))
}

pub fn get_or_create(
    key: &str,
    generate: impl FnOnce() -> Result<String>,
) -> Result<VersionedSecret> {
    if let Some(current) = read(key)? {
        return Ok(current);
    }
    // Migrate existing installations without changing signing or HMAC material.
    let value = match secrets::get(key)? {
        Some(value) => value,
        None => generate()?,
    };
    let condition = db::Condition::absent(REFERENCES, &format!("secret:{key}"));
    match replace(key, condition, &value) {
        Ok(()) => {}
        Err(error) if error.is_db_conflict() => {}
        Err(error) => return Err(error),
    }
    read(key)?.ok_or_else(|| SeamError::Secrets("secret initialization did not commit".into()))
}

pub fn replace(key: &str, condition: db::Condition, value: &str) -> Result<()> {
    let secret_key = format!("{key}:version:{}", uuid::Uuid::new_v4());
    secrets::set(&secret_key, value)?;
    // Never reread an overwritten shared key: this reference is immutable.
    let data = serde_json::to_value(SecretReference { secret_key })
        .map_err(|e| SeamError::Encoding(e.to_string()))?;
    let op = db::BatchOp::write(REFERENCES, &format!("secret:{key}"), data);
    db::compare_and_set(&[condition], &[op])
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::host::{key_value_test_support, DbConflictCategory};
    use serde_json::{json, Value};
    use std::{cell::RefCell, collections::HashMap, rc::Rc};

    fn fixture(legacy: Option<&str>, run: impl FnOnce()) {
        let values = Rc::new(RefCell::new(HashMap::<String, String>::new()));
        if let Some(value) = legacy {
            values.borrow_mut().insert("test-key".into(), value.into());
        }
        let read_values = values.clone();
        let mut pointer: Option<Value> = None;
        let mut revision = 0;
        key_value_test_support::with_values(
            move |seam, key| {
                assert_eq!(seam, "secrets");
                Ok(read_values.borrow().get(key).cloned())
            },
            || {
                key_value_test_support::with_writes(
                    move |key, value| {
                        // Published encrypted values are immutable, including losing writes.
                        assert!(!values.borrow().contains_key(key));
                        values.borrow_mut().insert(key.into(), value.into());
                        Ok(())
                    },
                    || {
                        db::test_support::with_db(
                            move |op, collection, query| {
                                assert_eq!(collection.model, REFERENCES.model);
                                if op == "read" {
                                    return Ok(
                                        json!({"entries": pointer.as_ref().map(|payload| vec![json!({
                    "entry_key":"secret:test-key", "payload":payload, "updated_at":"now", "version":revision.to_string()
                })]).unwrap_or_default()}),
                                    );
                                }
                                assert_eq!(op, "compare-and-set");
                                let request = &query.filters[0].value;
                                let condition = &request["conditions"][0];
                                let expected_version = revision.to_string();
                                let matches = if pointer.is_none() {
                                    condition["predicate"] == "absent"
                                } else {
                                    condition["expectedVersion"].as_str()
                                        == Some(expected_version.as_str())
                                };
                                if !matches {
                                    return Err(SeamError::DbConflict {
                                        category: DbConflictCategory::Precondition,
                                        operation: "compare-and-set".into(),
                                    });
                                }
                                pointer = Some(request["ops"][0]["data"].clone());
                                // No key material may enter the ordinary site database.
                                assert_eq!(pointer.as_ref().unwrap().as_object().unwrap().len(), 1);
                                revision += 1;
                                Ok(
                                    json!({"outcome":"applied", "applied":1, "entries":[], "results":[], "replayed":false}),
                                )
                            },
                            run,
                        )
                    },
                )
            },
        );
    }

    #[test]
    fn initialization_survives_request_restart_and_migrates_legacy_material() {
        for legacy in [None, Some("legacy-hmac-material")] {
            fixture(legacy, || {
                let expected = legacy.unwrap_or("new-hmac-material");
                assert_eq!(
                    get_or_create("test-key", || Ok("new-hmac-material".into()))
                        .unwrap()
                        .value,
                    expected
                );
                assert_eq!(
                    get_or_create("test-key", || panic!("must not regenerate"))
                        .unwrap()
                        .value,
                    expected
                );
            });
        }
    }

    #[test]
    fn stale_initializer_and_concurrent_rotation_cannot_overwrite_winner() {
        fixture(None, || {
            let first = get_or_create("test-key", || Ok("initial".into())).unwrap();
            assert!(replace(
                "test-key",
                db::Condition::absent(REFERENCES, "secret:test-key"),
                "losing-initializer"
            )
            .unwrap_err()
            .is_db_conflict());
            let second = get_or_create("test-key", || panic!("already initialized")).unwrap();
            replace("test-key", first.condition, "rotation-winner").unwrap();
            assert!(replace("test-key", second.condition, "rotation-loser")
                .unwrap_err()
                .is_db_conflict());
            assert_eq!(
                get_or_create("test-key", || panic!("already initialized"))
                    .unwrap()
                    .value,
                "rotation-winner"
            );
        });
    }

    #[test]
    fn missing_published_secret_fails_closed_without_regeneration() {
        key_value_test_support::with_values(
            |_, _| Ok(None),
            || {
                db::test_support::with_db(
                    |_, _, _| {
                        Ok(json!({"entries":[{
                            "entry_key":"secret:test-key", "payload":{"secretKey":"test-key:version:missing"}, "updated_at":"now", "version":"1"
                        }]}))
                    },
                    || assert!(get_or_create("test-key", || panic!("must not regenerate")).is_err()),
                )
            },
        );
    }
}
