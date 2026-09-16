---
title: "HTML zu Markdown: Warum die umgekehrte Richtung schwerer ist"
description: "HTML ist ein Baum mit eingebauter Präsentation. Markdown ist eine kleine Teilmenge. Hier überlebt die Reise und was sich still und heimlich verformt."
pubDate: 2026-08-24
tags: ['markdown', 'html', 'converter', 'technical']
lang: de
group: html-to-markdown-guide
tools: ['html-to-markdown']
---

Markdown zu HTML ist nahezu verlustfrei. HTML zu Markdown ist es nicht, und wird es auch nie sein.

Der Grund ist strukturell: HTML kann viel mehr ausdrücken, als Markdown kann. Verschachtelte `<div>`s, Inline-Stile, beliebige Attribute, Tabellenzellen, die sich über Spalten erstrecken — dafür gibt es kein Markdown-Äquivalent. Ein Konverter muss entscheiden, was er *wegwirft*, und jede dieser Entscheidungen ist eine Ermessensfrage.

## Die Bibliothek, die alle nutzen

`turndown` ist der Standard, plus `turndown-plugin-gfm` für Tabellen und Durchstreichen:

```javascript
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const td = new TurndownService({
  headingStyle: 'atx',        // # statt unterstrichen
  codeBlockStyle: 'fenced',   // ``` statt Einrückung
  bulletListMarker: '-',      // - statt *
});

td.use(gfm);
const markdown = td.turndown(html);
```

Diese drei Optionen sind wichtiger, als sie aussehen. Die Standardwerte erzeugen `setext`-Überschriften (`Title` unterstrichen mit `===`), eingerückte Codeblöcke und `*`-Aufzählungspunkte — alles gültig, alles weniger portabel als die Alternativen.

## Was sauber überlebt

| HTML | Markdown | Notes |
| --- | --- | --- |
| `<h1>`–`<h6>` | `#`–`######` | Mit `atx`-Stil |
| `<strong>`, `<b>` | `**bold**` | |
| `<em>`, `<i>` | `*italic*` | |
| `<a href>` | `[text](url)` | Relative URLs werden durchgereicht |
| `<img>` | `![alt](src)` | `alt` wird zum Alternativtext |
| `<ul>`, `<ol>` | `-` / `1.` | Verschachtelung erhalten |
| `<blockquote>` | `>` | |
| `<pre><code>` | Eingerahmter Block | Sprache aus `class` erraten |
| `<table>` | GFM-Tabelle | Braucht das Plugin, und `<th>` |

## Was nicht klappt

**Alles Präsentationale.** `<div>`, `<span>`, Inline-`style`, `class` — alles weg. Das ist der Sinn von Markdown, aber wenn Sie sich auf ein eigenes Layout verlassen haben, verlieren Sie es.

**Zusammengeführte Zellen.** `colspan` und `rowspan` haben keine Markdown-Darstellung. Das übliche Ergebnis ist eine Tabelle, in der der Inhalt der zusammengeführten Zelle in der ersten Spalte landet und der Rest leer ist. Manchmal bricht die ganze Tabelle zu Klartext zusammen.

**Verschachtelte Tabellen.** Gibt es in Markdown nicht. Erwarten Sie nicht, sie zurückzubekommen.

**`<br>` innerhalb eines Absatzes.** Markdown-Zeilenumbruch sind zwei nachgestellte Leerzeichen, die fast jeder Editor beim Speichern entfernt. Die pragmatische Antwort ist, das `<br>` als rohes HTML zu lassen, was die meisten Renderer akzeptieren.

**Definitionslisten, `<dl>`.** Keine Abbildung. Sie werden entweder zu Absätzen oder zu nichts.

**Inline-Formatierung, die Sie nicht verlangt haben.** Ein `<span>` mit einer font-weight aus einem Stylesheet ist für turndown unsichtbar — es schaut nur auf Tags, nicht auf berechnete Stile. Also kann Text, der auf der Seite *fett aussah*, als einfach herauskommen.

## Der Ausweg: das HTML behalten

Wenn etwas kein Markdown-Äquivalent hat, können Sie turndown anweisen, es in Ruhe zu lassen:

```javascript
td.keep(['details', 'summary', 'iframe']);
```

Die Tags werden unverändert durchgereicht. So behalten Menschen einklappbare Abschnitte und eingebettete Videos. Das funktioniert, solange der Ziel-Renderer `html: true` hat — auf einer Plattform, die rohes HTML escaped, erhalten Sie literalen Tag-Text.

## Das Leerzeichen-Problem

Das kostet die Leute einen Nachmittag.

Browser behandeln Leerzeichen zwischen Inline-Tags als unwesentlich. Markdown nicht. Also dieses HTML:

```html
<p>Hello <strong>world</strong>, welcome.</p>
```

kann als `Hello **world** , welcome.` herauskommen — beachten Sie das Leerzeichen vor dem Komma — abhängig davon, wie der Konverter Textknoten normalisiert. Die Lösung ist, Läufe von Leerzeichen um Inline-Elementgrenzen herum vor der Umwandlung zu kürzen, weshalb gute Konverter den DOM vorverarbeiten, statt mit dem rohen String zu arbeiten.

Dasselbe Problem zeigt sich als fingierte Leerzeilen um verschachtelte Listen herum, weil die Zeilenumbrüche zwischen `</li>` und `<ul>` in hübsch gedrucktem HTML zu Textknoten werden.

## Vorverarbeitung, die wirklich hilft

Bevor Sie HTML an einen Konverter übergeben, beheben drei Durchläufe die meisten Dokumente aus der Praxis:

1. **Entfernen** Sie das Rauschen: `<script>`, `<style>`, `<noscript>`, Kommentare, Tracking-Pixel
2. **Auspacken** präsentationaler Hüllen: Ein `<div>` ohne semantische Bedeutung und mit einem einzigen Kind lässt sich durch dieses Kind ersetzen.
3. **Normalisieren** Sie Leerzeichen innerhalb und um Inline-Elemente herum.

Machen Sie das, und die Ausgabe verbessert sich mehr als durch jede Nachbearbeitung mit Regex auf der Markdown-Seite. Kaputtes Markdown im Nachhinein zu reparieren ist viel schwerer als zuerst das HTML zu säubern, weil Sie dann nicht mehr wissen, welcher Zeilenumbruch bedeutungsvoll war.

## Wann Sie aufhören sollten zu konvertieren

Wenn das HTML ein von Hand geschriebenes Dokument ist, lohnt sich die Konvertierung meist. Wenn es die gerenderte Ausgabe einer Web-App ist — zwanzig verschachtelte divs, Utility-Klassen, Inline-Stile — sind Sie besser beraten, zur Quelle zurückzukehren. Konverter geben ihr Bestes bei Dokumenten und ihr Schlechtestes bei maschinell erzeugtem DOM.

Fügen Sie Ihr Markup in [HTML zu Markdown](/de/html-to-markdown/) ein und lesen Sie das Ergebnis, bevor Sie sich darauf verlassen. Wenn die Ausgabe mehr als ein paar Minuten Aufräumen braucht, war die Quelle der falsche Ausgangspunkt.
