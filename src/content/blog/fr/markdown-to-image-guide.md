---
title: "Transformer du Markdown en images sans texte flou"
description: "La limite de taille du canvas, le problème d'intégration des polices et le piège CORS — trois choses qui cassent chaque exportateur Markdown-vers-image naïf."
pubDate: 2026-02-09
tags: ['markdown', 'image', 'frontend', 'technical', 'cors']
lang: fr
group: markdown-to-image-guide
tools: ['markdown-to-image', 'markdown-table-to-image']
---

Vous voulez un PNG de votre Markdown — pour un tweet, une diapositive, un aperçu de README. L'approche évidente est `html2canvas`. Elle fonctionne pour les petites entrées et produit silencieusement du gibier pour les grandes.

## Trois modes d'échec

### 1. La limite de taille du canvas

Chaque navigateur plafonne les dimensions du canvas. Chrome est d'environ 16384 px par côté, et la surface totale est aussi plafonnée (environ 268 mégapixels). Un document long à un ratio de pixels d'appareil de 2x dépasse facilement cette limite.

Quand vous la dépassez, `toBlob()` ne lève pas d'exception. Il renvoie une image vide. C'est pourquoi « mon long Markdown s'exporte en un PNG vide » est un bug si confus — il n'y a aucune erreur.

Le correctif consiste à rendre par tranches verticales et à les assembler sur un canvas final, ou à abaisser le ratio de pixels pour les documents longs.

### 2. Les polices disparaissent

Si vous rendez via un `foreignObject` SVG, les polices externes ne sont pas chargées. Le SVG est sérialisé puis re-parsé dans un contexte isolé où les déclarations `@font-face` de votre feuille de style pointent vers des URL qui ne sont jamais récupérées. Le résultat s'affiche dans une police de repli, ou avec des cases là où devraient être les caractères CJK.

Le correctif consiste à intégrer les polices en tant que data URI base64 avant la sérialisation. Des bibliothèques comme `html-to-image` le font avec une étape `embedWebFonts` qui parcourt `document.styleSheets`, trouve chaque `@font-face`, récupère le fichier de police et l'intègre.

C'est aussi pourquoi **le texte chinois, japonais et coréen est la première chose à casser**. Un repli Latin a encore l'air de texte ; un repli CJK a l'air de tofu.

### 3. Les images d'origine croisée souillent le canvas

Dessinez une image d'origine croisée sur un canvas sans les bons en-têtes CORS et le canvas devient souillé. Tout `toBlob()` ou `toDataURL()` ultérieur lève une `SecurityError`.

Il n'y a pas de contournement côté page — le serveur d'images doit envoyer `Access-Control-Allow-Origin`. S'il le fait, définissez `crossOrigin="anonymous"` sur l'`<img>` avant de définir `src`. Le définir après n'a aucun effet.

## L'approche qui fonctionne

`html-to-image` utilise un `foreignObject` SVG plutôt que de redessiner le DOM :

```javascript
const dataUrl = await toPng(node, {
  pixelRatio: 2,
  backgroundColor: '#ffffff',
  // intègre @font-face en data URI, sinon le texte CJK casse
  embedWebFonts: true,
});
```

Comme c'est le navigateur qui fait le rendu (plutôt qu'une réimplémentation JS de CSS), les mises en page complexes sortent correctes.

## Obtenir un nom de fichier sensé

Dériver le nom de fichier du premier H1 est une touche agréable et évite un dossier plein de `image.png` :

```javascript
const h1 = node.querySelector('h1')?.textContent ?? 'document';
const slug = h1
  .toLowerCase()
  .replace(/[^\w\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .slice(0, 60);
```

## Réglages de qualité qui comptent

- **`pixelRatio: 2`** pour la retina. Au-delà de 2, la taille du fichier grimpe vite avec peu de gain visible.
- **Définissez toujours une couleur de fond.** Les PNG transparents de texte sont illisibles sur les fonds sombres et semblent cassés dans la plupart des visionneuses.
- **Attendez les images avant d'exporter.** Bouclez sur `node.querySelectorAll('img')` et attendez chaque `decode()`. Sinon vous capturez des cases vides.
- **Largeur fixe, hauteur automatique.** Définissez une largeur explicite pour que le texte revienne à la ligne de façon prévisible ; laissez la hauteur suivre le contenu.

## Quand un tableau suffit

Rendre un document entier est lourd. Si la sortie n'est qu'un tableau, le dessiner directement sur un canvas est plus rapide et donne un résultat plus net — vous mesurez le texte avec `ctx.measureText()`, calculez les largeurs de colonnes et dessinez les cellules. Pas de DOM, pas de SVG, pas d'intégration de polices.

C'est la différence entre [Markdown vers image](/fr/markdown-to-image/) (document entier, basé sur SVG) et [Tableau Markdown vers image](/fr/markdown-table-to-image/) (dessiné sur canvas, instantané).
