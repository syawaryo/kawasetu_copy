"use client";

import { useMemo, useState } from "react";

export type PayeeRow = {
  vendorCode: string;       // 取引先コード
  vendorName: string;       // 取引先（正式名称）
  transferBaseName: string; // 振込先元文字
  vendorKana: string;       // 取引先カナ名称
  userCode: string;         // ユーザーコード
  bankName: string;         // 振込銀行
  accountNo: string;        // 口座番号
  accountName: string;      // 口座名義
  zip: string;              // 郵便番号
  address: string;          // 住所
  address2: string;         // 住所２
  tel: string;              // TEL
  fax: string;              // FAX
  businessRegNo: string;    // 事業者登録番号
  // 追加情報
  vendorType: string;       // 取引先区分名称
  cancelType: string;       // 取消区分
  paymentType: string;      // 入金区分名称
  paymentBillRate: string;  // 入金手形率
  paymentBillSite: string;  // 入金手形サイト
  payDate: string;          // 支払日
  payType: string;          // 支払区分名称
  payBillRate: string;      // 支払手形率
  payBillSite: string;      // 支払手形サイト
};

// ダミーデータ（実際はAPIから取得）
const SAMPLE_PAYEES: PayeeRow[] = [
  {
    vendorCode: "402910000",
    vendorName: "株式会社ユーザーローカル　本社",
    transferBaseName: "株式会社ユーザーローカル",
    vendorKana: "ユーザーローカル",
    userCode: "A-001",
    bankName: "みずほ銀行",
    accountNo: "6800175",
    accountName: "カブシキガイシャユーザーローカル",
    zip: "108-0023",
    address: "東京都港区芝浦3-1-21",
    address2: "msb Tamachi 田町ステーションタワーS 14F",
    tel: "03-6435-2115",
    fax: "",
    businessRegNo: "T9011001069346",
    vendorType: "仕入先",
    cancelType: "",
    paymentType: "",
    paymentBillRate: "0",
    paymentBillSite: "",
    payDate: "99",
    payType: "手形",
    payBillRate: "100",
    payBillSite: "60",
  },
  {
    vendorCode: "402920000",
    vendorName: "川崎設備工業株式会社",
    transferBaseName: "川崎設備工業（株）",
    vendorKana: "カワサキセツビコウギョウ",
    userCode: "K-001",
    bankName: "三井住友銀行",
    accountNo: "1234567",
    accountName: "カワサキセツビコウギョウ",
    zip: "210-0001",
    address: "神奈川県川崎市川崎区本町1-1-1",
    address2: "",
    tel: "044-123-4567",
    fax: "044-123-4568",
    businessRegNo: "T1234567890123",
    vendorType: "支払先",
    cancelType: "",
    paymentType: "現金",
    paymentBillRate: "100",
    paymentBillSite: "",
    payDate: "20",
    payType: "現金",
    payBillRate: "100",
    payBillSite: "",
  },
  {
    vendorCode: "402930000",
    vendorName: "東京建設資材株式会社",
    transferBaseName: "東京建設資材（株）",
    vendorKana: "トウキョウケンセツシザイ",
    userCode: "T-001",
    bankName: "りそな銀行",
    accountNo: "9876543",
    accountName: "トウキョウケンセツシザイ",
    zip: "100-0001",
    address: "東京都千代田区千代田1-1",
    address2: "千代田ビル 5F",
    tel: "03-1234-5678",
    fax: "03-1234-5679",
    businessRegNo: "T2345678901234",
    vendorType: "外注先",
    cancelType: "",
    paymentType: "現金",
    paymentBillRate: "100",
    paymentBillSite: "",
    payDate: "末日",
    payType: "現金",
    payBillRate: "100",
    payBillSite: "",
  },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (payee: PayeeRow) => void;
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-7 bg-slate-600 px-2 text-xs font-semibold leading-7 text-white rounded-sm">
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "h-7 w-full rounded-sm border border-slate-300 bg-white px-2 text-xs",
        "focus:border-blue-500 focus:outline-none",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

export function PayeeMasterModal({ isOpen, onClose, onSelect }: Props) {
  // 条件
  const [cond, setCond] = useState({
    // 取引区分
    kbnPay: true,
    kbnPurchase: true,
    kbnOutsource: true,

    // 部分一致
    partialMatch: true,

    // 検索条件
    transferBaseName: "",
    vendorKana: "",
    userCode: "",
    bankName: "",
    accountNo: "",
    accountName: "",
  });

  const [rows] = useState<PayeeRow[]>(SAMPLE_PAYEES);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // フィルタ
  const filtered = useMemo(() => {
    const m = (a: string, b: string) => {
      if (!b) return true;
      return cond.partialMatch ? a.toLowerCase().includes(b.toLowerCase()) : a === b;
    };

    return rows.filter((r) => {
      // 取引区分フィルタ
      const matchType =
        (cond.kbnPay && r.vendorType === "支払先") ||
        (cond.kbnPurchase && r.vendorType === "仕入先") ||
        (cond.kbnOutsource && r.vendorType === "外注先");

      if (!matchType && (cond.kbnPay || cond.kbnPurchase || cond.kbnOutsource)) {
        return false;
      }

      return (
        m(r.transferBaseName, cond.transferBaseName) &&
        m(r.vendorKana, cond.vendorKana) &&
        m(r.userCode, cond.userCode) &&
        m(r.bankName, cond.bankName) &&
        m(r.accountNo, cond.accountNo) &&
        m(r.accountName, cond.accountName)
      );
    });
  }, [rows, cond]);

  const handleConfirm = () => {
    const picked = filtered[selectedIndex];
    if (picked) {
      onSelect(picked);
      onClose();
    }
  };

  const handleRowDoubleClick = (idx: number) => {
    setSelectedIndex(idx);
    const picked = filtered[idx];
    if (picked) {
      onSelect(picked);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "0.5rem",
          width: "95%",
          maxWidth: "1500px",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div
          style={{
            padding: "0.75rem 1rem",
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#132942",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
            支払先マスタ検索
          </h2>
          <button
            style={{
              width: 28,
              height: 28,
              border: "none",
              backgroundColor: "transparent",
              fontSize: "1.25rem",
              cursor: "pointer",
              color: "#fff",
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* 検索条件 */}
        <div style={{ padding: "0.75rem", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {/* 左カラム */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "0.5rem", alignItems: "center" }}>
                <Label>取引区分</Label>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem", fontSize: "0.75rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <input
                      type="checkbox"
                      checked={cond.kbnPay}
                      onChange={(e) => setCond((c) => ({ ...c, kbnPay: e.target.checked }))}
                    />
                    支払先
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <input
                      type="checkbox"
                      checked={cond.kbnPurchase}
                      onChange={(e) => setCond((c) => ({ ...c, kbnPurchase: e.target.checked }))}
                    />
                    仕入先
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <input
                      type="checkbox"
                      checked={cond.kbnOutsource}
                      onChange={(e) => setCond((c) => ({ ...c, kbnOutsource: e.target.checked }))}
                    />
                    外注先
                  </label>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "0.5rem", alignItems: "center" }}>
                <Label>部分一致</Label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem" }}>
                  <input
                    type="checkbox"
                    checked={cond.partialMatch}
                    onChange={(e) => setCond((c) => ({ ...c, partialMatch: e.target.checked }))}
                  />
                  有効
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "0.5rem", alignItems: "center" }}>
                <Label>振込先元文字</Label>
                <Input
                  value={cond.transferBaseName}
                  onChange={(e) => setCond((c) => ({ ...c, transferBaseName: e.target.value }))}
                  placeholder="例: 川崎設備"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "0.5rem", alignItems: "center" }}>
                <Label>取引先カナ</Label>
                <Input
                  value={cond.vendorKana}
                  onChange={(e) => setCond((c) => ({ ...c, vendorKana: e.target.value }))}
                  placeholder="例: カワサキ"
                />
              </div>
            </div>

            {/* 右カラム */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "0.5rem", alignItems: "center" }}>
                <Label>ユーザーコード</Label>
                <Input
                  value={cond.userCode}
                  onChange={(e) => setCond((c) => ({ ...c, userCode: e.target.value }))}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "0.5rem", alignItems: "center" }}>
                <Label>振込銀行</Label>
                <Input
                  value={cond.bankName}
                  onChange={(e) => setCond((c) => ({ ...c, bankName: e.target.value }))}
                  placeholder="例: みずほ"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "0.5rem", alignItems: "center" }}>
                <Label>口座番号</Label>
                <Input
                  value={cond.accountNo}
                  onChange={(e) => setCond((c) => ({ ...c, accountNo: e.target.value }))}
                  placeholder="例: 6800175"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "0.5rem", alignItems: "center" }}>
                <Label>口座名義</Label>
                <Input
                  value={cond.accountName}
                  onChange={(e) => setCond((c) => ({ ...c, accountName: e.target.value }))}
                  placeholder="例: カワサキセツビ"
                />
              </div>
            </div>
          </div>
        </div>

        {/* テーブル */}
        <div style={{ flex: 1, overflow: "auto", padding: "0.75rem" }}>
          <div style={{ overflow: "auto", border: "1px solid #e2e8f0", borderRadius: "0.25rem" }}>
            <div style={{ height: "340px", overflow: "auto" }}>
              <table style={{ minWidth: "1400px", borderCollapse: "collapse", fontSize: "0.75rem" }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                  <tr style={{ backgroundColor: "#132942", color: "#fff" }}>
                    <th style={{ width: 28, border: "1px solid #1e3a5f", padding: "0.375rem" }}></th>
                    <th style={{ width: 100, border: "1px solid #1e3a5f", padding: "0.375rem", textAlign: "left" }}>取引先コード</th>
                    <th style={{ width: 200, border: "1px solid #1e3a5f", padding: "0.375rem", textAlign: "left" }}>正式名称</th>
                    <th style={{ width: 160, border: "1px solid #1e3a5f", padding: "0.375rem", textAlign: "left" }}>振込先元文字</th>
                    <th style={{ width: 160, border: "1px solid #1e3a5f", padding: "0.375rem", textAlign: "left" }}>取引先カナ</th>
                    <th style={{ width: 80, border: "1px solid #1e3a5f", padding: "0.375rem", textAlign: "left" }}>ユーザーコード</th>
                    <th style={{ width: 100, border: "1px solid #1e3a5f", padding: "0.375rem", textAlign: "left" }}>振込銀行</th>
                    <th style={{ width: 80, border: "1px solid #1e3a5f", padding: "0.375rem", textAlign: "left" }}>口座番号</th>
                    <th style={{ width: 140, border: "1px solid #1e3a5f", padding: "0.375rem", textAlign: "left" }}>口座名義</th>
                    <th style={{ width: 80, border: "1px solid #1e3a5f", padding: "0.375rem", textAlign: "left" }}>郵便番号</th>
                    <th style={{ width: 200, border: "1px solid #1e3a5f", padding: "0.375rem", textAlign: "left" }}>住所</th>
                    <th style={{ width: 100, border: "1px solid #1e3a5f", padding: "0.375rem", textAlign: "left" }}>TEL</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, idx) => {
                    const isSel = idx === selectedIndex;
                    return (
                      <tr
                        key={`${r.vendorCode}-${idx}`}
                        style={{
                          cursor: "pointer",
                          backgroundColor: isSel ? "#0d56c9" : idx % 2 === 0 ? "#fff" : "#f8fafc",
                          color: isSel ? "#fff" : "inherit",
                        }}
                        onClick={() => setSelectedIndex(idx)}
                        onDoubleClick={() => handleRowDoubleClick(idx)}
                      >
                        <td style={{ border: "1px solid #e2e8f0", padding: "0.375rem", textAlign: "center" }}>
                          {isSel ? "▶" : ""}
                        </td>
                        <td style={{ border: "1px solid #e2e8f0", padding: "0.375rem" }}>{r.vendorCode}</td>
                        <td style={{ border: "1px solid #e2e8f0", padding: "0.375rem" }}>{r.vendorName}</td>
                        <td style={{ border: "1px solid #e2e8f0", padding: "0.375rem" }}>{r.transferBaseName}</td>
                        <td style={{ border: "1px solid #e2e8f0", padding: "0.375rem" }}>{r.vendorKana}</td>
                        <td style={{ border: "1px solid #e2e8f0", padding: "0.375rem" }}>{r.userCode}</td>
                        <td style={{ border: "1px solid #e2e8f0", padding: "0.375rem" }}>{r.bankName}</td>
                        <td style={{ border: "1px solid #e2e8f0", padding: "0.375rem" }}>{r.accountNo}</td>
                        <td style={{ border: "1px solid #e2e8f0", padding: "0.375rem" }}>{r.accountName}</td>
                        <td style={{ border: "1px solid #e2e8f0", padding: "0.375rem" }}>{r.zip}</td>
                        <td style={{ border: "1px solid #e2e8f0", padding: "0.375rem" }}>{r.address}</td>
                        <td style={{ border: "1px solid #e2e8f0", padding: "0.375rem" }}>{r.tel}</td>
                      </tr>
                    );
                  })}

                  {/* 空白行 */}
                  {filtered.length < 8 &&
                    Array.from({ length: 8 - filtered.length }).map((_, i) => (
                      <tr key={`empty-${i}`} style={{ height: 28 }}>
                        {Array.from({ length: 12 }).map((__, j) => (
                          <td key={j} style={{ border: "1px solid #e2e8f0", padding: "0.375rem" }} />
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "0.5rem",
            borderTop: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            padding: "0.75rem 1rem",
          }}
        >
          <button
            type="button"
            style={{
              height: 32,
              borderRadius: "0.25rem",
              border: "none",
              backgroundColor: "#0d56c9",
              color: "#fff",
              padding: "0 1rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={handleConfirm}
          >
            確定(E)
          </button>
          <button
            type="button"
            style={{
              height: 32,
              borderRadius: "0.25rem",
              border: "1px solid #e2e8f0",
              backgroundColor: "#fff",
              color: "#374151",
              padding: "0 1rem",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
            onClick={onClose}
          >
            キャンセル(C)
          </button>
        </div>
      </div>
    </div>
  );
}
