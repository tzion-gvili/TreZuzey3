'use strict';

// Aramaic word games – one game per study file (10–14).
Words.register({
  id: 'milim', cat: 'aramit', icon: '🧩',
  title: 'המילים הקטנות',
  desc: 'מאי, היכי, הכא, התם... המילים שבונות כל משפט בגמרא.',
  long: 'מילות שאלה, כינויים, מילות יחס וקישור ופעלים נפוצים. מי שמכיר אותן – קורא גמרא הרבה יותר בקלות.',
  groups: ADATA.milim,
});

Words.register({
  id: 'shakla', cat: 'aramit', icon: '🗣️',
  title: 'שקלא וטריא',
  desc: 'איבעיא להו, מיתיבי, לא קשיא, תיקו – דרך הדיון בגמרא.',
  long: 'המונחים שמראים לאן הסוגיה הולכת: פתיחת דיון, קושיה, תירוץ ומסקנה.',
  groups: ADATA.shakla,
});

Words.register({
  id: 'rashei', cat: 'aramit', icon: '🔠',
  title: 'ראשי תיבות',
  desc: 'ש"מ, קמ"ל, ת"ש, נ"מ – פותחים קיצורים של הגמרא והמפרשים.',
  long: 'בכל שאלה: או לפתוח את הקיצור למילים המלאות, או לבחור את הפירוש שלו.',
  groups: ADATA.rashei,
});

Words.register({
  id: 'pitgamim', cat: 'aramit', icon: '💬',
  title: 'פתגמים',
  desc: 'מילה בסלע, משתוקא בתרין – פתגמי חכמה מן הגמרא.',
  long: 'פתגמים על לימוד, על אדם ומידות, על ממון ועל ספק ורוב. בהסבר מופיע גם המקור.',
  groups: ADATA.pitgamim,
});

Words.register({
  id: 'dibur', cat: 'aramit', icon: '☕',
  title: 'ארמית בדיבור',
  desc: 'אדרבה, נפקא מינה, בר סמכא – ארמית שנכנסה לעברית של היום.',
  long: 'ביטויים מן הגמרא שמדברים בהם גם היום. בהסבר מופיעה דוגמה איך משתמשים בהם.',
  groups: ADATA.dibur,
});
