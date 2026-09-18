const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function boot(){
 let fail=false,now=Date.parse('2026-09-18T08:00:30Z'),ticker=null,rectangleCreates=0;
 const page={children:[],appendChild(n){if(n.parent)n.parent.children=n.parent.children.filter(v=>v!==n);this.children.push(n);n.parent=this;}};
 function node(type){return {type,name:'',children:[],tags:{},visible:true,appendChild:page.appendChild,resize(w,h){this.width=w;this.height=h},setPluginData(k,v){this.tags[k]=v},getPluginData(k){return this.tags[k]||''},remove(){if(this.parent)this.parent.children=this.parent.children.filter(v=>v!==this);this.removed=true;}};}
 const messages=[];
 const figma={currentPage:page,createFrame:()=>node('FRAME'),createRectangle:()=>{rectangleCreates++;return node('RECTANGLE')},createText:()=>{if(fail)throw Error('render failure');return node('TEXT')},loadFontAsync:async()=>{},showUI(){},ui:{postMessage:m=>messages.push(m)},viewport:{scrollAndZoomIntoView(){}},notify(){},on(){}};
 const FakeDate={parse:Date.parse,now:()=>now};
 vm.runInNewContext(fs.readFileSync('plugin/code.js','utf8'),{figma,__html__:'',console,Date:FakeDate,Math,JSON,setInterval:fn=>{ticker=fn;return 1},clearInterval(){},fetch:async()=>{throw Error('offline')}});
 return {page,figma,node,messages,breakRender(){fail=true},getCreates(){return rectangleCreates},tick(ms){now+=ms;ticker();}};
}
test('build both languages, keep timer free of yellow glitches, and update seconds without rebuilding it',async()=>{
 assert.ok(fs.existsSync('plugin/code.js'),'built plugin is required');
 const h=boot();const user=h.node('FRAME');h.page.appendChild(user);
 await h.figma.ui.onmessage({type:'build',locale:'both'});
 assert.equal(h.page.children.length,11);
 assert.ok(h.messages.at(-1).ok,JSON.stringify(h.messages.at(-1)));
 const frames=h.page.children.filter(n=>n.type==='FRAME'&&n.tags.owner==='only-for-human-builder-v1');
 assert.equal(frames.length,10);
 const texts=frames.flatMap(n=>n.children).filter(n=>n.type==='TEXT').map(n=>n.characters);
 assert.ok(texts.includes('leave something before we go.'));
 assert.ok(texts.includes('가기 전에 뭐라도 남기자.'));
 assert.ok(texts.includes('min'));
 const home=frames.find(n=>n.name==='[OFH] home / EN');
 const timer=home.children.find(n=>n.name==='Live pixel countdown');
 assert.ok(timer,'home timer exists');
 const yellow=JSON.stringify({r:1,g:242/255,b:0});
 assert.ok(!timer.children.map(n=>JSON.stringify(n.fills?.[0]?.color)).includes(yellow),'timer has no yellow glitch pixels');
 const created=h.getCreates(),visibility=timer.children.map(n=>n.visible).join('');
 h.tick(1000);
 const timerAfter=home.children.find(n=>n.name==='Live pixel countdown');
 assert.equal(h.getCreates(),created,'seconds tick creates no rectangles');
 assert.equal(timerAfter,timer,'seconds tick keeps the timer holder');
 assert.notEqual(timerAfter.children.map(n=>n.visible).join(''),visibility,'seconds pixels update');
 const old=[...h.page.children];h.breakRender();
 await h.figma.ui.onmessage({type:'build',locale:'en'});
 assert.deepEqual(h.page.children,old);
 assert.equal(h.messages.at(-1).ok,false);
});
