'use strict';

// Shared quiz engine.
// Multiple choice: { q, a: [correct, ...wrong], e, tag?, big? }
// Typed answer:    { q, ok: [accepted answers], show, e, input: true, tol? }  – tol = allowed error for numbers (0.02 = 2%)
const QuizEngine = {
  question: (item) => `<span class="${item.big ? 'ar' : ''}">${item.q.replace(/___/g, '<span class="blank">_____</span>')}</span>`,

  accepts(item, raw) {
    const val = U.norm(raw);
    return item.ok.some((o) => {
      if (U.norm(o) === val) return true;
      const a = U.num(o);
      const b = U.num(raw);
      if (a === null || b === null || /[א-ת]/.test(raw)) return false;
      const tol = item.tol || 0.0001;
      return Math.abs(a - b) <= Math.max(Math.abs(a) * tol, 0.0001);
    });
  },

  play(stage, api, items, { hint = 'בחרו את התשובה הנכונה. אין לחץ של זמן 😊', winMsg } = {}) {
    let i = 0;
    let mistakes = 0;
    api.hint(hint);

    function next() {
      stage.querySelector('#qNext').onclick = () => {
        Sound.click();
        i++;
        if (i < items.length) show();
        else {
          api.rounds(i, items.length);
          const right = items.length - mistakes;
          api.win(mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1,
            (winMsg ? winMsg + ' ' : '') + `ענית נכון על ${right} מתוך ${items.length} שאלות.`);
        }
      };
    }

    function explain(item, prefix = '') {
      const e = item.e ? `<div class="solution">💡 ${item.e}</div>` : '';
      stage.querySelector('#qExplain').innerHTML = `
        <div class="explain">${prefix}${e}</div>
        <div class="row mt"><button class="btn" id="qNext">${i + 1 < items.length ? 'לשאלה הבאה ◀' : 'סיום 🏁'}</button></div>`;
      next();
    }

    function head(item) {
      return `
        ${item.s ? `<div class="quiz-scene">${item.s}</div>` : ''}
        ${item.tag ? `<div class="center"><span class="calc-tag">${item.tag}</span></div>` : ''}
        <div class="quiz-q">${QuizEngine.question(item)}</div>`;
    }

    function showInput(item) {
      stage.innerHTML = `
        <div class="fade-in">
          ${head(item)}
          <form class="num-entry" id="qForm" autocomplete="off">
            <input id="qIn" class="word-in" placeholder="${item.ph || 'הקלידו תשובה'}" dir="auto" inputmode="${item.numeric ? 'decimal' : 'text'}" spellcheck="false">
            <button class="btn" type="submit">בדיקה ✔</button>
          </form>
          <div class="num-note">${item.note || 'מספר בלבד. אפשר עם נקודה עשרונית'}</div>
          <div id="qExplain"></div>
        </div>`;
      const input = stage.querySelector('#qIn');
      setTimeout(() => input.focus(), 50);
      stage.querySelector('#qForm').onsubmit = (ev) => {
        ev.preventDefault();
        if (input.disabled) return;
        if (!U.norm(input.value)) { api.info('✏️ הקלידו תשובה'); return; }
        input.disabled = true;
        stage.querySelector('#qForm button').disabled = true;
        if (QuizEngine.accepts(item, input.value)) {
          input.classList.add('right');
          api.good(null, input);
          explain(item);
        } else {
          mistakes++;
          input.classList.add('wrong');
          api.bad('לא בדיוק – הנה התשובה', input);
          explain(item, `<div>התשובה: <b>${item.show || item.ok[0]}</b></div>`);
        }
      };
    }

    function show() {
      api.rounds(i, items.length);
      const item = items[i];
      if (item.input) { showInput(item); return; }
      const answers = U.shuffle(item.a.map((text, idx) => ({ text, ok: idx === 0 })));
      stage.innerHTML = `
        <div class="fade-in">
          ${head(item)}
          <div class="answers">
            ${answers.map((a, k) => `<button class="answer ${item.abig ? 'ar' : ''}" data-k="${k}" style="animation-delay:${k * 0.07}s">${a.text}</button>`).join('')}
          </div>
          <div id="qExplain"></div>
        </div>`;
      stage.querySelector('.answers').onclick = (e) => {
        const b = e.target.closest('.answer');
        if (!b || b.disabled) return;
        const pick = answers[+b.dataset.k];
        stage.querySelectorAll('.answer').forEach((x, k) => {
          x.disabled = true;
          if (answers[k].ok) x.classList.add('right');
        });
        if (pick.ok) {
          api.good(null, b);
        } else {
          mistakes++;
          b.classList.add('wrong');
          api.bad('התשובה הנכונה מסומנת בירוק', b);
        }
        explain(item);
      };
    }
    show();
  },
};

// A "chapter by chapter" game: every level is one topic.  chapter: { name, qs: [items] }
const ChapterQuiz = {
  PER_ROUND: 8,

  register({ id, cat, icon, title, desc, long, chapters }) {
    Games.register({
      id, cat, icon, title, desc,
      long: long + ' <b>כל שלב הוא נושא</b>, ואפשר לבחור כל נושא בלי לפתוח את הקודם. בכל סבב השאלות מתערבבות מחדש.',
      levels: chapters.length,
      free: true,
      levelNames: chapters.map((c) => c.name),
      play(stage, lvl, api) {
        const ch = chapters[lvl];
        QuizEngine.play(stage, api, U.shuffle(ch.qs).slice(0, ChapterQuiz.PER_ROUND), {
          hint: `<b>${ch.name}</b> – קראו את כל השאלה לפני שבוחרים. אחרי כל שאלה יש הסבר.`,
        });
      },
    });
  },
};

// Aramaic word lists from data.js: { ar, he, note, full? }
const Words = {
  // Wrong answers must not share the meaning or the wording of the right one.
  distractors(w, pool, key, n = 3) {
    const out = [];
    const seen = new Set([w[key]]);
    for (const c of U.shuffle(pool)) {
      if (out.length >= n) break;
      if (c.ar === w.ar || c.he === w.he || seen.has(c[key])) continue;
      seen.add(c[key]);
      out.push(c[key]);
    }
    return out;
  },

  noteHtml: (w) => `<b>${w.ar}</b>${w.full ? ` = ${w.full}` : ''} = ${w.he}${w.note ? `<br><small>${w.note}</small>` : ''}`,

  arToHe(w, pool) {
    return { q: w.ar, big: true, a: [w.he, ...this.distractors(w, pool, 'he')], tag: '📜 ← 🇮🇱 מה הפירוש?', e: this.noteHtml(w) };
  },
  heToAr(w, pool) {
    return { q: w.he, a: [w.ar, ...this.distractors(w, pool, 'ar')], abig: true, tag: '🇮🇱 ← 📜 איך אומרים בארמית?', e: this.noteHtml(w) };
  },
  abbrToFull(w, pool) {
    return { q: w.ar, big: true, a: [w.full, ...this.distractors(w, pool, 'full')], tag: '🔠 איך פותחים את הקיצור?', e: this.noteHtml(w) };
  },

  round(words, pool, n = 8) {
    pool = pool.length >= 4 ? pool : words;
    return U.shuffle(words).slice(0, n).map((w, k) => {
      if (w.full) return k % 2 ? this.abbrToFull(w, pool) : this.arToHe(w, pool);
      return k % 3 === 2 ? this.heToAr(w, pool) : this.arToHe(w, pool);
    });
  },

  // A game where every level is one word group.
  register({ id, cat, icon, title, desc, long, groups }) {
    const all = groups.flatMap((g) => g.words);
    Games.register({
      id, cat, icon, title, desc,
      long: long + ` יש כאן <b>${all.length}</b> פריטים. <b>כל שלב הוא קבוצה</b>, ואפשר לקפוץ לכל קבוצה.`,
      levels: groups.length,
      free: true,
      levelNames: groups.map((g) => g.name),
      play(stage, lvl, api) {
        const g = groups[lvl];
        QuizEngine.play(stage, api, Words.round(g.words, g.words.length >= 6 ? g.words : all, 8), {
          hint: `<b>${g.name}</b> – ${g.words.length} פריטים בקבוצה. בכל סבב 8 מהם, בסדר אחר.`,
        });
      },
    });
  },
};
