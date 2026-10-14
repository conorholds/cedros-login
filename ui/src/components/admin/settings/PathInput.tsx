/**
 * PathInput - a route/path setting input with a fixed leading-slash affix.
 *
 * Routes are app-relative paths (e.g. `/welcome`). A raw text box invites the
 * classic mistakes — wrapping quotes (`"welcome"`), a missing or doubled leading
 * slash, stray whitespace. This input owns the leading `/` as a visual affix so
 * the admin only types the slug, and it normalizes the value (see
 * {@link ./routePath}) so those mistakes aren't persisted — even by the
 * debounced autosave that can fire before the field is blurred.
 *
 * Per keystroke we apply {@link cleanSlug} (keeps a trailing slash so a sub-path
 * like `app/welcome` can still be typed); on blur we apply the full
 * {@link normalizeSlug}. The input stays controlled by the stored value, so
 * change is always propagated to keep the field reconciled.
 */
import { useCallback } from 'react';
import { cleanSlug, normalizeSlug, slugToPath } from './routePath';

interface PathInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PathInput({ value, onChange, placeholder }: PathInputProps) {
  // The editable field shows only the slug; the leading slash lives in the affix.
  const slug = value.replace(/^\//, '');

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(slugToPath(cleanSlug(e.target.value)));
    },
    [onChange]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const next = slugToPath(normalizeSlug(e.target.value));
      if (next !== value) onChange(next);
    },
    [onChange, value]
  );

  return (
    <div className="cedros-path-input">
      <span className="cedros-path-input__prefix" aria-hidden="true">
        /
      </span>
      <input
        type="text"
        value={slug}
        onChange={handleChange}
        onBlur={handleBlur}
        className="cedros-setting-input cedros-path-input__field"
        placeholder={placeholder}
        spellCheck={false}
        autoCapitalize="none"
        autoCorrect="off"
      />
    </div>
  );
}
