---
title: "Como escrever um README que as pessoas realmente leem"
description: "A estrutura que funciona, os quatro erros que matam a maioria dos READMEs, e por que capturas de tela vencem parágrafos."
pubDate: 2026-09-07
tags: ['markdown', 'readme', 'beginner', 'tutorial']
lang: pt
group: write-a-better-readme
tools: ['markdown-editor', 'markdown-to-image', 'markdown-to-pdf']
---

Um README tem um trabalho: levar um estranho de "o que é isso" a "eu consigo usar isso" o
mais rápido possível. A maioria dos READMEs falha porque é escrita para o autor, não para o
leitor.

A boa notícia é que o formato está quase totalmente resolvido. Há uma estrutura que funciona,
e desviar dela raramente ajuda.

## A estrutura

Em ordem, de cima a baixo:

1. **Nome e descrição de uma linha.** Não uma frase de efeito. O que ele faz, literalmente.
2. **Uma captura de tela ou um GIF curto**, se a coisa tem uma saída visual.
3. **Instalar.** Um comando copiável e colável.
4. **Uso.** O menor exemplo que faz algo útil.
5. **Configuração / referência de API**, se houver uma.
6. **Contribuindo** e **Licença**, no final.

É só isso. Note o que não está na lista: uma seção de status do projeto, um manifesto de
filosofia, um roteiro, uma tabela de badges com doze linhas de profundidade.

## Os quatro erros

**1. Sem comando de instalação.** A falha mais comum de todas. O leitor está interessado,
rola procurando como começar, encontra um muro de prosa e um link para uma wiki, e vai
embora. Coloque o comando em um bloco cercado na primeira tela.

**2. O exemplo de uso é a API inteira.** Um README deve mostrar o *hello world*, não cada
opção. Todo o resto vai para um site de docs ou um arquivo separado. Se sua seção de uso
precisa de um sumário, está longa demais para um README.

**3. Badges como substituto de conteúdo.** Seis badges no topo comunicam "este projeto é
mantido" e nada mais. Mantenha dois ou três que importam — status de build e versão — e siga
em frente.

**4. Capturas de tela obsoletas.** Pior do que nenhuma captura. Uma interface que mudou desde
que a imagem foi tirada faz o leitor duvidar de todo o documento. Se não consegue mantê-las
atuais, use um bloco de código em vez disso.

## Detalhes que valem a pena

**Faça o copiar e colar realmente funcionar.** É aqui que especificidades do Markdown
importam. Um comando shell em um bloco cercado com a tag de linguagem:

````markdown
```bash
npm install seu-pacote
```
````

Não coloque um prompt `$` no início da linha. Parece autêntico e quebra o copiar e colar — o
leitor tem que selecionar ao redor dele toda vez.

**Linke para seções, não arquivos.** IDs de título auto-gerados permitem escrever
`veja [Configuração](#configuration)`. Verifique a âncora; regras de slug diferem entre
renderizadores.

**Use tabelas para opções.** Uma lista de opções de 20 linhas em prosa é ilegível. Três
colunas — nome, padrão, descrição — é o formato certo:

```markdown
| Opção | Padrão | Descrição |
| --- | --- | --- |
| `timeout` | `5000` | Tempo limite da requisição em ms |
| `retries` | `3` | Tentativas antes de falhar |
```

**Recolha a longa cauda.** O `<details>` nativo funciona no GitHub:

```markdown
<details>
<summary>Lista completa de opções</summary>

...conteúdo longo aqui...

</details>
```

Este é HTML cru em Markdown. Funciona no GitHub e em geradores de sites estáticos modernos, e
falha em plataformas que escapam HTML. Conheça seu público antes de contar com isso.

**Diga o que ele não faz.** Uma seção curta de "Não-objetivos" ou "Limitações" economiza
issues e economiza ao leitor uma noite perdida. É subestimado.

## Tamanho

Não há tamanho correto, mas há um *formato* correto: quanto mais para baixo no documento,
mais especializado o conteúdo. Alguém deve conseguir parar de ler depois da seção de uso e
ter sucesso.

Se seu README tem mais de umas duas telas, o conteúdo extra provavelmente pertence a `docs/`.
Linke para ele a partir do README em vez de inlineá-lo.

## Reutilize o README em outro lugar

O README é frequentemente o melhor texto de marketing que você tem. Duas conversões que valem
a pena conhecer:

**Para uma imagem.** Uma captura do README renderizado — nome, descrição, comando de
instalação e exemplo em uma imagem — é um post social decente. Além de certo tamanho a imagem
fica ilegível, então corte para a seção superior. [Markdown para imagem](/pt/markdown-to-image/)
a renderiza como PNG.

**Para um PDF.** Útil para docs internos entregues a pessoas que vivem no Word, ou para
arquivar uma versão do documento junto a um release. [Markdown para PDF](/pt/markdown-to-pdf/)
usa o motor de impressão do navegador, então blocos de código quebram corretamente entre
páginas em vez de serem cortados ao meio.

## O teste de cinco minutos

Peça a alguém que nunca viu o projeto para seguir seu README e dizer onde travou. O que
quer que tropecem é a coisa a consertar — e quase nunca é a coisa que você achava que estava
obscura.

Rascunhe-o no [editor Markdown](/pt/markdown-editor/) para que você possa ver a estrutura
renderizada enquanto escreve. Ler um README como Markdown cru esconde exatamente os problemas
que seus leitores vão encontrar.
