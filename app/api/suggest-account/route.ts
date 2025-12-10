// app/api/suggest-account/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { summary, top_k = 3 } = await req.json();

    if (!summary || typeof summary !== "string" || summary.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // 1. Modal API で Embedding 取得
    const embedRes = await fetch(
      `${process.env.MODAL_EMBEDDING_URL}/embed`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.EMBED_API_TOKEN}`,
        },
        body: JSON.stringify({ text: summary.trim() }),
      }
    );

    if (!embedRes.ok) {
      const errText = await embedRes.text();
      console.error("Modal API error:", embedRes.status, errText);
      return NextResponse.json({ suggestions: [], error: "Embedding API error" });
    }

    const { embedding } = await embedRes.json();

    // 2. Supabase RPC でベクトル検索
    const { data, error } = await supabase.rpc("match_account_titles_topk", {
      query_embedding: embedding,
      match_count: top_k,
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      return NextResponse.json({ suggestions: [], error: "Database error" });
    }

    // 3. 結果を返す（distanceをsimilarityに変換: 1 - distance）
    return NextResponse.json({
      suggestions: data.map((row: { id: number; account_name: string; description: string; distance: number }) => ({
        id: row.id,
        name: row.account_name,
        description: row.description,
        similarity: Math.round((1 - row.distance) * 100), // コサイン距離→類似度%
      })),
    });
  } catch (error) {
    console.error("suggest-account error:", error);
    return NextResponse.json({ suggestions: [], error: "Internal error" });
  }
}
