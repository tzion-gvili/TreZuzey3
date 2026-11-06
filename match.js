'use strict';

// Pairs: match a measure to its size, or an Aramaic word to its meaning. Later levels are a memory game.
(() => {
  const short = (w) => w.he.length <= 22 && w.ar.length <= 18;
  const POOLS = {
    midot: () => MDATA.pairs.map(([a, b]) => ({ a, b })),
    aramit: () => [...ADATA.milim, ...ADATA.dibur].flatMap((g) => g.words).filter(short).map((w) => ({ a: w.ar, b: w.he })),
    rashei: () => ADATA.rashei.flatMap((g) => g.words).map((w) => ({ a: w.ar, b: w.full })),
  };
  const CFG = [
    { name: 'מידות', icon: '📏', pool: 'midot', pairs: 6, memory: false },
    { name: 'ארמית', icon: '📜', pool: 'aramit', pairs: 6, memory: false },
    { name: 'ראשי תיבות', icon: '🔠', pool: 'rashei', pairs: 6, memory: false },
    { name: 'זיכרון: מידות', icon: '🧠', pool: 'midot', pairs: 6, memory: true },
    { name: 'זיכרון: ארמית', icon: '🧠', pool: 'aramit', pairs: 6, memory: true },
    { name: 'זיכרון: ראשי תיבות', icon: '🧠', pool: 'rashei', pairs: 8, memory: true },
  ];

  Games.register({
    id: 'match', cat: 'games', icon: '🃏',
    title: 'זוגות',
    desc: 'מחברים כל מידה לגודל שלה, וכל מילה לפירוש שלה. בהמשך – משחק זיכרון!',
    long: 'לוחצים על קלף ואז על בן הזוג שלו. בשלבים 4–6 הקלפים <b>הפוכים</b> – צריך לזכור איפה כל אחד. הזוגות מתחלפים בכל משחק.',
    levels: CFG.length,
    levelNames: CFG.map((c) => c.name), levelIcons: CFG.map((c) => c.icon),
    play(stage, lvl, api) {
      const cfg = CFG[lvl];
      const items = [];
      const seenA = new Set();
      const seenB = new Set();
      for (const p of U.shuffle(POOLS[cfg.pool]())) {
        if (items.length >= cfg.pairs) break;
        if (seenA.has(p.a) || seenB.has(p.b)) continue;
        seenA.add(p.a);
        seenB.add(p.b);
        items.push(p);
      }
      const cards = U.shuffle(items.flatMap((p, id) => [{ id, text: p.a, side: 'a' }, { id, text: p.b, side: 'b' }]));
      let first = null;
      let busy = false;
      let found = 0;
      let mistakes = 0;
      const allowed = cfg.memory ? cfg.pairs : Math.ceil(cfg.pairs / 2);

      api.hint(cfg.memory
        ? 'הפכו שני קלפים. אם הם זוג – הם נשארים פתוחים. נסו לזכור מה ראיתם 🧠'
        : 'לחצו על קלף ואז על בן הזוג שלו. זוג נכון נעלם ✨');
      api.rounds(0, cfg.pairs);

      stage.innerHTML = `<div class="pairs ${cfg.memory ? 'memory' : ''}" id="pairs">
        ${cards.map((c, k) => `<button class="pcard is-${c.side}" data-k="${k}">
          <span class="pface">${c.text}</span><span class="pback">${MASCOT.icon}</span></button>`).join('')}
      </div>`;

      stage.querySelector('#pairs').onclick = (e) => {
        const b = e.target.closest('.pcard');
        if (!b || busy || b.classList.contains('gone')) return;
        if (first === b) { b.classList.remove('sel', 'open'); first = null; return; }
        Sound.click();
        b.classList.add('sel', 'open');
        if (!first) { first = b; return; }
        const a = cards[+first.dataset.k];
        const c = cards[+b.dataset.k];
        const pairEls = [first, b];
        first = null;
        if (a.id === c.id && a.side !== c.side) {
          found++;
          api.rounds(found, cfg.pairs);
          Sound.correct();
          FX.burstAt(b);
          pairEls.forEach((x) => { x.classList.remove('sel'); x.classList.add('gone'); });
          if (found === cfg.pairs) {
            api.win(mistakes <= allowed / 2 ? 3 : mistakes <= allowed ? 2 : 1, `מצאתם את כל ${cfg.pairs} הזוגות עם ${mistakes} טעויות.`);
          }
        } else {
          mistakes++;
          busy = true;
          Sound.wrong();
          pairEls.forEach((x) => FX.shake(x));
          setTimeout(() => {
            pairEls.forEach((x) => x.classList.remove('sel', 'open'));
            busy = false;
          }, cfg.memory ? 900 : 450);
        }
      };
    },
  });
})();
