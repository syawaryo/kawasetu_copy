"use client";

import { useState } from "react";
import Link from "next/link";

interface ScheduleRow {
  workTypeCode: string;
  workType: string;
  vendor: string;
  amount: string;
}

const createEmptyRow = (): ScheduleRow => ({
  workTypeCode: '',
  workType: '',
  vendor: '',
  amount: '',
});

export default function OrderSchedulePage() {
  const [viewMode, setViewMode] = useState<'input' | 'pdf'>('input');
  const [activeTab, setActiveTab] = useState<'memo' | 'submission'>('memo');

  // メモ用の行データ
  const [memoRows, setMemoRows] = useState<ScheduleRow[]>([createEmptyRow()]);
  // 申請用の行データ
  const [submissionRows, setSubmissionRows] = useState<ScheduleRow[]>([createEmptyRow()]);

  // 現在のタブに応じた行データ
  const rows = activeTab === 'memo' ? memoRows : submissionRows;
  const setRows = activeTab === 'memo' ? setMemoRows : setSubmissionRows;

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
  const updateRow = (idx: number, field: keyof ScheduleRow, value: string) => {
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
          <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>発注予定表</h1>
        </div>
      </header>

      {/* メモ用/申請用タブ */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #dde5f4' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '0' }}>
          <button
            onClick={() => setActiveTab('memo')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              backgroundColor: activeTab === 'memo' ? '#fff' : '#f8f9fa',
              color: activeTab === 'memo' ? '#0d56c9' : '#686e78',
              borderBottom: activeTab === 'memo' ? '2px solid #0d56c9' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            メモ用
          </button>
          <button
            onClick={() => setActiveTab('submission')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              backgroundColor: activeTab === 'submission' ? '#fff' : '#f8f9fa',
              color: activeTab === 'submission' ? '#0d56c9' : '#686e78',
              borderBottom: activeTab === 'submission' ? '2px solid #0d56c9' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            申請用
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <main style={{ padding: '1.5rem 24px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', padding: '2rem' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1c20', margin: 0 }}>
                    発注予定表（{activeTab === 'memo' ? 'メモ用' : '申請用'}）
                  </p>
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

              {/* テーブル */}
              {viewMode === 'input' && (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', width: '100px', color: '#1a1c20' }}>工種コード</th>
                          <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', color: '#1a1c20' }}>工種</th>
                          <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', color: '#1a1c20' }}>発注予定業者</th>
                          <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4', width: '150px', color: '#1a1c20' }}>発注予定金額</th>
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
                                value={row.vendor}
                                onChange={(e) => updateRow(idx, 'vendor', e.target.value)}
                                style={inputStyle}
                              />
                            </td>
                            <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                              <input
                                type="text"
                                value={row.amount}
                                onChange={(e) => updateRow(idx, 'amount', e.target.value)}
                                style={{ ...inputStyle, textAlign: 'right' }}
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
                <div style={{ backgroundColor: '#f0f2f7', borderRadius: '0.5rem', height: '600px' }}>
                  <iframe
                    src="/発注予定（サンプルデータ）.pdf"
                    style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }}
                    title="発注予定表"
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
