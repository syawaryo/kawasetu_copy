'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// 今日の日付をYYYY-MM-DD形式で取得
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// 注文書No.を生成（10桁: 頭2桁 + 年度4桁 + 連番4桁）
// ※デモ用：実運用ではサーバー側で連番管理が必要
let orderNoCounter = 1;
const generateOrderNo = () => {
  const now = new Date();
  const year = now.getFullYear().toString(); // 年度4桁
  const prefix = "01"; // 頭2桁（仮）
  const seq = String(orderNoCounter++).padStart(4, '0'); // 連番4桁
  return `${prefix}${year}${seq}`;
};

// 明細行
export type DetailRow = {
  no: string;
  workTypeCode: string;
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

// 立替情報
export type AdvanceRow = {
  no: string;
  companyName: string;
  ratio: string;
  shareAmount: string;
  shareAmountMeritIn: string;
  advanceType: string;
};

// 発注先比較
export type VendorRow = {
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

// 発注条件
export type VendorFormData = {
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

// 注文書ヘッダー
export type OrderHeader = {
  orderNo: string;
  historyNo: string;
  orderDate: string;
  createdDate: string;
  jvShare: string;
  contractFrom: string;
  contractTo: string;
  receivedDate: string;
  stampTarget: boolean;
  printOrder: boolean;
  printCopy: boolean;
  printShosho: boolean;
  printInvoice: boolean;
  vendor: string;
  vendorChanged: boolean;
  project: string;
  dept: string;
  subject: string;
};

// 1つの発注データ
export type OrderData = {
  header: OrderHeader;
  rows: DetailRow[];
  advanceRows: AdvanceRow[];
  vendorForm: VendorFormData;
  vendorRows: VendorRow[];
};

// 工事実行予算台帳のヘッダー
export type BudgetLedgerHeader = {
  contractAmount: string;   // 受注金額
  budgetAmount: string;     // 予算金額
  orderAmount: string;      // 発注額
  plannedOrder: string;     // 発注予定
  budgetRemain: string;     // 予算残
  plannedProfit: string;    // 予定粗利
};

export const defaultBudgetLedgerHeader: BudgetLedgerHeader = {
  contractAmount: '',
  budgetAmount: '',
  orderAmount: '',
  plannedOrder: '',
  budgetRemain: '',
  plannedProfit: '',
};

// 工事実行予算台帳の明細行
export type BudgetLedgerRow = {
  codeItem: string;       // コード・費目
  budgetAmount: string;   // 予算金額
  approvalNo: string;     // 決裁No.
  approvalDate: string;   // 決裁日
  orderVendor: string;    // 発注業者
  orderAmount: string;    // 発注金額
  plannedOrder: string;   // 発注予定金額（ユーザー入力）
  balance: string;        // 残高
};

// 発注予定表の行
export type OrderScheduleRow = {
  workType: string;       // 工種
  plannedVendor: string;  // 発注予定業者
  plannedAmount: string;  // 発注予定金額
  note: string;           // 備考
};

export const createEmptyOrderScheduleRow = (): OrderScheduleRow => ({
  workType: '',
  plannedVendor: '',
  plannedAmount: '',
  note: '',
});

export const createEmptyBudgetLedgerRow = (): BudgetLedgerRow => ({
  codeItem: '',
  budgetAmount: '',
  approvalNo: '',
  approvalDate: '',
  orderVendor: '',
  orderAmount: '',
  plannedOrder: '',
  balance: '',
});

// デフォルト値
export const defaultHeader: OrderHeader = {
  orderNo: generateOrderNo(),
  historyNo: "",
  orderDate: getTodayDate(),
  createdDate: getTodayDate(),
  jvShare: "",
  contractFrom: "",
  contractTo: "",
  receivedDate: "",
  stampTarget: false,
  printOrder: false,
  printCopy: false,
  printShosho: false,
  printInvoice: false,
  vendor: "",
  vendorChanged: false,
  project: "",
  dept: "",
  subject: "",
};

export const createEmptyDetailRow = (): DetailRow => ({
  no: "", workTypeCode: "", workType: "", taxType: "", execBudget: "", orderedAmount: "", contractAmount: "", contractTax: "", budgetRemain: "", advanceTo: "", maker: "", listPrice: "", meritAmount: "", meritTax: "", meritInclTax: ""
});

export const createEmptyAdvanceRow = (): AdvanceRow => ({
  no: "", companyName: "", ratio: "", shareAmount: "", shareAmountMeritIn: "", advanceType: ""
});

export const createEmptyVendorRow = (): VendorRow => ({
  no: "", adopted: false, vendorCode: "", vendorName: "", quoteDate: "", note: "", quoteNo: "", quoteAmount: "", afterDiscountAmount: "", decidedDate: ""
});

export const defaultVendorForm: VendorFormData = {
  legalWelfareDoc: "",
  specialNote: "",
  orderComment: "",
  deadlineDay: "",
  paymentMonthType: "",
  paymentDay: "",
  paymentType: "",
  commissionRate: "",
  site: "",
  deductionCondition: "",
};

export const createEmptyOrder = (): OrderData => ({
  header: { ...defaultHeader, orderNo: generateOrderNo(), orderDate: getTodayDate(), createdDate: getTodayDate() },
  rows: [createEmptyDetailRow(), createEmptyDetailRow(), createEmptyDetailRow()],
  advanceRows: [createEmptyAdvanceRow(), createEmptyAdvanceRow(), createEmptyAdvanceRow()],
  vendorForm: { ...defaultVendorForm },
  vendorRows: [createEmptyVendorRow(), createEmptyVendorRow(), createEmptyVendorRow()],
});

interface OrderDataContextType {
  orders: OrderData[];
  setOrders: (orders: OrderData[]) => void;
  currentOrderIndex: number;
  setCurrentOrderIndex: (index: number) => void;
  addOrder: () => void;
  removeOrder: (index: number) => void;
  updateOrder: (index: number, data: Partial<OrderData>) => void;
  // 工事実行予算台帳用
  ledgerHeader: BudgetLedgerHeader;
  setLedgerHeader: (header: BudgetLedgerHeader) => void;
  ledgerRows: BudgetLedgerRow[];
  setLedgerRows: (rows: BudgetLedgerRow[]) => void;
  // 発注予定表用
  orderScheduleRows: OrderScheduleRow[];
  setOrderScheduleRows: (rows: OrderScheduleRow[]) => void;
}

const OrderDataContext = createContext<OrderDataContextType | undefined>(undefined);

export function OrderDataProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<OrderData[]>([createEmptyOrder()]);
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const [ledgerHeader, setLedgerHeader] = useState<BudgetLedgerHeader>({ ...defaultBudgetLedgerHeader });
  const [ledgerRows, setLedgerRows] = useState<BudgetLedgerRow[]>([
    createEmptyBudgetLedgerRow(),
    createEmptyBudgetLedgerRow(),
    createEmptyBudgetLedgerRow(),
    createEmptyBudgetLedgerRow(),
    createEmptyBudgetLedgerRow(),
  ]);
  const [orderScheduleRows, setOrderScheduleRows] = useState<OrderScheduleRow[]>([
    createEmptyOrderScheduleRow(),
    createEmptyOrderScheduleRow(),
    createEmptyOrderScheduleRow(),
    createEmptyOrderScheduleRow(),
    createEmptyOrderScheduleRow(),
  ]);

  const addOrder = () => {
    setOrders(prev => [...prev, createEmptyOrder()]);
    setCurrentOrderIndex(orders.length);
  };

  const removeOrder = (index: number) => {
    if (orders.length <= 1) return;
    setOrders(prev => prev.filter((_, i) => i !== index));
    if (index <= currentOrderIndex) {
      setCurrentOrderIndex(Math.max(0, currentOrderIndex - 1));
    }
  };

  const updateOrder = (index: number, data: Partial<OrderData>) => {
    setOrders(prev => prev.map((order, i) =>
      i === index ? { ...order, ...data } : order
    ));
  };

  return (
    <OrderDataContext.Provider
      value={{
        orders,
        setOrders,
        currentOrderIndex,
        setCurrentOrderIndex,
        addOrder,
        removeOrder,
        updateOrder,
        ledgerHeader,
        setLedgerHeader,
        ledgerRows,
        setLedgerRows,
        orderScheduleRows,
        setOrderScheduleRows,
      }}
    >
      {children}
    </OrderDataContext.Provider>
  );
}

export function useOrderData() {
  const context = useContext(OrderDataContext);
  if (context === undefined) {
    throw new Error('useOrderData must be used within an OrderDataProvider');
  }
  return context;
}
