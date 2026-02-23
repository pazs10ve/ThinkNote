// post.js — post detail page interactions: likes, bookmarks, follow, comments + replies

// ── Like button ──────────────────────────────────
const likeBtn = document.getElementById('likeBtn');
if (likeBtn) {
  likeBtn.addEventListener('click', async () => {
    const res = await fetch(`/api/posts/${likeBtn.dataset.postId}/like`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      document.getElementById('likeCount').textContent = data.likeCount;
      likeBtn.classList.toggle('active', data.liked);
    }
  });
}

// ── Bookmark button ──────────────────────────────
const bookmarkBtn = document.getElementById('bookmarkBtn');
if (bookmarkBtn) {
  bookmarkBtn.addEventListener('click', async () => {
    const res = await fetch(`/api/posts/${bookmarkBtn.dataset.postId}/bookmark`, { method: 'POST' });
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
    const res = await fetch(`/api/users/${followBtn.dataset.username}/follow`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      followBtn.textContent = data.following ? 'Following' : 'Follow';
      followBtn.classList.toggle('btn-primary', !data.following);
      followBtn.classList.toggle('btn-outline', data.following);
    }
  });
}

// ── Comments + Replies ────────────────────────────
const commentsList = document.getElementById('commentsList');
const submitBtn    = document.getElementById('submitComment');
const postId       = submitBtn?.dataset.postId || document.querySelector('[data-post-id]')?.dataset.postId;

function escape(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function buildReplyForm(parentId) {
  const wrap = document.createElement('div');
  wrap.className = 'reply-form reply-indent';
  wrap.style.cssText = 'display:flex;gap:0.7rem;margin-top:0.75rem;margin-bottom:0.5rem';
  wrap.innerHTML = `
    <textarea rows="2" placeholder="Write a reply…"
      style="flex:1;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-sm);
             padding:0.5rem 0.75rem;color:var(--text);font-size:0.88rem;resize:vertical;font-family:var(--font-sans);outline:none"></textarea>
    <div style="display:flex;flex-direction:column;gap:0.4rem">
      <button class="btn btn-primary btn-sm submit-reply" data-parent="${parentId}">Reply</button>
      <button class="btn btn-ghost btn-sm cancel-reply">Cancel</button>
    </div>`;

  wrap.querySelector('.cancel-reply').addEventListener('click', () => wrap.remove());
  wrap.querySelector('.submit-reply').addEventListener('click', async () => {
    const body = wrap.querySelector('textarea').value.trim();
    if (!body) return;
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, parentId }),
    });
    if (res.ok) { wrap.remove(); loadComments(); }
  });
  return wrap;
}

function renderComment(c, isReply = false) {
  const div = document.createElement('div');
  div.className = `comment${isReply ? ' reply-indent' : ''}`;
  div.dataset.commentId = c._id;

  const replyBtnHtml = postId
    ? `<button class="reply-trigger" data-parent="${c._id}"
         style="background:none;border:none;color:var(--text-muted);font-size:0.8rem;cursor:pointer;padding:0;margin-left:0.5rem">
         ↩ Reply
       </button>`
    : '';

  div.innerHTML = `
    <img src="${c.author.avatarUrl || '/img/default-avatar.png'}" class="comment-avatar" alt="${escape(c.author.displayName)}" />
    <div class="comment-bubble" style="flex:1">
      <div class="comment-meta">
        <a href="/u/${c.author.username}" style="font-weight:600;color:var(--text)">${escape(c.author.displayName)}</a>
        ${replyBtnHtml}
      </div>
      <div class="comment-body">${escape(c.body)}</div>
    </div>`;

  const replyTrigger = div.querySelector('.reply-trigger');
  if (replyTrigger) {
    replyTrigger.addEventListener('click', () => {
      // Remove any existing reply form on this comment
      const existing = div.querySelector('.reply-form');
      if (existing) { existing.remove(); return; }
      div.appendChild(buildReplyForm(c._id));
    });
  }
  return div;
}

async function loadComments() {
  if (!commentsList || !postId) return;
  const res = await fetch(`/api/posts/${postId}/comments`);
  if (!res.ok) return;
  const { data } = await res.json();
  commentsList.innerHTML = '';
  data.forEach(c => {
    commentsList.appendChild(renderComment(c, false));
    (c.replies || []).forEach(r => commentsList.appendChild(renderComment(r, true)));
  });
}

if (submitBtn) {
  submitBtn.addEventListener('click', async () => {
    const input = document.getElementById('commentInput');
    const body  = input.value.trim();
    if (!body) return;
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    if (res.ok) { input.value = ''; loadComments(); }
  });
}

loadComments();
