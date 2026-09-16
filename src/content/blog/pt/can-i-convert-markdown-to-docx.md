---
title: "Posso converter Markdown para DOCX? (e por que quase sempre fica errado)"
description: "Sim — mas documentos do Word são muito mais complexos que o Markdown. Veja o que sobrevive à viagem e o que não sobrevive."
pubDate: 2026-01-18
tags: ['markdown', 'docx', 'word', 'converter', 'technical']
lang: pt
group: can-i-convert-markdown-to-docx
tools: ['markdown-to-word']
---

Resposta curta: sim. Resposta longa: sim, mas você precisa entender o que um arquivo
`.docx` realmente é antes que o resultado fique do jeito que você espera.

## Por que é mais difícil do que parece

Markdown é uma linguagem de marcação leve com cerca de vinte conceitos. O formato
`.docx` do Word é um pacote OOXML — literalmente um arquivo ZIP contendo XML que
descreve estilos, definições de numeração, quebras de seção, fontes incorporadas e
âncoras de desenho. Os dois não têm a mesma forma.

Um conversor não está traduzindo um formato em outro. Ele está *inventando* uma
grande quantidade de estrutura que o Markdown nunca teve: qual fonte é um título?
Quanto de espaço vem depois de um parágrafo? De onde a tabela tira suas bordas?

É por isso que conversores ingênuos produzem documentos que, tecnicamente, abrem no
Word, mas parecem um arquivo de texto que se perdeu.

## O que sobrevive à conversão

| Markdown | No Word | Observações |
| --- | --- | --- |
| `#`–`######` | Estilos Título 1–6 | Usa os estilos embutidos do Word, então o painel de navegação funciona |
| `**bold**` / `*italic*` | Trechos em negrito / itálico | Preservados inline |
| Listas | Listas numeradas / com marcadores | A profundidade de aninhamento é mantida |
| Tabelas | Tabelas reais do Word | Não é texto separado por tabuladores fingindo ser tabela |
| ```` ```code``` ```` | Parágrafo monoespaçado | Sem coloração de sintaxe — o Word não tem esse conceito |
| Links | Campos de hiperlink | Ainda clicáveis |
| Imagens | Imagens incorporadas | Veja o aviso abaixo |
| `>` blockquote | Parágrafo recuado com borda à esquerda | Aproximado |

## O que não sobrevive

**Realce de sintaxe.** O Word não consegue representar tokens coloridos dentro de um
parágrafo sem descartar o texto como trechos simples. Blocos de código chegam como
texto monoespaçado. Se você precisa de código colorido, exporte para HTML ou PDF.

**Matemática.** A menos que o conversor renderize KaTeX para uma imagem primeiro,
`$E = mc^2$` chega como cifrões literais.

**CSS personalizado.** O Markdown não tem estilização, mas se você está convertendo de
HTML, todo `class` e estilo inline é descartado. O conversor decide a aparência.

**Notas de rodapé e listas de tarefas.** O suporte varia. Alguns conversores
transformam `- [ ]` em um campo de caixa de seleção real; a maioria renderiza um
`[ ]` literal.

## Dois problemas que quebram imagens

Se o seu Markdown faz referência a imagens e elas saem em branco, é um destes.

**1. O WebP não é suportado pelo elemento de imagem do Word.** O `ImageRun` do OOXML
aceita PNG, JPEG, GIF e BMP. Entregue um fluxo de bytes WebP e o Word mostra uma caixa
vazia. O conserto é decodificar a imagem para um canvas e re-codificar como PNG antes
de incorporar.

**2. Imagens de origem cruzada são contaminadas.** Buscar uma imagem remota com
`fetch()` está sujeito a CORS, e carregá-la em um canvas contamina esse canvas — depois
disso, `toBlob()` lança um erro de segurança. A solução alternativa é carregá-la através
de um elemento `<img crossOrigin="anonymous">` e desenhar *isso* no canvas, o que
contorna o caminho fetch inteiramente. Isso só funciona se o servidor remoto enviar
cabeçalhos CORS permissivos.

A maioria dos conversores baseados em navegador não lida com nenhum dos dois, e é por
isso que "minhas imagens estão sumindo" é a queixa número um.

## Fazer localmente vs enviar

Há um argumento de privacidade real para a conversão no lado do navegador. Todo
conversor hospedado que aceita upload de arquivos está armazenando seu documento no
servidor de outra pessoa, pelo menos transitivamente. Se o documento é um rascunho de
contrato ou um anúncio não publicado, isso importa.

Um conversor que roda inteiramente no seu navegador nunca envia os bytes a lugar
nenhum. Você pode verificar isso abrindo o devtools e observando a aba de rede — não
deve haver nenhuma requisição POST contendo seu texto.

Experimente [Markdown para Word](/pt/markdown-to-word/): cole seu texto à esquerda,
visualize à direita, e o `.docx` é gerado no seu navegador quando você clica em
baixar.

## Uma checklist antes de converter

- As imagens são URLs absolutas ou data URIs, não caminhos relativos
- Sem WebP se você puder evitá-lo
- Os títulos usam a sintaxe `#`, não negrito manual em linha própria
- As tabelas têm uma linha separadora `---`
- Você leu a saída uma vez antes de enviá-la a qualquer pessoa
