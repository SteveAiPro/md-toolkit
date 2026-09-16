---
title: "Markdown zu PDF: Warum der Browserdruck besser ist als html2pdf.js"
description: "Der Standardansatz macht aus Ihrem Dokument ein Rasterbild. Es gibt einen besseren Weg, der Text auswählbar und die Seitenaufteilung korrekt hält."
pubDate: 2026-01-25
tags: ['markdown', 'pdf', 'browser-print', 'frontend', 'technical']
lang: de
group: markdown-to-pdf-guide
tools: ['markdown-to-pdf', 'markdown-table-to-pdf']
---

Wer nach "HTML in JavaScript nach PDF konvertieren" sucht, landet bei
`html2pdf.js`, das jsPDF und html2canvas bündelt. Es funktioniert — und es ist das
falsche Werkzeug für Dokumente. Hier ist der Grund und die bessere Alternative.

## Das Rasterungsproblem

`html2canvas` macht keinen Screenshot Ihrer Seite. Es durchläuft das DOM, liest die
berechneten Stile und zeichnet jedes Element mit Zeichenbefehlen auf ein `<canvas>`.
jsPDF bettet dieses Canvas dann als einzelnes Rasterbild in das PDF ein.

Die Folgen:

- **Text ist kein Text.** Es sind Pixel. Sie können ihn nicht auswählen, nicht
  durchsuchen, nicht kopieren.
- **Links sind tot.** Ein Hyperlink wird zu farbigen Pixeln.
- **Die Dateigröße explodiert.** Ein zehnseitiges Dokument sind zehn ganzseitige
  Bilder.
- **Die Seitenaufteilung ist Ratespielerei.** jsPDF entscheidet anhand von
  Pixelhöhen, wo geschnitten wird — deshalb werden Ihre Codeblöcke mitten
  durchgetrennt.
- **Lange Dokumente stürzen ab.** Ein Canvas hat eine Maximalgröße (etwa 16384 px in
  Chrome). Darüber hinaus erhalten Sie eine leere Seite.

Für eine einseitige Rechnung in Ordnung. Für ein dreißigseitiges Dokument ist nichts
davon akzeptabel.

## Die Alternative: den Browser machen lassen

Jeder Browser bringt bereits einen hochwertigen PDF-Generator mit: die Druck-Engine.
Sie erzeugt Vektorausgabe, behandelt Seitenaufteilung von selbst und ist seit zwei
Jahrzehnten optimiert.

Der Ansatz:

1. Markdown in einem versteckten iframe nach HTML rendern
2. In diesem iframe ein `@media print`-Stylesheet anwenden
3. `contentWindow.print()` aufrufen
4. Der Druckdialog bietet "Als PDF sichern"

Sie erhalten auswählbaren Text, funktionierende Links, korrekte Seitenaufteilung und
eine deutlich kleinere Datei.

## Das CSS, das die Seitenaufteilung steuert

Genau hierauf kommt es an. Seitenaufteilung wird nicht in JavaScript konfiguriert,
sondern in CSS ausgedrückt:

```css
@page {
  margin: 18mm 16mm;
}

h1, h2, h3, h4 {
  break-after: avoid;   /* niemals eine Überschrift allein am Seitenende */
}

pre, table, img, figure {
  break-inside: avoid;  /* niemals einen Codeblock über Seiten trennen */
}

p {
  orphans: 3;           /* mindestens 3 Zeilen am Seitenende */
  widows: 3;            /* mindestens 3 Zeilen am Anfang der nächsten */
}
```

Allein `break-inside: avoid` auf `pre` behebt die häufigste Beschwerde über erzeugte
PDFs.

## Wenn Drucken nicht möglich ist

Zwei Fälle, in denen Sie eine echte PDF-Bibliothek brauchen:

**Keine Benutzerinteraktion erlaubt.** `window.print()` öffnet einen Dialog. Wenn Sie
PDFs in einem Hintergrundjob oder einem Node-Skript erzeugen, brauchen Sie `pdf-lib`
oder Puppeteer.

**Byte-genaue Ausgabe gefordert.** Die Einstellungen des Druckdialogs (Ränder,
Kopfzeilen, Skalierung) gehören dem Browser des Nutzers. Sie können sie nicht
vollständig steuern. Wenn Sie ein rechtliches Dokument erzeugen, das überall
identisch aussehen muss, rendern Sie serverseitig.

Für alles andere — ein Dokument zum Versenden, eine Spezifikation zum Teilen — ist
Drucken besser.

## Praktische Tipps

**Setzen Sie den Dokumenttitel vor dem Drucken.** Die meisten Browser übernehmen den
PDF-Dateinamen aus `<title>`. Füllen Sie ihn aus Ihrer H1, und der Download erhält
einen sinnvollen Namen statt `document.pdf`.

**Warten Sie auf Bilder.** Wenn Ihr Markdown entfernte Bilder referenziert, sind diese
beim Aufruf von `print()` womöglich noch nicht geladen. Warten Sie, bis alle Bilder
fertig sind, oder nutzen Sie `page.waitForLoadState`, wenn Sie das aus einem
Headless-Browser steuern.

**Testen Sie in mehreren Browsern.** Chrome, Firefox und Safari setzen Druck-CSS mit
kleinen Unterschieden um. Besonders Safari ist bei `break-inside` strenger.

**Seitenumbrüche können explizit sein.** Fügen Sie ein `<div class="page-break">` mit
`break-after: page` ein, damit Nutzer selbst einen Umbruch erzwingen können.

Probieren Sie [Markdown zu PDF](/de/markdown-to-pdf/), um den Druck-Ansatz in der
Praxis zu sehen, oder [Markdown-Tabelle zu PDF](/de/markdown-table-to-pdf/), wenn Sie
nur eine Tabelle auf Papier brauchen.
