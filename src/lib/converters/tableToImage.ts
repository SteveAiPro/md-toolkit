import { downloadBlob } from '../download.ts';
import { inlineToPlain } from './ast.ts';
import { findFirstTable, tableToHtml } from './table.ts';
import type { Converter } from './types.ts';

/**
 * Markdown 表格 → PNG。
 *
 * 用 Canvas 直接绘制而不是 html-to-image（DOM → foreignObject → 位图）：
 * 表格是规整的行列结构，手绘拿到的是清晰锐利的矢量文字，
 * 还顺带避开了 foreignObject 那套在 Safari 上中文字体丢失的老问题。
 */

const PADDING = 16;
const ROW_HEIGHT = 40;
const MAX_WIDTH = 4000;
const MAX_HEIGHT = 16000;
const FONT = '14px -apple-system, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif';

interface Size {
  width: number;
  height: number;
}

function drawTable(head: string[], rows: string[][]): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('浏览器不支持 Canvas 2D');

  ctx.font = FONT;

  const all = [head, ...rows];
  const colWidths = head.map((_, index) => {
    const widest = Math.max(...all.map((row) => ctx.measureText(row[index] ?? '').width));
    return Math.min(widest + PADDING * 2, 600);
  });

  const width = Math.min(
    colWidths.reduce((sum, value) => sum + value, 0),
    MAX_WIDTH,
  );
  const height = Math.min(ROW_HEIGHT * all.length, MAX_HEIGHT);
  if (ROW_HEIGHT * all.length > MAX_HEIGHT) {
    throw new Error('表格行数过多，超出图片尺寸上限');
  }

  const scale = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);
  ctx.font = FONT;
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, width, ROW_HEIGHT);

  all.forEach((row, rowIndex) => {
    if (rowIndex > 0 && rowIndex % 2 === 0) {
      ctx.fillStyle = '#fafafa';
      ctx.fillRect(0, rowIndex * ROW_HEIGHT, width, ROW_HEIGHT);
    }
    ctx.fillStyle = rowIndex === 0 ? '#111827' : '#1f2937';
    if (rowIndex === 0) ctx.font = `600 ${FONT}`;
    let x = 0;
    head.forEach((_, columnIndex) => {
      const cellWidth = colWidths[columnIndex];
      ctx.fillText(row[columnIndex] ?? '', x + PADDING, rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2, cellWidth - PADDING * 2);
      x += cellWidth;
    });
    ctx.font = FONT;
  });

  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  for (let index = 0; index <= all.length; index += 1) {
    const y = index * ROW_HEIGHT - 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  let x = 0;
  colWidths.forEach((columnWidth, index) => {
    x += columnWidth;
    if (index === colWidths.length - 1) return;
    ctx.beginPath();
    ctx.moveTo(x - 0.5, 0);
    ctx.lineTo(x - 0.5, height);
    ctx.stroke();
  });

  return canvas;
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas 导出失败'));
    }, 'image/png');
  });
}

function tableOrThrow(source: string) {
  const table = findFirstTable(source);
  if (!table || table.head.length === 0) {
    throw new Error('没有找到 Markdown 表格，至少需要表头行与分隔行');
  }
  return {
    head: table.head.map(inlineToPlain),
    rows: table.rows.map((row) => row.map(inlineToPlain)),
  };
}

export const tableToImageConverter: Converter = {
  id: 'tableToImage',

  async transform(input) {
    const { head, rows } = tableOrThrow(typeof input === 'string' ? input : '');
    return tableToHtml(head, rows);
  },

  async download(input, filenameBase) {
    const { head, rows } = tableOrThrow(typeof input === 'string' ? input : '');
    const blob = await toBlob(drawTable(head, rows));
    downloadBlob(blob, `${filenameBase}.png`);
  },
};

export default tableToImageConverter;
