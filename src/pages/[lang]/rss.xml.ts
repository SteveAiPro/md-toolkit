import { getCollection } from 'astro:content';
import { buildFeed, XML_HEADERS } from '../../lib/rss.ts';
import { HREFLANG, type Lang } from '../../i18n/index.ts';

/**
 * 只为「真的有文章」的语言生成 feed。
 * fr / pt / de 目前 0 篇，生成空 feed 再让 BaseLayout 指过去就是又一个空壳页。
 */
export async function getStaticPaths() {
  const all = await getCollection('blog');
  const langs = [...new Set(all.map((p) => p.data.lang))].filter((l): l is Lang => l !== 'en');
  return langs.map((lang) => ({ params: { lang } }));
}

const TITLES = {
  'zh-cn': 'MD Toolkit 博客',
  'zh-tw': 'MD Toolkit 部落格',
  ja: 'MD Toolkit ブログ',
  fr: 'Blog MD Toolkit',
  pt: 'Blog MD Toolkit',
  de: 'MD Toolkit Blog',
};
const DESCS = {
  'zh-cn': '关于 Markdown、转换陷阱和那些没人讲清楚的格式。',
  'zh-tw': '關於 Markdown、轉換陷阱和那些沒人講清楚的格式。',
  ja: 'Markdown、変換の落とし穴、そして誰も説明してくれない形式について。',
  fr: 'Guides pratiques sur Markdown, les pièges de conversion et les formats mal documentés.',
  pt: 'Guias práticos sobre Markdown, armadilhas de conversão e formatos mal documentados.',
  de: 'Praxisnahe Ratgeber zu Markdown, Konvertierungsfehlern und schlecht dokumentierten Formaten.',
};

export async function GET(context) {
  const lang = context.params.lang;
  const posts = await getCollection('blog', ({ data }) => data.lang === lang);
  const xml = buildFeed(posts, {
    lang,
    site: context.site,
    language: HREFLANG[lang],
    title: TITLES[lang],
    description: DESCS[lang],
  });
  return new Response(xml, { headers: XML_HEADERS });
}
