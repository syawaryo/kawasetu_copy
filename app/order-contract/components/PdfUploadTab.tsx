"use client";

import { DocType, DocItem } from "../types";

interface PdfUploadTabProps {
  docType: DocType;
  docs: DocItem[];
  onUploadClick: () => void;
}

export default function PdfUploadTab({
  docType,
  docs,
  onUploadClick,
}: PdfUploadTabProps) {
  const doc = docs.find(d => d.type === docType);
  const title = docType === 'vendor-quote' ? '業者見積書' : '出来高請求書';

  return (
    <div>
      <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1c20', marginBottom: '1rem' }}>
        {title}
      </p>
      {doc?.pdfUrl ? (
        <div>
          <iframe
            src={doc.pdfUrl}
            style={{ width: '100%', height: '500px', border: '1px solid #dde5f4', borderRadius: '0.5rem', marginBottom: '1rem' }}
          />
          <button
            onClick={onUploadClick}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: '#6b7280', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
          >
            PDFを変更
          </button>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '0.85rem', color: '#686e78', marginBottom: '1rem' }}>PDFファイルを添付してください</p>
          <button
            onClick={onUploadClick}
            style={{ padding: '0.75rem 2rem', fontSize: '0.9rem', fontWeight: 600, backgroundColor: '#0d56c9', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
          >
            PDF添付
          </button>
        </div>
      )}
    </div>
  );
}
