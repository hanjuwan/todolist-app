import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RegisterSchema } from '@/features/auth/auth.schemas';
import { useRegister } from '@/features/auth/hooks/use-register';
import { PasswordInput } from '@/shared/components/PasswordInput';

type FieldKey = 'email' | 'password' | 'passwordConfirm' | 'name';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { mutate, isPending } = useRegister();
  const [values, setValues] = useState({
    email: '',
    name: '',
    password: '',
    passwordConfirm: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  function set(field: FieldKey, v: string) {
    setValues((prev) => {
      const next = { ...prev, [field]: v };
      const parsed = RegisterSchema.safeParse(next);
      if (parsed.success) {
        setFieldErrors({});
      } else {
        const errs: Partial<Record<FieldKey, string>> = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as FieldKey;
          if (!errs[key]) errs[key] = issue.message;
        }
        setFieldErrors(errs);
      }
      return next;
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    const parsed = RegisterSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Partial<Record<FieldKey, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as FieldKey;
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }
    mutate(
      { email: parsed.data.email, password: parsed.data.password, name: parsed.data.name },
      {
        onSuccess: () => {
          navigate('/login', { state: { registered: true } });
        },
        onError: (err) => {
          if (err.status === 409 && err.code === 'EMAIL_DUPLICATED') {
            setFieldErrors((prev) => ({ ...prev, email: '이미 사용 중인 이메일입니다.' }));
          } else {
            setServerError(err.message || '회원가입 중 오류가 발생했습니다.');
          }
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} aria-label="회원가입 폼" noValidate>
      <h1>회원가입</h1>
      {serverError && (
        <div role="alert" data-testid="register-error">
          {serverError}
        </div>
      )}
      <div>
        <label htmlFor="reg-name">이름</label>
        <input
          id="reg-name"
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          aria-invalid={!!fieldErrors.name}
        />
        {fieldErrors.name && <p role="alert">{fieldErrors.name}</p>}
      </div>

      <div>
        <label htmlFor="reg-email">이메일</label>
        <input
          id="reg-email"
          type="email"
          value={values.email}
          onChange={(e) => set('email', e.target.value)}
          autoComplete="email"
          aria-invalid={!!fieldErrors.email}
        />
        {fieldErrors.email && <p role="alert">{fieldErrors.email}</p>}
      </div>

      <div>
        <label htmlFor="reg-password">비밀번호</label>
        <PasswordInput
          id="reg-password"
          value={values.password}
          onChange={(e) => set('password', e.target.value)}
          autoComplete="new-password"
          aria-invalid={!!fieldErrors.password}
        />
        {fieldErrors.password && <p role="alert">{fieldErrors.password}</p>}
      </div>

      <div>
        <label htmlFor="reg-password-confirm">비밀번호 확인</label>
        <PasswordInput
          id="reg-password-confirm"
          value={values.passwordConfirm}
          onChange={(e) => set('passwordConfirm', e.target.value)}
          autoComplete="new-password"
          aria-invalid={!!fieldErrors.passwordConfirm}
        />
        {fieldErrors.passwordConfirm && <p role="alert">{fieldErrors.passwordConfirm}</p>}
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? '가입 중...' : '가입하기'}
      </button>
      <p>
        이미 계정이 있으신가요? <Link to="/login">로그인하기</Link>
      </p>
    </form>
  );
}
