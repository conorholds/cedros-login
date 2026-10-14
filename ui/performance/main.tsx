// Isolated consumer of the built package. No request reaches a real auth server.
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CedrosLoginProvider, EmailLoginForm, useCedrosLogin, useMembers } from '../dist/index.js';
import '../dist/login-react.css';

const params = new URLSearchParams(location.search);
let authenticated = params.get('session') === 'restored';
const fixtureUser = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'fixture@example.test',
  emailVerified: true,
  name: 'Fixture User',
  authMethods: ['email'],
  createdAt: '2026-01-01T00:00:00Z',
};
const samples: { name: string; at: number; duration?: number }[] = [];
const requests: Record<string, number> = {};
const mark = (name: string, duration?: number) => {
  samples.push({ name, at: performance.now(), ...(duration === undefined ? {} : { duration }) });
  document.getElementById('measurements')!.textContent = JSON.stringify(
    {
      kind: 'browser-consumer-fixture',
      session: params.get('session') ?? 'logged-out',
      navigation: performance.getEntriesByType('navigation').map((entry) => ({
        type: (entry as PerformanceNavigationTiming).type,
        duration: entry.duration,
      })),
      samples,
      requests,
    },
    null,
    2
  );
};
if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
  new PerformanceObserver((list) =>
    list.getEntries().forEach((entry) => mark('long-task', entry.duration))
  ).observe({ type: 'longtask', buffered: true });
}
const originalFetch = window.fetch.bind(window);
window.fetch = async (input, options) => {
  const url = new URL(
    typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
    location.href
  );
  if (!url.pathname.startsWith('/fixture-auth/')) return originalFetch(input, options);
  const path = url.pathname.slice('/fixture-auth'.length);
  const name = `${options?.method ?? 'GET'} ${path}`;
  requests[name] = (requests[name] ?? 0) + 1;
  mark('request');
  const response = (value: unknown, status = 200) =>
    new Response(JSON.stringify(value), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  if (path === '/login') {
    authenticated = true;
    return response({ user: fixtureUser, isNewUser: false });
  }
  if (path === '/user')
    return authenticated
      ? response({ user: fixtureUser })
      : response({ error: 'unauthorized' }, 401);
  if (path === '/refresh') return response({ error: 'unauthorized' }, 401);
  if (path.endsWith('/members'))
    return response({
      members: Array.from({ length: 50 }, (_, i) => ({
        id: String(i),
        userId: String(i),
        email: `member${i}@example.test`,
        name: `Member ${i}`,
        role: 'member',
        joinedAt: '2026-01-01T00:00:00Z',
      })),
      total: 50,
    });
  if (options?.method === 'PATCH') return response({ message: 'Updated' });
  throw new Error(`Unexpected fixture request: ${name}`);
};

function Team() {
  const { members, isLoading } = useMembers('00000000-0000-4000-8000-000000000002');
  useEffect(() => {
    if (!isLoading && members.length === 50) requestAnimationFrame(() => mark('team-visible'));
  }, [isLoading, members]);
  return (
    <ul>
      {members.map((member) => (
        <li key={member.id}>{member.user.name}</li>
      ))}
    </ul>
  );
}
function App() {
  const { user } = useCedrosLogin();
  const [team, setTeam] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => mark(user ? 'account-visible' : 'login-form-usable'));
  }, [user]);
  return (
    <section style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h1>Cedros Login performance fixture</h1>
      {user ? (
        <>
          <p>Signed in as {user.name}</p>
          <button
            onClick={() => {
              mark('navigation-input');
              setTeam((value) => !value);
            }}
          >
            Toggle team
          </button>
          {team && <Team />}
        </>
      ) : (
        <EmailLoginForm onSuccess={() => mark('login-success')} />
      )}
    </section>
  );
}
mark('module-ready');
createRoot(document.getElementById('root')!).render(
  <CedrosLoginProvider
    config={{
      serverUrl: `${location.origin}/fixture-auth`,
      features: { email: true, google: false, apple: false, solana: false, webauthn: false },
      session: { storage: 'cookie', autoRefresh: false, syncTabs: false },
    }}
  >
    <App />
  </CedrosLoginProvider>
);
