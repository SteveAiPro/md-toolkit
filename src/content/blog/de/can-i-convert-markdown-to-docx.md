---
title: "Kann ich Markdown in DOCX umwandeln? (Und warum das Ergebnis meist falsch aussieht)"
description: "Ja — aber Word-Dokumente sind deutlich komplexer als Markdown. Hier überlebt die Reise und was nicht."
pubDate: 2026-01-18
tags: ['markdown', 'docx', 'word', 'converter', 'technical']
lang: de
group: can-i-convert-markdown-to-docx
tools: ['markdown-to-word']
---

Kurze Antwort: Ja. Längere Antwort: Ja, aber Sie müssen verstehen, was eine `.docx`-Datei eigentlich ist, damit das Ergebnis so aussieht, wie Sie es erwarten.

## Warum das schwerer ist, als es klingt

Markdown ist eine leichtgewichtige Auszeichnungssprache mit rund zwanzig Konzepten. Words `.docx`-Format ist ein OOXML-Paket — buchstäblich eine ZIP-Datei mit XML, das Stile, Nummerierungsdefinitionen, Abschnittsumbrüche, eingebettete Schriften und Zeichnungsanker beschreibt. Die beiden haben nicht dieselbe Form.

Ein Konverter übersetzt nicht das eine Format in das andere. Er *erfindet* eine große Menge Struktur, die Markdown nie hatte: Welche Schrift hat eine Überschrift? Wie viel Abstand folgt auf einen Absatz? Woher bekommt die Tabelle ihre Rahmen?

Deshalb erzeugen naive Konverter Dokumente, die technisch gesehen in Word öffnen, aber wie eine Textdatei aussehen, die sich verlaufen hat.

## Was die Umwandlung überlebt

| Markdown | In Word | Notes |
| --- | --- | --- |
| `#`–`######` | Überschriftenstile 1–6 | Nutzt Words eingebaute Stile, daher funktioniert der Navigationsbereich |
| `**bold**` / `*italic*` | Fett- / Kursiv-Läufe | Inline erhalten |
| Listen | Nummerierte / Aufzählungslisten | Verschachtelungstiefe bleibt erhalten |
| Tabellen | Echte Word-Tabellen | Kein durch Tabulatoren getrennter Text, der so tut, als wäre er eine Tabelle |
| ```` ```code``` ```` | Monospace-Absatz | Keine Syntaxfarben — Word kennt das Konzept nicht |
| Links | Hyperlink-Felder | Weiterhin klickbar |
| Bilder | Eingebettete Bilder | Siehe Warnung unten |
| `>` blockquote | Eingerückter Absatz mit linker Rahmenlinie | Näherungsweise |

## Was nicht klappt

**Syntaxhervorhebung.** Word kann farbige Token innerhalb eines Absatzes nicht darstellen, ohne den Text als einfache Läufe wegzuwerfen. Codeblöcke kommen als Monospace-Text durch. Wenn Sie farbigen Code brauchen, exportieren Sie ihn stattdessen nach HTML oder PDF.

**Mathe.** Sofern der Konverter KaTeX nicht zuerst in ein Bild rendert, kommt `$E = mc^2$` als literales Dollarzeichen an.

**Eigenes CSS.** Markdown hat keine Formatierung, aber wenn Sie aus HTML konvertieren, wird jeder `class` und jeder Inline-Stil fallengelassen. Der Konverter entscheidet über das Aussehen.

**Fußnoten und Aufgabenlisten.** Die Unterstützung variiert. Einige Konverter verwandeln `- [ ]` in ein echtes Kontrollkästchen-Feld; die meisten rendern ein literales `[ ]`.

## Zwei Probleme, die Bilder zerstören

Wenn Ihr Markdown Bilder referenziert und diese leer herauskommen, ist es eines von diesen.

**1. WebP wird von Words Bildelement nicht unterstützt.** Der OOXML-`ImageRun` akzeptiert PNG, JPEG, GIF und BMP. Geben Sie ihm einen WebP-Byte-Stream, zeigt Word eine leere Box. Die Lösung ist, das Bild auf eine Canvas zu dekodieren und vor dem Einbetten als PNG neu zu kodieren.

**2. Cross-Origin-Bilder werden verunreinigt.** Ein entferntes Bild mit `fetch()` abzurufen unterliegt CORS, und es in eine Canvas zu laden verunreinigt diese Canvas — danach wirft `toBlob()` einen Sicherheitsfehler. Der Umweg ist, es über ein `<img crossOrigin="anonymous">`-Element zu laden und *dieses* in die Canvas zu zeichnen, wodurch der fetch-Pfad ganz umgangen wird. Das funktioniert nur, wenn der entfernte Server tolerante CORS-Header sendet.

Die meisten browserbasierten Konverter handhaben keines von beiden, weshalb „meine Bilder fehlen" die häufigste Beschwerde ist.

## Lokal umwandeln oder hochladen

Es gibt ein echtes Datenschutzargument für die browserseitige Umwandlung. Jeder gehostete Konverter, der Datei-Uploads annimmt, speichert Ihr Dokument zumindest vorübergehend auf dem Server einer anderen Partei. Wenn es sich um einen Entwurf eines Vertrags oder eine unveröffentlichte Ankündigung handelt, ist das relevant.

Ein Konverter, der vollständig in Ihrem Browser läuft, sendet die Bytes nirgendwohin. Sie können das verifizieren, indem Sie die Devtools öffnen und den Netzwerk-Tab beobachten — es sollte keine POST-Anfrage geben, die Ihren Text enthält.

Probieren Sie [Markdown zu Word](/de/markdown-to-word/): Fügen Sie Ihren Text links ein, sehen Sie ihn rechts in der Vorschau, und die `.docx` wird im Browser erzeugt, wenn Sie auf Herunterladen klicken.

## Eine Checkliste vor der Umwandlung

- Bilder sind absolute URLs oder data-URIs, keine relativen Pfade
- Kein WebP, wenn es sich vermeiden lässt
- Überschriften nutzen die `#`-Syntax, nicht manuellen Fett-Druck in einer eigenen Zeile
- Tabellen haben eine `---`-Trennzeile
- Sie haben die Ausgabe einmal gelesen, bevor Sie sie an jemanden schicken
