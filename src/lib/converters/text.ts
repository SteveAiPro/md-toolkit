import { renderMarkdown } from '../markdown.ts';
import { sanitize } from '../sanitize.ts';
import { downloadText } from '../download.ts';
import { requireText, slugifyFilename, type Converter } from './types.ts';

/**
 * HTML -> 纯文本。先把块级元素换成换行，再剥标签，最后还原实体。
 * 顺序不能乱：<li> 要在剥标签之前替换成 "- "。
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote|pre|figcaption|section|table)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const textConverter: Converter = {
  id: 'text',

  async transform(input) {
    return htmlToPlainText(sanitize(renderMarkdown(requireText(input))));
  },

  async download(input, filenameBase) {
    const source = requireText(input);
    const title = slugifyFilename(source, filenameBase);
    downloadText(await textConverter.transform(source), `${title}.txt`, 'text/plain');
  },
};
