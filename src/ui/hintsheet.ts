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
  private pages: string[];
  page: number;
  private closed = false;

  constructor(
    text: string,
    start: number,
    private onClose: () => void,
    private onPage: (page: number) => void,
  ) {
    this.pages = hintPages(text);
    this.page = Math.min(Math.max(0, start), this.pages.length - 1);
    this.textEl = h('div.hs-text');
    this.countEl = h('span.hs-count');
    const x = h('button.hs-x', { type: 'button', 'aria-label': 'Close hint' }, '×');
    x.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });
    this.el = h('div.hintsheet', { role: 'button', 'aria-live': 'polite', 'aria-label': 'Hint. Tap for the next part, swipe up to close.' }, h('div.hs-tag', '💡', this.countEl), this.textEl, x);
    let y0 = 0,
      x0 = 0,
      down = false;
    this.el.addEventListener('pointerdown', (e) => {
      if ((e.target as Element).closest('.hs-x')) return;
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
    this.onPage(this.page);
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
