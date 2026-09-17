function remaining(deadline, now) {
  const end=Date.parse(deadline);
  if(!Number.isFinite(end)||!Number.isFinite(now)) throw new Error('Invalid countdown time');
  const total=Math.max(0,Math.ceil((end-now)/60000));
  return {days:Math.floor(total/1440),hours:Math.floor(total/60)%24,minutes:total%60};
}
function validateBundle(b) {
  if(!b || b.version.schemaVersion!==1) throw new Error('Unsupported schema');
  remaining(b.countdown.deadline,Date.now());
  const order=b.version.screenOrder;
  if(!Array.isArray(order)||!order.length||order.length>10||new Set(order).size!==order.length) throw new Error('Invalid screen order');
  if(!b.tokens||!b.locales.en||!b.locales.ko) throw new Error('Missing tokens or locales');
  const a=Object.keys(b.locales.en).sort(), c=Object.keys(b.locales.ko).sort();
  if(JSON.stringify(a)!==JSON.stringify(c)) throw new Error('Missing translation');
  for(const key of a) for(const lang of ['en','ko']) if(typeof b.locales[lang][key]!=='string') throw new Error('Invalid translation');
  for(const id of order) {
    if(!/^[a-z-]+$/.test(id)) throw new Error('Invalid screen key');
    const s=b.screens[id];
    if(!s||!Number.isFinite(s.width)||!Number.isFinite(s.height)||s.width<1||s.height<1||!Array.isArray(s.nodes)||s.nodes.length>1000) throw new Error('Invalid screen');
    for(const n of s.nodes) {
      if(!['text','rect','countdown','image'].includes(n.type)) throw new Error('Invalid node type');
      for(const p of ['x','y','width','height']) if(!Number.isFinite(n[p])) throw new Error('Invalid node geometry');
      if(n.width<=0||n.height<=0) throw new Error('Invalid node size');
      if(n.key&&!a.includes(n.key)) throw new Error('Missing translation '+n.key);
      if(n.type==='text'&&!n.key&&typeof n.text!=='string') throw new Error('Missing text');
      if(n.type==='image'&&!/^https:\/\/raw\.githubusercontent\.com\/kovemu\/only-for-human-builder\//.test(n.url)) throw new Error('Image must be in the project repo');
    }
  }
  return b;
}
if(typeof module!=='undefined') module.exports={remaining,validateBundle};
