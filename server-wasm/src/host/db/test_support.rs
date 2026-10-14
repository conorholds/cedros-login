//! Thread-local host seam for deterministic query/call-count regression tests.
use super::{Collection, Query, Result};
use serde_json::Value;
use std::cell::RefCell;

type Mock = Box<dyn FnMut(&str, Collection, &Query) -> Result<Value>>;
thread_local! { static MOCK: RefCell<Option<Mock>> = RefCell::new(None); }

pub(crate) fn invoke(op: &str, collection: Collection, query: &Query) -> Option<Result<Value>> {
    MOCK.with_borrow_mut(|mock| mock.as_mut().map(|call| call(op, collection, query)))
}

pub(crate) fn with_db<T>(
    mock: impl FnMut(&str, Collection, &Query) -> Result<Value> + 'static,
    run: impl FnOnce() -> T,
) -> T {
    struct Reset;
    impl Drop for Reset {
        fn drop(&mut self) {
            MOCK.with_borrow_mut(|mock| *mock = None);
        }
    }
    MOCK.with_borrow_mut(|slot| {
        assert!(slot.is_none(), "nested DB fixture");
        *slot = Some(Box::new(mock));
    });
    let _reset = Reset;
    run()
}
