#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../activities/preprimary/robotics/wizbot-maxx/wizbot-academy/index.html'),'utf8');
const ctx={TextEncoder,setTimeout};vm.createContext(ctx);
for(const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))if(!match[1].includes('application/json')&&!match[1].includes('src='))new vm.Script(match[2]);
for(const id of ['wizbot-code-language','wizbot-number-series','wizbot-workshop-model'])vm.runInContext(html.match(new RegExp('<script id="'+id+'">([\\s\\S]*?)<\\/script>'))[1],ctx);
vm.runInContext('this.workshop=WizbotWorkshop;this.series=WizbotSeries;',ctx);
const w=ctx.workshop,e=ctx.WizbotCode,settings={grid:'dots',gridMM:10,scale:'fit',stepMM:10,width:2,path:true};
(async()=>{
 for(const example of e.examples){
  const route=await w.trace(example.code,example.input,example.mode);assert.ok(route.length>0);assert.ok(route.seconds>0);assert.ok(w.matches(route,route),example.id);
  const bytes=w.pdf(route,{title:example.title,concept:example.concept,challenge:example.challenge,axes:example.axes,scene:example.scene,input:example.input},settings),pdf=Buffer.from(bytes).toString();
  assert.ok(bytes.preview.startsWith('<svg'));assert.ok(bytes.preview.includes('START'));assert.ok(bytes.preview.includes('FINISH'));assert.ok(bytes.preview.includes('stroke="black"'));assert.ok(pdf.startsWith('%PDF-1.4'));assert.ok(pdf.includes('/Count 1'));assert.ok(pdf.includes('/MediaBox [0 0 595.276 841.89]'));assert.ok(pdf.includes('START'));assert.ok(pdf.includes('FINISH'));assert.ok(!/\b(?:rg|RG|gs)\b/.test(pdf),'Only black/white PDF painting, no RGB or opacity');
  for(const m of pdf.matchAll(/(\d+) 00000 n /g))assert.ok(pdf.slice(Number(m[1])).match(/^\d+ 0 obj/),'Cross-reference byte offsets');
  if(example===e.examples[0])fs.writeFileSync('/tmp/wizbot-workshop.pdf',bytes);
  if(['square','c9-acceleration','c10-slab','c6-reflection'].includes(example.id))fs.writeFileSync('/tmp/wizbot-'+example.id+'.pdf',bytes);
 }
 for(const q of ctx.series.questions)for(const kind of ['graph','spiral']){const route=w.series(q,kind);assert.ok(route.length>0);assert.ok(w.matches(route,route));w.pdf(route,{title:'Number series Q'+q.id,concept:'Find the missing term.',challenge:q.explanation},settings);}
 const square='repeat (4) { forward(); right(); }',expanded='forward();right();forward();right();forward();right();forward();right();';
 const ref=await w.trace(square,4,'draw'),actual=await w.trace(expanded,4,'draw');assert.ok(w.matches(ref,actual));
 assert.equal(w.statements(square),3);assert.equal(w.statements(expanded),8);assert.equal(w.statements(expanded.replaceAll(';',';\n')),8);
 const compact='repeat (4) { forward(input); reverse(input); right(); }';
 const readable='// Same algorithm, formatted for reading\nrepeat (4) {\n  forward(input);\n  reverse(input);\n  right();\n}';
 assert.equal(w.statements(compact),4);assert.equal(w.statements(readable),4);
 const compactRoute=await w.trace(compact,3,'draw'),readableRoute=await w.trace(readable,3,'draw');
 assert.deepEqual(w.score(compactRoute,compactRoute,compact,4,30),w.score(compactRoute,readableRoute,readable,4,30),'Whitespace and comments must not change any score');
 const unrolled=Array.from({length:4},()=> 'forward(input); reverse(input); right();').join('\n');
 assert.equal(w.statements(unrolled),12);assert.ok(w.matches(compactRoute,await w.trace(unrolled,3,'draw')));
 assert.ok(w.score(compactRoute,compactRoute,compact,4,30).code>w.score(compactRoute,compactRoute,unrolled,4,30).code,'A loop genuinely reduces logical statements');
 const fast=w.score(ref,actual,square,3,0),slow=w.score(ref,actual,expanded,3,120);assert.equal(fast.total,1000);assert.equal(slow.code,150);assert.equal(slow.coding,100);
 const slowerBot=await w.trace(square,4,'draw',0.5,45);assert.equal(w.score(ref,slowerBot,square,3,0).time,200);
 const empty=await w.trace('print(1);',0,'draw');assert.equal(w.score(ref,empty,'print(1);',3,0).total,0);
 const wrong=await w.trace('forward();reverse();',0,'draw');assert.equal(w.matches(ref,wrong),false);
 const heading=await w.trace(square+'right();',0,'draw');assert.equal(w.matches(ref,heading),false);
 const detour=await w.trace(square+'forward();reverse();',0,'draw');assert.equal(w.matches(ref,detour),false);
 const shortcut=await w.trace('repeat(4){right();}',0,'draw');assert.equal(w.matches(ref,shortcut),false);
 const split=await w.trace('repeat(4){forward(0.5);forward(0.5);right();}',0,'draw');assert.ok(w.matches(ref,split),'Equivalent segment splitting is accepted');
 const curve=await w.trace('arcRight(2);',0,'draw',2,90);assert.ok(Math.abs(curve.seconds-Math.PI/2)<.0001);
 const timed=await w.trace('forward(2);right();action();',0,'draw',2,90);assert.equal(timed.seconds,3);
 const big=await w.trace('forward(100);',0,'draw');assert.throws(()=>w.pdf(big,{title:'Big',concept:'',challenge:''},{...settings,scale:'calibrated',stepMM:10}),/will not fit/);
 for(const grid of ['dots','lines','none'])for(const path of [false,true])w.pdf(ref,{title:'Square',concept:'Equal sides',challenge:'Measure and predict.'},{...settings,grid,path,scale:'calibrated'});
 const sectionKeys=['header','concept','try','code','explain','test','print','model','guidesNote'];
 const details={title:'Worksheet layout test',concept:'Equal sides form a square.',challenge:'Count turns and measure the sides.'};
 for(const orientation of ['portrait','landscape']){
  const full=w.pdf(ref,details,{...settings,orientation}),none=Object.fromEntries(sectionKeys.map(key=>[key,false]));
  const blank=w.pdf(ref,details,{...settings,orientation,sections:none});
  assert.ok(blank.layout.grid.h>full.layout.grid.h+150,'Excluded sections reclaim vertical space');
  assert.equal(blank.layout.grid.y,28);assert.equal(blank.layout.grid.h,blank.layout.height-56);assert.equal(blank.layout.grid.w,blank.layout.width-56);
  assert.ok(Buffer.from(blank).toString().includes(orientation==='landscape'?'/MediaBox [0 0 841.89 595.276]':'/MediaBox [0 0 595.276 841.89]'));
  for(const label of ['WIZBOT','CONCEPT:','TRY:','CODE / BUTTON PLAN','PREDICT - MEASURE - EXPLAIN','Test: predicted','Print A4','Illustrative model'])assert.ok(!blank.preview.includes(label),label+' excluded');
  assert.ok(blank.preview.includes('START')&&blank.preview.includes('FINISH'));
  for(let mask=0;mask<512;mask++){
   const sections=Object.fromEntries(sectionKeys.map((key,i)=>[key,!!(mask&(1<<i))]));
   const result=w.pdf(ref,details,{...settings,orientation,sections});
   assert.ok(result.layout.grid.h>=100);assert.ok(result.layout.grid.y>=28);assert.ok(result.layout.grid.y+result.layout.grid.h<=result.layout.height-28);
   assert.equal(result.preview.includes('CONCEPT:'),sections.concept);assert.equal(result.preview.includes('TRY:'),sections.try);
   assert.equal(result.preview.includes('CODE / BUTTON PLAN'),sections.code);assert.equal(result.preview.includes('PREDICT - MEASURE - EXPLAIN'),sections.explain);
   assert.equal(result.preview.includes('Test: predicted'),sections.test);assert.equal(result.preview.includes('Print A4'),sections.print);assert.equal(result.preview.includes('Illustrative model'),sections.model);
  }
  fs.writeFileSync('/tmp/wizbot-'+orientation+'-grid-only.pdf',blank);
  fs.writeFileSync('/tmp/wizbot-'+orientation+'-sections.pdf',full);
 }
 for(const example of e.examples){const route=await w.trace(example.code,example.input,example.mode);w.pdf(route,{title:example.title,concept:example.concept,challenge:example.challenge,axes:example.axes,scene:example.scene,input:example.input},{...settings,orientation:'landscape'});}
 console.log('Verified 50 example worksheets, 50 series views, all 1,024 orientation/section combinations, expanding grid layout, one-page A4/vector B&W PDF structure, calibration rejection, route equivalence and cheating rejection, statement scoring and simulated times.');
})().catch(error=>{console.error(error);process.exitCode=1;});
