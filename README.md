# Math Archaeology 3D｜數學考古

躺在硬碟 10 年的舊講義 → 可探索、可操作的 3D 互動數學教學 App。

React 19 · Vite 8 · Three.js · React Three Fiber · Drei · Zustand · Vitest

## 快速開始

需要 **Node.js 22.12 以上**（或 24 LTS）。可用 `node -v` 確認。

```bash
cd math-archaeology-3d
npm install
npm test        # 執行所有演算法單元測試
npm run dev     # 開發伺服器，瀏覽器打開終端機顯示的網址
```

其他指令：`npm run build`（打包到 `dist/`）、`npm run preview`、`npm run test:watch`。

> 直接雙擊 `index.html`（`file://`）會是空白頁，一定要透過 `npm run dev` 或部署後的網址開啟。

## 部署到 Google Cloud Run

在 [Cloud Shell](https://shell.cloud.google.com) 執行（不需要在自己電腦裝任何東西）：

```bash
git clone https://github.com/scratchinai02-commits/math-archaeology-3d.git
cd math-archaeology-3d

gcloud config set project sign-in-4a9b6
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

gcloud run deploy math-archaeology-3d \
  --source . \
  --region asia-east1 \
  --allow-unauthenticated
```

Cloud Build 會依 `Dockerfile` 執行 `npm install` → `npm test` → `npm run build`，
**測試沒過就不會部署**；成功後終端機會顯示網址（`https://math-archaeology-3d-….run.app`）。
之後更新只要在 Cloud Shell 執行 `bash ~/math-archaeology-3d/deploy.sh`（會自動 `git pull` 再部署）。專案需已啟用計費（Cloud Run 有免費額度）。

## 目前進度：第一階段

- Vite + React 基礎專案（等同 `npm create vite@latest -- --template react`，另加 three / R3F / Drei / Zustand / Vitest）
- R3F Canvas、相機、燈光、OrbitControls、地面格線
- Zustand store（設計文件第 6 節的狀態結構）
- `createCirclePoints()`：由 x = r cos θ、z = r sin θ 計算圓周頂點
- `Circle3D`：圓面（三角扇 BufferGeometry）+ 圓周 + 半徑
- 半徑滑桿：拖動時重新計算頂點，周長與面積同步更新

資料流：

```text
半徑滑桿 → Zustand → createCirclePoints() → createDiskMeshData() → toBufferGeometry() → R3F → 畫面
```

開發規則與完整施工清單見 [`AGENTS.md`](./AGENTS.md)。

## 目錄

```text
src/
├── app/App.jsx                       只負責組合
├── scene/                            MathWorld（Canvas）、CameraRig、Lighting、Environment
├── components/
│   ├── math/Circle3D.jsx             演算法 → 3D 元件
│   └── ui/                           CirclePanel、RadiusSlider
├── math/
│   ├── geometry/circle.js            純數學：圓
│   └── algorithms/                   validate、meshData、bufferGeometry
├── store/useMathStore.js             Zustand
├── worlds/  data/  math/functions/  math/statistics/  components/world/   （之後的階段）
└── main.jsx
```
