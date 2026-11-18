import {evaluateCredit,POLICY_VERSION} from './cdc-policy.mjs?v=20261118-pix';
const API='https://crediti-ia-api.onrender.com/api/cdc/document';
const DOCS=[['rgFrente','Identidade completa (RG, CIN ou CNH)'],['cpfFrente','CPF (se não constar na identidade)'],['comprovanteResidencia','Comprovante de residência'],['comprovanteRenda','Renda: 3 contracheques, benefício atual ou extratos de 3 meses']];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');
const number=v=>{let text=String(v).trim();if(text.includes(','))text=text.replace(/\./g,'').replace(',','.');else if(/^\d{1,3}(\.\d{3})+$/.test(text))text=text.replace(/\./g,'');return Number(text);};
export const formatAmount=v=>v===null||v===undefined||v===''?'':Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
export const documentKeys=(docs,key)=>Object.keys(docs).filter(k=>k===key||k.startsWith(key+'__')||(key==='rgFrente'&&k==='rgVerso')).filter(k=>docs[k]?.dataUrl).sort();
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
  await refresh();if(!editable)return;
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
}
export async function creditSnapshot(current,{listSims,loadDocumentos}){
  const cpf=String(current.dadosCliente?.cpf||'').replace(/\D/g,'');
  const relatives=(await listSims()).filter(x=>String(x.dadosCliente?.cpf||'').replace(/\D/g,'')===cpf);
  const docs=await loadDocumentos(current.id);
  current={...current,analiseCdc:{...current.analiseCdc,questionario:{...current.analiseCdc?.questionario,politica:POLICY_VERSION}}};
  return hash(JSON.stringify({questionario:current.analiseCdc?.questionario,valor:current.valor,parcela:current.parcela,prazo:current.prazo,taxa:current.taxa,dataPrimeira:current.dataPrimeira,cpf:current.dadosCliente?.cpf,history:relatives.sort((a,b)=>a.id.localeCompare(b.id)).map(x=>({id:x.id,assinado:!!x.aceite,hist:x.historicoCrediti||[]})),docs:await Promise.all(Object.keys(docs).sort().map(async key=>[key,await hash(docs[key].dataUrl||'')])),leitura:current.analiseDocumentos||{}}));
}
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
  <label>Renda líquida mensal comprovada (R$)</label><input type="text" id="rev-renda" inputmode="decimal" placeholder="0,00" value="${esc(formatAmount(q.renda))}">
  <label>Despesas essenciais mensais (R$)</label><input type="text" id="rev-despesas" inputmode="decimal" placeholder="0,00" value="${esc(formatAmount(q.despesas))}">
  <label>Outras parcelas mensais em andamento (R$)</label><input type="text" id="rev-outrasParcelas" inputmode="decimal" placeholder="0,00" value="${esc(formatAmount(q.outrasParcelas))}">
  <label>Há restrição informada ou verificada?</label><select id="rev-restricao"><option value="">Selecione</option><option value="nao">Não</option><option value="sim">Sim</option></select>
  <p class="hint">A análise considera sua resposta. Não faz consulta externa ao Serasa ou SPC. O pagamento é por Pix, usando a chave informada nos dados do cliente.</p>
  <h3>Documentos para análise</h3><p class="hint">Até 5 anexos por categoria, em PDF, JPG ou JPEG, até 700 KB cada. Você pode enviar frente e verso ou os comprovantes mensais separados.</p>
  ${DOCS.map(([key,label])=>`<div style="margin-bottom:18px;min-width:0"><label>${esc(label)}</label><input type="file" multiple data-doc="${key}" style="display:block;width:100%;max-width:100%;min-width:0;box-sizing:border-box;font-size:14px" accept="application/pdf,image/jpeg,.jpg,.jpeg"><div data-files="${key}" class="hint" style="overflow-wrap:anywhere"></div><button type="button" class="btn btn-outline" data-read="${key}">Ler anexos</button><div data-result="${key}" style="white-space:pre-wrap;overflow-wrap:anywhere"></div></div>`).join('')}
  <label style="display:flex;gap:10px"><input id="rev-cpfNaIdentidade" type="checkbox" style="width:auto" ${q.cpfNaIdentidade?'checked':''}>CPF consta no documento de identidade</label>
  <label style="display:flex;gap:10px"><input id="rev-documentosConferidos" type="checkbox" style="width:auto">Conferi os documentos, titularidade, datas, renda líquida e competências exigidas. Os dados correspondem à ficha.</label>
  <div id="rev-history"></div>
  <button type="button" class="btn btn-gold" id="rev-save">Salvar ficha da análise</button>
  <button type="button" class="btn btn-primary" id="rev-analyze">Analisar ficha</button>
  <div id="rev-output" style="white-space:pre-wrap;overflow-wrap:anywhere" role="status"></div>
  <label>Motivo da decisão manual ou confirmação</label><textarea id="rev-reason" maxlength="500"></textarea>
  <button type="button" class="btn btn-outline" id="rev-approve">Confirmar aprovação</button>
  <button type="button" class="btn btn-outline" id="rev-refuse">Recusar manualmente</button>
  <p class="hint">A decisão fica registrada com data e responsável. O retorno bruto da Crediti continua fora do PDF do cliente.</p>`;
  const el=k=>root.querySelector('#rev-'+k);
  root.querySelectorAll('input:not([type])').forEach(input=>{input.type='text';input.style.fontSize='16px';});
  root.querySelectorAll('textarea').forEach(input=>{Object.assign(input.style,{width:'100%',minHeight:'90px',boxSizing:'border-box',fontSize:'16px',padding:'11px',border:'1.5px solid var(--line)',borderRadius:'10px'});});
  root.style.minWidth='0';
  root.querySelectorAll('input[type="checkbox"]').forEach(input=>{input.style.flex='0 0 22px';input.style.width='22px';input.style.height='22px';});
  for(const k of ['renda','despesas','outrasParcelas']){const input=el(k);input.oninput=()=>{input.value=input.value.replace(/[^\d.,]/g,'');};input.onblur=()=>{if(input.value.trim()&&Number.isFinite(number(input.value)))input.value=formatAmount(number(input.value));};}
  el('restricao').value=q.restricao||'';
  const message=text=>{el('output').textContent=text;};
  if(record) message('Última avaliação: '+record.status+'\n'+record.motivos.join('\n')+'\n'+(s.analiseCdc.decisao?'Decisão confirmada: '+s.analiseCdc.decisao.status:'Aguardando conferência do administrador.'));
  const questionnaire=()=>Object.fromEntries(['renda','despesas','outrasParcelas','restricao','cpfNaIdentidade','documentosConferidos'].map(k=>[k,['renda','despesas','outrasParcelas'].includes(k)?(el(k).value.trim()?number(el(k).value):null):el(k).type==='checkbox'?el(k).checked:el(k).value]));
  const persist=async()=>{const current=await loadSim(id);current.analiseCdc={...(current.analiseCdc||{}),questionario:questionnaire(),atualizadoEm:Date.now()};delete current.analiseCdc.decisao;delete current.analiseCdc.resultado;await saveSim(current);return current;};
  const run=async button=>{button.disabled=true;try{await button.task();}catch(error){message(error.message||'Não foi possível concluir. Tente novamente.');}finally{button.disabled=false;}};
  const bind=(id,task)=>{const b=el(id);b.task=task;b.onclick=()=>run(b);};
  el('auto').onchange=async()=>{const enabled=el('auto').checked;el('auto').disabled=true;try{await db.collection('contadoresCCB').doc('analise_config').set({automatica:enabled,atualizadoEm:Date.now(),por:auth.currentUser.uid});config.automatica=enabled;message(enabled?'Análise automática ativada. Preencha a ficha e clique em Analisar ficha.':'Modo manual ativado.');}catch{el('auto').checked=!enabled;message('Não foi possível salvar a configuração.');}finally{el('auto').disabled=false;}};
  const cpf=String(s.dadosCliente?.cpf||'').replace(/\D/g,'');
  const related=async()=>{if(cpf.length!==11)throw Error('Preencha o CPF na ficha de contratação para vincular o histórico.');const all=await listSims();return all.filter(x=>String(x.dadosCliente?.cpf||'').replace(/\D/g,'')===cpf);};
  const snapshot=current=>creditSnapshot(current,{listSims,loadDocumentos});
  await mountCdcHistory(id,el('history'),ctx);
  let busy=false;
  const groupEl=(kind,key)=>root.querySelector('[data-'+kind+'="'+key+'"]');
  const refreshFiles=async()=>{
    const docs=await loadDocumentos(id),current=await loadSim(id);
    for(const [key] of DOCS){
      const keys=documentKeys(docs,key);
      groupEl('files',key).textContent=keys.length?keys.length+'/5 anexos: '+keys.map(k=>docs[k].nome||k).join('; '):'Nenhum anexo enviado.';
      groupEl('result',key).textContent=keys.map(k=>{const r=current.analiseDocumentos?.[k];if(!r)return (docs[k].nome||k)+': aguardando leitura';const d=r.document;return (docs[k].nome||k)+'\nLeitura: '+d.legibilidade+' | Tipo: '+d.tipo+'\nRenda líquida: '+(d.rendaLiquida==null?'Não identificada':money(d.rendaLiquida))+'\nCompetências: '+(d.competencias||[]).join(', ')+'\n'+(d.observacoes||'');}).join('\n\n');
    }
  };
  const lock=value=>{busy=value;root.querySelectorAll('button,input[type="file"]').forEach(e=>{e.disabled=value;});};
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
        el('documentosConferidos').checked=false;message('Anexos salvos. Clique em Ler anexos e confira os dados.');
      }catch(e){message(e.message);}finally{input.value='';try{await refreshFiles();}finally{lock(false);}}
    };
    button.task=async()=>{
      if(busy)return;lock(true);
      try{
        const docs=await loadDocumentos(id),keys=documentKeys(docs,key);if(!keys.length)throw Error('Anexe os documentos desta categoria primeiro.');
        for(const slot of keys){
          message('Lendo '+(docs[slot].nome||slot)+'…');
          const fingerprint=await hash(docs[slot].dataUrl);let current=await loadSim(id);const previous=current.analiseDocumentos?.[slot];
          if(previous?.hash===fingerprint)continue;
          if(previous?.hashes?.includes(fingerprint))throw Error('Este arquivo já foi lido antes. Envie uma nova digitalização.');
          const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await auth.currentUser.getIdToken()},body:JSON.stringify({dataUrl:docs[slot].dataUrl}),signal:AbortSignal.timeout(90000)});
          const data=await response.json();if(!response.ok||!data.document)throw Error(data.error||'Falha de leitura. Nenhuma recusa aplicada.');
          const review={hash:fingerprint,hashes:[...new Set([...(previous?.hashes||[]),fingerprint])],document:data.document,consecutivos:data.document.legibilidade==='ilegivel'?(previous?.consecutivos||0)+1:0,lidoEm:Date.now()};
          current=await loadSim(id);current.analiseDocumentos={...(current.analiseDocumentos||{}),[slot]:review};if(current.analiseCdc)delete current.analiseCdc.decisao;await saveSim(current);
        }
        el('documentosConferidos').checked=false;message('Leitura concluída. Confira os anexos antes de analisar.');
      }finally{try{await refreshFiles();}finally{lock(false);}}
    };button.onclick=()=>run(button);
  }
  await refreshFiles();
  bind('save',async()=>{await persist();message('Ficha da análise salva.');});
  bind('analyze',async()=>{
    if(busy)throw Error('Aguarde o envio ou a leitura dos anexos.');
    if(!config.automatica)throw Error('O modo automático está desligado. Ative-o para analisar ou registre uma decisão manual.');
    const current=await persist();const sims=await related();const docs=await loadDocumentos(id);const checks=[];
    const readDocs=[];
    for(const [key,label]of DOCS){
      if(key==='cpfFrente'&&questionnaire().cpfNaIdentidade)continue;
      const keys=documentKeys(docs,key);if(!keys.length)throw Error('Anexe os documentos de '+label);
      for(const slot of keys){const r=current.analiseDocumentos?.[slot];if(!r||r.hash!==await hash(docs[slot].dataUrl))throw Error('Leia o anexo atualizado: '+(docs[slot].nome||label));checks.push({label:docs[slot].nome||label,legibilidade:r.document.legibilidade,consecutivos:r.consecutivos,confirmado:questionnaire().documentosConferidos});readDocs.push({key,label,d:r.document});}
    }
    const history=sims.flatMap(x=>(x.historicoCrediti||[]).map(h=>({...h,contrato:x.id})));
    const result=evaluateCredit({q:questionnaire(),parcela:current.parcela,history,contracts:sims.filter(x=>x.aceite&&x.id!==id).map(x=>x.id),documents:checks,today:new Date().toLocaleDateString('en-CA',{timeZone:'America/Fortaleza'})});
    const conflicts=[];const expected={rgFrente:'identidade',cpfFrente:'cpf',comprovanteResidencia:'residencia',comprovanteRenda:'renda',contaCorrente:'conta'};
    for(const {key,label,d}of readDocs){if(d.tipo!==expected[key])conflicts.push('Tipo do documento não confirmado: '+label);if(d.cpf && d.cpf.replace(/\D/g,'')!==cpf)conflicts.push('CPF do documento diverge da ficha: '+label);}
    const incomes=readDocs.filter(x=>x.key==='comprovanteRenda'&&Number.isFinite(x.d.rendaLiquida)&&x.d.rendaLiquida>0).map(x=>x.d.rendaLiquida);
    if(!incomes.length)conflicts.push('Confirme a renda líquida: não foi identificada nos anexos.');
    else if(questionnaire().renda>Math.min(...incomes)+0.01)conflicts.push('A renda informada supera um dos comprovantes. Confira variações mensais e competências.');
    result.historicoConsiderado=history.map(h=>({contrato:h.contrato,tipo:h.tipo,data:h.data,nota:h.nota||'',dias:h.dias||0}));
    if(conflicts.length && result.status!=='Recusada'){result.status='Pendente';result.motivos=conflicts;result.pendencias=[...(result.pendencias||[]),...conflicts];}
    current.analiseCdc={...current.analiseCdc,resultado:result,avaliadoEm:Date.now(),por:auth.currentUser.uid};current.analiseCdc.snapshot=await snapshot(current);await saveSim(current);
    message(result.status+'\n'+result.motivos.join('\n')+'\nLimite da parcela: '+money(result.limiteParcela)+'\nHistórico consultado: '+history.length+' registro(s).'+(history.length?'\n'+history.map(h=>h.data+' • '+h.tipo+': '+(h.nota||'')).join('\n'):'')+'\nConfira as evidências e confirme a decisão abaixo.');
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
    await saveSim(current);await mountCdcHistory(id,el('history'),ctx);message('Decisão registrada: '+status+'. '+reason);
  }
  bind('approve',()=>decide('Aprovada'));bind('refuse',()=>decide('Recusada'));
}
