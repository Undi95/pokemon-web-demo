/**
 * probe-ppbonus-1to1.mjs — ORACLE RUNTIME de CalculatePPWithBonus (PP max avec PP-Plus).
 *
 * 1:1 décomp `CalculatePPWithBonus(move, ppBonuses, moveIndex)` (pokemon.c:4637) :
 *   `basePP + ((basePP * 20 * ppUps) / 100)` (u8), où
 *   `ppUps = (gPPUpGetMask[moveIndex] & ppBonuses) >> (2*moveIndex)` (0..3 = +0/20/40/60 %).
 * `gPPUpGetMask = {PP_UP_SHIFTS(3)} = [3<<0, 3<<2, 3<<4, 3<<6]`. Fonction PURE exportée (pas de
 * ctx/party). On RECODE la formule + le masque depuis la décomp (mask = 3<<(2*i), indépendant de
 * l'array du port = non-circulaire ; basePP lu depuis les données de move, auditées par ailleurs)
 * et on confronte la sortie LIVE. Couvre 4 moves (basePP variés) × moveIndex 0..3 × ppUps 0..3 +
 * un cas multi-slot (vérifie que le masque isole le bon slot). Self-import party-storage + battle-moves.
 */
'use strict';

export async function runPpBonusOracle(deps) {
  const ps = await import('/src/engine/battle/party-storage.ts');
  const bm = await import('/src/engine/battle/data/battle-moves.ts');
  const dc = (deps && deps.dc) || await import('/harness/runtime/decomp-constants.ts');
  if (bm.loadBattleMoves) await bm.loadBattleMoves();
  if (typeof ps.CalculatePPWithBonus !== 'function') {
    return { checked: 0, fails: 0, skipped: true, sample: [], verdict: '⚠️ ignorée : CalculatePPWithBonus non exportée' };
  }
  const R = (n) => dc.resolveDecompConstant(n, 'MOVE_');
  const MOVES = ['MOVE_TACKLE', 'MOVE_THUNDERBOLT', 'MOVE_TOXIC', 'MOVE_SOLAR_BEAM'].map(R).filter((x) => x != null);
  const maskFor = (i) => 3 << (2 * i);            // = PP_UP_SHIFTS(3) décomp
  const calcWant = (basePP, ppBonuses, i) => {
    const ppUps = (maskFor(i) & ppBonuses) >> (2 * i);
    return (basePP + Math.floor((basePP * 20 * ppUps) / 100)) & 0xff;
  };

  const fails = []; let checked = 0;
  for (const move of MOVES) {
    const mv = bm.getBattleMove ? bm.getBattleMove(move) : null;
    const basePP = mv && typeof mv.pp === 'number' ? mv.pp : null;
    if (basePP == null) continue;
    for (let i = 0; i < 4; i++) {
      for (let k = 0; k < 4; k++) {             // ppUps voulu 0..3
        const ppBonuses = k << (2 * i);
        const got = ps.CalculatePPWithBonus(move, ppBonuses, i);
        const want = calcWant(basePP, ppBonuses, i);
        checked++;
        if (got !== want && fails.length < 12) fails.push(`move=${move} basePP=${basePP} i=${i} ppUps=${k}: got=${got} want=${want}`);
      }
    }
    // cas multi-slot : tous les slots à 3 PP-Up → vérifie l'isolation du masque par index
    const allMax = 0xFF;
    for (let i = 0; i < 4; i++) {
      const got = ps.CalculatePPWithBonus(move, allMax, i);
      const want = calcWant(basePP, allMax, i);
      checked++;
      if (got !== want && fails.length < 12) fails.push(`move=${move} multi i=${i}: got=${got} want=${want}`);
    }
  }
  if (checked === 0) return { checked: 0, fails: 0, skipped: true, sample: [], verdict: '⚠️ ignorée : moves/PP non résolus (battle-moves chargé ?)' };
  return { checked, fails: fails.length, sample: fails.slice(0, 12),
    verdict: fails.length === 0 ? '✅ CalculatePPWithBonus (PP-Up +0/20/40/60% + masque par slot) 1:1' : '❌ écarts' };
}
