export function attachmentBlob(file){
  const match=/^data:(application\/pdf|image\/(?:jpeg|jpg|png));base64,([A-Za-z0-9+/=\s]+)$/i.exec(String(file?.dataUrl||''));
  if(!match)throw Error('Formato do anexo não disponível para visualização.');
  let binary;try{binary=atob(match[2].replace(/\s/g,''));}catch{throw Error('O arquivo está incompleto. Envie o anexo novamente.');}
  if(!binary.length)throw Error('O anexo está vazio.');
  return new Blob([Uint8Array.from(binary,c=>c.charCodeAt(0))],{type:match[1].toLowerCase().replace('image/jpg','image/jpeg')});
}

export function showAttachments(files,title='Documentos anexados'){
  if(!files.length)throw Error('Anexe os documentos desta categoria primeiro.');
  const dialog=document.createElement('dialog'),urls=[];
  dialog.setAttribute('aria-label',title);
  Object.assign(dialog.style,{width:'min(960px, calc(100vw - 24px))',height:'90dvh',maxHeight:'90dvh',boxSizing:'border-box',padding:'16px',border:'2px solid #FDCA01',borderRadius:'18px',background:'#fff',color:'#123f50',overflow:'auto'});
  const heading=document.createElement('h2');heading.textContent=title;heading.style.fontSize='1.2rem';
  const close=document.createElement('button');close.type='button';close.className='btn btn-outline';close.textContent='Fechar documentos';close.onclick=()=>dialog.close();
  const list=document.createElement('div'),preview=document.createElement('div');
  const hint=document.createElement('p');hint.textContent='Escolha o documento. Para ampliar ou visualizar todas as páginas do PDF, toque em Abrir em outra aba.';
  const open=document.createElement('a');open.textContent='Abrir em outra aba';open.target='_blank';open.rel='noopener noreferrer';open.className='btn btn-outline';
  const download=document.createElement('a');download.textContent='Baixar documento';download.className='btn btn-outline';
  const name=document.createElement('p');name.style.overflowWrap='anywhere';
  const select=(file,button)=>{
    try{
      const blob=attachmentBlob(file),url=URL.createObjectURL(blob);urls.push(url);
      name.textContent=file.nome||'Documento';open.href=url;download.href=url;download.download=file.nome||'documento';
      preview.replaceChildren();
      const view=document.createElement(blob.type==='application/pdf'?'iframe':'img');
      if(blob.type==='application/pdf'){view.title=file.nome||'Documento PDF';Object.assign(view.style,{width:'100%',height:'55dvh',border:'1px solid #d9e5e5'});}
      else{view.alt=file.nome||'Documento anexado';Object.assign(view.style,{width:'100%',height:'auto',display:'block'});}
      view.src=url;preview.append(view);
      for(const b of list.children)b.setAttribute('aria-pressed',String(b===button));
    }catch(e){name.textContent=e.message;preview.replaceChildren();open.removeAttribute('href');download.removeAttribute('href');}
  };
  for(const [index,file] of files.entries()){
    const button=document.createElement('button');button.type='button';button.className='btn btn-outline';button.textContent=(index+1)+'. '+(file.nome||'Documento');button.style.overflowWrap='anywhere';button.onclick=()=>select(file,button);list.append(button);
  }
  dialog.append(heading,close,list,hint,name,open,download,preview);
  dialog.addEventListener('close',()=>{for(const url of urls)URL.revokeObjectURL(url);dialog.remove();});
  document.body.append(dialog);dialog.showModal();select(files[0],list.firstElementChild);close.focus();
  return dialog;
}
