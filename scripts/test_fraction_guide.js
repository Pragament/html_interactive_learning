const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('activities/6/mathematics/fractions/electronic-fraction-lab/index.html','utf8');
for(const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))if(!m[1].includes('application/json'))new vm.Script(m[2]);
const script=html.match(/<script id="activity-guide-script">([\s\S]*?)<\/script>/)[1];
const adapter=script.slice(script.indexOf(' let draft=null;'),script.indexOf(' function lock()'));
const ctx=vm.createContext({mode:4,power:true,rows:[Array(8).fill(false),Array(8).fill(false),Array(8).fill(false)],target:4,match:[null,null],quiz:0,answer:null,atlFault:'none',atlTestRow:0,atlPrediction:'1',atlHeld:new Set(),render(){},setMode(n){this.mode=n;}});
vm.runInContext('function setMode(n){mode=n;}'+adapter+';this.tours=tours;this.settings=settings;this.applyDemo=applyDemo;this.captureDraft=captureDraft;this.restoreDraft=restoreDraft;',ctx);
assert.equal(ctx.tours.length,6);const modes=new Set();for(const tour of ctx.tours)for(const step of tour.steps){assert(step.text&&step.title);ctx.applyDemo(step);assert(ctx.mode>=0&&ctx.mode<=6);modes.add(ctx.mode);assert(ctx.rows.every(r=>r.length===8));assert(ctx.match.every(i=>i===null||i>=0&&i<3));if(ctx.answer!==null)assert(ctx.answer>=0&&ctx.answer<4);}
assert.equal(modes.size,7);vm.runInContext('draft=captureDraft();',ctx);const original=JSON.stringify(ctx.captureDraft());ctx.settings({mode:1,counts:[8,2,3],power:false});ctx.restoreDraft();assert.equal(JSON.stringify(ctx.captureDraft()),original);
assert(script.includes('if(!draft)draft=captureDraft()'));assert(!/garden|notebook/i.test(script));assert(html.includes('☷ Tour list'));assert(html.includes('value="sentence" selected'));
console.log('Passed six fraction tours covering seven lab modes, valid scene states, draft restoration, sentence default and tour-list controls.');
