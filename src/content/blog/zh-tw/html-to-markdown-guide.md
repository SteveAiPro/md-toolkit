---
title: "HTML 轉 Markdown：為什麼反方向比較難"
description: "HTML 是把排版烤進去的樹狀結構，Markdown 只是個小子集。哪些東西撐得過這趟旅程，哪些會悄悄被改壞。"
pubDate: 2026-08-24
tags: ['markdown', 'html', 'converter', 'technical']
lang: zh-tw
group: html-to-markdown-guide
tools: ['html-to-markdown']
---

Markdown 轉 HTML 幾乎無損。HTML 轉 Markdown 不是，而且永遠不會是。

原因是結構性的：HTML 能表達的東西遠比 Markdown 多。巢狀的 `<div>`、行內 `style`、
任意屬性、橫跨欄位的儲存格——Markdown 都沒有對應概念。轉換器必須決定要**丟掉什麼**，
而每一個決定都是一次取捨。

## 大家都在用的套件

標準答案是 `turndown`，表格和刪除線再加 `turndown-plugin-gfm`：

```javascript
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const td = new TurndownService({
  headingStyle: 'atx',        // 用 # 而非底線
  codeBlockStyle: 'fenced',   // 用 ``` 而非縮排
  bulletListMarker: '-',      // 用 - 而非 *
});

td.use(gfm);
const markdown = td.turndown(html);
```

這三個選項比看起來重要。預設會產出 `setext` 標題（`Title` 下面畫 `===`）、縮排程式碼
區塊、`*` 項目符號——全都合法，但移植性都比替代方案差。

## 能乾淨保留的

| HTML | Markdown | 備註 |
| --- | --- | --- |
| `<h1>`–`<h6>` | `#`–`######` | 採 `atx` 風格時 |
| `<strong>`, `<b>` | `**粗體**` | |
| `<em>`, `<i>` | `*斜體*` | |
| `<a href>` | `[文字](url)` | 相對網址原樣保留 |
| `<img>` | `![alt](src)` | `alt` 變成替代文字 |
| `<ul>`, `<ol>` | `-` / `1.` | 巢狀會保留 |
| `<blockquote>` | `>` | |
| `<pre><code>` | 圍欄區塊 | 語言從 `class` 推測 |
| `<table>` | GFM 表格 | 需要外掛，且要有 `<th>` |

## 留不住的

**任何排版性質的東西。** `<div>`、`<span>`、行內 `style`、`class`——全部消失。這正是
Markdown 的本意，但如果你原本依賴自訂版面，就沒了。

**合併儲存格。** `colspan` 和 `rowspan` 在 Markdown 裡沒有對應表示。常見結果是合併格的
內容落到第一欄，其餘全空。有時整張表格還會塌成純文字。

**巢狀表格。** Markdown 沒這種東西，別指望它回得來。

**段落裡的 `<br>`。** Markdown 的換行是行尾兩個空格，而幾乎每個編輯器存檔時都會把它
刪掉。務實的解法是保留 `<br>` 為原始 HTML，多數渲染器都接受。

**定義清單 `<dl>`。** 沒有對應，結果是變成段落或直接消失。

**你沒要求的行內格式。** 被樣式表加上 font-weight 的 `<span>` 對 turndown 是隱形的——
它只看標籤，不看計算後的樣式。所以頁面上**看起來是粗體**的文字，出來可能是純文字。

## 逃生門：保留 HTML

遇到沒有 Markdown 對應的東西時，可以叫 turndown 別動它：

```javascript
td.keep(['details', 'summary', 'iframe']);
```

這些標籤會原樣通過。大家就是靠這招保留摺疊區塊和嵌入影片。前提是目標渲染器的
`html: true`——在會逸出原始 HTML 的平臺上，你只會看到字面的標籤文字。

## 空白的問題

這個坑能讓人耗掉一個下午。

瀏覽器把行內標籤之間的空白視為無意義，Markdown 不是。所以這段 HTML：

```html
<p>Hello <strong>world</strong>, welcome.</p>
```

可能輸出成 `Hello **world** , welcome.`——注意逗號前那個空格——取決於轉換器怎麼正規化
文字節點。解法是在轉換前先整理行內元素邊界周圍的連續空白，這也是為什麼好的轉換器會
先預處理 DOM 而不是直接處理原始字串。

同一個問題也會以巢狀清單周圍多出空行的形式出現，因為排版過的 HTML 裡 `</li>` 和
`<ul>` 之間的換行會變成文字節點。

## 真正有用的預處理

交給轉換器之前，三道處理能修好大部分真實文件：

1. **清除**雜訊：`<script>`、`<style>`、`<noscript>`、註解、追蹤像素
2. **拆開**排版用容器：沒有語意、只有單一子節點的 `<div>` 直接用該子節點取代
3. **正規化**行內元素內部與周圍的空白

做完這些，輸出改善的程度勝過在 Markdown 端做再多後處理正規表達式。事後修補壞掉的
Markdown 比事前清乾淨 HTML 困難得多，因為到那時你已經不知道哪個換行是有意義的。

## 什麼時候該停止轉換

如果是手寫的文件，轉換通常值得。如果是 Web 應用程式的渲染結果——二十層巢狀 div、
工具類 class、行內樣式——你該回頭去找原始來源。轉換器對付文件表現最好，對付機器
產生的 DOM 表現最差。

把標記貼進 [HTML 轉 Markdown](/zh-tw/html-to-markdown/)，先看過結果再決定採用。如果
輸出需要清理超過幾分鐘，那這個來源本身就是錯的起點。
