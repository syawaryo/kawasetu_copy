// OCR結果の型定義
export type OcrField = {
  content: string;
  x: number[];
  y: number[];
};

export type OcrResult = {
  [key: string]: OcrField;
};

export type OcrResponse = {
  success: boolean;
  data?: OcrResult;
  pageSize?: { width: number; height: number };
  error?: string;
  rawResponse?: unknown;
};

// OCR APIを呼び出す関数
export async function analyzeDocument(file: File): Promise<OcrResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/ocr", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    return {
      success: false,
      error: `APIエラー: ${res.status} ${res.statusText}`,
    };
  }

  return res.json();
}
