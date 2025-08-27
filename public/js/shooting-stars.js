// /js/shooting-stars.js
(function () {
  const canvas = document.getElementById('shooting-stars');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let CW = 0, CH = 0;      // dimensões em CSS pixels
  let lastTime = 0;
  let meteors = [];
  let paused = false;

  // Configs fáceis de ajustar
  const CONFIG = {
    maxMeteors: 4,
    spawnMinMs: 900,
    spawnMaxMs: 2000,
    speedMin: 420,   // px/seg
    speedMax: 760,   // px/seg
    lengthMin: 120,  // px
    lengthMax: 220,  // px
    thickness: 2,    // px
    angleDegMin: 20, // ângulo em relação ao eixo X (para baixo/esquerda)
    angleDegMax: 35,
  };

  let nextSpawnAt = 0;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pickSpawnDelay() {
    return rand(CONFIG.spawnMinMs, CONFIG.spawnMaxMs);
  }

  function resize() {
    const host = document.querySelector('.finisher-header') || document.body;
    CW = host.clientWidth;
    CH = host.clientHeight;

    // dimensiona o canvas com DPR para nitidez
    canvas.style.width = CW + 'px';
    canvas.style.height = CH + 'px';
    canvas.width = Math.round(CW * DPR);
    canvas.height = Math.round(CH * DPR);

    // Desenha em coordenadas CSS (1 unidade = 1 px visual)
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  class Meteor {
    constructor() {
      // nasce um pouco fora da direita e perto do topo
      this.x = CW + rand(40, 180);
      this.y = rand(-80, CH * 0.3);

      const angleDeg = rand(CONFIG.angleDegMin, CONFIG.angleDegMax);
      const angleRad = (Math.PI / 180) * angleDeg;

      const speed = rand(CONFIG.speedMin, CONFIG.speedMax); // px/s
      // vetor direção: para esquerda (-x) e para baixo (+y)
      this.vx = -Math.cos(angleRad) * speed;
      this.vy =  Math.sin(angleRad) * speed;

      this.length = rand(CONFIG.lengthMin, CONFIG.lengthMax);
      this.thickness = CONFIG.thickness;
      this.alive = true;
      this.opacity = 1;
    }

    update(dt) {
      // dt em segundos
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      // Se saiu da tela com margem, morre
      if (this.x < -this.length - 100 || this.y > CH + 100) {
        this.alive = false;
      }
    }

    draw(ctx) {
      // ponto cabeça (head): (x, y)
      // ponto cauda (tail): head - dirNormalizada * length
      const speed = Math.hypot(this.vx, this.vy);
      const ux = this.vx / speed;
      const uy = this.vy / speed;

      const tailX = this.x - ux * this.length;
      const tailY = this.y - uy * this.length;

      // gradiente da cauda (transparente -> branco)
      const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(1, 'rgba(255,255,255,0.9)');

      ctx.lineWidth = this.thickness;
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();

      // brilho na cabeça
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(255,255,255,0.9)';
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function spawnIfNeeded(nowMs) {
    if (meteors.length >= CONFIG.maxMeteors) return;
    if (nowMs < nextSpawnAt) return;
    meteors.push(new Meteor());
    nextSpawnAt = nowMs + pickSpawnDelay();
  }

  function tick(ts) {
    if (paused) {
      requestAnimationFrame(tick);
      return;
    }

    if (!lastTime) lastTime = ts;
    const dt = Math.min(0.05, (ts - lastTime) / 1000); // limita a 50ms
    lastTime = ts;

    // leve “fade” para rastro suave
    // limpa apenas o canvas, sem pintar de preto
ctx.globalCompositeOperation = 'source-over';
ctx.clearRect(0, 0, CW, CH);


    // mistura aditiva para dar glow
    ctx.globalCompositeOperation = 'lighter';
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.update(dt);
      m.draw(ctx);
      if (!m.alive) meteors.splice(i, 1);
    }

    spawnIfNeeded(ts);
    requestAnimationFrame(tick);
  }

  // Eventos
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused) lastTime = 0; // ressincroniza
  });

  // Start
  resize();
  nextSpawnAt = performance.now() + pickSpawnDelay();
  requestAnimationFrame(tick);
})();
