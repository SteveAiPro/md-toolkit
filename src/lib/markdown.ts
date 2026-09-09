import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js/lib/common';
import * as katexMod from '@vscode/markdown-it-katex';
import * as emojiMod from 'markdown-it-emoji';
import * as taskListsMod from 'markdown-it-task-lists';
import * as footnoteMod from 'markdown-it-footnote';
import * as subMod from 'markdown-it-sub';
import * as supMod from 'markdown-it-sup';
import * as insMod from 'markdown-it-ins';
import * as markMod from 'markdown-it-mark';
import * as deflistMod from 'markdown-it-deflist';
import * as abbrMod from 'markdown-it-abbr';
import * as containerMod from 'markdown-it-container';

/**
 * 这些插件都是 CJS 写的，被打包器按 ESM 处理后导出形状各不相同：
 *   - 大多数：mod.default 就是插件函数
 *   - @vscode/markdown-it-katex：CJS 双重包装，要 mod.default.default 才拿得到
 *   - markdown-it-emoji：只有 bare / light / full 三个命名导出，没有 default
 * 直接 import default 会在构建期报 "x is not exported by ..."，
 * 而只回退到命名空间对象又会在运行时报 "u.apply is not a function"。
 * 所以这里逐个显式解包，不猜。
 */
type Maybe = Record<string, unknown>;

const katex = ((katexMod as Maybe).default as Maybe)?.default ?? (katexMod as Maybe).default ?? katexMod;
const emoji = (emojiMod as Maybe).full ?? (emojiMod as Maybe).light ?? emojiMod;
const taskLists = (taskListsMod as Maybe).default ?? taskListsMod;
const footnote = (footnoteMod as Maybe).default ?? footnoteMod;
const sub = (subMod as Maybe).default ?? subMod;
const sup = (supMod as Maybe).default ?? supMod;
const ins = (insMod as Maybe).default ?? insMod;
const mark = (markMod as Maybe).default ?? markMod;
const deflist = (deflistMod as Maybe).default ?? deflistMod;
const abbr = (abbrMod as Maybe).default ?? abbrMod;
const container = (containerMod as Maybe).default ?? containerMod;

/**
 * 高亮函数。md-to.com 打进了完整 highlight.js（1.4MB）；
 * 这里改用 lib/common（约 40 种常用语言），体积只有它的四分之一。
 */
function highlight(code: string, lang: string): string {
  const language = lang && hljs.getLanguage(lang) ? lang : null;
  if (language) {
    try {
      const out = hljs.highlight(code, { language, ignoreIllegals: true }).value;
      return `<pre class="hljs"><code class="hljs language-${language}">${out}</code></pre>`;
    } catch {
      /* 落到下面的纯文本转义 */
    }
  }
  return `<pre class="hljs"><code class="hljs">${escapeHtml(code)}</code></pre>`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * html: true 是必须的，否则用户粘贴的 HTML 表格/图片会被丢弃。
 * 代价是所有输出都必须过一遍 DOMPurify（见 sanitize.ts）。
 */
export function createMarkdown(): MarkdownIt {
  const md: MarkdownIt = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: false,
    typographer: false,
    highlight,
  });

  md.use(katex as MarkdownIt.PluginSimple)
    .use(emoji)
    .use(taskLists, { enabled: true, label: true })
    .use(footnote)
    .use(sub)
    .use(sup)
    .use(ins)
    .use(mark)
    .use(deflist)
    .use(abbr)
    .use(container, 'warning')
    .use(container, 'tip');

  return md;
}

let cached: MarkdownIt | null = null;

/** 拿到共享实例。LaTeX / reST / Confluence 转换器需要它的 token 树。 */
export function getMd(): MarkdownIt {
  if (!cached) cached = createMarkdown();
  return cached;
}

export function renderMarkdown(source: string): string {
  return getMd().render(source);
}
