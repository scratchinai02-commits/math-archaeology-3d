#!/usr/bin/env bash
# 在 Cloud Shell 部署到 Cloud Run：bash deploy.sh
# 可用環境變數覆寫：PROJECT_ID、REGION、SERVICE
set -euo pipefail

cd "$(dirname "$0")"
git pull --ff-only || true

PROJECT_ID="${PROJECT_ID:-sign-in-4a9b6}"
REGION="${REGION:-asia-east1}"
SERVICE="${SERVICE:-math-archaeology-3d}"

echo "▶ 專案 $PROJECT_ID｜區域 $REGION｜服務 $SERVICE｜版本 $(git log --oneline -1)"

gcloud config set project "$PROJECT_ID"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# Cloud Build 依 Dockerfile：npm install → npm test → npm run build（測試沒過就停止）
gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --quiet

echo "✅ 網址：$(gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)')"
