---
title: "Markdown → HTML：その中間で実際に起きていること"
description: "パーサーのパイプライン、誰も塞がない XSS の抜け穴、そして生の HTML が静かに消える理由。"
pubDate: 2026-08-17
tags: ['markdown', 'html', 'コンバーター', 'チュートリアル']
lang: ja
group: markdown-to-html-guide
tools: ['markdown-to-html', 'markdown-editor']
---

Markdown → HTML は、他のすべての変換がその上に築かれている変換です。Word、PDF、
Confluence、reStructuredText — すべて Markdown → HTML → 出力先 という経路を通ります。
つまり、この段階が間違っていれば、後続もすべて間違います。

同時に、最も簡単な方向でもあります。Markdown は HTML になるために設計されました。
難しさは構文ではなく、**オプション**にあります。

## パイプライン

4 つの段階を、この順に通ります。

1. Markdown をトークン列に、そして AST に**解析**する
2. AST を HTML 文字列に**描画**する
3. 入力の一部が信頼できないなら**サニタイズ**する
4. CSS、文字コード、スクリプトタグを添えて文書に**包む**

報告されるバグのほとんどは、段階 2 か 3 にあります。

## 出力を変えるオプション

例として `markdown-it` を挙げます。このツールを含む多くのツールが採用しているからです。

```javascript
const md = new MarkdownIt({
  html: true,        // ソース内の生 HTML を許可
  linkify: true,     // 裸の URL をリンクにする
  typographer: true, // スマートクォート、ダッシュ、三点リーダー
  breaks: false,     // 単一の改行を <br> として扱う
});
```

**`html`** が人を驚かせる項目です。`false` にすると、Markdown 内の `<div>` はすべて
リテラルな文字列として表示されます。`true` にすると、任意のスクリプト注入を許可した
ことになります — 後述します。

**`breaks`** がもうひとつです。GitHub はこれを `true` にしているため、段落内の単一の
改行が GitHub では改行になり、ローカルのエディターではなりません。GitHub では正しく、
他の場所ではおかしいなら、これが原因です。

**`linkify`** は `https://example.com` をクリック可能なリンクにします。害はありませんが、
プレーンテキストとして見せたい URL をドキュメントに書いているときは厄介です。

## セキュリティ — これは必須です

Markdown が自分のキーボード以外から来たもの — ユーザーコメント、プルリクエストの
説明、言語モデルの応答 — なら、それは信頼できません。そして Markdown には意図的な
抜け道があります。**生の HTML がそのまま通る**のです。

```markdown
こんにちは！

<img src=x onerror="alert(document.cookie)">
```

`html: true` なら、この `onerror` は実行されます。これは理論上の話ではありません。
ドキュメントサイトやチャットアプリで最も多い XSS の経路です。

対策は、描画**後**にサニタイザーを一度通すことです。決して前に置いてはいけません。

```javascript
import DOMPurify from 'dompurify';

const dirty = md.render(userInput);
const clean = DOMPurify.sanitize(dirty);
```

間違えやすい 2 つのルールがあります。

**入力ではなく出力をサニタイズする。** Markdown のソースを正規表現のブラックリストで
フィルタしても意味がありません。Markdown には同じことを表現する方法が十以上あり、
必ず見落とします。先に描画し、その HTML をサニタイズしてください。

**自分の信頼できるコンテンツを破壊しない。** DOMPurify は設定によっては既定で `class`
属性を削除します。シンタックスハイライトのマークアップが静かに消えます。ソースを
自分で管理しているなら、許可リストと戦うより sanitize 自体を飛ばしてください。

## 単体で開けるファイルを作る

描画された断片は Web ページではありません。誰かが開けるものを渡すには、完全な文書が
必要です。

```html
<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ドキュメント</title>
  <style>/* あなたの CSS */</style>
</head>
<body>
  <!-- 描画された Markdown -->
</body>
</html>
```

`<meta charset="utf-8">` は飾りではありません。これがないと、ディスクから開いた
ファイルの日本語やアクセント記号が一部のブラウザーで文字化けします。文字コードを
推測して、外すからです。

コードブロックを含むなら、マークアップが DOM に入った**後**に highlight.js を
初期化する必要もあります。

```javascript
document.querySelectorAll('pre code').forEach((el) => hljs.highlightElement(el));
```

数式があるなら head に KaTeX の CSS も。ひとつでも欠けると、バグ報告に書きにくい
壊れ方をしたページになります。

## 静かに壊れるもの

**書くつもりのなかったインデント付きコード。** 行頭の 4 つのスペースは、元来の
Markdown では「コードブロック」を意味します。コピペした段落がたまたまインデント
されていると、等幅文字になります。

**相対パスの画像。** `![図](./img/diagram.png)` はソースファイルの隣では動きますが、
HTML を別の場所から配信した瞬間に壊れます。絶対 URL か data URI なら生き残ります。
相対パスは残りません。

**見出しの ID。** 多くのレンダラーは見出しテキストから `id` 属性を自動生成します。
そのため `#インストール` のようにリンクできますが、スラッグの規則はレンダラーごとに
異なります。スペースは `-` になりますが、大文字の扱いや句読点の除去は一貫していません。
未検証のアンカーをハードコードしないでください。

**生 HTML の抜け道は諸刃の剣。** `<div>` や `<details>` を Markdown に入れたいことは
あります。GitHub では動きますが、`html: false` のレンダラーでは動きません。依存する
前に確認してください。

## あなたが本当に必要な出力はどれか

CMS に貼り付ける断片、完全な単体ページ、あるいは読めさえすればいいから何も不要 —
これらは別の仕事です。

[Markdown → HTML](/ja/markdown-to-html/) は単体ページを出力します。文字コード、
スタイル、ハイライトまで組み込んだ状態で、ブラウザー内で生成されます。Markdown が
どう見えるかを確認したいだけなら、[Markdown エディター](/ja/markdown-editor/) の
ほうが速いでしょう。
