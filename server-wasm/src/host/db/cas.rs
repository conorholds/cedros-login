//! Published schema-v1 optimistic transactions for extension-owned JSONB rows.
use super::*;

#[derive(Clone)]
pub struct Condition {
    collection: Collection,
    key: String,
    version: Option<String>,
}
impl Condition {
    pub fn absent(collection: Collection, key: &str) -> Self {
        Self {
            collection,
            key: key.into(),
            version: None,
        }
    }
    pub fn version(collection: Collection, key: &str, version: &str) -> Result<Self> {
        if version.is_empty() {
            return Err(SeamError::Db("missing opaque row version".into()));
        }
        Ok(Self {
            collection,
            key: key.into(),
            version: Some(version.into()),
        })
    }
    /// Use a declared composite grant for a transaction spanning primary grants.
    /// The host still verifies every model against that manifest-owned grant.
    pub fn in_access(mut self, access: &'static str) -> Self {
        self.collection.access = access;
        self
    }
    /// Opaque revision for binding delegated authority to the observed row.
    pub fn observed_version(&self) -> Option<&str> {
        self.version.as_deref()
    }
    fn json(&self) -> Value {
        let mut value = serde_json::json!({"contentModelId": self.collection.model, "entryKey": self.key,
            "predicate": if self.version.is_some() { "version" } else { "absent" }});
        if let Some(version) = &self.version {
            value["expectedVersion"] = Value::String(version.clone());
        }
        value
    }
}

pub struct Versioned<T> {
    pub value: T,
    pub condition: Condition,
}
pub fn read_versioned<T: DeserializeOwned>(
    collection: Collection,
    key: &str,
) -> Result<Option<Versioned<T>>> {
    let Some(entry) = read_entries(collection, &Query::key(key))?
        .into_iter()
        .next()
    else {
        return Ok(None);
    };
    if entry.entry_key != key {
        return Err(SeamError::Db("row key mismatch".into()));
    }
    let condition = Condition::version(collection, key, entry.version.as_deref().unwrap_or(""))?;
    let value =
        serde_json::from_value(entry.payload).map_err(|e| SeamError::Encoding(e.to_string()))?;
    Ok(Some(Versioned { value, condition }))
}

pub fn compare_and_set(conditions: &[Condition], ops: &[BatchOp]) -> Result<()> {
    let first = conditions
        .first()
        .ok_or_else(|| SeamError::Db("CAS requires conditions".into()))?;
    if ops.is_empty()
        || conditions
            .iter()
            .any(|c| c.collection.access != first.collection.access)
        || ops.iter().any(|op| op.access() != first.collection.access)
    {
        return Err(SeamError::Db("invalid CAS access or operations".into()));
    }
    let body = serde_json::json!({"schemaVersion":1, "conditions":conditions.iter().map(Condition::json).collect::<Vec<_>>(), "ops":ops});
    #[cfg(test)]
    if let Some(result) = test_support::invoke(
        "compare-and-set",
        first.collection,
        &Query {
            filters: vec![eq("request", body.clone())],
            ..Default::default()
        },
    ) {
        return validate_applied(&result?.to_string(), ops.len());
    }
    let outcome = database::compare_and_set(first.collection.access, &body.to_string())
        .map_err(|error| SeamError::Db(format!("{}:{}", error.category, error.code)))?;
    match outcome {
        database::CasOutcome::Conflict(_) => Err(SeamError::DbConflict {
            category: DbConflictCategory::Precondition,
            operation: "compare-and-set".into(),
        }),
        database::CasOutcome::Applied(raw) => validate_applied(&raw, ops.len()),
    }
}
fn validate_applied(raw: &str, count: usize) -> Result<()> {
    let value: Value = from_json(raw)?;
    if value["outcome"] != "applied"
        || value["applied"].as_u64() != Some(count as u64)
        || value["replayed"] != false
        || !value["entries"].is_array()
        || !value["results"].is_array()
    {
        return Err(SeamError::Db("invalid CAS response".into()));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn composite_access_preserves_the_exact_model_key_and_revision() {
        let condition = Condition::version(MEMBERSHIPS, "membership-1", "opaque-version").unwrap();
        let composite = condition.clone().in_access(OAUTH_CONSENT_DB);
        assert_eq!(composite.json(), condition.json());
        assert_eq!(composite.collection.access, OAUTH_CONSENT_DB);
    }

    #[test]
    fn cas_rejects_missing_versions_cross_access_and_malformed_acknowledgements() {
        assert!(Condition::version(TOTP, "user", "").is_err());
        let condition = Condition::absent(TOTP, "user");
        assert!(compare_and_set(&[condition], &[BatchOp::delete(ORGS, "org")]).is_err());
        let good = serde_json::json!({"outcome":"applied","applied":1,"entries":[],"results":[],"replayed":false});
        assert!(validate_applied(&good.to_string(), 1).is_ok());
        for (field, value) in [
            ("outcome", serde_json::json!("conflict")),
            ("applied", serde_json::json!(0)),
            ("replayed", serde_json::json!(true)),
            ("entries", serde_json::json!(null)),
        ] {
            let mut bad = good.clone();
            bad[field] = value;
            assert!(validate_applied(&bad.to_string(), 1).is_err());
        }
    }
}
