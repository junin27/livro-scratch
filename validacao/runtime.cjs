// Motor oficial do Scratch, com relógio controlado. Sem emulação de sensores gráficos.
const fs = require('node:fs');
const path = require('node:path');
const base = path.join(__dirname, '../tmp/scratch-runtime/node_modules');
const VM = require(path.join(base, '@scratch/scratch-vm/src/index.js'));
const FakeTimers = require(path.join(base, '@sinonjs/fake-timers'));
const source = JSON.parse(fs.readFileSync(path.join(__dirname, 'pilhas.json'), 'utf8'));
const items = new Map(source.itens.map(x => [x.id, x]));
const key = s => ({'espaço':'space','seta direita':'right arrow','seta para a direita':'right arrow','seta esquerda':'left arrow','seta para a esquerda':'left arrow','seta para cima':'up arrow','seta para baixo':'down arrow'}[s] || s);
const value = s => ({'mim mesmo':'_myself_','ponteiro do mouse':'_mouse_','mouse':'_mouse_','borda':'_edge_','tudo':'all','esquerda-direita':'left-right'}[s] || s);

function compile(stacks, targetName) {
    const blocks = {}; let serial=0;
    const variables = new Set(); const lists = new Set();
    let activeArgs=new Set();
    const procedures=new Map();
    function procedureInfo(ast) {
        const name=ast.inputs.signature.replace(/\s*@\d+@/g,'').trim();
        const args=ast.inputs.arguments||[];
        return {name,args,code:name+' %s'.repeat(args.length),ids:args.map((_,i)=>'argument'+i)};
    }
    for(const stack of stacks)if(stack[0]?.op==='procedures_definition') {
        const info=procedureInfo(stack[0]);
        procedures.set(info.code,{...info,names:info.args.map(a=>a.inputs.VARIABLE)});
    }
    function add(ast, parent=null) {
        const id=`${targetName}_${++serial}`;
        const b={opcode:ast.op,next:null,parent,inputs:{},fields:{},shadow:false,topLevel:parent===null};
        if(b.topLevel) Object.assign(b,{x:30,y:30+serial*70});
        blocks[id]=b;
        if(ast.op==='data_variable'&&activeArgs.has(ast.inputs.VARIABLE)) {
            b.opcode='argument_reporter_string_number';
            b.fields.VALUE=[ast.inputs.VARIABLE,null];
            return id;
        }
        if(ast.op==='procedures_definition') {
            const p=procedures.get(procedureInfo(ast).code);
            const protoId=`${id}_prototype`;
            const proto={opcode:'procedures_prototype',next:null,parent:id,inputs:{},fields:{},shadow:true,topLevel:false,mutation:{tagName:'mutation',children:[],proccode:p.code,argumentids:JSON.stringify(p.ids),argumentnames:JSON.stringify(p.names),argumentdefaults:JSON.stringify(p.ids.map(()=>'')),warp:'false'}};
            blocks[protoId]=proto;b.inputs.custom_block=[1,protoId];
            p.names.forEach((name,i)=>{
                const argId=protoId+'_arg'+i;
                blocks[argId]={opcode:'argument_reporter_string_number',next:null,parent:protoId,inputs:{},fields:{VALUE:[name,null]},shadow:true,topLevel:false};
                proto.inputs[p.ids[i]]=[1,argId];
            });
            return id;
        }
        if(ast.op==='procedures_call') {
            const info=procedureInfo(ast);const p=procedures.get(info.code);
            if(!p)throw Error('Definição ausente no cenário: '+info.code);
            b.mutation={tagName:'mutation',children:[],proccode:p.code,argumentids:JSON.stringify(p.ids),warp:'false'};
            info.args.forEach((v,i)=>b.inputs[p.ids[i]]=typeof v==='object'?[2,add(v,id)]:[1,[10,v]]);
            return id;
        }
        for(const [name,raw] of Object.entries(ast.inputs)) {
            let v=raw;
            if(['VARIABLE','LIST'].includes(name)) {
                const collection=name==='VARIABLE'?variables:lists;
                collection.add(v); b.fields[name]=[v,`${name}:${v}`]; continue;
            }
            if(name==='arguments'||name==='signature') continue;
            if(name==='KEY_OPTION') v=key(v);
            if(['CLONE_OPTION','TOUCHINGOBJECTMENU','TO','STYLE','STOP_OPTION'].includes(name)) v=value(v);
            if(name==='EFFECT') v=v==='cor'?'COLOR':v;
            if(name==='COLOR') {
                v=({preto:'#000000',verde:'#00ff00',vermelho:'#ff0000',azul:'#0000ff'}[v]||v);
                b.inputs[name]=[1,[9,v]];
                continue;
            }
            const isField = ['STYLE','EFFECT','STOP_OPTION'].includes(name) ||
                (ast.op==='event_whenkeypressed'&&name==='KEY_OPTION') || name==='BROADCAST_OPTION';
            if(isField) b.fields[name]=[v,name==='BROADCAST_OPTION'?`msg:${v}`:null];
            else if(typeof v==='object') b.inputs[name]=[2,add(v,id)];
            else if(name==='BROADCAST_INPUT') b.inputs[name]=[1,[11,v,`msg:${v}`]];
            else b.inputs[name]=[1,[10,v]];
        }
        if(ast.op==='looks_goforwardbackwardlayers') b.fields.FORWARD_BACKWARD=['backward',null];
        if(ast.op==='looks_costumenumbername') b.fields.NUMBER_NAME=['number',null];
        if(ast.body?.length) b.inputs.SUBSTACK=[2,chain(ast.body,id)];
        if(ast.else?.length) b.inputs.SUBSTACK2=[2,chain(ast.else,id)];
        return id;
    }
    function chain(seq,parent=null) {
        let first=null,prev=null;
        for(const ast of seq) {
            const id=add(ast,prev||parent);
            if(prev) blocks[prev].next=id;
            else first=id;
            prev=id;
        }
        return first;
    }
    for(const stack of stacks) {
        activeArgs=new Set(stack[0]?.op==='procedures_definition'?procedures.get(procedureInfo(stack[0]).code).names:[]);
        chain(stack);
    }
    return {blocks,variables,lists};
}

function project(actors, options={}) {
    const compiled=actors.map(a=>compile(a.stacks,a.name));
    const vars={};const lists={};
    for(const [n,v] of Object.entries(options.variables||{}))vars[`VARIABLE:${n}`]=[n,v];
    for(const [n,v] of Object.entries(options.lists||{}))lists[`LIST:${n}`]=[n,v];
    for(const c of compiled) {
        for(const n of c.variables) vars[`VARIABLE:${n}`]=[n, options.variables?.[n] ?? 0];
        for(const n of c.lists) lists[`LIST:${n}`]=[n,options.lists?.[n]||[]];
    }
    const names=options.costumes||['fantasia1','fantasia2','alegre','triste'];
    const costume=n=>({name:n,assetId:'00000000000000000000000000000000',dataFormat:'svg',md5ext:'00000000000000000000000000000000.svg',rotationCenterX:20,rotationCenterY:20});
    const stage={isStage:true,name:'Stage',variables:vars,lists,broadcasts:{},blocks:{},comments:{},currentCostume:0,costumes:(options.backdrops||['início','jogo','cena 1','cena 2','praia','Fim de jogo']).map(costume),sounds:[],volume:100,layerOrder:0,tempo:60,videoTransparency:50,videoState:'off',textToSpeechLanguage:null};
    const targets=[stage];
    actors.forEach((a,i)=>{
        const t={isStage:false,name:a.name,variables:{},lists:{},broadcasts:{},blocks:compiled[i].blocks,comments:{},currentCostume:0,costumes:names.map(costume),sounds:[],volume:100,layerOrder:i+1,visible:true,x:0,y:0,size:100,direction:90,draggable:false,rotationStyle:'all around'};
        if(a.name==='Stage') stage.blocks=t.blocks;
        else targets.push({...t,...a.initial});
    });
    return {targets,monitors:[],extensions:[],meta:{semver:'3.0.0',vm:'15.3.0',agent:'Livro Scratch - validação'}};
}

function stacks(id,indexes) {
    const item=items.get(id); if(!item) throw Error(id);
    const selected=indexes?indexes.map(i=>item.ast[i]):item.ast;
    if(selected.some(x=>!x)) throw Error('Tradução pendente: '+id);
    return structuredClone(selected);
}

async function session(actors,options={}) {
    const clock=FakeTimers.install({now:1700000000000,toFake:['Date','setTimeout','clearTimeout']});
    const vm=new VM(); const trace=[]; const counts={}; let elapsed=0;
    try {
        // Renderização e áudio não são simulados. Casos que os exigem ficam pendentes.
        const data=project(actors,options);
        await vm.loadProject(JSON.stringify(data));
        // O orçamento do escalonador usa tempo real; o programa usa o relógio
        // virtual. Assim um laço sem renderer não bloqueia o avanço do relógio.
        vm.runtime.currentStepTime=1;
        vm.runtime.sequencer.timer.nowObj={now:()=>performance.now()};
        const lastSay=new Map();
        vm.runtime.on('SAY',(target,type,text)=>{
            const signature=type+':'+String(text);
            if(lastSay.get(target.id)!==signature){trace.push({ms:elapsed,event:'SAY',target:target.getName(),type,text:String(text)});lastSay.set(target.id,signature);}
        });
        const original={};
        for(const [op,fn] of Object.entries(vm.runtime._primitives)) {
            original[op]=fn;
            vm.runtime._primitives[op]=function(args,util){
                counts[op]=(counts[op]||0)+1;
                const previous=trace.at(-1);
                const current={ms:elapsed,event:'BLOCK',op,target:util.target.getName(),args:structuredClone(args)};
                if(previous?.event==='BLOCK'&&previous.ms===elapsed&&previous.op===op&&JSON.stringify(previous.args)===JSON.stringify(args))previous.repeticoes=(previous.repeticoes||1)+1;
                else if(trace.length<2000)trace.push(current);
                return fn(args,util);
            };
        }
        const ctx={vm,trace,counts,clock,
            target:(name=actors.find(a=>a.name!=='Stage')?.name)=>vm.runtime.targets.find(t=>t.isOriginal&&t.getName()===name),
            green:()=>vm.greenFlag(),
            click:(name)=>vm.runtime.startHats('event_whenthisspriteclicked',null,ctx.target(name)),
            keyboard:(name,down)=>vm.postIOData('keyboard',{key:({'space':' ','right arrow':'ArrowRight','left arrow':'ArrowLeft','up arrow':'ArrowUp','down arrow':'ArrowDown'}[key(name)]||key(name)),isDown:down}),
            broadcast:(name)=>vm.runtime.startHats('event_whenbroadcastreceived',{BROADCAST_OPTION:name}),
            answer:text=>vm.runtime.emit('ANSWER',text),
            async advance(ms){
                for(let time=0;time<ms;time+=20){vm.runtime._step(); await clock.tickAsync(20); elapsed+=20;}
            },
            state(){return vm.runtime.targets.map(t=>({name:t.getName(),original:t.isOriginal,x:t.x,y:t.y,direction:t.direction,size:t.size,visible:t.visible,costume:t.currentCostume,effects:t.effects,balao:t.getCustomState('Scratch.looks')?.text||'',variables:Object.fromEntries(Object.values(t.variables).map(v=>[v.name,v.value]))}));},
            close(){vm.stopAll();vm.quit();clock.uninstall();},
        };
        return ctx;
    } catch(e){ vm.quit();clock.uninstall();throw e; }
}
module.exports={session,stacks,items,project,source};
