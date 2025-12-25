"use client";

import { DocType, DocItem } from "../types";

interface DocumentTabsProps {
  docTab: DocType | 'order';
  setDocTab: (tab: DocType | 'order') => void;
  docs: DocItem[];
}

export default function DocumentTabs({ docTab, setDocTab, docs }: DocumentTabsProps) {
  return (
    <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #dde5f4' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '0' }}>
        <button
          onClick={() => setDocTab('order')}
          style={{
            padding: '0.75rem 1.25rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            backgroundColor: '#fff',
            color: docTab === 'order' ? '#0d56c9' : '#686e78',
            border: 'none',
            borderBottom: docTab === 'order' ? '2px solid #0d56c9' : '2px solid transparent',
            cursor: 'pointer',
          }}
        >
          発注登録
        </button>
        {docs.map(doc => (
          <button
            key={doc.type}
            onClick={() => setDocTab(doc.type)}
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: '#fff',
              color: docTab === doc.type ? '#0d56c9' : '#686e78',
              border: 'none',
              borderBottom: docTab === doc.type ? '2px solid #0d56c9' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            {doc.label}
            {(doc.status === 'completed' || doc.status === 'pdf-attached') && (
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
