import { h } from './dom';

/** Split a hint into short pages (whole sentences, about two lines each), in the order you meet them. */
export function hintPages(text: string, max = 150): string[] {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const pages: string[] = [];
  let cur = '';
  for (const p of parts) {
    if (cur && cur.length + 1 + p.length > max) {
      pages.push(cur);
      cur = p;
    } else cur = cur ? cur + ' ' + p : p;
  }
  if (cur) pages.push(cur);
  return pages.length ? pages : [text];
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * The hint as a slim strip at the top, under the HUD: the stage keeps running and stays visible.
 * Tap it for the next part (the last tap closes it), swipe it up or press × to close.
 * It goes see-through whenever Dad or the door is behind it.
 */
export class HintSheet {
  el: HTMLElement;
  private textEl: HTMLElement;
  private countEl: HTMLElement;
  private hereEl: HTMLElement;
  private backEl: HTMLElement;
  page: number;
  private here = -1;
  private closed = false;

  /**
   * `pages` in the order you meet them. `partOf[i]` (long stages only) is the stretch page i belongs to:
   * pages of the stretch Dad is in (`setHere`) get a "You are here" label.
   */
  constructor(
    private pages: string[],
    start: number,
    private onClose: () => void,
    private onPage: (page: number) => void,
    private partOf: number[] | null = null,
  ) {
    this.page = Math.min(Math.max(0, start), this.pages.length - 1);
    if (partOf) this.here = partOf[this.page];
    this.textEl = h('div.hs-text');
    this.countEl = h('span.hs-count');
    this.hereEl = h('span.hs-here', 'You are here');
    const x = h('button.hs-x', { type: 'button', 'aria-label': 'Close hint' }, '×');
    x.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });
    this.backEl = h('button.hs-b', { type: 'button', 'aria-label': 'Previous part' }, '‹');
    this.backEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this.prev();
    });
    this.el = h(
      'div.hintsheet',
      { role: 'button', 'aria-live': 'polite', 'aria-label': 'Hint. Tap for the next part, swipe up to close.' },
      h('div.hs-tag', h('div', '💡', this.countEl), this.hereEl),
      this.backEl,
      this.textEl,
      x,
    );
    let y0 = 0,
      x0 = 0,
      down = false;
    this.el.addEventListener('pointerdown', (e) => {
      if ((e.target as Element).closest('.hs-x, .hs-b')) return;
      down = true;
      y0 = e.clientY;
      x0 = e.clientX;
      this.el.style.transition = 'none';
    });
    this.el.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dy = Math.min(0, e.clientY - y0);
      this.el.style.transform = `translate(-50%, ${dy}px)`;
    });
    const up = (e: PointerEvent) => {
      if (!down) return;
      down = false;
      this.el.style.transition = '';
      this.el.style.transform = '';
      const dy = e.clientY - y0,
        dx = e.clientX - x0;
      if (dy < -18) this.close();
      else if (Math.abs(dy) < 12 && Math.abs(dx) < 12) this.next();
    };
    this.el.addEventListener('pointerup', up);
    this.el.addEventListener('pointercancel', () => {
      down = false;
      this.el.style.transition = '';
      this.el.style.transform = '';
    });
    this.show();
  }

  private show() {
    this.textEl.textContent = this.pages[this.page];
    const n = this.pages.length;
    this.countEl.textContent = n > 1 ? ` ${this.page + 1}/${n}` : '';
    this.el.classList.toggle('more', this.page < n - 1);
    this.backEl.classList.toggle('off', this.page === 0);
    this.markHere();
    this.onPage(this.page);
  }

  private markHere() {
    const on = !!this.partOf && this.partOf[this.page] === this.here;
    this.el.classList.toggle('here', on);
  }

  /** the stretch Dad is in now (long stages); the label follows him as he moves */
  setHere(part: number) {
    if (part === this.here) return;
    this.here = part;
    this.markHere();
  }

  prev() {
    if (this.page === 0) return;
    this.page--;
    this.show();
  }

  next() {
    if (this.page >= this.pages.length - 1) return this.close();
    this.page++;
    this.show();
  }

  /** fade right down while something the player needs to see is behind the strip */
  seeThrough(boxes: Box[]) {
    const r = this.el.getBoundingClientRect();
    const over = boxes.some((b) => b.x + b.w > r.left - 4 && b.x < r.right + 4 && b.y + b.h > r.top - 4 && b.y < r.bottom + 4);
    this.el.classList.toggle('see', over);
  }

  close(now = false) {
    if (this.closed) return;
    this.closed = true;
    this.onClose();
    if (now) return void this.el.remove();
    this.el.classList.add('out');
    setTimeout(() => this.el.remove(), 240);
  }
}

/** A long stage's hint by stretch: each of `parts` split into pages, and which part every page came from. */
export function partPages(parts: string[]): { pages: string[]; partOf: number[] } {
  const pages: string[] = [],
    partOf: number[] = [];
  parts.forEach((t, i) => {
    if (!t.trim()) return;
    for (const p of hintPages(t)) pages.push(p), partOf.push(i);
  });
  return { pages, partOf };
}
