"use client";

import {
  DetailRow,
  AdvanceRow,
  VendorRow,
  VendorFormData,
  OrderHeader,
  createEmptyDetailRow,
} from "../../contexts/OrderDataContext";
import { SubjectMaster } from "../types";

interface OrderFormSectionProps {
  header: OrderHeader;
  setHeader: (updater: OrderHeader | ((h: OrderHeader) => OrderHeader)) => void;
  rows: DetailRow[];
  setRows: (updater: DetailRow[] | ((r: DetailRow[]) => DetailRow[])) => void;
  advanceRows: AdvanceRow[];
  setAdvanceRows: (updater: AdvanceRow[] | ((r: AdvanceRow[]) => AdvanceRow[])) => void;
  vendorForm: VendorFormData;
  setVendorForm: (updater: VendorFormData | ((f: VendorFormData) => VendorFormData)) => void;
  vendorRows: VendorRow[];
  setVendorRows: (updater: VendorRow[] | ((r: VendorRow[]) => VendorRow[])) => void;
  percentByRow: string[];
  subjectMaster: SubjectMaster[];
}

export default function OrderFormSection({
  header,
  setHeader,
  rows,
  setRows,
  advanceRows,
  setAdvanceRows,
  vendorForm,
  setVendorForm,
  vendorRows,
  setVendorRows,
  percentByRow,
  subjectMaster,
}: OrderFormSectionProps) {
  // 工種コード変更時にマスターから自動入力
  const handleWorkTypeCodeChange = (idx: number, code: string) => {
    const next = [...rows];
    const normalizedCode = code
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
      .toUpperCase();
    const master = subjectMaster.find(m => m.code === normalizedCode);
    if (master) {
      next[idx].workTypeCode = master.code;
      next[idx].workType = master.name;
      next[idx].execBudget = master.budget.toString();
    } else {
      next[idx].workTypeCode = code;
    }
    setRows(next);
  };

  return (
    <>
      {/* 注文書情報 */}
      <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #dde5f4', backgroundColor: '#f8f9fa' }}>
          <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>注文書情報</h2>
        </div>
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#dc3545' }}>注文書No. *</label>
              <input type="text" value={header.orderNo} onChange={(e) => setHeader((h) => ({ ...h, orderNo: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>履歴No.</label>
              <select value={header.historyNo} onChange={(e) => setHeader((h) => ({ ...h, historyNo: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                <option>01</option>
                <option>02</option>
                <option>03</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#dc3545' }}>注文書作成日 *</label>
              <input type="date" value={header.createdDate} onChange={(e) => setHeader((h) => ({ ...h, createdDate: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#dc3545' }}>注文書発注日 *</label>
              <input type="date" value={header.orderDate} onChange={(e) => setHeader((h) => ({ ...h, orderDate: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>JV負担区分</label>
              <select value={header.jvShare} onChange={(e) => setHeader((h) => ({ ...h, jvShare: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                <option>(未選択)</option>
                <option>JV-主</option>
                <option>JV-従</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>注文請書受取日</label>
              <input type="date" value={header.receivedDate} onChange={(e) => setHeader((h) => ({ ...h, receivedDate: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>契約工期（開始）</label>
              <input type="date" value={header.contractFrom} onChange={(e) => setHeader((h) => ({ ...h, contractFrom: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>契約工期（終了）</label>
              <input type="date" value={header.contractTo} onChange={(e) => setHeader((h) => ({ ...h, contractTo: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>印紙対象・印刷設定</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><input type="checkbox" checked={header.stampTarget} onChange={(e) => setHeader((h) => ({ ...h, stampTarget: e.target.checked }))} /> 印紙対象</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><input type="checkbox" checked={header.printOrder} onChange={(e) => setHeader((h) => ({ ...h, printOrder: e.target.checked }))} /> 注文書</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><input type="checkbox" checked={header.printCopy} onChange={(e) => setHeader((h) => ({ ...h, printCopy: e.target.checked }))} /> 控え</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><input type="checkbox" checked={header.printShosho} onChange={(e) => setHeader((h) => ({ ...h, printShosho: e.target.checked }))} /> 請書</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><input type="checkbox" checked={header.printInvoice} onChange={(e) => setHeader((h) => ({ ...h, printInvoice: e.target.checked }))} /> 請求書</label>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#dc3545' }}>発注先 *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" value={header.vendor} onChange={(e) => setHeader((h) => ({ ...h, vendor: e.target.value }))} style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
                <button type="button" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#0d56c9', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  選択
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#dc3545' }}>工事 *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" value={header.project} onChange={(e) => setHeader((h) => ({ ...h, project: e.target.value }))} style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
                <button type="button" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#0d56c9', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  選択
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#dc3545' }}>発行部門 *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" value={header.dept} onChange={(e) => setHeader((h) => ({ ...h, dept: e.target.value }))} style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
                <button type="button" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#0d56c9', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  選択
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#dc3545' }}>件名 *</label>
              <input type="text" value={header.subject} onChange={(e) => setHeader((h) => ({ ...h, subject: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 発注明細 */}
      <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #dde5f4', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>発注明細</h2>
          <span style={{ fontSize: '0.75rem', color: '#686e78' }}>%： (契約金額 − 定価) ÷ 定価 × 100</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '100px', color: '#1a1c20' }}>工種コード</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', color: '#1a1c20' }}>工種</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '80px', color: '#1a1c20' }}>消費税区分</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px', color: '#1a1c20' }}>実行予算額</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px', color: '#1a1c20' }}>契約金額</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px', color: '#1a1c20' }}>予算残高</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '100px', color: '#1a1c20' }}>メーカー</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px', color: '#1a1c20' }}>定価</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '60px', color: '#1a1c20' }}>%</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px', color: '#1a1c20' }}>メリット額</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'center', borderBottom: '1px solid #dde5f4', width: '50px', color: '#1a1c20' }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.workTypeCode} onChange={(e) => handleWorkTypeCodeChange(idx, e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.workType} onChange={(e) => { const next = [...rows]; next[idx].workType = e.target.value; setRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}>
                    <select value={r.taxType} onChange={(e) => { const next = [...rows]; next[idx].taxType = e.target.value; setRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                      <option value="">-</option>
                      <option value="課税">課税</option>
                      <option value="非課税">非課税</option>
                      <option value="免税">免税</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.execBudget} onChange={(e) => { const next = [...rows]; next[idx].execBudget = e.target.value; setRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.contractAmount} onChange={(e) => { const next = [...rows]; next[idx].contractAmount = e.target.value; setRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.budgetRemain} onChange={(e) => { const next = [...rows]; next[idx].budgetRemain = e.target.value; setRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.maker} onChange={(e) => { const next = [...rows]; next[idx].maker = e.target.value; setRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.listPrice} onChange={(e) => { const next = [...rows]; next[idx].listPrice = e.target.value; setRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f0f2f7', textAlign: 'right', fontWeight: 500 }}>{percentByRow[idx]}</td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.meritAmount} onChange={(e) => { const next = [...rows]; next[idx].meritAmount = e.target.value; setRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7', textAlign: 'center' }}>
                    <button
                      onClick={() => {
                        if (rows.length > 1) {
                          setRows(rows.filter((_, i) => i !== idx));
                        }
                      }}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                      disabled={rows.length <= 1}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => setRows([...rows, createEmptyDetailRow()])}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#fff', color: '#1a1c20', border: '1px solid #dde5f4', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            行を追加
          </button>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#686e78' }}>{rows.length} 件の明細</p>
        </div>
      </div>

      {/* 立替先明細 */}
      <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #dde5f4', backgroundColor: '#f8f9fa' }}>
          <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>立替先明細</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '64px', color: '#1a1c20' }}>No.</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', color: '#1a1c20' }}>会社名</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '100px', color: '#1a1c20' }}>比率(%)</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '140px', color: '#1a1c20' }}>分担金額</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '140px', color: '#1a1c20' }}>分担金額（メリット込）</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '100px', color: '#1a1c20' }}>立替区分</th>
              </tr>
            </thead>
            <tbody>
              {advanceRows.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f0f2f7' }}>{r.no}</td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.companyName} onChange={(e) => { const next = [...advanceRows]; next[idx].companyName = e.target.value; setAdvanceRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.ratio} onChange={(e) => { const next = [...advanceRows]; next[idx].ratio = e.target.value; setAdvanceRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.shareAmount} onChange={(e) => { const next = [...advanceRows]; next[idx].shareAmount = e.target.value; setAdvanceRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.shareAmountMeritIn} onChange={(e) => { const next = [...advanceRows]; next[idx].shareAmountMeritIn = e.target.value; setAdvanceRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}>
                    <select value={r.advanceType} onChange={(e) => { const next = [...advanceRows]; next[idx].advanceType = e.target.value; setAdvanceRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                      <option value="">-</option>
                      <option value="立替">立替</option>
                      <option value="直接">直接</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 支払条件 */}
      <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #dde5f4', backgroundColor: '#f8f9fa' }}>
          <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>支払条件・特記事項</h2>
        </div>
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>法定福利費文言</label>
                <select value={vendorForm.legalWelfareDoc} onChange={(e) => setVendorForm((f) => ({ ...f, legalWelfareDoc: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                  <option>(未選択)</option>
                  <option>文言A（標準）</option>
                  <option>文言B（簡易）</option>
                  <option>文言C（詳細）</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>特記事項</label>
                <textarea rows={4} value={vendorForm.specialNote} onChange={(e) => setVendorForm((f) => ({ ...f, specialNote: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>注文側コメント</label>
                <textarea rows={2} value={vendorForm.orderComment} onChange={(e) => setVendorForm((f) => ({ ...f, orderComment: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>締切日</label>
                <input type="text" value={vendorForm.deadlineDay} onChange={(e) => setVendorForm((f) => ({ ...f, deadlineDay: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>支払日区分</label>
                <select value={vendorForm.paymentMonthType} onChange={(e) => setVendorForm((f) => ({ ...f, paymentMonthType: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                  <option>同月</option>
                  <option>翌月</option>
                  <option>翌々月</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>支払日</label>
                <input type="date" value={vendorForm.paymentDay} onChange={(e) => setVendorForm((f) => ({ ...f, paymentDay: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#dc3545' }}>支払区分 *</label>
                <select value={vendorForm.paymentType} onChange={(e) => setVendorForm((f) => ({ ...f, paymentType: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                  <option>現金</option>
                  <option>振込</option>
                  <option>手形</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>手形率</label>
                <input type="text" value={vendorForm.commissionRate} onChange={(e) => setVendorForm((f) => ({ ...f, commissionRate: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 業者見積検討結果 */}
      <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #dde5f4', backgroundColor: '#f8f9fa' }}>
          <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>業者見積検討結果</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '64px', color: '#1a1c20' }}>No.</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'center', borderBottom: '1px solid #dde5f4', width: '60px', color: '#1a1c20' }}>採用</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '100px', color: '#1a1c20' }}>取引先コード</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', color: '#1a1c20' }}>取引先名称</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '120px', color: '#1a1c20' }}>見積書日付</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', color: '#1a1c20' }}>備考</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '120px', color: '#1a1c20' }}>見積書番号</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px', color: '#1a1c20' }}>見積金額</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px', color: '#1a1c20' }}>折値後金額</th>
              </tr>
            </thead>
            <tbody>
              {vendorRows.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f0f2f7' }}>{r.no}</td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7', textAlign: 'center' }}>
                    <input type="checkbox" checked={r.adopted} onChange={(e) => { const next = [...vendorRows]; next[idx].adopted = e.target.checked; setVendorRows(next); }} />
                  </td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.vendorCode} onChange={(e) => { const next = [...vendorRows]; next[idx].vendorCode = e.target.value; setVendorRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.vendorName} onChange={(e) => { const next = [...vendorRows]; next[idx].vendorName = e.target.value; setVendorRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="date" value={r.quoteDate} onChange={(e) => { const next = [...vendorRows]; next[idx].quoteDate = e.target.value; setVendorRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.note} onChange={(e) => { const next = [...vendorRows]; next[idx].note = e.target.value; setVendorRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.quoteNo} onChange={(e) => { const next = [...vendorRows]; next[idx].quoteNo = e.target.value; setVendorRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.quoteAmount} onChange={(e) => { const next = [...vendorRows]; next[idx].quoteAmount = e.target.value; setVendorRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={r.afterDiscountAmount} onChange={(e) => { const next = [...vendorRows]; next[idx].afterDiscountAmount = e.target.value; setVendorRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
