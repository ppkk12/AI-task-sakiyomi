// AIモデル・プランのカタログ。
// 料金・速度・枠の大きさは公開情報やコミュニティ計測をもとにした「目安」です。
// 各社の改定に合わせてこのファイルを書き換えれば、計算にそのまま反映されます。

export interface ModelInfo {
  id: string;
  name: string;
  vendor: string;
  /** API料金（USD / 100万トークン） */
  priceIn: number;
  priceOut: number;
  /** 出力速度（トークン/秒）。ローカルモデルはPCスペックから計算 */
  tps: number;
  /** 0〜1。高いほど手戻りが少ない */
  quality: number;
  /** 思考トークンの出やすさ。常に考えるタイプの推論モデルは大きめ */
  thinkFactor: number;
  /** Low / Medium / High を選べるか。false なら「標準」1種類のみ */
  reasoning: boolean;
  /** ローカル実行に必要なメモリ（GB）。指定があればローカルモデル */
  localMemGb?: number;
  /** ローカル実行時の速度係数（8Bクラス = 1） */
  localSpeed?: number;
}

const m = (
  id: string, name: string, vendor: string, priceIn: number, priceOut: number,
  tps: number, quality: number, thinkFactor: number, reasoning: boolean,
): ModelInfo => ({ id, name, vendor, priceIn, priceOut, tps, quality, thinkFactor, reasoning });

export const MODELS: ModelInfo[] = [
  m("claude-opus", "Claude Opus", "Anthropic", 5, 25, 55, 0.96, 1.1, true),
  m("claude-sonnet", "Claude Sonnet", "Anthropic", 3, 15, 75, 0.93, 1, true),
  m("claude-haiku", "Claude Haiku", "Anthropic", 1, 5, 150, 0.8, 0.8, true),
  m("gpt-5", "GPT-5", "OpenAI", 1.25, 10, 65, 0.93, 1.3, true),
  m("gpt-5-codex", "GPT-5 Codex", "OpenAI", 1.25, 10, 70, 0.94, 1.2, true),
  m("gpt-5-mini", "GPT-5 mini", "OpenAI", 0.25, 2, 130, 0.8, 1.1, true),
  m("gpt-5-nano", "GPT-5 nano", "OpenAI", 0.05, 0.4, 180, 0.64, 1, true),
  m("gemini-pro", "Gemini Pro", "Google", 1.25, 10, 85, 0.91, 1.2, true),
  m("gemini-flash", "Gemini Flash", "Google", 0.3, 2.5, 200, 0.79, 0.9, true),
  m("gemini-flash-lite", "Gemini Flash-Lite", "Google", 0.1, 0.4, 300, 0.66, 0.6, true),
  m("grok-4", "Grok 4", "xAI", 3, 15, 50, 0.9, 1.8, false),
  m("grok-fast", "Grok 4 Fast", "xAI", 0.2, 0.5, 180, 0.8, 0.8, false),
  m("grok-code-fast", "Grok Code Fast", "xAI", 0.2, 1.5, 190, 0.82, 0.7, false),
  m("deepseek-chat", "DeepSeek V3（Chat）", "DeepSeek", 0.28, 0.42, 40, 0.82, 0.3, false),
  m("deepseek-reasoner", "DeepSeek R1（Reasoner）", "DeepSeek", 0.28, 0.42, 35, 0.85, 1.6, false),
  m("qwen3-coder", "Qwen3 Coder", "Alibaba", 0.45, 1.8, 80, 0.84, 0.3, false),
  m("qwen3-max", "Qwen3 Max", "Alibaba", 1.2, 6, 45, 0.86, 0.5, false),
  m("kimi-k2", "Kimi K2", "Moonshot", 0.6, 2.5, 50, 0.85, 0.3, false),
  m("glm-4.6", "GLM-4.6", "Zhipu（Z.ai）", 0.6, 2.2, 60, 0.85, 0.8, false),
  m("mistral-medium", "Mistral Medium", "Mistral", 0.4, 2, 90, 0.78, 0.3, false),
  m("codestral", "Codestral", "Mistral", 0.3, 0.9, 120, 0.74, 0.2, false),
  m("gpt-oss-120b", "gpt-oss-120b（高速推論）", "OpenAI（オープン）", 0.15, 0.6, 450, 0.8, 0.9, true),
  m("llama-4", "Llama 4 Maverick", "Meta", 0.2, 0.6, 350, 0.7, 0.2, false),
  { ...m("local-8b", "ローカルLLM 8Bクラス（Qwen3 8B等）", "ローカル", 0, 0, 0, 0.6, 0.6, false), localMemGb: 6, localSpeed: 1 },
  { ...m("local-20b", "ローカル gpt-oss-20b", "ローカル", 0, 0, 0, 0.72, 0.9, true), localMemGb: 14, localSpeed: 0.85 },
  { ...m("local-32b", "ローカルLLM 30Bクラス（Qwen3 Coder 30B等）", "ローカル", 0, 0, 0, 0.76, 0.5, false), localMemGb: 20, localSpeed: 0.7 },
];

export type WindowKey = "fiveHour" | "weekly" | "monthly";
export const WINDOW_LABEL: Record<WindowKey, string> = { fiveHour: "5時間枠", weekly: "1週間枠", monthly: "1ヶ月枠" };

export interface PlanInfo {
  id: string;
  name: string;
  group: string;
  monthlyUsd: number;
  models: string[];
  /**
   * 各制限枠の大きさを「API料金換算のUSD」で表したもの。
   * 例：5時間枠 = $6 → API料金換算で$6ぶん使うと5時間枠を使い切る目安。
   * 1日単位の制限は 1週間枠 = 7日分 として換算。従量課金プランは枠なし。
   */
  windows: Partial<Record<WindowKey, number>>;
  payAsYouGo?: boolean;
  free?: boolean;
}

const CLAUDE = ["claude-opus", "claude-sonnet", "claude-haiku"];
const OPENAI = ["gpt-5", "gpt-5-codex", "gpt-5-mini", "gpt-5-nano"];
const GEMINI = ["gemini-pro", "gemini-flash", "gemini-flash-lite"];
const GROK = ["grok-4", "grok-fast", "grok-code-fast"];
const DEEPSEEK = ["deepseek-chat", "deepseek-reasoner"];
const QWEN = ["qwen3-coder", "qwen3-max"];
const EDITOR = ["claude-opus", "claude-sonnet", "claude-haiku", "gpt-5", "gpt-5-codex", "gpt-5-mini", "gemini-pro", "gemini-flash", "grok-code-fast"];
const ALL_CLOUD = MODELS.filter((x) => !x.localMemGb).map((x) => x.id);

export const PLANS: PlanInfo[] = [
  // Claude
  { id: "claude_free", name: "Claude 無料", group: "Claude", monthlyUsd: 0, models: ["claude-sonnet", "claude-haiku"], windows: { fiveHour: 0.6, weekly: 4 }, free: true },
  { id: "claude_pro", name: "Claude Pro", group: "Claude", monthlyUsd: 20, models: CLAUDE, windows: { fiveHour: 6, weekly: 45 } },
  { id: "claude_max5", name: "Claude Max 5x", group: "Claude", monthlyUsd: 100, models: CLAUDE, windows: { fiveHour: 30, weekly: 225 } },
  { id: "claude_max20", name: "Claude Max 20x", group: "Claude", monthlyUsd: 200, models: CLAUDE, windows: { fiveHour: 120, weekly: 900 } },
  // ChatGPT
  { id: "chatgpt_free", name: "ChatGPT 無料", group: "ChatGPT", monthlyUsd: 0, models: ["gpt-5", "gpt-5-mini"], windows: { fiveHour: 0.4, weekly: 3 }, free: true },
  { id: "chatgpt_plus", name: "ChatGPT Plus", group: "ChatGPT", monthlyUsd: 20, models: OPENAI, windows: { fiveHour: 5, weekly: 35 } },
  { id: "chatgpt_business", name: "ChatGPT Business", group: "ChatGPT", monthlyUsd: 30, models: OPENAI, windows: { fiveHour: 6, weekly: 45 } },
  { id: "chatgpt_pro", name: "ChatGPT Pro", group: "ChatGPT", monthlyUsd: 200, models: OPENAI, windows: { fiveHour: 60, weekly: 420 } },
  // Gemini
  { id: "gemini_free", name: "Gemini 無料（アプリ / AI Studio / CLI）", group: "Gemini", monthlyUsd: 0, models: GEMINI, windows: { weekly: 6, monthly: 24 }, free: true },
  { id: "google_ai_pro", name: "Google AI Pro", group: "Gemini", monthlyUsd: 20, models: GEMINI, windows: { weekly: 50, monthly: 200 } },
  { id: "google_ai_ultra", name: "Google AI Ultra", group: "Gemini", monthlyUsd: 250, models: GEMINI, windows: { weekly: 300, monthly: 1200 } },
  // エディタ・コーディングツール
  { id: "copilot_free", name: "GitHub Copilot Free", group: "エディタ", monthlyUsd: 0, models: ["claude-sonnet", "claude-haiku", "gpt-5-mini", "gemini-flash"], windows: { monthly: 2 }, free: true },
  { id: "copilot_pro", name: "GitHub Copilot Pro", group: "エディタ", monthlyUsd: 10, models: EDITOR, windows: { monthly: 12 } },
  { id: "copilot_proplus", name: "GitHub Copilot Pro+", group: "エディタ", monthlyUsd: 39, models: EDITOR, windows: { monthly: 60 } },
  { id: "cursor_hobby", name: "Cursor Hobby", group: "エディタ", monthlyUsd: 0, models: EDITOR, windows: { monthly: 1.5 }, free: true },
  { id: "cursor_pro", name: "Cursor Pro", group: "エディタ", monthlyUsd: 20, models: EDITOR, windows: { monthly: 20 } },
  { id: "cursor_proplus", name: "Cursor Pro+", group: "エディタ", monthlyUsd: 60, models: EDITOR, windows: { monthly: 70 } },
  { id: "cursor_ultra", name: "Cursor Ultra", group: "エディタ", monthlyUsd: 200, models: EDITOR, windows: { monthly: 400 } },
  { id: "windsurf_free", name: "Windsurf Free", group: "エディタ", monthlyUsd: 0, models: EDITOR, windows: { monthly: 1 }, free: true },
  { id: "windsurf_pro", name: "Windsurf Pro", group: "エディタ", monthlyUsd: 15, models: EDITOR, windows: { monthly: 15 } },
  // その他のチャット
  { id: "grok_free", name: "Grok 無料", group: "その他", monthlyUsd: 0, models: ["grok-fast"], windows: { weekly: 3 }, free: true },
  { id: "supergrok", name: "SuperGrok", group: "その他", monthlyUsd: 30, models: GROK, windows: { fiveHour: 10, weekly: 60 } },
  { id: "deepseek_free", name: "DeepSeek 無料（Web）", group: "その他", monthlyUsd: 0, models: DEEPSEEK, windows: { weekly: 10 }, free: true },
  { id: "qwen_free", name: "Qwen Chat / Qwen Code 無料", group: "その他", monthlyUsd: 0, models: QWEN, windows: { weekly: 20 }, free: true },
  { id: "kimi_free", name: "Kimi 無料", group: "その他", monthlyUsd: 0, models: ["kimi-k2"], windows: { weekly: 5 }, free: true },
  { id: "glm_coding_lite", name: "GLM Coding Plan Lite", group: "その他", monthlyUsd: 3, models: ["glm-4.6"], windows: { fiveHour: 3, weekly: 25 } },
  { id: "glm_coding_pro", name: "GLM Coding Plan Pro", group: "その他", monthlyUsd: 15, models: ["glm-4.6"], windows: { fiveHour: 15, weekly: 120 } },
  { id: "mistral_free", name: "Le Chat 無料（Mistral）", group: "その他", monthlyUsd: 0, models: ["mistral-medium"], windows: { weekly: 2 }, free: true },
  { id: "mistral_pro", name: "Le Chat Pro（Mistral）", group: "その他", monthlyUsd: 15, models: ["mistral-medium", "codestral"], windows: { weekly: 20, monthly: 80 } },
  { id: "perplexity_pro", name: "Perplexity Pro", group: "その他", monthlyUsd: 20, models: ["claude-sonnet", "gpt-5", "gemini-pro", "grok-4"], windows: { weekly: 25, monthly: 100 } },
  // API従量
  { id: "anthropic_api", name: "Anthropic API", group: "API", monthlyUsd: 0, models: CLAUDE, windows: {}, payAsYouGo: true },
  { id: "openai_api", name: "OpenAI API", group: "API", monthlyUsd: 0, models: OPENAI, windows: {}, payAsYouGo: true },
  { id: "google_api", name: "Gemini API", group: "API", monthlyUsd: 0, models: GEMINI, windows: {}, payAsYouGo: true },
  { id: "xai_api", name: "xAI API", group: "API", monthlyUsd: 0, models: GROK, windows: {}, payAsYouGo: true },
  { id: "deepseek_api", name: "DeepSeek API", group: "API", monthlyUsd: 0, models: DEEPSEEK, windows: {}, payAsYouGo: true },
  { id: "alibaba_api", name: "Alibaba Cloud（Qwen）API", group: "API", monthlyUsd: 0, models: QWEN, windows: {}, payAsYouGo: true },
  { id: "moonshot_api", name: "Moonshot（Kimi）API", group: "API", monthlyUsd: 0, models: ["kimi-k2"], windows: {}, payAsYouGo: true },
  { id: "zai_api", name: "Z.ai（GLM）API", group: "API", monthlyUsd: 0, models: ["glm-4.6"], windows: {}, payAsYouGo: true },
  { id: "mistral_api", name: "Mistral API", group: "API", monthlyUsd: 0, models: ["mistral-medium", "codestral"], windows: {}, payAsYouGo: true },
  { id: "groq_api", name: "Groq API", group: "API", monthlyUsd: 0, models: ["gpt-oss-120b", "llama-4", "kimi-k2", "qwen3-coder"], windows: {}, payAsYouGo: true },
  { id: "openrouter_api", name: "OpenRouter（ほぼ全モデル）", group: "API", monthlyUsd: 0, models: ALL_CLOUD, windows: {}, payAsYouGo: true },
];

export const PLAN_GROUPS = ["Claude", "ChatGPT", "Gemini", "エディタ", "その他", "API"];
export const PLAN_GROUP_LABEL: Record<string, string> = {
  Claude: "Claude",
  ChatGPT: "ChatGPT",
  Gemini: "Gemini",
  エディタ: "エディタ",
  その他: "その他",
  API: "API（従量）",
};

export const LOCAL_PLAN: PlanInfo = { id: "local", name: "自分のPCで実行", group: "Local", monthlyUsd: 0, models: [], windows: {} };

export const DEFAULT_OWNED = ["claude_free", "chatgpt_free", "gemini_free"];
