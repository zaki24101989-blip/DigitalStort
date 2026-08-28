/* ============================================
   SocialX - Firebase Full Integration
   ============================================ */

const firebaseConfig = {
  apiKey: "AIzaSyChOL61gLfbX6re7FTGJj83exz6_3-NH-I",
  authDomain: "socialx-3c75e.firebaseapp.com",
  projectId: "socialx-3c75e",
  storageBucket: "socialx-3c75e.firebasestorage.app",
  messagingSenderId: "158160318590",
  appId: "1:158160318590:web:ff5f61408a9a4c9e38e82f",
  measurementId: "G-RWXJDZ1DWB"
};

// ← تم التفعيل
const USE_FIREBASE = true;

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
