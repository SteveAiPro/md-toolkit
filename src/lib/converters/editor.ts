import { downloadText } from '../download.ts';
import { renderMarkdown } from '../markdown.ts';
import { sanitize } from '../sanitize.ts';
import { requireText, type Converter } from './types.ts';

/**
 * Markdown 编辑器。
 *
 * 它不「转换」成别的格式 —— 左边写、右边实时预览，下载拿回 .md 源文件。
 * 之所以单独占一个页面而不是复用 md→html：这个词（markdown editor）
 * 的搜索量比 markdown to html 还大，值得一个独立的落地页。
 */
export const editorConverter: Converter = {
  id: 'editor',

  async transform(input) {
    return sanitize(renderMarkdown(requireText(input)));
  },

  async download(input, filenameBase) {
    downloadText(requireText(input), `${filenameBase}.md`, 'text/markdown');
  },
};

export default editorConverter;
