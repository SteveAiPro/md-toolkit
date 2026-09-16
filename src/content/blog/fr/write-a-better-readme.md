---
title: "Comment écrire un README que les gens lisent vraiment"
description: "La structure qui fonctionne, les quatre erreurs qui tuent la plupart des README, et pourquoi les captures d'écran l'emportent sur les paragraphes."
pubDate: 2026-09-07
tags: ['markdown', 'readme', 'beginner', 'tutorial']
lang: fr
group: write-a-better-readme
tools: ['markdown-editor', 'markdown-to-image', 'markdown-to-pdf']
---

Un README a un seul travail : faire passer un inconnu de « qu'est-ce que c'est » à « je peux l'utiliser » le plus vite possible. La plupart des README échouent parce qu'ils sont écrits pour l'auteur, pas pour le lecteur.

La bonne nouvelle, c'est que le format est presque entièrement résolu. Il existe une structure qui fonctionne, et s'en écarter aide rarement.

## La structure

Dans l'ordre, de haut en bas :

1. **Nom et description en une ligne.** Pas un slogan. Ce que ça fait, littéralement.
2. **Une capture d'écran ou un court GIF**, si le truc a une sortie visuelle.
3. **Installation.** Une seule commande copiable-collable.
4. **Utilisation.** Le plus petit exemple qui fait quelque chose d'utile.
5. **Configuration / référence d'API**, s'il y en a une.
6. **Contribution** et **Licence**, en bas.

Voilà. Remarquez ce qui n'est pas dans la liste : une section état du projet, un manifeste philosophique, une feuille de route, une table de badges de douze rangées de profondeur.

## Les quatre erreurs

**1. Pas de commande d'installation.** L'échec le plus courant. Le lecteur est intéressé, fait défiler pour chercher comment démarrer, trouve un mur de prose et un lien vers un wiki, et s'en va. Mettez la commande dans un bloc délimité dans le premier écran.

**2. L'exemple d'utilisation est toute l'API.** Un README devrait montrer le *hello world*, pas chaque option. Tout le reste va dans un site de docs ou un fichier séparé. Si votre section d'utilisation a besoin d'une table des matières, elle est trop longue pour un README.

**3. Les badges comme substitut au contenu.** Six badges en haut communiquent « ce projet est maintenu » et rien d'autre. Gardez-en deux ou trois qui comptent — l'état du build et la version — et passez à la suite.

**4. Captures d'écran périmées.** Pire que pas de capture. Une interface qui a changé depuis la prise de l'image fait douter le lecteur de tout le document. Si vous ne pouvez pas les maintenir à jour, utilisez un bloc de code à la place.

## Les détails qui paient

**Faites que le copier-coller fonctionne vraiment.** C'est là que les spécificités du Markdown comptent. Une commande shell dans un bloc délimité avec le tag de langage :

````markdown
```bash
npm install your-package
```
````

Ne mettez pas de prompt `$` au début de la ligne. Ça a l'air authentique et casse le copier-coller — le lecteur doit sélectionner autour à chaque fois.

**Liez vers des sections, pas des fichiers.** Les identifiants de titre générés automatiquement vous permettent d'écrire `see [Configuration](#configuration)`. Vérifiez l'ancre ; les règles de slug diffèrent entre les moteurs de rendu.

**Utilisez des tableaux pour les options.** Une liste d'options de 20 lignes en prose est illisible. Trois colonnes — nom, défaut, description — est la bonne forme :

```markdown
| Option | Default | Description |
| --- | --- | --- |
| `timeout` | `5000` | Request timeout in ms |
| `retries` | `3` | Attempts before failing |
```

**Réduisez la longue traîne.** Le `<details>` natif fonctionne sur GitHub :

```markdown
<details>
<summary>Full option list</summary>

...long content here...

</details>
```

C'est du HTML brut dans du Markdown. Ça fonctionne sur GitHub et sur les générateurs statiques modernes, et ça échoue sur les plateformes qui échappent le HTML. Connaissez votre audience avant de compter dessus.

**Dites ce que ça ne fait pas.** Une courte section « Non-objectifs » ou « Limitations » vous évite des tickets et évite au lecteur une soirée perdue. C'est sous-estimé.

## Longueur

Il n'y a pas de longueur correcte, mais il y a une *forme* correcte : plus on descend dans le document, plus le contenu est spécialisé. Quelqu'un devrait pouvoir arrêter de lire après la section d'utilisation et réussir.

Si votre README dépasse environ deux écrans, le contenu supplémentaire appartient probablement à `docs/`. Liez-y depuis le README plutôt que de l'inclure.

## Réutiliser le README ailleurs

Le README est souvent la meilleure copie marketing que vous avez. Deux conversions utiles à connaître :

**Vers une image.** Une capture du README rendu — nom, description, commande d'installation et exemple en une seule image — est un bon post social. Au-delà d'une certaine longueur, l'image devient illisible, donc recadrez sur la section du haut. [Markdown vers image](/fr/markdown-to-image/) le rend en PNG.

**Vers un PDF.** Pratique pour les docs internes remises à des gens qui vivent dans Word, ou pour archiver une version du document à côté d'une release. [Markdown vers PDF](/fr/markdown-to-pdf/) utilise le moteur d'impression du navigateur, donc les blocs de code se coupent correctement d'une page à l'autre au lieu d'être tranchés en deux.

## Le test des cinq minutes

Demandez à quelqu'un qui n'a jamais vu le projet de suivre votre README et de vous dire où il s'est bloqué. Ce sur quoi il trébuche est la chose à corriger — et c'est presque jamais la chose que vous pensiez être floue.

Rédigez-le dans l'[éditeur Markdown](/fr/markdown-editor/) pour voir la structure rendue pendant que vous écrivez. Lire un README en Markdown brut masque exactement les problèmes que vos lecteurs rencontreront.
