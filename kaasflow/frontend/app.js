/* ============================================================
   KaasFlow — app.js
   Vanilla JS SPA · Mobile-first · localStorage business data
   Flask backend for auth only · ES6+ · Bootstrap 5 modals
   ============================================================ */

'use strict';

// ── CONFIG ──────────────────────────────────────────────────
let API_BASE = 'https://www.samkass.site/api';
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  API_BASE = 'http://127.0.0.1:5000/api';
} else if (window.location.port === '5500') {
  API_BASE = `http://${window.location.hostname}:5000/api`;
} else if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
  API_BASE = window.location.origin + '/api';
}
const LS = {
  session:  'kf_session',
  settings: 'kf_settings',
  clients:  'kf_clients',
  loans:    'kf_loans',
  payments: 'kf_payments',
  recycleBin: 'kf_recycle_bin',
};
const FREE_CLIENT_LIMIT = 20;

// ── PLAN UPGRADE STATE ──────────────────────────────────────
const PLAN_PRICES = {
  monthly: 270,
  quarterly: 850,
  yearly: 1999
};
const PLAN_NAMES = {
  monthly: 'Monthly Plan',
  quarterly: 'Quarterly Plan',
  yearly: 'Yearly Plan'
};
let pendingPlanType = null;
let pendingPaymentAmount = 0;


// ── TRANSLATIONS ─────────────────────────────────────────────
const T = {
  en: {
    dashboard: 'Dashboard', clients: 'Clients', loans: 'Loans',
    collect: 'Collect', reports: 'Reports', settings: 'Settings',
    totalClients: 'Total Clients', loanGiven: 'Loan Given',
    collected: 'Collected', pending: 'Pending',
    dueToday: 'Due Today', recentPayments: 'Recent Payments',
    monthlyCollection: 'Monthly Collection',
    noPayments: 'No payments yet', noDueToday: 'No collections due today',
    addClient: 'Add Client', editClient: 'Edit Client',
    saveClient: 'Save Client', searchClients: 'Search clients…',
    noClients: 'No clients yet', addFirstClient: 'Add your first client to get started',
    addLoan: 'Add Loan', editLoan: 'Edit Loan', saveLoan: 'Save Loan',
    noLoans: 'No loans yet', principal: 'Principal',
    interest: 'Interest', duration: 'Duration', emiType: 'EMI Type',
    monthly: 'Monthly', weekly: 'Weekly', daily: 'Daily',
    startDate: 'Start Date', emi: 'EMI', totalPayable: 'Total Payable',
    totalInterest: 'Total Interest', nextDue: 'Next Due',
    recordPayment: 'Record Payment', paymentHistory: 'Payment History',
    sendReminder: 'Send Reminder', whatsapp: 'WhatsApp',
    receipt: 'Receipt', missed: 'Missed',
    overdue: 'Overdue', active: 'Active', completed: 'Completed',
    all: 'All', dueNow: 'Due Now',
    businessName: 'Business Name', financierName: 'Your Name',
    phone: 'Phone', language: 'Language', theme: 'Theme',
    darkMode: 'Dark Mode', exportData: 'Export Data',
    importData: 'Import Data', clearData: 'Clear All Data',
    changePin: 'Change PIN', currentPlan: 'Current Plan',
    free: 'Free', upgrade: 'Upgrade',
    logout: 'Logout', reminderMsg: (name, amt) => `Dear ${name}, your EMI ₹${amt} is due today. Please pay to avoid penalties. – KaasFlow`,
    reminderMsgOverdue: (name, amt, days) => `Dear ${name}, your EMI ₹${amt} is ${days} day(s) overdue. Please pay immediately. – KaasFlow`,
    recoveryRate: 'Recovery Rate', topDefaulters: 'Top Defaulters',
    totalInterestEarned: 'Total Interest Earned',
    exportExcel: 'Export Excel', exportCSV: 'Export CSV',
    clientWiseSummary: 'Client-wise Summary',
    loadingWorkspace: 'Loading your workspace…',
    welcomeToSamKass: 'Welcome to SamKass',
    chooseSignInMethod: 'Choose your sign-in method',
    continueWithEmail: 'Continue with Email',
    backToOptions: 'Back to options',
    welcomeBack: 'Welcome Back',
    signInToAccount: 'Sign in to your account',
    orUseEmail: 'or use email',
    emailAddress: 'Email Address',
    password: 'Password',
    noAccount: "Don't have an account?",
    register: 'Register',
    createAccount: 'Create Account',
    startManagingLoans: 'Start managing your loans',
    fullName: 'Full Name',
    businessNameInput: 'Business / Firm Name',
    haveAccount: 'Already have an account?',
    login: 'Login',
    setSecurityPin: 'Set Security PIN',
    createPinDesc: 'Create a 4-digit PIN to protect your app',
    setPinContinue: 'Set PIN & Continue',
    pinInfoText: "You'll use this PIN every time you open the app",
    enterPin: 'Enter your 4-digit PIN',
    unlock: 'Unlock',
    switchAccount: 'Switch Account',
    notifications: 'Notifications',
    clearAll: 'Clear all',
    noNewNotifications: 'No new notifications',
    address: 'Address',
    cancel: 'Cancel',
    confirmPayment: 'Confirm Payment',
    noteOptional: 'Note (optional)',
    clientProfile: 'Client Profile',
    close: 'Close',
    confirmDelete: 'Confirm Delete',
    delete: 'Delete',
    upgradePlan: 'Upgrade Plan',
    buyClientSlots: 'Buy Client Slots',
    extraClients: 'Extra Clients'
  },
  ta: {
    dashboard: 'டாஷ்போர்டு', clients: 'வாடிக்கையாளர்கள்',
    loans: 'கடன்கள்', collect: 'வசூல்', reports: 'அறிக்கைகள்',
    settings: 'அமைப்புகள்',
    totalClients: 'மொத்த வாடிக்கையாளர்கள்', loanGiven: 'கொடுத்த கடன்',
    collected: 'வசூலித்தது', pending: 'நிலுவை',
    dueToday: 'இன்று வரவேண்டியது', recentPayments: 'சமீபத்திய கட்டணங்கள்',
    monthlyCollection: 'மாதாந்திர வசூல்',
    noPayments: 'கட்டணங்கள் இல்லை', noDueToday: 'இன்று வசூல் இல்லை',
    addClient: 'வாடிக்கையாளரை சேர்க்க', editClient: 'திருத்து',
    saveClient: 'சேமி', searchClients: 'தேடுங்கள்…',
    noClients: 'வாடிக்கையாளர்கள் இல்லை',
    addFirstClient: 'முதல் வாடிக்கையாளரை சேர்க்கவும்',
    addLoan: 'கடன் சேர்க்க', editLoan: 'கடன் திருத்து', saveLoan: 'சேமி',
    noLoans: 'கடன்கள் இல்லை', principal: 'அசல்',
    interest: 'வட்டி', duration: 'காலம்', emiType: 'EMI வகை',
    monthly: 'மாதாந்திர', weekly: 'வாராந்திர', daily: 'தினசரி',
    startDate: 'தொடக்க தேதி', emi: 'EMI', totalPayable: 'மொத்தம் செலுத்த',
    totalInterest: 'மொத்த வட்டி', nextDue: 'அடுத்த தேதி',
    recordPayment: 'கட்டணம் பதிவு', paymentHistory: 'கட்டண வரலாறு',
    sendReminder: 'நினைவூட்டல்', whatsapp: 'வாட்ஸ்அப்',
    receipt: 'ரசீது', missed: 'தவறவிட்டது',
    overdue: 'தாமதமானது', active: 'செயலில்', completed: 'முடிந்தது',
    all: 'அனைத்தும்', dueNow: 'இப்போது வரவேண்டியது',
    businessName: 'வணிக பெயர்', financierName: 'உங்கள் பெயர்',
    phone: 'தொலைபேசி', language: 'மொழி', theme: 'தீம்',
    darkMode: 'இருள் பயன்முறை', exportData: 'தரவு ஏற்றுமதி',
    importData: 'தரவு இறக்குமதி', clearData: 'அனைத்தையும் அழி',
    changePin: 'PIN மாற்று', currentPlan: 'தற்போதைய திட்டம்',
    free: 'இலவசம்', upgrade: 'மேம்படுத்து',
    logout: 'வெளியேறு',
    reminderMsg: (name, amt) => `அன்புள்ள ${name}, உங்கள் EMI ₹${amt} இன்று செலுத்த வேண்டும். – KaasFlow`,
    reminderMsgOverdue: (name, amt, days) => `அன்புள்ள ${name}, உங்கள் EMI ₹${amt} ${days} நாள் தாமதமாகிவிட்டது. உடனே செலுத்துங்கள். – KaasFlow`,
    recoveryRate: 'வசூல் விகிதம்', topDefaulters: 'முதல் நிலுவையாளர்கள்',
    totalInterestEarned: 'மொத்த வட்டி ஆதாயம்',
    exportExcel: 'Excel ஏற்றுமதி', exportCSV: 'CSV ஏற்றுமதி',
    clientWiseSummary: 'வாடிக்கையாளர் சுருக்கம்',
    loadingWorkspace: 'உங்கள் பணியிடம் ஏற்றப்படுகிறது…',
    welcomeToSamKass: 'சாம்காஸ்-க்கு வரவேற்கிறோம்',
    chooseSignInMethod: 'உள்நுழைவு முறையைத் தேர்ந்தெடுக்கவும்',
    continueWithEmail: 'மின்னஞ்சல் மூலம் தொடரவும்',
    backToOptions: 'விருப்பங்களுக்குத் திரும்புக',
    welcomeBack: 'மீண்டும் வருக',
    signInToAccount: 'உங்கள் கணக்கில் உள்நுழைக',
    orUseEmail: 'அல்லது மின்னஞ்சலை பயன்படுத்தவும்',
    emailAddress: 'மின்னஞ்சல் முகவரி',
    password: 'கடவுச்சொல்',
    noAccount: "கணக்கு இல்லையா?",
    register: 'பதிவு செய்க',
    createAccount: 'கணக்கை உருவாக்கு',
    startManagingLoans: 'உங்கள் கடன்களை நிர்வகிக்க தொடங்குங்கள்',
    fullName: 'முழு பெயர்',
    businessNameInput: 'வணிகம் / நிறுவனத்தின் பெயர்',
    haveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
    login: 'உள்நுழை',
    setSecurityPin: 'பாதுகாப்பு PIN ஐ அமைக்கவும்',
    createPinDesc: 'உங்கள் செயலியை பாதுகாக்க 4 இலக்க PIN ஐ உருவாக்கவும்',
    setPinContinue: 'PIN ஐ அமைத்து தொடரவும்',
    pinInfoText: "ஒவ்வொரு முறை செயலியை திறக்கும் போதும் இந்த PIN ஐ பயன்படுத்துவீர்கள்",
    enterPin: 'உங்கள் 4 இலக்க PIN ஐ உள்ளிடவும்',
    unlock: 'திற',
    switchAccount: 'கணக்கை மாற்று',
    notifications: 'அறிவிப்புகள்',
    clearAll: 'அனைத்தையும் அழி',
    noNewNotifications: 'புதிய அறிவிப்புகள் இல்லை',
    address: 'முகவரி',
    cancel: 'ரத்துசெய்',
    confirmPayment: 'கட்டணத்தை உறுதிப்படுத்து',
    noteOptional: 'குறிப்பு (விருப்பமானால்)',
    clientProfile: 'வாடிக்கையாளர் சுயவிவரம்',
    close: 'மூடு',
    confirmDelete: 'நீக்குவதை உறுதிசெய்க',
    delete: 'நீக்கு',
    upgradePlan: 'திட்டத்தை மேம்படுத்து',
    buyClientSlots: 'வாடிக்கையாளர் இடங்களை வாங்கவும்',
    extraClients: 'கூடுதல் வாடிக்கையாளர்கள்'
  }
};

const INDIAN_LANGS = {
  as: {
    dashboard: 'ড্যাশবৰ্ড', clients: 'গ্ৰাহকসকল', loans: 'ঋণসমূহ',
    collect: 'সংগ্ৰহ', reports: 'প্ৰতিবেদন', settings: 'ছেটিংছ',
    logout: 'লগ আউট', language: 'ভাষা', cancel: 'বাতিল',
    saveClient: 'গ্ৰাহক সংৰক্ষণ', saveLoan: 'ঋণ সংৰক্ষণ', clearData: 'তথ্য মচি পেলাওক'
  },
  bn: {
    dashboard: 'ড্যাশবোর্ড', clients: 'গ্রাহক', loans: 'ঋণ',
    collect: 'সংগ্রহ', reports: 'রিপোর্ট', settings: 'সেটিংস',
    logout: 'লগ আউট', language: 'ভাষা', cancel: 'বাতিল',
    saveClient: 'গ্রাহক সংরক্ষণ', saveLoan: 'ঋণ সংরক্ষণ', clearData: 'সব তথ্য মুছুন'
  },
  brx: {
    dashboard: 'ড্যাশবোৰ্ড', clients: 'গ্রাহকশিং', loans: 'শেন্থোংশিং',
    collect: 'খোমজিনবা', reports: 'রিপোর্তশিং', settings: 'সেতিংস',
    logout: 'লগ আউত', language: 'লোন', cancel: 'তোকপা',
    saveClient: 'গ্রাহক থমজিনবা', saveLoan: 'শেন্থোং থমজিনবা', clearData: 'অপুম্বা দেতা লৌথোকপা'
  },
  doi: {
    dashboard: 'डैशबोर्ड', clients: 'ग्राहक', loans: 'कर्ज',
    collect: 'इकट्ठा', reports: 'रिपोर्ट', settings: 'सैटिंग्स',
    logout: 'लॉगआउट', language: 'बोली', cancel: 'रद्द',
    saveClient: 'ग्राहक बचाओ', saveLoan: 'कर्ज बचाओ', clearData: 'सारे डेटा साफ करो'
  },
  gu: {
    dashboard: 'ડેશબોર્ડ', clients: 'ગ્રાહકો', loans: 'લોન',
    collect: 'એકત્રિત કરો', reports: 'અહેવાલો', settings: 'સેટિંગ્સ',
    logout: 'લોગ આઉટ', language: 'ભાષા', cancel: 'રદ કરો',
    saveClient: 'ગ્રાહક સાચવો', saveLoan: 'લોન સાચવો', clearData: 'બધો ડેટા સાફ કરો'
  },
  hi: {
    dashboard: 'डैशबोर्ड', clients: 'ग्राहक', loans: 'ऋण',
    collect: 'संग्रह', reports: 'रिपोर्ट', settings: 'सेटिंग्स',
    logout: 'लॉग आउट', language: 'भाषा', cancel: 'रद्द करें',
    saveClient: 'ग्राहक सहेजें', saveLoan: 'ऋण सहेजें', clearData: 'सभी डेटा मिटाएं',
    totalClients: 'कुल ग्राहक', loanGiven: 'दिया गया ऋण', collected: 'वसूल किया गया', pending: 'लंबित',
    dueToday: 'आज देय', recordPayment: 'भुगतान दर्ज करें', changePin: 'पिन बदलें'
  },
  kn: {
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', clients: 'ಗ್ರಾಹಕರು', loans: 'ಸಾಲಗಳು',
    collect: 'ಸಂಗ್ರಹಿಸಿ', reports: 'ವರದಿಗಳು', settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    logout: 'ಲಾಗ್ ಔಟ್', language: 'ಭಾಷೆ', cancel: 'ರದ್ದುಗೊಳಿಸु',
    saveClient: 'ಗ್ರಾಹಕರನ್ನು ಉಳಿಸು', saveLoan: 'ಸಾಲವನ್ನು ಉಳಿಸು', clearData: 'ಎಲ್ಲಾ ಡೇಟಾವನ್ನು ಅಳಿಸು'
  },
  ks: {
    dashboard: 'ڈیش بورڈ', clients: 'خریدار', loans: 'قرضہ',
    collect: 'جمع کَرُن', reports: 'رپوٹ', settings: 'سیٹنگ',
    logout: 'لاگ آؤٹ', language: 'زبان', cancel: 'منسوخ',
    saveClient: 'خریدار تھاوُن', saveLoan: 'قرضہ تھاوُن', clearData: 'ساری ڈیٹا صاف کَرُن'
  },
  kok: {
    dashboard: 'डॅशबोर्ड', clients: 'गिऱ्हाईक', loans: 'ऋण',
    collect: 'एकठा करप', reports: 'अहवाल', settings: 'मांडणी',
    logout: 'भायर सरप', language: 'भास', cancel: 'रद्द करप',
    saveClient: 'गिऱ्हाईक सांबाळप', saveLoan: 'ऋण सांबाळप', clearData: 'सगळी म्हायती काडून उडोवप'
  },
  mai: {
    dashboard: 'डैशबोर्ड', clients: 'ग्राहक', loans: 'ऋण',
    collect: 'संग्रह', reports: 'रिपोर्ट', settings: 'सेटिंग्स',
    logout: 'लॉगआउट', language: 'भाषा', cancel: 'रद्द करू',
    saveClient: 'ग्राहक बचाउ', saveLoan: 'ऋण बचाउ', clearData: 'सभ डेटा साफ करू'
  },
  ml: {
    dashboard: 'ഡാഷ്‌ബോർഡ്', clients: 'ഇടപാടുകാർ', loans: 'വായ്പകൾ',
    collect: 'ശേഖരിക്കുക', reports: 'റിപ്പോർട്ടുകൾ', settings: 'ക്രമീകരണങ്ങൾ',
    logout: 'ലോഗ് ഔട്ട്', language: 'ഭാഷ', cancel: 'റദ്ദാക്കുക',
    saveClient: 'ഇടപാടുകാരനെ സംരക്ഷിക്കുക', saveLoan: 'വായ്പ സംരക്ഷിക്കുക', clearData: 'എല്ലാ ഡാറ്റയും മായ്ക്കുക'
  },
  mni: {
    dashboard: 'ডেশবোর্দ', clients: 'গ্রাহকশিং', loans: 'শেন্থোংশিং',
    collect: 'খোমজিনবা', reports: 'রিপোর্তশিং', settings: 'সেতিংস',
    logout: 'লোগ আউত', language: 'লোন', cancel: 'তোকপা',
    saveClient: 'গ্রাহক থমজিনবা', saveLoan: 'শেন্থোং থমজিনবা', clearData: 'অপুম্বা দেতা লৌথোকপা'
  },
  mr: {
    dashboard: 'डॅशबोर्ड', clients: 'ग्राहक', loans: 'कर्ज',
    collect: 'वसुली', reports: 'अहवाल', settings: 'सेटिंग्ज',
    logout: 'बाहेर पडा', language: 'भाषा', cancel: 'रद्द करा',
    saveClient: 'ग्राहक जतन करा', saveLoan: 'कर्ज जतन करा', clearData: 'सर्व डेटा मिटवा',
    totalClients: 'एकूण ग्राहक', loanGiven: 'दिलेले कर्ज', collected: 'वसुली केलेले', pending: 'प्रलंबित'
  },
  ne: {
    dashboard: 'ड्यासबोर्ड', clients: 'ग्राहकहरू', loans: 'ऋणहरू',
    collect: 'संकलन', reports: 'रिपोर्टहरू', settings: 'सेटिङहरू',
    logout: 'लग आउट', language: 'भाषा', cancel: 'रद्द गर्नुहोस्',
    saveClient: 'ग्राहक सुरक्षित गर्नुहोस्', saveLoan: 'ऋण सुरक्षित गर्नुहोस्', clearData: 'सबै डाटा मेटाउनुहोस्'
  },
  or: {
    dashboard: 'ଡ୍ୟାସବୋର୍ଡ', clients: 'ଗ୍ରାହକ', loans: 'ଋଣ',
    collect: 'ସଂଗ୍ରହ', reports: 'ରିପୋର୍ଟ', settings: 'ସେଟିଂସ',
    logout: 'ଲଗ ଆଉଟ', language: 'ଭାଷା', cancel: 'ବାତିล କରନ୍ତୁ',
    saveClient: 'ଗ୍ରାହକ ସଞ୍ચୟ କରନ୍ତୁ', saveLoan: 'ଋଣ ସଞ୍ଚୟ କରନ୍ତು', clearData: 'ସବୁ ଡାଟା ଲିଭାନ୍ତୁ'
  },
  pa: {
    dashboard: 'ਡੈਸ਼ਬੋਰਡ', clients: 'ਗਾਹਕ', loans: 'ਕਰਜ਼ੇ',
    collect: 'ਇਕੱਠਾ ਕਰੋ', reports: 'ਰਿਪੋਰਟਾਂ', settings: 'ਸੈਟਿੰਗਾਂ',
    logout: 'ਲੌਗ ਆਉਟ', language: 'ਭਾਸ਼ਾ', cancel: 'ਰੱਦ ਕਰੋ',
    saveClient: 'ਗਾਹਕ ਸੰਭਾਲੋ', saveLoan: 'ਕਰਜ਼ਾ ਸੰਭਾਲੋ', clearData: 'ਸਾਰਾ ਡੇਟਾ ਸਾਫ਼ ਕਰੋ'
  },
  sa: {
    dashboard: 'पट्टिका', clients: 'ग्राहकाः', loans: 'ऋणानि',
    collect: 'संग्रहः', reports: 'विवरणानि', settings: 'समायोजनानि',
    logout: 'बहिर्गमनम्', language: 'भाषा', cancel: 'प्रत्याहारः',
    saveClient: 'ग्राहकं रक्षतु', saveLoan: 'ऋणं रक्षतु', clearData: 'सर्वाणि विवरणानि निष्कासयतु'
  },
  sat: {
    dashboard: 'ড্যাশবোর্ড', clients: 'গ্রাহককো', loans: 'ঋণকো',
    collect: 'তুমাল', reports: 'রিপোর্টকো', settings: 'সেটিংস',
    logout: 'লগআউট', language: 'পারসি', cancel: 'বাতিল',
    saveClient: 'গ্রাহক সাঁচাও', saveLoan: 'ঋণ সাঁচাও', clearData: 'সাঁচাও ডাটা মেটাও'
  },
  sd: {
    dashboard: 'ڊيش بورڊ', clients: 'گراهڪ', loans: 'قرضا',
    collect: 'گڏ ڪرڻ', reports: 'رپورتون', settings: 'سيٽنگون',
    logout: 'لاگ آئوٽ', language: 'ٻولي', cancel: 'رد ڪرڻ',
    saveClient: 'گراهڪ بچايو', saveLoan: 'قرضو بچايو', clearData: 'سڄو ڊيٽا ختم ڪريو'
  },
  te: {
    dashboard: 'డాష్‌బోర్డ్', clients: 'కస్టమర్లు', loans: 'రుణాలు',
    collect: 'వసూలు', reports: 'నివేదికలు', settings: 'సెట్టింగ్స్',
    logout: 'లాగ్ అవుట్', language: 'భాష', cancel: 'రద్దు చేయి',
    saveClient: 'కస్టమర్ సేవ్ చేయి', saveLoan: 'రుణం సేవ్ చేయి', clearData: 'మొత్తం డేటా తుడిచివేయి'
  },
  ur: {
    dashboard: 'ڈیش بورڈ', clients: 'گراہک', loans: 'قرضے',
    collect: 'وصولی', reports: 'رپورٹیں', settings: 'سیٹنگز',
    logout: 'لاگ آؤట్', language: 'زبان', cancel: 'منسوخ کریں',
    saveClient: 'گراہک محفوظ کریں', saveLoan: 'قرضہ محفوظ کریں', clearData: 'تمام डेटा साफ करें'
  }
};

Object.assign(T, INDIAN_LANGS);

// ── STATE ─────────────────────────────────────────────────────
const state = {
  page: 'dashboard',
  lang: 'en',
  theme: 'light',
  session: null,
  collectionFilter: 'all',
  loanFilter: 'all',
  clientSearch: '',
  charts: {},
  deleteCallback: null,
  profileClientId: null,
  currentReceiptPayment: null,
  currentReceiptLoan: null,
};

// ── HELPERS ──────────────────────────────────────────────────
const t = (key, ...args) => {
  const dict = T[state.lang] || T.en;
  let val = dict[key];
  if (val === undefined) val = T.en[key];
  if (typeof val === 'function') return val(...args);
  return val !== undefined ? val : key;
};

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function fmtCur(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function daysDiff(a, b) {
  return Math.round((new Date(a) - new Date(b)) / 86400000);
}

// ── LOCAL STORAGE ─────────────────────────────────────────────
const Store = {
  get: key => { try { return JSON.parse(localStorage.getItem(LS[key])) || []; } catch { return []; } },
  getObj: key => { try { return JSON.parse(localStorage.getItem(LS[key])) || {}; } catch { return {}; } },
  set: (key, val) => {
    localStorage.setItem(LS[key], JSON.stringify(val));
    if (window.KFSync && LS[key] !== 'kf_session') {
      clearTimeout(window._kfSyncTimer);
      window._kfSyncTimer = setTimeout(() => KFSync.backup(true), 2000);
    }
    if (window.SecondarySupabase && SecondarySupabase.hasCredentials() && LS[key] !== 'kf_session') {
      clearTimeout(window._kfSecondarySyncTimer);
      window._kfSecondarySyncTimer = setTimeout(() => {
        SecondarySupabase.syncAll(Store.clients(), Store.loans(), Store.payments());
      }, 2000);
    }
  },
  clients: () => Store.get('clients'),
  loans: () => Store.get('loans'),
  payments: () => Store.get('payments'),
  // [NEW] Recycle Bin
  recycleBin: () => Store.get('recycleBin'),
  settings: () => Store.getObj('settings'),
  session: () => Store.getObj('session'),
  saveClients: v => {
    if (!isPlanActive() && v.length > 20) {
      const existing = Store.get('clients') || [];
      if (v.length > existing.length && existing.length >= 20) {
        return; // Absolute firewall: do not allow saving more than the limit on free tier
      }
    }
    Store.set('clients', v);
  },
  saveLoans: v => Store.set('loans', v),
  savePayments: v => Store.set('payments', v),
  saveRecycleBin: v => Store.set('recycleBin', v),
  // [NEW] Recycle Bin
  saveSettings: v => Store.set('settings', v),
  saveSession: v => Store.set('session', v),
};

// ── TOAST ──────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
  const el = document.createElement('div');
  el.className = `kf-toast ${type}`;
  el.innerHTML = `<i class="fa-solid ${icons[type]}"></i><span>${msg}</span>`;
  $('#toast-container').appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

// ── THEME & LANG ──────────────────────────────────────────────
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  const icon = $('#theme-icon');
  // [FIX] Language change: Ensure icon doesn't change
  if (icon) icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

function applyLang(lang) {
  state.lang = lang;
  if (lang === 'ta') {
    document.body.classList.add('tamil-text');
  } else {
    document.body.classList.remove('tamil-text');
  }
  // [FIX] Language change: Only text language should change
  translateDOM();
}

function translateDOM() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const dict = T[state.lang] || T.en;
    let val = dict[key];
    if (val === undefined) val = T.en[key];
    if (val !== undefined) {
      el.textContent = val;
    }
  });
}

// ── AUTH ──────────────────────────────────────────────────────

// ── LOCAL AUTH HELPERS (offline fallback) ─────────────────────
const LOCAL_USERS_KEY = 'kf_local_users';

function getLocalUsers() {
  try { return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY)) || []; } catch { return []; }
}

function saveLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

// Simple hash for local-only password storage (not meant for production security,
// but sufficient for an offline-first localStorage app)
async function simpleHash(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function localRegister(payload) {
  const { email, password, financier_name, business_name } = payload;
  if (!email || !password) return { success: false, error: 'Email and password required' };

  const users = getLocalUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'Email already registered' };
  }

  const pwHash = await simpleHash(password);
  const newUser = {
    id: Date.now(),
    email,
    passwordHash: pwHash,
    financierName: financier_name || '',
    businessName: business_name || '',
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  saveLocalUsers(users);

  return {
    success: true,
    token: 'local-session:' + encodeURIComponent(newUser.email) + ':' + Date.now(),
    user: {
      email: newUser.email,
      name: newUser.financierName,
      financierName: newUser.financierName,
      businessName: newUser.businessName
    }
  };
}

async function localLogin(payload) {
  const { email, password } = payload;
  if (!email || !password) return { success: false, error: 'Email and password required' };

  const users = getLocalUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { success: false, error: 'No account found with this email. Please register first.' };

  const pwHash = await simpleHash(password);
  if (pwHash !== user.passwordHash) return { success: false, error: 'Invalid password' };

  return {
    success: true,
    token: 'local-session:' + encodeURIComponent(user.email) + ':' + Date.now(),
    user: {
      email: user.email,
      name: user.financierName,
      financierName: user.financierName,
      businessName: user.businessName
    }
  };
}

async function apiAuth(endpoint, payload) {
  try {
    const url = `${API_BASE}/${endpoint}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    // If backend registration/login succeeds, also save locally for future offline use
    if (data.success && (endpoint === 'register' || endpoint === 'login')) {
      const users = getLocalUsers();
      const exists = users.find(u => u.email.toLowerCase() === payload.email.toLowerCase());
      if (!exists) {
        const pwHash = await simpleHash(payload.password);
        users.push({
          id: Date.now(),
          email: payload.email,
          passwordHash: pwHash,
          financierName: payload.financier_name || data.user?.name || '',
          businessName: payload.business_name || '',
          createdAt: new Date().toISOString()
        });
        saveLocalUsers(users);
      }
    }
    return data;
  } catch (e) {
    // Backend offline — use local authentication fallback
    if (endpoint === 'register') {
      return await localRegister(payload);
    } else if (endpoint === 'login') {
      return await localLogin(payload);
    }
    return { success: false, offline: true, message: 'Backend offline. Using offline mode.' };
  }
}

// ── USER DATA ISOLATION ──────────────────────────────────────
// All localStorage keys that belong to a specific user.
const USER_SCOPED_LS_KEYS = [
  'kf_settings', 'kf_clients', 'kf_loans', 'kf_payments',
  'kf_recycle_bin', 'kf_notifications', 'kf_subscription',
  'kf_last_sync', 'kf_backup_data'
];

/**
 * Wipes all user-scoped data from localStorage.
 * Called when a different user logs in to prevent data crossover.
 */
function clearAllUserData() {
  USER_SCOPED_LS_KEYS.forEach(k => localStorage.removeItem(k));
  // Also clear dynamic per-user subscription keys
  const toRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k.startsWith('kf_subscription_') || k.startsWith('kf_backup_'))) {
      toRemove.push(k);
    }
  }
  toRemove.forEach(k => localStorage.removeItem(k));
}

/**
 * Saves a session, enforcing strict isolation.
 * If the incoming email differs from the stored session email,
 * all previous user data is wiped before the new session is written.
 */
function saveSessionIsolated(token, user) {
  const incomingEmail = (user?.email || '').toLowerCase();
  let existingEmail = '';
  try {
    const existing = JSON.parse(localStorage.getItem('kf_session') || '{}');
    existingEmail = (existing?.user?.email || '').toLowerCase();
  } catch { /* ignore */ }

  if (existingEmail && incomingEmail && existingEmail !== incomingEmail) {
    // Different user — wipe all previous user data before saving new session
    clearAllUserData();
  }
  localStorage.setItem('kf_session', JSON.stringify({ token, user }));
}

// Google Sign-In is initialized via HTML (g_id_onload) and handled by handleGoogleLogin below

// Google Login Callback
window.handleGoogleLogin = async function(response) {
  // Remove loading state from buttons
  const btns = document.querySelectorAll('.btn-google-signin');
  btns.forEach(b => b.classList.remove('loading'));

  // Decode the JWT credential to extract user info
  let googleUser = {};
  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    googleUser = {
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture || '',
      sub: payload.sub
    };
  } catch (e) {
    googleUser = { email: 'google-user@gmail.com', name: 'Google User' };
  }

  // Try backend first
  const res = await apiAuth('google', { token: response.credential });

  if (res.success) {
    const token = res.token || ('google-session:' + encodeURIComponent(res.user?.email || googleUser.email) + ':' + Date.now());
    saveSessionIsolated(token, res.user);
    const s = Store.settings();
    if (res.user?.name && !s.financierName) { s.financierName = res.user.name; Store.saveSettings(s); }
    if (res.user?.appPin) { s.appPin = res.user.appPin; Store.saveSettings(s); }
    state.session = getSession();
    
    // Crucial: Restore from cloud BEFORE checking PIN
    // so we don't overwrite data for an existing user logging into a new device
    if (window.KFSync) await KFSync.restore();
    if (hasPin()) { showPinLock(); } else { showPinSetup(); }
  } else if (res.offline) {
    // Backend offline — create local session from Google credential
    const user = {
      email: googleUser.email,
      name: googleUser.name,
      financierName: googleUser.name,
      picture: googleUser.picture
    };
    saveSessionIsolated('google-session:' + encodeURIComponent(user.email) + ':' + Date.now(), user);
    // Save to local users list for consistency
    const users = getLocalUsers();
    if (!users.find(u => u.email.toLowerCase() === googleUser.email.toLowerCase())) {
      users.push({
        id: Date.now(),
        email: googleUser.email,
        passwordHash: '', // Google users don't have passwords
        financierName: googleUser.name,
        businessName: '',
        googleAuth: true,
        createdAt: new Date().toISOString()
      });
      saveLocalUsers(users);
    }
    const s = Store.settings();
    if (!s.financierName) { s.financierName = googleUser.name; Store.saveSettings(s); }
    state.session = getSession();
    
    // Crucial: Restore from cloud BEFORE checking PIN
    if (window.KFSync) await KFSync.restore();
    
    if (hasPin()) { showPinLock(); } else { showPinSetup(); }
  } else {
    const errEl = $('#login-error');
    if (errEl) {
      errEl.textContent = res.error || 'Google login failed';
      errEl.classList.remove('d-none');
    }
  }
};

function getSession() {
  return Store.session();
}

function isLoggedIn() {
  const s = getSession();
  return !!(s && s.token);
}

function hasPin() {
  const s = Store.settings();
  return !!(s && s.appPin && s.appPin.length === 4);
}

function getPin() {
  const s = Store.settings();
  return s.appPin || null;
}

async function logout() {
  try {
    const session = getSession();
    const token = session?.token;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers
    });
  } catch (e) {
    console.warn("Failed to clear backend session cookies:", e);
  }

  localStorage.removeItem(LS.session);
  localStorage.removeItem(LS.clients);
  localStorage.removeItem(LS.loans);
  localStorage.removeItem(LS.payments);
  localStorage.removeItem(LS.settings);
  localStorage.removeItem(LS.recycleBin);
  clearAllUserData();
  state.session = null;
  showAuth();
}

// ── INIT ──────────────────────────────────────────────────────
function init() {
  // Check if token and email are in query parameters (from magic link redirect)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('token')) {
    const token = urlParams.get('token');
    const email = urlParams.get('email') || '';
    const user = { email: email, name: email.split('@')[0] };
    saveSessionIsolated(token, user);
    // Clean query parameters from URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  const settings = Store.settings();
  applyTheme(settings.theme || 'light');
  applyLang(settings.lang || 'en');

  // ── Register Service Worker for notification action buttons ──
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(() => {
        // Listen for messages from SW (Paid / Pending button taps)
        navigator.serviceWorker.addEventListener('message', e => {
          const msg = e.data || {};
          if      (msg.type === 'NOTIF_MARK_PAID')       handleNotifMarkPaid(msg.loanId, msg.emi);
          else if (msg.type === 'NOTIF_MARK_PENDING')    handleNotifMarkPending(msg.loanId);
          else if (msg.type === 'NOTIF_OPEN_COLLECTION') navigateTo('collection');
        });
      })
      .catch(() => {}); // non-critical
  }

  if (isLoggedIn()) {
    state.session = getSession();
    if (hasPin()) {
      showPinLock();
    } else {
      showPinSetup();
    }
  } else {
    showAuth();
  }

  bindGlobal();
  scheduleNotifications();
}

// ── Notification action: ✅ Paid ──────────────────────────────
function handleNotifMarkPaid(loanId, emiAmount) {
  if (!loanId) return;
  const loan = Store.loans().find(l => l.id === loanId);
  if (!loan) { showToast('Loan not found', 'error'); return; }
  const stats   = calcLoanStats(loan);
  const amount  = emiAmount || stats.emi;
  const payment = {
    id: uid(), loanId, amount, date: today(),
    note: 'Paid via notification', createdAt: new Date().toISOString()
  };
  const payments = Store.payments();
  payments.push(payment);
  Store.savePayments(payments);
  // Auto-complete if fully paid
  if (stats.remaining - amount <= 0) {
    const loans = Store.loans();
    const idx   = loans.findIndex(l => l.id === loanId);
    if (idx !== -1) { loans[idx].status = 'completed'; Store.saveLoans(loans); }
  }
  updateNotifBadge();
  showToast(`✅ ₹${amount} recorded as Paid!`, 'success');
  navigateTo('collection');
}

// ── Notification action: ⏳ Pending ───────────────────────────
function handleNotifMarkPending(loanId) {
  showToast('⏳ Marked as Pending. Reminder will stay active.', 'info');
  navigateTo('collection');
}


function showFormSection(selector) {
  const sections = $$('#auth-slide-2 .auth-form-section');
  sections.forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const target = $(selector);
  if (target) {
    target.classList.add('active');
    target.style.display = 'block';
  }
}

function updateAuthHeader(title, subtitle) {
  const tEl = $('#step-2-title');
  const sEl = $('#step-2-subtitle');
  if (tEl) tEl.textContent = title;
  if (sEl) sEl.textContent = subtitle;
}

function showAuth() {
  $('#loading-screen').style.display = 'none';
  $('#auth-screen').style.display = '';
  $('#pin-lock-screen').style.display = 'none';
  $('#main-app').style.display = 'none';
  
  const aiText = document.getElementById('ai-typing-text');
  if (aiText && !aiText.dataset.typingStarted) {
    aiText.dataset.typingStarted = 'true';
    typeAIOrbText();
  }
  
  // Slide back to Step 1 (Welcome Screen)
  const slider = $('#auth-slider-container');
  if (slider) slider.classList.remove('slide-to-step-2');
  
  // Show default email login section in Step 2
  showFormSection('#login-form-wrapper');
  updateAuthHeader('Log in or sign up', 'Manage loans, collections and customer payments smarter with SamKass.');
}

function showPinSetup() {
  $('#loading-screen').style.display = 'none';
  $('#auth-screen').style.display = '';
  $('#pin-lock-screen').style.display = 'none';
  $('#main-app').style.display = 'none';
  
  // Slide to Step 2
  const slider = $('#auth-slider-container');
  if (slider) slider.classList.add('slide-to-step-2');
  
  // Show PIN Setup form section
  showFormSection('#pin-setup-wrapper');
  updateAuthHeader('Set Security PIN', 'Create a 4-digit PIN to protect your app');
  
  // Clear & focus first digit
  const inputs = $$('#pin-setup-inputs .pin-digit-input');
  inputs.forEach(i => { i.value = ''; i.classList.remove('shake', 'success'); });
  if (inputs[0]) inputs[0].focus();
  const errEl = $('#pin-setup-error');
  if (errEl) errEl.classList.add('d-none');
}

function showPinLock() {
  $('#loading-screen').style.display = 'none';
  $('#auth-screen').style.display = 'none';
  $('#pin-lock-screen').style.display = '';
  $('#main-app').style.display = 'none';
  // Populate user info
  const session = getSession();
  const user = session?.user;
  if (user) {
    const name = user.financierName || user.email || 'User';
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const avatarEl = $('#pin-lock-avatar');
    if (avatarEl) avatarEl.innerHTML = initials || '<i class="fa-solid fa-user"></i>';
    const nameEl = $('#pin-lock-name');
    if (nameEl) nameEl.textContent = 'Welcome, ' + (user.financierName || 'User');
    const emailEl = $('#pin-lock-email');
    if (emailEl) emailEl.textContent = user.email || '';
  }
  // Clear & focus first digit
  const inputs = $$('#pin-lock-inputs .pin-digit-input');
  inputs.forEach(i => { i.value = ''; i.classList.remove('shake', 'success'); });
  if (inputs[0]) inputs[0].focus();
  const errEl = $('#pin-lock-error');
  if (errEl) errEl.classList.add('d-none');
}

async function showApp() {
  $('#loading-screen').style.display = 'none';
  $('#auth-screen').style.display = 'none';
  $('#pin-lock-screen').style.display = 'none';
  $('#main-app').style.display = '';
  updatePlanBanner();
  checkAccessControl();
  
  // Render immediately with local data for zero-delay UX
  navigateTo(state.page || 'dashboard');
  
  // Asynchronously query the backend subscription status
  if (window.RazorpayPayment) {
    window.RazorpayPayment.checkSubscriptionStatus().then(status => {
      if (status && status.active) {
        const settings = Store.settings();
        const oldPlan = settings.plan;
        settings.plan = status.plan_type;
        settings.paymentDate = status.end_date ? new Date(new Date(status.end_date).getTime() - (status.plan_type === 'yearly' ? 365 : status.plan_type === 'quarterly' ? 90 : 30) * 24 * 60 * 60 * 1000).toISOString() : new Date().toISOString();
        Store.saveSettings(settings);
        
        // Update subscription manager local state
        if (window.KFSubscription) {
          window.KFSubscription.syncFromSettings();
        }
        
        if (oldPlan !== status.plan_type) {
          updatePlanBanner();
          if (state.page === 'settings') {
            navigateTo('settings');
          }
        }
      }
    }).catch(e => console.warn("Failed to check subscription status:", e));
  }
  
  // Seamlessly sync with cloud in the background and soft-refresh if needed
  if (window.KFSync) {
    KFSync.restore().then(() => {
      navigateTo(state.page || 'dashboard');
    });
  }
  
  // Fire today's payment notifications when app becomes visible
  fireTodayNotifications();
}

// ── NAVIGATION ────────────────────────────────────────────────
function navigateTo(page) {
  checkAccessControl();
  state.page = page;
  $$('.nav-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.page === page);
  });
  const content = $('#page-content');
  content.innerHTML = '';
  destroyCharts();

  const pages = {
    dashboard: renderDashboard,
    clients:   renderClients,
    loans:     renderLoans,
    collection: renderCollection,
    reports:   renderReports,
    profile:   renderProfile,
    settings:  renderSettings,
  };
  if (pages[page]) pages[page](content);
}

function destroyCharts() {
  Object.values(state.charts).forEach(c => { try { c.destroy(); } catch {} });
  state.charts = {};
}

// ── PLAN LOGIC ────────────────────────────────────────────────
function getPlan() {
  const s = Store.settings();
  return s.plan || 'free';
}

function getPlanExpiryTime() {
  const s = Store.settings();
  if (!s.paymentDate || !s.plan || s.plan === 'free') return 0;
  
  const paymentTime = new Date(s.paymentDate).getTime();
  let durationMs = 0;
  if (s.plan === 'monthly') {
    durationMs = 30 * 24 * 60 * 60 * 1000;
  } else if (s.plan === 'quarterly') {
    durationMs = 90 * 24 * 60 * 60 * 1000;
  } else if (s.plan === 'yearly') {
    durationMs = 365 * 24 * 60 * 60 * 1000;
  }
  return paymentTime + durationMs;
}

function getPlanExpiry() {
  const expiryTime = getPlanExpiryTime();
  if (expiryTime === 0) return null;
  return new Date(expiryTime).toISOString().split('T')[0];
}

function isPlanActive() {
  const plan = getPlan();
  if (plan === 'free') return false;
  const expiryTime = getPlanExpiryTime();
  return Date.now() < expiryTime;
}

function canAddClient() {
  if (isPlanActive()) return true;
  return Store.clients().length < 20;
}

// Checks if the user is allowed to add secondary data like Loans
function canUsePremiumFeatures() {
  if (isPlanActive()) return true;
  return Store.clients().length <= 20;
}

function showBlockingPopup() {
  const modalEl = document.getElementById('blockingUpgradeModal');
  if (!modalEl) return;
  let modalInstance = bootstrap.Modal.getInstance(modalEl);
  if (!modalInstance) {
    modalInstance = new bootstrap.Modal(modalEl, {
      backdrop: 'static',
      keyboard: false
    });
  }
  modalInstance.show();
}

function hideBlockingPopup() {
  const modalEl = document.getElementById('blockingUpgradeModal');
  if (!modalEl) return;
  const modalInstance = bootstrap.Modal.getInstance(modalEl);
  if (modalInstance) {
    modalInstance.hide();
  }
}

function checkAccessControl() {
  if (!isLoggedIn()) return;
  const clientCount = Store.clients().length;
  if (clientCount > 20 && !isPlanActive()) {
    showBlockingPopup();
  } else {
    hideBlockingPopup();
  }
}


function updatePlanBanner() {
  // Banner removed per user request. Hard-block modal handles expiration entirely.
}

window.KF = window.KF || {};
window.KF.upgradePro = function(planType) {
  initiatePlanPayment(planType);
};

// ── SAMPLE DATA ───────────────────────────────────────────────
function generateSampleData() {
  if (Store.clients().length > 0) return;
  const clients = [
    { id: 'c1', name: 'Rajesh Kumar', phone: '9876543210', address: 'Connaught Place, Delhi', idNum: 'ABCDE1234F', occupation: 'Trader', createdAt: '2024-01-15' },
    { id: 'c2', name: 'Priya Singh', phone: '9845012345', address: 'Andheri, Mumbai', idNum: '', occupation: 'Shop Owner', createdAt: '2024-02-01' },
    { id: 'c3', name: 'Mohammed Ali', phone: '9787654321', address: 'Kothrud, Pune', idNum: 'QWERT5678G', occupation: 'Teacher', createdAt: '2024-02-20' },
    { id: 'c4', name: 'Sneha Patel', phone: '9765432109', address: 'Navrangpura, Ahmedabad', idNum: '', occupation: 'Tailor', createdAt: '2024-03-05' },
    { id: 'c5', name: 'Amit Sharma', phone: '9843210987', address: 'Bandra, Mumbai', idNum: 'ZXCVB9012H', occupation: 'Driver', createdAt: '2024-03-18' },
    { id: 'c6', name: 'Lakshmi Narayanan', phone: '9812345670', address: 'T Nagar, Chennai', idNum: '', occupation: 'IT Professional', createdAt: '2024-03-20' },
    { id: 'c7', name: 'Vikram Reddy', phone: '9823456701', address: 'Banjara Hills, Hyderabad', idNum: 'DFGHI2345J', occupation: 'Carpenter', createdAt: '2024-03-21' },
    { id: 'c8', name: 'Pooja Desai', phone: '9834567012', address: 'Salt Lake, Kolkata', idNum: '', occupation: 'Nurse', createdAt: '2024-03-22' },
    { id: 'c9', name: 'Sanjay Gupta', phone: '9845670123', address: 'MG Road, Bangalore', idNum: 'JKLMN3456K', occupation: 'Mechanic', createdAt: '2024-03-23' },
    { id: 'c10', name: 'Anita Bose', phone: '9856701234', address: 'Fort, Mumbai', idNum: '', occupation: 'Chef', createdAt: '2024-03-24' },
    { id: 'c11', name: 'Rahul Verma', phone: '9867012345', address: 'Indiranagar, Bangalore', idNum: 'PQRST4567L', occupation: 'Plumber', createdAt: '2024-03-25' },
    { id: 'c12', name: 'Kavita Iyer', phone: '9870123456', address: 'Mylapore, Chennai', idNum: '', occupation: 'Electrician', createdAt: '2024-03-26' },
    { id: 'c13', name: 'John Fernandez', phone: '9801234567', address: 'Panjim, Goa', idNum: 'UVWXY5678M', occupation: 'Manager', createdAt: '2024-03-27' },
    { id: 'c14', name: 'Meera Chopra', phone: '9812345098', address: 'Karol Bagh, Delhi', idNum: '', occupation: 'Artist', createdAt: '2024-03-28' },
    { id: 'c15', name: 'Deepak Saxena', phone: '9823456109', address: 'Gomti Nagar, Lucknow', idNum: 'ZABCD6789N', occupation: 'Receptionist', createdAt: '2024-03-29' },
    { id: 'c16', name: 'Swati Kapoor', phone: '9834567210', address: 'Vasant Kunj, Delhi', idNum: '', occupation: 'Security Guard', createdAt: '2024-03-30' },
    { id: 'c17', name: 'Anil Thakur', phone: '9845678321', address: 'Colaba, Mumbai', idNum: 'EFGHI7890O', occupation: 'Sales Executive', createdAt: '2024-03-31' },
    { id: 'c18', name: 'Divya Bhatia', phone: '9856789432', address: 'Saket, Delhi', idNum: '', occupation: 'Photographer', createdAt: '2024-04-01' },
  ];

  const td = today();
  // Dynamically generate 18 loans (one for each client)
  const loans = clients.map((c, i) => {
    const principal = [10000, 25000, 50000, 100000][i % 4];
    const interestRate = [1.5, 2, 2.5, 3][i % 4];
    const duration = [6, 10, 12, 24][i % 4];
    const type = i % 2 === 0 ? 'weekly' : 'monthly';
    const interestType = 'percentage';
    
    // Spread start dates over the last few months
    const start = new Date();
    start.setMonth(start.getMonth() - (i % 5));
    start.setDate(start.getDate() - (i * 2));
    const startDate = start.toISOString().split('T')[0];

    return {
      id: `l${i + 1}`,
      clientId: c.id,
      principal,
      interestRate,
      interestType,
      duration,
      type,
      startDate,
      status: 'active',
      createdAt: startDate
    };
  });

  // Generate exactly 18 collections (1 payment per loan) with different dates and modes
  const payments = [];
  loans.forEach((loan, li) => {
    const monthlyInterest = calcMonthlyInterest(loan.principal, loan.interestRate, loan.interestType);
    const totalPayable = loan.principal + (monthlyInterest * loan.duration);
    const installments = loan.type === 'weekly' ? loan.duration * 4 : loan.duration;
    const emi = +(totalPayable / installments).toFixed(2);
    
    const d = new Date(loan.startDate);
    if (loan.type === 'monthly') d.setMonth(d.getMonth() + 1);
    else if (loan.type === 'weekly') d.setDate(d.getDate() + 7);
    
    // Ensure the payment date is not in the future
    const paymentDate = d <= new Date() ? d.toISOString().split('T')[0] : td;

    payments.push({
      id: uid(), loanId: loan.id,
      amount: emi,
      date: paymentDate,
      note: ['Cash', 'UPI', 'Bank Transfer'][li % 3],
      createdAt: paymentDate
    });
  });

  Store.saveClients(clients);
  Store.saveLoans(loans);
  Store.savePayments(payments);
}

// ── EMI CALCULATIONS ──────────────────────────────────────────
function calcMonthlyInterest(principal, rate, interestType) {
  if (!principal || !rate) return 0;
  if (interestType === 'fixed') {
    return (principal / 1000) * (rate * 100);
  } else {
    return principal * (rate / 100);
  }
}

function calcLoanStats(loan) {
  const duration = loan.duration || 0;
  const monthlyInterest = calcMonthlyInterest(loan.principal, loan.interestRate, loan.interestType || 'percentage');
  const totalInterest = monthlyInterest * duration;
  const totalPayable = duration > 0 ? loan.principal + totalInterest : loan.principal;
  
  let emi = 0;
  if (duration > 0) {
    const installments = loan.type === 'weekly' ? duration * 4 : duration;
    emi = +(totalPayable / installments).toFixed(2);
  }
  
  const payments = Store.payments().filter(p => p.loanId === loan.id);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(0, totalPayable - totalPaid);
  const progress = Math.min(100, Math.round((totalPaid / totalPayable) * 100));
  const nextDueDate = calcNextDue(loan, payments);
  const isOverdue = nextDueDate && nextDueDate < today() && loan.status === 'active';
  const daysOverdue = isOverdue ? daysDiff(today(), nextDueDate) : 0;
  return { emi, totalPayable, totalInterest, totalPaid, remaining, progress, nextDueDate, isOverdue, daysOverdue };
}

function calcNextDue(loan, payments = null) {
  if (!loan.duration || loan.duration <= 0) return null;
  if (!payments) payments = Store.payments().filter(p => p.loanId === loan.id);
  const d = new Date(loan.startDate);
  const typeMap = { monthly: 'month', weekly: 'week' };
  const step = typeMap[loan.type] || 'month';
  const totalInstallments = loan.type === 'weekly' ? loan.duration * 4 : loan.duration;
  let installments = 0;
  
  const monthlyInterest = calcMonthlyInterest(loan.principal, loan.interestRate, loan.interestType || 'percentage');
  const totalPayable = loan.principal + (monthlyInterest * loan.duration);
  const emi = +(totalPayable / totalInstallments).toFixed(2);
  
  while (installments < totalInstallments) {
    if (step === 'month') d.setMonth(d.getMonth() + 1);
    else if (step === 'week') d.setDate(d.getDate() + 7);
    installments++;
    const due = d.toISOString().split('T')[0];
    const paid = payments.filter(p => p.date === due).reduce((s, p) => s + p.amount, 0);
    if (paid < emi * 0.9) return due;
  }
  return null;
}

// ── DASHBOARD ─────────────────────────────────────────────────
function renderDashboard(container) {
  const clients = Store.clients();
  const loans = Store.loans();
  const payments = Store.payments();

  const totalLoanGiven = loans.reduce((s, l) => s + l.principal, 0);
  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
  const totalPayable = loans.reduce((s, l) => s + calcLoanStats(l).totalPayable, 0);
  const pending = Math.max(0, totalPayable - totalCollected);

  const todayStr = today();
  const dueToday = loans.filter(l => l.status === 'active').map(l => {
    const stats = calcLoanStats(l);
    const client = clients.find(c => c.id === l.clientId);
    return { loan: l, stats, client };
  }).filter(({ stats }) => stats.nextDueDate <= todayStr && stats.remaining > 0);

  const recentPayments = [...payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  container.innerHTML = `
    <div class="page-section" data-ocid="dashboard.page">
      <div class="kpi-grid stagger-children">
        <div class="kpi-card" data-ocid="dashboard.total_clients_card">
          <div class="kpi-label">${t('totalClients')}</div>
          <div class="kpi-value">${clients.length}</div>
          <i class="fa-solid fa-users kpi-icon"></i>
        </div>
        <div class="kpi-card" data-ocid="dashboard.loan_given_card">
          <div class="kpi-label">${t('loanGiven')}</div>
          <div class="kpi-value">${fmtCur(totalLoanGiven)}</div>
          <i class="fa-solid fa-money-bill kpi-icon"></i>
        </div>
        <div class="kpi-card success" data-ocid="dashboard.collected_card">
          <div class="kpi-label">${t('collected')}</div>
          <div class="kpi-value">${fmtCur(totalCollected)}</div>
          <i class="fa-solid fa-circle-check kpi-icon"></i>
        </div>
        <div class="kpi-card danger" data-ocid="dashboard.pending_card">
          <div class="kpi-label">${t('pending')}</div>
          <div class="kpi-value">${fmtCur(pending)}</div>
          <i class="fa-solid fa-clock kpi-icon"></i>
        </div>
      </div>

      <div class="kf-card" data-ocid="dashboard.due_today_card">
        <div class="section-title"><i class="fa-solid fa-calendar-day"></i>${t('dueToday')} (${dueToday.length})</div>
        <div class="stagger-children">${dueToday.length === 0
          ? `<p class="text-muted-kf" style="font-size:.875rem;margin:0">${t('noDueToday')}</p>`
          : dueToday.slice(0, 6).map(({ loan, stats, client }, i) => `
            <div class="due-today-item" data-ocid="dashboard.due_today.item.${i + 1}">
              <div>
                <div class="due-today-name">${client ? client.name : 'Unknown'}</div>
                <div class="due-today-meta">${t(loan.type)} EMI · ${stats.isOverdue ? `<span style="color:var(--color-danger)">${stats.daysOverdue}d overdue</span>` : 'Due today'}</div>
              </div>
              <div class="due-today-amount">${fmtCur(stats.emi)}</div>
            </div>`).join('')
        }
        </div></div>

      <div class="kf-card" data-ocid="dashboard.monthly_chart_card">
        <div class="section-title"><i class="fa-solid fa-chart-bar"></i>${t('monthlyCollection')}</div>
        <div class="chart-wrapper">
          <canvas id="dash-chart" class="chart-canvas"></canvas>
        </div>
      </div>

      <div class="kf-card" data-ocid="dashboard.recent_payments_card">
        <div class="section-title"><i class="fa-solid fa-receipt"></i>${t('recentPayments')}</div>
        <div class="stagger-children">${recentPayments.length === 0
          ? `<p class="text-muted-kf" style="font-size:.875rem;margin:0">${t('noPayments')}</p>`
          : recentPayments.map((p, i) => {
              const loan = loans.find(l => l.id === p.loanId);
              const client = loan ? clients.find(c => c.id === loan.clientId) : null;
              return `<div class="payment-row" data-ocid="dashboard.payment.item.${i + 1}">
                <div>
                  <div style="font-weight:700">${client ? client.name : 'Unknown'}</div>
                  <div class="payment-row-date">${fmtDate(p.date)}${p.note ? ' · ' + p.note : ''}</div>
                </div>
                <div class="payment-row-amount">${fmtCur(p.amount)}</div>
              </div>`;
            }).join('')
        }
        </div></div>
    </div>`;

  renderMonthlyChart('dash-chart', payments);
}

function renderMonthlyChart(canvasId, payments) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const months = [];
  const amounts = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en-IN', { month: 'short' });
    months.push(label);
    const total = payments.filter(p => p.date && p.date.startsWith(key)).reduce((s, p) => s + p.amount, 0);
    amounts.push(total);
  }
  const isDark = state.theme === 'dark';
  const chartColor = '#f59e0b';
  if (state.charts[canvasId]) { try { state.charts[canvasId].destroy(); } catch {} }
  const ctx = canvas.getContext('2d');
  let gradient = chartColor + 'cc';
  if(ctx) {
    gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.9)');
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0.1)');
  }
  state.charts[canvasId] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{ label: 'Collections', data: amounts, backgroundColor: gradient, hoverBackgroundColor: '#fbbf24', borderColor: 'rgba(245, 158, 11, 1)', borderWidth: 1, borderRadius: 8, barThickness: 'flex', maxBarThickness: 45 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: '#f59e0b',
          bodyColor: isDark ? '#f8fafc' : '#0f172a',
          titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13 },
          bodyFont: { family: "'Space Grotesk', sans-serif", size: 15, weight: 'bold' },
          padding: 12,
          cornerRadius: 12,
          displayColors: false,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderWidth: 1,
          callbacks: { label: v => '₹' + v.parsed.y.toLocaleString('en-IN') }
        }
      },
      scales: {
        x: { grid: { display: false, drawBorder: false }, ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } }, border: { display: false } },
        y: { grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', drawBorder: false, borderDash: [5, 5] }, ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }, callback: v => '₹' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v) }, border: { display: false } }
      },
      animation: {
        y: { duration: 1200, easing: 'easeOutQuart' }
      }
    }
  });
}

// ── CLIENTS PAGE ──────────────────────────────────────────────
function renderClients(container) {
  const clients = Store.clients();
  const loans = Store.loans();

  const plan = getPlan();
  const isFree = plan === 'free' || !isPlanActive();
  const clientsCount = clients.length;
  const s = Store.settings();
  const limit = FREE_CLIENT_LIMIT + (s.extraClients || 0);
  
  const usageIndicator = isFree ? `<div style="font-size: 0.85rem; color: ${clientsCount >= limit ? 'var(--kf-danger)' : 'var(--kf-text-muted)'}; font-weight: 600; margin-top: 4px;"><i class="fa-solid fa-chart-pie me-1"></i>${clientsCount} / ${limit} Trial Clients Used</div>` : '';

  container.innerHTML = `
    <div class="page-section" data-ocid="clients.page">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div>
          <div class="page-title mb-0"><i class="fa-solid fa-users"></i>${t('clients')}</div>
          ${usageIndicator}
        </div>
        <button class="btn-kf-primary mt-1" id="btn-add-client" data-ocid="clients.add_button" style="white-space: nowrap;">
          <i class="fa-solid fa-plus me-1"></i>${t('addClient')}
        </button>
      </div>
      <div class="search-bar-wrapper">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="search" class="search-input" id="client-search" placeholder="${t('searchClients')}" value="${state.clientSearch}" data-ocid="clients.search_input" />
      </div>
      <div id="clients-list" class="stagger-children"></div>
    </div>`;

  renderClientsList(clients, loans);

  $('#btn-add-client').addEventListener('click', () => {
    if (!canAddClient()) {
      bootstrap.Modal.getOrCreateInstance($('#upgradeModal')).show();
    } else {
      openClientModal();
    }
  });
  $('#client-search').addEventListener('input', e => {
    state.clientSearch = e.target.value;
    renderClientsList(Store.clients(), Store.loans());
  });
}

function renderClientsList(clients, loans) {
  const listEl = $('#clients-list');
  if (!listEl) return;
  const q = state.clientSearch.toLowerCase();
  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(q) || c.phone.includes(q)
  );
  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="empty-state" data-ocid="clients.empty_state">
      <div class="empty-state-icon"><i class="fa-solid fa-users"></i></div>
      <h3>${t('noClients')}</h3>
      <p>${t('addFirstClient')}</p>
    </div>`;
    return;
  }
  listEl.innerHTML = filtered.map((c, i) => {
    const clientLoans = loans.filter(l => l.clientId === c.id);
    const activeLoans = clientLoans.filter(l => l.status === 'active').length;
    const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return `<div class="client-card" data-ocid="clients.item.${i + 1}" data-id="${c.id}">
      <div class="client-avatar">${initials}</div>
      <div class="client-info min-w-0">
        <div class="client-name">${c.name}</div>
        <div class="client-meta">
          <span><i class="fa-solid fa-phone" style="font-size:.7rem"></i> ${c.phone}</span>
          <span>${activeLoans} active loan${activeLoans !== 1 ? 's' : ''}</span>
        </div>
      </div>
      <div class="client-actions">
        <button class="btn-icon primary" data-action="view" data-id="${c.id}" aria-label="View profile" data-ocid="clients.view_button.${i + 1}"><i class="fa-solid fa-eye"></i></button>
        <button class="btn-icon" data-action="download" data-id="${c.id}" aria-label="Download" data-ocid="clients.download_button.${i + 1}"><i class="fa-solid fa-download"></i></button>
        <button class="btn-icon" data-action="edit" data-id="${c.id}" aria-label="Edit" data-ocid="clients.edit_button.${i + 1}"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-icon danger" data-action="delete" data-id="${c.id}" aria-label="Delete" data-ocid="clients.delete_button.${i + 1}"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`;
  }).join('');

  listEl.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === 'download') downloadClientDetailsPDF(id); // [NEW] Client Section Download Option
    if (btn.dataset.action === 'view') openClientProfile(id);
    if (btn.dataset.action === 'edit') openClientModal(id);
    if (btn.dataset.action === 'delete') confirmDelete('client', id);
  });
}

function openClientModal(id = null) {
  const modal = new bootstrap.Modal($('#clientModal'));
  const titleEl = $('#clientModalLabel');
  titleEl.textContent = id ? t('editClient') : t('addClient');
  $('#client-edit-id').value = id || '';
  if (id) {
    const c = Store.clients().find(x => x.id === id);
    if (c) {
      $('#client-name').value = c.name;
      $('#client-phone').value = c.phone;
      $('#client-address').value = c.address || '';
      $('#client-id-num').value = c.idNum || '';
      $('#client-occupation').value = c.occupation || '';
    }
  } else {
    $('#client-form').reset();
  }
  modal.show();
}

// [NEW] Client Section Download Option: Open client profile and add download button
function openClientProfile(clientId) {
  state.profileClientId = clientId;
  const c = Store.clients().find(x => x.id === clientId);
  if (!c) return;
  const clientLoans = Store.loans().filter(l => l.clientId === clientId);
  const payments = Store.payments();
  $('#clientProfileName').textContent = c.name;
  // [NEW] Client Section Download Option: Add download button to client profile modal header
  const body = $('#client-profile-body');
  body.innerHTML = `
    <div class="mb-3">
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="client-avatar" style="width:56px;height:56px;font-size:1.375rem">${c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>
        <div>
          <div style="font-weight:700;font-size:1.0625rem">${c.name}</div>
          <div class="text-muted-kf fs-sm"><i class="fa-solid fa-phone me-1"></i>${c.phone}</div>
          ${c.address ? `<div class="text-muted-kf fs-sm"><i class="fa-solid fa-location-dot me-1"></i>${c.address}</div>` : ''}
        </div>
      </div>
      ${c.occupation ? `<div class="fs-sm text-muted-kf mb-1"><i class="fa-solid fa-briefcase me-1"></i>${c.occupation}</div>` : ''}
      ${c.idNum ? `<div class="fs-sm text-muted-kf"><i class="fa-solid fa-id-card me-1"></i>${c.idNum}</div>` : ''}
    </div>
    <div style="text-align:right; margin-bottom:1rem;">
      <button class="btn-kf-ghost" onclick="downloadClientDetailsPDF('${clientId}')" data-ocid="client.profile.download_button"><i class="fa-solid fa-download me-1"></i>Download Profile</button>
    </div>
    <div class="section-title"><i class="fa-solid fa-money-bill-wave"></i>Loans (${clientLoans.length})</div>
    ${clientLoans.length === 0 ? '<p class="text-muted-kf fs-sm">No loans yet.</p>' : clientLoans.map(l => {
      const stats = calcLoanStats(l);
      return `<div class="loan-card ${stats.isOverdue ? 'overdue' : l.status === 'completed' ? 'completed' : ''}" style="margin-bottom:.625rem">
        <div class="loan-card-header">
          <div>${fmtCur(l.principal)}${l.duration ? ` · ${l.duration}mo` : ''}</div>
          <span class="badge-kf ${stats.isOverdue ? 'badge-overdue' : l.status === 'completed' ? 'badge-completed' : 'badge-active'}">${stats.isOverdue ? 'OVERDUE' : l.status.toUpperCase()}</span>
        </div>
        <div class="loan-card-grid">
          <div class="loan-card-stat"><div class="loan-card-label">EMI</div><div class="loan-card-value">${fmtCur(stats.emi)}</div></div>
          <div class="loan-card-stat"><div class="loan-card-label">Paid</div><div class="loan-card-value">${fmtCur(stats.totalPaid)}</div></div>
          <div class="loan-card-stat"><div class="loan-card-label">Remaining</div><div class="loan-card-value">${fmtCur(stats.remaining)}</div></div>
        </div>
        <div class="kf-progress"><div class="kf-progress-fill ${stats.isOverdue ? 'danger' : ''}" style="width:${stats.progress}%"></div></div>
        <div class="loan-card-actions d-flex flex-wrap gap-2">
          <button class="btn-kf-ghost flex-grow-1" style="font-size:.8rem;min-height:36px;padding:.375rem .75rem" onclick="bootstrap.Modal.getInstance(document.getElementById('clientProfileModal'))?.hide(); setTimeout(() => openLoanInfo('${l.id}'), 300)" data-ocid="client.profile.info_loan">
            <i class="fa-solid fa-circle-info me-1"></i>About
          </button>
          <button class="btn-kf-ghost flex-grow-1" style="font-size:.8rem;min-height:36px;padding:.375rem .75rem" onclick="bootstrap.Modal.getInstance(document.getElementById('clientProfileModal'))?.hide(); setTimeout(() => openLoanModal(null, '${l.id}'), 300)" data-ocid="client.profile.edit_loan">
            <i class="fa-solid fa-pen me-1"></i>Edit
          </button>
          <button class="btn-kf-ghost flex-grow-1" style="font-size:.8rem;min-height:36px;padding:.375rem .75rem" onclick="sendReminder('${l.id}')" title="Send WhatsApp Message">
            <i class="fa-brands fa-whatsapp me-1" style="color:#25D366; font-size:1.1rem;"></i>${t('whatsapp')}
          </button>
        </div>
      </div>`;
    }).join('')}
    ${clientLoans.length > 0 ? `<div class="section-title mt-2"><i class="fa-solid fa-receipt"></i>Recent Payments</div>
      ${payments.filter(p => clientLoans.some(l => l.id === p.loanId)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map(p => `
        <div class="payment-row">
          <div><div style="font-weight:600">${fmtDate(p.date)}</div>${p.note ? `<div class="text-muted-kf fs-xs">${p.note}</div>` : ''}</div>
          <div class="payment-row-amount">${fmtCur(p.amount)}</div>
        </div>`).join('') || '<p class="text-muted-kf fs-sm">No payments yet.</p>'}` : ''}`;

  const modal = new bootstrap.Modal($('#clientProfileModal'));
  modal.show();
}

// ── LOANS PAGE ────────────────────────────────────────────────
function renderLoans(container) {
  const loans = Store.loans();
  const clients = Store.clients();

  container.innerHTML = `
    <div class="page-section" data-ocid="loans.page">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div class="page-title mb-0"><i class="fa-solid fa-money-bill-wave"></i>${t('loans')}</div>
        <button class="btn-kf-primary" id="btn-add-loan" data-ocid="loans.add_button" style="white-space: nowrap;">
          <i class="fa-solid fa-plus me-1"></i>${t('addLoan')}
        </button>
      </div>
      <div class="filter-tabs">
        <button class="filter-tab ${state.loanFilter === 'all' ? 'active' : ''}" data-filter="all" data-ocid="loans.filter.all_tab">${t('all')}</button>
        <button class="filter-tab ${state.loanFilter === 'active' ? 'active' : ''}" data-filter="active" data-ocid="loans.filter.active_tab">${t('active')}</button>
        <button class="filter-tab ${state.loanFilter === 'overdue' ? 'active' : ''}" data-filter="overdue" data-ocid="loans.filter.overdue_tab">${t('overdue')}</button>
        <button class="filter-tab ${state.loanFilter === 'completed' ? 'active' : ''}" data-filter="completed" data-ocid="loans.filter.completed_tab">${t('completed')}</button>
      </div>
      <div id="loans-list" class="stagger-children"></div>
    </div>`;

  renderLoansList(loans, clients);

  $('#btn-add-loan').addEventListener('click', () => {
    if (!canUsePremiumFeatures()) {
      bootstrap.Modal.getOrCreateInstance($('#upgradeModal')).show();
    } else {
      openLoanModal();
    }
  });
  $$('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      state.loanFilter = btn.dataset.filter;
      $$('.filter-tab').forEach(b => b.classList.toggle('active', b.dataset.filter === state.loanFilter));
      renderLoansList(Store.loans(), Store.clients());
    });
  });
}

function renderLoansList(loans, clients) {
  const listEl = $('#loans-list');
  if (!listEl) return;
  let filtered = loans;
  if (state.loanFilter === 'active') filtered = loans.filter(l => l.status === 'active');
  if (state.loanFilter === 'overdue') filtered = loans.filter(l => calcLoanStats(l).isOverdue);
  if (state.loanFilter === 'completed') filtered = loans.filter(l => l.status === 'completed');

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="empty-state" data-ocid="loans.empty_state">
      <div class="empty-state-icon"><i class="fa-solid fa-money-bill-wave"></i></div>
      <h3>${t('noLoans')}</h3>
      <p>Add a loan for any client to track EMIs.</p>
    </div>`;
    return;
  }

  listEl.innerHTML = filtered.map((l, i) => {
    const stats = calcLoanStats(l);
    const client = clients.find(c => c.id === l.clientId);
    const statusClass = stats.isOverdue ? 'overdue' : l.status === 'completed' ? 'completed' : '';
    return `
    <div class="loan-card ${statusClass}" data-ocid="loans.item.${i + 1}">
      <div class="loan-card-header">
        <div class="loan-card-name">${client ? client.name : 'Unknown'}</div>
        <span class="badge-kf ${stats.isOverdue ? 'badge-overdue' : l.status === 'completed' ? 'badge-completed' : 'badge-active'}">
          ${stats.isOverdue ? 'OVERDUE' : l.status.toUpperCase()}
        </span>
      </div>
      <div class="loan-card-grid">
        <div class="loan-card-stat"><div class="loan-card-label">${t('emi')}</div><div class="loan-card-value">${fmtCur(stats.emi)}</div></div>
        <div class="loan-card-stat"><div class="loan-card-label">${t('principal')}</div><div class="loan-card-value">${fmtCur(l.principal)}</div></div>
        <div class="loan-card-stat"><div class="loan-card-label">Paid</div><div class="loan-card-value">${fmtCur(stats.totalPaid)}</div></div>
        <div class="loan-card-stat"><div class="loan-card-label">Remaining</div><div class="loan-card-value">${fmtCur(stats.remaining)}</div></div>
        <div class="loan-card-stat"><div class="loan-card-label">${t('nextDue')}</div><div class="loan-card-value" style="font-size:.8rem">${stats.nextDueDate ? fmtDate(stats.nextDueDate) : '—'}</div></div>
        <div class="loan-card-stat"><div class="loan-card-label">Progress</div><div class="loan-card-value">${stats.progress}%</div></div>
      </div>
      <div class="kf-progress"><div class="kf-progress-fill ${stats.isOverdue ? 'danger' : stats.progress === 100 ? 'success' : ''}" style="width:${stats.progress}%"></div></div>
      <div class="loan-card-actions d-flex flex-wrap gap-2">
        <button class="btn-kf-ghost" style="font-size:.8rem;min-height:36px;padding:.375rem .75rem" data-action="info" data-id="${l.id}"><i class="fa-solid fa-circle-info me-1"></i>About</button>
        <button class="btn-kf-ghost" style="font-size:.8rem;min-height:36px;padding:.375rem .75rem" data-action="edit" data-id="${l.id}" data-ocid="loans.edit_button.${i + 1}"><i class="fa-solid fa-pen me-1"></i>Edit</button>
        <button class="btn-kf-ghost" style="font-size:.8rem;min-height:36px;padding:.375rem .75rem" data-action="remind" data-id="${l.id}" title="Send WhatsApp Message" aria-label="WhatsApp Message" data-ocid="loans.remind.${i + 1}"><i class="fa-brands fa-whatsapp me-1" style="color:#25D366; font-size:1.1rem;"></i>${t('whatsapp')}</button>
        <button class="btn-icon" data-action="download" data-id="${l.id}" aria-label="Download" data-ocid="loans.download_button.${i + 1}"><i class="fa-solid fa-download"></i></button>
        <button class="btn-icon danger" data-action="delete" data-id="${l.id}" aria-label="Delete" data-ocid="loans.delete_button.${i + 1}"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`;
  }).join('');

  listEl.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === 'info') openLoanInfo(id);
    if (btn.dataset.action === 'remind') sendReminder(id);
    if (btn.dataset.action === 'edit') openLoanModal(null, id);
    if (btn.dataset.action === 'download') downloadLoanDetailsPDF(id);
    if (btn.dataset.action === 'delete') confirmDelete('loan', id);
  });
}

// ── LOAN INFO MODAL ───────────────────────────────────────────
function openLoanInfo(loanId) {
  const loan = Store.loans().find(l => l.id === loanId);
  if (!loan) return;
  const client = Store.clients().find(c => c.id === loan.clientId);
  const stats = calcLoanStats(loan);
  
  let html = `
    <div style="text-align:center; margin-bottom:1.5rem;">
      <div style="width:56px;height:56px;background:var(--gradient-green);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:1.5rem;color:#ffffff;margin-bottom:0.5rem;box-shadow:0 4px 15px var(--green-glow);">
        <i class="fa-solid fa-hand-holding-dollar"></i>
      </div>
      <h4 style="margin-bottom:4px; font-weight:700; font-family:'JetBrains Mono', monospace;">${fmtCur(loan.principal)}</h4>
      <span class="badge-kf ${stats.isOverdue ? 'badge-overdue' : loan.status === 'completed' ? 'badge-completed' : 'badge-active'}">
        ${stats.isOverdue ? 'OVERDUE' : loan.status.toUpperCase()}
      </span>
    </div>

    <div class="kf-card" style="padding:1rem; margin-bottom:1rem; background:rgba(0,0,0,0.02); box-shadow:none;">
      <div class="emi-preview-row"><span>Client</span><strong style="color:var(--color-primary);">${client ? client.name : 'Unknown'}</strong></div>
      <div class="emi-preview-row"><span>Phone</span><strong>${client ? client.phone : 'N/A'}</strong></div>
      <div class="emi-preview-row"><span>Start Date</span><strong>${fmtDate(loan.startDate)}</strong></div>
    </div>

    <div class="kf-card" style="padding:1rem; margin-bottom:1rem; background:rgba(0,0,0,0.02); box-shadow:none;">
      <div class="emi-preview-row"><span>Interest Rate</span><strong>${loan.interestRate}% (${loan.interestType === 'fixed' ? 'Fixed' : 'Percentage'})</strong></div>
      <div class="emi-preview-row"><span>Duration</span><strong>${loan.duration ? loan.duration + ' installments' : 'Open'}</strong></div>
      <div class="emi-preview-row"><span>Collection Type</span><strong style="text-transform:capitalize;">${loan.type}</strong></div>
      <div class="emi-preview-row" style="margin-top:8px; padding-top:8px; border-top:1px dashed var(--color-border-muted);">
        <span style="color:var(--color-text-muted); font-weight:600;">Collection Amount</span>
        <strong style="color:var(--color-primary); font-size:1.1rem;">${fmtCur(stats.emi)}</strong>
      </div>
    </div>

    <div class="kf-card" style="padding:1rem; background:rgba(0,0,0,0.02); box-shadow:none;">
      <div class="emi-preview-row"><span>Total Payable</span><strong>${fmtCur(stats.totalPayable)}</strong></div>
      <div class="emi-preview-row"><span>Total Paid</span><strong style="color:var(--color-success);">${fmtCur(stats.totalPaid)}</strong></div>
      <div class="emi-preview-row"><span>Remaining</span><strong style="color:var(--color-danger);">${fmtCur(stats.remaining)}</strong></div>
      
      <div style="margin-top:12px;">
        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--color-text-muted); margin-bottom:4px; font-weight:600;">
          <span>Progress</span><span>${stats.progress}%</span>
        </div>
        <div class="kf-progress"><div class="kf-progress-fill ${stats.isOverdue ? 'danger' : stats.progress === 100 ? 'success' : ''}" style="width:${stats.progress}%"></div></div>
      </div>
      
      ${stats.nextDueDate && loan.status === 'active' ? `
        <div class="emi-preview-row" style="margin-top:12px; padding-top:12px; border-top:1px dashed var(--color-border-muted);">
          <span>Next Due</span><strong style="${stats.isOverdue ? 'color:var(--color-danger);' : ''}">${fmtDate(stats.nextDueDate)} ${stats.isOverdue ? '(' + stats.daysOverdue + 'd late)' : ''}</strong>
        </div>` : ''}
    </div>
  `;
  
  $('#loan-info-body').innerHTML = html;
  new bootstrap.Modal($('#loanInfoModal')).show();
}

function openLoanModal(clientId = null, loanId = null) {
  const clients = Store.clients();
  const select = $('#loan-client-select');
  select.innerHTML = '<option value="">Select client…</option>' +
    clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  $('#loanModalLabel').textContent = loanId ? t('editLoan') : t('addLoan');
  $('#loan-edit-id').value = loanId || '';
  $('#loan-start-date').value = today();
  $('#emi-preview').classList.add('d-none');

  if (loanId) {
    const l = Store.loans().find(x => x.id === loanId);
    if (l) {
      select.value = l.clientId;
      $('#loan-interest-type').value = l.interestType || 'percentage';
      const label = $('#label-loan-interest');
      if (label) label.innerHTML = (l.interestType === 'fixed' ? 'Fixed Interest Value <span class="text-danger">*</span>' : 'Interest Percentage <span class="text-danger">*</span>');
      $('#loan-principal').value = l.principal;
      $('#loan-interest').value = l.interestRate;
      $('#loan-duration').value = l.duration || '';
      $('#loan-type').value = l.type;
      $('#loan-start-date').value = l.startDate;
      updateEMIPreview();
    }
  } else {
    $('#loan-form').reset();
    $('#loan-interest-type').value = 'percentage';
    const label = $('#label-loan-interest');
    if (label) label.innerHTML = 'Interest Percentage <span class="text-danger">*</span>';
    $('#loan-start-date').value = today();
    if (clientId) select.value = clientId;
  }
  new bootstrap.Modal($('#loanModal')).show();
}

function updateEMIPreview() {
  const p = parseFloat($('#loan-principal').value);
  const r = parseFloat($('#loan-interest').value) || 0;
  const dVal = $('#loan-duration').value;
  const d = dVal ? parseInt(dVal) : 0;
  const type = $('#loan-type').value;
  const intType = $('#loan-interest-type').value || 'percentage';

  if (!p || p <= 0) { 
    $('#emi-preview').classList.add('d-none'); 
    return; 
  }

  const monthlyInterest = calcMonthlyInterest(p, r, intType);
  const weeklyInterest = monthlyInterest / 4;

  if (!d || d <= 0) {
    $('#emi-preview-monthly-interest').textContent = fmtCur(monthlyInterest);
    $('#emi-preview-weekly-interest').textContent = fmtCur(weeklyInterest);
    $('#emi-preview-amount').textContent = '—';
    $('#emi-preview-total').textContent = fmtCur(p);
    $('#emi-preview-remaining').textContent = fmtCur(p);
    $('#emi-preview').classList.remove('d-none');
    return;
  }
  
  const totalInterest = monthlyInterest * d;
  const totalPayable = p + totalInterest;
  const installments = type === 'weekly' ? d * 4 : d;
  const emi = +(totalPayable / installments).toFixed(2);

  $('#emi-preview-monthly-interest').textContent = fmtCur(monthlyInterest);
  $('#emi-preview-weekly-interest').textContent = fmtCur(weeklyInterest);
  $('#emi-preview-amount').textContent = fmtCur(emi);
  $('#emi-preview-total').textContent = fmtCur(totalPayable);
  $('#emi-preview-remaining').textContent = fmtCur(totalPayable);
  const labelEl = $('#emi-preview-collection-label');
  if (labelEl) labelEl.textContent = type === 'weekly' ? 'Weekly EMI' : 'Monthly EMI';

  $('#emi-preview').classList.remove('d-none');
}

// ── COLLECTION PAGE ───────────────────────────────────────────
function renderCollection(container) {
  const loans = Store.loans().filter(l => l.status === 'active');
  const clients = Store.clients();
  const todayStr = today();

  container.innerHTML = `
    <div class="page-section" data-ocid="collection.page">
      <div class="page-title"><i class="fa-solid fa-calendar-check"></i>Daily Collection</div>
      <div class="filter-tabs">
        <button class="filter-tab ${state.collectionFilter === 'all' ? 'active' : ''}" data-filter="all" data-ocid="collection.filter.all_tab">${t('all')}</button>
        <button class="filter-tab ${state.collectionFilter === 'overdue' ? 'active' : ''}" data-filter="overdue" data-ocid="collection.filter.overdue_tab">${t('overdue')}</button>
        <button class="filter-tab ${state.collectionFilter === 'today' ? 'active' : ''}" data-filter="today" data-ocid="collection.filter.today_tab">${t('dueToday')}</button>
      </div>
      <div id="collection-list" class="stagger-children"></div>
    </div>`;

  renderCollectionList(loans, clients, todayStr);

  $$('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      state.collectionFilter = btn.dataset.filter;
      $$('.filter-tab').forEach(b => b.classList.toggle('active', b.dataset.filter === state.collectionFilter));
      renderCollectionList(Store.loans().filter(l => l.status === 'active'), Store.clients(), today());
    });
  });
}

function renderCollectionList(loans, clients, todayStr) {
  const listEl = $('#collection-list');
  if (!listEl) return;
  const items = loans.map(l => {
    const stats = calcLoanStats(l);
    const client = clients.find(c => c.id === l.clientId);
    return { loan: l, stats, client };
  }).filter(({ stats }) => {
    if (state.collectionFilter === 'overdue') return stats.isOverdue;
    if (state.collectionFilter === 'today') return stats.nextDueDate === todayStr;
    return stats.nextDueDate && stats.nextDueDate <= todayStr || stats.isOverdue;
  });

  if (items.length === 0) {
    listEl.innerHTML = `<div class="empty-state" data-ocid="collection.empty_state">
      <div class="empty-state-icon"><i class="fa-solid fa-calendar-check"></i></div>
      <h3>All Clear!</h3>
      <p>No collections due${state.collectionFilter !== 'all' ? ' for this filter' : ' today'}.</p>
    </div>`;
    return;
  }

  listEl.innerHTML = items.map(({ loan, stats, client }, i) => {
    const isOverdue = stats.isOverdue;
    return `
    <div class="collection-item ${isOverdue ? 'overdue' : ''}" data-ocid="collection.item.${i + 1}">
      <div class="collection-item-header">
        <div class="collection-item-name">${client ? client.name : 'Unknown'}</div>
        <span class="badge-kf ${isOverdue ? 'badge-overdue' : 'badge-pending'}">${isOverdue ? `${stats.daysOverdue}d OVERDUE` : 'DUE'}</span>
      </div>
      <div class="collection-item-meta">${client ? client.phone : ''} · ${t(loan.type)} EMI · Next: ${fmtDate(stats.nextDueDate)}</div>
      <div class="collection-item-actions">
        <button class="btn-kf-primary" style="min-height:40px;padding:.375rem 1rem;font-size:.875rem" data-action="collect" data-id="${loan.id}" data-ocid="collection.collect_button.${i + 1}">
          <i class="fa-solid fa-check me-1"></i>${t('collect')} ${fmtCur(stats.emi)}
        </button>
        <button class="btn-kf-ghost" style="min-height:40px;padding:.375rem .875rem;font-size:.875rem" data-action="missed" data-id="${loan.id}" data-ocid="collection.missed_button.${i + 1}">
          <i class="fa-solid fa-xmark me-1"></i>${t('missed')}
        </button>
        <button class="btn-icon" data-action="download" data-id="${loan.id}" data-ocid="collection.download_button.${i + 1}"><i class="fa-solid fa-download"></i></button>
        <button class="btn-kf-ghost" style="min-height:40px;padding:.375rem .875rem;font-size:.875rem" data-action="remind" data-id="${loan.id}" title="Send WhatsApp Message" aria-label="WhatsApp Message" data-ocid="collection.remind_button.${i + 1}">
          <i class="fa-brands fa-whatsapp me-1" style="color:#25D366; font-size:1.1rem;"></i>${t('whatsapp')}
        </button>
      </div>
    </div>`;
  }).join('');

  listEl.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === 'collect') quickCollect(id);
    if (btn.dataset.action === 'missed') markMissed(id);
    if (btn.dataset.action === 'download') downloadCollectionDetailsPDF(id);
    if (btn.dataset.action === 'remind') sendReminder(id);
  });
}

function quickCollect(loanId) {
  const loan = Store.loans().find(l => l.id === loanId);
  if (!loan) return;
  const stats = calcLoanStats(loan);
  const payment = {
    id: uid(), loanId,
    amount: stats.emi,
    date: today(),
    note: 'Quick collect',
    createdAt: new Date().toISOString(),
  };
  const payments = Store.payments();
  payments.push(payment);
  Store.savePayments(payments);
  generateReceipt(payment, loan);
  showToast(`Payment of ${fmtCur(stats.emi)} recorded!`, 'success');
  renderCollectionList(Store.loans().filter(l => l.status === 'active'), Store.clients(), today());
}

function markMissed(loanId) {
  showToast('Marked as missed. Follow up with a reminder.', 'info');
}

// ── REPORTS PAGE ──────────────────────────────────────────────
function renderReports(container) {
  const payments = Store.payments();
  const loans = Store.loans();
  const clients = Store.clients();
  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
  const totalPayable = loans.reduce((s, l) => s + calcLoanStats(l).totalPayable, 0);
  const recoveryRate = totalPayable > 0 ? Math.round((totalCollected / totalPayable) * 100) : 0;
  const totalInterest = loans.reduce((s, l) => s + calcLoanStats(l).totalInterest, 0);

  // Top defaulters (clients with overdue loans)
  const defaulters = clients.map(c => {
    const clientLoans = loans.filter(l => l.clientId === c.id);
    const overdueAmount = clientLoans.filter(l => calcLoanStats(l).isOverdue)
      .reduce((s, l) => s + calcLoanStats(l).remaining, 0);
    return { client: c, overdueAmount };
  }).filter(d => d.overdueAmount > 0).sort((a, b) => b.overdueAmount - a.overdueAmount).slice(0, 5);

  container.innerHTML = `
    <div class="page-section" data-ocid="reports.page">
      <div class="page-title"><i class="fa-solid fa-chart-bar"></i>${t('reports')}</div>
      <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="report-stat kf-card" data-ocid="reports.recovery_card">
          <div class="report-stat-value">${recoveryRate}%</div>
          <div class="report-stat-label">${t('recoveryRate')}</div>
        </div>
        <div class="report-stat kf-card" data-ocid="reports.interest_card">
          <div class="report-stat-value">${fmtCur(totalInterest)}</div>
          <div class="report-stat-label">${t('totalInterestEarned')}</div>
        </div>
        <div class="report-stat kf-card" data-ocid="reports.collected_card">
          <div class="report-stat-value">${fmtCur(totalCollected)}</div>
          <div class="report-stat-label">${t('collected')}</div>
        </div>
      </div>

      <div class="kf-card" data-ocid="reports.monthly_chart_card">
        <div class="section-title"><i class="fa-solid fa-chart-bar"></i>${t('monthlyCollection')}</div>
        <div class="chart-wrapper">
          <canvas id="reports-chart" class="chart-canvas"></canvas>
        </div>
      </div>

      <div class="kf-card" data-ocid="reports.export_card">
        <div class="section-title"><i class="fa-solid fa-download"></i>Export Data</div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn-kf-ghost" id="btn-export-pdf-report" data-ocid="reports.export_pdf_button"><i class="fa-solid fa-file-pdf me-1"></i>${t('exportPDF')}</button>
          <button class="btn-kf-ghost" id="btn-export-csv" data-ocid="reports.export_csv_button"><i class="fa-solid fa-file-csv me-1"></i>${t('exportCSV')}</button>
        </div>
      </div>

      <div class="kf-card" data-ocid="reports.defaulters_card">
        <div class="section-title"><i class="fa-solid fa-triangle-exclamation"></i>${t('topDefaulters')}</div>
        ${defaulters.length === 0
          ? '<p class="text-muted-kf fs-sm">No defaulters. Great recovery rate!</p>'
          : defaulters.map((d, i) => `
            <div class="payment-row" data-ocid="reports.defaulter.item.${i + 1}">
              <div><div style="font-weight:700">${d.client.name}</div><div class="text-muted-kf fs-xs">${d.client.phone}</div></div>
              <div style="color:var(--color-danger);font-weight:700">${fmtCur(d.overdueAmount)}</div>
            </div>`).join('')
        }
      </div>

      <div class="kf-card" data-ocid="reports.client_summary_card">
        <div class="section-title"><i class="fa-solid fa-table"></i>${t('clientWiseSummary')}</div>
        <div style="overflow-x:auto">
          <table style="width:100%;font-size:.8125rem;border-collapse:collapse">
            <thead>
              <tr style="border-bottom:1px solid var(--color-border)">
                <th style="text-align:left;padding:.5rem .375rem;color:var(--color-text-muted);font-weight:600">Client</th>
                <th style="text-align:right;padding:.5rem .375rem;color:var(--color-text-muted);font-weight:600">Given</th>
                <th style="text-align:right;padding:.5rem .375rem;color:var(--color-text-muted);font-weight:600">Paid</th>
                <th style="text-align:right;padding:.5rem .375rem;color:var(--color-text-muted);font-weight:600">Pending</th>
              </tr>
            </thead>
            <tbody>
              ${clients.map((c, i) => {
                const cloans = loans.filter(l => l.clientId === c.id);
                const given = cloans.reduce((s, l) => s + l.principal, 0);
                const paid = payments.filter(p => cloans.some(l => l.id === p.loanId)).reduce((s, p) => s + p.amount, 0);
                const pending = Math.max(0, cloans.reduce((s, l) => s + calcLoanStats(l).totalPayable, 0) - paid);
                return `<tr style="border-bottom:1px solid var(--color-border-muted)" data-ocid="reports.client.item.${i + 1}">
                  <td style="padding:.5rem .375rem;font-weight:600">${c.name}</td>
                  <td style="text-align:right;padding:.5rem .375rem">${fmtCur(given)}</td>
                  <td style="text-align:right;padding:.5rem .375rem;color:var(--color-success)">${fmtCur(paid)}</td>
                  <td style="text-align:right;padding:.5rem .375rem;color:var(--color-danger)">${fmtCur(pending)}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;

  renderMonthlyChart('reports-chart', payments);

  $('#btn-export-pdf-report').addEventListener('click', () => exportAllDataAsPDF());
  $('#btn-export-csv').addEventListener('click', () => exportCSV());
}

// ── SETTINGS PAGE ─────────────────────────────────────────────
function renderProfile(container) {
  const settings = Store.settings();
  const session = getSession();

  const financierName = settings.financierName || session?.user?.financierName || 'Your Name';
  const businessName = settings.businessName || session?.user?.businessName || 'Business Name';
  const avatarChar = financierName !== 'Your Name' ? financierName.charAt(0).toUpperCase() : 'U';

  container.innerHTML = `
    <div class="page-section" data-ocid="profile.page">
      <div class="page-title"><i class="fa-solid fa-user"></i><span data-i18n="profile">${t('profile')}</span></div>

      <!-- PRO Profile Header -->
      <div class="pro-profile-header mb-4 mt-2">
        <div class="pro-avatar">
           <i class="fa-solid fa-crown pro-crown"></i>
           <span>${avatarChar}</span>
        </div>
        <div class="pro-profile-info">
           <h3 class="pro-name">${financierName}</h3>
           <p class="pro-business">${businessName}</p>
        </div>
      </div>

      <div class="kf-card pro-card" data-ocid="profile.edit_card">
        <div class="section-title"><i class="fa-solid fa-user-pen"></i>Edit Profile</div>
        <div class="mb-3">
          <label class="form-label" data-i18n="financierName">${t('financierName')}</label>
          <input type="text" class="form-control kf-input pro-input" id="settings-name" value="${financierName === 'Your Name' ? '' : financierName}" data-ocid="settings.name_input" />
        </div>
        <div class="mb-3">
          <label class="form-label" data-i18n="businessName">${t('businessName')}</label>
          <input type="text" class="form-control kf-input pro-input" id="settings-business" value="${businessName === 'Business Name' ? '' : businessName}" data-ocid="settings.business_input" />
        </div>
        <button class="btn-kf-primary pro-btn w-100 mt-2" id="btn-save-profile" data-ocid="settings.save_profile_button"><i class="fa-solid fa-floppy-disk me-2"></i>Save Profile</button>
      </div>
    </div>
  `;

  // Attach Profile Events
  const saveBtn = container.querySelector('#btn-save-profile');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const n = container.querySelector('#settings-name').value.trim();
      const b = container.querySelector('#settings-business').value.trim();
      const s = Store.settings();
      s.financierName = n;
      s.businessName = b;
      Store.saveSettings(s);
      
      const sess = getSession();
      if (sess?.user) {
        sess.user.financierName = n;
        sess.user.businessName = b;
        Store.saveSession(sess);
      }
      
      showToast('Profile saved successfully', 'success');
      
      // Update header instantly
      const headerName = document.querySelector('.header-profile .profile-name');
      if (headerName) headerName.textContent = n || 'Profile';
      
      // Re-render profile view to reflect new avatar
      renderProfile(container);
    });
  }
}

function renderSettings(container) {
  if (window.KFSubscription) {
    window.KFSubscription.syncFromSettings();
    if (window.KFSubscription.ui) {
      window.KFSubscription.ui.updateUpgradeModal();
    }
  }

  const plan = getPlan();
  const planExpiry = getPlanExpiryTime();
  
  const settings = Store.settings();
  const session = getSession();
  const financierName = settings.financierName || session?.user?.financierName || 'Your Name';
  const avatarChar = financierName !== 'Your Name' ? financierName.charAt(0).toUpperCase() : 'U';

  // PRO Aesthetic Settings Page
  container.innerHTML = `
    <div class="page-section" data-ocid="settings.page">
      <div class="page-title"><i class="fa-solid fa-gear"></i><span data-i18n="settings">${t('settings')}</span></div>

      <div class="kf-card pro-card mb-3" style="cursor:pointer;" id="btn-goto-profile" data-ocid="settings.goto_profile">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-3">
            <div class="pro-avatar" style="width:50px; height:50px; font-size:1.2rem;">
              <span>${avatarChar}</span>
            </div>
            <div>
              <h5 class="mb-0">${financierName}</h5>
              <small class="text-muted-kf">View & Edit Profile</small>
            </div>
          </div>
          <i class="fa-solid fa-chevron-right text-muted-kf"></i>
        </div>
      </div>

      <div class="kf-card pro-plan-card" data-ocid="settings.plan_card">
        <div class="plan-glass-layer"></div>
        <div class="plan-content">
          <div class="section-title"><i class="fa-solid fa-star"></i><span data-i18n="currentPlan">${t('currentPlan')}</span></div>
          <div class="settings-row" style="border:none">
            <div>
              <div class="settings-row-label" style="font-size:1.15rem"><i class="fa-solid fa-circle-check" style="color:var(--color-primary)"></i> ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</div>
              ${planExpiry ? `<div class="settings-row-sub text-muted-kf">Expires: ${fmtDate(planExpiry)}</div>` : ''}
            ${plan !== 'yearly' ? `
            <button class="btn-kf-primary pro-upgrade-btn" id="btn-upgrade" data-ocid="settings.upgrade_button" style="padding: 18px 32px; font-size: 1.2rem; min-height: 60px; font-weight: 800; border-radius: 14px; box-shadow: 0 8px 24px rgba(126, 211, 33, 0.4);">
              <i class="fa-solid fa-rocket me-2" style="font-size: 1.3rem;"></i><span>Upgrade Now</span>
            </button>
            ` : `
            <button class="btn-kf-primary pro-upgrade-btn" disabled style="background: #10b981; border: none; cursor: default;">
              <i class="fa-solid fa-circle-check me-1"></i><span>Upgraded</span>
            </button>
            `}
          </div>
        </div>
      </div>

      <div class="kf-card pro-card" data-ocid="settings.preferences_card">
        <div class="section-title"><i class="fa-solid fa-sliders"></i>Preferences</div>
        <div class="settings-row pro-row">
          <div>
            <div class="settings-row-label"><i class="fa-solid fa-moon"></i><span data-i18n="darkMode">${t('darkMode')}</span></div>
          </div>
          <label class="kf-toggle pro-toggle">
            <input type="checkbox" id="settings-dark-toggle" ${state.theme === 'dark' ? 'checked' : ''} data-ocid="settings.dark_mode_toggle" />
            <span class="kf-toggle-slider"></span>
          </label>
        </div>
        <div class="settings-row pro-row">
          <div>
            <div class="settings-row-label"><i class="fa-solid fa-language"></i><span data-i18n="language">${t('language')}</span></div>
          </div>
          <div style="position: relative; max-width: 200px;">
            <select class="form-select kf-input pro-input" id="settings-lang-select" style="width: 100%; font-size:0.9rem; appearance: none; -webkit-appearance: none; -moz-appearance: none; padding-right: 40px;" data-ocid="settings.lang_select">
              <option value="en" ${state.lang === 'en' ? 'selected' : ''}>English</option>
              <option value="ta" ${state.lang === 'ta' ? 'selected' : ''}>தமிழ் (Tamil)</option>
            <option value="as" ${state.lang === 'as' ? 'selected' : ''}>অসমীয়া (Assamese)</option>
            <option value="bn" ${state.lang === 'bn' ? 'selected' : ''}>বাংলা (Bengali)</option>
            <option value="brx" ${state.lang === 'brx' ? 'selected' : ''}>बड़ो (Bodo)</option>
            <option value="doi" ${state.lang === 'doi' ? 'selected' : ''}>डोगरी (Dogri)</option>
            <option value="gu" ${state.lang === 'gu' ? 'selected' : ''}>ગુજરાતી (Gujarati)</option>
            <option value="hi" ${state.lang === 'hi' ? 'selected' : ''}>हिन्दी (Hindi)</option>
            <option value="kn" ${state.lang === 'kn' ? 'selected' : ''}>ಕನ್ನಡ (Kannada)</option>
            <option value="ks" ${state.lang === 'ks' ? 'selected' : ''}>کٲشُر (Kashmiri)</option>
            <option value="kok" ${state.lang === 'kok' ? 'selected' : ''}>कोंकणी (Konkani)</option>
            <option value="mai" ${state.lang === 'mai' ? 'selected' : ''}>मैथिली (Maithili)</option>
            <option value="ml" ${state.lang === 'ml' ? 'selected' : ''}>മലയാളം (Malayalam)</option>
            <option value="mni" ${state.lang === 'mni' ? 'selected' : ''}>মৈতৈলোন্ (Manipuri)</option>
            <option value="mr" ${state.lang === 'mr' ? 'selected' : ''}>मराठी (Marathi)</option>
            <option value="ne" ${state.lang === 'ne' ? 'selected' : ''}>नेपाली (Nepali)</option>
            <option value="or" ${state.lang === 'or' ? 'selected' : ''}>ଓଡ଼ିଆ (Odia)</option>
            <option value="pa" ${state.lang === 'pa' ? 'selected' : ''}>ਪੰਜਾਬੀ (Punjabi)</option>
            <option value="sa" ${state.lang === 'sa' ? 'selected' : ''}>संस्कृतम् (Sanskrit)</option>
            <option value="sat" ${state.lang === 'sat' ? 'selected' : ''}>ᱥᱟᱱᱛᱟᱲᱤ (Santali)</option>
            <option value="sd" ${state.lang === 'sd' ? 'selected' : ''}>سنڌي (Sindhi)</option>
            <option value="te" ${state.lang === 'te' ? 'selected' : ''}>తెలుగు (Telugu)</option>
            <option value="ur" ${state.lang === 'ur' ? 'selected' : ''}>اردو (Urdu)</option>
            </select>
            <i class="fa-solid fa-chevron-down" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--green-light); pointer-events: none; font-size: 14px;"></i>
          </div>
        </div>
      </div>


    <div class="kf-card pro-card" data-ocid="settings.recycle_bin_card">
      <div class="section-title"><i class="fa-solid fa-trash-can-arrow-up"></i> Recycle Bin</div>
      <div class="settings-row pro-row">
        <div>
          <div class="settings-row-label">Deleted Data Management</div>
          <div class="settings-row-sub text-muted-kf">${Store.recycleBin().length} items available to restore</div>
        </div>
        <button class="btn-kf-outline pro-btn-outline" style="min-height:36px;font-size:.875rem; min-width:100px;" id="btn-open-recycle-bin">Open Bin</button>
      </div>
      <div id="settings-recycle-bin-list" class="d-none mt-3" style="border-top:1px dashed var(--color-border-muted); padding-top:15px"></div>
    </div>

      <div class="kf-card pro-card" data-ocid="settings.data_card">
        <div class="section-title"><i class="fa-solid fa-database"></i>Data Management</div>
        <button class="btn-kf-outline pro-btn-outline w-100 mb-3" id="btn-settings-export-pdf" data-ocid="settings.export_pdf_button"><i class="fa-solid fa-file-pdf me-1"></i>Export Data (PDF)</button>
        <button class="btn-kf-danger pro-btn-danger w-100" id="btn-clear-data" data-ocid="settings.clear_data_button"><i class="fa-solid fa-trash me-1"></i><span data-i18n="clearData">${t('clearData')}</span></button>
      </div>

      <div class="kf-card pro-card" data-ocid="settings.private_cloud_card">
        <div class="section-title"><i class="fa-solid fa-cloud"></i>Private Cloud Storage</div>
        <p class="text-muted-kf fs-sm mb-3">Connect your own Supabase cloud database for secure synced backup storage.</p>
        <button class="btn-kf-outline pro-btn-outline w-100" id="btn-connect-supabase-storage"><i class="fa-solid fa-link me-1"></i>Connect Storage</button>
      </div>

      <!-- Legal & Contact Options -->
      <div class="kf-card pro-card" data-ocid="settings.legal_card">
        <div class="section-title"><i class="fa-solid fa-circle-info"></i>About & Legal</div>
        
        <div class="settings-option-row" onclick="openTermsModal()">
          <div class="settings-option-icon">📄</div>
          <span class="settings-option-label">Terms & Conditions</span>
          <span class="settings-option-chevron">›</span>
        </div>

        <div class="settings-option-row" onclick="openPrivacyModal()">
          <div class="settings-option-icon">🔒</div>
          <span class="settings-option-label">Privacy Policy</span>
          <span class="settings-option-chevron">›</span>
        </div>

        <div class="settings-option-row" onclick="openContactModal()">
          <div class="settings-option-icon">📞</div>
          <span class="settings-option-label">Contact Us</span>
          <span class="settings-option-chevron">›</span>
        </div>
      </div>

      <div class="mt-4 mb-4 d-flex gap-2">
        <button class="btn-kf-outline flex-grow-1" style="color:var(--color-danger); border-color:var(--color-danger); min-height:48px;" id="btn-delete-account">
          <i class="fa-solid fa-user-xmark me-2"></i>Delete Account
        </button>
        <button class="btn-kf-outline flex-grow-1 pro-btn-logout" style="min-height:48px; font-weight: 700; border: 1.5px solid var(--border-default); transition: all 0.3s ease;" id="btn-logout" data-ocid="settings.logout_button" onmouseover="this.style.background='rgba(126, 211, 33, 0.1)'; this.style.borderColor='var(--green-mid)'; this.style.color='var(--green-light)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(126, 211, 33, 0.2)';" onmouseout="this.style.background=''; this.style.borderColor='var(--border-default)'; this.style.color=''; this.style.transform=''; this.style.boxShadow='';">
          <i class="fa-solid fa-power-off me-2"></i><span data-i18n="logout">${t('logout')}</span>
        </button>
      </div>
    </div>`;

  translateDOM();

  // Toggle Recycle Bin visibility
  $('#btn-open-recycle-bin').addEventListener('click', (e) => {
    const list = $('#settings-recycle-bin-list');
    const isHidden = list.classList.toggle('d-none');
    e.target.textContent = isHidden ? 'Open Bin' : 'Close Bin';
    if (!isHidden) renderRecycleBin();
  });

  $('#settings-recycle-bin-list').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const binId = btn.dataset.id;
    if (!action || !binId) return;

    if (action === 'restore') {
      restoreRecycleBinItem(binId);
    } else if (action === 'delete') {
      permanentDeleteRecycleBinItem(binId);
    }
  });


  $('#settings-dark-toggle').addEventListener('change', e => {
    const theme = e.target.checked ? 'dark' : 'light';
    const s = Store.settings();
    s.theme = theme;
    Store.saveSettings(s);
    applyTheme(theme);
  });

  const langSelect = container.querySelector('#settings-lang-select');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      const lang = e.target.value;
      const s = Store.settings();
      s.lang = lang;
      Store.saveSettings(s);
      applyLang(lang);
      navigateTo('settings');
    });
  }

  container.querySelector('#btn-goto-profile')?.addEventListener('click', () => {
    navigateTo('profile');
  });

  // Upgrade button - preload orders when modal opens
  $('#btn-upgrade')?.addEventListener('click', () => {
    const modal = bootstrap.Modal.getOrCreateInstance($('#upgradeModal'));
    modal.show();
    // Preload orders for instant payment
    if (window.RazorpayPayment && window.RazorpayPayment.preloadOrders) {
      window.RazorpayPayment.preloadOrders();
    }
  });
  $('#banner-upgrade-btn') && $('#banner-upgrade-btn').addEventListener('click', () => {
    const modal = bootstrap.Modal.getOrCreateInstance($('#upgradeModal'));
    modal.show();
    // Preload orders for instant payment
    if (window.RazorpayPayment && window.RazorpayPayment.preloadOrders) {
      window.RazorpayPayment.preloadOrders();
    }
  });

  // Also preload when upgrade modal is shown via Bootstrap event
  const upgradeModalEl = $('#upgradeModal');
  if (upgradeModalEl) {
    upgradeModalEl.addEventListener('show.bs.modal', () => {
      console.log('🔄 Upgrade modal opening - preloading orders...');
      if (window.RazorpayPayment && window.RazorpayPayment.preloadOrders) {
        window.RazorpayPayment.preloadOrders();
      }
    });
  }

  $('#btn-connect-supabase-storage')?.addEventListener('click', () => {
    let modalEl = document.getElementById('supabaseModal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.className = 'modal fade';
      modalEl.id = 'supabaseModal';
      modalEl.tabIndex = '-1';
      document.body.appendChild(modalEl);
    }

    const creds = SecondarySupabase.getCredentials() || { url: '', anonKey: '' };
    const currentStatus = SecondarySupabase.getStatus();

    const getStatusText = (status) => {
      if (status === 'connected') return 'Connected';
      if (status === 'syncing') return 'Syncing';
      if (status === 'invalid') return 'Invalid Credentials';
      if (status === 'failed') return 'Connection Failed';
      return 'Not Connected';
    };

    const getStatusColor = (status) => {
      if (status === 'connected') return '#4caf1a'; // Green
      if (status === 'syncing') return '#ffc107'; // Yellow
      if (status === 'invalid' || status === 'failed') return '#ff4444'; // Red
      return '#8a9c8a'; // Gray
    };

    const updateStatusUI = () => {
      const status = SecondarySupabase.getStatus();
      const statusEl = document.getElementById('supabase-status-val');
      const dotEl = document.getElementById('supabase-status-dot');
      if (statusEl && dotEl) {
        statusEl.textContent = getStatusText(status);
        statusEl.style.color = getStatusColor(status);
        dotEl.style.backgroundColor = getStatusColor(status);
        
        // Remove old animations
        dotEl.className = 'status-dot';
        if (status === 'syncing') dotEl.classList.add('pulse-syncing');
        else if (status === 'connected') dotEl.classList.add('pulse-connected');
      }
    };

    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content kf-card pro-card" style="border:none; max-width: 460px; margin: auto;">
          <div class="p-4" style="max-height: 85vh; overflow-y: auto;">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="mb-0 fw-bold"><i class="fa-solid fa-cloud me-2 text-primary-kf"></i>Private Supabase Storage</h4>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <p class="text-muted-kf fs-sm mb-4" style="line-height: 1.6; background: rgba(255,255,255,0.03); border: 1px solid var(--kf-card-border); border-radius: 12px; padding: 12px;">
              If you would like to use your own private storage for your financier data, you can connect your personal data securely. Once connected, all future data will automatically sync to your private storage. If you need this service CONTACT whatsapp number: <strong>7904987242</strong> or mail <strong>{ mohansampath098@gmail.com }</strong>
            </p>

            <div class="d-flex align-items-center gap-2 mb-4 p-2" style="background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed var(--kf-card-border)">
              <div id="supabase-status-dot" class="${currentStatus === 'connected' ? 'pulse-connected' : (currentStatus === 'syncing' ? 'pulse-syncing' : '')}" style="width: 10px; height: 10px; border-radius: 50%; background-color: ${getStatusColor(currentStatus)}; margin-left: 8px;"></div>
              <span class="fs-sm fw-bold">Connection Status:</span>
              <span id="supabase-status-val" class="fs-sm fw-bold" style="color: ${getStatusColor(currentStatus)}">${getStatusText(currentStatus)}</span>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold fs-xs text-muted-kf">Supabase Project URL</label>
              <input type="text" class="form-control kf-input pro-input" id="sec-supabase-url" placeholder="https://your-project.supabase.co" value="${creds.url || ''}">
            </div>

            <div class="mb-4">
              <label class="form-label fw-bold fs-xs text-muted-kf">Supabase Anon Key</label>
              <input type="password" class="form-control kf-input pro-input" id="sec-supabase-key" placeholder="Enter your public anon key" value="${creds.anonKey || ''}">
            </div>

            <div class="d-flex flex-column gap-2 mb-3">
              <button class="btn-kf-primary w-100" id="btn-sec-supabase-connect"><i class="fa-solid fa-plug me-2"></i>Connect</button>
              <button class="btn-kf-outline w-100" id="btn-sec-supabase-test" style="border-color:#ffc107;color:#ffc107;"><i class="fa-solid fa-flask me-2"></i>Test Connection</button>
              <button class="btn-kf-outline w-100" id="btn-sec-supabase-disconnect" style="border-color:#ff4444;color:#ff4444;"><i class="fa-solid fa-power-off me-2"></i>Disconnect</button>
            </div>

            <div class="mt-4" id="supabase-sql-instructions" style="display: none;">
              <h5 class="fs-sm fw-bold text-muted-kf mb-2"><i class="fa-solid fa-code me-1"></i>Required SQL Schema</h5>
              <p class="text-muted-kf fs-xs mb-2">If your secondary database tables are missing, paste this SQL script inside your Supabase dashboard's SQL Editor to set them up.</p>
              <div class="position-relative">
                <pre class="bg-dark p-2 text-white fs-xs rounded overflow-auto" style="max-height: 120px; font-family: monospace; white-space: pre;">
-- Paste this in your Supabase SQL Editor
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  address text,
  occupation text,
  created_at timestamptz default now()
);

create table if not exists loans (
  id uuid primary key default gen_random_uuid(),
  client text,
  principal numeric,
  emi numeric,
  paid numeric,
  remaining numeric,
  status text,
  created_at timestamptz default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  date text,
  client text,
  amount numeric,
  mode text,
  note text,
  created_at timestamptz default now()
);
                </pre>
                <button class="btn btn-sm btn-outline-warning position-absolute top-0 end-0 m-1" id="btn-copy-supabase-sql" style="font-size: 0.65rem;"><i class="fa-solid fa-copy me-1"></i>Copy</button>
              </div>
            </div>

            <div class="d-flex justify-content-end mt-4">
              <button class="btn-kf-outline px-4" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const m = new bootstrap.Modal(modalEl);
    m.show();

    // Check if schema warning should be shown
    const checkAndShowSchemaWarning = async () => {
      if (SecondarySupabase.getStatus() === 'connected') {
        const check = await SecondarySupabase.checkTables();
        if (!check.clients || !check.loans || !check.payments) {
          document.getElementById('supabase-sql-instructions').style.display = 'block';
        } else {
          document.getElementById('supabase-sql-instructions').style.display = 'none';
        }
      } else {
        document.getElementById('supabase-sql-instructions').style.display = 'none';
      }
    };

    checkAndShowSchemaWarning();

    // Connect handler
    document.getElementById('btn-sec-supabase-connect').addEventListener('click', async () => {
      const url = document.getElementById('sec-supabase-url').value.trim();
      const key = document.getElementById('sec-supabase-key').value.trim();

      if (!SecondarySupabase.isValidUrl(url)) {
        showToast('Invalid Supabase Project URL structure', 'error');
        SecondarySupabase.setStatus('invalid');
        updateStatusUI();
        return;
      }
      if (!key || key.length < 20) {
        showToast('Invalid Anon Key structure', 'error');
        SecondarySupabase.setStatus('invalid');
        updateStatusUI();
        return;
      }

      SecondarySupabase.setStatus('syncing');
      updateStatusUI();

      const test = await SecondarySupabase.testConnection(url, key);
      if (test.success) {
        SecondarySupabase.saveCredentials(url, key);
        SecondarySupabase.getClient(); // initialize client
        SecondarySupabase.setStatus('connected');
        updateStatusUI();
        showToast('Successfully connected and configured secondary Supabase!', 'success');

        // Sync existing data
        showToast('Starting background database sync...', 'info');
        const syncRes = await SecondarySupabase.syncAll(Store.clients(), Store.loans(), Store.payments());
        if (syncRes.success) {
          showToast('All data successfully synced to Private Supabase Storage!', 'success');
        } else {
          showToast('Initial sync partially failed - will retry in background', 'warning');
        }
        await checkAndShowSchemaWarning();
        updateStatusUI();
      } else {
        SecondarySupabase.setStatus('failed');
        updateStatusUI();
        showToast(`Connection failed: ${test.error || 'Check URL/Key'}`, 'error');
      }
    });

    // Test handler
    document.getElementById('btn-sec-supabase-test').addEventListener('click', async () => {
      const url = document.getElementById('sec-supabase-url').value.trim();
      const key = document.getElementById('sec-supabase-key').value.trim();

      showToast('Testing database connection...', 'info');
      const test = await SecondarySupabase.testConnection(url, key);
      if (test.success) {
        showToast(test.warning === 'Schema missing' ? 'Connection successful! (Tables are missing)' : 'Database connection verified!', 'success');
        if (test.warning === 'Schema missing') {
          document.getElementById('supabase-sql-instructions').style.display = 'block';
        }
      } else {
        showToast(`Verification failed: ${test.error || 'Check credentials'}`, 'error');
      }
    });

    // Disconnect handler
    document.getElementById('btn-sec-supabase-disconnect').addEventListener('click', () => {
      SecondarySupabase.clearCredentials();
      document.getElementById('sec-supabase-url').value = '';
      document.getElementById('sec-supabase-key').value = '';
      updateStatusUI();
      document.getElementById('supabase-sql-instructions').style.display = 'none';
      showToast('Private storage disconnected successfully.', 'info');
    });

    // Copy SQL script handler
    document.getElementById('btn-copy-supabase-sql').addEventListener('click', () => {
      const sqlText = `create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  address text,
  occupation text,
  created_at timestamptz default now()
);

create table if not exists loans (
  id uuid primary key default gen_random_uuid(),
  client text,
  principal numeric,
  emi numeric,
  paid numeric,
  remaining numeric,
  status text,
  created_at timestamptz default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  date text,
  client text,
  amount numeric,
  mode text,
  note text,
  created_at timestamptz default now()
);`;
      navigator.clipboard.writeText(sqlText).then(() => {
        showToast('SQL script copied to clipboard!', 'success');
      });
    });
  });

  $('#btn-settings-export-pdf')?.addEventListener('click', () => exportAllDataAsPDF());
  $('#btn-clear-data').addEventListener('click', () => {
    state.deleteCallback = () => {
      requirePinToProceed('Clear Data', () => {
        localStorage.removeItem(LS.clients);
        localStorage.removeItem(LS.loans);
        localStorage.removeItem(LS.payments);
        localStorage.removeItem(LS.recycleBin);
        triggerAutoSync();
        showToast('All data cleared!', 'info');
        navigateTo('dashboard');
      });
    };
    $('#confirm-delete-msg').textContent = 'Are you sure you want to delete ALL clients, loans and payment data? This cannot be undone.';
    $('#confirm-delete-btn').textContent = 'Clear Data';
    const titleEl = $('#confirmDeleteModal .modal-title');
    if (titleEl) titleEl.textContent = 'Confirm Clear Data';
    new bootstrap.Modal($('#confirmDeleteModal')).show();
  });

  $('#btn-logout').addEventListener('click', () => {
    state.deleteCallback = () => {
      logout();
    };
    $('#confirm-delete-msg').textContent = 'Are you sure you want to logout?';
    $('#confirm-delete-btn').textContent = 'Logout';
    const titleEl = $('#confirmDeleteModal .modal-title');
    if (titleEl) titleEl.textContent = 'Confirm Logout';
    new bootstrap.Modal($('#confirmDeleteModal')).show();
  });

  $('#btn-delete-account')?.addEventListener('click', () => {
    state.deleteCallback = () => {
      requirePinToProceed('Account Deletion', () => {
        localStorage.clear();
        logout();
        showToast('Account and all data deleted.', 'info');
      });
    };
    $('#confirm-delete-msg').textContent = 'Are you sure you want to completely DELETE your account and ALL data? This action cannot be undone.';
    $('#confirm-delete-btn').textContent = 'Delete Account';
    const titleEl = $('#confirmDeleteModal .modal-title');
    if (titleEl) titleEl.textContent = 'Confirm Deletion';
    new bootstrap.Modal($('#confirmDeleteModal')).show();
  });
}

// ── PIN AUTHENTICATION HELPER ─────────────────────────────────
function requirePinToProceed(actionMsg, callback) {
  const s = Store.settings();
  if (!s.appPin) {
    callback();
    return;
  }
  const pin = prompt(`Enter your 4-digit PIN to confirm ${actionMsg}:`);
  if (pin === null) return; // User pressed cancel
  if (pin === s.appPin) {
    callback();
  } else {
    showToast('Incorrect PIN. Action cancelled.', 'error');
  }
}

// ── PAYMENT MODAL ─────────────────────────────────────────────
function openPaymentModal(loanId) {
  const loan = Store.loans().find(l => l.id === loanId);
  if (!loan) return;
  const stats = calcLoanStats(loan);
  const client = Store.clients().find(c => c.id === loan.clientId);
  $('#payment-loan-id').value = loanId;
  $('#payment-amount').value = stats.emi;
  $('#payment-date').value = today();
  $('#payment-note').value = '';
  $('#payment-loan-summary').innerHTML = `
    <div class="emi-preview-row"><span>Client</span><strong>${client ? client.name : 'Unknown'}</strong></div>
    <div class="emi-preview-row"><span>EMI</span><strong>${fmtCur(stats.emi)}</strong></div>
    <div class="emi-preview-row"><span>Remaining</span><strong>${fmtCur(stats.remaining)}</strong></div>`;
  new bootstrap.Modal($('#paymentModal')).show();
}

// ── RECEIPT MODAL & PDF ───────────────────────────────────────
function generateReceipt(payment, loan) {
  state.currentReceiptPayment = payment;
  state.currentReceiptLoan = loan;
  const client = Store.clients().find(c => c.id === loan.clientId);

  $('#receipt-modal-body').innerHTML = `
    <div class="text-center mb-4">
      <div style="width:64px;height:64px;background:rgba(16, 185, 129, 0.1);color:#10b981;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:2rem;margin-bottom:1rem;">
        <i class="fa-solid fa-check"></i>
      </div>
      <h3 style="font-weight:800;font-size:1.75rem;margin-bottom:0.25rem;">${fmtCur(payment.amount)}</h3>
      <p class="text-muted-kf">Payment Successful</p>
    </div>
    <div class="settings-row pro-row" style="padding:8px 0;border-bottom:1px dashed var(--color-border-muted)">
      <span class="text-muted-kf fs-sm">Date</span>
      <strong class="fs-sm">${fmtDate(payment.date)}</strong>
    </div>
    <div class="settings-row pro-row" style="padding:8px 0;border-bottom:1px dashed var(--color-border-muted)">
      <span class="text-muted-kf fs-sm">Client</span>
      <strong class="fs-sm">${client ? client.name : 'Unknown'}</strong>
    </div>
    <div class="settings-row pro-row" style="padding:8px 0;border-bottom:1px dashed var(--color-border-muted)">
      <span class="text-muted-kf fs-sm">Loan ID</span>
      <strong class="fs-sm">${loan.id.toUpperCase()}</strong>
    </div>
    ${payment.note ? `
    <div class="settings-row pro-row" style="padding:8px 0;">
      <span class="text-muted-kf fs-sm">Note</span>
      <strong class="fs-sm">${payment.note}</strong>
    </div>` : ''}
  `;

  new bootstrap.Modal($('#receiptModal')).show();
}

function downloadSingleReceiptPDF(payment, loan) {
  if (typeof window.jspdf === 'undefined') {
      showToast('PDF library not loaded', 'error');
      return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'pt', 'a5');
  const client = Store.clients().find(c => c.id === loan.clientId);
  const settings = Store.settings();
  
  const pdfCur = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  doc.setFontSize(18);
  doc.setTextColor(41, 128, 185);
  doc.text(settings.businessName || 'KaasFlow Finance', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  doc.text('Payment Receipt', doc.internal.pageSize.getWidth() / 2, 65, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Receipt ID: ${payment.id.toUpperCase()}`, 20, 100);
  doc.text(`Date: ${fmtDate(payment.date)}`, 20, 115);
  
  doc.setLineWidth(1);
  doc.setDrawColor(220, 220, 220);
  doc.line(20, 125, doc.internal.pageSize.getWidth() - 20, 125);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Received From: ${client ? client.name : 'Unknown'}`, 20, 150);
  doc.text(`Amount Paid: ${pdfCur(payment.amount)}`, 20, 175);
  doc.text(`Loan ID: ${loan.id.toUpperCase()}`, 20, 200);
  if (payment.note) doc.text(`Notes: ${payment.note}`, 20, 225);
  
  doc.line(20, 245, doc.internal.pageSize.getWidth() - 20, 245);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for your payment!', doc.internal.pageSize.getWidth() / 2, 275, { align: 'center' });
  
  doc.save(`Receipt_${payment.id}.pdf`);
  showToast('Receipt Downloaded!', 'success');
}

function shareReceiptWhatsApp(payment, loan) {
  const client = Store.clients().find(c => c.id === loan.clientId);
  if (!client) return;
  const settings = Store.settings();
  const businessName = settings.businessName || 'KaasFlow Finance';
  
  const msg = `🧾 *Payment Receipt*\n\n` +
              `*${businessName}*\n` +
              `------------------------\n` +
              `*Date:* ${fmtDate(payment.date)}\n` +
              `*Amount Paid:* ₹${payment.amount.toLocaleString('en-IN')}\n` +
              `*Loan ID:* ${loan.id.toUpperCase()}\n` +
              (payment.note ? `*Note:* ${payment.note}\n` : '') +
              `------------------------\n` +
              `Thank you for your payment!`;
              
  const phone = client.phone.replace(/\D/g, '');
  const url = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ── REMINDERS & WHATSAPP ──────────────────────────────────────
function sendReminder(loanId) {
  const loan = Store.loans().find(l => l.id === loanId);
  if (!loan) return;
  const stats = calcLoanStats(loan);
  const client = Store.clients().find(c => c.id === loan.clientId);
  if (!client) return;
  const msg = stats.isOverdue
    ? t('reminderMsgOverdue', client.name, fmtCur(stats.emi), stats.daysOverdue)
    : t('reminderMsg', client.name, fmtCur(stats.emi));
  const phone = client.phone.replace(/\D/g, '');
  const url = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// [NEW] PDF Download Requirements: Improved Client Details PDF
function downloadClientDetailsPDF(clientId) {
    if (typeof window.jspdf === 'undefined') {
        showToast('PDF core library (jsPDF) not loaded', 'error');
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const client = Store.clients().find(c => c.id === clientId);
    if (!client) { showToast('Client not found', 'error'); return; }
    
    const clientLoans = Store.loans().filter(l => l.clientId === clientId);
    const settings = Store.settings();

    const pdfCur = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

    // Header
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185);
    doc.text(settings.businessName || 'KaasFlow Finance', 14, 22);
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text(`Client Profile`, 14, 32);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Report Date: ${fmtDate(today())}`, 196, 22, { align: 'right' });

    // Client Summary using AutoTable
    doc.autoTable({
        startY: 40,
        head: [['Client Details', '']],
        body: [
            ['Name', client.name],
            ['Phone', client.phone],
            ['Address', client.address || '-'],
            ['ID Number', client.idNum || '-'],
            ['Occupation', client.occupation || '-'],
            ['Registered On', fmtDate(client.createdAt)]
        ],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 60, fillColor: [245, 245, 245] }
        },
        styles: { fontSize: 10, cellPadding: 3 },
    });

    let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : doc.autoTable.previous.finalY;

    doc.setFontSize(12);
    doc.setTextColor(41, 128, 185);
    doc.text(`Loans (${clientLoans.length})`, 14, finalY + 15);

    if (clientLoans.length > 0) {
        doc.autoTable({
            startY: finalY + 20,
            head: [['Principal', 'EMI', 'Duration', 'Paid', 'Balance', 'Status']],
            body: clientLoans.map(l => {
                const stats = calcLoanStats(l);
                return [
                    pdfCur(l.principal), 
                    pdfCur(stats.emi), 
                    l.duration ? `${l.duration}m` : '-', 
                    pdfCur(stats.totalPaid), 
                    pdfCur(stats.remaining), 
                    stats.isOverdue ? 'OVERDUE' : l.status.toUpperCase()
                ];
            }),
            theme: 'striped',
            headStyles: { fillColor: [44, 62, 80] },
            styles: { fontSize: 9 }
        });
    } else {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('No loans recorded for this client.', 14, finalY + 25);
    }

    doc.save(`Client-Profile-${client.name.replace(/\s/g, '_')}.pdf`);
    showToast('Profile Downloaded!', 'success');
}

// [NEW] PDF Download Requirements: Improved Loan Details PDF
function downloadLoanDetailsPDF(loanId) {
    if (typeof window.jspdf === 'undefined') {
        showToast('PDF core library (jsPDF) not loaded', 'error');
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const loan = Store.loans().find(l => l.id === loanId);
    if (!loan) { showToast('Loan not found', 'error'); return; }
    const client = Store.clients().find(c => c.id === loan.clientId);
    const payments = Store.payments().filter(p => p.loanId === loanId).sort((a, b) => new Date(b.date) - new Date(a.date));
    const stats = calcLoanStats(loan);
    const settings = Store.settings();

    const pdfCur = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

    // Business Name & Header
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185); // Nice blue
    doc.text(settings.businessName || 'KaasFlow Finance', 14, 22);
    
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text('Loan Statement & Payment History', 14, 32);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${fmtDate(today())}`, 196, 22, { align: 'right' });
    doc.text(`Loan ID: ${loan.id.toUpperCase()}`, 196, 28, { align: 'right' });

    // Client Info
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Client Name: ${client ? client.name : 'Unknown'}`, 14, 45);
    doc.text(`Phone: ${client ? client.phone : 'N/A'}`, 14, 51);

    // Loan Summary using AutoTable for perfect alignment
    doc.autoTable({
        startY: 60,
        head: [['Loan Summary', '']],
        body: [
            ['Principal Amount', pdfCur(loan.principal)],
            ['Interest Rate', `${loan.interestRate || 0}% (${loan.type})`],
            ['Duration', loan.duration ? `${loan.duration} installments` : 'Open / No fixed duration'],
            ['EMI Amount', pdfCur(stats.emi)],
            ['Total Payable', pdfCur(stats.totalPayable)],
            ['Total Paid', pdfCur(stats.totalPaid)],
            ['Balance Remaining', pdfCur(stats.remaining)],
            ['Loan Status', stats.isOverdue ? `OVERDUE (${stats.daysOverdue} days)` : loan.status.toUpperCase()],
            ['Start Date', fmtDate(loan.startDate)],
            ['Next Due Date', stats.nextDueDate ? fmtDate(stats.nextDueDate) : 'N/A']
        ],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 80, fillColor: [245, 245, 245] },
            1: { cellWidth: 'auto' }
        },
        styles: { fontSize: 10, cellPadding: 3 }
    });

    let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : doc.autoTable.previous.finalY;

    // Payment History Table
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text('Payment History', 14, finalY + 15);

    if (payments.length === 0) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('No payments recorded yet.', 14, finalY + 25);
    } else {
        const head = [['Date', 'Amount Paid', 'Payment Mode', 'Status', 'Notes']];
        const body = payments.map(p => [
            fmtDate(p.date),
            pdfCur(p.amount),
            p.mode ? p.mode.charAt(0).toUpperCase() + p.mode.slice(1) : '-',
            p.status ? p.status.toUpperCase() : 'PAID',
            p.note || '-'
        ]);

        doc.autoTable({
            startY: finalY + 20,
            head: head,
            body: body,
            theme: 'striped',
            headStyles: { fillColor: [44, 62, 80], textColor: 255 },
            styles: { fontSize: 9, cellPadding: 3 },
            alternateRowStyles: { fillColor: [240, 248, 255] }
        });
    }

    doc.save(`Loan_Statement_${client ? client.name.replace(/\s/g, '_') : 'Client'}_${loan.id.slice(-4)}.pdf`);
    showToast('Loan Statement Downloaded!', 'success');
}

// [NEW] PDF / Word Download Requirements: Collection Details PDF
function downloadCollectionDetailsPDF(loanId) {
    downloadLoanDetailsPDF(loanId);
}

// ── EXPORT / IMPORT ───────────────────────────────────────────
function exportAllDataAsPDF() {
    if (typeof window.jspdf === 'undefined') {
        showToast('PDF library not loaded', 'error');
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt');
    const clients = Store.clients();
    const loans = Store.loans();
    const payments = Store.payments();
    const settings = Store.settings();

    const pdfCur = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

    // Title Page / Header
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185);
    doc.text(settings.businessName || 'KaasFlow Data Export', doc.internal.pageSize.getWidth() / 2, 60, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${fmtDate(today())}`, doc.internal.pageSize.getWidth() / 2, 80, { align: 'center' });

    // Clients Table
    doc.setFontSize(16);
    doc.setTextColor(50, 50, 50);
    doc.text('Clients', 40, 120);
    let head = [['Name', 'Phone', 'Address', 'Occupation']];
    let body = clients.map(c => [c.name, c.phone, c.address || '-', c.occupation || '-']);
    doc.autoTable({ startY: 130, head, body, theme: 'grid', headStyles: { fillColor: [41, 128, 185] } });

    // Loans Table
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Loans', 40, 40);
    head = [['Client', 'Principal', 'EMI', 'Paid', 'Remaining', 'Status']];
    body = loans.map(l => {
        const c = clients.find(cl => cl.id === l.clientId);
        const stats = calcLoanStats(l);
        return [c ? c.name : 'Unknown', pdfCur(l.principal), pdfCur(stats.emi), pdfCur(stats.totalPaid), pdfCur(stats.remaining), stats.isOverdue ? 'OVERDUE' : l.status.toUpperCase()];
    });
    doc.autoTable({ startY: 50, head, body, theme: 'grid', headStyles: { fillColor: [41, 128, 185] } });

    // Payments Table
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Payments', 40, 40);
    head = [['Date', 'Client', 'Amount', 'Mode', 'Note']];
    body = payments.sort((a,b) => b.date.localeCompare(a.date)).map(p => {
        const l = loans.find(ln => ln.id === p.loanId);
        const c = l ? clients.find(cl => cl.id === l.clientId) : null;
        return [fmtDate(p.date), c ? c.name : 'Unknown', pdfCur(p.amount), p.mode ? p.mode.charAt(0).toUpperCase() + p.mode.slice(1) : '-', p.note || '-'];
    });
    doc.autoTable({ startY: 50, head, body, theme: 'grid', headStyles: { fillColor: [41, 128, 185] } });

    doc.save(`KaasFlow-Export-${today()}.pdf`);
    showToast('PDF Report Generated!', 'success');
}

function exportCSV() {
  const clients = Store.clients();
  if (!clients.length) { showToast('No data to export', 'info'); return; }
  const headers = ['Name', 'Phone', 'Address', 'Occupation'];
  const rows = clients.map(c => [c.name, c.phone, c.address || '', c.occupation || '']);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `KaasFlow-Clients-${today()}.csv`;
  a.click(); URL.revokeObjectURL(url);
  showToast('CSV exported!', 'success');
}

function exportJSON() {
  const data = {
    clients: Store.clients(), loans: Store.loans(), payments: Store.payments(),
    settings: Store.settings(), exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `KaasFlow-Backup-${today()}.json`;
  a.click(); URL.revokeObjectURL(url);
  showToast('Backup exported!', 'success');
}

// [NEW] Import / Export Data: Import data from JSON (already implemented, ensuring clean UI)
function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.clients) {
        let imported = data.clients;
        const s = Store.settings();
        const limit = FREE_CLIENT_LIMIT + (s.extraClients || 0);
        if (getPlan() === 'free' && imported.length > limit) {
          imported = imported.slice(0, limit);
          showToast(`Free plan limit: Only first ${limit} clients imported.`, 'info');
        }
        Store.saveClients(imported);
      }
      if (data.loans) Store.saveLoans(data.loans);
      if (data.payments) Store.savePayments(data.payments);
      showToast('Data imported successfully!', 'success');
      navigateTo('dashboard');
      // [FIX] Language change: Re-apply language after import to ensure new data is translated if needed (if any text content is directly rendered from data)
      applyLang(Store.settings().lang || 'en');
    } catch { showToast('Invalid backup file', 'error'); }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// ── RECYCLE BIN ───────────────────────────────────────────────
function renderRecycleBin() {
  const listEl = $('#settings-recycle-bin-list');
  if (!listEl) return;
  const bin = Store.recycleBin();
  if (bin.length === 0) {
    listEl.innerHTML = '<p class="text-muted-kf fs-sm mb-0">Recycle bin is empty.</p>';
    return;
  }

  let html = '';
  const clients = bin.filter(x => x.type === 'client');
  const loans = bin.filter(x => x.type === 'loan');
  const payments = bin.filter(x => x.type === 'payment');

  const renderGroup = (title, items) => {
    if (items.length === 0) return '';
    let groupHtml = `<div style="font-weight:600; margin-bottom:8px; margin-top:12px; color:var(--color-primary);">${title}</div>`;
    items.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt)).forEach(entry => {
      let itemTitle = '';
      let subtitle = `Deleted: ${fmtDate(entry.deletedAt)}`;
      if (entry.type === 'client') {
        itemTitle = entry.item.name;
        subtitle += ` · Loans: ${entry.relatedLoans ? entry.relatedLoans.length : 0}`;
      } else if (entry.type === 'loan') {
        itemTitle = `${fmtCur(entry.item.principal)} Loan`;
        subtitle += ` · Payments: ${entry.relatedPayments ? entry.relatedPayments.length : 0}`;
      } else if (entry.type === 'payment') {
        itemTitle = `${fmtCur(entry.item.amount)} Payment`;
      }

      groupHtml += `
      <div class="settings-row pro-row" style="align-items:center; padding: 8px 0; border-bottom: 1px solid var(--color-border-muted);">
        <div style="flex:1; min-width:0;">
          <div class="settings-row-label" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${itemTitle}</div>
          <div class="settings-row-sub text-muted-kf" style="font-size:0.75rem">${subtitle}</div>
        </div>
        <div style="display:flex; gap:8px; flex-shrink:0;">
          <button type="button" class="btn-kf-outline pro-btn-outline" style="min-height:30px;font-size:0.75rem;padding:0.25rem 0.5rem;" data-action="restore" data-id="${entry.binId}">Restore</button>
          <button type="button" class="btn-kf-danger pro-btn-danger" style="min-height:30px;font-size:0.75rem;padding:0.25rem 0.5rem;" data-action="delete" data-id="${entry.binId}">Remove</button>
        </div>
      </div>`;
    });
    return groupHtml;
  };

  html += renderGroup('Clients', clients);
  html += renderGroup('Loans', loans);
  html += renderGroup('Payments', payments);

  listEl.innerHTML = html;
}

function restoreRecycleBinItem(binId) {
  const bin = Store.recycleBin();
  const idx = bin.findIndex(x => x.binId === binId);
  if (idx === -1) return;
  const entry = bin[idx];

  if (entry.type === 'client') {
    const clients = Store.clients();
    if (!canAddClient() && !clients.some(c => c.id === entry.item.id)) {
      showToast('Client limit reached. Cannot restore.', 'error');
      return;
    }
    if (!clients.some(c => c.id === entry.item.id)) { clients.push(entry.item); Store.saveClients(clients); }
    if (entry.relatedLoans) { const loans = Store.loans(); entry.relatedLoans.forEach(l => { if (!loans.some(xl => xl.id === l.id)) loans.push(l); }); Store.saveLoans(loans); }
    if (entry.relatedPayments) { const payments = Store.payments(); entry.relatedPayments.forEach(p => { if (!payments.some(xp => xp.id === p.id)) payments.push(p); }); Store.savePayments(payments); }
  } else if (entry.type === 'loan') {
    const loans = Store.loans();
    if (!loans.some(l => l.id === entry.item.id)) { loans.push(entry.item); Store.saveLoans(loans); }
    if (entry.relatedPayments) { const payments = Store.payments(); entry.relatedPayments.forEach(p => { if (!payments.some(xp => xp.id === p.id)) payments.push(p); }); Store.savePayments(payments); }
  } else if (entry.type === 'payment') {
    const payments = Store.payments();
    if (!payments.some(p => p.id === entry.item.id)) { payments.push(entry.item); Store.savePayments(payments); }
  }

  bin.splice(idx, 1);
  Store.saveRecycleBin(bin);
  showToast('Item restored successfully!', 'success');
  renderRecycleBin();
}

function permanentDeleteRecycleBinItem(binId) {
  if (!confirm('Are you sure you want to permanently delete this item? This action cannot be undone.')) return;
  const bin = Store.recycleBin();
  const idx = bin.findIndex(x => x.binId === binId);
  if (idx !== -1) {
    bin.splice(idx, 1);
    Store.saveRecycleBin(bin);
    showToast('Item permanently deleted.', 'info');
    renderRecycleBin();
  }
}

// ── DELETE CONFIRM ─────────────────────────────────────────────
function confirmDelete(type, id) {
  const msgs = {
    client: 'Delete this client and all their loans and payments?',
    loan: 'Delete this loan and all its payment records?',
    payment: 'Delete this payment record?',
  };
  $('#confirm-delete-msg').textContent = msgs[type] || 'Are you sure?';
  state.deleteCallback = () => {
    const recycleBin = Store.recycleBin();
    const deletedAt = new Date().toISOString();

    if (type === 'client') {
      const client = Store.clients().find(c => c.id === id);
      const clientLoans = Store.loans().filter(l => l.clientId === id);
      const loanIds = clientLoans.map(l => l.id);
      const clientPayments = Store.payments().filter(p => loanIds.includes(p.loanId));

      if (client) {
        recycleBin.push({
          binId: uid(), type: 'client', item: client, relatedLoans: clientLoans, relatedPayments: clientPayments, deletedAt
        });
        Store.saveRecycleBin(recycleBin);
      }

      Store.saveClients(Store.clients().filter(c => c.id !== id));
      Store.saveLoans(Store.loans().filter(l => l.clientId !== id));
      Store.savePayments(Store.payments().filter(p => !loanIds.includes(p.loanId)));
      showToast('Client moved to Recycle Bin', 'info');
      if (state.page === 'clients') navigateTo('clients');
    } else if (type === 'loan') {
      const loan = Store.loans().find(l => l.id === id);
      const loanPayments = Store.payments().filter(p => p.loanId === id);

      if (loan) {
        recycleBin.push({
          binId: uid(), type: 'loan', item: loan, relatedPayments: loanPayments, deletedAt
        });
        Store.saveRecycleBin(recycleBin);
      }

      Store.saveLoans(Store.loans().filter(l => l.id !== id));
      Store.savePayments(Store.payments().filter(p => p.loanId !== id));
      showToast('Loan moved to Recycle Bin', 'info');
      if (state.page === 'loans') navigateTo('loans');
    } else if (type === 'payment') {
      const payment = Store.payments().find(p => p.id === id);
      if (payment) {
        recycleBin.push({
          binId: uid(), type: 'payment', item: payment, deletedAt
        });
        Store.saveRecycleBin(recycleBin);
      }
      Store.savePayments(Store.payments().filter(p => p.id !== id));
      showToast('Payment moved to Recycle Bin', 'info');
      if (state.page === 'reports') navigateTo('reports'); // Fallback routing if a view handles standalone payment deletion
    }
  };
  new bootstrap.Modal($('#confirmDeleteModal')).show();
}





// ── NOTIFICATIONS ───────────────────────────────────────────

// Holds the SW registration so we can call showNotification() with actions
let _swReg = null;
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(r => { _swReg = r; });
}

/**
 * Request notification permission and schedule daily alert.
 * Called once during init().
 */
function scheduleNotifications() {
  if (!('Notification' in window)) return;

  const askAndSchedule = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    setTimeout(() => {
      localStorage.removeItem('kf_notif_sent_date');
      fireTodayNotifications();
      setInterval(() => {
        localStorage.removeItem('kf_notif_sent_date');
        fireTodayNotifications();
      }, 86400000);
    }, midnight - now);
  };

  if (Notification.permission === 'granted') {
    askAndSchedule();
  } else if (Notification.permission === 'default') {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') askAndSchedule();
    }).catch(() => {});
  }
}

/**
 * Fire one native notification per client whose EMI is due today.
 * Uses Service Worker showNotification() so action buttons (Paid / Pending)
 * appear directly in the device notification bar.
 * Deduplication: only fires once per calendar day.
 */
function fireTodayNotifications() {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const todayStr = today();
  const lastSent = localStorage.getItem('kf_notif_sent_date');
  if (lastSent === todayStr) return;

  const loans   = Store.loans().filter(l => l.status === 'active');
  const clients  = Store.clients();

  const items = loans
    .map(l => ({ loan: l, stats: calcLoanStats(l), client: clients.find(c => c.id === l.clientId) }))
    .filter(({ stats }) => stats.nextDueDate && stats.nextDueDate <= todayStr && stats.remaining > 0);

  if (items.length === 0) return;

  localStorage.setItem('kf_notif_sent_date', todayStr);

  items.forEach(({ loan, stats, client }, idx) => {
    setTimeout(() => {
      const name        = client ? client.name : 'Unknown Client';
      const amount      = fmtCur(stats.emi);
      const dueDate     = fmtDate(stats.nextDueDate);
      const isOverdue   = stats.isOverdue;

      const title = isOverdue
        ? `⚠️ Overdue — ${name}`
        : `💵 EMI Due Today — ${name}`;

      const bodyLines = [
        `Amount: ${amount}`,
        `Due Date: ${dueDate}`,
        isOverdue ? `Overdue by ${stats.daysOverdue} day(s)` : 'Pay before end of day',
      ];

      const notifOptions = {
        body:    bodyLines.join('\n'),
        icon:    'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%23d4a017%22/><text y=%2272%22 x=%2250%22 text-anchor=%22middle%22 font-size=%2265%22>%E2%82%B9</text></svg>',
        badge:   'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%23d4a017%22/><text y=%2272%22 x=%2250%22 text-anchor=%22middle%22 font-size=%2265%22>%E2%82%B9</text></svg>',
        tag:     `kf-due-${loan.id}-${todayStr}`,
        requireInteraction: true,  // stays on screen until user acts
        actions: [
          { action: 'paid',    title: '✅ Paid' },
          { action: 'pending', title: '⏳ Pending' },
        ],
        data: {
          loanId: loan.id,
          emi:    stats.emi,
          amount: stats.emi,
        },
        vibrate: [200, 100, 200],  // buzz pattern on Android
      };

      // Prefer SW showNotification (supports action buttons)
      // Fall back to basic Notification if SW not ready
      if (_swReg) {
        _swReg.showNotification(title, notifOptions).catch(() => {
          new Notification(title, { body: notifOptions.body, icon: notifOptions.icon });
        });
      } else {
        try { new Notification(title, { body: notifOptions.body, icon: notifOptions.icon }); }
        catch (e) {}
      }
    }, idx * 900);
  });
}

// Legacy alias
function sendDailyNotification() { fireTodayNotifications(); }

function updateNotifBadge() {
  const loans = Store.loans().filter(l => l.status === 'active');
  const clients = Store.clients();
  const todayStr = today();
  let count = 0;
  loans.forEach(l => {
    const stats = calcLoanStats(l);
    if (stats.isOverdue) count++;
    else if (stats.nextDueDate === todayStr && stats.remaining > 0) count++;
  });
  const badge = $('#notif-badge');
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count > 9 ? '9+' : count;
    badge.classList.remove('d-none');
  } else {
    badge.classList.add('d-none');
  }
}

function typeAIOrbText() {
  const textEl = document.getElementById('ai-typing-text');
  if (!textEl) return;
  const phrases = [
    "Analyzing financial data...",
    "Calculating EMI schedules...",
    "Synchronizing secure records...",
    "Welcome to SamKass Pro."
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  
  function type() {
    if (!document.getElementById('ai-typing-text')) return;
    const currentPhrase = phrases[phraseIndex];
    if (isDeleting) {
      textEl.innerText = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
    } else {
      textEl.innerText = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
    }
    
    let typeSpeed = isDeleting ? 30 : 70;
    
    if (!isDeleting && charIndex === currentPhrase.length) {
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeSpeed = 500;
    }
    
    setTimeout(type, typeSpeed);
  }
  
  // Start typing
  setTimeout(type, 1000);
}



function renderNotifDropdown() {
  const loans = Store.loans().filter(l => l.status === 'active');
  const clients = Store.clients();
  const todayStr = today();

  const allItems = loans.map(l => ({
    loan: l,
    stats: calcLoanStats(l),
    client: clients.find(c => c.id === l.clientId)
  }));

  const overdue  = allItems.filter(({ stats }) => stats.isOverdue);
  const dueToday = allItems.filter(({ stats }) => !stats.isOverdue && stats.nextDueDate === todayStr && stats.remaining > 0);

  const listEl  = $('#notif-list');
  const emptyEl = $('#notif-empty');

  if (overdue.length === 0 && dueToday.length === 0) {
    listEl.innerHTML = '';
    emptyEl.style.display = '';
    return;
  }
  emptyEl.style.display = 'none';

  let html = '';

  // ── Overdue section
  if (overdue.length > 0) {
    html += `<div class="notif-section-header notif-overdue-hdr"><i class="fa-solid fa-circle-exclamation me-1"></i>Overdue (${overdue.length})</div>`;
    html += overdue.map(({ loan, stats, client }) => `
      <div class="notif-item notif-item-overdue" data-loan-id="${loan.id}">
        <div class="notif-item-avatar notif-avatar-danger">
          ${client ? client.name.charAt(0).toUpperCase() : '?'}
        </div>
        <div class="notif-item-body">
          <div class="notif-item-name">${client ? client.name : 'Unknown'}</div>
          <div class="notif-item-meta"><i class="fa-solid fa-clock me-1"></i>${stats.daysOverdue} day(s) overdue · EMI ${fmtCur(stats.emi)}</div>
        </div>
        <button class="notif-action-btn notif-btn-collect" data-action="collect" data-loan-id="${loan.id}">
          <i class="fa-solid fa-hand-holding-dollar"></i>
        </button>
      </div>`);
    html += overdue.map(({ loan, stats, client }) => '').join('');
  }

  // ── Due Today section
  if (dueToday.length > 0) {
    html += `<div class="notif-section-header notif-due-hdr"><i class="fa-solid fa-calendar-day me-1"></i>Due Today (${dueToday.length})</div>`;
    html += dueToday.map(({ loan, stats, client }) => `
      <div class="notif-item notif-item-due" data-loan-id="${loan.id}">
        <div class="notif-item-avatar notif-avatar-warning">
          ${client ? client.name.charAt(0).toUpperCase() : '?'}
        </div>
        <div class="notif-item-body">
          <div class="notif-item-name">${client ? client.name : 'Unknown'}</div>
          <div class="notif-item-meta"><i class="fa-solid fa-rupee-sign me-1"></i>EMI ${fmtCur(stats.emi)} · ${t(loan.type)}</div>
        </div>
        <button class="notif-action-btn notif-btn-collect" data-action="collect" data-loan-id="${loan.id}">
          <i class="fa-solid fa-check"></i>
        </button>
      </div>`);
  }

  listEl.innerHTML = html;

  // Collect button action inside dropdown
  listEl.querySelectorAll('[data-action="collect"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const loanId = btn.dataset.loanId;
      $('#notif-dropdown').classList.add('d-none');
      openPaymentModal(loanId);
    });
  });
}

// ── GLOBAL EVENT BINDINGS ──────────────────────────────────────
function bindGlobal() {
  // Auth form handlers
  $('#login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#login-email').value.trim();
    const password = $('#login-password').value.trim();
    const errEl = $('#login-error');
    errEl.classList.add('d-none');
    if (!email || !email.includes('@')) {
      errEl.textContent = 'Enter a valid email address'; errEl.classList.remove('d-none'); return;
    }
    if (!password) { errEl.textContent = 'Enter your password'; errEl.classList.remove('d-none'); return; }
    const res = await apiAuth('login', { email, password });
    if (res.success) {
      const token = res.token || ('session:' + encodeURIComponent(res.user?.email || email) + ':' + Date.now());
      saveSessionIsolated(token, res.user || { email });
      // Also save financierName into settings if available
      if (res.user) {
        const s = Store.settings();
        if (res.user.financierName && !s.financierName) { s.financierName = res.user.financierName; Store.saveSettings(s); }
        if (res.user.businessName && !s.businessName) { s.businessName = res.user.businessName; Store.saveSettings(s); }
        if (res.user.appPin) { s.appPin = res.user.appPin; Store.saveSettings(s); }
      }
      state.session = getSession();
      if (window.KFSync) await KFSync.restore();
      if (hasPin()) { showPinLock(); } else { showPinSetup(); }
    } else {
      errEl.textContent = res.error || res.message || 'Login failed'; errEl.classList.remove('d-none');
    }
  });

  $('#register-form').addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#reg-name').value.trim();
    const email = $('#reg-email').value.trim();
    const password = $('#reg-password').value.trim();
    const business = $('#reg-business').value.trim();
    const errEl = $('#register-error');
    errEl.classList.add('d-none');
    if (!name) { errEl.textContent = 'Enter your name'; errEl.classList.remove('d-none'); return; }
    if (!email || !email.includes('@')) { errEl.textContent = 'Enter valid email'; errEl.classList.remove('d-none'); return; }
    if (!password || password.length < 6) { errEl.textContent = 'Password must be at least 6 characters'; errEl.classList.remove('d-none'); return; }
    const res = await apiAuth('register', { email, password, financier_name: name, business_name: business });
    if (res.success) {
      const token = res.token || ('session:' + encodeURIComponent(res.user?.email || email) + ':' + Date.now());
      saveSessionIsolated(token, res.user || { email });
      // Save user info into settings
      const s = Store.settings();
      if (name) s.financierName = name;
      if (business) s.businessName = business;
      if (res.user?.appPin) { s.appPin = res.user.appPin; }
      Store.saveSettings(s);
      state.session = getSession();
      // Data generation removed
      showPinSetup(); // New users always set PIN
    } else {
      errEl.textContent = res.error || res.message || 'Registration failed'; errEl.classList.remove('d-none');
    }
  });

  // --- ONBOARDING SLIDER TRANSITIONS & ALTERNATIVE AUTH METHODS ---
  // Try another way (Welcome slide -> Slide 2)
  $('#btn-try-another')?.addEventListener('click', () => {
    const slider = $('#auth-slider-container');
    if (slider) slider.classList.add('slide-to-step-2');
    showFormSection('#login-form-wrapper');
    updateAuthHeader('Log in or sign up', 'Manage loans, collections and customer payments smarter with SamKass.');
  });

  // Back button (Slide 2 -> Slide 1)
  $('#btn-back-to-step-1')?.addEventListener('click', () => {
    const slider = $('#auth-slider-container');
    if (slider) slider.classList.remove('slide-to-step-2');
  });

  // Back to email buttons
  $$('.btn-back-to-email').forEach(btn => {
    btn.addEventListener('click', () => {
      showFormSection('#login-form-wrapper');
      updateAuthHeader('Log in or sign up', 'Manage loans, collections and customer payments smarter with SamKass.');
    });
  });

  // Toggle between forms (Register/Login)
  $('#show-register')?.addEventListener('click', () => {
    showFormSection('#register-form-wrapper');
    updateAuthHeader('Create account', 'Get started with SamKass to simplify your book keeping.');
  });

  $('#show-login')?.addEventListener('click', () => {
    showFormSection('#login-form-wrapper');
    updateAuthHeader('Log in or sign up', 'Manage loans, collections and customer payments smarter with SamKass.');
  });

  // Forgot password
  $('#show-forgot-password')?.addEventListener('click', (e) => {
    e.preventDefault();
    showFormSection('#forgot-password-wrapper');
    updateAuthHeader('Reset password', 'We will email you a secure magic link to access your account.');
  });

  $('#show-login-from-forgot')?.addEventListener('click', () => {
    showFormSection('#login-form-wrapper');
    updateAuthHeader('Log in or sign up', 'Manage loans, collections and customer payments smarter with SamKass.');
  });



  $('#forgot-password-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#forgot-email').value.trim();
    const errEl = $('#forgot-error');
    const succEl = $('#forgot-success');
    errEl.classList.add('d-none');
    succEl.classList.add('d-none');

    if (!email || !email.includes('@')) {
      errEl.textContent = 'Enter a valid email address';
      errEl.classList.remove('d-none');
      return;
    }

    const btn = $('#forgot-submit-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Sending...';
    btn.disabled = true;

    const res = await apiAuth('magic-link/request', { email });

    btn.innerHTML = originalText;
    btn.disabled = false;

    if (res.success) {
      succEl.textContent = 'A secure login link has been sent to your email!';
      succEl.classList.remove('d-none');
      $('#forgot-email').value = '';
    } else if (res.offline) {
      succEl.textContent = 'Running in offline mode. Magic links require internet.';
      succEl.classList.remove('d-none');
    } else {
      errEl.textContent = res.error || res.message || 'Failed to send reset link.';
      errEl.classList.remove('d-none');
    }
  });

  // ── PIN INPUT BEHAVIOR ──────────────────────────────────────
  setupPinInputBehavior('#pin-setup-inputs');
  setupPinInputBehavior('#pin-lock-inputs');

  // Confirm PIN (setup)
  $('#btn-confirm-pin')?.addEventListener('click', () => {
    const inputs = $$('#pin-setup-inputs .pin-digit-input');
    const pin = inputs.map(i => i.value).join('');
    const errEl = $('#pin-setup-error');
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      errEl.textContent = 'Enter a valid 4-digit PIN';
      errEl.classList.remove('d-none');
      inputs.forEach(i => i.classList.add('shake'));
      setTimeout(() => inputs.forEach(i => i.classList.remove('shake')), 500);
      return;
    }
    // Save PIN
    const s = Store.settings();
    s.appPin = pin;
    Store.saveSettings(s);
    
    // Sync to backend (or Supabase directly)
    const sessionUser = getSession()?.user;
    if (sessionUser && sessionUser.email) {
      apiAuth('set-pin', { email: sessionUser.email, pin: pin }).catch(e => console.error(e));
    }
    if (window.KFSync) {
      KFSync.backup(true);
    }
    
    // Show success animation
    inputs.forEach(i => i.classList.add('success'));
    showToast('🔒 Security PIN set successfully!', 'success');
    setTimeout(() => showApp(), 600);
  });

  // Unlock PIN (lock screen)
  $('#btn-unlock-pin')?.addEventListener('click', () => {
    const inputs = $$('#pin-lock-inputs .pin-digit-input');
    const pin = inputs.map(i => i.value).join('');
    const errEl = $('#pin-lock-error');
    const savedPin = getPin();
    if (pin.length !== 4) {
      errEl.textContent = 'Enter your 4-digit PIN';
      errEl.classList.remove('d-none');
      return;
    }
    if (pin !== savedPin) {
      errEl.textContent = 'Incorrect PIN. Try again.';
      errEl.classList.remove('d-none');
      inputs.forEach(i => { i.classList.add('shake'); i.value = ''; });
      setTimeout(() => { inputs.forEach(i => i.classList.remove('shake')); inputs[0]?.focus(); }, 500);
      return;
    }
    // PIN correct!
    errEl.classList.add('d-none');
    inputs.forEach(i => i.classList.add('success'));
    setTimeout(() => showApp(), 400);
  });

  // Switch Account (from lock screen)
  $('#btn-switch-account')?.addEventListener('click', () => {
    localStorage.removeItem(LS.session);
    const s = Store.settings();
    delete s.appPin;
    Store.saveSettings(s);
    state.session = null;
    showAuth();
  });

  // Forgot Security PIN Flow
  let resetPinEmail = '';

  $('#btn-forgot-pin')?.addEventListener('click', () => {
    resetPinEmail = Store.session()?.user?.email || '';
    if(!resetPinEmail) {
      showToast('Cannot identify user email. Please switch account and login again.', 'error');
      return;
    }
    $('#forgot-pin-email').value = resetPinEmail;
    
    // Reset steps
    $('#forgot-pin-step-1').style.display = 'block';
    $('#forgot-pin-step-2').style.display = 'none';
    $('#forgot-pin-step-3').style.display = 'none';
    
    // Clear inputs
    $$('.reset-otp-input').forEach(i => i.value = '');
    $$('.reset-new-pin-input').forEach(i => i.value = '');

    new bootstrap.Modal(document.getElementById('forgotPinModal')).show();
  });

  // Handle OTP inputs typing
  $$('.reset-otp-input').forEach(input => {
    input.addEventListener('input', (e) => {
      if (e.target.value.length > 1) e.target.value = e.target.value.slice(0, 1);
      if (e.target.value && e.target.dataset.idx < 5) {
        $$('.reset-otp-input')[parseInt(e.target.dataset.idx) + 1].focus();
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && e.target.dataset.idx > 0) {
        $$('.reset-otp-input')[parseInt(e.target.dataset.idx) - 1].focus();
      }
      if (e.key === 'Enter') {
        const otpStr = $$('.reset-otp-input').map(i => i.value).join('');
        if(otpStr.length === 6) $('#btn-verify-pin-otp')?.click();
      }
    });
  });

  // Handle New PIN inputs typing
  $$('.reset-new-pin-input').forEach(input => {
    input.addEventListener('input', (e) => {
      if (e.target.value.length > 1) e.target.value = e.target.value.slice(0, 1);
      if (e.target.value && e.target.dataset.idx < 3) {
        $$('.reset-new-pin-input')[parseInt(e.target.dataset.idx) + 1].focus();
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && e.target.dataset.idx > 0) {
        $$('.reset-new-pin-input')[parseInt(e.target.dataset.idx) - 1].focus();
      }
      if (e.key === 'Enter') {
        const pinStr = $$('.reset-new-pin-input').map(i => i.value).join('');
        if(pinStr.length === 4) $('#btn-save-new-pin')?.click();
      }
    });
  });

  // Step 1: Send OTP
  $('#btn-send-pin-otp')?.addEventListener('click', async () => {
    const btn = $('#btn-send-pin-otp');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
    try {
      const res = await apiAuth('forgot-pin/send-otp', { email: resetPinEmail });
      if (res && res.success) {
        showToast('OTP sent successfully to your email.', 'success');
        $('#forgot-pin-step-1').style.display = 'none';
        $('#forgot-pin-step-2').style.display = 'block';
        setTimeout(() => $$('.reset-otp-input')[0]?.focus(), 100);
      } else {
        showToast(res.error || 'Failed to send OTP', 'error');
      }
    } catch (err) {
      showToast('Error sending OTP', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Send OTP <i class="fa-solid fa-paper-plane ms-1"></i>';
    }
  });

  // Step 2: Verify OTP
  $('#btn-verify-pin-otp')?.addEventListener('click', async () => {
    const otp = $$('.reset-otp-input').map(i => i.value).join('');
    if (otp.length !== 6) {
      showToast('Please enter the 6-digit OTP', 'error');
      return;
    }
    const btn = $('#btn-verify-pin-otp');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Verifying...';
    try {
      const res = await apiAuth('forgot-pin/verify-otp', { email: resetPinEmail, otp: otp });
      if (res && res.success) {
        showToast('OTP verified successfully', 'success');
        $('#forgot-pin-step-2').style.display = 'none';
        $('#forgot-pin-step-3').style.display = 'block';
        setTimeout(() => $$('.reset-new-pin-input')[0]?.focus(), 100);
      } else {
        showToast(res.error || 'Invalid OTP', 'error');
      }
    } catch (err) {
      showToast('Error verifying OTP', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Verify OTP <i class="fa-solid fa-check ms-1"></i>';
    }
  });

  // Step 3: Save New PIN
  $('#btn-save-new-pin')?.addEventListener('click', () => {
    const newPin = $$('.reset-new-pin-input').map(i => i.value).join('');
    if (newPin.length !== 4) {
      showToast('Please enter a 4-digit PIN', 'error');
      return;
    }
    const s = Store.settings();
    s.appPin = newPin;
    Store.saveSettings(s);
    
    // Sync to backend
    if (resetPinEmail) {
      apiAuth('set-pin', { email: resetPinEmail, pin: newPin }).catch(e => console.error(e));
    }
    
    // Close modal
    const modalEl = document.getElementById('forgotPinModal');
    bootstrap.Modal.getInstance(modalEl)?.hide();
    
    showToast('🔒 PIN reset successfully!', 'success');
    
    // Automatically log them in since they verified OTP
    setTimeout(() => showApp(), 500);
  });

  // Password visibility toggle
  $$('.btn-toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      target.type = target.type === 'password' ? 'text' : 'password';
      btn.querySelector('i').className = target.type === 'password' ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
    });
  });

  // Bottom nav
  $$('.nav-tab').forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(tab.dataset.page);
    });
  });

  // Theme toggle
  $('#theme-toggle').addEventListener('click', () => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    const s = Store.settings();
    s.theme = newTheme;
    Store.saveSettings(s);
    applyTheme(newTheme);
    destroyCharts();
    navigateTo(state.page);
  });

  // Notification bell
  $('#notif-bell').addEventListener('click', e => {
    e.stopPropagation();
    const dd = $('#notif-dropdown');
    dd.classList.toggle('d-none');
    if (!dd.classList.contains('d-none')) renderNotifDropdown();
  });

  $('#clear-notifs').addEventListener('click', () => {
    $('#notif-dropdown').classList.add('d-none');
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#notif-bell') && !e.target.closest('#notif-dropdown')) {
      $('#notif-dropdown')?.classList.add('d-none');
    }
  });

  // User menu
  $('#user-avatar-btn').addEventListener('click', () => navigateTo('settings'));

  // Save client button
  $('#save-client-btn').addEventListener('click', () => {
    const name = $('#client-name').value.trim();
    const phone = $('#client-phone').value.trim();
    if (!name) { $('#client-name').classList.add('is-invalid'); return; }
    if (!phone || phone.length !== 10 || !/^\d+$/.test(phone)) {
      $('#client-phone').classList.add('is-invalid'); return;
    }
    $('#client-name').classList.remove('is-invalid');
    $('#client-phone').classList.remove('is-invalid');

    const editId = $('#client-edit-id').value;
    const clients = Store.clients();
    if (editId) {
      const idx = clients.findIndex(c => c.id === editId);
      if (idx !== -1) {
        clients[idx] = { ...clients[idx], name, phone, address: $('#client-address').value.trim(), idNum: $('#client-id-num').value.trim(), occupation: $('#client-occupation').value.trim() };
      }
    } else {
      if (!canAddClient()) {
        const modal = bootstrap.Modal.getInstance($('#clientModal'));
        if (modal) modal.hide();
        bootstrap.Modal.getOrCreateInstance($('#upgradeModal')).show();
        return;
      }
      const newClient = { id: uid(), name, phone, address: $('#client-address').value.trim(), idNum: $('#client-id-num').value.trim(), occupation: $('#client-occupation').value.trim(), createdAt: today() };
      clients.push(newClient);
    }
    Store.saveClients(clients);
    bootstrap.Modal.getInstance($('#clientModal'))?.hide();
    showToast(editId ? 'Client updated!' : 'Client added!', 'success');
    if (state.page === 'clients') navigateTo('clients');
  });

  // Client form field validation
  ['client-name', 'client-phone'].forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener('input', () => el.classList.remove('is-invalid'));
  });

  // Save loan button
  $('#save-loan-btn').addEventListener('click', () => {
    const clientId = $('#loan-client-select').value;
    const interestType = $('#loan-interest-type').value || 'percentage';
    const principal = parseFloat($('#loan-principal').value);
    const durationVal = $('#loan-duration').value;
    const duration = durationVal ? parseInt(durationVal) : 0;
    const interestRate = parseFloat($('#loan-interest').value) || 0;
    const type = $('#loan-type').value;
    const startDate = $('#loan-start-date').value || today();
    
    if (!clientId || !principal || principal < 1) {
      showToast('Fill in required loan fields (Client & valid Principal)', 'error'); return;
    }
    if (interestRate < 0) {
      showToast('Interest cannot be negative', 'error'); return;
    }

    const editId = $('#loan-edit-id').value;
    const loans = Store.loans();
    if (editId) {
      const idx = loans.findIndex(l => l.id === editId);
      if (idx !== -1) loans[idx] = { ...loans[idx], clientId, interestType, principal, interestRate, duration, type, startDate };
    } else {
      if (!canUsePremiumFeatures()) {
        const modal = bootstrap.Modal.getInstance($('#loanModal'));
        if (modal) modal.hide();
        bootstrap.Modal.getOrCreateInstance($('#upgradeModal')).show();
        return;
      }
      const newLoan = { id: uid(), clientId, interestType, principal, interestRate, duration, type, startDate, status: 'active', createdAt: today() };
      loans.push(newLoan);
    }
    Store.saveLoans(loans);
    bootstrap.Modal.getInstance($('#loanModal'))?.hide();
    showToast(editId ? 'Loan updated!' : 'Loan added!', 'success');
    if (state.page === 'loans') navigateTo('loans');
    else if (state.page === 'clients') navigateTo('clients');
  });

  // EMI Preview live calculation
  ['loan-principal', 'loan-interest', 'loan-duration', 'loan-type', 'loan-interest-type'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', (e) => {
        if (e.target.type === 'number' && e.target.value < 0) {
          e.target.value = Math.abs(e.target.value);
        }
        updateEMIPreview();
      });
      el.addEventListener('change', updateEMIPreview);
    }
  });

  $('#loan-interest-type')?.addEventListener('change', (e) => {
    const label = $('#label-loan-interest');
    if (label) {
      label.innerHTML = e.target.value === 'fixed' ? 'Fixed Interest Value <span class="text-danger">*</span>' : 'Interest Percentage <span class="text-danger">*</span>';
    }
    updateEMIPreview();
  });

  // Add loan from client profile
  $('#add-loan-from-profile').addEventListener('click', () => {
    if (!canUsePremiumFeatures()) {
      bootstrap.Modal.getInstance($('#clientProfileModal'))?.hide();
      bootstrap.Modal.getOrCreateInstance($('#upgradeModal')).show();
      return;
    }
    bootstrap.Modal.getInstance($('#clientProfileModal'))?.hide();
    setTimeout(() => openLoanModal(state.profileClientId), 300);
  });

  // Save payment button
  $('#save-payment-btn').addEventListener('click', () => {
    const loanId = $('#payment-loan-id').value;
    const amount = parseFloat($('#payment-amount').value);
    const date = $('#payment-date').value || today();
    const note = $('#payment-note').value.trim();
    if (!loanId || !amount || amount < 1) { showToast('Enter a valid payment amount', 'error'); return; }
    const payment = { id: uid(), loanId, amount, date, note, createdAt: new Date().toISOString() };
    const payments = Store.payments();
    payments.push(payment);
    const loan = Store.loans().find(l => l.id === loanId);
    Store.savePayments(payments);
    if (loan) {
      const stats = calcLoanStats(loan);
      if (stats.remaining <= 0 || stats.progress >= 100) {
        const loans = Store.loans();
        const idx = loans.findIndex(l => l.id === loanId);
        if (idx !== -1) { loans[idx].status = 'completed'; Store.saveLoans(loans); }
      }
      generateReceipt(payment, loan);
    }
    bootstrap.Modal.getInstance($('#paymentModal'))?.hide();
    showToast(`Payment of ${fmtCur(amount)} recorded!`, 'success');
    updateNotifBadge();
    if (state.page !== 'settings') navigateTo(state.page);
  });

  // Confirm delete button
  $('#confirm-delete-btn').addEventListener('click', () => {
    if (typeof state.deleteCallback === 'function') state.deleteCallback();
    state.deleteCallback = null;
    bootstrap.Modal.getInstance($('#confirmDeleteModal'))?.hide();
  });

  // Receipt Modal actions
  $('#btn-download-receipt')?.addEventListener('click', () => {
    if (!state.currentReceiptPayment || !state.currentReceiptLoan) return;
    downloadSingleReceiptPDF(state.currentReceiptPayment, state.currentReceiptLoan);
  });

  $('#btn-whatsapp-receipt')?.addEventListener('click', () => {
    if (!state.currentReceiptPayment || !state.currentReceiptLoan) return;
    shareReceiptWhatsApp(state.currentReceiptPayment, state.currentReceiptLoan);
  });

  // Modal cleanup on hide
  ['#clientModal', '#loanModal', '#paymentModal', '#clientProfileModal', '#confirmDeleteModal', '#upgradeModal', '#modal-qr', '#receiptModal', '#loanInfoModal'].forEach(sel => {
    document.querySelector(sel)?.addEventListener('hidden.bs.modal', () => {
      document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    });
  });

  document.querySelector('#modal-qr')?.addEventListener('hidden.bs.modal', () => {
    // If QR modal is dismissed and plan isn't active, show the blocker again
    checkAccessControl();
  });

  // Plan banner upgrade button
  $('#banner-upgrade-btn')?.addEventListener('click', () => bootstrap.Modal.getOrCreateInstance($('#upgradeModal')).show());

  // [MODIFIED] Data Management Buttons - Removed JSON import/export and general PDF export
  // $('#btn-export-pdf').addEventListener('click', () => exportAllDataAsPDF()); // Removed
  // $('#btn-export-backup').addEventListener('click', () => exportJSON()); // Removed
  // $('#btn-import-backup').addEventListener('click', () => $('#import-file-input').click()); // Removed
  // Update notification badge periodically
  updateNotifBadge();
  setInterval(updateNotifBadge, 60000);
}

// ── PIN INPUT HELPER ─────────────────────────────────────────
function setupPinInputBehavior(containerSel) {
  const container = document.querySelector(containerSel);
  if (!container) return;
  const inputs = [...container.querySelectorAll('.pin-digit-input')];

  inputs.forEach((input, idx) => {
    // Only allow digits
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, '');
      e.target.value = val.slice(0, 1);
      if (val && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      }
      // Auto-submit on last digit if in lock screen
      if (val && idx === inputs.length - 1 && containerSel === '#pin-lock-inputs') {
        setTimeout(() => $('#btn-unlock-pin')?.click(), 150);
      }
    });

    // Handle backspace
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        if (!input.value && idx > 0) {
          inputs[idx - 1].focus();
          inputs[idx - 1].value = '';
        }
      }
      // Enter key
      if (e.key === 'Enter') {
        if (containerSel === '#pin-setup-inputs') {
          $('#btn-confirm-pin')?.click();
        } else {
          $('#btn-unlock-pin')?.click();
        }
      }
    });

    // Handle paste (e.g. paste "1234")
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 4);
      paste.split('').forEach((ch, i) => {
        if (inputs[i]) inputs[i].value = ch;
      });
      const nextIdx = Math.min(paste.length, inputs.length - 1);
      inputs[nextIdx].focus();
    });

    // Select all on focus
    input.addEventListener('focus', () => {
      input.select();
    });
  });
}

// ── SLOT PURCHASE SYSTEM ─────────────────────────────────────
// ── SUBSCRIPTION PAYMENT SYSTEM ──────────────────────────────
function initiatePlanPayment(planType) {
  console.log('🎯 initiatePlanPayment called for:', planType);
  
  // Close upgrade modals immediately
  ['upgradeModal', 'blockingUpgradeModal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const instance = bootstrap.Modal.getInstance(el);
      if (instance) instance.hide();
    }
  });

  // Ensure RazorpayPayment is ready
  if (typeof RazorpayPayment === 'undefined') {
    console.error('❌ RazorpayPayment not loaded!');
    alert('Payment system not loaded. Please refresh the page.');
    return;
  }

  // Check if SDK is loaded
  if (!RazorpayPayment.sdkLoaded) {
    console.error('❌ Razorpay SDK not loaded!');
    alert('Payment gateway not ready. Please refresh the page.');
    return;
  }

  console.log('✅ RazorpayPayment ready, calling payForPlanInstant...');

  // Trigger Razorpay INSTANTLY using pre-loaded order (NO ASYNC DELAY)
  RazorpayPayment.payForPlanInstant(planType, {
    onSuccess: (response) => {
      const settings = Store.settings();
      
      // Save new plan and payment date
      settings.plan = planType;
      settings.paymentDate = new Date().toISOString();

      // Save payment record
      if (!settings.planPayments) {
        settings.planPayments = [];
      }
      settings.planPayments.push({
        date: settings.paymentDate.split('T')[0],
        plan: planType,
        amount: PLAN_PRICES[planType],
        txnId: response.razorpay_payment_id || 'RZP-' + Date.now()
      });

      Store.saveSettings(settings);

      // Also update kf_subscription in localStorage for subscription.js compatibility
      const sub = JSON.parse(localStorage.getItem('kf_subscription') || '{}');
      const durationDays = planType === 'yearly' ? 365 : planType === 'quarterly' ? 90 : 30;
      const startDate = new Date();
      const expiryDate = new Date(startDate.getTime() + (durationDays * 24 * 60 * 60 * 1000));
      sub.planId = planType;
      sub.startDate = startDate.toISOString();
      sub.expiryDate = expiryDate.toISOString();
      sub.totalPaid = (sub.totalPaid || 0) + PLAN_PRICES[planType];
      if (!sub.paymentHistory) sub.paymentHistory = [];
      sub.paymentHistory.push({
        date: startDate.toISOString(),
        amount: PLAN_PRICES[planType],
        planId: planType,
        planName: PLAN_NAMES[planType],
        type: 'subscription',
        txnId: response.razorpay_payment_id
      });
      localStorage.setItem('kf_subscription', JSON.stringify(sub));

      if (typeof showToast === 'function') {
        showToast('✅ Payment confirmed! ' + PLAN_NAMES[planType] + ' activated.', 'success');
      }
      
      // Explicit limit popup for the user
      setTimeout(() => {
        alert('🎉 Upgrade Successful!\n\nYou now have unlimited access. Enjoy KaasFlow Premium!');
      }, 500);

      // Sync to Supabase
      if (window.KFSync) {
        window.KFSync.backup(true);
      }

      // Refresh checks
      checkAccessControl();
      updatePlanBanner();
      navigateTo(state.page || 'dashboard');
    },
    onError: (err) => {
      console.error(err);
      if (typeof showToast === 'function') {
        showToast(err.error || 'Payment failed or was cancelled.', 'error');
      }
    }
  });
}

// ── MODAL TOGGLES FOR SETTINGS INFO ───────────────────────────
window.openTermsModal = function() { document.getElementById('termsModal').style.display = 'flex'; }
window.openPrivacyModal = function() { document.getElementById('privacyModal').style.display = 'flex'; }
window.openContactModal = function() { document.getElementById('contactModal').style.display = 'flex'; }
window.closeModal = function(id) { document.getElementById(id).style.display = 'none'; }
window.closeContactOnOverlay = function(e) {
  if (e.target.id === 'contactModal') {
    closeModal('contactModal');
  }
}

// ── BOOT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (typeof RazorpayPayment !== 'undefined') {
    RazorpayPayment.init();
  }
  
  // Brief loading screen delay for smooth UX
  setTimeout(() => init(), 400); // Keep the UX delay
});

// Auto-Sync when returning to the app from the background (Cross-device real-time sync)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && window.KFSync && isLoggedIn()) {
    KFSync.restore().then((res) => {
      if (res && state.page) {
        // Soft refresh the UI if data was pulled without interrupting the user
        navigateTo(state.page);
        updatePlanBanner();
      }
    });
  }
});
