//! Request-scoped settings/secret fixtures for native route contract tests.
use super::Result;
use std::cell::RefCell;

type Mock = Box<dyn FnMut(&str, &str) -> Result<Option<String>>>;
thread_local! { static MOCK: RefCell<Option<Mock>> = RefCell::new(None); }

pub(crate) fn get(seam: &str, key: &str) -> Option<Result<Option<String>>> {
    MOCK.with_borrow_mut(|mock| mock.as_mut().map(|call| call(seam, key)))
}

pub(crate) fn with_values<T>(
    mock: impl FnMut(&str, &str) -> Result<Option<String>> + 'static,
    run: impl FnOnce() -> T,
) -> T {
    struct Reset;
    impl Drop for Reset {
        fn drop(&mut self) {
            MOCK.with_borrow_mut(|mock| *mock = None);
        }
    }
    MOCK.with_borrow_mut(|slot| {
        assert!(slot.is_none(), "nested settings/secret fixture");
        *slot = Some(Box::new(mock));
    });
    let _reset = Reset;
    run()
}

type WriteMock = Box<dyn FnMut(&str, &str) -> Result<()>>;
thread_local! { static WRITE_MOCK: RefCell<Option<WriteMock>> = RefCell::new(None); }
pub(crate) fn set(key: &str, value: &str) -> Option<Result<()>> {
    WRITE_MOCK.with_borrow_mut(|mock| mock.as_mut().map(|call| call(key, value)))
}
pub(crate) fn with_writes<T>(
    mock: impl FnMut(&str, &str) -> Result<()> + 'static,
    run: impl FnOnce() -> T,
) -> T {
    struct Reset;
    impl Drop for Reset {
        fn drop(&mut self) {
            WRITE_MOCK.with_borrow_mut(|slot| *slot = None);
        }
    }
    WRITE_MOCK.with_borrow_mut(|slot| {
        assert!(slot.is_none());
        *slot = Some(Box::new(mock));
    });
    let _reset = Reset;
    run()
}
