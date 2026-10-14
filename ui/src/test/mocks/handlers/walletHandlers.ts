import { http, HttpResponse } from 'msw';

import {
  getWalletState,
  setWalletState,
  TEST_SERVER_AUTH_URL,
  TEST_SERVER_URL,
  walletGlobal,
} from './mockState';

export const walletHandlers = [
  // Get wallet status
  // Minimal in-memory wallet state for stories/tests.
  // NOTE: This is only for demo/mocks; real behavior is server-driven.
  http.get(`${TEST_SERVER_URL}/wallet/status`, () => {
    const state = getWalletState();
    setWalletState(state);
    return HttpResponse.json(state);
  }),

  // Wallet handlers for tests whose default serverUrl includes /auth
  http.get(`${TEST_SERVER_AUTH_URL}/wallet/status`, () => {
    const state = getWalletState();
    setWalletState(state);
    return HttpResponse.json(state);
  }),

  http.get(`${TEST_SERVER_AUTH_URL}/wallet/material`, () => {
    const state = walletGlobal.__CEDROS_WALLET_STATE__;
    if (!state?.enrolled) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({
      solanaPubkey: state.solanaPubkey,
      schemeVersion: 2,
      shareAAuthMethod: state.authMethod,
      prfSalt: state.authMethod === 'passkey' ? 'cHJmLXNhbHQ=' : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  http.post(`${TEST_SERVER_AUTH_URL}/wallet/enroll`, async ({ request }) => {
    const body = (await request.json()) as { solanaPubkey: string; shareAAuthMethod: string };
    setWalletState({
      enrolled: true,
      unlocked: true,
      solanaPubkey: body.solanaPubkey || 'SoLaNaWaLLeTaDDrEsS12345678901234567890123',
      authMethod: body.shareAAuthMethod === 'passkey' ? 'passkey' : 'password',
      hasExternalWallet: false,
    });
    return HttpResponse.json({ message: 'Wallet enrolled' });
  }),

  http.post(`${TEST_SERVER_AUTH_URL}/wallet/unlock`, async ({ request }) => {
    const body = (await request.json()) as { password?: string; prfOutput?: string };
    if (!body.password && !body.prfOutput) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Missing credential' },
        { status: 400 }
      );
    }
    const state = getWalletState();
    setWalletState({
      ...state,
      enrolled: true,
      unlocked: true,
      hasExternalWallet: false,
    });
    return HttpResponse.json({ unlocked: true, ttlSeconds: 900 });
  }),

  http.post(`${TEST_SERVER_AUTH_URL}/wallet/lock`, () => {
    const state = getWalletState();
    setWalletState({ ...state, unlocked: false });
    return HttpResponse.json({ message: 'Wallet locked' });
  }),

  http.post(`${TEST_SERVER_AUTH_URL}/wallet/recover`, async ({ request }) => {
    const body = (await request.json()) as { solanaPubkey: string; shareAAuthMethod: string };
    setWalletState({
      enrolled: true,
      unlocked: true,
      solanaPubkey: body.solanaPubkey || 'SoLaNaWaLLeTaDDrEsS12345678901234567890123',
      authMethod: body.shareAAuthMethod === 'passkey' ? 'passkey' : 'password',
      hasExternalWallet: false,
    });
    return HttpResponse.json({ message: 'Wallet recovered' });
  }),

  http.post(`${TEST_SERVER_AUTH_URL}/wallet/share-b`, async ({ request }) => {
    const body = (await request.json()) as { shareC: string };
    if (!body.shareC) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Missing Share C' },
        { status: 400 }
      );
    }
    return HttpResponse.json({
      shareB: 'c2hhcmVCLW1vY2s=',
      solanaPubkey: getWalletState().solanaPubkey ?? 'SoLaNaWaLLeTaDHI=',
    });
  }),

  http.get(`${TEST_SERVER_URL}/wallet/material`, () => {
    const state = walletGlobal.__CEDROS_WALLET_STATE__;
    if (!state?.enrolled) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({
      solanaPubkey: state.solanaPubkey,
      schemeVersion: 2,
      shareAAuthMethod: state.authMethod,
      prfSalt: state.authMethod === 'passkey' ? 'cHJmLXNhbHQ=' : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  http.post(`${TEST_SERVER_URL}/wallet/enroll`, async ({ request }) => {
    const body = (await request.json()) as { solanaPubkey: string; shareAAuthMethod: string };
    setWalletState({
      enrolled: true,
      unlocked: true,
      solanaPubkey: body.solanaPubkey || 'SoLaNaWaLLeTaDDrEsS12345678901234567890123',
      authMethod: body.shareAAuthMethod === 'passkey' ? 'passkey' : 'password',
      hasExternalWallet: false,
    });
    return HttpResponse.json({ message: 'Wallet enrolled' });
  }),

  http.post(`${TEST_SERVER_URL}/wallet/unlock`, async ({ request }) => {
    const body = (await request.json()) as { password?: string; prfOutput?: string };
    if (!body.password && !body.prfOutput) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Missing credential' },
        { status: 400 }
      );
    }
    const state = getWalletState();
    setWalletState({
      ...state,
      enrolled: true,
      unlocked: true,
      hasExternalWallet: false,
    });
    return HttpResponse.json({ unlocked: true, ttlSeconds: 900 });
  }),

  http.post(`${TEST_SERVER_URL}/wallet/lock`, () => {
    const state = getWalletState();
    setWalletState({ ...state, unlocked: false });
    return HttpResponse.json({ message: 'Wallet locked' });
  }),

  http.post(`${TEST_SERVER_URL}/wallet/recover`, async ({ request }) => {
    const body = (await request.json()) as { solanaPubkey: string; shareAAuthMethod: string };
    setWalletState({
      enrolled: true,
      unlocked: true,
      solanaPubkey: body.solanaPubkey || 'SoLaNaWaLLeTaDDrEsS12345678901234567890123',
      authMethod: body.shareAAuthMethod === 'passkey' ? 'passkey' : 'password',
      hasExternalWallet: false,
    });
    return HttpResponse.json({ message: 'Wallet recovered' });
  }),

  http.post(`${TEST_SERVER_URL}/wallet/share-b`, async ({ request }) => {
    const body = (await request.json()) as { shareC: string };
    if (!body.shareC) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Missing Share C' },
        { status: 400 }
      );
    }
    return HttpResponse.json({
      shareB: 'c2hhcmVCLW1vY2s=',
      solanaPubkey: getWalletState().solanaPubkey ?? 'SoLaNaWaLLeTaDHI=',
    });
  }),
];
