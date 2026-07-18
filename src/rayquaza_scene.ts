/**
 * rayquaza_scene.ts — port 1:1 STRICT du décomp `src/rayquaza_scene.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/rayquaza_scene.c` (3191 lignes, 72 fns).
 *
 * Cinématique du climax de Sootopolis : Rayquaza descend régler le combat Groudon vs Kyogre.
 * 5 scènes (RAY_ANIM_*) + une version courte de la 1re (RAY_ANIM_DUO_FIGHT_PRE) jouée à l'arrivée
 * du joueur avant d'avoir réveillé Rayquaza. Écran custom (CB2 dédié).
 *
 * ── ÉTAT : TRANSCRIPTION INERTE (lot L, plan finir-le-solo B1.2) ──
 *  Le fichier est transcrit COMPLET mais NON CÂBLÉ : `Script_DoRayquazaScene` reste no-op dans
 *  specials-registry. Rien n'appelle `DoRayquazaScene` → zéro effet runtime (tsc vert, boot sain).
 *  Le câblage (Script_DoRayquazaScene → DoRayquazaScene(0|1,…) + reprise script) ira au lot suivant.
 *
 * ── Adaptations moteur (toutes citées, cf. [[hardware-non-1to1-exemptions]]) ──
 *  - ASSETS : le décomp lit la ROM sync (LZ77UnCompVram/Wram). Nous fetchons les PNG/.bin/.pal async
 *    → `preloadRayquazaSceneAssets()` (pattern preloadHallOfFameAssets) remplit `assetCache` (clés =
 *    noms des symboles décomp) + lie les vars gfx/tilemap de fond. Chaque chargement a un garde-fou
 *    HURLANT (console.error) et ne fige JAMAIS (asset absent → rendu dégradé).
 *  - SPRITES : modèle PLAT (sprite.ts:28-32) — `sprite->oam.objMode/affineMode` → champs plats
 *    `sprite.objMode/affineMode` ; `sprite->oam.priority` → `_oam(sprite).priority` (= gba.oam slot,
 *    pattern hall_of_fame `_oam`). CompressedSpriteSheet/Palette : `data` = clé assetCache (string),
 *    pattern battle_anim_* (`{ data: 'gAnimGfx_X', size, tag }`).
 *  - KERNEL sans foyer exporté (SetVBlankHBlankCallbacksToNull, DoScheduledBgTilemapCopiesToVram,
 *    LZDecompressWram, CpuFastFill16/Copy, LoadCompressedSpritePalette, SetHBlankCallback) : wrappers
 *    LOCAUX cités (précédents : region_map.ts DoScheduledBgTilemapCopiesToVram no-op, pokenav_*_gfx
 *    AFFINEANIMCMD locaux). REG_BLDALPHA/REG_BG1HOFS = écritures registre → SetGpuReg(REG_OFFSET_*).
 */

import {
  getRuntime, assetCache, SpriteCallbackDummy, FindTaskIdByFunc,
  LoadCompressedSpriteSheet, LoadSpritePalette, EnableInterrupts, InitSpriteAffineAnim, ResetTasks,
  BlendPalettes, CpuFill16, LoadOam, ProcessSpriteCopyRequests,
  ResetPaletteFade, TransferPlttBuffer, RunTasks,
} from '../harness/runtime/decomp-globals';
import {
  RGB_BLACK, RGB_WHITE, RGB_WHITEALPHA, ST_OAM_OBJ_NORMAL, ST_OAM_OBJ_BLEND,
  ST_OAM_4BPP, SetGpuRegBits, ClearGpuRegBits, BLDALPHA_BLEND,
} from '../harness/runtime/decomp-helpers';
import {
  BLDCNT_EFFECT_BLEND, BLDCNT_TGT1_BG0, BLDCNT_TGT1_BG2, BLDCNT_TGT1_OBJ,
  BLDCNT_TGT2_BG1, BLDCNT_TGT2_BG2, BLDCNT_TGT2_BG3, BLDCNT_TGT2_OBJ,
} from '../harness/runtime/decomp-runtime';
import type { DecompSprite } from '../harness/runtime/decomp-runtime';
import {
  MUS_RAYQUAZA_APPEARS, SE_DOWNPOUR, SE_DOWNPOUR_STOP, SE_INTRO_BLAST,
  SE_MUGSHOT, SE_M_WHIRLPOOL, SE_SLIDING_DOOR, SE_THUNDER,
} from '../include/constants/songs';
import { SPECIES_RAYQUAZA } from '../include/constants/species';
import { BG_SCREEN_SIZE, DISPLAY_HEIGHT, DISPLAY_WIDTH } from '../include/gba/defines';
import {
  DISPCNT_BG2_ON, DISPCNT_OBJ_1D_MAP, DISPCNT_OBJ_ON, DISPCNT_WIN0_ON,
  REG_OFFSET_BLDALPHA, REG_OFFSET_BLDCNT, REG_OFFSET_DISPCNT, REG_OFFSET_VCOUNT,
  REG_OFFSET_WIN0H, REG_OFFSET_WIN0V, REG_OFFSET_WININ, REG_OFFSET_WINOUT,
  REG_OFFSET_BG1HOFS,
} from '../include/gba/io_reg';
import { ST_OAM_AFFINE_DOUBLE, ST_OAM_AFFINE_OFF } from '../include/sprite';
import { GetGpuReg, SetGpuReg } from './gpu_regs';
import { SetMainCallback2, SetVBlankCallback } from './main';
import {
  BG_PLTT_ID, BeginNormalPaletteFade, BlendPalettesGradually, FillPalette,
  LoadCompressedPalette, PALETTES_ALL, PALETTES_BG, PALETTES_OBJECTS,
  UpdatePaletteFade, gPaletteFade, gPlttBufferFaded, gPlttBufferUnfaded,
} from './palette';
import { Random } from './random';
import {
  SCANLINE_EFFECT_DMACNT_16BIT, ScanlineEffect_Clear, ScanlineEffect_InitHBlankDmaTransfer,
  ScanlineEffect_SetParams, ScanlineEffect_Stop, gScanlineEffectRegBuffers,
  type ScanlineEffectParams,
} from './scanline_effect';
import { PlayCry_Normal, PlayNewMapMusic, PlaySE, StopMapMusic } from './sound';
import {
  ANIMCMD_END, ANIMCMD_FRAME, ANIMCMD_JUMP, AnimateSprites, BuildOamBuffer,
  CreateSprite, FreeAllSpritePalettes, PLTT_SIZE_4BPP,
  ResetSpriteData, StartSpriteAnim as _StartSpriteAnim, gDummySpriteAffineAnimTable, gSprites,
} from './sprite';

// StartSpriteAnim : wrapper local (DecompSprite.anims est `unknown[][]` vs AnimDispatchSprite
// `AnimCmd[][]` → cast `as never`, pattern hall_of_fame.ts:902). Garde tous les call-sites 1:1.
function StartSpriteAnim(sprite: DecompSprite, animNum: number): void {
  _StartSpriteAnim(sprite as never, animNum);
}
import { CreateTask, DestroyTask, gTasks } from './task';
import {
  ChangeBgX, ChangeBgY, ClearScheduledBgCopiesToVram, GetBgTilemapBuffer, GetBgY, InitBgsFromTemplates,
  ResetAllBgsCoordinates, ResetBgsAndClearDma3BusyFlags, ResetTempTileDataBuffers,
  ResetVramOamAndBgCntRegs, ScheduleBgCopyTilemapToVram, SetBgAffine,
  SetBgTilemapBuffer as _SetBgTilemapBuffer, ShowBg,
} from './window';

// ─── SetBgTilemapBuffer : ALIAS buffer↔vue VRAM (adaptation moteur CENTRALE) ──────────
// Le compositor lit la VUE VRAM persistante `GetBgTilemapBuffer(bg)`, PAS le buffer WRAM
// détaché passé ici (window.ts:1474-1481 : `SetBgTilemapBuffer` = no-op copie ; « conditions/
// credits n'affichent pas leur buffer tant qu'il n'est pas re-câblé »). On re-pointe donc le
// slot `sRayScene.tilemapBuffers[bg]` VERS la vue du moteur, pour que les LZDecompressWram/
// CpuFastFill16/CpuFastCopy suivants écrivent le tilemap RÉELLEMENT lu à l'écran.
// Précédent 1:1 : easy_chat.ts:796-804 (alias sScreenControl.bgXTilemapBuffer = GetBgTilemapBuffer).
// (Tous les call-sites de la scène passent `tilemapBuffers[bg]` avec bg == index → alias direct.)
function SetBgTilemapBuffer(bg: number, buffer: TilemapBuffer): void {
  _SetBgTilemapBuffer(bg, buffer);
  if (sRayScene) sRayScene.tilemapBuffers[bg] = GetBgTilemapBuffer(bg);
}
import { DecompressAndCopyTileDataToVram, FreeTempTileDataBuffersIfPossible } from './pokenav_main_menu';

// ─── Constantes décomp non encore consolidées dans include/ (inlinées, citées) ───
const WININ_WIN0_ALL = 0x3F;       // 1:1 include/gba/io_reg.h (WININ_WIN0_BG_ALL|OBJ|CLR)
const WINOUT_WIN01_ALL = 0x3F;     // 1:1 include/gba/io_reg.h (WINOUT_WIN01_*)
const BG_COORD_SET = 0;            // 1:1 include/bg.h
const BG_COORD_ADD = 1;            // 1:1 include/bg.h
const BG_COORD_SUB = 2;            // 1:1 include/bg.h
const INTR_FLAG_VBLANK = 1 << 0;   // 1:1 include/gba/io_reg.h
const INTR_FLAG_HBLANK = 1 << 1;   // 1:1 include/gba/io_reg.h

// ─── WININ/WIN0 helper (1:1 include/gba/io_reg.h WIN_RANGE(a,b) = ((a)<<8)|(b)) ───
const WIN_RANGE = (a: number, b: number): number => ((a) << 8) | (b);

// ─── AFFINEANIMCMD builders locaux (1:1 include/sprite.h — pas de foyer exporté, ─────
//     précédent : pokenav_menu_handler_gfx.ts). ───────────────────────────────────────
const AFFINEANIMCMD_FRAME = (xScale: number, yScale: number, rotation: number, duration: number) =>
  ({ frame: { xScale, yScale, rotation, duration } });
const AFFINEANIMCMD_JUMP = (target: number) => ({ jump: target });

// ─── _oam : slot gba.oam[oamIndex] (1:1 `sprite->oam.priority`, pattern hall_of_fame._oam). ───
function _oam(sprite: DecompSprite | undefined): { priority: number; objMode: number; affineMode: number } {
  return getRuntime().gba.oam[sprite!.oamIndex] as unknown as { priority: number; objMode: number; affineMode: number };
}

// ─── Wrappers kernel LOCAUX (pas de foyer exporté ; adaptations citées) ─────────────
/** 1:1 `SetVBlankHBlankCallbacksToNull` (intr_main) — coupe VBlank + HBlank. */
function SetVBlankHBlankCallbacksToNull(): void {
  SetVBlankCallback(null);
  SetHBlankCallback(null);
}
/** 1:1 `SetHBlankCallback` (m4a/intr) — HBlank stub côté engine (gba-global-scope, no-op). */
function SetHBlankCallback(cb: (() => void) | null): void {
  (getRuntime() as unknown as { SetHBlankCallback?: (cb: (() => void) | null) => void }).SetHBlankCallback?.(cb);
}
/** 1:1 bg.c `DoScheduledBgTilemapCopiesToVram` — uploads synchrones chez nous → no-op
 *  (précédent : region_map.ts / starter_choose.ts, même adaptation). */
function DoScheduledBgTilemapCopiesToVram(): void { /* no-op — copies tilemap synchrones */ }
/** 1:1 `LZDecompressWram(src, dest)` (LZ77UnCompWram) — la ROM décompresse ; nos assets sont
 *  déjà décompressés (préload PNG/.bin) → copie directe dans le tampon tilemap. */
function LZDecompressWram(src: Uint16Array | null, dest: Uint16Array): void {
  if (!src) { console.error('[rayquaza_scene] LZDecompressWram : source tilemap absente (préload KO) — fond dégradé.'); return; }
  dest.set(src.subarray(0, Math.min(src.length, dest.length)));
}
/** 1:1 `CpuFastFill16(value, dest, sizeBytes)` (fast DMA fill 16-bit). */
function CpuFastFill16(value: number, dest: Uint16Array, sizeBytes: number): void {
  CpuFill16(value, dest, sizeBytes);
}
/** 1:1 `CpuFastCopy(src, dest, sizeBytes)` (fast DMA copy). */
function CpuFastCopy(src: Uint16Array, dest: Uint16Array, sizeBytes: number): void {
  dest.set(src.subarray(0, Math.min(src.length, sizeBytes >> 1)));
}
/** 1:1 `LoadCompressedSpritePalette(&pal)` — palette sprite taguée. Nos assets sont préchargés
 *  DÉCOMPRESSÉS (PNG PLTE → assetCache par clé string `pal.data`), donc la variante « Compressed »
 *  ≡ LoadSpritePalette, qui résout la clé et charge la palette dans le slot OBJ alloué au tag.
 *  (Précédent identique pour des assets préchargés : item_menu.ts:460, money.ts:210,
 *   battle_gfx_sfx_util.ts:225 — décomp `LoadCompressedSpritePalette` → `LoadSpritePalette`.) */
function LoadCompressedSpritePalette(pal: { data: string; tag: number }): void {
  LoadSpritePalette(pal);
}

// ═══════════════════════════════════════════════════════════════════════════════════
//  ASSETS de fond liés par preloadRayquazaSceneAssets (null tant que non préchargés).
//  Les sprite-sheets/palettes + palettes BG sont référencés par CLÉ string (assetCache).
// ═══════════════════════════════════════════════════════════════════════════════════
// BG gfx (Uint8Array — arg de DecompressAndCopyTileDataToVram)
let gRaySceneDuoFight_Clouds_Gfx: Uint8Array | null = null;
let gRaySceneTakesFlight_Bg_Gfx: Uint8Array | null = null;
let gRaySceneTakesFlight_Rayquaza_Gfx: Uint8Array | null = null;
let gRaySceneDescends_Light_Gfx: Uint8Array | null = null;
let gRaySceneDescends_Bg_Gfx: Uint8Array | null = null;
let gRaySceneCharges_Rayquaza_Gfx: Uint8Array | null = null;
let gRaySceneCharges_Streaks_Gfx: Uint8Array | null = null;
let gRaySceneCharges_Bg_Gfx: Uint8Array | null = null;
let gRaySceneChasesAway_Ring_Gfx: Uint8Array | null = null;
let gRaySceneChasesAway_Light_Gfx: Uint8Array | null = null;
// Tilemaps (Uint16Array — arg de LZDecompressWram)
let gRaySceneDuoFight_Clouds1_Tilemap: Uint16Array | null = null;
let gRaySceneDuoFight_Clouds2_Tilemap: Uint16Array | null = null;
let gRaySceneDuoFight_Clouds3_Tilemap: Uint16Array | null = null;
let gRaySceneTakesFlight_Bg_Tilemap: Uint16Array | null = null;
let gRaySceneTakesFlight_Rayquaza_Tilemap: Uint16Array | null = null;
let gRaySceneDescends_Light_Tilemap: Uint16Array | null = null;
let gRaySceneDescends_Bg_Tilemap: Uint16Array | null = null;
let gRaySceneCharges_Orbs_Tilemap: Uint16Array | null = null;
let gRaySceneCharges_Rayquaza_Tilemap: Uint16Array | null = null;
let gRaySceneCharges_Streaks_Tilemap: Uint16Array | null = null;
let gRaySceneCharges_Bg_Tilemap: Uint16Array | null = null;
let gRaySceneChasesAway_Bg_Tilemap: Uint16Array | null = null;
let gRaySceneChasesAway_Light_Tilemap: Uint16Array | null = null;
let gRaySceneChasesAway_Ring_Tilemap: Uint16Array | null = null;

/*
    This file handles the cutscene showing Rayquaza arriving to settle the Groudon/Kyogre fight
    It consists of 5 separate scenes:
    - Groudon and Kyogre facing one another in a thunderstorm             (RAY_ANIM_DUO_FIGHT)
    - Over-the-shoulder of Rayquaza flying                                (RAY_ANIM_TAKES_FLIGHT)
    - Rayquaza emerging from a spotlight down through the clouds          (RAY_ANIM_DESCENDS)
    - A close-up of Rayquaza flying down                                  (RAY_ANIM_CHARGES)
    - Rayquaza floating above Groudon/Kyogre as they back away offscreen  (RAY_ANIM_CHASES_AWAY)

    A shortened version of the first scene is used when the player first arrives
    in Sootopolis during the Groudon/Kyogre conflict, before awakening Rayquaza (RAY_ANIM_DUO_FIGHT_PRE)
    This is indicated with the first two arguments to DoRayquazaScene
*/

// enum (rayquaza_scene.c:33)
const RAY_ANIM_DUO_FIGHT_PRE = 0;
const RAY_ANIM_DUO_FIGHT = 1;
const RAY_ANIM_TAKES_FLIGHT = 2;
const RAY_ANIM_DESCENDS = 3;
const RAY_ANIM_CHARGES = 4;
const RAY_ANIM_CHASES_AWAY = 5;
const RAY_ANIM_END = 6;

const TAG_DUOFIGHT_GROUDON = 30505;
const TAG_DUOFIGHT_GROUDON_SHOULDER = 30506;
const TAG_DUOFIGHT_GROUDON_CLAW = 30507;
const TAG_DUOFIGHT_KYOGRE = 30508;
const TAG_DUOFIGHT_KYOGRE_PECTORAL_FIN = 30509;
const TAG_DUOFIGHT_KYOGRE_DORSAL_FIN = 30510;
const TAG_FLIGHT_SMOKE = 30555;
const TAG_DESCENDS_RAYQUAZA = 30556;
const TAG_DESCENDS_RAYQUAZA_TAIL = 30557;
const TAG_CHASE_GROUDON = 30565;
const TAG_CHASE_GROUDON_TAIL = 30566;
const TAG_CHASE_KYOGRE = 30568;
const TAG_CHASE_RAYQUAZA = 30569;
const TAG_CHASE_RAYQUAZA_TAIL = 30570;
const TAG_CHASE_SPLASH = 30571;

const MAX_SMOKE = 10;

// typedef u8 ALIGNED(4) TilemapBuffer[BG_SCREEN_SIZE] — modélisé Uint16Array (entrées tilemap 16-bit).
type TilemapBuffer = Uint16Array;

/** 1:1 `struct RayquazaScene` (rayquaza_scene.c:64). */
interface RayquazaScene {
  exitCallback: (() => void) | null;
  tilemapBuffers: TilemapBuffer[]; // [4]
  unk: number;                     // never read
  animId: number;
  endEarly: boolean;
  revealedLightLine: number;
  revealedLightTimer: number;
  unused: Uint8Array;              // [12]
}

/** 1:1 `static EWRAM_DATA struct RayquazaScene *sRayScene = NULL` (rayquaza_scene.c:76). */
let sRayScene: RayquazaScene | null = null;

/** 1:1 `sTasksForAnimations[]` (rayquaza_scene.c:142) — raw task funcs (taskId). */
const sTasksForAnimations: Array<(taskId: number) => void> = [
  Task_DuoFightAnim,        // [RAY_ANIM_DUO_FIGHT_PRE]
  Task_DuoFightAnim,        // [RAY_ANIM_DUO_FIGHT]
  Task_RayTakesFlightAnim,  // [RAY_ANIM_TAKES_FLIGHT]
  Task_RayDescendsAnim,     // [RAY_ANIM_DESCENDS]
  Task_RayChargesAnim,      // [RAY_ANIM_CHARGES]
  Task_RayChasesAwayAnim,   // [RAY_ANIM_CHASES_AWAY]
  Task_EndAfterFadeScreen,  // [RAY_ANIM_END]
];

// ─── OamData templates (rayquaza_scene.c:153-287) ────────────────────────────────────
const sOam_64x64 = { y: 0, affineMode: ST_OAM_AFFINE_OFF, objMode: ST_OAM_OBJ_NORMAL, mosaic: 0, bpp: ST_OAM_4BPP, shape: 0, x: 0, matrixNum: 0, size: 3, tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 };
const sOam_32x32 = { y: 0, affineMode: ST_OAM_AFFINE_OFF, objMode: ST_OAM_OBJ_NORMAL, mosaic: 0, bpp: ST_OAM_4BPP, shape: 0, x: 0, matrixNum: 0, size: 2, tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 };
const sOam_64x32 = { y: 0, affineMode: ST_OAM_AFFINE_OFF, objMode: ST_OAM_OBJ_NORMAL, mosaic: 0, bpp: ST_OAM_4BPP, shape: 1, x: 0, matrixNum: 0, size: 3, tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 };
const sOam_32x16 = { y: 0, affineMode: ST_OAM_AFFINE_OFF, objMode: ST_OAM_OBJ_NORMAL, mosaic: 0, bpp: ST_OAM_4BPP, shape: 1, x: 0, matrixNum: 0, size: 2, tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 };
const sOam_16x8  = { y: 0, affineMode: ST_OAM_AFFINE_OFF, objMode: ST_OAM_OBJ_NORMAL, mosaic: 0, bpp: ST_OAM_4BPP, shape: 1, x: 0, matrixNum: 0, size: 0, tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 };
const sOam_16x32 = { y: 0, affineMode: ST_OAM_AFFINE_OFF, objMode: ST_OAM_OBJ_NORMAL, mosaic: 0, bpp: ST_OAM_4BPP, shape: 2, x: 0, matrixNum: 0, size: 2, tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 };
const sOam_16x16 = { y: 0, affineMode: ST_OAM_AFFINE_OFF, objMode: ST_OAM_OBJ_NORMAL, mosaic: 0, bpp: ST_OAM_4BPP, shape: 0, x: 0, matrixNum: 0, size: 1, tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 };
const sOam_32x8  = { y: 0, affineMode: ST_OAM_AFFINE_OFF, objMode: ST_OAM_OBJ_NORMAL, mosaic: 0, bpp: ST_OAM_4BPP, shape: 1, x: 0, matrixNum: 0, size: 1, tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 };

// ─── DUO_FIGHT_PRE : anims + templates (rayquaza_scene.c:289-490) ────────────────────
const sAnim_DuoFightPre_Groudon_Head = [ANIMCMD_FRAME(0, 30), ANIMCMD_FRAME(64, 30), ANIMCMD_FRAME(128, 30), ANIMCMD_FRAME(64, 30), ANIMCMD_JUMP(0)];
const sAnim_DuoFightPre_Groudon_Body = [ANIMCMD_FRAME(192, 30), ANIMCMD_FRAME(256, 30), ANIMCMD_FRAME(320, 30), ANIMCMD_FRAME(256, 30), ANIMCMD_JUMP(0)];
const sAnims_DuoFightPre_Groudon = [sAnim_DuoFightPre_Groudon_Head, sAnim_DuoFightPre_Groudon_Body];
const sSpriteTemplate_DuoFightPre_Groudon = { tileTag: TAG_DUOFIGHT_GROUDON, paletteTag: TAG_DUOFIGHT_GROUDON, oam: sOam_64x64, anims: sAnims_DuoFightPre_Groudon, images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCallbackDummy };

const sAnim_DuoFightPre_GroudonShoulderKyogreDorsalFin = [ANIMCMD_FRAME(0, 1), ANIMCMD_END];
const sAnims_DuoFightPre_GroudonShoulderKyogreDorsalFin = [sAnim_DuoFightPre_GroudonShoulderKyogreDorsalFin];
const sSpriteTemplate_DuoFightPre_GroudonShoulder = { tileTag: TAG_DUOFIGHT_GROUDON_SHOULDER, paletteTag: TAG_DUOFIGHT_GROUDON, oam: sOam_32x32, anims: sAnims_DuoFightPre_GroudonShoulderKyogreDorsalFin, images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCallbackDummy };

const sAnim_DuoFightPre_GroudonClaw = [ANIMCMD_FRAME(0, 1), ANIMCMD_END];
const sAnims_DuoFightPre_GroudonClaw = [sAnim_DuoFightPre_GroudonClaw];
const sSpriteTemplate_DuoFightPre_GroudonClaw = { tileTag: TAG_DUOFIGHT_GROUDON_CLAW, paletteTag: TAG_DUOFIGHT_GROUDON, oam: sOam_64x32, anims: sAnims_DuoFightPre_GroudonClaw, images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCallbackDummy };

const sAnim_DuoFightPre_Kyogre_TopLeft = [ANIMCMD_FRAME(0, 1), ANIMCMD_END];
const sAnim_DuoFightPre_Kyogre_TopRight = [ANIMCMD_FRAME(8, 1), ANIMCMD_END];
const sAnim_DuoFightPre_Kyogre_FaceLeft = [ANIMCMD_FRAME(16, 1), ANIMCMD_END];
const sAnim_DuoFightPre_Kyogre_FaceRight = [ANIMCMD_FRAME(24, 1), ANIMCMD_END];
const sAnim_DuoFightPre_Kyogre_ChinLeft = [ANIMCMD_FRAME(32, 1), ANIMCMD_END];
const sAnim_DuoFightPre_Kyogre_ChinRight = [ANIMCMD_FRAME(40, 1), ANIMCMD_END];
const sAnim_DuoFightPre_Kyogre_LeftPectoralFin = [ANIMCMD_FRAME(48, 36), ANIMCMD_FRAME(64, 36), ANIMCMD_FRAME(80, 36), ANIMCMD_FRAME(64, 36), ANIMCMD_JUMP(0)];
const sAnim_DuoFightPre_Kyogre_LeftShoulder = [ANIMCMD_FRAME(56, 36), ANIMCMD_FRAME(72, 36), ANIMCMD_FRAME(88, 36), ANIMCMD_FRAME(72, 36), ANIMCMD_JUMP(0)];
const sAnim_DuoFightPre_Kyogre_RightShoulder = [ANIMCMD_FRAME(96, 36), ANIMCMD_FRAME(104, 36), ANIMCMD_FRAME(112, 36), ANIMCMD_FRAME(104, 36), ANIMCMD_JUMP(0)];
const sAnims_DuoFightPre_Kyogre = [
  sAnim_DuoFightPre_Kyogre_TopLeft, sAnim_DuoFightPre_Kyogre_TopRight,
  sAnim_DuoFightPre_Kyogre_FaceLeft, sAnim_DuoFightPre_Kyogre_FaceRight,
  sAnim_DuoFightPre_Kyogre_ChinLeft, sAnim_DuoFightPre_Kyogre_ChinRight,
  sAnim_DuoFightPre_Kyogre_LeftPectoralFin, sAnim_DuoFightPre_Kyogre_LeftShoulder,
  sAnim_DuoFightPre_Kyogre_RightShoulder,
];
const sSpriteTemplate_DuoFightPre_Kyogre = { tileTag: TAG_DUOFIGHT_KYOGRE, paletteTag: TAG_DUOFIGHT_KYOGRE, oam: sOam_32x16, anims: sAnims_DuoFightPre_Kyogre, images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCallbackDummy };

const sAnim_DuoFightPre_KyogrePectoralFin = [ANIMCMD_FRAME(0, 36), ANIMCMD_FRAME(2, 36), ANIMCMD_FRAME(4, 36), ANIMCMD_FRAME(2, 36), ANIMCMD_JUMP(0)];
const sAnims_DuoFightPre_KyogrePectoralFin = [sAnim_DuoFightPre_KyogrePectoralFin];
const sSpriteTemplate_DuoFightPre_KyogrePectoralFin = { tileTag: TAG_DUOFIGHT_KYOGRE_PECTORAL_FIN, paletteTag: TAG_DUOFIGHT_KYOGRE, oam: sOam_16x8, anims: sAnims_DuoFightPre_KyogrePectoralFin, images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCallbackDummy };
const sSpriteTemplate_DuoFightPre_KyogreDorsalFin = { tileTag: TAG_DUOFIGHT_KYOGRE_DORSAL_FIN, paletteTag: TAG_DUOFIGHT_KYOGRE, oam: sOam_32x32, anims: sAnims_DuoFightPre_GroudonShoulderKyogreDorsalFin, images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCallbackDummy };

// ─── DUO_FIGHT scanline params + bg templates (rayquaza_scene.c:492-528) ──────────────
const sScanlineParams_DuoFight_Clouds: ScanlineEffectParams = {
  dmaDest: REG_OFFSET_BG1HOFS, // 1:1 `&REG_BG1HOFS` (HW-emu : REG_OFFSET au lieu d'un pointeur)
  dmaControl: SCANLINE_EFFECT_DMACNT_16BIT,
  initState: 1,
};
const sBgTemplates_DuoFight = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
];

// ─── DUO_FIGHT (full) : anims + sheets/palettes + templates (rayquaza_scene.c:530-770) ──
const sAnim_DuoFight_Groudon_Head = [ANIMCMD_FRAME(0, 20), ANIMCMD_FRAME(64, 20), ANIMCMD_FRAME(128, 20), ANIMCMD_FRAME(64, 20), ANIMCMD_JUMP(0)];
const sAnim_DuoFight_Groudon_Body = [ANIMCMD_FRAME(192, 20), ANIMCMD_FRAME(256, 20), ANIMCMD_FRAME(320, 20), ANIMCMD_FRAME(256, 20), ANIMCMD_JUMP(0)];
const sAnims_DuoFight_Groudon = [sAnim_DuoFight_Groudon_Head, sAnim_DuoFight_Groudon_Body];
const sSpriteSheet_DuoFight_Groudon = { data: 'gRaySceneDuoFight_Groudon_Gfx', size: 0x3000, tag: TAG_DUOFIGHT_GROUDON };
const sSpritePal_DuoFight_Groudon = { data: 'gRaySceneDuoFight_Groudon_Pal', tag: TAG_DUOFIGHT_GROUDON };
const sSpriteTemplate_DuoFight_Groudon = { tileTag: TAG_DUOFIGHT_GROUDON, paletteTag: TAG_DUOFIGHT_GROUDON, oam: sOam_64x64, anims: sAnims_DuoFight_Groudon, images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCallbackDummy };

const sAnim_DuoFight_GroudonShoulderKyogreDorsalFin = [ANIMCMD_FRAME(0, 1), ANIMCMD_END];
const sAnims_DuoFight_GroudonShoulderKyogreDorsalFin = [sAnim_DuoFight_GroudonShoulderKyogreDorsalFin];
const sSpriteSheet_DuoFight_GroudonShoulder = { data: 'gRaySceneDuoFight_GroudonShoulder_Gfx', size: 0x200, tag: TAG_DUOFIGHT_GROUDON_SHOULDER };
const sSpriteTemplate_DuoFight_GroudonShoulder = { tileTag: TAG_DUOFIGHT_GROUDON_SHOULDER, paletteTag: TAG_DUOFIGHT_GROUDON, oam: sOam_32x32, anims: sAnims_DuoFight_GroudonShoulderKyogreDorsalFin, images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCallbackDummy };

const sAnim_DuoFight_GroudonClaw = [ANIMCMD_FRAME(0, 1), ANIMCMD_END];
const sAnims_DuoFight_GroudonClaw = [sAnim_DuoFight_GroudonClaw];
const sSpriteSheet_DuoFight_GroudonClaw = { data: 'gRaySceneDuoFight_GroudonClaw_Gfx', size: 0x400, tag: TAG_DUOFIGHT_GROUDON_CLAW };
const sSpriteTemplate_DuoFight_GroudonClaw = { tileTag: TAG_DUOFIGHT_GROUDON_CLAW, paletteTag: TAG_DUOFIGHT_GROUDON, oam: sOam_64x32, anims: sAnims_DuoFight_GroudonClaw, images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCallbackDummy };

const sAnim_DuoFight_Kyogre_TopLeft = [ANIMCMD_FRAME(0, 1), ANIMCMD_END];
const sAnim_DuoFight_Kyogre_TopRight = [ANIMCMD_FRAME(8, 1), ANIMCMD_END];
const sAnim_DuoFight_Kyogre_FaceLeft = [ANIMCMD_FRAME(16, 1), ANIMCMD_END];
const sAnim_DuoFight_Kyogre_FaceRight = [ANIMCMD_FRAME(24, 1), ANIMCMD_END];
const sAnim_DuoFight_Kyogre_ChinLeft = [ANIMCMD_FRAME(32, 1), ANIMCMD_END];
const sAnim_DuoFight_Kyogre_ChinRight = [ANIMCMD_FRAME(40, 1), ANIMCMD_END];
const sAnim_DuoFight_Kyogre_LeftPectoralFin = [ANIMCMD_FRAME(48, 24), ANIMCMD_FRAME(64, 24), ANIMCMD_FRAME(80, 24), ANIMCMD_FRAME(64, 24), ANIMCMD_JUMP(0)];
const sAnim_DuoFight_Kyogre_LeftShoulder = [ANIMCMD_FRAME(56, 24), ANIMCMD_FRAME(72, 24), ANIMCMD_FRAME(88, 24), ANIMCMD_FRAME(72, 24), ANIMCMD_JUMP(0)];
const sAnim_DuoFight_Kyogre_RightShoulder = [ANIMCMD_FRAME(96, 24), ANIMCMD_FRAME(104, 24), ANIMCMD_FRAME(112, 24), ANIMCMD_FRAME(104, 24), ANIMCMD_JUMP(0)];
const sAnims_DuoFight_Kyogre = [
  sAnim_DuoFight_Kyogre_TopLeft, sAnim_DuoFight_Kyogre_TopRight,
  sAnim_DuoFight_Kyogre_FaceLeft, sAnim_DuoFight_Kyogre_FaceRight,
  sAnim_DuoFight_Kyogre_ChinLeft, sAnim_DuoFight_Kyogre_ChinRight,
  sAnim_DuoFight_Kyogre_LeftPectoralFin, sAnim_DuoFight_Kyogre_LeftShoulder,
  sAnim_DuoFight_Kyogre_RightShoulder,
];
const sSpriteSheet_DuoFight_Kyogre = { data: 'gRaySceneDuoFight_Kyogre_Gfx', size: 0xF00, tag: TAG_DUOFIGHT_KYOGRE };
const sSpritePal_DuoFight_Kyogre = { data: 'gRaySceneDuoFight_Kyogre_Pal', tag: TAG_DUOFIGHT_KYOGRE };
const sSpriteTemplate_DuoFight_Kyogre = { tileTag: TAG_DUOFIGHT_KYOGRE, paletteTag: TAG_DUOFIGHT_KYOGRE, oam: sOam_32x16, anims: sAnims_DuoFight_Kyogre, images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCallbackDummy };

const sAnim_DuoFight_KyogrePectoralFin = [ANIMCMD_FRAME(0, 24), ANIMCMD_FRAME(2, 24), ANIMCMD_FRAME(4, 24), ANIMCMD_FRAME(2, 24), ANIMCMD_JUMP(0)];
const sAnims_DuoFight_KyogrePectoralFin = [sAnim_DuoFight_KyogrePectoralFin];
const sSpriteSheet_DuoFight_KyogrePectoralFin = { data: 'gRaySceneDuoFight_KyogrePectoralFin_Gfx', size: 0xC0, tag: TAG_DUOFIGHT_KYOGRE_PECTORAL_FIN };
const sSpriteTemplate_DuoFight_KyogrePectoralFin = { tileTag: TAG_DUOFIGHT_KYOGRE_PECTORAL_FIN, paletteTag: TAG_DUOFIGHT_KYOGRE, oam: sOam_16x8, anims: sAnims_DuoFight_KyogrePectoralFin, images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCallbackDummy };
const sSpriteSheet_DuoFight_KyogreDorsalFin = { data: 'gRaySceneDuoFight_KyogreDorsalFin_Gfx', size: 0x200, tag: TAG_DUOFIGHT_KYOGRE_DORSAL_FIN };
const sSpriteTemplate_DuoFight_KyogreDorsalFin = { tileTag: TAG_DUOFIGHT_KYOGRE_DORSAL_FIN, paletteTag: TAG_DUOFIGHT_KYOGRE, oam: sOam_32x32, anims: sAnims_DuoFight_GroudonShoulderKyogreDorsalFin, images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCallbackDummy };

// ─── TAKES_FLIGHT : bg templates + smoke (rayquaza_scene.c:772-860) ───────────────────
const sBgTemplates_TakesFlight = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 2, charBaseIndex: 1, mapBaseIndex: 29, screenSize: 1, paletteMode: 0, priority: 1, baseTile: 0 },
];
const sAnim_TakesFlight_Smoke = [ANIMCMD_FRAME(0, 1), ANIMCMD_END];
const sAnims_TakesFlight_Smoke = [sAnim_TakesFlight_Smoke];
const sAffineAnim_TakesFlight_Smoke = [
  AFFINEANIMCMD_FRAME(-64, -64, 0, 1), AFFINEANIMCMD_FRAME(32, 32, 0, 14),
  AFFINEANIMCMD_FRAME(256, 256, 0, 0), AFFINEANIMCMD_JUMP(0),
];
const sAffineAnims_TakesFlight_Smoke = [sAffineAnim_TakesFlight_Smoke];
const sSpriteSheet_TakesFlight_Smoke = { data: 'gRaySceneTakesFlight_Smoke_Gfx', size: 0x100, tag: TAG_FLIGHT_SMOKE };
const sSpritePal_TakesFlight_Smoke = { data: 'gRaySceneTakesFlight_Smoke_Pal', tag: TAG_FLIGHT_SMOKE };
const sSpriteTemplate_TakesFlight_Smoke = { tileTag: TAG_FLIGHT_SMOKE, paletteTag: TAG_FLIGHT_SMOKE, oam: sOam_32x16, anims: sAnims_TakesFlight_Smoke, images: null, affineAnims: sAffineAnims_TakesFlight_Smoke, callback: SpriteCB_TakesFlight_Smoke };
const sTakesFlight_SmokeCoords: number[][] = [
  [-1, 5], [-3, -4], [5, -3], [-7, 2], [-9, -1], [1, -5], [3, 4], [-5, 3], [7, -2], [9, 1],
];

// ─── DESCENDS : bg templates + anims + sheets/palettes (rayquaza_scene.c:862-961) ─────
const sBgTemplates_Descends = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 1, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
];
const sAnim_Descends_Rayquaza = [ANIMCMD_FRAME(0, 32), ANIMCMD_FRAME(64, 32), ANIMCMD_JUMP(0)];
const sAnims_Descends_Rayquaza = [sAnim_Descends_Rayquaza];
const sAnim_Descends_RayquazaTail = [ANIMCMD_FRAME(0, 32), ANIMCMD_FRAME(8, 32), ANIMCMD_JUMP(0)];
const sAnims_Descends_RayquazaTail = [sAnim_Descends_RayquazaTail];
const sSpriteSheet_Descends_Rayquaza = { data: 'gRaySceneDescends_Rayquaza_Gfx', size: 0x1000, tag: TAG_DESCENDS_RAYQUAZA };
const sSpriteSheet_Descends_RayquazaTail = { data: 'gRaySceneDescends_RayquazaTail_Gfx', size: 0x200, tag: TAG_DESCENDS_RAYQUAZA_TAIL };
const sSpritePal_Descends_Rayquaza = { data: 'gRaySceneTakesFlight_Rayquaza_Pal', tag: TAG_DESCENDS_RAYQUAZA }; // "Takes flight" palette re-used
const sSpriteTemplate_Descends_Rayquaza = { tileTag: TAG_DESCENDS_RAYQUAZA, paletteTag: TAG_DESCENDS_RAYQUAZA, oam: sOam_64x64, anims: sAnims_Descends_Rayquaza, images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCallbackDummy };
const sSpriteTemplate_Descends_RayquazaTail = { tileTag: TAG_DESCENDS_RAYQUAZA_TAIL, paletteTag: TAG_DESCENDS_RAYQUAZA, oam: sOam_16x32, anims: sAnims_Descends_RayquazaTail, images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCallbackDummy };

// ─── CHARGES : bg templates (rayquaza_scene.c:963-1001) ───────────────────────────────
const sBgTemplates_Charges = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 3, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
];

// ─── CHASES_AWAY : anims + sheets/palettes + bg templates (rayquaza_scene.c:1003-1285) ──
const sAnim_ChasesAway_Groudon_Still = [ANIMCMD_FRAME(0, 1), ANIMCMD_END];
const sAnim_ChasesAway_Groudon_Moving = [ANIMCMD_FRAME(0, 48), ANIMCMD_FRAME(64, 32), ANIMCMD_FRAME(0, 48), ANIMCMD_FRAME(128, 32), ANIMCMD_JUMP(0)];
const sAnims_ChasesAway_Groudon = [sAnim_ChasesAway_Groudon_Still, sAnim_ChasesAway_Groudon_Moving];
const sAnim_ChasesAway_GroudonTail = [ANIMCMD_FRAME(0, 1), ANIMCMD_END];
const sAnims_ChasesAway_GroudonTail = [sAnim_ChasesAway_GroudonTail];
const sAnim_ChasesAway_Kyogre_Front = [ANIMCMD_FRAME(0, 1), ANIMCMD_END];
const sAnim_ChasesAway_Kyogre_Back = [ANIMCMD_FRAME(16, 1), ANIMCMD_END];
const sAnim_ChasesAway_Kyogre_Tail = [ANIMCMD_FRAME(32, 1), ANIMCMD_END];
const sAnims_ChasesAway_Kyogre = [sAnim_ChasesAway_Kyogre_Front, sAnim_ChasesAway_Kyogre_Back, sAnim_ChasesAway_Kyogre_Tail];
const sAnim_ChasesAway_Rayquaza_FlyingDown = [ANIMCMD_FRAME(0, 1), ANIMCMD_END];
const sAnim_ChasesAway_Rayquaza_Arriving = [ANIMCMD_FRAME(64, 1), ANIMCMD_END];
const sAnim_ChasesAway_Rayquaza_Floating = [ANIMCMD_FRAME(128, 1), ANIMCMD_END];
const sAnim_ChasesAway_Rayquaza_Shouting = [ANIMCMD_FRAME(192, 1), ANIMCMD_END];
const sAnims_ChasesAway_Rayquaza = [sAnim_ChasesAway_Rayquaza_FlyingDown, sAnim_ChasesAway_Rayquaza_Arriving, sAnim_ChasesAway_Rayquaza_Floating, sAnim_ChasesAway_Rayquaza_Shouting];
const sAnim_ChasesAway_RayquazaTail_FlyingDown = [ANIMCMD_FRAME(0, 1), ANIMCMD_END];
const sAnim_ChasesAway_RayquazaTail_Arriving = [ANIMCMD_FRAME(16, 1), ANIMCMD_END];
const sAnim_ChasesAway_RayquazaTail_Floating = [ANIMCMD_FRAME(32, 1), ANIMCMD_END];
const sAnim_ChasesAway_RayquazaTail_Shouting = [ANIMCMD_FRAME(48, 1), ANIMCMD_END];
const sAnims_ChasesAway_RayquazaTail = [sAnim_ChasesAway_RayquazaTail_FlyingDown, sAnim_ChasesAway_RayquazaTail_Arriving, sAnim_ChasesAway_RayquazaTail_Floating, sAnim_ChasesAway_RayquazaTail_Shouting];
const sAnim_ChasesAway_KyogreSplash = [ANIMCMD_FRAME(0, 8), ANIMCMD_FRAME(4, 8), ANIMCMD_FRAME(8, 8), ANIMCMD_FRAME(12, 8), ANIMCMD_FRAME(16, 8), ANIMCMD_FRAME(20, 8), ANIMCMD_JUMP(0)];
const sAnims_ChasesAway_KyogreSplash = [sAnim_ChasesAway_KyogreSplash];
const sSpriteSheet_ChasesAway_Groudon = { data: 'gRaySceneChasesAway_Groudon_Gfx', size: 0x1800, tag: TAG_CHASE_GROUDON };
const sSpriteSheet_ChasesAway_GroudonTail = { data: 'gRaySceneChasesAway_GroudonTail_Gfx', size: 0x80, tag: TAG_CHASE_GROUDON_TAIL };
const sSpriteSheet_ChasesAway_Kyogre = { data: 'gRaySceneChasesAway_Kyogre_Gfx', size: 0x600, tag: TAG_CHASE_KYOGRE };
const sSpriteSheet_ChasesAway_Rayquaza = { data: 'gRaySceneChasesAway_Rayquaza_Gfx', size: 0x2000, tag: TAG_CHASE_RAYQUAZA };
const sSpriteSheet_ChasesAway_RayquazaTail = { data: 'gRaySceneChasesAway_RayquazaTail_Gfx', size: 0x800, tag: TAG_CHASE_RAYQUAZA_TAIL };
const sSpriteSheet_ChasesAway_KyogreSplash = { data: 'gRaySceneChasesAway_KyogreSplash_Gfx', size: 0x300, tag: TAG_CHASE_SPLASH };
const sSpritePal_ChasesAway_Groudon = { data: 'gRaySceneChasesAway_Groudon_Pal', tag: TAG_CHASE_GROUDON };
const sSpritePal_ChasesAway_Kyogre = { data: 'gRaySceneChasesAway_Kyogre_Pal', tag: TAG_CHASE_KYOGRE };
const sSpritePal_ChasesAway_Rayquaza = { data: 'gRaySceneChasesAway_Rayquaza_Pal', tag: TAG_CHASE_RAYQUAZA };
const sSpritePal_ChasesAway_KyogreSplash = { data: 'gRaySceneChasesAway_KyogreSplash_Pal', tag: TAG_CHASE_SPLASH };
const sSpriteTemplate_ChasesAway_Groudon = { tileTag: TAG_CHASE_GROUDON, paletteTag: TAG_CHASE_GROUDON, oam: sOam_64x64, anims: sAnims_ChasesAway_Groudon, images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCallbackDummy };
const sSpriteTemplate_ChasesAway_GroudonTail = { tileTag: TAG_CHASE_GROUDON_TAIL, paletteTag: TAG_CHASE_GROUDON, oam: sOam_16x16, anims: sAnims_ChasesAway_GroudonTail, images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCallbackDummy };
const sSpriteTemplate_ChasesAway_Kyogre = { tileTag: TAG_CHASE_KYOGRE, paletteTag: TAG_CHASE_KYOGRE, oam: sOam_32x32, anims: sAnims_ChasesAway_Kyogre, images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCallbackDummy };
const sSpriteTemplate_ChasesAway_Rayquaza = { tileTag: TAG_CHASE_RAYQUAZA, paletteTag: TAG_CHASE_RAYQUAZA, oam: sOam_64x64, anims: sAnims_ChasesAway_Rayquaza, images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCB_ChasesAway_Rayquaza };
const sSpriteTemplate_ChasesAway_RayquazaTail = { tileTag: TAG_CHASE_RAYQUAZA_TAIL, paletteTag: TAG_CHASE_RAYQUAZA, oam: sOam_32x32, anims: sAnims_ChasesAway_RayquazaTail, images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCallbackDummy };
const sSpriteTemplate_ChasesAway_KyogreSplash = { tileTag: TAG_CHASE_SPLASH, paletteTag: TAG_CHASE_SPLASH, oam: sOam_32x8, anims: sAnims_ChasesAway_KyogreSplash, images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCallbackDummy };
const sBgTemplates_ChasesAway = [
  { bg: 0, charBaseIndex: 1, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
];

// ═══════════════════════════════════════════════════════════════════════════════════
//  CŒUR : entrée + CB2 + fin de scène (rayquaza_scene.c:1287-1371)
// ═══════════════════════════════════════════════════════════════════════════════════

/** 1:1 `void DoRayquazaScene(u8 animId, bool8 endEarly, MainCallback exitCallback)` (c:1287). */
export function DoRayquazaScene(animId: number, endEarly: boolean, exitCallback: (() => void) | null): void {
  // AllocZeroed(sizeof(*sRayScene)) — objet zéro 1:1 (exemption malloc = GC côté TS).
  sRayScene = {
    exitCallback: null,
    tilemapBuffers: [new Uint16Array(BG_SCREEN_SIZE), new Uint16Array(BG_SCREEN_SIZE), new Uint16Array(BG_SCREEN_SIZE), new Uint16Array(BG_SCREEN_SIZE)],
    unk: 0, animId: 0, endEarly: false, revealedLightLine: 0, revealedLightTimer: 0, unused: new Uint8Array(12),
  };
  sRayScene.animId = animId;
  sRayScene.exitCallback = exitCallback;
  sRayScene.endEarly = endEarly;
  SetMainCallback2(CB2_InitRayquazaScene);
}

/** 1:1 `static void CB2_InitRayquazaScene(void)` (c:1296). */
function CB2_InitRayquazaScene(): void {
  // GATE assets async (adaptation fetch — hors 1:1, pattern hall_of_fame CB2_DoHallOfFameScreen:296).
  // Le décomp lit la ROM sync ; nous fetchons les PNG/.bin/.pal → on spin ce CB2 (re-entré chaque
  // frame) jusqu'à ce que le préchargement soit réglé (chargé OU échoué → jamais de gel).
  if (!_ensureRayAssets()) return;
  SetVBlankHBlankCallbacksToNull();
  ClearScheduledBgCopiesToVram();
  ScanlineEffect_Stop();
  FreeAllSpritePalettes();
  ResetPaletteFade();
  ResetSpriteData();
  ResetTasks();
  FillPalette(RGB_BLACK, BG_PLTT_ID(15), PLTT_SIZE_4BPP);
  CreateTask((t: { taskId: number }) => sTasksForAnimations[sRayScene!.animId](t.taskId), 0);
  SetMainCallback2(CB2_RayquazaScene);
}

/** 1:1 `static void CB2_RayquazaScene(void)` (c:1310). */
function CB2_RayquazaScene(): void {
  RunTasks();
  AnimateSprites();
  BuildOamBuffer();
  DoScheduledBgTilemapCopiesToVram();
  UpdatePaletteFade();
}

/** 1:1 `static void VBlankCB_RayquazaScene(void)` (c:1319). */
function VBlankCB_RayquazaScene(): void {
  LoadOam();
  ProcessSpriteCopyRequests();
  TransferPlttBuffer();
}

/** 1:1 `static void Task_EndAfterFadeScreen(u8 taskId)` (c:1326). */
function Task_EndAfterFadeScreen(taskId: number): void {
  if (!gPaletteFade.active) {
    ResetSpriteData();
    FreeAllSpritePalettes();
    SetMainCallback2(sRayScene!.exitCallback);
    void sRayScene; sRayScene = null; // Free(sRayScene) — GC
    DestroyTask(taskId);
  }
}

/** 1:1 `static void Task_SetNextAnim(u8 taskId)` (c:1338). */
function Task_SetNextAnim(taskId: number): void {
  if (!gPaletteFade.active) {
    if (sRayScene!.endEarly === true) {
      gTasks[taskId].func = (t: { taskId: number }) => Task_EndAfterFadeScreen(t.taskId);
    } else {
      sRayScene!.animId++;
      sRayScene!.unk = 0;
      gTasks[taskId].func = (t: { taskId: number }) => sTasksForAnimations[sRayScene!.animId](t.taskId);
    }
  }
}

// The cutscene window is cropped to a narrower view, with black borders on each vertical edge
// This function is used in scenes where sprites in these borders need to be hidden
/** 1:1 `static void SetWindowsHideVertBorders(void)` (c:1357). */
function SetWindowsHideVertBorders(): void {
  SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_ALL);
  SetGpuReg(REG_OFFSET_WINOUT, 0);
  SetGpuReg(REG_OFFSET_WIN0H, WIN_RANGE(0, DISPLAY_WIDTH));
  SetGpuReg(REG_OFFSET_WIN0V, WIN_RANGE(24, DISPLAY_HEIGHT - 24));
  gPlttBufferUnfaded[0] = 0;
  gPlttBufferFaded[0] = 0;
}

/** 1:1 `static void ResetWindowDimensions(void)` (c:1367). */
function ResetWindowDimensions(): void {
  SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_ALL);
  SetGpuReg(REG_OFFSET_WINOUT, WINOUT_WIN01_ALL);
}

// ═══════════════════════════════════════════════════════════════════════════════════
//  RAY_ANIM_DUO_FIGHT / RAY_ANIM_DUO_FIGHT_PRE (rayquaza_scene.c:1374-1992)
//  Task data : [0]=tTimer [1]=tHelperTaskId [2]=tGroudonSpriteId [3]=tKyogreSpriteId
//  Groudon sprite data : [0]=sGroudonBodySpriteId [1]=sGroudonShoulderSpriteId [2]=sGroudonClawSpriteId
// ═══════════════════════════════════════════════════════════════════════════════════

/** 1:1 `static void Task_HandleDuoFightPre(u8 taskId)` (c:1385). */
function Task_HandleDuoFightPre(taskId: number): void {
  const data = gTasks[taskId].data;
  DuoFight_AnimateRain();
  if (!gPaletteFade.active) {
    const frame = data[0] /* tTimer */;
    if (frame === 64) {
      DuoFight_Lightning1();
    } else if (frame === 144) {
      DuoFight_Lightning2();
    } else {
      switch (frame) {
        case 328:
          DuoFightEnd(taskId, 0);
          return;
        case 148:
          DuoFight_LightningLong();
          break;
      }
    }
    data[0] /* tTimer */++;
  }
}

/** 1:1 `static u8 DuoFightPre_CreateGroudonSprites(void)` (c:1417). */
function DuoFightPre_CreateGroudonSprites(): number {
  const spriteId = CreateSprite(sSpriteTemplate_DuoFightPre_Groudon, 88, 72, 3);
  gSprites[spriteId]!.callback = SpriteCB_DuoFightPre_Groudon;
  const data = gSprites[spriteId]!.data;
  data[0] /* sGroudonBodySpriteId */ = CreateSprite(sSpriteTemplate_DuoFightPre_Groudon, 56, 104, 3);
  data[1] /* sGroudonShoulderSpriteId */ = CreateSprite(sSpriteTemplate_DuoFightPre_GroudonShoulder, 75, 101, 0);
  data[2] /* sGroudonClawSpriteId */ = CreateSprite(sSpriteTemplate_DuoFightPre_GroudonClaw, 109, 114, 1);
  StartSpriteAnim(gSprites[data[0] /* sGroudonBodySpriteId */]!, 1);
  return spriteId;
}

/** 1:1 `static void SpriteCB_DuoFightPre_Groudon(struct Sprite *sprite)` (c:1432). */
function SpriteCB_DuoFightPre_Groudon(sprite: DecompSprite): void {
  const data = sprite.data;
  data[5]++;
  data[5] &= 0x1F;
  if (data[5] === 0 && sprite.x !== 72) {
    sprite.x--;
    gSprites[data[0] /* sGroudonBodySpriteId */]!.x--;
    gSprites[data[1] /* sGroudonShoulderSpriteId */]!.x--;
    gSprites[data[2] /* sGroudonClawSpriteId */]!.x--;
  }

  switch (sprite.animCmdIndex) {
    case 0:
      gSprites[data[1]]!.x2 = 0;
      gSprites[data[1]]!.y2 = 0;
      gSprites[data[2]]!.x2 = 0;
      gSprites[data[2]]!.y2 = 0;
      break;
    case 1:
    case 3:
      gSprites[data[1]]!.x2 = -1;
      gSprites[data[1]]!.y2 = 0;
      gSprites[data[2]]!.x2 = -1;
      gSprites[data[2]]!.y2 = 0;
      break;
    case 2:
      gSprites[data[1]]!.x2 = -1;
      gSprites[data[1]]!.y2 = 1;
      gSprites[data[2]]!.x2 = -2;
      gSprites[data[2]]!.y2 = 1;
      break;
  }
}

/** 1:1 `static u8 DuoFightPre_CreateKyogreSprites(void)` (c:1469). */
function DuoFightPre_CreateKyogreSprites(): number {
  const spriteId = CreateSprite(sSpriteTemplate_DuoFightPre_Kyogre, 136, 96, 1);
  gSprites[spriteId]!.callback = SpriteCB_DuoFightPre_Kyogre;
  const data = gSprites[spriteId]!.data;

  data[0] = CreateSprite(sSpriteTemplate_DuoFightPre_Kyogre, 168, 96, 1) << 8;
  data[0] |= CreateSprite(sSpriteTemplate_DuoFightPre_Kyogre, 136, 112, 1);
  data[1] = CreateSprite(sSpriteTemplate_DuoFightPre_Kyogre, 168, 112, 1) << 8;
  data[1] |= CreateSprite(sSpriteTemplate_DuoFightPre_Kyogre, 136, 128, 1);
  data[2] = CreateSprite(sSpriteTemplate_DuoFightPre_Kyogre, 168, 128, 1) << 8;
  data[2] |= CreateSprite(sSpriteTemplate_DuoFightPre_Kyogre, 104, 128, 2);
  data[3] = CreateSprite(sSpriteTemplate_DuoFightPre_Kyogre, 136, 128, 2) << 8;
  data[3] |= CreateSprite(sSpriteTemplate_DuoFightPre_Kyogre, 184, 128, 0);
  data[4] = CreateSprite(sSpriteTemplate_DuoFightPre_KyogrePectoralFin, 208, 132, 0) << 8;
  data[4] |= CreateSprite(sSpriteTemplate_DuoFightPre_KyogreDorsalFin, 200, 120, 1);

  StartSpriteAnim(gSprites[data[0] >> 8]!, 1);
  StartSpriteAnim(gSprites[data[0] & 0xFF]!, 2);
  StartSpriteAnim(gSprites[data[1] >> 8]!, 3);
  StartSpriteAnim(gSprites[data[1] & 0xFF]!, 4);
  StartSpriteAnim(gSprites[data[2] >> 8]!, 5);
  StartSpriteAnim(gSprites[data[2] & 0xFF]!, 6);
  StartSpriteAnim(gSprites[data[3] >> 8]!, 7);
  StartSpriteAnim(gSprites[data[3] & 0xFF]!, 8);

  return spriteId;
}

/** 1:1 `static void SpriteCB_DuoFightPre_Kyogre(struct Sprite *sprite)` (c:1501). */
function SpriteCB_DuoFightPre_Kyogre(sprite: DecompSprite): void {
  const data = sprite.data;
  data[5]++;
  data[5] &= 0x1F;
  if (data[5] === 0 && sprite.x !== 152) {
    sprite.x++;
    gSprites[data[0] >> 8]!.x++;
    gSprites[data[0] & 0xFF]!.x++;
    gSprites[data[1] >> 8]!.x++;
    gSprites[data[1] & 0xFF]!.x++;
    gSprites[data[2] >> 8]!.x++;
    gSprites[data[2] & 0xFF]!.x++;
    gSprites[data[3] >> 8]!.x++;
    gSprites[data[3] & 0xFF]!.x++;
    gSprites[data[4] >> 8]!.x++;
    gSprites[data[4] & 0xFF]!.x++;
  }

  switch (gSprites[data[2] & 0xFF]!.animCmdIndex) {
    case 0:
      sprite.y2 = 0;
      gSprites[data[0] >> 8]!.y2 = 0;
      gSprites[data[0] & 0xFF]!.y2 = 0;
      gSprites[data[1] >> 8]!.y2 = 0;
      gSprites[data[1] & 0xFF]!.y2 = 0;
      gSprites[data[2] >> 8]!.y2 = 0;
      gSprites[data[2] & 0xFF]!.y2 = 0;
      gSprites[data[3] >> 8]!.y2 = 0;
      gSprites[data[3] & 0xFF]!.y2 = 0;
      gSprites[data[4] >> 8]!.y2 = 0;
      gSprites[data[4] & 0xFF]!.y2 = 0;
      break;
    case 1:
    case 3:
      sprite.y2 = 1;
      gSprites[data[0] >> 8]!.y2 = 1;
      gSprites[data[0] & 0xFF]!.y2 = 1;
      gSprites[data[1] >> 8]!.y2 = 1;
      gSprites[data[1] & 0xFF]!.y2 = 1;
      gSprites[data[2] >> 8]!.y2 = 1;
      gSprites[data[2] & 0xFF]!.y2 = 1;
      gSprites[data[3] >> 8]!.y2 = 1;
      gSprites[data[3] & 0xFF]!.y2 = 1;
      gSprites[data[4] >> 8]!.y2 = 1;
      gSprites[data[4] & 0xFF]!.y2 = 1;
      break;
    case 2:
      sprite.y2 = 2;
      gSprites[data[0] >> 8]!.y2 = 2;
      gSprites[data[0] & 0xFF]!.y2 = 2;
      gSprites[data[1] >> 8]!.y2 = 2;
      gSprites[data[1] & 0xFF]!.y2 = 2;
      gSprites[data[2] >> 8]!.y2 = 2;
      gSprites[data[4] & 0xFF]!.y2 = 2;
      break;
  }
}

/** 1:1 `static void VBlankCB_DuoFight(void)` (c:1562). */
function VBlankCB_DuoFight(): void {
  VBlankCB_RayquazaScene();
  ScanlineEffect_InitHBlankDmaTransfer();
}

/** 1:1 `static void InitDuoFightSceneBgs(void)` (c:1568). */
function InitDuoFightSceneBgs(): void {
  ResetVramOamAndBgCntRegs();
  ResetBgsAndClearDma3BusyFlags(0);
  InitBgsFromTemplates(0, sBgTemplates_DuoFight, sBgTemplates_DuoFight.length);
  SetBgTilemapBuffer(0, sRayScene!.tilemapBuffers[0]);
  SetBgTilemapBuffer(1, sRayScene!.tilemapBuffers[1]);
  SetBgTilemapBuffer(2, sRayScene!.tilemapBuffers[2]);
  ResetAllBgsCoordinates();
  ScheduleBgCopyTilemapToVram(0);
  ScheduleBgCopyTilemapToVram(1);
  ScheduleBgCopyTilemapToVram(2);
  SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);
  ShowBg(0);
  ShowBg(1);
  ShowBg(2);
  SetGpuReg(REG_OFFSET_BLDCNT, 0);
}

/** 1:1 `static void LoadDuoFightSceneGfx(void)` (c:1587). */
function LoadDuoFightSceneGfx(): void {
  ResetTempTileDataBuffers();
  DecompressAndCopyTileDataToVram(0, gRaySceneDuoFight_Clouds_Gfx, 0, 0, 0);
  while (FreeTempTileDataBuffersIfPossible()) { /* wait */ }
  LZDecompressWram(gRaySceneDuoFight_Clouds2_Tilemap, sRayScene!.tilemapBuffers[0]);
  LZDecompressWram(gRaySceneDuoFight_Clouds1_Tilemap, sRayScene!.tilemapBuffers[1]);
  LZDecompressWram(gRaySceneDuoFight_Clouds3_Tilemap, sRayScene!.tilemapBuffers[2]);
  LoadCompressedPalette('gRaySceneDuoFight_Clouds_Pal', BG_PLTT_ID(0), 2 * PLTT_SIZE_4BPP);
  LoadCompressedSpriteSheet(sSpriteSheet_DuoFight_Groudon);
  LoadCompressedSpriteSheet(sSpriteSheet_DuoFight_GroudonShoulder);
  LoadCompressedSpriteSheet(sSpriteSheet_DuoFight_GroudonClaw);
  LoadCompressedSpriteSheet(sSpriteSheet_DuoFight_Kyogre);
  LoadCompressedSpriteSheet(sSpriteSheet_DuoFight_KyogrePectoralFin);
  LoadCompressedSpriteSheet(sSpriteSheet_DuoFight_KyogreDorsalFin);
  LoadCompressedSpritePalette(sSpritePal_DuoFight_Groudon);
  LoadCompressedSpritePalette(sSpritePal_DuoFight_Kyogre);
}

/** 1:1 `static void Task_DuoFightAnim(u8 taskId)` (c:1607). */
function Task_DuoFightAnim(taskId: number): void {
  const data = gTasks[taskId].data;
  ScanlineEffect_Clear();
  InitDuoFightSceneBgs();
  LoadDuoFightSceneGfx();
  // 1:1 CpuFastFill16(0, gScanlineEffectRegBuffers, sizeof(gScanlineEffectRegBuffers)) — double-buffer
  // contigu [2][0x3C0] côté décomp ; ici 2 Uint16Array séparés → on zéroie les deux.
  gScanlineEffectRegBuffers[0].fill(0);
  gScanlineEffectRegBuffers[1].fill(0);
  ScanlineEffect_SetParams(sScanlineParams_DuoFight_Clouds);
  data[0] /* tTimer */ = 0;
  data[1] /* tHelperTaskId */ = CreateTask((t: { taskId: number }) => Task_DuoFight_AnimateClouds(t.taskId), 0);
  if (sRayScene!.animId === RAY_ANIM_DUO_FIGHT_PRE) {
    data[2] /* tGroudonSpriteId */ = DuoFightPre_CreateGroudonSprites();
    data[3] /* tKyogreSpriteId */ = DuoFightPre_CreateKyogreSprites();
    gTasks[taskId].func = (t: { taskId: number }) => Task_HandleDuoFightPre(t.taskId);
  } else {
    data[2] /* tGroudonSpriteId */ = DuoFight_CreateGroudonSprites();
    data[3] /* tKyogreSpriteId */ = DuoFight_CreateKyogreSprites();
    gTasks[taskId].func = (t: { taskId: number }) => Task_HandleDuoFight(t.taskId);
    StopMapMusic();
  }

  BlendPalettes(PALETTES_ALL, 0x10, RGB_BLACK);
  BeginNormalPaletteFade(PALETTES_ALL, 0, 0x10, 0, RGB_BLACK);
  SetVBlankCallback(VBlankCB_DuoFight);
  PlaySE(SE_DOWNPOUR);
}

/** 1:1 `static void Task_DuoFight_AnimateClouds(u8 taskId)` (c:1637).
 *  NOTE : `u16 *data = (u16*)gTasks[taskId].data` — data traité en u16 (scroll clouds). */
function Task_DuoFight_AnimateClouds(taskId: number): void {
  let i: number;
  const data = gTasks[taskId].data; // (u16*) cast — accumulateurs de scroll

  for (i = 24; i < 92; i++) {
    if (i <= 47) {
      gScanlineEffectRegBuffers[0][i] = data[0] >> 8;
      gScanlineEffectRegBuffers[1][i] = data[0] >> 8;
    } else if (i <= 63) {
      gScanlineEffectRegBuffers[0][i] = data[1] >> 8;
      gScanlineEffectRegBuffers[1][i] = data[1] >> 8;
    } else if (i <= 75) {
      gScanlineEffectRegBuffers[0][i] = data[2] >> 8;
      gScanlineEffectRegBuffers[1][i] = data[2] >> 8;
    } else if (i <= 83) {
      gScanlineEffectRegBuffers[0][i] = data[3] >> 8;
      gScanlineEffectRegBuffers[1][i] = data[3] >> 8;
    } else if (i <= 87) {
      gScanlineEffectRegBuffers[0][i] = data[4] >> 8;
      gScanlineEffectRegBuffers[1][i] = data[4] >> 8;
    } else {
      gScanlineEffectRegBuffers[0][i] = data[5] >> 8;
      gScanlineEffectRegBuffers[1][i] = data[5] >> 8;
    }
  }

  if (sRayScene!.animId === RAY_ANIM_DUO_FIGHT_PRE) {
    data[0] += 448;
    data[1] += 384;
    data[2] += 320;
    data[3] += 256;
    data[4] += 192;
    data[5] += 128;
  } else {
    data[0] += 768;
    data[1] += 640;
    data[2] += 512;
    data[3] += 384;
    data[4] += 256;
    data[5] += 128;
  }
}

/** 1:1 `static void Task_HandleDuoFight(u8 taskId)` (c:1696). */
function Task_HandleDuoFight(taskId: number): void {
  const data = gTasks[taskId].data;
  DuoFight_AnimateRain();
  if (!gPaletteFade.active) {
    const frame = data[0] /* tTimer */;
    if (frame === 32 || frame === 112) {
      DuoFight_Lightning1();
    } else if (frame === 216) {
      DuoFight_Lightning2();
    } else if (frame === 220) {
      DuoFight_LightningLong();
    } else {
      switch (frame) {
        case 412:
          DuoFightEnd(taskId, 2);
          return;
        case 380:
          SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG2 | BLDCNT_TGT2_BG1 | BLDCNT_EFFECT_BLEND);
          gTasks[data[1] /* tHelperTaskId */].func = (t: { taskId: number }) => DuoFight_PanOffScene(t.taskId);
          gTasks[data[1] /* tHelperTaskId */].data[0] = 0;
          gTasks[data[1] /* tHelperTaskId */].data[2] = data[2];
          gTasks[data[1] /* tHelperTaskId */].data[3] = data[3];
          ScanlineEffect_Stop();
          break;
      }
    }
    data[0] /* tTimer */++;
  }
}

// In the below functions, BlendPalettesGradually flashes the bg white and the duo black
// and gradually fades them back to original color to simulate lightning
/** 1:1 `static void DuoFight_Lightning1(void)` (c:1739). */
function DuoFight_Lightning1(): void {
  PlaySE(SE_THUNDER);
  BlendPalettesGradually(PALETTES_BG & ~(0x8000), 0, 16, 0, RGB_WHITEALPHA, 0, 0);
  BlendPalettesGradually(PALETTES_OBJECTS, 0, 16, 0, RGB_BLACK, 0, 1);
}

/** 1:1 `static void DuoFight_Lightning2(void)` (c:1746). */
function DuoFight_Lightning2(): void {
  PlaySE(SE_THUNDER);
  BlendPalettesGradually(PALETTES_BG & ~(0x8000), 0, 16, 16, RGB_WHITEALPHA, 0, 0);
  BlendPalettesGradually(PALETTES_OBJECTS, 0, 16, 16, RGB_BLACK, 0, 1);
}

/** 1:1 `static void DuoFight_LightningLong(void)` (c:1753). */
function DuoFight_LightningLong(): void {
  BlendPalettesGradually(PALETTES_BG & ~(0x8000), 4, 16, 0, RGB_WHITEALPHA, 0, 0);
  BlendPalettesGradually(PALETTES_OBJECTS, 4, 16, 0, RGB_BLACK, 0, 1);
}

/** 1:1 `static void DuoFight_AnimateRain(void)` (c:1759). */
function DuoFight_AnimateRain(): void {
  ChangeBgX(2, 0x400, BG_COORD_ADD);
  ChangeBgY(2, 0x800, BG_COORD_SUB);
}

// Only used by the full version, which pans up at the end (so scene objects move down)
// DuoFightPre just fades to black with no pan
/** 1:1 `static void DuoFight_PanOffScene(u8 taskId)` (c:1767).
 *  Ce helper réutilise data[0]=tTimer, data[2]=tGroudonSpriteId, data[3]=tKyogreSpriteId (recopiés). */
function DuoFight_PanOffScene(taskId: number): void {
  let bgY: number;
  const data = gTasks[taskId].data;
  DuoFight_SlideGroudonDown(gSprites[data[2] /* tGroudonSpriteId */]!);
  DuoFight_SlideKyogreDown(gSprites[data[3] /* tKyogreSpriteId */]!);

  bgY = GetBgY(1);
  if (GetBgY(1) === 0 || bgY > 0x8000)
    ChangeBgY(1, 0x400, BG_COORD_SUB);

  if (data[0] /* tTimer */ !== 16) {
    data[0] /* tTimer */++;
    SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16 - data[0], data[0]));
  }
}

/** 1:1 `static void DuoFightEnd(u8 taskId, s8 palDelay)` (c:1785). */
function DuoFightEnd(taskId: number, palDelay: number): void {
  PlaySE(SE_DOWNPOUR_STOP);
  BeginNormalPaletteFade(PALETTES_ALL, palDelay, 0, 0x10, RGB_BLACK);
  gTasks[taskId].func = (t: { taskId: number }) => Task_DuoFightEnd(t.taskId);
}

/** 1:1 `static void Task_DuoFightEnd(u8 taskId)` (c:1792). */
function Task_DuoFightEnd(taskId: number): void {
  const data = gTasks[taskId].data;
  DuoFight_AnimateRain();
  if (!gPaletteFade.active) {
    DestroyTask(data[1] /* tHelperTaskId */);
    ChangeBgY(1, 0, BG_COORD_SET);
    SetVBlankCallback(null);
    ScanlineEffect_Stop();
    ResetSpriteData();
    FreeAllSpritePalettes();
    data[0] /* tTimer */ = 0;
    gTasks[taskId].func = (t: { taskId: number }) => Task_SetNextAnim(t.taskId);
  }
}

/** 1:1 `static u8 DuoFight_CreateGroudonSprites(void)` (c:1809). */
function DuoFight_CreateGroudonSprites(): number {
  const spriteId = CreateSprite(sSpriteTemplate_DuoFight_Groudon, 98, 72, 3);
  gSprites[spriteId]!.callback = SpriteCB_DuoFight_Groudon;
  const data = gSprites[spriteId]!.data;
  data[0] /* sGroudonBodySpriteId */ = CreateSprite(sSpriteTemplate_DuoFight_Groudon, 66, 104, 3);
  data[1] /* sGroudonShoulderSpriteId */ = CreateSprite(sSpriteTemplate_DuoFight_GroudonShoulder, 85, 101, 0);
  data[2] /* sGroudonClawSpriteId */ = CreateSprite(sSpriteTemplate_DuoFight_GroudonClaw, 119, 114, 1);
  StartSpriteAnim(gSprites[data[0] /* sGroudonBodySpriteId */]!, 1);
  return spriteId;
}

/** 1:1 `static void SpriteCB_DuoFight_Groudon(struct Sprite *sprite)` (c:1824). */
function SpriteCB_DuoFight_Groudon(sprite: DecompSprite): void {
  const data = sprite.data;
  data[5]++;
  data[5] &= 0xF;
  if (!(data[5] & 7) && sprite.x !== 72) {
    sprite.x--;
    gSprites[data[0] /* sGroudonBodySpriteId */]!.x--;
    gSprites[data[1] /* sGroudonShoulderSpriteId */]!.x--;
    gSprites[data[2] /* sGroudonClawSpriteId */]!.x--;
  }

  switch (sprite.animCmdIndex) {
    case 0:
      gSprites[data[1]]!.x2 = 0;
      gSprites[data[1]]!.y2 = 0;
      gSprites[data[2]]!.x2 = 0;
      gSprites[data[2]]!.y2 = 0;
      break;
    case 1:
    case 3:
      gSprites[data[1]]!.x2 = -1;
      gSprites[data[1]]!.y2 = 0;
      gSprites[data[2]]!.x2 = -1;
      gSprites[data[2]]!.y2 = 0;
      break;
    case 2:
      gSprites[data[1]]!.x2 = -1;
      gSprites[data[1]]!.y2 = 1;
      gSprites[data[2]]!.x2 = -2;
      gSprites[data[2]]!.y2 = 1;
      break;
  }
}

/** 1:1 `static void DuoFight_SlideGroudonDown(struct Sprite *sprite)` (c:1861). */
function DuoFight_SlideGroudonDown(sprite: DecompSprite): void {
  const data = sprite.data;
  if (sprite.y <= DISPLAY_HEIGHT) {
    sprite.y += 8;
    gSprites[data[0] /* sGroudonBodySpriteId */]!.y += 8;
    gSprites[data[1] /* sGroudonShoulderSpriteId */]!.y += 8;
    gSprites[data[2] /* sGroudonClawSpriteId */]!.y += 8;
  }
}

/** 1:1 `static u8 DuoFight_CreateKyogreSprites(void)` (c:1873). */
function DuoFight_CreateKyogreSprites(): number {
  const spriteId = CreateSprite(sSpriteTemplate_DuoFight_Kyogre, 126, 96, 1);
  gSprites[spriteId]!.callback = SpriteCB_DuoFight_Kyogre;
  const data = gSprites[spriteId]!.data;

  data[0] = CreateSprite(sSpriteTemplate_DuoFight_Kyogre, 158, 96, 1) << 8;
  data[0] |= CreateSprite(sSpriteTemplate_DuoFight_Kyogre, 126, 112, 1);
  data[1] = CreateSprite(sSpriteTemplate_DuoFight_Kyogre, 158, 112, 1) << 8;
  data[1] |= CreateSprite(sSpriteTemplate_DuoFight_Kyogre, 126, 128, 1);
  data[2] = CreateSprite(sSpriteTemplate_DuoFight_Kyogre, 158, 128, 1) << 8;
  data[2] |= CreateSprite(sSpriteTemplate_DuoFight_Kyogre, 94, 128, 2);
  data[3] = CreateSprite(sSpriteTemplate_DuoFight_Kyogre, 126, 128, 2) << 8;
  data[3] |= CreateSprite(sSpriteTemplate_DuoFight_Kyogre, 174, 128, 0);
  data[4] = CreateSprite(sSpriteTemplate_DuoFight_KyogrePectoralFin, 198, 132, 0) << 8;
  data[4] |= CreateSprite(sSpriteTemplate_DuoFight_KyogreDorsalFin, 190, 120, 1);

  StartSpriteAnim(gSprites[data[0] >> 8]!, 1);
  StartSpriteAnim(gSprites[data[0] & 0xFF]!, 2);
  StartSpriteAnim(gSprites[data[1] >> 8]!, 3);
  StartSpriteAnim(gSprites[data[1] & 0xFF]!, 4);
  StartSpriteAnim(gSprites[data[2] >> 8]!, 5);
  StartSpriteAnim(gSprites[data[2] & 0xFF]!, 6);
  StartSpriteAnim(gSprites[data[3] >> 8]!, 7);
  StartSpriteAnim(gSprites[data[3] & 0xFF]!, 8);

  return spriteId;
}

/** 1:1 `static void SpriteCB_DuoFight_Kyogre(struct Sprite *sprite)` (c:1905). */
function SpriteCB_DuoFight_Kyogre(sprite: DecompSprite): void {
  const data = sprite.data;
  data[5]++;
  data[5] &= 0xF;
  if (!(data[5] & 7) && sprite.x !== 152) {
    sprite.x++;
    gSprites[data[0] >> 8]!.x++;
    gSprites[data[0] & 0xFF]!.x++;
    gSprites[data[1] >> 8]!.x++;
    gSprites[data[1] & 0xFF]!.x++;
    gSprites[data[2] >> 8]!.x++;
    gSprites[data[2] & 0xFF]!.x++;
    gSprites[data[3] >> 8]!.x++;
    gSprites[data[3] & 0xFF]!.x++;
    gSprites[data[4] >> 8]!.x++;
    gSprites[data[4] & 0xFF]!.x++;
  }

  switch (gSprites[data[2] & 0xFF]!.animCmdIndex) {
    case 0:
      sprite.y2 = 0;
      gSprites[data[0] >> 8]!.y2 = 0;
      gSprites[data[0] & 0xFF]!.y2 = 0;
      gSprites[data[1] >> 8]!.y2 = 0;
      gSprites[data[1] & 0xFF]!.y2 = 0;
      gSprites[data[2] >> 8]!.y2 = 0;
      gSprites[data[2] & 0xFF]!.y2 = 0;
      gSprites[data[3] >> 8]!.y2 = 0;
      gSprites[data[3] & 0xFF]!.y2 = 0;
      gSprites[data[4] >> 8]!.y2 = 0;
      gSprites[data[4] & 0xFF]!.y2 = 0;
      break;
    case 1:
    case 3:
      sprite.y2 = 1;
      gSprites[data[0] >> 8]!.y2 = 1;
      gSprites[data[0] & 0xFF]!.y2 = 1;
      gSprites[data[1] >> 8]!.y2 = 1;
      gSprites[data[1] & 0xFF]!.y2 = 1;
      gSprites[data[2] >> 8]!.y2 = 1;
      gSprites[data[2] & 0xFF]!.y2 = 1;
      gSprites[data[3] >> 8]!.y2 = 1;
      gSprites[data[3] & 0xFF]!.y2 = 1;
      gSprites[data[4] >> 8]!.y2 = 1;
      gSprites[data[4] & 0xFF]!.y2 = 1;
      break;
    case 2:
      sprite.y2 = 2;
      gSprites[data[0] >> 8]!.y2 = 2;
      gSprites[data[0] & 0xFF]!.y2 = 2;
      gSprites[data[1] >> 8]!.y2 = 2;
      gSprites[data[1] & 0xFF]!.y2 = 2;
      gSprites[data[2] >> 8]!.y2 = 2;
      gSprites[data[4] & 0xFF]!.y2 = 2;
      break;
  }
}

/** 1:1 `static void DuoFight_SlideKyogreDown(struct Sprite *sprite)` (c:1966). */
function DuoFight_SlideKyogreDown(sprite: DecompSprite): void {
  const data = sprite.data;
  if (sprite.y <= DISPLAY_HEIGHT) {
    sprite.y += 8;
    gSprites[data[0] >> 8]!.y += 8;
    gSprites[data[0] & 0xFF]!.y += 8;
    gSprites[data[1] >> 8]!.y += 8;
    gSprites[data[1] & 0xFF]!.y += 8;
    gSprites[data[2] >> 8]!.y += 8;
    gSprites[data[2] & 0xFF]!.y += 8;
    gSprites[data[3] >> 8]!.y += 8;
    gSprites[data[3] & 0xFF]!.y += 8;
    gSprites[data[4] >> 8]!.y += 8;
    gSprites[data[4] & 0xFF]!.y += 8;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//  RAY_ANIM_TAKES_FLIGHT (rayquaza_scene.c:1995-2202)
//  Task data : [0]=tState [1]=tTimer [2]=tScale [3]=tScaleSpeed [4]=tYCoord [5]=tYSpeed
//              [6]=tYOffset [7]=tYOffsetDir
//  Smoke task : [0]=tSmokeId [1]=tTimer ; Smoke sprite : [0]=sSmokeId [1]=sTimer
// ═══════════════════════════════════════════════════════════════════════════════════

/** 1:1 `static void InitTakesFlightSceneBgs(void)` (c:2006). */
function InitTakesFlightSceneBgs(): void {
  ResetVramOamAndBgCntRegs();
  ResetBgsAndClearDma3BusyFlags(0);
  InitBgsFromTemplates(1, sBgTemplates_TakesFlight, sBgTemplates_TakesFlight.length);
  SetBgTilemapBuffer(0, sRayScene!.tilemapBuffers[0]);
  SetBgTilemapBuffer(1, sRayScene!.tilemapBuffers[1]);
  SetBgTilemapBuffer(2, sRayScene!.tilemapBuffers[2]);
  ResetAllBgsCoordinates();
  ScheduleBgCopyTilemapToVram(0);
  ScheduleBgCopyTilemapToVram(1);
  ScheduleBgCopyTilemapToVram(2);
  SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);
  ShowBg(0);
  ShowBg(1);
  ShowBg(2);
  SetGpuReg(REG_OFFSET_BLDCNT, 0);
}

/** 1:1 `static void LoadTakesFlightSceneGfx(void)` (c:2025). */
function LoadTakesFlightSceneGfx(): void {
  ResetTempTileDataBuffers();
  DecompressAndCopyTileDataToVram(0, gRaySceneDuoFight_Clouds_Gfx, 0, 0, 0); // Re-uses clouds from previous scene
  DecompressAndCopyTileDataToVram(1, gRaySceneTakesFlight_Bg_Gfx, 0, 0, 0);
  DecompressAndCopyTileDataToVram(2, gRaySceneTakesFlight_Rayquaza_Gfx, 0, 0, 0);
  while (FreeTempTileDataBuffersIfPossible()) { /* wait */ }
  LZDecompressWram(gRaySceneDuoFight_Clouds2_Tilemap, sRayScene!.tilemapBuffers[0]);
  LZDecompressWram(gRaySceneTakesFlight_Bg_Tilemap, sRayScene!.tilemapBuffers[1]);
  LZDecompressWram(gRaySceneTakesFlight_Rayquaza_Tilemap, sRayScene!.tilemapBuffers[2]);
  LoadCompressedPalette('gRaySceneTakesFlight_Rayquaza_Pal', BG_PLTT_ID(0), 2 * PLTT_SIZE_4BPP);
  LoadCompressedSpriteSheet(sSpriteSheet_TakesFlight_Smoke);
  LoadCompressedSpritePalette(sSpritePal_TakesFlight_Smoke);
}

/** 1:1 `static void Task_RayTakesFlightAnim(u8 taskId)` (c:2041). */
function Task_RayTakesFlightAnim(taskId: number): void {
  const data = gTasks[taskId].data;
  PlayNewMapMusic(MUS_RAYQUAZA_APPEARS);
  InitTakesFlightSceneBgs();
  LoadTakesFlightSceneGfx();
  SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_OBJ | BLDCNT_TGT2_BG1 | BLDCNT_EFFECT_BLEND);
  SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(8, 8));
  BlendPalettes(PALETTES_ALL, 16, 0);
  SetVBlankCallback(VBlankCB_RayquazaScene);
  CreateTask((t: { taskId: number }) => Task_TakesFlight_CreateSmoke(t.taskId), 0);
  data[0] /* tState */ = 0;
  data[1] /* tTimer */ = 0;
  gTasks[taskId].func = (t: { taskId: number }) => Task_HandleRayTakesFlight(t.taskId);
}

// Animate Rayquaza (flying up and down, and changing size as it gets further from the screen)
// In this scene Rayquaza is a bg tilemap on bg 2, not a sprite
/** 1:1 `static void Task_HandleRayTakesFlight(u8 taskId)` (c:2059). */
function Task_HandleRayTakesFlight(taskId: number): void {
  const data = gTasks[taskId].data;
  switch (data[0] /* tState */) {
    case 0:
      // Delay, then fade in
      if (data[1] /* tTimer */ === 8) {
        BeginNormalPaletteFade(PALETTES_ALL, 0, 0x10, 0, RGB_BLACK);
        data[2] /* tScale */ = 0;
        data[3] /* tScaleSpeed */ = 30;
        data[4] /* tYCoord */ = 0;
        data[5] /* tYSpeed */ = 7;
        data[1] /* tTimer */ = 0;
        data[0] /* tState */++;
      } else {
        data[1] /* tTimer */++;
      }
      break;
    case 1:
      // Fly in
      data[2] /* tScale */ += data[3] /* tScaleSpeed */;
      data[4] /* tYCoord */ += data[5] /* tYSpeed */;

      if (data[3] /* tScaleSpeed */ > 3)
        data[3] /* tScaleSpeed */ -= 3;

      if (data[5] /* tYSpeed */ !== 0)
        data[5] /* tYSpeed */--;

      if (data[2] /* tScale */ > 255) {
        data[2] /* tScale */ = 256;
        data[3] /* tScaleSpeed */ = 0;
        data[6] /* tYOffset */ = 12;
        data[7] /* tYOffsetDir */ = -1;
        data[1] /* tTimer */ = 0;
        data[0] /* tState */++;
      }
      SetBgAffine(2, 0x7800, 0x1800, 120, data[4] /* tYCoord */ + 32, data[2] /* tScale */, data[2] /* tScale */, 0);
      break;
    case 2:
      // Float up and down
      data[1] /* tTimer */++;
      SetBgAffine(2, 0x7800, 0x1800, 120, data[4] /* tYCoord */ + 32 + (data[6] /* tYOffset */ >> 2), data[2] /* tScale */, data[2] /* tScale */, 0);
      data[6] /* tYOffset */ += data[7] /* tYOffsetDir */;
      if (data[6] /* tYOffset */ === 12 || data[6] /* tYOffset */ === -12) {
        data[7] /* tYOffsetDir */ *= -1;
        if (data[1] /* tTimer */ > 295) {
          data[0] /* tState */++;
          BeginNormalPaletteFade(PALETTES_ALL, 6, 0, 0x10, RGB_BLACK);
        }
      }
      break;
    case 3:
      // Fly away, fade out
      data[2] /* tScale */ += 16;
      SetBgAffine(2, 0x7800, 0x1800, 120, data[4] /* tYCoord */ + 32, data[2] /* tScale */, data[2] /* tScale */, 0);
      Task_RayTakesFlightEnd(taskId);
      break;
  }
}

/** 1:1 `static void Task_RayTakesFlightEnd(u8 taskId)` (c:2136). */
function Task_RayTakesFlightEnd(taskId: number): void {
  if (!gPaletteFade.active) {
    SetVBlankCallback(null);
    ResetSpriteData();
    FreeAllSpritePalettes();
    gTasks[taskId].func = (t: { taskId: number }) => Task_SetNextAnim(t.taskId);
  }
}

/** 1:1 `static void Task_TakesFlight_CreateSmoke(u8 taskId)` (c:2153).
 *  Smoke task : [0]=tSmokeId [1]=tTimer ; Smoke sprite : [0]=sSmokeId [1]=sTimer. */
function Task_TakesFlight_CreateSmoke(taskId: number): void {
  const data = gTasks[taskId].data;
  if ((data[1] /* tTimer */ & 3) === 0) {
    const spriteId = CreateSprite(sSpriteTemplate_TakesFlight_Smoke,
      (sTakesFlight_SmokeCoords[data[0] /* tSmokeId */][0] * 4) + 120,
      (sTakesFlight_SmokeCoords[data[0] /* tSmokeId */][1] * 4) + 80,
      0);
    gSprites[spriteId]!.data[0] /* sSmokeId */ = ((data[0] /* tSmokeId */ << 24) >> 24); // (s8)tSmokeId
    gSprites[spriteId]!.objMode = ST_OAM_OBJ_BLEND;
    gSprites[spriteId]!.affineMode = ST_OAM_AFFINE_DOUBLE;
    _oam(gSprites[spriteId]).priority = 2;
    InitSpriteAffineAnim(gSprites[spriteId]!);
    if (data[0] /* tSmokeId */ === MAX_SMOKE - 1) {
      DestroyTask(taskId);
      return;
    } else {
      data[0] /* tSmokeId */++;
    }
  }

  data[1] /* tTimer */++;
}

/** 1:1 `static void SpriteCB_TakesFlight_Smoke(struct Sprite *sprite)` (c:2184). */
function SpriteCB_TakesFlight_Smoke(sprite: DecompSprite): void {
  if (sprite.data[1] /* sTimer */ === 0) {
    sprite.x2 = 0;
    sprite.y2 = 0;
  } else {
    sprite.x2 += sTakesFlight_SmokeCoords[sprite.data[0] /* sSmokeId */][0];
    sprite.y2 += sTakesFlight_SmokeCoords[sprite.data[0] /* sSmokeId */][1];
  }

  sprite.data[1] /* sTimer */++;
  sprite.data[1] /* sTimer */ &= 0xF;
}

// ═══════════════════════════════════════════════════════════════════════════════════
//  RAY_ANIM_DESCENDS (rayquaza_scene.c:2205-2452)
//  Task data : [0]=tState [1]=tTimer
//  Rayquaza sprite : [0]=sTailSpriteId [2]=sTimer [3]=sXMovePeriod [4]=sYMovePeriod
// ═══════════════════════════════════════════════════════════════════════════════════

/** 1:1 `static void InitDescendsSceneBgs(void)` (c:2207). */
function InitDescendsSceneBgs(): void {
  ResetVramOamAndBgCntRegs();
  ResetBgsAndClearDma3BusyFlags(0);
  InitBgsFromTemplates(0, sBgTemplates_Descends, sBgTemplates_Descends.length);
  SetBgTilemapBuffer(0, sRayScene!.tilemapBuffers[0]);
  SetBgTilemapBuffer(1, sRayScene!.tilemapBuffers[1]);
  SetBgTilemapBuffer(2, sRayScene!.tilemapBuffers[2]);
  SetBgTilemapBuffer(3, sRayScene!.tilemapBuffers[3]);
  ResetAllBgsCoordinates();
  ScheduleBgCopyTilemapToVram(0);
  ScheduleBgCopyTilemapToVram(1);
  ScheduleBgCopyTilemapToVram(2);
  ScheduleBgCopyTilemapToVram(3);
  SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);
  ShowBg(0);
  ShowBg(1);
  ShowBg(2);
  ShowBg(3);
  SetGpuReg(REG_OFFSET_BLDCNT, 0);
}

/** 1:1 `static void LoadDescendsSceneGfx(void)` (c:2229). */
function LoadDescendsSceneGfx(): void {
  ResetTempTileDataBuffers();
  DecompressAndCopyTileDataToVram(0, gRaySceneDescends_Light_Gfx, 0, 0, 0);
  DecompressAndCopyTileDataToVram(1, gRaySceneDescends_Bg_Gfx, 0, 0, 0);
  while (FreeTempTileDataBuffersIfPossible()) { /* wait */ }
  LZDecompressWram(gRaySceneDescends_Light_Tilemap, sRayScene!.tilemapBuffers[0]);
  LZDecompressWram(gRaySceneDescends_Bg_Tilemap, sRayScene!.tilemapBuffers[3]);
  CpuFastFill16(0, sRayScene!.tilemapBuffers[2], BG_SCREEN_SIZE);
  CpuFastCopy(sRayScene!.tilemapBuffers[3], sRayScene!.tilemapBuffers[1], BG_SCREEN_SIZE);
  CpuFastFill16(0, sRayScene!.tilemapBuffers[1].subarray(0x100) /* &tilemapBuffers[1][0x100] */, 0x340);

  LoadCompressedPalette('gRaySceneDescends_Bg_Pal', BG_PLTT_ID(0), 2 * PLTT_SIZE_4BPP);
  gPlttBufferUnfaded[0] = RGB_WHITE;
  gPlttBufferFaded[0] = RGB_WHITE;
  LoadCompressedSpriteSheet(sSpriteSheet_Descends_Rayquaza);
  LoadCompressedSpriteSheet(sSpriteSheet_Descends_RayquazaTail);
  LoadCompressedSpritePalette(sSpritePal_Descends_Rayquaza);
}

// Draw ray of light emerging from the clouds
/** 1:1 `static void HBlankCB_RayDescends(void)` (c:2251).
 *  REG_BLDALPHA écrit par SetGpuReg(REG_OFFSET_BLDALPHA) (HW-emu). */
function HBlankCB_RayDescends(): void {
  const vcount = GetGpuReg(REG_OFFSET_VCOUNT);
  if (vcount >= 24 && vcount <= 135 && vcount - 24 <= sRayScene!.revealedLightLine)
    SetGpuReg(REG_OFFSET_BLDALPHA, 0xD08); // This line is above where light has been revealed, draw it
  else
    SetGpuReg(REG_OFFSET_BLDALPHA, 0x1000); // Below where light has been revealed, hide it

  if (vcount === 0) {
    if (sRayScene!.revealedLightLine <= 0x1FFF) {
      // Increase the number of pixel rows of the light that have been revealed
      // Gradually slows as it reaches the bottom
      if (sRayScene!.revealedLightLine <= 39)
        sRayScene!.revealedLightLine += 4;
      else if (sRayScene!.revealedLightLine <= 79)
        sRayScene!.revealedLightLine += 2;
      else
        sRayScene!.revealedLightLine += 1;
    }

    // Pointless
    sRayScene!.revealedLightTimer++;
  }
}

/** 1:1 `static void Task_RayDescendsAnim(u8 taskId)` (c:2281). */
function Task_RayDescendsAnim(taskId: number): void {
  const data = gTasks[taskId].data;
  InitDescendsSceneBgs();
  LoadDescendsSceneGfx();
  SetGpuRegBits(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG0 | BLDCNT_TGT2_BG1 | BLDCNT_TGT2_BG2 | BLDCNT_TGT2_BG3 | BLDCNT_TGT2_OBJ | BLDCNT_EFFECT_BLEND);
  SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(0, 16));
  BlendPalettes(PALETTES_ALL, 0x10, RGB_BLACK);
  SetVBlankCallback(VBlankCB_RayquazaScene);
  sRayScene!.revealedLightLine = 0;
  sRayScene!.revealedLightTimer = 0;
  data[0] /* tState */ = 0;
  data[1] /* tTimer */ = 0;
  data[2] = 0; // Below data assignments do nothing
  data[3] = 0;
  data[4] = 0x1000;
  gTasks[taskId].func = (t: { taskId: number }) => Task_HandleRayDescends(t.taskId);
}

/** 1:1 `static void Task_HandleRayDescends(u8 taskId)` (c:2300). */
function Task_HandleRayDescends(taskId: number): void {
  const data = gTasks[taskId].data;
  switch (data[0] /* tState */) {
    case 0:
      // Delay, then fade in
      if (data[1] /* tTimer */ === 8) {
        BeginNormalPaletteFade(PALETTES_ALL, 0, 0x10, 0, RGB_BLACK);
        data[1] /* tTimer */ = 0;
        data[0] /* tState */++;
      } else {
        data[1] /* tTimer */++;
      }
      break;
    case 1:
      if (!gPaletteFade.active) {
        // Delay, then start ray of light
        if (data[1] /* tTimer */ === 10) {
          data[1] /* tTimer */ = 0;
          data[0] /* tState */++;
          SetHBlankCallback(HBlankCB_RayDescends);
          EnableInterrupts(INTR_FLAG_HBLANK | INTR_FLAG_VBLANK);
        } else {
          data[1] /* tTimer */++;
        }
      }
      break;
    case 2:
      // Delay, then start Rayquaza emerging from clouds
      if (data[1] /* tTimer */ === 80) {
        data[1] /* tTimer */ = 0;
        data[0] /* tState */++;
        CreateDescendsRayquazaSprite();
      } else {
        data[1] /* tTimer */++;
      }
      break;
    case 3:
      // Wait while Rayquaza descends
      if (++data[1] /* tTimer */ === 368) {
        data[1] /* tTimer */ = 0;
        data[0] /* tState */++;
      }
      break;
    case 4:
      // Fade out
      BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);
      gTasks[taskId].func = (t: { taskId: number }) => Task_RayDescendsEnd(t.taskId);
      break;
  }
}

/** 1:1 `static void Task_RayDescendsEnd(u8 taskId)` (c:2364). */
function Task_RayDescendsEnd(taskId: number): void {
  if (!gPaletteFade.active) {
    SetVBlankCallback(null);
    SetHBlankCallback(null);
    ResetSpriteData();
    FreeAllSpritePalettes();
    gTasks[taskId].func = (t: { taskId: number }) => Task_SetNextAnim(t.taskId);
  }
}

/** 1:1 `static u8 CreateDescendsRayquazaSprite(void)` (c:2381). */
function CreateDescendsRayquazaSprite(): number {
  const spriteId = CreateSprite(sSpriteTemplate_Descends_Rayquaza, 160, 0, 0);
  const data = gSprites[spriteId]!.data;
  data[0] /* sTailSpriteId */ = CreateSprite(sSpriteTemplate_Descends_RayquazaTail, 184, -48, 0);
  gSprites[spriteId]!.callback = SpriteCB_Descends_Rayquaza;
  _oam(gSprites[spriteId]).priority = 3;
  _oam(gSprites[data[0] /* sTailSpriteId */]).priority = 3;
  return spriteId;
}

/** 1:1 `static void SpriteCB_Descends_Rayquaza(struct Sprite *sprite)` (c:2392).
 *  Sprite data : [0]=sTailSpriteId [2]=sTimer [3]=sXMovePeriod [4]=sYMovePeriod. */
function SpriteCB_Descends_Rayquaza(sprite: DecompSprite): void {
  const data = sprite.data;
  const frame = data[2] /* sTimer */;

  // Updates to Rayquaza's coords occur more frequently
  // as time goes on (it accelerates as it emerges)
  if (frame === 0) {
    data[3] /* sXMovePeriod */ = 12;
    data[4] /* sYMovePeriod */ = 8;
  } else if (frame === 256) {
    data[3] /* sXMovePeriod */ = 9;
    data[4] /* sYMovePeriod */ = 7;
  } else if (frame === 268) {
    data[3] /* sXMovePeriod */ = 8;
    data[4] /* sYMovePeriod */ = 6;
  } else if (frame === 280) {
    data[3] /* sXMovePeriod */ = 7;
    data[4] /* sYMovePeriod */ = 5;
  } else if (frame === 292) {
    data[3] /* sXMovePeriod */ = 6;
    data[4] /* sYMovePeriod */ = 4;
  } else if (frame === 304) {
    data[3] /* sXMovePeriod */ = 5;
    data[4] /* sYMovePeriod */ = 3;
  } else if (frame === 320) {
    data[3] /* sXMovePeriod */ = 4;
    data[4] /* sYMovePeriod */ = 2;
  }

  if (data[2] /* sTimer */ % data[3] /* sXMovePeriod */ === 0) {
    sprite.x2--;
    gSprites[data[0] /* sTailSpriteId */]!.x2--;
  }
  if (data[2] /* sTimer */ % data[4] /* sYMovePeriod */ === 0) {
    sprite.y2++;
    gSprites[data[0] /* sTailSpriteId */]!.y2++;
  }

  data[2] /* sTimer */++;
}

// ═══════════════════════════════════════════════════════════════════════════════════
//  RAY_ANIM_CHARGES (rayquaza_scene.c:2455-2641)
//  Handle task : [0]=tState [1]=tTimer [2]=tRayquazaTaskId [3]=tSoundTimer
//  Shake/Fly task : [0]=tState [1]=tOffset [2]=tShakeDir [15]=tTimer
// ═══════════════════════════════════════════════════════════════════════════════════

/** 1:1 `static void InitChargesSceneBgs(void)` (c:2457). */
function InitChargesSceneBgs(): void {
  ResetVramOamAndBgCntRegs();
  ResetBgsAndClearDma3BusyFlags(0);
  InitBgsFromTemplates(0, sBgTemplates_Charges, sBgTemplates_Charges.length);
  SetBgTilemapBuffer(0, sRayScene!.tilemapBuffers[0]);
  SetBgTilemapBuffer(1, sRayScene!.tilemapBuffers[1]);
  SetBgTilemapBuffer(2, sRayScene!.tilemapBuffers[2]);
  SetBgTilemapBuffer(3, sRayScene!.tilemapBuffers[3]);
  ResetAllBgsCoordinates();
  ScheduleBgCopyTilemapToVram(0);
  ScheduleBgCopyTilemapToVram(1);
  ScheduleBgCopyTilemapToVram(2);
  ScheduleBgCopyTilemapToVram(3);
  SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP | DISPCNT_WIN0_ON);
  ShowBg(0);
  ShowBg(1);
  ShowBg(2);
  ShowBg(3);
  SetGpuReg(REG_OFFSET_BLDCNT, 0);
}

/** 1:1 `static void LoadChargesSceneGfx(void)` (c:2479). */
function LoadChargesSceneGfx(): void {
  ResetTempTileDataBuffers();
  DecompressAndCopyTileDataToVram(1, gRaySceneCharges_Rayquaza_Gfx, 0, 0, 0);
  DecompressAndCopyTileDataToVram(2, gRaySceneCharges_Streaks_Gfx, 0, 0, 0);
  DecompressAndCopyTileDataToVram(3, gRaySceneCharges_Bg_Gfx, 0, 0, 0);
  while (FreeTempTileDataBuffersIfPossible()) { /* wait */ }
  LZDecompressWram(gRaySceneCharges_Orbs_Tilemap, sRayScene!.tilemapBuffers[0]);
  LZDecompressWram(gRaySceneCharges_Rayquaza_Tilemap, sRayScene!.tilemapBuffers[1]);
  LZDecompressWram(gRaySceneCharges_Streaks_Tilemap, sRayScene!.tilemapBuffers[2]);
  LZDecompressWram(gRaySceneCharges_Bg_Tilemap, sRayScene!.tilemapBuffers[3]);
  LoadCompressedPalette('gRaySceneCharges_Bg_Pal', BG_PLTT_ID(0), 4 * PLTT_SIZE_4BPP);
}

/** 1:1 `static void Task_RayChargesAnim(u8 taskId)` (c:2499). */
function Task_RayChargesAnim(taskId: number): void {
  const data = gTasks[taskId].data;
  InitChargesSceneBgs();
  LoadChargesSceneGfx();
  SetWindowsHideVertBorders();
  BlendPalettes(PALETTES_ALL, 0x10, RGB_BLACK);
  SetVBlankCallback(VBlankCB_RayquazaScene);
  data[0] /* tState */ = 0;
  data[1] /* tTimer */ = 0;
  data[2] /* tRayquazaTaskId */ = CreateTask((t: { taskId: number }) => Task_RayCharges_ShakeRayquaza(t.taskId), 0);
  gTasks[taskId].func = (t: { taskId: number }) => Task_HandleRayCharges(t.taskId);
}

/** 1:1 `static void Task_HandleRayCharges(u8 taskId)` (c:2513). */
function Task_HandleRayCharges(taskId: number): void {
  const data = gTasks[taskId].data;
  RayCharges_AnimateBg();
  if ((data[3] /* tSoundTimer */ & 7) === 0 && data[0] /* tState */ <= 1 && data[1] /* tTimer */ <= 89)
    PlaySE(SE_INTRO_BLAST);

  data[3] /* tSoundTimer */++;
  switch (data[0] /* tState */) {
    case 0:
      // Delay, then fade in
      if (data[1] /* tTimer */ === 8) {
        BeginNormalPaletteFade(PALETTES_ALL, 0, 0x10, 0, RGB_BLACK);
        data[1] /* tTimer */ = 0;
        data[0] /* tState */++;
      } else {
        data[1] /* tTimer */++;
      }
      break;
    case 1:
      // Delay while Rayquaza shakes, then start Rayquaza moving offscreen
      if (data[1] /* tTimer */ === 127) {
        data[1] /* tTimer */ = 0;
        data[0] /* tState */++;
        gTasks[data[2] /* tRayquazaTaskId */].func = (t: { taskId: number }) => Task_RayCharges_FlyOffscreen(t.taskId);
      } else {
        data[1] /* tTimer */++;
      }
      break;
    case 2:
      // Delay for Rayquaza's flying animation
      if (data[1] /* tTimer */ === 12) {
        data[1] /* tTimer */ = 0;
        data[0] /* tState */++;
      } else {
        data[1] /* tTimer */++;
      }
      break;
    case 3:
      // Fade out
      BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);
      gTasks[taskId].func = (t: { taskId: number }) => Task_RayChargesEnd(t.taskId);
      break;
  }
}

/** 1:1 `static void Task_RayCharges_ShakeRayquaza(u8 taskId)` (c:2578).
 *  data : [0]=tState [1]=tOffset [2]=tShakeDir [15]=tTimer. */
function Task_RayCharges_ShakeRayquaza(taskId: number): void {
  const data = gTasks[taskId].data;
  if ((data[15] /* tTimer */ & 3) === 0) {
    ChangeBgX(1, (Random() % 8 - 4) << 8, BG_COORD_SET);
    ChangeBgY(1, (Random() % 8 - 4) << 8, BG_COORD_SET);
  }

  data[15] /* tTimer */++;
}

// Rayquaza backs up then launches forward
/** 1:1 `static void Task_RayCharges_FlyOffscreen(u8 taskId)` (c:2591). */
function Task_RayCharges_FlyOffscreen(taskId: number): void {
  const data = gTasks[taskId].data;
  if (data[0] /* tState */ === 0) {
    ChangeBgX(1, 0, BG_COORD_SET);
    ChangeBgY(1, 0, BG_COORD_SET);
    data[0] /* tState */++;
    data[1] /* tOffset */ = 10;
    data[2] /* tShakeDir */ = -1;
  } else if (data[0] /* tState */ === 1) {
    ChangeBgX(1, data[1] /* tOffset */ << 8, BG_COORD_SUB);
    ChangeBgY(1, data[1] /* tOffset */ << 8, BG_COORD_ADD);
    data[1] /* tOffset */ += data[2] /* tShakeDir */;
    if (data[1] /* tOffset */ === -10)
      data[2] /* tShakeDir */ *= -1;
  }
}

/** 1:1 `static void RayCharges_AnimateBg(void)` (c:2617). */
function RayCharges_AnimateBg(): void {
  // Update yellow orbs
  ChangeBgX(2, 0x400, BG_COORD_SUB);
  ChangeBgY(2, 0x400, BG_COORD_ADD);

  // Update blue streaks
  ChangeBgX(0, 0x800, BG_COORD_SUB);
  ChangeBgY(0, 0x800, BG_COORD_ADD);
}

/** 1:1 `static void Task_RayChargesEnd(u8 taskId)` (c:2628). */
function Task_RayChargesEnd(taskId: number): void {
  const data = gTasks[taskId].data;
  RayCharges_AnimateBg();
  if (!gPaletteFade.active) {
    SetVBlankCallback(null);
    ResetWindowDimensions();
    DestroyTask(data[2] /* tRayquazaTaskId */);
    gTasks[taskId].func = (t: { taskId: number }) => Task_SetNextAnim(t.taskId);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//  RAY_ANIM_CHASES_AWAY (rayquaza_scene.c:2644-3190)
//  Handle task : [0]=tState [1]=tTimer [2]=tBgTaskId
//  AnimateBg task : [0]=tTimer [1]=tBlendHi [2]=tBlendLo [3]=tBlendHiDir [4]=tBlendLoDir
//  End task : [1]=tTimer [2]=tBgTaskId
//  Trio ids (taskData) : [3]=tGroudonSpriteId [4]=tKyogreSpriteId [5]=tRayquazaSpriteId
// ═══════════════════════════════════════════════════════════════════════════════════

/** 1:1 `static void InitChasesAwaySceneBgs(void)` (c:2646). */
function InitChasesAwaySceneBgs(): void {
  ResetVramOamAndBgCntRegs();
  ResetBgsAndClearDma3BusyFlags(0);
  InitBgsFromTemplates(1, sBgTemplates_ChasesAway, sBgTemplates_ChasesAway.length);
  SetBgTilemapBuffer(0, sRayScene!.tilemapBuffers[0]);
  SetBgTilemapBuffer(1, sRayScene!.tilemapBuffers[1]);
  SetBgTilemapBuffer(2, sRayScene!.tilemapBuffers[2]);
  ResetAllBgsCoordinates();
  ScheduleBgCopyTilemapToVram(0);
  ScheduleBgCopyTilemapToVram(1);
  ScheduleBgCopyTilemapToVram(2);
  SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP | DISPCNT_WIN0_ON);
  ShowBg(0);
  ShowBg(1);
  ShowBg(2);
  SetGpuReg(REG_OFFSET_BLDCNT, 0);
}

/** 1:1 `static void LoadChasesAwaySceneGfx(void)` (c:2665). */
function LoadChasesAwaySceneGfx(): void {
  ResetTempTileDataBuffers();
  DecompressAndCopyTileDataToVram(2, gRaySceneChasesAway_Ring_Gfx, 0, 0, 0);
  DecompressAndCopyTileDataToVram(0, gRaySceneChasesAway_Light_Gfx, 0, 0, 0);
  while (FreeTempTileDataBuffersIfPossible()) { /* wait */ }
  LZDecompressWram(gRaySceneChasesAway_Bg_Tilemap, sRayScene!.tilemapBuffers[1]);
  LZDecompressWram(gRaySceneChasesAway_Light_Tilemap, sRayScene!.tilemapBuffers[0]);
  LZDecompressWram(gRaySceneChasesAway_Ring_Tilemap, sRayScene!.tilemapBuffers[2]);
  LoadCompressedPalette('gRaySceneChasesAway_Bg_Pal', BG_PLTT_ID(0), 3 * PLTT_SIZE_4BPP);
  LoadCompressedSpriteSheet(sSpriteSheet_ChasesAway_Groudon);
  LoadCompressedSpriteSheet(sSpriteSheet_ChasesAway_GroudonTail);
  LoadCompressedSpriteSheet(sSpriteSheet_ChasesAway_Kyogre);
  LoadCompressedSpriteSheet(sSpriteSheet_ChasesAway_Rayquaza);
  LoadCompressedSpriteSheet(sSpriteSheet_ChasesAway_RayquazaTail);
  LoadCompressedSpriteSheet(sSpriteSheet_ChasesAway_KyogreSplash);
  LoadCompressedSpritePalette(sSpritePal_ChasesAway_Groudon);
  LoadCompressedSpritePalette(sSpritePal_ChasesAway_Kyogre);
  LoadCompressedSpritePalette(sSpritePal_ChasesAway_Rayquaza);
  LoadCompressedSpritePalette(sSpritePal_ChasesAway_KyogreSplash);
}

/** 1:1 `static void Task_RayChasesAwayAnim(u8 taskId)` (c:2692). */
function Task_RayChasesAwayAnim(taskId: number): void {
  const data = gTasks[taskId].data;
  InitChasesAwaySceneBgs();
  LoadChasesAwaySceneGfx();
  SetWindowsHideVertBorders();
  ClearGpuRegBits(REG_OFFSET_DISPCNT, DISPCNT_BG2_ON);
  SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG0 | BLDCNT_TGT2_BG1 | BLDCNT_EFFECT_BLEND);
  SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(9, 14));
  BlendPalettes(PALETTES_ALL, 0x10, RGB_BLACK);
  SetVBlankCallback(VBlankCB_RayquazaScene);
  data[0] /* tState */ = 0;
  data[1] /* tTimer */ = 0;
  gTasks[taskId].func = (t: { taskId: number }) => Task_HandleRayChasesAway(t.taskId);
  // funcRef : nos tasks tournent via un wrapper anonyme (t)=>fn(t.taskId), donc
  // `task.func === Task_HandleRayChasesAway` est TOUJOURS faux. FindTaskIdByFunc (decomp-globals)
  // retombe alors sur le tag `task.funcRef` — on le pose ici (précédent evolution_scene.ts
  // _setTaskFunc:167-171). Lu par SpriteCB_ChasesAway_Rayquaza:frame 352 → FindTaskIdByFunc(Task_HandleRayChasesAway).
  (gTasks[taskId] as unknown as { funcRef?: unknown }).funcRef = Task_HandleRayChasesAway;
  data[2] /* tBgTaskId */ = CreateTask((t: { taskId: number }) => Task_ChasesAway_AnimateBg(t.taskId), 0);
  gTasks[data[2] /* tBgTaskId */].data[0] = 0;
  gTasks[data[2] /* tBgTaskId */].data[1] = 0;
  gTasks[data[2] /* tBgTaskId */].data[2] = 0;
  gTasks[data[2] /* tBgTaskId */].data[3] = 1;
  gTasks[data[2] /* tBgTaskId */].data[4] = 1;
}

/** 1:1 `static void Task_HandleRayChasesAway(u8 taskId)` (c:2714). */
function Task_HandleRayChasesAway(taskId: number): void {
  const data = gTasks[taskId].data;
  switch (data[0] /* tState */) {
    case 0:
      // Delay, then fade in
      if (data[1] /* tTimer */ === 8) {
        ChasesAway_CreateTrioSprites(taskId);
        BeginNormalPaletteFade(PALETTES_ALL, 0, 0x10, 0, RGB_BLACK);
        data[1] /* tTimer */ = 0;
        data[0] /* tState */++;
      } else {
        data[1] /* tTimer */++;
      }
      break;
    case 1:
      // Wait for Rayquaza to enter and finish shout anim
      if (gSprites[data[5] /* tRayquazaSpriteId */]!.callback === SpriteCB_ChasesAway_RayquazaFloat) {
        // Delay, then start Groudon/Kyogre leaving
        if (data[1] /* tTimer */ === 64) {
          ChasesAway_KyogreStartLeave(taskId);
          ChasesAway_GroudonStartLeave(taskId);
          data[1] /* tTimer */ = 0;
          data[0] /* tState */++;
        } else {
          data[1] /* tTimer */++;
        }
      }
      break;
    case 2:
      // Wait for Groudon/Kyogre to leave
      if (data[1] /* tTimer */ === 448) {
        data[1] /* tTimer */ = 0;
        data[0] /* tState */++;
      } else {
        // Flash bg white and trio black a few times
        data[1] /* tTimer */++;
        if (data[1] /* tTimer */ % 144 === 0) {
          BlendPalettesGradually(PALETTES_BG & ~1, 0, 16, 0, RGB_WHITEALPHA, 0, 0);
          BlendPalettesGradually(PALETTES_OBJECTS, 0, 16, 0, RGB_BLACK, 0, 1);
        }
      }
      break;
    case 3:
      // Fade out
      BeginNormalPaletteFade(PALETTES_ALL, 4, 0, 0x10, RGB_BLACK);
      gTasks[taskId].func = (t: { taskId: number }) => Task_RayChasesAwayEnd(t.taskId);
      break;
  }
}

// Flickers the ray of light behind Rayquaza
/** 1:1 `static void Task_ChasesAway_AnimateBg(u8 taskId)` (c:2787).
 *  data : [0]=tTimer [1]=tBlendHi [2]=tBlendLo [3]=tBlendHiDir [4]=tBlendLoDir. */
function Task_ChasesAway_AnimateBg(taskId: number): void {
  const data = gTasks[taskId].data;
  if ((data[0] /* tTimer */ & 0xF) === 0) {
    SetGpuReg(REG_OFFSET_BLDALPHA, ((data[1] /* tBlendHi */ + 14) << 8 & 0x1F00) | ((data[2] /* tBlendLo */ + 9) & 0xF));
    data[1] /* tBlendHi */ -= data[3] /* tBlendHiDir */;
    data[2] /* tBlendLo */ += data[4] /* tBlendLoDir */;
    if (data[1] /* tBlendHi */ === -3 || data[1] /* tBlendHi */ === 0)
      data[3] /* tBlendHiDir */ *= -1;
    if (data[2] /* tBlendLo */ === 3 || data[2] /* tBlendLo */ === 0)
      data[4] /* tBlendLoDir */ *= -1;
  }

  data[0] /* tTimer */++;
}

/** 1:1 `static void Task_RayChasesAwayEnd(u8 taskId)` (c:2812).
 *  data : [1]=tTimer [2]=tBgTaskId. */
function Task_RayChasesAwayEnd(taskId: number): void {
  const data = gTasks[taskId].data;
  if (!gPaletteFade.active) {
    StopMapMusic();
    if (data[1] /* tTimer */ === 0) {
      SetVBlankCallback(null);
      ResetWindowDimensions();
      ResetSpriteData();
      FreeAllSpritePalettes();
      DestroyTask(data[2] /* tBgTaskId */);
    }

    if (data[1] /* tTimer */ === 32) {
      data[1] /* tTimer */ = 0;
      gTasks[taskId].func = (t: { taskId: number }) => Task_SetNextAnim(t.taskId);
    } else {
      data[1] /* tTimer */++;
    }
  }
}

/** 1:1 `static void ChasesAway_CreateTrioSprites(u8 taskId)` (c:2846).
 *  taskData : [3]=tGroudonSpriteId [4]=tKyogreSpriteId [5]=tRayquazaSpriteId. */
function ChasesAway_CreateTrioSprites(taskId: number): void {
  let spriteData: number[];

  const taskData = gTasks[taskId].data;

  taskData[3] /* tGroudonSpriteId */ = CreateSprite(sSpriteTemplate_ChasesAway_Groudon, 64, 120, 0);
  spriteData = gSprites[taskData[3] /* tGroudonSpriteId */]!.data;
  spriteData[0] = CreateSprite(sSpriteTemplate_ChasesAway_GroudonTail, 16, 130, 0);
  _oam(gSprites[taskData[3] /* tGroudonSpriteId */]).priority = 1;
  _oam(gSprites[spriteData[0]]).priority = 1;

  taskData[4] /* tKyogreSpriteId */ = CreateSprite(sSpriteTemplate_ChasesAway_Kyogre, 160, 128, 1);
  spriteData = gSprites[taskData[4] /* tKyogreSpriteId */]!.data;
  spriteData[0] = CreateSprite(sSpriteTemplate_ChasesAway_Kyogre, 192, 128, 1);
  spriteData[1] = CreateSprite(sSpriteTemplate_ChasesAway_Kyogre, 224, 128, 1);
  _oam(gSprites[taskData[4] /* tKyogreSpriteId */]).priority = 1;
  _oam(gSprites[spriteData[0]]).priority = 1;
  _oam(gSprites[spriteData[1]]).priority = 1;
  StartSpriteAnim(gSprites[spriteData[0]]!, 1);
  StartSpriteAnim(gSprites[spriteData[1]]!, 2);

  taskData[5] /* tRayquazaSpriteId */ = CreateSprite(sSpriteTemplate_ChasesAway_Rayquaza, 120, -65, 0);
  spriteData = gSprites[taskData[5] /* tRayquazaSpriteId */]!.data;
  spriteData[0] = CreateSprite(sSpriteTemplate_ChasesAway_RayquazaTail, 120, -113, 0);
  _oam(gSprites[taskData[5] /* tRayquazaSpriteId */]).priority = 1;
  _oam(gSprites[spriteData[0]]).priority = 1;
}

/** 1:1 `static void ChasesAway_PushDuoBack(u8 taskId)` (c:2882).
 *  Sprite data : [0]=sBodyPartSpriteId1 [1]=sBodyPartSpriteId2 [4]=sTimer [5]=sDecel [6]=sSpeed [7]=sIsKyogre.
 *  taskData : [3]=tGroudonSpriteId [4]=tKyogreSpriteId. */
function ChasesAway_PushDuoBack(taskId: number): void {
  const taskData = gTasks[taskId].data;

  gSprites[taskData[3] /* tGroudonSpriteId */]!.callback = SpriteCB_ChasesAway_DuoRingPush;
  gSprites[taskData[3] /* tGroudonSpriteId */]!.data[4] /* sTimer */ = 0;
  gSprites[taskData[3] /* tGroudonSpriteId */]!.data[5] /* sDecel */ = 0;
  gSprites[taskData[3] /* tGroudonSpriteId */]!.data[6] /* sSpeed */ = 4;
  gSprites[taskData[3] /* tGroudonSpriteId */]!.data[7] /* sIsKyogre */ = 0; // FALSE

  gSprites[taskData[4] /* tKyogreSpriteId */]!.callback = SpriteCB_ChasesAway_DuoRingPush;
  gSprites[taskData[4] /* tKyogreSpriteId */]!.data[4] /* sTimer */ = 0;
  gSprites[taskData[4] /* tKyogreSpriteId */]!.data[5] /* sDecel */ = 0;
  gSprites[taskData[4] /* tKyogreSpriteId */]!.data[6] /* sSpeed */ = 4;
  gSprites[taskData[4] /* tKyogreSpriteId */]!.data[7] /* sIsKyogre */ = 1; // TRUE
}

// Pushes Groudon/Kyogre back slightly, for when Rayquaza's hyper voice ring comes out
/** 1:1 `static void SpriteCB_ChasesAway_DuoRingPush(struct Sprite *sprite)` (c:2900). */
function SpriteCB_ChasesAway_DuoRingPush(sprite: DecompSprite): void {
  const data = sprite.data;
  if ((data[4] /* sTimer */ & 7) === 0) {
    if (!data[7] /* sIsKyogre */) {
      sprite.x -= data[6] /* sSpeed */;
      gSprites[data[0] /* sBodyPartSpriteId1 */]!.x -= data[6] /* sSpeed */;
    } else {
      sprite.x += data[6] /* sSpeed */;
      gSprites[data[0] /* sBodyPartSpriteId1 */]!.x += data[6] /* sSpeed */;
      gSprites[data[1] /* sBodyPartSpriteId2 */]!.x += data[6] /* sSpeed */;
    }

    data[5] /* sDecel */++;
    data[6] /* sSpeed */ -= data[5] /* sDecel */;
    if (data[5] /* sDecel */ === 3) {
      data[4] /* sTimer */ = 0;
      data[5] /* sDecel */ = 0;
      data[6] /* sSpeed */ = 0;
      sprite.callback = SpriteCallbackDummy;
      return;
    }
  }

  data[4] /* sTimer */++;
}

/** 1:1 `static void ChasesAway_GroudonStartLeave(u8 taskId)` (c:2938). */
function ChasesAway_GroudonStartLeave(taskId: number): void {
  const taskData = gTasks[taskId].data;
  gSprites[taskData[3] /* tGroudonSpriteId */]!.callback = SpriteCB_ChasesAway_GroudonLeave;
  StartSpriteAnim(gSprites[taskData[3] /* tGroudonSpriteId */]!, 1);
}

/** 1:1 `static void SpriteCB_ChasesAway_GroudonLeave(struct Sprite *sprite)` (c:2945). */
function SpriteCB_ChasesAway_GroudonLeave(sprite: DecompSprite): void {
  switch (sprite.animCmdIndex) {
    case 0:
    case 2:
      if (sprite.animDelayCounter % 12 === 0) {
        sprite.x -= 2;
        gSprites[sprite.data[0]]!.x -= 2;
      }
      gSprites[sprite.data[0]]!.y2 = 0;
      break;
    case 1:
    case 3:
      gSprites[sprite.data[0]]!.y2 = -2;
      if ((sprite.animDelayCounter & 15) === 0) {
        sprite.y++;
        gSprites[sprite.data[0]]!.y++;
      }
      break;
  }
}

/** 1:1 `static void ChasesAway_KyogreStartLeave(u8 taskId)` (c:2970). */
function ChasesAway_KyogreStartLeave(taskId: number): void {
  const taskData = gTasks[taskId].data;
  const spriteData = gSprites[taskData[4] /* tKyogreSpriteId */]!.data;

  gSprites[taskData[4] /* tKyogreSpriteId */]!.callback = SpriteCB_ChasesAway_KyogreLeave;
  gSprites[spriteData[0]]!.callback = SpriteCB_ChasesAway_KyogreLeave;
  gSprites[spriteData[1]]!.callback = SpriteCB_ChasesAway_KyogreLeave;
}

/** 1:1 `static void SpriteCB_ChasesAway_KyogreLeave(struct Sprite *sprite)` (c:2982). */
function SpriteCB_ChasesAway_KyogreLeave(sprite: DecompSprite): void {
  if ((sprite.data[4] & 3) === 0) {
    if (sprite.x2 === 1)
      sprite.x2 = -1;
    else
      sprite.x2 = 1;
  }
  if (sprite.data[5] === 128) {
    sprite.data[7] = CreateSprite(sSpriteTemplate_ChasesAway_KyogreSplash, 152, 132, 0);
    _oam(gSprites[sprite.data[7]]).priority = 1;
    sprite.data[7] = CreateSprite(sSpriteTemplate_ChasesAway_KyogreSplash, 224, 132, 0);
    _oam(gSprites[sprite.data[7]]).priority = 1;
    gSprites[sprite.data[7]]!.hFlip = true; // 1:1 hFlip = 1
    sprite.data[5]++;
  }
  if (sprite.data[5] > 127) {
    if (sprite.y2 !== 32) {
      sprite.data[6]++;
      sprite.y2 = sprite.data[6] >> 4;
    }
  } else {
    sprite.data[5]++;
  }

  if (sprite.data[4] % 64 === 0)
    PlaySE(SE_M_WHIRLPOOL);

  sprite.data[4]++;
}

/** 1:1 `static void SpriteCB_ChasesAway_Rayquaza(struct Sprite *sprite)` (c:3028).
 *  Body data : [0]=sTailSpriteId [4]=sYOffset [5]=sYOffsetDir [6]=sFloatTimer [7]=sTimer.
 *  Tail data : [4]=sTailFloatDelay [5]=sTailFloatPeak. */
function SpriteCB_ChasesAway_Rayquaza(sprite: DecompSprite): void {
  const frame = sprite.data[7] /* sTimer */;
  if (frame <= 64) {
    sprite.y2 += 2;
    gSprites[sprite.data[0] /* sTailSpriteId */]!.y2 += 2;
    if (sprite.data[7] /* sTimer */ === 64) {
      ChasesAway_SetRayquazaAnim(sprite, 1, 0, -48);
      sprite.data[4] /* sYOffset */ = 5;
      sprite.data[5] /* sYOffsetDir */ = -1;
      gSprites[sprite.data[0] /* sTailSpriteId */]!.data[4] /* sTailFloatDelay */ = 3;
      gSprites[sprite.data[0] /* sTailSpriteId */]!.data[5] /* sTailFloatPeak */ = 5;
    }
  } else if (frame <= 111) {
    SpriteCB_ChasesAway_RayquazaFloat(sprite);
    if (sprite.data[4] /* sYOffset */ === 0)
      PlaySE(SE_MUGSHOT);
    if (sprite.data[4] /* sYOffset */ === -3)
      ChasesAway_SetRayquazaAnim(sprite, 2, 48, 16);
  } else if (frame === 112) {
    gSprites[sprite.data[0] /* sTailSpriteId */]!.data[4] /* sTailFloatDelay */ = 7;
    gSprites[sprite.data[0] /* sTailSpriteId */]!.data[5] /* sTailFloatPeak */ = 3;
    SpriteCB_ChasesAway_RayquazaFloat(sprite);
  } else if (frame <= 327) {
    SpriteCB_ChasesAway_RayquazaFloat(sprite);
  } else if (frame === 328) {
    SpriteCB_ChasesAway_RayquazaFloat(sprite);
    ChasesAway_SetRayquazaAnim(sprite, 3, 48, 16);
    sprite.x2 = 1;
    gSprites[sprite.data[0] /* sTailSpriteId */]!.x2 = 1;
    PlayCry_Normal(SPECIES_RAYQUAZA, 0);
    CreateTask((t: { taskId: number }) => Task_ChasesAway_AnimateRing(t.taskId), 0);
  } else {
    switch (frame) {
      case 376:
        sprite.x2 = 0;
        gSprites[sprite.data[0] /* sTailSpriteId */]!.x2 = 0;
        SpriteCB_ChasesAway_RayquazaFloat(sprite);
        ChasesAway_SetRayquazaAnim(sprite, 2, 48, 16);
        sprite.callback = SpriteCB_ChasesAway_RayquazaFloat;
        return;
      case 352:
        ChasesAway_PushDuoBack(FindTaskIdByFunc(Task_HandleRayChasesAway));
        break;
    }
  }

  if (sprite.data[7] /* sTimer */ > 328 && (sprite.data[7] /* sTimer */ & 1) === 0) {
    sprite.x2 *= -1;
    gSprites[sprite.data[0] /* sTailSpriteId */]!.x2 = sprite.x2;
  }

  sprite.data[7] /* sTimer */++;
}

/** 1:1 `static void SpriteCB_ChasesAway_RayquazaFloat(struct Sprite *body)` (c:3097). */
function SpriteCB_ChasesAway_RayquazaFloat(body: DecompSprite): void {
  const tail = gSprites[body.data[0] /* sTailSpriteId */]!;
  if (!(body.data[6] /* sFloatTimer */ & tail.data[4] /* sTailFloatDelay */)) {
    body.y2 += body.data[4] /* sYOffset */;
    gSprites[body.data[0] /* sTailSpriteId */]!.y2 += body.data[4] /* sYOffset */; // why access gSprites again? tail->y2 would be sufficient
    body.data[4] /* sYOffset */ += body.data[5] /* sYOffsetDir */;
    if (body.data[4] /* sYOffset */ >= tail.data[5] /* sTailFloatPeak */ || body.data[4] /* sYOffset */ <= -tail.data[5] /* sTailFloatPeak */) {
      if (body.data[4] /* sYOffset */ > tail.data[5] /* sTailFloatPeak */)
        body.data[4] /* sYOffset */ = tail.data[5] /* sTailFloatPeak */;
      else if (body.data[4] /* sYOffset */ < -tail.data[5] /* sTailFloatPeak */)
        body.data[4] /* sYOffset */ = -tail.data[5] /* sTailFloatPeak */;

      body.data[5] /* sYOffsetDir */ *= -1;
    }
  }

  body.data[6] /* sFloatTimer */++;
}

/** 1:1 `static void ChasesAway_SetRayquazaAnim(struct Sprite *body, u8 animNum, s16 x, s16 y)` (c:3119). */
function ChasesAway_SetRayquazaAnim(body: DecompSprite, animNum: number, x: number, y: number): void {
  const tail = gSprites[body.data[0] /* sTailSpriteId */]!;

  tail.x = body.x + x;
  tail.y = body.y + y;

  tail.x2 = body.x2;
  tail.y2 = body.y2;

  StartSpriteAnim(body, animNum);
  StartSpriteAnim(tail, animNum);
}

/** 1:1 `static void Task_ChasesAway_AnimateRing(u8 taskId)` (c:3148).
 *  data : [0]=tState [1]=tScale [2]=tNumRings [3]=tScaleTimer [4]=tScaleSpeed [5]=tSoundTimer. */
function Task_ChasesAway_AnimateRing(taskId: number): void {
  const data = gTasks[taskId].data;
  switch (data[0] /* tState */) {
    case 0:
      SetBgAffine(2, 0x4000, 0x4000, 120, 64, 256, 256, 0);
      SetGpuRegBits(REG_OFFSET_DISPCNT, DISPCNT_BG2_ON);
      data[4] /* tScaleSpeed */ = 16;
      data[0] /* tState */++;
      break;
    case 1:
      if (data[5] /* tSoundTimer */ === 8)
        PlaySE(SE_SLIDING_DOOR);
      if (data[2] /* tNumRings */ === 2) {
        data[0] /* tState */++;
      } else {
        data[1] /* tScale */ += data[4] /* tScaleSpeed */;
        data[5] /* tSoundTimer */++;
        if (data[3] /* tScaleTimer */ % 3 === 0 && data[4] /* tScaleSpeed */ !== 4)
          data[4] /* tScaleSpeed */ -= 2;

        data[3] /* tScaleTimer */++;
        SetBgAffine(2, 0x4000, 0x4000, 120, 64, 256 - data[1] /* tScale */, 256 - data[1] /* tScale */, 0);
        if (data[1] /* tScale */ > 255) {
          data[1] /* tScale */ = 0;
          data[3] /* tScaleTimer */ = 0;
          data[5] /* tSoundTimer */ = 0;
          data[4] /* tScaleSpeed */ = 16;
          data[2] /* tNumRings */++;
        }
      }
      break;
    case 2:
      ClearGpuRegBits(REG_OFFSET_DISPCNT, DISPCNT_BG2_ON);
      DestroyTask(taskId);
      break;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//  PRÉCHARGEUR ASSETS (adaptation moteur — pattern preloadHallOfFameAssets)
// ═══════════════════════════════════════════════════════════════════════════════════
let _rayAssetsRequested = false;
let _rayAssetsSettled = false;

/** GATE assets du CB2 (adaptation fetch async — pattern hall_of_fame._ensureHofAssets:1072) :
 *  true quand le préchargement est réglé (chargé OU échoué → jamais de gel). Filet de sécurité :
 *  si le préchargement n'a pas été lancé (voie dev __rayTest sans passer par le special), le lance. */
function _ensureRayAssets(): boolean {
  if (!_rayAssetsRequested)
    preloadRayquazaSceneAssets().catch((e) => console.error('[rayquaza_scene] preload (gate)', e));
  return _rayAssetsSettled;
}

// Sonde dev (harness, hors 1:1) : état courant de la cinématique pour labelliser/pauser les
// captures (dev.pauseAt). Lit sRayScene au call → animId (0..6) + endEarly + assets réglés.
(globalThis as { __rayInfo?: () => unknown }).__rayInfo = () =>
  sRayScene ? { animId: sRayScene.animId, endEarly: sRayScene.endEarly, settled: _rayAssetsSettled } : { animId: null, settled: _rayAssetsSettled };

/**
 * Précharge TOUS les assets de la scène Rayquaza vers l'assetCache + lie les vars de fond.
 * À lancer AVANT le CB2 (au câblage de Script_DoRayquazaScene), `.catch` HURLANT — jamais
 * dans le CB2 synchrone (piège FREEZE). Chaque asset absent → console.error SANS figer.
 *
 * Clés assetCache = noms des symboles décomp (sprite-sheets/palettes + palettes BG résolus par
 * LoadCompressedSpriteSheet/Palette + LoadCompressedPalette). Les gfx/tilemaps de fond sont
 * aussi liés aux vars module `gRayScene*` (args directs de DecompressAndCopyTileDataToVram/
 * LZDecompressWram).
 */
export async function preloadRayquazaSceneAssets(): Promise<void> {
  _rayAssetsRequested = true;
  _rayAssetsSettled = false;
  const BASE = '/decomp/em/rayquaza_scene';
  try {
    const { loadTileBin, loadTilemapBin, loadGbaPal, extractPngPlte } = await import('../harness/gba/png-loader');

    // Helper : charge des tuiles PNG (bpp) → assetCache[key] + retourne le buffer (ou null si KO).
    const tiles = async (key: string, path: string, bpp: 4 | 8): Promise<Uint8Array | null> => {
      try {
        const t = await loadTileBin(path, bpp);
        assetCache.set(key, t);
        return t;
      } catch (e) { console.error('[rayquaza_scene] tiles KO', key, path, e); return null; }
    };
    // Helper : palette depuis un fichier .pal (JASC/binaire GBA) → assetCache[key].
    // Palette COMPLÈTE stockée (les .pal de fond en contiennent 2-4 : clouds=2, charges bg=4,
    // chases bg=3 ; LoadCompressedPalette lit `sizeBytes` demandés).
    const pal = async (key: string, path: string): Promise<void> => {
      try { assetCache.set(key, await loadGbaPal(path)); }
      catch (e) { console.error('[rayquaza_scene] pal KO', key, path, e); }
    };
    // Helper : palette EXTRAITE du chunk PLTE d'un PNG (décomp `.gbapal.lz` généré du .png).
    // Full PLTE stockée (scene_2 rayquaza.png 8bpp = pal 1 Rayquaza + pal 2 fond).
    const palPng = async (key: string, path: string): Promise<void> => {
      try {
        const p = await extractPngPlte(path);
        if (p) assetCache.set(key, p);
        else console.error('[rayquaza_scene] palPng : PNG non indexé (pas de PLTE)', key, path);
      } catch (e) { console.error('[rayquaza_scene] palPng KO', key, path, e); }
    };
    // Helper : charge un tilemap .bin → assetCache[key] + retourne le buffer.
    const tmap = async (key: string, path: string): Promise<Uint16Array | null> => {
      try {
        const m = await loadTilemapBin(path);
        assetCache.set(key, m);
        return m;
      } catch (e) { console.error('[rayquaza_scene] tilemap KO', key, path, e); return null; }
    };

    await Promise.all([
      // ── Scene 1 : DuoFight ──
      (async () => { gRaySceneDuoFight_Clouds_Gfx = await tiles('gRaySceneDuoFight_Clouds_Gfx', `${BASE}/scene_1/clouds.png`, 4); })(),
      pal('gRaySceneDuoFight_Clouds_Pal', `${BASE}/scene_1/clouds.pal`),
      (async () => { gRaySceneDuoFight_Clouds1_Tilemap = await tmap('gRaySceneDuoFight_Clouds1_Tilemap', `${BASE}/scene_1/clouds1.bin`); })(),
      (async () => { gRaySceneDuoFight_Clouds2_Tilemap = await tmap('gRaySceneDuoFight_Clouds2_Tilemap', `${BASE}/scene_1/clouds2.bin`); })(),
      (async () => { gRaySceneDuoFight_Clouds3_Tilemap = await tmap('gRaySceneDuoFight_Clouds3_Tilemap', `${BASE}/scene_1/clouds3.bin`); })(),
      tiles('gRaySceneDuoFight_Groudon_Gfx', `${BASE}/scene_1/groudon.png`, 4),
      palPng('gRaySceneDuoFight_Groudon_Pal', `${BASE}/scene_1/groudon.png`),
      tiles('gRaySceneDuoFight_GroudonShoulder_Gfx', `${BASE}/scene_1/groudon_shoulder.png`, 4),
      tiles('gRaySceneDuoFight_GroudonClaw_Gfx', `${BASE}/scene_1/groudon_claw.png`, 4),
      tiles('gRaySceneDuoFight_Kyogre_Gfx', `${BASE}/scene_1/kyogre.png`, 4),
      palPng('gRaySceneDuoFight_Kyogre_Pal', `${BASE}/scene_1/kyogre.png`),
      tiles('gRaySceneDuoFight_KyogrePectoralFin_Gfx', `${BASE}/scene_1/kyogre_pectoral_fin.png`, 4),
      tiles('gRaySceneDuoFight_KyogreDorsalFin_Gfx', `${BASE}/scene_1/kyogre_dorsal_fin.png`, 4),
      // ── Scene 2 : TakesFlight ──
      (async () => { gRaySceneTakesFlight_Bg_Gfx = await tiles('gRaySceneTakesFlight_Bg_Gfx', `${BASE}/scene_2/bg.png`, 4); })(),
      (async () => { gRaySceneTakesFlight_Bg_Tilemap = await tmap('gRaySceneTakesFlight_Bg_Tilemap', `${BASE}/scene_2/bg.bin`); })(),
      // rayquaza.png scene_2 : PNG 8bpp mais BG2 TakesFlight = paletteMode 0 (4bpp, rayquaza_scene.c:790).
      // Les index du PNG sont TOUS 0..15 (vérifié : nibble haut = 0), donc 4bpp est le bon bit-depth
      // (32 o/tuile, aligné sur le mode BG) — l'ancien chargement 8bpp désalignait tout (garbage).
      // DETTE NOTÉE (« fold d'index rayquaza.png ») : le tilemap scene_2/rayquaza.bin référence des
      // tuiles jusqu'à 938 (>240 tuiles du gfx) avec des palette-banks étalées 0..14 → la vue « over
      // the shoulder » ne compose pas proprement (blocs noirs) ; rendu partiel (fragments verts de
      // Rayquaza). Rendu 1:1 = re-transcription du layout tuile/bank + palette-cycling (hors périmètre).
      (async () => { gRaySceneTakesFlight_Rayquaza_Gfx = await tiles('gRaySceneTakesFlight_Rayquaza_Gfx', `${BASE}/scene_2/rayquaza.png`, 4); })(),
      (async () => { gRaySceneTakesFlight_Rayquaza_Tilemap = await tmap('gRaySceneTakesFlight_Rayquaza_Tilemap', `${BASE}/scene_2/rayquaza.bin`); })(),
      palPng('gRaySceneTakesFlight_Rayquaza_Pal', `${BASE}/scene_2/rayquaza.png`),
      tiles('gRaySceneTakesFlight_Smoke_Gfx', `${BASE}/scene_2/smoke.png`, 4),
      palPng('gRaySceneTakesFlight_Smoke_Pal', `${BASE}/scene_2/smoke.png`),
      // ── Scene 3 : Descends ──
      (async () => { gRaySceneDescends_Light_Gfx = await tiles('gRaySceneDescends_Light_Gfx', `${BASE}/scene_3/light.png`, 4); })(),
      (async () => { gRaySceneDescends_Light_Tilemap = await tmap('gRaySceneDescends_Light_Tilemap', `${BASE}/scene_3/light.bin`); })(),
      (async () => { gRaySceneDescends_Bg_Gfx = await tiles('gRaySceneDescends_Bg_Gfx', `${BASE}/scene_3/bg.png`, 4); })(),
      (async () => { gRaySceneDescends_Bg_Tilemap = await tmap('gRaySceneDescends_Bg_Tilemap', `${BASE}/scene_3/bg.bin`); })(),
      pal('gRaySceneDescends_Bg_Pal', `${BASE}/scene_3/bg.pal`),
      tiles('gRaySceneDescends_Rayquaza_Gfx', `${BASE}/scene_3/rayquaza.png`, 4),
      tiles('gRaySceneDescends_RayquazaTail_Gfx', `${BASE}/scene_3/rayquaza_tail.png`, 4), // rayquaza_tail_fix.4bpp source
      // ── Scene 4 : Charges ──
      (async () => { gRaySceneCharges_Rayquaza_Gfx = await tiles('gRaySceneCharges_Rayquaza_Gfx', `${BASE}/scene_4/rayquaza.png`, 4); })(),
      (async () => { gRaySceneCharges_Rayquaza_Tilemap = await tmap('gRaySceneCharges_Rayquaza_Tilemap', `${BASE}/scene_4/rayquaza.bin`); })(),
      (async () => { gRaySceneCharges_Streaks_Gfx = await tiles('gRaySceneCharges_Streaks_Gfx', `${BASE}/scene_4/streaks.png`, 4); })(),
      (async () => { gRaySceneCharges_Streaks_Tilemap = await tmap('gRaySceneCharges_Streaks_Tilemap', `${BASE}/scene_4/streaks.bin`); })(),
      (async () => { gRaySceneCharges_Bg_Gfx = await tiles('gRaySceneCharges_Bg_Gfx', `${BASE}/scene_4/bg.png`, 4); })(),
      (async () => { gRaySceneCharges_Bg_Tilemap = await tmap('gRaySceneCharges_Bg_Tilemap', `${BASE}/scene_4/bg.bin`); })(),
      (async () => { gRaySceneCharges_Orbs_Tilemap = await tmap('gRaySceneCharges_Orbs_Tilemap', `${BASE}/scene_4/orbs.bin`); })(),
      pal('gRaySceneCharges_Bg_Pal', `${BASE}/scene_4/bg.pal`),
      // ── Scene 5 : ChasesAway ──
      (async () => { gRaySceneChasesAway_Ring_Gfx = await tiles('gRaySceneChasesAway_Ring_Gfx', `${BASE}/scene_5/ring.png`, 8); })(),
      (async () => { gRaySceneChasesAway_Ring_Tilemap = await tmap('gRaySceneChasesAway_Ring_Tilemap', `${BASE}/scene_5/ring.bin`); })(),
      (async () => { gRaySceneChasesAway_Light_Gfx = await tiles('gRaySceneChasesAway_Light_Gfx', `${BASE}/scene_5/light.png`, 4); })(),
      (async () => { gRaySceneChasesAway_Light_Tilemap = await tmap('gRaySceneChasesAway_Light_Tilemap', `${BASE}/scene_5/light.bin`); })(),
      (async () => { gRaySceneChasesAway_Bg_Tilemap = await tmap('gRaySceneChasesAway_Bg_Tilemap', `${BASE}/scene_5/bg.bin`); })(),
      pal('gRaySceneChasesAway_Bg_Pal', `${BASE}/scene_5/bg.pal`),
      tiles('gRaySceneChasesAway_Groudon_Gfx', `${BASE}/scene_5/groudon.png`, 4),
      palPng('gRaySceneChasesAway_Groudon_Pal', `${BASE}/scene_5/groudon.png`),
      tiles('gRaySceneChasesAway_GroudonTail_Gfx', `${BASE}/scene_5/groudon_tail.png`, 4),
      tiles('gRaySceneChasesAway_Kyogre_Gfx', `${BASE}/scene_5/kyogre.png`, 4),
      palPng('gRaySceneChasesAway_Kyogre_Pal', `${BASE}/scene_5/kyogre.png`),
      tiles('gRaySceneChasesAway_Rayquaza_Gfx', `${BASE}/scene_5/rayquaza.png`, 4),
      palPng('gRaySceneChasesAway_Rayquaza_Pal', `${BASE}/scene_5/rayquaza.png`),
      tiles('gRaySceneChasesAway_RayquazaTail_Gfx', `${BASE}/scene_5/rayquaza_tail.png`, 4),
      tiles('gRaySceneChasesAway_KyogreSplash_Gfx', `${BASE}/scene_5/kyogre_splash.png`, 4),
      palPng('gRaySceneChasesAway_KyogreSplash_Pal', `${BASE}/scene_5/kyogre_splash.png`),
    ]);
  } catch (e) {
    console.error('[rayquaza_scene] preloadRayquazaSceneAssets', e);
  } finally {
    _rayAssetsSettled = true;
  }
}

