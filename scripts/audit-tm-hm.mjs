// Audit 1:1 : mapping TM/HM → move (gameplay-critique : quel TM/HM
// enseigne quel move). Confronte décomp include/constants/tms_hms.h
// (FOREACH_TM(F)= F(MOVE) ordonné → TM01.. ; FOREACH_HM → HM01..) à
// public/decomp/em/tm-hm.json (.moves {TMxx/HMxx:MOVE_x}). Parser
// INDÉPENDANT, diff ordonné. Mirror méthodo audit-movement /
// audit-pokemon-anims.
import { readFileSync } from 'node:fs';

const DEC = 'D:/Projet 1/decomps/pokeemeraude';
const P = 'D:/Projet 1/pokemon-web-demo';
const TH = `${DEC}/include/constants/tms_hms.h`;
const JSON_F = `${P}/public/decomp/em/tm-hm.json`;

const src = readFileSync(TH, 'utf8');

// Corps d'une macro FOREACH_X(F) \ ... (continuations backslash).
function macroBody(name) {
  const i = src.indexOf(`#define ${name}(F)`);
  if (i < 0) return '';
  let end = i;
  // Avance ligne par ligne tant que la ligne finit par '\'.
  const lines = src.slice(i).split(/\r?\n/);
  const body = [];
  for (let k = 0; k < lines.length; k++) {
    body.push(lines[k]);
    if (k > 0 && !lines[k].trimEnd().endsWith('\\')) break;
  }
  void end;
  return body.join('\n');
}
const tmBody = macroBody('FOREACH_TM');
const hmBody = macroBody('FOREACH_HM');

// F(MOVENAME) dans l'ordre → liste.
const tmMoves = [...tmBody.matchAll(/\bF\(\s*([A-Z0-9_]+)\s*\)/g)].map(m => m[1]);
const hmMoves = [...hmBody.matchAll(/\bF\(\s*([A-Z0-9_]+)\s*\)/g)].map(m => m[1]);

// Décomp : SÉQUENCE ORDONNÉE des 58 moves (TM01..TM50 puis HM01..HM08).
// Le sTMHMMoves[] décomp = un seul tableau plat indexé 0..57 ; les
// ITEM_TM01..ITEM_HM08 sont contigus. La convention de CLÉ (HM01 vs
// flat TM51) varie selon l'extracteur → on confronte la SÉQUENCE de
// moves (= la vraie donnée 1:1), pas les noms de clé (leçon outil-naïf
// 15ᵉ : "8 mismatch" = juste HM01≠TM51, données identiques).
const decSeq = [...tmMoves, ...hmMoves].map(mv => `MOVE_${mv}`);

const j = JSON.parse(readFileSync(JSON_F, 'utf8'));
const jMoves = j.moves || j;
// Notre JSON sur-clé les HM (à la fois flat TMxx ET HMxx = dual-keying
// pratique consumer, PAS une divergence 1:1). On extrait la SÉQUENCE
// CANONIQUE 58 : TM01..TM<nTM> par clé TMxx, puis HM01..HM<nHM> par
// clé HMxx si présentes sinon fallback flat TM<nTM+i>. = confronte la
// vraie donnée 1:1, robuste à la convention de clé (leçon outil-naïf).
const nTM = tmMoves.length, nHM = hmMoves.length;
const jSeq = [];
for (let i = 1; i <= nTM; i++) jSeq.push(jMoves[`TM${String(i).padStart(2, '0')}`] ?? jMoves[`TM${i}`]);
for (let i = 1; i <= nHM; i++) {
  jSeq.push(
    jMoves[`HM${String(i).padStart(2, '0')}`] ?? jMoves[`HM${i}`]
    ?? jMoves[`TM${String(nTM + i).padStart(2, '0')}`] ?? jMoves[`TM${nTM + i}`],
  );
}

let mis = 0;
const n = Math.max(decSeq.length, jSeq.length);
for (let i = 0; i < n; i++) {
  if (decSeq[i] !== jSeq[i]) {
    mis++;
    if (mis <= 15) console.error(`  index ${i} (${i < 50 ? 'TM' + (i + 1) : 'HM' + (i - 49)}) : décomp=${decSeq[i] ?? '∅'} json=${jSeq[i] ?? '∅'}`);
  }
}

console.log(`[audit tm-hm] décomp séquence=${decSeq.length} (TM=${tmMoves.length}+HM=${hmMoves.length}) | json séquence=${jSeq.length}`);
console.log(`  mismatches (séquence ordonnée, clé-indépendant) : ${mis}`);
const ok = mis === 0 && decSeq.length === jSeq.length && tmMoves.length >= 50 && hmMoves.length >= 8;
console.log(`\n${ok
  ? `✓ tm-hm : ${decSeq.length} TM/HM→move 1:1 décomp (séquence ${tmMoves.length} TM + ${hmMoves.length} HM, ordre plat sTMHMMoves[]).`
  : `✗ tm-hm : ${mis} mismatch séquence — mapping TM/HM PAS 1:1 décomp.`}`);
process.exit(ok ? 0 : 1);
