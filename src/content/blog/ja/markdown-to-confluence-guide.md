---
title: 'Markdown から Confluence Wiki 記法へ'
description: 'Confluence は Markdown を解釈しません。2 つの構文の対応表と、コードや表に必要なマクロをまとめました。'
pubDate: 2026-02-16
tags: ['markdown', 'confluence', 'wiki-markup', 'converter', 'tutorial']
lang: ja
group: markdown-to-confluence-guide
tools: ['markdown-to-confluence']
---

Confluence は独自の wiki 記法を使っています。Markdown が覇権を取るよりずっと前に
作られたものです。見た目は似ていますが互換性はありません。Markdown をそのまま
Confluence のページに貼ると、アスタリスクやシャープがそのまま出てきます。

## 構文対応表

| Markdown | Confluence | 備考 |
| --- | --- | --- |
| `# 見出し` | `h1. 見出し` | ドット 1 つ＋スペース |
| `## 見出し` | `h2. 見出し` | `h6.` まで |
| `**太字**` | `*太字*` | アスタリスク 1 つ |
| `*斜体*` | `_斜体_` | アンダースコア 1 つ |
| `` `コード` `` | `{{コード}}` | 二重波括弧が等幅を意味する |
| ```` ```js ```` | `{code:language=js}` … `{code}` | フェンスではなくマクロ |
| `> 引用` | `bq. 引用` | または `{quote}` … `{quote}` |
| `- 項目` | `* 項目` | ネストは `**` |
| `1. 項目` | `# 項目` | ネストは `##` |
| `[テキスト](url)` | `[テキスト\|url]` | **丸括弧ではなく縦棒** |
| `---` | `----` | ハイフン 4 つ |

リンク構文が最大の罠です。Markdown は丸括弧、Confluence は縦棒です。

## コードブロック

Markdown のフェンスは code マクロに対応し、パラメーターを受け取ります：

```
{code:language=javascript|title=example.js|linenumbers=true}
const x = 1;
{code}
```

`language` を省くと Confluence はハイライトしません。閉じる `{code}` を省くと、
それ以降のすべてがコードになります。

罠が 1 つあります。コードの中に文字としての `{code}` が含まれていると、マクロが
そこで終わってしまいます。多くのコンバーターはこれをエスケープしません。

## 表

Confluence の表構文は、ヘッダーを二重縦棒で表します：

```
||ヘッダー 1||ヘッダー 2||
|セル 1|セル 2|
```

ヘッダー行は `||`、本文行は `|` である点に注意してください。また Markdown と違い、
**区切り行は存在しません**。

## 対応先がないもの

**画像。** Markdown の `![alt](url)` は Confluence では `!url!` になりますが、添付
ファイルか絶対 URL でしか機能しません。相対パスは解決されません。

**タスクリスト。** `- [ ]` に対応する wiki 記法はありません。task マクロ（`{task}`）
を使うか、箇条書きにチェックボックス文字を添えることになります。

**脚注・定義リスト・インライン HTML。** 対応するものがありません。捨てられるか、
文字どおりのテキストになります。

**数式。** Confluence には LaTeX マクロが必要です。`$...$` をそのまま書いても
ドル記号として表示されるだけです。

## コンテンツを入れる 2 つの方法

**変換して貼り付ける。** wiki 記法にレンダリングしてエディターに貼ります。速いですが、
もう Markdown には戻せません。

**storage 形式を使う。** Confluence の真の内部形式は XHTML（"storage format" と
呼ばれます）で、REST API が受け付けます。自動化するなら、Markdown → HTML →
Confluence storage XML と変換する方が、直接 wiki 記法を生成するより堅牢です。
マクロを正しく表現できるからです。

## これだけ手間をかける価値があるのか

チームが Markdown で書き（README・RFC・ADR）、それを Confluence に公開しているなら、
誰かが手作業で体裁を整えているはずです。遅いし、間違いも入ります。見出しが太字に
なり、表がスペース区切りの列になります。

機械的に変換してからマクロを数か所手直しする方が、最初から打ち直すよりずっと
速いのです。

[Markdown → Confluence](/ja/markdown-to-confluence/) を試してみてください。左に
貼り付け、右から wiki 記法をコピーできます。
