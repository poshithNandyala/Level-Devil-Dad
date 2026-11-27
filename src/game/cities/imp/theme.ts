import type { Theme } from '../../../render/theme';

// Imphal's palette (docs/cities/IMP.md section 6): pale gold-green sky, blue-grey hills, reed-brown tiles, lotus pink.
export const theme: Theme = {
  city: 'IMP',
  name: 'Imphal',
  local: 'ইম্ফাল',
  sky: ['#8FB8B0', '#CFE3D3', '#F2E6C4'],
  sun: '#FFF2C8',
  far: '#4F6D7A',
  mid: '#5E7F6A',
  near: '#3F5E44',
  accent: '#D86C8A',
  accent2: '#E8C860',
  tileBase: '#8A7A4F',
  tileTop: '#A8955F',
  tileEdge: '#5E5236',
  tileDark: '#3E3524',
  topper: '#7F9A3B',
  pattern: 'brick',
  spike: '#F4EFDC',
  spikeEdge: '#3E3524',
  ink: '#2E2A1E',
  rim: null,
  ui: '#D86C8A',
};
