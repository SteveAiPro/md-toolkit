---
title: '把 Markdown 转成图片，还不糊'
description: '画布尺寸上限、字体嵌入问题、CORS 陷阱——这三样能搞坏每一个粗糙的 Markdown 转图片导出器。'
pubDate: 2026-02-09
tags: ['markdown', 'image', 'frontend', 'technical', 'cors']
lang: zh-cn
group: markdown-to-image-guide
tools: ['markdown-to-image', 'markdown-table-to-image']
---

你想要一张 Markdown 的 PNG——发推、做幻灯片、当 README 预览。最直觉的方案是
`html2canvas`。小内容它能用，大内容它会静默产出垃圾。

## 三种失败方式

### 1. 画布尺寸上限

每个浏览器都限制 canvas 尺寸。Chrome 每边大约 16384px，总面积也有限制
（约 2.68 亿像素）。一份长文档在 2 倍设备像素比下轻轻松松就超了。

超了之后 `toBlob()` **不会报错**，它返回一张空白图片。这就是为什么"我的长 Markdown
导出成了空白 PNG"是个特别让人困惑的 bug——没有任何错误提示。

解决办法是纵向分片渲染再拼到最终画布上，或者对长文档降低像素比。

### 2. 字体消失

如果你通过 SVG 的 `foreignObject` 渲染，外部字体不会被加载。SVG 被序列化后在一个
隔离上下文里重新解析，你样式表里的 `@font-face` 指向的 URL 永远不会被请求。结果就是
用回退字体渲染，或者中日韩字符变成一堆方框。

解决办法是在序列化之前把字体内联成 base64 data URI。像 `html-to-image` 这类库用
`embedWebFonts` 步骤做这件事：遍历 `document.styleSheets`，找出每个 `@font-face`，
把字体文件抓下来内联进去。

这也是为什么**中文、日文、韩文是最先坏掉的**。拉丁字符的回退字体看起来还像文字，
CJK 的回退字体看起来就是豆腐块。

### 3. 跨域图片污染画布

在没有正确 CORS 头的情况下把跨域图片画到 canvas 上，画布就被污染了。之后任何
`toBlob()` 或 `toDataURL()` 都会抛 `SecurityError`。

页面侧没有变通办法——图片服务器必须发 `Access-Control-Allow-Origin`。如果它发
了，就在设置 `src` **之前**给 `<img>` 设置 `crossOrigin="anonymous"`。设置晚了没用。

## 能跑通的方案

`html-to-image` 用 SVG `foreignObject`，而不是重绘 DOM：

```javascript
const dataUrl = await toPng(node, {
  pixelRatio: 2,
  backgroundColor: '#ffffff',
  // 把 @font-face 内联成 data URI，否则 CJK 文字会坏
  embedWebFonts: true,
});
```

因为渲染是浏览器做的（而不是用 JS 重新实现一遍 CSS），复杂布局也能正确输出。

## 起个像样的文件名

从第一个 H1 推导文件名是个很讨巧的细节，能避免文件夹里一堆 `image.png`：

```javascript
const h1 = node.querySelector('h1')?.textContent ?? 'document';
const slug = h1
  .toLowerCase()
  .replace(/[^\w\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .slice(0, 60);
```

## 真正影响质量的两个设置

- **`pixelRatio: 2`** 用于视网膜屏。超过 2 之后体积涨得很快，观感提升却很小。
- **一定要设背景色。** 透明背景的文字 PNG 在深色背景下没法看，而且在大多数查看器里
  看起来就是坏了。
- **导出前等图片加载完。** 遍历 `node.querySelectorAll('img')`，逐个 `await` 它的
  `decode()`。否则你截到的是一堆空框。
- **宽度固定，高度自适应。** 显式设定宽度让文字按预期换行，高度交给内容撑开。

## 只需要一张表格的时候

渲染整个文档很重。如果产出只是一张表格，直接往 canvas 上画更快也更清晰——用
`ctx.measureText()` 量文字、算列宽、画单元格。不需要 DOM，不需要 SVG，不需要字体
嵌入。

这就是 [Markdown 转图片](/zh-cn/markdown-to-image/)（整篇文档，基于 SVG）和
[Markdown 表格转图片](/zh-cn/markdown-table-to-image/)（canvas 直接绘制，秒出）的区别。
