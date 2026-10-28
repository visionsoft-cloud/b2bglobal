/**
 * B2B DATA GLOBAL LLC — 3D Canvas Visualizations
 * Interactive 3D Globe, Spherical Continents, Arcs & Global Network Hubs
 */

(function (root) {
  'use strict';

  const DEG2RAD = Math.PI / 180;
  const TWO_PI = Math.PI * 2;

  // Convert Latitude / Longitude to 3D Cartesian coordinates [x, y, z]
  function toCartesian(lat, lon) {
    const phi = (lat || 0) * DEG2RAD;
    const theta = (lon || 0) * DEG2RAD;
    return [
      Math.cos(phi) * Math.sin(theta),
      Math.sin(phi),
      Math.cos(phi) * Math.cos(theta)
    ];
  }

  // Pseudo-random generator with seed
  function seededRandom(seed) {
    let s = (seed || 123456) | 0;
    return function () {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Generate continent dot clusters on a sphere
  function generateGlobeData() {
    const rng = seededRandom(20261028);
    function jitter() {
      return (rng() + rng() + rng() - 1.5) / 1.5;
    }

    // [Center Lat, Center Lon, Count, Spread]
    const clusters = [
      [38, -98, 220, 14],    // North America
      [52, 10, 200, 10],     // Europe
      [22, 78, 190, 10],     // South Asia / India
      [34, 110, 180, 12],    // East Asia
      [1, 104, 100, 6],      // Southeast Asia
      [-25, 134, 110, 9],    // Australia
      [-12, -52, 130, 10],   // South America
      [8, 20, 110, 11],      // Africa
      [25, 48, 90, 7],       // Middle East
      [36, 138, 80, 6],      // Japan
      [-36, 174, 45, 5],     // New Zealand
      [56, -106, 70, 9],     // Canada
      [19, -99, 60, 6],      // Central America
      [-29, 24, 50, 6]       // Southern Africa
    ];

    const dots = [];
    clusters.forEach(c => {
      for (let i = 0; i < c[2]; i++) {
        dots.push(toCartesian(c[0] + jitter() * c[3], c[1] + jitter() * c[3] * 1.5));
      }
    });

    const hubs = [
      { lat: -33.86, lon: 151.2, label: 'Sydney', color: '#e8c34a' },
      { lat: 1.35, lon: 103.8, label: 'Singapore', color: '#b57fc9' },
      { lat: 19.07, lon: 72.87, label: 'Mumbai', color: '#d99a3d' },
      { lat: 51.5, lon: -0.12, label: 'London', color: '#7db5c9' },
      { lat: 40.71, lon: -74.0, label: 'New York', color: '#7db5c9' },
      { lat: 25.2, lon: 55.27, label: 'Dubai', color: '#e8c34a' },
      { lat: 35.68, lon: 139.69, label: 'Tokyo', color: '#6fa05a' },
      { lat: -23.55, lon: -46.63, label: 'São Paulo', color: '#d99a3d' },
      { lat: 48.85, lon: 2.35, label: 'Paris', color: '#7db5c9' },
      { lat: 52.52, lon: 13.4, label: 'Berlin', color: '#7db5c9' }
    ];

    // Build geodesic spherical arcs between pairs of hubs
    function buildArc(p1, p2) {
      const v1 = toCartesian(p1.lat, p1.lon);
      const v2 = toCartesian(p2.lat, p2.lon);
      const dot = Math.max(-1, Math.min(1, v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]));
      const angle = Math.acos(dot);
      const sinAngle = Math.sin(angle) || 1e-6;
      const points = [];
      const steps = 64;

      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const d1 = Math.sin((1 - u) * angle) / sinAngle;
        const d2 = Math.sin(u * angle) / sinAngle;
        const p = [
          v1[0] * d1 + v2[0] * d2,
          v1[1] * d1 + v2[1] * d2,
          v1[2] * d1 + v2[2] * d2
        ];
        const len = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]) || 1;
        points.push({
          p: [p[0] / len, p[1] / len, p[2] / len],
          rad: 1 + 0.22 * Math.sin(Math.PI * u) // arc height
        });
      }
      return points;
    }

    const arcPairs = [
      [1, 0], [1, 2], [2, 5], [3, 5], [3, 4], [5, 1],
      [4, 7], [3, 8], [8, 9], [4, 3], [6, 1], [0, 6]
    ];
    const arcs = arcPairs.map(pair => buildArc(hubs[pair[0]], hubs[pair[1]]));

    return { dots, hubs, arcs };
  }

  // Draw the interactive globe
  function drawGlobe(ctx, width, height, state, globeData, options) {
    options = options || {};
    const safeW = Math.max(width || 0, 240);
    const safeH = Math.max(height || 0, 240);
    const cx = safeW / 2;
    const cy = safeH / 2;
    const radius = Math.max(Math.min(safeW, safeH) * 0.40, 50);

    const rotY = state.rotY || 0;
    const rotX = state.rotX || -0.15;
    const time = state.time || 0;
    const mouse = state.mouse || null;

    // 3D projection onto 2D canvas
    function project(p3, radScale) {
      radScale = radScale || 1;
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      // Rotate around Y
      const x1 = p3[0] * cosY + p3[2] * sinY;
      const z1 = -p3[0] * sinY + p3[2] * cosY;

      // Rotate around X
      const y2 = p3[1] * cosX - z1 * sinX;
      const z2 = p3[1] * sinX + z1 * cosX;

      const scale = 1 + z2 * 0.12;
      return {
        sx: cx + x1 * radius * radScale * scale,
        sy: cy - y2 * radius * radScale * scale,
        z: z2
      };
    }

    // Outer glow
    const rOuterStart = Math.max(radius * 0.88, 1);
    const rOuterEnd = Math.max(radius * 1.25, 2);
    const glow = ctx.createRadialGradient(cx, cy, rOuterStart, cx, cy, rOuterEnd);
    glow.addColorStop(0, 'rgba(14, 124, 107, 0.28)');
    glow.addColorStop(1, 'rgba(14, 124, 107, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, rOuterEnd, 0, TWO_PI);
    ctx.fill();

    // Sphere body gradient
    const rBodyStart = Math.max(radius * 0.05, 0.5);
    const rBodyEnd = Math.max(radius * 1.15, 2);
    const body = ctx.createRadialGradient(
      cx - radius * 0.4,
      cy - radius * 0.45,
      rBodyStart,
      cx,
      cy,
      rBodyEnd
    );
    body.addColorStop(0, '#f2fffc');
    body.addColorStop(0.35, '#c7f6ea');
    body.addColorStop(0.75, '#a3e6d6');
    body.addColorStop(1, '#6ec0af');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TWO_PI);
    ctx.fill();

    // Inner rim shadow
    const rRimStart = Math.max(radius * 0.72, 1);
    const rRimEnd = Math.max(radius, 2);
    const innerShadow = ctx.createRadialGradient(cx, cy, rRimStart, cx, cy, rRimEnd);
    innerShadow.addColorStop(0, 'rgba(6, 50, 44, 0)');
    innerShadow.addColorStop(1, 'rgba(6, 50, 44, 0.22)');
    ctx.fillStyle = innerShadow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TWO_PI);
    ctx.fill();

    // Specular highlight
    const rSpecEnd = Math.max(radius * 0.5, 1);
    const spec = ctx.createRadialGradient(
      cx - radius * 0.42,
      cy - radius * 0.5,
      0,
      cx - radius * 0.42,
      cy - radius * 0.5,
      rSpecEnd
    );
    spec.addColorStop(0, 'rgba(240, 255, 252, 0.65)');
    spec.addColorStop(1, 'rgba(240, 255, 252, 0)');
    ctx.fillStyle = spec;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TWO_PI);
    ctx.fill();

    // Sphere border
    ctx.strokeStyle = 'rgba(14, 124, 107, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TWO_PI);
    ctx.stroke();

    // Latitude graticules
    for (let lat = -60; lat <= 60; lat += 20) {
      const isEquator = lat === 0;
      ctx.beginPath();
      let hasStarted = false;
      for (let lon = 0; lon <= 360; lon += 4) {
        const pt = project(toCartesian(lat, lon));
        if (pt.z > 0.02) {
          if (!hasStarted) {
            ctx.moveTo(pt.sx, pt.sy);
            hasStarted = true;
          } else {
            ctx.lineTo(pt.sx, pt.sy);
          }
        } else {
          hasStarted = false;
        }
      }
      ctx.strokeStyle = isEquator ? 'rgba(11, 99, 87, 0.85)' : 'rgba(14, 124, 107, 0.28)';
      ctx.lineWidth = isEquator ? 1.5 : 0.8;
      if (ctx.setLineDash) {
        ctx.setLineDash(isEquator ? [] : [3, 5]);
      }
      ctx.stroke();
      if (ctx.setLineDash) {
        ctx.setLineDash([]);
      }
    }

    // Continent point dots
    for (let i = 0; i < globeData.dots.length; i++) {
      const pt = project(globeData.dots[i]);
      if (pt.z > 0.02) {
        ctx.fillStyle = 'rgba(9, 74, 66, ' + (0.30 + 0.55 * pt.z) + ')';
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, Math.max(0.5, 1 + pt.z * 1.3), 0, TWO_PI);
        ctx.fill();
      }
    }

    // Draw connection arcs and traveling animated pulses
    ctx.lineCap = 'round';
    globeData.arcs.forEach((arc, arcIdx) => {
      // Glow underlay & main line
      [
        [4.5, 'rgba(18, 166, 143, 0.16)'],
        [1.6, 'rgba(11, 99, 87, 0.8)']
      ].forEach(style => {
        ctx.beginPath();
        let started = false;
        for (let j = 0; j < arc.length; j++) {
          const pt = project(arc[j].p, arc[j].rad);
          if (pt.z > -0.02) {
            if (!started) {
              ctx.moveTo(pt.sx, pt.sy);
              started = true;
            } else {
              ctx.lineTo(pt.sx, pt.sy);
            }
          } else {
            started = false;
          }
        }
        ctx.strokeStyle = style[1];
        ctx.lineWidth = style[0];
        ctx.stroke();
      });

      // Moving packet photon
      if (!options.still) {
        const progress = (time * 0.2 + arcIdx * 0.17) % 1;
        const targetPt = arc[Math.floor(progress * (arc.length - 1))];
        if (targetPt) {
          const pt = project(targetPt.p, targetPt.rad);
          if (pt.z > -0.02) {
            const photonGlow = ctx.createRadialGradient(pt.sx, pt.sy, 0, pt.sx, pt.sy, 8);
            photonGlow.addColorStop(0, 'rgba(18, 166, 143, 0.95)');
            photonGlow.addColorStop(1, 'rgba(18, 166, 143, 0)');
            ctx.fillStyle = photonGlow;
            ctx.beginPath();
            ctx.arc(pt.sx, pt.sy, 8, 0, TWO_PI);
            ctx.fill();

            ctx.fillStyle = '#0b6357';
            ctx.beginPath();
            ctx.arc(pt.sx, pt.sy, 2.5, 0, TWO_PI);
            ctx.fill();
          }
        }
      }
    });

    // Hubs and city labels
    let hoveredHub = null;
    ctx.font = '500 12.5px "IBM Plex Mono", Calibri, sans-serif';

    globeData.hubs.forEach(hub => {
      const pt = project(toCartesian(hub.lat, hub.lon));
      if (pt.z > 0.04) {
        const alpha = Math.min(1, pt.z * 3);
        const scale = (0.75 + 0.35 * pt.z) * (hub.label ? 1 : 0.65);
        ctx.globalAlpha = alpha;

        // Expanding radar ring
        if (!options.still) {
          let ring = (time / 0.9 + hub.lon) % 1;
          if (ring < 0) ring += 1;
          ctx.beginPath();
          ctx.arc(pt.sx, pt.sy, Math.max(1, (9 + ring * 10) * scale), 0, TWO_PI);
          ctx.strokeStyle = 'rgba(6, 50, 44, ' + (0.28 * (1 - ring) * alpha) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Hub pin
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, Math.max(1, 8 * scale), 0, TWO_PI);
        ctx.fillStyle = '#f0fffb';
        ctx.fill();
        ctx.strokeStyle = 'rgba(6, 50, 44, 0.55)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, Math.max(1, 4.8 * scale), 0, TWO_PI);
        ctx.fillStyle = hub.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(6, 50, 44, 0.6)';
        ctx.stroke();

        // City label
        if (hub.label && pt.z > 0.2) {
          ctx.fillStyle = 'rgba(6, 50, 44, ' + alpha + ')';
          ctx.fillText(hub.label, pt.sx + 10 * scale + 6, pt.sy + 4);
        }

        ctx.globalAlpha = 1;

        if (mouse && Math.hypot(mouse.x - pt.sx, mouse.y - pt.sy) < 14) {
          hoveredHub = hub;
        }
      }
    });

    return hoveredHub;
  }

  // Self-contained initialization and loop management
  function initGlobe(canvasOrId, options) {
    const canvas = (typeof canvasOrId === 'string')
      ? document.getElementById(canvasOrId)
      : canvasOrId;
    if (!canvas) return null;

    // Prevent duplicate initializations on same canvas
    if (canvas.__b2bGlobeInstance) {
      return canvas.__b2bGlobeInstance;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const globeData = generateGlobeData();
    const state = {
      rotY: -0.6,
      rotX: -0.18,
      time: 0,
      mouse: null
    };

    let isDragging = false;
    let lastX = 0, lastY = 0;
    let animId = null;
    let cssW = 0, cssH = 0;
    let dpr = 1;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const parent = canvas.parentElement;
      const pw = parent ? parent.clientWidth : 0;
      const ph = parent ? parent.clientHeight : 0;

      cssW = Math.max(rect.width || pw || 480, 260);
      cssH = Math.max(rect.height || ph || 560, 260);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = cssW + 'px';
      canvas.style.height = cssH + 'px';
    }

    resize();

    // Use ResizeObserver for responsive resize
    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
      ro = new ResizeObserver(() => resize());
      ro.observe(canvas.parentElement);
    }
    window.addEventListener('resize', resize, { passive: true });

    // Drag interactions
    function onPointerDown(e) {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      if (canvas.setPointerCapture) {
        try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      }
    }

    function onPointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      state.mouse = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      if (isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        state.rotY += dx * 0.005;
        state.rotX -= dy * 0.004;
        state.rotX = Math.max(-1.1, Math.min(1.1, state.rotX));
        lastX = e.clientX;
        lastY = e.clientY;
      }
    }

    function onPointerUp(e) {
      isDragging = false;
      if (canvas.releasePointerCapture && e && e.pointerId) {
        try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    }

    function onPointerLeave() {
      state.mouse = null;
      isDragging = false;
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('pointercancel', onPointerUp);

    const startTime = Date.now();

    function renderLoop() {
      if (!isDragging) {
        state.rotY += 0.0022;
      }
      state.time = (Date.now() - startTime) / 1000;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      try {
        const hovered = drawGlobe(ctx, cssW, cssH, state, globeData, options);
        canvas.style.cursor = hovered ? 'pointer' : (isDragging ? 'grabbing' : 'grab');
      } catch (err) {
        console.warn('[Globe Draw Error]', err);
      }

      ctx.restore();
      animId = requestAnimationFrame(renderLoop);
    }

    animId = requestAnimationFrame(renderLoop);

    const instance = {
      destroy: function () {
        if (animId) cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
        window.removeEventListener('pointerup', onPointerUp);
        if (ro) ro.disconnect();
        canvas.__b2bGlobeInstance = null;
      },
      state: state
    };

    canvas.__b2bGlobeInstance = instance;
    return instance;
  }

  // Export to global scope
  root.B2B_VIS = {
    toCartesian: toCartesian,
    generateGlobeData: generateGlobeData,
    drawGlobe: drawGlobe,
    initGlobe: initGlobe
  };

  // Auto-init on load if canvas #globe exists
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initGlobe('globe'));
    } else {
      initGlobe('globe');
    }
  }

})(typeof window !== 'undefined' ? window : this);
