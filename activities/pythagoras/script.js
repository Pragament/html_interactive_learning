const mainCanvas = document.getElementById('pythaCanvas');
const mainCtx = mainCanvas.getContext('2d');

const sliderA = document.getElementById('sideA');
const sliderB = document.getElementById('sideB');
const valAEl = document.getElementById('valA');
const valBEl = document.getElementById('valB');
const sqAEl = document.getElementById('sqA');
const sqBEl = document.getElementById('sqB');
const sqCEl = document.getElementById('sqC');
const cValEl = document.getElementById('cVal');

let W, H, UNIT;
let a = 3, b = 4;

const challenges = [
  { a: 6, b: 8, answer: 10 },
  { a: 5, b: 12, answer: 13 },
  { a: 9, b: 40, answer: 41 },
  { a: 8, b: 15, answer: 17 },
  { a: 3, b: 4, answer: 5 }
];
let challengeIndex = 0;

function resize() {
  const rect = mainCanvas.parentElement.getBoundingClientRect();
  W = Math.floor(rect.width);
  H = Math.floor(Math.min(W * 0.72, 400));
  mainCanvas.width = W;
  mainCanvas.height = H;
  UNIT = Math.floor(Math.min(W, H) / 20);
  draw();
}

function getC() {
  return Math.sqrt(a * a + b * b);
}

function drawUnitSquare(ctx, x, y, size, color, filled) {
  ctx.fillStyle = filled ? color : 'transparent';
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = color.replace('0.7', '0.9');
  ctx.lineWidth = 0.7;
  ctx.strokeRect(x, y, size, size);
}

function fillSquare(ctx, ox, oy, squareSize, cellSize, color, count, glow) {
  if (glow) {
    ctx.shadowColor = color.replace('0.7', '1');
    ctx.shadowBlur = 12;
  }
  let filled = 0;
  const cols = squareSize / cellSize;
  for (let row = 0; row < cols; row++) {
    for (let col = 0; col < cols; col++) {
      if (filled >= count) break;
      drawUnitSquare(ctx, ox + col * cellSize, oy + row * cellSize, cellSize, color, true);
      filled++;
    }
    if (filled >= count) break;
  }
  ctx.shadowBlur = 0;
}

function drawSquareOnSide(ctx, label, pts, sideLen, color, areaSquares) {
  const sq = sideLen * UNIT;
  const cellSize = UNIT;
  const cx = (pts[0].x + pts[1].x + pts[2].x + pts[3].x) / 4;
  const cy = (pts[0].y + pts[1].y + pts[2].y + pts[3].y) / 4;

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = color.replace('0.7', '0.15');
  ctx.fill();
  ctx.strokeStyle = color.replace('0.7', '0.85');
  ctx.lineWidth = 2;
  ctx.stroke();

  const maxCells = sideLen * sideLen;
  let filled = 0;
  for (let row = 0; row < sideLen; row++) {
    for (let col = 0; col < sideLen; col++) {
      if (filled >= areaSquares) break;
      const px = pts[0].x + (pts[1].x - pts[0].x) * (col / sideLen) + (pts[3].x - pts[0].x) * (row / sideLen);
      const py = pts[0].y + (pts[1].y - pts[0].y) * (col / sideLen) + (pts[3].y - pts[0].y) * (row / sideLen);
      const qx = px + (pts[1].x - pts[0].x) / sideLen;
      const qy = py + (pts[1].y - pts[0].y) / sideLen;
      const rx = qx + (pts[3].x - pts[0].x) / sideLen;
      const ry = qy + (pts[3].y - pts[0].y) / sideLen;
      const sx = px + (pts[3].x - pts[0].x) / sideLen;
      const sy = py + (pts[3].y - pts[0].y) / sideLen;

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(qx, qy);
      ctx.lineTo(rx, ry);
      ctx.lineTo(sx, sy);
      ctx.closePath();
      ctx.fillStyle = color.replace('0.7', '0.45');
      ctx.fill();
      ctx.strokeStyle = color.replace('0.7', '0.2');
      ctx.lineWidth = 0.5;
      ctx.stroke();
      filled++;
    }
    if (filled >= areaSquares) break;
  }

  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.max(12, UNIT * 0.8)}px Outfit, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 4;
  ctx.fillText(label, cx, cy);
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function draw() {
  const c = getC();
  mainCtx.clearRect(0, 0, W, H);
  mainCtx.fillStyle = '#0d1525';
  mainCtx.fillRect(0, 0, W, H);

  mainCtx.strokeStyle = 'rgba(255,255,255,0.04)';
  mainCtx.lineWidth = 1;
  for (let x = 0; x < W; x += UNIT) {
    mainCtx.beginPath(); mainCtx.moveTo(x, 0); mainCtx.lineTo(x, H); mainCtx.stroke();
  }
  for (let y = 0; y < H; y += UNIT) {
    mainCtx.beginPath(); mainCtx.moveTo(0, y); mainCtx.lineTo(W, y); mainCtx.stroke();
  }

  const margin = UNIT * 1.5;
  const ox = W * 0.42;
  const oy = H * 0.72;

  const P = { x: ox, y: oy };
  const Q = { x: ox + a * UNIT, y: oy };
  const R = { x: ox + a * UNIT, y: oy - b * UNIT };

  mainCtx.beginPath();
  mainCtx.moveTo(P.x, P.y);
  mainCtx.lineTo(Q.x, Q.y);
  mainCtx.lineTo(R.x, R.y);
  mainCtx.closePath();
  mainCtx.fillStyle = 'rgba(255,255,255,0.06)';
  mainCtx.fill();
  mainCtx.strokeStyle = 'rgba(255,255,255,0.7)';
  mainCtx.lineWidth = 2.5;
  mainCtx.stroke();

  const sq = Math.min(UNIT * 0.5, 8);
  mainCtx.strokeStyle = 'rgba(255,255,255,0.5)';
  mainCtx.lineWidth = 1.5;
  mainCtx.strokeRect(Q.x - sq, Q.y - sq, sq, sq);

  mainCtx.fillStyle = 'rgba(255,255,255,0.6)';
  mainCtx.font = `bold ${Math.max(11, UNIT * 0.75)}px Outfit,sans-serif`;
  mainCtx.fillText('a=' + a, P.x + (Q.x - P.x) / 2 - 10, Q.y + 16);
  mainCtx.fillText('b=' + b, Q.x + 5, Q.y - (Q.y - R.y) / 2);
  mainCtx.fillText('c', P.x + (R.x - P.x) / 2 - 18, P.y + (R.y - P.y) / 2 - 5);

  const sqPtsA = [
    { x: P.x, y: P.y },
    { x: Q.x, y: Q.y },
    { x: Q.x, y: Q.y + a * UNIT },
    { x: P.x, y: P.y + a * UNIT }
  ];
  drawSquareOnSide(mainCtx, 'a²=' + (a * a), sqPtsA, a, 'rgba(56,189,248,0.7)', a * a);

  const sqPtsB = [
    { x: Q.x, y: Q.y },
    { x: Q.x + b * UNIT, y: R.y },
    { x: Q.x + b * UNIT - (Q.y - R.y) * (b / c) * (UNIT / UNIT), y: R.y - b * UNIT * (a / c) },
    { x: R.x, y: R.y }
  ];
  const dx = (R.y - Q.y), dy = (Q.x - R.x);
  const len = Math.hypot(dx, dy);
  const nx = dx / len * b * UNIT, ny = dy / len * b * UNIT;
  const sqPtsBReal = [
    Q,
    R,
    { x: R.x + nx, y: R.y + ny },
    { x: Q.x + nx, y: Q.y + ny }
  ];
  drawSquareOnSide(mainCtx, 'b²=' + (b * b), sqPtsBReal, b, 'rgba(34,197,94,0.7)', b * b);

  const cdx = P.x - R.x, cdy = P.y - R.y;
  const clen = Math.hypot(cdx, cdy);
  const cnx = -cdy / clen * Math.round(c) * UNIT;
  const cny = cdx / clen * Math.round(c) * UNIT;
  const sqPtsC = [
    R,
    P,
    { x: P.x + cnx / Math.round(c), y: P.y + cny / Math.round(c) },
    { x: R.x + cnx / Math.round(c), y: R.y + cny / Math.round(c) }
  ];

  const cRound = Math.round(c);
  const cSqPts = [
    R,
    P,
    { x: P.x - cdy / clen * cRound * UNIT, y: P.y + cdx / clen * cRound * UNIT },
    { x: R.x - cdy / clen * cRound * UNIT, y: R.y + cdx / clen * cRound * UNIT }
  ];
  drawSquareOnSide(mainCtx, 'c²=' + Math.round(c * c), cSqPts, cRound, 'rgba(249,115,22,0.7)', Math.round(c * c));

  const areaA = a * a;
  const areaB = b * b;
  const areaC = Math.round(c * c);

  sqAEl.textContent = areaA;
  sqBEl.textContent = areaB;
  sqCEl.textContent = areaC;
  cValEl.textContent = c.toFixed(2);
}

sliderA.addEventListener('input', () => {
  a = Number(sliderA.value);
  valAEl.textContent = a;
  draw();
  updateEquation();
});

sliderB.addEventListener('input', () => {
  b = Number(sliderB.value);
  valBEl.textContent = b;
  draw();
  updateEquation();
});

function updateEquation() {
  const c = getC();
  sqAEl.textContent = a * a;
  sqBEl.textContent = b * b;
  sqCEl.textContent = Math.round(c * c);
  cValEl.textContent = c.toFixed(2);
}

document.getElementById('pourBtn').addEventListener('click', () => {
  const overlay = document.getElementById('pourOverlay');
  overlay.classList.remove('hidden');
  const pourCanvas = document.getElementById('pourCanvas');
  const pCtx = pourCanvas.getContext('2d');
  pourCanvas.width = 400;
  pourCanvas.height = 300;
  animatePour(pCtx, pourCanvas);
});

document.getElementById('closePour').addEventListener('click', () => {
  document.getElementById('pourOverlay').classList.add('hidden');
});

function animatePour(ctx, canvas) {
  const aSquares = a * a;
  const bSquares = b * b;
  const cSquares = Math.round(getC() * getC());
  const cellSize = Math.min(20, Math.floor(180 / Math.max(a, b, Math.ceil(getC()))));
  let filled = 0;
  const total = cSquares;
  let frame = 0;

  ctx.fillStyle = '#0d1525';
  ctx.fillRect(0, 0, 400, 300);

  const label = (txt, x, y, col) => {
    ctx.fillStyle = col;
    ctx.font = 'bold 13px Outfit,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(txt, x, y);
    ctx.textAlign = 'left';
  };

  function step() {
    ctx.fillStyle = '#0d1525';
    ctx.fillRect(0, 0, 400, 300);

    label('a² = ' + aSquares, 70, 20, '#38bdf8');
    label('b² = ' + bSquares, 200, 20, '#22c55e');
    label('c² = ' + cSquares, 330, 20, '#f97316');

    const aCols = a;
    for (let i = 0; i < aSquares; i++) {
      const col = i % aCols, row = Math.floor(i / aCols);
      ctx.fillStyle = 'rgba(56,189,248,0.6)';
      ctx.fillRect(20 + col * cellSize, 30 + row * cellSize, cellSize - 1, cellSize - 1);
    }

    const bCols = b;
    for (let i = 0; i < bSquares; i++) {
      const col = i % bCols, row = Math.floor(i / bCols);
      ctx.fillStyle = 'rgba(34,197,94,0.6)';
      ctx.fillRect(140 + col * cellSize, 30 + row * cellSize, cellSize - 1, cellSize - 1);
    }

    const cCols = Math.ceil(getC());
    for (let i = 0; i < filled; i++) {
      const col = i % cCols, row = Math.floor(i / cCols);
      ctx.fillStyle = i < aSquares ? 'rgba(56,189,248,0.7)' : 'rgba(34,197,94,0.7)';
      ctx.fillRect(270 + col * cellSize, 30 + row * cellSize, cellSize - 1, cellSize - 1);
    }

    label(filled + ' / ' + cSquares + ' filled', 330, 265, 'rgba(255,255,255,0.4)');

    if (filled < total) {
      filled += Math.max(1, Math.floor(total / 40));
      filled = Math.min(filled, total);
      requestAnimationFrame(step);
    } else {
      ctx.fillStyle = 'rgba(34,197,94,0.9)';
      ctx.font = 'bold 15px Outfit,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('a² + b² = c²  ✓', 200, 285);
      ctx.textAlign = 'left';
    }
  }
  step();
}

document.querySelectorAll('.triple-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    a = Number(btn.dataset.a);
    b = Number(btn.dataset.b);
    sliderA.value = a;
    sliderB.value = b;
    valAEl.textContent = a;
    valBEl.textContent = b;
    draw();
    updateEquation();
  });
});

function loadChallenge() {
  const ch = challenges[challengeIndex % challenges.length];
  document.getElementById('challengeQ').textContent =
    `A right triangle has sides a=${ch.a}, b=${ch.b}. What is the hypotenuse (c)?`;
  document.getElementById('challengeInput').value = '';
  const res = document.getElementById('challengeResult');
  res.classList.add('hidden');
  res.className = 'challenge-result hidden';
}

document.getElementById('checkBtn').addEventListener('click', () => {
  const ch = challenges[challengeIndex % challenges.length];
  const val = Number(document.getElementById('challengeInput').value);
  const res = document.getElementById('challengeResult');
  res.classList.remove('hidden');
  if (Math.abs(val - ch.answer) < 0.5) {
    res.textContent = `✅ Correct! c = √(${ch.a}² + ${ch.b}²) = √${ch.a * ch.a + ch.b * ch.b} = ${ch.answer}`;
    res.className = 'challenge-result correct';
  } else {
    res.textContent = `❌ Not quite. c = √(${ch.a}² + ${ch.b}²) = √${ch.a * ch.a + ch.b * ch.b} = ${ch.answer}`;
    res.className = 'challenge-result wrong';
  }
});

document.getElementById('newChallengeBtn').addEventListener('click', () => {
  challengeIndex++;
  loadChallenge();
});

document.getElementById('challengeInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('checkBtn').click();
});

window.addEventListener('resize', resize);
resize();
loadChallenge();
