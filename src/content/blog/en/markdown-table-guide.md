---
title: 'Markdown Tables: Formatting, Alignment, and Conversion'
description: 'Tables are the most error-prone part of Markdown. Learn the rules, the alignment syntax, and how to move tables between CSV, JSON, and Word.'
pubDate: 2026-02-02
tags: ['markdown', 'table', 'tutorial', 'converter']
lang: en
group: markdown-table-guide
tools: ['csv-to-markdown-table', 'json-to-markdown-table', 'markdown-table-to-csv', 'markdown-table-to-pdf']
---

Markdown tables are the part of the syntax most likely to silently render as plain
text. The rules are few but strict.

## The minimum viable table

```markdown
| Column A | Column B |
| --- | --- |
| Value 1 | Value 2 |
```

Three requirements:

1. Pipe characters delimit cells
2. **The second row must be the separator**, made only of dashes and colons
3. Leading and trailing pipes are optional, but be consistent

If the separator row is missing, you get four lines of text with pipes in them. This
is the single most common table failure.

## Alignment

Colons in the separator row set column alignment:

```markdown
| Left | Center | Right |
| :--- | :----: | ----: |
| a    |   b    |     c |
```

- `:---` left
- `:---:` center
- `---:` right

The dashes only need to be one character: `|:-|:-:|-:|` is valid.

## Escaping pipes

A literal `|` inside a cell must be escaped as `\|`, or it will be parsed as a cell
delimiter and shift every subsequent column:

```markdown
| Expression | Meaning |
| --- | --- |
| `a \| b` | Bitwise OR |
```

This bites people writing documentation for shell commands and regular expressions,
both of which use pipes heavily.

## What does not work

**Merged cells.** Markdown has no syntax for `colspan` or `rowspan`. You cannot
merge cells, period. The usual workaround is repetition or an HTML table.

**Multi-line cells.** A cell cannot contain a hard line break. If you need one,
either use an HTML `<br>` (works in most flavors) or restructure the table.

**Nested tables.** Not supported.

**Long content.** Tables do not wrap gracefully. A cell with a paragraph of text
becomes unreadable — use a list instead.

## Moving tables between formats

This is where people spend real time. The three common directions:

**CSV → Markdown.** The tricky part is delimiter sniffing and quoted fields. A CSV
cell containing a comma is wrapped in quotes: `"Smith, John"`. A naive `split(',')`
turns that into two columns. Use a real parser.

**JSON → Markdown.** Arrays of flat objects map cleanly: keys become headers, values
become cells. Nested objects do not map at all — you have to flatten them first,
usually by joining keys with a dot (`user.name`).

**Markdown → CSV.** Reading is the reverse, but you need to re-escape values that
contain commas or quotes. Writing a CSV without an escaping strategy produces files
that break when opened in Excel.

All three are available as browser tools:
[CSV to Markdown table](/csv-to-markdown-table/),
[JSON to Markdown table](/json-to-markdown-table/), and
[Markdown table to CSV](/markdown-table-to-csv/).

## Getting a table onto paper

Wide tables are the classic PDF problem. A ten-column table on A4 portrait becomes
unreadable.

Two options, both one line of CSS:

```css
@page { size: A4 landscape; }
```

Or reduce the font inside the table and allow it to break:

```css
table { font-size: 9pt; }
tr { break-inside: avoid; }   /* do not split a row across pages */
```

[Markdown table to PDF](/markdown-table-to-pdf/) applies the landscape layout by
default.

## A debugging checklist

Table rendering as plain text? Work down this list:

1. Is there a separator row of dashes directly under the header?
2. Is there a blank line before and after the table?
3. Does every row have the same number of pipes as the header?
4. Are any literal pipes escaped as `\|`?
5. Does your parser support tables at all? (Original Markdown did not; CommonMark
   does not either — tables are a GFM extension.)
