import {freshServerRead} from '../cdc-firestore-read.mjs?v=20261120-contract-v9';
import {mountCdcReview,readWithDeadline,createReviewContext,documentKeys,canonical,creditSnapshot} from '../cdc-review.mjs?v=20261120-contract-v9';
import {evaluateCredit,documentFindings,analysisSections,sectionsText} from '../cdc-policy.mjs?v=20261120-contract-v9';
import {mountCustomer,validateResidence,receiveSubmission,digest} from '../cdc-preanalise.mjs?v=20261120-contract-v9';
const root=document.querySelector('#fixture'),out=document.querySelector('#results');
let failures=0,passes=0;
const assert=(value,text)=>{if(!value)throw Error(text);};
const el=id=>root.querySelector('#rev-'+id);
const tick=()=>new Promise(r=>setTimeout(r,0));
async function until(fn){for(let i=0;i<1000;i++){if(fn())return;await new Promise(r=>setTimeout(r,10));}throw Error('Tempo limite do teste');}
async function test(name,fn){try{await fn();passes++;const li=document.createElement('li');li.className='pass';li.textContent='PASSOU: '+name;out.append(li);}catch(e){failures++;const li=document.createElement('li');li.className='fail';li.textContent='FALHOU: '+name+' / '+e.message;out.append(li);}finally{document.querySelectorAll('dialog').forEach(d=>d.remove());}}
const base=()=>({id:'ficticio',cliente:'Cliente de teste',dadosCliente:{cpf:'00000000000'},valor:500,parcela:50,prazo:12,taxa:1.5,dataPrimeira:'2026-12-19',analiseCdc:{questionario:{renda:2000,despesas:500,outrasParcelas:0,restricao:'nao',cpfNaIdentidade:true,documentosConferidos:true},observacoes:'Recebida'}});
async function setup(options={}){
  root.innerHTML='';let sim=base(),writes=0,docs=options.docs||{},config={automatica:options.auto??true};sim.analiseCdc.questionario.residenciaTitular='proprio';sim.analiseCdc.questionario.residenciaJustificativa='';
  if(options.readings)sim.analiseDocumentos=options.readings;
  const ctx={auth:{currentUser:{uid:'admin-ficticio',getIdToken:async()=> 'token-ficticio'}},db:{collection:()=>({doc:()=>({get:async()=>({exists:true,data:()=>config}),set:async value=>{config=value;}})})},onApproved:options.onApproved,loadSim:async()=>options.sorted?JSON.parse(canonical(sim)):structuredClone(sim),saveSim:async s=>{if(options.failSave)throw Error('Falha de gravação simulada');writes++;sim=options.sorted?JSON.parse(canonical(s)):structuredClone(s);},listSims:options.history||(async()=>[structuredClone(sim)]),loadDocumentos:options.loadDocs||(async()=>structuredClone(docs)),saveDocumento:async(id,k,d)=>{docs[k]=d;}};
  await mountCdcReview(sim.id,root,ctx);await tick();
  return {ctx,get sim(){return sim;},get writes(){return writes;}};
}
async function click(id){el(id).click();await until(()=>root.getAttribute('aria-busy')!=='true');}
document.querySelector('#start').onclick=async function(){
  this.disabled=true;out.innerHTML='';passes=failures=0;
  await test('Página do cliente exige justificativa apenas para terceiro',async()=>{const record={estado:'aberto',criadoEm:{toMillis:()=>Date.now()},proposta:{cliente:'Pessoa fictícia',valor:500,parcela:50,prazo:12,taxa:1.5,dataPrimeira:'2026-12-19',dataUltima:'2027-11-19'}};await mountCustomer(root,'a'.repeat(64),{db:{collection:()=>({doc:()=>({get:async()=>({exists:true,data:()=>record})})})},fb:{},logo:''});const select=root.querySelector('[name=residenciaTitular]'),area=root.querySelector('[name=residenciaJustificativa]');assert(select.required,'Escolha obrigatória');assert(!area.required&&area.parentElement.hidden,'Inicial');select.value='terceiro';select.dispatchEvent(new Event('change'));assert(area.required&&!area.parentElement.hidden,'Não abriu justificativa');let blocked=false;try{validateResidence({residenciaTitular:'terceiro',residenciaJustificativa:'  '});}catch{blocked=true;}assert(blocked,'Aceitou justificativa vazia');select.value='proprio';select.dispatchEvent(new Event('change'));assert(!area.required&&area.parentElement.hidden,'Não fechou');root.innerHTML='';});
  await test('Recebimento leva titularidade e justificativa para ficha administrativa',async()=>{let sim={id:'ficticio',linkPreanalise:'a'.repeat(64),dadosCliente:{cpf:'00000000000'}};const r={cpf:'00000000000',renda:2000,despesas:500,outrasParcelas:0,restricao:'nao',cpfNaIdentidade:true,arquivos:[],residenciaTitular:'terceiro',residenciaJustificativa:'Moro com minha mãe.'};const link={estado:'enviado',resposta:r,cpfHash:await digest(sim.linkPreanalise+r.cpf)};const intakeRef={get:async()=>({data:()=>link})};const simRef={get:async()=>({data:()=>sim})};const db={collection:n=>({doc:()=>n==='preanalisesCDC'?intakeRef:simRef}),runTransaction:async fn=>fn({get:async()=>({data:()=>sim}),update:(_,patch)=>{sim={...sim,...patch};}})};const result=await receiveSubmission(sim,{db});assert(result.analiseCdc.questionario.residenciaTitular==='terceiro','Titularidade perdida');assert(result.analiseCdc.questionario.residenciaJustificativa===r.residenciaJustificativa,'Justificativa perdida');});
  await test('Cálculo explica renda, gastos e renda mínima sem alterar taxa',()=>{const r=evaluateCredit({q:{renda:1500,despesas:1300,outrasParcelas:100,restricao:'sim',documentosConferidos:true},parcela:261.43});assert(r.motivos.length===3,'Motivos devem ser separados');assert(r.motivos[0]==='Restrição informada.','Texto');assert(r.limiteParcela===0,'Limite');assert(r.rendaMinima===3142.87,'Renda mínima');assert(r.calculo.saldo===100,'Saldo');const txt=sectionsText(r.status,analysisSections(r,{valor:1500,parcela:261.43,prazo:9,readCount:3,historyCount:0}));assert(txt.includes('\n\n2. '),'Espaçamento');assert(txt.includes('3.142,87'),'Renda mínima ausente');});
  await test('Renda ausente é pendência, nunca renda zero',()=>{const r=evaluateCredit({q:{renda:null,despesas:0,outrasParcelas:0,restricao:'nao'},parcela:100});assert(r.status==='Pendente'&&r.limiteParcela===null&&r.rendaMinima===null,'Dados ausentes viraram recusa');});
  const findings=(q,readDocs)=>documentFindings({q:{renda:2000,residenciaTitular:'proprio',documentosConferidos:true,...q},cliente:'José da Silva',cpf:'00000000000',readDocs});
  const doc=(key,tipo,nome,extra={})=>({key,label:key+' fictício.pdf',d:{tipo,nome,cpf:null,legibilidade:'legivel',...extra}});
  await test('José na ficha e Maria no documento exige conferência explícita',()=>{const r=findings({},[doc('rgFrente','identidade','Maria da Silva')]);assert(r.pending.some(x=>x.includes('José da Silva')&&x.includes('Maria da Silva')),'Nomes não comparados');});
  await test('Acentos e espaços não geram divergência de nome',()=>{const r=findings({},[doc('rgFrente','identidade',' JOSE  DA SILVA ')]);assert(!r.pending.some(x=>x.includes('Nome divergente')),'Falso positivo');});
  await test('Residência de terceiro justificada não gera divergência de titular',()=>{const r=findings({residenciaTitular:'terceiro',residenciaJustificativa:'Moro com minha mãe.'},[doc('comprovanteResidencia','residencia','Maria da Silva',{cpf:'11111111111'})]);assert(!r.pending.some(x=>/divergente|falta justificar/.test(x)),'Terceiro bloqueado');assert(r.notes.some(x=>x.includes('Moro com minha mãe.')),'Justificativa ausente');});
  await test('Exceção de terceiro não se aplica a identidade nem renda',()=>{const r=findings({residenciaTitular:'terceiro',residenciaJustificativa:'Mãe'},[doc('rgFrente','identidade','Maria da Silva'),doc('comprovanteRenda','renda','Maria da Silva',{subtipo:'contracheque',rendaLiquida:1800})]);assert(r.pending.filter(x=>x.includes('Nome divergente')).length===2,'Exceção indevida');assert(r.pending.some(x=>x.includes('2.000,00')&&x.includes('1.800,00')),'Renda não explicada');});
  await test('Terceiro sem justificativa continua pendente',()=>{assert(findings({residenciaTitular:'terceiro'},[]).pending.some(x=>x.includes('falta justificar')),'Sem validação');});
  await test('Documento ilegível não acusa nome divergente',()=>{const r=findings({},[doc('rgFrente','identidade','Maria',{legibilidade:'ilegivel'})]);assert(!r.pending.some(x=>x.includes('Nome divergente')),'Nome ilegível considerado');const p=evaluateCredit({q:{renda:2000,despesas:0,outrasParcelas:0,restricao:'nao',documentosConferidos:true},parcela:100,documents:[{label:'teste.pdf',consecutivos:2,legibilidade:'ilegivel'}]});assert(p.status!=='Recusada'&&p.pendencias.some(x=>x.includes('não gera recusa automática')),'Leitor recusou automaticamente');});
  await test('Campo de residência abre, salva e preserva justificativa',async()=>{const f=await setup();el('residenciaTitular').value='terceiro';el('residenciaTitular').dispatchEvent(new Event('change'));assert(!el('residenciaBox').hidden,'Campo oculto');el('residenciaJustificativa').value='Moro com minha mãe.';await click('save');assert(f.sim.analiseCdc.questionario.residenciaJustificativa==='Moro com minha mãe.','Não persistiu');el('residenciaTitular').value='proprio';el('residenciaTitular').dispatchEvent(new Event('change'));await click('save');assert(f.sim.analiseCdc.questionario.residenciaJustificativa==='','Justificativa antiga mantida');});
  await test('Diálogo separa recusa de pendências com 8px entre motivos',async()=>{await setup();el('restricao').value='sim';await click('analyze');const d=document.querySelector('dialog');assert(d.querySelectorAll('section').length>=3,'Sem seções');const li=d.querySelector('li');assert(getComputedStyle(li).marginBottom==='8px','Espaçamento');assert(el('observacoes').value.includes('Pendências de conferência\n\n'),'Observações sem seções');});
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
  await test('Histórico inacessível nunca produz aprovação',async()=>{const f=await setup({history:async()=>{throw Error('Falha no histórico');}});await click('analyze');assert(!f.sim.analiseCdc.resultado,'Falha alterou resultado');assert(!el('save').disabled,'Não desbloqueou');});
  await test('Ver anexos sem arquivo mostra orientação e desbloqueia',async()=>{await setup();root.querySelector('[data-read]').click();await until(()=>!el('save').disabled);assert(el('output').textContent.includes('Anexe'),'Sem orientação');});
  await test('Ver anexos abre documento sem executar análise',async()=>{
    const f=await setup({docs:{rgFrente:{nome:'teste.pdf',dataUrl:'data:application/pdf;base64,JVBERi0xLjQ='},rgFrente__2:{nome:'foto.jpg',dataUrl:'data:image/jpeg;base64,YWJj'}}});
    const previous=JSON.stringify(f.sim);root.querySelector('[data-read]').click();await until(()=>!el('save').disabled);
    const dialog=document.querySelector('dialog');assert(dialog,'Visualizador não abriu');assert(dialog.querySelector('iframe').src.startsWith('blob:'),'PDF não abriu');assert(dialog.querySelector('a').target==='_blank','Nova aba');
    const second=Array.from(dialog.querySelectorAll('button')).find(b=>b.textContent.includes('foto.jpg'));second.click();assert(dialog.querySelector('img').src.startsWith('blob:'),'Imagem não abriu');assert(JSON.stringify(f.sim)===previous,'Visualização alterou ficha');dialog.querySelector('button').click();await until(()=>!document.querySelector('dialog'));assert(!document.querySelector('dialog'),'Não fechou');
  });
  await test('Leitura antiga incompleta não interrompe montagem',async()=>{await setup({readings:{rgFrente:{hash:'antigo'}},docs:{rgFrente:{nome:'teste.pdf',dataUrl:'data:application/pdf;base64,VEVTVEU='}}});assert(typeof el('analyze').onclick==='function','Botão');assert(root.querySelector('[data-result]').textContent.includes('aguardando'),'Leitura inválida');assert(documentKeys(null,'rgFrente').length===0,'Dados ausentes');});
  await test('Todos os campos editáveis e ações de anexos conectados',async()=>{await setup();for(const k of ['renda','despesas','outrasParcelas','restricao','reason','documentosConferidos'])assert(!el(k).disabled,k+' bloqueado');assert(el('observacoes').readOnly,'Resultado deve permanecer protegido');for(const input of root.querySelectorAll('[data-doc]'))assert(typeof input.onchange==='function','Anexo desconectado');for(const button of root.querySelectorAll('[data-read]'))assert(typeof button.onclick==='function','Leitura desconectada');});
  await test('Chave de modo automático responde e salva configuração',async()=>{await setup();el('auto').checked=false;await el('auto').onchange();assert(el('output').textContent.includes('manual'),'Não mudou');assert(!el('auto').disabled,'Chave bloqueada');});
  await test('Falha do leitor não trava botões nem confirma decisão',async()=>{
    const original=window.fetch;window.fetch=async()=>{throw Error('Falha simulada');};
    try{const f=await setup({docs:{rgFrente:{nome:'teste.pdf',dataUrl:'data:application/pdf;base64,VEVTVEU='}}});await click('analyze');assert(!f.sim.analiseCdc.resultado,'Resultado indevido');assert(!el('save').disabled,'Bloqueado');assert(document.querySelector('dialog').textContent.includes('leitura'),'Motivos ausentes');}finally{window.fetch=original;}
  });
  await test('Leitura fictícia completa, resultado, OK e confirmação manual',async()=>{
    const docs=Object.fromEntries([['rgFrente','identidade'],['comprovanteResidencia','residencia'],['comprovanteRenda','renda']].map(([k,t])=>[k,{nome:t+'.pdf',dataUrl:'data:application/pdf;base64,'+btoa(t)}]));
    const original=window.fetch;let reads=0;
    window.fetch=async(url,options)=>{assert(url.includes('/api/cdc/document'),'Destino inesperado');reads++;const type=atob(JSON.parse(options.body).dataUrl.split(',')[1]);return {ok:true,json:async()=>({version:'cdc-docs-tipos-v3',document:{tipo:type,subtipo:type==='renda'?'contracheque':'outro',legibilidade:'legivel',cpf:'00000000000',rendaLiquida:type==='renda'?2000:null,competencias:['2026-10'],observacoes:'Teste local'}})};};
    try{let advanced=0;const f=await setup({docs,sorted:true,onApproved:async saved=>{assert(saved.analiseCdc.decisao.status==='Aprovada','Callback antes de salvar');advanced++;}});el('documentosConferidos').checked=true;await click('analyze');assert(reads===3,'Leituras');assert(f.sim.analiseCdc.resultado.status==='Aprovada','Resultado');assert(!f.sim.analiseCdc.decisao,'Confirmação automática indevida');document.querySelector('dialog button').click();await tick();el('reason').value='Conferência fictícia';await click('approve');assert(f.sim.analiseCdc.decisao.status==='Aprovada','Não confirmou');await click('save');assert(f.sim.analiseCdc.decisao.status==='Aprovada','Salvar sem mudanças apagou decisão');assert(advanced===1,'Não avançou após aprovação salva');}finally{window.fetch=original;}
  });
  for(const [subtipo,status]of [['extrato_bancario','Aprovada'],['pagamento_inss','Aprovada'],['pix','Pendente'],['contracheque','Pendente']]){
    await test('Documento '+subtipo+' sem renda líquida: '+status,async()=>{
      const docs=Object.fromEntries([['rgFrente','identidade'],['comprovanteResidencia','residencia'],['comprovanteRenda','conta']].map(([k,t])=>[k,{nome:t+'.pdf',dataUrl:'data:application/pdf;base64,'+btoa(t)}]));
      const original=window.fetch;
      const date=new Date();const competencias=[1,2].map(n=>new Date(Date.UTC(date.getFullYear(),date.getMonth()-n,1)).toISOString().slice(0,7));
      window.fetch=async(url,options)=>{const type=atob(JSON.parse(options.body).dataUrl.split(',')[1]);return {ok:true,json:async()=>({version:'cdc-docs-tipos-v3',document:{tipo:type,subtipo:type==='conta'?subtipo:'outro',extratoBancario:subtipo==='extrato_bancario'&&type==='conta',nome:'Cliente de teste',cpf:'00000000000',legibilidade:'legivel',rendaLiquida:null,competencias}})};};
      try{const f=await setup({docs});el('documentosConferidos').checked=true;await click('analyze');assert(f.sim.analiseCdc.resultado.status===status,'Resultado inesperado: '+el('observacoes').value);await tick();if(['extrato_bancario','pagamento_inss'].includes(subtipo))assert(!root.querySelector('[data-result="comprovanteRenda"]').textContent.includes('Renda líquida: Não identificada'),'Exigiu líquido do extrato');}finally{window.fetch=original;}
    });
  }
  await test('Texto Aprovada sozinho não libera contratação e atualiza avaliação',async()=>{
    let advanced=0;const f=await setup({onApproved:()=>advanced++});f.sim.analiseCdc.observacoes='Aprovada';el('reason').value='Conferi';await click('approve');assert(!f.sim.analiseCdc.decisao&&!advanced,'Aprovou pelo texto');assert(f.sim.analiseCdc.resultado.status==='Pendente','Não atualizou a avaliação');
  });
  await test('Mudança real de questionário limpa o texto antigo de aprovação',async()=>{
    const f=await setup();f.sim.analiseCdc.resultado={status:'Aprovada'};f.sim.analiseCdc.observacoes='Aprovada';el('renda').value='3000';await click('save');assert(!f.sim.analiseCdc.resultado,'Resultado antigo mantido');assert(!el('observacoes').value.startsWith('Aprovada'),'Texto antigo mantido');
  });
  await test('Falha ao salvar aprovação não avança para contratação',async()=>{
    let advanced=0;await setup({auto:false,failSave:true,onApproved:()=>advanced++});el('reason').value='Conferência fictícia';await click('approve');assert(!advanced,'Avançou sem persistência');assert(el('output').textContent.includes('Falha de gravação'),'Sem erro');
  });
  await test('Aprovação manual salva motivo e avança uma vez',async()=>{
    let advanced=0;const f=await setup({auto:false,onApproved:()=>advanced++});el('reason').value='Conferência documental fictícia';await click('approve');assert(advanced===1&&f.sim.analiseCdc.decisao.motivo==='Conferência documental fictícia','Não concluiu');assert(f.sim.analiseCdc.snapshot,'Sem evidência da confirmação');
  });
  await test('Conferência documental salva permanece marcada',async()=>{await setup();assert(el('documentosConferidos').checked,'Conferência salva foi perdida');});
  await test('Falha no primeiro arquivo não abandona o segundo nem cria pendências fictícias',async()=>{
    const docs={rgFrente:{nome:'falha.pdf',dataUrl:'data:application/pdf;base64,'+btoa('falha')},rgFrente__2:{nome:'legivel.pdf',dataUrl:'data:application/pdf;base64,'+btoa('legivel')}};
    const original=window.fetch;let calls=0;
    window.fetch=async(url,options)=>{calls++;if(atob(JSON.parse(options.body).dataUrl.split(',')[1])==='falha')return {ok:false,json:async()=>({error:'Serviço de leitura indisponível'})};return {ok:true,json:async()=>({version:'cdc-docs-tipos-v3',document:{tipo:'identidade',subtipo:'outro',legibilidade:'legivel',nome:'Cliente de teste',cpf:'00000000000',competencias:[],observacoes:''}})};};
    try{const f=await setup({docs});await click('analyze');assert(calls===2,'Segundo arquivo não foi lido');assert(f.sim.analiseDocumentos.rgFrente__2.document.legibilidade==='legivel','Leitura válida perdida');assert(!f.sim.analiseCdc.resultado,'Erro técnico misturado com avaliação');assert(!el('observacoes').value.includes('CPF não confirmado'),'Criou pendência por leitura incompleta');assert(document.querySelector('dialog').textContent.includes('falha.pdf'),'Não identificou arquivo com falha');}finally{window.fetch=original;}
  });
  await test('Primeiro nome no extrato não gera divergência',()=>{const r=findings({},[doc('comprovanteRenda','conta','José',{subtipo:'extrato_bancario',extratoBancario:true})]);assert(!r.pending.some(x=>x.startsWith('Nome divergente')),'Abreviação virou divergência');assert(r.notes.some(x=>x.startsWith('Nome abreviado compatível')),'Compatibilidade não foi registrada');});
  await test('Número único da CIN confirma CPF sem comprovante separado',()=>{const r=findings({},[doc('rgFrente','identidade','José da Silva',{tipoIdentidade:'cin',numeroUnicoCin:'000.000.000-00'})]);assert(!r.pending.some(x=>x.startsWith('Leitura do CPF inconclusiva')),'CIN não confirmou CPF');});
  await test('CPF legível em identidade parcialmente legível não vira CPF ausente',()=>{
    const r=findings({},[doc('rgFrente','identidade','José da Silva',{cpf:'00000000000',legibilidade:'incerto'})]);
    assert(!r.pending.some(x=>x.startsWith('Leitura do CPF inconclusiva')),'Ignorou CPF extraído');
  });
  await test('Leituras paralelas preservam todos os anexos e sinalizam falha técnica do CPF',async()=>{
    const docs=Object.fromEntries([['rgFrente','identidade'],['comprovanteResidencia','residencia'],['comprovanteRenda','renda']].map(([k,t])=>[k,{nome:t+'.pdf',dataUrl:'data:application/pdf;base64,'+btoa(t)}]));
    const original=window.fetch;let active=0,peak=0;
    window.fetch=async(url,options)=>{active++;peak=Math.max(peak,active);await new Promise(r=>setTimeout(r,30));active--;const type=atob(JSON.parse(options.body).dataUrl.split(',')[1]);return {ok:true,json:async()=>({version:'cdc-docs-tipos-v3',document:{tipo:type,versaoIdentidade:2,legibilidade:'legivel',nome:'Cliente de teste',cpf:type==='identidade'?null:'00000000000',falhaLeituraCpf:type==='identidade'?'reader_timeout':undefined,observacoes:'Teste fictício'}})};};
    try{const f=await setup({docs});await click('analyze');assert(peak===2,'Não leu dois anexos simultaneamente');assert(Object.keys(f.sim.analiseDocumentos).length===3,'Perdeu uma gravação');assert(!f.sim.analiseCdc.resultado,'Falha do leitor virou ausência de CPF');}finally{window.fetch=original;}
  });
  await test('Carregamento travado é recuperado sem dados antigos',async()=>{
    const result=await freshServerRead(()=>new Promise(()=>{}),{fallback:async()=>({valor:123}),hedgeMs:5,timeoutMs:100});
    assert(result.valor===123,'Não recuperou dados do servidor');
  });
  await test('Falha de análise preserva resultado e decisão já salvos',async()=>{
    const f=await setup({history:async()=>{throw Error('Falha no carregamento');}});
    await click('save');const saved=f.sim;
    saved.analiseCdc.resultado={status:'Aprovada',motivos:['Avaliação anterior']};
    saved.analiseCdc.decisao={status:'Aprovada',motivo:'Decisão registrada'};
    await f.ctx.saveSim(saved);
    await click('analyze');
    assert(f.sim.analiseCdc.resultado.status==='Aprovada','Apagou resultado');
    assert(f.sim.analiseCdc.decisao.motivo==='Decisão registrada','Apagou decisão');
    assert(document.querySelector('dialog').textContent.includes('interrompida'),'Não distinguiu falha');
  });
  await test('Conferência da categoria exige abrir seus anexos',async()=>{
    const f=await setup({docs:{rgFrente:{nome:'IMG_1234.jpg',dataUrl:'data:image/jpeg;base64,YWJj'}}});
    const input=root.querySelector('[data-manual="rgFrente"]');input.checked=true;await input.onchange();
    assert(!f.sim.analiseCdc.conferencias?.rgFrente?.confirmado,'Confirmou sem abrir');
    assert(el('output').textContent.includes('Abra cada anexo'),'Não orientou abertura');
  });
  await test('Conferência manual por categoria salva e dispensa OCR sem aprovação final',async()=>{
    const docs=Object.fromEntries(['rgFrente','comprovanteResidencia','comprovanteRenda'].map((key,i)=>[key,{nome:'IMG_'+i+'.jpg',dataUrl:'data:image/jpeg;base64,'+btoa('ficticio'+i)}]));
    const f=await setup({docs});el('documentosConferidos').checked=false;
    for(const key of Object.keys(docs)){
      root.querySelector('[data-read="'+key+'"]').click();await until(()=>document.querySelector('dialog'));
      document.querySelector('dialog button').click();await until(()=>root.getAttribute('aria-busy')!=='true');
      const input=root.querySelector('[data-manual="'+key+'"]');input.checked=true;await input.onchange();
      assert(f.sim.analiseCdc.conferencias[key].confirmado,'Não salvou '+key);
      assert(f.sim.analiseCdc.conferencias[key].por==='admin-ficticio','Sem responsável');
    }
    const original=window.fetch;let calls=0;window.fetch=async()=>{calls++;throw Error('OCR não deve ser chamado');};
    try{await click('analyze');assert(calls===0,'Releu categoria já conferida');assert(f.sim.analiseCdc.resultado.status==='Aprovada','Conferência manual não aplicada: '+el('observacoes').value);assert(!f.sim.analiseCdc.decisao,'Confirmou crédito sozinho');}finally{window.fetch=original;}
    document.querySelector('dialog button').click();
    await mountCdcReview('ficticio',root,f.ctx);await until(()=>root.querySelector('[data-manual="rgFrente"]').checked);
    assert(root.querySelector('[data-manual="comprovanteRenda"]').checked,'Não restaurou conferência salva');
  });
  await test('RG, CIN e CNH aceitos com nove dígitos iniciais do CPF',()=>{
    for(const tipo of ['RG','CIN','CNH']){
      const r=documentFindings({q:{residenciaTitular:'proprio',documentosConferidos:true},cliente:'José Silva',cpf:'52998224725',readDocs:[{key:'rgFrente',label:'IMG_1234.jpg',d:{tipo,nome:'José Silva',cpfParcial:'529982247',legibilidade:'legivel'}}]});
      assert(!r.pending.some(x=>x.startsWith('Leitura do CPF')||x.startsWith('Documento inadequado')),'Não reconheceu '+tipo);
    }
  });
  await test('Aprovação manual exige motivo',async()=>{const f=await setup({auto:false});await click('approve');assert(el('output').textContent.includes('motivo'),'Sem validação');assert(!f.sim.analiseCdc.decisao,'Aprovou sem motivo');});
  await test('Recusa manual fictícia registra motivo',async()=>{const f=await setup({auto:false});el('reason').value='Teste local';await click('refuse');assert(f.sim.analiseCdc.decisao.status==='Recusada','Não gravou');assert(f.sim.analiseCdc.decisao.motivo==='Teste local','Motivo');});
  await test('Automático não permite confirmar sem avaliação aprovada',async()=>{const f=await setup();el('reason').value='Teste';await click('approve');assert(!f.sim.analiseCdc.decisao,'Ignorou guarda');assert(el('output').textContent.includes('Conclua'),'Sem aviso');});
  await test('Sessão encerrada recebe aviso sem gravar',async()=>{const f=await setup();f.ctx.auth.currentUser=null;await click('save');assert(!f.writes,'Gravou sem sessão');assert(el('output').textContent.includes('sessão'),'Sem aviso');});
  document.querySelector('#summary').textContent=`${passes} testes passaram; ${failures} falharam.`;
  await setup();this.disabled=false;
};
