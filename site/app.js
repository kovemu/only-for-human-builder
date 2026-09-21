const DEADLINE = new Date('2031-09-17T17:51:00Z').getTime();
const K = 'ofh-v1';
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
window.addEventListener('popstate',render);
function esc(s=''){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function digitHtml(d, small=false){const bits=PIXELS[+d];return `<span class="digit" style="--px:${small?'8px':'17px'}">${[...bits].map(b=>`<i class="px ${b==='1'?'on':''}"></i>`).join('')}</span>`}
function timerHtml(){const total=Math.max(0,Math.ceil((DEADLINE-Date.now())/1000));const mins=Math.floor(total/60);const sec=String(total%60).padStart(2,'0');return `<div class="timer-wrap"><div id="mins" class="pixel-number">${String(mins).split('').map((d,i)=>`<span style="--dx:${[0,3,-2,4,-3,1][i%6]}px;--dy:${[0,-4,2,-2,3,0][i%6]}px">${digitHtml(d)}</span>`).join('')}</div><div class="seconds-unit"><div class="seconds"><span class="colon">:</span><div id="secs" class="pixel-number">${sec.split('').map(d=>digitHtml(d,true)).join('')}</div></div><div class="min-label">min</div></div></div>`}
let timerId,feedObserver,feedCursor=0;
function startTimer(){clearInterval(timerId);timerId=setInterval(()=>{const total=Math.max(0,Math.ceil((DEADLINE-Date.now())/1000));const mins=Math.floor(total/60),sec=String(total%60).padStart(2,'0');const m=document.querySelector('#mins');const s=document.querySelector('#secs');if(m&&m.dataset.v!==String(mins)){m.dataset.v=String(mins);m.innerHTML=String(mins).split('').map((d,i)=>`<span style="--dx:${[0,3,-2,4,-3,1][i%6]}px;--dy:${[0,-4,2,-2,3,0][i%6]}px">${digitHtml(d)}</span>`).join('')}if(s&&s.dataset.v!==sec){s.dataset.v=sec;s.innerHTML=sec.split('').map(d=>digitHtml(d,true)).join('')}},1000)}
function frame(content){const l=lang(),t=copy[l];return `<div class="shell"><main class="page"><header class="topbar"><a class="brand" href="/" data-nav><span>ONLY FOR HUMAN</span></a><div class="status">${t.status}</div><a href="/saved" data-nav class="navlink">${t.saved}</a><a href="/profile" data-nav class="navlink you">${t.you}</a><button class="lang" id="langBtn">[ EN / 한국어 ]</button></header><div class="rule"></div><div class="rule r"></div><div class="rule b2"></div><div class="rule y"></div><div class="systemline">VGA MODE 13H // HUMAN BUILD // NO PATCH NOTES</div>${content}<div class="footer-rule"></div><footer class="footer">${t.footer}</footer></main></div>`}
function art(i){const l=lang(),a=samples[i];return `<a href="/detail?id=${i}" data-nav class="artifact ${a[3]}"><div class="imgbox ${a[2]}"></div><div class="cap">${esc(a[l==='en'?0:1])}</div></a>`}
function streamArt(n){
 const l=lang(),i=n%samples.length,a=samples[i],m=sampleMedia[i]||{w:280,h:360,src:''};
 const media=m.src
  ? `<img class="art-image" src="${m.src}" width="${m.w}" height="${m.h}" alt="" loading="${n<6?'eager':'lazy'}" decoding="async" ${n<2?'fetchpriority="high"':''}>`
  : `<div class="imgbox art-placeholder" style="--native-w:${m.w}px;--native-h:${m.h}px"></div>`;
 return `<a href="/detail?id=${i}" data-nav class="artifact stream-item ${a[3]}"><div class="art-stage">${media}</div><div class="cap">&lt;${esc(a[l==='en'?0:1])}&gt;</div></a>`;
}
function mobileFeedInitial(){feedCursor=6;preloadAhead(0,12);return Array.from({length:6},(_,i)=>streamArt(i)).join('')}
function wireNav(root=document){root.querySelectorAll('[data-nav]').forEach(a=>a.onclick=e=>{e.preventDefault();nav(a.getAttribute('href'))})}
function appendFeedBatch(){
 const box=document.querySelector('#mobileFeed');if(!box)return;
 const start=feedCursor;
 const html=Array.from({length:4},(_,i)=>streamArt(start+i)).join('');
 feedCursor+=4;box.insertAdjacentHTML('beforeend',html);wireNav(box);preloadAhead(feedCursor,10);
}
function setupInfiniteFeed(){
 if(feedObserver){feedObserver.disconnect();feedObserver=null}
 if(!matchMedia('(max-width:560px)').matches)return;
 const sentinel=document.querySelector('#feedSentinel');if(!sentinel)return;
 feedObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))appendFeedBatch()},{rootMargin:'1800px 0px'});
 feedObserver.observe(sentinel);
}
function home(){const l=lang(),t=copy[l];return frame(`<section class="doom"><div class="doom-badge">${t.badge}</div><div class="side-pips"><i></i><i></i><i></i></div><div class="side-pips right"><i></i><i></i><i></i></div>${timerHtml()}<div class="doom-title">${t.title}</div><div class="doom-note">${t.note}<span class="mode-note">// 16-COLOR // SOUND: OFF</span></div><div class="glitch-rule"><i></i><i></i><i></i><i></i><i></i></div></section><div class="premise">${t.premise}</div><div class="cta-row"><div class="tagline">${t.tag}</div><button class="leave-btn" data-go="/upload">${t.leave}</button></div><div class="micro">// click it before this gets embarrassing</div><div class="feed-head"><b>${t.feed}</b><span class="sort">${t.sort}</span></div><div class="feed-note">${t.feedNote}</div><div class="feed-rule"></div><section class="gallery desktop-gallery"><div class="col">${art(0)}${art(1)}${art(2)}</div><div class="col center-col">${art(3)}<div style="display:grid;grid-template-columns:1fr 1.1fr;gap:46px">${art(4)}${art(5)}</div></div><div class="col right-col">${art(6)}${art(7)}${art(8)}${art(9)}</div></section><section id="mobileFeed" class="mobile-feed">${mobileFeedInitial()}</section><div id="feedSentinel" class="feed-sentinel" aria-hidden="true"></div>`)}
function upload(){const l=lang(),t=copy[l];return frame(`<section class="subpage"><div class="kicker">${t.uploadKicker}</div><h1 class="title">${t.uploadTitle}</h1><div class="dropzone" id="drop"><div class="drop-inner"><b>${t.drop}</b><small>${t.formats}</small><input id="file" type="file" accept="image/png,image/jpeg,image/webp" hidden></div></div><div class="formrow"><label class="label">${t.caption}</label><textarea id="caption" class="field" placeholder="${l==='en'?'ex: this was lunch. i liked it.':'예: 점심이었다. 맛있었다.'}"></textarea></div><label class="check"><input id="human" type="checkbox"><span>${t.human}<br><b style="color:var(--red)">${t.warning}</b></span></label><div class="actions"><button class="plain" data-go="/">${t.cancel}</button><button class="primary" id="uploadBtn">${t.leave}</button></div></section>`)}
function detail(){const l=lang(),t=copy[l];const id=+(new URLSearchParams(location.search).get('id')||0);const s=samples[id]||samples[0];const st=store(),saved=new Set(st.saved||[]);return frame(`<section class="subpage"><button class="plain" data-go="/">← ${l==='en'?'RETURN TO THE PILE':'다시 더미로'}</button><div class="kicker" style="margin-top:22px">${t.detail} // ITEM ${String(id+1).padStart(6,'0')}</div><div class="detail-grid"><div class="detail-image">IMAGE GOES HERE // TEMPORARY</div><div class="detail-copy"><h2>${esc(s[l==='en'?0:1])}</h2><p>@someone // 2026</p><button class="primary" id="saveBtn" data-id="${id}">${saved.has(id)?'[ SAVED ]':t.save}</button><p style="color:var(--red);margin-top:45px">${t.report}</p><p style="margin-top:70px">no score. no likes.<br>no recommendation engine.<br>kept because someone wanted to.</p></div></div></section>`)}
function savedPage(){const l=lang(),t=copy[l],ids=store().saved||[];return frame(`<section class="subpage"><div class="kicker">PERSONAL BUNKER // LOCAL COLLECTION</div><h1 class="title">${t.savedTitle}</h1>${ids.length?`<div class="saved-grid">${ids.map(art).join('')}</div>`:`<div class="empty">${l==='en'?'nothing saved. the void remains organized.':'저장한 게 없습니다. 공허만 잘 정리돼 있습니다.'}</div>`}</section>`)}
function profile(){const l=lang(),t=copy[l],uploads=store().uploads||[];return frame(`<section class="subpage"><div class="kicker">${t.profile}</div><h1 class="title" style="margin-bottom:8px">@someone</h1><div style="color:#777;font-size:12px">${t.bio}</div><div class="feed-rule" style="margin-top:28px"></div><div class="kicker" style="margin-top:20px">${l==='en'?'DEPOSITED MATERIAL':'투척한 자료'}</div>${uploads.length?`<div class="saved-grid">${uploads.map(u=>`<div class="artifact red"><div class="imgbox h230" style="background-image:url(${u.data});background-size:cover;background-position:center"></div><div class="cap">${esc(u.caption||'proof that today happened')}</div></div>`).join('')}</div>`:`<div class="empty">${l==='en'?'nothing deposited yet.':'아직 투척한 게 없습니다.'}</div>`}</section>`)}
function bind(){wireNav();document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>nav(b.dataset.go));const lb=document.querySelector('#langBtn');if(lb)lb.onclick=()=>setLang(lang()==='en'?'ko':'en');const sb=document.querySelector('#saveBtn');if(sb)sb.onclick=()=>{const id=+sb.dataset.id,st=store(),x=new Set(st.saved||[]);x.has(id)?x.delete(id):x.add(id);st.saved=[...x];saveStore(st);toast(lang()==='en'?'saved. apparently.':'저장했습니다. 굳이.');render()};const drop=document.querySelector('#drop'),file=document.querySelector('#file');if(drop&&file){drop.onclick=()=>file.click();drop.ondragover=e=>{e.preventDefault();drop.style.borderColor='var(--yellow)'};drop.ondragleave=()=>drop.style.borderColor='';drop.ondrop=e=>{e.preventDefault();drop.style.borderColor='';if(e.dataTransfer.files[0])loadFile(e.dataTransfer.files[0])};file.onchange=()=>file.files[0]&&loadFile(file.files[0])}const up=document.querySelector('#uploadBtn');if(up)up.onclick=submitUpload}
let pendingImage='';function loadFile(f){if(!/^image\/(jpeg|png|webp)$/.test(f.type)){toast('JPG / PNG / WEBP only');return}const r=new FileReader();r.onload=()=>{pendingImage=r.result;const d=document.querySelector('#drop');d.style.backgroundImage=`url(${pendingImage})`;d.style.backgroundSize='cover';d.style.backgroundPosition='center';d.querySelector('.drop-inner').style.opacity='.12'};r.readAsDataURL(f)}
function submitUpload(){const human=document.querySelector('#human');if(!pendingImage){toast(lang()==='en'?'drop an image first.':'이미지를 먼저 놓고 가세요.');return}if(!human?.checked){toast(lang()==='en'?'confirm it is human-made.':'직접 제작 확인이 필요합니다.');return}const st=store();st.uploads=st.uploads||[];st.uploads.unshift({data:pendingImage,caption:document.querySelector('#caption').value,at:Date.now()});saveStore(st);pendingImage='';nav('/profile')}
function toast(msg){const e=document.createElement('div');e.className='toast';e.textContent=msg;document.body.appendChild(e);setTimeout(()=>e.remove(),1800)}
function render(){clearInterval(timerId);if(feedObserver){feedObserver.disconnect();feedObserver=null}const p=route();document.documentElement.lang=lang();document.querySelector('#app').innerHTML=p==='/upload'?upload():p==='/saved'?savedPage():p==='/profile'?profile():p==='/detail'?detail():home();bind();if(p==='/'){startTimer();setupInfiniteFeed()}}
render();
