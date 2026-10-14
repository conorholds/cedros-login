//! Opt-in kernel timings. Native execution of guest code is NOT Wasmtime timing.
use crate::services::{jwt::JwtService, password::PasswordService};
use rsa::pkcs1::{EncodeRsaPrivateKey, LineEnding};
use std::time::Instant;

fn measure(name: &str, count: usize, mut work: impl FnMut()) -> serde_json::Value {
    let mut samples = Vec::with_capacity(count);
    for _ in 0..count {
        let start = Instant::now();
        work();
        samples.push(start.elapsed().as_secs_f64() * 1000.0);
    }
    serde_json::json!({"name": name, "samples_ms": samples})
}

#[test]
#[ignore = "opt-in release kernel benchmark; invoke with --ignored --nocapture"]
fn performance_kernels() {
    if cfg!(debug_assertions) {
        panic!("Use --release for comparable CPU measurements");
    }
    let samples: usize = std::env::var("PERF_KERNEL_SAMPLES")
        .unwrap_or_else(|_| "10".into())
        .parse()
        .expect("PERF_KERNEL_SAMPLES must be an integer");
    assert!((1..=1000).contains(&samples));
    let service = PasswordService::default();
    let hash = service.hash("Fixture!Password123").unwrap();
    let private = rsa::RsaPrivateKey::new(&mut rand::rngs::OsRng, 2048).unwrap();
    let pem = private.to_pkcs1_pem(LineEnding::LF).unwrap();
    let image = image::RgbImage::from_fn(1024, 1024, |x, y| {
        image::Rgb([(x % 255) as u8, (y % 255) as u8, ((x + y) % 255) as u8])
    });
    let mut png = std::io::Cursor::new(Vec::new());
    image.write_to(&mut png, image::ImageFormat::Png).unwrap();
    let results = vec![
        measure("password_hash", samples, || {
            std::hint::black_box(service.hash("Fixture!Password123").unwrap());
        }),
        measure("password_verify", samples, || {
            assert!(service.verify("Fixture!Password123", &hash))
        }),
        measure("unknown_account_verify", samples, || {
            service.verify_dummy("Unknown!Password123")
        }),
        measure("jwt_from_pem", samples, || {
            std::hint::black_box(
                JwtService::from_pem(&pem, "fixture".into(), "fixture".into(), 900).unwrap(),
            );
        }),
        measure("avatar_1024_png", samples, || {
            std::hint::black_box(
                crate::services::image_processing::process_avatar(png.get_ref()).unwrap(),
            );
        }),
    ];
    println!(
        "{}",
        serde_json::json!({"kind":"guest-cpu-kernels", "runtime":"native Rust test executable, not Wasm host", "profile":"release opt-level=z", "samples":samples, "results":results})
    );
}
