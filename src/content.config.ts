import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const LANGS = ['en', 'zh-cn', 'zh-tw', 'ja', 'fr', 'pt', 'de'] as const;

/**
 * blog 按语言分目录：src/content/blog/<lang>/<slug>.md
 *
 * `group` 是同一篇文章在 7 种语言下的共同标识（取英文 slug）。
 * 页面靠它把各语言版本关联起来做 hreflang —— 少了这个字段，
 * 7 篇孤立文章会被搜索引擎当成重复内容各自为战。
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(LANGS),
    group: z.string(),
    /** 文章里推荐的相关工具 slug，生成内链 */
    tools: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
