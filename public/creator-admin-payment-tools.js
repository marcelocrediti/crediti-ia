(() => {
  const BASE='https://vgdtywdpywezrwlrsawq.supabase.co';
  const REST=`${BASE}/rest/v1`;
  const KEY='sb_publishable_dmoTPKmglghAohv0MrRA9A_2zlUYhER';
  const TOKEN_KEY='crediti_creator_admin_token';
  const token=()=>localStorage.getItem(TOKEN_KEY)||'';
  const headers=(extra={})=>({apikey:KEY,Authorization:`Bearer ${token()}`,...extra});
  const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const fmt=v=>v?new Date(v).toLocaleString('pt-BR'):'-';
  let financeLoading=false;

  async function rest(path,opts={}){
    if(typeof window.creatorAdminRest==='function')return window.creatorAdminRest(path,opts);
    const r=await fetch(`${REST}/${path}`,{...opts,headers:headers({'Content-Type':'application/json',Prefer:'return=representation',...(opts.headers||{})})});
    const text=await r.text();
    if(!r.ok)throw new Error(text||'Não foi possível concluir.');
    return text?JSON.parse(text):null;
  }

  async function loadFinance(){
    if(financeLoading||!token())return;
    financeLoading=true;
    try{
      const [pays,profiles,campaigns]=await Promise.all([
        rest('creator_ads_payments?select=*&order=created_at.desc'),
        rest('creator_ads_profiles?select=id,nome,whatsapp,pix_chave,pix_tipo,banco_instituicao'),
        rest('creator_ads_campaigns?select=id,titulo')
      ]);
      const pm=Object.fromEntries(profiles.map(p=>[p.id,p]));
      const cm=Object.fromEntries(campaigns.map(c=>[c.id,c]));
      const box=document.getElementById('paymentsList');
      if(!box)return;
      box.innerHTML=pays.length?pays.map(x=>{
        const p=pm[x.profile_id]||{},c=cm[x.campaign_id]||{};
        const paid=x.status==='pago';
        return `<article class="item-card" data-payment-card="${esc(x.id)}"><span class="status ${paid?'pago':'pendente'}">${paid?'PAGO':'PENDENTE'}</span><h3>${esc(p.nome||'Creator')}</h3><div class="meta"><span>Campanha: ${esc(c.titulo||'-')}</span><span>Prêmio: ${money(x.premio)} · Bônus: ${money(x.bonus)}</span><span>Total: <b>${money(x.total)}</b></span><span>Pix: ${esc(p.pix_chave||'-')}</span><span>Banco/instituição: ${esc(p.banco_instituicao||'-')}</span>${paid?`<span>Pago em: <b>${esc(fmt(x.pago_em))}</b></span>`:''}</div><div class="card-actions">${!paid?`<button type="button" class="accent" data-fin-action="paid" data-id="${esc(x.id)}">Registrar pagamento</button>`:`<button type="button" class="accent" data-fin-action="receipt" data-id="${esc(x.id)}">Baixar recibo PDF</button><button type="button" data-fin-action="copy" data-id="${esc(x.id)}">Copiar recibo</button>`}<button type="button" class="danger" data-fin-action="delete" data-id="${esc(x.id)}">Apagar registro</button></div></article>`;
      }).join(''):'<div class="empty">Nenhum pagamento registrado.</div>';
    }finally{financeLoading=false}
  }

  async function getBundle(id){
    const pay=(await rest(`creator_ads_payments?id=eq.${encodeURIComponent(id)}&select=*`))?.[0];
    if(!pay)throw new Error('Pagamento não encontrado.');
    const [p,c]=(await Promise.all([
      rest(`creator_ads_profiles?id=eq.${encodeURIComponent(pay.profile_id)}&select=id,nome,whatsapp,pix_chave,pix_tipo,banco_instituicao`),
      rest(`creator_ads_campaigns?id=eq.${encodeURIComponent(pay.campaign_id)}&select=id,titulo`)
    ]));
    return {pay,profile:p?.[0]||{},campaign:c?.[0]||{}};
  }

  async function markPaid(id){
    const today=new Date().toISOString().slice(0,10);
    const date=prompt('Informe a data do pagamento no formato AAAA-MM-DD:',today);
    if(date===null)return;
    const parsed=new Date(`${date}T12:00:00`);
    if(Number.isNaN(parsed.getTime())){alert('Data inválida.');return;}
    if(!confirm(`Confirmar pagamento realizado em ${parsed.toLocaleDateString('pt-BR')}?`))return;
    await rest(`creator_ads_payments?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify({status:'pago',pago_em:parsed.toISOString()})});
    await loadFinance();
  }

  function receiptText({pay,profile,campaign}){
    const paidDate=pay.pago_em?new Date(pay.pago_em).toLocaleDateString('pt-BR'):'-';
    return `RECIBO DE PAGAMENTO - CREATOR ADS CREDITI\n\nConfirmamos que a Crediti Soluções Financeiras realizou o pagamento a ${profile.nome||'Creator'}, referente à campanha “${campaign.titulo||'-'}”, no valor total de ${money(pay.total)}, via Pix cadastrado, em ${paidDate}.\n\nPrêmio: ${money(pay.premio)}\nBônus: ${money(pay.bonus)}\nTotal pago: ${money(pay.total)}\nChave Pix: ${profile.pix_chave||'-'}\nBanco/instituição: ${profile.banco_instituicao||'-'}\n\nRegistro: ${pay.id}`;
  }

  function saveReceiptPdf(bundle){
    const jsPDF=window.jspdf?.jsPDF;
    if(!jsPDF){alert('Gerador de PDF ainda não carregou. Atualize a página e tente novamente.');return;}
    const doc=new jsPDF({unit:'mm',format:'a4'}),m=18,w=174;
    doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text('CREDITI',m,22);
    doc.setFontSize(12);doc.text('Creator Ads | Recibo de pagamento',m,31);
    doc.setFont('helvetica','normal');doc.setFontSize(10);
    doc.text(doc.splitTextToSize(receiptText(bundle),w),m,43);
    const safe=String(bundle.profile.nome||'creator').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)||'creator';
    doc.save(`recibo-creator-ads-${safe}.pdf`);
  }

  async function copyReceipt(bundle){await navigator.clipboard.writeText(receiptText(bundle));alert('Recibo copiado. Você pode enviar pelo WhatsApp ao Creator.');}
  async function deletePayment(id){if(!confirm('Apagar este registro de pagamento? Esta ação remove o registro financeiro desta tela.'))return;await rest(`creator_ads_payments?id=eq.${encodeURIComponent(id)}`,{method:'DELETE',headers:{Prefer:'return=minimal'}});await loadFinance();}
  async function deleteCreator(id,card){
    const [subs,pays]=await Promise.all([rest(`creator_ads_submissions?profile_id=eq.${encodeURIComponent(id)}&select=id&limit=1`),rest(`creator_ads_payments?profile_id=eq.${encodeURIComponent(id)}&select=id&limit=1`)]);
    if((subs&&subs.length)||(pays&&pays.length)){alert('Este Creator já possui histórico de vídeo ou pagamento. Para preservar os registros, use “Desativar Creator” em vez de apagar.');return;}
    if(!confirm('Apagar definitivamente este cadastro de Creator?'))return;
    await rest(`creator_ads_profiles?id=eq.${encodeURIComponent(id)}`,{method:'DELETE',headers:{Prefer:'return=minimal'}});card?.remove();
  }

  function enhanceCreators(){
    document.querySelectorAll('#profilesList .item-card').forEach(card=>{
      if(card.querySelector('[data-delete-creator]'))return;
      const src=card.querySelector('[data-profile]'),id=src?.dataset.profile,actions=card.querySelector('.card-actions');
      if(!id||!actions)return;
      const b=document.createElement('button');b.type='button';b.className='danger';b.textContent='Apagar cadastro';b.dataset.deleteCreator=id;
      b.addEventListener('click',e=>{e.stopPropagation();deleteCreator(id,card).catch(err=>alert(err.message));});actions.appendChild(b);
    });
  }

  document.addEventListener('click',async e=>{
    const tab=e.target.closest('[data-tab="pagamentos"]');if(tab){setTimeout(()=>loadFinance().catch(err=>alert(err.message)),80);return;}
    const b=e.target.closest('[data-fin-action]');if(!b||b.disabled)return;
    e.preventDefault();e.stopImmediatePropagation();
    const original=b.textContent;b.disabled=true;b.setAttribute('aria-busy','true');
    try{
      if(b.dataset.finAction==='paid')await markPaid(b.dataset.id);
      if(b.dataset.finAction==='receipt')saveReceiptPdf(await getBundle(b.dataset.id));
      if(b.dataset.finAction==='copy')await copyReceipt(await getBundle(b.dataset.id));
      if(b.dataset.finAction==='delete')await deletePayment(b.dataset.id);
    }catch(err){alert(err.message||'Não foi possível concluir.');}
    finally{if(document.body.contains(b)){b.disabled=false;b.removeAttribute('aria-busy');b.textContent=original}}
  },true);

  const obs=new MutationObserver(()=>enhanceCreators());
  obs.observe(document.getElementById('profilesList')||document.documentElement,{subtree:true,childList:true});
  setTimeout(enhanceCreators,250);
})();
