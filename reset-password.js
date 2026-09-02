 // --- 多語言翻譯內容（與登入頁共用同一個檔案 i18n.js）---
 import { resetPasswordTranslations as translations, LANGUAGE_STORAGE_KEY } from "./i18n.js?v=6";

 // --- Firebase 以動態 import 載入，並用 try/catch 包起來 ---
 let initializeApp, getAuth, verifyPasswordResetCode, confirmPasswordReset;
 let app, auth;
 let firebaseReady = false;

 try {
   const [{ initializeApp: _initializeApp }, authModule] = await Promise.all([
     import("https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js"),
     import("https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js")
   ]);
   ({ getAuth, verifyPasswordResetCode, confirmPasswordReset } = authModule);
   initializeApp = _initializeApp;

   const firebaseConfig = {
     apiKey: "AIzaSyDsKJOzaQKosJeJgUfZXBc0pahDzBKV7e8",
     authDomain: "tmu-medical.firebaseapp.com",
     projectId: "tmu-medical",
     storageBucket: "tmu-medical.firebasestorage.app",
     messagingSenderId: "370307905675",
     appId: "1:370307905675:web:bcb25f57995fbe5965fc8e",
     measurementId: "G-4YVJDN5Y7C"
   };

   app = initializeApp(firebaseConfig);
   auth = getAuth(app);
   firebaseReady = true;
 } catch (err) {
   console.error('Firebase 載入失敗:', err);
 }

 // --- 多語言 ---
 let currentLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || navigator.language;
 if (!translations[currentLanguage]) {
   const langPrefix = currentLanguage.split('-')[0];
   if (langPrefix === 'zh') currentLanguage = currentLanguage.includes('CN') ? 'zh-CN' : 'zh-TW';
   else if (langPrefix === 'ja') currentLanguage = 'ja';
   else if (langPrefix === 'ko') currentLanguage = 'ko';
   else currentLanguage = 'en';
 }

 const languageSelect = document.getElementById('language-select');

 function applyLanguage(lang){
   currentLanguage = translations[lang] ? lang : 'zh-TW';
   localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
   const t = translations[currentLanguage];

   document.title = t.title;
   if (languageSelect) languageSelect.value = currentLanguage;

   document.getElementById('verifying-eyebrow').textContent = t.verifyingEyebrow;
   document.getElementById('verifying-heading').textContent = t.verifyingHeading;

   document.getElementById('form-eyebrow').textContent = t.formEyebrow;
   document.getElementById('form-heading').textContent = t.formHeading;
   if (verifiedEmail) {
     document.getElementById('account-email-line').textContent = t.accountEmailLine(verifiedEmail);
   }

   document.getElementById('new-password-label').textContent = t.newPassword;
   document.getElementById('new-password').placeholder = t.newPasswordPh;
   document.getElementById('new-password-err').textContent = t.errPasswordShort;

   document.getElementById('confirm-password-label').textContent = t.confirmPassword;
   document.getElementById('confirm-password').placeholder = t.confirmPasswordPh;
   document.getElementById('confirm-password-err').textContent = t.errPasswordMismatch;

   document.getElementById('submit-btn').textContent = t.submit;

   document.getElementById('success-eyebrow').textContent = t.successEyebrow;
   document.getElementById('success-heading').textContent = t.successHeading;
   document.getElementById('success-desc').textContent = t.successDesc;
   document.getElementById('back-to-login-btn').textContent = t.backToLogin;

   document.getElementById('error-eyebrow').textContent = t.errorEyebrow;
   document.getElementById('error-heading').textContent = t.errorHeading;
   document.getElementById('error-desc').textContent = errorDescOverride || t.errorDesc;
   document.getElementById('request-new-link-btn').textContent = t.requestNewLink;
 }

 languageSelect?.addEventListener('change', e => applyLanguage(e.target.value));

 function showToast(text){
   const toast = document.getElementById('toast');
   document.getElementById('toast-text').textContent = text;
   toast.classList.add('show');
   setTimeout(() => toast.classList.remove('show'), 2600);
 }

 function showState(name){
   ['verifying', 'form', 'success', 'error'].forEach(s => {
     document.getElementById('state-' + s).style.display = (s === name) ? 'block' : 'none';
   });
 }

 function clearErrors(){
   document.querySelectorAll('.field').forEach(f => f.classList.remove('invalid'));
 }

 function translateAuthError(code){
   const t = translations[currentLanguage] || translations['zh-TW'];
   return t.errors[code] || t.genericError;
 }

 // --- 解析網址參數（Firebase 重設密碼連結會帶上 mode / oobCode）---
 const params = new URLSearchParams(window.location.search);
 const mode = params.get('mode');
 const oobCode = params.get('oobCode');

 let verifiedEmail = null;
 let errorDescOverride = null;

 async function init(){
   applyLanguage(currentLanguage);

   if (!firebaseReady) {
     errorDescOverride = translations[currentLanguage].genericError;
     applyLanguage(currentLanguage);
     showState('error');
     return;
   }

   if (mode !== 'resetPassword' || !oobCode) {
     showState('error');
     return;
   }

   try {
     // 驗證重設連結是否仍然有效，並取得對應的帳號 Email
     verifiedEmail = await verifyPasswordResetCode(auth, oobCode);
     const t = translations[currentLanguage];
     document.getElementById('account-email-line').textContent = t.accountEmailLine(verifiedEmail);
     document.getElementById('account-email-line').style.display = 'block';
     showState('form');
   } catch (err) {
     console.error('重設連結驗證失敗:', err);
     errorDescOverride = translateAuthError(err.code);
     applyLanguage(currentLanguage);
     showState('error');
   }
 }

 document.getElementById('reset-form').addEventListener('submit', async (e) => {
   e.preventDefault();
   clearErrors();
   const t = translations[currentLanguage];

   const newPassword = document.getElementById('new-password').value;
   const confirmPassword = document.getElementById('confirm-password').value;
   let valid = true;

   if (newPassword.length < 6) {
     document.getElementById('new-password-field').classList.add('invalid');
     valid = false;
   }
   if (newPassword !== confirmPassword) {
     document.getElementById('confirm-password-field').classList.add('invalid');
     valid = false;
   }
   if (!valid) return;

   const submitBtn = document.getElementById('submit-btn');
   submitBtn.disabled = true;
   submitBtn.textContent = t.updating;

   try {
     await confirmPasswordReset(auth, oobCode, newPassword);
     showState('success');
   } catch (err) {
     console.error('密碼重設失敗:', err);
     showToast(translateAuthError(err.code));
     submitBtn.disabled = false;
     submitBtn.textContent = t.submit;
   }
 });

 document.getElementById('back-to-login-btn').addEventListener('click', () => {
   window.location.href = 'index.html';
 });
 document.getElementById('request-new-link-btn').addEventListener('click', () => {
   window.location.href = 'index.html';
 });

 init();
