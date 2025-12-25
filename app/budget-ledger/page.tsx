"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PDFDocument, TextAlignment } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { useOrderData, BudgetLedgerRow } from "../contexts/OrderDataContext";

// 数値変換
function toNum(v: string) {
  const n = Number(String(v).replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

// 数値フォーマット
function formatNum(n: number) {
  return n.toLocaleString();
}

// 表データの型
type BudgetLedgerTable = {
  materialExecBudget: string;
  materialOrderAmount: string;
  materialPlannedOrder: string;
  materialBudgetRemain: string;
  subcontractExecBudget: string;
  subcontractOrderAmount: string;
  subcontractPlannedOrder: string;
  subcontractBudgetRemain: string;
  expenseExecBudget: string;
  expenseOrderAmount: string;
  expensePlannedOrder: string;
  expenseBudgetRemain: string;
  totalExecBudget: string;
  totalOrderAmount: string;
  totalPlannedOrder: string;
  totalBudgetRemain: string;
};

// ヘッダーデータの型
type BudgetLedgerHeader = {
  contractor: string;
  inProgressAmount: string;
  budgetAmount: string;
  orderAmount: string;
  plannedOrder: string;
  budgetRemain: string;
  plannedProfit: string;
  estimatedCost: string;
};

const defaultHeader: BudgetLedgerHeader = {
  contractor: "",
  inProgressAmount: "",
  budgetAmount: "",
  orderAmount: "",
  plannedOrder: "",
  budgetRemain: "",
  plannedProfit: "",
  estimatedCost: "",
};

const defaultTable: BudgetLedgerTable = {
  materialExecBudget: "",
  materialOrderAmount: "",
  materialPlannedOrder: "",
  materialBudgetRemain: "",
  subcontractExecBudget: "",
  subcontractOrderAmount: "",
  subcontractPlannedOrder: "",
  subcontractBudgetRemain: "",
  expenseExecBudget: "",
  expenseOrderAmount: "",
  expensePlannedOrder: "",
  expenseBudgetRemain: "",
  totalExecBudget: "",
  totalOrderAmount: "",
  totalPlannedOrder: "",
  totalBudgetRemain: "",
};

export default function BudgetLedgerPage() {
  const router = useRouter();
  const { orders, ledgerRows, setLedgerRows } = useOrderData();

  const [header, setHeader] = useState<BudgetLedgerHeader>(defaultHeader);
  const [table, setTable] = useState<BudgetLedgerTable>(defaultTable);
  const [pdfLoading, setPdfLoading] = useState(false);

  // order-contractの全発注から工種を集めてledgerRowsを構築
  useEffect(() => {
    const allRows: BudgetLedgerRow[] = [];

    orders.forEach((order, orderIdx) => {
      order.rows.forEach((row) => {
        // 空行はスキップ
        if (!row.workType && !row.execBudget && !row.contractAmount) return;

        allRows.push({
          codeItem: row.workType || row.no,
          budgetAmount: row.execBudget,
          approvalNo: order.header.orderNo || `発注${orderIdx + 1}`,
          approvalDate: order.header.orderDate,
          orderVendor: order.header.vendor,
          orderAmount: row.contractAmount,
          plannedOrder: "", // ユーザー入力
          balance: "", // 自動計算
        });
      });
    });

    // 既存のledgerRowsのplannedOrderを保持
    const mergedRows = allRows.map((newRow, idx) => {
      const existingRow = ledgerRows[idx];
      return {
        ...newRow,
        plannedOrder: existingRow?.plannedOrder || "",
        balance: "", // 後で計算
      };
    });

    setLedgerRows(mergedRows);
  }, [orders]);

  // 残高を計算
  const computedRows = useMemo(() => {
    return ledgerRows.map(row => ({
      ...row,
      balance: formatNum(toNum(row.budgetAmount) - toNum(row.orderAmount) - toNum(row.plannedOrder)),
    }));
  }, [ledgerRows]);

  // 発注予定金額の変更
  const handlePlannedOrderChange = (idx: number, value: string) => {
    setLedgerRows(ledgerRows.map((row, i) =>
      i === idx ? { ...row, plannedOrder: value } : row
    ));
  };

  // 合計計算
  const totals = useMemo(() => {
    const total = {
      budgetAmount: 0,
      orderAmount: 0,
      plannedOrder: 0,
      balance: 0,
    };
    computedRows.forEach(row => {
      total.budgetAmount += toNum(row.budgetAmount);
      total.orderAmount += toNum(row.orderAmount);
      total.plannedOrder += toNum(row.plannedOrder);
      total.balance += toNum(row.balance);
    });
    return total;
  }, [computedRows]);

  // PDF出力
  const handleExportPDF = async () => {
    setPdfLoading(true);
    try {
      // PDFテンプレート読み込み
      const response = await fetch("/工事実行予算台帳入力欄あり.pdf");
      const pdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // 日本語フォント埋め込み
      pdfDoc.registerFontkit(fontkit);
      const fontResponse = await fetch("/fonts/NotoSansCJKjp-Regular.otf");
      const fontBytes = await fontResponse.arrayBuffer();
      const japaneseFont = await pdfDoc.embedFont(fontBytes);

      const form = pdfDoc.getForm();

      // 発注明細の各行をPDFフィールドにマッピング
      computedRows.forEach((row, idx) => {
        const rowNum = idx + 1;

        // 工種コードと工種名を1文字スペースで結合してcodeItemに
        // ordersから元データを取得（workTypeCodeとworkTypeを結合）
        let codeItemValue = row.codeItem;
        // ordersからworkTypeCodeを探す
        orders.forEach((order) => {
          order.rows.forEach((orderRow) => {
            if (orderRow.workType === row.codeItem || orderRow.no === row.codeItem) {
              // workTypeCode と workType を1文字スペースで結合
              if (orderRow.workTypeCode && orderRow.workType) {
                codeItemValue = `${orderRow.workTypeCode} ${orderRow.workType}`;
              } else if (orderRow.workTypeCode) {
                codeItemValue = orderRow.workTypeCode;
              } else if (orderRow.workType) {
                codeItemValue = orderRow.workType;
              }
            }
          });
        });

        // 各フィールドに値を設定
        const fieldMappings: { [key: string]: string } = {
          [`row${rowNum}_codeItem`]: codeItemValue,
          [`row${rowNum}_budgetAmount`]: row.budgetAmount,
          [`row${rowNum}_orderAmount`]: row.orderAmount,
          [`row${rowNum}_balance`]: row.balance,
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

      // フォームをフラット化
      form.flatten();

      // PDFをダウンロード
      const filledPdfBytes = await pdfDoc.save();
      const ab = new ArrayBuffer(filledPdfBytes.byteLength);
      new Uint8Array(ab).set(filledPdfBytes);
      const blob = new Blob([ab], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `工事実行予算台帳.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF出力エラー:", error);
      alert("PDF出力に失敗しました");
    } finally {
      setPdfLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    fontSize: '0.85rem',
    border: '1px solid #dde5f4',
    borderRadius: '0.375rem',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.375rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#1a1c20',
  };

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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f7' }}>
      <header style={{ backgroundColor: '#132942', color: '#fff', padding: '0.75rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>工事実行予算台帳</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => router.push('/order-contract')}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: '#fff', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              ← 外注発注へ戻る
            </button>
            <button
              onClick={handleExportPDF}
              disabled={pdfLoading}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: pdfLoading ? '#9ca3af' : '#0d56c9', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: pdfLoading ? 'not-allowed' : 'pointer' }}
            >
              {pdfLoading ? 'PDF生成中...' : 'PDF出力'}
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 24px' }}>
        {/* 基本情報 */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>基本情報</h2>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>受注先</label>
                <input
                  type="text"
                  value={header.contractor}
                  onChange={(e) => setHeader({ ...header, contractor: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>注中金額</label>
                <input
                  type="text"
                  value={header.inProgressAmount}
                  onChange={(e) => setHeader({ ...header, inProgressAmount: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>予算金額</label>
                <input
                  type="text"
                  value={header.budgetAmount}
                  onChange={(e) => setHeader({ ...header, budgetAmount: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>発注額</label>
                <input
                  type="text"
                  value={header.orderAmount}
                  onChange={(e) => setHeader({ ...header, orderAmount: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>発注予定</label>
                <input
                  type="text"
                  value={header.plannedOrder}
                  onChange={(e) => setHeader({ ...header, plannedOrder: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>予算残</label>
                <input
                  type="text"
                  value={header.budgetRemain}
                  onChange={(e) => setHeader({ ...header, budgetRemain: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>予定粗利</label>
                <input
                  type="text"
                  value={header.plannedProfit}
                  onChange={(e) => setHeader({ ...header, plannedProfit: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>見積総原価</label>
                <input
                  type="text"
                  value={header.estimatedCost}
                  onChange={(e) => setHeader({ ...header, estimatedCost: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 費目別集計表 */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>費目別集計</h2>
          </div>
          <div style={{ padding: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', color: '#1a1c20' }}>費目</th>
                  <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4', color: '#1a1c20' }}>実行予算</th>
                  <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4', color: '#1a1c20' }}>発注額</th>
                  <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4', color: '#1a1c20' }}>発注予定</th>
                  <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4', color: '#1a1c20' }}>予算残</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', fontWeight: 500 }}>材料費</td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}><input type="text" value={table.materialExecBudget} onChange={(e) => setTable({ ...table, materialExecBudget: e.target.value })} style={{ ...inputStyle, textAlign: 'right' }} /></td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}><input type="text" value={table.materialOrderAmount} onChange={(e) => setTable({ ...table, materialOrderAmount: e.target.value })} style={{ ...inputStyle, textAlign: 'right' }} /></td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}><input type="text" value={table.materialPlannedOrder} onChange={(e) => setTable({ ...table, materialPlannedOrder: e.target.value })} style={{ ...inputStyle, textAlign: 'right' }} /></td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}><input type="text" value={table.materialBudgetRemain} onChange={(e) => setTable({ ...table, materialBudgetRemain: e.target.value })} style={{ ...inputStyle, textAlign: 'right' }} /></td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', fontWeight: 500 }}>外注費</td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}><input type="text" value={table.subcontractExecBudget} onChange={(e) => setTable({ ...table, subcontractExecBudget: e.target.value })} style={{ ...inputStyle, textAlign: 'right' }} /></td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}><input type="text" value={table.subcontractOrderAmount} onChange={(e) => setTable({ ...table, subcontractOrderAmount: e.target.value })} style={{ ...inputStyle, textAlign: 'right' }} /></td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}><input type="text" value={table.subcontractPlannedOrder} onChange={(e) => setTable({ ...table, subcontractPlannedOrder: e.target.value })} style={{ ...inputStyle, textAlign: 'right' }} /></td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}><input type="text" value={table.subcontractBudgetRemain} onChange={(e) => setTable({ ...table, subcontractBudgetRemain: e.target.value })} style={{ ...inputStyle, textAlign: 'right' }} /></td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', fontWeight: 500 }}>経費</td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}><input type="text" value={table.expenseExecBudget} onChange={(e) => setTable({ ...table, expenseExecBudget: e.target.value })} style={{ ...inputStyle, textAlign: 'right' }} /></td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}><input type="text" value={table.expenseOrderAmount} onChange={(e) => setTable({ ...table, expenseOrderAmount: e.target.value })} style={{ ...inputStyle, textAlign: 'right' }} /></td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}><input type="text" value={table.expensePlannedOrder} onChange={(e) => setTable({ ...table, expensePlannedOrder: e.target.value })} style={{ ...inputStyle, textAlign: 'right' }} /></td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}><input type="text" value={table.expenseBudgetRemain} onChange={(e) => setTable({ ...table, expenseBudgetRemain: e.target.value })} style={{ ...inputStyle, textAlign: 'right' }} /></td>
                </tr>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', fontWeight: 700 }}>計</td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}><input type="text" value={table.totalExecBudget} onChange={(e) => setTable({ ...table, totalExecBudget: e.target.value })} style={{ ...inputStyle, textAlign: 'right', fontWeight: 600 }} /></td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}><input type="text" value={table.totalOrderAmount} onChange={(e) => setTable({ ...table, totalOrderAmount: e.target.value })} style={{ ...inputStyle, textAlign: 'right', fontWeight: 600 }} /></td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}><input type="text" value={table.totalPlannedOrder} onChange={(e) => setTable({ ...table, totalPlannedOrder: e.target.value })} style={{ ...inputStyle, textAlign: 'right', fontWeight: 600 }} /></td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}><input type="text" value={table.totalBudgetRemain} onChange={(e) => setTable({ ...table, totalBudgetRemain: e.target.value })} style={{ ...inputStyle, textAlign: 'right', fontWeight: 600 }} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 発注明細 */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>発注明細（外注発注から自動取得）</h2>
          </div>
          <div style={{ padding: '1rem', overflowX: 'auto' }}>
            {computedRows.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#686e78' }}>
                外注発注にデータがありません。
                <Link href="/order-contract" style={{ color: '#0d56c9', marginLeft: '0.5rem' }}>
                  外注発注を入力する →
                </Link>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', color: '#1a1c20' }}>コード・費目</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4', color: '#1a1c20' }}>予算金額</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', color: '#1a1c20' }}>決裁No.</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', color: '#1a1c20' }}>決裁日</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', color: '#1a1c20' }}>発注業者</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4', color: '#1a1c20' }}>発注金額</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#e8f0fe', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4', color: '#0d56c9' }}>発注予定金額</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4', color: '#1a1c20' }}>残高</th>
                  </tr>
                </thead>
                <tbody>
                  {computedRows.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{row.codeItem}</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right' }}>{row.budgetAmount}</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{row.approvalNo}</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{row.approvalDate}</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{row.orderVendor}</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right' }}>{row.orderAmount}</td>
                      <td style={{ padding: '0.25rem', border: '1px solid #dde5f4', backgroundColor: '#e8f0fe' }}>
                        <input
                          type="text"
                          value={row.plannedOrder}
                          onChange={(e) => handlePlannedOrderChange(idx, e.target.value)}
                          placeholder="入力"
                          style={{ ...inputStyle, textAlign: 'right', backgroundColor: '#fff' }}
                        />
                      </td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right', fontWeight: 500 }}>{row.balance}</td>
                    </tr>
                  ))}
                  {/* 合計行 */}
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', fontWeight: 700 }}>合計</td>
                    <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right', fontWeight: 700 }}>{formatNum(totals.budgetAmount)}</td>
                    <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}></td>
                    <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}></td>
                    <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}></td>
                    <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right', fontWeight: 700 }}>{formatNum(totals.orderAmount)}</td>
                    <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right', fontWeight: 700, backgroundColor: '#e8f0fe' }}>{formatNum(totals.plannedOrder)}</td>
                    <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right', fontWeight: 700 }}>{formatNum(totals.balance)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
