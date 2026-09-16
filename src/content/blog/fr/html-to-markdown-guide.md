---
title: "HTML vers Markdown : pourquoi le sens inverse est plus difficile"
description: "Le HTML est un arbre où la présentation est intégrée. Le Markdown est un petit sous-ensemble. Voici ce qui survit au voyage et ce qui se fait silencieusement massacrer."
pubDate: 2026-08-24
tags: ['markdown', 'html', 'converter', 'technical']
lang: fr
group: html-to-markdown-guide
tools: ['html-to-markdown']
---

Passer du Markdown au HTML est quasiment sans perte. Passer du HTML au Markdown ne l'est pas, et ne le sera jamais.

La raison est structurelle : le HTML peut exprimer bien plus que le Markdown. Des `<div>` imbriqués, des styles en ligne, des attributs arbitraires, des cellules de tableau qui s'étendent sur plusieurs colonnes — il n'y a pas d'équivalent en Markdown. Un convertisseur doit décider quoi *jeter*, et chacune de ces décisions est un arbitrage.

## La bibliothèque que tout le monde utilise

`turndown` est la référence, avec `turndown-plugin-gfm` pour les tableaux et le barré :

```javascript
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const td = new TurndownService({
  headingStyle: 'atx',        // # plutôt que souligné
  codeBlockStyle: 'fenced',   // ``` plutôt que l'indentation
  bulletListMarker: '-',      // - plutôt que *
});

td.use(gfm);
const markdown = td.turndown(html);
```

Ces trois options comptent plus qu'il n'y paraît. Les valeurs par défaut produisent des titres `setext` (`Title` souligné avec `===`), des blocs de code indentés et des puces `*` — tout est valide, tout est moins portable que les alternatives.

## Ce qui passe proprement

| HTML | Markdown | Notes |
| --- | --- | --- |
| `<h1>`–`<h6>` | `#`–`######` | Avec le style `atx` |
| `<strong>`, `<b>` | `**bold**` | |
| `<em>`, `<i>` | `*italic*` | |
| `<a href>` | `[text](url)` | Les URL relatives passent telles quelles |
| `<img>` | `![alt](src)` | `alt` devient le texte alternatif |
| `<ul>`, `<ol>` | `-` / `1.` | L'imbrication est conservée |
| `<blockquote>` | `>` | |
| `<pre><code>` | bloc délimité | Langage deviné à partir de `class` |
| `<table>` | Tableau GFM | Nécessite le plugin, et `<th>` |

## Ce qui ne passe pas

**Tout ce qui est présentationnel.** `<div>`, `<span>`, style en ligne `style`, `class` — tout disparaît. C'est tout l'intérêt du Markdown, mais si vous comptiez sur une mise en page personnalisée, vous la perdez.

**Les cellules fusionnées.** `colspan` et `rowspan` n'ont aucune représentation en Markdown. Le résultat habituel est un tableau où le contenu de la cellule fusionnée atterrit dans la première colonne et le reste est vide. Parfois tout le tableau s'effondre en texte brut.

**Les tableaux imbriqués.** N'existent pas en Markdown. N'espérez pas les récupérer.

**Le `<br>` à l'intérieur d'un paragraphe.** Le saut de ligne du Markdown est composé de deux espaces en fin de ligne, que presque tous les éditeurs suppriment à l'enregistrement. La réponse pragmatique est de laisser le `<br>` comme du HTML brut, ce que la plupart des moteurs de rendu acceptent.

**Les listes de définitions, `<dl>`.** Aucune correspondance. Elles deviennent soit des paragraphes, soit rien.

**La mise en forme en ligne que vous n'avez pas demandée.** Un `<span>` avec un font-weight issu d'une feuille de style est invisible pour turndown — il ne regarde que les balises, pas les styles calculés. Ainsi, un texte qui *avait l'air* gras sur la page peut ressortir en texte simple.

## La porte de sortie : conserver le HTML

Quand quelque chose n'a pas d'équivalent en Markdown, vous pouvez dire à turndown de le laisser tranquille :

```javascript
td.keep(['details', 'summary', 'iframe']);
```

Les balises passent telles quelles. C'est ainsi que les gens conservent les sections repliables et les vidéos intégrées. Ça fonctionne tant que le moteur de rendu cible a `html: true` — sur une plateforme qui échappe au HTML brut, vous obtenez du texte de balise littéral.

## Le problème des espaces blancs

Celui-ci coûte une après-midi à des gens.

Les navigateurs traitent les espaces blancs entre les balises en ligne comme insignifiants. Le Markdown ne le fait pas. Ainsi, ce HTML :

```html
<p>Hello <strong>world</strong>, welcome.</p>
```

peut ressortir sous la forme `Hello **world** , welcome.` — notez l'espace avant la virgule — selon la façon dont le convertisseur normalise les nœuds de texte. Le correctif consiste à tronquer les suites d'espaces blancs autour des frontières des éléments en ligne avant de convertir, ce qui explique pourquoi les bons convertisseurs pré-traitent le DOM plutôt que de travailler sur la chaîne brute.

Le même problème apparaît sous forme de lignes vides superflues autour des listes imbriquées, car les sauts de ligne entre `</li>` et `<ul>` dans un HTML « pretty-printed » deviennent des nœuds de texte.

## Un pré-traitement qui aide vraiment

Avant de confier le HTML à un convertisseur, trois passes corrigent la plupart des documents réels :

1. **Supprimer** le bruit : `<script>`, `<style>`, `<noscript>`, les commentaires, les pixels de suivi
2. **Désenvelopper** les enveloppes présentationnelles : un `<div>` sans signification sémantique et avec un seul enfant peut être remplacé par cet enfant
3. **Normaliser** les espaces blancs à l'intérieur et autour des éléments en ligne

Faites cela et la sortie s'améliore plus que n'importe quelle quantité de post-traitement par regex côté Markdown. Corriger du Markdown cassé après coup est bien plus difficile que de nettoyer le HTML d'abord, car vous ne savez plus alors quel saut de ligne était significatif.

## Quand arrêter de convertir

Si le HTML est un document écrit à la main, la conversion en vaut généralement la peine. S'il s'agit de la sortie rendue d'une application web — vingt divs imbriqués, classes utilitaires, styles en ligne — vous avez intérêt à revenir à la source. Les convertisseurs donnent le meilleur d'eux-mêmes avec des documents et le pire avec un DOM généré par machine.

Collez votre balisage dans [HTML vers Markdown](/fr/html-to-markdown/) et lisez le résultat avant de vous y engager. Si la sortie nécessite plus que quelques minutes de nettoyage, la source était le mauvais endroit pour commencer.
