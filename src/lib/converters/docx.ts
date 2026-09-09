import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { sanitize } from '../sanitize.ts';
import { downloadBlob } from '../download.ts';
import { fitWidth, loadImageForDocx, type LoadedImage } from '../images.ts';
import { renderMarkdown } from '../markdown.ts';
import { requireText, slugifyFilename, type Converter } from './types.ts';

const HEADING_MAP: Record<string, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  H1: HeadingLevel.HEADING_1,
  H2: HeadingLevel.HEADING_2,
  H3: HeadingLevel.HEADING_3,
  H4: HeadingLevel.HEADING_4,
  H5: HeadingLevel.HEADING_5,
  H6: HeadingLevel.HEADING_6,
};

const MONO_FONT = 'Consolas';
const BODY_FONT = 'Calibri';

type Inline = TextRun | ExternalHyperlink;

/** 图片要先异步取回来，遍历 DOM 时才能同步用 */
async function preloadImages(root: ParentNode): Promise<Map<string, LoadedImage | null>> {
  const urls = [...root.querySelectorAll('img')]
    .map((img) => img.getAttribute('src') ?? '')
    .filter(Boolean);
  const unique = [...new Set(urls)];
  const loaded = await Promise.all(unique.map((url) => loadImageForDocx(url)));
  return new Map(unique.map((url, i) => [url, loaded[i] ?? null]));
}

function inlineFromNode(node: Node, style: { bold?: boolean; italics?: boolean; mono?: boolean } = {}): Inline[] {
  const out: Inline[] = [];
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent ?? '';
      if (text) {
        out.push(
          new TextRun({
            text,
            bold: style.bold,
            italics: style.italics,
            font: style.mono ? { ascii: MONO_FONT, hAnsi: MONO_FONT } : { ascii: BODY_FONT, hAnsi: BODY_FONT },
          }),
        );
      }
      return;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const el = child as HTMLElement;
    const tag = el.tagName;

    if (tag === 'BR') {
      out.push(new TextRun({ break: 1 }));
      return;
    }
    if (tag === 'IMG') return;

    if (tag === 'A') {
      const link = el.getAttribute('href');
      const text = el.textContent ?? '';
      if (!text) return;
      if (link && /^(https?:|mailto:)/i.test(link)) {
        out.push(
          new ExternalHyperlink({
            link,
            children: [new TextRun({ text, underline: {}, color: '0563C1' })],
          }),
        );
      } else {
        out.push(new TextRun({ text }));
      }
      return;
    }

    const next = { ...style };
    if (tag === 'STRONG' || tag === 'B' || tag === 'TH') next.bold = true;
    if (tag === 'EM' || tag === 'I') next.italics = true;
    if (tag === 'CODE' || tag === 'KBD' || tag === 'SAMP') next.mono = true;
    if (tag === 'DEL' || tag === 'S') {
      // 删除线单独用 TextRun 的 strike 表达
      out.push(new TextRun({ text: el.textContent ?? '', strike: true, ...next }));
      return;
    }

    out.push(...inlineFromNode(el, next));
  });
  return out;
}

/** 代码块：按 \n 拆成多行，行间用 break 而不是新段落，避免段间距撑开 */
function codeBlock(el: HTMLElement): Paragraph {
  const text = (el.textContent ?? '').replace(/\n$/, '');
  const runs: TextRun[] = [];
  text.split('\n').forEach((line, i) => {
    if (i > 0) runs.push(new TextRun({ break: 1 }));
    runs.push(new TextRun({ text: line, font: { ascii: MONO_FONT, hAnsi: MONO_FONT }, size: 20 }));
  });
  return new Paragraph({
    children: runs,
    shading: { fill: 'F5F5F5' },
    spacing: { before: 120, after: 120 },
    border: {
      left: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC', space: 8 },
    },
  });
}

function tableBlock(el: HTMLElement): Table {
  const rows = [...el.querySelectorAll('tr')];
  const headerCells = [...el.querySelectorAll('thead th')];

  const tableRows = rows.map((tr) => {
    const cells = [...tr.children].map((td) => {
      const isHeader = td.tagName === 'TH';
      const runs = inlineFromNode(td, isHeader ? { bold: true } : {});
      return new TableCell({
        children: [new Paragraph({ children: runs.length ? runs : [new TextRun('')] })],
        shading: isHeader ? { fill: 'F2F2F2' } : undefined,
      });
    });
    return new TableRow({ children: cells, tableHeader: headerCells.length > 0 && tr.parentElement?.tagName === 'THEAD' });
  });

  return new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

function imageParagraph(url: string, image: LoadedImage | null): Paragraph | null {
  if (!image) return null;
  const { width, height } = fitWidth(image.width, image.height);
  return new Paragraph({
    children: [
      new ImageRun({
        type: image.type,
        data: image.data,
        transformation: { width, height },
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120 },
  });
}

function blockToDocx(el: HTMLElement, images: Map<string, LoadedImage | null>, depth = 0): (Paragraph | Table)[] {
  const tag = el.tagName;
  const out: (Paragraph | Table)[] = [];

  if (tag === 'PRE') {
    out.push(codeBlock(el));
    return out;
  }

  if (tag === 'TABLE') {
    out.push(tableBlock(el));
    return out;
  }

  if (tag === 'IMG') {
    const url = el.getAttribute('src') ?? '';
    const p = imageParagraph(url, images.get(url) ?? null);
    if (p) out.push(p);
    return out;
  }

  if (tag === 'HR') {
    out.push(new Paragraph({ text: '', border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' } } }));
    return out;
  }

  if (tag === 'UL' || tag === 'OL') {
    const items = [...el.children].filter((c) => c.tagName === 'LI') as HTMLElement[];
    items.forEach((li, index) => {
      // 只处理 li 里的直接行内内容，嵌套列表交给下一次递归
      const nestedBlocks: HTMLElement[] = [];
      const inlineHost = li.cloneNode(true) as HTMLElement;
      [...inlineHost.children]
        .filter((c) => ['UL', 'OL', 'PRE', 'TABLE'].includes(c.tagName))
        .forEach((c) => {
          nestedBlocks.push(c as HTMLElement);
          c.remove();
        });

      const runs = inlineFromNode(inlineHost);
      const marker = tag === 'OL' ? `${index + 1}. ` : '• ';
      out.push(
        new Paragraph({
          children: [new TextRun({ text: marker }), ...(runs.length ? runs : [new TextRun('')])],
          indent: { left: 360 * (depth + 1) },
          spacing: { after: 60 },
        }),
      );
      nestedBlocks.forEach((nested) => out.push(...blockToDocx(nested, images, depth + 1)));
    });
    return out;
  }

  if (tag === 'BLOCKQUOTE') {
    const runs = inlineFromNode(el);
    out.push(
      new Paragraph({
        children: runs.length ? runs : [new TextRun('')],
        indent: { left: 480 },
        spacing: { before: 120, after: 120 },
        border: { left: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC', space: 8 } },
      }),
    );
    [...el.children]
      .filter((child) => ['PRE', 'TABLE', 'UL', 'OL'].includes(child.tagName))
      .forEach((child) => out.push(...blockToDocx(child as HTMLElement, images, depth)));
    return out;
  }

  if (HEADING_MAP[tag]) {
    out.push(
      new Paragraph({
        heading: HEADING_MAP[tag],
        children: inlineFromNode(el, { bold: true }),
        spacing: { before: 240, after: 120 },
      }),
    );
    return out;
  }

  if (tag === 'P' || tag === 'DIV' || tag === 'SECTION' || tag === 'LI') {
    // 段落里如果混了块级元素（图片、代码块），拆开处理
    const blockChildren = [...el.children].filter((c) =>
      ['PRE', 'TABLE', 'UL', 'OL', 'BLOCKQUOTE', 'IMG'].includes(c.tagName),
    );

    if (blockChildren.length > 0) {
      const host = el.cloneNode(true) as HTMLElement;
      [...host.children]
        .filter((c) => ['PRE', 'TABLE', 'UL', 'OL', 'BLOCKQUOTE', 'IMG'].includes(c.tagName))
        .forEach((c) => c.remove());
      const runs = inlineFromNode(host);
      if (runs.length) out.push(new Paragraph({ children: runs, spacing: { after: 120 } }));
      blockChildren.forEach((child) => out.push(...blockToDocx(child as HTMLElement, images, depth)));
      return out;
    }

    const runs = inlineFromNode(el);
    // 只有图片的段落单独走图片分支
    const onlyImg = el.children.length === 1 && el.children[0]?.tagName === 'IMG';
    if (onlyImg) {
      const url = el.children[0]!.getAttribute('src') ?? '';
      const p = imageParagraph(url, images.get(url) ?? null);
      if (p) {
        out.push(p);
        return out;
      }
    }
    out.push(
      new Paragraph({
        children: runs.length ? runs : [new TextRun('')],
        spacing: { after: 120 },
      }),
    );
    return out;
  }

  // 兜底：行内内容包成段落
  out.push(new Paragraph({ children: inlineFromNode(el), spacing: { after: 120 } }));
  return out;
}

export async function htmlToDocx(html: string): Promise<Blob> {
  const doc = new DOMParser().parseFromString(sanitize(html), 'text/html');
  const images = await preloadImages(doc.body);

  const children: (Paragraph | Table)[] = [];
  [...doc.body.children].forEach((el) => {
    children.push(...blockToDocx(el as HTMLElement, images));
  });

  if (children.length === 0) {
    children.push(new Paragraph({ children: [new TextRun('')] }));
  }

  const document = new Document({
    sections: [{ children }],
    styles: {
      default: {
        document: { run: { font: { ascii: BODY_FONT, hAnsi: BODY_FONT }, size: 22 } },
      },
    },
  });

  return Packer.toBlob(document);
}

export const docxConverter: Converter = {
  id: 'docx',

  async transform(input) {
    // 预览区仍然用 HTML，真正的 docx 在点击下载时才生成
    return sanitize(renderMarkdown(requireText(input)));
  },

  async download(input, filenameBase) {
    const source = requireText(input);
    const title = slugifyFilename(source, filenameBase);
    const blob = await htmlToDocx(renderMarkdown(source));
    downloadBlob(blob, `${title}.docx`);
  },
};
