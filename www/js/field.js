'use strict';
/* Modul 1: Elektrisches Feld, Feldlinien, Äquipotentiallinien */
function modField(root) {
  const st = { tool: 'move', eq: false, fl: true, plates: false, charges: [], probes: [], drag: null };
  const PL = { x0: .2, x1: .8, yT: .3, yB: .7, n: 25 };
  const presets = {
    dip: () => { st.plates = false; st.charges = [{ x: .3, y: .5, q: 1 }, { x: .7, y: .5, q: -1 }]; },
    same: () => { st.plates = false; st.charges = [{ x: .32, y: .5, q: 1 }, { x: .68, y: .5, q: 1 }]; },
    single: () => { st.plates = false; st.charges = [{ x: .5, y: .5, q: 1 }]; },
    plates: () => { st.plates = true; st.charges = []; }
  };
  presets.dip();

  root.innerHTML = `
  <p class="lead">Tippe auf die Fläche, setze Ladungen und ziehe sie herum. Die Feldlinien passen sich sofort an.</p>
  <div class="seg g2" id="pre">
    <button data-p="dip" class="on">Dipol<small>+ und −</small></button>
    <button data-p="same">Gleichnamig<small>+ und +</small></button>
    <button data-p="single">Einzelladung</button>
    <button data-p="plates">Plattenkondensator</button>
  </div>
  <div class="seg g2" id="tools">
    <button data-t="move" class="on">✋ Verschieben</button>
    <button data-t="add+">＋ Ladung</button>
    <button data-t="add-">－ Ladung</button>
    <button data-t="measure">📍 Messpunkt</button>
  </div>
  <div class="cv" id="cv"></div>
  <div class="row">
    <label><input type="checkbox" id="fl" checked> Feldlinien</label>
    <label><input type="checkbox" id="eq"> Äquipotentiallinien</label>
    <button class="btn" id="clr" style="flex:0 0 auto">Leeren</button>
  </div>
  <div class="out" id="ro"></div>
  <h2>Was du siehst</h2>
  <div class="card"><ul style="margin:0;padding-left:18px">
    <li>Feldlinien <b>beginnen auf + und enden auf −</b>. Sie kreuzen sich nie.</li>
    <li>Die Pfeile zeigen die Kraftrichtung auf eine <b>positive</b> Probeladung.</li>
    <li><b>Je enger die Linien, desto höher die Feldstärke.</b> Tippe mit dem Messpunkt an zwei Stellen und vergleiche.</li>
    <li>Auf <b>leitenden Oberflächen</b> (z. B. Kondensatorplatten) enden die Feldlinien immer <b>senkrecht (⊥)</b>.</li>
    <li><b>Homogenes Feld:</b> parallele Linien mit gleichem Abstand. Das gibt es im Inneren des Plattenkondensators. Am Rand ist das Feld <b>nicht homogen</b> (Linien biegen sich nach außen).</li>
    <li><b>Äquipotentiallinien</b> (in 3D: Äquipotentialflächen) verbinden Punkte mit gleicher Spannung. Sie stehen <b>senkrecht auf den Feldlinien</b>. Entlang einer Linie ändert sich die Spannung nicht, quer dazu schon.</li>
  </ul></div>
  <h2>Quiz</h2><div id="qz"></div>`;

  const cv = mkCanvas($('#cv', root), w => w > 500 ? .62 : .95);
  const ro = $('#ro', root);
  const K = 1000;

  function pcs(W, H) {
    if (st.plates) {
      const a = [];
      for (let i = 0; i < PL.n; i++) {
        const x = (PL.x0 + (PL.x1 - PL.x0) * i / (PL.n - 1)) * W;
        a.push({ x, y: PL.yT * H, q: 1.2 }, { x, y: PL.yB * H, q: -1.2 });
      }
      return a;
    }
    return st.charges.map(c => ({ x: c.x * W, y: c.y * H, q: c.q }));
  }
  function fieldAt(x, y, cs) {
    let ex = 0, ey = 0;
    for (const c of cs) {
      const dx = x - c.x, dy = y - c.y;
      let r2 = dx * dx + dy * dy; if (r2 < 16) r2 = 16;
      const k = K * c.q / (r2 * Math.sqrt(r2));
      ex += k * dx; ey += k * dy;
    }
    return [ex, ey];
  }
  function potAt(x, y, cs) {
    let p = 0;
    for (const c of cs) { let r2 = (x - c.x) ** 2 + (y - c.y) ** 2; if (r2 < 16) r2 = 16; p += K * c.q / Math.sqrt(r2); }
    return p;
  }
  function starts(cs, W, H) {
    const a = [];
    if (st.plates) {
      const x0 = PL.x0 * W, x1 = PL.x1 * W, yT = PL.yT * H;
      for (let i = 0; i < 22; i++) a.push({ x: x0 + (x1 - x0) * (i + .5) / 22, y: yT + 3, dir: 1 });
      [[-5, -3], [4, -6], [-12, -3]].forEach(([dx, dy]) => { a.push({ x: x0 + dx, y: yT + dy, dir: 1 }); a.push({ x: x1 - dx, y: yT + dy, dir: 1 }); });
      return a;
    }
    const pos = cs.filter(c => c.q > 0), src = pos.length ? pos : cs.filter(c => c.q < 0), dir = pos.length ? 1 : -1;
    src.forEach(c => {
      const n = Math.round(14 * Math.abs(c.q)) + 2;
      for (let i = 0; i < n; i++) { const t = 2 * Math.PI * (i + .37) / n; a.push({ x: c.x + 7 * Math.cos(t), y: c.y + 7 * Math.sin(t), dir }); }
    });
    return a;
  }
  function trace(s, cs, W, H) {
    let { x, y } = s; const dir = s.dir;
    const sink = cs.filter(c => c.q * dir < 0);
    const pts = [[x, y]];
    for (let i = 0; i < 1600; i++) {
      const [ex, ey] = fieldAt(x, y, cs), m = Math.hypot(ex, ey);
      if (m < 1e-9) break;
      x += dir * ex / m * 2.2; y += dir * ey / m * 2.2;
      pts.push([x, y]);
      if (x < -4 || x > W + 4 || y < -4 || y > H + 4) break;
      if (sink.some(c => (x - c.x) ** 2 + (y - c.y) ** 2 < 49)) break;
    }
    return { pts, dir };
  }
  function drawLines(ctx, cs, W, H) {
    ctx.strokeStyle = col('--fld'); ctx.fillStyle = col('--fld'); ctx.lineWidth = 1.5;
    starts(cs, W, H).forEach(s => {
      const { pts, dir } = trace(s, cs, W, H);
      if (pts.length < 3) return;
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();
      const k = Math.floor(pts.length * .5);
      if (k > 0 && k < pts.length - 1) {
        const a = pts[k], b = pts[k + 1];
        arrowHead(ctx, a[0], a[1], Math.atan2(dir * (b[1] - a[1]), dir * (b[0] - a[0])), 7);
      }
    });
  }
  function drawEq(ctx, cs, W, H) {
    const cell = 7, nx = Math.ceil(W / cell) + 1, ny = Math.ceil(H / cell) + 1;
    const v = new Float32Array(nx * ny), ab = [];
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const p = potAt(i * cell, j * cell, cs); v[j * nx + i] = p; ab.push(Math.abs(p)); }
    ab.sort((a, b) => a - b);
    const P = ab[Math.floor(ab.length * .92)] || 1;
    ctx.strokeStyle = col('--eq'); ctx.lineWidth = 1.2;
    const segs = { 1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]], 5: [[3, 0], [1, 2]], 6: [[0, 2]], 7: [[3, 2]], 8: [[2, 3]], 9: [[0, 2]], 10: [[0, 1], [2, 3]], 11: [[1, 2]], 12: [[1, 3]], 13: [[0, 1]], 14: [[3, 0]] };
    for (let l = -7; l <= 7; l++) {
      const lv = P * l / 7;
      ctx.lineWidth = l === 0 ? 2 : 1.1;
      ctx.beginPath();
      for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
        const v0 = v[j * nx + i], v1 = v[j * nx + i + 1], v2 = v[(j + 1) * nx + i + 1], v3 = v[(j + 1) * nx + i];
        const idx = (v0 > lv ? 1 : 0) | (v1 > lv ? 2 : 0) | (v2 > lv ? 4 : 0) | (v3 > lv ? 8 : 0);
        if (idx === 0 || idx === 15) continue;
        const x = i * cell, y = j * cell, t = (a, b) => (lv - a) / (b - a);
        const Pp = [[x + cell * t(v0, v1), y], [x + cell, y + cell * t(v1, v2)], [x + cell * t(v3, v2), y + cell], [x, y + cell * t(v0, v3)]];
        segs[idx].forEach(s => { ctx.moveTo(Pp[s[0]][0], Pp[s[0]][1]); ctx.lineTo(Pp[s[1]][0], Pp[s[1]][1]); });
      }
      ctx.stroke();
    }
  }
  function sym(ctx, x, y, q, r) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
    ctx.fillStyle = q > 0 ? col('--pos') : col('--neg'); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(x - r * .5, y); ctx.lineTo(x + r * .5, y);
    if (q > 0) { ctx.moveTo(x, y - r * .5); ctx.lineTo(x, y + r * .5); }
    ctx.stroke();
  }
  function draw() {
    cv.fit();
    const { ctx, W, H } = cv;
    const cs = pcs(W, H);
    if (st.eq) drawEq(ctx, cs, W, H);
    if (st.fl) drawLines(ctx, cs, W, H);
    if (st.plates) {
      const x0 = PL.x0 * W, x1 = PL.x1 * W, yT = PL.yT * H, yB = PL.yB * H;
      ctx.fillStyle = col('--pos'); ctx.fillRect(x0 - 3, yT - 7, x1 - x0 + 6, 7);
      ctx.fillStyle = col('--neg'); ctx.fillRect(x0 - 3, yB, x1 - x0 + 6, 7);
      ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'center';
      for (let i = 0; i < PL.n; i += 2) {
        const x = x0 + (x1 - x0) * i / (PL.n - 1);
        ctx.fillStyle = col('--pos'); ctx.fillText('+', x, yT - 11);
        ctx.fillStyle = col('--neg'); ctx.fillText('−', x, yB + 20);
      }
      ctx.fillStyle = col('--mut'); ctx.font = '12px system-ui';
      ctx.fillText('Mitte: homogen', (x0 + x1) / 2, (yT + yB) / 2 + 4);
      ctx.fillText('Rand: nicht homogen', x1 + 4 > W - 70 ? W - 70 : x1 + 4, yT - 24);
    } else {
      st.charges.forEach(c => sym(ctx, c.x * W, c.y * H, c.q, 11));
    }
    st.probes.forEach((p, i) => {
      const x = p.x * W, y = p.y * H;
      ctx.strokeStyle = col('--ink'); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.stroke();
      ctx.fillStyle = col('--ink'); ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'left'; ctx.fillText(i ? 'B' : 'A', x + 9, y - 7);
    });
    readout(cs, W, H);
  }
  function readout(cs, W, H) {
    if (!st.probes.length) {
      ro.innerHTML = st.tool === 'measure' ? '📍 Tippe zwei Punkte an (A und B) und vergleiche die Feldstärke.'
        : st.plates ? 'Im Plattenkondensator-Modus kannst du mit dem 📍 Messpunkt messen. Vergleiche Mitte und Rand!'
        : 'Ziehe die Ladungen mit dem Finger. Mit ＋/－ setzt du neue Ladungen (maximal 6).';
      return;
    }
    const vals = st.probes.map(p => { const [ex, ey] = fieldAt(p.x * W, p.y * H, cs); return Math.hypot(ex, ey) / 0.4; });
    let t = vals.map((v, i) => `${i ? 'B' : 'A'}: E ≈ ${fmt(v, 2)} (relative Einheit)`).join(' · ');
    if (vals.length === 2 && vals[0] > 0 && vals[1] > 0) {
      const r = vals[1] / vals[0];
      t += `<br>${r > 1.05 ? `B hat ein <b>${fmt(r, 2)}×</b> stärkeres Feld als A.` : r < .95 ? `A hat ein <b>${fmt(1 / r, 2)}×</b> stärkeres Feld als B.` : 'Das Feld ist an beiden Punkten (fast) gleich stark → <b>homogen</b>.'}`;
    }
    ro.innerHTML = t;
  }

  /* Bedienung */
  const pos = e => { const r = cv.c.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }; };
  let raf = 0; const redraw = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; draw(); }); };
  cv.c.addEventListener('pointerdown', e => {
    const p = pos(e);
    if (st.tool === 'measure') {
      if (st.probes.length >= 2) st.probes = [];
      st.probes.push(p); draw(); return;
    }
    if (st.plates) return;
    let best = -1, bd = 1e9;
    st.charges.forEach((c, i) => { const d = Math.hypot((c.x - p.x) * cv.W, (c.y - p.y) * cv.H); if (d < bd) { bd = d; best = i; } });
    if (best >= 0 && bd < 22) st.drag = best;
    else if ((st.tool === 'add+' || st.tool === 'add-') && st.charges.length < 6) {
      st.charges.push({ x: p.x, y: p.y, q: st.tool === 'add+' ? 1 : -1 }); st.drag = st.charges.length - 1;
    }
    if (st.drag !== null) cv.c.setPointerCapture(e.pointerId);
    redraw();
  });
  cv.c.addEventListener('pointermove', e => {
    if (st.drag === null) return;
    const p = pos(e); const c = st.charges[st.drag];
    c.x = clamp(p.x, .03, .97); c.y = clamp(p.y, .03, .97); redraw();
  });
  const end = () => { st.drag = null; };
  cv.c.addEventListener('pointerup', end); cv.c.addEventListener('pointercancel', end);

  $('#pre', root).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    presets[b.dataset.p](); st.probes = [];
    $('#pre', root).querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    const tb = $('#tools', root).querySelectorAll('button');
    tb.forEach(x => { x.disabled = st.plates && x.dataset.t !== 'measure'; });
    if (st.plates) setTool('measure'); else if (st.tool === 'measure' && false) setTool('move');
    draw();
  });
  function setTool(t) {
    st.tool = t;
    $('#tools', root).querySelectorAll('button').forEach(x => x.classList.toggle('on', x.dataset.t === t));
  }
  $('#tools', root).addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.disabled) return; setTool(b.dataset.t); draw(); });
  $('#fl', root).addEventListener('change', e => { st.fl = e.target.checked; draw(); });
  $('#eq', root).addEventListener('change', e => { st.eq = e.target.checked; draw(); });
  $('#clr', root).addEventListener('click', () => {
    if (st.plates) { st.probes = []; } else { st.charges = []; st.probes = []; }
    draw();
  });
  quiz($('#qz', root), quizFor('field'));
  draw();
  return { resize: draw };
}
