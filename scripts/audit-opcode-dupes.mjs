import { readFileSync } from 'fs';
const src = readFileSync('src/engine/script-opcodes.ts', 'utf8');
// Strip line comments to avoid matching `// ... registerOpcode('x', ...)` in docs.
const lines = src.split('\n').map(l => {
  const cmtIdx = l.indexOf('//');
  return cmtIdx >= 0 ? l.slice(0, cmtIdx) : l;
});
const re = /registerOpcode\(['"]([^'"]+)['"]/g;
const seen = new Map();
for (let i = 0; i < lines.length; i++) {
  let m;
  while ((m = re.exec(lines[i]))) {
    if (!seen.has(m[1])) seen.set(m[1], []);
    seen.get(m[1]).push(i + 1);
  }
}
const dups = [...seen.entries()].filter(([_k, v]) => v.length > 1);
console.log('Duplicate registerOpcode names (= 2nd register WINS = OVERWRITES first):');
for (const [name, lines] of dups) console.log(`  ${name} : lines ${lines.join(', ')}`);
console.log();
console.log('Total unique opcodes:', seen.size);
console.log('Total registers:', [...seen.values()].reduce((a, v) => a + v.length, 0));
