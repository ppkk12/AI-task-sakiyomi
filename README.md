# AIタスク先読み

作った人：[@pk6fsfsl](https://x.com/pk6fsfsl)

**公開ページ：https://ppkk12.github.io/ai-task-sakiyomi/**

AIに渡す予定のプロンプト（作業指示）を入力すると、

- どのAI・モデル・推論レベル（Low / Medium / High）が最適か
- 完了までの予想時間
- 5時間枠・1週間枠・1ヶ月枠の消費率と、API従量課金の予想金額（円 / USD）

を先読みして比較・提案するWebアプリです。

## 仕組み

1. **判定エンジン**：無料AI API（Gemini / OpenRouter `openrouter/free` / Groq）にプロンプトを解析させ、タスクの性質・往復ターン数・ツール実行回数・レベル別の手戻り率・累計トークンを JSON で予測します。APIキーが無い場合や失敗した場合は、キーワードと長さによるローカル推論に自動で切り替わります。
2. **消費量の計算**：予測結果に各モデルの料金・速度・品質を掛け合わせ、モデル × レベル × プランごとの枠消費率・料金・時間を算出します（`src/lib/calc.ts`）。
3. **おすすめ**：チェックした手持ちのプランの中から、時間・枠の圧迫・支払額のバランスが最も良い組み合わせを表示します。未契約のAIで時間かコストが半分程度になる場合のみ、1行で補足します。

## 対応しているもの

- **モデル**：Claude（Opus / Sonnet / Haiku）、GPT-5（Codex / mini / nano）、Gemini（Pro / Flash / Flash-Lite）、Grok、DeepSeek、Qwen、Kimi、GLM、Mistral、gpt-oss、Llama、ローカルLLM（8B / 20B / 30Bクラス）
- **プラン**：各社の無料プラン、Claude Pro / Max、ChatGPT Plus / Business / Pro、Google AI Pro / Ultra、GitHub Copilot、Cursor、Windsurf、SuperGrok、GLM Coding Plan、Le Chat、Perplexity、各社API・Groq・OpenRouter
- **PCスペック**：プリセットを選ぶだけのかんたんモード、CPU・GPU・メモリを個別に選ぶ詳細モード、ブラウザからこのPCのスペックを推定する機能

料金・枠の大きさ・速度は目安です。`src/lib/catalog.ts`（モデル・プラン）と `src/lib/specs.ts`（CPU・GPU）を編集すれば計算に反映されます。

## 使い方

```bash
npm install
npm run dev
```

http://localhost:3000 を開きます。キー不要でそのまま試せます。

### 無料APIキーの設定

どちらか好きな方法で設定します。

- **ブラウザで入力**：右上の「設定」から入力。キーは localStorage にのみ保存され、ブラウザから各社APIへ直接送信されます。
- **環境変数**：`.env.example` を `.env.local` にコピーしてキーを記入（Vercel では Project Settings → Environment Variables）。サーバー側の `/api/predict` が使います。

キーの取得先：[Google AI Studio](https://aistudio.google.com/apikey) / [OpenRouter](https://openrouter.ai/keys) / [Groq](https://console.groq.com/keys)

`.env*` は `.gitignore` で除外済みなので、GitHub に push してもキーは公開されません。

## 公開

- **Vercel**：リポジトリをインポートするだけ。必要なら環境変数にキーを設定。
- **GitHub Pages**：静的書き出し版を `gh-pages` ブランチに公開します（サーバーAPIは含まれないため、キーはブラウザの設定画面で入力）。

  ```bash
  npm run deploy
  ```

## 技術スタック

Next.js（App Router）/ TypeScript / Tailwind CSS v4
