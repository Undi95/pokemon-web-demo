/**
 * SHIM de compat — la section faint-anim est CONSOLIDÉE PHYSIQUEMENT dans
 * `src/game/battle_main.ts` (C1, 2026-06-10 — son fichier décomp d'origine :
 * battle_main.c:2744-2891). Re-export NOMMÉ (pas export * : éviter de fuiter
 * tout battle_main sous ce chemin). Side-effect (__battleFaintAnim) posé par
 * la section dans battle_main → importer ce shim charge battle_main.
 * À déposer quand la voie V sera supprimée.
 */
export {
  setFaintSlideFlags, getFaintSlideFlags,
  SpriteCB_FaintOpponentMon, SpriteCB_AnimFaintOpponent, SpriteCB_FaintSlideAnim,
  TriggerFaintSlide, TriggerFaintOpponent,
} from '../../game/battle_main';
