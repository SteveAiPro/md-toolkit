// en 版 feed。其余语言在 [lang]/rss.xml.ts。
import { getCollection } from 'astro:content';
import { buildFeed, XML_HEADERS } from '../lib/rss.ts';

export async function GET(context) {
  const posts = await getCollection('blog', ({ data }) => data.lang === 'en');
  const xml = buildFeed(posts, {
    lang: 'en',
    site: context.site,
    language: 'en',
    title: 'MD Toolkit Blog',
    description: 'Practical guides on Markdown, conversion pitfalls, and the formats nobody explains.',
  });
  return new Response(xml, { headers: XML_HEADERS });
}
