const tabs = ['parallelogram', 'triangle', 'trapezium'];
let currentTab = 0;
let paraState = 'idle';
let triState = 'idle';
let trapState = 'idle';
let quizAnswered = 0;
let quizScore = 0;

const svgPara = document.getElementById('svgPara');
const svgTri = document.getElementById('svgTri');
const svgTrap = document.getElementById('svgTrap');
const formulaPara = document.getElementById('formulaPara');
const formulaTri = document.getElementById('formulaTri');
const formulaTrap = document.getElementById('formulaTrap');

function showTab(index) {
  tabs.forEach((t, i) => {
    const content = document.getElementById('tab-' + t);
    const step = document.getElementById('step' + i);
    if (i === index) {
      content.classList.remove('hidden');
      step.classList.add('active');
    } else {
      content.classList.add('hidden');
      if (i < index) step.classList.add('done');
      step.classList.remove('active');
    }
  });
  document.getElementById('prevBtn').disabled = index === 0;
  document.getElementById('nextBtn').textContent = index === tabs.length - 1 ? 'Quiz →' : 'Next →';
  currentTab = index;
}

function makeSVGNS(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function clearSVG(svg) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
}

function initParallelogram() {
  clearSVG(svgPara);
  paraState = 'idle';
  formulaPara.classList.remove('visible');

  const bg = makeSVGNS('rect', { x: 0, y: 0, width: 400, height: 260, fill: '#0f2320' });
  svgPara.appendChild(bg);

  const pts = '80,200 280,200 320,70 120,70';
  const shape = makeSVGNS('polygon', {
    points: pts, fill: 'rgba(20,184,166,0.25)',
    stroke: '#14b8a6', 'stroke-width': 2.5,
    id: 'paraShape'
  });
  svgPara.appendChild(shape);

  const labelB = makeSVGNS('text', { x: 175, y: 224, fill: '#ffd700', 'font-size': 13, 'font-weight': 'bold', 'font-family': 'Outfit,sans-serif' });
  labelB.textContent = 'base (b)';
  svgPara.appendChild(labelB);

  const h1 = makeSVGNS('line', { x1: 80, y1: 200, x2: 80, y2: 70, stroke: '#fb7185', 'stroke-width': 1.5, 'stroke-dasharray': '5,4' });
  const h2 = makeSVGNS('line', { x1: 80, y1: 70, x2: 120, y2: 70, stroke: '#fb7185', 'stroke-width': 1.5, 'stroke-dasharray': '5,4' });
  svgPara.appendChild(h1);
  svgPara.appendChild(h2);

  const labelH = makeSVGNS('text', { x: 50, y: 140, fill: '#fb7185', 'font-size': 12, 'font-family': 'Outfit,sans-serif' });
  labelH.textContent = 'h';
  svgPara.appendChild(labelH);

  const hint = makeSVGNS('text', { x: 200, y: 148, fill: 'rgba(255,255,255,0.35)', 'font-size': 12, 'font-family': 'Outfit,sans-serif', 'text-anchor': 'middle' });
  hint.textContent = 'Press "Cut & Rearrange"';
  svgPara.appendChild(hint);
}

function animateParallelogram() {
  if (paraState !== 'idle') return;
  paraState = 'running';
  clearSVG(svgPara);

  const bg = makeSVGNS('rect', { x: 0, y: 0, width: 400, height: 260, fill: '#0f2320' });
  svgPara.appendChild(bg);

  const mainRect = makeSVGNS('rect', {
    x: 80, y: 70, width: 200, height: 130,
    fill: 'rgba(20,184,166,0.3)', stroke: '#14b8a6', 'stroke-width': 2.5,
    id: 'rectMain'
  });
  svgPara.appendChild(mainRect);

  const triCut = makeSVGNS('polygon', {
    points: '80,70 120,70 80,200',
    fill: 'rgba(251,113,133,0.4)', stroke: '#fb7185', 'stroke-width': 2,
    id: 'triCut'
  });
  svgPara.appendChild(triCut);

  const label1 = makeSVGNS('text', { x: 200, y: 148, fill: '#14b8a6', 'font-size': 14, 'font-weight': 'bold', 'font-family': 'Outfit,sans-serif', 'text-anchor': 'middle' });
  label1.textContent = '= Rectangle!';
  svgPara.appendChild(label1);

  const label2 = makeSVGNS('text', { x: 200, y: 170, fill: 'rgba(255,255,255,0.5)', 'font-size': 11, 'font-family': 'Outfit,sans-serif', 'text-anchor': 'middle' });
  label2.textContent = 'Area = base × height';
  svgPara.appendChild(label2);

  const moved = makeSVGNS('text', { x: 84, y: 145, fill: '#fb7185', 'font-size': 10, 'font-family': 'Outfit,sans-serif' });
  moved.textContent = '→ moved';
  svgPara.appendChild(moved);

  setTimeout(() => {
    formulaPara.classList.add('visible');
    paraState = 'done';
  }, 600);
}

function initTriangle() {
  clearSVG(svgTri);
  triState = 'idle';
  formulaTri.classList.remove('visible');

  const bg = makeSVGNS('rect', { x: 0, y: 0, width: 400, height: 260, fill: '#0f2320' });
  svgTri.appendChild(bg);

  const tri = makeSVGNS('polygon', {
    points: '80,200 320,200 200,70',
    fill: 'rgba(20,184,166,0.25)', stroke: '#14b8a6', 'stroke-width': 2.5
  });
  svgTri.appendChild(tri);

  const h = makeSVGNS('line', { x1: 200, y1: 200, x2: 200, y2: 70, stroke: '#fb7185', 'stroke-width': 1.5, 'stroke-dasharray': '5,4' });
  svgTri.appendChild(h);

  const lb = makeSVGNS('text', { x: 185, y: 224, fill: '#ffd700', 'font-size': 13, 'font-weight': 'bold', 'font-family': 'Outfit,sans-serif' });
  lb.textContent = 'b';
  svgTri.appendChild(lb);

  const lh = makeSVGNS('text', { x: 208, y: 140, fill: '#fb7185', 'font-size': 13, 'font-weight': 'bold', 'font-family': 'Outfit,sans-serif' });
  lh.textContent = 'h';
  svgTri.appendChild(lh);

  const hint = makeSVGNS('text', { x: 200, y: 248, fill: 'rgba(255,255,255,0.3)', 'font-size': 11, 'font-family': 'Outfit,sans-serif', 'text-anchor': 'middle' });
  hint.textContent = 'Press "Double It!" to see two triangles make a parallelogram';
  svgTri.appendChild(hint);
}

function animateTriangle() {
  if (triState !== 'idle') return;
  triState = 'running';
  clearSVG(svgTri);

  const bg = makeSVGNS('rect', { x: 0, y: 0, width: 400, height: 260, fill: '#0f2320' });
  svgTri.appendChild(bg);

  const t1 = makeSVGNS('polygon', {
    points: '60,200 300,200 180,70',
    fill: 'rgba(20,184,166,0.3)', stroke: '#14b8a6', 'stroke-width': 2.5
  });
  svgTri.appendChild(t1);

  const t2 = makeSVGNS('polygon', {
    points: '300,200 420,70 180,70',
    fill: 'rgba(251,113,133,0.3)', stroke: '#fb7185', 'stroke-width': 2.5, 'stroke-dasharray': '6,3'
  });
  svgTri.appendChild(t2);

  const eq = makeSVGNS('text', { x: 200, y: 148, fill: '#ffd700', 'font-size': 13, 'font-weight': 'bold', 'font-family': 'Outfit,sans-serif', 'text-anchor': 'middle' });
  eq.textContent = 'Two ▲ = Parallelogram';
  svgTri.appendChild(eq);

  const l1 = makeSVGNS('text', { x: 145, y: 175, fill: '#14b8a6', 'font-size': 12, 'font-family': 'Outfit,sans-serif' });
  l1.textContent = '▲ A';
  svgTri.appendChild(l1);

  const l2 = makeSVGNS('text', { x: 310, y: 140, fill: '#fb7185', 'font-size': 12, 'font-family': 'Outfit,sans-serif' });
  l2.textContent = '▲ B';
  svgTri.appendChild(l2);

  const formula = makeSVGNS('text', { x: 200, y: 230, fill: 'rgba(255,255,255,0.45)', 'font-size': 11, 'font-family': 'Outfit,sans-serif', 'text-anchor': 'middle' });
  formula.textContent = '∴ Triangle = ½ × b × h';
  svgTri.appendChild(formula);

  setTimeout(() => {
    formulaTri.classList.add('visible');
    triState = 'done';
  }, 600);
}

function initTrapezium() {
  clearSVG(svgTrap);
  trapState = 'idle';
  formulaTrap.classList.remove('visible');

  const bg = makeSVGNS('rect', { x: 0, y: 0, width: 400, height: 260, fill: '#0f2320' });
  svgTrap.appendChild(bg);

  const trap = makeSVGNS('polygon', {
    points: '60,200 340,200 280,80 120,80',
    fill: 'rgba(20,184,166,0.25)', stroke: '#14b8a6', 'stroke-width': 2.5
  });
  svgTrap.appendChild(trap);

  const la = makeSVGNS('text', { x: 182, y: 74, fill: '#ffd700', 'font-size': 13, 'font-weight': 'bold', 'font-family': 'Outfit,sans-serif', 'text-anchor': 'middle' });
  la.textContent = 'a';
  svgTrap.appendChild(la);

  const lb = makeSVGNS('text', { x: 200, y: 224, fill: '#fb7185', 'font-size': 13, 'font-weight': 'bold', 'font-family': 'Outfit,sans-serif', 'text-anchor': 'middle' });
  lb.textContent = 'b';
  svgTrap.appendChild(lb);

  const h = makeSVGNS('line', { x1: 200, y1: 80, x2: 200, y2: 200, stroke: 'rgba(255,255,255,0.3)', 'stroke-width': 1.5, 'stroke-dasharray': '5,4' });
  svgTrap.appendChild(h);

  const lh = makeSVGNS('text', { x: 208, y: 148, fill: 'rgba(255,255,255,0.5)', 'font-size': 12, 'font-family': 'Outfit,sans-serif' });
  lh.textContent = 'h';
  svgTrap.appendChild(lh);

  const hint = makeSVGNS('text', { x: 200, y: 248, fill: 'rgba(255,255,255,0.3)', 'font-size': 11, 'font-family': 'Outfit,sans-serif', 'text-anchor': 'middle' });
  hint.textContent = 'Press "Double It!" to see the derivation';
  svgTrap.appendChild(hint);
}

function animateTrapezium() {
  if (trapState !== 'idle') return;
  trapState = 'running';
  clearSVG(svgTrap);

  const bg = makeSVGNS('rect', { x: 0, y: 0, width: 400, height: 260, fill: '#0f2320' });
  svgTrap.appendChild(bg);

  const t1 = makeSVGNS('polygon', {
    points: '30,210 310,210 250,90 90,90',
    fill: 'rgba(20,184,166,0.3)', stroke: '#14b8a6', 'stroke-width': 2.5
  });
  svgTrap.appendChild(t1);

  const t2 = makeSVGNS('polygon', {
    points: '310,210 370,90 250,90',
    fill: 'rgba(251,113,133,0.25)', stroke: '#fb7185', 'stroke-width': 2, 'stroke-dasharray': '6,3'
  });
  svgTrap.appendChild(t2);

  const t3 = makeSVGNS('polygon', {
    points: '30,210 90,90 30,90',
    fill: 'rgba(251,113,133,0.25)', stroke: '#fb7185', 'stroke-width': 2, 'stroke-dasharray': '6,3'
  });
  svgTrap.appendChild(t3);

  const eq = makeSVGNS('text', { x: 200, y: 152, fill: '#ffd700', 'font-size': 12, 'font-weight': 'bold', 'font-family': 'Outfit,sans-serif', 'text-anchor': 'middle' });
  eq.textContent = '2 Trapeziums = Parallelogram';
  svgTrap.appendChild(eq);

  const la = makeSVGNS('text', { x: 170, y: 84, fill: '#ffd700', 'font-size': 12, 'font-family': 'Outfit,sans-serif', 'text-anchor': 'middle' });
  la.textContent = 'a';
  svgTrap.appendChild(la);

  const lb = makeSVGNS('text', { x: 170, y: 228, fill: '#fb7185', 'font-size': 12, 'font-family': 'Outfit,sans-serif', 'text-anchor': 'middle' });
  lb.textContent = 'b';
  svgTrap.appendChild(lb);

  const formula = makeSVGNS('text', { x: 200, y: 248, fill: 'rgba(255,255,255,0.4)', 'font-size': 11, 'font-family': 'Outfit,sans-serif', 'text-anchor': 'middle' });
  formula.textContent = '∴ Trap = ½ × (a+b) × h';
  svgTrap.appendChild(formula);

  setTimeout(() => {
    formulaTrap.classList.add('visible');
    trapState = 'done';
  }, 600);
}

document.getElementById('cutParaBtn').addEventListener('click', animateParallelogram);
document.getElementById('cutTriBtn').addEventListener('click', animateTriangle);
document.getElementById('cutTrapBtn').addEventListener('click', animateTrapezium);

document.getElementById('resetParaBtn').addEventListener('click', initParallelogram);
document.getElementById('resetTriBtn').addEventListener('click', initTriangle);
document.getElementById('resetTrapBtn').addEventListener('click', initTrapezium);

document.getElementById('nextBtn').addEventListener('click', () => {
  if (currentTab < tabs.length - 1) {
    showTab(currentTab + 1);
  } else {
    document.getElementById('quizSection').scrollIntoView({ behavior: 'smooth' });
  }
});

document.getElementById('prevBtn').addEventListener('click', () => {
  if (currentTab > 0) showTab(currentTab - 1);
});

tabs.forEach((t, i) => {
  document.getElementById('step' + i).addEventListener('click', () => showTab(i));
});

document.querySelectorAll('#q1 .quiz-opt').forEach(btn => {
  btn.addEventListener('click', function () {
    if (quizAnswered >= 1) return;
    quizAnswered++;
    const correct = this.dataset.correct === 'true';
    if (correct) {
      this.classList.add('correct');
      quizScore++;
      const fb = document.querySelector('#q1 .quiz-feedback');
      fb.textContent = '✅ Correct! ½ × 8 × 5 = 20';
      fb.classList.add('correct');
      fb.classList.remove('hidden');
    } else {
      this.classList.add('wrong');
      document.querySelector('#q1 .quiz-opt[data-correct="true"]').classList.add('correct');
      const fb = document.querySelector('#q1 .quiz-feedback');
      fb.textContent = '❌ Recall: Area of triangle = ½ × base × height = ½ × 8 × 5 = 20';
      fb.classList.add('wrong');
      fb.classList.remove('hidden');
    }
    setTimeout(() => {
      document.getElementById('q1').classList.add('hidden');
      document.getElementById('q2').classList.remove('hidden');
    }, 1200);
  });
});

document.querySelectorAll('#q2 .quiz-opt').forEach(btn => {
  btn.addEventListener('click', function () {
    if (quizAnswered >= 2) return;
    quizAnswered++;
    const correct = this.dataset.correct === 'true';
    if (correct) {
      this.classList.add('correct');
      quizScore++;
      const fb = document.querySelector('#q2 .quiz-feedback');
      fb.textContent = '✅ Correct! ½ × (6 + 10) × 4 = ½ × 16 × 4 = 32';
      fb.classList.add('correct');
      fb.classList.remove('hidden');
    } else {
      this.classList.add('wrong');
      document.querySelector('#q2 .quiz-opt[data-correct="true"]').classList.add('correct');
      const fb = document.querySelector('#q2 .quiz-feedback');
      fb.textContent = '❌ ½ × (a+b) × h = ½ × (6+10) × 4 = 32';
      fb.classList.add('wrong');
      fb.classList.remove('hidden');
    }
    setTimeout(() => {
      document.getElementById('q2').classList.add('hidden');
      const scoreEl = document.getElementById('quizScore');
      scoreEl.classList.remove('hidden');
      scoreEl.textContent = `🎉 Score: ${quizScore}/2 — ${quizScore === 2 ? 'Perfect! You nailed the formulas!' : 'Keep practising!'}`;
    }, 1200);
  });
});

initParallelogram();
initTriangle();
initTrapezium();
showTab(0);
