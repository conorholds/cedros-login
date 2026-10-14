export function buildArchiveBootstrap(manifest, visualBuilder) {
  if (
    visualBuilder.extensionId !== manifest.extensionId ||
    visualBuilder.version !== manifest.version
  ) {
    throw new Error('visual builder contract must match the extension manifest identity');
  }

  const declarations = new Map(
    (manifest.contentTemplates ?? []).map((template) => [template.id, template])
  );
  const seeds = new Map(
    (manifest.pageSeeds ?? []).map((seed) => [seed.templateId, seed.id])
  );
  const zones = visualBuilder.runtimeTemplateContract?.zones;
  if (!Array.isArray(zones) || zones.length === 0) {
    throw new Error('visual builder runtime template contract must declare zones');
  }

  const contentTemplates = (visualBuilder.templates ?? []).map((template) => {
    const declaration = declarations.get(template.id);
    if (!declaration) {
      throw new Error(`visual builder template ${template.id} is not declared by the manifest`);
    }
    if (
      template.displayName !== declaration.displayName ||
      JSON.stringify(template.contentTypes) !== JSON.stringify(declaration.contentTypes)
    ) {
      throw new Error(`visual builder template ${template.id} metadata differs from the manifest`);
    }
    if (seeds.get(template.id) !== template.pageSeedId) {
      throw new Error(`visual builder template ${template.id} is not bound to its page seed`);
    }
    if (!Array.isArray(template.blocks) || template.blocks.length === 0) {
      throw new Error(`visual builder template ${template.id} must declare starter blocks`);
    }
    return {
      ...declaration,
      label: declaration.displayName,
      zones: structuredClone(zones),
      blocks: structuredClone(template.blocks),
    };
  });

  if (
    contentTemplates.length !== declarations.size ||
    contentTemplates.some((template) => !seeds.has(template.id))
  ) {
    throw new Error('every declared page template must have one archive layout and page seed');
  }

  return { manifest, contentTemplates };
}
