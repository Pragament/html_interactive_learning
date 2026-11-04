// Run with: node scripts/test_wire_continuity_tester.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const activityPath = path.join(__dirname, '../activities/6/science/how-things-work/build-a-wire-continuity-tester/index.html');
const imagePath = path.join(__dirname, '../activities/6/science/how-things-work/build-a-wire-continuity-tester/circuit.webp');

// Verify files exist
assert(fs.existsSync(activityPath), 'index.html exists');
assert(fs.existsSync(imagePath), 'circuit.webp exists');
assert(fs.statSync(imagePath).size > 100000, 'circuit.webp has valid content');

const html = fs.readFileSync(activityPath, 'utf8');

// Verify activity metadata
const metaMatch = html.match(/<script type="application\/json" id="activity-metadata">([\s\S]*?)<\/script>/);
assert(metaMatch, 'Metadata script block found');
const meta = JSON.parse(metaMatch[1]);
assert.equal(meta.schemaVersion, 1);
assert.equal(meta.id, '6-science-how-things-work-build-a-wire-continuity-tester');
assert.equal(meta.order, 323);
assert.equal(meta.class, 'VI');
assert.deepEqual(meta.classes, ['V', 'VI']);
assert.equal(meta.subject, 'Science');
assert.equal(meta.topic, 'How Things Work');
assert.equal(meta.subtopic, null);
assert.equal(meta.title, 'Build a Wire Continuity Tester');
assert.equal(meta.activityType, 'simulation');
assert.equal(meta.status, 'active');

// Verify CSS is embedded and does not violate stylesheet link rules
assert(!html.match(/^\s*<link\b[^>]+rel=["']stylesheet["']/gim), 'No CSS link tags');
assert(!html.match(/^\s*<link\b[^>]+href=["'][^"']+["'][^>]+rel=["']stylesheet["']/gim), 'No CSS link tags with href first');
assert(!html.match(/<script\b[^>]*\bsrc\s*=/i), 'No external script sources');

// Verify all 11 sections are present
const expectedSections = ['intro', 'safety', 'parts', 'how', 'build', 'sim', 'predict', 'notebook', 'fix', 'quiz', 'summary'];
for (const sec of expectedSections) {
  assert(html.includes(`id="${sec}"`), `Section #${sec} present in DOM`);
}

// Verify JavaScript syntax
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert(scriptMatch, 'Inline JavaScript found');
new vm.Script(scriptMatch[1]);

// Verify quiz questions data
assert(scriptMatch[1].includes("const QZ="), 'Quiz questions defined');
assert(scriptMatch[1].includes("const FIX="), 'Troubleshooting data defined');
assert(scriptMatch[1].includes("const SC="), 'Prediction scenarios defined');

console.log('Passed Wire Continuity Tester verification: metadata, assets, sections, embedded CSS/JS and logic.');

