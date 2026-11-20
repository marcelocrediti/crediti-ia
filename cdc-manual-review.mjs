const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');
export const categoryKeys=(docs,key)=>Object.keys(docs||{}).filter(k=>k===key||k.startsWith(key+'__')||(key==='rgFrente'&&k==='rgVerso')).filter(k=>docs[k]?.dataUrl).sort();
export async function categoryEvidence(sim,docs,key){
  const keys=categoryKeys(docs,key),q=sim.analiseCdc?.questionario||{};
  const anexos=await Promise.all(keys.map(async slot=>({slot,hash:await hash(docs[slot].dataUrl)})));
  const ficha={cliente:sim.cliente||'',cpf:String(sim.dadosCliente?.cpf||'').replace(/\D/g,'')};
  if(key==='comprovanteRenda')ficha.renda=q.renda??null;
  if(key==='comprovanteResidencia'){ficha.titular=q.residenciaTitular||'';ficha.justificativa=q.residenciaJustificativa||'';}
  return {anexos,assinatura:await hash(JSON.stringify({key,ficha,anexos}))};
}
export async function manualConfirmed(sim,docs,key){
  const record=sim.analiseCdc?.conferencias?.[key];
  if(!record?.confirmado||!record.por||!record.data||!categoryKeys(docs,key).length)return false;
  return record.assinatura===(await categoryEvidence(sim,docs,key)).assinatura;
}
