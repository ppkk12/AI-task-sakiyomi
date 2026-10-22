"use client";

import { useEffect, useState } from "react";
import { PlanPicker } from "@/components/PlanPicker";
import { Results } from "@/components/Results";
import { SettingsDialog } from "@/components/SettingsDialog";
import { SpecPanel } from "@/components/SpecPanel";
import { DEFAULT_OWNED, PLANS } from "@/lib/catalog";
import { runEngine } from "@/lib/engine";
import { PROVIDER_LABEL } from "@/lib/llm";
import { DEFAULT_SPEC } from "@/lib/specs";
import { useStoredState } from "@/lib/storage";
import type { EngineResult, PcSpec, Settings } from "@/lib/types";

const X_URL = "https://x.com/pk6fsfsl";
const X_HANDLE = "@pk6fsfsl";

const DEFAULT_SETTINGS: Settings = {
  engine: "heuristic",
  keys: { gemini: "", openrouter: "", groq: "" },
  models: { gemini: "", openrouter: "", groq: "" },
  usdJpy: 150,
};

const EXAMPLES = [
  { label: "ちょっとした質問", text: "Pythonでリストの重複を削除する方法を教えて" },
  { label: "バグ調査", text: "Next.jsのアプリでログイン後にページが真っ白になるバグを調査して直して。エラーは出ていない。" },
  { label: "アプリを丸ごと作る", text: "Next.js + TypeScript + Tailwind で、家計簿Webアプリを作って。グラフ表示、CSVインポート、ダークモード、認証付き。" },
];

type Theme = "system" | "light" | "dark";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [settings, setSettings] = useStoredState<Settings>("settings", DEFAULT_SETTINGS);
  const [owned, setOwned] = useStoredState<string[]>("ownedPlans", DEFAULT_OWNED);
  const [spec, setSpec] = useStoredState<PcSpec>("pcSpec", DEFAULT_SPEC);
  const [theme, setTheme] = useStoredState<Theme>("theme", "system");
  const [showSettings, setShowSettings] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EngineResult | null>(null);

  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && mq.matches));
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  async function analyze() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    try {
      setResult(await runEngine(prompt, settings));
    } finally {
      setLoading(false);
    }
  }

  const ownedNames = PLANS.filter((p) => owned.includes(p.id)).map((p) => p.name);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-stone-300 dark:border-stone-800">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <span className="font-bold tracking-tight">AIタスク先読み</span>
          <a href={X_URL} target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100">
            <XLogo />
            {X_HANDLE}
          </a>
          <select aria-label="テーマ" className="field w-auto py-1 text-xs" value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
            <option value="system">自動</option>
            <option value="light">ライト</option>
            <option value="dark">ダーク</option>
          </select>
          <button className="btn-ghost py-1 text-xs" onClick={() => setShowSettings(true)}>設定</button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-10">
        <div className="mb-6 max-w-2xl">
          <h1 className="text-2xl leading-snug font-bold tracking-tight sm:text-3xl">
            どのAIに・どの強さで頼むのがいい？
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            頼みたい内容を貼ると、終わるまでのやり取りを見積もって、モデルと推論レベルごとの時間・使用枠・API料金を並べます。
          </p>
        </div>

        <section className="panel space-y-4 p-4 sm:p-5">
          <div>
            <div className="mb-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <label htmlFor="prompt" className="text-sm font-medium">頼みたい内容</label>
              <span className="text-xs text-stone-500">例：</span>
              {EXAMPLES.map((ex) => (
                <button key={ex.label} type="button" className="text-xs text-stone-600 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-600 dark:text-stone-400" onClick={() => setPrompt(ex.text)}>
                  {ex.label}
                </button>
              ))}
            </div>
            <textarea
              id="prompt"
              className="field min-h-40 resize-y leading-relaxed"
              placeholder="AIに送る予定のプロンプトをそのまま貼ってください"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) analyze();
              }}
            />
          </div>

          <div className="border-t border-stone-200 pt-4 dark:border-stone-800">
            <button type="button" className="flex w-full items-baseline gap-3 text-left text-sm" onClick={() => setShowPlans((v) => !v)} aria-expanded={showPlans}>
              <span className="shrink-0">使っているAI</span>
              <span className="min-w-0 truncate text-xs text-stone-500">{ownedNames.length ? ownedNames.join("、") : "未選択"}</span>
              <span className="ml-auto shrink-0 text-xs underline underline-offset-2">{showPlans ? "閉じる" : "変更"}</span>
            </button>
            {showPlans && (
              <div className="mt-4">
                <PlanPicker owned={owned} onChange={setOwned} />
              </div>
            )}
          </div>

          <SpecPanel spec={spec} onChange={setSpec} />

          <div className="flex flex-wrap items-center gap-3 border-t border-stone-200 pt-4 dark:border-stone-800">
            <button className="btn-primary px-5" onClick={analyze} disabled={!prompt.trim() || loading}>
              {loading ? "見積もり中…" : "見積もる"}
            </button>
            <span className="text-xs text-stone-500">
              判定：{PROVIDER_LABEL[settings.engine]} ・ Ctrl+Enter でも実行
            </span>
          </div>
        </section>

        {result && (
          <div className="mt-8">
            <Results result={result} owned={owned} spec={spec} usdJpy={settings.usdJpy} />
          </div>
        )}
      </main>

      <footer className="border-t border-stone-300 dark:border-stone-800">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-5 text-xs text-stone-500">
          <span>
            作った人：
            <a href={X_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-stone-800 underline underline-offset-2 dark:text-stone-200">
              <XLogo />{X_HANDLE}
            </a>
          </span>
          <span>数値はすべて目安です。各社の制限や料金は変わることがあります。</span>
        </div>
      </footer>

      {showSettings && <SettingsDialog settings={settings} onChange={setSettings} onClose={() => setShowSettings(false)} />}
    </div>
  );
}

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
