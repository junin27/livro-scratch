# Guia de estudo e contribuição — Maycon

Diagnóstico inicial em 17/11/2026, referente ao commit `0865e143773cf32e7f1b8e6b230f8dc771119090`.

## O que já existe

O livro é um projeto da UniRV, Engenharia de Software, para crianças de aproximadamente 8 a 12 anos. Maycon Garcia Silva consta entre os três autores.

- 20 capítulos escritos em LaTeX, organizados em quatro partes.
- 58 exercícios, 20 desafios e 78 ambientes de resolução. A contagem confirma a quantidade; não comprova a correção das respostas.
- Apêndices com glossário, tabela de categorias de blocos e bugs comuns.
- Dois PDFs versionados: completo e otimizado. Otimização do PDF não significa versão do aluno.
- Estilo centralizado em `structure.tex` e montagem do livro em `main.tex`.

O plano marca a escrita como concluída. Isso não demonstra validação pedagógica ou testes dos projetos. O histórico disponível tem dois commits, ambos de 17/11/2026: criação inicial e inclusão do livro inteiro. Não permite reconstruir a divisão de trabalho entre os autores.

Na consulta às coleções de issues e pull requests do GitHub, incluindo abertas e fechadas, ambas estavam vazias. A única branch remota obtida no clone foi `main`. Isso não informa atividades feitas fora deste repositório ou em branches ainda não publicadas.

## Por onde estudar

Antes dos capítulos, leia `README.md`, `PLANO_DO_LIVRO.md` e `CLAUDE.md`. O último reúne as regras editoriais e técnicas, inclusive para colaboradores que não usam IA.

| Etapa | Leitura | Entrega pessoal de estudo |
|---|---|---|
| 1 | Capítulos 1–5: interface, movimento, aparência, som, atores e cenários | Um projeto curto que combine movimento, fala, som e troca de cenário |
| 2 | Capítulos 6–10: eventos, repetição, sensores, animação e histórias | Uma história interativa com teclado e mensagens |
| 3 | Capítulos 11–16: condições, operadores, variáveis, listas, clones e Meus Blocos | Um projeto com placar, decisão, lista e um comando próprio |
| 4 | Capítulos 17–20: coleta, quiz, labirinto e jogo livre | Reproduzir os projetos seguindo apenas as instruções e registrar onde faltou orientação |

Em cada capítulo: leia os objetivos, tente a missão e os exercícios antes de consultar as resoluções, execute no Scratch e anote as diferenças entre o resultado esperado e o observado. Use sessões de um ou dois capítulos, avançando quando conseguir explicar o conceito e reproduzir o exemplo.

## Onde contribuir primeiro

As prioridades abaixo são propostas desta análise, não tarefas atribuídas pela equipe.

| Prioridade | Contribuição | Evidência ou motivo | Critério de conclusão |
|---|---|---|---|
| 1 | Resolver a divergência sobre o gabarito | README e plano anunciam gabarito nos apêndices; `capitulos/apendices.tex` não contém essa seção, embora haja resoluções nos capítulos | Equipe decide entre incluir gabarito e ajustar a documentação; referências ficam coerentes |
| 1 | Validar os projetos finais e guardar exemplos executáveis | Há instruções nos capítulos 17–20, mas nenhum arquivo `.sb3` no clone | Projetos reproduzidos, com resultado esperado, passos de teste e exemplos aprovados pela equipe |
| 2 | Revisar as analogias dos conceitos novos | A regra exige caixa `pensaassim` para cada conceito novo; capítulos 3, 4, 5, 9 e 10 não têm esse ambiente | Conceitos novos mapeados; analogias inseridas onde necessárias, com conceito antes dos blocos |
| 2 | Preparar e verificar a versão do aluno | O plano lista essa geração como próximo passo; `main.tex` está com `\\solucoestrue` | PDF compilado com `\\solucoesfalse`, conferido para respostas que permaneçam fora das caixas de resolução |
| 2 | Revisar o visual das caixas “Pense assim” | Próximo passo explicitamente registrado no plano | Páginas revisadas no PDF, sem cortes, sobreposições ou blocos ilegíveis |
| 3 | Registrar uma fila de revisão e responsáveis | Não havia issues ou PRs na consulta | Tarefas pequenas com capítulo, responsável, problema, entrega e critério de aceite |

A ausência de `pensaassim` não significa ausência de toda analogia em texto corrido. Os capítulos 17–20 também não usam esse ambiente, mas são projetos de integração: é preciso verificar se introduzem conceitos novos antes de exigir novas caixas.

## Pontos concretos para a revisão técnica

- **Representação de blocos:** no capítulo 17, `y` é desenhado com `\\variavel{y}`. Essa macro usa a cor de Variáveis em `structure.tex`, mas o próprio texto do capítulo identifica `y` como bloco de Movimento. Revisar o desenho e conferir outros reportadores, como `resposta` no capítulo 8.
- **Figuras geométricas:** o capítulo 2 usa “Desenhando um quadrado” e pede triângulo e hexágono, mas os exemplos apresentados contêm apenas movimento e giro. Reproduzir o exemplo para verificar se o objetivo é percorrer o contorno ou deixar um traço visível e completar as instruções conforme a intenção.
- **Reinício do jogo:** a resolução “Recomeçar”, no capítulo 20, envia a mensagem `começar`. Testar no projeto escolhido se os receptores realmente reinicializam o estado e se o procedimento funciona após o fim de jogo. É um ponto de teste, não um defeito confirmado.

## Contribuição como pesquisador

Além de revisar texto, você pode produzir evidências sobre como o material funciona no ensino:

1. Criar uma matriz ligando objetivos de cada capítulo a exercícios e resultados observáveis.
2. Registrar dificuldades de compreensão e instruções que exigem ajuda adicional durante a reprodução dos exemplos.
3. Propor ao orientador uma avaliação do material com perguntas definidas, instrumentos e critérios de análise. Qualquer atividade com participantes deve seguir o procedimento de pesquisa definido pela universidade.
4. Transformar resultados em revisões pequenas: problema observado, trecho afetado, alteração proposta e evidência de melhora.

Uma primeira entrega de alto valor seria validar o capítulo 2 de ponta a ponta e registrar suas dúvidas, acompanhada de uma proposta para resolver a divergência do gabarito. Isso permite estudar o material e contribuir sem precisar dominar todo o LaTeX primeiro.

## Como entregar alterações

Trabalhe em branch própria e abra PR por assunto. Combine a divisão de capítulos para evitar edições simultâneas. Mudanças globais em `structure.tex` devem ser combinadas com a equipe, conforme `CLAUDE.md`.

Para mudanças no livro: compilar duas vezes, conferir zero erros e revisar as páginas afetadas. Se mudar um exercício, conferir também a resolução e as referências correspondentes. Não versionar arquivos temporários de compilação.

## Limites deste diagnóstico

Foi feita inspeção dos documentos de orientação, estrutura, histórico, contagens dos ambientes e leitura de trechos selecionados. Não é uma revisão integral do livro. Não foram executados os projetos no Scratch, conferidas visualmente todas as páginas ou comprovada a correspondência entre PDFs e fontes. `pdflatex` não foi encontrado no PATH deste ambiente, portanto não foi realizada compilação.

Consulta remota: [repositório](https://github.com/junin27/livro-scratch), [issues](https://github.com/junin27/livro-scratch/issues) e [pull requests](https://github.com/junin27/livro-scratch/pulls).
