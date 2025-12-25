"use client";

import { useState } from "react";
import Link from "next/link";

interface ScheduleRow {
  workTypeCode: string;
  workType: string;
  vendor: string;
  amount: string;
}

interface HierarchyRow {
  hierarchyType: string;
  hierarchyData: string;
  hierarchy: string;
}

const createEmptyRow = (): ScheduleRow => ({
  workTypeCode: '',
  workType: '',
  vendor: '',
  amount: '',
});

const createEmptyHierarchyRow = (): HierarchyRow => ({
  hierarchyType: '',
  hierarchyData: '',
  hierarchy: '',
});

export default function OrderSchedulePage() {
  const [viewMode, setViewMode] = useState<'input' | 'pdf'>('input');
  const [activeTab, setActiveTab] = useState<'memo' | 'submission'>('memo');
  const [tableUIMode, setTableUIMode] = useState<'standard' | 'hierarchy'>('standard');

  // メモ用の行データ
  const [memoRows, setMemoRows] = useState<ScheduleRow[]>([createEmptyRow()]);
  // 申請用の行データ
  const [submissionRows, setSubmissionRows] = useState<ScheduleRow[]>([createEmptyRow()]);

  // 階層UI用の行データ
  const [memoHierarchyRows, setMemoHierarchyRows] = useState<HierarchyRow[]>([
    { hierarchyType: '組織構造', hierarchyData: '組織_2025年度', hierarchy: 'すべて' },
    { hierarchyType: '科目構造 (2)', hierarchyData: '組織_2025年度', hierarchy: 'すべて' },
    { hierarchyType: '組織構造', hierarchyData: '組織_2025年度', hierarchy: 'すべて' },
  ]);
  const [submissionHierarchyRows, setSubmissionHierarchyRows] = useState<HierarchyRow[]>([
    { hierarchyType: '組織構造', hierarchyData: '組織_2025年度', hierarchy: 'すべて' },
    { hierarchyType: '科目構造 (2)', hierarchyData: '組織_2025年度', hierarchy: 'すべて' },
    { hierarchyType: '組織構造', hierarchyData: '組織_2025年度', hierarchy: 'すべて' },
  ]);

  // 現在のタブに応じた行データ
  const rows = activeTab === 'memo' ? memoRows : submissionRows;
  const setRows = activeTab === 'memo' ? setMemoRows : setSubmissionRows;

  // 階層UI用の行データ
  const hierarchyRows = activeTab === 'memo' ? memoHierarchyRows : submissionHierarchyRows;
  const setHierarchyRows = activeTab === 'memo' ? setMemoHierarchyRows : setSubmissionHierarchyRows;

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

  // 階層UI用の行追加
  const addHierarchyRow = () => {
    setHierarchyRows([...hierarchyRows, createEmptyHierarchyRow()]);
  };

  // 階層UI用の行削除
  const removeHierarchyRow = (idx: number) => {
    if (hierarchyRows.length > 1) {
      setHierarchyRows(hierarchyRows.filter((_, i) => i !== idx));
    }
  };

  // 階層UI用の行更新
  const updateHierarchyRow = (idx: number, field: keyof HierarchyRow, value: string) => {
    setHierarchyRows(hierarchyRows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const inputStyle = {
    width: '100%',
    padding: '0.4rem',
    fontSize: '0.85rem',
    border: '1px solid #dde5f4',
    borderRadius: '0.25rem',
    boxSizing: 'border-box' as const,
  };

  const hierarchyPalette = {
    surface: '#ffffff',
    panel: '#f3f4f6',
    border: '#e6e8ee',
    borderSoft: '#eef0f4',
    text: '#1a1c20',
    textSubtle: '#8a9099',
    icon: '#9aa1ab',
    danger: '#e56a6a',
    dangerBorder: '#f1b1b1',
  };

  const hierarchyFieldStyle = {
    width: '100%',
    height: '44px',
    padding: '0 14px',
    fontSize: '0.9rem',
    border: `1px solid ${hierarchyPalette.border}`,
    borderRadius: '10px',
    boxSizing: 'border-box' as const,
    backgroundColor: hierarchyPalette.surface,
    color: hierarchyPalette.text,
    outline: 'none',
  };

  const hierarchySelectWrapperStyle = {
    position: 'relative' as const,
    width: '100%',
  };

  const hierarchyChevronStyle = {
    position: 'absolute' as const,
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: hierarchyPalette.icon,
    pointerEvents: 'none' as const,
    fontSize: '0.85rem',
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
                  {viewMode === 'input' && (
                    <button
                      onClick={() => setTableUIMode(tableUIMode === 'standard' ? 'hierarchy' : 'standard')}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.7rem',
                        fontWeight: 400,
                        backgroundColor: 'transparent',
                        color: '#686e78',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        opacity: 0.6,
                        textDecoration: 'underline',
                      }}
                      title="UI切り替え"
                    >
                      {tableUIMode === 'standard' ? '階層UI' : '標準UI'}
                    </button>
                  )}
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
                  {tableUIMode === 'standard' ? (
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
                  ) : (
                    <>
                      {/* 階層UIパターン */}
                      <div
                        style={{
                          backgroundColor: hierarchyPalette.panel,
                          border: `1px solid ${hierarchyPalette.border}`,
                          borderRadius: '14px',
                          padding: '14px',
                        }}
                      >
                        {/* header */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '34px 260px 260px 1fr 76px',
                            alignItems: 'center',
                            gap: '14px',
                            padding: '4px 8px 10px 8px',
                            color: hierarchyPalette.textSubtle,
                            fontSize: '0.78rem',
                            fontWeight: 600,
                          }}
                        >
                          <div />
                          <div>階層種別</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span>階層データ</span>
                            <span
                              title="階層データについて"
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '999px',
                                backgroundColor: '#fff3cf',
                                border: '1px solid #f2c15d',
                                color: '#a87410',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                lineHeight: 1,
                              }}
                            >
                              i
                            </span>
                          </div>
                          <div>階層</div>
                          <div />
                        </div>

                        {/* rows */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {hierarchyRows.map((row, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '34px 260px 260px 1fr 76px',
                                alignItems: 'center',
                                gap: '14px',
                                padding: '12px',
                                border: `1px solid ${hierarchyPalette.borderSoft}`,
                                borderRadius: '12px',
                                backgroundColor: hierarchyPalette.surface,
                              }}
                            >
                              {/* drag handle */}
                              <div style={{ display: 'flex', justifyContent: 'center', cursor: 'grab' }} title="並び替え">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', opacity: 0.45 }}>
                                  <div style={{ width: '14px', height: '2px', backgroundColor: hierarchyPalette.icon }} />
                                  <div style={{ width: '14px', height: '2px', backgroundColor: hierarchyPalette.icon }} />
                                  <div style={{ width: '14px', height: '2px', backgroundColor: hierarchyPalette.icon }} />
                                </div>
                              </div>

                              {/* 階層種別 */}
                              <input
                                type="text"
                                value={row.hierarchyType}
                                onChange={(e) => updateHierarchyRow(idx, 'hierarchyType', e.target.value)}
                                style={hierarchyFieldStyle}
                                placeholder="例）組織構造"
                              />

                              {/* 階層データ（select風） */}
                              <div style={hierarchySelectWrapperStyle}>
                                <select
                                  value={row.hierarchyData}
                                  onChange={(e) => updateHierarchyRow(idx, 'hierarchyData', e.target.value)}
                                  style={{
                                    ...hierarchyFieldStyle,
                                    appearance: 'none' as const,
                                    paddingRight: '2rem',
                                  }}
                                >
                                  <option value="">選択してください</option>
                                  <option value="組織_2025年度">組織_2025年度</option>
                                  <option value="科目_2025年度">科目_2025年度</option>
                                </select>
                                <span style={hierarchyChevronStyle}>▼</span>
                              </div>

                              {/* 階層（select風 + 編集） */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ ...hierarchySelectWrapperStyle, flex: 1 }}>
                                  <select
                                    value={row.hierarchy}
                                    onChange={(e) => updateHierarchyRow(idx, 'hierarchy', e.target.value)}
                                    style={{
                                      ...hierarchyFieldStyle,
                                      appearance: 'none' as const,
                                      paddingRight: '2rem',
                                    }}
                                  >
                                    <option value="">選択してください</option>
                                    <option value="すべて">すべて</option>
                                    <option value="第一階層">第一階層</option>
                                    <option value="第二階層">第二階層</option>
                                  </select>
                                  <span style={hierarchyChevronStyle}>▼</span>
                                </div>

                                <button
                                  type="button"
                                  title="編集"
                                  style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '10px',
                                    border: `1px solid ${hierarchyPalette.dangerBorder}`,
                                    backgroundColor: hierarchyPalette.surface,
                                    color: hierarchyPalette.danger,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  ✎
                                </button>
                              </div>

                              {/* delete */}
                              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => removeHierarchyRow(idx)}
                                  disabled={hierarchyRows.length <= 1}
                                  title="削除"
                                  style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '999px',
                                    border: 'none',
                                    backgroundColor: hierarchyRows.length <= 1 ? '#e5e7eb' : '#f3f4f6',
                                    color: hierarchyRows.length <= 1 ? '#9ca3af' : hierarchyPalette.textSubtle,
                                    cursor: hierarchyRows.length <= 1 ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div style={{ textAlign: 'center', paddingTop: '14px' }}>
                          <button
                            onClick={addHierarchyRow}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: hierarchyPalette.textSubtle,
                              fontSize: '0.95rem',
                              cursor: 'pointer',
                              padding: '8px 12px',
                            }}
                          >
                            + 追加
                          </button>
                        </div>
                      </div>
                    </>
                  )}
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
