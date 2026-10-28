// Website illustrations are demonstrations; they do not access local files.
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let currentScene = 0;
let sceneTimer = null;
let demoVisible = false;
let paused = motionQuery.matches;
let sceneFocused = false;
let toastTimeout = null;

function setTheme(theme, remember = true) {
  document.body.classList.toggle('theme-light', theme === 'light');
  document.documentElement.style.colorScheme = theme;
  ['dark', 'light'].forEach(value => {
    document.getElementById(`theme-btn-${value}`).setAttribute('aria-pressed', String(value === theme));
  });
  if (remember) { try { localStorage.setItem('flickdock-site-theme', theme); } catch {} }
}
let savedTheme;
try { savedTheme = localStorage.getItem('flickdock-site-theme'); } catch {}
// The official website starts dark; an explicit visitor choice is retained.
setTheme(savedTheme === 'light' ? 'light' : 'dark', false);

function syncPlayback() {
  clearInterval(sceneTimer);
  const running = !paused && !motionQuery.matches && demoVisible && !document.hidden && !sceneFocused;
  document.body.classList.toggle('motion-paused', paused || motionQuery.matches || document.hidden);
  document.getElementById('demo-playback').textContent = paused || motionQuery.matches ? '播放演示' : '暂停演示';
  document.getElementById('demo-playback').setAttribute('aria-pressed', String(!paused && !motionQuery.matches));
  if (running) sceneTimer = setInterval(() => switchScene((currentScene + 1) % 3), 6500);
}

function switchScene(index, focus = false) {
  currentScene = index;
  [0, 1, 2].forEach(value => {
    const selected = value === index;
    const scene = document.getElementById(`scene-${value}`);
    scene.hidden = !selected;
    scene.classList.toggle('hidden', !selected);
    const tab = document.getElementById(`scene-tab-${value}`);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  });
  syncPlayback();
}

const tabs = document.getElementById('demo-tabs');
tabs.addEventListener('keydown', event => {
  let next = currentScene;
  if (event.key === 'ArrowRight') next = (currentScene + 1) % 3;
  else if (event.key === 'ArrowLeft') next = (currentScene + 2) % 3;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = 2;
  else return;
  event.preventDefault();
  switchScene(next, true);
});
tabs.addEventListener('focusin', () => { sceneFocused = true; syncPlayback(); });
tabs.addEventListener('focusout', event => {
  if (!tabs.contains(event.relatedTarget)) { sceneFocused = false; syncPlayback(); }
});
new IntersectionObserver(entries => {
  demoVisible = entries[0].isIntersecting;
  syncPlayback();
}, { threshold: 0.15 }).observe(document.getElementById('demo-stage'));
document.addEventListener('visibilitychange', syncPlayback);
motionQuery.addEventListener('change', () => { paused = motionQuery.matches; syncPlayback(); });
document.getElementById('demo-playback').addEventListener('click', () => {
  if (motionQuery.matches) { showToast('已遵循系统的减少动态效果设置'); return; }
  paused = !paused;
  syncPlayback();
});

function showToast(message) {
  const toast = document.getElementById('promo-toast');
  document.getElementById('promo-toast-text').textContent = message;
  toast.classList.remove('opacity-0', 'translate-y-2');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.add('opacity-0', 'translate-y-2'), 3000);
}

const actions = {
  'theme-dark': () => setTheme('dark'),
  'theme-light': () => setTheme('light'),
  'download-windows': () => window.location.assign(document.querySelector('[data-installer="windows"]').href),
  'download-macos': () => {
    document.getElementById('download').scrollIntoView({ behavior: motionQuery.matches ? 'instant' : 'smooth' });
    document.querySelector('[data-installer="mac-arm"]').focus({ preventScroll: true });
    showToast('请选择适合 Mac 芯片的安装包');
  },
  'scene-0': () => switchScene(0),
  'scene-1': () => switchScene(1),
  'scene-2': () => switchScene(2),
};
document.querySelectorAll('[data-ui-action]').forEach(element => {
  element.addEventListener('click', actions[element.dataset.uiAction]);
});

// Coarse pointers and reduced motion keep a stable stage. Desktop parallax
// uses one animation-frame write, rather than a style write for every event.
const parallax = document.querySelector('[data-parallax="hero"]');
const deck = document.getElementById('hero-3d-deck');
let frame = null;
parallax.addEventListener('pointermove', event => {
  if (motionQuery.matches || paused || event.pointerType !== 'mouse' || frame !== null) return;
  const rect = parallax.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width - 0.5) * 5;
  const y = 4 - ((event.clientY - rect.top) / rect.height - 0.5) * 4;
  frame = requestAnimationFrame(() => {
    deck.style.transform = `rotateX(${y.toFixed(2)}deg) rotateY(${x.toFixed(2)}deg)`;
    frame = null;
  });
});
parallax.addEventListener('pointerleave', () => {
  if (frame !== null) cancelAnimationFrame(frame);
  frame = null;
  deck.style.transform = '';
});
switchScene(0);
