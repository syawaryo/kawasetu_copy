// 型定義
export type PayRow = {
  no: string;
  accountTitle: string;
  department: string;
  exempt: boolean;
  partner: string;
  project: string;
  jvShareType: string;
  inquiry: string;
  expense: string;
  workType: string;
  taxType: string;
  taxKbn: string;
  assessedAmount: string;
  taxAmount: string;
  advanceTaxRate: string;
  advanceTaxAmount: string;
  businessRegNo: string;
  summary: string;
  jvPayTo: string;
};

export type PaymentHeader = {
  projectName: string;
  slipNo: string;
  slipDate: string;
  paymentType: string;
  payee: string;
  payDept: string;
  payTerms: string;
  payeeNote: string;
  taxFirstPeriod: string;
  taxOptChange: boolean;
  refSourceSlipNo: string;
};

export type PaymentTotals = {
  assessed: number;
  tax: number;
  pay: number;
};

export type SaveResult = {
  success: boolean;
  message: string;
};

// ユーティリティ関数
export const toNum = (v: string): number => {
  const n = Number(String(v).replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

// 伝票番号のカウンター（実際はDBなどで管理）
let slipCounter = 1;

// 当月末日を取得
const getEndOfMonth = (): string => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return lastDay.toISOString().split('T')[0];
};

// 伝票番号を生成（年月 + 4桁連番）
const generateSlipNo = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const seq = String(slipCounter++).padStart(4, '0');
  return `${year}${month}${seq}`;
};

// 翌月20日を取得
export const getNextMonth20th = (): string => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 20);
  const year = nextMonth.getFullYear();
  const month = String(nextMonth.getMonth() + 1).padStart(2, '0');
  return `${year}/${month}/20`;
};

// 初期値
export const createInitialHeader = (): PaymentHeader => ({
  projectName: "",
  slipNo: generateSlipNo(),
  slipDate: getEndOfMonth(),
  paymentType: "定時",
  payee: "",
  payDept: "本社支払",
  payTerms: `${getNextMonth20th()} 現金 100%`,
  payeeNote: "",
  taxFirstPeriod: "",
  taxOptChange: false,
  refSourceSlipNo: "",
});

export const createEmptyRow = (index: number): PayRow => ({
  no: String(index + 1).padStart(3, "0"),
  accountTitle: "",
  department: "",
  exempt: false,
  partner: "",
  project: "",
  jvShareType: "",
  inquiry: "",
  expense: "",
  workType: "",
  taxType: "",
  taxKbn: "",
  assessedAmount: "",
  taxAmount: "",
  advanceTaxRate: "",
  advanceTaxAmount: "",
  businessRegNo: "",
  summary: "",
  jvPayTo: "",
});

export const createInitialRows = (count: number = 5): PayRow[] =>
  Array.from({ length: count }).map((_, i) => createEmptyRow(i));

// API呼び出し
export const savePaymentSlip = async (
  header: PaymentHeader,
  rows: PayRow[],
  totals: PaymentTotals
): Promise<SaveResult> => {
  try {
    const response = await fetch("/api/payment-slip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        header,
        rows,
        totals,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("保存されたデータ:", JSON.stringify(result.data, null, 2));
      console.log("AI検証結果:", result.aiValidation);
      return { success: true, message: result.message || "保存しました" };
    } else {
      return { success: false, message: result.error || "保存に失敗しました" };
    }
  } catch (error) {
    console.error("保存エラー:", error);
    return { success: false, message: "ネットワークエラーが発生しました" };
  }
};
