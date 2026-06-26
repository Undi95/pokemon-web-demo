/**
 * probe-gender-shiny-1to1.mjs — ORACLE RUNTIME du GENRE et du CHROMATIQUE.
 *
 * GetGenderFromSpeciesAndPersonality (pokemon.ts) : genre depuis le ratio de l'espèce +
 * personality. IsShinyOtIdPersonality : chromatique via XOR(otId, personality) < 8.
 * Confronté à des cas CANONIQUES (savoir externe + formule décomp recodée).
 *
 * 🐛 A RÉVÉLÉ UN VRAI BUG (3e après friendship/Altering Cave) : getSpeciesGenderRatio
 * parsait `PERCENT_FEMALE(N)` avec `\d+` (entiers seulement) → `PERCENT_FEMALE(12.5)`
 * (ratio 7♂:1♀ des starters & co) ne matchait pas → fallback MÂLE → 46 espèces 100%
 * mâles à tort. Fix : `\d+(\.\d+)?` + parseFloat + min(254) (= macro décomp). Cet oracle
 * garde contre la régression (les cas Bulba byte<31 → FEMELLE échouaient avant le fix).
 *
 * LANCER (live) : o.runGenderShinyOracle({
 *   pk: await import('/src/pokemon.ts'),
 *   dc: await import('/harness/runtime/decomp-constants.ts') })
 * RÉSULTAT VÉRIFIÉ (2026-06-26, finale) : 9 genre + 4 chromatique OK ;
 * runFullGenderRatioCheck = 386/386 espèces (getSpeciesGenderRatio vs PERCENT_FEMALE
 * recalculé) résolues 1:1 après le fix.
 */
'use strict';

const MALE = 0, FEMALE = 0xFE, GENDERLESS = 0xFF;

/**
 * Vérif EXHAUSTIVE : pour chaque espèce, getSpeciesGenderRatio(num) doit égaler la valeur
 * dérivée à la main de la string genderRatio (MON_* ou min(254, ⌊pct·255/100⌋)).
 * deps = { sr: species-runtime, dc, info: species-info.json } (info via fetch dans l'eval).
 */
export function runFullGenderRatioCheck({ sr, dc, info }) {
  const want = (raw) => {
    if (raw === 'MON_MALE') return 0; if (raw === 'MON_FEMALE') return 254; if (raw === 'MON_GENDERLESS') return 255;
    const m = String(raw).match(/^PERCENT_FEMALE\(([\d.]+)\)$/);
    return m ? Math.min(254, Math.floor((parseFloat(m[1]) * 255) / 100)) : null;
  };
  let checked = 0; const mism = [];
  for (const sp of Object.keys(info)) {
    const w = want(info[sp].genderRatio); if (w === null) continue;
    const num = dc.resolveDecompConstant(sp, 'SPECIES_'); if (num == null) continue;
    const got = sr.getSpeciesGenderRatio(num); checked++;
    if (got !== w && mism.length < 12) mism.push(`${sp} got=${got} want=${w} (${info[sp].genderRatio})`);
  }
  return { checked, fails: mism.length, sample: mism, verdict: mism.length === 0 ? '✅ ratios de genre 386/386 1:1' : '❌ écarts' };
}

export function runGenderShinyOracle({ pk, dc }) {
  const SP = (n) => dc.resolveDecompConstant('SPECIES_' + n, 'SPECIES_');
  const g = (sp, pers) => pk.GetGenderFromSpeciesAndPersonality(SP(sp), pers);
  // ratios : Bulba/Charmander 12.5%♀ (=31, FRACTIONNAIRE) · Magnemite genderless ·
  // Tauros 0%♀ · Chansey 100%♀ · Ralts 50%♀ (=127)
  const genderCases = [
    { d: 'Bulba byte0 → F', got: g('BULBASAUR', 0), want: FEMALE },
    { d: 'Bulba byte30 → F', got: g('BULBASAUR', 30), want: FEMALE },
    { d: 'Bulba byte31 → M', got: g('BULBASAUR', 31), want: MALE },
    { d: 'Charmander byte10 → F', got: g('CHARMANDER', 10), want: FEMALE },
    { d: 'Magnemite → genderless', got: g('MAGNEMITE', 5), want: GENDERLESS },
    { d: 'Tauros → M', got: g('TAUROS', 0), want: MALE },
    { d: 'Chansey byte0 → F', got: g('CHANSEY', 0), want: FEMALE },
    { d: 'Ralts byte126 → F (50%)', got: g('RALTS', 126), want: FEMALE },
    { d: 'Ralts byte127 → M (50%)', got: g('RALTS', 127), want: MALE },
  ];
  // chromatique : XOR(HI^LO otId ^ HI^LO pers) < 8
  const sh = (otId, pers) => pk.IsShinyOtIdPersonality(otId, pers);
  const shinyCases = [
    { d: 'otId=pers → shiny', got: sh(0x12345678, 0x12345678), want: true },
    { d: '(0,0) → shiny', got: sh(0, 0), want: true },
    { d: 'HI=15 → non-shiny', got: sh(0, 0x000F0000), want: false },
    { d: 'gros XOR → non-shiny', got: sh(0xFFFF0000, 0), want: false },
  ];
  const res = [...genderCases, ...shinyCases].map((c) => ({ ...c, ok: c.got === c.want }));
  const fails = res.filter((r) => !r.ok);
  return { checked: res.length, fails: fails.length, sample: fails, verdict: fails.length === 0 ? '✅ genre + chromatique 1:1' : '❌ écarts', res };
}
