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
  RPR: {
    city: 'RPR',
    name: 'Raipur',
    local: 'रायपुर',
    sky: ['#4FA3D9', '#B5E0F0', '#FBF3C8'],
    sun: '#FFF6CC',
    far: '#9CCC65',
    mid: '#689F38',
    near: '#33691E',
    accent: '#D84315',
    accent2: '#FDD835',
    tileBase: '#A0522D',
    tileTop: '#C8794E',
    tileEdge: '#7A3B1E',
    tileDark: '#522611',
    topper: '#7CB342',
    pattern: 'brick',
    spike: '#FFF8E1',
    spikeEdge: '#3A1E10',
    ink: '#3A1E10',
    rim: null,
    ui: '#D84315',
  },
} as Record<CityId, Theme>;

/** playable cities in journey order (south to north) */
export const CITY_ORDER: CityId[] = ['RPR'];

/** Future chapters, honestly labelled as not built yet. */
export const COMING_SOON = [
  { code: 'MAA', name: 'Chennai', idea: 'Wind and kite strings make temporary routes' },
  { code: 'JAI', name: 'Jaipur', idea: 'Shadows look solid; the real ledges follow another pattern' },
  { code: 'CCU', name: 'Kolkata', idea: 'A tram flips switches that change the route' },
  { code: 'COK', name: 'Kochi', idea: 'Counterweights raise one platform while lowering another' },
  { code: 'DEL', name: 'Delhi', idea: 'A route board rearranges the platforms' },
];
