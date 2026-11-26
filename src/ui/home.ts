import { CHAPTERS, Chapter, RegionId } from '../game/cities';
import { THEMES } from '../render/theme';
import { h } from './dom';
import type { ChapterStatus } from './mapview';

/*
 * "Where are you from?": the player's home city, kept on this phone only
 * (one key, `home`, in the save: a chapter id, '' when skipped, missing
 * when never asked). It only decorates the map, the city card and the
 * share line; it never changes what is unlocked.
 */

export function homeId(data: object): string | undefined {
  const v = (data as { home?: unknown }).home;
  return typeof v === 'string' ? v : undefined;
}

export function homeChapter(data: object): Chapter | null {
  const id = homeId(data);
  return (id && CHAPTERS.find((c) => c.id === id)) || null;
}

export function setHome(data: object, id: string) {
  (data as { home?: string }).home = id;
}

/** main-route capitals still to escape before you reach home */
export function citiesAway(home: Chapter, status: (c: Chapter) => ChapterStatus): number {
  return CHAPTERS.slice(0, CHAPTERS.indexOf(home)).filter((c) => !c.bonus && !c.preview && status(c) !== 'cleared').length;
}

/** "3 cities away", "Up next!", "Escaped!" */
export function homeLine(home: Chapter, status: (c: Chapter) => ChapterStatus): string {
  const st = status(home);
  if (st === 'cleared') return 'Escaped!';
  const n = citiesAway(home, status);
  if (n === 0) return st === 'soon' ? 'Coming soon' : 'Up next!';
  return `${n} ${n === 1 ? 'city' : 'cities'} away`;
}

/** The picker panel: every capital in journey order, grouped by region. */
export function homePicker(o: { current?: string; first: boolean; onPick: (c: Chapter) => void; onSkip: () => void; onClear?: () => void }): HTMLElement {
  const grid = h('div.hp-grid');
  let region: RegionId | null = null;
  for (const c of CHAPTERS) {
    if (c.region !== region) {
      region = c.region;
      grid.append(h('div.hp-region', region));
    }
    const local = c.city ? THEMES[c.city].local : '';
    grid.append(
      h(
        'button.hp-city' + (c.id === o.current ? '.on' : ''),
        { type: 'button', onclick: () => o.onPick(c) },
        h('span.hp-name', c.name),
        h('span.hp-state', c.state, local ? h('span.hp-local', local) : null),
      ),
    );
  }
  return h(
    'div.panel.homepick.fade-in',
    h(
      'div.hp-head',
      h('div', h('p.h1', 'Where are you from?'), h('p.sub', o.first ? "Dad is heading your way. We'll mark your city on the map." : 'Your city gets a pin on the map. Nothing else changes.')),
      h(
        'div.row',
        { style: { flexWrap: 'nowrap' } },
        o.onClear && o.current ? h('button.btn.ghost.small', { type: 'button', onclick: () => o.onClear!() }, 'No city') : null,
        h('button.btn.ghost.small', { type: 'button', onclick: () => o.onSkip() }, o.first ? 'Skip' : 'Back'),
      ),
    ),
    h('div.hp-scroll.scroll', grid),
  );
}
