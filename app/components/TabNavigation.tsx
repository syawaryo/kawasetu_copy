"use client";

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function TabNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentUser } = useAuth();

  const isActive = (path: string) => pathname === path;
  const isApprovalHistory = pathname === '/history' && searchParams.get('user') === '3';
  const isApplicationHistory = pathname === '/history' && searchParams.get('user') !== '3';

  const linkStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.75rem 1.5rem',
    textDecoration: 'none',
    color: active ? '#0d56c9' : '#686e78',
    fontWeight: active ? 600 : 500,
    fontSize: '0.9rem',
    borderBottom: active ? '2px solid #0d56c9' : '2px solid transparent',
    transition: 'all 0.2s ease',
  });

  // 承認者かどうか
  const isApprover = currentUser?.role === 'manager';

  return (
    <nav style={{ backgroundColor: '#fff', borderBottom: '1px solid #dde5f4' }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '0.5rem' }}>
        <Link href="/" style={linkStyle(isActive('/'))}>
          Home
        </Link>
        <Link href="/my-storage" style={linkStyle(isActive('/my-storage'))}>
          マイストレージ
        </Link>
        <Link href="/history" style={linkStyle(isApplicationHistory || (isActive('/history') && !isApprovalHistory))}>
          申請履歴
        </Link>
        {isApprover && (
          <Link href="/history?user=3" style={linkStyle(isApprovalHistory)}>
            承認履歴
          </Link>
        )}
        <Link href="/from-template" style={linkStyle(isActive('/from-template'))}>
          テンプレートから作成
        </Link>
      </div>
    </nav>
  );
}
