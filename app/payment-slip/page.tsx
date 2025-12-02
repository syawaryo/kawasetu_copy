"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
  PayRow,
  PaymentHeader,
  SaveResult,
  toNum,
  createInitialHeader,
  createInitialRows,
  createEmptyRow,
  savePaymentSlip,
} from "@/lib/payment-slip";

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

const requiredBadgeStyle: React.CSSProperties = {
  display: 'inline-block',
  marginLeft: '0.375rem',
  padding: '0.125rem 0.375rem',
  fontSize: '0.65rem',
  fontWeight: 700,
  color: '#fff',
  backgroundColor: '#0d56c9',
  borderRadius: '0.25rem',
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
  const [h, setH] = useState<PaymentHeader>(createInitialHeader);
  const [rows, setRows] = useState<PayRow[]>(() => createInitialRows(5));
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);

  const totals = useMemo(() => {
    const assessed = rows.reduce((s, r) => s + toNum(r.assessedAmount), 0);
    const tax = rows.reduce((s, r) => s + toNum(r.taxAmount), 0);
    const pay = assessed + tax;
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

  const addRow = () => {
    setRows((prev) => [...prev, createEmptyRow(prev.length)]);
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
            <button style={{ ...buttonStyle, backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}>
              検索
            </button>
            <button style={{ ...buttonStyle, backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}>
              プレビュー
            </button>
            <button style={{ ...buttonStyle, backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}>
              印刷
            </button>
            <button style={{ ...buttonStyle, backgroundColor: '#dc2626', color: '#fff' }}>
              削除
            </button>
            <button style={{ ...buttonStyle, backgroundColor: '#6b7280', color: '#fff' }}>
              クリア
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                ...buttonStyle,
                backgroundColor: saving ? '#93c5fd' : '#0d56c9',
                color: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? '保存中...' : '保存'}
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
                    <span style={requiredBadgeStyle}>必須</span>
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
                    <span style={requiredBadgeStyle}>必須</span>
                  </label>
                  <input
                    type="date"
                    value={h.slipDate}
                    onChange={(e) => setH((x) => ({ ...x, slipDate: e.target.value }))}
                    style={inputStyle}
                  />
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
                    <span style={requiredBadgeStyle}>必須</span>
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
                    <span style={requiredBadgeStyle}>必須</span>
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
                  <input
                    type="text"
                    value={h.payTerms}
                    onChange={(e) => setH((x) => ({ ...x, payTerms: e.target.value }))}
                    placeholder="例: 月末締 翌月20日払"
                    style={inputStyle}
                  />
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
                            <input
                              type="text"
                              value={r.accountTitle}
                              onChange={(e) => updateRow(idx, "accountTitle", e.target.value)}
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
                              <option value="課税">課税</option>
                              <option value="非課税">非課税</option>
                              <option value="免税">免税</option>
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
    </div>
  );
}
