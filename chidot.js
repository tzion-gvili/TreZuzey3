'use strict';

// Funny riddles with fresh numbers every time – coins, length, distance, time, volume, area and weight.
(() => {
  const find = (set, n) => set.find((u) => u.n === n);
  const COIN = (n) => find(MDATA.coins.units, n);
  const LEN = (n) => find(MDATA.length.units, n);
  const VOL = (n) => find(MDATA.volume.units, n);
  const cnt = (n, u) => (n === 1 ? u.n : `${n} ${M.many(u)}`);
  const withB = (n, u) => (n === 1 ? `ב${u.n}` : `ב-${n} ${M.many(u)}`);

  const PEOPLE = [
    { n: 'יוסי', m: true }, { n: 'דני', m: true }, { n: 'אבי', m: true }, { n: 'איתי', m: true }, { n: 'עמית', m: true },
    { n: 'נועה', m: false }, { n: 'מיכל', m: false }, { n: 'תמר', m: false }, { n: 'שירה', m: false }, { n: 'רוני', m: false },
  ];
  const ITEMS = ['תפוח עסיסי', 'עוגת דבש', 'כובע מצחיק', 'שק תמרים', 'חמור צעצוע', 'בקבוק מיץ ענבים', 'סוכרייה ענקית', 'ספר חידות', 'כד חרס', 'זוג סנדלים'];
  const who = () => {
    const p = U.pick(PEOPLE);
    return { ...p, v: (m, f) => (p.m ? m : f) };
  };

  // Each riddle: { s, q, ans, unit, step, e, text? }  – text = a non-number answer (multiple choice only).
  const coins = [
    () => {
      const p = who();
      for (;;) {
        const P = COIN(U.pick(['דינר', 'שקל', 'סלע']));
        const a = U.rand(1, 3);
        const price = a * P.u;
        const B = U.pick(MDATA.coins.units.filter((u) => u.u >= 8 && u.u < P.u));
        const b = U.rand(1, Math.min(10, Math.floor((price - 1) / B.u)));
        const diff = price - b * B.u;
        const opts = ['מעה', 'פונדיון', 'איסר'].map(COIN).filter((c) => diff % c.u === 0 && diff / c.u <= 40 && diff / c.u >= 2);
        if (!opts.length) continue;
        const C = U.pick(opts);
        const ans = diff / C.u;
        return {
          s: '🍎🪙', unit: M.many(C), ans, step: Math.max(1, Math.round(ans / 4)),
          q: `${p.n} ${p.v('קנה', 'קנתה')} ${U.pick(ITEMS)} ${withB(a, P)}, ${p.v('ושילם', 'ושילמה')} רק ${cnt(b, B)}. כמה ${M.many(C)} עוד צריך להוסיף?`,
          e: `${cnt(a, P)} = ${price} פרוטות. ${cnt(b, B)} = ${b * B.u} פרוטות. חסרות ${diff} פרוטות. ${C.n} = ${C.u} פרוטות, ולכן ${diff} ÷ ${C.u} = <b>${ans}</b>.`,
        };
      }
    },
    () => {
      const p = who();
      for (;;) {
        const P = COIN(U.pick(['שקל', 'סלע']));
        const a = U.rand(1, 3);
        const paid = a * P.u;
        const B = COIN(U.pick(['מעה', 'טרפעיק', 'דינר']));
        const b = U.rand(1, Math.min(10, Math.floor((paid - 1) / B.u)));
        const diff = paid - b * B.u;
        const opts = ['פונדיון', 'איסר', 'מעה'].map(COIN).filter((c) => diff % c.u === 0 && diff / c.u <= 40 && diff / c.u >= 2);
        if (!opts.length || b * B.u >= paid) continue;
        const C = U.pick(opts);
        const ans = diff / C.u;
        return {
          s: '🛒💰', unit: M.many(C), ans, step: Math.max(1, Math.round(ans / 4)),
          q: `${p.n} ${p.v('נתן', 'נתנה')} למוכר ${cnt(a, P)} על ${U.pick(ITEMS)} שעולה ${cnt(b, B)}. כמה ${M.many(C)} עודף ${p.v('יקבל', 'תקבל')}?`,
          e: `${p.v('שילם', 'שילמה')} ${paid} פרוטות. המחיר ${b * B.u} פרוטות. העודף ${diff} פרוטות. ${C.n} = ${C.u} פרוטות → <b>${ans}</b>.`,
        };
      }
    },
    () => {
      const p = who();
      for (;;) {
        const X = COIN(U.pick(['איסר', 'פונדיון', 'מעה']));
        const k = U.rand(1, 3);
        const Y = COIN(U.pick(['דינר', 'שקל', 'סלע']));
        const n = U.rand(1, 3);
        const ans = (n * Y.u) / (k * X.u);
        if (!M.isInt(ans) || ans > 60 || ans < 2) continue;
        return {
          s: '🍯🍯🍯', unit: 'עוגות', ans, step: Math.max(1, Math.round(ans / 3)),
          q: `עוגת דבש עולה ${cnt(k, X)}. ל${p.n} יש ${cnt(n, Y)}. כמה עוגות ${p.v('הוא יכול', 'היא יכולה')} לקנות?`,
          e: `${cnt(n, Y)} = ${n * Y.u} פרוטות. עוגה = ${k * X.u} פרוטות. ${n * Y.u} ÷ ${k * X.u} = <b>${ans}</b> עוגות. (יהיה הרבה דבש 😋)`,
        };
      }
    },
    () => {
      const p = who();
      const Y = COIN(U.pick(['דינר', 'שקל', 'סלע']));
      const n = U.rand(2, 12);
      const g = parseFloat(Y.g);
      return {
        s: '👝⚖️', unit: 'גרם', ans: n * g, step: g,
        q: `בכיס של ${p.n} יש ${cnt(n, Y)} מכסף טהור. כמה גרם כסף ${p.v('הוא סוחב', 'היא סוחבת')}? (לפי הרמב"ם)`,
        e: `${Y.n} = ${Y.g}. ${n} × ${g} = <b>${U.fmt(n * g)} גרם</b>.`,
      };
    },
    () => {
      const n = U.rand(1, 4);
      const k = U.pick(['סלעים', 'דינרים']);
      const ans = k === 'סלעים' ? n * 25 : n * 100;
      return {
        s: '🧳', unit: k, ans, step: k === 'סלעים' ? 5 : 25,
        q: `סוחר עשיר הביא ${n === 1 ? 'מנה אחת' : `${n} מנים`} של כסף, וביקש להחליף ל${k}. כמה ${k} יקבל?`,
        e: `מנה = 100 דינר = 25 סלעים. לכן ${n} × ${k === 'סלעים' ? 25 : 100} = <b>${ans}</b>.`,
      };
    },
    () => {
      const p = who();
      const n = U.rand(1, 6);
      return {
        s: '🥇', unit: 'דינרי כסף', ans: n * 25, step: 5,
        q: `${p.n} ${p.v('מצא', 'מצאה')} ${n === 1 ? 'דינר זהב אחד' : `${n} דינרי זהב`} בגינה! כמה דינרי כסף ${n === 1 ? 'הוא שווה' : 'הם שווים'}?`,
        e: `דינר זהב = 25 דינרי כסף. ${n} × 25 = <b>${n * 25}</b>.`,
      };
    },
  ];

  const length = [
    () => {
      const n = U.rand(2, 8);
      return {
        s: '🐈📏', unit: 'צעדים', ans: n * 6, step: 2,
        q: `חתול סקרן הולך על שולחן באורך ${cnt(n, LEN('אמה'))}. כל צעד שלו הוא טפח אחד. כמה צעדים עד הקצה?`,
        e: `אמה = 6 טפחים. ${n} × 6 = <b>${n * 6}</b> צעדים. 🐾`,
      };
    },
    () => {
      const p = who();
      const a = U.rand(2, 4);
      const b = U.rand(1, 5);
      return {
        s: '🧍📐', unit: 'טפחים', ans: a * 6 + b, step: 2,
        q: `${p.n} ${p.v('גבוה', 'גבוהה')} ${a} אמות ו-${b === 1 ? 'טפח אחד' : `${b} טפחים`} (עם הכובע המצחיק 🎩). כמה טפחים זה בסך הכול?`,
        e: `${a} אמות × 6 = ${a * 6} טפחים. ועוד ${b} → <b>${a * 6 + b}</b> טפחים.`,
      };
    },
    () => {
      const n = U.rand(2, 6);
      return {
        s: '🪢✂️', unit: 'חתיכות', ans: n * 6, step: 3,
        q: `לחבל יש אורך של ${cnt(n, LEN('קנה'))}. חותכים אותו לחתיכות של אמה אחת. כמה חתיכות יהיו?`,
        e: `קנה = 6 אמות. ${n} × 6 = <b>${n * 6}</b> חתיכות.`,
      };
    },
    () => {
      const p = who();
      const n = U.rand(2, 10);
      return {
        s: '✋✋', unit: 'אצבעות', ans: n * 12, step: 4,
        q: `${p.n} ${p.v('מדד', 'מדדה')} את המיטה בזרתות, ויצא ${n} זרתות. כמה אצבעות זה?`,
        e: `זרת = 3 טפחים = 12 אצבעות. ${n} × 12 = <b>${n * 12}</b>.`,
      };
    },
    () => {
      const p = who();
      const u = LEN(U.pick(['טפח', 'זרת', 'אמה']));
      const n = U.rand(2, 9);
      const op = U.pick(M.OPS);
      const per = u.cm[op === 'naeh' ? 0 : 1];
      return {
        s: '🌱📏', unit: 'ס"מ', ans: n * per, step: per,
        q: `הצמח של ${p.n} גדל ל-${n} ${M.many(u)}. לפי ${MDATA.opinions[op]} – כמה ס"מ זה?`,
        e: `${u.n} לפי ${MDATA.opinions[op]} = ${per} ס"מ. ${n} × ${per} = <b>${U.fmt(n * per)} ס"מ</b>.`,
      };
    },
  ];

  const distance = [
    () => {
      const a = U.rand(2, 10);
      return {
        s: '🐫💨', unit: 'מילין', ans: a * 4, step: 4,
        q: `הגמל המהיר הלך ${a} פרסאות בלי לעצור לשתות. כמה מילין הוא הלך?`,
        e: `פרסה = 4 מילין. ${a} × 4 = <b>${a * 4}</b>.`,
      };
    },
    () => {
      const p = who();
      const n = U.rand(2, 8);
      return {
        s: '🚶⏱️', unit: 'דקות', ans: n * 18, step: 18,
        q: `${p.n} ${p.v('הלך', 'הלכה')} לבקר את סבתא, ${n} מילין. כמה דקות לקחה ההליכה, לפי 18 דקות למיל?`,
        e: `הילוך מיל = 18 דקות. ${n} × 18 = <b>${n * 18}</b> דקות. (ועוד 5 דקות לעוגיות 🍪)`,
      };
    },
    () => {
      const n = U.rand(2, 5);
      const m = U.rand(1, n * 4 - 1);
      return {
        s: '🛤️🐴', unit: 'מילין', ans: n * 4 - m, step: 2,
        q: `החמור צריך ללכת ${n} פרסאות. הוא כבר הלך ${m} מילין ונרדם בצל 😴. כמה מילין עוד נשארו לו?`,
        e: `${n} פרסאות = ${n * 4} מילין. ${n * 4} − ${m} = <b>${n * 4 - m}</b>.`,
      };
    },
    () => {
      const k = U.rand(2, 6);
      return {
        s: '🐢⏳', unit: 'מילין', ans: k, step: 1,
        q: `צב זריז במיוחד הולך כמו אדם – מיל ב-18 דקות. כמה מילין הוא יעבור ב-${k * 18} דקות?`,
        e: `${k * 18} ÷ 18 = <b>${k}</b> מילין. 🐢`,
      };
    },
    () => {
      const p = who();
      const n = U.rand(3, 18) * 100;
      return {
        s: '🏙️🚶', unit: 'אמות', ans: 2000 - n, step: 100,
        q: `${p.n} ${p.v('יצא', 'יצאה')} בשבת מהעיר, ${p.v('והלך', 'והלכה')} כבר ${n.toLocaleString('en-US')} אמה. תחום שבת הוא 2,000 אמה. כמה אמות עוד מותר?`,
        e: `תחום שבת = 2,000 אמה. 2,000 − ${n} = <b>${(2000 - n).toLocaleString('en-US')}</b>.`,
      };
    },
    () => {
      const h = U.rand(4, 6);
      const mm = U.pick([0, 10, 15, 20, 30, 40, 45]);
      const t = (min) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`;
      const start = h * 60 + mm;
      return {
        s: '🌅🐓', text: true, ans: t(start + 72), wrong: [t(start + 18), t(start + 60), t(start + 96)],
        q: `התרנגול קרא בעלות השחר, בשעה ${t(start)}. מעלות השחר עד הנץ הולכים 4 מילין, 18 דקות למיל. מתי הנץ?`,
        e: `4 × 18 = 72 דקות. ${t(start)} + 72 דקות = <b>${t(start + 72)}</b>.`,
      };
    },
    () => {
      const h = U.rand(10, 14);
      return {
        s: '☀️🕰️', unit: 'דקות', ans: h * 5, step: 5,
        q: `ביום קיץ אחד היום ארוך ${h} שעות. שעה זמנית היא חלק אחד מ-12 של היום. כמה דקות יש בשעה זמנית?`,
        e: `${h} שעות = ${h * 60} דקות. ${h * 60} ÷ 12 = <b>${h * 5}</b>.`,
      };
    },
  ];

  const volume = [
    () => {
      const n = U.rand(2, 9);
      return {
        s: '🏺🥤', unit: 'כוסות', ans: n * 4, step: 2,
        q: `בכד יש ${cnt(n, VOL('לוג'))} מיץ ענבים. מוזגים לכוסות של רביעית. כמה כוסות ימלאו?`,
        e: `לוג = 4 רביעיות. ${n} × 4 = <b>${n * 4}</b>.`,
      };
    },
    () => {
      const p = who();
      const n = U.rand(2, 9);
      return {
        s: '🌾🥖', unit: 'לוגין', ans: n * 4, step: 2,
        q: `${p.n} ${p.v('קנה', 'קנתה')} ${cnt(n, VOL('קב'))} קמח לאפות חלות. כמה לוגין זה?`,
        e: `קב = 4 לוגין. ${n} × 4 = <b>${n * 4}</b>.`,
      };
    },
    () => {
      const n = U.rand(2, 8);
      return {
        s: '🐭🌾', unit: 'קבין', ans: n * 6, step: 3,
        q: `עכבר רעב גילה מחסן עם ${n} סאין חיטה. כל לילה הוא אוכל קב (עכבר רציני!). כמה לילות יספיק לו?`,
        e: `סאה = 6 קבין. ${n} × 6 = <b>${n * 6}</b> לילות. 🐭`,
      };
    },
    () => {
      const n = U.rand(1, 4);
      return {
        s: '🐴🌾', unit: 'ימים', ans: n * 18, step: 6,
        q: `לסוס יש ${n === 1 ? 'איפה אחת' : `${n} איפות`} שעורים. הוא אוכל קב ביום. לכמה ימים זה מספיק?`,
        e: `איפה = 3 סאין = 18 קבין. ${n} × 18 = <b>${n * 18}</b> ימים.`,
      };
    },
    () => {
      const p = who();
      const n = U.rand(2, 6);
      const op = U.pick(M.OPS);
      const per = op === 'naeh' ? 86.4 : 150;
      return {
        s: '🍷🥛', unit: 'סמ"ק', ans: n * per, step: per,
        q: `${p.n} ${p.v('שתה', 'שתתה')} ${n} רביעיות מיץ ביום חם. לפי ${MDATA.opinions[op]} – כמה סמ"ק ${p.v('הוא שתה', 'היא שתתה')}?`,
        e: `רביעית = ביצה וחצי = ${per} סמ"ק לפי ${MDATA.opinions[op]}. ${n} × ${per} = <b>${U.fmt(n * per)}</b>.`,
      };
    },
    () => {
      const n = U.rand(1, 4);
      return {
        s: '🚢🎒', unit: 'שקים', ans: n * 30, step: 10,
        q: `בספינה יש ${n === 1 ? 'כור אחד' : `${n} כורים`} של חיטה. אורזים אותה בשקים של סאה. כמה שקים צריך?`,
        e: `כור = 30 סאין. ${n} × 30 = <b>${n * 30}</b>.`,
      };
    },
    () => {
      const p = who();
      const n = U.rand(2, 8);
      return {
        s: '🥚🍰', unit: 'כזיתים', ans: n * 2, step: 2,
        q: `${p.n} ${p.v('אפה', 'אפתה')} עוגה בנפח של ${n} ביצים. כמה כזיתים יש בה? (כזית = חצי ביצה)`,
        e: `כזית = חצי ביצה, ולכן בכל ביצה 2 כזיתים. ${n} × 2 = <b>${n * 2}</b>.`,
      };
    },
  ];

  const areaWeight = [
    () => {
      const n = U.rand(1, 5);
      return {
        s: '🌾🚜', unit: 'אמות מרובעות', ans: n * 2500, step: 500,
        q: `לחקלאי יש שדה של ${n === 1 ? 'בית סאה אחד' : `${n} בית סאה`}. כמה אמות מרובעות זה?`,
        e: `בית סאה = 50 × 50 = 2,500 אמות מרובעות. ${n} × 2,500 = <b>${(n * 2500).toLocaleString('en-US')}</b>.`,
      };
    },
    () => {
      const p = who();
      const a = U.rand(3, 12);
      const b = U.rand(3, 12);
      return {
        s: '🌻🌷', unit: 'אמות מרובעות', ans: a * b, step: a,
        q: `ל${p.n} יש גינה של ${a} אמות על ${b} אמות, מלאה פרחים. כמה אמות מרובעות יש בה?`,
        e: `${a} × ${b} = <b>${a * b}</b> אמות מרובעות.`,
      };
    },
    () => {
      const n = U.rand(1, 4);
      return {
        s: '🏞️', unit: 'בית סאה', ans: n * 30, step: 10,
        q: `מלך אחד קנה ${n === 1 ? 'בית כור אחד' : `${n} בית כור`} של אדמה. כמה "בית סאה" זה?`,
        e: `בית כור = 30 בית סאה. ${n} × 30 = <b>${n * 30}</b>.`,
      };
    },
    () => {
      const n = U.rand(1, 5);
      return {
        s: '🐘⚖️', unit: 'ק"ג', ans: n * 57.6, step: 57.6,
        q: `פיל חזק סוחב ${n === 1 ? 'כיכר כסף אחת' : `${n} כיכרות כסף`}. כמה ק"ג הוא סוחב?`,
        e: `כיכר = 3,000 שקלים = 57.6 ק"ג. ${n} × 57.6 = <b>${U.fmt(n * 57.6)}</b>.`,
      };
    },
    () => {
      const n = U.rand(2, 6);
      return {
        s: '🧺⚖️', unit: 'גרם', ans: n * 480, step: 240,
        q: `בסל יש ${n} מנים של כסף. כמה גרם כסף טהור יש בסל?`,
        e: `מנה = 25 סלעים × 19.2 = 480 גרם. ${n} × 480 = <b>${(n * 480).toLocaleString('en-US')}</b>.`,
      };
    },
    () => {
      const n = U.rand(1, 4);
      const op = U.pick(M.OPS);
      const per = op === 'naeh' ? 576 : 829.4;
      return {
        s: '⚽🌱', unit: 'מ"ר', ans: n * per, step: per / 2,
        q: `בונים מגרש כדורגל של ${n === 1 ? 'בית סאה אחד' : `${n} בית סאה`}. לפי ${MDATA.opinions[op]} – כמה מ"ר זה?`,
        e: `בית סאה לפי ${MDATA.opinions[op]} = ${per} מ"ר. ${n} × ${per} = <b>${U.fmt(n * per)}</b>.`,
      };
    },
  ];

  const ALL = [...coins, ...length, ...distance, ...volume, ...areaWeight];

  const toItem = (r, typed) => {
    if (typed && !r.text) {
      return {
        s: r.s, q: r.q, input: true, numeric: true, tol: 0.01, ok: [String(r.ans)],
        show: `${U.fmt(r.ans)} ${r.unit}`, note: `מקלידים רק את המספר (${r.unit})`, e: r.e,
      };
    }
    if (r.text) return { s: r.s, q: r.q, a: [r.ans, ...r.wrong], e: r.e };
    const whole = M.isInt(r.ans) && M.isInt(r.step);
    const ok = (x) => x > 0 && x !== r.ans && (!whole || M.isInt(x));
    const near = [r.ans + r.step, r.ans - r.step, r.ans + 2 * r.step, r.ans * 2, r.ans / 2, r.ans - 2 * r.step]
      .map((x) => Math.round(x * 1000) / 1000).filter(ok);
    const wrong = U.shuffle([...new Set(near)]).slice(0, 3);
    for (let k = 3; wrong.length < 3; k++) {
      const x = Math.round((r.ans + k * r.step) * 1000) / 1000;
      if (ok(x) && !wrong.includes(x)) wrong.push(x);
    }
    return { s: r.s, q: r.q, a: [r.ans, ...wrong].map((x) => `${U.fmt(x)} ${r.unit}`), e: r.e };
  };

  const LEVELS = [
    { name: 'מטבעות', icon: '🪙', makers: coins },
    { name: 'אורך', icon: '📏', makers: length },
    { name: 'מרחק וזמן', icon: '🐫', makers: distance },
    { name: 'נפח', icon: '🏺', makers: volume },
    { name: 'שטח ומשקל', icon: '🌾', makers: areaWeight },
    { name: 'ערבוב', icon: '🎲', makers: ALL },
    { name: 'אלופים – מקלידים', icon: '🏆', makers: ALL, typed: true },
  ];
  const PER = 6;

  Games.register({
    id: 'chidot', cat: 'chidot', icon: '🤔',
    title: 'לא פשיטא',
    desc: 'יוסי קנה תפוח בשני דינרים ושילם רק מעה... כמה עוד חסר? חידות מצחיקות עם מספרים שמשתנים!',
    long: `חידות משעשעות על <b>כל המידות, המשקלות והמטבעות</b>. בכל משחק המספרים, השמות והחפצים מתחלפים – אז אפשר לשחק שוב ושוב. בשלב האחרון מקלידים את התשובה. כל שלב הוא ${PER} חידות.`,
    levels: LEVELS.length, free: true,
    levelNames: LEVELS.map((l) => l.name), levelIcons: LEVELS.map((l) => l.icon),
    play(stage, lvl, api) {
      const lv = LEVELS[lvl];
      const makers = [];
      while (makers.length < PER) makers.push(...U.shuffle(lv.makers));
      const qs = makers.slice(0, PER).map((make) => toItem(make(), lv.typed));
      QuizEngine.play(stage, api, qs, {
        hint: `<b>${lv.name}</b> – קראו לאט, הפכו הכול ליחידה הקטנה, ואז חשבו. אפשר להיעזר בדף 📝`,
        winMsg: 'פתרתם את החידות! 🤓',
      });
    },
  });
})();
