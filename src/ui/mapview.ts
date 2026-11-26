import { MAP_CITY_XY, MAP_OUTLINE, MAP_STATES, MAP_VIEWBOX } from '../map/india-data';
import type { Chapter, RegionId } from '../game/cities';
import { CHAPTERS } from '../game/cities';
import { h } from './dom';

/*
 * The journey map: India drawn from real boundary data (states, official
 * outline), every capital on a south-to-north route. Drag to pan, tap a pin
 * to see the city, toggle between a close view and all of India.
 */

export type ChapterStatus = 'cleared' | 'open' | 'locked' | 'soon';


/** Area-weighted centre of the biggest ring of an "M x y l dx dy ... z" path. */
function centroid(d: string): { x: number; y: number; area: number } | null {
  let best: { x: number; y: number; area: number } | null = null;
  for (const ring of d.split(/(?=M)/)) {
    const nums = ring.match(/-?\d+(?:\.\d+)?/g);
    if (!nums || nums.length < 6) continue;
    const pts: [number, number][] = [];
    let x = +nums[0],
      y = +nums[1];
    pts.push([x, y]);
    for (let i = 2; i + 1 < nums.length; i += 2) {
      x += +nums[i];
      y += +nums[i + 1];
      pts.push([x, y]);
    }
    let a = 0,
      cx = 0,
      cy = 0;
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[(i + 1) % pts.length];
      const c = x0 * y1 - x1 * y0;
      a += c;
      cx += (x0 + x1) * c;
      cy += (y0 + y1) * c;
    }
    if (Math.abs(a) < 1e-6) continue;
    const r = { x: cx / (3 * a), y: cy / (3 * a), area: Math.abs(a / 2) };
    if (!best || r.area > best.area) best = r;
  }
  return best;
}

const SHORT: Record<string, string> = {
  'Andaman and Nicobar Islands': 'Andaman & Nicobar',
  'Dadra and Nagar Haveli and Daman and Diu': 'DNH & DD',
  'Jammu and Kashmir': 'Jammu & Kashmir',
  'Arunachal Pradesh': 'Arunachal',
  'Himachal Pradesh': 'Himachal',
};

export interface MapOpts {
  status: (c: Chapter) => ChapterStatus;
  accent: (c: Chapter) => string;
  selected: string;
  /** chapters cleared just now: their route segment draws itself */
  fresh?: string;
  onSelect: (c: Chapter) => void;
  /** the player's home city: a glow and a "Your city" tag with how far it is */
  home?: { id: string; line: string };
}

const NS = 'http://www.w3.org/2000/svg';
function s(tag: string, attrs: Record<string, string | number> = {}, ...kids: (SVGElement | string)[]): SVGElement {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  for (const k of kids) el.append(k as any);
  return el;
}

const REGION_FILL: Record<RegionId, string> = {
  South: '#F4D9A9',
  West: '#F3E3B6',
  Central: '#EADDB3',
  East: '#E6E3B6',
  Northeast: '#DCE5BC',
  North: '#E9DCC6',
};

const norm = (t: string) => t.replace(/&/g, 'and').replace(/\s+/g, ' ').trim().toLowerCase();

/** Smooth route through points (Catmull-Rom as cubic Béziers). */
function routePath(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)],
      p1 = pts[i],
      p2 = pts[i + 1],
      p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

export class IndiaMap {
  el: HTMLElement;
  private svg: SVGSVGElement;
  private vw = 0;
  private vh = 0;
  private scale = 1;
  private tx = 0;
  private ty = 0;
  private overview = false;
  private pins = new Map<string, SVGElement>();
  private here: SVGElement | null = null;
  private hereAt: [number, number] = [0, 0];
  private opts: MapOpts;
  private anim = 0;

  constructor(opts: MapOpts) {
    this.opts = opts;
    const [, , W, H] = MAP_VIEWBOX;
    this.svg = s('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: 'india' }) as SVGSVGElement;
    this.draw();
    const tools = h(
      'div.maptools',
      h('button.btn.ghost.small', { 'aria-label': 'Zoom in', onclick: () => this.zoomIn() }, '+'),
      h('button.btn.ghost.small', { 'aria-label': 'Zoom out', onclick: () => this.zoomOut() }, '−'),
      h('button.btn.ghost.small.mapzoom', { onclick: () => this.fit(true) }, 'All India'),
    );
    this.el = h('div.mapview', this.svg as unknown as HTMLElement, tools);
    this.bindPan();
    requestAnimationFrame(() => this.layout(true));
    window.addEventListener('resize', this.onResize);
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
    cancelAnimationFrame(this.anim);
  }

  private onResize = () => this.layout(false);

  // ------------------------------------------------------------------ draw
  private draw() {
    const [, , W, H] = MAP_VIEWBOX;
    const o = this.opts;
    const defs = s(
      'defs',
      {},
      s('radialGradient', { id: 'sea', cx: '50%', cy: '55%', r: '75%' }, s('stop', { offset: '0%', 'stop-color': '#A9DFEA' }), s('stop', { offset: '100%', 'stop-color': '#5FAFC9' })),
      s('filter', { id: 'landShadow', x: '-5%', y: '-5%', width: '110%', height: '110%' }, s('feDropShadow', { dx: 0, dy: 6, stdDeviation: 6, 'flood-color': '#1E4E63', 'flood-opacity': 0.35 })),
      s('pattern', { id: 'waves', width: 60, height: 30, patternUnits: 'userSpaceOnUse' }, s('path', { d: 'M0 15 q15 -8 30 0 t30 0', fill: 'none', stroke: 'rgba(255,255,255,0.25)', 'stroke-width': 1.5 })),
    );
    this.svg.append(defs);
    this.svg.append(s('rect', { x: -2000, y: -2000, width: W + 4000, height: H + 4000, fill: 'url(#sea)' }));
    this.svg.append(s('rect', { x: -2000, y: -2000, width: W + 4000, height: H + 4000, fill: 'url(#waves)' }));
    // land
    this.svg.append(s('path', { d: MAP_OUTLINE, fill: '#F1E2C2', filter: 'url(#landShadow)' }));
    // states, tinted by region; cleared states glow in their city's colour
    const byState = new Map<string, Chapter[]>();
    for (const c of CHAPTERS) {
      const k = norm(c.state);
      byState.set(k, [...(byState.get(k) ?? []), c]);
    }
    const statesG = s('g', { class: 'states' });
    for (const st of MAP_STATES) {
      const chs = byState.get(norm(st.name)) ?? [];
      const region = chs[0]?.region ?? 'Central';
      const cleared = chs.length > 0 && chs.every((c) => o.status(c) === 'cleared');
      const fill = cleared ? o.accent(chs[0]) : REGION_FILL[region];
      statesG.append(s('path', { d: st.d, fill, 'fill-opacity': cleared ? 0.55 : 1, stroke: '#B39470', 'stroke-width': 1.3, 'stroke-linejoin': 'round' }));
    }
    this.svg.append(statesG);
    this.svg.append(s('path', { d: MAP_OUTLINE, fill: 'none', stroke: '#6E4F2E', 'stroke-width': 2.6, 'stroke-linejoin': 'round' }));
    // Lakshadweep's coral islands are too small for the data at this scale: mark them
    const kv = MAP_CITY_XY['KVT'];
    if (kv) for (const [dx, dy, r] of [[-14, -40, 4], [6, -22, 3], [-2, 0, 5], [10, 18, 3], [-10, 34, 3.5], [16, 52, 4]]) this.svg.append(s('ellipse', { cx: kv[0] + dx, cy: kv[1] + dy, rx: r * 1.3, ry: r, fill: '#F1E2C2', stroke: '#6E4F2E', 'stroke-width': 1.2 }));
    // the route, south to north
    const pts = CHAPTERS.filter((c) => !c.bonus).map((c) => MAP_CITY_XY[c.id] as [number, number]);
    this.svg.append(s('path', { d: routePath(pts), fill: 'none', stroke: '#7A5A3A', 'stroke-width': 3, 'stroke-dasharray': '2 9', 'stroke-linecap': 'round', opacity: 0.75 }));
    const done = CHAPTERS.filter((c) => !c.bonus);
    let n = 0;
    while (n < done.length && o.status(done[n]) === 'cleared') n++;
    if (n > 0) {
      const sub = done.slice(0, Math.min(done.length, n + 1)).map((c) => MAP_CITY_XY[c.id] as [number, number]);
      const p = s('path', { d: routePath(sub), fill: 'none', stroke: '#E8572A', 'stroke-width': 5, 'stroke-linecap': 'round', class: o.fresh ? 'route-draw' : '' });
      this.svg.append(p);
    }
    // sea routes to the bonus islands
    for (const c of CHAPTERS.filter((c) => c.bonus)) {
      const i = CHAPTERS.indexOf(c);
      const from = MAP_CITY_XY[CHAPTERS[i - 1].id],
        to = MAP_CITY_XY[c.id];
      if (!from || !to) continue;
      const mx = (from[0] + to[0]) / 2,
        my = (from[1] + to[1]) / 2 + 30;
      this.svg.append(s('path', { d: `M${from[0]} ${from[1]} Q${mx} ${my} ${to[0]} ${to[1]}`, fill: 'none', stroke: '#2E6E8E', 'stroke-width': 2.4, 'stroke-dasharray': '6 6', opacity: 0.7 }));
    }
    // state names (shown when zoomed in), the seas, a compass
    const labels = s('g', { class: 'slabels' });
    for (const st of MAP_STATES) {
      const c = centroid(st.d);
      if (!c || c.area < 700) continue;
      labels.append(s('text', { x: c.x.toFixed(1), y: c.y.toFixed(1), 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'slabel' }, SHORT[st.name] ?? st.name));
    }
    this.svg.append(labels);
    for (const [t, x, y] of [
      ['Arabian Sea', 100, 930],
      ['Bay of Bengal', 690, 830],
      ['Indian Ocean', 560, 1120],
    ] as [string, number, number][])
      this.svg.append(s('text', { x, y, 'text-anchor': 'middle', class: 'sea' }, t));
    // pins
    for (const c of CHAPTERS) this.svg.append(this.pin(c));
    // a little marker over the next city to play
    const next = CHAPTERS.find((c) => !c.bonus && !c.preview && o.status(c) === 'open');
    if (next) {
      const [x, y] = MAP_CITY_XY[next.id];
      this.here = s('g', { transform: `translate(${x} ${y})` }, s('g', { class: 'here' }, s('path', { d: 'M-8 -31 L8 -31 L0 -20 Z', fill: '#E8572A', stroke: '#FFF8EA', 'stroke-width': 2 })));
      this.hereAt = [x, y];
      this.svg.append(this.here);
    }
  }

  private pin(c: Chapter): SVGElement {
    const [x, y] = MAP_CITY_XY[c.id];
    const st = this.opts.status(c);
    const acc = this.opts.accent(c);
    const g = s('g', { class: `pin ${st}${c.id === this.opts.selected ? ' sel' : ''}`, transform: `translate(${x} ${y})` });
    const r = c.bonus || c.preview ? 12 : 15;
    const home = this.opts.home?.id === c.id;
    if (home) {
      g.classList.add('home');
      g.append(s('circle', { r: r + 20, fill: '#FFD166', class: 'homeglow' }));
    }
    if (st === 'open') g.append(s('circle', { r: r + 9, fill: acc, opacity: 0.25, class: 'pulse' }));
    const fill = st === 'cleared' ? acc : st === 'open' ? '#FFFFFF' : st === 'locked' ? '#E9E4DA' : '#CFC6B5';
    const stroke = st === 'soon' ? '#9C8E78' : st === 'locked' ? '#8C8576' : acc;
    if (c.bonus) {
      // bonus: a star badge
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rr = i % 2 ? r * 0.55 : r * 1.15;
        pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`);
      }
      g.append(s('polygon', { points: pts.join(' '), fill, stroke, 'stroke-width': 3 }));
    } else g.append(s('circle', { r, fill, stroke, 'stroke-width': st === 'soon' ? 2 : 3.5 }));
    const glyph = st === 'cleared' ? '✓' : st === 'locked' ? '🔒' : st === 'soon' ? '' : '▶';
    if (glyph) g.append(s('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': st === 'locked' ? 11 : 14, 'font-weight': 800, fill: st === 'cleared' ? '#FFFFFF' : acc, y: 0.5 }, glyph));
    const label = c.state === 'Punjab' || c.state === 'Haryana' ? `${c.name} · ${c.state}` : c.name;
    g.append(
      s(
        'text',
        {
          ...labelAt(LABEL_AT[c.id] ?? 'b', r),
          'font-size': st === 'soon' ? 12 : 14,
          'font-weight': 800,
          fill: st === 'soon' ? '#6B5F4E' : '#3A2614',
          stroke: '#FFF8EA',
          'stroke-width': 4,
          'paint-order': 'stroke',
          class: 'plabel',
        },
        label + (c.preview ? ' (preview)' : ''),
      ),
    );
    if (home) {
      // above the pin, clear of the "next city" marker
      const tag = { 'text-anchor': 'middle', 'font-weight': 800, stroke: '#FFF8EA', 'stroke-width': 4, 'paint-order': 'stroke' };
      g.append(
        s('g', { class: 'hometag' }, s('text', { ...tag, y: -(r + 46), 'font-size': 20, fill: '#B5470F' }, '\u{1F3E0} Your city'), s('text', { ...tag, y: -(r + 27), 'font-size': 15, fill: '#3A2614' }, this.opts.home!.line)),
      );
    }
    // generous touch target
    g.append(s('circle', { r: 30, fill: 'transparent' }));
    g.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.dragged) return;
      this.select(c.id);
      this.opts.onSelect(c);
    });
    this.pins.set(c.id, g);
    return g;
  }

  select(id: string) {
    for (const [k, g] of this.pins) g.classList.toggle('sel', k === id);
    this.opts.selected = id;
    this.reveal(id);
  }

  // ------------------------------------------------------------------ view
  // The map opens showing all of India. Pinch, scroll or double-tap to zoom; drag to move.
  private minScale = 0.2;
  private maxScale = 2;

  private static PAD = { l: 58, t: 46, b: 26, r: 8 };

  private fitScale() {
    const [, , W, H] = MAP_VIEWBOX;
    const P = IndiaMap.PAD;
    return Math.min((this.freeWidth() - P.l - P.r) / W, (this.vh - P.t - P.b) / H);
  }

  private layout(first: boolean) {
    const r = this.el.getBoundingClientRect();
    this.vw = r.width;
    this.vh = r.height;
    if (!this.vw || !this.vh) return;
    const fit = this.fitScale();
    this.minScale = fit * 0.9;
    this.maxScale = Math.max(fit * 5, 1.4);
    if (first || this.overview) this.fit(!first);
    else {
      this.scale = Math.min(this.maxScale, Math.max(this.minScale, this.scale));
      this.clamp();
      this.apply(false);
    }
  }

  /** the whole country, centred in the part of the screen the card doesn't cover */
  private fit(smooth: boolean) {
    const [, , W, H] = MAP_VIEWBOX;
    const P = IndiaMap.PAD;
    this.scale = this.fitScale();
    this.overview = true;
    this.tx = P.l + (this.freeWidth() - P.l - P.r - W * this.scale) / 2;
    this.ty = P.t + (this.vh - P.t - P.b - H * this.scale) / 2;
    this.apply(smooth);
  }

  /** Width of the map area not covered by the city card on the right. */
  private freeWidth(): number {
    const card = this.el.parentElement?.querySelector('.citycard') as HTMLElement | null;
    if (!card || this.vw <= 600) return this.vw;
    return Math.max(200, card.getBoundingClientRect().left - this.el.getBoundingClientRect().left - 8);
  }

  /** pan just enough to bring a pin into view, keeping the zoom */
  private reveal(id: string) {
    const p = MAP_CITY_XY[id];
    if (!p || !this.vw) return;
    const x = this.tx + p[0] * this.scale,
      y = this.ty + p[1] * this.scale;
    const fw = this.freeWidth(),
      m = 60;
    if (x > m && x < fw - m && y > m && y < this.vh - m) return;
    this.tx = fw / 2 - p[0] * this.scale;
    this.ty = this.vh / 2 - p[1] * this.scale;
    this.clamp();
    this.apply(true);
  }

  private zoomAt(cx: number, cy: number, factor: number, smooth = false) {
    const next = Math.min(this.maxScale, Math.max(this.minScale, this.scale * factor));
    const k = next / this.scale;
    this.tx = cx - (cx - this.tx) * k;
    this.ty = cy - (cy - this.ty) * k;
    this.scale = next;
    this.overview = false;
    this.clamp();
    this.apply(smooth);
  }

  private clamp() {
    const [, , W, H] = MAP_VIEWBOX;
    const mw = W * this.scale,
      mh = H * this.scale,
      fw = this.freeWidth();
    // smaller than the view: keep it centred; bigger: never let it slide out of sight
    const P = IndiaMap.PAD;
    if (mw <= fw - P.l - P.r) this.tx = P.l + (fw - P.l - P.r - mw) / 2;
    else this.tx = Math.min(fw * 0.35, Math.max(fw * 0.65 - mw, this.tx));
    if (mh <= this.vh - P.t - P.b) this.ty = P.t + (this.vh - P.t - P.b - mh) / 2;
    else this.ty = Math.min(this.vh * 0.35, Math.max(this.vh * 0.65 - mh, this.ty));
  }

  private apply(smooth: boolean) {
    const [, , W, H] = MAP_VIEWBOX;
    this.svg.style.transition = smooth ? 'transform 0.45s cubic-bezier(.2,.8,.2,1), width 0.45s cubic-bezier(.2,.8,.2,1), height 0.45s cubic-bezier(.2,.8,.2,1)' : 'none';
    this.svg.style.width = `${W * this.scale}px`;
    this.svg.style.height = `${H * this.scale}px`;
    this.svg.style.transform = `translate(${this.tx}px, ${this.ty}px)`;
    // pins and labels keep a readable size on screen whatever the zoom
    const k = Math.min(2.6, Math.max(1, 0.5 / this.scale));
    const far = this.scale < 0.55;
    for (const [id, g] of this.pins) {
      const [x, y] = MAP_CITY_XY[id];
      // far away, cities you can't play yet shrink to dots so the open ones stand out
      const quiet = far && (g.classList.contains('soon') || g.classList.contains('locked')) && !g.classList.contains('sel') && !g.classList.contains('home');
      g.setAttribute('transform', `translate(${x} ${y}) scale(${(quiet ? k * 0.55 : k).toFixed(3)})`);
    }
    if (this.here) this.here.setAttribute('transform', `translate(${this.hereAt[0]} ${this.hereAt[1]}) scale(${k.toFixed(3)})`);
    this.svg.classList.toggle('far', this.scale < 0.55);
    this.svg.classList.toggle('near', this.scale > 0.9);
    this.svg.style.setProperty('--lk', String(Math.min(3.5, Math.max(1, 0.8 / this.scale))));
  }

  // ------------------------------------------------------------- touch
  private dragged = false;
  private bindPan() {
    const pts = new Map<number, { x: number; y: number }>();
    let sx = 0,
      sy = 0,
      ox = 0,
      oy = 0,
      pinch0 = 0,
      scale0 = 1,
      lastTap = 0;
    const local = (e: PointerEvent | WheelEvent | MouseEvent) => {
      const r = this.el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    this.el.addEventListener('pointerdown', (e) => {
      if ((e.target as Element).closest('button')) return;
      pts.set(e.pointerId, local(e));
      this.svg.style.transition = 'none';
      if (pts.size === 1) {
        this.dragged = false;
        sx = e.clientX;
        sy = e.clientY;
        ox = this.tx;
        oy = this.ty;
        // double tap zooms in on the spot
        const now = performance.now();
        if (now - lastTap < 320 && !(e.target as Element).closest('.pin')) {
          const p = local(e);
          this.zoomAt(p.x, p.y, this.scale * 2 > this.maxScale ? 0.3 : 2, true);
          lastTap = 0;
        } else lastTap = now;
      } else if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        pinch0 = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        scale0 = this.scale;
        this.dragged = true;
      }
    });
    this.el.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, local(e));
      if (pts.size >= 2) {
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        const target = scale0 * (d / pinch0);
        this.zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, target / this.scale);
        return;
      }
      const dx = e.clientX - sx,
        dy = e.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 6) this.dragged = true;
      if (!this.dragged) return;
      this.tx = ox + dx;
      this.ty = oy + dy;
      this.overview = false;
      this.clamp();
      this.apply(false);
    });
    const up = (e: PointerEvent) => {
      pts.delete(e.pointerId);
      if (pts.size === 1) {
        // carry on panning with the finger that's left
        const [p] = [...pts.values()];
        const r = this.el.getBoundingClientRect();
        sx = p.x + r.left;
        sy = p.y + r.top;
        ox = this.tx;
        oy = this.ty;
      }
      if (pts.size === 0) setTimeout(() => (this.dragged = false), 0);
    };
    this.el.addEventListener('pointerup', up);
    this.el.addEventListener('pointercancel', up);
    this.el.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const p = local(e);
        this.zoomAt(p.x, p.y, e.deltaY < 0 ? 1.18 : 1 / 1.18);
      },
      { passive: false },
    );
  }

  zoomIn() {
    this.zoomAt(this.freeWidth() / 2, this.vh / 2, 1.6, true);
  }

  zoomOut() {
    this.zoomAt(this.freeWidth() / 2, this.vh / 2, 1 / 1.6, true);
  }
}

/** where each pin's name sits, so neighbours on the south-east coast don't cover each other */
const LABEL_AT: Record<string, 'b' | 'r' | 'l' | 't'> = { CHN: 'r', PDY: 'r', AMR: 'r', BLR: 'l', HYD: 'l', BOM: 'l', DMN: 'l', PNJ: 'l' };
function labelAt(at: 'b' | 'r' | 'l' | 't', r: number): Record<string, string | number> {
  if (at === 'r') return { x: r + 7, y: 5, 'text-anchor': 'start' };
  if (at === 'l') return { x: -(r + 7), y: 5, 'text-anchor': 'end' };
  if (at === 't') return { y: -(r + 8), 'text-anchor': 'middle' };
  return { y: r + 15, 'text-anchor': 'middle' };
}
