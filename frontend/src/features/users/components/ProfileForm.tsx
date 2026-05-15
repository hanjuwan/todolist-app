import { useState } from 'react';
import { PasswordInput } from '@/shared/components/PasswordInput';
import { UpdateProfileSchema } from '@/features/users/users.schemas';
import { updateProfile } from '@/features/users/api/users-api';
import type { User } from '@/features/users/types/user.types';
import type { ApiError } from '@/shared/types';

interface ProfileFormProps {
  user: User;
}

interface FormErrors {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  newPasswordConfirm?: string;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const passwordEmpty = !currentPassword && !newPassword && !newPasswordConfirm;

    const parseResult = UpdateProfileSchema.safeParse({
      name: name !== user.name ? name : undefined,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined,
      newPasswordConfirm: newPasswordConfirm || undefined,
    });

    if (!parseResult.success) {
      const newErrors: FormErrors = {};
      for (const issue of parseResult.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        if (!newErrors[field]) {
          newErrors[field] = issue.message;
        }
      }
      setErrors(newErrors);
      return;
    }

    const payload: { name?: string; currentPassword?: string; newPassword?: string } = {};

    if (name !== user.name) {
      payload.name = name;
    }

    if (!passwordEmpty) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    if (Object.keys(payload).length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile(payload);
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.code === 'INVALID_CURRENT_PASSWORD') {
        setErrors({ currentPassword: '현재 비밀번호가 올바르지 않습니다.' });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
      }}
    >
      {toast && (
        <div
          role="status"
          data-testid="profile-toast"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'var(--color-accent-soft-bg)',
            color: 'var(--color-accent-hover)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
          }}
        >
          변경사항이 저장되었습니다.
        </div>
      )}

      <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 20px' }}>
        프로필 편집
      </h2>

      <form noValidate onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="email"
            style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}
          >
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={user.email}
            readOnly
            style={{
              width: '100%',
              height: '40px',
              padding: '0 12px',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              color: 'var(--color-text-muted)',
              background: 'var(--color-surface)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="name"
            style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}
          >
            이름
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            style={{
              width: '100%',
              height: '40px',
              padding: '0 12px',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              color: 'var(--color-text)',
              boxSizing: 'border-box',
            }}
          />
          {errors.name && (
            <p style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.name}</p>
          )}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="currentPassword"
            style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}
          >
            현재 비밀번호
          </label>
          <PasswordInput
            id="currentPassword"
            name="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="비밀번호 변경하지 않으려면 비워두세요"
            aria-label="현재 비밀번호"
          />
          {errors.currentPassword && (
            <p style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.currentPassword}</p>
          )}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="newPassword"
            style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}
          >
            새 비밀번호
          </label>
          <PasswordInput
            id="newPassword"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            aria-label="새 비밀번호"
          />
          {errors.newPassword && (
            <p style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.newPassword}</p>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label
            htmlFor="newPasswordConfirm"
            style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}
          >
            새 비밀번호 확인
          </label>
          <PasswordInput
            id="newPasswordConfirm"
            name="newPasswordConfirm"
            value={newPasswordConfirm}
            onChange={(e) => setNewPasswordConfirm(e.target.value)}
            aria-label="새 비밀번호 확인"
          />
          {errors.newPasswordConfirm && (
            <p style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.newPasswordConfirm}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            height: '40px',
            padding: '0 20px',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          저장
        </button>
      </form>
    </div>
  );
}
