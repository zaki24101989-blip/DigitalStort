/* SocialX Core - LocalStorage Demo */
const SocialX = {
  KEYS: { USERS:'sx_users', POSTS:'sx_posts', CURRENT_USER:'sx_current_user', LIKES:'sx_likes', COMMENTS:'sx_comments', FOLLOWS:'sx_follows', SAVED:'sx_saved', MESSAGES:'sx_messages', NOTIFICATIONS:'sx_notifications', THEME:'sx_theme' },
  init(){ this.applyTheme(); this.seedDataIfNeeded(); this.checkAuth(); },
  applyTheme(){ document.documentElement.setAttribute('data-theme', localStorage.getItem(this.KEYS.THEME)||'light'); },
  toggleTheme(){ const n=(document.documentElement.getAttribute('data-theme')||'light')==='light'?'dark':'light'; document.documentElement.setAttribute('data-theme',n); localStorage.setItem(this.KEYS.THEME,n); return n; },
  getCurrentUser(){ const id=localStorage.getItem(this.KEYS.CURRENT_USER); return id?this.getUserById(id):null; },
  setCurrentUser(id){ localStorage.setItem(this.KEYS.CURRENT_USER,id); },
  logout(){ localStorage.removeItem(this.KEYS.CURRENT_USER); location.href='login.html'; },
  checkAuth(){ const path=location.pathname.split('/').pop()||'index.html'; const pub=['login.html','register.html']; const u=this.getCurrentUser(); if(!u&&!pub.includes(path)){location.href='login.html';return false;} if(u&&pub.includes(path)){location.href='index.html';return false;} return true; },
  getUsers(){ return JSON.parse(localStorage.getItem(this.KEYS.USERS)||'[]'); },
  saveUsers(u){ localStorage.setItem(this.KEYS.USERS,JSON.stringify(u)); },
  getUserById(id){ return this.getUsers().find(u=>u.id===id)||null; },
  getUserByUsername(n){ return this.getUsers().find(u=>u.username.toLowerCase()===n.toLowerCase())||null; },
  updateUser(id,up){ const us=this.getUsers(); const i=us.findIndex(u=>u.id===id); if(i<0)return null; us[i]={...us[i],...up}; this.saveUsers(us); return us[i]; },
  getPosts(){ return JSON.parse(localStorage.getItem(this.KEYS.POSTS)||'[]'); },
  savePosts(p){ localStorage.setItem(this.KEYS.POSTS,JSON.stringify(p)); },
  getPostById(id){ return this.getPosts().find(p=>p.id===id)||null; },
  getPostsByUser(uid){ return this.getPosts().filter(p=>p.userId===uid).sort((a,b)=>b.createdAt-a.createdAt); },
  createPost(d){ const posts=this.getPosts(); const p={id:'post_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),userId:this.getCurrentUser().id,image:d.image,caption:d.caption||'',hashtags:d.hashtags||[],createdAt:Date.now(),likesCount:0,commentsCount:0}; posts.unshift(p); this.savePosts(posts); return p; },
  deletePost(id){ this.savePosts(this.getPosts().filter(p=>p.id!==id)); this.removeLikesForPost(id); this.removeCommentsForPost(id); this.removeSavedForPost(id); },
  getLikes(){ return JSON.parse(localStorage.getItem(this.KEYS.LIKES)||'[]'); },
  saveLikes(l){ localStorage.setItem(this.KEYS.LIKES,JSON.stringify(l)); },
  isLiked(pid,uid=null){ const u=uid||this.getCurrentUser()?.id; return u?this.getLikes().some(l=>l.postId===pid&&l.userId===u):false; },
  toggleLike(pid){ const user=this.getCurrentUser(); if(!user)return false; let likes=this.getLikes(); const ex=likes.find(l=>l.postId===pid&&l.userId===user.id); const posts=this.getPosts(); const i=posts.findIndex(p=>p.id===pid); if(ex){ likes=likes.filter(l=>!(l.postId===pid&&l.userId===user.id)); if(i>=0)posts[i].likesCount=Math.max(0,(posts[i].likesCount||0)-1); } else { likes.push({postId:pid,userId:user.id,createdAt:Date.now()}); if(i>=0){ posts[i].likesCount=(posts[i].likesCount||0)+1; if(posts[i].userId!==user.id) this.addNotification({type:'like',fromUserId:user.id,toUserId:posts[i].userId,postId:pid,createdAt:Date.now()}); } } this.saveLikes(likes); this.savePosts(posts); return !ex; },
  removeLikesForPost(id){ this.saveLikes(this.getLikes().filter(l=>l.postId!==id)); },
  getComments(){ return JSON.parse(localStorage.getItem(this.KEYS.COMMENTS)||'[]'); },
  saveComments(c){ localStorage.setItem(this.KEYS.COMMENTS,JSON.stringify(c)); },
  getCommentsForPost(pid){ return this.getComments().filter(c=>c.postId===pid).sort((a,b)=>a.createdAt-b.createdAt); },
  addComment(pid,text){ const user=this.getCurrentUser(); if(!user||!text.trim())return null; const comments=this.getComments(); const c={id:'cmt_'+Date.now(),postId:pid,userId:user.id,text:text.trim(),createdAt:Date.now()}; comments.push(c); this.saveComments(comments); const posts=this.getPosts(); const i=posts.findIndex(p=>p.id===pid); if(i>=0){ posts[i].commentsCount=(posts[i].commentsCount||0)+1; this.savePosts(posts); if(posts[i].userId!==user.id) this.addNotification({type:'comment',fromUserId:user.id,toUserId:posts[i].userId,postId:pid,text:text.trim().slice(0,50),createdAt:Date.now()}); } return c; },
  removeCommentsForPost(id){ this.saveComments(this.getComments().filter(c=>c.postId!==id)); },
  getFollows(){ return JSON.parse(localStorage.getItem(this.KEYS.FOLLOWS)||'[]'); },
  saveFollows(f){ localStorage.setItem(this.KEYS.FOLLOWS,JSON.stringify(f)); },
  isFollowing(tid,uid=null){ const u=uid||this.getCurrentUser()?.id; return u?this.getFollows().some(f=>f.followerId===u&&f.followingId===tid):false; },
  toggleFollow(tid){ const user=this.getCurrentUser(); if(!user||user.id===tid)return false; let follows=this.getFollows(); const ex=follows.find(f=>f.followerId===user.id&&f.followingId===tid); if(ex) follows=follows.filter(f=>!(f.followerId===user.id&&f.followingId===tid)); else { follows.push({followerId:user.id,followingId:tid,createdAt:Date.now()}); this.addNotification({type:'follow',fromUserId:user.id,toUserId:tid,createdAt:Date.now()}); } this.saveFollows(follows); return !ex; },
  getFollowersCount(uid){ return this.getFollows().filter(f=>f.followingId===uid).length; },
  getFollowingCount(uid){ return this.getFollows().filter(f=>f.followerId===uid).length; },
  getSaved(){ return JSON.parse(localStorage.getItem(this.KEYS.SAVED)||'[]'); },
  saveSaved(s){ localStorage.setItem(this.KEYS.SAVED,JSON.stringify(s)); },
  isSaved(pid){ const u=this.getCurrentUser(); return u?this.getSaved().some(s=>s.postId===pid&&s.userId===u.id):false; },
  toggleSave(pid){ const user=this.getCurrentUser(); if(!user)return false; let saved=this.getSaved(); const ex=saved.find(s=>s.postId===pid&&s.userId===user.id); if(ex) saved=saved.filter(s=>!(s.postId===pid&&s.userId===user.id)); else saved.push({postId:pid,userId:user.id,createdAt:Date.now()}); this.saveSaved(saved); return !ex; },
  removeSavedForPost(id){ this.saveSaved(this.getSaved().filter(s=>s.postId!==id)); },
  getMessages(){ return JSON.parse(localStorage.getItem(this.KEYS.MESSAGES)||'[]'); },
  saveMessages(m){ localStorage.setItem(this.KEYS.MESSAGES,JSON.stringify(m)); },
  getConversations(uid){ const msgs=this.getMessages(); const map={}; msgs.forEach(m=>{ if(m.fromId!==uid&&m.toId!==uid)return; const o=m.fromId===uid?m.toId:m.fromId; if(!map[o]||m.createdAt>map[o].createdAt) map[o]=m; }); return Object.entries(map).map(([otherId,lastMsg])=>({otherId,lastMsg})).sort((a,b)=>b.lastMsg.createdAt-a.lastMsg.createdAt); },
  getChatMessages(u1,u2){ return this.getMessages().filter(m=>(m.fromId===u1&&m.toId===u2)||(m.fromId===u2&&m.toId===u1)).sort((a,b)=>a.createdAt-b.createdAt); },
  sendMessage(toId,text,type="text",extra={}){ const user=this.getCurrentUser(); if(!user)return null; if(type==="text"&&!text.trim())return null; const msgs=this.getMessages(); const msg={id:"msg_"+Date.now(),fromId:user.id,toId,text:(text||"").trim(),type:type||"text",media:extra.media||null,fileName:extra.fileName||null,createdAt:Date.now(),read:false}; msgs.push(msg); this.saveMessages(msgs); let notifText=text?text.slice(0,40):(type==="image"?"صورة":type==="video"?"فيديو":type==="voice"?"رسالة صوتية":"ملف"); this.addNotification({type:"message",fromUserId:user.id,toUserId:toId,text:notifText,createdAt:Date.now()}); return msg; },
  getNotifications(){ return JSON.parse(localStorage.getItem(this.KEYS.NOTIFICATIONS)||'[]'); },
  saveNotifications(n){ localStorage.setItem(this.KEYS.NOTIFICATIONS,JSON.stringify(n)); },
  addNotification(n){ const notifs=this.getNotifications(); notifs.unshift({id:'notif_'+Date.now(),...n,read:false}); this.saveNotifications(notifs.slice(0,100)); },
  getNotificationsForUser(uid){ return this.getNotifications().filter(n=>n.toUserId===uid).sort((a,b)=>b.createdAt-a.createdAt); },
  markNotificationsRead(uid){ this.saveNotifications(this.getNotifications().map(n=>{ if(n.toUserId===uid)n.read=true; return n; })); },
  getUnreadCount(uid){ return this.getNotifications().filter(n=>n.toUserId===uid&&!n.read).length; },
  timeAgo(ts){ const s=Math.floor((Date.now()-ts)/1000); if(s<60)return 'الآن'; const m=Math.floor(s/60); if(m<60)return `منذ ${m} د`; const h=Math.floor(m/60); if(h<24)return `منذ ${h} س`; const d=Math.floor(h/24); if(d<7)return `منذ ${d} ي`; return new Date(ts).toLocaleDateString('ar-EG'); },
  formatNumber(n){ if(n>=1e6)return (n/1e6).toFixed(1)+'M'; if(n>=1e3)return (n/1e3).toFixed(1)+'K'; return String(n); },
  showToast(msg,dur=2500){ let t=document.querySelector('.toast'); if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t);} t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),dur); },
  icons: {
    home:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    search:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    create:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    heart:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
    heartFilled:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
    comment:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
    share:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
    bookmark:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>`,
    bookmarkFilled:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>`,
    message:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>`,
    user:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    more:`<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>`,
    send:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
    back:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>`,
    camera:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
    grid:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    settings:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
    logout:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    moon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`,
    sun:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
  },
  seedDataIfNeeded(){
    if(localStorage.getItem(this.KEYS.USERS)) return;
    const users=[
      {id:'user_1',username:'ahmed_dev',fullName:'أحمد محمد',email:'ahmed@socialx.com',password:'123456',bio:'مطور ويب | عاشق التقنية 🚀\nCairo, Egypt',avatar:'https://i.pravatar.cc/150?u=ahmed',createdAt:Date.now()-86400000*30},
      {id:'user_2',username:'sara_design',fullName:'سارة علي',email:'sara@socialx.com',password:'123456',bio:'UI/UX Designer ✨\nتصميم جميل = تجربة أفضل',avatar:'https://i.pravatar.cc/150?u=sara',createdAt:Date.now()-86400000*25},
      {id:'user_3',username:'omar_photo',fullName:'عمر حسن',email:'omar@socialx.com',password:'123456',bio:'مصور محترف 📸',avatar:'https://i.pravatar.cc/150?u=omar',createdAt:Date.now()-86400000*20},
      {id:'user_4',username:'layla_travel',fullName:'ليلى أحمد',email:'layla@socialx.com',password:'123456',bio:'رحّالة 🌍 | أستكشف العالم',avatar:'https://i.pravatar.cc/150?u=layla',createdAt:Date.now()-86400000*15},
      {id:'user_5',username:'youssef_fit',fullName:'يوسف كريم',email:'youssef@socialx.com',password:'123456',bio:'مدرب لياقة 💪',avatar:'https://i.pravatar.cc/150?u=youssef',createdAt:Date.now()-86400000*10}
    ];
    const posts=[
      {id:'post_1',userId:'user_2',image:'https://picsum.photos/seed/design1/600/600',caption:'تصميم جديد لتطبيق موبايل 💜 #UI #Design #SocialX',hashtags:['UI','Design','SocialX'],createdAt:Date.now()-7200000,likesCount:42,commentsCount:5},
      {id:'post_2',userId:'user_3',image:'https://picsum.photos/seed/photo1/600/600',caption:'غروب الشمس في الصحراء 🌅 #Photography #Nature',hashtags:['Photography','Nature'],createdAt:Date.now()-18000000,likesCount:128,commentsCount:12},
      {id:'post_3',userId:'user_1',image:'https://picsum.photos/seed/code1/600/600',caption:'ليلة كود طويلة لكن النتيجة تستحق 🔥 #Coding #WebDev',hashtags:['Coding','WebDev'],createdAt:Date.now()-28800000,likesCount:67,commentsCount:8},
      {id:'post_4',userId:'user_4',image:'https://picsum.photos/seed/travel1/600/600',caption:'من رحلاتي الأخيرة في إسطنبول 🇹🇷 #Travel #Istanbul',hashtags:['Travel','Istanbul'],createdAt:Date.now()-43200000,likesCount:215,commentsCount:23},
      {id:'post_5',userId:'user_5',image:'https://picsum.photos/seed/fit1/600/600',caption:'تمرين اليوم مكتمل ✅ #Fitness #Motivation',hashtags:['Fitness','Motivation'],createdAt:Date.now()-64800000,likesCount:89,commentsCount:7},
      {id:'post_6',userId:'user_2',image:'https://picsum.photos/seed/design2/600/600',caption:'لوحة ألوان جديدة 🎨 #ColorPalette',hashtags:['ColorPalette'],createdAt:Date.now()-86400000,likesCount:56,commentsCount:4},
      {id:'post_7',userId:'user_3',image:'https://picsum.photos/seed/photo2/600/600',caption:'شارع قديم في القاهرة 🏛️ #Cairo',hashtags:['Cairo'],createdAt:Date.now()-172800000,likesCount:174,commentsCount:15},
      {id:'post_8',userId:'user_4',image:'https://picsum.photos/seed/travel2/600/600',caption:'جبال الأطلس من الأعلى ⛰️ #Mountains',hashtags:['Mountains'],createdAt:Date.now()-259200000,likesCount:301,commentsCount:31}
    ];
    const follows=[{followerId:'user_1',followingId:'user_2',createdAt:Date.now()-432000000},{followerId:'user_1',followingId:'user_3',createdAt:Date.now()-345600000},{followerId:'user_1',followingId:'user_4',createdAt:Date.now()-259200000},{followerId:'user_2',followingId:'user_1',createdAt:Date.now()-432000000},{followerId:'user_3',followingId:'user_1',createdAt:Date.now()-172800000},{followerId:'user_5',followingId:'user_1',createdAt:Date.now()-86400000}];
    const likes=[{postId:'post_1',userId:'user_1',createdAt:Date.now()-3600000},{postId:'post_2',userId:'user_1',createdAt:Date.now()-7200000},{postId:'post_4',userId:'user_1',createdAt:Date.now()-10000000}];
    const comments=[{id:'cmt_1',postId:'post_1',userId:'user_1',text:'تصميم رائع! 🔥',createdAt:Date.now()-3000000},{id:'cmt_2',postId:'post_1',userId:'user_3',text:'الألوان متناسقة جداً',createdAt:Date.now()-2500000},{id:'cmt_3',postId:'post_2',userId:'user_2',text:'صورة مذهلة 😍',createdAt:Date.now()-4000000},{id:'cmt_4',postId:'post_4',userId:'user_1',text:'أتمنى أزور إسطنبول قريباً',createdAt:Date.now()-8000000}];
    const messages=[{id:'msg_1',fromId:'user_2',toId:'user_1',text:'مرحبا أحمد! كيف حال المشروع؟',createdAt:Date.now()-7200000,read:true},{id:'msg_2',fromId:'user_1',toId:'user_2',text:'أهلا سارة، تمام الحمد لله 👍',createdAt:Date.now()-7000000,read:true},{id:'msg_3',fromId:'user_2',toId:'user_1',text:'أرسلت لك التصميم الجديد',createdAt:Date.now()-3600000,read:false},{id:'msg_4',fromId:'user_3',toId:'user_1',text:'هل تريد صور للموقع؟',createdAt:Date.now()-86400000,read:true}];
    const notifications=[{id:'notif_1',type:'like',fromUserId:'user_2',toUserId:'user_1',postId:'post_3',createdAt:Date.now()-1800000,read:false},{id:'notif_2',type:'comment',fromUserId:'user_3',toUserId:'user_1',postId:'post_3',text:'كود نظيف جداً',createdAt:Date.now()-3600000,read:false},{id:'notif_3',type:'follow',fromUserId:'user_5',toUserId:'user_1',createdAt:Date.now()-7200000,read:true},{id:'notif_4',type:'message',fromUserId:'user_2',toUserId:'user_1',text:'أرسلت لك التصميم الجديد',createdAt:Date.now()-3600000,read:false}];
    this.saveUsers(users); this.savePosts(posts); this.saveFollows(follows); this.saveLikes(likes); this.saveComments(comments); this.saveMessages(messages); this.saveNotifications(notifications);
  }
};
document.addEventListener('DOMContentLoaded',()=>SocialX.init());

// PWA Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(err => console.log('SW reg failed', err));
  });
}
