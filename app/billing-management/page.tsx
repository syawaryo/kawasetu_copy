"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface BillingRow {
  billingNo: string;
  billingDate: string;
  billingAmount: string;
  taxAmount: string;
  totalAmount: string;
  dueDate: string;
  paymentDate: string;
  paymentAmount: string;
  status: string;
  remarks: string;
}

const createEmptyRow = (): BillingRow => ({
  billingNo: '',
  billingDate: '',
  billingAmount: '',
  taxAmount: '',
  totalAmount: '',
  dueDate: '',
  paymentDate: '',
  paymentAmount: '',
  status: '',
  remarks: '',
});

export default function BillingManagementPage() {
  const router = useRouter();

  // 工事番号関連
  const [projectNumber, setProjectNumber] = useState("");
  const [loadError, setLoadError] = useState("");

  // 工事情報
  const [projectName, setProjectName] = useState("");
  const [client, setClient] = useState("");
  const [contractAmount, setContractAmount] = useState("");

  // 請求行データ
  const [rows, setRows] = useState<BillingRow[]>([createEmptyRow()]);

  // 工事番号バリデーション（9桁-3桁）
  const validateProjectNumber = (num: string): boolean => {
    const pattern = /^\d{9}-\d{3}$/;
    return pattern.test(num);
  };

  // 工事番号で請求管理データを読み込む
  const handleLoadByProjectNumber = () => {
    setLoadError("");

    if (!projectNumber.trim()) {
      setLoadError("工事番号を入力してください");
      return;
    }

    if (!validateProjectNumber(projectNumber)) {
      setLoadError("工事番号は「数字9桁-3桁」の形式で入力してください（例：123456789-001）");
      return;
    }

    // TODO: 実際のAPIから請求管理データを取得する処理
    alert(`工事番号 ${projectNumber} の請求管理データを読み込みます`);
  };

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
  const updateRow = (idx: number, field: keyof BillingRow, value: string) => {
    setRows(rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  // 数値変換
  const toNum = (v: string) => {
    const n = Number(String(v).replace(/[,\s]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  // 数値フォーマット
  const formatNum = (n: number) => n.toLocaleString();

  // 合計計算
  const totalBillingAmount = rows.reduce((sum, row) => sum + toNum(row.billingAmount), 0);
  const totalTaxAmount = rows.reduce((sum, row) => sum + toNum(row.taxAmount), 0);
  const totalAmount = rows.reduce((sum, row) => sum + toNum(row.totalAmount), 0);
  const totalPaymentAmount = rows.reduce((sum, row) => sum + toNum(row.paymentAmount), 0);
  const remainingAmount = totalAmount - totalPaymentAmount;

  const inputStyle = {
    width: '100%',
    padding: '0.3rem 0.4rem',
    fontSize: '0.8rem',
    border: '1px solid #dde5f4',
    borderRadius: '0.25rem',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f7' }}>
      <header style={{ backgroundColor: '#132942', color: '#fff', padding: '0.75rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>請求管理表</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => router.push('/function-master')}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.5)',
                color: '#fff',
                borderRadius: '0.375rem',
                cursor: 'pointer',
              }}
            >
              ← 機能マスタへ戻る
            </button>
            <button
              onClick={() => alert('保存しました')}
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: '#fff',
                color: '#132942',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
              }}
            >
              保存
            </button>
            <button
              onClick={() => alert('申請しました')}
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
              }}
            >
              申請
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <main style={{ padding: '1.5rem 24px' }}>
          {/* 工事番号入力エリア */}
          <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>
                  工事番号
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <div>
                    <input
                      type="text"
                      value={projectNumber}
                      onChange={(e) => {
                        setProjectNumber(e.target.value);
                        setLoadError("");
                      }}
                      placeholder="123456789-001"
                      style={{
                        width: '200px',
                        padding: '0.5rem',
                        fontSize: '0.85rem',
                        border: `1px solid ${loadError ? '#dc3545' : '#dde5f4'}`,
                        borderRadius: '0.25rem',
                      }}
                    />
                    {loadError && (
                      <div style={{ fontSize: '0.75rem', color: '#dc3545', marginTop: '0.25rem', maxWidth: '300px' }}>
                        {loadError}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleLoadByProjectNumber}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      backgroundColor: '#0d6efd',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    読込
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>
                  工事名
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  style={{ width: '300px', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>
                  発注者
                </label>
                <input
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  style={{ width: '200px', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>
                  契約金額
                </label>
                <input
                  type="text"
                  value={contractAmount}
                  onChange={(e) => setContractAmount(e.target.value)}
                  style={{ width: '150px', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', textAlign: 'right' }}
                />
              </div>
            </div>
          </div>

          {/* サマリー */}
          <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#1a1c20' }}>請求サマリー</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#686e78', marginBottom: '0.25rem' }}>請求額合計（税抜）</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1c20' }}>{formatNum(totalBillingAmount)}</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#686e78', marginBottom: '0.25rem' }}>消費税合計</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1c20' }}>{formatNum(totalTaxAmount)}</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#686e78', marginBottom: '0.25rem' }}>請求額合計（税込）</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1c20' }}>{formatNum(totalAmount)}</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#e8f5e9', borderRadius: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#2e7d32', marginBottom: '0.25rem' }}>入金済額</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2e7d32' }}>{formatNum(totalPaymentAmount)}</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: remainingAmount > 0 ? '#fff3e0' : '#f8f9fa', borderRadius: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: remainingAmount > 0 ? '#e65100' : '#686e78', marginBottom: '0.25rem' }}>未入金額</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: remainingAmount > 0 ? '#e65100' : '#1a1c20' }}>{formatNum(remainingAmount)}</div>
              </div>
            </div>
          </div>

          {/* 請求明細テーブル */}
          <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', padding: '2rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#1a1c20' }}>請求明細</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', width: '100px', color: '#1a1c20' }}>請求No.</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', width: '110px', color: '#1a1c20' }}>請求日</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4', width: '120px', color: '#1a1c20' }}>請求額（税抜）</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4', width: '100px', color: '#1a1c20' }}>消費税</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4', width: '120px', color: '#1a1c20' }}>請求額（税込）</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', width: '110px', color: '#1a1c20' }}>入金予定日</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', width: '110px', color: '#1a1c20' }}>入金日</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4', width: '120px', color: '#1a1c20' }}>入金額</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'center', border: '1px solid #dde5f4', width: '80px', color: '#1a1c20' }}>状態</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', color: '#1a1c20' }}>備考</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'center', border: '1px solid #dde5f4', width: '50px', color: '#1a1c20' }}>削除</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                        <input
                          type="text"
                          value={row.billingNo}
                          onChange={(e) => updateRow(idx, 'billingNo', e.target.value)}
                          style={inputStyle}
                        />
                      </td>
                      <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                        <input
                          type="date"
                          value={row.billingDate}
                          onChange={(e) => updateRow(idx, 'billingDate', e.target.value)}
                          style={inputStyle}
                        />
                      </td>
                      <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                        <input
                          type="text"
                          value={row.billingAmount}
                          onChange={(e) => updateRow(idx, 'billingAmount', e.target.value)}
                          style={{ ...inputStyle, textAlign: 'right' }}
                        />
                      </td>
                      <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                        <input
                          type="text"
                          value={row.taxAmount}
                          onChange={(e) => updateRow(idx, 'taxAmount', e.target.value)}
                          style={{ ...inputStyle, textAlign: 'right' }}
                        />
                      </td>
                      <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                        <input
                          type="text"
                          value={row.totalAmount}
                          onChange={(e) => updateRow(idx, 'totalAmount', e.target.value)}
                          style={{ ...inputStyle, textAlign: 'right' }}
                        />
                      </td>
                      <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                        <input
                          type="date"
                          value={row.dueDate}
                          onChange={(e) => updateRow(idx, 'dueDate', e.target.value)}
                          style={inputStyle}
                        />
                      </td>
                      <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                        <input
                          type="date"
                          value={row.paymentDate}
                          onChange={(e) => updateRow(idx, 'paymentDate', e.target.value)}
                          style={inputStyle}
                        />
                      </td>
                      <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                        <input
                          type="text"
                          value={row.paymentAmount}
                          onChange={(e) => updateRow(idx, 'paymentAmount', e.target.value)}
                          style={{ ...inputStyle, textAlign: 'right' }}
                        />
                      </td>
                      <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                        <select
                          value={row.status}
                          onChange={(e) => updateRow(idx, 'status', e.target.value)}
                          style={{ ...inputStyle, textAlign: 'center' }}
                        >
                          <option value="">-</option>
                          <option value="未請求">未請求</option>
                          <option value="請求済">請求済</option>
                          <option value="入金済">入金済</option>
                          <option value="一部入金">一部入金</option>
                        </select>
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
          </div>
        </main>
      </div>
    </div>
  );
}
