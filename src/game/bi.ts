// Two-language lines: "regional words | English meaning".
// Bubbles and callouts show the regional line first, then the English a moment (~0.3 s) later.

export const SEP = ' | ';
/** seconds before the English meaning appears under a line */
export const EN_DELAY = 0.3;
/** how long the English stays readable */
export const EN_HOLD = 2.3;

export function bi(s: string): { main: string; en: string | null } {
  const i = s.indexOf(SEP);
  return i < 0 ? { main: s, en: null } : { main: s.slice(0, i), en: s.slice(i + SEP.length) };
}

export const mainOf = (s: string) => bi(s).main;
