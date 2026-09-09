import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { downloadText } from '../download.ts';
import type { Converter } from './types.ts';

/**
 * PDF → Markdown。
 *
 * PDF 里没有「标题」这个概念，只有带坐标和字号的文字碎片。
 * 所以还原标题层级只能靠启发式：拿正文字号的中位数做基准，
 * 明显更大的行判成标题。这不是精确还原，是可用的第一稿。
 *
 * 硬边界：扫描件 PDF 没有文本层，pdfjs 抽出来的就是空字符串，
 * 这种情况必须明确告诉用户，而不是静静返回一个空文档。
 */

interface Line {
  text: string;
  size: number;
}

async function extractLines(data: ArrayBuffer): Promise<Line[]> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const doc = await pdfjs.getDocument({ data: new Uint8Array(data) }).promise;
  const lines: Line[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();

      let currentY: number | null = null;
      let buffer = '';
      let size = 0;

      const flush = () => {
        if (buffer.trim()) lines.push({ text: buffer.trim().replace(/\s+/g, ' '), size });
        buffer = '';
        size = 0;
      };

      for (const item of content.items) {
        if (!('str' in item)) continue;
        const y = Math.round((item as { transform: number[] }).transform[5]);
        const height = (item as { height?: number }).height ?? 0;
        if (currentY === null) currentY = y;
        // 同一行的文字纵坐标会有亚像素抖动，2pt 容差
        if (Math.abs(y - currentY) > 2) {
          flush();
          currentY = y;
        }
        buffer += (item as { str: string }).str;
        size = Math.max(size, height);
      }
      flush();
      page.cleanup();
    }
  } finally {
    await doc.destroy();
  }

  return lines;
}

function toMarkdown(lines: Line[]): string {
  const sizes = lines.map((line) => line.size).filter((size) => size > 0).sort((a, b) => a - b);
  const median = sizes[Math.floor(sizes.length / 2)] ?? 0;

  return lines
    .map((line) => {
      const ratio = median > 0 ? line.size / median : 1;
      if (ratio > 1.6) return `# ${line.text}`;
      if (ratio > 1.3) return `## ${line.text}`;
      if (ratio > 1.12) return `### ${line.text}`;
      // 看着像列表项的行保留原样，交给用户自己收拾
      return line.text;
    })
    .join('\n\n');
}

export const pdfToMdConverter: Converter = {
  id: 'pdfToMd',

  async transform(input) {
    if (typeof input === 'string') {
      throw new Error('PDF 是二进制格式，请上传 .pdf 文件而不是粘贴文本');
    }
    if (input.byteLength === 0) {
      throw new Error('文件内容为空');
    }

    const lines = await extractLines(input);
    const totalChars = lines.reduce((sum, line) => sum + line.text.length, 0);
    if (totalChars < 20) {
      throw new Error('这个 PDF 里几乎没有文字层，很可能是扫描件，需要先做 OCR');
    }
    return `${toMarkdown(lines)}\n`;
  },

  async download(input, filenameBase) {
    downloadText(await pdfToMdConverter.transform(input), `${filenameBase}.md`, 'text/markdown');
  },
};

export default pdfToMdConverter;
