'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, currentUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ログインページ以外で未認証ならリダイレクト
    if (!isAuthenticated && pathname !== '/login') {
      router.replace('/login');
    }
  }, [isAuthenticated, pathname, router]);

  // ログインページはそのまま表示
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // 未認証の場合は何も表示しない（リダイレクト待ち）
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
