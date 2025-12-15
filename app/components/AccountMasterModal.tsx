"use client";

import { useMemo, useState, useEffect } from "react";

export type AccountRow = {
  accountCode: string;   // 科目コード
  accountName: string;   // 科目名称
};

// マスターデータをパースして読み込む
const parseAccountMaster = (text: string): AccountRow[] => {
  const lines = text.trim().split('\n');
  // 1行目はヘッダーなのでスキップ
  return lines.slice(1).map(line => {
    const [accountCode, accountName] = line.split('\t');
    return {
      accountCode: accountCode?.trim() || '',
      accountName: accountName?.trim().replace(/\s+/g, '') || '', // スペースを除去
    };
  }).filter(row => row.accountCode && row.accountName);
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (account: AccountRow) => void;
  initialSearchText?: string;
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

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        "h-7 w-full rounded-sm border border-slate-300 bg-white px-2 text-xs",
        "focus:border-blue-500 focus:outline-none",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

export function AccountMasterModal({ isOpen, onClose, onSelect, initialSearchText = "" }: Props) {
  // 条件
  const [cond, setCond] = useState({
    showCanceled: false,      // 取消済も表示する
    accountType: "全て",      // 科目区分
    taxType: "全て",          // 税区分
    matchMode: "部分一致",    // 部分一致/前方一致/完全一致
    accountName: initialSearchText, // 科目名称
    accountCode: "",          // 科目コード
  });

  // マスターデータ
  const [rows, setRows] = useState<AccountRow[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 初期検索テキストが変わったら更新
  useEffect(() => {
    if (isOpen) {
      setCond(prev => ({ ...prev, accountName: initialSearchText }));
    }
  }, [isOpen, initialSearchText]);

  // マスターデータを読み込む
  useEffect(() => {
    if (isOpen && rows.length === 0) {
      setLoading(true);
      fetch('/accountTitleMaster')
        .then(res => res.text())
        .then(text => {
          const parsed = parseAccountMaster(text);
          setRows(parsed);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load account master:', err);
          setLoading(false);
        });
    }
  }, [isOpen, rows.length]);

  // フィルタリング
  const filtered = useMemo(() => {
    const nameQuery = cond.accountName.trim();
    const codeQuery = cond.accountCode.trim();

    const matchName = (s: string) => {
      if (!nameQuery) return true;
      const lowerS = s.toLowerCase();
      const lowerQ = nameQuery.toLowerCase();
      if (cond.matchMode === "完全一致") return lowerS === lowerQ;
      if (cond.matchMode === "前方一致") return lowerS.startsWith(lowerQ);
      return lowerS.includes(lowerQ); // 部分一致
    };

    const matchCode = (s: string) => {
      if (!codeQuery) return true;
      return s.startsWith(codeQuery);
    };

    return rows.filter((r) => {
      return matchName(r.accountName) && matchCode(r.accountCode);
    });
  }, [rows, cond.accountName, cond.accountCode, cond.matchMode]);

  // フィルタ結果が変わったら選択をリセット
  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length]);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
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
        zIndex: 1100,
      }}
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "0.5rem",
          width: "95%",
          maxWidth: "1000px",
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
            科目マスタ検索
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
                <Label>科目区分</Label>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem", fontSize: "0.75rem" }}>
                  {["全て", "完成工事", "販管費", "営業外"].map((x) => (
                    <label key={x} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <input
                        type="radio"
                        name="accountType"
                        checked={cond.accountType === x}
                        onChange={() => setCond((c) => ({ ...c, accountType: x }))}
                      />
                      {x}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "0.5rem", alignItems: "center" }}>
                <Label>科目コード</Label>
                <Input
                  value={cond.accountCode}
                  onChange={(e) => setCond((c) => ({ ...c, accountCode: e.target.value }))}
                  placeholder="例: 8210"
                />
              </div>
            </div>

            {/* 右カラム */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "0.5rem", alignItems: "center" }}>
                <Label>文字一致条件</Label>
                <Select
                  value={cond.matchMode}
                  onChange={(e) => setCond((c) => ({ ...c, matchMode: e.target.value }))}
                >
                  <option>部分一致</option>
                  <option>前方一致</option>
                  <option>完全一致</option>
                </Select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "0.5rem", alignItems: "center" }}>
                <Label>科目名称</Label>
                <Input
                  value={cond.accountName}
                  onChange={(e) => setCond((c) => ({ ...c, accountName: e.target.value }))}
                  placeholder="例: 雑費"
                  autoFocus
                />
              </div>
            </div>
          </div>
        </div>

        {/* テーブル */}
        <div style={{ flex: 1, overflow: "auto", padding: "0.75rem" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "#6b7280" }}>
              読み込み中...
            </div>
          ) : (
            <div style={{ overflow: "auto", border: "1px solid #e2e8f0", borderRadius: "0.25rem" }}>
              <div style={{ height: "340px", overflow: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                    <tr style={{ backgroundColor: "#132942", color: "#fff" }}>
                      <th style={{ width: 28, border: "1px solid #1e3a5f", padding: "0.375rem" }}></th>
                      <th style={{ width: 120, border: "1px solid #1e3a5f", padding: "0.375rem", textAlign: "left" }}>科目コード</th>
                      <th style={{ border: "1px solid #1e3a5f", padding: "0.375rem", textAlign: "left" }}>科目名称</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 100).map((r, idx) => {
                      const isSel = idx === selectedIndex;
                      return (
                        <tr
                          key={`${r.accountCode}-${idx}`}
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
                          <td style={{ border: "1px solid #e2e8f0", padding: "0.375rem", fontFamily: "monospace" }}>{r.accountCode}</td>
                          <td style={{ border: "1px solid #e2e8f0", padding: "0.375rem" }}>{r.accountName}</td>
                        </tr>
                      );
                    })}

                    {/* 空白行 */}
                    {filtered.length < 10 &&
                      Array.from({ length: 10 - Math.min(filtered.length, 10) }).map((_, i) => (
                        <tr key={`empty-${i}`} style={{ height: 28 }}>
                          {Array.from({ length: 3 }).map((__, j) => (
                            <td key={j} style={{ border: "1px solid #e2e8f0", padding: "0.375rem" }} />
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 件数表示 */}
          <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#6b7280" }}>
            {filtered.length > 100
              ? `${filtered.length}件中 100件を表示`
              : `${filtered.length}件`
            }
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
