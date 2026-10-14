// Production components with an isolated HTTP boundary supplied by auth-journeys.mjs.
import { createRoot } from 'react-dom/client';
import { CedrosLoginProvider } from '../src/context/CedrosLoginProvider';
import { useCedrosLogin } from '../src/context/useCedrosLogin';
import { NonWalletLoginForm } from '../src/components/NonWalletLoginForm';
import { LoginModal } from '../src/components/LoginModal';
import { ResetPasswordForm } from '../src/components/email/ResetPasswordForm';
import '../src/styles/login.css';

const journey = new URLSearchParams(location.search).get('journey');
function Content() {
  const { openModal } = useCedrosLogin();
  if (journey === 'reset') return <ResetPasswordForm token="expired-fixture-token" />;
  if (journey === 'embedded')
    return (
      <>
        <section aria-label="First">
          <NonWalletLoginForm />
        </section>
        <section aria-label="Second">
          <NonWalletLoginForm />
        </section>
      </>
    );
  if (journey === 'modal')
    return (
      <>
        <button onClick={openModal}>Open sign-in</button>
        <LoginModal />
      </>
    );
  return <NonWalletLoginForm />;
}
createRoot(document.getElementById('root')!).render(
  <main style={{ maxWidth: 420, margin: '24px auto', padding: 16 }}>
    <CedrosLoginProvider
      config={{
        serverUrl: `${location.origin}/fixture-auth`,
        retryAttempts: 0,
        features: {
          email: true,
          google: false,
          apple: false,
          solana: false,
          webauthn: journey === 'passkey',
          instantLink: false,
        },
      }}
    >
      <Content />
    </CedrosLoginProvider>
  </main>
);
