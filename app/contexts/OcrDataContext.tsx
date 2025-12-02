'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// OCR抽出データの型
export interface OcrExtractedData {
  // 金額系
  subtotalAmount?: string;       // 小計(税抜)
  consumptionTaxAmount?: string; // 消費税(10%)
  totalAmount?: string;          // 合計(税込)

  // 支払先情報
  payeeCompanyName?: string;     // 支払先会社名
  payeePostalCode?: string;      // 支払先郵便番号
  payeeAddress?: string;         // 支払先住所
  payeePhoneNumber?: string;     // 支払先電話番号
  payeeEmailAddress?: string;    // 支払先メールアドレス

  // 銀行情報
  bankName?: string;             // 振込先銀行名
  bankBranchName?: string;       // 振込先銀行支店
  bankAccountType?: string;      // 振込先口座種類
  bankAccountNumber?: string;    // 振込先口座番号
  payeeCompanyNameKana?: string; // 振込先会社名半角カナ

  // その他
  paymentDueDate?: string;       // 支払期限
  invoiceRegNo?: string;         // 適格請求書発行事業者登録番号

  // 明細行
  invoiceItems?: {
    itemNo?: string;
    itemDescription?: string;
    itemQuantity?: string;
    itemUnitPrice?: string;
    itemAmount?: string;
  }[];

  // 請求書ファイル（申請時に使用）
  invoiceFileUrl?: string;       // 請求書のBlobURL
  invoiceFileName?: string;      // 請求書のファイル名
}

interface OcrDataContextType {
  ocrData: OcrExtractedData | null;
  setOcrData: (data: OcrExtractedData | null) => void;
  clearOcrData: () => void;
}

const OcrDataContext = createContext<OcrDataContextType | undefined>(undefined);

export function OcrDataProvider({ children }: { children: ReactNode }) {
  const [ocrData, setOcrData] = useState<OcrExtractedData | null>(null);

  const clearOcrData = () => setOcrData(null);

  return (
    <OcrDataContext.Provider value={{ ocrData, setOcrData, clearOcrData }}>
      {children}
    </OcrDataContext.Provider>
  );
}

export function useOcrData() {
  const context = useContext(OcrDataContext);
  if (context === undefined) {
    throw new Error('useOcrData must be used within an OcrDataProvider');
  }
  return context;
}
