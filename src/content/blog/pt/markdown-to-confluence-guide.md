---
title: "Markdown para marcação wiki do Confluence"
description: "O Confluence não fala Markdown. Veja o mapeamento entre as duas sintaxes, mais as macros de que você precisa para código e tabelas."
pubDate: 2026-02-16
tags: ['markdown', 'confluence', 'wiki-markup', 'converter', 'tutorial']
lang: pt
group: markdown-to-confluence-guide
tools: ['markdown-to-confluence']
---

O Confluence usa sua própria marcação wiki, inventada anos antes do Markdown se tornar
universal. As duas parecem semelhantes e não são compatíveis. Colar Markdown em uma
página do Confluence dá a você asteriscos e cerquilhas literais.

## Mapeamento de sintaxe

| Markdown | Confluence | Observações |
| --- | --- | --- |
| `# H1` | `h1. H1` | Ponto, depois um espaço |
| `## H2` | `h2. H2` | Vai até `h6.` |
| `**bold**` | `*bold*` | Asterisco único |
| `*italic*` | `_italic_` | Sublinhado único |
| `` `code` `` | `{{code}}` | Chaves duplas para monoespaçado |
| ```` ```js ```` | `{code:language=js}` … `{code}` | Macro, não uma cerca |
| `> quote` | `bq. quote` | Ou `{quote}` … `{quote}` |
| `- item` | `* item` | `**` para aninhado |
| `1. item` | `# item` | `##` para aninhado |
| `[text](url)` | `[text\|url]` | **Pipe, não parêntese** |
| `---` | `----` | Quatro traços |

A sintaxe de link é a que pega todo mundo. Markdown usa parênteses; o Confluence usa um
pipe.

## Blocos de código

Cercas Markdown mapeiam para a macro de código, que aceita parâmetros:

```
{code:language=javascript|title=example.js|linenumbers=true}
const x = 1;
{code}
```

Se você omitir `language`, o Confluence mostra o bloco sem realce. Se omitir o `{code}`
de fechamento, tudo depois dele vira código.

Há uma armadilha: se seu código contém um `{code}` literal, ele encerra a macro cedo. A
maioria dos conversores não escapa isso.

## Tabelas

A sintaxe de tabela do Confluence usa pipes duplos para cabeçalhos:

```
||Cabeçalho 1||Cabeçalho 2||
|Célula 1|Célula 2|
```

Note que a linha de cabeçalho usa `||` enquanto as linhas de corpo usam um único `|`, e
diferente do Markdown não há **linha de separador**.

## O que não tem equivalente

**Imagens.** O `![alt](url)` do Markdown vira `!url!` no Confluence, mas apenas para
URLs anexadas ou absolutas. Caminhos relativos não resolvem.

**Listas de tarefas.** O `- [ ]` não tem equivalente em marcação wiki. Use a macro de
tarefa (`{task}`) ou um marcador com um caractere de caixa de seleção.

**Notas de rodapé, listas de definição, HTML inline.** Sem mapeamento. Ou são descartadas
ou chegam como texto literal.

**Matemática.** O Confluence precisa da macro LaTeX. Raw `$...$` renderiza como cifrões.

## Duas formas de colocar conteúdo

**Converter e colar.** Renderizar para marcação wiki, colar no editor. Rápido, mas você
perde a capacidade de fazer a viagem de volta para Markdown.

**Usar o formato de armazenamento.** O formato subjacente real do Confluence é XHTML
("formato de armazenamento"), e a API REST o aceita. Se você está automatizando, converter
Markdown → HTML → XML de armazenamento do Confluence é mais confiável do que mirar a
marcação wiki, porque você pode representar macros adequadamente.

## Por que se dar ao trabalho de converter

Se sua equipe escreve em Markdown (READMEs, RFCs, ADRs) e publica no Confluence, alguém
está reformatando manualmente. Isso é lento e introduz erros — um título vira texto em
negrito, uma tabela vira colunas separadas por espaço.

Converter mecanicamente e depois consertar as poucas macros à mão é muito mais rápido do
que redigitar.

Experimente [Markdown para Confluence](/pt/markdown-to-confluence/) — cole à esquerda,
copie a marcação wiki à direita.
