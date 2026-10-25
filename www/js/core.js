'use strict';
/* ---------- Konstanten ---------- */
const E0 = 8.8541878128e-12;   // elektrische Feldkonstante in F/m
const QE = 1.602176634e-19;    // Elementarladung in C
const G = 9.81;                // Fallbeschleunigung in m/s²

/* ---------- Helfer ---------- */
const $ = (s, r = document) => r.querySelector(s);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const store = {
  get(k, d) { try { const v = localStorage.getItem('pl_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('pl_' + k, JSON.stringify(v)); } catch (e) { } }
};
const SUP = { '-': '⁻', '−': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const plain = s => String(s).replace(/<sup>(.*?)<\/sup>/g, (m, t) => '·10' + t.replace(/./g, c => SUP[c] || c)).replace(/<[^>]+>/g, '');

/* Zahl mit deutschem Komma und sinnvollen Stellen */
function fmt(x, sig = 3) {
  if (!isFinite(x)) return '–';
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 1e6 || a < 1e-3) {
    let e = Math.floor(Math.log10(a));
    let m = Number((x / Math.pow(10, e)).toPrecision(sig));
    if (Math.abs(m) >= 10) { m /= 10; e++; }
    return String(m).replace('.', ',') + '·10<sup>' + String(e).replace('-', '−') + '</sup>';
  }
  return String(Number(x.toPrecision(sig))).replace('.', ',');
}
/* Zahl mit SI-Vorsatz und Einheit */
function si(x, unit, sig = 3) {
  if (x === 0 || !isFinite(x)) return fmt(x) + ' ' + unit;
  const P = [[1e-15, 'f'], [1e-12, 'p'], [1e-9, 'n'], [1e-6, 'µ'], [1e-3, 'm'], [1, ''], [1e3, 'k'], [1e6, 'M']];
  const a = Math.abs(x);
  let p = P[0];
  for (const q of P) if (a >= q[0] * 0.9995) p = q;
  return fmt(x / p[0], sig) + ' ' + p[1] + unit;
}
const siT = (x, u, s) => plain(si(x, u, s));
const col = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const fr = (a, b) => `<span class="fr"><span>${a}</span><span>${b}</span></span>`;
const num = s => parseFloat(String(s).replace(',', '.').replace(/\s/g, ''));

/* ---------- Canvas ---------- */
function mkCanvas(wrap, ratio) {
  const c = document.createElement('canvas');
  wrap.appendChild(c);
  const ctx = c.getContext('2d');
  const o = {
    c, ctx, W: 0, H: 0,
    fit() {
      const w = Math.max(200, wrap.clientWidth);
      const h = Math.round(w * (typeof ratio === 'function' ? ratio(w) : ratio));
      const d = window.devicePixelRatio || 1;
      if (c.width !== Math.round(w * d) || c.height !== Math.round(h * d)) {
        c.width = Math.round(w * d); c.height = Math.round(h * d);
        c.style.width = w + 'px'; c.style.height = h + 'px';
      }
      ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.clearRect(0, 0, w, h);
      o.W = w; o.H = h;
      return o;
    }
  };
  return o;
}
function arrowHead(ctx, x, y, ang, s = 7) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - s * Math.cos(ang - 0.4), y - s * Math.sin(ang - 0.4));
  ctx.lineTo(x - s * Math.cos(ang + 0.4), y - s * Math.sin(ang + 0.4));
  ctx.closePath(); ctx.fill();
}
/* Koordinatensystem mit Gitter */
function frame(ctx, W, H, o) {
  const L = 52, R = 16, T = 16, B = 36;
  const w = W - L - R, h = H - T - B;
  const X = x => L + x / o.xmax * w, Y = y => T + h - y / o.ymax * h;
  ctx.save();
  ctx.lineWidth = 1; ctx.font = '11px system-ui';
  for (let i = 0; i <= o.nx; i++) {
    const v = o.xmax * i / o.nx, x = X(v);
    ctx.strokeStyle = col('--line'); ctx.beginPath(); ctx.moveTo(x, T); ctx.lineTo(x, T + h); ctx.stroke();
    ctx.fillStyle = col('--mut'); ctx.textAlign = 'center'; ctx.fillText(plain(o.xf(v)), x, T + h + 15);
  }
  for (let i = 0; i <= o.ny; i++) {
    const v = o.ymax * i / o.ny, y = Y(v);
    ctx.strokeStyle = col('--line'); ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(L + w, y); ctx.stroke();
    ctx.fillStyle = col('--mut'); ctx.textAlign = 'right'; ctx.fillText(plain(o.yf(v)), L - 6, y + 4);
  }
  ctx.strokeStyle = col('--ink'); ctx.fillStyle = col('--ink'); ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(L, T + h); ctx.lineTo(L + w + 6, T + h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(L, T + h); ctx.lineTo(L, T - 4); ctx.stroke();
  arrowHead(ctx, L + w + 8, T + h, 0, 7); arrowHead(ctx, L, T - 6, -Math.PI / 2, 7);
  ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'right'; ctx.fillText(o.xlab, L + w, H - 4);
  ctx.textAlign = 'left'; ctx.fillText(o.ylab, L + 6, T + 8);
  ctx.restore();
  return { X, Y, L, T, w, h };
}

/* ---------- Oberflächen-Bausteine ---------- */
function slider(parent, o, cb) {
  const w = document.createElement('div');
  w.className = 'sl';
  const log = !!o.log;
  const pos = log ? 1000 * Math.log(o.val / o.min) / Math.log(o.max / o.min) : o.val;
  w.innerHTML = `<div class="slh"><span>${o.label}</span><b></b></div><input type="range" min="${log ? 0 : o.min}" max="${log ? 1000 : o.max}" step="${log ? 1 : o.step}" value="${pos}">`;
  const inp = w.querySelector('input'), out = w.querySelector('b');
  const toV = p => log ? Number((o.min * Math.pow(o.max / o.min, p / 1000)).toPrecision(2)) : +p;
  const upd = () => { out.innerHTML = o.f(toV(+inp.value)); };
  inp.addEventListener('input', () => { upd(); cb(toV(+inp.value)); });
  upd();
  parent.appendChild(w);
  return {
    el: w, inp,
    set(v) { inp.value = log ? 1000 * Math.log(v / o.min) / Math.log(o.max / o.min) : v; upd(); },
    get() { return toV(+inp.value); },
    disable(b) { inp.disabled = b; w.classList.toggle('dis', b); },
    label(t) { out.innerHTML = t; }
  };
}
/* Formel-Karte zum Aufklappen: {name, f, syms:[[Symbol, Bedeutung, Einheit]], expl, tip, ex, open} */
function fcard(o) {
  const syms = (o.syms || []).map(s => `<tr><td>${s[0]}</td><td>${s[1]}</td><td>${s[2] || ''}</td></tr>`).join('');
  return `<details class="fc"${o.open ? ' open' : ''}><summary><span>${o.name}</span></summary><div class="body">
    <div class="formula">${o.f}</div>
    ${syms ? `<table class="sym">${syms}</table>` : ''}
    ${o.expl ? `<p>${o.expl}</p>` : ''}
    ${o.tip ? `<div class="tip">💡 ${o.tip}</div>` : ''}
    ${o.ex ? `<div class="ex">${o.ex}</div>` : ''}
  </div></details>`;
}
/* Quiz: qs = [{id, q, o:[…], a:Index, why}] */
function quiz(parent, qs, onChange) {
  const done = store.get('quizok', {});
  qs.forEach(q => {
    const d = document.createElement('div');
    d.className = 'qz';
    d.innerHTML = `<p><b>${q.q}</b></p><div class="opts">${q.o.map((t, j) => `<button class="opt" data-j="${j}">${t}</button>`).join('')}</div><p class="why" hidden>${q.why || ''}</p>`;
    let answered = false;
    d.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const j = +b.dataset.j;
      d.querySelectorAll('.opt')[q.a].classList.add('right');
      if (j !== q.a) b.classList.add('wrong');
      d.querySelector('.why').hidden = false;
      if (j === q.a) { const dd = store.get('quizok', {}); dd[q.id] = 1; store.set('quizok', dd); }
      if (onChange) onChange();
    }));
    parent.appendChild(d);
  });
}
