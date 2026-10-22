"use client";

import { DEFAULT_MODELS, PROVIDER_LABEL, type LlmProvider } from "@/lib/llm";
import { IS_STATIC } from "@/lib/engine";
import type { EngineId, Settings } from "@/lib/types";

const KEY_LINKS: Record<LlmProvider, string> = {
  gemini: "https://aistudio.google.com/apikey",
  openrouter: "https://openrouter.ai/keys",
  groq: "https://console.groq.com/keys",
};

export function SettingsDialog({ settings, onChange, onClose }: { settings: Settings; onChange: (s: Settings) => void; onClose: () => void }) {
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });
  const provider = settings.engine === "heuristic" ? null : settings.engine;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/50 p-4 sm:items-center" onClick={onClose}>
      <div className="panel p-5 max-h-[90vh] w-full max-w-lg overflow-y-auto" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="設定">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">設定</h2>
          <button className="btn-ghost px-3 py-1" onClick={onClose}>閉じる</button>
        </div>

        <span className="label">判定エンジン（プロンプトの中身を解析するAI）</span>
        <div className="grid gap-2">
          {(Object.keys(PROVIDER_LABEL) as EngineId[]).map((id) => (
            <label key={id} className="flex cursor-pointer items-center gap-2 rounded border border-stone-200 px-3 py-2 text-sm dark:border-stone-800">
              <input type="radio" name="engine" checked={settings.engine === id} onChange={() => set({ engine: id })} />
              <span>{PROVIDER_LABEL[id]}</span>
              {id !== "heuristic" && settings.keys[id].trim() && <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-400">キー保存済み</span>}
            </label>
          ))}
        </div>

        {provider && (
          <div className="mt-4 space-y-3 rounded bg-stone-100 p-4 dark:bg-stone-800/50">
            <div>
              <label className="label" htmlFor="apikey">
                APIキー（<a className="underline" href={KEY_LINKS[provider]} target="_blank" rel="noreferrer">無料で取得</a>）
              </label>
              <input
                id="apikey"
                type="password"
                autoComplete="off"
                className="field font-mono"
                placeholder={IS_STATIC ? "必須" : "空欄ならサーバーの環境変数を使用"}
                value={settings.keys[provider]}
                onChange={(e) => set({ keys: { ...settings.keys, [provider]: e.target.value } })}
              />
              <p className="mt-1 text-xs text-stone-500">キーはこのブラウザの localStorage にのみ保存され、各社APIへ直接送信されます。</p>
            </div>
            <div>
              <label className="label" htmlFor="model">モデル</label>
              <input
                id="model"
                className="field font-mono"
                placeholder={DEFAULT_MODELS[provider]}
                value={settings.models[provider]}
                onChange={(e) => set({ models: { ...settings.models, [provider]: e.target.value } })}
              />
            </div>
          </div>
        )}
        <p className="mt-2 text-xs text-stone-500">キーが無い・API呼び出しに失敗した場合は、自動で簡易判定に切り替わります。</p>

        <div className="mt-5">
          <label className="label" htmlFor="rate">為替レート（1 USD = ? 円）</label>
          <input id="rate" type="number" min={50} max={300} className="field w-32" value={settings.usdJpy} onChange={(e) => set({ usdJpy: Number(e.target.value) || 150 })} />
        </div>
      </div>
    </div>
  );
}
