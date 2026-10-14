#[cfg(test)]
use tokio::sync::{Mutex, MutexGuard};

#[cfg(test)]
pub(crate) struct EnvGuard {
    key: &'static str,
    previous: Option<String>,
}

#[cfg(test)]
impl Drop for EnvGuard {
    fn drop(&mut self) {
        match self.previous.as_deref() {
            Some(value) => std::env::set_var(self.key, value),
            None => std::env::remove_var(self.key),
        }
    }
}

#[cfg(test)]
static ENV_LOCK: Mutex<()> = Mutex::const_new(());

#[cfg(test)]
pub(crate) fn lock_env() -> MutexGuard<'static, ()> {
    ENV_LOCK.blocking_lock()
}

#[cfg(test)]
pub(crate) async fn lock_env_async() -> MutexGuard<'static, ()> {
    ENV_LOCK.lock().await
}

#[cfg(test)]
pub(crate) fn set_env(key: &'static str, value: Option<&str>) -> EnvGuard {
    let previous = std::env::var(key).ok();
    match value {
        Some(value) => std::env::set_var(key, value),
        None => std::env::remove_var(key),
    }

    EnvGuard { key, previous }
}

#[cfg(test)]
pub(crate) fn clear_env(key: &'static str) -> EnvGuard {
    set_env(key, None)
}
