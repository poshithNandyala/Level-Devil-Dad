// Inventory: which keys of the shared keyed tables each old city owns.  node inv.mjs CODE  (from the worktree)
// A key is the city's when its string literal is used in the city's own files and in no other game file
// (definition sites of the tables themselves do not count: property keys, case labels, union members).
import { parseAst } from '/local/home/saiposh/personal/ldd-wt/migrate/node_modules/rolldown/dist/parse-ast-index.mjs';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const code = process.argv[2];
const ls = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? ls(join(d, f)) : f.endsWith('.ts') ? [join(d, f)] : []));
const files = ls('src');
const lits = new Map(); // file -> Set of string literal values (not keys/labels/types)
const parsed = new Map();
const pos = new Map(); // file -> [value, offset]
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const ast = parseAst(src, { lang: 'ts' });
  parsed.set(f, { src, ast });
  const s = new Set();
  const walk = (n, parent, pk) => {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) { for (const c of n) walk(c, parent, pk); return; }
    if (n.type === 'Literal' && typeof n.value === 'string') {
      const isKey = parent && parent.type === 'Property' && pk === 'key';
      const isCase = parent && parent.type === 'SwitchCase' && pk === 'test';
      const isType = parent && parent.type === 'TSLiteralType';
      const isImport = parent && /Import|Export/.test(parent.type);
      if (!isKey && !isCase && !isType && !isImport) { s.add(n.value); (pos.get(f) ?? pos.set(f, []).get(f)).push([n.value, n.start]); }
    }
    if (n.type === 'TemplateLiteral') for (const q of n.quasis) if (n.expressions.length === 0) s.add(q.value.cooked);
    for (const k of Object.keys(n)) if (n[k] && typeof n[k] === 'object') walk(n[k], n, k);
  };
  walk(ast, null, null);
  lits.set(f, s);
}

// table keys
const keysOf = (file, pred) => {
  const { ast } = parsed.get(file);
  const out = [];
  const walk = (n) => {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) return n.forEach(walk);
    const r = pred(n);
    if (r) out.push(...r);
    for (const k of Object.keys(n)) if (n[k] && typeof n[k] === 'object') walk(n[k]);
  };
  walk(ast);
  return out;
};
const objKeys = (file, name) => keysOf(file, (n) => {
  if (n.type !== 'VariableDeclarator' || n.id?.name !== name) return null;
  let i = n.init;
  while (i && i.type !== 'ObjectExpression') i = i.expression;
  return i.properties.map((p) => (p.key.type === 'Identifier' ? p.key.name : p.key.value));
});
const tables = {
  cause: objKeys('src/game/entities/props.ts', 'CAUSE_LINES'),
  ending: [...objKeys('src/game/levels/endings.ts', 'OLD_ENDINGS'), ...objKeys('src/game/levels/endings2.ts', 'NEW_ENDINGS'), ...objKeys('src/game/levels/endings3.ts', 'WEST_ENDINGS')],
  thing: objKeys('src/render/art/things.ts', 'SIZE'),
};
// city files: its level file plus the entity files only it imports (endings files do not count as users)
const own = [`src/game/levels/${code.toLowerCase()}.ts`];
const imports = (f) => [...parsed.get(f).src.matchAll(/from '(\.[^']+)'/g)].map((m) => join(f, '..', m[1]) + '.ts');
for (const f of files.filter((f) => f.startsWith('src/game/entities/'))) {
  const users = files.filter((g) => g !== f && imports(g).includes(f) && !/levels\/endings\d?\.ts$/.test(g));
  if (users.length === 1 && users[0] === own[0]) own.push(f);
}
const res = { own };
// a literal inside an ending's own entry (e.g. jali's Sunbeam window: 'jali') is not a use by someone else
const entryRange = new Map();
for (const f of ['src/game/levels/endings.ts', 'src/game/levels/endings2.ts', 'src/game/levels/endings3.ts']) {
  const walk = (n) => {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) return n.forEach(walk);
    if (n.type === 'VariableDeclarator' && /ENDINGS$/.test(n.id?.name ?? '')) {
      let i = n.init;
      while (i && i.type !== 'ObjectExpression') i = i.expression;
      if (i) for (const p of i.properties) if (p.key) entryRange.set((p.key.name ?? p.key.value), [f, p.start, p.end]);
      return;
    }
    for (const k of Object.keys(n)) if (n[k] && typeof n[k] === 'object') walk(n[k]);
  };
  walk(parsed.get(f).ast);
}
const usedOutside = (k, f) => {
  if (!lits.get(f).has(k)) return false;
  const r = entryRange.get(k);
  if (!r || r[0] !== f) return true;
  return (pos.get(f) ?? []).some(([v, at]) => v === k && (at < r[1] || at > r[2]));
};
for (const [t, keys] of Object.entries(tables)) {
  res[t] = keys.filter((k) => own.some((f) => lits.get(f).has(k)) && files.every((f) => own.includes(f) || !(t === 'ending' ? usedOutside(k, f) : lits.get(f).has(k))));
  res[t + 'Shared'] = keys.filter((k) => own.some((f) => lits.get(f).has(k)) && !res[t].includes(k)).map((k) => k + '<' + files.filter((f) => !own.includes(f) && lits.get(f).has(k)).map((f) => f.replace(/^src\//, '')).join(','));
}
console.log(JSON.stringify(res, null, 1));
