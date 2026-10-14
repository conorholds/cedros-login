use super::*;

#[tokio::test]
async fn test_postgres_user_directory_order_index_is_valid() {
    let Some(storage) = create_test_storage().await else {
        return;
    };
    let valid: bool = query_scalar(
        "SELECT indisvalid FROM pg_index WHERE indexrelid = 'idx_users_created_at'::regclass",
    )
    .fetch_one(storage.pg_pool.as_ref().unwrap())
    .await
    .unwrap();
    assert!(valid);
}
