import { parseCsv, toMarkdownTable } from './table.ts';
import { textFileConverter } from './types.ts';

/**
 * CSV → Markdown 表格。
 *
 * 分隔符交给 papaparse 嗅探（逗号 / 分号 / 制表符都能识别），
 * 比自己按逗号 split 靠谱得多 —— 引号里含逗号的字段是最常见的翻车点。
 */

function convert(source: string): string {
  const rows = parseCsv(source);
  const [head, ...body] = rows;
  return toMarkdownTable(
    head ?? [],
    body.map((row) => row ?? []),
  );
}

export default textFileConverter('csvToTable', 'md', 'text/markdown', convert);
