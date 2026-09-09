---
title: '把 Markdown 轉成圖片，還不糊'
description: '畫布尺寸上限、字型嵌入問題、CORS 陷阱——這三樣能搞壞每一個粗糙的 Markdown 轉圖片匯出器。'
pubDate: 2026-02-09
tags: ['markdown', 'image', 'frontend', 'technical', 'cors']
lang: zh-tw
group: markdown-to-image-guide
tools: ['markdown-to-image', 'markdown-table-to-image']
---

你想要一張 Markdown 的 PNG——發推、做簡報、當 README 預覽。最直覺的方案是
`html2canvas`。小內容它能用，大內容它會靜默產出垃圾。

## 三種失敗方式

### 1. 畫布尺寸上限

每個瀏覽器都限制 canvas 尺寸。Chrome 每邊大約 16384px，總面積也有限制
（約 2.68 億像素）。一份長文件在 2 倍裝置像素比下輕輕鬆鬆就超了。

超了之後 `toBlob()` **不會報錯**，它回傳一張空白圖片。這就是為什麼「我的長 Markdown
匯出成了空白 PNG」是個特別讓人困惑的 bug——沒有任何錯誤提示。

解決辦法是縱向分片轉譯再拼到最終畫布上，或者對長文件降低像素比。

### 2. 字型消失

如果你透過 SVG 的 `foreignObject` 轉譯，外部字型不會被載入。SVG 被序列化後在一個
隔離情境裡重新剖析，你樣式表裡的 `@font-face` 指向的 URL 永遠不會被請求。結果就是
用後備字型轉譯，或者中日韓字元變成一堆方框。

解決辦法是在序列化之前把字型內聯成 base64 data URI。像 `html-to-image` 這類函式庫用
`embedWebFonts` 步驟做這件事：走訪 `document.styleSheets`，找出每個 `@font-face`，
把字型檔案抓下來內聯進去。

這也是為什麼**中文、日文、韓文是最先壞掉的**。拉丁字元的後備字型看起來還像文字，
CJK 的後備字型看起來就是豆腐塊。

### 3. 跨域圖片污染畫布

在沒有正確 CORS 標頭的情況下把跨域圖片畫到 canvas 上，畫布就被污染了。之後任何
`toBlob()` 或 `toDataURL()` 都會丟出 `SecurityError`。

頁面側沒有變通辦法——圖片伺服器必須發 `Access-Control-Allow-Origin`。如果它發
了，就在設定 `src` **之前**給 `<img>` 設定 `crossOrigin="anonymous"`。設定晚了沒用。

## 能跑通的方案

`html-to-image` 用 SVG `foreignObject`，而不是重繪 DOM：

```javascript
const dataUrl = await toPng(node, {
  pixelRatio: 2,
  backgroundColor: '#ffffff',
  // 把 @font-face 內聯成 data URI，否則 CJK 文字會壞
  embedWebFonts: true,
});
```

因為轉譯是瀏覽器做的（而不是用 JS 重新實作一遍 CSS），複雜版面也能正確輸出。

## 取個像樣的檔名

從第一個 H1 推導檔名是個很討巧的細節，能避免資料夾裡一堆 `image.png`：

```javascript
const h1 = node.querySelector('h1')?.textContent ?? 'document';
const slug = h1
  .toLowerCase()
  .replace(/[^\w\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .slice(0, 60);
```

## 真正影響品質的幾個設定

- **`pixelRatio: 2`** 用於視網膜螢幕。超過 2 之後體積漲得很快，觀感提升卻很小。
- **一定要設背景色。** 透明背景的文字 PNG 在深色背景下沒法看，而且在大多數檢視器裡
  看起來就是壞了。
- **匯出前等圖片載完。** 走訪 `node.querySelectorAll('img')`，逐個 `await` 它的
  `decode()`。否則你截到的是一堆空框。
- **寬度固定，高度自適應。** 顯式設定寬度讓文字如預期換行，高度交給內容撐開。

## 只需要一張表格的時候

轉譯整份文件很重。如果產出只是一張表格，直接往 canvas 上畫更快也更清晰——用
`ctx.measureText()` 量文字、算欄寬、畫儲存格。不需要 DOM，不需要 SVG，不需要字型
嵌入。

這就是 [Markdown 轉圖片](/zh-tw/markdown-to-image/)（整份文件，基於 SVG）和
[Markdown 表格轉圖片](/zh-tw/markdown-table-to-image/)（canvas 直接繪製，秒出）的差別。
