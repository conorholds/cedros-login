fn main() {
    let manifest = cedros_login::register_extension_family();
    let json = serde_json::to_string_pretty(&manifest)
        .expect("cedros-login extension manifest should serialize");

    println!("{json}");
}
