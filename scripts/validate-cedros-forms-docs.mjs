#!/usr/bin/env node
import {
  assertDeepEqual,
  assertEqual,
  assertNamespaced,
  assertSetEqual,
  readJson,
} from './cedros-validation-helpers.mjs';

const manifest = readJson('cedros-extension.manifest.json');
const bootstrap = readJson('cedros-extension.bootstrap.json');
const starters = readJson('docs/cedros-forms-docs-starters-map.json');

assertDeepEqual(manifest, bootstrap.manifest, 'bootstrap manifest');
assertEqual(starters.extensionId, manifest.extensionId, 'starters extensionId');
assertEqual(starters.version, manifest.version, 'starters version');
if (!/Start Draft/i.test(starters.runtimeBehavior?.startDraft ?? '')) {
  throw new Error('docs article starters must remain starter cards until owner Start Draft');
}

const supportedFieldTypes = new Set(['text', 'email', 'textarea', 'tel', 'select', 'checkbox']);
const formIds = new Set();
for (const form of manifest.formTemplates ?? []) {
  assertNamespaced(form.id, manifest.extensionId, 'form template id');
  if (formIds.has(form.id)) throw new Error(`duplicate form template id ${form.id}`);
  formIds.add(form.id);
  if (!form.displayName || !form.title) throw new Error(`${form.id} missing displayName/title`);
  if (!form.fields?.length) throw new Error(`${form.id} must declare at least one field`);
  const fieldKeys = new Set();
  for (const field of form.fields) {
    if (!/^[a-z][a-z0-9_]*$/.test(field.key)) throw new Error(`${form.id} invalid field key ${field.key}`);
    if (fieldKeys.has(field.key)) throw new Error(`${form.id} duplicate field key ${field.key}`);
    fieldKeys.add(field.key);
    if (!field.label || !supportedFieldTypes.has(field.type)) throw new Error(`${form.id}.${field.key} invalid field`);
    if (field.type === 'select' && !field.options?.length) throw new Error(`${form.id}.${field.key} select needs options`);
    for (const option of field.options ?? []) {
      if (!option.label || !option.value) throw new Error(`${form.id}.${field.key} has invalid option`);
    }
    if (field.type === 'checkbox' && field.required && (!field.label || !field.helpText)) {
      throw new Error(`${form.id}.${field.key} consent checkbox needs label/helpText`);
    }
  }
}

const docsIds = new Set();
for (const article of manifest.docsArticles ?? []) {
  assertNamespaced(article.id, manifest.extensionId, 'docs article id');
  if (docsIds.has(article.id)) throw new Error(`duplicate docs article id ${article.id}`);
  docsIds.add(article.id);
  if (!article.displayName || !article.title || !article.slug) throw new Error(`${article.id} missing required metadata`);
  if (!article.bodyMarkdown?.trim()) throw new Error(`${article.id} missing bodyMarkdown`);
  assertSafeMarkdown(article.bodyMarkdown, article.id);
}

assertSetEqual(new Set(starters.forms.map((form) => form.id)), formIds, 'docs map forms');
assertSetEqual(new Set(starters.docsArticles.map((article) => article.id)), docsIds, 'docs map docsArticles');

console.log('cedros forms/docs starters validation passed');

function assertSafeMarkdown(markdown, label) {
  if (/<script|<style|<\/?[a-z][\s>/]|postgres:\/\/|-----BEGIN [A-Z ]*PRIVATE KEY-----|Bearer\s+[A-Za-z0-9._~+/-]+=*/i.test(markdown)) {
    throw new Error(`${label} contains unsafe starter markdown`);
  }
}
