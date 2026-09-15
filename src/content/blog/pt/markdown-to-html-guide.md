---
title: "Markdown para HTML: o que realmente acontece no meio do caminho"
description: "O pipeline do analisador, a falha de XSS que ninguém corrige e por que seu HTML bruto desaparece em silêncio."
pubDate: 2026-08-17
tags: ['markdown', 'html', 'conversor', 'tutorial']
lang: pt
group: markdown-to-html-guide
tools: ['markdown-to-html', 'markdown-editor']
---

Markdown para HTML é a conversão sobre a qual todas as outras são construídas. Word,
PDF, Confluence, reStructuredText — todos passam por Markdown → HTML → destino. Ou
seja, quando essa etapa está errada, tudo a jusante está errado também.

É também a direção mais fácil. Markdown foi projetado para virar HTML. As complicações
não estão na sintaxe, estão nas **opções**.

## O pipeline

Quatro etapas, em ordem:

1. **Analisar** o Markdown em um fluxo de tokens e depois em uma AST
2. **Renderizar** a AST em uma string HTML
3. **Sanitizar** se alguma parte da entrada não for confiável
4. **Envolver** em um documento com CSS, charset e tags de script

Quase todo bug relatado está na etapa 2 ou 3.

## As opções que mudam seu resultado

Usando `markdown-it` como exemplo, já que é o que a maioria das ferramentas usa,
inclusive esta:

```javascript
const md = new MarkdownIt({
  html: true,        // permite HTML bruto na fonte
  linkify: true,     // transforma URLs soltas em links
  typographer: true, // aspas tipográficas, travessões, reticências
  breaks: false,     // trata uma quebra de linha simples como <br>
});
```

**`html`** é a que surpreende. Em `false`, qualquer `<div>` no seu Markdown aparece
como texto literal. Em `true`, você acabou de habilitar injeção arbitrária de script —
veja abaixo.

**`breaks`** é a outra. O GitHub define como `true`, e é por isso que uma quebra de
linha simples dentro de um parágrafo vira `<br>` lá, mas não no seu editor local. Se
seu documento parece certo no GitHub e errado em todo o resto, é isso.

**`linkify`** transforma `https://example.com` em link clicável. Inofensivo, até o dia
em que você está documentando uma URL que queria mostrar como texto puro.

## A parte de segurança, que não é opcional

Se o Markdown veio de qualquer lugar que não seja o seu próprio teclado — um
comentário de usuário, a descrição de um pull request, a resposta de um modelo de
linguagem — ele não é confiável. E o Markdown tem uma saída de emergência
deliberada: **HTML bruto passa direto**.

```markdown
Olá!

<img src=x onerror="alert(document.cookie)">
```

Com `html: true`, esse `onerror` executa. Isso não é teórico; é o vetor de XSS mais
comum em sites de documentação e aplicativos de chat.

A correção é uma passada de sanitizador *depois* da renderização, nunca antes:

```javascript
import DOMPurify from 'dompurify';

const sujo = md.render(entradaDoUsuario);
const limpo = DOMPurify.sanitize(sujo);
```

Duas regras que as pessoas erram:

**Sanitize a saída, não a entrada.** Filtrar a fonte Markdown com uma lista negra de
expressões regulares não funciona — o Markdown tem uma dúzia de formas de expressar a
mesma coisa e você vai deixar uma passar. Renderize primeiro, depois sanitize o HTML.

**Não aniquile seu próprio conteúdo confiável.** O DOMPurify remove o atributo
`class` por padrão em algumas configurações, o que apagará silenciosamente a marcação
do seu destaque de sintaxe. Se você controla a fonte, pule o sanitizador em vez de
brigar com listas de permissão.

## Produzindo um arquivo independente

Um fragmento renderizado não é uma página web. Para entregar algo que alguém possa
abrir, você precisa de um documento completo:

```html
<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Meu Documento</title>
  <style>/* seu CSS */</style>
</head>
<body>
  <!-- markdown renderizado -->
</body>
</html>
```

O `<meta charset="utf-8">` não é decoração. Sem ele, um arquivo aberto do disco com
caracteres acentuados ou CJK aparece como mojibake em alguns navegadores, porque eles
adivinham a codificação — e adivinham errado.

Se o documento tem blocos de código, você também precisa inicializar o highlight.js
*depois* de a marcação estar no DOM:

```javascript
document.querySelectorAll('pre code').forEach((el) => hljs.highlightElement(el));
```

E se tiver fórmulas, o CSS do KaTeX no head. Falte qualquer um desses e você ganha
uma página quebrada de um jeito difícil de descrever num relatório de bug.

## Coisas que dão errado em silêncio

**Código indentado que você não queria escrever.** Quatro espaços no início da linha
significam "bloco de código" no Markdown original. Um parágrafo copiado e colado que
por acaso está indentado vira monoespaçado.

**Caminhos de imagem relativos.** `![diagrama](./img/diagrama.png)` funciona ao lado
do arquivo fonte e quebra no momento em que o HTML é servido de outro lugar. URLs
absolutas ou data URIs sobrevivem; caminhos relativos não.

**IDs de títulos.** A maioria dos renderizadores gera automaticamente atributos `id` a
partir do texto do título, então você pode linkar para `#instalacao`. As regras de
slug diferem entre renderizadores — espaços viram `-`, mas o tratamento de maiúsculas
e a remoção de pontuação são inconsistentes. Não fixe âncoras que você não verificou.

**A saída de emergência do HTML bruto corta dos dois lados.** Às vezes você *quer* um
`<div>` ou um bloco `<details>` no seu Markdown. Isso funciona no GitHub, e não
funcionará num renderizador com `html: false`. Verifique antes de depender disso.

## Qual saída você realmente precisa

Um fragmento para colar num CMS, uma página independente completa, ou nada disso
porque você só queria ler o documento — são trabalhos diferentes.

[Markdown para HTML](/pt/markdown-to-html/) entrega a página independente: charset,
estilo e destaque de sintaxe configurados, gerados no seu navegador. Se você só queria
ver como seu Markdown fica, o [editor Markdown](/pt/markdown-editor/) é o caminho mais
rápido.
