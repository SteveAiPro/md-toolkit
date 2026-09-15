/**
 * 本地 e2e：用 playwright-core 驱动系统已有的 chromium，绕开 MCP 浏览器。
 * 覆盖 18 个工具的输入→输出链路，外加二进制上传与文件下载。
 */
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const EXEC = join(
  homedir(),
  'Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
);
const BASE = 'http://127.0.0.1:4321';

// slug -> { kind: 'text'|'binary'|'image', fixture? }
const TOOLS = [
  { slug: 'markdown-to-word', kind: 'text' },
  { slug: 'markdown-to-pdf', kind: 'text' },
  { slug: 'markdown-to-html', kind: 'text' },
  { slug: 'markdown-to-text', kind: 'text' },
  { slug: 'html-to-markdown', kind: 'text' },
  { slug: 'markdown-to-latex', kind: 'text' },
  { slug: 'markdown-to-rst', kind: 'text' },
  { slug: 'markdown-to-confluence', kind: 'text' },
  { slug: 'latex-to-markdown', kind: 'text' },
  { slug: 'csv-to-markdown-table', kind: 'text' },
  { slug: 'json-to-markdown-table', kind: 'text' },
  { slug: 'markdown-table-to-csv', kind: 'text' },
  { slug: 'markdown-table-to-pdf', kind: 'text' },
  { slug: 'markdown-table-to-image', kind: 'text' },
  { slug: 'markdown-editor', kind: 'text' },
  { slug: 'markdown-to-image', kind: 'text' },
  { slug: 'word-to-markdown', kind: 'binary', fixture: '.fixtures/word-sample.docx' },
  { slug: 'pdf-to-markdown', kind: 'binary', fixture: '.fixtures/pdf-sample.pdf' },
];

const browser = await chromium.launch({
  executablePath: EXEC,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text().slice(0, 160));
});

const results = [];

for (const tool of TOOLS) {
  const url = `${BASE}/${tool.slug}/`;
  const row = { slug: tool.slug, ok: false };
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(2500);

    if (tool.kind === 'binary') {
      const fx = join(process.cwd(), tool.fixture);
      if (!existsSync(fx)) {
        row.err = `fixture 缺失 ${tool.fixture}`;
        results.push(row);
        continue;
      }
      await page.setInputFiles('#tool-file', fx);
      await page.waitForTimeout(4000);
    } else {
      await page.click('#tool-sample');
      await page.waitForTimeout(1800);
    }

    const out = await page.evaluate(() => {
      const ta = document.getElementById('tool-output');
      const pv = document.getElementById('tool-preview');
      const pick = (el) => (el ? (el.value ?? el.innerText ?? '') : '');
      return {
        output: pick(ta).trim(),
        preview: pick(pv).trim(),
        inputLen: (document.getElementById('tool-input')?.value ?? '').length,
      };
    });

    const text = out.output || out.preview;
    row.inputLen = out.inputLen;
    row.outLen = text.length;
    row.ok = text.length > 10;
    row.head = text.slice(0, 70).replace(/\s+/g, ' ');
  } catch (e) {
    row.err = String(e).slice(0, 120);
  }
  results.push(row);
}

// ---- 下载链路 ----
const downloads = [];
for (const t of [
  { slug: 'markdown-to-word', ext: 'docx' },
  { slug: 'markdown-to-image', ext: 'png' },
  { slug: 'markdown-table-to-image', ext: 'png' },
]) {
  const item = { slug: t.slug, ok: false };
  try {
    await page.goto(`${BASE}/${t.slug}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(2500);
    await page.click('#tool-sample');
    await page.waitForTimeout(1800);
    const [dl] = await Promise.all([
      page.waitForEvent('download', { timeout: 40000 }),
      page.click('#tool-download'),
    ]);
    const name = dl.suggestedFilename();
    // 带 slug 前缀，否则两个工具的 PNG 同名会互相覆盖，看不出真实尺寸
    const p = join(process.cwd(), `.dl-${t.slug}-${name}`);
    await dl.saveAs(p);
    item.name = name;
    item.ok = existsSync(p);
    item.ext = name.split('.').pop();
  } catch (e) {
    item.err = String(e).slice(0, 100);
  }
  downloads.push(item);
}

// ---- blog 链路 ----
const blogs = [];
for (const [label, listPath] of [
  ['en', '/blog/'],
  ['zh-cn', '/zh-cn/blog/'],
  ['zh-tw', '/zh-tw/blog/'],
  ['ja', '/ja/blog/'],
]) {
  const item = { label, ok: false };
  try {
    await page.goto(BASE + listPath, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(1200);
    item.posts = await page.evaluate(
      () => document.querySelectorAll('.post-card__title').length,
    );
    const firstHref = await page.evaluate(
      () => document.querySelector('.post-card__title a')?.getAttribute('href') ?? '',
    );
    if (firstHref) {
      await page.goto(BASE + firstHref, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(1200);
      item.bodyLen = await page.evaluate(
        () => (document.querySelector('.post__body')?.textContent ?? '').length,
      );
      item.alts = await page.evaluate(
        () => document.querySelectorAll('link[rel="alternate"]').length,
      );
    }
    item.ok = item.posts > 0 && (item.bodyLen ?? 0) > 500;
  } catch (e) {
    item.err = String(e).slice(0, 100);
  }
  blogs.push(item);
}

// ---- 404 页：本地化 + 重定向 ----
// astro preview 对任意错误路径都回落到根 /404.html（英文），所以这里用浏览器
// 实测根 404 里的重定向脚本：/zh-cn/xxx 应跳到 /zh-cn/404/（本地化版）。
// 再单独验证子路径 404（Netlify/Cloudflare 就近返回）本身已是本地化页。
const notFound = [];
const LANG_HREFLANG = { 'zh-cn': 'zh-Hans', ja: 'ja', fr: 'fr', 'zh-tw': 'zh-Hant', pt: 'pt', de: 'de' };
for (const [lang, prefix] of [['zh-cn', '/zh-cn'], ['ja', '/ja'], ['fr', '/fr']]) {
  try {
    await page.goto(`${BASE}${prefix}/this-page-does-not-exist/`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });
    // 等客户端重定向（location.replace）
    await page.waitForTimeout(1200);
    const info = await page.evaluate(() => ({
      url: location.pathname,
      lang: document.documentElement.lang,
      code: document.querySelector('.nf__code')?.textContent?.trim() ?? '',
      heading: document.querySelector('.nf__heading')?.textContent?.trim() ?? '',
    }));
    notFound.push({
      label: `${lang} 404 重定向`,
      ok: info.code === '404' && info.lang === LANG_HREFLANG[lang] && info.url.includes(`${prefix}/404`),
      detail: `${info.url} lang=${info.lang} "${info.heading}"`,
    });
  } catch (e) {
    notFound.push({ label: `${lang} 404 重定向`, ok: false, detail: String(e).slice(0, 80) });
  }
}
for (const [lang, prefix] of [['zh-tw', '/zh-tw'], ['pt', '/pt'], ['de', '/de']]) {
  try {
    const res = await fetch(`${BASE}${prefix}/404/`);
    const html = await res.text();
    const langAttr = html.match(/<html lang="([^"]*)"/)?.[1] ?? '';
    notFound.push({
      label: `${lang} 404 就近`,
      ok: res.ok && langAttr === LANG_HREFLANG[lang] && html.includes('nf__heading'),
      detail: `${res.status} lang=${langAttr}`,
    });
  } catch (e) {
    notFound.push({ label: `${lang} 404 就近`, ok: false, detail: String(e).slice(0, 80) });
  }
}

await browser.close();

// ---- 收尾项：法务页 / RSS / OG 图 ----
// 这三项是「页面能打开」之外最容易默默坏掉的：og:image 指到不存在的文件、
// 空语言生成空 feed、法务页只有英文 —— 全都 200，肉眼在浏览器里看不出来。
const legal = [];
for (const [lang, prefix] of [
  ['en', ''],
  ['zh-cn', '/zh-cn'],
  ['zh-tw', '/zh-tw'],
  ['ja', '/ja'],
  ['fr', '/fr'],
  ['pt', '/pt'],
  ['de', '/de'],
]) {
  for (const page of ['privacy', 'terms']) {
    try {
      const res = await fetch(`${BASE}${prefix}/${page}/`);
      const html = await res.text();
      const htmlLang = html.match(/<html lang="([^"]*)"/)?.[1] ?? '';
      const bodyLen = (html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? '').length;
      legal.push({
        label: `${lang}/${page}`,
        ok: res.ok && bodyLen > 800 && !html.includes('[object Object]'),
        detail: `${res.status} lang=${htmlLang} ${bodyLen}B`,
      });
    } catch (e) {
      legal.push({ label: `${lang}/${page}`, ok: false, detail: String(e).slice(0, 80) });
    }
  }
}

const feeds = [];
for (const [lang, prefix] of [
  ['en', ''],
  ['zh-cn', '/zh-cn'],
  ['zh-tw', '/zh-tw'],
  ['ja', '/ja'],
  ['fr', '/fr'],
  ['pt', '/pt'],
  ['de', '/de'],
]) {
  try {
    const res = await fetch(`${BASE}${prefix}/rss.xml`);
    const xml = await res.text();
    const items = (xml.match(/<item>/g) ?? []).length;
    // XML 里只要有一个裸 & 整份 feed 就解不开，浏览器只会显示「解析失败」。
    // 这里不引 XML 解析器，直接查未转义的 & —— 够用且零依赖。
    const bareAmp = /&(?!amp;|lt;|gt;|quot;|apos;|#)/.test(xml);
    const wellFormed = xml.startsWith('<?xml') && xml.trimEnd().endsWith('</rss>') && !bareAmp;
    feeds.push({
      label: `${lang} rss`,
      ok: res.ok && items > 0 && wellFormed,
      detail: `${items} 条${bareAmp ? ' 有未转义 &' : ''}`,
    });
  } catch (e) {
    feeds.push({ label: `${lang} rss`, ok: false, detail: String(e).slice(0, 80) });
  }
}
// 每个语言现在都有文章，feed 应当存在且有内容。
// 之前断言 fr/pt/de 返回 404，是因为那三语还没有文章 —— 断言随内容补齐而失效。

const ogs = [];
for (const slug of ['home', 'markdown-to-word', 'markdown-to-pdf', 'word-to-markdown']) {
  const url = `${BASE}/og/${slug}.png`;
  try {
    const res = await fetch(url);
    const buf = Buffer.from(await res.arrayBuffer());
    const isPng = buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    ogs.push({
      label: `og/${slug}.png`,
      ok: res.ok && isPng && w === 1200 && h === 630,
      detail: `${res.status} ${w}x${h} ${(buf.length / 1024).toFixed(0)}KB`,
    });
  } catch (e) {
    ogs.push({ label: `og/${slug}.png`, ok: false, detail: String(e).slice(0, 80) });
  }
}

// ---- 输出 ----
let fail = 0;
console.log('\n================ 18 个工具链路 ================');
for (const r of results) {
  if (!r.ok) fail++;
  const tag = r.ok ? 'PASS' : 'FAIL';
  console.log(
    `${tag}  ${r.slug.padEnd(26)} in=${String(r.inputLen ?? 0).padStart(5)} out=${String(r.outLen ?? 0).padStart(5)}  ${r.ok ? r.head : r.err ?? '空输出'}`,
  );
}
console.log('\n================ 下载链路 ================');
for (const d of downloads) {
  if (!d.ok) fail++;
  console.log(`${d.ok ? 'PASS' : 'FAIL'}  ${d.slug.padEnd(26)} ${d.ok ? `${d.name}` : d.err}`);
}
console.log('\n================ blog 链路 ================');
for (const b of blogs) {
  if (!b.ok) fail++;
  console.log(
    `${b.ok ? 'PASS' : 'FAIL'}  ${b.label.padEnd(26)} 文章=${b.posts ?? 0} 正文=${b.bodyLen ?? 0} 字符 hreflang=${b.alts ?? 0} ${b.err ?? ''}`,
  );
}
console.log('\n================ 法务页（7 语言） ================');
for (const l of legal) {
  if (!l.ok) fail++;
  console.log(`${l.ok ? 'PASS' : 'FAIL'}  ${l.label.padEnd(26)} ${l.detail}`);
}
console.log('\n================ RSS feed ================');
for (const f of feeds) {
  if (!f.ok) fail++;
  console.log(`${f.ok ? 'PASS' : 'FAIL'}  ${f.label.padEnd(26)} ${f.detail}`);
}
console.log('\n================ OG 图 ================');
for (const o of ogs) {
  if (!o.ok) fail++;
  console.log(`${o.ok ? 'PASS' : 'FAIL'}  ${o.label.padEnd(26)} ${o.detail}`);
}
console.log('\n================ 404 页 ================');
for (const n of notFound) {
  if (!n.ok) fail++;
  console.log(`${n.ok ? 'PASS' : 'FAIL'}  ${n.label.padEnd(26)} ${n.detail}`);
}
console.log(`\n控制台错误 ${errors.length} 条`);
const appErrors = errors.filter((e) => !/Failed to load resource/.test(e));
if (errors.length > appErrors.length) {
  console.log(`  （其中 ${errors.length - appErrors.length} 条为「故意访问错误 URL」产生的资源 404，非应用错误）`);
}
appErrors.slice(0, 6).forEach((e) => console.log('  ! ' + e));
console.log(`\n失败 ${fail} 项`);
process.exit(fail > 0 ? 1 : 0);
