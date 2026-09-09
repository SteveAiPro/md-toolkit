/**
 * 打印样式表。以字符串形式注入到预览 iframe 里，
 * 这样主页面样式完全不会污染打印结果。
 *
 * 分页策略是这套方案的核心：交给浏览器排版引擎，而不是 JS 算像素高度。
 */
export const PRINT_CSS = `
  @page {
    size: A4;
    margin: 20mm 18mm;
  }

  :root {
    --ink: #1a1a1a;
    --muted: #666;
    --line: #e3e3e3;
    --code-bg: #f6f8fa;
  }

  * { box-sizing: border-box; }

  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  body {
    font-family: -apple-system, "Segoe UI", "PingFang SC", "Hiragino Sans GB",
                 "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
    font-size: 11pt;
    line-height: 1.7;
    color: var(--ink);
    margin: 0;
    word-wrap: break-word;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.35;
    margin: 1.2em 0 0.5em;
    /* 标题与正文不要被拆到两页 */
    page-break-after: avoid;
    break-after: avoid;
  }
  h1 { font-size: 20pt; border-bottom: 1pt solid var(--line); padding-bottom: 0.25em; }
  h2 { font-size: 16pt; border-bottom: 1pt solid var(--line); padding-bottom: 0.2em; }
  h3 { font-size: 13pt; }
  h4 { font-size: 12pt; }
  h5, h6 { font-size: 11pt; color: var(--muted); }
  h1:first-child { margin-top: 0; }

  p { margin: 0 0 0.6em; }

  a { color: #0b5cad; text-decoration: none; }

  ul, ol { margin: 0 0 0.6em; padding-left: 1.4em; }
  li { margin: 0.15em 0; }

  blockquote {
    margin: 0.7em 0;
    padding: 0.1em 0 0.1em 0.9em;
    border-left: 3pt solid var(--line);
    color: var(--muted);
  }

  /* 代码块、表格行、图片、公式块：整块不许被切开 */
  pre, blockquote, img, tr, .katex-display {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  pre {
    background: var(--code-bg);
    border: 0.5pt solid var(--line);
    border-radius: 3pt;
    padding: 0.6em 0.8em;
    overflow: hidden;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 9pt;
    line-height: 1.5;
    margin: 0.6em 0;
    white-space: pre-wrap;
  }
  pre code { background: none; padding: 0; font-size: inherit; }

  code {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 9.5pt;
    background: var(--code-bg);
    padding: 0.1em 0.3em;
    border-radius: 2pt;
  }

  /* 表格允许跨页，但表头每页重复 */
  table {
    page-break-inside: auto;
    border-collapse: collapse;
    width: 100%;
    margin: 0.7em 0;
    font-size: 10pt;
  }
  thead { display: table-header-group; }
  tfoot { display: table-footer-group; }
  th, td {
    border: 0.5pt solid var(--line);
    padding: 0.35em 0.55em;
    text-align: left;
    vertical-align: top;
  }
  th { background: #f3f3f3; font-weight: 600; }

  img { max-width: 100%; height: auto; display: block; margin: 0.6em auto; }

  hr { border: none; border-top: 0.5pt solid var(--line); margin: 1.2em 0; }

  .katex-display { overflow: visible; }

  /* 打印时隐藏交互元素 */
  .task-list-item input,
  [data-no-print] { display: none !important; }
`;

/** overlay 自身的样式，跟着组件一起注入，避免用户忘记引 CSS */
export const OVERLAY_CSS = `
  .print-overlay {
    position: fixed;
    inset: 0;
    z-index: 70;
    background: rgba(17, 18, 20, 0.72);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 16px;
    overflow: auto;
  }
  .print-overlay__bar {
    width: min(980px, 100%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 12px;
  }
  .print-overlay__title {
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .print-overlay__actions { display: flex; gap: 8px; flex-shrink: 0; }
  .print-overlay__btn {
    border: 0.5px solid rgba(255,255,255,0.28);
    background: transparent;
    color: #fff;
    border-radius: 8px;
    padding: 7px 14px;
    font-size: 13px;
    cursor: pointer;
  }
  .print-overlay__btn:hover { background: rgba(255,255,255,0.1); }
  .print-overlay__btn--primary { background: #fff; color: #111; border-color: #fff; }
  .print-overlay__btn--primary:hover { background: #e9e9e9; }
  .print-overlay__hint {
    color: rgba(255,255,255,0.72);
    font-size: 12px;
    margin: 10px 0 0;
    text-align: center;
  }
  .print-overlay__frame {
    width: 100%;
    max-width: 820px;
    height: 800px;
    border: none;
    border-radius: 4px;
    background: #fff;
    box-shadow: 0 8px 40px rgba(0,0,0,0.35);
  }
`;
