import Papa from 'papaparse';
import { parseMarkdown, type AstNode } from './ast.ts';

type TableNode = Extract<AstNode, { type: 'table' }>;

/**
 * 用户是整篇 Markdown 粘进来的，表格可能被包在引用或列表里，
 * 所以递归找第一个表格节点，而不是只看顶层。
 */
export function findFirstTable(source: string): TableNode | null {
  const search = (nodes: AstNode[]): TableNode | null => {
    for (const node of nodes) {
      if (node.type === 'table') return node;
      if (node.type === 'blockquote') {
        const hit = search(node.children);
        if (hit) return hit;
      }
      if (node.type === 'list') {
        for (const item of node.items) {
          const hit = search(item);
          if (hit) return hit;
        }
      }
    }
    return null;
  };
  return search(parseMarkdown(source));
}

export function tableToHtml(head: string[], rows: string[][]): string {
  if (head.length === 0) return '';
  const thead = `<thead><tr>${head.map((cell) => `<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead>`;
  const tbody = rows.length
    ? `<tbody>${rows
        .map((row) => `<tr>${head.map((_, i) => `<td>${escapeHtml(row[i] ?? '')}</td>`).join('')}</tr>`)
        .join('')}</tbody>`
    : '';
  return `<table>${thead}${tbody}</table>`;
}

function escapeHtml(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 单元格里的 | 和换行会撑坏 Markdown 表格结构，必须转义 */
export function escapeCell(value: string): string {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .trim();
}

export function toMarkdownTable(head: string[], rows: string[][]): string {
  if (head.length === 0) return '';
  const header = `| ${head.map(escapeCell).join(' | ')} |`;
  const divider = `| ${head.map(() => '---').join(' | ')} |`;
  const body = rows.map(
    (row) => `| ${head.map((_, index) => escapeCell(row[index] ?? '')).join(' | ')} |`,
  );
  return [header, divider, ...body].join('\n');
}

export function parseCsv(source: string): string[][] {
  const parsed = Papa.parse<string[]>(source.trim(), { skipEmptyLines: 'greedy' });
  const rows = (parsed.data ?? []).filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''));
  if (rows.length === 0) {
    throw new Error(parsed.errors[0]?.message ?? 'CSV 解析结果为空');
  }
  return rows;
}

export function toCsv(head: string[], rows: string[][]): string {
  const all = [head, ...rows];
  return Papa.unparse(all, { quotes: true });
}

/** 从对象数组里取出所有出现过的 key，保持首次出现顺序 */
export function collectKeys(items: Record<string, unknown>[]): string[] {
  const keys: string[] = [];
  items.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (!keys.includes(key)) keys.push(key);
    });
  });
  return keys;
}

export function cellToString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
