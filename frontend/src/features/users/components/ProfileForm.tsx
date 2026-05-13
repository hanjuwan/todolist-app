import { useEffect, useState, type FormEvent } from 'react';
import { UpdateProfileSchema } from '@/features/users/users.schemas';
import { useUpdateProfile } from '@/features/users/hooks/use-me';
import { PasswordInput } from '@/shared/components/PasswordInput';
import type { User } from '@/features/users/types/user.types';

interface Props {
  user: User;
  onSuccess?: () => void;
}

type FieldKey = 'name' | 'currentPassword' | 'newPassword' | 'newPasswordConfirm';

export default function ProfileForm({ user, onSuccess }: Props) {
  const [values, setValues] = useState({
    name: user.name,
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const update = useUpdateProfile();

  useEffect(() => {
    setValues((v) => ({ ...v, name: user.name }));
  }, [user.name]);

  function set(field: FieldKey, v: string) {
    setValues((p) => ({ ...p, [field]: v }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    const wantsPasswordChange =
      values.currentPassword.length > 0 || values.newPassword.length > 0;
    const payload: {
      name?: string;
      currentPassword?: string;
      newPassword?: string;
      newPasswordConfirm?: string;
    } = {};
    if (values.name !== user.name) payload.name = values.name;
    if (wantsPasswordChange) {
      payload.currentPassword = values.currentPassword;
      payload.newPassword = values.newPassword;
      payload.newPasswordConfirm = values.newPasswordConfirm;
    }
    const parsed = UpdateProfileSchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Partial<Record<FieldKey, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as FieldKey;
        if (!errs[k]) errs[k] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    const body: { name?: string; currentPassword?: string; newPassword?: string } = {};
    if (parsed.data.name !== undefined) body.name = parsed.data.name;
    if (parsed.data.newPassword !== undefined) {
      body.currentPassword = parsed.data.currentPassword;
      body.newPassword = parsed.data.newPassword;
    }

    if (Object.keys(body).length === 0) {
      setServerError('변경할 항목이 없습니다.');
      return;
    }

    update.mutate(body, {
      onSuccess: () => {
        setValues((v) => ({ ...v, currentPassword: '', newPassword: '', newPasswordConfirm: '' }));
        onSuccess?.();
      },
      onError: (err) => {
        if (err.status === 401 && err.code === 'INVALID_CURRENT_PASSWORD') {
          setFieldErrors({ currentPassword: '현재 비밀번호가 올바르지 않습니다.' });
        } else {
          setServerError(err.message || '수정 중 오류가 발생했습니다.');
        }
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} aria-label="개인정보 수정 폼" noValidate>
      <h2>개인정보 수정</h2>
      {serverError && (
        <div role="alert" data-testid="profile-error">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="profile-email">이메일</label>
        <input id="profile-email" type="email" value={user.email} readOnly aria-readonly />
      </div>

      <div>
        <label htmlFor="profile-name">이름</label>
        <input
          id="profile-name"
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          aria-invalid={!!fieldErrors.name}
        />
        {fieldErrors.name && <p role="alert">{fieldErrors.name}</p>}
      </div>

      <fieldset>
        <legend>비밀번호 변경 (선택)</legend>
        <div>
          <label htmlFor="profile-current-pw">현재 비밀번호</label>
          <PasswordInput
            id="profile-current-pw"
            value={values.currentPassword}
            onChange={(e) => set('currentPassword', e.target.value)}
            autoComplete="current-password"
            aria-invalid={!!fieldErrors.currentPassword}
          />
          {fieldErrors.currentPassword && <p role="alert">{fieldErrors.currentPassword}</p>}
        </div>
        <div>
          <label htmlFor="profile-new-pw">새 비밀번호</label>
          <PasswordInput
            id="profile-new-pw"
            value={values.newPassword}
            onChange={(e) => set('newPassword', e.target.value)}
            autoComplete="new-password"
            aria-invalid={!!fieldErrors.newPassword}
          />
          {fieldErrors.newPassword && <p role="alert">{fieldErrors.newPassword}</p>}
        </div>
        <div>
          <label htmlFor="profile-new-pw-confirm">새 비밀번호 확인</label>
          <PasswordInput
            id="profile-new-pw-confirm"
            value={values.newPasswordConfirm}
            onChange={(e) => set('newPasswordConfirm', e.target.value)}
            autoComplete="new-password"
            aria-invalid={!!fieldErrors.newPasswordConfirm}
          />
          {fieldErrors.newPasswordConfirm && (
            <p role="alert">{fieldErrors.newPasswordConfirm}</p>
          )}
        </div>
      </fieldset>

      <button type="submit" disabled={update.isPending} data-testid="profile-save-btn">
        {update.isPending ? '저장 중...' : '저장'}
      </button>
    </form>
  );
}
