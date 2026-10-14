import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import * as ts from 'typescript';
import { describe, expect, it } from 'vitest';

type ClassKind = 'class' | 'prefix';

type ClassReference = { kind: ClassKind; source: string };
type DynamicClassAllowlistEntry = { kind: ClassKind; value: string; rationale: string };

const sourceRoot = join(process.cwd(), 'src');
const cssSourceFiles = [
  'src/styles/login.css',
  'src/extension/auth-blocks.css',
  'src/admin/admin-workbench.css',
  'src/admin/admin-workbench-overlays.css',
  'src/admin/admin-workbench-reorder.css',
  'src/admin/admin-workbench-dashboard.css',
  'src/admin/admin-workbench-controls.css',
] as const;

const cedrosClassPattern = /\bcedros-[A-Za-z0-9_-]+\b/g;
const definedClassPattern = /\.((?:cedros-)[A-Za-z0-9_-]+)/g;
const classNameIdentifierPattern = /^(?:className|.*ClassName)$/;

// Reviewed static gaps are intentionally exact so new undefined classes still fail.
const DYNAMIC_CLASS_ALLOWLIST: DynamicClassAllowlistEntry[] = [
  ...allowClasses('Inline-styled sortable settings row; the class is a stable hook.', [
    'cedros-btn-order-item',
  ]),
];

function allowClasses(rationale: string, values: string[]): DynamicClassAllowlistEntry[] {
  return values.map((value) => ({ kind: 'class', value, rationale }));
}

describe('Cedros CSS class parity', () => {
  it('defines every clearly-static cedros class emitted through className', () => {
    const emitted = collectEmittedClassNames();
    const defined = collectDefinedClassNames();
    const missing = missingClassReferences(emitted, defined);

    expect(formatMissingClasses(missing)).toEqual([]);
  });
});

function collectEmittedClassNames(): Map<string, ClassReference[]> {
  const emitted = new Map<string, ClassReference[]>();

  for (const sourcePath of collectSourceFiles(sourceRoot)) {
    const sourceText = readFileSync(sourcePath, 'utf8');
    const sourceFile = ts.createSourceFile(
      sourcePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      sourcePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    collectFromClassNameContexts(sourceFile, sourceFile, emitted);
  }

  return emitted;
}

function collectSourceFiles(root: string): string[] {
  const found: string[] = [];
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(entryPath);
        continue;
      }
      if (isRuntimeSourceFile(entryPath)) found.push(entryPath);
    }
  };

  visit(root);
  return found.sort();
}

function isRuntimeSourceFile(filePath: string): boolean {
  const normalized = relative(sourceRoot, filePath).split(sep).join('/');

  return (
    /\.(ts|tsx)$/.test(normalized) &&
    !normalized.endsWith('.d.ts') &&
    !/\.(test|spec)\.(ts|tsx)$/.test(normalized) &&
    !normalized.startsWith('test/')
  );
}

function collectDefinedClassNames(): Set<string> {
  const classes = new Set<string>();

  for (const cssFile of cssSourceFiles) {
    const css = readFileSync(join(process.cwd(), cssFile), 'utf8');
    for (const match of css.matchAll(definedClassPattern)) {
      classes.add(match[1]!);
    }
  }

  return classes;
}

function collectFromClassNameContexts(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  emitted: Map<string, ClassReference[]>
): void {
  if (isJsxClassNameAttribute(node)) {
    collectFromJsxAttribute(node, sourceFile, emitted);
    return;
  }

  if (isClassNamePropertyAssignment(node)) {
    collectFromExpression(node.initializer, sourceFile, emitted);
    return;
  }

  if (ts.isVariableDeclaration(node) && isClassNameIdentifier(node.name)) {
    collectFromMaybeExpression(node.initializer, sourceFile, emitted);
  }

  if (ts.isFunctionDeclaration(node) && isClassNameIdentifier(node.name)) {
    collectFromNode(node.body, sourceFile, emitted);
  }

  ts.forEachChild(node, (child) => collectFromClassNameContexts(child, sourceFile, emitted));
}

function collectFromJsxAttribute(
  attribute: ts.JsxAttribute,
  sourceFile: ts.SourceFile,
  emitted: Map<string, ClassReference[]>
): void {
  const initializer = attribute.initializer;
  if (!initializer) return;

  if (ts.isStringLiteral(initializer)) {
    collectFromStaticText(initializer.text, sourceFile, initializer, emitted, false);
    return;
  }

  if (ts.isJsxExpression(initializer)) {
    collectFromMaybeExpression(initializer.expression, sourceFile, emitted);
  }
}

function collectFromMaybeExpression(
  node: ts.Expression | undefined,
  sourceFile: ts.SourceFile,
  emitted: Map<string, ClassReference[]>
): void {
  if (!node) return;
  collectFromExpression(node, sourceFile, emitted);
}

function collectFromExpression(
  node: ts.Expression,
  sourceFile: ts.SourceFile,
  emitted: Map<string, ClassReference[]>
): void {
  if (ts.isStringLiteralLike(node)) {
    collectFromStaticText(node.text, sourceFile, node, emitted, false);
    return;
  }

  if (ts.isTemplateExpression(node)) {
    collectFromTemplateExpression(node, sourceFile, emitted);
    return;
  }

  collectFromNode(node, sourceFile, emitted);
}

function collectFromNode(
  node: ts.Node | undefined,
  sourceFile: ts.SourceFile,
  emitted: Map<string, ClassReference[]>
): void {
  if (!node) return;

  if (ts.isStringLiteralLike(node)) {
    collectFromStaticText(node.text, sourceFile, node, emitted, false);
    return;
  }

  if (ts.isTemplateExpression(node)) {
    collectFromTemplateExpression(node, sourceFile, emitted);
    return;
  }

  ts.forEachChild(node, (child) => collectFromNode(child, sourceFile, emitted));
}

function collectFromTemplateExpression(
  template: ts.TemplateExpression,
  sourceFile: ts.SourceFile,
  emitted: Map<string, ClassReference[]>
): void {
  collectFromStaticText(template.head.text, sourceFile, template.head, emitted, true);

  for (const span of template.templateSpans) {
    collectFromNode(span.expression, sourceFile, emitted);
    collectFromStaticText(
      span.literal.text,
      sourceFile,
      span.literal,
      emitted,
      ts.isTemplateMiddle(span.literal)
    );
  }
}

function collectFromStaticText(
  text: string,
  sourceFile: ts.SourceFile,
  node: ts.Node,
  emitted: Map<string, ClassReference[]>,
  followedByInterpolation: boolean
): void {
  const dynamicPrefix = followedByInterpolation ? trailingCedrosPrefix(text) : null;

  for (const match of text.matchAll(cedrosClassPattern)) {
    const token = match[0];
    const isTrailingPrefix = dynamicPrefix === token && match.index! + token.length === text.length;
    if (isTrailingPrefix) continue;
    addReference(emitted, token, { kind: 'class', source: sourceLocation(sourceFile, node) });
  }

  if (dynamicPrefix) {
    addReference(emitted, dynamicPrefix, {
      kind: 'prefix',
      source: sourceLocation(sourceFile, node),
    });
  }
}

function trailingCedrosPrefix(text: string): string | null {
  const match = text.match(/(?:^|[\s"'({[.])((?:cedros-)[A-Za-z0-9_-]+)$/);
  return match?.[1] ?? null;
}

function addReference(
  emitted: Map<string, ClassReference[]>,
  token: string,
  reference: ClassReference
): void {
  const references = emitted.get(token) ?? [];
  references.push(reference);
  emitted.set(token, references);
}

function missingClassReferences(
  emitted: Map<string, ClassReference[]>,
  defined: Set<string>
): string[] {
  const allowedClasses = new Set(
    DYNAMIC_CLASS_ALLOWLIST.filter((entry) => entry.kind === 'class').map((entry) => entry.value)
  );
  const allowedPrefixes = new Set(
    DYNAMIC_CLASS_ALLOWLIST.filter((entry) => entry.kind === 'prefix').map((entry) => entry.value)
  );
  const missing: string[] = [];

  for (const [token, references] of [...emitted.entries()].sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    for (const kind of new Set(references.map((reference) => reference.kind))) {
      if (isDefinedOrAllowed(token, kind, defined, allowedClasses, allowedPrefixes)) continue;
      const sources = references
        .filter((reference) => reference.kind === kind)
        .map((reference) => reference.source);
      missing.push(`${kind} ${token} from ${[...new Set(sources)].sort().join(', ')}`);
    }
  }

  return missing;
}

function isDefinedOrAllowed(
  token: string,
  kind: ClassKind,
  defined: Set<string>,
  allowedClasses: Set<string>,
  allowedPrefixes: Set<string>
): boolean {
  if (kind === 'class') {
    return (
      defined.has(token) ||
      allowedClasses.has(token) ||
      [...allowedPrefixes].some((prefix) => token.startsWith(prefix))
    );
  }

  if (allowedPrefixes.has(token)) return true;
  return [...defined].some((definedClass) => definedClass.startsWith(token));
}

function formatMissingClasses(missing: string[]): string[] {
  return missing.map((entry) => `Missing CSS selector for emitted ${entry}`);
}

function isJsxClassNameAttribute(node: ts.Node): node is ts.JsxAttribute {
  return ts.isJsxAttribute(node) && ts.isIdentifier(node.name) && node.name.text === 'className';
}

function isClassNamePropertyAssignment(node: ts.Node): node is ts.PropertyAssignment {
  return ts.isPropertyAssignment(node) && propertyNameText(node.name) === 'className';
}

function isClassNameIdentifier(node: ts.Node | undefined): boolean {
  return !!node && ts.isIdentifier(node) && classNameIdentifierPattern.test(node.text);
}

function propertyNameText(name: ts.PropertyName): string | null {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name))
    return name.text;
  return null;
}

function sourceLocation(sourceFile: ts.SourceFile, node: ts.Node): string {
  const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  const path = relative(process.cwd(), sourceFile.fileName).split(sep).join('/');
  return `${path}:${line + 1}`;
}
