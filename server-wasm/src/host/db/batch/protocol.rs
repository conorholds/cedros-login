use super::super::Collection;
use super::operation::ConditionalOperation;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchOp {
    #[serde(skip)]
    access: &'static str,
    pub op: String,
    pub content_model_id: String,
    pub entry_key: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<Value>,
}

impl BatchOp {
    pub fn write(collection: Collection, key: &str, data: Value) -> Self {
        Self {
            access: collection.access,
            op: "write".into(),
            content_model_id: collection.model.into(),
            entry_key: key.into(),
            data: Some(data),
        }
    }

    pub fn delete(collection: Collection, key: &str) -> Self {
        Self {
            access: collection.access,
            op: "delete".into(),
            content_model_id: collection.model.into(),
            entry_key: key.into(),
            data: None,
        }
    }

    pub(crate) const fn access(&self) -> &'static str {
        self.access
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConditionalBatchOp {
    #[serde(skip)]
    access: &'static str,
    #[serde(skip)]
    operation: ConditionalOperation,
    op: &'static str,
    // Cedros Core's shared batch decoder still deserializes every operation
    // through the ordinary data-op shape before dispatching conditional ops.
    // Conditional operations declare their affected models in the host-owned
    // operation registry, so there is no single model to name; send the
    // decoder-compatible empty value and let the registry remain authoritative.
    content_model_id: &'static str,
    operation_id: &'static str,
    params: Value,
}

impl ConditionalBatchOp {
    pub fn new(operation: ConditionalOperation, params: Value) -> Self {
        Self {
            access: operation.access(),
            operation,
            op: "conditional",
            content_model_id: "",
            operation_id: operation.id(),
            params,
        }
    }
}

#[derive(Serialize)]
#[serde(untagged)]
pub enum AtomicBatchOp {
    Data(BatchOp),
    Conditional(ConditionalBatchOp),
}

impl AtomicBatchOp {
    pub(crate) const fn access(&self) -> &'static str {
        match self {
            Self::Data(op) => op.access,
            Self::Conditional(op) => op.access,
        }
    }

    pub(super) const fn conditional_operation(&self) -> Option<ConditionalOperation> {
        match self {
            Self::Data(_) => None,
            Self::Conditional(op) => Some(op.operation),
        }
    }
}

impl From<BatchOp> for AtomicBatchOp {
    fn from(value: BatchOp) -> Self {
        Self::Data(value)
    }
}

impl From<ConditionalBatchOp> for AtomicBatchOp {
    fn from(value: ConditionalBatchOp) -> Self {
        Self::Conditional(value)
    }
}

#[derive(Debug, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ConditionalBatchResult {
    pub operation_id: String,
    #[serde(default)]
    pub output: Value,
}

#[derive(Debug, Deserialize, PartialEq)]
pub struct AtomicBatchResult {
    pub applied: u64,
    #[serde(default)]
    pub results: Vec<ConditionalBatchResult>,
}

impl AtomicBatchResult {
    pub(super) fn empty() -> Self {
        Self {
            applied: 0,
            results: Vec::new(),
        }
    }
}
