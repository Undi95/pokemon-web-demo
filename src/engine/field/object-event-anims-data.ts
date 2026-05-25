/**
 * object-event-anims-data.ts — Port 1:1 STRICT décomp.
 *
 * Source : D:/Projet 1/decomps/pokeemeraude/src/data/object_events/object_event_anims.h (1177 lignes)
 * Voir aussi : include/constants/event_object_movement.h (= ANIM_STD_* + autres indices)
 *
 * Auto-port (101 sAnim_* + 15 sAnimTable_*) — toute modification doit
 * d'abord modifier le décomp source puis re-générer.
 *
 * Note 1:1 STRICT :
 *   - Les affine anim commands (sAffineAnim_KyogreGroudon_*) sont IGNORÉES ici
 *     (= séparées, gérées par autre système port).
 *   - sStepAnimTables est porté en bas (struct StepAnimTable décomp
 *     event_object_movement.h:80-84).
 *   - Les designated initializers `[ANIM_FOO] = sAnim_X` sont resolus en
 *     valeurs numériques concrètes via les constants de
 *     event_object_movement.h. Les trous sparse sont remplis avec
 *     sAnim_StayStill (= placeholder honnête) + commentaire `// [ANIM_STD_FOO]`.
 */
import { ANIMCMD_FRAME, ANIMCMD_END, ANIMCMD_JUMP, ANIMCMD_LOOP, type AnimCmd } from '../system/sprite-animation';

// ─── 101 sAnim_* arrays — 1:1 décomp object_event_anims.h ─────────────────────

export const sAnim_StayStill: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(0, 8),
  ANIMCMD_FRAME(0, 8),
  ANIMCMD_FRAME(0, 8),
  ANIMCMD_FRAME(0, 8),
  ANIMCMD_JUMP(0),
];

export const sAnim_QuintyPlumpFaceSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(0, 16),
  ANIMCMD_JUMP(0),
];

export const sAnim_QuintyPlumpFaceNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(1, 16),
  ANIMCMD_JUMP(0),
];

export const sAnim_QuintyPlumpFaceWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(2, 16),
  ANIMCMD_JUMP(0),
];

export const sAnim_QuintyPlumpFaceEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(2, 16, { hFlip: true }),
  ANIMCMD_JUMP(0),
];

export const sAnim_QuintyPlumpGoSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(3, 8),
  ANIMCMD_FRAME(0, 8),
  ANIMCMD_FRAME(3, 8, { hFlip: true }),
  ANIMCMD_FRAME(0, 8),
  ANIMCMD_JUMP(0),
];

export const sAnim_QuintyPlumpGoNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(4, 8),
  ANIMCMD_FRAME(1, 8),
  ANIMCMD_FRAME(4, 8, { hFlip: true }),
  ANIMCMD_FRAME(1, 8),
  ANIMCMD_JUMP(0),
];

export const sAnim_QuintyPlumpGoWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(5, 8),
  ANIMCMD_FRAME(2, 8),
  ANIMCMD_FRAME(6, 8),
  ANIMCMD_FRAME(2, 8),
  ANIMCMD_JUMP(0),
];

export const sAnim_QuintyPlumpGoEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(5, 8, { hFlip: true }),
  ANIMCMD_FRAME(2, 8, { hFlip: true }),
  ANIMCMD_FRAME(6, 8, { hFlip: true }),
  ANIMCMD_FRAME(2, 8, { hFlip: true }),
  ANIMCMD_JUMP(0),
];

export const sAnim_QuintyPlumpGoFastSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(3, 4),
  ANIMCMD_FRAME(0, 4),
  ANIMCMD_FRAME(3, 4, { hFlip: true }),
  ANIMCMD_FRAME(0, 4),
  ANIMCMD_JUMP(0),
];

export const sAnim_QuintyPlumpGoFastNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(4, 4),
  ANIMCMD_FRAME(1, 4),
  ANIMCMD_FRAME(4, 4, { hFlip: true }),
  ANIMCMD_FRAME(1, 4),
  ANIMCMD_JUMP(0),
];

export const sAnim_QuintyPlumpGoFastWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(5, 4),
  ANIMCMD_FRAME(2, 4),
  ANIMCMD_FRAME(6, 4),
  ANIMCMD_FRAME(2, 4),
  ANIMCMD_JUMP(0),
];

export const sAnim_QuintyPlumpGoFastEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(5, 4, { hFlip: true }),
  ANIMCMD_FRAME(2, 4, { hFlip: true }),
  ANIMCMD_FRAME(6, 4, { hFlip: true }),
  ANIMCMD_FRAME(2, 4, { hFlip: true }),
  ANIMCMD_JUMP(0),
];

export const sAnim_QuintyPlumpGoFasterSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(3, 2),
  ANIMCMD_FRAME(0, 2),
  ANIMCMD_FRAME(3, 2, { hFlip: true }),
  ANIMCMD_FRAME(0, 2),
  ANIMCMD_JUMP(0),
];

export const sAnim_QuintyPlumpGoFasterNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(4, 2),
  ANIMCMD_FRAME(1, 2),
  ANIMCMD_FRAME(4, 2, { hFlip: true }),
  ANIMCMD_FRAME(1, 2),
  ANIMCMD_JUMP(0),
];

export const sAnim_QuintyPlumpGoFasterWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(5, 2),
  ANIMCMD_FRAME(2, 2),
  ANIMCMD_FRAME(6, 2),
  ANIMCMD_FRAME(2, 2),
  ANIMCMD_JUMP(0),
];

export const sAnim_QuintyPlumpGoFasterEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(5, 2, { hFlip: true }),
  ANIMCMD_FRAME(2, 2, { hFlip: true }),
  ANIMCMD_FRAME(6, 2, { hFlip: true }),
  ANIMCMD_FRAME(2, 2, { hFlip: true }),
  ANIMCMD_JUMP(0),
];

export const sAnim_QuintyPlumpGoFastestSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(3, 1),
  ANIMCMD_FRAME(0, 1),
  ANIMCMD_FRAME(3, 1, { hFlip: true }),
  ANIMCMD_FRAME(0, 1),
  ANIMCMD_JUMP(0),
];

export const sAnim_QuintyPlumpGoFastestNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(4, 1),
  ANIMCMD_FRAME(1, 1),
  ANIMCMD_FRAME(4, 1, { hFlip: true }),
  ANIMCMD_FRAME(1, 1),
  ANIMCMD_JUMP(0),
];

export const sAnim_QuintyPlumpGoFastestWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(5, 1),
  ANIMCMD_FRAME(2, 1),
  ANIMCMD_FRAME(6, 1),
  ANIMCMD_FRAME(2, 1),
  ANIMCMD_JUMP(0),
];

export const sAnim_QuintyPlumpGoFastestEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(5, 1, { hFlip: true }),
  ANIMCMD_FRAME(2, 1, { hFlip: true }),
  ANIMCMD_FRAME(6, 1, { hFlip: true }),
  ANIMCMD_FRAME(2, 1, { hFlip: true }),
  ANIMCMD_JUMP(0),
];

export const sAnim_FaceSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(0, 16),
  ANIMCMD_JUMP(0),
];

export const sAnim_FaceNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(1, 16),
  ANIMCMD_JUMP(0),
];

export const sAnim_FaceWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(2, 16),
  ANIMCMD_JUMP(0),
];

export const sAnim_FaceEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(2, 16, { hFlip: true }),
  ANIMCMD_JUMP(0),
];

export const sAnim_GoSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(3, 8),
  ANIMCMD_FRAME(0, 8),
  ANIMCMD_FRAME(4, 8),
  ANIMCMD_FRAME(0, 8),
  ANIMCMD_JUMP(0),
];

export const sAnim_GoNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(5, 8),
  ANIMCMD_FRAME(1, 8),
  ANIMCMD_FRAME(6, 8),
  ANIMCMD_FRAME(1, 8),
  ANIMCMD_JUMP(0),
];

export const sAnim_GoWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(7, 8),
  ANIMCMD_FRAME(2, 8),
  ANIMCMD_FRAME(8, 8),
  ANIMCMD_FRAME(2, 8),
  ANIMCMD_JUMP(0),
];

export const sAnim_GoEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(7, 8, { hFlip: true }),
  ANIMCMD_FRAME(2, 8, { hFlip: true }),
  ANIMCMD_FRAME(8, 8, { hFlip: true }),
  ANIMCMD_FRAME(2, 8, { hFlip: true }),
  ANIMCMD_JUMP(0),
];

export const sAnim_GoFastSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(3, 4),
  ANIMCMD_FRAME(0, 4),
  ANIMCMD_FRAME(4, 4),
  ANIMCMD_FRAME(0, 4),
  ANIMCMD_JUMP(0),
];

export const sAnim_GoFastNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(5, 4),
  ANIMCMD_FRAME(1, 4),
  ANIMCMD_FRAME(6, 4),
  ANIMCMD_FRAME(1, 4),
  ANIMCMD_JUMP(0),
];

export const sAnim_GoFastWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(7, 4),
  ANIMCMD_FRAME(2, 4),
  ANIMCMD_FRAME(8, 4),
  ANIMCMD_FRAME(2, 4),
  ANIMCMD_JUMP(0),
];

export const sAnim_GoFastEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(7, 4, { hFlip: true }),
  ANIMCMD_FRAME(2, 4, { hFlip: true }),
  ANIMCMD_FRAME(8, 4, { hFlip: true }),
  ANIMCMD_FRAME(2, 4, { hFlip: true }),
  ANIMCMD_JUMP(0),
];

export const sAnim_GoFasterSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(3, 2),
  ANIMCMD_FRAME(0, 2),
  ANIMCMD_FRAME(4, 2),
  ANIMCMD_FRAME(0, 2),
  ANIMCMD_JUMP(0),
];

export const sAnim_GoFasterNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(5, 2),
  ANIMCMD_FRAME(1, 2),
  ANIMCMD_FRAME(6, 2),
  ANIMCMD_FRAME(1, 2),
  ANIMCMD_JUMP(0),
];

export const sAnim_GoFasterWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(7, 2),
  ANIMCMD_FRAME(2, 2),
  ANIMCMD_FRAME(8, 2),
  ANIMCMD_FRAME(2, 2),
  ANIMCMD_JUMP(0),
];

export const sAnim_GoFasterEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(7, 2, { hFlip: true }),
  ANIMCMD_FRAME(2, 2, { hFlip: true }),
  ANIMCMD_FRAME(8, 2, { hFlip: true }),
  ANIMCMD_FRAME(2, 2, { hFlip: true }),
  ANIMCMD_JUMP(0),
];

export const sAnim_GoFastestSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(3, 1),
  ANIMCMD_FRAME(0, 1),
  ANIMCMD_FRAME(4, 1),
  ANIMCMD_FRAME(0, 1),
  ANIMCMD_JUMP(0),
];

export const sAnim_GoFastestNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(5, 1),
  ANIMCMD_FRAME(1, 1),
  ANIMCMD_FRAME(6, 1),
  ANIMCMD_FRAME(1, 1),
  ANIMCMD_JUMP(0),
];

export const sAnim_GoFastestWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(7, 1),
  ANIMCMD_FRAME(2, 1),
  ANIMCMD_FRAME(8, 1),
  ANIMCMD_FRAME(2, 1),
  ANIMCMD_JUMP(0),
];

export const sAnim_GoFastestEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(7, 1, { hFlip: true }),
  ANIMCMD_FRAME(2, 1, { hFlip: true }),
  ANIMCMD_FRAME(8, 1, { hFlip: true }),
  ANIMCMD_FRAME(2, 1, { hFlip: true }),
  ANIMCMD_JUMP(0),
];

export const sAnim_RunSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(12, 5),
  ANIMCMD_FRAME(9, 3),
  ANIMCMD_FRAME(13, 5),
  ANIMCMD_FRAME(9, 3),
  ANIMCMD_JUMP(0),
];

export const sAnim_RunNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(14, 5),
  ANIMCMD_FRAME(10, 3),
  ANIMCMD_FRAME(15, 5),
  ANIMCMD_FRAME(10, 3),
  ANIMCMD_JUMP(0),
];

export const sAnim_RunWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(16, 5),
  ANIMCMD_FRAME(11, 3),
  ANIMCMD_FRAME(17, 5),
  ANIMCMD_FRAME(11, 3),
  ANIMCMD_JUMP(0),
];

export const sAnim_RunEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(16, 5, { hFlip: true }),
  ANIMCMD_FRAME(11, 3, { hFlip: true }),
  ANIMCMD_FRAME(17, 5, { hFlip: true }),
  ANIMCMD_FRAME(11, 3, { hFlip: true }),
  ANIMCMD_JUMP(0),
];

export const sAnim_FieldMove: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(0, 4),
  ANIMCMD_FRAME(1, 4),
  ANIMCMD_FRAME(2, 4),
  ANIMCMD_FRAME(3, 4),
  ANIMCMD_FRAME(4, 8),
  ANIMCMD_END,
];

export const sAnim_GetOnOffSurfBlobSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(9, 32),
  ANIMCMD_JUMP(0),
];

export const sAnim_GetOnOffSurfBlobNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(10, 32),
  ANIMCMD_JUMP(0),
];

export const sAnim_GetOnOffSurfBlobWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(11, 32),
  ANIMCMD_JUMP(0),
];

export const sAnim_GetOnOffSurfBlobEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(11, 32, { hFlip: true }),
  ANIMCMD_JUMP(0),
];

export const sAnim_BunnyHopBackWheelSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(9, 4),
  ANIMCMD_FRAME(10, 4),
  ANIMCMD_END,
];

export const sAnim_BunnyHopBackWheelNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(13, 4),
  ANIMCMD_FRAME(14, 4),
  ANIMCMD_END,
];

export const sAnim_BunnyHopBackWheelWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(17, 4),
  ANIMCMD_FRAME(18, 4),
  ANIMCMD_END,
];

export const sAnim_BunnyHopBackWheelEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(17, 4, { hFlip: true }),
  ANIMCMD_FRAME(18, 4, { hFlip: true }),
  ANIMCMD_END,
];

export const sAnim_BunnyHopFrontWheelSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(11, 4),
  ANIMCMD_FRAME(12, 4),
  ANIMCMD_END,
];

export const sAnim_BunnyHopFrontWheelNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(15, 4),
  ANIMCMD_FRAME(16, 4),
  ANIMCMD_END,
];

export const sAnim_BunnyHopFrontWheelWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(19, 4),
  ANIMCMD_FRAME(20, 4),
  ANIMCMD_END,
];

export const sAnim_BunnyHopFrontWheelEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(19, 4, { hFlip: true }),
  ANIMCMD_FRAME(20, 4, { hFlip: true }),
  ANIMCMD_END,
];

export const sAnim_StandingWheelieBackWheelSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(9, 4),
  ANIMCMD_FRAME(0, 4),
  ANIMCMD_END,
];

export const sAnim_StandingWheelieBackWheelNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(13, 4),
  ANIMCMD_FRAME(1, 4),
  ANIMCMD_END,
];

export const sAnim_StandingWheelieBackWheelWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(17, 4),
  ANIMCMD_FRAME(2, 4),
  ANIMCMD_END,
];

export const sAnim_StandingWheelieBackWheelEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(17, 4, { hFlip: true }),
  ANIMCMD_FRAME(2, 4, { hFlip: true }),
  ANIMCMD_END,
];

export const sAnim_StandingWheelieFrontWheelSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(11, 4),
  ANIMCMD_FRAME(0, 4),
  ANIMCMD_END,
];

export const sAnim_StandingWheelieFrontWheelNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(15, 4),
  ANIMCMD_FRAME(1, 4),
  ANIMCMD_END,
];

export const sAnim_StandingWheelieFrontWheelWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(19, 4),
  ANIMCMD_FRAME(2, 4),
  ANIMCMD_END,
];

export const sAnim_StandingWheelieFrontWheelEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(19, 4, { hFlip: true }),
  ANIMCMD_FRAME(2, 4, { hFlip: true }),
  ANIMCMD_END,
];

export const sAnim_MovingWheelieSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(21, 4),
  ANIMCMD_FRAME(10, 4),
  ANIMCMD_FRAME(22, 4),
  ANIMCMD_FRAME(10, 4),
  ANIMCMD_JUMP(0),
];

export const sAnim_MovingWheelieNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(23, 4),
  ANIMCMD_FRAME(14, 4),
  ANIMCMD_FRAME(24, 4),
  ANIMCMD_FRAME(14, 4),
  ANIMCMD_JUMP(0),
];

export const sAnim_MovingWheelieWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(25, 4),
  ANIMCMD_FRAME(18, 4),
  ANIMCMD_FRAME(26, 4),
  ANIMCMD_FRAME(18, 4),
  ANIMCMD_JUMP(0),
];

export const sAnim_MovingWheelieEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(25, 4, { hFlip: true }),
  ANIMCMD_FRAME(18, 4, { hFlip: true }),
  ANIMCMD_FRAME(26, 4, { hFlip: true }),
  ANIMCMD_FRAME(18, 4, { hFlip: true }),
  ANIMCMD_JUMP(0),
];

export const sAnim_BerryTreeStage0: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(0, 32),
  ANIMCMD_END,
];

export const sAnim_BerryTreeStage1: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(1, 32),
  ANIMCMD_FRAME(2, 32),
  ANIMCMD_END,
];

export const sAnim_BerryTreeStage2: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(3, 48),
  ANIMCMD_FRAME(4, 48),
  ANIMCMD_END,
];

export const sAnim_BerryTreeStage3: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(5, 32),
  ANIMCMD_FRAME(5, 32),
  ANIMCMD_FRAME(6, 32),
  ANIMCMD_FRAME(6, 32),
  ANIMCMD_END,
];

export const sAnim_BerryTreeStage4: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(7, 48),
  ANIMCMD_FRAME(7, 48),
  ANIMCMD_FRAME(8, 48),
  ANIMCMD_FRAME(8, 48),
  ANIMCMD_END,
];

export const sAnim_NurseBow: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(0, 8),
  ANIMCMD_FRAME(9, 32),
  ANIMCMD_FRAME(0, 8),
  ANIMCMD_END,
];

export const sAnim_RockBreak: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(0, 8),
  ANIMCMD_FRAME(1, 8),
  ANIMCMD_FRAME(2, 8),
  ANIMCMD_FRAME(3, 8),
  ANIMCMD_END,
];

export const sAnim_TreeCut: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(0, 6),
  ANIMCMD_FRAME(1, 6),
  ANIMCMD_FRAME(2, 6),
  ANIMCMD_FRAME(3, 6),
  ANIMCMD_END,
];

export const sAnim_TakeOutRodSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(8, 4),
  ANIMCMD_FRAME(9, 4),
  ANIMCMD_FRAME(10, 4),
  ANIMCMD_FRAME(11, 4),
  ANIMCMD_END,
];

export const sAnim_TakeOutRodNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(4, 4),
  ANIMCMD_FRAME(5, 4),
  ANIMCMD_FRAME(6, 4),
  ANIMCMD_FRAME(7, 4),
  ANIMCMD_END,
];

export const sAnim_TakeOutRodWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(0, 4),
  ANIMCMD_FRAME(1, 4),
  ANIMCMD_FRAME(2, 4),
  ANIMCMD_FRAME(3, 4),
  ANIMCMD_END,
];

export const sAnim_TakeOutRodEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(0, 4, { hFlip: true }),
  ANIMCMD_FRAME(1, 4, { hFlip: true }),
  ANIMCMD_FRAME(2, 4, { hFlip: true }),
  ANIMCMD_FRAME(3, 4, { hFlip: true }),
  ANIMCMD_END,
];

export const sAnim_PutAwayRodSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(11, 4),
  ANIMCMD_FRAME(10, 6),
  ANIMCMD_FRAME(9, 6),
  ANIMCMD_FRAME(8, 6),
  ANIMCMD_END,
];

export const sAnim_PutAwayRodNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(7, 4),
  ANIMCMD_FRAME(6, 6),
  ANIMCMD_FRAME(5, 6),
  ANIMCMD_FRAME(4, 6),
  ANIMCMD_END,
];

export const sAnim_PutAwayRodWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(3, 4),
  ANIMCMD_FRAME(2, 4),
  ANIMCMD_FRAME(1, 4),
  ANIMCMD_FRAME(0, 4),
  ANIMCMD_END,
];

export const sAnim_PutAwayRodEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(3, 4, { hFlip: true }),
  ANIMCMD_FRAME(2, 4, { hFlip: true }),
  ANIMCMD_FRAME(1, 4, { hFlip: true }),
  ANIMCMD_FRAME(0, 4, { hFlip: true }),
  ANIMCMD_END,
];

export const sAnim_HookedPokemonSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(10, 6),
  ANIMCMD_FRAME(11, 6),
  ANIMCMD_LOOP(1),
  ANIMCMD_FRAME(11, 30),
  ANIMCMD_JUMP(0),
];

export const sAnim_HookedPokemonNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(6, 6),
  ANIMCMD_FRAME(7, 6),
  ANIMCMD_LOOP(1),
  ANIMCMD_FRAME(7, 30),
  ANIMCMD_JUMP(0),
];

export const sAnim_HookedPokemonWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(2, 6),
  ANIMCMD_FRAME(3, 6),
  ANIMCMD_LOOP(1),
  ANIMCMD_FRAME(3, 30),
  ANIMCMD_JUMP(0),
];

export const sAnim_HookedPokemonEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(2, 6, { hFlip: true }),
  ANIMCMD_FRAME(3, 6, { hFlip: true }),
  ANIMCMD_LOOP(1),
  ANIMCMD_FRAME(3, 30, { hFlip: true }),
  ANIMCMD_JUMP(0),
];

// NOTE 1:1 STRICT : sAffineAnim_KyogreGroudon_* (decomp lignes 736-781) sont
// SKIPPÉS ici — gérés par autre système (affine anim handler séparé).

export const sAnim_HoOhFlapWings: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(3, 8),
  ANIMCMD_FRAME(4, 8),
  ANIMCMD_FRAME(3, 8),
  ANIMCMD_FRAME(4, 8),
  ANIMCMD_JUMP(0),
];

export const sAnim_HoOhStayStill: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(3, 16),
  ANIMCMD_JUMP(0),
];

export const sAnim_RayquazaCoiledAwake: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(1, 1),
  ANIMCMD_JUMP(0),
];

export const sAnim_RayquazaFlyUp: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(4, 1),
  ANIMCMD_JUMP(0),
];

export const sAnim_RayquazaCoiledAsleep: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(0, 1),
  ANIMCMD_JUMP(0),
];

export const sAnim_RayquazaCoiledMouthOpen: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(2, 1),
  ANIMCMD_JUMP(0),
];

export const sAnim_RayquazaNormal: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(3, 1),
  ANIMCMD_JUMP(0),
];

// Identical to sAnim_RayquazaCoiledAsleep
export const sAnim_RayquazaFaceSouth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(0, 1),
  ANIMCMD_JUMP(0),
];

// Identical to sAnim_RayquazaCoiledAsleep
export const sAnim_RayquazaFaceNorth: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(0, 1),
  ANIMCMD_JUMP(0),
];

// Identical to sAnim_RayquazaCoiledAsleep
export const sAnim_RayquazaFaceWest: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(0, 1),
  ANIMCMD_JUMP(0),
];

// Identical to sAnim_RayquazaNormal
export const sAnim_RayquazaFaceEast: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(3, 1),
  ANIMCMD_JUMP(0),
];

// ─── 15 sAnimTable_* arrays — 1:1 décomp object_event_anims.h ─────────────────
// Designated initializers `[ANIM_X] = sAnim_Y` résolus en index dense.
// Trous sparse remplis avec sAnim_StayStill (= placeholder honnête, comme C
// zero-init = NULL pointer, mais ici on garde un AnimCmd[] valide pour éviter
// les null deref côté runtime).

/** 1:1 décomp `sAnimTable_Inanimate[]` (object_event_anims.h:798-800).
 *  Dense size = 1 (ANIM_STAY_STILL=0). */
export const sAnimTable_Inanimate: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  /* [0]  ANIM_STAY_STILL */ sAnim_StayStill,
];

/** 1:1 décomp `sAnimTable_QuintyPlump[]` (object_event_anims.h:802-823).
 *  Dense size = 20 (ANIM_STD_GO_FASTEST_EAST=19 + 1). */
export const sAnimTable_QuintyPlump: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  /* [0]  ANIM_STD_FACE_SOUTH       */ sAnim_QuintyPlumpFaceSouth,
  /* [1]  ANIM_STD_FACE_NORTH       */ sAnim_QuintyPlumpFaceNorth,
  /* [2]  ANIM_STD_FACE_WEST        */ sAnim_QuintyPlumpFaceWest,
  /* [3]  ANIM_STD_FACE_EAST        */ sAnim_QuintyPlumpFaceEast,
  /* [4]  ANIM_STD_GO_SOUTH         */ sAnim_QuintyPlumpGoSouth,
  /* [5]  ANIM_STD_GO_NORTH         */ sAnim_QuintyPlumpGoNorth,
  /* [6]  ANIM_STD_GO_WEST          */ sAnim_QuintyPlumpGoWest,
  /* [7]  ANIM_STD_GO_EAST          */ sAnim_QuintyPlumpGoEast,
  /* [8]  ANIM_STD_GO_FAST_SOUTH    */ sAnim_QuintyPlumpGoFastSouth,
  /* [9]  ANIM_STD_GO_FAST_NORTH    */ sAnim_QuintyPlumpGoFastNorth,
  /* [10] ANIM_STD_GO_FAST_WEST     */ sAnim_QuintyPlumpGoFastWest,
  /* [11] ANIM_STD_GO_FAST_EAST     */ sAnim_QuintyPlumpGoFastEast,
  /* [12] ANIM_STD_GO_FASTER_SOUTH  */ sAnim_QuintyPlumpGoFasterSouth,
  /* [13] ANIM_STD_GO_FASTER_NORTH  */ sAnim_QuintyPlumpGoFasterNorth,
  /* [14] ANIM_STD_GO_FASTER_WEST   */ sAnim_QuintyPlumpGoFasterWest,
  /* [15] ANIM_STD_GO_FASTER_EAST   */ sAnim_QuintyPlumpGoFasterEast,
  /* [16] ANIM_STD_GO_FASTEST_SOUTH */ sAnim_QuintyPlumpGoFastestSouth,
  /* [17] ANIM_STD_GO_FASTEST_NORTH */ sAnim_QuintyPlumpGoFastestNorth,
  /* [18] ANIM_STD_GO_FASTEST_WEST  */ sAnim_QuintyPlumpGoFastestWest,
  /* [19] ANIM_STD_GO_FASTEST_EAST  */ sAnim_QuintyPlumpGoFastestEast,
];

/** 1:1 décomp `sAnimTable_Standard[]` (object_event_anims.h:825-846).
 *  Dense size = 20. */
export const sAnimTable_Standard: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  /* [0]  ANIM_STD_FACE_SOUTH       */ sAnim_FaceSouth,
  /* [1]  ANIM_STD_FACE_NORTH       */ sAnim_FaceNorth,
  /* [2]  ANIM_STD_FACE_WEST        */ sAnim_FaceWest,
  /* [3]  ANIM_STD_FACE_EAST        */ sAnim_FaceEast,
  /* [4]  ANIM_STD_GO_SOUTH         */ sAnim_GoSouth,
  /* [5]  ANIM_STD_GO_NORTH         */ sAnim_GoNorth,
  /* [6]  ANIM_STD_GO_WEST          */ sAnim_GoWest,
  /* [7]  ANIM_STD_GO_EAST          */ sAnim_GoEast,
  /* [8]  ANIM_STD_GO_FAST_SOUTH    */ sAnim_GoFastSouth,
  /* [9]  ANIM_STD_GO_FAST_NORTH    */ sAnim_GoFastNorth,
  /* [10] ANIM_STD_GO_FAST_WEST     */ sAnim_GoFastWest,
  /* [11] ANIM_STD_GO_FAST_EAST     */ sAnim_GoFastEast,
  /* [12] ANIM_STD_GO_FASTER_SOUTH  */ sAnim_GoFasterSouth,
  /* [13] ANIM_STD_GO_FASTER_NORTH  */ sAnim_GoFasterNorth,
  /* [14] ANIM_STD_GO_FASTER_WEST   */ sAnim_GoFasterWest,
  /* [15] ANIM_STD_GO_FASTER_EAST   */ sAnim_GoFasterEast,
  /* [16] ANIM_STD_GO_FASTEST_SOUTH */ sAnim_GoFastestSouth,
  /* [17] ANIM_STD_GO_FASTEST_NORTH */ sAnim_GoFastestNorth,
  /* [18] ANIM_STD_GO_FASTEST_WEST  */ sAnim_GoFastestWest,
  /* [19] ANIM_STD_GO_FASTEST_EAST  */ sAnim_GoFastestEast,
];

/** 1:1 décomp `sAnimTable_HoOh[]` (object_event_anims.h:848-869).
 *  Dense size = 20. ANIM_STD_GO_SOUTH/NORTH = flapwings/staystill spéciaux. */
export const sAnimTable_HoOh: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  /* [0]  ANIM_STD_FACE_SOUTH       */ sAnim_FaceSouth,
  /* [1]  ANIM_STD_FACE_NORTH       */ sAnim_FaceNorth,
  /* [2]  ANIM_STD_FACE_WEST        */ sAnim_FaceWest,
  /* [3]  ANIM_STD_FACE_EAST        */ sAnim_FaceEast,
  /* [4]  ANIM_STD_GO_SOUTH         */ sAnim_HoOhFlapWings,
  /* [5]  ANIM_STD_GO_NORTH         */ sAnim_HoOhStayStill,
  /* [6]  ANIM_STD_GO_WEST          */ sAnim_GoWest,
  /* [7]  ANIM_STD_GO_EAST          */ sAnim_GoEast,
  /* [8]  ANIM_STD_GO_FAST_SOUTH    */ sAnim_GoFastSouth,
  /* [9]  ANIM_STD_GO_FAST_NORTH    */ sAnim_GoFastNorth,
  /* [10] ANIM_STD_GO_FAST_WEST     */ sAnim_GoFastWest,
  /* [11] ANIM_STD_GO_FAST_EAST     */ sAnim_GoFastEast,
  /* [12] ANIM_STD_GO_FASTER_SOUTH  */ sAnim_GoFasterSouth,
  /* [13] ANIM_STD_GO_FASTER_NORTH  */ sAnim_GoFasterNorth,
  /* [14] ANIM_STD_GO_FASTER_WEST   */ sAnim_GoFasterWest,
  /* [15] ANIM_STD_GO_FASTER_EAST   */ sAnim_GoFasterEast,
  /* [16] ANIM_STD_GO_FASTEST_SOUTH */ sAnim_GoFastestSouth,
  /* [17] ANIM_STD_GO_FASTEST_NORTH */ sAnim_GoFastestNorth,
  /* [18] ANIM_STD_GO_FASTEST_WEST  */ sAnim_GoFastestWest,
  /* [19] ANIM_STD_GO_FASTEST_EAST  */ sAnim_GoFastestEast,
];

/** 1:1 décomp `sAnimTable_GroudonSide[]` (object_event_anims.h:872-893).
 *  Dense size = 20. Comment décomp : "The movements for going up use the
 *  animations for going right instead." (= NORTH → East frames). */
export const sAnimTable_GroudonSide: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  /* [0]  ANIM_STD_FACE_SOUTH       */ sAnim_FaceSouth,
  /* [1]  ANIM_STD_FACE_NORTH       */ sAnim_FaceNorth,
  /* [2]  ANIM_STD_FACE_WEST        */ sAnim_FaceWest,
  /* [3]  ANIM_STD_FACE_EAST        */ sAnim_FaceEast,
  /* [4]  ANIM_STD_GO_SOUTH         */ sAnim_GoSouth,
  /* [5]  ANIM_STD_GO_NORTH         */ sAnim_GoEast,
  /* [6]  ANIM_STD_GO_WEST          */ sAnim_GoWest,
  /* [7]  ANIM_STD_GO_EAST          */ sAnim_GoEast,
  /* [8]  ANIM_STD_GO_FAST_SOUTH    */ sAnim_GoFastSouth,
  /* [9]  ANIM_STD_GO_FAST_NORTH    */ sAnim_GoFastEast,
  /* [10] ANIM_STD_GO_FAST_WEST     */ sAnim_GoFastWest,
  /* [11] ANIM_STD_GO_FAST_EAST     */ sAnim_GoFastEast,
  /* [12] ANIM_STD_GO_FASTER_SOUTH  */ sAnim_GoFasterSouth,
  /* [13] ANIM_STD_GO_FASTER_NORTH  */ sAnim_GoFasterEast,
  /* [14] ANIM_STD_GO_FASTER_WEST   */ sAnim_GoFasterWest,
  /* [15] ANIM_STD_GO_FASTER_EAST   */ sAnim_GoFasterEast,
  /* [16] ANIM_STD_GO_FASTEST_SOUTH */ sAnim_GoFastestSouth,
  /* [17] ANIM_STD_GO_FASTEST_NORTH */ sAnim_GoFastestEast,
  /* [18] ANIM_STD_GO_FASTEST_WEST  */ sAnim_GoFastestWest,
  /* [19] ANIM_STD_GO_FASTEST_EAST  */ sAnim_GoFastestEast,
];

/** 1:1 décomp `sAnimTable_Rayquaza[]` (object_event_anims.h:956-977).
 *  Dense size = 20. Comment décomp : "Though they correspond to facing/walking
 *  movements, Rayquaza doesn't have equivalent images aside from flying up.
 *  Its other frames aside from the 'normal' frame are for the sequence where
 *  it awakens on Sky Pillar." */
export const sAnimTable_Rayquaza: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  /* [0]  ANIM_STD_FACE_SOUTH       */ sAnim_RayquazaFaceSouth,
  /* [1]  ANIM_STD_FACE_NORTH       */ sAnim_RayquazaFaceNorth,
  /* [2]  ANIM_STD_FACE_WEST        */ sAnim_RayquazaFaceWest,
  /* [3]  ANIM_STD_FACE_EAST        */ sAnim_RayquazaFaceEast,
  /* [4]  ANIM_STD_GO_SOUTH         */ sAnim_RayquazaCoiledAsleep,
  /* [5]  ANIM_STD_GO_NORTH         */ sAnim_RayquazaFlyUp,
  /* [6]  ANIM_STD_GO_WEST          */ sAnim_RayquazaCoiledMouthOpen,
  /* [7]  ANIM_STD_GO_EAST          */ sAnim_RayquazaNormal,
  /* [8]  ANIM_STD_GO_FAST_SOUTH    */ sAnim_RayquazaCoiledAsleep,
  /* [9]  ANIM_STD_GO_FAST_NORTH    */ sAnim_RayquazaFlyUp,
  /* [10] ANIM_STD_GO_FAST_WEST     */ sAnim_RayquazaCoiledAwake,
  /* [11] ANIM_STD_GO_FAST_EAST     */ sAnim_RayquazaNormal,
  /* [12] ANIM_STD_GO_FASTER_SOUTH  */ sAnim_RayquazaCoiledAsleep,
  /* [13] ANIM_STD_GO_FASTER_NORTH  */ sAnim_RayquazaFlyUp,
  /* [14] ANIM_STD_GO_FASTER_WEST   */ sAnim_RayquazaCoiledMouthOpen,
  /* [15] ANIM_STD_GO_FASTER_EAST   */ sAnim_RayquazaNormal,
  /* [16] ANIM_STD_GO_FASTEST_SOUTH */ sAnim_RayquazaCoiledAsleep,
  /* [17] ANIM_STD_GO_FASTEST_NORTH */ sAnim_RayquazaFlyUp,
  /* [18] ANIM_STD_GO_FASTEST_WEST  */ sAnim_RayquazaCoiledMouthOpen,
  /* [19] ANIM_STD_GO_FASTEST_EAST  */ sAnim_RayquazaNormal,
];

/** 1:1 décomp `sAnimTable_BrendanMayNormal[]` (object_event_anims.h:979-1004).
 *  Dense size = 24 (ANIM_RUN_EAST = ANIM_STD_COUNT + 3 = 23 + 1). */
export const sAnimTable_BrendanMayNormal: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  /* [0]  ANIM_STD_FACE_SOUTH       */ sAnim_FaceSouth,
  /* [1]  ANIM_STD_FACE_NORTH       */ sAnim_FaceNorth,
  /* [2]  ANIM_STD_FACE_WEST        */ sAnim_FaceWest,
  /* [3]  ANIM_STD_FACE_EAST        */ sAnim_FaceEast,
  /* [4]  ANIM_STD_GO_SOUTH         */ sAnim_GoSouth,
  /* [5]  ANIM_STD_GO_NORTH         */ sAnim_GoNorth,
  /* [6]  ANIM_STD_GO_WEST          */ sAnim_GoWest,
  /* [7]  ANIM_STD_GO_EAST          */ sAnim_GoEast,
  /* [8]  ANIM_STD_GO_FAST_SOUTH    */ sAnim_GoFastSouth,
  /* [9]  ANIM_STD_GO_FAST_NORTH    */ sAnim_GoFastNorth,
  /* [10] ANIM_STD_GO_FAST_WEST     */ sAnim_GoFastWest,
  /* [11] ANIM_STD_GO_FAST_EAST     */ sAnim_GoFastEast,
  /* [12] ANIM_STD_GO_FASTER_SOUTH  */ sAnim_GoFasterSouth,
  /* [13] ANIM_STD_GO_FASTER_NORTH  */ sAnim_GoFasterNorth,
  /* [14] ANIM_STD_GO_FASTER_WEST   */ sAnim_GoFasterWest,
  /* [15] ANIM_STD_GO_FASTER_EAST   */ sAnim_GoFasterEast,
  /* [16] ANIM_STD_GO_FASTEST_SOUTH */ sAnim_GoFastestSouth,
  /* [17] ANIM_STD_GO_FASTEST_NORTH */ sAnim_GoFastestNorth,
  /* [18] ANIM_STD_GO_FASTEST_WEST  */ sAnim_GoFastestWest,
  /* [19] ANIM_STD_GO_FASTEST_EAST  */ sAnim_GoFastestEast,
  /* [20] ANIM_RUN_SOUTH            */ sAnim_RunSouth,
  /* [21] ANIM_RUN_NORTH            */ sAnim_RunNorth,
  /* [22] ANIM_RUN_WEST             */ sAnim_RunWest,
  /* [23] ANIM_RUN_EAST             */ sAnim_RunEast,
];

/** 1:1 décomp `sAnimTable_AcroBike[]` (object_event_anims.h:1006-1047).
 *  Dense size = 40 (ANIM_MOVING_WHEELIE_EAST = ANIM_STD_COUNT + 19 = 39 + 1). */
export const sAnimTable_AcroBike: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  /* [0]  ANIM_STD_FACE_SOUTH                     */ sAnim_FaceSouth,
  /* [1]  ANIM_STD_FACE_NORTH                     */ sAnim_FaceNorth,
  /* [2]  ANIM_STD_FACE_WEST                      */ sAnim_FaceWest,
  /* [3]  ANIM_STD_FACE_EAST                      */ sAnim_FaceEast,
  /* [4]  ANIM_STD_GO_SOUTH                       */ sAnim_GoSouth,
  /* [5]  ANIM_STD_GO_NORTH                       */ sAnim_GoNorth,
  /* [6]  ANIM_STD_GO_WEST                        */ sAnim_GoWest,
  /* [7]  ANIM_STD_GO_EAST                        */ sAnim_GoEast,
  /* [8]  ANIM_STD_GO_FAST_SOUTH                  */ sAnim_GoFastSouth,
  /* [9]  ANIM_STD_GO_FAST_NORTH                  */ sAnim_GoFastNorth,
  /* [10] ANIM_STD_GO_FAST_WEST                   */ sAnim_GoFastWest,
  /* [11] ANIM_STD_GO_FAST_EAST                   */ sAnim_GoFastEast,
  /* [12] ANIM_STD_GO_FASTER_SOUTH                */ sAnim_GoFasterSouth,
  /* [13] ANIM_STD_GO_FASTER_NORTH                */ sAnim_GoFasterNorth,
  /* [14] ANIM_STD_GO_FASTER_WEST                 */ sAnim_GoFasterWest,
  /* [15] ANIM_STD_GO_FASTER_EAST                 */ sAnim_GoFasterEast,
  /* [16] ANIM_STD_GO_FASTEST_SOUTH               */ sAnim_GoFastestSouth,
  /* [17] ANIM_STD_GO_FASTEST_NORTH               */ sAnim_GoFastestNorth,
  /* [18] ANIM_STD_GO_FASTEST_WEST                */ sAnim_GoFastestWest,
  /* [19] ANIM_STD_GO_FASTEST_EAST                */ sAnim_GoFastestEast,
  /* [20] ANIM_BUNNY_HOP_BACK_WHEEL_SOUTH         */ sAnim_BunnyHopBackWheelSouth,
  /* [21] ANIM_BUNNY_HOP_BACK_WHEEL_NORTH         */ sAnim_BunnyHopBackWheelNorth,
  /* [22] ANIM_BUNNY_HOP_BACK_WHEEL_WEST          */ sAnim_BunnyHopBackWheelWest,
  /* [23] ANIM_BUNNY_HOP_BACK_WHEEL_EAST          */ sAnim_BunnyHopBackWheelEast,
  /* [24] ANIM_BUNNY_HOP_FRONT_WHEEL_SOUTH        */ sAnim_BunnyHopFrontWheelSouth,
  /* [25] ANIM_BUNNY_HOP_FRONT_WHEEL_NORTH        */ sAnim_BunnyHopFrontWheelNorth,
  /* [26] ANIM_BUNNY_HOP_FRONT_WHEEL_WEST         */ sAnim_BunnyHopFrontWheelWest,
  /* [27] ANIM_BUNNY_HOP_FRONT_WHEEL_EAST         */ sAnim_BunnyHopFrontWheelEast,
  /* [28] ANIM_STANDING_WHEELIE_BACK_WHEEL_SOUTH  */ sAnim_StandingWheelieBackWheelSouth,
  /* [29] ANIM_STANDING_WHEELIE_BACK_WHEEL_NORTH  */ sAnim_StandingWheelieBackWheelNorth,
  /* [30] ANIM_STANDING_WHEELIE_BACK_WHEEL_WEST   */ sAnim_StandingWheelieBackWheelWest,
  /* [31] ANIM_STANDING_WHEELIE_BACK_WHEEL_EAST   */ sAnim_StandingWheelieBackWheelEast,
  /* [32] ANIM_STANDING_WHEELIE_FRONT_WHEEL_SOUTH */ sAnim_StandingWheelieFrontWheelSouth,
  /* [33] ANIM_STANDING_WHEELIE_FRONT_WHEEL_NORTH */ sAnim_StandingWheelieFrontWheelNorth,
  /* [34] ANIM_STANDING_WHEELIE_FRONT_WHEEL_WEST  */ sAnim_StandingWheelieFrontWheelWest,
  /* [35] ANIM_STANDING_WHEELIE_FRONT_WHEEL_EAST  */ sAnim_StandingWheelieFrontWheelEast,
  /* [36] ANIM_MOVING_WHEELIE_SOUTH               */ sAnim_MovingWheelieSouth,
  /* [37] ANIM_MOVING_WHEELIE_NORTH               */ sAnim_MovingWheelieNorth,
  /* [38] ANIM_MOVING_WHEELIE_WEST                */ sAnim_MovingWheelieWest,
  /* [39] ANIM_MOVING_WHEELIE_EAST                */ sAnim_MovingWheelieEast,
];

/** 1:1 décomp `sAnimTable_Surfing[]` (object_event_anims.h:1049-1074).
 *  Dense size = 24 (ANIM_GET_ON_OFF_POKEMON_EAST = ANIM_STD_COUNT + 3 = 23 + 1). */
export const sAnimTable_Surfing: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  /* [0]  ANIM_STD_FACE_SOUTH         */ sAnim_FaceSouth,
  /* [1]  ANIM_STD_FACE_NORTH         */ sAnim_FaceNorth,
  /* [2]  ANIM_STD_FACE_WEST          */ sAnim_FaceWest,
  /* [3]  ANIM_STD_FACE_EAST          */ sAnim_FaceEast,
  /* [4]  ANIM_STD_GO_SOUTH           */ sAnim_GoSouth,
  /* [5]  ANIM_STD_GO_NORTH           */ sAnim_GoNorth,
  /* [6]  ANIM_STD_GO_WEST            */ sAnim_GoWest,
  /* [7]  ANIM_STD_GO_EAST            */ sAnim_GoEast,
  /* [8]  ANIM_STD_GO_FAST_SOUTH      */ sAnim_GoFastSouth,
  /* [9]  ANIM_STD_GO_FAST_NORTH      */ sAnim_GoFastNorth,
  /* [10] ANIM_STD_GO_FAST_WEST       */ sAnim_GoFastWest,
  /* [11] ANIM_STD_GO_FAST_EAST       */ sAnim_GoFastEast,
  /* [12] ANIM_STD_GO_FASTER_SOUTH    */ sAnim_GoFasterSouth,
  /* [13] ANIM_STD_GO_FASTER_NORTH    */ sAnim_GoFasterNorth,
  /* [14] ANIM_STD_GO_FASTER_WEST     */ sAnim_GoFasterWest,
  /* [15] ANIM_STD_GO_FASTER_EAST     */ sAnim_GoFasterEast,
  /* [16] ANIM_STD_GO_FASTEST_SOUTH   */ sAnim_GoFastestSouth,
  /* [17] ANIM_STD_GO_FASTEST_NORTH   */ sAnim_GoFastestNorth,
  /* [18] ANIM_STD_GO_FASTEST_WEST    */ sAnim_GoFastestWest,
  /* [19] ANIM_STD_GO_FASTEST_EAST    */ sAnim_GoFastestEast,
  /* [20] ANIM_GET_ON_OFF_POKEMON_SOUTH */ sAnim_GetOnOffSurfBlobSouth,
  /* [21] ANIM_GET_ON_OFF_POKEMON_NORTH */ sAnim_GetOnOffSurfBlobNorth,
  /* [22] ANIM_GET_ON_OFF_POKEMON_WEST  */ sAnim_GetOnOffSurfBlobWest,
  /* [23] ANIM_GET_ON_OFF_POKEMON_EAST  */ sAnim_GetOnOffSurfBlobEast,
];

/** 1:1 décomp `sAnimTable_Nurse[]` (object_event_anims.h:1076-1098).
 *  Dense size = 21 (ANIM_NURSE_BOW = ANIM_STD_COUNT + 0 = 20 + 1). */
export const sAnimTable_Nurse: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  /* [0]  ANIM_STD_FACE_SOUTH       */ sAnim_FaceSouth,
  /* [1]  ANIM_STD_FACE_NORTH       */ sAnim_FaceNorth,
  /* [2]  ANIM_STD_FACE_WEST        */ sAnim_FaceWest,
  /* [3]  ANIM_STD_FACE_EAST        */ sAnim_FaceEast,
  /* [4]  ANIM_STD_GO_SOUTH         */ sAnim_GoSouth,
  /* [5]  ANIM_STD_GO_NORTH         */ sAnim_GoNorth,
  /* [6]  ANIM_STD_GO_WEST          */ sAnim_GoWest,
  /* [7]  ANIM_STD_GO_EAST          */ sAnim_GoEast,
  /* [8]  ANIM_STD_GO_FAST_SOUTH    */ sAnim_GoFastSouth,
  /* [9]  ANIM_STD_GO_FAST_NORTH    */ sAnim_GoFastNorth,
  /* [10] ANIM_STD_GO_FAST_WEST     */ sAnim_GoFastWest,
  /* [11] ANIM_STD_GO_FAST_EAST     */ sAnim_GoFastEast,
  /* [12] ANIM_STD_GO_FASTER_SOUTH  */ sAnim_GoFasterSouth,
  /* [13] ANIM_STD_GO_FASTER_NORTH  */ sAnim_GoFasterNorth,
  /* [14] ANIM_STD_GO_FASTER_WEST   */ sAnim_GoFasterWest,
  /* [15] ANIM_STD_GO_FASTER_EAST   */ sAnim_GoFasterEast,
  /* [16] ANIM_STD_GO_FASTEST_SOUTH */ sAnim_GoFastestSouth,
  /* [17] ANIM_STD_GO_FASTEST_NORTH */ sAnim_GoFastestNorth,
  /* [18] ANIM_STD_GO_FASTEST_WEST  */ sAnim_GoFastestWest,
  /* [19] ANIM_STD_GO_FASTEST_EAST  */ sAnim_GoFastestEast,
  /* [20] ANIM_NURSE_BOW            */ sAnim_NurseBow,
];

/** 1:1 décomp `sAnimTable_FieldMove[]` (object_event_anims.h:1100-1102).
 *  Dense size = 1 (ANIM_FIELD_MOVE = 0). */
export const sAnimTable_FieldMove: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  /* [0] ANIM_FIELD_MOVE */ sAnim_FieldMove,
];

/** 1:1 décomp `sAnimTable_BerryTree[]` (object_event_anims.h:1104-1110).
 *  Dense size = 5 (BERRY_STAGE_BERRIES - 1 = 5 - 1 = 4 + 1).
 *  NOTE : indices = `[BERRY_STAGE_X - 1]`, donc [0..4]. */
export const sAnimTable_BerryTree: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  /* [0] BERRY_STAGE_PLANTED   - 1 */ sAnim_BerryTreeStage0,
  /* [1] BERRY_STAGE_SPROUTED  - 1 */ sAnim_BerryTreeStage1,
  /* [2] BERRY_STAGE_TALLER    - 1 */ sAnim_BerryTreeStage2,
  /* [3] BERRY_STAGE_FLOWERING - 1 */ sAnim_BerryTreeStage3,
  /* [4] BERRY_STAGE_BERRIES   - 1 */ sAnim_BerryTreeStage4,
];

/** 1:1 décomp `sAnimTable_BreakableRock[]` (object_event_anims.h:1112-1115).
 *  Dense size = 2 (ANIM_REMOVE_OBSTACLE = 1 + 1). */
export const sAnimTable_BreakableRock: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  /* [0] ANIM_STAY_STILL      */ sAnim_StayStill,
  /* [1] ANIM_REMOVE_OBSTACLE */ sAnim_RockBreak,
];

/** 1:1 décomp `sAnimTable_CuttableTree[]` (object_event_anims.h:1117-1120).
 *  Dense size = 2 (ANIM_REMOVE_OBSTACLE = 1 + 1). */
export const sAnimTable_CuttableTree: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  /* [0] ANIM_STAY_STILL      */ sAnim_StayStill,
  /* [1] ANIM_REMOVE_OBSTACLE */ sAnim_TreeCut,
];

/** 1:1 décomp `sAnimTable_Fishing[]` (object_event_anims.h:1122-1135).
 *  Dense size = 12 (ANIM_HOOKED_POKEMON_EAST = 11 + 1). */
export const sAnimTable_Fishing: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  /* [0]  ANIM_TAKE_OUT_ROD_SOUTH    */ sAnim_TakeOutRodSouth,
  /* [1]  ANIM_TAKE_OUT_ROD_NORTH    */ sAnim_TakeOutRodNorth,
  /* [2]  ANIM_TAKE_OUT_ROD_WEST     */ sAnim_TakeOutRodWest,
  /* [3]  ANIM_TAKE_OUT_ROD_EAST     */ sAnim_TakeOutRodEast,
  /* [4]  ANIM_PUT_AWAY_ROD_SOUTH    */ sAnim_PutAwayRodSouth,
  /* [5]  ANIM_PUT_AWAY_ROD_NORTH    */ sAnim_PutAwayRodNorth,
  /* [6]  ANIM_PUT_AWAY_ROD_WEST     */ sAnim_PutAwayRodWest,
  /* [7]  ANIM_PUT_AWAY_ROD_EAST     */ sAnim_PutAwayRodEast,
  /* [8]  ANIM_HOOKED_POKEMON_SOUTH  */ sAnim_HookedPokemonSouth,
  /* [9]  ANIM_HOOKED_POKEMON_NORTH  */ sAnim_HookedPokemonNorth,
  /* [10] ANIM_HOOKED_POKEMON_WEST   */ sAnim_HookedPokemonWest,
  /* [11] ANIM_HOOKED_POKEMON_EAST   */ sAnim_HookedPokemonEast,
];

// NOTE 1:1 STRICT : sAffineAnimTable_KyogreGroudon (decomp lignes 1137-1144) est
// SKIPPÉ ici — gérés par autre système (affine anim handler séparé).

// ─── struct StepAnimTable 1:1 décomp event_object_movement.h:80-84 ────────────
/**
 * struct StepAnimTable {
 *     const union AnimCmd *const *anims;
 *     u8 animPos[4];
 * };
 *
 * Utilisé par event_object_movement.c:4570 GetStepAnimTable pour mapper anim →
 * step positions ([1, 3, 0, 2] standard pour anims alternantes left/right).
 */
export interface StepAnimTable {
  readonly anims: ReadonlyArray<ReadonlyArray<AnimCmd>>;
  readonly animPos: readonly [number, number, number, number];
}

/** 1:1 décomp `sStepAnimTables[]` (object_event_anims.h:1146-1177).
 *  Sentinelle {} finale décomp (anims == NULL) = boucle d'arrêt côté décomp ;
 *  port TS : la longueur du tableau suffit, la sentinelle est implicite. */
export const sStepAnimTables: ReadonlyArray<StepAnimTable> = [
  {
    anims: sAnimTable_QuintyPlump,
    animPos: [1, 3, 0, 2],
  },
  {
    anims: sAnimTable_Standard,
    animPos: [1, 3, 0, 2],
  },
  {
    anims: sAnimTable_BrendanMayNormal,
    animPos: [1, 3, 0, 2],
  },
  {
    anims: sAnimTable_AcroBike,
    animPos: [1, 3, 0, 2],
  },
  {
    anims: sAnimTable_Surfing,
    animPos: [1, 3, 0, 2],
  },
  {
    anims: sAnimTable_Nurse,
    animPos: [1, 3, 0, 2],
  },
  {
    anims: sAnimTable_Fishing,
    animPos: [1, 3, 0, 2],
  },
];
