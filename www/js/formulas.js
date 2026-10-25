'use strict';
/* Modul 7: Formelsammlung mit Erklärungen und Suche */
const FORMULAS = [
  { k: 'feldstärke spannung abstand homogen', name: 'Feldstärke im homogenen Feld', f: 'E = ' + fr('U', 'd'), syms: [['E', 'Feldstärke', 'V/m'], ['U', 'Spannung', 'V'], ['d', 'Abstand der Platten', 'm']], expl: 'Wie stark das elektrische Feld ist: Spannung pro Meter. Je kleiner der Abstand bei gleicher Spannung, desto stärker das Feld.', ex: '2000 V / 0,003 m = 666 667 V/m' },
  { k: 'kapazität ladung spannung', name: 'Kapazität und Ladung', f: 'Q = C · U &nbsp;bzw.&nbsp; C = ' + fr('Q', 'U'), syms: [['Q', 'Ladung', 'C'], ['C', 'Kapazität', 'F = C/V'], ['U', 'Spannung', 'V']], expl: 'Die Kapazität sagt, wie viel Ladung pro Volt gespeichert wird. Im Q-U-Diagramm ist C die Steigung.', ex: '4 µF · 12 V = 48 µC' },
  { k: 'plattenkondensator fläche abstand dielektrikum permittivität', name: 'Kapazität des Plattenkondensators', f: 'C = ε<sub>0</sub> · ε<sub>r</sub> · ' + fr('A', 'd'), syms: [['ε<sub>0</sub>', 'Feldkonstante 8,854·10⁻¹²', 'F/m'], ['ε<sub>r</sub>', 'Material (Luft ≈ 1)', ''], ['A', 'Plattenfläche', 'm²'], ['d', 'Abstand', 'm']], expl: 'Große Fläche und kleiner Abstand machen eine große Kapazität. Ein Dielektrikum (z. B. Glas) vergrößert C um den Faktor εr.', tip: 'Proportionalitäten: C ~ A, C ~ 1/d, C ~ A/d.', ex: 'Ø 12 cm, d = 3 mm → 33,4 pF' },
  { k: 'quelle angeschlossen abgeklemmt konstant', name: 'Angeschlossen oder abgeklemmt?', f: 'U = konst. &nbsp;|&nbsp; Q = konst.', expl: '<b>Angeschlossen</b>: Die Quelle hält U fest, Q ändert sich (Q ~ A, Q ~ 1/d). <b>Abgeklemmt</b>: Die Ladung kann nicht weg, Q bleibt; dann gilt U ~ d und E bleibt konstant. Mit Dielektrikum sinkt U auf U₁/εr.', tip: 'Immer zuerst fragen: Was bleibt konstant, U oder Q?' },
  { k: 'dielektrikum glas relative permittivität abgeklemmt', name: 'εr aus der Spannungsänderung', f: 'ε<sub>r</sub> = ' + fr('U<sub>1</sub>', 'U<sub>2</sub>'), expl: 'Gilt für den abgeklemmten Kondensator (Q konstant): Das Material macht C größer, deshalb sinkt die Spannung.', ex: '2000 V / 1600 V = 1,25' },
  { k: 'reihenschaltung kondensator gesamtkapazität', name: 'Reihenschaltung', f: fr('1', 'C<sub>ges</sub>') + ' = ' + fr('1', 'C₁') + ' + ' + fr('1', 'C₂'), expl: 'Gleiche Ladung auf allen, die Spannung teilt sich: U = U₁ + U₂. C_ges ist kleiner als der kleinste Einzelkondensator.', ex: '4 µF und 10 µF → 2,86 µF' },
  { k: 'parallelschaltung kondensator gesamtkapazität', name: 'Parallelschaltung', f: 'C<sub>ges</sub> = C₁ + C₂', expl: 'Gleiche Spannung an allen, die Ladungen addieren sich.', ex: '4 µF + 10 µF = 14 µF' },
  { k: 'arbeit energie ladung spannung', name: 'Arbeit im elektrischen Feld', f: 'W = q · U', syms: [['W', 'Arbeit/Energie', 'J'], ['q', 'Ladung', 'C'], ['U', 'Spannung', 'V']], expl: 'Im Arbeitsdiagramm (q über U) ist die Arbeit die Fläche unter dem Graphen.', ex: '5 µC · 8 V = 40 µJ' },
  { k: 'steigung kapazität diagramm', name: 'Steigung im Q-U-Diagramm', f: fr('ΔQ', 'ΔU') + ' = tan(α) = C', expl: 'Die Steigung der Ursprungsgeraden ist die Kapazität.' },
  { k: 'energie kondensator', name: 'Energie des Kondensators (Ergänzung)', f: 'W = ½ · C · U² = ½ · Q · U', expl: 'Dreiecksfläche unter der Q-U-Geraden.', ex: '½ · 4 µF · (12 V)² = 288 µJ' },
  { k: 'zeitkonstante tau widerstand rc', name: 'Zeitkonstante', f: 'τ = R · C', syms: [['τ', 'Zeitkonstante', 's'], ['R', 'Widerstand', 'Ω'], ['C', 'Kapazität', 'F']], expl: 'Je größer R und C, desto langsamer wird geladen bzw. entladen.', ex: '100 Ω · 470 µF = 0,047 s' },
  { k: 'entladen exponential rc spannung e-funktion', name: 'Entladen eines Kondensators', f: 'U<sub>C</sub>(t) = U<sub>0</sub> · e<sup>−t/τ</sup>', expl: 'Nach τ noch 36,8 %, nach 5τ noch 0,7 %.', ex: '8 V · e⁻¹ = 2,94 V' },
  { k: 'laden exponential rc spannung e-funktion', name: 'Laden eines Kondensators', f: 'U<sub>C</sub>(t) = U<sub>0</sub> · (1 − e<sup>−t/τ</sup>)', expl: 'Nach τ sind 63,2 % erreicht, nach 5τ praktisch voll.' },
  { k: 'millikan schweben ladung elementarladung', name: 'Millikan: Schwebebedingung', f: 'q · ' + fr('U', 'd') + ' = m · g &nbsp;⇒&nbsp; q = ' + fr('m · g · d', 'U'), expl: 'Elektrische Kraft und Gewichtskraft sind gleich groß, das Tröpfchen schwebt. Alle Ladungen sind ganzzahlige Vielfache der Elementarladung e = 1,602·10⁻¹⁹ C.' },
  { k: 'feldlinien eigenschaften homogen äquipotential', name: 'Regeln für Feldlinien', f: 'E ⊥ Leiteroberfläche', expl: 'Feldlinien beginnen auf +, enden auf −, kreuzen sich nie, enden senkrecht auf Leitern, enger = stärker. Äquipotentialflächen stehen senkrecht zu den Feldlinien.' }
];

function modFormulas(root) {
  root.innerHTML = `<p class="lead">Alle Formeln aus deinen Notizen, jeweils mit Erklärung der Größen. Tippe auf eine Karte zum Aufklappen.</p>
    <input class="srch" id="s" placeholder="Suchen, z. B. Reihe, τ, Arbeit, Feldstärke" type="search"><div id="l"></div>`;
  const list = $('#l', root);
  const show = q => {
    q = (q || '').toLowerCase().trim();
    const r = FORMULAS.filter(f => !q || (f.name + ' ' + f.k + ' ' + plain(f.f)).toLowerCase().includes(q));
    list.innerHTML = r.map(f => fcard(f)).join('') || '<p class="lead">Nichts gefunden.</p>';
  };
  $('#s', root).addEventListener('input', e => show(e.target.value));
  show('');
  return { resize() { } };
}
