import type { CityId } from '../game/constants';

export interface Theme {
  city: CityId;
  name: string;
  local: string;
  sky: [string, string, string];
  sun: string;
  far: string;
  mid: string;
  near: string;
  accent: string;
  accent2: string;
  tileBase: string;
  tileTop: string;
  tileEdge: string;
  tileDark: string;
  topper: string;
  pattern: 'brick' | 'granite' | 'concrete';
  spike: string;
  spikeEdge: string;
  ink: string;
  rim: string | null;
  ui: string;
}

export const THEMES = {
} as Record<CityId, Theme>;

/** playable cities in journey order (south to north) */
export const CITY_ORDER: CityId[] = [];

/** Future chapters, honestly labelled as not built yet. */
export const COMING_SOON = [
  { code: 'MAA', name: 'Chennai', idea: 'Wind and kite strings make temporary routes' },
  { code: 'JAI', name: 'Jaipur', idea: 'Shadows look solid; the real ledges follow another pattern' },
  { code: 'CCU', name: 'Kolkata', idea: 'A tram flips switches that change the route' },
  { code: 'COK', name: 'Kochi', idea: 'Counterweights raise one platform while lowering another' },
  { code: 'DEL', name: 'Delhi', idea: 'A route board rearranges the platforms' },
];
