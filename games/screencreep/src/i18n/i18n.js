// src/i18n/i18n.js
let strings = {};
let fallback = {};
let currentLocale = 'en';

const SUPPORTED = ['en', 'ru', 'de'];
const STORAGE_KEY = 'screencreep_locale';

export function initI18n(savedLocale = null) {
  currentLocale = savedLocale
    || localStorage.getItem(STORAGE_KEY)
    || detectBrowserLocale()
    || 'en';
  return loadLocale(currentLocale);
}

export function t(key, params = {}) {
  let str = strings[key] || fallback[key] || key;
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
}

export function getLocale() {
  return currentLocale;
}

export async function setLocale(locale) {
  if (!SUPPORTED.includes(locale)) return;
  currentLocale = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  await loadLocale(locale);
}

function detectBrowserLocale() {
  const lang = navigator.language.slice(0, 2);
  return SUPPORTED.includes(lang) ? lang : null;
}

async function loadLocale(locale) {
  const mod = await import(`./locales/${locale}.js`);
  strings = mod.default;
  if (locale !== 'en') {
    const enMod = await import('./locales/en.js');
    fallback = enMod.default;
  } else {
    fallback = {};
  }
}
