/**
 * SHIM de compat — la section link-start (CB2_HandleStartBattle, machine 18
 * cases du boot combat) est CONSOLIDÉE PHYSIQUEMENT dans
 * `src/game/battle_main.ts` (C8, 2026-06-10 — fichier décomp d'origine :
 * battle_main.c:897-1159). Re-export NOMMÉ. Importeur restant : battle-flow
 * (voie V). À déposer avec la voie V.
 */
export { FindLinkBattleMaster, CB2_HandleStartBattle } from '../../game/battle_main';
