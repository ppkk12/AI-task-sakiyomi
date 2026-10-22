export function fmtTokens(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}k`;
  return `${Math.round(n)}`;
}

export function fmtMinutes(m: number): string {
  if (m < 1) return `${Math.max(1, Math.round(m * 60))}秒`;
  if (m < 60) return `${Math.round(m)}分`;
  const h = Math.floor(m / 60);
  const rest = Math.round(m % 60);
  return rest ? `${h}時間${rest}分` : `${h}時間`;
}

export function fmtPct(p: number | undefined): string {
  if (p === undefined) return "—";
  if (p < 0.1) return "<0.1%";
  if (p < 10) return `${p.toFixed(1)}%`;
  return `${Math.round(p)}%`;
}

export function fmtUsd(usd: number): string {
  if (usd === 0) return "$0";
  if (usd < 0.01) return "<$0.01";
  return `$${usd < 10 ? usd.toFixed(2) : usd.toFixed(1)}`;
}

export function fmtJpy(usd: number, rate: number): string {
  const y = usd * rate;
  if (y === 0) return "¥0";
  if (y < 1) return "<¥1";
  return `¥${Math.round(y).toLocaleString("ja-JP")}`;
}

/** 0.48 → 「約半分」, 0.3 → 「約3割」 */
export function fmtRatio(r: number): string {
  if (r <= 0.15) return "1割程度";
  if (r >= 0.45 && r <= 0.55) return "約半分";
  return `約${Math.round(r * 10)}割`;
}

export function pctTone(p: number | undefined): string {
  if (p === undefined) return "text-stone-400";
  if (p > 100) return "text-red-600 dark:text-red-400 font-semibold";
  if (p > 50) return "text-amber-600 dark:text-amber-400";
  return "text-emerald-700 dark:text-emerald-400";
}
