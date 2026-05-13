import { useEffect, useState } from 'react';
import AppHeader from '@/shared/components/AppHeader';
import ProfileForm from '@/features/users/components/ProfileForm';
import WithdrawSection from '@/features/users/components/WithdrawSection';
import { useMe } from '@/features/users/hooks/use-me';

export default function MyPage() {
  const { data: user, isLoading, isError, error } = useMe();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div data-testid="page-mypage">
      <AppHeader />
      <h1>마이페이지</h1>

      {toast && (
        <div role="status" data-testid="profile-toast">
          {toast}
        </div>
      )}

      {isLoading && <p data-testid="mypage-loading">불러오는 중...</p>}
      {isError && (
        <p role="alert" data-testid="mypage-error">
          {error?.message || '사용자 정보를 불러올 수 없습니다.'}
        </p>
      )}

      {user && (
        <>
          <ProfileForm user={user} onSuccess={() => setToast('수정이 완료되었습니다.')} />
          <WithdrawSection />
        </>
      )}
    </div>
  );
}
