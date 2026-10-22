import type { Level, LevelForecast, Prediction, TaskType } from "./types";

// APIキーなしでも動く、キーワードと長さによるローカル推論。

const RULES: { type: TaskType; words: RegExp; weight: number }[] = [
  { type: "debugging", words: /(バグ|エラー|動かない|落ちる|原因|不具合|直して|修正|例外|debug|error|bug|fix|crash|stack ?trace|traceback|fail)/gi, weight: 3 },
  { type: "multi_file_design", words: /(アプリ|システム|設計|アーキテクチャ|全体|複数|フロントエンド|バックエンド|データベース|認証|デプロイ|api|next\.js|react|フレームワーク|リファクタ|architecture|full.?stack|refactor|repository|monorepo)/gi, weight: 2 },
  { type: "code_generation", words: /(コード|関数|スクリプト|実装|書いて|作って|プログラム|クラス|テスト|python|typescript|javascript|sql|function|script|implement|code)/gi, weight: 2 },
  { type: "writing", words: /(文章|メール|記事|翻訳|要約|ブログ|レポート|書き直|校正|translate|summar|essay|email|article)/gi, weight: 2 },
  { type: "analysis", words: /(調査|比較|分析|リサーチ|まとめ|検討|メリット|research|compare|analy[sz]e|investigate)/gi, weight: 2 },
  { type: "single_question", words: /(とは|教えて|なぜ|どう(やって|すれば)|違い|意味|\?|？|what is|how do|why)/gi, weight: 1 },
];

const BASE: Record<TaskType, { turns: number; tools: number; out: number; think: number; file: number; human: number; builds: number; complexity: number }> = {
  single_question: { turns: 1, tools: 0, out: 800, think: 1500, file: 0, human: 0.5, builds: 0, complexity: 1 },
  writing: { turns: 2, tools: 0, out: 2500, think: 2000, file: 0, human: 2, builds: 0, complexity: 2 },
  analysis: { turns: 3, tools: 6, out: 3500, think: 6000, file: 15000, human: 2, builds: 0, complexity: 3 },
  code_generation: { turns: 4, tools: 8, out: 5000, think: 8000, file: 12000, human: 1.5, builds: 2, complexity: 3 },
  debugging: { turns: 6, tools: 18, out: 4000, think: 15000, file: 40000, human: 2, builds: 4, complexity: 4 },
  multi_file_design: { turns: 10, tools: 35, out: 25000, think: 30000, file: 60000, human: 2.5, builds: 6, complexity: 5 },
};

// レベル別の手戻り率。複雑なタスクほどLowとHighの差が開く。
function levelForecasts(complexity: number): Record<Level, LevelForecast> {
  const c = (complexity - 1) / 4; // 0〜1
  const mk = (rate: number, note: string): LevelForecast => ({
    retryRate: round2(rate),
    expectedAttempts: round2(1 / (1 - Math.min(rate, 0.8))),
    note,
  });
  return {
    low: mk(0.08 + c * 0.55, c > 0.5 ? "考慮漏れでやり直しが増え、結果的に枠を食いやすい" : "簡単なので十分こなせる"),
    medium: mk(0.04 + c * 0.3, "多くのケースでバランスが良い"),
    high: mk(0.02 + c * 0.12, c > 0.5 ? "思考は長いが一発で通る可能性が高い" : "過剰品質。思考トークンが無駄になりがち"),
  };
}

export function heuristicPredict(prompt: string): Prediction {
  const text = prompt.trim();
  const scores = new Map<TaskType, number>();
  for (const r of RULES) {
    const n = text.match(r.words)?.length ?? 0;
    if (n) scores.set(r.type, (scores.get(r.type) ?? 0) + n * r.weight);
  }
  let taskType: TaskType = "single_question";
  let best = 0;
  for (const [t, s] of scores) if (s > best) { best = s; taskType = t; }
  // 短い「〜を教えて」は、コードの話題でも単発の質問
  if (text.length < 120 && /(教えて|とは|方法|違い|なぜ|what is|how (do|to)|why)/i.test(text) && taskType !== "debugging") taskType = "single_question";
  // 長い指示書は単発質問ではない
  if (text.length > 600 && (taskType === "single_question" || taskType === "code_generation")) taskType = "multi_file_design";

  const b = BASE[taskType];
  const lengthFactor = Math.min(3, 1 + text.length / 1500);
  const bullets = (text.match(/^\s*([-*・]|\d+[.)])/gm)?.length ?? 0) + (text.match(/^#+\s/gm)?.length ?? 0);
  const scope = lengthFactor * (1 + Math.min(bullets, 30) * 0.03);
  const complexity = clamp(Math.round(b.complexity + (scope - 1) * 1.2), 1, 5);
  const promptTokens = Math.ceil(text.length / 2.5) + 3000; // システムプロンプト込み
  const turns = Math.max(1, Math.round(b.turns * scope));

  return {
    taskType,
    summary: `${text.slice(0, 40).replace(/\s+/g, " ")}${text.length > 40 ? "…" : ""}`,
    complexity,
    oneShotLikely: complexity <= 2,
    expectedTurns: turns,
    toolCalls: Math.round(b.tools * scope),
    levels: levelForecasts(complexity),
    tokens: {
      // 往復のたびに会話履歴が再送されるので入力はターン数に応じて膨らむ
      input: Math.round(promptTokens * turns + b.out * scope * (turns - 1) * 0.5),
      output: Math.round(b.out * scope),
      thinking: Math.round(b.think * scope),
      fileRead: Math.round(b.file * scope),
    },
    humanMinutesPerTurn: b.human,
    buildTestRuns: Math.round(b.builds * scope),
    risks: [
      ...(taskType === "debugging" ? ["原因の特定に試行錯誤が必要になりやすい"] : []),
      ...(taskType === "multi_file_design" ? ["途中で仕様の解釈ズレが起きると大きな手戻りになる"] : []),
      ...(text.length < 30 ? ["指示が短く、追加の質問・やり取りが発生しやすい"] : []),
    ],
  };
}

export function heuristicLevels(complexity: number) {
  return levelForecasts(complexity);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}
