"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
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

// 詳細行の型
type DetailRow = {
  codeItem: string;
  budgetAmount: string;
  approvalNo: string;
  approvalDate: string;
  orderVendor: string;
  orderAmount: string;
  balance: string;
};

// 進捗追跡の型
type ProgressRow = {
  progress: string;
  progressAmount: string;
  diffPercent: string;
  diffAmount: string;
  judgment: string;
};

export default function BudgetLedgerPage() {
  const router = useRouter();
  const { orders, ledgerRows, setLedgerRows } = useOrderData();

  // ヘッダー情報
  const [projectNumber, setProjectNumber] = useState("");
  const [constructionPeriod, setConstructionPeriod] = useState("");
  const [projectName, setProjectName] = useState("");
  const [client, setClient] = useState("");
  const [contractAmount, setContractAmount] = useState("");
  const [version, setVersion] = useState("011");
  const [createdDate, setCreatedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
  });

  // 予算サマリー
  const [budgetAmount, setBudgetAmount] = useState("0");
  const [orderAmount, setOrderAmount] = useState("0");
  const [plannedOrder, setPlannedOrder] = useState("0");
  const [budgetRemain, setBudgetRemain] = useState("0");
  const [plannedProfit, setPlannedProfit] = useState("0");
  const [estimatedCost, setEstimatedCost] = useState("0");

  // 費目別内訳
  const [materialBudget, setMaterialBudget] = useState("0");
  const [materialOrder, setMaterialOrder] = useState("0");
  const [materialPlanned, setMaterialPlanned] = useState("0");
  const [materialRemain, setMaterialRemain] = useState("0");
  const [subcontractBudget, setSubcontractBudget] = useState("0");
  const [subcontractOrder, setSubcontractOrder] = useState("0");
  const [subcontractPlanned, setSubcontractPlanned] = useState("0");
  const [subcontractRemain, setSubcontractRemain] = useState("0");
  const [expenseBudget, setExpenseBudget] = useState("0");
  const [expenseOrder, setExpenseOrder] = useState("0");
  const [expensePlanned, setExpensePlanned] = useState("0");
  const [expenseRemain, setExpenseRemain] = useState("0");

  // 進捗追跡
  const [actualProgress, setActualProgress] = useState<ProgressRow>({
    progress: "0.00",
    progressAmount: "0",
    diffPercent: "",
    diffAmount: "",
    judgment: "",
  });
  const [currentMonthForecast, setCurrentMonthForecast] = useState<ProgressRow>({
    progress: "0.00",
    progressAmount: "0",
    diffPercent: "0.00",
    diffAmount: "0",
    judgment: "",
  });
  const [nextQuarterForecast, setNextQuarterForecast] = useState<ProgressRow>({
    progress: "0.00",
    progressAmount: "0",
    diffPercent: "0.00",
    diffAmount: "0",
    judgment: "",
  });

  // 詳細行（15行）
  const [detailRows, setDetailRows] = useState<DetailRow[]>(() => {
    return Array(15).fill(null).map(() => ({
      codeItem: "",
      budgetAmount: "",
      approvalNo: "",
      approvalDate: "",
      orderVendor: "",
      orderAmount: "",
      balance: "",
    }));
  });

  const [pdfLoading, setPdfLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  // 工事番号バリデーション（9桁-3桁）
  const validateProjectNumber = (num: string): boolean => {
    const pattern = /^\d{9}-\d{3}$/;
    return pattern.test(num);
  };

  // 工事番号で台帳データを読み込む
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

    // TODO: 実際のAPIから台帳データを取得する処理
    // 仮実装：読み込み成功のアラート
    alert(`工事番号 ${projectNumber} の台帳データを読み込みます`);
  };

  // 申請処理
  const handleSubmit = () => {
    if (!projectNumber.trim()) {
      alert("工事番号を入力してください");
      return;
    }

    if (!validateProjectNumber(projectNumber)) {
      alert("工事番号は「数字9桁-3桁」の形式で入力してください");
      return;
    }

    // TODO: 実際の申請処理
    alert(`工事番号 ${projectNumber} の台帳を申請しました`);
  };

  // order-contractの全発注から工種を集めてdetailRowsを構築
  useEffect(() => {
    const allRows: DetailRow[] = [];

    orders.forEach((order, orderIdx) => {
      order.rows.forEach((row) => {
        if (!row.workType && !row.execBudget && !row.contractAmount) return;

        allRows.push({
          codeItem: row.workType || row.no || "",
          budgetAmount: row.execBudget || "",
          approvalNo: order.header.orderNo || `発注${orderIdx + 1}`,
          approvalDate: order.header.orderDate || "",
          orderVendor: order.header.vendor || "",
          orderAmount: row.contractAmount || "",
          balance: "",
        });
      });
    });

    // 既存のdetailRowsを更新（最大15行）
    const updatedRows = [...detailRows];
    allRows.slice(0, 15).forEach((row, idx) => {
      if (updatedRows[idx]) {
        updatedRows[idx] = {
          ...row,
          balance: formatNum(toNum(row.budgetAmount) - toNum(row.orderAmount)),
        };
      }
    });
    setDetailRows(updatedRows);
  }, [orders]);

  // 残高を自動計算
  useEffect(() => {
    setDetailRows(rows =>
      rows.map(row => ({
        ...row,
        balance: formatNum(toNum(row.budgetAmount) - toNum(row.orderAmount)),
      }))
    );
  }, [detailRows.map(r => r.budgetAmount + r.orderAmount).join(',')]);

  // 費目別合計を自動計算
  useEffect(() => {
    const totalBudget = detailRows.reduce((sum, row) => sum + toNum(row.budgetAmount), 0);
    const totalOrder = detailRows.reduce((sum, row) => sum + toNum(row.orderAmount), 0);
    const totalPlanned = toNum(plannedOrder);
    const totalRemain = totalBudget - totalOrder - totalPlanned;

    setBudgetAmount(formatNum(totalBudget));
    setOrderAmount(formatNum(totalOrder));
    setBudgetRemain(formatNum(totalRemain));
    setPlannedProfit(formatNum(toNum(contractAmount) - totalOrder - totalPlanned));
  }, [detailRows, plannedOrder, contractAmount]);

  // 進捗金額から出来高%を計算
  const calculateProgress = (amount: string) => {
    const cost = toNum(estimatedCost) || toNum(budgetAmount);
    if (cost === 0) return "0.00";
    return ((toNum(amount) / cost) * 100).toFixed(2);
  };

  // 差(%)を計算
  const calculateDiffPercent = (progress: string) => {
    const actual = parseFloat(actualProgress.progress) || 0;
    const current = parseFloat(progress) || 0;
    return (current - actual).toFixed(2);
  };

  // 差(金額)を計算
  const calculateDiffAmount = (progressAmount: string) => {
    const actual = toNum(actualProgress.progressAmount);
    const current = toNum(progressAmount);
    return formatNum(current - actual);
  };

  // 詳細行の更新
  const updateDetailRow = (idx: number, field: keyof DetailRow, value: string) => {
    setDetailRows(rows =>
      rows.map((row, i) =>
        i === idx ? { ...row, [field]: value } : row
      )
    );
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
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => router.push('/function-master')}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: '#fff', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              ← 機能マスタへ戻る
            </button>
            <button
              onClick={() => alert('保存しました')}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#fff', color: '#132942', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              保存
            </button>
            <button
              onClick={handleSubmit}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              申請
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '1.5rem 24px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', padding: '2rem' }}>
          {/* ヘッダー部分 */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1a1c20' }}>工事実行予算台帳</h2>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: '#1a1c20' }}>{createdDate} 作成</div>
                  <div style={{ fontSize: '0.85rem', color: '#1a1c20', marginTop: '0.25rem' }}>Ver. {version}</div>
                </div>
              </div>
            </div>

            {/* 工事情報 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>工事番号</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      value={projectNumber}
                      onChange={(e) => {
                        setProjectNumber(e.target.value);
                        setLoadError("");
                      }}
                      placeholder="123456789-001"
                      style={{
                        ...inputStyle,
                        borderColor: loadError ? '#dc3545' : '#dde5f4',
                      }}
                    />
                    {loadError && (
                      <div style={{ fontSize: '0.75rem', color: '#dc3545', marginTop: '0.25rem' }}>
                        {loadError}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleLoadByProjectNumber}
                    style={{
                      padding: '0.4rem 0.75rem',
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
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>工期</label>
                <input
                  type="text"
                  value={constructionPeriod}
                  onChange={(e) => setConstructionPeriod(e.target.value)}
                  placeholder="YYYY-MM-DD ~ YYYY-MM-DD"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>工事名</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>受注先</label>
                <input
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* 予算サマリー */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            {/* 左側：基本数値 */}
            <div style={{ border: '1px solid #dde5f4', borderRadius: '0.5rem', padding: '1rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#1a1c20' }}>予算サマリー</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#1a1c20' }}>受注金額 (A)</label>
                  <input
                    type="text"
                    value={contractAmount}
                    onChange={(e) => setContractAmount(e.target.value)}
                    style={{ ...inputStyle, textAlign: 'right' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#686e78' }}>予算金額 (B)</label>
                  <input
                    type="text"
                    value={budgetAmount}
                    readOnly
                    style={{ ...inputStyle, textAlign: 'right', backgroundColor: '#f8f9fa', color: '#495057' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#686e78' }}>発注額</label>
                  <input
                    type="text"
                    value={orderAmount}
                    readOnly
                    style={{ ...inputStyle, textAlign: 'right', backgroundColor: '#f8f9fa', color: '#495057' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#1a1c20' }}>発注予定</label>
                  <input
                    type="text"
                    value={plannedOrder}
                    onChange={(e) => setPlannedOrder(e.target.value)}
                    style={{ ...inputStyle, textAlign: 'right' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#686e78' }}>予算残</label>
                  <input
                    type="text"
                    value={budgetRemain}
                    readOnly
                    style={{ ...inputStyle, textAlign: 'right', backgroundColor: '#f8f9fa', color: '#495057' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#686e78' }}>予定粗利 (C)</label>
                  <input
                    type="text"
                    value={plannedProfit}
                    readOnly
                    style={{ ...inputStyle, textAlign: 'right', backgroundColor: '#f8f9fa', color: '#495057' }}
                  />
                </div>
              </div>
            </div>

            {/* 右側：費目別内訳 */}
            <div style={{ border: '1px solid #dde5f4', borderRadius: '0.5rem', padding: '1rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#1a1c20' }}>費目別内訳</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4' }}>項目</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4' }}>実行予算</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4' }}>発注額</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4' }}>発注予定</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4' }}>予算残</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>材料費</td>
                    <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                      <input type="text" value={materialBudget} onChange={(e) => setMaterialBudget(e.target.value)} style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem' }} />
                    </td>
                    <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                      <input type="text" value={materialOrder} onChange={(e) => setMaterialOrder(e.target.value)} style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem' }} />
                    </td>
                    <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                      <input type="text" value={materialPlanned} onChange={(e) => setMaterialPlanned(e.target.value)} style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem' }} />
                    </td>
                    <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                      <input type="text" value={materialRemain} onChange={(e) => setMaterialRemain(e.target.value)} style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem' }} />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>外注費</td>
                    <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                      <input type="text" value={subcontractBudget} onChange={(e) => setSubcontractBudget(e.target.value)} style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem' }} />
                    </td>
                    <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                      <input type="text" value={subcontractOrder} onChange={(e) => setSubcontractOrder(e.target.value)} style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem' }} />
                    </td>
                    <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                      <input type="text" value={subcontractPlanned} onChange={(e) => setSubcontractPlanned(e.target.value)} style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem' }} />
                    </td>
                    <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                      <input type="text" value={subcontractRemain} onChange={(e) => setSubcontractRemain(e.target.value)} style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem' }} />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>経費</td>
                    <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                      <input type="text" value={expenseBudget} onChange={(e) => setExpenseBudget(e.target.value)} style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem' }} />
                    </td>
                    <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                      <input type="text" value={expenseOrder} onChange={(e) => setExpenseOrder(e.target.value)} style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem' }} />
                    </td>
                    <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                      <input type="text" value={expensePlanned} onChange={(e) => setExpensePlanned(e.target.value)} style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem' }} />
                    </td>
                    <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                      <input type="text" value={expenseRemain} onChange={(e) => setExpenseRemain(e.target.value)} style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem' }} />
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', fontWeight: 700 }}>計</td>
                    <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                      <input type="text" value={formatNum(toNum(materialBudget) + toNum(subcontractBudget) + toNum(expenseBudget))} readOnly style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem', backgroundColor: '#f8f9fa', fontWeight: 600 }} />
                    </td>
                    <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                      <input type="text" value={formatNum(toNum(materialOrder) + toNum(subcontractOrder) + toNum(expenseOrder))} readOnly style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem', backgroundColor: '#f8f9fa', fontWeight: 600 }} />
                    </td>
                    <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                      <input type="text" value={formatNum(toNum(materialPlanned) + toNum(subcontractPlanned) + toNum(expensePlanned))} readOnly style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem', backgroundColor: '#f8f9fa', fontWeight: 600 }} />
                    </td>
                    <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                      <input type="text" value={formatNum(toNum(materialRemain) + toNum(subcontractRemain) + toNum(expenseRemain))} readOnly style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem', backgroundColor: '#f8f9fa', fontWeight: 600 }} />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#1a1c20' }}>見積総原価</label>
                <input
                  type="text"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  style={{ ...inputStyle, textAlign: 'right' }}
                />
              </div>
            </div>
          </div>

          {/* 進捗追跡 */}
          <div style={{ marginBottom: '2rem', border: '1px solid #dde5f4', borderRadius: '0.5rem', padding: '1rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#1a1c20' }}>進捗追跡</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4' }}>出来高</th>
                  <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4' }}>出来高金額</th>
                  <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4' }}>差(%)</th>
                  <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4' }}>差(金額)</th>
                  <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4' }}>判定</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', fontWeight: 500 }}>実績</td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                    <input
                      type="text"
                      value={actualProgress.progress}
                      onChange={(e) => {
                        const val = e.target.value;
                        setActualProgress({ ...actualProgress, progress: val });
                      }}
                      style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem', width: '80px' }}
                    />%
                  </td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                    <input
                      type="text"
                      value={actualProgress.progressAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        const progress = calculateProgress(val);
                        setActualProgress({ ...actualProgress, progressAmount: val, progress });
                      }}
                      style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem' }}
                    />
                  </td>
                  <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right' }}>{actualProgress.diffPercent}</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right' }}>{actualProgress.diffAmount}</td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                    <input
                      type="text"
                      value={actualProgress.judgment}
                      onChange={(e) => setActualProgress({ ...actualProgress, judgment: e.target.value })}
                      style={{ ...inputStyle, padding: '0.25rem' }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', fontWeight: 500 }}>当月予想</td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                    <input
                      type="text"
                      value={currentMonthForecast.progress}
                      onChange={(e) => {
                        const val = e.target.value;
                        const diffPercent = calculateDiffPercent(val);
                        setCurrentMonthForecast({ ...currentMonthForecast, progress: val, diffPercent });
                      }}
                      style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem', width: '80px' }}
                    />%
                  </td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                    <input
                      type="text"
                      value={currentMonthForecast.progressAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        const progress = calculateProgress(val);
                        const diffPercent = calculateDiffPercent(progress);
                        const diffAmount = calculateDiffAmount(val);
                        setCurrentMonthForecast({ ...currentMonthForecast, progressAmount: val, progress, diffPercent, diffAmount });
                      }}
                      style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem' }}
                    />
                  </td>
                  <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right' }}>{currentMonthForecast.diffPercent}%</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right' }}>{currentMonthForecast.diffAmount}</td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                    <input
                      type="text"
                      value={currentMonthForecast.judgment}
                      onChange={(e) => setCurrentMonthForecast({ ...currentMonthForecast, judgment: e.target.value })}
                      style={{ ...inputStyle, padding: '0.25rem' }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', fontWeight: 500 }}>翌四半期予想</td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                    <input
                      type="text"
                      value={nextQuarterForecast.progress}
                      onChange={(e) => {
                        const val = e.target.value;
                        const diffPercent = calculateDiffPercent(val);
                        setNextQuarterForecast({ ...nextQuarterForecast, progress: val, diffPercent });
                      }}
                      style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem', width: '80px' }}
                    />%
                  </td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                    <input
                      type="text"
                      value={nextQuarterForecast.progressAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        const progress = calculateProgress(val);
                        const diffPercent = calculateDiffPercent(progress);
                        const diffAmount = calculateDiffAmount(val);
                        setNextQuarterForecast({ ...nextQuarterForecast, progressAmount: val, progress, diffPercent, diffAmount });
                      }}
                      style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem' }}
                    />
                  </td>
                  <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right' }}>{nextQuarterForecast.diffPercent}%</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right' }}>{nextQuarterForecast.diffAmount}</td>
                  <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                    <input
                      type="text"
                      value={nextQuarterForecast.judgment}
                      onChange={(e) => setNextQuarterForecast({ ...nextQuarterForecast, judgment: e.target.value })}
                      style={{ ...inputStyle, padding: '0.25rem' }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div style={{ fontSize: '0.75rem', color: '#686e78', marginTop: '0.5rem' }}>
              出来高(%) = 出来高金額 / 見積総原価または実行予算金額
            </div>
          </div>

          {/* 詳細コスト内訳表 */}
          <div style={{ border: '1px solid #dde5f4', borderRadius: '0.5rem', padding: '1rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#1a1c20' }}>詳細コスト内訳</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4' }}>コード・費目名</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4' }}>予算金額</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4' }}>決裁 No.</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4' }}>決裁日</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4' }}>発注業者</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4' }}>発注金額</th>
                    <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4' }}>残高</th>
                  </tr>
                </thead>
                <tbody>
                  {detailRows.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                        <input
                          type="text"
                          value={row.codeItem}
                          onChange={(e) => updateDetailRow(idx, 'codeItem', e.target.value)}
                          style={{ ...inputStyle, padding: '0.25rem' }}
                        />
                      </td>
                      <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                        <input
                          type="text"
                          value={row.budgetAmount}
                          onChange={(e) => updateDetailRow(idx, 'budgetAmount', e.target.value)}
                          style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem' }}
                        />
                      </td>
                      <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                        <input
                          type="text"
                          value={row.approvalNo}
                          onChange={(e) => updateDetailRow(idx, 'approvalNo', e.target.value)}
                          style={{ ...inputStyle, padding: '0.25rem' }}
                        />
                      </td>
                      <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                        <input
                          type="text"
                          value={row.approvalDate}
                          onChange={(e) => updateDetailRow(idx, 'approvalDate', e.target.value)}
                          style={{ ...inputStyle, padding: '0.25rem' }}
                        />
                      </td>
                      <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                        <input
                          type="text"
                          value={row.orderVendor}
                          onChange={(e) => updateDetailRow(idx, 'orderVendor', e.target.value)}
                          style={{ ...inputStyle, padding: '0.25rem' }}
                        />
                      </td>
                      <td style={{ padding: '0.25rem', border: '1px solid #dde5f4' }}>
                        <input
                          type="text"
                          value={row.orderAmount}
                          onChange={(e) => updateDetailRow(idx, 'orderAmount', e.target.value)}
                          style={{ ...inputStyle, textAlign: 'right', padding: '0.25rem' }}
                        />
                      </td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right', fontWeight: 500 }}>
                        {row.balance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
