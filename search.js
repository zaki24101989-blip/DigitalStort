document.addEventListener('DOMContentLoaded', () => {
  const currentUser = SocialX.getCurrentUser();
  if (!currentUser) return;
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  const suggested = document.getElementById('suggestedUsers');

  function renderUsers(users) {
    return users.map(u => `
      <a href="profile.html?u=${u.username}" class="user-result">
        <img src="${u.avatar}" alt="">
        <div class="user-result-info">
          <div class="user-result-name">${u.username}</div>
          <div class="user-result-bio">${u.fullName} · ${u.bio ? u.bio.split('\\n')[0].slice(0,40) : ''}</div>
        </div>
      </a>`).join('');
  }

  // Suggested
  const others = SocialX.getUsers().filter(u => u.id !== currentUser.id);
  suggested.innerHTML = renderUsers(others);

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      results.innerHTML = `<div class="search-section-title">مستخدمون مقترحون</div><div id="suggestedUsers">${renderUsers(others)}</div>`;
      return;
    }
    const matchedUsers = SocialX.getUsers().filter(u =>
      u.username.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q)
    );
    const matchedPosts = SocialX.getPosts().filter(p =>
      (p.caption || '').toLowerCase().includes(q) || (p.hashtags || []).some(h => h.toLowerCase().includes(q))
    );
    let html = '';
    if (matchedUsers.length) {
      html += `<div class="search-section-title">المستخدمون</div>${renderUsers(matchedUsers)}`;
    }
    if (matchedPosts.length) {
      html += `<div class="search-section-title">المنشورات</div>`;
      html += matchedPosts.slice(0, 10).map(p => {
        const author = SocialX.getUserById(p.userId);
        return `<a href="index.html" class="user-result">
          <img src="${p.image}" alt="" style="border-radius:8px;width:48px;height:48px">
          <div class="user-result-info">
            <div class="user-result-name">@${author ? author.username : ''}</div>
            <div class="user-result-bio">${(p.caption || '').slice(0, 60)}</div>
          </div>
        </a>`;
      }).join('');
    }
    if (!matchedUsers.length && !matchedPosts.length) {
      html = '<div class="empty-state"><h3>لا توجد نتائج</h3><p>جرب كلمات أخرى</p></div>';
    }
    results.innerHTML = html;
  });
});
