import { DEFAULT_LANG, type Lang } from '../i18n/index.ts';

/** en 走根路径，其它语言带前缀 —— 与 md-to.com 的 URL 结构一致 */
export function homeUrl(lang: Lang = DEFAULT_LANG): string {
  return lang === 'en' ? '/' : `/${lang}/`;
}

export function toolUrl(slug: string, lang: Lang = DEFAULT_LANG): string {
  return lang === 'en' ? `/${slug}/` : `/${lang}/${slug}/`;
}

/** 英语版站点内的任意路径 -> 指定语言下的路径。blog / tag 这类非工具页用它 */
export function localePath(pathname: string, lang: Lang = DEFAULT_LANG): string {
  return lang === 'en' ? pathname : `/${lang}${pathname}`;
}
