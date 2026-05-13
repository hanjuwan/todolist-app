import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LoginSchema } from '@/features/auth/auth.schemas';
import { useLogin } from '@/features/auth/hooks/use-login';
import { PasswordInput } from '@/shared/components/PasswordInput';

export default function LoginForm() {
  const navigate = useNavigate();
  const { mutate, isPending } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'email' | 'password', string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    const parsed = LoginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errs: Partial<Record<'email' | 'password', string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as 'email' | 'password';
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    mutate(parsed.data, {
      onSuccess: () => navigate('/todos'),
      onError: (err) => {
        if (err.status === 401) {
          setServerError('이메일 또는 비밀번호가 올바르지 않습니다.');
          setPassword('');
        } else {
          setServerError(err.message || '로그인 중 오류가 발생했습니다.');
        }
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} aria-label="로그인 폼" noValidate>
      <h1>로그인</h1>
      {serverError && (
        <div role="alert" data-testid="login-error">
          {serverError}
        </div>
      )}
      <div>
        <label htmlFor="login-email">이메일</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          aria-invalid={!!fieldErrors.email}
        />
        {fieldErrors.email && <p role="alert">{fieldErrors.email}</p>}
      </div>

      <div>
        <label htmlFor="login-password">비밀번호</label>
        <PasswordInput
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          aria-invalid={!!fieldErrors.password}
        />
        {fieldErrors.password && <p role="alert">{fieldErrors.password}</p>}
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? '로그인 중...' : '로그인하기'}
      </button>
      <p>
        계정이 없으신가요? <Link to="/register">회원가입하기</Link>
      </p>
    </form>
  );
}
