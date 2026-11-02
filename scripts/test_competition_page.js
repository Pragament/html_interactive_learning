const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');

const filePath = path.join(__dirname, '../activities/preprimary/robotics/wizbot-maxx/wizbot-academy/competition.html');
assert.ok(fs.existsSync(filePath), 'competition.html must exist');

const html = fs.readFileSync(filePath, 'utf8');
const scriptMatches = [...html.matchAll(/<script(?:\s+id="[^"]*")?>([\s\S]*?)<\/script>/g)];
assert.equal(scriptMatches.length, 3, 'Must have 3 script tags: code-language, workshop-model, and arena UI controller');

const ctx = {
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  TextEncoder,
  Math,
  Number,
  String,
  Boolean,
  Array,
  Object,
  JSON
};
vm.createContext(ctx);

// Run code language
vm.runInContext(scriptMatches[0][1], ctx);
assert.ok(ctx.WizbotCode, 'WizbotCode must be defined');
assert.equal(ctx.WizbotCode.examples.length, 50, 'All 50 examples must be present');

// Run workshop model
vm.runInContext(scriptMatches[1][1], ctx);
vm.runInContext('this.WizbotWorkshop = WizbotWorkshop;', ctx);
assert.ok(ctx.WizbotWorkshop, 'WizbotWorkshop must be defined');
assert.equal(ctx.WizbotWorkshop.statements('repeat(4){ forward(); right(); }'), 3);

// Test scoring engine
(async () => {
  const example = ctx.WizbotCode.examples[0];
  const refRoute = await ctx.WizbotWorkshop.trace(example.code, example.input, example.mode, 1, 90);
  const score = ctx.WizbotWorkshop.score(refRoute, refRoute, example.code, ctx.WizbotWorkshop.statements(example.code), 15);
  assert.equal(score.valid, true, 'Route must match itself');
  assert.ok(score.total > 900, 'Score should be high for match with short coding time');
  console.log('Passed competition page verification! Score test:', score.total);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
