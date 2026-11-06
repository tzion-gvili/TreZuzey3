'use strict';

// Ladder: tap the measures from the smallest to the largest.
(() => {
  const S = M.sets();
  const ROUNDS = 4;
  const CFG = [
    { name: 'אורך', icon: '📏', units: S.length, n: 4 },
    { name: 'נפח קטן', icon: '🫒', units: S.small, n: 4 },
    { name: 'נפח גדול', icon: '🏺', units: S.big, n: 5 },
    { name: 'מטבעות', icon: '🪙', units: S.coins, n: 5 },
    { name: 'מרחק ושטח', icon: '🛤️', units: null, n: 5 },
    { name: 'כל הנפחים', icon: '🎲', units: S.volume, n: 6 },
  ];

  Games.register({
    id: 'ladder', cat: 'midot', icon: '🪜',
    title: 'סולם המידות',
    desc: 'מסדרים מהקטן לגדול: אצבע, טפח, זרת, אמה...',
    long: `לוחצים על המידות <b>מהקטנה ביותר עד הגדולה ביותר</b>. כל שלב הוא ${ROUNDS} סולמות. לחיצה לא נכונה = טעות קטנה, וממשיכים.`,
    levels: CFG.length,
    levelNames: CFG.map((c) => c.name), levelIcons: CFG.map((c) => c.icon),
    play(stage, lvl, api) {
      const cfg = CFG[lvl];
      let round = 0;
      let mistakes = 0;
      api.hint('לחצו על המידה <b>הקטנה ביותר</b> שנשארה. הסולם נבנה למטה 🪜');

      function pickUnits() {
        const set = cfg.units || U.pick([S.distance, S.area]);
        const byU = new Map();
        for (const u of U.shuffle(set)) if (!byU.has(u.u)) byU.set(u.u, u);
        return U.shuffle([...byU.values()]).slice(0, cfg.n);
      }

      function show() {
        api.rounds(round, ROUNDS);
        const units = pickUnits();
        const order = units.slice().sort((a, b) => a.u - b.u);
        let next = 0;
        stage.innerHTML = `
          <div class="fade-in">
            <div class="quiz-q">מהקטן לגדול 👇</div>
            <div class="wtiles" id="ldTiles">
              ${units.map((u, k) => `<button class="wtile" data-k="${k}">${u.n}</button>`).join('')}
            </div>
            <div class="sentence ladder" id="ldLine"><span class="placeholder">כאן ייבנה הסולם</span></div>
            <div id="ldInfo"></div>
          </div>`;
        const line = stage.querySelector('#ldLine');
        stage.querySelector('#ldTiles').onclick = (e) => {
          const b = e.target.closest('.wtile');
          if (!b || b.disabled) return;
          const u = units[+b.dataset.k];
          if (u !== order[next]) {
            mistakes++;
            Sound.wrong();
            FX.shake(b);
            FX.toast(`🙈 ${u.n} עוד לא – יש קטנה ממנה`, 'bad');
            return;
          }
          Sound.pop();
          b.disabled = true;
          b.classList.add('used');
          if (!next) line.innerHTML = '';
          line.insertAdjacentHTML('beforeend', `${next ? '<span class="ld-arrow">◀</span>' : ''}<span class="wtile">${u.n}</span>`);
          next++;
          if (next === order.length) {
            api.good('הסולם מוכן!', line);
            stage.querySelector('#ldInfo').innerHTML = `
              <div class="explain"><div class="solution">💡 ${order.map((x) => `<b>${x.n}</b> – ${x.rel}`).join('<br>')}</div></div>
              <div class="row mt"><button class="btn" id="ldNext">${round + 1 < ROUNDS ? 'לסולם הבא ◀' : 'סיום 🏁'}</button></div>`;
            stage.querySelector('#ldNext').onclick = () => {
              Sound.click();
              round++;
              if (round < ROUNDS) show();
              else {
                api.rounds(ROUNDS, ROUNDS);
                api.win(U.starsByMistakes(mistakes), `בניתם ${ROUNDS} סולמות עם ${mistakes} טעויות.`);
              }
            };
          }
        };
      }
      show();
    },
  });
})();
