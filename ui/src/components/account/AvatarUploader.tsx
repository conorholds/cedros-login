/** Profile avatar backed by the Cedros Core storage seam through `/me/avatar`. */

import { useCallback, useMemo, useRef, useState } from 'react';
import { useCedrosLogin } from '../../context/useCedrosLogin';
import { useAuth } from '../../hooks/useAuth';
import { useExternalEffect } from '../../hooks/effects';
import { ApiClient, handleApiError } from '../../utils/apiClient';
import { getInitials } from '../profile/profileHelpers';
import {
  ACCEPTED_AVATAR_TYPES,
  avatarDataUrl,
  fileToBase64,
  type AvatarPayload,
} from './avatarData';

const ACCEPTED = ACCEPTED_AVATAR_TYPES.join(',');

interface PreviewState {
  userId: string;
  src: string | null;
}

export interface AvatarUploaderProps {
  className?: string;
}

export function AvatarUploader({ className = '' }: AvatarUploaderProps) {
  const { user, refreshUser } = useAuth();
  const { config, _internal } = useCedrosLogin();
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userId = user?.id;
  const userPicture = user?.picture;
  const avatarContentType = user?.avatarContentType;
  const client = useMemo(
    () =>
      new ApiClient({
        baseUrl: config.serverUrl,
        timeoutMs: config.requestTimeout,
        retryAttempts: config.retryAttempts,
        getAccessToken: _internal?.getAccessToken,
      }),
    [config.serverUrl, config.requestTimeout, config.retryAttempts, _internal?.getAccessToken]
  );

  useExternalEffect(() => {
    if (!userId) {
      setPreview(null);
      return;
    }
    const fallback = userPicture ?? null;
    if (!avatarContentType) {
      setPreview((current) =>
        current?.userId === userId && current.src === fallback ? current : { userId, src: fallback }
      );
      return;
    }
    let active = true;
    client
      .get<AvatarPayload>('/me/avatar', { cacheTtlMs: 5_000 })
      .then((payload) => {
        if (active) setPreview({ userId, src: avatarDataUrl(payload) });
      })
      .catch(() => {
        if (active && !fallback) setError('Your saved profile picture could not be loaded.');
      });
    return () => {
      active = false;
    };
  }, [avatarContentType, client, userId, userPicture]);

  const handleUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setError(null);
      if (!ACCEPTED_AVATAR_TYPES.includes(file.type) || file.size === 0) {
        setError('Choose a JPG, PNG, GIF, or WebP image.');
        return;
      }
      setIsBusy(true);
      try {
        const payload = await client.post<AvatarPayload>('/me/avatar', {
          contentType: file.type,
          content: await fileToBase64(file),
        });
        if (user) setPreview({ userId: user.id, src: avatarDataUrl(payload) });
        await refreshUser();
      } catch (cause) {
        const timedOut =
          typeof cause === 'object' &&
          cause !== null &&
          'name' in cause &&
          cause.name === 'AbortError';
        setError(
          timedOut
            ? 'Upload timed out. Check your connection and try again.'
            : handleApiError(cause, 'Failed to upload image.').message
        );
      } finally {
        setIsBusy(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [client, refreshUser, user]
  );

  const handleRemove = useCallback(async () => {
    setError(null);
    setIsBusy(true);
    try {
      await client.delete('/me/avatar');
      if (user) setPreview({ userId: user.id, src: null });
      await refreshUser();
    } catch (cause) {
      setError(handleApiError(cause, 'Failed to remove image.').message);
    } finally {
      setIsBusy(false);
    }
  }, [client, refreshUser, user]);

  const previewSrc = preview && preview.userId === user?.id ? preview.src : (user?.picture ?? null);
  return (
    <div className={`cedros-avatar-field ${className}`.trim()} aria-busy={isBusy}>
      <div className="cedros-avatar-field__preview">
        {previewSrc ? (
          <img src={previewSrc} alt={user?.name || 'Profile'} className="cedros-profile-avatar" />
        ) : (
          <div className="cedros-profile-avatar cedros-profile-avatar-fallback">
            {getInitials(user)}
          </div>
        )}
      </div>
      <div className="cedros-avatar-field__body">
        <p className="cedros-avatar-field__label">Profile picture</p>
        <p className="cedros-avatar-field__hint">JPG, PNG, GIF, or WebP.</p>
        <div className="cedros-avatar-field__actions">
          <button
            type="button"
            className="cedros-button cedros-button-outline cedros-button-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
          >
            {isBusy ? 'Saving…' : 'Upload'}
          </button>
          {(previewSrc || user?.avatarContentType) && (
            <button
              type="button"
              className="cedros-button cedros-button-ghost cedros-button-sm"
              onClick={handleRemove}
              disabled={isBusy}
            >
              Remove
            </button>
          )}
        </div>
        {error && <p className="cedros-avatar-field__error">{error}</p>}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED}
          onChange={handleUpload}
          className="cedros-profile-avatar-input"
          aria-label="Upload profile picture"
          tabIndex={-1}
        />
      </div>
    </div>
  );
}
