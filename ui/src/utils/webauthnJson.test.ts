import { describe, expect, it } from 'vitest';
import { credentialToServerJson } from './webauthnJson';

function bytes(values: number[]): ArrayBuffer {
  return new Uint8Array(values).buffer;
}

function registrationCredential(transports: string[]): PublicKeyCredential {
  return {
    id: 'credential-id',
    rawId: bytes([1, 2, 3]),
    type: 'public-key',
    authenticatorAttachment: 'platform',
    getClientExtensionResults: () => ({}),
    toJSON: () => ({}),
    response: {
      clientDataJSON: bytes([4, 5]),
      attestationObject: bytes([6, 7]),
      getTransports: () => transports,
    } as AuthenticatorAttestationResponse,
  } as PublicKeyCredential;
}

describe('credentialToServerJson', () => {
  it('preserves supported authenticator transports', () => {
    const credential = registrationCredential(['internal', 'usb']);
    const json = credentialToServerJson(credential);

    expect(json.response).toMatchObject({
      transports: ['internal', 'usb'],
    });
  });

  it('omits unsupported authenticator transports', () => {
    const credential = registrationCredential(['internal', 'unsupported-transport']);
    const json = credentialToServerJson(credential);

    expect(json.response).toMatchObject({
      transports: ['internal'],
    });
  });
});
