// マスターデータの型
export type SubjectMaster = {
  code: string;
  name: string;
  category: string;
  budget: number;
};

// 書類タイプ
export type DocType = 'budget-ledger' | 'order-schedule' | 'order-inquiry' | 'quote-request' | 'vendor-quote' | 'progress-invoice';
export type DocStatus = 'not-started' | 'in-progress' | 'completed' | 'pdf-attached';

export interface DocItem {
  type: DocType;
  label: string;
  status: DocStatus;
  pdfFile?: File;
  pdfUrl?: string;
}

export const docMeta: Record<DocType, { label: string; description: string }> = {
  'budget-ledger': { label: '工事実行予算台帳', description: '予算・発注・残高管理' },
  'order-schedule': { label: '発注予定表', description: '発注スケジュール' },
  'order-inquiry': { label: '注文伺書', description: '発注内容確認' },
  'quote-request': { label: '見積依頼書', description: '業者への見積依頼' },
  'vendor-quote': { label: '業者見積書', description: 'PDF添付' },
  'progress-invoice': { label: '出来高請求書', description: 'PDF添付（任意）' },
};

export const statusLabels: Record<DocStatus, { label: string; color: string; bg: string }> = {
  'not-started': { label: '未着手', color: '#6b7280', bg: '#f3f4f6' },
  'in-progress': { label: '入力中', color: '#d97706', bg: '#fef3c7' },
  'completed': { label: '完了', color: '#059669', bg: '#d1fae5' },
  'pdf-attached': { label: 'PDF添付済', color: '#0d56c9', bg: '#dbeafe' },
};

export const initialDocs: DocItem[] = [
  { type: 'budget-ledger', label: '工事実行予算台帳', status: 'not-started' },
  { type: 'order-schedule', label: '発注予定表', status: 'not-started' },
  { type: 'order-inquiry', label: '注文伺書', status: 'not-started' },
  { type: 'quote-request', label: '見積依頼書', status: 'not-started' },
  { type: 'vendor-quote', label: '業者見積書', status: 'not-started' },
  { type: 'progress-invoice', label: '出来高請求書', status: 'not-started' },
];
