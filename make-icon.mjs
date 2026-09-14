/**
 * 生成 PWA / iOS 图标（PNG）。
 * 与 make-og.mjs 同一套路数：用系统里已有的 chromium 渲染 HTML 再截图，
 * 不引入 sharp / resvg 这类原生依赖（沙箱里装原生依赖很麻烦）。
 *
 * 用法：node make-icon.mjs
 */
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const EXEC = join(
  homedir(),
  'Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
);

const OUT = new URL('./public/', import.meta.url);

/**
 * iOS 会自己给 apple-touch-icon 叠圆角遮罩，源图再带圆角就会显得偏小 —— 所以它不设圆角。
 * manifest 图标（PWA）则由各平台按需裁切，带一点圆角观感更好。
 */
function iconHtml(size, { rounded }) {
  const radius = rounded ? Math.round(size * 0.22) : 0;
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${size}px; height: ${size}px;
    background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
    border-radius: ${radius}px;
    display: flex; align-items: center; justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    overflow: hidden;
  }
  .md {
    color: #fff; font-weight: 800; font-size: ${Math.round(size * 0.4)}px;
    letter-spacing: -${Math.round(size * 0.02)}px; line-height: 1;
  }
</style></head><body><div class="md">MD</div></body></html>`;
}

const targets = [
  { file: 'apple-touch-icon.png', size: 180, rounded: false },
  { file: 'icons/icon-192.png', size: 192, rounded: true },
  { file: 'icons/icon-512.png', size: 512, rounded: true },
];

mkdirSync(new URL('./icons/', OUT), { recursive: true });

const browser = await chromium.launch({
  executablePath: EXEC,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

for (const t of targets) {
  const page = await browser.newPage({
    viewport: { width: t.size, height: t.size },
    deviceScaleFactor: 1,
  });
  await page.setContent(iconHtml(t.size, t), { waitUntil: 'load' });
  await page.screenshot({
    path: new URL(t.file, OUT).pathname,
    type: 'png',
    omitBackground: true,
  });
  await page.close();
  console.log(`✓ ${t.file} (${t.size}×${t.size})`);
}

await browser.close();
console.log('\n图标生成完毕 -> public/');
