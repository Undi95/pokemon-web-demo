// Audit COUVERTURE 1:1 overworld script VM. Clé = MNÉMONIQUE script
// (= ce que les scripts décomp émettent réellement et ce que notre
// interpréteur doit savoir dispatcher), pas le nom de fonction ScrCmd_*
// (≠ mnémonique, ex. macro `addmoney` ↔ ScrCmd_addmoney mais nous
// l'avions registré `givemoney`).
//
// Source 1:1 : `asm/macros/event.inc` (.macro <nom> … .byte SCR_OP_X)
// → mnémonique → SCR_OP. Croisé `data/script_cmd_table.inc`
// (SCR_OP → ScrCmd_* @ 0xNN). Confronté à `src/engine/script-opcodes.ts`
// (registerOpcode('<nom>')). Rapport couvert / manquant / stub. Read-only.
// = analogue de l'audit 249 opcodes combat. Sans clé naïve (cf. combat).
import { readFileSync } from 'node:fs';

const DEC = 'D:/Projet 1/decomps/pokeemeraude';
const P = 'D:/Projet 1/pokemon-web-demo';
const EVENT = `${DEC}/asm/macros/event.inc`;
const INC = `${DEC}/data/script_cmd_table.inc`;
const SCRCMD = `${DEC}/src/scrcmd.c`;
const OURS = `${P}/src/engine/script-opcodes.ts`;

// 1) event.inc : chaque `.macro <nom> …` jusqu'à `.endm` ; on retient le
//    1er `.byte SCR_OP_X` du corps = l'opcode émis. Macro SANS .byte
//    SCR_OP (= pseudo/compound, ex. goto_if) → ignorée (pas un opcode VM).
const ev = readFileSync(EVENT, 'utf8');
const macros = [];
{
  const re = /^\s*\.macro\s+(\w+)\b([\s\S]*?)\.endm/gm;
  let m;
  while ((m = re.exec(ev)) !== null) {
    const name = m[1];
    const body = m[2];
    const op = body.match(/\.byte\s+(SCR_OP_\w+)/);
    if (op) macros.push({ mnemonic: name, scrOp: op[1] });
  }
}

// 2bis) scrcmd.c : ScrCmd_* dont le corps Émeraude est trivial (= `return
// TRUE/FALSE;` seul, ex. ScrCmd_nop/nop1). Ces opcodes NE FONT RIEN en
// Émeraude (= macros FRLG/inutilisées stubées nop). Un mnémonique mappant
// vers eux n'a PAS besoin d'un handler 1:1 (l'absence = équivalent nop).
const emeraldNopFuncs = new Set();
{
  const scr = readFileSync(SCRCMD, 'utf8');
  for (const m of scr.matchAll(/^bool8\s+(ScrCmd_\w+)\s*\(struct ScriptContext \*ctx\)\s*\{([\s\S]*?)\n\}/gm)) {
    if (/^\s*return\s+(TRUE|FALSE);\s*$/.test(m[2].trim())) emeraldNopFuncs.add(m[1]);
  }
  emeraldNopFuncs.add('ScrCmd_nop'); emeraldNopFuncs.add('ScrCmd_nop1');
}

// 2) script_cmd_table.inc : SCR_OP → ScrCmd_* @ 0xNN (pour index + tri).
const inc = readFileSync(INC, 'utf8');
const byScrOp = {};
for (const m of inc.matchAll(/script_cmd_table_entry\s+(SCR_OP_\S+)\s+(ScrCmd_\w+)\s*@\s*(0x[0-9a-fA-F]+)/g)) {
  byScrOp[m[1]] = { func: m[2], op: m[3] };
}

// 3) Nous : TOUS les registerOpcode('<nom>' (capture ROBUSTE du nom seul
//    — un parse du corps casse sur multi-ligne/accolades imbriquées et
//    sous-compte = faux "manquant", cf. leçon outil-naïf combat).
const src = readFileSync(OURS, 'utf8');
const reg = new Set([...src.matchAll(/registerOpcode\('([^']+)'/g)].map(m => m[1]));
// STUB CONFIRMÉ uniquement = marqueur EXPLICITE (STUB/TODO/unimplemented/
// FIXME/placeholder) dans la fenêtre handler. IMPORTANT : `return false`
// seul N'EST PAS un signe de stub — c'est la convention décomp
// `return FALSE;` (= avance à l'opcode suivant ; ScrCmd_nop fait pareil).
// Distinguer un vrai stub d'un port 1:1 trivial exige un diff du corps
// vs le ScrCmd_* décomp (hors scope d'un guard statique) → on ne
// sur-affirme PAS. Seul MANQUANT (aucun handler) est 100% fiable.
const stub = new Set();
for (const m of src.matchAll(/registerOpcode\('([^']+)',/g)) {
  const nm = m[1];
  const head = src.slice(m.index, m.index + 220);
  if (/\b(STUB|TODO|unimplemented|not impl|FIXME|placeholder|gift mon)\b/i.test(head)) {
    stub.add(nm);
  }
}

// Confrontation : pour chaque mnémonique décomp, est-il dispatché 1:1 ?
// emeraldNop = le mnémo mappe vers un ScrCmd_ trivial EN ÉMERAUDE (FRLG/
// inutilisé) → PAS un vrai gap : Émeraude lui-même ne fait rien, donc
// l'absence de handler ≡ comportement 1:1 (no-op). Exclu du MANQUANT.
const seen = new Set();
const covered = [], missing = [], stubbed = [], emeraldNop = [];
for (const { mnemonic, scrOp } of macros) {
  if (seen.has(mnemonic)) continue;
  seen.add(mnemonic);
  const ent = byScrOp[scrOp];
  const isEmNop = !ent || emeraldNopFuncs.has(ent.func);
  if (reg.has(mnemonic)) {
    if (stub.has(mnemonic)) stubbed.push(mnemonic);
    else covered.push(mnemonic);
  } else if (isEmNop) {
    emeraldNop.push({ mnemonic, op: ent?.op, func: ent?.func || '<no-table>' });
  } else {
    missing.push({ mnemonic, scrOp, op: ent?.op, func: ent?.func });
  }
}

const realTotal = covered.length + missing.length + stubbed.length;
const grandTotal = realTotal + emeraldNop.length;
const hasHandler = covered.length + stubbed.length;
console.log(`[audit scrcmd] mnémoniques script décomp(event.inc → SCR_OP)=${grandTotal}`);
console.log(`  · dont OPCODES ÉMERAUDE RÉELS : ${realTotal} | nop-Émeraude(FRLG/inutilisé, no-op 1:1) : ${emeraldNop.length}`);
console.log(`  COUVERT 1:1          : ${covered.length}/${realTotal} (= ${(100 * hasHandler / realTotal).toFixed(1)}% handler présent)`);
console.log(`  · dont stub CONFIRMÉ : ${stubbed.length} (marqueur TODO/STUB) → ${stubbed.sort().join(', ')}`);
console.log(`  MANQUANT (vrai gap)  : ${missing.length}  ← métrique fiable (vrais ScrCmd_ Émeraude non triviaux)`);
console.log(`    ${missing.map(x => `${x.mnemonic}(${x.op || '?'})`).sort().join(', ') || '—'}`);
console.log(`  nop-Émeraude exclus  : ${emeraldNop.map(x => x.mnemonic).sort().join(', ')}`);
console.log(`\nNote : "return false" = convention décomp return FALSE (≠ stub).`);
console.log(`${missing.length === 0 && stubbed.length === 0
  ? '✓ scrcmd : 0 vrai manquant, 0 stub confirmé (gap Overworld = clos).'
  : `⚠ scrcmd : gap portage Overworld = ${missing.length} vrai(s) manquant(s) + ${stubbed.length} stub confirmé.`}`);
