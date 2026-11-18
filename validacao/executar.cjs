const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {session,stacks,source}=require('./runtime.cjs');
const cases=[];
const one=(id,fn,options={})=>cases.push({id,refs:[id,...(options.refs||[])],actors:[{name:'Gato',stacks:stacks(id),initial:options.initial}],options,run:fn});
const say=s=>s.trace.filter(e=>e.event==='SAY'&&e.text).map(e=>e.text);
const count=(s,op)=>s.counts[op]||0;
const vars=s=>s.vm.runtime.getTargetForStage().variables;
const variable=(s,n)=>Object.values(vars(s)).find(v=>v.name===n)?.value;
const almost=(a,b)=>Math.abs(a-b)<0.001;
const position=(s,x,y)=>almost(s.target().x,x)&&almost(s.target().y,y);
const green=async(s,ms=3500)=>{s.green();await s.advance(ms);};

for(const [id,x,message,ms] of [
 ['C01-CODIGO-01',10,'Olá!',2500],['C01-CODIGO-02',50,'Cheguei!',2500],
 ['C01-CODIGO-03',50,'Cheguei!',2500],['C01-EXERCICIO-01',10,'Maria',3500],
 ['C01-EXERCICIO-02',20,'Cheguei!',2500],['C01-DESAFIO-01',20,'Oi!',2500]
]) one(id,async(s,check)=>{await green(s,ms);check(position(s,x,0),'Deslocamento final esperado');check(say(s).includes(message),'Fala esperada');
 const trace=s.trace.filter(e=>e.event==='BLOCK');
 if(id==='C01-CODIGO-02')check(trace.findIndex(e=>e.op==='motion_movesteps')<trace.findIndex(e=>e.op==='looks_sayforsecs'),'Move antes de falar');
 if(id==='C01-CODIGO-03')check(trace.findIndex(e=>e.op==='motion_movesteps')>trace.findIndex(e=>e.op==='looks_sayforsecs'),'Fala antes de mover');
},{refs:id==='C01-CODIGO-01'?['C01-MISSAO-01']:[]});

one('C02-CODIGO-01',async(s,c)=>{await green(s,1600);c(position(s,0,0),'Termina no centro');c(count(s,'motion_movesteps')===2,'Executa os dois movimentos');},{refs:['C02-MISSAO-01']});
for(const [id,steps,turn] of [['C02-CODIGO-02',4,90],['C02-EXERCICIO-03',3,120],['C02-DESAFIO-01',6,60]])one(id,async(s,c)=>{await green(s,1800);c(position(s,0,0),'Percurso fecha no ponto inicial');c(count(s,'motion_movesteps')===steps,'Quantidade de lados');c(s.trace.filter(e=>e.op==='motion_turnright').every(e=>Number(e.args.DEGREES)===turn),'Giro de cada lado');c(s.trace.some(e=>e.op==='pen_penDown'),'Produz traço visível, conforme verbo desenhar do enunciado');});
one('C02-EXERCICIO-01',async(s,c)=>{await green(s,200);c(position(s,200,150),'Vai ao ponto (200,150)');});
one('C02-EXERCICIO-02',async(s,c)=>{await green(s,400);c(position(s,0,0),'Volta ao ponto de partida');c(almost(s.target().direction,-90),'Meia-volta');});

one('C03-CODIGO-01',async(s,c)=>{await green(s,2200);c(position(s,100,0),'Avança 100 passos');c(count(s,'looks_nextcostume')===10,'Troca dez vezes de fantasia');},{refs:['C03-MISSAO-01']});
one('C03-EXERCICIO-01',async(s,c)=>{await green(s,5500);c(JSON.stringify(say(s))===JSON.stringify(['Que dia lindo!','Vamos brincar!']),'Pensamento seguido de fala');c(s.trace.find(e=>e.type==='think')?.ms===0,'Pensamento inicial');});
one('C03-EXERCICIO-02',async(s,c)=>{await green(s,1500);c(JSON.stringify(s.trace.filter(e=>e.op==='looks_setsizeto').map(e=>Number(e.args.SIZE)))==='[200,100]','Comanda 200% e depois 100%');},{pendente:'Conferir tamanho renderizado no editor'});
one('C03-EXERCICIO-03',async(s,c)=>{await green(s,6000);c(count(s,'looks_hide')===5&&count(s,'looks_show')===5,'Cinco ciclos de esconder e mostrar');c(s.target().visible,'Termina visível');});
one('C03-DESAFIO-01',async(s,c)=>{await green(s,3500);c(count(s,'looks_changeeffectby')===12,'Doze alterações de cor');c(s.target().effects.color===120,'Efeito soma 120');});

one('C05-EXERCICIO-01',async(s,c)=>{s.green();await s.advance(500);c(s.vm.runtime.getTargetForStage().currentCostume===0,'Espera antes de trocar cenário');await s.advance(900);c(s.vm.runtime.getTargetForStage().currentCostume===1,'Troca cenário após um segundo');});
cases.push({id:'C05-dialogo',refs:['C05-CODIGO-01','C05-CODIGO-02','C05-MISSAO-01'],actors:[{name:'Gato',stacks:stacks('C05-CODIGO-01')},{name:'Amigo',stacks:stacks('C05-CODIGO-02')}],run:async(s,c)=>{await green(s,4600);c(JSON.stringify(say(s))===JSON.stringify(['Oi! Tudo bem?','Tudo ótimo!']),'Diálogo na ordem');c(s.trace.find(e=>e.target==='Amigo'&&e.event==='SAY').ms>=2000,'Amigo espera a vez');}});
cases.push({id:'C05-dois-amigos',refs:['C05-EXERCICIO-02'],actors:[{name:'Gato',stacks:stacks('C05-EXERCICIO-02',[0])},{name:'Amigo',stacks:stacks('C05-EXERCICIO-02',[1])}],run:async(s,c)=>{await green(s,3500);c(position(s,100,0),'Gato anda cem passos');c(say(s).includes('Bem-vindo!'),'Amigo cumprimenta');}});

cases.push({id:'C06-setas',refs:['C06-CODIGO-01','C06-CODIGO-02','C06-MISSAO-01'],actors:[{name:'Gato',stacks:[...stacks('C06-CODIGO-01'),...stacks('C06-CODIGO-02')]}],run:async(s,c)=>{s.keyboard('seta direita',true);await s.advance(100);s.keyboard('seta direita',false);c(position(s,10,0),'Direita anda dez passos');s.keyboard('seta esquerda',true);await s.advance(100);s.keyboard('seta esquerda',false);c(position(s,0,0),'Esquerda desfaz movimento');}});
cases.push({id:'C06-setas-direcao-alterada',refs:['C06-MISSAO-01'],actors:[{name:'Gato',stacks:[...stacks('C06-CODIGO-01'),...stacks('C06-CODIGO-02')],initial:{direction:0}}],run:async(s,c)=>{s.keyboard('seta direita',true);await s.advance(100);c(position(s,10,0),'Seta direita deveria ir à direita também após giro do ator');}});
one('C06-EXERCICIO-01',async(s,c)=>{s.click('Gato');await s.advance(2300);c(say(s).includes('Ai! Você me clicou!'),'Clique dispara fala');});
one('C06-EXERCICIO-02',async(s,c)=>{s.keyboard('seta para cima',true);await s.advance(100);s.keyboard('seta para cima',false);c(position(s,0,10),'Seta cima sobe');s.keyboard('seta para baixo',true);await s.advance(100);c(position(s,0,0),'Seta baixo desce');});
cases.push({id:'C06-cadeia',refs:['C06-DESAFIO-01'],actors:['A','B','C'].map((name,i)=>({name,stacks:stacks('C06-DESAFIO-01',[i])})),run:async(s,c)=>{await green(s,5000);c(JSON.stringify(say(s))===JSON.stringify(['1!','2!','3! Foi!']),'Mensagens encadeiam três atores');}});
cases.push({id:'C06-aviso',refs:['C06-CODIGO-03'],actors:[{name:'Gato',stacks:stacks('C06-CODIGO-03',[0])},{name:'Amigo',stacks:stacks('C06-CODIGO-03',[1])}],run:async(s,c)=>{await green(s,4500);c(JSON.stringify(say(s))===JSON.stringify(['Sua vez!','Agora sou eu!']),'Aviso inicia fala do amigo');}});

one('C07-EXERCICIO-01',async(s,c)=>{await green(s,5500);c(JSON.stringify(say(s))===JSON.stringify(['3','2','1','Já!']),'Contagem 3,2,1,Já');});
one('C07-EXERCICIO-02',async(s,c)=>{await green(s,1000);c(count(s,'motion_turnright')>=10,'Gira repetidamente');c(s.vm.runtime.threads.length>0,'Laço continua até parada');});
for(const [id,answer,expected] of [['C08-CODIGO-02','Ana','Olá, Ana'],['C08-EXERCICIO-01','10','10']])one(id,async(s,c)=>{s.green();await s.advance(100);s.answer(answer);await s.advance(3500);c(say(s).includes(expected),'Resposta incorporada na fala');},{refs:id==='C08-CODIGO-02'?['C08-MISSAO-01']:[]});
one('C08-EXERCICIO-02',async(s,c)=>{s.vm.postIOData('mouse',{x:340,y:130,canvasWidth:480,canvasHeight:360});await green(s,100);c(position(s,100,50),'Segue o ponteiro nas coordenadas (100,50)');s.vm.postIOData('mouse',{x:190,y:230,canvasWidth:480,canvasHeight:360});await s.advance(100);c(position(s,-50,-50),'Segue nova posição do ponteiro');});

one('C09-CODIGO-01',async(s,c)=>{await green(s,1000);c(count(s,'looks_nextcostume')>=4,'Troca fantasias repetidamente');c(s.vm.runtime.threads.length>0,'Animação permanece ativa');});
one('C09-CODIGO-02',async(s,c)=>{s.keyboard('seta direita',true);await s.advance(100);c(position(s,10,0),'Direita avança dez');c(count(s,'looks_nextcostume')===1,'Troca fantasia junto com passo');});
one('C09-CODIGO-03',async(s,c)=>{s.keyboard('seta esquerda',true);await s.advance(100);s.keyboard('seta esquerda',false);c(position(s,-10,0),'Esquerda aponta e anda à esquerda');s.keyboard('seta direita',true);await s.advance(100);c(position(s,0,0),'Direita aponta e anda à direita');},{refs:['C09-MISSAO-01']});
one('C09-EXERCICIO-01',async(s,c)=>{await green(s,3000);c(count(s,'looks_nextcostume')===10,'Dez trocas com pausa');});
one('C09-EXERCICIO-02',async(s,c)=>{s.green();await s.advance(1100);c(s.target().x>100,'Chega à direita antes de voltar');await s.advance(1500);c(position(s,0,0),'Desliza de volta ao centro');});
one('C09-EXERCICIO-03',async(s,c)=>{await green(s,2000);c(count(s,'looks_changesizeby')===10,'Cinco aumentos e cinco reduções');},{pendente:'Conferir tamanho renderizado no editor'});
one('C09-DESAFIO-01',async(s,c)=>{s.keyboard('seta para cima',true);await s.advance(100);c(position(s,0,50),'Salto sobe cinquenta');await s.advance(600);c(position(s,0,0),'Salto retorna');});

cases.push({id:'C10-falas',refs:['C10-EXERCICIO-01'],actors:[{name:'Gato',stacks:stacks('C10-EXERCICIO-01',[0])},{name:'Cachorro',stacks:stacks('C10-EXERCICIO-01',[1])}],run:async(s,c)=>{await green(s,4500);c(JSON.stringify(say(s))===JSON.stringify(['Olá, amigo!','Au au! Oi!']),'Gato fala e cachorro responde');}});
cases.push({id:'C10-falas-exemplo',refs:['C10-CODIGO-02'],actors:[{name:'A',stacks:stacks('C10-CODIGO-02',[0])},{name:'B',stacks:stacks('C10-CODIGO-02',[1])}],run:async(s,c)=>{await green(s,4500);c(JSON.stringify(say(s))===JSON.stringify(['Oi, tudo bem?','Tudo ótimo!']),'Exemplo combina as falas por mensagens');}});
cases.push({id:'C10-cenas',refs:['C10-CODIGO-01','C10-CODIGO-03'],actors:[{name:'Stage',stacks:stacks('C10-CODIGO-01')},{name:'Gato',stacks:stacks('C10-CODIGO-03')}],run:async(s,c)=>{s.green();await s.advance(100);c(!s.target().visible,'Personagem começa escondido');await s.advance(7500);c(s.target().visible,'Mensagem da segunda cena mostra personagem');c(position(s,0,0),'Personagem chega ao centro');c(s.vm.runtime.getTargetForStage().getCostumes()[s.vm.runtime.getTargetForStage().currentCostume].name==='cena 2','Palco muda para cena 2');}});
cases.push({id:'C10-duas-cenas',refs:['C10-EXERCICIO-02'],actors:[{name:'Stage',stacks:stacks('C10-EXERCICIO-02',[0])},{name:'Gato',stacks:stacks('C10-EXERCICIO-02',[1])}],run:async(s,c)=>{await green(s,8000);c(say(s).includes('Chegamos à praia!'),'Mensagem da praia dispara fala');}});
one('C10-EXERCICIO-03',async(s,c)=>{await green(s,100);c(!s.target().visible&&position(s,200,0),'Começa escondido na lateral');s.broadcast('entrar');await s.advance(1500);c(s.target().visible&&position(s,0,0),'Aviso faz entrar deslizando');});

one('C11-CODIGO-02',async(s,c)=>{await green(s,100);c(say(s).includes('Solto!'),'Sem tecla usa senão');s.keyboard('espaço',true);await s.advance(100);c(say(s).includes('Apertado!'),'Com tecla usa se');});
one('C11-CODIGO-03',async(s,c)=>{await green(s,100);c(position(s,0,0)&&say(s).includes('Parei'),'Parado com tecla solta');s.keyboard('seta direita',true);await s.advance(100);c(s.target().x>0,'Anda com tecla');s.keyboard('seta direita',false);await s.advance(100);const x=s.target().x;await s.advance(100);c(s.target().x===x,'Para quando solta');},{refs:['C11-MISSAO-01']});
one('C11-EXERCICIO-02',async(s,c)=>{s.click('Gato');await s.advance(100);c(say(s).length>0,'Enunciado diz ao ser clicado; clique deveria executar');});
one('C11-DESAFIO-01',async(s,c)=>{await green(s,100);c(say(s).at(-1)==='Pare','Sem teclas é vermelho');s.keyboard('a',true);await s.advance(100);c(say(s).at(-1)==='Atenção','A seleciona amarelo');s.keyboard('v',true);await s.advance(100);c(say(s).at(-1)==='Pode ir','V tem prioridade');});

one('C12-CODIGO-01',async(s,c)=>{for(let i=0;i<20;i++){s.click('Gato');await s.advance(2200);}c(count(s,'looks_sayforsecs')===20&&say(s).length>0&&say(s).every(x=>Number.isInteger(Number(x))&&Number(x)>=1&&Number(x)<=6),'Vinte resultados inteiros de 1 a 6');},{refs:['C12-MISSAO-01']});
one('C12-EXERCICIO-01',async(s,c)=>{await green(s,3500);c(say(s).includes('28'),'Respeita operadores aninhados e retorna 28');});
for(const age of ['17','18'])cases.push({id:'C12-idade-'+age,refs:['C12-EXERCICIO-02'],actors:[{name:'Gato',stacks:stacks('C12-EXERCICIO-02')}],run:async(s,c)=>{await green(s,100);s.answer(age);await s.advance(200);c(say(s).includes(age==='18'?'Pode entrar':'Ainda não'),'Limite de idade '+age);}});
one('C12-EXERCICIO-03',async(s,c)=>{for(let i=0;i<20;i++){s.click('Gato');await s.advance(2200);}c(count(s,'looks_sayforsecs')===20&&say(s).length>0&&say(s).every(x=>['Cara','Coroa'].includes(x)),'Todos os sorteios resultam em cara ou coroa');});
for(const n of ['10','11','19','20'])cases.push({id:'C12-faixa-'+n,refs:['C12-DESAFIO-01'],actors:[{name:'Gato',stacks:stacks('C12-DESAFIO-01')}],run:async(s,c)=>{await green(s,100);s.answer(n);await s.advance(100);c(say(s).includes('Está na faixa!')===(Number(n)>10&&Number(n)<20),'Intervalo aberto para '+n);}});

one('C13-EXERCICIO-02',async(s,c)=>{await green(s,12000);c(Number(variable(s,'tempo'))===0,'Contagem termina em zero');c(say(s).includes('Acabou o tempo!'),'Anuncia fim');});
one('C13-EXERCICIO-03',async(s,c)=>{await green(s,100);s.answer('12');await s.advance(100);s.answer('8');await s.advance(3500);c(say(s).includes('20'),'Guarda duas respostas e soma');});
one('C13-DESAFIO-01',async(s,c)=>{await green(s,100);for(let i=0;i<5;i++){s.keyboard('espaço',true);await s.advance(100);s.keyboard('espaço',false);await s.advance(100);}c(Number(variable(s,'pontos'))===5,'Cinco apertos somam cinco pontos');c(say(s).includes('Vitória!'),'Emite evento de fala de vitória');c(s.target().getCustomState('Scratch.looks')?.text==='Vitória!','Balão de vitória permanece visível depois de pare tudo');});
one('C13-CODIGO-02',async(s,c)=>{await green(s,100);c(say(s).includes('Você venceu!'),'Emite evento de fala ao atingir dez pontos');c(s.target().getCustomState('Scratch.looks')?.text==='Você venceu!','Balão permanece disponível para renderização após pare tudo');},{variables:{pontos:10}});

cases.push({id:'C14-sorteio',refs:['C14-CODIGO-01','C14-CODIGO-02','C14-MISSAO-01'],actors:[{name:'Gato',stacks:[...stacks('C14-CODIGO-01'),...stacks('C14-CODIGO-02')]}],run:async(s,c)=>{await green(s,100);for(let i=0;i<12;i++){s.click('Gato');await s.advance(100);}c(count(s,'looks_say')===12&&say(s).length>0&&say(s).every(x=>['Maçã','Banana','Uva','Pera'].includes(x)),'Sorteia apenas as quatro frutas cadastradas');}});
one('C14-EXERCICIO-01',async(s,c)=>{await green(s,2500);c(say(s).includes('Bruno'),'Lê o segundo nome');});
one('C14-EXERCICIO-02',async(s,c)=>{await green(s,2500);c(say(s).includes('3'),'Diz quantidade da lista existente');},{lists:{amigos:['Ana','Bruno','Carla']}});
one('C14-EXERCICIO-03',async(s,c)=>{await green(s,100);for(const n of ['Ana','Bruno','Carla']){s.answer(n);await s.advance(100);}c(JSON.stringify(variable(s,'amigos'))===JSON.stringify(['Ana','Bruno','Carla']),'Adiciona três respostas à lista');});
one('C14-DESAFIO-01',async(s,c)=>{await green(s,4000);c(JSON.stringify(say(s))===JSON.stringify(['Ana','Bruno','Carla']),'Lê todos os itens em ordem');},{lists:{amigos:['Ana','Bruno','Carla']}});

one('C15-EXERCICIO-01',async(s,c)=>{s.click('Gato');await s.advance(300);const clones=s.vm.runtime.targets.filter(t=>!t.isOriginal);c(clones.length===1,'Clique cria um clone');c(clones[0]&&almost(clones[0].y,-50),'Clone gira e anda cinquenta');});
cases.push({id:'C15-clone-some',refs:['C15-EXERCICIO-02'],actors:[{name:'Gato',stacks:[...stacks('C15-EXERCICIO-01',[0]),...stacks('C15-EXERCICIO-02')]}],run:async(s,c)=>{s.click('Gato');await s.advance(100);c(s.vm.runtime.targets.some(t=>!t.isOriginal),'Clone existe antes de três segundos');await s.advance(3500);c(s.vm.runtime.targets.every(t=>t.isOriginal),'Clone apagado após três segundos');}});
one('C15-EXERCICIO-03',async(s,c)=>{await green(s,1500);const clones=s.vm.runtime.targets.filter(t=>!t.isOriginal);c(clones.length===5,'Cria cinco clones');c(clones.every(t=>t.x>=-200&&t.x<=200&&t.y>=-150&&t.y<=150),'Posições dentro da região especificada');});

cases.push({id:'C16-quadrado-simples',refs:['C16-CODIGO-01','C16-CODIGO-02'],actors:[{name:'Gato',stacks:[...stacks('C16-CODIGO-01'),...stacks('C16-CODIGO-02')]}],run:async(s,c)=>{await green(s,1000);c(position(s,100,0),'Executa dois quadrados e deslocamento entre eles');c(count(s,'procedures_call')===2,'Chama procedimento duas vezes');c(count(s,'motion_movesteps')===9,'Oito lados e deslocamento');}});
cases.push({id:'C16-quadrado-parametro',refs:['C16-CODIGO-03','C16-CODIGO-04','C16-MISSAO-01'],actors:[{name:'Gato',stacks:[...stacks('C16-CODIGO-03'),...stacks('C16-CODIGO-04')]}],run:async(s,c)=>{await green(s,1000);c(position(s,0,0),'Dois percursos fecham');const steps=s.trace.filter(e=>e.op==='motion_movesteps').map(e=>Number(e.args.STEPS));c(JSON.stringify(steps)==='[40,40,40,40,100,100,100,100]','Entrada tamanho assume quarenta e cem');c(s.trace.some(e=>e.op==='pen_penDown'),'Desenha quadrados visíveis, como pede a missão');}});
one('C16-EXERCICIO-01',async(s,c)=>{s.keyboard('seta para cima',true);await s.advance(100);c(position(s,0,50),'Chamada faz subir');await s.advance(800);c(position(s,0,0),'Procedimento retorna ao chão');});
one('C16-EXERCICIO-03',async(s,c)=>{s.click('Gato');await s.advance(100);c(Number(variable(s,'pontos'))===5,'Parâmetro quantos soma cinco pontos');});
const invoke=(name,args=[])=>[{op:'event_whenflagclicked',inputs:{}},{op:'procedures_call',inputs:{signature:name+args.map((_,i)=>' @'+i+'@').join(''),arguments:args}}];
cases.push({id:'C16-triangulo',refs:['C16-EXERCICIO-02'],adaptacoes:['Pilha de teste chama o bloco triângulo; a resolução fornece só a definição.'],actors:[{name:'Gato',stacks:[...stacks('C16-EXERCICIO-02'),invoke('triângulo')]}],run:async(s,c)=>{await green(s,1000);c(position(s,0,0),'Triângulo fecha');c(count(s,'motion_movesteps')===3,'Três lados');c(s.trace.some(e=>e.op==='pen_penDown'),'Desenha figura visível');}});
cases.push({id:'C16-poligono',refs:['C16-DESAFIO-01'],adaptacoes:['Chamada polígono 5 60 transcrita do texto após a pilha.'],actors:[{name:'Gato',stacks:[...stacks('C16-DESAFIO-01'),invoke('polígono',['5','60'])]}],run:async(s,c)=>{await green(s,1000);c(position(s,0,0),'Pentágono fecha');c(count(s,'motion_movesteps')===5,'Parâmetro lados é cinco');c(s.trace.filter(e=>e.op==='motion_turnright').every(e=>Number(e.args.DEGREES)===72),'Divide 360 pelos lados');c(s.trace.some(e=>e.op==='pen_penDown'),'Desenha figura visível');}});

cases.push({id:'C18-pilhas-separadas',refs:['C18-CODIGO-01','C18-CODIGO-02','C18-MISSAO-01'],actors:[{name:'Gato',stacks:[...stacks('C18-CODIGO-01'),...stacks('C18-CODIGO-02')]}],run:async(s,c)=>{await green(s,1000);c(count(s,'sensing_askandwait')>0,'Bandeira inicia perguntas ao montar as duas pilhas separadas como desenhadas');}});
for(const [name,answers,points] of [['todos-acertos',['4','brasília','7'],3],['um-erro',['4','Rio','7'],2],['sem-acertos',['0','Rio','0'],0]])cases.push({id:'C18-integrado-'+name,refs:['C18-CODIGO-02'],adaptacoes:['Conectado O jogo ao final de Cadastrando as perguntas. Essa ligação não é explicitada no passo 2.'],actors:[{name:'Gato',stacks:[[...stacks('C18-CODIGO-01')[0],...stacks('C18-CODIGO-02')[0]]]}],run:async(s,c)=>{await green(s,100);for(const answer of answers){s.answer(answer);await s.advance(1400);}await s.advance(4500);c(Number(variable(s,'pontos'))===points,'Pontuação esperada '+points);c(say(s).includes('Você fez '+points+' pontos!'),'Mostra pontuação final');}});

cases.push({id:'C20-tela-inicial',refs:['C20-EXERCICIO-01'],actors:[{name:'Stage',stacks:stacks('C20-EXERCICIO-01')}],run:async(s,c)=>{await green(s,100);let stage=s.vm.runtime.getTargetForStage();c(stage.currentCostume===0,'Exibe início antes do espaço');s.keyboard('espaço',true);await s.advance(100);c(stage.currentCostume===1,'Espaço troca para jogo');c(count(s,'event_broadcast')===1,'Envia começar uma vez');}});
cases.push({id:'C20-reinicio-sem-receptor',refs:['C20-EXERCICIO-02'],actors:[{name:'Gato',stacks:stacks('C20-EXERCICIO-02')}],options:{variables:{pontos:9}},run:async(s,c)=>{s.keyboard('r',true);await s.advance(200);c(count(s,'event_broadcast')===1,'Tecla R envia começar');c(Number(variable(s,'pontos'))===0,'A resolução isolada deveria zerar variáveis para reiniciar');}});

async function main(){
 const results=[];
 for(const test of cases){
  console.log('INICIO',test.id);
  const checks=[];let s;
  try{
   s=await session(test.actors,test.options);
   await test.run(s,(passed,description)=>checks.push({passou:Boolean(passed),descricao:description}));
   results.push({id:test.id,itens:test.refs,status:checks.every(c=>c.passou)?(test.options?.pendente?'parcial':'passou'):'lacuna_reproduzida',adaptacoes:test.adaptacoes||[],pendente:test.options?.pendente,checks,estado_final:s.state(),contagem_primitivas:s.counts,trace:s.trace});
  }catch(error){results.push({id:test.id,itens:test.refs,status:'erro_do_teste',erro:error.stack,checks});}
  finally{if(s)s.close();}
  fs.writeFileSync(path.join(__dirname,'resultados-parciais.json'),JSON.stringify(results,null,2)+'\n');
 }
 const summary={data:new Date().toISOString(),motor:'@scratch/scratch-vm 15.3.0 (src/index.js)',limites:['Sem renderizador: colisões, camadas, tamanho físico e aparência final não comprovadas.','Sem áudio: execução sonora não comprovada.','Relógio controlado, passos de 20ms; orçamento de CPU real de 0,75ms por passo, sem medir desempenho.','Fantasias nominais de teste, sem os desenhos do livro.','Trace de blocos limitado aos primeiros 2000 eventos por caso; contagens são completas, falas repetidas são condensadas.'],fontes_sha256:source.fontes_sha256,resultados:results};
 fs.writeFileSync(path.join(__dirname,'resultados-runtime.json'),JSON.stringify(summary,null,2)+'\n');
 const counts=results.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{});
 console.log(JSON.stringify({casos:results.length,...counts}));
 for(const r of results.filter(r=>r.status!=='passou'))console.log(r.id,r.status,r.erro||r.checks.filter(c=>!c.passou).map(c=>c.descricao).join('; '));
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={cases};
