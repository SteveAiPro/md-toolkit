---
title: "Du Markdown au balisage wiki de Confluence"
description: "Confluence ne parle pas Markdown. Voici la correspondance entre les deux syntaxes, ainsi que les macros nécessaires pour le code et les tableaux."
pubDate: 2026-02-16
tags: ['markdown', 'confluence', 'wiki-markup', 'converter', 'tutorial']
lang: fr
group: markdown-to-confluence-guide
tools: ['markdown-to-confluence']
---

Confluence utilise son propre balisage wiki, inventé des années avant que le Markdown ne devienne universel. Les deux se ressemblent et ne sont pas compatibles. Coller du Markdown dans une page Confluence vous donne des astérisques et des dièses littéraux.

## Correspondance de syntaxe

| Markdown | Confluence | Notes |
| --- | --- | --- |
| `# H1` | `h1. H1` | Point, puis une espace |
| `## H2` | `h2. H2` | Va jusqu'à `h6.` |
| `**bold**` | `*bold*` | Astérisque simple |
| `*italic*` | `_italic_` | Soulignement simple |
| `` `code` `` | `{{code}}` | Double accolade pour le monospace |
| ```` ```js ```` | `{code:language=js}` … `{code}` | Macro, pas un bloc délimité |
| `> quote` | `bq. quote` | Ou `{quote}` … `{quote}` |
| `- item` | `* item` | `**` pour l'imbrication |
| `1. item` | `# item` | `##` pour l'imbrication |
| `[text](url)` | `[text\|url]` | **Barre verticale, pas de parenthèse** |
| `---` | `----` | Quatre tirets |

La syntaxe des liens est celle qui piège tout le monde. Markdown utilise des parenthèses ; Confluence utilise une barre verticale.

## Blocs de code

Les blocs délimités Markdown correspondent à la macro de code, qui prend des paramètres :

```
{code:language=javascript|title=example.js|linenumbers=true}
const x = 1;
{code}
```

Si vous omettez `language`, Confluence affiche le bloc sans coloration. Si vous omettez le `{code}` de fermeture, tout ce qui suit devient du code.

Il y a un piège : si votre code contient un `{code}` littéral, il termine la macro prématurément. La plupart des convertisseurs ne l'échappent pas.

## Tableaux

La syntaxe de tableau de Confluence utilise des doubles barres verticales pour les en-têtes :

```
||Heading 1||Heading 2||
|Cell 1|Cell 2|
```

Notez que la ligne d'en-tête utilise `||` tandis que les lignes de corps utilisent une seule `|`, et contrairement au Markdown il n'y a **pas de ligne de séparateur**.

## Ce qui n'a pas d'équivalent

**Images.** Le `![alt](url)` du Markdown devient `!url!` dans Confluence, mais uniquement pour les URL attachées ou absolues. Les chemins relatifs ne sont pas résolus.

**Listes de tâches.** `- [ ]` n'a pas d'équivalent en balisage wiki. Utilisez la macro de tâche (`{task}`) ou une puce avec un caractère de case à cocher.

**Notes de bas de page, listes de définitions, HTML en ligne.** Aucune correspondance. Elles sont soit ignorées, soit arrivent comme du texte littéral.

**Mathématiques.** Confluence a besoin de la macro LaTeX. Le `$...$` brut s'affiche comme des signes dollar.

## Deux façons d'importer du contenu

**Convertir et coller.** Rendu en balisage wiki, collé dans l'éditeur. Rapide, mais vous perdez la possibilité d'un aller-retour vers le Markdown.

**Utiliser le format de stockage.** Le vrai format sous-jacent de Confluence est du XHTML (« format de stockage »), et l'API REST l'accepte. Si vous automatisez, convertir Markdown → HTML → XML de stockage Confluence est plus fiable que de viser le balisage wiki, car vous pouvez représenter les macros correctement.

## Pourquoi se donner la peine de convertir

Si votre équipe écrit en Markdown (README, RFC, ADR) et publie sur Confluence, quelqu'un reformate manuellement. C'est lent et cela introduit des erreurs — un titre devient du texte gras, un tableau devient des colonnes séparées par des espaces.

Convertir mécaniquement puis corriger à la main les quelques macros est beaucoup plus rapide que de tout retaper.

Essayez [Markdown vers Confluence](/fr/markdown-to-confluence/) — collez à gauche, copiez le balisage wiki à droite.
