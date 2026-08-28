/* SocialX Messages - with Photo / Video / Voice / File support */
document.addEventListener('DOMContentLoaded', () => {
  const currentUser = SocialX.getCurrentUser();
  if (!currentUser) return;

  const messagesView = document.getElementById('messagesView');
  const chatView = document.getElementById('chatView');
  const listEl = document.getElementById('conversationsList');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  const msgNav = document.getElementById('msgNav');
  const attachMenu = document.getElementById('attachMenu');
  const recordingInd = document.getElementById('recordingInd');

  let activeChatId = null;
  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;

  // ========== Conversations List ==========
  function renderConversations() {
    const convos = SocialX.getConversations(currentUser.id);
    if (!convos.length) {
      listEl.innerHTML = `
        <div class="empty-state">
          <h3>لا توجد محادثات</h3>
          <p>ابحث عن أصدقاء وابدأ محادثة من صفحة البحث أو الملف الشخصي</p>
          <button class="btn-primary" style="margin-top:16px;width:auto;padding:10px 24px" onclick="location.href='search.html'">ابحث عن أصدقاء</button>
        </div>`;
      return;
    }
    listEl.innerHTML = convos.map(({ otherId, lastMsg }) => {
      const other = SocialX.getUserById(otherId);
      if (!other) return '';
      let preview = lastMsg.text || '';
      if (lastMsg.type === 'image') preview = '📷 صورة';
      else if (lastMsg.type === 'video') preview = '🎬 فيديو';
      else if (lastMsg.type === 'voice') preview = '🎤 رسالة صوتية';
      else if (lastMsg.type === 'file') preview = '📎 ' + (lastMsg.fileName || 'ملف');
      return `
        <div class="conversation-item" data-id="${otherId}">
          <img src="${other.avatar}" alt="">
          <div class="conversation-info">
            <div class="conversation-top">
              <span class="conversation-name">${other.fullName || other.username}</span>
              <span class="conversation-time">${SocialX.timeAgo(lastMsg.createdAt)}</span>
            </div>
            <div class="conversation-preview">${lastMsg.fromId === currentUser.id ? 'أنت: ' : ''}${preview}</div>
          </div>
        </div>`;
    }).join('');

    listEl.querySelectorAll('.conversation-item').forEach(el => {
      el.addEventListener('click', () => openChat(el.dataset.id));
    });
  }

  // ========== Open Chat ==========
  function openChat(userId) {
    activeChatId = userId;
    const other = SocialX.getUserById(userId);
    if (!other) return;
    document.getElementById('chatAvatar').src = other.avatar;
    document.getElementById('chatName').textContent = other.fullName || other.username;
    messagesView.classList.add('hidden');
    chatView.classList.remove('hidden');
    msgNav.classList.add('hidden');
    attachMenu.classList.remove('show');
    renderChat();
  }

  // ========== Render Messages ==========
  function renderChat() {
    const msgs = SocialX.getChatMessages(currentUser.id, activeChatId);
    chatMessages.innerHTML = msgs.map(m => {
      const isMe = m.fromId === currentUser.id;
      let content = '';

      if (m.type === 'image') {
        content = `<div class="chat-media"><img src="${m.media}" alt="صورة" onclick="window.open(this.src)"></div>`;
        if (m.text) content += `<div style="margin-top:4px">${escapeHtml(m.text)}</div>`;
      } else if (m.type === 'video') {
        content = `<div class="chat-media"><video src="${m.media}" controls></video></div>`;
        if (m.text) content += `<div style="margin-top:4px">${escapeHtml(m.text)}</div>`;
      } else if (m.type === 'voice') {
        content = `
          <div class="voice-msg">
            <button onclick="playVoice(this, '${m.media}')">▶</button>
            <span>رسالة صوتية</span>
          </div>`;
      } else if (m.type === 'file') {
        content = `
          <div class="chat-file">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
            <div>
              <div style="font-weight:600;font-size:0.9rem">${escapeHtml(m.fileName || 'ملف')}</div>
              <a href="${m.media}" download="${m.fileName || 'file'}" style="font-size:0.8rem;color:var(--accent)">تحميل</a>
            </div>
          </div>`;
      } else {
        content = escapeHtml(m.text || '');
      }

      return `
        <div class="message-bubble ${isMe ? 'sent' : 'received'}">
          ${content}
          <div class="message-time">${SocialX.timeAgo(m.createdAt)}</div>
        </div>`;
    }).join('');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ========== Send Text ==========
  function sendText() {
    const text = chatInput.value.trim();
    if (!text || !activeChatId) return;
    SocialX.sendMessage(activeChatId, text, 'text');
    chatInput.value = '';
    renderChat();
    renderConversations();
  }

  // ========== Send Media ==========
  function sendMedia(type, dataUrl, extra = {}) {
    if (!activeChatId) return;
    SocialX.sendMessage(activeChatId, extra.caption || '', type, {
      media: dataUrl,
      fileName: extra.fileName || null
    });
    renderChat();
    renderConversations();
    SocialX.showToast(type === 'image' ? 'تم إرسال الصورة' : type === 'video' ? 'تم إرسال الفيديو' : type === 'voice' ? 'تم إرسال الرسالة الصوتية' : 'تم إرسال الملف');
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ========== Attach Menu ==========
  document.getElementById('attachBtn').addEventListener('click', () => {
    attachMenu.classList.toggle('show');
  });

  document.getElementById('btnPhoto').addEventListener('click', () => {
    attachMenu.classList.remove('show');
    document.getElementById('inputPhoto').click();
  });
  document.getElementById('btnVideo').addEventListener('click', () => {
    attachMenu.classList.remove('show');
    document.getElementById('inputVideo').click();
  });
  document.getElementById('btnFile').addEventListener('click', () => {
    attachMenu.classList.remove('show');
    document.getElementById('inputFile').click();
  });

  document.getElementById('inputPhoto').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await readFileAsDataURL(file);
    sendMedia('image', dataUrl);
    e.target.value = '';
  });

  document.getElementById('inputVideo').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      SocialX.showToast('الفيديو كبير جداً (الحد 15MB في النسخة التجريبية)');
      return;
    }
    const dataUrl = await readFileAsDataURL(file);
    sendMedia('video', dataUrl);
    e.target.value = '';
  });

  document.getElementById('inputFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      SocialX.showToast('الملف كبير جداً (الحد 10MB)');
      return;
    }
    const dataUrl = await readFileAsDataURL(file);
    sendMedia('file', dataUrl, { fileName: file.name });
    e.target.value = '';
  });

  // ========== Voice Recording ==========
  document.getElementById('btnVoice').addEventListener('click', async () => {
    attachMenu.classList.remove('show');
    if (isRecording) {
      stopRecording();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => sendMedia('voice', reader.result);
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      isRecording = true;
      recordingInd.classList.add('show');
      chatInput.style.display = 'none';
      SocialX.showToast('جاري التسجيل... اضغط مرة أخرى للإيقاف');
    } catch (err) {
      SocialX.showToast('لا يمكن الوصول للميكروفون');
      console.error(err);
    }
  });

  function stopRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      isRecording = false;
      recordingInd.classList.remove('show');
      chatInput.style.display = '';
    }
  }

  // Play voice
  window.playVoice = function(btn, dataUrl) {
    const audio = new Audio(dataUrl);
    btn.textContent = '⏸';
    audio.play();
    audio.onended = () => btn.textContent = '▶';
  };

  // ========== Events ==========
  chatSend.addEventListener('click', sendText);
  chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendText(); });

  document.getElementById('chatBack').addEventListener('click', () => {
    stopRecording();
    chatView.classList.add('hidden');
    messagesView.classList.remove('hidden');
    msgNav.classList.remove('hidden');
    activeChatId = null;
    renderConversations();
  });

  document.getElementById('newChatBtn').addEventListener('click', () => {
    location.href = 'search.html';
  });

  // Open from URL
  const params = new URLSearchParams(location.search);
  if (params.get('chat')) {
    openChat(params.get('chat'));
  } else {
    renderConversations();
  }
});
