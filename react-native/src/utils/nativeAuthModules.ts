import { Platform } from "react-native";
import type React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { sha256Hex } from "./tokenScope";

export interface AppleSignInPayload {
  idToken: string;
  authorizationCode?: string;
  nonce: string;
  fullName?: {
    givenName?: string;
    familyName?: string;
  };
}

type AppleButtonStyle = "White" | "WhiteOutline" | "Black";
type AppleButtonType = "SignIn" | "Continue" | "SignUp";
type AppleRequestOperation = 0 | 1 | 2 | 3;
type AppleRequestScope = 0 | 1;

export type NativeAppleButtonProps = {
  buttonStyle?: AppleButtonStyle;
  buttonType?: AppleButtonType;
  cornerRadius?: number;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export type NativeAppleButtonComponent =
  React.ComponentType<NativeAppleButtonProps> & {
    Style?: {
      BLACK?: AppleButtonStyle;
    };
    Type?: {
      SIGN_IN?: AppleButtonType;
    };
  };

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
      requestedOperation: AppleRequestOperation;
      requestedScopes: AppleRequestScope[];
      nonce?: string;
    }) => Promise<AppleAuthCredential>;
    Operation: {
      LOGIN: AppleRequestOperation;
    };
    Scope: {
      FULL_NAME: AppleRequestScope;
      EMAIL: AppleRequestScope;
    };
  };
  AppleButton?: NativeAppleButtonComponent;
};

type GoogleSignInResult = {
  idToken?: string | null;
};

export type NativeGoogleButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  size?: number;
  color?: "dark" | "light";
  style?: StyleProp<ViewStyle>;
};

export type NativeGoogleButtonComponent =
  React.ComponentType<NativeGoogleButtonProps> & {
    Size?: {
      Wide?: number;
    };
    Color?: {
      Light?: "light";
    };
  };

type GoogleSignInModule = {
  GoogleSignin: {
    hasPlayServices?: () => Promise<boolean>;
    signIn: () => Promise<GoogleSignInResult>;
  };
  GoogleSigninButton?: NativeGoogleButtonComponent;
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

export async function requestNativeAppleCredential(
  nonce: string,
): Promise<AppleSignInPayload> {
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
    nonce: sha256Hex(nonce),
  });

  if (!credential.identityToken) {
    throw new Error("Apple Sign-In did not return an identity token.");
  }
  return {
    idToken: credential.identityToken,
    authorizationCode: credential.authorizationCode ?? undefined,
    nonce,
    fullName: credential.fullName
      ? {
          givenName: credential.fullName.givenName ?? undefined,
          familyName: credential.fullName.familyName ?? undefined,
        }
      : undefined,
  };
}

export async function requestNativeGoogleIdToken(): Promise<{
  idToken: string;
}> {
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
