import type { ConverterId } from '../../tools.ts';

/**
 * 输入既可能是文本（粘贴进来的 Markdown / CSV / HTML），
 * 也可能是二进制（Word 与 PDF 只能以文件形式给进来，无法粘贴）。
 */
export type ConverterInput = string | ArrayBuffer;

export interface Converter {
  id: ConverterId;
  /**
   * 实时转换。md-out 类工具返回 HTML（喂给右侧预览），
   * md-in 类工具返回 Markdown / 纯文本（喂给右侧输出框）。
   */
  transform(input: ConverterInput): Promise<string>;
  /** 点击下载时触发。docx 会生成二进制，pdf 会走浏览器打印。 */
  download?(input: ConverterInput, filenameBase: string, previewHtml: string): Promise<void>;
}

/** 二进制输入统一转成 string，方便只对文本感兴趣的转换器直接取用 */
export function requireText(input: ConverterInput): string {
  return typeof input === 'string' ? input : '';
}

/** 文本型转换器：复用同一套「转换 + 存成文件」逻辑 */
export function textFileConverter(
  id: ConverterId,
  ext: string,
  mime: string,
  transform: (input: string) => Promise<string> | string,
): Converter {
  return {
    id,
    async transform(input) {
      return transform(requireText(input));
    },
    async download(input, filenameBase) {
      const { downloadText } = await import('../download.ts');
      downloadText(await transform(requireText(input)), `${filenameBase}.${ext}`, mime);
    },
  };
}

/** 从 Markdown 源推导出文件名，如 "# Hello World" -> hello-world */
export function slugifyFilename(source: string, fallback = 'document'): string {
  const firstHeading = source.split('\n').find((line) => /^#{1,6}\s+\S/.test(line));
  const raw = firstHeading ? firstHeading.replace(/^#{1,6}\s+/, '') : fallback;
  const cleaned = raw
    .replace(/[*_`~[\]()#!]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9一-龥-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || fallback;
}
