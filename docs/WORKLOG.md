# 工作日誌 WORKLOG

> 給接手的 AI（Claude、Antigravity、Codex）與人類開發者。
> **開始工作前**：先讀 `AGENTS.md` 與這份日誌的「目前狀態」「下一步」。
> **結束工作前**：更新「目前狀態」「下一步」，並在「日誌」最上面新增一筆（最新的在最上面）。
> Antigravity 可用 `/start_session`、`/end_session` 兩個 workflow 自動照做。

---

## 目前狀態（2026-10-27 17:30 更新）

| 項目 | 狀態 |
| --- | --- |
| 線上版 | https://math-archaeology-3d-460168640095.asia-east1.run.app （Cloud Run，revision 00003 = commit `ec4d5da`） |
| 原始碼 | https://github.com/scratchinai02-commits/math-archaeology-3d （`main`） |
| 本機 | `~/inhs/math-archaeology-3d`（git 工作目錄，與 GitHub 同步） |
| GCP | 專案 `sign-in-4a9b6`，區域 `asia-east1`，服務 `math-archaeology-3d` |
| 測試 | 151 項（Vitest），全部通過；Cloud Build 部署時會再跑一次，沒過就不會上線 |
| 施工清單 | 第 1～10 項完成；第 21 項任務系統：關卡資料與判定邏輯完成，**畫面尚未接上** |

## 下一步（一次只做一項，做完測試、提交、更新日誌）

1. **3D 數學冒險島**（使用者 2026-10-27 決定：參考主題 3 海報，一座島一座島慢慢建）
   1. 第一座島：**幾何之島**。島本身也要由演算法產生（例如 `createIslandGeometry()`：圓錐台／圓柱加上起伏，**禁止用 GLB 模型**），現有的圓、扇形、切片放在島上的平台。
   2. 把 `src/data/lessons/circle-area.json` 的 7 關放到幾何之島：島上的關卡點、任務提示、過關解鎖。判定直接用 `src/game/goals.js` 的 `evaluateGoal()`，進度用 `src/store/useGameStore.js`。
   3. 函數之谷、統計之塔、應用數學館：**先不做**，幾何之島完成並確認後再一座一座加。
2. **已知問題**：視窗較窄時，左側面板會蓋住 3D 畫面。建議在 `CameraRig` 用 `camera.setViewOffset()` 把畫面中心往右移半個面板寬。
3. 之後：施工清單第 11 項 Polygon（`createPolygonPoints`，n → ∞ 逼近圓）。

## 日誌

### 2026-10-27｜Claude（Cowork，雲端工作階段）

**完成（依 commit 順序）**

| commit | 內容 | 驗證 |
| --- | --- | --- |
| `7ea83e8` | 第一階段：Vite 8 + React 19 + three r186 + R3F 9 + Drei 10 + Zustand 5 + Vitest 5；Canvas、相機、燈光、OrbitControls、`createCirclePoints()`、`Circle3D`、半徑滑桿 | 40 項測試；線上版實測拖動半徑 |
| `d4ed0de` `01b0a41` | Cloud Run 部署：Dockerfile（建置時先 `npm test`）+ nginx + `deploy.sh` | 部署成功 |
| `ac300ef` | 座標系：軸線、刻度、箭頭都由 `createCoordinateSystem()` 算出 | 線上版目視 |
| `13c96eb` | `createSectorPoints()`；圓改由「圓心角 2π 的扇形」計算 | 91 項測試 |
| `b01f04b` | `Sector3D` + 圓心角滑桿（顯示 π 分數）、弧長／扇形面積 | 線上版：270° → 3π/2、s = 23.56、A = 58.90 |
| `870cc54` | 第 9 項 CircleSlices：`sliceCircle()`（設計文件 5.3 格式）、4～128 片 | 測試證明每片落在圓上正確位置 |
| `ec4d5da` | 第 10 項 Rearrangement：▲▼ 交錯排列、動畫、πr × r 對照長方形 | 測試證明兩排剛好嵌合；n = 128 時與 πr² 只差 0.04%；線上版目視動畫 |
| `61609da` | 第 21 項第一步：圓面積 7 關 JSON + `goals.js` + `useGameStore` | 151 項測試，含「每關都過得了」的搜尋測試 |

**決策**

- 數學 3D 引擎先照施工清單做；《硬碟考古博物館》之後另建，數學世界當作其中的展館（見 `AGENTS.md`）。
- 「動態島」= 海報上的 **3D 數學冒險島**（不是 iPhone 動態島 UI）。一座島一座島慢慢建，先做幾何之島。
- 關卡寫成 JSON（`src/data/lessons/`），之後由 Codex 從舊講義自動產生同樣格式。

**講義考古的發現**

- `~/inhs` 有 1,048 個 Word `.doc`、1 個 `.docx`、1 個 PDF，沒有 PPT；依冊次分 (一)～(四)、甲下、乙上、乙下、三民工職。
- 檔案修改日期幾乎都是 2016（複製日期），真正年份要看檔名，例如 `92-12-25` = 民國 92 年。
- LibreOffice 轉 `.docx` 後，Equation Editor 公式大多能轉成 LaTeX（實測〈橢圓參數式〉162 個公式）；**大括號聯立式會掉第二行**、少數公式是圖片，要搭配「頁面轉圖片 + AI 核對」補齊。

**環境注意事項（交接用）**

- Claude 雲端環境無法 `npm install`（npm registry 被網路政策擋）。單元測試是用 esbuild 打包、Node 內建 test runner 搭配 Vitest 相容的 `expect` 執行；正式的 Vitest 與 Vite build 在 Cloud Build 裡跑。
- 你的 Mac 上可以直接 `npm install && npm test && npm run dev`（Node 22.12 以上）。
- 直接雙擊 `index.html`（`file://`）會是空白頁，一定要用 `npm run dev` 或線上網址。
- 部署：在 Cloud Shell 執行 `bash ~/math-archaeology-3d/deploy.sh`（會自動 `git pull`）。
- `~/inhs/.claude-tmp/` 是測試時誤建的空資料夾，可以直接刪除。
