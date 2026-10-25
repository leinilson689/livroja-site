import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {getAuth, signInAnonymously, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {getFirestore, collection, addDoc, serverTimestamp, query, where, onSnapshot, getDocs, doc, updateDoc, deleteDoc} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import {getStorage, ref, uploadBytes, getDownloadURL} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js';
const $=id=>document.getElementById(id);
const status=$('firebase-status'), results=$('public-listings'), form=$('sell-form'), feedback=$('sell-result');
const conf=window.LIVROJA_FIREBASE_CONFIG||{};
const missing=['apiKey','authDomain','projectId','appId'].some(k=>!conf[k]);
const help='Configuração necessária: cria um projecto no Firebase, activa Authentication e Firestore, copia as credenciais para firebase-config.js e publica as regras fornecidas.';
if(missing){status.textContent=help;form.querySelector('button[type=submit]').disabled=true;$('admin-login').disabled=true;}
else{
 const app=initializeApp(conf),auth=getAuth(app),db=getFirestore(app),col=collection(db,'anuncios');
 let current=null, publicStop=null, adminStop=null, latestPublic=null;
 function say(node,message){node.hidden=false;node.textContent=message;}
 function element(tag,css,text){const el=document.createElement(tag);if(css)el.className=css;if(text!==undefined)el.textContent=String(text);return el}
 function draw(item,admin=false){
  const card=element('article','market-card');
  const visual=element('div','market-visual book-visual');
  if(item.photoURL && /^https:\/\//.test(item.photoURL)){
   const photo=document.createElement('img');photo.src=item.photoURL;photo.loading='lazy';photo.alt='Fotografia do material';photo.referrerPolicy='no-referrer';photo.style.cssText='width:100%;height:180px;object-fit:cover;border-radius:12px';visual.append(photo)
  }else visual.append(element('span','',item.kind==='Calculadora'?'🧮':item.kind==='Livro'?'📘':'🎒'));
  const body=element('div','market-content');body.append(element('span','tag',admin?`ESTADO: ${item.status}`:'ANÚNCIO APROVADO'),element('h3','',item.title||'Material escolar'),element('p','',[item.kind,item.condition,item.city,item.description].filter(Boolean).join(' · ').slice(0,450)));
  const bottom=element('div','market-bottom');bottom.append(element('strong','',`${Number(item.price)||0} MT`));
  if(admin){
   for(const [label,state] of [['Aprovar','aprovado'],['Rejeitar','rejeitado']]){
    const b=element('button','',label);b.type='button';b.disabled=item.status===state;b.addEventListener('click',async()=>{try{await updateDoc(doc(db,'anuncios',item.id),{status:state});b.textContent='Guardado ✓'}catch(e){alert('Sem permissão para alterar este anúncio. Confirma o UID do administrador nas regras.')}});bottom.append(b)
   }
   const del=element('button','','Eliminar');del.type='button';del.addEventListener('click',async()=>{if(confirm('Eliminar definitivamente este anúncio?'))try{await deleteDoc(doc(db,'anuncios',item.id))}catch{alert('Sem permissão para eliminar.')}});bottom.append(del)
  }else{
   const b=element('button','','Tenho interesse ↗');b.type='button';b.addEventListener('click',()=>{const code=`Anúncio ${item.id}: ${item.title} (${item.price} MT, ${item.city})`;const topic=$('request-topic');$('request-service').value='Comprar material usado';topic.value=code;$('contacto').scrollIntoView({behavior:'smooth'});topic.focus({preventScroll:true})});bottom.append(b)
  }
  body.append(bottom);card.append(visual,body);return card;
 }
 function render(target,snapshot,admin=false){target.replaceChildren();if(snapshot.empty){target.append(element('p','empty',admin?'Ainda não existem anúncios.':'Ainda não há anúncios aprovados.'));return}snapshot.forEach(d=>target.append(draw({...d.data(),id:d.id},admin)))}
 const showPublic=()=>{if(!latestPublic)return;const term=$('market-search').value.trim().toLocaleLowerCase('pt');results.replaceChildren();let total=0;latestPublic.forEach(d=>{const item=d.data();if([item.title,item.city,item.kind,item.description,item.condition].join(' ').toLocaleLowerCase('pt').includes(term)){results.append(draw({...item,id:d.id}));total++}});if(!total)results.append(element('p','empty','Nenhum anúncio aprovado corresponde à pesquisa.'))};$('market-search').addEventListener('input',showPublic);
 publicStop=onSnapshot(query(col,where('status','==','aprovado')),snap=>{latestPublic=snap;status.textContent='Catálogo da comunidade actualizado.';showPublic()},err=>{status.textContent=`Erro a carregar anúncios: ${err.message}. Verifica as regras e os índices do Firestore.`});
 onAuthStateChanged(auth,user=>{current=user;const isGoogle=!!user?.providerData?.some(p=>p.providerId==='google.com');$('admin-state').textContent=isGoogle?`Sessão: ${user.email} | UID: ${user.uid}`:'Visitante — os anúncios são enviados para aprovação';$('admin-login').hidden=isGoogle;$('admin-logout').hidden=!isGoogle;if(adminStop){adminStop();adminStop=null}$('admin-list').replaceChildren();if(isGoogle){adminStop=onSnapshot(col,snap=>render($('admin-list'),snap,true),err=>{$('admin-list').textContent='Sem permissões de administração. Confirma o teu UID nas regras do Firestore.'})}});
 async function ensureAnon(){if(auth.currentUser)return auth.currentUser;const r=await signInAnonymously(auth);return r.user}
 form.addEventListener('submit',async ev=>{
  ev.preventDefault();if(!form.reportValidity())return;
  const submit=form.querySelector('[type=submit]');submit.disabled=true;submit.textContent='A enviar…';
  const value=id=>$(id).value.trim();
  try{
   const user=await ensureAnon(),file=$('sell-photo').files[0];
   if(file&&(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>3*1024*1024))throw Error('Escolhe JPG, PNG ou WebP até 3 MB.');
   let photoURL=value('sell-photo-url');if(photoURL&&!/^https:\/\//i.test(photoURL))throw Error('O endereço da fotografia tem de começar com https://');
   if(file){
    if(!conf.storageBucket)throw Error('O armazenamento não foi configurado. Usa um link HTTPS da fotografia ou retira o ficheiro.');
    const storage=getStorage(app),path=`anuncios/${user.uid}/${crypto.randomUUID()}.${file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg'}`;
    try{const imageRef=ref(storage,path);await uploadBytes(imageRef,file,{contentType:file.type});photoURL=await getDownloadURL(imageRef)}catch(e){throw Error('Não foi possível enviar a fotografia. O Firebase Storage requer o plano Blaze com facturação e regras próprias. Podes publicar sem fotografia ou usar um link HTTPS.')}
   }
   await addDoc(col,{ownerUid:user.uid,kind:value('sell-kind'),title:value('sell-title'),condition:value('sell-condition'),price:Number(value('sell-price')),city:value('sell-city'),operation:value('sell-operation'),description:value('sell-description'),photoURL,status:'pendente',createdAt:serverTimestamp()});
   form.reset();say(feedback,'Anúncio enviado! Está pendente de aprovação pelo LivroJá. Quando aprovado, aparece para todos os visitantes.');
  }catch(e){say(feedback,`Não foi possível enviar: ${e.message}`)}finally{submit.disabled=false;submit.textContent='Enviar anúncio para aprovação ↗'}
 });
 $('admin-login').addEventListener('click',async()=>{try{await signInWithPopup(auth,new GoogleAuthProvider())}catch(e){$('admin-state').textContent=`Falha no login: ${e.message}`}});
 $('admin-logout').addEventListener('click',async()=>{await signOut(auth);$('admin-state').textContent='Sessão terminada'});
}
