document.addEventListener('DOMContentLoaded', () => {
  const currentUser = SocialX.getCurrentUser();
  if (!currentUser) return;

  const params = new URLSearchParams(location.search);
  const username = params.get('u');
  let profileUser = username ? SocialX.getUserByUsername(username) : currentUser;
  if (!profileUser) profileUser = currentUser;

  const isOwn = profileUser.id === currentUser.id;
  document.getElementById('profileTitle').textContent = profileUser.username;
  if (!isOwn) {
    document.getElementById('backBtn').style.display = 'flex';
    document.getElementById('settingsBtn').style.display = 'none';
  }

  const posts = SocialX.getPostsByUser(profileUser.id);
  const followers = SocialX.getFollowersCount(profileUser.id);
  const following = SocialX.getFollowingCount(profileUser.id);
  const isFollowing = SocialX.isFollowing(profileUser.id);

  const content = document.getElementById('profileContent');
  content.innerHTML = `
    <div class="profile-header">
      <div class="profile-top">
        <img class="profile-avatar-lg" src="${profileUser.avatar}" alt="">
        <div class="profile-stats">
          <div class="stat-item"><span class="stat-number">${posts.length}</span><span class="stat-label">منشورات</span></div>
          <div class="stat-item"><span class="stat-number">${SocialX.formatNumber(followers)}</span><span class="stat-label">متابعون</span></div>
          <div class="stat-item"><span class="stat-number">${SocialX.formatNumber(following)}</span><span class="stat-label">يتابع</span></div>
        </div>
      </div>
      <div class="profile-info">
        <div class="profile-name">${profileUser.fullName}</div>
        <div class="profile-bio">${profileUser.bio || ''}</div>
      </div>
      <div class="profile-actions" id="profileActions">
        ${isOwn
          ? `<a href="settings.html" class="btn-outline">تعديل الملف الشخصي</a>`
          : `<button class="btn-follow ${isFollowing ? 'following' : ''}" id="followBtn">${isFollowing ? 'يتابع' : 'متابعة'}</button>
             <a href="messages.html?chat=${profileUser.id}" class="btn-outline">رسالة</a>`
        }
      </div>
    </div>
    <div class="profile-tabs">
      <div class="profile-tab active">${SocialX.icons.grid}</div>
    </div>
    <div class="posts-grid" id="postsGrid">
      ${posts.length === 0
        ? '<div class="empty-state" style="grid-column:1/-1"><h3>لا توجد منشورات</h3></div>'
        : posts.map(p => `
          <div class="grid-item" onclick="location.href='index.html'">
            <img src="${p.image}" alt="" loading="lazy">
          </div>`).join('')
      }
    </div>
  `;

  const followBtn = document.getElementById('followBtn');
  if (followBtn) {
    followBtn.addEventListener('click', () => {
      const nowFollowing = SocialX.toggleFollow(profileUser.id);
      followBtn.classList.toggle('following', nowFollowing);
      followBtn.textContent = nowFollowing ? 'يتابع' : 'متابعة';
      // update count
      const stats = content.querySelectorAll('.stat-number');
      if (stats[1]) stats[1].textContent = SocialX.formatNumber(SocialX.getFollowersCount(profileUser.id));
      SocialX.showToast(nowFollowing ? 'تمت المتابعة' : 'تم إلغاء المتابعة');
    });
  }
});
