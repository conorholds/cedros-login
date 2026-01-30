/**
 * Internal component that exposes embedded wallet availability
 *
 * This component must be rendered inside CedrosLoginProvider since
 * it uses hooks that depend on the login context.
 *
 * @internal
 */
/**
 * Exposes embedded wallet availability via window global when enabled
 *
 * Only exposes info when:
 * 1. config.wallet.exposeAvailability is true
 * 2. User is logged in
 * 3. Wallet status is known
 *
 * @internal
 */
export declare function EmbeddedWalletExposure(): null;
