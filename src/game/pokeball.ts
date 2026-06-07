/**
 * game/pokeball.ts — Port MIROIR 1:1 de `src/pokeball.c` (sequence SEND-OUT).
 *
 * Source de verite : `D:/Projet 1/decomps/pokeemeraude/src/pokeball.c`
 *
 * ⚠️ Port PROGRESSIF (pokeball.c = 1345 l.). Perimetre = la chaine SEND-OUT (le
 * dresseur lance sa ball, le mon emerge), DISTINCTE du throw de CAPTURE
 * (SpriteCB_BallThrow + shakes, deferee). Cette 1re tranche = les pieces STANDALONE
 * (constantes + GetBattlerPokeballItemId), sans dependance au chain de SpriteCB.
 *
 * Prerequis DEJA portes (importes, zero dup) :
 *   - ItemIdToBallId            : battle-anim-throw.ts (battle_anim_throw.c:728)
 *   - SpriteCB_PlayerMonFromBall / SpriteCB_OpponentMonFromBall : battle-sprite-callbacks.ts (battle_main.c)
 *   - CreateSprite (template taggee + affineAnims) : decomp-bridge.ts (#20)
 *   - GetBattlerSpriteCoord / GetBattlerSpriteDefault_Y : game/battle_anim_mons.ts (#19)
 *   - InitAnimArcTranslation / AnimTranslateLinear / TranslateAnimHorizontalArc : game/battle_anim_mons.ts
 *   - AnimateBallOpenParticles / LaunchBallFadeMonTask / SetUpForReleaseAffineAnim : pokeball-effects.ts
 *
 * RESTE (tranches suivantes, DORMANT) :
 *   - Tables : sBallOamData / sBallAnimSequences / gBallSpriteTemplates (callback decomp =
 *     SpriteCB_BallThrow capture, override par le send-out -> SpriteCallbackDummy + dette capture).
 *   - LoadBallGfx / FreeBallGfx : PREREQUIS GFX a resoudre — chargement de la sheet ball par
 *     TAG (gBallSpriteSheets) ; notre runtime charge en ASYNC (friction sync/async, cf. pic
 *     coords) ; battle-anim-throw.ts:498 = stub "Dette R3". A porter avant le chain.
 *   - DoPokeballSendOutAnimation (335) + Task_DoPokeballSendOutAnim (352) + SpriteCB_PlayerMonSendOut_1/2
 *     (911/924) + SpriteCB_OpponentMonSendOut (991) + SpriteCB_ReleaseMon2FromBall (982) +
 *     SpriteCB_ReleaseMonFromBall (750) + HandleBallAnimEnd (845) + Task_PlayCryWhenReleasedFromBall
 *     (665, cris = dette : PlayCry_ByMode absent).
 *
 * DORMANT : non cable (le send-out tourne encore sur l'ad-hoc battle-sendout-anim.ts).
 * Le cablage reel + retrait ad-hoc = #22 (A/B user requis).
 */

import { GetBattlerPosition } from '../engine/battle/util';
import { gBattlerPartyIndexes } from '../engine/battle/state';
import { B_SIDE_PLAYER } from '../engine/battle/constants';
import { gPlayerParty, gEnemyParty, GetMonData, MON_DATA_POKEBALL } from '../engine/battle/party-storage';

// 1:1 decomp include/pokeball.h:33-34 — `kindOfThrow` de DoPokeballSendOutAnimation.
// (Les autres valeurs 1..4 = nombre de secousses du throw de capture.)
export const POKEBALL_PLAYER_SENDOUT = 0xFF;
export const POKEBALL_OPPONENT_SENDOUT = 0xFE;

/** 1:1 decomp pokeball.c:1338 `static u16 GetBattlerPokeballItemId(u8 battler)`.
 *  Renvoie l'ITEM_X_BALL avec lequel le mon du battler a ete capture (MON_DATA_POKEBALL).
 *  -> ItemIdToBallId() le convertit en BALL_X pour choisir le sprite de la ball. */
export function GetBattlerPokeballItemId(battler: number): number {
  // 1:1 : GetBattlerSide(battler) == B_SIDE_PLAYER  (= GetBattlerPosition(battler) & BIT_SIDE).
  if ((GetBattlerPosition(battler) & 1) === B_SIDE_PLAYER) {
    return GetMonData(gPlayerParty[gBattlerPartyIndexes[battler]] as never, MON_DATA_POKEBALL) as number;
  }
  return GetMonData(gEnemyParty[gBattlerPartyIndexes[battler]] as never, MON_DATA_POKEBALL) as number;
}
