/**
 * probe-type-physical-split-1to1.mjs — ORACLE RUNTIME du split physique/spécial par TYPE (Gen 3).
 *
 * En Gen 3, la catégorie (physique vs spécial) d'un coup dépend de son TYPE, pas du coup :
 *   décomp battle.h:466-467 : `IS_TYPE_PHYSICAL(t) = t < TYPE_MYSTERY(9)`, `IS_TYPE_SPECIAL = t > 9`.
 *   ⇒ physique = Normal..Acier (0-8), MYSTERY(9) = ni l'un ni l'autre, spécial = Feu..Ténèbres (10-17).
 * Un mauvais split = le coup utilise la mauvaise stat (Attaque vs Atq. Spé) → dégâts faux sur CHAQUE
 * coup de ce type. On confronte `IS_TYPE_PHYSICAL`/`IS_TYPE_SPECIAL` (fonctions LIVE du chemin de
 * dégâts) appliquées aux CONSTANTES de type du port (TYPE_NORMAL..TYPE_DARK) contre le tableau
 * canonique Gen 3 (cité). Couvre les 18 types par NOM (= valeur de type ET frontière confrontées
 * ensemble). Pas de RNG/ctx. Self-import constants.
 */
'use strict';

// canonique Gen 3 (décomp : physique si type < 9, spécial si > 9 ; MYSTERY=9 = aucun).
const CANON = {
  TYPE_NORMAL: 'phys', TYPE_FIGHTING: 'phys', TYPE_FLYING: 'phys', TYPE_POISON: 'phys',
  TYPE_GROUND: 'phys', TYPE_ROCK: 'phys', TYPE_BUG: 'phys', TYPE_GHOST: 'phys', TYPE_STEEL: 'phys',
  TYPE_MYSTERY: 'none',
  TYPE_FIRE: 'spec', TYPE_WATER: 'spec', TYPE_GRASS: 'spec', TYPE_ELECTRIC: 'spec',
  TYPE_PSYCHIC: 'spec', TYPE_ICE: 'spec', TYPE_DRAGON: 'spec', TYPE_DARK: 'spec',
};

export async function runTypePhysicalSplitOracle(deps) {
  const bc = await import('/src/engine/battle/constants.ts');
  if (typeof bc.IS_TYPE_PHYSICAL !== 'function' || typeof bc.IS_TYPE_SPECIAL !== 'function') {
    return { checked: 0, fails: 0, skipped: true, sample: [], verdict: '⚠️ ignorée : IS_TYPE_PHYSICAL/SPECIAL non exportées' };
  }
  const fails = []; let checked = 0;
  for (const [typeName, cat] of Object.entries(CANON)) {
    const t = bc[typeName];
    if (typeof t !== 'number') { fails.push(`${typeName} : constante absente`); continue; }
    const phys = bc.IS_TYPE_PHYSICAL(t);
    const spec = bc.IS_TYPE_SPECIAL(t);
    checked++;
    const want = cat === 'phys' ? [true, false] : cat === 'spec' ? [false, true] : [false, false];
    if (phys !== want[0] || spec !== want[1])
      fails.push(`${typeName}(=${t}) : phys=${phys} spec=${spec} attendu ${cat} ([${want}])`);
  }
  return { checked, fails: fails.length, sample: fails.slice(0, 18),
    verdict: fails.length === 0 ? '✅ Split physique/spécial par type (18 types, frontière TYPE_MYSTERY=9) 1:1' : '❌ écarts' };
}
