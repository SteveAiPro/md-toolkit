---
title: 'Markdown 表格：写法、对齐与互相转换'
description: '表格是 Markdown 里最容易出错的部分。规则、对齐语法，以及在 CSV、JSON、Word 之间搬运表格的方法。'
pubDate: 2026-02-02
tags: ['markdown', 'table', 'tutorial', 'converter']
lang: zh-cn
group: markdown-table-guide
tools: ['csv-to-markdown-table', 'json-to-markdown-table', 'markdown-table-to-csv', 'markdown-table-to-pdf']
---

Markdown 表格是整个语法里最可能"静默失败"的部分——不报错，就是渲染成纯文本。
规则不多，但很严格。

## 最小可用表格

```markdown
| 列 A | 列 B |
| --- | --- |
| 值 1 | 值 2 |
```

三个要求：

1. 用竖线分隔单元格
2. **第二行必须是分隔行**，只能由短横线和冒号组成
3. 首尾的竖线可选，但要保持一致

少了分隔行，你就得到四行带竖线的纯文本。这是表格失败最常见的原因。

## 对齐

分隔行里的冒号决定列对齐：

```markdown
| 左对齐 | 居中 | 右对齐 |
| :--- | :----: | ----: |
| a    |   b    |     c |
```

- `:---` 左
- `:---:` 居中
- `---:` 右

短横线只要一个字符就够：`|:-|:-:|-:|` 是合法的。

## 转义竖线

单元格里的字面竖线必须写成 `\|`，否则会被当成单元格分隔符，后面所有列都会错位：

```markdown
| 表达式 | 含义 |
| --- | --- |
| `a \| b` | 按位或 |
```

写 shell 命令和正则表达式文档的人特别容易踩这个，这两者都重度使用竖线。

## 什么做不到

**合并单元格。** Markdown 没有 `colspan` 或 `rowspan` 的语法，完全无法合并。通常的
变通办法是重复内容，或者直接用 HTML 表格。

**多行单元格。** 一个单元格里不能有硬换行。确实需要的话，要么用 HTML 的 `<br>`
（大多数方言支持），要么重新设计表格结构。

**嵌套表格。** 不支持。

**长内容。** 表格不会优雅地换行。一个塞了一整段文字的单元格会变得没法读——改用列表。

## 在格式之间搬运表格

这块最花时间。三个常见方向：

**CSV → Markdown。** 麻烦在分隔符嗅探和带引号的字段。CSV 里含逗号的单元格会被
引号包住：`"Smith, John"`。直接用 `split(',')` 会把它拆成两列。必须用真正的解析器。

**JSON → Markdown。** 扁平对象数组映射得很干净：键变成表头，值变成单元格。嵌套对象
完全没法映射——你得先把它拍平，通常用点号连接键（`user.name`）。

**Markdown → CSV。** 读取是反向操作，但你需要把含逗号或引号的值重新转义。不做转义
策略就写 CSV，产出的文件在 Excel 里打开会错乱。

这三个都有现成的浏览器工具：
[CSV 转 Markdown 表格](/zh-cn/csv-to-markdown-table/)、
[JSON 转 Markdown 表格](/zh-cn/json-to-markdown-table/)、
[Markdown 表格转 CSV](/zh-cn/markdown-table-to-csv/)。

## 把表格弄到纸上

宽表格是经典的 PDF 难题。十列的表格放在 A4 竖版上会没法看。

两个办法，都是一行 CSS：

```css
@page { size: A4 landscape; }
```

或者缩小表格内的字号并允许断行：

```css
table { font-size: 9pt; }
tr { break-inside: avoid; }   /* 不要把一行拆到两页 */
```

[Markdown 表格转 PDF](/zh-cn/markdown-table-to-pdf/) 默认就用横向布局。

## 排错清单

表格渲染成纯文本了？按顺序查：

1. 表头正下方有没有一行短横线分隔行？
2. 表格前后有没有空行？
3. 每一行的竖线数量和表头一致吗？
4. 字面竖线有没有转义成 `\|`？
5. 你的解析器到底支不支持表格？（最初的 Markdown 不支持，CommonMark 也不支持——
   表格是 GFM 的扩展。）
