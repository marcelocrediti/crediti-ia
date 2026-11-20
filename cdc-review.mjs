import {categoryEvidence,manualConfirmed} from './cdc-manual-review.mjs?v=20261120-contract-v9';
import {needsInternalReview} from './cdc-status.mjs?v=20261120-contract-v9';
import {readFirestore} from './cdc-firestore-read.mjs?v=20261120-contract-v9';
import {evaluateCredit,POLICY_VERSION,documentFindings,analysisSections,sectionsText,documentIncomeSummary,completeCpf,documentCpf} from './cdc-policy.mjs?v=20261120-contract-v9';
import {showAttachments} from './cdc-document-viewer.mjs?v=20261120-contract-v9';
const API='https://crediti-ia-api.onrender.com/api/cdc/document';
const DOCS=[['rgFrente','Identidade: RG, CIN ou CNH'],['cpfFrente','CPF (se não constar na identidade)'],['comprovanteResidencia','Comprovante de residência'],['comprovanteRenda','Renda: 3 contracheques/holerites, extrato de pagamento do INSS ou extrato/comprovante bancário dos últimos 60 dias. Comprovante Pix não é aceito']];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');
const number=v=>{let text=String(v).trim();if(text.includes(','))text=text.replace(/\./g,'').replace(',','.');else if(/^\d{1,3}(\.\d{3})+$/.test(text))text=text.replace(/\./g,'');return Number(text);};
// Firestore may return map keys in a different order. Compare values, not insertion order.
export const canonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
export const normalizedQuestionnaire=q=>({renda:q?.renda==null||q.renda===''?null:number(q.renda),despesas:q?.despesas==null||q.despesas===''?null:number(q.despesas),outrasParcelas:q?.outrasParcelas==null||q.outrasParcelas===''?null:number(q.outrasParcelas),restricao:q?.restricao||'',residenciaTitular:q?.residenciaTitular||'',residenciaJustificativa:q?.residenciaTitular==='terceiro'?String(q.residenciaJustificativa||'').trim():'',documentosConferidos:q?.documentosConferidos===true});
export const sameQuestionnaire=(a,b)=>canonical(normalizedQuestionnaire(a))===canonical(normalizedQuestionnaire(b));
export const formatAmount=v=>v===null||v===undefined||v===''?'':Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
export const currentDocumentReading=(r,key)=>!!r?.document&&r.versaoLeitor==='cdc-docs-tipos-v3'&&(!['rgFrente','cpfFrente'].includes(key)||!!documentCpf(r.document)||r.document.versaoIdentidade===3);
export const reusableDocumentReading=(r,key,now=Date.now())=>currentDocumentReading(r,key)&&!r.document.falhaLeituraCpf&&(!['rgFrente','cpfFrente'].includes(key)||!!documentCpf(r.document)||now-Number(r.lidoEm||0)<30000);
export async function mapConcurrent(items,limit,operation){
  let next=0;const results=new Array(items.length);
  await Promise.all(Array.from({length:Math.min(limit,items.length)},async()=>{while(next<items.length){const i=next++;try{results[i]={status:'fulfilled',value:await operation(items[i],i)};}catch(reason){results[i]={status:'rejected',reason};}}}));
  return results;
}
export function serialUpdates(){
  let tail=Promise.resolve();
  return operation=>{const next=tail.then(operation);tail=next.catch(()=>{});return next;};
}
export const documentKeys=(docs,key)=>Object.keys(docs||{}).filter(k=>k===key||k.startsWith(key+'__')||(key==='rgFrente'&&k==='rgVerso')).filter(k=>docs[k]?.dataUrl).sort();
// Bound reads, not writes: a timed-out write may still commit and must not be retried blindly.
export async function readWithDeadline(operation,label,ms=20000){
  let timer;
  try{return await Promise.race([Promise.resolve().then(operation),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('O serviço demorou para carregar '+label+'. Essa falha não indica falta de documentos nem reprovação.')),ms);})]);}
  finally{clearTimeout(timer);}
}
export async function requestDocument(dataUrl,user,{categoria,fetcher=fetch,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))}={}){
  for(let attempt=0;attempt<2;attempt++){
    const token=await readWithDeadline(()=>user.getIdToken(attempt>0),'a sessão');
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),65000);
    let response,data;
    try{
      response=await fetcher(API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({dataUrl,categoria}),signal:controller.signal});
      data=await response.json().catch(()=>({error:'O serviço de leitura retornou uma resposta inválida (HTTP '+response.status+'). Os anexos foram preservados.'}));
    }catch(error){
      if(!attempt&&!controller.signal.aborted){await wait(1500);continue;}
      throw Error(controller.signal.aborted?'O leitor não respondeu a tempo. Os anexos foram preservados.':'Falha de conexão com o leitor. Os anexos foram preservados.');
    }finally{clearTimeout(timeout);}
    if(response.ok&&data.document)return data;
    if(!attempt&&(response.status===401||(data.retryable===true&&data.code!=='reader_timeout')||(response.status===429&&data.retryable!==false))){await wait(response.status===401?0:2000);continue;}
    throw Error(data.error||'Falha técnica na leitura (HTTP '+response.status+'). Os anexos foram preservados.');
  }
}
export function createReviewContext(ctx){
  const simReads=new Map(),documentReads=new Map();let historyRead;
  const shared=(map,id,operation)=>{
    if(!map.has(id)){const read=operation();map.set(id,read);read.finally(()=>{if(map.get(id)===read)map.delete(id);}).catch(()=>{});}
    return map.get(id);
  };
  return {...ctx,
    loadSim:id=>shared(simReads,id,async()=>{const doc=await readFirestore(ctx,'simulacoes/'+id,{label:'a ficha'});if(!doc.exists)throw Error('Ficha não encontrada. Volte ao painel e abra a proposta novamente.');return {...doc.data(),id:doc.id||id};}),
    saveSim:async sim=>{simReads.delete(sim.id);try{return await ctx.saveSim(sim);}finally{simReads.delete(sim.id);}},
    loadConfig:()=>readFirestore(ctx,'contadoresCCB/analise_config',{label:'a configuração'}),
    listSims:()=>{
      if(!historyRead){
        const read=readFirestore(ctx,'simulacoes',{collection:true,label:'o histórico'}).then(snap=>snap.docs.map(doc=>({...doc.data(),id:doc.id})));
        historyRead=read;read.finally(()=>{if(historyRead===read)historyRead=undefined;}).catch(()=>{});
      }
      return historyRead;
    },
    loadDocumentos:id=>shared(documentReads,id,async()=>{
      const path='simulacoes/'+id+'/documentos';
      const snap=await readFirestore(ctx,path,{collection:true,label:'os anexos',reference:ctx.db.collection('simulacoes').doc(id).collection('documentos')});
      return Object.fromEntries(snap.docs.map(doc=>[doc.id,doc.data()]));
    })
  };
}
const cpfOf=s=>String(s.dadosCliente?.cpf||'').replace(/\D/g,'');
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Fortaleza'});
export async function mountCdcHistory(id,root,{db,loadSim,listSims,auth}){
  const s=await loadSim(id);if(!s||!root.isConnected)return;
  const cpf=cpfOf(s),editable=!!s.aceite||s.analiseCdc?.decisao?.status==='Aprovada';
  root.innerHTML=`<details class="cdc-history"><summary style="cursor:pointer;font-weight:800;padding:14px 0">📂 Histórico do cliente</summary><p class="hint">Reúne as observações de todas as fichas deste CPF e é consultado nas próximas análises. Registre apenas fatos relacionados ao crédito.</p><div data-history-list style="white-space:pre-wrap;overflow-wrap:anywhere"></div>${editable?`<label>Tipo de registro</label><select data-history-type><option value="nota">Observação</option><option value="positivo">Pagamento em dia / positivo</option><option value="atencao">Ponto de atenção</option><option value="atraso">Parcela atrasada</option><option value="renegociacao">Contrato renegociado</option><option value="quitacao">Contrato totalmente quitado</option></select><div data-history-due-box hidden><label>Vencimento da parcela atrasada</label><input type="date" data-history-due></div><label>Data do pagamento ou da observação</label><input type="date" data-history-date value="${today()}"><label>Observação</label><textarea data-history-note maxlength="1000" style="width:100%;box-sizing:border-box;min-height:100px;font:inherit;padding:12px;border:1px solid var(--line);border-radius:12px" placeholder="Ex.: pagou em dia; atrasou 5 dias e quitou em 10/11"></textarea><button class="btn btn-gold" data-history-save>Salvar observação</button>`:'<p class="hint">Novas observações podem ser registradas nas fichas aprovadas ou nos contratos existentes.</p>'}<p data-history-message role="status"></p></details>`;
  const el=k=>root.querySelector('[data-history-'+k+']');
  async function refresh(){
    if(cpf.length!==11){el('list').textContent='Preencha o CPF para consultar o histórico.';return;}
    const related=(await listSims()).filter(x=>cpfOf(x)===cpf);
    const entries=related.flatMap(x=>(x.historicoCrediti||[]).map(h=>({...h,contrato:x.numeroCCB||x.id})));
    entries.sort((a,b)=>String(b.data).localeCompare(String(a.data))||(b.registradoEm||0)-(a.registradoEm||0));
    el('list').textContent=entries.length?entries.map(h=>`${String(h.data||'').split('-').reverse().join('/')} • ${h.tipo}${h.dias?' • '+h.dias+' dias de atraso':''}\n${h.nota||''}\nFicha: ${h.contrato}`).join('\n\n'):'Nenhuma observação registrada.';
  }
  if(!editable){await refresh();return;}
  el('type').onchange=()=>{el('due-box').hidden=el('type').value!=='atraso';};
  el('save').onclick=async()=>{
    const button=el('save');button.disabled=true;
    try{
      if(cpf.length!==11)throw Error('Preencha um CPF válido na ficha.');
      const type=el('type').value,date=el('date').value,due=el('due').value,note=el('note').value.trim();
      if(!date||date>today())throw Error('Informe uma data válida, não futura.');
      if(!note)throw Error('Escreva a observação.');
      let days=0;if(type==='atraso'){if(!due||date<=due)throw Error('O pagamento deve ser posterior ao vencimento.');days=Math.round((Date.parse(date)-Date.parse(due))/86400000);}
      const ref=db.collection('simulacoes').doc(id);
      await db.runTransaction(async tx=>{const snap=await tx.get(ref);const current=snap.data();if(!current||(!current.aceite&&current.analiseCdc?.decisao?.status!=='Aprovada'))throw Error('A ficha precisa estar aprovada para registrar observações.');const entries=current.historicoCrediti||[];if(type==='atraso'&&entries.some(h=>h.tipo===type&&h.vencimento===due))throw Error('Este atraso já foi registrado.');tx.update(ref,{historicoCrediti:[...entries,{id:crypto.randomUUID(),tipo:type,data:date,vencimento:type==='atraso'?due:null,dias:days,nota:note,registradoEm:Date.now(),por:auth.currentUser.uid}]});});
      el('note').value='';await refresh();el('message').textContent='Observação salva no histórico deste cliente.';
    }catch(e){el('message').textContent=e.message;}finally{button.disabled=false;}
  };
  await refresh();
}
export async function creditSnapshot(current,{listSims,loadDocumentos}){
  const cpf=String(current.dadosCliente?.cpf||'').replace(/\D/g,'');
  const relatives=(await listSims()).filter(x=>String(x.dadosCliente?.cpf||'').replace(/\D/g,'')===cpf);
  const docs=await loadDocumentos(current.id);
  current={...current,analiseCdc:{...current.analiseCdc,questionario:{...normalizedQuestionnaire(current.analiseCdc?.questionario),politica:POLICY_VERSION}}};
  return hash(canonical({questionario:current.analiseCdc?.questionario,valor:current.valor,parcela:current.parcela,prazo:current.prazo,taxa:current.taxa,dataPrimeira:current.dataPrimeira,cpf,cliente:String(current.cliente||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[-–—]/g,' ').replace(/\s+/g,' ').trim().toUpperCase(),history:relatives.sort((a,b)=>a.id.localeCompare(b.id)).map(x=>({id:x.id,assinado:!!x.aceite,hist:x.historicoCrediti||[]})),docs:await Promise.all(Object.keys(docs).sort().map(async key=>[key,await hash(docs[key].dataUrl||'')])),leitura:current.analiseDocumentos||{},conferencias:current.analiseCdc?.conferencias||{}}));
}
export async function mountCdcReview(id,root,ctx){
  const {db,loadSim,saveSim,listSims,loadDocumentos,saveDocumento,auth}=ctx;
  const s=await loadSim(id); if(!s || !root.isConnected) return;
  let config;
  try { const d=await (ctx.loadConfig?ctx.loadConfig():readWithDeadline(()=>db.collection('contadoresCCB').doc('analise_config').get({source:'server'}),'a configuração')); config=d.exists?d.data():{automatica:false}; }
  catch {root.textContent='Não foi possível carregar a configuração da análise. Atualize a página.';return;}
  const q=s.analiseCdc?.questionario||{};
  const record=s.analiseCdc?.resultado;
  root.innerHTML=`<h2>Análise de crédito</h2>
  <label style="display:flex;gap:12px;align-items:center"><input id="rev-auto" type="checkbox" style="width:auto" ${config.automatica?'checked':''}>Ativar análise automática para novas avaliações</label>
  <p class="hint">Não altera contratos existentes. O resultado usa apenas a ficha e o histórico registrado. Confira as evidências antes de confirmar a decisão.</p>
  <label>Renda mensal informada (R$)</label><input type="text" id="rev-renda" inputmode="decimal" placeholder="0,00" value="${esc(formatAmount(q.renda))}">
  <label>Soma dos gastos com mercado, energia, água, internet, remédios, aluguéis (R$)</label><input type="text" id="rev-despesas" inputmode="decimal" placeholder="0,00" value="${esc(formatAmount(q.despesas))}">
  <label>Soma dos empréstimos e financiamentos em andamento (R$)</label><input type="text" id="rev-outrasParcelas" inputmode="decimal" placeholder="0,00" value="${esc(formatAmount(q.outrasParcelas))}">
  <label>Tem restrições no nome?</label><select id="rev-restricao"><option value="">Selecione</option><option value="nao">Não</option><option value="sim">Sim</option></select>
  <label for="rev-residenciaTitular">O comprovante de endereço está em nome de quem?</label><select id="rev-residenciaTitular"><option value="">Selecione</option><option value="proprio">Do próprio cliente</option><option value="terceiro">De terceiro</option></select>
  <div id="rev-residenciaBox" hidden><label for="rev-residenciaJustificativa">Justifique aqui</label><textarea id="rev-residenciaJustificativa" maxlength="600" placeholder="Informe o nome do titular, a relação com o cliente e por que o comprovante está em nome dessa pessoa.">${esc(q.residenciaJustificativa||'')}</textarea></div>
  <h3>Documentos para análise</h3><p class="hint">Não precisa renomear os arquivos. RG, CIN ou CNH são aceitos como identidade. Até 5 anexos por categoria, em PDF, JPG ou JPEG, até 700 KB cada. Você pode enviar frente e verso ou os comprovantes mensais separados.</p>
  ${DOCS.map(([key,label])=>`<div style="margin-bottom:18px;min-width:0"><label>${esc(label)}</label><input type="file" multiple data-doc="${key}" style="display:block;width:100%;max-width:100%;min-width:0;box-sizing:border-box;font-size:14px" accept="application/pdf,image/jpeg,.jpg,.jpeg"><div data-files="${key}" class="hint" style="overflow-wrap:anywhere"></div><button type="button" class="btn btn-outline" data-read="${key}">Ler anexos</button><div data-result="${key}" style="white-space:pre-wrap;overflow-wrap:anywhere"></div><label style="display:flex;gap:10px;margin-top:12px"><input type="checkbox" data-manual="${key}">Abri e conferi os anexos desta categoria. Estão legíveis e os dados correspondem à ficha.</label><p class="hint" data-manual-info="${key}">Abra cada anexo em Ver anexos e marque após conferir. ${key==='rgFrente'?'Confira RG, CIN ou CNH, titularidade e CPF.':key==='comprovanteRenda'?'Confira o documento de renda aceito, valores aplicáveis e período. Comprovante Pix não é extrato bancário.':key==='comprovanteResidencia'?'Confira endereço e titularidade.':'Confira o CPF no documento.'}</p></div>`).join('')}
  <p class="hint">O leitor compara o CPF completo ou seus nove primeiros dígitos. Se a leitura falhar, use a conferência manual da categoria após abrir os anexos.</p>
  <label style="display:flex;gap:10px"><input id="rev-documentosConferidos" type="checkbox" style="width:auto">Conferi os documentos, titularidade, datas, valores aplicáveis a cada documento e períodos exigidos. Os dados correspondem à ficha.</label>
  <div id="rev-history"></div>
  <button type="button" class="btn btn-gold" id="rev-save">Salvar ficha da análise</button>
  <button type="button" class="btn btn-primary" id="rev-analyze">Analisar ficha</button>
  <div id="rev-output" style="white-space:pre-wrap;overflow-wrap:anywhere" role="status"></div>
  <label>Observações da análise</label><textarea id="rev-observacoes" readonly style="min-height:130px" placeholder="O resultado e os motivos aparecerão aqui após a análise."></textarea>
  <label>Motivo da decisão manual ou confirmação</label><textarea id="rev-reason" maxlength="500"></textarea>
  <p class="hint">Ao recusar manualmente, este motivo será mostrado ao cliente na consulta por CPF e código. Escreva uma explicação curta, sem dados de terceiros ou observações internas.</p>
  <button type="button" class="btn btn-outline" id="rev-approve">Confirmar aprovação</button>
  <button type="button" class="btn btn-outline" id="rev-refuse">Recusar manualmente</button>
  <p class="hint">A decisão fica registrada com data e responsável. O retorno bruto da Crediti continua fora do PDF do cliente.</p>`;
  const el=k=>root.querySelector('#rev-'+k);
  root.querySelectorAll('input:not([type])').forEach(input=>{input.type='text';input.style.fontSize='16px';});
  root.querySelectorAll('textarea').forEach(input=>{Object.assign(input.style,{width:'100%',minHeight:'90px',boxSizing:'border-box',fontSize:'16px',padding:'11px',border:'1.5px solid var(--line)',borderRadius:'10px'});});
  root.style.minWidth='0';
  root.querySelectorAll('input[type="checkbox"]').forEach(input=>{input.style.flex='0 0 22px';input.style.width='22px';input.style.height='22px';});
  for(const k of ['renda','despesas','outrasParcelas']){const input=el(k);input.oninput=()=>{input.value=input.value.replace(/[^\d.,]/g,'');};input.onblur=()=>{if(input.value.trim()&&Number.isFinite(number(input.value)))input.value=formatAmount(number(input.value));};}
  el('documentosConferidos').checked=q.documentosConferidos===true;
  el('restricao').value=q.restricao||'';
  el('residenciaTitular').value=q.residenciaTitular||'';
  const residenceToggle=()=>{el('residenciaBox').hidden=el('residenciaTitular').value!=='terceiro';};
  el('residenciaTitular').onchange=residenceToggle;residenceToggle();
  const message=text=>{el('output').textContent=text;};
  let busy=false,analysisFailed=false;
  const updateReading=serialUpdates();
  const openedFiles=new Map();
  const disabledBefore=new Map();
  const lock=value=>{
    busy=value;root.setAttribute('aria-busy',String(value));
    if(value){root.querySelectorAll('button,input,select,textarea').forEach(e=>{if(!disabledBefore.has(e))disabledBefore.set(e,e.disabled);e.disabled=true;});}
    else{for(const [e,disabled]of disabledBefore)e.disabled=disabled;disabledBefore.clear();}
  };
  const reportError=error=>{message(error?.message||'Não foi possível concluir. Tente novamente.');el('output').scrollIntoView({behavior:'smooth',block:'center'});};
  el('observacoes').value=needsInternalReview(record)&&!s.analiseCdc?.decisao?'A leitura anterior não concluiu a conferência. Isso não representa reprovação do cliente. Use Analisar ficha para atualizar.':s.analiseCdc?.observacoes|| (record?record.status+'\n'+record.motivos.join('\n'):'');
  if(!record&&!s.analiseCdc?.decisao&&/^Aprovada\b/.test(el('observacoes').value))el('observacoes').value='A avaliação anterior precisa ser atualizada. Use Confirmar aprovação para conferir os dados salvos e continuar.';
  el('reason').value=s.analiseCdc?.decisao?.motivo||'';
  const showResult=(title,text,sections)=>{
    el('observacoes').value=text;message(title);
    const dialog=document.createElement('dialog');
    dialog.setAttribute('aria-label','Resultado da análise');
    Object.assign(dialog.style,{width:'min(520px, calc(100vw - 32px))',maxHeight:'80dvh',boxSizing:'border-box',border:'2px solid #FDCA01',borderRadius:'18px',padding:'24px',overflow:'auto',background:'#fffdf5',color:'#171717'});
    const heading=document.createElement('h2');heading.textContent=title;
    const body=document.createElement('div');Object.assign(body.style,{whiteSpace:'pre-wrap',overflowWrap:'anywhere',lineHeight:'1.5'});
    if(sections){for(const section of sections){const block=document.createElement('section'),h=document.createElement('h3'),list=document.createElement('ol');h.textContent=section.title;h.style.fontSize='1rem';list.style.paddingLeft='22px';for(const item of section.items){const li=document.createElement('li');li.textContent=item;li.style.marginBottom='8px';list.append(li);}block.style.marginBottom='20px';block.append(h,list);body.append(block);}}
    else body.textContent=text;
    const ok=document.createElement('button');ok.textContent='OK';ok.className='btn btn-gold';ok.type='button';
    ok.onclick=()=>dialog.close();dialog.addEventListener('close',()=>{dialog.remove();el('observacoes').scrollIntoView({behavior:'smooth',block:'center'});});
    dialog.append(heading,body,ok);document.body.append(dialog);dialog.showModal();heading.tabIndex=-1;heading.focus({preventScroll:true});dialog.scrollTop=0;
  };
  if(record) message('Última avaliação: '+(needsInternalReview(record)?'Não concluída. Conferência interna necessária':record.status)+'\n'+record.motivos.join('\n')+'\n'+(s.analiseCdc.decisao?'Decisão confirmada: '+s.analiseCdc.decisao.status:'Aguardando conferência do administrador.'));
  const questionnaire=()=>Object.fromEntries(['renda','despesas','outrasParcelas','restricao','residenciaTitular','residenciaJustificativa','documentosConferidos'].map(k=>[k,['renda','despesas','outrasParcelas'].includes(k)?(el(k).value.trim()?number(el(k).value):null):el(k).type==='checkbox'?el(k).checked:k==='residenciaJustificativa'&&el('residenciaTitular').value!=='terceiro'?'':el(k).value.trim()]));
  const persist=async()=>{const current=await loadSim(id);if(!current)throw Error('Não foi possível carregar a ficha. Tente novamente.');const next=questionnaire();const changed=!sameQuestionnaire(current.analiseCdc?.questionario,next);current.analiseCdc={...(current.analiseCdc||{}),questionario:next,atualizadoEm:Date.now()};if(changed){delete current.analiseCdc.decisao;delete current.analiseCdc.resultado;delete current.analiseCdc.snapshot;current.analiseCdc.observacoes='Ficha alterada. Confirme a aprovação para atualizar a avaliação.';}await saveSim(current);el('observacoes').value=current.analiseCdc.observacoes||'';return current;};
  const run=async button=>{
    if(busy)return;
    if(!auth.currentUser){reportError(Error('Sua sessão terminou. Entre novamente no painel.'));return;}
    const label=button.textContent;lock(true);button.textContent='Aguarde…';message('Processando solicitação…');
    const slow=setTimeout(()=>message('A operação ainda está em andamento. Aguarde a confirmação para não repetir o envio.'),15000);
    try{await button.task();}catch(error){reportError(error);}finally{clearTimeout(slow);lock(false);button.textContent=label;}
  };
  const bind=(id,task)=>{const b=el(id);b.task=task;b.onclick=()=>run(b);};
  el('auto').onchange=async()=>{const enabled=el('auto').checked;el('auto').disabled=true;try{await db.collection('contadoresCCB').doc('analise_config').set({automatica:enabled,atualizadoEm:Date.now(),por:auth.currentUser.uid});config.automatica=enabled;message(enabled?'Análise automática ativada. Preencha a ficha e clique em Analisar ficha.':'Modo manual ativado.');}catch{el('auto').checked=!enabled;message('Não foi possível salvar a configuração.');}finally{el('auto').disabled=false;}};
  const cpf=String(s.dadosCliente?.cpf||'').replace(/\D/g,'');
  const related=async()=>{if(cpf.length!==11)throw Error('Preencha o CPF na ficha de contratação para vincular o histórico.');const all=await listSims();if(!all.some(x=>x.id===id))throw Error('Não foi possível confirmar a consulta ao histórico. Tente novamente.');return all.filter(x=>String(x.dadosCliente?.cpf||'').replace(/\D/g,'')===cpf);};
  const snapshot=current=>creditSnapshot(current,{listSims,loadDocumentos});
  const refreshHistory=async()=>{try{await mountCdcHistory(id,el('history'),ctx);}catch(e){el('history').textContent='Histórico indisponível: '+e.message;}};
  const groupEl=(kind,key)=>root.querySelector('[data-'+kind+'="'+key+'"]');
  const refreshFiles=async()=>{
    const docs=await loadDocumentos(id),current=await loadSim(id);
    if(!current)throw Error('Não foi possível carregar a ficha para conferir os anexos.');
    for(const [key] of DOCS){
      const keys=documentKeys(docs,key);
      const checked=await manualConfirmed(current,docs,key);groupEl('manual',key).checked=checked;
      if(checked)groupEl('manual-info',key).textContent='Conferência manual salva. Estes anexos serão considerados conferidos na análise.';
      else if(current.analiseCdc?.conferencias?.[key]?.confirmado)groupEl('manual-info',key).textContent='Os anexos ou os dados da ficha mudaram. Abra e confira novamente.';
      groupEl('files',key).textContent=keys.length?keys.length+'/5 anexos: '+keys.map(k=>docs[k].nome||k).join('; '):'Nenhum anexo enviado.';
      groupEl('result',key).textContent=checked?'Anexos conferidos manualmente. A leitura automática desta categoria não bloqueia a análise.':keys.map(k=>{const r=current.analiseDocumentos?.[k];if(!r?.document)return (docs[k].nome||k)+': aguardando leitura';if(r.versaoLeitor!=='cdc-docs-tipos-v3')return (docs[k].nome||k)+': leitura anterior. Clique em Analisar ficha para aplicar as regras atualizadas.';const d=r.document;return (docs[k].nome||k)+'\nLeitura: '+d.legibilidade+' | Tipo: '+d.tipo+(documentIncomeSummary(d)?'\n'+documentIncomeSummary(d):'')+'\nCompetências: '+(Array.isArray(d.competencias)?d.competencias:[]).join(', ')+'\n'+(d.observacoes||'');}).join('\n\n');
    }
  };
  const safeRefreshFiles=async()=>{try{await refreshFiles();}catch(e){for(const [key]of DOCS)groupEl('files',key).textContent='Não foi possível atualizar os anexos: '+e.message;}};
  for(const [key] of DOCS){
    const input=groupEl('doc',key),button=groupEl('read',key);
    input.onchange=async()=>{
      const files=Array.from(input.files||[]);if(!files.length||busy)return;
      lock(true);
      try{
        const docs=await loadDocumentos(id),keys=documentKeys(docs,key);
        if(keys.length+files.length>5)throw Error('Máximo de 5 anexos nesta categoria. Os arquivos existentes foram preservados. Remova um anexo na ficha antes de substituí-lo.');
        if(files.some(f=>!['application/pdf','image/jpeg'].includes(f.type)||f.size>700000))throw Error('Use PDF, JPG ou JPEG de até 700 KB por arquivo.');
        const fingerprints=new Set(await Promise.all(keys.map(k=>hash(docs[k].dataUrl))));
        for(const file of files){
          const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});
          const fingerprint=await hash(dataUrl);if(fingerprints.has(fingerprint))continue;
          let slot=key;if(docs[slot]){let i=2;while(docs[key+'__'+i])i++;slot=key+'__'+i;}
          await saveDocumento(id,slot,{dataUrl,tipo:file.type,nome:file.name,categoria:key});
          docs[slot]={dataUrl,nome:file.name};fingerprints.add(fingerprint);
          const current=await loadSim(id);current.documentosEnviados=[...new Set([...(current.documentosEnviados||[]),slot])];
          if(current.analiseCdc){delete current.analiseCdc.decisao;delete current.analiseCdc.resultado;}
          await saveSim(current);
        }
        el('documentosConferidos').checked=false;message('Anexos salvos. Clique em Ver anexos para abrir os documentos. Use Analisar ficha para a leitura automática.');
      }catch(e){reportError(e);}finally{input.value='';lock(false);void safeRefreshFiles();}
    };
    button.task=async(auto=false)=>{
      try{
        const docs=await loadDocumentos(id),keys=documentKeys(docs,key);if(!keys.length)throw Error('Anexe os documentos desta categoria primeiro.');
        if(await manualConfirmed(await loadSim(id),docs,key)){message('Categoria conferida manualmente. Não é necessário repetir a leitura automática.');return;}
        const failures=[];
        for(const slot of keys){
          try{
          message('Lendo '+(docs[slot].nome||slot)+'…');
          const fingerprint=await hash(docs[slot].dataUrl);let current=await loadSim(id);const previous=current.analiseDocumentos?.[slot];
          if(previous?.hash===fingerprint&&reusableDocumentReading(previous,key))continue;
          const reused=Object.values(current.analiseDocumentos||{}).find(r=>r.hash===fingerprint&&reusableDocumentReading(r,key));
          if(reused){await updateReading(async()=>{const latest=await loadSim(id);latest.analiseDocumentos={...latest.analiseDocumentos,[slot]:{...reused}};await saveSim(latest);});continue;}
          // A new reader version may reread the same attachment without counting a new illegible submission.
          const data=await requestDocument(docs[slot].dataUrl,auth.currentUser,{categoria:key});
          if(data.version!=='cdc-docs-tipos-v3')throw Error('O leitor está sendo atualizado. Aguarde e analise novamente. Nenhuma recusa aplicada.');
          const review={versaoLeitor:data.version||'legacy',hash:fingerprint,hashes:[...new Set([...(previous?.hashes||[]),fingerprint])],document:data.document,consecutivos:data.document.legibilidade==='ilegivel'?(previous?.consecutivos||0)+(previous?.hash===fingerprint?0:1):0,lidoEm:Date.now()};
          await updateReading(async()=>{const latest=await loadSim(id);latest.analiseDocumentos={...(latest.analiseDocumentos||{}),[slot]:review};if(latest.analiseCdc)delete latest.analiseCdc.decisao;await saveSim(latest);});
          if(data.document.falhaLeituraCpf)throw Error('A conferência do CPF foi interrompida pelo leitor. Os campos já lidos foram preservados. Tente analisar novamente.');
          }catch(error){failures.push((docs[slot].nome||slot)+': '+error.message);}
        }
        if(failures.length)throw Error(failures.join('\n'));
        if(!auto)el('documentosConferidos').checked=false;
        message('Leitura concluída. Conferindo os dados da ficha…');
      }finally{void safeRefreshFiles();}
    };
    const manual=groupEl('manual',key);
    manual.onchange=async()=>{
      if(busy)return;
      const confirmed=manual.checked;lock(true);
      try{
        const current=await persist(),docs=await loadDocumentos(id),evidence=await categoryEvidence(current,docs,key);
        if(confirmed&&!evidence.anexos.length)throw Error('Anexe o documento antes de marcar a conferência.');
        if(confirmed&&evidence.anexos.some(x=>openedFiles.get(x.slot)!==x.hash))throw Error('Abra cada anexo desta categoria em Ver anexos antes de marcar a conferência.');
        current.analiseCdc.conferencias={...current.analiseCdc.conferencias,[key]:{...evidence,confirmado:confirmed,por:auth.currentUser.uid,data:Date.now(),origem:'conferencia_manual'}};
        delete current.analiseCdc.resultado;delete current.analiseCdc.decisao;delete current.analiseCdc.snapshot;
        current.analiseCdc.observacoes='Conferência atualizada. Confirme a aprovação para atualizar a avaliação.';el('observacoes').value=current.analiseCdc.observacoes;
        await saveSim(current);message(confirmed?'Conferência manual salva. Esta categoria não ficará pendente por falha do leitor.':'Conferência manual desmarcada.');
      }catch(error){manual.checked=!confirmed;reportError(error);}finally{lock(false);void safeRefreshFiles();}
    };
    button.textContent='Ver anexos';
    button.onclick=async()=>{
      if(busy)return;
      lock(true);button.textContent='Abrindo anexos…';
      try{const docs=await loadDocumentos(id);const files=await Promise.all(documentKeys(docs,key).map(async slot=>({...docs[slot],slot,fingerprint:await hash(docs[slot].dataUrl)})));showAttachments(files,DOCS.find(d=>d[0]===key)[1],{onView:file=>{openedFiles.set(file.slot,file.fingerprint);groupEl('manual-info',key).textContent='Após abrir e conferir todos os anexos desta categoria, marque a confirmação abaixo.';}});}
      catch(e){reportError(e);}finally{button.textContent='Ver anexos';lock(false);}
    };
  }
  bind('save',async()=>{await persist();message('Ficha da análise salva.');});
  async function analyze(silent=false){
    if(!config.automatica){showResult('Análise automática desligada','Ative a análise automática ou registre uma decisão manual.');return;}
    el('analyze').textContent='Analisando ficha…';
    try{
    await persist();
    const issues=[],readingFailures=[];const initialDocs=await loadDocumentos(id);
    const categories=[];
    for(const [key,label] of DOCS){
      if(key==='cpfFrente'&&!documentKeys(initialDocs,key).length)continue;
      if(!documentKeys(initialDocs,key).length){issues.push('Documento obrigatório não enviado: '+label+'.');continue;}
      categories.push(key);
    }
    const reads=await mapConcurrent(categories,2,key=>groupEl('read',key).task(true));
    for(const read of reads)if(read.status==='rejected')readingFailures.push(read.reason.message);
    if(readingFailures.length)throw Error('Falha na leitura dos anexos:\n'+readingFailures.join('\n')+'\nOs arquivos lidos com sucesso foram preservados.');
    message('Conferindo renda, parcelas, valores e histórico do cliente…');
    const current=await loadSim(id);const sims=await related();const docs=await loadDocumentos(id);const checks=[];
    const readDocs=[],manualCategories=new Set();
    for(const [key]of DOCS)if(await manualConfirmed(current,docs,key))manualCategories.add(key);
    for(const [key,label]of DOCS){
      if(key==='cpfFrente'&&!documentKeys(docs,key).length)continue;
      const keys=documentKeys(docs,key);
      for(const slot of keys){const r=current.analiseDocumentos?.[slot];if(manualCategories.has(key)){checks.push({label:docs[slot].nome||label,manual:true,confirmado:true});readDocs.push({key,label:docs[slot].nome||label,manual:true,d:r?.document||{tipo:'outro',legibilidade:'incerto'}});continue;}if(!currentDocumentReading(r,key)||r.hash!==await hash(docs[slot].dataUrl)){issues.push('Leitura não concluída: '+(docs[slot].nome||label));continue;}checks.push({label:docs[slot].nome||label,legibilidade:r.document.legibilidade,consecutivos:r.consecutivos,confirmado:questionnaire().documentosConferidos});readDocs.push({key,label:docs[slot].nome||label,d:r.document});}
    }
    const history=sims.flatMap(x=>(x.historicoCrediti||[]).map(h=>({...h,contrato:x.id})));
    const effectiveQ={...questionnaire(),documentosConferidos:questionnaire().documentosConferidos||['rgFrente','comprovanteResidencia','comprovanteRenda'].every(key=>manualCategories.has(key))};
    const result=evaluateCredit({q:effectiveQ,parcela:current.parcela,valor:current.valor,history,contracts:sims.filter(x=>x.aceite&&x.id!==id).map(x=>x.id),documents:checks,today:new Date().toLocaleDateString('en-CA',{timeZone:'America/Fortaleza'})});
    const findings=documentFindings({q:effectiveQ,cliente:current.cliente,cpf,readDocs});
    const conflicts=[...issues,...findings.pending];result.notasDocumentos=findings.notes;
    result.historicoConsiderado=history.map(h=>({contrato:h.contrato,tipo:h.tipo,data:h.data,nota:h.nota||'',dias:h.dias||0}));
    result.pendencias=[...new Set([...(result.pendencias||[]),...conflicts])];
    if(result.pendencias.length&&result.status!=='Recusada'){result.status='Pendente';result.motivos=result.pendencias;}
    const sections=analysisSections(result,{valor:current.valor,parcela:current.parcela,prazo:current.prazo,readCount:readDocs.length,historyCount:history.length});
    const observation=sectionsText(result.status,sections);
    current.analiseCdc={...current.analiseCdc,resultado:result,observacoes:observation,avaliadoEm:Date.now(),por:auth.currentUser.uid};
    // Fingerprint exactly the evidence evaluated, without downloading the same history again.
    // Manual confirmation below still fetches fresh evidence and rejects any change.
    current.analiseCdc.snapshot=await creditSnapshot(current,{listSims:async()=>sims,loadDocumentos:async()=>docs});await saveSim(current);
    analysisFailed=false;
    if(!silent||result.status!=='Aprovada')showResult(result.status==='Pendente'?'Análise pendente':result.status,observation,sections);else el('observacoes').value=observation;
    return result;
    }catch(e){
      const text='Não foi possível concluir a análise: '+(e.message||'falha inesperada')+'. Nenhuma aprovação ou recusa foi confirmada.';
      analysisFailed=true;
      // A transport/OCR failure is not a credit result. Preserve stored decisions and evidence.
      showResult('Análise interrompida pelo sistema',text+' Os dados e as decisões já salvos foram preservados.');
    }finally{el('analyze').textContent='Analisar ficha';}
  }
  bind('analyze',()=>analyze());
  async function decide(status){
    const reason=el('reason').value.trim();if(!reason)throw Error('Informe o motivo da decisão.');
    let current=await loadSim(id);
    if(config.automatica && status==='Aprovada'){
      const unchanged=sameQuestionnaire(current.analiseCdc?.questionario,questionnaire());
      const valid=!analysisFailed&&unchanged&&current.analiseCdc?.resultado?.status==='Aprovada'&&current.analiseCdc.snapshot===await snapshot(current);
      if(!valid){
        message('Atualizando a avaliação com os documentos e as conferências salvas…');
        const result=await analyze(true);
        if(!result||result.status!=='Aprovada')return;
        current=await loadSim(id);
      }
      if(current.analiseCdc?.resultado?.status!=='Aprovada'||!sameQuestionnaire(current.analiseCdc.questionario,questionnaire())||current.analiseCdc.snapshot!==await snapshot(current))throw Error('A ficha mudou durante a confirmação. Confira os dados e tente novamente.');
    }else if(status==='Aprovada'){
      current=await persist();
      current.analiseCdc.snapshot=await snapshot(current);
    }
    current.analiseCdc={...(current.analiseCdc||{}),decisao:{status,motivo:reason,motivoCliente:status==='Recusada'?reason:'',modo:config.automatica?'confirmacao':'manual',por:auth.currentUser.uid,data:Date.now()}};
    await saveSim(current);message('Decisão registrada: '+status+'. '+reason);
    if(status==='Aprovada'&&ctx.onApproved)await ctx.onApproved(current);else void refreshHistory();
  }
  bind('approve',()=>decide('Aprovada'));bind('refuse',()=>decide('Recusada'));
  // Bind every action before optional/background loading. Slow history must never create inert buttons.
  void refreshHistory();void safeRefreshFiles();
}




