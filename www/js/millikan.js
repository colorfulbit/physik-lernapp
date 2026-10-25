'use strict';
/* Modul 6: Millikan-Versuch (Schwebe-Methode) */
function modMill(root) {
  const RHO = 886, ETA = 1.81e-5;
  const S = { r: 1, n: 3, U: 300, d: 5, p: .5 };
  let raf = 0, last = 0;
  root.innerHTML = `
  <p class="lead">Millikan hat die Elementarladung gemessen: Ein geladenes Öltröpfchen schwebt im Feld eines Plattenkondensators, wenn die elektrische Kraft genauso groß ist wie die Gewichtskraft. Stelle die Spannung so ein, dass das Tröpfchen steht.</p>
  <div class="cv" id="cv"></div>
  <div class="card" id="sl"></div>
  <div class="row"><button class="btn primary" id="fl">Auf Schwebespannung stellen</button><button class="btn" id="nw">Neues Tröpfchen</button></div>
  <div class="tiles" id="tiles"></div>
  <div class="out" id="ro"></div>
  <h2>Formeln erklärt</h2><div id="fc"></div>
  <h2>Quiz</h2><div id="qz"></div>
  <div class="tip">Hinweis: Dieses Modul ist eine Ergänzung zu deinem Thema „Millikan-Versuch“ (Hausaufgabe). Es beruht auf der Standardphysik des Versuchs, nicht auf deinen Notizen.</div>`;
  const cv = mkCanvas($('#cv', root), .8);
  const box = $('#sl', root);
  const sU = slider(box, { label: 'Spannung U', min: 0, max: 1500, step: 1, val: S.U, f: v => v + ' V' }, v => { S.U = v; draw(); });
  const sn = slider(box, { label: 'Überschussladungen n (q = n·e)', min: 1, max: 10, step: 1, val: S.n, f: v => v + ' e' }, v => { S.n = v; draw(); });
  const sr = slider(box, { label: 'Tröpfchenradius r', min: .5, max: 2, step: .05, val: S.r, f: v => fmt(v) + ' µm' }, v => { S.r = v; draw(); });
  const sd = slider(box, { label: 'Plattenabstand d', min: 3, max: 10, step: .5, val: S.d, f: v => fmt(v) + ' mm' }, v => { S.d = v; draw(); });
  const phys = () => {
    const r = S.r * 1e-6, m = RHO * 4 / 3 * Math.PI * r ** 3, Fg = m * G, d = S.d / 1000;
    const E = S.U / d, Fel = S.n * QE * E, Uf = m * G * d / (S.n * QE);
    const v = (Fg - Fel) / (6 * Math.PI * ETA * r);   // m/s, positiv = fällt
    return { r, m, Fg, d, E, Fel, Uf, v };
  };
  $('#fl', root).addEventListener('click', () => { const p = phys(); S.U = clamp(Math.round(p.Uf), 0, 1500); sU.set(S.U); S.p = .5; draw(); });
  $('#nw', root).addEventListener('click', () => { S.p = .5; draw(); });
  function loop(ts) {
    if (last) { const dt = Math.min(.05, (ts - last) / 1000); const p = phys(); S.p = clamp(S.p + p.v / p.d * 40 * dt, .04, .96); }
    last = ts; draw(true); raf = requestAnimationFrame(loop);
  }
  function draw(fromLoop) {
    const p = phys();
    cv.fit();
    const { ctx, W, H } = cv;
    const x0 = W * .2, x1 = W * .8, yT = H * .14, yB = H * .86;
    ctx.fillStyle = col('--pos'); ctx.fillRect(x0, yT - 8, x1 - x0, 8);
    ctx.fillStyle = col('--neg'); ctx.fillRect(x0, yB, x1 - x0, 8);
    ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center';
    for (let i = 0; i < 9; i++) { const x = x0 + (x1 - x0) * (i + .5) / 9; ctx.fillStyle = col('--pos'); ctx.fillText('+', x, yT + 14); ctx.fillStyle = col('--neg'); ctx.fillText('−', x, yB - 4); }
    const nl = clamp(Math.round(p.E / 3e5 * 6), 0, 14);
    ctx.strokeStyle = col('--fld'); ctx.fillStyle = col('--fld'); ctx.lineWidth = 1.3;
    for (let i = 0; i < nl; i++) { const x = x0 + (x1 - x0) * (i + .5) / nl; ctx.beginPath(); ctx.moveTo(x, yT + 22); ctx.lineTo(x, yB - 16); ctx.stroke(); arrowHead(ctx, x, yB - 15, Math.PI / 2, 5); }
    const dy = yT + (yB - yT) * S.p, dx = W / 2, R = 8 + (S.r - .5) * 5;
    ctx.fillStyle = col('--ink'); ctx.beginPath(); ctx.arc(dx, dy, R, 0, 7); ctx.fill();
    const sc = 46 / Math.max(p.Fg, p.Fel, 1e-30);
    ctx.lineWidth = 3;
    ctx.strokeStyle = col('--bad'); ctx.fillStyle = col('--bad'); ctx.beginPath(); ctx.moveTo(dx + R + 8, dy); ctx.lineTo(dx + R + 8, dy + p.Fg * sc); ctx.stroke(); arrowHead(ctx, dx + R + 8, dy + p.Fg * sc + 2, Math.PI / 2, 7);
    ctx.strokeStyle = col('--ok'); ctx.fillStyle = col('--ok'); ctx.beginPath(); ctx.moveTo(dx - R - 8, dy); ctx.lineTo(dx - R - 8, dy - p.Fel * sc); ctx.stroke(); arrowHead(ctx, dx - R - 8, dy - p.Fel * sc - 2, -Math.PI / 2, 7);
    ctx.font = '12px system-ui'; ctx.textAlign = 'left'; ctx.fillStyle = col('--bad'); ctx.fillText('F_G', dx + R + 14, dy + 14);
    ctx.textAlign = 'right'; ctx.fillStyle = col('--ok'); ctx.fillText('F_el', dx - R - 14, dy - 8);
    ctx.fillStyle = col('--mut'); ctx.textAlign = 'left'; ctx.fillText('d = ' + fmt(S.d) + ' mm', x1 + 6 > W - 62 ? W - 62 : x1 + 6, H / 2);
    const diff = (p.Fel - p.Fg) / p.Fg;
    const state = Math.abs(diff) < .01 ? '<b style="color:var(--ok)">Schwebezustand!</b> F_el = F_G' : diff > 0 ? 'Elektrische Kraft überwiegt → Tröpfchen steigt' : 'Gewichtskraft überwiegt → Tröpfchen sinkt';
    $('#ro', root).innerHTML = `${state}<br><small class="hint">Schwebespannung für dieses Tröpfchen: <b>${fmt(p.Uf, 4)} V</b> · Bewegung im Zeitraffer (×40, mit Stokes-Reibung).</small>`;
    if (!fromLoop || !draw.t || performance.now() - draw.t > 120) {
      draw.t = performance.now();
      $('#tiles', root).innerHTML = [['Masse m', si(p.m * 1000, 'g')], ['Gewichtskraft F_G = m·g', si(p.Fg, 'N')], ['Feldstärke E = U/d', si(p.E, 'V/m')], ['Elektrische Kraft F_el = n·e·E', si(p.Fel, 'N')]]
        .map(t => `<div class="tile"><div class="k">${t[0]}</div><div class="v">${t[1]}</div></div>`).join('');
    }
  }
  $('#fc', root).innerHTML = [
    fcard({
      name: 'Schwebebedingung', f: 'F<sub>el</sub> = F<sub>G</sub> &nbsp;⇒&nbsp; q · ' + fr('U', 'd') + ' = m · g', open: true,
      syms: [['q', 'Ladung des Tröpfchens (n · e)', 'C'], ['U', 'Spannung zwischen den Platten', 'V'], ['d', 'Plattenabstand', 'm'], ['m', 'Masse des Tröpfchens', 'kg'], ['g', 'Fallbeschleunigung 9,81', 'm/s²']],
      expl: 'Nach oben zieht die elektrische Kraft F = q·E, nach unten die Gewichtskraft m·g. Beim Schweben sind beide gleich groß, das Tröpfchen ruht.',
      tip: 'Das Tröpfchen muss negativ geladen sein, wenn die obere Platte positiv ist, sonst wird es nach unten gedrückt.'
    }),
    fcard({
      name: 'Ladung berechnen', f: 'q = ' + fr('m · g · d', 'U') + ' = n · e',
      syms: [['e', 'Elementarladung = 1,602·10⁻¹⁹', 'C'], ['n', 'ganze Zahl (Anzahl Elementarladungen)', '']],
      expl: 'Millikan fand: Jede gemessene Ladung ist ein <b>ganzzahliges Vielfaches</b> von e. Daher gibt es eine kleinste Ladungsportion, die Elementarladung.'
    }),
    fcard({
      name: 'Masse des Öltröpfchens', f: 'm = ρ · V = ρ · ' + fr('4', '3') + ' · π · r³',
      syms: [['ρ', 'Dichte des Öls (hier 886)', 'kg/m³'], ['r', 'Radius des Tröpfchens (≈ 1 µm)', 'm']],
      expl: 'Das Tröpfchen ist kugelförmig, also wird zuerst das Kugelvolumen berechnet und dann mit der Dichte multipliziert.'
    })
  ].join('');
  quiz($('#qz', root), quizFor('mill'));
  draw();
  raf = requestAnimationFrame(loop);
  return { resize: () => draw(), stop() { cancelAnimationFrame(raf); } };
}
