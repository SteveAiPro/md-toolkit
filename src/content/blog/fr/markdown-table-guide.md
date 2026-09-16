---
title: "Tableaux Markdown : mise en forme, alignement et conversion"
description: "Les tableaux sont la partie du Markdown la plus sujette aux erreurs. Apprenez les règles, la syntaxe d'alignement et comment déplacer des tableaux entre CSV, JSON et Word."
pubDate: 2026-02-02
tags: ['markdown', 'table', 'tutorial', 'converter']
lang: fr
group: markdown-table-guide
tools: ['csv-to-markdown-table', 'json-to-markdown-table', 'markdown-table-to-csv', 'markdown-table-to-pdf']
---

Les tableaux Markdown sont la partie de la syntaxe la plus susceptible de s'afficher silencieusement comme du texte brut. Les règles sont peu nombreuses mais strictes.

## Le tableau minimal viable

```markdown
| Column A | Column B |
| --- | --- |
| Value 1 | Value 2 |
```

Trois exigences :

1. Les caractères de barre verticale délimitent les cellules
2. **La deuxième ligne doit être le séparateur**, composé uniquement de tirets et de deux-points
3. Les barres verticales de début et de fin sont optionnelles, mais soyez cohérent

Si la ligne de séparateur manque, vous obtenez quatre lignes de texte avec des barres verticales à l'intérieur. C'est l'échec de tableau le plus courant.

## Alignement

Les deux-points dans la ligne de séparateur définissent l'alignement des colonnes :

```markdown
| Left | Center | Right |
| :--- | :----: | ----: |
| a    |   b    |     c |
```

- `:---` gauche
- `:---:` centré
- `---:` droite

Les tirets n'ont besoin d'être qu'un seul caractère : `|:-|:-:|-:|` est valide.

## Échapper les barres verticales

Une barre verticale littérale `|` à l'intérieur d'une cellule doit être échappée en `\|`, sinon elle sera analysée comme un délimiteur de cellule et décalera toutes les colonnes suivantes :

```markdown
| Expression | Meaning |
| --- | --- |
| `a \| b` | Bitwise OR |
```

Cela surprend ceux qui rédigent de la documentation pour les commandes shell et les expressions régulières, qui utilisent tous deux abondamment les barres verticales.

## Ce qui ne fonctionne pas

**Les cellules fusionnées.** Le Markdown n'a aucune syntaxe pour `colspan` ou `rowspan`. Vous ne pouvez pas fusionner de cellules, point final. Le contournement habituel est la répétition ou un tableau HTML.

**Les cellules multi-lignes.** Une cellule ne peut pas contenir de saut de ligne dur. Si vous en avez besoin, utilisez soit un `<br>` HTML (fonctionne dans la plupart des variantes), soit restructurez le tableau.

**Les tableaux imbriqués.** Non pris en charge.

**Le contenu long.** Les tableaux ne reviennent pas à la ligne proprement. Une cellule contenant un paragraphe de texte devient illisible — utilisez plutôt une liste.

## Déplacer des tableaux entre formats

C'est là que les gens passent du vrai temps. Les trois directions courantes :

**CSV → Markdown.** La partie délicate est la détection du délimiteur et des champs entre guillemets. Une cellule CSV contenant une virgule est entourée de guillemets : `"Smith, John"`. Un `split(',')` naïf la transforme en deux colonnes. Utilisez un vrai analyseur.

**JSON → Markdown.** Les tableaux d'objets plats se mappent proprement : les clés deviennent des en-têtes, les valeurs deviennent des cellules. Les objets imbriqués ne se mappent pas du tout — vous devez d'abord les aplatir, généralement en joignant les clés avec un point (`user.name`).

**Markdown → CSV.** La lecture est l'inverse, mais vous devez ré-échapper les valeurs contenant des virgules ou des guillemets. Écrire un CSV sans stratégie d'échappement produit des fichiers qui cassent à l'ouverture dans Excel.

Les trois sont disponibles comme outils navigateur :
[CSV vers tableau Markdown](/fr/csv-to-markdown-table/),
[JSON vers tableau Markdown](/fr/json-to-markdown-table/), et
[Tableau Markdown vers CSV](/fr/markdown-table-to-csv/).

## Mettre un tableau sur le papier

Les tableaux larges sont le problème PDF classique. Un tableau de dix colonnes en A4 portrait devient illisible.

Deux options, toutes les deux une ligne de CSS :

```css
@page { size: A4 landscape; }
```

Ou réduisez la police à l'intérieur du tableau et autorisez la coupure :

```css
table { font-size: 9pt; }
tr { break-inside: avoid; }   /* ne pas couper une ligne en travers de pages */
```

[Tableau Markdown vers PDF](/fr/markdown-table-to-pdf/) applique la disposition paysage par défaut.

## Une checklist de débogage

Le tableau s'affiche comme du texte brut ? Parcourez cette liste :

1. Y a-t-il une ligne de séparateur de tirets directement sous l'en-tête ?
2. Y a-t-il une ligne vide avant et après le tableau ?
3. Chaque ligne a-t-elle le même nombre de barres verticales que l'en-tête ?
4. Les barres verticales littérales sont-elles échappées en `\|` ?
5. Votre analyseur prend-il en charge les tableaux du tout ? (Le Markdown d'origine ne le faisait pas ; CommonMark non plus — les tableaux sont une extension GFM.)
