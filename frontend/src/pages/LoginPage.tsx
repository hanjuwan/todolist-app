import { useLocation } from 'react-router-dom';
import LoginForm from '@/features/auth/components/LoginForm';

interface LocationState {
  registered?: boolean;
}

export default function LoginPage() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  return (
    <div data-testid="page-login">
      {state?.registered && (
        <div role="status" data-testid="register-success-banner">
          회원가입이 완료되었습니다. 로그인해 주세요.
        </div>
      )}
      <LoginForm />
    </div>
  );
}
