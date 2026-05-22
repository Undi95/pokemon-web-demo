/**
 * Mini runtime décomp Pokemon Emerald qui mime les helpers C globaux
 * (SetGpuReg, LoadPalette, LZ77UnCompVram, CreateSprite, BeginNormalPaletteFade,
 * gIntroFrameCounter, gTasks, gSprites, gPaletteFade) sur l'engine GBA TypeScript.
 *
 * BUT : permettre de transcrire les `bodyC` de auto-tasks/src/*-tasks.ts en TS
 * quasi-littéralement, sans réinventer la sémantique.
 *
 * Exemple usage :
 *   const rt = new DecompRuntime(gba);
 *   rt.SetGpuReg(REG_OFFSET_BG0VOFS, 40);
 *   await rt.LZ77UnCompVram_Tileset('intro/scene_1/bg.png', BG_CHAR_ADDR(0));
 *   rt.LoadPalette(palData, BG_PLTT_ID(0));
 *   rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 0, 'RGB_BLACK');
 *
 * Sources de vérité :
 *   - GBATEK pour les regs hardware
 *   - decomp pokeemerald include/gba/io_reg.h pour REG_OFFSET_*
 *   - decomp engine/palette_fade.c pour BeginNormalPaletteFade
 */
import { Gba } from './gba/gba';

/** Debug flag — true uniquement si `localStorage.rtDebug = '1'`. Sans ça, tous
 *  les console.log spam (CreateSprite, palette, sheet) sont silenced. */
const RT_DEBUG = typeof window !== 'undefined' && window.localStorage?.getItem('rtDebug') === '1';
import { LAYER_BG0, LAYER_BG1, LAYER_BG2, LAYER_BG3, LAYER_OBJ, LAYER_BD } from './gba/types';
import {
  loadIndexedPng, loadIndexedPngWithPal, loadIndexedPng8bppWithPal,
  loadIndexedPngStrict,
  loadGbaPal, loadTilemapBin, loadAffineTilemapBin,
} from './gba/png-loader';
import {
  SPRITE_TEMPLATES, OAM_DATAS, SPRITE_ANIM_TABLES, SPRITE_ANIMS,
  SPRITE_PALETTES, SPRITE_SHEETS,
} from './decomp-data/auto/src/sprite-system';
import { CalcCenterToCornerVec, ST_OAM_AFFINE_DOUBLE, PaletteBuffer } from './decomp-helpers';
import { tickAllAffineAnims, StartSpriteAffineAnim as _StartSpriteAffineAnim } from './decomp-impls/sprite-engine-impl';
import { resolveDecompConstant } from './decomp-constants';
import { gSaveBlock2Ptr } from './save-block-state';

/** HOTFIX 2026-05-09 : auto-extracted SPRITE_ANIMS data has tileNum stored
 *  as STRING for unresolved constants (= "VERSION_BANNER_RIGHT_TILEOFFSET").
 *  Previously the runtime fell back to 0 when tileNum was a string → ALL
 *  sprites with named tile offsets shared tileNum=0 → visible bug : title
 *  screen "VERSION EMERAUDE" right banner showed LEFT banner tiles
 *  (= duplicated "VERSI EMERA"). User reported "title screen cassé".
 *  Fix : resolve string constants via decomp-constants at runtime. */
function _resolveTileNum(raw: number | string | undefined): number {
  if (typeof raw === 'number') return raw;
  if (typeof raw !== 'string') return 0;
  const resolved = resolveDecompConstant(raw);
  return typeof resolved === 'number' ? resolved : 0;
}

/** OAM shape+size encoding 1:1 GBA hardware (cf. types.ts OAM_SIZES).
 *  Retourne [shape, size] depuis (width, height) en pixels. */
function oamShapeSizeFromWH(w: number, h: number): { shape: 0 | 1 | 2, size: 0 | 1 | 2 | 3 } {
  // shape 0 = square, 1 = wide (w>h), 2 = tall (h>w)
  // sizes (square): 8x8/16x16/32x32/64x64 = size 0/1/2/3
  // sizes (wide):   16x8/32x8/32x16/64x32 = size 0/1/2/3
  // sizes (tall):   8x16/8x32/16x32/32x64 = size 0/1/2/3
  if (w === h) {
    const map: Record<number, 0 | 1 | 2 | 3> = { 8: 0, 16: 1, 32: 2, 64: 3 };
    return { shape: 0, size: map[w] ?? 0 };
  } else if (w > h) {
    const key = `${w}x${h}`;
    const map: Record<string, 0 | 1 | 2 | 3> = { '16x8': 0, '32x8': 1, '32x16': 2, '64x32': 3 };
    return { shape: 1, size: map[key] ?? 0 };
  } else {
    const key = `${w}x${h}`;
    const map: Record<string, 0 | 1 | 2 | 3> = { '8x16': 0, '8x32': 1, '16x32': 2, '32x64': 3 };
    return { shape: 2, size: map[key] ?? 0 };
  }
}

/** Sprite anim state attaché à chaque sprite avec une anim active. */
interface SpriteAnimState {
  /** Nom du sprite anim TABLE (e.g. 'sAnims_FlygonSilhouette') */
  animTableName: string;
  /** Index de l'anim active dans le table (sAnims[N]) */
  animIdx: number;
  /** Index de la frame courante dans l'anim */
  frameIdx: number;
  /** Frames restantes avant de passer à la frame suivante */
  framesRemaining: number;
  /** Tile base = tileNum start de cette sprite dans objVram (= spriteSheetTagToTileStart[tileTag]) */
  tileBase: number;
}

// ─── REG_OFFSET_* (1:1 décomp include/gba/io_reg.h) ──────────────────────────
export const REG_OFFSET_DISPCNT  = 0x000;
export const REG_OFFSET_BG0CNT   = 0x008;
export const REG_OFFSET_BG1CNT   = 0x00A;
export const REG_OFFSET_BG2CNT   = 0x00C;
export const REG_OFFSET_BG3CNT   = 0x00E;
export const REG_OFFSET_BG0HOFS  = 0x010;
export const REG_OFFSET_BG0VOFS  = 0x012;
export const REG_OFFSET_BG1HOFS  = 0x014;
export const REG_OFFSET_BG1VOFS  = 0x016;
export const REG_OFFSET_BG2HOFS  = 0x018;
export const REG_OFFSET_BG2VOFS  = 0x01A;
export const REG_OFFSET_BG3HOFS  = 0x01C;
export const REG_OFFSET_BG3VOFS  = 0x01E;
export const REG_OFFSET_BG2PA    = 0x020;
export const REG_OFFSET_BG2PB    = 0x022;
export const REG_OFFSET_BG2PC    = 0x024;
export const REG_OFFSET_BG2PD    = 0x026;
export const REG_OFFSET_BG2X_L   = 0x028;
export const REG_OFFSET_BG2X_H   = 0x02A;
export const REG_OFFSET_BG2Y_L   = 0x02C;
export const REG_OFFSET_BG2Y_H   = 0x02E;
export const REG_OFFSET_BG3PA    = 0x030;
export const REG_OFFSET_BG3PB    = 0x032;
export const REG_OFFSET_BG3PC    = 0x034;
export const REG_OFFSET_BG3PD    = 0x036;
export const REG_OFFSET_BG3X_L   = 0x038;
export const REG_OFFSET_BG3X_H   = 0x03A;
export const REG_OFFSET_BG3Y_L   = 0x03C;
export const REG_OFFSET_BG3Y_H   = 0x03E;
export const REG_OFFSET_WIN0H    = 0x040;
export const REG_OFFSET_WIN1H    = 0x042;
export const REG_OFFSET_WIN0V    = 0x044;
export const REG_OFFSET_WIN1V    = 0x046;
export const REG_OFFSET_WININ    = 0x048;
export const REG_OFFSET_WINOUT   = 0x04A;
export const REG_OFFSET_MOSAIC   = 0x04C;
export const REG_OFFSET_BLDCNT   = 0x050;
export const REG_OFFSET_BLDALPHA = 0x052;
export const REG_OFFSET_BLDY     = 0x054;

// ─── BGCNT/DISPCNT bit masks (1:1 décomp) ────────────────────────────────────
export const BGCNT_PRIORITY = (n: number) => n & 3;
export const BGCNT_CHARBASE = (n: number) => (n & 3) << 2;
export const BGCNT_SCREENBASE = (n: number) => (n & 31) << 8;
export const BGCNT_16COLOR = 0;
export const BGCNT_256COLOR = 0x80;
export const BGCNT_TXT256x256 = 0x0000;
export const BGCNT_TXT512x256 = 0x4000;
export const BGCNT_TXT256x512 = 0x8000;
export const BGCNT_TXT512x512 = 0xC000;
export const BGCNT_AFF128x128 = 0x0000;
export const BGCNT_AFF256x256 = 0x4000;
export const BGCNT_AFF512x512 = 0x8000;
export const BGCNT_AFF1024x1024 = 0xC000;
export const BGCNT_WRAP = 0x2000;

export const DISPCNT_MODE_0 = 0;
export const DISPCNT_MODE_1 = 1;
export const DISPCNT_MODE_2 = 2;
export const DISPCNT_OBJ_1D_MAP = 0x40;
export const DISPCNT_BG0_ON = 0x100;
export const DISPCNT_BG1_ON = 0x200;
export const DISPCNT_BG2_ON = 0x400;
export const DISPCNT_BG3_ON = 0x800;
export const DISPCNT_OBJ_ON = 0x1000;
export const DISPCNT_WIN1_ON = 0x4000;
export const DISPCNT_WINOBJ_ON = 0x8000;
export const DISPCNT_WIN0_ON = 0x2000;
export const DISPCNT_BG_ALL_ON = 0xF00;
export const DISPCNT_FORCED_BLANK = 0x80;
export const DISPCNT_HBLANK_INTERVAL_FREE = 0x20;

export const BLDCNT_TGT1_BG0 = 0x01;
export const BLDCNT_TGT1_BG1 = 0x02;
export const BLDCNT_TGT1_BG2 = 0x04;
export const BLDCNT_TGT1_BG3 = 0x08;
export const BLDCNT_TGT1_OBJ = 0x10;
export const BLDCNT_TGT1_BD  = 0x20;
export const BLDCNT_EFFECT_NONE     = 0x00;
export const BLDCNT_EFFECT_BLEND    = 0x40;
export const BLDCNT_EFFECT_LIGHTEN  = 0x80;
export const BLDCNT_EFFECT_DARKEN   = 0xC0;
export const BLDCNT_TGT2_BG0 = 0x100;
export const BLDCNT_TGT2_BG1 = 0x200;
export const BLDCNT_TGT2_BG2 = 0x400;
export const BLDCNT_TGT2_BG3 = 0x800;
export const BLDCNT_TGT2_OBJ = 0x1000;
export const BLDCNT_TGT2_BD  = 0x2000;

// ─── Palette base IDs ────────────────────────────────────────────────────────
// 1:1 décomp include/palette.h:20-24 :
//   PLTT_ID(n) = n × 16
//   BG_PLTT_OFFSET = 0x000, OBJ_PLTT_OFFSET = 0x100
//   BG_PLTT_ID(n)  = BG_PLTT_OFFSET  + PLTT_ID(n) = n × 16
//   OBJ_PLTT_ID(n) = OBJ_PLTT_OFFSET + PLTT_ID(n) = 256 + n × 16
// LoadPalette utilise offset < 256 = BG, ≥ 256 = OBJ. Donc OBJ_PLTT_ID DOIT
// inclure le 256 sinon les LoadPalette OBJ écrivent dans BG palette.
export const BG_PLTT_ID = (n: number) => n * 16;
export const OBJ_PLTT_ID = (n: number) => 256 + n * 16;
/** 1:1 décomp `gba/defines.h:41-46` :
 *    BG_VRAM           = VRAM           = 0x06000000
 *    BG_CHAR_SIZE      = 0x4000
 *    BG_SCREEN_SIZE    = 0x800
 *    BG_CHAR_ADDR(n)   = BG_VRAM + BG_CHAR_SIZE   * n
 *    BG_SCREEN_ADDR(n) = BG_VRAM + BG_SCREEN_SIZE * n
 *  Adresses ABSOLUES (= GBA bus). Les callers (LZ77UnCompVram, DmaClear16, …)
 *  font `addr % vram.byteLength` qui fonctionne car 0x06000000 mod 0x18000 = 0. */
export const BG_VRAM = 0x06000000;
export const BG_CHAR_ADDR = (n: number) => BG_VRAM + n * 0x4000;
export const BG_SCREEN_ADDR = (n: number) => BG_VRAM + n * 0x800;
/** 1:1 décomp DISPLAY_WIDTH/HEIGHT. */
export const DISPLAY_WIDTH = 240;
export const DISPLAY_HEIGHT = 160;

// ─── Palette fade mode constants (1:1 décomp src/palette.c:9-14) ────────────
/** Fade type — `gPaletteFade.mode` choisit entre 3 algos :
 *  - NORMAL_FADE = software blend Unfaded→target via gPlttBufferFaded (BeginNormalPaletteFade)
 *  - FAST_FADE   = idem mais ×2 plus rapide (= deltaY=2). BeginFastPaletteFade.
 *  - HARDWARE_FADE = pas de blend software, juste BLDCNT+BLDY hardware (BeginHardwarePaletteFade) */
export const NORMAL_FADE = 0;
export const FAST_FADE = 1;
export const HARDWARE_FADE = 2;

// ─── Palette fade state (1:1 décomp engine/palette_fade.c) ──────────────────
/** gPaletteFade global. `.active = true` pendant un fade.
 *  ⚠️ Cette struct doit matcher le layout C (= `struct PaletteFadeControl` dans
 *  `include/palette.h`). Tous les fields sont nécessaires car les auto-engine
 *  callbacks transpilés depuis le décomp y accèdent par nom (= party_menu,
 *  contest, trade, decoration, etc. font `gPaletteFade.softwareFadeFinishing`,
 *  `gPaletteFade.deltaY`, etc.). Sans ces fields, ils deviennent NaN/undefined. */
export class PaletteFade {
  active = false;
  /** Current blend coefficient (0-16). Décomp : `y:5`. Notre alias = brightness. */
  brightness = 0;
  /** Fade mode. NORMAL_FADE / FAST_FADE / HARDWARE_FADE (cf. constants ci-dessus).
   *  Set par BeginNormalPaletteFade (= 0), BeginFastPaletteFade (= 1),
   *  BeginHardwarePaletteFade (= 2). */
  mode = NORMAL_FADE;
  /** Frame en cours du fade */
  currentFrame = 0;
  /** Total frames du fade */
  totalFrames = 1;
  /** Couleur cible (RGB15 ou special) */
  targetRgb15 = 0;
  /** Delay restant avant qu'une frame de fade soit appliquée. Décomp : `delayCounter:6`. */
  delayRemaining = 0;
  /** Delay entre 2 steps */
  delayPerStep = 0;
  /** startY (brightness initial) */
  startY = 0;
  /** endY (brightness final). Décomp : `targetY:5`. */
  endY = 0;
  /** Target color RGB15 components (5-bit each). Used by _applyPaletteFadeStep. */
  targetR = 31;
  targetG = 31;
  targetB = 31;
  /** 1:1 décomp `gPaletteFade_selectedPalettes` u32 mask : bits 0-15 = BG palettes,
   *  bits 16-31 = OBJ palettes. Only selected palettes are blended each frame.
   *  Default 0xFFFFFFFF = all (matches BeginNormalPaletteFade default with PALETTES_ALL). */
  selectedPalettes = 0xFFFFFFFF;
  /** 1:1 décomp `gPaletteFade.bufferTransferDisabled` — quand true, `TransferPlttBuffer()`
   *  skip la DMA Faded→PLTT. Pokemon Emerald set ça pendant des effects HBlank/scanline
   *  particuliers (= weather palette shifts).
   *  ⚠️ NOTE : notre runtime applique les writes palette IMMEDIATEMENT (PaletteBuffer.set
   *  écrit direct dans `gba.palette` qui est ce que le compositor lit). Donc même si
   *  ce flag est set, les writes apparaissent quand même. C'est une déviation du décomp.
   *  Impact en pratique : nul — Pokemon Emerald ne set ça que pour effects HBlank
   *  qu'on ne simule pas. Conservé comme stub pour matcher la struct C. */
  bufferTransferDisabled = false;
  // ─── Phase B audit session 83 : fields complétés pour matcher décomp ─────
  /** 1:1 décomp `yDec:1` — direction du fade. true = brightness décroît (startY > endY).
   *  Set par BeginNormalPaletteFade selon les arguments. Utilisé par UpdateNormalPaletteFade
   *  pour incrémenter ou décrémenter `y` à chaque step. */
  yDec = false;
  /** 1:1 décomp `softwareFadeFinishingCounter:5` — frames d'attente AVANT que
   *  softwareFadeFinishing soit set à true. Décomp init à 4 quand y atteint targetY,
   *  decrement chaque frame, et set softwareFadeFinishing=true quand atteint 0.
   *  Permet aux callers de detecter "fade vient de finir" sur 1 frame précise. */
  softwareFadeFinishingCounter = 0;
  /** 1:1 décomp `softwareFadeFinishing:1` — true pendant 1 frame quand le fade
   *  vient de finir. Auto-engine callbacks check ça pour trigger leurs transitions
   *  (e.g. `if (!gPaletteFade.active && gPaletteFade.softwareFadeFinishing) ...`). */
  softwareFadeFinishing = false;
  /** 1:1 décomp `objPaletteToggle:1` — alternance BG↔OBJ par frame pour spread le
   *  travail de blend sur 2 frames. Notre impl applique toutes les palettes en 1 frame
   *  (= compositor moderne, pas de budget VBlank), donc ce flag est essentiellement
   *  cosmetic. Conservé pour matcher la struct C (et permettre toggle si futurs auto
   *  callbacks le mutent). */
  objPaletteToggle = false;
  /** 1:1 décomp `deltaY:4` — vitesse du fade. 1 par défaut (NORMAL_FADE), 2 pour
   *  FAST_FADE. Multiplicateur sur le step de y par frame. */
  deltaY = 1;
  /** 1:1 décomp `shouldResetBlendRegisters:1` — set par BeginHardwarePaletteFade
   *  pour reset BLDCNT/BLDY à la fin du hardware fade. */
  shouldResetBlendRegisters = false;
  /** 1:1 décomp `hardwareFadeFinishing:1` — analogue de softwareFadeFinishing pour
   *  HARDWARE_FADE mode. */
  hardwareFadeFinishing = false;
  /** 1:1 décomp `multipurpose1` (u32) — usage variable selon mode :
   *   - HARDWARE_FADE : stocke la valeur BLDCNT cible
   *   - FAST_FADE     : compteur intermédiaire
   *  Conservé pour matcher la struct C. */
  multipurpose1 = 0;
  /** 1:1 décomp `multipurpose2:6` — usage similaire à multipurpose1, secondaire. */
  multipurpose2 = 0;
}

// ─── gMain (1:1 décomp struct Main) ──────────────────────────────────────────
/** 1:1 décomp `struct Main { void (*callback2)(void); u8 state; ... } gMain;`
 *  Le main loop AgbMain appelle `gMain.callback2()` chaque frame, qui déroule
 *  la state machine de la "scène" courante (intro/title/main_menu/...) et peut
 *  swap vers une autre scène via SetMainCallback2.
 *
 *  state : compteur de step interne au callback2 courant (case 0 → init, etc).
 *          Reset à 0 par SetMainCallback2.
 *  callback2 : la fonction appelée chaque frame. null = no-op.
 *  vblankCallback : appelée en VBlank (notre engine = stub no-op pour l'instant). */
export type CB2Callback = (rt: DecompRuntime) => void;
export type CB1Callback = (rt: DecompRuntime) => void;
export class MainStruct {
  state = 0;
  callback2: CB2Callback | null = null;
  /** 1:1 décomp `MainCallback gMain.callback1` (= main.c:175 init `gMain.callback1 = NULL`).
   *  Décomp main loop : `CallCallbacks()` invoque callback1() PUIS callback2()
   *  chaque frame (main.c:181-188). callback1 est utilisé par overworld (CB1_Overworld
   *  set par CB2_NewGame line 1546) pour tick object events + map scroll AVANT
   *  que callback2 (= CB2_Overworld) ne déroule sa state machine de scène. */
  callback1: CB1Callback | null = null;
  vblankCallback: (() => void) | null = null;
  /** 1:1 décomp gMain.savedCallback — callback à restaurer quand une scène
   *  imbriquée (e.g. option menu, naming screen) se termine. Set par le caller
   *  AVANT `SetMainCallback2(CB2_InitOptionMenu)` etc. */
  savedCallback: CB2Callback | null = null;
  /** 1:1 décomp gMain.newKeys / gMain.heldKeys — input keys this frame / held keys. */
  newKeys = 0;
  heldKeys = 0;
  /** 1:1 décomp gMain.newAndRepeatedKeys — newKeys + auto-repeat (= hold to scroll
   *  dans menus). Cf. ReadKeys src/main.c:243-268. Géré par tickFixed. */
  newAndRepeatedKeys = 0;
  /** 1:1 décomp gMain.keyRepeatCounter — countdown until next repeat fire. */
  keyRepeatCounter = 0;
}

/** 1:1 décomp gKeyRepeatStartDelay = 40 (frames before 1ère répétition).
 *  Constant boot-default. Variable mutable runtime via gKeyRepeatStartDelay export. */
export const KEY_REPEAT_START_DELAY = 40;
/** 1:1 décomp gKeyRepeatContinueDelay = 5 (frames entre répétitions suivantes). */
export const KEY_REPEAT_CONTINUE_DELAY = 5;

/** 1:1 décomp `COMMON_DATA u16 gKeyRepeatStartDelay = 0;` (main.c:62).
 *  Mutable global initialisé à 40 par InitKeys(). Modifiable par scenes spéciales :
 *  - naming_screen.c:484 : `gKeyRepeatStartDelay = 16;`
 *  - union_room_chat.c   : `gKeyRepeatStartDelay = 20;`
 *  - cleanup scenes restore via `keyRepeatStartDelayCopy` field saved au pré-set.
 *
 *  Stocké dans un container object pour permettre mutation cross-module
 *  (= ESM exports sont read-only par référence). Lecture : `gKeyRepeat.startDelay`.
 *  Écriture : `gKeyRepeat.startDelay = N`. */
export const gKeyRepeat = {
  startDelay: KEY_REPEAT_START_DELAY,
  continueDelay: KEY_REPEAT_CONTINUE_DELAY,
};

/** 1:1 décomp src/main.c:231-241 InitKeys.
 *  Init key repeat delays + clear gMain.heldKeys/newKeys.
 *  À appeler une fois au boot, AVANT le 1er CB2 (= conformément à AgbMain order). */
export function InitKeys(rt: DecompRuntime): void {
  gKeyRepeat.startDelay = KEY_REPEAT_START_DELAY;       // 40
  gKeyRepeat.continueDelay = KEY_REPEAT_CONTINUE_DELAY; // 5
  rt.gMain.heldKeys = 0;
  rt.gMain.newKeys = 0;
  rt.gMain.newAndRepeatedKeys = 0;
  rt.gMain.keyRepeatCounter = 0;
}

// ─── Sprite (1:1 décomp struct Sprite, simplifié) ────────────────────────────
/** Sprite décomp. Mappe à un slot OAM gba + state machine via data[].
 *  Les fields x/y/x2/y2/invisible/hFlip/vFlip sont synchronisés vers gba.oam
 *  chaque frame par syncSpritesToOam (cf. tickFixed). */
export interface DecompSprite {
  /** Slot dans gba.oam (0-127) */
  oamIndex: number;
  /** State arbitraire (utilisé par sprite callbacks ; data[N] = sState/sTimer/etc
   *  selon les EXPR macros décomp dans intro-data.ts) */
  data: number[];
  /** inUse = true quand actif, false après DestroySprite (comme le vrai gSprites[i].inUse). */
  inUse: boolean;
  /** Position absolue (1:1 décomp sprite->x / sprite->y) */
  x: number;
  y: number;
  /** Delta offsets (1:1 décomp sprite->x2 / sprite->y2). Final OAM.x = x + x2. */
  x2: number;
  y2: number;
  /** Visibility (= !gba.oam[i].visible). 1:1 décomp sprite->invisible. */
  invisible: boolean;
  /** Flips (1:1 décomp sprite->hFlip / vFlip). */
  hFlip: boolean;
  vFlip: boolean;
  /** Affine matrix slot (1:1 décomp sprite->oam.matrixNum). */
  matrixNum: number;
  /** 1:1 décomp `sprite->subpriority` — set by CreateSprite's 4th arg, used
   *  by BuildSpritePriorities to order same-OAM-priority sprites. Lower value
   *  = drawn ON TOP. Default 0xFF (= sentinel, equivalent to "behind everything"). */
  subpriority: number;
  /** centerToCornerVec : décalage OAM x/y pour positionnement correct selon
   *  shape/size/affineMode (1:1 décomp src/sprite.c CalcCenterToCornerVec).
   *  Utilisé par syncSpritesToOam : oam.x = sprite.x + sprite.x2 + centerToCornerVecX. */
  centerToCornerVecX: number;
  centerToCornerVecY: number;
  /** Affine anim table name (= SPRITE_AFFINE_ANIM_TABLES key, e.g. 'sAffineAnims_GameFreak').
   *  null si pas d'affine anim. */
  affineAnimsTableName: string | null;
  /** Affine anim active : index dans table.affineAnims[]. */
  affineAnimNum: number;
  /** Affine anim cmd index (frame courante dans l'animCmd table). */
  affineAnimCmdIndex: number;
  /** Affine anim delay counter (frames restantes avant prochain cmd). */
  affineAnimDelayCounter: number;
  /** Affine anim accumulators (xScale, yScale, rotation) — set par ApplyAffineAnimFrame. */
  xScale: number;
  yScale: number;
  rotation: number;
  /** Affine anim flags. */
  affineAnimBeginning: boolean;
  affineAnimPaused: boolean;
  /** Sprite shape/size pour CalcCenterToCornerVec (= valeurs OAM_DATAS shape/size). */
  shape: 0 | 1 | 2;
  size: 0 | 1 | 2 | 3;
  /** affineMode actuel (peut changer via callbacks). */
  affineMode: 0 | 1 | 2 | 3;
  /** Anim ended flag — set par tickSpriteAnims quand l'anim atteint END. */
  animEnded: boolean;
  /** Affine anim ended flag — set quand l'affine anim atteint END. */
  affineAnimEnded: boolean;
  /** Callback exécuté chaque frame (1:1 décomp sprite->callback). */
  callback: ((sprite: DecompSprite, rt: DecompRuntime) => void) | null;
  /** sprite ID (notre extension pour DestroySprite par ID). */
  spriteId: number;
  /** Tile base dans objVram (= tileSheetTagToTileStart pour le tileTag du template).
   *  Utilisé par tickSpriteAnims pour calculer tileId final = tileBase + frame.tileNum. */
  tileBase: number;
  /** OAM mode (1:1 décomp sprite->oam.objMode : NORMAL/BLEND/OBJ_WINDOW). */
  objMode: 0 | 1 | 2;
}

// ─── Task mock minimal ───────────────────────────────────────────────────────
export interface DecompTask {
  taskId: number;
  /** Pointer vers la function task (1:1 gTasks[taskId].func) */
  func: ((task: DecompTask) => void) | null;
  /** data[0..15] arbitraire (1:1 gTasks[taskId].data) */
  data: number[];
  /** 1:1 sémantique décomp `SetTaskFuncWithFollowupFunc` :
   *  src/task.c:139-153 pack le pointer 32-bit dans data[NUM_TASK_DATA-2]
   *  + data[NUM_TASK_DATA-1] (deux halfwords s16). En TS on n'a pas de cast
   *  fonction→s16 fidèle (le `>>16` produit NaN), donc on stocke la fonction
   *  dans un champ dédié — sémantique 1:1 préservée, layout JS-correct.
   *  Lu par `SwitchTaskToFollowupFunc`. */
  followupFunc: ((task: DecompTask) => void) | null;
}

/**
 * Runtime décomp principal. Wrap l'engine GBA + helpers C.
 *
 * Usage typique dans une scène :
 *   private rt!: DecompRuntime;
 *
 *   create() {
 *     this.gba = new Gba();
 *     this.rt = new DecompRuntime(this.gba);
 *     this.rt.gIntroFrameCounter = 0;
 *     // ... exécute Task_Scene1_Load via this.rt
 *   }
 *
 *   update() {
 *     this.bridge.tick();
 *     this.rt.tick();  // run current task + UpdatePaletteFade
 *   }
 */
export class DecompRuntime {
  /** 1:1 décomp `gIntroFrameCounter` (incrémenté chaque frame par MainCB2_Intro). */
  gIntroFrameCounter = 0;
  /** 1:1 décomp `gMain` struct global. callback2 = scène courante, ticked chaque frame. */
  gMain = new MainStruct();
  /** 1:1 décomp `gPaletteFade` global. */
  gPaletteFade = new PaletteFade();
  /** 1:1 décomp `gTasks[]` array. Notre version : Map keyed by taskId. */
  gTasks = new Map<number, DecompTask>();
  /** 1:1 décomp `gSprites[]` array. */
  gSprites = new Map<number, DecompSprite>();
  /** Auto-incrementing OAM slot (next free) */
  private nextOamSlot = 0;
  /** Auto-incrementing task ID */
  nextTaskId = 0;
  /** Auto-incrementing sprite ID */
  private nextSpriteId = 0;
  /** État précédent des touches pour calculer newKeys (front montant) chaque frame. */
  private prevHeldKeys = 0;
  /** Flag pour ne logger OAM slots exhausted qu'une seule fois (évite spam 999×). */
  private _oamExhaustedWarned = false;
  /** Track UpdatePaletteFade calls per frame (= 1:1 décomp idempotency).
   *  Reset chaque frame à la fin de tickFixed. Permet à CB2_X qui appelle
   *  UpdatePaletteFade dans son body de ne pas re-trigger l'appel à la fin
   *  de la frame — sans ça la fade engine advance 2×, durée /2. */
  private _paletteFadeCalledThisFrame = false;

  /** Track runTasks calls per frame (= 1:1 décomp idempotency).
   *  Reset chaque frame en fin de runOneFrame. Les MainCB2_* auto-décomp font
   *  `RunTasks()` dans leur body (cf. option_menu.c:138, intro.c:1042). Le
   *  runtime ré-appelle `runTasks()` après callback2 en backup pour les
   *  MainCB2_* manuels TS qui ne le font pas (e.g. MainCB2_Overworld). Sans
   *  ce flag, les Tasks tournent 2× → JOY_NEW(DPAD_X) traité 2× → cursor
   *  saute 2 cases par appui (= bug option menu field). */
  private _runTasksCalledThisFrame = false;

  /** Mode vidéo courant (bits 0-2 de DISPCNT). Utilisé pour déterminer isAffine. */
  private _dispCntMode = 0;

  // ─── Affine ref point temp storage (BG2 = 0, BG3 = 1) ─────────────────────
  // Affine reg low/high storage par bg index (= 2 ou 3, BG affine modes 1+).
  // Indexed [bg][L=0/H=1] pour x et y. Permet d'écrire low puis high séparément
  // (cf. décomp set BG2X_L puis BG2X_H, on assemble en s32 quand les deux sont set).
  private _bgRefXL = [0, 0, 0, 0];
  private _bgRefXH = [0, 0, 0, 0];
  private _bgRefYL = [0, 0, 0, 0];
  private _bgRefYH = [0, 0, 0, 0];

  private _updateBgRef(bgIdx: 2 | 3): void {
    const xRaw = (this._bgRefXH[bgIdx] << 16) | this._bgRefXL[bgIdx];
    const yRaw = (this._bgRefYH[bgIdx] << 16) | this._bgRefYL[bgIdx];
    // Sign-extend 32-bit (= JS bit ops keep 32-bit signed).
    const x = xRaw >= 0x80000000 ? xRaw - 0x100000000 : xRaw;
    const y = yRaw >= 0x80000000 ? yRaw - 0x100000000 : yRaw;
    this.gba.bg(bgIdx).config.affineRefX = x;
    this.gba.bg(bgIdx).config.affineRefY = y;
  }

  /** paletteTag (e.g. 'PALTAG_LOGO') → OBJ palette slot (0-15).
   *  Rempli par LoadSpritePalettesFromTable(). Permet de résoudre paletteTag → bank
   *  pour CreateSpriteFromTemplate au lieu de hardcoder. */
  paletteTagToSlot = new Map<string, number>();
  /** tileTag (e.g. 'GFXTAG_DROPS_LOGO') → tileNum start dans objVram.
   *  Rempli par LoadCompressedSpriteSheetsFromTable(). */
  spriteSheetTagToTileStart = new Map<string, number>();
  /** tag → taille octets allouée (pour reclaim sur FreeSpriteTilesByTag). */
  spriteSheetTagToByteSize = new Map<string, number>();
  /** Plages OBJ VRAM libérées (FreeSpriteTilesByTag) réutilisables par
   *  LoadCompressedSpriteSheet (= 1:1-net décomp AllocSpriteTiles/Free
   *  SpriteTiles bitmap : reclaim au free, reuse à l'alloc — sinon le
   *  curseur monotone épuise la VRAM (icône sac cassée après N nav). */
  freedSpriteTileRanges: Array<{ offset: number; size: number }> = [];
  /** Prochain slot OBJ palette libre (auto-assigné par LoadSpritePalettes). */
  nextObjPalSlot = 0;
  /** Prochain offset libre dans objVram pour sprite sheets (auto-assigné). */
  nextSpriteSheetByteOffset = 0;
  /** State des sprite anims actives : spriteId → state. */
  private spriteAnimStates = new Map<number, SpriteAnimState>();

  /** Runtime registry for dynamically-defined sprite anims (= 1:1 décomp pattern
   *  d'enregistrement par module sans toucher le static auto-generated registry).
   *  Consulté par tickSpriteAnims/StartSpriteAnim en fallback après SPRITE_ANIMS.
   *  Foundation : object-event-graphics.ts registers 4-direction walk anims here ;
   *  Phase 4 ajoutera surf/bike/fishing variants. */
  private _extraAnims = new Map<string, { frames: ReadonlyArray<{ tileNum: number, duration: number, hFlip?: boolean, vFlip?: boolean }>, terminator: 'END' | 'JUMP', jumpTo?: number }>();
  private _extraAnimTables = new Map<string, { anims: ReadonlyArray<string> }>();

  /** Register a runtime sprite anim (= named cmd table + terminator). Idempotent. */
  registerExtraAnim(name: string, def: { frames: ReadonlyArray<{ tileNum: number, duration: number, hFlip?: boolean, vFlip?: boolean }>, terminator: 'END' | 'JUMP', jumpTo?: number }): void {
    this._extraAnims.set(name, def);
  }

  /** Register a runtime sprite anim TABLE (= named array of anim names). */
  registerExtraAnimTable(name: string, table: { anims: ReadonlyArray<string> }): void {
    this._extraAnimTables.set(name, table);
  }

  /** Public bridge for animations system : register a sprite's anim state directly.
   *  Used by CreateObjectGraphicsSprite (= bypass static template-based path of
   *  CreateSpriteFromTemplate, since the trainer/NPC templates are dynamic). */
  spriteAnimStatesRegister(spriteId: number, animTableName: string, animIdx: number, tileBase: number): void {
    const table = this._extraAnimTables.get(animTableName)
      ?? (SPRITE_ANIM_TABLES as Record<string, { anims: ReadonlyArray<string> }>)[animTableName];
    if (!table) {
      console.warn(`[runtime] spriteAnimStatesRegister: anim table '${animTableName}' not found`);
      return;
    }
    const animName = table.anims[animIdx];
    if (!animName) return;
    const anim = this._extraAnims.get(animName)
      ?? (SPRITE_ANIMS as Record<string, { frames: ReadonlyArray<{ tileNum: number | string, duration: number }>, terminator: string, jumpTo?: number }>)[animName];
    if (!anim || anim.frames.length === 0) return;
    this.spriteAnimStates.set(spriteId, {
      animTableName,
      animIdx,
      frameIdx: 0,
      framesRemaining: anim.frames[0].duration,
      tileBase,
    });
    // Apply frame 0 immediately to OAM (= 1:1 décomp StartSpriteAnim semantic).
    const sprite = this.gSprites.get(spriteId);
    if (sprite) {
      const tileNum = _resolveTileNum(anim.frames[0].tileNum);
      this.gba.oam[sprite.oamIndex].tileId = tileBase + tileNum;
      // hFlip/vFlip per-frame (= OAM hardware mirror, used by EAST direction
      // which reuses WEST tiles flipped).
      if ('hFlip' in anim.frames[0]) {
        this.gba.oam[sprite.oamIndex].flipH = !!(anim.frames[0] as { hFlip?: boolean }).hFlip;
      }
      if ('vFlip' in anim.frames[0]) {
        this.gba.oam[sprite.oamIndex].flipV = !!(anim.frames[0] as { vFlip?: boolean }).vFlip;
      }
    }
  }
  /** Accumulator pour timing 60Hz fixed (Phaser update peut être > 60Hz). */
  private accumulatorMs = 0;
  /** Frame target = 60Hz GBA. */
  private readonly FRAME_TIME_MS = 1000 / 60;
  /** 1:1 décomp gPlttBufferFaded[256+256] : palette buffer accessible aux callbacks
   *  pour CpuCopy16 et autres palette swap dynamiques. Wrapper sur gba.palette. */
  public readonly gPlttBufferFaded: PaletteBuffer;
  /** 1:1 décomp gPlttBufferUnfaded — version "before fade" de la palette.
   *  Notre version simplifiée : même chose que gPlttBufferFaded (= notre palette
   *  fade système est moins sophistiqué que le décomp). */
  public readonly gPlttBufferUnfaded: PaletteBuffer;
  /** Palettes additionnelles chargées au runtime (e.g. text.pal pour color cycle).
   *  Lookup par symbol décomp (e.g. 'gIntroGameFreakTextFade_Pal'). */
  public readonly extraPalettes = new Map<string, Uint16Array>();
  /** Registry des sprite callbacks par nom (résout les templates qui référencent
   *  SpriteCB_X par string, car les modules ESM n'exposent pas les fonctions sur globalThis). */
  public readonly spriteCallbacks = new Map<string, (sprite: DecompSprite, rt: DecompRuntime) => void>();

  constructor(public readonly gba: Gba) {
    this.gPlttBufferFaded = new PaletteBuffer(gba);
    this.gPlttBufferUnfaded = new PaletteBuffer(gba);
  }

  // ============================================================================
  // GetGpuReg / SetGpuReg — wrapper qui dispatch sur le bon gba.* selon REG_OFFSET
  // ============================================================================

  GetGpuReg(reg: number): number {
    switch (reg) {
      case REG_OFFSET_DISPCNT: {
        let v = this._dispCntMode;
        if (this.gba.bg(0).config.visible) v |= DISPCNT_BG0_ON;
        if (this.gba.bg(1).config.visible) v |= DISPCNT_BG1_ON;
        if (this.gba.bg(2).config.visible) v |= DISPCNT_BG2_ON;
        if (this.gba.bg(3).config.visible) v |= DISPCNT_BG3_ON;
        if (this.gba.windows.win0.enabled) v |= DISPCNT_WIN0_ON;
        if (this.gba.windows.win1.enabled) v |= DISPCNT_WIN1_ON;
        if (this.gba.windows.winObjEnabled) v |= DISPCNT_WINOBJ_ON;
        return v;
      }
      case REG_OFFSET_BG0CNT: return this.buildBgCnt(0);
      case REG_OFFSET_BG1CNT: return this.buildBgCnt(1);
      case REG_OFFSET_BG2CNT: return this.buildBgCnt(2);
      case REG_OFFSET_BG3CNT: return this.buildBgCnt(3);
      case REG_OFFSET_BG0HOFS: return this.gba.bg(0).config.hofs;
      case REG_OFFSET_BG0VOFS: return this.gba.bg(0).config.vofs;
      case REG_OFFSET_BG1HOFS: return this.gba.bg(1).config.hofs;
      case REG_OFFSET_BG1VOFS: return this.gba.bg(1).config.vofs;
      case REG_OFFSET_BG2HOFS: return this.gba.bg(2).config.hofs;
      case REG_OFFSET_BG2VOFS: return this.gba.bg(2).config.vofs;
      case REG_OFFSET_BG3HOFS: return this.gba.bg(3).config.hofs;
      case REG_OFFSET_BG3VOFS: return this.gba.bg(3).config.vofs;
      case REG_OFFSET_BLDCNT:
        return (this.gba.blend.target1 & 0x3F)
             | ((this.gba.blend.mode & 3) << 6)
             | ((this.gba.blend.target2 & 0x3F) << 8);
      case REG_OFFSET_BLDALPHA:
        return (this.gba.blend.alpha1 & 0x1F)
             | ((this.gba.blend.alpha2 & 0x1F) << 8);
      case REG_OFFSET_BLDY:
        return this.gba.blend.brightness & 0x1F;
      case REG_OFFSET_WIN0H:
        return (this.gba.windows.win0.x1 << 8) | this.gba.windows.win0.x2;
      case REG_OFFSET_WIN1H:
        return (this.gba.windows.win1.x1 << 8) | this.gba.windows.win1.x2;
      case REG_OFFSET_WIN0V:
        return (this.gba.windows.win0.y1 << 8) | this.gba.windows.win0.y2;
      case REG_OFFSET_WIN1V:
        return (this.gba.windows.win1.y1 << 8) | this.gba.windows.win1.y2;
      case REG_OFFSET_WININ:
        return (this.gba.windows.win0Inside & 0x3F)
             | (this.gba.windows.win0BlendEnable ? 0x20 : 0)
             | ((this.gba.windows.win1Inside & 0x3F) << 8)
             | (this.gba.windows.win1BlendEnable ? 0x2000 : 0);
      case REG_OFFSET_WINOUT:
        return (this.gba.windows.outsideEnable & 0x3F)
             | (this.gba.windows.outsideBlendEnable ? 0x20 : 0);
      case REG_OFFSET_MOSAIC:
        return (this.gba.mosaic.bgH & 0xF)
             | ((this.gba.mosaic.bgV & 0xF) << 4)
             | ((this.gba.mosaic.objH & 0xF) << 8)
             | ((this.gba.mosaic.objV & 0xF) << 12);
      default:
        return 0;
    }
  }

  private buildBgCnt(bgIdx: 0 | 1 | 2 | 3): number {
    const cfg = this.gba.bg(bgIdx).config;
    let v = (cfg.priority & 3)
          | ((cfg.charBaseIndex & 3) << 2)
          | (cfg.paletteMode ? 0x80 : 0)
          | ((cfg.mapBaseIndex & 31) << 8)
          | (cfg.wraparound ? 0x2000 : 0)
          | ((cfg.screenSize & 3) << 14);
    return v;
  }

  SetGpuReg(reg: number, value: number): void {
    switch (reg) {
      case REG_OFFSET_DISPCNT:
        this.applyDispCnt(value);
        break;
      case REG_OFFSET_BG0CNT: this.applyBgCnt(0, value); break;
      case REG_OFFSET_BG1CNT: this.applyBgCnt(1, value); break;
      case REG_OFFSET_BG2CNT: this.applyBgCnt(2, value); break;
      case REG_OFFSET_BG3CNT: this.applyBgCnt(3, value); break;
      case REG_OFFSET_BG0HOFS: this.gba.bg(0).config.hofs = value & 0x1FF; break;
      case REG_OFFSET_BG0VOFS: this.gba.bg(0).config.vofs = value & 0x1FF; break;
      case REG_OFFSET_BG1HOFS: this.gba.bg(1).config.hofs = value & 0x1FF; break;
      case REG_OFFSET_BG1VOFS: this.gba.bg(1).config.vofs = value & 0x1FF; break;
      case REG_OFFSET_BG2HOFS: this.gba.bg(2).config.hofs = value & 0x1FF; break;
      case REG_OFFSET_BG2VOFS: this.gba.bg(2).config.vofs = value & 0x1FF; break;
      case REG_OFFSET_BG3HOFS: this.gba.bg(3).config.hofs = value & 0x1FF; break;
      case REG_OFFSET_BG3VOFS: this.gba.bg(3).config.vofs = value & 0x1FF; break;
      case REG_OFFSET_BLDCNT: this.applyBldCnt(value); break;
      case REG_OFFSET_BLDALPHA: this.applyBldAlpha(value); break;
      case REG_OFFSET_BLDY: this.gba.blend.brightness = value & 0x1F; break;
      case REG_OFFSET_WIN0H: this.applyWin0H(value); break;
      case REG_OFFSET_WIN1H: this.applyWin1H(value); break;
      case REG_OFFSET_WIN0V: this.applyWin0V(value); break;
      case REG_OFFSET_WIN1V: this.applyWin1V(value); break;
      case REG_OFFSET_WININ: this.applyWinIn(value); break;
      case REG_OFFSET_MOSAIC: this.applyMosaic(value); break;
      case REG_OFFSET_WINOUT:
        this.gba.windows.outsideEnable = value & 0x3F;
        this.gba.windows.outsideBlendEnable = !!(value & 0x20);
        break;
      // Affine matrix BG2 (8.8 fixed, sign-extended 16-bit)
      case REG_OFFSET_BG2PA: this.gba.bgAffineMatrices[0].pa = (value << 16) >> 16; break;
      case REG_OFFSET_BG2PB: this.gba.bgAffineMatrices[0].pb = (value << 16) >> 16; break;
      case REG_OFFSET_BG2PC: this.gba.bgAffineMatrices[0].pc = (value << 16) >> 16; break;
      case REG_OFFSET_BG2PD: this.gba.bgAffineMatrices[0].pd = (value << 16) >> 16; break;
      // Affine ref point BG2 (28.8 fixed, reconstructed from L/H halves)
      case REG_OFFSET_BG2X_L: this._bgRefXL[2] = value & 0xFFFF; this._updateBgRef(2); break;
      case REG_OFFSET_BG2X_H: this._bgRefXH[2] = value & 0xFFFF; this._updateBgRef(2); break;
      case REG_OFFSET_BG2Y_L: this._bgRefYL[2] = value & 0xFFFF; this._updateBgRef(2); break;
      case REG_OFFSET_BG2Y_H: this._bgRefYH[2] = value & 0xFFFF; this._updateBgRef(2); break;
      // Affine matrix BG3
      case REG_OFFSET_BG3PA: this.gba.bgAffineMatrices[1].pa = (value << 16) >> 16; break;
      case REG_OFFSET_BG3PB: this.gba.bgAffineMatrices[1].pb = (value << 16) >> 16; break;
      case REG_OFFSET_BG3PC: this.gba.bgAffineMatrices[1].pc = (value << 16) >> 16; break;
      case REG_OFFSET_BG3PD: this.gba.bgAffineMatrices[1].pd = (value << 16) >> 16; break;
      // Affine ref point BG3
      case REG_OFFSET_BG3X_L: this._bgRefXL[3] = value & 0xFFFF; this._updateBgRef(3); break;
      case REG_OFFSET_BG3X_H: this._bgRefXH[3] = value & 0xFFFF; this._updateBgRef(3); break;
      case REG_OFFSET_BG3Y_L: this._bgRefYL[3] = value & 0xFFFF; this._updateBgRef(3); break;
      case REG_OFFSET_BG3Y_H: this._bgRefYH[3] = value & 0xFFFF; this._updateBgRef(3); break;
    }
  }

  private applyDispCnt(value: number): void {
    const mode = value & 7;
    this._dispCntMode = mode;

    // Bits 8-11 : BG0-3 enable
    this.gba.bg(0).config.visible = !!(value & DISPCNT_BG0_ON);
    this.gba.bg(1).config.visible = !!(value & DISPCNT_BG1_ON);
    this.gba.bg(2).config.visible = !!(value & DISPCNT_BG2_ON);
    this.gba.bg(3).config.visible = !!(value & DISPCNT_BG3_ON);

    // Bits 13-15 : Win0/Win1/WinObj enable
    this.gba.windows.win0.enabled = !!(value & DISPCNT_WIN0_ON);
    this.gba.windows.win1.enabled = !!(value & DISPCNT_WIN1_ON);
    this.gba.windows.winObjEnabled = !!(value & DISPCNT_WINOBJ_ON);

    // Mode affine : Mode 1 = BG2 affine, Mode 2 = BG2+BG3 affine
    this.gba.bg(2).config.isAffine = (mode === 1 || mode === 2);
    this.gba.bg(2).config.affineMatrixIndex = 0;
    this.gba.bg(3).config.isAffine = (mode === 2);
    this.gba.bg(3).config.affineMatrixIndex = 1;
  }

  private applyBgCnt(bgIdx: 0 | 1 | 2 | 3, value: number): void {
    const cfg = this.gba.bg(bgIdx).config;
    // 1:1 décomp src/bg.c : SetGpuReg(BGxCNT, value) écrit le HW register, mais
    // sGpuBgConfigs (= notre cfg) reste intact. ShowBgInternal re-écrit le
    // register depuis sGpuBgConfigs au prochain ShowBg.
    //
    // Bug session 87 fix : SetGpuReg(BGxCNT, 0) (= clear pattern utilisé par
    // CB2_NewGameBirchSpeech_ReturnFromNamingScreen pour clear HW register)
    // clobbait notre cfg → BG configs perdus après naming. Fix : skip update
    // si value === 0 (= "hide register, preserve config").
    if (value === 0) {
      // Treat as "register off" without resetting config (= compositor uses cfg).
      // Pas de modification cfg.priority/charBase/mapBase/etc.
      return;
    }
    cfg.priority = value & 3;
    cfg.charBaseIndex = (value >> 2) & 3;
    // Bit 6 : mosaic, bit 7 : 256 color
    cfg.paletteMode = (value & 0x80) ? 1 : 0;
    cfg.mapBaseIndex = (value >> 8) & 31;
    // Bit 13 : wrap (BG2/3 affine only)
    cfg.wraparound = !!(value & 0x2000);
    // Bits 14-15 : screen size
    cfg.screenSize = ((value >> 14) & 3) as 0 | 1 | 2 | 3;
    // isAffine est contrôlé exclusivement par applyDispCnt (mode vidéo).
    // On met à jour ici aussi au cas où applyBgCnt serait appelé avant applyDispCnt
    // dans un batch de SetGpuReg, mais la source de vérité reste DISPCNT.
    if (bgIdx === 2) {
      cfg.isAffine = (this._dispCntMode === 1 || this._dispCntMode === 2);
      cfg.affineMatrixIndex = 0;
    } else if (bgIdx === 3) {
      cfg.isAffine = (this._dispCntMode === 2);
      cfg.affineMatrixIndex = 1;
    } else {
      cfg.isAffine = false;
    }
  }

  private applyBldCnt(value: number): void {
    // Bit 6-7 : effect (00=off, 01=blend, 10=lighten, 11=darken)
    const effect = (value >> 6) & 3;
    this.gba.blend.mode = effect as 0 | 1 | 2 | 3;
    this.gba.blend.target1 = value & 0x3F;
    this.gba.blend.target2 = (value >> 8) & 0x3F;
  }

  private applyBldAlpha(value: number): void {
    this.gba.blend.alpha1 = value & 0x1F;
    this.gba.blend.alpha2 = (value >> 8) & 0x1F;
  }

  private applyWin0H(value: number): void {
    // High byte = x1 (left), low byte = x2 (right)
    this.gba.windows.win0.x2 = value & 0xFF;
    this.gba.windows.win0.x1 = (value >> 8) & 0xFF;
  }

  private applyWin0V(value: number): void {
    this.gba.windows.win0.y2 = value & 0xFF;
    this.gba.windows.win0.y1 = (value >> 8) & 0xFF;
  }

  private applyWinIn(value: number): void {
    this.gba.windows.win0Inside = value & 0x3F;
    this.gba.windows.win1Inside = (value >> 8) & 0x3F;
    this.gba.windows.win0BlendEnable = !!(value & 0x20);
    this.gba.windows.win1BlendEnable = !!((value >> 8) & 0x20);
  }

  private applyWin1H(value: number): void {
    this.gba.windows.win1.x2 = value & 0xFF;
    this.gba.windows.win1.x1 = (value >> 8) & 0xFF;
  }

  private applyWin1V(value: number): void {
    this.gba.windows.win1.y2 = value & 0xFF;
    this.gba.windows.win1.y1 = (value >> 8) & 0xFF;
  }

  private applyMosaic(value: number): void {
    // REG_MOSAIC : bits 0-3 = BG mosaic H, 4-7 = BG mosaic V
    // bits 8-11 = OBJ mosaic H, 12-15 = OBJ mosaic V
    this.gba.mosaic.bgH = value & 0xF;
    this.gba.mosaic.bgV = (value >> 4) & 0xF;
    this.gba.mosaic.objH = (value >> 8) & 0xF;
    this.gba.mosaic.objV = (value >> 12) & 0xF;
  }

  // ============================================================================
  // LZ77UnCompVram + LoadPalette wrappers (notre version : load PNG/bin async)
  // ============================================================================

  /** Charge un PNG 4bpp en utilisant une palette canonique (16 colors = 1 bank).
   *  Setup tile data dans bg(bgIdx).vram. */
  async LZ77UnCompVram_Tileset4bpp(pngUrl: string, palette: Uint16Array, bgIdx: 0 | 1 | 2 | 3): Promise<void> {
    const png = await loadIndexedPngWithPal(pngUrl, palette.subarray(0, 16));
    const vram = this.gba.bg(bgIdx).vram;
    vram.set(png.charData.subarray(0, vram.length));
  }

  /** Charge un PNG 8bpp (BG affine) en utilisant une palette canonique de 256 colors. */
  async LZ77UnCompVram_Tileset8bpp(pngUrl: string, palette: Uint16Array, bgIdx: 0 | 1 | 2 | 3): Promise<void> {
    const png = await loadIndexedPng8bppWithPal(pngUrl, palette);
    const vram = this.gba.bg(bgIdx).vram;
    vram.set(png.charData.subarray(0, vram.length));
  }

  /** Charge un tilemap .bin (u16 ou u8 selon affineFlag) dans bg(bgIdx).tilemap. */
  async LZ77UnCompVram_Tilemap(binUrl: string, bgIdx: 0 | 1 | 2 | 3, affine = false): Promise<void> {
    const tilemap = affine
      ? await loadAffineTilemapBin(binUrl)
      : await loadTilemapBin(binUrl);
    const dst = this.gba.bg(bgIdx).tilemap;
    dst.set(tilemap.subarray(0, dst.length));
  }

  /** Helper : copie char data dans objVram avec clamp safety. */
  private _writeToObjVram(charData: Uint8Array, byteOffset: number): void {
    const remainingSpace = this.gba.objVram.length - byteOffset;
    const copySize = Math.min(charData.length, remainingSpace);
    if (copySize > 0) this.gba.objVram.set(charData.subarray(0, copySize), byteOffset);
  }

  /** Charge un sprite sheet 4bpp dans objVram à un offset (en bytes). Auto-detect palette
   *  via les couleurs uniques (= ordre d'apparition pixels, peut diverger de PLTE). */
  async LoadCompressedSpriteSheet(pngUrl: string, byteOffset: number): Promise<{ palette: Uint16Array, byteSize: number }> {
    const png = await loadIndexedPng(pngUrl);
    this._writeToObjVram(png.charData, byteOffset);
    return { palette: png.palette, byteSize: png.charData.length };
  }

  /** Variante "strict" : extrait le PLTE PNG embedded → indices résultants matchent
   *  l'ordre canonique du décomp. À utiliser pour les sprites multi-palette
   *  (drops_logo.png où drops + logo partagent l'atlas avec différentes runtime palettes). */
  async LoadCompressedSpriteSheetStrict(pngUrl: string, byteOffset: number): Promise<{ palette: Uint16Array, byteSize: number }> {
    const png = await loadIndexedPngStrict(pngUrl, 4);
    this._writeToObjVram(png.charData, byteOffset);
    return { palette: png.palette, byteSize: png.charData.length };
  }

  /** Variante avec palette canonique fournie. */
  async LoadCompressedSpriteSheetWithPal(pngUrl: string, byteOffset: number, palette: Uint16Array): Promise<{ byteSize: number }> {
    const png = await loadIndexedPngWithPal(pngUrl, palette.subarray(0, 16));
    this._writeToObjVram(png.charData, byteOffset);
    return { byteSize: png.charData.length };
  }

  /** 1:1 décomp `LoadPalette(src, paletteFlatIdx, sizeBytes)` (palette.c:91-95).
   *
   *  flatIdx : index flat dans gPlttBuffer (0-511). 0-255 = BG, 256-511 = OBJ.
   *
   *  ⚠️ CRITIQUE — Bug session 124 fix : avant ce fix on écrivait DIRECTEMENT à
   *  `gba.palette.loadBgRange` (= bypass complet de gPlttBufferFaded ET du
   *  gate `bufferTransferDisabled`). Conséquence : tout sprite/tileset asset
   *  loader qui call LoadPaletteBg/Obj pendant un warp window leaked NEW colors
   *  à PaletteBanks → palette flash visible avant fade-in (= user A.1).
   *  Fix 1:1 décomp : écrire à `gPlttBufferFaded` (+ Unfaded) ; le `Transfer
   *  PlttBuffer()` au prochain VBlank flush la palette en respectant le gate. */
  LoadPaletteBg(palette: Uint16Array, flatIdx: number): void {
    for (let i = 0; i < palette.length; i++) {
      this.gPlttBufferFaded.set(flatIdx + i, palette[i]);
      this.gPlttBufferUnfaded.set(flatIdx + i, palette[i]);
    }
  }

  LoadPaletteObj(palette: Uint16Array, flatIdx: number): void {
    // flatIdx peut être un OBJ_PLTT_ID() (= 256+n*16) ou un idx OBJ-relative (0-255).
    // gPlttBufferFaded layout : 0-255 = BG, 256-511 = OBJ. Si flatIdx < 256, c'est
    // un index OBJ-relatif → ajouter 256.
    const flatBase = flatIdx >= 256 ? flatIdx : 256 + flatIdx;
    for (let i = 0; i < palette.length; i++) {
      this.gPlttBufferFaded.set(flatBase + i, palette[i]);
      this.gPlttBufferUnfaded.set(flatBase + i, palette[i]);
    }
  }

  /** Charge .pal file depuis URL puis charge dans BG palette. */
  async LoadPaletteBgFromFile(palUrl: string, flatIdx: number): Promise<Uint16Array> {
    const pal = await loadGbaPal(palUrl);
    this.LoadPaletteBg(pal, flatIdx);
    return pal;
  }

  /** Charge .pal file puis charge dans OBJ palette. */
  async LoadPaletteObjFromFile(palUrl: string, flatIdx: number): Promise<Uint16Array> {
    const pal = await loadGbaPal(palUrl);
    this.LoadPaletteObj(pal, flatIdx);
    return pal;
  }

  // ============================================================================
  // BeginNormalPaletteFade + UpdatePaletteFade (1:1 décomp palette_fade.c)
  // ============================================================================

  /** 1:1 décomp BeginNormalPaletteFade(palettes, delay, startY, endY, color).
   *  Démarre un fade de brightness startY → endY sur N frames (N = abs(endY-startY)).
   *
   *  1:1 GBA palette_fade.c : modifie gPlttBufferFaded chaque frame en blendant
   *  Unfaded vers la couleur target avec coefficient evY/16. Pour color custom
   *  (e.g. RGB(9,10,10) = dark grey utilisé Lightning/Rayquaza), on doit blend
   *  vers cette couleur, PAS vers white via BLDY.
   *
   *  La string `color` (= name like "RGB_WHITEALPHA" ou "RGB(9, 10, 10)") doit
   *  être parsée pour extraire le RGB15 target. */
  BeginNormalPaletteFade(palettes: string | number, delay: number, startY: number, endY: number, color: string | number): void {
    // 1:1 décomp src/palette.c:158 BeginNormalPaletteFade : si déjà active,
    // retourne FALSE sans rien faire.
    if (this.gPaletteFade.active) {
      return;
    }
    // 1:1 décomp l.169-175 : deltaY = 2 par défaut. Si delay < 0, deltaY +=
    // (-delay) puis delay = 0 (= mode "négatif" qui accélère).
    let effectiveDelay = delay;
    let effectiveDeltaY = 2;
    if (delay < 0) {
      effectiveDeltaY += (-delay);
      effectiveDelay = 0;
    }
    this.gPaletteFade.deltaY = effectiveDeltaY;
    this.gPaletteFade.active = true;
    this.gPaletteFade.startY = startY;
    this.gPaletteFade.endY = endY;
    // currentFrame/totalFrames sont kept pour compat externe mais NOT used
    // par le nouvel UpdatePaletteFade tick-based (= audit V2).
    this.gPaletteFade.currentFrame = 0;
    this.gPaletteFade.totalFrames = Math.max(1, Math.abs(endY - startY));
    this.gPaletteFade.delayPerStep = effectiveDelay;
    this.gPaletteFade.delayRemaining = effectiveDelay;
    // ─── Phase B audit session 83 : init fields complets 1:1 décomp ────
    this.gPaletteFade.mode = NORMAL_FADE;
    // 1:1 décomp palette.c:186-189 : `if (startY < targetY) yDec = 0; else yDec = 1;`
    // Cas startY == targetY → décomp set yDec=1 (= "decreasing"). Notre fix :
    // strict 1:1 avec ce edge case (= startY < endY → false → yDec=1).
    this.gPaletteFade.yDec = !(startY < endY);
    this.gPaletteFade.softwareFadeFinishing = false;
    this.gPaletteFade.softwareFadeFinishingCounter = 0;
    this.gPaletteFade.hardwareFadeFinishing = false;
    this.gPaletteFade.shouldResetBlendRegisters = false;
    // 1:1 décomp l.180 : `gPaletteFade.y = startY`. brightness = our `y`.
    this.gPaletteFade.brightness = startY;
    // ⚠️ Audit Session 92 : the décomp `BeginNormalPaletteFade` (palette.c:158-202)
    // does NOT reset `objPaletteToggle`. Our previous reset was a divergence —
    // it could mis-align the BG/OBJ tick alternation across consecutive fades
    // (= e.g. ball-release where the 2nd fade BACK from white must continue from
    // the toggle state left by the 1st fade TO white). 1:1 décomp : preserve
    // toggle. The decomp's `ResetPaletteFadeControl` (= called once at scene
    // init) is the only place that resets it.
    // Parse selected palettes mask (1:1 décomp BG bits 0-15 + OBJ bits 16-31).
    // Décomp: u32 mask, BG palettes 0-15 = bits 0-15, OBJ palettes 0-15 = bits 16-31.
    // Default = "all" (e.g. PALETTES_ALL = 0xFFFFFFFF).
    let palMask = 0xFFFFFFFF;
    if (typeof palettes === 'number') {
      palMask = palettes >>> 0;
    } else if (typeof palettes === 'string') {
      // Strings like "PALETTES_ALL", "PALETTES_BG", "PALETTES_BG & ~(0x21)", etc.
      // Best-effort eval: substitute known constants then parse.
      const PALETTES_ALL = 0xFFFFFFFF;
      const PALETTES_BG = 0xFFFF;
      const PALETTES_OBJECTS = 0xFFFF0000;
      try {
        const expr = palettes
          .replace(/PALETTES_ALL/g, '0xFFFFFFFF')
          .replace(/PALETTES_BG/g, '0xFFFF')
          .replace(/PALETTES_OBJECTS/g, '0xFFFF0000');
        // eslint-disable-next-line no-new-func
        palMask = (new Function(`return (${expr}) >>> 0`))();
      } catch {
        palMask = 0xFFFFFFFF;
        void PALETTES_ALL; void PALETTES_BG; void PALETTES_OBJECTS;
      }
    }
    this.gPaletteFade.selectedPalettes = palMask >>> 0;
    // Parse target color → RGB15 u16. Color peut être :
    //   - string macro: "RGB_BLACK" / "RGB_WHITEALPHA" / "RGB(9, 10, 10)"
    //   - number direct: u16 RGB15 packed (cas auto code qui résout RGB() inline)
    let targetR15 = 0, targetG15 = 0, targetB15 = 0;
    if (typeof color === 'number') {
      targetR15 = color & 0x1F;
      targetG15 = (color >> 5) & 0x1F;
      targetB15 = (color >> 10) & 0x1F;
    } else if (color === 'RGB_BLACK') {
      targetR15 = 0; targetG15 = 0; targetB15 = 0;
    } else if (color === 'RGB_WHITE' || color === 'RGB_WHITEALPHA') {
      targetR15 = 31; targetG15 = 31; targetB15 = 31;
    } else if (typeof color === 'string') {
      // "RGB(r, g, b)" form (= 5-bit per channel decomp values)
      const m = color.match(/RGB\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
      if (m) {
        targetR15 = Math.min(31, +m[1]);
        targetG15 = Math.min(31, +m[2]);
        targetB15 = Math.min(31, +m[3]);
      } else {
        // Fallback white
        targetR15 = 31; targetG15 = 31; targetB15 = 31;
      }
    } else {
      targetR15 = 31; targetG15 = 31; targetB15 = 31;
    }
    this.gPaletteFade.targetR = targetR15;
    this.gPaletteFade.targetG = targetG15;
    this.gPaletteFade.targetB = targetB15;
    // ⚠️ NE PAS reset gba.blend.mode/brightness ici. C'était un ancien hack
    // pour fades white (= quand notre palette fade était implémenté via BLDY).
    // Maintenant le fade modifie gPlttBufferFaded entries directement, et BLDCNT/BLDY
    // est utilisé INDEPENDAMMENT par certaines scènes (= option menu darken effect
    // pour le WIN0 highlight cursor). 1:1 décomp BeginNormalPaletteFade ne touche
    // pas BLDCNT/BLDY non plus.
    //
    // 1:1 décomp BeginNormalPaletteFade l.191 : appelle UpdatePaletteFade() une
    // fois avant return, pour appliquer le startY initial sur Faded buffer. Audit
    // V2 : reset _paletteFadeCalledThisFrame avant pour ne pas être skippé.
    const wasFlagged = this._paletteFadeCalledThisFrame;
    this._paletteFadeCalledThisFrame = false;
    this.UpdatePaletteFade();
    this._paletteFadeCalledThisFrame = wasFlagged;
    // 1:1 décomp l.193-199 : flush gPlttBufferFaded → PLTT direct (DMA copy
    // immédiate). Notre engine fait via gPlttBufferFaded.flushTo() au prochain
    // VBlank tick — équivalent fonctionnel.
  }

  /** @deprecated audit V2 — utiliser _applyPaletteFadeStepHalf. Kept pour les
   *  callers externes (e.g. tests) qui veulent un apply complet en 1 call.
   *  Process BOTH BG + OBJ halves dans un seul call (= ancien comportement).
   *
   *  1:1 décomp UpdateNormalPaletteFade : itère bank par bank (16 entries chacun),
   *  skip les banks non-sélectionnés.
   *  Pour les palettes NON sélectionnées : Faded[i] reste intact (= valeur écrite
   *  par CpuCopy16 sprite cb, ou de la frame précédente). Critique pour bank 5
   *  Rayquaza scene : excluded de la fade `& ~(0x21)` mais doit garder couleurs
   *  d'origine (sky bleu, body green, etc) pendant que les autres banks fadent. */
  private _applyPaletteFadeStep(brightness: number): void {
    const tR = this.gPaletteFade.targetR;
    const tG = this.gPaletteFade.targetG;
    const tB = this.gPaletteFade.targetB;
    const w = brightness;  // 0..16 (16 = full target)
    const selected = this.gPaletteFade.selectedPalettes >>> 0;
    // 32 banks total (16 BG + 16 OBJ). Each bank = 16 entries u16.
    // 1:1 décomp src/util.c:264 BlendPalette : `r + (((tR - r) * coeff) >> 4)`
    // Truncation, pas de +8 round (= match exact décomp).
    for (let bank = 0; bank < 32; bank++) {
      if (((selected >>> bank) & 1) === 0) continue;  // skip non-selected
      const baseIdx = bank * 16;
      for (let entry = 0; entry < 16; entry++) {
        const i = baseIdx + entry;
        const u = this.gPlttBufferUnfaded.get(i);
        const r5 = u & 0x1F;
        const g5 = (u >> 5) & 0x1F;
        const b5 = (u >> 10) & 0x1F;
        const newR = r5 + (((tR - r5) * w) >> 4);
        const newG = g5 + (((tG - g5) * w) >> 4);
        const newB = b5 + (((tB - b5) * w) >> 4);
        const packed = (newR & 0x1F) | ((newG & 0x1F) << 5) | ((newB & 0x1F) << 10);
        this.gPlttBufferFaded.set(i, packed);
      }
    }
  }

  /** Tick du palette fade. À call chaque frame.
   *  Retourne TRUE tant que le fade est actif (1:1 décomp bool8).
   *
   *  ⚠️ Audit V2 rewrite : 1:1 décomp src/palette.c:UpdateNormalPaletteFade
   *  (l.408-492). L'ancien impl utilisait un compteur frame linéaire
   *  (currentFrame/totalFrames) qui calculait brightness via interpolation —
   *  ça marchait pour les durées totales mais loupait :
   *    1) `objPaletteToggle` qui gates le travail BG (toggle=0) vs OBJ (toggle=1).
   *    2) `deltaY` step (2 par défaut) qui fait avancer y de 2 par "round complete"
   *       (= un round = BG processed + OBJ processed = 2 frames).
   *    3) `delayCounter` incrémente seulement quand toggle=0 (= 1 frame sur 2).
   *    4) `softwareFadeFinishingCounter` qui attend 4 frames de plus une fois
   *       y atteint targetY avant de set active=false.
   *
   *  Pour 1:1 fidélité, on simule le pattern tick-par-tick : chaque appel
   *  process soit BG (= banks 0-15) soit OBJ (= banks 16-31), pas les deux.
   *  y avance après que les deux halves soient processed. */
  UpdatePaletteFade(): boolean {
    // 1:1 décomp idempotency guard : marque l'appel pour cette frame. Le
    // tickFixed final check `!_paletteFadeCalledThisFrame` skip le second appel.
    this._paletteFadeCalledThisFrame = true;
    const f = this.gPaletteFade;
    if (!f.active) {
      // softwareFadeFinishing latch : reset après 1 frame.
      if (f.softwareFadeFinishing) f.softwareFadeFinishing = false;
      return false;
    }

    // ─── 1:1 décomp IsSoftwarePaletteFadeFinishing (palette.c:809-830) ──
    // Counter ramps 0→4 (= 5 frames). Quand 4 atteint : active=FALSE +
    // softwareFadeFinishing=FALSE + counter=0 dans le MÊME call (= 1:1).
    // Pendant ces 5 frames, return TRUE (= PALETTE_FADE_STATUS_ACTIVE).
    if (f.softwareFadeFinishing) {
      if (f.softwareFadeFinishingCounter === 4) {
        f.active = false;
        f.softwareFadeFinishing = false;  // 1:1 décomp — clear MÊME tick
        f.softwareFadeFinishingCounter = 0;
      } else {
        f.softwareFadeFinishingCounter++;
      }
      return true;  // = PALETTE_FADE_STATUS_ACTIVE while finishing
    }

    // ─── 1:1 décomp UpdateNormalPaletteFade body (l.420-486) ─────────
    // Delay gate : delayCounter incrémente seulement quand toggle == 0.
    // Quand counter atteint delayPerStep, reset à 0 et continue.
    if (!f.objPaletteToggle) {
      if (f.delayRemaining < f.delayPerStep) {
        f.delayRemaining++;
        return true;  // delay frame, ne process aucune palette
      }
      f.delayRemaining = 0;
    }

    // ─── Apply fade step pour BG (toggle=0) ou OBJ (toggle=1) ───────
    // 1:1 décomp l.434-454 : selectedPalettes >> 16 si OBJ, sinon raw.
    // paletteOffset = OBJ_PLTT_OFFSET (=256) si OBJ, sinon 0.
    const half: 'bg' | 'obj' = f.objPaletteToggle ? 'obj' : 'bg';
    this._applyPaletteFadeStepHalf(f.brightness, half);

    // 1:1 décomp l.456 : objPaletteToggle ^= 1.
    f.objPaletteToggle = !f.objPaletteToggle;

    // 1:1 décomp l.458 : if (!objPaletteToggle) — = juste après avoir processed
    // OBJ (= maintenant on flip à BG = toggle becomes 0). À ce moment on
    // advance y vers targetY.
    if (!f.objPaletteToggle) {
      if (f.brightness === f.endY) {
        // Atteint : trigger finishing.
        f.selectedPalettes = 0;  // 1:1 décomp l.462
        f.softwareFadeFinishing = true;
        // (compteur ramps depuis 0 dans IsSoftwarePaletteFadeFinishing)
      } else {
        // Advance y vers endY par deltaY.
        if (!f.yDec) {
          let val = f.brightness + f.deltaY;
          if (val > f.endY) val = f.endY;
          f.brightness = val;
        } else {
          let val = f.brightness - f.deltaY;
          if (val < f.endY) val = f.endY;
          f.brightness = val;
        }
      }
    }

    return true;  // PALETTE_FADE_STATUS_ACTIVE
  }

  /** 1:1 décomp UpdateNormalPaletteFade body inner loop (l.444-454).
   *  Process une half (BG = banks 0-15, OBJ = banks 16-31) avec brightness coeff. */
  private _applyPaletteFadeStepHalf(brightness: number, half: 'bg' | 'obj'): void {
    const tR = this.gPaletteFade.targetR;
    const tG = this.gPaletteFade.targetG;
    const tB = this.gPaletteFade.targetB;
    const w = brightness;
    const selected = this.gPaletteFade.selectedPalettes >>> 0;
    // BG: bits 0-15 of selected → banks 0-15. OBJ: bits 16-31 → banks 16-31.
    const bankStart = half === 'bg' ? 0 : 16;
    const bankEnd = half === 'bg' ? 16 : 32;
    const bitOffset = half === 'bg' ? 0 : 16;
    for (let bank = bankStart; bank < bankEnd; bank++) {
      if (((selected >>> (bank - bankStart + bitOffset)) & 1) === 0) continue;
      const baseIdx = bank * 16;
      for (let entry = 0; entry < 16; entry++) {
        const i = baseIdx + entry;
        const u = this.gPlttBufferUnfaded.get(i);
        const r5 = u & 0x1F;
        const g5 = (u >> 5) & 0x1F;
        const b5 = (u >> 10) & 0x1F;
        const newR = r5 + (((tR - r5) * w) >> 4);
        const newG = g5 + (((tG - g5) * w) >> 4);
        const newB = b5 + (((tB - b5) * w) >> 4);
        const packed = (newR & 0x1F) | ((newG & 0x1F) << 5) | ((newB & 0x1F) << 10);
        this.gPlttBufferFaded.set(i, packed);
      }
    }
  }

  /** @deprecated kept for backward compat with code that still calls it externally.
   *  Audit V2 : the new tick-based UpdatePaletteFade doesn't use this anymore. */
  private _currentFadeBrightness(): number {
    return this.gPaletteFade.brightness;
  }

  // ============================================================================
  // CreateSprite + setupOam — wrapper sur gba.oam
  // ============================================================================

  /** 1:1 décomp CreateSprite(template, x, y, subpriority).
   *  Notre version simplifiée : assigne le prochain OAM slot, configure-le, retourne spriteId.
   *  Le template doit contenir : tileId, paletteBank, shape, size, priority, paletteMode, affineMode. */
  CreateSpriteAtOam(cfg: {
    tileId: number, paletteBank: number, x: number, y: number,
    shape: 0 | 1 | 2, size: 0 | 1 | 2 | 3, priority: number,
    paletteMode?: 0 | 1, affineMode?: 0 | 1 | 2 | 3, affineParamIndex?: number,
    /** 1:1 décomp `CreateSprite` 4th arg. Default 0xFF (= sentinel "behind"). */
    subpriority?: number,
  }): { spriteId: number, oamIndex: number } {
    // Recherche un slot OAM libre.
    // Bug session 89 fix : avant on testait `!oam.visible` pour décider si un
    // slot était libre. MAIS un sprite alive avec sprite.invisible=true a son
    // oam.visible=false (synced) — le slot est OWNED par ce sprite, PAS libre.
    // Si on réalloue le slot, on a 2 sprites pointant le même oamIndex →
    // syncSpritesToOam écrase les data du sprite plus ancien à chaque frame
    // (last write wins).
    //
    // 1:1 décomp src/sprite.c CreateSprite : alloue le premier slot dont
    // sprite.inUse == false (= slot vraiment libre, sprite owner détruit).
    // On track les slots taken par les sprites alive et on alloue un slot
    // qui n'apparaît pas dans cet ensemble.
    const takenSlots = new Set<number>();
    for (const s of this.gSprites.values()) {
      if (s.inUse) takenSlots.add(s.oamIndex);
    }
    // Session 94 fix : subsprite child OAM slots are ALSO taken — a sprite
    // with a SetSubspriteTables installed allocates N child OAM indices that
    // primary `gSprites.inUse` tracking does NOT cover. Without this, the next
    // CreateSpriteAtOam picks a slot that's shared with a button/frame child
    // OAM → the button child gets stomped (= "RKBO" garbled BACK button,
    // fragmented MAJ button, underscores rendering at wrong y with wrong
    // tile data — naming screen Session 94 root cause).
    //
    // Foundation : reusable by every scene that mixes SetSubspriteTables +
    // plain CreateSpriteAtOam (= party menu cursor, summary screen markings,
    // status condition icons, future PC system, etc.).
    const getChildOams = (globalThis as Record<string, unknown>)._getSubspriteChildOamIndices as (() => Set<number>) | undefined;
    if (getChildOams) {
      for (const idx of getChildOams()) takenSlots.add(idx);
    }
    let oamIndex = -1;
    for (let i = 0; i < 128; i++) {
      if (!takenSlots.has(i)) {
        oamIndex = i;
        break;
      }
    }
    if (oamIndex === -1) {
      if (!this._oamExhaustedWarned) {
        console.warn('[DecompRuntime] OAM slots exhausted (further warnings suppressed)');
        this._oamExhaustedWarned = true;
      }
      return { spriteId: -1, oamIndex: -1 };
    }
    const oam = this.gba.oam[oamIndex];
    oam.visible = true;
    oam.tileId = cfg.tileId;
    oam.paletteBank = cfg.paletteBank;
    oam.x = cfg.x;
    oam.y = cfg.y;
    oam.shape = cfg.shape;
    oam.size = cfg.size;
    oam.priority = cfg.priority;
    oam.paletteMode = cfg.paletteMode ?? 0;
    oam.affineMode = (cfg.affineMode ?? 0) as 0 | 1 | 2 | 3;
    oam.affineParamIndex = cfg.affineParamIndex ?? 0;
    oam.flipH = false;
    oam.flipV = false;

    // 1:1 décomp src/sprite.c:CreateSpriteAt — CalcCenterToCornerVec
    // appliqué SYSTÉMATIQUEMENT à la création (pas seulement pour affine
    // sprites). oam.x = sprite.x + sprite.x2 + centerToCornerVecX (ligne 354).
    // Sans ça, les sprites non-affines sont rendus avec leur top-left à
    // (sprite.x, sprite.y) au lieu de leur CENTRE.
    // Cf. ground truth VBA-M Birch dump : sprite.x=136 (= 0x88) → oam.x=104,
    // diff = -32 = centerToCornerVecX pour shape=square size=64x64.
    const ctcv = CalcCenterToCornerVec(cfg.shape, cfg.size, (cfg.affineMode ?? 0));

    // 1:1 décomp src/sprite.c CreateSprite : gSprites = tableau fixe
    // MAX_SPRITES(64) ; alloue le 1er slot inUse==FALSE (réutilise les
    // sprites détruits), retourne MAX_SPRITES si les 64 sont pris.
    // AVANT : nextSpriteId++ MONOTONE → id≥64 (1) collisionne le sentinel
    // d'échec MAX_SPRITES=64 chez les appelants `!= MAX_SPRITES` (icône
    // sac orpheline à oam(-16,-16), x2/y2 jamais posés, jamais détruite)
    // (2) fuite gSprites non bornée. = 4e instance du pattern allocateur-
    // monotone-sans-reuse (cf. palette/tuiles/OAM déjà corrigés).
    let spriteId = -1;
    for (let i = 0; i < 64; i++) {
      const ex = this.gSprites.get(i);
      if (ex === undefined || ex.inUse === false) { spriteId = i; break; }
    }
    if (spriteId === -1) {
      // 64 slots inUse → échec 1:1 (return MAX_SPRITES). Libère l'OAM réservé.
      this.gba.oam[oamIndex].visible = false;
      if (!this._oamExhaustedWarned) {
        console.warn('[DecompRuntime] gSprites (64) saturé — CreateSprite=MAX_SPRITES');
        this._oamExhaustedWarned = true;
      }
      return { spriteId: 64 /* MAX_SPRITES */, oamIndex: -1 };
    }
    if (spriteId >= this.nextSpriteId) this.nextSpriteId = spriteId + 1;
    const sprite: DecompSprite = {
      oamIndex, data: new Int16Array(16) as unknown as number[], invisible: false,
      inUse: true,
      x: cfg.x, y: cfg.y, x2: 0, y2: 0,
      hFlip: false, vFlip: false,
      matrixNum: cfg.affineParamIndex ?? 0,
      centerToCornerVecX: ctcv.centerToCornerVecX,
      centerToCornerVecY: ctcv.centerToCornerVecY,
      animEnded: false, affineAnimEnded: false,
      callback: null,
      spriteId, tileBase: 0,
      objMode: 0,
      affineAnimsTableName: null,
      affineAnimNum: 0, affineAnimCmdIndex: 0, affineAnimDelayCounter: 0,
      xScale: 0x100, yScale: 0x100, rotation: 0,
      affineAnimBeginning: false, affineAnimPaused: false,
      shape: cfg.shape, size: cfg.size,
      affineMode: (cfg.affineMode ?? 0) as 0 | 1 | 2 | 3,
      subpriority: cfg.subpriority ?? 0xFF,
    };
    this.gSprites.set(spriteId, sprite);
    return { spriteId, oamIndex };
  }

  /** Récupère un sprite par son ID. */
  getSprite(spriteId: number): DecompSprite | undefined {
    return this.gSprites.get(spriteId);
  }

  /** Tracks affine matrix slots in use (= gba.affineParams[0..31] = 32 slots).
   *  1:1 décomp: src/sprite.c uses `sOamMatrixAllocBitmap` to track which of
   *  the 32 OAM matrix slots are claimed. Slot 0 is reserved for the "identity"
   *  default and must NOT be allocated (= screen wide identity, used by every
   *  affineMode=OFF sprite). */
  private _matrixUsed = new Set<number>();

  /** 1:1 décomp src/sprite.c:AllocOamMatrix (l.1427-1446) — find a free slot in
   *  `gba.affineParams[1..31]`, mark it used, return its index.
   *  Returns -1 (= 0xFF in decomp) if all slots are exhausted.
   *
   *  ⚠️ Session 90 audit V2 fix : the decomp impl does NOT reset matrix values
   *  upon alloc (= the slot retains stale values). HOWEVER, in the decomp,
   *  every alloc is IMMEDIATELY followed by `AffineAnimStateReset` (cf.
   *  InitSpriteAffineAnim line 1463-1473) + `AnimateSprite` which writes the
   *  matrix to its first valid frame value (BeginAffineAnim line 1067-1082).
   *
   *  In our pipeline, there is a window between AllocOamMatrix and
   *  _BeginAffineAnim where the compositor could read stale values from
   *  `gba.affineParams[matrixNum]` — but only if syncSpritesToOam runs AND
   *  the compositor renders before _BeginAffineAnim writes. In normal flow
   *  this doesn't happen (alloc → BeginAffineAnim are in the same callback),
   *  but if someone calls AllocOamMatrix and forgets to BeginAffineAnim, the
   *  next frame would render with stale values.
   *
   *  Defense-in-depth : initialize slot to identity on alloc. Matches what
   *  `FreeOamMatrix` does (line 1460 : `SetOamMatrix(matrixNum, 0x100, 0, 0, 0x100)`),
   *  so we also reset on alloc to guarantee a clean slot. Cost: 4 fixed-size
   *  writes, irrelevant for perf. */
  AllocOamMatrix(): number {
    for (let i = 1; i < 32; i++) {
      if (!this._matrixUsed.has(i)) {
        this._matrixUsed.add(i);
        // Defense-in-depth (audit V2) : reset slot to identity matrix.
        // 1:1 with FreeOamMatrix's reset on release (sprite.c:1460).
        const m = this.gba.affineParams[i];
        if (m) { m.pa = 0x100; m.pb = 0; m.pc = 0; m.pd = 0x100; }
        return i;
      }
    }
    if (RT_DEBUG) console.warn('[runtime] AllocOamMatrix: all 32 slots in use');
    return -1;
  }

  /** 1:1 décomp src/sprite.c:FreeOamMatrix (l.1448-1461) — release a
   *  previously-allocated matrix slot AND reset it to identity.
   *  Decomp : `SetOamMatrix(matrixNum, 0x100, 0, 0, 0x100)`. */
  FreeOamMatrix(matrixNum: number): void {
    this._matrixUsed.delete(matrixNum);
    // 1:1 décomp sprite.c:1460 — reset slot to identity on release.
    const m = this.gba.affineParams[matrixNum];
    if (m) { m.pa = 0x100; m.pb = 0; m.pc = 0; m.pd = 0x100; }
  }

  /** Set sprite visibility — set sprite.invisible, syncSpritesToOam propage à oam. */
  setSpriteInvisible(spriteId: number, invisible: boolean): void {
    const s = this.gSprites.get(spriteId);
    if (!s) return;
    s.invisible = invisible;
    this.gba.oam[s.oamIndex].visible = !invisible;  // immédiat aussi (avant prochain sync)
  }

  /** Attache une callback à un sprite (1:1 décomp `sprite->callback = SpriteCB_X`). */
  setSpriteCallback(spriteId: number, cb: ((sprite: DecompSprite, rt: DecompRuntime) => void) | null): void {
    const s = this.gSprites.get(spriteId);
    if (s) s.callback = cb;
  }

  /** 1:1 décomp `SetMainCallback2(cb)` — swap la scène courante.
   *  Reset gMain.state à 0 (= la nouvelle scène redémarre depuis case 0 de sa
   *  state machine). Conservation : gIntroFrameCounter, gTasks, gSprites
   *  (= les Tasks créées par la scène précédente continuent jusqu'à DestroyTask).
   *
   *  Usage typique : à la fin d'une Task (e.g. Task_Scene2_End), appeler
   *  `rt.SetMainCallback2(CB2_InitTitleScreen)` pour passer au titre. */
  SetMainCallback2(cb: CB2Callback | null): void {
    this.gMain.callback2 = cb;
    this.gMain.state = 0;
  }

  /** 1:1 décomp `SetMainCallback1(cb)` — installe le callback1.
   *  Décomp main loop CallCallbacks : `if (gMain.callback1) gMain.callback1();`
   *  AVANT callback2. Utilisé par overworld (CB2_NewGame line 1546 set
   *  CB1_Overworld). Pré-VBlank logic : object events tick + map scroll.
   *  Set à NULL pendant les transitions (CB2_LoadMap line 1577). */
  SetMainCallback1(cb: CB1Callback | null): void {
    this.gMain.callback1 = cb;
  }

  /** 1:1 décomp `SetVBlankCallback(cb)` — installe une callback VBlank.
   *  Notre engine : no-op pour l'instant (les VBlank effects passent par tickFixed
   *  ou gba.addVBlankCallback). Garder pour compat code transcrit. */
  SetVBlankCallback(_cb: (() => void) | null): void {
    this.gMain.vblankCallback = _cb;
  }

  /** 1:1 décomp StartSpriteAffineAnim(sprite, animNum) — délégué à sprite-engine-impl. */
  StartSpriteAffineAnim(spriteId: number, animNum: number): void {
    const sprite = this.gSprites.get(spriteId);
    if (!sprite) return;
    _StartSpriteAffineAnim(sprite, animNum);
  }

  /** 1:1 décomp CpuCopy16(src, dst, sizeBytes) : memcpy 16-bit aligné.
   *  Source : Uint16Array (e.g. extraPalettes.get('gIntroGameFreakTextFade_Pal')).
   *  Dst : flatIdx dans gPlttBufferFaded/Unfaded (256 BG + 256 OBJ).
   *  Count : nombre d'entries u16 à copier (= sizeBytes / 2).
   *
   *  HEURISTIC : décomp differentiates `&gPlttBufferUnfaded[X]` (bulk init,
   *  count > 1) vs `&gPlttBufferFaded[X]` (dynamic sprite cb, count == 1).
   *  We can't see the dst symbol at runtime, but we can use the count :
   *   - count == 1   → write FADED ONLY (= dynamic effect, Unfaded preserved
   *     so future BlendPalette restores from original — critical for the
   *     SpriteCB_Lightning / Orb attack flow on Scene 3).
   *   - count >= 2   → write BOTH (= bulk palette load, Unfaded set as
   *     reference + Faded set immediately for current display).
   *
   *  Usage callback : rt.CpuCopy16(textPal, srcOffset, dstFlat, count) */
  CpuCopy16(src: ArrayLike<number>, srcOffset: number, dstFlat: number, count: number): void {
    if (count <= 1) {
      // Dynamic sprite-cb effect (write Faded only, preserve Unfaded for fade restore).
      this.gPlttBufferFaded.cpuCopy16(src, srcOffset, dstFlat, count);
    } else {
      // Bulk palette load (init or full bank copy) : both buffers.
      this.gPlttBufferUnfaded.cpuCopy16(src, srcOffset, dstFlat, count);
      this.gPlttBufferFaded.cpuCopy16(src, srcOffset, dstFlat, count);
    }
  }

  /** Charge un .pal file et le stocke dans extraPalettes pour usage par CpuCopy16
   *  dans les callbacks (e.g. SpriteCB_LogoLetter qui copy depuis text.pal). */
  async LoadExtraPalette(symbolName: string, palUrl: string): Promise<void> {
    const pal = await loadGbaPal(palUrl);
    this.extraPalettes.set(symbolName, pal);
    if (RT_DEBUG) console.log(`[runtime] extraPalette ${symbolName} loaded (${pal.length} colors)`);
  }

  /** Enregistre une palette préchargée (sync, pour data déjà dans assetCache). */
  setExtraPalette(symbolName: string, pal: Uint16Array): void {
    this.extraPalettes.set(symbolName, pal);
  }

  /** Récupère une palette additionnelle (1:1 décomp `gXxx_Pal[N]` access). */
  getExtraPalette(symbolName: string): Uint16Array | null {
    return this.extraPalettes.get(symbolName) ?? null;
  }

  // ============================================================================
  // CreateTask + DestroyTask (1:1 décomp task system)
  // ============================================================================

  CreateTask(func: (task: DecompTask) => void, _priority: number): number {
    const taskId = this.nextTaskId++;
    // data = Int16Array (= s16 décomp `s16 *data`). Wrap natif overflow à
    // -32768/32767. Critical pour Tasks comme Task_Scene3_Groudon qui font
    // `data[N] += K; if (data[N] == constant)` qui suppose s16 wrap.
    const task: DecompTask = { taskId, func, data: new Int16Array(16) as unknown as number[], followupFunc: null };
    this.gTasks.set(taskId, task);
    if (RT_DEBUG) console.log('[CreateTask] taskId=', taskId, 'gTasks.size=', this.gTasks.size);
    return taskId;
  }

  DestroyTask(taskId: number): void {
    this.gTasks.delete(taskId);
  }

  /** 1:1 décomp src/task.c:139 `SetTaskFuncWithFollowupFunc`.
   *  Décomp : pack le pointer 32-bit dans data[NUM_TASK_DATA-2..-1] (s16 halfwords).
   *  TS : stocke dans `task.followupFunc` (champ dédié, sémantique 1:1).
   *  Lu plus tard par `SwitchTaskToFollowupFunc`. */
  SetTaskFuncWithFollowupFunc(
    taskId: number,
    func: (task: DecompTask) => void,
    followupFunc: (task: DecompTask) => void,
  ): void {
    const task = this.gTasks.get(taskId);
    if (!task) return;
    task.followupFunc = followupFunc;
    task.func = func;
  }

  /** 1:1 décomp src/task.c:148 `SwitchTaskToFollowupFunc`.
   *  Restaure `task.func` depuis le followup stocké par `SetTaskFuncWithFollowupFunc`.
   *  La décomp ne clear PAS data[14]/data[15] après le swap (= permet
   *  re-switch). On préserve la sémantique : `followupFunc` reste set. */
  SwitchTaskToFollowupFunc(taskId: number): void {
    const task = this.gTasks.get(taskId);
    if (!task) return;
    if (task.followupFunc) task.func = task.followupFunc;
  }

  /** Run all tasks once (= 1 frame). À call chaque frame depuis update().
   *
   *  1:1 décomp src/task.c:RunTasks (lines 110-122) : itère via linked list
   *  `.next` à partir de FindFirstActiveTask. Si une Task crée une NOUVELLE
   *  Task pendant l'iteration (ex: Task_Scene1_WaterDrops → Task_BlendLogoIn
   *  frame 128), InsertTask insère selon priorité — pour des priorités égales
   *  (= 0 par défaut), la nouvelle Task est appendée à la FIN de la liste.
   *  L'iteration via `.next` la rencontre avant la fin → elle tourne MÊME
   *  FRAME que sa création.
   *
   *  Notre ancienne version utilisait un snapshot Array.from(...) avant
   *  l'iteration → les nouvelles Tasks ne tournaient PAS la frame de création
   *  → 1-frame race où Task_BlendLogoIn (BLDCNT setup pour alpha blend du
   *  logo Game Freak) ne s'exécutait que frame 129, alors que SpriteCB
   *  rendait le logo dès frame 128 → flicker solid → blended.
   *
   *  Fix : iteration dynamique. On utilise un Set pour tracker les Tasks DÉJÀ
   *  visitées cette frame (évite double-exec si une task se re-crée par
   *  réutilisation du même slot id). */
  runTasks(): void {
    // 1:1 décomp idempotency : skip 2nd call dans la même frame. Les MainCB2_*
    // auto-décomp font `RunTasks()` dans leur body (option_menu.c:138 etc).
    // Notre runtime ré-appelle `runTasks()` en backup pour les MainCB2_*
    // manuels TS (= MainCB2_Overworld). Sans guard → tasks run 2× → bug
    // double DPAD_DOWN dans option menu field. Reset flag en fin runOneFrame.
    if (this._runTasksCalledThisFrame) return;
    this._runTasksCalledThisFrame = true;
    const visited = new Set<number>();
    let processed = 0;
    const maxIters = 256;  // safety guard contre boucle infinie
    while (processed < maxIters) {
      let found: DecompTask | null = null;
      for (const task of this.gTasks.values()) {
        if (visited.has(task.taskId)) continue;
        if (!task.func) continue;
        found = task;
        break;
      }
      if (!found) break;
      visited.add(found.taskId);
      const fn = found.func;  // narrow : on a déjà vérifié !task.func ci-dessus
      if (fn) {
        try { fn(found); } catch (e) {
          console.error('[runTasks] task threw:', e);
        }
      }
      processed++;
    }
  }

  /** Tick complet : UpdatePaletteFade + runTasks + increment frameCounter.
   *  À call après bridge.tick() chaque update(). */
  tick(): void {
    this.UpdatePaletteFade();
    this.runTasks();
    this.gIntroFrameCounter++;
  }

  // ============================================================================
  // Helpers reset (pour skip / re-enter une scène)
  // ============================================================================

  reset(): void {
    this.gIntroFrameCounter = 0;
    this.gMain = new MainStruct();
    this.gPaletteFade = new PaletteFade();
    this.gTasks.clear();
    this.gSprites.clear();
    this.nextOamSlot = 0;
    this.nextTaskId = 0;
    this.nextSpriteId = 0;
    this._matrixUsed.clear();
  }

  /** ResetSpriteData : 1:1 décomp src/sprite.c:294 — ResetOamRange + ResetAllSprites
   *  + ClearSpriteCopyRequests + ResetAffineAnimData + **FreeSpriteTileRanges**.
   *  Le free des tile ranges est CRITIQUE entre 2 scènes pour que les tiles
   *  Scene 1 (DROPS_LOGO/SPARKLE/FLYGON_SILHOUETTE) soient libérées avant le
   *  load Scene 2 (BRENDAN/MAY/BICYCLE/FLYGON_LATIAS/VOLBEAT/TORCHIC/MANECTRIC).
   *  Sans ça : 1024+ tiles d'OBJ VRAM overflow → Manectric tile_id 1056 hors
   *  range → frame 4 transparent → clignotement. */
  ResetSpriteData(): void {
    for (let i = 0; i < 128; i++) this.gba.oam[i].visible = false;
    this.gSprites.clear();
    this.spriteAnimStates.clear();
    this.nextOamSlot = 0;
    this.nextSpriteId = 0;
    // FreeSpriteTileRanges : reset tile allocator (1024 tiles OBJ VRAM)
    this.spriteSheetTagToTileStart.clear();
    this.spriteSheetTagToByteSize.clear();
    this.freedSpriteTileRanges.length = 0;
    this.nextSpriteSheetByteOffset = 0;
    // 1:1 décomp ResetAffineAnimData (sprite.c:299) — release toutes les 32
    // matrix OAM. Sans ça, ré-ouvrir le sac alloue matrix 2, 3, … (= leak)
    // jusqu'à saturer le pool 32 → CreateSprite échoue silencieusement.
    this._matrixUsed.clear();
  }

  /** IntroResetGpuRegs : reset DISPCNT et BG/blend regs (mimique décomp intro.c). */
  IntroResetGpuRegs(): void {
    this.SetGpuReg(REG_OFFSET_DISPCNT, 0);
    for (let i = 0; i < 4; i++) {
      this.SetGpuReg(REG_OFFSET_BG0CNT + i * 2, 0);
      this.gba.bg(i as 0 | 1 | 2 | 3).config.hofs = 0;
      this.gba.bg(i as 0 | 1 | 2 | 3).config.vofs = 0;
    }
    this.SetGpuReg(REG_OFFSET_BLDCNT, 0);
    this.SetGpuReg(REG_OFFSET_BLDALPHA, 0);
    this.SetGpuReg(REG_OFFSET_BLDY, 0);
  }

  // ============================================================================
  // SPRITE-SYSTEM helpers : utilise les data extraites depuis le décomp
  // (sprite-system.ts) pour automatiser palette slots, sprite sheets, templates,
  // anims. Plus aucun hardcode tileId/paletteBank côté scène.
  // ============================================================================

  /** 1:1 décomp `LoadSpritePalettes(sSpritePalettes_X)` :
   *  parcourt la table, charge chaque palette à un slot OBJ libre auto-incrémenté,
   *  enregistre paletteTag → slot pour résolution future via paletteTagToSlot. */
  async LoadSpritePalettesFromTable(
    tableName: string,
    resolveUrl: (paletteName: string) => string | null,
  ): Promise<void> {
    const table = (SPRITE_PALETTES as Record<string, { entries: ReadonlyArray<{ paletteName: string, tag: string }> }>)[tableName];
    if (!table) {
      console.warn(`[runtime] LoadSpritePalettesFromTable: table ${tableName} not found in SPRITE_PALETTES`);
      return;
    }
    for (const entry of table.entries) {
      const url = resolveUrl(entry.paletteName);
      if (!url) {
        console.warn(`[runtime] LoadSpritePalettesFromTable ${tableName}: cannot resolve URL for ${entry.paletteName}`);
        continue;
      }
      const slot = this.nextObjPalSlot++;
      try {
        if (url.endsWith('.png')) {
          // Load PNG-embedded PLTE (used quand pal name pointe vers un .png)
          const png = await loadIndexedPng(url);
          this.LoadPaletteObj(png.palette, OBJ_PLTT_ID(slot));
        } else {
          await this.LoadPaletteObjFromFile(url, OBJ_PLTT_ID(slot));
        }
        this.paletteTagToSlot.set(entry.tag, slot);
        if (RT_DEBUG) console.log(`[runtime] palette ${entry.tag} → OBJ slot ${slot}`);
      } catch (e) {
        console.error(`[runtime] LoadSpritePalettesFromTable ${tableName}: load failed for ${entry.paletteName}:`, e);
      }
    }
  }

  /** 1:1 décomp `LoadCompressedSpriteSheet(sSpriteSheet_X)` :
   *  charge chaque sheet à un offset auto-incrémenté dans objVram, enregistre
   *  tileTag → tileNum start pour résolution future. */
  async LoadCompressedSpriteSheetsFromTable(
    tableName: string,
    resolveUrl: (gfxName: string) => string | null,
  ): Promise<void> {
    const table = (SPRITE_SHEETS as Record<string, { entries: ReadonlyArray<{ gfxName: string, sizeBytes: number | string, tag: string }> }>)[tableName];
    if (!table) {
      console.warn(`[runtime] LoadCompressedSpriteSheetsFromTable: table ${tableName} not found`);
      return;
    }
    for (const entry of table.entries) {
      const url = resolveUrl(entry.gfxName);
      if (!url) {
        console.warn(`[runtime] LoadCompressedSpriteSheetsFromTable ${tableName}: cannot resolve URL for ${entry.gfxName}`);
        continue;
      }
      const tileStart = this.nextSpriteSheetByteOffset / 32;
      try {
        const result = await this.LoadCompressedSpriteSheetStrict(url, this.nextSpriteSheetByteOffset);
        this.spriteSheetTagToTileStart.set(entry.tag, tileStart);
        this.nextSpriteSheetByteOffset += result.byteSize;
        if (RT_DEBUG) console.log(`[runtime] sheet ${entry.tag} → tileStart ${tileStart} (size ${result.byteSize}B)`);
      } catch (e) {
        console.error(`[runtime] LoadCompressedSpriteSheetsFromTable ${tableName}: load failed for ${entry.gfxName}:`, e);
      }
    }
  }

  /** Helpers : décode les enum strings du décomp en valeurs numériques GBA OAM. */
  private static parseAffineMode(s: string | undefined): 0 | 1 | 3 {
    return s === 'ST_OAM_AFFINE_DOUBLE' ? 3
         : s === 'ST_OAM_AFFINE_NORMAL' ? 1
         : 0;
  }

  private static parseObjMode(s: string | undefined): 0 | 1 | 2 {
    return s === 'ST_OAM_OBJ_BLEND' ? 1
         : s === 'ST_OAM_OBJ_WINDOW' ? 2
         : 0;
  }

  /** 1:1 décomp `CreateSprite(&sSpriteTemplate_X, x, y, subpriority)` :
   *  résout template → OAM data + anim table + paletteTag/tileTag depuis sprite-system.ts,
   *  alloue un OAM slot, configure-le, enregistre l'anim state, retourne spriteId. */
  CreateSpriteFromTemplate(templateName: string, x: number, y: number, subpriority: number = 0xFF): number {
    const tpl = (SPRITE_TEMPLATES as Record<string, { tileTag: string, paletteTag: string, oam: string, anims: string, affineAnims: string, callback: string }>)[templateName];
    if (!tpl) {
      console.warn(`[runtime] CreateSpriteFromTemplate: ${templateName} not found`);
      return -1;
    }
    // Cast via unknown : les OAM_DATAS extraits depuis le décomp ont des fields
    // partiels (= certains structs n'ont pas tous les fields, defaults omitted).
    // On lit les fields utilisés avec fallbacks au runtime.
    const oam = (OAM_DATAS as unknown as Record<string, { affineMode?: string, objMode?: string, bpp?: string, priority?: string, paletteNum?: string, _sizeWH?: readonly [number, number] }>)[tpl.oam];
    if (!oam) {
      console.warn(`[runtime] CreateSpriteFromTemplate ${templateName}: OamData ${tpl.oam} not found`);
      return -1;
    }
    const animTable = (SPRITE_ANIM_TABLES as Record<string, { anims: ReadonlyArray<string> }>)[tpl.anims];
    const firstAnimName = animTable?.anims[0];
    const firstAnim = firstAnimName ? (SPRITE_ANIMS as Record<string, { frames: ReadonlyArray<{ tileNum: number | string, duration: number }>, terminator: string, jumpTo?: number }>)[firstAnimName] : null;
    const initialTileOffset = firstAnim?.frames[0]?.tileNum !== undefined ? _resolveTileNum(firstAnim.frames[0].tileNum) : 0;

    const tileBase = this.spriteSheetTagToTileStart.get(tpl.tileTag) ?? 0;
    const palSlot = this.paletteTagToSlot.get(tpl.paletteTag) ?? 0;

    const [w, h] = oam._sizeWH ?? [8, 8];  // default 8x8 si extracteur incomplet
    const { shape, size } = oamShapeSizeFromWH(w, h);

    const affineModeNum = DecompRuntime.parseAffineMode(oam.affineMode);
    const result = this.CreateSpriteAtOam({
      tileId: tileBase + initialTileOffset,
      paletteBank: palSlot,
      x, y,
      shape, size,
      priority: parseInt(oam.priority ?? '0', 10) || 0,
      paletteMode: oam.bpp === 'ST_OAM_8BPP' ? 1 : 0,
      affineMode: affineModeNum,
      subpriority,
    });

    if (animTable && firstAnim && firstAnim.frames.length > 0) {
      this.spriteAnimStates.set(result.spriteId, {
        animTableName: tpl.anims,
        animIdx: 0,
        frameIdx: 0,
        framesRemaining: firstAnim.frames[0].duration,
        tileBase,
      });
    }
    // Store tileBase + objMode + centerToCornerVec + affineMode + affineAnims dans le sprite
    const sprite = this.gSprites.get(result.spriteId);
    if (sprite) {
      sprite.tileBase = tileBase;
      sprite.objMode = DecompRuntime.parseObjMode(oam.objMode);
      // 1:1 décomp src/sprite.c:CreateSpriteAt — appel à CalcCenterToCornerVec
      // après init du sprite, pour positionnement correct selon shape/size/affineMode.
      const ctcv = CalcCenterToCornerVec(shape, size, affineModeNum);
      sprite.centerToCornerVecX = ctcv.centerToCornerVecX;
      sprite.centerToCornerVecY = ctcv.centerToCornerVecY;
      sprite.affineMode = affineModeNum;
      // 1:1 décomp src/sprite.c:CreateSpriteAt — sprite->affineAnims = template->affineAnims
      // Si non-dummy (= sAffineAnims_X au lieu de gDummySpriteAffineAnimTable),
      // on enregistre le table name pour StartSpriteAffineAnim plus tard.
      if (tpl.affineAnims && tpl.affineAnims !== 'gDummySpriteAffineAnimTable') {
        sprite.affineAnimsTableName = tpl.affineAnims;
        // 1:1 décomp InitSpriteAffineAnim — si AFFINE_ON, allocate matrix + reset state
        if (affineModeNum & 1) {  // ST_OAM_AFFINE_ON_MASK
          sprite.affineAnimBeginning = true;  // sera processed au prochain tickFixed
        }
      }
    }

    // 1:1 décomp src/sprite.c:CreateSpriteAt — sprite->callback = template->callback
    const cbName = tpl.callback;
    if (cbName && cbName !== 'SpriteCallbackDummy' && cbName !== 'SpriteCallbackDummy2') {
      const cb = this.spriteCallbacks.get(cbName) ?? (globalThis as any)[cbName] as ((sprite: DecompSprite, rt: DecompRuntime) => void) | undefined;
      if (cb && sprite) {
        sprite.callback = (spr: DecompSprite) => cb(spr, this);
      }
    }

    if (RT_DEBUG) console.log(`[runtime] CreateSprite ${templateName} → spriteId ${result.spriteId} (tile ${tileBase + initialTileOffset}, bank ${palSlot}, ${w}×${h})`);
    return result.spriteId;
  }

  /** Change manuellement l'anim active d'un sprite (1:1 décomp StartSpriteAnim). */
  StartSpriteAnim(spriteId: number, animIdx: number): void {
    const state = this.spriteAnimStates.get(spriteId);
    if (!state) return;
    // Consulte d'abord le runtime registry (_extraAnimTables = tables
    // enregistrées dynamiquement, e.g. sBagSpriteAnimTable du sac) puis fallback
    // sur SPRITE_ANIM_TABLES auto-generated. Symétrique avec tickSpriteAnims
    // (ligne 1896-1897). Sans ça, StartSpriteAnim sur un sprite à anim table
    // dynamique = early-return silencieux (= sac reste sur frame 0/Closed).
    const animTable = this._extraAnimTables.get(state.animTableName)
      ?? (SPRITE_ANIM_TABLES as Record<string, { anims: ReadonlyArray<string> }>)[state.animTableName];
    if (!animTable || animIdx >= animTable.anims.length) return;
    const animName = animTable.anims[animIdx];
    const anim = this._extraAnims.get(animName)
      ?? (SPRITE_ANIMS as Record<string, { frames: ReadonlyArray<{ tileNum: number | string, duration: number }>, terminator: string, jumpTo?: number }>)[animName];
    if (!anim || anim.frames.length === 0) return;
    state.animIdx = animIdx;
    state.frameIdx = 0;
    state.framesRemaining = anim.frames[0].duration;
    const sprite = this.gSprites.get(spriteId);
    const tileNum = _resolveTileNum(anim.frames[0].tileNum);
    if (sprite) this.gba.oam[sprite.oamIndex].tileId = state.tileBase + tileNum;
  }

  /** Wrappers publics pour AnimateSprites/BuildOamBuffer global helpers
   *  (= appelés par les CB2 non-MainCB2, e.g. CB2_MainMenu, qui doivent
   *  tick les sprites eux-mêmes 1:1 décomp). */
  tickSpriteAnimsPublic(): void { this.tickSpriteAnims(); }
  tickAllAffineAnimsPublic(): void { tickAllAffineAnims(this); }
  runSpriteCallbacksPublic(): void { this.runSpriteCallbacks(); }
  syncSpritesToOamPublic(): void { this.syncSpritesToOam(); }

  /** Tick toutes les sprite anims actives — 1:1 décomp anim system frame counter.
   *  Consulte d'abord _extraAnimTables/_extraAnims (= runtime registry des
   *  modules comme object-event-graphics), fallback sur SPRITE_ANIM_TABLES/
   *  SPRITE_ANIMS auto-generated. Cette double lookup permet d'enregistrer
   *  des anims dynamiques sans modifier le auto-generated. */
  private tickSpriteAnims(): void {
    for (const [spriteId, state] of this.spriteAnimStates) {
      if (state.framesRemaining > 1) {
        state.framesRemaining--;
        continue;
      }
      const animTable = this._extraAnimTables.get(state.animTableName)
        ?? (SPRITE_ANIM_TABLES as Record<string, { anims: ReadonlyArray<string> }>)[state.animTableName];
      if (!animTable) { this.spriteAnimStates.delete(spriteId); continue; }
      const animName = animTable.anims[state.animIdx];
      const anim = this._extraAnims.get(animName)
        ?? (SPRITE_ANIMS as Record<string, { frames: ReadonlyArray<{ tileNum: number | string, duration: number, hFlip?: boolean, vFlip?: boolean }>, terminator: string, jumpTo?: number }>)[animName];
      if (!anim) { this.spriteAnimStates.delete(spriteId); continue; }

      state.frameIdx++;
      if (state.frameIdx >= anim.frames.length) {
        if (anim.terminator === 'JUMP') {
          state.frameIdx = anim.jumpTo ?? 0;
        } else {
          // END terminator : marque l'anim comme terminée mais GARDE le state
          // (= permet à StartSpriteAnim de re-entrer + permet sprite.animEnded
          // sentinel pour les callbacks). Tile reste sur la dernière frame.
          state.frameIdx = anim.frames.length - 1;
          state.framesRemaining = 1;  // attente perpétuelle
          const sprite = this.gSprites.get(spriteId);
          if (sprite) sprite.animEnded = true;
          continue;
        }
      }
      const frame = anim.frames[state.frameIdx];
      state.framesRemaining = frame.duration;
      const tileNum = _resolveTileNum(frame.tileNum);
      const sprite = this.gSprites.get(spriteId);
      if (sprite) {
        this.gba.oam[sprite.oamIndex].tileId = state.tileBase + tileNum;
        // Per-frame hFlip/vFlip (= OAM hardware mirror, e.g. EAST anim utilise
        // les tiles WEST avec hFlip=true). 1:1 décomp ANIMCMD_FRAME flags.
        if (typeof (frame as { hFlip?: boolean }).hFlip === 'boolean') {
          this.gba.oam[sprite.oamIndex].flipH = (frame as { hFlip?: boolean }).hFlip!;
        }
        if (typeof (frame as { vFlip?: boolean }).vFlip === 'boolean') {
          this.gba.oam[sprite.oamIndex].flipV = (frame as { vFlip?: boolean }).vFlip!;
        }
      }
    }
  }

  // ============================================================================
  // FIXED 60Hz TIMER : throttle update à 16.67ms exact (= GBA framerate)
  // ============================================================================

  /** Tick 60Hz fixed-step. Phaser update peut tourner à >60Hz selon refresh rate écran ;
   *  on accumule deltaMs et on ne process que des frames de 16.67ms.
   *
   *  Ordre d'exécution chaque frame (1:1 décomp `AgbMain` main loop) :
   *    1. gMain.callback2(rt)         — state machine scène courante (CB2_*)
   *    2. UpdatePaletteFade           — fade en cours
   *    3. tickSpriteAnims             — cycle tileNum + set animEnded
   *    4. tickAllAffineAnims          — ContinueAffineAnim chaque sprite
   *    5. runSpriteCallbacks          — chaque sprite.callback (SpriteCB_X)
   *    6. runTasks                    — les Task_X scene-level
   *    7. syncSpritesToOam            — propage sprite.x+x2 → oam.x etc.
   *    8. gMain.vblankCallback?.()    — stub VBlank effects (scanline, etc.)
   *    9. gIntroFrameCounter++
   */
  /** Devtools — paused = stop tickFixed entirely. stepBudget = nb frames à
   *  exécuter en mode pause (consommé par 1 par frame). speedMultiplier = 1.0
   *  par défaut, plus pour fast-forward, moins pour slow-mo. */
  public paused = false;
  public stepBudget = 0;
  public speedMultiplier = 1.0;

  tickFixed(deltaMs: number): number {
    let framesProcessed = 0;
    // Devtools step mode : exécute stepBudget frames immédiatement (= burst).
    if (this.paused) {
      let safety = 1000;
      while (this.stepBudget > 0 && safety-- > 0) {
        this.runOneFrame();
        framesProcessed++;
        this.stepBudget--;
      }
      return framesProcessed;
    }
    this.accumulatorMs += deltaMs * this.speedMultiplier;
    let safety = 5;
    while (this.accumulatorMs >= this.FRAME_TIME_MS && safety-- > 0) {
      this.accumulatorMs -= this.FRAME_TIME_MS;
      this.runOneFrame();
      framesProcessed++;
    }
    if (this.accumulatorMs > 10 * this.FRAME_TIME_MS) this.accumulatorMs = 0;
    return framesProcessed;
  }

  /** Une seule frame du main loop décomp, extraite pour pouvoir être appelée
   *  manuellement par devtools (step). */
  private runOneFrame(): void {
    // 0. Input : calcul du front montant (newKeys) + auto-repeat
    // 1:1 décomp src/main.c:ReadKeys (lines 243-268). newAndRepeatedKeys =
    // newKeys + repeat fire après gKeyRepeatStartDelay puis chaque
    // gKeyRepeatContinueDelay tant que la même touche est held.
    const heldKeys = this.gMain.heldKeys;
    const prevHeld = this.prevHeldKeys;
    const newKeys = heldKeys & ~prevHeld;
    this.gMain.newKeys = newKeys;
    this.gMain.newAndRepeatedKeys = newKeys;
    if (heldKeys !== 0 && heldKeys === prevHeld) {
      // Same key(s) held this frame as last → countdown for repeat fire.
      // Lecture via `gKeyRepeat.continueDelay` (mutable runtime, init via
      // InitKeys, modifiable par scenes — naming_screen=16, union_chat=20).
      this.gMain.keyRepeatCounter--;
      if (this.gMain.keyRepeatCounter <= 0) {
        this.gMain.newAndRepeatedKeys = heldKeys;
        this.gMain.keyRepeatCounter = gKeyRepeat.continueDelay;
      }
    } else {
      // No input or input changed → reset counter to start delay (mutable).
      this.gMain.keyRepeatCounter = gKeyRepeat.startDelay;
    }
    // 1:1 décomp src/main.c:273-281 ReadKeys L=A button remap.
    // Si optionsButtonMode == OPTIONS_BUTTON_MODE_L_EQUALS_A, presser L
    // déclenche aussi A. BUG note décomp : `newAndRepeatedKeys` n'est PAS
    // remappé (cf. main.c comment), seuls newKeys + heldKeys.
    // 1:1 décomp `gSaveBlock2Ptr->optionsButtonMode`. Foundation
    // `save-block-state` permet l'import direct (= élimine pattern globalThis).
    if (gSaveBlock2Ptr.optionsButtonMode === 2 /* OPTIONS_BUTTON_MODE_L_EQUALS_A */) {
      const L_BUTTON = 0x200;
      const A_BUTTON = 0x001;
      if (this.gMain.newKeys & L_BUTTON) this.gMain.newKeys |= A_BUTTON;
      if (this.gMain.heldKeys & L_BUTTON) this.gMain.heldKeys |= A_BUTTON;
    }
    this.prevHeldKeys = heldKeys;
    // 1. Main callback1 : pré-callback2 logic (= overworld object events tick,
    //    map scroll, etc.). 1:1 décomp src/main.c:181-188 CallCallbacks :
    //    `if (gMain.callback1) gMain.callback1(); if (gMain.callback2) gMain.callback2();`
    //    Set par SetMainCallback1 (CB1_Overworld pour Phase 4). NULL pour les
    //    scenes pré-overworld (intro/title/main_menu/birch/naming) → no-op.
    if (this.gMain.callback1) this.gMain.callback1(this);
    // 2. Main callback2 : dispatch scène courante (= ce que la décomp appelle
    //    via `gMain.callback2()`. La plupart des CB2 appellent à leur tour
    //    RunTasks/AnimateSprites/BuildOamBuffer/UpdatePaletteFade dans CET
    //    ORDRE — cf MainCB2_Intro src/intro.c:1042-1052).
    if (this.gMain.callback2) this.gMain.callback2(this);
    // 1:1 décomp `PlayTimeCounter_Update()` (main.c:181, AgbMain VBlank loop).
    // Audit session 126 (post-test user) : avant ce call, playTimeVBlanks restait
    // à 0 → DUREE JEU "0:00" indéfiniment. Maintenant tick chaque frame logique
    // → playTimeSeconds incrémente toutes les 60 frames (= 1 sec @ 60Hz).
    // Le state RUNNING est set par PlayTimeCounter_Start() au boot overworld.
    // Lookup via globalThis pour éviter cycle import decomp-runtime ↔ save-system.
    const playTimeUpdate = (globalThis as Record<string, unknown>).PlayTimeCounter_Update as
      (() => void) | undefined;
    playTimeUpdate?.();
    // 1:1 décomp : seuls les `MainCB2*` callbacks (= main loops de scène)
    // appellent RunTasks + AnimateSprites + BuildOamBuffer (cf intro.c:1042).
    // Les CB2 de transition (CB2_GoTo*) et d'init (CB2_Init*) ne tournent que
    // leur propre logique (UpdatePaletteFade + state machine). Sans cette
    // distinction, les Tasks de la scène sortante continuent de tourner
    // pendant les transitions → re-trigger BeginNormalPaletteFade en boucle,
    // tasks créées par CB2_Init* qui démarrent avant SetMainCallback2(MainCB2),
    // etc.
    // Notre architecture : `gMain.callback2.name` indique si runTasks() doit
    // tourner (= MainCB2* uniquement). UpdatePaletteFade reste appelé toujours
    // (= cf bas du frame).
    const cbName = this.gMain.callback2?.name ?? '';
    const isMainCB2 = cbName.startsWith('MainCB2');
    if (isMainCB2) {
      // ─── 1:1 décomp MainCB2_Intro order ───────────────────────────────────
      // 2. RunTasks() — Tasks AVANT tout sprite tick. Critique : la création
      //    d'un sprite + StartSpriteAffineAnim DOIT précéder l'AnimateSprite
      //    de la même frame, sinon la matrix OAM reste avec sa valeur stale
      //    (= 1-frame flicker du logo Game Freak avec scale/rot random).
      this.runTasks();
      // 3. AnimateSprites() — partie 1 : sprite callback (= notre runSpriteCallbacks).
      //    partie 2 : AnimateSprite qui advance les anims + applique affine
      //    matrix dans gOamMatrices (= notre tickSpriteAnims + tickAllAffineAnims).
      this.runSpriteCallbacks();
      this.tickSpriteAnims();
      tickAllAffineAnims(this);
    }
    // RunTextPrinters render text into window pixel buffers,
    // then flushDirtyWindows copies modified buffers to VRAM.
    const globalRunTextPrinters = (globalThis as any).RunTextPrinters;
    if (typeof globalRunTextPrinters === 'function') globalRunTextPrinters();
    const globalFlushDirty = (globalThis as any).flushDirtyWindows;
    if (typeof globalFlushDirty === 'function') globalFlushDirty();
    // 4. BuildOamBuffer() — copie gOamMatrices + sprite state → OAM.
    this.syncSpritesToOam();
    // 4b. Subsprite OAM sync — naming screen, summary screen, etc. install
    //     a globalThis._syncSubspriteOam hook that re-pins subsprite child
    //     OAMs + re-hides primary OAM after syncSpritesToOam clobbered them.
    //     Foundation pattern : any scene with multi-OAM-per-logical-sprite
    //     registers this hook (= 1:1 décomp `AddSubspritesToOamBuffer` path
    //     in src/sprite.c:1683 which runs as part of BuildOamBuffer).
    const globalSyncSubsprite = (globalThis as any)._syncSubspriteOam;
    if (typeof globalSyncSubsprite === 'function') globalSyncSubsprite();
    // 5. UpdatePaletteFade() — APRÈS le rendu sprite (ordre décomp).
    // Bug session 89 fix : avant on appelait UpdatePaletteFade ICI inconditionnel
    // ET via CB2_MainMenu body → fade advance 2× par frame → flash dure 8 frames
    // au lieu de 16 (= 1:1 décomp). User feedback "flash trop court".
    //
    // 1:1 décomp : UpdatePaletteFade est appelé UNE FOIS par frame, par le
    // CB2 actif. CB2_MainMenu/MainCB2_Intro/etc. l'appellent dans leur body.
    // Ici on l'appelle UNIQUEMENT si le CB2 actif ne l'a pas déjà fait — détection
    // via flag tracking dans UpdatePaletteFade lui-même (= idempotent par frame).
    if (!this._paletteFadeCalledThisFrame) {
      this.UpdatePaletteFade();
    }
    this._paletteFadeCalledThisFrame = false;  // reset for next frame
    this._runTasksCalledThisFrame = false;     // reset for next frame
    // VBlank callbacks (= VBlankCB_Intro etc) : ScanlineEffect tick + TransferPlttBuffer.
    // 1:1 décomp : VBlankCB de chaque scène call TransferPlttBuffer. SI vblankCallback
    // est NULL (= scene init via `SetVBlankCallback(NULL)`), AUCUN transfert ne
    // tourne → PLTT register reste figé. C'est le mécanisme qui prévient le flash
    // pendant les CB2 init (= state 0-10 LoadPalette modifie gPlttBufferFaded mais
    // PLTT reste BLACK depuis le DmaClear16(PLTT) au state 1, jusqu'à ce que
    // SetVBlankCallback(VBlankCB) soit appelé au state 11).
    if (this.gMain.vblankCallback) {
      this.gMain.vblankCallback();
      // Simulate VBlankCB → TransferPlttBuffer (= chaque scène le fait, on factor ici).
      if (!this.gPaletteFade.bufferTransferDisabled) {
        this.gPlttBufferFaded.flushTo();
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scanlineTick = (globalThis as any).__scanlineEffectTick;
    if (typeof scanlineTick === 'function') scanlineTick();
    this.gIntroFrameCounter++;
    // Devtools : auto-pause condition poll (= dev.pauseAt). Cheap noop si non-armé.
    // Posé sur globalThis par engine-devtools.ts pour fonctionner partout.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enginePauseCb = (globalThis as any).__enginePauseCondition;
    if (typeof enginePauseCb === 'function') enginePauseCb();
  }

  /** Run tous les sprite callbacks (1:1 décomp main loop sprite update). */
  private runSpriteCallbacks(): void {
    const snapshot = Array.from(this.gSprites.values());
    for (const sprite of snapshot) {
      if (this.gSprites.has(sprite.spriteId) && sprite.inUse && sprite.callback) {
        sprite.callback(sprite, this);
      }
    }
  }

  /** Sync les fields sprite → gba.oam. 1:1 décomp src/sprite.c:BuildOamBuffer
   *  + UpdateOamCoords (lines 339-359) :
   *    oam.x = sprite.x + sprite.x2 + sprite.centerToCornerVecX
   *    oam.y = sprite.y + sprite.y2 + sprite.centerToCornerVecY
   *  centerToCornerVec = -w/2, -h/2 (×2 si AFFINE_DOUBLE) → décale top-left
   *  pour que (sprite.x, sprite.y) soit le centre du sprite affiché.
   *  Sans ce décalage, les sprites apparaissent décalés à droite + bas.
   *
   *  Session 90 audit V2 fix : ALSO sync sprite.affineMode → oam.affineMode.
   *  Avant : seul oam.affineParamIndex était synced. Si une callback (e.g.
   *  SetUpForReleaseAffineAnim) modifie sprite.affineMode mais pas oam.affineMode,
   *  ou inversement, on a deux sources de vérité divergentes. Le décomp utilise
   *  oam.* comme source unique (= gSprites[i].oam.affineMode). Notre split
   *  sprite.affineMode / oam.affineMode → propage sprite → oam ICI.
   *
   *  Nuance importante : les auto-callbacks transcrits écrivent à
   *  `gSprites[id].oam.affineMode = X` (= directement sur l'OAM). Notre runtime
   *  les conserve sur `oam.affineMode` côté gba. Pour respecter LES DEUX call
   *  patterns, on prend le OR : si l'un des deux est non-zero, on prend ça. */
  private syncSpritesToOam(): void {
    for (const sprite of this.gSprites.values()) {
      if (!sprite.inUse) continue;
      const oam = this.gba.oam[sprite.oamIndex];
      // Keep signed coordinates (no & mask) so sprites with negative oam.y / oam.x
      // are correctly handled by the renderer (e.g. water drops starting at y=-14
      // with centerToCornerVecY=-32 => oam.y=-46, which the GBA renders partially
      // on scanlines 0-17). The real GBA stores oam.x/y as signed 9-bit / 8-bit.
      oam.x = sprite.x + sprite.x2 + sprite.centerToCornerVecX;
      oam.y = sprite.y + sprite.y2 + sprite.centerToCornerVecY;
      oam.visible = !sprite.invisible;
      oam.flipH = sprite.hFlip;
      oam.flipV = sprite.vFlip;
      oam.affineParamIndex = sprite.matrixNum;
      oam.objMode = sprite.objMode as 0 | 1 | 2;
      // 1:1 décomp BuildSpritePriorities (sprite.c:361) — sync subpriority.
      oam.subpriority = sprite.subpriority;
      // Audit V2 : merge sprite.affineMode + oam.affineMode (= last writer wins
      // pour OFF-state explicit reset, but if either is set NORMAL/DOUBLE, we
      // keep the affine mode active — matches decomp behavior where ANY write
      // to gSprites[i].oam.affineMode is the new state).
      const merged = (sprite.affineMode | (oam.affineMode ?? 0)) as 0 | 1 | 2 | 3;
      // Détection : si sprite.affineMode a été explicitement set OFF (=0) après
      // avoir été NORMAL, on doit propager OFF. Heuristique : si sprite.affineMode==0
      // ET oam.affineMode!=0 ET sprite.matrixNum==0 (= explicit teardown via
      // FreeOamMatrix → matrixNum=0), alors propager OFF.
      if (sprite.affineMode === 0 && sprite.matrixNum === 0) {
        oam.affineMode = 0;
      } else {
        oam.affineMode = merged;
      }
    }
  }

  /** 1:1 décomp DestroySprite(sprite) — invisible OAM + retire des maps. */
  DestroySprite(spriteId: number): void {
    const sprite = this.gSprites.get(spriteId);
    if (!sprite) return;
    this.gba.oam[sprite.oamIndex].visible = false;
    sprite.invisible = true;
    sprite.inUse = false;
    sprite.callback = null;
    // NOTE: ne PAS this.gSprites.delete(spriteId) — les sprites enfants
    // (e.g. water drop halves) lisent encore gSprites[parentId].data[7].
    // Le vrai décomp garde le slot jusqu'à réallocation.
    this.spriteAnimStates.delete(spriteId);
  }

  /** Reset additionnel pour les nouveaux maps (sprite-system). */
  resetSpriteSystem(): void {
    this.paletteTagToSlot.clear();
    this.spriteSheetTagToTileStart.clear();
    this.spriteSheetTagToByteSize.clear();
    this.freedSpriteTileRanges.length = 0;
    this.nextObjPalSlot = 0;
    this.nextSpriteSheetByteOffset = 0;
    this.spriteAnimStates.clear();
    this.accumulatorMs = 0;
  }
}
