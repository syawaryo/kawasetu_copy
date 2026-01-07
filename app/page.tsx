'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function PortalPage() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [showGetStarted, setShowGetStarted] = useState(true);

  const quickActions = [
    { 
      id: 'tech', 
      icon: '✨', 
      title: '技術部はこちら',
      description: '技術部の機能へアクセス'
    },
    { 
      id: 'sales', 
      icon: '📋', 
      title: '営業部はこちら',
      description: '営業部の機能へアクセス'
    },
    { 
      id: 'management', 
      icon: '📄', 
      title: '経営部はこちら',
      description: '経営部の機能へアクセス'
    },
    { 
      id: 'task', 
      icon: '✓', 
      title: 'タスクトラッカーを作成する',
      description: 'タスク管理を開始'
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 送信処理をここに追加
    console.log('質問:', question);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff',
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ maxWidth: '900px', width: '100%' }}>
        {/* 上部アイコンとタイトル */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          marginBottom: '3rem',
          marginTop: '2rem'
        }}>
          {/* 社章 */}
          <div style={{ marginBottom: '1rem' }}>
            <Image
              src="/社章.png"
              alt="川崎設備工業"
              width={80}
              height={80}
              style={{ objectFit: 'contain', transform: 'scaleX(-1)' }}
            />
          </div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#1a1c20',
            margin: 0
          }}>
            川崎設備工業ポータル
          </h1>
        </div>

        {/* 検索欄 */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '3rem' }}>
          <div style={{
            position: 'relative',
            width: '100%',
            backgroundColor: '#fff',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0px 4px 20px rgba(68, 73, 80, 0.08)',
            overflow: 'hidden'
          }}>
            {/* 入力フィールド */}
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="質問や検索、何でも作成できます..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '1.5rem 4rem 1.5rem 1.5rem',
                fontSize: '1rem',
                border: 'none',
                borderRadius: '0.75rem',
                backgroundColor: 'transparent',
                boxSizing: 'border-box',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.5'
              }}
            />

            {/* 送信ボタン */}
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              right: '1rem'
            }}>
              <button
                type="submit"
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '0.375rem',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 2L8 14M8 14L2 8M8 14L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </form>

        {/* 今すぐ始めるセクション */}
        {showGetStarted && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#1a1c20',
                margin: 0
              }}>
                今すぐ始める
              </h2>
              <button
                onClick={() => setShowGetStarted(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px'
                }}
              >
                ×
              </button>
            </div>

            {/* クイックアクションカード */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {quickActions.map((action) => (
                <div
                  key={action.id}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0px 2px 8px rgba(68, 73, 80, 0.06)'
                  }}
                  onClick={() => {
                    if (action.id === 'tech') {
                      router.push('/function-master');
                    }
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0px 4px 12px rgba(68, 73, 80, 0.12)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0px 2px 8px rgba(68, 73, 80, 0.06)';
                  }}
                >
                  <div style={{
                    fontSize: '2rem',
                    marginBottom: '0.75rem'
                  }}>
                    {action.icon}
                  </div>
                  <div style={{
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    color: '#1a1c20',
                    marginBottom: '0.25rem'
                  }}>
                    {action.title}
                  </div>
                  <div style={{
                    fontSize: '0.8125rem',
                    color: '#6b7280'
                  }}>
                    {action.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
