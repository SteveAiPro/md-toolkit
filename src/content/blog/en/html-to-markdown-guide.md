---
title: 'HTML to Markdown: Why the Reverse Direction Is Harder'
description: 'HTML is a tree with presentation baked in. Markdown is a small subset. Here is what survives the trip and what quietly gets mangled.'
pubDate: 2026-08-24
tags: ['markdown', 'html', 'converter', 'technical']
lang: en
group: html-to-markdown-guide
tools: ['html-to-markdown']
---

Markdown to HTML is nearly lossless. HTML to Markdown is not, and it never will be.

The reason is structural: HTML can express far more than Markdown can. Nested
`<div>`s, inline styles, arbitrary attributes, table cells that span columns — there
is no Markdown equivalent. A converter has to decide what to *throw away*, and every
one of those decisions is a judgement call.

## The library everyone uses

`turndown` is the standard, plus `turndown-plugin-gfm` for tables and strikethrough:

```javascript
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const td = new TurndownService({
  headingStyle: 'atx',        // # instead of underlined
  codeBlockStyle: 'fenced',   // ``` instead of indentation
  bulletListMarker: '-',      // - instead of *
});

td.use(gfm);
const markdown = td.turndown(html);
```

Those three options matter more than they look. The defaults produce
`setext` headings (`Title` underlined with `===`), indented code blocks, and `*`
bullets — all valid, all less portable than the alternatives.

## What survives cleanly

| HTML | Markdown | Notes |
| --- | --- | --- |
| `<h1>`–`<h6>` | `#`–`######` | With `atx` style |
| `<strong>`, `<b>` | `**bold**` | |
| `<em>`, `<i>` | `*italic*` | |
| `<a href>` | `[text](url)` | Relative URLs pass through |
| `<img>` | `![alt](src)` | `alt` becomes the alt text |
| `<ul>`, `<ol>` | `-` / `1.` | Nesting preserved |
| `<blockquote>` | `>` | |
| `<pre><code>` | fenced block | Language guessed from `class` |
| `<table>` | GFM table | Needs the plugin, and `<th>` |

## What does not

**Anything presentational.** `<div>`, `<span>`, inline `style`, `class` — all gone.
That is the point of Markdown, but if you were relying on a custom layout you will
lose it.

**Merged cells.** `colspan` and `rowspan` have no Markdown representation. The usual
result is a table where the merged cell's content lands in the first column and the
rest are empty. Sometimes the whole table collapses to plain text.

**Nested tables.** Not a thing in Markdown. Do not expect them back.

**`<br>` inside a paragraph.** Markdown's line break is two trailing spaces, which
almost every editor strips on save. The pragmatic answer is to leave the `<br>` as
raw HTML, which most renderers accept.

**Definition lists, `<dl>`.** No mapping. They become either paragraphs or nothing.

**Inline formatting you did not ask for.** A `<span>` with a font-weight from a
stylesheet is invisible to turndown — it only looks at tags, not computed styles. So
text that *looked* bold on the page may come out plain.

## The escape hatch: keep the HTML

When something has no Markdown equivalent, you can tell turndown to leave it alone:

```javascript
td.keep(['details', 'summary', 'iframe']);
```

The tags pass through verbatim. This is how people keep collapsible sections and
embedded videos. It works as long as the target renderer has `html: true` — on a
platform that escapes raw HTML, you get literal tag text.

## The whitespace problem

This one costs people an afternoon.

Browsers treat whitespace between inline tags as insignificant. Markdown does not. So
this HTML:

```html
<p>Hello <strong>world</strong>, welcome.</p>
```

can come out as `Hello **world** , welcome.` — note the space before the comma —
depending on how the converter normalises text nodes. The fix is to trim runs of
whitespace around inline element boundaries before converting, which is why good
converters pre-process the DOM rather than working on the raw string.

The same issue shows up as spurious blank lines around nested lists, because the
newlines between `</li>` and `<ul>` in pretty-printed HTML become text nodes.

## Pre-processing that actually helps

Before handing HTML to a converter, three passes fix most real-world documents:

1. **Strip** the noise: `<script>`, `<style>`, `<noscript>`, comments, tracking pixels
2. **Unwrap** presentational wrappers: a `<div>` with no semantic meaning and a single
   child can be replaced by that child
3. **Normalise** whitespace inside and around inline elements

Do this and the output improves more than any amount of post-processing regex on the
Markdown side. Fixing broken Markdown after the fact is much harder than cleaning the
HTML first, because by then you no longer know which newline was meaningful.

## When to stop converting

If the HTML is a hand-written document, conversion is usually worth it. If it is the
rendered output of a web app — twenty nested divs, utility classes, inline styles —
you are better off going back to the source. Converters do their best with documents
and their worst with machine-generated DOM.

Paste your markup into [HTML to Markdown](/html-to-markdown/) and read the result
before you commit to it. If the output needs more than a few minutes of cleanup, the
source was the wrong place to start.
