# Validação do livro

## Critério de conclusão

O objetivo é executar todas as atividades e registrar lacunas nas instruções.
O editor oficial no navegador é a validação final. Execuções locais no motor
Scratch VM são evidência auxiliar de lógica, não aprovação completa da atividade.

## Escopo inventariado

147 itens: 49 exemplos em caixas de código, 20 missões, 58 exercícios e 20 desafios.
Há 149 pilhas de blocos. Instruções de interface, tabelas e atividades abertas
também precisam de conferência, mesmo quando não contêm uma pilha.

## O que cada evidência prova

| Evidência | Prova | Não prova |
|---|---|---|
| Inventário e tradução | Localização e transcrição dos blocos do livro | Execução ou correção |
| Scratch VM local | Resultados lógicos com entradas e condições registradas | Interface, som, colisões, tamanho renderizado ou compreensão por crianças |
| Scratch no navegador | Comportamento observado do projeto importado ou montado e executado | Comportamentos não exercitados nem aprendizagem de alunos |
| Avaliação por participantes | Retorno efetivamente recebido | Resultados de participantes não consultados |

`passou` em `resultados-runtime.json` significa somente que as asserções lógicas
daquele cenário passaram. Não significa atividade aprovada no navegador.
`lacuna_reproduzida` exige examinar as condições e os limites do caso antes de
transformá-la em uma conclusão editorial.

## Arquivos

- `inventariar.py` / `inventario.json`: atividades, trechos e linhas de origem.
- `traduzir.py` / `pilhas.json`: transcrição das pilhas para uma estrutura auditável.
- `runtime.cjs`: execução no motor oficial `@scratch/scratch-vm` 15.3.0.
- `executar.cjs` / `resultados-runtime.json`: entradas, asserções, estados e traces.
- `LACUNAS.md`: registro legível das lacunas e seu grau de confirmação.
- `resultados-navegador.json`: execuções observadas no editor, com imagens e limites.
- `COBERTURA.md`: situação individual dos 147 itens, incluindo os pendentes.
- `exportar.cjs`: gera arquivos `.sb3` de teste em `tmp/testes-scratch/projetos`.
- `projetos-finais.cjs`: montagens de referência da coleta, quiz e labirinto.
- `verificar-variantes.cjs` / `resultados-variantes.json`: testes lógicos adicionais do quiz, do recorde e do reinício com a tecla R.
- `verificar-audio.cjs` / `resultados-audio.json`: renderização local do áudio
  dos projetos exportados, com verificação dos eventos e do sinal digital.

Para preparar os projetos com sons da biblioteca, use uma aba nova no Scratch,
mantenha o Meow do gato inicial e adicione Pop, Collect e Oops na aba Sons.
Salve o projeto pelo menu Arquivo como `tmp/testes-scratch/sons-biblioteca.sb3`
e execute `node validacao/exportar.cjs`. O arquivo de cache fica fora do Git.
Para a história do capítulo 10, salve também um projeto contendo Dance Chill Out
como `tmp/testes-scratch/trilha-biblioteca.sb3`. Projetos que não usam esses sons
continuam sendo exportados sem esses caches.

A bateria consolidada registra execução observada no navegador em **147 dos 147
itens**, incluindo execuções parciais. As imagens estão na pasta local ignorada `tmp/testes-scratch`; o registro
JSON conserva os caminhos. As instruções de criação dos projetos na interface
continuam sendo uma verificação distinta da execução de projetos importados.

Na maçã podre do capítulo 17, os dois ramos do sorteio foram observados fixando
a posição de queda sobre a cesta. O fluxo de confirmação de substituição de
projetos está descrito em `OPERACAO_NAVEGADOR.md`.

## Execução auxiliar

Dependências locais, mantidas na pasta ignorada pelo Git `tmp/scratch-runtime`:

```powershell
npm.cmd install --prefix tmp/scratch-runtime --ignore-scripts --no-audit --no-fund @scratch/scratch-vm@15.3.0 @sinonjs/fake-timers
python validacao/inventariar.py
python validacao/traduzir.py
node validacao/executar.cjs
```

Para os testes de áudio dos atores e do Palco, prepare os dois arquivos de
biblioteca descritos acima, exporte os projetos e rode:

```powershell
npm.cmd install --prefix tmp/scratch-runtime --ignore-scripts --no-audit --no-fund web-audio-engine@0.13.4 mpg123-decoder@1.0.3 node-web-audio-api@2.2.0
node validacao/exportar.cjs
node validacao/verificar-audio.cjs
```

O Scratch Audio produz WAVs em `tmp/testes-scratch/audio`. O relatório registra
os eventos, o volume, o pico do sinal e o SHA-256 dos projetos executados.
Em C17 o caso de colisão é fornecido ao sensor no ensaio de áudio; a colisão
gráfica foi testada separadamente no navegador. A medição não usa os
alto-falantes do computador. A extensão Música usa as amostras originais de
piano e caixa do pacote do Scratch VM. As sequências de piano produziram sinal
em todas as janelas. O `OfflineAudioContext` nativo registrou as oito batidas da
dança e as cinco de “Cinco batidas”. O resultado conserva também a medição do
primeiro renderizador, que ficou incompleta nesses dois ensaios.

O pacote publicado apresenta uma referência ausente a CSS na entrada compilada
Node. Por isso o executor carrega `src/index.js` da mesma versão instalada.
O motor não foi modificado.

O relógio do programa é controlado e avança em passos de 20 ms. O orçamento do
escalonador usa tempo real de 0,75 ms por passo, para que um laço sem renderizador
não bloqueie o relógio. Essa configuração não mede velocidade ou desempenho.
Traces repetidos são condensados e o registro de blocos é limitado; as contagens
de chamadas permanecem completas. Fantasias nominais não contêm as imagens reais.
As dependências gráficas foram avaliadas no navegador. O áudio foi verificado
pelo sinal digital renderizado e combinado com a observação dos eventos no editor.

## Revisão após os testes

No capítulo 20, a montagem `C20-jogo-final-corrida.sb3` é um jogo local de duas
pessoas. O Gato avança com A e o Robô com L. Vence quem chega à linha primeiro;
o outro perde. A tela inicial é aberta pela bandeira e a largada usa Espaço.
R repete a corrida. A variável `partida` distingue menu, disputa e fim, e os
testes cobriram as transições e vitórias de ambos os atores. O projeto foi
publicado e conferido após recarregar a página.
[Corrida do gato e do robô no Scratch](https://scratch.mit.edu/projects/1441762289/)

O desafio revisado pede um teste individual antes e depois de uma melhoria.
Na corrida de referência, o teste verificou R durante a disputa e depois da
chegada. A variante revisada preservou as posições durante a disputa e
reiniciou a corrida depois da chegada no motor Scratch. A versão publicada
serviu de referência para o comportamento anterior.

Os 147 registros da bateria documentam a versão anterior às correções.
O registro de lacunas indica onde cada correção entrou no livro. O teste
da corrida revisada consta em resultados-variantes.json.
Conferências adicionais no motor usaram as pilhas revisadas dos capítulos
6, 10, 13, 17 e 18. Passaram os testes de movimento horizontal com o ator
apontando para cima, de despedida e retomada da primeira cena, de limite
de pontos, de perda de vidas por contato, de restauração do cenário da
coleta e de três acertos no quiz. O teste das vidas simulou o sensor de borda.
O script registrar_bateria.py exige a revisão original das fontes para
reproduzir os registros de navegador existentes.

### Reteste lógico da versão revisada

Em 18 de novembro de 2026, as fontes revisadas foram copiadas para
`tmp/retestes` e as 153 pilhas dos 147 itens foram traduzidas. A bateria
adaptada às instruções atuais executou 80 cenários que cobrem 91 itens.
Passaram 71 cenários. Nove passaram nas verificações lógicas e ainda
precisam de conferência gráfica: sete de traço da Caneta e dois de
tamanho dos atores. Nenhuma asserção lógica falhou na rodada final.
O navegador integrado estava indisponível no chat durante esse reteste.
O resultado local está em `tmp/retestes/validacao/resultados-runtime.json`.

Em seguida, os nove casos foram exportados para `tmp/retestes/projetos-visuais`.
Um renderizador substituto registrou as chamadas reais da VM e da extensão
Caneta. Os sete casos de desenho geraram figuras fechadas com a quantidade
correta de lados e sem traço após levantar a caneta. O capítulo 3 enviou as
escalas 200% e 100%. No capítulo 9, a escala subiu de 100% a 150% em cinco
passos e voltou a 100% em outros cinco. Os nove passaram nessa verificação.
A primeira tentativa de abrir o editor retornou acesso indisponível. Na
retomada, o quadrado de 100 passos do capítulo 2 apareceu fechado no palco
do Scratch. A captura está em `tmp/retestes/projetos-visuais/C02-CODIGO-02-palco.jpg`.
A troca de arquivo abriu uma confirmação de substituição. Para evitar novos
avisos, os oito casos restantes foram reunidos em `Retestes-visuais.sb3`, com
um gatilho de tecla por caso, e executados no navegador integrado em uma
página local com Scratch VM, Scratch Render e Scratch Storage. As capturas
`render-1.jpg` a `render-8.jpg` registram os seis desenhos e os dois testes de
tamanho. As figuras apareceram fechadas e os pares de quadrados ficaram sem
traço entre eles. Os dois atores apareceram ampliados a 200% e 150%, conforme
o caso, e voltaram a 100%. Os nove casos desta etapa tiveram confirmação visual.

### Cobertura dos 56 itens restantes

Os 56 itens que faltavam na rodada pós-revisão foram retestados no navegador
integrado em uma página local com o motor, o renderizador e o armazenamento
do Scratch. Foram 53 cenários aprovados, com alguns cenários cobrindo mais de
um item. Em 14 projetos também foi verificado o sinal de áudio em WAV, com
8/8 e 5/5 batidas confirmadas pelo Web Audio nativo nos dois exercícios de
tambor. As montagens usaram entradas dirigidas para repetir ramos como
colisão, erro de resposta e fim da partida.

O arquivo `resultados-reteste.json` registra o resultado de cada um dos 56
itens, os métodos usados e os hashes das fontes e dos projetos. O cruzamento
com os 91 itens da rodada anterior cobre os 147 itens do inventário atual.

O cadastro oficial pede a confirmação da conta por e-mail antes de liberar o
compartilhamento. A etapa omitida no capítulo está registrada como L20.
[Cadastro do Scratch](https://scratch.mit.edu/accounts/modal-registration/)
