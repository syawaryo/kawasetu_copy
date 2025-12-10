"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  PayRow,
  PaymentHeader,
  SaveResult,
  toNum,
  createInitialHeader,
  createInitialRows,
  createEmptyRow,
  savePaymentSlip,
  getNextMonth20th,
} from "@/lib/payment-slip";
import { useOcrData } from "@/app/contexts/OcrDataContext";
import { useAuth, DEMO_USERS } from "@/app/contexts/AuthContext";
import { useData } from "@/app/contexts/DataContext";
import { useRouter } from "next/navigation";
import { AccountSuggestInput } from "@/app/components/AccountSuggestInput";

// 共通スタイル
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  fontSize: '0.85rem',
  border: '1px solid #dde5f4',
  borderRadius: '0.375rem',
  boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  fontSize: '0.85rem',
  border: '1px solid #dde5f4',
  borderRadius: '0.375rem',
  boxSizing: 'border-box',
  backgroundColor: '#fff',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.375rem',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#1a1c20',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '0.625rem',
  border: '1px solid #dde5f4',
  marginBottom: '1.5rem',
};

const cardHeaderStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  borderBottom: '1px solid #dde5f4',
  backgroundColor: '#f8f9fa',
};

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#1a1c20',
};

const buttonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  fontSize: '0.85rem',
  fontWeight: 600,
  border: 'none',
  borderRadius: '0.375rem',
  cursor: 'pointer',
};

export default function PaymentSlipPage() {
  const router = useRouter();
  const { ocrData, clearOcrData } = useOcrData();
  const { currentUser } = useAuth();
  const { addSubmission } = useData();
  const [h, setH] = useState<PaymentHeader>(createInitialHeader);
  const [rows, setRows] = useState<PayRow[]>(() => createInitialRows(5));
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);

  // 請求書ファイル情報（OCRから引き継ぎ）
  const [invoiceFileUrl, setInvoiceFileUrl] = useState<string | null>(null);
  const [invoiceFileName, setInvoiceFileName] = useState<string | null>(null);

  // 事業者登録番号（OCRから取得、全行に適用するためstate保持）
  const [globalBusinessRegNo, setGlobalBusinessRegNo] = useState<string>('');

  // 申請モーダル用
  const [showModal, setShowModal] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'invoice' | 'slip'>('invoice');

  const approvers = DEMO_USERS.filter(u => u.role === 'manager');

  // OCRデータがあれば反映
  useEffect(() => {
    if (ocrData) {
      // ヘッダー情報を更新
      if (ocrData.payeeCompanyName) {
        setH(prev => ({ ...prev, payee: ocrData.payeeCompanyName || '' }));
      }

      // 事業者登録番号をグローバルに保存
      const regNo = ocrData.invoiceRegNo || '';
      if (regNo) {
        setGlobalBusinessRegNo(regNo);
      }

      // 明細行に反映
      const items = ocrData.invoiceItems || [];
      if (items.length > 0) {
        setRows(prev => {
          // 必要な行数を確保
          const newRows = [...prev];
          while (newRows.length < items.length) {
            newRows.push(createEmptyRow(newRows.length));
          }

          // 免税判定: invoiceRegNoがあれば免チェックON
          const isExempt = !!regNo;

          items.forEach((item, idx) => {
            // 金額を数値化して10%税込み・消費税を計算
            const rawAmount = item.itemAmount?.replace(/[¥,]/g, '') || '0';
            const amount = parseFloat(rawAmount) || 0;
            const taxAmount = Math.round(amount * 0.1);
            const taxIncluded = Math.round(amount * 1.1);

            newRows[idx] = {
              ...newRows[idx],
              // 品目を摘要に
              summary: item.itemDescription || '',
              // 税込み金額を査定金額に
              assessedAmount: String(taxIncluded),
              // 消費税額
              taxAmount: String(taxAmount),
              // 免税チェック
              exempt: isExempt,
              // 消税区分: 内税
              taxType: '内税',
              // 課税区分: 標準(10%)
              taxKbn: '標準(10%)',
              // 適格請求書発行事業者登録番号（全行に適用）
              businessRegNo: regNo,
            };
          });

          return newRows;
        });
      } else {
        // 明細がない場合は従来通り小計・消費税を1行目に
        const isExempt = !!regNo;
        setRows(prev => {
          const newRows = [...prev];
          if (newRows.length > 0) {
            if (ocrData.subtotalAmount) {
              const rawAmount = ocrData.subtotalAmount.replace(/[¥,]/g, '');
              const amount = parseFloat(rawAmount) || 0;
              const taxAmount = Math.round(amount * 0.1);
              const taxIncluded = Math.round(amount * 1.1);
              newRows[0] = {
                ...newRows[0],
                assessedAmount: String(taxIncluded),
                taxAmount: String(taxAmount),
              };
            }
            // 全行に事業者登録番号と免税設定を適用
            for (let i = 0; i < newRows.length; i++) {
              newRows[i] = {
                ...newRows[i],
                exempt: isExempt,
                taxType: '内税',
                taxKbn: '標準(10%)',
                businessRegNo: regNo,
              };
            }
          }
          return newRows;
        });
      }

      // 請求書ファイル情報を保存
      if (ocrData.invoiceFileUrl) {
        setInvoiceFileUrl(ocrData.invoiceFileUrl);
        setInvoiceFileName(ocrData.invoiceFileName || null);
      }

      // 使用後はクリア
      clearOcrData();
    }
  }, [ocrData, clearOcrData]);

  const totals = useMemo(() => {
    const assessedTotal = rows.reduce((s, r) => s + toNum(r.assessedAmount), 0); // 税込み合計
    const tax = rows.reduce((s, r) => s + toNum(r.taxAmount), 0); // 消費税合計
    const assessed = assessedTotal - tax; // 税抜き = 税込み - 消費税
    const pay = assessedTotal; // 支払金額 = 税込み合計
    return { assessed, tax, pay };
  }, [rows]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveResult(null);

    const result = await savePaymentSlip(h, rows, totals);
    setSaveResult(result);
    setSaving(false);

    setTimeout(() => setSaveResult(null), 3000);
  }, [h, rows, totals]);

  // 申請モーダルを開く
  const handleOpenModal = () => {
    setShowModal(true);
    setIsSubmitted(false);
    if (approvers.length > 0) {
      setSelectedApprover(approvers[0].id);
    }
  };

  // 申請モーダルを閉じる
  const handleCloseModal = () => {
    setShowModal(false);
    setIsSubmitted(false);
  };

  // 申請を実行
  const handleSubmit = async () => {
    if (!selectedApprover || !currentUser) return;

    setIsSubmitting(true);

    // BlobURLからBase64に変換
    let invoiceBase64 = '';
    if (invoiceFileUrl) {
      try {
        const response = await fetch(invoiceFileUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        invoiceBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.error('請求書の変換に失敗:', e);
      }
    }

    addSubmission({
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      type: '支払伝票',
      title: `${h.slipNo} - ${h.payee || '支払先未設定'}`,
      status: 'pending',
      data: {
        headerJson: JSON.stringify(h),
        rowsJson: JSON.stringify(rows),
        totalsJson: JSON.stringify(totals),
        invoiceFileName: invoiceFileName || '',
        invoiceBase64: invoiceBase64,
      },
      assignedTo: selectedApprover,
      approvalFlow: [
        { label: '支店', status: 'completed' },
        { label: '支社', status: 'current' },
        { label: '経理部', status: 'pending' },
        { label: '本社', status: 'pending' },
      ],
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const addRow = () => {
    setRows((prev) => {
      const newRow = createEmptyRow(prev.length);
      // グローバルに設定された事業者登録番号を新規行にも適用
      if (globalBusinessRegNo) {
        newRow.businessRegNo = globalBusinessRegNo;
        newRow.exempt = true;
        newRow.taxType = '内税';
        newRow.taxKbn = '標準(10%)';
      }
      return [...prev, newRow];
    });
  };

  const updateRow = (idx: number, field: keyof PayRow, value: string | boolean) => {
    setRows((prev) => {
      const next = [...prev];
      (next[idx] as Record<string, string | boolean>)[field] = value;
      return next;
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f7' }}>
      {/* ヘッダー */}
      <header style={{ backgroundColor: '#132942', color: '#fff', padding: '0.75rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, backgroundColor: '#0d56c9', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" fill="none" stroke="#fff" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>支払伝票入力</h1>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>Payment Slip Entry</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                ...buttonStyle,
                backgroundColor: saving ? '#9ca3af' : '#6b7280',
                color: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? '保存中...' : '保存'}
            </button>
            <button onClick={handleOpenModal} style={{ ...buttonStyle, backgroundColor: '#10b981', color: '#fff' }}>
              申請
            </button>
            <button
              onClick={() => router.push('/transfer-slip')}
              style={{ ...buttonStyle, backgroundColor: '#0d56c9', color: '#fff' }}
            >
              振替伝票入力に進む
            </button>
          </div>
        </div>
      </header>

      {/* 保存結果通知 */}
      {saveResult && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          padding: '1rem 1.5rem',
          borderRadius: '0.5rem',
          backgroundColor: saveResult.success ? '#d1fae5' : '#fee2e2',
          color: saveResult.success ? '#065f46' : '#991b1b',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          fontSize: '0.9rem',
          fontWeight: 500,
        }}>
          {saveResult.message}
        </div>
      )}

      {/* メインコンテンツ */}
      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '1.5rem 24px' }}>
        {/* 基本情報 */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={cardTitleStyle}>基本情報</h2>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {/* 左カラム */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>
                    伝票No.
                  </label>
                  <input
                    type="text"
                    value={h.slipNo}
                    onChange={(e) => setH((x) => ({ ...x, slipNo: e.target.value }))}
                    style={{ ...inputStyle, fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    伝票日付
                  </label>
                  <input
                    type="date"
                    value={h.slipDate}
                    onChange={(e) => setH((x) => ({ ...x, slipDate: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    定時/臨時
                  </label>
                  <select
                    value={h.paymentType}
                    onChange={(e) => setH((x) => ({ ...x, paymentType: e.target.value }))}
                    style={selectStyle}
                  >
                    <option value="定時">定時</option>
                    <option value="臨時">臨時</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>参照元伝票</label>
                  <select
                    value={h.refSourceSlipNo}
                    onChange={(e) => setH((x) => ({ ...x, refSourceSlipNo: e.target.value }))}
                    style={selectStyle}
                  >
                    <option value="">選択してください</option>
                    <option value="2025100001">2025100001</option>
                    <option value="2025100002">2025100002</option>
                  </select>
                </div>
              </div>

              {/* 中央カラム */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>
                    支払先
                  </label>
                  <input
                    type="text"
                    value={h.payee}
                    onChange={(e) => setH((x) => ({ ...x, payee: e.target.value }))}
                    placeholder="例: ○○商事株式会社"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    支払管理部門
                  </label>
                  <input
                    type="text"
                    value={h.payDept}
                    onChange={(e) => setH((x) => ({ ...x, payDept: e.target.value }))}
                    placeholder="例: 本社経理部"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>支払条件</label>
                  {h.paymentType === '定時' ? (
                    <input
                      type="text"
                      value={`${getNextMonth20th()} 現金 100%`}
                      readOnly
                      style={{ ...inputStyle, backgroundColor: '#f3f4f6', color: '#6b7280' }}
                    />
                  ) : (
                    <select
                      value={h.payTerms}
                      onChange={(e) => setH((x) => ({ ...x, payTerms: e.target.value }))}
                      style={selectStyle}
                    >
                      <option value="">選択してください</option>
                      <option value="10日">10日</option>
                      <option value="20日">20日</option>
                      <option value="末日">末日</option>
                    </select>
                  )}
                </div>
              </div>

              {/* 右カラム */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>支払先特記</label>
                  <input
                    type="text"
                    value={h.payeeNote}
                    onChange={(e) => setH((x) => ({ ...x, payeeNote: e.target.value }))}
                    placeholder="特記事項があれば入力"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>免税初期間</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      value={h.taxFirstPeriod}
                      onChange={(e) => setH((x) => ({ ...x, taxFirstPeriod: e.target.value }))}
                      style={{ ...selectStyle, flex: 1 }}
                    >
                      <option value="">選択してください</option>
                      <option>2023-10〜</option>
                      <option>2024-04〜</option>
                    </select>
                    <button
                      onClick={() => setH((x) => ({ ...x, taxOptChange: !x.taxOptChange }))}
                      style={{ ...buttonStyle, backgroundColor: '#fff', border: '1px solid #dde5f4', color: '#1a1c20', whiteSpace: 'nowrap' }}
                    >
                      一括変更
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 金額サマリー */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#686e78', fontWeight: 500 }}>査定金額</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#1a1c20' }}>
                  ¥{totals.assessed.toLocaleString()}
                </p>
              </div>
              <div style={{ width: 48, height: 48, backgroundColor: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" fill="none" stroke="#0d56c9" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#686e78', fontWeight: 500 }}>消費税額</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#1a1c20' }}>
                  ¥{totals.tax.toLocaleString()}
                </p>
              </div>
              <div style={{ width: 48, height: 48, backgroundColor: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" fill="none" stroke="#059669" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#0d56c9', borderRadius: '0.625rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>支払金額（税込）</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
                  ¥{totals.pay.toLocaleString()}
                </p>
              </div>
              <div style={{ width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" fill="none" stroke="#fff" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 支払明細 */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={cardTitleStyle}>支払明細</h2>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '1400px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#132942', color: '#fff' }}>
                    <th rowSpan={2} style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'center', border: '1px solid #1e3a5f', width: 50 }}>No.</th>
                    <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'left', border: '1px solid #1e3a5f', minWidth: 140 }}>科目</th>
                    <th rowSpan={2} style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'center', border: '1px solid #1e3a5f', width: 40 }}>免</th>
                    <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'left', border: '1px solid #1e3a5f', minWidth: 150 }}>取引先</th>
                    <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'left', border: '1px solid #1e3a5f', minWidth: 120 }}>JV負担区分</th>
                    <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'left', border: '1px solid #1e3a5f', minWidth: 100 }}>費目</th>
                    <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'left', border: '1px solid #1e3a5f', minWidth: 100 }}>消税区分</th>
                    <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'right', border: '1px solid #1e3a5f', minWidth: 120 }}>査定金額</th>
                    <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'right', border: '1px solid #1e3a5f', minWidth: 100 }}>立替税率</th>
                    <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'left', border: '1px solid #1e3a5f', minWidth: 150 }}>事業者登録番号</th>
                  </tr>
                  <tr style={{ backgroundColor: '#1e3a5f', color: '#fff' }}>
                    <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'left', border: '1px solid #1e3a5f', minWidth: 140 }}>部門</th>
                    <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'left', border: '1px solid #1e3a5f', minWidth: 150 }}>工事</th>
                    <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'left', border: '1px solid #1e3a5f', minWidth: 120 }}>引合物件</th>
                    <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'left', border: '1px solid #1e3a5f', minWidth: 100 }}>工種</th>
                    <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'left', border: '1px solid #1e3a5f', minWidth: 100 }}>課税区分</th>
                    <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'right', border: '1px solid #1e3a5f', minWidth: 120 }}>消費税額</th>
                    <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'right', border: '1px solid #1e3a5f', minWidth: 100 }}>立替消費税</th>
                    <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'left', border: '1px solid #1e3a5f', minWidth: 150 }}>JV負担先 / 摘要</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => {
                    const bgColor = idx % 2 === 0 ? '#fff' : '#f8f9fa';
                    return (
                      <React.Fragment key={r.no}>
                        {/* 1行目 */}
                        <tr style={{ backgroundColor: bgColor }}>
                          <td rowSpan={2} style={{ padding: '0.25rem', border: '1px solid #e5e7eb', textAlign: 'center', fontFamily: 'monospace', color: '#686e78', verticalAlign: 'middle' }}>
                            {r.no}
                          </td>
                          <td style={{ padding: '0.25rem', borderTop: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', borderLeft: '1px solid #e5e7eb' }}>
                            <AccountSuggestInput
                              value={r.accountTitle}
                              summary={r.summary}
                              onChange={(val) => updateRow(idx, "accountTitle", val)}
                              placeholder="科目"
                              style={{ ...inputStyle, padding: '0.375rem' }}
                            />
                          </td>
                          <td rowSpan={2} style={{ padding: '0.25rem', border: '1px solid #e5e7eb', textAlign: 'center', verticalAlign: 'middle' }}>
                            <input
                              type="checkbox"
                              checked={r.exempt}
                              onChange={(e) => updateRow(idx, "exempt", e.target.checked)}
                              style={{ width: 16, height: 16, cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ padding: '0.25rem', borderTop: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
                            <input
                              type="text"
                              value={r.partner}
                              onChange={(e) => updateRow(idx, "partner", e.target.value)}
                              placeholder="取引先"
                              style={{ ...inputStyle, padding: '0.375rem' }}
                            />
                          </td>
                          <td style={{ padding: '0.25rem', borderTop: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
                            <input
                              type="text"
                              value={r.jvShareType}
                              onChange={(e) => updateRow(idx, "jvShareType", e.target.value)}
                              placeholder="JV負担区分"
                              style={{ ...inputStyle, padding: '0.375rem' }}
                            />
                          </td>
                          <td style={{ padding: '0.25rem', borderTop: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
                            <input
                              type="text"
                              value={r.expense}
                              onChange={(e) => updateRow(idx, "expense", e.target.value)}
                              placeholder="費目"
                              style={{ ...inputStyle, padding: '0.375rem' }}
                            />
                          </td>
                          <td style={{ padding: '0.25rem', borderTop: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
                            <select
                              value={r.taxType}
                              onChange={(e) => updateRow(idx, "taxType", e.target.value)}
                              style={{ ...selectStyle, padding: '0.375rem' }}
                            >
                              <option value="">-</option>
                              <option value="内税">内税</option>
                              <option value="外税">外税</option>
                            </select>
                          </td>
                          <td style={{ padding: '0.25rem', borderTop: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
                            <input
                              type="text"
                              value={r.assessedAmount}
                              onChange={(e) => updateRow(idx, "assessedAmount", e.target.value)}
                              placeholder="0"
                              style={{ ...inputStyle, padding: '0.375rem', textAlign: 'right', fontFamily: 'monospace' }}
                            />
                          </td>
                          <td style={{ padding: '0.25rem', borderTop: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
                            <input
                              type="text"
                              value={r.advanceTaxRate}
                              onChange={(e) => updateRow(idx, "advanceTaxRate", e.target.value)}
                              placeholder="%"
                              style={{ ...inputStyle, padding: '0.375rem', textAlign: 'right', fontFamily: 'monospace' }}
                            />
                          </td>
                          <td style={{ padding: '0.25rem', borderTop: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
                            <input
                              type="text"
                              value={r.businessRegNo}
                              onChange={(e) => updateRow(idx, "businessRegNo", e.target.value)}
                              placeholder="T0000000000000"
                              style={{ ...inputStyle, padding: '0.375rem', fontFamily: 'monospace' }}
                            />
                          </td>
                        </tr>
                        {/* 2行目 */}
                        <tr style={{ backgroundColor: bgColor }}>
                          <td style={{ padding: '0.25rem', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', borderLeft: '1px solid #e5e7eb' }}>
                            <input
                              type="text"
                              value={r.department}
                              onChange={(e) => updateRow(idx, "department", e.target.value)}
                              placeholder="部門"
                              style={{ ...inputStyle, padding: '0.375rem' }}
                            />
                          </td>
                          <td style={{ padding: '0.25rem', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
                            <input
                              type="text"
                              value={r.project}
                              onChange={(e) => updateRow(idx, "project", e.target.value)}
                              placeholder="工事"
                              style={{ ...inputStyle, padding: '0.375rem' }}
                            />
                          </td>
                          <td style={{ padding: '0.25rem', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
                            <input
                              type="text"
                              value={r.inquiry}
                              onChange={(e) => updateRow(idx, "inquiry", e.target.value)}
                              placeholder="引合物件"
                              style={{ ...inputStyle, padding: '0.375rem' }}
                            />
                          </td>
                          <td style={{ padding: '0.25rem', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
                            <input
                              type="text"
                              value={r.workType}
                              onChange={(e) => updateRow(idx, "workType", e.target.value)}
                              placeholder="工種"
                              style={{ ...inputStyle, padding: '0.375rem' }}
                            />
                          </td>
                          <td style={{ padding: '0.25rem', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
                            <select
                              value={r.taxKbn}
                              onChange={(e) => updateRow(idx, "taxKbn", e.target.value)}
                              style={{ ...selectStyle, padding: '0.375rem' }}
                            >
                              <option value="">-</option>
                              <option value="標準(10%)">標準(10%)</option>
                              <option value="軽減(8%)">軽減(8%)</option>
                              <option value="対象外">対象外</option>
                            </select>
                          </td>
                          <td style={{ padding: '0.25rem', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
                            <input
                              type="text"
                              value={r.taxAmount}
                              onChange={(e) => updateRow(idx, "taxAmount", e.target.value)}
                              placeholder="0"
                              style={{ ...inputStyle, padding: '0.375rem', textAlign: 'right', fontFamily: 'monospace' }}
                            />
                          </td>
                          <td style={{ padding: '0.25rem', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
                            <input
                              type="text"
                              value={r.advanceTaxAmount}
                              onChange={(e) => updateRow(idx, "advanceTaxAmount", e.target.value)}
                              placeholder="0"
                              style={{ ...inputStyle, padding: '0.375rem', textAlign: 'right', fontFamily: 'monospace' }}
                            />
                          </td>
                          <td style={{ padding: '0.25rem', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <input
                                type="text"
                                value={r.jvPayTo}
                                onChange={(e) => updateRow(idx, "jvPayTo", e.target.value)}
                                placeholder="JV負担先"
                                style={{ ...inputStyle, padding: '0.375rem' }}
                              />
                              <input
                                type="text"
                                value={r.summary}
                                onChange={(e) => updateRow(idx, "summary", e.target.value)}
                                placeholder="摘要"
                                style={{ ...inputStyle, padding: '0.375rem' }}
                              />
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={addRow}
                style={{ ...buttonStyle, backgroundColor: '#fff', border: '1px solid #dde5f4', color: '#1a1c20', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                行を追加
              </button>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#686e78' }}>
                {rows.length} 件の明細
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer style={{ borderTop: '1px solid #dde5f4', backgroundColor: '#fff', padding: '1rem 0' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#686e78' }}>支払伝票管理システム</p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#686e78' }}>ショートカット: F2=印刷 / F5=保存 / F12=検索</p>
        </div>
      </footer>

      {/* 申請モーダル */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={handleCloseModal}>
          <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', width: '95%', maxWidth: '1200px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #dde5f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#1a1c20' }}>支払伝票 申請確認</h2>
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
                  <button
                    onClick={() => setActiveTab('invoice')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      border: 'none',
                      backgroundColor: activeTab === 'invoice' ? '#fff' : 'transparent',
                      color: activeTab === 'invoice' ? '#0d56c9' : '#686e78',
                      borderBottom: activeTab === 'invoice' ? '2px solid #0d56c9' : '2px solid transparent',
                      cursor: 'pointer',
                    }}
                  >
                    請求書 {invoiceFileName && <span style={{ fontWeight: 400 }}>({invoiceFileName})</span>}
                  </button>
                  <button
                    onClick={() => setActiveTab('slip')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      border: 'none',
                      backgroundColor: activeTab === 'slip' ? '#fff' : 'transparent',
                      color: activeTab === 'slip' ? '#0d56c9' : '#686e78',
                      borderBottom: activeTab === 'slip' ? '2px solid #0d56c9' : '2px solid transparent',
                      cursor: 'pointer',
                    }}
                  >
                    支払伝票
                  </button>
                </div>

                {/* PDFプレビュー */}
                <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
                  <div style={{ backgroundColor: '#f0f2f7', borderRadius: '0.5rem', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {activeTab === 'invoice' && (
                      invoiceFileUrl ? (
                        <iframe
                          src={invoiceFileUrl}
                          style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }}
                          title="請求書"
                        />
                      ) : (
                        <div style={{ color: '#686e78', fontSize: '0.9rem' }}>請求書がありません</div>
                      )
                    )}
                    {activeTab === 'slip' && (
                      <iframe
                        src="/支払伝票のみ.pdf"
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }}
                        title="支払伝票"
                      />
                    )}
                  </div>
                </div>

                {/* 申請先選択 */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #dde5f4', backgroundColor: '#f8f9fa' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#1a1c20' }}>申請先を選択</label>
                  <select
                    value={selectedApprover}
                    onChange={(e) => setSelectedApprover(e.target.value)}
                    style={{ width: '100%', maxWidth: '300px', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff' }}
                  >
                    {approvers.map((approver) => (
                      <option key={approver.id} value={approver.id}>
                        {approver.name}（{approver.department}）
                      </option>
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
                  <button
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: isSubmitting ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedApprover}
                  >
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
