// Montagens de referência a partir dos trechos e instruções de integração do livro.
const {stacks}=require('./runtime.cjs');
const n=(op,inputs={})=>({op,inputs});
const basket='<svg xmlns="http://www.w3.org/2000/svg" width="60" height="24"><path d="M2 2H58L50 22H10Z" fill="#a96321" stroke="#603500" stroke-width="2"/></svg>';
const apple='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="28"><path d="M13 7Q12 0 18 1" fill="none" stroke="#347b24" stroke-width="3"/><circle cx="12" cy="16" r="10" fill="#e63331"/></svg>';
const badApple=apple.replace('#e63331','#75513a');
const maze='<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="white"/><path d="M130 0V230H290V100H400V250" fill="none" stroke="#000000" stroke-width="20"/><rect x="380" y="280" width="60" height="60" fill="#00ff00"/></svg>';
const maze2=maze.replace('M130 0V230H290V100H400V250','M150 0V230H300V100H400V250');
const assetsColeta={Cesta:[{svg:basket,cx:30,cy:12}],Maçã:[{svg:apple,cx:12,cy:14},{svg:badApple,cx:12,cy:14}]};
const coleta=()=>[
 {name:'Cesta',stacks:stacks('C17-CODIGO-01')},
 {name:'Stage',stacks:[...stacks('C17-CODIGO-02'),...stacks('C17-CODIGO-05')]},
 {name:'Maçã',stacks:[...stacks('C17-CODIGO-03'),...stacks('C17-CODIGO-04')]}
];
const coletaOptions={backdrops:['Jogo','Fim de jogo'],costumes:['boa','podre']};
function forceX(actors,x){actors.find(a=>a.name==='Maçã').stacks[0][2].body[0].inputs.X=String(x);}
function monitors(data){
 const stage=data.targets.find(t=>t.isStage);
 Object.entries(stage.variables).forEach(([id,[name,v]],i)=>{
  data.monitors.push({id,mode:'default',opcode:'data_variable',params:{VARIABLE:name},spriteName:null,value:v,width:0,height:0,x:5,y:5+i*27,visible:true,sliderMin:0,sliderMax:100,isDiscrete:true});
 });
}
function monitorList(data,name){
 data.monitors.push({id:`LIST:${name}`,mode:'list',opcode:'data_listcontents',params:{LIST:name},spriteName:null,value:[],width:152,height:210,x:5,y:5,visible:true});
}
const baseRefs=['C17-MISSAO-01',...Array.from({length:5},(_,i)=>'C17-CODIGO-0'+(i+1))];
const games=[{id:'C17-jogo-base',refs:baseRefs,actors:coleta(),options:coletaOptions,assets:assetsColeta,prepare:monitors,adaptacoes:['Cesta e maçã desenhadas em SVG para os atores que o livro pede escolher/desenhar.','Cenários Jogo e Fim de jogo preparados; sem alterações na lógica.']}];

const robo='<svg xmlns="http://www.w3.org/2000/svg" width="88" height="100"><rect x="9" y="12" width="70" height="78" rx="12" fill="#42afbe" stroke="#135b66" stroke-width="4"/><circle cx="32" cy="43" r="5" fill="#123e46"/><circle cx="58" cy="43" r="5" fill="#123e46"/><path d="M29 63H61" stroke="#123e46" stroke-width="4"/><path d="M44 12V2" stroke="#135b66" stroke-width="4"/></svg>';
const amigoAssets={Amigo:[{svg:robo,cx:44,cy:50}]};
const dialogo5=()=>[
 {name:'Gato',initial:{x:-95},stacks:stacks('C05-CODIGO-01')},
 {name:'Amigo',initial:{x:95},stacks:stacks('C05-CODIGO-02')},
];
games.push({id:'C05-dialogo-distinto',refs:['C05-MISSAO-01','C05-CODIGO-01','C05-CODIGO-02'],actors:dialogo5(),assets:amigoAssets,adaptacoes:['Atores separados no palco e fantasia de robô para distinguir o amigo.']});
const festa=dialogo5();
for(const [actor,fala] of [[festa[0],'Chegamos à festa!'],[festa[1],'Vamos brincar!']]){
 actor.stacks[0].push(n('control_wait',{DURATION:'6'}),n('looks_sayforsecs',{MESSAGE:fala,SECS:'2'}));
}
festa.push({name:'Stage',stacks:stacks('C05-DESAFIO-01')});
games.push({id:'C05-historia-dupla',refs:['C05-DESAFIO-01'],actors:festa,options:{backdrops:['casa','festa']},assets:amigoAssets,adaptacoes:['Robô desenhado para o exemplo. Em cada ator, a espera de seis segundos vem após a fala inicial; falas criadas para a segunda cena.']});
games.push({id:'C05-cenario-biblioteca',refs:['C05-EXERCICIO-01'],actors:[{name:'Gato',stacks:[]},{name:'Stage',stacks:stacks('C05-EXERCICIO-01')}],options:{backdrops:['início']},adaptacoes:['Um cenário inicial, para adicionar o segundo pela biblioteca do editor.']});
const doisAmigos5=stacks('C05-EXERCICIO-02');
games.push({id:'C05-dois-amigos-distintos',refs:['C05-EXERCICIO-02'],actors:[{name:'Gato',initial:{x:-150},stacks:[doisAmigos5[0]]},{name:'Amigo',initial:{x:100},stacks:[doisAmigos5[1]]}],assets:amigoAssets,adaptacoes:['Atores separados em posições iniciais observáveis.']});
games.push({id:'C05-camadas',refs:['C05-EXERCICIO-03'],actors:[{name:'Amigo',initial:{x:13},stacks:[]},{name:'Gato',stacks:stacks('C05-EXERCICIO-03')}],assets:amigoAssets,adaptacoes:['Gato começa na camada da frente; atores se sobrepõem parcialmente para revelar a troca.']});

const paredeInterna='<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="white"/><path d="M310 0V360" stroke="#30394d" stroke-width="12"/></svg>';
for(const [id,item,initial,assets,indice] of [
 ['C07-repita-quatro','C07-CODIGO-01',{},undefined,0],
 ['C07-sempre','C07-CODIGO-01',{},undefined,1],
 ['C07-patrulha','C07-CODIGO-02',{x:155},undefined],
 ['C07-parede','C07-CODIGO-03',{}, {Stage:[{svg:paredeInterna,cx:240,cy:180}]}],
 ['C07-corrida','C07-DESAFIO-01',{x:120},undefined],
]){
 const pilhas=stacks(item,indice===undefined?undefined:[indice]);
 games.push({id,refs:id==='C07-patrulha'?['C07-MISSAO-01',item]:[item],actors:[{name:'Gato',initial,stacks:pilhas}],assets,adaptacoes:['Cada comportamento executado isoladamente, com posição inicial indicada no projeto.']});
}
const batidas7=stacks('C07-EXERCICIO-03');
const batidas7Loop=batidas7[0][1];
batidas7Loop.body[0].inputs.DRUM='1';
batidas7Loop.body.unshift(n('data_addtolist',{LIST:'instantes',ITEM:n('sensing_timer')}));
batidas7[0].splice(1,0,n('data_deletealloflist',{LIST:'instantes'}),n('sensing_resettimer'));
function monitorBatidas(data){
 data.extensions.push('music');
 monitorList(data,'instantes');
}
games.push({id:'C07-batidas-medidas',refs:['C07-EXERCICIO-03'],actors:[{name:'Gato',stacks:batidas7}],prepare:monitorBatidas,adaptacoes:['Extensão Música habilitada e tambor 1 selecionado. Um cronômetro registra o início de cada iteração imediatamente antes do bloco de tambor. Tempo padrão de 60 bpm.']});

const miau4={Gato:{Miau:'Meow'}};
for(const [id,item] of [['C04-miau','C04-CODIGO-01'],['C04-espera-miau','C04-EXERCICIO-01'],['C04-volume-miau','C04-EXERCICIO-02'],['C06-espaco-miau','C06-EXERCICIO-03'],['C13-cliques-com-som','C13-CODIGO-01']]){
 const pilhas=stacks(item);
 if(id==='C04-espera-miau'){
  pilhas[0].splice(1,0,n('sensing_resettimer'));
  pilhas[0].splice(3,0,n('data_setvariableto',{VARIABLE:'espera',VALUE:n('sensing_timer')}));
 }
 if(id==='C04-volume-miau'){
  const laco=pilhas[0].find(block=>block.op==='control_repeat');
  laco.body.unshift(n('data_addtolist',{LIST:'volumes',ITEM:n('sound_volume')}));
  pilhas[0].splice(1,0,n('data_deletealloflist',{LIST:'volumes'}));
  pilhas[0].push(n('data_setvariableto',{VARIABLE:'volume final',VALUE:n('sound_volume')}));
 }
 const refs=id==='C04-miau'?['C04-MISSAO-01',item]:[item];
 games.push({id,refs,actors:[{name:'Gato',stacks:pilhas}],sounds:miau4,prepare:data=>{monitors(data);if(id==='C04-volume-miau')monitorList(data,'volumes');},adaptacoes:['Miau é o som Meow da biblioteca oficial, com nome igual ao livro. Os monitores de teste exibem pontos, tempo de espera ou volume quando aplicáveis.']});
}
for(const [id,item] of [['C04-notas','C04-CODIGO-02'],['C04-parabens','C04-EXERCICIO-03'],['C04-danca','C04-DESAFIO-01']]){
 const pilhas=stacks(item);
 const blocoNotas=pilhas[0];
 let observacao='notas';
 if(id==='C04-danca'){
  observacao='batidas';
  const laco=blocoNotas.find(block=>block.op==='control_repeat');
  laco.body[0].inputs.DRUM='1';
  laco.body.push(n('data_addtolist',{LIST:observacao,ITEM:n('looks_costumenumbername')}));
 }else{
  const notas=blocoNotas.splice(1);
  for(const nota of notas){
   blocoNotas.push(nota,n('data_addtolist',{LIST:observacao,ITEM:nota.inputs.NOTE}));
  }
 }
 blocoNotas.splice(1,0,n('data_deletealloflist',{LIST:observacao}));
 games.push({id,refs:[item],actors:[{name:'Gato',stacks:pilhas}],options:{costumes:['passo 1','passo 2']},prepare:data=>{data.extensions.push('music');monitorList(data,observacao);},adaptacoes:['O monitor de teste anota a conclusão de cada bloco de nota ou, no desafio, a fantasia após cada batida.']});
}

const faixaVermelha='<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="white"/><rect x="330" width="150" height="360" fill="#ff0000"/></svg>';
const cor8Assets={Stage:[{svg:faixaVermelha,cx:240,cy:180}]};
for(const [id,item,initial,assets] of [
 ['C08-assustado','C08-CODIGO-01',{},undefined],
 ['C08-borda','C08-EXERCICIO-03',{x:175},undefined],
 ['C08-vermelho','C08-DESAFIO-01',{},cor8Assets],
]){
 games.push({id,refs:[item],actors:[{name:'Gato',initial,stacks:stacks(item)}],assets,adaptacoes:['Posição inicial e, quando necessário, cenário de teste para acionar o sensor.']});
}
const cor8ComLimpeza=stacks('C08-DESAFIO-01');
const condicaoCor=cor8ComLimpeza[0][1].body[0];
condicaoCor.op='control_if_else';
condicaoCor.else=[n('looks_say',{MESSAGE:''})];
games.push({id:'C08-vermelho-limpa',refs:['C08-DESAFIO-01'],actors:[{name:'Gato',stacks:cor8ComLimpeza}],assets:cor8Assets,adaptacoes:['Contraprova com diga vazio no senão, conforme a dica textual da resolução.']});

const fantasias9={costumes:['passo 1','passo 2']};
const passos9=()=>stacks('C09-CODIGO-03');
games.push({id:'C09-passeio-integrado',refs:['C09-DESAFIO-01'],actors:[{name:'Gato',stacks:[...passos9(),...stacks('C09-DESAFIO-01')],initial:{rotationStyle:'left-right'}}],options:fantasias9,adaptacoes:['Setas horizontais da missão, pulo do desafio e estilo de rotação esquerda-direita, conforme o aviso do capítulo.']});
const danca9=stacks('C09-EXERCICIO-01');
danca9[0][1].body.splice(1,0,n('data_changevariableby',{VARIABLE:'trocas',VALUE:'1'}));
danca9[0].splice(1,0,n('data_setvariableto',{VARIABLE:'trocas',VALUE:'0'}));
games.push({id:'C09-danca-contada',refs:['C09-EXERCICIO-01'],actors:[{name:'Gato',stacks:danca9}],options:fantasias9,prepare:monitors,adaptacoes:['Monitor de observação conta uma troca após cada execução de próxima fantasia, sem mudar as pausas.']});

const historia=()=>[
 {name:'Stage',stacks:stacks('C10-CODIGO-01')},
 {name:'A',initial:{x:-100},stacks:stacks('C10-CODIGO-02',[0])},
 {name:'B',initial:{x:100},stacks:stacks('C10-CODIGO-02',[1])},
];
games.push({id:'C10-historia-literal',refs:['C10-MISSAO-01','C10-CODIGO-02'],actors:historia(),adaptacoes:['Cenários de teste e atores A e B separados no palco. Blocos do Palco e das falas conforme impressos.']});
const historiaCompleta=historia();
historiaCompleta[1].stacks.push([n('event_whenbroadcastreceived',{BROADCAST_OPTION:'cena 2'}),n('looks_say',{MESSAGE:'Até amanhã!'})]);
games.push({id:'C10-historia-com-despedida',refs:['C10-MISSAO-01'],actors:historiaCompleta,adaptacoes:['Contraprova: A recebe a mensagem cena 2 do Palco e se despede.']});

const entrada=stacks('C10-EXERCICIO-03');
const aviso=[n('event_whenkeypressed',{KEY_OPTION:'e'}),n('event_broadcast',{BROADCAST_INPUT:'entrar'})];
games.push({id:'C10-chegou-de-surpresa',refs:['C10-EXERCICIO-03'],actors:[{name:'Stage',stacks:[aviso]},{name:'Gato',stacks:entrada}],adaptacoes:['Pilha auxiliar no Palco envia entrar pela tecla E. Os blocos do ator seguem a resolução do exercício.']});

const roteiro10=[
 {cena:'Praça',fundo:'#e6f9eb',gato:'Vamos procurar o jardim?',robo:'Vou mostrar o caminho.'},
 {cena:'Jardim',fundo:'#eaf1ff',gato:'Achamos as flores!',robo:'Vamos regar antes de ir.'},
 {cena:'Casa',fundo:'#fff3df',gato:'Até amanhã, Robô!',robo:'Até amanhã, Gato!'},
];
const fundos10=roteiro10.map(cena=>({svg:`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="${cena.fundo}"/><text x="240" y="60" text-anchor="middle" font-family="sans-serif" font-size="27" fill="#25314a">${cena.cena}</text></svg>`,cx:240,cy:180}));
const palco10=[n('event_whenflagclicked')];
for(const [i,cena] of roteiro10.entries()){
 if(i>0)palco10.push(n('control_wait',{DURATION:'4'}));
 palco10.push(n('looks_switchbackdropto',{BACKDROP:cena.cena}),n('event_broadcast',{BROADCAST_INPUT:cena.cena}));
}
const trilha10=[n('event_whenflagclicked'),n('data_setvariableto',{VARIABLE:'voltas da trilha',VALUE:'0'}),
 {op:'control_forever',inputs:{},body:[n('sound_playuntildone',{SOUND_MENU:'Música'}),n('data_changevariableby',{VARIABLE:'voltas da trilha',VALUE:'1'})]},
];
const gato10={name:'Gato',initial:{x:-104,y:0},stacks:roteiro10.map(cena=>[
 n('event_whenbroadcastreceived',{BROADCAST_OPTION:cena.cena}),n('looks_sayforsecs',{MESSAGE:cena.gato,SECS:'1.5'}),
])};
const robo10={name:'Robô',initial:{x:104,y:0},stacks:roteiro10.map(cena=>[
 n('event_whenbroadcastreceived',{BROADCAST_OPTION:cena.cena}),n('control_wait',{DURATION:'1.65'}),n('looks_sayforsecs',{MESSAGE:cena.robo,SECS:'1.5'}),
])};
games.push({id:'C10-historia-com-musica',refs:['C10-DESAFIO-01'],actors:[gato10,robo10,{name:'Stage',stacks:[palco10,trilha10]}],options:{backdrops:roteiro10.map(cena=>cena.cena)},assets:{Stage:fundos10,Robô:amigoAssets.Amigo},sounds:{Stage:{Música:'Dance Chill Out'}},prepare:monitors,adaptacoes:['Roteiro próprio: Praça, Jardim e Casa. Gato pergunta ou comenta; Robô responde depois. Robô é um ator desenhado para o teste.','Faixa Dance Chill Out em uma pilha independente de som até o fim. Monitor chamado voltas da trilha registra as iterações concluídas.']});

const chuva='<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="white"/><rect x="330" width="150" height="360" fill="#0000ff"/></svg>';
games.push({id:'C11-guarda-chuva',refs:['C11-EXERCICIO-01'],actors:[{name:'Gato',stacks:stacks('C11-EXERCICIO-01')}],assets:{Stage:[{svg:chuva,cx:240,cy:180}]},adaptacoes:['Cenário de teste com uma região azul e outra branca. A posição é controlada pelos campos do editor.']});
for(const [id,item] of [['C11-borda','C11-CODIGO-01'],['C11-ping-pong','C11-EXERCICIO-03']]){
 games.push({id,refs:[item],actors:[{name:'Gato',initial:{x:175,direction:90},stacks:stacks(item)}],adaptacoes:['O gato começa perto da borda direita, orientado a 90 graus.']});
}
for(const [id,inverter] of [['C11-condicoes-encaixadas',false],['C11-condicoes-invertidas',true]]){
 const pilhas=stacks('C11-CODIGO-04');
 const externo=pilhas[0][1].body[0];
 if(inverter){
  const interno=externo.body[0];
  [externo.inputs.CONDITION,interno.inputs.CONDITION]=[interno.inputs.CONDITION,externo.inputs.CONDITION];
 }
 games.push({id,refs:['C11-CODIGO-04'],actors:[{name:'Gato',stacks:pilhas}],adaptacoes:[inverter?'Contraprova: inverte somente as condições da borda e da tecla.':'Condições mantidas na ordem do livro.']});
}

for(const [id,refs,pilhas] of [
 ['C13-cliques',['C13-MISSAO-01','C13-CODIGO-01'],stacks('C13-CODIGO-01')],
 ['C13-vitoria-dez',['C13-CODIGO-02'],[...stacks('C13-CODIGO-01'),...stacks('C13-CODIGO-02')]],
 ['C13-vitoria-cinco',['C13-DESAFIO-01'],stacks('C13-DESAFIO-01')],
 ['C13-vidas',['C13-EXERCICIO-01'],stacks('C13-EXERCICIO-01')],
 ['C13-tempo',['C13-EXERCICIO-02'],stacks('C13-EXERCICIO-02')],
 ['C13-soma',['C13-EXERCICIO-03'],stacks('C13-EXERCICIO-03')],
]){
 games.push({id,refs,actors:[{name:'Gato',stacks:pilhas}],prepare:monitors,adaptacoes:['Monitores de variáveis habilitados para observação.']});
}
const vitoriaCincoComEspera=stacks('C13-DESAFIO-01');
const blocoVitoriaCinco=vitoriaCincoComEspera[1].find(block=>block.op==='control_if');
blocoVitoriaCinco.body.splice(1,0,n('control_wait',{DURATION:'2'}));
games.push({id:'C13-vitoria-cinco-espera',refs:['C13-DESAFIO-01'],actors:[{name:'Gato',stacks:vitoriaCincoComEspera}],prepare:monitors,adaptacoes:['Contraprova: espera 2 segundos entre dizer Vitória! e parar tudo.']});

const chamadasQuadrados=stacks('C16-CODIGO-04');
chamadasQuadrados[0].splice(1,0,n('pen_clear'),n('pen_penDown'));
chamadasQuadrados[0].push(n('pen_penUp'));
games.push({id:'C16-quadrados-com-caneta',refs:['C16-MISSAO-01','C16-CODIGO-03','C16-CODIGO-04'],actors:[{name:'Gato',stacks:[...stacks('C16-CODIGO-03'),...chamadasQuadrados]}],prepare:data=>data.extensions.push('pen'),adaptacoes:['Contraprova com a extensão Caneta: limpar e baixar antes das chamadas quadrado 40 e quadrado 100; levantar ao final. Os movimentos da definição ficam intactos.']});
games.push({id:'C16-pontos',refs:['C16-EXERCICIO-03'],actors:[{name:'Gato',stacks:stacks('C16-EXERCICIO-03')}],prepare:monitors,adaptacoes:['Monitor da variável pontos habilitado para observação.']});
for(const [id,x]of[['C17-colisao-controlada',0],['C17-queda-controlada',150]]){
 const actors=coleta();forceX(actors,x);
 games.push({id,refs:baseRefs,actors,options:coletaOptions,assets:assetsColeta,prepare:monitors,adaptacoes:[`Teste de ramo: posição de nascimento fixada em x=${x} no lugar do sorteio para tornar a colisão/queda repetível. Não valida a aleatoriedade.`,`Mesmos blocos de coleta, vidas e fim de jogo do exemplo base.`]});
}
for(const [id,x] of [['C17-pop-coleta',0],['C17-pop-sem-coleta',150]]){
 const actors=coleta();
 forceX(actors,x);
 const maca=actors.find(actor=>actor.name==='Maçã');
 const capturada=maca.stacks[1].find(block=>block.op==='control_repeat_until').body.find(block=>block.op==='control_if');
 const indiceApagar=capturada.body.findIndex(block=>block.op==='control_delete_this_clone');
 capturada.body.splice(indiceApagar,0,...stacks('C17-EXERCICIO-03')[0],n('data_changevariableby',{VARIABLE:'acionamentos Pop',VALUE:'1'}));
 const palco=actors.find(actor=>actor.name==='Stage');
 palco.stacks[0].push(n('data_setvariableto',{VARIABLE:'acionamentos Pop',VALUE:'0'}));
 games.push({id,refs:['C17-EXERCICIO-03'],actors,options:coletaOptions,assets:assetsColeta,sounds:{Maçã:{Pop:'Pop'}},prepare:monitors,adaptacoes:[`A maçã nasce em x=${x}. O monitor conta passagens pelo bloco de som imediatamente antes de apagar o clone.`]});
}
const rotten=coleta();forceX(rotten,0);
const cloneStack=rotten.find(a=>a.name==='Maçã').stacks[1];
cloneStack.splice(1,0,n('looks_switchcostumeto',{COSTUME:'2'}));
const caught=cloneStack.find(b=>b.op==='control_repeat_until').body.find(b=>b.op==='control_if');
caught.body=[{op:'control_if_else',inputs:{CONDITION:n('operator_equals',{OPERAND1:n('looks_costumenumbername'),OPERAND2:'2'})},body:[n('data_changevariableby',{VARIABLE:'vidas',VALUE:'-1'})],else:[n('data_changevariableby',{VARIABLE:'pontos',VALUE:'1'})]},n('control_delete_this_clone')];
games.push({id:'C17-podre-controlada',refs:['C17-EXERCICIO-02'],actors:rotten,options:coletaOptions,assets:assetsColeta,prepare:monitors,adaptacoes:['Fantasia 2 e x=0 fixados para testar ramo podre.','Condição de fantasia transcrita do texto da resolução e encaixada na colisão, como orientado.']});

const sorteioFantasia=structuredClone(rotten);
const pilhaSorteio=sorteioFantasia.find(actor=>actor.name==='Maçã').stacks[1];
const trechosFantasia=stacks('C17-EXERCICIO-02')[0];
pilhaSorteio[1]=trechosFantasia.find(block=>block.op==='looks_switchcostumeto');
games.push({id:'C17-fantasias-sorteadas',refs:['C17-EXERCICIO-02'],actors:sorteioFantasia,options:coletaOptions,assets:assetsColeta,prepare:monitors,adaptacoes:['Mantém x=0 para que todas as maçãs caiam na cesta e restaura o sorteio entre as fantasias 1 e 2 conforme a resolução.']});

const [quedaComPontos]=stacks('C17-EXERCICIO-01')[0];
const ensaioVelocidade=[0,10].map(pontos=>[
 n('event_whenkeypressed',{KEY_OPTION:pontos===0?'0':'1'}),
 n('data_setvariableto',{VARIABLE:'pontos',VALUE:String(pontos)}),
 n('motion_gotoxy',{X:'0',Y:'170'}),
 {op:'control_repeat',inputs:{TIMES:'10'},body:[structuredClone(quedaComPontos)]},
]);
games.push({id:'C17-velocidade',refs:['C17-EXERCICIO-01'],actors:[{name:'Maçã',stacks:ensaioVelocidade}],options:coletaOptions,assets:assetsColeta,prepare:monitors,adaptacoes:['Teste controlado: 0 e 1 no teclado fixam, respectivamente, 0 e 10 pontos e aplicam 10 vezes o bloco de queda da resolução, a partir de y=170. Não usa colisões.']});

const estrela='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="28"><path d="M12 2l3 8 8 1-6 5 2 8-7-5-7 5 2-8-6-5 8-1Z" fill="#ffbd21" stroke="#b06b00"/></svg>';
const fabrica15=()=>stacks('C15-CODIGO-01');
const chuva15=[{name:'Maçã',stacks:[...fabrica15(),...stacks('C15-CODIGO-02')]}];
games.push({id:'C15-chuva',refs:['C15-MISSAO-01','C15-CODIGO-01','C15-CODIGO-02'],actors:chuva15,assets:assetsColeta,adaptacoes:['Fantasia de maçã acrescida. Os blocos do original e do clone seguem a missão.']});
games.push({id:'C15-estrelas',refs:['C15-EXERCICIO-03'],actors:[{name:'Estrela',stacks:stacks('C15-EXERCICIO-03')}],assets:{Estrela:[{svg:estrela,cx:12,cy:14}]},adaptacoes:['Fantasia de estrela como no título do exercício. Sem mudanças nas pilhas.']});
for(const [id,x] of [['C15-cesta-pega',0],['C15-cesta-perde',150]]){
 const actors=[
  {name:'cesta',stacks:stacks('C17-CODIGO-01')},
  {name:'Maçã',stacks:[...fabrica15(),...stacks('C15-DESAFIO-01')]},
 ];
 forceX(actors,x);
 games.push({id,refs:['C15-DESAFIO-01'],actors,assets:{cesta:assetsColeta.Cesta,Maçã:assetsColeta.Maçã},prepare:monitors,adaptacoes:[`Cesta usa a movimentação por setas do capítulo 17 para completar o desafio aberto. O ramo do clone substitui a pilha original de queda. Nascimento fixado em x=${x} para controlar colisão ou queda.`]});
}
for(const [id,x] of [['C17-tempo-sem-coletas',150],['C17-tempo-com-coletas',0]]){
 const actors=coleta();
 forceX(actors,x);
 actors.find(actor=>actor.name==='Stage').stacks.push(...stacks('C17-DESAFIO-01'));
 const coletor=actors.find(actor=>actor.name==='Cesta');
 const item=actors.find(actor=>actor.name==='Maçã');
 const laco=item.stacks[1].find(block=>block.op==='control_repeat_until');
 laco.body.find(block=>block.op==='control_if').inputs.CONDITION.inputs.TOUCHINGOBJECTMENU='Gato';
 coletor.name='Gato';
 item.name='Estrela';
 games.push({id,refs:['C17-DESAFIO-01'],actors,options:coletaOptions,assets:{Estrela:[{svg:estrela,cx:12,cy:14}]},prepare:monitors,adaptacoes:[`Gato coletor e estrela, com x=${x} fixado para repetir o ramo. O cronômetro é acrescentado no Palco, preservando a regra de vidas do jogo original.`,`Monitores de tempo, pontos e vidas visíveis para observar o desfecho.`]});
}

const labirinto=()=>[{name:'Gato',stacks:[...stacks('C19-CODIGO-01'),...stacks('C19-CODIGO-02')]}];
const mazeOptions={backdrops:['labirinto 1','labirinto 2']};
const stageAssets=[{svg:maze,cx:240,cy:180},{svg:maze2,cx:240,cy:180}];
const fantasma='<svg xmlns="http://www.w3.org/2000/svg" width="56" height="50"><path d="M3 46V24Q3 4 28 4T53 24V46L45 40L37 46L28 40L20 46L11 40Z" fill="#b4a5e4" stroke="#453674" stroke-width="3"/><circle cx="18" cy="25" r="4" fill="#453674"/><circle cx="32" cy="25" r="4" fill="#453674"/></svg>';
const susto=labirinto();
const [movimentoFantasma,detectarFantasma]=stacks('C19-EXERCICIO-01');
susto[0].stacks[4].at(-1).body.push(...detectarFantasma);
susto.push({name:'Fantasma',initial:{x:-105,y:-130},stacks:[movimentoFantasma]});
games.push({id:'C19-fantasma',refs:['C19-EXERCICIO-01'],actors:susto,options:mazeOptions,assets:{Stage:stageAssets,Fantasma:[{svg:fantasma,cx:28,cy:25}]},adaptacoes:['Cenários do labirinto de referência. O fantasma começa na faixa inferior livre e o ramo de contato foi acrescentado ao sempre do gato.']});
games.push({id:'C19-labirinto-base',refs:['C19-MISSAO-01','C19-CODIGO-01','C19-CODIGO-02'],actors:labirinto(),options:mazeOptions,assets:{Stage:stageAssets},adaptacoes:['Labirinto de referência desenhado com paredes pretas e meta verde, corredores mais largos que o gato.','Sensores usam exatamente #000000 e #00ff00, como pede o uso do conta-gotas.']});
const timed=labirinto();
timed[0].stacks[4].splice(1,0,stacks('C19-CODIGO-03')[0][0]);
timed[0].stacks[4].at(-1).body[1].body.splice(1,0,stacks('C19-CODIGO-03')[0][1]);
games.push({id:'C19-cronometro',refs:['C19-CODIGO-03'],actors:timed,options:mazeOptions,assets:{Stage:stageAssets},adaptacoes:['Reset do cronômetro no começo e fala Tempo na vitória antes de pare tudo, conforme instrução textual.']});
const batidas=labirinto();const batidaParts=stacks('C19-EXERCICIO-02')[0];
batidas[0].stacks[4].splice(1,0,batidaParts[0]);
batidas[0].stacks[4].at(-1).body[0]=batidaParts[1];
games.push({id:'C19-batidas',refs:['C19-EXERCICIO-02'],actors:batidas,options:mazeOptions,assets:{Stage:stageAssets},prepare:monitors,adaptacoes:['Inicialização de batidas no início; ramo de colisão substituído pelo da resolução, evitando dois testes de parede em sequência.']});
const fase=labirinto();fase[0].stacks[4].at(-1).body[1]=stacks('C19-EXERCICIO-03')[0][0];
games.push({id:'C19-segunda-fase',refs:['C19-EXERCICIO-03'],actors:fase,options:mazeOptions,assets:{Stage:stageAssets},adaptacoes:['Ramo de vitória substituído pelo da resolução para trocar a fase; cenários de referência preparados.']});

const quiz=()=>({name:'Gato',stacks:[[...stacks('C18-CODIGO-01')[0],...stacks('C18-CODIGO-02')[0]]]});
const ligaQuiz='O trecho O jogo foi encaixado ao final do cadastro, como na contraprova L04.';
const quizSons=quiz();
const quizSonsCondicao=quizSons.stacks[0].find(block=>block.op==='control_repeat').body.find(block=>block.op==='control_if_else');
for(const [ramo,som] of [[quizSonsCondicao.body,'Collect'],[quizSonsCondicao.else,'Oops']]){
 ramo.unshift(n('sound_play',{SOUND_MENU:som}),n('data_addtolist',{LIST:'efeitos acionados',ITEM:som}));
}
quizSons.stacks[0].splice(1,0,n('data_deletealloflist',{LIST:'efeitos acionados'}));
games.push({id:'C18-quiz-sons',refs:['C18-EXERCICIO-03'],actors:[quizSons],sounds:{Gato:{Collect:'Collect',Oops:'Oops'}},prepare:data=>monitorList(data,'efeitos acionados'),adaptacoes:[ligaQuiz,'Collect e Oops escolhidos para os dois ramos. O monitor registra a passagem pelo bloco de som de cada ramo imediatamente depois de iniciar o efeito.']});
const quarta=quiz();
quarta.stacks[0].splice(stacks('C18-CODIGO-01')[0].length,0,...stacks('C18-EXERCICIO-01')[0]);
games.push({id:'C18-quarta-pergunta',refs:['C18-EXERCICIO-01'],actors:[quarta],prepare:monitors,adaptacoes:[ligaQuiz,'Novo par encaixado depois do cadastro original e antes do laço.']});
const vitoria=quiz();
vitoria.stacks[0].push(...stacks('C18-EXERCICIO-02')[0]);
games.push({id:'C18-mensagem-vitoria',refs:['C18-EXERCICIO-02'],actors:[vitoria],prepare:monitors,adaptacoes:[ligaQuiz,'Condição encaixada após a fala da pontuação final.']});
const placar=quiz();
const acertos=placar.stacks[0].find(b=>b.op==='control_repeat').body.find(b=>b.op==='control_if_else');
acertos.body.push(n('event_broadcast',{BROADCAST_INPUT:'atualizou'}));
const avatar={name:'Placar',initial:{x:-135,y:20,currentCostume:3},stacks:stacks('C18-DESAFIO-01')};
const face=color=>`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="28" fill="${color}"/><circle cx="22" cy="24" r="3"/><circle cx="42" cy="24" r="3"/><path d="M20 43 Q32 ${color==='#ffd547'?55:31} 44 43" fill="none" stroke="#222" stroke-width="3"/></svg>`;
const faces=['#7fb7db','#7fb7db','#ffd547','#7fb7db'].map(color=>({svg:face(color),cx:32,cy:32}));
games.push({id:'C18-placar-visual',refs:['C18-DESAFIO-01'],actors:[placar,avatar],assets:{Placar:faces},prepare:monitors,adaptacoes:[ligaQuiz,'Acrescentado o envio descrito na resolução imediatamente após pontuar. O segundo ator começa na fantasia triste, uma condição de preparação explícita do teste.']});

const recorde=labirinto();
const [initRecorde,atVictory]=stacks('C19-DESAFIO-01').map(parts=>parts[0]);
recorde[0].stacks[4].splice(1,0,stacks('C19-CODIGO-03')[0][0],initRecorde);
recorde[0].stacks[4].at(-1).body[1].body.unshift(atVictory);
games.push({id:'C19-recorde-inicializacao-na-bandeira',refs:['C19-DESAFIO-01'],actors:recorde,options:mazeOptions,assets:{Stage:stageAssets},prepare:monitors,adaptacoes:['Interpretação sob teste: colocar a inicialização para 999 sob a bandeira, como nas outras variáveis. Não é indicação expressa do livro.','Atualização de recorde colocada na vitória antes da parada.']});
const recordePersistente=labirinto();
recordePersistente[0].stacks[4].splice(1,0,stacks('C19-CODIGO-03')[0][0]);
recordePersistente[0].stacks[4].at(-1).body[1].body.unshift(structuredClone(atVictory));
games.push({id:'C19-recorde-inicializacao-unica',refs:['C19-DESAFIO-01'],actors:recordePersistente,options:{...mazeOptions,variables:{recorde:999}},assets:{Stage:stageAssets},prepare:monitors,adaptacoes:['Contraprova: recorde inicializado uma única vez com 999 nos dados do projeto; bandeira só zera o cronômetro.','Atualização de recorde colocada na vitória antes da parada.']});
const startScreen={name:'Stage',stacks:stacks('C20-EXERCICIO-01')};
const titleScreen='<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="#eff5ff"/><text x="240" y="130" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#18244a">Corrida do gato</text><text x="240" y="195" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#18244a">Aperte espaço para começar</text></svg>';
const playScreen='<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="#f6fff0"/><path d="M0 240H480" stroke="#458925" stroke-width="3"/></svg>';
const raceAssets={Stage:[{svg:titleScreen,cx:240,cy:180},{svg:playScreen,cx:240,cy:180}]};
const raceOptions={backdrops:['início','jogo'],variables:{pontos:9}};
const restart=stacks('C20-EXERCICIO-02');
games.push({id:'C20-reinicio-literal',refs:['C20-EXERCICIO-02'],actors:[{name:'Gato',initial:{x:80},stacks:restart}],options:raceOptions,assets:raceAssets,prepare:monitors,adaptacoes:['Atores e cenário de referência com x=80 e pontos=9 para representar estado de partida em andamento. Pilha da tecla R igual à resolução.']});

const raceActor={name:'Gato',initial:{x:80},stacks:[...restart,
 [n('event_whenbroadcastreceived',{BROADCAST_OPTION:'começar'}),n('data_setvariableto',{VARIABLE:'pontos',VALUE:'0'}),n('motion_gotoxy',{X:'0',Y:'0'})],
 [n('event_whenkeypressed',{KEY_OPTION:'seta direita'}),n('motion_changexby',{DX:'10'}),n('data_changevariableby',{VARIABLE:'pontos',VALUE:'1'})],
]};
games.push({id:'C20-corrida-referencia',refs:['C20-MISSAO-01','C20-EXERCICIO-01','C20-EXERCICIO-02'],actors:[raceActor,startScreen],options:raceOptions,assets:raceAssets,prepare:monitors,adaptacoes:['Protótipo de corrida escolhido para integrar os exercícios. Uma seta muda x e soma um ponto como forma de observar o reinício. Ainda não inclui regras de vitória, bloqueio das setas na tela inicial ou publicação.','Receptor acrescentado como contraprova. Ele zera os pontos e restaura a posição ao receber começar.']});

const corridaEstado=()=>n('data_variable',{VARIABLE:'partida'});
const corridaFim='<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="#fff4df"/><text x="240" y="68" text-anchor="middle" font-size="26" fill="#582905">Fim da corrida</text><text x="240" y="320" text-anchor="middle" font-size="19" fill="#582905">Pressione R para disputar de novo</text></svg>';
const corridaPista='<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="#f8fbef"/><path d="M0 115H480M0 180H480M0 245H480" stroke="#9db67a" stroke-width="2"/><path d="M405 115V245" stroke="#1a3020" stroke-width="5" stroke-dasharray="6 7"/><text x="240" y="78" text-anchor="middle" font-size="20" fill="#18244a">Gato: A | Robô: L</text><text x="240" y="301" text-anchor="middle" font-size="16" fill="#18244a">Aperte várias vezes para avançar</text></svg>';
const corridaTitulo=titleScreen.replace('Corrida do gato','Corrida do gato e do robô');
const corridaInicio=stacks('C20-EXERCICIO-01');
corridaInicio[0].splice(1,0,n('data_setvariableto',{VARIABLE:'partida',VALUE:'0'}));
const corridaPalco={name:'Stage',stacks:[
 ...corridaInicio,
 [n('event_whenbroadcastreceived',{BROADCAST_OPTION:'começar'}),n('looks_switchbackdropto',{BACKDROP:'jogo'}),n('data_setvariableto',{VARIABLE:'partida',VALUE:'1'})],
 [n('event_whenbroadcastreceived',{BROADCAST_OPTION:'fim'}),n('looks_switchbackdropto',{BACKDROP:'fim'})],
 [n('event_whenkeypressed',{KEY_OPTION:'r'}),{op:'control_if',inputs:{CONDITION:n('operator_gt',{OPERAND1:corridaEstado(),OPERAND2:'0'})},body:[n('event_broadcast',{BROADCAST_INPUT:'começar'})]}],
]};
function corredor(nome,tecla,y){
 const chegar={op:'control_if',inputs:{CONDITION:n('operator_gt',{OPERAND1:n('motion_xposition'),OPERAND2:'164'})},body:[
  n('data_setvariableto',{VARIABLE:'partida',VALUE:'2'}),
  n('event_broadcast',{BROADCAST_INPUT:'fim'}),
  n('sound_play',{SOUND_MENU:'Vitória'}),
  n('looks_say',{MESSAGE:`${nome} venceu!`}),
 ]};
 const avancar={op:'control_if',inputs:{CONDITION:n('operator_equals',{OPERAND1:corridaEstado(),OPERAND2:'1'})},body:[
  n('motion_changexby',{DX:'55'}),n('looks_nextcostume'),chegar,
 ]};
 return {name:nome,initial:{x:-165,y,size:48},stacks:[
  [n('event_whenflagclicked'),n('looks_hide')],
  [n('event_whenbroadcastreceived',{BROADCAST_OPTION:'começar'}),n('looks_say',{MESSAGE:''}),n('motion_gotoxy',{X:'-165',Y:String(y)}),n('looks_show')],
  [n('event_whenkeypressed',{KEY_OPTION:tecla}),avancar],
 ]};
}
const corridaFinalAssets={Stage:[corridaTitulo,corridaPista,corridaFim].map(svg=>({svg,cx:240,cy:180})),Robô:[{svg:robo,cx:44,cy:50},{svg:robo.replace('#42afbe','#4dc6ad'),cx:44,cy:50}]};
games.push({id:'C20-jogo-final-corrida',refs:['C20-MISSAO-01','C20-DESAFIO-01'],actors:[corredor('Gato','a',42),corredor('Robô','l',-42),corridaPalco],options:{backdrops:['início','jogo','fim'],costumes:['passo 1','passo 2']},assets:corridaFinalAssets,sounds:{Gato:{Vitória:'Collect'},Robô:{Vitória:'Collect'}},adaptacoes:['Jogo escolhido: corrida local para duas pessoas, com Gato (A) e Robô (L). Ganha quem chega à linha primeiro; o outro perde. A variável partida controla o menu, a corrida e o fim.','Espaço abre a corrida. R reinicia após sair do menu. O vencedor dispara o efeito Collect e o anúncio. Compartilhamento, teste com três pessoas e revisão a partir do retorno delas são etapas externas.']});
const corridaOriginal=games.at(-1);
const corridaRevisada=structuredClone(corridaOriginal);
corridaRevisada.id='C20-corrida-revisada';
corridaRevisada.refs=['C20-DESAFIO-01'];
const palcoRevisado=corridaRevisada.actors.find(actor=>actor.name==='Stage');
palcoRevisado.stacks.at(-1)[1].inputs.CONDITION=
 n('operator_equals',{OPERAND1:corridaEstado(),OPERAND2:'2'});
corridaRevisada.adaptacoes=['Variante do desafio final. A tecla R só reinicia após a chegada.'];
games.push(corridaRevisada);
module.exports={games,monitors};
