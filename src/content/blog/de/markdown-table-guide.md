---
title: "Markdown-Tabellen: Formatierung, Ausrichtung und Konvertierung"
description: "Tabellen sind der fehleranfälligste Teil von Markdown. Lernen Sie die Regeln, die Ausrichtungs-Syntax und wie Sie Tabellen zwischen CSV, JSON und Word verschieben."
pubDate: 2026-02-02
tags: ['markdown', 'table', 'tutorial', 'converter']
lang: de
group: markdown-table-guide
tools: ['csv-to-markdown-table', 'json-to-markdown-table', 'markdown-table-to-csv', 'markdown-table-to-pdf']
---

Markdown-Tabellen sind der Teil der Syntax, der am ehesten still als Klartext gerendert wird. Die Regeln sind wenige, aber streng.

## Die minimale brauchbare Tabelle

```markdown
| Column A | Column B |
| --- | --- |
| Value 1 | Value 2 |
```

Drei Voraussetzungen:

1. Pipes begrenzen Zellen
2. **Die zweite Zeile muss die Trennzeile sein**, bestehend nur aus Bindestrichen und Doppelpunkten
3. Führende und abschließende Pipes sind optional, aber seien Sie konsistent

Fehlt die Trennzeile, erhalten Sie vier Zeilen Text mit Pipes darin. Das ist der häufigste Tabellenfehler überhaupt.

## Ausrichtung

Doppelpunkte in der Trennzeile legen die Spaltenausrichtung fest:

```markdown
| Left | Center | Right |
| :--- | :----: | ----: |
| a    |   b    |     c |
```

- `:---` links
- `:---:` zentriert
- `---:` rechts

Die Bindestriche müssen nur ein Zeichen lang sein: `|:-|:-:|-:|` ist gültig.

## Pipes escapen

Ein literales `|` innerhalb einer Zelle muss als `\|` escaped werden, sonst wird es als Zellbegrenzer geparst und verschiebt jede folgende Spalte:

```markdown
| Expression | Meaning |
| --- | --- |
| `a \| b` | Bitwise OR |
```

Das beißt Menschen, die Dokumentation für Shell-Befehle und reguläre Ausdrücke schreiben, die beide Pipes stark nutzen.

## Was nicht funktioniert

**Zusammengeführte Zellen.** Markdown hat keine Syntax für `colspan` oder `rowspan`. Sie können Zellen nicht zusammenführen, Punkt. Der übliche Ausweg ist Wiederholung oder eine HTML-Tabelle.

**Zellen mit mehreren Zeilen.** Eine Zelle kann keinen harten Zeilenumbruch enthalten. Wenn Sie einen brauchen, nutzen Sie entweder ein HTML-`<br>` (funktioniert in den meisten Varianten) oder strukturieren Sie die Tabelle um.

**Verschachtelte Tabellen.** Nicht unterstützt.

**Langer Inhalt.** Tabellen brechen nicht elegant um. Eine Zelle mit einem Absatz Text wird unlesbar — nutzen Sie stattdessen eine Liste.

## Tabellen zwischen Formaten verschieben

Hier verbringen Menschen echte Zeit. Die drei üblichen Richtungen:

**CSV → Markdown.** Der knifflige Teil ist das Erkennen des Trennzeichens und das Behandeln von Feldern in Anführungszeichen. Eine CSV-Zelle mit einem Komma wird in Anführungszeichen gesetzt: `"Smith, John"`. Ein naives `split(',')` macht daraus zwei Spalten. Nutzen Sie einen echten Parser.

**JSON → Markdown.** Arrays flacher Objekte lassen sich sauber abbilden: Schlüssel werden zu Kopfzeilen, Werte zu Zellen. Verschachtelte Objekte lassen sich gar nicht abbilden — Sie müssen sie zuerst flachklopfen, meist indem Sie Schlüssel mit einem Punkt verbinden (`user.name`).

**Markdown → CSV.** Das Lesen ist umgekehrt, aber Sie müssen Werte, die Kommas oder Anführungszeichen enthalten, neu escapen. Eine CSV ohne Escaping-Strategie zu schreiben erzeugt Dateien, die in Excel beim Öffnen kaputtgehen.

Alle drei gibt es als Browser-Tools: [CSV zu Markdown-Tabelle](/de/csv-to-markdown-table/), [JSON zu Markdown-Tabelle](/de/json-to-markdown-table/) und [Markdown-Tabelle zu CSV](/de/markdown-table-to-csv/).

## Eine Tabelle auf Papier bringen

Breite Tabellen sind das klassische PDF-Problem. Eine Tabelle mit zehn Spalten im A4-Hochformat wird unlesbar.

Zwei Optionen, beide eine Zeile CSS:

```css
@page { size: A4 landscape; }
```

Oder verkleinern Sie die Schrift innerhalb der Tabelle und erlauben Sie ihr, umzubrechen:

```css
table { font-size: 9pt; }
tr { break-inside: avoid; }   /* eine Zeile nicht über Seiten hinweg teilen */
```

[Markdown-Tabelle zu PDF](/de/markdown-table-to-pdf/) wendet das Querformat standardmäßig an.

## Eine Debugging-Checkliste

Tabelle wird als Klartext gerendert? Arbeiten Sie diese Liste ab:

1. Liegt direkt unter der Kopfzeile eine Trennzeile aus Bindestrichen?
2. Ist vor und nach der Tabelle eine leere Zeile?
3. Hat jede Zeile dieselbe Anzahl Pipes wie die Kopfzeile?
4. Sind literale Pipes als `\|` escaped?
5. Unterstützt Ihr Parser überhaupt Tabellen? (Original-Markdown tat es nicht; CommonMark ebenso wenig — Tabellen sind eine GFM-Erweiterung.)
