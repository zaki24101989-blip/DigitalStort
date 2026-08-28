# SocialX 🚀

تطبيق تواصل اجتماعي احترافي مستوحى من إنستغرام، مبني بـ HTML + CSS + Vanilla JavaScript.

## المميزات

- واجهة حديثة (Mobile First + Dark Mode)
- تسجيل الدخول وإنشاء حساب بالإيميل
- منشورات + Stories + إعجابات + تعليقات
- رسائل مباشرة مع دعم:
  - نص
  - صور
  - فيديو
  - رسائل صوتية
  - ملفات
- بحث عن المستخدمين والمنشورات
- إشعارات
- PWA (قابل للتثبيت على الهاتف)
- جاهز للربط بـ Firebase

## التشغيل السريع

1. افتح `index.html` في المتصفح أو SPCK Editor
2. حساب تجريبي:
   - اسم المستخدم: `ahmed_dev`
   - كلمة المرور: `123456`

## الربط بـ Firebase

راجع ملف `README-Firebase.txt` للخطوات التفصيلية.

## التقنيات

- HTML5 / CSS3 / JavaScript (Vanilla)
- LocalStorage (نسخة تجريبية)
- Firebase (Auth + Firestore + Storage) - اختياري
- PWA (manifest + service worker)

## الهيكل

```
SocialX/
├── index.html
├── login.html / register.html
├── profile.html / search.html
├── messages.html / notifications.html
├── create.html / settings.html
├── style.css
├── script.js
├── auth.js / messages.js / ...
├── firebase.js
├── manifest.json
└── service-worker.js
```

## الترخيص

مفتوح للاستخدام الشخصي والتعليمي.
