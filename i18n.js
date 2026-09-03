// ============================================================================
// 健康庫 LogVita — 共用多語言翻譯模組 (i18n.js)
// 供 index.html（登入頁）與 dashboard-zhtw.html（主畫面）共用。
// ============================================================================

export const SUPPORTED_LANGUAGES = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko'];
export const LANGUAGE_STORAGE_KEY = 'healthkeep-language';

// 根據瀏覽器語言 / localStorage 判斷目前應使用的語言代碼
export function detectLanguage() {
  let lang = localStorage.getItem(LANGUAGE_STORAGE_KEY) || navigator.language;
  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    const prefix = lang.split('-')[0];
    if (prefix === 'zh') lang = lang.includes('CN') ? 'zh-CN' : 'zh-TW';
    else if (prefix === 'ja') lang = 'ja';
    else if (prefix === 'ko') lang = 'ko';
    else lang = 'en';
  }
  return lang;
}

export function saveLanguage(lang) {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

export const legalTranslations = {
  'zh-TW': {
    tosTitle: '服務條款（Terms of Service）',
    privacyTitle: '隱私政策（Privacy Policy）',
    tosContent: `
      <div class="modal-date">生效日期：2026 年 1 月 1 日｜最新更新日期：2026 年 8 月 19 日</div>
      <p>歡迎使用「健康庫 LogVita」（以下簡稱「本服務」）。本服務條款構成您（使用者）與本服務之間的法律協議。請在註冊或使用本服務前仔細閱讀以下條款。</p>
      <h4>一、 服務內容與定位</h4>
      <ul>
        <li><strong>個人健康資訊管理平台：</strong> 本服務提供檢驗報告、用藥紀錄、就診紀錄及影像資料等個人健康紀錄之儲存、整合與雲端同步功能。</li>
        <li><strong>非醫療診斷服務：</strong> 本服務僅作為個人健康紀錄與數據整理工具，不提供任何形式之醫療診斷、治療建議、處方或急救服務。如您有任何醫療需求，請務必諮詢專業醫療人員。</li>
      </ul>
      <h4>二、 帳號註冊與安全</h4>
      <ul>
        <li><strong>註冊資料：</strong> 您於註冊時應提供真實、準確且完整的個人資料（如姓名、電子郵件）。</li>
        <li><strong>帳號保管責任：</strong> 您有責任妥善保管您的登入帳號及密碼。任何使用您帳號進行的活動，均由您承擔相應責任。</li>
        <li><strong>裝置與第三方雲端授權：</strong>
          <ul>
            <li>本服務支援連結第三方雲端儲存空間（如 Google Drive、Dropbox）以備份與同步您的健康紀錄。</li>
            <li>授權第三方儲存空間時，您需遵循該第三方服務之使用規範與條款。</li>
          </ul>
        </li>
      </ul>
      <h4>三、 授權管理與分享</h4>
      <ul>
        <li><strong>個人授權控制：</strong> 您可透過本服務之「授權管理」功能，自訂授權對象（如家庭成員或特定醫療人員）存取、檢視或匯入您的健康紀錄。</li>
        <li><strong>授權撤銷：</strong> 您可隨時於後台撤銷特定人員或機構的存取權限。</li>
        <li><strong>使用者責任：</strong> 請謹慎評估授權對象，因您授權之第三方使用或洩露您資料所生之責任，應由您與該第三方自行承擔。</li>
      </ul>
      <h4>四、 禁止行為</h4>
      <p>在使用本服務時，您不得：</p>
      <ul>
        <li>提供虛假、冒用他人身分之資料。</li>
        <li>企圖未經授權存取他人帳號、系統或網路。</li>
        <li>上傳任何包含病毒、惡意程式或危害本服務運作之檔案。</li>
        <li>將本服務用於任何非法目的或違反適用法律規範之行為。</li>
      </ul>
      <h4>五、 帳號終止與資料刪除</h4>
      <ul>
        <li><strong>使用者自主刪除：</strong> 您可隨時於帳號設定頁面申請「刪除帳號」。</li>
        <li><strong>刪除後果：</strong> 帳號刪除後，您儲存於本服務系統內的個人健康紀錄將被永久移除且無法複原。如資料已備份於您個人連結之第三方雲端空間（如 Google Drive / Dropbox），請自行至該平台處理。</li>
      </ul>
      <h4>六、 免責聲明與責任限制</h4>
      <ul>
        <li><strong>服務維持：</strong> 我們努力維持本服務之穩定與安全，但無法保證服務永遠不受中斷、延遲或錯誤。</li>
        <li><strong>第三方服務：</strong> 本服務整合 Google、Dropbox、Firebase 及 Google reCAPTCHA 等第三方技術。對於第三方服務之暫停、變更或中斷所致之損失，本服務不承擔相關賠償責任。</li>
      </ul>
      <h4>七、 條款修訂</h4>
      <p>本服務保留隨時修改本服務條款之權利。修改後的條款將於本網站公告，若您在修訂後繼續使用本服務，即視為您已接受修訂後的條款。</p>
    `,
    privacyContent: `
      <div class="modal-date">生效日期：2026 年 1 月 1 日｜最新更新日期：2026 年 8 月 19 日</div>
      <p>「健康庫 LogVita」（以下簡稱「我們」）非常重視您的個人隱私與健康資料安全。本隱私政策說明我們如何收集、使用、儲存及保護您的個人資料。</p>
      <h4>一、 個人資料的收集類別</h4>
      <ul>
        <li><strong>基本帳號資料：</strong> 姓名、電子郵件地址、登入密碼（加密處理）。</li>
        <li><strong>個人檔案資料：</strong> 出生日期、性別、血型、身高、體重、聯絡電話、緊急聯絡人及過敏史。</li>
        <li><strong>健康紀錄數據：</strong> 檢驗報告、用藥紀錄、診斷摘要、就診紀錄及相關醫療影像。</li>
        <li><strong>系統與技術數據：</strong> IP 地址、登入裝置類型、作業系統、時區與地理位置資訊以及 reCAPTCHA 安全驗證數據。</li>
      </ul>
      <h4>二、 資料的使用目的</h4>
      <ul>
        <li>提供、運作及維護本服務之各項功能（如健康紀錄呈現、雲端備份）。</li>
        <li>提供安全性驗證與防護（如 reCAPTCHA v3 機器人驗證、登入裝置管理）。</li>
        <li>發送重要系統通知（如授權變更、新報告上傳通知、帳號安全警告）。</li>
        <li><strong>去識別化研究（選擇性）：</strong> 僅在您明確開啟「去識別化資料用於醫學研究」選項時，我們才會將完全移除個人識別資訊之數據用於公共衛生與醫學研究。</li>
      </ul>
      <h4>三、 資料儲存與第三方服務整合</h4>
      <ul>
        <li><strong>加密與安全：</strong> 您的健康資料採傳輸與儲存加密技術，僅限您本人與您明確授權之人員讀取。</li>
        <li><strong>雲端儲存整合：</strong> 當您選擇連結 Google Drive 或 Dropbox 時，本服務僅會存取並寫入應用程式專屬目錄（如 logvita_config.json），用於跨裝置同步與備份。我們不會存取您第三方雲端硬碟中與本服務無關的其他檔案。</li>
        <li><strong>第三方 SDK 與服務：</strong> Firebase (Google) 與 Google reCAPTCHA v3。</li>
      </ul>
      <h4>四、 資料分享與第三方揭露</h4>
      <p>我們絕不會將您的個人健康資料出售或出租給任何廣告商或第三方機構。僅在以下情況下，資料才會被分享或揭露：</p>
      <ul>
        <li><strong>您的主動授權：</strong> 當您在「授權管理」中授權家庭成員或醫療人員時。</li>
        <li><strong>法律要求：</strong> 當司法機關或政府主管機關基於法定程序要求提供時。</li>
      </ul>
      <h4>五、 您的權利</h4>
      <ul>
        <li><strong>查詢與閱覽：</strong> 您可隨時登入本服務查看您的個人檔案與健康紀錄。</li>
        <li><strong>補充或更正：</strong> 您可自由編輯並更新您的個人檔案內容。</li>
        <li><strong>關閉授權與通知：</strong> 您可於「隱私設定」中隨時關閉家人查看權限、通知偏好或研究資料分享選項。</li>
        <li><strong>刪除資料與撤銷授權：</strong> 您可隨時撤銷授權，亦可直接點選「刪除我的帳號」，系統將永久刪除您的個人紀錄。</li>
      </ul>
    `
  },
  'zh-CN': {
    tosTitle: '服务条款 (Terms of Service)',
    privacyTitle: '隐私政策 (Privacy Policy)',
    tosContent: `
      <div class="modal-date">生效日期： 2026 年 1 月 1 日｜最新更新日期： 2026 年 8 月 19 日</div>
      <p>欢迎使用“健康库 LogVita”（以下简称“本服务”）。本服务条款构成您（使用者）与本服务之间的法律协议。请在注册或使用本服务前仔细阅读以下条款。</p>
      <h4>一、 服务内容与定位</h4>
      <ul>
        <li><strong>个人健康信息管理平台：</strong> 本服务提供检验报告、用药记录、就诊记录及影像资料等个人健康记录之存储、整合与云端同步功能。</li>
        <li><strong>非医疗诊断服务：</strong> 本服务仅作为个人健康记录与数据整理工具，不提供任何形式之医疗诊断、治疗建议、处方或急救服务。如您有任何医疗需求，请务必咨询专业医疗人员。</li>
      </ul>
      <h4>二、 账号注册与安全</h4>
      <ul>
        <li><strong>注册资料：</strong> 您于注册时应提供真实、准确且完整的个人资料（如姓名、电子邮件）。</li>
        <li><strong>账号保管责任：</strong> 您有责任妥善保管您的登录账号及密码。任何使用您账号进行的活动，均由您承担相应责任。</li>
        <li><strong>设备与第三方云端授权：</strong>
          <ul>
            <li>本服务支持链接第三方云端存储空间（如 Google Drive、Dropbox）以备份与同步您的健康记录。</li>
            <li>授权第三方存储空间时，您需遵循该第三方服务之使用规范与条款。</li>
          </ul>
        </li>
      </ul>
      <h4>三、 授权管理与分享</h4>
      <ul>
        <li><strong>个人授权控制：</strong> 您可通过本服务之“授权管理”功能，自定授权对象（如家庭成员或特定医疗人员）查看、检视或导入您的健康记录。</li>
        <li><strong>授权撤销：</strong> 您可随时于后台撤销特定人员或机构的访问权限。</li>
        <li><strong>使用者责任：</strong> 请谨慎评估授权对象，因您授权之第三方使用或泄露您资料所生之责任，应由您与该第三方自行承担。</li>
      </ul>
      <h4>四、 禁止行为</h4>
      <p>在使用本服务时，您不得：</p>
      <ul>
        <li>提供虚假、冒用他人身份之资料。</li>
        <li>企图未经授权访问他人账号、系统或网络。</li>
        <li>上传任何包含病毒、恶意程序或危害本服务运作之文件。</li>
        <li>将本服务用于任何非法目的或违反适用法律规范之行为。</li>
      </ul>
      <h4>五、 账号终止与资料删除</h4>
      <ul>
        <li><strong>使用者自主删除：</strong> 您可随时于账号设置页面申请“删除账号”。</li>
        <li><strong>删除后果：</strong> 账号删除后，您存储于本服务系统内的个人健康记录将被永久移除且无法复原。如资料已备份于您个人链接之第三方云端空间（如 Google Drive / Dropbox），请自行至该平台处理。</li>
      </ul>
      <h4>六、 免责声明与责任限制</h4>
      <ul>
        <li><strong>服务维持：</strong> 我们努力维持本服务之稳定与安全，但无法保证服务永远不受中断、延迟或错误。</li>
        <li><strong>第三方服务：</strong> 本服务整合 Google、Dropbox、Firebase 及 Google reCAPTCHA 等第三方技术。对于第三方服务之暂停、变更或中断所致之损失，本服务不承担相关赔偿责任。</li>
      </ul>
      <h4>七、 条款修订</h4>
      <p>本服务保留随时修改本服务条款之权利。修改后的条款将于本网站公告，若您在修订后继续使用本服务，即视为您已接受修订后的条款。</p>
    `,
    privacyContent: `
      <div class="modal-date">生效日期： 2026 年 1 月 1 日｜最新更新日期： 2026 年 8 月 19 日</div>
      <p>“健康库 LogVita”（以下简称“我们”）非常重视您的个人隐私与健康数据安全。本隐私政策说明我们如何收集、使用、存储及保护您的个人资料。</p>
      <h4>一、 个人资料的收集类别</h4>
      <ul>
        <li><strong>基本账号资料：</strong> 姓名、电子邮件地址、登录密码（加密处理）。</li>
        <li><strong>个人档案资料：</strong> 出生日期、性别、血型、身高、体重、联系电话、紧急联系人及过敏史。</li>
        <li><strong>健康记录数据：</strong> 检验报告、用药记录、诊断摘要、就诊记录及相关医疗影像。</li>
        <li><strong>系统与技术数据：</strong> IP 地址、登录设备类型、操作系统、时区与地理位置信息以及 reCAPTCHA 安全验证数据。</li>
      </ul>
      <h4>二、 资料的使用目的</h4>
      <ul>
        <li>提供、运作及维护本服务之各项功能（如健康记录呈现、云端备份）。</li>
        <li>提供安全性验证与防护（如 reCAPTCHA v3 机器人验证、登录设备管理）。</li>
        <li>发送重要系统通知（如授权变更、新报告上传通知、账号安全警告）。</li>
        <li><strong>去识别化研究（选择性）：</strong> 仅在您明确开启“去识别化资料用于医学研究”选项时，我们才會将完全移除个人识别信息之数据用于公共卫生与医学研究。</li>
      </ul>
      <h4>三、 资料存储与第三方服务整合</h4>
      <ul>
        <li><strong>加密与安全：</strong> 您的健康资料采传输与存储加密技术，仅限您本人与您明确授权之人员读取。</li>
        <li><strong>云端存储整合：</strong> 当您选择链接 Google Drive 或 Dropbox 时，本服务仅会访问并写入应用程序专属目录（如 logvita_config.json），用于跨设备同步与备份。我们不会访问您第三方云端硬盘中与本服务无关的其他文件。</li>
        <li><strong>第三方 SDK 与服务：</strong> Firebase (Google) 与 Google reCAPTCHA v3。</li>
      </ul>
      <h4>四、 资料分享与第三方披露</h4>
      <p>我们绝不会将您的个人健康资料出售或出租给任何广告商或第三方机构。仅在以下情况下，资料才会被分享或披露：</p>
      <ul>
        <li><strong>您的主动授权：</strong> 当您在“授权管理”中授权家庭成员或医疗人员时。</li>
        <li><strong>法律要求：</strong> 当司法机关或政府主管机关基于法定程序要求提供时。</li>
      </ul>
      <h4>五、 您的权利</h4>
      <ul>
        <li><strong>查询与阅览：</strong> 您可随时登录本服务查看您的个人档案与健康记录。</li>
        <li><strong>补充或更正：</strong> 您可自由编辑并更新您的个人档案内容。</li>
        <li><strong>关闭授权与通知：</strong> 您可于“隐私设置”中随时关闭家人查看权限、通知偏好或研究资料分享选项。</li>
        <li><strong>删除资料与撤销授权：</strong> 您可随时撤销授权，亦可直接点击“删除我的账号”，系统将永久删除您的个人记录。</li>
      </ul>
    `
  },
  'en': {
    tosTitle: 'Terms of Service',
    privacyTitle: 'Privacy Policy',
    tosContent: `
      <div class="modal-date">Effective Date: January 1, 2026 | Last Updated: August 19, 2026</div>
      <p>Welcome to LogVita ("the Service"). These Terms of Service constitute a legal agreement between you ("User") and the Service. Please read these terms carefully before registering or using the Service.</p>
      <h4>1. Scope and Nature of Service</h4>
      <ul>
        <li><strong>Personal Health Management Platform:</strong> The Service provides features for storing, integrating, and cloud-synchronizing personal health records, including lab reports, medication histories, visit records, and medical images.</li>
        <li><strong>Non-Medical Service:</strong> The Service is strictly a record-keeping and data organization tool. It does not provide medical diagnosis, treatment advice, prescriptions, or emergency services. Always consult a qualified medical professional for health concerns.</li>
      </ul>
      <h4>2. Account Registration and Security</h4>
      <ul>
        <li><strong>Registration Information:</strong> You agree to provide accurate, current, and complete personal information during registration.</li>
        <li><strong>Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.</li>
        <li><strong>Third-Party Cloud Storage:</strong> When connecting third-party storage (e.g., Google Drive, Dropbox), you must comply with their respective terms and conditions.</li>
      </ul>
      <h4>3. Access Management and Sharing</h4>
      <ul>
        <li><strong>User Control:</strong> You may grant access permissions to family members or healthcare providers through the "Access Management" settings.</li>
        <li><strong>Revocation:</strong> You may revoke third-party access permissions at any time.</li>
        <li><strong>User Liability:</strong> You are solely responsible for managing whom you authorize to access your records.</li>
      </ul>
      <h4>4. Prohibited Conduct</h4>
      <p>You agree not to impersonate others, attempt unauthorized access, upload viruses, or use the Service for any unlawful purpose.</p>
      <h4>5. Account Termination and Data Deletion</h4>
      <ul>
        <li><strong>Account Deletion:</strong> You may request account deletion at any time via Account Settings.</li>
        <li><strong>Consequences:</strong> Deleting your account will permanently remove all personal health records stored in our systems. Data backed up to third-party cloud storage must be managed directly on those platforms.</li>
      </ul>
      <h4>6. Disclaimer of Warranties</h4>
      <p>While we strive for uninterrupted operation, we do not guarantee an error-free service. We are not liable for disruptions caused by third-party providers like Google, Dropbox, or Firebase.</p>
    `,
    privacyContent: `
      <div class="modal-date">Effective Date: January 1, 2026 | Last Updated: August 19, 2026</div>
      <p>LogVita ("we", "us", or "our") values your personal privacy and health data security. This Privacy Policy explains how we collect, use, store, and protect your information.</p>
      <h4>1. Information We Collect</h4>
      <ul>
        <li><strong>Basic Account Information:</strong> Name, email address, encrypted passwords.</li>
        <li><strong>Profile Information:</strong> Date of birth, gender, blood type, height, weight, phone number, emergency contacts, allergy history.</li>
        <li><strong>Health Records Data:</strong> Lab reports, medication history, visit summaries, medical images.</li>
        <li><strong>Technical Data:</strong> IP address, device type, operating system, time zone, reCAPTCHA verification data.</li>
      </ul>
      <h4>2. How We Use Your Information</h4>
      <ul>
        <li>To provide, operate, and maintain the features of the Service.</li>
        <li>To ensure security and prevent abuse (e.g., reCAPTCHA v3 bot protection).</li>
        <li>To send system notifications regarding security alerts or authorization changes.</li>
        <li><strong>De-identified Research (Optional):</strong> Fully anonymized data may be used for public health research only if you explicitly opt-in.</li>
      </ul>
      <h4>3. Data Storage and Integrations</h4>
      <p>Your health data is encrypted during transmission and storage. When connected to Google Drive or Dropbox, the Service accesses only its dedicated configuration file (e.g., logvita_config.json).</p>
      <h4>4. Data Sharing and Disclosure</h4>
      <p>We do not sell or rent your personal health data to third parties. Information is shared only upon your explicit authorization or under legal obligations.</p>
      <h4>5. Your Rights</h4>
      <p>You have the right to access, correct, modify privacy settings, or delete your account at any time.</p>
    `
  },
  'ja': {
    tosTitle: '利用規約 (Terms of Service)',
    privacyTitle: 'プライバシーポリシー (Privacy Policy)',
    tosContent: `
      <div class="modal-date">発効日： 2026年1月1日｜最終更新日： 2026年8月19日</div>
      <p>「LogVita」（以下「本サービス」）へようこそ。本利用規約は、利用者の皆様（以下「ユーザー」）と本サービスとの間の法的合意を構成します。本サービスのご利用前に、本規約をよくお読みください。</p>
      <h4>1. サービスの内容と位置付け</h4>
      <ul>
        <li><strong>個人健康管理プラットフォーム：</strong> 本サービスは、検査結果、処方記録、診療記録、画像データなどの個人健康記録を保存・統合・クラウド同期する機能を提供します。</li>
        <li><strong>非医療行為：</strong> 本サービスは健康記録の整理・保存ツールであり、診断、治療助言、処方、救急対応などの医療行為は提供しません。医療上の判断が必要な場合は、必ず医療従事者にご相談ください。</li>
      </ul>
      <h4>2. アカウント登録とセキュリティ</h4>
      <ul>
        <li><strong>登録情報：</strong> ユーザーは、正確かつ最新の個人情報を提供するものとします。</li>
        <li><strong>アカウント管理責任：</strong> ユーザーは自己のアカウント情報およびパスワードを適切に管理する責任を負います。</li>
        <li><strong>外部クラウド連携：</strong> Google DriveやDropboxなどの外部ストレージ連携時は、該当サービスの利用規約に従う必要があります。</li>
      </ul>
      <h4>3. 閲覧権限の管理と共有</h4>
      <ul>
        <li><strong>アクセス制御：</strong> 「権限管理」機能を通じて、家族や特定医療従事者に対して健康記録の閲覧・追加権限を付与することができます。</li>
        <li><strong>権限の撤回：</strong> 付与した閲覧権限はいつでも撤回可能です。</li>
      </ul>
      <h4>4. 禁止事項</h4>
      <p>虚偽情報の登録、なりすまし、不正アクセス、有害プログラムの送信、法令に違反する行為を禁止します。</p>
      <h4>5. アカウントの削除</h4>
      <p>ユーザーはいつでもアカウントを削除できます。削除後、本サービス上のすべてのデータは永久に消去されます。外部クラウドのバックアップデータは各ストレージ側で直接管理してください。</p>
      <h4>6. 免責事項</h4>
      <p>本サービスは安定運用に努めますが、中断やエラーがないことを保証するものではありません。サードパーティサービス（Google、Dropbox、Firebase等）に起因する損失について責任を負いません。</p>
    `,
    privacyContent: `
      <div class="modal-date">発効日： 2026年1月1日｜最終更新日： 2026年8月19日</div>
      <p>「LogVita」（以下「当方」）は、ユーザーのプライバシーおよび健康データの保護を重視しています。</p>
      <h4>1. 取得する情報</h4>
      <ul>
        <li><strong>基本アカウント情報：</strong> 氏名、メールアドレス、暗号化パスワード。</li>
        <li><strong>プロフィール情報：</strong> 生年月日、性別、血液型、身長、体重、電話番号、緊急連絡先、アレルギー歴。</li>
        <li><strong>健康記録データ：</strong> 検査報告、処方箋データ、診療サマリー、医療画像。</li>
        <li><strong>技術情報：</strong> IPアドレス、デバイス情報、OS、タイムゾーン、reCAPTCHA検証データ。</li>
      </ul>
      <h4>2. データの利用目的</h4>
      <ul>
        <li>本サービスの提供・運営・維持。</li>
        <li>セキュリティ確保（スパムや不正アクセスの防止）。</li>
        <li>重要なお知らせの通知。</li>
        <li><strong>匿名化研究（任意）：</strong> ユーザーの同意がある場合に限り、個人を特定できない形式に加工した上で医学研究に利用します。</li>
      </ul>
      <h4>3. 外部サービスの利用と安全管理</h4>
      <p>健康データは通信・保存時に暗号化されます。Google DriveやDropbox連携時は専用設定ファイルのみにアクセスします。</p>
      <h4>4. 第三者提供の制限</h4>
      <p>当方はユーザーの同意なく個人健康データを第三者に販売・提供・貸与することはありません。</p>
      <h4>5. ユーザーの権利</h4>
      <p>ユーザーは、自らの個人情報に関して閲覧、修正、共有設定の変更、およびアカウント削除の権利を有します。</p>
    `
  },
  'ko': {
    tosTitle: '서비스 이용약관 (Terms of Service)',
    privacyTitle: '개인정보 처리방침 (Privacy Policy)',
    tosContent: `
      <div class="modal-date">시행일: 2026년 1월 1일｜최종 수정일: 2026년 8월 19일</div>
      <p>LogVita("서비스")를 이용해 주셔서 감사합니다. 본 약관은 이용자("회원")와 서비스 간의 법적 합의를 구성합니다. 서비스를 이용하기 전에 본 약관을 주의 깊게 읽어 주시기 바랍니다.</p>
      <h4>1. 서비스의 내용 및 성격</h4>
      <ul>
        <li><strong>개인 건강 관리 플랫폼:</strong> 본 서비스는 검사 결과, 처방 기록, 진료 기록, 의료 영상 등 개인 건강 기록의 저장, 통합 및 클라우드 동기화 기능을 제공합니다.</li>
        <li><strong>비의료 서비스:</strong> 본 서비스는 건강 기록 정리 및 저장 도구이며, 어떠한 형태의 의료 진단, 치료 조언, 처방 또는 응급 서비스를 제공하지 않습니다. 정확한 진단 및 치료는 반드시 전문 의료진과 상의하십시오.</li>
      </ul>
      <h4>2. 계정 등록 및 보안</h4>
      <ul>
        <li><strong>등록 정보:</strong> 회원은 가입 시 정확하고 최신의 개인정보를 제공해야 합니다.</li>
        <li><strong>계정 관리 책임:</strong> 회원은 자신의 계정 정보 및 비밀번호를 안전하게 관리할 책임이 있습니다.</li>
        <li><strong>외부 클라우드 연동:</strong> Google Drive, Dropbox 등 외부 클라우드 연동 시 해당 서비스의 이용약관을 준수해야 합니다.</li>
      </ul>
      <h4>3. 권한 관리 및 공유</h4>
      <ul>
        <li><strong>권한 제어:</strong> '권한 관리' 기능을 통해 가족 구성원이나 특정 의료진에게 건강 기록 열람 및 등록 권한을 부여할 수 있습니다.</li>
        <li><strong>권한 철회:</strong> 부여된 접근 권한은 언제든지 철회할 수 있습니다.</li>
      </ul>
      <h4>4. 금지 행위</h4>
      <p>타인의 정보 도용, 시스템 무단 접근, 악성 코드 유포, 불법적인 목적의 서비스 사용을 금지합니다.</p>
      <h4>5. 계정 탈퇴 및 데이터 삭제</h4>
      <p>회원은 언제든지 '계정 삭제'를 요청할 수 있으며, 삭제 시 본 서비스 시스템에 저장된 모든 개인 건강 기록은 영구히 삭제됩니다. 외부 클라우드의 백업 데이터는 해당 플랫폼에서 직접 관리해야 합니다.</p>
      <h4>6. 면책 조항</h4>
      <p>서비스는 지속적인 운영을 위해 노력하나, 서비스 중단이나 오류가 없음을 보장하지 않으며 제3자 서비스(Google, Firebase 등)로 인한 손해에 대해 책임을 지지 않습니다.</p>
    `,
    privacyContent: `
      <div class="modal-date">시행일: 2026년 1월 1일｜최종 수정일: 2026년 8월 19일</div>
      <p>LogVita("회사")는 회원의 개인정보 및 건강 데이터 보호를 매우 중요하게 생각합니다.</p>
      <h4>1. 수집하는 개인정보 항목</h4>
      <ul>
        <li><strong>기본 계정 정보:</strong> 이름, 이메일 주소, 암호화된 비밀번호.</li>
        <li><strong>프로필 정보:</strong> 생년월일, 성별, 혈액형, 신장, 체중, 연락처, 비상 연락처, 알레르기 이력.</li>
        <li><strong>건강 기록 데이터:</strong> 검사 결과, 처방 기록, 진료 요약, 의료 영상.</li>
        <li><strong>기술 정보:</strong> IP 주소, 기기 정보, 운영체제, 시간대, reCAPTCHA 보안 인증 데이터.</li>
      </ul>
      <h4>2. 개인정보의 이용 목적</h4>
      <ul>
        <li>서비스 제공 및 운영 (기록 조회, 클라우드 백업 등).</li>
        <li>보안 유지 및 비정상적인 이용 방지.</li>
        <li>주요 시스템 알림 전송.</li>
        <li><strong>익명화 연구 (선택):</strong> 회원의 동의가 있는 경우에 한해, 개인 식별이 불가능하도록 처리된 데이터를 의학 연구 목적으로 활용합니다.</li>
      </ul>
      <h4>3. 데이터 저장 및 외부 연동</h4>
      <p>건강 데이터는 전송 및 저장 시 암호화되며, Google Drive 연동 시 전용 설정 파일에만 접근합니다.</p>
      <h4>4. 개인정보의 제3자 제공</h4>
      <p>회사는 회원의 동의 없이 개인 건강 데이터를 외부에 판매하거나 대여하지 않습니다.</p>
      <h4>5. 이용자의 권리</h4>
      <p>회원은 언제든지 자신의 개인정보를 열람, 수정, 공유 설정 변경 및 계정 삭제를 요청할 수 있는 권리가 있습니다.</p>
    `
  }
 };

export const loginTranslations = {
 'zh-TW': {
 htmlLang:'zh-Hant-TW', title:'健康庫 LogVita — 登入',
 brandMark:'健康庫 LogVita', h1:'把每一次<em>健康紀錄</em><br>安心留在身邊',
 brandDesc:'檢驗報告、用藥紀錄、影像資料，通通存進你自己的 Google Drive 或 Dropbox，並能自訂期限與範圍分享給家人與醫療人員。',
 trust:'資料採加密儲存，僅本人與您授權的對象可讀取',
 welcome:'歡迎回來', start:'開始使用', signInTitle:'登入您的健康紀錄', signUpTitle:'建立您的健康紀錄帳號',
 signIn:'登入', signUp:'註冊', google:'使用 Google 繼續', orEmail:'或使用電子郵件',
 name:'姓名', namePh:'請輸入您的姓名', email:'電子郵件', emailPh:'you@example.com',
 password:'密碼', passwordPh:'至少 6 個字元', confirmPassword:'確認密碼', confirmPasswordPh:'請再輸入一次密碼', create:'建立帳號', noAccount:'還沒有帳號？', hasAccount:'已經有帳號了？',
 createAccount:'建立帳號', terms:'註冊即表示您同意我們的<a id="open-tos-btn">服務條款</a>與<a id="open-privacy-btn">隱私政策</a>，', privacy:'您的健康資料受《個人資料保護法》規範保護。',
 errName:'請輸入姓名。', errEmail:'請輸入有效的電子郵件地址。', errPassword:'密碼至少需要 6 個字元。', errPasswordMismatch:'兩次輸入的密碼不一致。',
 forgotPassword:'忘記密碼？', enterEmailPrompt:'請先輸入您的電子郵件地址。', resetSentToast:'密碼重設信件已寄出，請檢查您的電子信箱！',
 successSignup:'帳號建立成功，歡迎加入健康庫', successSignin:'登入成功', welcomeUser:'歡迎，',
 errors:{
 'auth/email-already-in-use':'這個電子郵件已經註冊過了，請直接登入。','auth/invalid-email':'電子郵件格式不正確。',
 'auth/weak-password':'密碼強度不足，請使用至少 6 個字元。','auth/user-not-found':'找不到這個帳號，請確認電子郵件或先註冊。',
 'auth/wrong-password':'密碼錯誤，請再試一次。','auth/invalid-credential':'帳號或密碼錯誤，請再試一次。',
 'auth/too-many-requests':'嘗試次數過多，請稍後再試。','auth/popup-closed-by-user':'Google 登入視窗已關閉。',
 'auth/network-request-failed':'網路連線異常，請稍後再試。'
 }, generic:'發生錯誤，請稍後再試。'
 },
 'zh-CN': {
 htmlLang:'zh-Hans-CN', title:'健康库 LogVita — 登录',
 brandMark:'健康库 LogVita', h1:'把每一次<em>健康记录</em><br>安心留在身边',
 brandDesc:'检验报告、用药记录、影像资料，统统存进你自己的 Google Drive 或 Dropbox，并能自定义期限与范围分享给家人与医疗人员。',
 trust:'数据采用加密存储，仅本人与您授权的对象可读取',
 welcome:'欢迎回来', start:'开始使用', signInTitle:'登录您的健康记录', signUpTitle:'创建您的健康记录账号',
 signIn:'登录', signUp:'注册', google:'使用 Google 继续', orEmail:'或使用电子邮件',
 name:'姓名', namePh:'请输入您的姓名', email:'电子邮件', emailPh:'you@example.com',
 password:'密码', passwordPh:'至少 6 个字符', confirmPassword:'确认密码', confirmPasswordPh:'请再输入一次密码', create:'创建账号', noAccount:'还没有账号？', hasAccount:'已经有账号了？',
 createAccount:'创建账号', terms:'注册即表示您同意我们的<a id="open-tos-btn">服务条款</a>与<a id="open-privacy-btn">隐私政策</a>，', privacy:'您的健康数据受个人信息保护法律法规保护。',
 errName:'请输入姓名。', errEmail:'请输入有效的电子邮件地址。', errPassword:'密码至少需要 6 个字符。', errPasswordMismatch:'两次输入的密码不一致。',
 forgotPassword:'忘记密码？', enterEmailPrompt:'请先输入您的电子邮件地址。', resetSentToast:'密码重置邮件已发送，请检查您的电子邮箱！',
 successSignup:'账号创建成功，欢迎加入健康库', successSignin:'登录成功', welcomeUser:'欢迎，',
 errors:{
 'auth/email-already-in-use':'该电子邮件已被注册，请直接登录。','auth/invalid-email':'电子邮件格式不正确。',
 'auth/weak-password':'密码强度不足，请使用至少 6 个字符。','auth/user-not-found':'找不到该账号，请检查邮箱或先注册。',
 'auth/wrong-password':'密码错误，请再试一次。','auth/invalid-credential':'账号或密码错误，请再试一次。',
 'auth/too-many-requests':'尝试次数过多，请稍后再试。','auth/popup-closed-by-user':'Google 登录窗口已关闭。',
 'auth/network-request-failed':'网络连接异常，请稍后再试。'
 }, generic:'发生错误，请稍后再试。'
 },
 'en': {
 htmlLang:'en', title:'LogVita — Sign in',
 brandMark:'LogVita', h1:'Keep every <em>health record</em><br>close and secure',
 brandDesc:'Lab reports, medications, and imaging — stored in your own Google Drive or Dropbox, shared with family or providers on your terms.',
 trust:'Encrypted storage. Accessible only by you and the people you authorize.',
 welcome:'Welcome back', start:'Get started', signInTitle:'Sign in to your health records', signUpTitle:'Create your LogVita account',
 signIn:'Sign in', signUp:'Sign up', google:'Continue with Google', orEmail:'or use email',
 name:'Name', namePh:'Enter your name', email:'Email', emailPh:'you@example.com',
 password:'Password', passwordPh:'At least 6 characters', confirmPassword:'Confirm password', confirmPasswordPh:'Re-enter your password', create:'Create account', noAccount:"Don't have an account?", hasAccount:'Already have an account?',
 createAccount:'Create account', terms:'By signing up, you agree to our <a id="open-tos-btn">Terms of Service</a> and <a id="open-privacy-btn">Privacy Policy</a>.', privacy:'Your health data is protected under data privacy laws.',
 errName:'Please enter your name.', errEmail:'Please enter a valid email address.', errPassword:'Password must be at least 6 characters.', errPasswordMismatch:'Passwords do not match.',
 forgotPassword:'Forgot password?', enterEmailPrompt:'Please enter your email address first.', resetSentToast:'Password reset email sent! Check your inbox.',
 successSignup:'Account created successfully.', successSignin:'Signed in successfully', welcomeUser:'Welcome, ',
 errors:{
 'auth/email-already-in-use':'This email is already registered. Please sign in.','auth/invalid-email':'Please enter a valid email address.',
 'auth/weak-password':'Password is too weak. Please use at least 6 characters.','auth/user-not-found':'Account not found. Please sign up first.',
 'auth/wrong-password':'Incorrect password. Please try again.','auth/invalid-credential':'Incorrect email or password.',
 'auth/too-many-requests':'Too many attempts. Please try again later.','auth/popup-closed-by-user':'Google sign-in window was closed.',
 'auth/network-request-failed':'Network error. Please try again later.'
 }, generic:'Something went wrong. Please try again later.'
 },
 'ja': {
 htmlLang:'ja', title:'LogVita — ログイン',
 brandMark:'LogVita', h1:'すべての<em>健康記録</em>を<br>安心して手元に',
 brandDesc:'検査結果、服薬記録、画像データを、ご自身の Google Drive や Dropbox に保存。期限や範囲を指定して家族や医療従事者に共有できます。',
 trust:'暗号化保管。あなたと許可した相手のみが閲覧可能です。',
 welcome:'おかえりなさい', start:'はじめる', signInTitle:'健康記録にログイン', signUpTitle:'LogVitaアカウントの作成',
 signIn:'ログイン', signUp:'新規登録', google:'Google で継続', orEmail:'またはメールアドレスで',
 name:'お名前', namePh:'お名前を入力してください', email:'メールアドレス', emailPh:'you@example.com',
 password:'パスワード', passwordPh:'6文字以上', confirmPassword:'パスワード（確認）', confirmPasswordPh:'もう一度パスワードを入力', create:'アカウント作成', noAccount:'アカウントをお持ちでないですか？', hasAccount:'すでにアカウントをお持ちですか？',
 createAccount:'アカウント作成', terms:'登録することで、<a id="open-tos-btn">利用規約</a>と<a id="open-privacy-btn">プライバシーポリシー</a>に同意したことになります。', privacy:'個人情報保護法に基づき安全に保護されます。',
 errName:'お名前を入力してください。', errEmail:'有効なメールアドレスを入力してください。', errPassword:'パスワードは6文字以上である必要があります。', errPasswordMismatch:'パスワードが一致しません。',
 forgotPassword:'パスワードをお忘れですか？', enterEmailPrompt:'最初にメールアドレスを入力してください。', resetSentToast:'パスワード再設定メールを送信しました。',
 successSignup:'アカウントが作成されました。', successSignin:'ログインしました', welcomeUser:'ようこそ、',
 errors:{
 'auth/email-already-in-use':'このメールアドレスは既に登録されています。','auth/invalid-email':'無効なメールアドレス形式です。',
 'auth/weak-password':'パスワードが脆弱です。6文字以上で設定してください。','auth/user-not-found':'アカウントが見つかりません。',
 'auth/wrong-password':'パスワードが正しくありません。','auth/invalid-credential':'メールアドレスまたはパスワードが正しくありません。',
 'auth/too-many-requests':'試行回数が多すぎます。しばらく時間をおいて再試行してください。','auth/popup-closed-by-user':'Google ログインウィンドウが閉じられました。',
 'auth/network-request-failed':'ネットワークエラーが発生しました。'
 }, generic:'エラーが発生しました。時間をおいて再試行してください。'
 },
 'ko': {
 htmlLang:'ko', title:'LogVita — 로그인',
 brandMark:'LogVita', h1:'모든 <em>건강 기록</em>을<br>내 손안에 안전하게',
 brandDesc:'검사 결과, 복약 기록, 영상 자료를 나만의 Google Drive 또는 Dropbox에 저장하고, 기간과 범위를 설정해 가족이나 의료진과 공유하세요.',
 trust:'암호화 저장. 본인과 승인한 대상만 접근할 수 있습니다.',
 welcome:'환영합니다', start:'시작하기', signInTitle:'건강 기록 로그인', signUpTitle:'LogVita 계정 생성',
 signIn:'로그인', signUp:'회원가입', google:'Google로 계속하기', orEmail:'또는 이메일 사용',
 name:'이름', namePh:'이름을 입력하세요', email:'이메일', emailPh:'you@example.com',
 password:'비밀번호', passwordPh:'최소 6자 이상', confirmPassword:'비밀번호 확인', confirmPasswordPh:'비밀번호를 다시 입력하세요', create:'계정 생성', noAccount:'계정이 없으신가요?', hasAccount:'이미 계정이 있으신가요?',
 createAccount:'계정 생성', terms:'가입하시면 <a id="open-tos-btn">서비스 약관</a> 및 <a id="open-privacy-btn">개인정보 처리방침</a>에 동의하게 됩니다.', privacy:'개인정보 보호법에 따라 안전하게 보호됩니다.',
 errName:'이름을 입력해 주세요.', errEmail:'올바른 이메일 주소를 입력해 주세요.', errPassword:'비밀번호는 최소 6자 이상이어야 합니다.', errPasswordMismatch:'비밀번호가 일치하지 않습니다.',
 forgotPassword:'비밀번호를 잊으셨나요?', enterEmailPrompt:'먼저 이메일을 입력해 주세요.', resetSentToast:'비밀번호 재설정 이메일이 발송되었습니다.',
 successSignup:'계정이 성공적으로 생성되었습니다.', successSignin:'로그인 성공', welcomeUser:'환영합니다, ',
 errors:{
 'auth/email-already-in-use':'이미 가입된 이메일입니다.','auth/invalid-email':'올바르지 않은 이메일 형식입니다.',
 'auth/weak-password':'비밀번호가 취약합니다. 최소 6자 이상 사용하세요.','auth/user-not-found':'계정을 찾을 수 없습니다.',
 'auth/wrong-password':'비밀번호가 올바르지 않습니다.','auth/invalid-credential':'이메일 또는 비밀번호가 올바르지 않습니다.',
 'auth/too-many-requests':'시도 횟수가 너무 많습니다. 나중에 다시 시도하세요.','auth/popup-closed-by-user':'Google 로그인 창이 닫혔습니다.',
 'auth/network-request-failed':'네트워크 오류가 발생했습니다.'
 }, generic:'오류가 발생했습니다. 나중에 다시 시도해 주세요.'
 }
 };

// ============================================================================
// dashboard-zhtw.html（主畫面）翻譯內容
// ============================================================================
export const dashboardTranslations = {
'zh-TW': {
  htmlLang: 'zh-Hant-TW', title: '健康庫 LogVita — 帳號設定',
  nav: { brand:'健康庫 LogVita', sectionOverview:'總覽', home:'首頁', idcard:'個人資料卡', shared:'共享給我', sectionAccount:'帳號設定', profile:'個人檔案', access:'授權管理', security:'帳號安全', logout:'登出' },
  home: { title:'總覽', sub:'你的健康紀錄一目了然，隨時新增最新的就診與檢驗資訊', addRecord:'新增醫療紀錄', allergyBanner:'過敏史提醒',
    statTotal:'健康紀錄總數', statTotalNote:'筆紀錄', statRecent:'最新紀錄', statRecentNone:'尚無紀錄', statAccess:'已授權查看人數', statAccessNote:'位家人 / 醫療人員',
    statShared:'共享給我人數', statSharedNote:'位分享者', recordsTitle:'醫療紀錄', recordsSub:'依類型篩選，快速找到你需要的紀錄',
    filterAll:'全部', filterLab:'檢驗報告', filterMed:'用藥紀錄', filterImg:'影像資料', filterVisit:'就診紀錄',
    emptyTitle:'還沒有醫療紀錄', emptyDesc:'點選「新增醫療紀錄」開始建立你的健康資料庫' },
  idcard: { title:'個人資料卡', sub:'隨身攜帶的健康身分卡，緊急時刻一眼掌握關鍵資訊', label:'健康身分卡', editGear:'編輯個人檔案',
    kBirth:'出生', kGender:'性別', kBlood:'血型', kPhone:'聯絡電話', kEmergency:'緊急聯絡人', kEmergencyPhone:'緊急聯絡電話', kAllergy:'過敏史',
    updateTitle:'需要更新資料？', updateDesc:'點選卡片右上角齒輪或這裡的按鈕，前往個人檔案編輯', editBtn:'前往個人檔案編輯',
    notSet:'尚未設定', noKnownAllergy:'無已知過敏', bloodTypeSuffix:'型',
    downloadBtn:'下載個人資料卡', downloadedToast:'已下載健康身分卡圖片', downloadFailedToast:'下載失敗，請稍後再試' },
  shared: { title:'共享給我', sub:'家人或醫療人員授權讓你查看的健康紀錄', listTitle:'分享清單', listSub:'以下是目前有效、授權給你查看的健康資料',
    emptyTitle:'目前沒有人與你分享健康紀錄', emptyDesc:'當家人或醫療人員在「授權管理」中把資料分享給你的帳號 Email 後，會顯示在這裡',
    recordsCount:(n)=>`醫療紀錄（${n} 筆）`, noRecordsInScope:'此授權範圍未包含個別醫療紀錄', removeBtn:'移除這個共享項目',
    removeConfirmTitle:'確定要移除這個共享項目嗎？', removeConfirmMsg:'移除後將不再顯示於清單中，可重新透過分享連結加入。',
    removedToast:'已從清單移除', joinedToast:(name)=>`已加入 ${name} 的共享資料`, joinedLocalToast:(name)=>`已加入 ${name} 的共享資料（尚未連結雲端硬碟，暫存於本次瀏覽）`,
    loading:'載入中...' },
  profile: { title:'個人檔案', sub:'這些資訊會安全儲存於您的個人 Google Drive 或 Dropbox', changePhoto:'更換照片', removePhoto:'移除照片',
    name:'姓名', birth:'出生日期', gender:'性別', genderMale:'男', genderFemale:'女', genderUndisclosed:'不透露',
    blood:'血型', bloodUnsure:'不確定', phone:'聯絡電話', phonePh:'0912-345-678', emergency:'緊急聯絡人', emergencyPh:'姓名',
    emergencyPhone:'緊急聯絡人電話', height:'身高（公分）', heightPh:'例如：170', weight:'體重（公斤）', weightPh:'例如：65',
    allergy:'過敏史', allergyPh:'例如：青黴素過敏', save:'儲存變更至雲端硬碟', loading:'讀取中...' },
  access: { title:'授權管理', sub:'管理可以查看你健康紀錄的人員與機構', currentTitle:'目前已授權', addBtn:'＋ 新增授權',
    countLabel:(n)=>`共 ${n} 位可存取你的紀錄`, emptyDesc:'目前沒有授權任何人查看你的紀錄，點選右上角「＋ 新增授權」開始邀請',
    typeFamily:'家人', typeFamilyMeta:'家庭成員', typeDoctor:'醫療人員', typeOther:'其他',
    authorizedUntil:(d)=>`授權至 ${d}`, permanent:'永久授權', revoke:'撤銷',
    revokeConfirmTitle:'確定要撤銷這個人的存取權限嗎？', revokeConfirmMsg:'撤銷後對方將無法再讀取此份加密資料，此動作無法復原。',
    revokedToast:'已撤銷授權，對方將無法再讀取此份加密資料', revokedSimpleToast:'已撤銷授權',
    modalTitle:'新增授權', modalSub:'邀請家人或醫療人員查看你的健康紀錄，對方登入自己帳號時會看到通知彈窗',
    fieldType:'授權對象', fieldName:'稱呼（選填）', fieldNamePh:'例如：陳醫師、林小美', fieldEmail:'電子郵件', fieldEmailPh:'對方的電子郵件地址',
    fieldExpiry:'授權期限', expiryPermanentOpt:'永久，直到我撤銷', expiry30:'30 天', expiry90:'90 天', expiry365:'1 年', expiryCustom:'自訂日期',
    expiryDateLabel:'到期日', fieldScope:'存取範圍', scopeFull:'完整病歷', scopeSummary:'僅摘要', scopeLab:'僅檢驗報告', scopeCustom:'自訂項目',
    scopeCustomLabel:'可查看的紀錄類型', fieldNote:'邀請訊息（選填）', fieldNotePh:'會附在邀請信裡，例如：這是我這次回診要用的資料',
    cancel:'取消', submitInvite:'送出邀請' },
  security: { title:'帳號安全', sub:'管理登入方式、密碼與裝置', cloudTitle:'登入方式與雲端儲存', cloudSub:'請選擇並使用其中一種雲端硬碟備份與儲存您的健康資料',
    googleDrive:'Google Drive', dropbox:'Dropbox 雲端硬碟', notConnected:'未連結', connected:'已連結',
    connectGoogle:'連結 Google Drive', connectDropbox:'連結 Dropbox', disabledUsingDropbox:'已停用（已使用Dropbox）', disabledUsingGoogle:'已停用（已使用Google）',
    changePwTitle:'變更密碼', changePwSub:'建議定期更換密碼，並避免與其他網站共用', currentPw:'目前密碼', newPw:'新密碼', newPwPh:'至少 8 個字元',
    confirmPw:'確認新密碼', confirmPwPh:'再輸入一次', updatePw:'更新密碼',
    devicesTitle:'登入中的裝置', deviceCountLabel:(n)=>`目前有 ${n} 個裝置保持登入狀態`, detecting:'偵測中...', locInfo:(c)=>`${c} · 最後活動：剛剛`,
    lastActiveLabel:'最後活動：', justNow:'剛剛', minutesAgo:(n)=>`${n} 分鐘前`, hoursAgo:(n)=>`${n} 小時前`, daysAgo:(n)=>`${n} 天前`,
    removeDeviceConfirmTitle:'確定要讓這個裝置登出嗎？', removeDeviceConfirmMsg:'該裝置將立即被登出，需要重新登入才能繼續使用。',
    deviceRemovedToast:'已將該裝置登出', deviceRemoveFailedToast:'登出裝置失敗，請稍後再試',
    currentDeviceBadge:'目前裝置', deviceLogout:'登出',
    dangerTitle:'刪除帳號', dangerSub:'刪除後，你所有的健康紀錄將永久移除，此動作無法復原', deleteAccount:'刪除我的帳號',
    deleteConfirmTitle:'確定要刪除你的帳號嗎？', deleteConfirmMsg:'所有健康紀錄將永久移除，此動作無法復原。', deleteToast:'帳號刪除功能尚未開放，請聯繫客服協助處理' },
  recordModal: { newTitle:'新增醫療紀錄', newSub:'紀錄會安全儲存於你的個人 Google Drive 或 Dropbox', typeLabel:'紀錄類型',
    typeLab:'檢驗報告', typeMed:'用藥紀錄', typeImg:'影像資料', typeVisit:'就診紀錄',
    titleLabel:'標題 / 機構名稱', titlePh:'例如：血液常規檢查、萬芳醫院內科', dateLabel:'日期',
    doctorLabel:'醫師 / 科別（選填）', doctorPh:'例如：陳醫師 — 家庭醫學科',
    noteLabel:'備註內容', notePh:'例如：空腹血糖 92 mg/dL，數值正常', photoLabel:'附加照片（選填）', photoUploadText:'點擊上傳報告或處方照片',
    removePhotoAria:'移除照片', cancel:'取消', save:'儲存紀錄', uploading:'照片上傳中...',
    uploadFailedToast:'照片上傳失敗，紀錄仍會保留文字內容', invalidImageToast:'請上傳圖片格式的檔案', tooLargeToast:'照片壓縮後仍然過大，請換一張較小的照片', compressing:'正在壓縮照片...',
    addedCloudToast:'已新增紀錄並同步至雲端硬碟', addedLocalToast:'已新增紀錄（請先連結 Google Drive 或 Dropbox 以同步）', recordFallbackLabel:'紀錄' },
  detail: { close:'關閉', photoAlt:'紀錄照片', dateLabel:'日期', doctorLabel:'醫師 / 科別', notProvided:'未提供',
    noteLabel:'備註內容', noNoteContent:'（無備註內容）', delete:'刪除紀錄', done:'關閉',
    deleteConfirmTitle:'確定要刪除這筆紀錄嗎？', deleteConfirmMsg:'此動作無法復原。',
    deletedCloudToast:'已刪除紀錄並同步至雲端', deletedLocalToast:'已刪除紀錄（請先連結雲端硬碟）' },
  invite: { title:'新的分享邀請', sub:'以下使用者想與你分享他們的健康紀錄', accept:'加入', ignore:'忽略' },
  confirm: { defaultTitle:'確認操作', cancel:'取消', ok:'確定' },
  avatar: { uploading:'上傳中...', updatedCloudToast:'大頭貼已更新並同步至雲端', updatedLocalToast:'大頭貼已更新（尚未連結雲端硬碟，暫存於本次瀏覽）',
    removedCloudToast:'已移除自訂大頭貼，改回預設頭像', removedLocalToast:'已移除自訂大頭貼', needCloudToast:'請先連結 Google Drive 或 Dropbox 以上傳照片', compressing:'正在壓縮照片...',
    removeConfirmTitle:'確定要移除目前的大頭貼照片嗎？', removeConfirmMsg:'移除後將改回預設頭像。',
    invalidImageToast:'請上傳圖片格式的檔案', tooLargeToast:'照片壓縮後仍然過大，請換一張較小的照片' },
  avatarCrop: { title:'調整大頭貼', sub:'拖曳調整位置，使用下方滑桿縮放與旋轉', zoom:'縮放', rotate:'旋轉',
    rotateLeft:'向左旋轉 90 度', rotateRight:'向右旋轉 90 度', cancel:'取消', confirm:'完成' },
  cloud: { profileSavedToast:'已同步儲存至您的雲端硬碟', needCloudToast:'請先授權連結 Google Drive 或 Dropbox',
    dropboxConnectedCrossDeviceToast:'已成功跨裝置連結您的 Dropbox', driveLoadedToast:'已成功從您的 Google Drive 載入資料',
    dropboxLoadedToast:'已成功從 Dropbox 載入您的資料', dropboxConnectedToast:'已成功連結 Dropbox',
    popupBlockedToast:'請允許瀏覽器的彈出視窗權限後再試一次', dropboxAuthFailedToast:'Dropbox 授權失敗，請重新嘗試連結',
    driveAuthFailedToast:'Google Drive 授權失敗', timeoutToast:'雲端連線已逾時，為確保資料安全同步，即將登出請重新登入',
    dropboxDisconnectedToast:'Dropbox 連線已失效，請重新點選「連結 Dropbox」授權一次', loadErrorToast:'載入雲端資料時發生問題，請重新整理再試一次',
    shareCreateFailedToast:'無法建立加密分享檔，請開啟瀏覽器主控台（Console）查看詳細錯誤原因',
    shareCreatedNoKeyToast:'已建立加密授權，但尚未設定讀取憑證，對方暫時無法開啟連結', accessAddedToast:'已新增授權，對方登入後會看到通知',
    shareCreatedNotifyFailedToast:'已建立加密授權，但通知建立失敗，請確認 Firestore 規則設定', encryptingUploadingLabel:'加密並上傳中...',
    loadingDriveToast:'正在從 Google Drive 載入資料...', loadingDropboxToast:'正在從 Dropbox 載入資料...' },
  device: { iphone:'iPhone / iPad 裝置', android:'Android 裝置', windows:'Windows 電腦', mac:'Mac 電腦', linux:'Linux 電腦', generic:'行動/電腦裝置' },
  country: { taiwan:'台灣', japan:'日本', korea:'韓國', china:'中國', hongkong:'香港', usa:'美國', local:'本地地區', unknown:'未知國家' },
  misc: { defaultUserName:'使用者', defaultUserInitial:'使' }
},
'zh-CN': {
  htmlLang: 'zh-Hans-CN', title: '健康库 LogVita — 账号设置',
  nav: { brand:'健康库 LogVita', sectionOverview:'总览', home:'首页', idcard:'个人资料卡', shared:'共享给我', sectionAccount:'账号设置', profile:'个人档案', access:'授权管理', security:'账号安全', logout:'登出' },
  home: { title:'总览', sub:'你的健康记录一目了然，随时新增最新的就诊与检验信息', addRecord:'新增医疗记录', allergyBanner:'过敏史提醒',
    statTotal:'健康记录总数', statTotalNote:'笔记录', statRecent:'最新记录', statRecentNone:'尚无记录', statAccess:'已授权查看人数', statAccessNote:'位家人 / 医疗人员',
    statShared:'共享给我人数', statSharedNote:'位分享者', recordsTitle:'医疗记录', recordsSub:'依类型筛选，快速找到你需要的记录',
    filterAll:'全部', filterLab:'检验报告', filterMed:'用药记录', filterImg:'影像资料', filterVisit:'就诊记录',
    emptyTitle:'还没有医疗记录', emptyDesc:'点选「新增医疗记录」开始建立你的健康数据库' },
  idcard: { title:'个人资料卡', sub:'随身携带的健康身份卡，紧急时刻一眼掌握关键信息', label:'健康身份卡', editGear:'编辑个人档案',
    kBirth:'出生', kGender:'性别', kBlood:'血型', kPhone:'联系电话', kEmergency:'紧急联系人', kEmergencyPhone:'紧急联系电话', kAllergy:'过敏史',
    updateTitle:'需要更新资料？', updateDesc:'点选卡片右上角齿轮或这里的按钮，前往个人档案编辑', editBtn:'前往个人档案编辑',
    notSet:'尚未设置', noKnownAllergy:'无已知过敏', bloodTypeSuffix:'型',
    downloadBtn:'下载个人资料卡', downloadedToast:'已下载健康身份卡图片', downloadFailedToast:'下载失败，请稍后再试' },
  shared: { title:'共享给我', sub:'家人或医疗人员授权让你查看的健康记录', listTitle:'分享清单', listSub:'以下是目前有效、授权给你查看的健康资料',
    emptyTitle:'目前没有人与你分享健康记录', emptyDesc:'当家人或医疗人员在「授权管理」中把资料分享给你的账号 Email 后，会显示在这里',
    recordsCount:(n)=>`医疗记录（${n} 笔）`, noRecordsInScope:'此授权范围未包含个别医疗记录', removeBtn:'移除这个共享项目',
    removeConfirmTitle:'确定要移除这个共享项目吗？', removeConfirmMsg:'移除后将不再显示于清单中，可重新通过分享链接加入。',
    removedToast:'已从清单移除', joinedToast:(name)=>`已加入 ${name} 的共享资料`, joinedLocalToast:(name)=>`已加入 ${name} 的共享资料（尚未连结云端硬盘，暂存于本次浏览）`,
    loading:'加载中...' },
  profile: { title:'个人档案', sub:'这些信息会安全储存于您的个人 Google Drive 或 Dropbox', changePhoto:'更换照片', removePhoto:'移除照片',
    name:'姓名', birth:'出生日期', gender:'性别', genderMale:'男', genderFemale:'女', genderUndisclosed:'不透露',
    blood:'血型', bloodUnsure:'不确定', phone:'联系电话', phonePh:'0912-345-678', emergency:'紧急联系人', emergencyPh:'姓名',
    emergencyPhone:'紧急联系人电话', height:'身高（厘米）', heightPh:'例如：170', weight:'体重（公斤）', weightPh:'例如：65',
    allergy:'过敏史', allergyPh:'例如：青霉素过敏', save:'保存变更至云端硬盘', loading:'加载中...' },
  access: { title:'授权管理', sub:'管理可以查看你健康记录的人员与机构', currentTitle:'目前已授权', addBtn:'＋ 新增授权',
    countLabel:(n)=>`共 ${n} 位可访问你的记录`, emptyDesc:'目前没有授权任何人查看你的记录，点选右上角「＋ 新增授权」开始邀请',
    typeFamily:'家人', typeFamilyMeta:'家庭成员', typeDoctor:'医疗人员', typeOther:'其他',
    authorizedUntil:(d)=>`授权至 ${d}`, permanent:'永久授权', revoke:'撤销',
    revokeConfirmTitle:'确定要撤销这个人的访问权限吗？', revokeConfirmMsg:'撤销后对方将无法再读取此份加密资料，此动作无法复原。',
    revokedToast:'已撤销授权，对方将无法再读取此份加密资料', revokedSimpleToast:'已撤销授权',
    modalTitle:'新增授权', modalSub:'邀请家人或医疗人员查看你的健康记录，对方登录自己账号时会看到通知弹窗',
    fieldType:'授权对象', fieldName:'称呼（选填）', fieldNamePh:'例如：陈医师、林小美', fieldEmail:'电子邮件', fieldEmailPh:'对方的电子邮件地址',
    fieldExpiry:'授权期限', expiryPermanentOpt:'永久，直到我撤销', expiry30:'30 天', expiry90:'90 天', expiry365:'1 年', expiryCustom:'自定义日期',
    expiryDateLabel:'到期日', fieldScope:'访问范围', scopeFull:'完整病历', scopeSummary:'仅摘要', scopeLab:'仅检验报告', scopeCustom:'自定义项目',
    scopeCustomLabel:'可查看的记录类型', fieldNote:'邀请信息（选填）', fieldNotePh:'会附在邀请信里，例如：这是我这次回诊要用的资料',
    cancel:'取消', submitInvite:'送出邀请' },
  security: { title:'账号安全', sub:'管理登录方式、密码与设备', cloudTitle:'登录方式与云端储存', cloudSub:'请选择并使用其中一种云端硬盘备份与储存您的健康资料',
    googleDrive:'Google Drive', dropbox:'Dropbox 云端硬盘', notConnected:'未连结', connected:'已连结',
    connectGoogle:'连结 Google Drive', connectDropbox:'连结 Dropbox', disabledUsingDropbox:'已停用（已使用Dropbox）', disabledUsingGoogle:'已停用（已使用Google）',
    changePwTitle:'变更密码', changePwSub:'建议定期更换密码，并避免与其他网站共用', currentPw:'目前密码', newPw:'新密码', newPwPh:'至少 8 个字符',
    confirmPw:'确认新密码', confirmPwPh:'再输入一次', updatePw:'更新密码',
    devicesTitle:'登录中的设备', deviceCountLabel:(n)=>`目前有 ${n} 个设备保持登录状态`, detecting:'侦测中...', locInfo:(c)=>`${c} · 最后活动：刚刚`,
    lastActiveLabel:'最后活动：', justNow:'刚刚', minutesAgo:(n)=>`${n} 分钟前`, hoursAgo:(n)=>`${n} 小时前`, daysAgo:(n)=>`${n} 天前`,
    removeDeviceConfirmTitle:'确定要让这个设备登出吗？', removeDeviceConfirmMsg:'该设备将立即被登出，需要重新登录才能继续使用。',
    deviceRemovedToast:'已将该设备登出', deviceRemoveFailedToast:'登出设备失败，请稍后再试',
    currentDeviceBadge:'目前设备', deviceLogout:'登出',
    dangerTitle:'删除账号', dangerSub:'删除后，你所有的健康记录将永久移除，此动作无法复原', deleteAccount:'删除我的账号',
    deleteConfirmTitle:'确定要删除你的账号吗？', deleteConfirmMsg:'所有健康记录将永久移除，此动作无法复原。', deleteToast:'账号删除功能尚未开放，请联系客服协助处理' },
  recordModal: { newTitle:'新增医疗记录', newSub:'记录会安全储存于你的个人 Google Drive 或 Dropbox', typeLabel:'记录类型',
    typeLab:'检验报告', typeMed:'用药记录', typeImg:'影像资料', typeVisit:'就诊记录',
    titleLabel:'标题 / 机构名称', titlePh:'例如：血液常规检查、万芳医院内科', dateLabel:'日期',
    doctorLabel:'医师 / 科别（选填）', doctorPh:'例如：陈医师 — 家庭医学科',
    noteLabel:'备注内容', notePh:'例如：空腹血糖 92 mg/dL，数值正常', photoLabel:'附加照片（选填）', photoUploadText:'点击上传报告或处方照片',
    removePhotoAria:'移除照片', cancel:'取消', save:'保存记录', uploading:'照片上传中...',
    uploadFailedToast:'照片上传失败，记录仍会保留文字内容', invalidImageToast:'请上传图片格式的文件', tooLargeToast:'照片压缩后仍然过大，请换一张较小的照片', compressing:'正在压缩照片...',
    addedCloudToast:'已新增记录并同步至云端硬盘', addedLocalToast:'已新增记录（请先连结 Google Drive 或 Dropbox 以同步）', recordFallbackLabel:'记录' },
  detail: { close:'关闭', photoAlt:'记录照片', dateLabel:'日期', doctorLabel:'医师 / 科别', notProvided:'未提供',
    noteLabel:'备注内容', noNoteContent:'（无备注内容）', delete:'删除记录', done:'关闭',
    deleteConfirmTitle:'确定要删除这笔记录吗？', deleteConfirmMsg:'此动作无法复原。',
    deletedCloudToast:'已删除记录并同步至云端', deletedLocalToast:'已删除记录（请先连结云端硬盘）' },
  invite: { title:'新的分享邀请', sub:'以下用户想与你分享他们的健康记录', accept:'加入', ignore:'忽略' },
  confirm: { defaultTitle:'确认操作', cancel:'取消', ok:'确定' },
  avatar: { uploading:'上传中...', updatedCloudToast:'头像已更新并同步至云端', updatedLocalToast:'头像已更新（尚未连结云端硬盘，暂存于本次浏览）',
    removedCloudToast:'已移除自定义头像，改回默认头像', removedLocalToast:'已移除自定义头像', needCloudToast:'请先连结 Google Drive 或 Dropbox 以上传照片', compressing:'正在压缩照片...',
    removeConfirmTitle:'确定要移除目前的头像照片吗？', removeConfirmMsg:'移除后将改回默认头像。',
    invalidImageToast:'请上传图片格式的文件', tooLargeToast:'照片压缩后仍然过大，请换一张较小的照片' },
  avatarCrop: { title:'调整头像', sub:'拖曳调整位置，使用下方滑杆缩放与旋转', zoom:'缩放', rotate:'旋转',
    rotateLeft:'向左旋转 90 度', rotateRight:'向右旋转 90 度', cancel:'取消', confirm:'完成' },
  cloud: { profileSavedToast:'已同步保存至您的云端硬盘', needCloudToast:'请先授权连结 Google Drive 或 Dropbox',
    dropboxConnectedCrossDeviceToast:'已成功跨设备连结您的 Dropbox', driveLoadedToast:'已成功从您的 Google Drive 载入资料',
    dropboxLoadedToast:'已成功从 Dropbox 载入您的资料', dropboxConnectedToast:'已成功连结 Dropbox',
    popupBlockedToast:'请允许浏览器的弹出窗口权限后再试一次', dropboxAuthFailedToast:'Dropbox 授权失败，请重新尝试连结',
    driveAuthFailedToast:'Google Drive 授权失败', timeoutToast:'云端连线已超时，为确保资料安全同步，即将登出请重新登录',
    dropboxDisconnectedToast:'Dropbox 连线已失效，请重新点选「连结 Dropbox」授权一次', loadErrorToast:'载入云端资料时发生问题，请重新整理再试一次',
    shareCreateFailedToast:'无法建立加密分享文件，请打开浏览器控制台（Console）查看详细错误原因',
    shareCreatedNoKeyToast:'已建立加密授权，但尚未设置读取凭证，对方暂时无法打开链接', accessAddedToast:'已新增授权，对方登录后会看到通知',
    shareCreatedNotifyFailedToast:'已建立加密授权，但通知建立失败，请确认 Firestore 规则设置', encryptingUploadingLabel:'加密并上传中...',
    loadingDriveToast:'正在从 Google Drive 载入资料...', loadingDropboxToast:'正在从 Dropbox 载入资料...' },
  device: { iphone:'iPhone / iPad 设备', android:'Android 设备', windows:'Windows 电脑', mac:'Mac 电脑', linux:'Linux 电脑', generic:'移动/电脑设备' },
  country: { taiwan:'台湾', japan:'日本', korea:'韩国', china:'中国', hongkong:'香港', usa:'美国', local:'本地地区', unknown:'未知国家' },
  misc: { defaultUserName:'使用者', defaultUserInitial:'使' }
},
'en': {
  htmlLang: 'en', title: 'LogVita — Account Settings',
  nav: { brand:'LogVita', sectionOverview:'Overview', home:'Home', idcard:'ID Card', shared:'Shared with me', sectionAccount:'Account', profile:'Profile', access:'Access management', security:'Security', logout:'Log out' },
  home: { title:'Overview', sub:'See your health records at a glance and add new visits or lab results anytime', addRecord:'Add medical record', allergyBanner:'Allergy reminder',
    statTotal:'Total records', statTotalNote:'records', statRecent:'Most recent record', statRecentNone:'No records yet', statAccess:'People with access', statAccessNote:'family / providers',
    statShared:'Shared with me', statSharedNote:'sharers', recordsTitle:'Medical records', recordsSub:'Filter by type to quickly find what you need',
    filterAll:'All', filterLab:'Lab reports', filterMed:'Medications', filterImg:'Imaging', filterVisit:'Visits',
    emptyTitle:'No medical records yet', emptyDesc:'Tap "Add medical record" to start building your health archive' },
  idcard: { title:'ID Card', sub:'A health ID you carry with you — key info at a glance in an emergency', label:'Health ID', editGear:'Edit profile',
    kBirth:'DOB', kGender:'Gender', kBlood:'Blood type', kPhone:'Phone', kEmergency:'Emergency contact', kEmergencyPhone:'Emergency contact phone', kAllergy:'Allergies',
    updateTitle:'Need to update your info?', updateDesc:'Tap the gear icon on the card, or the button here, to edit your profile', editBtn:'Edit profile',
    notSet:'Not set', noKnownAllergy:'No known allergies', bloodTypeSuffix:'',
    downloadBtn:'Download ID card', downloadedToast:'Health ID card image downloaded', downloadFailedToast:'Download failed — please try again' },
  shared: { title:'Shared with me', sub:'Health records shared with you by family or healthcare providers', listTitle:'Shared list', listSub:'Health data currently shared with you',
    emptyTitle:'No one has shared health records with you yet', emptyDesc:'When family or a provider shares data with your account email under "Access management," it will appear here',
    recordsCount:(n)=>`Medical records (${n})`, noRecordsInScope:'This access scope does not include individual records', removeBtn:'Remove this shared item',
    removeConfirmTitle:'Remove this shared item?', removeConfirmMsg:'It will no longer appear in the list; you can rejoin later using the share link.',
    removedToast:'Removed from list', joinedToast:(name)=>`Joined ${name}'s shared data`, joinedLocalToast:(name)=>`Joined ${name}'s shared data (not yet linked to cloud storage — kept for this session only)`,
    loading:'Loading...' },
  profile: { title:'Profile', sub:'This information is stored securely in your personal Google Drive or Dropbox', changePhoto:'Change photo', removePhoto:'Remove photo',
    name:'Name', birth:'Date of birth', gender:'Gender', genderMale:'Male', genderFemale:'Female', genderUndisclosed:'Prefer not to say',
    blood:'Blood type', bloodUnsure:'Not sure', phone:'Phone', phonePh:'0912-345-678', emergency:'Emergency contact', emergencyPh:'Name',
    emergencyPhone:'Emergency contact phone', height:'Height (cm)', heightPh:'e.g. 170', weight:'Weight (kg)', weightPh:'e.g. 65',
    allergy:'Allergies', allergyPh:'e.g. Penicillin allergy', save:'Save changes to cloud storage', loading:'Loading...' },
  access: { title:'Access management', sub:'Manage who can view your health records', currentTitle:'Currently authorized', addBtn:'+ Add access',
    countLabel:(n)=>`${n} people can access your records`, emptyDesc:'No one is authorized to view your records yet. Tap "+ Add access" above to invite someone',
    typeFamily:'Family', typeFamilyMeta:'Family member', typeDoctor:'Healthcare provider', typeOther:'Other',
    authorizedUntil:(d)=>`Authorized until ${d}`, permanent:'Permanent access', revoke:'Revoke',
    revokeConfirmTitle:'Revoke this person\u2019s access?', revokeConfirmMsg:'They will no longer be able to read this encrypted data. This cannot be undone.',
    revokedToast:'Access revoked — this person can no longer read the encrypted data', revokedSimpleToast:'Access revoked',
    modalTitle:'Add access', modalSub:'Invite family or a healthcare provider to view your health records. They\u2019ll see a notification when they log in',
    fieldType:'Grant access to', fieldName:'Nickname (optional)', fieldNamePh:'e.g. Dr. Chen, Mei Lin', fieldEmail:'Email', fieldEmailPh:'Their email address',
    fieldExpiry:'Access duration', expiryPermanentOpt:'Permanent, until I revoke it', expiry30:'30 days', expiry90:'90 days', expiry365:'1 year', expiryCustom:'Custom date',
    expiryDateLabel:'Expiry date', fieldScope:'Access scope', scopeFull:'Full record', scopeSummary:'Summary only', scopeLab:'Lab reports only', scopeCustom:'Custom selection',
    scopeCustomLabel:'Record types they can view', fieldNote:'Invitation message (optional)', fieldNotePh:'Included in the invite, e.g. "For my upcoming appointment"',
    cancel:'Cancel', submitInvite:'Send invitation' },
  security: { title:'Account security', sub:'Manage sign-in method, password, and devices', cloudTitle:'Sign-in & cloud storage', cloudSub:'Choose one cloud drive to back up and store your health data',
    googleDrive:'Google Drive', dropbox:'Dropbox', notConnected:'Not connected', connected:'Connected',
    connectGoogle:'Connect Google Drive', connectDropbox:'Connect Dropbox', disabledUsingDropbox:'Disabled (using Dropbox)', disabledUsingGoogle:'Disabled (using Google)',
    changePwTitle:'Change password', changePwSub:'We recommend changing your password regularly and not reusing it on other sites', currentPw:'Current password', newPw:'New password', newPwPh:'At least 8 characters',
    confirmPw:'Confirm new password', confirmPwPh:'Re-enter password', updatePw:'Update password',
    devicesTitle:'Signed-in devices', deviceCountLabel:(n)=>`${n} device(s) currently signed in`, detecting:'Detecting...', locInfo:(c)=>`${c} · Last active: just now`,
    lastActiveLabel:'Last active: ', justNow:'just now', minutesAgo:(n)=>`${n} min ago`, hoursAgo:(n)=>`${n} hr ago`, daysAgo:(n)=>`${n} day(s) ago`,
    removeDeviceConfirmTitle:'Sign out this device?', removeDeviceConfirmMsg:'This device will be signed out immediately and will need to sign in again to continue.',
    deviceRemovedToast:'Device signed out', deviceRemoveFailedToast:'Failed to sign out the device — please try again',
    currentDeviceBadge:'This device', deviceLogout:'Log out',
    dangerTitle:'Delete account', dangerSub:'All your health records will be permanently removed. This cannot be undone', deleteAccount:'Delete my account',
    deleteConfirmTitle:'Delete your account?', deleteConfirmMsg:'All health records will be permanently removed. This cannot be undone.', deleteToast:'Account deletion isn\u2019t available yet — please contact support' },
  recordModal: { newTitle:'Add medical record', newSub:'Records are stored securely in your personal Google Drive or Dropbox', typeLabel:'Record type',
    typeLab:'Lab report', typeMed:'Medication', typeImg:'Imaging', typeVisit:'Visit',
    titleLabel:'Title / Institution', titlePh:'e.g. Blood panel, Wanfang Hospital Internal Medicine', dateLabel:'Date',
    doctorLabel:'Doctor / Department (optional)', doctorPh:'e.g. Dr. Chen — Family Medicine',
    noteLabel:'Notes', notePh:'e.g. Fasting glucose 92 mg/dL, normal range', photoLabel:'Attach photo (optional)', photoUploadText:'Tap to upload a report or prescription photo',
    removePhotoAria:'Remove photo', cancel:'Cancel', save:'Save record', uploading:'Uploading photo...',
    uploadFailedToast:'Photo upload failed — the record\u2019s text content was still saved', invalidImageToast:'Please upload an image file', tooLargeToast:'Photo is still too large after compression — please choose a smaller image', compressing:'Compressing photo...',
    addedCloudToast:'Record added and synced to the cloud', addedLocalToast:'Record added (connect Google Drive or Dropbox to sync)', recordFallbackLabel:'Record' },
  detail: { close:'Close', photoAlt:'Record photo', dateLabel:'Date', doctorLabel:'Doctor / Department', notProvided:'Not provided',
    noteLabel:'Notes', noNoteContent:'(No notes)', delete:'Delete record', done:'Close',
    deleteConfirmTitle:'Delete this record?', deleteConfirmMsg:'This cannot be undone.',
    deletedCloudToast:'Record deleted and synced to the cloud', deletedLocalToast:'Record deleted (connect cloud storage to sync)' },
  invite: { title:'New sharing invitation', sub:'The following user wants to share their health records with you', accept:'Accept', ignore:'Dismiss' },
  confirm: { defaultTitle:'Confirm action', cancel:'Cancel', ok:'Confirm' },
  avatar: { uploading:'Uploading...', updatedCloudToast:'Avatar updated and synced to the cloud', updatedLocalToast:'Avatar updated (not yet linked to cloud storage — kept for this session only)',
    removedCloudToast:'Custom avatar removed — back to default', removedLocalToast:'Custom avatar removed', needCloudToast:'Connect Google Drive or Dropbox first to upload a photo', compressing:'Compressing photo...',
    removeConfirmTitle:'Remove your current avatar?', removeConfirmMsg:'It will revert to the default avatar.',
    invalidImageToast:'Please upload an image file', tooLargeToast:'Photo is still too large after compression — please choose a smaller image' },
  avatarCrop: { title:'Adjust your photo', sub:'Drag to reposition, use the sliders below to zoom and rotate', zoom:'Zoom', rotate:'Rotate',
    rotateLeft:'Rotate left 90°', rotateRight:'Rotate right 90°', cancel:'Cancel', confirm:'Done' },
  cloud: { profileSavedToast:'Saved to your cloud storage', needCloudToast:'Please connect Google Drive or Dropbox first',
    dropboxConnectedCrossDeviceToast:'Your Dropbox is now linked across devices', driveLoadedToast:'Successfully loaded data from your Google Drive',
    dropboxLoadedToast:'Successfully loaded data from Dropbox', dropboxConnectedToast:'Dropbox connected successfully',
    popupBlockedToast:'Please allow pop-ups in your browser and try again', dropboxAuthFailedToast:'Dropbox authorization failed — please try connecting again',
    driveAuthFailedToast:'Google Drive authorization failed', timeoutToast:'Your cloud connection has timed out. Signing you out to keep your data in sync — please sign in again',
    dropboxDisconnectedToast:'Your Dropbox connection has expired — please reconnect via "Connect Dropbox"', loadErrorToast:'A problem occurred loading your cloud data — please refresh and try again',
    shareCreateFailedToast:'Couldn\u2019t create the encrypted share file — open the browser console for details',
    shareCreatedNoKeyToast:'Encrypted access created, but no read credential was set — the link won\u2019t work yet', accessAddedToast:'Access added — they\u2019ll see a notification when they sign in',
    shareCreatedNotifyFailedToast:'Encrypted access created, but the notification failed — please check your Firestore rules', encryptingUploadingLabel:'Encrypting and uploading...',
    loadingDriveToast:'Loading data from Google Drive...', loadingDropboxToast:'Loading data from Dropbox...' },
  device: { iphone:'iPhone / iPad', android:'Android device', windows:'Windows PC', mac:'Mac', linux:'Linux PC', generic:'Mobile/desktop device' },
  country: { taiwan:'Taiwan', japan:'Japan', korea:'South Korea', china:'China', hongkong:'Hong Kong', usa:'United States', local:'Local area', unknown:'Unknown location' },
  misc: { defaultUserName:'User', defaultUserInitial:'U' }
},
'ja': {
  htmlLang: 'ja', title: 'LogVita — アカウント設定',
  nav: { brand:'LogVita', sectionOverview:'概要', home:'ホーム', idcard:'健康IDカード', shared:'共有されたデータ', sectionAccount:'アカウント設定', profile:'プロフィール', access:'アクセス管理', security:'アカウントセキュリティ', logout:'ログアウト' },
  home: { title:'概要', sub:'健康記録をひと目で確認、最新の受診・検査情報をいつでも追加', addRecord:'医療記録を追加', allergyBanner:'アレルギー情報',
    statTotal:'記録総数', statTotalNote:'件の記録', statRecent:'最新の記録', statRecentNone:'記録なし', statAccess:'アクセス許可人数', statAccessNote:'名の家族 / 医療従事者',
    statShared:'共有されている件数', statSharedNote:'名から共有', recordsTitle:'医療記録', recordsSub:'種類で絞り込んで、必要な記録をすぐに見つけられます',
    filterAll:'すべて', filterLab:'検査結果', filterMed:'服薬記録', filterImg:'画像データ', filterVisit:'受診記録',
    emptyTitle:'まだ医療記録がありません', emptyDesc:'「医療記録を追加」をタップして、健康データベースを作成しましょう' },
  idcard: { title:'健康IDカード', sub:'いつでも携帯できる健康IDカード。緊急時に重要な情報がひと目でわかります', label:'健康IDカード', editGear:'プロフィールを編集',
    kBirth:'生年月日', kGender:'性別', kBlood:'血液型', kPhone:'電話番号', kEmergency:'緊急連絡先', kEmergencyPhone:'緊急連絡先電話番号', kAllergy:'アレルギー歴',
    updateTitle:'情報を更新しますか？', updateDesc:'カード右上の歯車アイコン、またはこちらのボタンからプロフィール編集へ', editBtn:'プロフィールを編集',
    notSet:'未設定', noKnownAllergy:'既知のアレルギーなし', bloodTypeSuffix:'型',
    downloadBtn:'健康IDカードをダウンロード', downloadedToast:'健康IDカードの画像をダウンロードしました', downloadFailedToast:'ダウンロードに失敗しました。もう一度お試しください' },
  shared: { title:'共有されたデータ', sub:'家族や医療従事者があなたに閲覧を許可した健康記録', listTitle:'共有リスト', listSub:'現在有効な、あなたに公開されている健康データ',
    emptyTitle:'まだ誰もあなたと健康記録を共有していません', emptyDesc:'家族や医療従事者が「アクセス管理」であなたのアカウントメール宛に共有すると、ここに表示されます',
    recordsCount:(n)=>`医療記録（${n} 件）`, noRecordsInScope:'このアクセス範囲には個別の医療記録は含まれていません', removeBtn:'この共有項目を削除',
    removeConfirmTitle:'この共有項目を削除しますか？', removeConfirmMsg:'削除後はリストに表示されなくなります。共有リンクから再度追加できます。',
    removedToast:'リストから削除しました', joinedToast:(name)=>`${name} の共有データに参加しました`, joinedLocalToast:(name)=>`${name} の共有データに参加しました（クラウド未連携のため今回の閲覧のみ有効）`,
    loading:'読み込み中...' },
  profile: { title:'プロフィール', sub:'この情報はお客様個人の Google Drive または Dropbox に安全に保存されます', changePhoto:'写真を変更', removePhoto:'写真を削除',
    name:'お名前', birth:'生年月日', gender:'性別', genderMale:'男性', genderFemale:'女性', genderUndisclosed:'回答しない',
    blood:'血液型', bloodUnsure:'不明', phone:'電話番号', phonePh:'0912-345-678', emergency:'緊急連絡先', emergencyPh:'お名前',
    emergencyPhone:'緊急連絡先の電話番号', height:'身長（cm）', heightPh:'例：170', weight:'体重（kg）', weightPh:'例：65',
    allergy:'アレルギー歴', allergyPh:'例：ペニシリンアレルギー', save:'クラウドに変更を保存', loading:'読み込み中...' },
  access: { title:'アクセス管理', sub:'あなたの健康記録を閲覧できる人・機関を管理', currentTitle:'現在の許可', addBtn:'＋ アクセスを追加',
    countLabel:(n)=>`${n} 名があなたの記録にアクセスできます`, emptyDesc:'まだ誰にもアクセスを許可していません。右上の「＋ アクセスを追加」から招待できます',
    typeFamily:'家族', typeFamilyMeta:'家族', typeDoctor:'医療従事者', typeOther:'その他',
    authorizedUntil:(d)=>`${d} まで有効`, permanent:'無期限', revoke:'取り消す',
    revokeConfirmTitle:'このアクセス権を取り消しますか？', revokeConfirmMsg:'取り消すと、相手はこの暗号化データを読み取れなくなります。この操作は取り消せません。',
    revokedToast:'アクセス権を取り消しました。相手はこの暗号化データを読み取れません', revokedSimpleToast:'アクセス権を取り消しました',
    modalTitle:'アクセスを追加', modalSub:'家族や医療従事者を招待して健康記録を共有します。相手がログインすると通知が表示されます',
    fieldType:'共有先の種類', fieldName:'呼び名（任意）', fieldNamePh:'例：田中先生、佐藤さん', fieldEmail:'メールアドレス', fieldEmailPh:'相手のメールアドレス',
    fieldExpiry:'有効期限', expiryPermanentOpt:'無期限（取り消すまで）', expiry30:'30日間', expiry90:'90日間', expiry365:'1年間', expiryCustom:'日付を指定',
    expiryDateLabel:'有効期限日', fieldScope:'アクセス範囲', scopeFull:'すべての記録', scopeSummary:'概要のみ', scopeLab:'検査結果のみ', scopeCustom:'カスタム選択',
    scopeCustomLabel:'閲覧できる記録の種類', fieldNote:'招待メッセージ（任意）', fieldNotePh:'招待状に添付されます。例：今回の受診で使う資料です',
    cancel:'キャンセル', submitInvite:'招待を送信' },
  security: { title:'アカウントセキュリティ', sub:'ログイン方法、パスワード、デバイスを管理', cloudTitle:'ログイン方法とクラウド保存', cloudSub:'いずれか一つのクラウドサービスを選択して健康データをバックアップ・保存してください',
    googleDrive:'Google Drive', dropbox:'Dropbox', notConnected:'未連携', connected:'連携済み',
    connectGoogle:'Google Drive と連携', connectDropbox:'Dropbox と連携', disabledUsingDropbox:'無効（Dropbox 使用中）', disabledUsingGoogle:'無効（Google 使用中）',
    changePwTitle:'パスワードを変更', changePwSub:'定期的な変更と、他サイトとの使い回しを避けることをおすすめします', currentPw:'現在のパスワード', newPw:'新しいパスワード', newPwPh:'8文字以上',
    confirmPw:'新しいパスワード（確認）', confirmPwPh:'もう一度入力', updatePw:'パスワードを更新',
    devicesTitle:'ログイン中のデバイス', deviceCountLabel:(n)=>`現在 ${n} 台のデバイスがログイン中です`, detecting:'検出中...', locInfo:(c)=>`${c} · 最終アクティビティ：たった今`,
    lastActiveLabel:'最終アクティビティ：', justNow:'たった今', minutesAgo:(n)=>`${n} 分前`, hoursAgo:(n)=>`${n} 時間前`, daysAgo:(n)=>`${n} 日前`,
    removeDeviceConfirmTitle:'このデバイスをログアウトしますか？', removeDeviceConfirmMsg:'このデバイスは即座にログアウトされ、続けるには再度ログインが必要になります。',
    deviceRemovedToast:'デバイスをログアウトしました', deviceRemoveFailedToast:'デバイスのログアウトに失敗しました。もう一度お試しください',
    currentDeviceBadge:'このデバイス', deviceLogout:'ログアウト',
    dangerTitle:'アカウント削除', dangerSub:'削除すると、すべての健康記録が完全に削除されます。この操作は取り消せません', deleteAccount:'アカウントを削除',
    deleteConfirmTitle:'アカウントを削除しますか？', deleteConfirmMsg:'すべての健康記録が完全に削除されます。この操作は取り消せません。', deleteToast:'アカウント削除機能は現在ご利用いただけません。サポートまでご連絡ください' },
  recordModal: { newTitle:'医療記録を追加', newSub:'記録はお客様個人の Google Drive または Dropbox に安全に保存されます', typeLabel:'記録の種類',
    typeLab:'検査結果', typeMed:'服薬記録', typeImg:'画像データ', typeVisit:'受診記録',
    titleLabel:'タイトル / 医療機関名', titlePh:'例：血液一般検査、萬芳病院内科', dateLabel:'日付',
    doctorLabel:'医師 / 診療科（任意）', doctorPh:'例：田中先生 — 家庭医学科',
    noteLabel:'メモ', notePh:'例：空腹時血糖 92 mg/dL、正常範囲内', photoLabel:'写真を添付（任意）', photoUploadText:'タップして報告書や処方箋の写真をアップロード',
    removePhotoAria:'写真を削除', cancel:'キャンセル', save:'記録を保存', uploading:'写真をアップロード中...',
    uploadFailedToast:'写真のアップロードに失敗しました。テキスト内容は保存されます', invalidImageToast:'画像形式のファイルをアップロードしてください', tooLargeToast:'圧縮後も写真のサイズが大きすぎます。別の写真をお試しください', compressing:'写真を圧縮中...',
    addedCloudToast:'記録を追加し、クラウドに同期しました', addedLocalToast:'記録を追加しました（同期するには Google Drive または Dropbox と連携してください）', recordFallbackLabel:'記録' },
  detail: { close:'閉じる', photoAlt:'記録の写真', dateLabel:'日付', doctorLabel:'医師 / 診療科', notProvided:'未入力',
    noteLabel:'メモ', noNoteContent:'（メモなし）', delete:'記録を削除', done:'閉じる',
    deleteConfirmTitle:'この記録を削除しますか？', deleteConfirmMsg:'この操作は取り消せません。',
    deletedCloudToast:'記録を削除し、クラウドに同期しました', deletedLocalToast:'記録を削除しました（同期するにはクラウドと連携してください）' },
  invite: { title:'新しい共有招待', sub:'以下のユーザーがあなたと健康記録を共有したいと考えています', accept:'参加', ignore:'無視' },
  confirm: { defaultTitle:'操作の確認', cancel:'キャンセル', ok:'確定' },
  avatar: { uploading:'アップロード中...', updatedCloudToast:'アバターを更新し、クラウドに同期しました', updatedLocalToast:'アバターを更新しました（クラウド未連携のため今回の閲覧のみ有効）',
    removedCloudToast:'カスタムアバターを削除し、デフォルトに戻しました', removedLocalToast:'カスタムアバターを削除しました', needCloudToast:'写真をアップロードするには先に Google Drive または Dropbox と連携してください', compressing:'写真を圧縮中...',
    removeConfirmTitle:'現在のアバター写真を削除しますか？', removeConfirmMsg:'削除するとデフォルトのアバターに戻ります。',
    invalidImageToast:'画像形式のファイルをアップロードしてください', tooLargeToast:'圧縮後も写真のサイズが大きすぎます。別の写真をお試しください' },
  avatarCrop: { title:'写真を調整', sub:'ドラッグして位置を調整し、下のスライダーで拡大縮小・回転できます', zoom:'拡大縮小', rotate:'回転',
    rotateLeft:'左に90度回転', rotateRight:'右に90度回転', cancel:'キャンセル', confirm:'完了' },
  cloud: { profileSavedToast:'クラウドに同期して保存しました', needCloudToast:'先に Google Drive または Dropbox と連携してください',
    dropboxConnectedCrossDeviceToast:'Dropbox をデバイス間で連携しました', driveLoadedToast:'Google Drive からデータを正常に読み込みました',
    dropboxLoadedToast:'Dropbox からデータを正常に読み込みました', dropboxConnectedToast:'Dropbox の連携が完了しました',
    popupBlockedToast:'ブラウザのポップアップを許可してから、もう一度お試しください', dropboxAuthFailedToast:'Dropbox の認証に失敗しました。もう一度連携をお試しください',
    driveAuthFailedToast:'Google Drive の認証に失敗しました', timeoutToast:'クラウド接続がタイムアウトしました。データ同期の安全のため、ログアウトします。もう一度ログインしてください',
    dropboxDisconnectedToast:'Dropbox の接続が無効になりました。「Dropbox と連携」から再度認証してください', loadErrorToast:'クラウドデータの読み込み中に問題が発生しました。更新してもう一度お試しください',
    shareCreateFailedToast:'暗号化された共有ファイルを作成できませんでした。ブラウザのコンソールで詳細をご確認ください',
    shareCreatedNoKeyToast:'暗号化されたアクセス権を作成しましたが、読み取り資格情報が未設定のためリンクはまだ開けません', accessAddedToast:'アクセス権を追加しました。相手がログインすると通知が表示されます',
    shareCreatedNotifyFailedToast:'暗号化されたアクセス権を作成しましたが、通知の作成に失敗しました。Firestore のルール設定をご確認ください', encryptingUploadingLabel:'暗号化してアップロード中...',
    loadingDriveToast:'Google Drive からデータを読み込んでいます...', loadingDropboxToast:'Dropbox からデータを読み込んでいます...' },
  device: { iphone:'iPhone / iPad', android:'Android デバイス', windows:'Windows PC', mac:'Mac', linux:'Linux PC', generic:'モバイル/PCデバイス' },
  country: { taiwan:'台湾', japan:'日本', korea:'韓国', china:'中国', hongkong:'香港', usa:'アメリカ', local:'現在地', unknown:'不明な地域' },
  misc: { defaultUserName:'ユーザー', defaultUserInitial:'U' }
},
'ko': {
  htmlLang: 'ko', title: 'LogVita — 계정 설정',
  nav: { brand:'LogVita', sectionOverview:'개요', home:'홈', idcard:'개인 건강카드', shared:'공유받은 기록', sectionAccount:'계정 설정', profile:'프로필', access:'권한 관리', security:'계정 보안', logout:'로그아웃' },
  home: { title:'개요', sub:'건강 기록을 한눈에 확인하고, 최신 진료·검사 정보를 언제든 추가하세요', addRecord:'의료 기록 추가', allergyBanner:'알레르기 안내',
    statTotal:'총 건강 기록 수', statTotalNote:'건', statRecent:'최근 기록', statRecentNone:'아직 기록 없음', statAccess:'접근 허용 인원', statAccessNote:'명의 가족 / 의료진',
    statShared:'공유받은 인원', statSharedNote:'명이 공유', recordsTitle:'의료 기록', recordsSub:'유형별로 필터링하여 원하는 기록을 빠르게 찾으세요',
    filterAll:'전체', filterLab:'검사 결과', filterMed:'복약 기록', filterImg:'영상 자료', filterVisit:'진료 기록',
    emptyTitle:'아직 의료 기록이 없습니다', emptyDesc:'"의료 기록 추가"를 눌러 나만의 건강 데이터베이스를 만들어보세요' },
  idcard: { title:'개인 건강카드', sub:'항상 소지하는 건강 신분증, 응급 상황에서 핵심 정보를 한눈에', label:'건강 신분증', editGear:'프로필 편집',
    kBirth:'생년월일', kGender:'성별', kBlood:'혈액형', kPhone:'연락처', kEmergency:'비상 연락처', kEmergencyPhone:'비상 연락처 전화번호', kAllergy:'알레르기 이력',
    updateTitle:'정보를 업데이트하시겠습니까?', updateDesc:'카드 우측 상단의 톱니바퀴 또는 이 버튼을 눌러 프로필 편집으로 이동', editBtn:'프로필 편집으로 이동',
    notSet:'미설정', noKnownAllergy:'알려진 알레르기 없음', bloodTypeSuffix:'형',
    downloadBtn:'건강 신분증 다운로드', downloadedToast:'건강 신분증 이미지가 다운로드되었습니다', downloadFailedToast:'다운로드에 실패했습니다. 다시 시도해 주세요' },
  shared: { title:'공유받은 기록', sub:'가족이나 의료진이 열람을 허용한 건강 기록', listTitle:'공유 목록', listSub:'현재 유효하게 공유받은 건강 데이터',
    emptyTitle:'아직 아무도 건강 기록을 공유하지 않았습니다', emptyDesc:'가족이나 의료진이 "권한 관리"에서 회원님의 계정 이메일로 공유하면 여기에 표시됩니다',
    recordsCount:(n)=>`의료 기록 (${n}건)`, noRecordsInScope:'이 접근 범위에는 개별 의료 기록이 포함되어 있지 않습니다', removeBtn:'이 공유 항목 제거',
    removeConfirmTitle:'이 공유 항목을 제거하시겠습니까?', removeConfirmMsg:'제거 후에는 목록에 표시되지 않으며, 공유 링크를 통해 다시 추가할 수 있습니다.',
    removedToast:'목록에서 제거되었습니다', joinedToast:(name)=>`${name}님의 공유 데이터에 참여했습니다`, joinedLocalToast:(name)=>`${name}님의 공유 데이터에 참여했습니다 (클라우드 미연동으로 이번 세션에만 유지됩니다)`,
    loading:'불러오는 중...' },
  profile: { title:'프로필', sub:'이 정보는 회원님 개인의 Google Drive 또는 Dropbox에 안전하게 저장됩니다', changePhoto:'사진 변경', removePhoto:'사진 제거',
    name:'이름', birth:'생년월일', gender:'성별', genderMale:'남성', genderFemale:'여성', genderUndisclosed:'밝히지 않음',
    blood:'혈액형', bloodUnsure:'모름', phone:'연락처', phonePh:'0912-345-678', emergency:'비상 연락처', emergencyPh:'이름',
    emergencyPhone:'비상 연락처 전화번호', height:'키 (cm)', heightPh:'예: 170', weight:'체중 (kg)', weightPh:'예: 65',
    allergy:'알레르기 이력', allergyPh:'예: 페니실린 알레르기', save:'변경사항을 클라우드에 저장', loading:'불러오는 중...' },
  access: { title:'권한 관리', sub:'건강 기록을 볼 수 있는 사람과 기관을 관리하세요', currentTitle:'현재 허용된 권한', addBtn:'+ 권한 추가',
    countLabel:(n)=>`${n}명이 회원님의 기록에 접근할 수 있습니다`, emptyDesc:'아직 권한을 부여한 사람이 없습니다. 오른쪽 상단의 "+ 권한 추가"를 눌러 초대해보세요',
    typeFamily:'가족', typeFamilyMeta:'가족 구성원', typeDoctor:'의료진', typeOther:'기타',
    authorizedUntil:(d)=>`${d}까지 유효`, permanent:'영구 권한', revoke:'철회',
    revokeConfirmTitle:'이 사람의 접근 권한을 철회하시겠습니까?', revokeConfirmMsg:'철회 후 상대방은 이 암호화된 데이터를 더 이상 읽을 수 없습니다. 이 작업은 되돌릴 수 없습니다.',
    revokedToast:'접근 권한이 철회되었습니다. 상대방은 이 암호화된 데이터를 더 이상 읽을 수 없습니다', revokedSimpleToast:'접근 권한이 철회되었습니다',
    modalTitle:'권한 추가', modalSub:'가족이나 의료진을 초대하여 건강 기록을 공유하세요. 상대방이 로그인하면 알림이 표시됩니다',
    fieldType:'공유 대상', fieldName:'호칭 (선택)', fieldNamePh:'예: 김 선생님, 이영희', fieldEmail:'이메일', fieldEmailPh:'상대방의 이메일 주소',
    fieldExpiry:'권한 유효 기간', expiryPermanentOpt:'영구 (철회할 때까지)', expiry30:'30일', expiry90:'90일', expiry365:'1년', expiryCustom:'날짜 지정',
    expiryDateLabel:'만료일', fieldScope:'접근 범위', scopeFull:'전체 기록', scopeSummary:'요약만', scopeLab:'검사 결과만', scopeCustom:'사용자 지정',
    scopeCustomLabel:'열람 가능한 기록 유형', fieldNote:'초대 메시지 (선택)', fieldNotePh:'초대장에 첨부됩니다. 예: 이번 진료에 필요한 자료입니다',
    cancel:'취소', submitInvite:'초대 보내기' },
  security: { title:'계정 보안', sub:'로그인 방식, 비밀번호, 기기를 관리하세요', cloudTitle:'로그인 방식 및 클라우드 저장', cloudSub:'건강 데이터를 백업하고 저장할 클라우드 드라이브를 하나 선택해 사용하세요',
    googleDrive:'Google Drive', dropbox:'Dropbox', notConnected:'연결 안 됨', connected:'연결됨',
    connectGoogle:'Google Drive 연결', connectDropbox:'Dropbox 연결', disabledUsingDropbox:'비활성화됨 (Dropbox 사용 중)', disabledUsingGoogle:'비활성화됨 (Google 사용 중)',
    changePwTitle:'비밀번호 변경', changePwSub:'비밀번호를 정기적으로 변경하고 다른 사이트와 다르게 설정하는 것을 권장합니다', currentPw:'현재 비밀번호', newPw:'새 비밀번호', newPwPh:'8자 이상',
    confirmPw:'새 비밀번호 확인', confirmPwPh:'다시 입력하세요', updatePw:'비밀번호 업데이트',
    devicesTitle:'로그인된 기기', deviceCountLabel:(n)=>`현재 ${n}대의 기기가 로그인되어 있습니다`, detecting:'감지 중...', locInfo:(c)=>`${c} · 최근 활동: 방금 전`,
    lastActiveLabel:'최근 활동: ', justNow:'방금 전', minutesAgo:(n)=>`${n}분 전`, hoursAgo:(n)=>`${n}시간 전`, daysAgo:(n)=>`${n}일 전`,
    removeDeviceConfirmTitle:'이 기기를 로그아웃하시겠습니까?', removeDeviceConfirmMsg:'이 기기는 즉시 로그아웃되며, 계속하려면 다시 로그인해야 합니다.',
    deviceRemovedToast:'해당 기기가 로그아웃되었습니다', deviceRemoveFailedToast:'기기 로그아웃에 실패했습니다. 다시 시도해 주세요',
    currentDeviceBadge:'현재 기기', deviceLogout:'로그아웃',
    dangerTitle:'계정 삭제', dangerSub:'삭제 후 모든 건강 기록이 영구적으로 제거되며, 이 작업은 되돌릴 수 없습니다', deleteAccount:'내 계정 삭제',
    deleteConfirmTitle:'계정을 삭제하시겠습니까?', deleteConfirmMsg:'모든 건강 기록이 영구적으로 제거되며, 이 작업은 되돌릴 수 없습니다.', deleteToast:'계정 삭제 기능은 아직 제공되지 않습니다. 고객센터에 문의해 주세요' },
  recordModal: { newTitle:'의료 기록 추가', newSub:'기록은 회원님 개인의 Google Drive 또는 Dropbox에 안전하게 저장됩니다', typeLabel:'기록 유형',
    typeLab:'검사 결과', typeMed:'복약 기록', typeImg:'영상 자료', typeVisit:'진료 기록',
    titleLabel:'제목 / 기관명', titlePh:'예: 혈액 일반 검사, 완팡병원 내과', dateLabel:'날짜',
    doctorLabel:'담당의 / 진료과 (선택)', doctorPh:'예: 김 선생님 — 가정의학과',
    noteLabel:'메모', notePh:'예: 공복혈당 92 mg/dL, 정상 범위', photoLabel:'사진 첨부 (선택)', photoUploadText:'탭하여 보고서나 처방전 사진 업로드',
    removePhotoAria:'사진 제거', cancel:'취소', save:'기록 저장', uploading:'사진 업로드 중...',
    uploadFailedToast:'사진 업로드에 실패했습니다. 텍스트 내용은 저장됩니다', invalidImageToast:'이미지 형식의 파일을 업로드해 주세요', tooLargeToast:'압축 후에도 사진 용량이 너무 큽니다. 다른 사진을 선택해 주세요', compressing:'사진 압축 중...',
    addedCloudToast:'기록이 추가되고 클라우드에 동기화되었습니다', addedLocalToast:'기록이 추가되었습니다 (동기화하려면 Google Drive 또는 Dropbox를 연결하세요)', recordFallbackLabel:'기록' },
  detail: { close:'닫기', photoAlt:'기록 사진', dateLabel:'날짜', doctorLabel:'담당의 / 진료과', notProvided:'입력되지 않음',
    noteLabel:'메모', noNoteContent:'(메모 없음)', delete:'기록 삭제', done:'닫기',
    deleteConfirmTitle:'이 기록을 삭제하시겠습니까?', deleteConfirmMsg:'이 작업은 되돌릴 수 없습니다.',
    deletedCloudToast:'기록이 삭제되고 클라우드에 동기화되었습니다', deletedLocalToast:'기록이 삭제되었습니다 (동기화하려면 클라우드를 연결하세요)' },
  invite: { title:'새로운 공유 초대', sub:'다음 사용자가 건강 기록을 공유하고자 합니다', accept:'참여', ignore:'무시' },
  confirm: { defaultTitle:'작업 확인', cancel:'취소', ok:'확인' },
  avatar: { uploading:'업로드 중...', updatedCloudToast:'아바타가 업데이트되고 클라우드에 동기화되었습니다', updatedLocalToast:'아바타가 업데이트되었습니다 (클라우드 미연동으로 이번 세션에만 유지됩니다)',
    removedCloudToast:'사용자 지정 아바타가 제거되고 기본값으로 돌아갔습니다', removedLocalToast:'사용자 지정 아바타가 제거되었습니다', needCloudToast:'사진을 업로드하려면 먼저 Google Drive 또는 Dropbox를 연결하세요', compressing:'사진 압축 중...',
    removeConfirmTitle:'현재 아바타 사진을 제거하시겠습니까?', removeConfirmMsg:'제거하면 기본 아바타로 돌아갑니다.',
    invalidImageToast:'이미지 형식의 파일을 업로드해 주세요', tooLargeToast:'압축 후에도 사진 용량이 너무 큽니다. 다른 사진을 선택해 주세요' },
  avatarCrop: { title:'사진 조정', sub:'드래그하여 위치를 조정하고, 아래 슬라이더로 확대/축소 및 회전하세요', zoom:'확대/축소', rotate:'회전',
    rotateLeft:'왼쪽으로 90도 회전', rotateRight:'오른쪽으로 90도 회전', cancel:'취소', confirm:'완료' },
  cloud: { profileSavedToast:'클라우드에 동기화되어 저장되었습니다', needCloudToast:'먼저 Google Drive 또는 Dropbox 연결 권한을 허용해 주세요',
    dropboxConnectedCrossDeviceToast:'기기 간에 Dropbox가 성공적으로 연결되었습니다', driveLoadedToast:'Google Drive에서 데이터를 성공적으로 불러왔습니다',
    dropboxLoadedToast:'Dropbox에서 데이터를 성공적으로 불러왔습니다', dropboxConnectedToast:'Dropbox가 성공적으로 연결되었습니다',
    popupBlockedToast:'브라우저의 팝업 권한을 허용한 후 다시 시도해 주세요', dropboxAuthFailedToast:'Dropbox 인증에 실패했습니다. 다시 연결을 시도해 주세요',
    driveAuthFailedToast:'Google Drive 인증에 실패했습니다', timeoutToast:'클라우드 연결이 시간 초과되었습니다. 데이터 동기화 보안을 위해 로그아웃되며, 다시 로그인해 주세요',
    dropboxDisconnectedToast:'Dropbox 연결이 만료되었습니다. "Dropbox 연결"을 눌러 다시 인증해 주세요', loadErrorToast:'클라우드 데이터를 불러오는 중 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요',
    shareCreateFailedToast:'암호화된 공유 파일을 생성할 수 없습니다. 브라우저 콘솔에서 자세한 오류 내용을 확인해 주세요',
    shareCreatedNoKeyToast:'암호화된 권한이 생성되었지만 읽기 자격 증명이 설정되지 않아 상대방이 아직 링크를 열 수 없습니다', accessAddedToast:'권한이 추가되었습니다. 상대방이 로그인하면 알림이 표시됩니다',
    shareCreatedNotifyFailedToast:'암호화된 권한이 생성되었지만 알림 생성에 실패했습니다. Firestore 규칙 설정을 확인해 주세요', encryptingUploadingLabel:'암호화 및 업로드 중...',
    loadingDriveToast:'Google Drive에서 데이터를 불러오는 중...', loadingDropboxToast:'Dropbox에서 데이터를 불러오는 중...' },
  device: { iphone:'iPhone / iPad', android:'Android 기기', windows:'Windows PC', mac:'Mac', linux:'Linux PC', generic:'모바일/PC 기기' },
  country: { taiwan:'대만', japan:'일본', korea:'대한민국', china:'중국', hongkong:'홍콩', usa:'미국', local:'현재 지역', unknown:'알 수 없는 지역' },
  misc: { defaultUserName:'사용자', defaultUserInitial:'U' }
}
};

// ============================================================================
// reset-password.html（重設密碼頁）翻譯內容
// ============================================================================
export const resetPasswordTranslations = {
'zh-TW': {
  title:'健康庫 LogVita — 重設密碼',
  verifyingEyebrow:'請稍候', verifyingHeading:'正在驗證重設連結…',
  formEyebrow:'設定新密碼', formHeading:'請輸入新密碼',
  accountEmailLine:(email)=>`為 ${email} 設定新密碼`,
  newPassword:'新密碼', newPasswordPh:'至少 6 個字元',
  confirmPassword:'確認新密碼', confirmPasswordPh:'請再輸入一次密碼',
  errPasswordShort:'密碼至少需要 6 個字元。', errPasswordMismatch:'兩次輸入的密碼不一致。',
  submit:'更新密碼', updating:'更新中…',
  successEyebrow:'完成', successHeading:'密碼已更新',
  successDesc:'您的密碼已成功重設，請使用新密碼登入。', backToLogin:'返回登入頁',
  errorEyebrow:'連結無效', errorHeading:'連結無效或已過期',
  errorDesc:'這個密碼重設連結可能已經使用過、已過期，或格式不正確，請重新申請一次。',
  requestNewLink:'回登入頁重新申請',
  genericError:'發生錯誤，請稍後再試。',
  errors:{
    'auth/expired-action-code':'這個重設連結已經過期，請重新申請一次。',
    'auth/invalid-action-code':'這個重設連結無效或已被使用過，請重新申請一次。',
    'auth/user-disabled':'此帳號已被停用。',
    'auth/user-not-found':'找不到對應的帳號。',
    'auth/weak-password':'密碼強度不足，請使用至少 6 個字元。',
    'auth/network-request-failed':'網路連線發生問題，請稍後再試。'
  }
},
'zh-CN': {
  title:'健康库 LogVita — 重置密码',
  verifyingEyebrow:'请稍候', verifyingHeading:'正在验证重置链接…',
  formEyebrow:'设置新密码', formHeading:'请输入新密码',
  accountEmailLine:(email)=>`为 ${email} 设置新密码`,
  newPassword:'新密码', newPasswordPh:'至少 6 个字符',
  confirmPassword:'确认新密码', confirmPasswordPh:'请再输入一次密码',
  errPasswordShort:'密码至少需要 6 个字符。', errPasswordMismatch:'两次输入的密码不一致。',
  submit:'更新密码', updating:'更新中…',
  successEyebrow:'完成', successHeading:'密码已更新',
  successDesc:'您的密码已成功重置，请使用新密码登录。', backToLogin:'返回登录页',
  errorEyebrow:'链接无效', errorHeading:'链接无效或已过期',
  errorDesc:'这个密码重置链接可能已经使用过、已过期，或格式不正确，请重新申请一次。',
  requestNewLink:'回登录页重新申请',
  genericError:'发生错误，请稍后再试。',
  errors:{
    'auth/expired-action-code':'这个重置链接已经过期，请重新申请一次。',
    'auth/invalid-action-code':'这个重置链接无效或已被使用过，请重新申请一次。',
    'auth/user-disabled':'此账号已被停用。',
    'auth/user-not-found':'找不到对应的账号。',
    'auth/weak-password':'密码强度不足，请使用至少 6 个字符。',
    'auth/network-request-failed':'网络连接发生问题，请稍后再试。'
  }
},
'en': {
  title:'LogVita — Reset Password',
  verifyingEyebrow:'Please wait', verifyingHeading:'Verifying reset link…',
  formEyebrow:'Set a new password', formHeading:'Enter your new password',
  accountEmailLine:(email)=>`Setting a new password for ${email}`,
  newPassword:'New password', newPasswordPh:'At least 6 characters',
  confirmPassword:'Confirm new password', confirmPasswordPh:'Re-enter your password',
  errPasswordShort:'Password must be at least 6 characters.', errPasswordMismatch:'Passwords do not match.',
  submit:'Update password', updating:'Updating…',
  successEyebrow:'Done', successHeading:'Password updated',
  successDesc:'Your password has been reset. Please sign in with your new password.', backToLogin:'Back to sign in',
  errorEyebrow:'Invalid link', errorHeading:'This link is invalid or has expired',
  errorDesc:'This password reset link may have already been used, expired, or is malformed. Please request a new one.',
  requestNewLink:'Back to sign in to request a new link',
  genericError:'Something went wrong. Please try again later.',
  errors:{
    'auth/expired-action-code':'This reset link has expired. Please request a new one.',
    'auth/invalid-action-code':'This reset link is invalid or has already been used. Please request a new one.',
    'auth/user-disabled':'This account has been disabled.',
    'auth/user-not-found':'No matching account was found.',
    'auth/weak-password':'Password is too weak — please use at least 6 characters.',
    'auth/network-request-failed':'A network error occurred. Please try again later.'
  }
},
'ja': {
  title:'LogVita — パスワードの再設定',
  verifyingEyebrow:'お待ちください', verifyingHeading:'再設定リンクを確認しています…',
  formEyebrow:'新しいパスワードの設定', formHeading:'新しいパスワードを入力してください',
  accountEmailLine:(email)=>`${email} の新しいパスワードを設定します`,
  newPassword:'新しいパスワード', newPasswordPh:'6文字以上',
  confirmPassword:'新しいパスワード（確認）', confirmPasswordPh:'もう一度パスワードを入力',
  errPasswordShort:'パスワードは6文字以上である必要があります。', errPasswordMismatch:'パスワードが一致しません。',
  submit:'パスワードを更新', updating:'更新中…',
  successEyebrow:'完了', successHeading:'パスワードを更新しました',
  successDesc:'パスワードの再設定が完了しました。新しいパスワードでログインしてください。', backToLogin:'ログインページへ戻る',
  errorEyebrow:'リンクが無効です', errorHeading:'リンクが無効または期限切れです',
  errorDesc:'このパスワード再設定リンクはすでに使用されたか、期限切れ、または形式が正しくない可能性があります。もう一度お試しください。',
  requestNewLink:'ログインページへ戻って再度申請する',
  genericError:'エラーが発生しました。しばらくしてから再度お試しください。',
  errors:{
    'auth/expired-action-code':'この再設定リンクは期限切れです。もう一度お試しください。',
    'auth/invalid-action-code':'この再設定リンクは無効か、すでに使用されています。もう一度お試しください。',
    'auth/user-disabled':'このアカウントは無効化されています。',
    'auth/user-not-found':'該当するアカウントが見つかりません。',
    'auth/weak-password':'パスワードの強度が不十分です。6文字以上にしてください。',
    'auth/network-request-failed':'ネットワークエラーが発生しました。しばらくしてから再度お試しください。'
  }
},
'ko': {
  title:'LogVita — 비밀번호 재설정',
  verifyingEyebrow:'잠시만 기다려 주세요', verifyingHeading:'재설정 링크를 확인하는 중…',
  formEyebrow:'새 비밀번호 설정', formHeading:'새 비밀번호를 입력하세요',
  accountEmailLine:(email)=>`${email} 계정의 새 비밀번호를 설정합니다`,
  newPassword:'새 비밀번호', newPasswordPh:'최소 6자 이상',
  confirmPassword:'새 비밀번호 확인', confirmPasswordPh:'비밀번호를 다시 입력하세요',
  errPasswordShort:'비밀번호는 최소 6자 이상이어야 합니다.', errPasswordMismatch:'비밀번호가 일치하지 않습니다.',
  submit:'비밀번호 업데이트', updating:'업데이트 중…',
  successEyebrow:'완료', successHeading:'비밀번호가 변경되었습니다',
  successDesc:'비밀번호 재설정이 완료되었습니다. 새 비밀번호로 로그인해 주세요.', backToLogin:'로그인 페이지로 돌아가기',
  errorEyebrow:'링크가 유효하지 않습니다', errorHeading:'링크가 유효하지 않거나 만료되었습니다',
  errorDesc:'이 비밀번호 재설정 링크는 이미 사용되었거나 만료되었거나 형식이 올바르지 않을 수 있습니다. 다시 요청해 주세요.',
  requestNewLink:'로그인 페이지로 돌아가 다시 요청하기',
  genericError:'오류가 발생했습니다. 나중에 다시 시도해 주세요.',
  errors:{
    'auth/expired-action-code':'이 재설정 링크는 만료되었습니다. 다시 요청해 주세요.',
    'auth/invalid-action-code':'이 재설정 링크가 유효하지 않거나 이미 사용되었습니다. 다시 요청해 주세요.',
    'auth/user-disabled':'이 계정은 비활성화되었습니다.',
    'auth/user-not-found':'해당 계정을 찾을 수 없습니다.',
    'auth/weak-password':'비밀번호가 너무 약합니다. 최소 6자 이상 입력해 주세요.',
    'auth/network-request-failed':'네트워크 오류가 발생했습니다. 나중에 다시 시도해 주세요.'
  }
}
};
