---
title: "Markdown vers HTML : ce qui se passe réellement entre les deux"
description: "Le pipeline de l'analyseur, la faille XSS que personne ne corrige, et pourquoi votre HTML brut disparaît silencieusement."
pubDate: 2026-08-17
tags: ['markdown', 'html', 'convertisseur', 'tutoriel']
lang: fr
group: markdown-to-html-guide
tools: ['markdown-to-html', 'markdown-editor']
---

Markdown vers HTML est la conversion sur laquelle reposent toutes les autres. Word,
PDF, Confluence, reStructuredText — tous passent par Markdown → HTML → cible. Donc
quand cette étape est fausse, tout ce qui suit l'est aussi.

C'est aussi la direction la plus simple. Markdown a été conçu pour devenir du HTML.
Les complications ne viennent pas de la syntaxe, elles viennent des **options**.

## Le pipeline

Quatre étapes, dans l'ordre :

1. **Analyser** le Markdown en flux de jetons, puis en AST
2. **Rendre** l'AST en chaîne HTML
3. **Nettoyer** si une partie de l'entrée n'est pas fiable
4. **Envelopper** dans un document avec CSS, jeu de caractères et balises de script

Presque tous les bugs signalés se trouvent à l'étape 2 ou 3.

## Les options qui changent le résultat

Prenons `markdown-it` en exemple, puisque c'est ce que la plupart des outils
utilisent, y compris celui-ci :

```javascript
const md = new MarkdownIt({
  html: true,        // autoriser le HTML brut dans la source
  linkify: true,     // transformer les URL nues en liens
  typographer: true, // guillemets typographiques, tirets cadratins, points de suspension
  breaks: false,     // traiter un simple retour à la ligne comme <br>
});
```

**`html`** est celle qui surprend. À `false`, tout `<div>` de votre Markdown
apparaît comme du texte littéral. À `true`, vous venez d'autoriser l'injection
arbitrinaire de scripts — voir ci-dessous.

**`breaks`** est l'autre. GitHub le règle à `true`, ce qui explique qu'un simple
retour à la ligne dans un paragraphe devienne un saut de ligne là-bas mais pas dans
votre éditeur local. Si votre document a l'air correct sur GitHub et faux partout
ailleurs, c'est pour ça.

**`linkify`** transforme `https://example.com` en lien cliquable. Anodin, jusqu'au
jour où vous documentez une URL que vous vouliez afficher en texte brut.

## La partie sécurité, qui n'est pas facultative

Si le Markdown vient d'ailleurs que de votre propre clavier — un commentaire
d'utilisateur, la description d'une pull request, la réponse d'un modèle de langage —
il n'est pas fiable. Et Markdown possède une échappatoire délibérée : **le HTML brut
passe tout droit**.

```markdown
Bonjour !

<img src=x onerror="alert(document.cookie)">
```

Avec `html: true`, ce `onerror` s'exécute. Ce n'est pas théorique : c'est le vecteur
XSS le plus courant sur les sites de documentation et les messageries.

La correction tient en un passage de nettoyeur *après* le rendu, jamais avant :

```javascript
import DOMPurify from 'dompurify';

const sale = md.render(saisieUtilisateur);
const propre = DOMPurify.sanitize(sale);
```

Deux règles que les gens appliquent mal :

**Nettoyez la sortie, pas l'entrée.** Filtrer la source Markdown avec une liste noire
d'expressions rationnelles ne marche pas — Markdown a une douzaine de façons
d'exprimer la même chose et vous en oublierez une. Rendez d'abord, nettoyez ensuite.

**Ne réduisez pas à néant votre propre contenu de confiance.** DOMPurify supprime
l'attribut `class` par défaut dans certaines configurations, ce qui effacera
silencieusement votre coloration syntaxique. Si vous contrôlez la source, sautez
carrément le nettoyeur plutôt que de batailler avec des listes d'autorisation.

## Produire un fichier autonome

Un fragment rendu n'est pas une page web. Pour livrer quelque chose d'ouvrable, il
faut un document complet :

```html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mon document</title>
  <style>/* votre CSS */</style>
</head>
<body>
  <!-- markdown rendu -->
</body>
</html>
```

Le `<meta charset="utf-8">` n'est pas décoratif. Sans lui, un fichier ouvert depuis
le disque avec des caractères accentués ou CJK s'affiche en mojibake dans certains
navigateurs, parce qu'ils devinent l'encodage — et se trompent.

Si le document contient des blocs de code, il faut aussi initialiser highlight.js
*après* l'insertion du balisage dans le DOM :

```javascript
document.querySelectorAll('pre code').forEach((el) => hljs.highlightElement(el));
```

Et s'il contient des formules, le CSS de KaTeX dans l'en-tête. Oubliez un de ces
éléments et vous obtenez une page cassée d'une manière difficile à décrire dans un
rapport de bug.

## Ce qui se passe mal en silence

**Du code indenté que vous n'avez pas voulu écrire.** Quatre espaces en début de
ligne signifient « bloc de code » dans le Markdown d'origine. Un paragraphe
copié-collé qui se trouve être indenté se transforme en monospace.

**Les chemins d'images relatifs.** `![schéma](./img/schema.png)` fonctionne à côté du
fichier source et casse dès que le HTML est servi depuis ailleurs. Les URL absolues
ou les URI de données survivent ; les chemins relatifs non.

**Les identifiants de titres.** La plupart des moteurs génèrent automatiquement des
attributs `id` à partir du texte des titres, ce qui permet de lier vers
`#installation`. Les règles de transformation diffèrent selon les moteurs : les
espaces deviennent des tirets, mais le traitement des majuscules et la suppression de
la ponctuation sont incohérents. Ne codez pas en dur des ancres que vous n'avez pas
vérifiées.

**L'échappatoire du HTML brut coupe dans les deux sens.** Parfois vous *voulez* un
`<div>` ou un bloc `<details>` dans votre Markdown. Ça marche sur GitHub, et ça ne
marchera pas dans un moteur réglé sur `html: false`. Vérifiez avant d'en dépendre.

## Quelle sortie vous faut-il vraiment

Un fragment à coller dans un CMS, une page autonome complète, ou rien du tout parce
que vous vouliez simplement lire le document — ce sont trois tâches différentes.

[Markdown vers HTML](/fr/markdown-to-html/) vous donne la page autonome : jeu de
caractères, style et coloration câblés, générés dans votre navigateur. Si vous
vouliez seulement voir à quoi ressemble votre Markdown, l'[éditeur
Markdown](/fr/markdown-editor/) est plus rapide.
