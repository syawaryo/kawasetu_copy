'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TabNavigation from './TabNavigation';
import Breadcrumb from './Breadcrumb';

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f6f8' }}>
      <header style={{ backgroundColor: '#1a365d', color: '#fff', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>
              KS
            </div>
            <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '0.02em' }}>川崎設備工業</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>
                {currentUser?.name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{currentUser?.name}</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>
                  {currentUser?.department}{currentUser?.role === 'manager' && ' / 承認者'}
                </div>
              </div>
            </div>
            <button
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'rgba(255,255,255,0.9)',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onClick={handleLogout}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>
      <TabNavigation />
      <Breadcrumb />
      <main style={{ flex: 1, maxWidth: '1160px', margin: '0 auto', padding: '2rem 24px', width: '100%' }}>
        {children}
      </main>
    </div>
  );
}
