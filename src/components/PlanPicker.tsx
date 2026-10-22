"use client";

import { PLAN_GROUP_LABEL, PLAN_GROUPS, PLANS } from "@/lib/catalog";

export function PlanPicker({ owned, onChange }: { owned: string[]; onChange: (update: (prev: string[]) => string[]) => void }) {
  const toggle = (id: string) => onChange((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-xs">
        <button type="button" className="underline-offset-2 hover:underline" onClick={() => onChange(() => PLANS.filter((p) => p.free).map((p) => p.id))}>
          無料プランをまとめて選ぶ
        </button>
        <span className="text-stone-400">/</span>
        <button type="button" className="underline-offset-2 hover:underline" onClick={() => onChange(() => [])}>すべて外す</button>
      </div>
      {PLAN_GROUPS.map((g) => (
        <div key={g} className="grid gap-2 sm:grid-cols-[6.5rem_1fr]">
          <span className="pt-1 text-xs text-stone-500">{PLAN_GROUP_LABEL[g]}</span>
          <div className="flex flex-wrap gap-1.5">
            {PLANS.filter((p) => p.group === g).map((p) => {
              const on = owned.includes(p.id);
              return (
                <button key={p.id} type="button" aria-pressed={on} onClick={() => toggle(p.id)} className={`chip ${on ? "chip-on" : ""}`}>
                  {p.name}
                  {!p.payAsYouGo && !p.free && <span className="ml-1 opacity-50 num">${p.monthlyUsd}</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
