import { readdirSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * 哪些语言还没写博客文章 —— 这些语言的 /blog/ 是空壳页，
 * 不进 sitemap，页面本身也会带 noindex。
 * （在 config 里用 fs 读目录，是因为 sitemap 的 filter 拿不到 content collection。）
 */
const blogDir = new URL('./src/content/blog/', import.meta.url);
const langsWithPosts = new Set(
  readdirSync(blogDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
);
const LOCALES = {
  en: 'en',
  'zh-cn': 'zh-Hans',
  'zh-tw': 'zh-Hant',
  ja: 'ja',
  fr: 'fr',
  pt: 'pt',
  de: 'de',
};
const emptyBlogLangs = Object.keys(LOCALES).filter((l) => !langsWithPosts.has(l));

export default defineConfig({
  // 上线前必须设成真域名：canonical / hreflang / sitemap 全部从这里推导。
  // 不想改代码就在部署环境里设 SITE_URL 环境变量。
  site: process.env.SITE_URL ?? 'https://md-toolkit.example.com',
  output: 'static',
  integrations: [
    // 多语言站点必须带 hreflang，否则 7 套页面会被判成重复内容
    sitemap({
      i18n: { defaultLocale: 'en', locales: LOCALES },
      filter: (page) => {
        const path = new URL(page).pathname;
        // 404 是错误页，绝不进 sitemap（路径含 /404）
        if (path.includes('/404')) return false;
        // tag 归档页是导航页不是着陆页，且文章少时很薄 —— 一律不进 sitemap
        if (path.includes('/blog/tag/')) return false;
        // 空博客首页（该语言还没文章）不进 sitemap
        if (emptyBlogLangs.some((l) => path === `/${l}/blog/`)) return false;
        return true;
      },
    }),
  ],
  build: {
    // 生成 /markdown-to-word/index.html 这类目录结构，与 md-to.com 一致
    format: 'directory',
  },
  trailingSlash: 'always',
  vite: {
    optimizeDeps: {
      // pdfjs 体积大，预打包避免 dev 首次加载卡顿
      include: ['pdfjs-dist'],
    },
    build: {
      // pdfjs 单独分片，避免主 bundle 过大
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('pdfjs-dist')) return 'pdfjs';
            if (id.includes('docx')) return 'docx';
            if (id.includes('markdown-it')) return 'markdown-it';
            if (id.includes('katex')) return 'katex';
            if (id.includes('highlight.js')) return 'highlight';
          },
        },
      },
    },
  },
});
