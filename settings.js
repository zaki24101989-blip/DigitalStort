document.addEventListener('DOMContentLoaded', () => {
  const user = SocialX.getCurrentUser();
  if (!user) return;

  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  const switchEl = document.getElementById('themeSwitch');
  if (theme === 'dark') switchEl.classList.add('active');

  document.getElementById('darkModeToggle').addEventListener('click', () => {
    const next = SocialX.toggleTheme();
    switchEl.classList.toggle('active', next === 'dark');
    SocialX.showToast(next === 'dark' ? 'الوضع الداكن مفعّل' : 'الوضع الفاتح مفعّل');
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('هل تريد تسجيل الخروج؟')) SocialX.logout();
  });

  // Edit Profile
  const editModal = document.getElementById('editModal');
  document.getElementById('editProfileBtn').addEventListener('click', () => {
    document.getElementById('editFullName').value = user.fullName || '';
    document.getElementById('editBio').value = user.bio || '';
    editModal.classList.add('show');
  });
  document.getElementById('cancelEdit').addEventListener('click', () => editModal.classList.remove('show'));
  editModal.addEventListener('click', (e) => { if (e.target === editModal) editModal.classList.remove('show'); });

  document.getElementById('saveProfileBtn').addEventListener('click', () => {
    const fullName = document.getElementById('editFullName').value.trim();
    const bio = document.getElementById('editBio').value.trim();
    SocialX.updateUser(user.id, { fullName, bio });
    editModal.classList.remove('show');
    SocialX.showToast('تم حفظ التعديلات');
  });
});
