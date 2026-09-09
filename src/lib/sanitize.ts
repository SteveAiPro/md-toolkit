import DOMPurify from 'dompurify';

/**
 * markdown-it 开了 html:true，所以渲染结果必须清洗再插进 DOM。
 * 这里允许 KaTeX 的 MathML 和 task-list 的 checkbox，其余按默认策略处理。
 */
const BASE_CONFIG = {
  USE_PROFILES: { html: true, mathMl: true, svg: true },
  ADD_ATTR: ['target', 'rel', 'checked', 'disabled', 'type', 'id', 'class'],
  FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form'],
  ALLOW_DATA_ATTR: false,
} as const;

export function sanitize(dirty: string): string {
  return DOMPurify.sanitize(dirty, BASE_CONFIG);
}

/** 预览区用：允许 checkbox 交互，其余同上 */
export function sanitizeForPreview(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ...BASE_CONFIG });
}
