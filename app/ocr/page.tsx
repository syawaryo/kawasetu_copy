"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { analyzeDocument, OcrResponse, OcrField } from "@/lib/ocr";
import { useOcrData, OcrExtractedData } from "@/app/contexts/OcrDataContext";
import * as pdfjsLib from "pdfjs-dist";

// PDF.js workerの設定
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

// 共通スタイル
const buttonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  fontSize: '0.85rem',
  fontWeight: 600,
  border: 'none',
  borderRadius: '0.375rem',
  cursor: 'pointer',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '0.625rem',
  border: '1px solid #dde5f4',
  marginBottom: '1.5rem',
};

const cardHeaderStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  borderBottom: '1px solid #dde5f4',
  backgroundColor: '#f8f9fa',
};

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#1a1c20',
};

// フィールドごとの色
const fieldColors: string[] = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f43f5e',
  '#84cc16', '#06b6d4', '#8b5cf6', '#d946ef', '#fb923c',
];

function getFieldColor(index: number): string {
  return fieldColors[index % fieldColors.length];
}

// フィールド名の日本語マッピング
const fieldLabelMap: Record<string, string> = {
  payeeCompanyName: "支払先会社名",
  payeePostalCode: "支払先郵便番号",
  payeeAddress: "支払先住所",
  payeePhoneNumber: "支払先電話番号",
  payeeEmailAddress: "支払先メールアドレス",
  bankName: "振込先銀行名",
  bankBranchName: "振込先銀行支店",
  bankAccountType: "振込先口座種類",
  bankAccountNumber: "振込先口座番号",
  payeeCompanyNameKana: "振込先会社名半角カナ",
  paymentDueDate: "支払期限",
  invoiceAmountFontMax: "請求額",
  subtotalAmount: "小計(税抜)",
  consumptionTaxAmount: "消費税(10%)",
  totalAmount: "合計(税込)",
  invoiceRegNo: "適格請求書発行事業者登録番号",
};

// テーブル列名の日本語マッピング
const tableColumnLabelMap: Record<string, string> = {
  itemNo: "No",
  itemDescription: "品目",
  itemQuantity: "数量",
  itemUnitPrice: "単価",
  itemAmount: "金額",
};

// フィールドキーを日本語ラベルに変換
function getFieldLabel(key: string): string {
  // 配列フィールドの場合: invoiceItems[1].itemNo -> "1行目No"
  const arrayMatch = key.match(/^(\w+)\[(\d+)\]\.(\w+)$/);
  if (arrayMatch) {
    const [, , rowNum, colKey] = arrayMatch;
    const colLabel = tableColumnLabelMap[colKey] || colKey;
    return `${rowNum}行目${colLabel}`;
  }

  // 通常フィールド
  return fieldLabelMap[key] || key;
}

// バウンディングボックスオーバーレイ
function BoundingBoxOverlay({
  data,
  canvasSize,
  pageSize,
  hoveredKey,
  onHover,
}: {
  data: Record<string, OcrField>;
  canvasSize: { width: number; height: number };
  pageSize: { width: number; height: number };
  hoveredKey: string | null;
  onHover: (key: string | null) => void;
}) {
  const entries = Object.entries(data);

  // インチ座標 → ピクセル座標に変換
  const scaleX = canvasSize.width / pageSize.width;
  const scaleY = canvasSize.height / pageSize.height;

  return (
    <svg
      style={{
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
      preserveAspectRatio="xMinYMin meet"
    >
      {entries.map(([key, field], index) => {
        if (!field.x || !field.y || field.x.length < 4) return null;

        const color = getFieldColor(index);
        const isHovered = hoveredKey === key;

        // 座標変換
        const scaledX = field.x.map(x => x * scaleX);
        const scaledY = field.y.map(y => y * scaleY);
        const points = scaledX.map((x, i) => `${x},${scaledY[i]}`).join(' ');

        return (
          <g key={key}>
            <polygon
              points={points}
              fill={isHovered ? color : `${color}20`}
              fillOpacity={isHovered ? 0.4 : 0.2}
              stroke={color}
              strokeWidth={isHovered ? 3 : 2}
              style={{ pointerEvents: 'all', cursor: 'pointer' }}
              onMouseEnter={() => onHover(key)}
              onMouseLeave={() => onHover(null)}
            />
            <text
              x={Math.min(...scaledX)}
              y={Math.min(...scaledY) - 4}
              fill={color}
              fontSize="14"
              fontWeight="bold"
              style={{ pointerEvents: 'none' }}
            >
              {getFieldLabel(key)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function OcrPage() {
  const router = useRouter();
  const { setOcrData } = useOcrData();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OcrResponse | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  // 適格請求書発行事業者登録番号を整形 (Tあればつける + 数字13桁)
  const formatInvoiceRegNo = (raw: string | undefined): string | undefined => {
    if (!raw) return undefined;
    const hasT = /[Tt]/.test(raw);
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 13);
    if (digits.length !== 13) return undefined;
    return hasT ? `T${digits}` : digits;
  };

  // OCR結果をContextに保存して遷移
  const handleGoToPaymentSlip = useCallback(() => {
    if (result?.success && result.data) {
      const data = result.data;
      const extracted: OcrExtractedData = {
        subtotalAmount: data.subtotalAmount?.content,
        consumptionTaxAmount: data.consumptionTaxAmount?.content,
        totalAmount: data.totalAmount?.content,
        payeeCompanyName: data.payeeCompanyName?.content,
        payeePostalCode: data.payeePostalCode?.content,
        payeeAddress: data.payeeAddress?.content,
        payeePhoneNumber: data.payeePhoneNumber?.content,
        payeeEmailAddress: data.payeeEmailAddress?.content,
        bankName: data.bankName?.content,
        bankBranchName: data.bankBranchName?.content,
        bankAccountType: data.bankAccountType?.content,
        bankAccountNumber: data.bankAccountNumber?.content,
        payeeCompanyNameKana: data.payeeCompanyNameKana?.content,
        paymentDueDate: data.paymentDueDate?.content,
        invoiceRegNo: formatInvoiceRegNo(data.invoiceRegNo?.content),
        invoiceItems: [],
      };

      // 明細行を抽出
      const itemKeys = Object.keys(data).filter(k => k.startsWith('invoiceItems['));
      const itemMap: Record<number, Record<string, string>> = {};
      itemKeys.forEach(key => {
        const match = key.match(/^invoiceItems\[(\d+)\]\.(\w+)$/);
        if (match) {
          const idx = parseInt(match[1], 10);
          const field = match[2];
          if (!itemMap[idx]) itemMap[idx] = {};
          itemMap[idx][field] = data[key]?.content || '';
        }
      });
      extracted.invoiceItems = Object.keys(itemMap)
        .map(k => parseInt(k, 10))
        .sort((a, b) => a - b)
        .map(idx => itemMap[idx]);

      // 請求書ファイルをBlobURLで保存
      if (file) {
        const fileUrl = URL.createObjectURL(file);
        extracted.invoiceFileUrl = fileUrl;
        extracted.invoiceFileName = file.name;
      }

      setOcrData(extracted);
    }
    router.push('/payment-slip');
  }, [result, file, setOcrData, router]);

  // PDFをCanvasにレンダリング
  const renderPdf = useCallback(async (pdfDoc: pdfjsLib.PDFDocumentProxy) => {
    if (!canvasRef.current) return;

    const page = await pdfDoc.getPage(1);
    const scale = 2;
    const viewport = page.getViewport({ scale });

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    }).promise;

    setCanvasSize({ width: viewport.width, height: viewport.height });
  }, []);

  // PDFファイルを読み込み
  const loadPdf = useCallback(async (pdfFile: File) => {
    setPdfLoading(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      pdfDocRef.current = pdf;
      // canvasがマウントされた後にレンダリング
    } catch (err) {
      console.error("PDF load error:", err);
    } finally {
      setPdfLoading(false);
    }
  }, []);

  // canvasマウント後にPDFをレンダリング
  useEffect(() => {
    if (pdfDocRef.current && canvasRef.current && !pdfLoading) {
      renderPdf(pdfDocRef.current);
    }
  }, [pdfLoading, renderPdf]);

  const handleFileChange = useCallback((selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setCanvasSize(null);
      setPreview(null);
      pdfDocRef.current = null;

      const isPdfFile = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
      setIsPdf(isPdfFile);

      if (isPdfFile) {
        loadPdf(selectedFile);
      } else if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(selectedFile);
      }
    }
  }, [loadPdf]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files[0]);
  }, [handleFileChange]);

  const handleAnalyze = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    const res = await analyzeDocument(file);
    setResult(res);
    setLoading(false);
  }, [file]);

  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      setCanvasSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
    }
  }, []);

  const hasResult = result?.success && result.data;
  const hasPreview = isPdf ? !pdfLoading : !!preview;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f7' }}>
      {/* ヘッダー */}
      <header style={{ backgroundColor: '#132942', color: '#fff', padding: '0.75rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1800px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, backgroundColor: '#0d56c9', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" fill="none" stroke="#fff" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>OCR読取</h1>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>Document Intelligence</p>
            </div>
          </div>
          <button
            onClick={handleGoToPaymentSlip}
            style={{ ...buttonStyle, backgroundColor: '#10b981', color: '#fff' }}
          >
            支払伝票入力に進む
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1800px', margin: '0 auto', padding: '1.5rem 24px' }}>
        {/* ファイルアップロード */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={cardTitleStyle}>ファイル選択</h2>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
                style={{
                  flex: 1,
                  border: `2px dashed ${dragOver ? '#0d56c9' : '#dde5f4'}`,
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  textAlign: 'center',
                  backgroundColor: dragOver ? '#eff6ff' : '#f8f9fa',
                  cursor: 'pointer',
                }}
              >
                <input
                  id="file-input"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
                {file ? (
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0c4a6e' }}>
                    {file.name} ({(file.size / 1024).toFixed(1)} KB) {isPdf && <span style={{ color: '#dc2626' }}>[PDF]</span>}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: '#686e78' }}>
                    PDF・画像をドラッグ＆ドロップ または クリック
                  </span>
                )}
              </div>
              <button
                onClick={handleAnalyze}
                disabled={!file || loading}
                style={{
                  ...buttonStyle,
                  padding: '0.75rem 2rem',
                  backgroundColor: !file || loading ? '#93c5fd' : '#0d56c9',
                  color: '#fff',
                  cursor: !file || loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? '解析中...' : 'OCR解析'}
              </button>
            </div>
          </div>
        </div>

        {/* プレビュー + オーバーレイ */}
        {(hasPreview || pdfLoading) && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            {/* 左: PDF/画像 + ボックス */}
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <h2 style={cardTitleStyle}>
                  {hasResult ? 'OCR検出結果' : 'プレビュー'}
                </h2>
              </div>
              <div style={{ padding: '1rem', overflow: 'auto' }}>
                {pdfLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    PDF読み込み中...
                  </div>
                ) : (
                  <div
                    ref={containerRef}
                    style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}
                  >
                    {isPdf ? (
                      <canvas
                        ref={canvasRef}
                        style={{ maxWidth: '100%', borderRadius: '0.375rem', border: '1px solid #dde5f4', display: 'block' }}
                      />
                    ) : (
                      <img
                        ref={imageRef}
                        src={preview!}
                        alt="プレビュー"
                        onLoad={handleImageLoad}
                        style={{ maxWidth: '100%', borderRadius: '0.375rem', border: '1px solid #dde5f4', display: 'block' }}
                      />
                    )}
                    {hasResult && canvasSize && result.pageSize && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: 'none',
                      }}>
                        <BoundingBoxOverlay
                          data={result.data!}
                          canvasSize={canvasSize}
                          pageSize={result.pageSize}
                          hoveredKey={hoveredKey}
                          onHover={setHoveredKey}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 右: 抽出データ */}
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <h2 style={cardTitleStyle}>抽出データ</h2>
              </div>
              <div style={{ padding: '1rem', maxHeight: '600px', overflow: 'auto' }}>
                {loading && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#0d56c9' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem' }}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>解析中...</p>
                  </div>
                )}

                {result && !result.success && (
                  <div style={{ padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '0.375rem', color: '#991b1b' }}>
                    エラー: {result.error}
                  </div>
                )}

                {!loading && !result && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                    OCR解析を実行してください
                  </div>
                )}

                {hasResult && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', width: 24 }}></th>
                        <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>フィールド</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>値</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(result.data!).map(([key, value], index) => {
                        const color = getFieldColor(index);
                        const isHovered = hoveredKey === key;
                        return (
                          <tr
                            key={key}
                            style={{
                              borderBottom: '1px solid #e5e7eb',
                              backgroundColor: isHovered ? `${color}20` : 'transparent',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={() => setHoveredKey(key)}
                            onMouseLeave={() => setHoveredKey(null)}
                          >
                            <td style={{ padding: '0.4rem' }}>
                              <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: color }} />
                            </td>
                            <td style={{ padding: '0.4rem', fontWeight: 500, color: '#374151' }}>{getFieldLabel(key)}</td>
                            <td style={{ padding: '0.4rem', color: '#1f2937' }}>{value?.content || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* JSON */}
        {hasResult && (
          <div style={cardStyle}>
            <details>
              <summary style={{ padding: '1rem', cursor: 'pointer', fontSize: '0.85rem', color: '#6b7280', backgroundColor: '#f8f9fa' }}>
                生のJSONレスポンス
              </summary>
              <pre style={{ backgroundColor: '#1f2937', color: '#e5e7eb', padding: '1rem', fontSize: '0.7rem', overflow: 'auto', maxHeight: 300, margin: 0 }}>
                {JSON.stringify(result.rawResponse, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
