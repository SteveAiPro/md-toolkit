import { parseMarkdown, renderInline, type AstNode } from './ast.ts';
import { textFileConverter } from './types.ts';

/**
 * Markdown → LaTeX。
 *
 * 只输出正文片段，不生成 \documentclass 前导区 —— 用户是插进自己的模板里，
 * 自作主张加 preamble 反而会和人家的宏包冲突。
 * 用到了 \sout 与 \includegraphics，需要 ulem 和 graphicx，在页面说明里提示。
 */

const ESCAPES: Record<string, string> = {
  '\\': '\\textbackslash{}',
  '&': '\\&',
  '%': '\\%',
  $: '\\$',
  '#': '\\#',
  _: '\\_',
  '{': '\\{',
  '}': '\\}',
  '~': '\\textasciitilde{}',
  '^': '\\textasciicircum{}',
};

function escape(value: string): string {
  return value.replace(/[\\&%$#_{}~^]/g, (char) => ESCAPES[char] ?? char);
}

function inlineLatex(source: string): string {
  return renderInline(
    source,
    {
      code: (text) => `\\texttt{${escape(text)}}`,
      link: (text, url) => `\\href{${url}}{${escape(text)}}`,
      image: (alt, url) => `\\includegraphics[width=0.8\\linewidth]{${url}}`,
      bold: (text) => `\\textbf{${escape(text)}}`,
      italic: (text) => `\\emph{${escape(text)}}`,
      strike: (text) => `\\sout{${escape(text)}}`,
    },
    escape,
  );
}

const SECTIONS = ['section', 'subsection', 'subsubsection', 'paragraph', 'subparagraph'];

function renderNodes(nodes: AstNode[]): string[] {
  const out: string[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case 'heading': {
        const command = SECTIONS[Math.min(node.level - 1, SECTIONS.length - 1)];
        out.push(`\\${command}{${inlineLatex(node.inline)}}`);
        break;
      }
      case 'paragraph': {
        out.push(inlineLatex(node.inline));
        break;
      }
      case 'code': {
        // verbatim 是 LaTeX 内核自带环境，不依赖 listings/minted
        // token.content 自带结尾换行，不去掉会在环境里多出一个空行
        out.push(`\\begin{verbatim}\n${node.code.replace(/\n+$/, '')}\n\\end{verbatim}`);
        break;
      }
      case 'blockquote': {
        // 环境与表格整体成一个块，否则会被 join('\n\n') 在内部插空行
        out.push(`\\begin{quote}\n${renderNodes(node.children).join('\n\n')}\n\\end{quote}`);
        break;
      }
      case 'list': {
        const env = node.ordered ? 'enumerate' : 'itemize';
        const body = node.items
          .map((item) => `  \\item ${renderNodes(item).join('\n  ')}`)
          .join('\n');
        out.push(`\\begin{${env}}\n${body}\n\\end{${env}}`);
        break;
      }
      case 'table': {
        if (node.head.length === 0) break;
        const columns = node.head.length;
        const spec = `|${Array(columns).fill('c').join('|')}|`;
        const lines = [
          `\\begin{center}`,
          `\\begin{tabular}{${spec}}`,
          '\\hline',
          `${node.head.map(inlineLatex).join(' & ')} \\\\`,
          '\\hline',
        ];
        node.rows.forEach((row) => {
          const cells = Array.from({ length: columns }, (_, index) => inlineLatex(row[index] ?? ''));
          lines.push(`${cells.join(' & ')} \\\\`, '\\hline');
        });
        lines.push('\\end{tabular}', '\\end{center}');
        out.push(lines.join('\n'));
        break;
      }
      case 'rule': {
        out.push('\\noindent\\rule{\\linewidth}{0.4pt}');
        break;
      }
      case 'raw': {
        out.push(`% 原始 HTML 块已省略（${node.html.trim().slice(0, 40)}…）`);
        break;
      }
    }
  }

  return out;
}

export default textFileConverter('latex', 'tex', 'application/x-tex', (source) =>
  renderNodes(parseMarkdown(source)).join('\n\n'),
);
