#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../activities/preprimary/robotics/wizbot-maxx/wizbot-academy/index.html'),'utf8');
const source=html.match(/<script id="wizbot-number-series">([\s\S]*?)<\/script>/)[1];
const ctx={};vm.createContext(ctx);vm.runInContext(source+'\nthis.series=WizbotSeries;',ctx);
for(const match of html.matchAll(/<script(?: id="wizbot-(?:number-series|code-language)")?>([\s\S]*?)<\/script>/g))if(match[1].trim())new vm.Script(match[1]);
const {questions,values,scale}=ctx.series;
// Independent rules reconstruct every given term as well as the missing one.
const affine=(first,multiplier,add)=>n=>{let v=first;for(let i=1;i<n;i++)v=v*multiplier+add;return v;};
const sumSquares=n=>n*(n+1)*(2*n+1)/6;
const rules=[n=>4*n,n=>3*2**(n-1),n=>n*n,n=>55-5*n,n=>n*n+1,
 n=>5+2*n*(n-1),n=>2*3**(n-1),n=>100-2*n*(n-1),n=>7+3*n*(n-1)/2,affine(1,2,1),
 n=>{let a=9,b=11;for(let i=1;i<n;i++)[a,b]=[b,a+b];return a;},n=>165+Math.floor((n-1)/2)*90+(n%2===0?30:0),n=>(22-n)*(23-n),affine(4,2,1),n=>n**3+1,
 affine(3,2,2),affine(2,2,1),affine(6,2,1),n=>n**3,n=>11+3*n*(n-1)/2,
 n=>1+sumSquares(n),n=>n**3+2,affine(5,2,1),n=>n**3+n*n,n=>1+sumSquares(n-1)];
assert.equal(questions.length,25);
for(let i=0;i<25;i++){
 const q=questions[i];assert.equal(q.id,i+1);assert.equal(q.level,6+Math.floor(i/5));
 assert.equal(q.terms.filter(x=>x===null).length,1);assert.equal(new Set(q.options).size,4);
 q.terms.forEach((v,j)=>assert.equal(v===null?q.options[q.answer]:v,rules[i](j+1),`Q${q.id}, term ${j+1}`));
 const prefix=values(q);assert.equal(prefix.length,q.terms.indexOf(null));assert.ok(prefix.every(t=>!t.candidate));
 for(let choice=0;choice<4;choice++){
  const trial=values(q,choice);assert.equal(trial.length,q.terms.length);
  const missing=trial.find(t=>t.candidate);assert.equal(missing.value,q.options[choice]);
  assert.equal(missing.index,q.terms.indexOf(null));assert.ok(trial.every(t=>t.value/scale(q)>0&&t.value/scale(q)<=6));
 }
}
console.log('Verified 25 series, all given terms and answers against independent rules, four trial paths per question, prefix masking and path scales.');
