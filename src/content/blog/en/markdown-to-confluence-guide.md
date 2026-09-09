---
title: 'Markdown to Confluence Wiki Markup'
description: 'Confluence does not speak Markdown. Here is the mapping between the two syntaxes, plus the macros you need for code and tables.'
pubDate: 2026-02-16
tags: ['markdown', 'confluence', 'wiki-markup', 'converter', 'tutorial']
lang: en
group: markdown-to-confluence-guide
tools: ['markdown-to-confluence']
---

Confluence uses its own wiki markup, invented years before Markdown became
universal. The two look similar and are not compatible. Pasting Markdown into a
Confluence page gives you literal asterisks and hash marks.

## Syntax mapping

| Markdown | Confluence | Notes |
| --- | --- | --- |
| `# H1` | `h1. H1` | Dot, then a space |
| `## H2` | `h2. H2` | Goes to `h6.` |
| `**bold**` | `*bold*` | Single asterisk |
| `*italic*` | `_italic_` | Single underscore |
| `` `code` `` | `{{code}}` | Double braces for monospace |
| ```` ```js ```` | `{code:language=js}` … `{code}` | Macro, not a fence |
| `> quote` | `bq. quote` | Or `{quote}` … `{quote}` |
| `- item` | `* item` | `**` for nested |
| `1. item` | `# item` | `##` for nested |
| `[text](url)` | `[text\|url]` | **Pipe, not parenthesis** |
| `---` | `----` | Four dashes |

The link syntax is the one that trips everyone up. Markdown uses parentheses;
Confluence uses a pipe.

## Code blocks

Markdown fences map to the code macro, which takes parameters:

```
{code:language=javascript|title=example.js|linenumbers=true}
const x = 1;
{code}
```

If you omit `language`, Confluence shows the block without highlighting. If you omit
the closing `{code}`, everything after it becomes code.

There is a trap: if your code contains a literal `{code}`, it terminates the macro
early. Most converters do not escape this.

## Tables

Confluence table syntax uses double pipes for headers:

```
||Heading 1||Heading 2||
|Cell 1|Cell 2|
```

Note the header row uses `||` while body rows use a single `|`, and unlike Markdown
there is **no separator row**.

## What has no equivalent

**Images.** Markdown's `![alt](url)` becomes `!url!` in Confluence, but only for
attached or absolute URLs. Relative paths do not resolve.

**Task lists.** `- [ ]` has no wiki markup equivalent. Use the task macro
(`{task}`) or a bullet with a checkbox character.

**Footnotes, definition lists, inline HTML.** No mapping. They either get dropped or
arrive as literal text.

**Math.** Confluence needs the LaTeX macro. Raw `$...$` renders as dollar signs.

## Two ways to get content in

**Convert and paste.** Render to wiki markup, paste into the editor. Fast, but you
lose the ability to round-trip back to Markdown.

**Use the storage format.** Confluence's real underlying format is XHTML
("storage format"), and the REST API accepts it. If you are automating, converting
Markdown → HTML → Confluence storage XML is more reliable than targeting wiki
markup, because you can represent macros properly.

## Why bother converting at all

If your team writes in Markdown (READMEs, RFCs, ADRs) and publishes to Confluence,
someone is manually reformatting. That is slow and it introduces errors — a heading
becomes bold text, a table becomes space-separated columns.

Converting mechanically and then fixing the few macros by hand is much faster than
retyping.

Try [Markdown to Confluence](/markdown-to-confluence/) — paste on the left, copy the
wiki markup on the right.
