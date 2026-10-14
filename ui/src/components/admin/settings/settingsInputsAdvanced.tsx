/**
 * Advanced settings input components — SecretInput, ReadonlySecretInput,
 * TokenListInput, TokenSymbolListInput
 */
import { useState, useCallback, useMemo } from 'react';
import { PRESET_TOKEN_SYMBOLS } from './settingsMetadata';
import { useCedrosLoginAdminClientContext } from '../../../hooks/useCedrosLoginAdminClientContext';
import { useI18n } from '../../../i18n';

// =============================================================================
// SECRET INPUT (Masked)
// =============================================================================

interface SecretInputProps {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  configured?: boolean;
}

export function SecretInput({ value, onChange, multiline, configured }: SecretInputProps) {
  const t = useI18n().t;
  const [isEditing, setIsEditing] = useState(false);
  const [showValue, setShowValue] = useState(false);
  const hasValue = Boolean(configured || value.length > 0);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setShowValue(true);
  }, []);

  const handleDone = useCallback(() => {
    setIsEditing(false);
    setShowValue(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  if (!isEditing && hasValue) {
    return (
      <div className="cedros-secret-input cedros-secret-input-masked">
        <span className="cedros-secret-masked">
          {'•'.repeat(Math.min(Math.max(value.length, 8), 20))}
        </span>
        <button type="button" className="cedros-secret-edit-btn" onClick={handleEdit}>
          {t.common.edit}
        </button>
      </div>
    );
  }

  return (
    <div className="cedros-secret-input">
      {multiline ? (
        <textarea
          value={value}
          onChange={handleChange}
          className="cedros-setting-input cedros-setting-textarea"
          placeholder={t.admin.settings.enterSecretValue}
          rows={4}
        />
      ) : (
        <input
          type={showValue ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          className="cedros-setting-input"
          placeholder={t.admin.settings.enterSecretValue}
        />
      )}
      <div className="cedros-secret-actions">
        {!multiline && (
          <button
            type="button"
            className="cedros-secret-toggle-btn"
            onClick={() => setShowValue(!showValue)}
          >
            {showValue ? t.common.hide : t.common.show}
          </button>
        )}
        {isEditing && (
          <button type="button" className="cedros-secret-done-btn" onClick={handleDone}>
            {t.common.done}
          </button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// READONLY SECRET INPUT (copy + regenerate)
// =============================================================================

interface ReadonlySecretInputProps {
  /** The setting key (e.g., "sidecar_api_key") — used for the regenerate API call */
  settingKey: string;
  /** Current (possibly encrypted/masked) value from the settings store */
  value: string;
}

/**
 * Read-only secret field with Copy and Regenerate buttons.
 * Used for auto-generated sidecar secrets that the admin copies into deploy env vars.
 */
export function ReadonlySecretInput({ settingKey, value }: ReadonlySecretInputProps) {
  const { t } = useI18n();
  const [revealed, setRevealed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const { config, _internal } = useCedrosLoginAdminClientContext();

  const displayValue = revealed ?? value;
  const hasValue = displayValue && displayValue.length > 0;
  const masked = hasValue && !revealed;

  const handleCopy = useCallback(async () => {
    if (!displayValue) return;
    try {
      await navigator.clipboard.writeText(displayValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for insecure contexts
      const textarea = document.createElement('textarea');
      textarea.value = displayValue;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [displayValue]);

  const handleRegenerate = useCallback(async () => {
    setIsRegenerating(true);
    setRegenerateError(null);
    try {
      const token = _internal?.getAccessToken?.();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const controller = new AbortController();
      const timeoutId = window.setTimeout(
        () => controller.abort(),
        config.requestTimeout ?? 10_000
      );

      const response = await fetch(
        `${config.serverUrl}/auth/admin/settings/regenerate/${settingKey}`,
        {
          method: 'POST',
          headers,
          credentials: 'include',
          signal: controller.signal,
        }
      ).finally(() => {
        window.clearTimeout(timeoutId);
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || body?.error || `Regenerate failed (${response.status})`);
      }

      const data: { key: string; value: string } = await response.json();
      setRevealed(data.value);
      setShowConfirm(false);
    } catch (err) {
      const isAbortError =
        typeof err === 'object' && err !== null && 'name' in err && err.name === 'AbortError';
      setRegenerateError(
        isAbortError
          ? t.admin.settings.regenerateTimedOut
          : err instanceof Error
            ? err.message
            : t.admin.settings.regenerateFailed
      );
    } finally {
      setIsRegenerating(false);
    }
  }, [
    config.serverUrl,
    config.requestTimeout,
    _internal,
    settingKey,
    t.admin.settings.regenerateFailed,
    t.admin.settings.regenerateTimedOut,
  ]);

  return (
    <div className="cedros-readonly-secret">
      <div className="cedros-readonly-secret-value">
        {masked ? (
          <span className="cedros-secret-masked">{'•'.repeat(20)}</span>
        ) : hasValue ? (
          <code className="cedros-readonly-secret-code">{displayValue}</code>
        ) : (
          <span className="cedros-readonly-secret-empty">{t.admin.settings.notGeneratedYet}</span>
        )}
      </div>
      <div className="cedros-readonly-secret-actions">
        {hasValue && (
          <button type="button" className="cedros-secret-action-btn" onClick={handleCopy}>
            {copied ? t.admin.settings.copied : t.common.copy}
          </button>
        )}
        {!showConfirm ? (
          <button
            type="button"
            className="cedros-secret-action-btn cedros-secret-action-btn--danger"
            onClick={() => setShowConfirm(true)}
            disabled={isRegenerating}
          >
            {t.admin.settings.regenerate}
          </button>
        ) : (
          <span className="cedros-readonly-secret-confirm">
            <span className="cedros-readonly-secret-confirm-text">
              {t.admin.settings.updateDeploySecretToo}
            </span>
            <button
              type="button"
              className="cedros-secret-action-btn cedros-secret-action-btn--danger"
              onClick={handleRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? t.admin.settings.regenerating : t.common.confirm}
            </button>
            <button
              type="button"
              className="cedros-secret-action-btn"
              onClick={() => setShowConfirm(false)}
              disabled={isRegenerating}
            >
              {t.common.cancel}
            </button>
          </span>
        )}
      </div>
      {regenerateError && <p className="cedros-readonly-secret-error">{regenerateError}</p>}
    </div>
  );
}

// =============================================================================
// TOKEN LIST INPUT
// =============================================================================

interface TokenDefinition {
  symbol: string;
  mint: string;
  decimals: number;
  logoUrl?: string;
}

interface TokenListInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TokenListInput({ value, onChange }: TokenListInputProps) {
  const t = useI18n().t;
  const tokens: TokenDefinition[] = useMemo(() => {
    try {
      return JSON.parse(value || '[]');
    } catch {
      return [];
    }
  }, [value]);

  const updateTokens = useCallback(
    (updated: TokenDefinition[]) => {
      onChange(JSON.stringify(updated));
    },
    [onChange]
  );

  const addToken = useCallback(() => {
    updateTokens([...tokens, { symbol: '', mint: '', decimals: 6 }]);
  }, [tokens, updateTokens]);

  const updateToken = useCallback(
    (index: number, field: keyof TokenDefinition, val: string | number | undefined) => {
      const updated = [...tokens];
      updated[index] = { ...updated[index], [field]: val };
      updateTokens(updated);
    },
    [tokens, updateTokens]
  );

  const removeToken = useCallback(
    (index: number) => {
      updateTokens(tokens.filter((_, i) => i !== index));
    },
    [tokens, updateTokens]
  );

  return (
    <div className="cedros-token-list-input">
      {/* Preset tokens info */}
      <div className="cedros-token-presets">
        <span className="cedros-token-presets-label">{t.admin.settings.builtInTokens}</span>
        <div className="cedros-token-presets-list">
          {PRESET_TOKEN_SYMBOLS.map((symbol) => (
            <span key={symbol} className="cedros-token-preset-chip">
              {symbol}
            </span>
          ))}
        </div>
      </div>

      {tokens.length === 0 && (
        <p className="cedros-token-list-empty">{t.admin.settings.noCustomTokens}</p>
      )}

      {tokens.map((token, i) => (
        <div key={i} className="cedros-token-row">
          <div className="cedros-token-row-fields">
            <input
              type="text"
              placeholder={t.admin.settings.tokenSymbol}
              value={token.symbol}
              onChange={(e) => updateToken(i, 'symbol', e.target.value.toUpperCase())}
              className="cedros-setting-input cedros-token-input-symbol"
              maxLength={10}
            />
            <input
              type="text"
              placeholder={t.admin.settings.tokenMintAddress}
              value={token.mint}
              onChange={(e) => updateToken(i, 'mint', e.target.value)}
              className="cedros-setting-input cedros-token-input-mint"
            />
            <input
              type="number"
              placeholder={t.admin.settings.tokenDecimals}
              value={token.decimals}
              onChange={(e) => updateToken(i, 'decimals', parseInt(e.target.value, 10) || 0)}
              className="cedros-setting-input cedros-token-input-decimals"
              min={0}
              max={18}
            />
            <input
              type="text"
              placeholder={t.admin.settings.tokenLogoUrlOptional}
              value={token.logoUrl || ''}
              onChange={(e) => updateToken(i, 'logoUrl', e.target.value || undefined)}
              className="cedros-setting-input cedros-token-input-logo"
            />
          </div>
          <button
            type="button"
            className="cedros-token-remove-btn"
            onClick={() => removeToken(i)}
            title={t.admin.settings.removeToken}
          >
            ×
          </button>
        </div>
      ))}

      <button type="button" className="cedros-token-add-btn" onClick={addToken}>
        + {t.admin.settings.addToken}
      </button>
    </div>
  );
}

// =============================================================================
// TOKEN SYMBOL LIST INPUT
// =============================================================================

interface TokenSymbolListInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TokenSymbolListInput({ value, onChange }: TokenSymbolListInputProps) {
  const { t, message } = useI18n();
  const symbols = useMemo(() => {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [value]);

  const addSymbol = useCallback(
    (symbol: string) => {
      if (!symbol || symbols.includes(symbol)) return;
      const updated = [...symbols, symbol].join(', ');
      onChange(updated);
    },
    [symbols, onChange]
  );

  const removeSymbol = useCallback(
    (symbol: string) => {
      const updated = symbols.filter((s) => s !== symbol).join(', ');
      onChange(updated);
    },
    [symbols, onChange]
  );

  return (
    <div className="cedros-token-symbol-list-input">
      {/* Preset tokens - click to add */}
      <div className="cedros-token-presets">
        <span className="cedros-token-presets-label">{t.admin.settings.clickToAdd}</span>
        <div className="cedros-token-presets-list">
          {PRESET_TOKEN_SYMBOLS.map((symbol) => {
            const isSelected = symbols.includes(symbol);
            return (
              <button
                key={symbol}
                type="button"
                className={`cedros-token-preset-chip ${isSelected ? 'cedros-token-preset-chip-selected' : ''}`}
                onClick={() => (isSelected ? removeSymbol(symbol) : addSymbol(symbol))}
                title={message(
                  isSelected ? t.admin.settings.removeTokenSymbol : t.admin.settings.addTokenSymbol,
                  { symbol }
                )}
              >
                {symbol}
                {isSelected && <span className="cedros-token-chip-check">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Text input for manual entry or custom symbols */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cedros-setting-input"
        placeholder={t.admin.settings.tokenSymbolsPlaceholder}
      />
    </div>
  );
}
