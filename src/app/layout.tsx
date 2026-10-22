import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIタスク先読み",
  description: "プロンプトから最適なAI・モデル・推論レベルと、完了までの時間・使用枠・API料金を先読みします。",
};

// 保存されたテーマ（なければOS設定）を描画前に適用してチラつきを防ぐ
const themeScript = `try{var t=localStorage.getItem("theme");var d=t?JSON.parse(t)==="dark"||(JSON.parse(t)==="system"&&matchMedia("(prefers-color-scheme: dark)").matches):matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
