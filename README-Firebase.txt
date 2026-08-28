========================================
  SocialX - دليل ربط Firebase
========================================

الهدف: تخلي أنت وأصدقاؤك تسجلون بالإيميل وتتكلمون مع بعض
من أي جهاز (موبايل أو كمبيوتر).

----------------------------------------
الخطوات بالتفصيل:
----------------------------------------

1) اذهب إلى الموقع:
   https://console.firebase.google.com

2) اضغط "إضافة مشروع" (Add project)
   - اختر اسم: SocialX
   - عطّل Google Analytics إن أردت
   - اضغط إنشاء

3) بعد ما يفتح المشروع:

   أ) Authentication:
      - من القائمة اليسرى: Build → Authentication
      - Get started
      - Sign-in method
      - Email/Password → Enable → Save

   ب) Firestore Database:
      - Build → Firestore Database
      - Create database
      - Start in test mode (للاختبار)
      - اختر أقرب موقع (europe-west أو me-central)

   ج) Storage:
      - Build → Storage
      - Get started
      - Start in test mode

4) انسخ الإعدادات:
   - اضغط ⚙️ (Project settings) أعلى اليسار
   - انزل لـ "Your apps"
   - اضغط أيقونة Web </>
   - Register app (اسم اختياري)
   - انسخ كائن firebaseConfig كاملاً

5) افتح ملف firebase.js في المشروع
   - ضع القيم الحقيقية مكان YOUR_API_KEY وغيرها
   - غيّر السطر:
     const USE_FIREBASE = false;
     إلى:
     const USE_FIREBASE = true;

6) احفظ الملفات وارفعها على استضافة
   (Netlify / GitHub Pages / Firebase Hosting)
   لأن Firebase ما يشتغل من file:// مباشرة في بعض الحالات.

----------------------------------------
قواعد الأمان (لاحقاً):
----------------------------------------
بعد ما تخلص الاختبار، غيّر قواعد Firestore و Storage
من "test mode" إلى قواعد آمنة.

----------------------------------------
الحساب التجريبي المحلي (بدون Firebase):
----------------------------------------
اسم المستخدم: ahmed_dev
كلمة المرور: 123456

========================================
