// The 7th death: back to the stage start (default), or with `lives: 'act'` back to the start of the act Dad is
// in. Drives a real Session with a stub app on a flat test stage with three checkpoints, the middle one an
// act start. Also checks longStage's hintParts / hintAt and hintPartAt().
import { describe, expect, it } from 'vitest';
import { Session, LIVES } from '../src/app/session';
import type { App } from '../src/app/app';
import { NO_INPUT, type LevelDef } from '../src/game/world';
import { checkpoint, door, px } from '../src/game/levels/kit';
import { Grid } from '../src/game/levels/grid';
import { hintPartAt } from '../src/game/levels/chunks';
import { LEVEL_BY_ID } from '../src/game/levels';

const stub = () =>
  ({
    store: {
      data: { settings: { rival: 'tara', character: 'papa' }, totalDeaths: 0 },
      log() {},
      stage: () => ({ attempts: 0, deaths: 0 }),
    },
    hud: null,
    fx: { fade: 0 },
    handleEvents() {},
    seven() {},
    quip() {},
    nearMiss() {},
    irisClose() {},
    onStageClear() {},
  }) as unknown as App;

const stage = (lives?: 'stage' | 'act'): LevelDef => ({
  id: 'LEH-02',
  city: 'RNC',
  index: 2,
  name: 'Lives test',
  hint: 'Walk.',
  map: Grid.ground(15, 64).put(1, 14, '@').put(62, 14, 'E').rows(),
  actStarts: [20.5],
  lives,
  build(w) {
    door(w);
    checkpoint(w, 10.5);
    checkpoint(w, 20.5); // the act start
    checkpoint(w, 30.5);
  },
});

const R = { ...NO_INPUT, right: true };

/** walk past all three checkpoints, then die 7 times; where does the 8th attempt start? */
function afterSeven(def: LevelDef) {
  const s = new Session(stub(), def, null);
  for (let i = 0; i < 600 && s.world.player.x < px(34); i++) s.tick(R);
  expect(s.world.cp).toBe(2);
  const starts: number[] = [];
  for (let d = 0; d < LIVES; d++) {
    // (stand a while first: a death within a second of coming back drops that checkpoint)
    for (let i = 0; i < 160; i++) s.tick(NO_INPUT);
    s.world.die('test');
    for (let i = 0; i < 200 && s.world.state === 'dead'; i++) s.tick(NO_INPUT);
    starts.push(Math.round(s.world.player.x / 16));
  }
  return { s, starts };
}

describe('lives', () => {
  it("default: the 7th death starts the stage over", () => {
    const { s, starts } = afterSeven(stage());
    expect(starts.slice(0, LIVES - 1).every((x) => x === 30)).toBe(true);
    expect(starts[LIVES - 1]).toBe(1);
    expect(s.lives).toBe(LIVES);
    expect(s.wipes).toBe(1);
  });
  it("lives: 'act': the 7th death goes back to the start of the act, with a full set of lives", () => {
    const { s, starts } = afterSeven(stage('act'));
    expect(starts.slice(0, LIVES - 1).every((x) => x === 30)).toBe(true);
    expect(starts[LIVES - 1]).toBe(20);
    expect(s.lives).toBe(LIVES);
    expect(s.wipes).toBe(1);
  });
  it("lives: 'act' before any act start: back to the stage start", () => {
    const def = stage('act');
    const s = new Session(stub(), def, null);
    for (let i = 0; i < 600 && s.world.player.x < px(14); i++) s.tick(R);
    for (let d = 0; d < LIVES; d++) {
      s.world.die('test');
      for (let i = 0; i < 200 && s.world.state === 'dead'; i++) s.tick(NO_INPUT);
    }
    expect(Math.round(s.world.player.x / 16)).toBe(1);
  });
});

describe('hint parts', () => {
  it('a long stage splits its hint into room, acts and door, and hintPartAt follows Dad', () => {
    const def = LEVEL_BY_ID.get('RNC-05')!;
    expect(def.hintParts!.length).toBeGreaterThanOrEqual(3);
    expect(def.hintParts!.join(' ')).toBe(def.hint);
    expect(def.hintAt!.length).toBe(def.hintParts!.length);
    expect(def.hintAt![0]).toBe(0);
    expect(hintPartAt(def, 0)).toBe(0);
    expect(hintPartAt(def, px(def.hintAt![1]))).toBe(1);
    expect(hintPartAt(def, px(def.doorX!))).toBe(def.hintParts!.length - 1);
    expect(def.actStarts!.length).toBeGreaterThan(0);
  });
});
