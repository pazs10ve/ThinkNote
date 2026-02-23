// follow.js — follow/unfollow button on profile pages
const followBtn = document.getElementById('followBtn');
if (followBtn) {
  followBtn.addEventListener('click', async () => {
    const username = followBtn.dataset.username;
    const res = await fetch(`/api/users/${username}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      followBtn.textContent = data.following ? 'Following' : 'Follow';
      followBtn.classList.toggle('btn-primary', !data.following);
      followBtn.classList.toggle('btn-outline', data.following);
    }
  });
}
