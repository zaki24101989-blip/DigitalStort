/* Auth Logic - Supports both LocalStorage & Firebase */
document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // انتظار Firebase إن كان مفعلاً
  let useFB = false;
  try {
    useFB = await window.firebaseReady;
  } catch(e) {}

  // ========== LOGIN ==========
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usernameOrEmail = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value;
      const errorEl = document.getElementById('loginError');
      const btn = document.getElementById('loginBtn');
      errorEl.classList.remove('show');
      btn.disabled = true;
      btn.textContent = 'جاري الدخول...';

      try {
        if (useFB && window.FB) {
          // Firebase Auth
          const email = usernameOrEmail.includes('@') ? usernameOrEmail : usernameOrEmail + '@socialx.app';
          const cred = await window.FB.signInWithEmailAndPassword(window.FB.auth, email, password);
          localStorage.setItem('sx_current_user', cred.user.uid);
          SocialX.showToast('مرحبًا بك!');
          setTimeout(() => location.href = 'index.html', 400);
        } else {
          // LocalStorage
          let user = SocialX.getUserByUsername(usernameOrEmail);
          if (!user) {
            user = SocialX.getUsers().find(u => u.email && u.email.toLowerCase() === usernameOrEmail.toLowerCase());
          }
          if (!user || user.password !== password) {
            throw new Error('البريد أو كلمة المرور غير صحيحة');
          }
          SocialX.setCurrentUser(user.id);
          SocialX.showToast('مرحبًا ' + (user.fullName || user.username));
          setTimeout(() => location.href = 'index.html', 400);
        }
      } catch (err) {
        errorEl.textContent = err.message || 'حدث خطأ، حاول مرة أخرى';
        errorEl.classList.add('show');
        btn.disabled = false;
        btn.textContent = 'تسجيل الدخول';
      }
    });
  }

  // ========== REGISTER ==========
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('regFullName').value.trim();
      const username = document.getElementById('regUsername').value.trim().toLowerCase().replace(/\s+/g, '_');
      const email = document.getElementById('regEmail').value.trim().toLowerCase();
      const password = document.getElementById('regPassword').value;
      const errorEl = document.getElementById('registerError');
      const btn = document.getElementById('registerBtn');
      errorEl.classList.remove('show');

      if (username.length < 3) {
        errorEl.textContent = 'اسم المستخدم 3 أحرف على الأقل';
        errorEl.classList.add('show');
        return;
      }
      if (!email.includes('@')) {
        errorEl.textContent = 'أدخل بريد إلكتروني صحيح';
        errorEl.classList.add('show');
        return;
      }
      if (password.length < 6) {
        errorEl.textContent = 'كلمة المرور 6 أحرف على الأقل';
        errorEl.classList.add('show');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'جاري الإنشاء...';

      try {
        if (useFB && window.FB) {
          // Firebase
          const cred = await window.FB.createUserWithEmailAndPassword(window.FB.auth, email, password);
          await window.FB.updateProfile(cred.user, { displayName: fullName });
          
          // حفظ بيانات المستخدم في Firestore
          await window.FB.setDoc(window.FB.doc(window.FB.db, 'users', cred.user.uid), {
            uid: cred.user.uid,
            username,
            fullName,
            email,
            bio: '',
            avatar: 'https://i.pravatar.cc/150?u=' + encodeURIComponent(username),
            createdAt: window.FB.serverTimestamp(),
            followers: [],
            following: []
          });

          localStorage.setItem('sx_current_user', cred.user.uid);
          SocialX.showToast('تم إنشاء الحساب بنجاح!');
          setTimeout(() => location.href = 'index.html', 500);
        } else {
          // LocalStorage
          if (SocialX.getUserByUsername(username)) {
            throw new Error('اسم المستخدم مستخدم بالفعل');
          }
          if (SocialX.getUsers().some(u => u.email && u.email.toLowerCase() === email)) {
            throw new Error('هذا البريد مستخدم بالفعل');
          }
          const users = SocialX.getUsers();
          const newUser = {
            id: 'user_' + Date.now(),
            username, fullName, email, password,
            bio: '',
            avatar: 'https://i.pravatar.cc/150?u=' + encodeURIComponent(username),
            createdAt: Date.now()
          };
          users.push(newUser);
          SocialX.saveUsers(users);
          SocialX.setCurrentUser(newUser.id);
          SocialX.showToast('تم إنشاء الحساب بنجاح!');
          setTimeout(() => location.href = 'index.html', 500);
        }
      } catch (err) {
        let msg = err.message || 'حدث خطأ';
        if (msg.includes('email-already-in-use')) msg = 'هذا البريد مستخدم بالفعل';
        if (msg.includes('weak-password')) msg = 'كلمة المرور ضعيفة';
        if (msg.includes('invalid-email')) msg = 'بريد إلكتروني غير صالح';
        errorEl.textContent = msg;
        errorEl.classList.add('show');
        btn.disabled = false;
        btn.textContent = 'إنشاء حساب';
      }
    });
  }
});
