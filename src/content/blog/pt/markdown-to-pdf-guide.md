---
title: "Markdown para PDF: por que a impressão do navegador vence o html2pdf.js"
description: "A abordagem padrão transforma seu documento em bitmap. Existe um caminho melhor que mantém o texto selecionável e a paginação correta."
pubDate: 2026-01-25
tags: ['markdown', 'pdf', 'browser-print', 'frontend', 'technical']
lang: pt
group: markdown-to-pdf-guide
tools: ['markdown-to-pdf', 'markdown-table-to-pdf']
---

Se você buscar "converter HTML para PDF em JavaScript", vai cair no `html2pdf.js`,
que reúne jsPDF e html2canvas. Funciona, e é a ferramenta errada para documentos.
Eis por quê, e o que fazer em vez disso.

## O problema da rasterização

O `html2canvas` não tira uma captura de tela da sua página. Ele percorre o DOM, lê os
estilos computados e redesenha cada elemento num `<canvas>` usando comandos de
desenho. O jsPDF então embute esse canvas como um único bitmap dentro do PDF.

As consequências:

- **O texto não é texto.** São pixels. Não dá para selecionar, buscar ou copiar.
- **Os links morrem.** Um hiperlink vira pixels coloridos.
- **O tamanho do arquivo explode.** Um documento de dez páginas são dez imagens de
  página inteira.
- **A paginação é chute.** O jsPDF decide onde cortar com base em cálculos de altura
  em pixels — é por isso que seus blocos de código saem cortados ao meio.
- **Documentos longos quebram.** Um canvas tem dimensão máxima (cerca de 16384 px no
  Chrome). Passe disso e você ganha uma página em branco.

Para uma fatura de uma página, aceitável. Para um documento de trinta páginas, nada
disso é tolerável.

## A alternativa: deixe o navegador fazer

Todo navegador já traz um gerador de PDF de alta qualidade: o motor de impressão. Ele
produz saída vetorial, cuida da paginação nativamente e tem duas décadas de ajustes.

A abordagem:

1. Renderize o Markdown em HTML num iframe oculto
2. Aplique uma folha de estilo `@media print` dentro desse iframe
3. Chame `contentWindow.print()`
4. A caixa de diálogo de impressão oferece "Salvar como PDF"

Você ganha texto selecionável, links ativos, paginação correta e um arquivo bem menor.

## O CSS que controla a paginação

Esta é a parte que importa. A paginação não se configura em JavaScript, ela se
expressa em CSS:

```css
@page {
  margin: 18mm 16mm;
}

h1, h2, h3, h4 {
  break-after: avoid;   /* nunca deixe um título órfão no rodapé */
}

pre, table, img, figure {
  break-inside: avoid;  /* nunca divida um bloco de código entre páginas */
}

p {
  orphans: 3;           /* pelo menos 3 linhas no fim da página */
  widows: 3;            /* pelo menos 3 linhas no topo da próxima */
}
```

O `break-inside: avoid` em `pre` sozinho resolve a reclamação mais comum sobre PDFs
gerados.

## Quando não dá para usar a impressão

Dois casos em que você precisa de uma biblioteca PDF de verdade:

**Nenhuma interação do usuário permitida.** `window.print()` abre uma caixa de
diálogo. Se você gera PDFs numa tarefa em segundo plano ou num script Node, precisa de
`pdf-lib` ou Puppeteer.

**Saída idêntica byte a byte exigida.** As configurações da caixa de impressão
(margens, cabeçalhos, escala) pertencem ao navegador do usuário. Você não as controla
totalmente. Se é um documento jurídico que precisa ser idêntico em todo lugar, faça o
render no servidor.

Para todo o resto — um documento para mandar por e-mail, uma especificação para
compartilhar — a impressão é melhor.

## Dicas práticas

**Defina o título do documento antes de imprimir.** A maioria dos navegadores tira o
nome do arquivo PDF do `<title>`. Preencha a partir do seu H1 e o download ganha um
nome decente em vez de `document.pdf`.

**Espere as imagens.** Se seu Markdown referencia imagens remotas, elas podem não ter
carregado quando `print()` dispara. Espere o carregamento de todas as imagens, ou use
`page.waitForLoadState` se estiver pilotando isso por um navegador headless.

**Teste em mais de um navegador.** Chrome, Firefox e Safari implementam o CSS de
impressão com pequenas diferenças. O Safari em especial é mais rígido com
`break-inside`.

**Quebras de página podem ser explícitas.** Adicione um `<div class="page-break">`
com `break-after: page` e deixe o usuário forçar uma quebra onde quiser.

Experimente [Markdown para PDF](/pt/markdown-to-pdf/) para ver a abordagem de
impressão em ação, ou [Tabela Markdown para PDF](/pt/markdown-table-to-pdf/) se você
só precisa de uma tabela no papel.
