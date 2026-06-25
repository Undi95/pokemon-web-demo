/**
 * probe-type-effectiveness-1to1.mjs — ORACLE RUNTIME de l'APPLICATION de l'efficacité de type.
 *
 * audit-type-chart.cjs prouve la TABLE gTypeEffectiveness (data). Celui-ci prouve son
 * APPLICATION : AI_TypeCalc (battle_script_commands.ts) lit les types de l'espèce + le
 * type du move + le talent, itère la table (cumul double-type, marqueur foresight pour
 * l'immunité Spectre, Lévitation, Garde Mystik) et renvoie les flags MOVE_RESULT_*.
 * On confronte la sortie LIVE à des matchups Pokémon CANONIQUES connus (= savoir externe,
 * non-circulaire).
 *
 * Flags : SUPER_EFFECTIVE=2 · NOT_VERY_EFFECTIVE=4 · DOESNT_AFFECT_FOE=8 · MISSED=1.
 *
 * LANCER (live) : o.runTypeEffectivenessOracle({
 *   bsc: await import('/src/battle_script_commands.ts'),
 *   dc:  await import('/harness/runtime/decomp-constants.ts') })
 * RÉSULTAT VÉRIFIÉ (2026-06-26, finale) : 9/9 matchups (super/pas-eff/immunités/Lévitation/
 * neutre) corrects. La diversité des cas = le contrôle de discrimination (teeth).
 */
'use strict';

const SUPER = 2, NOTVERY = 4, AFFECT = 8;

// Matchups canoniques (savoir Pokémon externe au code/à la table)
export const CASES = [
  { d: 'Feu>Herbe super', move: 'EMBER', sp: 'TANGELA', want: SUPER },
  { d: 'Feu<Eau pas-eff', move: 'EMBER', sp: 'PSYDUCK', want: NOTVERY },
  { d: 'Normal>Spectre immun', move: 'TACKLE', sp: 'GASTLY', want: AFFECT },
  { d: 'Elec>Sol immun', move: 'THUNDERBOLT', sp: 'SANDSHREW', want: AFFECT },
  { d: 'Eau>Feu super', move: 'WATER_GUN', sp: 'CHARMANDER', want: SUPER },
  { d: 'Combat>Spectre immun', move: 'KARATE_CHOP', sp: 'GASTLY', want: AFFECT },
  { d: 'Normal vs Normal neutre', move: 'TACKLE', sp: 'RATTATA', want: 0 },
  { d: 'Sol vs Levitation immun', move: 'EARTHQUAKE', sp: 'GEODUDE', ab: 'LEVITATE', want: AFFECT },
  { d: 'Glace>Dragon super', move: 'ICE_BEAM', sp: 'DRATINI', want: SUPER },
];

export function runTypeEffectivenessOracle({ bsc, dc }) {
  const SP = (n) => dc.resolveDecompConstant('SPECIES_' + n, 'SPECIES_');
  const MV = (n) => dc.resolveDecompConstant('MOVE_' + n, 'MOVE_');
  const AB = (n) => dc.resolveDecompConstant('ABILITY_' + n, 'ABILITY_');
  const res = CASES.map((c) => {
    const flags = bsc.AI_TypeCalc(MV(c.move), SP(c.sp), c.ab ? AB(c.ab) : 0);
    const ok = c.want === 0 ? (flags & (SUPER | NOTVERY | AFFECT)) === 0 : (flags & c.want) !== 0;
    return { d: c.d, flags, ok };
  });
  const fails = res.filter((r) => !r.ok);
  return { checked: res.length, fails: fails.length, sample: fails, verdict: fails.length === 0 ? '✅ efficacité de type appliquée 1:1' : '❌ écarts', res };
}
