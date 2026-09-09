import { parseMarkdown, renderInline, type AstNode } from './ast.ts';
import { textFileConverter } from './types.ts';

/**
 * Markdown → Confluence wiki markup。
 *
 * Confluence 的行内语法和 Markdown 长得像但不是一回事：
 * 链接是 [文字|地址] 而不是 [文字](地址)，图片是 !地址!，删除线是 -文字-。
 * 直接照搬 Markdown 写法会原样显示成纯文本。
 */

function inlineConfluence(source: string): string {
  return renderInline(source, {
    code: (text) => `{{${text}}}`,
    link: (text, url) => `[${text}|${url}]`,
    image: (alt, url) => `!${url}!`,
    bold: (text) => `*${text}*`,
    italic: (text) => `_${text}_`,
    strike: (text) => `-${text}-`,
  });
}

function renderNodes(nodes: AstNode[], depth = 0): string[] {
  const out: string[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case 'heading': {
        out.push(`h${Math.min(node.level, 6)}. ${inlineConfluence(node.inline)}`);
        break;
      }
      case 'paragraph': {
        out.push(inlineConfluence(node.inline));
        break;
      }
      case 'code': {
        const lang = node.lang ? `:language=${node.lang}` : '';
        out.push(`{code${lang}}\n${node.code.replace(/\n+$/, '')}\n{code}`);
        break;
      }
      case 'blockquote': {
        out.push(
          ...renderNodes(node.children, depth).map((line) =>
            line
              .split('\n')
              .map((part) => `bq. ${part}`)
              .join('\n'),
          ),
        );
        break;
      }
      case 'list': {
        const marker = node.ordered ? '#' : '*';
        node.items.forEach((item) => {
          const prefix = marker.repeat(depth + 1);
          const body = renderNodes(item, depth + 1);
          // 首行带标记，嵌套列表靠 marker 重复表示层级，不能再加缩进
          out.push(`${prefix} ${body[0] ?? ''}`, ...body.slice(1));
        });
        break;
      }
      case 'table': {
        if (node.head.length === 0) break;
        out.push(`||${node.head.map(inlineConfluence).join('||')}||`);
        node.rows.forEach((row) => {
          out.push(`|${row.map(inlineConfluence).join('|')}|`);
        });
        break;
      }
      case 'rule': {
        out.push('----');
        break;
      }
      case 'raw': {
        out.push(`{原始 HTML 块已省略：${node.html.trim().slice(0, 40)}…}`);
        break;
      }
    }
  }

  return out;
}

export default textFileConverter('confluence', 'txt', 'text/plain', (source) =>
  renderNodes(parseMarkdown(source)).join('\n\n'),
);
