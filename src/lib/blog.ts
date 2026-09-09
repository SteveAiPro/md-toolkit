import { getCollection, type CollectionEntry } from 'astro:content';
import { LANGS, type Lang } from '../i18n/index.ts';

export type Post = CollectionEntry<'blog'>;

/** 中文按字数、其余按词数估算阅读时长 */
export function readingMinutes(body: string, lang: Lang): number {
  if (!body) return 1;
  if (lang === 'zh-cn' || lang === 'zh-tw') {
    return Math.max(1, Math.round(body.replace(/\s/g, '').length / 400));
  }
  return Math.max(1, Math.round(body.split(/\s+/).length / 220));
}

export async function allPosts(): Promise<Post[]> {
  return getCollection('blog');
}

/** 某语言下全部文章，按发布时间倒序 */
export async function postsByLang(lang: Lang): Promise<Post[]> {
  const all = await allPosts();
  return all
    .filter((p) => p.data.lang === lang)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** 文章 slug：id 形如 `en/getting-started-with-markdown`，取末段 */
export function postSlug(post: Post): string {
  return post.id.split('/').pop() ?? post.id;
}

/**
 * 同一篇文章在各语言下的 slug。
 * 缺的语言不给值 —— 页面据此只输出存在的 hreflang，避免指向 404。
 */
export async function translationsOf(post: Post): Promise<Record<Lang, string>> {
  const all = await allPosts();
  const out = {} as Record<Lang, string>;
  for (const p of all) {
    if (p.data.group === post.data.group) out[p.data.lang] = postSlug(p);
  }
  return out;
}

export interface TagCount {
  tag: string;
  count: number;
}

/** 某语言下的 tag 及其文章数，按文章数倒序 */
export async function tagsByLang(lang: Lang): Promise<TagCount[]> {
  const posts = await postsByLang(lang);
  const map = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** 语言列表，页面用来生成 hreflang */
export { LANGS };
