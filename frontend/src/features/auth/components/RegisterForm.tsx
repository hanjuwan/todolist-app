import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RegisterSchema } from '@/features/auth/auth.schemas';
import { useRegister } from '@/features/auth/hooks/use-register';
import { PasswordInput } from '@/shared/components/PasswordInput';
import { ApiError } from '@/shared/types';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
}

export function RegisterForm() {
  const [fields, setFields] = useState({ name: '', email: '', password: '', passwordConfirm: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');

  const register = useRegister();

  function getValidationErrors(): FieldErrors {
    const result = RegisterSchema.safeParse(fields);
    if (result.success) return {};
    const errs: FieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FieldErrors;
      if (!errs[field]) errs[field] = issue.message;
    }
    return errs;
  }

  const validationErrors = getValidationErrors();

  function visibleError(field: keyof FieldErrors): string | undefined {
    if (submitted || touched[field]) return validationErrors[field];
    return undefined;
  }

  function handleChange(field: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setFields((prev) => ({ ...prev, [field]: e.target.value }));
      setTouched((prev) => ({ ...prev, [field]: true }));
      if (field === 'email') setEmailError('');
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setEmailError('');

    const result = RegisterSchema.safeParse(fields);
    if (!result.success) return;

    register.mutate(
      { name: fields.name, email: fields.email, password: fields.password },
      {
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409 && err.code === 'EMAIL_DUPLICATED') {
            setEmailError('이미 사용 중인 이메일입니다.');
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
      <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px', color: 'var(--color-text)' }}>회원가입</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="name" style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: 'var(--color-text)' }}>
            이름
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={fields.name}
            onChange={handleChange('name')}
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
          {visibleError('name') && (
            <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>
              {visibleError('name')}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="email" style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: 'var(--color-text)' }}>
            이메일
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={fields.email}
            onChange={handleChange('email')}
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
          {(visibleError('email') || emailError) && (
            <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>
              {emailError || visibleError('email')}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="password" style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: 'var(--color-text)' }}>
            비밀번호
          </label>
          <PasswordInput
            id="password"
            name="password"
            value={fields.password}
            onChange={handleChange('password')}
            placeholder="8자 이상 입력해 주세요"
            aria-label="비밀번호"
          />
          {visibleError('password') && (
            <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>
              {visibleError('password')}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="passwordConfirm" style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: 'var(--color-text)' }}>
            비밀번호 확인
          </label>
          <PasswordInput
            id="passwordConfirm"
            name="passwordConfirm"
            value={fields.passwordConfirm}
            onChange={handleChange('passwordConfirm')}
            placeholder="비밀번호를 다시 입력해 주세요"
            aria-label="비밀번호 확인"
          />
          {visibleError('passwordConfirm') && (
            <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>
              {visibleError('passwordConfirm')}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={register.isPending}
          style={{
            width: '100%',
            padding: '10px',
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: register.isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {register.isPending ? '가입 중...' : '회원가입'}
        </button>
      </form>

      <p style={{ marginTop: '16px', fontSize: '14px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        이미 계정이 있으신가요?{' '}
        <Link to="/login" style={{ color: 'var(--color-primary)' }}>
          로그인
        </Link>
      </p>
    </div>
  );
}
