 // --- 多語言翻譯內容改為與主畫面共用同一個檔案（i18n.js）---
 import { legalTranslations, loginTranslations as translations, LANGUAGE_STORAGE_KEY } from "./i18n.js";

 // --- Firebase 以動態 import 載入，並用 try/catch 包起來 ---
 let initializeApp, getAuth, GoogleAuthProvider, signInWithPopup,
     createUserWithEmailAndPassword, signInWithEmailAndPassword,
     sendPasswordResetEmail, updateProfile;
 let app, auth, googleProvider;
 let firebaseReady = false;
 let firebaseLoadError = null;

 try {
   const [{ initializeApp: _initializeApp }, authModule] = await Promise.all([
     import("https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js"),
     import("https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js")
   ]);
   ({
     getAuth, GoogleAuthProvider, signInWithPopup,
     createUserWithEmailAndPassword, signInWithEmailAndPassword,
     sendPasswordResetEmail, updateProfile
   } = authModule);
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
   googleProvider = new GoogleAuthProvider();
   googleProvider.setCustomParameters({ prompt: 'select_account' });
   googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

   firebaseReady = true;
 } catch (err) {
   firebaseLoadError = err;
   console.error('Firebase 載入失敗，帳號相關功能將無法使用（但介面互動仍可正常運作）:', err);
 }

 const tabSignin = document.getElementById('tab-signin');
 const tabSignup = document.getElementById('tab-signup');
 const heading = document.getElementById('heading');
 const eyebrow = document.getElementById('eyebrow');
 const nameField = document.getElementById('name-field');
 const submitBtn = document.getElementById('submit-btn');
 const footText = document.getElementById('foot-text');
 const footSwitch = document.getElementById('foot-switch');
 const passwordInput = document.getElementById('password');
 const googleBtn = document.getElementById('google-btn');
 const languageSelect = document.getElementById('language-select');

 window.openModal = function(id) {
   document.getElementById(id)?.classList.add('show');
 }
 window.closeModal = function(id) {
   document.getElementById(id)?.classList.remove('show');
 }

 function bindModalEvents() {
   document.getElementById('open-tos-btn')?.addEventListener('click', () => window.openModal('tos-modal'));
   document.getElementById('open-privacy-btn')?.addEventListener('click', () => window.openModal('privacy-modal'));
 }

 document.querySelectorAll('.modal-overlay').forEach(overlay => {
   overlay.addEventListener('click', (e) => {
     if (e.target === overlay) overlay.classList.remove('show');
   });
 });

 let mode = 'signin';


 let currentLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || navigator.language;
 if (!translations[currentLanguage]) {
 const langPrefix = currentLanguage.split('-')[0];
 if (langPrefix === 'zh') currentLanguage = currentLanguage.includes('CN') ? 'zh-CN' : 'zh-TW';
 else if (langPrefix === 'ja') currentLanguage = 'ja';
 else if (langPrefix === 'ko') currentLanguage = 'ko';
 else currentLanguage = 'en';
 }

 function setMode(next){
 mode = next;
 const t = translations[currentLanguage] || translations['zh-TW'];
 const isSignup = mode === 'signup';

 tabSignin.textContent = t.signIn;
 tabSignup.textContent = t.signUp;

 tabSignin.classList.toggle('active', !isSignup);
 tabSignup.classList.toggle('active', isSignup);
 tabSignin.setAttribute('aria-selected', String(!isSignup));
 tabSignup.setAttribute('aria-selected', String(isSignup));
 nameField.style.display = isSignup ? 'block' : 'none';

 const forgotBtn = document.getElementById('forgot-password-btn');
 if (forgotBtn) {
   forgotBtn.style.display = isSignup ? 'none' : 'inline-block';
 }

 heading.textContent = isSignup ? t.signUpTitle : t.signInTitle;
 eyebrow.textContent = isSignup ? t.start : t.welcome;
 submitBtn.textContent = isSignup ? t.create : t.signIn;
 footText.textContent = isSignup ? t.hasAccount : t.noAccount;
 footSwitch.textContent = isSignup ? t.signIn : t.createAccount;
 passwordInput.setAttribute('autocomplete', isSignup ? 'new-password' : 'current-password');
 clearErrors();
 }

 function applyLanguage(lang){
 const t = translations[lang] || translations['zh-TW'];
 const legal = legalTranslations[lang] || legalTranslations['zh-TW'];

 currentLanguage = lang;
 localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
 document.documentElement.lang = t.htmlLang;
 document.title = t.title;
 
 const brandMark = document.querySelector('.brand-mark');
 if (brandMark && brandMark.lastChild) brandMark.lastChild.textContent = ' ' + t.brandMark;
 
 document.querySelector('.brand-copy h1').innerHTML = t.h1;
 document.querySelector('.brand-copy p').textContent = t.brandDesc;
 document.querySelector('.trust span').textContent = t.trust;
 document.getElementById('google-btn').lastChild.textContent = ' ' + t.google;
 document.querySelector('.divider').textContent = t.orEmail;
 document.querySelector('label[for="name"]').textContent = t.name;
 document.getElementById('name').placeholder = t.namePh;
 document.querySelector('label[for="email"]').textContent = t.email;
 document.getElementById('email').placeholder = t.emailPh;
 document.querySelector('label[for="password"]').textContent = t.password;
 passwordInput.placeholder = t.passwordPh;

 const forgotBtn = document.getElementById('forgot-password-btn');
 if (forgotBtn) forgotBtn.textContent = t.forgotPassword;

 document.querySelector('#name-field .err').textContent = t.errName;
 document.querySelector('#email-field .err').textContent = t.errEmail;
 document.querySelector('#password-field .err').textContent = t.errPassword;
 document.querySelector('.legal').innerHTML = `${t.terms}<br>${t.privacy}`;
 
 if (legal) {
   const tosModal = document.getElementById('tos-modal');
   if (tosModal) {
     tosModal.querySelector('h3').textContent = legal.tosTitle;
     tosModal.querySelector('.modal-content').innerHTML = legal.tosContent;
   }

   const privacyModal = document.getElementById('privacy-modal');
   if (privacyModal) {
     privacyModal.querySelector('h3').textContent = legal.privacyTitle;
     privacyModal.querySelector('.modal-content').innerHTML = legal.privacyContent;
   }
 }

 bindModalEvents();
 
 languageSelect.value = lang;
 setMode(mode);
 }

 tabSignin.addEventListener('click', () => setMode('signin'));
 tabSignup.addEventListener('click', () => setMode('signup'));
 footSwitch.addEventListener('click', () => setMode(mode === 'signin' ? 'signup' : 'signin'));
 languageSelect.addEventListener('change', e => applyLanguage(e.target.value));

 function clearErrors(){
 document.querySelectorAll('.field').forEach(f => f.classList.remove('invalid'));
 }

 function showToast(text){
 const toast = document.getElementById('toast');
 document.getElementById('toast-text').textContent = text;
 toast.classList.add('show');
 setTimeout(()=> toast.classList.remove('show'), 2600);
 }

 function setLoading(isLoading){
 const forgotBtn = document.getElementById('forgot-password-btn');
 submitBtn.disabled = isLoading;
 googleBtn.disabled = isLoading;
 if (forgotBtn) forgotBtn.disabled = isLoading;
 }

 function translateAuthError(code){
 const t = translations[currentLanguage] || translations['zh-TW'];
 return t.errors[code] || t.generic;
 }

 document.getElementById('forgot-password-btn')?.addEventListener('click', async () => {
 clearErrors();
 const t = translations[currentLanguage] || translations['zh-TW'];

 if(!firebaseReady){
 showToast(t.generic);
 return;
 }

 const email = document.getElementById('email').value.trim();
 const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

 if(!emailOk){
 document.getElementById('email-field').classList.add('invalid');
 showToast(t.enterEmailPrompt);
 return;
 }

 setLoading(true);
 try {
 await sendPasswordResetEmail(auth, email);
 showToast(t.resetSentToast);
 } catch (err) {
 console.error(err);
 showToast(translateAuthError(err.code));
 } finally {
 setLoading(false);
 }
 });

 applyLanguage(currentLanguage);

 googleBtn.addEventListener('click', async () => {
 const t0 = translations[currentLanguage] || translations['zh-TW'];
 if(!firebaseReady){
 showToast(t0.generic);
 return;
 }
 setLoading(true);
 try {
 const result = await signInWithPopup(auth, googleProvider);
 const credential = GoogleAuthProvider.credentialFromResult(result);
 
 if (credential && credential.accessToken) {
 sessionStorage.setItem('drive_access_token', credential.accessToken);
 }

 const t = translations[currentLanguage] || translations['zh-TW'];
 showToast(`${t.welcomeUser}${result.user.displayName || result.user.email}`);
 window.location.href = 'dashboard-zhtw.html';
 } catch (err) {
 console.error(err);
 showToast(translateAuthError(err.code));
 } finally {
 setLoading(false);
 }
 });

 document.getElementById('auth-form').addEventListener('submit', async (e) => {
 e.preventDefault();
 clearErrors();
 let valid = true;

 const name = document.getElementById('name').value.trim();
 if(mode === 'signup' && !name){
 document.getElementById('name-field').classList.add('invalid');
 valid = false;
 }

 const email = document.getElementById('email').value.trim();
 const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
 if(!emailOk){
 document.getElementById('email-field').classList.add('invalid');
 valid = false;
 }

 const password = document.getElementById('password').value;
 if(password.length < 6){
 document.getElementById('password-field').classList.add('invalid');
 valid = false;
 }

 if(!valid) return;

 const t = translations[currentLanguage] || translations['zh-TW'];
 if(!firebaseReady){
 showToast(t.generic);
 return;
 }

 setLoading(true);
 try {
 const recaptchaToken = await new Promise((resolve, reject) => {
   if (typeof grecaptcha === 'undefined') {
     reject(new Error('reCAPTCHA SDK 未載入'));
     return;
   }
   grecaptcha.ready(() => {
     grecaptcha.execute('6LdmRI0tAAAAADVz24cBddUISehgAZqtO9r2Qmp4', { action: mode })
       .then(resolve)
       .catch(reject);
   });
 });

 if(mode === 'signup'){
 const cred = await createUserWithEmailAndPassword(auth, email, password);
 await updateProfile(cred.user, { displayName: name });
 showToast(t.successSignup);
 } else {
 await signInWithEmailAndPassword(auth, email, password);
 showToast(t.successSignin);
 }
 window.location.href = 'dashboard-zhtw.html';
 } catch (err) {
 console.error(err);
 showToast(translateAuthError(err.code));
 } finally {
 setLoading(false);
 }
 });
