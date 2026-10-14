// Dependency-free validator for the JSON Schema keywords used by the checked
// host-operation catalogs. Deliberately fail closed when a new keyword appears.
export function validateSchemaValue(value, schema, root, label) {
  const errors = validate(value, schema, root, label);
  if (errors.length > 0) throw new Error(errors[0]);
}

function validate(value, schema, root, path) {
  if (typeof schema === "boolean") return schema ? [] : [`${path} is forbidden`];
  if (!schema || typeof schema !== "object") return [`${path} has an invalid schema`];
  rejectUnknownKeywords(schema, path);
  if (schema.$ref) return validate(value, resolve(schema.$ref, root, path), root, path);

  const errors = [];
  if (schema.type && !matchesType(value, schema.type)) {
    return [`${path} must have type ${JSON.stringify(schema.type)}`];
  }
  if (Object.hasOwn(schema, "const") && !equal(value, schema.const)) {
    errors.push(`${path} must equal ${JSON.stringify(schema.const)}`);
  }
  if (schema.enum && !schema.enum.some((candidate) => equal(value, candidate))) {
    errors.push(`${path} is outside its enum`);
  }
  if (typeof value === "string") validateString(value, schema, path, errors);
  if (typeof value === "number") validateNumber(value, schema, path, errors);
  if (Array.isArray(value)) validateArray(value, schema, root, path, errors);
  if (isObject(value)) validateObject(value, schema, root, path, errors);

  for (const member of schema.allOf ?? []) {
    errors.push(...validate(value, member, root, path));
  }
  if (schema.oneOf) {
    const matches = schema.oneOf.filter((member) => validate(value, member, root, path).length === 0);
    if (matches.length !== 1) errors.push(`${path} must match exactly one oneOf branch`);
  }
  if (schema.not && validate(value, schema.not, root, path).length === 0) {
    errors.push(`${path} matches a forbidden schema`);
  }
  if (schema.if && validate(value, schema.if, root, path).length === 0 && schema.then) {
    errors.push(...validate(value, schema.then, root, path));
  }
  return errors;
}

function validateObject(value, schema, root, path, errors) {
  for (const key of schema.required ?? []) {
    if (!Object.hasOwn(value, key)) errors.push(`${path}.${key} is required`);
  }
  const properties = schema.properties ?? {};
  for (const [key, child] of Object.entries(value)) {
    if (properties[key]) errors.push(...validate(child, properties[key], root, `${path}.${key}`));
    else if (schema.additionalProperties === false) errors.push(`${path}.${key} is not allowed`);
  }
}

function validateArray(value, schema, root, path, errors) {
  if (schema.minItems !== undefined && value.length < schema.minItems) {
    errors.push(`${path} has too few items`);
  }
  if (schema.maxItems !== undefined && value.length > schema.maxItems) {
    errors.push(`${path} has too many items`);
  }
  if (schema.uniqueItems && new Set(value.map(stable)).size !== value.length) {
    errors.push(`${path} items must be unique`);
  }
  if (schema.items) {
    value.forEach((item, index) => errors.push(...validate(item, schema.items, root, `${path}[${index}]`)));
  }
}

function validateString(value, schema, path, errors) {
  if (schema.minLength !== undefined && [...value].length < schema.minLength) {
    errors.push(`${path} is too short`);
  }
  if (schema.maxLength !== undefined && [...value].length > schema.maxLength) {
    errors.push(`${path} is too long`);
  }
  if (schema.pattern && !new RegExp(schema.pattern, "u").test(value)) {
    errors.push(`${path} does not match its pattern`);
  }
  if (schema.format === "date-time" && !isDateTime(value)) errors.push(`${path} is not date-time`);
  if (schema.format === "email" && !isEmail(value)) errors.push(`${path} is not an email`);
}

function validateNumber(value, schema, path, errors) {
  if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${path} is too small`);
  if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${path} is too large`);
}

function matchesType(value, expected) {
  const types = Array.isArray(expected) ? expected : [expected];
  return types.some((type) => ({
    null: value === null,
    object: isObject(value),
    array: Array.isArray(value),
    string: typeof value === "string",
    integer: Number.isInteger(value),
    number: typeof value === "number" && Number.isFinite(value),
    boolean: typeof value === "boolean",
  })[type] === true);
}

function resolve(reference, root, path) {
  if (!reference.startsWith("#/")) throw new Error(`${path} uses unsupported ref ${reference}`);
  return reference.slice(2).split("/").reduce((value, part) => {
    const key = part.replaceAll("~1", "/").replaceAll("~0", "~");
    if (!value || !Object.hasOwn(value, key)) throw new Error(`${path} has unresolved ref ${reference}`);
    return value[key];
  }, root);
}

function rejectUnknownKeywords(schema, path) {
  const known = new Set([
    "$schema", "$id", "$defs", "title", "description",
    "$ref", "type", "const", "enum", "format", "pattern", "minLength", "maxLength",
    "minimum", "maximum", "minItems", "maxItems", "uniqueItems", "items", "required",
    "properties", "additionalProperties", "allOf", "oneOf", "not", "if", "then", "default",
  ]);
  for (const key of Object.keys(schema)) {
    if (!known.has(key)) throw new Error(`${path} uses unsupported schema keyword ${key}`);
  }
}

function isObject(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function equal(left, right) { return stable(left) === stable(right); }
function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (isObject(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function isDateTime(value) { return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) && !Number.isNaN(Date.parse(value)); }
function isEmail(value) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value); }
