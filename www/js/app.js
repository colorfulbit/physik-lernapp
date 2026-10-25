'use strict';
const MODS = [
  { id: 'field', ic: '🧲', title: 'Elektrisches Feld', sub: 'Feldlinien, Äquipotentiallinien, homogenes Feld', mount: modField },
  { id: 'cap', ic: '🔋', title: 'Plattenkondensator', sub: 'C, Q, U, E und Dielektrikum', mount: modCap },
  { id: 'circ', ic: '🔌', title: 'Reihe & Parallel', sub: 'Kondensatoren schalten', mount: modCirc },
  { id: 'work', ic: '📈', title: 'Arbeitsdiagramm', sub: 'W = q·U, Steigung = C', mount: modWork },
  { id: 'rc', ic: '⏱️', title: 'RC-Kreis', sub: 'Laden, Entladen, Zeitkonstante τ', mount: modRC },
  { id: 'mill', ic: '🛢️', title: 'Millikan-Versuch', sub: 'Schwebendes Öltröpfchen, Elementarladung', mount: modMill },
  { id: 'form', ic: '📘', title: 'Formelsammlung', sub: 'Alle Formeln erklärt, mit Suche', mount: modFormulas },
  { id: 'prac', ic: '✏️', title: 'Aufgaben & Quiz', sub: 'Dein Blatt, Zufallsaufgaben, Quiz', mount: modPractice }
];
const app = $('#app'), title = $('#title'), back = $('#back');
let active = null;

function home() {
  title.textContent = 'Physik Lernapp · Elektrostatik';
  back.style.display = 'none';
  const seen = store.get('seen', {});
  const qz = Object.keys(store.get('quizok', {})).length;
  app.innerHTML = `
    <p class="lead">Interaktive Lernhilfe zu deinen Physik-Notizen: Elektrisches Feld, Kondensator, Schaltungen, Arbeitsdiagramm, RC-Kreis und Millikan. Wähle ein Thema.</p>
    <div class="grid">${MODS.map(m => `<button class="mod" data-id="${m.id}"><span class="ic">${m.ic}</span><b>${m.title}</b><small>${m.sub}</small>${seen[m.id] ? '<span class="seen">✔ besucht</span>' : ''}</button>`).join('')}</div>
    <div class="card"><b>Dein Fortschritt</b><div class="chips" style="margin-top:6px"><span class="chip">${Object.keys(seen).length} von ${MODS.length} Themen besucht</span><span class="chip">${store.get('solved', 0)} Aufgaben gelöst</span><span class="chip">${qz} von ${QUIZ.length} Quizfragen richtig</span></div></div>
    <p class="lead" style="font-size:.85rem">Tipp: Beginne mit „Elektrisches Feld“ und gehe in der Reihenfolge weiter, so wie deine Notizen aufgebaut sind.</p>`;
  app.querySelectorAll('.mod').forEach(b => b.addEventListener('click', () => { location.hash = b.dataset.id; }));
}
function route() {
  if (active && active.stop) active.stop();
  active = null;
  const id = location.hash.slice(1);
  const m = MODS.find(x => x.id === id);
  window.scrollTo(0, 0);
  if (!m) { home(); return; }
  title.textContent = m.title;
  back.style.display = 'block';
  app.innerHTML = '';
  const d = document.createElement('div');
  app.appendChild(d);
  active = m.mount(d);
  const seen = store.get('seen', {}); seen[m.id] = 1; store.set('seen', seen);
}
back.addEventListener('click', () => { location.hash = ''; });
window.addEventListener('hashchange', route);
let rt = 0;
window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (active && active.resize) active.resize(); }, 150); });
route();
