import {mountCdcReview,readWithDeadline,createReviewContext,documentKeys} from '../cdc-review.mjs';
const root=document.querySelector('#fixture'),out=document.querySelector('#results');
let failures=0,passes=0;
const assert=(value,text)=>{if(!value)throw Error(text);};
const el=id=>root.querySelector('#rev-'+id);
const tick=()=>new Promise(r=>setTimeout(r,0));
async function until(fn){for(let i=0;i<100;i++){if(fn())return;await new Promise(r=>setTimeout(r,10));}throw Error('Tempo limite do teste');}
async function test(name,fn){try{await fn();passes++;const li=document.createElement('li');li.className='pass';li.textContent='PASSOU: '+name;out.append(li);}catch(e){failures++;const li=document.createElement('li');li.className='fail';li.textContent='FALHOU: '+name+' / '+e.message;out.append(li);}finally{document.querySelectorAll('dialog').forEach(d=>d.remove());}}
const base=()=>({id:'ficticio',cliente:'Cliente de teste',dadosCliente:{cpf:'00000000000'},valor:500,parcela:50,prazo:12,taxa:1.5,dataPrimeira:'2026-12-19',analiseCdc:{questionario:{renda:2000,despesas:500,outrasParcelas:0,restricao:'nao',cpfNaIdentidade:true,documentosConferidos:true},observacoes:'Recebida'}});
async function setup(options={}){
  root.innerHTML='';let sim=base(),writes=0,docs=options.docs||{},config={automatica:options.auto??true};
  if(options.readings)sim.analiseDocumentos=options.readings;
  const ctx={auth:{currentUser:{uid:'admin-ficticio',getIdToken:async()=> 'token-ficticio'}},db:{collection:()=>({doc:()=>({get:async()=>({exists:true,data:()=>config}),set:async value=>{config=value;}})})},loadSim:async()=>structuredClone(sim),saveSim:async s=>{if(options.failSave)throw Error('Falha de gravação simulada');writes++;sim=structuredClone(s);},listSims:options.history||(async()=>[structuredClone(sim)]),loadDocumentos:options.loadDocs||(async()=>structuredClone(docs)),saveDocumento:async(id,k,d)=>{docs[k]=d;}};
  await mountCdcReview(sim.id,root,ctx);await tick();
  return {ctx,get sim(){return sim;},get writes(){return writes;}};
}
async function click(id){el(id).click();await until(()=>root.getAttribute('aria-busy')!=='true');}
document.querySelector('#start').onclick=async function(){
  this.disabled=true;out.innerHTML='';passes=failures=0;
  await test('Prazo máximo para leituras sem resposta',async()=>{let failed=false;try{await readWithDeadline(()=>new Promise(()=>{}),'teste',5);}catch{failed=true;}assert(failed,'Leitura não expirou');});
  await test('Consulta administrativa não sincroniza outras propostas',async()=>{
    let fallback=0;
    const db={collection:()=>({
      get:async()=>({docs:[{id:'id',data:()=>({cliente:'Teste'})}]}),
      doc:id=>({get:async()=>({id,exists:true,data:()=>({cliente:'Teste'})}),collection:()=>({get:async()=>({docs:[]})})})
    })};
    const ctx=createReviewContext({db,listSims:()=>{fallback++;throw Error('Não usar');}});
    assert((await ctx.listSims())[0].id==='id','IDs');await ctx.loadSim('id');await ctx.loadDocumentos('id');assert(!fallback,'Chamou fluxo antigo');
  });
  await test('Botões prontos mesmo com histórico ainda carregando',async()=>{const f=await setup({history:()=>new Promise(()=>{})});for(const k of ['save','analyze','approve','refuse'])assert(typeof el(k).onclick==='function',k+' sem ação');await click('save');assert(f.writes===1,'Não salvou');});
  await test('Falha no histórico não impede salvar a ficha',async()=>{const f=await setup({history:async()=>{throw Error('Histórico indisponível');}});await click('save');assert(f.writes===1,'Não salvou');assert(el('history').textContent.includes('indisponível'),'Aviso ausente');});
  await test('Falha nos anexos não deixa botões sem ação',async()=>{await setup({loadDocs:async()=>{throw Error('Anexos indisponíveis');}});await click('save');assert(el('output').textContent.includes('salva'),'Salvar indisponível');assert([...root.querySelectorAll('[data-files]')].every(x=>x.textContent.includes('Não foi possível')),'Aviso');});
  await test('Salvar valores com vírgulas e preservar anexos',async()=>{const f=await setup();el('renda').value='2.350,75';await click('save');assert(f.sim.analiseCdc.questionario.renda===2350.75,'Conversão');assert(!el('save').disabled,'Ficou bloqueado');});
  await test('Falha de salvamento informa erro e permite nova tentativa',async()=>{await setup({failSave:true});await click('save');assert(el('output').textContent.includes('Falha de gravação'),'Sem aviso');for(const k of ['save','analyze','renda'])assert(!el(k).disabled,k+' bloqueado');});
  await test('Clique repetido não grava duas vezes',async()=>{const f=await setup();el('save').click();el('save').click();await until(()=>!el('save').disabled);assert(f.writes===1,'Dupla gravação');});
  await test('Modo manual responde ao botão analisar',async()=>{await setup({auto:false});await click('analyze');assert(document.querySelector('dialog')?.textContent.includes('desligada'),'Sem diálogo');});
  await test('Sem documentos: análise pendente com motivos e botão OK',async()=>{const f=await setup();el('documentosConferidos').checked=true;await click('analyze');assert(f.sim.analiseCdc.resultado.status==='Pendente','Estado incorreto');const dialog=document.querySelector('dialog');assert(dialog?.open,'Diálogo ausente');assert(el('observacoes').value.includes('obrigatório'),'Sem motivos');dialog.querySelector('button').click();assert(!document.querySelector('dialog[open]'),'Não fechou');});
  await test('Restrição informada retorna recusa na avaliação',async()=>{const f=await setup();el('restricao').value='sim';await click('analyze');assert(f.sim.analiseCdc.resultado.status==='Recusada','Resultado');assert(!f.sim.analiseCdc.decisao,'Decisão final não deve ser confirmada pelo teste');});
  await test('Histórico inacessível nunca produz aprovação',async()=>{const f=await setup({history:async()=>{throw Error('Falha no histórico');}});await click('analyze');assert(f.sim.analiseCdc.resultado.status==='Pendente','Falha virou aprovação');assert(!el('save').disabled,'Não desbloqueou');});
  await test('Ler anexos sem arquivo mostra orientação e desbloqueia',async()=>{await setup();root.querySelector('[data-read]').click();await until(()=>!el('save').disabled);assert(el('output').textContent.includes('Anexe'),'Sem orientação');});
  await test('Leitura antiga incompleta não interrompe montagem',async()=>{await setup({readings:{rgFrente:{hash:'antigo'}},docs:{rgFrente:{nome:'teste.pdf',dataUrl:'data:application/pdf;base64,VEVTVEU='}}});assert(typeof el('analyze').onclick==='function','Botão');assert(root.querySelector('[data-result]').textContent.includes('aguardando'),'Leitura inválida');assert(documentKeys(null,'rgFrente').length===0,'Dados ausentes');});
  await test('Todos os campos editáveis e ações de anexos conectados',async()=>{await setup();for(const k of ['renda','despesas','outrasParcelas','restricao','reason','cpfNaIdentidade','documentosConferidos'])assert(!el(k).disabled,k+' bloqueado');assert(el('observacoes').readOnly,'Resultado deve permanecer protegido');for(const input of root.querySelectorAll('[data-doc]'))assert(typeof input.onchange==='function','Anexo desconectado');for(const button of root.querySelectorAll('[data-read]'))assert(typeof button.onclick==='function','Leitura desconectada');});
  await test('Chave de modo automático responde e salva configuração',async()=>{await setup();el('auto').checked=false;await el('auto').onchange();assert(el('output').textContent.includes('manual'),'Não mudou');assert(!el('auto').disabled,'Chave bloqueada');});
  await test('Falha do leitor não trava botões nem confirma decisão',async()=>{
    const original=window.fetch;window.fetch=async()=>{throw Error('Falha simulada');};
    try{const f=await setup({docs:{rgFrente:{nome:'teste.pdf',dataUrl:'data:application/pdf;base64,VEVTVEU='}}});await click('analyze');assert(f.sim.analiseCdc.resultado.status==='Pendente','Resultado indevido');assert(!el('save').disabled,'Bloqueado');assert(el('observacoes').value.includes('leitura'),'Motivos ausentes');}finally{window.fetch=original;}
  });
  await test('Leitura fictícia completa, resultado, OK e confirmação manual',async()=>{
    const docs=Object.fromEntries([['rgFrente','identidade'],['comprovanteResidencia','residencia'],['comprovanteRenda','renda']].map(([k,t])=>[k,{nome:t+'.pdf',dataUrl:'data:application/pdf;base64,'+btoa(t)}]));
    const original=window.fetch;let reads=0;
    window.fetch=async(url,options)=>{assert(url.includes('/api/cdc/document'),'Destino inesperado');reads++;const type=atob(JSON.parse(options.body).dataUrl.split(',')[1]);return {ok:true,json:async()=>({document:{tipo:type,legibilidade:'legivel',cpf:'00000000000',rendaLiquida:type==='renda'?2000:null,competencias:['2026-10'],observacoes:'Teste local'}})};};
    try{const f=await setup({docs});el('documentosConferidos').checked=true;await click('analyze');assert(reads===3,'Leituras');assert(f.sim.analiseCdc.resultado.status==='Aprovada','Resultado');assert(!f.sim.analiseCdc.decisao,'Confirmação automática indevida');document.querySelector('dialog button').click();await tick();el('reason').value='Conferência fictícia';await click('approve');assert(f.sim.analiseCdc.decisao.status==='Aprovada','Não confirmou');await click('save');assert(f.sim.analiseCdc.decisao.status==='Aprovada','Salvar sem mudanças apagou decisão');}finally{window.fetch=original;}
  });
  await test('Aprovação manual exige motivo',async()=>{const f=await setup({auto:false});await click('approve');assert(el('output').textContent.includes('motivo'),'Sem validação');assert(!f.sim.analiseCdc.decisao,'Aprovou sem motivo');});
  await test('Recusa manual fictícia registra motivo',async()=>{const f=await setup({auto:false});el('reason').value='Teste local';await click('refuse');assert(f.sim.analiseCdc.decisao.status==='Recusada','Não gravou');assert(f.sim.analiseCdc.decisao.motivo==='Teste local','Motivo');});
  await test('Automático não permite confirmar sem avaliação aprovada',async()=>{const f=await setup();el('reason').value='Teste';await click('approve');assert(!f.sim.analiseCdc.decisao,'Ignorou guarda');assert(el('output').textContent.includes('Conclua'),'Sem aviso');});
  await test('Sessão encerrada recebe aviso sem gravar',async()=>{const f=await setup();f.ctx.auth.currentUser=null;await click('save');assert(!f.writes,'Gravou sem sessão');assert(el('output').textContent.includes('sessão'),'Sem aviso');});
  document.querySelector('#summary').textContent=`${passes} testes passaram; ${failures} falharam.`;
  await setup();this.disabled=false;
};
