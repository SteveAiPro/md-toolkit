import type Token from 'markdown-it/lib/token.mjs';
import { getMd } from '../markdown.ts';

/**
 * Markdown → 通用中间 AST。
 *
 * md-to.com 的 LaTeX / reST / Confluence 三个方向各写了一遍解析，
 * 这里抽成一层：md.token 树 → AST，三个渲染器只负责把 AST 刷成目标语法。
 *
 * inline 字段刻意保留原始 Markdown 行内语法（**bold**、[t](u) 等），
 * 由各渲染器自己决定怎么翻 —— 目标语法差异太大，提前统一反而丢信息。
 */
export type AstNode =
  | { type: 'heading'; level: number; inline: string }
  | { type: 'paragraph'; inline: string }
  | { type: 'code'; lang: string; code: string }
  | { type: 'blockquote'; children: AstNode[] }
  | { type: 'list'; ordered: boolean; items: AstNode[][] }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'rule' }
  | { type: 'raw'; html: string };

/** 找到与 tokens[start] 配对的 close，支持嵌套 */
function findClose(tokens: Token[], start: number, openType: string, closeType: string): number {
  let depth = 0;
  for (let i = start; i < tokens.length; i += 1) {
    if (tokens[i].type === openType) depth += 1;
    else if (tokens[i].type === closeType) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return tokens.length - 1;
}

function walk(tokens: Token[], start: number, end: number): AstNode[] {
  const nodes: AstNode[] = [];
  let i = start;

  while (i < end && i < tokens.length) {
    const token = tokens[i];

    switch (token.type) {
      case 'heading_open': {
        nodes.push({
          type: 'heading',
          level: Number(token.tag.slice(1)) || 1,
          inline: tokens[i + 1]?.content ?? '',
        });
        i += 3;
        break;
      }
      case 'paragraph_open': {
        nodes.push({ type: 'paragraph', inline: tokens[i + 1]?.content ?? '' });
        i += 3;
        break;
      }
      case 'fence':
      case 'code_block': {
        nodes.push({ type: 'code', lang: (token.info || '').trim().split(/\s+/)[0], code: token.content });
        i += 1;
        break;
      }
      case 'blockquote_open': {
        const close = findClose(tokens, i, 'blockquote_open', 'blockquote_close');
        nodes.push({ type: 'blockquote', children: walk(tokens, i + 1, close) });
        i = close + 1;
        break;
      }
      case 'bullet_list_open':
      case 'ordered_list_open': {
        const openType = token.type;
        const closeType = openType === 'bullet_list_open' ? 'bullet_list_close' : 'ordered_list_close';
        const close = findClose(tokens, i, openType, closeType);
        const items: AstNode[][] = [];
        let j = i + 1;
        while (j < close) {
          if (tokens[j].type === 'list_item_open') {
            const itemClose = findClose(tokens, j, 'list_item_open', 'list_item_close');
            items.push(walk(tokens, j + 1, itemClose));
            j = itemClose + 1;
          } else {
            j += 1;
          }
        }
        nodes.push({ type: 'list', ordered: openType === 'ordered_list_open', items });
        i = close + 1;
        break;
      }
      case 'table_open': {
        const close = findClose(tokens, i, 'table_open', 'table_close');
        const head: string[] = [];
        const rows: string[][] = [];
        let j = i + 1;
        while (j < close) {
          if (tokens[j].type === 'tr_open') {
            const trClose = findClose(tokens, j, 'tr_open', 'tr_close');
            const cells: string[] = [];
            for (let k = j + 1; k < trClose; k += 1) {
              if (tokens[k].type === 'th_open' || tokens[k].type === 'td_open') {
                cells.push(tokens[k + 1]?.content ?? '');
              }
            }
            if (tokens[j + 1]?.type === 'th_open') head.push(...cells);
            else rows.push(cells);
            j = trClose + 1;
          } else {
            j += 1;
          }
        }
        nodes.push({ type: 'table', head, rows });
        i = close + 1;
        break;
      }
      case 'hr': {
        nodes.push({ type: 'rule' });
        i += 1;
        break;
      }
      case 'html_block': {
        nodes.push({ type: 'raw', html: token.content });
        i += 1;
        break;
      }
      default:
        i += 1;
    }
  }

  return nodes;
}

export function parseMarkdown(source: string): AstNode[] {
  return walk(getMd().parse(source, {}), 0, Number.MAX_SAFE_INTEGER);
}

export interface InlineRenderer {
  code(text: string): string;
  link(text: string, url: string): string;
  image(alt: string, url: string): string;
  bold(text: string): string;
  italic(text: string): string;
  strike(text: string): string;
}

/**
 * 行内语法转换。
 *
 * 用占位符先把已处理片段抽出来，避免后一轮正则误伤前一轮的产物
 * （比如链接文字里的 * 被当成斜体）。
 */
/**
 * escapeText 只作用于「未被任何行内标记覆盖」的裸文本。
 * LaTeX 必须用它转义 _ & % 之类，否则编译直接报错；
 * 但绝不能碰 \texttt{} 这类已生成的目标语法。
 */
export function renderInline(
  source: string,
  renderer: InlineRenderer,
  escapeText?: (text: string) => string,
): string {
  const slots: string[] = [];
  // 用不可见控制符做占位界定，避免误替换正文里的普通数字
  const MARK = '\u0000';
  const hold = (html: string): string => {
    slots.push(html);
    return `${MARK}${slots.length - 1}${MARK}`;
  };

  let out = source;

  out = out.replace(/`([^`]+)`/g, (_, code: string) => hold(renderer.code(code)));
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, alt: string, url: string) =>
    hold(renderer.image(alt, url)),
  );
  out = out.replace(/\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, text: string, url: string) =>
    hold(renderer.link(text, url)),
  );
  out = out.replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, (_, __, text: string) => hold(renderer.bold(text)));
  out = out.replace(/~~(?=\S)([\s\S]*?\S)~~/g, (_, text: string) => hold(renderer.strike(text)));
  out = out.replace(/(?<![*\w])\*(?=\S)([^*]*?\S)\*(?!\*)/g, (_, text: string) => hold(renderer.italic(text)));
  out = out.replace(/(?<![_\w])_(?=\S)([^_]*?\S)_(?!_)/g, (_, text: string) => hold(renderer.italic(text)));

  if (escapeText) {
    out = out
      .split(new RegExp(`(${MARK}\\d+${MARK})`))
      .map((part) => (part.startsWith(MARK) ? part : escapeText(part)))
      .join('');
  }

  return out.replace(new RegExp(`${MARK}(\\d+)${MARK}`, 'g'), (_, index: string) => slots[Number(index)] ?? '');
}

/** 去掉行内 Markdown 语法，只留文字 */
export function inlineToPlain(source: string): string {
  return renderInline(source, {
    code: (text) => text,
    link: (text) => text,
    image: (alt) => alt,
    bold: (text) => text,
    italic: (text) => text,
    strike: (text) => text,
  });
}
