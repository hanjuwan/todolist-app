import { useLocation } from 'react-router-dom';
import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  const location = useLocation();
  const registered = (location.state as { registered?: boolean } | null)?.registered;

  return (
    <div data-testid="login-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      {registered && (
        <p
          role="status"
          style={{
            maxWidth: '360px',
            width: '100%',
            marginBottom: '16px',
            padding: '12px',
            background: '#ECFDF5',
            color: '#065F46',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          회원가입이 완료되었습니다. 로그인해 주세요.
        </p>
      )}
      <LoginForm />
    </div>
  );
}
