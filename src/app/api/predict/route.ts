import { NextResponse } from "next/server";
import { callProvider, normalizePrediction, DEFAULT_MODELS, type LlmProvider } from "@/lib/llm";

// 環境変数のAPIキーで無料AIを呼ぶサーバー側エンドポイント（Vercel等で利用）。
// キーはレスポンスに含めず、ブラウザには予測結果だけを返す。

const ENV_KEYS: Record<LlmProvider, string | undefined> = {
  gemini: process.env.GEMINI_API_KEY,
  openrouter: process.env.OPENROUTER_API_KEY,
  groq: process.env.GROQ_API_KEY,
};
const ENV_MODELS: Record<LlmProvider, string | undefined> = {
  gemini: process.env.GEMINI_MODEL,
  openrouter: process.env.OPENROUTER_MODEL,
  groq: process.env.GROQ_MODEL,
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const provider = body?.provider as LlmProvider;
  const prompt = typeof body?.prompt === "string" ? body.prompt : "";
  if (!(provider in ENV_KEYS) || !prompt.trim()) {
    return NextResponse.json({ error: "provider と prompt が必要です" }, { status: 400 });
  }
  const key = ENV_KEYS[provider];
  if (!key) {
    return NextResponse.json({ error: "APIキーが未設定です（設定画面で入力するか、環境変数を設定してください）" }, { status: 400 });
  }
  const model = (typeof body.model === "string" && body.model) || ENV_MODELS[provider] || DEFAULT_MODELS[provider];
  try {
    const raw = await callProvider(provider, key, model, prompt);
    return NextResponse.json({ prediction: normalizePrediction(raw, prompt), model });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
