'use strict';
/* Modul 3: Kondensatoren einzeln, in Reihe, parallel */
function modCirc(root) {
  const S = { C1: 4, C2: 10, U: 12, mode: 'ser' };
  root.innerHTML = `
  <p class="lead">Zwei Kondensatoren an einer Gleichspannungsquelle. Wähle die Schaltung und sieh, wie sich Spannung, Ladung und Gesamtkapazität verteilen. Startwerte aus deiner Aufgabe 2: 4 µF, 10 µF, 12 V.</p>
  <div class="seg" id="cm">
    <button data-m="one">a) einzeln</button>
    <button data-m="ser" class="on">b) Reihe</button>
    <button data-m="par">c) Parallel</button>
  </div>
  <div class="card" id="svgc"></div>
  <div class="card" id="sl"></div>
  <div class="tiles" id="tiles"></div>
  <div id="bars"></div>
  <h2>Rechenweg</h2><div class="card sol" id="steps"></div>
  <h2>Merke</h2><div id="rule"></div>
  <h2>Formeln erklärt</h2><div id="fc"></div>
  <h2>Quiz</h2><div id="qz"></div>`;
  const box = $('#sl', root);
  const redo = () => draw();
  const s1 = slider(box, { label: 'Kondensator C₁', min: 1, max: 20, step: .5, val: S.C1, f: v => fmt(v) + ' µF' }, v => { S.C1 = v; redo(); });
  const s2 = slider(box, { label: 'Kondensator C₂', min: 1, max: 20, step: .5, val: S.C2, f: v => fmt(v) + ' µF' }, v => { S.C2 = v; redo(); });
  const s3 = slider(box, { label: 'Spannung der Quelle U', min: 1, max: 24, step: 1, val: S.U, f: v => v + ' V' }, v => { S.U = v; redo(); });
  $('#cm', root).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    S.mode = b.dataset.m;
    $('#cm', root).querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    draw();
  });

  const cap = (x, y, vert, lab) => vert
    ? `<line x1="${x}" y1="${y - 30}" x2="${x}" y2="${y - 6}"/><line x1="${x - 16}" y1="${y - 6}" x2="${x + 16}" y2="${y - 6}"/><line x1="${x - 16}" y1="${y + 6}" x2="${x + 16}" y2="${y + 6}"/><line x1="${x}" y1="${y + 6}" x2="${x}" y2="${y + 30}"/><text x="${x + 22}" y="${y + 5}">${lab}</text>`
    : `<line x1="${x - 30}" y1="${y}" x2="${x - 6}" y2="${y}"/><line x1="${x - 6}" y1="${y - 16}" x2="${x - 6}" y2="${y + 16}"/><line x1="${x + 6}" y1="${y - 16}" x2="${x + 6}" y2="${y + 16}"/><line x1="${x + 6}" y1="${y}" x2="${x + 30}" y2="${y}"/><text x="${x - 8}" y="${y - 22}">${lab}</text>`;
  const batt = (x, y1, y2) => { const m = (y1 + y2) / 2; return `<line x1="${x}" y1="${y1}" x2="${x}" y2="${m - 6}"/><line x1="${x - 14}" y1="${m - 6}" x2="${x + 14}" y2="${m - 6}"/><line x1="${x - 7}" y1="${m + 4}" x2="${x + 7}" y2="${m + 4}"/><line x1="${x}" y1="${m + 4}" x2="${x}" y2="${y2}"/><text x="${x + 18}" y="${m - 2}">U</text>`; };
  function svg() {
    const L = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    let s = '<svg class="sch" viewBox="0 -12 300 165">';
    if (S.mode === 'par') {
      s += L(30, 25, 190, 25) + L(30, 125, 190, 125) + batt(30, 25, 125);
      [[110, 'C₁'], [190, 'C₂']].forEach(([x, t]) => { s += L(x, 25, x, 45) + cap(x, 75, true, t) + L(x, 105, x, 125); });
    } else if (S.mode === 'ser') {
      s += L(30, 30, 70, 30) + cap(100, 30, false, 'C₁') + L(106, 30, 160, 30) + cap(190, 30, false, 'C₂') + L(196, 30, 260, 30) + L(260, 30, 260, 120) + L(30, 120, 260, 120) + batt(30, 30, 120);
    } else {
      [[20, 100], [160, 240]].forEach(([bx, cx], i) => {
        s += L(bx, 30, cx, 30) + L(bx, 120, cx, 120) + batt(bx, 30, 120) + L(cx, 30, cx, 45) + cap(cx, 75, true, i ? 'C₂' : 'C₁') + L(cx, 105, cx, 120);
      });
    }
    return s + '</svg>';
  }
  const u = v => fmt(v * 1e6) + ' µC';
  function draw() {
    const C1 = S.C1 * 1e-6, C2 = S.C2 * 1e-6, U = S.U;
    $('#svgc', root).innerHTML = svg();
    let Cg, Q1, Q2, U1, U2, steps, rule;
    if (S.mode === 'one') {
      Q1 = C1 * U; Q2 = C2 * U; U1 = U2 = U; Cg = null;
      steps = `<ol><li>Jeder Kondensator hängt allein an der Quelle: <b>U₁ = U₂ = ${U} V</b>.</li>
        <li>Q₁ = C₁ · U = ${fmt(S.C1)} µF · ${U} V = <b>${u(Q1)}</b></li>
        <li>Q₂ = C₂ · U = ${fmt(S.C2)} µF · ${U} V = <b>${u(Q2)}</b></li></ol>`;
      rule = 'Allein an der Quelle gilt für jeden Kondensator <b>Q = C · U</b>. Die größere Kapazität speichert bei gleicher Spannung mehr Ladung.';
    } else if (S.mode === 'ser') {
      Cg = C1 * C2 / (C1 + C2); const Q = Cg * U; Q1 = Q2 = Q; U1 = Q / C1; U2 = Q / C2;
      const inv = 1 / S.C1 + 1 / S.C2;
      steps = `<ol><li>Kehrwerte addieren: ${fr('1', 'C<sub>ges</sub>')} = ${fr('1', 'C₁')} + ${fr('1', 'C₂')} = ${fr('1', fmt(S.C1) + ' µF')} + ${fr('1', fmt(S.C2) + ' µF')} = ${fmt(inv, 4)} 1/µF</li>
        <li>C<sub>ges</sub> = 1 / ${fmt(inv, 4)} µF⁻¹ = <b>${fmt(Cg * 1e6)} µF</b> (kleiner als der kleinste Einzelwert)</li>
        <li>Die Ladung ist überall gleich: Q = C<sub>ges</sub> · U = ${fmt(Cg * 1e6)} µF · ${U} V = <b>${u(Q)}</b></li>
        <li>U₁ = Q / C₁ = ${u(Q)} / ${fmt(S.C1)} µF = <b>${fmt(U1)} V</b></li>
        <li>U₂ = U − U₁ = ${U} V − ${fmt(U1)} V = <b>${fmt(U - U1)} V</b> (Kontrolle: Q/C₂ = ${fmt(U2)} V)</li></ol>`;
      rule = 'Reihe: <b>gleiche Ladung</b> auf beiden, die <b>Spannung teilt sich</b> (U = U₁ + U₂). Der kleinere Kondensator bekommt die größere Spannung.';
    } else {
      Cg = C1 + C2; Q1 = C1 * U; Q2 = C2 * U; U1 = U2 = U;
      steps = `<ol><li>Kapazitäten addieren: C<sub>ges</sub> = C₁ + C₂ = ${fmt(S.C1)} µF + ${fmt(S.C2)} µF = <b>${fmt(S.C1 + S.C2)} µF</b></li>
        <li>Beide liegen an U = ${U} V.</li>
        <li>Q₁ = C₁ · U = <b>${u(Q1)}</b>, Q₂ = C₂ · U = <b>${u(Q2)}</b></li>
        <li>Q<sub>ges</sub> = Q₁ + Q₂ = <b>${u(Q1 + Q2)}</b> (Kontrolle: C<sub>ges</sub> · U = ${u(Cg * U)})</li></ol>`;
      rule = 'Parallel: <b>gleiche Spannung</b> an beiden, die <b>Ladungen addieren</b> sich, genauso die Kapazitäten.';
    }
    const T = [];
    if (Cg !== null) T.push(['Gesamtkapazität C<sub>ges</sub>', fmt(Cg * 1e6) + ' µF']);
    T.push(['C₁: Spannung U₁', fmt(U1) + ' V'], ['C₂: Spannung U₂', fmt(U2) + ' V'], ['C₁: Ladung Q₁', u(Q1)], ['C₂: Ladung Q₂', u(Q2)]);
    if (S.mode !== 'one') T.push(['Gesamtladung Q<sub>ges</sub>', u(S.mode === 'ser' ? Q1 : Q1 + Q2)]);
    $('#tiles', root).innerHTML = T.map(t => `<div class="tile"><div class="k">${t[0]}</div><div class="v">${t[1]}</div></div>`).join('');
    let bars = '';
    if (S.mode === 'ser') bars = `<div class="card"><b>Spannungsverteilung</b><div class="bar"><span style="width:${U1 / U * 100}%;background:#0d9488">U₁ ${fmt(U1)} V</span><span style="width:${U2 / U * 100}%;background:#d97706">U₂ ${fmt(U2)} V</span></div><small class="hint">Zusammen ergibt sich die Quellenspannung ${U} V.</small></div>`;
    else { const mx = Math.max(Q1, Q2); bars = `<div class="card"><b>Ladungen im Vergleich</b><div class="bar"><span style="width:${Q1 / mx * 100}%;background:#0d9488">Q₁ ${u(Q1)}</span></div><div class="bar"><span style="width:${Q2 / mx * 100}%;background:#d97706">Q₂ ${u(Q2)}</span></div></div>`; }
    $('#bars', root).innerHTML = bars;
    $('#steps', root).innerHTML = steps;
    $('#rule', root).innerHTML = `<div class="tip">${rule}</div>`;
  }
  $('#fc', root).innerHTML = [
    fcard({
      name: 'Reihenschaltung', f: fr('1', 'C<sub>ges</sub>') + ' = ' + fr('1', 'C₁') + ' + ' + fr('1', 'C₂'), open: true,
      syms: [['C<sub>ges</sub>', 'Ersatzkapazität der ganzen Schaltung', 'F'], ['Q', 'auf allen Kondensatoren gleich', 'C'], ['U₁, U₂', 'Teilspannungen, Summe = U', 'V']],
      expl: 'Die Ladung muss „durch“ beide Kondensatoren, daher ist Q überall gleich. Weil U₁ = Q/C₁ und U₂ = Q/C₂ ist, teilt sich die Spannung umgekehrt zu den Kapazitäten auf.',
      tip: 'Merkregel: Reihe → Kehrwerte addieren → Ergebnis ist kleiner als der kleinste Wert.',
      ex: 'Zwei Kondensatoren 4 µF und 10 µF: 1/C = 1/4 + 1/10 = 7/20 → C<sub>ges</sub> = 20/7 µF ≈ 2,86 µF'
    }),
    fcard({
      name: 'Parallelschaltung', f: 'C<sub>ges</sub> = C₁ + C₂',
      expl: 'Parallel vergrößert sich einfach die Plattenfläche (C ~ A). Beide Kondensatoren liegen an der vollen Spannung U.',
      ex: '4 µF + 10 µF = 14 µF, Q<sub>ges</sub> = 14 µF · 12 V = 168 µC'
    }),
    fcard({ name: 'Ladung bestimmen', f: 'Q = C · U', expl: 'Gilt für jeden einzelnen Kondensator und auch für die Ersatzkapazität der Schaltung.' })
  ].join('');
  quiz($('#qz', root), quizFor('circ'));
  draw();
  return { resize: draw };
}
