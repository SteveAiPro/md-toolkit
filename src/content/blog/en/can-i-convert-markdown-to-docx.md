---
title: 'Can I Convert Markdown to DOCX? (And Why It Usually Looks Wrong)'
description: 'Yes — but Word documents are far more complex than Markdown. Here is what survives the trip and what does not.'
pubDate: 2026-01-18
tags: ['markdown', 'docx', 'word', 'converter', 'technical']
lang: en
group: can-i-convert-markdown-to-docx
tools: ['markdown-to-word']
---

Short answer: yes. Longer answer: yes, but you need to understand what a `.docx`
actually is before the result will look the way you expect.

## Why it is harder than it sounds

Markdown is a lightweight markup language with roughly twenty concepts. Word's
`.docx` format is an OOXML package — literally a ZIP file containing XML that
describes styles, numbering definitions, section breaks, embedded fonts, and
drawing anchors. The two are not the same shape.

A converter is not translating one format into another. It is *inventing* a large
amount of structure that Markdown never had: what font is a heading? How much space
goes after a paragraph? Where does the table get its borders from?

This is why naive converters produce documents that technically open in Word but
look like a text file that got lost.

## What survives the conversion

| Markdown | In Word | Notes |
| --- | --- | --- |
| `#`–`######` | Heading 1–6 styles | Uses Word's built-in styles, so the nav pane works |
| `**bold**` / `*italic*` | Bold / Italic runs | Preserved inline |
| Lists | Numbered / bulleted lists | Nesting depth is kept |
| Tables | Real Word tables | Not tab-separated text pretending to be a table |
| ```` ```code``` ```` | Monospace paragraph | No syntax coloring — Word has no concept of it |
| Links | Hyperlink fields | Still clickable |
| Images | Embedded images | See the warning below |
| `>` blockquote | Indented paragraph with left border | Approximate |

## What does not

**Syntax highlighting.** Word cannot represent colored tokens inside a paragraph
without throwing away the text as plain runs. Code blocks come through as
monospace text. If you need colored code, export to HTML or PDF instead.

**Math.** Unless the converter renders KaTeX to an image first, `$E = mc^2$` arrives
as literal dollar signs.

**Custom CSS.** Markdown does not have styling, but if you are converting from
HTML, every `class` and inline style is dropped. The converter decides the look.

**Footnotes and task lists.** Support varies. Some converters turn `- [ ]` into an
actual checkbox field; most render a literal `[ ]`.

## Two problems that break images

If your Markdown references images and they come out blank, it is one of these.

**1. WebP is not supported by Word's image element.** The OOXML `ImageRun` accepts
PNG, JPEG, GIF, and BMP. Hand it a WebP byte stream and Word shows an empty box.
The fix is to decode the image to a canvas and re-encode as PNG before embedding.

**2. Cross-origin images get tainted.** Fetching a remote image with `fetch()` is
subject to CORS, and loading it into a canvas taints that canvas — after which
`toBlob()` throws a security error. The workaround is to load it through an
`<img crossOrigin="anonymous">` element and draw *that* into the canvas, which
bypasses the fetch path entirely. This only works if the remote server sends
permissive CORS headers.

Most browser-based converters handle neither, which is why "my images are missing"
is the number one complaint.

## Doing it locally vs uploading

There is a real privacy argument for browser-side conversion. Every hosted
converter that accepts file uploads is storing your document on someone else's
server, at least transiently. If the document is a draft contract or an unpublished
announcement, that matters.

A converter that runs entirely in your browser never sends the bytes anywhere. You
can verify this by opening devtools and watching the network tab — there should be
no POST request containing your text.

Try [Markdown to Word](/markdown-to-word/): paste your text on the left, preview on
the right, and the `.docx` is generated in your browser when you hit download.

## A checklist before you convert

- Images are absolute URLs or data URIs, not relative paths
- No WebP if you can avoid it
- Headings use `#` syntax, not manual bold-on-its-own-line
- Tables have a `---` separator row
- You have read the output once before sending it to anyone
