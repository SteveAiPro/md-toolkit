---
title: 'Markdown 轉 PDF：為什麼用瀏覽器列印比 html2pdf.js 好'
description: '主流方案把文件點陣化成一整張圖。有個更好的辦法，文字可選、分頁正確。'
pubDate: 2026-01-25
tags: ['markdown', 'pdf', 'browser-print', 'frontend', 'technical']
lang: zh-tw
group: markdown-to-pdf-guide
tools: ['markdown-to-pdf', 'markdown-table-to-pdf']
---

搜尋「JavaScript 把 HTML 轉成 PDF」，你會找到 `html2pdf.js`，它把 jsPDF 和
html2canvas 打包在一起。它能用，但對文件來說它是錯的工具。下面說為什麼，以及該
怎麼做。

## 點陣化的問題

`html2canvas` 不是給頁面截圖。它走訪 DOM，讀取計算後的樣式，然後用繪圖指令把每個
元素重新畫到 `<canvas>` 上。jsPDF 再把這張畫布當作一整張點陣圖嵌進 PDF。

後果：

- **文字不是文字。** 是像素。沒法選取、沒法搜尋、沒法複製。
- **連結失效。** 超連結變成了帶顏色的像素。
- **體積暴漲。** 十頁文件就是十張整頁圖片。
- **分頁靠猜。** jsPDF 根據像素高度計算在哪裡切斷，所以你的程式碼區塊會被從中間劈開。
- **長文件會崩。** Canvas 有最大尺寸限制（Chrome 大約是 16384px）。超了就得到一張
  空白頁。

做一頁的發票，沒問題。做三十頁的文件，上面每一條都不可接受。

## 另一個辦法：讓瀏覽器來做

每個瀏覽器都自帶一個高品質的 PDF 產生器，就是列印引擎。它輸出向量，原生處理分頁，
而且已經被打磨了二十年。

做法：

1. 在一個隱藏的 iframe 裡把 Markdown 轉譯成 HTML
2. 在 iframe 內部套用 `@media print` 樣式表
3. 呼叫 `contentWindow.print()`
4. 使用者的列印對話框裡選「儲存為 PDF」

你得到的是可選取的文字、能點的連結、正確的分頁，以及體積只有幾分之一的檔案。

## 控制分頁的 CSS

這部分才是關鍵。分頁不是用 JavaScript 配的，是用 CSS 表達的：

```css
@page {
  margin: 18mm 16mm;
}

h1, h2, h3, h4 {
  break-after: avoid;   /* 標題不要孤零零留在頁尾 */
}

pre, table, img, figure {
  break-inside: avoid;  /* 程式碼區塊不要被拆到兩頁 */
}

p {
  orphans: 3;           /* 頁尾至少留 3 行 */
  widows: 3;            /* 頁首至少帶 3 行 */
}
```

光是給 `pre` 加 `break-inside: avoid`，就解決了產生 PDF 最高頻的那個抱怨。

## 什麼時候不能用列印

兩種情況你需要真正的 PDF 函式庫：

**不允許使用者互動。** `window.print()` 會彈對話框。如果你要在背景任務或者 Node
腳本裡產生 PDF，就得用 `pdf-lib` 或 Puppeteer。

**要求位元組級一致的輸出。** 列印對話框的設定（頁邊距、頁首頁尾、縮放）由使用者的
瀏覽器決定，你無法完全控制。如果你在做一份必須處處長得一模一樣的法律文件，那就
伺服器端轉譯。

除此之外——想寄出去的一份文件、想分享的一份規格說明——列印都更好。

## 幾個實用技巧

**列印前設定文件標題。** 大多數瀏覽器用 `<title>` 作為 PDF 檔名的種子。把它設成
從 H1 擷取的標題，下載下來就是個像樣的名字，而不是 `document.pdf`。

**等圖片載完。** 如果你的 Markdown 引用了遠端圖片，呼叫 `print()` 時它們可能還沒
載完。等所有圖片 load 完再列印；如果你用無頭瀏覽器驅動，就用
`page.waitForLoadState`。

**多瀏覽器測試。** Chrome、Firefox、Safari 對列印 CSS 的實作有小差異。Safari 在
`break-inside` 上尤其嚴格。

**需要時可以顯式分頁。** 加一個 `break-after: page` 的 `<div class="page-break">`，
讓使用者能在想要的地方強制分頁。

想看列印方案的實際效果，試試 [Markdown 轉 PDF](/zh-tw/markdown-to-pdf/)；
只需要把表格印出來的話，用 [Markdown 表格轉 PDF](/zh-tw/markdown-table-to-pdf/)。
