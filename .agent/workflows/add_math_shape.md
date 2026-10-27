---
description: 新增一個演算法驅動的數學圖形（純函式 → 單元測試 → R3F 元件 → store → 面板），符合 AGENTS.md 的規則。
---

# /add_math_shape

以 `createPolygonPoints` 為例，其他圖形照同樣步驟。

1. **演算法**：在 `src/math/geometry/<shape>.js` 寫純函式（不得 import React），用 `src/math/algorithms/validate.js` 檢查參數。點的格式 `[x, y, z]`，平面圖形放在 x-z 平面（y = 0），角度用弧度、θ 由 +x 往 +z。
2. **測試**：在同目錄寫 `<shape>.test.js`，測**數學性質**（例如每個頂點到圓心距離 = r、n → ∞ 時周長逼近 2πr）與錯誤輸入。執行 `npm test`，全綠才繼續。
3. **網格**：需要面時用 `src/math/algorithms/meshData.js`（vertices / indices）與 `bufferGeometry.js` 的 `toBufferGeometry()`。
4. **元件**：`src/components/math/<Shape>3D.jsx`，用 `useMemo` 依參數重新計算，`useEffect` 清除時 `geometry.dispose()`。線條可用 Drei `<Line>`，但點必須來自演算法。
5. **狀態**：共享參數加進 `src/store/useMathStore.js`（只放參數，不放頂點），並在 `useMathStore.test.js` 補測試。
6. **介面**：滑桿用 `src/components/ui/ParamSlider.jsx`，選項用 `SegmentedControl.jsx`。
7. 執行 `npm test` 與 `npm run build`，再用 `npm run dev` 目視確認。
8. 更新 `AGENTS.md` 的施工進度，然後執行 `/end_session`。
