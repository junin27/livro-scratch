// Renderiza em WAV a saída do Scratch Audio para os projetos exportados.
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const modules=path.join(__dirname,'../tmp/scratch-runtime/node_modules');
const VM=require(path.join(modules,'@scratch/scratch-vm/src/index.js'));
const {ScratchStorage}=require(path.join(modules,'@scratch/scratch-storage'));
const {RenderingAudioContext,encoder}=require(path.join(modules,'web-audio-engine'));
const AudioEngine=require(path.join(modules,'scratch-audio/src'));
const FakeTimers=require(path.join(modules,'@sinonjs/fake-timers'));
const pasta=path.join(__dirname,'../tmp/testes-scratch');

async function prepararAmostrasMusica(){
 const entrada=pathToFileURL(require.resolve(path.join(modules,'mpg123-decoder'))).href;
 const {MPEGDecoder}=await import(entrada);
 const decodificador=new MPEGDecoder();
 await decodificador.ready;
 const manifest=path.join(modules,'@scratch/scratch-vm/src/extensions/scratch3_music/manifest.js');
 const pastaAmostras=path.join(path.dirname(manifest),'assets');
 const piano='instruments/1-piano';
 const arquivos=['drums/1-snare.mp3',...fs.readdirSync(path.join(pastaAmostras,piano)).map(nome=>`${piano}/${nome}`)];
 const amostras={};
 try{
  for(const arquivo of arquivos){
   const pcm=decodificador.decode(fs.readFileSync(path.join(pastaAmostras,arquivo)));
   assert.equal(pcm.errors.length,0,arquivo);
   assert(pcm.samplesDecoded>0,arquivo);
   amostras[arquivo]=await encoder.encode(pcm,{bitDepth:32,float:true});
   await decodificador.reset();
  }
 }finally{
  decodificador.free();
 }
 // No editor, o empacotador fornece os bytes do manifesto. Aqui o Node fornece
 // as mesmas amostras, decodificadas em WAV, para a extensão oficial.
 require.cache[manifest]={id:manifest,filename:manifest,loaded:true,exports:amostras};
}

async function renderizadorNativo(duracaoMs){
 const entrada=pathToFileURL(require.resolve(path.join(modules,'node-web-audio-api'))).href;
 const {OfflineAudioContext}=await import(entrada);
 const contexto=new OfflineAudioContext(2,(duracaoMs+40)*48,48000);
 let renderizacao;
 let paradas;
 return {
  contexto,
  sufixo:'-web-audio-nativo',
  async avancar(ms){
   if(renderizacao)await contexto.resume();
   else{
    // Registre todas as suspensões antes de chamar startRendering.
    paradas=Array.from({length:duracaoMs/20},(_,i)=>contexto.suspend((i+1)/50));
    renderizacao=contexto.startRendering();
   }
   await paradas[ms/20-1];
  },
  async exportar(){
   await contexto.resume();
   const buffer=await renderizacao;
   const channelData=Array.from({length:buffer.numberOfChannels},(_,canal)=>{
    const dados=new Float32Array(buffer.length);
    buffer.copyFromChannel(dados,canal);
    return dados;
   });
   return {sampleRate:buffer.sampleRate,channelData};
  },
 };
}

async function renderizar(projeto,executar,renderizador){
 const contexto=renderizador?.contexto||new RenderingAudioContext({sampleRate:48000,numberOfChannels:2});
 if(!renderizador)await contexto.resume();
 // Scratch Audio registra eventos de desbloqueio no document.body. O renderer
 // offline já está em execução e não recebe eventos de toque ou mouse reais.
 const documentoOriginal=global.document;
 let audio;
 try{
  global.document={body:[]};
  // O Scratch Audio só usa o estado inicial para aguardar um gesto no editor.
  // O teste nativo começa suspenso para programar os primeiros nós antes da renderização.
  if(renderizador)Object.defineProperty(contexto,'state',{value:'running',configurable:true});
  audio=new AudioEngine(contexto);
 }finally{
  if(renderizador)delete contexto.state;
  if(documentoOriginal===undefined)delete global.document;
  else global.document=documentoOriginal;
 }
 const vm=new VM();
 vm.attachStorage(new ScratchStorage());
 vm.attachAudioEngine(audio);
 const decodificacoes=[];
 const decodificar=audio.decodeSoundPlayer.bind(audio);
 audio.decodeSoundPlayer=(...args)=>{
  const resultado=decodificar(...args);
  decodificacoes.push(resultado);
  return resultado;
 };
 const clock=FakeTimers.install({now:1700000000000,toFake:['Date','setTimeout','clearTimeout']});
 const eventos=[];
 let ms=0;
 const falas=[];
 try{
  const sb3=fs.readFileSync(path.join(pasta,'projetos',`${projeto}.sb3`));
  await vm.loadProject(sb3);
  // A extensão Música dispara a decodificação em segundo plano ao carregar.
  await Promise.all(decodificacoes);
  audio.decodeSoundPlayer=decodificar;
  vm.runtime.currentStepTime=1;
  vm.runtime.sequencer.timer.nowObj={now:()=>performance.now()};
  vm.runtime.on('SAY',(_ator,_tipo,texto)=>{
   if(texto)falas.push({ms,texto:String(texto)});
  });
  for(const [opcode,campo,nome] of [['music_playNoteForBeats','NOTE','nota'],['music_playDrumForBeats','DRUM','tambor']]){
   const tocar=vm.runtime._primitives[opcode];
   if(!tocar)continue;
   vm.runtime._primitives[opcode]=(args,util)=>{
    if(!util.stackFrame.timer)eventos.push({som:`${nome} ${args[campo]}`,ator:util.target.getName(),ms,audio_ms:contexto.currentTime*1000,volume:util.target.volume,tempos:Number(args.BEATS)});
    return tocar(args,util);
   };
  }
  for(const ator of vm.runtime.targets){
   const banco=ator.sprite.soundBank;
   if(!banco||ator.sprite.sounds.length===0)continue;
   const tocar=banco.playSound.bind(banco);
   banco.playSound=(emissor,id)=>{
    const som=emissor.sprite.sounds.find(clip=>clip.soundId===id);
    eventos.push({som:som?.name,ator:emissor.getName(),ms,audio_ms:contexto.currentTime*1000,volume:emissor.volume});
    return tocar(emissor,id);
   };
  }
  const entrada={
   vm,
   verde:()=>vm.greenFlag(),
   clicar:nome=>vm.runtime.startHats('event_whenthisspriteclicked',null,vm.runtime.targets.find(ator=>ator.getName()===nome)),
   tecla:(key,isDown)=>vm.postIOData('keyboard',{key,isDown}),
   resposta:valor=>vm.runtime.emit('ANSWER',valor),
   async avancar(quantos){
    const fim=ms+quantos;
    while(ms<fim){
     vm.runtime._step();
     ms+=20;
     if(renderizador)await renderizador.avancar(ms);
     else contexto.processTo(ms/1000);
     await clock.tickAsync(20);
    }
   },
  };
  await executar(entrada);
  const sinal=renderizador?await renderizador.exportar():contexto.exportAsAudioData();
  const picoNoIntervalo=(inicio,fim)=>sinal.channelData.reduce((maximo,canal)=>{
   const amostras=canal.subarray(Math.round(inicio*sinal.sampleRate/1000),Math.round(fim*sinal.sampleRate/1000));
   return amostras.reduce((max,valor)=>Math.max(max,Math.abs(valor)),maximo);
  },0);
  const pico=picoNoIntervalo(0,ms);
  for(const [i,evento] of eventos.entries())evento.pico=picoNoIntervalo(evento.audio_ms,eventos[i+1]?.audio_ms??ms);
  fs.mkdirSync(path.join(pasta,'audio'),{recursive:true});
  const nomeWav=`${projeto}${renderizador?.sufixo??''}.wav`;
  fs.writeFileSync(path.join(pasta,'audio',nomeWav),Buffer.from(await encoder.encode(sinal)));
  const variaveis=Object.fromEntries(Object.values(vm.runtime.getTargetForStage().variables).filter(v=>v.type==='').map(v=>[v.name,v.value]));
  return {projeto,eventos,falas,pico,variaveis,sb3_sha256:createHash('sha256').update(sb3).digest('hex'),arquivo:`tmp/testes-scratch/audio/${nomeWav}`};
 }finally{
  vm.quit();
  clock.uninstall();
 }
}

async function main(){
 await prepararAmostrasMusica();
 const resultados=[];
 const comparacao=[];
 const clique=async teste=>{
  teste.verde();
  await teste.avancar(100);
  teste.clicar('Gato');
  await teste.avancar(1100);
 };
 const simulacaoColisao=async teste=>{
  const primitivos=teste.vm.runtime._primitives;
  const sensorOriginal=primitivos.sensing_touchingobject;
  primitivos.sensing_touchingobject=(args,util)=>{
   const ator=util.target;
   if(ator.getName()==='Maçã'&&!ator.isOriginal&&args.TOUCHINGOBJECTMENU==='Cesta')return Math.abs(ator.x)<1&&ator.y<=-138;
   return sensorOriginal(args,util);
  };
  teste.verde();
  await teste.avancar(2750);
 };
 const casos=[
  ['C04-miau',clique,['Miau']],
  ['C04-espera-miau',async t=>{t.verde();await t.avancar(1400);},['Miau']],
  ['C04-volume-miau',async t=>{t.verde();await t.avancar(3100);},['Miau','Miau','Miau']],
  ['C06-espaco-miau',async t=>{t.tecla(' ',true);await t.avancar(100);t.tecla(' ',false);await t.avancar(1000);},['Miau']],
  ['C13-cliques-com-som',clique,['Miau']],
  ['C10-historia-com-musica',async t=>{t.verde();await t.avancar(12100);},['Música','Música']],
  ['C17-pop-coleta',simulacaoColisao,null],
  ['C17-pop-sem-coleta',simulacaoColisao,[]],
  ['C18-quiz-sons',async t=>{
   t.verde();await t.avancar(160);
   for(const resposta of ['4','Rio','7']){t.resposta(resposta);await t.avancar(1600);}
  },['Collect','Oops','Collect']],
  ['C20-jogo-final-corrida',async t=>{
   t.verde();await t.avancar(120);
   for(const tecla of [' ','a','a','a','a','a','a']){
    t.tecla(tecla,true);await t.avancar(80);t.tecla(tecla,false);await t.avancar(80);
   }
   await t.avancar(1100);
  },['Vitória']],
  ['C04-notas',async t=>{t.verde();await t.avancar(1900);},['nota 60','nota 62','nota 64']],
  ['C04-parabens',async t=>{t.verde();await t.avancar(2400);},['nota 67','nota 67','nota 69','nota 67']],
  ['C04-danca',async t=>{t.verde();await t.avancar(2400);},Array(8).fill('tambor 1')],
  ['C07-batidas-medidas',async t=>{t.verde();await t.avancar(4200);},Array(5).fill('tambor 1')],
 ];
 for(const [projeto,cena,sons] of casos){
  const resultado=await renderizar(projeto,cena);
  if(sons===null){
   assert(resultado.eventos.length>0,projeto);
   assert.equal(resultado.eventos.length,resultado.variaveis.pontos,projeto);
   assert(resultado.eventos.every(evento=>evento.som==='Pop'),projeto);
  }else assert.deepEqual(resultado.eventos.map(evento=>evento.som),sons,projeto);
  const eventosComSinal=resultado.eventos.filter(evento=>evento.pico>0.001).length;
  if(projeto==='C04-danca'||projeto==='C07-batidas-medidas'){
   assert(eventosComSinal>0,'O desafio deve gerar algum sinal de tambor');
   resultado.pulsos_com_sinal=eventosComSinal;
   if(eventosComSinal!==resultado.eventos.length)resultado.observacao='O primeiro renderizador deixou janelas sem sinal. A contraprova nativa está registrada abaixo.';
   const duracao=projeto==='C04-danca'?2400:4200;
   const nativo=await renderizar(projeto,cena,await renderizadorNativo(duracao));
   assert.deepEqual(nativo.eventos.map(evento=>evento.som),sons,projeto);
   // Uma batida completa tem pico muito acima da cauda da batida anterior.
   nativo.pulsos_com_sinal=nativo.eventos.filter(evento=>evento.pico>0.2).length;
   assert.equal(nativo.pulsos_com_sinal,sons.length,`Batidas completas no renderizador nativo: ${projeto}`);
   comparacao.push(nativo);
   console.log(projeto,'Web Audio nativo',`${nativo.pulsos_com_sinal}/${sons.length} janelas com sinal`);
  }else assert.equal(eventosComSinal,resultado.eventos.length,`Saída de áudio incompleta: ${projeto}`);
  if(sons?.length===0)assert.equal(resultado.pico,0,projeto);
  if(projeto==='C04-espera-miau')assert(resultado.falas.find(fala=>fala.texto==='Pronto!')?.ms>=840,'Pronto! deve vir após o Miau');
  if(projeto==='C04-volume-miau'){
   assert.deepEqual(resultado.eventos.map(e=>e.volume),[100,80,60]);
   assert(resultado.eventos[0].pico>resultado.eventos[1].pico&&resultado.eventos[1].pico>resultado.eventos[2].pico);
  }
  if(projeto==='C07-batidas-medidas'){
   const intervalos=resultado.eventos.slice(1).map((evento,i)=>evento.ms-resultado.eventos[i].ms);
   assert(intervalos.every(ms=>ms>=750&&ms<=850),'A duração da batida entra no intervalo entre inícios');
   resultado.intervalos_ms=intervalos;
  }
  resultados.push(resultado);
  console.log(projeto,`${eventosComSinal}/${resultado.eventos.length} janelas com sinal`,resultado.pico.toFixed(4));
 }
 fs.writeFileSync(path.join(__dirname,'resultados-audio.json'),JSON.stringify({
  metodo:'Scratch VM 15.3.0 e Scratch Audio 2.0.272 renderizados localmente em WAV pelo web-audio-engine 0.13.4',
  extensao_musica:'Amostras oficiais de piano e caixa do pacote Scratch VM, decodificadas pelo mpg123-decoder 1.0.3.',
  renderizador_comparacao:'node-web-audio-api 2.2.0, OfflineAudioContext.',
  limite:'Sinal digital local. Não mede os alto-falantes do navegador. Em C17, fornece o cenário de colisão ao sensor; o navegador verificou essa decisão separadamente.',
  resultados,
  comparacao_web_audio_nativo:comparacao,
 },null,2)+'\n');
}

main().catch(erro=>{console.error(erro);process.exitCode=1;});
