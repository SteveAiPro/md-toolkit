/**
 * 假本地化检查：抓构建产物，确认每个语言页的 title / h1 / 首个段落
 * 真的翻译了，而不是静默回落到英文。
 *
 * 用法：先 npm run build，再 node check-i18n.mjs
 * 退出码非 0 表示存在未翻译页面（可直接挂到 CI）。
 *
 * ⚠️ 已知局限：判定标准是「与英文版不同」，所以遇到同形词会误报。
 * 例如 fr / pt / de 里 "Blog" 就是 "Blog"，值相同并非回落。
 * 遇到这类误报，把文案改成带关键词的本地说法即可（顺带 SEO 也更好），
 * 不要为了让检查通过而硬凑不同的词。
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const DIST = new URL('./dist/', import.meta.url);
const LANGS = ['zh-cn', 'zh-tw', 'ja', 'fr', 'pt', 'de'];
/** 静态页不参与工具文案检查 */
const SKIP = new Set(['privacy', 'terms', '404', '_astro']);

/**
 * 工具清单从英文目录里扫出来，而不是在这里硬编码 ——
 * 上次硬编码的后果是新加 13 个工具后脚本只查了 5 个，
 * 本地化回落没人发现。
 */
function discoverTools() {
  const root = new URL('./', DIST);
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !SKIP.has(entry.name) && !LANGS.includes(entry.name))
    .map((entry) => entry.name)
    .sort();
}

const TOOLS = discoverTools();

function read(lang, tool) {
  // en 在根路径，其余带语言前缀
  const rel = lang === 'en' ? `${tool}/index.html` : `${lang}/${tool}/index.html`;
  const file = new URL(rel, DIST);
  return existsSync(file) ? readFileSync(file, 'utf8') : null;
}

function pick(html, re) {
  const m = html.match(re);
  return m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
}

const TITLE = /<title>([\s\S]*?)<\/title>/;
const H1 = /<h1[^>]*>([\s\S]*?)<\/h1>/;
// intro 段落：取 data-astro-cid 的第一个 <p>
const INTRO = /<p[^>]*data-astro-cid[^>]*>([\s\S]*?)<\/p>/;

let failures = 0;
const rows = [];

for (const tool of TOOLS) {
  const enHtml = read('en', tool);
  if (!enHtml) {
    console.error(`✗ 缺少英文基准页: ${tool}`);
    failures++;
    continue;
  }
  const en = {
    title: pick(enHtml, TITLE),
    h1: pick(enHtml, H1),
    intro: pick(enHtml, INTRO),
  };

  for (const lang of LANGS) {
    const html = read(lang, tool);
    if (!html) {
      console.error(`✗ 缺页: /${lang}/${tool}/`);
      failures++;
      continue;
    }
    const cur = {
      title: pick(html, TITLE),
      h1: pick(html, H1),
      intro: pick(html, INTRO),
    };

    const same = Object.keys(en).filter((k) => cur[k] && cur[k] === en[k]);
    if (same.length) {
      failures++;
      console.error(`✗ /${lang}/${tool}/ 回落英文字段: ${same.join(', ')}`);
      rows.push({ lang, tool, status: 'FALLBACK', missing: same.join(',') });
    } else {
      rows.push({ lang, tool, status: 'ok', sample: cur.h1.slice(0, 34) });
    }
  }
}

// 汇总表
console.log('\n语言本地化检查（title / h1 / intro 是否与英文不同）\n');
const pad = (s, n) => String(s).padEnd(n);
console.log(pad('lang', 8) + pad('tool', 22) + pad('status', 10) + 'h1 预览');
console.log('-'.repeat(70));
for (const r of rows) {
  console.log(pad(r.lang, 8) + pad(r.tool, 22) + pad(r.status, 10) + (r.sample ?? r.missing ?? ''));
}

console.log(`\n共 ${rows.length} 个语言页，${failures} 处问题`);
process.exit(failures ? 1 : 0);
