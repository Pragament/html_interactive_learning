// Run with: node scripts/test_electronics_lab_modules_1_4.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const activityPath = path.join(__dirname, '../activities/6/science/how-things-work/electronics-lab-modules-1-4/index.html');

assert(fs.existsSync(activityPath), 'index.html exists');

const html = fs.readFileSync(activityPath, 'utf8');

// Verify activity metadata
const metaMatch = html.match(/<script type="application\/json" id="activity-metadata">([\s\S]*?)<\/script>/);
assert(metaMatch, 'Metadata script block found');
const meta = JSON.parse(metaMatch[1]);
assert.equal(meta.schemaVersion, 1);
assert.equal(meta.id, '6-science-how-things-work-electronics-lab-modules-1-4');
assert.equal(meta.order, 325);
assert.equal(meta.class, 'VI');
assert.deepEqual(meta.classes, ['V', 'VI']);
assert.equal(meta.subject, 'Science');
assert.equal(meta.topic, 'How Things Work');
assert.equal(meta.subtopic, null);
assert.equal(meta.title, 'Electronics Lab: Electricity and Circuits (Modules 1–4)');
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
assert(MODS[3], 'Module 3 defined');
assert(MODS[4], 'Module 4 defined');

// Verify section counts and quiz questions
for (let m = 1; m <= 4; m++) {
  assert.equal(MODS[m].sections.length, 5, `Module ${m} has 5 sections`);
  assert.equal(MODS[m].quiz.length, 10, `Module ${m} has 10 quiz questions`);
}

// Verify projects
assert.equal(MODS[1].projects.length, 0, 'Module 1 has 0 projects');
assert.equal(MODS[2].projects.length, 3, 'Module 2 has 3 mini-projects');
assert.equal(MODS[3].projects.length, 3, 'Module 3 has 3 mini-projects');
assert.equal(MODS[4].projects.length, 3, 'Module 4 has 3 mini-projects');
assert(PLAN && PLAN.length === 7, '7-module plan defined');

// Verify home page was rendered
assert(renderedHtml.includes('Smart Wire Connectivity Tester'), 'Home page rendered correctly');
for (let m = 1; m <= 4; m++) {
  assert(renderedHtml.includes(`Module ${m}`), `Module ${m} card in home page`);
}

// Test routing to Module 3 overview & section
context.location.hash = '#/m/3';
route();
assert(renderedHtml.includes('Meet the Electronic Components'), 'Module 3 overview rendered');

context.location.hash = '#/m/3/s/0';
route();
assert(renderedHtml.includes('The LED'), 'Module 3 Section 0 rendered');

// Test routing to Module 4 overview & section
context.location.hash = '#/m/4';
route();
assert(renderedHtml.includes('Become a Breadboard Expert'), 'Module 4 overview rendered');

context.location.hash = '#/m/4/s/0';
route();
assert(renderedHtml.includes('How a Breadboard Works'), 'Module 4 Section 0 rendered');

// Test routing to Teacher page
context.location.hash = '#/teacher';
route();
assert(renderedHtml.includes('Teacher page'), 'Teacher page rendered');

console.log('Passed Electronics Lab Modules 1-4 verification: metadata, embedding, data structures (M1-M4), router, and views.');
