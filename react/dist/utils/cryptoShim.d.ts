/**
 * Shim for Node's `crypto` module.
 * Maps `require('crypto')` / `import 'crypto'` to Web Crypto API in the browser.
 * Used by vite.config.ts alias to support CJS dependencies that expect Node crypto.
 */
declare const _default: Crypto;
export default _default;
export declare const webcrypto: Crypto;
export declare const subtle: SubtleCrypto;
export declare const getRandomValues: {
    <T extends ArrayBufferView>(array: T): T;
    <T extends ArrayBufferView>(array: T): T;
};
export declare const randomUUID: {
    (): `${string}-${string}-${string}-${string}-${string}`;
    (): `${string}-${string}-${string}-${string}-${string}`;
};
