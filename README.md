健康庫 LogVita (Personal Health Record)
健康庫 LogVita 是一個注重隱私與資料自主權的個人健康管理系統（PHR / EMR）。使用者可將檢驗報告、用藥紀錄、就診紀錄與醫療影像統一歸檔，並透過端到端加密（E2EE）安全地授權家人或醫師調閱。所有個人資料優先儲存於使用者自持的個人雲端空間（Google Drive 或 Dropbox），資料庫僅負責身分驗證與金鑰交換，杜絕醫療隱私外洩風險。
✨ 核心特色
 * 端到端加密（E2EE）： 採用瀏覽器原生 Web Crypto API（AES-GCM 256-bit），在前端完成敏感資料加密後再行傳輸與儲存。
 * BYOS（Bring Your Own Storage）： 支援 Google Drive REST API 與 Dropbox OAuth 2.0 (PKCE)，個人病歷與照片皆備份在使用者個人的雲端空間。
 * 細緻授權與共享機制： 可自訂分享對象（家庭成員、醫療人員）、授權範圍（完整病歷、檢驗報告、摘要或自訂項目）及有效期限。
 * 緊急健康身分卡： 提供 3D 動態互動的個人身分卡，視覺化呈現血型、過敏史與緊急聯絡人資訊。
 * 多語系支援： 登入與協議介面支援繁體中文（zh-TW）、簡體中文（zh-CN）、English（en）、日本語（ja）與 한국어（ko）。
 * 無障礙與安全性： 整合 Google reCAPTCHA v3 防護機器人攻擊，並支援 prefers-reduced-motion 動畫減量。
🛠️ 技術架構
| 層級 | 使用技術 |
|---|---|
| 前端技術 | 原生 HTML5、CSS3（Custom Properties、CSS Grid、Flexbox）、Vanilla JavaScript (ES Modules) |
| 認證與通知 | Firebase Authentication (Google 登入 / Email / 密碼)、Firebase Firestore（僅交換邀請指標與加密金鑰） |
| 加密與安全 | Web Crypto API (AES-GCM 256-bit)、Google reCAPTCHA v3 |
| 雲端儲存 | Google Drive REST API v3、Dropbox API v2 (PKCE + Refresh Token) |
📂 檔案目錄結構
.
├── index.html            # 登入 / 註冊入口頁面、多語系切換與服務條款/隱私政策彈窗
├── index.js              # 登入驗證、語系套用、reCAPTCHA 與 Firebase Auth 邏輯
├── index.css             # 登入頁樣式與心電圖動畫設計
├── dashboard-zhtw.html   # 主控制台（健康總覽、紀錄列表、身分卡、授權管理）
├── dashboard-zhtw.js     # 雲端同步、AES-GCM 加解密、照片上傳與 UI 渲染
├── dashboard-zhtw.css    # 儀表板佈局、3D 傾斜卡片與對話框樣式
└── README.md             # 專案說明文件

🚀 快速開始
1. 取得專案原始碼
git clone https://github.com/yuweihuang0417/emr.git
cd emr

2. 環境設定與憑證
如需部署至個人環境，請在 index.js 與 dashboard-zhtw.js 中設定相應的 API 金鑰與設定檔：
 * Firebase Config: 於 Firebase Console 建立專案並啟用 Authentication 與 Firestore。
 * Google API: 設定啟用 Google Drive API 的 OAuth Client ID 與 API Key（建議綁定 HTTP Referrer 網域限制）。
 * Dropbox App: 於 Dropbox App Console 建立 App（Permissions 需勾選 files.content.write、files.content.read、sharing.write、sharing.read）。
 * reCAPTCHA v3: 替換 index.html 與 index.js 中的 Site Key。
3. 本地執行
由於專案使用了 ES Modules 與 OAuth 流程，請透過本機 HTTP 伺服器開啟（避免直接開啟 file://）：
# 使用 Python
python3 -m http.server 8000

# 或使用 Node.js http-server
npx http-server -p 8000

開啟瀏覽器造訪 http://localhost:8000 即可進行測試。
🔒 隱私與安全性原則
 * 零知識儲存（Zero-Knowledge Storage）： 實際病歷內文（logvita_config.json）直接寫入使用者的個人雲端硬碟，後端資料庫（Firestore）僅記錄公開邀請指標與加密後金鑰，伺服器端無法讀取未加密的病歷資料。
 * 連線安全防護： 實作 Token 逾時檢查機制與 PKCE 驗證流程，防止跨站偽造與未授權存取。
