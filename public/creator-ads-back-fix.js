(() => {
  const STYLE_ID = 'crediti-creator-back-fix-style';
  const PAGE_ID = 'crediti-creator-ads-page';

  function applyFix() {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
#${PAGE_ID} .top{gap:12px!important;}
#${PAGE_ID} .back{
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  flex:0 0 auto!important;
  width:auto!important;
  min-width:136px!important;
  max-width:none!important;
  min-height:42px!important;
  padding:10px 14px!important;
  margin:0!important;
  white-space:nowrap!important;
  line-height:1!important;
  overflow:visible!important;
  text-align:center!important;
  border:1px solid #e7d7cf!important;
  background:#fff1e9!important;
  color:#6a2c18!important;
  border-radius:13px!important;
  font-size:12px!important;
  font-weight:900!important;
}
#${PAGE_ID} .brand{flex:0 0 auto!important;white-space:nowrap!important;}
@media(max-width:390px){
  #${PAGE_ID} .top{padding:12px 14px!important;}
  #${PAGE_ID} .back{min-width:128px!important;padding:10px 12px!important;font-size:11px!important;}
  #${PAGE_ID} .brand{font-size:21px!important;}
}
`;
      document.head.appendChild(style);
    }
  }

  applyFix();
  new MutationObserver(applyFix).observe(document.documentElement, { childList: true, subtree: true });
})();
