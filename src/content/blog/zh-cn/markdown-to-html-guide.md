---
title: 'Markdown 转 HTML：中间到底发生了什么'
description: '解析流水线、几乎没人补的 XSS 漏洞，以及你的原始 HTML 为什么会悄悄消失。'
pubDate: 2026-08-17
tags: ['markdown', 'html', 'converter', 'tutorial']
lang: zh-cn
group: markdown-to-html-guide
tools: ['markdown-to-html', 'markdown-editor']
---

Markdown 转 HTML 是所有其他转换的地基。转 Word、转 PDF、转 Confluence、转
reStructuredText——全都走 Markdown → HTML → 目标格式。所以这一步错了，下游全都错。

它也是最容易的方向：Markdown 天生就是为变成 HTML 设计的。麻烦不在语法，在**选项**。

## 流水线

四步，按顺序：

1. **解析** Markdown 成 token 流，再成 AST
2. **渲染** AST 成 HTML 字符串
3. **清洗**（如果输入不完全可信）
4. **包装**成完整文档：CSS、charset、脚本标签

大家报的 bug 基本都在第 2 步或第 3 步。

## 会改变输出的几个选项

以 `markdown-it` 为例，多数工具（包括这个站）都跑在它上面：

```javascript
const md = new MarkdownIt({
  html: true,        // 允许源文里有原始 HTML
  linkify: true,     // 把裸 URL 变成链接
  typographer: true, // 智能引号、破折号、省略号
  breaks: false,     // 把单个换行当成 <br>
});
```

**`html`** 是最让人意外的一个。设成 `false`，Markdown 里所有 `<div>` 都会变成字面
文本；设成 `true`，你就等于开放了脚本注入——见下节。

**`breaks`** 是另一个。GitHub 把它设成 `true`，所以段落里单个换行在 GitHub 上会变成
换行，但在你本地编辑器里不会。你的文档在 GitHub 上看着对、别处都错，就是这个原因。

**`linkify`** 会把 `https://example.com` 变成可点链接。通常无害，除非你正在写一份
需要把 URL 当纯文本展示的文档。

## 安全这节不是可选项

只要 Markdown 不是你自己键盘敲出来的——用户评论、PR 描述、大模型的回答——它就是
不可信输入。而 Markdown 有个**故意留的后门：原始 HTML 原样透传**。

```markdown
你好！

<img src=x onerror="alert(document.cookie)">
```

`html: true` 时，那个 `onerror` 会真的执行。这不是理论风险，它是文档站和聊天应用里
最常见的 XSS 入口。

修法是在渲染**之后**做一次清洗，绝不要在之前：

```javascript
import DOMPurify from 'dompurify';

const dirty = md.render(userInput);
const clean = DOMPurify.sanitize(dirty);
```

两条容易搞反的规则：

**清洗输出，不要清洗输入。** 用正则黑名单过滤 Markdown 源文是没用的——Markdown 有
十几种方式表达同一个东西，你一定会漏掉一种。先渲染，再清洗 HTML。

**别把自己可信的内容洗残了。** 某些配置下 DOMPurify 会剥掉 `class` 属性，等于静默
删掉你的语法高亮标记。源文自己可控时就别过清洗器，省得跟白名单打架。

## 产出一个能直接打开的文件

渲染出来的片段不是网页。要交给别人打开，得是完整文档：

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>我的文档</title>
  <style>/* 你的 CSS */</style>
</head>
<body>
  <!-- 渲染后的 markdown -->
</body>
</html>
```

`<meta charset="utf-8">` 不是装饰。缺了它，含中文或带音标字符的文件从磁盘打开时，
在某些浏览器里会变成乱码——浏览器会猜编码，而且猜错。

有代码块的话，还得在标记进 DOM **之后**初始化 highlight.js：

```javascript
document.querySelectorAll('pre code').forEach((el) => hljs.highlightElement(el));
```

有公式就在 head 里放 KaTeX 的 CSS。漏掉任何一样，你会得到一个"说不清哪里坏了"的页面。

## 悄悄出错的地方

**你不是故意写的缩进代码。** 行首四个空格在原始 Markdown 里意味着"代码块"。复制粘贴
进来的一段恰好带缩进的文字，就会变成等宽字体。

**相对路径的图片。** `![图](./img/diagram.png)` 在源文件旁边能用，HTML 一挪地方就
断。绝对 URL 和 data URI 能活，相对路径不行。

**标题 ID。** 多数渲染器会自动从标题文本生成 `id`，于是你能链到 `#installation`。
但 slug 规则各不一样：空格变 `-` 是一致的，大小写和标点处理不一致。没验证过的锚点
不要硬写。

**原始 HTML 这个后门是双向的。** 有时你确实想在 Markdown 里放个 `<div>` 或
`<details>`。这在 GitHub 上行，在 `html: false` 的渲染器里不行。依赖之前先确认。

## 你到底要哪种产物

要贴进 CMS 的片段、要一个完整独立页面、还是什么都不用产出只是想读一下——这是三种
不同的活。

[Markdown 转 HTML](/zh-cn/markdown-to-html/) 给你的是独立页面：charset、样式、高亮
都接好了，在你自己的浏览器里生成。如果只是想看看 Markdown 长什么样，
[Markdown 编辑器](/zh-cn/markdown-editor/) 更快。
