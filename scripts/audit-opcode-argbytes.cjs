#!/usr/bin/env node
/* Audit : chaque handler ScrCmd_* consomme-t-il EXACTEMENT le nombre d'octets
 * d'argument que le compilo a émis (cmd-table totalBytes) ? Un écart = scriptPtr
 * désaligné au runtime (= bug playfanfare). Détecte aussi les ScriptRead* dans un
 * contexte optional-chaining `?.(...)` (court-circuitables → arg non lu).
 * READ-ONLY. Heuristique : vérif manuelle des flags (handlers à args variables OK). */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const tbl = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/decomp/em/script-cmd-table.json'), 'utf8'));
// handler name → totalBytes attendu (gère les variantes)
const expected = {};
for (const v of Object.values(tbl.opcodes)) {
  if (v.handler && typeof v.totalBytes === 'number') expected[v.handler] = v.totalBytes;
  if (v.variants) for (const vv of v.variants) if (vv.handler) expected[vv.handler] = vv.totalBytes;
}

const src = fs.readFileSync(path.join(ROOT, 'src/scrcmd.ts'), 'utf8');

// Extrait le corps {…} de chaque handler par brace-matching depuis `=> {`.
function bodies(code) {
  const out = {};
  const re = /const (ScrCmd_[A-Za-z0-9_]+)\s*:\s*ScrCmdFunc\s*=\s*\([^)]*\)\s*=>\s*/g;
  let m;
  while ((m = re.exec(code))) {
    const name = m[1];
    let i = re.lastIndex;
    // corps avec accolades ?
    if (code[i] === '{') {
      let depth = 0, start = i;
      for (; i < code.length; i++) { if (code[i] === '{') depth++; else if (code[i] === '}') { if (--depth === 0) { i++; break; } } }
      out[name] = code.slice(start, i);
    } else {
      // corps expression : jusqu'au `;` top-level
      let start = i;
      for (; i < code.length; i++) { if (code[i] === ';') break; }
      out[name] = code.slice(start, i);
    }
  }
  return out;
}

function countBytes(body) {
  const b = (body.match(/ScriptReadByte\s*\(/g) || []).length * 1;
  const h = (body.match(/ScriptReadHalfword\s*\(/g) || []).length * 2;
  const w = (body.match(/ScriptReadWord\s*\(/g) || []).length * 4;
  return b + h + w;
}
// ScriptRead dans un optional-chaining `?.(` … (= court-circuitable)
function hasShortCircuitRead(body) {
  // motif : `?.(` … ScriptRead … `)` sur la même expression ; approx : `?.\([^;]*ScriptRead`
  return /\?\.[A-Za-z0-9_]*\??\.?\([^;{}]*ScriptRead/.test(body) || /\?\.\([^;{}]*ScriptRead/.test(body);
}

const hb = bodies(src);
const mism = [], shortCirc = [], noExpected = [], ok = [];
for (const [name, body] of Object.entries(hb)) {
  const got = countBytes(body);
  if (hasShortCircuitRead(body)) shortCirc.push({ name, body: body.replace(/\s+/g, ' ').slice(0, 120) });
  if (!(name in expected)) { noExpected.push(name); continue; }
  if (got !== expected[name]) mism.push({ name, got, exp: expected[name], body: body.replace(/\s+/g, ' ').slice(0, 140) });
  else ok.push(name);
}

const out = [];
out.push(`Handlers analysés : ${Object.keys(hb).length} | OK : ${ok.length} | MISMATCH : ${mism.length} | short-circuit ScriptRead : ${shortCirc.length} | sans totalBytes table : ${noExpected.length}`);
out.push('');
out.push('=== ❌ MISMATCH octets lus ≠ cmd-table (= désalignement potentiel) ===');
for (const x of mism) out.push(`  ${x.name}: lu ${x.got} ≠ table ${x.exp}\n      ${x.body}`);
out.push('');
out.push('=== ⚠️ ScriptRead dans optional-chaining (court-circuitable = bug playfanfare) ===');
for (const x of shortCirc) out.push(`  ${x.name}\n      ${x.body}`);
out.push('');
out.push(`=== (handlers sans totalBytes dans la table, à ignorer ou vérifier : ${noExpected.length}) ===`);
out.push('  ' + noExpected.join(', '));
fs.writeFileSync(path.join(ROOT, 'audit-reports/opcode-argbytes.txt'), out.join('\n'));
console.log(out.slice(0, 2).join('\n'));
console.log('→ audit-reports/opcode-argbytes.txt');
