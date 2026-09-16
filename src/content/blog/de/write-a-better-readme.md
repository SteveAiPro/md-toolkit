---
title: "Wie Sie ein README schreiben, das Menschen wirklich lesen"
description: "Die Struktur, die funktioniert, die vier Fehler, die die meisten READMEs töten, und warum Screenshots Absätze schlagen."
pubDate: 2026-09-07
tags: ['markdown', 'readme', 'beginner', 'tutorial']
lang: de
group: write-a-better-readme
tools: ['markdown-editor', 'markdown-to-image', 'markdown-to-pdf']
---

Ein README hat einen Job: einen Fremden so schnell wie möglich von „was ist das" zu „das kann ich nutzen" zu bringen. Die meisten READMEs scheitern, weil sie für den Autor geschrieben sind, nicht für den Leser.

Die gute Nachricht ist, dass das Format fast vollständig gelöst ist. Es gibt eine Struktur, die funktioniert, und vom Davonabweichen hilft selten.

## Die Struktur

Der Reihe nach, von oben nach unten:

1. **Name und Ein-Zeilen-Beschreibung.** Kein Slogan. Was macht es, wörtlich.
2. **Ein Screenshot oder ein kurzes GIF**, falls das Ding eine visuelle Ausgabe hat.
3. **Installation.** Ein Befehl, den man kopieren und einfügen kann.
4. **Nutzung.** Das kleinste Beispiel, das etwas Nützliches tut.
5. **Konfiguration / API-Referenz**, falls es eine gibt.
6. **Contributing** und **Lizenz**, unten.

Das ist alles. Beachten Sie, was nicht auf der Liste steht: ein Abschnitt zum Projektstatus, ein Philosophie-Manifest, eine Roadmap, eine Tabelle mit Badges in zwölf Reihen Tiefe.

## Die vier Fehler

**1. Kein Installationsbefehl.** Der häufigste Fehler überhaupt. Der Leser ist interessiert, scrollt auf der Suche nach dem Start, findet eine Wand aus Prosa und einen Link zu einem Wiki und geht. Setzen Sie den Befehl in einen eingerahmten Block in den ersten Bildschirm.

**2. Das Nutzungsbeispiel ist die gesamte API.** Ein README sollte das *Hello World* zeigen, nicht jede Option. Alles andere gehört in eine Docs-Seite oder eine separate Datei. Wenn Ihr Nutzungsabschnitt ein Inhaltsverzeichnis braucht, ist er zu lang für ein README.

**3. Badges als Ersatz für Inhalt.** Sechs Badges oben vermitteln „dieses Projekt wird gepflegt" und sonst nichts. Behalten Sie zwei oder drei, die wichtig sind — Build-Status und Version — und weiter.

**4. Veraltete Screenshots.** Schlimmer als gar kein Screenshot. Eine Oberfläche, die sich seit der Aufnahme des Bildes geändert hat, lässt den Leser am ganzen Dokument zweifeln. Wenn Sie sie nicht aktuell halten können, nutzen Sie stattdessen einen Codeblock.

## Details, die sich auszahlen

**Machen Sie den Kopieren-Einfügen wirklich funktionsfähig.** Hier kommt es auf Markdown-Einzelheiten an. Ein Shell-Befehl in einem eingerahmten Block mit dem Sprach-Tag:

````markdown
```bash
npm install your-package
```
````

Setzen Sie keinen `$`-Prompt an den Zeilenanfang. Er sieht authentisch aus und bricht Kopieren-Einfügen — der Leser muss jedes Mal drum herum auswählen.

**Verlinken Sie auf Abschnitte, nicht auf Dateien.** Automatisch erzeugte Überschriften-IDs erlauben es Ihnen, `siehe [Konfiguration](#configuration)` zu schreiben. Prüfen Sie den Anker; Slug-Regeln unterscheiden sich zwischen Renderern.

**Nutzen Sie Tabellen für Optionen.** Eine 20-zeilige Optionsliste in Prosa ist unlesbar. Drei Spalten — Name, Standard, Beschreibung — ist die richtige Form:

```markdown
| Option | Default | Description |
| --- | --- | --- |
| `timeout` | `5000` | Request timeout in ms |
| `retries` | `3` | Attempts before failing |
```

**Klappt den langen Schwanz ein.** Echtes `<details>` funktioniert auf GitHub:

```markdown
<details>
<summary>Full option list</summary>

...long content here...

</details>
```

Das ist rohes HTML in Markdown. Es funktioniert auf GitHub und auf modernen Static-Generatoren, und es scheitert auf Plattformen, die HTML escapen. Kennen Sie Ihr Publikum, bevor Sie sich darauf verlassen.

**Sagen Sie, was es nicht tut.** Ein kurzer Abschnitt „Nicht-Ziele" oder „Einschränkungen" erspart Ihnen Issues und dem Leser einen verschwendeten Abend. Er wird unterschätzt.

## Länge

Es gibt keine richtige Länge, aber es gibt eine richtige *Form*: Je weiter unten im Dokument, desto spezialisierter der Inhalt. Jemand sollte nach dem Nutzungsabschnitt aufhören können zu lesen und Erfolg haben.

Wenn Ihr README länger als etwa zwei Bildschirme ist, gehört der extra Inhalt wahrscheinlich nach `docs/`. Verlinken Sie von dort aus dem README, statt ihn einzubetten.

## Das README anderswo wiederverwenden

Das README ist oft der beste Marketing-Text, den Sie haben. Zwei Konvertierungen, die sich zu kennen lohnen:

**Zu einem Bild.** Ein gerendeter Screenshot des READMEs — Name, Beschreibung, Installationsbefehl und Beispiel in einem Bild — ist ein brauchbarer Social-Media-Beitrag. Über eine gewisse Länge wird das Bild unlesbar, also schneiden Sie auf den oberen Abschnitt zu. [Markdown zu Bild](/de/markdown-to-image/) rendert es als PNG.

**Zu einem PDF.** Praktisch für interne Dokumente, die an Menschen weitergegeben werden, die in Word leben, oder zum Archivieren einer Version des Dokuments neben einem Release. [Markdown zu PDF](/de/markdown-to-pdf/) nutzt die Browser-Druck-Engine, sodass Codeblöcke sauber über Seiten umbrechen, statt in der Mitte zerschnitten zu werden.

## Der Fünf-Minuten-Test

Bitten Sie jemanden, der das Projekt nie gesehen hat, Ihrem README zu folgen und Ihnen zu sagen, wo er feststeckte. Worüber er stolpert, ist das zu Fixende — und es ist fast nie das, von dem Sie dachten, es sei unklar.

Entwerfen Sie es im [Markdown-Editor](/de/markdown-editor/), damit Sie die gerenderte Struktur beim Schreiben sehen. Ein README als rohes Markdown zu lesen versteckt genau die Probleme, auf die Ihre Leser stoßen werden.
