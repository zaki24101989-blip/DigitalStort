document.addEventListener('DOMContentLoaded', () => {
  const currentUser = SocialX.getCurrentUser();
  if (!currentUser) return;
  SocialX.markNotificationsRead(currentUser.id);

  const list = document.getElementById('notifList');
  const notifs = SocialX.getNotificationsForUser(currentUser.id);

  if (!notifs.length) {
    list.innerHTML = '<div class="empty-state"><h3>لا توجد إشعارات</h3><p>ستظهر هنا الإعجابات والتعليقات والمتابعات</p></div>';
    return;
  }

  list.innerHTML = notifs.map(n => {
    const from = SocialX.getUserById(n.fromUserId);
    if (!from) return '';
    let text = '';
    if (n.type === 'like') text = `<strong>${from.username}</strong> أعجب بمنشورك`;
    else if (n.type === 'comment') text = `<strong>${from.username}</strong> علق: ${n.text || ''}`;
    else if (n.type === 'follow') text = `<strong>${from.username}</strong> بدأ بمتابعتك`;
    else if (n.type === 'message') text = `<strong>${from.username}</strong> أرسل رسالة: ${n.text || ''}`;
    else text = `<strong>${from.username}</strong> تفاعل معك`;

    const post = n.postId ? SocialX.getPostById(n.postId) : null;
    return `
      <div class="notif-item ${n.read ? '' : 'unread'}">
        <img class="notif-avatar" src="${from.avatar}" alt="">
        <div class="notif-content">
          <div class="notif-text">${text}</div>
          <div class="notif-time">${SocialX.timeAgo(n.createdAt)}</div>
        </div>
        ${post ? `<img class="notif-thumb" src="${post.image}" alt="">` : ''}
      </div>`;
  }).join('');
});
