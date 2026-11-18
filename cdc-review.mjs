import {evaluateCredit} from './cdc-policy.mjs';
const API='https://crediti-ia-api.onrender.com/api/cdc/document';
const DOCS=[['rgFrente','Identidade completa (RG, CIN ou CNH)'],['cpfFrente','CPF (se não constar na identidade)'],['comprovanteResidencia','Residência recente'],['comprovanteRenda','Renda: 3 contracheques ou comprovante atual do benefício ou extratos de 3 meses'],['contaCorrente','Comprovante da conta corrente']];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');
const number=v=>Number(String(v).replace(/\./g,'').replace(',','.'));
export async function mountCdcReview(id,root,ctx){
  const {db,loadSim,saveSim,listSims,loadDocumentos,saveDocumento,auth}=ctx;
  const s=await loadSim(id); if(!s || !root.isConnected) return;
  let config;
  try { const d=await db.collection('contadoresCCB').doc('analise_config').get(); config=d.exists?d.data():{automatica:false}; }
  catch {root.textContent='Não foi possível carregar a configuração da análise. Atualize a página.';return;}
  const q=s.analiseCdc?.questionario||{};
  const record=s.analiseCdc?.resultado;
  root.innerHTML=`<h2>Análise de crédito</h2>
  <label style="display:flex;gap:12px;align-items:center"><input id="rev-auto" type="checkbox" style="width:auto" ${config.automatica?'checked':''}>Ativar análise automática para novas avaliações</label>
  <p class="hint">Não altera contratos existentes. O resultado usa apenas a ficha e o histórico registrado. Confira as evidências antes de confirmar a decisão.</p>
  <label>Renda líquida mensal comprovada (R$)</label><input id="rev-renda" inputmode="decimal" value="${esc(q.renda?.toFixed(2).replace('.',',')||'')}">
  <label>Despesas essenciais mensais (R$)</label><input id="rev-despesas" inputmode="decimal" value="${esc(q.despesas?.toFixed(2).replace('.',',')||'')}">
  <label>Outras parcelas mensais em andamento (R$)</label><input id="rev-outrasParcelas" inputmode="decimal" value="${esc(q.outrasParcelas?.toFixed(2).replace('.',',')||'')}">
  <label>Há restrição informada ou verificada?</label><select id="rev-restricao"><option value="">Selecione</option><option value="nao">Não</option><option value="sim">Sim</option></select>
  <label>Fonte da verificação de restrições</label><input id="rev-fonteRestricao" maxlength="250" value="${esc(q.fonteRestricao||'')}" placeholder="Ex.: relatório apresentado, instituição e referência">
  <label>Data da verificação</label><input type="date" id="rev-dataRestricao" value="${esc(q.dataRestricao||'')}">
  <p class="hint">Não há consulta automática ao Serasa, SPC ou bancos. A ausência de restrição não será presumida.</p>
  <label>Tipo de conta para receber</label><select id="rev-conta"><option value="">Selecione</option><option value="corrente">Conta corrente</option><option value="poupanca">Conta poupança</option></select>
  <label>A conta pertence ao cliente?</label><select id="rev-titular"><option value="">Selecione</option><option value="sim">Sim, comprovado</option><option value="nao">Não confirmado</option></select>
  <h3>Documentação da análise</h3><p class="hint">PDF, JPG ou JPEG, até 700 KB por arquivo. Renda de vários meses pode ser reunida em um PDF. A leitura usa sua API OpenAI. Não envie dados de saúde ou documentos sem relação com a análise.</p>
  ${DOCS.map(([key,label])=>`<div style="margin-bottom:18px"><label>${esc(label)}</label><input type="file" data-doc="${key}" accept="application/pdf,image/jpeg,.jpg,.jpeg"><button type="button" class="btn btn-outline" data-read="${key}">Ler documento anexado</button><div data-result="${key}" style="white-space:pre-wrap;overflow-wrap:anywhere"></div></div>`).join('')}
  <label style="display:flex;gap:10px"><input id="rev-cpfNaIdentidade" type="checkbox" style="width:auto" ${q.cpfNaIdentidade?'checked':''}>CPF consta no documento de identidade</label>
  <label style="display:flex;gap:10px"><input id="rev-documentosConferidos" type="checkbox" style="width:auto">Conferi os documentos, titularidade, datas, renda líquida e competências exigidas. Os dados correspondem à ficha.</label>
  <h3>Histórico do cliente na Crediti</h3><div id="rev-history"></div>
  <label>Ocorrência deste contrato</label><select id="rev-tipo"><option value="atraso">Parcela atrasada</option><option value="renegociacao">Contrato renegociado</option><option value="quitacao">Contrato totalmente quitado</option><option value="nota">Observação</option></select>
  <label>Vencimento da parcela (para atraso)</label><input id="rev-vencimento" type="date">
  <label>Data do pagamento ou da ocorrência</label><input id="rev-data" type="date">
  <label>Observação objetiva</label><textarea id="rev-nota" maxlength="500" placeholder="Registre apenas informações relacionadas ao crédito"></textarea>
  <button type="button" class="btn btn-outline" id="rev-add">Registrar no histórico</button>
  <button type="button" class="btn btn-gold" id="rev-save">Salvar ficha da análise</button>
  <button type="button" class="btn btn-primary" id="rev-analyze">Analisar ficha</button>
  <div id="rev-output" style="white-space:pre-wrap;overflow-wrap:anywhere" role="status"></div>
  <label>Motivo da decisão manual ou confirmação</label><textarea id="rev-reason" maxlength="500"></textarea>
  <button type="button" class="btn btn-outline" id="rev-approve">Confirmar aprovação</button>
  <button type="button" class="btn btn-outline" id="rev-refuse">Recusar manualmente</button>
  <p class="hint">A decisão fica registrada com data e responsável. O retorno bruto da Crediti continua fora do PDF do cliente.</p>`;
  const el=k=>root.querySelector('#rev-'+k);
  for(const k of ['restricao','conta','titular']) el(k).value=q[k]||'';
  const message=text=>{el('output').textContent=text;};
  if(record) message('Última avaliação: '+record.status+'\n'+record.motivos.join('\n')+'\n'+(s.analiseCdc.decisao?'Decisão confirmada: '+s.analiseCdc.decisao.status:'Aguardando conferência do administrador.'));
  const questionnaire=()=>Object.fromEntries(['renda','despesas','outrasParcelas','restricao','fonteRestricao','dataRestricao','conta','titular','cpfNaIdentidade','documentosConferidos'].map(k=>[k,['renda','despesas','outrasParcelas'].includes(k)?(el(k).value.trim()?number(el(k).value):null):el(k).type==='checkbox'?el(k).checked:el(k).value]));
  const persist=async()=>{const current=await loadSim(id);current.analiseCdc={...(current.analiseCdc||{}),questionario:questionnaire(),atualizadoEm:Date.now()};delete current.analiseCdc.decisao;delete current.analiseCdc.resultado;await saveSim(current);return current;};
  const run=async button=>{button.disabled=true;try{await button.task();}catch(error){message(error.message||'Não foi possível concluir. Tente novamente.');}finally{button.disabled=false;}};
  const bind=(id,task)=>{const b=el(id);b.task=task;b.onclick=()=>run(b);};
  el('auto').onchange=async()=>{const enabled=el('auto').checked;el('auto').disabled=true;try{await db.collection('contadoresCCB').doc('analise_config').set({automatica:enabled,atualizadoEm:Date.now(),por:auth.currentUser.uid});config.automatica=enabled;message(enabled?'Análise automática ativada. Preencha a ficha e clique em Analisar ficha.':'Modo manual ativado.');}catch{el('auto').checked=!enabled;message('Não foi possível salvar a configuração.');}finally{el('auto').disabled=false;}};
  const cpf=String(s.dadosCliente?.cpf||'').replace(/\D/g,'');
  const related=async()=>{if(cpf.length!==11)throw Error('Preencha o CPF na ficha de contratação para vincular o histórico.');const all=await listSims();return all.filter(x=>String(x.dadosCliente?.cpf||'').replace(/\D/g,'')===cpf);};
  const snapshot=async(current)=>{const relatives=await related();const docs=await loadDocumentos(id);return hash(JSON.stringify({questionario:current.analiseCdc?.questionario,valor:current.valor,parcela:current.parcela,prazo:current.prazo,taxa:current.taxa,dataPrimeira:current.dataPrimeira,cpf:current.dadosCliente?.cpf,history:relatives.sort((a,b)=>a.id.localeCompare(b.id)).map(x=>({id:x.id,assinado:!!x.aceite,hist:x.historicoCrediti||[]})),docs:await Promise.all(Object.keys(docs).sort().map(async key=>[key,await hash(docs[key].dataUrl||'')])),leitura:current.analiseDocumentos||{}}));};
  const showHistory=async()=>{try{const sims=await related();const hist=sims.flatMap(x=>(x.historicoCrediti||[]).map(h=>({...h,contrato:x.id})));el('history').textContent=hist.length?hist.map(h=>`${h.data} | ${h.tipo}${h.dias?' | '+h.dias+' dias de atraso':''} | ${h.nota||''}`).join('\n'):'Nenhuma ocorrência registrada. Ausência de registro não comprova ausência de atraso.';el('history').style.whiteSpace='pre-wrap';}catch(e){el('history').textContent=e.message;}};
  await showHistory();
  bind('add',async()=>{
    const date=el('data').value, due=el('vencimento').value, type=el('tipo').value;
    const today=new Date().toLocaleDateString('en-CA',{timeZone:'America/Fortaleza'});
    if(!date||date>today)throw Error('Informe uma data válida, não futura.');
    let days=0;if(type==='atraso'){if(!due||date<=due)throw Error('O pagamento precisa ser posterior ao vencimento.');days=Math.round((Date.parse(date)-Date.parse(due))/86400000);}
    await related();const current=await loadSim(id);const entries=current.historicoCrediti||[];
    if(entries.some(x=>x.tipo===type && (type==='atraso'?x.vencimento===due:x.data===date)))throw Error('Esta ocorrência já foi registrada.');
    entries.push({id:crypto.randomUUID(),tipo:type,data:date,vencimento:due||null,dias:days,nota:el('nota').value.trim(),registradoEm:Date.now(),por:auth.currentUser.uid});
    await db.collection('simulacoes').doc(id).update({historicoCrediti:entries});await showHistory();message('Histórico registrado. Faça uma nova análise para considerar a ocorrência.');
  });
  const showDoc=(key,review)=>{const target=root.querySelector(`[data-result="${key}"]`);if(!review)return;const d=review.document;target.textContent=`Leitura: ${d.legibilidade}\nTipo: ${d.tipo}\nTitular: ${d.nome||'Não identificado'}\nRenda líquida: ${d.rendaLiquida===null?'Não identificada':money(d.rendaLiquida)}\nConta: ${d.contaTipo}\nCompetências: ${(d.competencias||[]).join(', ')||'Não identificadas'}\n${d.observacoes}\nEnvios ilegíveis consecutivos: ${review.consecutivos||0}`;};
  for(const [key] of DOCS){
    showDoc(key,s.analiseDocumentos?.[key]);
    const input=root.querySelector(`[data-doc="${key}"]`), button=root.querySelector(`[data-read="${key}"]`);
    input.onchange=async()=>{const file=input.files[0];if(!file)return;try{if(!['application/pdf','image/jpeg'].includes(file.type)||file.size>700000)throw Error('Use PDF, JPG ou JPEG de até 700 KB.');const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});await saveDocumento(id,key,{dataUrl,tipo:file.type,nome:file.name});const current=await loadSim(id);current.documentosEnviados=[...new Set([...(current.documentosEnviados||[]),key])];if(current.analiseCdc)delete current.analiseCdc.decisao;await saveSim(current);el('documentosConferidos').checked=false;message('Documento salvo. Clique em Ler documento anexado.');}catch(e){message(e.message);}};
    button.task=async()=>{
      message('Lendo documento. Aguarde…');const docs=await loadDocumentos(id);const doc=docs[key];if(!doc?.dataUrl)throw Error('Anexe este documento primeiro.');
      const fingerprint=await hash(doc.dataUrl);let current=await loadSim(id);const previous=current.analiseDocumentos?.[key];
      if(previous?.hash===fingerprint){showDoc(key,previous);message('Este arquivo já foi lido. A leitura foi reutilizada, sem nova chamada à API.');return;}
      const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await auth.currentUser.getIdToken()},body:JSON.stringify({dataUrl:doc.dataUrl}),signal:AbortSignal.timeout(90000)});
      const data=await response.json();if(!response.ok||!data.document)throw Error(data.error||'Falha na leitura. Nenhuma recusa aplicada.');
      const review={hash:fingerprint,document:data.document,consecutivos:data.document.legibilidade==='ilegivel'?(previous?.consecutivos||0)+1:data.document.legibilidade==='legivel'?0:(previous?.consecutivos||0),lidoEm:Date.now()};
      current=await loadSim(id);current.analiseDocumentos={...(current.analiseDocumentos||{}),[key]:review};await saveSim(current);showDoc(key,review);el('documentosConferidos').checked=false;message('Leitura concluída. Confira os dados extraídos antes de analisar.');
    };button.onclick=()=>run(button);
  }
  bind('save',async()=>{await persist();message('Ficha da análise salva.');});
  bind('analyze',async()=>{
    if(!config.automatica)throw Error('O modo automático está desligado. Ative-o para analisar ou registre uma decisão manual.');
    const current=await persist();const sims=await related();const docs=await loadDocumentos(id);const checks=[];
    for(const [key,label]of DOCS){if(key==='cpfFrente'&&questionnaire().cpfNaIdentidade)continue;const d=docs[key],r=current.analiseDocumentos?.[key];if(!d?.dataUrl||!r||r.hash!==await hash(d.dataUrl))throw Error('Anexe e leia o documento atualizado: '+label);checks.push({label,legibilidade:r.document.legibilidade,consecutivos:r.consecutivos,confirmado:questionnaire().documentosConferidos});}
    const history=sims.flatMap(x=>(x.historicoCrediti||[]).map(h=>({...h,contrato:x.id})));
    const result=evaluateCredit({q:questionnaire(),parcela:current.parcela,history,contracts:sims.filter(x=>x.aceite&&x.id!==id).map(x=>x.id),documents:checks,today:new Date().toLocaleDateString('en-CA',{timeZone:'America/Fortaleza'})});
    current.analiseCdc={...current.analiseCdc,resultado:result,avaliadoEm:Date.now(),por:auth.currentUser.uid};current.analiseCdc.snapshot=await snapshot(current);await saveSim(current);
    message(result.status+'\n'+result.motivos.join('\n')+'\nLimite da parcela: '+money(result.limiteParcela)+'\nConfira as evidências e confirme a decisão abaixo.');
  });
  async function decide(status){
    const reason=el('reason').value.trim();if(!reason)throw Error('Informe o motivo da decisão.');
    const current=await loadSim(id);
    if(config.automatica && status==='Aprovada'){
      if(current.analiseCdc?.resultado?.status!=='Aprovada')throw Error('Conclua uma análise aprovada ou desligue o automático para decidir manualmente.');
      if(JSON.stringify(current.analiseCdc.questionario)!==JSON.stringify(questionnaire()))throw Error('A ficha mudou. Analise novamente.');
      if(current.analiseCdc.snapshot!==await snapshot(current))throw Error('Documentos, proposta ou histórico mudaram. Faça uma nova análise.');
    }
    current.analiseCdc={...(current.analiseCdc||{}),decisao:{status,motivo:reason,modo:config.automatica?'confirmacao':'manual',por:auth.currentUser.uid,data:Date.now()}};
    await saveSim(current);message('Decisão registrada: '+status+'. '+reason);
  }
  bind('approve',()=>decide('Aprovada'));bind('refuse',()=>decide('Recusada'));
}
