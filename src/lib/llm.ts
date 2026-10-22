import { heuristicLevels, heuristicPredict } from "./heuristic";
import { LEVELS, TASK_TYPE_LABEL, type EngineId, type Prediction, type TaskType } from "./types";

// 無料AI APIに「このタスクが完了までにどう展開するか」をJSONで予測させる。
// ブラウザ（localStorageのキー）とサーバー（環境変数のキー）の両方から呼べるよう fetch のみで実装。

export type LlmProvider = Exclude<EngineId, "heuristic">;

export const PROVIDER_LABEL: Record<EngineId, string> = {
  heuristic: "簡易判定（キー不要）",
  gemini: "Gemini API 無料枠",
  openrouter: "OpenRouter 無料ルーター",
  groq: "Groq API 無料枠",
};

export const DEFAULT_MODELS: Record<LlmProvider, string> = {
  gemini: "gemini-2.5-flash",
  openrouter: "openrouter/free",
  groq: "llama-3.3-70b-versatile",
};

const SYSTEM_PROMPT = `あなたはAIコーディングエージェント（Claude Code、Codex、Cursor等）の作業量を見積もる専門家です。
ユーザーがAIに渡そうとしている「作業指示プロンプト」を読み、そのタスクが完了するまでにどう展開するかを予測してください。
出力は次のスキーマのJSONオブジェクトのみ。説明文やコードブロックは不要です。

{
  "taskType": ${Object.keys(TASK_TYPE_LABEL).map((k) => `"${k}"`).join(" | ")},
  "summary": "タスクの要約（日本語40字以内）",
  "complexity": 1〜5の整数,
  "oneShotLikely": 一発で終わりそうなら true,
  "expectedTurns": Mediumレベルのモデルで一発完了した場合のAIとの往復ターン数,
  "toolCalls": ファイル読み書き・コマンド実行などのツール実行回数,
  "levels": {
    "low":    { "retryRate": 0〜1, "expectedAttempts": 1以上の数値, "note": "日本語の短い説明" },
    "medium": { "retryRate": 0〜1, "expectedAttempts": 1以上の数値, "note": "..." },
    "high":   { "retryRate": 0〜1, "expectedAttempts": 1以上の数値, "note": "..." }
  },
  "tokens": {
    "input": 往復ごとに再送される会話履歴を含む累計入力トークン,
    "output": 累計出力トークン（思考を除く）,
    "thinking": Mediumでの累計思考トークン,
    "fileRead": ファイル読み込みで消費する累計トークン
  },
  "humanMinutesPerTurn": 1ターンごとに人間が確認・追加指示に使う分数,
  "buildTestRuns": ローカルでのビルド・テスト実行回数,
  "risks": ["手戻りの原因になりそうな点（日本語、最大3つ）"]
}

目安：
- 単発の質問なら turns=1, toolCalls=0, input数千トークン程度。
- 複数ファイルにまたがるアプリ実装なら turns=10〜30, toolCalls=30〜100, input数十万トークンにもなる。
- 低い推論レベル(Low)は簡単なタスクでは十分だが、複雑なタスクでは考慮漏れでやり直し(expectedAttempts 2〜3)が増え、逆に枠を食うことがある。Highは思考トークンが増える代わりに一発で通りやすい。`;

export function buildUserPrompt(prompt: string) {
  return `次の作業指示プロンプトを分析してください。\n\n----- ここから -----\n${prompt.slice(0, 20000)}\n----- ここまで -----`;
}

export async function callProvider(provider: LlmProvider, apiKey: string, model: string, prompt: string): Promise<string> {
  const user = buildUserPrompt(prompt);
  if (provider === "gemini") {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      }),
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  }

  const url = provider === "openrouter" ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.groq.com/openai/v1/chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(provider === "openrouter" ? { "X-Title": "AI Task Forecaster" } : {}),
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`${PROVIDER_LABEL[provider]} ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

/** AIの出力をパースし、欠損・異常値をヒューリスティック値で補う */
export function normalizePrediction(raw: string, prompt: string): Prediction {
  const fallback = heuristicPredict(prompt);
  const json = extractJson(raw);
  if (!json || typeof json !== "object") throw new Error("AIの応答をJSONとして読めませんでした");
  const o = json as Record<string, any>;

  const taskType: TaskType = o.taskType in TASK_TYPE_LABEL ? o.taskType : fallback.taskType;
  const complexity = Math.round(num(o.complexity, fallback.complexity, 1, 5));
  const defaultsByLevel = heuristicLevels(complexity);
  const levels = Object.fromEntries(
    LEVELS.map((lv) => {
      const src = o.levels?.[lv] ?? {};
      const d = defaultsByLevel[lv];
      return [lv, {
        retryRate: num(src.retryRate, d.retryRate, 0, 0.95),
        expectedAttempts: num(src.expectedAttempts, d.expectedAttempts, 1, 6),
        note: typeof src.note === "string" && src.note ? src.note.slice(0, 80) : d.note,
      }];
    }),
  ) as Prediction["levels"];

  const t = o.tokens ?? {};
  return {
    taskType,
    summary: typeof o.summary === "string" && o.summary ? o.summary.slice(0, 80) : fallback.summary,
    complexity,
    oneShotLikely: typeof o.oneShotLikely === "boolean" ? o.oneShotLikely : complexity <= 2,
    expectedTurns: Math.round(num(o.expectedTurns, fallback.expectedTurns, 1, 200)),
    toolCalls: Math.round(num(o.toolCalls, fallback.toolCalls, 0, 1000)),
    levels,
    tokens: {
      input: Math.round(num(t.input, fallback.tokens.input, 100, 2e7)),
      output: Math.round(num(t.output, fallback.tokens.output, 50, 2e6)),
      thinking: Math.round(num(t.thinking, fallback.tokens.thinking, 0, 5e6)),
      fileRead: Math.round(num(t.fileRead, fallback.tokens.fileRead, 0, 1e7)),
    },
    humanMinutesPerTurn: num(o.humanMinutesPerTurn, fallback.humanMinutesPerTurn, 0, 30),
    buildTestRuns: Math.round(num(o.buildTestRuns, fallback.buildTestRuns, 0, 200)),
    risks: Array.isArray(o.risks) ? o.risks.filter((r: unknown) => typeof r === "string").slice(0, 3) : fallback.risks,
  };
}

function extractJson(raw: string): unknown {
  const s = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    return JSON.parse(s);
  } catch {
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(s.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function num(v: unknown, d: number, lo: number, hi: number) {
  const n = typeof v === "string" ? Number(v.replace(/[,_]/g, "")) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d;
}
