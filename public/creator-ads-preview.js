(() => {
  const CARD_ID = "crediti-creator-ads-card";
  const OVERLAY_ID = "crediti-creator-ads-overlay";
  const STYLE_ID = "crediti-creator-ads-style";
  const STORAGE_KEY = "crediti_creator_ads_v1";

  const rules = [
    "Ter 18 anos ou mais.",
    "Informar nome completo e WhatsApp.",
    "Participar com perfil público no Instagram, TikTok ou Kwai.",
    "Ter no mínimo 2.000 seguidores no perfil informado.",
    "Manter o perfil público enquanto estiver ativo como Creator Ads.",
    "Enviar somente vídeos reais, originais e produzidos pelo próprio participante.",
    "Não usar músicas, imagens ou outros conteúdos protegidos sem autorização.",
    "Respeitar o tema, o prazo e as regras específicas de cada campanha.",
    "O envio do vídeo não garante seleção, prêmio ou publicação.",
    "Cada campanha terá prêmio e condições próprios. Bônus por visualizações só aparece quando estiver ativado pela Crediti.",
    "Somente a Crediti cria, altera, encerra campanhas e escolhe o vencedor.",
    "O pagamento é feito pela chave Pix cadastrada após a confirmação do resultado."
  ];

  function readProfile() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; }
  }
  function saveProfile(value) { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${CARD_ID}{width:100%;border:0;border-radius:22px;padding:18px;margin:16px 0 4px;background:#111;color:#fff;font:inherit;text-align:left;cursor:pointer;box-sizing:border-box;display:grid;gap:8px}
      #${CARD_ID}:focus-visible{outline:3px solid #FDCA01;outline-offset:3px}
      #${CARD_ID} .creator-kicker{display:inline-flex;width:fit-content;padding:5px 9px;border-radius:999px;background:#FDCA01;color:#111;font-size:11px;font-weight:800;text-transform:uppercase}
      #${CARD_ID} strong{display:block;font-size:clamp(18px,5vw,22px);line-height:1.12;font-weight:900}
      #${CARD_ID} small{display:block;color:rgba(255,255,255,.82);font-size:13px;line-height:1.4}
      #${CARD_ID} .creator-action{margin-top:4px;color:#FDCA01;font-size:13px;font-weight:800}
      #${OVERLAY_ID}{position:fixed;inset:0;z-index:99999;display:none;align-items:flex-end;justify-content:center;padding:12px;background:rgba(0,0,0,.58);box-sizing:border-box}
      #${OVERLAY_ID}[data-open="true"]{display:flex}
      #${OVERLAY_ID} .creator-sheet{width:min(100%,560px);max-height:calc(100dvh - 24px);overflow:auto;border-radius:26px 26px 18px 18px;background:#fff;color:#111;font-family:Montserrat,Arial,sans-serif;box-sizing:border-box;-webkit-overflow-scrolling:touch}
      #${OVERLAY_ID} .creator-head{position:sticky;top:0;z-index:2;padding:18px;background:#FDCA01;border-radius:26px 26px 0 0}
      #${OVERLAY_ID} .creator-head-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
      #${OVERLAY_ID} h2{margin:0;font-size:22px;line-height:1.05;font-weight:900}
      #${OVERLAY_ID} .creator-head p{margin:7px 0 0;font-size:13px;line-height:1.4;font-weight:600}
      #${OVERLAY_ID} .creator-close{width:42px;height:42px;border:0;border-radius:50%;background:#111;color:#fff;font-size:24px;cursor:pointer}
      #${OVERLAY_ID} .creator-body{padding:18px}
      #${OVERLAY_ID} .creator-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
      #${OVERLAY_ID} .creator-tabs button{min-height:42px;border:1px solid #ddd;border-radius:12px;background:#fff;font:inherit;font-size:12px;font-weight:800}
      #${OVERLAY_ID} .creator-tabs button[data-active="true"]{background:#111;color:#fff;border-color:#111}
      #${OVERLAY_ID} .creator-panel{display:none}
      #${OVERLAY_ID} .creator-panel[data-active="true"]{display:block}
      #${OVERLAY_ID} .creator-rules{list-style:none;padding:0;margin:0;display:grid;gap:9px}
      #${OVERLAY_ID} .creator-rules li{position:relative;padding:12px 12px 12px 38px;border:1px solid #e8e8e8;border-radius:14px;background:#fafafa;font-size:13px;line-height:1.42}
      #${OVERLAY_ID} .creator-rules li::before{content:"✓";position:absolute;left:12px;top:11px;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;background:#FDCA01;font-size:11px;font-weight:900}
      #${OVERLAY_ID} label{display:block;margin:10px 0 5px;font-size:12px;font-weight:800}
      #${OVERLAY_ID} input,#${OVERLAY_ID} select{width:100%;min-height:44px;border:1px solid #d7d7d7;border-radius:12px;padding:10px 12px;box-sizing:border-box;font:inherit;font-size:16px;background:#fff}
      #${OVERLAY_ID} .creator-check{display:flex;gap:10px;align-items:flex-start;margin:12px 0;font-size:12px;line-height:1.4}
      #${OVERLAY_ID} .creator-check input{width:20px;min-height:20px;margin-top:1px}
      #${OVERLAY_ID} .creator-primary{width:100%;min-height:46px;border:0;border-radius:13px;background:#FDCA01;color:#111;font:inherit;font-weight:900;cursor:pointer;margin-top:10px}
      #${OVERLAY_ID} .creator-status{padding:14px;border-radius:14px;background:#fff8d7;font-size:13px;line-height:1.45}
      #${OVERLAY_ID} .creator-term{padding:14px;border:1px solid #e6e6e6;border-radius:14px;background:#fafafa;font-size:12px;line-height:1.55;white-space:pre-line}
      #${OVERLAY_ID} .creator-success{padding:12px;border-radius:12px;background:#111;color:#fff;font-size:12px;line-height:1.45;margin-top:12px}
      @media(min-width:640px){#${OVERLAY_ID}{align-items:center}#${OVERLAY_ID} .creator-sheet{border-radius:24px}#${OVERLAY_ID} .creator-head{border-radius:24px 24px 0 0}}
    `;
    document.head.appendChild(style);
  }

  function createOverlay() {
    if (document.getElementById(OVERLAY_ID)) return;
    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.dataset.open = "false";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML = `
      <section class="creator-sheet">
        <header class="creator-head"><div class="creator-head-row"><div><h2>Creator Ads Crediti</h2><p>Envie seu vídeo, participe de campanhas e ganhe se for o escolhido.</p></div><button class="creator-close" type="button" aria-label="Fechar">×</button></div></header>
        <div class="creator-body">
          <div class="creator-tabs"><button type="button" data-tab="rules" data-active="true">Regras</button><button type="button" data-tab="register">Cadastro</button><button type="button" data-tab="term">Meu termo</button></div>
          <section class="creator-panel" data-panel="rules" data-active="true"><ul class="creator-rules">${rules.map(r=>`<li>${r}</li>`).join("")}</ul></section>
          <section class="creator-panel" data-panel="register"><div class="creator-status" id="creator-current-status">Seu cadastro ainda não foi enviado.</div>
            <form id="creator-form">
              <label>Nome completo</label><input name="name" required autocomplete="name">
              <label>WhatsApp</label><input name="whatsapp" required inputmode="tel" autocomplete="tel">
              <label>Plataforma</label><select name="platform" required><option value="">Escolha</option><option>Instagram</option><option>TikTok</option><option>Kwai</option></select>
              <label>@perfil ou link oficial</label><input name="profile" required autocapitalize="none">
              <label>Chave Pix</label><input name="pix" required>
              <label>Tipo da chave Pix</label><select name="pixType" required><option value="">Escolha</option><option>Telefone</option><option>E-mail</option><option>Chave aleatória</option><option>Outro</option></select>
              <label>Banco ou instituição da conta Pix</label><input name="bank" required>
              <label class="creator-check"><input type="checkbox" name="adult" required><span>Declaro que tenho 18 anos ou mais.</span></label>
              <label class="creator-check"><input type="checkbox" name="publicProfile" required><span>Confirmo que meu perfil é público e permanecerá público enquanto eu estiver ativo como Creator Ads.</span></label>
              <label class="creator-check"><input type="checkbox" name="imageConsent" required><span>Autorizo a Crediti a utilizar minha imagem, voz, nome e conteúdo enviado conforme o termo e a campanha.</span></label>
              <label class="creator-check"><input type="checkbox" name="dataConsent" required><span>Concordo com o tratamento dos dados necessários para cadastro, análise, contato, participação e pagamento.</span></label>
              <button class="creator-primary" type="submit">Enviar cadastro para análise</button>
            </form>
            <div id="creator-message" aria-live="polite"></div>
          </section>
          <section class="creator-panel" data-panel="term"><div class="creator-term" id="creator-term-content">Você ainda não possui termo aceito.</div></section>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    const close = () => { overlay.dataset.open="false"; document.documentElement.style.overflow=""; };
    overlay.querySelector(".creator-close").addEventListener("click", close);
    overlay.addEventListener("click", e => { if(e.target===overlay) close(); });
    document.addEventListener("keydown", e => { if(e.key==="Escape" && overlay.dataset.open==="true") close(); });

    overlay.querySelectorAll("[data-tab]").forEach(btn => btn.addEventListener("click", () => {
      overlay.querySelectorAll("[data-tab]").forEach(b=>b.dataset.active=String(b===btn));
      overlay.querySelectorAll("[data-panel]").forEach(p=>p.dataset.active=String(p.dataset.panel===btn.dataset.tab));
      refreshProfile();
    }));

    overlay.querySelector("#creator-form").addEventListener("submit", e => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      const profile = {
        name:String(f.get("name")||"").trim(), whatsapp:String(f.get("whatsapp")||"").trim(), platform:String(f.get("platform")||""), profile:String(f.get("profile")||"").trim(), pix:String(f.get("pix")||"").trim(), pixType:String(f.get("pixType")||""), bank:String(f.get("bank")||"").trim(), status:"Em análise", acceptedAt:new Date().toISOString(), termVersion:"Creator Ads v1.0"
      };
      if(!profile.name.includes(" ")) { alert("Informe nome e sobrenome."); return; }
      saveProfile(profile);
      overlay.querySelector("#creator-message").innerHTML='<div class="creator-success">Cadastro salvo. Status: <b>Em análise</b>. A Crediti precisa verificar manualmente se o perfil está público e possui pelo menos 2.000 seguidores.</div>';
      refreshProfile();
    });

    function refreshProfile(){
      const p = readProfile();
      const status = overlay.querySelector("#creator-current-status");
      const term = overlay.querySelector("#creator-term-content");
      if(!p){ status.textContent="Seu cadastro ainda não foi enviado."; term.textContent="Você ainda não possui termo aceito."; return; }
      status.innerHTML=`<b>${p.name}</b><br>${p.platform}: ${p.profile}<br>Status: <b>${p.status}</b>`;
      const accepted = new Date(p.acceptedAt).toLocaleString("pt-BR");
      term.textContent=`TERMO DE PARTICIPAÇÃO, USO DE IMAGEM E TRATAMENTO DE DADOS\n\nParticipante: ${p.name}\nPlataforma: ${p.platform}\nPerfil: ${p.profile}\nVersão: ${p.termVersion}\nAceite registrado em: ${accepted}\n\nDeclaro que tenho 18 anos ou mais. Autorizo a Crediti Soluções Financeiras a utilizar minha imagem, voz, nome, nome de perfil e conteúdo audiovisual enviado para divulgação das campanhas e da marca Crediti em seus canais digitais, observadas as condições da campanha. Concordo com o tratamento dos dados necessários à participação, análise, contato e eventual pagamento. O envio do vídeo não garante seleção, publicação ou pagamento. Cada campanha terá suas próprias regras, prazo e prêmio. Bônus por visualizações somente se expressamente previsto na campanha.\n\nEste termo permanece disponível para consulta e não pode ser editado após o aceite.`;
    }
    overlay.refreshProfile = refreshProfile;
  }

  function openOverlay(){ const o=document.getElementById(OVERLAY_ID); if(!o)return; o.dataset.open="true"; document.documentElement.style.overflow="hidden"; o.refreshProfile?.(); requestAnimationFrame(()=>o.querySelector(".creator-close")?.focus()); }

  function mountCard(){
    if(document.getElementById(CARD_ID)) return;
    const tools=document.querySelector(".home-personal-tools");
    if(!tools||!tools.parentElement) return;
    const card=document.createElement("button"); card.id=CARD_ID; card.type="button";
    card.innerHTML='<span class="creator-kicker">1 vencedor por campanha</span><strong>Seja um Creator Ads da Crediti e fature</strong><small>Envie seu vídeo, participe de campanhas e ganhe se for o escolhido.</small><span class="creator-action">Ver campanhas ›</span>';
    card.addEventListener("click",openOverlay); tools.insertAdjacentElement("afterend",card);
  }

  function init(){ injectStyles(); createOverlay(); mountCard(); const observer=new MutationObserver(mountCard); observer.observe(document.getElementById("root")||document.body,{childList:true,subtree:true}); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
})();
