import { downloadText } from '../download.ts';
import { htmlToMarkdown } from './turndown.ts';
import type { Converter } from './types.ts';

/**
 * Word → Markdown。
 *
 * 两段式：mammoth 把 .docx 解成 HTML，再交给 turndown 转成 Markdown。
 * 直接让 mammoth 输出 Markdown 是不行的 —— 它内建的 markdown 输出对
 * 表格和嵌套列表支持很弱，走 HTML 能吃到 turndown 的 GFM 表格规则。
 *
 * 注意只支持 .docx。老版 .doc 是 OLE2 复合二进制文档，
 * 浏览器端没有可用的解析库，必须让用户先用 Word 另存为 .docx。
 */

/**
 * mammoth 输出的表格一律是 <tbody> + <td>，一个 <th> 都没有。
 * turndown 的 GFM 表格规则靠 <th> 认表头，认不出就把整张表原样吐成 HTML ——
 * 结果就是「Word 转出来的表格还是 HTML」，等于没转。
 * 所以先补表头：没有 th 的表格，把第一行 td 提升成 th。
 */
/**
 * mammoth 给每个单元格都包一层 <p>，而 GFM 表格的单元格是单行语义。
 * 直接交给 turndown，块级元素会被插换行，转出来就是
 * `| \n\nFeature\n\n |` 这种一坨空行的残废表格。
 * 单段落保留加粗/斜体等行内格式；多段落只能压成一行，
 * 因为 Markdown 表格本身没有多行单元格的表示法。
 */
function flattenCell(cell: Element, doc: Document): void {
  const blocks = Array.from(cell.children).filter((el) =>
    /^(P|DIV|LI|H[1-6])$/.test(el.tagName),
  );
  if (blocks.length === 0) return;

  if (blocks.length === 1) {
    const block = blocks[0];
    while (block.firstChild) cell.insertBefore(block.firstChild, block);
    block.remove();
    return;
  }

  cell.textContent = blocks
    .map((b) => (b.textContent ?? '').trim())
    .filter(Boolean)
    .join(' ');
}

function promoteTableHeaders(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  doc.querySelectorAll('table').forEach((table) => {
    table.querySelectorAll('td, th').forEach((cell) => flattenCell(cell, doc));

    if (table.querySelector('th')) return;
    const firstRow = table.querySelector('tr');
    if (!firstRow) return;

    firstRow.querySelectorAll('td').forEach((cell) => {
      const th = doc.createElement('th');
      th.innerHTML = cell.innerHTML;
      cell.replaceWith(th);
    });

    const thead = doc.createElement('thead');
    thead.appendChild(firstRow);
    table.insertBefore(thead, table.firstChild);
  });

  return doc.body.innerHTML;
}
export const wordToMdConverter: Converter = {
  id: 'wordToMd',

  async transform(input) {
    if (typeof input === 'string') {
      throw new Error('Word 文档是二进制格式，请上传 .docx 文件而不是粘贴文本');
    }
    if (input.byteLength === 0) {
      throw new Error('文件内容为空');
    }

    const mammoth = (await import('mammoth/mammoth.browser.js')).default;
    const { value } = await mammoth.convertToHtml({ arrayBuffer: input });
    if (!value.trim()) {
      throw new Error('没能从文档里读到内容，可能是空文档或受保护的文件');
    }
    return htmlToMarkdown(promoteTableHeaders(value));
  },

  async download(input, filenameBase) {
    downloadText(await wordToMdConverter.transform(input), `${filenameBase}.md`, 'text/markdown');
  },
};

export default wordToMdConverter;
