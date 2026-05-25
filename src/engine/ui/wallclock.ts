/**
 * wallclock.ts — Port 1:1 décomp `src/wallclock.c` (1101 lignes).
 *
 * Pattern référence : `trainer-card-screen.ts` (= CB2 swap + BG layers via
 * runtime décomp + sprite affine via SetOamMatrix + state machine tasks).
 *
 * Source de vérité (décomp) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/wallclock.c` (FR locale)
 *   - `D:/Projet 1/decomps/pokeemeraude/graphics/wallclock/` (assets PNG/PAL/BIN)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/trig.c` (Sin2/Cos2 Q4.12)
 *
 * Modes (= entry points 1:1 décomp) :
 *   - SET  : `StartWallClock` (= player chooses initial time at game start)
 *   - VIEW : `Special_ViewWallClock` (= player checks current clock on 2F wall)
 *
 * State machine (= 10 tasks, 1:1 décomp) :
 *   SET  : WaitFadeIn → HandleInput → AskConfirm → HandleConfirmInput
 *                 → Confirmed (= `RtcInitLocalTimeOffset`) → Exit
 *   VIEW : WaitFadeIn → HandleInput (= read RTC + wait A/B) → FadeOut → Exit
 *
 * Sprite affine 1:1 :
 *   - MinuteHand 64×64 (matrixNum=0)
 *   - HourHand 64×64 (matrixNum=1)
 *   - AM indicator 16×16
 *   - PM indicator 16×16
 *   - Rotation via `SetOamMatrix(rt.gba, matrixNum, cos, sin, -sin, cos)` chaque
 *     frame avec sin/cos = Sin2/Cos2(angle) / 16 (= Q4.12 → Q8.8 scaling).
 *   - Pivot offset via `sClockHandCoords[angle]` (= 360 entries précomputed).
 *
 * Wiring (= replace `wallclock-flow.ts` HTML overlay) :
 *   - `script-opcodes.ts:special StartWallClock` → `OpenWallClock('SET')`
 *   - `script-opcodes.ts:special Special_ViewWallClock` → `OpenWallClock('VIEW')`
 *   - `OpenWallClock` save `gMain.callback2` → `gMain.savedCallback`, puis
 *     `SetMainCallback2(CB2_InitWallClock)`.
 *   - `Task_*_Exit` restore `gMain.savedCallback` → retour OW.
 */

import {
  ShowBg, HideBg,
  InitWindows, RemoveWindow, FillWindowPixelBuffer, PutWindowTilemap,
  CopyWindowToVram, ClearWindowTilemap,
  type WindowTemplate,
} from '../gba-window-system';
import {
  PlaySE, LoadPalette, getRuntime, OBJ_PLTT_ID,
  ResetPaletteFade, ResetTasks, gMain, BG_PLTT_ID,
} from '../decomp-globals';
import { ResetSpriteData, GetOverworldTextboxPalettePtr } from '../decomp-bridge';
import { LoadUserWindowBorderGfx, preloadTextWindowFrames } from '../gba-text-window';
import { loadIndexedPngStrict } from '../gba/png-loader';
import { AddTextPrinterParameterized3 } from '../gba-text-system';
import {
  CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose,
} from '../gba-menu-system';
import { DrawStdFrameWithCustomTileAndPalette, ClearStdWindowAndFrame } from '../gba-window-system';
import { getString } from '../gba-strings';
// gSaveBlock2Ptr supprimé (= remplacé par VAR_0x8004 1:1 strict décomp).
import { FEMALE } from '../decomp-globals';
import { LoadSpriteSheet, LoadSpritePalette } from '../sprite';
import { FlagSet, VarGet } from '../script/script-vars';
import { RtcCalcLocalTime, gLocalTime, RtcInitLocalTimeOffset } from '../rtc';
import { loadGbaPal, loadTilemapBin, loadTileBin } from '../gba/png-loader';
import { SetOamMatrix } from '../decomp-helpers';
import { CB2_ReturnToFieldLocal_Manual } from './option-menu-return';
import type { DecompTask, DecompSprite, DecompRuntime } from '../decomp-runtime';

// ─── Constants 1:1 décomp (= wallclock.c:54-72, wallclock-data.ts) ─────────

/** Period (= wallclock.c:58-61). */
const PERIOD_AM = 0;
const PERIOD_PM = 1;
/** Move direction (= wallclock.c:63-67). */
const MOVE_NONE = 0;
const MOVE_BACKWARD = 1;
const MOVE_FORWARD = 2;
/** Window IDs (= wallclock.c:69-72). */
const WIN_MSG = 0;
const WIN_BUTTON_LABEL = 1;
/** Joy keys (= 1:1 gba/io_reg.h). Import depuis decomp-data (= A8 audit). */
import {
  A_BUTTON, B_BUTTON, DPAD_LEFT, DPAD_RIGHT,
} from '../decomp-data/include/gba/io_reg-data';
/** Font / text colors. */
const FONT_NORMAL = 1;
const STD_FRAME_TILE = 0x250;
const STD_FRAME_PAL = 13;

/** BG layer config 1:1 décomp `sBgTemplates` (wallclock.c:111-131) :
 *    BG0 charBase=2 mapBase=31 priority=0  → text windows
 *    BG2 charBase=1 mapBase=8  priority=1  → secondary tilemap (= label window bg)
 *    BG3 charBase=0 mapBase=7  priority=2  → wallclock background (= clock face) */
const BG_TEXT_CHAR = 2;        // BG0 char base (= text windows tiles)
const BG_TEXT_MAP = 31;        // BG0 map base
const BG_LABEL_CHAR = 1;       // BG2 char base (= label window bg tiles)
const BG_LABEL_MAP = 8;        // BG2 map base
const BG_CLOCK_CHAR = 0;       // BG3 char base (= clock face tiles from clock.png)
const BG_CLOCK_MAP = 7;        // BG3 map base (= clock_start.bin or clock_view.bin)

/** 1:1 STRICT décomp `LoadCompressedSpriteSheet(GFXTAG_WALL_CLOCK_HAND=0x1000)` +
 *  `LoadSpritePalette(PALTAG_WALL_CLOCK_HAND)`. Tag system honore
 *  gReservedSpriteTileCount → alloué STRICTEMENT après player tiles. */
const TAG_WALL_CLOCK_HAND_GFX = 'WALL_CLOCK_HAND_GFX';
const TAG_WALL_CLOCK_HAND_PAL = 'WALL_CLOCK_HAND_PAL';
/** Module-level vars : tileStart + palSlot dynamiquement alloués par LoadSpriteSheet/
 *  LoadSpritePalette. Avant : offset 0 hardcoded → écrasait player tiles. */
let _wallClockHandTileStart = -1;
let _wallClockHandPalSlot = -1;

/** Hand sprite frame layout (= hand.png 64×144 4bpp) :
 *  - Tiles 0..63   = minute hand (64×64 = 8×8 tiles)
 *  - Tiles 64..127 = hour hand (64×64)
 *  - Tiles 128..131, 136..139 = AM indicator (16×16 = 2×2 tiles, row-major)
 *  - Tiles 132..135, 140..143 = PM indicator (16×16) */
const TILE_MINUTE_HAND_START = 0;
const TILE_HOUR_HAND_START = 64;
const TILE_AM_INDICATOR_START = 128;
const TILE_PM_INDICATOR_START = 132;

// ─── sClockHandCoords table 1:1 décomp (wallclock.c:257-619) ───────────────
// 360 entries (= 1 par degré). Mapping angle → sprite pivot offset [s8, s8].
// Extracted via scripts/extract one-time from decomp source.
const sClockHandCoords: ReadonlyArray<readonly [number, number]> = [
  [0, -24], [1, -25], [1, -25], [2, -25], [2, -25], [2, -25], [3, -24], [3, -25],
  [4, -25], [4, -25], [4, -25], [5, -25], [5, -25], [6, -24], [6, -24], [6, -24],
  [7, -24], [7, -24], [7, -24], [8, -24], [8, -24], [9, -24], [9, -24], [10, -23],
  [10, -23], [11, -22], [11, -22], [11, -22], [12, -22], [12, -21], [13, -21], [13, -21],
  [13, -21], [14, -21], [14, -21], [14, -20], [14, -20], [15, -20], [15, -19], [16, -19],
  [16, -19], [16, -19], [16, -18], [16, -18], [17, -18], [17, -17], [17, -17], [18, -17],
  [18, -17], [18, -16], [18, -16], [19, -16], [19, -15], [19, -15], [20, -15], [20, -14],
  [20, -14], [20, -13], [20, -13], [21, -13], [21, -13], [21, -12], [22, -12], [22, -12],
  [22, -11], [22, -11], [22, -10], [23, -10], [23, -9], [23, -9], [23, -9], [23, -9],
  [23, -8], [23, -8], [23, -7], [23, -7], [23, -6], [24, -6], [24, -6], [25, -5],
  [25, -5], [24, -4], [25, -4], [24, -3], [25, -3], [25, -3], [25, -2], [25, -2],
  [24, -1], [25, -1], [24, 0], [24, 0], [24, 0], [24, 1], [24, 1], [25, 2],
  [24, 2], [25, 2], [24, 3], [24, 3], [25, 4], [24, 4], [24, 5], [24, 5],
  [24, 5], [24, 6], [23, 6], [23, 6], [23, 7], [23, 8], [23, 8], [23, 8],
  [23, 9], [23, 9], [23, 10], [22, 10], [22, 10], [22, 11], [22, 11], [22, 11],
  [22, 12], [21, 12], [21, 12], [21, 13], [20, 13], [20, 13], [19, 13], [19, 13],
  [19, 14], [19, 14], [19, 15], [19, 15], [18, 15], [18, 16], [17, 16], [17, 16],
  [17, 17], [17, 17], [16, 17], [16, 18], [16, 18], [15, 18], [14, 18], [15, 19],
  [14, 19], [14, 19], [13, 19], [13, 20], [13, 20], [13, 20], [12, 20], [12, 20],
  [12, 21], [11, 21], [11, 21], [11, 21], [10, 21], [10, 22], [10, 22], [9, 22],
  [9, 22], [8, 22], [7, 22], [7, 23], [7, 23], [6, 23], [6, 23], [5, 23],
  [5, 23], [5, 24], [4, 24], [4, 24], [4, 24], [3, 24], [2, 24], [2, 24],
  [1, 24], [1, 24], [0, 24], [0, 24], [-1, 23], [0, 24], [0, 24], [-1, 24],
  [-1, 24], [-2, 24], [-2, 24], [-3, 24], [-3, 24], [-4, 24], [-4, 24], [-5, 24],
  [-5, 23], [-5, 23], [-6, 23], [-6, 23], [-7, 23], [-7, 23], [-7, 23], [-8, 23],
  [-8, 22], [-9, 22], [-9, 22], [-10, 22], [-10, 22], [-10, 21], [-11, 21], [-11, 21],
  [-11, 21], [-11, 20], [-12, 20], [-12, 20], [-13, 20], [-13, 20], [-13, 19], [-14, 19],
  [-14, 19], [-14, 19], [-14, 18], [-15, 18], [-15, 18], [-15, 17], [-16, 17], [-16, 17],
  [-17, 17], [-17, 16], [-17, 16], [-18, 16], [-17, 15], [-18, 15], [-18, 15], [-19, 15],
  [-19, 14], [-19, 14], [-19, 13], [-19, 13], [-20, 13], [-20, 12], [-20, 12], [-21, 12],
  [-21, 12], [-21, 11], [-21, 11], [-21, 10], [-21, 10], [-21, 9], [-22, 9], [-22, 9],
  [-22, 8], [-22, 8], [-22, 7], [-23, 7], [-23, 7], [-23, 6], [-23, 6], [-23, 5],
  [-24, 5], [-23, 4], [-23, 4], [-24, 4], [-24, 4], [-24, 3], [-24, 3], [-24, 2],
  [-24, 2], [-24, 1], [-24, 1], [-24, 1], [-24, 0], [-25, 0], [-24, -1], [-25, -1],
  [-24, -1], [-24, -2], [-24, -2], [-24, -3], [-24, -3], [-24, -4], [-24, -4], [-24, -4],
  [-24, -5], [-24, -5], [-24, -6], [-24, -6], [-23, -6], [-23, -7], [-23, -7], [-23, -8],
  [-23, -8], [-23, -9], [-23, -9], [-22, -9], [-22, -9], [-22, -10], [-22, -10], [-21, -10],
  [-21, -11], [-22, -11], [-22, -12], [-21, -12], [-21, -13], [-21, -13], [-20, -13], [-21, -14],
  [-20, -14], [-20, -14], [-19, -14], [-19, -15], [-19, -15], [-18, -16], [-18, -16], [-18, -16],
  [-18, -17], [-18, -17], [-17, -17], [-17, -18], [-17, -18], [-16, -18], [-16, -18], [-16, -19],
  [-16, -19], [-15, -19], [-15, -19], [-15, -20], [-14, -20], [-14, -20], [-14, -21], [-13, -21],
  [-13, -21], [-13, -21], [-12, -21], [-12, -22], [-11, -22], [-11, -22], [-11, -22], [-10, -22],
  [-10, -22], [-9, -22], [-9, -23], [-9, -23], [-8, -23], [-8, -23], [-7, -23], [-7, -23],
  [-7, -24], [-6, -24], [-6, -24], [-5, -24], [-5, -24], [-4, -24], [-4, -24], [-4, -24],
  [-4, -25], [-3, -25], [-2, -25], [-2, -24], [-2, -24], [-1, -25], [-1, -25], [0, -25],
];

// ─── Trig helpers (= Sin2/Cos2 décomp Q4.12 fixed-point) ────────────────────

/** 1:1 décomp `s16 Sin2(u16 angle)` (trig.c:529).
 *  Returns sin(angle°) as Q4.12 fixed-point (= multiplied by 4096).
 *  Range : -4096..4096. */
function Sin2(angle: number): number {
  // Use Math.sin instead of gSineDegreeTable (= same result, less dependencies).
  return Math.round(Math.sin((angle * Math.PI) / 180) * 4096);
}

/** 1:1 décomp `s16 Cos2(u16 angle)` (trig.c:535) : returns sin(angle+90°). */
function Cos2(angle: number): number {
  return Math.round(Math.cos((angle * Math.PI) / 180) * 4096);
}

// ─── State module-level (= encapsulates gTasks[taskId].data fields) ─────────

type Mode = 'SET' | 'VIEW';

interface WallClockAssets {
  clockTiles: Uint8Array;        // clock.png raw 4bpp tiles (= BG3 tile data)
  startTilemap: Uint16Array;     // clock_start.bin (= mode SET BG3 layout)
  viewTilemap: Uint16Array;      // clock_view.bin (= mode VIEW BG3 layout)
  handTiles: Uint8Array;         // hand.png raw 4bpp (= OBJ VRAM)
  malePalette: Uint16Array;      // male.pal 16c (= BG palette 0)
  femalePalette: Uint16Array;    // female.pal 16c
  textPromptPal: Uint16Array;    // text_prompt.pal 4c (= BG palette 12 for "Confirm"/"Cancel")
  messageBoxPalette: Uint16Array; // gMessageBox_Pal 16c (= BG palette 14 for WIN_MSG)
}

/** Module-level state. Reset on each OpenWallClock call.
 *  data fields map to wallclock.c task->data[N] :
 *    tMinuteHandAngle = data[0]   tHourHandAngle = data[1]
 *    tHours = data[2]             tMinutes = data[3]
 *    tMoveDir = data[4]           tPeriod = data[5]
 *    tMoveSpeed = data[6] */
interface WallClockState {
  mode: Mode;
  taskId: number;
  spriteIds: { minute: number; hour: number; am: number; pm: number };
  assets: WallClockAssets | null;
  // Task data fields (= gTasks[taskId].data[*])
  minuteHandAngle: number;
  hourHandAngle: number;
  hours: number;
  minutes: number;
  moveDir: number;
  period: number;
  moveSpeed: number;
  // Sprite data fields (= gSprites[id].data[1] for AM/PM indicators)
  amAngle: number;
  pmAngle: number;
  // Phase tracking
  phase: 'idle' | 'init' | 'open' | 'closing';
  initState: number;
  graphicsLoaded: boolean;
  graphicsLoading: boolean;
  // C5 fix : snapshot du gSprites size AVANT open pour destroy au close TOUS
  // les sprites créés par le UI WallClock (= pas juste les 4 tracked dans
  // spriteIds, mais aussi tous les sprites créés indirectement via task
  // anim handlers etc.).
  preOpenSpriteIds: number[];
}

const _state: WallClockState = {
  mode: 'VIEW',
  taskId: -1,
  spriteIds: { minute: -1, hour: -1, am: -1, pm: -1 },
  assets: null,
  minuteHandAngle: 0,
  hourHandAngle: 0,
  hours: 10,
  minutes: 0,
  moveDir: MOVE_NONE,
  period: PERIOD_AM,
  moveSpeed: 0,
  amAngle: 0,
  pmAngle: 0,
  phase: 'idle',
  initState: 0,
  graphicsLoaded: false,
  graphicsLoading: false,
  preOpenSpriteIds: [],
};

let _assetsCache: WallClockAssets | null = null;
let _assetsLoading: Promise<WallClockAssets> | null = null;
let _msgWid = -1;
let _labelWid = -1;

// ─── Helpers 1:1 décomp (wallclock.c:902-1019) ──────────────────────────────

/** 1:1 décomp `static u8 CalcMinHandDelta(u16 speed)` (wallclock.c:902-912). */
function CalcMinHandDelta(speed: number): number {
  if (speed > 60) return 6;
  if (speed > 30) return 3;
  if (speed > 10) return 2;
  return 1;
}

/** 1:1 décomp `static u16 CalcNewMinHandAngle(u16 angle, u8 direction, u8 speed)`
 *  (wallclock.c:914-933). */
function CalcNewMinHandAngle(angle: number, direction: number, speed: number): number {
  const delta = CalcMinHandDelta(speed);
  switch (direction) {
    case MOVE_BACKWARD:
      if (angle) angle -= delta;
      else angle = 360 - delta;
      break;
    case MOVE_FORWARD:
      if (angle < 360 - delta) angle += delta;
      else angle = 0;
      break;
  }
  return angle;
}

/** 1:1 décomp `static bool32 AdvanceClock(u8 taskId, u8 direction)`
 *  (wallclock.c:935-975). Advance hours/minutes + update period on hour wrap. */
function AdvanceClock(direction: number): boolean {
  switch (direction) {
    case MOVE_BACKWARD:
      if (_state.minutes > 0) {
        _state.minutes--;
      } else {
        _state.minutes = 59;
        if (_state.hours > 0) _state.hours--;
        else _state.hours = 23;
        UpdateClockPeriod(direction);
      }
      break;
    case MOVE_FORWARD:
      if (_state.minutes < 59) {
        _state.minutes++;
      } else {
        _state.minutes = 0;
        if (_state.hours < 23) _state.hours++;
        else _state.hours = 0;
        UpdateClockPeriod(direction);
      }
      break;
  }
  return false;
}

/** 1:1 décomp `static void UpdateClockPeriod(u8 taskId, u8 direction)`
 *  (wallclock.c:977-1005). Switch AM/PM at hour 0/12 boundaries. */
function UpdateClockPeriod(direction: number): void {
  const hours = _state.hours;
  switch (direction) {
    case MOVE_BACKWARD:
      switch (hours) {
        case 11: _state.period = PERIOD_AM; break;
        case 23: _state.period = PERIOD_PM; break;
      }
      break;
    case MOVE_FORWARD:
      switch (hours) {
        case 0:  _state.period = PERIOD_AM; break;
        case 12: _state.period = PERIOD_PM; break;
      }
      break;
  }
}

/** 1:1 décomp `static void InitClockWithRtc(u8 taskId)` (wallclock.c:1007-1019).
 *  Init hours/minutes/angles/period from current RTC local time. */
function InitClockWithRtc(): void {
  RtcCalcLocalTime();
  _state.hours = gLocalTime.hours;
  _state.minutes = gLocalTime.minutes;
  _state.minuteHandAngle = _state.minutes * 6;
  _state.hourHandAngle = (_state.hours % 12) * 30 + Math.floor(_state.minutes / 10) * 5;
  _state.period = gLocalTime.hours < 12 ? PERIOD_AM : PERIOD_PM;
}

// ─── Asset loader ───────────────────────────────────────────────────────────

/** Async fetch tous les assets nécessaires. Cache via `_assetsCache` singleton.
 *
 *  Pattern 1:1 décomp : `loadTileBin` charge le `.4bpp.bin` pré-extrait par
 *  `scripts/extract-all-tile-bins.mjs` (= 1:1 reproduction du gbagfx pipeline
 *  qui inverse les pixel values pour grayscale PNGs colorType=0 → white bg
 *  devient idx 0 transparent). Cf. extract-png-indexed-tiles.mjs:84 :
 *    if (colorType === 0) invertColors = true; → idx = 15 - rawValue;
 *
 *  Pour hand.png (= 4-bit grayscale sans PLTE), le .4bpp.bin a déjà les
 *  indices correctement inversés. Pour clock.png (= 4-bit indexed avec PLTE),
 *  les indices sont préservés via raw IDAT parse. */
async function _loadAssets(): Promise<WallClockAssets> {
  if (_assetsCache) return _assetsCache;
  if (_assetsLoading) return _assetsLoading;
  _assetsLoading = (async () => {
    const [clockTiles, handTiles, startTmap, viewTmap, malePal, femalePal, textPromptPal, messageBoxPng] = await Promise.all([
      loadTileBin('/decomp/em/wallclock/clock.png', 4),
      loadTileBin('/decomp/em/wallclock/hand.png', 4),
      loadTilemapBin('/decomp/em/wallclock/clock_start.bin'),
      loadTilemapBin('/decomp/em/wallclock/clock_view.bin'),
      loadGbaPal('/decomp/em/wallclock/male.pal'),
      loadGbaPal('/decomp/em/wallclock/female.pal'),
      loadGbaPal('/decomp/em/wallclock/text_prompt.pal'),
      // gMessageBox_Pal direct load (= palette 14 textbox for WIN_MSG text
      // rendering). On charge directement le PNG palette pour bypass
      // `GetOverworldTextboxPalettePtr()` qui dépend de `assetCache` module
      // state (= HMR-fragile : multiple instances depending sur dynamic vs
      // static import). Plus robuste = charger nous-mêmes.
      loadIndexedPngStrict('/decomp/em/text_window/message_box.png', 4),
      // Side-effect : prefill assetCache for `LoadUserWindowBorderGfx` (= it
      // reads `gMessageBox_Gfx` from assetCache to draw the std frame border
      // tiles). On garde le préload pour compat.
      preloadTextWindowFrames(),
    ]);
    _assetsCache = {
      clockTiles,
      handTiles,
      startTilemap: startTmap,
      viewTilemap: viewTmap,
      malePalette: malePal,
      femalePalette: femalePal,
      textPromptPal: textPromptPal,
      messageBoxPalette: messageBoxPng.palette,
    };
    return _assetsCache;
  })();
  return _assetsLoading;
}

// ─── BG layers init 1:1 décomp `InitBgsFromTemplates` + `LoadWallClockGraphics` ─

/** 1:1 décomp `LoadWallClockGraphics` (wallclock.c:628-669) :
 *    - Clear DISPCNT/BGnCNT/PLTT/OAM/VRAM
 *    - LZ77UnCompVram(gWallClock_Gfx, VRAM) → load BG tiles into VRAM
 *    - LoadPalette(male/female_Pal, BG_PLTT_ID(0))
 *    - LoadPalette(text_prompt_Pal, BG_PLTT_ID(12))
 *    - InitBgsFromTemplates + InitWindows
 *    - LoadCompressedSpriteSheet(sSpriteSheet_ClockHand) → OBJ VRAM
 *    - LoadSpritePalettes(sSpritePalettes_Clock) → OBJ palette */
function _loadWallClockGraphics(rt: DecompRuntime): void {
  // ResetVramOamAndBgCntRegs equivalent
  rt.SetGpuReg(0x00, 0);  // DISPCNT = 0
  rt.SetGpuReg(0x08, 0); rt.SetGpuReg(0x0A, 0); rt.SetGpuReg(0x0C, 0); rt.SetGpuReg(0x0E, 0);
  rt.gba.vram.fill(0);
  for (let i = 0; i < rt.gba.oam.length; i++) {
    const oam = rt.gba.oam[i];
    oam.visible = false; oam.x = 0; oam.y = 0; oam.tileId = 0;
    oam.paletteBank = 0; oam.affineMode = 0;
  }
  for (let i = 0; i < 512; i++) {
    rt.gPlttBufferUnfaded.set(i, 0);
    rt.gPlttBufferFaded.set(i, 0);
  }
  for (let i = 0; i < 256; i++) rt.gba.palette.loadBgRange(i, [0]);
  for (let i = 0; i < 256; i++) rt.gba.palette.loadObjRange(i, [0]);

  if (!_assetsCache) {
    console.warn('[wallclock] _loadWallClockGraphics: assets not loaded');
    return;
  }
  const assets = _assetsCache;

  // 1:1 décomp `LZ77UnCompVram(gWallClock_Gfx, VRAM)` :
  // Load clock.png tiles in BG3 char base (= VRAM offset 0x0000).
  const clockCharOff = BG_CLOCK_CHAR * 0x4000;
  rt.gba.vram.set(assets.clockTiles, clockCharOff);

  // 1:1 STRICT décomp wallclock.c:649-652 :
  //   if (gSpecialVar_0x8004 == MALE)
  //       LoadPalette(gWallClockMale_Pal, BG_PLTT_ID(0), PLTT_SIZE_4BPP);
  //   else
  //       LoadPalette(gWallClockFemale_Pal, BG_PLTT_ID(0), PLTT_SIZE_4BPP);
  //
  // VAR_0x8004 est set par le SCRIPT caller AVANT special StartWallClock /
  // Special_ViewWallClock :
  //   LittlerootTown_BrendansHouse_2F_EventScript_WallClock : setvar VAR_0x8004, MALE
  //   LittlerootTown_MaysHouse_2F_EventScript_WallClock : setvar VAR_0x8004, FEMALE
  // Donc l'horloge chez Brendan = male palette, chez May = female palette,
  // INDÉPENDAMMENT du gender du player (= user-flag : chez May on voit
  // horloge May, pas notre horloge).
  const var8004 = VarGet('VAR_0x8004');
  const isFemale = var8004 === FEMALE;
  const bgPal = isFemale ? assets.femalePalette : assets.malePalette;
  LoadPalette(bgPal, BG_PLTT_ID(0), 32);  // 16 colors × 2 bytes = 32

  // 1:1 décomp `LoadPalette(sTextPrompt_Pal, BG_PLTT_ID(12), PLTT_SIZEOF(4))` :
  // 4 colors (= small palette for label window).
  LoadPalette(assets.textPromptPal, BG_PLTT_ID(12), 32);

  // 1:1 décomp `LoadPalette(GetOverworldTextboxPalettePtr(), BG_PLTT_ID(14), PLTT_SIZE_4BPP)` :
  // palette pour text rendering dans WIN_MSG (= "Est-ce la bonne heure?" en mode SET).
  // On utilise directement assets.messageBoxPalette (= chargé via loadIndexedPngStrict)
  // au lieu de GetOverworldTextboxPalettePtr() qui dépend du module-state assetCache.
  LoadPalette(assets.messageBoxPalette, BG_PLTT_ID(14), 32);

  // Setup BG templates (= sBgTemplates 1:1 décomp wallclock.c:111-131).
  // BG0 char=2 map=31 priority=0  → text windows
  // BG2 char=1 map=8  priority=1  → label window bg
  // BG3 char=0 map=7  priority=2  → wallclock background
  const bg0c = rt.gba.bg(0).config;
  bg0c.charBaseIndex = BG_TEXT_CHAR; bg0c.mapBaseIndex = BG_TEXT_MAP;
  bg0c.screenSize = 0; bg0c.paletteMode = 0; bg0c.priority = 0; bg0c.visible = true;
  bg0c.hofs = 0; bg0c.vofs = 0;
  const bg2c = rt.gba.bg(2).config;
  bg2c.charBaseIndex = BG_LABEL_CHAR; bg2c.mapBaseIndex = BG_LABEL_MAP;
  bg2c.screenSize = 0; bg2c.paletteMode = 0; bg2c.priority = 1; bg2c.visible = true;
  bg2c.hofs = 0; bg2c.vofs = 0;
  const bg3c = rt.gba.bg(3).config;
  bg3c.charBaseIndex = BG_CLOCK_CHAR; bg3c.mapBaseIndex = BG_CLOCK_MAP;
  bg3c.screenSize = 0; bg3c.paletteMode = 0; bg3c.priority = 2; bg3c.visible = true;
  bg3c.hofs = 0; bg3c.vofs = 0;
  rt.gba.bg(1).config.visible = false;

  // 1:1 STRICT décomp `LoadCompressedSpriteSheet(GFXTAG_WALL_CLOCK_HAND)` +
  // `LoadSpritePalette(PALTAG_WALL_CLOCK_HAND)`. Tag system honore
  // gReservedSpriteTileCount → alloué STRICTEMENT après player tiles.
  _wallClockHandTileStart = LoadSpriteSheet({
    data: assets.handTiles,
    size: assets.handTiles.length,
    tag: TAG_WALL_CLOCK_HAND_GFX,
  });
  _wallClockHandPalSlot = LoadSpritePalette({ data: bgPal, tag: TAG_WALL_CLOCK_HAND_PAL });

  // Init windows (= sWindowTemplates wallclock-data.ts).
  const wins: WindowTemplate[] = [
    { bg: 0, tilemapLeft: 3, tilemapTop: 17, width: 24, height: 2, paletteNum: 14, baseBlock: 512 },
    { bg: 2, tilemapLeft: 24, tilemapTop: 16, width: 6, height: 2, paletteNum: 12, baseBlock: 560 },
  ];
  const ids = InitWindows(wins);
  _msgWid = ids[0];
  _labelWid = ids[1];

  // 1:1 décomp `LoadUserWindowBorderGfx(0, 0x250, BG_PLTT_ID(13))` (wallclock.c:660) :
  // charge les tiles du frame std border à tile 0x250 sur BG0 char base + palette 13.
  // Used by `DrawStdFrameWithCustomTileAndPalette` dans Task_SetClock_AskConfirm.
  LoadUserWindowBorderGfx(0, STD_FRAME_TILE, STD_FRAME_PAL * 16);

  // DISPCNT : OBJ_ON | OBJ_1D_MAP | BG0/2/3.
  rt.SetGpuReg(0x00, 0x1000 | 0x40 | 0x100 | 0x400 | 0x800);
  rt.SetGpuReg(0x50, 0);  // BLDCNT = 0
  rt.SetGpuReg(0x52, 0);  // BLDALPHA = 0
  rt.SetGpuReg(0x54, 0);  // BLDY = 0
  ShowBg(0); ShowBg(2); ShowBg(3); HideBg(1);

  ResetPaletteFade();
  ResetTasks();
  ResetSpriteData();
}

/** Load tilemap clock_start.bin (mode SET) or clock_view.bin (mode VIEW) into BG3 map. */
function _loadClockTilemap(rt: DecompRuntime, mode: Mode): void {
  if (!_assetsCache) return;
  const src = mode === 'SET' ? _assetsCache.startTilemap : _assetsCache.viewTilemap;
  // BG3 map base 7 = VRAM offset 7 * 0x800 = 0x3800.
  const mapOff = BG_CLOCK_MAP * 0x800;
  // Décomp tilemap is 32×20 = 640 u16 entries (= 1280 bytes).
  // Map dest 32×32 (= 1024 u16). Copy 32×20 directly, leave last 12 rows = 0.
  const dst = new Uint16Array(rt.gba.vram.buffer, mapOff, 32 * 32);
  for (let i = 0; i < src.length && i < dst.length; i++) {
    dst[i] = src[i];
  }
}

// ─── Sprite spawn (= CB2_StartWallClock / CB2_ViewWallClock body) ──────────

/** Create 4 sprites at center (120, 80) :
 *   - MinuteHand 64×64 affineMode=ST_OAM_AFFINE_NORMAL matrixNum=0 priority=1
 *   - HourHand 64×64 affineMode=ST_OAM_AFFINE_NORMAL matrixNum=1 priority=0
 *   - PMIndicator 16×16 priority=2 sAngle=45 (SET) or angle1 (VIEW)
 *   - AMIndicator 16×16 priority=2 sAngle=90 (SET) or angle2 (VIEW) */
function _spawnHandSprites(rt: DecompRuntime, amInitAngle: number, pmInitAngle: number): void {
  // Minute hand (64×64 = shape 0 size 3).
  const minuteSpr = rt.CreateSpriteAtOam({
    x: 120, y: 80, shape: 0, size: 3,
    tileId: _wallClockHandTileStart + TILE_MINUTE_HAND_START,
    paletteBank: _wallClockHandPalSlot, priority: 1,
    affineMode: 1,  // ST_OAM_AFFINE_NORMAL
  });
  _state.spriteIds.minute = minuteSpr.spriteId;
  const minuteSprObj = rt.gSprites.get(minuteSpr.spriteId);
  if (minuteSprObj) {
    minuteSprObj.matrixNum = 0;
    minuteSprObj.affineMode = 1;
  }

  // Hour hand (64×64).
  const hourSpr = rt.CreateSpriteAtOam({
    x: 120, y: 80, shape: 0, size: 3,
    tileId: _wallClockHandTileStart + TILE_HOUR_HAND_START,
    paletteBank: _wallClockHandPalSlot, priority: 0,
    affineMode: 1,
  });
  _state.spriteIds.hour = hourSpr.spriteId;
  const hourSprObj = rt.gSprites.get(hourSpr.spriteId);
  if (hourSprObj) {
    hourSprObj.matrixNum = 1;
    hourSprObj.affineMode = 1;
  }

  // PM indicator (16×16 = shape 0 size 1).
  const pmSpr = rt.CreateSpriteAtOam({
    x: 120, y: 80, shape: 0, size: 1,
    tileId: _wallClockHandTileStart + TILE_PM_INDICATOR_START,
    paletteBank: _wallClockHandPalSlot, priority: 2,
    affineMode: 0,
  });
  _state.spriteIds.pm = pmSpr.spriteId;
  _state.pmAngle = pmInitAngle;

  // AM indicator (16×16).
  const amSpr = rt.CreateSpriteAtOam({
    x: 120, y: 80, shape: 0, size: 1,
    tileId: _wallClockHandTileStart + TILE_AM_INDICATOR_START,
    paletteBank: _wallClockHandPalSlot, priority: 2,
    affineMode: 0,
  });
  _state.spriteIds.am = amSpr.spriteId;
  _state.amAngle = amInitAngle;
}

// ─── Sprite callbacks (= 1:1 décomp wallclock.c:1021-1101) ──────────────────

/** 1:1 décomp `SpriteCB_MinuteHand` (wallclock.c:1021-1039).
 *  Apply rotation matrix matrixNum=0 + offset sprite.x2/y2 from sClockHandCoords. */
function _tickMinuteHand(rt: DecompRuntime): void {
  const sprId = _state.spriteIds.minute;
  if (sprId < 0) return;
  const sprite = rt.gSprites.get(sprId);
  if (!sprite) return;
  const angle = _state.minuteHandAngle & 0x1FF;  // mask to 0..511 just in case
  const safeAngle = angle % 360;
  const sin = Math.trunc(Sin2(safeAngle) / 16);
  const cos = Math.trunc(Cos2(safeAngle) / 16);
  SetOamMatrix(rt.gba, 0, cos, sin, -sin, cos);
  const coord = sClockHandCoords[safeAngle];
  sprite.x2 = coord[0];
  sprite.y2 = coord[1];
}

/** 1:1 décomp `SpriteCB_HourHand` (wallclock.c:1041-1059). matrixNum=1. */
function _tickHourHand(rt: DecompRuntime): void {
  const sprId = _state.spriteIds.hour;
  if (sprId < 0) return;
  const sprite = rt.gSprites.get(sprId);
  if (!sprite) return;
  const safeAngle = _state.hourHandAngle % 360;
  const sin = Math.trunc(Sin2(safeAngle) / 16);
  const cos = Math.trunc(Cos2(safeAngle) / 16);
  SetOamMatrix(rt.gba, 1, cos, sin, -sin, cos);
  const coord = sClockHandCoords[safeAngle];
  sprite.x2 = coord[0];
  sprite.y2 = coord[1];
}

/** 1:1 décomp `SpriteCB_PMIndicator` (wallclock.c:1063-1081).
 *  Animates AM/PM indicator between 2 positions based on period.
 *
 *  User-flag 2026-05-20 : hide indicator inutilisé (= en mode AM, le PM
 *  indicator devient invisible ; en mode PM, l'AM indicator). Non-1:1
 *  décomp (qui affiche les 2 indicators à des positions différentes), mais
 *  user-requested pour clarté visuelle. */
function _tickPMIndicator(rt: DecompRuntime): void {
  const sprId = _state.spriteIds.pm;
  if (sprId < 0) return;
  const sprite = rt.gSprites.get(sprId);
  if (!sprite) return;
  // Hide PM indicator if period is AM (= unused).
  sprite.invisible = _state.period === PERIOD_AM;
  if (sprite.invisible) return;  // skip anim si caché
  if (_state.period !== PERIOD_AM) {
    if (_state.pmAngle >= 60 && _state.pmAngle < 90) _state.pmAngle += 5;
    if (_state.pmAngle < 60) _state.pmAngle++;
  } else {
    if (_state.pmAngle >= 46 && _state.pmAngle < 76) _state.pmAngle -= 5;
    if (_state.pmAngle > 75) _state.pmAngle--;
  }
  sprite.x2 = Math.trunc(Cos2(_state.pmAngle) * 30 / 0x1000);
  sprite.y2 = Math.trunc(Sin2(_state.pmAngle) * 30 / 0x1000);
}

/** 1:1 décomp `SpriteCB_AMIndicator` (wallclock.c:1083-1101).
 *  Hide indicator inutilisé selon période (= user-requested polish). */
function _tickAMIndicator(rt: DecompRuntime): void {
  const sprId = _state.spriteIds.am;
  if (sprId < 0) return;
  const sprite = rt.gSprites.get(sprId);
  if (!sprite) return;
  // Hide AM indicator if period is PM (= unused).
  sprite.invisible = _state.period !== PERIOD_AM;
  if (sprite.invisible) return;  // skip anim si caché
  if (_state.period !== PERIOD_AM) {
    if (_state.amAngle >= 105 && _state.amAngle < 135) _state.amAngle += 5;
    if (_state.amAngle < 105) _state.amAngle++;
  } else {
    if (_state.amAngle >= 91 && _state.amAngle < 121) _state.amAngle -= 5;
    if (_state.amAngle > 120) _state.amAngle--;
  }
  sprite.x2 = Math.trunc(Cos2(_state.amAngle) * 30 / 0x1000);
  sprite.y2 = Math.trunc(Sin2(_state.amAngle) * 30 / 0x1000);
}

// ─── State machine tasks 1:1 décomp ─────────────────────────────────────────

/** 1:1 décomp `Task_SetClock_WaitFadeIn` (wallclock.c:785-791). */
function Task_SetClock_WaitFadeIn(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || rt.gPaletteFade.active) return;
  task.func = Task_SetClock_HandleInput;
}

/** 1:1 décomp `Task_SetClock_HandleInput` (wallclock.c:793-831).
 *  Wait pour minute hand angle à aligné %6, puis poll keys. A button →
 *  transition to AskConfirm dialog. */
function Task_SetClock_HandleInput(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  if (_state.minuteHandAngle % 6) {
    _state.minuteHandAngle = CalcNewMinHandAngle(_state.minuteHandAngle, _state.moveDir, _state.moveSpeed);
  } else {
    _state.minuteHandAngle = _state.minutes * 6;
    _state.hourHandAngle = (_state.hours % 12) * 30 + Math.floor(_state.minutes / 10) * 5;
    const newKeys = rt.gMain.newKeys;
    const heldKeys = rt.gMain.heldKeys;
    if (newKeys & A_BUTTON) {
      // 1:1 décomp wallclock.c:803-806 :
      //   if (JOY_NEW(A_BUTTON)) gTasks[taskId].func = Task_SetClock_AskConfirm;
      task.func = Task_SetClock_AskConfirm;
    } else {
      _state.moveDir = MOVE_NONE;
      if (heldKeys & DPAD_LEFT) _state.moveDir = MOVE_BACKWARD;
      if (heldKeys & DPAD_RIGHT) _state.moveDir = MOVE_FORWARD;
      if (_state.moveDir !== MOVE_NONE) {
        if (_state.moveSpeed < 0xFF) _state.moveSpeed++;
        _state.minuteHandAngle = CalcNewMinHandAngle(_state.minuteHandAngle, _state.moveDir, _state.moveSpeed);
        AdvanceClock(_state.moveDir);
      } else {
        _state.moveSpeed = 0;
      }
    }
  }
}

/** 1:1 décomp `Task_SetClock_AskConfirm` (wallclock.c:833-841).
 *  Draw std frame + "Est-ce la bonne heure?" + create YesNo menu. */
function Task_SetClock_AskConfirm(task: DecompTask): void {
  // 1:1 décomp :
  //   DrawStdFrameWithCustomTileAndPalette(WIN_MSG, FALSE, 0x250, 0x0d);
  //   AddTextPrinterParameterized(WIN_MSG, FONT_NORMAL, gText_IsThisTheCorrectTime, 0, 1, 0, NULL);
  //   PutWindowTilemap(WIN_MSG);
  //   ScheduleBgCopyTilemapToVram(0);
  //   CreateYesNoMenu(&sWindowTemplate_ConfirmYesNo, 0x250, 0x0d, 1);
  //   gTasks[taskId].func = Task_SetClock_HandleConfirmInput;
  if (_msgWid < 0) return;
  DrawStdFrameWithCustomTileAndPalette(_msgWid, false, STD_FRAME_TILE, STD_FRAME_PAL);
  const msgStr = getString('gText_IsThisTheCorrectTime') || 'Est-ce la bonne heure?';
  AddTextPrinterParameterized3(
    _msgWid, FONT_NORMAL, 0, 1,
    [1, 2, 3],  // [bgColor=1 fill, fgColor=2 white, shadowColor=3 gray]
    255,  // TEXT_SKIP_DRAW = sync
    msgStr,
  );
  PutWindowTilemap(_msgWid);
  CopyWindowToVram(_msgWid, 3);
  // CreateYesNoMenu : sWindowTemplate_ConfirmYesNo = bg=0 (24,9) 5×4
  // paletteNum=14 baseBlock=572. initialCursorPos=1 (= "NON" default).
  const yesNoTemplate: WindowTemplate = {
    bg: 0, tilemapLeft: 24, tilemapTop: 9, width: 5, height: 4,
    paletteNum: 14, baseBlock: 572,
  };
  CreateYesNoMenu(yesNoTemplate, STD_FRAME_TILE, STD_FRAME_PAL, 1);
  task.func = Task_SetClock_HandleConfirmInput;
}

/** 1:1 décomp `Task_SetClock_HandleConfirmInput` (wallclock.c:843-859).
 *  Process YesNo input : OUI → Confirmed ; NON/B → back to HandleInput. */
function Task_SetClock_HandleConfirmInput(task: DecompTask): void {
  const result = Menu_ProcessInputNoWrapClearOnChoose();
  switch (result) {
    case 0:  // YES
      PlaySE(5);  // SE_SELECT
      task.func = Task_SetClock_Confirmed;
      break;
    case 1:  // NO
    case -1:  // MENU_B_PRESSED
      PlaySE(5);  // SE_SELECT
      // 1:1 décomp :
      //   ClearStdWindowAndFrameToTransparent(WIN_MSG, FALSE);
      //   ClearWindowTilemap(WIN_MSG);
      //   gTasks[taskId].func = Task_SetClock_HandleInput;
      if (_msgWid >= 0) {
        ClearStdWindowAndFrame(_msgWid, false);
        ClearWindowTilemap(_msgWid);
      }
      task.func = Task_SetClock_HandleInput;
      break;
  }
}

/** 1:1 décomp `Task_SetClock_Confirmed` (wallclock.c:861-866). */
function Task_SetClock_Confirmed(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp :
  //   RtcInitLocalTimeOffset(gTasks[taskId].tHours, gTasks[taskId].tMinutes);
  //   BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
  //   gTasks[taskId].func = Task_SetClock_Exit;
  RtcInitLocalTimeOffset(_state.hours, _state.minutes);
  FlagSet('FLAG_SYS_CLOCK_SET');
  // 1:1 décomp wallclock.c:861-866 Task_SetClock_Confirmed : pas de save ici.
  // Le décomp ne fait QUE RtcInitLocalTimeOffset + BeginNormalPaletteFade +
  // setMainCallback2. La save SRAM se fait UNIQUEMENT via START → SAUVER
  // explicite du joueur. (Avant : `gameState.save()` ici → save random
  // user-flag 2026-05-21).
  rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 0, 16, 'RGB_BLACK');
  task.func = Task_SetClock_Exit;
}

/** 1:1 décomp `Task_SetClock_Exit` (wallclock.c:868-875).
 *  Wait fade complete then restore savedCallback. */
function Task_SetClock_Exit(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || rt.gPaletteFade.active) return;
  _freeWallClock();
  const exitCb = rt.gMain.savedCallback;
  if (exitCb) rt.SetMainCallback2(exitCb);
  else rt.SetMainCallback2(null);
  rt.DestroyTask(task.taskId);
}

/** 1:1 décomp `Task_ViewClock_WaitFadeIn` (wallclock.c:877-881). */
function Task_ViewClock_WaitFadeIn(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || rt.gPaletteFade.active) return;
  task.func = Task_ViewClock_HandleInput;
}

/** 1:1 décomp `Task_ViewClock_HandleInput` (wallclock.c:883-888).
 *  Re-init clock with RTC each frame (= live update), wait A/B press. */
function Task_ViewClock_HandleInput(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  InitClockWithRtc();
  if (rt.gMain.newKeys & (A_BUTTON | B_BUTTON)) {
    task.func = Task_ViewClock_FadeOut;
  }
}

/** 1:1 décomp `Task_ViewClock_FadeOut` (wallclock.c:890-894). */
function Task_ViewClock_FadeOut(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 0, 16, 'RGB_BLACK');
  task.func = Task_ViewClock_Exit;
}

/** 1:1 décomp `Task_ViewClock_Exit` (wallclock.c:896-900). */
function Task_ViewClock_Exit(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || rt.gPaletteFade.active) return;
  _freeWallClock();
  const exitCb = rt.gMain.savedCallback;
  if (exitCb) rt.SetMainCallback2(exitCb);
  else rt.SetMainCallback2(null);
  rt.DestroyTask(task.taskId);
}

// ─── CB2 entry points (= 1:1 décomp CB2_StartWallClock + CB2_ViewWallClock) ─

/** 1:1 décomp `CB2_WallClock` (wallclock.c:776-783) main callback : run tasks,
 *  animate sprites, update palette fade. Notre version : runtime auto-tick le
 *  task loop. Mais on doit appeler les sprite callbacks manuellement chaque
 *  frame (= AnimateSprites in décomp call sprite.callback). */
export function MainCB2_WallClockRun(): void {
  const rt = getRuntime();
  if (!rt) return;
  // Tick sprite callbacks (= 1:1 décomp AnimateSprites). Notre runtime ne
  // dispatch pas automatiquement les callbacks par name → tick manuel ici.
  _tickMinuteHand(rt);
  _tickHourHand(rt);
  _tickPMIndicator(rt);
  _tickAMIndicator(rt);
}

/** Init state machine for SET or VIEW mode. */
export function CB2_InitWallClock(): void {
  const rt = getRuntime();
  if (!rt) return;

  switch (rt.gMain.state) {
    case 0:
      rt.SetVBlankCallback(null);
      rt.gPaletteFade.bufferTransferDisabled = true;
      rt.gMain.state++;
      break;
    case 1:
      // Load assets async.
      if (_state.graphicsLoaded) { rt.gMain.state++; break; }
      if (_state.graphicsLoading) break;
      _state.graphicsLoading = true;
      void _loadAssets().then(() => {
        _state.graphicsLoaded = true;
        _state.graphicsLoading = false;
      }).catch((e) => {
        console.error('[wallclock] asset load failed:', e);
        _state.graphicsLoading = false;
      });
      break;
    case 2:
      // 1:1 décomp `LoadWallClockGraphics` setup BG + palettes + OBJ tiles.
      _loadWallClockGraphics(rt);
      rt.gMain.state++;
      break;
    case 3:
      // Load tilemap (clock_start ou clock_view) into BG3 map.
      _loadClockTilemap(rt, _state.mode);
      rt.gMain.state++;
      break;
    case 4:
      // Create task pour la mode.
      if (_state.mode === 'SET') {
        _state.taskId = rt.CreateTask(Task_SetClock_WaitFadeIn, 0);
        _state.hours = 10;
        _state.minutes = 0;
        _state.moveDir = 0;
        _state.period = PERIOD_AM;
        _state.moveSpeed = 0;
        _state.minuteHandAngle = 0;
        _state.hourHandAngle = 300;
        _spawnHandSprites(rt, /*amInit*/ 90, /*pmInit*/ 45);
      } else {
        _state.taskId = rt.CreateTask(Task_ViewClock_WaitFadeIn, 0);
        InitClockWithRtc();
        const angle1 = _state.period === PERIOD_AM ? 45 : 90;
        const angle2 = _state.period === PERIOD_AM ? 90 : 135;
        _spawnHandSprites(rt, /*amInit*/ angle2, /*pmInit*/ angle1);
      }
      // 1:1 décomp `AddTextPrinterParameterized(WIN_BUTTON_LABEL, FONT_NORMAL,
      // gText_Confirm3/Cancel4, 0, 1, 0, NULL)` (wallclock.c:723/771).
      // Label = "CONFIR." en mode SET (= action A button = confirm),
      //         "SORTIR" en mode VIEW (= action A/B button = exit).
      // Rendered on WIN_BUTTON_LABEL (= bg=2 paletteNum=12 = text_prompt.pal).
      {
        const labelStr = _state.mode === 'SET'
          ? (getString('gText_Confirm3') || 'CONFIR.')
          : (getString('gText_Cancel4') || 'SORTIR');
        FillWindowPixelBuffer(_labelWid, 0x00);
        AddTextPrinterParameterized3(
          _labelWid, FONT_NORMAL, 0, 1,
          [0, 2, 3],  // [bgColor=0 transparent, fgColor=2, shadowColor=3]
          255,  // TEXT_SKIP_DRAW = sync render
          labelStr,
        );
        PutWindowTilemap(_labelWid);
        CopyWindowToVram(_labelWid, 3);  // COPYWIN_FULL = 3
      }
      rt.gMain.state++;
      break;
    case 5:
      // 1:1 décomp `WallClockInit` (wallclock.c:671-684) : begin fade in + show BG.
      rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 0, 'RGB_BLACK');
      rt.gPaletteFade.bufferTransferDisabled = false;
      rt.SetVBlankCallback(VBlankCB_WallClock);
      rt.gMain.state++;
      break;
    default:
      // Setup done, swap to main loop.
      rt.SetMainCallback2(MainCB2_WallClockRun);
      _state.phase = 'open';
      return;
  }
}

export function VBlankCB_WallClock(): void { /* runtime auto-transferts */ }

// ─── Cleanup ───────────────────────────────────────────────────────────────

function _freeWallClock(): void {
  const rt = getRuntime();
  if (!rt) return;
  // C5 fix : destroy TOUS les sprites créés par WallClock UI (= pas juste les
  // 4 tracked). Sweep gSprites et destroy ceux qui n'étaient PAS actifs avant
  // OpenWallClock (= snapshot preOpenSpriteIds).
  // Sans ce sweep total, 60+ OAM zombies à (-8,-8) saturent gba.oam[] et
  // overwrite les NPCs OAM → ItemBall + Rival invisible visuellement post-close.
  const preOpenSet = new Set(_state.preOpenSpriteIds);
  const toDestroy: number[] = [];
  for (const [k, s] of rt.gSprites) {
    if (!s.inUse) continue;
    if (preOpenSet.has(k)) continue;  // était actif avant → préserver
    toDestroy.push(k);
  }
  for (const k of toDestroy) {
    const spr = rt.gSprites.get(k);
    if (spr) {
      spr.inUse = false;
      spr.invisible = true;
      const oam = rt.gba.oam[spr.oamIndex];
      if (oam) oam.visible = false;
    }
    rt.gSprites.delete(k);
  }
  console.log(`[wallclock] _freeWallClock destroyed ${toDestroy.length} sprites (preOpen=${_state.preOpenSpriteIds.length})`);
  // Reset tracked sprite ids.
  for (const key of ['minute', 'hour', 'am', 'pm'] as const) {
    _state.spriteIds[key] = -1;
  }
  _state.preOpenSpriteIds = [];
  if (_msgWid >= 0) { RemoveWindow(_msgWid); _msgWid = -1; }
  if (_labelWid >= 0) { RemoveWindow(_labelWid); _labelWid = -1; }
  // Clear BG3 (= wallclock tilemap + tiles) avant return-to-field. Sans ça,
  // CB2_ReturnToFieldLocal_Manual re-init les BG0/1/2 (= overworld layers) MAIS
  // le BG3 reste avec les wallclock tiles → résidu visible (= clock face
  // partial rendering au coin écran après close).
  // 1:1 décomp `CB2_ReturnToField` reset DISPCNT puis re-init tous les BG via
  // ResetBgsAndClearDma3BusyFlags + InitBgsFromTemplates de l'overworld.
  // Notre simplification : clear BG3 char/map VRAM + désactiver le BG.
  const bg3Char = BG_CLOCK_CHAR * 0x4000;
  const bg3Map = BG_CLOCK_MAP * 0x800;
  rt.gba.vram.fill(0, bg3Char, bg3Char + 0x4000);
  rt.gba.vram.fill(0, bg3Map, bg3Map + 0x800);
  rt.gba.bg(3).config.visible = false;
  // Restore BG1 visible pour que `CB2_ReturnToFieldLocal_Manual` puisse
  // re-init l'overworld correctement. Sans ça l'OW reste partiel (= BG1 hidden).
  rt.gba.bg(1).config.visible = true;
  // Reset DISPCNT pour que CB2_ReturnToField re-configure les BG layers depuis
  // scratch (= sans héritage de notre wallclock layout BG0/2/3 only).
  rt.SetGpuReg(0x00, 0);  // DISPCNT = 0 (= all BG/OBJ disabled, ReturnToField re-set)
  _state.phase = 'idle';
  _state.graphicsLoaded = false;
  _state.graphicsLoading = false;
  _assetsCache = null;  // force re-load if user re-opens (= fresh palette/tiles)
  _assetsLoading = null;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/** Entry point appelé par `script-opcodes.ts` quand un script fait
 *  `special StartWallClock` ou `special Special_ViewWallClock`.
 *
 *  CB2 swap pattern (= 1:1 décomp `SetMainCallback2(CB2_StartWallClock)`) :
 *    - Save current main CB2 → gMain.savedCallback
 *    - Set CB2_InitWallClock as new main → runtime call it chaque frame jusqu'à
 *      ce qu'il pass à MainCB2_WallClockRun.
 *    - À la fin (= Task_*_Exit), restore gMain.savedCallback. */
export function OpenWallClock(mode: Mode): void {
  const rt = getRuntime();
  if (!rt) {
    console.warn('[wallclock] OpenWallClock: no runtime');
    return;
  }
  if (_state.phase !== 'idle') {
    console.warn('[wallclock] OpenWallClock: already open');
    return;
  }
  _state.mode = mode;
  _state.phase = 'init';
  _state.initState = 0;
  _state.graphicsLoaded = false;
  _state.graphicsLoading = false;
  // C5 fix : snapshot des sprites actifs AVANT WallClock open. Au close,
  // tous sprites créés depuis sont destroyed (= cleanup leak OAM zombies).
  _state.preOpenSpriteIds = [];
  for (const [k, s] of rt.gSprites) {
    if (s.inUse) _state.preOpenSpriteIds.push(k);
  }
  // 1:1 décomp `SetMainCallback2(CB2_StartWallClock)` pattern : savedCallback
  // pointe vers le return-to-field handler qui ré-init les BG/palettes/sprites
  // de l'OW (= CB2_ReturnToFieldLocal_Manual, équivalent décomp
  // CB2_ReturnToField + ReturnToFieldLocal qui restore _all_ field state).
  // Sans ça, simple restore vers MainCB2_Overworld2 laisse l'écran noir car
  // les BG/palettes ont été reset par _loadWallClockGraphics.
  rt.gMain.savedCallback = CB2_ReturnToFieldLocal_Manual;
  rt.gMain.state = 0;
  rt.SetMainCallback2(CB2_InitWallClock);
}

/** Returns TRUE si le wallclock est open. Used by `tick()` polling. */
export function IsWallClockOpen(): boolean {
  return _state.phase === 'init' || _state.phase === 'open';
}

// Suppress unused warnings.
void STD_FRAME_TILE;
void STD_FRAME_PAL;
void FONT_NORMAL;
void FillWindowPixelBuffer;
void PutWindowTilemap;
void CopyWindowToVram;
void gMain;
void HideBg;
