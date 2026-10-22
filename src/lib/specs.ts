import type { PcSpec } from "./types";

// CPU：ビルド・テスト1回あたりの時間係数（1.0 = 最近の標準ノート）
export interface CpuOption { id: string; group: string; factor: number }
// GPU：8Bクラスのローカルモデル推論速度（トークン/秒）と専用VRAM（GB、0 = メインメモリ共有）
export interface GpuOption { id: string; group: string; tps: number; vram: number; match?: RegExp }

export const CPU_OPTIONS: CpuOption[] = [
  { id: "Celeron / Pentium / N100", group: "Intel", factor: 2.2 },
  { id: "Core i3（第10世代まで）", group: "Intel", factor: 1.7 },
  { id: "Core i5（第10世代まで）", group: "Intel", factor: 1.35 },
  { id: "Core i7（第10世代まで）", group: "Intel", factor: 1.15 },
  { id: "Core i3（第11世代以降）", group: "Intel", factor: 1.3 },
  { id: "Core i5（第11世代以降）", group: "Intel", factor: 1.0 },
  { id: "Core i7（第11世代以降）", group: "Intel", factor: 0.8 },
  { id: "Core i9（第12世代以降）", group: "Intel", factor: 0.6 },
  { id: "Core Ultra 5", group: "Intel", factor: 0.9 },
  { id: "Core Ultra 7", group: "Intel", factor: 0.75 },
  { id: "Core Ultra 9", group: "Intel", factor: 0.6 },
  { id: "Ryzen 3", group: "AMD", factor: 1.3 },
  { id: "Ryzen 5（5000番台まで）", group: "AMD", factor: 1.0 },
  { id: "Ryzen 5（7000番台以降）", group: "AMD", factor: 0.8 },
  { id: "Ryzen 7（5000番台まで）", group: "AMD", factor: 0.85 },
  { id: "Ryzen 7（7000番台以降）", group: "AMD", factor: 0.65 },
  { id: "Ryzen 9", group: "AMD", factor: 0.5 },
  { id: "Ryzen AI 7 / AI 9", group: "AMD", factor: 0.65 },
  { id: "Threadripper", group: "AMD", factor: 0.4 },
  { id: "Intel Mac", group: "Apple", factor: 1.3 },
  { id: "Apple M1", group: "Apple", factor: 0.8 },
  { id: "Apple M1 Pro / Max", group: "Apple", factor: 0.6 },
  { id: "Apple M2", group: "Apple", factor: 0.7 },
  { id: "Apple M2 Pro / Max", group: "Apple", factor: 0.55 },
  { id: "Apple M3", group: "Apple", factor: 0.6 },
  { id: "Apple M3 Pro / Max", group: "Apple", factor: 0.48 },
  { id: "Apple M4", group: "Apple", factor: 0.5 },
  { id: "Apple M4 Pro / Max", group: "Apple", factor: 0.4 },
  { id: "Apple M5", group: "Apple", factor: 0.45 },
  { id: "Snapdragon X Plus", group: "Qualcomm", factor: 0.9 },
  { id: "Snapdragon X Elite", group: "Qualcomm", factor: 0.75 },
];

export const GPU_OPTIONS: GpuOption[] = [
  { id: "わからない / GPUなし", group: "その他", tps: 6, vram: 0 },
  { id: "Intel UHD（内蔵）", group: "内蔵GPU", tps: 5, vram: 0, match: /uhd|hd graphics/i },
  { id: "Intel Iris Xe（内蔵）", group: "内蔵GPU", tps: 7, vram: 0, match: /iris/i },
  { id: "Intel Arc（Core Ultra内蔵）", group: "内蔵GPU", tps: 12, vram: 0, match: /arc\(tm\) graphics|intel.*arc graphics/i },
  { id: "AMD Radeon（Ryzen内蔵）", group: "内蔵GPU", tps: 8, vram: 0, match: /radeon\(tm\) graphics|radeon graphics|vega/i },
  { id: "Radeon 780M / 890M（内蔵）", group: "内蔵GPU", tps: 14, vram: 0, match: /780m|880m|890m/i },
  { id: "Snapdragon X（Adreno）", group: "内蔵GPU", tps: 10, vram: 0, match: /adreno/i },
  { id: "GTX 1650", group: "NVIDIA", tps: 18, vram: 4, match: /gtx 1650/i },
  { id: "GTX 1660", group: "NVIDIA", tps: 25, vram: 6, match: /gtx 1660/i },
  { id: "RTX 2060 / 2070", group: "NVIDIA", tps: 35, vram: 8, match: /rtx 20[67]0/i },
  { id: "RTX 3050", group: "NVIDIA", tps: 30, vram: 8, match: /rtx 3050/i },
  { id: "RTX 3060", group: "NVIDIA", tps: 45, vram: 12, match: /rtx 3060/i },
  { id: "RTX 3070", group: "NVIDIA", tps: 55, vram: 8, match: /rtx 3070/i },
  { id: "RTX 3080", group: "NVIDIA", tps: 70, vram: 10, match: /rtx 3080/i },
  { id: "RTX 3090", group: "NVIDIA", tps: 90, vram: 24, match: /rtx 3090/i },
  { id: "RTX 4050 / 4060（ノート）", group: "NVIDIA", tps: 40, vram: 8, match: /rtx 40[56]0 laptop/i },
  { id: "RTX 4070 〜 4090（ノート）", group: "NVIDIA", tps: 55, vram: 12, match: /rtx 40[789]0 laptop/i },
  { id: "RTX 4060", group: "NVIDIA", tps: 50, vram: 8, match: /rtx 4060(?! ti)/i },
  { id: "RTX 4060 Ti", group: "NVIDIA", tps: 55, vram: 16, match: /rtx 4060 ti/i },
  { id: "RTX 4070 / 4070 SUPER", group: "NVIDIA", tps: 65, vram: 12, match: /rtx 4070(?! ti)/i },
  { id: "RTX 4070 Ti", group: "NVIDIA", tps: 75, vram: 16, match: /rtx 4070 ti/i },
  { id: "RTX 4080", group: "NVIDIA", tps: 90, vram: 16, match: /rtx 4080/i },
  { id: "RTX 4090", group: "NVIDIA", tps: 120, vram: 24, match: /rtx 4090/i },
  { id: "RTX 5050 / 5060（ノート）", group: "NVIDIA", tps: 50, vram: 8, match: /rtx 50[56]0 laptop/i },
  { id: "RTX 5070 〜 5090（ノート）", group: "NVIDIA", tps: 70, vram: 12, match: /rtx 50[789]0 laptop/i },
  { id: "RTX 5060 / 5060 Ti", group: "NVIDIA", tps: 60, vram: 16, match: /rtx 5060/i },
  { id: "RTX 5070", group: "NVIDIA", tps: 80, vram: 12, match: /rtx 5070(?! ti)/i },
  { id: "RTX 5070 Ti", group: "NVIDIA", tps: 95, vram: 16, match: /rtx 5070 ti/i },
  { id: "RTX 5080", group: "NVIDIA", tps: 110, vram: 16, match: /rtx 5080/i },
  { id: "RTX 5090", group: "NVIDIA", tps: 160, vram: 32, match: /rtx 5090/i },
  { id: "Radeon RX 6600 / 6650", group: "AMD", tps: 35, vram: 8, match: /rx 66[05]0/i },
  { id: "Radeon RX 6700 XT / 6800", group: "AMD", tps: 45, vram: 12, match: /rx 6[78]00/i },
  { id: "Radeon RX 7600", group: "AMD", tps: 40, vram: 8, match: /rx 7600/i },
  { id: "Radeon RX 7700 XT / 7800 XT", group: "AMD", tps: 65, vram: 16, match: /rx 7[78]00/i },
  { id: "Radeon RX 7900 XT / XTX", group: "AMD", tps: 95, vram: 24, match: /rx 7900/i },
  { id: "Radeon RX 9060 XT / 9070 XT", group: "AMD", tps: 85, vram: 16, match: /rx 90[67]0/i },
  { id: "Intel Arc A750 / A770", group: "Intel", tps: 40, vram: 16, match: /arc\(tm\) a7|arc a7/i },
  { id: "Intel Arc B580", group: "Intel", tps: 50, vram: 12, match: /b580/i },
  { id: "Apple M1", group: "Apple", tps: 14, vram: 0, match: /apple m1(?! (pro|max))/i },
  { id: "Apple M1 Pro / Max", group: "Apple", tps: 32, vram: 0, match: /apple m1 (pro|max)/i },
  { id: "Apple M2", group: "Apple", tps: 20, vram: 0, match: /apple m2(?! (pro|max))/i },
  { id: "Apple M2 Pro / Max", group: "Apple", tps: 38, vram: 0, match: /apple m2 (pro|max)/i },
  { id: "Apple M3", group: "Apple", tps: 26, vram: 0, match: /apple m3(?! (pro|max))/i },
  { id: "Apple M3 Pro / Max", group: "Apple", tps: 45, vram: 0, match: /apple m3 (pro|max)/i },
  { id: "Apple M4", group: "Apple", tps: 34, vram: 0, match: /apple m4(?! (pro|max))/i },
  { id: "Apple M4 Pro / Max", group: "Apple", tps: 60, vram: 0, match: /apple m4 (pro|max)/i },
  { id: "Apple M5", group: "Apple", tps: 42, vram: 0, match: /apple m5/i },
];

export const OS_OPTIONS = ["Windows", "macOS", "Linux"];
export const RAM_OPTIONS = [4, 8, 16, 18, 24, 32, 36, 48, 64, 96, 128];

export interface SpecPreset { id: string; label: string; os: string; cpu: string; gpu: string; ramGb: number }

export const SPEC_PRESETS: SpecPreset[] = [
  { id: "old-laptop", label: "古めのノートPC", os: "Windows", cpu: "Core i5（第10世代まで）", gpu: "Intel UHD（内蔵）", ramGb: 8 },
  { id: "laptop", label: "ふつうのノートPC", os: "Windows", cpu: "Core i5（第11世代以降）", gpu: "Intel Iris Xe（内蔵）", ramGb: 16 },
  { id: "thin-high", label: "高性能ノート", os: "Windows", cpu: "Core Ultra 7", gpu: "Intel Arc（Core Ultra内蔵）", ramGb: 32 },
  { id: "copilot-pc", label: "Copilot+ PC", os: "Windows", cpu: "Snapdragon X Elite", gpu: "Snapdragon X（Adreno）", ramGb: 16 },
  { id: "gaming-laptop", label: "ゲーミングノート", os: "Windows", cpu: "Core i7（第11世代以降）", gpu: "RTX 4050 / 4060（ノート）", ramGb: 16 },
  { id: "gaming", label: "ゲーミングPC", os: "Windows", cpu: "Ryzen 7（7000番台以降）", gpu: "RTX 4070 / 4070 SUPER", ramGb: 32 },
  { id: "high-end", label: "ハイエンドPC", os: "Windows", cpu: "Core i9（第12世代以降）", gpu: "RTX 4090", ramGb: 64 },
  { id: "mac-m1", label: "Mac M1", os: "macOS", cpu: "Apple M1", gpu: "Apple M1", ramGb: 8 },
  { id: "mac-m2", label: "Mac M2", os: "macOS", cpu: "Apple M2", gpu: "Apple M2", ramGb: 16 },
  { id: "mac-m3", label: "Mac M3", os: "macOS", cpu: "Apple M3", gpu: "Apple M3", ramGb: 16 },
  { id: "mac-m4", label: "Mac M4", os: "macOS", cpu: "Apple M4", gpu: "Apple M4", ramGb: 16 },
  { id: "mac-pro", label: "MacBook Pro（Pro/Maxチップ）", os: "macOS", cpu: "Apple M4 Pro / Max", gpu: "Apple M4 Pro / Max", ramGb: 48 },
];

export const DEFAULT_SPEC: PcSpec = { enabled: false, detail: false, preset: "laptop", ...pick(SPEC_PRESETS[1]) };

function pick(p: SpecPreset) {
  return { os: p.os, cpu: p.cpu, gpu: p.gpu, ramGb: p.ramGb };
}

export function applyPreset(spec: PcSpec, presetId: string): PcSpec {
  const p = SPEC_PRESETS.find((x) => x.id === presetId);
  return p ? { ...spec, preset: presetId, ...pick(p) } : { ...spec, preset: presetId };
}

const gpuOf = (spec: PcSpec) => GPU_OPTIONS.find((g) => g.id === spec.gpu) ?? GPU_OPTIONS[0];

/** ローカルLLMに使えるメモリ（GB）。専用VRAMが無ければメインメモリの6割 */
export function localMemory(spec: PcSpec): number {
  const g = gpuOf(spec);
  return g.vram > 0 ? Math.max(g.vram, spec.ramGb * 0.5) : spec.ramGb * 0.6;
}

/** ローカルLLM（8Bクラス）の推論速度（トークン/秒） */
export function localTps(spec: PcSpec, memNeededGb = 6): number {
  const g = gpuOf(spec);
  // VRAMに収まらずメインメモリにあふれると大きく遅くなる
  if (g.vram > 0 && g.vram < memNeededGb) return Math.min(g.tps * 0.3, 12);
  return g.tps;
}

/** ビルド・テスト1回あたりの時間係数 */
export function buildFactor(spec: PcSpec): number {
  const cpu = CPU_OPTIONS.find((c) => c.id === spec.cpu)?.factor ?? 1;
  const ram = spec.ramGb < 16 ? 1.3 : spec.ramGb >= 32 ? 0.9 : 1;
  const os = spec.os === "Windows" ? 1.1 : 1;
  return cpu * ram * os;
}

/**
 * ブラウザから分かる範囲でこのPCのスペックを推定する。
 * GPUはWebGLのレンダラー名、メモリとコア数はブラウザのAPIから（ブラウザによっては取れない）。
 */
export function detectSpec(): { spec: Partial<PcSpec>; found: string[] } {
  const found: string[] = [];
  const nav = navigator as Navigator & { deviceMemory?: number; userAgentData?: { platform?: string } };
  const platform = (nav.userAgentData?.platform || nav.userAgent).toLowerCase();
  const os = platform.includes("mac") ? "macOS" : platform.includes("win") ? "Windows" : platform.includes("linux") ? "Linux" : "Windows";
  found.push(`OS：${os}`);

  let renderer = "";
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    renderer = (ext && gl?.getParameter(ext.UNMASKED_RENDERER_WEBGL)) || "";
  } catch {}
  const gpu = GPU_OPTIONS.find((g) => g.match?.test(renderer));
  if (renderer) found.push(`GPU：${renderer.replace(/^ANGLE \((.*)\)$/, "$1").split(",").slice(0, 2).join(" ").slice(0, 60)}`);

  const cores = nav.hardwareConcurrency ?? 8;
  found.push(`CPUスレッド数：${cores}`);
  let cpu: string;
  if (gpu?.group === "Apple") cpu = CPU_OPTIONS.find((c) => c.id.startsWith(gpu.id.split(" /")[0]))?.id ?? "Apple M1";
  else if (gpu?.id.startsWith("Snapdragon")) cpu = "Snapdragon X Elite";
  else if (os === "macOS") cpu = "Apple M2";
  else cpu = cores >= 24 ? "Core i9（第12世代以降）" : cores >= 16 ? "Core i7（第11世代以降）" : cores >= 8 ? "Core i5（第11世代以降）" : "Core i5（第10世代まで）";

  // deviceMemory は最大8までしか返さないので、8なら多めに見積もる
  const dm = nav.deviceMemory;
  const ramGb = dm ? (dm >= 8 ? (cores >= 16 ? 32 : 16) : dm <= 4 ? 8 : dm) : 16;
  if (dm) found.push(`メモリ：${dm >= 8 ? "8GB以上" : `約${dm}GB`}`);

  return { spec: { os, cpu, gpu: gpu?.id ?? (renderer ? "わからない / GPUなし" : undefined), ramGb }, found };
}
