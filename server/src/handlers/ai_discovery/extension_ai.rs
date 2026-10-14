use serde::Deserialize;

use super::content::ContentConfig;
use super::types::SkillReference;

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ManifestAiSkill {
    id: String,
    name: String,
    description: String,
    visibility: String,
    docs: ManifestAiDocs,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ManifestAiDocs {
    markdown: String,
}

fn all_extension_skill_defs() -> Vec<ManifestAiSkill> {
    Vec::new()
}

pub fn get_extension_skill_references(config: &ContentConfig) -> Vec<SkillReference> {
    all_extension_skill_defs()
        .into_iter()
        .map(|skill| SkillReference {
            id: skill.id.clone(),
            name: skill.name,
            path: config.path(&format!("/skills/{}.md", skill.id)),
            description: skill.description,
            requires_auth: Some(skill.visibility != "public"),
            requires_admin: Some(skill.visibility == "admin"),
        })
        .collect()
}

pub fn get_extension_skill_markdown(config: &ContentConfig, skill_id: &str) -> Option<String> {
    let base = if config.base_path.is_empty() {
        String::new()
    } else {
        config.base_path.clone()
    };

    all_extension_skill_defs()
        .into_iter()
        .find(|skill| skill.id == skill_id)
        .map(|skill| skill.docs.markdown.replace("{{API_BASE}}", &base))
}

pub fn extension_bundle_skills(config: &ContentConfig) -> Vec<(String, String)> {
    let base = if config.base_path.is_empty() {
        String::new()
    } else {
        config.base_path.clone()
    };

    all_extension_skill_defs()
        .into_iter()
        .map(|skill| {
            (
                skill.id.clone(),
                skill.docs.markdown.replace("{{API_BASE}}", &base),
            )
        })
        .collect()
}
