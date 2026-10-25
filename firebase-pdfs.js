import {initializeApp,getApps,getApp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {getAuth,signInAnonymously} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {getFirestore,collection,addDoc,serverTimestamp,onSnapshot,query,where} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import {getStorage,ref,uploadBytes,getDownloadURL} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js';
const byId=id=>document.getElementById(id);
const form=byId('pdf-form'), result=byId('pdf-result'), shelves=byId('pdf-shelves');
const conf=window.LIVROJA_FIREBASE_CONFIG||{};
const configured=['apiKey','authDomain','projectId','appId'].every(key=>!!conf[key]);
const subjects=['Matemática','Português','Física','Química','Biologia','História','Geografia','Inglês','Filosofia','Outra'];
const filterSubject=byId('pdf-filter-subject');subjects.forEach(s=>{const o=document.createElement('option');o.value=s;o.textContent=s;filterSubject.append(o)});
function message(txt){result.hidden=false;result.textContent=txt}
function node(tag,klass,txt){const n=document.createElement(tag);if(klass)n.className=klass;if(txt!==undefined)n.textContent=String(txt);return n}
function validHttps(v){try{const u=new URL(v);return u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password}catch{return false}}
function render(items){shelves.replaceChildren();const grade=byId('pdf-filter-grade').value,subject=filterSubject.value,search=byId('pdf-filter-search').value.trim().toLocaleLowerCase('pt');
  let matches=items.filter(x=>(!grade||x.classe===grade)&&(!subject||x.disciplina===subject)&&[x.titulo,x.disciplina,x.descricao,x.autor].join(' ').toLocaleLowerCase('pt').includes(search));
  if(!matches.length){shelves.append(node('p','empty','Ainda não há PDFs para esta pesquisa. Podes adicionar o primeiro.'));return}
  for(const g of ['10','11','12']){const list=matches.filter(x=>x.classe===g);if(!list.length)continue;
    const section=node('section','pdf-shelf'),heading=node('h3','',`${g}.ª classe · ${list.length} ${list.length===1?'PDF':'PDFs'}`),grid=node('div','pdf-grid');section.append(heading,grid);
    for(const item of list){const card=node('article','pdf-book');card.append(node('div','pdf-icon','📘'),node('span','pdf-meta',item.disciplina),node('h4','',item.titulo),node('p','',item.descricao));if(item.autor)card.append(node('p','pdf-author',`Fonte: ${item.autor}`));const a=node('a','','Abrir PDF ↗');a.href=item.url;a.target='_blank';a.rel='noopener noreferrer nofollow';card.append(a);grid.append(card)}shelves.append(section)}
}
if(!configured){shelves.textContent='Para mostrar PDFs partilhados, configura firebase-config.js.';form.querySelector('[type=submit]').disabled=true}
else{
const app=getApps().length?getApp():initializeApp(conf),auth=getAuth(app),db=getFirestore(app),pdfs=collection(db,'pdfs');
let all=[];onSnapshot(query(pdfs,where('status','==','publicado')),snap=>{all=snap.docs.map(d=>({...d.data(),id:d.id}));render(all)},e=>{shelves.textContent=`Não foi possível carregar os PDFs: ${e.message}. Confirma as regras do Firestore.`});
['pdf-filter-grade','pdf-filter-subject','pdf-filter-search'].forEach(id=>byId(id).addEventListener('input',()=>render(all)));
form.addEventListener('submit',async ev=>{ev.preventDefault();if(!form.reportValidity())return;const btn=form.querySelector('[type=submit]');btn.disabled=true;btn.textContent='A publicar…';
 try{
  const user=auth.currentUser|| (await signInAnonymously(auth)).user;
  const val=id=>byId(id).value.trim();let url=val('pdf-url'),file=byId('pdf-file').files[0];
  if(file&&url)throw Error('Escolhe apenas uma opção: ficheiro ou ligação.');if(!file&&!url)throw Error('Selecciona um PDF ou indica a sua ligação HTTPS.');
  if(url&&!validHttps(url))throw Error('Indica um endereço HTTPS válido para o PDF.');
  if(file){if(file.size>10*1024*1024)throw Error('O limite é 10 MB.');if(file.type!=='application/pdf'||!file.name.toLowerCase().endsWith('.pdf'))throw Error('Escolhe um ficheiro PDF válido.');
   const path=`pdfs/${user.uid}/${crypto.randomUUID()}.pdf`;
   try{const r=ref(getStorage(app),path);await uploadBytes(r,file,{contentType:'application/pdf'});url=await getDownloadURL(r)}catch(e){throw Error('Não foi possível enviar o PDF. É necessário configurar o Firebase Storage (plano Blaze) e as regras storage.rules. Em alternativa, utiliza um link HTTPS.')}}
  const data={titulo:val('pdf-title'),classe:val('pdf-grade'),disciplina:val('pdf-subject'),autor:val('pdf-author'),descricao:val('pdf-description'),url,status:'publicado',ownerUid:user.uid,createdAt:serverTimestamp()};
  await addDoc(pdfs,data);form.reset();message('PDF adicionado! Já deverá aparecer na biblioteca, na classe escolhida.');
 }catch(e){message('Não foi possível adicionar o PDF: '+e.message)}finally{btn.disabled=false;btn.textContent='Adicionar à biblioteca ↗'}});
}
