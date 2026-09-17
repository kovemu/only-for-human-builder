const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
test('shared deadline, minute rounding and expiry',()=>{
  assert.ok(fs.existsSync('lib/core.js'),'countdown implementation is required');
  const {remaining}=require('../lib/core');
  const end='2031-09-17T17:51:00Z';
  assert.deepEqual(remaining(end,Date.parse(end)-90060000),{days:1,hours:1,minutes:1});
  assert.deepEqual(remaining(end,Date.parse(end)-1),{days:0,hours:0,minutes:1});
  assert.deepEqual(remaining(end,Date.parse(end)+1),{days:0,hours:0,minutes:0});
  assert.throws(()=>remaining('invalid',0));
});
test('incomplete translation and malformed screen are rejected before drawing',()=>{
  assert.ok(fs.existsSync('lib/core.js'),'bundle validation is required');
  const {validateBundle}=require('../lib/core');
  const b={version:{schemaVersion:1,screenOrder:['home']},tokens:{background:'#fff'},countdown:{deadline:'2031-09-17T17:51:00Z'},locales:{en:{hello:'Hello'},ko:{hello:'안녕'}},screens:{home:{width:1440,height:1000,nodes:[{type:'text',x:0,y:0,width:100,height:30,key:'hello'}]}}};
  assert.equal(validateBundle(b),b);
  delete b.locales.ko.hello;
  assert.throws(()=>validateBundle(b),/translation/);
  b.locales.ko.hello='안녕'; b.screens.home.nodes[0].type='eval';
  assert.throws(()=>validateBundle(b),/node/);
});
