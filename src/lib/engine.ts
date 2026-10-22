import { heuristicPredict } from "./heuristic";
import { callProvider, normalizePrediction, DEFAULT_MODELS, type LlmProvider } from "./llm";
import type { EngineResult, Settings } from "./types";

export const IS_STATIC = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

/**
 * 判定エンジンの実行順：
 *  1. ブラウザに保存されたキーがあれば、ブラウザから直接無料APIを呼ぶ（キーはサーバーに送らない）
 *  2. なければサーバーの /api/predict を呼ぶ（環境変数のキーを使用。静的書き出し版では無し）
 *  3. どちらも使えない・失敗した場合はローカルのヒューリスティック推論にフォールバック
 */
export async function runEngine(prompt: string, settings: Settings): Promise<EngineResult> {
  if (settings.engine === "heuristic") {
    return { prediction: heuristicPredict(prompt), engine: "heuristic" };
  }
  const provider: LlmProvider = settings.engine;
  const model = settings.models[provider] || DEFAULT_MODELS[provider];
  const key = settings.keys[provider].trim();

  try {
    if (key) {
      const raw = await callProvider(provider, key, model, prompt);
      return { prediction: normalizePrediction(raw, prompt), engine: provider, engineModel: model };
    }
    if (IS_STATIC) throw new Error("APIキーが未設定です（設定画面で入力してください）");

    const res = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, model, prompt }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error ?? `サーバーエラー ${res.status}`);
    return { prediction: data.prediction, engine: provider, engineModel: data.model ?? model };
  } catch (e) {
    return {
      prediction: heuristicPredict(prompt),
      engine: "heuristic",
      fallbackReason: e instanceof Error ? e.message : String(e),
    };
  }
}
