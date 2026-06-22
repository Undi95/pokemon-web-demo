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

import { CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose } from './engine/ui/gba-menu-system';
import {
  AddWindow, ClearStdWindowAndFrame, ClearWindowTilemap, FillWindowPixelBuffer,
  PutWindowTilemap, RemoveWindow, ShowBg, HideBg, InitBgFromTemplate,
  InitWindows, DrawStdFrameWithCustomTileAndPalette, ScheduleBgCopyTilemapToVram,
  type WindowTemplate,
} from './engine/ui/gba-window-system';
import {
  AddTextPrinterParameterized, AddTextPrinterParameterized3,
  GetStringCenterAlignXOffset, FONT_NORMAL, FONT_NARROW,
} from './engine/ui/gba-text-system';
import { LoadUserWindowBorderGfx, preloadTextWindowFrames } from './text_window';
import { getRuntime, LoadPalette } from '../harness/runtime/decomp-globals';
import { DestroySprite, AllocOamMatrix } from './sprite';
import { BG_PLTT_ID, MAX_SPRITES } from '../harness/runtime/decomp-runtime';
import { GetOverworldTextboxPalettePtr } from '../harness/runtime/decomp-bridge';
import { CreateMon } from './engine/pokemon/pokemon';
import { GiveMonToPlayer } from './engine/battle/party-storage';
import { VarSet } from './engine/script/script-vars';
import { Sin } from '../harness/runtime/decomp-helpers';
import { CopyMapTilesetsToVram, gMapHeader } from './fieldmap';
import { pauseTilesetAnimations, resumeTilesetAnimations } from './tileset_anims';
import { setFieldCameraSuspended, flushOverworldTilemaps } from './field_camera';
import { setObjectEventsSuspended } from './event_object_movement';
import { getString, initStringsFromDecomp } from './engine/ui/gba-strings';
import { getSpeciesNameFr, loadTextTables, type TextTables } from '../harness/runtime/data-tables';
/** Type local (ex-voie V, supprimee) : l'ancien flow Birch ne retourne plus rien. */
type BattleFlow = { tick(): boolean };
// Voie L (suppression voie V) : 1er combat (Birch) via la VRAIE boucle decomp.
import { StartFirstBattle } from './engine/battle/battle-setup-helpers';
import { registerAffineAnim, registerAffineAnimTable } from './engine/decomp-impls/sprite-affine-extras';
import { StartSpriteAffineAnim } from './engine/decomp-impls/sprite-engine-impl';
import {
  A_BUTTON, B_BUTTON, DPAD_RIGHT, DPAD_LEFT,
} from './engine/decomp-data/include/gba/io_reg-data';

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

// ─── Task system (= 1:1 décomp gTasks) ──────────────────────────────────

interface DecompTask {
  data: number[];  // [16] like decomp
  func: ((taskId: number) => void) | null;
}

/** 1:1 décomp `gTasks[]` (= task system global). Le décomp utilise un array
 *  global ; nous utilisons une Map local module pour isoler ChooseStarter
 *  tasks (= la global rt.gTasks reste utilisable par autre code). */
const _tasks = new Map<number, DecompTask>();
let _nextTaskId = 0;

function CreateTask(func: (taskId: number) => void, _priority: number): number {
  const id = ++_nextTaskId;
  _tasks.set(id, { data: new Array(16).fill(0), func });
  return id;
}

function getTask(taskId: number): DecompTask {
  const t = _tasks.get(taskId);
  if (!t) throw new Error(`Task ${taskId} not found`);
  return t;
}

// ─── Task data alias (= 1:1 décomp C:366-368) ───────────────────────────
const T_STARTER_SELECTION = 0;  // tStarterSelection = data[0]
const T_PKMN_SPRITE_ID = 1;     // tPkmnSpriteId = data[1]
const T_CIRCLE_SPRITE_ID = 2;   // tCircleSpriteId = data[2]

// ─── Sprite data alias (= 1:1 décomp C:371-372) ─────────────────────────
const S_TASK_ID = 0;  // sTaskId = data[0]
const S_BALL_ID = 1;  // sBallId = data[1]

// ─── Sprite refs (track for cleanup/access) ─────────────────────────────
const _spriteRefs = new Map<number, { taskId?: number; ballId?: number }>();

// ─── Asset state ────────────────────────────────────────────────────────
interface MonPicAsset {
  /** Tile data 4bpp packed (64×64 = 64 tiles × 32 bytes = 2048 bytes). */
  tileData: Uint8Array;
  /** Palette 16 colors RGB15. */
  palette: Uint16Array;
}
interface Assets {
  birchTilesData: Uint8Array;
  birchPalette: Uint16Array;
  birchBagTilemap: Uint8Array;
  birchGrassTilemap: Uint8Array;
  /** Standard overworld message box palette (= gMessageBox_Pal).
   *  Fallback car GetOverworldTextboxPalettePtr() peut retourner null si
   *  l'asset n'est pas dans assetCache. */
  messageBoxPalette: Uint16Array;
  /** Pokemon front sprites pré-chargés pour les 3 starters (= ROM-resident
   *  équivalent pour CreateMonPicSprite_Affine sync semantics). */
  monPics: Record<string, MonPicAsset>;
}
let _assets: Assets | null = null;

// ─── Hand bob state (sprite.data[1] in C) ───────────────────────────────
const _handBobTimers = new Map<number, number>();

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
function GetStarterPokemon(chosenStarterId: number): string {
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

  // Pre-load 3 starter front sprites + palettes (= ROM-resident sync access
  // émulation pour CreateMonPicSprite_Affine).
  const monPics: Record<string, MonPicAsset> = {};
  for (const speciesEnum of sStarterMon) {
    const speciesPath = speciesEnum.replace('SPECIES_', '').toLowerCase();
    const pngUrl = `/decomp/em/pokemon/${speciesPath}/front.png`;
    const palUrl = `/decomp/em/pokemon/${speciesPath}/normal.pal`;
    try {
      const [front, pal] = await Promise.all([
        loadIndexedPngStrict(pngUrl, 4),
        loadGbaPal(palUrl),
      ]);
      monPics[speciesEnum] = {
        tileData: front.charData,
        palette: pal.subarray(0, 16),
      };
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
    monPics,
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
  // ResetTasks(); — clear our local tasks.
  _tasks.clear(); _nextTaskId = 0;
  _spriteRefs.clear(); _handBobTimers.clear();
  // ResetSpriteData(); — already done via OAM fill above + sprite store cleanup.
  // ResetPaletteFade(); — NOP (runtime manages).
  // FreeAllSpritePalettes(); — clear OBJ palette tags.
  const sp = (globalThis as Record<string, unknown>).__sprite as {
    FreeAllSpritePalettes?: () => void;
  } | undefined;
  sp?.FreeAllSpritePalettes?.();
  // ResetAllPicSprites(); — NOP (we don't use pic sprite registry).

  // LoadPalette(GetOverworldTextboxPalettePtr(), BG_PLTT_ID(14), PLTT_SIZE_4BPP);
  // Fallback : GetOverworldTextboxPalettePtr() peut retourner null si l'asset
  // gMessageBox_Pal n'est pas dans assetCache. On a précaché via fetch direct.
  const textboxPal = GetOverworldTextboxPalettePtr() ?? _assets.messageBoxPalette;
  LoadPalette(textboxPal, BG_PLTT_ID(14), textboxPal.length * 2);
  // LoadPalette(gBirchBagGrass_Pal, BG_PLTT_ID(0), sizeof(gBirchBagGrass_Pal));
  LoadPalette(_assets.birchPalette, BG_PLTT_ID(0), _assets.birchPalette.length * 2);
  // LoadCompressedSpriteSheet(&sSpriteSheet_PokeballSelect[0]);
  await rt.LoadCompressedSpriteSheetsFromTable('sSpriteSheet_PokeballSelect', () => POKEBALL_SHEET_URL);
  // LoadCompressedSpriteSheet(&sSpriteSheet_StarterCircle[0]);
  await rt.LoadCompressedSpriteSheetsFromTable('sSpriteSheet_StarterCircle', () => STARTER_CIRCLE_SHEET_URL);
  // LoadSpritePalettes(sSpritePalettes_StarterChoose);
  await rt.LoadSpritePalettesFromTable('sSpritePalettes_StarterChoose', (palName) => {
    if (palName.includes('PokeballSelection')) return POKEBALL_SHEET_URL;
    if (palName.includes('StarterCircle')) return STARTER_CIRCLE_SHEET_URL;
    return null;
  });
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
  const taskId = CreateTask(Task_StarterChoose, 0);
  // gTasks[taskId].tStarterSelection = 1;
  getTask(taskId).data[T_STARTER_SELECTION] = 1;

  // Create hand sprite : spriteId = CreateSprite(&sSpriteTemplate_Hand, 120, 56, 2);
  const handSpriteId = rt.CreateSpriteFromTemplate('sSpriteTemplate_Hand', 120, 56, 2);
  // gSprites[spriteId].data[0] = taskId;
  const handSprite = rt.gSprites[handSpriteId];
  if (handSprite) {
    handSprite.data ||= new Array(8).fill(0);
    handSprite.data[0] = taskId;
    handSprite.callback = (s) => SpriteCB_SelectionHand(s, handSpriteId);
  }
  _starterHandSpriteId = handSpriteId;
  _spriteRefs.set(handSpriteId, { taskId });
  _handBobTimers.set(handSpriteId, 0);

  // Create 3 Poké Ball sprites (= 1:1 décomp C:450-460)
  _starterPokeballSpriteIds = [];
  for (let i = 0; i < STARTER_MON_COUNT; i++) {
    const spriteId = rt.CreateSpriteFromTemplate(
      'sSpriteTemplate_Pokeball',
      sPokeballCoords[i][0], sPokeballCoords[i][1], 2,
    );
    // gSprites[spriteId].sTaskId = taskId; sBallId = i;
    const sprite = rt.gSprites[spriteId];
    if (sprite) {
      sprite.data ||= new Array(8).fill(0);
      sprite.data[S_TASK_ID] = taskId;
      sprite.data[S_BALL_ID] = i;
      sprite.callback = (s) => SpriteCB_Pokeball(s, spriteId);
    }
    _starterPokeballSpriteIds.push(spriteId);
    _spriteRefs.set(spriteId, { taskId, ballId: i });
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
  // Run all active tasks. Iterate via snapshot pour permettre task.func de
  // muter _tasks (= setTaskFunc).
  const taskIds = Array.from(_tasks.keys());
  for (const tid of taskIds) {
    const task = _tasks.get(tid);
    if (task?.func) task.func(tid);
  }
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
  const task = getTask(taskId);
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
  task.func = Task_HandleStarterChooseInput;
}

// ─── Task_HandleStarterChooseInput (= 1:1 décomp C:484-516) ─────────────
function Task_HandleStarterChooseInput(taskId: number): void {
  const task = getTask(taskId);
  const selection = task.data[T_STARTER_SELECTION];
  const rt = getRuntime();
  if (!rt) return;
  const newKeys = rt.gMain?.newKeys ?? 0;

  if (newKeys & A_BUTTON) {
    // 1:1 décomp C:488-505 : ClearStarterLabel + spawn StarterCircle + mon sprite.
    ClearStarterLabel();
    // spriteId = CreateSprite(&sSpriteTemplate_StarterCircle, ...)
    const circleId = rt.CreateSpriteFromTemplate(
      'sSpriteTemplate_StarterCircle',
      sPokeballCoords[selection][0], sPokeballCoords[selection][1], 1,
    );
    task.data[T_CIRCLE_SPRITE_ID] = circleId;
    // 1:1 décomp src/sprite.c:InitSpriteAffineAnim — quand sprite a affineMode
    // affine ON ET affineAnims, allouer un matrixNum unique (= AllocOamMatrix).
    // Sans ça, tous les sprites affine partagent matrix 0 (= identity = no anim).
    const circleSprite = rt.gSprites[circleId];
    if (circleSprite && circleSprite.affineMode !== 0) {
      const mNum = AllocOamMatrix();
      if (mNum >= 0) {
        circleSprite.matrixNum = mNum;
        const oam = rt.gba.oam[circleSprite.oamIndex];
        if (oam) { oam.affineParamIndex = mNum; ((oam as unknown) as { matrixNum?: number }).matrixNum = mNum; }
        circleSprite.affineAnimBeginning = true;
      }
    }
    // CreatePokemonFrontSprite : spawn front mon sprite at pokeball pos.
    const pkmnId = CreatePokemonFrontSprite(
      GetStarterPokemon(selection),
      sPokeballCoords[selection][0], sPokeballCoords[selection][1],
    );
    // 1:1 décomp C:500-501 :
    //   gSprites[spriteId].affineAnims = &sAffineAnims_StarterPokemon;
    //   gSprites[spriteId].callback = SpriteCB_StarterPokemon;
    const pkmnSprite = rt.gSprites[pkmnId];
    if (pkmnSprite) {
      pkmnSprite.affineAnimsTableName = 'sAffineAnims_StarterPokemon';
      // Alloc dedicated matrix slot pour cette affine anim (= 1:1 strict).
      const mNum = AllocOamMatrix();
      if (mNum >= 0) {
        pkmnSprite.matrixNum = mNum;
        const oam = rt.gba.oam[pkmnSprite.oamIndex];
        if (oam) { oam.affineParamIndex = mNum; ((oam as unknown) as { matrixNum?: number }).matrixNum = mNum; }
      }
      StartSpriteAffineAnim(pkmnSprite as never, 0);
      pkmnSprite.callback = (s) => SpriteCB_StarterPokemon(s);
    }
    task.data[T_PKMN_SPRITE_ID] = pkmnId;
    task.func = Task_WaitForStarterSprite;
  } else if ((newKeys & DPAD_LEFT) && selection > 0) {
    // 1:1 décomp C:506-509.
    task.data[T_STARTER_SELECTION]--;
    task.func = Task_MoveStarterChooseCursor;
  } else if ((newKeys & DPAD_RIGHT) && selection < STARTER_MON_COUNT - 1) {
    // 1:1 décomp C:511-514.
    task.data[T_STARTER_SELECTION]++;
    task.func = Task_MoveStarterChooseCursor;
  }
}

// ─── Task_WaitForStarterSprite (= 1:1 décomp C:518-526) ─────────────────
function Task_WaitForStarterSprite(taskId: number): void {
  const task = getTask(taskId);
  const rt = getRuntime();
  if (!rt) return;
  const circleSprite = rt.gSprites[task.data[T_CIRCLE_SPRITE_ID]];
  if (!circleSprite) {
    // Dette R3 : sans circle sprite (= asset load failed), skip wait → confirm directly.
    task.func = Task_AskConfirmStarter;
    return;
  }
  // Move circle toward STARTER_PKMN_POS via SpriteCB_StarterPokemon emulation
  // (= 1:1 décomp C:658-669 SpriteCB_StarterPokemon move +/-4 x / +/-2 y per frame).
  if (circleSprite.x > STARTER_PKMN_POS_X) circleSprite.x -= 4;
  if (circleSprite.x < STARTER_PKMN_POS_X) circleSprite.x += 4;
  if (circleSprite.y > STARTER_PKMN_POS_Y) circleSprite.y -= 2;
  if (circleSprite.y < STARTER_PKMN_POS_Y) circleSprite.y += 2;
  // 1:1 décomp check : x == POS_X && y == POS_Y (= sprite arrived at target).
  if (circleSprite.x === STARTER_PKMN_POS_X && circleSprite.y === STARTER_PKMN_POS_Y) {
    task.func = Task_AskConfirmStarter;
  }
}

// ─── Task_AskConfirmStarter (= 1:1 décomp C:528-536) ────────────────────
function Task_AskConfirmStarter(taskId: number): void {
  const task = getTask(taskId);
  // PlayCry_Normal(GetStarterPokemon(...), 0); — 1:1 décomp cry pokemon sélectionné.
  // playCry attend le species name lowercase sans préfixe SPECIES_ (= cries/torchic.wav).
  void (async () => {
    try {
      const { playCry } = await import('./engine/system/music');
      const speciesEnum = GetStarterPokemon(task.data[T_STARTER_SELECTION]);
      const speciesName = speciesEnum.replace(/^SPECIES_/, '');
      playCry(speciesName);
    } catch (e) { void e; }
  })();
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
  task.func = Task_HandleConfirmStarterInput;
}

// ─── Task_HandleConfirmStarterInput (= 1:1 décomp C:538-563) ────────────
function Task_HandleConfirmStarterInput(taskId: number): void {
  const task = getTask(taskId);
  const rt = getRuntime();
  if (!rt) return;
  const choice = Menu_ProcessInputNoWrapClearOnChoose();
  if (choice === 0) {
    // YES : 1:1 décomp C:544-548 :
    //   gSpecialVar_Result = gTasks[taskId].tStarterSelection;
    //   ResetAllPicSprites();
    //   SetMainCallback2(gMain.savedCallback);
    const selection = task.data[T_STARTER_SELECTION];
    VarSet('VAR_RESULT', selection);
    _committedStarter = selection;

    // 1:1 décomp post-CB2_GiveStarter : addToParty + chain CB2_StartFirstBattle.
    const speciesEnum = GetStarterPokemon(selection);
    // P4a : création NATIVE directe dans gPlayerParty (CreateMon → Pokemon natif +
    // give natif), plus de détour PokemonInstance. 1:1 décomp CB2_GiveStarter.
    GiveMonToPlayer(CreateMon(speciesEnum, 5));

    // 1:1 décomp C:546 `ResetAllPicSprites()` : destroy circle + pkmn sprites
    // explicitement (= sinon ils persistent over battle scene + repop labo
    // post-tutorial avec ombre visible et couleurs résiduelles).
    // User feedback : "il reste l'ombre du pokémon choisi + ses couleur quand
    // on repop au labo".
    const circleId = task.data[T_CIRCLE_SPRITE_ID];
    const pkmnId = task.data[T_PKMN_SPRITE_ID];
    if (pkmnId >= 0) {
      try { DestroySprite(rt, pkmnId); } catch (e) { void e; }
    }
    if (circleId >= 0) {
      try { DestroySprite(rt, circleId); } catch (e) { void e; }
    }

    // Cleanup task — we don't return to ROM callback ; the next CB2 tick will
    // chain into StartBirchTutorialBattle.
    task.func = null;
    _tasks.delete(taskId);

    // Cleanup BG/sprites + restore overworld.
    cleanupScene();

    // 1:1 décomp `CB2_StartFirstBattle` (battle_setup.c:930) : chained battle.
    // Voie L : boote la VRAIE boucle decomp (swap CB2). _firstBattleFlow reste null ->
    // le tick-loop voie V (l.520) no-op ; on marque la flow ChooseStarter terminee
    // (_done) : son role - drive starter + chain battle - est fini. Le combat + le retour
    // OW (CB2_EndFirstBattle -> ReturnToFieldContinueScript) sont pilotes par la chaine CB2.
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
    const pkmnId = task.data[T_PKMN_SPRITE_ID];
    const circleId = task.data[T_CIRCLE_SPRITE_ID];
    if (pkmnId >= 0) {
      try { DestroySprite(rt, pkmnId); } catch (e) { void e; }
    }
    if (circleId >= 0) {
      try { DestroySprite(rt, circleId); } catch (e) { void e; }
    }
    task.func = Task_DeclineStarter;
  }
}

// ─── Task_DeclineStarter (= 1:1 décomp C:565-568) ───────────────────────
function Task_DeclineStarter(taskId: number): void {
  // gTasks[taskId].func = Task_StarterChoose;
  getTask(taskId).func = Task_StarterChoose;
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
  getTask(taskId).func = Task_CreateStarterLabel;
}

// ─── Task_CreateStarterLabel (= 1:1 décomp C:625-629) ───────────────────
function Task_CreateStarterLabel(taskId: number): void {
  const task = getTask(taskId);
  // CreateStarterPokemonLabel(gTasks[taskId].tStarterSelection);
  CreateStarterPokemonLabel(task.data[T_STARTER_SELECTION]);
  // gTasks[taskId].func = Task_HandleStarterChooseInput;
  task.func = Task_HandleStarterChooseInput;
}

// ─── CreatePokemonFrontSprite (= 1:1 décomp C:631-638) ──────────────────
function CreatePokemonFrontSprite(species: string, x: number, y: number): number {
  // 1:1 décomp `CreateMonPicSprite_Affine(species, SHINY_ODDS, 0, MON_PIC_AFFINE_FRONT, x, y, 14, TAG_NONE)`.
  // Notre TS émule la partie pertinente :
  //   - assets pré-chargés (= sync ROM-equivalent via preloadAssets)
  //   - alloc OBJ VRAM tiles + LoadPaletteObj à slot 14
  //   - CreateSpriteAtOam shape=3 size=3 (64x64) affineMode=NORMAL_AFFINE.
  // Le caller (Task_HandleStarterChooseInput) override .affineAnims +
  // .callback = SpriteCB_StarterPokemon après.
  const rt = getRuntime();
  if (!rt) return -1;
  const asset = _assets?.monPics[species];
  if (!asset) {
    console.warn(`[StarterChoose] no monPic asset for ${species}`);
    return -1;
  }
  // 1:1 décomp DecompressPic : LoadSpecialPokePic(&gMonFrontPicTable[species]).
  // Substrat : assets déjà décodés. Alloc OBJ VRAM range pour les 64 tiles
  // (= 64x64 = 8x8 tiles).
  const sp = (globalThis as Record<string, unknown>).__sprite as {
    AllocSpriteTiles?: (count: number) => number;
  } | undefined;
  const tileCount = asset.tileData.length >> 5;  // tile = 32 bytes
  const tileStart = sp?.AllocSpriteTiles?.(tileCount) ?? -1;
  if (tileStart < 0) {
    console.warn(`[StarterChoose] OBJ VRAM saturated for ${species}`);
    return -1;
  }
  // Write tiles to OBJ VRAM at tileStart × 32.
  rt.gba.objVram.set(asset.tileData, tileStart * 32);
  // 1:1 décomp LoadPicPaletteByTagOrSlot (paletteTag = TAG_NONE → LoadCompressedPalette
  // à OBJ_PLTT_ID(paletteSlot=14)). OBJ_PLTT_ID(14) = 256 + 14*16 = 480.
  rt.LoadPaletteObj(asset.palette, 256 + 14 * 16);
  // 1:1 décomp CreateSprite(&sCreatingSpriteTemplate, x, y, 0) avec :
  //   - oam = sOamData_Affine : shape=SPRITE_SHAPE(64x64)=0, size=SPRITE_SIZE(64x64)=3, affineMode=NORMAL
  //   - tileTag = TAG_NONE → gSprites[spriteId].oam.paletteNum = paletteSlot (14)
  const result = rt.CreateSpriteAtOam({
    tileId: tileStart,
    paletteBank: 14,
    x, y,
    shape: 0, size: 3,  // 64x64
    priority: 1,
    paletteMode: 0,
    affineMode: 1,  // NORMAL_AFFINE
    subpriority: 0,
  });
  // Décomp : gSprites[spriteId].oam.priority = 0 (override après return CreatePokemonFrontSprite).
  const sprite = rt.gSprites[result.spriteId];
  if (sprite) ((sprite as unknown) as { priority?: number }).priority = 0;
  return result.spriteId;
}

// ─── SpriteCB_SelectionHand (= 1:1 décomp C:640-647) ────────────────────
function SpriteCB_SelectionHand(sprite: { x: number; y: number; y2: number; data: number[] }, spriteId: number): void {
  // sprite->x = sCursorCoords[gTasks[sprite->data[0]].tStarterSelection][0];
  // sprite->y = sCursorCoords[gTasks[sprite->data[0]].tStarterSelection][1];
  const taskId = sprite.data[0];
  const task = _tasks.get(taskId);
  if (!task) return;
  const sel = task.data[T_STARTER_SELECTION];
  sprite.x = sCursorCoords[sel][0];
  sprite.y = sCursorCoords[sel][1];
  // sprite->y2 = Sin(sprite->data[1], 8);
  // sprite->data[1] = (u8)(sprite->data[1]) + 4;
  let bob = _handBobTimers.get(spriteId) ?? 0;
  sprite.y2 = Sin(bob, 8);
  bob = (bob + 4) & 0xFF;
  _handBobTimers.set(spriteId, bob);
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
  const task = _tasks.get(taskId);
  if (!task) return;
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

// ─── Cleanup helper (= reverse de CB2_ChooseStarter init) ──────────────
function cleanupScene(): void {
  const rt = getRuntime();
  if (!rt) return;
  // Destroy all our spawned sprites.
  for (const id of _starterPokeballSpriteIds) {
    if (id >= 0) { try { DestroySprite(rt, id); } catch (e) { void e; } }
  }
  if (_starterHandSpriteId >= 0) {
    try { DestroySprite(rt, _starterHandSpriteId); } catch (e) { void e; }
  }
  _starterPokeballSpriteIds = [];
  _starterHandSpriteId = -1;
  // Cleanup label window if any.
  if (sStarterLabelWindowId >= 0) ClearStarterLabel();
  if (sStarterChooseWindowId >= 0) {
    try { ClearStdWindowAndFrame(sStarterChooseWindowId, true); } catch (e) { void e; }
    try { RemoveWindow(sStarterChooseWindowId); } catch (e) { void e; }
    sStarterChooseWindowId = -1;
  }
  // Reset GPU regs we set.
  rt.SetGpuReg(0x40, 0); rt.SetGpuReg(0x44, 0);
  rt.SetGpuReg(0x48, 0); rt.SetGpuReg(0x4A, 0);
  rt.SetGpuReg(0x50, 0); rt.SetGpuReg(0x54, 0);
  // Restore overworld BGs.
  try {
    HideBg(2); HideBg(3);
    InitBgFromTemplate({ bg: 1, charBaseIndex: 0, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 });
    InitBgFromTemplate({ bg: 2, charBaseIndex: 0, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 });
    InitBgFromTemplate({ bg: 3, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 });
    if (gMapHeader) CopyMapTilesetsToVram(gMapHeader.mapLayout);
    flushOverworldTilemaps(rt);
    resumeTilesetAnimations();
    setFieldCameraSuspended(false);
    ShowBg(1); ShowBg(2); ShowBg(3);
  } catch (e) { void e; }
  // Restore pre-existing sprite visibility (= reverse de CB2_ChooseStarter mass-hide).
  for (const id of _savedVisibleSpriteIds) {
    const s = rt.gSprites[id];
    if (s) s.invisible = false;
  }
  _savedVisibleSpriteIds = [];
  setObjectEventsSuspended(false);
  _savedVisibleOam.clear();
}

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
