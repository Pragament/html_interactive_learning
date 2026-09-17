const canvas = document.getElementById('geoboard');
const ctx = canvas.getContext('2d');

const areaAEl = document.getElementById('areaA');
const areaBEl = document.getElementById('areaB');
const equalsBadge = document.getElementById('equalsBadge');
const equalsSign = document.getElementById('equalsSign');
const baseValEl = document.getElementById('baseVal');
const heightValEl = document.getElementById('heightVal');
const ahaMessage = document.getElementById('ahaMessage');
const ahaOverlay = document.getElementById('ahaOverlay');
const touchHint = document.getElementById('touch-hint');

let W, H;
let baseY, parallelY;
let baseLeft, baseRight;
let apexA, apexB;
let dragging = null;
let moveCount = 0;
let ahaShown = false;

function resize() {
  const rect = canvas.parentElement.getBoundingClientRect();
  W = Math.floor(rect.width);
  H = Math.floor(Math.min(W * 0.58, 320));
  canvas.width = W;
  canvas.height = H;
  init();
  draw();
}

function init() {
  baseY = H * 0.78;
  parallelY = H * 0.22;
  baseLeft = W * 0.15;
  baseRight = W * 0.85;
  apexA = { x: W * 0.35, y: parallelY };
  apexB = { x: W * 0.68, y: parallelY };
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  const step = Math.floor(W / 16);
  for (let x = 0; x <= W; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

function drawDots() {
  const step = Math.floor(W / 16);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  for (let x = 0; x <= W; x += step) {
    for (let y = 0; y <= H; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawParallelLines() {
  const dash = [8, 6];
  ctx.setLineDash(dash);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath(); ctx.moveTo(0, parallelY); ctx.lineTo(W, parallelY); ctx.stroke();
  ctx.setLineDash([]);

  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffd700';
  ctx.beginPath(); ctx.moveTo(baseLeft - 10, baseY); ctx.lineTo(baseRight + 10, baseY); ctx.stroke();

  ctx.fillStyle = '#ffd700';
  ctx.font = `bold ${Math.max(11, W * 0.024)}px Outfit, sans-serif`;
  ctx.fillText('Base Line', baseLeft, baseY + 18);

  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = `${Math.max(10, W * 0.021)}px Outfit, sans-serif`;
  ctx.fillText('Parallel Line', W * 0.5, parallelY - 8);
}

function drawTriangle(ax, ay, label, color, glow) {
  const bx = baseLeft, by = baseY;
  const cx = baseRight, cy = baseY;

  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
  }

  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.lineTo(cx, cy);
  ctx.closePath();
  ctx.fillStyle = color + '28';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = color + '80';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(ax, baseY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = color;
  ctx.font = `bold ${Math.max(13, W * 0.03)}px Outfit, sans-serif`;
  ctx.fillText(label, ax + 8, ay - 8);
}

function drawHandle(x, y, color) {
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fillStyle = color + '33';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function computeArea() {
  const base = baseRight - baseLeft;
  const height = baseY - parallelY;
  return { area: 0.5 * base * height, base, height };
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  drawGrid();
  drawDots();
  drawParallelLines();
  drawTriangle(apexA.x, apexA.y, 'A', '#00e5ff', true);
  drawTriangle(apexB.x, apexB.y, 'B', '#ff6b6b', true);
  drawHandle(apexA.x, apexA.y, '#00e5ff');
  drawHandle(apexB.x, apexB.y, '#ff6b6b');

  const { area, base, height } = computeArea();
  const areaRounded = Math.round(area);

  areaAEl.textContent = areaRounded + ' sq';
  areaBEl.textContent = areaRounded + ' sq';
  baseValEl.textContent = Math.round(base) + ' px';
  heightValEl.textContent = Math.round(height) + ' px';

  equalsBadge.classList.add('equal');
  equalsSign.textContent = '=';

  if (moveCount > 2 && !ahaShown) {
    ahaShown = true;
    ahaMessage.classList.remove('hidden');
    setTimeout(() => showAhaOverlay(), 600);
  }
}

function showAhaOverlay() {
  ahaOverlay.classList.remove('hidden');
  setTimeout(() => ahaOverlay.classList.add('hidden'), 2000);
}

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  if (e.touches) {
    return {
      x: (e.touches[0].clientX - rect.left) * scaleX,
      y: (e.touches[0].clientY - rect.top) * scaleY
    };
  }
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}

function hitTest(pos, point) {
  return Math.hypot(pos.x - point.x, pos.y - point.y) < 22;
}

function onDown(e) {
  e.preventDefault();
  const pos = getPos(e);
  if (hitTest(pos, apexA)) dragging = 'A';
  else if (hitTest(pos, apexB)) dragging = 'B';
  if (dragging) touchHint.style.opacity = '0';
}

function onMove(e) {
  e.preventDefault();
  if (!dragging) return;
  const pos = getPos(e);
  const clamped = Math.max(baseLeft, Math.min(baseRight, pos.x));
  if (dragging === 'A') apexA = { x: clamped, y: parallelY };
  else apexB = { x: clamped, y: parallelY };
  moveCount++;
  draw();
}

function onUp() { dragging = null; }

canvas.addEventListener('mousedown', onDown);
canvas.addEventListener('mousemove', onMove);
canvas.addEventListener('mouseup', onUp);
canvas.addEventListener('touchstart', onDown, { passive: false });
canvas.addEventListener('touchmove', onMove, { passive: false });
canvas.addEventListener('touchend', onUp);

document.getElementById('qYes').addEventListener('click', function () {
  this.classList.add('wrong');
  document.getElementById('qNo').classList.add('correct');
  const res = document.getElementById('quizResult');
  res.classList.remove('hidden');
  res.classList.add('correct');
  res.textContent = '✅ Correct! Moving the apex along the parallel line keeps the height the same, so the area stays equal!';
});

document.getElementById('qNo').addEventListener('click', function () {
  this.classList.add('correct');
  const res = document.getElementById('quizResult');
  res.classList.remove('hidden');
  res.classList.add('correct');
  res.textContent = '✅ Correct! Moving the apex along the parallel line keeps the height the same, so the area stays equal!';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  moveCount = 0;
  ahaShown = false;
  ahaMessage.classList.add('hidden');
  touchHint.style.opacity = '1';
  init();
  draw();
});

window.addEventListener('resize', resize);
resize();
