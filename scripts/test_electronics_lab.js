// Run with: node scripts/test_electronics_lab.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const activityPath = path.join(__dirname, '../activities/6/science/how-things-work/electronics-lab-modules-1-2/index.html');

assert(fs.existsSync(activityPath), 'index.html exists');

const html = fs.readFileSync(activityPath, 'utf8');

// Verify activity metadata
const metaMatch = html.match(/<script type="application\/json" id="activity-metadata">([\s\S]*?)<\/script>/);
assert(metaMatch, 'Metadata script block found');
const meta = JSON.parse(metaMatch[1]);
assert.equal(meta.schemaVersion, 1);
assert.equal(meta.id, '6-science-how-things-work-electronics-lab-modules-1-2');
assert.equal(meta.order, 324);
assert.equal(meta.class, 'VI');
assert.deepEqual(meta.classes, ['V', 'VI']);
assert.equal(meta.subject, 'Science');
assert.equal(meta.topic, 'How Things Work');
assert.equal(meta.subtopic, null);
assert.equal(meta.title, 'Electronics Lab: Electricity and Circuits (Modules 1–2)');
assert.equal(meta.activityType, 'simulation');
assert.equal(meta.status, 'active');

// Verify embedded CSS and JS (no external forbidden links)
assert(!html.match(/^\s*<link\b[^>]+rel=["']stylesheet["']/gim), 'No CSS link tags');
assert(!html.match(/^\s*<link\b[^>]+href=["'][^"']+["'][^>]+rel=["']stylesheet["']/gim), 'No CSS link tags with href first');
assert(!html.match(/<script\b[^>]*\bsrc\s*=/i), 'No external script sources');

// Verify JavaScript contents and basic execution
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert(scriptMatch, 'Inline JavaScript found');

// Run in a simulated environment
let renderedHtml = '';
const fakeElement = {
  innerHTML: '',
  set innerHTML(val) { renderedHtml = val; },
  get innerHTML() { return renderedHtml; },
  focus() {},
  hidden: false
};
const context = {
  document: {
    getElementById(id) {
      if (id === 'app') return fakeElement;
      return null;
    },
    querySelectorAll() { return []; }
  },
  location: { hash: '' },
  localStorage: {
    data: {},
    getItem(k) { return this.data[k] || null; },
    setItem(k, v) { this.data[k] = String(v); },
    removeItem(k) { delete this.data[k]; }
  },
  addEventListener() {},
  window: { scrollTo() {} },
  alert() {},
  confirm() { return true; },
  console
};

vm.createContext(context);
vm.runInContext(scriptMatch[1], context);

const MODS = vm.runInContext('MODS', context);
const PLAN = vm.runInContext('PLAN', context);
const route = () => vm.runInContext('route()', context);

// Verify data structures in context
assert(MODS[1], 'Module 1 defined');
assert(MODS[2], 'Module 2 defined');
assert.equal(MODS[1].sections.length, 5, 'Module 1 has 5 sections');
assert.equal(MODS[1].quiz.length, 10, 'Module 1 has 10 quiz questions');
assert.equal(MODS[2].sections.length, 5, 'Module 2 has 5 sections');
assert.equal(MODS[2].quiz.length, 10, 'Module 2 has 10 quiz questions');
assert.equal(MODS[2].projects.length, 3, 'Module 2 has 3 mini-projects');
assert(PLAN && PLAN.length === 7, '7-module plan defined');

// Verify home page was rendered
assert(renderedHtml.includes('Smart Wire Connectivity Tester'), 'Home page rendered correctly');
assert(renderedHtml.includes('Module 1'), 'Module 1 card in home page');
assert(renderedHtml.includes('Module 2'), 'Module 2 card in home page');

// Test routing to Module 1 overview
context.location.hash = '#/m/1';
route();
assert(renderedHtml.includes('Discover the World of Electricity'), 'Module 1 overview rendered');

// Test routing to Module 1 Section 0
context.location.hash = '#/m/1/s/0';
route();
assert(renderedHtml.includes('What is Electricity?'), 'Module 1 Section 0 rendered');
assert(renderedHtml.includes('Definition'), 'Definition block rendered');

// Test routing to Teacher page
context.location.hash = '#/teacher';
route();
assert(renderedHtml.includes('Teacher page'), 'Teacher page rendered');

console.log('Passed Electronics Lab verification: metadata, embedding, data structures, router, and view rendering.');
