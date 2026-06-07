/**
 * battle/battle-vblank-helpers.ts — RÉ-EXPORT depuis le port miroir.
 *
 * Le contenu (VBlankCB_Battle + HBlankCB_Battle + GetBattleBgTemplateData +
 * SpriteCB_VsLetter* + BufferPartyVsScreenHealth* + battleVBlankState + les
 * accesseurs globalThis gBattle_BG/WIN/gIntroSlideFlags) a été migré 1:1 vers
 * `src/game/battle_main.ts` (port miroir battle_main.c, tranche 1, 2026-06-07).
 *
 * Ce module reste comme façade pour les importeurs existants (battle-intro.ts,
 * reshow-battle-screen.ts) et déclenche, par son import de battle_main, l'IIFE
 * d'accesseurs + l'expose globalThis __battleVBlankHelpers.
 */

export {
  VBlankCB_Battle,
  HBlankCB_Battle,
  GetBattleBgTemplateData,
  SpriteCB_VsLetterDummy,
  SpriteCB_VsLetter,
  SpriteCB_VsLetterInit,
  BufferPartyVsScreenHealth_AtStart,
  BufferPartyVsScreenHealth_AtEnd,
  battleVBlankState,
} from '../../game/battle_main';
