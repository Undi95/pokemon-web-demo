/**
 * starter_choose.ts — Port 1:1 STRICT décomp `src/starter_choose.c` (669l).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/starter_choose.c`.
 *
 * Structure :
 *   - DEFINES (= C:27-34)
 *   - Static data tables (= C:36-348)
 *   - GetStarterPokemon (= C:351-356)
 *   - CB2_ChooseStarter (= C:374-463) — entry init function
 *   - CB2_StarterChoose (= C:465-472) — per-frame tick callback
 *   - Task_StarterChoose (= C:474-482)
 *   - Task_HandleStarterChooseInput (= C:484-516)
 *   - Task_WaitForStarterSprite (= C:518-526)
 *   - Task_AskConfirmStarter (= C:528-536)
 *   - Task_HandleConfirmStarterInput (= C:538-563)
 *   - Task_DeclineStarter (= C:565-568)
 *   - CreateStarterPokemonLabel (= C:570-606)
 *   - ClearStarterLabel (= C:608-617)
 *   - Task_MoveStarterChooseCursor (= C:619-623)
 *   - Task_CreateStarterLabel (= C:625-629)
 *   - CreatePokemonFrontSprite (= C:631-638)
 *   - SpriteCB_SelectionHand (= C:640-647)
 *   - SpriteCB_Pokeball (= C:649-656)
 *   - SpriteCB_StarterPokemon (= C:658-669)
 *
 * Divergences architecturales documentées :
 *   - Le décomp utilise `SetMainCallback2(CB2_StarterChoose)` qui swap le main
 *     callback. Notre TS inline simule via setupNativeScript polling tick().
 *     Pour émuler le scene swap, on `setObjectEventsSuspended(true)` + cache
 *     les NPC sprites au SCENE_INIT, restore au CLEANUP.
 *   - Le décomp utilise ROM-resident assets accessible sync via
 *     `LZ77UnCompVram(asset_ptr, dest)`. Notre TS fetch PNG async puis decompresse.
 *     Asset preload se fait au START (= bloque tick() jusqu'à done) puis tout
 *     le reste tourne sync 1:1 strict.
 *   - Le décomp utilise CreateTask + gTasks[id].func = X. Notre TS reproduit
 *     via Map<id, {data, func}> module-local, dispatch via tick() qui call
 *     les func enregistrées.
 */

import { CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose } from './menu';
import {
  AddWindow, ClearStdWindowAndFrame, ClearWindowTilemap, FillWindowPixelBuffer,
  PutWindowTilemap, RemoveWindow, ShowBg, HideBg, InitBgFromTemplate,
  InitWindows, DrawStdFrameWithCustomTileAndPalette, ScheduleBgCopyTilemapToVram,
  type WindowTemplate,
} from './window';
import { AddTextPrinterParameterized, GetStringCenterAlignXOffset, FONT_NORMAL, FONT_NARROW } from './text';
import { AddTextPrinterParameterized3 } from './menu';
import { LoadUserWindowBorderGfx, preloadTextWindowFrames } from './text_window';
import { getRuntime, LoadPalette, ResetTasks, RunTasks } from '../harness/runtime/decomp-globals';
// 1:1 décomp task.c via le foyer src/task.ts (chantier item 7-② : dissolution du
// mini task-system local — précédent : egg_hatch.ts:420 `CreateTask((t) => Task_X(t.taskId), n)`).
import { CreateTask, DestroyTask, gTasks } from './task';
import { DestroySprite, FreeOamMatrix, _CreateSpriteAtTemplate, ANIMCMD_FRAME, ANIMCMD_END, ANIMCMD_JUMP, FreeAllSpritePalettes, LoadSpriteSheet, LoadSpritePalette, TAG_NONE, ResetSpriteData, type SpriteTemplate } from './sprite';
import { CreateMonPicSprite_Affine, FreeAndDestroyMonPicSprite, ResetAllPicSprites, MON_PIC_AFFINE_FRONT, _registerMonPicSubstrate } from './trainer_pokemon_sprites';
import { BG_PLTT_ID, MAX_SPRITES } from '../harness/runtime/decomp-runtime';
import { GetOverworldTextboxPalettePtr } from './text_window';
// CreateMon NUMÉRIQUE 1:1 (foyer pokemon.c) — remplace la convenience legacy
// engine/pokemon/pokemon:CreateMon(speciesEnum, opts). createEmptyPokemon = la struct cible.
import { CreateMon, createEmptyPokemon } from './pokemon';
import { resolveDecompConstant } from '../harness/runtime/decomp-constants';
import { PlayCry_Normal } from './sound';
import { OT_ID_PLAYER_ID } from '../include/constants/pokemon';
import { GiveMonToPlayer } from './engine/battle/party-storage';
import { VarSet } from './engine/script/script-vars';
import { Sin } from '../harness/runtime/decomp-helpers';
import { CopyMapTilesetsToVram, gMapHeader } from './fieldmap';
import { pauseTilesetAnimations, resumeTilesetAnimations } from './tileset_anims';
import { setFieldCameraSuspended, flushOverworldTilemaps } from './field_camera';
import { setObjectEventsSuspended } from './event_object_movement';
import { getString, initStringsFromDecomp } from '../harness/runtime/decomp-strings';
import { getSpeciesNameFr, loadTextTables, type TextTables } from '../harness/runtime/data-tables';
/** Type local (ex-voie V, supprimee) : l'ancien flow Birch ne retourne plus rien. */
type BattleFlow = { tick(): boolean };
// Voie L (suppression voie V) : 1er combat (Birch) via la VRAIE boucle decomp.
import { StartFirstBattle } from './battle_setup';
import { registerAffineAnim, registerAffineAnimTable } from './engine/decomp-impls/sprite-affine-extras';
import { StartSpriteAffineAnim } from './engine/decomp-impls/sprite-engine-impl';
import {
  A_BUTTON, B_BUTTON, DPAD_RIGHT, DPAD_LEFT,
} from '../include/gba/io_reg';

// ─── DEFINES (= starter_choose.c:27-34) ───────────────────────────────────
const STARTER_MON_COUNT = 3;
const STARTER_PKMN_POS_X = 240 / 2;  // DISPLAY_WIDTH / 2 = 120
const STARTER_PKMN_POS_Y = 64;
const TAG_POKEBALL_SELECT = 0x1000;
const TAG_STARTER_CIRCLE = 0x1001;

// ─── Affine anims (1:1 décomp C:267-272) ─────────────────────────────────
// sAffineAnim_StarterPokemon : delta scale up from 16 to 256 sur 16 frames.
//   AFFINEANIMCMD_FRAME(16, 16, 0, 0)   ← frame 0 : Absolute set xScale=16
//   AFFINEANIMCMD_FRAME(16, 16, 0, 15)  ← frame 1 : Relative +16/+16 per frame × 15
//   AFFINEANIMCMD_END
// Registered une fois au load module (= idempotent dans la registry).
registerAffineAnim('sAffineAnim_StarterPokemon', {
  frames: [
    { xScale: 16, yScale: 16, rotation: 0, duration: 0 },
    { xScale: 16, yScale: 16, rotation: 0, duration: 15 },
  ],
  terminator: 'END',
});
registerAffineAnimTable('sAffineAnims_StarterPokemon', {
  affineAnims: ['sAffineAnim_StarterPokemon'],
});

// sAffineAnim_StarterCircle (= C:274-279) : scale up from 20 to 320.
registerAffineAnim('sAffineAnim_StarterCircle', {
  frames: [
    { xScale: 20, yScale: 20, rotation: 0, duration: 0 },
    { xScale: 20, yScale: 20, rotation: 0, duration: 15 },
  ],
  terminator: 'END',
});
registerAffineAnimTable('sAffineAnims_StarterCircle', {
  affineAnims: ['sAffineAnim_StarterCircle'],
});

// ─── BG/Window/OAM/anim data (= C:120-282) ────────────────────────────────

/** 1:1 décomp `sBgTemplates[3]` (C:120-149). */
const sBgTemplates = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 7,  screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 6,  screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
];

/** 1:1 décomp `sWindowTemplates[]` (C:63-75). */
const sWindowTemplates: WindowTemplate[] = [
  { bg: 0, tilemapLeft: 3, tilemapTop: 15, width: 24, height: 4, paletteNum: 14, baseBlock: 0x0200 },
];

/** 1:1 décomp `sWindowTemplate_ConfirmStarter` (C:77-86). */
const sWindowTemplate_ConfirmStarter: WindowTemplate = {
  bg: 0, tilemapLeft: 24, tilemapTop: 9, width: 5, height: 4, paletteNum: 14, baseBlock: 0x0260,
};

/** 1:1 décomp `sWindowTemplate_StarterLabel` (C:88-97). */
const sWindowTemplate_StarterLabel: WindowTemplate = {
  bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 13, height: 4, paletteNum: 14, baseBlock: 0x0274,
};

/** 1:1 décomp `sPokeballCoords[STARTER_MON_COUNT][2]` (C:99-104). */
const sPokeballCoords: readonly (readonly [number, number])[] = [
  [60, 64], [120, 88], [180, 64],
];

/** 1:1 décomp `sStarterLabelCoords[STARTER_MON_COUNT][2]` (C:106-111). */
const sStarterLabelCoords: readonly (readonly [number, number])[] = [
  [0, 9], [16, 10], [8, 4],
];

/** 1:1 décomp `sStarterMon[STARTER_MON_COUNT]` (C:113-118).
 *  TS : species enum names (= no SPECIES_ index lookup). */
const sStarterMon: readonly string[] = [
  'SPECIES_TREECKO', 'SPECIES_TORCHIC', 'SPECIES_MUDKIP',
];

/** 1:1 décomp `sTextColors[]` (C:151).
 *  {TEXT_COLOR_TRANSPARENT, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY}. */
const sTextColors: readonly number[] = [0, 1, 2];

/** 1:1 décomp `sCursorCoords[][]` (C:204-209). Hand cursor base position
 *  au-dessus du pokeball sélectionné. */
const sCursorCoords: readonly (readonly [number, number])[] = [
  [60, 32], [120, 56], [180, 32],
];

// ─── OAM / anims / templates 1:1 starter_choose.c (objets DIRECTS, tags NUMÉRIQUES
//     cohérents → fix couleur cercle/pokéball + câblage callback cercle → fix jitter.
//     Remplace la voie par-nom `CreateSpriteFromTemplate` (registre data pourrie). ──
/** 1:1 sOam_Hand (c:153) : 32x32, affine OFF, prio 1. */
const sOam_Hand: SpriteTemplate['oam'] = { shape: 0, size: 2, priority: 1, affineMode: 0 };
/** 1:1 sOam_Pokeball (c:170) : 32x32, affine OFF, prio 1. */
const sOam_Pokeball: SpriteTemplate['oam'] = { shape: 0, size: 2, priority: 1, affineMode: 0 };
/** 1:1 sOam_StarterCircle (c:187) : 64x64, AFFINE_DOUBLE(3), prio 1. */
const sOam_StarterCircle: SpriteTemplate['oam'] = { shape: 0, size: 3, priority: 1, affineMode: 3 };
// Anims (c:211-249) — tileNum = offset dans la sheet.
const sAnim_Hand = [ANIMCMD_FRAME(48, 30), ANIMCMD_END];
const sAnim_Pokeball_Still = [ANIMCMD_FRAME(0, 30), ANIMCMD_END];
const sAnim_Pokeball_Moving = [
  ANIMCMD_FRAME(16, 4), ANIMCMD_FRAME(0, 4), ANIMCMD_FRAME(32, 4), ANIMCMD_FRAME(0, 4),
  ANIMCMD_FRAME(16, 4), ANIMCMD_FRAME(0, 4), ANIMCMD_FRAME(32, 4), ANIMCMD_FRAME(0, 4),
  ANIMCMD_FRAME(0, 32),
  ANIMCMD_FRAME(16, 8), ANIMCMD_FRAME(0, 8), ANIMCMD_FRAME(32, 8), ANIMCMD_FRAME(0, 8),
  ANIMCMD_FRAME(16, 8), ANIMCMD_FRAME(0, 8), ANIMCMD_FRAME(32, 8), ANIMCMD_FRAME(0, 8),
  ANIMCMD_JUMP(0),
];
const sAnim_StarterCircle = [ANIMCMD_FRAME(0, 8), ANIMCMD_END];
const sAnims_Hand: ReadonlyArray<ReadonlyArray<unknown>> = [sAnim_Hand];
const sAnims_Pokeball: ReadonlyArray<ReadonlyArray<unknown>> = [sAnim_Pokeball_Still, sAnim_Pokeball_Moving];
const sAnims_StarterCircle: ReadonlyArray<ReadonlyArray<unknown>> = [sAnim_StarterCircle];
/** 1:1 sSpriteTemplate_Hand (c:317) : callback = SpriteCB_SelectionHand. */
const sSpriteTemplate_Hand: SpriteTemplate = {
  tileTag: TAG_POKEBALL_SELECT, paletteTag: TAG_POKEBALL_SELECT, oam: sOam_Hand, anims: sAnims_Hand,
  affineAnims: null, callback: (s) => SpriteCB_SelectionHand(s as never),
};
/** 1:1 sSpriteTemplate_Pokeball (c:328). */
const sSpriteTemplate_Pokeball: SpriteTemplate = {
  tileTag: TAG_POKEBALL_SELECT, paletteTag: TAG_POKEBALL_SELECT, oam: sOam_Pokeball, anims: sAnims_Pokeball,
  affineAnims: null, callback: (s) => SpriteCB_Pokeball(s as never, (s as { spriteId: number }).spriteId),
};
/** 1:1 sSpriteTemplate_StarterCircle (c:339) : affine + callback = SpriteCB_StarterPokemon (le MOUVEMENT du cercle vers le centre). */
const sSpriteTemplate_StarterCircle: SpriteTemplate = {
  tileTag: TAG_STARTER_CIRCLE, paletteTag: TAG_STARTER_CIRCLE, oam: sOam_StarterCircle, anims: sAnims_StarterCircle,
  affineAnims: 'sAffineAnims_StarterCircle', callback: (s) => SpriteCB_StarterPokemon(s as never),
};

// ─── Asset URLs (= ROM equivalents) ──────────────────────────────────────
// J16 — tiles.png a 32 couleurs (2 sub-palettes : bag=sub-pal 0, grass=sub-pal 1).
// loadIndexedPngStrict tronque à 16 → pixels grass perdus. Solution 1:1 strict :
// load .4bpp.bin (= raw 4bpp indices préservés 0-15 par sub-pal) + .gbapal (= palette
// complète 32 couleurs). C'est la sortie canonique de gbagfx (décomp tool).
const BIRCH_TILES_BIN_URL = '/decomp/em/starter_choose/tiles.4bpp.bin';
const BIRCH_TILES_PAL_URL = '/decomp/em/starter_choose/tiles.gbapal';
const BIRCH_BAG_TILEMAP_URL = '/decomp/em/starter_choose/birch_bag.bin';
const BIRCH_GRASS_TILEMAP_URL = '/decomp/em/starter_choose/birch_grass.bin';
const POKEBALL_SHEET_URL = '/decomp/em/starter_choose/pokeball_selection.png';
const STARTER_CIRCLE_SHEET_URL = '/decomp/em/starter_choose/starter_circle.png';

// ─── Module state (= 1:1 décomp C:52) ───────────────────────────────────

/** 1:1 décomp `static u16 sStarterLabelWindowId` (C:52). WINDOW_NONE = -1 en TS. */
let sStarterLabelWindowId = -1;

/** 1:1 décomp `sStarterChooseWindowId = 0` (= InitWindows index 0).
 *  Notre TS : AddWindow retourne un id dynamique, on le track ici. */
let sStarterChooseWindowId = -1;

// ─── Task system : DISSOUS (item 7-②) — les tasks vivent dans le VRAI registre
// global gTasks (src/task.ts → rt.gTasks), 1:1 décomp. Le mini task-system local
// (Map module + CreateTask/getTask maison) dupliquait le cœur moteur task.c.

// ─── Task data alias (= 1:1 décomp C:366-368) ───────────────────────────
const T_STARTER_SELECTION = 0;  // tStarterSelection = data[0]
const T_PKMN_SPRITE_ID = 1;     // tPkmnSpriteId = data[1]
const T_CIRCLE_SPRITE_ID = 2;   // tCircleSpriteId = data[2]

// ─── Sprite data alias (= 1:1 décomp C:371-372) ─────────────────────────
const S_TASK_ID = 0;  // sTaskId = data[0]
const S_BALL_ID = 1;  // sBallId = data[1]

// ─── Asset state ────────────────────────────────────────────────────────
interface Assets {
  birchTilesData: Uint8Array;
  birchPalette: Uint16Array;
  birchBagTilemap: Uint8Array;
  birchGrassTilemap: Uint8Array;
  /** Standard overworld message box palette (= gMessageBox_Pal).
   *  Fallback car GetOverworldTextboxPalettePtr() peut retourner null si
   *  l'asset n'est pas dans assetCache. */
  messageBoxPalette: Uint16Array;
}
let _assets: Assets | null = null;

// ─── Flow done flag + result + cleanup state ───────────────────────────
let _done = false;
let _committedStarter = -1;
let _initRan = false;
let _firstBattleFlow: BattleFlow | null = null;
let _firstBattleStarted = false;
let _savedVisibleOam = new Set<number>();
let _savedVisibleSpriteIds: number[] = [];
let _starterPokeballSpriteIds: number[] = [];
let _starterHandSpriteId = -1;

// ─── GetStarterPokemon (= 1:1 décomp C:351-356) ─────────────────────────
export function GetStarterPokemon(chosenStarterId: number): string {
  if (chosenStarterId > STARTER_MON_COUNT) chosenStarterId = 0;
  return sStarterMon[chosenStarterId];
}

// ─── async asset preload (= ROM equivalent for fetch+decompress) ────────
async function preloadAssets(): Promise<void> {
  if (_assets) return;
  // Ensure decomp strings + species names loaded
  await initStringsFromDecomp();
  try {
    const resp = await fetch('/decomp/em/text-tables.json');
    if (resp.ok) loadTextTables(await resp.json() as TextTables);
  } catch (e) { void e; }
  // J16 — ensure user-chosen window frame assets are loaded (= LoadUserWindowBorderGfx
  // depends on them). Idempotent if already loaded by boot.
  await preloadTextWindowFrames();

  // Birch bag scene assets + standard message box palette.
  // J16 : tiles.4bpp.bin (raw 4bpp indices 0-15 par sub-pal) + tiles.gbapal
  // (32 colors = 2 sub-palettes : bag + grass).
  const [tilesBinResp, tilesPalResp, tilemapBagResp, tilemapGrassResp, msgBoxPalResp] = await Promise.all([
    fetch(BIRCH_TILES_BIN_URL),
    fetch(BIRCH_TILES_PAL_URL),
    fetch(BIRCH_BAG_TILEMAP_URL),
    fetch(BIRCH_GRASS_TILEMAP_URL),
    fetch('/decomp/em/text_window/message_box.gbapal'),
  ]);
  const { loadIndexedPngStrict, loadGbaPal } = await import('../harness/gba/png-loader');
  // tiles.4bpp.bin : raw tile data
  const tilesData = new Uint8Array(await tilesBinResp.arrayBuffer());
  // tiles.gbapal : 64 bytes = 32 u16 colors (= 2 sub-palettes 4bpp).
  const tilesPalBuf = await tilesPalResp.arrayBuffer();
  const tilesPalette = new Uint16Array(tilesPalBuf);
  // tilemap : raw .bin (uncompressed in our extract)
  const bagTilemap = new Uint8Array(await tilemapBagResp.arrayBuffer());
  const grassTilemap = new Uint8Array(await tilemapGrassResp.arrayBuffer());
  // message_box.gbapal : raw 32 bytes = 16 u16 colors (= gMessageBox_Pal).
  const msgBoxPalBuf = await msgBoxPalResp.arrayBuffer();
  const messageBoxPalette = new Uint16Array(msgBoxPalBuf);

  // Pre-load 3 starter front sprites + palettes → substrat sync de trainer_pokemon_sprites
  // (= ROM-resident equivalent pour CreateMonPicSprite_Affine sync).
  for (const speciesEnum of sStarterMon) {
    const speciesPath = speciesEnum.replace('SPECIES_', '').toLowerCase();
    const pngUrl = `/decomp/em/pokemon/${speciesPath}/front.png`;
    const palUrl = `/decomp/em/pokemon/${speciesPath}/normal.pal`;
    try {
      const [front, pal] = await Promise.all([
        loadIndexedPngStrict(pngUrl, 4),
        loadGbaPal(palUrl),
      ]);
      // Pré-remplit le substrat sync de trainer_pokemon_sprites (= ROM-resident equivalent)
      // pour que CreateMonPicSprite_Affine(species,...) (sync, 1:1) y lise.
      _registerMonPicSubstrate(speciesEnum, front.charData, pal.subarray(0, 16));
    } catch (e) {
      console.warn(`[StarterChoose] failed to load mon pic for ${speciesEnum}:`, e);
    }
  }

  _assets = {
    birchTilesData: tilesData,
    birchPalette: tilesPalette,
    birchBagTilemap: bagTilemap,
    birchGrassTilemap: grassTilemap,
    messageBoxPalette,
  };
}

// ─── CB2_ChooseStarter (= 1:1 décomp C:374-463) ─────────────────────────
async function CB2_ChooseStarter(): Promise<void> {
  await preloadAssets();
  if (!_assets) throw new Error('[StarterChoose] asset preload failed');
  const rt = getRuntime();
  if (!rt) throw new Error('[StarterChoose] no runtime');

  // SetVBlankCallback(NULL); — NOP (our compositor handles vblank).

  // SetGpuReg(REG_OFFSET_DISPCNT, 0);
  rt.SetGpuReg(0x00, 0);
  // SetGpuReg(REG_OFFSET_BG3CNT/BG2CNT/BG1CNT/BG0CNT, 0);
  rt.SetGpuReg(0x08, 0); rt.SetGpuReg(0x0A, 0);
  rt.SetGpuReg(0x0C, 0); rt.SetGpuReg(0x0E, 0);

  // ChangeBgX/Y to 0 for all 4 BGs
  for (let i = 0x10; i <= 0x1F; i += 2) rt.SetGpuReg(i, 0);

  // DmaFill16(3, 0, VRAM, VRAM_SIZE);
  rt.gba.vram.fill(0);
  // DmaFill32(3, 0, OAM, OAM_SIZE);
  for (let i = 0; i < 128; i++) {
    const oam = rt.gba.oam[i];
    if (oam) {
      _savedVisibleOam.add(i);
      oam.visible = false;
    }
  }
  // DmaFill16(3, 0, PLTT, PLTT_SIZE);
  // Notre TS : gPlttBufferUnfaded/Faded sont des PaletteBuffer (= API .set/.get).
  // Clear via .set(i, 0) loop. Length 512 = 32 palettes × 16 colors.
  const pbufU = rt.gPlttBufferUnfaded as { set?: (i: number, v: number) => void; length?: number } | undefined;
  const pbufF = rt.gPlttBufferFaded as { set?: (i: number, v: number) => void; length?: number } | undefined;
  if (pbufU?.set) for (let i = 0; i < (pbufU.length ?? 512); i++) pbufU.set(i, 0);
  if (pbufF?.set) for (let i = 0; i < (pbufF.length ?? 512); i++) pbufF.set(i, 0);

  // 1:1 décomp émulation SetMainCallback2 : suspend OW NPCs + PLAYER (= notre TS
  // inline ne swap pas le main callback, donc on freeze l'OW tick + hide ALL
  // sprites pré-existants). Le décomp swap le main callback + DmaFill32 OAM
  // → OW disparaît. Notre TS doit hide ALL pre-existing sprites pour émuler.
  // (Le player avatar utilise 2+ OAM slots : body + reflection/shadow.)
  _savedVisibleSpriteIds = [];
  // 1:1 décomp : boucle indexée sur les MAX_SPRITES slots fixes (gSprites[id]).
  for (let id = 0; id < MAX_SPRITES; id++) {
    const s = rt.gSprites[id];
    if (s && !s.invisible) {
      _savedVisibleSpriteIds.push(id);
      s.invisible = true;
    }
  }
  setObjectEventsSuspended(true);
  pauseTilesetAnimations();
  setFieldCameraSuspended(true);

  // LZ77UnCompVram(gBirchBagGrass_Gfx, VRAM); — write tiles à charBase 0.
  rt.gba.vram.set(_assets.birchTilesData, 0);
  // LZ77UnCompVram(gBirchBagTilemap, BG_SCREEN_ADDR(6)); — mapBase 6.
  rt.gba.vram.set(_assets.birchBagTilemap, 6 * 0x800);
  // LZ77UnCompVram(gBirchGrassTilemap, BG_SCREEN_ADDR(7)); — mapBase 7.
  rt.gba.vram.set(_assets.birchGrassTilemap, 7 * 0x800);

  // ResetBgsAndClearDma3BusyFlags(0); — NOP.
  // InitBgsFromTemplates(0, sBgTemplates, 3);
  for (const tpl of sBgTemplates) InitBgFromTemplate(tpl);
  // InitWindows(sWindowTemplates); — 1:1 décomp : FreeAllWindowBuffers + push windows.
  // CRITIQUE : sans le FreeAllWindowBuffers, les windows pré-existantes (= overworld
  // dialog / autre écran) restent → AddWindow incremente nextWindowId au-delà,
  // et nos AddTextPrinterParameterized3 ciblent des windows résiduelles invalides.
  const winIds = InitWindows(sWindowTemplates);
  sStarterChooseWindowId = winIds[0];

  // DeactivateAllTextPrinters(); — NOP (our printers re-trigger per-window).
  // LoadUserWindowBorderGfx(0, 0x2A8, BG_PLTT_ID(13));
  LoadUserWindowBorderGfx(0, 0x2A8, BG_PLTT_ID(13));
  // ClearScheduledBgCopiesToVram(); — NOP.
  // ScanlineEffect_Stop(); — NOP.
  // ResetTasks(); — 1:1 décomp C:412 (registre gTasks GLOBAL — même geste que tout
  // écran porté, cf. party_menu.ts:4485 / egg_hatch.ts:470. Les field tasks tuées
  // sont recréées par le flux post-combat ResumeMap, overworld.ts:1266, comme après
  // n'importe quel combat — battle_main fait le même ResetTasks à son init).
  ResetTasks();
  // ResetSpriteData() : 1:1 décomp CB2_ChooseStarter (starter_choose.c:413).
  // 🩸 ÉTAIT un commentaire mensonger (« already done via OAM fill above ») : le DmaFill32 OAM
  // + le hide-all ci-dessus n'effacent QUE l'affichage — l'ALLOCATEUR de tiles OBJ
  // (sSpriteTileAllocBitmap / sSpriteTileRanges / gReservedSpriteTileCount) restait chargé de
  // TOUTES les sheets de l'overworld. Constaté en jeu (sonde live) : la sheet pokéball se
  // faisait allouer à la tuile 895/1024 sur une map presque vide ; dès qu'une sheet de plus est
  // chargée côté field, AllocSpriteTiles ne trouve plus 64 tuiles contiguës → LoadSpriteSheet
  // retourne 0 SANS copier en OBJ VRAM → pokéballs + main + pic du starter INVISIBLES.
  // On reset donc l'allocateur ici, exactement comme le fait ResetSpriteData (sprite.ts:1537)
  // et comme le fait déjà InitPlayerAvatar au chargement de map (field_player_avatar.ts:775-784).
  // ⚠️ Le wipe de gSprites fait PARTIE du fix, il n'est pas optionnel : masquer les sprites OW
  // ne suffit pas — leurs requêtes de copie de frame (ProcessSpriteCopyRequests) continuent
  // d'écrire en OBJ VRAM à leur tileBase, donc libérer l'allocateur SANS les détruire fait
  // atterrir la sheet pokéball sur les tuiles du joueur, qui la réécrase ensuite (vérifié en
  // jeu : pokéballs garbled). Les sprites OW sont intégralement recréés au retour field par
  // loadAndInitMap → InitPlayerAvatar + SpawnObjectEventsOnReturnToField, exactement comme
  // après n'importe quel combat.
  ResetSpriteData();
  // ResetPaletteFade(); — NOP (runtime manages).
  // FreeAllSpritePalettes() : 1:1 décomp CB2_ChooseStarter (c:415) — libère TOUS les slots
  // OBJ palette (reserved=0 + tags=TAG_NONE). 🩸 ÉTAIT un no-op silencieux : appelé via
  // `__sprite.FreeAllSpritePalettes?.()` qui est UNDEFINED (non exposé sur __sprite) → les
  // palettes OBJ de l'overworld (slots 0-13) restaient → la pokéball/cercle prenaient des
  // slots hauts (14/15) → COLLISION avec le slot 14 hardcodé du mon-pic (pokéball affichait
  // la palette du starter choisi). Fix = import direct de FreeAllSpritePalettes.
  FreeAllSpritePalettes();
  // ResetAllPicSprites() : 1:1 décomp CB2_ChooseStarter (c:416) — clear le registre mon-pic.
  ResetAllPicSprites();

  // LoadPalette(GetOverworldTextboxPalettePtr(), BG_PLTT_ID(14), PLTT_SIZE_4BPP);
  // Fallback : GetOverworldTextboxPalettePtr() peut retourner null si l'asset
  // gMessageBox_Pal n'est pas dans assetCache. On a précaché via fetch direct.
  const textboxPal = GetOverworldTextboxPalettePtr() ?? _assets.messageBoxPalette;
  LoadPalette(textboxPal, BG_PLTT_ID(14), textboxPal.length * 2);
  // LoadPalette(gBirchBagGrass_Pal, BG_PLTT_ID(0), sizeof(gBirchBagGrass_Pal));
  LoadPalette(_assets.birchPalette, BG_PLTT_ID(0), _assets.birchPalette.length * 2);
  // 1:1 décomp LoadCompressedSpriteSheet(&sSpriteSheet_PokeballSelect[0]) +
  // LoadCompressedSpriteSheet(&sSpriteSheet_StarterCircle[0]) + LoadSpritePalettes(sSpritePalettes_StarterChoose).
  // Chargement DIRECT via les fns 1:1 sprite.ts (LoadSpriteSheet/LoadSpritePalette) — plus de
  // lookup dans le registre auto sprite-system.ts (dissolution decomp-data : il perd SPRITE_SHEETS/
  // SPRITE_PALETTES). Tags NUMÉRIQUES 1:1 (TAG_POKEBALL_SELECT=0x1000 / TAG_STARTER_CIRCLE=0x1001).
  // sheet = .4bpp via loadIndexedPngStrict (indices PLTE-cohérents) ; palette = PLTE chunk (même ordre).
  {
    const { loadIndexedPngStrict, extractPngPlte } = await import('../harness/gba/png-loader');
    const pokeballGfx = await loadIndexedPngStrict(POKEBALL_SHEET_URL, 4);
    LoadSpriteSheet({ data: pokeballGfx.charData, size: pokeballGfx.charData.length, tag: TAG_POKEBALL_SELECT });
    const circleGfx = await loadIndexedPngStrict(STARTER_CIRCLE_SHEET_URL, 4);
    LoadSpriteSheet({ data: circleGfx.charData, size: circleGfx.charData.length, tag: TAG_STARTER_CIRCLE });
    const pokeballPlte = await extractPngPlte(POKEBALL_SHEET_URL);
    if (pokeballPlte) LoadSpritePalette({ data: pokeballPlte.subarray(0, 16), tag: TAG_POKEBALL_SELECT });
    const circlePlte = await extractPngPlte(STARTER_CIRCLE_SHEET_URL);
    if (circlePlte) LoadSpritePalette({ data: circlePlte.subarray(0, 16), tag: TAG_STARTER_CIRCLE });
  }
  // BeginNormalPaletteFade(PALETTES_ALL, 0, 0x10, 0, RGB_BLACK);
  rt.BeginNormalPaletteFade(0xFFFFFFFF, 0, 0x10, 0, 0);

  // EnableInterrupts(DISPSTAT_VBLANK); — NOP.
  // SetVBlankCallback(VblankCB_StarterChoose); — NOP.
  // SetMainCallback2(CB2_StarterChoose); — handled by tick polling.

  // SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR);
  rt.SetGpuReg(0x48, 0x003F);
  // SetGpuReg(REG_OFFSET_WINOUT, WINOUT_WIN01_BG_ALL | WINOUT_WIN01_OBJ);
  rt.SetGpuReg(0x4A, 0x001F);
  // SetGpuReg(REG_OFFSET_WIN0H/V, 0);
  rt.SetGpuReg(0x40, 0); rt.SetGpuReg(0x44, 0);
  // SetGpuReg(REG_OFFSET_BLDCNT, TGT1 BG1|BG2|BG3|OBJ|BD | DARKEN);
  // DARKEN = bits 6-7 = 0b11 = 0xC0. Target1 BG1|BG2|BG3|OBJ|BD = bits 1..5 = 0x3E.
  // Total = 0xC0 | 0x3E = 0xFE. (Avant : 0x00BE = LIGHTEN au lieu de DARKEN → BUG.)
  rt.SetGpuReg(0x50, 0x00FE);
  // SetGpuReg(REG_OFFSET_BLDALPHA, 0);
  rt.SetGpuReg(0x52, 0);
  // SetGpuReg(REG_OFFSET_BLDY, 7);
  rt.SetGpuReg(0x54, 7);
  // SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON | DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);
  // = 0x2000 | 0x1000 | 0x0040 = 0x3040. Plus BG_ON pour BG0/2/3 :
  // BG0_ON=0x0100, BG2_ON=0x0400, BG3_ON=0x0800 → 0x0D00. Total = 0x3D40.
  rt.SetGpuReg(0x00, 0x3D40);

  // ShowBg(0); ShowBg(2); ShowBg(3);
  ShowBg(0); ShowBg(2); ShowBg(3);
  // Hide overworld BGs not used
  HideBg(1);

  // taskId = CreateTask(Task_StarterChoose, 0);
  const taskId = CreateTask((t: { taskId: number }) => Task_StarterChoose(t.taskId), 0);
  // gTasks[taskId].tStarterSelection = 1;
  gTasks[taskId].data[T_STARTER_SELECTION] = 1;

  // Create hand sprite : spriteId = CreateSprite(&sSpriteTemplate_Hand, 120, 56, 2);
  const handSpriteId = _CreateSpriteAtTemplate(rt, sSpriteTemplate_Hand, 120, 56, 2);
  // gSprites[spriteId].data[0] = taskId; (callback SpriteCB_SelectionHand posé par le template)
  const handSprite = rt.gSprites[handSpriteId];
  if (handSprite) {
    handSprite.data ||= new Array(8).fill(0);
    handSprite.data[0] = taskId;
  }
  _starterHandSpriteId = handSpriteId;

  // Create 3 Poké Ball sprites (= 1:1 décomp C:450-460)
  _starterPokeballSpriteIds = [];
  for (let i = 0; i < STARTER_MON_COUNT; i++) {
    const spriteId = _CreateSpriteAtTemplate(rt, sSpriteTemplate_Pokeball, sPokeballCoords[i][0], sPokeballCoords[i][1], 2);
    // gSprites[spriteId].sTaskId = taskId; sBallId = i; (callback SpriteCB_Pokeball posé par le template)
    const sprite = rt.gSprites[spriteId];
    if (sprite) {
      sprite.data ||= new Array(8).fill(0);
      sprite.data[S_TASK_ID] = taskId;
      sprite.data[S_BALL_ID] = i;
    }
    _starterPokeballSpriteIds.push(spriteId);
  }

  // sStarterLabelWindowId = WINDOW_NONE;
  sStarterLabelWindowId = -1;
}

// ─── CB2_StarterChoose (= 1:1 décomp C:465-472) ─────────────────────────
/** Per-frame callback. Polled via tick() returned by startChooseStarterFlow.
 *  Le décomp fait :
 *    RunTasks();
 *    AnimateSprites();
 *    BuildOamBuffer();
 *    DoScheduledBgTilemapCopiesToVram();
 *    UpdatePaletteFade();
 *  Notre runtime gère AnimateSprites/BuildOamBuffer/UpdatePaletteFade en main
 *  loop. On run juste les tasks ici. */
function CB2_StarterChoose(): boolean {
  // 1:1 décomp C:467 : RunTasks() sur le registre GLOBAL. La garde idempotente du
  // runtime (decomp-runtime.ts:1936 `_runTasksCalledThisFrame`) garantit 1 run/frame
  // même si un autre CB2/scene a déjà pompé ce frame.
  RunTasks();
  // First battle flow tick (= post-COMMIT chained battle).
  if (_firstBattleFlow && _firstBattleStarted) {
    if (_firstBattleFlow.tick()) {
      _firstBattleFlow = null;
      _done = true;  // exit ChooseStarter flow → script resumes
    }
  }
  return _done;
}

// ─── Task_StarterChoose (= 1:1 décomp C:474-482) ────────────────────────
function Task_StarterChoose(taskId: number): void {
  const task = gTasks[taskId];
  CreateStarterPokemonLabel(task.data[T_STARTER_SELECTION]);
  // DrawStdFrameWithCustomTileAndPalette(0, FALSE, 0x2A8, 0xD);
  DrawStdFrameWithCustomTileAndPalette(sStarterChooseWindowId, false, 0x2A8, 0xD);
  // AddTextPrinterParameterized(0, FONT_NORMAL, gText_BirchInTrouble, 0, 1, 0, NULL);
  FillWindowPixelBuffer(sStarterChooseWindowId, 0x11);
  AddTextPrinterParameterized(
    sStarterChooseWindowId, 1 /* FONT_NORMAL */,
    getString('gText_BirchInTrouble'), 0, 1, 0, null,
  );
  // PutWindowTilemap(0);
  PutWindowTilemap(sStarterChooseWindowId);
  // ScheduleBgCopyTilemapToVram(0);
  ScheduleBgCopyTilemapToVram(0);
  // gTasks[taskId].func = Task_HandleStarterChooseInput;
  task.func = (t: { taskId: number }) => Task_HandleStarterChooseInput(t.taskId);
}

// ─── Task_HandleStarterChooseInput (= 1:1 décomp C:484-516) ─────────────
function Task_HandleStarterChooseInput(taskId: number): void {
  const task = gTasks[taskId];
  const selection = task.data[T_STARTER_SELECTION];
  const rt = getRuntime();
  if (!rt) return;
  const newKeys = rt.gMain?.newKeys ?? 0;

  if (newKeys & A_BUTTON) {
    // 1:1 décomp C:488-505 : ClearStarterLabel + spawn StarterCircle + mon sprite.
    ClearStarterLabel();
    // spriteId = CreateSprite(&sSpriteTemplate_StarterCircle, ...). _CreateSpriteAtTemplate pose
    // l'affine (AllocOamMatrix + StartSpriteAffineAnim sur sAffineAnims_StarterCircle) ET le
    // callback SpriteCB_StarterPokemon = le MOUVEMENT du cercle vers le centre (1:1 c:347).
    const circleId = _CreateSpriteAtTemplate(rt, sSpriteTemplate_StarterCircle, sPokeballCoords[selection][0], sPokeballCoords[selection][1], 1);
    task.data[T_CIRCLE_SPRITE_ID] = circleId;
    // CreatePokemonFrontSprite : spawn front mon sprite at pokeball pos.
    const pkmnId = CreatePokemonFrontSprite(
      GetStarterPokemon(selection),
      sPokeballCoords[selection][0], sPokeballCoords[selection][1],
    );
    // 1:1 décomp C:500-501 :
    //   gSprites[spriteId].affineAnims = &sAffineAnims_StarterPokemon;
    //   gSprites[spriteId].callback = SpriteCB_StarterPokemon;
    // La matrice OAM + l'affine anim ont déjà été allouées/démarrées par CreateMonPicSprite_Affine
    // (1:1 InitSpriteAffineAnim) ; ici on OVERRIDE juste la table affine (battle → starter) + le
    // callback (mouvement vers le centre), puis on re-StartSpriteAffineAnim pour réinit avec la table.
    const pkmnSprite = rt.gSprites[pkmnId];
    if (pkmnSprite) {
      pkmnSprite.affineAnimsTableName = 'sAffineAnims_StarterPokemon';
      StartSpriteAffineAnim(pkmnSprite as never, 0);
      pkmnSprite.callback = (s) => SpriteCB_StarterPokemon(s);
    }
    task.data[T_PKMN_SPRITE_ID] = pkmnId;
    task.func = (t: { taskId: number }) => Task_WaitForStarterSprite(t.taskId);
  } else if ((newKeys & DPAD_LEFT) && selection > 0) {
    // 1:1 décomp C:506-509.
    task.data[T_STARTER_SELECTION]--;
    task.func = (t: { taskId: number }) => Task_MoveStarterChooseCursor(t.taskId);
  } else if ((newKeys & DPAD_RIGHT) && selection < STARTER_MON_COUNT - 1) {
    // 1:1 décomp C:511-514.
    task.data[T_STARTER_SELECTION]++;
    task.func = (t: { taskId: number }) => Task_MoveStarterChooseCursor(t.taskId);
  }
}

// ─── Task_WaitForStarterSprite (= 1:1 décomp C:518-526) ─────────────────
function Task_WaitForStarterSprite(taskId: number): void {
  const task = gTasks[taskId];
  const rt = getRuntime();
  if (!rt) return;
  const circleSprite = rt.gSprites[task.data[T_CIRCLE_SPRITE_ID]];
  if (!circleSprite) {
    // Dette R3 : sans circle sprite (= asset load failed), skip wait → confirm directly.
    task.func = (t: { taskId: number }) => Task_AskConfirmStarter(t.taskId);
    return;
  }
  // 1:1 STRICT décomp C:518-526 : le cercle se déplace via SON callback SpriteCB_StarterPokemon
  // (posé par sSpriteTemplate_StarterCircle = 1:1 c:347) + son affine scale (sAffineAnims_StarterCircle).
  // La task ATTEND juste : affineAnimEnded && x==POS && y==POS. (Avant : émulation du mouvement DANS
  // la task car le callback du cercle n'était pas câblé → sous-pixel = jitter 1px. Corrigé.)
  if ((circleSprite as { affineAnimEnded?: boolean }).affineAnimEnded
      && circleSprite.x === STARTER_PKMN_POS_X
      && circleSprite.y === STARTER_PKMN_POS_Y) {
    task.func = (t: { taskId: number }) => Task_AskConfirmStarter(t.taskId);
  }
}

// ─── Task_AskConfirmStarter (= 1:1 décomp C:528-536) ────────────────────
function Task_AskConfirmStarter(taskId: number): void {
  const task = gTasks[taskId];
  // 1:1 décomp starter_choose.c:530 : PlayCry_Normal(GetStarterPokemon(tStarterSelection), 0).
  // GetStarterPokemon rend le NOM d'espèce (sStarterMon = string[]) → resolveDecompConstant
  // pour obtenir le species NUMBER attendu par le moteur natif.
  const starterSpecies = resolveDecompConstant(GetStarterPokemon(task.data[T_STARTER_SELECTION])) ?? 0;
  if (starterSpecies) PlayCry_Normal(starterSpecies, 0);
  // FillWindowPixelBuffer(0, PIXEL_FILL(1));
  FillWindowPixelBuffer(sStarterChooseWindowId, 0x11);
  // AddTextPrinterParameterized(0, FONT_NORMAL, gText_ConfirmStarterChoice, 0, 1, 0, NULL);
  AddTextPrinterParameterized(
    sStarterChooseWindowId, 1 /* FONT_NORMAL */,
    getString('gText_ConfirmStarterChoice'), 0, 1, 0, null,
  );
  // ScheduleBgCopyTilemapToVram(0);
  ScheduleBgCopyTilemapToVram(0);
  // CreateYesNoMenu(&sWindowTemplate_ConfirmStarter, 0x2A8, 0xD, 0);
  CreateYesNoMenu(sWindowTemplate_ConfirmStarter, 0x2A8, 0xD, 0);
  // gTasks[taskId].func = Task_HandleConfirmStarterInput;
  task.func = (t: { taskId: number }) => Task_HandleConfirmStarterInput(t.taskId);
}

// ─── Task_HandleConfirmStarterInput (= 1:1 décomp C:538-563) ────────────
function Task_HandleConfirmStarterInput(taskId: number): void {
  const task = gTasks[taskId];
  const rt = getRuntime();
  if (!rt) return;
  const choice = Menu_ProcessInputNoWrapClearOnChoose();
  if (choice === 0) {
    // YES : 1:1 décomp C:544-548 :
    //   gSpecialVar_Result = gTasks[taskId].tStarterSelection;
    //   ResetAllPicSprites();
    //   SetMainCallback2(gMain.savedCallback);
    const selection = task.data[T_STARTER_SELECTION];
    // 1:1 décomp Task_HandleConfirmStarterInput : gSpecialVar_Result = tStarterSelection.
    VarSet('VAR_RESULT', selection);
    // 1:1 décomp CB2_GiveStarter (battle_setup.c) : *GetVarPointer(VAR_STARTER_MON) = gSpecialVar_Result.
    // VAR_STARTER_MON (=16419) détermine le starter du rival + IsStarterInParty + refs "ton starter".
    // Était MANQUANT → tout lisait Treecko (idx 0) quel que soit le choix réel. [bug #1]
    VarSet('VAR_STARTER_MON', selection);
    _committedStarter = selection;

    // 1:1 décomp post-CB2_GiveStarter : addToParty + chain CB2_StartFirstBattle.
    const speciesEnum = GetStarterPokemon(selection);
    // Création NATIVE directe (CreateMon numérique 1:1 décomp), plus de détour PokemonInstance.
    // 1:1 : CreateMon(&mon, species, 5, USE_RANDOM_IVS, FALSE, 0, OT_ID_PLAYER_ID, 0).
    const starterMon = createEmptyPokemon();
    CreateMon(starterMon, (resolveDecompConstant(speciesEnum) as number | undefined) ?? 0, 5,
      32 /* USE_RANDOM_IVS = MAX_PER_STAT_IVS + 1 */, false, 0, OT_ID_PLAYER_ID, 0);
    GiveMonToPlayer(starterMon);

    // 1:1 décomp C:546 `ResetAllPicSprites()` : destroy circle + pkmn sprites
    // explicitement (= sinon ils persistent over battle scene + repop labo
    // post-tutorial avec ombre visible et couleurs résiduelles).
    // User feedback : "il reste l'ombre du pokémon choisi + ses couleur quand
    // on repop au labo".
    // Divergence ASSUMÉE (le décomp YES fait juste ResetAllPicSprites + SetMainCallback2, et
    // s'appuie sur le ResetSpriteData du combat pour effacer les sprites) : on détruit le mon
    // (via le VRAI système = free tiles inline + palette) + le cercle explicitement pour éviter
    // l'ombre/couleurs résiduelles au retour labo. User : "il reste l'ombre du pokémon choisi".
    const circleId = task.data[T_CIRCLE_SPRITE_ID];
    const pkmnId = task.data[T_PKMN_SPRITE_ID];
    if (pkmnId >= 0) {
      const s = rt.gSprites[pkmnId];
      if (s) { try { FreeOamMatrix(s.matrixNum); } catch (e) { void e; } }
      try { FreeAndDestroyMonPicSprite(pkmnId); } catch (e) { void e; }
    }
    if (circleId >= 0) {
      const s = rt.gSprites[circleId];
      if (s) { try { FreeOamMatrix(s.matrixNum); } catch (e) { void e; } }
      try { DestroySprite(circleId); } catch (e) { void e; }
    }
    // 1:1 décomp C:547 : ResetAllPicSprites (clear le registre mon-pic).
    ResetAllPicSprites();

    // Adaptation flux inline : le décomp swap le CB2 (SetMainCallback2(savedCallback))
    // ce qui stoppe la task de facto ; chez nous le registre global continue de tourner
    // jusqu'au ResetTasks du battle-init → destroy explicite pour que la task ne
    // re-tourne pas entre le COMMIT et le combat.
    DestroyTask(taskId);

    // 1:1 décomp CB2_GiveStarter : PAS de restauration overworld ici. La transition
    // BLUR (pixelisation) capture l'écran starter et fond vers le combat ; l'overworld
    // revient APRÈS le combat (CB2_EndFirstBattle → ReturnToField). L'ancien cleanupScene()
    // ré-initialisait BG1/2/3 sur la map + ShowBg → effaçait l'écran starter avant la
    // transition (= pas d'effet pixelisation, écran vidé). [bug #2]

    // 1:1 décomp `CB2_StartFirstBattle` (battle_setup.c:930) : chained battle.
    // Voie L : boote la VRAIE boucle decomp (swap CB2). _firstBattleFlow reste null ->
    // le tick-loop voie V (l.520) no-op ; on marque la flow ChooseStarter terminee
    // (_done) : son role - drive starter + chain battle - est fini. Le combat + le retour
    // OW (CB2_EndFirstBattle -> ReturnToFieldContinueScript) sont pilotes par la chaine CB2.
    // 1:1 décomp : au swap CB2 vers le combat, les sprites de l'écran starter cessent
    // d'exister (ResetSpriteData au boot du combat). Notre flow reste inline → le curseur
    // (SpriteCB_SelectionHand) continuait de ticker pendant CB2_BattleStartTransition, sur
    // un SLOT DE TASK déjà recyclé par le combat → `sel` hors bornes → throw À CHAQUE FRAME
    // dans runSpriteCallbacks → tickFixed mourait (plus de caméra ni d'object events), et la
    // main restait affichée en sautant au centre. On coupe donc le callback ici, à la sortie
    // de l'écran, comme le décomp (le sprite lui-même part avec le ResetSpriteData du combat).
    // 🐛 fix 2026-07-26 : la comparaison d'identité `_s.callback === SpriteCB_SelectionHand`
    // ne matchait JAMAIS (le template pose un wrapper `(s) => SpriteCB_SelectionHand(s)`,
    // cf. sSpriteTemplate_Hand l.197) → neutralisation MORTE. Conséquence en jeu : la main
    // (et les pokéballs) continuaient de ticker pendant la transition alors que le slot de
    // task venait d'être libéré par `DestroyTask` ci-dessus puis RECYCLÉ par le combat →
    // `tStarterSelection` lu = data[0] d'une AUTRE task (=1) → la main SAUTAIT AU CENTRE
    // ~0,7 s au lieu de rester au-dessus de la ball choisie (bug user : « après un NON puis
    // re-choix, la main revient toujours au centre »). Référence 1:1 : `CB2_GiveStarter`
    // fait `ResetTasks()` (battle_setup.c:924) et `CB2_StartFirstBattle` (c:930-948)
    // n'appelle QUE `UpdatePaletteFade()` + `RunTasks()` — PAS `AnimateSprites()` : sur GBA
    // aucun callback de sprite ne tourne pendant la transition BLUR, la main reste FIGÉE
    // au-dessus de la ball choisie jusqu'au ResetSpriteData du combat. On reproduit ce gel
    // en retirant les callbacks des sprites de l'écran (par ID enregistré, pas par identité),
    // SANS toucher à la visibilité (le GBA les garde à l'écran pour la capture de la BLUR).
    {
      for (const _id of [_starterHandSpriteId, ..._starterPokeballSpriteIds]) {
        const _s = _id >= 0 ? rt.gSprites[_id] : undefined;
        if (_s?.inUse) _s.callback = null;
      }
    }
    // NB : le release `setFieldCameraSuspended(false)` a été DÉPLACÉ dans
    // ReturnToFieldFromBattleOrMenu (src/overworld.ts, au re-arm du VBlank
    // field) : le poser ICI (avant StartFirstBattle) laissait le VBlank field
    // tourner quelques frames → FieldUpdateBgTilemapScroll réécrivait les VOFS
    // pendant que l'écran starter tient encore les BG = fond du starter décalé
    // (constaté en jeu). Le field ne redevient propriétaire des BG qu'au restore.
    StartFirstBattle();
    _firstBattleStarted = true;
    _done = true;
  } else if (choice === 1 || choice === -1 /* MENU_B_PRESSED */) {
    // NO : 1:1 décomp C:551-561 :
    //   PlaySE(SE_SELECT);
    //   FreeOamMatrix + FreeAndDestroyMonPicSprite(tPkmnSpriteId);
    //   FreeOamMatrix + DestroySprite(tCircleSpriteId);
    //   gTasks[taskId].func = Task_DeclineStarter;
    void (async () => {
      try {
        const { PlaySE } = await import('../harness/runtime/decomp-globals');
        PlaySE(5);  // SE_SELECT = 5 (= 1:1 décomp constants/songs.h:11)
      } catch (e) { void e; }
    })();
    // 1:1 STRICT décomp C:553-559 :
    //   spriteId = tPkmnSpriteId;  FreeOamMatrix(gSprites[spriteId].oam.matrixNum);  FreeAndDestroyMonPicSprite(spriteId);
    //   spriteId = tCircleSpriteId; FreeOamMatrix(gSprites[spriteId].oam.matrixNum);  DestroySprite(&gSprites[spriteId]);
    const pkmnId = task.data[T_PKMN_SPRITE_ID];
    const circleId = task.data[T_CIRCLE_SPRITE_ID];
    if (pkmnId >= 0) {
      const s = rt.gSprites[pkmnId];
      if (s) { try { FreeOamMatrix(s.matrixNum); } catch (e) { void e; } }
      try { FreeAndDestroyMonPicSprite(pkmnId); } catch (e) { void e; }
    }
    if (circleId >= 0) {
      const s = rt.gSprites[circleId];
      if (s) { try { FreeOamMatrix(s.matrixNum); } catch (e) { void e; } }
      try { DestroySprite(circleId); } catch (e) { void e; }
    }
    task.func = (t: { taskId: number }) => Task_DeclineStarter(t.taskId);
  }
}

// ─── Task_DeclineStarter (= 1:1 décomp C:565-568) ───────────────────────
function Task_DeclineStarter(taskId: number): void {
  // gTasks[taskId].func = Task_StarterChoose;
  gTasks[taskId].func = (t: { taskId: number }) => Task_StarterChoose(t.taskId);
}

// ─── CreateStarterPokemonLabel (= 1:1 décomp C:570-606) ─────────────────
function CreateStarterPokemonLabel(selection: number): void {
  const rt = getRuntime();
  if (!rt) return;
  // u16 species = GetStarterPokemon(selection);
  const speciesEnum = GetStarterPokemon(selection);
  // CopyMonCategoryText(SpeciesToNationalPokedexNum(species), categoryText);
  const categoryText = getDexCategoryFr(speciesEnum);
  // speciesName = gSpeciesNames[species];
  const speciesName = getSpeciesNameFr(speciesEnum);

  // winTemplate = sWindowTemplate_StarterLabel;
  // winTemplate.tilemapLeft = sStarterLabelCoords[selection][0];
  // winTemplate.tilemapTop = sStarterLabelCoords[selection][1];
  const [tilemapLeft, tilemapTop] = sStarterLabelCoords[selection];
  const winTemplate: WindowTemplate = {
    ...sWindowTemplate_StarterLabel,
    tilemapLeft, tilemapTop,
  };

  // sStarterLabelWindowId = AddWindow(&winTemplate);
  sStarterLabelWindowId = AddWindow(winTemplate);
  // FillWindowPixelBuffer(sStarterLabelWindowId, PIXEL_FILL(0));
  FillWindowPixelBuffer(sStarterLabelWindowId, 0);

  // width = GetStringCenterAlignXOffset(FONT_NORMAL, speciesName, 0x68);
  const widthSpecies = GetStringCenterAlignXOffset(speciesName, 0x68, FONT_NORMAL);
  // AddTextPrinterParameterized3(sStarterLabelWindowId, FONT_NORMAL, width, 1, sTextColors, 0, speciesName);
  AddTextPrinterParameterized3(
    sStarterLabelWindowId, FONT_NORMAL, widthSpecies, 1, sTextColors, 0, speciesName,
  );

  // width = GetStringCenterAlignXOffset(FONT_NARROW, categoryText, 0x68);
  const widthCat = GetStringCenterAlignXOffset(categoryText, 0x68, FONT_NARROW);
  // AddTextPrinterParameterized3(sStarterLabelWindowId, FONT_NARROW, width, 17, sTextColors, 0, categoryText);
  AddTextPrinterParameterized3(
    sStarterLabelWindowId, FONT_NARROW, widthCat, 17, sTextColors, 0, categoryText,
  );

  // PutWindowTilemap(sStarterLabelWindowId);
  PutWindowTilemap(sStarterLabelWindowId);
  // ScheduleBgCopyTilemapToVram(0);
  ScheduleBgCopyTilemapToVram(0);

  // 1:1 décomp C:600-605 : WIN0 mask sur le label area pour DARKEN effect.
  //   labelLeft = sStarterLabelCoords[selection][0] * 8 - 4;
  //   labelRight = (sStarterLabelCoords[selection][0] + 13) * 8 + 4;
  //   labelTop = sStarterLabelCoords[selection][1] * 8;
  //   labelBottom = (sStarterLabelCoords[selection][1] + 4) * 8;
  //   SetGpuReg(REG_OFFSET_WIN0H, WIN_RANGE(labelLeft, labelRight));
  //   SetGpuReg(REG_OFFSET_WIN0V, WIN_RANGE(labelTop, labelBottom));
  const labelLeft = tilemapLeft * 8 - 4;
  const labelRight = (tilemapLeft + 13) * 8 + 4;
  const labelTop = tilemapTop * 8;
  const labelBottom = (tilemapTop + 4) * 8;
  rt.SetGpuReg(0x40, (labelLeft << 8) | labelRight);
  rt.SetGpuReg(0x44, (labelTop << 8) | labelBottom);
}

// ─── ClearStarterLabel (= 1:1 décomp C:608-617) ─────────────────────────
function ClearStarterLabel(): void {
  const rt = getRuntime();
  if (sStarterLabelWindowId < 0) {
    if (rt) { rt.SetGpuReg(0x40, 0); rt.SetGpuReg(0x44, 0); }
    return;
  }
  // FillWindowPixelBuffer(sStarterLabelWindowId, PIXEL_FILL(0));
  FillWindowPixelBuffer(sStarterLabelWindowId, 0);
  // ClearWindowTilemap(sStarterLabelWindowId);
  ClearWindowTilemap(sStarterLabelWindowId);
  // RemoveWindow(sStarterLabelWindowId);
  RemoveWindow(sStarterLabelWindowId);
  // sStarterLabelWindowId = WINDOW_NONE;
  sStarterLabelWindowId = -1;
  // SetGpuReg(REG_OFFSET_WIN0H, 0);
  // SetGpuReg(REG_OFFSET_WIN0V, 0);
  if (rt) { rt.SetGpuReg(0x40, 0); rt.SetGpuReg(0x44, 0); }
  // ScheduleBgCopyTilemapToVram(0);
  ScheduleBgCopyTilemapToVram(0);
}

// ─── Task_MoveStarterChooseCursor (= 1:1 décomp C:619-623) ──────────────
function Task_MoveStarterChooseCursor(taskId: number): void {
  // ClearStarterLabel();
  ClearStarterLabel();
  // gTasks[taskId].func = Task_CreateStarterLabel;
  gTasks[taskId].func = (t: { taskId: number }) => Task_CreateStarterLabel(t.taskId);
}

// ─── Task_CreateStarterLabel (= 1:1 décomp C:625-629) ───────────────────
function Task_CreateStarterLabel(taskId: number): void {
  const task = gTasks[taskId];
  // CreateStarterPokemonLabel(gTasks[taskId].tStarterSelection);
  CreateStarterPokemonLabel(task.data[T_STARTER_SELECTION]);
  // gTasks[taskId].func = Task_HandleStarterChooseInput;
  task.func = (t: { taskId: number }) => Task_HandleStarterChooseInput(t.taskId);
}

// ─── CreatePokemonFrontSprite (= 1:1 décomp C:631-638) ──────────────────
function CreatePokemonFrontSprite(species: string, x: number, y: number): number {
  // 1:1 STRICT décomp C:631-638 :
  //   spriteId = CreateMonPicSprite_Affine(species, SHINY_ODDS, 0, MON_PIC_AFFINE_FRONT, x, y, 14, TAG_NONE);
  //   gSprites[spriteId].oam.priority = 0;
  //   return spriteId;
  // SHINY_ODDS = 8 (décomp constants/pokemon.h) — otId : non pertinent ici (notre substrat
  // = palette normale pré-chargée). Le VRAI système (trainer_pokemon_sprites) gère tiles inline
  // + palette slot 14 + registry sSpritePics → DestroySprite libère les tiles au decline/re-select.
  const rt = getRuntime();
  if (!rt) return -1;
  const SHINY_ODDS = 8;
  const spriteId = CreateMonPicSprite_Affine(species, SHINY_ODDS, 0, MON_PIC_AFFINE_FRONT, x, y, 14, TAG_NONE);
  if (spriteId === 0xFFFF) return -1;
  // 1:1 décomp C:636 : gSprites[spriteId].oam.priority = 0 (devant la pokéball/cercle).
  const sprite = rt.gSprites[spriteId];
  if (sprite) rt.gba.oam[sprite.oamIndex].priority = 0;
  return spriteId;
}

// ─── SpriteCB_SelectionHand (= 1:1 décomp C:640-647) ────────────────────
function SpriteCB_SelectionHand(sprite: { x: number; y: number; y2: number; data: number[] }): void {
  // Adaptation flux inline : le décomp coupe ces callbacks au swap CB2 (COMMIT) ;
  // chez nous les sprites tickent jusqu'au battle-init → no-op si la task est morte.
  const task = gTasks[sprite.data[0]];
  if (!task?.isActive) return;
  // sprite->x = sCursorCoords[gTasks[sprite->data[0]].tStarterSelection][0];
  // sprite->y = sCursorCoords[gTasks[sprite->data[0]].tStarterSelection][1];
  const sel = task.data[T_STARTER_SELECTION];
  // 🐛 fix 2026-07-19 : le décomp DÉTRUIT ces sprites au swap CB2 ; chez nous ils tickent
  // jusqu'au battle-init, et le SLOT de task est alors RECYCLÉ par le combat → `isActive` est
  // vrai mais data[] appartient à une autre task → `sel` hors bornes → `sCursorCoords[sel][0]`
  // throw À CHAQUE FRAME dans runSpriteCallbacks → `tickFixed THREW` → LE TICK ENTIER MEURT
  // (plus de caméra ni de mise à jour des object events : « la map ne défile plus », « les PNJ
  // restent figés » après le tuto Birch). Sortie propre = équivalent du sprite détruit.
  if (!(sel >= 0 && sel < sCursorCoords.length)) return;
  sprite.x = sCursorCoords[sel][0];
  sprite.y = sCursorCoords[sel][1];
  // sprite->y2 = Sin(sprite->data[1], 8);
  sprite.y2 = Sin(sprite.data[1], 8);
  // sprite->data[1] = (u8)(sprite->data[1]) + 4;  (u8 wrap = & 0xFF)
  sprite.data[1] = (sprite.data[1] + 4) & 0xFF;
}

// ─── SpriteCB_Pokeball (= 1:1 décomp C:649-656) ─────────────────────────
function SpriteCB_Pokeball(sprite: { data: number[]; animNum?: number }, spriteId: number): void {
  // 1:1 décomp :
  //   if (gTasks[sprite->sTaskId].tStarterSelection == sprite->sBallId)
  //       StartSpriteAnimIfDifferent(sprite, 1);  // Moving
  //   else
  //       StartSpriteAnimIfDifferent(sprite, 0);  // Still
  const taskId = sprite.data[S_TASK_ID];
  const ballId = sprite.data[S_BALL_ID];
  // Adaptation flux inline : no-op si la task est morte (cf. SpriteCB_SelectionHand).
  const task = gTasks[taskId];
  if (!task?.isActive) return;
  const wantAnim = task.data[T_STARTER_SELECTION] === ballId ? 1 : 0;
  if (sprite.animNum !== wantAnim) {
    const rt = getRuntime();
    if (rt) rt.StartSpriteAnim(spriteId, wantAnim);
    sprite.animNum = wantAnim;
  }
}

// ─── SpriteCB_StarterPokemon (= 1:1 décomp C:658-669) ───────────────────
function SpriteCB_StarterPokemon(sprite: { x: number; y: number }): void {
  // Move sprite to upper center of screen.
  if (sprite.x > STARTER_PKMN_POS_X) sprite.x -= 4;
  if (sprite.x < STARTER_PKMN_POS_X) sprite.x += 4;
  if (sprite.y > STARTER_PKMN_POS_Y) sprite.y -= 2;
  if (sprite.y < STARTER_PKMN_POS_Y) sprite.y += 2;
}

// ─── getDexCategoryFr helper ────────────────────────────────────────────
let _pokedexEntries: Record<string, { category: string }> | null = null;
function getDexCategoryFr(speciesEnum: string): string {
  if (!_pokedexEntries) {
    // Sync access required by CreateStarterPokemonLabel ; preloaded earlier.
    return '';
  }
  return _pokedexEntries[speciesEnum]?.category ?? '';
}

async function _preloadDexEntries(): Promise<void> {
  if (_pokedexEntries) return;
  try {
    const resp = await fetch('/decomp/em/pokedex-entries.json');
    if (resp.ok) _pokedexEntries = await resp.json() as Record<string, { category: string }>;
  } catch (e) { void e; }
}

// (cleanupScene SUPPRIMÉ 2026-07-02 — code mort depuis le fix bug #2 : il
//  restaurait l'overworld AVANT le combat, cassant la transition BLUR ; pas
//  dans la décomp CB2_GiveStarter. Retour OW post-combat vérifié en jeu.)

// ─── Public interface ───────────────────────────────────────────────────

export interface ChooseStarterFlow {
  /** Per-frame tick. Returns true when done (= script can resume). */
  tick(): boolean;
}

/** Build a fresh ChooseStarter flow. Sync return + internal async preload :
 *  tick() returns false until assets loaded + CB2_ChooseStarter init done. */
export function startChooseStarterFlow(): ChooseStarterFlow {
  _done = false;
  _initRan = false;
  _committedStarter = -1;
  _firstBattleFlow = null;
  _firstBattleStarted = false;

  // Fire-and-forget init (= async asset preload + CB2_ChooseStarter setup).
  (async () => {
    try {
      await _preloadDexEntries();
      await CB2_ChooseStarter();
      _initRan = true;
    } catch (e) {
      console.error('[StarterChoose] init failed', e);
      _done = true;  // exit on error
    }
  })();

  return {
    tick(): boolean {
      if (!_initRan) return false;
      return CB2_StarterChoose();
    },
  };
}
