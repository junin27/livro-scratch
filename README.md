# Scratch: o Guia Completo

> Do zero ao seu primeiro jogo! Livro didático de **Programação com Scratch** para crianças, escrito em LaTeX.

Projeto da **Universidade de Rio Verde (UniRV)**, curso de **Engenharia de Software**.

## Autores

Em ordem alfabética:

- Gilberto Aparecido Dias Junior
- Maycon Garcia Silva
- Vinicius Félix de Paula

## Sobre o livro

O livro ensina Scratch passo a passo, com blocos desenhados no próprio LaTeX (não são prints de tela), missões, exercícios, desafios e resoluções. Cada conceito novo vem com uma analogia do dia a dia na caixa **"Pense assim"**, para a criança entender antes de programar.

São 20 capítulos em 4 partes, mais apêndices:

| Parte | Capítulos | Assunto |
|---|---|---|
| I. Primeiros Passos | 1–5 | Interface, sequência de instruções, movimento, aparência, som, cenários e atores |
| II. Dando Vida aos Projetos | 6–10 | Eventos, controle e repetição, sensores, animação, histórias |
| III. Lógica de Programação | 11–16 | Condições, operadores, variáveis, listas, clones, Meus Blocos |
| IV. Projetos Finais | 17–20 | Jogo da coleta, quiz, labirinto/corrida e jogo livre |
| Apêndices | — | Glossário, tabela de blocos por cor, bugs comuns, gabarito |

Cada capítulo segue o mesmo molde: **Objetivos → explicação → Missão → Exercícios → Desafio → Resoluções**.

O plano completo está em [PLANO_DO_LIVRO.md](PLANO_DO_LIVRO.md).

## Estrutura do repositório

```
.
├── main.tex                 # documento principal (capa, sumário, partes e capítulos)
├── structure.tex            # estilo: cores, blocos desenhados, caixas, cabeçalho e rodapé
├── capitulos/
│   ├── cap01.tex ... cap20.tex
│   └── apendices.tex
├── Pictures/                # imagens (gatinhos em SVG/PDF)
├── PLANO_DO_LIVRO.md        # plano e status dos capítulos
├── Scratch_Guia_Completo.pdf             # PDF final (com resoluções)
├── Scratch_Guia_Completo_otimizado.pdf   # PDF final comprimido
├── CLAUDE.md                # regras do projeto para quem usa IA (Claude Code)
└── README.md
```

## Como compilar

Requisitos: uma distribuição LaTeX (MiKTeX ou TeX Live) com os pacotes `tikz`, `tcolorbox`, `nunito`, `fancyhdr`, `titlesec`, `titletoc`, `hyperref`, entre outros. O MiKTeX instala o que faltar automaticamente.

Na pasta do projeto, rode **duas vezes** (a primeira gera o sumário e as faixas de capítulo, a segunda as acerta):

```bash
pdflatex main.tex
pdflatex main.tex
```

O resultado é o arquivo `main.pdf`.

### Versão do professor e versão do aluno

Em [main.tex](main.tex), a chave abaixo mostra ou esconde as caixas verdes de **Resolução**:

```latex
\solucoestrue    % mostra as resoluções (versão do professor)
\solucoesfalse   % esconde as resoluções (versão do aluno)
```

## Como contribuir

1. Leia o [CLAUDE.md](CLAUDE.md): ele tem as regras de escrita e os comandos de LaTeX do projeto (vale para quem usa IA e para quem não usa).
2. Crie uma branch para a sua alteração e abra um Pull Request.
3. Antes de enviar, compile duas vezes e confirme que não há erros no log.
4. Não envie arquivos de compilação (`.aux`, `.log`, `main.pdf`...); o `.gitignore` já cuida disso.

## Créditos

Scratch é um projeto da Scratch Foundation, em colaboração com o Lifelong Kindergarten Group do MIT Media Lab (`scratch.mit.edu`). Este livro não é afiliado a eles. O estilo visual parte da estrutura do *Legrand Orange Book Template*.
