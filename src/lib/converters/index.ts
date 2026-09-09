import type { ConverterId } from '../../tools.ts';
import type { Converter } from './types.ts';

/**
 * 按需加载：每个转换器单独分片，
 * 用户打开 md→html 时不会把 docx 和 pdfjs 一起下载下来。
 */
const LOADERS: Record<ConverterId, () => Promise<{ default?: Converter } | Record<string, Converter>>> = {
  // 第一批
  html: () => import('./html.ts'),
  docx: () => import('./docx.ts'),
  pdf: () => import('./pdf.ts'),
  text: () => import('./text.ts'),
  turndown: () => import('./turndown.ts'),
  // A 档：纯文本映射
  latex: () => import('./latex.ts'),
  rst: () => import('./rst.ts'),
  confluence: () => import('./confluence.ts'),
  latexToMd: () => import('./latexToMd.ts'),
  csvToTable: () => import('./csvToTable.ts'),
  jsonToTable: () => import('./jsonToTable.ts'),
  tableToCsv: () => import('./tableToCsv.ts'),
  // B 档：复用现有管线
  tableToPdf: () => import('./tableToPdf.ts'),
  tableToImage: () => import('./tableToImage.ts'),
  editor: () => import('./editor.ts'),
  // C 档：外部解析
  wordToMd: () => import('./wordToMd.ts'),
  pdfToMd: () => import('./pdfToMd.ts'),
  mdToImage: () => import('./mdToImage.ts'),
};

const cache = new Map<ConverterId, Converter>();

export async function getConverter(id: ConverterId): Promise<Converter> {
  const hit = cache.get(id);
  if (hit) return hit;

  const mod = await LOADERS[id]();
  const converter =
    (mod as { default?: Converter }).default ??
    (Object.values(mod).find((value): value is Converter => !!value && typeof (value as Converter).transform === 'function') as Converter);

  if (!converter) throw new Error(`Converter "${id}" is not registered`);
  cache.set(id, converter);
  return converter;
}

export type { Converter } from './types.ts';
