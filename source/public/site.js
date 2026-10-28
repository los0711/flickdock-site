
    function handleHeroParallax(e) {
      const wrap = document.getElementById('hero-stage-wrap');
      const deck = document.getElementById('hero-3d-deck');
      const rect = wrap.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotY = x * 10;
      const rotX = 7 - y * 8;
      deck.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
    }

    function resetHeroParallax() {
      const deck = document.getElementById('hero-3d-deck');
      deck.style.transform = 'rotateX(7deg) rotateY(0deg)';
    }

    let currentScene = 0;
    let sceneTimer = null;

    function switchScene(idx) {
      currentScene = idx;
      [0, 1, 2].forEach(i => {
        document.getElementById('scene-' + i).classList.toggle('hidden', i !== idx);
        const tab = document.getElementById('scene-tab-' + i);
        tab.className = i === idx
          ? 'px-4 py-2 rounded-xl text-xs font-semibold bg-white/15 text-white shadow-sm transition'
          : 'px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition';
      });
      resetAutoPlay();
    }

    function resetAutoPlay() {
      if (sceneTimer) clearInterval(sceneTimer);
      sceneTimer = setInterval(() => {
        const next = (currentScene + 1) % 3;
        switchScene(next);
      }, 5500);
    }

    function setTheme(theme) {
      document.body.classList.toggle('theme-light', theme === 'light');
      const activeCls = 'px-2.5 py-1 rounded-lg text-xs font-medium bg-white/15 text-white transition';
      const inactiveCls = 'px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition';
      document.getElementById('theme-btn-dark').className = theme === 'dark' ? activeCls : inactiveCls;
      document.getElementById('theme-btn-light').className = theme === 'light' ? activeCls : inactiveCls;
    }

    function triggerDownload(osName) {
      if (osName === 'Windows') {
        const link = document.querySelector('[data-installer="windows"]');
        showToast('正在打开 Windows 安装包下载');
        window.location.assign(link.href);
      } else {
        document.getElementById('download').scrollIntoView({ behavior: 'smooth' });
        showToast('请选择 Apple 芯片或 Intel 安装包');
      }
    }

    let toastTimeout = null;
    function showToast(msg) {
      const toast = document.getElementById('promo-toast');
      document.getElementById('promo-toast-text').textContent = msg;
      toast.classList.remove('opacity-0', 'translate-y-2');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
      }, 2400);
    }

    resetAutoPlay();

const actions = {
  'theme-dark': () => setTheme('dark'),
  'theme-light': () => setTheme('light'),
  'download-windows': () => triggerDownload('Windows'),
  'download-macos': () => triggerDownload('macOS'),
  'scene-0': () => switchScene(0),
  'scene-1': () => switchScene(1),
  'scene-2': () => switchScene(2),
};
document.querySelectorAll('[data-ui-action]').forEach(element => {
  element.addEventListener('click', actions[element.dataset.uiAction]);
});
const parallax = document.querySelector('[data-parallax="hero"]');
parallax.addEventListener('mousemove', handleHeroParallax);
parallax.addEventListener('mouseleave', resetHeroParallax);
