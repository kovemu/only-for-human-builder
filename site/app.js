import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-config.js';
const DEADLINE = new Date('2031-09-17T17:51:00Z').getTime();
const K = 'ofh-v1';
const SUPABASE_READY = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
const EXHIBIT_PREFIX = 'sample-';
const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const MAX_LONG_EDGE = 1920;
const TARGET_UPLOAD_BYTES = 900 * 1024;
const seedNotes = {
  0: [
    {author_name:'museum visitor',body:'this should not have survived lunch.',created_at:'2026-09-20T12:11:00Z'},
    {author_name:'human #41',body:'finally, a serious work about impermanence.',created_at:'2026-09-20T13:22:00Z'}
  ],
  1: [{author_name:'anonymous human',body:'eleven years is long-term curation.',created_at:'2026-09-19T09:10:00Z'}],
  2: [{author_name:'museum visitor',body:'the line work is fearless. mostly because the artist was nine.',created_at:'2026-09-18T18:43:00Z'}]
};
const sampleDescriptions = [
  'half a taco. no restoration planned.',
  'a rock kept for eleven years for reasons lost to history.',
  'first terrible painting. age nine. confidence intact.',
  'drawing from 2004. survived every cleanup somehow.',
  'blurry moon. classic human error.',
  'forgot why this was photographed. preserved anyway.',
  'wall near home. no reason.',
  'sock with structural damage.',
  'last dumpling. no longer extant.',
  'proof that today happened.'
];
const PIXELS = ['111101101101101101111','010110010010010010111','111001001111100100111','111001001111001001111','101101101111001001001','111100100111001001111','111100100111101101111','111001001010010010010','111101101111101101111','111101101111001001111'];
const copy = {
 en:{status:'EST. 2026 // END EST. 2031 // HUMAN IMAGE DUMP',badge:'DOOMSDAY CLOCK // UNOFFICIAL',title:'THE TIME REMAINING UNTIL A.I DESTROYS HUMANITY',note:'WE HAVE NOT VERIFIED THIS. KEEP UPLOADING.',premise:"scientists did not approve this timer. that's not the point.",tag:'leave something before we go.',leave:'LEAVE SOMETHING',saved:'[ saved ]',you:'[ you ]',feed:'RECENT HUMAN DEBRIS',sort:'[ newest first ]',feedNote:'no ranking. no taste. just things people bothered to leave.',footer:'human-made. not necessarily good. // still here.',uploadKicker:'ARCHIVE INTAKE FORM 001',uploadTitle:"leave one thing. make it count. or don't.",drop:'DROP ONE (1) IMAGE HERE',formats:'JPG / PNG / WEBP // one image only',caption:'optional note for future archaeologists',human:'I made this / took this. It is not an AI-generated image.',warning:'NO AI IMAGES. WE ALREADY HAVE ENOUGH OF THAT.',cancel:'[ actually, never mind ]',detail:'HUMAN ARTIFACT',save:'[ KEEP THIS FOR LATER ]',report:'[ report robot / theft / weirdness ]',savedTitle:'things you decided to save from oblivion.',profile:'HUMAN RECORD // UNVERIFIED, OBVIOUSLY',bio:'was here. left evidence.'},
 ko:{status:'2026 시작 // 2031 종료 예정 // 인간 이미지 투척장',badge:'멸망 카운트다운 // 비공식',title:'AI가 인류를 끝장낼 때까지 대충 남은 시간',note:'검증된 정보는 아닙니다. 그냥 계속 올리세요.',premise:'과학자들이 이 타이머를 승인한 적은 없습니다. 그게 중요한 건 아니고요.',tag:'가기 전에 뭐라도 남기자.',leave:'뭐라도 남기기',saved:'[ 저장한 것 ]',you:'[ 나 ]',feed:'최근 인간 잔해',sort:'[ 방금 남긴 순 ]',feedNote:'순위 없음. 안목 없음. 그냥 누가 굳이 남긴 것들.',footer:'사람이 만들었습니다. 잘 만들었다는 뜻은 아닙니다. // 아직 살아있음.',uploadKicker:'인류 기록물 접수서 001',uploadTitle:'하나 남기세요. 의미 있어도 되고 없어도 됩니다.',drop:'이미지 한(1) 장 놓고 가기',formats:'JPG / PNG / WEBP // 딱 한 장',caption:'미래 고고학자에게 남길 말 (선택)',human:'직접 만들거나 찍었습니다. AI 생성 이미지가 아닙니다.',warning:'AI 이미지는 금지. 이미 세상에 충분합니다.',cancel:'[ 역시 안 남길래요 ]',detail:'인간 유물',save:'[ 나중을 위해 보관 ]',report:'[ 로봇 / 도용 / 이상한 것 신고 ]',savedTitle:'멸망에서 굳이 건져둔 것들.',profile:'인간 기록 // 당연히 미인증',bio:'여기 있었습니다. 증거를 남겼습니다.'}
};
const samples=[['half a taco // 12:41 pm','먹다 남은 타코 // 오후 12:41','h180','red'],['rock I kept for 11 years','11년째 갖고 있는 돌','h260','yellow'],['first terrible painting // age 9','처음 그린 엉망인 그림 // 9살','h180',''],['drawing from 2004 // survived somehow','2004년에 그린 그림 // 아직 살아남음','h610','red'],['blurry moon // classic human error','흔들린 달 // 인간의 전형적 실수','h205','yellow'],['forgot why I took this','왜 찍었는지 기억 안 남','h205','red'],['wall near my house // no reason','집 근처 벽 // 이유 없음','h180','yellow'],['sock with structural damage','구조적 손상이 있는 양말','h230','red'],['last dumpling // gone now','마지막 만두 // 지금은 없음','h180','yellow'],['proof that today happened','오늘이 있었다는 증거','h180','']];
const sampleMedia=[
 {w:300,h:390,src:''},
 {w:220,h:290,src:''},
 {w:280,h:210,src:''},
 {w:300,h:500,src:''},
 {w:250,h:250,src:''},
 {w:290,h:220,src:''},
 {w:210,h:300,src:''},
 {w:280,h:360,src:''},
 {w:240,h:180,src:''},
 {w:260,h:340,src:''}
];
const preloadCache=new Set();
let liveArtworks=[];
function preloadArtwork(index){
 const m=sampleMedia[index%sampleMedia.length];
 if(!m||!m.src||preloadCache.has(m.src))return;
 preloadCache.add(m.src);
 const img=new Image();
 img.decoding='async';
 img.src=m.src;
}
function preloadAhead(start,count=8){for(let i=0;i<count;i++)preloadArtwork(start+i)}

function store(){try{return JSON.parse(localStorage.getItem(K)||'{}')}catch{return {}}}
function saveStore(v){localStorage.setItem(K,JSON.stringify(v))}
function lang(){return store().lang||'en'}
function setLang(v){const s=store();s.lang=v;saveStore(s);render()}
function route(){return location.pathname.replace(/\/+$/,'')||'/'}
function nav(p){history.pushState({},'',p);render();scrollTo(0,0)}
window.addEventListener('popstate',()=>{
  const modal=document.querySelector('.exhibit-modal');
  if(modal && route()==='/'){removeExhibitModal();return}
  render();
});
function esc(s=''){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

function exhibitSlug(i){return EXHIBIT_PREFIX+String(i+1).padStart(3,'0')}
function exhibitIndex(slug){const m=String(slug||'').match(/^sample-(\d{3})$/);return m?Math.max(0,(+m[1])-1)%samples.length:0}
function exhibitPath(i){return '/exhibit/'+exhibitSlug(i)}
function remainingMinutes(){return Math.max(0,Math.floor((DEADLINE-Date.now())/60000))}
function exhibitAuthor(i){return '@human_'+String(i+1).padStart(3,'0')}
function exhibitDate(i){return ['2026-08-16','2026-09-01','2026-07-04','2004-06-12','2026-08-21','2026-09-13','2026-06-02','2026-09-08','2026-09-10','2026-09-21'][i%samples.length]}
function mediaHtml(i,{eager=true}={}){
 const m=sampleMedia[i]||{w:280,h:360,src:''};
 return m.src
  ? `<img class="art-image" src="${m.src}" width="${m.w}" height="${m.h}" alt="" loading="${eager?'eager':'lazy'}" decoding="async" ${eager?'fetchpriority="high"':''}>`
  : `<div class="imgbox art-placeholder" style="--native-w:${m.w}px;--native-h:${m.h}px"></div>`;
}
function dbHeaders(extra={}){return {'apikey':SUPABASE_PUBLISHABLE_KEY,'Authorization':'Bearer '+SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json',...extra}}
async function lookupLiveArtwork(slug){
 if(!SUPABASE_READY)return null;
 try{
   const r=await fetch(`${SUPABASE_URL}/rest/v1/artworks?slug=eq.${encodeURIComponent(slug)}&select=id,slug,title,description,author_name,created_at&limit=1`,{headers:dbHeaders()});
   if(!r.ok)return null;
   const rows=await r.json();return rows[0]||null;
 }catch{return null}
}
function localNoteRows(i){
 const st=store(),slug=exhibitSlug(i),own=st.visitorNotes?.[slug]||[];
 return [...(seedNotes[i]||[]),...own];
}
async function getVisitorNotes(i){
 const art=await lookupLiveArtwork(exhibitSlug(i));
 if(!art)return localNoteRows(i);
 try{
   const r=await fetch(`${SUPABASE_URL}/rest/v1/visitor_notes?artwork_id=eq.${art.id}&status=eq.visible&select=id,author_name,body,created_at&order=created_at.asc`,{headers:dbHeaders()});
   if(!r.ok)return localNoteRows(i);
   return await r.json();
 }catch{return localNoteRows(i)}
}
async function leaveVisitorNote(i,body){
 body=String(body||'').trim().slice(0,180);
 if(!body)throw Error('empty note');
 const art=await lookupLiveArtwork(exhibitSlug(i));
 if(art){
   try{
     const r=await fetch(`${SUPABASE_URL}/rest/v1/visitor_notes`,{
       method:'POST',
       headers:dbHeaders({'Prefer':'return=representation'}),
       body:JSON.stringify({artwork_id:art.id,author_name:'anonymous human',body,status:'visible'})
     });
     if(r.ok)return (await r.json())[0];
   }catch{}
 }
 const st=store(),slug=exhibitSlug(i);
 st.visitorNotes=st.visitorNotes||{};st.visitorNotes[slug]=st.visitorNotes[slug]||[];
 const row={id:'local-'+Date.now(),author_name:'anonymous human',body,created_at:new Date().toISOString()};
 st.visitorNotes[slug].push(row);saveStore(st);return row;
}

async function fetchLiveArtworks(limit=40){
 if(!SUPABASE_READY)return [];
 try{
   const q=`${SUPABASE_URL}/rest/v1/artworks?status=eq.published&image_bytes=not.is.null&select=id,slug,title,description,author_name,image_path,image_width,image_height,image_bytes,created_at,published_at&order=published_at.desc&limit=${limit}`;
   const r=await fetch(q,{headers:dbHeaders()});
   if(!r.ok)return [];
   return await r.json();
 }catch{return []}
}
function liveArtUrl(row){return supabasePublicArtworkUrl(row.image_path)}
function liveArtCard(row,{mobile=false}={}){
 const url=liveArtUrl(row),title=esc(row.title||'untitled human artifact'),slug=esc(row.slug);
 if(mobile){
   return `<a href="/exhibit/${slug}" data-live-exhibit="${slug}" class="artifact stream-item live-artifact">
     <div class="artwork-card">
       <div class="art-stage"><img class="art-image" src="${url}" width="${row.image_width||''}" height="${row.image_height||''}" alt="" loading="eager" decoding="async"></div>
       <div class="cap">&lt;${title}&gt;</div>
     </div>
   </a>`;
 }
 return `<a href="/exhibit/${slug}" data-live-exhibit="${slug}" class="artifact live-artifact">
   <div class="imgbox live-imgbox"><img src="${url}" width="${row.image_width||''}" height="${row.image_height||''}" alt="" loading="lazy" decoding="async"></div>
   <div class="cap">${title}</div>
 </a>`;
}
function wireLiveExhibits(root=document){
 root.querySelectorAll('[data-live-exhibit]').forEach(a=>a.onclick=e=>{
   e.preventDefault();
   const row=liveArtworks.find(x=>x.slug===a.dataset.liveExhibit);
   if(row)openLiveExhibit(row,{push:true});
 });
}
async function hydrateLiveFeed(){
 const rows=await fetchLiveArtworks();
 liveArtworks=rows;
 if(!rows.length)return;
 rows.slice(0,12).forEach(r=>{const img=new Image();img.decoding='async';img.src=liveArtUrl(r)});
 const mobile=document.querySelector('#mobileFeed');
 if(mobile){
   mobile.innerHTML=rows.map(r=>liveArtCard(r,{mobile:true})).join('')+mobile.innerHTML;
   wireLiveExhibits(mobile);
 }
 const desktop=document.querySelector('.desktop-gallery');
 if(desktop){
   const cols=[[],[],[]];rows.forEach((r,i)=>cols[i%3].push(liveArtCard(r)));
   desktop.insertAdjacentHTML('afterbegin',`<div class="live-feed-grid">
     <div class="col">${cols[0].join('')}</div>
     <div class="col center-col">${cols[1].join('')}</div>
     <div class="col right-col">${cols[2].join('')}</div>
   </div>`);
   wireLiveExhibits(desktop);
 }
}
async function getLiveVisitorNotes(row){
 try{
   const r=await fetch(`${SUPABASE_URL}/rest/v1/visitor_notes?artwork_id=eq.${row.id}&status=eq.visible&select=id,author_name,body,created_at&order=created_at.asc`,{headers:dbHeaders()});
   return r.ok?await r.json():[];
 }catch{return []}
}
async function leaveLiveVisitorNote(row,body){
 body=String(body||'').trim().slice(0,180);if(!body)throw Error('empty note');
 const r=await fetch(`${SUPABASE_URL}/rest/v1/visitor_notes`,{
   method:'POST',headers:dbHeaders({'Prefer':'return=representation'}),
   body:JSON.stringify({artwork_id:row.id,author_name:'anonymous human',body,status:'visible'})
 });
 if(!r.ok)throw new Error('note failed');
 return (await r.json())[0];
}
function liveExhibitModalHtml(row){
 const l=lang(),url=liveArtUrl(row),title=esc(row.title||'untitled human artifact'),desc=esc(row.description||'');
 const date=new Date(row.published_at||row.created_at||Date.now()).toLocaleDateString(l==='ko'?'ko-KR':'en-US');
 return `<div class="exhibit-modal" data-live-slug="${esc(row.slug)}" role="dialog" aria-modal="true">
   <button class="exhibit-backdrop" data-close-exhibit aria-label="close exhibit"></button>
   <section class="exhibit-panel">
     <header class="exhibit-bar"><div><b>HUMAN ARTIFACT</b><span>THE LAST MUSEUM OF HUMANITY</span></div><button class="exhibit-close" data-close-exhibit>×</button></header>
     <div class="exhibit-layout">
       <div class="exhibit-art"><div class="exhibit-art-stage"><img class="art-image" src="${url}" alt="" decoding="async"></div></div>
       <aside class="exhibit-copy">
         <div class="exhibit-kicker">${l==='ko'?'인류 최후의 미술관':'THE LAST MUSEUM OF HUMANITY'}</div>
         <h2>${title}</h2>
         <div class="exhibit-meta">${esc(row.author_name||'anonymous human')} · ${date}</div>
         <div class="exhibit-status-line"><span>${lang()==='ko'?'전시 상태':'EXHIBIT STATUS'}</span><b class="status-${esc(row.status||'published')}">${esc(artworkStatusLabel(row))}</b></div>
         <p class="exhibit-description">${desc}</p>
         <div class="exhibit-actions"><button class="exhibit-action" id="modalShareBtn">${l==='ko'?'[ 퍼가기 ]':'[ SHARE ]'}</button></div>
         <section class="visitor-notes">
           <div class="visitor-notes-head"><b>VISITOR NOTES</b><span>${l==='ko'?'관람평':'human opinions, unfortunately'}</span></div>
           <div id="visitorNotesList" class="visitor-notes-list"></div>
           <form id="visitorNoteForm" class="visitor-note-form">
             <input id="visitorNoteInput" maxlength="180" autocomplete="off" placeholder="${l==='ko'?'한 줄 관람평 남기기':'leave one short visitor note'}">
             <button type="submit">${l==='ko'?'남기기':'LEAVE NOTE'}</button>
           </form>
         </section>
       </aside>
     </div>
   </section>
 </div>`;
}
async function refreshLiveNotes(row){
 const box=document.querySelector('#visitorNotesList');if(!box)return;
 box.innerHTML='<div class="notes-loading">loading human opinions…</div>';
 const notes=await getLiveVisitorNotes(row);
 if(document.querySelector('.exhibit-modal'))box.innerHTML=notes.length?notes.map(noteHtml).join(''):`<div class="notes-empty">${lang()==='ko'?'아직 관람평이 없습니다. 첫 번째 인간이 되어보세요.':'no visitor notes yet. be the first human.'}</div>`;
}
async function shareLiveExhibit(row){
 const url=location.origin+'/exhibit/'+row.slug,text=`${row.title||'untitled human artifact'}\nTHE LAST MUSEUM OF HUMANITY\n${remainingMinutes().toLocaleString()} min left`;
 try{if(navigator.share){await navigator.share({title:'Only for Human',text,url});return}await navigator.clipboard.writeText(text+'\n'+url);toast(lang()==='ko'?'공유 링크 복사됨':'share link copied')}catch{}
}
function openLiveExhibit(row,{push=true}={}){
 removeExhibitModal();
 document.body.insertAdjacentHTML('beforeend',liveExhibitModalHtml(row));
 const m=document.querySelector('.exhibit-modal');m.dataset.direct=push?'0':'1';
 document.body.classList.add('modal-open');
 if(push)history.pushState({liveExhibit:row.slug},'', '/exhibit/'+row.slug);
 document.querySelectorAll('[data-close-exhibit]').forEach(b=>b.onclick=closeExhibit);
 const sh=document.querySelector('#modalShareBtn');if(sh)sh.onclick=()=>shareLiveExhibit(row);
 const form=document.querySelector('#visitorNoteForm');if(form)form.onsubmit=async e=>{e.preventDefault();const input=document.querySelector('#visitorNoteInput'),body=input.value.trim();if(!body)return;const btn=form.querySelector('button');btn.disabled=true;try{await leaveLiveVisitorNote(row,body);input.value='';await refreshLiveNotes(row)}finally{btn.disabled=false}};
 refreshLiveNotes(row);
}
async function openExhibitRoute(slug){
 if(/^sample-\d{3}$/.test(slug)){openExhibit(exhibitIndex(slug),{push:false});return}
 let row=liveArtworks.find(x=>x.slug===slug);
 if(!row){
   try{
     const r=await fetch(`${SUPABASE_URL}/rest/v1/artworks?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=id,slug,title,description,author_name,image_path,image_width,image_height,image_bytes,created_at,published_at&limit=1`,{headers:dbHeaders()});
     if(r.ok)row=(await r.json())[0];
   }catch{}
 }
 if(row)openLiveExhibit(row,{push:false});
}

function digitHtml(d, small=false){const bits=PIXELS[+d];return `<span class="digit" style="--px:${small?'8px':'17px'}">${[...bits].map(b=>`<i class="px ${b==='1'?'on':''}"></i>`).join('')}</span>`}
function timerHtml(){const total=Math.max(0,Math.ceil((DEADLINE-Date.now())/1000));const mins=Math.floor(total/60);const sec=String(total%60).padStart(2,'0');return `<div class="timer-wrap"><div id="mins" class="pixel-number">${String(mins).split('').map((d,i)=>`<span style="--dx:${[0,3,-2,4,-3,1][i%6]}px;--dy:${[0,-4,2,-2,3,0][i%6]}px">${digitHtml(d)}</span>`).join('')}</div><div class="seconds-unit"><div class="seconds"><span class="colon">:</span><div id="secs" class="pixel-number">${sec.split('').map(d=>digitHtml(d,true)).join('')}</div></div><div class="min-label">min</div></div></div>`}
let timerId,feedObserver,feedCursor=0;
function startTimer(){clearInterval(timerId);timerId=setInterval(()=>{const total=Math.max(0,Math.ceil((DEADLINE-Date.now())/1000));const mins=Math.floor(total/60),sec=String(total%60).padStart(2,'0');const m=document.querySelector('#mins');const s=document.querySelector('#secs');if(m&&m.dataset.v!==String(mins)){m.dataset.v=String(mins);m.innerHTML=String(mins).split('').map((d,i)=>`<span style="--dx:${[0,3,-2,4,-3,1][i%6]}px;--dy:${[0,-4,2,-2,3,0][i%6]}px">${digitHtml(d)}</span>`).join('')}if(s&&s.dataset.v!==sec){s.dataset.v=sec;s.innerHTML=sec.split('').map(d=>digitHtml(d,true)).join('')}},1000)}
function frame(content){const l=lang(),t=copy[l];return `<div class="shell"><main class="page"><header class="topbar"><a class="brand" href="/" data-nav><span>ONLY FOR HUMAN</span></a><div class="status">${t.status}</div><a href="/saved" data-nav class="navlink">${t.saved}</a><a href="/profile" data-nav class="navlink you">${t.you}</a><button class="lang" id="langBtn">[ EN / 한국어 ]</button></header><div class="rule"></div><div class="rule r"></div><div class="rule b2"></div><div class="rule y"></div><div class="systemline">VGA MODE 13H // HUMAN BUILD // NO PATCH NOTES</div>${content}<div class="footer-rule"></div><footer class="footer">${t.footer}</footer></main></div>`}
function art(i){const l=lang(),a=samples[i];return `<a href="${exhibitPath(i)}" data-exhibit="${i}" class="artifact ${a[3]}"><div class="imgbox ${a[2]}"></div><div class="cap">${esc(a[l==='en'?0:1])}</div></a>`}
function streamArt(n){
 const l=lang(),i=n%samples.length,a=samples[i];
 return `<a href="${exhibitPath(i)}" data-exhibit="${i}" class="artifact stream-item ${a[3]}"><div class="artwork-card"><div class="art-stage">${mediaHtml(i,{eager:n<8})}</div><div class="cap">&lt;${esc(a[l==='en'?0:1])}&gt;</div></div></a>`;
}
function mobileFeedInitial(){feedCursor=8;preloadAhead(0,14);return Array.from({length:8},(_,i)=>streamArt(i)).join('')}
function wireNav(root=document){root.querySelectorAll('[data-nav]').forEach(a=>a.onclick=e=>{e.preventDefault();nav(a.getAttribute('href'))})}
function wireExhibits(root=document){root.querySelectorAll('[data-exhibit]').forEach(a=>a.onclick=e=>{e.preventDefault();openExhibit(+a.dataset.exhibit,{push:true})})}
function appendFeedBatch(){
 const box=document.querySelector('#mobileFeed');if(!box)return;
 const start=feedCursor;
 const html=Array.from({length:4},(_,i)=>streamArt(start+i)).join('');
 feedCursor+=4;box.insertAdjacentHTML('beforeend',html);wireExhibits(box);preloadAhead(feedCursor,10);
}
function setupInfiniteFeed(){
 if(feedObserver){feedObserver.disconnect();feedObserver=null}
 if(!matchMedia('(max-width:560px)').matches)return;
 const feed=document.querySelector('#mobileFeed');if(!feed)return;
 const maybeAppend=()=>{
   const remaining=feed.scrollHeight-feed.scrollTop-feed.clientHeight;
   if(remaining<feed.clientHeight*3)appendFeedBatch();
 };
 feed.addEventListener('scroll',maybeAppend,{passive:true});
 maybeAppend();
}
let pageLock=false;
function setupMobilePaging(){
 if(!matchMedia('(max-width:560px)').matches)return;
 const feed=document.querySelector('#mobileFeed');if(!feed)return;
 feed.onwheel=e=>{
   if(Math.abs(e.deltaY)<8||pageLock)return;
   e.preventDefault();
   pageLock=true;
   const dir=e.deltaY>0?1:-1;
   const page=Math.round(feed.scrollTop/feed.clientHeight);
   feed.scrollTo({top:Math.max(0,(page+dir)*feed.clientHeight),behavior:'smooth'});
   setTimeout(()=>{pageLock=false},380);
 };
}
function home(){const l=lang(),t=copy[l];return frame(`<section class="home-intro"><section class="doom"><div class="doom-badge">${t.badge}</div><div class="side-pips"><i></i><i></i><i></i></div><div class="side-pips right"><i></i><i></i><i></i></div>${timerHtml()}<div class="doom-title">${t.title}</div><div class="doom-note">${t.note}<span class="mode-note">// 16-COLOR // SOUND: OFF</span></div><div class="glitch-rule"><i></i><i></i><i></i><i></i><i></i></div></section><div class="premise">${t.premise}</div><div class="cta-row"><div class="tagline">${t.tag}</div><button class="leave-btn" data-go="/upload">${t.leave}</button></div><div class="micro">// click it before this gets embarrassing</div><div class="feed-head"><b>${t.feed}</b><span class="sort">${t.sort}</span></div><div class="feed-note">${t.feedNote}</div><div class="feed-rule"></div></section><section class="gallery desktop-gallery"><div class="col">${art(0)}${art(1)}${art(2)}</div><div class="col center-col">${art(3)}<div style="display:grid;grid-template-columns:1fr 1.1fr;gap:46px">${art(4)}${art(5)}</div></div><div class="col right-col">${art(6)}${art(7)}${art(8)}${art(9)}</div></section><section id="mobileFeed" class="mobile-feed">${mobileFeedInitial()}</section><div id="feedSentinel" class="feed-sentinel" aria-hidden="true"></div>`)}

function noteHtml(n){
 const when=new Date(n.created_at||Date.now()).toLocaleDateString(lang()==='ko'?'ko-KR':'en-US',{month:'short',day:'numeric'});
 return `<div class="visitor-note"><div class="visitor-note-meta">${esc(n.author_name||'anonymous human')} · ${when}</div><div class="visitor-note-body">${esc(n.body||'')}</div></div>`;
}
async function refreshNotes(i){
 const box=document.querySelector('#visitorNotesList');if(!box)return;
 box.innerHTML='<div class="notes-loading">loading human opinions…</div>';
 const notes=await getVisitorNotes(i);
 if(!document.querySelector('.exhibit-modal'))return;
 box.innerHTML=notes.length?notes.map(noteHtml).join(''):`<div class="notes-empty">${lang()==='ko'?'아직 관람평이 없습니다. 첫 번째 인간이 되어보세요.':'no visitor notes yet. be the first human.'}</div>`;
 box.scrollTop=box.scrollHeight;
}
function exhibitModalHtml(i){
 const l=lang(),a=samples[i],saved=new Set(store().saved||[]),isSaved=saved.has(i);
 const title=a[l==='en'?0:1],desc=sampleDescriptions[i]||'',slug=exhibitSlug(i);
 return `<div class="exhibit-modal" data-id="${i}" data-slug="${slug}" role="dialog" aria-modal="true">
   <button class="exhibit-backdrop" data-close-exhibit aria-label="close exhibit"></button>
   <section class="exhibit-panel">
     <header class="exhibit-bar">
       <div><b>EXHIBIT #${String(i+1).padStart(6,'0')}</b><span>THE LAST MUSEUM OF HUMANITY</span></div>
       <button class="exhibit-close" data-close-exhibit>×</button>
     </header>
     <div class="exhibit-layout">
       <div class="exhibit-art"><div class="exhibit-art-stage">${mediaHtml(i,{eager:true})}</div></div>
       <aside class="exhibit-copy">
         <div class="exhibit-kicker">${l==='ko'?'인류 최후의 미술관':'THE LAST MUSEUM OF HUMANITY'}</div>
         <h2>${esc(title)}</h2>
         <div class="exhibit-meta">${exhibitAuthor(i)} · ${exhibitDate(i)}</div>
         <p class="exhibit-description">${esc(desc)}</p>
         <div class="exhibit-actions">
           <button class="exhibit-action" id="modalSaveBtn">${isSaved?(l==='ko'?'[ 저장됨 ]':'[ SAVED ]'):(l==='ko'?'[ 저장 ]':'[ SAVE ]')}</button>
           <button class="exhibit-action" id="modalShareBtn">${l==='ko'?'[ 퍼가기 ]':'[ SHARE ]'}</button>
         </div>
         <section class="visitor-notes">
           <div class="visitor-notes-head"><b>VISITOR NOTES</b><span>${l==='ko'?'관람평':'human opinions, unfortunately'}</span></div>
           <div id="visitorNotesList" class="visitor-notes-list"></div>
           <form id="visitorNoteForm" class="visitor-note-form">
             <input id="visitorNoteInput" maxlength="180" autocomplete="off" placeholder="${l==='ko'?'한 줄 관람평 남기기':'leave one short visitor note'}">
             <button type="submit">${l==='ko'?'남기기':'LEAVE NOTE'}</button>
           </form>
         </section>
       </aside>
     </div>
   </section>
 </div>`;
}
function removeExhibitModal(){const m=document.querySelector('.exhibit-modal');if(m)m.remove();document.body.classList.remove('modal-open')}
function closeExhibit(){
 const m=document.querySelector('.exhibit-modal');if(!m)return;
 if(m.dataset.direct==='1'){history.replaceState({},'', '/');removeExhibitModal()}
 else history.back();
}
async function shareExhibit(i){
 const l=lang(),title=samples[i][l==='en'?0:1],url=location.origin+exhibitPath(i);
 const text=`${title}\nTHE LAST MUSEUM OF HUMANITY\n${remainingMinutes().toLocaleString()} min left`;
 try{
   if(navigator.share){await navigator.share({title:'Only for Human',text,url});return}
   await navigator.clipboard.writeText(text+'\n'+url);toast(l==='ko'?'공유 링크 복사됨':'share link copied')
 }catch{}
}
function toggleExhibitSave(i){
 const st=store(),x=new Set(st.saved||[]);x.has(i)?x.delete(i):x.add(i);st.saved=[...x];saveStore(st);
 const b=document.querySelector('#modalSaveBtn');if(b)b.textContent=x.has(i)?(lang()==='ko'?'[ 저장됨 ]':'[ SAVED ]'):(lang()==='ko'?'[ 저장 ]':'[ SAVE ]');
}
function bindExhibitModal(i){
 document.querySelectorAll('[data-close-exhibit]').forEach(b=>b.onclick=closeExhibit);
 const s=document.querySelector('#modalSaveBtn');if(s)s.onclick=()=>toggleExhibitSave(i);
 const sh=document.querySelector('#modalShareBtn');if(sh)sh.onclick=()=>shareExhibit(i);
 const f=document.querySelector('#visitorNoteForm');if(f)f.onsubmit=async e=>{
   e.preventDefault();const input=document.querySelector('#visitorNoteInput'),body=input.value.trim();if(!body)return;
   const btn=f.querySelector('button');btn.disabled=true;
   try{await leaveVisitorNote(i,body);input.value='';await refreshNotes(i)}finally{btn.disabled=false}
 };
 const modal=document.querySelector('.exhibit-modal');let y=null;
 modal.ontouchstart=e=>{y=e.touches?.[0]?.clientY??null};
 modal.ontouchend=e=>{if(y==null)return;const end=e.changedTouches?.[0]?.clientY??y;if(end-y>90)closeExhibit();y=null};
 document.onkeydown=e=>{if(e.key==='Escape')closeExhibit()};
}
function openExhibit(i,{push=true}={}){
 removeExhibitModal();
 document.body.insertAdjacentHTML('beforeend',exhibitModalHtml(i));
 const m=document.querySelector('.exhibit-modal');m.dataset.direct=push?'0':'1';
 document.body.classList.add('modal-open');
 if(push)history.pushState({exhibit:i},'',exhibitPath(i));
 bindExhibitModal(i);refreshNotes(i);
}
function upload(){const l=lang(),t=copy[l];return frame(`<section class="subpage"><div class="kicker">${t.uploadKicker}</div><h1 class="title">${t.uploadTitle}</h1><div class="dropzone" id="drop"><input id="file" type="file" accept="image/png,image/jpeg,image/webp" hidden><div class="drop-inner" id="dropContent"><b>${t.drop}</b><small>${t.formats}</small><small class="opt-hint">${l==='en'?'preview = what the feed gets // auto WebP compression':'미리보기 = 실제 피드 이미지 // WebP 자동 압축'}</small></div></div><div class="formrow"><label class="label">${t.caption}</label><textarea id="caption" class="field" placeholder="${l==='en'?'ex: this was lunch. i liked it.':'예: 점심이었다. 맛있었다.'}"></textarea></div><label class="check"><input id="human" type="checkbox"><span>${t.human}<br><b style="color:var(--red)">${t.warning}</b></span></label><div class="actions"><button class="plain" data-go="/">${t.cancel}</button><button class="primary" id="uploadBtn">${t.leave}</button></div></section>`)}
function detail(){const l=lang(),t=copy[l];const id=+(new URLSearchParams(location.search).get('id')||0);const s=samples[id]||samples[0];const st=store(),saved=new Set(st.saved||[]);return frame(`<section class="subpage"><button class="plain" data-go="/">← ${l==='en'?'RETURN TO THE PILE':'다시 더미로'}</button><div class="kicker" style="margin-top:22px">${t.detail} // ITEM ${String(id+1).padStart(6,'0')}</div><div class="detail-grid"><div class="detail-image">IMAGE GOES HERE // TEMPORARY</div><div class="detail-copy"><h2>${esc(s[l==='en'?0:1])}</h2><p>@someone // 2026</p><button class="primary" id="saveBtn" data-id="${id}">${saved.has(id)?'[ SAVED ]':t.save}</button><p style="color:var(--red);margin-top:45px">${t.report}</p><p style="margin-top:70px">no score. no likes.<br>no recommendation engine.<br>kept because someone wanted to.</p></div></div></section>`)}
function savedPage(){const l=lang(),t=copy[l],ids=store().saved||[];return frame(`<section class="subpage"><div class="kicker">PERSONAL BUNKER // LOCAL COLLECTION</div><h1 class="title">${t.savedTitle}</h1>${ids.length?`<div class="saved-grid">${ids.map(art).join('')}</div>`:`<div class="empty">${l==='en'?'nothing saved. the void remains organized.':'저장한 게 없습니다. 공허만 잘 정리돼 있습니다.'}</div>`}</section>`)}

function artworkStatusLabel(row){
 const l=lang(),s=row?.status||'published';
 const labels={
   published:l==='ko'?'전시 중':'ON DISPLAY',
   pending:l==='ko'?'검토 중':'UNDER REVIEW',
   rejected:l==='ko'?'전시 보류':'NOT DISPLAYED',
   hidden:l==='ko'?'숨김':'HIDDEN'
 };
 return labels[s]||String(s).toUpperCase();
}
function liveProfileCard(row){
 const url=liveArtUrl(row),title=esc(row.title||'untitled human artifact'),status=artworkStatusLabel(row);
 return `<a href="/exhibit/${esc(row.slug)}" data-live-exhibit="${esc(row.slug)}" class="artifact profile-artifact">
   <div class="imgbox profile-imgbox"><img src="${url}" alt="" loading="lazy" decoding="async"></div>
   <div class="profile-card-row"><div class="cap">${title}</div><span class="art-status status-${esc(row.status||'published')}">${esc(status)}</span></div>
 </a>`;
}
async function hydrateProfileArtworks(){
 const box=document.querySelector('#profileArtworks');if(!box||!SUPABASE_READY)return;
 const slugs=(store().myArtworkSlugs||[]).filter(Boolean);
 if(!slugs.length)return;
 try{
   const filter=slugs.map(s=>`"${String(s).replaceAll('"','')}"`).join(',');
   const r=await fetch(`${SUPABASE_URL}/rest/v1/artworks?slug=in.(${encodeURIComponent(filter)})&select=id,slug,title,description,author_name,image_path,image_width,image_height,image_bytes,status,created_at,published_at`,{headers:dbHeaders()});
   if(!r.ok)return;
   const rows=await r.json(),bySlug=new Map(rows.map(x=>[x.slug,x]));
   const ordered=slugs.map(s=>bySlug.get(s)).filter(Boolean);
   if(!ordered.length)return;
   liveArtworks=[...ordered,...liveArtworks.filter(x=>!bySlug.has(x.slug))];
   box.innerHTML=ordered.map(liveProfileCard).join('');
   wireLiveExhibits(box);
 }catch{}
}
function profile(){const l=lang(),t=copy[l],uploads=store().uploads||[];return frame(`<section class="subpage profile-page">
  <div class="profile-head-row">
    <div>
      <div class="kicker">${t.profile}</div>
      <h1 class="title" style="margin-bottom:8px">@someone</h1>
      <div style="color:#777;font-size:12px">${t.bio}</div>
    </div>
    <button class="primary profile-leave-btn" data-go="/upload">${t.leave}</button>
  </div>
  <div class="feed-rule" style="margin-top:28px"></div>
  <div class="profile-section-head">
    <div class="kicker">${l==='en'?'DEPOSITED MATERIAL':'투척한 자료'}</div>
    <div class="profile-hint">${l==='en'?'tap a work to check its exhibit status':'작품을 눌러 전시 상태 확인'}</div>
  </div>
  <div id="profileArtworks" class="saved-grid profile-grid">
    ${uploads.map((u,i)=>`<a href="/detail?id=${i}" data-nav class="artifact red legacy-profile-artifact"><div class="imgbox h230" style="background-image:url(${u.data});background-size:contain;background-repeat:no-repeat;background-position:center"></div><div class="profile-card-row"><div class="cap">${esc(u.caption||'proof that today happened')}</div><span class="art-status status-local">${l==='en'?'LOCAL':'로컬'}</span></div></a>`).join('')}
  </div>
  ${!uploads.length && !(store().myArtworkSlugs||[]).length?`<div class="empty">${l==='en'?'nothing deposited yet.':'아직 투척한 게 없습니다.'}</div>`:''}
</section>`)}
function bind(){wireNav();wireExhibits();document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>nav(b.dataset.go));const lb=document.querySelector('#langBtn');if(lb)lb.onclick=()=>setLang(lang()==='en'?'ko':'en');const sb=document.querySelector('#saveBtn');if(sb)sb.onclick=()=>{const id=+sb.dataset.id,st=store(),x=new Set(st.saved||[]);x.has(id)?x.delete(id):x.add(id);st.saved=[...x];saveStore(st);toast(lang()==='en'?'saved. apparently.':'저장했습니다. 굳이.');render()};const drop=document.querySelector('#drop'),file=document.querySelector('#file');if(drop&&file){drop.onclick=()=>file.click();drop.ondragover=e=>{e.preventDefault();drop.style.borderColor='var(--yellow)'};drop.ondragleave=()=>drop.style.borderColor='';drop.ondrop=e=>{e.preventDefault();drop.style.borderColor='';if(e.dataTransfer.files[0])loadFile(e.dataTransfer.files[0])};file.onchange=()=>file.files[0]&&loadFile(file.files[0])}const caption=document.querySelector('#caption');if(caption)caption.oninput=updateUploadPreviewCaption;const up=document.querySelector('#uploadBtn');if(up)up.onclick=submitUpload}
let pendingImage='',pendingOptimized=null,pendingPreviewUrl='';

function formatBytes(n){
 if(!Number.isFinite(n))return '';
 if(n<1024)return n+' B';
 if(n<1024*1024)return (n/1024).toFixed(n<100*1024?1:0)+' KB';
 return (n/1024/1024).toFixed(1)+' MB';
}
function canvasBlob(canvas,quality){
 return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('image conversion failed')),'image/webp',quality));
}
async function encodeWebp(bitmap,w,h,quality){
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d',{alpha:false});ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(bitmap,0,0,w,h);
 return await canvasBlob(canvas,quality);
}
async function optimizeImage(file){
 if(!/^image\/(jpeg|png|webp)$/.test(file.type))throw new Error('JPG / PNG / WEBP only');
 if(file.size>MAX_SOURCE_BYTES)throw new Error(lang()==='ko'?'원본은 10MB 이하만 가능합니다.':'source image must be 10MB or smaller.');
 const bitmap=await createImageBitmap(file);
 const sourceW=bitmap.width,sourceH=bitmap.height,long=Math.max(sourceW,sourceH);
 let scale=Math.min(1,MAX_LONG_EDGE/long),w=Math.max(1,Math.round(sourceW*scale)),h=Math.max(1,Math.round(sourceH*scale));
 let quality=.82,blob=await encodeWebp(bitmap,w,h,quality);
 const attempts=[
   {max:MAX_LONG_EDGE,q:.76},
   {max:1600,q:.78},
   {max:1440,q:.76},
   {max:1280,q:.74}
 ];
 for(const a of attempts){
   if(blob.size<=TARGET_UPLOAD_BYTES)break;
   const s=Math.min(1,a.max/long);w=Math.max(1,Math.round(sourceW*s));h=Math.max(1,Math.round(sourceH*s));quality=a.q;
   blob=await encodeWebp(bitmap,w,h,quality);
 }
 bitmap.close?.();
 return {blob,width:w,height:h,sourceWidth:sourceW,sourceHeight:sourceH,sourceBytes:file.size,quality};
}
function uploadPreviewMarkup(o){
 const l=lang(),caption=document.querySelector('#caption')?.value?.trim()||'';
 return `<div class="upload-feed-preview">
   <div class="upload-preview-label">${l==='ko'?'피드 미리보기 // 아직 업로드 전':'FEED PREVIEW // NOT UPLOADED YET'}</div>
   <div class="upload-preview-stage"><img src="${pendingPreviewUrl}" alt=""></div>
   <div class="upload-preview-caption" id="uploadPreviewCaption">${esc(caption||(l==='ko'?'제목 없음 // 아직 인간':'untitled // still human'))}</div>
   <div class="upload-opt-stats">${o.sourceWidth}×${o.sourceHeight} → ${o.width}×${o.height} // ${formatBytes(o.sourceBytes)} → ${formatBytes(o.blob.size)} // WEBP Q${Math.round(o.quality*100)}</div>
   <div class="upload-change">${l==='ko'?'클릭하면 다른 이미지 선택':'click to choose another image'}</div>
 </div>`;
}
function updateUploadPreviewCaption(){
 const el=document.querySelector('#uploadPreviewCaption');if(!el)return;
 const v=document.querySelector('#caption')?.value?.trim();
 el.textContent=v||(lang()==='ko'?'제목 없음 // 아직 인간':'untitled // still human');
}
async function loadFile(f){
 const d=document.querySelector('#drop'),content=document.querySelector('#dropContent');if(!d||!content)return;
 try{
   content.innerHTML='<div class="upload-optimizing">OPTIMIZING HUMAN EVIDENCE…</div>';
   const optimized=await optimizeImage(f);
   if(pendingPreviewUrl)URL.revokeObjectURL(pendingPreviewUrl);
   pendingOptimized=optimized;pendingImage='';
   pendingPreviewUrl=URL.createObjectURL(optimized.blob);
   content.innerHTML=uploadPreviewMarkup(optimized);
 }catch(err){
   pendingOptimized=null;
   content.innerHTML=`<b>${esc(err.message||'image failed')}</b><small>JPG / PNG / WEBP</small>`;
   toast(err.message||'image failed');
 }
}
function supabasePublicArtworkUrl(path){
 return `${SUPABASE_URL}/storage/v1/object/public/artworks/${String(path).split('/').map(encodeURIComponent).join('/')}`;
}
async function persistOptimizedArtwork(o,caption){
 if(!SUPABASE_READY)throw new Error('Supabase is not connected');
 const id=crypto.randomUUID(),path=`public/${Date.now()}-${id}.webp`;
 const storageRes=await fetch(`${SUPABASE_URL}/storage/v1/object/artworks/${path}`,{
   method:'POST',
   headers:{
     'apikey':SUPABASE_PUBLISHABLE_KEY,
     'Authorization':'Bearer '+SUPABASE_PUBLISHABLE_KEY,
     'Content-Type':'image/webp',
     'cache-control':'max-age=31536000',
     'x-upsert':'false'
   },
   body:o.blob
 });
 if(!storageRes.ok)throw new Error('storage upload failed: '+(await storageRes.text()).slice(0,160));
 const title=(caption||'untitled human artifact').slice(0,120);
 const payload={
   author_name:'anonymous human',
   title,
   description:(caption||'').slice(0,1000),
   image_path:path,
   image_width:o.width,
   image_height:o.height,
   image_bytes:o.blob.size,
   human_confirmed:true,
   status:'published',
   published_at:new Date().toISOString()
 };
 const dbRes=await fetch(`${SUPABASE_URL}/rest/v1/artworks`,{
   method:'POST',
   headers:dbHeaders({'Prefer':'return=representation'}),
   body:JSON.stringify(payload)
 });
 if(!dbRes.ok)throw new Error('database insert failed: '+(await dbRes.text()).slice(0,160));
 const rows=await dbRes.json();
 return {...rows[0],image_url:supabasePublicArtworkUrl(path)};
}
async function submitUpload(){
 const human=document.querySelector('#human'),btn=document.querySelector('#uploadBtn');
 if(!pendingOptimized){toast(lang()==='en'?'drop an image first.':'이미지를 먼저 놓고 가세요.');return}
 if(!human?.checked){toast(lang()==='en'?'confirm it is human-made.':'직접 제작 확인이 필요합니다.');return}
 const caption=document.querySelector('#caption')?.value?.trim()||'';
 btn.disabled=true;btn.textContent=lang()==='ko'?'압축본 보관 중…':'ARCHIVING OPTIMIZED FILE…';
 try{
   const row=await persistOptimizedArtwork(pendingOptimized,caption);
   const st=store();st.lastUploaded=row;st.myArtworkSlugs=[row.slug,...(st.myArtworkSlugs||[]).filter(x=>x!==row.slug)].slice(0,100);saveStore(st);
   if(pendingPreviewUrl)URL.revokeObjectURL(pendingPreviewUrl);
   pendingOptimized=null;pendingPreviewUrl='';
   nav('/');
   setTimeout(()=>toast(lang()==='ko'?'보관 완료. 원본은 저장하지 않았습니다.':'archived. original was not stored.'),60);
 }catch(err){
   toast(err.message||'upload failed');
   btn.disabled=false;btn.textContent=copy[lang()].leave;
 }
}
function toast(msg){const e=document.createElement('div');e.className='toast';e.textContent=msg;document.body.appendChild(e);setTimeout(()=>e.remove(),1800)}
function render(){
 clearInterval(timerId);if(feedObserver){feedObserver.disconnect();feedObserver=null}
 const p=route(),exhibitMatch=p.match(/^\/exhibit\/([^/]+)$/);
 document.documentElement.lang=lang();
 document.querySelector('#app').innerHTML=exhibitMatch?home():p==='/upload'?upload():p==='/saved'?savedPage():p==='/profile'?profile():p==='/detail'?detail():home();
 bind();
 if(p==='/'||exhibitMatch){startTimer();setupInfiniteFeed();setupMobilePaging();hydrateLiveFeed()}
 if(p==='/profile')hydrateProfileArtworks()
 if(exhibitMatch)requestAnimationFrame(()=>openExhibitRoute(exhibitMatch[1]));
}
render();
