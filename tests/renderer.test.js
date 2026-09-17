const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function boot(){
 let fail=false;const page={children:[],appendChild(n){if(n.parent)n.parent.children=n.parent.children.filter(v=>v!==n);this.children.push(n);n.parent=this;}};
 function node(type){return {type,children:[],tags:{},appendChild:page.appendChild,resize(w,h){this.width=w;this.height=h},setPluginData(k,v){this.tags[k]=v},getPluginData(k){return this.tags[k]||''},remove(){if(this.parent)this.parent.children=this.parent.children.filter(v=>v!==this);this.removed=true;}};}
 const messages=[];
 const figma={currentPage:page,createFrame:()=>node('FRAME'),createRectangle:()=>node('RECTANGLE'),createText:()=>{if(fail)throw Error('render failure');return node('TEXT')},loadFontAsync:async()=>{},showUI(){},ui:{postMessage:m=>messages.push(m)},viewport:{scrollAndZoomIntoView(){}},notify(){},on(){}};
 vm.runInNewContext(fs.readFileSync('plugin/code.js','utf8'),{figma,__html__:'',console,Date,Math,JSON,setInterval:()=>1,clearInterval(){},fetch:async()=>{throw Error('offline')}});
 return {page,figma,node,messages,breakRender(){fail=true}};
}
test('build both languages, preserve unrelated frames, rollback failed rebuild',async()=>{
 assert.ok(fs.existsSync('plugin/code.js'),'built plugin is required');
 const h=boot();const user=h.node('FRAME');h.page.appendChild(user);
 await h.figma.ui.onmessage({type:'build',locale:'both'});
 assert.equal(h.page.children.length,11);
 assert.ok(h.messages.at(-1).ok,JSON.stringify(h.messages.at(-1)));
 const texts=h.page.children.flatMap(n=>n.children).filter(n=>n.type==='TEXT').map(n=>n.characters);
 assert.ok(texts.includes('leave something before we go.'));
 assert.ok(texts.includes('가기 전에 뭐라도 남기자.'));
 const old=[...h.page.children];h.breakRender();
 await h.figma.ui.onmessage({type:'build',locale:'en'});
 assert.deepEqual(h.page.children,old);
 assert.equal(h.messages.at(-1).ok,false);
});
