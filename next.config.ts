import type { NextConfig } from "next";

// STATIC_EXPORT=1 のときは GitHub Pages 向けに静的書き出しする。
// 静的版ではサーバーAPI（/api/predict）を含めず、ブラウザ保存のAPIキーかローカル推論のみで動く。
const isStatic = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// 開発中に左下に出る Next.js のインジケーター（N マーク）は非表示にする
const common: NextConfig = { devIndicators: false };

const nextConfig: NextConfig = isStatic
  ? {
      ...common,
      output: "export",
      basePath,
      images: { unoptimized: true },
      // route.ts をルートとして拾わないようにする（.tsx のページだけ書き出す）
      pageExtensions: ["tsx"],
      env: { NEXT_PUBLIC_STATIC_EXPORT: "1" },
    }
  : common;

export default nextConfig;
