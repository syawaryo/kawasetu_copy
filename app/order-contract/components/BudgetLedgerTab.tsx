"use client";

import { BudgetLedgerHeader } from "../../contexts/OrderDataContext";
import { toNum } from "../utils";

interface LedgerHeaderCalculated {
  budgetAmount: number;
  orderAmount: number;
  budgetRemain: number;
  plannedProfit: number;
}

interface AggregatedLedgerRow {
  orderLabel: string;
  vendor: string;
  workTypeCode: string;
  workType: string;
  execBudget: string;
  contractAmount: string;
}

interface BudgetLedgerTabProps {
  ledgerViewMode: 'input' | 'pdf';
  ledgerHeader: BudgetLedgerHeader;
  setLedgerHeader: (h: BudgetLedgerHeader) => void;
  ledgerHeaderCalculated: LedgerHeaderCalculated;
  aggregatedLedgerRows: AggregatedLedgerRow[];
  ledgerPdfLoading: boolean;
  ledgerPdfUrl: string | null;
  onGeneratePdf: () => void;
  onClosePdfPreview: () => void;
}

export default function BudgetLedgerTab({
  ledgerViewMode,
  ledgerHeader,
  setLedgerHeader,
  ledgerHeaderCalculated,
  aggregatedLedgerRows,
  ledgerPdfLoading,
  ledgerPdfUrl,
  onGeneratePdf,
  onClosePdfPreview,
}: BudgetLedgerTabProps) {
  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1c20', margin: 0 }}>工事実行予算台帳</p>
          {ledgerViewMode === 'input' ? (
            <button
              onClick={onGeneratePdf}
              disabled={ledgerPdfLoading || aggregatedLedgerRows.length === 0}
              style={{
                padding: '0.375rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 500,
                backgroundColor: '#fff',
                color: ledgerPdfLoading || aggregatedLedgerRows.length === 0 ? '#9ca3af' : '#0d56c9',
                border: `1px solid ${ledgerPdfLoading || aggregatedLedgerRows.length === 0 ? '#9ca3af' : '#0d56c9'}`,
                borderRadius: '0.375rem',
                cursor: ledgerPdfLoading || aggregatedLedgerRows.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {ledgerPdfLoading ? 'PDF生成中...' : 'PDFプレビュー'}
            </button>
          ) : (
            <button
              onClick={onClosePdfPreview}
              style={{
                padding: '0.375rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 500,
                backgroundColor: '#fff',
                color: '#0d56c9',
                border: '1px solid #0d56c9',
                borderRadius: '0.375rem',
                cursor: 'pointer',
              }}
            >
              発注明細に戻る
            </button>
          )}
        </div>
        <span style={{ fontSize: '0.75rem', color: '#686e78' }}>
          ※ 発注登録の発注明細から自動反映されます
        </span>
      </div>

      {/* ヘッダー情報 */}
      {ledgerViewMode === 'input' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', border: '1px solid #dde5f4' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#1a1c20' }}>受注金額</label>
            <input
              type="text"
              value={ledgerHeader.contractAmount}
              onChange={(e) => setLedgerHeader({ ...ledgerHeader, contractAmount: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box', textAlign: 'right' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#686e78' }}>予算金額（自動）</label>
            <input
              type="text"
              value={ledgerHeaderCalculated.budgetAmount.toLocaleString()}
              readOnly
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box', textAlign: 'right', backgroundColor: '#e9ecef', color: '#495057' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#686e78' }}>発注額（自動）</label>
            <input
              type="text"
              value={ledgerHeaderCalculated.orderAmount.toLocaleString()}
              readOnly
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box', textAlign: 'right', backgroundColor: '#e9ecef', color: '#495057' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#1a1c20' }}>発注予定</label>
            <input
              type="text"
              value={ledgerHeader.plannedOrder}
              onChange={(e) => setLedgerHeader({ ...ledgerHeader, plannedOrder: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box', textAlign: 'right' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#686e78' }}>予算残（自動）</label>
            <input
              type="text"
              value={ledgerHeaderCalculated.budgetRemain.toLocaleString()}
              readOnly
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box', textAlign: 'right', backgroundColor: '#e9ecef', color: ledgerHeaderCalculated.budgetRemain < 0 ? '#dc2626' : '#495057' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#686e78' }}>予定粗利（自動）</label>
            <input
              type="text"
              value={ledgerHeaderCalculated.plannedProfit.toLocaleString()}
              readOnly
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box', textAlign: 'right', backgroundColor: '#e9ecef', color: ledgerHeaderCalculated.plannedProfit < 0 ? '#dc2626' : '#495057' }}
            />
          </div>
        </div>
      )}

      {/* 発注明細からの自動生成テーブル */}
      {ledgerViewMode === 'input' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', width: '100px', color: '#1a1c20' }}>工種コード</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', color: '#1a1c20' }}>工種</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4', width: '140px', color: '#1a1c20' }}>予算金額</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', color: '#1a1c20' }}>発注業者</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4', width: '140px', color: '#1a1c20' }}>発注金額</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4', width: '140px', color: '#1a1c20' }}>残高</th>
              </tr>
            </thead>
            <tbody>
              {aggregatedLedgerRows.length > 0 ? (
                aggregatedLedgerRows.map((row, idx) => {
                  const budget = toNum(row.execBudget);
                  const contract = toNum(row.contractAmount);
                  const balance = (Number.isFinite(budget) && Number.isFinite(contract))
                    ? (budget - contract).toLocaleString()
                    : '';
                  return (
                    <tr key={idx}>
                      <td style={{ padding: '0.5rem 0.75rem', border: '1px solid #dde5f4' }}>{row.workTypeCode}</td>
                      <td style={{ padding: '0.5rem 0.75rem', border: '1px solid #dde5f4' }}>{row.workType}</td>
                      <td style={{ padding: '0.5rem 0.75rem', border: '1px solid #dde5f4', textAlign: 'right' }}>{row.execBudget}</td>
                      <td style={{ padding: '0.5rem 0.75rem', border: '1px solid #dde5f4' }}>{row.vendor}</td>
                      <td style={{ padding: '0.5rem 0.75rem', border: '1px solid #dde5f4', textAlign: 'right' }}>{row.contractAmount}</td>
                      <td style={{ padding: '0.5rem 0.75rem', border: '1px solid #dde5f4', textAlign: 'right', color: balance.startsWith('-') ? '#dc2626' : '#059669' }}>{balance}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', border: '1px solid #dde5f4', textAlign: 'center', color: '#686e78' }}>
                    発注登録の発注明細にデータを入力すると、ここに反映されます
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PDFプレビューモード */}
      {ledgerViewMode === 'pdf' && (
        <div style={{ backgroundColor: '#f0f2f7', borderRadius: '0.5rem', height: '600px' }}>
          {ledgerPdfUrl ? (
            <iframe
              src={ledgerPdfUrl}
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }}
              title="工事実行予算台帳"
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#686e78' }}>
              PDF生成中...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
