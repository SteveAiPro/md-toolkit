---
title: 'How to Write a README People Actually Read'
description: 'The structure that works, the four mistakes that kill most READMEs, and why screenshots beat paragraphs.'
pubDate: 2026-09-07
tags: ['markdown', 'readme', 'beginner', 'tutorial']
lang: en
group: write-a-better-readme
tools: ['markdown-editor', 'markdown-to-image', 'markdown-to-pdf']
---

A README has one job: get a stranger from "what is this" to "I can use this" as fast
as possible. Most READMEs fail because they are written for the author, not the
reader.

The good news is that the format is almost entirely solved. There is a structure that
works, and deviating from it rarely helps.

## The structure

In order, top to bottom:

1. **Name and one-line description.** Not a tagline. What does it do, literally.
2. **A screenshot or a short GIF**, if the thing has a visual output.
3. **Install.** One copy-pasteable command.
4. **Usage.** The smallest example that does something useful.
5. **Configuration / API reference**, if there is one.
6. **Contributing** and **License**, at the bottom.

That is it. Notice what is not on the list: a project status section, a philosophy
manifesto, a roadmap, a table of badges twelve rows deep.

## The four mistakes

**1. No install command.** The single most common failure. The reader is interested,
scrolls looking for how to start, finds a wall of prose and a link to a wiki, and
leaves. Put the command in a fenced block in the first screenful.

**2. The usage example is the entire API.** A README should show the *hello world*,
not every option. Everything else goes in a docs site or a separate file. If your
usage section needs a table of contents, it is too long for a README.

**3. Badges as a substitute for content.** Six badges at the top communicate "this
project is maintained" and nothing else. Keep two or three that matter — build status
and version — and move on.

**4. Stale screenshots.** Worse than no screenshot. A UI that has changed since the
image was taken makes the reader doubt the whole document. If you cannot keep them
current, use a code block instead.

## Details that pay off

**Make the copy-paste actually work.** This is where Markdown specifics matter. A
shell command in a fenced block with the language tag:

````markdown
```bash
npm install your-package
```
````

Do not put a `$` prompt at the start of the line. It looks authentic and breaks
copy-paste — the reader has to select around it every single time.

**Link to sections, not files.** Auto-generated heading IDs let you write
`see [Configuration](#configuration)`. Verify the anchor; slug rules differ between
renderers.

**Use tables for options.** A 20-line options list in prose is unreadable. Three
columns — name, default, description — is the right shape:

```markdown
| Option | Default | Description |
| --- | --- | --- |
| `timeout` | `5000` | Request timeout in ms |
| `retries` | `3` | Attempts before failing |
```

**Collapse the long tail.** Native `<details>` works on GitHub:

```markdown
<details>
<summary>Full option list</summary>

...long content here...

</details>
```

This is raw HTML in Markdown. It works on GitHub and on modern static generators, and
it fails on platforms that escape HTML. Know your audience before relying on it.

**Say what it does not do.** A short "Non-goals" or "Limitations" section saves you
issues and saves the reader a wasted evening. It is underrated.

## Length

There is no correct length, but there is a correct *shape*: the further down the
document, the more specialised the content. Someone should be able to stop reading
after the usage section and succeed.

If your README is over about two screens, the extra content probably belongs in
`docs/`. Link to it from the README rather than inlining it.

## Reuse the README elsewhere

The README is often the best marketing copy you have. Two conversions worth knowing:

**To an image.** A rendered screenshot of the README — name, description, install
command, and example in one picture — is a decent social post. Past a certain length
the image gets unreadable, so crop to the top section.
[Markdown to image](/markdown-to-image/) renders it as a PNG.

**To a PDF.** Handy for internal docs handed to people who live in Word, or for
archiving a version of the document alongside a release.
[Markdown to PDF](/markdown-to-pdf/) uses the browser print engine, so code blocks
break properly across pages instead of being sliced in half.

## The five-minute test

Ask someone who has never seen the project to follow your README and tell you where
they got stuck. Whatever they stumble on is the thing to fix — and it is almost never
the thing you thought was unclear.

Draft it in the [Markdown editor](/markdown-editor/) so you can see the rendered
structure as you write. Reading a README as raw Markdown hides exactly the problems
your readers will hit.
