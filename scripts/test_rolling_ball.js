// Run with: node scripts/test_rolling_ball.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '../activities/9/science/motion/investigate-a-rolling-ball/index.html'), 'utf8');
const source = html.match(/const RollingModel = \(\(\) => \{[\s\S]*?\n\}\)\(\);/)[0];
const model = vm.runInNewContext(source + '\nRollingModel;');
const near = (a, b, context) => assert(Math.abs(a - b) < 1e-8, `${context}: ${a} != ${b}`);
let cases = 0;
for (let h = 2; h <= 15; h++) {
  for (let l = 4; l <= 10; l++) {
    for (const resistance of [0, .015, .05, .12]) {
      const config = {height:h / 10, length:l / 2, mass:.2, resistance};
      const m = model.create(config);
      const heavy = model.create({...config, mass:.5});
      near(m.duration, heavy.duration, 'mass-independent time');
      near(m.total, heavy.total, 'mass-independent distance');
      near(heavy.initial / m.initial, 2.5, 'energy proportional to mass');
      let lastS = 0, lastLoss = 0;
      for (let i = 0; i <= 100; i++) {
        const p = model.at(m, m.duration * i / 100);
        for (const value of Object.values(p)) if (typeof value === 'number') assert(Number.isFinite(value));
        assert(p.v >= 0 && p.s >= lastS - 1e-8, 'ball must not move backwards');
        assert(p.loss >= lastLoss - 1e-8, 'dissipation must not decrease');
        near(p.potential + p.linear + p.rotation + p.loss, m.initial, 'energy balance');
        if (m.moving) {
          const rampTravel = Math.min(p.s, m.length), flatTravel = Math.max(0, p.s - m.length);
          const cos = Math.sqrt(1 - (m.height / m.length) ** 2);
          near(p.loss, m.mass * 9.8 * resistance * (cos * rampTravel + flatTravel), 'resistance work');
        }
        lastS = p.s; lastLoss = p.loss;
      }
      const end = model.at(m, m.duration + 50);
      near(end.s, m.total, 'end clamp');
      if (!m.moving) { near(end.s, 0, 'held position'); near(end.v, 0, 'held speed'); }
      else {
        const before = model.at(m, m.rampTime - 1e-10), after = model.at(m, m.rampTime);
        assert(Math.abs(before.v - after.v) < 1e-7, 'ramp/flat speed continuity');
        assert(Math.abs(before.s - after.s) < 1e-7, 'ramp/flat position continuity');
        if (m.outcome === 'Stopped') near(end.v, 0, 'stopped speed');
        else { near(end.s, m.length + 8, 'observation boundary'); assert(end.v > 0); }
        if (resistance === 0) { near(end.loss, 0, 'ideal energy conservation'); near(end.v ** 2, 10 / 7 * 9.8 * m.height, 'solid sphere speed'); }
      }
      cases++;
    }
  }
}
const smooth = model.create({height:.8,length:3,mass:.2,resistance:.015});
const rough = model.create({height:.8,length:3,mass:.2,resistance:.12});
assert(smooth.total > rough.total && smooth.peak > rough.peak, 'more resistance reduces range and peak speed');
assert(!model.create({height:.2,length:5,mass:.2,resistance:.12}).moving, 'insufficient slope remains at rest');
console.log(`Passed ${cases} configurations: motion continuity, energy balance, resistance work, mass independence, ideal rolling, stopping and observation boundaries.`);
