/**
 * Coerces an unknown thrown value into an `Error` carrying a human-readable
 * message.
 *
 * Auth hooks reject with `AuthError` plain objects (`{ code, message }`) and the
 * API client rejects with `{ isApiError, data, status }` — neither is an `Error`
 * instance. Naively doing `new Error(String(err))` on such an object yields the
 * useless `"[object Object]"`. `onError` consumers read `error.message`, so we
 * extract the object's `message` field (the shape `AuthError`/`handleApiError`
 * produce) and fall back to a friendly default only when no message is present.
 *
 * @param err Any thrown/rejected value.
 * @param fallbackMessage Message used when `err` carries no usable message.
 */
export function toError(
  err: unknown,
  fallbackMessage = 'Something went wrong. Please try again.'
): Error {
  if (err instanceof Error) return err;
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return new Error(message);
  }
  if (typeof err === 'string' && err.trim()) return new Error(err);
  return new Error(fallbackMessage);
}
