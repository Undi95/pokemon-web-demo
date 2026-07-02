/**
 * egg_hatch.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/egg_hatch.c` (947 l, 25 fn).
 *
 * Scène d'éclosion d'œuf : déclenchée per-step (field_control_avatar → ShouldEggHatch)
 * → script `EventScript_EggHatch` (day_care.inc:262 : lockall, msgbox « Hein? »,
 * `special EggHatch` + waitstate) → fade, scène (secousses/éclats/reveal/fanfare/
 * prompt surnom) → CB2_ReturnToField + FieldCB_ContinueScriptHandleMusic (reprend
 * musique + script).
 *
 * Adaptations plateforme (mêmes patterns que evolution_scene.ts) :
 *  - INCGFX → assets pipeline (`public/decomp/em/pokemon/egg/*`, `em/trade/*`,
 *    textbox = loadBattleTextboxAssets), préchargés ASYNC pendant le fade de
 *    Task_EggHatch → CB2_LoadEggHatch reste une state machine SYNC 1:1.
 *  - Chargement sprite du mon = pattern `_loadEvoMonGfx`/`_createEvoMonSprite`
 *    (HandleLoadSpecialPokePic_DontHandleDeoxys/SetMultiuseSpriteTemplateToPokemon
 *    n'existent pas encore par nom — dette sprite P3.9).
 *  - `m4aSoundVSyncOn` = no-op (exemption hardware son) ; `SetBgTilemapBuffer`/
 *    `UnsetBgTilemapBuffer`/`Alloc/Free` = no-ops structurels (tilemap par-BG géré
 *    par le compositeur, GC côté TS).
 *  - DoNamingScreen : destBuffer = `number[]` de char codes JS (SaveInputText,
 *    naming_screen.ts:2241) — converti en string au retour (gStringVar3 du .c).
 */

import {
  getRuntime, gMain, PlaySE, IsFanfareTaskInactive, RunTasks, LoadBgTiles, LoadOam,
  LoadPalette, ResetTasks, ResetPaletteFade, SpriteCallbackDummy, PlayCryInternal,
  PlayFanfare,
} from '../harness/runtime/decomp-globals';
import type { DecompRuntime, DecompSprite } from '../harness/runtime/decomp-runtime';
import { SetGpuReg } from './gpu_regs';
import { REG_OFFSET_DISPCNT } from '../harness/runtime/decomp-runtime';
import { DISPCNT_OBJ_ON, DISPCNT_OBJ_1D_MAP } from '../include/gba/io_reg';
import {
  InitWindows, AddWindow, RemoveWindow, FillWindowPixelBuffer, PutWindowTilemap,
  CopyWindowToVram, InitBgsFromTemplates, ResetBgsAndClearDma3BusyFlags,
  ChangeBgX, ChangeBgY, ShowBg, CopyToBgTilemapBuffer, CopyBgTilemapBufferToVram,
  SetBgAttribute, BG_ATTR_PRIORITY, ResetTempTileDataBuffers,
} from './window';
import type { WindowTemplate, BgTemplate } from './window';
import {
  CreateSprite, DestroySprite, LoadSpriteSheet, LoadSpritePalette, FreeAllSpritePalettes,
  ResetSpriteData, StartSpriteAnim, ANIMCMD_FRAME, ANIMCMD_END, AllocOamMatrix,
  AnimateSprites, BuildOamBuffer,
} from './sprite';
import type { AnimCmd } from './sprite';
import { ScanlineEffect_Stop } from './scanline_effect';
import { BeginNormalPaletteFade, UpdatePaletteFade } from './palette';
import { Sin } from './trig';
import { Random } from './random';
import { VarGet, VarSet } from './event_data';
import {
  gPlayerParty, gEnemyParty, GetMonData, SetMonData,
  MON_DATA_SPECIES, MON_DATA_PERSONALITY, MON_DATA_LANGUAGE, MON_DATA_MET_GAME,
  MON_DATA_MARKINGS, MON_DATA_POKERUS, MON_DATA_MODERN_FATEFUL_ENCOUNTER,
  MON_DATA_MOVE1, MON_DATA_HP_IV, MON_DATA_IS_EGG, MON_DATA_NICKNAME,
  MON_DATA_FRIENDSHIP, MON_DATA_POKEBALL, MON_DATA_MET_LEVEL, MON_DATA_MET_LOCATION,
  MON_DATA_SANITY_IS_EGG,
} from './engine/battle/party-storage';
import type { Pokemon } from './engine/battle/party-storage';
import {
  CreateMon, CopyMon, CalculateMonStats, MonRestorePP, GetMonAbility, GetMonGender,
  CalculatePlayerPartyCount,
} from './pokemon';
import { GetSetPokedexFlag, SpeciesToNationalPokedexNum, FLAG_SET_SEEN, FLAG_SET_CAUGHT } from './engine/ui/pokedex-flags';
import { OT_ID_PLAYER_ID, SHINY_ODDS } from '../include/constants/pokemon';
import { GET_SHINY_VALUE } from '../include/pokemon';
import { LANGUAGE_FRENCH } from '../include/constants/global';
import { ITEM_POKE_BALL } from '../include/constants/items';
import { resolveDecompConstant, reverseDecompConstant } from '../harness/runtime/decomp-constants';
import { gSpeciesNames } from './engine/data/game-data';
import { GetDaycareData, GetMonNickname2, GetBoxMonNickname, EGG_HATCH_LEVEL } from './daycare';
import type { DayCare } from './daycare';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import { gStringVar1, gStringVar2, gStringVar3, gStringVar4, StringCopy, StringExpandPlaceholders, StringCompareWithoutExtCtrlCodes } from './string_util';
import { TVShowConvertInternationalString } from './international_string_util';
import { encodeOwText } from './text';
import { IsTextPrinterActive, DeactivateAllTextPrinters, TEXT_SKIP_DRAW } from './text';
import { getString } from './engine/ui/gba-strings';
import { AddTextPrinterParameterized4, CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose } from './menu';
import { MENU_B_PRESSED } from '../include/menu';
import { LoadUserWindowBorderGfx } from './text_window';
import { RunTextPrinters } from './text';
import { CreateTask, DestroyTask } from './task';
import { LockPlayerFieldControls } from './script';
import { FadeScreen } from './field_weather';
import { FADE_TO_BLACK } from './field_weather';
import { CleanupOverworldWindowsAndTilemaps, CB2_ReturnToField_Manual } from './overworld';
import { FieldCB_ContinueScriptHandleMusic } from './field_screen_effect';
import { StopMapMusic, PlayBGM } from './sound';
import { PlayRainStoppingSoundEffect } from './field_weather';
import { GetCurrentMapMusic } from './sound';
import { MUS_EVOLUTION, MUS_EVOLUTION_INTRO, MUS_EVOLVED, SE_BALL, SE_EGG_HATCH } from '../include/constants/songs';
import { AllocateMonSpritesGfx, FreeMonSpritesGfx, gMonSpritesGfxPtr, MON_PIC_SIZE } from './battle_gfx_sfx_util';
import { DoMonFrontSpriteAnimation } from './pokemon_animation';
import { DoNamingScreen } from './naming_screen';
import { CountStorageNonEggMons, CountPartyAliveNonEggMonsExcept } from './pokemon_storage_system';
import { loadTileBin, loadTilemapBin, loadGbaPal } from '../harness/gba/png-loader';
import { loadBattleTextboxAssets } from './battle_bg';
import { gMapHeader } from './fieldmap';

const _rt = (): DecompRuntime => getRuntime();

// 1:1 egg_hatch.c:41-47.
const GFXTAG_EGG = 12345;
const GFXTAG_EGG_SHARD = 23456;
const PALTAG_EGG = 54321;
const EGG_X = 240 / 2;            // DISPLAY_WIDTH / 2
const EGG_Y = 160 / 2 - 5;        // DISPLAY_HEIGHT / 2 - 5

/** 1:1 `struct EggHatchData` (egg_hatch.c:49-64). */
interface EggHatchData {
  eggSpriteId: number;
  monSpriteId: number;
  state: number;
  delayTimer: number;
  eggPartyId: number;
  eggShardVelocityId: number;
  windowId: number;
  species: number;
  textColor: [number, number, number];
}

/** 1:1 `static struct EggHatchData *sEggHatchData` (egg_hatch.c:83). */
let sEggHatchData: EggHatchData | null = null;

// ─── Assets pipeline (= INCGFX egg_hatch.c:85-87 + graphics.c/trade.h, préchargés) ───
interface EggHatchGfx {
  eggPal: Uint16Array;             // sEggPalette  (graphics/pokemon/egg/normal.pal)
  eggTiles: Uint8Array;            // sEggHatchTiles (graphics/pokemon/egg/hatch.png)
  shardTiles: Uint8Array;          // sEggShardTiles (graphics/pokemon/egg/shard.png)
  textbox: { tiles: Uint8Array; tilemap: Uint16Array; palette0: Uint16Array };
  tradePal2: Uint16Array;          // gTradeGba2_Pal (graphics/trade/gba_pal2.pal, 5 pals)
  tradeGfx: Uint8Array;            // gTradeGba_Gfx  (graphics/trade/gba.png)
  platformTilemap: Uint16Array;    // gTradePlatform_Tilemap (graphics/trade/platform.bin)
  monTiles: Uint8Array;            // HandleLoadSpecialPokePic (anim_front du mon)
  monPal: Uint16Array;             // GetMonSpritePalStruct (normal/shiny.pal)
}
let _gfx: EggHatchGfx | null = null;

async function _loadEggHatchGfx(eggPartyId: number): Promise<void> {
  const mon = gPlayerParty[eggPartyId];
  const species = GetMonData(mon, MON_DATA_SPECIES) as number;
  const personality = GetMonData(mon, MON_DATA_PERSONALITY) as number;
  const otId = (mon as { otId?: number }).otId ?? 0;
  const enumName = reverseDecompConstant(species, 'SPECIES_') ?? 'SPECIES_NONE';
  const folder = enumName.replace(/^SPECIES_/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const shiny = GET_SHINY_VALUE(otId >>> 0, personality >>> 0) < SHINY_ODDS;
  const [eggPal, eggTiles, shardTiles, textbox, tradePal2, tradeGfx, platformTilemap, monTiles, monPal] =
    await Promise.all([
      loadGbaPal('/decomp/em/pokemon/egg/normal.pal'),
      loadTileBin('/decomp/em/pokemon/egg/hatch.png', 4),
      loadTileBin('/decomp/em/pokemon/egg/shard.png', 4),
      loadBattleTextboxAssets(),
      loadGbaPal('/decomp/em/trade/gba_pal2.pal'),
      loadTileBin('/decomp/em/trade/gba.png', 4),
      loadTilemapBin('/decomp/em/trade/platform.bin'),
      loadTileBin(`/decomp/em/pokemon/${folder}/anim_front.png`, 4),
      loadGbaPal(`/decomp/em/pokemon/${folder}/${shiny ? 'shiny.pal' : 'normal.pal'}`),
    ]);
  _gfx = { eggPal, eggTiles, shardTiles, textbox, tradePal2, tradeGfx, platformTilemap, monTiles, monPal };
}

// ─── Data sprites/bg 1:1 (egg_hatch.c:89-310) ────────────────────────────────

// sOamData_Egg (:89) : 32x32, priority 1.
const sOamData_Egg = { shape: 0 /* SPRITE_SHAPE(32x32) */, size: 2 /* SPRITE_SIZE(32x32) */, priority: 1, affineMode: 0, paletteMode: 0 } as const;

// enum EGG_ANIM_* (:130).
const EGG_ANIM_NORMAL = 0;
const EGG_ANIM_CRACKED_1 = 1;
const EGG_ANIM_CRACKED_2 = 2;
const EGG_ANIM_CRACKED_3 = 3;
void EGG_ANIM_NORMAL; void EGG_ANIM_CRACKED_3; // CRACKED_3 : jamais joué (bug ROM, cf. Shake3)

// sSpriteAnimTable_Egg (:106-143) — frames aux tiles 0/16/32/48, duration 5.
const sSpriteAnimTable_Egg: AnimCmd[][] = [
  [ANIMCMD_FRAME(0, 5), ANIMCMD_END],   // EGG_ANIM_NORMAL
  [ANIMCMD_FRAME(16, 5), ANIMCMD_END],  // EGG_ANIM_CRACKED_1
  [ANIMCMD_FRAME(32, 5), ANIMCMD_END],  // EGG_ANIM_CRACKED_2
  [ANIMCMD_FRAME(48, 5), ANIMCMD_END],  // EGG_ANIM_CRACKED_3
];

// sOamData_EggShard (:176) : 8x8, priority 2.
const sOamData_EggShard = { shape: 0 /* 8x8 */, size: 0, priority: 2, affineMode: 0, paletteMode: 0 } as const;

// sSpriteAnimTable_EggShard (:193-223) — 4 images 8x8 (tiles 0-3).
const sSpriteAnimTable_EggShard: AnimCmd[][] = [
  [ANIMCMD_FRAME(0, 5), ANIMCMD_END],
  [ANIMCMD_FRAME(1, 5), ANIMCMD_END],
  [ANIMCMD_FRAME(2, 5), ANIMCMD_END],
  [ANIMCMD_FRAME(3, 5), ANIMCMD_END],
];

// sBgTemplates_EggHatch (:236-257).
const sBgTemplates_EggHatch: BgTemplate[] = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 24, screenSize: 3, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 8, screenSize: 1, paletteMode: 0, priority: 2, baseTile: 0 },
];

// sWinTemplates_EggHatch (:259-271) — fenêtre message (DUMMY_WIN_TEMPLATE exclue :
// InitWindows s'arrête au sentinel côté décomp).
const sWinTemplates_EggHatch: WindowTemplate[] = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 26, height: 4, paletteNum: 0, baseBlock: 64 },
];

// sYesNoWinTemplate (:273-282).
const sYesNoWinTemplate: WindowTemplate = { bg: 0, tilemapLeft: 21, tilemapTop: 9, width: 5, height: 4, paletteNum: 15, baseBlock: 424 };

/** 1:1 `#define Q_8_8(n) ((s16)((n) * 256))`. */
const Q_8_8 = (n: number): number => (n * 256) | 0;

// sEggShardVelocities (:284-310).
const sEggShardVelocities: ReadonlyArray<readonly [number, number]> = [
  // First shake
  [Q_8_8(-1.5), Q_8_8(-3.75)],
  // Third shake
  [Q_8_8(-5), Q_8_8(-3)],
  [Q_8_8(3.5), Q_8_8(-3)],
  // Hatching
  [Q_8_8(-4), Q_8_8(-3.75)],
  [Q_8_8(2), Q_8_8(-1.5)],
  [Q_8_8(-0.5), Q_8_8(-6.75)],
  [Q_8_8(5), Q_8_8(-2.25)],
  [Q_8_8(-1.5), Q_8_8(-3.75)],
  [Q_8_8(4.5), Q_8_8(-1.5)],
  [Q_8_8(-1), Q_8_8(-6.75)],
  [Q_8_8(4), Q_8_8(-2.25)],
  [Q_8_8(-3.5), Q_8_8(-3.75)],
  [Q_8_8(1), Q_8_8(-1.5)],
  [Q_8_8(-3.515625), Q_8_8(-6.75)],
  [Q_8_8(4.5), Q_8_8(-2.25)],
  [Q_8_8(-0.5), Q_8_8(-7.5)],
  [Q_8_8(1), Q_8_8(-4.5)],
  [Q_8_8(-2.5), Q_8_8(-2.25)],
  [Q_8_8(2.5), Q_8_8(-7.5)],
];

// ─── Fonctions 1:1 ───────────────────────────────────────────────────────────

/** 1:1 `static void CreateHatchedMon(struct Pokemon *egg, struct Pokemon *temp)` (:312-356). */
function CreateHatchedMon(egg: Pokemon, temp: Pokemon): void {
  const moves: number[] = [0, 0, 0, 0];
  const ivs: number[] = [0, 0, 0, 0, 0, 0];

  const species = GetMonData(egg, MON_DATA_SPECIES) as number;

  for (let i = 0; i < 4 /* MAX_MON_MOVES */; i++)
    moves[i] = GetMonData(egg, MON_DATA_MOVE1 + i) as number;

  const personality = GetMonData(egg, MON_DATA_PERSONALITY) as number;

  for (let i = 0; i < 6 /* NUM_STATS */; i++)
    ivs[i] = GetMonData(egg, MON_DATA_HP_IV + i) as number;

  // The language is initially read from the Egg but is later overwritten below
  const gameMet = GetMonData(egg, MON_DATA_MET_GAME) as number;
  const markings = GetMonData(egg, MON_DATA_MARKINGS) as number;
  const pokerus = GetMonData(egg, MON_DATA_POKERUS) as number;
  const isModernFatefulEncounter = GetMonData(egg, MON_DATA_MODERN_FATEFUL_ENCOUNTER) as number;

  CreateMon(temp, species, EGG_HATCH_LEVEL, 32 /* USE_RANDOM_IVS */, true, personality, OT_ID_PLAYER_ID, 0);

  for (let i = 0; i < 4; i++)
    SetMonData(temp, MON_DATA_MOVE1 + i, moves[i]);

  for (let i = 0; i < 6; i++)
    SetMonData(temp, MON_DATA_HP_IV + i, ivs[i]);

  SetMonData(temp, MON_DATA_LANGUAGE, LANGUAGE_FRENCH /* GAME_LANGUAGE */);
  SetMonData(temp, MON_DATA_MET_GAME, gameMet);
  SetMonData(temp, MON_DATA_MARKINGS, markings);

  SetMonData(temp, MON_DATA_FRIENDSHIP, 120);
  SetMonData(temp, MON_DATA_POKERUS, pokerus);
  SetMonData(temp, MON_DATA_MODERN_FATEFUL_ENCOUNTER, isModernFatefulEncounter);

  CopyMon(egg, temp); // 1:1 `*egg = *temp;`
}

/** 1:1 `mapsec_u8_t GetCurrentRegionMapSectionId(void)` (overworld.c:1391) — pattern
 *  établi (pokemon.ts CreateBoxMon) : gMapHeader.regionMapSectionId (string MAPSEC)
 *  → id numérique via resolveDecompConstant. */
function GetCurrentRegionMapSectionId(): number {
  const sec = gMapHeader?.regionMapSectionId;
  return typeof sec === 'string' ? ((resolveDecompConstant(sec) as number | undefined) ?? 0) : (sec ?? 0);
}

/** 1:1 `static void AddHatchedMonToParty(u8 id)` (:358-393). */
function AddHatchedMonToParty(id: number): void {
  const mon = gPlayerParty[id];

  CreateHatchedMon(mon, gEnemyParty[0]);
  // 1:1 `u8 isEgg = 0x46; // ?` : bitfield :1 → 0x46 & 1 = 0 → dé-œuffe (setter pokemon.ts aligné).
  SetMonData(mon, MON_DATA_IS_EGG, 0x46);

  let species = GetMonData(mon, MON_DATA_SPECIES) as number;
  SetMonData(mon, MON_DATA_NICKNAME, gSpeciesNames[species] ?? ''); // GetSpeciesName + SetMonData

  species = SpeciesToNationalPokedexNum(species);
  GetSetPokedexFlag(species, FLAG_SET_SEEN);
  GetSetPokedexFlag(species, FLAG_SET_CAUGHT);

  GetMonNickname2(mon, gStringVar1);

  SetMonData(mon, MON_DATA_POKEBALL, ITEM_POKE_BALL);

  // A met level of 0 is interpreted on the summary screen as "hatched at"
  SetMonData(mon, MON_DATA_MET_LEVEL, 0);

  SetMonData(mon, MON_DATA_MET_LOCATION, GetCurrentRegionMapSectionId());

  MonRestorePP(mon);
  CalculateMonStats(mon);
}

/** 1:1 `void ScriptHatchMon(void)` (:395) — special. */
export function ScriptHatchMon(): void {
  AddHatchedMonToParty(VarGet(0x8004) /* gSpecialVar_0x8004 */);
}

/** 1:1 `static bool8 _CheckDaycareMonReceivedMail(struct DayCare *daycare, u8 daycareId)` (:400-416). */
function _CheckDaycareMonReceivedMail(daycare: DayCare, daycareId: number): boolean {
  const nickname = new Uint8Array(32); // max(32, POKEMON_NAME_BUFFER_SIZE)
  const daycareMon = daycare.mons[daycareId];

  if (!daycareMon.mon) return false;
  GetBoxMonNickname(daycareMon.mon, nickname);
  const playerName = encodeOwText((gSaveBlock2Ptr.playerName as string) ?? '');
  if (daycareMon.mail.message.itemId !== 0 /* ITEM_NONE */
    && (StringCompareWithoutExtCtrlCodes(nickname, daycareMon.mail.monName) !== 0
      || StringCompareWithoutExtCtrlCodes(playerName, daycareMon.mail.otName) !== 0)) {
    StringCopy(gStringVar1, nickname);
    TVShowConvertInternationalString(gStringVar2, daycareMon.mail.otName, daycareMon.mail.gameLanguage);
    TVShowConvertInternationalString(gStringVar3, daycareMon.mail.monName, daycareMon.mail.monLanguage);
    return true;
  }
  return false;
}

/** 1:1 `bool8 CheckDaycareMonReceivedMail(void)` (:418-421) — special. */
export function CheckDaycareMonReceivedMail(): boolean {
  return _CheckDaycareMonReceivedMail(GetDaycareData(), VarGet(0x8004));
}

/** 1:1 `static u8 EggHatchCreateMonSprite(u8 useAlt, u8 state, u8 partyId, u16 *speciesLoc)`
 *  (:423-463). Adaptation : state 0 copie les tiles PRÉCHARGÉES dans gMonSpritesGfxPtr
 *  (= HandleLoadSpecialPokePic_DontHandleDeoxys) + LoadSpritePalette (= LoadCompressed
 *  SpritePalette(GetMonSpritePalStruct)) ; `*speciesLoc` → écrit sEggHatchData.species. */
function EggHatchCreateMonSprite(useAlt: number, state: number, partyId: number): number {
  const rt = _rt();
  let spriteId = 0;
  const mon = gPlayerParty[partyId];
  const position = useAlt === 0 ? 1 /* B_POSITION_OPPONENT_LEFT */ : 3 /* B_POSITION_OPPONENT_RIGHT (never reached) */;

  switch (state) {
    case 0: {
      // Load mon sprite gfx
      const species = GetMonData(mon, MON_DATA_SPECIES) as number;
      if (_gfx) {
        gMonSpritesGfxPtr.sprites.ptr[(useAlt * 2) + 1 /* B_POSITION_OPPONENT_LEFT */] = _gfx.monTiles;
      }
      if (sEggHatchData) sEggHatchData.species = species; // *speciesLoc = species
      break;
    }
    case 1: {
      // Create mon sprite (= SetMultiuseSpriteTemplateToPokemon + CreateSprite(&gMultiuseSpriteTemplate)).
      // OAM battler 1:1 = gOamData_BattleSpriteOpponentSide (battle_main.c:274) :
      // affineMode ST_OAM_AFFINE_NORMAL dès la CRÉATION — sinon StartSpriteAffineAnim(EMERGE)
      // au reveal ne joue pas (BeginAffineAnim early-return) et le mon apparaît plein-taille
      // avant de rétrécir quand l'anim front pose l'affine (bug verdict A/B, sondé live).
      const tiles = gMonSpritesGfxPtr.sprites.ptr[(useAlt * 2) + 1];
      if (!tiles) { console.warn('[egg_hatch] tiles mon absentes'); return 64; }
      const palSlot = LoadSpritePalette({ data: _gfx!.monPal, tag: 'PAL_EGG_HATCH_MON' });
      const twoFrames = tiles.length >= MON_PIC_SIZE * 2;
      const frame0 = twoFrames ? tiles.subarray(0, MON_PIC_SIZE * 2) : tiles.subarray(0, MON_PIC_SIZE);
      spriteId = CreateSprite({
        oam: { shape: 0, size: 3, priority: 2, paletteNum: palSlot, affineMode: 1 /* ST_OAM_AFFINE_NORMAL */ },
        images: [{ data: frame0, size: frame0.length }],
        callback: null,
      }, EGG_X, EGG_Y, 6);
      const s = rt.gSprites[spriteId];
      if (s) {
        s.invisible = true;
        s.callback = SpriteCallbackDummy as unknown as DecompSprite['callback'];
        // gMultiuseSpriteTemplate.affineAnims = gAffineAnims_BattleSpriteOpponentSide
        // (BATTLER_AFFINE_EMERGE au reveal) — la voie inline n'attache pas l'affine :
        // table + matrice + anim 0 (statique) comme la voie sheet (sprite.ts:1758-1799).
        (s as unknown as { affineAnimsTableName: string | null }).affineAnimsTableName = 'gAffineAnims_BattleSpriteOpponentSide';
        (s as unknown as { affineMode: number }).affineMode = 1;
        const m = AllocOamMatrix();
        if (m > 0) (s as unknown as { matrixNum: number }).matrixNum = m;
        rt.StartSpriteAffineAnim(spriteId, 0 /* BATTLER_AFFINE_NORMAL (statique) */);
      }
      void position;
      break;
    }
  }
  return spriteId;
}

/** 1:1 `static void VBlankCB_EggHatch(void)` (:465-470). ProcessSpriteCopyRequests/
 *  TransferPlttBuffer = internes au runtime (compositeur). */
function VBlankCB_EggHatch(): void {
  LoadOam();
}

/** 1:1 `void EggHatch(void)` (:472-477) — special (waitstate=1). Le préchargement
 *  asset est kické ICI (pendant le fade) pour que CB2_LoadEggHatch reste sync. */
export function EggHatch(): void {
  LockPlayerFieldControls();
  _gfx = null;
  void _loadEggHatchGfx(VarGet(0x8004)).catch((e) => console.error('[egg_hatch] préchargement gfx échoué', e));
  // Adaptateur objet-task → taskId (pattern evolution_scene.ts:173).
  CreateTask((t: { taskId: number }) => Task_EggHatch(t.taskId), 10);
  FadeScreen(FADE_TO_BLACK, 0);
}

/** 1:1 `static void Task_EggHatch(u8 taskId)` (:479-488). Gate additionnelle : assets
 *  préchargés (le .c lit la ROM en synchrone). */
function Task_EggHatch(taskId: number): void {
  const rt = _rt();
  if (!rt.gPaletteFade.active && _gfx) {
    CleanupOverworldWindowsAndTilemaps();
    gMain.state = 0; // SetMainCallback2 décomp reset gMain.state
    rt.SetMainCallback2(CB2_LoadEggHatch);
    (globalThis as Record<string, unknown>).gFieldCallback = FieldCB_ContinueScriptHandleMusic;
    DestroyTask(taskId);
  }
}

/** 1:1 `static void CB2_LoadEggHatch(void)` (:490-575). */
function CB2_LoadEggHatch(): void {
  const rt = _rt();
  switch (gMain.state) {
    case 0:
      SetGpuReg(REG_OFFSET_DISPCNT, 0);

      sEggHatchData = {
        eggSpriteId: 0, monSpriteId: 0, state: 0, delayTimer: 0,
        eggPartyId: VarGet(0x8004) /* gSpecialVar_0x8004 */,
        eggShardVelocityId: 0, windowId: 0, species: 0, textColor: [0, 0, 0],
      };
      AllocateMonSpritesGfx();

      rt.SetVBlankCallback(VBlankCB_EggHatch);
      VarSet(0x8005, GetCurrentMapMusic()); // gSpecialVar_0x8005 = GetCurrentMapMusic()

      ResetTempTileDataBuffers();
      ResetBgsAndClearDma3BusyFlags(0);
      InitBgsFromTemplates(0, sBgTemplates_EggHatch, sBgTemplates_EggHatch.length);

      ChangeBgX(1, 0, 0 /* BG_COORD_SET */);
      ChangeBgY(1, 0, 0);
      ChangeBgX(0, 0, 0);
      ChangeBgY(0, 0, 0);

      SetBgAttribute(1, BG_ATTR_PRIORITY, 2);
      // SetBgTilemapBuffer(1/0, Alloc(...)) : no-op structurel (tilemap par-BG compositeur).

      DeactivateAllTextPrinters();
      ResetPaletteFade();
      FreeAllSpritePalettes();
      ResetSpriteData();
      ResetTasks();
      ScanlineEffect_Stop();
      // m4aSoundVSyncOn() : exemption hardware son.
      gMain.state++;
      break;
    case 1:
      sEggHatchData!.windowId = InitWindows(sWinTemplates_EggHatch)[0] ?? 0;
      gMain.state++;
      break;
    case 2:
      // DecompressAndLoadBgGfxUsingHeap(0, gBattleTextboxTiles, 0, 0, 0) +
      // CopyToBgTilemapBuffer(0, gBattleTextboxTilemap) + LoadCompressedPalette(BG_PLTT_ID(0)).
      LoadBgTiles(0, _gfx!.textbox.tiles, _gfx!.textbox.tiles.length, 0);
      CopyToBgTilemapBuffer(0, _gfx!.textbox.tilemap, 0, 0);
      LoadPalette(_gfx!.textbox.palette0, 0 /* BG_PLTT_ID(0) */, 32 /* PLTT_SIZE_4BPP */);
      gMain.state++;
      break;
    case 3:
      LoadSpriteSheet({ data: _gfx!.eggTiles, size: _gfx!.eggTiles.length, tag: GFXTAG_EGG });    // sEggHatch_Sheet
      LoadSpriteSheet({ data: _gfx!.shardTiles, size: _gfx!.shardTiles.length, tag: GFXTAG_EGG_SHARD }); // sEggShards_Sheet
      LoadSpritePalette({ data: _gfx!.eggPal, tag: PALTAG_EGG });                                 // sEgg_SpritePalette
      gMain.state++;
      break;
    case 4:
      CopyBgTilemapBufferToVram(0);
      AddHatchedMonToParty(sEggHatchData!.eggPartyId);
      gMain.state++;
      break;
    case 5:
      EggHatchCreateMonSprite(0, 0, sEggHatchData!.eggPartyId);
      gMain.state++;
      break;
    case 6:
      sEggHatchData!.monSpriteId = EggHatchCreateMonSprite(0, 1, sEggHatchData!.eggPartyId);
      gMain.state++;
      break;
    case 7:
      SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);
      LoadPalette(_gfx!.tradePal2, 16 /* BG_PLTT_ID(1) */, 5 * 32 /* 5 * PLTT_SIZE_4BPP */);
      LoadBgTiles(1, _gfx!.tradeGfx, 0x1420, 0);
      CopyToBgTilemapBuffer(1, _gfx!.platformTilemap, 0x1000, 0);
      CopyBgTilemapBufferToVram(1);
      gMain.state++;
      break;
    case 8:
      gMain.state = 0;
      rt.SetMainCallback2(CB2_EggHatch);
      sEggHatchData!.state = 0;
      break;
  }
  RunTasks();
  RunTextPrinters();
  AnimateSprites();
  BuildOamBuffer();
  UpdatePaletteFade();
}

/** Buffer surnom pour DoNamingScreen (= gStringVar3 du .c, cf. adaptation en-tête). */
const _nicknameBuffer: number[] = [];

/** 1:1 `static void EggHatchSetMonNickname(void)` (:577-583) — callback naming screen. */
function EggHatchSetMonNickname(): void {
  const rt = _rt();
  const name = _nicknameBuffer.length ? String.fromCharCode(..._nicknameBuffer) : null;
  if (name) SetMonData(gPlayerParty[VarGet(0x8004)], MON_DATA_NICKNAME, name);
  FreeMonSpritesGfx();
  sEggHatchData = null; // Free(sEggHatchData)
  gMain.state = 0;
  rt.SetMainCallback2(CB2_ReturnToField_Manual); // SetMainCallback2(CB2_ReturnToField)
}

// #define tTimer data[0] (:585)

/** 1:1 `static void Task_EggHatchPlayBGM(u8 taskId)` (:587-604). */
function Task_EggHatchPlayBGM(taskId: number): void {
  const task = _rt().gTasks[taskId] as { data: number[] } | undefined;
  if (!task) return;
  if (task.data[0] === 0) {
    StopMapMusic();
    PlayRainStoppingSoundEffect();
  }
  if (task.data[0] === 1)
    PlayBGM(MUS_EVOLUTION_INTRO);
  if (task.data[0] > 60) {
    PlayBGM(MUS_EVOLUTION);
    DestroyTask(taskId);
  }
  // 1:1 : le .c incrémente tTimer même après DestroyTask (write sur slot libéré, inoffensif).
  task.data[0]++;
}

/** 1:1 `static void CB2_EggHatch(void)` (:606-725). */
function CB2_EggHatch(): void {
  const rt = _rt();
  const data = sEggHatchData;
  if (!data) return;

  switch (data.state) {
    case 0:
      BeginNormalPaletteFade(0xFFFFFFFF /* PALETTES_ALL */, 0, 16, 0, 0x0000 /* RGB_BLACK */);
      data.eggSpriteId = CreateSprite({
        tileTag: GFXTAG_EGG, paletteTag: PALTAG_EGG, oam: sOamData_Egg,
        anims: sSpriteAnimTable_Egg, callback: null /* SpriteCallbackDummy */,
      }, EGG_X, EGG_Y, 5);
      ShowBg(0);
      ShowBg(1);
      data.state++;
      CreateTask((t: { taskId: number }) => Task_EggHatchPlayBGM(t.taskId), 5);
      break;
    case 1:
      if (!rt.gPaletteFade.active) {
        FillWindowPixelBuffer(data.windowId, 0x00 /* PIXEL_FILL(0) */);
        data.delayTimer = 0;
        data.state++;
      }
      break;
    case 2:
      if (++data.delayTimer > 30) {
        // Start hatching animation
        data.state++;
        const egg = rt.gSprites[data.eggSpriteId];
        if (egg) egg.callback = SpriteCB_Egg_Shake1 as unknown as DecompSprite['callback'];
      }
      break;
    case 3: {
      // Wait for hatching animation to finish
      const egg = rt.gSprites[data.eggSpriteId];
      if (egg && (egg.callback === null || egg.callback === (SpriteCallbackDummy as unknown as DecompSprite['callback']))) {
        const species = GetMonData(gPlayerParty[data.eggPartyId], MON_DATA_SPECIES) as number;
        const monSprite = rt.gSprites[data.monSpriteId];
        if (monSprite) {
          DoMonFrontSpriteAnimation(rt, monSprite, species, false, 1, (sp, pan) => PlayCryInternal(sp, pan, 100, 2, 0));
        }
        data.state++;
      }
      break;
    }
    case 4: {
      // Wait for Pokémon's front sprite animation
      const monSprite = rt.gSprites[data.monSpriteId];
      if (monSprite && (monSprite.callback === null || monSprite.callback === (SpriteCallbackDummy as unknown as DecompSprite['callback'])))
        data.state++;
      break;
    }
    case 5:
      // "{mon} hatched from egg" message/fanfare
      GetMonNickname2(gPlayerParty[data.eggPartyId], gStringVar1);
      StringExpandPlaceholders(gStringVar4, encodeOwText(getString('gText_HatchedFromEgg')));
      EggHatchPrintMessage(data.windowId, gStringVar4, 0, 3, TEXT_SKIP_DRAW);
      PlayFanfare(MUS_EVOLVED);
      data.state++;
      PutWindowTilemap(data.windowId);
      CopyWindowToVram(data.windowId, 3 /* COPYWIN_FULL */);
      break;
    case 6:
      if (IsFanfareTaskInactive()) data.state++;
      break;
    case 7: // Twice?
      if (IsFanfareTaskInactive()) data.state++;
      break;
    case 8:
      // Ready the nickname prompt
      GetMonNickname2(gPlayerParty[data.eggPartyId], gStringVar1);
      StringExpandPlaceholders(gStringVar4, encodeOwText(getString('gText_NicknameHatchPrompt')));
      EggHatchPrintMessage(data.windowId, gStringVar4, 0, 2, 1);
      data.state++;
      break;
    case 9:
      // Print the nickname prompt
      if (!IsTextPrinterActive(data.windowId)) {
        LoadUserWindowBorderGfx(data.windowId, 0x140, 14 * 16 /* BG_PLTT_ID(14) */);
        CreateYesNoMenu(sYesNoWinTemplate, 0x140, 0xE, 0);
        data.state++;
      }
      break;
    case 10:
      // Handle the nickname prompt input
      switch (Menu_ProcessInputNoWrapClearOnChoose()) {
        case 0: { // Yes
          GetMonNickname2(gPlayerParty[data.eggPartyId], gStringVar3);
          // Préfill du buffer naming (= gStringVar3 passé à DoNamingScreen)
          const cur = (GetMonData(gPlayerParty[data.eggPartyId], MON_DATA_NICKNAME) as string) ?? '';
          _nicknameBuffer.length = 0;
          for (const c of cur) _nicknameBuffer.push(c.charCodeAt(0));
          const species = GetMonData(gPlayerParty[data.eggPartyId], MON_DATA_SPECIES) as number;
          const gender = GetMonGender(gPlayerParty[data.eggPartyId]);
          const personality = GetMonData(gPlayerParty[data.eggPartyId], MON_DATA_PERSONALITY) as number;
          DoNamingScreen(3 /* NAMING_SCREEN_NICKNAME */, _nicknameBuffer, species, gender, personality, EggHatchSetMonNickname);
          break;
        }
        case 1: // No
        case MENU_B_PRESSED:
          data.state++;
          break;
      }
      break;
    case 11:
      BeginNormalPaletteFade(0xFFFFFFFF, 0, 0, 16, 0x0000 /* RGB_BLACK */);
      data.state++;
      break;
    case 12:
      if (!rt.gPaletteFade.active) {
        FreeMonSpritesGfx();
        RemoveWindow(data.windowId);
        // UnsetBgTilemapBuffer(0/1) : no-op structurel.
        sEggHatchData = null; // Free(sEggHatchData)
        gMain.state = 0;
        rt.SetMainCallback2(CB2_ReturnToField_Manual); // SetMainCallback2(CB2_ReturnToField)
        return;
      }
      break;
  }

  RunTasks();
  RunTextPrinters();
  AnimateSprites();
  BuildOamBuffer();
  UpdatePaletteFade();
}

// #define sTimer data[0] · sSinIdx data[1] · sDelayTimer data[2] (:727-729)

/** 1:1 `static void SpriteCB_Egg_Shake1(struct Sprite *sprite)` (:731-751). */
function SpriteCB_Egg_Shake1(sprite: DecompSprite): void {
  if (++sprite.data[0] > 20) {
    sprite.callback = SpriteCB_Egg_Shake2 as unknown as DecompSprite['callback'];
    sprite.data[0] = 0;
  } else {
    // Shake egg
    sprite.data[1] = (sprite.data[1] + 20) & 0xFF;
    sprite.x2 = Sin(sprite.data[1], 1);
    if (sprite.data[0] === 15) {
      // First egg crack
      PlaySE(SE_BALL);
      StartSpriteAnim(sprite as never, EGG_ANIM_CRACKED_1);
      CreateRandomEggShardSprite();
    }
  }
}

/** 1:1 `static void SpriteCB_Egg_Shake2(struct Sprite *sprite)` (:753-776). */
function SpriteCB_Egg_Shake2(sprite: DecompSprite): void {
  if (++sprite.data[2] > 30) {
    if (++sprite.data[0] > 20) {
      sprite.callback = SpriteCB_Egg_Shake3 as unknown as DecompSprite['callback'];
      sprite.data[0] = 0;
      sprite.data[2] = 0;
    } else {
      // Shake egg
      sprite.data[1] = (sprite.data[1] + 20) & 0xFF;
      sprite.x2 = Sin(sprite.data[1], 2);
      if (sprite.data[0] === 15) {
        // Second egg crack
        PlaySE(SE_BALL);
        StartSpriteAnim(sprite as never, EGG_ANIM_CRACKED_2);
      }
    }
  }
}

/** 1:1 `static void SpriteCB_Egg_Shake3(struct Sprite *sprite)` (:778-814). */
function SpriteCB_Egg_Shake3(sprite: DecompSprite): void {
  const rt = _rt();
  if (++sprite.data[2] > 30) {
    if (++sprite.data[0] > 38) {
      sprite.callback = SpriteCB_Egg_WaitHatch as unknown as DecompSprite['callback'];
      sprite.data[0] = 0;
      const monSprite = sEggHatchData ? rt.gSprites[sEggHatchData.monSpriteId] : undefined;
      if (monSprite) { monSprite.x2 = 0; monSprite.y2 = 0; }
    } else {
      // Shake egg
      sprite.data[1] = (sprite.data[1] + 20) & 0xFF;
      sprite.x2 = Sin(sprite.data[1], 2);
      if (sprite.data[0] === 15) {
        // Third egg crack
        // This ineffectually sets the animation to the frame it's already using.
        // They likely meant to use the 3rd and final cracked frame of the egg,
        // which goes unused as a result. (bug ROM conservé, pas de BUGFIX)
        PlaySE(SE_BALL);
        StartSpriteAnim(sprite as never, EGG_ANIM_CRACKED_2);
        CreateRandomEggShardSprite();
        CreateRandomEggShardSprite();
      }
      if (sprite.data[0] === 30)
        PlaySE(SE_BALL);
    }
  }
}

/** 1:1 `static void SpriteCB_Egg_WaitHatch(struct Sprite *sprite)` (:816-823). */
function SpriteCB_Egg_WaitHatch(sprite: DecompSprite): void {
  if (++sprite.data[0] > 50) {
    sprite.callback = SpriteCB_Egg_Hatch as unknown as DecompSprite['callback'];
    sprite.data[0] = 0;
  }
}

/** 1:1 `static void SpriteCB_Egg_Hatch(struct Sprite *sprite)` (:825-850). */
function SpriteCB_Egg_Hatch(sprite: DecompSprite): void {
  const rt = _rt();

  // Fade to white to hide transition from egg to Pokémon
  if (sprite.data[0] === 0)
    BeginNormalPaletteFade(0xFFFFFFFF, -1, 0, 16, 0x7FFF /* RGB_WHITEALPHA */);

  // Create a shower of 16 egg shards in 4 groups of 4
  if ((sprite.data[0] >>> 0) < 4) {
    for (let i = 0; i < 4; i++)
      CreateRandomEggShardSprite();
  }

  sprite.data[0]++;

  if (!rt.gPaletteFade.active) {
    // Screen is hidden by the fade to white, hide egg
    PlaySE(SE_EGG_HATCH);
    sprite.invisible = true;
    sprite.callback = SpriteCB_Egg_Reveal as unknown as DecompSprite['callback'];
    sprite.data[0] = 0;
  }
}

/** 1:1 `static void SpriteCB_Egg_Reveal(struct Sprite *sprite)` (:852-872). */
function SpriteCB_Egg_Reveal(sprite: DecompSprite): void {
  const rt = _rt();
  const monSprite = sEggHatchData ? rt.gSprites[sEggHatchData.monSpriteId] : undefined;

  if (sprite.data[0] === 0 && monSprite) {
    // Reveal hatched Pokémon
    monSprite.invisible = false;
    rt.StartSpriteAffineAnim(sEggHatchData!.monSpriteId, 1 /* BATTLER_AFFINE_EMERGE */);
  }

  // Fade back from white for reveal
  if (sprite.data[0] === 8)
    BeginNormalPaletteFade(0xFFFFFFFF, -1, 16, 0, 0x7FFF /* RGB_WHITEALPHA */);

  if (sprite.data[0] <= 9 && monSprite)
    monSprite.y--;

  if (sprite.data[0] > 40)
    sprite.callback = SpriteCallbackDummy as unknown as DecompSprite['callback']; // Finished

  sprite.data[0]++;
}

// #define sVelocX data[1] · sVelocY data[2] · sAccelY data[3] · sDeltaX data[4] · sDeltaY data[5] (:874-878)

/** Wrap s16 (les data[] sprite sont s16 côté GBA). */
const _s16 = (v: number): number => (v << 16) >> 16;

/** 1:1 `static void SpriteCB_EggShard(struct Sprite *sprite)` (:880-892). */
function SpriteCB_EggShard(sprite: DecompSprite): void {
  sprite.data[4] = _s16(sprite.data[4] + sprite.data[1]); // sDeltaX += sVelocX
  sprite.data[5] = _s16(sprite.data[5] + sprite.data[2]); // sDeltaY += sVelocY

  sprite.x2 = (sprite.data[4] / 256) | 0; // division entière C
  sprite.y2 = (sprite.data[5] / 256) | 0;

  sprite.data[2] = _s16(sprite.data[2] + sprite.data[3]); // sVelocY += sAccelY

  // 1:1 `sprite->y + sprite->y2 > sprite->y + 20` (⟺ y2 > 20, gardé verbatim)
  if (sprite.y + sprite.y2 > sprite.y + 20 && sprite.data[2] > 0)
    DestroySprite((sprite as unknown as { spriteId?: number }).spriteId ?? _findSpriteId(sprite));
}

/** Retrouve l'id d'un sprite (DestroySprite(sprite*) du .c → id chez nous). */
function _findSpriteId(sprite: DecompSprite): number {
  const sprites = _rt().gSprites;
  for (let i = 0; i < sprites.length; i++) if (sprites[i] === sprite) return i;
  return 64; // MAX_SPRITES
}

/** 1:1 `static void CreateRandomEggShardSprite(void)` (:894-906). */
function CreateRandomEggShardSprite(): void {
  const data = sEggHatchData!;
  const velocityX = sEggShardVelocities[data.eggShardVelocityId]?.[0] ?? 0;
  const velocityY = sEggShardVelocities[data.eggShardVelocityId]?.[1] ?? 0;
  data.eggShardVelocityId++;

  // Randomly choose one of the 4 shard images
  const spriteAnimIndex = Random() % sSpriteAnimTable_EggShard.length;

  CreateEggShardSprite(EGG_X, EGG_Y - 15, velocityX, velocityY, 100, spriteAnimIndex);
}

/** 1:1 `static void CreateEggShardSprite(u8 x, u8 y, s16 velocityX, s16 velocityY, s16 acceleration, u8 spriteAnimIndex)` (:908-915). */
function CreateEggShardSprite(x: number, y: number, velocityX: number, velocityY: number, acceleration: number, spriteAnimIndex: number): void {
  const rt = _rt();
  const spriteId = CreateSprite({
    tileTag: GFXTAG_EGG_SHARD, paletteTag: PALTAG_EGG, oam: sOamData_EggShard,
    anims: sSpriteAnimTable_EggShard, callback: SpriteCB_EggShard,
  }, x, y, 4);
  const s = rt.gSprites[spriteId];
  if (s) {
    s.data[1] = velocityX;
    s.data[2] = velocityY;
    s.data[3] = acceleration;
    StartSpriteAnim(s as never, spriteAnimIndex);
  }
}

/** 1:1 `static void EggHatchPrintMessage(u8 windowId, u8 *string, u8 x, u8 y, u8 speed)` (:917-924). */
function EggHatchPrintMessage(windowId: number, str: Uint8Array, x: number, y: number, speed: number): void {
  FillWindowPixelBuffer(windowId, 0xFF /* PIXEL_FILL(15) */);
  sEggHatchData!.textColor = [0, 5, 6];
  AddTextPrinterParameterized4(windowId, 1 /* FONT_NORMAL */, x, y, 0, 0, sEggHatchData!.textColor, speed, str);
}

/** 1:1 `u8 GetEggCyclesToSubtract(void)` (:926-939). */
export function GetEggCyclesToSubtract(): number {
  const count = CalculatePlayerPartyCount();
  const ABILITY_MAGMA_ARMOR = (resolveDecompConstant('ABILITY_MAGMA_ARMOR') as number | undefined) ?? 40;
  const ABILITY_FLAME_BODY = (resolveDecompConstant('ABILITY_FLAME_BODY') as number | undefined) ?? 49;
  for (let i = 0; i < count; i++) {
    if (!(GetMonData(gPlayerParty[i], MON_DATA_SANITY_IS_EGG) as number)) {
      const ability = GetMonAbility(gPlayerParty[i]);
      if (ability === ABILITY_MAGMA_ARMOR || ability === ABILITY_FLAME_BODY)
        return 2;
    }
  }
  return 1;
}

/** 1:1 `u16 CountPartyAliveNonEggMons(void)` (:941-946) — special. */
export function CountPartyAliveNonEggMons(): number {
  let aliveNonEggMonsCount = CountStorageNonEggMons();
  aliveNonEggMonsCount += CountPartyAliveNonEggMonsExcept(6 /* PARTY_SIZE */);
  return aliveNonEggMonsCount;
}
