// AST helpers for the city migration (oxc via rolldown/parseAst). Run from the worktree.
//   node mig.mjs props FILE OBJ KEY...   cut properties out of an object literal; JSON {key: text} on stdout
//   node mig.mjs cases FILE FUNC KEY...  cut switch cases out of FUNC; JSON {key: bodyText} (break -> return)
//   node mig.mjs union FILE TYPE KEY...  drop string members from a union type alias
//   node mig.mjs decls FILE              top-level declared names (JSON list)
//   node mig.mjs uses FILE NAME...       which of NAMES are referenced as identifiers in FILE (JSON list)
import { parseAst } from '/local/home/saiposh/personal/ldd-wt/migrate/node_modules/rolldown/dist/parse-ast-index.mjs';
import { readFileSync, writeFileSync } from 'fs';

const [, , cmd, file, ...rest] = process.argv;
const src = readFileSync(file, 'utf8');
const ast = parseAst(src, { lang: 'ts' });

function walk(n, f, parent) {
  if (!n || typeof n !== 'object') return;
  if (Array.isArray(n)) { for (const c of n) walk(c, f, parent); return; }
  if (typeof n.type === 'string') { if (f(n, parent) === false) return; }
  for (const k of Object.keys(n)) if (k !== 'parent' && n[k] && typeof n[k] === 'object') walk(n[k], f, n);
}
const keyName = (p) => (p.key?.type === 'Identifier' ? p.key.name : p.key?.value);

/** extend [s, e) to whole lines, with directly preceding comment lines */
function lineSpan(s, e) {
  let a = src.lastIndexOf('\n', s - 1) + 1;
  while (a > 0) {
    const pa = src.lastIndexOf('\n', a - 2) + 1;
    const line = src.slice(pa, a - 1).trim();
    if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) a = pa; else break;
  }
  let b = e;
  if (src[b] === ',') b++;
  const nl = src.indexOf('\n', b);
  const tail = src.slice(b, nl < 0 ? src.length : nl);
  if (tail.trim() === '' || tail.trim().startsWith('//')) b = nl < 0 ? src.length : nl + 1;
  return [a, b];
}

function cut(spans) {
  spans.sort((x, y) => y[0] - x[0]);
  let out = src;
  for (const [a, b] of spans) out = out.slice(0, a) + out.slice(b);
  writeFileSync(file, out);
}

function findObj(name) {
  let obj = null;
  walk(ast, (n) => {
    if (n.type === 'VariableDeclarator' && n.id?.name === name) {
      let i = n.init;
      while (i && (i.type === 'TSAsExpression' || i.type === 'TSSatisfiesExpression' || i.type === 'ParenthesizedExpression')) i = i.expression;
      obj = i;
      return false;
    }
  });
  if (!obj || obj.type !== 'ObjectExpression') throw new Error(`no object literal ${name} in ${file}`);
  return obj;
}

if (cmd === 'props') {
  const [obj, ...keys] = rest;
  const o = findObj(obj);
  const res = {}, spans = [];
  for (const p of o.properties) {
    const k = keyName(p);
    if (!keys.includes(k)) continue;
    const sp = lineSpan(p.start, p.end);
    // whole lines with their comments when the entry sits on its own lines, else just the entry
    res[k] = { text: src.slice(p.start, p.end), lines: src.slice(sp[0], sp[1]) };
    spans.push(sp);
  }
  for (const k of keys) if (!(k in res)) throw new Error(`${obj}.${k} not found in ${file}`);
  cut(spans);
  console.log(JSON.stringify(res));
} else if (cmd === 'cases') {
  const [fn, ...keys] = rest;
  let sw = null;
  walk(ast, (n) => {
    if (n.type === 'FunctionDeclaration' && n.id?.name === fn) {
      walk(n.body, (m) => { if (!sw && m.type === 'SwitchStatement') { sw = m; return false; } });
      return false;
    }
  });
  if (!sw) throw new Error(`no switch in ${fn}`);
  const res = {}, spans = [];
  const cs = sw.cases;
  for (let i = 0; i < cs.length; i++) {
    if (!cs[i].test || cs[i].test.type !== 'Literal' || !keys.includes(cs[i].test.value)) continue;
    // a grouped label (case 'a': case 'b': {...}) must move whole
    let j = i;
    while (cs[j].consequent.length === 0) j++;
    const group = cs.slice(i, j + 1).map((c) => c.test?.value);
    let g0 = i;
    while (g0 > 0 && cs[g0 - 1].consequent.length === 0) g0--;
    const full = cs.slice(g0, j + 1).map((c) => c.test?.value);
    if (full.some((k) => !keys.includes(k))) throw new Error(`case group ${full} only partly moved`);
    if (i !== g0) continue;
    // body: statements of cs[j]; breaks that belong to the switch become returns
    const body = cs[j].consequent;
    const bs = body[0].start, be = body[body.length - 1].end;
    const reps = [];
    const visit = (n, inLoop) => {
      if (!n || typeof n !== 'object') return;
      if (Array.isArray(n)) { for (const c of n) visit(c, inLoop); return; }
      if (n.type === 'BreakStatement' && !n.label && !inLoop) reps.push([n.start, n.end]);
      const loop = inLoop || /^(For|ForIn|ForOf|While|DoWhile)Statement$|^SwitchStatement$/.test(n.type) || /Function/.test(n.type ?? '');
      for (const k of Object.keys(n)) if (n[k] && typeof n[k] === 'object') visit(n[k], loop);
    };
    visit(body, false);
    let text = src.slice(bs, be);
    reps.sort((x, y) => y[0] - x[0]);
    for (const [a, b] of reps) text = text.slice(0, a - bs) + 'return;' + text.slice(b - bs);
    for (const k of full) res[k] = { text, group: full };
    spans.push(lineSpan(cs[g0].start, cs[j].end));
  }
  for (const k of keys) if (!(k in res)) throw new Error(`case ${k} not found in ${fn}`);
  cut(spans);
  console.log(JSON.stringify(res));
} else if (cmd === 'union') {
  const [ty, ...keys] = rest;
  let t = null;
  walk(ast, (n) => { if (n.type === 'TSTypeAliasDeclaration' && n.id.name === ty) { t = n.typeAnnotation; return false; } });
  if (!t || t.type !== 'TSUnionType') throw new Error(`no union ${ty}`);
  const spans = [];
  const found = new Set();
  for (const m of t.types) {
    const v = m.type === 'TSLiteralType' ? m.literal.value : null;
    if (!keys.includes(v)) continue;
    found.add(v);
    // remove "| 'v'" (the bar before it, or after it for the first member)
    let a = m.start, b = m.end;
    const before = src.slice(0, a).match(/\|\s*$/);
    if (before) a -= before[0].length; else { const after = src.slice(b).match(/^\s*\|/); if (after) b += after[0].length; }
    // whole line when it is alone on its line
    const ls = src.lastIndexOf('\n', a - 1) + 1, le = src.indexOf('\n', b);
    if (src.slice(ls, a).trim() === '' && src.slice(b, le).trim() === '') { a = ls; b = le + 1; }
    spans.push([a, b]);
  }
  for (const k of keys) if (!found.has(k)) throw new Error(`${ty} has no '${k}'`);
  if (found.size === t.types.length) spans.splice(0, spans.length, [t.start, t.end]);  // all gone: never
  spans.sort((x, y) => y[0] - x[0]);
  let out = src;
  for (const [a, b] of spans) out = out.slice(0, a) + (found.size === t.types.length ? 'never' : '') + out.slice(b);
  writeFileSync(file, out);
  process.exit(0);
} else if (cmd === 'decls') {
  const names = [];
  for (const s of ast.body) {
    const d = s.type === 'ExportNamedDeclaration' ? s.declaration : s;
    if (!d) continue;
    if (d.type === 'VariableDeclaration') for (const v of d.declarations) { if (v.id.name) names.push(v.id.name); }
    else if (d.id?.name) names.push(d.id.name);
    if (s.type === 'ImportDeclaration') for (const sp of s.specifiers) names.push(sp.local.name);
  }
  console.log(JSON.stringify(names));
} else if (cmd === 'decl') {
  // cut top-level declarations by name (with their comments): JSON {name: text}
  const res = {}, spans = [];
  for (const s of ast.body) {
    const d = s.type === 'ExportNamedDeclaration' ? s.declaration : s;
    const nm = d?.type === 'VariableDeclaration' ? d.declarations[0].id.name : d?.id?.name;
    if (!rest.includes(nm)) continue;
    const sp = lineSpan(s.start, s.end);
    res[nm] = src.slice(sp[0], sp[1]);
    spans.push(sp);
  }
  for (const k of rest) if (!(k in res)) throw new Error(`no top-level ${k} in ${file}`);
  cut(spans);
  console.log(JSON.stringify(res));
} else if (cmd === 'branches') {
  // the `if (city === ...)` branches at the top of FUNC's body (else-if chains and plain ifs): JSON list
  const [fn] = rest;
  let body = null;
  walk(ast, (n) => { if (n.type === 'FunctionDeclaration' && n.id?.name === fn) { body = n.body; return false; } });
  const out = [];
  for (const s of body.body) {
    let n = s;
    while (n && n.type === 'IfStatement') {
      const test = src.slice(n.test.start, n.test.end);
      if (/city ===/.test(test)) out.push({ test, body: src.slice(n.consequent.start + 1, n.consequent.end - 1), stmt: [s.start, s.end], start: n.start, end: n.consequent.end, alt: !!n.alternate });
      n = n.alternate;
    }
  }
  console.log(JSON.stringify(out));
} else if (cmd === 'imports') {
  // [{local, imported, from, type}] plus top-level decls [{local, exported, kind}]
  const imps = [], decls = [];
  for (const s of ast.body) {
    if (s.type === 'ImportDeclaration') {
      for (const sp of s.specifiers) imps.push({ local: sp.local.name, imported: sp.imported?.name ?? (sp.type === 'ImportDefaultSpecifier' ? 'default' : '*'), from: s.source.value, type: s.importKind === 'type' || sp.importKind === 'type' });
      continue;
    }
    const exported = s.type === 'ExportNamedDeclaration';
    const d = exported ? s.declaration : s;
    if (!d) continue;
    const kind = /TSTypeAlias|TSInterface/.test(d.type) ? 'type' : 'value';
    if (d.type === 'VariableDeclaration') for (const v of d.declarations) { if (v.id.name) decls.push({ local: v.id.name, exported, kind, start: s.start }); }
    else if (d.id?.name) decls.push({ local: d.id.name, exported, kind, start: s.start });
  }
  console.log(JSON.stringify({ imps, decls }));
} else if (cmd === 'uses') {
  const want = new Set(rest), got = new Set();
  walk(ast, (n) => { if ((n.type === 'Identifier' || n.type === 'JSXIdentifier') && want.has(n.name)) got.add(n.name); });
  console.log(JSON.stringify([...got]));
} else throw new Error('unknown command ' + cmd);
