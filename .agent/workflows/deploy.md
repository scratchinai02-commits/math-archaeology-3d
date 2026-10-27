---
description: 把 main 部署到 Google Cloud Run（專案 sign-in-4a9b6，asia-east1），並確認線上版正常。
---

# /deploy

1. 確認本機 `npm test` 與 `npm run build` 都通過，變更已 commit 並 `git push` 到 `main`。
2. 打開 Cloud Shell：https://shell.cloud.google.com/?project=sign-in-4a9b6&show=terminal
3. 在 Cloud Shell 執行（第一次部署前若沒有程式碼，先 `git clone https://github.com/scratchinai02-commits/math-archaeology-3d.git`）：
   ```bash
   bash ~/math-archaeology-3d/deploy.sh
   ```
   這會 `git pull` → 啟用 API → `gcloud run deploy`。Cloud Build 會依 `Dockerfile` 跑 `npm install` → `npm test` → `npm run build`，**測試沒過就不會上線**。
4. 等最後出現 `Service URL:`（約 2～4 分鐘），打開
   https://math-archaeology-3d-460168640095.asia-east1.run.app
   檢查：3D 畫面有出現、主控台沒有錯誤、這次改的功能可以操作。
5. 在 `docs/WORKLOG.md` 記下新的 revision 編號與對應的 commit。
