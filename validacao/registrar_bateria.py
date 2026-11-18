"""Consolida observações reais da bateria de navegador; não executa testes."""
import json
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "validacao"
registry = json.loads((OUT / "resultados-navegador.json").read_text(encoding="utf-8"))
inventory = json.loads((OUT / "inventario.json").read_text(encoding="utf-8"))
audio_path = OUT / "resultados-audio.json"
audio = json.loads(audio_path.read_text(encoding="utf-8")) if audio_path.is_file() else {}
audio_results = {r["projeto"]: r for r in audio.get("resultados", [])}
for result in audio.get("comparacao_web_audio_nativo", []):
    if result["pulsos_com_sinal"] == len(result["eventos"]):
        audio_results[result["projeto"]] = result

audio_projects = {
    "C04-MISSAO-01": ["C04-miau"],
    "C04-CODIGO-01": ["C04-miau"],
    "C04-CODIGO-02": ["C04-notas"],
    "C04-EXERCICIO-01": ["C04-espera-miau"],
    "C04-EXERCICIO-02": ["C04-volume-miau"],
    "C04-EXERCICIO-03": ["C04-parabens"],
    "C04-DESAFIO-01": ["C04-danca"],
    "C06-EXERCICIO-03": ["C06-espaco-miau"],
    "C07-EXERCICIO-03": ["C07-batidas-medidas"],
    "C10-DESAFIO-01": ["C10-historia-com-musica"],
    "C13-CODIGO-01": ["C13-cliques-com-som"],
    "C17-EXERCICIO-03": ["C17-pop-coleta", "C17-pop-sem-coleta"],
    "C18-EXERCICIO-03": ["C18-quiz-sons"],
    "C20-MISSAO-01": ["C20-jogo-final-corrida"],
    "C20-DESAFIO-01": ["C20-jogo-final-corrida"],
}

# Cada linha abaixo corresponde a estados e imagens efetivamente inspecionados.
# Preparação por importação de .sb3, sem ler estado interno da VM do navegador.
batch = [
    (["C01-CODIGO-01", "C01-MISSAO-01"], "x=10, y=0, balão Olá!", ["C01-CODIGO-01"], None),
    (["C01-CODIGO-02"], "x=50 antes da fala Cheguei!", ["C01-CODIGO-02"], None),
    (["C01-CODIGO-03"], "Durante a fala x=0; depois x=50", ["C01-CODIGO-03-inicio", "C01-CODIGO-03-final"], None),
    (["C01-EXERCICIO-01"], "x=10; fala Maria com duração configurada de 3 segundos", ["C01-EXERCICIO-01"], None),
    (["C01-EXERCICIO-02"], "x=20; fala Cheguei!", ["C01-EXERCICIO-02"], None),
    (["C01-DESAFIO-01"], "Durante Oi! x=10; ao terminar x=20", ["C01-DESAFIO-01-inicio", "C01-DESAFIO-01-final"], None),
    (["C02-CODIGO-01", "C02-MISSAO-01"], "Move, gira, move e desliza ao centro; final (0,0), direção 180", ["C02-CODIGO-01"], None),
    (["C02-EXERCICIO-01"], "Centro do ator em (200,150)", ["C02-EXERCICIO-01"], None),
    (["C02-EXERCICIO-02"], "Retorna a (0,0), direção final -90", ["C02-EXERCICIO-02"], None),
    (["C03-CODIGO-01", "C03-MISSAO-01"], "Trocas de fantasia e avanço observados; final x=100", ["C03-CODIGO-01"], None),
    (["C03-EXERCICIO-01"], "Pensamento Que dia lindo! e, após 3 segundos, fala Vamos brincar!", ["C03-EXERCICIO-01-pensamento", "C03-EXERCICIO-01-fala"], None),
    (["C03-EXERCICIO-02"], "Campo Size=200 e ator ampliado; depois Size=100 e tamanho restaurado", ["C03-EXERCICIO-02-200", "C03-EXERCICIO-02-final"], None),
    (["C03-EXERCICIO-03"], "Ator escondido no início; reaparece e termina visível após cinco ciclos", ["C03-EXERCICIO-03-escondido", "C03-EXERCICIO-03-final"], None),
    (["C03-DESAFIO-01"], "Laço terminou; gato com efeito de cor alterado", ["C03-DESAFIO-01"], None),
    (["C04-MISSAO-01", "C04-CODIGO-01"], "Com Miau de 0,85 s carregado, o clique executou a pilha iniciar som e mostrou Miau! sem esperar o fim da amostra", ["C04-miau-aba-sons", "C04-miau-balao"], None),
    (["C04-CODIGO-02"], "O monitor após cada bloco da extensão Música registrou 60, 62 e 64, na ordem", ["C04-notas-monitor"], None),
    (["C04-EXERCICIO-01"], "O monitor após toque até o fim registrou esperas de 0,848 s e 0,858 s em duas execuções com o Miau da biblioteca. O balão Pronto! veio depois", ["C04-espera-miau-antes", "C04-espera-miau-pronto", "C04-espera-miau-monitor"], None),
    (["C04-EXERCICIO-02"], "O monitor antes de cada toque registrou 100%, 80% e 60%. Depois da terceira redução, o volume ficou em 40%", ["C04-volume-miau-monitor"], None),
    (["C04-EXERCICIO-03"], "O monitor após cada bloco de Música registrou 67, 67, 69 e 67, na ordem", ["C04-parabens-monitor"], None),
    (["C04-DESAFIO-01"], "O monitor após cada bloco de tambor registrou oito mudanças de fantasia, alternando entre 2 e 1", ["C04-danca-monitor"], None),
    (["C05-MISSAO-01", "C05-CODIGO-01", "C05-CODIGO-02"], "O gato disse Oi! Tudo bem?; o amigo, representado por um robô, disse Tudo ótimo! depois da espera de dois segundos", ["C05-dialogo-gato", "C05-dialogo-amigo"], None),
    (["C05-EXERCICIO-01"], "Adicionei Beach Malibu pela biblioteca e selecionei o primeiro cenário. Logo após a bandeira, ainda aparecia início. Depois da espera, o palco mostrou Beach Malibu", ["C05-biblioteca-inicio", "C05-biblioteca-praia"], None),
    (["C05-EXERCICIO-02"], "Na orientação 90, o gato foi de x=-150 a x=-50 e o segundo ator disse Bem-vindo!. Com orientação 0, o gato manteve x=-150 e subiu até y=100. O amigo é um robô de teste", ["C05-dois-amigos-resultado", "C05-dois-amigos-direcao-zero"], "L02"),
    (["C05-EXERCICIO-03"], "Com os atores sobrepostos e gato inicialmente na frente, a bandeira fez o gato recuar uma camada. O robô passou a encobrir parte do gato", ["C05-camada-frente", "C05-camada-atras"], None),
    (["C05-DESAFIO-01"], "A história preparada começou em casa, mudou para festa e mostrou as duas falas criadas para a segunda cena. Ao clicar novamente na bandeira, a primeira fala saiu em festa e o próximo cenário voltou para casa", ["C05-historia-casa", "C05-historia-gato-na-festa", "C05-historia-amigo-na-festa", "C05-historia-reinicio", "C05-historia-reinicio-casa"], "L13"),
    (["C06-CODIGO-01", "C06-CODIGO-02", "C06-MISSAO-01"], "Com direção 90, direita leva x a 10 e esquerda retorna x a 0. Com direção 0, direita leva y a 10", ["C06-setas-direita", "C06-setas-esquerda", "C06-setas-direcao-alterada"], "L02"),
    (["C06-CODIGO-03"], "O gato disse Sua vez! e o ator Amigo respondeu Agora sou eu! ao receber a mensagem. Ambos usaram a fantasia padrão e ficaram separados no palco", ["C06-aviso-emissor", "C06-aviso-receptor"], None),
    (["C06-EXERCICIO-01"], "Clique no ator, sem bandeira, produz Ai! Você me clicou!", ["C06-EXERCICIO-01"], None),
    (["C06-EXERCICIO-02"], "Cima leva y a 10; baixo retorna y a 0", ["C06-EXERCICIO-02-cima", "C06-EXERCICIO-02-baixo"], None),
    (["C06-EXERCICIO-03"], "Com o Miau carregado no ator, Espaço executou a pilha de som e mostrou Pronto!", ["C06-espaco-miau-balao"], None),
    (["C06-DESAFIO-01"], "A fala 1!, depois B fala 2!, depois C fala 3! Foi!", ["C06-cadeia-inicio", "C06-cadeia-B", "C06-cadeia-final"], None),
    (["C07-CODIGO-01"], "Pilhas executadas separadamente: repita 4 encerrou em x=40; sempre continuou ativo na borda até o botão Parar", ["C07-repita-quatro-resultado", "C07-sempre-resultado"], None),
    (["C07-MISSAO-01", "C07-CODIGO-02"], "Na direção inicial 90, a patrulha mudou para -90 e depois voltou a 90. O gato apareceu de cabeça para baixo numa das viradas, como prevê o aviso sobre estilo de rotação", ["C07-patrulha-esquerda", "C07-patrulha-direita"], None),
    (["C07-CODIGO-03"], "No cenário de teste com parede em x=70, o gato ultrapassou o obstáculo e parou na borda, em x=195", ["C07-parede-resultado", "C07-parede-atingiu-borda"], "L18"),
    (["C07-EXERCICIO-01"], "Balões exibiram 3, 2, 1 e Já! na ordem", ["C07-contagem-3", "C07-contagem-2", "C07-contagem-1", "C07-contagem-ja"], None),
    (["C07-EXERCICIO-02"], "O gato ficou em (0,0) e a direção mudou de 120 para 160 durante a execução antes de pressionar Parar", ["C07-giro-inicio", "C07-giro-depois"], None),
    (["C07-EXERCICIO-03"], "Com Música habilitada a 60 bpm, o cronômetro registrou cinco inícios do bloco de tambor em 0, 0,817, 1,573, 2,333 e 3,093 s. A saída sonora não foi ouvida", ["C07-batidas-instantes"], "L19"),
    (["C07-DESAFIO-01"], "Partindo de x=120, o gato alternou fantasias durante a corrida e mostrou Cheguei! em x=200 ao alcançar a borda", ["C07-corrida-quadro-1", "C07-corrida-quadro-2", "C07-corrida-cheguei"], None),
    (["C08-CODIGO-02", "C08-MISSAO-01"], "Resposta Ana resulta em Olá, Ana, com espaço", ["C08-CODIGO-02"], None),
    (["C08-CODIGO-01"], "Ao posicionar o ponteiro longe do gato mediante clique no palco, não havia fala. Ao posicioná-lo sobre o gato, surgiu Ai!", ["C08-assustado-sem-ponteiro", "C08-assustado-no-ponteiro"], None),
    (["C08-EXERCICIO-01"], "Resposta à idade 10 é exibida no balão", ["C08-EXERCICIO-01"], None),
    (["C08-EXERCICIO-02"], "Em dois posicionamentos no palco, o gato ficou exatamente em (100,50) e (-50,-50), conforme os campos x e y", ["C08-segue-100", "C08-segue--50"], None),
    (["C08-EXERCICIO-03"], "Partindo em x=175, o gato disse Ui! em x=195 e depois voltou na direção -90", ["C08-borda-ui", "C08-borda-voltou"], None),
    (["C08-DESAFIO-01"], "Na faixa vermelha pura o gato falou Estou na cor vermelha!; saiu da faixa e o balão permaneceu, como informa a resolução. Na contraprova com diga vazio no senão, o balão sumiu ao sair", ["C08-vermelho-literal-dentro", "C08-vermelho-literal-fora", "C08-vermelho-com-senao-dentro", "C08-vermelho-com-senao-fora"], None),
    (["C09-CODIGO-01"], "As fantasias alternaram no laço enquanto x e y ficaram em zero", ["C09-animacao-quadro-1", "C09-animacao-quadro-2"], None),
    (["C09-CODIGO-02"], "A seta direita levou o gato de x=0 a x=10 e trocou a fantasia", ["C09-andar-antes", "C09-andar-direita"], None),
    (["C09-MISSAO-01", "C09-CODIGO-03"], "A esquerda levou a x=-10 e direção -90; a direita restaurou x=0 e direção 90. A fantasia mudou; a rotação padrão virou o gato de cabeça para baixo, como o capítulo explica", ["C09-lados-esquerda", "C09-lados-direita"], None),
    (["C09-EXERCICIO-01"], "Monitor de teste incrementado logo após próxima fantasia registrou dez trocas e a execução terminou", ["C09-danca-durante", "C09-danca-dez"], None),
    (["C09-EXERCICIO-02"], "O campo x atingiu 150 no primeiro deslize e voltou a 0 no segundo, com y=0", ["C09-deslize-direita", "C09-deslize-centro"], None),
    (["C09-EXERCICIO-03"], "Campo Size lido em 130 durante crescimento e em 100 após término. Leitura e captura podem ocorrer em quadros diferentes", ["C09-EXERCICIO-03-aumento", "C09-EXERCICIO-03-final"], None),
    (["C09-DESAFIO-01"], "Integrei as setas da missão e o pulo. Direita levou x a 10; esquerda trouxe x a 0; cima elevou y a 50 e voltou a 0. Com rotação esquerda-direita, o gato ficou em pé ao virar", ["C09-passeio-direita", "C09-passeio-esquerda", "C09-passeio-pulo", "C09-passeio-chao"], None),
    (["C10-CODIGO-01", "C10-CODIGO-03"], "Com o gato preparado em x=160, a bandeira ativou cena 1 e o escondeu. Ao trocar para cena 2, o gato apareceu, passou por x=60 e chegou a x=0", ["C10-cenas-antes", "C10-cenas-durante", "C10-cenas-depois"], None),
    (["C10-CODIGO-02"], "A disse Oi, tudo bem? e, ao terminar, B respondeu Tudo ótimo! na cena 1", ["C10-historia-fala-A", "C10-historia-fala-B"], None),
    (["C10-MISSAO-01"], "Montagem literal com os exemplos de Palco e falas exibiu a conversa na cena 1. Cena 2 abriu sem despedida. Acrescentar um receptor de cena 2 exibiu Até amanhã! no cenário correto", ["C10-historia-fala-A", "C10-historia-fala-B", "C10-historia-sem-despedida", "C10-historia-com-despedida"], "L12"),
    (["C10-EXERCICIO-01"], "Gato, deslocado para x=-104 no teste, disse Olá, amigo!; o ator Cachorro respondeu Au au! Oi!. Os dois usaram a fantasia padrão de gato no projeto importado", ["C10-gato-fala", "C10-cachorro-responde"], None),
    (["C10-EXERCICIO-02"], "Inicialmente o palco mostrou início. Após cinco segundos a mensagem praia acionou Chegamos à praia!. Na segunda bandeira, o cenário já estava em praia durante a espera e a fala repetiu após cinco segundos", ["C10-duas-cenas-antes", "C10-duas-cenas-reinicio", "C10-duas-cenas-fala"], "L13"),
    (["C10-EXERCICIO-03"], "Bandeira escondeu o gato em x=200. Usando um emissor de entrar acrescentado ao Palco para o teste, o gato apareceu, passou por x=167 e terminou em x=0", ["C10-surpresa-escondido", "C10-surpresa-durante", "C10-surpresa-centro"], None),
    (["C10-DESAFIO-01"], "Roteiro próprio com Gato e Robô desenhado. O navegador mostrou Praça, Jardim e Casa e as duas falas em cada cenário. A pilha independente chegou a uma volta da trilha de 10,14 s enquanto a terceira cena estava em execução", [f"C10-historia-{momento}" for momento in ("praca-gato", "praca-robo", "jardim-gato", "jardim-robo", "casa-gato", "casa-robo", "trilha-repetida")], None),
    (["C11-CODIGO-01"], "Com o gato em x=175 e direção 90, a execução virou para -90 perto da borda e voltou para o centro, com x medido em 115 e depois 60", ["C11-borda-virada", "C11-borda-retorno"], None),
    (["C11-CODIGO-02"], "Sem pressionar Espaço, o gato disse Solto!; com a tecla mantida pressionada, disse Apertado!", ["C11-espaco-solto", "C11-espaco-apertado"], None),
    (["C11-CODIGO-04"], "Na ordem do livro e na contraprova invertida, o primeiro balão apareceu só na combinação borda e tecla Espaço pressionada. Centro com ou sem Espaço e borda sem Espaço ficaram sem fala", [f"C11-{ordem}-{entrada}" for ordem in ("condicoes-encaixadas", "condicoes-invertidas") for entrada in ("centro-solto", "centro-chave", "borda-solto", "borda-chave")], "L14"),
    (["C11-EXERCICIO-01"], "No cenário preparado com branco e azul puro, x=0 produziu Dia de sol! e x=155 produziu Leve o guarda-chuva!", ["C11-guarda-sol", "C11-guarda-chuva-azul"], None),
    (["C11-EXERCICIO-02"], "Clique antes da bandeira não iniciou fala. Após iniciar, manter o botão apertado mostrou Clique! e soltá-lo mostrou Esperando...", ["C11-EXERCICIO-02-clique", "C11-EXERCICIO-02-bandeira", "C11-mouse-pressionado", "C11-mouse-solto"], "L03"),
    (["C11-EXERCICIO-03"], "Com direção inicial 90, o gato voltou da borda em pé, espelhado, na direção -90. Após parar e posicionar o gato em x=0, a bandeira manteve a direção -90 e o primeiro trecho foi para a esquerda", ["C11-ping-pong-virada", "C11-ping-pong-retorno", "C11-ping-pong-reinicio"], "L02"),
    (["C11-DESAFIO-01"], "Sem tecla, o gato disse Pare; com A manteve Atenção; com V manteve Pode ir. Capturas dos estados observados individualmente", ["C11-semaforo-pare", "C11-semaforo-atencao", "C11-semaforo-pode-ir"], None),
    (["C11-MISSAO-01", "C11-CODIGO-03"], "Com direção 90, segurar a direita 480 ms levou x de 0 a 75. Ao soltar, x permaneceu 75 e apareceu Parei. Com direção 0, a mesma tecla fez y subir de 0 a 80 e x permaneceu 75", ["C11-gato-parado-inicio", "C11-gato-parado-final", "C11-gato-direcao-zero"], "L02"),
    (["C12-MISSAO-01", "C12-CODIGO-01"], "Cliques no gato produziram resultados distintos dentro do intervalo, incluindo 3 e 5 nas capturas verificadas. Não mede a distribuição do sorteio", ["C12-dado-2", "C12-dado-3"], None),
    (["C12-EXERCICIO-01"], "Balão mostra 28 para 12+(8*2)", ["C12-EXERCICIO-01"], None),
    (["C12-EXERCICIO-02"], "17 produz Ainda não; 18 produz Pode entrar", ["C12-idade-17", "C12-idade-18"], None),
    (["C12-EXERCICIO-03"], "Com cliques no gato, observaram-se os dois ramos: Cara e Coroa", ["C12-moeda-2", "C12-moeda-3"], None),
    (["C12-DESAFIO-01"], "Em quatro partidas na mesma aba, 11 e 19 produziram Está na faixa!; 10 e 20 ficaram sem balão", ["C12-faixa-valor-10", "C12-faixa-valor-11", "C12-faixa-valor-19", "C12-faixa-valor-20"], None),
    (["C13-MISSAO-01", "C13-CODIGO-01"], "Após bandeira, três cliques no gato produziram 1, 2 e 3 pontos e nova bandeira zerou o placar. O som do trecho não foi verificado", ["C13-cliques-tres", "C13-cliques-zero"], None),
    (["C13-CODIGO-01"], "Três cliques subiram o placar e a bandeira zerou. Na segunda variante, Meow foi carregado como Miau de 0,85 s e o clique com essa amostra vinculada marcou um ponto", ["C13-cliques-tres", "C13-cliques-zero", "C13-cliques-com-som", "C13-cliques-aba-sons"], None),
    (["C13-CODIGO-02"], "Com as pilhas de placar e vitória reunidas, o décimo clique resultou em 10 pontos, a pilha parou sem balão visível e o clique seguinte pontuou 11", ["C13-dez-antes", "C13-dez-sem-balao", "C13-dez-depois"], "L07, L15"),
    (["C13-EXERCICIO-01"], "No centro, vidas iniciou em 3. Um só contato contínuo com a borda reduziu a 1 em cerca de 1,4 s e, em execução mais longa, chegou a -7. De volta ao centro, o valor deixou de cair", ["C13-vidas-centro", "C13-vidas-um-contato", "C13-vidas-contato-continuo"], "L16"),
    (["C13-EXERCICIO-02"], "O relógio iniciou em 10, chegou a zero e exibiu Acabou o tempo!", ["C13-tempo-dez", "C13-tempo-zero"], None),
    (["C13-EXERCICIO-03"], "Respostas 12 e 8 ficaram nas variáveis a e b e renderam o balão 20", ["C13-soma-vinte"], None),
    (["C13-DESAFIO-01"], "Quatro apertos produziram 4 pontos; o quinto marcou 5 sem balão e o sexto marcou 6 mesmo após Pare tudo. Inserir espera de dois segundos antes da parada tornou Vitória! visível", ["C13-cinco-aperto-4", "C13-cinco-aperto-5", "C13-cinco-aperto-6", "C13-cinco-com-espera"], "L07, L15"),
    (["C14-MISSAO-01", "C14-CODIGO-01", "C14-CODIGO-02"], "A bandeira carregou Maçã, Banana, Uva e Pera, com lista de comprimento 4. Um clique falou Pera e outros Uva. Nova bandeira manteve quatro entradas. O monitor da lista foi ativado no editor", ["C14-fruta-1", "C14-lista-e-sorteio", "C14-lista-apos-bandeira"], None),
    (["C14-EXERCICIO-01"], "Segundo nome da lista: Bruno", ["C14-EXERCICIO-01"], None),
    (["C14-EXERCICIO-02"], "Lista do exercício anterior, com 3 itens, resulta em balão 3", ["C14-EXERCICIO-02"], None),
    (["C14-EXERCICIO-03"], "Três respostas Ana, Bruno, Carla. Monitor da lista marcado manualmente para observação mostrou os três itens em ordem", ["C14-EXERCICIO-03"], None),
    (["C14-DESAFIO-01"], "Lista previamente preenchida: falas Ana, Bruno e Carla em sequência", ["C14-DESAFIO-01-Ana", "C14-DESAFIO-01-Bruno", "C14-DESAFIO-01"], None),
    (["C15-MISSAO-01", "C15-CODIGO-01", "C15-CODIGO-02"], "O original ficou escondido em y=170. Clones apareceram em posições diferentes e caíram. Em uma execução acompanhada, o primeiro nasceu em x=84, desceu na mesma coluna e desapareceu enquanto outros continuaram caindo. Parar removeu os clones", ["C15-chuva-em-queda", "C15-chuva-parada", "C15-chuva-primeira-maca", "C15-chuva-primeira-desce", "C15-chuva-primeira-sumiu"], None),
    (["C15-EXERCICIO-01"], "Um clique produziu um clone girado e deslocado; o gato original ficou em (0,0). O título sugere dois clones, embora o palco mostre o original e uma cópia", ["C15-dois-clones"], "L17"),
    (["C15-EXERCICIO-02"], "O clone criado por clique ainda estava visível logo após nascer e havia sumido após a espera de 3 segundos. O original permaneceu", ["C15-clone-presente", "C15-clone-removido"], None),
    (["C15-EXERCICIO-03"], "A bandeira criou cinco clones. Ao deslocar o original a x=230 depois do laço, ficaram visíveis cinco cópias e o original separado. As estrelas permaneceram visíveis, sem programação para piscar", ["C15-estrelas-antes", "C15-estrelas-depois"], "L17"),
    (["C15-DESAFIO-01"], "Em duas quedas controladas, uma maçã alinhada à cesta marcou o primeiro ponto; nas quedas fora da cesta, o total permaneceu zero. A cesta foi de x=0 a x=90 com seis setas direitas, usando os blocos do capítulo 17 para completar a montagem", ["C15-coleta-primeiro-ponto", "C15-coleta-pontua", "C15-queda-sem-ponto", "C15-cesta-direita"], None),
    (["C16-CODIGO-01", "C16-CODIGO-02"], "Definição e chamadas a quadrado executadas juntas: o gato terminou em (100,0), direção 90, sem traço. O deslocamento final corresponde ao avanço entre as duas chamadas", ["C16-quadrado-simples-resultado"], None),
    (["C16-MISSAO-01", "C16-CODIGO-03", "C16-CODIGO-04"], "Após chamadas com 40 e 100, o gato voltou ao ponto inicial e não deixou desenho. Com os mesmos movimentos e a Caneta abaixada, apareceram os dois quadrados, com um canto em comum", ["C16-quadrado-parametro-resultado", "C16-quadrados-com-caneta-resultado"], "L01"),
    (["C16-EXERCICIO-01"], "Seta para cima acionou pular. O campo y passou a 50 durante a espera e voltou a 0 ao terminar", ["C16-pulo-alto", "C16-pulo-chao"], None),
    (["C16-EXERCICIO-02"], "A chamada auxiliar executou triângulo com três movimentos de 80 e giros de 120. O gato voltou a (0,0), direção 90, sem desenhar no palco", ["C16-triangulo-resultado"], "L01"),
    (["C16-EXERCICIO-03"], "Com o monitor pontos habilitado, o primeiro clique levou a 5 e o segundo a 10", ["C16-pontos-clique-1", "C16-pontos-clique-2"], None),
    (["C16-DESAFIO-01"], "A chamada polígono (5) (60), indicada no texto, terminou em (0,0), direção 90, sem pentágono visível. O motor local registrou cinco movimentos e giros de 72 graus", ["C16-poligono-resultado"], "L01"),
    (["C18-CODIGO-01"], "Cadastro confirmado pelo quiz integrado que apresentou as três perguntas e aceitou as três respostas", ["C18-primeira-pergunta", "C18-integrado-todos-acertos"], None),
    (["C18-CODIGO-02", "C18-MISSAO-01"], "Pilhas separadas: perguntas não começam pela bandeira. Ligando O jogo ao cadastro: 4, brasília e 7 resultam em Você fez 3 pontos!", ["C18-pilhas-separadas", "C18-primeira-pergunta", "C18-integrado-todos-acertos"], "L04"),
    (["C18-EXERCICIO-01"], "O quiz integrado apresentou Quantos lados tem um triângulo? como quarta pergunta. Respostas 4, Brasília, 7 e 3 resultaram em quatro pontos", ["C18-quarta-pergunta-enunciado", "C18-quarta-pergunta-resultado"], None),
    (["C18-EXERCICIO-02"], "Em quiz de três perguntas, 4, Brasília e 7 exibiram Parabéns, você é demais!; na segunda partida, 4, Rio e 7 exibiram Tente de novo! com dois pontos", ["C18-vitoria-tres-acertos", "C18-vitoria-um-erro"], None),
    (["C18-EXERCICIO-03"], "Com Collect e Oops da biblioteca, as respostas 4, Rio e 7 passaram pelos blocos de som na ordem Collect, Oops, Collect", ["C18-quiz-sons-resultado"], None),
    (["C18-DESAFIO-01"], "O ator começou na fantasia triste preparada no projeto de teste, mudou para alegre aos três pontos e permaneceu alegre após nova bandeira, com zero pontos", ["C18-placar-inicial", "C18-placar-tres-pontos", "C18-placar-reinicio"], "L08"),
    (["C17-CODIGO-01", "C17-CODIGO-03", "C17-CODIGO-04", "C17-CODIGO-05"], "Partida original com posições aleatórias terminou em pontos 2 e vidas 0, cenário Fim de jogo selecionado. Em casos controlados, pegar aumenta pontos e perder maçãs reduz vidas. Setas da cesta: x=15 e retorno a x=0", ["C17-jogo-base-cenario-final", "C17-colisao-controlada", "C17-queda-controlada", "C17-setas"], None),
    (["C17-MISSAO-01", "C17-CODIGO-02"], "Nova bandeira após derrota reinicia vidas em 3, mas mantém o cenário Fim de jogo. O jogo funciona, porém falta restaurar o cenário inicial", ["C17-reinicio-cenario", "C17-jogo-base-cenario-final"], "L06"),
    (["C17-EXERCICIO-01"], "Em ensaio sem colisão, dez aplicações da fórmula a partir de y=170 levaram a y=140 com 0 pontos e a y=120 com 10 pontos. Cada pilha de teste foi iniciada por clique no editor", ["C17-velocidade-zero", "C17-velocidade-dez"], None),
    (["C17-EXERCICIO-02"], "Com a segunda fantasia fixada, as coletas reduziram vidas sem pontuar. Com sorteio entre fantasias 1 e 2 e maçãs alinhadas à cesta, uma partida terminou com 1 ponto e 0 vidas, exercitando os dois ramos", ["C17-podre-controlada", "C17-fantasias-sorteadas"], None),
    (["C17-EXERCICIO-03"], "Pop da biblioteca carregado na Maçã. Na queda alinhada à cesta, pontos e passagens pelo bloco Pop subiram juntos, com 13 de cada na leitura. Fora da cesta, ambos ficaram em zero até o fim das vidas", ["C17-pop-coleta-resultado", "C17-pop-sem-coleta-resultado", "C17-pop-biblioteca"], None),
    (["C17-DESAFIO-01"], "No protótipo com estrela e gato, errar todas as coletas encerrou a partida com vidas=0 e tempo=26. Com todas as estrelas alinhadas ao gato, o cronômetro chegou a 0 e preservou 29 pontos no monitor preparado", ["C17-tempo-vidas-zero", "C17-tempo-zero"], "L11"),
    (["C19-CODIGO-01"], "Quatro teclas movimentam cinco passos: direita (-195,150), cima (-195,155), esquerda (-200,155), baixo (-200,150). Percurso até a área verde feito pelo teclado", ["C19-quatro-setas", "C19-meta-sem-balao"], None),
    (["C19-MISSAO-01", "C19-CODIGO-02"], "Colisão com parede retorna a (-200,150); chegada à meta encerra a pilha, mas o balão Venci! não fica visível", ["C19-parede", "C19-meta-sem-balao"], "L07"),
    (["C19-CODIGO-03"], "Com reset no início e fala temporizada antes de parar, chegada controlada à meta exibiu Tempo: 0.697 no navegador", ["C19-cronometro-vitoria"], None),
    (["C19-EXERCICIO-01"], "Gato posicionado em (80,-130) no corredor livre. Conforme o fantasma se deslocou pelo corredor, o gato foi devolvido a (-200,150)", ["C19-fantasma-aproxima", "C19-fantasma-volta-inicio"], None),
    (["C19-EXERCICIO-02"], "Duas colocações controladas sobre a parede resultaram em batidas=2, sem reset indevido do contador; ator retornou ao início", ["C19-batidas"], None),
    (["C19-EXERCICIO-03"], "A partir de labirinto 1, após bandeira verde, a colocação controlada na meta (170,-130) ativou labirinto 2 e devolveu o gato a (-200,150). Nova bandeira manteve labirinto 2", ["C19-segunda-fase", "C19-segunda-fase-reinicio"], "L10"),
    (["C19-DESAFIO-01"], "Com a meta acionada pelos campos de posição, inicializar 999 na bandeira apagou o recorde de 0,848 s e aceitou 8,028 s na segunda tentativa. Inicializando 999 uma única vez, a segunda tentativa preservou o recorde de 0,8 s da primeira", ["C19-recorde-na-bandeira-primeira", "C19-recorde-na-bandeira-segunda-inicio", "C19-recorde-na-bandeira-segunda-final", "C19-recorde-uma-vez-primeira", "C19-recorde-uma-vez-segunda-final"], "L09"),
    (["C20-EXERCICIO-01"], "No protótipo, a bandeira exibiu Corrida do gato e o aviso Aperte espaço para começar. Com foco no palco, segurar Espaço por 240 ms mudou o cenário de início para jogo e acionou o receptor que zerou os pontos e restaurou a posição", ["C20-tela-inicio", "C20-tela-jogo"], None),
    (["C20-EXERCICIO-02"], "Com foco no palco, R manteve pontos=9 e x=80 na pilha da resolução. Na contraprova com receptor, a seta direita elevou pontos a 10 e x a 90; R restaurou ambos a 0", ["C20-reinicio-literal", "C20-reinicio-contraprova"], "L05"),
    (["C20-MISSAO-01", "C20-DESAFIO-01"], "Corrida local entre Gato (A) e Robô (L). Espaço abriu a pista, ambos os atores venceram em partidas diferentes, teclas de movimento ficaram inativas no menu e após a vitória, R reiniciou a disputa e a bandeira restaurou o menu. Teste funcional feito pelo agente", ["C20-corrida-menu-teclas", "C20-corrida-largada", "C20-corrida-gato-venceu", "C20-corrida-entrada-bloqueada", "C20-corrida-reiniciada", "C20-corrida-robo-venceu", "C20-corrida-bandeira-menu"], None),
]

for relative, expected in inventory["fontes_sha256"].items():
    assert hashlib.sha256((ROOT / relative).read_bytes()).hexdigest() == expected, relative

by_id = {entry["item"]: entry for entry in registry["resultados"]}
valid_ids = {entry["id"] for entry in inventory["itens"]}
for ids, observed, pictures, gap in batch:
    images = [f"tmp/testes-scratch/{name}.jpg" for name in pictures]
    for image in images:
        assert (ROOT / image).is_file(), image
    for item_id in ids:
        assert item_id in valid_ids, item_id
        by_id[item_id] = {
            "item": item_id,
            "metodo": "Importação de .sb3 com blocos transcritos do livro; operação pela interface e leitura de campos DOM e screenshots. Não usa acesso à VM interna do navegador.",
            "observado": observed,
            "status": "lacuna_confirmada_no_navegador" if gap else "execucao_observada_no_navegador",
            "lacuna": gap,
            "imagens": images,
            "limite": "Evidência da execução descrita. Não comprova todas as instruções de criação na interface, nem qualidade pedagógica.",
        }
        if item_id in audio_projects:
            renderings = [audio_results.get(project) for project in audio_projects[item_id]]
            complete = all(r and "observacao" not in r for r in renderings)
            if complete:
                by_id[item_id]["audio"] = {
                    "metodo": "Sinal digital verificado em WAV gerado pelo motor Scratch, sem medição dos alto-falantes.",
                    "arquivos": [r["arquivo"] for r in renderings],
                }
                if not gap:
                    by_id[item_id]["status"] = "execucao_observada_com_audio_local"
            else:
                if not gap:
                    by_id[item_id]["status"] = "execucao_parcial_no_navegador"
                by_id[item_id]["pendente"] = "Verificar o sinal de áudio completo."
        if item_id in {"C20-MISSAO-01", "C20-DESAFIO-01"}:
            by_id[item_id]["status"] = "execucao_parcial_no_navegador"
            externo = "Compartilhar no Scratch. Para o desafio, coletar retorno de três jogadores e verificar uma melhoria baseada nas sugestões."
            by_id[item_id]["pendente"] = " ".join(filter(None, (by_id[item_id].get("pendente"), externo)))
registry["resultados"] = sorted(by_id.values(), key=lambda x: x["item"])
registry["fontes_sha256"] = inventory["fontes_sha256"]
registry["nota_preparacao"] = "Projetos importados usam os gatos SVG do repositório, fantasias nominais e cenários auxiliares identificados por texto. Monitores inicialmente ocultos; quando necessários são ativados na interface. Essa preparação não valida as instruções de criação dos assets ou o estado padrão de monitores recém-criados."
(OUT / "resultados-navegador.json").write_text(json.dumps(registry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
observed_ids = set(by_id)
lines = ["# Cobertura da validação", "", f"Execução observada no navegador: **{len(observed_ids)} de {len(valid_ids)} itens**.", "", "O registro inclui áudio renderizado localmente e etapas externas ainda em aberto. Veja os limites por evidência.", "", "| Item | Atividade | Resultado |", "|---|---|---|"]
for item in inventory["itens"]:
    status = by_id.get(item["id"], {}).get("status", "pendente")
    lines.append(f"| {item['id']} | {item['titulo']} | {status} |")
(OUT / "COBERTURA.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"Itens com execução observada no navegador: {len(observed_ids)}/{len(valid_ids)}")
