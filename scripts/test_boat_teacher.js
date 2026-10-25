// Run with: node scripts/test_boat_teacher.js
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../activities/9/science/gravitation/design-a-floating-boat/index.html'),'utf8');
const script=html.match(/<script id="boat-teacher-script">([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const Engine=vm.runInNewContext(script.slice(script.indexOf('class BoatTourEngine'),script.indexOf('// End guided-tour engine.'))+'\nBoatTourEngine;');
const tourSource=script.slice(script.indexOf(' const defaults='),script.indexOf(' function settings('));
const tours=vm.runInNewContext(tourSource+'\ntours;');
const main=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].find(m=>!m[1].includes('application/json')&&!m[1].includes('boat-teacher-script'))[2];
const modelSource=main.slice(main.indexOf('const BoatModel='),main.indexOf('\nconst paths='));
const model=vm.runInNewContext(modelSource+'\nBoatModel;');
class Clock {
 constructor(){this.now=0;this.next=0;this.jobs=new Map();}
 set(fn,ms){const id=++this.next;this.jobs.set(id,{at:this.now+ms,fn});return id;}
 clear(id){this.jobs.delete(id);}
 advance(ms){const end=this.now+ms;let limit=100000;while(limit--){const item=[...this.jobs].filter(([,job])=>job.at<=end).sort((a,b)=>a[1].at-b[1].at||a[0]-b[0])[0];if(!item)break;const[id,job]=item;this.jobs.delete(id);this.now=job.at;job.fn(this.now);}assert(limit>0,'scheduler must settle');this.now=end;}
}
function harness(audio=false){
 const clock=new Clock(),log={scenes:[],words:[],saved:[],finished:0,locked:false,errors:0},speechJobs=new Set();let config={length:50,width:25,depth:15,thickness:.4,material:'aluminium',cargo:5,liquid:1};
 const host={setTimeout:(fn,ms)=>clock.set(fn,ms),clearTimeout:id=>clock.clear(id),requestFrame:fn=>clock.set(fn,16),cancelFrame:id=>clock.clear(id),cancelSpeech(){speechJobs.forEach(id=>clock.clear(id));speechJobs.clear();},audioEnabled:()=>audio,wordDelay:()=>10,
 speakWord(word,start,end,error){log.lastSpeech={start,end,error};speechJobs.add(clock.set(start,1));speechJobs.add(clock.set(end,20));return {};},audioFailed(){audio=false;log.errors++;},
 begin(){},scene(step,index){log.scenes.push(index);},apply(step,options={}){Object.assign(config,step.set||{});if(step.tween)config[step.tween.id]=step.tween.from;if(step.save&&!options.skipSave)log.saved.push({...config});const m=model.calculate({...config,density:config.liquid});assert(m.hullMass>0&&m.requiredVolume>0);},lock(){log.locked=true;},release(){log.locked=false;},tween(spec,fraction){config[spec.id]=spec.from+(spec.to-spec.from)*fraction;},word(index){log.words.push(index);},pause(){},stopped(){},finished(){log.finished++;}};
 return {engine:new Engine(host),clock,log,host,get config(){return config;}};
}
// All authored tours finish autonomously, including all actions and demo saves.
for(const tour of tours){const h=harness();h.engine.start(tour);h.clock.advance(300000);assert(!h.engine.active);assert.equal(h.log.finished,1,tour.id);assert.equal(h.log.scenes.length,tour.steps.length);assert.equal(h.log.saved.length,tour.steps.filter(s=>s.save).length);assert(!h.log.locked);assert.equal(h.clock.jobs.size,0);}
const sample={title:'Lifecycle',steps:[{text:'Watch the cargo change.',tween:{id:'cargo',from:0,to:20}},{text:'The design is saved.',save:true}]};
// Pausing freezes speech and motion; resuming continues the same scene.
let h=harness(true);h.engine.start(sample);h.clock.advance(800);h.engine.pause();const frozen=h.config.cargo,word=h.engine.word;h.clock.advance(5000);assert.equal(h.config.cargo,frozen);assert.equal(h.engine.word,word);assert(h.log.locked);h.engine.resume();h.clock.advance(10000);assert.equal(h.log.finished,1);assert(!h.log.locked);
// Stale callbacks and scheduled motion cannot revive a stopped tour.
h=harness(true);h.engine.start(sample);h.clock.advance(10);const stale=h.log.lastSpeech;h.engine.stop();const stopped=h.config.cargo;stale.start();stale.end();stale.error();h.clock.advance(10000);assert.equal(h.config.cargo,stopped);assert(!h.engine.active);assert.equal(h.log.saved.length,0);assert.equal(h.clock.jobs.size,0);
// Switching tours cancels old scenes and starts a clean run.
h=harness(true);h.engine.start(sample);h.clock.advance(50);h.engine.start({title:'Replacement',steps:[{text:'Only this scene.',set:{cargo:2}}]});h.clock.advance(10000);assert.equal(h.log.finished,1);assert.equal(h.config.cargo,2);assert.equal(h.log.saved.length,0);
// Speech failure falls back to timed captions without stalling or requiring a click.
h=harness(true);h.host.speakWord=(word,start,end,error)=>{h.clock.set(error,1);return {};};h.engine.start(sample);h.clock.advance(15000);assert.equal(h.log.errors,1);assert.equal(h.log.finished,1);
// A nonresponsive speech engine is also handled, and exact word starts drive highlighting.
h=harness(true);h.host.speakWord=()=>({});h.engine.start({title:'Voice watchdog',steps:[{text:'Hello boat.'}]});h.clock.advance(10000);assert.equal(h.log.errors,1);assert.equal(h.log.finished,1);
h=harness(true);h.engine.start({title:'Word sync',steps:[{text:'One two three.'}]});assert.equal(h.log.words.length,0);h.clock.advance(1);assert.deepEqual(h.log.words,[0]);h.clock.advance(20);assert.deepEqual(h.log.words,[0,1]);h.clock.advance(5000);assert.deepEqual(h.log.words,[0,1,2]);assert.equal(h.log.finished,1);
console.log(`Passed ${tours.length} complete tours, word-start highlighting, pause/resume, stop, replay/replacement, voice fallback, watchdog and stale-callback cancellation.`);

// Seeking restores prior scene settings without replaying saves and preserves pause.
h=harness();h.host.restore=(tour,index)=>{for(let i=0;i<index;i++){const step=tour.steps[i];h.host.apply({...step,save:false});if(step.tween)h.host.tween(step.tween,1);}};
const seekTour={title:'Seek',steps:[{text:'Start here.',set:{cargo:0}},{text:'Add a load slowly.',tween:{id:'cargo',from:0,to:20}},{text:'Save our design.',save:true}]};
h.engine.start(seekTour);h.engine.pause();h.engine.seek(50);assert.equal(h.engine.index,1);assert(h.engine.paused);assert.equal(h.config.cargo,10);const seekFrozen=h.config.cargo;h.clock.advance(10000);assert.equal(h.config.cargo,seekFrozen);h.engine.seek(90);assert.equal(h.log.saved.length,0,'seeking must not add notebook rows');h.engine.seek(0);assert.equal(h.config.cargo,0);h.engine.resume();h.clock.advance(20000);assert.equal(h.log.saved.length,1);
// A full scene is sent as one utterance; boundary indices update individual words.
h=harness(true);let phrase;
h.host.speakPhrase=(words,onWord,onEnd,onError)=>{phrase={words,onWord,onEnd,onError};return {};};
h.engine.start({title:'Continuous narration',steps:[{text:'One continuous passage.'}]});assert.deepEqual(Array.from(phrase.words),['One','continuous','passage.']);phrase.onWord(1);assert.equal(h.engine.word,1);h.engine.pause();const oldPhrase=phrase;oldPhrase.onEnd();assert(h.engine.active);h.engine.resume();assert.deepEqual(Array.from(phrase.words),['continuous','passage.']);phrase.onEnd();h.clock.advance(1000);assert.equal(h.log.finished,1);
console.log('Passed seek reconstruction, paused scrubbing, no duplicate saves, continuous utterances and word-boundary resume.');

// Explicit modes select the correct speech route and can switch mid-scene.
h=harness(true);let selectedMode='word',phraseCalls=0;
h.host.narrationMode=()=>selectedMode;
h.host.speakPhrase=(words,onWord,onEnd)=>{phraseCalls++;return {};};
h.engine.start({title:'Mode selection',steps:[{text:'Choose a narration mode.'}]});h.clock.advance(21);assert.equal(phraseCalls,0,'word mode must not speak a whole phrase');assert.deepEqual(h.log.words,[0,1]);selectedMode='continuous';h.engine.voiceChanged();assert.equal(phraseCalls,1);h.engine.stop();
assert(!script.includes('const estimatedWord='),'continuous speech must not guess word timings');
assert(script.includes('u.onstart=start'),'word highlighting must follow speech start');
assert(html.includes('value="sentence" selected'),'sentence mode is the default');
console.log('Passed narration mode selection, live switching and removal of estimated speech highlighting.');

// Sentence narration speaks and highlights a full sentence as one utterance.
h=harness(true);const sentences=[];let sentenceCallbacks;
h.host.narrationMode=()=> 'sentence';h.host.speakSentence=(words,start,end,error)=>{sentences.push(Array.from(words).join(' '));sentenceCallbacks={start,end,error};return {};};
h.engine.start({title:'Sentences',steps:[{text:'Welcome aboard. Watch the boat! Does it float?'}]});
assert.deepEqual(sentences,['Welcome aboard.']);sentenceCallbacks.start();assert.equal(h.engine.word,0);sentenceCallbacks.end();assert.deepEqual(sentences,['Welcome aboard.','Watch the boat!']);sentenceCallbacks.start();assert.equal(h.engine.word,2);h.engine.pause();h.engine.resume();assert.equal(sentences.at(-1),'Watch the boat!','resume replays the current sentence');sentenceCallbacks.end();assert.equal(sentences.at(-1),'Does it float?');sentenceCallbacks.end();h.clock.advance(1000);assert.equal(h.log.finished,1);
const range=Engine.sentenceRange(['Hello','there.','A','new','sentence!'],3);assert.equal(range.start,2);assert.equal(range.end,4);
console.log('Passed sentence grouping, one utterance per sentence, highlight range, sentence resume and default mode.');
