'use strict';

// Measures games: "how many X in Y", "Na'eh or Chazon Ish", and a typed calculator.
const M = {
  OPS: ['naeh', 'ci'],
  many: (u) => u.many || u.n,
  isInt: (r) => Math.abs(r - Math.round(r)) < 1e-6,
  sets() {
    const v = MDATA.volume.units;
    return {
      length: MDATA.length.units,
      distance: MDATA.distance.units,
      small: v.filter((u) => u.small),
      big: v.filter((u) => u.big),
      volume: v,
      area: MDATA.area.units,
      coins: MDATA.coins.units,
    };
  },

  // Every pair "big = r × small" where r is a whole number.
  ratios(units, max = 5000) {
    const out = [];
    for (const big of units) {
      for (const small of units) {
        if (big.u <= small.u) continue;
        const r = big.u / small.u;
        if (M.isInt(r) && r >= 2 && r <= max) out.push({ big, small, r: Math.round(r) });
      }
    }
    return out;
  },

  numDistractors(r, others, n = 3) {
    const cand = U.shuffle([...new Set([...others, r * 2, r + 1, r - 1, Math.round(r / 2), r * 3, r + 2, r * 10])])
      .filter((x) => x > 0 && x !== r && M.isInt(x));
    return cand.slice(0, n);
  },

  ratioQ(p, all) {
    const others = all.filter((x) => x.r !== p.r).map((x) => x.r);
    return {
      q: `כמה ${M.many(p.small)} יש ב${p.big.n}?`,
      a: [p.r, ...M.numDistractors(p.r, others)].map(U.fmt),
      tag: '🔢 כמה יש ב...?',
      e: `<b>${p.big.n}</b> = ${U.fmt(p.r)} ${M.many(p.small)}.<br><small>${p.big.n} = ${p.big.rel}${p.small.rel ? ` · ${p.small.n} = ${p.small.rel}` : ''}</small>`,
    };
  },

  explainUnit: (u) => `<b>${u.n}</b> – ${u.rel}<br>${MDATA.opinions.naeh} – ${u.naeh} · ${MDATA.opinions.ci} – ${u.ci}`,

  // "How much is X by opinion O?" / "Which measure is this value?" / "Who says this value?"
  opinionQ(u, units, k) {
    const op = U.pick(M.OPS);
    const other = op === 'naeh' ? 'ci' : 'naeh';
    const near = U.shuffle(units.filter((x) => x !== u));
    const type = k % 3;
    if (type === 1) {
      return {
        q: `${u[op]} – לפי ${MDATA.opinions[op]}. איזו מידה זו?`,
        a: [u.n, ...near.filter((x) => x[op] !== u[op]).slice(0, 3).map((x) => x.n)],
        tag: '📏 איזו מידה?', e: M.explainUnit(u),
      };
    }
    if (type === 2 && u.naeh !== u.ci) {
      return {
        q: `${u.n} = ${u[op]}. לפי מי השיעור הזה?`,
        a: [MDATA.opinions[op], MDATA.opinions[other]],
        tag: '⚖️ של מי השיטה?', e: M.explainUnit(u),
      };
    }
    const wrong = [...new Set([u[other], ...near.map((x) => x[op])])].filter((x) => x !== u[op]);
    return {
      q: `כמה הוא ${u.n} לפי ${MDATA.opinions[op]}?`,
      a: [u[op], ...wrong.slice(0, 3)],
      tag: '📐 כמה זה?', e: M.explainUnit(u),
    };
  },

  coinGramQ(u, units, k) {
    const near = U.shuffle(units.filter((x) => x !== u));
    if (k % 2) {
      return {
        q: `איזה מטבע שוקל ${u.g} כסף טהור?`, a: [u.n, ...near.slice(0, 3).map((x) => x.n)],
        tag: '🪙 איזה מטבע?', e: `<b>${u.n}</b> = ${u.rel} = ${U.fmt(u.u)} פרוטות = ${u.g} כסף (לפי הרמב"ם).`,
      };
    }
    return {
      q: `כמה כסף טהור יש ב${u.n}? (לפי הרמב"ם)`, a: [u.g, ...near.slice(0, 3).map((x) => x.g)],
      tag: '⚖️ כמה גרם?', e: `<b>${u.n}</b> = ${u.rel} = ${U.fmt(u.u)} פרוטות. פרוטה = 0.025 גרם, לכן ${u.g}.`,
    };
  },
};

(() => {
  const S = M.sets();

  const KAMA = [
    { name: 'אורך', icon: '📏', units: S.length },
    { name: 'מרחק', icon: '🛤️', units: S.distance },
    { name: 'נפח קטן', icon: '🫒', units: S.small },
    { name: 'נפח גדול', icon: '🏺', units: S.big },
    { name: 'מטבעות', icon: '🪙', units: S.coins },
    { name: 'ערבוב', icon: '🎲', units: null },
  ];
  Games.register({
    id: 'kama', cat: 'midot', icon: '🔢',
    title: 'כמה יש ב...?',
    desc: 'כמה טפחים באמה? כמה קבין בסאה? כמה דינרים בסלע?',
    long: 'כל המידות של חז"ל בנויות זו על זו. כאן לומדים את <b>היחסים</b>: אמה = 6 טפחים, סאה = 6 קבין, סלע = 4 דינרים.',
    levels: KAMA.length, free: true,
    levelNames: KAMA.map((c) => c.name), levelIcons: KAMA.map((c) => c.icon),
    play(stage, lvl, api) {
      const sets = KAMA[lvl].units ? [KAMA[lvl].units] : [S.length, S.distance, S.volume, S.coins];
      const pairs = sets.flatMap((s) => M.ratios(s).map((p) => ({ ...p, set: s })));
      const qs = U.shuffle(pairs).slice(0, 8).map((p) => M.ratioQ(p, M.ratios(p.set)));
      QuizEngine.play(stage, api, qs, { hint: `<b>${KAMA[lvl].name}</b> – חשבו בשלבים: כמה בכל יחידה, ואז כפול.` });
    },
  });

  const SHITOT = [
    { name: 'אורך', icon: '📏', units: S.length },
    { name: 'מרחק', icon: '🛤️', units: S.distance },
    { name: 'נפח קטן', icon: '🫒', units: S.small },
    { name: 'נפח גדול', icon: '🏺', units: S.big },
    { name: 'שטח', icon: '🌾', units: S.area },
    { name: 'מטבעות בגרם', icon: '🪙', units: S.coins, coins: true },
  ];
  Games.register({
    id: 'shitot', cat: 'midot', icon: '⚖️',
    title: 'נאה או חזון איש?',
    desc: 'כמה ס"מ באמה? כמה סמ"ק ברביעית? לפי כל שיטה.',
    long: `שתי השיטות המרכזיות: <b>${MDATA.opinions.naeh}</b> (אמה 48 ס"מ, כביצה 57.6 סמ"ק) ו<b>${MDATA.opinions.ci}</b> (אמה 57.6 ס"מ, כביצה 100 סמ"ק). במטבעות – לפי הרמב"ם.`,
    levels: SHITOT.length, free: true,
    levelNames: SHITOT.map((c) => c.name), levelIcons: SHITOT.map((c) => c.icon),
    play(stage, lvl, api) {
      const c = SHITOT[lvl];
      const picks = [];
      while (picks.length < 8) picks.push(...U.shuffle(c.units));
      const qs = picks.slice(0, 8).map((u, k) => (c.coins ? M.coinGramQ(u, c.units, k) : M.opinionQ(u, c.units, k)));
      QuizEngine.play(stage, api, qs, { hint: `<b>${c.name}</b> – זכרו: אצל ${MDATA.opinions.ci} הכול גדול יותר.` });
    },
  });

  // Typed calculator.
  const op = () => U.pick(M.OPS);
  const countQ = (units) => () => {
    const p = U.pick(M.ratios(units, 800));
    const n = U.rand(2, 6);
    return {
      input: true, numeric: true, q: `${n} ${M.many(p.big)} = כמה ${M.many(p.small)}?`, ok: [String(n * p.r)],
      e: `${p.big.n} = ${p.r} ${M.many(p.small)}, ולכן ${n} × ${p.r} = <b>${U.fmt(n * p.r)}</b>.`,
    };
  };
  const CALC = [
    { name: 'אורך', icon: '📏', make: countQ(S.length) },
    { name: 'נפח', icon: '🏺', make: countQ(S.volume) },
    { name: 'מטבעות', icon: '🪙', make: countQ(S.coins) },
    {
      name: 'ס"מ לפי השיטות', icon: '📐',
      make() {
        const u = U.pick(S.length.slice(0, 5));
        const o = op();
        const n = U.rand(2, 10);
        const per = u.cm[o === 'naeh' ? 0 : 1];
        return {
          input: true, numeric: true, tol: 0.01, q: `${n} ${M.many(u)} לפי ${MDATA.opinions[o]} = כמה ס"מ?`, ok: [String(n * per)],
          e: `${u.n} לפי ${MDATA.opinions[o]} = ${U.fmt(per)} ס"מ. ${n} × ${U.fmt(per)} = <b>${U.fmt(n * per)} ס"מ</b>.`,
        };
      },
    },
    {
      name: 'סמ"ק לפי השיטות', icon: '🥚',
      make() {
        const o = op();
        const egg = o === 'naeh' ? 57.6 : 100;
        const u = U.pick(S.small.filter((x) => x.u >= 0.5));
        const n = U.rand(1, 4);
        const v = n * u.u * egg;
        return {
          input: true, numeric: true, tol: 0.02, q: `${n} × ${u.n} לפי ${MDATA.opinions[o]} = כמה סמ"ק?`, ok: [String(v)],
          e: `כביצה לפי ${MDATA.opinions[o]} = ${egg} סמ"ק. ${u.n} = ${U.fmt(u.u)} ביצים. ${n} × ${U.fmt(u.u)} × ${egg} ≈ <b>${U.fmt(v)} סמ"ק</b> (מעוגל – מקבלים גם קרוב).`,
        };
      },
    },
    {
      name: 'גרם כסף', icon: '⚖️',
      make() {
        const u = U.pick(S.coins.filter((x) => x.u >= 8 && x.u <= 768));
        const n = U.rand(2, 10);
        const g = n * u.u * 0.025;
        return {
          input: true, numeric: true, tol: 0.01, q: `${n} ${M.many(u)} = כמה גרם כסף טהור? (לפי הרמב"ם)`, ok: [String(g)],
          e: `${u.n} = ${u.g}. ${n} × ${u.g.replace(' גרם', '')} = <b>${U.fmt(g)} גרם</b>.`,
        };
      },
    },
  ];
  Games.register({
    id: 'calc', cat: 'midot', icon: '🧮',
    title: 'מחשבון חז"ל',
    desc: 'מקלידים את התשובה: 3 אמות = כמה טפחים? 5 סלעים = כמה גרם?',
    long: 'כאן אין תשובות לבחירה – <b>מקלידים מספר</b>. בשאלות של ס"מ, סמ"ק וגרם מקבלים גם תשובה קרובה (עיגול קטן).',
    levels: CALC.length, free: true,
    levelNames: CALC.map((c) => c.name), levelIcons: CALC.map((c) => c.icon),
    play(stage, lvl, api) {
      const qs = [];
      const seen = new Set();
      for (let t = 0; qs.length < 8 && t < 100; t++) {
        const q = CALC[lvl].make();
        if (seen.has(q.q)) continue;
        seen.add(q.q);
        qs.push(q);
      }
      QuizEngine.play(stage, api, qs, { hint: `<b>${CALC[lvl].name}</b> – אפשר לחשב על דף. אין לחץ של זמן 🧮` });
    },
  });
})();
