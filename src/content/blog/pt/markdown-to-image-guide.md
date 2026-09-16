---
title: "Transformando Markdown em imagens sem texto embaçado"
description: "O limite de tamanho do canvas, o problema de incorporação de fontes, e a armadilha de CORS — três coisas que quebram todo exportador ingênuo de Markdown para imagem."
pubDate: 2026-02-09
tags: ['markdown', 'image', 'frontend', 'technical', 'cors']
lang: pt
group: markdown-to-image-guide
tools: ['markdown-to-image', 'markdown-table-to-image']
---

Você quer um PNG do seu Markdown — para um tweet, um slide, uma pré-via de README. A
abordagem óbvia é `html2canvas`. Funciona para entradas pequenas e silenciosamente produz
lixo para grandes.

## Três modos de falha

### 1. O limite de tamanho do canvas

Todo navegador limita as dimensões do canvas. O Chrome é de cerca de 16384px por lado, e a
área total também é limitada (em torno de 268 megapixels). Um documento longo a 2x device
pixel ratio excede isso facilmente.

Quando você excede, `toBlob()` não lança. Ele retorna uma imagem em branco. É por isso que
"meu Markdown longo exporta como um PNG vazio" é um bug tão confuso — não há erro.

O conserto é renderizar em fatias verticais e costurá-las em um canvas final, ou baixar o
pixel ratio para documentos longos.

### 2. As fontes desaparecem

Se você renderiza via SVG `foreignObject`, fontes externas não são carregadas. O SVG é
serializado e re-analisado em um contexto isolado onde as declarações `@font-face` da sua
folha de estilo apontam para URLs que nunca são buscadas. O resultado renderiza em uma fonte
de fallback, ou com caixas onde caracteres CJK deveriam estar.

O conserto é inlinear fontes como data URIs base64 antes de serializar. Bibliotecas como
`html-to-image` fazem isso com um passo `embedWebFonts` que percorre `document.styleSheets`,
encontra cada `@font-face`, busca o arquivo de fonte e o inlina.

É também por isso que **texto chinês, japonês e coreano é a primeira coisa a quebrar**. Um
fallback latino ainda parece texto; um fallback CJK parece tofu.

### 3. Imagens de origem cruzada contaminam o canvas

Desenhe uma imagem de origem cruzada em um canvas sem cabeçalhos CORS adequados e o canvas
fica contaminado. Qualquer `toBlob()` ou `toDataURL()` subsequente lança um `SecurityError`.

Não há solução alternativa do lado da página — o servidor de imagem deve enviar
`Access-Control-Allow-Origin`. Se enviar, defina `crossOrigin="anonymous"` no `<img>` antes
de definir `src`. Definir depois não tem efeito.

## A abordagem que funciona

`html-to-image` usa SVG `foreignObject` em vez de redesenhar o DOM:

```javascript
const dataUrl = await toPng(node, {
  pixelRatio: 2,
  backgroundColor: '#ffffff',
  // inlina @font-face como data URIs, caso contrário texto CJK quebra
  embedWebFonts: true,
});
```

Como o navegador faz a renderização (em vez de uma reimplementação JS do CSS), layouts
complexos saem corretos.

## Obtendo um nome de arquivo sensato

Derivar o nome do arquivo do primeiro H1 é um toque agradável e evita uma pasta cheia de
`image.png`:

```javascript
const h1 = node.querySelector('h1')?.textContent ?? 'document';
const slug = h1
  .toLowerCase()
  .replace(/[^\w\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .slice(0, 60);
```

## Configurações de qualidade que importam

- **`pixelRatio: 2`** para retina. Acima de 2, o tamanho do arquivo cresce rápido com pouco
  ganho visível.
- **Sempre defina uma cor de fundo.** PNGs transparentes de texto são ilegíveis em fundos
  escuros e parecem quebrados na maioria dos visualizadores.
- **Espere pelas imagens antes de exportar.** Percorra `node.querySelectorAll('img')` e
  aguarde cada `decode()`. Caso contrário você captura caixas vazias.
- **Largura fixa, altura automática.** Defina uma largura explícita para o texto quebrar
  previsivelmente; deixe a altura seguir o conteúdo.

## Quando uma tabela é tudo de que você precisa

Renderizar um documento inteiro é pesado. Se a saída é apenas uma tabela, desenhá-la
diretamente em um canvas é mais rápido e produz um resultado mais nítido — você mede o texto
com `ctx.measureText()`, calcula larguras de coluna e desenha células. Sem DOM, sem SVG, sem
incorporação de fonte.

É essa a diferença entre [Markdown para imagem](/pt/markdown-to-image/) (documento completo,
baseado em SVG) e [tabela Markdown para imagem](/pt/markdown-table-to-image/) (desenhada em
canvas, instantânea).
