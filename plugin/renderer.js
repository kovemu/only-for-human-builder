let activeBundle=BUNDLED, busy=false, timerJobs=[];
const OWNER='only-for-human-builder-v1';
const PIXELS=['111101101101101101111','010110010010010010111','111001001111100100111','111001001111001001111','101101101111001001001','111100100111001001111','111100100111101101111','111001001010010010010','111101101111101101111','111101101111001001111'];
function paint(value){const hex=(activeBundle.tokens[value]||value||'#24241F').replace('#','');const s=hex.length===3?hex.split('').map(c=>c+c).join(''):hex;if(!/^[0-9a-f]{6}$/i.test(s))throw Error('Invalid color');return {r:parseInt(s.slice(0,2),16)/255,g:parseInt(s.slice(2,4),16)/255,b:parseInt(s.slice(4),16)/255};}
function rectangle(parent,x,y,w,h,color){const r=figma.createRectangle();parent.appendChild(r);r.x=x;r.y=y;r.resize(w,h);r.fills=[{type:'SOLID',color:paint(color)}];return r;}
async function textNode(parent,n,locale,font){const t=figma.createText();parent.appendChild(t);t.fontName={family:font,style:'Regular'};t.fontSize=n.size||14;t.characters=n.key?activeBundle.locales[locale][n.key]:n.text;t.x=n.x;t.y=n.y;t.resize(n.width,n.height);t.textAutoResize='HEIGHT';t.fills=[{type:'SOLID',color:paint(n.color)}];return t;}
function drawTimer(frame,n){
 const fields=countdownDisplay(activeBundle.countdown.deadline,Date.now(),n.mode||'split');
 const holder=figma.createFrame();frame.appendChild(holder);holder.name='Live pixel countdown';holder.x=n.x;holder.y=n.y;holder.resize(n.width,n.height);holder.fills=[];holder.clipsContent=false;
 const cell=n.pixelScale||12,square=Math.max(2,cell-2),step=cell*4,color=n.color||'timerText';
 fields.forEach((value,f)=>{
  const defaultOffsets=[0,450,720],rawOffset=(n.mode==='totalMinutes'?0:(defaultOffsets[f]||0));
  const visualWidth=Math.max(0,value.length*step-cell);
  const offset=n.align==='center'?Math.max(0,(n.width-visualWidth)/2):rawOffset;
  value.split('').forEach((d,i)=>{
   const bits=PIXELS[Number(d)],dx=n.glitch?[0,3,-2,4,-3,1][i%6]:0,dy=n.glitch?[0,-4,2,-2,3,0][i%6]:0;
   for(let y=0;y<7;y++)for(let x=0;x<3;x++)if(bits[y*3+x]==='1'){
    const px=offset+i*step+x*cell+dx,py=y*cell+dy;
    if(n.shadow)rectangle(holder,px-4,py+4,square,square,'line');
    if(n.shadow&&((i+x+y)%7===0))rectangle(holder,px+5,py-3,square,square,'warning');
    rectangle(holder,px,py,square,square,color);
   }
  });
 });
 return holder;
}
async function build(locale){
 if(busy)return;busy=true;
 const staging=[],jobs=[];
 try{
  validateBundle(activeBundle);
  const langs=locale==='both'?['en','ko']:[locale==='ko'?'ko':'en'];
  const old=figma.currentPage.children.filter(n=>n.type==='FRAME'&&n.getPluginData('owner')===OWNER&&langs.includes(n.getPluginData('locale')));
  for(const lang of langs){
   let font=lang==='ko'?activeBundle.tokens.koreanFont:activeBundle.tokens.font;
   try{await figma.loadFontAsync({family:font,style:'Regular'});}catch(_){font='Inter';await figma.loadFontAsync({family:font,style:'Regular'});}
   for(let i=0;i<activeBundle.version.screenOrder.length;i++){
    const id=activeBundle.version.screenOrder[i],s=activeBundle.screens[id];
    const f=figma.createFrame();figma.currentPage.appendChild(f);staging.push(f);f.name='[OFH] '+id+' / '+lang.toUpperCase();f.setPluginData('owner',OWNER);f.setPluginData('locale',lang);f.setPluginData('version',activeBundle.version.builderVersion);f.resize(s.width,s.height);f.x=i*(1440+activeBundle.tokens.frameGap);f.y=lang==='en'?0:1700;f.fills=[{type:'SOLID',color:paint('background')}];f.visible=false;
    for(const n of s.nodes){
     if(n.type==='rect')rectangle(f,n.x,n.y,n.width,n.height,n.color);
     if(n.type==='text')await textNode(f,n,lang,font);
     if(n.type==='countdown')jobs.push({frame:f,spec:n,holder:drawTimer(f,n),last:JSON.stringify(countdownDisplay(activeBundle.countdown.deadline,Date.now(),n.mode||'split'))});
     if(n.type==='image'){
      const response=await fetch(n.url);if(!response.ok)throw Error('Image load failed');
      const image=figma.createImage(new Uint8Array(await response.arrayBuffer()));
      const r=rectangle(f,n.x,n.y,n.width,n.height,'line');r.fills=[{type:'IMAGE',imageHash:image.hash,scaleMode:'FILL'}];
     }
    }
   }
  }
  timerJobs=timerJobs.filter(j=>!old.includes(j.frame));old.forEach(n=>n.remove());staging.forEach(n=>{n.visible=true;});timerJobs.push(...jobs);
  figma.viewport.scrollAndZoomIntoView(staging.slice(0,1));status(true,staging.length+' screens generated · '+activeBundle.version.builderVersion);
 }catch(e){staging.forEach(n=>n.remove());status(false,e.message+' · previous screens kept');}
 finally{busy=false;}
}
function status(ok,message){figma.ui.postMessage({type:'status',ok,message});}
figma.showUI(__html__,{width:360,height:390});
figma.ui.onmessage=async m=>{
 if(busy)return;
 if(m.type==='bundle'){try{activeBundle=validateBundle(m.bundle);status(true,'Loaded '+activeBundle.version.builderVersion+' @ '+m.commit.slice(0,7));}catch(e){status(false,e.message);}}
 if(m.type==='offline'){activeBundle=BUNDLED;status(true,'Bundled version loaded');}
 if(m.type==='build')await build(m.locale);
};
const ticker=setInterval(()=>{if(busy)return;timerJobs=timerJobs.filter(j=>!j.frame.removed);for(const j of timerJobs){const next=JSON.stringify(countdownDisplay(activeBundle.countdown.deadline,Date.now(),j.spec.mode||'split'));if(next!==j.last){j.holder.remove();j.holder=drawTimer(j.frame,j.spec);j.last=next;}}},1000);
figma.on('close',()=>clearInterval(ticker));
