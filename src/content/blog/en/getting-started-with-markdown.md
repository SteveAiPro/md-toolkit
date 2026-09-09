---
title: 'Getting Started with Markdown: A Practical Guide'
description: 'Learn Markdown in 10 minutes — syntax, tables, code blocks, and the gotchas that trip up most beginners.'
pubDate: 2026-01-12
tags: ['markdown', 'beginner', 'tutorial']
lang: en
group: getting-started-with-markdown
tools: ['markdown-editor', 'markdown-to-pdf', 'markdown-to-html']
---

Markdown is a plain-text format that turns into structured HTML. You write in a
`.md` file with a handful of punctuation marks, and any renderer turns it into
headings, lists, tables, and links.

It was created in 2004 by John Gruber. Twenty years later it is the default for
READMEs, documentation, blog posts, chat messages, and LLM prompts. The reason is
simple: it survives being copied everywhere and stays readable even when nothing
renders it.

## Why bother

Three concrete reasons:

1. **It is diffable.** Git diffs on Word files are useless. Diffs on Markdown tell
   you exactly which sentence changed.
2. **It is portable.** Every platform from GitHub to Notion to ChatGPT accepts it.
3. **It is fast.** No toolbar hunting, no mouse. Your hands never leave the keyboard.

## The syntax you will actually use

You can be productive with about ten rules.

### Headings

```markdown
# H1
## H2
### H3
```

One `#` per level, followed by a space. The space is not optional — `#Heading`
renders as literal text in most parsers.

### Emphasis

```markdown
*italic*   or   _italic_
**bold**   or   __bold__
***both***
```

### Lists

```markdown
- Unordered item
- Another item
  - Nested (two spaces before the dash)

1. Ordered item
2. Second item
```

Nesting is indentation-sensitive. Two spaces for unordered, three for ordered.
Get this wrong and you get a flat list with weird leading spaces.

### Links and images

```markdown
[Link text](https://example.com)
![Alt text](image.png)
```

The only difference is the leading `!`.

### Code

Inline code uses single backticks: `` `npm install` ``.

Blocks use triple backticks, and you should always name the language:

````markdown
```javascript
const x = 1;
```
````

Without the language tag you get no syntax highlighting.

### Blockquotes

```markdown
> Quoted text
> Second line
```

### Tables

```markdown
| Feature | Status |
| --- | --- |
| Export | Shipped |
| Import | Beta |
```

The `---` row is mandatory — it tells the parser which row is the header. Alignment
is controlled by colons: `:---` left, `---:` right, `:---:` center.

## Gotchas that cost beginners an hour

**A blank line is required before every block element.** This does not render as a
list:

```markdown
Some text
- item one
- item two
```

You need an empty line between the paragraph and the list. Same rule for headings,
code blocks, and tables.

**Indenting a code block by four spaces also works**, but mixing tabs and spaces will
break it. Use fenced blocks (triple backticks) and avoid the issue entirely.

**Not all flavors are the same.** CommonMark is the standard. GitHub Flavored
Markdown adds tables, task lists, and autolinks. Your parser might support
footnotes, or math, or neither. If something does not render, the flavor is the
first thing to check.

**Escaping.** To show a literal asterisk, write `\*`. Characters that need escaping:
`\`` `*`` `_`` `{`` `}`` `[`` `]`` `(`` `)`` `#`` `+`` `-`` `.`` `!`

## Where to go next

Open the [Markdown editor](/markdown-editor/) and paste this article into it — you
will see the rendered result update as you type.

When you need to hand the document to someone who does not use Markdown, convert it.
[Markdown to PDF](/markdown-to-pdf/) keeps the formatting for sharing;
[Markdown to HTML](/markdown-to-html/) gives you a standalone page you can host
anywhere.
