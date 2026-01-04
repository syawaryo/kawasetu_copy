'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function PortalPage() {
  const [question, setQuestion] = useState('');
  const [showGetStarted, setShowGetStarted] = useState(true);

  const departments = [
    { id: 'tech', name: '技術部', href: '/function-master', color: '#0d56c9' },
    { id: 'sales', name: '営業部', href: '/function-master', color: '#10b981' },
    { id: 'management', name: '経営部', href: '/function-master', color: '#f59e0b' },
  ];

  const quickActions = [
    { 
      id: 'notion', 
      icon: '✨', 
      title: 'Notion AIの最新情報',
      description: '最新のAI機能を確認'
    },
    { 
      id: 'agenda', 
      icon: '📋', 
      title: '会議のアジェンダを作成する',
      description: '効率的な会議準備'
    },
    { 
      id: 'pdf', 
      icon: '📄', 
      title: 'PDFや画像の分析',
      description: 'ドキュメントを解析'
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
          <div style={{ marginBottom: '1.5rem' }}>
            <Image
              src="/社章.png"
              alt="川崎設備工業"
              width={80}
              height={80}
              style={{ objectFit: 'contain' }}
            />
          </div>
          
          {/* メイン質問 */}
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#1a1c20',
            margin: 0,
            textAlign: 'center',
            lineHeight: '1.2'
          }}>
            今日の目標は何ですか?
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
            {/* コンテキスト追加ボタン */}
            <div style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1
            }}>
              <button
                type="button"
                style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.875rem',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '0.375rem',
                  color: '#374151',
                  cursor: 'pointer',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                @ コンテキストを追加
              </button>
            </div>

            {/* 入力フィールド */}
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="質問や検索、何でも作成できます..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '1.5rem 4rem 4rem 10rem',
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

            {/* 下部ツールバー */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#fafafa'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                  🔗 自動
                </span>
                <span style={{ cursor: 'pointer' }}>○○ リサーチ</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                  🌐 すべてのソース
                </span>
              </div>
              
              {/* 送信ボタン */}
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

        {/* 部門リンク */}
        <div style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          justifyContent: 'center', 
          flexWrap: 'wrap',
          marginTop: '3rem'
        }}>
          {departments.map((dept) => (
            <Link
              key={dept.id}
              href={dept.href}
              style={{
                textDecoration: 'none',
                backgroundColor: '#fff',
                borderRadius: '0.625rem',
                boxShadow: '0px 4px 20px rgb(68 73 80 / 8%)',
                padding: '1.5rem 2.5rem',
                border: '2px solid transparent',
                transition: 'all 0.2s ease',
                textAlign: 'center',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = dept.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1c20' }}>{dept.name}はこちら</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
