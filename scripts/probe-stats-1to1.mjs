/**
 * probe-stats-1to1.mjs — ORACLE RUNTIME (non headless) de la formule de stats.
 *
 * CalculateMonStats (party-storage.ts) calcule maxHP/Att/Déf/Vit/AttSpé/DéfSpé
 * depuis base+IV+EV+niveau+nature. C'est une FORMULE (pas une table) → aucun
 * oracle node-pur possible. On la vérifie en confrontant la SORTIE LIVE du moteur
 * à la formule décomp RECODÉE ICI à la main (non-circulaire : la référence vient
 * de pokemon.c, pas de notre TS).
 *
 * Référence décomp 1:1 :
 *   - CalculateMonStats        pokemon.c:1932  (HP = ((2*baseHP+iv+ev/4)*lvl)/100 + lvl + 10 ;
 *                                               stat = ((2*base+iv+ev/4)*lvl)/100 + 5 ; SHEDINJA→HP=1)
 *   - ModifyStatByNature       pokemon.c:5865  (case +1: stat*110/100 ; case -1: stat*90/100 ;
 *                                               neutre hors STAT_ATK..STAT_SPDEF ; u16 tronqué)
 *   - gNatureStatTable[25][5]  pokemon.c:1366  (ATK,DEF,SPE,SPA,SPD, ordre NATURE_*)
 *
 * COMMENT LANCER (moteur live requis) : coller le corps de runStatsOracle() dans
 * une eval de la preview (ou via le pont preview_eval), avec les imports :
 *   const ps = await import('/src/engine/battle/party-storage.ts');
 *   const dc = await import('/harness/runtime/decomp-constants.ts');
 *   const gd = globalThis.__game_data;
 *   return runStatsOracle({ ps, dc, gd });
 *
 * RÉSULTAT VÉRIFIÉ (2026-06-25, branche finale) : 270/270 vecteurs FIDÈLES
 * (5 espèces × 3 niveaux × 6 natures × 3 combos IV/EV ; Shedinja HP=1 + Shuckle
 * inclus). Contrôle négatif validé : une référence +20% (au lieu de +10%) flag
 * bien les natures +ATK → la sonde a des dents.
 */
'use strict';

// gNatureStatTable décomp (pokemon.c:1366) — colonnes ATK,DEF,SPE,SPA,SPD
export const NATURE_STAT_TABLE = [
  [0,0,0,0,0],[1,-1,0,0,0],[1,0,-1,0,0],[1,0,0,-1,0],[1,0,0,0,-1],
  [-1,1,0,0,0],[0,0,0,0,0],[0,1,-1,0,0],[0,1,0,-1,0],[0,1,0,0,-1],
  [-1,0,1,0,0],[0,-1,1,0,0],[0,0,0,0,0],[0,0,1,-1,0],[0,0,1,0,-1],
  [-1,0,0,1,0],[0,-1,0,1,0],[0,0,-1,1,0],[0,0,0,0,0],[0,0,0,1,-1],
  [-1,0,0,0,1],[0,-1,0,0,1],[0,0,-1,0,1],[0,0,0,-1,1],[0,0,0,0,0],
];

// ModifyStatByNature 1:1 (pokemon.c:5865) — i0 = 0..4 (ATK..SPDEF)
export const modifyStatByNature = (nature, stat, i0) => {
  const m = NATURE_STAT_TABLE[nature][i0];
  if (m === 1) return Math.trunc(((stat * 110) & 0xFFFF) / 100) & 0xFFFF;
  if (m === -1) return Math.trunc(((stat * 90) & 0xFFFF) / 100) & 0xFFFF;
  return stat & 0xFFFF;
};

// CalculateMonStats 1:1 (pokemon.c:1932) — base = {hp,atk,def,spe,spa,spd}
export const decompStats = (b, lvl, iv, ev, nature, shedinja) => {
  const cs = (base, ivv, evv, i0) => {
    const n = Math.trunc((2 * base + ivv + Math.trunc(evv / 4)) * lvl / 100) + 5;
    return modifyStatByNature(nature, n, i0) & 0xFFFF;
  };
  return {
    maxHP: shedinja ? 1 : (Math.trunc((2 * b.hp + iv.hp + Math.trunc(ev.hp / 4)) * lvl / 100) + lvl + 10) & 0xFFFF,
    attack: cs(b.atk, iv.atk, ev.atk, 0), defense: cs(b.def, iv.def, ev.def, 1),
    speed: cs(b.spe, iv.spe, ev.spe, 2), spAttack: cs(b.spa, iv.spa, ev.spa, 3),
    spDefense: cs(b.spd, iv.spd, ev.spd, 4),
  };
};

/** Lance l'oracle dans le moteur live. deps = { ps, dc, gd }. */
export function runStatsOracle({ ps, dc, gd }) {
  const mkIvEv = (v) => ({ hp: v, atk: v, def: v, spe: v, spa: v, spd: v });
  const makeMon = (sp, lvl, iv, ev, pers) => ({
    species: sp, level: lvl, personality: pers >>> 0,
    hpIV: iv.hp, attackIV: iv.atk, defenseIV: iv.def, speedIV: iv.spe, spAttackIV: iv.spa, spDefenseIV: iv.spd,
    hpEV: ev.hp, attackEV: ev.atk, defenseEV: ev.def, speedEV: ev.spe, spAttackEV: ev.spa, spDefenseEV: ev.spd,
    maxHP: 0, hp: 0,
  });
  const speciesList = ['SPECIES_BULBASAUR', 'SPECIES_SHUCKLE', 'SPECIES_RAYQUAZA', 'SPECIES_SHEDINJA', 'SPECIES_MAGIKARP'];
  const levels = [1, 50, 100];
  const natures = [0, 3, 5, 11, 17, 24];
  const ivevs = [{ iv: mkIvEv(0), ev: mkIvEv(0) }, { iv: mkIvEv(31), ev: mkIvEv(0) }, { iv: mkIvEv(31), ev: mkIvEv(252) }];

  let checked = 0; const mism = [];
  for (const spName of speciesList) {
    const spNum = dc.resolveDecompConstant(spName, 'SPECIES_');
    const info = gd.getSpeciesInfo(spName);
    if (spNum == null || !info?.stats) { mism.push(`${spName} : id/info manquant`); continue; }
    const b = info.stats, shed = spName === 'SPECIES_SHEDINJA';
    for (const lvl of levels) for (const nat of natures) for (const ie of ivevs) {
      const exp = decompStats(b, lvl, ie.iv, ie.ev, nat, shed);
      const mon = makeMon(spNum, lvl, ie.iv, ie.ev, nat);
      ps.CalculateMonStats(mon); checked++;
      const got = { maxHP: mon.maxHP, attack: mon.attack, defense: mon.defense, speed: mon.speed, spAttack: mon.spAttack, spDefense: mon.spDefense };
      for (const k of ['maxHP', 'attack', 'defense', 'speed', 'spAttack', 'spDefense'])
        if (got[k] !== exp[k] && mism.length < 20) mism.push(`${spName} L${lvl} nat${nat} iv${ie.iv.hp}ev${ie.ev.hp} .${k}: got=${got[k]} exp=${exp[k]}`);
    }
  }
  return { checked, mismatches: mism.length, sample: mism.slice(0, 20), verdict: mism.length === 0 ? '✅ stats 1:1' : '❌ écarts' };
}
