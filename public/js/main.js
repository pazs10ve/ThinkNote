// ThinkNote — main.js (global UI interactions)

// ── Avatar dropdown ──────────────────────────────
const avatarBtn = document.getElementById('avatarBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

if (avatarBtn && dropdownMenu) {
  avatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('open');
  });
  document.addEventListener('click', () => dropdownMenu.classList.remove('open'));
}

// ── Mobile hamburger ─────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// ── Flash messages auto-dismiss ──────────────────
document.querySelectorAll('.alert').forEach(el => {
  setTimeout(() => {
    el.style.transition = 'opacity 0.5s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 500);
  }, 4000);
});
