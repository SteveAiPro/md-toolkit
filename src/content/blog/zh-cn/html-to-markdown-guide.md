---
title: 'HTML 转 Markdown：为什么反着走更难'
description: 'HTML 是一棵把表现层焊死在里面的树，Markdown 只是它的一个小子集。这里说清楚什么能活下来、什么会被悄悄拧坏。'
pubDate: 2026-08-24
tags: ['markdown', 'html', 'converter', 'technical']
lang: zh-cn
group: html-to-markdown-guide
tools: ['html-to-markdown']
---

Markdown 转 HTML 几乎无损。HTML 转 Markdown 不是，而且永远不可能是。

原因是结构性的：HTML 能表达的东西远多于 Markdown。嵌套 `<div>`、行内样式、任意
属性、跨列的单元格——都没有 Markdown 对应物。转换器必须决定**扔掉什么**，而每一个
这样的决定都是一次主观判断。

## 大家都在用的库

`turndown` 是事实标准，再配 `turndown-plugin-gfm` 支持表格和删除线：

```javascript
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const td = new TurndownService({
  headingStyle: 'atx',        // 用 # 而不是下划线
  codeBlockStyle: 'fenced',   // 用 ``` 而不是缩进
  bulletListMarker: '-',      // 用 - 而不是 *
});

td.use(gfm);
const markdown = td.turndown(html);
```

这三个选项比看起来重要。默认值会产出 setext 标题（下面划 `===`）、缩进式代码块和
`*` 项目符号——全都合法，但全都比替代方案更难移植。

## 能干净活下来的

| HTML | Markdown | 说明 |
| --- | --- | --- |
| `<h1>`–`<h6>` | `#`–`######` | atx 风格下 |
| `<strong>`、`<b>` | `**粗体**` | |
| `<em>`、`<i>` | `*斜体*` | |
| `<a href>` | `[文字](url)` | 相对 URL 原样保留 |
| `<img>` | `![alt](src)` | alt 属性变成替代文字 |
| `<ul>`、`<ol>` | `-` / `1.` | 嵌套层级保留 |
| `<blockquote>` | `>` | |
| `<pre><code>` | 栅栏代码块 | 语言从 `class` 猜 |
| `<table>` | GFM 表格 | 需要插件，而且要有 `<th>` |

## 活不下来的

**一切表现层的东西。** `<div>`、`<span>`、行内 `style`、`class`——全没了。这正是
Markdown 的意义所在，但如果你本来依赖某个自定义布局，那它就丢了。

**合并单元格。** `colspan` 和 `rowspan` 在 Markdown 里没有表示。常见结果是合并单元格
的内容落在第一列，其余为空；更糟时整张表退化成纯文本。

**嵌套表格。** Markdown 里没这东西，别指望能回来。

**段落里的 `<br>`。** Markdown 的换行是两个行尾空格，而几乎所有编辑器保存时都会把
行尾空格删掉。现实的做法是把 `<br>` 当原始 HTML 留着，多数渲染器认。

**定义列表 `<dl>`。** 没有映射。要么变成段落，要么直接消失。

**你没想要的行内格式。** 一个靠样式表设置 font-weight 的 `<span>`，turndown 看不见
——它只看标签，不看计算样式。所以在页面上**看起来**是粗体的文字，转出来可能是普通
文字。

## 逃生口：把 HTML 留下

遇到没有 Markdown 对应物的东西，可以让 turndown 别管它：

```javascript
td.keep(['details', 'summary', 'iframe']);
```

这些标签会原样透传。折叠区块和内嵌视频就是这么保下来的。前提是目标渲染器开了
`html: true`——在会转义原始 HTML 的平台上，你会得到字面标签文本。

## 空白字符问题

这个能坑掉一整个下午。

浏览器认为行内标签之间的空白不重要，Markdown 认为重要。所以这段 HTML：

```html
<p>你好 <strong>世界</strong>，欢迎。</p>
```

可能转出 `你好 **世界** ，欢迎.`——注意逗号前那个空格——取决于转换器怎么归一化文本
节点。修法是在转换前把行内元素边界处连续的空白收掉，这也是为什么好的转换器会先
预处理 DOM，而不是直接处理字符串。

同样的问题还表现为嵌套列表周围多出空行，因为格式化过的 HTML 里 `</li>` 和 `<ul>`
之间的换行也成了文本节点。

## 真正有用的三步预处理

在把 HTML 交给转换器之前，跑这三项能修好绝大多数真实文档：

1. **剥掉噪音**：`<script>`、`<style>`、`<noscript>`、注释、追踪像素
2. **拆掉表现层包装**：没有语义、只有一个子节点的 `<div>` 可以直接被子节点替换
3. **归一化**行内元素内部和周围的空白

做完这些，效果比在 Markdown 侧堆再多后处理正则都好——事后再修坏掉的 Markdown 难
得多，因为那时你已经分不清哪个换行是有意义的了。

## 什么时候该停手

如果 HTML 是手写文档，转换通常值得做。如果它是某个 Web 应用的渲染产物——二十层
嵌套 div、工具类 class、行内样式——那你该回去找源文。转换器对文档表现最好，对机器
生成的 DOM 表现最差。

把你的标记贴进 [HTML 转 Markdown](/zh-cn/html-to-markdown/)，先看结果再决定要不要
投入。如果输出需要超过几分钟的手工清理，说明一开始就选错了源头。
