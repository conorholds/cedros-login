type Base64UrlString = string;
export declare function base64UrlToArrayBuffer(b64url: Base64UrlString): ArrayBuffer;
export declare function arrayBufferToBase64Url(buffer: ArrayBuffer): Base64UrlString;
export type ServerCreationOptions = {
    publicKey: Record<string, unknown>;
};
export declare function parseCreationOptionsFromServer(options: ServerCreationOptions): PublicKeyCredentialCreationOptions;
export type ServerRequestOptions = {
    publicKey: Record<string, unknown>;
};
export declare function parseRequestOptionsFromServer(options: ServerRequestOptions): PublicKeyCredentialRequestOptions;
export type PublicKeyCredentialJSON = {
    id: string;
    rawId: string;
    type: string;
    authenticatorAttachment?: string;
    clientExtensionResults?: AuthenticationExtensionsClientOutputs;
    response: Record<string, unknown>;
};
export declare function credentialToServerJson(cred: PublicKeyCredential): PublicKeyCredentialJSON;
export {};
