import { sanitize } from '../sanitize.ts';
import { inlineToPlain } from './ast.ts';
import { openPrintPreview } from './pdf.ts';
import { findFirstTable, tableToHtml } from './table.ts';
import type { Converter } from './types.ts';

/**
 * Markdown 表格 → PDF。
 *
 * 复用 md→pdf 的打印管线，只把内容换成单张表格。
 * 打印样式里已经让 table 不跨页断裂（break-inside: avoid），直接吃现成的。
 */

function tableOrThrow(source: string) {
  const table = findFirstTable(source);
  if (!table || table.head.length === 0) {
    throw new Error('没有找到 Markdown 表格，至少需要表头行与分隔行');
  }
  return table;
}

export const tableToPdfConverter: Converter = {
  id: 'tableToPdf',

  async transform(input) {
    const table = tableOrThrow(typeof input === 'string' ? input : '');
    return sanitize(tableToHtml(table.head.map(inlineToPlain), table.rows.map((row) => row.map(inlineToPlain))));
  },

  async download(input, filenameBase) {
    const table = tableOrThrow(typeof input === 'string' ? input : '');
    openPrintPreview(
      tableToHtml(table.head.map(inlineToPlain), table.rows.map((row) => row.map(inlineToPlain))),
      filenameBase,
    );
  },
};

export default tableToPdfConverter;
