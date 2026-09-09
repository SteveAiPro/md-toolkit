/** md-in 类工具（html-to-markdown）用它做输入示例 */
export const SAMPLE_HTML = `<h2>Release Notes</h2>
<p>Shipped this week: <strong>Word export</strong>, <em>PDF export</em> and
<a href="https://example.com">the new renderer</a>.</p>

<h3>What changed</h3>
<ul>
  <li>Faster conversion</li>
  <li>Better tables
    <ul>
      <li>Nested rows preserved</li>
    </ul>
  </li>
</ul>

<blockquote><p>Tables and nested lists round-trip cleanly.</p></blockquote>

<table>
  <thead><tr><th>Feature</th><th>Status</th></tr></thead>
  <tbody>
    <tr><td>Word export</td><td>Shipped</td></tr>
    <tr><td>Image export</td><td>Planned</td></tr>
  </tbody>
</table>

<pre><code>const md = turndown(html);
console.log(md);
</code></pre>
`;

/** 示例文档：刻意覆盖了导出时最容易出问题的元素 */
export const SAMPLE_MARKDOWN = `# Product Brief — Q3 Launch

A short document used to exercise every part of the export pipeline.

## Highlights

- **Bold**, *italic*, ~~struck~~ and \`inline code\`
- Nested lists
  1. First ordered item
  2. Second ordered item
     - deep bullet
- Task list

- [x] Renderer wired up
- [ ] Add more templates

> Blockquotes survive the trip, including the left border.

## Table

| Feature | Status | Owner |
| --- | --- | --- |
| Word export | Shipped | Core |
| PDF export | Shipped | Core |
| Image export | Planned | Design |

## Code

\`\`\`ts
export async function convert(source: string): Promise<Blob> {
  const html = renderMarkdown(source);
  return htmlToDocx(html);
}
\`\`\`

## Math

Inline formula $E = mc^2$ and a display block:

$$
\\int_0^1 x^2\\,dx = \\frac{1}{3}
$$

---

See the [project home](https://example.com) for the full spec.

![Sample diagram](https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=60)
`;

export const SAMPLE_CSV = `Feature,Status,Owner,ETA
Word export,Shipped,Core,2026-07
PDF export,Shipped,Core,2026-07
Image export,Planned,Design,2026-10
"Table, with comma inside",Blocked,Core,-
`;

export const SAMPLE_JSON = `[
  { "feature": "Word export", "status": "Shipped", "owner": "Core" },
  { "feature": "PDF export", "status": "Shipped", "owner": "Core" },
  { "feature": "Image export", "status": "Planned", "owner": "Design" },
  { "feature": "Table tools", "status": "Planned", "owner": "Core" }
]
`;

export const SAMPLE_LATEX = `\\section{Product Brief}
A short document used to exercise the converter.

\\subsection{Highlights}
\\begin{itemize}
  \\item \\textbf{Bold}, \\emph{italic} and \\texttt{inline code}
  \\item Nested item
\\end{itemize}

\\begin{verbatim}
const md = convert(tex);
console.log(md);
\\end{verbatim}

See the \\href{https://example.com}{project home} for the full spec.
`;
