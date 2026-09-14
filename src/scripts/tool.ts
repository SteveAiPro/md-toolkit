import type { ConverterId } from '../tools.ts';

type InputKind = 'md' | 'html' | 'csv' | 'json' | 'latex' | 'file';

interface ToolConfig {
  converter: ConverterId;
  direction: 'md-out' | 'md-in';
  /** html -> 写进预览 div；text -> 写进只读 textarea */
  outputKind: 'html' | 'text';
  outputExt: string;
  accept: string;
  inputKind: InputKind;
  /** Word / PDF 只能以二进制文件给进来 */
  binary: boolean;
  sample: string;
  labels: {
    copied: string;
    failed: string;
    dropHint: string;
    empty: string;
    downloading: string;
  };
}

const STORAGE_PREFIX = 'md-toolkit:draft:';

function debounce<T extends (...args: never[]) => void>(fn: T, wait: number) {
  let timer: number | undefined;
  return (...args: Parameters<T>) => {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  };
}

function toast(message: string): void {
  const el = document.getElementById('tool-toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('is-visible');
  window.setTimeout(() => el.classList.remove('is-visible'), 2400);
}

export async function initTool(config: ToolConfig): Promise<void> {
  const input = document.getElementById('tool-input') as HTMLTextAreaElement | null;
  const output = document.getElementById('tool-output') as HTMLTextAreaElement | null;
  const preview = document.getElementById('tool-preview');
  const filenameEl = document.getElementById('tool-filename');
  const downloadBtn = document.getElementById('tool-download') as HTMLButtonElement | null;

  const { getConverter } = await import('../lib/converters/index.ts');
  const converter = await getConverter(config.converter);
  const storageKey = `${STORAGE_PREFIX}${config.converter}`;

  const rendersHtml = config.outputKind === 'html';
  const target = rendersHtml ? preview : output;

  /** 二进制工具没有可编辑文本，当前输入就是这份 ArrayBuffer */
  let buffer: ArrayBuffer | null = null;
  let currentFile = '';

  function writeResult(value: string): void {
    if (!target) return;
    if (rendersHtml) target.innerHTML = value;
    else (target as HTMLTextAreaElement).value = value;
  }

  async function run(value: string | ArrayBuffer): Promise<void> {
    try {
      writeResult(await converter.transform(value));
    } catch (error) {
      // 转换器的报错是给人看的（"扫描件没有文字层"），比泛化的"转换失败"有用
      writeResult('');
      toast(error instanceof Error ? error.message : config.labels.failed);
      console.error('[md-toolkit] convert failed', error);
    }
  }

  const schedule = debounce((value: string) => void run(value), 180);

  if (!config.binary && input) {
    input.addEventListener('input', () => {
      schedule(input.value);
      try {
        localStorage.setItem(storageKey, input.value);
      } catch {
        /* 隐私模式下写不进去，忽略 */
      }
    });

    const draft = (() => {
      try {
        return localStorage.getItem(storageKey);
      } catch {
        return null;
      }
    })();

    input.value = draft ?? config.sample;
    await run(input.value);
  }

  // 示例 / 清空
  document.getElementById('tool-sample')?.addEventListener('click', () => {
    if (!input) return;
    input.value = config.sample;
    void run(input.value);
  });
  document.getElementById('tool-clear')?.addEventListener('click', () => {
    if (!input) return;
    input.value = '';
    void run('');
  });

  // 复制。渲染型工具复制转换后的 HTML 源码（这才是用户想要的），
  // 文本型工具直接复制输出框里的内容。
  document.getElementById('tool-copy')?.addEventListener('click', async () => {
    const text = rendersHtml ? await converter.transform(currentValue()) : (output?.value ?? '');
    try {
      await navigator.clipboard.writeText(text);
      toast(config.labels.copied);
    } catch {
      toast(config.labels.failed);
    }
  });

  function currentValue(): string | ArrayBuffer {
    return config.binary ? (buffer ?? new ArrayBuffer(0)) : (input?.value ?? '');
  }

  function filenameBase(): string {
    if (config.binary) {
      return currentFile.replace(/\.[^.]+$/, '') || 'document';
    }
    return (input?.value.split('\n')[0] ?? '').replace(/^#+\s*/, '').trim().slice(0, 40) || 'document';
  }

  // 下载
  downloadBtn?.addEventListener('click', async () => {
    if (config.binary && !buffer) {
      toast(config.labels.empty);
      return;
    }
    const original = downloadBtn.textContent;
    downloadBtn.setAttribute('disabled', 'true');
    // 生成 Word / PDF 要几十到几百毫秒，不给反馈用户会以为按钮点坏了
    downloadBtn.textContent = config.labels.downloading;
    try {
      await converter.download?.(currentValue(), filenameBase(), target?.innerHTML ?? '');
    } catch (error) {
      toast(error instanceof Error ? error.message : config.labels.failed);
      console.error('[md-toolkit] download failed', error);
    } finally {
      // 二进制工具只要还选着文件就保持可用
      if (!config.binary || !buffer) downloadBtn.removeAttribute('disabled');
      if (original) downloadBtn.textContent = original;
    }
  });

  // 拖拽 / 选择文件
  const fileInput = document.getElementById('tool-file') as HTMLInputElement | null;
  const dropZone = document.getElementById('tool-dropzone');

  async function readFile(file: File): Promise<void> {
    if (config.binary) {
      buffer = await file.arrayBuffer();
      currentFile = file.name;
      if (filenameEl) {
        filenameEl.textContent = file.name;
        filenameEl.dataset.empty = 'false';
      }
      downloadBtn?.removeAttribute('disabled');
      await run(buffer);
    } else if (input) {
      const text = await file.text();
      input.value = text;
      await run(text);
    }
  }

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) void readFile(file);
  });

  if (dropZone) {
    const stop = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };
    ['dragenter', 'dragover'].forEach((type) =>
      dropZone.addEventListener(type, (event) => {
        stop(event as DragEvent);
        dropZone.classList.add('is-dragging');
      }),
    );
    ['dragleave', 'drop'].forEach((type) =>
      dropZone.addEventListener(type, (event) => {
        stop(event as DragEvent);
        dropZone.classList.remove('is-dragging');
      }),
    );
    dropZone.addEventListener('drop', (event) => {
      const file = (event as DragEvent).dataTransfer?.files?.[0];
      if (file) void readFile(file);
    });
  }
}
