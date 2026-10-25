'use strict';
/* Modul 4: Arbeitsdiagramm (Q-U-Diagramm) */
function modWork(root) {
  const S = { mode: 'a', q: 5, U: 8, C: 4 };
  root.innerHTML = `
  <p class="lead">Im Arbeitsdiagramm trägst du die Ladung über der Spannung auf. Die <b>Fläche</b> darunter ist die Arbeit bzw. Energie, die <b>Steigung</b> ist die Kapazität.</p>
  <div class="seg" id="cm">
    <button data-m="a" class="on">Ladung q durch Spannung U<small>W = q · U (Rechteck)</small></button>
    <button data-m="b">Kondensator aufladen<small>Q = C · U (Gerade, Dreieck)</small></button>
  </div>
  <div class="cv" id="cv"></div>
  <div class="card" id="sl"></div>
  <div class="out" id="ro"></div>
  <h2>Formeln erklärt</h2><div id="fc"></div>
  <h2>Quiz</h2><div id="qz"></div>`;
  const cv = mkCanvas($('#cv', root), .75);
  const box = $('#sl', root);
  const sq = slider(box, { label: 'Ladung q', min: 1, max: 10, step: .5, val: S.q, f: v => fmt(v) + ' µC' }, v => { S.q = v; draw(); });
  const sC = slider(box, { label: 'Kapazität C', min: 1, max: 10, step: .5, val: S.C, f: v => fmt(v) + ' µF' }, v => { S.C = v; draw(); });
  const sU = slider(box, { label: 'Spannung U', min: 1, max: 12, step: .5, val: S.U, f: v => fmt(v) + ' V' }, v => { S.U = v; draw(); });
  $('#cm', root).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    S.mode = b.dataset.m;
    $('#cm', root).querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    draw();
  });
  function draw() {
    cv.fit();
    const { ctx, W, H } = cv;
    const a = S.mode === 'a';
    sq.el.style.display = a ? '' : 'none'; sC.el.style.display = a ? 'none' : '';
    const Umax = 12, qmax = a ? 10 : 100;
    const fm = frame(ctx, W, H, { xmax: Umax, ymax: qmax, nx: 6, ny: 5, xf: v => fmt(v) + ' V', yf: v => fmt(v) + ' µC', xlab: 'U', ylab: a ? 'q' : 'Q' });
    const { X, Y } = fm;
    ctx.lineWidth = 2;
    if (a) {
      ctx.fillStyle = col('--acc'); ctx.globalAlpha = .25; ctx.fillRect(X(0), Y(S.q), X(S.U) - X(0), Y(0) - Y(S.q)); ctx.globalAlpha = 1;
      ctx.strokeStyle = col('--acc'); ctx.strokeRect(X(0), Y(S.q), X(S.U) - X(0), Y(0) - Y(S.q));
      ctx.fillStyle = col('--ink'); ctx.font = 'bold 15px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('W = q · U', (X(0) + X(S.U)) / 2, (Y(0) + Y(S.q)) / 2 + 5);
      $('#ro', root).innerHTML = `Arbeit = Fläche des Rechtecks: <b>W = ${fmt(S.q)} µC · ${fmt(S.U)} V = ${fmt(S.q * S.U)} µJ</b><br><small class="hint">Eine Ladung q wird durch die Spannung U bewegt (U ändert sich dabei nicht). Doppelte Ladung oder doppelte Spannung → doppelte Arbeit.</small>`;
    } else {
      const Q = S.C * S.U;
      ctx.fillStyle = col('--fld'); ctx.globalAlpha = .28; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(S.U), Y(0)); ctx.lineTo(X(S.U), Y(Q)); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = col('--fld'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(Umax), Y(S.C * Umax)); ctx.stroke();
      ctx.strokeStyle = col('--mut'); ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(X(S.U), Y(0)); ctx.lineTo(X(S.U), Y(Q)); ctx.lineTo(X(0), Y(Q)); ctx.stroke(); ctx.setLineDash([]);
      /* Steigungsdreieck */
      const u0 = Math.max(0, S.U - 4), q0 = S.C * u0;
      ctx.strokeStyle = col('--pos'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(u0), Y(q0)); ctx.lineTo(X(S.U), Y(q0)); ctx.lineTo(X(S.U), Y(Q)); ctx.stroke();
      ctx.fillStyle = col('--pos'); ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('ΔU', (X(u0) + X(S.U)) / 2, Y(q0) + 14); ctx.textAlign = 'left'; ctx.fillText('ΔQ', X(S.U) + 4, (Y(q0) + Y(Q)) / 2);
      ctx.fillStyle = col('--ink'); ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('W', X(S.U * .45), Y(Q * .14));
      $('#ro', root).innerHTML = `Steigung = ΔQ/ΔU = <b>${fmt(S.C)} µC/V = ${fmt(S.C)} µF = C</b> (Q = C · U)<br>Bei U = ${fmt(S.U)} V: Q = ${fmt(Q)} µC. Energie = Dreiecksfläche: <b>W = ½ · Q · U = ${fmt(.5 * Q * S.U)} µJ</b><br><small class="hint">Beim Aufladen steigt U von 0 auf ${fmt(S.U)} V. Im Mittel ist nur die halbe Spannung wirksam, deshalb ½.</small>`;
    }
  }
  $('#fc', root).innerHTML = [
    fcard({
      name: 'Arbeit im elektrischen Feld', f: 'W = q · U', open: true,
      syms: [['W', 'Arbeit bzw. Energie', 'J (Joule)'], ['q', 'bewegte Ladung', 'C (Coulomb)'], ['U', 'durchlaufene Spannung', 'V']],
      expl: 'Arbeit = Ladung mal Spannung. Im Arbeitsdiagramm ist das die <b>Fläche</b> unter dem Graphen (hier ein Rechteck mit den Seiten q und U).',
      ex: 'Rechteck bis 8 V: z. B. q = 5 µC → W = 5 µC · 8 V = 40 µJ',
      tip: '1 V · 1 C = 1 J. Ein Elektron durch 1 V hat die Energie 1 eV = 1,6·10⁻¹⁹ J.'
    }),
    fcard({
      name: 'Steigung = Kapazität', f: fr('ΔQ', 'ΔU') + ' = m = tan(α) = C',
      syms: [['ΔQ', 'Änderung der Ladung', 'C'], ['ΔU', 'Änderung der Spannung', 'V'], ['m', 'Steigung der Geraden im Q-U-Diagramm', 'C/V = F'], ['C', 'Kapazität', 'F']],
      expl: 'Die Gerade Q = C · U läuft durch den Nullpunkt. Je steiler sie ist, desto mehr Ladung nimmt der Kondensator pro Volt auf, also desto größer ist C. Steigung ≙ Kapazität.',
      tip: 'Steigung bestimmen: Steigungsdreieck zeichnen, ΔQ durch ΔU teilen.'
    }),
    fcard({
      name: 'Energie des Kondensators (Ergänzung)', f: 'W = ½ · Q · U = ½ · C · U²',
      expl: 'Beim Aufladen ist die Fläche unter der Geraden ein <b>Dreieck</b>: ½ · Grundseite (U) · Höhe (Q). Setzt du Q = C · U ein, erhältst du ½ · C · U².'
    })
  ].join('');
  quiz($('#qz', root), quizFor('work'));
  draw();
  return { resize: draw };
}
