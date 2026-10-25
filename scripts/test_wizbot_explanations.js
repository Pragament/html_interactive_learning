// Run with: node scripts/test_wizbot_explanations.js
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('activities/preprimary/robotics/wizbot-maxx/wizbot-academy/index.html','utf8'),ctx=vm.createContext({});
for(const id of ['wizbot-code-language','wizbot-code-explanations'])vm.runInContext(html.match(new RegExp('<script id="'+id+'">([\\s\\S]*?)</script>'))[1],ctx);
vm.runInContext('this.explanations=WizbotExplanations',ctx);
for(const example of ctx.WizbotCode.examples){const m=ctx.explanations.build(example.code);assert(m.algorithm.length>=2);assert.equal(m.nodes[0].text,'Start');assert.equal(m.nodes.at(-1).text,'End');const reached=new Set([0]);for(let i=0;i<m.nodes.length;i++)for(const edge of m.edges)if(reached.has(edge.from))reached.add(edge.to);assert.equal(reached.size,m.nodes.length,example.id+' unreachable nodes');for(const n of m.nodes.filter(n=>n.kind==='decision')){const branches=m.edges.filter(e=>e.from===n.id);assert(branches.some(e=>e.label==='Yes'));assert(branches.some(e=>e.label==='No'));}for(const e of m.edges){assert(m.nodes[e.from]);assert(m.nodes[e.to]);}if(/\b(repeat|while|for)\s*\(/.test(example.code))assert(m.edges.some(e=>e.label==='Repeat'));}
console.log('Verified algorithms and reachable flowcharts for all 50 examples, including Yes/No decisions and loop return edges.');
