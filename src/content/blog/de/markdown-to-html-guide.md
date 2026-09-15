---
title: "Markdown zu HTML: Was dazwischen wirklich passiert"
description: "Die Parser-Pipeline, die XSS-Lücke, die niemand schließt, und warum Ihr rohes HTML stillschweigend verschwindet."
pubDate: 2026-08-17
tags: ['markdown', 'html', 'konverter', 'tutorial']
lang: de
group: markdown-to-html-guide
tools: ['markdown-to-html', 'markdown-editor']
---

Markdown zu HTML ist die Konvertierung, auf der alle anderen aufbauen. Word, PDF,
Confluence, reStructuredText — alle gehen über Markdown → HTML → Zielformat. Wenn
dieser Schritt also falsch ist, ist alles danach ebenfalls falsch.

Es ist zugleich die einfachste Richtung. Markdown wurde dafür entworfen, zu HTML zu
werden. Die Schwierigkeiten liegen nicht in der Syntax, sie liegen in den
**Optionen**.

## Die Pipeline

Vier Stufen, in dieser Reihenfolge:

1. **Parsen** des Markdowns in einen Tokenstrom und dann in einen AST
2. **Rendern** des AST zu einem HTML-String
3. **Bereinigen**, falls ein Teil der Eingabe nicht vertrauenswürdig war
4. **Verpacken** in ein Dokument mit CSS, Zeichensatz und Skript-Tags

Fast jeder gemeldete Fehler steckt in Stufe 2 oder 3.

## Die Optionen, die Ihre Ausgabe verändern

Am Beispiel von `markdown-it`, weil es die meisten Werkzeuge verwenden, dieses
eingeschlossen:

```javascript
const md = new MarkdownIt({
  html: true,        // rohes HTML in der Quelle erlauben
  linkify: true,     // nackte URLs in Links verwandeln
  typographer: true, // typografische Anführungszeichen, Gedankenstriche, Auslassungspunkte
  breaks: false,     // einzelnen Zeilenumbruch als <br> behandeln
});
```

**`html`** ist die Option, die überrascht. Auf `false` erscheint jedes `<div>` in Ihrem
Markdown als reiner Text. Auf `true` haben Sie gerade beliebige Skript-Injektion
ermöglicht — siehe unten.

**`breaks`** ist die andere. GitHub setzt sie auf `true`, weshalb ein einzelner
Zeilenumbruch innerhalb eines Absatzes dort zum Umbruch wird, lokal aber nicht. Wenn
Ihr Dokument auf GitHub richtig aussieht und überall sonst falsch, liegt es daran.

**`linkify`** macht aus `https://example.com` einen klickbaren Link. Harmlos, bis Sie
eine URL dokumentieren, die Sie als reinen Text zeigen wollten.

## Der Sicherheitsteil, der nicht optional ist

Wenn das Markdown von irgendwo anders kommt als Ihrer eigenen Tastatur — ein
Nutzerkommentar, die Beschreibung eines Pull Requests, die Antwort eines
Sprachmodells — ist es nicht vertrauenswürdig. Und Markdown hat einen bewussten
Notausgang: **rohes HTML geht ungefiltert durch**.

```markdown
Hallo!

<img src=x onerror="alert(document.cookie)">
```

Mit `html: true` läuft dieses `onerror`. Das ist nicht theoretisch; es ist der
häufigste XSS-Vektor in Dokumentationsseiten und Chat-Anwendungen.

Die Lösung ist ein einziger Bereinigungsdurchlauf *nach* dem Rendern, niemals
vorher:

```javascript
import DOMPurify from 'dompurify';

const unsauber = md.render(nutzereingabe);
const sauber = DOMPurify.sanitize(unsauber);
```

Zwei Regeln, die oft falsch angewendet werden:

**Bereinigen Sie die Ausgabe, nicht die Eingabe.** Die Markdown-Quelle mit einer
Regex-Sperrliste zu filtern funktioniert nicht — Markdown hat ein Dutzend Wege,
dasselbe auszudrücken, und Sie werden einen übersehen. Rendern Sie zuerst, dann
bereinigen Sie das HTML.

**Machen Sie Ihre eigenen vertrauenswürdigen Inhalte nicht kaputt.** DOMPurify
entfernt in manchen Konfigurationen standardmäßig das Attribut `class`, was Ihre
Syntaxhervorhebung stillschweigend löscht. Wenn Sie die Quelle kontrollieren, lassen
Sie den Bereiniger ganz weg, statt mit Erlaubnislisten zu kämpfen.

## Eine eigenständige Datei erzeugen

Ein gerendertes Fragment ist keine Webseite. Um etwas zu liefern, das jemand öffnen
kann, brauchen Sie ein vollständiges Dokument:

```html
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mein Dokument</title>
  <style>/* Ihr CSS */</style>
</head>
<body>
  <!-- gerendertes Markdown -->
</body>
</html>
```

Das `<meta charset="utf-8">` ist keine Dekoration. Ohne es erscheint eine Datei, die
von der Festplatte mit Umlauten oder CJK-Zeichen geöffnet wird, in manchen Browsern
als Buchstabensalat, weil sie die Kodierung raten — und falsch raten.

Enthält das Dokument Codeblöcke, muss highlight.js *nach* dem Einfügen der Auszeichnung
ins DOM initialisiert werden:

```javascript
document.querySelectorAll('pre code').forEach((el) => hljs.highlightElement(el));
```

Und bei Formeln das KaTeX-CSS in den head. Fehlt eines davon, erhalten Sie eine Seite,
die auf eine Weise kaputt ist, die sich in einem Fehlerbericht schwer beschreiben lässt.

## Was stillschweigend schiefgeht

**Eingerückter Code, den Sie nicht schreiben wollten.** Vier Leerzeichen am
Zeilenanfang bedeuten im ursprünglichen Markdown "Codeblock". Ein kopierter Absatz,
der zufällig eingerückt ist, wird zu Monospace.

**Relative Bildpfade.** `![diagramm](./img/diagramm.png)` funktioniert neben der
Quelldatei und bricht in dem Moment, in dem das HTML anderswo ausgeliefert wird.
Absolute URLs oder Data-URIs überleben; relative Pfade nicht.

**Überschriften-IDs.** Die meisten Renderer erzeugen `id`-Attribute automatisch aus
dem Überschriftentext, sodass Sie auf `#installation` verlinken können. Die
Slug-Regeln unterscheiden sich zwischen Renderern: Leerzeichen werden zu `-`, aber die
Behandlung von Großbuchstaben und das Entfernen von Satzzeichen sind uneinheitlich.
Hartcodieren Sie keine Anker, die Sie nicht geprüft haben.

**Der Notausgang für rohes HTML schneidet in beide Richtungen.** Manchmal *wollen* Sie
ein `<div>` oder einen `<details>`-Block im Markdown. Das funktioniert auf GitHub und
funktioniert nicht in einem Renderer mit `html: false`. Prüfen Sie es, bevor Sie sich
darauf verlassen.

## Welche Ausgabe Sie wirklich brauchen

Ein Fragment zum Einfügen in ein CMS, eine vollständige eigenständige Seite oder gar
nichts, weil Sie das Dokument nur lesen wollten — das sind verschiedene Aufgaben.

[Markdown zu HTML](/de/markdown-to-html/) liefert die eigenständige Seite:
Zeichensatz, Styling und Hervorhebung fertig verdrahtet, erzeugt in Ihrem Browser. Wenn
Sie nur sehen wollten, wie Ihr Markdown aussieht, ist der [Markdown-Editor](/de/markdown-editor/)
der schnellere Weg.
