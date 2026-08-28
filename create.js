document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const previewImg = document.getElementById('previewImg');
  const placeholder = document.getElementById('placeholder');
  const shareBtn = document.getElementById('shareBtn');
  const caption = document.getElementById('caption');
  let imageData = null;

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      imageData = ev.target.result;
      previewImg.src = imageData;
      previewImg.style.display = 'block';
      placeholder.style.display = 'none';
      shareBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  });

  caption.addEventListener('input', () => {
    const tags = (caption.value.match(/#\w+/g) || []).map(t => t.slice(1));
    document.getElementById('hashtagPreview').textContent = tags.length ? tags.join(', ') : '';
  });

  shareBtn.addEventListener('click', () => {
    if (!imageData) return;
    const text = caption.value.trim();
    const hashtags = (text.match(/#\w+/g) || []).map(t => t.slice(1));
    SocialX.createPost({ image: imageData, caption: text, hashtags });
    SocialX.showToast('تم نشر المنشور!');
    setTimeout(() => location.href = 'index.html', 700);
  });
});
