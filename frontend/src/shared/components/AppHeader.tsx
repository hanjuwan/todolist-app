import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';

export function AppHeader() {
  const clearToken = useAuthStore((s) => s.clearToken);
  const navigate = useNavigate();

  function handleLogout() {
    clearToken();
    navigate('/login');
  }

  return (
    <header
      style={{
        height: '64px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: '24px',
      }}
    >
      <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--color-text)', marginRight: 'auto' }}>
        TodoListApp
      </span>
      <nav style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Link
          to="/todos"
          style={{ fontSize: '14px', color: 'var(--color-text)', textDecoration: 'none', fontWeight: 500 }}
        >
          할일 목록
        </Link>
        <Link
          to="/categories"
          style={{ fontSize: '14px', color: 'var(--color-text)', textDecoration: 'none', fontWeight: 500 }}
        >
          카테고리
        </Link>
        <Link
          to="/mypage"
          style={{ fontSize: '14px', color: 'var(--color-text)', textDecoration: 'none', fontWeight: 500 }}
        >
          마이페이지
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            height: '36px',
            padding: '0 16px',
            border: '1px solid var(--color-border-strong)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg)',
            color: 'var(--color-text-muted)',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          로그아웃
        </button>
      </nav>
    </header>
  );
}
