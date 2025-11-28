'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // 既にログイン済みならリダイレクト
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // 少し待ってログイン処理（UX向上のため）
    await new Promise(resolve => setTimeout(resolve, 300));

    const result = login(code);
    if (result.success) {
      router.replace('/');
    } else {
      setError(result.error || 'ログインに失敗しました');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f7', padding: '1rem' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', boxShadow: '0px 10px 40px rgb(68 73 80 / 10%)', padding: '2.5rem', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 700, color: '#132942' }}>川崎設備管理システム</h1>
          <p style={{ margin: 0, color: '#686e78', fontSize: '0.9rem' }}>ログインコードを入力してください</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="code" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: '#1a1c20' }}>
              ログインコード
            </label>
            <input
              id="code"
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError('');
              }}
              placeholder="4桁のコードを入力"
              maxLength={4}
              style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', textAlign: 'center', letterSpacing: '0.5rem', border: error ? '2px solid #dc3545' : '1px solid #dde5f4', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.2s ease', boxSizing: 'border-box' }}
              autoFocus
              autoComplete="off"
            />
            {error && <p style={{ margin: '0.5rem 0 0 0', color: '#dc3545', fontSize: '0.85rem' }}>{error}</p>}
          </div>

          <button
            type="submit"
            disabled={code.length !== 4 || isSubmitting}
            style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 600, backgroundColor: code.length !== 4 || isSubmitting ? '#ccc' : '#0d56c9', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: code.length !== 4 || isSubmitting ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s ease' }}
          >
            {isSubmitting ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, fontSize: '0.8rem', color: '#686e78' }}>デモ用ログインコード:</p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#686e78', lineHeight: 1.8 }}>
            <li>田中 太郎（工事部）: 1234</li>
            <li>鈴木 花子（設備課）: 5678</li>
            <li>山田 部長（工事部）: 9999</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
