# Lacunas nas instruções — evidências e correções

As evidências desta seção descrevem as instruções antes da revisão. As 20
correções estão mapeadas no fim deste registro.

## L01 — Figuras geométricas sem instruções de Caneta

- **Locais:** capítulo 2, exemplo “Desenhando um quadrado”, exercício “Triângulo”
  e desafio “Sua própria figura”; capítulo 16, exemplos e atividades de polígonos.
- **Esperado pelo texto:** desenhar uma figura visível.
- **Blocos apresentados:** movimento, giro e repetição, sem extensão Caneta.
- **Evidência no navegador:** quadrado montado manualmente e executado. Uma volta
  isolada levou o ator de (0,0), direção 90, a (100,0), direção 180. Quatro voltas
  retornaram ao início e não deixaram traço no palco.
- **Evidência adicional no navegador:** triângulo (3 repetições, 100 passos, giro
  120) e hexágono (6 repetições, 60 passos, giro 60) também executados. O ator
  terminou em (0,0), direção 90, e o palco permaneceu sem traço nos dois casos.
- **Evidência local:** os percursos de triângulo, hexágono, quadrados com parâmetro
  e pentágono fecham corretamente, mas não contêm comandos de desenho.
- **Capítulo 16 no navegador:** as chamadas de quadrados de 40 e 100, o
  triângulo e o pentágono não deixaram traço. Na contraprova, a extensão Caneta
  com limpar, baixar e levantar produziu dois quadrados visíveis, preservando
  a definição e as entradas. Capturas `C16-quadrado-parametro-resultado.jpg`,
  `C16-triangulo-resultado.jpg`, `C16-poligono-resultado.jpg` e
  `C16-quadrados-com-caneta-resultado.jpg`.
- **Proposta:** ensinar Caneta com limpar, abaixar e levantar; ou usar “percorrer
  o contorno”, esclarecendo que não é produzido um desenho visível.
- **Imagens locais:** `tmp/testes-scratch/quadrado-sem-caneta.jpg`,
  `tmp/testes-scratch/triangulo-sem-caneta.jpg` e
  `tmp/testes-scratch/hexagono-sem-caneta.jpg`.

## L02 — Deslocamentos horizontais dependem da direção anterior do ator

- **Local:** capítulo 5, “Dois amigos”; capítulos 6 e 11, missões e exemplos das setas.
- **Passos:** iniciar o ator apontando para cima (direção 0); pressionar a seta
  direita no projeto com `mova 10 passos`.
- **Esperado pelo enunciado:** movimento para a direita.
- **Observado no motor:** deslocamento para cima; os comandos usam a direção atual.
- **Condição:** na direção inicial 90 o exemplo funciona. A lacuna aparece se o
  aluno reutiliza um ator que girou nos capítulos anteriores.
- **Proposta:** indicar direção inicial 90, apontar antes de mover ou usar mudança
  de x para deslocamento horizontal.
- **Estado:** confirmada no navegador. Com foco no palco e direção 0, seta direita
  levou y de 0 a 10. Contraprova com direção 90: direita levou x de 0 a 10 e
  esquerda retornou x a 0. Capturas `C06-setas-*.jpg` em `tmp/testes-scratch`.
- **Capítulo 5:** com direção 90, o gato saiu de x=-150 para x=-50. Com
  direção 0, permaneceu em x=-150 e subiu até y=100. Capturas
  `C05-dois-amigos-resultado.jpg` e `C05-dois-amigos-direcao-zero.jpg`.
- **Capítulo 11:** na orientação inicial, segurar a direita fez x chegar a 75;
  ao soltar, o ator parou e disse “Parei”. Com direção 0, a direita aumentou y
  em 80 e manteve x em 75. Capturas `C11-gato-parado-final.jpg` e
  `C11-gato-direcao-zero.jpg`.
- **Ping-pong, capítulo 11:** a fantasia voltou da borda em pé, espelhada. Após
  parar o projeto em direção -90, reposicionar o gato no centro e clicar na
  bandeira, o primeiro movimento foi para a esquerda. Definir o estilo de rotação
  preserva a direção. Capturas `C11-ping-pong-retorno.jpg` e `C11-ping-pong-reinicio.jpg`.

## L03 — Evento da resolução difere do enunciado

- **Local:** capítulo 11, exercício “Cabeça ou cauda”.
- **Texto:** “ao ser clicado”.
- **Resolução:** bandeira verde, laço sempre e leitura do botão do mouse.
- **Observado no motor:** clicar no ator antes de iniciar pela bandeira não
  executa a resolução, pois não existe evento de clique nela.
- **Proposta:** alinhar o enunciado à leitura contínua após a bandeira ou fornecer
  resolução que comece pelo evento solicitado.
- **Estado:** confirmada no navegador. Clique antes da bandeira não produziu
  fala; bandeira iniciou “Esperando...”. Capturas `C11-EXERCICIO-02-*.jpg`.

## L04 — Falta explicitar a ligação entre as pilhas do quiz

- **Local:** capítulo 18, exemplos “Cadastrando as perguntas” e “O jogo”.
- **Passos:** montar as duas pilhas separadas como aparecem nas caixas e clicar
  na bandeira.
- **Observado no motor:** as listas são preenchidas, mas as perguntas não começam.
  “O jogo” não tem evento próprio.
- **Contraprova:** encaixando “O jogo” após o cadastro, o quiz apresenta as três
  perguntas e calcula corretamente 3, 2 e 0 pontos nos cenários executados.
- **Proposta:** orientar expressamente a conectar o segundo trecho ao final do
  primeiro. Evitar outra bandeira independente, que pode introduzir disputa com
  o preenchimento das listas.
- **Estado:** confirmada no navegador. Pilhas separadas não iniciaram pergunta.
  Depois da ligação, respostas 4, brasília e 7 produziram “Você fez 3 pontos!”.
  Capturas `C18-pilhas-separadas.jpg` e `C18-integrado-todos-acertos.jpg`.

## L05 — Reinício depende de receptores que não estão demonstrados

- **Local:** capítulo 20, exercício “Recomeçar”.
- **Resolução apresentada:** pressionar R envia `começar`.
- **Lacuna de integração:** enviar a mensagem não zera variáveis por si só. Cada
  projeto precisa de receptores que restaurem variáveis, posições, visibilidade,
  cenário e clones conforme suas regras.
- **Proposta:** mostrar um receptor mínimo e listar o estado a restaurar. Testar
  R durante a partida e após a parada do jogo, verificando também laços duplicados.
- **Limite:** não se afirma que todo reinício por mensagem falha. O resultado
  depende dos receptores existentes no projeto escolhido.
- **Estado:** confirmado no navegador. Com 9 pontos e o ator em x=80, R manteve
  os dois valores. No protótipo com receptor, a seta direita elevou a pontuação
  para 10 e x para 90, e R restaurou ambos a zero. O motor local também confirmou
  o envio de `começar` na pilha literal.
- **Evidência:** `C20-reinicio-literal.jpg` e `C20-reinicio-contraprova.jpg`.
  A [corrida do desafio aberto foi publicada](https://scratch.mit.edu/projects/1441762289/).
  O desafio revisado usa teste individual e comparação antes e depois.

## L06 — Nova partida mantém o cenário de fim de jogo

- **Local:** capítulo 17, inicialização no Palco e Missão 17.
- **Passos:** jogar até vidas=0, confirmar cenário “Fim de jogo”, clicar novamente
  na bandeira verde.
- **Observado no navegador:** vidas voltam a 3 e novas maçãs aparecem, mas a aba de
  cenários continua com “Fim de jogo” selecionado. A inicialização só define pontos
  e vidas, sem selecionar o cenário da partida.
- **Proposta:** incluir a seleção do cenário inicial no início da partida.
- **Estado:** confirmado no navegador. Imagem `C17-reinicio-cenario.jpg` e registro
  AX correspondente em `tmp/testes-scratch`.

## L07 — Fala de vitória é apagada ao parar tudo imediatamente

- **Local observado:** capítulo 19, ramo da meta em “Vigiando as cores”. O mesmo
  padrão aparece no capítulo 13, em “Ganhou!” e no desafio de cinco pontos.
- **Passos no navegador:** iniciar o labirinto e percorrer o caminho pelo teclado
  até a área verde.
- **Observado:** a pilha encerra, mas “Venci!” não fica visível no palco.
- **Causa no motor oficial 15.3.0:** `PROJECT_STOP_ALL` chama `_onResetBubbles`,
  que limpa o texto dos balões. Emitir o evento SAY não comprova que o leitor verá
  a fala. Os testes auxiliares foram ampliados para conferir também o estado final
  do balão, em vez de só o evento.
- **Contraste observado:** a integração do cronômetro do capítulo 19, que coloca
  uma fala de três segundos antes de parar, exibiu “Tempo: 0.697” na meta.
- **Proposta:** usar fala temporizada antes da parada ou mostrar a vitória em um
  cenário/ator de resultado.
- **Capítulo 13:** no navegador, “Ganhou!” chegou a 10 e o desafio marcou 5,
  ambos sem balão. A contraprova com dois segundos de espera mostrou “Vitória!”.
  Capturas `C13-dez-sem-balao.jpg`, `C13-cinco-aperto-5.jpg` e
  `C13-cinco-com-espera.jpg`.
- **Evidência:** `C19-meta-sem-balao.jpg` e `C19-cronometro-vitoria.jpg`.

## L08 — Placar visual não volta à fantasia triste quando os pontos zeram

- **Local:** capítulo 18, desafio “Placar visual”.
- **Passos:** começar com a fantasia triste, acertar três perguntas, clicar na
  bandeira para iniciar outra partida.
- **Observado no navegador e no motor:** os pontos voltam a 0, mas a fantasia continua alegre.
  A resolução só envia `atualizou` quando soma ponto, sem avisar após zerar.
- **Proposta:** enviar `atualizou` também logo após definir pontos para zero, ou
  inicializar explicitamente a fantasia triste ao início de cada partida.
- **Evidência:** `C18-placar-inicial.jpg`, `C18-placar-tres-pontos.jpg` e
  `C18-placar-reinicio.jpg`. O ator foi preparado com a fantasia triste antes da
  primeira partida.

## L09 — Falta dizer quando inicializar o recorde do labirinto

- **Local:** capítulo 19, desafio “Melhor tempo”.
- **Cenário de teste:** recorde anterior de 4 segundos, tentativa seguinte de 9.
- **Observado no motor:** ao colocar o bloco que define 999 sob a bandeira, o
  recorde antigo é apagado e o novo passa a 9. Inicializando 999 só uma vez,
  a tentativa de 9 não substitui o melhor tempo de 4.
- **Proposta:** esclarecer que a inicialização é única, e que na bandeira se zera
  somente o cronômetro. Indicar como limpar o recorde intencionalmente.
- **Observado no navegador:** em duas montagens, o sensor de cor foi acionado
  pelos campos de posição. Inicializar na bandeira substituiu 0,848 s por um
  tempo maior de 8,028 s. Inicializar uma vez preservou 0,8 s após a tentativa
  mais lenta. O livro deixa em aberto onde encaixar o bloco que define 999.
- **Evidência:** capturas `C19-recorde-na-bandeira-*` e `C19-recorde-uma-vez-*`.

## L10 — O exercício da segunda fase não orienta o reinício do labirinto

- **Local:** capítulo 19, exercício “Segunda fase”. O enunciado pede a transição,
  que funcionou. A lacuna está no comportamento de uma nova partida.
- **Passos:** iniciar em `labirinto 1`, usar os campos de posição para colocar
  o gato sobre a meta e clicar novamente na bandeira verde.
- **Observado no navegador:** a meta ativa `labirinto 2` e retorna o gato a
  (-200,150). A bandeira volta a iniciar o código no cenário `labirinto 2`.
- **Proposta:** explicitar o comportamento esperado. Para sempre começar na
  fase 1, selecionar `labirinto 1` na pilha da bandeira.
- **Evidência:** `C19-segunda-fase.jpg` e `C19-segunda-fase-reinicio.jpg`. Os
  cenários foram desenhados para o teste e a chegada foi acionada pelos campos
  de posição, sem percorrer os corredores nesta variante.

## L11 — O desafio da coleta não explica como combinar tempo e vidas

- **Local:** capítulo 17, desafio “Sua versão”. A solução acrescenta um
  cronômetro de 30 segundos e para tudo ao chegar a zero. O jogo anterior
  também para tudo quando acabam as vidas.
- **Observado no navegador:** em uma versão com gato e estrelas, manter a regra
  de vidas e errar todas as coletas encerrou a partida com `tempo=26`. Quando as
  estrelas foram coletadas, o timer chegou a zero e o monitor manteve 29 pontos.
- **Proposta:** dizer se o cronômetro substitui o fim por vidas ou se a partida
  termina pelo primeiro limite atingido. Orientar também a manter o monitor de
  pontos visível ou exibir a pontuação no encerramento, como pede o enunciado.
- **Evidência:** `C17-tempo-vidas-zero.jpg` e `C17-tempo-zero.jpg`. As posições
  das estrelas foram fixadas para repetir os dois ramos. Os monitores estavam
  visíveis por preparação do teste.

## L12 — Os exemplos de diálogo não mostram como ligar a despedida à cena 2

- **Local:** capítulo 10, Missão 10 e exemplos do Palco e das falas.
- **Observado no navegador:** os trechos impressos, reunidos sem completar
  as pilhas, reproduziram a conversa e trocaram o cenário, mas ninguém se
  despediu. B envia `despedida`, sem receptor demonstrado, e o Palco envia
  `cena 2`. Um receptor para `cena 2` exibiu “Até amanhã!” no segundo cenário.
- **Proposta:** indicar qual aviso deve iniciar a despedida, com um exemplo de
  receptor. A escolha das falas pode continuar aberta na missão.
- **Evidência:** `C10-historia-sem-despedida.jpg` e
  `C10-historia-com-despedida.jpg`.

## L13 — Reiniciar histórias pode manter o cenário da última cena

- **Local:** capítulo 5, desafio “Minha pequena história”; capítulo 10,
  exercício “Duas cenas”.
- **Observado no navegador:** na primeira execução o Palco mudou de `início`
  para `praia`. Na segunda, clicar na bandeira preservou `praia` desde o
  início. A fala ainda veio após a espera de cinco segundos.
- **Proposta:** selecionar o primeiro cenário logo após a bandeira, como no
  exemplo anterior do capítulo.
- **Evidência:** `C10-duas-cenas-antes.jpg`, `C10-duas-cenas-reinicio.jpg` e
  `C10-duas-cenas-fala.jpg`.
- **Capítulo 5:** com dois cenários e o comando “próximo cenário”, a primeira
  execução foi de `casa` para `festa`. A segunda começou em `festa`, com a fala
  inicial, e depois voltou para `casa`. Capturas `C05-historia-reinicio.jpg` e
  `C05-historia-reinicio-casa.jpg`.

## L14 — Inverter as condições do exemplo não muda quando a fala dispara

- **Local:** capítulo 11, aviso depois de “Dois ses encaixados”. O texto diz que
  inverter a ordem muda o resultado, sem qualificar a afirmação para o exemplo.
- **Observado no navegador:** com borda por fora ou Espaço por fora, o primeiro
  balão “Pulei a parede!” apareceu apenas quando o gato tocava a borda e Espaço
  estava pressionado. Os outros três casos não iniciaram fala.
- **Proposta:** explicar que a ordem muda qual condição é avaliada primeiro.
  Nesta pilha, a mesma ação exige as duas condições nas duas ordens. Um exemplo
  com ações entre os testes pode ilustrar quando a ordem muda o efeito.
- **Evidência:** quatro capturas por ordem em `C11-condicoes-encaixadas-*` e
  `C11-condicoes-invertidas-*`.

## L15 — Novas entradas ainda pontuam depois da vitória

- **Local:** capítulo 13, “Ganhou!” integrado ao placar e desafio de cinco pontos.
- **Observado no navegador:** depois da parada, o 11º clique elevou os pontos de
  10 para 11. No desafio, o sexto aperto de Espaço aumentou o placar de 5 para 6.
- **Proposta:** guardar o estado da partida em uma variável, alterá-lo para
  encerrada ao vencer e só pontuar se a partida estiver ativa. Restaurar o estado
  na bandeira. A espera testada em L07 dá tempo para ler o balão.
- **Evidência:** `C13-dez-depois.jpg` e `C13-cinco-aperto-6.jpg`.

## L16 — Um único contato com a borda desconta várias vidas

- **Local:** capítulo 13, exercício “Vidas”.
- **Observado no navegador:** parar o gato na borda reduziu as vidas de 3 para
  1 sem sair da borda. Deixando o contato continuar, o contador chegou a -7.
- **Proposta:** explicitar se o custo é por contato ou por segundo na borda.
  Para custo por contato, aguardar o gato sair da borda antes de cobrar outra
  vida. Se a partida termina em zero, explicitar essa condição.
- **Evidência:** `C13-vidas-um-contato.jpg` e `C13-vidas-contato-continuo.jpg`.

## L17 — Os títulos de dois exercícios de clones prometem outro comportamento

- **Local:** capítulo 15, “Dois clones” e “Estrelas piscando”.
- **Observado no navegador:** um clique criou uma única cópia, como pede o
  enunciado de “Dois clones”. No outro exercício apareceram cinco cópias ao
  separar o original. Nenhuma começou a piscar: a pilha só sorteia posições
  e cria os clones, que é o que o enunciado pede.
- **Proposta:** usar títulos como “Original e clone” e “Cinco estrelas ao acaso”
  ou ajustar enunciados e resoluções caso a intenção seja criar dois clones ou
  programar o piscar.
- **Evidência:** `C15-dois-clones.jpg`, `C15-estrelas-antes.jpg` e
  `C15-estrelas-depois.jpg`.

## L18 — O título menciona uma parede, e o código só detecta a borda

- **Local:** capítulo 7, exemplo “Andar até a parede”. O desafio “Corrida até
  a parede” já especifica no enunciado que a chegada é na borda do palco.
- **Observado no navegador:** o gato atravessou a parede desenhada em x=70 e
  parou em x=195, ao tocar a borda do palco com a fantasia.
- **Proposta:** usar “borda do palco” no título ou explicar explicitamente
  a diferença em relação a um obstáculo desenhado, como os do capítulo 19.
- **Evidência:** `C07-parede-atingiu-borda.jpg`.

## L19 — O intervalo entre os inícios das batidas supera meio segundo

- **Local:** capítulo 7, exercício “Cinco batidas”.
- **Observado no navegador:** com a extensão Música, a 60 bpm, um cronômetro
  anotou cinco inícios em 0, 0,817, 1,573, 2,333 e 3,093 s. As diferenças foram
  de aproximadamente 0,76 a 0,82 s. A medição é do início dos blocos.
- **Proposta:** esclarecer se “meio segundo” é a pausa depois de cada batida
  ou a distância entre os inícios. No segundo caso, fixar o andamento e levar
  em conta os 0,25 tempos do bloco de tambor.
- **Evidência:** `C07-batidas-instantes.jpg`. A renderização independente em WAV
  confirmou cinco pulsos completos com inícios separados por 760 ms no relógio
  de teste. A medição do navegador continua a referência para a variação real.

## L20 — A etapa de publicação pula a confirmação do e-mail

- **Local:** capítulo 20, “Passo 5: compartilhe”. O livro passa da criação da
  conta direto para o botão Compartilhar.
- **Verificado nas instruções oficiais:** o cadastro permite começar a criar
  projetos ao entrar na conta. Para compartilhar, o Scratch orienta confirmar
  o endereço pelo link enviado por e-mail. [Cadastro do Scratch](https://scratch.mit.edu/accounts/modal-registration/)
- **Proposta:** incluir entre a criação da conta e o passo de publicação:
  “Confirme a conta pelo link recebido no e-mail. Depois, entre na sua conta e
  clique em Compartilhar.” [Ajuda oficial para compartilhar projetos](https://scratch.mit.edu/help/studio/tips/howto/favorite6/)

## Itens ainda não classificados como falha do livro

- Tamanho do ator não muda na VM sem renderizador: limitação do teste, não defeito
  do exercício. No navegador, capítulo 3 conferido em 200% e depois 100%; capítulo
  9 mostrou crescimento intermediário e retorno a 100%.
- Ausência de som em execução sem áudio também não é defeito do livro.
- Desafios de criação livre admitem várias soluções. O capítulo 20 inclui
  critérios individuais e um exemplo de comparação antes e depois.

## Correções aplicadas ao livro

| Lacuna | Capítulo | Correção |
|---|---|---|
| L01 | 2 e 16 | Extensão Caneta com limpeza, traço e reposicionamento sem riscar. |
| L02 | 5, 6 e 11 | Direção inicial explícita ou movimento pelo eixo x. |
| L03 | 11 | Enunciado inicia pela bandeira e usa o botão do mouse. |
| L04 | 18 | Quiz encaixado imediatamente após o cadastro das listas. |
| L05 | 20 | Receptor explícito para reiniciar cenário, placar e atores. |
| L06 | 17 | A bandeira restaura o cenário da partida. |
| L07 | 13 e 19 | Balão temporizado antes de parar. |
| L08 | 18 | O placar visual recebe um aviso também quando a pontuação zera. |
| L09 | 19 | O recorde é inicializado uma vez e preservado entre partidas. |
| L10 | 19 | A bandeira restaura a fase 1 e a fase 2 tem seu próprio final. |
| L11 | 17 | A partida acaba no primeiro limite atingido e mantém os pontos visíveis. |
| L12 | 10 | Os atores recebem o aviso da cena 2 e se despedem. |
| L13 | 5 e 10 | A bandeira seleciona o primeiro cenário das histórias. |
| L14 | 11 | A troca da ordem muda a primeira condição verificada. A fala exige as duas condições. |
| L15 | 13 | O limite de pontos impede novas pontuações após a vitória. |
| L16 | 13 | Cada novo contato tira uma vida. O jogo para em zero. |
| L17 | 15 | Títulos descrevem a cópia única e as cinco posições sorteadas. |
| L18 | 7 | Títulos e explicação identificam a borda do palco. |
| L19 | 7 | Meio segundo é a pausa depois que o bloco de tambor termina. |
| L20 | 20 | Confirmação por e-mail antes de compartilhar, com publicação opcional. |
