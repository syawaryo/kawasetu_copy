// app/api/admin/backfill/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 管理用トークンでガード
  const got = req.headers.get("x-admin-token");
  if (got !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { batch } = await req.json().catch(() => ({}));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const res = await fetch(`${supabaseUrl}/functions/v1/backfill-embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${anonKey}`,
      "x-admin-token": process.env.ADMIN_TOKEN,
    },
    body: JSON.stringify({ batch }),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json({ status: res.status, data });
}
