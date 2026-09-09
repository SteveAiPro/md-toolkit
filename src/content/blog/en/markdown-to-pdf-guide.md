---
title: 'Markdown to PDF: Why Browser Print Beats html2pdf.js'
description: 'The standard library approach rasterizes your document into a bitmap. There is a better way that keeps text selectable and pagination correct.'
pubDate: 2026-01-25
tags: ['markdown', 'pdf', 'browser-print', 'frontend', 'technical']
lang: en
group: markdown-to-pdf-guide
tools: ['markdown-to-pdf', 'markdown-table-to-pdf']
---

If you search for "convert HTML to PDF in JavaScript" you will land on
`html2pdf.js`, which bundles jsPDF and html2canvas. It works, and it is the wrong
tool for documents. Here is why, and what to do instead.

## The rasterization problem

`html2canvas` does not screenshot your page. It walks the DOM, reads computed
styles, and re-draws every element onto a `<canvas>` using drawing commands. jsPDF
then embeds that canvas as a single bitmap inside a PDF.

The consequences:

- **Text is not text.** It is pixels. You cannot select it, search it, or copy it.
- **Links are dead.** A hyperlink becomes colored pixels.
- **File size balloons.** A ten-page document is ten full-page images.
- **Pagination is guesswork.** jsPDF decides where to cut based on pixel height
  calculations, which is why your code blocks get sliced in half.
- **Long documents crash.** Canvas has a maximum dimension (Chrome is around
  16384px). Exceed it and you get a blank page.

For a one-page invoice, fine. For a 30-page document, none of this is acceptable.

## The alternative: let the browser do it

Every browser already ships a high-quality PDF generator. It is the print engine.
It produces vector output, handles pagination natively, and has been tuned for two
decades.

The approach:

1. Render the Markdown to HTML in a hidden iframe
2. Apply a `@media print` stylesheet inside that iframe
3. Call `contentWindow.print()`
4. The user's print dialog offers "Save as PDF"

You get selectable text, live links, correct pagination, and a file that is a
fraction of the size.

## The CSS that controls pagination

This is the part that matters. Pagination is not configured in JavaScript — it is
expressed in CSS:

```css
@page {
  margin: 18mm 16mm;
}

h1, h2, h3, h4 {
  break-after: avoid;   /* never orphan a heading at the page bottom */
}

pre, table, img, figure {
  break-inside: avoid;  /* never split a code block across pages */
}

p {
  orphans: 3;           /* at least 3 lines at the bottom of a page */
  widows: 3;            /* at least 3 lines at the top of the next */
}

a {
  /* optionally print link URLs after the anchor text */
}
```

`break-inside: avoid` on `pre` alone fixes the single most common complaint about
generated PDFs.

## When you cannot use print

Two cases where you need a real PDF library:

**No user interaction allowed.** `window.print()` opens a dialog. If you are
generating PDFs in a background job or a Node script, you need `pdf-lib` or Puppeteer.

**Exact byte-for-byte output required.** The print dialog's settings (margins,
headers, scale) live in the user's browser. You cannot fully control them. If you
are producing a legal document that must look identical everywhere, render server-side.

For everything else — a doc you want to email, a spec you want to share — print is
better.

## Practical tips

**Set the document title before printing.** Most browsers seed the PDF filename from
`<title>`. Set it from your H1 and the download gets a sensible name instead of
`document.pdf`.

**Wait for images.** If your Markdown references remote images, they may not have
loaded when `print()` fires. Wait for all images to complete, or use
`page.waitForLoadState` if you are driving this from a headless browser.

**Test in more than one browser.** Chrome, Firefox, and Safari implement print CSS
with small differences. Safari in particular is stricter about `break-inside`.

**Page breaks are explicit when you need them.** Add a `<div class="page-break">`
with `break-after: page` and let users force a break where they want one.

Try [Markdown to PDF](/markdown-to-pdf/) to see the print approach in action, or
[Markdown table to PDF](/markdown-table-to-pdf/) if you only need a table on paper.
