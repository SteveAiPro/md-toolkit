export const LANGS = ['en', 'zh-cn', 'zh-tw', 'ja', 'fr', 'pt', 'de'] as const;

export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = 'en';

/** hreflang 代码，与 sitemap / link[rel=alternate] 共用 */
export const HREFLANG: Record<Lang, string> = {
  en: 'en',
  'zh-cn': 'zh-Hans',
  'zh-tw': 'zh-Hant',
  ja: 'ja',
  fr: 'fr',
  pt: 'pt',
  de: 'de',
};

export const LANG_LABEL: Record<Lang, string> = {
  en: 'English',
  'zh-cn': '简体中文',
  'zh-tw': '繁體中文',
  ja: '日本語',
  fr: 'Français',
  pt: 'Português',
  de: 'Deutsch',
};

export function isLang(value: string | undefined): value is Lang {
  return !!value && (LANGS as readonly string[]).includes(value);
}

/** 供 getStaticPaths 使用 */
export function langPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}
