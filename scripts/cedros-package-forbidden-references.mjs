const FORBIDDEN_REFERENCES = Object.freeze(['@cedros/admin-react']);

/** Rejects forbidden dependency references in every text entry of a Cedros archive. */
export function validateForbiddenArchiveReferences(entries) {
  for (const entry of entries) {
    if (entry.name === 'cedros-extension.server.wasm') continue;
    const text = new TextDecoder().decode(entry.data);
    for (const reference of FORBIDDEN_REFERENCES) {
      if (text.includes(reference)) {
        throw new Error(`archive entry ${entry.name} contains forbidden reference ${reference}`);
      }
    }
  }
}
