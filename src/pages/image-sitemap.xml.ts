import type { APIRoute } from 'astro';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SITE = (process.env.SITE_URL ?? 'https://mdtoolkit.dev').replace(/\/$/, '');

/** OG 图文件名 -> 它所属页面的绝对 URL（让 Google 图片知道图出现在哪个页面） */
function pageForOg(rel: string): string | null {
  if (rel.startsWith('blog/')) {
    // blog/<slug>.<lang>.png -> 对应语言博客文章页
    const m = rel.replace(/\.png$/, '').match(/^blog\/(.+)\.([a-z-]{2,5})$/);
    if (!m) return null;
    const [, slug, lang] = m;
    const base = lang === 'en' ? `/blog/${slug}/` : `/${lang}/blog/${slug}/`;
    return SITE + base;
  }
  // 工具页 OG 无语言后缀（通用图），挂到 en 工具页
  const slug = rel.replace(/\.png$/, '');
  return SITE + `/${slug}/`;
}

export const GET: APIRoute = () => {
  const ogDir = join(process.cwd(), 'public/og');
  if (!existsSync(ogDir)) {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>', {
      headers: { 'Content-Type': 'application/xml' },
    });
  }

  // 收齐 public/og 下所有 png（含 blog/ 子目录）
  const files: string[] = [];
  for (const entry of readdirSync(ogDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      for (const g of readdirSync(join(ogDir, entry.name))) {
        if (g.endsWith('.png')) files.push(`${entry.name}/${g}`);
      }
    } else if (entry.name.endsWith('.png')) {
      files.push(entry.name);
    }
  }

  const items: string[] = [];
  const seen = new Set<string>();
  for (const rel of files.sort()) {
    const page = pageForOg(rel);
    if (!page || seen.has(page)) continue;
    seen.add(page);
    items.push(
      `  <url>\n    <loc>${page}</loc>\n    <image:image>\n      <image:loc>${SITE}/og/${rel}</image:loc>\n    </image:image>\n  </url>`,
    );
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    `${items.join('\n')}\n` +
    `</urlset>\n`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
