---
description: 結束工作前：確認測試、更新施工進度與工作日誌、commit 並 push，讓下一位（Claude 或 Antigravity）可以無縫接手。
---

# /end_session

1. 執行 `npm test`，全綠才能提交；沒過就在日誌寫清楚卡在哪裡。
2. 更新 `AGENTS.md` 的「施工進度」勾選。
3. 更新 `docs/WORKLOG.md`：
   - 「目前狀態」表格：測試數量、線上 revision、施工清單進度。
   - 「下一步」：刪掉已完成的，補上新發現的問題。
   - 「日誌」**最上面**新增一筆，格式：
     ```markdown
     ### YYYY-MM-DD｜<誰：Claude / Antigravity / 人名>

     **完成**
     | commit | 內容 | 驗證 |
     | --- | --- | --- |

     **決策**
     - …

     **未完成／注意**
     - …
     ```
4. Commit（訊息用中文，第一行寫「第 N 項：…」或做了什麼），然後 `git push`。
5. 需要上線時接著執行 `/deploy`。
