import { NextRequest, NextResponse } from "next/server";
import { DocumentAnalysisClient, AzureKeyCredential } from "@azure/ai-form-recognizer";

// クライアントをキャッシュ
let client: DocumentAnalysisClient | null = null;

function getClient(): DocumentAnalysisClient {
  if (!client) {
    const endpoint = process.env.AZURE_DOC_INTELLIGENCE_ENDPOINT;
    const apiKey = process.env.AZURE_DOC_INTELLIGENCE_KEY;

    if (!endpoint || !apiKey) {
      throw new Error("Azure Document Intelligence の環境変数が設定されていません");
    }

    client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));
  }
  return client;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "ファイルが選択されていません" },
        { status: 400 }
      );
    }

    const modelId = process.env.AZURE_DOC_INTELLIGENCE_MODEL_ID || "prebuilt-invoice";

    // ファイルをバイナリに変換
    const arrayBuffer = await file.arrayBuffer();

    // Azure SDK でドキュメント解析
    const docClient = getClient();
    const poller = await docClient.beginAnalyzeDocument(modelId, arrayBuffer);
    const result = await poller.pollUntilDone();

    // ページサイズを取得（インチ単位）
    const pageInfo = result.pages?.[0];
    const pageWidth = pageInfo?.width || 8.5;  // デフォルトA4
    const pageHeight = pageInfo?.height || 11;

    // analyzeResult.documents[0].fields から値を抽出
    const fields = result.documents?.[0]?.fields || {};
    const extractedData: Record<string, {
      content: string;
      x: number[];
      y: number[];
    }> = {};

    for (const [key, value] of Object.entries(fields)) {
      if (value) {
        const polygon = value.boundingRegions?.[0]?.polygon;
        if (!polygon) continue;
        extractedData[key] = {
          content: value.content || "",
          x: polygon.map((p) => p.x),
          y: polygon.map((p) => p.y),
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
      pageSize: { width: pageWidth, height: pageHeight },
      rawResponse: result,
    });
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "不明なエラー" },
      { status: 500 }
    );
  }
}
