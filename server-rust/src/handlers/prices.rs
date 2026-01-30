//! Token price endpoints

use axum::{extract::Query, Json};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Duration;

use crate::errors::AppError;

const JUPITER_PRICE_API: &str = "https://price.jup.ag/v4/price";

#[derive(Debug, Deserialize)]
pub struct PriceQuery {
    pub mints: String,
}

#[derive(Debug, Deserialize)]
struct JupiterPriceResponse {
    data: HashMap<String, JupiterPriceData>,
}

#[derive(Debug, Deserialize)]
struct JupiterPriceData {
    price: f64,
}

#[derive(Debug, Serialize)]
pub struct PriceResponse {
    pub prices: HashMap<String, f64>,
}

/// GET /prices - Fetch USD prices for token mints via Jupiter
pub async fn token_prices(
    Query(query): Query<PriceQuery>,
) -> Result<Json<PriceResponse>, AppError> {
    let mints: Vec<String> = query
        .mints
        .split(',')
        .map(|mint| mint.trim())
        .filter(|mint| !mint.is_empty())
        .map(|mint| mint.to_string())
        .collect();

    if mints.is_empty() {
        return Err(AppError::Validation("No mints provided".into()));
    }

    let url = format!("{}?ids={}", JUPITER_PRICE_API, mints.join(","));
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to create HTTP client: {}", e)))?;

    let response =
        client.get(&url).send().await.map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Jupiter API request failed: {}", e))
        })?;

    if !response.status().is_success() {
        return Err(AppError::Internal(anyhow::anyhow!(
            "Jupiter API returned status {}",
            response.status()
        )));
    }

    let price_response: JupiterPriceResponse = response.json().await.map_err(|e| {
        AppError::Internal(anyhow::anyhow!("Failed to parse Jupiter response: {}", e))
    })?;

    let mut prices = HashMap::new();
    for (mint, data) in price_response.data {
        prices.insert(mint, data.price);
    }

    Ok(Json(PriceResponse { prices }))
}
