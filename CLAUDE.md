# CLAUDE.md — contexto do projeto para a IA

Este arquivo explica o projeto e as regras de trabalho para quem for editar o livro com a ajuda do Claude Code (ou outra IA). Leia tudo antes de alterar qualquer coisa.

## O que é o projeto

**"Scratch: o Guia Completo (do zero ao seu primeiro jogo!)"**: livro didático em **LaTeX**, em **português do Brasil**, que ensina programação com Scratch para **crianças** (leitor-alvo: aprox. 8 a 12 anos). É um trabalho da Universidade de Rio Verde, curso de Engenharia de Software.

Autores (ordem alfabética, mantenha assim em qualquer lugar em que apareçam): Gilberto Aparecido Dias Junior, Maycon Garcia Silva, Vinicius Félix de Paula.

Rodapé fixo de todas as páginas: "Universidade de Rio Verde" (esquerda), "Engenharia de Software" (centro), "Programação com Scratch" (direita).

## Estrutura

- `main.tex`: documento principal. Capa, ficha, sumário, `\parte{...}` (páginas separadoras) e `\input` dos capítulos. Tem a chave `\solucoestrue` / `\solucoesfalse`.
- `structure.tex`: **todo o estilo**. Cores, blocos do Scratch desenhados em TikZ, caixas coloridas, títulos, cabeçalho/rodapé, sumário. Alterações visuais globais vão aqui.
- `capitulos/capNN.tex`: um arquivo por capítulo (cap01 a cap20) + `apendices.tex`.
- `Pictures/`: imagens. `PLANO_DO_LIVRO.md`: plano e status.
- PDF oficial: `Scratch_Guia_Completo.pdf`, com as resoluções.

## Como compilar e conferir

```bash
pdflatex -interaction=nonstopmode main.tex   # rode DUAS vezes
pdflatex -interaction=nonstopmode main.tex
grep -c "^!" main.log                        # deve dar 0 (zero erros)
```

- Sempre compile duas vezes (sumário e faixas de capítulo).
- O log deve ter **0 erros**. Se houver erro, corrija antes de entregar.
- Depois de mudanças visuais, abra algumas páginas do PDF e confira (cabeçalho, rodapé, caixas, quebras de página).
- `main.pdf` e arquivos `.aux/.log/.toc/.out` são locais e estão no `.gitignore`. Para publicar uma revisão, atualize a versão e a data em `main.tex` e no histórico do README. Após compilar, copie `main.pdf` para `Scratch_Guia_Completo.pdf`.

## Molde obrigatório de cada capítulo

`\chapter{...}` → `objetivos` → seções com explicação → `missao` com passo a passo → `exercicio` (fácil → médio) com `solucao` → `desafio` → resoluções.

Cada capítulo tem em média 125–170 linhas. Mantenha o tamanho e o tom parecidos.

## Comandos e ambientes do projeto (definidos em structure.tex)

**Blocos do Scratch desenhados** (não use imagens/prints; desenhe com estes comandos):
- Dentro de `\begin{pilha}...\end{pilha}`: `\sbh[cor]{...}` (bloco de chapéu), `\bk[cor]{...}` (bloco simples), `\sbc[cor]{...}` ... `\sbcend` (bloco em C, como `repita`/`se`), `\sbcelse{senão}` (braço do senão).
- Em linha no texto: `\bloco[cor]{...}` (bloco), `\booleano{...}` (hexágono, condição), `\reporter{...}` (redondo, devolve valor), `\variavel{...}`, `\entrada{...}` (campo de valor), `\menu{...}` (menu suspenso), `\bandeira` (bandeira verde).
- Cores: `scMotion` (movimento), `scLooks` (aparência), `scSound` (som), `scEvents` (eventos), `scControl` (controle), `scSensing` (sensores), `scOperators` (operadores), `scVariables` (variáveis), `scLists` (listas), `scMyBlocks` (meus blocos). Use a cor da categoria correta do Scratch.
- Exemplo:

```latex
\begin{codigo}[Título do exemplo]
\begin{pilha}
\sbh[scEvents]{quando \bandeira\ for clicado}
\sbc[scControl]{repita \entrada{4} vezes}
\bk[scMotion]{mova \entrada{100} passos}
\sbcend
\end{pilha}
\end{codigo}
```

**Caixas** (cada uma tem cor e ícone próprios):
`objetivos`, `missao[Título]`, `dica`, `cuidado` (bugs), `vocabulario[Título]`, `curiosidade`, `pensaassim[Título]` (analogia), `definicao`, `codigo[Título]` (moldura de blocos), `exercicio[Título]`, `desafio[Título]` (numerados por capítulo), `solucao` (a resolução; some com `\solucoesfalse`).

**Outros**: `passos` (lista numerada com bolinhas), `itemize` (já usa estrelinhas), `\parte{Título}{Subtítulo}`.

## Regras de escrita (importante)

1. **Idioma e tom**: português do Brasil, linguagem simples, frases curtas, tom amigável e animado, falando com a criança ("você").
2. **Analogias**: todo conceito novo precisa de uma analogia do dia a dia na caixa `pensaassim` (ex.: receita de bolo para sequência, semáforo para condição, lista de compras para lista). Esta foi uma exigência do professor orientador: **detalhar os conceitos (sequência, condições, repetições etc.) e sempre usar exemplos/analogias**.
3. **Conceito antes do código**: explique a ideia com palavras e analogia, depois mostre os blocos, depois proponha a missão.
4. **Vocabulário**: termos novos entram na caixa `vocabulario` e, se forem importantes, no Glossário (`apendices.tex`).
5. **Estrangeirismos** (ex.: *sprite*, *loop*) em itálico com `\textit{}`.
6. **Escrito como trabalho concluído**: sem "será feito", "ainda vamos desenvolver" ou "em andamento".
7. **Resoluções**: todo `exercicio` e `desafio` com resposta tem `solucao`, e o gabarito está nos apêndices. Se mudar um exercício, atualize a resolução e o gabarito.
8. **Coerência**: não use no capítulo N um conceito que só é ensinado depois (ou avise "vamos aprender a fundo no capítulo X").
9. **Fidelidade ao Scratch**: nomes de blocos exatamente como no Scratch em português, e na categoria/cor certa.

## Armadilhas conhecidas de LaTeX/ferramentas

- **Barras invertidas em scripts**: ao editar `.tex` por shell/Python/sed, `\\` costuma ser "comido" e vira `\`. Prefira editar os arquivos diretamente (editor ou ferramenta de edição) e confira o resultado. Quebra de linha dentro de argumento (ex.: nomes na capa) é `\\`.
- Não use `\color{}` seguido de ambientes de tabela dentro do cabeçalho/rodapé; use `\textcolor{}{}`. Tabelas (`tabular`) no cabeçalho quebram a página com tcolorbox quebrável.
- Fonte Nunito: o pacote `nunito` precisa estar instalado (MiKTeX baixa sozinho).
- Os blocos desenhados usam TikZ; blocos muito longos podem estourar a largura (`\sbw` = 310pt). Encurte o texto do bloco.
- Páginas de capa, partes e sumário não têm cabeçalho/rodapé; as demais têm (definido em `structure.tex`, seção "CABECALHO / RODAPE").

## Fluxo de trabalho com Git

- Não suba arquivos de compilação (`.gitignore` já cobre) nem `main.pdf`.
- Mensagens de commit curtas, em português, no imperativo ("Adiciona analogia ao capítulo 11").
- Cada autor trabalha em uma **branch** própria e abre Pull Request. Evite dois autores editando o mesmo capítulo ao mesmo tempo.
- `structure.tex` afeta o livro inteiro: combine antes de mexer, e recompile tudo depois.
- Antes de commitar: compile duas vezes e confirme 0 erros.

## Ao receber uma tarefa

1. Leia o capítulo (e o `PLANO_DO_LIVRO.md`) antes de editar.
2. Siga o molde e as regras de escrita acima.
3. Compile duas vezes, confira o log e olhe as páginas alteradas.
4. Se a mudança afetar o plano, os apêndices ou o PDF oficial, atualize também.
5. Diga ao autor o que mudou e o que não foi verificado.
