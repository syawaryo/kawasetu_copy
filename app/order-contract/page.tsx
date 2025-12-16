"use client";

import { useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, DEMO_USERS } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import {
  useOrderData,
  DetailRow,
  AdvanceRow,
  VendorRow,
  VendorFormData,
  OrderHeader,
  createEmptyDetailRow,
  createEmptyAdvanceRow,
  createEmptyVendorRow,
  defaultVendorForm,
} from "../contexts/OrderDataContext";

function toNum(v: string) {
  const n = Number(String(v).replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

function calcPercent(contractAmount: string, listPrice: string) {
  const c = toNum(contractAmount);
  const p = toNum(listPrice);
  if (!Number.isFinite(c) || !Number.isFinite(p) || p === 0) return "";
  const pct = ((c - p) / p) * 100;
  return pct.toFixed(1);
}

// 書類タイプ
type DocType = 'budget-ledger' | 'order-schedule' | 'order-inquiry' | 'quote-request' | 'vendor-quote' | 'progress-invoice';
type DocStatus = 'not-started' | 'in-progress' | 'completed' | 'pdf-attached';

interface DocItem {
  type: DocType;
  label: string;
  status: DocStatus;
  pdfFile?: File;
  pdfUrl?: string;
}

const docMeta: Record<DocType, { label: string; description: string }> = {
  'budget-ledger': { label: '工事実行予算台帳', description: '予算・発注・残高管理' },
  'order-schedule': { label: '発注予定表', description: '発注スケジュール' },
  'order-inquiry': { label: '注文伺書', description: '発注内容確認' },
  'quote-request': { label: '見積依頼書', description: '業者への見積依頼' },
  'vendor-quote': { label: '業者見積書', description: 'PDF添付' },
  'progress-invoice': { label: '出来高請求書', description: 'PDF添付（任意）' },
};

const statusLabels: Record<DocStatus, { label: string; color: string; bg: string }> = {
  'not-started': { label: '未着手', color: '#6b7280', bg: '#f3f4f6' },
  'in-progress': { label: '入力中', color: '#d97706', bg: '#fef3c7' },
  'completed': { label: '完了', color: '#059669', bg: '#d1fae5' },
  'pdf-attached': { label: 'PDF添付済', color: '#0d56c9', bg: '#dbeafe' },
};

export default function OrderContractPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { addSubmission } = useData();

  // UIモード: 'side' = サイドパネル, 'tab' = タブ
  const [uiMode, setUiMode] = useState<'side' | 'tab'>('side');
  const [sideOpen, setSideOpen] = useState(true);
  const [docTab, setDocTab] = useState<DocType | 'order'>('order');

  // 書類状態
  const [docs, setDocs] = useState<DocItem[]>([
    { type: 'budget-ledger', label: '工事実行予算台帳', status: 'not-started' },
    { type: 'order-schedule', label: '発注予定表', status: 'not-started' },
    { type: 'order-inquiry', label: '注文伺書', status: 'not-started' },
    { type: 'quote-request', label: '見積依頼書', status: 'not-started' },
    { type: 'vendor-quote', label: '業者見積書', status: 'not-started' },
    { type: 'progress-invoice', label: '出来高請求書', status: 'not-started' },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<DocType | null>(null);

  // コンテキストから発注データを取得
  const {
    orders,
    currentOrderIndex,
    setCurrentOrderIndex,
    addOrder,
    removeOrder,
    updateOrder,
  } = useOrderData();

  // 現在の発注データへのアクセサ
  const currentOrder = orders[currentOrderIndex];
  const header = currentOrder.header;
  const rows = currentOrder.rows;
  const advanceRows = currentOrder.advanceRows;
  const vendorForm = currentOrder.vendorForm;
  const vendorRows = currentOrder.vendorRows;

  const setHeader = (updater: OrderHeader | ((h: OrderHeader) => OrderHeader)) => {
    const newHeader = typeof updater === 'function' ? updater(header) : updater;
    updateOrder(currentOrderIndex, { header: newHeader });
  };
  const setRows = (updater: DetailRow[] | ((r: DetailRow[]) => DetailRow[])) => {
    const newRows = typeof updater === 'function' ? updater(rows) : updater;
    updateOrder(currentOrderIndex, { rows: newRows });
  };
  const setAdvanceRows = (updater: AdvanceRow[] | ((r: AdvanceRow[]) => AdvanceRow[])) => {
    const newAdvanceRows = typeof updater === 'function' ? updater(advanceRows) : updater;
    updateOrder(currentOrderIndex, { advanceRows: newAdvanceRows });
  };
  const setVendorForm = (updater: VendorFormData | ((f: VendorFormData) => VendorFormData)) => {
    const newVendorForm = typeof updater === 'function' ? updater(vendorForm) : updater;
    updateOrder(currentOrderIndex, { vendorForm: newVendorForm });
  };
  const setVendorRows = (updater: VendorRow[] | ((r: VendorRow[]) => VendorRow[])) => {
    const newVendorRows = typeof updater === 'function' ? updater(vendorRows) : updater;
    updateOrder(currentOrderIndex, { vendorRows: newVendorRows });
  };

  // 新規発注を追加
  const handleAddNewOrder = () => {
    addOrder();
  };

  // 発注を削除
  const handleRemoveOrder = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    removeOrder(idx);
  };

  // PDF添付
  const handleFileUpload = (type: DocType, file: File) => {
    const url = URL.createObjectURL(file);
    setDocs(prev => prev.map(d =>
      d.type === type ? { ...d, pdfFile: file, pdfUrl: url, status: 'pdf-attached' as DocStatus } : d
    ));
  };

  // 申請モーダル用
  const [showModal, setShowModal] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'order' | 'budget' | 'schedule'>('order');

  const approvers = DEMO_USERS.filter(u => u.role === 'manager');

  const percentByRow = useMemo(
    () => rows.map((r) => calcPercent(r.contractAmount, r.listPrice)),
    [rows]
  );

  const handleSave = () => {
    const data = { header, rows, advanceRows, vendorForm, vendorRows };
    console.log(JSON.stringify(data, null, 2));
    alert("保存しました（コンソールにJSON出力）");
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setIsSubmitted(false);
    if (approvers.length > 0) {
      setSelectedApprover(approvers[0].id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsSubmitted(false);
  };

  const handleSubmit = async () => {
    if (!selectedApprover || !currentUser) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    addSubmission({
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      type: '発注契約',
      title: header.subject,
      status: 'pending',
      data: {
        orderNo: header.orderNo,
        vendor: header.vendor,
        project: header.project,
        subject: header.subject,
      },
      assignedTo: selectedApprover,
      approvalFlow: [
        { label: '自分', status: 'completed' },
        { label: '工事部長', status: 'current' },
        { label: '本社', status: 'pending' },
      ],
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  // 完了数
  const completedCount = docs.filter(d => d.status === 'completed' || d.status === 'pdf-attached').length;

  // サイドパネルコンポーネント
  const SidePanel = () => (
    <div style={{
      width: sideOpen ? '280px' : '0',
      minWidth: sideOpen ? '280px' : '0',
      backgroundColor: '#fff',
      borderLeft: sideOpen ? '1px solid #dde5f4' : 'none',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {sideOpen && (
        <>
          <div style={{ padding: '1rem', borderBottom: '1px solid #dde5f4', backgroundColor: '#f8f9fa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1a1c20' }}>必要書類</h3>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>{completedCount}/6</span>
            </div>
            {/* プログレスバー */}
            <div style={{ marginTop: '0.5rem', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px' }}>
              <div style={{
                height: '100%',
                width: `${(completedCount / 6) * 100}%`,
                backgroundColor: '#059669',
                borderRadius: '2px',
                transition: 'width 0.3s',
              }} />
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '0.75rem' }}>
            {docs.map((doc) => (
              <div key={doc.type} style={{
                padding: '0.75rem',
                marginBottom: '0.5rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>{doc.label}</p>
                    <p style={{ margin: '0.125rem 0 0', fontSize: '0.7rem', color: '#6b7280' }}>{docMeta[doc.type].description}</p>
                  </div>
                  <span style={{
                    padding: '0.125rem 0.375rem',
                    fontSize: '0.6rem',
                    fontWeight: 500,
                    backgroundColor: statusLabels[doc.status].bg,
                    color: statusLabels[doc.status].color,
                    borderRadius: '0.25rem',
                  }}>
                    {statusLabels[doc.status].label}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.5rem' }}>
                  {(doc.type === 'vendor-quote' || doc.type === 'progress-invoice') ? (
                    <>
                      <button
                        onClick={() => {
                          setUploadTarget(doc.type);
                          fileInputRef.current?.click();
                        }}
                        style={{
                          flex: 1,
                          padding: '0.375rem',
                          fontSize: '0.7rem',
                          fontWeight: 500,
                          backgroundColor: '#fff',
                          border: '1px solid #dde5f4',
                          color: '#686e78',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                        }}
                      >
                        {doc.pdfFile ? 'PDF変更' : 'PDF添付'}
                      </button>
                      {doc.pdfUrl && (
                        <button
                          onClick={() => window.open(doc.pdfUrl, '_blank')}
                          style={{
                            flex: 1,
                            padding: '0.375rem',
                            fontSize: '0.7rem',
                            fontWeight: 500,
                            backgroundColor: '#e8f0fe',
                            border: '1px solid #0d56c9',
                            color: '#0d56c9',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                          }}
                        >
                          プレビュー
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          if (doc.type === 'budget-ledger') router.push('/budget-ledger');
                          else if (doc.type === 'order-inquiry') router.push('/order-inquiry');
                          else if (doc.type === 'order-schedule') setDocTab('order');
                          else if (doc.type === 'quote-request') alert('見積依頼書ページは準備中');
                        }}
                        style={{
                          flex: 1,
                          padding: '0.375rem',
                          fontSize: '0.7rem',
                          fontWeight: 500,
                          backgroundColor: '#fff',
                          border: '1px solid #dde5f4',
                          color: '#686e78',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                        }}
                      >
                        編集
                      </button>
                      <button
                        onClick={() => {
                          setDocs(prev => prev.map(d =>
                            d.type === doc.type ? { ...d, status: 'completed' } : d
                          ));
                        }}
                        style={{
                          flex: 1,
                          padding: '0.375rem',
                          fontSize: '0.7rem',
                          fontWeight: 500,
                          backgroundColor: doc.status === 'completed' ? '#d1fae5' : '#fff',
                          border: `1px solid ${doc.status === 'completed' ? '#059669' : '#dde5f4'}`,
                          color: doc.status === 'completed' ? '#059669' : '#686e78',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                        }}
                      >
                        {doc.status === 'completed' ? '✓ 完了' : '完了にする'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // 発注フォーム（共通）
  const OrderForm = () => (
    <>
      {/* 注文書情報 */}
      <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #dde5f4', backgroundColor: '#f8f9fa' }}>
          <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>注文書情報</h2>
        </div>
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#dc3545' }}>注文書No. *</label>
              <input type="text" value={header.orderNo} onChange={(e) => setHeader((h) => ({ ...h, orderNo: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>履歴No.</label>
              <select value={header.historyNo} onChange={(e) => setHeader((h) => ({ ...h, historyNo: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                <option>01</option>
                <option>02</option>
                <option>03</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#dc3545' }}>注文書作成日 *</label>
              <input type="date" value={header.createdDate} onChange={(e) => setHeader((h) => ({ ...h, createdDate: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#dc3545' }}>注文書発注日 *</label>
              <input type="date" value={header.orderDate} onChange={(e) => setHeader((h) => ({ ...h, orderDate: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>JV負担区分</label>
              <select value={header.jvShare} onChange={(e) => setHeader((h) => ({ ...h, jvShare: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                <option>(未選択)</option>
                <option>JV-主</option>
                <option>JV-従</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>注文請書受取日</label>
              <input type="date" value={header.receivedDate} onChange={(e) => setHeader((h) => ({ ...h, receivedDate: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>契約工期（開始）</label>
              <input type="date" value={header.contractFrom} onChange={(e) => setHeader((h) => ({ ...h, contractFrom: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>契約工期（終了）</label>
              <input type="date" value={header.contractTo} onChange={(e) => setHeader((h) => ({ ...h, contractTo: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>印紙対象・印刷設定</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><input type="checkbox" checked={header.stampTarget} onChange={(e) => setHeader((h) => ({ ...h, stampTarget: e.target.checked }))} /> 印紙対象</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><input type="checkbox" checked={header.printOrder} onChange={(e) => setHeader((h) => ({ ...h, printOrder: e.target.checked }))} /> 注文書</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><input type="checkbox" checked={header.printCopy} onChange={(e) => setHeader((h) => ({ ...h, printCopy: e.target.checked }))} /> 控え</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><input type="checkbox" checked={header.printShosho} onChange={(e) => setHeader((h) => ({ ...h, printShosho: e.target.checked }))} /> 請書</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><input type="checkbox" checked={header.printInvoice} onChange={(e) => setHeader((h) => ({ ...h, printInvoice: e.target.checked }))} /> 請求書</label>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#dc3545' }}>発注先 *</label>
              <input type="text" value={header.vendor} onChange={(e) => setHeader((h) => ({ ...h, vendor: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#dc3545' }}>工事 *</label>
              <input type="text" value={header.project} onChange={(e) => setHeader((h) => ({ ...h, project: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#dc3545' }}>発行部門 *</label>
              <input type="text" value={header.dept} onChange={(e) => setHeader((h) => ({ ...h, dept: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#dc3545' }}>件名 *</label>
              <input type="text" value={header.subject} onChange={(e) => setHeader((h) => ({ ...h, subject: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 発注明細 */}
      <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #dde5f4', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>発注明細</h2>
          <span style={{ fontSize: '0.75rem', color: '#686e78' }}>%： (契約金額 − 定価) ÷ 定価 × 100</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '64px' }}>No.</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4' }}>工種</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '80px' }}>消費税区分</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px' }}>実行予算額</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px' }}>契約金額</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px' }}>予算残高</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '100px' }}>メーカー</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px' }}>定価</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '60px' }}>%</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px' }}>メリット額</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.no}>
                  <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f0f2f7' }}>{r.no}</td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.workType} onChange={(e) => { const next = [...rows]; next[idx].workType = e.target.value; setRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}>
                    <select value={r.taxType} onChange={(e) => { const next = [...rows]; next[idx].taxType = e.target.value; setRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                      <option value="">-</option>
                      <option value="課税">課税</option>
                      <option value="非課税">非課税</option>
                      <option value="免税">免税</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.execBudget} onChange={(e) => { const next = [...rows]; next[idx].execBudget = e.target.value; setRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.contractAmount} onChange={(e) => { const next = [...rows]; next[idx].contractAmount = e.target.value; setRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.budgetRemain} onChange={(e) => { const next = [...rows]; next[idx].budgetRemain = e.target.value; setRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.maker} onChange={(e) => { const next = [...rows]; next[idx].maker = e.target.value; setRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.listPrice} onChange={(e) => { const next = [...rows]; next[idx].listPrice = e.target.value; setRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f0f2f7', textAlign: 'right', fontWeight: 500 }}>{percentByRow[idx]}</td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.meritAmount} onChange={(e) => { const next = [...rows]; next[idx].meritAmount = e.target.value; setRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 立替先明細 */}
      <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #dde5f4', backgroundColor: '#f8f9fa' }}>
          <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>立替先明細</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '64px' }}>No.</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4' }}>会社名</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '100px' }}>比率(%)</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '140px' }}>分担金額</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '140px' }}>分担金額（メリット込）</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '100px' }}>立替区分</th>
              </tr>
            </thead>
            <tbody>
              {advanceRows.map((r, idx) => (
                <tr key={r.no}>
                  <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f0f2f7' }}>{r.no}</td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.companyName} onChange={(e) => { const next = [...advanceRows]; next[idx].companyName = e.target.value; setAdvanceRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.ratio} onChange={(e) => { const next = [...advanceRows]; next[idx].ratio = e.target.value; setAdvanceRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.shareAmount} onChange={(e) => { const next = [...advanceRows]; next[idx].shareAmount = e.target.value; setAdvanceRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.shareAmountMeritIn} onChange={(e) => { const next = [...advanceRows]; next[idx].shareAmountMeritIn = e.target.value; setAdvanceRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}>
                    <select value={r.advanceType} onChange={(e) => { const next = [...advanceRows]; next[idx].advanceType = e.target.value; setAdvanceRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                      <option value="">-</option>
                      <option value="立替">立替</option>
                      <option value="直接">直接</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 支払条件 */}
      <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #dde5f4', backgroundColor: '#f8f9fa' }}>
          <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>支払条件・特記事項</h2>
        </div>
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>法定福利費文言</label>
                <select value={vendorForm.legalWelfareDoc} onChange={(e) => setVendorForm((f) => ({ ...f, legalWelfareDoc: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                  <option>(未選択)</option>
                  <option>文言A（標準）</option>
                  <option>文言B（簡易）</option>
                  <option>文言C（詳細）</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>特記事項</label>
                <textarea rows={4} value={vendorForm.specialNote} onChange={(e) => setVendorForm((f) => ({ ...f, specialNote: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>注文側コメント</label>
                <textarea rows={2} value={vendorForm.orderComment} onChange={(e) => setVendorForm((f) => ({ ...f, orderComment: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>締切日</label>
                <input type="text" value={vendorForm.deadlineDay} onChange={(e) => setVendorForm((f) => ({ ...f, deadlineDay: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>支払日区分</label>
                <select value={vendorForm.paymentMonthType} onChange={(e) => setVendorForm((f) => ({ ...f, paymentMonthType: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                  <option>同月</option>
                  <option>翌月</option>
                  <option>翌々月</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>支払日</label>
                <input type="date" value={vendorForm.paymentDay} onChange={(e) => setVendorForm((f) => ({ ...f, paymentDay: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#dc3545' }}>支払区分 *</label>
                <select value={vendorForm.paymentType} onChange={(e) => setVendorForm((f) => ({ ...f, paymentType: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                  <option>現金</option>
                  <option>振込</option>
                  <option>手形</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>手形率</label>
                <input type="text" value={vendorForm.commissionRate} onChange={(e) => setVendorForm((f) => ({ ...f, commissionRate: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 業者見積検討結果 */}
      <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #dde5f4', backgroundColor: '#f8f9fa' }}>
          <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>業者見積検討結果</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '64px' }}>No.</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'center', borderBottom: '1px solid #dde5f4', width: '60px' }}>採用</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '100px' }}>取引先コード</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4' }}>取引先名称</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '120px' }}>見積書日付</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4' }}>備考</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '120px' }}>見積書番号</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px' }}>見積金額</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px' }}>折値後金額</th>
              </tr>
            </thead>
            <tbody>
              {vendorRows.map((r, idx) => (
                <tr key={r.no}>
                  <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f0f2f7' }}>{r.no}</td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7', textAlign: 'center' }}>
                    <input type="checkbox" checked={r.adopted} onChange={(e) => { const next = [...vendorRows]; next[idx].adopted = e.target.checked; setVendorRows(next); }} />
                  </td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.vendorCode} onChange={(e) => { const next = [...vendorRows]; next[idx].vendorCode = e.target.value; setVendorRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.vendorName} onChange={(e) => { const next = [...vendorRows]; next[idx].vendorName = e.target.value; setVendorRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="date" value={r.quoteDate} onChange={(e) => { const next = [...vendorRows]; next[idx].quoteDate = e.target.value; setVendorRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.note} onChange={(e) => { const next = [...vendorRows]; next[idx].note = e.target.value; setVendorRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.quoteNo} onChange={(e) => { const next = [...vendorRows]; next[idx].quoteNo = e.target.value; setVendorRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.quoteAmount} onChange={(e) => { const next = [...vendorRows]; next[idx].quoteAmount = e.target.value; setVendorRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.afterDiscountAmount} onChange={(e) => { const next = [...vendorRows]; next[idx].afterDiscountAmount = e.target.value; setVendorRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f7' }}>
      <header style={{ backgroundColor: '#132942', color: '#fff', padding: '0.75rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>（外注）発注契約登録</h1>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* UIモード切替 */}
            <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '0.375rem', padding: '0.125rem', marginRight: '0.5rem' }}>
              <button
                onClick={() => setUiMode('side')}
                style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  backgroundColor: uiMode === 'side' ? '#fff' : 'transparent',
                  color: uiMode === 'side' ? '#132942' : 'rgba(255,255,255,0.7)',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                }}
              >
                サイドパネル
              </button>
              <button
                onClick={() => setUiMode('tab')}
                style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  backgroundColor: uiMode === 'tab' ? '#fff' : 'transparent',
                  color: uiMode === 'tab' ? '#132942' : 'rgba(255,255,255,0.7)',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                }}
              >
                タブ
              </button>
            </div>
            <button onClick={handleAddNewOrder} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
              + 新規登録
            </button>
            <button onClick={handleSave} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#6b7280', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
              保存
            </button>
            <button onClick={() => router.push('/order-inquiry')} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#0d56c9', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
              注文伺書へ
            </button>
          </div>
        </div>
      </header>

      {/* タブモード: 書類タブ */}
      {uiMode === 'tab' && (
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #dde5f4' }}>
          <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '0' }}>
            <button
              onClick={() => setDocTab('order')}
              style={{
                padding: '0.75rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: docTab === 'order' ? '#fff' : '#f8f9fa',
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
                  backgroundColor: docTab === doc.type ? '#fff' : '#f8f9fa',
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
      )}

      {/* 発注タブ（複数発注） */}
      {orders.length > 1 && (docTab === 'order' || uiMode === 'side') && (
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #dde5f4', padding: '0.5rem 0' }}>
          <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '0.5rem' }}>
            {orders.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentOrderIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.375rem 0.5rem 0.375rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  backgroundColor: idx === currentOrderIndex ? '#0d56c9' : '#f0f2f7',
                  color: idx === currentOrderIndex ? '#fff' : '#686e78',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                }}
              >
                <span>外注発注({idx + 1})</span>
                <button
                  onClick={(e) => handleRemoveOrder(idx, e)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '16px',
                    height: '16px',
                    padding: 0,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: idx === currentOrderIndex ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                    color: idx === currentOrderIndex ? '#fff' : '#686e78',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    lineHeight: 1,
                  }}
                  title="削除"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <div style={{ display: 'flex', maxWidth: '1600px', margin: '0 auto' }}>
        <main style={{ flex: 1, padding: '1.5rem 24px' }}>
          {/* タブモードで選択した書類を表示 */}
          {uiMode === 'tab' && docTab !== 'order' ? (
            <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', padding: '2rem', textAlign: 'center' }}>
              {docTab === 'budget-ledger' && (
                <div>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1c20', marginBottom: '1rem' }}>工事実行予算台帳</p>
                  <button onClick={() => router.push('/budget-ledger')} style={{ padding: '0.75rem 2rem', fontSize: '0.9rem', fontWeight: 600, backgroundColor: '#0d56c9', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
                    台帳を開く
                  </button>
                </div>
              )}
              {docTab === 'order-inquiry' && (
                <div>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1c20', marginBottom: '1rem' }}>注文伺書</p>
                  <button onClick={() => router.push('/order-inquiry')} style={{ padding: '0.75rem 2rem', fontSize: '0.9rem', fontWeight: 600, backgroundColor: '#0d56c9', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
                    注文伺書を開く
                  </button>
                </div>
              )}
              {docTab === 'order-schedule' && (
                <div>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1c20', marginBottom: '1rem' }}>発注予定表</p>
                  <p style={{ fontSize: '0.85rem', color: '#686e78' }}>発注登録の情報から自動生成されます</p>
                </div>
              )}
              {docTab === 'quote-request' && (
                <div>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1c20', marginBottom: '1rem' }}>見積依頼書</p>
                  <p style={{ fontSize: '0.85rem', color: '#686e78' }}>準備中です</p>
                </div>
              )}
              {(docTab === 'vendor-quote' || docTab === 'progress-invoice') && (
                <div>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1c20', marginBottom: '1rem' }}>
                    {docTab === 'vendor-quote' ? '業者見積書' : '出来高請求書'}
                  </p>
                  {docs.find(d => d.type === docTab)?.pdfUrl ? (
                    <div>
                      <iframe
                        src={docs.find(d => d.type === docTab)?.pdfUrl}
                        style={{ width: '100%', height: '500px', border: '1px solid #dde5f4', borderRadius: '0.5rem', marginBottom: '1rem' }}
                      />
                      <button
                        onClick={() => {
                          setUploadTarget(docTab);
                          fileInputRef.current?.click();
                        }}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: '#6b7280', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                      >
                        PDFを変更
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#686e78', marginBottom: '1rem' }}>PDFファイルを添付してください</p>
                      <button
                        onClick={() => {
                          setUploadTarget(docTab);
                          fileInputRef.current?.click();
                        }}
                        style={{ padding: '0.75rem 2rem', fontSize: '0.9rem', fontWeight: 600, backgroundColor: '#0d56c9', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                      >
                        PDF添付
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <OrderForm />
          )}
        </main>

        {/* サイドパネルモード */}
        {uiMode === 'side' && (
          <>
            {/* 開閉ボタン */}
            <button
              onClick={() => setSideOpen(!sideOpen)}
              style={{
                position: 'fixed',
                right: sideOpen ? '280px' : '0',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '48px',
                backgroundColor: '#0d56c9',
                border: 'none',
                borderRadius: sideOpen ? '0.25rem 0 0 0.25rem' : '0.25rem 0 0 0.25rem',
                color: '#fff',
                cursor: 'pointer',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'right 0.3s ease',
              }}
            >
              {sideOpen ? '›' : '‹'}
            </button>
            <SidePanel />
          </>
        )}
      </div>

      {/* 隠しファイル入力 */}
      <input
        type="file"
        accept=".pdf"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && uploadTarget) {
            handleFileUpload(uploadTarget, file);
            setUploadTarget(null);
          }
        }}
      />

      {/* 申請モーダル（元のまま） */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={handleCloseModal}>
          <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', width: '95%', maxWidth: '1000px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #dde5f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#1a1c20' }}>発注契約 申請確認</h2>
              <button style={{ width: 32, height: 32, border: 'none', backgroundColor: 'transparent', fontSize: '1.5rem', cursor: 'pointer', color: '#686e78' }} onClick={handleCloseModal}>×</button>
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
                <div style={{ display: 'flex', borderBottom: '1px solid #dde5f4', backgroundColor: '#f8f9fa' }}>
                  <button onClick={() => setActiveTab('order')} style={{ padding: '0.75rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, border: 'none', backgroundColor: activeTab === 'order' ? '#fff' : 'transparent', color: activeTab === 'order' ? '#0d56c9' : '#686e78', borderBottom: activeTab === 'order' ? '2px solid #0d56c9' : '2px solid transparent', cursor: 'pointer' }}>注文伺書</button>
                  <button onClick={() => setActiveTab('budget')} style={{ padding: '0.75rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, border: 'none', backgroundColor: activeTab === 'budget' ? '#fff' : 'transparent', color: activeTab === 'budget' ? '#0d56c9' : '#686e78', borderBottom: activeTab === 'budget' ? '2px solid #0d56c9' : '2px solid transparent', cursor: 'pointer' }}>工事実行予算台帳</button>
                  <button onClick={() => setActiveTab('schedule')} style={{ padding: '0.75rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, border: 'none', backgroundColor: activeTab === 'schedule' ? '#fff' : 'transparent', color: activeTab === 'schedule' ? '#0d56c9' : '#686e78', borderBottom: activeTab === 'schedule' ? '2px solid #0d56c9' : '2px solid transparent', cursor: 'pointer' }}>発注予定表</button>
                </div>

                {/* PDFプレビュー */}
                <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
                  <div style={{ backgroundColor: '#f0f2f7', borderRadius: '0.5rem', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {activeTab === 'order' && <iframe src="/注文伺書（データ消し・サンプルデータ）.pdf" style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }} title="注文伺書" />}
                    {activeTab === 'budget' && <iframe src="/工事実行予算台帳（サンプルデータ）.pdf" style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }} title="工事実行予算台帳" />}
                    {activeTab === 'schedule' && <iframe src="/発注予定（サンプルデータ）.pdf" style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }} title="発注予定表" />}
                  </div>
                </div>

                {/* 申請先選択 */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #dde5f4', backgroundColor: '#f8f9fa' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#1a1c20' }}>申請先を選択</label>
                  <select value={selectedApprover} onChange={(e) => setSelectedApprover(e.target.value)} style={{ width: '100%', maxWidth: '300px', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff' }}>
                    {approvers.map((approver) => (
                      <option key={approver.id} value={approver.id}>{approver.name}（{approver.department}）</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #dde5f4', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              {isSubmitted ? (
                <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }} onClick={handleCloseModal}>閉じる</button>
              ) : (
                <>
                  <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: 'transparent', border: '1px solid #dde5f4', color: '#686e78', borderRadius: '0.375rem', cursor: 'pointer' }} onClick={handleCloseModal}>キャンセル</button>
                  <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: isSubmitting ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }} onClick={handleSubmit} disabled={isSubmitting || !selectedApprover}>
                    {isSubmitting ? '申請中...' : '申請する'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
