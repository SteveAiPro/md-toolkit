---
title: 'Markdown 表格：寫法、對齊與互相轉換'
description: '表格是 Markdown 裡最容易出錯的部分。規則、對齊語法，以及在 CSV、JSON、Word 之間搬運表格的方法。'
pubDate: 2026-02-02
tags: ['markdown', 'table', 'tutorial', 'converter']
lang: zh-tw
group: markdown-table-guide
tools: ['csv-to-markdown-table', 'json-to-markdown-table', 'markdown-table-to-csv', 'markdown-table-to-pdf']
---

Markdown 表格是整個語法裡最可能「靜默失敗」的部分——不報錯，就是轉譯成純文字。
規則不多，但很嚴格。

## 最小可用表格

```markdown
| 欄 A | 欄 B |
| --- | --- |
| 值 1 | 值 2 |
```

三個要求：

1. 用豎線分隔儲存格
2. **第二行必須是分隔行**，只能由短橫線和冒號組成
3. 首尾的豎線可選，但要保持一致

少了分隔行，你就得到四行帶豎線的純文字。這是表格失敗最常見的原因。

## 對齊

分隔行裡的冒號決定欄位對齊：

```markdown
| 靠左 | 置中 | 靠右 |
| :--- | :----: | ----: |
| a    |   b    |     c |
```

- `:---` 靠左
- `:---:` 置中
- `---:` 靠右

短橫線只要一個字元就夠：`|:-|:-:|-:|` 是合法的。

## 跳脫豎線

儲存格裡的字面豎線必須寫成 `\|`，否則會被當成儲存格分隔符，後面所有欄都會錯位：

```markdown
| 運算式 | 意義 |
| --- | --- |
| `a \| b` | 位元或 |
```

寫 shell 指令和正規表示式文件的人特別容易踩這個，這兩者都重度使用豎線。

## 什麼做不到

**合併儲存格。** Markdown 沒有 `colspan` 或 `rowspan` 的語法，完全無法合併。通常的
變通辦法是重複內容，或者直接用 HTML 表格。

**多行儲存格。** 一個儲存格裡不能有硬換行。確實需要的話，要嘛用 HTML 的 `<br>`
（大多數方言支援），要嘛重新設計表格結構。

**巢狀表格。** 不支援。

**長內容。** 表格不會優雅地換行。一個塞了一整段文字的儲存格會變得沒法讀——改用清單。

## 在格式之間搬運表格

這塊最花時間。三個常見方向：

**CSV → Markdown。** 麻煩在分隔符嗅探和帶引號的欄位。CSV 裡含逗號的儲存格會被
引號包住：`"Smith, John"`。直接用 `split(',')` 會把它拆成兩欄。必須用真正的剖析器。

**JSON → Markdown。** 扁平物件陣列對應得很乾淨：鍵變成表頭，值變成儲存格。巢狀物件
完全沒法對應——你得先把它拍平，通常用點號連接鍵（`user.name`）。

**Markdown → CSV。** 讀取是反向操作，但你需要把含逗號或引號的值重新跳脫。不做跳脫
策略就寫 CSV，產出的檔案在 Excel 裡打開會錯亂。

這三個都有現成的瀏覽器工具：
[CSV 轉 Markdown 表格](/zh-tw/csv-to-markdown-table/)、
[JSON 轉 Markdown 表格](/zh-tw/json-to-markdown-table/)、
[Markdown 表格轉 CSV](/zh-tw/markdown-table-to-csv/)。

## 把表格弄到紙上

寬表格是經典的 PDF 難題。十欄的表格放在 A4 直式上會沒法看。

兩個辦法，都是一行 CSS：

```css
@page { size: A4 landscape; }
```

或者縮小表格內的字級並允許斷行：

```css
table { font-size: 9pt; }
tr { break-inside: avoid; }   /* 不要把一列拆到兩頁 */
```

[Markdown 表格轉 PDF](/zh-tw/markdown-table-to-pdf/) 預設就用橫向版面。

## 除錯清單

表格轉譯成純文字了？按順序查：

1. 表頭正下方有沒有一行短橫線分隔行？
2. 表格前後有沒有空行？
3. 每一列的豎線數量和表頭一致嗎？
4. 字面豎線有沒有跳脫成 `\|`？
5. 你的剖析器到底支不支援表格？（最初的 Markdown 不支援，CommonMark 也不支援——
   表格是 GFM 的擴充。）
