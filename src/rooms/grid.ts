import { COLS, ROWS } from '../game/constants';

/**
 * A room map from its bottom rows: pass the last rows (down to row 17), everything
 * above is empty air. Every row must be 32 wide.
 */
export function rows(...bottom: string[]): string[] {
  const out: string[] = [];
  for (let y = 0; y < ROWS - bottom.length; y++) out.push('.'.repeat(COLS));
  for (const r of bottom) {
    if (r.length !== COLS) throw new Error(`room row is ${r.length} wide, not ${COLS}: ${r}`);
    out.push(r);
  }
  if (out.length !== ROWS) throw new Error(`room has ${out.length} rows`);
  return out;
}
