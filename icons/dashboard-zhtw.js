  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
  import { getAuth, signOut, onAuthStateChanged, GoogleAuthProvider, reauthenticateWithPopup, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
  import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc, onSnapshot, deleteField } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
  import { dashboardTranslations, detectLanguage, saveLanguage } from "./i18n.js?v=7";

  // ---- 多語言（與登入頁共用同一份翻譯來源 i18n.js）----
  let currentLanguage = detectLanguage();
  function T(){ return dashboardTranslations[currentLanguage] || dashboardTranslations['zh-TW']; }

  // 依 "a.b.c" 路徑從翻譯物件取值
  function resolveI18nKey(key){
    return key.split('.').reduce((obj, part) => (obj == null ? undefined : obj[part]), T());
  }

  // 套用語言：更新所有帶 data-i18n* 屬性的靜態文字，並重新渲染會用到翻譯的動態內容
  function applyLanguage(lang){
    currentLanguage = dashboardTranslations[lang] ? lang : 'zh-TW';
    saveLanguage(currentLanguage);
    const t = T();

    document.documentElement.lang = t.htmlLang;
    document.title = t.title;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const val = resolveI18nKey(el.getAttribute('data-i18n'));
      if (typeof val === 'string') el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const val = resolveI18nKey(el.getAttribute('data-i18n-placeholder'));
      if (typeof val === 'string') el.setAttribute('placeholder', val);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const val = resolveI18nKey(el.getAttribute('data-i18n-title'));
      if (typeof val === 'string') el.setAttribute('title', val);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
      const val = resolveI18nKey(el.getAttribute('data-i18n-aria-label'));
      if (typeof val === 'string') el.setAttribute('aria-label', val);
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const val = resolveI18nKey(el.getAttribute('data-i18n-alt'));
      if (typeof val === 'string') el.setAttribute('alt', val);
    });

    const langSelect = document.getElementById('language-select');
    if (langSelect) langSelect.value = currentLanguage;

    // 重新渲染會用到目前語言的動態內容（統計數字、紀錄列表、授權清單、個人資料卡等）
    if (typeof renderOverview === 'function') renderOverview();
    if (typeof renderRecordList === 'function') renderRecordList();
    if (typeof renderAccessList === 'function') renderAccessList();
    if (typeof renderIdCard === 'function') renderIdCard();
    if (typeof renderDeviceInfo === 'function') renderDeviceInfo();
    const sharedPanel = document.getElementById('panel-shared');
    if (sharedPanel && sharedPanel.classList.contains('active') && typeof loadSharedWithMe === 'function') loadSharedWithMe();
  }

  const firebaseConfig = {
    apiKey: "AIzaSyDsKJOzaQKosJeJgUfZXBc0pahDzBKV7e8",
    authDomain: "tmu-medical.firebaseapp.com",
    projectId: "tmu-medical",
    storageBucket: "tmu-medical.firebasestorage.app",
    messagingSenderId: "370307905675",
    appId: "1:370307905675:web:bcb25f57995fbe5965fc8e",
    measurementId: "G-4YVJDN5Y7C"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // ---- 邀請通知信箱（僅存指標與金鑰，實際健康紀錄內容從不經過 Firestore）----
  // 對方登入時會查詢這個 collection，看看有沒有人邀請自己；一旦接受，這筆通知就會被刪除
  async function createInviteRecord(grant) {
    try {
      await setDoc(doc(db, 'invites', grant.id), {
        granteeEmail: (grant.email || '').trim().toLowerCase(),
        ownerName: currentDisplayName,
        ownerEmail: currentUserEmail,
        relationship: grant.type,
        scope: grant.scope,
        note: grant.note || '',
        expiryDate: grant.expiryDate || null,
        provider: grant.shareProvider,
        ref: grant.shareRef,
        key: grant.shareKey,
        grantId: grant.id,
        createdAt: new Date().toISOString()
      });
      return true;
    } catch (err) {
      console.error('建立邀請通知失敗:', err);
      return false;
    }
  }

  async function loadPendingInvites() {
    if (!currentUserEmail) return [];
    try {
      const q = query(collection(db, 'invites'), where('granteeEmail', '==', currentUserEmail));
      const snap = await getDocs(q);
      const invites = [];
      snap.forEach(d => invites.push({ id: d.id, ...d.data() }));
      return invites;
    } catch (err) {
      console.error('讀取邀請通知失敗:', err);
      return [];
    }
  }

  async function removeInviteRecord(inviteId) {
    try { await deleteDoc(doc(db, 'invites', inviteId)); }
    catch (err) { console.error('刪除邀請通知失敗:', err); }
  }

  // ---- 端到端加密共享：免登入讀取憑證（僅用來抓取「已設為可讀」的加密檔，內容本身仍需金鑰才能解密）----
  const GOOGLE_DRIVE_API_KEY = 'AIzaSyC9sfJMMlo4-fVtk6u323IwLyFhWL3S2Cc';     // Google Cloud Console → 憑證 → API 金鑰（請設定 HTTP 參照網址限制為你的網域）
  // 注意：Dropbox App Console「Generated access token」現在只能產生短效 token（約 4 小時就過期），
  // 不適合用在「收件人免登入讀取」這種需要長期穩定運作的地方。改用你（App 擁有者）自己帳號授權出的
  // refresh token（跟一般使用者連結 Dropbox 走一樣的 PKCE 流程拿到的那種），可以無限期自動換發新的 access token。
  const DROPBOX_APP_REFRESH_TOKEN = '9St1n23MAZwAAAAAAAAAASAz5hXSws77qOunx0oZLaTK5MJntdyv-vz3famfCZRR';    // 用你自己的帳號走一次「連結 Dropbox」流程，把拿到的 refresh token 貼在這裡
  const DRIVE_SHARE_ENABLED = !GOOGLE_DRIVE_API_KEY.startsWith('YOUR_');
  const DROPBOX_SHARE_ENABLED = !DROPBOX_APP_REFRESH_TOKEN.startsWith('YOUR_');

  // 快取「app 層級」的 Dropbox access token（跟使用者自己連結 Dropbox 的 session token 分開存放，避免互相覆蓋）
  let appDropboxRefreshPromise = null;
  function getCachedAppDropboxAccessToken() {
    const token = sessionStorage.getItem('dropbox_app_access_token');
    const expiresAt = parseInt(sessionStorage.getItem('dropbox_app_token_expires_at') || '0', 10);
    if (token && Date.now() < expiresAt - 60000) return token;
    return null;
  }
  async function getValidAppDropboxAccessToken() {
    if (!DROPBOX_SHARE_ENABLED) return null;
    const cached = getCachedAppDropboxAccessToken();
    if (cached) return cached;
    if (appDropboxRefreshPromise) return appDropboxRefreshPromise;

    appDropboxRefreshPromise = (async () => {
      try {
        const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: DROPBOX_APP_REFRESH_TOKEN,
            client_id: DROPBOX_APP_KEY
          })
        });
        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          console.error(`[Dropbox] App 層級 token 換發失敗 (HTTP ${res.status}):`, errText);
          return null;
        }
        const data = await res.json();
        sessionStorage.setItem('dropbox_app_access_token', data.access_token);
        sessionStorage.setItem('dropbox_app_token_expires_at', String(Date.now() + (data.expires_in || 14400) * 1000));
        return data.access_token;
      } catch (err) {
        console.error('[Dropbox] App 層級 token 換發時發生例外:', err);
        return null;
      }
    })();

    try {
      return await appDropboxRefreshPromise;
    } finally {
      appDropboxRefreshPromise = null;
    }
  }

  // 逾時保護：避免網路異常或請求卡住時，畫面看起來像凍結一樣沒有反應
  function withTimeout(promise, ms, fallbackValue){
    return Promise.race([
      promise,
      new Promise(resolve => setTimeout(() => {
        console.warn(`操作超過 ${ms}ms 未回應，改用預設值繼續執行`);
        resolve(fallbackValue);
      }, ms))
    ]);
  }

  // ---- 端到端加密（Web Crypto AES-GCM）工具組 ----
  function bytesToBase64Url(bytes){
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function base64UrlToBytes(b64url){
    let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  async function generateAESKey(){
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    const raw = new Uint8Array(await crypto.subtle.exportKey('raw', key));
    return { key, base64: bytesToBase64Url(raw) };
  }
  async function importAESKey(base64Key){
    const raw = base64UrlToBytes(base64Key);
    return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  }
  // 回傳 Uint8Array：前 12 bytes 是隨機 IV，後面接密文
  async function encryptJSON(obj, key){
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = new TextEncoder().encode(JSON.stringify(obj));
    const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
    const combined = new Uint8Array(iv.length + cipherBuf.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(cipherBuf), iv.length);
    return combined;
  }
  async function decryptJSON(bytes, key){
    const iv = bytes.slice(0, 12);
    const cipher = bytes.slice(12);
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
    return JSON.parse(new TextDecoder().decode(plainBuf));
  }

  function typeLabel(type){ const t = T().recordModal; return { lab:t.typeLab, med:t.typeMed, img:t.typeImg, visit:t.typeVisit }[type] || t.recordFallbackLabel; }
  const TYPE_ICON = {
    lab: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2v6L4 20a1 1 0 0 0 .9 1.5h14.2A1 1 0 0 0 20 20l-5-12V2"/><line x1="9" y1="2" x2="15" y2="2"/></svg>',
    med: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12h8M12 8v8"/></svg>',
    img: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
    visit: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
  };

  let currentConfig = {};
  let activeFilter = 'all';
  const photoUrlCache = new Map();
  let currentDisplayName = T().misc.defaultUserName;
  let currentInitial = T().misc.defaultUserInitial;
  let currentGooglePhotoURL = '';
  let currentUserUid = '';
  let currentUserEmail = '';

  const FILE_NAME = 'logvita_config.json';
  const APP_FOLDER_NAME = '健康庫 LogVita';
  const DROPBOX_APP_KEY = '9g6nfv9vs6jdbk2'; // 請保持替換為您的 Dropbox App Key

  // ---- Dropbox OAuth 2.0 with PKCE + refresh token ----
  // 舊版 response_type=token（implicit grant）只會拿到活幾小時、無法更新的 access token，
  // 過期後只能整個重新跳出彈窗連結。改用 Authorization Code + PKCE + token_access_type=offline，
  // 可以換到一組長效的 refresh token，之後就能在背景自動換發新的 access token，不必使用者重新登入。
  function base64UrlEncode(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function generateCodeVerifier() {
    const bytes = crypto.getRandomValues(new Uint8Array(64));
    return base64UrlEncode(bytes);
  }

  async function generateCodeChallenge(verifier) {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(new Uint8Array(digest));
  }

  // sessionStorage 存放本次 session 用的 access token 與到期時間；Firestore 存放長效的 refresh token
  let dropboxRefreshPromise = null; // 避免同一時間多個請求同時觸發重複換發

  function getCachedDropboxAccessToken() {
    const token = sessionStorage.getItem('dropbox_access_token');
    const expiresAt = parseInt(sessionStorage.getItem('dropbox_token_expires_at') || '0', 10);
    if (token && Date.now() < expiresAt - 60000) return token; // 提前 60 秒視為即將到期，主動換發
    return null;
  }

  function cacheDropboxAccessToken(accessToken, expiresInSeconds) {
    sessionStorage.setItem('dropbox_access_token', accessToken);
    sessionStorage.setItem('dropbox_token_expires_at', String(Date.now() + (expiresInSeconds || 14400) * 1000));
  }

  // 用 refresh token 換一組新的 access token（PKCE 流程換來的 refresh token 不需要 client secret）
  async function refreshDropboxAccessToken(refreshToken) {
    try {
      const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: DROPBOX_APP_KEY
        })
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error(`[Dropbox] refresh token 換發失敗 (HTTP ${res.status}):`, errText);
        return null;
      }
      const data = await res.json();
      cacheDropboxAccessToken(data.access_token, data.expires_in);
      return data.access_token;
    } catch (err) {
      console.error('[Dropbox] refresh token 換發時發生例外:', err);
      return null;
    }
  }

  // 所有需要呼叫 Dropbox API 的地方都應該透過這個函式取得目前有效的 access token，
  // 而不是直接讀 sessionStorage —— 它會自動判斷是否過期並在背景換發新的 token。
  async function getValidDropboxAccessToken() {
    const cached = getCachedDropboxAccessToken();
    if (cached) return cached;

    const user = auth.currentUser;
    if (!user) return null;

    // 用同一個 in-flight Promise，避免短時間內多個 API 呼叫同時觸發多次換發
    if (dropboxRefreshPromise) return dropboxRefreshPromise;

    dropboxRefreshPromise = (async () => {
      const refreshToken = sessionStorage.getItem('dropbox_refresh_token')
        || await getDropboxRefreshTokenFromFirestore(user.uid);
      if (!refreshToken) return null;
      sessionStorage.setItem('dropbox_refresh_token', refreshToken);
      return await refreshDropboxAccessToken(refreshToken);
    })();

    try {
      return await dropboxRefreshPromise;
    } finally {
      dropboxRefreshPromise = null;
    }
  }

  // 1. 真實裝置與國家判斷
  function detectDeviceType() {
    const ua = navigator.userAgent;
    const d = T().device;
    if (/iPhone|iPad|iPod/i.test(ua)) return d.iphone;
    if (/Android/i.test(ua)) return d.android;
    if (/Windows/i.test(ua)) return d.windows;
    if (/Macintosh/i.test(ua)) return d.mac;
    if (/Linux/i.test(ua)) return d.linux;
    return d.generic;
  }

  function detectBrowserName() {
    const ua = navigator.userAgent;
    if (/Edg\//i.test(ua)) return 'Edge';
    if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return 'Opera';
    if (/CriOS/i.test(ua)) return 'Chrome';
    if (/FxiOS/i.test(ua)) return 'Firefox';
    if (/Firefox\//i.test(ua)) return 'Firefox';
    if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return 'Chrome';
    if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return 'Safari';
    return '';
  }

  function detectDeviceLabel() {
    const type = detectDeviceType();
    const browser = detectBrowserName();
    return browser ? `${type} · ${browser}` : type;
  }

  function detectCountry() {
    const c = T().country;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (tz.includes("Taipei")) return c.taiwan;
      if (tz.includes("Tokyo")) return c.japan;
      if (tz.includes("Seoul")) return c.korea;
      if (tz.includes("Shanghai") || tz.includes("Chongqing")) return c.china;
      if (tz.includes("Hong_Kong")) return c.hongkong;
      if (tz.includes("America")) return c.usa;
      return c.local;
    } catch {
      return c.unknown;
    }
  }

  // ---- 裝置追蹤（多裝置登入清單，即時同步、可從其他裝置遠端登出）----
  const SESSION_ID_STORAGE_KEY = 'healthkeep-session-id';
  const SESSION_STALE_DAYS = 30;

  let currentSessionId = null;
  let sessionsUnsubscribe = null;
  let sessionHeartbeatTimer = null;
  let lastKnownSessions = null;
  let lastKnownSessionsUid = null;

  function getOrCreateLocalSessionId(){
    let id = localStorage.getItem(SESSION_ID_STORAGE_KEY);
    if (!id) {
      id = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : ('sess-' + Date.now() + '-' + Math.random().toString(36).slice(2));
      localStorage.setItem(SESSION_ID_STORAGE_KEY, id);
    }
    return id;
  }

  async function registerCurrentSession(uid){
    currentSessionId = getOrCreateLocalSessionId();
    const userRef = doc(db, 'users', uid);
    const nowIso = new Date().toISOString();
    try {
      const snap = await getDoc(userRef);
      const existing = snap.exists() ? (snap.data().sessions || {})[currentSessionId] : null;
      await setDoc(userRef, {
        [`sessions.${currentSessionId}`]: {
          deviceLabel: detectDeviceLabel(),
          country: detectCountry(),
          lastActiveAt: nowIso,
          createdAt: (existing && existing.createdAt) || nowIso
        }
      }, { merge: true });
    } catch (err) {
      console.error('登記登入裝置失敗:', err);
    }
  }

  async function updateSessionHeartbeat(uid){
    if (!currentSessionId) return;
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, { [`sessions.${currentSessionId}.lastActiveAt`]: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.error('更新裝置活動時間失敗:', err);
    }
  }

  function startSessionHeartbeat(uid){
    stopSessionHeartbeat();
    sessionHeartbeatTimer = setInterval(() => {
      if (document.visibilityState === 'visible') updateSessionHeartbeat(uid);
    }, 120000); // 每 2 分鐘更新一次「最後活動」時間
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') updateSessionHeartbeat(uid);
    });
  }
  function stopSessionHeartbeat(){
    if (sessionHeartbeatTimer) { clearInterval(sessionHeartbeatTimer); sessionHeartbeatTimer = null; }
  }

  function watchSessions(uid){
    const userRef = doc(db, 'users', uid);
    if (sessionsUnsubscribe) sessionsUnsubscribe();
    sessionsUnsubscribe = onSnapshot(userRef, (snap) => {
      const sessions = snap.exists() ? (snap.data().sessions || {}) : {};
      lastKnownSessions = sessions;
      lastKnownSessionsUid = uid;
      if (currentSessionId && !sessions[currentSessionId]) {
        // 這台裝置的登入狀態已被從別台裝置遠端登出
        forceLocalLogout();
        return;
      }
      renderSessionList(sessions, uid);
    }, (err) => {
      console.error('監聽裝置清單失敗:', err);
    });
  }

  function formatRelativeTime(isoStr){
    const s = T().security;
    const then = new Date(isoStr).getTime();
    if (isNaN(then)) return s.justNow;
    const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
    if (diffSec < 60) return s.justNow;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return s.minutesAgo(diffMin);
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return s.hoursAgo(diffHour);
    const diffDay = Math.floor(diffHour / 24);
    return s.daysAgo(diffDay);
  }

  function renderSessionList(sessions, uid){
    const container = document.getElementById('session-container');
    const countLabelEl = document.getElementById('device-count-label');
    if (!container) return;
    const s = T().security;

    // 順手清掉太久沒活動的裝置紀錄（best-effort，不阻塞畫面渲染）
    const staleCutoff = Date.now() - SESSION_STALE_DAYS * 24 * 60 * 60 * 1000;
    const staleIds = Object.keys(sessions).filter(id => id !== currentSessionId && new Date(sessions[id].lastActiveAt).getTime() < staleCutoff);
    if (staleIds.length > 0) {
      const userRef = doc(db, 'users', uid);
      const cleanup = {};
      staleIds.forEach(id => { cleanup[`sessions.${id}`] = deleteField(); });
      setDoc(userRef, cleanup, { merge: true }).catch(err => console.warn('清理過期裝置紀錄失敗:', err));
    }

    const entries = Object.entries(sessions)
      .filter(([id]) => !staleIds.includes(id))
      .sort((a, b) => new Date(b[1].lastActiveAt) - new Date(a[1].lastActiveAt));

    if (countLabelEl) countLabelEl.textContent = s.deviceCountLabel(entries.length || 1);

    if (entries.length === 0) {
      container.innerHTML = `<div class="session-item"><div class="meta"><div class="device">${escapeHtml(s.detecting)}</div></div></div>`;
      return;
    }

    container.innerHTML = entries.map(([id, sess]) => {
      const isCurrent = id === currentSessionId;
      const deviceLabel = sess.deviceLabel || T().device.generic;
      const country = sess.country || T().country.unknown;
      return `
        <div class="session-item" data-session-id="${escapeHtml(id)}">
          <div class="meta">
            <div class="device">${escapeHtml(deviceLabel)}</div>
            <div class="loc">${escapeHtml(country)} · ${escapeHtml(s.lastActiveLabel)}${escapeHtml(formatRelativeTime(sess.lastActiveAt))}</div>
          </div>
          ${isCurrent ? `<span class="badge-current">${escapeHtml(s.currentDeviceBadge)}</span>` : ''}
          <button type="button" class="btn-ghost session-logout-btn" style="margin-left: 8px;" data-session-id="${escapeHtml(id)}">${escapeHtml(s.deviceLogout)}</button>
        </div>`;
    }).join('');

    container.querySelectorAll('.session-logout-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.sessionId;
        if (id === currentSessionId) {
          await handleLogout();
          return;
        }
        if (!(await showConfirmDialog(T().security.removeDeviceConfirmMsg, T().security.removeDeviceConfirmTitle))) return;
        try {
          const userRef = doc(db, 'users', uid);
          await setDoc(userRef, { [`sessions.${id}`]: deleteField() }, { merge: true });
          showToast(T().security.deviceRemovedToast);
        } catch (err) {
          console.error('登出裝置失敗:', err);
          showToast(T().security.deviceRemoveFailedToast);
        }
      });
    });
  }

  async function forceLocalLogout(){
    stopSessionHeartbeat();
    if (sessionsUnsubscribe) { sessionsUnsubscribe(); sessionsUnsubscribe = null; }
    sessionStorage.removeItem('drive_access_token');
    sessionStorage.removeItem('dropbox_access_token');
    sessionStorage.removeItem('dropbox_token_expires_at');
    sessionStorage.removeItem('dropbox_refresh_token');
    sessionStorage.removeItem('dropbox_pkce_verifier');
    try { await signOut(auth); } catch {}
    window.location.href = 'index.html';
  }

  // 更新裝置資訊卡片標題等靜態文字（實際裝置清單由 renderSessionList 處理）
  function renderDeviceInfo(){
    if (lastKnownSessions) {
      renderSessionList(lastKnownSessions, lastKnownSessionsUid);
    }
  }

  // 2. 切換 Panel 頁籤
  const navButtons = document.querySelectorAll('.nav button[data-panel]');
  function switchToPanel(name){
    navButtons.forEach(b => b.classList.toggle('active', b.dataset.panel === name));
    document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + name));
    if (name === 'shared') loadSharedWithMe();
    if (name === 'idcard') renderIdCard();
  }
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => switchToPanel(btn.dataset.panel));
  });

  // 語言切換器
  const languageSelect = document.getElementById('language-select');
  if (languageSelect) languageSelect.addEventListener('change', (e) => applyLanguage(e.target.value));
  applyLanguage(currentLanguage);

  // 個人資料卡：齒輪／按鈕跳轉至個人檔案編輯頁
  const idCardGearBtn = document.getElementById('id-card-gear');
  if (idCardGearBtn) idCardGearBtn.addEventListener('click', (e) => { e.stopPropagation(); switchToPanel('profile'); });
  const idCardEditBtn = document.getElementById('idcard-edit-btn');
  if (idCardEditBtn) idCardEditBtn.addEventListener('click', () => switchToPanel('profile'));

  // 個人資料卡：滑鼠移動時 3D 傾斜 + 光澤反光效果
  (function initIdCardTilt(){
    const card = document.getElementById('id-card');
    if (!card) return;
    const maxTilt = 10;

    function applyTilt(clientX, clientY){
      const rect = card.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
      const rotateY = (x - 0.5) * maxTilt * 2;
      const rotateX = (0.5 - y) * maxTilt * 2;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.classList.add('tilting');
    }
    function resetTilt(){
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
      card.classList.remove('tilting');
    }

    card.addEventListener('mousemove', (e) => applyTilt(e.clientX, e.clientY));
    card.addEventListener('mouseleave', resetTilt);
    card.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (t) applyTilt(t.clientX, t.clientY);
    }, { passive: true });
    card.addEventListener('touchend', resetTilt);
  })();

  // 互斥控制：避免重複連結兩者
  function updateStorageConnectionUI(activeProvider) {
    const itemGoogle = document.getElementById('item-google');
    const itemDropbox = document.getElementById('item-dropbox');
    const btnGoogle = document.getElementById('connect-google-btn');
    const btnDropbox = document.getElementById('connect-dropbox-btn');

    const s = T().security;
    if (activeProvider === 'dropbox') {
      // 連結 Dropbox 時：啟用 Dropbox、反黑停用 Google
      itemDropbox.classList.remove('disabled-item');
      btnDropbox.disabled = false;
      btnDropbox.textContent = s.connected;

      itemGoogle.classList.add('disabled-item');
      btnGoogle.disabled = true;
      btnGoogle.textContent = s.disabledUsingDropbox;
    } else if (activeProvider === 'google') {
      // 連結 Google 時：啟用 Google、反黑停用 Dropbox
      itemGoogle.classList.remove('disabled-item');
      btnGoogle.disabled = false;
      btnGoogle.textContent = s.connected;

      itemDropbox.classList.add('disabled-item');
      btnDropbox.disabled = true;
      btnDropbox.textContent = s.disabledUsingGoogle;
    } else {
      // 兩者皆未連結 (如用 Email 登入)
      itemGoogle.classList.remove('disabled-item');
      btnGoogle.disabled = false;
      btnGoogle.textContent = s.connectGoogle;

      itemDropbox.classList.remove('disabled-item');
      btnDropbox.disabled = false;
      btnDropbox.textContent = s.connectDropbox;
    }
  }

  // 3. Auth 狀態變更監聽與跨裝置 Token 同步
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentDisplayName = user.displayName || T().misc.defaultUserName;
      currentInitial = currentDisplayName.charAt(0).toUpperCase();
      currentGooglePhotoURL = user.photoURL || '';
      currentUserUid = user.uid;
      currentUserEmail = (user.email || '').toLowerCase();
      refreshAvatarDisplay();

      document.getElementById('user-name').textContent = currentDisplayName;
      document.getElementById('user-email').textContent = user.email || '';
      document.getElementById('p-name').value = currentDisplayName;

      // 裝置追蹤：登記本裝置的登入 session、開始心跳更新，並即時監聽所有裝置清單
      await registerCurrentSession(user.uid);
      startSessionHeartbeat(user.uid);
      watchSessions(user.uid);

      try {
        // 檢查網頁網址是否剛好為 Dropbox OAuth 回傳畫面（Authorization Code + PKCE 流程用 query string 帶 code 回來，不是舊版的 hash）
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get('code');
        const oauthError = urlParams.get('error');

        if (oauthError) {
          console.warn('Dropbox 授權被拒絕或取消:', oauthError);
          window.history.replaceState({}, document.title, window.location.pathname);
          if (window.opener && window.opener !== window) { window.close(); return; }
        }

        if (authCode) {
          const codeVerifier = sessionStorage.getItem('dropbox_pkce_verifier');
          const redirectUri = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, window.location.pathname);

          if (codeVerifier) {
            const tokens = await exchangeDropboxCodeForTokens(authCode, codeVerifier, redirectUri);
            sessionStorage.removeItem('dropbox_pkce_verifier');

            if (tokens && tokens.access_token) {
              if (tokens.refresh_token) {
                // 只有第一次授權（或使用者在 Dropbox 端撤銷後重新授權）才會拿到 refresh_token，要存進 Firestore 才能跨裝置、跨 session 使用
                await withTimeout(saveDropboxTokenToFirestore(user.uid, tokens.refresh_token), 8000, null);
                sessionStorage.setItem('dropbox_refresh_token', tokens.refresh_token);
              }
              cacheDropboxAccessToken(tokens.access_token, tokens.expires_in);

              // 這個畫面如果是「連結 Dropbox」彈出的子視窗，就把金鑰傳回主視窗後直接關閉自己，
              // 不需要在子視窗裡也跑一次完整的資料載入流程
              if (window.opener && window.opener !== window) {
                window.opener.postMessage({ type: 'dropbox-oauth-success', token: tokens.access_token, expiresIn: tokens.expires_in }, window.location.origin);
                window.close();
                return;
              }
            } else {
              showToast(T().cloud.dropboxAuthFailedToast);
            }
          } else {
            console.error('找不到 PKCE code_verifier，可能是在不同的分頁/裝置完成授權導致的');
          }
        }

        // 判斷雲端硬碟連結狀態（getValidDropboxAccessToken 會自動處理：目前 session 是否已有未過期的 access token、
        // 沒有的話用 Firestore 存的 refresh token 換一組新的 —— 不會像以前一樣直接把舊 token 硬塞進去用）
        const dropboxToken = await withTimeout(getValidDropboxAccessToken(), 8000, null);
        const driveToken = getAccessToken();

        if (dropboxToken) {
          document.getElementById('dropbox-status').textContent = T().security.connected;
          document.getElementById('google-auth-email').textContent = T().security.notConnected;
          updateStorageConnectionUI('dropbox');
          showLoadingToast(T().cloud.loadingDropboxToast);
          await withTimeout(loadFromDropbox(), 15000, null);
        } else if (driveToken) {
          document.getElementById('google-auth-email').textContent = `${user.email} · ${T().security.connected}`;
          document.getElementById('dropbox-status').textContent = T().security.notConnected;
          updateStorageConnectionUI('google');
          showLoadingToast(T().cloud.loadingDriveToast);
          await withTimeout(loadFromDrive(), 15000, null);
        } else {
          document.getElementById('google-auth-email').textContent = T().security.notConnected;
          document.getElementById('dropbox-status').textContent = T().security.notConnected;
          updateStorageConnectionUI(null);
          // 若 Firestore 裡曾經存過 refresh token，但剛剛換發新 access token 失敗，代表使用者可能在 Dropbox 端撤銷了授權
          const hadRefreshToken = await withTimeout(getDropboxRefreshTokenFromFirestore(user.uid), 8000, null);
          if (hadRefreshToken) {
            showToast(T().cloud.dropboxDisconnectedToast);
          }
        }
      } catch (err) {
        console.error('登入初始化流程發生非預期錯誤:', err);
        showToast(T().cloud.loadErrorToast);
      } finally {
        // 無論上面流程是否順利完成，都確保畫面一定會渲染出來、載入提示一定會關閉，
        // 避免因網路異常或未預期錯誤讓整個頁面看起來像卡死一樣沒有反應
        hideLoadingToast();
        renderOverview();
        renderRecordList();
        renderAccessList();
        handleIncomingShareLink();
        checkPendingInvites();
      }
    } else {
      window.location.href = 'index.html';
    }
  });

  // Google Drive 手動授權連結 (供 Email 登入者使用)
  document.getElementById('connect-google-btn').addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential && credential.accessToken) {
        sessionStorage.setItem('drive_access_token', credential.accessToken);
        document.getElementById('google-auth-email').textContent = `${result.user.email} · ${T().security.connected}`;
        updateStorageConnectionUI('google');
        showLoadingToast(T().cloud.loadingDriveToast);
        await loadFromDrive();
      }
    } catch (err) {
      console.error('Google Drive 連結失敗:', err);
      showToast(T().cloud.driveAuthFailedToast);
    }
  });

  // 4. Firestore 工具組
  async function saveDropboxTokenToFirestore(uid, refreshToken) {
    try {
      const userRef = doc(db, 'users', uid);
      // 只存 refresh token（長效）；access token 只留在 sessionStorage，不必也不該存進資料庫
      await setDoc(userRef, { dropboxRefreshToken: refreshToken, dropboxToken: null }, { merge: true });
      showToast(T().cloud.dropboxConnectedCrossDeviceToast);
    } catch (err) {
      console.error("寫入 Firestore 失敗:", err);
    }
  }

  async function getDropboxRefreshTokenFromFirestore(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists() && docSnap.data().dropboxRefreshToken) {
        return docSnap.data().dropboxRefreshToken;
      }
    } catch (err) {
      console.error("讀取 Firestore 失敗:", err);
    }
    return null;
  }

  // 5. Google Drive REST API 工具組
  function getAccessToken() {
    return sessionStorage.getItem('drive_access_token');
  }

  let driveFolderIdCache = null;

  async function getOrCreateDriveFolderId() {
    const token = getAccessToken();
    if (!token) return null;
    if (driveFolderIdCache) return driveFolderIdCache;

    try {
      const q = encodeURIComponent(
        `name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
      );
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        driveFolderIdCache = data.files[0].id;
        return driveFolderIdCache;
      }

      const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: APP_FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' })
      });
      const created = await createRes.json();
      driveFolderIdCache = created.id || null;
      return driveFolderIdCache;
    } catch (err) {
      console.error('建立/取得 Drive 資料夾失敗:', err);
      return null;
    }
  }

  async function findDriveFileId() {
    const token = getAccessToken();
    if (!token) return null;

    const folderId = await getOrCreateDriveFolderId();
    if (!folderId) return null;

    try {
      const q = encodeURIComponent(
        `name='${FILE_NAME}' and trashed=false and '${folderId}' in parents`
      );
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${q}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      return (data.files && data.files.length > 0) ? data.files[0].id : null;
    } catch (err) {
      console.error('搜尋 Drive 檔案失敗:', err);
      return null;
    }
  }

  // ---- 雲端連線逾時偵測 ----
  let driveTokenExpired = false;
  let dropboxTokenExpired = false;

  async function loadFromDrive() {
    const token = getAccessToken();
    if (!token) { hideLoadingToast(); return; }

    const fileId = await findDriveFileId();
    if (!fileId) { renderOverview(); renderRecordList(); renderAccessList(); hideLoadingToast(); return; }

    try {
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 401) {
        console.warn('Google Drive 存取權杖已逾時');
        sessionStorage.removeItem('drive_access_token');
        driveTokenExpired = true;
        await checkCloudSessionExpiry();
        return;
      }
      const config = await res.json();

      applyConfigToForm(config);
      showToast(T().cloud.driveLoadedToast);
    } catch (err) {
      console.error('載入 Drive 內容失敗:', err);
      hideLoadingToast();
    }
  }

  async function saveToDrive(dataPayload) {
    const token = getAccessToken();
    if (!token) return false;

    const folderId = await getOrCreateDriveFolderId();
    const fileId = await findDriveFileId();
    const metadata = { name: FILE_NAME, mimeType: 'application/json' };
    if (!fileId && folderId) metadata.parents = [folderId];
    const file = new Blob([JSON.stringify(dataPayload)], { type: 'application/json' });

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    let method = 'POST';

    if (fileId) {
      url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
      method = 'PATCH';
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.status === 401) {
        console.warn('Google Drive 存取權杖已逾時');
        sessionStorage.removeItem('drive_access_token');
        driveTokenExpired = true;
        return false;
      }

      return res.ok;
    } catch (err) {
      console.error('上傳至 Drive 失敗:', err);
      return false;
    }
  }

  // 6. Dropbox API 工具組
  // 完成 Dropbox 連結後的收尾動作（更新畫面、載入資料），供 postMessage 與輪詢備援共用
  async function finishDropboxConnect(accessToken, expiresIn) {
    if (sessionStorage.getItem('dropbox_access_token') === accessToken) return; // 已經處理過，避免重複執行
    cacheDropboxAccessToken(accessToken, expiresIn);
    document.getElementById('dropbox-status').textContent = T().security.connected;
    document.getElementById('google-auth-email').textContent = T().security.notConnected;
    updateStorageConnectionUI('dropbox');
    showLoadingToast(T().cloud.loadingDropboxToast);
    await withTimeout(loadFromDropbox(), 15000, null);
    hideLoadingToast();
    renderOverview();
    renderRecordList();
    renderAccessList();
    showToast(T().cloud.dropboxConnectedToast);
  }

  function connectDropbox() {
    const redirectUri = window.location.origin + window.location.pathname;
    const codeVerifier = generateCodeVerifier();
    // code_verifier 存在 sessionStorage：window.open() 開出的同源彈出視窗會複製一份當下的 sessionStorage，
    // 所以彈出視窗裡也讀得到這個值，用來在換發 token 時證明「我就是發起授權請求的那個人」
    sessionStorage.setItem('dropbox_pkce_verifier', codeVerifier);

    generateCodeChallenge(codeVerifier).then((codeChallenge) => {
      const authUrl = `https://www.dropbox.com/oauth2/authorize?` +
        `client_id=${DROPBOX_APP_KEY}&` +
        `response_type=code&` +
        `code_challenge=${codeChallenge}&` +
        `code_challenge_method=S256&` +
        `token_access_type=offline&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}`;

      const popup = window.open(authUrl, 'ConnectDropbox', 'width=500,height=600');
      if (!popup) {
        showToast(T().cloud.popupBlockedToast);
        return;
      }

      // 備援機制：不依賴 postMessage（部分瀏覽器對跨網域彈出視窗的 window.opener 限制較嚴格），
      // 改為偵測彈出視窗是否已關閉，關閉後主動向 Firestore 查詢一次是否已連結成功
      const pollTimer = setInterval(async () => {
        let closed = false;
        try { closed = popup.closed; } catch { closed = true; }
        if (!closed) return;

        clearInterval(pollTimer);
        const user = auth.currentUser;
        if (!user) return;
        const refreshToken = await withTimeout(getDropboxRefreshTokenFromFirestore(user.uid), 8000, null);
        if (refreshToken && !sessionStorage.getItem('dropbox_access_token')) {
          sessionStorage.setItem('dropbox_refresh_token', refreshToken);
          const accessToken = await refreshDropboxAccessToken(refreshToken);
          if (accessToken) await finishDropboxConnect(accessToken);
        } else if (!refreshToken) {
          console.warn('彈出視窗已關閉，但尚未查到 Dropbox 權杖（可能使用者取消了授權）');
        }
      }, 800);
    });
  }

  // 用授權碼（authorization code）換一組 access token + refresh token（PKCE 流程不需要 client secret）
  async function exchangeDropboxCodeForTokens(code, codeVerifier, redirectUri) {
    try {
      const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          client_id: DROPBOX_APP_KEY,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier
        })
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error(`[Dropbox] 授權碼換發 token 失敗 (HTTP ${res.status}):`, errText);
        return null;
      }
      return await res.json(); // { access_token, refresh_token, expires_in, ... }
    } catch (err) {
      console.error('[Dropbox] 授權碼換發 token 時發生例外:', err);
      return null;
    }
  }


  // 接收「連結 Dropbox」彈出視窗傳回的金鑰，完成連結流程（不需要重新整理主視窗）
  window.addEventListener('message', async (event) => {
    if (event.origin !== window.location.origin) return;
    if (!event.data || event.data.type !== 'dropbox-oauth-success' || !event.data.token) return;
    await finishDropboxConnect(event.data.token, event.data.expiresIn);
  });

  // HTTP header 只允許 ISO-8859-1 字元，但 APP_FOLDER_NAME 含中文（例如「健康庫 LogVita」），
  // 若直接把中文路徑塞進 Dropbox-API-Arg header 會讓 fetch() 直接丟出例外（連請求都送不出去）。
  // Dropbox API 官方建議做法：JSON.stringify 後，把非 ASCII 字元轉成 \uXXXX escape 再放進 header。
  function dropboxApiArg(obj) {
    return JSON.stringify(obj).replace(/[\u007f-\uffff]/g, (c) =>
      '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4)
    );
  }

  async function saveToDropbox(dataPayload) {
    const user = auth.currentUser;
    if (!user) return false;

    let token = await getValidDropboxAccessToken();
    if (!token) return false;

    try {
      let res = await fetch('https://content.dropboxapi.com/2/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Dropbox-API-Arg': dropboxApiArg({
            path: `/${APP_FOLDER_NAME}/${FILE_NAME}`,
            mode: 'overwrite',
            autorename: false,
            mute: false
          }),
          'Content-Type': 'application/octet-stream'
        },
        body: JSON.stringify(dataPayload)
      });

      if (res.status === 401) {
        // access token 可能已經失效（例如手動撤銷），清快取後強制重新換發一次再試一次，避免因為快取的舊 token 誤判成整個連線逾時
        console.warn('Dropbox access token 被拒絕，嘗試強制換發後重試一次');
        sessionStorage.removeItem('dropbox_access_token');
        sessionStorage.removeItem('dropbox_token_expires_at');
        token = await getValidDropboxAccessToken();
        if (!token) { dropboxTokenExpired = true; return false; }

        res = await fetch('https://content.dropboxapi.com/2/files/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Dropbox-API-Arg': dropboxApiArg({
              path: `/${APP_FOLDER_NAME}/${FILE_NAME}`,
              mode: 'overwrite',
              autorename: false,
              mute: false
            }),
            'Content-Type': 'application/octet-stream'
          },
          body: JSON.stringify(dataPayload)
        });
        if (res.status === 401) { dropboxTokenExpired = true; return false; }
      }

      return res.ok;
    } catch (err) {
      console.error('Dropbox 上傳失敗:', err);
      return false;
    }
  }

  async function loadFromDropbox() {
    const user = auth.currentUser;
    if (!user) { hideLoadingToast(); return; }

    let token = await getValidDropboxAccessToken();
    if (!token) { hideLoadingToast(); return; }

    try {
      let res = await fetch('https://content.dropboxapi.com/2/files/download', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Dropbox-API-Arg': dropboxApiArg({ path: `/${APP_FOLDER_NAME}/${FILE_NAME}` })
        }
      });

      if (res.status === 401) {
        console.warn('Dropbox access token 被拒絕，嘗試強制換發後重試一次');
        sessionStorage.removeItem('dropbox_access_token');
        sessionStorage.removeItem('dropbox_token_expires_at');
        token = await getValidDropboxAccessToken();
        if (!token) {
          dropboxTokenExpired = true;
          await checkCloudSessionExpiry();
          return;
        }
        res = await fetch('https://content.dropboxapi.com/2/files/download', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Dropbox-API-Arg': dropboxApiArg({ path: `/${APP_FOLDER_NAME}/${FILE_NAME}` })
          }
        });
        if (res.status === 401) {
          dropboxTokenExpired = true;
          await checkCloudSessionExpiry();
          return;
        }
      }

      if (res.ok) {
        const config = await res.json();
        applyConfigToForm(config);
        showToast(T().cloud.dropboxLoadedToast);
      } else {
        renderOverview();
        renderRecordList();
        renderAccessList();
        hideLoadingToast();
      }
    } catch (err) {
      console.error('Dropbox 載入失敗:', err);
      renderOverview();
      renderRecordList();
      renderAccessList();
      hideLoadingToast();
    }
  }

  // 儲存資料到雲端（Drive + Dropbox 雙重備援），並在偵測到權杖逾時時確保後續流程正確處理
  async function syncConfigToCloud(config) {
    const driveSuccess = await saveToDrive(config);
    const dropboxSuccess = await saveToDropbox(config);
    await checkCloudSessionExpiry();
    return { driveSuccess, dropboxSuccess };
  }

  // 偵測到雲端權杖逾時時的處理：因為 Google Drive 與 Dropbox 是互斥的（同一時間只能連結其中一種），
  // 一旦目前連結的那個雲端硬碟權杖逾時，代表資料已經無法再同步，為避免使用者誤以為資料仍持續備份，
  // 強制登出並要求重新登入、重新連結雲端硬碟
  async function checkCloudSessionExpiry() {
    if (!driveTokenExpired && !dropboxTokenExpired) return;

    driveTokenExpired = false;
    dropboxTokenExpired = false;
    showToast(T().cloud.timeoutToast);
    setTimeout(async () => {
      try { await signOut(auth); } catch (err) { console.error('登出失敗:', err); }
      window.location.href = 'index.html';
    }, 1800);
  }

  // ---- 照片檔案工具組（上傳為獨立雲端檔案，JSON 中僅存參照） ----
  function getFileExtension(file) {
    const parts = (file.name || '').split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : 'jpg';
  }

  // 圖片壓縮：超過門檻大小的圖片會先縮小尺寸／降低品質再上傳，避免上傳失敗或占用過多雲端空間
  const PHOTO_COMPRESS_THRESHOLD = 2.5 * 1024 * 1024; // 超過此大小才進行壓縮
  const PHOTO_MAX_DIMENSION = 1920;                    // 長邊最大像素
  const PHOTO_TARGET_SIZE = 2 * 1024 * 1024;           // 壓縮目標大小
  const PHOTO_MAX_UPLOAD_SIZE = 8 * 1024 * 1024;       // 壓縮後仍不可超過的硬上限

  function loadImageSource(file) {
    if (typeof createImageBitmap === 'function') {
      return createImageBitmap(file).catch(() => loadImageViaElement(file));
    }
    return loadImageViaElement(file);
  }

  function loadImageViaElement(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
      img.src = url;
    });
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise(resolve => canvas.toBlob(resolve, type, quality));
  }

  async function compressImageFile(file, {
    maxDimension = PHOTO_MAX_DIMENSION,
    targetSize = PHOTO_TARGET_SIZE,
    initialQuality = 0.85,
    minQuality = 0.5
  } = {}) {
    // 動態 GIF 重新編碼會失去動畫效果，維持原檔
    if (file.type === 'image/gif') return file;
    try {
      const source = await loadImageSource(file);
      let width = source.width || source.naturalWidth;
      let height = source.height || source.naturalHeight;
      if (!width || !height) return file;

      if (width > maxDimension || height > maxDimension) {
        const scale = maxDimension / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(source, 0, 0, width, height);
      if (typeof source.close === 'function') source.close();

      let quality = initialQuality;
      let blob = await canvasToBlob(canvas, 'image/jpeg', quality);
      while (blob && blob.size > targetSize && quality > minQuality) {
        quality = Math.max(minQuality, quality - 0.1);
        blob = await canvasToBlob(canvas, 'image/jpeg', quality);
        if (quality <= minQuality) break;
      }
      if (!blob) return file;

      const newName = (file.name || 'photo').replace(/\.[^.]+$/, '') + '.jpg';
      return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() });
    } catch (err) {
      console.warn('圖片壓縮失敗，將嘗試使用原始檔案上傳:', err);
      return file;
    }
  }

  // 統一入口：必要時壓縮圖片，回傳最終可上傳的檔案；若仍超過硬上限則回傳 null
  async function prepareImageForUpload(file) {
    if (file.size <= PHOTO_COMPRESS_THRESHOLD) return file;
    const compressed = await compressImageFile(file);
    if (compressed.size > PHOTO_MAX_UPLOAD_SIZE) return null;
    return compressed;
  }

  async function uploadPhotoFile(file, recordId) {
    const driveTokenPreCheck = getAccessToken();
    // 同上：Drive／Dropbox 互斥，Drive 使用者不需要也不該先去查 Dropbox
    const dropboxToken = driveTokenPreCheck ? null : await withTimeout(getValidDropboxAccessToken(), 8000, null);
    if (dropboxToken) {
      const path = `/${APP_FOLDER_NAME}/photos/${recordId}.${getFileExtension(file)}`;
      try {
        const res = await fetch('https://content.dropboxapi.com/2/files/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${dropboxToken}`,
            'Dropbox-API-Arg': dropboxApiArg({ path, mode: 'overwrite', autorename: false, mute: true }),
            'Content-Type': 'application/octet-stream'
          },
          body: file
        });
        if (res.ok) return { photoProvider: 'dropbox', photoRef: path };
      } catch (err) {
        console.error('Dropbox 照片上傳失敗:', err);
      }
      return null;
    }

    const driveToken = getAccessToken();
    if (driveToken) {
      const folderId = await getOrCreateDriveFolderId();
      const metadata = { name: `logvita_photo_${recordId}`, mimeType: file.type || 'image/jpeg' };
      if (folderId) metadata.parents = [folderId];
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', file);
      try {
        const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: { Authorization: `Bearer ${driveToken}` },
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          return { photoProvider: 'drive', photoRef: data.id };
        }
      } catch (err) {
        console.error('Drive 照片上傳失敗:', err);
      }
      return null;
    }

    return null;
  }

  async function fetchPhotoBlobUrl(record) {
    if (!record.photoProvider || !record.photoRef) return null;
    if (photoUrlCache.has(record.id)) return photoUrlCache.get(record.id);

    try {
      let blob = null;
      if (record.photoProvider === 'drive') {
        const token = getAccessToken();
        if (!token) return null;
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${record.photoRef}?alt=media`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) blob = await res.blob();
      } else if (record.photoProvider === 'dropbox') {
        const token = await getValidDropboxAccessToken();
        if (!token) return null;
        const res = await fetch('https://content.dropboxapi.com/2/files/download', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Dropbox-API-Arg': dropboxApiArg({ path: record.photoRef })
          }
        });
        if (res.ok) blob = await res.blob();
      }
      if (blob) {
        const url = URL.createObjectURL(blob);
        photoUrlCache.set(record.id, url);
        return url;
      }
    } catch (err) {
      console.error('照片載入失敗:', err);
    }
    return null;
  }

  async function deletePhotoFile(record) {
    try {
      if (record.photoProvider === 'drive') {
        const token = getAccessToken();
        if (!token) return;
        await fetch(`https://www.googleapis.com/drive/v3/files/${record.photoRef}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (record.photoProvider === 'dropbox') {
        const token = await getValidDropboxAccessToken();
        if (!token) return;
        await fetch('https://api.dropboxapi.com/2/files/delete_v2', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ path: record.photoRef })
        });
      }
    } catch (err) {
      console.error('刪除照片檔案失敗:', err);
    }
    if (photoUrlCache.has(record.id)) {
      URL.revokeObjectURL(photoUrlCache.get(record.id));
      photoUrlCache.delete(record.id);
    }
  }

  function applyConfigToForm(config) {
    currentConfig = config || {};
    currentConfig.records = currentConfig.records || [];
    currentConfig.accessList = currentConfig.accessList || [];
    currentConfig.receivedShares = currentConfig.receivedShares || [];

    if (config.name) document.getElementById('p-name').value = config.name;
    if (config.birth) document.getElementById('p-birth').value = config.birth;
    if (config.gender) document.getElementById('p-gender').value = config.gender;
    if (config.blood) document.getElementById('p-blood').value = config.blood;
    if (config.phone) document.getElementById('p-phone').value = config.phone;
    if (config.emergency) document.getElementById('p-emergency').value = config.emergency;
    if (config.emergencyPhone) document.getElementById('p-emergency-phone').value = config.emergencyPhone;
    if (config.height) document.getElementById('p-height').value = config.height;
    if (config.weight) document.getElementById('p-weight').value = config.weight;
    if (config.allergy) document.getElementById('p-allergy').value = config.allergy;

    renderOverview();
    renderRecordList();
    renderAccessList();
    loadSharedWithMe();
    renderIdCard();
    refreshAvatarDisplay();
  }

  // ---- 頭像顯示（自訂上傳頭像優先，其次 Google 頭像，最後為姓名字首） ----
  function setAvatarElement(el, url) {
    if (!el) return;
    if (url) {
      el.innerHTML = `<img src="${url}" alt="${escapeHtml(currentDisplayName)}" referrerpolicy="no-referrer">`;
      const img = el.querySelector('img');
      img.addEventListener('error', () => { el.textContent = currentInitial; }, { once: true });
    } else {
      el.textContent = currentInitial;
    }
  }

  // ---- 授權清單（授權管理頁）與端到端加密跨帳號共享 ----
  function scopeLabel(scope){ const t = T().access; return { full:t.scopeFull, summary:t.scopeSummary, lab:t.scopeLab, custom:t.scopeCustom }[scope] || t.scopeCustom; }
  const APP_BASE_URL = 'https://yuweihuang0417.github.io/emr/dashboard-zhtw.html';

  function grantRecordTypes(grant) {
    if (grant.scope === 'full') return ['lab', 'med', 'img', 'visit'];
    if (grant.scope === 'lab') return ['lab'];
    if (grant.scope === 'custom') return grant.recordTypes || [];
    return []; // summary：不含個別紀錄，只有基本檔案摘要
  }

  function isGrantExpired(grant) {
    if (!grant.expiryDate) return false;
    try { return new Date(grant.expiryDate) < new Date(new Date().toDateString()); }
    catch { return false; }
  }

  function buildShareSnapshot(grant) {
    const types = grantRecordTypes(grant);
    const records = (currentConfig.records || [])
      .filter(r => types.includes(r.type))
      .map(r => ({
        id: r.id, type: r.type, title: r.title, date: r.date,
        doctor: r.doctor || '', note: r.note || '',
        hasPhoto: !!(r.photoProvider && r.photoRef)
      }));
    return {
      ownerName: currentDisplayName,
      relationship: grant.type,
      scope: grant.scope,
      expiryDate: grant.expiryDate || null,
      profile: {
        name: currentConfig.name || currentDisplayName,
        blood: currentConfig.blood || '',
        allergy: currentConfig.allergy || '',
        emergency: currentConfig.emergency || '',
        emergencyPhone: currentConfig.emergencyPhone || '',
        phone: currentConfig.phone || ''
      },
      records,
      updatedAt: new Date().toISOString()
    };
  }

  // 將加密後的分享檔上傳/覆蓋到「目前連結的那個雲端硬碟」（Drive 與 Dropbox 互斥，只會有一種）
  // 並設定成「知道連結的人可讀取」，回傳 { provider, ref } 供之後產生邀請連結、更新、刪除使用
  async function uploadShareFile(bytes, grant) {
    const driveToken = getAccessToken();
    // Drive／Dropbox 互斥，一次只會連結其中一種：driveToken 存在時完全不用去查 Dropbox，
    // 避免每次分享都白白多等一次 Firestore 查詢（且該查詢先前沒有逾時保護，一卡住就會讓畫面停在「加密並上傳中」）
    const dropboxToken = driveToken ? null : await withTimeout(getValidDropboxAccessToken(), 8000, null);
    const fileName = `share_${grant.id}.enc`;
    const blob = new Blob([bytes], { type: 'application/octet-stream' });

    if (dropboxToken) {
      const path = `/${APP_FOLDER_NAME}/shares/${fileName}`;
      try {
        const uploadRes = await fetch('https://content.dropboxapi.com/2/files/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${dropboxToken}`,
            'Dropbox-API-Arg': dropboxApiArg({ path, mode: 'overwrite', autorename: false, mute: true }),
            'Content-Type': 'application/octet-stream'
          },
          body: blob
        });
        if (!uploadRes.ok) {
          const errText = await uploadRes.text().catch(() => '(無法讀取錯誤內容)');
          console.error(`[分享檔] Dropbox 檔案上傳失敗 (HTTP ${uploadRes.status}):`, errText);
          return null;
        }

        // 若已建立過分享連結就直接沿用（避免重複建立），否則新建一個
        if (grant.shareProvider === 'dropbox' && grant.shareRef) {
          return { provider: 'dropbox', ref: grant.shareRef };
        }
        const linkRes = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${dropboxToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ path, settings: { requested_visibility: 'public' } })
        });
        if (linkRes.ok) {
          const data = await linkRes.json();
          return { provider: 'dropbox', ref: data.url };
        }
        const linkErrText = await linkRes.text().catch(() => '(無法讀取錯誤內容)');
        console.warn(`[分享檔] Dropbox 建立分享連結失敗 (HTTP ${linkRes.status})，改嘗試讀取既有連結:`, linkErrText);
        if (linkRes.status === 409 && /shared_link_already_exists/.test(linkErrText)) {
          console.info('[分享檔] 連結已存在，將改用 list_shared_links 取得既有連結');
        } else if (linkRes.status === 401 || /invalid_access_token|expired_access_token/.test(linkErrText)) {
          console.error('[分享檔] Dropbox token 已失效或權限不足，請重新連結 Dropbox');
        } else if (/missing_scope/.test(linkErrText)) {
          console.error('[分享檔] Dropbox App 缺少 sharing.write 權限（scope）。請至 Dropbox App Console → Permissions 分頁勾選 sharing.write（與 sharing.read），儲存後使用者需要重新連結 Dropbox（登出再登入）才會取得新權限的 token。');
        } else if (/settings_error/.test(linkErrText)) {
          console.error('[分享檔] Dropbox 帳號/團隊政策不允許建立公開（public）分享連結（settings_error）。若為 Dropbox Business 帳號，需要管理員開放公開分享權限，否則此免登入分享機制無法使用。');
        }
        // 若連結已存在（常見於重複建立），改查詢既有連結
        const listRes = await fetch('https://api.dropboxapi.com/2/sharing/list_shared_links', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${dropboxToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ path, direct_only: true })
        });
        if (listRes.ok) {
          const data = await listRes.json();
          if (data.links && data.links.length > 0) return { provider: 'dropbox', ref: data.links[0].url };
          console.error('[分享檔] list_shared_links 成功但沒有回傳任何連結，路徑:', path);
        } else {
          const listErrText = await listRes.text().catch(() => '(無法讀取錯誤內容)');
          console.error(`[分享檔] Dropbox list_shared_links 也失敗 (HTTP ${listRes.status}):`, listErrText);
        }
        return null;
      } catch (err) {
        console.error('Dropbox 分享檔上傳失敗:', err);
        return null;
      }
    }

    if (driveToken) {
      try {
        const folderId = await getOrCreateDriveFolderId();
        let fileId = (grant.shareProvider === 'drive') ? grant.shareRef : null;

        const metadata = { name: fileName, mimeType: 'application/octet-stream' };
        if (!fileId && folderId) metadata.parents = [folderId];

        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', blob);

        let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
        let method = 'POST';
        if (fileId) {
          url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
          method = 'PATCH';
        }

        const uploadRes = await fetch(url, { method, headers: { Authorization: `Bearer ${driveToken}` }, body: formData });
        if (!uploadRes.ok) return null;
        const data = await uploadRes.json();
        fileId = data.id || fileId;

        if (grant.shareProvider !== 'drive' || !grant.shareRef) {
          await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${driveToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'reader', type: 'anyone' })
          });
        }
        return { provider: 'drive', ref: fileId };
      } catch (err) {
        console.error('Drive 分享檔上傳失敗:', err);
        return null;
      }
    }

    return null;
  }

  async function deleteShareFile(grant) {
    if (!grant.shareProvider || !grant.shareRef) return;
    try {
      if (grant.shareProvider === 'drive') {
        const token = getAccessToken();
        if (!token) return;
        await fetch(`https://www.googleapis.com/drive/v3/files/${grant.shareRef}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (grant.shareProvider === 'dropbox') {
        const token = await getValidDropboxAccessToken();
        if (!token) return;
        const path = `/${APP_FOLDER_NAME}/shares/share_${grant.id}.enc`;
        await fetch('https://api.dropboxapi.com/2/files/delete_v2', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ path })
        });
      }
    } catch (err) {
      console.error('刪除分享檔失敗:', err);
    }
  }

  // 新增/更新一筆授權：加密目前的資料快照、上傳到雲端、回傳可放進邀請信的分享連結
  async function createOrUpdateShareLink(grant) {
    const snapshot = buildShareSnapshot(grant);
    const aesKey = await importAESKey(grant.shareKey);
    const encryptedBytes = await encryptJSON(snapshot, aesKey);
    const result = await uploadShareFile(encryptedBytes, grant);
    if (!result) return null;

    grant.shareProvider = result.provider;
    grant.shareRef = result.ref;

    const params = new URLSearchParams({
      share: '1',
      provider: result.provider,
      ref: result.ref,
      key: grant.shareKey,
      grant: grant.id,
      owner: currentDisplayName
    });
    return `${APP_BASE_URL}#${params.toString()}`;
  }

  // 資料有更動時（新增/刪除紀錄、修改個人檔案），把所有還沒過期的授權重新加密上傳，確保對方看到的是最新資料
  async function syncAllActiveShares() {
    const grants = (currentConfig.accessList || []).filter(g => !isGrantExpired(g) && g.shareKey);
    for (const grant of grants) {
      await createOrUpdateShareLink(grant);
    }
  }

  function renderAccessList() {
    const list = document.getElementById('access-list');
    const countEl = document.getElementById('access-count');
    if (!list) return;
    const grants = currentConfig.accessList || [];

    if (grants.length === 0) {
      list.innerHTML = `<div class="empty-state" style="padding:24px 0;">
        <div class="e-desc">${T().access.emptyDesc}</div>
      </div>`;
      if (countEl) countEl.textContent = T().access.countLabel(0);
      document.getElementById('stat-access').textContent = '0';
      return;
    }

    list.innerHTML = grants.map(g => {
      const initial = (g.name || g.email || '?').charAt(0).toUpperCase();
      const at = T().access;
      const metaBits = [g.type === 'family' ? at.typeFamilyMeta : (g.type === 'doctor' ? at.typeDoctor : at.typeOther),
        g.expiryDate ? at.authorizedUntil(formatDate(g.expiryDate)) : at.permanent];
      return `
        <div class="auth-item" data-id="${g.id}">
          <div class="auth-avatar">${escapeHtml(initial)}</div>
          <div class="auth-main">
            <div class="name">${escapeHtml(g.name || g.email)}</div>
            <div class="meta">${escapeHtml(metaBits.join(' · '))}</div>
          </div>
          <span class="auth-scope ${g.scope === 'full' ? 'full' : ''}">${scopeLabel(g.scope)}</span>
          <button type="button" class="btn-danger revoke-btn">${T().access.revoke}</button>
        </div>`;
    }).join('');

    if (countEl) countEl.textContent = T().access.countLabel(grants.length);
    document.getElementById('stat-access').textContent = grants.length;

    list.querySelectorAll('.revoke-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (!(await showConfirmDialog(T().access.revokeConfirmMsg, T().access.revokeConfirmTitle))) return;
        const item = e.currentTarget.closest('.auth-item');
        const id = item.dataset.id;
        const grant = (currentConfig.accessList || []).find(g => g.id === id);
        currentConfig.accessList = (currentConfig.accessList || []).filter(g => g.id !== id);
        renderAccessList();
        renderOverview();
        if (grant) await deleteShareFile(grant);
        const { driveSuccess, dropboxSuccess } = await syncConfigToCloud(currentConfig);
        showToast((driveSuccess || dropboxSuccess) ? T().access.revokedToast : T().access.revokedSimpleToast);
      });
    });
  }

  // ---- 共享給我（讀取他人授權分享的端到端加密資料）----
  // 免登入抓取「已設為可讀連結」的加密檔內容（內容本身仍是密文，需要金鑰才能解密）
  async function fetchEncryptedShareBytes(provider, ref) {
    if (provider === 'drive') {
      if (!DRIVE_SHARE_ENABLED) { console.warn('尚未設定 Google API 金鑰，無法讀取 Drive 端的共享資料'); return null; }
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${ref}?alt=media&key=${GOOGLE_DRIVE_API_KEY}`);
      if (!res.ok) return null;
      return new Uint8Array(await res.arrayBuffer());
    }
    if (provider === 'dropbox') {
      if (!DROPBOX_SHARE_ENABLED) { console.warn('尚未設定 Dropbox App 權杖，無法讀取 Dropbox 端的共享資料'); return null; }
      const appToken = await withTimeout(getValidAppDropboxAccessToken(), 8000, null);
      if (!appToken) { console.error('[分享檔] 無法取得 Dropbox App 層級 access token（refresh token 可能已失效，需要重新授權）'); return null; }
      const res = await fetch('https://content.dropboxapi.com/2/sharing/get_shared_link_file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${appToken}`,
          'Dropbox-API-Arg': dropboxApiArg({ url: ref })
        }
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error(`[分享檔] Dropbox 共享檔讀取失敗 (HTTP ${res.status}):`, errText);
        return null;
      }
      return new Uint8Array(await res.arrayBuffer());
    }
    return null;
  }

  async function fetchAndDecryptShare(entry) {
    try {
      const bytes = await fetchEncryptedShareBytes(entry.provider, entry.ref);
      if (!bytes) return null;
      const aesKey = await importAESKey(entry.key);
      return await decryptJSON(bytes, aesKey);
    } catch (err) {
      console.error('解密共享資料失敗:', err);
      return null;
    }
  }

  // 檢查網址 hash 是否為剛點開的邀請連結，是的話解密、加入「共享給我」清單並儲存起來，之後每次造訪都會自動重新抓最新資料
  async function handleIncomingShareLink() {
    const hash = window.location.hash.substring(1);
    if (!hash) return;
    const params = new URLSearchParams(hash);
    if (params.get('share') !== '1') return;

    const entry = {
      grantId: params.get('grant') || ('recv_' + Date.now()),
      ownerName: params.get('owner') || T().misc.defaultUserName,
      provider: params.get('provider'),
      ref: params.get('ref'),
      key: params.get('key'),
      addedAt: new Date().toISOString()
    };
    window.history.replaceState({}, document.title, window.location.pathname);
    if (!entry.provider || !entry.ref || !entry.key) return;

    currentConfig.receivedShares = currentConfig.receivedShares || [];
    const exists = currentConfig.receivedShares.some(s => s.grantId === entry.grantId);
    if (!exists) {
      currentConfig.receivedShares.push(entry);
      const { driveSuccess, dropboxSuccess } = await syncConfigToCloud(currentConfig);
      showToast((driveSuccess || dropboxSuccess) ? T().shared.joinedToast(entry.ownerName) : T().shared.joinedLocalToast(entry.ownerName));
    }

    // 切換到「共享給我」頁面並重新整理清單
    document.querySelectorAll('.nav button[data-panel]').forEach(b => b.classList.toggle('active', b.dataset.panel === 'shared'));
    document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === 'panel-shared'));
    loadSharedWithMe();
  }

  // ---- 登入時檢查邀請通知信箱，跳出小視窗提醒 ----
  const inviteNotifyBackdrop = document.getElementById('invite-notify-backdrop');
  function openInviteNotifyModal(){ inviteNotifyBackdrop.classList.add('show'); lockBodyScroll(); }
  function closeInviteNotifyModal(){ inviteNotifyBackdrop.classList.remove('show'); unlockBodyScroll(); }
  document.getElementById('invite-notify-close').addEventListener('click', closeInviteNotifyModal);
  inviteNotifyBackdrop.addEventListener('click', (e) => {
    if (e.target === inviteNotifyBackdrop) closeInviteNotifyModal();
  });

  async function checkPendingInvites() {
    const invites = await withTimeout(loadPendingInvites(), 8000, []);
    const valid = invites.filter(inv => !isGrantExpired({ expiryDate: inv.expiryDate }));
    if (valid.length === 0) return;
    renderInviteModal(valid);
  }

  function renderInviteModal(invites) {
    const list = document.getElementById('invite-notify-list');

    list.innerHTML = invites.map(inv => `
      <div class="auth-item" data-id="${inv.id}" style="align-items:flex-start;">
        <div class="auth-avatar">${escapeHtml((inv.ownerName || inv.ownerEmail || '?').charAt(0).toUpperCase())}</div>
        <div class="auth-main">
          <div class="name">${escapeHtml(inv.ownerName || inv.ownerEmail)}</div>
          <div class="meta">${escapeHtml(inv.ownerEmail || '')} · ${scopeLabel(inv.scope)}</div>
          ${inv.note ? `<div style="font-size:12.5px; color:#5c6b68; margin-top:6px; line-height:1.6;">「${escapeHtml(inv.note)}」</div>` : ''}
        </div>
        <div style="display:flex; flex-direction:column; gap:6px; flex-shrink:0;">
          <button type="button" class="btn-primary accept-invite-btn" style="padding:7px 14px; font-size:12.5px;">${T().invite.accept}</button>
          <button type="button" class="btn-ghost dismiss-invite-btn" style="padding:7px 14px; font-size:12.5px;">${T().invite.ignore}</button>
        </div>
      </div>
    `).join('');

    function removeItemAndMaybeClose(itemEl){
      itemEl.remove();
      if (!list.children.length) closeInviteNotifyModal();
    }

    list.querySelectorAll('.accept-invite-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const item = e.currentTarget.closest('.auth-item');
        const id = item.dataset.id;
        const inv = invites.find(i => i.id === id);
        if (!inv) return;

        currentConfig.receivedShares = currentConfig.receivedShares || [];
        if (!currentConfig.receivedShares.some(s => s.grantId === inv.grantId)) {
          currentConfig.receivedShares.push({
            grantId: inv.grantId,
            ownerName: inv.ownerName,
            provider: inv.provider,
            ref: inv.ref,
            key: inv.key,
            addedAt: new Date().toISOString()
          });
          await syncConfigToCloud(currentConfig);
        }
        await removeInviteRecord(inv.id);
        showToast(T().shared.joinedToast(inv.ownerName));
        removeItemAndMaybeClose(item);
        loadSharedWithMe();
      });
    });

    list.querySelectorAll('.dismiss-invite-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const item = e.currentTarget.closest('.auth-item');
        const id = item.dataset.id;
        const inv = invites.find(i => i.id === id);
        if (inv) await removeInviteRecord(inv.id);
        removeItemAndMaybeClose(item);
      });
    });

    openInviteNotifyModal();
  }

  async function loadSharedWithMe() {
    const list = document.getElementById('shared-list');
    const empty = document.getElementById('shared-empty');
    if (!list || !empty) return;

    const entries = currentConfig.receivedShares || [];
    if (entries.length === 0) {
      list.innerHTML = '';
      empty.style.display = 'block';
      const statShared0 = document.getElementById('stat-shared');
      if (statShared0) statShared0.textContent = '0';
      return;
    }

    list.innerHTML = `<div class="empty-state" style="padding:24px 0;"><div class="e-desc">${T().shared.loading}</div></div>`;
    empty.style.display = 'none';

    const results = await Promise.all(entries.map(async (entry) => {
      const data = await fetchAndDecryptShare(entry);
      return { entry, data };
    }));

    const valid = results.filter(r => r.data && !isGrantExpired({ expiryDate: r.data.expiryDate }));

    const statShared = document.getElementById('stat-shared');
    if (statShared) statShared.textContent = valid.length;

    if (valid.length === 0) {
      list.innerHTML = '';
      empty.style.display = 'block';
      return;
    }

    list.innerHTML = valid.map(({ entry, data: s }) => {
      const initial = (s.ownerName || entry.ownerName || '?').charAt(0).toUpperCase();
      const at = T().access, ic = T().idcard, sh = T().shared, dt = T().detail;
      const metaBits = [s.relationship === 'family' ? at.typeFamilyMeta : (s.relationship === 'doctor' ? at.typeDoctor : at.typeOther),
        s.expiryDate ? at.authorizedUntil(formatDate(s.expiryDate)) : at.permanent];
      return `
        <div class="shared-item" data-id="${entry.grantId}">
          <div class="shared-item-head">
            <div class="auth-avatar">${escapeHtml(initial)}</div>
            <div class="auth-main">
              <div class="name">${escapeHtml(s.ownerName || entry.ownerName)}</div>
              <div class="meta">${escapeHtml(metaBits.join(' · '))}</div>
            </div>
            <span class="auth-scope ${s.scope === 'full' ? 'full' : ''}">${scopeLabel(s.scope)}</span>
            <svg class="shared-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="shared-detail">
            <div class="shared-profile-grid">
              <div><div class="sp-label">${ic.kBlood}</div><div class="sp-value">${escapeHtml(s.profile?.blood || dt.notProvided)}</div></div>
              <div><div class="sp-label">${ic.kEmergency}</div><div class="sp-value">${escapeHtml(s.profile?.emergency || dt.notProvided)}</div></div>
              <div><div class="sp-label">${ic.kEmergencyPhone}</div><div class="sp-value">${escapeHtml(s.profile?.emergencyPhone || dt.notProvided)}</div></div>
              <div><div class="sp-label">${ic.kAllergy}</div><div class="sp-value">${escapeHtml(s.profile?.allergy || ic.noKnownAllergy)}</div></div>
              <div><div class="sp-label">${ic.kPhone}</div><div class="sp-value">${escapeHtml(s.profile?.phone || dt.notProvided)}</div></div>
            </div>
            ${(s.records && s.records.length > 0) ? `
              <div class="shared-records-title">${sh.recordsCount(s.records.length)}</div>
              ${s.records.map(r => `
                <div class="shared-record-item">
                  <div class="record-icon ${r.type}">${TYPE_ICON[r.type] || TYPE_ICON.visit}</div>
                  <div class="record-main">
                    <div class="r-title">${escapeHtml(r.title)}${r.hasPhoto ? '　📎' : ''}</div>
                    <div class="r-meta">${formatDate(r.date)}${r.doctor ? ' · ' + escapeHtml(r.doctor) : ''}</div>
                    ${r.note ? `<div class="r-note">${escapeHtml(r.note)}</div>` : ''}
                  </div>
                </div>
              `).join('')}
            ` : `<div class="shared-records-title" style="color:#9fb0ac; font-weight:500;">${sh.noRecordsInScope}</div>`}
            <button type="button" class="link-remove remove-shared-btn" style="margin-top:14px;">${sh.removeBtn}</button>
          </div>
        </div>`;
    }).join('');

    list.querySelectorAll('.shared-item-head').forEach(head => {
      head.addEventListener('click', () => {
        head.closest('.shared-item').classList.toggle('open');
      });
    });

    list.querySelectorAll('.remove-shared-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!(await showConfirmDialog(T().shared.removeConfirmMsg, T().shared.removeConfirmTitle))) return;
        const id = e.currentTarget.closest('.shared-item').dataset.id;
        currentConfig.receivedShares = (currentConfig.receivedShares || []).filter(s => s.grantId !== id);
        loadSharedWithMe();
        const { driveSuccess, dropboxSuccess } = await syncConfigToCloud(currentConfig);
        showToast(T().shared.removedToast);
      });
    });
  }


  async function refreshAvatarDisplay() {
    let url = '';
    if (currentConfig.avatarProvider && currentConfig.avatarRef) {
      url = await fetchPhotoBlobUrl({ id: 'avatar', photoProvider: currentConfig.avatarProvider, photoRef: currentConfig.avatarRef }) || '';
    }
    if (!url) url = currentGooglePhotoURL;

    setAvatarElement(document.getElementById('user-initial'), url);
    setAvatarElement(document.getElementById('avatar-lg-text'), url);
    setAvatarElement(document.getElementById('id-card-avatar'), url);

    const removeBtn = document.getElementById('remove-avatar');
    if (removeBtn) {
      removeBtn.style.display = (currentConfig.avatarProvider && currentConfig.avatarRef) ? 'inline-flex' : 'none';
    }
  }

  // ---- 首頁 / 總覽渲染 ----
  function formatDate(d){
    if (!d) return '—';
    try {
      const dt = new Date(d);
      return `${dt.getFullYear()}/${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')}`;
    } catch { return d; }
  }

  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function renderIdCard(){
    const nameEl = document.getElementById('id-name');
    if (!nameEl) return;
    nameEl.textContent = currentConfig.name || currentDisplayName || '—';
    document.getElementById('id-birth').textContent = currentConfig.birth ? formatDate(currentConfig.birth) : '—';
    document.getElementById('id-gender').textContent = currentConfig.gender || '—';
    document.getElementById('id-blood').textContent = currentConfig.blood ? `${currentConfig.blood}${T().idcard.bloodTypeSuffix}` : '—';
    document.getElementById('id-phone').textContent = currentConfig.phone || '—';
    document.getElementById('id-emergency').textContent = currentConfig.emergency || T().idcard.notSet;
    document.getElementById('id-emergency-phone').textContent = currentConfig.emergencyPhone || '—';
    document.getElementById('id-allergy').textContent = (currentConfig.allergy && currentConfig.allergy.trim()) ? currentConfig.allergy : T().idcard.noKnownAllergy;
  }

  // ---- 健康身分卡下載為圖片（純 canvas 繪製，不依賴外部截圖套件）----
  function roundedRectPath(ctx, x, y, w, h, r){
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // 簡易文字換行（給過敏史等可能較長的欄位使用）
  function wrapCanvasText(ctx, text, maxWidth){
    if (!text) return [''];
    const chars = Array.from(text);
    const lines = [];
    let line = '';
    for (const ch of chars) {
      const test = line + ch;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = ch;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines.slice(0, 3); // 最多 3 行，避免卡片過長
  }

  function sanitizeFileNamePart(str){
    return (str || '').replace(/[\\/:*?"<>|]/g, '').trim();
  }

  async function loadImageForCanvas(url){
    return new Promise((resolve) => {
      const img = new Image();
      // blob: URL 為本機來源不會汙染 canvas；遠端頭像（如 Google 帳號照片）加上 crossOrigin 嘗試允許匿名 CORS 讀取
      if (!url.startsWith('blob:')) img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  async function downloadIdCard(){
    const btn = document.getElementById('id-card-download-btn');
    if (btn) btn.disabled = true;
    try {
      if (document.fonts && document.fonts.ready) {
        try { await document.fonts.ready; } catch {}
      }

      const t = T();
      const OUT_W = 1050, OUT_H = 640, PAD = 56, RADIUS = 46;
      const canvas = document.createElement('canvas');
      canvas.width = OUT_W;
      canvas.height = OUT_H;
      const ctx = canvas.getContext('2d');

      roundedRectPath(ctx, 0, 0, OUT_W, OUT_H, RADIUS);
      ctx.clip();

      // 背景漸層（呼應畫面上卡片的深色品牌漸層）
      const bgGrad = ctx.createLinearGradient(0, 0, OUT_W, OUT_H);
      bgGrad.addColorStop(0, '#123334');
      bgGrad.addColorStop(0.65, '#0a2021');
      bgGrad.addColorStop(1, '#071819');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, OUT_W, OUT_H);

      // 左上角薄荷色光暈
      const glow = ctx.createRadialGradient(OUT_W * 0.18, -OUT_H * 0.15, 0, OUT_W * 0.18, -OUT_H * 0.15, OUT_W * 0.7);
      glow.addColorStop(0, 'rgba(121,226,196,0.32)');
      glow.addColorStop(1, 'rgba(121,226,196,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, OUT_W, OUT_H);

      // 品牌列：左邊圓點 + 品牌名，右邊卡片標籤
      ctx.fillStyle = '#79e2c4';
      ctx.beginPath();
      ctx.arc(PAD + 7, PAD + 10, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f6f8f6';
      ctx.font = '600 32px "Noto Serif TC","Noto Serif SC",serif';
      ctx.fillText(t.nav.brand, PAD + 26, PAD + 20);

      ctx.font = '500 22px "Noto Sans TC","Noto Sans SC",sans-serif';
      ctx.fillStyle = 'rgba(246,248,246,0.6)';
      const labelText = t.idcard.label;
      const labelWidth = ctx.measureText(labelText).width;
      ctx.fillText(labelText, OUT_W - PAD - labelWidth, PAD + 18);

      // 大頭貼
      const avatarSize = 128;
      const avatarX = PAD;
      const avatarY = PAD + 62;
      roundedRectPath(ctx, avatarX, avatarY, avatarSize, avatarSize, 24);
      ctx.save();
      ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,.14)';
      ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);

      let avatarDrawn = false;
      const avatarImgEl = document.querySelector('#id-card-avatar img');
      if (avatarImgEl && avatarImgEl.src) {
        const img = await loadImageForCanvas(avatarImgEl.src);
        if (img) {
          try {
            const side = Math.min(img.naturalWidth, img.naturalHeight);
            const sx = (img.naturalWidth - side) / 2;
            const sy = (img.naturalHeight - side) / 2;
            ctx.drawImage(img, sx, sy, side, side, avatarX, avatarY, avatarSize, avatarSize);
            avatarDrawn = true;
          } catch (err) {
            console.warn('大頭貼繪製到匯出圖片失敗（可能為跨網域圖片），改用姓名縮寫代替:', err);
          }
        }
      }
      if (!avatarDrawn) {
        ctx.fillStyle = '#f6f8f6';
        ctx.font = '700 46px "Noto Sans TC","Noto Sans SC",sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(currentInitial || '?', avatarX + avatarSize / 2, avatarY + avatarSize / 2 + 16);
        ctx.textAlign = 'left';
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,.22)';
      ctx.lineWidth = 2;
      roundedRectPath(ctx, avatarX, avatarY, avatarSize, avatarSize, 24);
      ctx.stroke();

      // 姓名 + 出生／性別
      const infoX = avatarX + avatarSize + 34;
      const nameText = currentConfig.name || currentDisplayName || '—';
      ctx.fillStyle = '#f6f8f6';
      ctx.font = '600 38px "Noto Serif TC","Noto Serif SC",serif';
      ctx.fillText(nameText, infoX, avatarY + 30);

      function drawKV(x, y, kText, vText, fontSize = 24){
        ctx.font = `500 ${fontSize}px "Noto Sans TC","Noto Sans SC",sans-serif`;
        ctx.fillStyle = 'rgba(246,248,246,0.6)';
        ctx.fillText(kText, x, y);
        const kWidth = ctx.measureText(kText).width;
        ctx.fillStyle = '#f6f8f6';
        ctx.fillText(vText, x + kWidth + 8, y);
      }

      const birthText = currentConfig.birth ? formatDate(currentConfig.birth) : '—';
      const genderText = currentConfig.gender || '—';
      drawKV(infoX, avatarY + 78, t.idcard.kBirth, birthText);
      ctx.font = '500 24px "Noto Sans TC","Noto Sans SC",sans-serif';
      const birthKVWidth = ctx.measureText(t.idcard.kBirth).width + 8 + ctx.measureText(birthText).width;
      drawKV(infoX + birthKVWidth + 30, avatarY + 78, t.idcard.kGender, genderText);

      // 下方欄位（分隔線 + 2 欄格線）
      const gridTop = avatarY + avatarSize + 40;
      ctx.strokeStyle = 'rgba(255,255,255,.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD, gridTop);
      ctx.lineTo(OUT_W - PAD, gridTop);
      ctx.stroke();

      const colGap = 44;
      const colWidth = (OUT_W - PAD * 2 - colGap) / 2;
      const col1X = PAD;
      const col2X = PAD + colWidth + colGap;
      const rowH = 66;

      const bloodText = currentConfig.blood ? `${currentConfig.blood}${t.idcard.bloodTypeSuffix}` : '—';
      const phoneText = currentConfig.phone || '—';
      const emergencyText = currentConfig.emergency || t.idcard.notSet;
      const emergencyPhoneText = currentConfig.emergencyPhone || '—';
      const allergyText = (currentConfig.allergy && currentConfig.allergy.trim()) ? currentConfig.allergy : t.idcard.noKnownAllergy;

      function drawField(x, y, kText, vText){
        ctx.font = '500 21px "Noto Sans TC","Noto Sans SC",sans-serif';
        ctx.fillStyle = 'rgba(246,248,246,0.55)';
        ctx.fillText(kText, x, y);
        ctx.font = '600 25px "Noto Sans TC","Noto Sans SC",sans-serif';
        ctx.fillStyle = '#f6f8f6';
        ctx.fillText(vText, x, y + 30);
      }

      const row1Y = gridTop + 36;
      const row2Y = row1Y + rowH;
      drawField(col1X, row1Y, t.idcard.kBlood, bloodText);
      drawField(col2X, row1Y, t.idcard.kPhone, phoneText);
      drawField(col1X, row2Y, t.idcard.kEmergency, emergencyText);
      drawField(col2X, row2Y, t.idcard.kEmergencyPhone, emergencyPhoneText);

      const allergyY = row2Y + rowH;
      ctx.font = '500 21px "Noto Sans TC","Noto Sans SC",sans-serif';
      ctx.fillStyle = 'rgba(246,248,246,0.55)';
      ctx.fillText(t.idcard.kAllergy, col1X, allergyY);
      ctx.font = '600 25px "Noto Sans TC","Noto Sans SC",sans-serif';
      ctx.fillStyle = '#f6f8f6';
      const allergyLines = wrapCanvasText(ctx, allergyText, OUT_W - PAD * 2);
      allergyLines.forEach((line, i) => ctx.fillText(line, col1X, allergyY + 30 + i * 30));

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('canvas.toBlob 回傳空白');

      const fileName = `${sanitizeFileNamePart(t.idcard.label)}-${sanitizeFileNamePart(nameText) || 'LogVita'}.png`;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);

      showToast(t.idcard.downloadedToast);
    } catch (err) {
      console.error('健康身分卡下載失敗:', err);
      showToast(T().idcard.downloadFailedToast);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  document.getElementById('id-card-download-btn')?.addEventListener('click', downloadIdCard);

  function renderOverview() {
    const records = currentConfig.records || [];
    document.getElementById('stat-total').textContent = records.length;

    if (records.length > 0) {
      const sorted = [...records].sort((a,b) => new Date(b.date) - new Date(a.date));
      document.getElementById('stat-recent').textContent = formatDate(sorted[0].date);
      document.getElementById('stat-recent-type').textContent = typeLabel(sorted[0].type) || '—';
    } else {
      document.getElementById('stat-recent').textContent = '—';
      document.getElementById('stat-recent-type').textContent = T().home.statRecentNone;
    }

    const allergyBanner = document.getElementById('allergy-banner');
    if (currentConfig.allergy && currentConfig.allergy.trim()) {
      allergyBanner.style.display = 'flex';
      document.getElementById('allergy-text').textContent = currentConfig.allergy;
    } else {
      allergyBanner.style.display = 'none';
    }
  }

  function renderRecordList() {
    const records = currentConfig.records || [];
    const filtered = activeFilter === 'all' ? records : records.filter(r => r.type === activeFilter);
    const sorted = [...filtered].sort((a,b) => new Date(b.date) - new Date(a.date));

    const list = document.getElementById('record-list');
    const empty = document.getElementById('empty-state');
    if (!list || !empty) return;

    if (sorted.length === 0) {
      list.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    list.innerHTML = sorted.map(r => `
      <div class="record-item" data-id="${r.id}">
        <div class="record-item-head">
          <div class="record-icon ${r.type}">${TYPE_ICON[r.type] || TYPE_ICON.visit}</div>
          <div class="record-main">
            <div class="r-top">
              <span class="r-title">${escapeHtml(r.title)}</span>
              <span class="record-tag">${typeLabel(r.type)}</span>
            </div>
            <div class="r-meta">${formatDate(r.date)}${r.doctor ? ' · ' + escapeHtml(r.doctor) : ''}</div>
          </div>
          ${r.photoProvider ? `<div class="record-thumb-slot" data-photo-id="${r.id}"><span class="thumb-loading"></span></div>` : ''}
          <svg class="record-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 6 15 12 9 18"/></svg>
        </div>
      </div>
    `).join('');

    // 非同步載入每一筆紀錄的縮圖預覽
    sorted.filter(r => r.photoProvider).forEach(async (r) => {
      const url = await fetchPhotoBlobUrl(r);
      const slot = list.querySelector(`.record-thumb-slot[data-photo-id="${r.id}"]`);
      if (!slot) return;
      slot.innerHTML = url ? `<img src="${url}" class="record-thumb" alt="${T().detail.photoAlt}">` : '';
    });

    list.querySelectorAll('.record-item-head').forEach(head => {
      head.addEventListener('click', () => {
        const id = head.closest('.record-item').dataset.id;
        const record = (currentConfig.records || []).find(r => r.id === id);
        if (record) openRecordDetailModal(record);
      });
    });
  }

  document.getElementById('filter-row').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    document.querySelectorAll('#filter-row .chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeFilter = chip.dataset.filter;
    renderRecordList();
  });

  // ---- 照片放大檢視 ----
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');
  function openLightbox(src){
    document.getElementById('lightbox-img').src = src;
    lightboxBackdrop.classList.add('show');
    lockBodyScroll();
  }
  function closeLightbox(){ lightboxBackdrop.classList.remove('show'); unlockBodyScroll(); }
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', (e) => {
    if (e.target === lightboxBackdrop) closeLightbox();
  });

  // ---- 醫療紀錄詳情小視窗 ----
  const recordDetailBackdrop = document.getElementById('record-detail-backdrop');
  function closeRecordDetailModal(){ recordDetailBackdrop.classList.remove('show'); unlockBodyScroll(); }
  document.getElementById('record-detail-close').addEventListener('click', closeRecordDetailModal);
  recordDetailBackdrop.addEventListener('click', (e) => {
    if (e.target === recordDetailBackdrop) closeRecordDetailModal();
  });

  async function openRecordDetailModal(record) {
    const content = document.getElementById('record-detail-content');
    const dt = T().detail;
    content.innerHTML = `
      <div style="display:flex; align-items:center; gap:14px; margin-bottom:20px;">
        <div class="record-icon ${record.type}" style="width:48px; height:48px; border-radius:14px;">${TYPE_ICON[record.type] || TYPE_ICON.visit}</div>
        <div>
          <h3 style="margin:0 0 6px;">${escapeHtml(record.title)}</h3>
          <span class="record-tag">${typeLabel(record.type)}</span>
        </div>
      </div>
      <div class="shared-profile-grid" style="margin-bottom:18px;">
        <div><div class="sp-label">${dt.dateLabel}</div><div class="sp-value">${formatDate(record.date)}</div></div>
        <div><div class="sp-label">${dt.doctorLabel}</div><div class="sp-value">${escapeHtml(record.doctor || dt.notProvided)}</div></div>
      </div>
      <div class="sp-label" style="margin-bottom:6px;">${dt.noteLabel}</div>
      ${record.note ? `<div class="r-note-full">${escapeHtml(record.note)}</div>` : `<div class="r-note-full" style="color:#9fb0ac;">${dt.noNoteContent}</div>`}
      <div id="record-detail-photo-slot">${record.photoProvider ? `<span class="thumb-loading" style="display:block; width:100%; height:160px; border-radius:12px; margin-top:14px;"></span>` : ''}</div>
      <div class="modal-actions">
        <button type="button" class="btn-danger" id="record-detail-delete">${dt.delete}</button>
        <button type="button" class="btn-primary" id="record-detail-done" style="justify-content:center;">${dt.done}</button>
      </div>
    `;

    document.getElementById('record-detail-done').addEventListener('click', closeRecordDetailModal);
    document.getElementById('record-detail-delete').addEventListener('click', async () => {
      if (!(await showConfirmDialog(T().detail.deleteConfirmMsg, T().detail.deleteConfirmTitle))) return;
      currentConfig.records = (currentConfig.records || []).filter(r => r.id !== record.id);
      renderOverview();
      renderRecordList();
      closeRecordDetailModal();
      if (record.photoProvider) deletePhotoFile(record);
      const { driveSuccess, dropboxSuccess } = await syncConfigToCloud(currentConfig);
      syncAllActiveShares();
      showToast((driveSuccess || dropboxSuccess) ? T().detail.deletedCloudToast : T().detail.deletedLocalToast);
    });

    recordDetailBackdrop.classList.add('show');
    lockBodyScroll();

    if (record.photoProvider) {
      const url = await fetchPhotoBlobUrl(record);
      const slot = document.getElementById('record-detail-photo-slot');
      if (!slot) return;
      slot.innerHTML = url
        ? `<div class="record-detail-photo"><img src="${url}" alt="${T().detail.photoAlt}"></div>`
        : '';
      if (url) slot.querySelector('.record-detail-photo').addEventListener('click', () => openLightbox(url));
    }
  }

  const recordBackdrop = document.getElementById('record-backdrop');
  const recordForm = document.getElementById('record-form');
  const photoInput = document.getElementById('r-photo');
  const photoUploadEmpty = document.getElementById('photo-upload-empty');
  const photoPreviewWrap = document.getElementById('photo-preview-wrap');
  const photoPreviewImg = document.getElementById('photo-preview-img');
  let selectedPhotoFile = null;
  let selectedPhotoPreviewUrl = null;

  function resetPhotoField(){
    selectedPhotoFile = null;
    if (selectedPhotoPreviewUrl) { URL.revokeObjectURL(selectedPhotoPreviewUrl); selectedPhotoPreviewUrl = null; }
    photoInput.value = '';
    photoPreviewImg.src = '';
    photoPreviewWrap.style.display = 'none';
    photoUploadEmpty.style.display = 'flex';
  }

  photoUploadEmpty.addEventListener('click', () => photoInput.click());

  photoInput.addEventListener('change', async () => {
    const file = photoInput.files && photoInput.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast(T().recordModal.invalidImageToast);
      photoInput.value = '';
      return;
    }

    let finalFile = file;
    if (file.size > PHOTO_COMPRESS_THRESHOLD) {
      photoUploadEmpty.querySelector('span').textContent = T().recordModal.compressing;
      finalFile = await prepareImageForUpload(file);
      photoUploadEmpty.querySelector('span').textContent = T().recordModal.photoUploadText;
      if (!finalFile) {
        showToast(T().recordModal.tooLargeToast);
        photoInput.value = '';
        return;
      }
    }

    selectedPhotoFile = finalFile;
    selectedPhotoPreviewUrl = URL.createObjectURL(finalFile);
    photoPreviewImg.src = selectedPhotoPreviewUrl;
    photoPreviewWrap.style.display = 'block';
    photoUploadEmpty.style.display = 'none';
  });

  document.getElementById('photo-remove-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    resetPhotoField();
  });

  function openRecordModal() {
    recordForm.reset();
    resetPhotoField();
    document.getElementById('r-date').value = new Date().toISOString().slice(0,10);
    document.querySelectorAll('.type-opt').forEach(o => o.classList.remove('active'));
    document.querySelector('.type-opt[data-type="lab"]').classList.add('active');
    document.getElementById('r-type').value = 'lab';
    recordBackdrop.classList.add('show');
    lockBodyScroll();
  }
  function closeRecordModal(){ recordBackdrop.classList.remove('show'); unlockBodyScroll(); }

  document.getElementById('add-record-btn').addEventListener('click', openRecordModal);
  document.getElementById('record-close').addEventListener('click', closeRecordModal);
  document.getElementById('record-cancel').addEventListener('click', closeRecordModal);

  document.getElementById('type-picker').addEventListener('click', (e) => {
    const opt = e.target.closest('.type-opt');
    if (!opt) return;
    document.querySelectorAll('.type-opt').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    document.getElementById('r-type').value = opt.dataset.type;
  });

  recordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = recordForm.querySelector('button[type="submit"]');
    const newRecord = {
      id: 'rec_' + Date.now() + '_' + Math.random().toString(36).slice(2,8),
      type: document.getElementById('r-type').value,
      title: document.getElementById('r-title').value.trim(),
      date: document.getElementById('r-date').value,
      doctor: document.getElementById('r-doctor').value.trim(),
      note: document.getElementById('r-note').value.trim(),
      createdAt: new Date().toISOString()
    };
    if (!newRecord.title || !newRecord.date) return;

    const photoToUpload = selectedPhotoFile;
    const originalBtnText = submitBtn.textContent;

    if (photoToUpload) {
      submitBtn.disabled = true;
      submitBtn.textContent = T().recordModal.uploading;
      const uploadResult = await uploadPhotoFile(photoToUpload, newRecord.id);
      if (uploadResult) {
        newRecord.photoProvider = uploadResult.photoProvider;
        newRecord.photoRef = uploadResult.photoRef;
      } else {
        showToast(T().recordModal.uploadFailedToast);
      }
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }

    currentConfig.records = currentConfig.records || [];
    currentConfig.records.unshift(newRecord);
    currentConfig.updatedAt = new Date().toISOString();

    renderOverview();
    renderRecordList();
    closeRecordModal();

    const { driveSuccess, dropboxSuccess } = await syncConfigToCloud(currentConfig);
    syncAllActiveShares();
    showToast((driveSuccess || dropboxSuccess) ? T().recordModal.addedCloudToast : T().recordModal.addedLocalToast);
  });

  // 7. 表單提交與事件觸發
  document.getElementById('connect-dropbox-btn').addEventListener('click', connectDropbox);

  // ---- 刪除帳號（危險區域）----
  const deleteAccountBtn = document.getElementById('delete-account');
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', async () => {
      if (!(await showConfirmDialog(T().security.deleteConfirmMsg, T().security.deleteConfirmTitle))) return;
      showToast(T().security.deleteToast);
    });
  }

  // ---- 更換 / 移除大頭貼照片 ----
  // ---- 大頭貼裁切編輯器（拖曳位置、縮放、旋轉）----
  const CROP_VIEWPORT_SIZE = 260; // 需與 CSS .avatar-crop-viewport 的 width/height 一致
  const CROP_OUTPUT_SIZE = 640;   // 匯出的正方形頭像解析度

  const cropBackdrop = document.getElementById('avatar-crop-backdrop');
  const cropViewport = document.getElementById('avatar-crop-viewport');
  const cropImg = document.getElementById('avatar-crop-img');
  const cropZoomSlider = document.getElementById('avatar-crop-zoom');
  const cropRotateSlider = document.getElementById('avatar-crop-rotate');
  const cropRotateLeftBtn = document.getElementById('avatar-crop-rotate-left');
  const cropRotateRightBtn = document.getElementById('avatar-crop-rotate-right');
  const cropCancelBtn = document.getElementById('avatar-crop-cancel');
  const cropConfirmBtn = document.getElementById('avatar-crop-confirm');
  const cropCloseBtn = document.getElementById('avatar-crop-close');

  let cropState = null;    // { naturalWidth, naturalHeight, objectUrl, minScale, scale, rotation, offsetX, offsetY }
  let cropResolver = null; // 目前這次裁切流程的 Promise resolve

  // 確保縮放/旋轉/拖曳後，圖片仍完整覆蓋圓形檢視窗（數學上與旋轉角度無關，見下方推導）：
  // 圖片安全半徑 = min(寬,高)*scale / 2，此半徑圓在圖片中心平移 offset 後仍需完整覆蓋檢視窗（半徑 D/2）
  function clampCropOffset(){
    const safeRadius = (Math.min(cropState.naturalWidth, cropState.naturalHeight) * cropState.scale - CROP_VIEWPORT_SIZE) / 2;
    const maxR = Math.max(0, safeRadius);
    const dist = Math.hypot(cropState.offsetX, cropState.offsetY);
    if (dist > maxR && dist > 0) {
      const ratio = maxR / dist;
      cropState.offsetX *= ratio;
      cropState.offsetY *= ratio;
    }
  }

  function renderCropTransform(){
    cropImg.style.transform = `translate(-50%,-50%) translate(${cropState.offsetX}px, ${cropState.offsetY}px) rotate(${cropState.rotation}deg) scale(${cropState.scale})`;
  }

  function openAvatarCropModal(file){
    return new Promise((resolve) => {
      cropResolver = resolve;
      const objectUrl = URL.createObjectURL(file);
      cropImg.onload = () => {
        const naturalWidth = cropImg.naturalWidth;
        const naturalHeight = cropImg.naturalHeight;
        const minScale = CROP_VIEWPORT_SIZE / Math.min(naturalWidth, naturalHeight);
        cropState = {
          naturalWidth, naturalHeight, objectUrl,
          minScale, scale: minScale,
          rotation: 0, offsetX: 0, offsetY: 0
        };
        cropZoomSlider.min = minScale;
        cropZoomSlider.max = minScale * 4;
        cropZoomSlider.step = ((minScale * 4) - minScale) / 100 || 0.01;
        cropZoomSlider.value = minScale;
        cropRotateSlider.value = 0;
        renderCropTransform();
        cropBackdrop.classList.add('show');
        lockBodyScroll();
      };
      cropImg.src = objectUrl;
    });
  }

  function closeAvatarCropModal(result){
    cropBackdrop.classList.remove('show');
    unlockBodyScroll();
    if (cropState && cropState.objectUrl) URL.revokeObjectURL(cropState.objectUrl);
    const resolve = cropResolver;
    cropState = null;
    cropResolver = null;
    cropImg.removeAttribute('src');
    if (resolve) resolve(result);
  }

  cropZoomSlider.addEventListener('input', () => {
    if (!cropState) return;
    cropState.scale = parseFloat(cropZoomSlider.value);
    clampCropOffset();
    renderCropTransform();
  });

  cropRotateSlider.addEventListener('input', () => {
    if (!cropState) return;
    cropState.rotation = parseFloat(cropRotateSlider.value);
    clampCropOffset();
    renderCropTransform();
  });

  function rotateCropBy(delta){
    if (!cropState) return;
    let next = cropState.rotation + delta;
    while (next > 180) next -= 360;
    while (next < -180) next += 360;
    cropState.rotation = next;
    cropRotateSlider.value = next;
    clampCropOffset();
    renderCropTransform();
  }
  cropRotateLeftBtn.addEventListener('click', () => rotateCropBy(-90));
  cropRotateRightBtn.addEventListener('click', () => rotateCropBy(90));

  // 拖曳平移（Pointer Events 同時支援滑鼠與觸控）
  let cropDragPointerId = null;
  let cropDragStart = null;
  cropViewport.addEventListener('pointerdown', (e) => {
    if (!cropState) return;
    cropDragPointerId = e.pointerId;
    cropDragStart = { x: e.clientX, y: e.clientY, offsetX: cropState.offsetX, offsetY: cropState.offsetY };
    cropViewport.classList.add('dragging');
    cropViewport.setPointerCapture(e.pointerId);
  });
  cropViewport.addEventListener('pointermove', (e) => {
    if (!cropState || cropDragPointerId === null || e.pointerId !== cropDragPointerId) return;
    const dx = e.clientX - cropDragStart.x;
    const dy = e.clientY - cropDragStart.y;
    cropState.offsetX = cropDragStart.offsetX + dx;
    cropState.offsetY = cropDragStart.offsetY + dy;
    clampCropOffset();
    renderCropTransform();
  });
  function endCropDrag(){
    if (cropDragPointerId === null) return;
    cropViewport.classList.remove('dragging');
    try { cropViewport.releasePointerCapture(cropDragPointerId); } catch {}
    cropDragPointerId = null;
    cropDragStart = null;
  }
  cropViewport.addEventListener('pointerup', endCropDrag);
  cropViewport.addEventListener('pointercancel', endCropDrag);

  // 滑鼠滾輪縮放（桌機選用；觸控裝置以縮放滑桿操作）
  cropViewport.addEventListener('wheel', (e) => {
    if (!cropState) return;
    e.preventDefault();
    const range = (cropState.minScale * 4) - cropState.minScale;
    const delta = -e.deltaY * 0.0015 * range;
    let next = cropState.scale + delta;
    next = Math.max(parseFloat(cropZoomSlider.min), Math.min(parseFloat(cropZoomSlider.max), next));
    cropState.scale = next;
    cropZoomSlider.value = next;
    clampCropOffset();
    renderCropTransform();
  }, { passive: false });

  function exportCroppedAvatar(){
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = CROP_OUTPUT_SIZE;
      canvas.height = CROP_OUTPUT_SIZE;
      const ctx = canvas.getContext('2d');
      const outputScaleFactor = CROP_OUTPUT_SIZE / CROP_VIEWPORT_SIZE;

      ctx.save();
      ctx.translate(CROP_OUTPUT_SIZE / 2, CROP_OUTPUT_SIZE / 2);
      ctx.translate(cropState.offsetX * outputScaleFactor, cropState.offsetY * outputScaleFactor);
      ctx.rotate(cropState.rotation * Math.PI / 180);
      ctx.scale(cropState.scale * outputScaleFactor, cropState.scale * outputScaleFactor);
      ctx.drawImage(cropImg, -cropState.naturalWidth / 2, -cropState.naturalHeight / 2, cropState.naturalWidth, cropState.naturalHeight);
      ctx.restore();

      canvas.toBlob((blob) => {
        if (!blob) { resolve(null); return; }
        resolve(new File([blob], 'avatar.jpg', { type: 'image/jpeg', lastModified: Date.now() }));
      }, 'image/jpeg', 0.92);
    });
  }

  cropCancelBtn.addEventListener('click', () => closeAvatarCropModal(null));
  cropCloseBtn.addEventListener('click', () => closeAvatarCropModal(null));
  cropConfirmBtn.addEventListener('click', async () => {
    const croppedFile = await exportCroppedAvatar();
    closeAvatarCropModal(croppedFile);
  });

  const avatarFileInput = document.getElementById('avatar-file-input');
  const changeAvatarBtn = document.getElementById('change-avatar');
  const removeAvatarBtn = document.getElementById('remove-avatar');

  changeAvatarBtn.addEventListener('click', () => avatarFileInput.click());

  avatarFileInput.addEventListener('change', async () => {
    const file = avatarFileInput.files && avatarFileInput.files[0];
    avatarFileInput.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast(T().avatar.invalidImageToast);
      return;
    }

    // 先讓使用者裁切（位置／縮放／旋轉），取消則整個流程中止
    const croppedFile = await openAvatarCropModal(file);
    if (!croppedFile) return;

    const originalText = changeAvatarBtn.textContent;
    let finalFile = croppedFile;
    if (croppedFile.size > PHOTO_COMPRESS_THRESHOLD) {
      changeAvatarBtn.disabled = true;
      changeAvatarBtn.textContent = T().avatar.compressing;
      finalFile = await prepareImageForUpload(croppedFile);
      if (!finalFile) {
        changeAvatarBtn.disabled = false;
        changeAvatarBtn.textContent = originalText;
        showToast(T().avatar.tooLargeToast);
        return;
      }
    }

    changeAvatarBtn.disabled = true;
    changeAvatarBtn.textContent = T().avatar.uploading;

    const uploadResult = await uploadPhotoFile(finalFile, 'avatar');

    changeAvatarBtn.disabled = false;
    changeAvatarBtn.textContent = originalText;

    if (!uploadResult) {
      showToast(T().avatar.needCloudToast);
      return;
    }

    photoUrlCache.delete('avatar');
    currentConfig.avatarProvider = uploadResult.photoProvider;
    currentConfig.avatarRef = uploadResult.photoRef;
    currentConfig.updatedAt = new Date().toISOString();

    await refreshAvatarDisplay();

    const { driveSuccess, dropboxSuccess } = await syncConfigToCloud(currentConfig);
    showToast((driveSuccess || dropboxSuccess) ? T().avatar.updatedCloudToast : T().avatar.updatedLocalToast);
  });

  removeAvatarBtn.addEventListener('click', async () => {
    if (!(await showConfirmDialog(T().avatar.removeConfirmMsg, T().avatar.removeConfirmTitle))) return;
    if (currentConfig.avatarProvider && currentConfig.avatarRef) {
      deletePhotoFile({ id: 'avatar', photoProvider: currentConfig.avatarProvider, photoRef: currentConfig.avatarRef });
    }
    delete currentConfig.avatarProvider;
    delete currentConfig.avatarRef;
    currentConfig.updatedAt = new Date().toISOString();

    await refreshAvatarDisplay();

    const { driveSuccess, dropboxSuccess } = await syncConfigToCloud(currentConfig);
    showToast((driveSuccess || dropboxSuccess) ? T().avatar.removedCloudToast : T().avatar.removedLocalToast);
  });

  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    currentConfig = {
      ...currentConfig,
      name: document.getElementById('p-name').value,
      birth: document.getElementById('p-birth').value,
      gender: document.getElementById('p-gender').value,
      blood: document.getElementById('p-blood').value,
      phone: document.getElementById('p-phone').value,
      emergency: document.getElementById('p-emergency').value,
      emergencyPhone: document.getElementById('p-emergency-phone').value,
      height: document.getElementById('p-height').value,
      weight: document.getElementById('p-weight').value,
      allergy: document.getElementById('p-allergy').value,
      records: currentConfig.records || [],
      updatedAt: new Date().toISOString()
    };

    const { driveSuccess, dropboxSuccess } = await syncConfigToCloud(currentConfig);

    renderOverview();
    renderIdCard();

    if (driveSuccess || dropboxSuccess) {
      showToast(T().cloud.profileSavedToast);
    } else {
      showToast(T().cloud.needCloudToast);
    }
  });

  // 8. 登出
  async function handleLogout() {
    if (currentSessionId && auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, { [`sessions.${currentSessionId}`]: deleteField() }, { merge: true });
      } catch (err) {
        console.warn('登出時清除裝置紀錄失敗:', err);
      }
    }
    if (sessionsUnsubscribe) { sessionsUnsubscribe(); sessionsUnsubscribe = null; }
    stopSessionHeartbeat();
    sessionStorage.removeItem('drive_access_token');
    sessionStorage.removeItem('dropbox_access_token');
    sessionStorage.removeItem('dropbox_token_expires_at');
    sessionStorage.removeItem('dropbox_refresh_token');
    sessionStorage.removeItem('dropbox_pkce_verifier');
    await signOut(auth);
    window.location.href = 'index.html';
  }

  document.getElementById('logout-btn').addEventListener('click', handleLogout);

  let toastHideTimer = null;

  function showToast(text){
    const toast = document.getElementById('toast');
    document.getElementById('toast-text').textContent = text;
    toast.classList.add('show');
    if (toastHideTimer) clearTimeout(toastHideTimer);
    toastHideTimer = setTimeout(()=> toast.classList.remove('show'), 2600);
  }

  // 自訂確認視窗，取代瀏覽器原生 confirm()，回傳 Promise<boolean>
  function showConfirmDialog(message, title = T().confirm.defaultTitle){
    return new Promise((resolve) => {
      const backdrop = document.getElementById('confirm-backdrop');
      document.getElementById('confirm-title').textContent = title;
      document.getElementById('confirm-message').textContent = message;
      const okBtn = document.getElementById('confirm-ok');
      const cancelBtn = document.getElementById('confirm-cancel');

      function cleanup(result){
        backdrop.classList.remove('show');
        unlockBodyScroll();
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        backdrop.removeEventListener('click', onBackdropClick);
        resolve(result);
      }
      function onOk(){ cleanup(true); }
      function onCancel(){ cleanup(false); }
      function onBackdropClick(e){ if (e.target === backdrop) cleanup(false); }

      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
      backdrop.addEventListener('click', onBackdropClick);

      backdrop.classList.add('show');
      lockBodyScroll();
    });
  }

  // 載入中提示：不會自動消失，直到被 showToast() 覆蓋或呼叫 hideLoadingToast()
  function showLoadingToast(text){
    const toast = document.getElementById('toast');
    document.getElementById('toast-text').textContent = text;
    toast.classList.add('show');
    if (toastHideTimer) { clearTimeout(toastHideTimer); toastHideTimer = null; }
  }
  function hideLoadingToast(){
    const toast = document.getElementById('toast');
    if (toastHideTimer) return; // 已經有其他 toast 接手顯示，不需處理
    toast.classList.remove('show');
  }

  // ---- 背景捲動鎖定（開啟小視窗時，避免後方頁面跟著捲動）----
  let openModalCount = 0;
  function lockBodyScroll(){
    openModalCount++;
    if (openModalCount === 1) document.body.style.overflow = 'hidden';
  }
  function unlockBodyScroll(){
    openModalCount = Math.max(0, openModalCount - 1);
    if (openModalCount === 0) document.body.style.overflow = '';
  }

  // 模態框操作
  const accessBackdrop = document.getElementById('access-backdrop');
  const accessForm = document.getElementById('access-form');

  function openAccessModal() {
    accessForm.reset();
    document.getElementById('a-scope-custom').style.display = 'none';
    document.getElementById('a-expiry-date-field').style.display = 'none';
    accessBackdrop.classList.add('show');
    lockBodyScroll();
  }
  function closeAccessModal(){ accessBackdrop.classList.remove('show'); unlockBodyScroll(); }
  document.getElementById('add-access-btn').addEventListener('click', openAccessModal);
  document.getElementById('access-close').addEventListener('click', closeAccessModal);
  document.getElementById('access-cancel').addEventListener('click', closeAccessModal);

  document.getElementById('a-scope').addEventListener('change', (e) => {
    document.getElementById('a-scope-custom').style.display = (e.target.value === 'custom') ? 'block' : 'none';
  });
  document.getElementById('a-expiry').addEventListener('change', (e) => {
    document.getElementById('a-expiry-date-field').style.display = (e.target.value === 'custom') ? 'block' : 'none';
  });

  function computeExpiryDate() {
    const mode = document.getElementById('a-expiry').value;
    if (mode === 'permanent') return null;
    if (mode === 'custom') return document.getElementById('a-expiry-date').value || null;
    const days = parseInt(mode, 10);
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  accessForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = accessForm.querySelector('button[type="submit"]');
    const email = document.getElementById('a-email').value.trim();
    if (!email) return;

    const scope = document.getElementById('a-scope').value;
    const recordTypes = scope === 'custom'
      ? ['lab', 'med', 'img', 'visit'].filter(t => document.getElementById(`a-type-${t}`).checked)
      : [];

    const aes = await generateAESKey();
    const grant = {
      id: 'grant_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      type: document.getElementById('a-type').value,
      email,
      name: document.getElementById('a-name').value.trim(),
      scope,
      recordTypes,
      expiryDate: computeExpiryDate(),
      note: document.getElementById('a-note').value.trim(),
      shareKey: aes.base64,
      createdAt: new Date().toISOString()
    };

    closeAccessModal();

    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = T().cloud.encryptingUploadingLabel;
    const shareUrl = await createOrUpdateShareLink(grant);
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;

    if (!shareUrl) {
      showToast(T().cloud.shareCreateFailedToast);
      return;
    }

    currentConfig.accessList = currentConfig.accessList || [];
    currentConfig.accessList.push(grant);
    currentConfig.updatedAt = new Date().toISOString();
    renderAccessList();
    renderOverview();

    const inviteCreated = await createInviteRecord(grant);
    const { driveSuccess, dropboxSuccess } = await syncConfigToCloud(currentConfig);

    const readEnabled = (grant.shareProvider === 'drive') ? DRIVE_SHARE_ENABLED : DROPBOX_SHARE_ENABLED;
    if (!readEnabled) {
      showToast(T().cloud.shareCreatedNoKeyToast);
    } else if (inviteCreated) {
      showToast(T().cloud.accessAddedToast);
    } else {
      showToast(T().cloud.shareCreatedNotifyFailedToast);
    }
  });
