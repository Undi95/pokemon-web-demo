import { readFileSync } from 'fs';
const src = readFileSync('src/engine/specials-registry.ts', 'utf8');
const re = /registerSpecial\(['"]([^'"]+)['"]/g;
const seen = new Map();
let m;
while ((m = re.exec(src))) {
  seen.set(m[1], (seen.get(m[1]) || 0) + 1);
}
const dups = [...seen.entries()].filter(([_k, v]) => v > 1);
console.log('Duplicates:', dups);
console.log('Total:', seen.size);
