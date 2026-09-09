import { inlineToPlain, parseMarkdown, renderInline, type AstNode } from './ast.ts';
import { textFileConverter } from './types.ts';

/**
 * Markdown → reStructuredText。
 *
 * 两个 reST 特有的坑：
 *   1. 标题下划线必须不短于标题本身，短了 Sphinx 直接报错
 *   2. 表格用 list-table 而不是 simple table —— 后者要求列宽严格对齐，
 *      单元格里有中文时按字符宽度算列宽必错，list-table 没有这个问题
 */

const UNDERLINES = ['=', '-', '~', '^', '"', '+', '*'];

function inlineRst(source: string): string {
  return renderInline(source, {
    code: (text) => `\`\`${text}\`\``,
    link: (text, url) => `\`${text} <${url}>\`_`,
    image: (alt, url) => `|${alt || 'image'}|`,
    bold: (text) => `**${text}**`,
    italic: (text) => `*${text}*`,
    strike: (text) => text,
  });
}

function indent(value: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return value
    .split('\n')
    .map((line) => (line.trim() ? pad + line : line))
    .join('\n');
}

function renderNodes(nodes: AstNode[]): string[] {
  const out: string[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case 'heading': {
        const text = inlineRst(node.inline);
        const char = UNDERLINES[Math.min(node.level - 1, UNDERLINES.length - 1)];
        // 按显示宽度算：中文占两格
        const width = [...inlineToPlain(node.inline)].reduce(
          (sum, ch) => sum + (/[一-鿿　-〿]/.test(ch) ? 2 : 1),
          0,
        );
        out.push(`${text}\n${char.repeat(Math.max(width, 4))}`);
        break;
      }
      case 'paragraph': {
        out.push(inlineRst(node.inline));
        break;
      }
      case 'code': {
        out.push(`.. code-block:: ${node.lang || 'text'}\n\n${indent(node.code.replace(/\n+$/, ''), 3)}`);
        break;
      }
      case 'blockquote': {
        out.push(indent(renderNodes(node.children).join('\n\n'), 3));
        break;
      }
      case 'list': {
        node.items.forEach((item, index) => {
          const marker = node.ordered ? `${index + 1}. ` : '- ';
          const body = renderNodes(item).join('\n\n');
          out.push(`${marker}${indent(body, marker.length).trimStart()}`);
        });
        break;
      }
      case 'table': {
        if (node.head.length === 0) break;
        const rows = [node.head, ...node.rows];
        const lines = ['.. list-table::', '   :header-rows: 1', ''];
        rows.forEach((row, rowIndex) => {
          row.forEach((cell, cellIndex) => {
            const prefix = cellIndex === 0 ? '   * - ' : '     - ';
            lines.push(prefix + inlineRst(cell));
          });
          if (rowIndex < rows.length - 1) lines.push('');
        });
        out.push(lines.join('\n'));
        break;
      }
      case 'rule': {
        out.push('----');
        break;
      }
      case 'raw': {
        out.push(`.. 原始 HTML 块已省略（${node.html.trim().slice(0, 40)}…）`);
        break;
      }
    }
  }

  return out;
}

export default textFileConverter('rst', 'rst', 'text/x-rst', (source) =>
  renderNodes(parseMarkdown(source)).join('\n\n'),
);
