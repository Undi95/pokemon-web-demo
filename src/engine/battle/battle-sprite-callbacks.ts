/**
 * SHIM de compat — la section sprite-callbacks est CONSOLIDÉE PHYSIQUEMENT dans
 * `src/game/battle_main.ts` (C6, 2026-06-10 — fichier décomp d'origine :
 * battle_main.c, ~20 SpriteCB du combat). Re-export NOMMÉ. Importeurs :
 * miroirs game (controllers, pokeball) + voie V. À déposer avec la voie V.
 */
export {
  BOUNCE_HEALTHBOX, BOUNCE_MON,
  AnimSetCenterToCornerVecX, SpriteCallbackDummy_2,
  SpriteCB_WildMon, SpriteCB_MoveWildMonToRight, SpriteCB_WildMonShowHealthbox,
  SpriteCB_WildMonAnimate, SpriteCB_Flicker, SpriteCB_ShowAsMoveTarget,
  SpriteCB_BlinkVisible, SpriteCB_HideAsMoveTarget, SpriteCB_OpponentMonFromBall,
  SpriteCB_BattleSpriteStartSlideLeft, SpriteCB_BattleSpriteSlideLeft,
  SpriteCB_Idle, SpriteCB_PlayerMonFromBall, SpriteCB_TrainerThrowObject_Main,
  SpriteCB_TrainerThrowObject, DoBounceEffect, EndBounceEffect,
  SpriteCB_BounceEffect,
} from '../../game/battle_main';
