'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// 明細行
export type DetailRow = {
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

// デフォルト値
export const defaultHeader: OrderHeader = {
  orderNo: "",
  historyNo: "",
  orderDate: "",
  createdDate: "",
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
  no: "", workType: "", taxType: "", execBudget: "", orderedAmount: "", contractAmount: "", contractTax: "", budgetRemain: "", advanceTo: "", maker: "", listPrice: "", meritAmount: "", meritTax: "", meritInclTax: ""
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
  header: { ...defaultHeader },
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
  ledgerRows: BudgetLedgerRow[];
  setLedgerRows: (rows: BudgetLedgerRow[]) => void;
}

const OrderDataContext = createContext<OrderDataContextType | undefined>(undefined);

export function OrderDataProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<OrderData[]>([createEmptyOrder()]);
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const [ledgerRows, setLedgerRows] = useState<BudgetLedgerRow[]>([]);

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
        ledgerRows,
        setLedgerRows,
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
