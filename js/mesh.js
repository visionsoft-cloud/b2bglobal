/**
 * B2B DATA GLOBAL LLC — 3D Interactive Segment Mesh
 * Visualizes Verified Industry Nodes, Geodesic Links & Dynamic Data Clusters
 */

(function (root) {
  'use strict';

  const TWO_PI = Math.PI * 2;

  function seededRng(seed) {
    let s = (seed || 999) | 0;
    return function () {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeMeshData(segments) {
    const rng = seededRng(77);
    const nodes = (segments || []).map((item) => {
      const theta = rng() * TWO_PI;
      const phi = Math.acos(2 * rng() - 1);
      const rad = 0.60 + rng() * 0.40;
      return {
        p: [
          rad * Math.sin(phi) * Math.cos(theta),
          rad * Math.cos(phi),
          rad * Math.sin(phi) * Math.sin(theta)
        ],
        label: item.label,
        color: item.color,
        desc: item.desc,
        size: 9 + rng() * 5
      };
    });

    const edges = [];
    for (let i = 0; i < nodes.length; i++) {
      const distances = [];
      for (let j = 0; j < nodes.length; j++) {
        if (i !== j) {
          const p1 = nodes[i].p;
          const p2 = nodes[j].p;
          const d2 = (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + (p1[2] - p2[2]) ** 2;
          distances.push([j, d2]);
        }
      }
      distances.sort((a, b) => a[1] - b[1]);
      for (let k = 0; k < Math.min(2, distances.length); k++) {
        const edge = i < distances[k][0] ? [i, distances[k][0]] : [distances[k][0], i];
        if (!edges.some(e => e[0] === edge[0] && e[1] === edge[1])) {
          edges.push(edge);
        }
      }
    }

    return { nodes, edges };
  }

  function drawMesh(ctx, width, height, state, meshData, options) {
    options = options || {};
    const safeW = Math.max(width || 0, 240);
    const safeH = Math.max(height || 0, 240);
    const cx = safeW / 2;
    const cy = safeH / 2;
    const radius = Math.max(Math.min(safeW, safeH) * 0.42, 50);

    const rotY = state.rotY || 0;
    const rotX = state.rotX || -0.15;
    const mouse = state.mouse || null;
    const time = state.time || 0;

    function project(p3) {
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      const x1 = p3[0] * cosY + p3[2] * sinY;
      const z1 = -p3[0] * sinY + p3[2] * cosY;

      const y2 = p3[1] * cosX - z1 * sinX;
      const z2 = p3[1] * sinX + z1 * cosX;

      const k = 1 / Math.max(0.1, 1.6 - z2 * 0.5);
      return {
        sx: cx + x1 * radius * k * 1.5,
        sy: cy - y2 * radius * k * 1.5,
        z: z2,
        k: k
      };
    }

    // Radial background glow
    const rBg = Math.max(Math.max(safeW, safeH) * 0.6, 10);
    const bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, rBg);
    bgGlow.addColorStop(0, 'rgba(14, 124, 107, 0.22)');
    bgGlow.addColorStop(1, 'rgba(14, 124, 107, 0)');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, safeW, safeH);

    const projectedNodes = (meshData.nodes || []).map(n => project(n.p));

    // Mouse hover check
    let hoveredIdx = -1;
    if (mouse) {
      for (let i = 0; i < projectedNodes.length; i++) {
        const rad = (meshData.nodes[i].size * projectedNodes[i].k * 0.9) + 8;
        if (Math.hypot(mouse.x - projectedNodes[i].sx, mouse.y - projectedNodes[i].sy) < rad) {
          hoveredIdx = i;
          break;
        }
      }
    }

    // Draw connecting edges
    (meshData.edges || []).forEach((edge, idx) => {
      const n1 = projectedNodes[edge[0]];
      const n2 = projectedNodes[edge[1]];
      if (!n1 || !n2) return;

      const avgZ = ((n1.z + n2.z) / 2 + 1) / 2;
      const isHot = (hoveredIdx === edge[0] || hoveredIdx === edge[1]);

      ctx.strokeStyle = isHot
        ? 'rgba(232, 195, 74, 0.95)'
        : 'rgba(140, 210, 195, ' + (0.22 + 0.3 * avgZ) + ')';
      ctx.lineWidth = isHot ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(n1.sx, n1.sy);
      ctx.lineTo(n2.sx, n2.sy);
      ctx.stroke();

      if (!options.still) {
        const prog = (time * 0.35 + idx * 0.23) % 1;
        const px = n1.sx + (n2.sx - n1.sx) * prog;
        const py = n1.sy + (n2.sy - n1.sy) * prog;
        ctx.fillStyle = 'rgba(232, 195, 74, ' + (0.4 + 0.5 * avgZ) + ')';
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, TWO_PI);
        ctx.fill();
      }
    });

    // Draw nodes (sorted by depth Z)
    const sorted = projectedNodes
      .map((item, idx) => [idx, item.z])
      .sort((a, b) => a[1] - b[1]);

    let activeNode = null;
    ctx.font = '500 11px "IBM Plex Mono", Calibri, sans-serif';

    sorted.forEach(([idx]) => {
      const node = meshData.nodes[idx];
      const proj = projectedNodes[idx];
      const r = Math.max(2, node.size * proj.k * 0.9);
      const isHot = (idx === hoveredIdx);

      if (isHot) activeNode = node;

      // Glow halo
      const rHalo = Math.max(r * 2.2, 3);
      const halo = ctx.createRadialGradient(proj.sx, proj.sy, 0, proj.sx, proj.sy, rHalo);
      halo.addColorStop(0, node.color + (isHot ? 'dd' : '66'));
      halo.addColorStop(1, node.color + '00');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(proj.sx, proj.sy, rHalo, 0, TWO_PI);
      ctx.fill();

      // Node dot
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(proj.sx, proj.sy, r, 0, TWO_PI);
      ctx.fill();

      if (isHot) {
        ctx.strokeStyle = '#e8c34a';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(proj.sx, proj.sy, r + 4, 0, TWO_PI);
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = isHot ? '#ffeeb4' : 'rgba(223, 251, 244, ' + (0.5 + 0.5 * (proj.z + 1) / 2) + ')';
      ctx.fillText(node.label, proj.sx + r + 6, proj.sy + 4);
    });

    return activeNode;
  }

  // Self-contained initialization and loop management
  function initSegmentMesh(canvasOrId, options) {
    const canvas = (typeof canvasOrId === 'string')
      ? document.getElementById(canvasOrId)
      : canvasOrId;
    if (!canvas) return null;

    if (canvas.__b2bMeshInstance) {
      return canvas.__b2bMeshInstance;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const segments = [
      { label: 'IT & Software', color: '#0e7c6b', desc: 'Enterprise SaaS vendors, cloud platforms, VP Engineering & CTO decision-makers.' },
      { label: 'Healthcare & Biotech', color: '#4f9e8f', desc: 'Hospital systems, clinical executives, medical equipment OEMs & lab directors.' },
      { label: 'Industrial & Manufacturing', color: '#d99a3d', desc: 'Automation plant leads, industrial equipment builders & supply chain heads.' },
      { label: 'Financial Services', color: '#7db5c9', desc: 'Commercial banks, wealth managers, institutional lenders & fintech leads.' },
      { label: 'Retail & E-Commerce', color: '#b57fc9', desc: 'Direct-to-consumer brands, retail operators, merchandising & logistics heads.' },
      { label: 'Agriculture & AgTech', color: '#6fa05a', desc: 'Agritech enterprises, food processors, farming co-ops & distributor buyers.' },
      { label: 'Aerospace & Defense', color: '#e8c34a', desc: 'Aviation systems, avionics contractors, defense OEMs & procurement managers.' },
      { label: 'Construction & Real Estate', color: '#b0a06a', desc: 'General contracting executives, civil engineers, developers & asset owners.' }
    ];

    const meshData = makeMeshData(segments);
    const meshState = { rotY: 0.4, rotX: -0.15, mouse: null, time: 0 };

    let isDragging = false;
    let lastX = 0, lastY = 0;
    let animId = null;
    let cssW = 0, cssH = 0;
    let dpr = 1;

    const titleEl = document.getElementById('capTitle');
    const bodyEl = document.getElementById('capBody');

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const parent = canvas.parentElement;
      const pw = parent ? parent.clientWidth : 0;
      const ph = parent ? parent.clientHeight : 0;

      cssW = Math.max(rect.width || pw || 340, 240);
      cssH = Math.max(rect.height || ph || 340, 240);
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
      meshState.mouse = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      if (isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        meshState.rotY += dx * 0.006;
        meshState.rotX -= dy * 0.004;
        meshState.rotX = Math.max(-1.2, Math.min(1.2, meshState.rotX));
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
      meshState.mouse = null;
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
        meshState.rotY += 0.003;
      }
      meshState.time = (Date.now() - startTime) / 1000;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      try {
        const active = drawMesh(ctx, cssW, cssH, meshState, meshData, options);
        canvas.style.cursor = active ? 'pointer' : (isDragging ? 'grabbing' : 'grab');

        if (active && titleEl && bodyEl) {
          titleEl.textContent = active.label + ' — Verified Segment';
          bodyEl.textContent = active.desc;
        }
      } catch (err) {
        console.warn('[Segment Mesh Draw Error]', err);
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
        canvas.__b2bMeshInstance = null;
      },
      state: meshState
    };

    canvas.__b2bMeshInstance = instance;
    return instance;
  }

  root.B2B_MESH = {
    makeMeshData: makeMeshData,
    drawMesh: drawMesh,
    initSegmentMesh: initSegmentMesh
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initSegmentMesh('segmentMesh'));
    } else {
      initSegmentMesh('segmentMesh');
    }
  }

})(typeof window !== 'undefined' ? window : this);
