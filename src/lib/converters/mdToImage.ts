import { toPng } from 'html-to-image';
import { downloadBlob } from '../download.ts';
import { renderMarkdown } from '../markdown.ts';
import { sanitize } from '../sanitize.ts';
import { requireText, type Converter } from './types.ts';

/**
 * Markdown → 长图 PNG。
 *
 * 走 html-to-image 的 foreignObject 方案（DOM → SVG → Canvas）。
 * 这条路的三个已知边界，都在调用前处理掉了：
 *   1. 必须等所有 <img> 加载完再截图，否则图是空的
 *   2. 跨域图片没有 CORS 头时 Canvas 会被污染，toPng 直接抛错 —— 转成可读提示
 *   3. 截图节点必须在文档流里（离屏但可见），display:none 的节点量不到尺寸
 */

function waitForImages(host: HTMLElement): Promise<void> {
  const images = Array.from(host.querySelectorAll('img'));
  return Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }
          image.addEventListener('load', () => resolve(), { once: true });
          image.addEventListener('error', () => resolve(), { once: true });
        }),
    ),
  ).then(() => undefined);
}

async function render(source: string): Promise<Blob> {
  const host = document.createElement('div');
  host.className = 'preview-body';
  // 离屏但仍在文档流中：display:none 会让 html-to-image 量到 0 宽高
  host.setAttribute(
    'style',
    'position:absolute;left:-100000px;top:0;width:900px;background:#ffffff;padding:48px;box-sizing:border-box;',
  );
  host.innerHTML = sanitize(renderMarkdown(source));
  document.body.appendChild(host);

  try {
    await waitForImages(host);
    // 给字体和 KaTeX 一帧时间完成布局
    await new Promise((resolve) => window.setTimeout(resolve, 120));

    const dataUrl = await toPng(host, {
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      backgroundColor: '#ffffff',
      cacheBust: true,
    });
    const response = await fetch(dataUrl);
    return await response.blob();
  } catch (error) {
    const message = (error as Error).message ?? '';
    if (/tainted|cors|cross-origin/i.test(message)) {
      throw new Error('文档里有跨域图片，浏览器不允许截图。请先把图片存到本地再试。');
    }
    throw error;
  } finally {
    host.remove();
  }
}

export const mdToImageConverter: Converter = {
  id: 'mdToImage',

  async transform(input) {
    return sanitize(renderMarkdown(requireText(input)));
  },

  async download(input, filenameBase) {
    downloadBlob(await render(requireText(input)), `${filenameBase}.png`);
  },
};

export default mdToImageConverter;
