/**
 * @cedros/login-react-native/wallet
 *
 * Wallet hooks and components for embedded SSS wallets.
 * These depend on crypto primitives (AES-GCM, Shamir, Argon2) and
 * require a crypto backend (Web Crypto or react-native-quick-crypto).
 *
 * Import from this subpath only if your app uses embedded wallet features.
 *
 * @example
 * ```tsx
 * import { WalletEnrollment, useWalletEnrollment } from '@cedros/login-react-native/wallet';
 * ```
 */

// Wallet hooks
export {
  useWallet,
  useWalletMaterial,
  useWalletDiscovery,
  useWalletEnrollment,
  useWalletRecovery,
  useWalletSigning,
  useWallets,
} from "./hooks";
export type {
  UseWalletReturn,
  UseWalletDiscoveryReturn,
} from "./hooks";

// Wallet components
export {
  WalletStatus,
  WalletUnlock,
  RecoveryPhraseDisplay,
  WalletAddressRow,
  RecoveryPhraseInput,
  WalletEnrollment,
  WalletRecovery,
  WalletManager,
} from "./components/wallet";
export type {
  WalletStatusProps,
  WalletUnlockProps,
  RecoveryPhraseDisplayProps,
  WalletAddressRowProps,
  RecoveryPhraseInputProps,
  WalletEnrollmentProps,
  WalletRecoveryProps,
  WalletManagerProps,
} from "./components/wallet";
