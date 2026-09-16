---
title: "Markdown zu Confluence-Wiki-Markup"
description: "Confluence spricht kein Markdown. Hier ist die Abbildung zwischen den beiden Syntaxen — plus die Makros, die Sie für Code und Tabellen brauchen."
pubDate: 2026-02-16
tags: ['markdown', 'confluence', 'wiki-markup', 'converter', 'tutorial']
lang: de
group: markdown-to-confluence-guide
tools: ['markdown-to-confluence']
---

Confluence nutzt sein eigenes Wiki-Markup, das Jahre vor der Verbreitung von Markdown entstand. Die beiden sehen ähnlich aus und sind nicht kompatibel. Markdown in eine Confluence-Seite einzufügen liefert Ihnen literale Sternchen und Rautezeichen.

## Syntax-Abbildung

| Markdown | Confluence | Notes |
| --- | --- | --- |
| `# H1` | `h1. H1` | Punkt, dann ein Leerzeichen |
| `## H2` | `h2. H2` | Geht bis `h6.` |
| `**bold**` | `*bold*` | Einzelnes Sternchen |
| `*italic*` | `_italic_` | Einzelner Unterstrich |
| `` `code` `` | `{{code}}` | Doppelte Klammern für Monospace |
| ```` ```js ```` | `{code:language=js}` … `{code}` | Makro, kein Zaun |
| `> quote` | `bq. quote` | Oder `{quote}` … `{quote}` |
| `- item` | `* item` | `**` für verschachtelt |
| `1. item` | `# item` | `##` für verschachtelt |
| `[text](url)` | `[text\|url]` | **Pipe, nicht Klammer** |
| `---` | `----` | Vier Bindestriche |

Die Link-Syntax ist die, über die alle stolpern. Markdown nutzt Klammern; Confluence nutzt eine Pipe.

## Codeblöcke

Markdown-Zäune werden auf das Code-Makro abgebildet, das Parameter annimmt:

```
{code:language=javascript|title=example.js|linenumbers=true}
const x = 1;
{code}
```

Lassen Sie `language` weg, zeigt Confluence den Block ohne Hervorhebung. Lassen Sie das schließende `{code}` weg, wird alles danach zu Code.

Es gibt eine Falle: Wenn Ihr Code ein literals `{code}` enthält, beendet es das Makro frühzeitig. Die meisten Konverter escapen das nicht.

## Tabellen

Confluence-Tabellensyntax nutzt doppelte Pipes für Kopfzeilen:

```
||Heading 1||Heading 2||
|Cell 1|Cell 2|
```

Beachten Sie, dass die Kopfzeile `||` nutzt, während Textzeilen eine einzelne `|` nutzen, und dass es anders als bei Markdown **keine Trennzeile** gibt.

## Was kein Äquivalent hat

**Bilder.** Markdowns `![alt](url)` wird in Confluence zu `!url!`, aber nur für angehängte oder absolute URLs. Relative Pfade werden nicht aufgelöst.

**Aufgabenlisten.** `- [ ]` hat kein Wiki-Markup-Äquivalent. Nutzen Sie das Aufgaben-Makro (`{task}`) oder einen Aufzählungspunkt mit einem Kontrollkästchen-Zeichen.

**Fußnoten, Definitionslisten, Inline-HTML.** Keine Abbildung. Sie werden entweder fallengelassen oder als literaler Text angeliefert.

**Mathe.** Confluence braucht das LaTeX-Makro. Rohes `$...$` wird als Dollarzeichen gerendert.

## Zwei Wege, Inhalte hineinzubekommen

**Konvertieren und einfügen.** In Wiki-Markup rendern, in den Editor einfügen. Schnell, aber Sie verlieren die Möglichkeit, zurück zu Markdown zu gelangen (Round-Trip).

**Das Storage-Format nutzen.** Confluences eigentliches zugrunde liegendes Format ist XHTML („Storage-Format"), und die REST-API akzeptiert es. Wenn Sie automatisieren, ist die Konvertierung Markdown → HTML → Confluence-Storage-XML zuverlässiger als das Abzielen auf Wiki-Markup, weil Sie Makros ordentlich darstellen können.

## Warum überhaupt konvertieren

Wenn Ihr Team in Markdown schreibt (READMEs, RFCs, ADRs) und zu Confluence veröffentlicht, formatiert das jemand von Hand neu. Das ist langsam und führt Fehler ein — eine Überschrift wird zu Fett-Text, eine Tabelle zu durch Leerzeichen getrennten Spalten.

Mechanisch zu konvertieren und dann die wenigen Makros von Hand zu fixen ist viel schneller als Neueingeben.

Probieren Sie [Markdown zu Confluence](/de/markdown-to-confluence/) — links einfügen, rechts das Wiki-Markup kopieren.
