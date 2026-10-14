import { http, HttpResponse } from 'msw';

import { TEST_SERVER_URL } from './mockState';

export const baseHandlers = [
  // Auth feature discovery
  http.get(`${TEST_SERVER_URL}/features`, () => {
    return HttpResponse.json({
      email: true,
      google: true,
      apple: false,
      solana: true,
      webauthn: true,
      instantLink: false,
    });
  }),

  // Health check
  http.get(`${TEST_SERVER_URL}/health`, () => {
    return HttpResponse.json({ status: 'ok' });
  }),

  // No content response
  http.get(`${TEST_SERVER_URL}/no-content`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
