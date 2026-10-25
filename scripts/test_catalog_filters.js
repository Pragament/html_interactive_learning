// Run with: node scripts/test_catalog_filters.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const labels = html.split('// Canonical catalog labels:')[1].split('// End canonical catalog labels.')[0];
function source(name) {
  const start = html.indexOf(`    function ${name}(`);
  const end = html.indexOf('\n    function ', start + 1);
  return html.slice(start, end);
}
const context = vm.createContext({});
vm.runInContext(labels.slice(labels.indexOf('\n')) + '\n' + ['sortText', 'getOptions', 'hierarchyValues', 'matchesFilters', 'isAvailable'].map(source).join('\n') + `
const state = {availableOnly: true, className: 'all', subject: 'all', topic: 'all', subtopic: 'all', search: ''};
let activities = [];
`, context);
const run = code => vm.runInContext(code, context);
const array = code => Array.from(run(code));
run(`activities = [
 {className:'6',subject:'science',path:'a',topic:'Motion'},
 {className:'VI',subject:'Science',path:'b',topic:'Plants'},
 {className:'  vi ',subject:' SCIENCE ',path:'c',topic:'Food'},
 {className:'7',subject:'mathematics',path:'d',topic:'Numbers'},
 {className:'VII',subject:'Mathematics',path:'e',topic:'Shapes'},
 {className:'IX',subject:'Robotics',path:'f'},
 {className:'9',subject:'robotics',path:'g'},
 {className:'Preprimary',subject:'science',path:'h'},
 {className:'III',subject:'Science',path:''}
].map(a=>({...a,className:normalizeClass(a.className),subject:normalizeSubject(a.subject)}));`);
assert.deepEqual(array(`getOptions('className',{})`), ['Preprimary','VI','VII','IX']);
assert.deepEqual(array(`getOptions('subject',{})`), ['Mathematics','Robotics','Science']);
assert.deepEqual(array(`getOptions('topic',{className:'VI',subject:'Science'})`), ['Food','Motion','Plants']);
run(`state.className='VI';state.subject='Science';`);
assert.equal(run('activities.filter(matchesFilters).length'), 3, 'all aliases remain filterable');
assert.deepEqual(array(`hierarchyValues('subject',{className:'VII'})`), ['Mathematics']);
run('state.availableOnly=false');
assert.deepEqual(array(`getOptions('className',{})`), ['Preprimary','III','VI','VII','IX']);
assert.deepEqual(array(`['X','IX','VI','VIII','VII','III','Preprimary'].sort(sortClasses)`), ['Preprimary','III','VI','VII','VIII','IX','X']);
assert.equal(run(`normalizeClass('Class 10')`), 'X');
assert.equal(run(`normalizeClass('pre-primary')`), 'Preprimary');
assert.equal(run(`normalizeSubject('ict')`), 'ICT');
assert.equal(run(`normalizeSubject('social   science')`), 'Social Science');
assert.equal(run('normalizeClass(null)'), 'Unspecified');
console.log('Passed mixed-label deduplication, dependent filters, matching, prompt hierarchy, availability and class ordering.');

run(`const taxonomyRecords = [
 {topic:'light',subtopic:'reflection-of-light'},
 {topic:'Light',subtopic:'Reflection of Light'},
 {topic:' LIGHT ',subtopic:' reflection  of light '},
 {topic:'acids-bases-and-salts',subtopic:null},
 {topic:'Acids, Bases and Salts',subtopic:''},
 {topic:'coordinate-geometry',subtopic:'hcf-lcm'},
 {topic:'Motion',subtopic:'HCF / LCM'}
];
const topics = buildTaxonomyLabels(taxonomyRecords,'topic');
const subtopics = buildTaxonomyLabels(taxonomyRecords,'subtopic');
activities = taxonomyRecords.map(a=>({...a,path:'test',className:'VI',subject:'Science',topic:normalizeTaxonomy(a.topic,topics,'Unspecified'),subtopic:normalizeTaxonomy(a.subtopic,subtopics)}));
state.availableOnly=true;state.className='VI';state.subject='Science';state.topic='Light';state.subtopic='Reflection of Light';`);
assert.deepEqual(array(`getOptions('topic',{})`), ['Acids, Bases and Salts','Coordinate Geometry','Light','Motion']);
assert.deepEqual(array(`getOptions('subtopic',{topic:'Light'})`), ['Reflection of Light']);
assert.equal(run('activities.filter(matchesFilters).length'), 3, 'all topic and subtopic aliases remain filterable');
assert.deepEqual(array(`hierarchyValues('subtopic',{topic:'Light'})`), ['Reflection of Light']);
assert.equal(run(`normalizeTaxonomy(null,subtopics)`), '', 'missing subtopics remain empty');
assert.equal(run(`normalizeTaxonomy('hcf-lcm',subtopics)`), 'HCF / LCM', 'preserve acronym labels');
console.log('Passed topic/subtopic casing, whitespace, slug aliases, dependent filtering and prompt hierarchy.');
const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, '../list.json'), 'utf8'));
const rolling = catalog.activities.filter(a => a.id === '9-science-motion-investigate-a-rolling-ball');
assert.equal(rolling.length, 1, 'one shared catalog entry');
assert.deepEqual(rolling[0].classes, ['VI','VII','VIII','IX','X']);
context.sharedActivity = rolling[0];
run(`activities = [{className: normalizeClass(sharedActivity.class), classNames:sharedActivity.classes.map(normalizeClass), subject:sharedActivity.subject, topic:sharedActivity.topic, path:sharedActivity.activity_path}];state.topic='all';state.subtopic='all';state.subject='Science';`);
for (const level of ['VI','VII','VIII','IX','X']) {
  context.selectedClass = level;
  run('state.className=selectedClass');
  assert.equal(run('activities.filter(matchesFilters).length'), 1, `visible for ${level}`);
  assert.deepEqual(array(`getOptions('subject',{className:state.className})`), ['Science']);
  assert.deepEqual(array(`hierarchyValues('topic',{className:state.className})`), ['Motion']);
}
run(`state.className='III'`);
assert.equal(run('activities.filter(matchesFilters).length'), 0);
assert.deepEqual(array(`getOptions('className',{})`), ['VI','VII','VIII','IX','X']);
console.log('Passed single-entry multi-class visibility and dependent options for Classes VI–X.');
for (const id of ['9-science-gravitation-design-a-floating-boat','7-mathematics-perimeter-and-area-plan-a-school-garden']) {
 const entries=catalog.activities.filter(a=>a.id===id);assert.equal(entries.length,1);
 const entry=entries[0];context.sharedEntry=entry;
 run(`activities=[{className:normalizeClass(sharedEntry.class),classNames:sharedEntry.classes.map(normalizeClass),subject:normalizeSubject(sharedEntry.subject),subjectNames:sharedEntry.subjects.map(normalizeSubject),topic:sharedEntry.topic,path:sharedEntry.activity_path}];state.topic='all';state.subtopic='all';`);
 for (const level of entry.classes)for(const subject of entry.subjects){context.selectedClass=level;context.selectedSubject=subject;run('state.className=selectedClass;state.subject=selectedSubject');assert.equal(run('activities.filter(matchesFilters).length'),1,`${id}: ${level}/${subject}`);assert(array(`getOptions('subject',{className:state.className})`).includes(subject));assert(array(`hierarchyValues('topic',{className:state.className,subject:state.subject})`).includes(entry.topic));}
}
console.log('Passed new activities under every supported class and subject combination.');
