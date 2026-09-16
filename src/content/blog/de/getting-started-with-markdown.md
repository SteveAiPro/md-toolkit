---
title: "Markdown für Einsteiger: Ein praktischer Leitfaden"
description: "Markdown in zehn Minuten lernen — Syntax, Tabellen, Codeblöcke und die Stolperfallen, die Anfänger eine Stunde kosten."
pubDate: 2026-01-12
tags: ['markdown', 'beginner', 'tutorial']
lang: de
group: getting-started-with-markdown
tools: ['markdown-editor', 'markdown-to-pdf', 'markdown-to-html']
---

Markdown ist ein Klartextformat, das zu strukturiertem HTML wird. Sie schreiben in
einer `.md`-Datei mit einer Handvoll Satzzeichen, und jeder Renderer macht daraus
Überschriften, Listen, Tabellen und Links.

John Gruber hat es 2004 entwickelt. Zwanzig Jahre später ist es der Standard für
READMEs, Dokumentation, Blogartikel, Chatnachrichten und LLM-Prompts. Der Grund ist
einfach: Es überlebt jedes Kopieren und Einfügen und bleibt lesbar, selbst wenn nichts
es rendert.

## Warum sich das lohnt

Drei konkrete Gründe:

1. **Es ist gut diffbar.** Ein Git-Diff auf einer Word-Datei ist nutzlos. Ein Diff auf
   Markdown zeigt Ihnen genau, welcher Satz sich geändert hat.
2. **Es ist portabel.** GitHub, Notion, ChatGPT — jede Plattform akzeptiert es.
3. **Es ist schnell.** Keine Symbolleiste, keine Maus. Ihre Hände verlassen die Tastatur
   nicht.

## Die Syntax, die Sie wirklich brauchen

Mit etwa zehn Regeln sind Sie produktiv.

### Überschriften

```markdown
# Überschrift 1
## Überschrift 2
### Überschrift 3
```

Ein `#` pro Ebene, gefolgt von einem Leerzeichen. Das Leerzeichen ist nicht optional:
`#Überschrift` wird in den meisten Parsern als reiner Text ausgegeben.

### Hervorhebungen

```markdown
*kursiv*   oder   _kursiv_
**fett**   oder   __fett__
***beides***
```

### Listen

```markdown
- Unsortierter Punkt
- Weiterer Punkt
  - Eingerückt (zwei Leerzeichen vor dem Bindestrich)

1. Sortierter Punkt
2. Zweiter Punkt
```

Die Verschachtelung hängt an der Einrückung. Zwei Leerzeichen bei unsortierten, drei
bei sortierten Listen. Wer das falsch macht, erhält eine flache Liste mit merkwürdigen
Leerzeichen am Zeilenanfang.

### Links und Bilder

```markdown
[Linktext](https://example.com)
![Alternativtext](bild.png)
```

Der einzige Unterschied ist das führende `!`.

### Code

Inline-Code nutzt einfache Backticks: `` `npm install` ``.

Blöcke nutzen dreifache Backticks, und Sie sollten immer die Sprache angeben:

````markdown
```javascript
const x = 1;
```
````

Ohne Sprachangabe gibt es keine Syntaxhervorhebung.

### Tabellen

```markdown
| Funktion | Status |
| --- | --- |
| Export | Veröffentlicht |
| Import | Beta |
```

Die Zeile mit `---` ist Pflicht: Sie sagt dem Parser, welche Zeile die Kopfzeile ist.
Die Ausrichtung steuern Doppelpunkte: `:---` links, `---:` rechts, `:---:` zentriert.

## Stolperfallen, die Anfänger eine Stunde kosten

**Vor jedem Blockelement ist eine Leerzeile nötig.** Das hier wird nicht als Liste
ausgegeben:

```markdown
Etwas Text
- erster Punkt
- zweiter Punkt
```

Sie brauchen eine leere Zeile zwischen Absatz und Liste. Gleiche Regel für
Überschriften, Codeblöcke und Tabellen.

**Ein Codeblock mit vier Leerzeichen Einrückung funktioniert ebenfalls**, aber Tabs und
Leerzeichen zu mischen bricht alles. Nutzen Sie Blöcke mit dreifachen Backticks, und
das Problem tritt gar nicht erst auf.

**Nicht alle Varianten sind gleich.** CommonMark ist der Standard. GitHub Flavored
Markdown ergänzt Tabellen, Aufgabenlisten und automatische Links. Ihr Parser
unterstützt vielleicht Fußnoten oder Mathematik — oder beides nicht. Wenn etwas nicht
rendert, ist die Variante das Erste, was Sie prüfen sollten.

**Maskierung.** Um ein echtes Sternchen zu zeigen, schreiben Sie `\*`. Zeichen, die
maskiert werden müssen: `` \ `` `*` `_` `{` `}` `[` `]` `(` `)` `#` `+` `-` `.` `!`

## Wie es weitergeht

Öffnen Sie den [Markdown-Editor](/de/markdown-editor/) und fügen Sie diesen Artikel
ein — Sie sehen das Ergebnis beim Tippen entstehen.

Wenn Sie das Dokument jemandem geben müssen, der kein Markdown nutzt, wandeln Sie es
um. [Markdown zu PDF](/de/markdown-to-pdf/) bewahrt die Formatierung für den
Versand; [Markdown zu HTML](/de/markdown-to-html/) liefert eine eigenständige Seite,
die Sie überall hosten können.
