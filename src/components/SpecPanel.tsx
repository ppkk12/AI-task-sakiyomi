"use client";

import { useState } from "react";
import {
  applyPreset, buildFactor, CPU_OPTIONS, detectSpec, GPU_OPTIONS, localTps, OS_OPTIONS, RAM_OPTIONS, SPEC_PRESETS,
} from "@/lib/specs";
import type { PcSpec } from "@/lib/types";

export function SpecPanel({ spec, onChange }: { spec: PcSpec; onChange: (s: PcSpec) => void }) {
  const [detected, setDetected] = useState<string[] | null>(null);
  const custom = (patch: Partial<PcSpec>) => onChange({ ...spec, ...patch, preset: "custom" });

  function autoDetect() {
    const { spec: guess, found } = detectSpec();
    onChange({ ...spec, ...Object.fromEntries(Object.entries(guess).filter(([, v]) => v !== undefined)), preset: "custom" });
    setDetected(found);
  }

  return (
    <div className="border-t border-stone-200 pt-4 dark:border-stone-800">
      <label className="flex cursor-pointer items-center gap-2.5 text-sm">
        <input type="checkbox" className="accent-stone-900 dark:accent-stone-100" checked={spec.enabled} onChange={(e) => onChange({ ...spec, enabled: e.target.checked })} />
        <span>PCスペック・ローカル環境も含める</span>
        <span className="text-xs text-stone-400">任意</span>
      </label>

      {spec.enabled && (
        <div className="mt-3 space-y-3 pl-6">
          <div className="flex flex-wrap gap-1.5">
            {SPEC_PRESETS.map((p) => (
              <button key={p.id} type="button" onClick={() => onChange(applyPreset(spec, p.id))} className={`chip ${spec.preset === p.id ? "chip-on" : ""}`}>
                {p.label}
              </button>
            ))}
            <button type="button" onClick={autoDetect} className={`chip border-dashed ${spec.preset === "custom" && detected ? "chip-on" : ""}`}>
              このPCから推定
            </button>
          </div>

          <p className="text-xs text-stone-500">
            {spec.os} ・ {spec.cpu} ・ {spec.gpu} ・ メモリ{spec.ramGb}GB
            <button type="button" className="ml-2 underline underline-offset-2" onClick={() => onChange({ ...spec, detail: !spec.detail })}>
              {spec.detail ? "閉じる" : "細かく選ぶ"}
            </button>
          </p>
          {detected && <p className="text-xs text-stone-400">推定に使った情報：{detected.join(" / ")}。ブラウザから分からない部分は近いものを選んでいます。</p>}

          {spec.detail && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Select label="OS" value={spec.os} onChange={(os) => custom({ os })}>
                {OS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </Select>
              <Select label="CPU" value={spec.cpu} onChange={(cpu) => custom({ cpu })}>
                {groups(CPU_OPTIONS).map(([g, list]) => (
                  <optgroup key={g} label={g}>{list.map((c) => <option key={c.id}>{c.id}</option>)}</optgroup>
                ))}
              </Select>
              <Select label="GPU" value={spec.gpu} onChange={(gpu) => custom({ gpu })}>
                {groups(GPU_OPTIONS).map(([g, list]) => (
                  <optgroup key={g} label={g}>{list.map((c) => <option key={c.id}>{c.id}</option>)}</optgroup>
                ))}
              </Select>
              <Select label="メモリ" value={String(spec.ramGb)} onChange={(v) => custom({ ramGb: Number(v) })}>
                {RAM_OPTIONS.map((r) => <option key={r} value={r}>{r}GB</option>)}
              </Select>
            </div>
          )}

          <p className="text-xs text-stone-500">
            ローカルLLMは 8Bクラスで約<span className="num">{Math.round(localTps(spec))}</span>トークン/秒、ビルド・テストは標準ノートの
            <span className="num">{buildFactor(spec).toFixed(1)}</span>倍の時間として計算します。
          </p>
        </div>
      )}
    </div>
  );
}

function groups<T extends { group: string }>(list: T[]): [string, T[]][] {
  const map = new Map<string, T[]>();
  for (const x of list) map.set(x.group, [...(map.get(x.group) ?? []), x]);
  return [...map];
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
    </label>
  );
}
