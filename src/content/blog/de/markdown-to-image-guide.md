---
title: "Markdown in Bilder verwandeln ohne unscharfen Text"
description: "Das Canvas-Größenlimit, das Font-Einbettungsproblem und die CORS-Falle — drei Dinge, die jeden naiven Markdown-zu-Bild-Export zerstören."
pubDate: 2026-02-09
tags: ['markdown', 'image', 'frontend', 'technical', 'cors']
lang: de
group: markdown-to-image-guide
tools: ['markdown-to-image', 'markdown-table-to-image']
---

Sie wollen ein PNG Ihres Markdown — für einen Tweet, eine Folie, eine README-Vorschau. Der naheliegende Ansatz ist `html2canvas`. Es funktioniert bei kleinen Eingaben und produziert bei großen stillschweigend Müll.

## Drei Fehlermodi

### 1. Das Canvas-Größenlimit

Jeder Browser begrenzt Canvas-Abmessungen. Chrome liegt bei etwa 16384px pro Seite, und auch die Gesamtfläche ist begrenzt (rund 268 Megapixel). Ein langes Dokument bei 2x-Gerätepixelverhältnis überschreitet das leicht.

Wenn Sie es überschreiten, wirft `toBlob()` nicht. Es liefert ein leeres Bild. Das ist der Grund, warum „mein langes Markdown wird als leeres PNG exportiert" ein so verwirrender Fehler ist — es gibt keinen Fehler.

Die Lösung ist, in vertikalen Streifen zu rendern und sie auf eine finale Canvas zusammenzunähen, oder das Pixelverhältnis für lange Dokumente zu senken.

### 2. Schriften verschwinden

Wenn Sie über ein SVG-`foreignObject` rendern, werden externe Schriften nicht geladen. Das SVG wird serialisiert und in einem isolierten Kontext neu geparst, in dem die `@font-face`-Deklarationen Ihres Stylesheets auf URLs zeigen, die nie abgerufen werden. Das Ergebnis wird in einer Fallback-Schrift gerendert oder mit Kästchen dort, wo CJK-Zeichen sein sollten.

Die Lösung ist, Schriften vor dem Serialisieren als base64-data-URIs einzubetten. Bibliotheken wie `html-to-image` tun das mit einem `embedWebFonts`-Schritt, der `document.styleSheets` durchläuft, jedes `@font-face` findet, die Font-Datei holt und einbettet.

Das ist auch der Grund, warum **Chinesisch, Japanisch und Koreanisch der erste Text ist, der kaputtgeht**. Ein Latin-Fallback sieht immer noch aus wie Text; ein CJK-Fallback sieht aus wie Tofu.

### 3. Cross-Origin-Bilder verunreinigen die Canvas

Zeichnen Sie ein Cross-Origin-Bild ohne korrekte CORS-Header auf eine Canvas, wird diese verunreinigt. Jedes anschließende `toBlob()` oder `toDataURL()` wirft einen `SecurityError`.

Es gibt keinen Workaround von der Seite her — der Bildserver muss `Access-Control-Allow-Origin` senden. Tut er das, setzen Sie `crossOrigin="anonymous"` am `<img>`, bevor Sie `src` setzen. Es danach zu setzen hat keine Wirkung.

## Der Ansatz, der funktioniert

`html-to-image` nutzt SVG-`foreignObject` anstatt das DOM neu zu zeichnen:

```javascript
const dataUrl = await toPng(node, {
  pixelRatio: 2,
  backgroundColor: '#ffffff',
  // bettet @font-face als data-URIs ein, sonst bricht CJK-Text
  embedWebFonts: true,
});
```

Weil der Browser das Rendering übernimmt (statt einer JS-Neuimplementierung von CSS), kommen komplexe Layouts korrekt heraus.

## Einen sinnvollen Dateinamen bekommen

Den Dateinamen aus der ersten H1 abzuleiten ist ein nettes Detail und vermeidet einen Ordner voller `image.png`:

```javascript
const h1 = node.querySelector('h1')?.textContent ?? 'document';
const slug = h1
  .toLowerCase()
  .replace(/[^\w\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .slice(0, 60);
```

## Qualitätseinstellungen, die wichtig sind

- **`pixelRatio: 2`** für Retina. Darüber wächst die Dateigröße schnell bei geringem sichtbarem Gewinn.
- **Setzen Sie immer eine Hintergrundfarbe.** Transparente PNGs von Text sind auf dunklen Hintergründen unlesbar und sehen in den meisten Betrachtern kaputt aus.
- **Warten Sie auf Bilder vor dem Export.** Iterieren Sie über `node.querySelectorAll('img')` und warten Sie auf jedes `decode()`. Sonst erfassen Sie leere Boxen.
- **Feste Breite, automatische Höhe.** Setzen Sie eine explizite Breite, damit Text vorhersehbar umbricht; lassen Sie die Höhe dem Inhalt folgen.

## Wenn nur eine Tabelle nötig ist

Ein ganzes Dokument zu rendern ist schwer. Wenn die Ausgabe nur eine Tabelle ist, ist das direkte Zeichnen auf eine Canvas schneller und liefert ein schärferes Ergebnis — Sie messen Text mit `ctx.measureText()`, berechnen Spaltenbreiten und zeichnen Zellen. Kein DOM, kein SVG, kein Font-Einbetten.

Das ist der Unterschied zwischen [Markdown zu Bild](/de/markdown-to-image/) (ganzes Dokument, SVG-basiert) und [Markdown-Tabelle zu Bild](/de/markdown-table-to-image/) (Canvas-gezeichnet, sofort).
