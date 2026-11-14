type Child = Node | string | number | null | undefined | false;
type Attrs = Record<string, any>;

/** Tiny DOM builder: h('button.btn.big', { onclick }, 'Play') */
export function h(sel: string, attrs: Attrs | Child = {}, ...kids: Child[]): HTMLElement {
  let a: Attrs = {};
  if (attrs instanceof Node || typeof attrs !== 'object' || attrs === null) kids.unshift(attrs as Child);
  else a = attrs;
  const [tag, ...classes] = sel.split('.');
  const el = document.createElement(tag || 'div');
  if (classes.length) el.className = classes.join(' ');
  for (const [k, v] of Object.entries(a)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className += ' ' + v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'html') el.innerHTML = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, String(v));
  }
  for (const c of kids) {
    if (c === null || c === undefined || c === false) continue;
    el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export function toast(root: HTMLElement, text: string) {
  const t = h('div.toast', text);
  root.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

export function fmtTime(s: number | null | undefined): string {
  if (s === null || s === undefined) return '—';
  return s < 60 ? `${s.toFixed(1)}s` : `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
}
