---
title: "Markdown vers PDF : pourquoi l'impression du navigateur surpasse html2pdf.js"
description: "L'approche standard transforme votre document en image matricielle. Il existe une meilleure méthode qui garde le texte sélectionnable et la pagination correcte."
pubDate: 2026-01-25
tags: ['markdown', 'pdf', 'impression-navigateur', 'frontend', 'technique']
lang: fr
group: markdown-to-pdf-guide
tools: ['markdown-to-pdf', 'markdown-table-to-pdf']
---

Si vous cherchez « convertir du HTML en PDF en JavaScript », vous tomberez sur
`html2pdf.js`, qui regroupe jsPDF et html2canvas. Ça fonctionne, et c'est le mauvais
outil pour un document. Voici pourquoi, et quoi faire à la place.

## Le problème de la rastérisation

`html2canvas` ne fait pas une capture d'écran de votre page. Il parcourt le DOM, lit
les styles calculés et redessine chaque élément sur un `<canvas>` à l'aide de
commandes de dessin. jsPDF intègre ensuite ce canvas comme une unique image matricielle
dans le PDF.

Les conséquences :

- **Le texte n'est pas du texte.** Ce sont des pixels. Impossible de le sélectionner,
  de le chercher ou de le copier.
- **Les liens sont morts.** Un hyperlien devient des pixels colorés.
- **La taille du fichier explose.** Un document de dix pages, c'est dix images pleine
  page.
- **La pagination est approximative.** jsPDF décide où couper à partir de calculs de
  hauteur en pixels — c'est pour cela que vos blocs de code se retrouvent coupés en
  deux.
- **Les longs documents plantent.** Un canvas a une dimension maximale (environ
  16384 px sous Chrome). Au-delà, vous obtenez une page blanche.

Pour une facture d'une page, acceptable. Pour un document de trente pages, rien de
tout cela n'est tolérable.

## L'alternative : laisser le navigateur faire

Chaque navigateur embarque déjà un générateur PDF de haute qualité : le moteur
d'impression. Il produit une sortie vectorielle, gère la pagination nativement, et
vingt ans d'optimisations l'ont peaufiné.

L'approche :

1. Rendre le Markdown en HTML dans une iframe masquée
2. Appliquer une feuille de style `@media print` dans cette iframe
3. Appeler `contentWindow.print()`
4. La boîte de dialogue d'impression propose « Enregistrer au format PDF »

Vous obtenez du texte sélectionnable, des liens actifs, une pagination correcte et un
fichier plusieurs fois plus léger.

## Le CSS qui contrôle la pagination

C'est la partie qui compte. La pagination ne se configure pas en JavaScript, elle
s'exprime en CSS :

```css
@page {
  margin: 18mm 16mm;
}

h1, h2, h3, h4 {
  break-after: avoid;   /* jamais de titre orphelin en bas de page */
}

pre, table, img, figure {
  break-inside: avoid;  /* jamais de bloc de code coupé en deux */
}

p {
  orphans: 3;           /* au moins 3 lignes en bas de page */
  widows: 3;            /* au moins 3 lignes en haut de la suivante */
}
```

`break-inside: avoid` sur `pre` à lui seul règle la plainte la plus fréquente sur les
PDF générés.

## Quand l'impression n'est pas possible

Deux cas où une vraie bibliothèque PDF est nécessaire :

**Aucune interaction utilisateur autorisée.** `window.print()` ouvre une boîte de
dialogue. Si vous générez des PDF dans une tâche en arrière-plan ou un script Node,
il vous faut `pdf-lib` ou Puppeteer.

**Sortie identique au octet près exigée.** Les réglages de la boîte d'impression
(marges, en-têtes, échelle) appartiennent au navigateur de l'utilisateur. Vous ne les
contrôlez pas totalement. S'il s'agit d'un document juridique qui doit être identique
partout, faites le rendu côté serveur.

Pour tout le reste — un document à envoyer par courriel, une spécification à
partager — l'impression est meilleure.

## Conseils pratiques

**Définissez le titre du document avant d'imprimer.** La plupart des navigateurs
tirent le nom du fichier PDF de `<title>`. Remplissez-le à partir de votre H1 et le
téléchargement recevra un nom sensé au lieu de `document.pdf`.

**Attendez les images.** Si votre Markdown référence des images distantes, elles
peuvent ne pas être chargées au moment où `print()` est appelé. Attendez la fin du
chargement de toutes les images, ou utilisez `page.waitForLoadState` si vous pilotez
cela depuis un navigateur sans interface.

**Testez dans plusieurs navigateurs.** Chrome, Firefox et Safari implémentent le CSS
d'impression avec de légères différences. Safari est en particulier plus strict sur
`break-inside`.

**Les sauts de page peuvent être explicites.** Ajoutez un `<div class="page-break">`
avec `break-after: page` pour laisser l'utilisateur forcer un saut où il le souhaite.

Essayez [Markdown vers PDF](/fr/markdown-to-pdf/) pour voir l'approche par impression
en action, ou [Tableau Markdown vers PDF](/fr/markdown-table-to-pdf/) si vous n'avez
besoin que d'un tableau sur papier.
