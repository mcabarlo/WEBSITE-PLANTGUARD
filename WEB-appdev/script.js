// Click-through page: click, scroll, swipe, use the arrows or the keyboard to move between frames.
// JavaScript only decides which frame and state is active; style.css does all the animation.

const frames = [...document.querySelectorAll('.frame')];
const SLOW = 900; // ms to ignore extra clicks while a screen is moving

let frame = 0;   // index of the current frame
let state = 0;   // step inside the current frame
let busy = false;

const states = el => Number(el.dataset.states || 1);

function lock(ms) {
  busy = true;
  setTimeout(() => (busy = false), ms);
}

function render() {
  frames.forEach((el, i) => {
    el.classList.toggle('is-shown', i <= frame);   // frames below the current one are covered, not removed
    el.classList.toggle('is-behind', i < frame);
    el.dataset.state = i < frame ? states(el) - 1 : i === frame ? state : 0;
  });
  const yellow = frames[frame].dataset.yellow;
  document.body.classList.toggle('yellow', yellow !== undefined && state >= Number(yellow));
}

function show(nextFrame, nextState) {
  frame = nextFrame;
  state = nextState;
  lock(SLOW);
  render();
}

function next() {
  if (busy) return;
  const current = frames[frame];

  if (state < states(current) - 1) return show(frame, state + 1);
  if (frame === frames.length - 1) return;

  // Some frames play a leaving animation first (the feature bubbles fly away)
  const wait = Number(current.dataset.leave || 0);
  if (!wait) return show(frame + 1, 0);

  current.classList.add('is-leaving');
  lock(wait + SLOW);
  setTimeout(() => {
    current.classList.remove('is-leaving');
    show(frame + 1, 0);
  }, wait);
}

function previous() {
  if (busy) return;
  if (state > 0) return show(frame, state - 1);
  if (frame > 0) show(frame - 1, states(frames[frame - 1]) - 1);
}

function jumpTo(id) {
  show(frames.findIndex(el => el.id === id), 0);
}

document.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (link) {
    event.preventDefault();
    if (link.dataset.goto) jumpTo(link.dataset.goto);
    return;
  }
  if (event.target.closest('button')) return;
  next();
});

document.querySelectorAll('.arrows button').forEach(button =>
  button.addEventListener('click', () => (button.dataset.dir > 0 ? next() : previous()))
);

document.addEventListener('keydown', event => {
  if (['ArrowRight', 'ArrowDown', ' '].includes(event.key)) { event.preventDefault(); next(); }
  if (['ArrowLeft', 'ArrowUp'].includes(event.key)) { event.preventDefault(); previous(); }
});

// Scrolling and swiping do exactly what clicking does
let lastWheel = 0;
document.addEventListener('wheel', event => {
  event.preventDefault();
  const now = Date.now();
  const newGesture = now - lastWheel > 200;   // trackpad momentum keeps firing, so only the first event counts
  lastWheel = now;
  if (newGesture && Math.abs(event.deltaY) > 4) (event.deltaY > 0 ? next() : previous());
}, { passive: false });

let touchStart = 0;
document.addEventListener('touchstart', event => (touchStart = event.touches[0].clientY), { passive: true });
document.addEventListener('touchend', event => {
  const distance = touchStart - event.changedTouches[0].clientY;
  if (Math.abs(distance) > 50) (distance > 0 ? next() : previous());
}, { passive: true });

render();