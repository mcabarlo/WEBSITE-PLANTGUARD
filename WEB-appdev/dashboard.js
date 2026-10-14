// Pop-ups shared by the dashboard, settings and history pages.
// Menu items (Notifications, About, Contact) and the profile picture open a pop-up.
// A menu item gets the same highlight as the active page while its pop-up is open.
// The X / arrow, the dark background or Esc closes it and the page underneath is shown again.

const overlays = document.querySelectorAll('.overlay');
const currentItem = document.querySelector('.menu a.active'); // this page's own menu item
let openTrigger = null;

function openPopup(event) {
  event.preventDefault();
  closePopups();
  const trigger = event.currentTarget;
  document.getElementById(trigger.dataset.popup).hidden = false;
  if (trigger.closest('.menu')) {
    currentItem?.classList.remove('active');
    trigger.classList.add('active');
    openTrigger = trigger;
  }
}

function closePopups() {
  overlays.forEach(overlay => (overlay.hidden = true));
  if (openTrigger && openTrigger !== currentItem) openTrigger.classList.remove('active');
  currentItem?.classList.add('active');
  openTrigger = null;
}

document.querySelectorAll('[data-popup]').forEach(trigger => trigger.addEventListener('click', openPopup));
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', closePopups));
overlays.forEach(overlay => overlay.addEventListener('click', event => { if (event.target === overlay) closePopups(); }));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closePopups(); });