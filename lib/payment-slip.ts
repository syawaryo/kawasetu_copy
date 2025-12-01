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
  slipNo: string;
  slipDate: string;
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

// 初期値
export const createInitialHeader = (): PaymentHeader => ({
  slipNo: "2025110123",
  slipDate: "2025-11-30",
  payee: "",
  payDept: "",
  payTerms: "",
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
