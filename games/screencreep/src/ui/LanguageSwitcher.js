// src/ui/LanguageSwitcher.js
import { getLocale, setLocale } from '../i18n/i18n.js';

export function createLanguageSwitcher(onLocaleChange) {
  const el = document.createElement('div');
  el.id = 'lang-switcher';
  el.style.cssText = 'position:fixed;top:8px;left:8px;z-index:1000;display:flex;gap:4px;';

  const locales = ['en', 'ru', 'de'];

  function render() {
    const current = getLocale();
    el.innerHTML = locales.map(loc => {
      const active = loc === current;
      return `<button data-lang="${loc}" style="
        background:${active ? 'rgba(0,255,136,0.15)' : 'rgba(0,0,0,0.3)'};
        border:1px solid ${active ? '#00ff88' : '#333'};
        color:${active ? '#00ff88' : '#666'};
        padding:2px 6px;font-size:10px;font-family:monospace;
        cursor:pointer;border-radius:3px;
      ">${loc.toUpperCase()}</button>`;
    }).join('');
  }

  el.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;
    await setLocale(btn.dataset.lang);
    render();
    if (onLocaleChange) onLocaleChange();
  });

  render();
  document.body.appendChild(el);

  return { el, render };
}
