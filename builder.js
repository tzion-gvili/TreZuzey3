'use strict';

// Put the words of an Aramaic proverb / expression in the right order.
(() => {
  const ROUNDS = 5;
  const fit = (w) => { const n = w.ar.split(' ').length; return n >= 3 && n <= 9; };
  const LEVELS = [
    ...ADATA.pitgamim.map((g) => ({ name: g.name, icon: '💬', words: g.words.filter(fit) })),
    { name: 'שקלא וטריא', icon: '🗣️', words: ADATA.shakla.flatMap((g) => g.words).filter(fit) },
    { name: 'ארמית בדיבור', icon: '☕', words: ADATA.dibur.flatMap((g) => g.words).filter(fit) },
  ].filter((l) => l.words.length >= 3);

  Games.register({
    id: 'builder', cat: 'aramit', icon: '🧱',
    title: 'סדרו את הפתגם',
    desc: 'המילים התערבבו! לוחצים עליהן לפי הסדר הנכון.',
    long: `מופיע <b>הפירוש בעברית</b>, ולמטה מילים בארמית בבלגן. לוחצים על המילים לפי הסדר. לחיצה על מילה במשפט מחזירה אותה. כל שלב הוא ${ROUNDS} פתגמים.`,
    levels: LEVELS.length, free: true,
    levelNames: LEVELS.map((l) => l.name), levelIcons: LEVELS.map((l) => l.icon),
    play(stage, lvl, api) {
      const lv = LEVELS[lvl];
      const list = [];
      while (list.length < ROUNDS) list.push(...U.shuffle(lv.words));
      let round = 0;
      let mistakes = 0;
      api.hint('קראו את הפירוש, ואז בנו את המשפט בארמית מילה אחרי מילה 🧱');

      function show() {
        api.rounds(round, ROUNDS);
        const w = list[round];
        const target = w.ar.split(' ');
        let tiles = U.shuffle(target.map((t, k) => ({ t, k })));
        if (tiles.every((x, i) => x.k === i) && tiles.length > 1) tiles = tiles.reverse();
        const built = [];
        stage.innerHTML = `
          <div class="fade-in">
            <div class="quiz-q">${w.he}</div>
            <div class="sentence ar" id="bSent"><span class="placeholder">כאן ייבנה המשפט</span></div>
            <div class="wtiles" id="bTiles">${tiles.map((x, i) => `<button class="wtile" data-i="${i}">${x.t}</button>`).join('')}</div>
            <div class="row mt"><button class="btn" id="bCheck" disabled>בדיקה ✔</button></div>
            <div id="bInfo"></div>
          </div>`;
        const sent = stage.querySelector('#bSent');
        const check = stage.querySelector('#bCheck');
        const paint = () => {
          sent.innerHTML = built.length
            ? built.map((i, p) => `<button class="wtile" data-p="${p}">${tiles[i].t}</button>`).join('')
            : '<span class="placeholder">כאן ייבנה המשפט</span>';
          stage.querySelectorAll('#bTiles .wtile').forEach((b) => {
            const used = built.includes(+b.dataset.i);
            b.disabled = used;
            b.classList.toggle('used', used);
          });
          check.disabled = built.length !== tiles.length;
        };
        stage.querySelector('#bTiles').onclick = (e) => {
          const b = e.target.closest('.wtile');
          if (!b || b.disabled) return;
          Sound.pop();
          built.push(+b.dataset.i);
          paint();
        };
        sent.onclick = (e) => {
          const b = e.target.closest('[data-p]');
          if (!b || check.dataset.done) return;
          Sound.click();
          built.splice(+b.dataset.p, 1);
          paint();
        };
        check.onclick = () => {
          const ok = built.map((i) => tiles[i].t).join(' ') === w.ar;
          if (!ok) {
            mistakes++;
            api.bad('עוד לא – נסו לסדר שוב', sent);
            return;
          }
          check.dataset.done = '1';
          check.disabled = true;
          api.good(null, sent);
          stage.querySelector('#bTiles').innerHTML = '';
          stage.querySelector('#bInfo').innerHTML = `
            <div class="explain"><div class="solution">💡 ${Words.noteHtml(w)}</div></div>
            <div class="row mt"><button class="btn" id="bNext">${round + 1 < ROUNDS ? 'לפתגם הבא ◀' : 'סיום 🏁'}</button></div>`;
          stage.querySelector('#bNext').onclick = () => {
            Sound.click();
            round++;
            if (round < ROUNDS) show();
            else {
              api.rounds(ROUNDS, ROUNDS);
              api.win(U.starsByMistakes(mistakes), `סידרתם ${ROUNDS} פתגמים עם ${mistakes} טעויות.`);
            }
          };
        };
      }
      show();
    },
  });
})();
