import { Platform } from "react-native";
import type { AppleSignInPayload } from "../hooks/useAppleAuth";

type AppleAuthCredential = {
  identityToken?: string | null;
  authorizationCode?: string | null;
  nonce?: string | null;
  fullName?: {
    givenName?: string | null;
    familyName?: string | null;
  } | null;
};

type AppleAuthModule = {
  appleAuth: {
    performRequest: (options: {
      requestedOperation: unknown;
      requestedScopes: unknown[];
    }) => Promise<AppleAuthCredential>;
    Operation: {
      LOGIN: unknown;
    };
    Scope: {
      FULL_NAME: unknown;
      EMAIL: unknown;
    };
  };
  AppleButton?: unknown;
};

type GoogleSignInResult = {
  idToken?: string | null;
};

type GoogleSignInModule = {
  GoogleSignin: {
    hasPlayServices?: () => Promise<unknown>;
    signIn: () => Promise<GoogleSignInResult>;
  };
  GoogleSigninButton?: unknown;
};

export function getAppleAuthModule(): AppleAuthModule | null {
  if (Platform.OS !== "ios") {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("@invertase/react-native-apple-authentication") as AppleAuthModule;
  } catch {
    return null;
  }
}

export function getGoogleSignInModule(): GoogleSignInModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("@react-native-google-signin/google-signin") as GoogleSignInModule;
  } catch {
    return null;
  }
}

export function hasNativeAppleAuthSupport(): boolean {
  return getAppleAuthModule() !== null;
}

export function hasNativeGoogleAuthSupport(): boolean {
  return getGoogleSignInModule() !== null;
}

export async function requestNativeAppleCredential(): Promise<AppleSignInPayload> {
  const appleModule = getAppleAuthModule();
  if (!appleModule) {
    throw new Error(
      "Install @invertase/react-native-apple-authentication or provide AppleLoginButton.onRequestToken.",
    );
  }

  const credential = await appleModule.appleAuth.performRequest({
    requestedOperation: appleModule.appleAuth.Operation.LOGIN,
    requestedScopes: [
      appleModule.appleAuth.Scope.FULL_NAME,
      appleModule.appleAuth.Scope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error("Apple Sign-In did not return an identity token.");
  }

  return {
    idToken: credential.identityToken,
    authorizationCode: credential.authorizationCode ?? undefined,
    nonce: credential.nonce ?? undefined,
    fullName: credential.fullName
      ? {
          givenName: credential.fullName.givenName ?? undefined,
          familyName: credential.fullName.familyName ?? undefined,
        }
      : undefined,
  };
}

export async function requestNativeGoogleIdToken(): Promise<{ idToken: string }> {
  const googleModule = getGoogleSignInModule();
  if (!googleModule) {
    throw new Error(
      "Install @react-native-google-signin/google-signin or provide GoogleLoginButton.onRequestToken.",
    );
  }

  if (typeof googleModule.GoogleSignin.hasPlayServices === "function") {
    await googleModule.GoogleSignin.hasPlayServices();
  }

  const result = await googleModule.GoogleSignin.signIn();
  if (!result.idToken) {
    throw new Error("Google Sign-In did not return an ID token.");
  }

  return { idToken: result.idToken };
}
