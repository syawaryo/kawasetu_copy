"use client";

import { useState } from "react";
import { DEMO_USERS, User } from "../../contexts/AuthContext";
import { OrderData, OrderHeader } from "../../contexts/OrderDataContext";
import { DocItem } from "../types";

interface SubmissionModalProps {
  showModal: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  header: OrderHeader;
  setHeader: (updater: OrderHeader | ((h: OrderHeader) => OrderHeader)) => void;
  orders: OrderData[];
  docs: DocItem[];
  ledgerPdfUrl: string | null;
  selectedApprover: string;
  setSelectedApprover: (id: string) => void;
}

export default function SubmissionModal({
  showModal,
  onClose,
  onSubmit,
  isSubmitting,
  isSubmitted,
  header,
  setHeader,
  orders,
  docs,
  ledgerPdfUrl,
  selectedApprover,
  setSelectedApprover,
}: SubmissionModalProps) {
  const [activeTab, setActiveTab] = useState<string>('budget');
  const approvers = DEMO_USERS.filter(u => u.role === 'manager');

  if (!showModal) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', width: '95%', maxWidth: '1000px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #dde5f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#1a1c20' }}>発注契約 申請確認</h2>
          <button style={{ width: 32, height: 32, border: 'none', backgroundColor: 'transparent', fontSize: '1.5rem', cursor: 'pointer', color: '#686e78' }} onClick={onClose}>×</button>
        </div>

        {isSubmitted ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ padding: '1rem', backgroundColor: '#d1fae5', borderRadius: '0.5rem', color: '#065f46', fontSize: '0.95rem' }}>
              申請が完了しました。承認者に通知されました。
            </div>
          </div>
        ) : (
          <>
            {/* タブ */}
            <div style={{ display: 'flex', borderBottom: '1px solid #dde5f4', overflowX: 'auto' }}>
              <button onClick={() => setActiveTab('budget')} style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 600, border: 'none', backgroundColor: '#fff', color: activeTab === 'budget' ? '#0d56c9' : '#686e78', borderBottom: activeTab === 'budget' ? '2px solid #0d56c9' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}>工事実行予算台帳</button>
              <button onClick={() => setActiveTab('schedule')} style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 600, border: 'none', backgroundColor: '#fff', color: activeTab === 'schedule' ? '#0d56c9' : '#686e78', borderBottom: activeTab === 'schedule' ? '2px solid #0d56c9' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}>発注予定表</button>
              {orders.map((_, idx) => (
                <button key={`order-${idx}`} onClick={() => setActiveTab(`order-${idx}`)} style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 600, border: 'none', backgroundColor: '#fff', color: activeTab === `order-${idx}` ? '#0d56c9' : '#686e78', borderBottom: activeTab === `order-${idx}` ? '2px solid #0d56c9' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}>注文伺書({idx + 1})</button>
              ))}
              <button onClick={() => setActiveTab('quote-request')} style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 600, border: 'none', backgroundColor: '#fff', color: activeTab === 'quote-request' ? '#0d56c9' : '#686e78', borderBottom: activeTab === 'quote-request' ? '2px solid #0d56c9' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}>見積依頼書</button>
              <button onClick={() => setActiveTab('vendor-quote')} style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 600, border: 'none', backgroundColor: '#fff', color: activeTab === 'vendor-quote' ? '#0d56c9' : '#686e78', borderBottom: activeTab === 'vendor-quote' ? '2px solid #0d56c9' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}>業者見積書</button>
              <button onClick={() => setActiveTab('progress-invoice')} style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 600, border: 'none', backgroundColor: '#fff', color: activeTab === 'progress-invoice' ? '#0d56c9' : '#686e78', borderBottom: activeTab === 'progress-invoice' ? '2px solid #0d56c9' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}>出来高請求書</button>
            </div>

            {/* PDFプレビュー */}
            <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
              <div style={{ backgroundColor: '#f0f2f7', borderRadius: '0.5rem', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeTab === 'budget' && (
                  ledgerPdfUrl ? (
                    <iframe src={ledgerPdfUrl} style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }} title="工事実行予算台帳" />
                  ) : (
                    <div style={{ color: '#686e78', fontSize: '0.9rem' }}>PDFを生成してください</div>
                  )
                )}
                {activeTab === 'schedule' && <iframe src="/発注予定（サンプルデータ）.pdf" style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }} title="発注予定表" />}
                {activeTab.startsWith('order-') && (
                  <iframe src="/注文伺書（データ消し・サンプルデータ）.pdf" style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }} title={`注文伺書(${parseInt(activeTab.split('-')[1]) + 1})`} />
                )}
                {activeTab === 'quote-request' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#686e78', fontSize: '0.9rem' }}>PDFがありません</div>
                )}
                {activeTab === 'vendor-quote' && (
                  docs.find(d => d.type === 'vendor-quote')?.pdfUrl ? (
                    <iframe src={docs.find(d => d.type === 'vendor-quote')?.pdfUrl} style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }} title="業者見積書" />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#686e78', fontSize: '0.9rem' }}>PDFがありません</div>
                  )
                )}
                {activeTab === 'progress-invoice' && (
                  docs.find(d => d.type === 'progress-invoice')?.pdfUrl ? (
                    <iframe src={docs.find(d => d.type === 'progress-invoice')?.pdfUrl} style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }} title="出来高請求書" />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#686e78', fontSize: '0.9rem' }}>PDFがありません</div>
                  )
                )}
              </div>
            </div>

            {/* 工事名入力・申請先選択 */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #dde5f4', backgroundColor: '#f8f9fa', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#1a1c20' }}>工事名 <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  value={header.projectName}
                  onChange={(e) => setHeader((h) => ({ ...h, projectName: e.target.value }))}
                  placeholder="工事名を入力してください"
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#1a1c20' }}>申請先を選択</label>
                <select value={selectedApprover} onChange={(e) => setSelectedApprover(e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff' }}>
                  {approvers.map((approver) => (
                    <option key={approver.id} value={approver.id}>{approver.name}（{approver.department}）</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #dde5f4', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          {isSubmitted ? (
            <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }} onClick={onClose}>閉じる</button>
          ) : (
            <>
              <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: 'transparent', border: '1px solid #dde5f4', color: '#686e78', borderRadius: '0.375rem', cursor: 'pointer' }} onClick={onClose}>キャンセル</button>
              <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: isSubmitting ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }} onClick={onSubmit} disabled={isSubmitting || !selectedApprover}>
                {isSubmitting ? '申請中...' : '申請する'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
