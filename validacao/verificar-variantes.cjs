// Testes auxiliares de lógica. As variantes inteiras aguardam execução no editor.
const fs=require('node:fs');
const path=require('node:path');
const {session,source}=require('./runtime.cjs');
const {games}=require('./projetos-finais.cjs');
const n=(op,inputs={})=>({op,inputs});
const variable=(s,name)=>Object.values(s.vm.runtime.getTargetForStage().variables).find(v=>v.name===name)?.value;
const speech=s=>s.trace.filter(e=>e.event==='SAY'&&e.text).map(e=>e.text);
const results=[];
async function run(id,scenario,check,{actors,options}={}){
 const game=games.find(g=>g.id===id);
 const s=await session(actors||game.actors,options||game.options);
 try{
  const checks=await check(s);
  results.push({projeto:id,itens:game.refs,cenario:scenario,checagens:checks,passou:checks.every(c=>c.passou),limite:'Motor local, sem palco gráfico. Não marca execução no navegador.'});
 }finally{s.close();}
}
const eq=(nome,observado,esperado)=>({nome,esperado,observado,passou:observado===esperado});
async function answers(s,list){s.green();await s.advance(200);for(const answer of list){s.answer(answer);await s.advance(1350);}await s.advance(4500);}

async function main(){
 await run('C18-quarta-pergunta','Quatro pares cadastrados; responde todas corretamente',async s=>{
  await answers(s,['4','Brasília','7','3']);
  return [eq('Número de perguntas',s.counts.sensing_askandwait,4),eq('Pontos',variable(s,'pontos'),4),eq('Anúncio final',speech(s).at(-1),'Você fez 4 pontos!')];
 });
 for(const [scenario,list,msg] of [['Todos os acertos',['4','Brasília','7'],'Parabéns, você é demais!'],['Um erro',['4','Rio','7'],'Tente de novo!']]){
  await run('C18-mensagem-vitoria',scenario,async s=>{await answers(s,list);return [eq('Mensagem de encerramento',speech(s).at(-1),msg)];});
 }
 await run('C18-placar-visual','Ganha 3 pontos; clica na bandeira para nova partida',async s=>{
  const init=s.target('Placar').currentCostume;
  await answers(s,['4','Brasília','7']);
  const gained=s.target('Placar').currentCostume;
  s.green();await s.advance(200);
  return [eq('Fantasia triste preparada para o início',init,3),eq('Fantasia alegre após o terceiro ponto',gained,2),eq('Pontos reiniciados',Number(variable(s,'pontos')),0),eq('Fantasia volta a triste no reinício',s.target('Placar').currentCostume,3)];
 });
 for(const [id,expected] of [['C19-recorde-inicializacao-na-bandeira',999],['C19-recorde-inicializacao-unica',4]]){
  const g=games.find(g=>g.id===id);
  const original=g.actors[0].stacks[4];
  const init=original.filter(b=>['event_whenflagclicked','sensing_resettimer','data_setvariableto'].includes(b.op));
  const record=original.at(-1).body[1].body[0];
  const win=[n('event_whenkeypressed',{KEY_OPTION:'v'}),record];
  await run(id,'Isola a atualização de recorde e substitui o acionamento gráfico da vitória pela tecla V; recorde prévio de 4 segundos e nova tentativa de 9 segundos',async s=>{
   s.green();await s.advance(9000);const before=Number(variable(s,'recorde'));
   s.keyboard('v',true);await s.advance(100);s.keyboard('v',false);
   const after=Number(variable(s,'recorde'));
   return [eq('Recorde no início da segunda partida',before,expected),eq('Partida mais lenta deve preservar recorde anterior',after,4)];
  },{actors:[{name:'Gato',stacks:[init,win]}],options:{variables:{recorde:4}}});
 }
 const press=async(s,key)=>{s.keyboard(key,true);await s.advance(100);s.keyboard(key,false);};
 await run('C20-reinicio-literal','Tecla R com 9 pontos e ator em x=80',async s=>{
  await press(s,'r');
  return [eq('Envia a mensagem começar',s.counts.event_broadcast,1),eq('Pontos voltam a zero',Number(variable(s,'pontos')),0),eq('Ator volta à posição inicial',s.target().x,0)];
 });
 await run('C20-corrida-referencia','Bandeira, espaço, dois passos e R, com receptor explícito',async s=>{
  s.green();await s.advance(200);
  const stage=s.vm.runtime.getTargetForStage();
  const initial=stage.currentCostume;
  await press(s,'espaço');
  const afterSpace=stage.currentCostume;
  await press(s,'seta direita');await press(s,'seta direita');
  const before=Number(variable(s,'pontos'));
  const beforeX=s.target().x;
  await press(s,'r');
  return [eq('Bandeira exibe início',initial,0),eq('Espaço muda para o cenário do jogo',afterSpace,1),eq('Dois passos somam dois pontos',before,2),eq('Posição mudou durante a partida',beforeX,20),eq('R zera pontos',Number(variable(s,'pontos')),0),eq('R restaura posição',s.target().x,0)];
 });
 for(const [id,positionAfterR] of [['C20-jogo-final-corrida',-165],['C20-corrida-revisada',-110]]){
  await run(id,'R durante a corrida e depois da chegada',async s=>{
   s.green();await s.advance(200);
   await press(s,'espaço');
   await press(s,'a');await press(s,'l');
   const positions=()=>[s.target('Gato').x,s.target('Robô').x].join(',');
   const beforeR=positions();
   await press(s,'r');
   const afterR=positions();
   for(let i=0;i<6;i++)await press(s,'a');
   const winner=speech(s).at(-1);
   await press(s,'r');
   return [
    eq('Ambos avançaram antes de R',beforeR,'-110,-110'),
    eq('Posições após R durante a corrida',afterR,[positionAfterR,positionAfterR].join(',')),
    eq('Gato vence após cruzar a meta',winner,'Gato venceu!'),
    eq('R após a vitória restaura a largada',positions(),'-165,-165'),
    eq('Revanche começa no estado de corrida',Number(variable(s,'partida')),1),
   ];
  });
 }
 fs.writeFileSync(path.join(__dirname,'resultados-variantes.json'),JSON.stringify({motor:'@scratch/scratch-vm 15.3.0',fontes_sha256:source.fontes_sha256,resultados:results},null,2)+'\n');
 console.log(JSON.stringify(results.map(r=>({projeto:r.projeto,cenario:r.cenario,passou:r.passou,checagens:r.checagens})),null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
