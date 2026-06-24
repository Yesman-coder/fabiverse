import es from './es.js';
import en from './en.js';

const locales = { es, en };
let _lang = 'es';

export function setLang(lang) { _lang = lang; }
export function getLang() { return _lang; }
export function t(key) { return locales[_lang]?.[key] ?? locales.es[key] ?? key; }
