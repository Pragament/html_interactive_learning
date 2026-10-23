#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const file=path.join(__dirname,'../activities/preprimary/robotics/wizbot-maxx/wizbot-academy/index.html');
const html=fs.readFileSync(file,'utf8');
const language=html.match(/<script id="wizbot-code-language">([\s\S]*?)<\/script>/)[1];
const context={setTimeout};vm.createContext(context);vm.runInContext(language,context);
const engine=context.WizbotCode;
for(const match of html.matchAll(/<script(?: id="wizbot-code-language")?>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
async function run(source,input=7,extra={}){const output=[],trace=[],moves=[],travel=[];const result=await engine.run(source,{input,onPrint:text=>output.push(text),onTrace:event=>trace.push(event),onMove:(command,args)=>{moves.push(command);travel.push({command,args:[...args]});return true;},yieldControl:async()=>{},...extra});return {output,trace,moves,travel,result};}
const example=id=>engine.examples.find(item=>item.id===id).code;
(async()=>{
 for(const item of engine.examples){const result=await run(item.code,item.input);assert.ok(result.travel.some(move=>['F','B','AL','AR','WL','WR'].includes(move.command)),item.id+' must make the robot travel.');}
 assert.equal(engine.examples.length,9);
 const fib=[1,1,2,3,5,8,13,21];
 for(const id of ['fibonacci-spiral','fibonacci-steps']){
  const result=await run(example(id),8);
  const travel=result.travel.filter(move=>['F','AR'].includes(move.command));
  assert.deepEqual(travel.map(move=>move.args[0]),fib);
  assert.equal(result.output.length,0,'Patterns should move rather than just print numbers.');
 }
 assert.equal((await run(example('fibonacci-spiral'),12)).travel.at(-1).args[0],144);
 assert.deepEqual((await run(example('fibonacci-spiral'),13)).output,['Choose 1 to 12 arcs.']);
 assert.deepEqual((await run(example('fibonacci-spiral'),0)).output,['Choose 1 to 12 arcs.']);
 const square=(await run(example('square'),3)).travel;
 assert.deepEqual(square.map(move=>move.command),['F','R','F','R','F','R','F','R']);
 assert.deepEqual(square.filter(move=>move.command==='F').map(move=>move.args[0]),[3,3,3,3]);
 assert.deepEqual((await run(example('rectangle'),4)).travel.filter(move=>move.command==='F').map(move=>move.args[0]),[4,1,4,1]);
 assert.deepEqual((await run(example('even-odd'),4)).moves,['F','R','F','L','F','R','F','L']);
 assert.deepEqual((await run(example('prime-composite'),7)).moves,['F','R45','F','R45','F','L45','F','R45','F','L45','F','R45']);
 assert.deepEqual((await run(example('staircase'),3)).travel.filter(move=>move.command==='F').map(move=>move.args[0]),[3,1,2,1,1,1]);
 assert.deepEqual((await run(example('growing-squares'),3)).travel.filter(move=>move.command==='F').map(move=>move.args[0]),[1,1,1,1,2,2,2,2,3,3,3,3]);
 assert.deepEqual((await run(example('square-spiral'),5)).travel.filter(move=>move.command==='F').map(move=>move.args[0]),[1,2,3,4,5]);
 // Test geometry independently of the DOM and animation, including complete loops.
 function route(travel,mode='draw'){
  let pose={x:300,y:300,a:0},distance=0;
  for(const move of travel){const c=move.command;if(c==='A')continue;if(['L','R','L45','R45','L30','R30'].includes(c)){pose.a+=(c.startsWith('L')?-1:1)*(c.includes('45')?45:c.includes('30')?30:90);continue;}
   const path=engine.motion(pose,c,move.args,mode);const first=path.point(0);assert.ok(Math.hypot(first.x-pose.x,first.y-pose.y)<1e-8,'Travel segments must join without a jump.');distance+=path.distance;pose=path.point(1);
  }return {pose,distance};
 }
 for(const id of ['square','rectangle','growing-squares']){const result=route((await run(example(id),3)).travel);assert.ok(Math.hypot(result.pose.x-300,result.pose.y-300)<1e-8,id+' should return to its starting corner.');}
 const spiral=route((await run(example('fibonacci-spiral'),8)).travel);
 assert.ok(Math.abs(spiral.distance/25-fib.reduce((a,b)=>a+b)*Math.PI/2)<1e-8);
 assert.equal(spiral.pose.a,720);
 const straight=engine.motion({x:0,y:0,a:90},'F',[3],'grid').point(1);assert.ok(Math.abs(straight.x-150)<1e-8&&Math.abs(straight.y)<1e-8);
 const rightArc=engine.motion({x:0,y:0,a:0},'AR',[2],'draw').point(1);assert.ok(Math.abs(rightArc.x-50)<1e-8&&Math.abs(rightArc.y+50)<1e-8&&rightArc.a===90);
 const leftArc=engine.motion({x:0,y:0,a:0},'AL',[2],'draw').point(1);assert.ok(Math.abs(leftArc.x+50)<1e-8&&Math.abs(leftArc.y+50)<1e-8&&leftArc.a===-90);
 assert.deepEqual((await run('print(")", "(", ";", "if", "+", "{");')).output,[') ( ; if + {']);
 assert.deepEqual((await run('let n = 0; repeat(3) { if (n == 1) { print("middle"); } else { print(n); } n += 1; }')).output,['0','middle','2']);
 assert.deepEqual((await run('if (false && missing > 0) { print("bad"); } else if (true || missing > 0) { print("short circuit"); }')).output,['short circuit']);
 assert.deepEqual((await run('let n = 5; n -= 2; print(n, 10 % 3, -2 * 3, !false); // comment')).output,['3 1 -6 true']);
 assert.deepEqual((await run('repeat (0) { print("no"); } while (false) { print("no"); }')).output,[]);
 for(const [source,message] of [
  ['while (true) {}',/Run limit reached/],
  ['repeat(1000) { print("x"); }',/Output limit/],
  ['repeat(201) { forward(); }',/Movement limit/],
  ['print(1 / 0);',/divide by zero/],
  ['print(1 % 0);',/divisor zero/],
  ['let x = 1000000000001;',/too large/],
  ['repeat(-1) {}',/repeat count/],
  ['repeat(2.5) {}',/repeat count/],
  ['print(missing);',/Define missing/],
  ['if (true) { let local = 4; } print(local);',/Define local/],
  ['input = 5;',/read-only/],
  ['window.alert(1);',/Unexpected character/],
  ['fetch("https://example.com");',/Unknown command/],
  ['forward(0);',/Movement length/],
  ['arcRight(-1);',/Movement length/],
  ['forward(1001);',/Movement length/],
  ['forward(1,2);',/at most one/],
  ['right(45);',/no arguments/],
  ['let x = 1;\nif (x > 0) { print(x);',/Line 2.*Close this block/],
  ['print('+ '('.repeat(100)+'1'+')'.repeat(100)+');',/nested/]
 ])await assert.rejects(()=>run(source),message,source.slice(0,50));
 let yields=0;
 await assert.rejects(()=>run('while (true) {}',0,{shouldStop:()=>yields>=2,yieldControl:async()=>{yields++;}}),/Stopped/);
 assert.equal(yields,2,'Empty infinite loops must yield and permit cancellation.');
 await assert.rejects(()=>run('forward();',0,{onMove:()=>false}),/board edge/);
 console.log('Verified nine robot-travel patterns, Fibonacci radii, joined arcs, closed shapes, conditional turns, scope, limits, cancellation and syntax errors.');
})().catch(error=>{console.error(error);process.exitCode=1;});
