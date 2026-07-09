// Pour chaque fn MANQUANT de pokemon.c : est-elle APPELEE dans notre src/ (= vrai trou reachable) ?
const fs = require('fs');
const path = require('path');
const ROOT = 'D:/Projet 1/pokemon-web-demo';

const rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit-reports/pokemon-c-audit.json'), 'utf8'));
const missing = rows.filter(r => r.status === 'MANQUANT').map(r => r.name);

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.ts')) acc.push(p);
  }
  return acc;
}
const tsFiles = walk(path.join(ROOT, 'src'), []);
const contents = tsFiles.map(f => ({
  f: path.relative(ROOT, f).split(path.sep).join('/'),
  t: fs.readFileSync(f, 'utf8'),
}));

const called = [];
for (const name of missing) {
  // call site = `name(` not preceded by `function `/`.`/def. Approx: word-boundary + '('.
  const re = new RegExp('(^|[^.\\w])' + name + '\\s*\\(');
  const callers = [];
  for (const { f, t } of contents) {
    if (re.test(t)) callers.push(f);
  }
  if (callers.length) called.push({ name, count: callers.length, files: [...new Set(callers)] });
}
called.sort((a, b) => b.count - a.count);
console.log('=== MANQUANT mais APPELE dans src/ (vrais trous reachable) : ' + called.length + ' ===\n');
for (const c of called) {
  console.log(c.name + '  (' + c.count + ' fichiers)  ->  ' + c.files.slice(0, 4).join(', ') + (c.files.length > 4 ? ' ...' : ''));
}
