"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PDFDocument, TextAlignment } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

interface LedgerRow {
  workTypeCode: string;
  workType: string;
  budgetAmount: string;
  vendor: string;
  orderAmount: string;
}

const createEmptyRow = (): LedgerRow => ({
  workTypeCode: '',
  workType: '',
  budgetAmount: '',
  vendor: '',
  orderAmount: '',
});

// 数値変換
const toNum = (val: string): number => {
  const cleaned = val.replace(/,/g, '').replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
  return parseFloat(cleaned) || 0;
};

const toHankaku = (str: string): string => {
  return str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
};

export default function BudgetLedgerPage() {
  const [viewMode, setViewMode] = useState<'input' | 'pdf'>('input');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // ヘッダー情報
  const [header, setHeader] = useState({
    contractAmount: '',
    plannedOrder: '',
  });

  // 行データ
  const [rows, setRows] = useState<LedgerRow[]>([createEmptyRow()]);

  // 行追加
  const addRow = () => {
    setRows([...rows, createEmptyRow()]);
  };

  // 行削除
  const removeRow = (idx: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== idx));
    }
  };

  // 行更新
  const updateRow = (idx: number, field: keyof LedgerRow, value: string) => {
    setRows(rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  // ヘッダーの自動計算
  const headerCalculated = useMemo(() => {
    const totalBudget = rows.reduce((sum, row) => sum + toNum(row.budgetAmount), 0);
    const totalOrder = rows.reduce((sum, row) => sum + toNum(row.orderAmount), 0);
    const plannedOrder = toNum(header.plannedOrder);
    const contractAmount = toNum(header.contractAmount);
    const budgetRemain = totalBudget - totalOrder - plannedOrder;
    const plannedProfit = contractAmount - totalOrder - plannedOrder;

    return {
      budgetAmount: totalBudget,
      orderAmount: totalOrder,
      budgetRemain,
      plannedProfit,
    };
  }, [rows, header.plannedOrder, header.contractAmount]);

  // PDF生成
  const generatePdf = async () => {
    setPdfLoading(true);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    try {
      const response = await fetch("/工事実行予算台帳入力欄あり.pdf");
      const pdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      pdfDoc.registerFontkit(fontkit);
      const fontResponse = await fetch("/fonts/NotoSansCJKjp-Regular.otf");
      const fontBytes = await fontResponse.arrayBuffer();
      const japaneseFont = await pdfDoc.embedFont(fontBytes);

      const form = pdfDoc.getForm();

      rows.forEach((row, idx) => {
        const rowNum = idx + 1;
        let codeItemValue = '';
        if (row.workTypeCode && row.workType) {
          codeItemValue = `${toHankaku(row.workTypeCode)} ${row.workType}`;
        } else if (row.workTypeCode) {
          codeItemValue = toHankaku(row.workTypeCode);
        } else if (row.workType) {
          codeItemValue = row.workType;
        }

        const budget = toNum(row.budgetAmount);
        const order = toNum(row.orderAmount);
        const balance = (budget - order).toString();

        const fieldMappings: { [key: string]: string } = {
          [`row${rowNum}_codeItem`]: codeItemValue,
          [`row${rowNum}_budgetAmount`]: toHankaku(row.budgetAmount || ''),
          [`row${rowNum}_orderAmount`]: toHankaku(row.orderAmount || ''),
          [`row${rowNum}_balance`]: toHankaku(balance),
        };

        Object.entries(fieldMappings).forEach(([fieldName, value]) => {
          try {
            const textField = form.getTextField(fieldName);
            textField.setFontSize(9);
            textField.setAlignment(TextAlignment.Center);
            textField.setText(value || "");
            textField.updateAppearances(japaneseFont);
          } catch {
            console.log(`Field not found: ${fieldName}`);
          }
        });
      });

      const headerFieldMappings: { [key: string]: string } = {
        'contractAmount': toHankaku(header.contractAmount || ''),
        'inProgressAmount': toHankaku(headerCalculated.budgetAmount.toString()),
        'orderAmount': toHankaku(headerCalculated.orderAmount.toString()),
        'plannedOrder': toHankaku(header.plannedOrder || ''),
        'budgetRemain': toHankaku(headerCalculated.budgetRemain.toString()),
        'plannedProfit': toHankaku(headerCalculated.plannedProfit.toString()),
      };

      Object.entries(headerFieldMappings).forEach(([fieldName, value]) => {
        try {
          const textField = form.getTextField(fieldName);
          textField.setFontSize(9);
          textField.setAlignment(TextAlignment.Center);
          textField.setText(value || "");
          textField.updateAppearances(japaneseFont);
        } catch {
          console.log(`Header field not found: ${fieldName}`);
        }
      });

      form.flatten();

      const filledPdfBytes = await pdfDoc.save();
      const ab = new ArrayBuffer(filledPdfBytes.byteLength);
      new Uint8Array(ab).set(filledPdfBytes);
      const blob = new Blob([ab], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setViewMode('pdf');
    } catch (error) {
      console.error("PDF生成エラー:", error);
      alert("PDF生成に失敗しました");
    } finally {
      setPdfLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.4rem',
    fontSize: '0.85rem',
    border: '1px solid #dde5f4',
    borderRadius: '0.25rem',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f7' }}>
      <header style={{ backgroundColor: '#132942', color: '#fff', padding: '0.75rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>工事実行予算台帳</h1>
        </div>
      </header>

      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <main style={{ padding: '1.5rem 24px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', padding: '2rem' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1c20', margin: 0 }}>工事実行予算台帳</p>
                  {viewMode === 'input' ? (
                    <button
                      onClick={generatePdf}
                      disabled={pdfLoading}
                      style={{
                        padding: '0.375rem 0.75rem',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        backgroundColor: '#fff',
                        color: pdfLoading ? '#9ca3af' : '#0d56c9',
                        border: `1px solid ${pdfLoading ? '#9ca3af' : '#0d56c9'}`,
                        borderRadius: '0.375rem',
                        cursor: pdfLoading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {pdfLoading ? 'PDF生成中...' : 'PDFプレビュー'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setViewMode('input')}
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
                      一覧に戻る
                    </button>
                  )}
                </div>
              </div>

              {/* ヘッダー情報 */}
              {viewMode === 'input' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', border: '1px solid #dde5f4' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#1a1c20' }}>受注金額</label>
                    <input
                      type="text"
                      value={header.contractAmount}
                      onChange={(e) => setHeader({ ...header, contractAmount: e.target.value })}
                      style={{ ...inputStyle, textAlign: 'right' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#686e78' }}>予算金額（自動）</label>
                    <input
                      type="text"
                      value={headerCalculated.budgetAmount.toLocaleString()}
                      readOnly
                      style={{ ...inputStyle, textAlign: 'right', backgroundColor: '#e9ecef', color: '#495057' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#686e78' }}>発注額（自動）</label>
                    <input
                      type="text"
                      value={headerCalculated.orderAmount.toLocaleString()}
                      readOnly
                      style={{ ...inputStyle, textAlign: 'right', backgroundColor: '#e9ecef', color: '#495057' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#1a1c20' }}>発注予定</label>
                    <input
                      type="text"
                      value={header.plannedOrder}
                      onChange={(e) => setHeader({ ...header, plannedOrder: e.target.value })}
                      style={{ ...inputStyle, textAlign: 'right' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#686e78' }}>予算残（自動）</label>
                    <input
                      type="text"
                      value={headerCalculated.budgetRemain.toLocaleString()}
                      readOnly
                      style={{ ...inputStyle, textAlign: 'right', backgroundColor: '#e9ecef', color: headerCalculated.budgetRemain < 0 ? '#dc2626' : '#495057' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#686e78' }}>予定粗利（自動）</label>
                    <input
                      type="text"
                      value={headerCalculated.plannedProfit.toLocaleString()}
                      readOnly
                      style={{ ...inputStyle, textAlign: 'right', backgroundColor: '#e9ecef', color: headerCalculated.plannedProfit < 0 ? '#dc2626' : '#495057' }}
                    />
                  </div>
                </div>
              )}

              {/* テーブル */}
              {viewMode === 'input' && (
                <>
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
                          <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'center', border: '1px solid #dde5f4', width: '60px', color: '#1a1c20' }}>削除</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, idx) => {
                          const budget = toNum(row.budgetAmount);
                          const order = toNum(row.orderAmount);
                          const balance = budget - order;
                          return (
                            <tr key={idx}>
                              <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                                <input
                                  type="text"
                                  value={row.workTypeCode}
                                  onChange={(e) => updateRow(idx, 'workTypeCode', e.target.value)}
                                  style={inputStyle}
                                />
                              </td>
                              <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                                <input
                                  type="text"
                                  value={row.workType}
                                  onChange={(e) => updateRow(idx, 'workType', e.target.value)}
                                  style={inputStyle}
                                />
                              </td>
                              <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                                <input
                                  type="text"
                                  value={row.budgetAmount}
                                  onChange={(e) => updateRow(idx, 'budgetAmount', e.target.value)}
                                  style={{ ...inputStyle, textAlign: 'right' }}
                                />
                              </td>
                              <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                                <input
                                  type="text"
                                  value={row.vendor}
                                  onChange={(e) => updateRow(idx, 'vendor', e.target.value)}
                                  style={inputStyle}
                                />
                              </td>
                              <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                                <input
                                  type="text"
                                  value={row.orderAmount}
                                  onChange={(e) => updateRow(idx, 'orderAmount', e.target.value)}
                                  style={{ ...inputStyle, textAlign: 'right' }}
                                />
                              </td>
                              <td style={{ padding: '0.5rem 0.75rem', border: '1px solid #dde5f4', textAlign: 'right', color: balance < 0 ? '#dc2626' : '#059669' }}>
                                {balance.toLocaleString()}
                              </td>
                              <td style={{ padding: '0.25rem', border: '1px solid #dde5f4', textAlign: 'center' }}>
                                <button
                                  onClick={() => removeRow(idx)}
                                  disabled={rows.length <= 1}
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    fontSize: '0.75rem',
                                    backgroundColor: rows.length <= 1 ? '#e5e7eb' : '#fee2e2',
                                    color: rows.length <= 1 ? '#9ca3af' : '#dc2626',
                                    border: 'none',
                                    borderRadius: '0.25rem',
                                    cursor: rows.length <= 1 ? 'not-allowed' : 'pointer',
                                  }}
                                >
                                  ×
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <button
                    onClick={addRow}
                    style={{
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      fontSize: '0.85rem',
                      backgroundColor: '#fff',
                      color: '#0d56c9',
                      border: '1px solid #0d56c9',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                    }}
                  >
                    + 行を追加
                  </button>
                </>
              )}

              {/* PDFプレビュー */}
              {viewMode === 'pdf' && (
                <div style={{ backgroundColor: '#f0f2f7', borderRadius: '0.5rem', height: '600px' }}>
                  {pdfUrl ? (
                    <iframe
                      src={pdfUrl}
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
          </div>
        </main>
      </div>
    </div>
  );
}
