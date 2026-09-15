/**
 * 生成 OG 分享图（1200×630 PNG），输出到 public/og/。
 *
 * 为什么用 playwright 截图而不是装 sharp / @astrojs/og：
 * 沙箱里 npm install 会被 node-language-shim 拦截，装图像处理原生依赖更麻烦。
 * 直接用系统里已有的 chromium 渲染 HTML 再截图，零依赖、字体排版也可控。
 *
 * 用法：node make-og.mjs
 */
import { chromium } from 'playwright-core';
import { mkdirSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const EXEC = join(
  homedir(),
  'Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
);

const OUT = new URL('./public/og/', import.meta.url);
const SITE_LABEL = (process.env.SITE_URL ?? 'https://mdtoolkit.dev').replace(/^https?:\/\//, '');
const TAGLINE = 'Free · No upload · Runs in your browser';

/** 从 tools.ts 里把 slug 和英文 name 抓出来，避免在这里再维护一份清单 */
function readTools() {
  const src = readFileSync(new URL('./src/tools.ts', import.meta.url), 'utf8');
  const out = [];
  const re = /slug: '([a-z0-9-]+)'[\s\S]{0,3000}?name: \{\s*en: '([^']*)'/g;
  let m;
  while ((m = re.exec(src))) out.push({ slug: m[1], name: m[2] });
  return out;
}

const tools = readTools();
if (tools.length !== 18) {
  console.warn(`⚠️ 只解析到 ${tools.length} 个工具（预期 18），检查 src/tools.ts 字段顺序是否变了`);
}

/**
 * 读博客文章的真实标题，OG 卡用各语言自己的标题。
 * 只解析 frontmatter 的 title 行，不引入 yaml 依赖。
 */
function readPosts() {
  const root = new URL('./src/content/blog/', import.meta.url);
  const out = [];
  for (const lang of readdirSync(root, { withFileTypes: true })) {
    if (!lang.isDirectory()) continue;
    const dir = new URL(`./${lang.name}/`, root);
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.md')) continue;
      const src = readFileSync(new URL(f, dir), 'utf8');
      const m = src.match(/^title:\s*(.+?)\s*$/m);
      if (!m) continue;
      out.push({
        lang: lang.name,
        slug: f.replace(/\.md$/, ''),
        title: m[1].replace(/^["']|["']$/g, ''),
      });
    }
  }
  return out;
}

const posts = readPosts();

/** 卡片：浅色底 + 左侧色条 + 巨大标题，和站点的浅色调一致 */
/**
 * 标题字号按长度分档：工具名很短（"Markdown to Word"）用 76px 才撑得住版面，
 * 而文章标题动辄 60+ 字符，同样字号会撞到右下角水印并溢出卡片。
 */
function titleSize(title) {
  const n = String(title).length;
  if (n <= 22) return 76;
  if (n <= 40) return 62;
  if (n <= 60) return 50;
  if (n <= 85) return 42;
  return 36;
}

function card({ eyebrow, title, sub, watermark }) {
  const escaped = String(title).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const size = titleSize(title);
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; background: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", sans-serif;
    color: #0f172a; position: relative; overflow: hidden;
    /* 用纯色而不是大面积渐变：渐变会产生上百万种颜色，PNG 压不下去（单图 470KB -> 90KB） */
    background: #f7f9fc;
  }
  .bar { position: absolute; left: 0; top: 0; bottom: 0; width: 14px;
         background: linear-gradient(180deg, #2563eb 0%, #7c3aed 100%); }
  .mark { position: absolute; right: 96px; bottom: -60px; font-size: 340px; font-weight: 800;
          color: #0f172a; opacity: 0.045; letter-spacing: -18px; line-height: 1; }
  .wrap { position: absolute; left: 96px; top: 96px; right: 160px; }
  .brand { display: flex; align-items: center; gap: 14px; margin-bottom: 52px; }
  .chip { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center;
          justify-content: center; font-weight: 800; font-size: 21px; color: #fff;
          background: linear-gradient(135deg, #2563eb, #7c3aed); letter-spacing: -0.5px; }
  .brand-name { font-size: 26px; font-weight: 700; letter-spacing: -0.2px; }
  .eyebrow { font-size: 22px; font-weight: 600; color: #2563eb; letter-spacing: 3px;
             text-transform: uppercase; margin-bottom: 20px; }
  h1 { font-size: ${size}px; line-height: 1.15; font-weight: 750; letter-spacing: -1.5px; }
  .tagline { margin-top: 38px; font-size: 25px; color: #64748b; letter-spacing: 0.4px; }
  .sub { margin-top: 12px; font-size: 21px; color: #94a3b8;
         font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
</style></head><body>
  <div class="bar"></div>
  <div class="mark">${watermark}</div>
  <div class="wrap">
    <div class="brand"><div class="chip">MD</div><div class="brand-name">MD Toolkit</div></div>
    ${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ''}
    <h1>${escaped}</h1>
    <div class="tagline">${TAGLINE}</div>
    <div class="sub">${sub}</div>
  </div>
</body></html>`;
}

const targets = [
  {
    file: 'home.png',
    html: card({
      eyebrow: '18 Converters',
      title: 'Markdown conversion\nwithout the upload',
      sub: SITE_LABEL,
      watermark: 'MD',
    }),
  },
  ...tools.map((t) => ({
    file: `${t.slug}.png`,
    html: card({
      eyebrow: 'Converter',
      title: t.name,
      sub: `${SITE_LABEL}/${t.slug}`,
      watermark: 'MD',
    }),
  })),
  // 博客文章：分享到社交平台时带真实标题，比所有文章共用 home.png 的点击率高
  ...posts.map((p) => ({
    file: `blog/${p.slug}.${p.lang}.png`,
    html: card({
      eyebrow: 'Guide',
      title: p.title,
      sub: `${SITE_LABEL}/blog/${p.slug}`,
      watermark: 'MD',
    }),
  })),
];

mkdirSync(OUT, { recursive: true });
mkdirSync(new URL('./blog/', OUT), { recursive: true });

if (!existsSync(EXEC)) {
  console.error(`✗ 找不到 chromium：${EXEC}`);
  process.exit(1);
}

const browser = await chromium.launch({
  executablePath: EXEC,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
// 1x，出图就是 1200x630。别开 deviceScaleFactor:2 —— 社交平台会缩到 ~600px 宽显示，
// 2x 只是白送一倍体积（114KB → 57KB），锐度收益在压缩后基本看不出来。
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

let n = 0;
for (const t of targets) {
  await page.setContent(t.html, { waitUntil: 'load' });
  await page.screenshot({ path: new URL(t.file, OUT).pathname, type: 'png' });
  n++;
  console.log(`✓ ${t.file}`);
}
await browser.close();
console.log(`\n生成 ${n} 张 OG 图 -> public/og/`);
