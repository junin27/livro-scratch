// Gera projetos de teste para abrir no editor oficial. Não executa os projetos.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const JSZip=require('../tmp/scratch-runtime/node_modules/jszip');
const {project}=require('./runtime.cjs');
const {cases}=require('./executar.cjs');
const {games}=require('./projetos-finais.cjs');
const root=path.join(__dirname,'..');
const out=path.join(root,'tmp/testes-scratch/projetos');
fs.mkdirSync(out,{recursive:true});
const cats=['gato_a.svg','gato_b.svg'].map(n=>fs.readFileSync(path.join(root,'Pictures',n)));
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
async function soundLibrary(){
 const sounds=new Map();
 for(const pack of ['sons-biblioteca.sb3','trilha-biblioteca.sb3']){
  const filename=path.join(out,'..',pack);
  if(!fs.existsSync(filename))continue;
  const archive=await JSZip.loadAsync(fs.readFileSync(filename));
  const data=JSON.parse(await archive.file('project.json').async('string'));
  for(const target of data.targets){
   for(const sound of target.sounds)sounds.set(sound.name,{archive,sound});
  }
 }
 return sounds;
}
async function main(){
 const index=[];
 const library=await soundLibrary();
 for(const test of [...cases,...games]){
  const requiredSounds=Object.values(test.sounds||{}).flatMap(sounds=>Object.values(sounds));
  const missingSounds=requiredSounds.filter(sound=>!library.has(sound));
  if(missingSounds.length){
   console.warn(`Projeto ${test.id} requer sons da biblioteca local: ${[...new Set(missingSounds)].join(', ')}`);
   continue;
  }
  const data=project(test.actors,test.options||{});
  if(test.prepare)test.prepare(data);
  const zip=new JSZip();
  for(const target of data.targets){
   for(const [name,source] of Object.entries(test.sounds?.[target.name]||{})){
    const {sound,archive}=library.get(source);
    target.sounds.push({...sound,name});
    zip.file(sound.md5ext,await archive.file(sound.md5ext).async('nodebuffer'));
   }
   target.costumes.forEach((costume,i)=>{
    const custom=test.assets?.[target.name]?.[i]||test.assets?.[target.name]?.[0];
    const bytes=custom?Buffer.from(custom.svg):(target.isStage?Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="white"/><text x="12" y="25" font-size="16" fill="#555">${escape(costume.name)}</text></svg>`):cats[i%2]);
    const assetId=crypto.createHash('md5').update(bytes).digest('hex');
    Object.assign(costume,{assetId,md5ext:assetId+'.svg',rotationCenterX:custom?.cx??(target.isStage?240:47.6),rotationCenterY:custom?.cy??(target.isStage?180:50)});
    zip.file(assetId+'.svg',bytes);
   });
   Object.values(target.blocks).filter(b=>b.topLevel).forEach((b,i)=>Object.assign(b,{x:30+(i%2)*330,y:30+Math.floor(i/2)*430}));
  }
  zip.file('project.json',JSON.stringify(data));
  const filename=test.id+'.sb3';
  fs.writeFileSync(path.join(out,filename),await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}));
  index.push({id:test.id,arquivo:'tmp/testes-scratch/projetos/'+filename,itens:test.refs,adaptacoes:test.adaptacoes||[],condicoes:test.options||{}});
 }
 fs.writeFileSync(path.join(__dirname,'projetos-navegador.json'),JSON.stringify(index,null,2)+'\n');
 console.log('Projetos exportados:',index.length);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
