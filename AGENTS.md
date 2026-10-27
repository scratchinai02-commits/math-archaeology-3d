# AGENTS.md — Math Archaeology 3D 開發規則

給所有參與這個專案的 AI 協作者（Codex、Antigravity、Claude…）與人類開發者。
動手之前請先讀完這份文件。

## 最高原則

> 不是把舊講義換成漂亮的 3D 背景，而是讓 AI 理解講義原本要教什麼，
> 再呼叫真正的數學演算法，重建成可以操作、探索與驗證的 3D 學習體驗。

```text
數學公式 → 頂點 vertices → indices → BufferGeometry → Mesh → 互動式 3D 數學模型
```

## 必守規則

1. **一次只做一個階段。** 完成後停下來，輸出檔案樹、測試結果與下一階段建議，不要自行開始下一階段。
2. **所有數學幾何必須 algorithm-driven**：由數學公式計算頂點。
3. **禁止用圖片假裝幾何模型**（`circle.png`、`graph.png`…）。
4. **禁止用現成 GLB / glTF 代替數學模型**（`cone.glb`、`pyramid.glb`、多面體模型…）。
5. **禁止把演算法產生的數學模型偷偷替換成外部模型**，也不得用 Three.js 內建幾何（`CircleGeometry`、`ConeGeometry`…）代替自己寫的演算法。
6. 複雜幾何使用 `THREE.BufferGeometry`（透過 `src/math/algorithms/bufferGeometry.js`）。
7. **數學演算法與 React 元件分離**：`src/math/` 不得 import React。
8. **Zustand 只負責共享互動狀態**（參數），不存頂點或幾何資料。
9. **Drei 只用於輔助功能**：控制器、相機、環境、格線、標籤、線條繪製等。
10. **每完成一個模組先測試**（`npm test` 全綠），再進入下一個。
11. **不要把程式寫進 `App.jsx`**；App 只負責組合。
12. **每一個演算法都要有單元測試**，測的是數學性質（例如 x² + z² = r²），不只是「有回傳值」。

## 分層與目錄

| 目錄 | 職責 | 可以 import |
| --- | --- | --- |
| `src/math/geometry/`、`functions/`、`statistics/` | 純數學演算法（回傳點、數值） | 只有 `src/math/` 內部 |
| `src/math/algorithms/` | 共用工具：參數檢查、vertices/indices、BufferGeometry | `bufferGeometry.js` 是唯一可以 import `three` 的數學檔 |
| `src/components/math/` | 把演算法結果變成 R3F 元件（`Xxx3D.jsx`） | math、store、three、drei |
| `src/components/ui/` | HTML 介面（滑桿、面板），只讀寫 Zustand | math（顯示數值用）、store |
| `src/components/world/` | 世界中的場景物件（之後） | |
| `src/scene/` | Canvas、相機、燈光、環境 | |
| `src/worlds/` | 主題世界：GeometryIsland、FunctionValley…（之後） | |
| `src/store/` | Zustand store | |
| `src/data/` | 課程 / 島嶼 / 題目 JSON（之後） | |
| `public/ppt/` | 原始講義檔（之後） | |

## 新增一個數學圖形的流程

1. 在 `src/math/geometry/xxx.js` 寫純函式（例如 `createSectorPoints`），用 `validate.js` 檢查參數。
2. 在同目錄寫 `xxx.test.js`，測數學性質與錯誤輸入。
3. 需要面時，用 `meshData.js` 產生 vertices / indices，再用 `toBufferGeometry()`。
4. 在 `src/components/math/Xxx3D.jsx` 用 `useMemo` 依參數重新計算，舊幾何用 `dispose()` 釋放。
5. 共享參數加入 `useMathStore.js`，並補 store 測試。
6. `npm test` 全綠、畫面確認後，才進下一個模組。

## 慣例

- y 軸朝上；平面圖形放在 x-z 平面（y = 0）。
- 角度一律用弧度；θ 由 +x 軸往 +z 軸遞增。
- 點的格式為 `[x, y, z]`。
- 命名：`createXxxPoints()`、`createXxxMeshData()`、`Xxx3D.jsx`。

## 施工進度（設計文件第 9 節）

- [x] 1. 專案骨架
- [x] 2. Canvas
- [x] 3. Camera
- [x] 4. Lighting
- [x] 5. Zustand
- [x] 6. CoordinateSystem（`createCoordinateSystem` + `CoordinateSystem`）
- [x] 7. Circle（`createCirclePoints` + `Circle3D` + 半徑滑桿）
- [ ] 8. Sector
- [ ] 9. CircleSlices
- [ ] 10. Rearrangement
- [ ] 11. Polygon
- [ ] 12. Prism
- [ ] 13. Pyramid
- [ ] 14. Cone
- [ ] 15. Plane
- [ ] 16. Intersection
- [ ] 17. FunctionCurve
- [ ] 18. FunctionSurface
- [ ] 19. GeometryIsland
- [ ] 20. FunctionValley
- [ ] 21. 任務系統
- [ ] 22. 舊講義 JSON
- [ ] 23. Codex 自動解析
- [ ] 24. Antigravity 世界化
- [ ] 25. Vite Build

前 1～18 項先完成數學 3D Engine，之後才做講義解析與世界化。
