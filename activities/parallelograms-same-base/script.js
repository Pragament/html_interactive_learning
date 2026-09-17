const canvas = document.getElementById('geoboard');
const ctx = canvas.getContext('2d');

const slantA = document.getElementById('slantA');
const slantB = document.getElementById('slantB');
const areaAEl = document.getElementById('areaA');
const areaBEl = document.getElementById('areaB');
const equalsBadge = document.getElementById('equalsBadge');
const baseValEl = document.getElementById('baseVal');
const heightValEl = document.getElementById('heightVal');

let W, H;
let baseY, parallelY;
let baseLeft, baseRight;
let isAnimating = false;

function resize() {
  const rect = canvas.parentElement.getBoundingClientRect();
  W = Math.floor(rect.width);
  H = Math.floor(Math.min(W * 0.55, 300));
  canvas.width = W;
  canvas.height = H;
  setLayout();
  draw();
}

function setLayout() {
  baseY = H * 0.80;
  parallelY = H * 0.20;
  baseLeft = W * 0.12;
  baseRight = W * 0.88;
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  const step = Math.floor(W / 18);
  for (let x = 0; x <= W; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

function drawParallelLines() {
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffd700';
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(baseLeft - 20, baseY); ctx.lineTo(baseRight + 20, baseY); ctx.stroke();

  ctx.setLineDash([8, 5]);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, parallelY); ctx.lineTo(W, parallelY); ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#ffd700';
  ctx.font = `bold ${Math.max(11, W * 0.022)}px Outfit, sans-serif`;
  ctx.fillText('Base Line', baseLeft, baseY + 18);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = `${Math.max(10, W * 0.019)}px Outfit, sans-serif`;
  ctx.fillText('Parallel Line', W * 0.48, parallelY - 8);
}

function drawParallelogram(bx, offset, color, label) {
  const width = (baseRight - baseLeft) * 0.38;
  const h = baseY - parallelY;

  const bl = { x: bx, y: baseY };
  const br = { x: bx + width, y: baseY };
  const tl = { x: bx + offset, y: parallelY };
  const tr = { x: bx + offset + width, y: parallelY };

  ctx.beginPath();
  ctx.moveTo(bl.x, bl.y);
  ctx.lineTo(br.x, br.y);
  ctx.lineTo(tr.x, tr.y);
  ctx.lineTo(tl.x, tl.y);
  ctx.closePath();
  ctx.fillStyle = color + '2a';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = color + '60';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(bl.x + width / 2 + offset / 2, parallelY);
  ctx.lineTo(bl.x + width / 2 + offset / 2, baseY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = color;
  ctx.font = `bold ${Math.max(13, W * 0.028)}px Outfit, sans-serif`;
  const midX = (bl.x + br.x + tl.x + tr.x) / 4;
  const midY = (bl.y + parallelY) / 2;
  ctx.fillText(label, midX - 6, midY + 5);

  return width * h;
}

function draw(animOffsetA, animOffsetB) {
  ctx.clearRect(0, 0, W, H);
  drawGrid();
  drawParallelLines();

  const offA = animOffsetA !== undefined ? animOffsetA : Number(slantA.value);
  const offB = animOffsetB !== undefined ? animOffsetB : Number(slantB.value);

  const baseWidth = W * 0.38;
  const base1 = baseLeft + W * 0.02;
  const base2 = base1 + baseWidth + W * 0.04;

  const areaA = drawParallelogram(base1, offA, '#7c3aed', 'A');
  const areaB = drawParallelogram(base2, offB, '#f59e0b', 'B');

  const h = baseY - parallelY;
  const displayArea = Math.round(baseWidth * h / 100);

  areaAEl.textContent = displayArea + ' sq';
  areaBEl.textContent = displayArea + ' sq';
  baseValEl.textContent = Math.round(baseWidth) + ' px';
  heightValEl.textContent = Math.round(h) + ' px';
  equalsBadge.classList.add('equal');
}

slantA.addEventListener('input', () => draw());
slantB.addEventListener('input', () => draw());

document.getElementById('shearBtn').addEventListener('click', () => {
  if (isAnimating) return;
  isAnimating = true;

  const targetA = 0;
  const startA = Number(slantA.value);
  const startTime = performance.now();
  const duration = 1200;

  function animate(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const currentA = startA + (targetA - startA) * ease;
    draw(currentA, Number(slantB.value));
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      slantA.value = 0;
      isAnimating = false;
      draw();
    }
  }
  requestAnimationFrame(animate);
});

document.getElementById('resetBtn').addEventListener('click', () => {
  slantA.value = 0;
  slantB.value = 60;
  draw();
});

window.addEventListener('resize', resize);
resize();
