import { inlineToPlain } from './ast.ts';
import { findFirstTable, toCsv } from './table.ts';
import { textFileConverter } from './types.ts';

/** Markdown 表格 → CSV */
function convert(source: string): string {
  const table = findFirstTable(source);
  if (!table || table.head.length === 0) {
    throw new Error('没有找到 Markdown 表格，至少需要表头行与分隔行');
  }
  return toCsv(
    table.head.map(inlineToPlain),
    table.rows.map((row) => row.map(inlineToPlain)),
  );
}

export default textFileConverter('tableToCsv', 'csv', 'text/csv', convert);
