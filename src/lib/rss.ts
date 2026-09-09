import { localePath } from './url.ts';
import type { Lang } from '../i18n/index.ts';
import type { Post } from './blog.ts';

/** XML 只需转义这 5 个；漏掉 & 或 < 会让整个 feed 解析失败 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

interface FeedOptions {
  lang: Lang;
  site: URL;
  /** hreflang 代码，如 zh-Hans */
  language: string;
  title: string;
  description: string;
}

function rfc822(date: Date): string {
  return date.toUTCString();
}

/**
 * 手写 RSS 2.0。
 *
 * 不引 @astrojs/rss 是因为沙箱里装包会被 NODE_OPTIONS shim 拦截，
 * 而 RSS 本质是拼字符串 —— 这里只需要做对一件事：**转义**。
 * XML 里出现未转义的 & 或 < 会让整个 feed 解析失败，比缺功能更糟。
 */
export function buildFeed(posts: Post[], opts: FeedOptions): string {
  const { lang, site, language, title, description } = opts;
  const self = new URL(localePath('/rss.xml', lang), site).href;
  const home = new URL(localePath('/', lang) === '' ? '/' : localePath('/blog/', lang), site).href;

  const items = posts
    .slice()
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map((post) => {
      const slug = post.id.split('/').pop() ?? post.id;
      const link = new URL(localePath(`/blog/${slug}/`, lang), site).href;
      return `    <item>
      <title>${escapeHtml(post.data.title)}</title>
      <link>${escapeHtml(link)}</link>
      <guid isPermaLink="true">${escapeHtml(link)}</guid>
      <pubDate>${rfc822(post.data.pubDate)}</pubDate>
      <description>${escapeHtml(post.data.description)}</description>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeHtml(title)}</title>
    <link>${escapeHtml(home)}</link>
    <description>${escapeHtml(description)}</description>
    <language>${language}</language>
    <lastBuildDate>${rfc822(new Date())}</lastBuildDate>
    <atom:link href="${escapeHtml(self)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

export const XML_HEADERS = { 'Content-Type': 'application/xml; charset=utf-8' };
