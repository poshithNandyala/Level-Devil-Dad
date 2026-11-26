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
  JAI: {
    city: 'JAI',
    name: 'Jaipur',
    local: 'जयपुर',
    sky: ['#4A8CC8', '#A6CDE8', '#FBE1CC'],
    sun: '#FFF0D2',
    far: '#C9A08E',
    mid: '#C97B6B',
    near: '#8E4E43',
    accent: '#E91E63',
    accent2: '#FFB300',
    tileBase: '#C8705F',
    tileTop: '#E39A87',
    tileEdge: '#9C4E40',
    tileDark: '#6E3229',
    topper: '#E8B04A',
    pattern: 'brick',
    spike: '#F7EDE6',
    spikeEdge: '#3A1E18',
    ink: '#3A1E18',
    rim: null,
    ui: '#E91E63',
  },
  BPL: {
    city: 'BPL',
    name: 'Bhopal',
    local: 'भोपाल',
    sky: ['#3F8FB5', '#9FD0DC', '#F6E7C6'],
    sun: '#FFF3D0',
    far: '#8FB0A8',
    mid: '#5E8C84',
    near: '#3C5F5A',
    accent: '#00897B',
    accent2: '#FFB300',
    tileBase: '#7A8F74',
    tileTop: '#A9BC98',
    tileEdge: '#566A52',
    tileDark: '#3A4A38',
    topper: '#D9C27A',
    pattern: 'brick',
    spike: '#F2F4EC',
    spikeEdge: '#22302A',
    ink: '#22302A',
    rim: null,
    ui: '#00897B',
  },
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
export const CITY_ORDER: CityId[] = ['JAI', 'BPL', 'RPR'];

/** Future chapters, honestly labelled as not built yet. */
export const COMING_SOON = [
  { code: 'MAA', name: 'Chennai', idea: 'Wind and kite strings make temporary routes' },
  { code: 'JAI', name: 'Jaipur', idea: 'Shadows look solid; the real ledges follow another pattern' },
  { code: 'CCU', name: 'Kolkata', idea: 'A tram flips switches that change the route' },
  { code: 'COK', name: 'Kochi', idea: 'Counterweights raise one platform while lowering another' },
  { code: 'DEL', name: 'Delhi', idea: 'A route board rearranges the platforms' },
];
