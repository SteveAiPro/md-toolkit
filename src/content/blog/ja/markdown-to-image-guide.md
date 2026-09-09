---
title: 'Markdown を画像に変換する、しかも滲まずに'
description: 'キャンバスサイズの上限、フォント埋め込みの問題、CORS の罠——粗悪な Markdown → 画像エクスポーターを必ず壊す 3 つの要素です。'
pubDate: 2026-02-09
tags: ['markdown', 'image', 'frontend', 'technical', 'cors']
lang: ja
group: markdown-to-image-guide
tools: ['markdown-to-image', 'markdown-table-to-image']
---

Markdown の PNG が欲しい——投稿用、スライド用、README のプレビュー用。
最初に思いつくのは `html2canvas` でしょう。短い内容なら動きますが、長くなると
静かにゴミを出力します。

## 3 つの失敗パターン

### 1. キャンバスサイズの上限

ブラウザーはキャンバスサイズに制限をかけています。Chrome は 1 辺およそ 16384px、
総面積にも上限があります（約 2 億 6800 万ピクセル）。長いドキュメントは
devicePixelRatio 2 倍であっさり超えます。

超えても `toBlob()` は**エラーを出しません**。白紙の画像を返します。だから
「長い Markdown を書き出したら白い PNG になった」は極めて厄介なバグになります。
手がかりが何も出ないのです。

対策は、縦方向に分割レンダリングして最後のキャンバスに連結するか、長い
ドキュメントではピクセル比を下げることです。

### 2. フォントが消える

SVG の `foreignObject` 経由でレンダリングすると、外部フォントは読み込まれません。
SVG はシリアライズされたあと隔離されたコンテキストで再解析されるため、スタイル
シート内の `@font-face` が指す URL は決してリクエストされません。結果、フォール
バックフォントで描画されるか、CJK 文字が正方形の並びになります。

対策は、シリアライズ前にフォントを base64 の data URI としてインライン化すること
です。`html-to-image` のようなライブラリーは `embedWebFonts` ステップでこれを行い
ます。`document.styleSheets` を走査して `@font-face` を探し、フォントファイルを
取得してインライン化します。

これが**中国語・日本語・韓国語が最初に壊れる**理由でもあります。ラテン文字は
フォールバックでも文字に見えますが、CJK のフォールバックは豆腐になります。

### 3. オリジン間画像がキャンバスを汚染する

正しい CORS ヘッダー無しでオリジン間画像をキャンバスに描くと、キャンバスは汚染
されます。以降の `toBlob()` や `toDataURL()` はすべて `SecurityError` を投げます。

ページ側に回避策はありません。画像サーバーが `Access-Control-Allow-Origin` を
返す必要があります。返ってくるなら、`src` を設定する**前**に `<img>` へ
`crossOrigin="anonymous"` を設定してください。後からでは効きません。

## 実際に動く構成

`html-to-image` は DOM を再描画するのではなく、SVG の `foreignObject` を使います：

```javascript
const dataUrl = await toPng(node, {
  pixelRatio: 2,
  backgroundColor: '#ffffff',
  // @font-face を data URI として埋め込む。しないと CJK が壊れる
  embedWebFonts: true,
});
```

レンダリングをブラウザーが行うため（CSS を JS で再実装するのではないため）、
複雑なレイアウトも正しく出力されます。

## まともなファイル名を付ける

最初の H1 からファイル名を導出するのは地味ですが効く工夫で、フォルダーが
`image.png` だらけになるのを防げます：

```javascript
const h1 = node.querySelector('h1')?.textContent ?? 'document';
const slug = h1
  .toLowerCase()
  .replace(/[^\w\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .slice(0, 60);
```

## 品質に本当に効く設定

- 網膜ディスプレイには **`pixelRatio: 2`**。3 以上にするとサイズだけが膨らみ、
  見た目の改善はわずかです。
- **必ず背景色を指定する。** 背景透過の文字 PNG は背景が暗いと読めず、多くの
  ビューアーでは壊れているように見えます。
- **書き出し前に画像の読み込みを待つ。** `node.querySelectorAll('img')` を走査し、
  それぞれの `decode()` を `await` します。さもないと空の枠ばかり写ります。
- **幅は固定、高さは成り行き。** 幅を明示すれば意図した位置で折り返し、高さは
  内容に合わせて伸びます。

## 表 1 枚だけでいい場合

ドキュメント全体をレンダリングするのは重い処理です。出力が表 1 枚なら、canvas に
直接描いた方が速くて鮮明です。`ctx.measureText()` で文字幅を測り、列幅を計算し、
セルを描きます。DOM も SVG もフォント埋め込みも不要です。

これが [Markdown → 画像](/ja/markdown-to-image/)（ドキュメント全体、SVG ベース）と
[Markdown 表 → 画像](/ja/markdown-table-to-image/)（canvas 直接描画、一瞬）の違い
です。
