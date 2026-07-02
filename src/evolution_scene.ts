/**
 * evolution_scene.ts — MIROIR 1:1 de `src/evolution_scene.c`
 * (D:/Projet 1/decomps/pokeemeraude/src/evolution_scene.c, 1685 lignes).
 *
 * La scène d'évolution complète : fond combat (textbox + BG animé bleu), sprites
 * pré/post-évolution, sparkles (evolution_graphics.ts), musique MUS_EVOLUTION,
 * annulation B, apprentissage de capacité post-évo (yes/no + summary select-move),
 * Shedinja. Entrées : BeginEvolutionScene (field : party_menu Rare Candy / pierre)
 * et EvolutionScene (combat : TryEvolvePokemon, battle_main).
 *
 * COUVERTURE COMPLÈTE (24/24 fonctions + tables). Le path TRADE
 * (TradeEvolutionScene / Task_TradeEvolutionScene / CB2_TradeEvolutionSceneLoad
 * Graphics) est TRANSCRIT 1:1 mais ses callees trade.c (LoadTradeAnimGfx,
 * DrawTextOnTradeWindow, LinkTradeDrawWindow, InitTradeSequenceBgGpuRegs,
 * gTradeEvolutionSceneYesNoWindowTemplate) ne sont pas portés (link trade = P4,
 * AUCUN caller vivant) → helpers locaux fail-fast (throw explicite, pas de
 * pansement silencieux). Le jour où src/trade.ts naît : remplacer 5 imports.
 *
 * Divergences plateforme (assumées, cf. [[hardware-non-1to1-exemptions]] + pipeline) :
 *   - INCGFX (bg.png/bg_inner.bin/bg_outer.bin/*.pal + pics mon) = assets pré-extraits
 *     fetchés ASYNC → EvolutionScene/CB2_*LoadGraphics chargent en async puis posent
 *     le CB2 (le décomp est synchrone ROM ; ici l'écran source reste affiché quelques
 *     frames — le fade de Task_BeginEvolutionScene couvre le cas field).
 *   - `CpuFill32(0,VRAM)+InitBattleBgsVideo+LoadBattleTextboxAndBackground` =
 *     battleInitVideo1to1(BATTLE_ENVIRONMENT_PLAIN) (battle_bg.ts, même ordre).
 *   - gBattle_BG*_X/Y = globalThis (pattern battle_anim) ; VBlankCB les pousse via
 *     SetGpuReg(BG*HOFS/VOFS) comme la décomp.
 *   - SetHBlankCallback : pas de HBlank plateforme (EvoDummyFunc = vide) — no-op doc.
 *   - LoadOam/ProcessSpriteCopyRequests/TransferPlttBuffer du VBlank = automatiques
 *     (compositeur) ; seul le scroll + ScanlineEffect_InitHBlankDmaTransfer restent.
 *   - gCB2_AfterEvolution : COMMON_DATA défini ICI (foyer 1:1) — battle_main s'y branche.
 */
import { CreateTask, DestroyTask } from './task';
import {
  getRuntime, PlaySE, IsSEPlaying, IsCryFinished, IsFanfareTaskInactive,
  PlayFanfare, m4aMPlayAllStop, LoadPalette, PlayCryInternal,
  FindTaskIdByFunc, ResetTasks, setReservedSpritePaletteCount,
  LoadCompressedSpriteSheet,
} from '../harness/runtime/decomp-globals';
import { OBJ_PLTT_ID } from '../harness/runtime/decomp-runtime';
import type { DecompRuntime } from '../harness/runtime/decomp-runtime';
import {
  REG_OFFSET_DISPCNT, REG_OFFSET_MOSAIC, REG_OFFSET_WIN0H, REG_OFFSET_WIN0V,
  REG_OFFSET_WIN1H, REG_OFFSET_WIN1V, REG_OFFSET_WININ, REG_OFFSET_WINOUT,
  REG_OFFSET_BLDCNT, REG_OFFSET_BLDALPHA, REG_OFFSET_BG3CNT,
  REG_OFFSET_BG0HOFS, REG_OFFSET_BG0VOFS, REG_OFFSET_BG1HOFS, REG_OFFSET_BG1VOFS,
  REG_OFFSET_BG2HOFS, REG_OFFSET_BG2VOFS, REG_OFFSET_BG3HOFS, REG_OFFSET_BG3VOFS,
  DISPCNT_OBJ_ON, DISPCNT_BG_ALL_ON, DISPCNT_OBJ_1D_MAP, DISPCNT_BG0_ON,
} from '../include/gba/io_reg';
import { CreateSprite, FreeAllSpritePalettes, ResetSpriteData } from './sprite';
import { BeginNormalPaletteFade, FillPalette } from './palette';
import { ResetPaletteFade, BlendPalettes } from '../harness/runtime/decomp-globals';
import { Sin, Cos } from './trig';
import { ScanlineEffect_Stop, ScanlineEffect_InitHBlankDmaTransfer } from './scanline_effect';
import { battleInitVideo1to1 } from './battle_bg';
import { AllocateMonSpritesGfx, FreeMonSpritesGfx, gMonSpritesGfxPtr, MON_PIC_SIZE } from './battle_gfx_sfx_util';
import {
  HandleBattleWindow, YESNOBOX_X_Y, WINDOW_CLEAR,
  BattleCreateYesNoCursorAt, BattleDestroyYesNoCursorAt,
} from './engine/battle/battle-window-frame';
import { BattlePutTextOnWindow, BattlePutTextOnWindowBytes } from './battle_controllers';
import {
  BufferStringBattle, gDisplayedStringBattle,
  buildMoveBuff, encodeTemplate, B_TXT_NAME_TO_CODE,
} from './battle_message';
import { gBattleTextBuff1, gBattleTextBuff2, gBattleTextBuff3 } from '../include/battle_message';
import type { BattleMsgData } from './engine/battle/battle-event-queue';
import { gBattleCommunication, gMoveToLearn } from './engine/battle/state';
import { gPlayerParty, GetMonData, SetMonData } from './engine/battle/party-storage';
import type { Pokemon } from './engine/battle/party-storage';
import {
  CopyMon, CalculatePlayerPartyCount, CalculateMonStats, EvolutionRenameMon,
  MonTryLearningNewMove, IsHMMove2, RemoveMonPPBonus, SetMonMoveSlot,
} from './pokemon';
import {
  GetSetPokedexFlag, SpeciesToNationalPokedexNum, FLAG_SET_SEEN, FLAG_SET_CAUGHT,
} from './engine/ui/pokedex-flags';
import { IncrementGameStat } from './field_player_avatar';
import { GAME_STAT_EVOLVED_POKEMON } from '../include/constants/game_stat';
import { ShowSelectMovePokemonSummaryScreen, GetMoveSlotToReplace } from './pokemon_summary_screen';
import { PlayBGM, PlayNewMapMusic, StopMapMusic } from './sound';
import { Overworld_PlaySpecialMapMusic } from './overworld';
import { getString } from './engine/ui/gba-strings';
import {
  gStringVar1, gStringVar2, gStringVar4,
  StringExpandPlaceholders, StringCopy, StringCopy_Nickname,
} from './string_util';
import { encodeOwText, gTextFlags, IsTextPrinterActive as _IsTextPrinterActive_Real } from './text';
import { CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose } from './menu';
import { LoadUserWindowBorderGfx } from './text_window';
import {
  ShowBg, FillBgTilemapBufferRect, CopyToBgTilemapBuffer, CopyBgTilemapBufferToVram,
  GetBgTilemapBuffer, FreeAllWindowBuffers,
} from './window';
import { LoadBgTiles } from '../harness/runtime/decomp-globals';
import { loadTileBin, loadGbaPal, extractPngPlte } from '../harness/gba/png-loader';
import { DoMonFrontSpriteAnimation } from './pokemon_animation';
import { B_WIN_MSG, B_WIN_YESNO } from './engine/battle/constants';
import {
  MUS_EVOLUTION, MUS_EVOLUTION_INTRO, MUS_EVOLVED, MUS_LEVEL_UP,
  SE_EXP, SE_SELECT,
} from '../include/constants/songs';
import {
  STRINGID_PKMNLEARNEDMOVE, STRINGID_TRYTOLEARNMOVE1, STRINGID_TRYTOLEARNMOVE2,
  STRINGID_TRYTOLEARNMOVE3, STRINGID_PKMNFORGOTMOVE, STRINGID_STOPLEARNINGMOVE,
  STRINGID_DIDNOTLEARNMOVE, STRINGID_123POOF, STRINGID_ANDELLIPSIS,
  STRINGID_HMMOVESCANTBEFORGOTTEN, STRINGID_EMPTYSTRING3,
} from '../include/constants/battle_string_ids';
import { SPECIES_SHEDINJA, SPECIES_NINJASK } from '../include/constants/species';
import { MAIL_NONE } from '../include/constants/items';
import { CONTEST_CATEGORIES_COUNT, LANGUAGE_JAPANESE, PARTY_SIZE } from '../include/constants/global';
import {
  MON_DATA_NICKNAME, MON_DATA_SPECIES, MON_DATA_OT_ID, MON_DATA_PERSONALITY,
  MON_DATA_HELD_ITEM, MON_DATA_MARKINGS, MON_DATA_ENCRYPT_SEPARATOR,
  MON_DATA_COOL_RIBBON, MON_DATA_CHAMPION_RIBBON, MON_DATA_UNUSED_RIBBONS,
  MON_DATA_STATUS, MON_DATA_MAIL, MON_DATA_LANGUAGE, MON_DATA_MOVE1,
} from '../include/pokemon';
import { GET_SHINY_VALUE } from '../include/pokemon';
import { SHINY_ODDS } from '../include/constants/pokemon';
import { getEvolutions, gSpeciesNames } from './engine/data/game-data';
import { resolveDecompConstant, reverseDecompConstant } from '../harness/runtime/decomp-constants';
import {
  LoadEvoSparkleSpriteAndPal, EvolutionSparkles_SpiralUpward, EvolutionSparkles_ArcDown,
  EvolutionSparkles_CircleInward, EvolutionSparkles_SprayAndFlash,
  EvolutionSparkles_SprayAndFlash_Trade, CycleEvolutionMonSprite,
} from './evolution_graphics';
// ⚠️ Imports battle_main = FONCTIONS HOISTÉES uniquement (cycle battle_main ↔
// evolution_scene fonction-only = bénin, précédent frontier_util→new_game P1.4).
import { GetBattleBgTemplateData, SpriteCallbackDummy_2 } from './battle_main';
import { RunTextPrinters } from './text';

const _rt = (): DecompRuntime => getRuntime();
/** SetBgAttribute : pas dans le typage DecompRuntime — dispatch runtime optionnel
 *  (pattern battle_intro.ts:100). */
const _setBgAttribute = (bg: number, attr: number, val: number): void => {
  (_rt() as unknown as { SetBgAttribute?: (b: number, a: number, v: number) => void }).SetBgAttribute?.(bg, attr, val);
};

// ─── struct EvoInfo (evolution_scene.c:39-46) ────────────────────────────────
type EvoInfo = {
  preEvoSpriteId: number;
  postEvoSpriteId: number;
  evoTaskId: number;
  delayTimer: number;
  savedPalette: Uint16Array;  // u16[48]
};

/** 1:1 `EWRAM_DATA struct EvoInfo *sEvoStructPtr = NULL` (:48). */
let sEvoStructPtr: EvoInfo | null = null;
/** 1:1 `EWRAM_DATA u16 *sBgAnimPal = NULL` (:49). */
let sBgAnimPal: Uint16Array | null = null;

/** 1:1 `COMMON_DATA void (*gCB2_AfterEvolution)(void) = NULL` (:51) — FOYER ici.
 *  battle_main (TryEvolvePokemon/WaitForEvoSceneToFinish) + party_menu s'y branchent. */
export let gCB2_AfterEvolution: (() => void) | null = null;
export function SetCB2AfterEvolution(cb: (() => void) | null): void { gCB2_AfterEvolution = cb; }
export function GetCB2AfterEvolution(): (() => void) | null { return gCB2_AfterEvolution; }

// 1:1 `#define sEvoCursorPos gBattleCommunication[1]` / `sEvoGraphicsTaskId [2]` (:53-54).
const getEvoCursorPos = (): number => gBattleCommunication[1];
const setEvoCursorPos = (v: number): void => { gBattleCommunication[1] = v; };
const getEvoGraphicsTaskId = (): number => gBattleCommunication[2];
const setEvoGraphicsTaskId = (v: number): void => { gBattleCommunication[2] = v; };

// ─── Helpers plateforme (tasks par id + gBattle_BG + texte) ──────────────────

type EvoTask = { data: number[]; taskId: number; func: unknown; isActive: boolean };
const _task = (taskId: number): EvoTask => _rt().gTasks[taskId] as unknown as EvoTask;
const _taskIsActive = (taskId: number): boolean => !!(_rt().gTasks[taskId] as { isActive?: boolean } | undefined)?.isActive;
/** Adaptateur task-par-id (nos task fns runtime reçoivent (task)) + funcRef pour
 *  FindTaskIdByFunc/FuncIsActiveTask (fallback decomp-globals). */
const _setTaskFunc = (taskId: number, fn: (taskId: number) => void): void => {
  const t = _task(taskId) as unknown as { func: unknown; funcRef?: unknown };
  t.func = (tt: { taskId: number }) => fn(tt.taskId);
  t.funcRef = fn;
};
const _createTask = (fn: (taskId: number) => void, priority: number): number => {
  const id = CreateTask((t: { taskId: number }) => fn(t.taskId), priority);
  (_task(id) as unknown as { funcRef?: unknown }).funcRef = fn;
  return id;
};

// 1:1 COMMON_DATA gBattle_BG0_X..gBattle_BG3_Y (battle_main.c) — stockées
// globalThis (pattern battle_anim, même monnaie que les anims de combat).
const _gbg = (): Record<string, number | undefined> => globalThis as unknown as Record<string, number | undefined>;
const _getBg = (k: string): number => _gbg()[k] ?? 0;
const _setBg = (k: string, v: number): void => { (_gbg() as Record<string, unknown>)[k] = v; };

/** Encode un gText_* (strings.json FR) en bytes charmap, placeholders {B_COPY_VAR_1}
 *  etc. → codes 0xFD (mêmes valeurs que characters.h STR_VAR_*, résolus ensuite
 *  par string_util.StringExpandPlaceholders = chemin décomp exact). */
const _gText = (key: string): Uint8Array => encodeTemplate(getString(key), B_TXT_NAME_TO_CODE);

/** 1:1 `BattleStringExpandPlaceholdersToDisplayedString(gBattleStringsTable[id -
 *  BATTLESTRINGS_TABLE_START])` : notre BufferStringBattle(id) résout la même table
 *  (default → BATTLE_STRINGS_TABLE[id]) et expand dans gDisplayedStringBattle.
 *  msgData = textBuffs courants (gBattleTextBuff1/2/3, remplis par la scène). */
function BattleStringExpandPlaceholdersToDisplayedString(stringId: number): void {
  const msgData = {
    textBuffs: [gBattleTextBuff1.slice(), gBattleTextBuff2.slice(), gBattleTextBuff3.slice()],
  } as unknown as BattleMsgData;
  BufferStringBattle(stringId, msgData);
}

/** 1:1 `BufferMoveToLearnIntoBattleTextBuff2()` (battle_script_commands.c:6242) :
 *  PREPARE_MOVE_BUFFER(gBattleTextBuff2, gMoveToLearn). */
function BufferMoveToLearnIntoBattleTextBuff2(): void {
  gBattleTextBuff2.fill(0);
  gBattleTextBuff2.set(buildMoveBuff(gMoveToLearn));
}

/** 1:1 `IsTextPrinterActive(0)` — suit le VRAI printer des fenêtres battle
 *  (__gbaIsTextPrinterActive gère \p/flèche/A-B) avec fallback shim
 *  __textPrinterState (pattern battle_controller_player._IsTextPrinterActive). */
function IsTextPrinterActive(windowId: number): boolean {
  if ((globalThis as { __battleTextInstant?: boolean }).__battleTextInstant) return false;
  const real = (globalThis as { __gbaIsTextPrinterActive?: (w: number) => boolean }).__gbaIsTextPrinterActive;
  if (real) return real(windowId);
  const m = (globalThis as { __textPrinterState?: Record<number, boolean> }).__textPrinterState;
  if (m && windowId in m) return !!m[windowId];
  return _IsTextPrinterActive_Real(windowId);
}

// ─── Helpers trade.c NON PORTÉS (fail-fast — link trade = P4, 0 caller vivant) ──
function LoadTradeAnimGfx(): void { throw new Error('[evolution_scene] LoadTradeAnimGfx : trade.c non porté (link trade = P4)'); }
function DrawTextOnTradeWindow(_windowId: number, _text: Uint8Array | string, _speed: number): void { throw new Error('[evolution_scene] DrawTextOnTradeWindow : trade.c non porté (link trade = P4)'); }
function LinkTradeDrawWindow(): void { throw new Error('[evolution_scene] LinkTradeDrawWindow : trade.c non porté (link trade = P4)'); }
function InitTradeSequenceBgGpuRegs(): void { throw new Error('[evolution_scene] InitTradeSequenceBgGpuRegs : trade.c non porté (link trade = P4)'); }
/** 1:1 `gTradeEvolutionSceneYesNoWindowTemplate` (trade.c) — data du path trade. */
const gTradeEvolutionSceneYesNoWindowTemplate = { bg: 0, tilemapLeft: 21, tilemapTop: 7, width: 6, height: 4, paletteNum: 15, baseBlock: 0x00C0 };
// gWirelessCommType / wireless status indicator (link) : non portés — path trade only.
const gWirelessCommType = 0;
function LoadWirelessStatusIndicatorSpriteGfx(): void { /* link only — inatteignable (gWirelessCommType=0) */ }
function CreateWirelessStatusIndicatorSprite(_x: number, _y: number): void { /* link only */ }
function DestroyWirelessStatusIndicatorSprite(): void { /* link only */ }

/** 1:1 `PlayCry_Normal(species, pan)` (sound.c) — mêmes params plateforme que la
 *  chaîne Birch/pokeball ((sp,pan) => PlayCryInternal(sp,pan,100,2,0)). */
function PlayCry_Normal(species: number, pan: number): void {
  PlayCryInternal(species, pan, 100, 2, 0);
}

// ─── Assets 1:1 INCGFX (evolution_scene.c:70-78) — fetch lazy ────────────────
// sUnusedPal1..4 (unused_1..4.pal) : présents dans les assets extraits, non chargés
// (UNUSED dans la décomp aussi — aucune lecture).
let sBgAnim_Gfx: Uint8Array | null = null;            // bg.png (4bpp lz → pré-décompressé)
let sBgAnim_Inner_Tilemap: Uint16Array | null = null; // bg_inner.bin
let sBgAnim_Outer_Tilemap: Uint16Array | null = null; // bg_outer.bin
let sBgAnim_Intro_Pal: Uint16Array | null = null;     // bg_anim_intro.pal (16 couleurs)
let sBgAnim_Pal: Uint16Array | null = null;           // bg_anim.pal (14+ couleurs)

async function _loadEvoBgAssets(): Promise<void> {
  if (sBgAnim_Gfx) return;
  const [gfx, innerBuf, outerBuf, introPal, animPal] = await Promise.all([
    loadTileBin('/decomp/em/evolution_scene/bg.png', 4),
    fetch('/decomp/em/evolution_scene/bg_inner.bin').then(r => r.arrayBuffer()),
    fetch('/decomp/em/evolution_scene/bg_outer.bin').then(r => r.arrayBuffer()),
    loadGbaPal('/decomp/em/evolution_scene/bg_anim_intro.pal'),
    loadGbaPal('/decomp/em/evolution_scene/bg_anim.pal'),
  ]);
  sBgAnim_Gfx = gfx;
  sBgAnim_Inner_Tilemap = new Uint16Array(innerBuf);
  sBgAnim_Outer_Tilemap = new Uint16Array(outerBuf);
  sBgAnim_Intro_Pal = introPal;
  sBgAnim_Pal = animPal;
}

/** 1:1 `sText_ShedinjaJapaneseName[] = _("ヌケニン")` (:80). */
const sText_ShedinjaJapaneseName = 'ヌケニン';

/** 1:1 `sBgAnim_PaletteControl` (:88-94) — {startPal, endPal, cycles, delay}. */
const sBgAnim_PaletteControl: readonly (readonly number[])[] = [
  [0, 12, 1, 6],
  [13, 36, 5, 2],
  [13, 24, 1, 2],
  [37, 49, 1, 6],
];

/** 1:1 `sBgAnim_PalIndexes` (:97-148) — 50 lignes × 16 index dans sBgAnim_Pal. */
const sBgAnim_PalIndexes: readonly (readonly number[])[] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0],
  [0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0],
  [0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0, 0],
  [0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 11, 0, 0],
  [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 0, 0],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 0, 0],
  [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 12, 0, 0],
  [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 12, 11, 0, 0],
  [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 12, 11, 10, 0, 0],
  [0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 12, 11, 10, 9, 0, 0],
  [0, 6, 7, 8, 9, 10, 11, 12, 13, 12, 11, 10, 9, 8, 0, 0],
  [0, 7, 8, 9, 10, 11, 12, 13, 12, 11, 10, 9, 8, 7, 0, 0],
  [0, 8, 9, 10, 11, 12, 13, 12, 11, 10, 9, 8, 7, 6, 0, 0],
  [0, 9, 10, 11, 12, 13, 12, 11, 10, 9, 8, 7, 6, 5, 0, 0],
  [0, 10, 11, 12, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 0, 0],
  [0, 11, 12, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 0, 0],
  [0, 12, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 0, 0],
  [0, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0],
  [0, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 2, 0, 0],
  [0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3, 0, 0],
  [0, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 0, 0],
  [0, 9, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 0, 0],
  [0, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 0, 0],
  [0, 7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 7, 0, 0],
  [0, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0],
  [0, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0],
  [0, 4, 3, 2, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0, 0],
  [0, 3, 2, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 0],
  [0, 2, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 0, 0],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 0, 0],
  [0, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0],
  [0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0],
  [0, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0],
  [0, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0],
  [0, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

/** 1:1 `CB2_BeginEvolutionScene` (:150-154). */
function CB2_BeginEvolutionScene(): void {
  const rt = _rt();
  rt.UpdatePaletteFade();
  rt.runTasks();
}

// 1:1 defines task data (:156-169).
// tState=data[0] · tPreEvoSpecies=data[1] · tPostEvoSpecies=data[2] · tCanStop/tBits=data[3]
// tLearnsFirstMove=data[4] · tLearnMoveState=data[6] · tLearnMoveYesState=data[7]
// tLearnMoveNoState=data[8] · tEvoWasStopped=data[9] · tPartyId=data[10]
const TASK_BIT_CAN_STOP = 1 << 0;
const TASK_BIT_LEARN_MOVE = 1 << 7;

/** 1:1 `Task_BeginEvolutionScene` (:171-197). */
function Task_BeginEvolutionScene(taskId: number): void {
  const data = _task(taskId).data;
  switch (data[0]) {
    case 0:
      BeginNormalPaletteFade(0xFFFFFFFF /* PALETTES_ALL */, 0, 0, 0x10, 0x0000 /* RGB_BLACK */);
      data[0]++;
      break;
    case 1:
      if (!_rt().gPaletteFade.active) {
        const postEvoSpecies = data[2];
        const canStopEvo = data[3];
        const partyId = data[10];
        const mon = gPlayerParty[partyId];
        DestroyTask(taskId);
        EvolutionScene(mon, postEvoSpecies, !!canStopEvo, partyId);
      }
      break;
  }
}

/** 1:1 `BeginEvolutionScene(mon, postEvoSpecies, canStopEvo, partyId)` (:199-207).
 *  Entrée FIELD (party_menu Rare Candy / pierre évolution). */
export function BeginEvolutionScene(_mon: Pokemon, postEvoSpecies: number, canStopEvo: boolean, partyId: number): void {
  const taskId = _createTask(Task_BeginEvolutionScene, 0);
  const data = _task(taskId).data;
  data[0] = 0;
  data[2] = postEvoSpecies;
  data[3] = canStopEvo ? 1 : 0;
  data[10] = partyId;
  _rt().SetMainCallback2(CB2_BeginEvolutionScene);
}

/** Charge front pic + palette d'un mon dans gMonSpritesGfxPtr (= 1:1
 *  DecompressPicFromTable_2(gMonFrontPicTable[species]) → sprites.ptr[position] +
 *  GetMonSpritePalStructFromOtIdPersonality → LoadCompressedPalette OBJ_PLTT_ID(palSlot)).
 *  Shiny 1:1 : GET_SHINY_VALUE(otId, personality) < SHINY_ODDS → shiny.pal. */
async function _loadEvoMonGfx(species: number, trainerId: number, personality: number,
  position: number, palSlot: number): Promise<void> {
  const enumName = reverseDecompConstant(species, 'SPECIES_');
  if (!enumName) { console.warn('[evolution_scene] species inconnue', species); return; }
  const folder = enumName.replace(/^SPECIES_/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  gMonSpritesGfxPtr.sprites.ptr[position] =
    await loadTileBin(`/decomp/em/pokemon/${folder}/anim_front.png`, 4);
  const palFile = GET_SHINY_VALUE(trainerId >>> 0, personality >>> 0) < SHINY_ODDS ? 'shiny.pal' : 'normal.pal';
  const pal = await loadGbaPal(`/decomp/em/pokemon/${folder}/${palFile}`);
  LoadPalette(pal, OBJ_PLTT_ID(palSlot), 32 /* PLTT_SIZE_4BPP */);
}

/** Crée le sprite front-pic évolution (= 1:1 SetMultiuseSpriteTemplateToPokemon +
 *  CreateSprite(&gMultiuseSpriteTemplate, 120, 64, 30) avec affineAnims REMPLACÉES
 *  par gDummySpriteAffineAnimTable — pas d'anim affine d'apparition). Template
 *  INLINE plateforme (oam battle sprite : shape0/size3/priority2). 2 frames
 *  uploadées si dispo (anim front 2-frame de DoMonFrontSpriteAnimation). */
function _createEvoMonSprite(position: number, palNum: number): number {
  const tiles = gMonSpritesGfxPtr.sprites.ptr[position];
  if (!tiles) { console.warn('[evolution_scene] tiles absentes pour position', position); return 64; }
  const twoFrames = tiles.length >= MON_PIC_SIZE * 2;
  const frame0 = twoFrames ? tiles.subarray(0, MON_PIC_SIZE * 2) : tiles.subarray(0, MON_PIC_SIZE);
  const spriteId = CreateSprite({
    oam: { shape: 0, size: 3, priority: 2, paletteNum: palNum, affineMode: 0 },
    images: [{ data: frame0, size: frame0.length }],
    // 1:1 gSprites[id].callback = SpriteCallbackDummy_2 (posé par le caller) —
    // vide (battle_main.c:2706) ⟺ null plateforme ; DoMonFrontSpriteAnimation le remplace.
    callback: null,
  }, 120, 64, 30);
  return spriteId;
}

/** 1:1 `EvolutionScene(mon, postEvoSpecies, canStopEvo, partyId)` (:209-309).
 *  Entrée COMBAT directe (TryEvolvePokemon) + relais de Task_BeginEvolutionScene.
 *  Wrapper sync → impl async (chargements assets pipeline), CB2 posé à la fin. */
export function EvolutionScene(mon: Pokemon, postEvoSpecies: number, canStopEvo: boolean, partyId: number): void {
  void _EvolutionSceneImpl(mon, postEvoSpecies, canStopEvo, partyId)
    .catch((e) => console.error('[evolution_scene] EvolutionScene setup failed', e));
}

async function _EvolutionSceneImpl(mon: Pokemon, postEvoSpecies: number, canStopEvo: boolean, partyId: number): Promise<void> {
  const rt = _rt();

  rt.SetVBlankCallback(null);
  // CpuFill32(0, VRAM, VRAM_SIZE) + SetGpuReg MOSAIC/WIN* = reset vidéo.
  rt.SetGpuReg(REG_OFFSET_MOSAIC, 0);
  rt.SetGpuReg(REG_OFFSET_WIN0H, 0);
  rt.SetGpuReg(REG_OFFSET_WIN0V, 0);
  rt.SetGpuReg(REG_OFFSET_WIN1H, 0);
  rt.SetGpuReg(REG_OFFSET_WIN1V, 0);
  rt.SetGpuReg(REG_OFFSET_WININ, 0);
  rt.SetGpuReg(REG_OFFSET_WINOUT, 0);

  ResetPaletteFade();

  _setBg('gBattle_BG0_X', 0); _setBg('gBattle_BG0_Y', 0);
  _setBg('gBattle_BG1_X', 0); _setBg('gBattle_BG1_Y', 0);
  _setBg('gBattle_BG2_X', 0); _setBg('gBattle_BG2_Y', 0);
  _setBg('gBattle_BG3_X', 256); _setBg('gBattle_BG3_Y', 0);

  // 1:1 gBattleEnvironment = BATTLE_ENVIRONMENT_PLAIN ; InitBattleBgsVideo() ;
  // LoadBattleTextboxAndBackground() — battleInitVideo1to1 = même chaîne (CpuFill32
  // VRAM inclus), env PLAIN (9).
  await battleInitVideo1to1(9 /* BATTLE_ENVIRONMENT_PLAIN */);
  ResetSpriteData();
  ScanlineEffect_Stop();
  ResetTasks();
  FreeAllSpritePalettes();

  setReservedSpritePaletteCount(4);  // 1:1 gReservedSpritePaletteCount = 4

  sEvoStructPtr = {
    preEvoSpriteId: 0, postEvoSpriteId: 0, evoTaskId: 0, delayTimer: 0,
    savedPalette: new Uint16Array(48),
  };
  AllocateMonSpritesGfx();

  // 1:1 :254-256 : gStringVar1 = surnom ; gStringVar2 = nom d'espèce post-évo.
  const name = encodeOwText(GetMonData(mon, MON_DATA_NICKNAME) as string);
  StringCopy_Nickname(gStringVar1, name);
  StringCopy(gStringVar2, encodeOwText(gSpeciesNames[postEvoSpecies] ?? ''));

  // preEvo sprite (:258-274).
  const currSpecies = GetMonData(mon, MON_DATA_SPECIES) as number;
  const trainerId = GetMonData(mon, MON_DATA_OT_ID) as number;
  const personality = GetMonData(mon, MON_DATA_PERSONALITY) as number;
  await _loadEvoMonGfx(currSpecies, trainerId, personality, 1 /* B_POSITION_OPPONENT_LEFT */, 1);
  let id = _createEvoMonSprite(1, 1);
  sEvoStructPtr.preEvoSpriteId = id;
  {
    const s = rt.gSprites[id];
    if (s) { s.callback = SpriteCallbackDummy_2 as unknown as typeof s.callback; s.invisible = true; }
  }

  // postEvo sprite (:276-288).
  await _loadEvoMonGfx(postEvoSpecies, trainerId, personality, 3 /* B_POSITION_OPPONENT_RIGHT */, 2);
  id = _createEvoMonSprite(3, 2);
  sEvoStructPtr.postEvoSpriteId = id;
  {
    const s = rt.gSprites[id];
    if (s) { s.callback = SpriteCallbackDummy_2 as unknown as typeof s.callback; s.invisible = true; }
  }

  await LoadEvoSparkleSpriteAndPal();
  await _loadEvoBgAssets();  // plateforme : pré-fetch du fond animé (StartBgAnimation est sync)

  // Task principale (:292-299).
  id = _createTask(Task_EvolutionScene, 0);
  sEvoStructPtr.evoTaskId = id;
  const data = _task(id).data;
  data[0] = 0;              // tState = EVOSTATE_FADE_IN
  data[1] = currSpecies;    // tPreEvoSpecies
  data[2] = postEvoSpecies; // tPostEvoSpecies
  data[3] = canStopEvo ? TASK_BIT_CAN_STOP : 0;  // tCanStop
  data[4] = 1;              // tLearnsFirstMove = TRUE
  data[9] = 0;              // tEvoWasStopped = FALSE
  data[10] = partyId;       // tPartyId

  // 1:1 :301 memcpy(savedPalette, &gPlttBufferUnfaded[BG_PLTT_ID(2)], 96 bytes).
  for (let i = 0; i < 48; i++)
    sEvoStructPtr.savedPalette[i] = rt.gPlttBufferUnfaded.get(32 + i);

  rt.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_BG_ALL_ON | DISPCNT_OBJ_1D_MAP);

  // SetHBlankCallback(EvoDummyFunc) : pas de HBlank plateforme (EvoDummyFunc = vide).
  rt.SetVBlankCallback(VBlankCB_EvolutionScene);
  m4aMPlayAllStop();
  rt.SetMainCallback2(CB2_EvolutionSceneUpdate);
}

/** Fenêtre de handoff summary : le décomp ShowSelectMovePokemonSummaryScreen change
 *  gMain.callback2 SYNCHRONEMENT ; notre summary s'ouvre en ASYNC (_loadAssets →
 *  SetMainCallback2). Pendant ces frames, callback2 est ENCORE CB2_*SceneUpdate et
 *  gPaletteFade inactif → sans ce flag, MVSTATE_HANDLE_MOVE_SELECT s'exécutait
 *  IMMÉDIATEMENT avec GetMoveSlotToReplace()=0 (défaut) → slot 0 écrasé SANS choix
 *  (bug attrapé en jeu 2026-07-02 : Écras'Face perdu avant l'ouverture du summary). */
let _summaryHandoffPending = false;

/** 1:1 `CB2_EvolutionSceneLoadGraphics` (:311-380) — callback de retour du summary
 *  select-move : recharge le fond + le sprite post-évo. Tické par le runtime →
 *  garde one-shot (l'impl async tourne une fois, pose CB2_EvolutionSceneUpdate). */
let _loadGraphicsPending = false;
function CB2_EvolutionSceneLoadGraphics(): void {
  if (_loadGraphicsPending) return;
  _loadGraphicsPending = true;
  void _CB2_EvolutionSceneLoadGraphicsImpl()
    .catch((e) => console.error('[evolution_scene] LoadGraphics failed', e))
    .finally(() => { _loadGraphicsPending = false; });
}

async function _CB2_EvolutionSceneLoadGraphicsImpl(): Promise<void> {
  const rt = _rt();
  if (!sEvoStructPtr) return;
  const evoTask = _task(sEvoStructPtr.evoTaskId);
  const mon = gPlayerParty[evoTask.data[10]];
  const postEvoSpecies = evoTask.data[2];
  const trainerId = GetMonData(mon, MON_DATA_OT_ID) as number;
  const personality = GetMonData(mon, MON_DATA_PERSONALITY) as number;

  rt.SetVBlankCallback(null);
  rt.SetGpuReg(REG_OFFSET_MOSAIC, 0);
  rt.SetGpuReg(REG_OFFSET_WIN0H, 0);
  rt.SetGpuReg(REG_OFFSET_WIN0V, 0);
  rt.SetGpuReg(REG_OFFSET_WIN1H, 0);
  rt.SetGpuReg(REG_OFFSET_WIN1V, 0);
  rt.SetGpuReg(REG_OFFSET_WININ, 0);
  rt.SetGpuReg(REG_OFFSET_WINOUT, 0);

  ResetPaletteFade();

  _setBg('gBattle_BG0_X', 0); _setBg('gBattle_BG0_Y', 0);
  _setBg('gBattle_BG1_X', 0); _setBg('gBattle_BG1_Y', 0);
  _setBg('gBattle_BG2_X', 0); _setBg('gBattle_BG2_Y', 0);
  _setBg('gBattle_BG3_X', 256); _setBg('gBattle_BG3_Y', 0);

  await battleInitVideo1to1(9 /* BATTLE_ENVIRONMENT_PLAIN */);
  ResetSpriteData();
  FreeAllSpritePalettes();
  setReservedSpritePaletteCount(4);

  await _loadEvoMonGfx(postEvoSpecies, trainerId, personality, 3 /* B_POSITION_OPPONENT_RIGHT */, 2);
  const id = _createEvoMonSprite(3, 2);
  sEvoStructPtr.postEvoSpriteId = id;
  {
    const s = rt.gSprites[id];
    if (s) s.callback = SpriteCallbackDummy_2 as unknown as typeof s.callback;
  }

  rt.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_BG_ALL_ON | DISPCNT_OBJ_1D_MAP);
  rt.SetVBlankCallback(VBlankCB_EvolutionScene);
  rt.SetMainCallback2(CB2_EvolutionSceneUpdate);

  BeginNormalPaletteFade(0xFFFFFFFF, 0, 0x10, 0, 0x0000 /* RGB_BLACK */);

  ShowBg(0);
  ShowBg(1);
  ShowBg(2);
  ShowBg(3);
}

/** 1:1 `CB2_TradeEvolutionSceneLoadGraphics` (:382-466) — path TRADE (link, P4).
 *  Transcrit ; les callees trade.c fail-fast au premier tick (0 caller vivant). */
function CB2_TradeEvolutionSceneLoadGraphics(): void {
  const rt = _rt();
  if (!sEvoStructPtr) return;
  const evoTask = _task(sEvoStructPtr.evoTaskId);
  const mon = gPlayerParty[evoTask.data[10]];
  const postEvoSpecies = evoTask.data[2];

  switch (rt.gMain.state) {
    case 0:
      rt.SetGpuReg(REG_OFFSET_DISPCNT, 0);
      rt.SetVBlankCallback(null);
      ResetSpriteData();
      FreeAllSpritePalettes();
      setReservedSpritePaletteCount(4);
      _setBg('gBattle_BG0_X', 0); _setBg('gBattle_BG0_Y', 0);
      _setBg('gBattle_BG1_X', 0); _setBg('gBattle_BG1_Y', 0);
      _setBg('gBattle_BG2_X', 0); _setBg('gBattle_BG2_Y', 0);
      _setBg('gBattle_BG3_X', 256); _setBg('gBattle_BG3_Y', 0);
      rt.gMain.state++;
      break;
    case 1:
      ResetPaletteFade();
      rt.SetVBlankCallback(VBlankCB_TradeEvolutionScene);
      rt.gMain.state++;
      break;
    case 2:
      LoadTradeAnimGfx();
      rt.gMain.state++;
      break;
    case 3:
      FillBgTilemapBufferRect(1, 0, 0, 0, 0x20, 0x20, 0x11);
      CopyBgTilemapBufferToVram(1);
      rt.gMain.state++;
      break;
    case 4: {
      const trainerId = GetMonData(mon, MON_DATA_OT_ID) as number;
      const personality = GetMonData(mon, MON_DATA_PERSONALITY) as number;
      void _loadEvoMonGfx(postEvoSpecies, trainerId, personality, 3, 2);
      rt.gMain.state++;
      break;
    }
    case 5: {
      const id = _createEvoMonSprite(1 /* B_POSITION_OPPONENT_LEFT */, 2);
      sEvoStructPtr.postEvoSpriteId = id;
      const s = rt.gSprites[id];
      if (s) s.callback = SpriteCallbackDummy_2 as unknown as typeof s.callback;
      rt.gMain.state++;
      LinkTradeDrawWindow();
      break;
    }
    case 6:
      if (gWirelessCommType) {
        LoadWirelessStatusIndicatorSpriteGfx();
        CreateWirelessStatusIndicatorSprite(0, 0);
      }
      BlendPalettes(0xFFFFFFFF, 0x10, 0x0000 /* RGB_BLACK */);
      rt.gMain.state++;
      break;
    case 7:
      BeginNormalPaletteFade(0xFFFFFFFF, 0, 0x10, 0, 0x0000);
      InitTradeSequenceBgGpuRegs();
      ShowBg(0);
      ShowBg(1);
      rt.SetMainCallback2(CB2_TradeEvolutionSceneUpdate);
      rt.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_BG0_ON | (DISPCNT_BG0_ON << 1) | DISPCNT_OBJ_1D_MAP);
      break;
  }
}

/** 1:1 `TradeEvolutionScene(mon, postEvoSpecies, preEvoSpriteId, partyId)` (:468-528).
 *  Path TRADE (link, P4) — transcrit, inatteignable sans link trade. */
export function TradeEvolutionScene(mon: Pokemon, postEvoSpecies: number, preEvoSpriteId: number, partyId: number): void {
  void (async () => {
    const rt = _rt();
    const name = encodeOwText(GetMonData(mon, MON_DATA_NICKNAME) as string);
    StringCopy_Nickname(gStringVar1, name);
    StringCopy(gStringVar2, encodeOwText(gSpeciesNames[postEvoSpecies] ?? ''));

    // gAffineAnimsDisabled = TRUE : flag global anims affines (link trade) — non
    // modélisé (les anims affines du trade ne tournent pas chez nous).

    const currSpecies = GetMonData(mon, MON_DATA_SPECIES) as number;
    const personality = GetMonData(mon, MON_DATA_PERSONALITY) as number;
    const trainerId = GetMonData(mon, MON_DATA_OT_ID) as number;

    sEvoStructPtr = {
      preEvoSpriteId, postEvoSpriteId: 0, evoTaskId: 0, delayTimer: 0,
      savedPalette: new Uint16Array(48),
    };

    await _loadEvoMonGfx(postEvoSpecies, trainerId, personality, 1 /* B_POSITION_OPPONENT_LEFT */, 2);
    const id = _createEvoMonSprite(1, 2);
    sEvoStructPtr.postEvoSpriteId = id;
    {
      const s = rt.gSprites[id];
      if (s) { s.callback = SpriteCallbackDummy_2 as unknown as typeof s.callback; s.invisible = true; }
    }

    await LoadEvoSparkleSpriteAndPal();
    await _loadEvoBgAssets();

    const taskId = _createTask(Task_TradeEvolutionScene, 0);
    sEvoStructPtr.evoTaskId = taskId;
    const data = _task(taskId).data;
    data[0] = 0;
    data[1] = currSpecies;
    data[2] = postEvoSpecies;
    data[4] = 1;   // tLearnsFirstMove = TRUE
    data[9] = 0;   // tEvoWasStopped = FALSE
    data[10] = partyId;

    _setBg('gBattle_BG0_X', 0); _setBg('gBattle_BG0_Y', 0);
    _setBg('gBattle_BG1_X', 0); _setBg('gBattle_BG1_Y', 0);
    _setBg('gBattle_BG2_X', 0); _setBg('gBattle_BG2_Y', 0);
    _setBg('gBattle_BG3_X', 256); _setBg('gBattle_BG3_Y', 0);

    gTextFlags.useAlternateDownArrow = true;

    rt.SetVBlankCallback(VBlankCB_TradeEvolutionScene);
    rt.SetMainCallback2(CB2_TradeEvolutionSceneUpdate);
  })().catch((e) => console.error('[evolution_scene] TradeEvolutionScene setup failed', e));
}

/** 1:1 `CB2_EvolutionSceneUpdate` (:530-537). Nom décomp (≠ MainCB2_*) → tick
 *  EXPLICITE des 5 sous-systèmes, comme le .c (cf. pitfall CB2_WallClock). */
export function CB2_EvolutionSceneUpdate(): void {
  const rt = _rt();
  rt.animateSprites();
  rt.buildOamBuffer();
  RunTextPrinters();
  rt.UpdatePaletteFade();
  rt.runTasks();
}

/** 1:1 `CB2_TradeEvolutionSceneUpdate` (:539-546). */
function CB2_TradeEvolutionSceneUpdate(): void {
  const rt = _rt();
  rt.animateSprites();
  rt.buildOamBuffer();
  RunTextPrinters();
  rt.UpdatePaletteFade();
  rt.runTasks();
}

/** 1:1 `CreateShedinja(preEvoSpecies, mon)` (:548-583). */
function CreateShedinja(preEvoSpecies: number, mon: Pokemon): void {
  // 1:1 `gEvolutionTable[preEvoSpecies][0].method == EVO_LEVEL_NINJASK` — table
  // décodée evolutions.json (methods = mêmes noms EVO_*).
  const preEnum = reverseDecompConstant(preEvoSpecies, 'SPECIES_') ?? '';
  const evos = getEvolutions(preEnum);
  const partyCount = CalculatePlayerPartyCount();
  if (evos[0]?.method === 'EVO_LEVEL_NINJASK' && partyCount < PARTY_SIZE) {
    const shedinja = gPlayerParty[partyCount];
    const targetSpecies = (resolveDecompConstant(evos[1]?.target ?? '') as number | undefined) ?? 0;

    CopyMon(shedinja, mon);
    SetMonData(shedinja, MON_DATA_SPECIES, targetSpecies);
    SetMonData(shedinja, MON_DATA_NICKNAME, gSpeciesNames[targetSpecies] ?? '');
    SetMonData(shedinja, MON_DATA_HELD_ITEM, 0);
    SetMonData(shedinja, MON_DATA_MARKINGS, 0);
    SetMonData(shedinja, MON_DATA_ENCRYPT_SEPARATOR, 0);

    for (let i = MON_DATA_COOL_RIBBON; i < MON_DATA_COOL_RIBBON + CONTEST_CATEGORIES_COUNT; i++)
      SetMonData(shedinja, i, 0);
    for (let i = MON_DATA_CHAMPION_RIBBON; i <= MON_DATA_UNUSED_RIBBONS; i++)
      SetMonData(shedinja, i, 0);

    SetMonData(shedinja, MON_DATA_STATUS, 0);
    SetMonData(shedinja, MON_DATA_MAIL, MAIL_NONE);

    CalculateMonStats(shedinja);
    CalculatePlayerPartyCount();

    GetSetPokedexFlag(SpeciesToNationalPokedexNum(targetSpecies), FLAG_SET_SEEN);
    GetSetPokedexFlag(SpeciesToNationalPokedexNum(targetSpecies), FLAG_SET_CAUGHT);

    if ((GetMonData(shedinja, MON_DATA_SPECIES) as number) === SPECIES_SHEDINJA
        && (GetMonData(shedinja, MON_DATA_LANGUAGE) as number) === LANGUAGE_JAPANESE
        && (GetMonData(mon, MON_DATA_SPECIES) as number) === SPECIES_NINJASK)
      SetMonData(shedinja, MON_DATA_NICKNAME, sText_ShedinjaJapaneseName);
  }
}

// 1:1 enums states (:585-627).
const EVOSTATE_FADE_IN = 0;
const EVOSTATE_INTRO_MSG = 1;
const EVOSTATE_INTRO_MON_ANIM = 2;
const EVOSTATE_INTRO_SOUND = 3;
const EVOSTATE_START_MUSIC = 4;
const EVOSTATE_START_BG_AND_SPARKLE_SPIRAL = 5;
const EVOSTATE_SPARKLE_ARC = 6;
const EVOSTATE_CYCLE_MON_SPRITE = 7;
const EVOSTATE_WAIT_CYCLE_MON_SPRITE = 8;
const EVOSTATE_SPARKLE_CIRCLE = 9;
const EVOSTATE_SPARKLE_SPRAY = 10;
const EVOSTATE_EVO_SOUND = 11;
const EVOSTATE_RESTORE_SCREEN = 12;
const EVOSTATE_EVO_MON_ANIM = 13;
const EVOSTATE_SET_MON_EVOLVED = 14;
const EVOSTATE_TRY_LEARN_MOVE = 15;
const EVOSTATE_END = 16;
const EVOSTATE_CANCEL = 17;
const EVOSTATE_CANCEL_MON_ANIM = 18;
const EVOSTATE_CANCEL_MSG = 19;
const EVOSTATE_LEARNED_MOVE = 20;
const EVOSTATE_TRY_LEARN_ANOTHER_MOVE = 21;
const EVOSTATE_REPLACE_MOVE = 22;

const MVSTATE_INTRO_MSG_1 = 0;
const MVSTATE_INTRO_MSG_2 = 1;
const MVSTATE_INTRO_MSG_3 = 2;
const MVSTATE_PRINT_YES_NO = 3;
const MVSTATE_HANDLE_YES_NO = 4;
const MVSTATE_SHOW_MOVE_SELECT = 5;
const MVSTATE_HANDLE_MOVE_SELECT = 6;
const MVSTATE_FORGET_MSG_1 = 7;
const MVSTATE_FORGET_MSG_2 = 8;
const MVSTATE_LEARNED_MOVE = 9;
const MVSTATE_ASK_CANCEL = 10;
const MVSTATE_CANCEL = 11;
const MVSTATE_RETRY_AFTER_HM = 12;

// Constantes retour MonTryLearningNewMove (include/constants/pokemon.h).
const MOVE_NONE = 0;
const MON_HAS_MAX_MOVES = 0xFFFF;
const MON_ALREADY_KNOWS_MOVE = 0xFFFE;
const MAX_MON_MOVES = 4;
// Touches (gba/keys).
const A_BUTTON = 0x0001, B_BUTTON = 0x0002, DPAD_UP = 0x0040, DPAD_DOWN = 0x0080;
const MENU_B_PRESSED = -2;

// Task data de CycleEvolutionMonSprite : tEvoStopped = data[8] (:630).

/** 1:1 `Task_EvolutionScene` (:632-1036) — la state machine principale. */
function Task_EvolutionScene(taskId: number): void {
  const rt = _rt();
  const data = _task(taskId).data;
  const mon = gPlayerParty[data[10]];

  // check if B Button was held, so the evolution gets stopped (:637-647).
  if (rt.gMain.heldKeys === B_BUTTON
      && data[0] === EVOSTATE_WAIT_CYCLE_MON_SPRITE
      && _taskIsActive(getEvoGraphicsTaskId())
      && (data[3] & TASK_BIT_CAN_STOP)) {
    data[0] = EVOSTATE_CANCEL;
    _task(getEvoGraphicsTaskId()).data[8] = 1;  // tEvoStopped = TRUE
    StopBgAnimation();
    return;
  }

  switch (data[0]) {
    case EVOSTATE_FADE_IN:
      BeginNormalPaletteFade(0xFFFFFFFF, 0, 0x10, 0, 0x0000 /* RGB_BLACK */);
      if (sEvoStructPtr) {
        const s = rt.gSprites[sEvoStructPtr.preEvoSpriteId];
        if (s) s.invisible = false;
      }
      data[0]++;
      ShowBg(0);
      ShowBg(1);
      ShowBg(2);
      ShowBg(3);
      break;
    case EVOSTATE_INTRO_MSG:
      if (!rt.gPaletteFade.active) {
        StringExpandPlaceholders(gStringVar4, _gText('gText_PkmnIsEvolving'));
        BattlePutTextOnWindowBytes(gStringVar4, B_WIN_MSG);
        data[0]++;
      }
      break;
    case EVOSTATE_INTRO_MON_ANIM:
      if (!IsTextPrinterActive(0)) {
        if (sEvoStructPtr) EvoScene_DoMonAnimAndCry(sEvoStructPtr.preEvoSpriteId, data[1]);
        data[0]++;
      }
      break;
    case EVOSTATE_INTRO_SOUND:
      if (sEvoStructPtr && EvoScene_IsMonAnimFinished(sEvoStructPtr.preEvoSpriteId)) {
        PlaySE(MUS_EVOLUTION_INTRO);
        data[0]++;
      }
      break;
    case EVOSTATE_START_MUSIC:
      if (!IsSEPlaying()) {
        // Start music, fade background to black
        PlayNewMapMusic(MUS_EVOLUTION);
        data[0]++;
        BeginNormalPaletteFade(0x1C, 4, 0, 0x10, 0x0000 /* RGB_BLACK */);
      }
      break;
    case EVOSTATE_START_BG_AND_SPARKLE_SPIRAL:
      if (!rt.gPaletteFade.active) {
        StartBgAnimation(false);
        setEvoGraphicsTaskId(EvolutionSparkles_SpiralUpward(17));
        data[0]++;
      }
      break;
    case EVOSTATE_SPARKLE_ARC:
      if (!_taskIsActive(getEvoGraphicsTaskId())) {
        data[0]++;
        if (sEvoStructPtr) sEvoStructPtr.delayTimer = 1;
        setEvoGraphicsTaskId(EvolutionSparkles_ArcDown());
      }
      break;
    case EVOSTATE_CYCLE_MON_SPRITE: // launch task that flashes pre evo with post evo sprites
      if (!_taskIsActive(getEvoGraphicsTaskId())) {
        if (sEvoStructPtr)
          setEvoGraphicsTaskId(CycleEvolutionMonSprite(sEvoStructPtr.preEvoSpriteId, sEvoStructPtr.postEvoSpriteId));
        data[0]++;
      }
      break;
    case EVOSTATE_WAIT_CYCLE_MON_SPRITE:
      if (sEvoStructPtr && --sEvoStructPtr.delayTimer === 0) {
        sEvoStructPtr.delayTimer = 3;
        if (!_taskIsActive(getEvoGraphicsTaskId()))
          data[0]++;
      }
      break;
    case EVOSTATE_SPARKLE_CIRCLE:
      setEvoGraphicsTaskId(EvolutionSparkles_CircleInward());
      data[0]++;
      break;
    case EVOSTATE_SPARKLE_SPRAY:
      if (!_taskIsActive(getEvoGraphicsTaskId())) {
        setEvoGraphicsTaskId(EvolutionSparkles_SprayAndFlash(data[2]));
        data[0]++;
      }
      break;
    case EVOSTATE_EVO_SOUND:
      if (!_taskIsActive(getEvoGraphicsTaskId())) {
        PlaySE(SE_EXP);
        data[0]++;
      }
      break;
    case EVOSTATE_RESTORE_SCREEN: // stop music, return screen to pre-fade state
      if (IsSEPlaying()) {
        m4aMPlayAllStop();
        if (sEvoStructPtr) {
          for (let i = 0; i < 48; i++)
            rt.gPlttBufferUnfaded.set(32 + i, sEvoStructPtr.savedPalette[i]);
        }
        RestoreBgAfterAnim();
        BeginNormalPaletteFade(0x1C, 0, 0x10, 0, 0x0000);
        data[0]++;
      }
      break;
    case EVOSTATE_EVO_MON_ANIM:
      if (!rt.gPaletteFade.active) {
        if (sEvoStructPtr) EvoScene_DoMonAnimAndCry(sEvoStructPtr.postEvoSpriteId, data[2]);
        data[0]++;
      }
      break;
    case EVOSTATE_SET_MON_EVOLVED:
      if (IsCryFinished()) {
        StringExpandPlaceholders(gStringVar4, _gText('gText_CongratsPkmnEvolved'));
        BattlePutTextOnWindowBytes(gStringVar4, B_WIN_MSG);
        PlayBGM(MUS_EVOLVED);
        data[0]++;
        SetMonData(mon, MON_DATA_SPECIES, data[2]);
        CalculateMonStats(mon);
        EvolutionRenameMon(mon, data[1], data[2]);
        GetSetPokedexFlag(SpeciesToNationalPokedexNum(data[2]), FLAG_SET_SEEN);
        GetSetPokedexFlag(SpeciesToNationalPokedexNum(data[2]), FLAG_SET_CAUGHT);
        IncrementGameStat(GAME_STAT_EVOLVED_POKEMON);
      }
      break;
    case EVOSTATE_TRY_LEARN_MOVE:
      if (!IsTextPrinterActive(0)) {
        const learnedMove = MonTryLearningNewMove(mon, !!data[4]);
        if (learnedMove !== MOVE_NONE && !data[9] /* !tEvoWasStopped */) {
          if (!(data[3] & TASK_BIT_LEARN_MOVE)) {
            StopMapMusic();
            Overworld_PlaySpecialMapMusic();
          }

          data[3] |= TASK_BIT_LEARN_MOVE;
          data[4] = 0;  // tLearnsFirstMove = FALSE
          data[6] = MVSTATE_INTRO_MSG_1;
          const nickname = encodeOwText(GetMonData(mon, MON_DATA_NICKNAME) as string);
          gBattleTextBuff1.fill(0);
          StringCopy_Nickname(gBattleTextBuff1, nickname);

          if (learnedMove === MON_HAS_MAX_MOVES)
            data[0] = EVOSTATE_REPLACE_MOVE;
          else if (learnedMove === MON_ALREADY_KNOWS_MOVE)
            break;
          else
            data[0] = EVOSTATE_LEARNED_MOVE;
        } else { // no move to learn, or evolution was canceled
          BeginNormalPaletteFade(0xFFFFFFFF, 0, 0, 0x10, 0x0000);
          data[0]++;
        }
      }
      break;
    case EVOSTATE_END:
      if (!rt.gPaletteFade.active) {
        if (!(data[3] & TASK_BIT_LEARN_MOVE)) {
          StopMapMusic();
          Overworld_PlaySpecialMapMusic();
        }
        if (!data[9] /* !tEvoWasStopped */)
          CreateShedinja(data[1], mon);

        DestroyTask(taskId);
        FreeMonSpritesGfx();
        sEvoStructPtr = null;  // FREE_AND_SET_NULL
        FreeAllWindowBuffers();
        rt.SetMainCallback2(gCB2_AfterEvolution as unknown as Parameters<typeof rt.SetMainCallback2>[0]);
      }
      break;
    case EVOSTATE_CANCEL:
      if (!_taskIsActive(getEvoGraphicsTaskId())) {
        m4aMPlayAllStop();
        BeginNormalPaletteFade(0x6001C, 0, 0x10, 0, 0x7FFF /* RGB_WHITE */);
        data[0]++;
      }
      break;
    case EVOSTATE_CANCEL_MON_ANIM:
      if (!rt.gPaletteFade.active) {
        if (sEvoStructPtr) EvoScene_DoMonAnimAndCry(sEvoStructPtr.preEvoSpriteId, data[1]);
        data[0]++;
      }
      break;
    case EVOSTATE_CANCEL_MSG:
      if (sEvoStructPtr && EvoScene_IsMonAnimFinished(sEvoStructPtr.preEvoSpriteId)) {
        if (data[9]) // tEvoWasStopped — FRLG auto cancellation
          StringExpandPlaceholders(gStringVar4, _gText('gText_EllipsisQuestionMark'));
        else
          StringExpandPlaceholders(gStringVar4, _gText('gText_PkmnStoppedEvolving'));

        BattlePutTextOnWindowBytes(gStringVar4, B_WIN_MSG);
        data[9] = 1;  // tEvoWasStopped = TRUE
        data[0] = EVOSTATE_TRY_LEARN_MOVE;
      }
      break;
    case EVOSTATE_LEARNED_MOVE:
      if (!IsTextPrinterActive(0) && !IsSEPlaying()) {
        BufferMoveToLearnIntoBattleTextBuff2();
        PlayFanfare(MUS_LEVEL_UP);
        BattleStringExpandPlaceholdersToDisplayedString(STRINGID_PKMNLEARNEDMOVE);
        BattlePutTextOnWindowBytes(gDisplayedStringBattle, B_WIN_MSG);
        data[4] = 0x40; // tLearnsFirstMove re-used as a counter
        data[0]++;
      }
      break;
    case EVOSTATE_TRY_LEARN_ANOTHER_MOVE:
      if (!IsTextPrinterActive(0) && !IsSEPlaying() && --data[4] === 0)
        data[0] = EVOSTATE_TRY_LEARN_MOVE;
      break;
    case EVOSTATE_REPLACE_MOVE:
      switch (data[6]) {
        case MVSTATE_INTRO_MSG_1:
          if (!IsTextPrinterActive(0) && !IsSEPlaying()) {
            // "{mon} is trying to learn {move}"
            BufferMoveToLearnIntoBattleTextBuff2();
            BattleStringExpandPlaceholdersToDisplayedString(STRINGID_TRYTOLEARNMOVE1);
            BattlePutTextOnWindowBytes(gDisplayedStringBattle, B_WIN_MSG);
            data[6]++;
          }
          break;
        case MVSTATE_INTRO_MSG_2:
          if (!IsTextPrinterActive(0) && !IsSEPlaying()) {
            // "But, {mon} can't learn more than four moves"
            BattleStringExpandPlaceholdersToDisplayedString(STRINGID_TRYTOLEARNMOVE2);
            BattlePutTextOnWindowBytes(gDisplayedStringBattle, B_WIN_MSG);
            data[6]++;
          }
          break;
        case MVSTATE_INTRO_MSG_3:
          if (!IsTextPrinterActive(0) && !IsSEPlaying()) {
            // "Delete a move to make room for {move}?"
            BattleStringExpandPlaceholdersToDisplayedString(STRINGID_TRYTOLEARNMOVE3);
            BattlePutTextOnWindowBytes(gDisplayedStringBattle, B_WIN_MSG);
            data[7] = MVSTATE_SHOW_MOVE_SELECT;  // tLearnMoveYesState
            data[8] = MVSTATE_ASK_CANCEL;        // tLearnMoveNoState
            data[6]++;
          }
          // 1:1 décomp :888-897 : PAS de break — fallthrough vers PRINT_YES_NO
          // (le yes/no s'imprime la MÊME frame que la fin du message 3).
          // eslint-disable-next-line no-fallthrough
        case MVSTATE_PRINT_YES_NO:
          if (!IsTextPrinterActive(0) && !IsSEPlaying()) {
            HandleBattleWindow(...YESNOBOX_X_Y, 0);
            // 1:1 gText_BattleYesNoChoice (battle_message.c:1283) — codes
            // PALETTE/COLOR dynamiques = dette douce (pattern battle_script_commands).
            BattlePutTextOnWindow('OUI' + String.fromCharCode(10) + 'NON', B_WIN_YESNO);
            data[6]++;
            setEvoCursorPos(0);
            BattleCreateYesNoCursorAt(0);
          }
          break;
        case MVSTATE_HANDLE_YES_NO: {
          // This Yes/No is used for both the initial "delete move?" prompt
          // and for the "stop learning move?" prompt
          // What Yes/No do next is determined by tLearnMoveYesState / tLearnMoveNoState
          const newKeys = rt.gMain.newKeys;
          if ((newKeys & DPAD_UP) && getEvoCursorPos() !== 0) {
            // Moved onto YES
            PlaySE(SE_SELECT);
            BattleDestroyYesNoCursorAt(getEvoCursorPos());
            setEvoCursorPos(0);
            BattleCreateYesNoCursorAt(0);
          }
          if ((newKeys & DPAD_DOWN) && getEvoCursorPos() === 0) {
            // Moved onto NO
            PlaySE(SE_SELECT);
            BattleDestroyYesNoCursorAt(getEvoCursorPos());
            setEvoCursorPos(1);
            BattleCreateYesNoCursorAt(1);
          }
          if (newKeys & A_BUTTON) {
            HandleBattleWindow(...YESNOBOX_X_Y, WINDOW_CLEAR);
            PlaySE(SE_SELECT);
            if (getEvoCursorPos() !== 0) {
              // NO
              data[6] = data[8];
            } else {
              // YES
              data[6] = data[7];
              if (data[6] === MVSTATE_SHOW_MOVE_SELECT)
                BeginNormalPaletteFade(0xFFFFFFFF, 0, 0, 0x10, 0x0000);
            }
          }
          if (newKeys & B_BUTTON) {
            // Equivalent to selecting NO
            HandleBattleWindow(...YESNOBOX_X_Y, WINDOW_CLEAR);
            PlaySE(SE_SELECT);
            data[6] = data[8];
          }
          break;
        }
        case MVSTATE_SHOW_MOVE_SELECT:
          if (!rt.gPaletteFade.active) {
            FreeAllWindowBuffers();
            _summaryHandoffPending = true;  // cf. doc du flag (ouverture summary ASYNC)
            ShowSelectMovePokemonSummaryScreen(gPlayerParty, data[10],
              CalculatePlayerPartyCount() - 1, CB2_EvolutionSceneLoadGraphics,
              reverseDecompConstant(gMoveToLearn, 'MOVE_') ?? '');
            data[6]++;
          }
          break;
        case MVSTATE_HANDLE_MOVE_SELECT:
          if (_summaryHandoffPending) {
            // Fenêtre async : attendre que le summary PRENNE la main (callback2
            // quitte CB2_EvolutionSceneUpdate) avant d'armer le check décomp.
            if (rt.gMain.callback2 !== (CB2_EvolutionSceneUpdate as unknown)) _summaryHandoffPending = false;
            break;
          }
          if (!rt.gPaletteFade.active && rt.gMain.callback2 === (CB2_EvolutionSceneUpdate as unknown)) {
            const slot = GetMoveSlotToReplace();
            if (slot === MAX_MON_MOVES) {
              // Didn't select move slot
              data[6] = MVSTATE_ASK_CANCEL;
            } else {
              // Selected move to forget
              const move = GetMonData(mon, slot + MON_DATA_MOVE1) as number;
              if (IsHMMove2(move)) {
                // Can't forget HMs
                BattleStringExpandPlaceholdersToDisplayedString(STRINGID_HMMOVESCANTBEFORGOTTEN);
                BattlePutTextOnWindowBytes(gDisplayedStringBattle, B_WIN_MSG);
                data[6] = MVSTATE_RETRY_AFTER_HM;
              } else {
                // Forget move — PREPARE_MOVE_BUFFER(gBattleTextBuff2, move)
                gBattleTextBuff2.fill(0);
                gBattleTextBuff2.set(buildMoveBuff(move));

                RemoveMonPPBonus(mon, slot);
                SetMonMoveSlot(mon, gMoveToLearn, slot);
                data[6]++;
              }
            }
          }
          break;
        case MVSTATE_FORGET_MSG_1:
          BattleStringExpandPlaceholdersToDisplayedString(STRINGID_123POOF);
          BattlePutTextOnWindowBytes(gDisplayedStringBattle, B_WIN_MSG);
          data[6]++;
          break;
        case MVSTATE_FORGET_MSG_2:
          if (!IsTextPrinterActive(0) && !IsSEPlaying()) {
            BattleStringExpandPlaceholdersToDisplayedString(STRINGID_PKMNFORGOTMOVE);
            BattlePutTextOnWindowBytes(gDisplayedStringBattle, B_WIN_MSG);
            data[6]++;
          }
          break;
        case MVSTATE_LEARNED_MOVE:
          if (!IsTextPrinterActive(0) && !IsSEPlaying()) {
            BattleStringExpandPlaceholdersToDisplayedString(STRINGID_ANDELLIPSIS);
            BattlePutTextOnWindowBytes(gDisplayedStringBattle, B_WIN_MSG);
            data[0] = EVOSTATE_LEARNED_MOVE;
          }
          break;
        case MVSTATE_ASK_CANCEL:
          BattleStringExpandPlaceholdersToDisplayedString(STRINGID_STOPLEARNINGMOVE);
          BattlePutTextOnWindowBytes(gDisplayedStringBattle, B_WIN_MSG);
          data[7] = MVSTATE_CANCEL;
          data[8] = MVSTATE_INTRO_MSG_1;
          data[6] = MVSTATE_PRINT_YES_NO;
          break;
        case MVSTATE_CANCEL:
          BattleStringExpandPlaceholdersToDisplayedString(STRINGID_DIDNOTLEARNMOVE);
          BattlePutTextOnWindowBytes(gDisplayedStringBattle, B_WIN_MSG);
          data[0] = EVOSTATE_TRY_LEARN_MOVE;
          break;
        case MVSTATE_RETRY_AFTER_HM:
          if (!IsTextPrinterActive(0) && !IsSEPlaying())
            data[6] = MVSTATE_SHOW_MOVE_SELECT;
          break;
      }
      break;
  }
}

// 1:1 enums trade states (:1038-1077).
const T_EVOSTATE_INTRO_MSG = 0;
const T_EVOSTATE_INTRO_CRY = 1;
const T_EVOSTATE_INTRO_SOUND = 2;
const T_EVOSTATE_START_MUSIC = 3;
const T_EVOSTATE_START_BG_AND_SPARKLE_SPIRAL = 4;
const T_EVOSTATE_SPARKLE_ARC = 5;
const T_EVOSTATE_CYCLE_MON_SPRITE = 6;
const T_EVOSTATE_WAIT_CYCLE_MON_SPRITE = 7;
const T_EVOSTATE_SPARKLE_CIRCLE = 8;
const T_EVOSTATE_SPARKLE_SPRAY = 9;
const T_EVOSTATE_EVO_SOUND = 10;
const T_EVOSTATE_EVO_MON_ANIM = 11;
const T_EVOSTATE_SET_MON_EVOLVED = 12;
const T_EVOSTATE_TRY_LEARN_MOVE = 13;
const T_EVOSTATE_END = 14;
const T_EVOSTATE_CANCEL = 15;
const T_EVOSTATE_CANCEL_MON_ANIM = 16;
const T_EVOSTATE_CANCEL_MSG = 17;
const T_EVOSTATE_LEARNED_MOVE = 18;
const T_EVOSTATE_TRY_LEARN_ANOTHER_MOVE = 19;
const T_EVOSTATE_REPLACE_MOVE = 20;
void T_EVOSTATE_INTRO_CRY; void T_EVOSTATE_INTRO_SOUND; void T_EVOSTATE_START_MUSIC;
void T_EVOSTATE_START_BG_AND_SPARKLE_SPIRAL; void T_EVOSTATE_SPARKLE_ARC;
void T_EVOSTATE_CYCLE_MON_SPRITE; void T_EVOSTATE_WAIT_CYCLE_MON_SPRITE;
void T_EVOSTATE_SPARKLE_CIRCLE; void T_EVOSTATE_SPARKLE_SPRAY; void T_EVOSTATE_EVO_SOUND;
void T_EVOSTATE_EVO_MON_ANIM; void T_EVOSTATE_SET_MON_EVOLVED; void T_EVOSTATE_END;
void T_EVOSTATE_CANCEL_MON_ANIM;

const T_MVSTATE_INTRO_MSG_1 = 0;
const T_MVSTATE_INTRO_MSG_2 = 1;
const T_MVSTATE_INTRO_MSG_3 = 2;
const T_MVSTATE_PRINT_YES_NO = 3;
const T_MVSTATE_HANDLE_YES_NO = 4;
const T_MVSTATE_SHOW_MOVE_SELECT = 5;
const T_MVSTATE_HANDLE_MOVE_SELECT = 6;
const T_MVSTATE_FORGET_MSG = 7;
const T_MVSTATE_LEARNED_MOVE = 8;
const T_MVSTATE_ASK_CANCEL = 9;
const T_MVSTATE_CANCEL = 10;
const T_MVSTATE_RETRY_AFTER_HM = 11;
void T_MVSTATE_INTRO_MSG_2; void T_MVSTATE_FORGET_MSG; void T_MVSTATE_LEARNED_MOVE;

/** 1:1 `Task_TradeEvolutionScene` (:1080-1415) — « Compare to Task_EvolutionScene,
 *  very similar ». Path TRADE (link, P4) : transcrit, DrawTextOnTradeWindow & co
 *  fail-fast (inatteignable sans link trade). */
function Task_TradeEvolutionScene(taskId: number): void {
  const rt = _rt();
  const data = _task(taskId).data;
  const mon = gPlayerParty[data[10]];

  switch (data[0]) {
    case T_EVOSTATE_INTRO_MSG:
      StringExpandPlaceholders(gStringVar4, _gText('gText_PkmnIsEvolving'));
      DrawTextOnTradeWindow(0, gStringVar4, 1);
      data[0]++;
      break;
    case T_EVOSTATE_INTRO_CRY:
      if (!IsTextPrinterActive(0)) {
        PlayCry_Normal(data[1], 0);
        data[0]++;
      }
      break;
    case T_EVOSTATE_INTRO_SOUND:
      if (IsCryFinished()) {
        // m4aSongNumStop(MUS_EVOLUTION) — notre slot BGM unique.
        StopMapMusic();
        PlaySE(MUS_EVOLUTION_INTRO);
        data[0]++;
      }
      break;
    case T_EVOSTATE_START_MUSIC:
      if (!IsSEPlaying()) {
        PlayBGM(MUS_EVOLUTION);
        data[0]++;
        BeginNormalPaletteFade(0x1C, 4, 0, 0x10, 0x0000);
      }
      break;
    case T_EVOSTATE_START_BG_AND_SPARKLE_SPIRAL:
      if (!rt.gPaletteFade.active) {
        StartBgAnimation(true);
        // var = paletteNum du sprite pré-évo + 16 (palette OBJ).
        const pre = sEvoStructPtr ? rt.gSprites[sEvoStructPtr.preEvoSpriteId] : undefined;
        const palNum = pre ? rt.gba.oam[pre.oamIndex]?.paletteBank ?? 0 : 0;
        setEvoGraphicsTaskId(EvolutionSparkles_SpiralUpward(palNum + 16));
        data[0]++;
        rt.SetGpuReg(REG_OFFSET_BG3CNT, (3 /* BGCNT_PRIORITY(3) */) | (6 << 8 /* BGCNT_SCREENBASE(6) */));
      }
      break;
    case T_EVOSTATE_SPARKLE_ARC:
      if (!_taskIsActive(getEvoGraphicsTaskId())) {
        data[0]++;
        if (sEvoStructPtr) sEvoStructPtr.delayTimer = 1;
        setEvoGraphicsTaskId(EvolutionSparkles_ArcDown());
      }
      break;
    case T_EVOSTATE_CYCLE_MON_SPRITE:
      if (!_taskIsActive(getEvoGraphicsTaskId())) {
        if (sEvoStructPtr)
          setEvoGraphicsTaskId(CycleEvolutionMonSprite(sEvoStructPtr.preEvoSpriteId, sEvoStructPtr.postEvoSpriteId));
        data[0]++;
      }
      break;
    case T_EVOSTATE_WAIT_CYCLE_MON_SPRITE:
      if (sEvoStructPtr && --sEvoStructPtr.delayTimer === 0) {
        sEvoStructPtr.delayTimer = 3;
        if (!_taskIsActive(getEvoGraphicsTaskId()))
          data[0]++;
      }
      break;
    case T_EVOSTATE_SPARKLE_CIRCLE:
      setEvoGraphicsTaskId(EvolutionSparkles_CircleInward());
      data[0]++;
      break;
    case T_EVOSTATE_SPARKLE_SPRAY:
      if (!_taskIsActive(getEvoGraphicsTaskId())) {
        setEvoGraphicsTaskId(EvolutionSparkles_SprayAndFlash_Trade(data[2]));
        data[0]++;
      }
      break;
    case T_EVOSTATE_EVO_SOUND:
      if (!_taskIsActive(getEvoGraphicsTaskId())) {
        PlaySE(SE_EXP);
        data[0]++;
      }
      break;
    case T_EVOSTATE_EVO_MON_ANIM:
      if (IsSEPlaying()) {
        // Restore bg, do mon anim/cry
        sBgAnimPal = null;  // Free(sBgAnimPal)
        if (sEvoStructPtr) {
          EvoScene_DoMonAnimAndCry(sEvoStructPtr.postEvoSpriteId, data[2]);
          for (let i = 0; i < 48; i++)
            rt.gPlttBufferUnfaded.set(32 + i, sEvoStructPtr.savedPalette[i]);
        }
        data[0]++;
      }
      break;
    case T_EVOSTATE_SET_MON_EVOLVED:
      if (IsCryFinished()) {
        StringExpandPlaceholders(gStringVar4, _gText('gText_CongratsPkmnEvolved'));
        DrawTextOnTradeWindow(0, gStringVar4, 1);
        PlayFanfare(MUS_EVOLVED);
        data[0]++;
        SetMonData(mon, MON_DATA_SPECIES, data[2]);
        CalculateMonStats(mon);
        EvolutionRenameMon(mon, data[1], data[2]);
        GetSetPokedexFlag(SpeciesToNationalPokedexNum(data[2]), FLAG_SET_SEEN);
        GetSetPokedexFlag(SpeciesToNationalPokedexNum(data[2]), FLAG_SET_CAUGHT);
        IncrementGameStat(GAME_STAT_EVOLVED_POKEMON);
      }
      break;
    case T_EVOSTATE_TRY_LEARN_MOVE:
      if (!IsTextPrinterActive(0) && IsFanfareTaskInactive() === true) {
        const learnedMove = MonTryLearningNewMove(mon, !!data[4]);
        if (learnedMove !== MOVE_NONE && !data[9]) {
          data[3] |= TASK_BIT_LEARN_MOVE;
          data[4] = 0;
          data[6] = 0;
          const nickname = encodeOwText(GetMonData(mon, MON_DATA_NICKNAME) as string);
          gBattleTextBuff1.fill(0);
          StringCopy_Nickname(gBattleTextBuff1, nickname);

          if (learnedMove === MON_HAS_MAX_MOVES)
            data[0] = T_EVOSTATE_REPLACE_MOVE;
          else if (learnedMove === MON_ALREADY_KNOWS_MOVE)
            break;
          else
            data[0] = T_EVOSTATE_LEARNED_MOVE;
        } else {
          PlayBGM(MUS_EVOLUTION);
          DrawTextOnTradeWindow(0, _gText('gText_CommunicationStandby5'), 1);
          data[0]++;
        }
      }
      break;
    case T_EVOSTATE_END:
      if (!IsTextPrinterActive(0)) {
        DestroyTask(taskId);
        sEvoStructPtr = null;  // FREE_AND_SET_NULL
        gTextFlags.useAlternateDownArrow = false;
        rt.SetMainCallback2(gCB2_AfterEvolution as unknown as Parameters<typeof rt.SetMainCallback2>[0]);
      }
      break;
    case T_EVOSTATE_CANCEL:
      if (!_taskIsActive(getEvoGraphicsTaskId())) {
        m4aMPlayAllStop();
        const pre = sEvoStructPtr ? rt.gSprites[sEvoStructPtr.preEvoSpriteId] : undefined;
        const palNum = pre ? rt.gba.oam[pre.oamIndex]?.paletteBank ?? 0 : 0;
        BeginNormalPaletteFade(((1 << (palNum + 16)) | 0x4001C) >>> 0, 0, 0x10, 0, 0x7FFF);
        data[0]++;
      }
      break;
    case T_EVOSTATE_CANCEL_MON_ANIM:
      if (!rt.gPaletteFade.active) {
        if (sEvoStructPtr) EvoScene_DoMonAnimAndCry(sEvoStructPtr.preEvoSpriteId, data[1]);
        data[0]++;
      }
      break;
    case T_EVOSTATE_CANCEL_MSG:
      if (sEvoStructPtr && EvoScene_IsMonAnimFinished(sEvoStructPtr.preEvoSpriteId)) {
        StringExpandPlaceholders(gStringVar4, _gText('gText_EllipsisQuestionMark'));
        DrawTextOnTradeWindow(0, gStringVar4, 1);
        data[9] = 1;
        data[0] = T_EVOSTATE_TRY_LEARN_MOVE;
      }
      break;
    case T_EVOSTATE_LEARNED_MOVE:
      if (!IsTextPrinterActive(0) && !IsSEPlaying()) {
        BufferMoveToLearnIntoBattleTextBuff2();
        PlayFanfare(MUS_LEVEL_UP);
        BattleStringExpandPlaceholdersToDisplayedString(STRINGID_PKMNLEARNEDMOVE);
        DrawTextOnTradeWindow(0, gDisplayedStringBattle, 1);
        data[4] = 0x40; // re-used as a counter
        data[0]++;
      }
      break;
    case T_EVOSTATE_TRY_LEARN_ANOTHER_MOVE:
      if (!IsTextPrinterActive(0) && IsFanfareTaskInactive() === true && --data[4] === 0)
        data[0] = T_EVOSTATE_TRY_LEARN_MOVE;
      break;
    case T_EVOSTATE_REPLACE_MOVE:
      switch (data[6]) {
        case T_MVSTATE_INTRO_MSG_1:
          if (!IsTextPrinterActive(0) && !IsSEPlaying()) {
            BufferMoveToLearnIntoBattleTextBuff2();
            BattleStringExpandPlaceholdersToDisplayedString(STRINGID_TRYTOLEARNMOVE1);
            DrawTextOnTradeWindow(0, gDisplayedStringBattle, 1);
            data[6]++;
          }
          break;
        case T_MVSTATE_INTRO_MSG_2:
          if (!IsTextPrinterActive(0) && !IsSEPlaying()) {
            BattleStringExpandPlaceholdersToDisplayedString(STRINGID_TRYTOLEARNMOVE2);
            DrawTextOnTradeWindow(0, gDisplayedStringBattle, 1);
            data[6]++;
          }
          break;
        case T_MVSTATE_INTRO_MSG_3:
          if (!IsTextPrinterActive(0) && !IsSEPlaying()) {
            BattleStringExpandPlaceholdersToDisplayedString(STRINGID_TRYTOLEARNMOVE3);
            DrawTextOnTradeWindow(0, gDisplayedStringBattle, 1);
            data[7] = T_MVSTATE_SHOW_MOVE_SELECT;
            data[8] = T_MVSTATE_ASK_CANCEL;
            data[6]++;
          }
          // 1:1 :1289-1298 : fallthrough (comme le path normal).
          // eslint-disable-next-line no-fallthrough
        case T_MVSTATE_PRINT_YES_NO:
          if (!IsTextPrinterActive(0) && !IsSEPlaying()) {
            LoadUserWindowBorderGfx(0, 0xA8, 14 * 16 /* BG_PLTT_ID(14) */);
            CreateYesNoMenu(gTradeEvolutionSceneYesNoWindowTemplate as never, 0xA8, 0xE, 0);
            setEvoCursorPos(0);
            data[6]++;
            setEvoCursorPos(0);
          }
          break;
        case T_MVSTATE_HANDLE_YES_NO:
          switch (Menu_ProcessInputNoWrapClearOnChoose()) {
            case 0: // YES
              setEvoCursorPos(0);
              BattleStringExpandPlaceholdersToDisplayedString(STRINGID_EMPTYSTRING3);
              DrawTextOnTradeWindow(0, gDisplayedStringBattle, 1);
              data[6] = data[7];
              if (data[6] === T_MVSTATE_SHOW_MOVE_SELECT)
                BeginNormalPaletteFade(0xFFFFFFFF, 0, 0, 0x10, 0x0000);
              break;
            case 1: // NO
            case MENU_B_PRESSED:
              setEvoCursorPos(1);
              BattleStringExpandPlaceholdersToDisplayedString(STRINGID_EMPTYSTRING3);
              DrawTextOnTradeWindow(0, gDisplayedStringBattle, 1);
              data[6] = data[8];
              break;
          }
          break;
        case T_MVSTATE_SHOW_MOVE_SELECT:
          if (!rt.gPaletteFade.active) {
            if (gWirelessCommType)
              DestroyWirelessStatusIndicatorSprite();
            void GetBgTilemapBuffer(3);  // Free(GetBgTilemapBuffer(3/1/0)) — buffers plateforme persistants
            void GetBgTilemapBuffer(1);
            void GetBgTilemapBuffer(0);
            FreeAllWindowBuffers();
            _summaryHandoffPending = true;  // cf. doc du flag (ouverture summary ASYNC)
            ShowSelectMovePokemonSummaryScreen(gPlayerParty, data[10],
              CalculatePlayerPartyCount() - 1, CB2_TradeEvolutionSceneLoadGraphics,
              reverseDecompConstant(gMoveToLearn, 'MOVE_') ?? '');
            data[6]++;
          }
          break;
        case T_MVSTATE_HANDLE_MOVE_SELECT:
          if (_summaryHandoffPending) {
            if (rt.gMain.callback2 !== (CB2_TradeEvolutionSceneUpdate as unknown)) _summaryHandoffPending = false;
            break;
          }
          if (!rt.gPaletteFade.active && rt.gMain.callback2 === (CB2_TradeEvolutionSceneUpdate as unknown)) {
            const slot = GetMoveSlotToReplace();
            if (slot === MAX_MON_MOVES) {
              data[6] = T_MVSTATE_ASK_CANCEL;
            } else {
              const move = GetMonData(mon, slot + MON_DATA_MOVE1) as number;
              if (IsHMMove2(move)) {
                BattleStringExpandPlaceholdersToDisplayedString(STRINGID_HMMOVESCANTBEFORGOTTEN);
                DrawTextOnTradeWindow(0, gDisplayedStringBattle, 1);
                data[6] = T_MVSTATE_RETRY_AFTER_HM;
              } else {
                gBattleTextBuff2.fill(0);
                gBattleTextBuff2.set(buildMoveBuff(move));
                RemoveMonPPBonus(mon, slot);
                SetMonMoveSlot(mon, gMoveToLearn, slot);
                BattleStringExpandPlaceholdersToDisplayedString(STRINGID_123POOF);
                DrawTextOnTradeWindow(0, gDisplayedStringBattle, 1);
                data[6]++;
              }
            }
          }
          break;
        case T_MVSTATE_FORGET_MSG:
          if (!IsTextPrinterActive(0) && !IsSEPlaying()) {
            BattleStringExpandPlaceholdersToDisplayedString(STRINGID_PKMNFORGOTMOVE);
            DrawTextOnTradeWindow(0, gDisplayedStringBattle, 1);
            data[6]++;
          }
          break;
        case T_MVSTATE_LEARNED_MOVE:
          if (!IsTextPrinterActive(0) && !IsSEPlaying()) {
            BattleStringExpandPlaceholdersToDisplayedString(STRINGID_ANDELLIPSIS);
            DrawTextOnTradeWindow(0, gDisplayedStringBattle, 1);
            data[0] = T_EVOSTATE_LEARNED_MOVE;
          }
          break;
        case T_MVSTATE_ASK_CANCEL:
          BattleStringExpandPlaceholdersToDisplayedString(STRINGID_STOPLEARNINGMOVE);
          DrawTextOnTradeWindow(0, gDisplayedStringBattle, 1);
          data[7] = T_MVSTATE_CANCEL;
          data[8] = T_MVSTATE_INTRO_MSG_1;
          data[6] = T_MVSTATE_PRINT_YES_NO;
          break;
        case T_MVSTATE_CANCEL:
          BattleStringExpandPlaceholdersToDisplayedString(STRINGID_DIDNOTLEARNMOVE);
          DrawTextOnTradeWindow(0, gDisplayedStringBattle, 1);
          data[0] = T_EVOSTATE_TRY_LEARN_MOVE;
          break;
        case T_MVSTATE_RETRY_AFTER_HM:
          if (!IsTextPrinterActive(0) && !IsSEPlaying())
            data[6] = T_MVSTATE_SHOW_MOVE_SELECT;
          break;
      }
      break;
  }
}

/** 1:1 `EvoDummyFunc` (:1429-1431) — HBlank vide. */
function EvoDummyFunc(): void {
}
void EvoDummyFunc;  // SetHBlankCallback : pas de HBlank plateforme (doc en-tête).

/** 1:1 `VBlankCB_EvolutionScene` (:1433-1448). LoadOam/ProcessSpriteCopyRequests/
 *  TransferPlttBuffer = automatiques (compositeur) ; le scroll reste 1:1. */
function VBlankCB_EvolutionScene(): void {
  const rt = _rt();
  rt.SetGpuReg(REG_OFFSET_BG0HOFS, _getBg('gBattle_BG0_X'));
  rt.SetGpuReg(REG_OFFSET_BG0VOFS, _getBg('gBattle_BG0_Y'));
  rt.SetGpuReg(REG_OFFSET_BG1HOFS, _getBg('gBattle_BG1_X'));
  rt.SetGpuReg(REG_OFFSET_BG1VOFS, _getBg('gBattle_BG1_Y'));
  rt.SetGpuReg(REG_OFFSET_BG2HOFS, _getBg('gBattle_BG2_X'));
  rt.SetGpuReg(REG_OFFSET_BG2VOFS, _getBg('gBattle_BG2_Y'));
  rt.SetGpuReg(REG_OFFSET_BG3HOFS, _getBg('gBattle_BG3_X'));
  rt.SetGpuReg(REG_OFFSET_BG3VOFS, _getBg('gBattle_BG3_Y'));
  ScanlineEffect_InitHBlankDmaTransfer();
}

/** 1:1 `VBlankCB_TradeEvolutionScene` (:1450-1465) — identique. */
function VBlankCB_TradeEvolutionScene(): void {
  VBlankCB_EvolutionScene();
}

// 1:1 defines Task_UpdateBgPalette (:1467-1478).
// tCycleTimer=data[0] · tPalStage=data[1] · tControlStage=data[2] · tNumCycles=data[3]
// tStartTimer=data[5] · tPaused=data[6]
// START_PAL/END_PAL/CYCLES/DELAY = sBgAnim_PaletteControl[tControlStage][0..3]

/** 1:1 `Task_UpdateBgPalette` (:1482-1516) — cycle la palette BG 10 à travers
 *  les stages de sBgAnim_PaletteControl. */
function Task_UpdateBgPalette(taskId: number): void {
  const data = _task(taskId).data;

  if (data[6]) return;              // tPaused
  if (data[5]++ < 20) return;       // tStartTimer

  const ctl = sBgAnim_PaletteControl[data[2]];
  if (ctl && data[0]++ > ctl[3] /* DELAY */) {
    if (ctl[1] /* END_PAL */ === data[1] /* tPalStage */) {
      // Reached final palette in current stage, completed a 'cycle'
      // If this is the final cycle for this stage, move to the next stage
      data[3]++;
      if (data[3] === ctl[2] /* CYCLES */) {
        data[3] = 0;
        data[2]++;
      }
      data[1] = ctl[0];  // tPalStage = START_PAL
    } else {
      // Haven't reached final palette in current stage, load the current palette
      if (sBgAnimPal)
        LoadPalette(sBgAnimPal.subarray(data[1] * 16, data[1] * 16 + 16), 10 * 16 /* BG_PLTT_ID(10) */, 32);
      data[0] = 0;
      data[1]++;
    }
  }

  if (data[2] === 4 /* ARRAY_COUNT(sBgAnim_PaletteControl[0]) */)
    DestroyTask(taskId);
}

// tIsLink = data[2] (:1528).

/** 1:1 `CreateBgAnimTask(isLink)` (:1530-1538). */
function CreateBgAnimTask(isLink: boolean): void {
  const taskId = _createTask(Task_AnimateBg, 7);
  _task(taskId).data[2] = isLink ? 1 : 0;
}

/** 1:1 `Task_AnimateBg` (:1540-1577) — scroll circulaire inner/outer. */
function Task_AnimateBg(taskId: number): void {
  const data = _task(taskId).data;

  const innerX = 'gBattle_BG1_X', innerY = 'gBattle_BG1_Y';
  const outerX = !data[2] ? 'gBattle_BG2_X' : 'gBattle_BG3_X';
  const outerY = !data[2] ? 'gBattle_BG2_Y' : 'gBattle_BG3_Y';

  data[0] = (data[0] + 5) & 0xFF;
  data[1] = (data[0] + 0x80) & 0xFF;

  _setBg(innerX, Cos(data[0], 4) + 8);
  _setBg(innerY, Sin(data[0], 4) + 16);

  _setBg(outerX, Cos(data[1], 4) + 8);
  _setBg(outerY, Sin(data[1], 4) + 16);

  if (FindTaskIdByFunc(Task_UpdateBgPalette as never) === 0xFE /* TASK_NONE */) {
    DestroyTask(taskId);
    _setBg(innerX, 0);
    _setBg(innerY, 0);
    _setBg(outerX, 256);
    _setBg(outerY, 0);
  }
}

/** 1:1 `InitMovingBgPalette(palette)` (:1581-1592) — 50×16 couleurs depuis
 *  sBgAnim_Pal[sBgAnim_PalIndexes[i][j]]. */
function InitMovingBgPalette(palette: Uint16Array): void {
  for (let i = 0; i < sBgAnim_PalIndexes.length; i++) {
    for (let j = 0; j < 16; j++) {
      palette[i * 16 + j] = sBgAnim_Pal?.[sBgAnim_PalIndexes[i][j]] ?? 0;
    }
  }
}

/** 1:1 `StartBgAnimation(isLink)` (:1594-1635). */
function StartBgAnimation(isLink: boolean): void {
  const rt = _rt();

  sBgAnimPal = new Uint16Array(0x640 / 2);  // AllocZeroed(0x640)
  InitMovingBgPalette(sBgAnimPal);

  const innerBgId = 1;
  const outerBgId = !isLink ? 2 : 3;

  if (sBgAnim_Intro_Pal)
    LoadPalette(sBgAnim_Intro_Pal.subarray(0, 16), 10 * 16 /* BG_PLTT_ID(10) */, 32);

  // 1:1 DecompressAndLoadBgGfxUsingHeap(1, sBgAnim_Gfx, FALSE, 0, 0) — assets
  // pré-décompressés → LoadBgTiles direct (pattern easy_chat).
  if (sBgAnim_Gfx) LoadBgTiles(1, sBgAnim_Gfx, sBgAnim_Gfx.length, 0);
  if (sBgAnim_Inner_Tilemap) CopyToBgTilemapBuffer(innerBgId, sBgAnim_Inner_Tilemap, 0, 0);
  if (sBgAnim_Outer_Tilemap) CopyToBgTilemapBuffer(outerBgId, sBgAnim_Outer_Tilemap, 0, 0);
  CopyBgTilemapBufferToVram(innerBgId);
  CopyBgTilemapBufferToVram(outerBgId);

  // BLDCNT bits 1:1 (gba/io_reg.h) : TGT1_BG1=1<<1, EFFECT_BLEND=1<<6, TGT2_BG2=1<<10, TGT2_BG3=1<<11.
  if (!isLink) {
    rt.SetGpuReg(REG_OFFSET_BLDCNT, (1 << 1) | (1 << 6) | (1 << 10));
    rt.SetGpuReg(REG_OFFSET_BLDALPHA, 8 | (8 << 8) /* BLDALPHA_BLEND(8, 8) */);
    rt.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | (DISPCNT_BG0_ON << 2) | (DISPCNT_BG0_ON << 1) | DISPCNT_BG0_ON | DISPCNT_OBJ_1D_MAP);

    _setBgAttribute(innerBgId, 7 /* BG_ATTR_PRIORITY */, 2);
    _setBgAttribute(outerBgId, 7, 2);

    ShowBg(1);
    ShowBg(2);
  } else {
    rt.SetGpuReg(REG_OFFSET_BLDCNT, (1 << 1) | (1 << 6) | (1 << 11));
    rt.SetGpuReg(REG_OFFSET_BLDALPHA, 8 | (8 << 8));
    rt.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | (DISPCNT_BG0_ON << 3) | (DISPCNT_BG0_ON << 1) | DISPCNT_BG0_ON | DISPCNT_OBJ_1D_MAP);
  }

  _createTask(Task_UpdateBgPalette, 5);
  CreateBgAnimTask(isLink);
}

/** 1:1 `PauseBgPaletteAnim` (:1637-1645) — UNUSED dans la décomp, conservé miroir. */
function PauseBgPaletteAnim(): void {
  const taskId = FindTaskIdByFunc(Task_UpdateBgPalette as never);
  if (taskId !== 0xFE /* TASK_NONE */)
    _task(taskId).data[6] = 1;  // tPaused = TRUE
  FillPalette(0x0000 /* RGB_BLACK */, 10 * 16, 32);
}
void PauseBgPaletteAnim;

/** 1:1 `StopBgAnimation` (:1649-1660). */
function StopBgAnimation(): void {
  let taskId: number;
  if ((taskId = FindTaskIdByFunc(Task_UpdateBgPalette as never)) !== 0xFE)
    DestroyTask(taskId);
  if ((taskId = FindTaskIdByFunc(Task_AnimateBg as never)) !== 0xFE)
    DestroyTask(taskId);
  FillPalette(0x0000, 10 * 16, 32);
  RestoreBgAfterAnim();
}

/** 1:1 `RestoreBgAfterAnim` (:1662-1672). */
function RestoreBgAfterAnim(): void {
  const rt = _rt();
  rt.SetGpuReg(REG_OFFSET_BLDCNT, 0);
  _setBg('gBattle_BG1_X', 0);
  _setBg('gBattle_BG1_Y', 0);
  _setBg('gBattle_BG2_X', 0);
  _setBgAttribute(1, 7 /* BG_ATTR_PRIORITY */, GetBattleBgTemplateData(1, 5));
  _setBgAttribute(2, 7, GetBattleBgTemplateData(2, 5));
  rt.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | (DISPCNT_BG0_ON << 3) | DISPCNT_BG0_ON | DISPCNT_OBJ_1D_MAP);
  sBgAnimPal = null;  // Free(sBgAnimPal)
}

/** 1:1 `EvoScene_DoMonAnimAndCry(monSpriteId, speciesId)` (:1674-1677). */
function EvoScene_DoMonAnimAndCry(monSpriteId: number, speciesId: number): void {
  const rt = _rt();
  const sprite = rt.gSprites[monSpriteId];
  if (!sprite) return;
  DoMonFrontSpriteAnimation(rt, sprite, speciesId, false, 0,
    (sp, pan) => PlayCryInternal(sp, pan, 100, 2, 0));
}

/** 1:1 `EvoScene_IsMonAnimFinished(monSpriteId)` (:1679-1685) :
 *  gSprites[id].callback == SpriteCallbackDummy. Plateforme : l'idle-anim finit
 *  sur SpriteCallbackDummy OU null (pattern battle_controller checks). */
function EvoScene_IsMonAnimFinished(monSpriteId: number): boolean {
  const s = _rt().gSprites[monSpriteId];
  if (!s) return true;
  const cbName = (s.callback as { name?: string } | null)?.name;
  return s.callback === null || cbName === 'SpriteCallbackDummy';
}

// Sondes dev (« voir par code », sans effet jeu) : lancer la scène directement.
(globalThis as Record<string, unknown>).__evoScene = {
  BeginEvolutionScene, EvolutionScene, SetCB2AfterEvolution,
};
void LoadCompressedSpriteSheet;
