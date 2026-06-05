// Theme toggle. Shares theme resolution with the head FOUC script via window.themeUtil.
(function () {
  var btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  var icon = btn.querySelector('.material-symbols-outlined');
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  var ICONS = { system: 'routine', light: 'light_mode', dark: 'dark_mode' };
  var LABELS = {
    system: 'Theme: system (click for light)',
    light: 'Theme: light (click for dark)',
    dark: 'Theme: dark (click for system)'
  };
  var NEXT = { system: 'light', light: 'dark', dark: 'system' };
  var SWAP_MS = 150;
  var initialized = false;
  var swapTimer = null;

  function getSetting() {
    return window.themeUtil.getSetting();
  }

  function resolve(setting) {
    return window.themeUtil.resolve(setting);
  }

  function setIcon(name) {
    if (!icon) return;
    if (!initialized || icon.innerText === name) {
      icon.innerText = name;
      return;
    }
    if (swapTimer) clearTimeout(swapTimer);
    btn.classList.add('is-swapping');
    swapTimer = setTimeout(function () {
      icon.innerText = name;
      btn.classList.remove('is-swapping');
      swapTimer = null;
    }, SWAP_MS);
  }

  function applySetting(setting) {
    localStorage.setItem('theme', setting);
    document.documentElement.setAttribute('data-theme', resolve(setting));
    setIcon(ICONS[setting]);
    btn.setAttribute('title', LABELS[setting]);
    btn.setAttribute('aria-label', LABELS[setting]);
  }

  applySetting(getSetting());
  initialized = true;

  btn.addEventListener('click', function () {
    applySetting(NEXT[getSetting()]);
  });

  media.addEventListener('change', function () {
    if (getSetting() === 'system') applySetting('system');
  });
})();
