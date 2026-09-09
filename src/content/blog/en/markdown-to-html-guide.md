---
title: 'Markdown to HTML: What Actually Happens in Between'
description: 'The parser pipeline, the XSS hole nobody patches, and why your raw HTML silently disappears.'
pubDate: 2026-08-17
tags: ['markdown', 'html', 'converter', 'tutorial']
lang: en
group: markdown-to-html-guide
tools: ['markdown-to-html', 'markdown-editor']
---

Markdown to HTML is the conversion every other conversion is built on. Word, PDF,
Confluence, reStructuredText — all of them go Markdown → HTML → target. So when this
step is wrong, everything downstream is wrong too.

It is also the easiest direction. Markdown was designed to become HTML. The
complications are not in the syntax, they are in the **options**.

## The pipeline

Four stages, in order:

1. **Parse** the Markdown into a token stream, then an AST
2. **Render** the AST into an HTML string
3. **Sanitize** if any of the input was untrusted
4. **Wrap** in a document with CSS, charset, and script tags

Almost every bug people report is in stage 2 or 3.

## The options that change your output

Using `markdown-it` as the example, since it is what most tools (including this one)
run on:

```javascript
const md = new MarkdownIt({
  html: true,        // allow raw HTML in the source
  linkify: true,     // turn bare URLs into links
  typographer: true, // smart quotes, em dashes, ellipses
  breaks: false,     // treat single newline as <br>
});
```

**`html`** is the one that surprises people. Set it to `false` and any `<div>` in
your Markdown shows up as literal text. Set it to `true` and you have just enabled
arbitrary script injection — see below.

**`breaks`** is the other one. GitHub sets it to `true`, which is why a single
newline inside a paragraph becomes a line break there but not in your local editor.
If your document looks right on GitHub and wrong everywhere else, this is why.

**`linkify`** turns `https://example.com` into a clickable link. Harmless, until
you are documenting a URL that you wanted shown as plain text.

## The security part, which is not optional

If the Markdown came from anywhere other than your own keyboard — a user comment, a
pull request description, an LLM response — it is untrusted. And Markdown has a
deliberate escape hatch: **raw HTML passes straight through**.

```markdown
Hello!

<img src=x onerror="alert(document.cookie)">
```

With `html: true`, that `onerror` runs. This is not theoretical; it is the single
most common XSS vector in documentation sites and chat apps.

The fix is one pass of a sanitizer *after* rendering, never before:

```javascript
import DOMPurify from 'dompurify';

const dirty = md.render(userInput);
const clean = DOMPurify.sanitize(dirty);
```

Two rules people get wrong:

**Sanitize the output, not the input.** Filtering the Markdown source with a regex
blacklist does not work — Markdown has a dozen ways to express the same thing, and
you will miss one. Render first, then sanitize the HTML.

**Do not sanitize your own trusted content into oblivion.** DOMPurify strips
`class` attributes by default in some configurations, which will silently delete your
syntax-highlighting markup. If you control the source, skip the sanitizer entirely
rather than fighting with allowlists.

## Producing a standalone file

A rendered fragment is not a web page. To ship something someone can open, you need
a full document:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My Document</title>
  <style>/* your CSS */</style>
</head>
<body>
  <!-- rendered markdown -->
</body>
</html>
```

The `<meta charset="utf-8">` is not decoration. Without it, a file opened from disk
with CJK or accented characters renders as mojibake in some browsers, because they
guess the encoding and guess wrong.

If the document has code blocks, you also need highlight.js initialised *after* the
markup is in the DOM:

```javascript
document.querySelectorAll('pre code').forEach((el) => hljs.highlightElement(el));
```

And if it has math, KaTeX CSS in the head. Miss any of these and you get a page that
looks broken in a way that is hard to describe in a bug report.

## Things that quietly go wrong

**Indented code you did not mean to write.** Four spaces at the start of a line
means "code block" in original Markdown. A copy-pasted paragraph that happens to be
indented turns into monospace.

**Relative image paths.** `![diagram](./img/diagram.png)` works next to the source
file and breaks the moment the HTML is served from anywhere else. Absolute URLs or
data URIs survive; relative paths do not.

**Heading IDs.** Most renderers auto-generate `id` attributes from heading text, so
you can link to `#installation`. The slug rules differ between renderers — spaces
become `-`, but uppercase handling and punctuation stripping are inconsistent. Do not
hardcode anchors you have not verified.

**The raw-HTML escape hatch cuts both ways.** Sometimes you *want* a `<div>` or a
`<details>` block in your Markdown. That works on GitHub, and it will not work in a
renderer with `html: false`. Check before you rely on it.

## Which output do you actually need

A fragment for pasting into a CMS, a full standalone page, or nothing at all because
you just wanted to read the thing — these are different jobs.

[Markdown to HTML](/markdown-to-html/) gives you the standalone page: charset,
styling, and highlighting wired up, generated in your browser. If you only wanted to
see what your Markdown looks like, the [Markdown editor](/markdown-editor/) is the
faster path.
