export type DocxImageType = 'png' | 'jpg' | 'gif' | 'bmp';

export interface LoadedImage {
  data: Uint8Array;
  type: DocxImageType;
  width: number;
  height: number;
}

/** Word 的 ImageRun 只认这四种格式，其它（WebP/AVIF/SVG）必须先转成 PNG */
const SUPPORTED: DocxImageType[] = ['png', 'jpg', 'gif', 'bmp'];

const EXT_TO_TYPE: Record<string, DocxImageType> = {
  png: 'png',
  jpg: 'jpg',
  jpeg: 'jpg',
  gif: 'gif',
  bmp: 'bmp',
};

function detectType(blob: Blob, url: string): DocxImageType | null {
  const mime = blob.type.toLowerCase();
  if (mime === 'image/png') return 'png';
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/gif') return 'gif';
  if (mime === 'image/bmp') return 'bmp';

  const ext = (url.split('?')[0] ?? '').split('.').pop()?.toLowerCase() ?? '';
  return EXT_TO_TYPE[ext] ?? null;
}

/** 任意格式 -> PNG。浏览器原生能渲染 WebP/AVIF，用 Canvas 中转即可 */
function toPng(source: Blob | string): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const isBlob = source instanceof Blob;

    // 跨域图片必须显式声明，否则 canvas 会被污染，toBlob 直接抛错
    if (!isBlob) img.crossOrigin = 'anonymous';

    const objectUrl = isBlob ? URL.createObjectURL(source) : null;

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas 2D context unavailable'));
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((png) => {
        if (png) resolve({ blob: png, width, height });
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/png');
    };

    img.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl ?? (source as string);
  });
}

async function blobToBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

/**
 * 取图片并规整成 Word 能吃的格式。
 * 两级降级：fetch -> Canvas 转 PNG -> Canvas 直接加载 URL（绕开 CORS 拦截）
 * 这是 md-to.com 踩过的两个坑：WebP 不支持 + fetch 被 CORS 拦。
 */
export async function loadImageForDocx(url: string): Promise<LoadedImage | null> {
  if (!/^https?:\/\//i.test(url)) return null;

  try {
    const response = await fetch(url, { mode: 'cors' });
    if (response.ok) {
      const blob = await response.blob();
      const type = detectType(blob, url);
      if (type) {
        const { width, height } = await toPng(blob);
        return { data: await blobToBytes(blob), type, width, height };
      }
      // 不支持的格式（WebP 等）：Canvas 转 PNG
      const converted = await toPng(blob);
      return { data: await blobToBytes(converted.blob), type: 'png', width: converted.width, height: converted.height };
    }
  } catch {
    /* fetch 被 CORS 拒绝，走下面的兜底 */
  }

  try {
    const converted = await toPng(url);
    return { data: await blobToBytes(converted.blob), type: 'png', width: converted.width, height: converted.height };
  } catch {
    return null;
  }
}

/** 把超过 Word 页面可用宽度的图片等比缩小 */
export function fitWidth(width: number, height: number, maxWidth = 560) {
  if (width <= maxWidth) return { width, height };
  const ratio = maxWidth / width;
  return { width: maxWidth, height: Math.round(height * ratio) };
}

export { SUPPORTED as SUPPORTED_IMAGE_TYPES };
