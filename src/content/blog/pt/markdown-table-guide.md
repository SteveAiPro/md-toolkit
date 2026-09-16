---
title: "Tabelas em Markdown: formatação, alinhamento e conversão"
description: "Tabelas são a parte mais propensa a erros do Markdown. Aprenda as regras, a sintaxe de alinhamento, e como mover tabelas entre CSV, JSON e Word."
pubDate: 2026-02-02
tags: ['markdown', 'table', 'tutorial', 'converter']
lang: pt
group: markdown-table-guide
tools: ['csv-to-markdown-table', 'json-to-markdown-table', 'markdown-table-to-csv', 'markdown-table-to-pdf']
---

Tabelas em Markdown são a parte da sintaxe mais propensa a renderizar silenciosamente
como texto puro. As regras são poucas, mas rígidas.

## A tabela mínima viável

```markdown
| Coluna A | Coluna B |
| --- | --- |
| Valor 1 | Valor 2 |
```

Três requisitos:

1. Caracteres pipe delimitam células
2. **A segunda linha deve ser o separador**, feito apenas de traços e dois-pontos
3. Pipes iniciais e finais são opcionais, mas seja consistente

Se a linha de separador estiver faltando, você obtém quatro linhas de texto com pipes
nelas. Esta é a falha de tabela mais comum.

## Alinhamento

Dois-pontos na linha de separador definem o alinhamento da coluna:

```markdown
| Esquerda | Centro | Direita |
| :--- | :----: | ----: |
| a    |   b    |     c |
```

- `:---` esquerda
- `:---:` centro
- `---:` direita

Os traços só precisam ter um caractere: `|:-|:-:|-:|` é válido.

## Escapando pipes

Um `|` literal dentro de uma célula deve ser escapado como `\|`, ou será interpretado
como um delimitador de célula e deslocará cada coluna subsequente:

```markdown
| Expressão | Significado |
| --- | --- |
| `a \| b` | OR bit a bit |
```

Isso pega pessoas escrevendo documentação para comandos shell e expressões regulares,
ambos usando pipes intensamente.

## O que não funciona

**Células mescladas.** O Markdown não tem sintaxe para `colspan` ou `rowspan`. Você não
pode mesclar células, ponto final. A solução alternativa usual é repetição ou uma tabela
HTML.

**Células multi-linha.** Uma célula não pode conter uma quebra de linha rígida. Se
precisar de uma, use um `<br>` HTML (funciona na maioria dos sabores) ou reestruture a
tabela.

**Tabelas aninhadas.** Não suportado.

**Conteúdo longo.** Tabelas não quebram linha graciosamente. Uma célula com um parágrafo
de texto fica ilegível — use uma lista em vez disso.

## Movendo tabelas entre formatos

É aqui que as pessoas gastam tempo de verdade. As três direções comuns:

**CSV → Markdown.** A parte complicada é a detecção de delimitador e campos entre aspas.
Uma célula CSV contendo uma vírgula é envolvida em aspas: `"Smith, John"`. Um `split(',')`
ingênuo transforma isso em duas colunas. Use um parser de verdade.

**JSON → Markdown.** Arrays de objetos planos mapeiam limpamente: chaves viram cabeçalhos,
valores viram células. Objetos aninhados não mapeiam de forma alguma — você tem que
achatá-los primeiro, geralmente juntando chaves com um ponto (`user.name`).

**Markdown → CSV.** A leitura é o contrário, mas você precisa re-escapar valores que
contêm vírgulas ou aspas. Escrever um CSV sem uma estratégia de escape produz arquivos
que quebram ao abrir no Excel.

As três estão disponíveis como ferramentas no navegador:
[CSV para tabela Markdown](/pt/csv-to-markdown-table/),
[JSON para tabela Markdown](/pt/json-to-markdown-table/), e
[tabela Markdown para CSV](/pt/markdown-table-to-csv/).

## Colocando uma tabela no papel

Tabelas largas são o problema clássico de PDF. Uma tabela de dez colunas em A4 retrato
fica ilegível.

Duas opções, ambas uma linha de CSS:

```css
@page { size: A4 landscape; }
```

Ou reduzir a fonte dentro da tabela e permitir que ela quebre:

```css
table { font-size: 9pt; }
tr { break-inside: avoid; }   /* não divide uma linha entre páginas */
```

[tabela Markdown para PDF](/pt/markdown-table-to-pdf/) aplica o layout paisagem por
padrão.

## Uma checklist de depuração

Tabela renderizando como texto puro? Siga esta lista:

1. Há uma linha de separador de traços diretamente abaixo do cabeçalho?
2. Há uma linha em branco antes e depois da tabela?
3. Toda linha tem o mesmo número de pipes que o cabeçalho?
4. Algum pipe literal está escapado como `\|`?
5. Seu analisador suporta tabelas de forma alguma? (O Markdown original não suportava;
   o CommonMark também não — tabelas são uma extensão GFM.)
