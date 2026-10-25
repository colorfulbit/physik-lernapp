'use strict';
/* Modul 2: Plattenkondensator (Experiment-Simulator) */
function modCap(root) {
  const S = { U: 2000, d: 3, D: 12, er: 1, mode: 'U', Q: 0 };
  const der = () => {
    const A = Math.PI * Math.pow(S.D / 200, 2);
    const C = E0 * S.er * A / (S.d / 1000);
    let U, Q;
    if (S.mode === 'U') { U = S.U; Q = C * U; } else { Q = S.Q; U = Q / C; }
    return { A, C, U, Q, E: U / (S.d / 1000), W: .5 * Q * U };
  };
  const R0 = (() => { const A = Math.PI * .06 * .06, C = E0 * A / .003, U = 2000; return { C, U, Q: C * U, E: U / .003, W: .5 * C * U * U }; })();

  root.innerHTML = `
  <p class="lead">Ein Plattenkondensator speichert Ladung. Verändere Abstand, Fläche und Material und beobachte, was <b>konstant bleibt</b> und was sich ändert.</p>
  <div class="seg" id="cm">
    <button data-m="U" class="on">🔌 Quelle angeschlossen<small>U bleibt konstant</small></button>
    <button data-m="Q">✂ abgeklemmt<small>Q bleibt konstant</small></button>
  </div>
  <div class="cv" id="cv"></div>
  <div class="tiles" id="tiles"></div>
  <div class="card" id="sl"></div>
  <div class="row"><button class="btn primary" id="b1b">Aufgabe 1b nachstellen</button><button class="btn" id="rst">Zurücksetzen</button></div>
  <div class="out" id="msg">Startwerte wie in deinem Aufgabenblatt: Ø 12 cm, d = 3 mm, U = 2 kV.</div>
  <h2>Die Regeln</h2><div id="rules"></div>
  <h2>Formeln erklärt</h2><div id="fc"></div>
  <h2>Quiz</h2><div id="qz"></div>`;

  const cv = mkCanvas($('#cv', root), .74);
  const sl = {};
  const box = $('#sl', root);
  const upd = () => { draw(); };
  sl.U = slider(box, { label: 'Spannung U', min: 0, max: 6000, step: 50, val: S.U, f: v => si(v, 'V') }, v => { S.U = v; upd(); });
  sl.d = slider(box, { label: 'Plattenabstand d', min: 1, max: 20, step: .5, val: S.d, f: v => fmt(v) + ' mm' }, v => { S.d = v; upd(); });
  sl.D = slider(box, { label: 'Plattendurchmesser D (Fläche A = π·(D/2)²)', min: 2, max: 20, step: 1, val: S.D, f: v => v + ' cm' }, v => { S.D = v; upd(); });
  sl.er = slider(box, { label: 'Dielektrikum εr (1 = Luft, Glas ≈ 5–10)', min: 1, max: 10, step: .05, val: S.er, f: v => fmt(v) }, v => { S.er = v; upd(); });

  function setMode(m) {
    if (m === S.mode) return;
    const r = der();
    if (m === 'Q') { S.Q = r.Q; } else { S.U = clamp(Math.round(r.U / 50) * 50, 0, 6000); sl.U.set(S.U); }
    S.mode = m;
    $('#cm', root).querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.m === m));
    upd();
  }
  $('#cm', root).addEventListener('click', e => { const b = e.target.closest('button'); if (b) setMode(b.dataset.m); });
  $('#rst', root).addEventListener('click', () => {
    Object.assign(S, { U: 2000, d: 3, D: 12, er: 1, mode: 'U', Q: 0 });
    sl.U.set(2000); sl.d.set(3); sl.D.set(12); sl.er.set(1);
    $('#cm', root).querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.m === 'U'));
    $('#msg', root).innerHTML = 'Zurückgesetzt auf Ø 12 cm, d = 3 mm, U = 2 kV.';
    upd();
  });
  $('#b1b', root).addEventListener('click', () => {
    Object.assign(S, { U: 2000, d: 3, D: 12, er: 1, mode: 'U' });
    S.Q = der().Q; S.mode = 'Q'; S.er = 1.25;
    sl.U.set(2000); sl.d.set(3); sl.D.set(12); sl.er.set(1.25);
    $('#cm', root).querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.m === 'Q'));
    $('#msg', root).innerHTML = 'Aufgabe 1b: Quelle abgeklemmt, Glasscheibe eingeschoben. Die Ladung Q bleibt gleich, C wächst auf das εr-Fache, deshalb sinkt U von 2000 V auf 1600 V. Umgekehrt gilt: <b>εr = U₁ / U₂ = 2000 V / 1600 V = 1,25</b>.';
    upd();
  });

  const ratio = (x, x0) => { const r = x / x0; return Math.abs(r - 1) < .005 ? 'wie am Start' : '×' + fmt(r, 3) + ' gegenüber Start'; };
  function tiles(r) {
    const T = [['C', 'Kapazität C', si(r.C, 'F'), ratio(r.C, R0.C), false],
    ['Q', 'Ladung Q', si(r.Q, 'C'), ratio(r.Q, R0.Q), S.mode === 'Q'],
    ['U', 'Spannung U', si(r.U, 'V'), ratio(r.U, R0.U), S.mode === 'U'],
    ['E', 'Feldstärke E = U/d', si(r.E, 'V/m'), ratio(r.E, R0.E), false]];
    $('#tiles', root).innerHTML = T.map(t => `<div class="tile${t[4] ? ' const' : ''}"><div class="k">${t[1]}${t[4] ? ' · bleibt konstant' : ''}</div><div class="v">${t[2]}</div><div class="r">${t[3]}</div></div>`).join('')
      + `<div class="tile" style="grid-column:1/3"><div class="k">Gespeicherte Energie W = ½·Q·U <small>(Ergänzung)</small></div><div class="v">${si(r.W, 'J')}</div></div>`;
  }
  function rules() {
    $('#rules', root).innerHTML = `
    <div class="rule${S.mode === 'U' ? ' on' : ''}"><b>🔌 Spannungsquelle angeschlossen → U = konstant</b><ul>
      <li>Q ~ 1/d: je <b>geringer der Abstand</b>, desto mehr Kapazität (für Ladung).</li>
      <li>Q ~ A: je <b>größer die Plattenfläche</b>, desto mehr Ladung passt drauf.</li>
      <li>εr (Material des Dielektrikums) wirkt wie ein Faktor auf C und damit auf Q.</li></ul></div>
    <div class="rule${S.mode === 'Q' ? ' on' : ''}"><b>✂ Kondensator abgeklemmt → Q = konstant</b><ul>
      <li>Die Ladung kann nicht abfließen, also bleibt Q gleich.</li>
      <li>U ~ d: Abstand doppelt → Spannung doppelt.</li>
      <li>Dann ist E = U/d <b>konstant</b>: Die Feldstärke hängt nur von der Ladung pro Fläche ab.</li>
      <li>Mit Dielektrikum: C wird εr-mal größer, also sinkt U auf U₁/εr.</li></ul></div>`;
  }
  function draw() {
    const r = der();
    cv.fit();
    const { ctx, W, H } = cv;
    const gap = 60 + (S.d - 1) / 19 * (H * .34);
    const pw = W * (.22 + .5 * (S.D - 2) / 18);
    const cx = W * .52, x0 = cx - pw / 2;
    const yT = H / 2 - gap / 2, yB = H / 2 + gap / 2;
    if (S.er > 1) { ctx.fillStyle = col('--eq'); ctx.globalAlpha = .12 + .4 * (S.er - 1) / 9; ctx.fillRect(x0, yT, pw, gap); ctx.globalAlpha = 1; ctx.fillStyle = col('--mut'); ctx.font = '12px system-ui'; ctx.textAlign = 'left'; ctx.fillText('Dielektrikum εr = ' + fmt(S.er), x0, yT - 11); }
    ctx.fillStyle = col('--pos'); ctx.fillRect(x0, yT - 7, pw, 7);
    ctx.fillStyle = col('--neg'); ctx.fillRect(x0, yB, pw, 7);
    const nq = clamp(Math.round(8 * r.Q / R0.Q * (pw / (W * .4))), 1, 40);
    ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center';
    for (let i = 0; i < nq; i++) {
      const x = x0 + pw * (i + .5) / nq;
      ctx.fillStyle = col('--pos'); ctx.fillText('+', x, yT + 14);
      ctx.fillStyle = col('--neg'); ctx.fillText('−', x, yB - 4);
    }
    const nl = clamp(Math.round(8 * r.E / R0.E * (pw / (W * .4))), 1, 60);
    ctx.strokeStyle = col('--fld'); ctx.fillStyle = col('--fld'); ctx.lineWidth = 1.5;
    for (let i = 0; i < nl; i++) {
      const x = x0 + pw * (i + .5) / nl;
      ctx.beginPath(); ctx.moveTo(x, yT + 22); ctx.lineTo(x, yB - 19); ctx.stroke();
      arrowHead(ctx, x, yB - 17, Math.PI / 2, 6);
    }
    const ax = x0 + pw + 18;
    ctx.strokeStyle = col('--ink'); ctx.fillStyle = col('--ink'); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(ax, yT); ctx.lineTo(ax, yB); ctx.stroke();
    arrowHead(ctx, ax, yT, -Math.PI / 2, 6); arrowHead(ctx, ax, yB, Math.PI / 2, 6);
    ctx.font = '12px system-ui'; ctx.textAlign = 'center'; ctx.save(); ctx.translate(ax + 14, H / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('d = ' + fmt(S.d) + ' mm', 0, 0); ctx.restore();
    const by = yB + 26;
    ctx.beginPath(); ctx.moveTo(x0, by); ctx.lineTo(x0 + pw, by); ctx.stroke();
    arrowHead(ctx, x0, by, Math.PI, 6); arrowHead(ctx, x0 + pw, by, 0, 6);
    ctx.textAlign = 'center'; ctx.fillText('D = ' + S.D + ' cm  →  A = ' + fmt(r.A * 1e4, 3) + ' cm²', cx, by + 16);
    /* Quelle */
    const bx = 26, my = H / 2;
    ctx.strokeStyle = col('--ink'); ctx.lineWidth = 2; ctx.setLineDash(S.mode === 'Q' ? [5, 5] : []);
    ctx.beginPath(); ctx.moveTo(cx, yT - 7); ctx.lineTo(cx, yT - 24); ctx.lineTo(bx, yT - 24); ctx.lineTo(bx, my - 8);
    ctx.moveTo(bx, my + 2); ctx.lineTo(bx, yB + 24); ctx.lineTo(cx, yB + 24); ctx.lineTo(cx, yB + 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(bx - 11, my - 8); ctx.lineTo(bx + 11, my - 8); ctx.moveTo(bx - 6, my + 2); ctx.lineTo(bx + 6, my + 2); ctx.stroke();
    ctx.fillStyle = col('--mut'); ctx.font = '12px system-ui'; ctx.textAlign = 'left';
    ctx.fillText(S.mode === 'U' ? 'U = ' + siT(r.U, 'V') : '✂ abgeklemmt', 6, H - 8);
    if (S.mode === 'Q') ctx.fillText('U = ' + siT(r.U, 'V') + ' (Voltmeter)', 6, H - 24);
    tiles(r); rules();
    sl.U.disable(S.mode === 'Q');
    if (S.mode === 'Q') { sl.U.inp.value = clamp(r.U, 0, 6000); sl.U.label(si(r.U, 'V') + ' <small>(berechnet)</small>'); }
  }

  $('#fc', root).innerHTML = [
    fcard({
      name: 'Kapazität eines Plattenkondensators', f: 'C = ε<sub>0</sub> · ε<sub>r</sub> · ' + fr('A', 'd'), open: true,
      syms: [['C', 'Kapazität: wie viel Ladung pro Volt passt auf den Kondensator', 'F (Farad)'], ['ε<sub>0</sub>', 'elektrische Feldkonstante = 8,854·10⁻¹²', 'F/m'], ['ε<sub>r</sub>', 'Materialkonstante des Dielektrikums (Vakuum/Luft ≈ 1)', 'ohne Einheit'], ['A', 'Fläche einer Platte (Kreis: A = π·r²)', 'm²'], ['d', 'Abstand der Platten', 'm']],
      expl: 'Große Platten und kleiner Abstand → große Kapazität. Das sind genau deine Proportionalitäten: <b>C ~ A</b>, <b>C ~ 1/d</b>, zusammen <b>C ~ A/d</b>.',
      tip: 'Rechne Abstand und Durchmesser immer erst in Meter um: 3 mm = 0,003 m, Radius 6 cm = 0,06 m.',
      ex: 'Aufgabe 1a: A = π·(0,06 m)² = 0,01131 m², C = 8,854·10⁻¹²·0,01131/0,003 = 3,34·10⁻¹¹ F = <b>33,4 pF</b>'
    }),
    fcard({
      name: 'Ladung auf dem Kondensator', f: 'Q = C · U',
      syms: [['Q', 'gespeicherte Ladung', 'C (Coulomb)'], ['C', 'Kapazität', 'F'], ['U', 'Spannung zwischen den Platten', 'V']],
      expl: 'Je höher die Spannung, desto mehr Ladung. Die Kapazität ist die <b>Proportionalitätskonstante</b> (im Q-U-Diagramm die Steigung der Geraden).',
      ex: '4 µF · 12 V = 48 µC'
    }),
    fcard({
      name: 'Feldstärke im Plattenkondensator', f: 'E = ' + fr('U', 'd'),
      syms: [['E', 'elektrische Feldstärke (im homogenen Feld überall gleich)', 'V/m'], ['U', 'Spannung zwischen den Platten', 'V'], ['d', 'Plattenabstand', 'm']],
      expl: 'Die Spannung verteilt sich auf den Abstand: Je kürzer der Weg, desto steiler das „Spannungsgefälle“, also desto stärker das Feld.',
      ex: 'Aufgabe 1a: E = 2000 V / 0,003 m = 666 667 V/m ≈ <b>667 kV/m</b>'
    }),
    fcard({
      name: 'Energie im Kondensator (Ergänzung)', f: 'W = ½ · C · U² = ½ · Q · U',
      syms: [['W', 'gespeicherte Energie', 'J (Joule)']],
      expl: 'Beim Aufladen steigt die Spannung von 0 bis U. Im Arbeitsdiagramm ist W die Dreiecksfläche unter der Q-U-Geraden, deshalb der Faktor ½.'
    })
  ].join('');
  quiz($('#qz', root), quizFor('cap'));
  draw();
  return { resize: draw };
}
