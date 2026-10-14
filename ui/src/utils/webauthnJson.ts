// Minimal WebAuthn JSON helpers (no external deps).
//
// WebAuthn request/response objects contain ArrayBuffers, which can't be sent
// over JSON. Server endpoints in this repo expose options with base64url fields
// and expect credentials back with base64url fields.

type Base64UrlString = string;
type PublicKeyCredentialHint = 'client-device' | 'security-key' | 'hybrid';
type PublicKeyCredentialCreationOptionsWithHints = PublicKeyCredentialCreationOptions & {
  hints?: PublicKeyCredentialHint[];
};
type PublicKeyCredentialRequestOptionsWithHints = PublicKeyCredentialRequestOptions & {
  hints?: PublicKeyCredentialHint[];
};
const AUTHENTICATOR_TRANSPORTS: AuthenticatorTransport[] = [
  'ble',
  'hybrid',
  'internal',
  'nfc',
  'usb',
];
type ServerCredentialDescriptor = {
  type: PublicKeyCredentialType;
  id: Base64UrlString;
  transports?: AuthenticatorTransport[];
};
type ServerCredentialRpEntity = {
  id?: string;
  name: string;
};
type ServerCredentialUserEntity = {
  id: Base64UrlString;
  name: string;
  displayName: string;
};
type ServerPublicKeyCredentialParameters = {
  type: PublicKeyCredentialType;
  alg: number;
};
type ServerCreationPublicKey = {
  challenge: Base64UrlString;
  rp: ServerCredentialRpEntity;
  user: ServerCredentialUserEntity;
  pubKeyCredParams?: ServerPublicKeyCredentialParameters[];
  timeout?: number;
  attestation?: AttestationConveyancePreference;
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  excludeCredentials?: ServerCredentialDescriptor[];
  extensions?: AuthenticationExtensionsClientInputs;
};
type ServerRequestPublicKey = {
  challenge: Base64UrlString;
  rpId?: string;
  timeout?: number;
  userVerification?: UserVerificationRequirement;
  allowCredentials?: ServerCredentialDescriptor[];
  extensions?: AuthenticationExtensionsClientInputs;
};
type AttestationCredentialResponseJSON = {
  clientDataJSON: Base64UrlString;
  attestationObject: Base64UrlString;
  transports?: AuthenticatorTransport[];
};
type AssertionCredentialResponseJSON = {
  clientDataJSON: Base64UrlString;
  authenticatorData: Base64UrlString;
  signature: Base64UrlString;
  userHandle?: Base64UrlString;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function normalizeBase64Url(input: string): string {
  // Browser encoders may return base64url without padding.
  return input.replace(/-/g, '+').replace(/_/g, '/');
}

function base64UrlToArrayBuffer(b64url: Base64UrlString): ArrayBuffer {
  assert(typeof b64url === 'string' && b64url.length > 0, 'Expected base64url string');
  const base64 = normalizeBase64Url(b64url);
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): Base64UrlString {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function mapCredentialDescriptor(desc: ServerCredentialDescriptor): PublicKeyCredentialDescriptor {
  assert(typeof desc === 'object' && desc !== null, 'Invalid credential descriptor');
  assert(typeof desc.type === 'string', 'Invalid credential descriptor type');
  assert(typeof desc.id === 'string', 'Invalid credential descriptor id');

  return {
    type: desc.type,
    id: base64UrlToArrayBuffer(desc.id),
    transports: Array.isArray(desc.transports) ? desc.transports : undefined,
  };
}

function isAuthenticatorTransport(value: string): value is AuthenticatorTransport {
  return AUTHENTICATOR_TRANSPORTS.some((transport) => transport === value);
}

export type ServerCreationOptions = {
  publicKey: ServerCreationPublicKey;
};

export function parseCreationOptionsFromServer(
  options: ServerCreationOptions
): PublicKeyCredentialCreationOptions {
  assert(options && typeof options === 'object', 'Missing creation options');
  const publicKey = options.publicKey;
  assert(publicKey && typeof publicKey === 'object', 'Missing creation options.publicKey');

  assert(typeof publicKey.challenge === 'string', 'Missing creation challenge');
  assert(typeof publicKey.rp === 'object' && publicKey.rp !== null, 'Missing rp');
  assert(typeof publicKey.user === 'object' && publicKey.user !== null, 'Missing user');

  const { rp, user } = publicKey;

  assert(typeof rp.name === 'string', 'Missing rp.name');
  assert(typeof user.id === 'string', 'Missing user.id');
  assert(typeof user.name === 'string', 'Missing user.name');
  assert(typeof user.displayName === 'string', 'Missing user.displayName');

  const exclude = Array.isArray(publicKey.excludeCredentials)
    ? publicKey.excludeCredentials.map(mapCredentialDescriptor)
    : undefined;

  const pubKeyCredParams = Array.isArray(publicKey.pubKeyCredParams)
    ? publicKey.pubKeyCredParams.map((p) => ({
        type: p.type,
        alg: p.alg,
      }))
    : [];

  const result: PublicKeyCredentialCreationOptionsWithHints = {
    challenge: base64UrlToArrayBuffer(publicKey.challenge),
    rp: {
      name: rp.name,
      id: typeof rp.id === 'string' ? rp.id : undefined,
    },
    user: {
      id: base64UrlToArrayBuffer(user.id),
      name: user.name,
      displayName: user.displayName,
    },
    pubKeyCredParams,
    timeout: typeof publicKey.timeout === 'number' ? publicKey.timeout : undefined,
    attestation: typeof publicKey.attestation === 'string' ? publicKey.attestation : undefined,
    authenticatorSelection:
      typeof publicKey.authenticatorSelection === 'object' &&
      publicKey.authenticatorSelection !== null
        ? publicKey.authenticatorSelection
        : undefined,
    excludeCredentials: exclude,
    extensions:
      typeof publicKey.extensions === 'object' && publicKey.extensions !== null
        ? publicKey.extensions
        : undefined,
  };

  // WebAuthn L3 `hints` is not yet in TypeScript DOM lib; unsupported browsers ignore it.
  result.hints = ['client-device'];

  return result;
}

export type ServerRequestOptions = {
  publicKey: ServerRequestPublicKey;
};

export function parseRequestOptionsFromServer(
  options: ServerRequestOptions
): PublicKeyCredentialRequestOptions {
  assert(options && typeof options === 'object', 'Missing request options');
  const publicKey = options.publicKey;
  assert(publicKey && typeof publicKey === 'object', 'Missing request options.publicKey');

  assert(typeof publicKey.challenge === 'string', 'Missing request challenge');

  const allow = Array.isArray(publicKey.allowCredentials)
    ? publicKey.allowCredentials.map(mapCredentialDescriptor)
    : undefined;

  const result: PublicKeyCredentialRequestOptionsWithHints = {
    challenge: base64UrlToArrayBuffer(publicKey.challenge),
    rpId: typeof publicKey.rpId === 'string' ? publicKey.rpId : undefined,
    timeout: typeof publicKey.timeout === 'number' ? publicKey.timeout : undefined,
    userVerification:
      typeof publicKey.userVerification === 'string' ? publicKey.userVerification : undefined,
    allowCredentials: allow,
    extensions:
      typeof publicKey.extensions === 'object' && publicKey.extensions !== null
        ? publicKey.extensions
        : undefined,
  };

  // WebAuthn L3 `hints` is not yet in TypeScript DOM lib; unsupported browsers ignore it.
  result.hints = ['client-device'];

  return result;
}

export type PublicKeyCredentialJSON = {
  id: string;
  rawId: string;
  type: string;
  authenticatorAttachment?: string;
  clientExtensionResults?: AuthenticationExtensionsClientOutputs;
  response: AttestationCredentialResponseJSON | AssertionCredentialResponseJSON;
};

export function credentialToServerJson(cred: PublicKeyCredential): PublicKeyCredentialJSON {
  const rawId = arrayBufferToBase64Url(cred.rawId);
  const response = cred.response;

  const common = {
    clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
  };

  // Registration
  if ('attestationObject' in response) {
    const att = response as AuthenticatorAttestationResponse;
    const responseJson: AttestationCredentialResponseJSON = {
      ...common,
      attestationObject: arrayBufferToBase64Url(att.attestationObject),
    };
    if (typeof att.getTransports === 'function') {
      try {
        const transports = att.getTransports().filter(isAuthenticatorTransport);
        if (transports.length > 0) {
          responseJson.transports = transports;
        }
      } catch {
        // ignore
      }
    }
    return {
      id: cred.id,
      rawId,
      type: cred.type,
      authenticatorAttachment: cred.authenticatorAttachment ?? undefined,
      clientExtensionResults: cred.getClientExtensionResults?.() ?? {},
      response: responseJson,
    };
  }

  // Authentication
  if ('authenticatorData' in response) {
    const asr = response as AuthenticatorAssertionResponse;
    const responseJson: AssertionCredentialResponseJSON = {
      ...common,
      authenticatorData: arrayBufferToBase64Url(asr.authenticatorData),
      signature: arrayBufferToBase64Url(asr.signature),
    };
    if (asr.userHandle) {
      responseJson.userHandle = arrayBufferToBase64Url(asr.userHandle);
    }
    return {
      id: cred.id,
      rawId,
      type: cred.type,
      authenticatorAttachment: cred.authenticatorAttachment ?? undefined,
      clientExtensionResults: cred.getClientExtensionResults?.() ?? {},
      response: responseJson,
    };
  }

  throw new Error('Unsupported WebAuthn credential response');
}
