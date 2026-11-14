import { COLS, ROWS } from '../constants';

/**
 * Build an 18-row tile map with a few fills instead of hand-counting characters.
 * 32 columns is one screen; wider maps scroll (the camera follows Dad).
 * Columns and rows are inclusive ranges.
 */
export class Grid {
  private g: string[][];
  readonly cols: number;

  constructor(cols = COLS) {
    this.cols = cols;
    this.g = Array.from({ length: ROWS }, () => Array.from({ length: cols }, () => '.'));
  }

  /** A copy of an existing map (eg. a one-screen stage), widened to `cols` with ground on the new part. */
  static from(rows: string[], cols: number, top = 15): Grid {
    const g = Grid.ground(top, cols);
    rows.forEach((r, y) => {
      for (let x = 0; x < r.length; x++) g.g[y][x] = r[x];
    });
    return g;
  }
  /** what's at a cell */
  at(c: number, r: number): string {
    return this.g[r]?.[c] ?? '.';
  }
  /** Solid ground from row `top` down to the bottom, across all columns. */
  static ground(top = 15, cols = COLS): Grid {
    return new Grid(cols).fill(0, cols - 1, top, ROWS - 1, '#');
  }

  fill(c0: number, c1: number, r0: number, r1: number, ch: string): this {
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) this.g[r][c] = ch;
    return this;
  }

  /** Clear a pit: columns c0..c1 from row `top` to the bottom. */
  pit(c0: number, c1: number, top = 15): this {
    return this.fill(c0, c1, top, ROWS - 1, '.');
  }

  put(c: number, r: number, ch: string): this {
    this.g[r][c] = ch;
    return this;
  }

  rows(): string[] {
    return this.g.map((r) => r.join(''));
  }
}
