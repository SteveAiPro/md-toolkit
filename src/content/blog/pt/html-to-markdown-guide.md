---
title: "HTML para Markdown: por que o sentido inverso é mais difícil"
description: "HTML é uma árvore com apresentação embutida. Markdown é um subconjunto pequeno. Veja o que sobrevive à viagem e o que é silenciosamente deturpado."
pubDate: 2026-08-24
tags: ['markdown', 'html', 'converter', 'technical']
lang: pt
group: html-to-markdown-guide
tools: ['html-to-markdown']
---

Markdown para HTML é quase sem perdas. HTML para Markdown não é, e nunca será.

O motivo é estrutural: o HTML pode expressar muito mais do que o Markdown. `<div>`s
aninhados, estilos inline, atributos arbitrários, células de tabela que ocupam colunas
— não existe equivalente Markdown. Um conversor tem que decidir o que *jogar fora*, e
cada uma dessas decisões é um julgamento.

## A biblioteca que todos usam

`turndown` é o padrão, mais `turndown-plugin-gfm` para tabelas e tachado:

```javascript
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const td = new TurndownService({
  headingStyle: 'atx',        // # em vez de sublinhado
  codeBlockStyle: 'fenced',   // ``` em vez de indentação
  bulletListMarker: '-',      // - em vez de *
});

td.use(gfm);
const markdown = td.turndown(html);
```

Essas três opções importam mais do que parecem. Os padrões produzem títulos `setext`
(`Title` sublinhado com `===`), blocos de código indentados, e marcadores `*` — todos
válidos, todos menos portáveis que as alternativas.

## O que sobrevive limpo

| HTML | Markdown | Observações |
| --- | --- | --- |
| `<h1>`–`<h6>` | `#`–`######` | Com estilo `atx` |
| `<strong>`, `<b>` | `**bold**` | |
| `<em>`, `<i>` | `*italic*` | |
| `<a href>` | `[text](url)` | URLs relativas passam |
| `<img>` | `![alt](src)` | `alt` vira o texto alternativo |
| `<ul>`, `<ol>` | `-` / `1.` | Aninhamento preservado |
| `<blockquote>` | `>` | |
| `<pre><code>` | bloco cercado | Linguagem adivinhada a partir de `class` |
| `<table>` | tabela GFM | Precisa do plugin, e `<th>` |

## O que não sobrevive

**Qualquer coisa apresentacional.** `<div>`, `<span>`, `style` inline, `class` — tudo
some. Esse é o ponto do Markdown, mas se você contava com um layout personalizado, vai
perdê-lo.

**Células mescladas.** `colspan` e `rowspan` não têm representação em Markdown. O
resultado usual é uma tabela onde o conteúdo da célula mesclada cai na primeira coluna e
o resto fica vazio. Às vezes a tabela inteira colapsa para texto puro.

**Tabelas aninhadas.** Não é algo do Markdown. Não espere recuperá-las.

**`<br>` dentro de um parágrafo.** A quebra de linha do Markdown são dois espaços à
direita, que quase todo editor remove ao salvar. A resposta pragmática é deixar o `<br>`
como HTML cru, que a maioria dos renderizadores aceita.

**Listas de definição, `<dl>`.** Sem mapeamento. Viram parágrafos ou nada.

**Formatação inline que você não pediu.** Um `<span>` com font-weight de uma folha de
estilo é invisível para o turndown — ele só olha as tags, não os estilos computados.
Então texto que *parecia* negrito na página pode sair puro.

## A saída de emergência: manter o HTML

Quando algo não tem equivalente Markdown, você pode dizer ao turndown para deixá-lo em
paz:

```javascript
td.keep(['details', 'summary', 'iframe']);
```

As tags passam verbatim. É assim que as pessoas mantêm seções recolhíveis e vídeos
incorporados. Funciona desde que o renderizador alvo tenha `html: true` — em uma
plataforma que escapa HTML cru, você obtém texto de tag literal.

## O problema dos espaços em branco

Este custa uma tarde às pessoas.

Navegadores tratam espaços em branco entre tags inline como insignificantes. O Markdown
não. Então este HTML:

```html
<p>Hello <strong>world</strong>, welcome.</p>
```

pode sair como `Hello **world** , welcome.` — note o espaço antes da vírgula —
dependendo de como o conversor normaliza nós de texto. O conserto é aparar sequências de
espaços em branco ao redor das bordas de elementos inline antes de converter, e é por
isso que bons conversores pré-processam o DOM em vez de trabalhar na string crua.

O mesmo problema aparece como linhas em branco espúrias ao redor de listas aninhadas,
porque as quebras de linha entre `</li>` e `<ul>` em HTML formatado bonito viram nós de
texto.

## Pré-processamento que realmente ajuda

Antes de entregar o HTML a um conversor, três passadas consertam a maior parte dos
documentos do mundo real:

1. **Remover** o ruído: `<script>`, `<style>`, `<noscript>`, comentários, pixels de
   rastreamento
2. **Desenvelopar** wrappers apresentacionais: um `<div>` sem significado semântico e
   com um único filho pode ser substituído por esse filho
3. **Normalizar** espaços em branco dentro e ao redor de elementos inline

Faça isso e a saída melhora mais do que qualquer quantidade de regex de pós-processamento
no lado do Markdown. Consertar Markdown quebrado depois dos fatos é muito mais difícil
do que limpar o HTML primeiro, porque aí você não sabe mais qual quebra de linha era
significativa.

## Quando parar de converter

Se o HTML é um documento escrito à mão, a conversão geralmente vale a pena. Se é a
saída renderizada de um app web — vinte divs aninhados, classes utilitárias, estilos
inline — é melhor voltar à fonte. Conversores dão o melhor com documentos e o pior com
DOM gerado por máquina.

Cole sua marcação em [HTML para Markdown](/pt/html-to-markdown/) e leia o resultado antes
de se comprometer com ele. Se a saída precisar de mais do que alguns minutos de limpeza,
a fonte era o lugar errado para começar.
