import { TOOLS, type ToolDef } from '../tools.ts';

/**
 * 反向转换对：用户刚把 Markdown 转成 Word，下一步大概率想把 Word 转回来。
 * 这类链接的点击意图最强，权重给到最高。
 */
const REVERSE_PAIRS: [string, string][] = [
  ['markdown-to-word', 'word-to-markdown'],
  ['markdown-to-pdf', 'pdf-to-markdown'],
  ['markdown-to-html', 'html-to-markdown'],
  ['markdown-to-latex', 'latex-to-markdown'],
  ['markdown-table-to-csv', 'csv-to-markdown-table'],
];

const REVERSE = new Map<string, string>();
for (const [a, b] of REVERSE_PAIRS) {
  REVERSE.set(a, b);
  REVERSE.set(b, a);
}

/**
 * 主题分组：同一类任务下的工具互为补充。
 * 例：在处理表格的人，通常需要 csv/json 互转 + 表格导出 PDF/图片。
 */
const THEMES: Record<string, string[]> = {
  table: [
    'csv-to-markdown-table',
    'json-to-markdown-table',
    'markdown-table-to-csv',
    'markdown-table-to-pdf',
    'markdown-table-to-image',
  ],
  export: ['markdown-to-word', 'markdown-to-pdf', 'markdown-to-html', 'markdown-to-image'],
  import: ['word-to-markdown', 'pdf-to-markdown', 'html-to-markdown', 'latex-to-markdown'],
  plain: ['markdown-to-text', 'markdown-to-rst', 'markdown-to-confluence'],
};

const THEME_OF = new Map<string, Set<string>>();
for (const [theme, slugs] of Object.entries(THEMES)) {
  for (const slug of slugs) {
    if (!THEME_OF.has(slug)) THEME_OF.set(slug, new Set());
    THEME_OF.get(slug)!.add(theme);
  }
}

function score(self: ToolDef, other: ToolDef): number {
  if (other.slug === self.slug) return -1;

  let s = 0;

  if (REVERSE.get(self.slug) === other.slug) s += 100;

  const mine = THEME_OF.get(self.slug);
  const theirs = THEME_OF.get(other.slug);
  if (mine && theirs) {
    let shared = 0;
    for (const theme of mine) if (theirs.has(theme)) shared++;
    s += shared * 40;
  }

  // 输入/输出形态一致意味着界面与心智模型接近，作为兜底信号
  if (other.inputKind === self.inputKind) s += 15;
  if (other.outputKind === self.outputKind) s += 5;
  if (other.direction === self.direction) s += 5;

  return s;
}

/**
 * 返回与当前工具最相关的 N 个工具（不含自身）。
 * 保证结果稳定：先按分数降序，同分再按 TOOLS 中的原始顺序，
 * 避免构建间顺序抖动导致无意义的内容 diff。
 */
export function relatedTools(tool: ToolDef, limit = 6): ToolDef[] {
  const ranked = TOOLS.map((other, i) => ({ other, i, s: score(tool, other) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => (b.s !== a.s ? b.s - a.s : a.i - b.i))
    .slice(0, limit)
    .map((r) => r.other);

  // 分数兜底：若该工具过于独特导致候选不足，用同源输入的工具补齐
  if (ranked.length < limit) {
    const have = new Set(ranked.map((t) => t.slug));
    for (const other of TOOLS) {
      if (ranked.length >= limit) break;
      if (other.slug === tool.slug || have.has(other.slug)) continue;
      ranked.push(other);
    }
  }

  return ranked;
}
