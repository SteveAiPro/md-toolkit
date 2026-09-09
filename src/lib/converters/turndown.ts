import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { downloadText } from '../download.ts';
import { sanitize } from '../sanitize.ts';
import { requireText, type Converter } from './types.ts';

function createTurndown(): TurndownService {
  const service = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    fence: '```',
    emDelimiter: '*',
    strongDelimiter: '**',
    linkStyle: 'inlined',
  });

  service.use(gfm);

  // 让围栏代码块带上语言标记，转回 Markdown 时不会丢高亮信息
  service.addRule('fencedCodeWithLang', {
    filter: (node) =>
      node.nodeName === 'PRE' &&
      !!node.firstChild &&
      node.firstChild.nodeName === 'CODE',
    replacement: (_content, node) => {
      const code = node.firstChild as HTMLElement;
      const lang = (code.getAttribute('class') ?? '')
        .split(/\s+/)
        .find((c) => c.startsWith('language-'))
        ?.replace('language-', '');
      const text = code.textContent ?? '';
      return `\n\n\`\`\`${lang ?? ''}\n${text.replace(/\n$/, '')}\n\`\`\`\n\n`;
    },
  });

  return service;
}

let cached: TurndownService | null = null;

/** 供 word→md、pdf→md 复用：它们都是先拿到 HTML 再转 Markdown */
export function htmlToMarkdown(html: string): string {
  if (!cached) cached = createTurndown();
  return cached.turndown(sanitize(html));
}

export const turndownConverter: Converter = {
  id: 'turndown',

  async transform(input) {
    // 输入是 HTML：先清洗，避免把脚本结构带进转换流程
    return htmlToMarkdown(requireText(input));
  },

  async download(input, filenameBase) {
    downloadText(await turndownConverter.transform(input), `${filenameBase}.md`, 'text/markdown');
  },
};
