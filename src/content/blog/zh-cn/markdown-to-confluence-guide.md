---
title: 'Markdown 转 Confluence Wiki 标记'
description: 'Confluence 不认 Markdown。这里是两套语法的对照表，以及代码和表格需要的宏。'
pubDate: 2026-02-16
tags: ['markdown', 'confluence', 'wiki-markup', 'converter', 'tutorial']
lang: zh-cn
group: markdown-to-confluence-guide
tools: ['markdown-to-confluence']
---

Confluence 用的是自己的 wiki 标记，发明于 Markdown 统一江湖之前很多年。两者看着像，
但不兼容。把 Markdown 直接粘进 Confluence 页面，你会得到字面的星号和井号。

## 语法对照

| Markdown | Confluence | 说明 |
| --- | --- | --- |
| `# 一级` | `h1. 一级` | 一个点，然后空格 |
| `## 二级` | `h2. 二级` | 一直到 `h6.` |
| `**粗体**` | `*粗体*` | 单个星号 |
| `*斜体*` | `_斜体_` | 单个下划线 |
| `` `代码` `` | `{{代码}}` | 双大括号表示等宽 |
| ```` ```js ```` | `{code:language=js}` … `{code}` | 是宏，不是栅栏 |
| `> 引用` | `bq. 引用` | 或用 `{quote}` … `{quote}` |
| `- 项` | `* 项` | 嵌套用 `**` |
| `1. 项` | `# 项` | 嵌套用 `##` |
| `[文字](url)` | `[文字\|url]` | **是竖线，不是括号** |
| `---` | `----` | 四个短横线 |

链接语法是最容易坑人的一个。Markdown 用圆括号，Confluence 用竖线。

## 代码块

Markdown 的栅栏对应 code 宏，它接受参数：

```
{code:language=javascript|title=example.js|linenumbers=true}
const x = 1;
{code}
```

省略 `language`，Confluence 就不给高亮。省略结尾的 `{code}`，后面所有内容都会变成代码。

这里有个陷阱：如果你的代码里含有字面的 `{code}`，宏会提前结束。大多数转换器不会
转义这个。

## 表格

Confluence 的表格语法用双竖线表示表头：

```
||表头 1||表头 2||
|单元格 1|单元格 2|
```

注意表头行用 `||` 而正文行用单个 `|`，而且和 Markdown 不同，**没有分隔行**。

## 没有对应物的东西

**图片。** Markdown 的 `![alt](url)` 在 Confluence 里变成 `!url!`，但只对附件或绝对
URL 有效。相对路径解析不了。

**任务列表。** `- [ ]` 在 wiki 标记里没有对应物。要么用 task 宏（`{task}`），要么用
项目符号加一个复选框字符。

**脚注、定义列表、内联 HTML。** 没有映射。要么被丢掉，要么变成字面文本。

**公式。** Confluence 需要 LaTeX 宏。裸的 `$...$` 渲染出来就是美元符号。

## 两种把内容弄进去的方式

**转换后粘贴。** 渲染成 wiki 标记，粘进编辑器。快，但你就没法再转回 Markdown 了。

**用 storage 格式。** Confluence 真正的底层格式是 XHTML（叫 "storage format"），
REST API 接受它。如果你在做自动化，把 Markdown 转成 HTML 再转成 Confluence storage
XML 比直接生成 wiki 标记更可靠，因为你能正确表达宏。

## 费这个劲图什么

如果你的团队用 Markdown 写东西（README、RFC、ADR）却要在 Confluence 上发布，那一定
有人在手动重排版。这很慢，而且会引入错误——标题变成加粗文字，表格变成空格分隔的列。

先机械转换、再手工修几个宏，比重新敲一遍快得多。

试试 [Markdown 转 Confluence](/zh-cn/markdown-to-confluence/)：左边粘贴，右边复制
wiki 标记。
