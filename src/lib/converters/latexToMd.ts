import { textFileConverter } from './types.ts';

/**
 * LaTeX → Markdown。
 *
 * 反向转换没有 token 树可用，只能逐行状态机：
 * verbatim / tabular / itemize / quote 都是有始有终的环境，
 * 靠正则一次替换必然把环境内部的 \\ 和 & 一起吃掉。
 */

const SECTION_LEVEL: Record<string, number> = {
  section: 1,
  subsection: 2,
  subsubsection: 3,
  paragraph: 4,
  subparagraph: 5,
};

function stripComment(line: string): string {
  return line.replace(/(?<!\\)%.*$/, '');
}

function inlineToMarkdown(source: string): string {
  return source
    .replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, '[$2]($1)')
    .replace(/\\url\{([^}]*)\}/g, '<$1>')
    .replace(/\\includegraphics(?:\[[^\]]*\])?\{([^}]*)\}/g, '![]($1)')
    .replace(/\\textbf\{([^}]*)\}/g, '**$1**')
    .replace(/\\(?:textit|emph)\{([^}]*)\}/g, '*$1*')
    .replace(/\\texttt\{([^}]*)\}/g, '`$1`')
    .replace(/\\sout\{([^}]*)\}/g, '~~$1~~')
    .replace(/\\underline\{([^}]*)\}/g, '$1')
    .replace(/\\(?:label|ref|cite|eqref|footnote)\{[^}]*\}/g, '')
    .replace(/\\textbackslash\{\}/g, '\\')
    .replace(/\\textasciitilde\{\}/g, '~')
    .replace(/\\textasciicircum\{\}/g, '^')
    .replace(/\\([&%$#_{}])/g, '$1')
    .replace(/\\\\/g, '\n');
}

function renderTabular(body: string[]): string {
  const rows = body
    .filter((line) => !/\\(hline|toprule|midrule|bottomrule|cline(?:\{[^}]*\})?)/.test(line))
    .join(' ')
    .split(/\\\\/)
    .map((row) =>
      row
        .split('&')
        .map((cell) =>
          inlineToMarkdown(
            cell
              .replace(/\\(?:begin|end)\{[^}]*\}/g, '')
              .replace(/\\(?:multicolumn)\{[^}]*\}\{[^}]*\}\{?([^}]*)\}?/g, '$1')
              .trim(),
          ),
        ),
    )
    .filter((row) => row.some((cell) => cell.length > 0));

  if (rows.length === 0) return '';

  const [head, ...rest] = rows;
  const columns = head.length;
  return [
    `| ${head.join(' | ')} |`,
    `| ${Array.from({ length: columns }, () => '---').join(' | ')} |`,
    ...rest.map((row) => `| ${Array.from({ length: columns }, (_, i) => row[i] ?? '').join(' | ')} |`),
  ].join('\n');
}

function convert(source: string): string {
  const out: string[] = [];
  let verbatim: string[] | null = null;
  let verbatimLang = '';
  let tabular: string[] | null = null;
  const listStack: Array<'ul' | 'ol'> = [];
  const counters: number[] = [];
  let inQuote = false;

  for (const rawLine of source.split('\n')) {
    // raw 保留前导空白（verbatim 与 tabular 的内容靠缩进），line 去掉（用于匹配命令）
    const raw = stripComment(rawLine).trimEnd();
    const line = raw.trim();

    if (verbatim) {
      if (/\\end\{(verbatim|lstlisting|minted|alltt)\}/.test(line)) {
        out.push(`\`\`\`${verbatimLang}`, ...verbatim, '```');
        verbatim = null;
      } else {
        verbatim.push(raw);
      }
      continue;
    }

    if (tabular) {
      if (/\\end\{tabular\}/.test(line)) {
        out.push(renderTabular(tabular), '');
        tabular = null;
      } else {
        tabular.push(raw);
      }
      continue;
    }

    const beginVerbatim = line.match(/\\begin\{(verbatim|lstlisting|minted|alltt)\}(?:\[(.*?)\])?/);
    if (beginVerbatim) {
      verbatimLang = beginVerbatim[2]?.match(/language=([\w+-]+)/)?.[1] ?? '';
      verbatim = [];
      continue;
    }

    if (/\\begin\{tabular\}/.test(line)) {
      tabular = [];
      continue;
    }

    if (/\\begin\{(itemize|enumerate)\}/.test(line)) {
      listStack.push(/enumerate/.test(line) ? 'ol' : 'ul');
      counters.push(0);
      continue;
    }
    if (/\\end\{(itemize|enumerate)\}/.test(line)) {
      listStack.pop();
      counters.pop();
      if (listStack.length === 0) out.push('');
      continue;
    }

    if (/\\begin\{quote\}/.test(line)) {
      inQuote = true;
      continue;
    }
    if (/\\end\{quote\}/.test(line)) {
      inQuote = false;
      out.push('');
      continue;
    }

    const section = line.match(/^\\(section|subsection|subsubsection|paragraph|subparagraph)\*?\{(.*)\}\s*$/);
    if (section) {
      out.push(`${'#'.repeat(SECTION_LEVEL[section[1]] ?? 1)} ${inlineToMarkdown(section[2])}`, '');
      continue;
    }

    const item = line.match(/^\\item\s*(.*)$/);
    // \item 常常带缩进，line 已经 trim 过所以这里能匹配到
    if (item) {
      const kind = listStack[listStack.length - 1] ?? 'ul';
      const pad = '  '.repeat(Math.max(listStack.length - 1, 0));
      if (kind === 'ol') {
        counters[counters.length - 1] += 1;
        out.push(`${pad}${counters[counters.length - 1]}. ${inlineToMarkdown(item[1])}`);
      } else {
        out.push(`${pad}- ${inlineToMarkdown(item[1])}`);
      }
      continue;
    }

    if (!line.trim()) {
      out.push('');
      continue;
    }

    let text = inlineToMarkdown(line);
    if (inQuote) text = `> ${text}`;
    out.push(text);
  }

  return `${out.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

export default textFileConverter('latexToMd', 'md', 'text/markdown', convert);
