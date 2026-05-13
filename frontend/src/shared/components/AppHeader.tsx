import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { logout } from '@/features/auth/api/auth-api';

export default function AppHeader() {
  const navigate = useNavigate();
  const clearToken = useAuthStore((s) => s.clearToken);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // 서버 실패해도 클라이언트는 로그아웃 처리
    }
    clearToken();
    navigate('/login');
  }

  return (
    <header data-testid="app-header">
      <strong>TodoListApp</strong>
      <nav aria-label="주요 메뉴">
        <Link to="/todos">할일 목록</Link>
        <Link to="/categories">카테고리</Link>
        <Link to="/mypage">마이페이지</Link>
        <button type="button" onClick={handleLogout} data-testid="logout-btn">
          로그아웃
        </button>
      </nav>
    </header>
  );
}
