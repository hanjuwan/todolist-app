import { AppHeader } from '@/shared/components/AppHeader';
import { useMe } from '@/features/users/hooks/use-me';
import { ProfileForm } from '@/features/users/components/ProfileForm';
import { WithdrawSection } from '@/features/users/components/WithdrawSection';

export default function MyPage() {
  const { data, isLoading, isError } = useMe();

  return (
    <div data-testid="mypage">
      <AppHeader />
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 24px' }}>
          마이페이지
        </h1>
        {isLoading && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>불러오는 중...</p>
        )}
        {isError && (
          <p style={{ color: 'var(--color-danger)', fontSize: '14px' }}>정보를 불러오지 못했습니다.</p>
        )}
        {data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ProfileForm user={data} />
            <WithdrawSection />
          </div>
        )}
      </div>
    </div>
  );
}
