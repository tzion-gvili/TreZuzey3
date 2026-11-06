'use strict';

// Speed round: as many correct answers as possible in 60 seconds. A mistake costs 3 seconds.
(() => {
  const SECONDS = 60;
  const fromPairs = () => MDATA.pairs.map(([a, b]) => ({ ar: a, he: b }));
  const CFG = [
    { name: 'מידות ומטבעות', icon: '📏', pool: fromPairs, goal: [7, 11, 15] },
    { name: 'המילים הקטנות', icon: '🧩', pool: () => ADATA.milim.flatMap((g) => g.words), goal: [8, 12, 16] },
    { name: 'שקלא וטריא', icon: '🗣️', pool: () => ADATA.shakla.flatMap((g) => g.words), goal: [7, 11, 15] },
    { name: 'ראשי תיבות', icon: '🔠', pool: () => ADATA.rashei.flatMap((g) => g.words), goal: [7, 11, 15], abbr: true },
    { name: 'ארמית בדיבור', icon: '☕', pool: () => ADATA.dibur.flatMap((g) => g.words), goal: [7, 11, 15] },
  ];

  Games.register({
    id: 'speed', cat: 'games', icon: '⚡',
    title: 'מירוץ 60 שניות',
    desc: 'כמה תספיקו בדקה אחת? כל טעות עולה 3 שניות!',
    long: `יש <b>${SECONDS} שניות</b>. מופיעה מילה או מידה, ובוחרים את הפירוש שלה מהר ככל שאפשר. תשובה נכונה = נקודה. טעות מורידה 3 שניות מהשעון ⏱️`,
    levels: CFG.length, free: true,
    levelNames: CFG.map((c) => c.name), levelIcons: CFG.map((c) => c.icon),
    play(stage, lvl, api) {
      const cfg = CFG[lvl];
      const pool = cfg.pool();
      let score = 0;
      let left = SECONDS;
      let started = false;
      let timer = null;

      api.hint(`מטרה: ${cfg.goal[0]} לכוכב אחד, ${cfg.goal[1]} לשניים, ${cfg.goal[2]} לשלושה ⭐`);
      stage.innerHTML = `
        <div class="center fade-in">
          <div class="quiz-scene">⏱️</div>
          <button class="btn big" id="spGo">מוכנים? יוצאים לדרך! 🏃</button>
        </div>`;

      function end() {
        clearInterval(timer);
        timer = null;
        if (!api.alive()) return;
        if (score >= cfg.goal[0]) {
          const stars = score >= cfg.goal[2] ? 3 : score >= cfg.goal[1] ? 2 : 1;
          api.win(stars, `צברתם ${score} נקודות ב-${SECONDS} שניות!`);
        } else {
          api.fail(`צברתם ${score} נקודות. צריך לפחות ${cfg.goal[0]} כדי לעבור. עוד סיבוב?`);
        }
      }

      function tick() {
        left = Math.max(0, left - 0.25);
        const bar = stage.querySelector('#spBar');
        if (bar) bar.style.width = `${(100 * left) / SECONDS}%`;
        const t = stage.querySelector('#spTime');
        if (t) t.textContent = Math.ceil(left);
        if (left <= 10 && Math.abs(left - Math.round(left)) < 0.01) Sound.tick();
        if (left <= 0) end();
      }

      function next() {
        const w = U.pick(pool);
        const item = cfg.abbr && Math.random() < 0.5 ? Words.abbrToFull(w, pool) : Words.arToHe(w, pool);
        const answers = U.shuffle(item.a.map((text, idx) => ({ text, ok: idx === 0 })));
        stage.querySelector('#spQ').innerHTML = QuizEngine.question(item);
        stage.querySelector('#spA').innerHTML = answers.map((a, k) => `<button class="answer" data-k="${k}">${a.text}</button>`).join('');
        stage.querySelector('#spA').onclick = (e) => {
          const b = e.target.closest('.answer');
          if (!b || !timer) return;
          if (answers[+b.dataset.k].ok) {
            score++;
            Sound.correct();
            FX.burstAt(b);
            stage.querySelector('#spScore').textContent = score;
            FX.pop(stage.querySelector('#spScore'));
          } else {
            left = Math.max(0, left - 3);
            Sound.wrong();
            FX.toast(`🙈 ${w.ar} = ${item.a[0]}`, 'bad');
          }
          next();
        };
      }

      stage.querySelector('#spGo').onclick = () => {
        if (started) return;
        started = true;
        Sound.click();
        stage.innerHTML = `
          <div class="fade-in">
            <div class="cr-top">
              <div class="chip">⏱️ <span id="spTime">${SECONDS}</span></div>
              <div class="timebar"><i id="spBar" style="width:100%"></i></div>
              <div class="chip">⭐ <span id="spScore">0</span></div>
            </div>
            <div class="quiz-q" id="spQ"></div>
            <div class="answers" id="spA"></div>
          </div>`;
        next();
        timer = setInterval(tick, 250);
      };

      return () => clearInterval(timer);
    },
  });
})();
