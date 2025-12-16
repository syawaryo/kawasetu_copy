"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useOrderData } from "../contexts/OrderDataContext";

// 数値変換
function toNum(v: string) {
  const n = Number(String(v).replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

// 数値フォーマット
function formatNum(n: number) {
  return n.toLocaleString();
}

export default function OrderInquiryPage() {
  const router = useRouter();
  const { orders, currentOrderIndex, setCurrentOrderIndex } = useOrderData();

  const currentOrder = orders[currentOrderIndex];

  // 合計計算
  const totals = useMemo(() => {
    const total = {
      execBudget: 0,
      contractAmount: 0,
      contractTax: 0,
      budgetRemain: 0,
    };
    currentOrder.rows.forEach(row => {
      total.execBudget += toNum(row.execBudget);
      total.contractAmount += toNum(row.contractAmount);
      total.contractTax += toNum(row.contractTax);
      total.budgetRemain += toNum(row.budgetRemain);
    });
    return total;
  }, [currentOrder.rows]);

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '0.625rem',
    border: '1px solid #dde5f4',
    marginBottom: '1.5rem',
  };

  const cardHeaderStyle = {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #dde5f4',
    backgroundColor: '#f8f9fa',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.375rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#1a1c20',
  };

  const valueStyle = {
    padding: '0.5rem',
    fontSize: '0.85rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '0.375rem',
    border: '1px solid #dde5f4',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f7' }}>
      <header style={{ backgroundColor: '#132942', color: '#fff', padding: '0.75rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>注文伺書</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => router.push('/order-contract')}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: '#fff', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              ← 外注発注へ戻る
            </button>
            <button
              onClick={() => alert('PDF出力機能は準備中です')}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#6b7280', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              PDF出力
            </button>
            <button
              onClick={() => router.push('/budget-ledger')}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#0d56c9', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              工事実行予算台帳へ
            </button>
          </div>
        </div>
      </header>

      {/* 発注タブ */}
      {orders.length > 1 && (
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #dde5f4', padding: '0.5rem 0' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '0.5rem' }}>
            {orders.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentOrderIndex(idx)}
                style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  backgroundColor: idx === currentOrderIndex ? '#0d56c9' : '#f0f2f7',
                  color: idx === currentOrderIndex ? '#fff' : '#686e78',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                }}
              >
                外注発注({idx + 1})
              </button>
            ))}
          </div>
        </div>
      )}

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 24px' }}>
        {/* 基本情報 */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>注文書情報</h2>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>注文書No.</label>
                <div style={valueStyle}>{currentOrder.header.orderNo || '-'}</div>
              </div>
              <div>
                <label style={labelStyle}>注文日</label>
                <div style={valueStyle}>{currentOrder.header.orderDate || '-'}</div>
              </div>
              <div>
                <label style={labelStyle}>発注先</label>
                <div style={valueStyle}>{currentOrder.header.vendor || '-'}</div>
              </div>
              <div>
                <label style={labelStyle}>工事名</label>
                <div style={valueStyle}>{currentOrder.header.project || '-'}</div>
              </div>
              <div>
                <label style={labelStyle}>件名</label>
                <div style={valueStyle}>{currentOrder.header.subject || '-'}</div>
              </div>
              <div>
                <label style={labelStyle}>部署</label>
                <div style={valueStyle}>{currentOrder.header.dept || '-'}</div>
              </div>
              <div>
                <label style={labelStyle}>契約期間（開始）</label>
                <div style={valueStyle}>{currentOrder.header.contractFrom || '-'}</div>
              </div>
              <div>
                <label style={labelStyle}>契約期間（終了）</label>
                <div style={valueStyle}>{currentOrder.header.contractTo || '-'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 発注明細 */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>発注明細</h2>
          </div>
          <div style={{ padding: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4' }}>No.</th>
                  <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4' }}>工種</th>
                  <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4' }}>税区分</th>
                  <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4' }}>実行予算</th>
                  <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4' }}>契約金額</th>
                  <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4' }}>契約消費税</th>
                  <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4' }}>予算残</th>
                  <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4' }}>メーカー</th>
                </tr>
              </thead>
              <tbody>
                {currentOrder.rows.map((row, idx) => {
                  // 空行はスキップ
                  if (!row.workType && !row.execBudget && !row.contractAmount) return null;
                  return (
                    <tr key={idx}>
                      <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{row.no || idx + 1}</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{row.workType}</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{row.taxType}</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right' }}>{row.execBudget}</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right' }}>{row.contractAmount}</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right' }}>{row.contractTax}</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right' }}>{row.budgetRemain}</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{row.maker}</td>
                    </tr>
                  );
                })}
                {/* 合計行 */}
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <td colSpan={3} style={{ padding: '0.5rem', border: '1px solid #dde5f4', fontWeight: 700 }}>合計</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right', fontWeight: 700 }}>{formatNum(totals.execBudget)}</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right', fontWeight: 700 }}>{formatNum(totals.contractAmount)}</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right', fontWeight: 700 }}>{formatNum(totals.contractTax)}</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right', fontWeight: 700 }}>{formatNum(totals.budgetRemain)}</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 発注条件 */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>発注条件</h2>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>支払条件</label>
                <div style={valueStyle}>{currentOrder.vendorForm.paymentType || '-'}</div>
              </div>
              <div>
                <label style={labelStyle}>支払月</label>
                <div style={valueStyle}>{currentOrder.vendorForm.paymentMonthType || '-'}</div>
              </div>
              <div>
                <label style={labelStyle}>締日</label>
                <div style={valueStyle}>{currentOrder.vendorForm.deadlineDay ? `${currentOrder.vendorForm.deadlineDay}日` : '-'}</div>
              </div>
            </div>
            {currentOrder.vendorForm.specialNote && (
              <div style={{ marginTop: '1rem' }}>
                <label style={labelStyle}>特記事項</label>
                <div style={{ ...valueStyle, whiteSpace: 'pre-wrap' }}>{currentOrder.vendorForm.specialNote}</div>
              </div>
            )}
            {currentOrder.vendorForm.orderComment && (
              <div style={{ marginTop: '1rem' }}>
                <label style={labelStyle}>備考</label>
                <div style={{ ...valueStyle, whiteSpace: 'pre-wrap' }}>{currentOrder.vendorForm.orderComment}</div>
              </div>
            )}
          </div>
        </div>

        {/* データがない場合 */}
        {currentOrder.rows.every(row => !row.workType && !row.execBudget && !row.contractAmount) && (
          <div style={{ ...cardStyle, padding: '2rem', textAlign: 'center', color: '#686e78' }}>
            外注発注にデータがありません。
            <button
              onClick={() => router.push('/order-contract')}
              style={{ marginLeft: '0.5rem', color: '#0d56c9', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              外注発注を入力する →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
