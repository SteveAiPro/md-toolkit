---
title: "Markdown 轉 HTML：中間到底發生了什麼"
description: "剖析器的管線、沒人在補的 XSS 漏洞，以及你的原始 HTML 為什麼會悄悄消失。"
pubDate: 2026-08-17
tags: ['markdown', 'html', 'converter', 'tutorial']
lang: zh-tw
group: markdown-to-html-guide
tools: ['markdown-to-html', 'markdown-editor']
---

Markdown 轉 HTML 是所有其他轉換的基礎。Word、PDF、Confluence、reStructuredText——全都
走 Markdown → HTML → 目標格式。所以這一步錯了，下游全部跟著錯。

它同時也是最簡單的方向。Markdown 天生就是要變成 HTML 的。麻煩不在語法，而在
**選項**。

## 管線

四個階段，依序進行：

1. 把 Markdown **剖析**成 token 串，再轉成 AST
2. 把 AST **渲染**成 HTML 字串
3. 若輸入來源不可信，進行**清理**
4. 用 CSS、字元集、script 標籤**包裝**成完整文件

幾乎所有被回報的 bug 都出在第 2 或第 3 階段。

## 會改變輸出的選項

以 `markdown-it` 為例，因為多數工具（包含本站）都用它：

```javascript
const md = new MarkdownIt({
  html: true,        // 允許原始碼裡的原始 HTML
  linkify: true,     // 把裸網址變成連結
  typographer: true, // 智慧引號、破折號、省略號
  breaks: false,     // 把單一換行視為 <br>
});
```

**`html`** 是最讓人意外的一個。設成 `false`，Markdown 裡的 `<div>` 全會變成字面文字。
設成 `true`，你等於開放了任意腳本注入——見下文。

**`breaks`** 是另一個。GitHub 把它設成 `true`，所以段落裡的單一換行在 GitHub 上會變成
換行，在你的本機編輯器卻不會。如果你的文件在 GitHub 上正常、到處都不對，就是這個原因。

**`linkify`** 會把 `https://example.com` 變成可點連結。無害，直到你想把某個網址當純
文字呈現為止。

## 安全性，這段不是選修

如果 Markdown 不是出於你自己的鍵盤——使用者留言、PR 描述、語言模型的回應——它就不可信。
而 Markdown 有個刻意留的後門：**原始 HTML 直接放行**。

```markdown
你好！

<img src=x onerror="alert(document.cookie)">
```

在 `html: true` 下，那個 `onerror` 會執行。這不是理論，它是文件站和聊天應用最常見的
XSS 途徑。

解法是在渲染**之後**跑一次清理，絕不是之前：

```javascript
import DOMPurify from 'dompurify';

const dirty = md.render(userInput);
const clean = DOMPurify.sanitize(dirty);
```

兩個常被搞錯的原則：

**清理輸出，不是輸入。** 用正規表達式黑名單過濾 Markdown 原始碼沒用——Markdown 有十幾種
方式表達同一件事，你一定會漏。先渲染，再清理 HTML。

**別把自己可信的內容清到面目全非。** DOMPurify 在某些設定下預設會拔掉 `class` 屬性，
你的語法突顯標記會被悄悄刪光。如果來源是你自己控管的，直接跳過清理，別去跟白名單
搏鬥。

## 產出獨立檔案

渲染出來的片段不是網頁。要交出一個能打開的東西，你需要完整文件：

```html
<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>我的文件</title>
  <style>/* 你的 CSS */</style>
</head>
<body>
  <!-- 渲染後的 Markdown -->
</body>
</html>
```

`<meta charset="utf-8">` 不是裝飾。少了它，從磁碟開啟、含有中文或重音符號的檔案在某些
瀏覽器會變亂碼，因為它們會去猜編碼——而且猜錯。

如果文件有程式碼區塊，還必須在標記進入 DOM **之後**初始化 highlight.js：

```javascript
document.querySelectorAll('pre code').forEach((el) => hljs.highlightElement(el));
```

有數學公式的話，head 還要放 KaTeX 的 CSS。漏掉任何一項，你會得到一個壞得很難在 bug
報告裡描述的頁面。

## 悄悄出錯的地方

**你沒打算寫的縮排程式碼。** 行首四個空格在原版 Markdown 裡代表「程式碼區塊」。一段
複製貼上、剛好有縮排的段落，會變成等寬字體。

**相對路徑的圖片。** `![示意圖](./img/diagram.png)` 在原始檔旁邊沒問題，但 HTML 一從
別的地方提供就壞了。絕對網址或 data URI 活得下來，相對路徑不行。

**標題 ID。** 多數渲染器會從標題文字自動產生 `id` 屬性，讓你能連到 `#安裝`。但 slug
規則各家不同：空格會變成 `-`，大寫的處理和標點的移除卻不一致。沒驗證過的錨點不要
寫死。

**原始 HTML 後門是雙面刃。** 有時候你**就是想**在 Markdown 裡放 `<div>` 或 `<details>`。
在 GitHub 上行得通，在 `html: false` 的渲染器上不行。依賴它之前先確認。

## 你到底需要哪種輸出

要貼進 CMS 的片段、完整的獨立頁面，還是根本不需要輸出因為你只是想讀一下——這是三件
不同的事。

[Markdown 轉 HTML](/zh-tw/markdown-to-html/) 給你的是獨立頁面：字元集、樣式、突顯都
接好了，在你的瀏覽器裡生成。如果你只是想看 Markdown 長什麼樣，[Markdown
編輯器](/zh-tw/markdown-editor/) 是更快的路。
