import { saveAs } from 'file-saver';

export function downloadBlob(blob: Blob, filename: string): void {
  saveAs(blob, filename);
}

export function downloadText(text: string, filename: string, mime: string): void {
  saveAs(new Blob([text], { type: `${mime};charset=utf-8` }), filename);
}
