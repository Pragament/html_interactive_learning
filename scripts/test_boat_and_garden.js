// Run with: node scripts/test_boat_and_garden.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function load(relative, name) {
 const html=fs.readFileSync(path.join(__dirname,'../activities',relative,'index.html'),'utf8');
 const script=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].find(m=>!m[1].includes('application/json'))[2];
 new vm.Script(script); // Validate the complete embedded application script, too.
 const start=script.indexOf(`const ${name}=(()=>{`),end=script.indexOf('\n})();',start)+6;
 return vm.runInNewContext(script.slice(start,end)+`;${name}`);
}
const boat=load('9/science/gravitation/design-a-floating-boat','BoatModel');
const garden=load('7/mathematics/perimeter-and-area/plan-a-school-garden','GardenModel');
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
let boatCases=0;
for(const material of Object.keys(boat.materials))for(const length of [20,50,80])for(const width of [10,25,40])for(const depth of [5,15,25])for(const thickness of [.2,.4,1.2])for(const density of [1,1.025])for(const cargo of [0,5,30]){
 const c={material,length,width,depth,thickness,density,cargo},m=boat.calculate(c);
 assert(m.hullMass>0&&m.inner>0&&m.hullVolume<m.outer);
 near(m.hullMass, m.hullVolume*boat.materials[material]);
 near(m.requiredVolume*density*9.8,m.weight);
 near(m.capacity+m.hullMass,density*m.outer);
 near(m.safeCapacity+m.hullMass,.8*density*m.outer);
 if(m.floating)assert(m.draft<depth&&m.weight<m.maxSupport);
 if(m.capacity>=0){const rim=boat.calculate({...c,cargo:m.capacity});assert(rim.atRim);assert(!rim.floating);}
 const saltier=boat.calculate({...c,density:1.1});assert(saltier.draft<m.draft);
 boatCases++;
}
const cells=Array(24).fill('vegetables').concat(Array(8).fill('flowers'),Array(8).fill('herbs'),Array(10).fill('path'),Array(30).fill('empty'));
const c={width:10,length:8,cells,climate:4,rain:1,efficiency:.9,soil:'loam',irrigation:200,sun:6};
const p=garden.plan(c);near(p.area,80);near(p.perimeter,36);near(p.planted,40);near(p.plants,216);near(p.dailyNeed,144);near(p.effectiveRain*p.planted,32);near(p.netIrrigation,112);near(p.grossIrrigation,112/.9);near(p.flowerShare,.2);
let gardenCases=0;
for(const soil of Object.keys(garden.soils))for(const irrigation of [0,50,200,1000])for(const rain of [0,2,8])for(const sun of [2,6,10]){
 const cfg={...c,soil,irrigation,rain,sun},plan=garden.plan(cfg),capacity=garden.soils[soil].capacity;
 let state={stored:capacity/2,progress:0};
 for(let day=0;day<30;day++){
  const next=garden.day(state,plan,cfg);
  assert(next.stored>=0&&next.stored<=capacity);assert(next.progress>=state.progress&&next.progress<=state.progress+1+1e-9);
  const incoming=state.stored*plan.planted+next.delivered+plan.effectiveRain*plan.planted;
  const outgoing=next.stored*plan.planted+(next.demand-next.stress)+next.drainage;
  near(incoming,outgoing);state=next;
 }
 gardenCases++;
}
const empty=garden.plan({...c,cells:Array(80).fill('empty')});near(empty.planted,0);near(empty.grossIrrigation,0);near(garden.day({stored:20,progress:0},empty,c).progress,0);
const steady=garden.day({stored:22.5,progress:5},p,{...c,irrigation:p.grossIrrigation});near(steady.stored,22.5);near(steady.stress,0);
const dry=garden.day({stored:0,progress:5},garden.plan({...c,rain:0}),{...c,irrigation:0});near(dry.progress,5);assert(dry.stress>0);
console.log(`Passed ${boatCases} hull configurations and ${gardenCases} month-long garden scenarios: displacement, freeboard, units, water conservation, storage bounds and growth constraints.`);
