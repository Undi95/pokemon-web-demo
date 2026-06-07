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
import { ANIMCMD_FRAME, ANIMCMD_END, ANIMCMD_JUMP, type AnimCmd } from '../engine/system/sprite-animation';
import { ST_OAM_AFFINE_DOUBLE } from '../engine/system/decomp-helpers';
import { SpriteCallbackDummy } from '../engine/system/decomp-globals';
import {
  GFX_TAG_POKE_BALL, GFX_TAG_GREAT_BALL, GFX_TAG_SAFARI_BALL, GFX_TAG_ULTRA_BALL,
  GFX_TAG_MASTER_BALL, GFX_TAG_NET_BALL, GFX_TAG_DIVE_BALL, GFX_TAG_NEST_BALL,
  GFX_TAG_REPEAT_BALL, GFX_TAG_TIMER_BALL, GFX_TAG_LUXURY_BALL, GFX_TAG_PREMIER_BALL,
} from '../engine/decomp-data/src/pokeball-data';

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

// ════════════════════════════════════════════════════════════════════════════
// TABLES BALL (pokeball.c:92-327) — DATA, consommees par CreateSprite (#20).
// ════════════════════════════════════════════════════════════════════════════

// 1:1 decomp pokeball.c:92-107 `sBallOamData` : sprite 16x16 (shape SQUARE, size 1),
// ST_OAM_AFFINE_DOUBLE (zone de rendu 32x32 pour la rotation de la ball), priority 2.
// (objMode/mosaic/bpp/matrixNum/tileNum/affineParam = defauts du modele OAM runtime.)
const sBallOamData = {
  shape: 0,                          // SPRITE_SHAPE(16x16) = SQUARE
  size: 1,                           // SPRITE_SIZE(16x16)
  affineMode: ST_OAM_AFFINE_DOUBLE,
  priority: 2,
  paletteNum: 0,
};

// 1:1 decomp pokeball.c:109-151 — sequences d'anim de FRAME de la ball.
// imageValue = tileOffset ; duration = frames. ANIMCMD_JUMP(0) = boucle, ANIMCMD_END = stop.
const sBallAnimSeq0: ReadonlyArray<AnimCmd> = [ANIMCMD_FRAME(0, 1), ANIMCMD_END];
const sBallAnimSeq1: ReadonlyArray<AnimCmd> = [ANIMCMD_FRAME(4, 5), ANIMCMD_FRAME(8, 5), ANIMCMD_END];
const sBallAnimSeq2: ReadonlyArray<AnimCmd> = [ANIMCMD_FRAME(4, 5), ANIMCMD_FRAME(0, 5), ANIMCMD_END];
const sBallAnimSeq3: ReadonlyArray<AnimCmd> = [ANIMCMD_FRAME(0, 5), ANIMCMD_JUMP(0)];   // unused?
const sBallAnimSeq4: ReadonlyArray<AnimCmd> = [ANIMCMD_FRAME(8, 5), ANIMCMD_JUMP(0)];
const sBallAnimSeq5: ReadonlyArray<AnimCmd> = [ANIMCMD_FRAME(4, 1), ANIMCMD_JUMP(0)];
const sBallAnimSeq6: ReadonlyArray<AnimCmd> = [ANIMCMD_FRAME(12, 1), ANIMCMD_JUMP(0)];
// 1:1 decomp pokeball.c:153-164 `sBallAnimSequences[]` (ordre 0..6).
export const sBallAnimSequences: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  sBallAnimSeq0, sBallAnimSeq1, sBallAnimSeq2, sBallAnimSeq3, sBallAnimSeq4, sBallAnimSeq5, sBallAnimSeq6,
];

// 1:1 decomp pokeball.c:205-327 `gBallSpriteTemplates[POKEBALL_COUNT]`, indexe par
// BALL_POKE..BALL_PREMIER (0..11). Les 12 entrees ne different QUE par le tag gfx
// (oam/anims/affineAnims/callback identiques). Le callback decomp = SpriteCB_BallThrow
// (throw de CAPTURE pokeball.c:424, HORS perimetre send-out) ; le send-out OVERRIDE le
// callback dans Task_DoPokeballSendOutAnim -> SpriteCallbackDummy + dette capture.
// affineAnims = NOM de la table enregistree (sprite-affine-extras.ts), lu par CreateSprite (#20).
// images: NULL (decomp) -> omis : CreateSprite (#20) route via tileTag (sheet), pas images.
const _ballGfxTags: ReadonlyArray<number> = [
  GFX_TAG_POKE_BALL, GFX_TAG_GREAT_BALL, GFX_TAG_SAFARI_BALL, GFX_TAG_ULTRA_BALL,
  GFX_TAG_MASTER_BALL, GFX_TAG_NET_BALL, GFX_TAG_DIVE_BALL, GFX_TAG_NEST_BALL,
  GFX_TAG_REPEAT_BALL, GFX_TAG_TIMER_BALL, GFX_TAG_LUXURY_BALL, GFX_TAG_PREMIER_BALL,
];
export const gBallSpriteTemplates = _ballGfxTags.map((tag) => ({
  tileTag: tag,
  paletteTag: tag,
  oam: sBallOamData,
  anims: sBallAnimSequences,
  affineAnims: 'sAffineAnim_BallRotate',
  callback: SpriteCallbackDummy,
}));
