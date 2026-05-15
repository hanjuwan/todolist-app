import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LoginSchema } from '@/features/auth/auth.schemas';
import { useLogin } from '@/features/auth/hooks/use-login';
import { PasswordInput } from '@/shared/components/PasswordInput';
import { ApiError } from '@/shared/types';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState('');

  const login = useLogin();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    const result = LoginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as 'email' | 'password';
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    login.mutate(
      { email, password },
      {
        onError: (err) => {
          if (err instanceof ApiError && err.status === 401 && err.code === 'INVALID_CREDENTIALS') {
            setFormError('이메일 또는 비밀번호가 올바르지 않습니다.');
            setPassword('');
          }
        },
      },
    );
  }

  return (
    <div
      style={{
        maxWidth: '360px',
        margin: '0 auto',
        padding: '32px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-strong)',
        background: '#fff',
      }}
    >
      <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px', color: 'var(--color-text)' }}>로그인</h1>

      {formError && (
        <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '14px', marginBottom: '16px' }}>
          {formError}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="email" style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: 'var(--color-text)' }}>
            이메일
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              color: 'var(--color-text)',
              boxSizing: 'border-box',
            }}
          />
          {errors.email && (
            <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>
              {errors.email}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="password" style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: 'var(--color-text)' }}>
            비밀번호
          </label>
          <PasswordInput
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력해 주세요"
            aria-label="비밀번호"
          />
          {errors.password && (
            <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={login.isPending}
          style={{
            width: '100%',
            padding: '10px',
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: login.isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {login.isPending ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p style={{ marginTop: '16px', fontSize: '14px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        계정이 없으신가요?{' '}
        <Link to="/register" style={{ color: 'var(--color-primary)' }}>
          회원가입
        </Link>
      </p>
    </div>
  );
}
