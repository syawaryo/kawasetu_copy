"use client";

import { useState } from "react";

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
  const [activeTab, setActiveTab] = useState<'memo' | 'submission'>('memo');
  const [tableUIMode, setTableUIMode] = useState<'standard' | 'hierarchy' | 'dense'>('standard');

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
    padding: '0.3rem 0.4rem',
    fontSize: '0.8rem',
    border: '1px solid #dde5f4',
    borderRadius: '0.35rem',
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

  const compactFieldStyle = {
    width: '100%',
    height: '34px',
    padding: '0 10px',
    fontSize: '0.82rem',
    border: `1px solid ${hierarchyPalette.border}`,
    borderRadius: '8px',
    boxSizing: 'border-box' as const,
    backgroundColor: hierarchyPalette.surface,
    color: hierarchyPalette.text,
    outline: 'none',
  };

  const denseCellInputStyle = {
    width: '100%',
    height: '22px',
    padding: '0 2px',
    fontSize: '0.78rem',
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const densePalette = {
    border: '#d1d5db',
    headerBg: '#f3f4f6',
    headerText: '#374151',
    rowA: '#ffffff',
    rowB: '#f9fafb',
    cellText: '#111827',
    icon: '#6b7280',
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
                    onClick={() =>
                      setTableUIMode((prev) =>
                        prev === 'standard' ? 'hierarchy' : prev === 'hierarchy' ? 'dense' : 'standard'
                      )
                    }
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
                    UI: {tableUIMode === 'standard' ? '標準' : tableUIMode === 'hierarchy' ? 'スリム' : '表'}
                  </button>
                  <button
                    style={{
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      backgroundColor: '#fff',
                      color: '#0d56c9',
                      border: '1px solid #0d56c9',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      display: 'none',
                    }}
                  >
                    PDFプレビュー
                  </button>
                </div>
              </div>

              {/* テーブル */}
              <>
                {tableUIMode === 'standard' ? (
                  <>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr>
                            <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', width: '110px', color: '#1a1c20' }}>工種コード</th>
                            <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', color: '#1a1c20' }}>工種</th>
                            <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', color: '#1a1c20' }}>発注予定業者</th>
                            <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4', width: '160px', color: '#1a1c20' }}>発注予定金額</th>
                            <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'center', border: '1px solid #dde5f4', width: '56px', color: '#1a1c20' }}>削除</th>
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
                        marginTop: '0.75rem',
                        padding: '0.45rem 0.9rem',
                        fontSize: '0.82rem',
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
                ) : tableUIMode === 'hierarchy' ? (
                  <>
                      {/* 階層UIパターン */}
                      <div
                        style={{
                          backgroundColor: hierarchyPalette.panel,
                          border: `1px solid ${hierarchyPalette.border}`,
                          borderRadius: '14px',
                        padding: '10px',
                        }}
                      >
                        {/* header */}
                        <div
                          style={{
                            display: 'grid',
                          gridTemplateColumns: '28px 120px 1fr 1fr 160px 44px',
                            alignItems: 'center',
                          gap: '10px',
                          padding: '2px 6px 6px 6px',
                            color: hierarchyPalette.textSubtle,
                          fontSize: '0.72rem',
                            fontWeight: 600,
                          }}
                        >
                          <div />
                        <div>工種コード</div>
                        <div>工種</div>
                        <div>発注予定業者</div>
                        <div style={{ textAlign: 'right' }}>発注予定金額</div>
                        <div style={{ textAlign: 'center' }} />
                        </div>

                        {/* rows */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {rows.map((row, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'grid',
                              gridTemplateColumns: '28px 120px 1fr 1fr 160px 44px',
                                alignItems: 'center',
                              gap: '10px',
                              padding: '8px',
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

                            {/* 工種コード */}
                              <input
                                type="text"
                              value={row.workTypeCode}
                              onChange={(e) => updateRow(idx, 'workTypeCode', e.target.value)}
                              style={compactFieldStyle}
                              placeholder="例）A01"
                              />

                            {/* 工種 */}
                            <input
                              type="text"
                              value={row.workType}
                              onChange={(e) => updateRow(idx, 'workType', e.target.value)}
                              style={compactFieldStyle}
                              placeholder="例）空調"
                            />

                            {/* 発注予定業者 */}
                            <input
                              type="text"
                              value={row.vendor}
                              onChange={(e) => updateRow(idx, 'vendor', e.target.value)}
                              style={compactFieldStyle}
                              placeholder="例）〇〇設備"
                            />

                            {/* 発注予定金額 */}
                            <input
                              type="text"
                              value={row.amount}
                              onChange={(e) => updateRow(idx, 'amount', e.target.value)}
                              style={{ ...compactFieldStyle, textAlign: 'right' }}
                              placeholder="0"
                            />

                              {/* delete */}
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <button
                                onClick={() => removeRow(idx)}
                                disabled={rows.length <= 1}
                                  title="削除"
                                  style={{
                                  width: '32px',
                                  height: '32px',
                                    borderRadius: '999px',
                                    border: 'none',
                                  backgroundColor: rows.length <= 1 ? '#e5e7eb' : '#f3f4f6',
                                  color: rows.length <= 1 ? '#9ca3af' : hierarchyPalette.textSubtle,
                                  cursor: rows.length <= 1 ? 'not-allowed' : 'pointer',
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

                      <div style={{ textAlign: 'center', paddingTop: '10px' }}>
                          <button
                          onClick={addRow}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: hierarchyPalette.textSubtle,
                            fontSize: '0.9rem',
                              cursor: 'pointer',
                            padding: '6px 10px',
                            }}
                          >
                            + 追加
                          </button>
                        </div>
                      </div>
                  </>
                ) : (
                  <>
                    {/* がっつり表パターン（密なグリッド） */}
                    <div
                      style={{
                        overflowX: 'auto',
                        border: `1px solid ${densePalette.border}`,
                        borderRadius: 0,
                        backgroundColor: '#fff',
                      }}
                    >
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                        <thead>
                          <tr>
                            <th
                              style={{
                                padding: '6px 8px',
                                textAlign: 'left',
                                border: `1px solid ${densePalette.border}`,
                                backgroundColor: densePalette.headerBg,
                                color: densePalette.headerText,
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                width: '110px',
                              }}
                            >
                              工種コード
                            </th>
                            <th
                              style={{
                                padding: '6px 8px',
                                textAlign: 'left',
                                border: `1px solid ${densePalette.border}`,
                                backgroundColor: densePalette.headerBg,
                                color: densePalette.headerText,
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              工種
                            </th>
                            <th
                              style={{
                                padding: '6px 8px',
                                textAlign: 'left',
                                border: `1px solid ${densePalette.border}`,
                                backgroundColor: densePalette.headerBg,
                                color: densePalette.headerText,
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              発注予定業者
                            </th>
                            <th
                              style={{
                                padding: '6px 8px',
                                textAlign: 'right',
                                border: `1px solid ${densePalette.border}`,
                                backgroundColor: densePalette.headerBg,
                                color: densePalette.headerText,
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                width: '160px',
                              }}
                            >
                              発注予定金額
                            </th>
                            <th
                              style={{
                                padding: '6px 8px',
                                textAlign: 'center',
                                border: `1px solid ${densePalette.border}`,
                                backgroundColor: densePalette.headerBg,
                                color: densePalette.headerText,
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                width: '56px',
                              }}
                            >
                              削除
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, idx) => (
                            <tr
                              key={idx}
                              style={{
                                backgroundColor: idx % 2 === 0 ? densePalette.rowA : densePalette.rowB,
                                color: densePalette.cellText,
                              }}
                            >
                              <td style={{ padding: '4px 6px', border: `1px solid ${densePalette.border}` }}>
                                <input
                                  type="text"
                                  value={row.workTypeCode}
                                  onChange={(e) => updateRow(idx, 'workTypeCode', e.target.value)}
                                  style={denseCellInputStyle}
                                />
                              </td>
                              <td style={{ padding: '4px 6px', border: `1px solid ${densePalette.border}` }}>
                                <input
                                  type="text"
                                  value={row.workType}
                                  onChange={(e) => updateRow(idx, 'workType', e.target.value)}
                                  style={denseCellInputStyle}
                                />
                              </td>
                              <td style={{ padding: '4px 6px', border: `1px solid ${densePalette.border}` }}>
                                <input
                                  type="text"
                                  value={row.vendor}
                                  onChange={(e) => updateRow(idx, 'vendor', e.target.value)}
                                  style={denseCellInputStyle}
                                />
                              </td>
                              <td style={{ padding: '4px 6px', border: `1px solid ${densePalette.border}`, textAlign: 'right' }}>
                                <input
                                  type="text"
                                  value={row.amount}
                                  onChange={(e) => updateRow(idx, 'amount', e.target.value)}
                                  style={{ ...denseCellInputStyle, textAlign: 'right' }}
                                />
                              </td>
                              <td style={{ padding: '2px 6px', border: `1px solid ${densePalette.border}`, textAlign: 'center' }}>
                                <button
                                  onClick={() => removeRow(idx)}
                                  disabled={rows.length <= 1}
                                  style={{
                                    width: '26px',
                                    height: '22px',
                                    fontSize: '0.95rem',
                                    backgroundColor: 'transparent',
                                    color: rows.length <= 1 ? '#9ca3af' : densePalette.icon,
                                    border: 'none',
                                    borderRadius: 0,
                                    cursor: rows.length <= 1 ? 'not-allowed' : 'pointer',
                                    lineHeight: 1,
                                  }}
                                  title="削除"
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
                        marginTop: '0.75rem',
                        padding: '0.45rem 0.9rem',
                        fontSize: '0.82rem',
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
              </>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
