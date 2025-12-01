import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;

    if (!apiKey || !endpoint) {
      return NextResponse.json(
        { error: "Azure OpenAI credentials not configured" },
        { status: 500 }
      );
    }

    // 支払伝票データをJSON形式で整形
    const paymentSlipData = {
      header: {
        slipNo: body.header.slipNo,
        slipDate: body.header.slipDate,
        payee: body.header.payee,
        payDept: body.header.payDept,
        payTerms: body.header.payTerms,
        payeeNote: body.header.payeeNote,
        taxFirstPeriod: body.header.taxFirstPeriod,
        refSourceSlipNo: body.header.refSourceSlipNo,
      },
      details: body.rows.map((row: Record<string, unknown>, index: number) => ({
        lineNo: index + 1,
        no: row.no,
        accountTitle: row.accountTitle,
        department: row.department,
        exempt: row.exempt,
        partner: row.partner,
        project: row.project,
        jvShareType: row.jvShareType,
        inquiry: row.inquiry,
        expense: row.expense,
        workType: row.workType,
        taxType: row.taxType,
        taxKbn: row.taxKbn,
        assessedAmount: row.assessedAmount,
        taxAmount: row.taxAmount,
        advanceTaxRate: row.advanceTaxRate,
        advanceTaxAmount: row.advanceTaxAmount,
        businessRegNo: row.businessRegNo,
        summary: row.summary,
        jvPayTo: row.jvPayTo,
      })),
      totals: body.totals,
      metadata: {
        savedAt: new Date().toISOString(),
        version: "1.0",
      },
    };

    // Azure OpenAIにリクエストを送信（データの検証・整形用）
    // デプロイメント名は環境に合わせて変更してください
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o";
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";

    const azureEndpoint = `${endpoint.replace(/\/$/, "")}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;

    const azureResponse = await fetch(azureEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `あなたは支払伝票データを処理するアシスタントです。
受け取ったデータを検証し、以下の形式でJSONを返してください：
1. データの整合性チェック（金額の合計が正しいか等）
2. 必須項目の確認
3. 問題があれば警告メッセージを追加

レスポンスは必ず以下のJSON形式で返してください：
{
  "valid": true/false,
  "warnings": ["警告メッセージ配列"],
  "data": {整形されたデータ}
}`,
          },
          {
            role: "user",
            content: `以下の支払伝票データを検証してください：\n${JSON.stringify(paymentSlipData, null, 2)}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    if (!azureResponse.ok) {
      const errorText = await azureResponse.text();
      console.error("Azure OpenAI error:", errorText);

      // Azure OpenAIが失敗しても、データ自体は保存できるようにする
      return NextResponse.json({
        success: true,
        message: "データを保存しました（AI検証はスキップされました）",
        data: paymentSlipData,
        aiValidation: null,
      });
    }

    const azureData = await azureResponse.json();
    const aiResponse = azureData.choices?.[0]?.message?.content;

    let aiValidation = null;
    if (aiResponse) {
      try {
        // JSONブロックを抽出
        const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) ||
                          aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiValidation = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        }
      } catch {
        console.error("Failed to parse AI response as JSON");
        aiValidation = { raw: aiResponse };
      }
    }

    return NextResponse.json({
      success: true,
      message: "支払伝票データを保存しました",
      data: paymentSlipData,
      aiValidation,
    });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
