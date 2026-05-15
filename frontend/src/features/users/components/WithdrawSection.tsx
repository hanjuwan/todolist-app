import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PasswordInput } from '@/shared/components/PasswordInput';
import { withdrawAccount } from '@/features/users/api/users-api';
import { useAuthStore } from '@/features/auth/store/auth-store';
import type { ApiError } from '@/shared/types';

const CONFIRM_PHRASE = '탈퇴합니다';

export function WithdrawSection() {
  const navigate = useNavigate();
  const clearToken = useAuthStore((s) => s.clearToken);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!dialogOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dialogOpen]);

  function handleClose() {
    setDialogOpen(false);
    setConfirmText('');
    setPassword('');
    setError('');
  }

  const canSubmit = confirmText === CONFIRM_PHRASE && password.length > 0;

  async function handleWithdraw() {
    if (!canSubmit) return;
    setIsLoading(true);
    setError('');
    try {
      await withdrawAccount(password);
      clearToken();
      navigate('/login', { state: { withdrawn: true } });
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.code === 'INVALID_CURRENT_PASSWORD') {
        setError('현재 비밀번호가 올바르지 않습니다.');
      } else {
        setError('회원 탈퇴 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div
        style={{
          border: '1px solid var(--color-warning-soft-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          background: 'var(--color-warning-soft-bg)',
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 8px' }}>
          위험 구역
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: '0 0 16px', lineHeight: 1.6 }}>
          회원 탈퇴 시 계정과 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
        </p>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          style={{
            height: '40px',
            padding: '0 20px',
            background: 'var(--color-danger)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          회원 탈퇴
        </button>
      </div>

      {dialogOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdraw-dialog-title"
            style={{
              background: 'var(--color-bg)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              padding: '28px',
              width: '400px',
              maxWidth: 'calc(100vw - 32px)',
            }}
          >
            <h2
              id="withdraw-dialog-title"
              style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 12px' }}
            >
              회원 탈퇴
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: '0 0 20px', lineHeight: 1.6 }}>
              탈퇴를 계속하려면 아래에 '{CONFIRM_PHRASE}'를 정확히 입력해 주세요.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="withdraw-confirm-text"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}
              >
                확인 문구 입력
              </label>
              <input
                id="withdraw-confirm-text"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                aria-label="탈퇴 확인 문구"
                placeholder={CONFIRM_PHRASE}
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
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="withdraw-password"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}
              >
                현재 비밀번호
              </label>
              <PasswordInput
                id="withdraw-password"
                name="withdraw-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="탈퇴 비밀번호"
              />
              {error && (
                <p style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{error}</p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                style={{
                  height: '38px',
                  padding: '0 16px',
                  border: '1px solid var(--color-border-strong)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text-muted)',
                  fontSize: '14px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={!canSubmit || isLoading}
                style={{
                  height: '38px',
                  padding: '0 16px',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  background: canSubmit && !isLoading ? 'var(--color-danger)' : 'var(--color-border)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: !canSubmit || isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
