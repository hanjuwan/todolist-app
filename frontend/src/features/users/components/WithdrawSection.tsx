import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWithdraw } from '@/features/users/hooks/use-me';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { PasswordInput } from '@/shared/components/PasswordInput';

const CONFIRM_PHRASE = '탈퇴합니다';

export default function WithdrawSection() {
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const clearToken = useAuthStore((s) => s.clearToken);
  const withdraw = useWithdraw();

  const canConfirm = phrase === CONFIRM_PHRASE && password.length > 0;

  function openDialog() {
    setPhrase('');
    setPassword('');
    setError(null);
    setOpen(true);
  }

  function performWithdraw() {
    setError(null);
    withdraw.mutate(
      { currentPassword: password },
      {
        onSuccess: () => {
          clearToken();
          navigate('/login', { state: { withdrawn: true } });
        },
        onError: (err) => {
          if (err.status === 401) {
            setError('비밀번호가 올바르지 않습니다.');
          } else {
            setError(err.message || '탈퇴 중 오류가 발생했습니다.');
          }
        },
      },
    );
  }

  return (
    <section aria-label="회원 탈퇴" data-testid="withdraw-section">
      <h2>회원 탈퇴</h2>
      <p>탈퇴 시 모든 할일과 사용자 카테고리가 즉시 삭제되며, 복구할 수 없습니다.</p>
      <button type="button" onClick={openDialog} data-testid="withdraw-open-btn">
        회원 탈퇴
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="withdraw-dialog-title"
          data-testid="withdraw-dialog"
        >
          <h3 id="withdraw-dialog-title">정말 탈퇴하시겠습니까?</h3>
          <p>
            아래 칸에 <strong>{CONFIRM_PHRASE}</strong>를 정확히 입력하고 현재 비밀번호를 입력하세요.
          </p>
          <div>
            <label htmlFor="withdraw-phrase">확인 문구</label>
            <input
              id="withdraw-phrase"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              data-testid="withdraw-phrase-input"
            />
          </div>
          <div>
            <label htmlFor="withdraw-password">현재 비밀번호 (탈퇴 확인)</label>
            <PasswordInput
              id="withdraw-password"
              data-testid="withdraw-password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p role="alert" data-testid="withdraw-error">
              {error}
            </p>
          )}
          <div>
            <button type="button" onClick={() => setOpen(false)} data-testid="withdraw-cancel-btn">
              취소
            </button>
            <button
              type="button"
              onClick={performWithdraw}
              disabled={!canConfirm || withdraw.isPending}
              data-testid="withdraw-confirm-btn"
            >
              {withdraw.isPending ? '처리 중...' : '탈퇴하기'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
