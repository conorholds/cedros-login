export interface AuthFormFieldValue {
  name: string;
}

export function readFormFieldValues(
  form: HTMLFormElement | null,
  fields: AuthFormFieldValue[],
  current: Record<string, string>
): Record<string, string> {
  if (!form) return current;
  let changed = false;
  const next = { ...current };

  for (const field of fields) {
    const element = form.elements.namedItem(field.name);
    const value = element && 'value' in element ? String(element.value) : '';
    if (next[field.name] !== value) {
      next[field.name] = value;
      changed = true;
    }
  }

  return changed ? next : current;
}
