//! Opt-in native CPU kernels. Run with --release; never contacts external services.
use cedros_login::{
    config::JwtConfig,
    domain::{hash_recovery_code, verify_recovery_code},
    services::{JwtService, PasswordService, TotpService},
};
use rsa::pkcs1::{EncodeRsaPrivateKey, LineEnding};
use std::{future::Future, time::Instant};

async fn measure<F: Future<Output = ()>>(
    name: &str,
    samples: usize,
    mut work: impl FnMut() -> F,
) -> serde_json::Value {
    let mut times = Vec::with_capacity(samples);
    for _ in 0..samples {
        let start = Instant::now();
        work().await;
        times.push(start.elapsed().as_secs_f64() * 1000.0);
    }
    serde_json::json!({"name":name, "samples_ms":times})
}

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    if cfg!(debug_assertions) {
        return Err("Run this benchmark with --release".into());
    }
    let samples: usize = std::env::var("PERF_KERNEL_SAMPLES")
        .unwrap_or_else(|_| "10".into())
        .parse()?;
    if !(1..=1000).contains(&samples) {
        return Err("PERF_KERNEL_SAMPLES must be 1..1000".into());
    }
    let passwords = PasswordService::default();
    let hash = passwords.hash("Fixture!Password123".into()).await?;
    let key = rsa::RsaPrivateKey::new(&mut rand::rngs::OsRng, 2048)?;
    let config = JwtConfig {
        secret: "public-fixture-secret-not-for-production".into(),
        rsa_private_key_pem: Some(key.to_pkcs1_pem(LineEnding::LF)?.to_string()),
        issuer: "fixture".into(),
        audience: "fixture".into(),
        access_token_expiry: 900,
        refresh_token_expiry: 3600,
    };
    let image = image::RgbImage::from_fn(1024, 1024, |x, y| {
        image::Rgb([(x % 255) as u8, (y % 255) as u8, ((x + y) % 255) as u8])
    });
    let mut png = std::io::Cursor::new(Vec::new());
    image.write_to(&mut png, image::ImageFormat::Png)?;
    let mut results = vec![
        measure("password_hash", samples, || async {
            std::hint::black_box(passwords.hash("Fixture!Password123".into()).await.unwrap());
        })
        .await,
        measure("password_verify", samples, || async {
            assert!(passwords
                .verify("Fixture!Password123".into(), hash.clone())
                .await
                .unwrap());
        })
        .await,
        measure("unknown_account_verify", samples, || async {
            passwords
                .verify_dummy("Unknown!Password123".into())
                .await
                .unwrap();
        })
        .await,
        measure("jwt_from_pem", samples, || async {
            std::hint::black_box(JwtService::try_new(&config).unwrap());
        })
        .await,
        measure("avatar_1024_png", samples, || async {
            std::hint::black_box(cedros_login::utils::process_avatar(png.get_ref()).unwrap());
        })
        .await,
    ];
    for count in [1, 5, 10] {
        let codes: Vec<String> = (0..count).map(|i| format!("FIXTURE-{i}")).collect();
        let hashes: Vec<String> = codes
            .iter()
            .map(|code| hash_recovery_code(code).unwrap())
            .collect();
        let target = codes.last().unwrap();
        results.push(
            measure(&format!("recovery_hash_{count}"), samples, || async {
                std::hint::black_box(
                    TotpService::hash_recovery_codes(codes.clone())
                        .await
                        .unwrap(),
                );
            })
            .await,
        );
        results.push(
            measure(&format!("recovery_verify_{count}"), samples, || async {
                let matched = hashes.iter().fold(false, |matched, hash| {
                    verify_recovery_code(target, hash) | matched
                });
                assert!(matched);
            })
            .await,
        );
    }
    println!(
        "{}",
        serde_json::json!({"kind":"native-cpu-kernels", "profile":"release", "samples":samples, "results":results})
    );
    Ok(())
}
