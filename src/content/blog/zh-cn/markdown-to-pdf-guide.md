---
title: 'Markdown 转 PDF：为什么用浏览器打印比 html2pdf.js 好'
description: '主流方案把文档栅格化成一整张位图。有个更好的办法，文字可选、分页正确。'
pubDate: 2026-01-25
tags: ['markdown', 'pdf', 'browser-print', 'frontend', 'technical']
lang: zh-cn
group: markdown-to-pdf-guide
tools: ['markdown-to-pdf', 'markdown-table-to-pdf']
---

搜索"JavaScript 把 HTML 转成 PDF"，你会找到 `html2pdf.js`，它把 jsPDF 和
html2canvas 打包在一起。它能用，但对文档来说它是错的工具。下面说为什么，以及该
怎么做。

## 栅格化的问题

`html2canvas` 不是给页面截图。它遍历 DOM，读取计算后的样式，然后用绘图命令把每个
元素重新画到 `<canvas>` 上。jsPDF 再把这张画布当作一整张位图嵌进 PDF。

后果：

- **文字不是文字。** 是像素。没法选中、没法搜索、没法复制。
- **链接失效。** 超链接变成了带颜色的像素。
- **体积暴涨。** 十页文档就是十张整页图片。
- **分页靠猜。** jsPDF 根据像素高度计算在哪里切断，所以你的代码块会被从中间劈开。
- **长文档会崩。** Canvas 有最大尺寸限制（Chrome 大约是 16384px）。超了就得到一张
  空白页。

做一页的发票，没问题。做三十页的文档，上面每一条都不可接受。

## 另一个办法：让浏览器来干

每个浏览器都自带一个高质量的 PDF 生成器，就是打印引擎。它输出矢量，原生处理分页，
而且已经被打磨了二十年。

做法：

1. 在一个隐藏的 iframe 里把 Markdown 渲染成 HTML
2. 在 iframe 内部应用 `@media print` 样式表
3. 调用 `contentWindow.print()`
4. 用户的打印对话框里选"另存为 PDF"

你得到的是可选中的文字、能点的链接、正确的分页，以及体积只有几分之一的文件。

## 控制分页的 CSS

这部分才是关键。分页不是用 JavaScript 配的，是用 CSS 表达的：

```css
@page {
  margin: 18mm 16mm;
}

h1, h2, h3, h4 {
  break-after: avoid;   /* 标题不要孤零零留在页尾 */
}

pre, table, img, figure {
  break-inside: avoid;  /* 代码块不要被拆到两页 */
}

p {
  orphans: 3;           /* 页尾至少留 3 行 */
  widows: 3;            /* 页首至少带 3 行 */
}
```

光是给 `pre` 加 `break-inside: avoid`，就解决了生成 PDF 最高频的那个抱怨。

## 什么时候不能用打印

两种情况你需要真正的 PDF 库：

**不允许用户交互。** `window.print()` 会弹对话框。如果你要在后台任务或者 Node 脚本
里生成 PDF，就得用 `pdf-lib` 或 Puppeteer。

**要求字节级一致的输出。** 打印对话框的设置（页边距、页眉页脚、缩放）由用户的浏览器
决定，你无法完全控制。如果你在做一份必须处处长得一模一样的法律文档，那就服务端渲染。

除此之外——想邮件发出去的一份文档、想分享的一份规格说明——打印都更好。

## 几个实用技巧

**打印前设置文档标题。** 大多数浏览器用 `<title>` 作为 PDF 文件名的种子。把它设成
从 H1 提取的标题，下载下来就是个像样的名字，而不是 `document.pdf`。

**等图片加载完。** 如果你的 Markdown 引用了远程图片，调用 `print()` 时它们可能还没
加载完。等所有图片 load 完再打印；如果你用无头浏览器驱动，就用
`page.waitForLoadState`。

**多浏览器测试。** Chrome、Firefox、Safari 对打印 CSS 的实现有小差异。Safari 在
`break-inside` 上尤其严格。

**需要时可以显式分页。** 加一个 `break-after: page` 的 `<div class="page-break">`，
让用户能在想要的地方强制分页。

想看打印方案的实际效果，试试 [Markdown 转 PDF](/zh-cn/markdown-to-pdf/)；
只需要把表格打出来的话，用 [Markdown 表格转 PDF](/zh-cn/markdown-table-to-pdf/)。
