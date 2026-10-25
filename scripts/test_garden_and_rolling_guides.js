// Run with: node scripts/test_garden_and_rolling_guides.js
// Run real model/UI functions and tour adapters against a small in-memory DOM.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const targets={rolling:'9/science/motion/investigate-a-rolling-ball',garden:'7/mathematics/perimeter-and-area/plan-a-school-garden'};
for(const [kind,relative]of Object.entries(targets)){
 const html=fs.readFileSync(path.join(__dirname,'../activities',relative,'index.html'),'utf8');
 const scripts=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].filter(m=>!m[1].includes('application/json'));
 const main=scripts[0][2],guideScript=scripts.find(m=>m[1].includes('activity-guide-script'))[2];new vm.Script(guideScript);
 const nodes=new Map();
 function node(id=''){
  if(id&&nodes.has(id))return nodes.get(id);const classes=new Set();
  const n={id,value:'',disabled:false,hidden:false,isConnected:true,textContent:'',innerHTML:'',children:[],style:{setProperty(){}},dataset:{},attributes:{},listeners:{},classList:{add(...a){a.forEach(x=>classes.add(x));},remove(...a){a.forEach(x=>classes.delete(x));},toggle(x,b){if(b)classes.add(x);else classes.delete(x);},contains:x=>classes.has(x)},setAttribute(k,v){this.attributes[k]=v;},getAttribute(k){return this.attributes[k]},removeAttribute(k){delete this.attributes[k]},addEventListener(k,f){this.listeners[k]=f;},appendChild(c){this.children.push(c);return c;},append(...c){this.children.push(...c)},replaceChildren(...c){this.children=[...c]},click(){if(!this.disabled)this.listeners.click?.({target:this});},scrollIntoView(){},focus(){}};
  Object.defineProperty(n,'selectedOptions',{get(){return [{textContent:kind==='rolling'?'Test surface · resistance':'Test'}]}});
  if(id)nodes.set(id,n);return n;
 }
 for(const m of html.matchAll(/<(input|select|button|div|span|output|p|h[123]|svg)[^>]*\bid="([^"]+)"[^>]*>/g)){const n=node(m[2]);n.value=m[0].match(/\bvalue="([^"]*)"/)?.[1]||'';}
 for(const m of html.matchAll(/<select[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g)){const opts=[...m[2].matchAll(/<option value="([^"]+)"([^>]*)>/g)];node(m[1]).value=(opts.find(x=>x[2].includes('selected'))||opts[0])?.[1]||'';}
 const context=vm.createContext({document:{getElementById:node,createElement:()=>node(),querySelectorAll:()=>[],body:{classList:{add(){},remove(){}}}},window:{addEventListener(){},matchMedia:()=>({matches:true})},requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},console});
 vm.runInContext(main,context);
 const defStart=guideScript.indexOf(' const defaults='),defEnd=guideScript.indexOf(' function lock()',defStart);
 vm.runInContext('const guide=id=>document.getElementById(id);\n'+guideScript.slice(defStart,defEnd),context);
 const tours=vm.runInContext('tours',context);
 for(let t=0;t<tours.length;t++){
  vm.runInContext(`settings(defaults); ${kind==='rolling'?'trials=[];':'records=[];'}`,context);
  let saves=0;
  for(let i=0;i<tours[t].steps.length;i++){
   vm.runInContext(`applyDemo(tours[${t}].steps[${i}]);if(tours[${t}].steps[${i}].tween)settings({[tours[${t}].steps[${i}].tween.id]:tours[${t}].steps[${i}].tween.to});`,context);
   if(tours[t].steps[i].save)saves++;
   if(kind==='rolling'){
    assert(vm.runInContext('Number.isFinite(elapsed)&&elapsed>=0&&elapsed<=model.duration+1e-8',context));
    assert(vm.runInContext('!running',context),'guided playback must not leave a second animation running');
   }else{
    assert(vm.runInContext('dayNumber>=0&&dayNumber<=30&&waterState.stored>=0&&cells.length===config().width*config().length',context));
   }
  }
  assert.equal(vm.runInContext(kind==='rolling'?'trials.length':'records.length',context),saves);
  // Seeking reconstructs earlier actions without adding saved rows.
  for(let i=0;i<tours[t].steps.length;i++)vm.runInContext(`applyDemo(tours[${t}].steps[${i}],{skipSave:true})`,context);
  assert.equal(vm.runInContext(kind==='rolling'?'trials.length':'records.length',context),saves);
 }
 if(kind==='rolling'){
  vm.runInContext('settings(defaults);settings({demoTime:1});const guidedEnd=RollingModel.at(model,elapsed);',context);
  assert.equal(vm.runInContext('guidedEnd.s===model.total',context),true);
 }
 assert(html.includes('value="sentence" selected'));
 assert(html.includes('guideCompactMinimize')&&html.includes('guideSeek')&&html.includes('value="3"'));
 console.log(`Passed ${tours.length} ${kind} tours: real model actions, bounded playback, notebook preservation, seek-safe saves, and guide controls.`);
}
