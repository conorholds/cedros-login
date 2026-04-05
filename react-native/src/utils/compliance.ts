import { Platform } from "react-native";
import type { CedrosLoginConfig, TokenStorageAdapter } from "../types";
import {
  hasNativeAppleAuthSupport,
  hasNativeGoogleAuthSupport,
} from "./nativeAuthModules";

function isDevelopment(): boolean {
  return typeof __DEV__ !== "undefined" ? __DEV__ : false;
}

export function getComplianceMode(
  config: CedrosLoginConfig,
): "strict" | "warn" | "off" {
  return config.compliance?.mode ?? (isDevelopment() ? "warn" : "strict");
}

export function buildAccountDeletionUrl(config: CedrosLoginConfig): string {
  return (
    config.compliance?.accountDeletionUrl ??
    `${config.serverUrl.replace(/\/$/, "")}/auth/account-deletion`
  );
}

export function validatePublishableAuthCompliance(
  config: CedrosLoginConfig,
  tokenStorage: TokenStorageAdapter,
): void {
  const mode = getComplianceMode(config);
  if (mode === "off") {
    return;
  }

  const problems: string[] = [];
  const googleEnabled = config.features?.google ?? true;
  const appleEnabled = config.features?.apple ?? true;

  if (
    Platform.OS === "ios" &&
    googleEnabled &&
    !appleEnabled &&
    !config.compliance?.appleSignInExemptionReason
  ) {
    problems.push(
      "iOS apps that expose Google sign-in should also enable Sign in with Apple, unless an App Store exemption applies.",
    );
  }

  if (Platform.OS === "ios" && appleEnabled && !config.appleClientId) {
    problems.push(
      "Apple Sign-In is enabled on iOS but appleClientId is missing.",
    );
  }

  if (googleEnabled && !hasNativeGoogleAuthSupport()) {
    problems.push(
      "Google Sign-In is enabled but @react-native-google-signin/google-signin is not installed. Install the native SDK to use the official Google button in publishable builds.",
    );
  }

  if (Platform.OS === "ios" && appleEnabled && !hasNativeAppleAuthSupport()) {
    problems.push(
      "Apple Sign-In is enabled on iOS but @invertase/react-native-apple-authentication is not installed. Install the native SDK to use Apple's required sign-in control in publishable builds.",
    );
  }

  if (tokenStorage.securityLevel !== "secure") {
    problems.push(
      "Secure token storage is required for publishing. Install react-native-keychain or provide config.secureStorage.adapter.",
    );
  }

  if (problems.length === 0) {
    return;
  }

  const message = `[Cedros Login] Mobile auth compliance check failed:\n- ${problems.join(
    "\n- ",
  )}`;

  if (mode === "warn") {
    console.warn(message);
    return;
  }

  throw new Error(message);
}
