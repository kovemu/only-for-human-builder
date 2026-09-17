const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){
 const nodes=Object.fromEntries(['status','sync','build','offline','locale'].map(k=>[k,{style:{},disabled:false,value:'en'}]));
 const timers=new Map();let next=0;const sent=[];
 const ctx={document:{getElementById:k=>nodes[k],querySelectorAll:()=>Object.values(nodes)},parent:{postMessage:m=>sent.push(m)},setTimeout:(fn,ms)=>{timers.set(++next,{fn,ms});return next},clearTimeout:id=>timers.delete(id),AbortController,fetch:async()=>new Promise(()=>{})};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('plugin/ui.html','utf8').match(/<script>([\s\S]*)<\/script>/)[1],ctx);
 return {ctx,nodes,timers,sent};
}
test('host-relayed status without parent source releases disabled buttons',()=>{
 const h=setup();h.nodes.build.onclick();
 h.ctx.onmessage({source:null,data:{pluginMessage:{type:'status',ok:true,message:'Loaded'}}});
 assert.equal(h.nodes.build.disabled,false);
 assert.equal(h.nodes.status.textContent,'Loaded');
});
test('missing renderer acknowledgement releases controls with actionable error',()=>{
 const h=setup();h.nodes.build.onclick();
 assert.ok(h.timers.size>0,'acknowledgement timeout required');
 for(const t of [...h.timers.values()])t.fn();
 assert.equal(h.nodes.build.disabled,false);
 assert.match(h.nodes.status.textContent,/응답/);
});
test('malformed host messages are ignored safely',()=>{
 const h=setup();assert.doesNotThrow(()=>h.ctx.onmessage({source:h.ctx.parent,data:null}));
});
test('network deadline rejects even if transport ignores abort',async()=>{
 const h=setup();const job=h.nodes.sync.onclick();
 assert.equal(h.nodes.sync.disabled,true);
 for(const t of [...h.timers.values()])t.fn();
 await job;
 assert.equal(h.nodes.sync.disabled,false);
 assert.match(h.nodes.status.textContent,/15초/);
});
