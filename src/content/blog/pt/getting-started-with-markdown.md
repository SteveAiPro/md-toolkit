---
title: "Começando com Markdown: um guia prático"
description: "Aprenda Markdown em dez minutos — sintaxe, tabelas, blocos de código e as armadilhas que fazem iniciantes perderem uma hora."
pubDate: 2026-01-12
tags: ['markdown', 'iniciante', 'tutorial']
lang: pt
group: getting-started-with-markdown
tools: ['markdown-editor', 'markdown-to-pdf', 'markdown-to-html']
---

Markdown é um formato de texto puro que se transforma em HTML estruturado. Você
escreve em um arquivo `.md` com um punhado de sinais de pontuação, e qualquer
renderizador produz títulos, listas, tabelas e links.

Foi criado em 2004 por John Gruber. Vinte anos depois, é o padrão para READMEs,
documentação, posts de blog, mensagens de chat e prompts de modelos de linguagem. O
motivo é simples: sobrevive a qualquer copiar e colar e continua legível mesmo quando
nada o renderiza.

## Por que usar

Três razões concretas:

1. **Gera bons diffs.** Diff de Git em arquivo Word não serve para nada. Diff em
   Markdown mostra exatamente qual frase mudou.
2. **É portável.** GitHub, Notion, ChatGPT — todas as plataformas aceitam.
3. **É rápido.** Sem barra de ferramentas, sem mouse. Suas mãos não saem do teclado.

## A sintaxe que você vai realmente usar

Um conjunto de dez regras basta para ser produtivo.

### Títulos

```markdown
# Título 1
## Título 2
### Título 3
```

Um `#` por nível, seguido de um espaço. O espaço não é opcional: `#Título` aparece
como texto literal na maioria dos analisadores.

### Ênfase

```markdown
*itálico*   ou   _itálico_
**negrito** ou   __negrito__
***os dois***
```

### Listas

```markdown
- Item não ordenado
- Outro item
  - Aninhado (dois espaços antes do hífen)

1. Item ordenado
2. Segundo item
```

O aninhamento depende da indentação. Dois espaços para listas não ordenadas, três
para ordenadas. Se errar, você ganha uma lista plana com espaços estranhos no início
das linhas.

### Links e imagens

```markdown
[Texto do link](https://example.com)
![Texto alternativo](imagem.png)
```

A única diferença é o `!` no início.

### Código

Código inline usa crases simples: `` `npm install` ``.

Blocos usam três crases, e você deve sempre indicar a linguagem:

````markdown
```javascript
const x = 1;
```
````

Sem o nome da linguagem, não há destaque de sintaxe.

### Tabelas

```markdown
| Funcionalidade | Status |
| --- | --- |
| Exportar | Entregue |
| Importar | Beta |
```

A linha de `---` é obrigatória: ela diz ao analisador qual linha é o cabeçalho. O
alinhamento é controlado por dois-pontos: `:---` à esquerda, `---:` à direita,
`:---:` centralizado.

## As armadilhas que custam uma hora aos iniciantes

**Uma linha em branco é obrigatória antes de cada elemento de bloco.** Isto não
renderiza como lista:

```markdown
Um pouco de texto
- primeiro item
- segundo item
```

É preciso uma linha vazia entre o parágrafo e a lista. Mesma regra para títulos,
blocos de código e tabelas.

**Indentar um bloco de código com quatro espaços também funciona**, mas misturar
tabulações e espaços quebra tudo. Use blocos delimitados por três crases e o problema
desaparece.

**Nem todas as variantes são iguais.** CommonMark é o padrão. O GitHub Flavored
Markdown acrescenta tabelas, listas de tarefas e links automáticos. Seu analisador
pode suportar notas de rodapé, ou fórmulas matemáticas, ou nenhuma das duas. Se algo
não renderiza, a variante é a primeira coisa a verificar.

**Escapes.** Para mostrar um asterisco literal, escreva `\*`. Caracteres que precisam
de escape: `` \ `` `*` `_` `{` `}` `[` `]` `(` `)` `#` `+` `-` `.` `!`

## Próximos passos

Abra o [editor Markdown](/pt/markdown-editor/) e cole este artigo nele — você verá o
resultado se atualizar enquanto digita.

Quando precisar entregar o documento a alguém que não usa Markdown, converta-o.
[Markdown para PDF](/pt/markdown-to-pdf/) preserva a formatação para compartilhar;
[Markdown para HTML](/pt/markdown-to-html/) entrega uma página independente que você
pode hospedar em qualquer lugar.
