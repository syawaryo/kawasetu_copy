"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, DEMO_USERS } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";

type DetailRow = {
  no: string;
  workType: string;
  taxType: string;
  execBudget: string;
  orderedAmount: string;
  contractAmount: string;
  contractTax: string;
  budgetRemain: string;
  advanceTo: string;
  maker: string;
  listPrice: string;
  meritAmount: string;
  meritTax: string;
  meritInclTax: string;
};

type AdvanceRow = {
  no: string;
  companyName: string;
  ratio: string;
  shareAmount: string;
  shareAmountMeritIn: string;
  advanceType: string;
};

type VendorRow = {
  no: string;
  adopted: boolean;
  vendorCode: string;
  vendorName: string;
  quoteDate: string;
  note: string;
  quoteNo: string;
  quoteAmount: string;
  afterDiscountAmount: string;
  decidedDate: string;
};

type VendorFormData = {
  legalWelfareDoc: string;
  specialNote: string;
  orderComment: string;
  deadlineDay: string;
  paymentMonthType: string;
  paymentDay: string;
  paymentType: string;
  commissionRate: string;
  site: string;
  deductionCondition: string;
};

function toNum(v: string) {
  const n = Number(String(v).replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

function calcPercent(contractAmount: string, listPrice: string) {
  const c = toNum(contractAmount);
  const p = toNum(listPrice);
  if (!Number.isFinite(c) || !Number.isFinite(p) || p === 0) return "";
  const pct = ((c - p) / p) * 100;
  return pct.toFixed(1);
}

const defaultHeader = {
  orderNo: "PO-2025-000123",
  historyNo: "01",
  orderDate: "2025-11-07",
  createdDate: "2025-11-07",
  jvShare: "(未選択)",
  contractFrom: "2025-04-01",
  contractTo: "2026-03-31",
  receivedDate: "2025-11-15",
  stampTarget: true,
  printOrder: true,
  printCopy: true,
  printShosho: true,
  printInvoice: false,
  vendor: "株式会社サンプル電材",
  vendorChanged: false,
  project: "〇〇ビル新築電気・空調設備工事",
  dept: "東京支社 工務部",
  subject: "電気設備 資材発注",
};

const defaultRows: DetailRow[] = [
  { no: "0001", workType: "電気設備工事", taxType: "課税", execBudget: "25,000,000", orderedAmount: "15,000,000", contractAmount: "12,500,000", contractTax: "1,250,000", budgetRemain: "10,000,000", advanceTo: "", maker: "パナソニック", listPrice: "15,000,000", meritAmount: "2,500,000", meritTax: "250,000", meritInclTax: "2,750,000" },
  { no: "0002", workType: "空調設備工事", taxType: "課税", execBudget: "18,000,000", orderedAmount: "10,000,000", contractAmount: "9,800,000", contractTax: "980,000", budgetRemain: "8,000,000", advanceTo: "", maker: "ダイキン工業", listPrice: "12,000,000", meritAmount: "2,200,000", meritTax: "220,000", meritInclTax: "2,420,000" },
  { no: "0003", workType: "配管工事", taxType: "課税", execBudget: "8,500,000", orderedAmount: "5,000,000", contractAmount: "4,200,000", contractTax: "420,000", budgetRemain: "3,500,000", advanceTo: "サンプル設備", maker: "TOTO", listPrice: "5,000,000", meritAmount: "800,000", meritTax: "80,000", meritInclTax: "880,000" },
  { no: "0004", workType: "照明器具", taxType: "課税", execBudget: "6,000,000", orderedAmount: "3,500,000", contractAmount: "3,200,000", contractTax: "320,000", budgetRemain: "2,500,000", advanceTo: "", maker: "東芝ライテック", listPrice: "4,000,000", meritAmount: "800,000", meritTax: "80,000", meritInclTax: "880,000" },
  { no: "0005", workType: "分電盤・制御盤", taxType: "課税", execBudget: "4,500,000", orderedAmount: "2,000,000", contractAmount: "1,850,000", contractTax: "185,000", budgetRemain: "2,500,000", advanceTo: "", maker: "日東工業", listPrice: "2,200,000", meritAmount: "350,000", meritTax: "35,000", meritInclTax: "385,000" },
  { no: "0006", workType: "ケーブル・配線材", taxType: "課税", execBudget: "3,000,000", orderedAmount: "1,500,000", contractAmount: "1,350,000", contractTax: "135,000", budgetRemain: "1,500,000", advanceTo: "", maker: "住友電工", listPrice: "1,600,000", meritAmount: "250,000", meritTax: "25,000", meritInclTax: "275,000" },
];

const defaultAdvanceRows: AdvanceRow[] = [
  { no: "01", companyName: "株式会社サンプル電材", ratio: "60.0", shareAmount: "18,900,000", shareAmountMeritIn: "22,590,000", advanceType: "立替" },
  { no: "02", companyName: "サンプル設備工業", ratio: "25.0", shareAmount: "7,875,000", shareAmountMeritIn: "9,412,500", advanceType: "立替" },
  { no: "03", companyName: "東京電工サービス", ratio: "15.0", shareAmount: "4,725,000", shareAmountMeritIn: "5,647,500", advanceType: "直接" },
  { no: "04", companyName: "", ratio: "", shareAmount: "", shareAmountMeritIn: "", advanceType: "" },
  { no: "05", companyName: "", ratio: "", shareAmount: "", shareAmountMeritIn: "", advanceType: "" },
];

const defaultVendorForm: VendorFormData = {
  legalWelfareDoc: "(未選択)",
  specialNote: "本工事は建設業法に基づく適正な施工管理を実施すること。\n安全衛生管理については、労働安全衛生法を遵守すること。",
  orderComment: "納期厳守でお願いします。",
  deadlineDay: "20",
  paymentMonthType: "翌月",
  paymentDay: "",
  paymentType: "振込",
  commissionRate: "0",
  site: "",
  deductionCondition: "",
};

const defaultVendorRows: VendorRow[] = [
  { no: "001", adopted: true, vendorCode: "V001", vendorName: "株式会社サンプル電材", quoteDate: "2025-10-15", note: "最安値", quoteNo: "Q-2025-0123", quoteAmount: "12,500,000", afterDiscountAmount: "12,000,000", decidedDate: "2025-10-20" },
  { no: "002", adopted: false, vendorCode: "V002", vendorName: "東京電工サービス", quoteDate: "2025-10-16", note: "", quoteNo: "Q-2025-0456", quoteAmount: "13,200,000", afterDiscountAmount: "12,800,000", decidedDate: "" },
  { no: "003", adopted: false, vendorCode: "V003", vendorName: "サンプル設備工業", quoteDate: "2025-10-17", note: "", quoteNo: "Q-2025-0789", quoteAmount: "14,000,000", afterDiscountAmount: "13,500,000", decidedDate: "" },
];

export default function OrderContractPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { addSubmission } = useData();
  const [header, setHeader] = useState(defaultHeader);
  const [rows, setRows] = useState<DetailRow[]>(defaultRows);
  const [advanceRows, setAdvanceRows] = useState<AdvanceRow[]>(defaultAdvanceRows);
  const [vendorForm, setVendorForm] = useState<VendorFormData>(defaultVendorForm);
  const [vendorRows, setVendorRows] = useState<VendorRow[]>(defaultVendorRows);

  // 申請モーダル用
  const [showModal, setShowModal] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'order' | 'budget' | 'schedule'>('order');

  const approvers = DEMO_USERS.filter(u => u.role === 'manager');

  const percentByRow = useMemo(
    () => rows.map((r) => calcPercent(r.contractAmount, r.listPrice)),
    [rows]
  );

  const handleSave = () => {
    const data = { header, rows, advanceRows, vendorForm, vendorRows };
    console.log(JSON.stringify(data, null, 2));
    alert("保存しました（コンソールにJSON出力）");
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setIsSubmitted(false);
    if (approvers.length > 0) {
      setSelectedApprover(approvers[0].id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsSubmitted(false);
  };

  const handleSubmit = async () => {
    if (!selectedApprover || !currentUser) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    addSubmission({
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      type: '発注契約',
      title: `${header.subject} - ${header.vendor}`,
      status: 'pending',
      data: {
        orderNo: header.orderNo,
        vendor: header.vendor,
        project: header.project,
        subject: header.subject,
      },
      assignedTo: selectedApprover,
      approvalFlow: [
        { label: '自分', status: 'completed' },
        { label: '工事部長', status: 'current' },
        { label: '本社', status: 'pending' },
      ],
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f7' }}>
      <header style={{ backgroundColor: '#132942', color: '#fff', padding: '0.75rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>（外注）発注契約登録</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => router.push("/budget")} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#fff', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              ← 実行予算登録へ戻る
            </button>
            <button onClick={handleSave} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#6b7280', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
              保存
            </button>
            <button onClick={handleOpenModal} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
              申請
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 24px' }}>
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
                <input type="text" value={header.vendor} onChange={(e) => setHeader((h) => ({ ...h, vendor: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#dc3545' }}>工事 *</label>
                <input type="text" value={header.project} onChange={(e) => setHeader((h) => ({ ...h, project: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#dc3545' }}>発行部門 *</label>
                <input type="text" value={header.dept} onChange={(e) => setHeader((h) => ({ ...h, dept: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
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
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '64px' }}>No.</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4' }}>工種</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '80px' }}>消費税区分</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px' }}>実行予算額</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px' }}>契約金額</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px' }}>予算残高</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '100px' }}>メーカー</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px' }}>定価</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '60px' }}>%</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px' }}>メリット額</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.no}>
                    <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f0f2f7' }}>{r.no}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
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
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '64px' }}>No.</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4' }}>会社名</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '100px' }}>比率(%)</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '140px' }}>分担金額</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '140px' }}>分担金額（メリット込）</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '100px' }}>立替区分</th>
                </tr>
              </thead>
              <tbody>
                {advanceRows.map((r, idx) => (
                  <tr key={r.no}>
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
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '64px' }}>No.</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'center', borderBottom: '1px solid #dde5f4', width: '60px' }}>採用</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '100px' }}>取引先コード</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4' }}>取引先名称</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '120px' }}>見積書日付</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4' }}>備考</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '120px' }}>見積書番号</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px' }}>見積金額</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '120px' }}>折値後金額</th>
                </tr>
              </thead>
              <tbody>
                {vendorRows.map((r, idx) => (
                  <tr key={r.no}>
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
      </main>

      {/* 申請モーダル */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={handleCloseModal}>
          <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', width: '95%', maxWidth: '1000px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #dde5f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#1a1c20' }}>発注契約 申請確認</h2>
              <button style={{ width: 32, height: 32, border: 'none', backgroundColor: 'transparent', fontSize: '1.5rem', cursor: 'pointer', color: '#686e78' }} onClick={handleCloseModal}>×</button>
            </div>

            {isSubmitted ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ padding: '1rem', backgroundColor: '#d1fae5', borderRadius: '0.5rem', color: '#065f46', fontSize: '0.95rem' }}>
                  申請が完了しました。承認者に通知されました。
                </div>
              </div>
            ) : (
              <>
                {/* タブ */}
                <div style={{ display: 'flex', borderBottom: '1px solid #dde5f4', backgroundColor: '#f8f9fa' }}>
                  <button
                    onClick={() => setActiveTab('order')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      border: 'none',
                      backgroundColor: activeTab === 'order' ? '#fff' : 'transparent',
                      color: activeTab === 'order' ? '#0d56c9' : '#686e78',
                      borderBottom: activeTab === 'order' ? '2px solid #0d56c9' : '2px solid transparent',
                      cursor: 'pointer',
                    }}
                  >
                    注文伺書
                  </button>
                  <button
                    onClick={() => setActiveTab('budget')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      border: 'none',
                      backgroundColor: activeTab === 'budget' ? '#fff' : 'transparent',
                      color: activeTab === 'budget' ? '#0d56c9' : '#686e78',
                      borderBottom: activeTab === 'budget' ? '2px solid #0d56c9' : '2px solid transparent',
                      cursor: 'pointer',
                    }}
                  >
                    工事実行予算台帳
                  </button>
                  <button
                    onClick={() => setActiveTab('schedule')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      border: 'none',
                      backgroundColor: activeTab === 'schedule' ? '#fff' : 'transparent',
                      color: activeTab === 'schedule' ? '#0d56c9' : '#686e78',
                      borderBottom: activeTab === 'schedule' ? '2px solid #0d56c9' : '2px solid transparent',
                      cursor: 'pointer',
                    }}
                  >
                    発注予定表
                  </button>
                </div>

                {/* PDFプレビュー */}
                <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
                  <div style={{ backgroundColor: '#f0f2f7', borderRadius: '0.5rem', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {activeTab === 'order' && (
                      <iframe
                        src="/注文伺書（データ消し・サンプルデータ）.pdf"
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }}
                        title="注文伺書"
                      />
                    )}
                    {activeTab === 'budget' && (
                      <iframe
                        src="/工事実行予算台帳（サンプルデータ）.pdf"
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }}
                        title="工事実行予算台帳"
                      />
                    )}
                    {activeTab === 'schedule' && (
                      <iframe
                        src="/発注予定（サンプルデータ）.pdf"
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }}
                        title="発注予定表"
                      />
                    )}
                  </div>
                </div>

                {/* 申請先選択 */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #dde5f4', backgroundColor: '#f8f9fa' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#1a1c20' }}>申請先を選択</label>
                  <select
                    value={selectedApprover}
                    onChange={(e) => setSelectedApprover(e.target.value)}
                    style={{ width: '100%', maxWidth: '300px', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff' }}
                  >
                    {approvers.map((approver) => (
                      <option key={approver.id} value={approver.id}>
                        {approver.name}（{approver.department}）
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #dde5f4', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              {isSubmitted ? (
                <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }} onClick={handleCloseModal}>閉じる</button>
              ) : (
                <>
                  <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: 'transparent', border: '1px solid #dde5f4', color: '#686e78', borderRadius: '0.375rem', cursor: 'pointer' }} onClick={handleCloseModal}>キャンセル</button>
                  <button
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: isSubmitting ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedApprover}
                  >
                    {isSubmitting ? '申請中...' : '申請する'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
