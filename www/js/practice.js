'use strict';
/* Quizfragen, Aufgabenblatt und Zufallsaufgaben */
const QUIZ = [
  { id: 'f1', t: 'field', q: 'Wo beginnen elektrische Feldlinien?', o: ['Auf negativen Ladungen', 'Auf positiven Ladungen', 'Sie haben keinen Anfang'], a: 1, why: 'Feldlinien zeigen die Kraft auf eine positive Probeladung. Sie laufen von + nach −.' },
  { id: 'f2', t: 'field', q: 'Wie treffen Feldlinien auf eine leitende Oberfläche?', o: ['Parallel zur Oberfläche', 'Senkrecht (⊥) zur Oberfläche', 'Unter 45°'], a: 1, why: 'Wäre eine Feldkomponente entlang der Oberfläche vorhanden, würden sich die Ladungen im Leiter verschieben, bis sie verschwindet.' },
  { id: 'f3', t: 'field', q: 'Die Feldlinien liegen an einer Stelle sehr eng beieinander. Was heißt das?', o: ['Das Feld ist dort besonders stark', 'Das Feld ist dort schwach', 'Dort sitzt keine Ladung'], a: 0, why: 'Je enger die Linien, desto höher die Feldstärke.' },
  { id: 'f4', t: 'field', q: 'Wann nennt man ein Feld homogen?', o: ['Wenn die Feldlinien parallel mit gleichem Abstand verlaufen', 'Wenn die Linien von einem Punkt ausgehen', 'Wenn keine Ladung beteiligt ist'], a: 0, why: 'Dann hat E überall denselben Betrag und dieselbe Richtung, z. B. im Inneren eines Plattenkondensators.' },
  { id: 'f5', t: 'field', q: 'Wie liegen Äquipotentialflächen zu den Feldlinien?', o: ['Parallel', 'Senkrecht', 'Beliebig'], a: 1, why: 'Auf der Fläche ist die Spannung gleich, senkrecht dazu (entlang der Feldlinie) ändert sie sich.' },
  { id: 'c1', t: 'cap', q: 'Quelle angeschlossen (U konstant): Der Plattenabstand wird halbiert. Was passiert mit der Ladung Q?', o: ['Q verdoppelt sich', 'Q halbiert sich', 'Q bleibt gleich'], a: 0, why: 'C ~ 1/d, also verdoppelt sich C. Mit Q = C·U wächst Q auf das Doppelte.' },
  { id: 'c2', t: 'cap', q: 'Der Kondensator ist abgeklemmt (Q konstant). Du verdoppelst den Plattenabstand. Was passiert mit U?', o: ['U halbiert sich', 'U verdoppelt sich', 'U bleibt gleich'], a: 1, why: 'C halbiert sich, Q bleibt: U = Q/C verdoppelt sich (U ~ d).' },
  { id: 'c3', t: 'cap', q: 'Abgeklemmter Kondensator, Abstand wird verändert. Wie verhält sich die Feldstärke E = U/d?', o: ['Sie bleibt konstant', 'Sie verdoppelt sich', 'Sie halbiert sich'], a: 0, why: 'U und d ändern sich im gleichen Verhältnis, deshalb bleibt E gleich.' },
  { id: 'c4', t: 'cap', q: 'Eine Glasscheibe (εr > 1) wird in den abgeklemmten Kondensator geschoben. Was passiert mit der Spannung?', o: ['Sie steigt', 'Sie sinkt', 'Sie bleibt gleich'], a: 1, why: 'C wird εr-mal größer, Q bleibt: U₂ = U₁/εr.' },
  { id: 'c5', t: 'cap', q: 'Von welchen Größen hängt die Kapazität eines Plattenkondensators ab?', o: ['Nur von der Spannung', 'Von Fläche, Abstand und Dielektrikum', 'Nur von der Ladung'], a: 1, why: 'C = ε0·εr·A/d. Spannung und Ladung ändern C nicht.' },
  { id: 's1', t: 'circ', q: 'Zwei Kondensatoren in Reihe. Was ist auf beiden gleich?', o: ['Die Spannung', 'Die Ladung', 'Die Kapazität'], a: 1, why: 'In einer Reihenschaltung fließt dieselbe Ladung auf beide, die Spannung teilt sich auf.' },
  { id: 's2', t: 'circ', q: 'Zwei Kondensatoren parallel. Wie berechnet sich die Gesamtkapazität?', o: ['C₁ + C₂', '1/C₁ + 1/C₂', 'C₁ · C₂'], a: 0, why: 'Parallel addieren sich die Kapazitäten (Flächen addieren sich).' },
  { id: 's3', t: 'circ', q: 'Die Gesamtkapazität einer Reihenschaltung ist …', o: ['größer als jede Einzelkapazität', 'kleiner als die kleinste Einzelkapazität', 'gleich der Summe'], a: 1, why: '1/C_ges = 1/C₁ + 1/C₂ ergibt immer ein kleineres C_ges.' },
  { id: 'w1', t: 'work', q: 'Was bedeutet die Steigung der Geraden im Q-U-Diagramm?', o: ['Die Kapazität C', 'Die Energie W', 'Den Widerstand R'], a: 0, why: 'ΔQ/ΔU = C, denn Q = C·U.' },
  { id: 'w2', t: 'work', q: 'Woran erkennst du im Arbeitsdiagramm die Arbeit?', o: ['An der Steigung', 'An der Fläche unter dem Graphen', 'Am Schnittpunkt mit der U-Achse'], a: 1, why: 'Die Fläche unter dem Graphen entspricht W (bei konstanter Spannung: W = q·U).' },
  { id: 'w3', t: 'work', q: 'Beim Aufladen eines Kondensators auf U ist die Energie W = …', o: ['Q · U', '½ · Q · U', '2 · Q · U'], a: 1, why: 'Die Fläche unter der Geraden ist ein Dreieck: ½ · Q · U.' },
  { id: 'r1', t: 'rc', q: 'Wie groß ist τ bei R = 100 Ω und C = 470 µF?', o: ['0,047 s', '0,47 s', '47 s'], a: 0, why: 'τ = 100 Ω · 470·10⁻⁶ F = 0,047 s.' },
  { id: 'r2', t: 'rc', q: 'Wie viel % der Anfangsspannung sind beim Entladen nach 1 τ noch übrig?', o: ['63 %', '37 %', '5 %'], a: 1, why: 'e⁻¹ ≈ 0,368, also rund 37 %. Etwa 63 % sind „verloren“.' },
  { id: 'r3', t: 'rc', q: 'Wann gilt ein Kondensator als technisch entladen?', o: ['Nach 1 τ', 'Nach 5 τ', 'Nie'], a: 1, why: 'Nach 5 τ sind es nur noch etwa 0,7 % der Anfangsspannung.' },
  { id: 'r4', t: 'rc', q: 'Du verdoppelst den Widerstand R im RC-Kreis. Was passiert mit dem Entladevorgang?', o: ['Er dauert doppelt so lang', 'Er dauert halb so lang', 'Er bleibt gleich'], a: 0, why: 'τ = R·C wird doppelt so groß.' },
  { id: 'm1', t: 'mill', q: 'Wann schwebt ein Öltröpfchen im Millikan-Versuch?', o: ['Wenn F_el = F_G', 'Wenn U = 0', 'Wenn F_el = 0'], a: 0, why: 'Beim Schweben heben sich elektrische Kraft nach oben und Gewichtskraft nach unten auf.' },
  { id: 'm2', t: 'mill', q: 'Was fand Millikan über die Ladung der Tröpfchen?', o: ['Beliebige Werte', 'Immer ganzzahlige Vielfache von e', 'Immer genau e'], a: 1, why: 'Alle Ladungen waren n·e, damit ist e die kleinste Ladungsportion.' }
];
const quizFor = tag => QUIZ.filter(q => q.t === tag);
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const pick = a => a[Math.floor(Math.random() * a.length)];

/* ---------- Aufgabenblatt (deine Aufgaben) ---------- */
function sheetProblems() {
  const A = Math.PI * .06 ** 2, C = E0 * A / .003, E = 2000 / .003;
  const Cg = 1 / (1 / 4 + 1 / 10);
  const Qs = Cg * 12, U1 = Qs / 4, U2 = 12 - U1;
  return [
    {
      id: 'sh1a', title: '1a) Kapazität und Feldstärke', text: 'Plattenkondensator mit runden Platten, Durchmesser 12 cm, Plattenabstand 3 mm, angelegte Spannung U = 2 kV. Berechne die Kapazität und die Feldstärke.',
      inputs: [{ label: 'Kapazität C', unit: 'pF', ans: C * 1e12 }, { label: 'Feldstärke E', unit: 'kV/m', ans: E / 1e3 }],
      steps: [`Fläche: A = π · r² = π · (0,06 m)² = ${fmt(A, 4)} m²`, `C = ε<sub>0</sub> · A / d = 8,854·10⁻¹² F/m · ${fmt(A, 4)} m² / 0,003 m = ${fmt(C, 3)} F = <b>${fmt(C * 1e12, 3)} pF</b>`, `E = U / d = 2000 V / 0,003 m = ${fmt(E, 6)} V/m = <b>${fmt(E / 1e3, 4)} kV/m</b>`],
      note: 'Kontrolliere die Einheiten in deinen Notizen: C = 3,34·10⁻¹¹ F = <b>33,4 pF</b> (nicht 3,34 pF). Bei E gilt 666 667 V/m = <b>667 kV/m</b>, achte auf den Faktor 1000.'
    },
    {
      id: 'sh1b', title: '1b) Dielektrikum (Glasscheibe)', text: 'Die Spannungsquelle wird abgeklemmt und eine Glasscheibe zwischen die Platten geschoben. Die Spannung sinkt von 2 kV auf 1,6 kV. Berechne εr des Glases.',
      inputs: [{ label: 'Relative Permittivität εr', unit: '', ans: 1.25 }],
      steps: ['Abgeklemmt → die Ladung Q bleibt konstant: Q = C₁ · U₁ = C₂ · U₂', 'Mit Glas: C₂ = εr · C₁. Einsetzen: C₁ · U₁ = εr · C₁ · U₂. C₁ kürzt sich.', 'εr = U₁ / U₂ = 2000 V / 1600 V = <b>1,25</b>']
    },
    {
      id: 'sh2a', title: '2a) Zwei Kondensatoren einzeln', text: 'C₁ = 4 µF und C₂ = 10 µF hängen einzeln an einer Gleichspannungsquelle mit 12 V. Bestimme die Ladung jedes Kondensators.',
      inputs: [{ label: 'Q₁', unit: 'µC', ans: 48 }, { label: 'Q₂', unit: 'µC', ans: 120 }],
      steps: ['Beide liegen an U = 12 V.', 'Q₁ = C₁ · U = 4 µF · 12 V = <b>48 µC</b>', 'Q₂ = C₂ · U = 10 µF · 12 V = <b>120 µC</b>']
    },
    {
      id: 'sh2b', title: '2b) Reihenschaltung', text: 'C₁ = 4 µF und C₂ = 10 µF in Reihe an 12 V. Bestimme die Gesamtkapazität, die Ladung und die Spannungen U₁ und U₂.',
      inputs: [{ label: 'C_ges', unit: 'µF', ans: Cg }, { label: 'Q', unit: 'µC', ans: Qs }, { label: 'U₁', unit: 'V', ans: U1 }, { label: 'U₂', unit: 'V', ans: U2 }],
      steps: ['1/C_ges = 1/4 µF + 1/10 µF = 5/20 + 2/20 = 7/20 µF⁻¹ → C_ges = 20/7 µF = <b>2,857 µF</b>', `Q = C_ges · U = 2,857 µF · 12 V = <b>${fmt(Qs, 4)} µC</b> (= ${fmt(Qs / 10, 3)}·10⁻⁵ C)`, `U₁ = Q / C₁ = ${fmt(Qs, 4)} µC / 4 µF = <b>${fmt(U1, 4)} V</b>`, `U₂ = 12 V − U₁ = <b>${fmt(U2, 4)} V</b>`],
      note: 'Vergleich mit deinen Notizen: Bei der Ladung steht 3,34·10⁻⁵ C, richtig ist <b>3,43·10⁻⁵ C</b> (Zahlendreher). Dein U₁ = 8,6 V und U₂ = 3,4 V passen dagegen zu diesem richtigen Wert.'
    },
    {
      id: 'sh2c', title: '2c) Parallelschaltung', text: 'C₁ = 4 µF und C₂ = 10 µF parallel an 12 V. Bestimme die Gesamtkapazität und die Gesamtladung.',
      inputs: [{ label: 'C_ges', unit: 'µF', ans: 14 }, { label: 'Q_ges', unit: 'µC', ans: 168 }],
      steps: ['C_ges = C₁ + C₂ = 4 µF + 10 µF = <b>14 µF</b>', 'Q₁ = 4 µF · 12 V = 48 µC, Q₂ = 10 µF · 12 V = 120 µC', 'Q_ges = 48 µC + 120 µC = <b>168 µC</b> (oder C_ges · U = 14 µF · 12 V)'],
      note: 'Vergleich mit deinen Notizen: Bei Q₂ steht in einer Zeile „4 µF · 12 V = 120 µC“. Richtig ist <b>10 µF · 12 V = 120 µC</b>.'
    }
  ];
}

/* ---------- Zufallsaufgaben ---------- */
const GEN = [
  () => {
    const D = pick([6, 8, 10, 12, 15, 20]), d = pick([1, 2, 3, 4, 5]), U = pick([500, 1000, 2000, 3000, 5000]);
    const A = Math.PI * (D / 200) ** 2, C = E0 * A / (d / 1000), E = U / (d / 1000);
    return { title: 'Plattenkondensator', text: `Ein Plattenkondensator hat runde Platten mit Durchmesser ${D} cm und den Abstand ${d} mm. Die Spannung beträgt ${U} V (Luft). Berechne C und E.`, inputs: [{ label: 'C', unit: 'pF', ans: C * 1e12 }, { label: 'E', unit: 'kV/m', ans: E / 1e3 }], steps: [`A = π·(${D / 200} m)² = ${fmt(A, 4)} m²`, `C = ε<sub>0</sub>·A/d = ${fmt(C * 1e12, 4)} pF`, `E = U/d = ${U} V / ${d / 1000} m = ${fmt(E / 1e3, 4)} kV/m`] };
  },
  () => {
    const C = pick([2, 3, 4, 5, 8, 10, 22, 47]), U = pick([5, 6, 9, 12, 24]);
    return { title: 'Ladung auf dem Kondensator', text: `Ein Kondensator mit ${C} µF wird an ${U} V angeschlossen. Wie groß ist die Ladung?`, inputs: [{ label: 'Q', unit: 'µC', ans: C * U }], steps: [`Q = C·U = ${C} µF · ${U} V = <b>${C * U} µC</b>`] };
  },
  () => {
    let a = pick([2, 3, 4, 5, 6, 8, 10, 12, 20]), b = pick([2, 3, 4, 5, 6, 8, 10, 12, 20]); if (a === b) b += 1;
    const U = pick([6, 9, 12, 24]), Cg = a * b / (a + b), Q = Cg * U, U1 = Q / a;
    return { title: 'Reihenschaltung', text: `Zwei Kondensatoren (${a} µF und ${b} µF) liegen in Reihe an ${U} V. Berechne C_ges und die Spannung am ${a}-µF-Kondensator.`, inputs: [{ label: 'C_ges', unit: 'µF', ans: Cg }, { label: 'U₁', unit: 'V', ans: U1 }], steps: [`1/C_ges = 1/${a} + 1/${b} = ${fmt(1 / a + 1 / b, 4)} 1/µF → C_ges = <b>${fmt(Cg, 4)} µF</b>`, `Q = C_ges·U = ${fmt(Q, 4)} µC (auf beiden gleich)`, `U₁ = Q/C₁ = ${fmt(Q, 4)} µC / ${a} µF = <b>${fmt(U1, 4)} V</b>`] };
  },
  () => {
    let a = pick([2, 3, 4, 5, 6, 8, 10, 12, 20]), b = pick([2, 3, 4, 5, 6, 8, 10, 12, 20]);
    const U = pick([6, 9, 12, 24]);
    return { title: 'Parallelschaltung', text: `Zwei Kondensatoren (${a} µF und ${b} µF) liegen parallel an ${U} V. Berechne C_ges und die Gesamtladung.`, inputs: [{ label: 'C_ges', unit: 'µF', ans: a + b }, { label: 'Q_ges', unit: 'µC', ans: (a + b) * U }], steps: [`C_ges = ${a} µF + ${b} µF = <b>${a + b} µF</b>`, `Q_ges = C_ges·U = ${a + b} µF · ${U} V = <b>${(a + b) * U} µC</b>`] };
  },
  () => {
    const R = pick([47, 100, 220, 330, 470, 1000]), C = pick([47, 100, 220, 470, 1000]);
    const tau = R * C * 1e-6;
    return { title: 'RC-Kreis', text: `Ein Kondensator mit ${C} µF wird über einen Widerstand von ${R} Ω entladen. Berechne τ und die Zeit, nach der er technisch entladen ist (5τ).`, inputs: [{ label: 'τ', unit: 'ms', ans: tau * 1e3 }, { label: '5τ', unit: 'ms', ans: 5 * tau * 1e3 }], steps: [`τ = R·C = ${R} Ω · ${C}·10⁻⁶ F = ${fmt(tau, 4)} s = <b>${fmt(tau * 1e3, 4)} ms</b>`, `5τ = <b>${fmt(5 * tau * 1e3, 4)} ms</b>`] };
  },
  () => {
    const U0 = pick([4, 5, 6, 8, 9, 12]);
    return { title: 'Spannung nach τ', text: `Ein Kondensator ist auf ${U0} V geladen und wird entladen. Wie groß ist die Spannung nach genau einer Zeitkonstante τ?`, inputs: [{ label: 'U_C(τ)', unit: 'V', ans: U0 * Math.exp(-1) }], steps: [`U_C(τ) = U₀·e⁻¹ = ${U0} V · 0,368 = <b>${fmt(U0 * Math.exp(-1), 3)} V</b>`] };
  },
  () => {
    const U1 = pick([1000, 2000, 3000]), er = pick([1.25, 1.5, 2, 2.5, 4]);
    return { title: 'Dielektrikum', text: `Ein abgeklemmter Plattenkondensator hat die Spannung ${U1} V. Nach dem Einschieben einer Platte misst man ${fmt(U1 / er)} V. Berechne εr.`, inputs: [{ label: 'εr', unit: '', ans: er }], steps: [`Q bleibt konstant → εr = U₁/U₂ = ${U1} V / ${fmt(U1 / er)} V = <b>${fmt(er)}</b>`] };
  },
  () => {
    const q = pick([2, 4, 5, 10, 20]), U = pick([4, 5, 8, 10, 12]);
    return { title: 'Arbeit im Feld', text: `Eine Ladung von ${q} µC durchläuft eine Spannung von ${U} V. Wie groß ist die Arbeit?`, inputs: [{ label: 'W', unit: 'µJ', ans: q * U }], steps: [`W = q·U = ${q} µC · ${U} V = <b>${q * U} µJ</b> (Fläche des Rechtecks im Arbeitsdiagramm)`] };
  }
];

/* ---------- Aufgaben-Anzeige ---------- */
function renderProblem(parent, p, onSolved) {
  const d = document.createElement('div');
  d.className = 'card prob';
  d.innerHTML = `<b>${p.title}</b><p>${p.text}</p>` + p.inputs.map((x, i) => `<div class="inp"><label>${x.label}</label><input type="text" inputmode="decimal" data-i="${i}" placeholder="?" autocomplete="off"><span class="u">${x.unit}</span></div>`).join('') +
    `<div class="row"><button class="btn primary" data-a="chk">Prüfen</button><button class="btn" data-a="sol">Lösung zeigen</button></div><div class="msg"></div><div class="sol" hidden></div>`;
  let solved = false;
  const msg = d.querySelector('.msg'), sol = d.querySelector('.sol');
  const showSol = () => {
    sol.hidden = false;
    sol.innerHTML = '<b>Lösungsweg</b><ol>' + p.steps.map(s => `<li>${s}</li>`).join('') + '</ol>' + (p.note ? `<div class="tip warn">${p.note}</div>` : '');
  };
  d.querySelector('[data-a=sol]').addEventListener('click', showSol);
  d.querySelector('[data-a=chk]').addEventListener('click', () => {
    let ok = true, empty = false;
    d.querySelectorAll('input').forEach((inp, i) => {
      const v = num(inp.value), a = p.inputs[i].ans;
      inp.classList.remove('ok', 'bad');
      if (isNaN(v)) { empty = true; ok = false; return; }
      const good = Math.abs(v - a) <= Math.max(Math.abs(a) * .02, 1e-9);
      inp.classList.add(good ? 'ok' : 'bad'); if (!good) ok = false;
    });
    if (empty) { msg.innerHTML = 'Bitte alle Felder ausfüllen (Komma oder Punkt ist egal).'; return; }
    if (ok) {
      msg.innerHTML = '<b style="color:var(--ok)">✔ Richtig!</b>'; showSol();
      if (!solved) { solved = true; store.set('solved', store.get('solved', 0) + 1); if (onSolved) onSolved(); }
    } else msg.innerHTML = '<span style="color:var(--bad)">Noch nicht ganz.</span> Prüfe Einheiten und Zehnerpotenzen (µ = 10⁻⁶, p = 10⁻¹², k = 10³). Du darfst auf „Lösung zeigen“ tippen.';
  });
  parent.appendChild(d);
}

function modPractice(root) {
  root.innerHTML = `
  <p class="lead">Rechne selbst. Antworten werden mit 2 % Toleranz geprüft. Gelöst: <b id="cnt">0</b></p>
  <div class="seg" id="tabs">
    <button data-t="sheet" class="on">Dein Blatt</button>
    <button data-t="rand">Zufall</button>
    <button data-t="quiz">Quiz</button>
  </div>
  <div id="pane"></div>`;
  const pane = $('#pane', root);
  const cnt = () => { $('#cnt', root).textContent = store.get('solved', 0); };
  function tab(t) {
    pane.innerHTML = '';
    if (t === 'sheet') {
      pane.innerHTML = '<div class="tip">Elektrostatik, Blatt ES-2. Die Lösungswege zeigen auch, wo in deinen Notizen noch kleine Fehler stecken.</div>';
      sheetProblems().forEach(p => renderProblem(pane, p, cnt));
    } else if (t === 'rand') {
      const wrap = document.createElement('div'); pane.appendChild(wrap);
      const nw = () => { wrap.innerHTML = ''; renderProblem(wrap, pick(GEN)(), cnt); };
      const b = document.createElement('button'); b.className = 'btn primary'; b.style.width = '100%'; b.textContent = '↻ Neue Aufgabe'; b.addEventListener('click', nw);
      pane.appendChild(b); nw();
    } else {
      const all = shuffle(QUIZ);
      const info = document.createElement('p'); info.className = 'lead';
      const upd = () => { info.textContent = `Richtig beantwortet (insgesamt): ${Object.keys(store.get('quizok', {})).length} von ${QUIZ.length}`; };
      pane.appendChild(info); upd();
      quiz(pane, all, upd);
    }
  }
  $('#tabs', root).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $('#tabs', root).querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    tab(b.dataset.t);
  });
  cnt(); tab('sheet');
  return { resize() { } };
}
