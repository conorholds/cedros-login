#!/usr/bin/env node
import {
  assertDeepEqual,
  assertEqual,
  assertNamespaced,
  assertSetEqual,
  readJson,
} from './cedros-validation-helpers.mjs';
import { buildArchiveBootstrap } from './cedros-archive-bootstrap.mjs';

const manifest = readJson('cedros-extension.manifest.json');
const bootstrap = readJson('cedros-extension.bootstrap.json');
const visualBuilder = readJson('docs/cedros-visual-builder-map.json');

assertDeepEqual(manifest, bootstrap.manifest, 'bootstrap manifest');
assertEqual(visualBuilder.extensionId, manifest.extensionId, 'visual builder extensionId');
assertEqual(visualBuilder.version, manifest.version, 'visual builder version');
assertDeepEqual(
  bootstrap,
  buildArchiveBootstrap(manifest, visualBuilder),
  'archive bootstrap template layouts'
);

const blocks = manifest.contentBlocks ?? [];
const templates = manifest.contentTemplates ?? [];
if (!blocks.length) throw new Error('manifest must declare contentBlocks per 14-blocks-templates-and-styling.md');
if (!templates.length) throw new Error('manifest must declare contentTemplates per 14-blocks-templates-and-styling.md');

const blockTypes = new Set();
for (const block of blocks) {
  assertNamespaced(block.type, manifest.extensionId, 'content block type');
  if (!block.displayName || !block.category) throw new Error(`${block.type} missing label/category`);
  if (!Number.isInteger(block.order)) throw new Error(`${block.type} missing integer order`);
  if (blockTypes.has(block.type)) throw new Error(`duplicate content block type ${block.type}`);
  blockTypes.add(block.type);
}

const templateIds = new Set();
for (const template of templates) {
  assertNamespaced(template.id, manifest.extensionId, 'content template id');
  if (!template.displayName) throw new Error(`${template.id} missing displayName`);
  if (!Number.isInteger(template.order)) throw new Error(`${template.id} missing integer order`);
  if (!template.contentTypes?.includes('page')) throw new Error(`${template.id} must support page`);
  if (templateIds.has(template.id)) throw new Error(`duplicate content template id ${template.id}`);
  templateIds.add(template.id);
}

assertSetEqual(new Set(manifest.surfaces.web.blockTypes ?? []), blockTypes, 'web blockTypes');
assertSetEqual(new Set(manifest.surfaces.web.templateIds ?? []), templateIds, 'web templateIds');

for (const seed of manifest.pageSeeds ?? []) {
  if (!seed.templateId) throw new Error(`${seed.id} must resolve to an extension template`);
  if (!templateIds.has(seed.templateId)) throw new Error(`${seed.id} uses missing template ${seed.templateId}`);
}

for (const template of visualBuilder.templates ?? []) {
  if (!templateIds.has(template.id)) throw new Error(`docs map has unknown template ${template.id}`);
  for (const authoredBlock of template.blocks ?? []) {
    if (!blockTypes.has(authoredBlock.type)) {
      throw new Error(`${template.id} references unknown block ${authoredBlock.type}`);
    }
    assertPortableProps(authoredBlock.props, `${template.id}.${authoredBlock.type}`);
  }
}

console.log('cedros visual builder validation passed');

function assertPortableProps(value, label) {
  const json = JSON.stringify(value);
  if (/(<script|<style|function|=>|component|private[_-]?key|secret|token)/i.test(json)) {
    throw new Error(`${label} contains non-portable or sensitive authored props`);
  }
}
