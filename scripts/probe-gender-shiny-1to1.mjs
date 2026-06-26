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
 * RÉSULTAT VÉRIFIÉ (2026-06-26, finale) : 9 genre + 4 chromatique OK.
 */
'use strict';

const MALE = 0, FEMALE = 0xFE, GENDERLESS = 0xFF;

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
