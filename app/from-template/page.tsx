'use client';

import { useRouter } from 'next/navigation';

// ファイルタイプアイコンコンポーネント（大きめ）
const FileIcon = ({ type }: { type: string }) => {
  const getColor = () => {
    switch (type) {
      case 'excel': return '#217346';
      case 'pdf': return '#dc3545';
      default: return '#686e78';
    }
  };

  const getText = () => {
    switch (type) {
      case 'excel': return 'XLS';
      case 'pdf': return 'PDF';
      default: return 'DOC';
    }
  };

  return (
    <div style={{ width: 56, height: 56, borderRadius: 8, backgroundColor: getColor(), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
      {getText()}
    </div>
  );
};

export default function FromTemplate() {
  const router = useRouter();

  const templates = [
    {
      id: 1,
      name: '工事申請書.xlsx',
      description: '新規工事の申請に使用するテンプレート',
      category: '工事',
      type: 'excel',
      date: '2024-11-15',
    },
    {
      id: 2,
      name: '機材購入申請書.xlsx',
      description: '新規機材の購入申請に使用するテンプレート',
      category: '購入',
      type: 'excel',
      date: '2024-11-10',
    },
    {
      id: 3,
      name: '保守点検報告書.pdf',
      description: '定期保守点検の報告に使用するテンプレート',
      category: '保守',
      type: 'pdf',
      date: '2024-11-08',
    },
    {
      id: 4,
      name: '修理依頼書.xlsx',
      description: '設備修理の依頼に使用するテンプレート',
      category: '修理',
      type: 'excel',
      date: '2024-11-05',
    },
    {
      id: 5,
      name: '予算書.xlsx',
      description: 'プロジェクト予算の作成に使用するテンプレート',
      category: '予算',
      type: 'excel',
      date: '2024-11-12',
    },
    {
      id: 6,
      name: '支払伝票入力',
      description: '請求書をOCR読取して支払伝票を作成',
      category: '支払',
      type: 'pdf',
      date: '2024-12-01',
    },
  ];

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#1a1c20' }}>テンプレートから作成</h2>
      <p style={{ margin: '0 0 1.5rem 0', color: '#686e78', fontSize: '0.9rem' }}>
        テンプレートを選択して新しい書類を作成します
      </p>

      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="テンプレートを検索..."
          style={{ width: '100%', maxWidth: '400px', padding: '0.75rem 1rem', fontSize: '0.9rem', border: '1px solid #dde5f4', borderRadius: '0.5rem', backgroundColor: '#fff' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {templates.map((template) => (
          <div
            key={template.id}
            style={{ backgroundColor: '#fff', borderRadius: '0.625rem', boxShadow: '0px 10px 40px rgb(68 73 80 / 10%)', padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease', border: '2px solid transparent' }}
            onClick={() => {
              if (template.name === '予算書.xlsx') {
                router.push('/budget-form');
              } else if (template.name === '支払伝票入力') {
                router.push('/ocr');
              } else {
                router.push('/excel-make');
              }
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0px 10px 30px rgba(68, 73, 80, 0.15)'; e.currentTarget.style.borderColor = '#0d56c9'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0px 10px 40px rgb(68 73 80 / 10%)'; e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <FileIcon type={template.type} />
            </div>

            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1a1c20', marginBottom: '0.5rem' }}>{template.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#686e78', marginBottom: '1rem', lineHeight: 1.5 }}>{template.description}</div>

            <div>
              <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: '#f0f2f7', color: '#686e78', borderRadius: '1rem' }}>{template.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
