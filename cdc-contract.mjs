// The final form complements an approved proposal. It does not issue a payment.
const digits=v=>String(v||'').replace(/\D/g,'');
export function collectContractData(previous,read){
  const get=(key,fallback='')=>{const value=read('dc-'+key);return value==null?fallback:String(value).trim();};
  const old=previous||{},address=old.enderecoEstruturado||{};
  const enderecoEstruturado=Object.fromEntries(['cep','rua','numero','bairro','complemento','cidade','uf'].map(key=>[key,get(key,address[key]||'')]));
  enderecoEstruturado.uf=enderecoEstruturado.uf.toUpperCase();
  const e=enderecoEstruturado;
  const endereco=[e.rua&&(e.rua+(e.numero?', '+e.numero:'')),e.complemento,e.bairro,(e.cidade||e.uf)&&(e.cidade+(e.uf?'/'+e.uf:'')),e.cep&&'CEP '+e.cep].filter(Boolean).join(', ')||old.endereco||'';
  return {...old,cpf:digits(get('cpf',old.cpf)),rg:get('rg',old.rg),nascimento:get('nasc',old.nascimento),nomePai:get('pai',old.nomePai),nomeMae:get('mae',old.nomeMae),profissao:get('prof',old.profissao),renda:get('renda',old.renda),escolaridade:get('escola',old.escolaridade),telefone:get('tel',old.telefone),email:get('email',old.email),endereco,enderecoEstruturado,pix:get('pix-aprovado',get('pix',old.pix))};
}
export function missingContractData(d){
  return [[digits(d.cpf).length===11,'CPF completo'],[d.nascimento,'data de nascimento'],[digits(d.telefone).length>=10,'telefone com DDD'],[d.endereco,'endereço'],[d.profissao,'profissão ou ocupação'],[d.pix,'chave Pix']].filter(([ok])=>!ok).map(([,label])=>label);
}
export function approvalPdfLines(s){
  const d=s.analiseCdc?.decisao;
  if(d?.status!=='Aprovada')return [];
  return ['REGISTRO DA APROVAÇÃO','Motivo da aprovação: '+(d.motivo||'Não informado'), 'Confirmada em: '+new Date(d.data).toLocaleString('pt-BR',{timeZone:'America/Fortaleza'}),'Responsável: '+(d.responsavel||d.por||'Administrador'),'Forma de decisão: '+(d.modo==='manual'?'Conferência manual':'Análise confirmada pelo administrador')];
}
