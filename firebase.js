/* ============================================
   SocialX - Firebase Full Integration
   ============================================
   
   الخطوات:
   1. اذهب إلى https://console.firebase.google.com
   2. اضغط "إضافة مشروع" → اختر اسم (مثل SocialX)
   3. عطّل Google Analytics إن أردت
   4. بعد إنشاء المشروع:
      - من القائمة اليسرى: Build → Authentication → Get started
        → Sign-in method → Email/Password → Enable → Save
      - Build → Firestore Database → Create database → Start in test mode
      - Build → Storage → Get started → Start in test mode
   5. اضغط ⚙️ Project settings → Your apps → Web (</>) 
      → Register app → انسخ الـ firebaseConfig
   6. ضع القيم الحقيقية مكان YOUR_... أدناه
   7. غيّر USE_FIREBASE إلى true
*/

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ← غيّر هذا إلى true بعد وضع الإعدادات الصحيحة
const USE_FIREBASE = false;

let fbApp = null;
let fbAuth = null;
let fbDB = null;
let fbStorage = null;

async function initFirebase() {
  if (!USE_FIREBASE) {
    console.log("Firebase معطل - يعمل بـ LocalStorage");
    return false;
  }
  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.warn("ضع إعدادات Firebase الحقيقية أولاً");
    return false;
  }
  try {
    // استخدام Firebase عبر CDN (modular)
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
    const { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
    const { getFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, updateDoc, arrayUnion } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    const { getStorage, ref, uploadBytes, getDownloadURL } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js");

    fbApp = initializeApp(firebaseConfig);
    fbAuth = getAuth(fbApp);
    fbDB = getFirestore(fbApp);
    fbStorage = getStorage(fbApp);

    // تصدير الدوال للاستخدام
    window.FB = {
      auth: fbAuth,
      db: fbDB,
      storage: fbStorage,
      onAuthStateChanged,
      createUserWithEmailAndPassword,
      signInWithEmailAndPassword,
      signOut,
      updateProfile,
      collection, doc, setDoc, getDoc, getDocs, addDoc,
      query, where, orderBy, onSnapshot, serverTimestamp, updateDoc, arrayUnion,
      ref, uploadBytes, getDownloadURL
    };

    console.log("Firebase جاهز ✅");
    return true;
  } catch (err) {
    console.error("خطأ في تهيئة Firebase:", err);
    return false;
  }
}

// تشغيل التهيئة
window.firebaseReady = initFirebase();
