'use client';

import { useRouter } from 'next/navigation';

// 青いアイコンコンポーネント
const FlowIcon = () => (
  <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg, #0d56c9 0%, #1e88e5 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  </div>
);

export default function FromTemplate() {
  const router = useRouter();

  const templates = [
    {
      id: 1,
      name: '実行予算作成',
      description: '工種コードから予算明細を作成',
      category: '予算',
      path: '/budget-form',
    },
    {
      id: 2,
      name: '実行予算登録',
      description: '作成した予算を登録し申請フローへ',
      category: '予算',
      path: '/budget',
    },
    {
      id: 3,
      name: '外注発注',
      description: '協力会社への発注・契約登録',
      category: '発注',
      path: '/order-contract',
    },
    {
      id: 4,
      name: '支払伝票入力',
      description: '請求書をOCR読取して支払伝票を作成',
      category: '支払',
      path: '/ocr',
    },
  ];

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#1a1c20' }}>機能テンプレート</h2>
      <p style={{ margin: '0 0 1.5rem 0', color: '#686e78', fontSize: '0.9rem' }}>
        業務フローを選択して新しい書類を作成します
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {templates.map((template) => (
          <div
            key={template.id}
            style={{ backgroundColor: '#fff', borderRadius: '0.625rem', boxShadow: '0px 10px 40px rgb(68 73 80 / 10%)', padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease', border: '2px solid transparent' }}
            onClick={() => router.push(template.path)}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0px 10px 30px rgba(68, 73, 80, 0.15)'; e.currentTarget.style.borderColor = '#0d56c9'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0px 10px 40px rgb(68 73 80 / 10%)'; e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <FlowIcon />
            </div>

            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1a1c20', marginBottom: '0.5rem' }}>{template.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#686e78', marginBottom: '1rem', lineHeight: 1.5 }}>{template.description}</div>

            <div>
              <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: '#e8f0fe', color: '#0d56c9', borderRadius: '1rem' }}>{template.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
