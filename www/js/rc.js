'use strict';
/* Modul 5: RC-Kreis, Laden und Entladen */
function modRC(root) {
  const S = { R: 100, C: 470, U0: 8, mode: 'dis', t: 1, play: false };
  let raf = 0, last = 0;
  root.innerHTML = `
  <p class="lead">Ein Kondensator wird über einen Widerstand geladen oder entladen. Das passiert nicht sofort, sondern nach einer e-Funktion. Startwerte aus deinem Versuch: 470 µF, 100 Ω, 8 V.</p>
  <div class="seg" id="cm">
    <button data-m="chg">Laden<small>Ladekreis</small></button>
    <button data-m="dis" class="on">Entladen<small>Entladekreis</small></button>
  </div>
  <div class="cv" id="cv"></div>
  <div class="card" id="sl"></div>
  <div class="row"><button class="btn primary" id="play">▶ Abspielen</button></div>
  <div class="tiles" id="tiles"></div>
  <div class="card"><b>Zeitkonstante τ in Schritten</b><div id="tab"></div></div>
  <div class="tip warn">⚠ Einheit beachten: 470 µF = 470·10⁻⁶ F. (470 mF wären 1000-mal mehr und τ = 47 s.)</div>
  <h2>Formeln erklärt</h2><div id="fc"></div>
  <h2>Quiz</h2><div id="qz"></div>`;
  const cv = mkCanvas($('#cv', root), .7);
  const box = $('#sl', root);
  const tau = () => S.R * S.C * 1e-6;
  const sR = slider(box, { label: 'Widerstand R', log: true, min: 10, max: 1000, val: S.R, f: v => v + ' Ω' }, v => { S.R = v; draw(); });
  const sC = slider(box, { label: 'Kapazität C', log: true, min: 10, max: 1000, val: S.C, f: v => v + ' µF' }, v => { S.C = v; draw(); });
  const sU = slider(box, { label: 'Quellenspannung U₀', min: 1, max: 12, step: 1, val: S.U0, f: v => v + ' V' }, v => { S.U0 = v; draw(); });
  const sT = slider(box, { label: 'Zeit t (in Vielfachen von τ)', min: 0, max: 6, step: .05, val: S.t, f: v => fmt(v, 2) + ' τ' }, v => { S.t = v; stop(); draw(); });
  const Uc = x => S.mode === 'dis' ? S.U0 * Math.exp(-x) : S.U0 * (1 - Math.exp(-x));
  $('#cm', root).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    S.mode = b.dataset.m;
    $('#cm', root).querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    draw();
  });
  function stop() { S.play = false; cancelAnimationFrame(raf); $('#play', root).textContent = '▶ Abspielen'; }
  $('#play', root).addEventListener('click', () => {
    if (S.play) { stop(); return; }
    S.play = true; if (S.t >= 5.95) S.t = 0; last = 0;
    $('#play', root).textContent = '⏸ Pause';
    const step = ts => {
      if (!S.play) return;
      if (last) S.t += (ts - last) / 1000 * 1.2;
      last = ts;
      if (S.t >= 6) { S.t = 6; sT.set(S.t); draw(); stop(); return; }
      sT.set(S.t); draw(); raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  });
  function draw() {
    cv.fit();
    const { ctx, W, H } = cv;
    const T = tau(), U0 = S.U0;
    const tx = v => { const t = v * T; return si(t, 's', 2); };
    const fm = frame(ctx, W, H, { xmax: 6, ymax: U0, nx: 6, ny: 4, xf: v => v === 0 ? '0' : tx(v), yf: v => fmt(v) + ' V', xlab: 't', ylab: 'U_C' });
    const { X, Y } = fm;
    /* Markierungen */
    ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2;
    const lvl = S.mode === 'dis' ? U0 * Math.exp(-1) : U0 * (1 - Math.exp(-1));
    ctx.strokeStyle = col('--fld'); ctx.beginPath(); ctx.moveTo(X(0), Y(lvl)); ctx.lineTo(X(1), Y(lvl)); ctx.lineTo(X(1), Y(0)); ctx.stroke();
    ctx.strokeStyle = col('--pos'); ctx.beginPath(); ctx.moveTo(X(5), Y(0)); ctx.lineTo(X(5), Y(U0 * .55)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = col('--fld'); ctx.font = '11px system-ui'; ctx.textAlign = 'left';
    ctx.fillText(S.mode === 'dis' ? '37 % bei τ' : '63 % bei τ', X(1) + 8, S.mode === 'dis' ? Y(lvl) - 6 : Y(lvl) + 16);
    ctx.fillStyle = col('--pos'); ctx.textAlign = 'right'; ctx.fillText('5τ: technisch ' + (S.mode === 'dis' ? 'entladen' : 'voll'), X(5) - 4, Y(U0 * .5));
    /* Kurve */
    ctx.strokeStyle = col('--acc'); ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i <= 240; i++) { const x = 6 * i / 240; const px = X(x), py = Y(Uc(x)); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke();
    ctx.fillStyle = col('--acc'); ctx.beginPath(); ctx.arc(X(S.t), Y(Uc(S.t)), 6, 0, 7); ctx.fill();
    const u = Uc(S.t);
    $('#tiles', root).innerHTML = [
      ['Zeitkonstante τ = R · C', si(T, 's')],
      ['Zeit t', si(S.t * T, 's')],
      ['Spannung U<sub>C</sub>(t)', fmt(u, 3) + ' V'],
      [S.mode === 'dis' ? 'Noch übrig' : 'Schon geladen', fmt(u / U0 * 100, 3) + ' %']
    ].map(t => `<div class="tile"><div class="k">${t[0]}</div><div class="v">${t[1]}</div></div>`).join('');
    let rows = '<table class="sym">';
    for (let k = 1; k <= 5; k++) rows += `<tr><td style="font-style:normal">${k} τ = ${si(k * T, 's', 3)}</td><td style="text-align:left;color:inherit;font-style:normal">${fmt(Uc(k), 3)} V</td><td>${fmt(Uc(k) / U0 * 100, 3)} %</td></tr>`;
    $('#tab', root).innerHTML = rows + '</table>';
  }
  $('#fc', root).innerHTML = [
    fcard({
      name: 'Zeitkonstante', f: 'τ = R · C', open: true,
      syms: [['τ', 'Tau: Maß dafür, wie schnell geladen/entladen wird', 's'], ['R', 'Widerstand im Kreis', 'Ω'], ['C', 'Kapazität', 'F']],
      expl: 'Großer Widerstand bremst den Strom, große Kapazität braucht viel Ladung. Beides macht τ größer und den Vorgang langsamer.',
      ex: 'τ = 100 Ω · 470·10⁻⁶ F = 0,047 s',
      tip: 'Nach <b>1 τ</b> hat sich die Spannung beim Entladen auf ca. 37 % verkleinert (63 % „verloren“). Beim Laden ist sie auf 63 % gestiegen.'
    }),
    fcard({
      name: 'Entladen', f: 'U<sub>C</sub>(t) = U<sub>0</sub> · e<sup>−t/τ</sup> = U<sub>0</sub> · e<sup>−t/(R·C)</sup>',
      syms: [['U<sub>C</sub>(t)', 'Kondensatorspannung zur Zeit t', 'V'], ['U<sub>0</sub>', 'Spannung am Anfang', 'V'], ['e', 'Eulersche Zahl ≈ 2,718', ''], ['t', 'vergangene Zeit', 's']],
      expl: 'Die Spannung fällt anfangs schnell, später immer langsamer (exponentiell). Sie erreicht rechnerisch nie ganz null.',
      ex: 'Für t = τ: e<sup>−1</sup> = 0,368 → 0,368 · 8 V = <b>2,94 V</b>'
    }),
    fcard({
      name: 'Laden', f: 'U<sub>C</sub>(t) = U<sub>0</sub> · (1 − e<sup>−t/τ</sup>)',
      expl: 'Genau das Spiegelbild: Anfangs wächst die Spannung schnell, dann nähert sie sich U₀.',
      ex: 'Für t = τ: 1 − e<sup>−1</sup> = <b>0,632</b> → 63,2 % von U₀'
    }),
    fcard({
      name: '5-τ-Regel', f: 't ≈ 5 · τ',
      expl: 'Nach 5 τ sind es nur noch 0,7 % der Anfangsspannung. Das nennt man „technisch entladen“ (bzw. voll geladen).',
      ex: 't<sub>5</sub> = 5 · 0,047 s = <b>0,235 s</b>'
    })
  ].join('');
  quiz($('#qz', root), quizFor('rc'));
  draw();
  return { resize: draw, stop };
}
