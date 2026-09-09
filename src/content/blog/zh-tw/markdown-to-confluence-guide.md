---
title: 'Markdown 轉 Confluence Wiki 標記'
description: 'Confluence 不認 Markdown。這裡是兩套語法的對照表，以及程式碼和表格需要的巨集。'
pubDate: 2026-02-16
tags: ['markdown', 'confluence', 'wiki-markup', 'converter', 'tutorial']
lang: zh-tw
group: markdown-to-confluence-guide
tools: ['markdown-to-confluence']
---

Confluence 用的是自己的 wiki 標記，發明於 Markdown 統一天下之前很多年。兩者看著像，
但不相容。把 Markdown 直接貼進 Confluence 頁面，你會得到字面的星號和井號。

## 語法對照

| Markdown | Confluence | 說明 |
| --- | --- | --- |
| `# 一級` | `h1. 一級` | 一個點，然後空格 |
| `## 二級` | `h2. 二級` | 一直到 `h6.` |
| `**粗體**` | `*粗體*` | 單個星號 |
| `*斜體*` | `_斜體_` | 單個底線 |
| `` `程式碼` `` | `{{程式碼}}` | 雙大括號表示等寬 |
| ```` ```js ```` | `{code:language=js}` … `{code}` | 是巨集，不是柵欄 |
| `> 引用` | `bq. 引用` | 或用 `{quote}` … `{quote}` |
| `- 項` | `* 項` | 巢狀用 `**` |
| `1. 項` | `# 項` | 巢狀用 `##` |
| `[文字](url)` | `[文字\|url]` | **是豎線，不是括號** |
| `---` | `----` | 四個短橫線 |

連結語法是最容易坑人的一個。Markdown 用圓括號，Confluence 用豎線。

## 程式碼區塊

Markdown 的柵欄對應 code 巨集，它接受參數：

```
{code:language=javascript|title=example.js|linenumbers=true}
const x = 1;
{code}
```

省略 `language`，Confluence 就不給高亮。省略結尾的 `{code}`，後面所有內容都會變成
程式碼。

這裡有個陷阱：如果你的程式碼裡含有字面的 `{code}`，巨集會提前結束。大多數轉換器
不會跳脫這個。

## 表格

Confluence 的表格語法用雙豎線表示表頭：

```
||表頭 1||表頭 2||
|儲存格 1|儲存格 2|
```

注意表頭列用 `||` 而正文列用單個 `|`，而且和 Markdown 不同，**沒有分隔行**。

## 沒有對應物的東西

**圖片。** Markdown 的 `![alt](url)` 在 Confluence 裡變成 `!url!`，但只對附件或絕對
URL 有效。相對路徑解析不了。

**工作清單。** `- [ ]` 在 wiki 標記裡沒有對應物。要嘛用 task 巨集（`{task}`），要嘛用
項目符號加一個核取方塊字元。

**腳註、定義清單、行內 HTML。** 沒有對應。要嘛被丟掉，要嘛變成字面文字。

**公式。** Confluence 需要 LaTeX 巨集。裸的 `$...$` 轉譯出來就是美元符號。

## 兩種把內容弄進去的方式

**轉換後貼上。** 轉譯成 wiki 標記，貼進編輯器。快，但你就沒法再轉回 Markdown 了。

**用 storage 格式。** Confluence 真正的底層格式是 XHTML（叫 "storage format"），
REST API 接受它。如果你在做自動化，把 Markdown 轉成 HTML 再轉成 Confluence storage
XML 比直接產生 wiki 標記更可靠，因為你能正確表達巨集。

## 費這個勁圖什麼

如果你的團隊用 Markdown 寫東西（README、RFC、ADR）卻要在 Confluence 上發布，那一定
有人在手動重排版。這很慢，而且會引入錯誤——標題變成加粗文字，表格變成空格分隔的欄。

先機械轉換、再手工修幾個巨集，比重新打一遍快得多。

試試 [Markdown 轉 Confluence](/zh-tw/markdown-to-confluence/)：左邊貼上，右邊複製
wiki 標記。
