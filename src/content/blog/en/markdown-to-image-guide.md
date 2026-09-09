---
title: 'Turning Markdown Into Images Without Blurry Text'
description: 'The canvas size limit, the font embedding problem, and the CORS trap — three things that break every naive Markdown-to-image exporter.'
pubDate: 2026-02-09
tags: ['markdown', 'image', 'frontend', 'technical', 'cors']
lang: en
group: markdown-to-image-guide
tools: ['markdown-to-image', 'markdown-table-to-image']
---

You want a PNG of your Markdown — for a tweet, a slide, a README preview. The
obvious approach is `html2canvas`. It works for small inputs and silently produces
garbage for large ones.

## Three failure modes

### 1. The canvas size limit

Every browser caps canvas dimensions. Chrome is roughly 16384px per side, and total
area is also capped (around 268 megapixels). A long document at 2x device pixel
ratio exceeds it easily.

When you exceed it, `toBlob()` does not throw. It returns a blank image. This is why
"my long Markdown exports as an empty PNG" is such a confusing bug — there is no
error.

The fix is to render in vertical slices and stitch them onto a final canvas, or to
lower the pixel ratio for long documents.

### 2. Fonts disappear

If you render through SVG `foreignObject`, external fonts are not loaded. The SVG is
serialized and re-parsed in an isolated context where your stylesheet's `@font-face`
declarations point at URLs that are never fetched. The result renders in a fallback
font, or with boxes where CJK characters should be.

The fix is to inline fonts as base64 data URIs before serializing. Libraries like
`html-to-image` do this with an `embedWebFonts` step that walks `document.styleSheets`,
finds every `@font-face`, fetches the font file, and inlines it.

This is also why **Chinese, Japanese, and Korean text is the first thing to break**.
A Latin fallback still looks like text; a CJK fallback looks like tofu.

### 3. Cross-origin images taint the canvas

Draw a cross-origin image onto a canvas without proper CORS headers and the canvas
becomes tainted. Any subsequent `toBlob()` or `toDataURL()` throws a
`SecurityError`.

There is no workaround from the page side — the image server must send
`Access-Control-Allow-Origin`. If it does, set `crossOrigin="anonymous"` on the
`<img>` before setting `src`. Setting it after has no effect.

## The approach that works

`html-to-image` uses SVG `foreignObject` rather than redrawing the DOM:

```javascript
const dataUrl = await toPng(node, {
  pixelRatio: 2,
  backgroundColor: '#ffffff',
  // inlines @font-face as data URIs, otherwise CJK text breaks
  embedWebFonts: true,
});
```

Because the browser does the rendering (rather than a JS reimplementation of CSS),
complex layouts come out correct.

## Getting a sensible filename

Deriving the filename from the first H1 is a nice touch and avoids a folder full of
`image.png`:

```javascript
const h1 = node.querySelector('h1')?.textContent ?? 'document';
const slug = h1
  .toLowerCase()
  .replace(/[^\w\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .slice(0, 60);
```

## Quality settings that matter

- **`pixelRatio: 2`** for retina. Above 2, file size grows fast with little visible
  gain.
- **Always set a background color.** Transparent PNGs of text are unreadable on dark
  backgrounds and look broken in most viewers.
- **Wait for images before exporting.** Loop over `node.querySelectorAll('img')` and
  await each `decode()`. Otherwise you capture empty boxes.
- **Fixed width, auto height.** Set an explicit width so text wraps predictably;
  let height follow the content.

## When a table is all you need

Rendering a whole document is heavy. If the output is just a table, drawing it
directly to a canvas is faster and produces a crisper result — you measure text with
`ctx.measureText()`, compute column widths, and draw cells. No DOM, no SVG, no font
embedding.

That is the difference between [Markdown to image](/markdown-to-image/) (full
document, SVG-based) and [Markdown table to image](/markdown-table-to-image/)
(canvas-drawn, instant).
