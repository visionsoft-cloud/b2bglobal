/**
 * B2B DATA GLOBAL LLC — Live Data Pipeline & Particle Engines
 * Simulates Ingestion, Verification Passes, Enrichment & Delivery
 */

(function (root) {
  'use strict';

  // Live Stream Simulation State
  function createStreamState() {
    return {
      records: [],
      spawnTimer: 0,
      counts: { in: 14820, valid: 13910, rejected: 910, out: 13910 }
    };
  }

  const STAGES_X = [0.06, 0.30, 0.54, 0.78];
  const STAGE_NAMES = ['SOURCE', 'VERIFY', 'ENRICH', 'DELIVER'];

  function drawStream(ctx, width, height, state, streamState) {
    const safeW = Math.max(width || 0, 320);
    const safeH = Math.max(height || 0, 180);
    const time = state.time || 0;
    const speed = state.speed || 1;
    const activeStage = state.activeStage;
    const lanes = [safeH * 0.30, safeH * 0.50, safeH * 0.70];

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, safeW, safeH);
    bg.addColorStop(0, '#0a3a32');
    bg.addColorStop(1, '#062b26');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, safeW, safeH);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(120, 215, 195, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < safeW; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, safeH);
      ctx.stroke();
    }
    for (let y = 0; y < safeH; y += 36) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(safeW, y);
      ctx.stroke();
    }

    // Stage vertical demarcations
    for (let i = 0; i < 4; i++) {
      const gx = STAGES_X[i] * safeW + 20;
      const isActive = activeStage === i;
      ctx.strokeStyle = isActive ? 'rgba(232, 195, 74, 0.85)' : 'rgba(120, 215, 195, 0.25)';
      ctx.lineWidth = isActive ? 2 : 1;
      if (ctx.setLineDash) ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.moveTo(gx, safeH * 0.16);
      ctx.lineTo(gx, safeH * 0.88);
      ctx.stroke();
      if (ctx.setLineDash) ctx.setLineDash([]);

      ctx.font = '600 10px "IBM Plex Mono", Calibri, monospace';
      ctx.fillStyle = isActive ? 'rgba(232, 195, 74, 0.95)' : 'rgba(180, 230, 218, 0.7)';
      ctx.fillText(STAGE_NAMES[i], gx - 16, safeH * 0.12);
    }

    // Spawn new data records
    streamState.spawnTimer += speed * 0.05;
    while (streamState.spawnTimer > 1) {
      streamState.spawnTimer--;
      if (streamState.records.length < 40) {
        const lane = Math.floor(Math.random() * 3);
        const bad = Math.random() < 0.16; // 16% reject rate
        streamState.records.push({
          x: -0.05,
          lane: lane,
          v: 0.18 + Math.random() * 0.12,
          bad: bad,
          wob: Math.random() * 6
        });
        streamState.counts.in++;
      }
    }

    // Update and draw packets
    for (let i = streamState.records.length - 1; i >= 0; i--) {
      const rec = streamState.records[i];
      rec.x += rec.v * speed * 0.016;

      const px = rec.x * safeW;
      let py = lanes[rec.lane] + Math.sin(time * 1.6 + rec.wob) * 4;

      if (rec.bad && rec.x > STAGES_X[1] + 0.02) {
        if (!rec.counted) {
          rec.counted = true;
          streamState.counts.rejected++;
        }
        rec.drop = (rec.drop || 0) + speed * 1.8;
        py += rec.drop;
        ctx.globalAlpha = Math.max(0, 1 - rec.drop / 60);
      } else if (rec.x > STAGES_X[1] && !rec.okCounted) {
        rec.okCounted = true;
        streamState.counts.valid++;
      }

      if (rec.x > STAGES_X[3] && !rec.outCounted) {
        rec.outCounted = true;
        streamState.counts.out++;
      }

      const color = rec.bad ? '198, 96, 86' : rec.x > STAGES_X[2] ? '232, 195, 74' : '110, 220, 198';

      // Tail trail
      const safePx = Math.max(0, px);
      const tail = ctx.createLinearGradient(Math.max(0, safePx - 22), py, safePx, py);
      tail.addColorStop(0, `rgba(${color}, 0)`);
      tail.addColorStop(1, `rgba(${color}, 0.5)`);
      ctx.strokeStyle = tail;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(safePx - 22, py);
      ctx.lineTo(safePx, py);
      ctx.stroke();

      // Packet body
      ctx.fillStyle = `rgba(${color}, 0.95)`;
      ctx.beginPath();
      if (ctx.roundRect) {
        try {
          ctx.roundRect(px - 6, py - 4, 12, 8, 3);
        } catch (_) {
          ctx.rect(px - 6, py - 4, 12, 8);
        }
      } else {
        ctx.rect(px - 6, py - 4, 12, 8);
      }
      ctx.fill();

      ctx.globalAlpha = 1;

      // Remove off-screen or fully dropped packets
      if (rec.x > 1.05 || (rec.drop || 0) > 60) {
        streamState.records.splice(i, 1);
      }
    }

    return streamState.counts;
  }

  // Self-contained Pipeline Stream initialization
  function initPipelineStream(canvasOrId, options) {
    const canvas = (typeof canvasOrId === 'string')
      ? document.getElementById(canvasOrId)
      : canvasOrId;
    if (!canvas) return null;

    if (canvas.__b2bStreamInstance) {
      return canvas.__b2bStreamInstance;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const streamData = createStreamState();
    const streamState = { time: 0, speed: 1, activeStage: -1, playing: true };

    let animId = null;
    let cssW = 0, cssH = 0;
    let dpr = 1;

    const hudIn = document.getElementById('hudIn');
    const hudValid = document.getElementById('hudValid');
    const hudRejected = document.getElementById('hudRejected');
    const hudOut = document.getElementById('hudOut');

    const playBtn = document.getElementById('streamPlayBtn');
    const speedBtn = document.getElementById('streamSpeedBtn');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        streamState.playing = !streamState.playing;
        playBtn.textContent = streamState.playing ? '⏸' : '▶';
      });
    }

    if (speedBtn) {
      speedBtn.addEventListener('click', () => {
        streamState.speed = (streamState.speed === 1) ? 2 : (streamState.speed === 2) ? 0.5 : 1;
        speedBtn.textContent = (streamState.speed === 0.5 ? '½' : streamState.speed) + '×';
      });
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const parent = canvas.parentElement;
      const pw = parent ? parent.clientWidth : 0;
      const ph = parent ? parent.clientHeight : 0;

      cssW = Math.max(rect.width || pw || 500, 280);
      cssH = Math.max(rect.height || ph || 240, 180);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = cssW + 'px';
      canvas.style.height = cssH + 'px';
    }

    resize();

    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
      ro = new ResizeObserver(() => resize());
      ro.observe(canvas.parentElement);
    }
    window.addEventListener('resize', resize, { passive: true });

    const startTime = Date.now();

    function renderLoop() {
      if (streamState.playing) {
        streamState.time = (Date.now() - startTime) / 1000;

        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, cssW, cssH);

        try {
          const counts = drawStream(ctx, cssW, cssH, streamState, streamData);
          if (hudIn) hudIn.textContent = counts.in.toLocaleString();
          if (hudValid) hudValid.textContent = counts.valid.toLocaleString();
          if (hudRejected) hudRejected.textContent = counts.rejected.toLocaleString();
          if (hudOut) hudOut.textContent = counts.out.toLocaleString();
        } catch (err) {
          console.warn('[Pipeline Stream Draw Error]', err);
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(renderLoop);
    }

    animId = requestAnimationFrame(renderLoop);

    const instance = {
      destroy: function () {
        if (animId) cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
        if (ro) ro.disconnect();
        canvas.__b2bStreamInstance = null;
      },
      state: streamState,
      data: streamData
    };

    canvas.__b2bStreamInstance = instance;
    return instance;
  }

  // Footer ambient particles
  function initFooterParticles(canvasOrId) {
    const canvas = (typeof canvasOrId === 'string')
      ? document.getElementById(canvasOrId)
      : canvasOrId;
    if (!canvas) return null;

    if (canvas.__b2bParticlesInstance) {
      return canvas.__b2bParticlesInstance;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    let cssW = 0, cssH = 0;
    let dpr = 1;
    let particles = [];
    let animId = null;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const parent = canvas.parentElement;
      const pw = parent ? parent.clientWidth : 0;
      const ph = parent ? parent.clientHeight : 0;

      cssW = Math.max(rect.width || pw || window.innerWidth || 800, 320);
      cssH = Math.max(rect.height || ph || 300, 160);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = cssW + 'px';
      canvas.style.height = cssH + 'px';

      particles = [];
      const count = Math.min(48, Math.floor(cssW / 28));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * cssW,
          y: Math.random() * cssH,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 1 + Math.random() * 1.5
        });
      }
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    function loop() {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = cssW;
        if (p.x > cssW) p.x = 0;
        if (p.y < 0) p.y = cssH;
        if (p.y > cssH) p.y = 0;

        ctx.fillStyle = 'rgba(150, 235, 215, 0.4)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 90) {
            ctx.strokeStyle = 'rgba(120, 215, 195, ' + (0.16 * (1 - dist / 90)) + ')';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(loop);

    const instance = {
      destroy: function () {
        if (animId) cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
        canvas.__b2bParticlesInstance = null;
      }
    };

    canvas.__b2bParticlesInstance = instance;
    return instance;
  }

  root.B2B_STREAM = {
    createStreamState: createStreamState,
    drawStream: drawStream,
    initPipelineStream: initPipelineStream,
    initFooterParticles: initFooterParticles
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initPipelineStream('pipelineStream');
        initFooterParticles('fparticles');
      });
    } else {
      initPipelineStream('pipelineStream');
      initFooterParticles('fparticles');
    }
  }

})(typeof window !== 'undefined' ? window : this);
