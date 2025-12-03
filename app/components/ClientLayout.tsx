'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TabNavigation from './TabNavigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // ログインページ以外で未認証ならリダイレクト
  useEffect(() => {
    if (!isAuthenticated && pathname !== '/login') {
      router.replace('/login');
    }
  }, [isAuthenticated, pathname, router]);

  // ログインページは独自レイアウト
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // 未認証時はローディング表示（リダイレクト待ち）
  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p style={{ color: '#686e78', fontSize: '1rem' }}>読み込み中...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: '#132942', color: '#fff', padding: '1rem 0' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>川崎設備工業管理システム</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{currentUser?.name}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                {currentUser?.department}
                {currentUser?.role === 'manager' && ' (承認者)'}
              </div>
            </div>
            <button style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: '#fff', borderRadius: '0.375rem', cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={handleLogout} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = '#fff'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }}>
              ログアウト
            </button>
          </div>
        </div>
      </header>
      <TabNavigation />
      <main style={{ flex: 1, maxWidth: '1160px', margin: '0 auto', padding: '2rem 24px', width: '100%' }}>
        {children}
      </main>
    </div>
  );
}
