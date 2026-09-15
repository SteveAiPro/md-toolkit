---
title: 'Débuter avec Markdown : le guide pratique'
description: 'Apprendre Markdown en dix minutes — syntaxe, tableaux, blocs de code et les pièges qui font perdre une heure aux débutants.'
pubDate: 2026-01-12
tags: ['markdown', 'débutant', 'tutoriel']
lang: fr
group: getting-started-with-markdown
tools: ['markdown-editor', 'markdown-to-pdf', 'markdown-to-html']
---

Markdown est un format texte brut qui se transforme en HTML structuré. Vous écrivez
dans un fichier `.md` avec une poignée de signes de ponctuation, et n'importe quel
moteur de rendu produit des titres, des listes, des tableaux et des liens.

John Gruber l'a créé en 2004. Vingt ans plus tard, c'est le format par défaut des
README, de la documentation, des articles de blog, des messageries et des prompts
pour les modèles de langage. La raison est simple : il survit à tous les
copier-coller et reste lisible même quand rien ne le rend.

## Pourquoi s'en servir

Trois raisons concrètes :

1. **Il se diffé.** Un diff Git sur un fichier Word ne sert à rien. Un diff sur du
   Markdown vous dit exactement quelle phrase a changé.
2. **Il est portable.** GitHub, Notion, ChatGPT — toutes les plateformes l'acceptent.
3. **Il est rapide.** Pas de barre d'outils, pas de souris. Vos mains ne quittent pas
   le clavier.

## La syntaxe que vous utiliserez vraiment

Une dizaine de règles suffisent pour être productif.

### Titres

```markdown
# Titre 1
## Titre 2
### Titre 3
```

Un `#` par niveau, suivi d'un espace. L'espace n'est pas facultatif : `#Titre`
s'affiche comme du texte littéral dans la plupart des analyseurs.

### Emphase

```markdown
*italique*   ou   _italique_
**gras**     ou   __gras__
***les deux***
```

### Listes

```markdown
- Élément non ordonné
- Autre élément
  - Imbriqué (deux espaces avant le tiret)

1. Élément ordonné
2. Deuxième élément
```

L'imbrication dépend de l'indentation. Deux espaces pour les listes non ordonnées,
trois pour les ordonnées. Si vous vous trompez, vous obtenez une liste plate avec
d'étranges espaces en début de ligne.

### Liens et images

```markdown
[Texte du lien](https://example.com)
![Texte alternatif](image.png)
```

La seule différence est le `!` au début.

### Code

Le code en ligne utilise des apostrophes inversées simples : `` `npm install` ``.

Les blocs utilisent des triples apostrophes inverses, et vous devriez toujours
indiquer le langage :

````markdown
```javascript
const x = 1;
```
````

Sans le nom du langage, aucune coloration syntaxique.

### Tableaux

```markdown
| Fonctionnalité | État |
| --- | --- |
| Export | Livré |
| Import | Bêta |
```

La ligne de `---` est obligatoire : elle indique à l'analyseur quelle ligne est
l'en-tête. L'alignement se contrôle avec les deux-points : `:---` à gauche, `---:` à
droite, `:---:` au centre.

## Les pièges qui coûtent une heure aux débutants

**Une ligne vide est nécessaire avant chaque élément de bloc.** Ceci ne s'affiche pas
comme une liste :

```markdown
Un peu de texte
- premier élément
- deuxième élément
```

Il faut une ligne vide entre le paragraphe et la liste. Même règle pour les titres,
les blocs de code et les tableaux.

**Indenter un bloc de code de quatre espaces fonctionne aussi**, mais mélanger
tabulations et espaces casse tout. Utilisez les blocs délimités par des triples
apostrophes et le problème disparaît.

**Toutes les variantes ne se valent pas.** CommonMark est la norme. GitHub Flavored
Markdown y ajoute les tableaux, les listes de tâches et les liens automatiques. Votre
analyseur gère peut-être les notes de bas de page, ou les formules mathématiques, ou
ni l'un ni l'autre. Si quelque chose ne s'affiche pas, la variante est la première
chose à vérifier.

**L'échappement.** Pour afficher une astérisque littérale, écrivez `\*`. Caractères à
échapper : `` \ `` `*` `_` `{` `}` `[` `]` `(` `)` `#` `+` `-` `.` `!`

## Aller plus loin

Ouvrez l'[éditeur Markdown](/fr/markdown-editor/) et collez-y cet article — vous
verrez le résultat se mettre à jour pendant que vous tapez.

Quand vous devez transmettre le document à quelqu'un qui n'utilise pas Markdown,
convertissez-le. [Markdown vers PDF](/fr/markdown-to-pdf/) conserve la mise en forme
pour le partage ; [Markdown vers HTML](/fr/markdown-to-html/) vous donne une page
autonome que vous pouvez héberger n'importe où.
