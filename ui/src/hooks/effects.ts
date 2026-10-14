import * as React from 'react';

/**
 * Runs an effect only for explicit external synchronization.
 *
 * Use this instead of importing `useEffect` directly so component code has a
 * searchable, reviewable signal that it is crossing React's render boundary.
 * The callback must synchronize with an external system such as network state,
 * browser APIs, DOM focus, timers, SDKs, or subscriptions. Do not use it to
 * derive render data from props/state or to relay user events.
 *
 * @param effect Setup function. It may return cleanup logic.
 * @param dependencies Reactive values used by the effect callback.
 */
export function useExternalEffect(
  effect: React.EffectCallback,
  dependencies: React.DependencyList
): void {
  React.useEffect(effect, dependencies);
}
