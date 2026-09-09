import { OVERLAY_CSS, PRINT_CSS } from '../../styles/print.ts';
import { renderMarkdown } from '../markdown.ts';
import { sanitize } from '../sanitize.ts';
import { requireText, type Converter } from './types.ts';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let overlayStyleInjected = false;

function ensureOverlayStyle(): void {
  if (overlayStyleInjected || document.getElementById('print-overlay-style')) return;
  const style = document.createElement('style');
  style.id = 'print-overlay-style';
  style.textContent = OVERLAY_CSS;
  document.head.appendChild(style);
  overlayStyleInjected = true;
}

/**
 * 原生浏览器打印预览。
 *
 * 为什么不用 html2pdf.js / jsPDF + html2canvas：
 * 那条路把 DOM 截图成位图再拼 PDF，文字不可选、链接丢失、长文档内存爆掉，
 * 分页靠 JS 算像素高度，代码块和长列表会被从中间切开。
 * 走浏览器打印引擎，PDF 是矢量的，分页交给 CSS @media print，又快又准。
 */
export function openPrintPreview(html: string, title: string): void {
  ensureOverlayStyle();

  const overlay = document.createElement('div');
  overlay.className = 'print-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="print-overlay__bar">
      <span class="print-overlay__title">${escapeHtml(title)}</span>
      <div class="print-overlay__actions">
        <button type="button" class="print-overlay__btn" data-action="cancel">Cancel</button>
        <button type="button" class="print-overlay__btn print-overlay__btn--primary" data-action="print">Print / Save as PDF</button>
      </div>
    </div>
    <iframe class="print-overlay__frame" title="Print preview"></iframe>
    <p class="print-overlay__hint">In the print dialog choose "Save as PDF".</p>
  `;

  const frame = overlay.querySelector('iframe') as HTMLIFrameElement;
  document.body.appendChild(overlay);

  const doc = frame.contentDocument ?? frame.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(
      `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${escapeHtml(
        title,
      )}</title><style>${PRINT_CSS}</style></head><body>${html}</body></html>`,
    );
    doc.close();

    // 内容高度稳定后再撑开 iframe，避免首屏只显示一截
    window.setTimeout(() => {
      const height = doc.body?.scrollHeight ?? 800;
      frame.style.height = `${Math.max(height + 40, 800)}px`;
    }, 120);
  }

  const close = () => overlay.remove();

  overlay.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const action = target.dataset?.action;
    if (action === 'cancel') close();
    if (action === 'print') {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
    }
    if (target === overlay) close();
  });

  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      close();
      document.removeEventListener('keydown', onKey);
    }
  };
  document.addEventListener('keydown', onKey);
}

export const pdfConverter: Converter = {
  id: 'pdf',

  async transform(input) {
    return sanitize(renderMarkdown(requireText(input)));
  },

  async download(input, filenameBase) {
    openPrintPreview(renderMarkdown(requireText(input)), filenameBase);
  },
};
