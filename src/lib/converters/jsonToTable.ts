import { cellToString, collectKeys, toMarkdownTable } from './table.ts';
import { textFileConverter } from './types.ts';

/**
 * JSON → Markdown 表格。
 *
 * 对象数组是最常见的形态（接口返回值、导出数据）。
 * 各行字段不齐时按 key 的并集补空，不让表格错位。
 */

function convert(source: string): string {
  const trimmed = source.trim();
  if (!trimmed) return '';

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (error) {
    throw new Error(`JSON 解析失败：${(error as Error).message}`);
  }

  const list: Record<string, unknown>[] = Array.isArray(parsed)
    ? (parsed as Record<string, unknown>[]).map((item) =>
        item && typeof item === 'object' && !Array.isArray(item) ? item : { value: item },
      )
    : [parsed as Record<string, unknown>];

  const keys = collectKeys(list);
  if (keys.length === 0) return '';

  return toMarkdownTable(
    keys,
    list.map((item) => keys.map((key) => cellToString(item[key]))),
  );
}

export default textFileConverter('jsonToTable', 'md', 'text/markdown', convert);
