// Run with: node scripts/test_wizbot_guide.js
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../activities/preprimary/robotics/wizbot-maxx/wizbot-academy/index.html'),'utf8');
const context=vm.createContext({setTimeout,TextEncoder});
for(const id of ['wizbot-code-language','wizbot-number-series','wizbot-workshop-model','wizbot-guide-model'])vm.runInContext(html.match(new RegExp('<script id="'+id+'">([\\s\\S]*?)<\\/script>'))[1],context);
const script=html.match(/<script id="wizbot-guide-script">([\s\S]*?)<\/script>/)[1];new vm.Script(script);
const tours=vm.runInContext(script.slice(script.indexOf(' const defaults='),script.indexOf(' let draft='))+'\ntours;',context);
vm.runInContext('this.guideModel=WizbotGuideModel;this.workshop=WizbotWorkshop;this.series=WizbotSeries;',context);
const g=context.guideModel,w=context.workshop;
const near=(a,b)=>assert(Math.abs(a-b)<1e-6,`${a} != ${b}`);
(async()=>{
 for(const key of ['buttons','square','fibonacci','decisions','series-prefix','series-solved']){
  const plan=g.plan(key),route=g.frames(plan);assert(route.frames.length>1);let last=0;
  for(const frame of route.frames){assert(frame.distance>=last);assert(Number.isFinite(frame.pose.x)&&Number.isFinite(frame.pose.y));last=frame.distance;}
  let reference=w.model(plan.mode,route.start);plan.moves.forEach(m=>reference.move(m.command,m.args));reference=reference.finish();near(reference.length,route.distance);near(reference.pose.x,route.pose.x);near(reference.pose.y,route.pose.y);near(reference.pose.a,route.pose.a);
  if(plan.kind==='code'){
   const example=context.WizbotCode.examples.find(e=>e.id===plan.example);assert(example);const moves=[];
   const result=await context.WizbotCode.run(example.code,{input:plan.input,onMove:async(command,args)=>{moves.push({command,args});return true;}});
   assert.equal(JSON.stringify(moves),JSON.stringify(plan.moves),'demo must follow the actual loaded code');assert.deepEqual(JSON.parse(JSON.stringify(result.variables)),JSON.parse(JSON.stringify(plan.variables)));
  }
  if(plan.kind==='series'){const labels=route.marks.map(m=>m.text);assert.equal(labels.length,plan.solved?6:4);if(!plan.solved)assert(!labels.some(s=>s.startsWith('5:')),'prefix must not reveal the blank');else assert(labels.includes('5: 20'));}
 }
 for(const tour of tours){assert(tour.steps.length>0);assert(tour.steps[0].set?.plan);for(const step of tour.steps){if(step.set?.plan)assert(g.frames(g.plan(step.set.plan)).distance>0);if(step.target.startsWith('#'))assert(html.includes('id="'+step.target.slice(1)+'"'),step.target);}}
 assert.equal(tours.length,6);assert(html.includes('value="sentence" selected'));assert(script.includes('if(!draft)draft=captureDraft();cancel()'));assert(script.includes('highlighted=null;restoreDraft()'));assert(script.includes("!guide('competition-end').disabled"));
 console.log('Passed six Wizbot tours: exact interpreter commands, geometry, final variables, masked/solved series, target IDs, draft restoration hooks and competition guard.');
})().catch(error=>{console.error(error);process.exitCode=1;});
