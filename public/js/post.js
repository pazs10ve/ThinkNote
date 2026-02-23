// post.js — client-side interactions for post detail page

// ── Like button ───────────────────────────────────
const likeBtn = document.getElementById('likeBtn');
if (likeBtn) {
  likeBtn.addEventListener('click', async () => {
    const postId = likeBtn.dataset.postId;
    const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      document.getElementById('likeCount').textContent = data.likeCount;
      likeBtn.classList.toggle('active', data.liked);
    }
  });
}

// ── Bookmark button ───────────────────────────────
const bookmarkBtn = document.getElementById('bookmarkBtn');
if (bookmarkBtn) {
  bookmarkBtn.addEventListener('click', async () => {
    const postId = bookmarkBtn.dataset.postId;
    const res = await fetch(`/api/posts/${postId}/bookmark`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      bookmarkBtn.textContent = data.bookmarked ? '🔖 Saved' : '🔖 Save';
      bookmarkBtn.classList.toggle('active', data.bookmarked);
    }
  });
}

// ── Follow button ─────────────────────────────────
const followBtn = document.getElementById('followBtn');
if (followBtn) {
  followBtn.addEventListener('click', async () => {
    const username = followBtn.dataset.username;
    const res = await fetch(`/api/users/${username}/follow`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      followBtn.textContent = data.following ? 'Following' : 'Follow';
      followBtn.classList.toggle('btn-primary', !data.following);
      followBtn.classList.toggle('btn-outline', data.following);
    }
  });
}

// ── Comments ──────────────────────────────────────
const commentsList = document.getElementById('commentsList');
const submitBtn = document.getElementById('submitComment');

function renderComment(c, isReply = false) {
  const div = document.createElement('div');
  div.className = `comment${isReply ? ' reply-indent' : ''}`;
  div.innerHTML = `
    <img src="${c.author.avatarUrl || '/img/default-avatar.png'}" class="comment-avatar" alt="${c.author.displayName}" />
    <div class="comment-bubble">
      <div class="comment-meta">
        <a href="/u/${c.author.username}" style="font-weight:600;color:var(--text)">${c.author.displayName}</a>
      </div>
      <div class="comment-body">${c.body.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
    </div>`;
  return div;
}

async function loadComments() {
  if (!commentsList) return;
  const postId = submitBtn?.dataset.postId || document.querySelector('[data-post-id]')?.dataset.postId;
  if (!postId) return;
  const res = await fetch(`/api/posts/${postId}/comments`);
  if (!res.ok) return;
  const { data } = await res.json();
  commentsList.innerHTML = '';
  data.forEach(c => {
    commentsList.appendChild(renderComment(c));
    (c.replies || []).forEach(r => commentsList.appendChild(renderComment(r, true)));
  });
}

if (submitBtn) {
  submitBtn.addEventListener('click', async () => {
    const input = document.getElementById('commentInput');
    const body = input.value.trim();
    if (!body) return;
    const postId = submitBtn.dataset.postId;
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      input.value = '';
      loadComments();
    }
  });
}

loadComments();
