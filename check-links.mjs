/**
 * 站内死链扫描：读 dist 里所有 HTML 的 href，逐个确认目标页面存在。
 *
 * 用法：先 npm run build，再 npm run check:links
 *
 * 为什么需要它：改一次 URL 规则（比如给 blog 换路径、给语言加前缀）
 * 会让几十个页面的内链同时失效，而构建和 e2e 都不会报错 ——
 * e2e 只跑几个固定 URL，扫不到。这类问题只能全量扫。
 *
 * 只查站内绝对路径（以 / 开头），外链和静态资源（png/css/js）跳过。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const htmls = [];
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) htmls.push(p);
  }
})(DIST);

const pages = new Set();
for (const f of htmls) {
  let rel = '/' + f.slice(DIST.length + 1).replace(/index\.html$/, '');
  if (!rel.endsWith('/')) rel += '/';
  pages.add(rel.replace(/\/+/g, '/'));
}

const bad = new Map();
for (const f of htmls) {
  const html = readFileSync(f, 'utf8');
  for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    let u = m[1];
    // 尾段带扩展名的一律当静态资源跳过（png/svg/xml/txt/ico/webmanifest…）。
    // 与其不断往枚举里补扩展名，不如用「带点就是文件」这个规则：
    // 本站点是 trailingSlash: always，站内页面永远是 /foo/ 目录形式，不可能带点。
    if (/\.[a-z0-9]+$/i.test(u)) continue;
    if (!u.endsWith('/')) u += '/';
    u = u.replace(/\/+/g, '/');
    if (!pages.has(u)) {
      if (!bad.has(u)) bad.set(u, new Set());
      bad.get(u).add(f);
    }
  }
}
console.log(`扫描 ${htmls.length} 个页面，内部链接目标 ${pages.size} 个`);
if (bad.size === 0) console.log('✓ 无死链');
else {
  console.log(`✗ ${bad.size} 个死链目标：`);
  for (const [u, from] of [...bad].slice(0, 20)) {
    console.log(`   ${u}   ← ${from.size} 处 (例: ${[...from][0]})`);
  }
}
