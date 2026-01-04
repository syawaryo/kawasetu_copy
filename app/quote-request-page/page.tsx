"use client";

import { useState } from "react";
import Link from "next/link";

interface QuoteRequestRow {
  workTypeCode: string;
  workType: string;
  specification: string;
  quantity: string;
  unit: string;
  remarks: string;
}

const createEmptyRow = (): QuoteRequestRow => ({
  workTypeCode: '',
  workType: '',
  specification: '',
  quantity: '',
  unit: '',
  remarks: '',
});

export default function QuoteRequestPage() {
  const [viewMode, setViewMode] = useState<'input' | 'pdf'>('input');

  // ヘッダー情報
  const [header, setHeader] = useState({
    vendorName: '',
    projectName: '',
    deliveryDate: '',
    deliveryPlace: '',
  });

  // 行データ
  const [rows, setRows] = useState<QuoteRequestRow[]>([createEmptyRow()]);

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
  const updateRow = (idx: number, field: keyof QuoteRequestRow, value: string) => {
    setRows(rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
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
          <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>見積依頼書</h1>
        </div>
      </header>

      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <main style={{ padding: '1.5rem 24px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', padding: '2rem' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1c20', margin: 0 }}>見積依頼書</p>
                  <button
                    onClick={() => setViewMode(viewMode === 'input' ? 'pdf' : 'input')}
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
                    {viewMode === 'input' ? 'PDFプレビュー' : '一覧に戻る'}
                  </button>
                </div>
              </div>

              {/* ヘッダー情報 */}
              {viewMode === 'input' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', border: '1px solid #dde5f4' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#1a1c20' }}>依頼先業者名</label>
                    <input
                      type="text"
                      value={header.vendorName}
                      onChange={(e) => setHeader({ ...header, vendorName: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#1a1c20' }}>工事名</label>
                    <input
                      type="text"
                      value={header.projectName}
                      onChange={(e) => setHeader({ ...header, projectName: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#1a1c20' }}>納期</label>
                    <input
                      type="text"
                      value={header.deliveryDate}
                      onChange={(e) => setHeader({ ...header, deliveryDate: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#1a1c20' }}>納入場所</label>
                    <input
                      type="text"
                      value={header.deliveryPlace}
                      onChange={(e) => setHeader({ ...header, deliveryPlace: e.target.value })}
                      style={inputStyle}
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
                          <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', color: '#1a1c20' }}>工種・品名</th>
                          <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', color: '#1a1c20' }}>仕様</th>
                          <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4', width: '100px', color: '#1a1c20' }}>数量</th>
                          <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'center', border: '1px solid #dde5f4', width: '80px', color: '#1a1c20' }}>単位</th>
                          <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', width: '150px', color: '#1a1c20' }}>備考</th>
                          <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'center', border: '1px solid #dde5f4', width: '60px', color: '#1a1c20' }}>削除</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, idx) => (
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
                                value={row.specification}
                                onChange={(e) => updateRow(idx, 'specification', e.target.value)}
                                style={inputStyle}
                              />
                            </td>
                            <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                              <input
                                type="text"
                                value={row.quantity}
                                onChange={(e) => updateRow(idx, 'quantity', e.target.value)}
                                style={{ ...inputStyle, textAlign: 'right' }}
                              />
                            </td>
                            <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                              <input
                                type="text"
                                value={row.unit}
                                onChange={(e) => updateRow(idx, 'unit', e.target.value)}
                                style={{ ...inputStyle, textAlign: 'center' }}
                              />
                            </td>
                            <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                              <input
                                type="text"
                                value={row.remarks}
                                onChange={(e) => updateRow(idx, 'remarks', e.target.value)}
                                style={inputStyle}
                              />
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
                        ))}
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
                <div style={{ backgroundColor: '#f0f2f7', borderRadius: '0.5rem', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: '#686e78' }}>PDFプレビュー（準備中）</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
