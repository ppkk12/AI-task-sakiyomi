#!/usr/bin/env bash
# GitHub Pages（gh-pages ブランチ）へ静的版を公開する。
# 使い方: npm run deploy
set -euo pipefail

REPO_URL=$(git remote get-url origin)
REPO_NAME=$(basename -s .git "$REPO_URL")
WORK=$(mktemp -d)

# Git Bash がパスを書き換えないようにする
MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH="/$REPO_NAME" npm run build:static
touch out/.nojekyll
cp -r out/. "$WORK"
rm -rf out

cd "$WORK"
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C "$OLDPWD" config user.name)" -c user.email="$(git -C "$OLDPWD" config user.email)" \
  commit -q -m "Deploy $(date '+%Y-%m-%d %H:%M')"
git push -f "$REPO_URL" gh-pages
rm -rf "$WORK"
echo "公開しました: https://$(gh api user --jq .login 2>/dev/null || echo '<user>').github.io/$REPO_NAME/"
