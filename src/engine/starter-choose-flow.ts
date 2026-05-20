/**
 * starter-choose-flow.ts — `special ChooseStarter` UI inline dans l'overworld.
 *
 * Approche 1:1 directive : NE PAS créer de scene Phaser séparée. Reuse les
 * systèmes engine existants :
 *   - `ShowFieldMessage` / `IsFieldMessageBoxHidden` / `HideFieldMessageBox`
 *     pour le dialog box (= 1:1 décomp Std_MsgboxDefault flow)
 *   - `CreateYesNoMenu` / `Menu_ProcessInputNoWrapClearOnChoose`
 *     pour la confirmation (= 1:1 décomp Task_AskConfirmStarter)
 *   - `gMain.heldKeys` / `gMain.newKeys` pour input gauche/droite/A/B
 *   - Phase 5.5b : **vrais sprites** via runtime CreateSpriteFromTemplate
 *     (= sSpriteTemplate_Pokeball/Hand/StarterCircle, registered dans
 *     SPRITE_TEMPLATES via extract-sprite-system.mjs)
 *
 * Le flow tourne via SetupNativeScript polling depuis l'opcode `special` (= dans
 * script-opcodes.ts). Chaque tick avance la state machine.
 *
 * State machine (= 1:1 décomp src/starter_choose.c) :
 *   LOAD_ASSETS  : async preload sprite sheet + palette pour TAG_POKEBALL_SELECT
 *   SPAWN_SPRITES : spawn 3 pokeballs + hand cursor (= 1:1 décomp CB2_ChooseStarter)
 *   PROMPT       : ShowFieldMessage gText_BirchInTrouble
 *   WAIT_INPUT   : poll arrows + A. Update hand position si selection change.
 *   ASK_CONFIRM  : ShowFieldMessage gText_ConfirmStarterChoice + spawn YesNo
 *   WAIT_CONFIRM : poll Menu_ProcessInputNoWrapClearOnChoose
 *   COMMIT       : addToParty + setVar + cleanup sprites + cleanup window
 *   DECLINE      : cleanup yesno → back to PROMPT
 *
 * Cf. memory/upd2-progress.md.
 */
import { ShowFieldMessage, IsFieldMessageBoxHidden, HideFieldMessageBox } from './field-message-box';
import { CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose, GetYesNoWindowId } from './gba-menu-system';
import { AddWindow, ClearStdWindowAndFrame, ClearWindowTilemap, FillWindowPixelBuffer, PutWindowTilemap, RemoveWindow, ShowBg, HideBg, InitBgFromTemplate, type WindowTemplate } from './gba-window-system';
import { AddTextPrinterParameterized3 } from './gba-text-system';
import { getRuntime, LoadPalette } from './decomp-globals';
import { BG_PLTT_ID, OBJ_PLTT_ID } from './decomp-runtime';
import { GetOverworldTextboxPalettePtr } from './decomp-bridge';
import { gameState } from './game-state';
import { createPokemonInstance } from './pokemon';
import { VarSet } from './script-vars';
import { Sin } from './decomp-helpers';
import { loadTileBin, loadGbaPal } from './gba/png-loader';
import { CopyMapTilesetsToVram, flushOverworldTilemaps, gMapHeader } from './map-loader';
import { pauseTilesetAnimations, resumeTilesetAnimations } from './tileset-anims';
import { setFieldCameraSuspended } from './field-camera';
import { getString, initStringsFromDecomp } from './gba-strings';
import { getSpeciesNameFr, loadTextTables, type TextTables } from './data-tables';
// Audit session 126 (post-test user) : wire le first wild battle Zigzagoon
// après starter pick. 1:1 décomp `battle_setup.c:CB2_GiveStarter:917-928` →
// `CB2_StartFirstBattle:930-948` set BATTLE_TYPE_FIRST_BATTLE puis CB2_InitBattle.
import { startBirchTutorialBattle, type BattleFlow } from './battle-flow';

// 1:1 décomp `sStarterMon[]` (= public/decomp/em/static-tables/starter_choose.json).
const STARTER_SPECIES: ReadonlyArray<string> = [
  'SPECIES_TREECKO', 'SPECIES_TORCHIC', 'SPECIES_MUDKIP',
];
// 1:1 décomp sPokeballCoords (= 32x32 sprite center).
const POKEBALL_COORDS: ReadonlyArray<readonly [number, number]> = [
  [60, 64], [120, 88], [180, 64],
];
// 1:1 décomp sCursorCoords (= hand bobs above pokeball, base y).
const CURSOR_COORDS: ReadonlyArray<readonly [number, number]> = [
  [60, 32], [120, 56], [180, 32],
];

// 1:1 décomp `CopyMonCategoryText(SpeciesToNationalPokedexNum(species))` :
// lookup pokedex-entries.json (= extracted from data/pokemon/pokedex_text.h)
// keyed par SPECIES_* directement.
let _pokedexEntries: Record<string, { category: string }> | null = null;
async function getDexCategoryFr(speciesEnum: string): Promise<string> {
  if (!_pokedexEntries) {
    const resp = await fetch('/decomp/em/pokedex-entries.json');
    if (resp.ok) _pokedexEntries = await resp.json() as Record<string, { category: string }>;
  }
  return _pokedexEntries?.[speciesEnum]?.category ?? '';
}

// 1:1 décomp `gSpeciesNames[]` lookup. text-tables.json normalement loaded par
// OverworldScene boot, mais en `?nointro` mode TestOverworldScene skip ça.
// Idempotent helper pour ensure les tables FR sont disponibles.
let _textTablesLoaded = false;
async function ensureTextTablesLoaded(): Promise<void> {
  if (_textTablesLoaded) return;
  try {
    const resp = await fetch('/decomp/em/text-tables.json');
    if (resp.ok) {
      const json = await resp.json() as TextTables;
      loadTextTables(json);
      _textTablesLoaded = true;
    }
  } catch (e) {
    console.warn('[StarterChoose] text-tables fetch failed', e);
  }
}

// 1:1 décomp `sStarterLabelCoords[STARTER_MON_COUNT][2]` (starter_choose.c:106-111).
// Position de la label window selon le starter sélectionné (= positionnée pour
// ne pas overlap les pokeballs ni Birch).
const STARTER_LABEL_COORDS: ReadonlyArray<readonly [number, number]> = [
  [0, 9],   // LEFT (= TREECKO/ARCKO) → bottom-left
  [16, 10], // MIDDLE (= TORCHIC/POUSSIFEU) → bottom-right
  [8, 4],   // RIGHT (= MUDKIP/GOBOU) → middle-top
];

// 1:1 décomp `sTextColors = {TEXT_COLOR_TRANSPARENT, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY}`.
// AddTextPrinterParameterized3 attend [bgColor, fgColor, shadowColor].
const STARTER_LABEL_COLORS: ReadonlyArray<number> = [0 /* transparent */, 1 /* white */, 2 /* light gray */];

// 1:1 décomp `sWindowTemplate_StarterLabel` (starter_choose.c:88-97).
// `tilemapLeft/Top` patched à runtime selon selection (= sStarterLabelCoords[i]).
const STARTER_LABEL_TEMPLATE_BASE: Omit<WindowTemplate, 'tilemapLeft' | 'tilemapTop'> = {
  bg: 0,
  width: 13,
  height: 4,
  paletteNum: 14,
  baseBlock: 0x0274,
};

// GBA key masks (= 1:1 décomp gba/key.h).
const A_BUTTON   = 0x01;
const B_BUTTON   = 0x02;
const DPAD_RIGHT = 0x10;
const DPAD_LEFT  = 0x20;

// Asset URLs (= public/decomp/em/starter_choose/).
// Runtime LoadCompressedSpriteSheet expects palette PNG (= 4bpp indexed avec
// palette embedded). Notre engine extract palette from PNG directly.
const POKEBALL_SHEET_URL = '/decomp/em/starter_choose/pokeball_selection.png';
const STARTER_CIRCLE_SHEET_URL = '/decomp/em/starter_choose/starter_circle.png';

type State = 'LOAD_ASSETS' | 'WAIT_LOAD'
           | 'FADE_OUT_OVERWORLD' | 'WAIT_FADE_OUT_OVERWORLD'
           | 'SCENE_INIT'
           | 'WAIT_FADE_IN_BIRCH'
           | 'SPAWN_SPRITES'
           | 'PROMPT_INIT' | 'PROMPT_WAIT' | 'WAIT_INPUT'
           | 'ASK_CONFIRM_INIT' | 'ASK_CONFIRM_WAIT' | 'WAIT_CONFIRM'
           | 'COMMIT_INIT'
           | 'LAUNCH_FIRST_BATTLE' | 'WAIT_FIRST_BATTLE'
           | 'DECLINE_INIT'
           | 'FADE_OUT_BIRCH' | 'WAIT_FADE_OUT_BIRCH'
           | 'CLEANUP'
           | 'WAIT_FADE_IN_OVERWORLD'
           | 'DONE';

interface ChooseStarterFlow {
  /** Tick the state machine. Returns true when done (= script can resume). */
  tick(): boolean;
}

/** Build a fresh ChooseStarter flow + return the controller. */
export function startChooseStarterFlow(): ChooseStarterFlow {
  let state: State = 'LOAD_ASSETS';
  let selection = 1;  // Default = TORCHIC (= 1:1 décomp middle pokeball).
  let chosenIdx = -1;

  // Sprite IDs (= -1 if not spawned yet).
  const pokeballSpriteIds: number[] = [-1, -1, -1];
  let handSpriteId = -1;
  let circleSpriteId = -1;
  let monSpriteId = -1;

  // Audit session 126 : first wild battle Zigzagoon Lv 2 (= 1:1 décomp
  // `CB2_StartFirstBattle:930-948`). Spawn après starter committed à party.
  let firstBattleFlow: BattleFlow | null = null;

  // Pokemon front sprite asset state (= preloaded during LOAD_ASSETS).
  // Each starter gets its own byteOffset + palette slot in OBJ VRAM.
  // We use offsets after the pokeball sheet (= 0x0800 bytes) + circle sheet.
  // 3 starters × 64×64 = 3 × 2048 bytes = 6144 bytes total.
  const STARTER_FRONT_BYTE_OFFSET_BASE = 0x2000;  // Avoid clash with pokeball/circle.
  const STARTER_FRONT_PALETTE_SLOT_BASE = 5;       // Slots 5/6/7 (= avoid pokeball+circle slots 0-4).
  let starterFrontLoaded = false;
  let starterFrontFailed = false;
  const starterFrontPalettes: (Uint16Array | null)[] = [null, null, null];
  const starterFrontWH: ({ w: number, h: number } | null)[] = [null, null, null];

  // Async preload state.
  let loadStarted = false;
  let loadDone = false;
  let loadFailed = false;

  // 1:1 décomp `CopyMonCategoryText` resolved at load (= sync access in tick).
  const starterCategories: string[] = ['', '', ''];

  // Birch BG asset bytes — fetched in LOAD_ASSETS, applied dans SCENE_INIT
  // (= behind black fade pour matcher le décomp pattern : fade-out → wipe →
  // fade-in plutôt que swap visible).
  let birchTilesData: Uint8Array | null = null;
  let birchPalette: Uint16Array | null = null;
  let birchBagTilemap: ArrayBuffer | null = null;
  let birchGrassTilemap: ArrayBuffer | null = null;

  // 1:1 décomp `ResetSpriteData()` setup : save visible OAM slots avant hide,
  // pour restore au cleanup. Notre approche inline ne destroy pas les overworld
  // sprites (= NPCs, player avatar, follow Mom, etc.) — juste hide leur OAM
  // visibility flag pendant Birch BG, restore au cleanup.
  const savedVisibleOam = new Set<number>();

  // 1:1 décomp `sStarterLabelWindowId` (starter_choose.c:52). WINDOW_NONE (= -1)
  // tant que la label window n'est pas spawned. Le décomp utilise 255 (= WINDOW_NONE
  // u8 max) ; on utilise -1 pour cohérence TS.
  let starterLabelWindowId = -1;
  let starterLabelLoggedOnce = false;

  // 1:1 décomp `CreateStarterPokemonLabel(selection)` (starter_choose.c:570).
  // Spawn une window avec species name + category centrés.
  const createStarterPokemonLabel = (sel: number): void => {
    const speciesEnum = STARTER_SPECIES[sel];
    const speciesName = getSpeciesNameFr(speciesEnum);
    const categoryText = starterCategories[sel];
    const [tilemapLeft, tilemapTop] = STARTER_LABEL_COORDS[sel];
    const tmpl: WindowTemplate = {
      ...STARTER_LABEL_TEMPLATE_BASE,
      tilemapLeft,
      tilemapTop,
    };
    starterLabelWindowId = AddWindow(tmpl);
    if (!starterLabelLoggedOnce) {
      console.log(`[StarterChoose] CreateStarterPokemonLabel : species="${speciesName}" cat="${categoryText}"`);
      starterLabelLoggedOnce = true;
    }
    FillWindowPixelBuffer(starterLabelWindowId, 0);
    // 1:1 décomp `AddTextPrinterParameterized3(windowId, FONT_NORMAL, width, 1,
    //   sTextColors, 0, speciesName)` — species name au top.
    // Note: décomp utilise speed=0 (MID), qui s'appuie sur le 0x400 sync render
    // loop dans AddTextPrinter pour drawer les chars avant le slot replace par
    // le 2ème AddTextPrinter (= category). Notre runtime queue les printers et
    // ne sync-render pas pour speed=0, donc le 1er printer serait silently
    // remplacé par le 2ème → POUSSIFEU disparaîtrait. On utilise speed=255
    // (TEXT_SKIP_DRAW) qui force le sync render dans notre engine, matchant
    // le résultat visuel du décomp.
    const speciesX = Math.max(0, ((13 * 8) - speciesName.length * 6) >> 1);
    AddTextPrinterParameterized3(starterLabelWindowId, 1 /* FONT_NORMAL */, speciesX, 1, STARTER_LABEL_COLORS, 255, speciesName);
    // 1:1 décomp `AddTextPrinterParameterized3(... FONT_NARROW ... 17 ...
    //   categoryText)` — category au bottom.
    const categoryX = Math.max(0, ((13 * 8) - categoryText.length * 5) >> 1);
    AddTextPrinterParameterized3(starterLabelWindowId, 2 /* FONT_NARROW */, categoryX, 17, STARTER_LABEL_COLORS, 255, categoryText);
    PutWindowTilemap(starterLabelWindowId);
  };

  // 1:1 décomp `ClearStarterLabel(void)` (starter_choose.c:608).
  const clearStarterLabel = (): void => {
    if (starterLabelWindowId < 0) return;
    FillWindowPixelBuffer(starterLabelWindowId, 0);
    ClearWindowTilemap(starterLabelWindowId);
    RemoveWindow(starterLabelWindowId);
    starterLabelWindowId = -1;
  };

  // Hand bob timer.
  let handBobTimer = 0;
  let lastSelection = -1;

  let _lastLoggedState: State | null = null;
  const tick = (): boolean => {
    const rt = getRuntime();
    if (!rt) return false;

    // Session 133 add : expose state au devtool scope.starterChoose() pour debug.
    (globalThis as Record<string, unknown>).__starterChooseState = state;
    (globalThis as Record<string, unknown>).__starterChooseSelection = selection;
    (globalThis as Record<string, unknown>).__starterChooseChosen = chosenIdx;

    if (state !== _lastLoggedState) {
      console.log(`[StarterChoose] state → ${state} (loadDone=${loadDone}, loadFailed=${loadFailed}, fadeActive=${rt.gPaletteFade?.active}, brightness=${rt.gPaletteFade?.brightness})`);
      _lastLoggedState = state;
    }

    switch (state) {
      case 'LOAD_ASSETS': {
        if (!loadStarted) {
          loadStarted = true;
          // 1:1 décomp CB2_ChooseStarter :
          //   LoadCompressedSpriteSheet(&sSpriteSheet_PokeballSelect);
          //   LoadCompressedSpriteSheet(sStarterCircleSpriteSheet);
          //   LoadSpritePalettes(sSpritePalettes_StarterChoose);
          (async () => {
            try {
              // Ensure decomp strings are loaded (= gText_BirchInTrouble +
              // gText_ConfirmStarterChoice). En `?nointro` mode TestOverworldScene
              // ne boot pas GameScene / BirchRuntimeScene qui init normalement.
              // Idempotent : skip fetch si déjà loaded.
              await initStringsFromDecomp();
              // Idem text-tables (= getSpeciesNameFr fallback EN sinon).
              await ensureTextTablesLoaded();
              // Load tile sheet for pokeball + hand + starter circle.
              await rt.LoadCompressedSpriteSheetsFromTable(
                'sSpriteSheet_PokeballSelect',
                () => POKEBALL_SHEET_URL,
              );
              // Load palettes for both tags.
              await rt.LoadSpritePalettesFromTable(
                'sSpritePalettes_StarterChoose',
                (palName) => {
                  if (palName.includes('sPokeballSelection_Pal')) return POKEBALL_SHEET_URL;
                  if (palName.includes('sStarterCircle_Pal')) return STARTER_CIRCLE_SHEET_URL;
                  return null;
                },
              );
              // Phase 5.5d-bis : preload 3 starter front sprites pour confirm anim.
              // Each starter has its own byteOffset + palette slot.
              for (let i = 0; i < 3; i++) {
                const dexId = STARTER_SPECIES[i].replace('SPECIES_', '').toLowerCase();
                const url = `/decomp/em/pokemon/${dexId}/front.png`;
                try {
                  const offset = STARTER_FRONT_BYTE_OFFSET_BASE + i * 0x800;  // 2048 bytes per 64x64 sprite
                  const result = await rt.LoadCompressedSpriteSheet(url, offset);
                  starterFrontPalettes[i] = result.palette;
                  rt.LoadPaletteObj(result.palette, OBJ_PLTT_ID(STARTER_FRONT_PALETTE_SLOT_BASE + i));
                  // Detect sprite size (= front sprites usually 64x64 but vary).
                  starterFrontWH[i] = { w: 64, h: 64 };  // Conservative default
                } catch (subE) {
                  console.warn(`[StarterChoose] front sprite load failed for ${dexId}`, subE);
                }
              }
              starterFrontLoaded = true;

              // 1:1 décomp `CopyMonCategoryText(SpeciesToNationalPokedexNum(species))`
              // pre-resolved au load pour sync access dans ASK_CONFIRM_INIT.
              for (let i = 0; i < 3; i++) {
                starterCategories[i] = await getDexCategoryFr(STARTER_SPECIES[i]);
              }

              // Phase 5.1 — Birch BG asset bytes (= 1:1 décomp gBirchBagGrass_Gfx
              // + gBirchBagTilemap + gBirchGrassTilemap + gBirchBagGrass_Pal).
              // Fetched ici, applied dans SCENE_INIT (= behind black fade) pour
              // matcher le décomp pattern fade-out → wipe → fade-in.
              try {
                const [tilesData, palette, birchBagBin, birchGrassBin] = await Promise.all([
                  loadTileBin('/decomp/em/starter_choose/tiles.png', 4),
                  loadGbaPal('/decomp/em/starter_choose/tiles.gbapal'),
                  fetch('/decomp/em/starter_choose/birch_bag.bin').then(r => r.arrayBuffer()),
                  fetch('/decomp/em/starter_choose/birch_grass.bin').then(r => r.arrayBuffer()),
                ]);
                birchTilesData = tilesData;
                birchPalette = palette;
                birchBagTilemap = birchBagBin;
                birchGrassTilemap = birchGrassBin;
              } catch (bgErr) {
                console.warn('[StarterChoose] Birch BG asset fetch failed', bgErr);
                throw bgErr;
              }
              loadDone = true;
            } catch (e) {
              console.error('[StarterChoose] asset load failed', e);
              loadFailed = true;
            }
          })();
        }
        state = 'WAIT_LOAD';
        return false;
      }

      case 'WAIT_LOAD': {
        if (loadFailed) {
          // Fallback : auto-pick TREECKO + done.
          chosenIdx = 0;
          state = 'COMMIT_INIT';
          return false;
        }
        if (loadDone) state = 'FADE_OUT_OVERWORLD';
        return false;
      }

      case 'FADE_OUT_OVERWORLD': {
        // 1:1 décomp : avant CB2_ChooseStarter, le caller fade out vers RGB_BLACK
        // (= overworld disappears to black). Notre approche inline reproduit ça.
        // BeginNormalPaletteFade(palettes, delay, startY, endY, color) :
        //   startY=0 (= visible) → endY=16 (= fully black blend) → fade out.
        rt.BeginNormalPaletteFade(0xFFFFFFFF, 0, 0, 16, 0);
        state = 'WAIT_FADE_OUT_OVERWORLD';
        return false;
      }

      case 'WAIT_FADE_OUT_OVERWORLD': {
        if (!rt.gPaletteFade.active) state = 'SCENE_INIT';
        return false;
      }

      case 'SCENE_INIT': {
        // Behind black fade : do the wipe + Birch BG setup (= 1:1 décomp
        // CB2_ChooseStarter wipe pattern : DmaFill VRAM/OAM/PLTT + load
        // tiles + tilemaps + palette + InitBgsFromTemplates + ShowBg + fade in).
        if (!birchTilesData || !birchPalette || !birchBagTilemap || !birchGrassTilemap) {
          console.error('[StarterChoose] SCENE_INIT : asset bytes not loaded');
          state = 'COMMIT_INIT';
          return false;
        }
        // 1:1 décomp `ResetSpriteData()` : hide all OAM. Save visible slots
        // pour restore au cleanup (= NPCs, player avatar, etc. restent spawned).
        for (let i = 0; i < 128; i++) {
          if (rt.gba.oam[i].visible) savedVisibleOam.add(i);
          rt.gba.oam[i].visible = false;
        }
        // Hide overworld BG1/2/3 (= keep BG0 pour windows dialog).
        HideBg(1); HideBg(2); HideBg(3);
        // Pause overworld tileset animations + suspend FieldUpdateBgTilemapScroll
        // (= sinon TilesetAnim_General clobbe nos tilemaps + scroll camera
        // override BG2/3 vofs leftover de l'overworld).
        pauseTilesetAnimations();
        setFieldCameraSuspended(true);
        // Reset BG2/3 scroll registers (= 1:1 décomp ChangeBgX/Y BG_COORD_SET 0).
        rt.SetGpuReg(0x14 /* REG_BG2HOFS */, 0);
        rt.SetGpuReg(0x16 /* REG_BG2VOFS */, 0);
        rt.SetGpuReg(0x18 /* REG_BG3HOFS */, 0);
        rt.SetGpuReg(0x1A /* REG_BG3VOFS */, 0);
        rt.gba.bg(2).config.vofs = 0;
        rt.gba.bg(2).config.hofs = 0;
        rt.gba.bg(3).config.vofs = 0;
        rt.gba.bg(3).config.hofs = 0;
        // 1:1 décomp `LZ77UnCompVram(gBirchBagGrass_Gfx, VRAM)` (= tiles à
        // VRAM offset 0, charBase 0).
        rt.gba.vram.set(birchTilesData, 0);
        // 1:1 décomp `LZ77UnCompVram(gBirchBagTilemap, BG_SCREEN_ADDR(6))` (= BG3)
        // + `LZ77UnCompVram(gBirchGrassTilemap, BG_SCREEN_ADDR(7))` (= BG2).
        rt.gba.vram.set(new Uint8Array(birchBagTilemap), 6 * 0x800);
        rt.gba.vram.set(new Uint8Array(birchGrassTilemap), 7 * 0x800);
        // 1:1 décomp `LoadPalette(GetOverworldTextboxPalettePtr(), BG_PLTT_ID(14),
        // PLTT_SIZE_4BPP)` — palette pour la label window (sStarterLabelWindowId
        // utilise paletteNum=14) ET le main dialog window. Sans ça le texte du
        // label apparaît avec mauvais colors (= colors résidus du fade ou autre).
        const textboxPal = GetOverworldTextboxPalettePtr();
        if (textboxPal) LoadPalette(textboxPal, BG_PLTT_ID(14), textboxPal.length * 2);
        // 1:1 décomp `LoadPalette(gBirchBagGrass_Pal, BG_PLTT_ID(0), sizeof(...))`
        // = 32 entries flow vers sub-pal 0+1.
        LoadPalette(birchPalette, BG_PLTT_ID(0), birchPalette.length * 2);
        // 1:1 décomp `InitBgsFromTemplates(0, sBgTemplates, 3)` :
        // BG2 : charBase 0, mapBase 7, priority 3 (grass behind)
        // BG3 : charBase 0, mapBase 6, priority 1 (bag in front)
        InitBgFromTemplate({ bg: 2, charBaseIndex: 0, mapBaseIndex: 7, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 });
        InitBgFromTemplate({ bg: 3, charBaseIndex: 0, mapBaseIndex: 6, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 });
        ShowBg(2); ShowBg(3);
        console.log('[StarterChoose] Birch BG scene loaded (32-color palette, sub-palettes 0+1)');
        // 1:1 décomp `BeginNormalPaletteFade(PALETTES_ALL, 0, 0x10, 0, RGB_BLACK)` :
        // startY=16 (fully black) → endY=0 (visible) → fade in.
        rt.BeginNormalPaletteFade(0xFFFFFFFF, 0, 16, 0, 0);
        state = 'WAIT_FADE_IN_BIRCH';
        return false;
      }

      case 'WAIT_FADE_IN_BIRCH': {
        if (!rt.gPaletteFade.active) state = 'SPAWN_SPRITES';
        return false;
      }

      case 'SPAWN_SPRITES': {
        // Audit session 126 : destroy old pokeball/hand sprites BEFORE spawn pour
        // éviter les dupes en cas de re-entry (= reload page sans clean rt.gSprites,
        // ou hot-reload). Idempotent : DestroySprite no-op si spriteId < 0.
        for (let i = 0; i < 3; i++) {
          if (pokeballSpriteIds[i] >= 0) {
            try { rt.DestroySprite(pokeballSpriteIds[i]); } catch { /* */ }
            pokeballSpriteIds[i] = -1;
          }
        }
        if (handSpriteId >= 0) {
          try { rt.DestroySprite(handSpriteId); } catch { /* */ }
          handSpriteId = -1;
        }
        // Spawn 3 pokeballs at sPokeballCoords (= 1:1 décomp).
        for (let i = 0; i < 3; i++) {
          const [x, y] = POKEBALL_COORDS[i];
          pokeballSpriteIds[i] = rt.CreateSpriteFromTemplate('sSpriteTemplate_Pokeball', x, y);
          // Audit session 126 : le template `sSpriteTemplate_Pokeball` référence
          // la callback `SpriteCB_Pokeball`. Cette callback est définie dans
          // 3 auto-files (= starter_choose, pokeball, battle_factory_screen).
          // flattenBarrelOnGlobalThis expose la 1ère trouvée alphabetically,
          // qui est `battle_factory_screen-all-auto.ts:36 SpriteCB_Pokeball` —
          // celle-ci accède `sprite.oam.paletteNum` qui est undefined dans
          // notre runtime → crash continu pendant tout le starter choose flow.
          // Notre flow gère lui-même l'anim via StartSpriteAnim dans WAIT_INPUT
          // (= ligne 479), donc la callback du sprite est redondante. On la
          // null-out pour éviter le crash. 1:1 fonctionnel décomp (= même
          // résultat visuel : selected pokeball anim 1, others anim 0).
          rt.setSpriteCallback(pokeballSpriteIds[i], null);
        }
        // Spawn hand cursor.
        const [hx, hy] = CURSOR_COORDS[selection];
        handSpriteId = rt.CreateSpriteFromTemplate('sSpriteTemplate_Hand', hx, hy);
        // Idem : null-out la callback du hand sprite (= flow gère hand bob inline).
        rt.setSpriteCallback(handSpriteId, null);
        state = 'PROMPT_INIT';
        return false;
      }

      case 'PROMPT_INIT': {
        // 1:1 décomp `Task_StarterChoose` (starter_choose.c:476-481) :
        //   CreateStarterPokemonLabel(tStarterSelection);
        //   DrawStdFrameWithCustomTileAndPalette(0, FALSE, 0x2A8, 0xD);
        //   AddTextPrinterParameterized(0, FONT_NORMAL, gText_BirchInTrouble, ...);
        createStarterPokemonLabel(selection);
        ShowFieldMessage(getString('gText_BirchInTrouble'));
        // Sync lastSelection pour éviter flicker label au 1er WAIT_INPUT tick.
        lastSelection = selection;
        state = 'PROMPT_WAIT';
        return false;
      }

      case 'PROMPT_WAIT': {
        if (IsFieldMessageBoxHidden()) {
          state = 'WAIT_INPUT';
        }
        return false;
      }

      case 'WAIT_INPUT': {
        // Hand bob (1:1 décomp SpriteCB_SelectionHand : sprite.y2 = Sin(data[1], 8); data[1] += 4).
        handBobTimer = (handBobTimer + 4) & 0xFF;
        if (handSpriteId >= 0) {
          const handSprite = rt.gSprites.get(handSpriteId);
          if (handSprite) {
            const [hx, hy] = CURSOR_COORDS[selection];
            handSprite.x = hx;
            handSprite.y = hy;
            handSprite.y2 = Sin(handBobTimer, 8);
          }
        }

        // 1:1 décomp SpriteCB_Pokeball : selected pokeball = anim 1 (= moving),
        // others = anim 0 (= still). Aussi 1:1 décomp Task_MoveStarterChooseCursor
        // → Task_CreateStarterLabel : ClearStarterLabel + CreateStarterPokemonLabel
        // sur cursor change.
        if (selection !== lastSelection) {
          for (let i = 0; i < 3; i++) {
            if (pokeballSpriteIds[i] >= 0) {
              rt.StartSpriteAnim(pokeballSpriteIds[i], i === selection ? 1 : 0);
            }
          }
          clearStarterLabel();
          createStarterPokemonLabel(selection);
          lastSelection = selection;
        }

        const newKeys = rt.gMain.newKeys;
        if ((newKeys & DPAD_LEFT) && selection > 0) {
          selection--;
        } else if ((newKeys & DPAD_RIGHT) && selection < STARTER_SPECIES.length - 1) {
          selection++;
        } else if (newKeys & A_BUTTON) {
          // 1:1 décomp `Task_HandleStarterChooseInput` JOY_NEW(A_BUTTON) branch :
          //   ClearStarterLabel() puis spawn StarterCircle/MonSprite.
          clearStarterLabel();
          state = 'ASK_CONFIRM_INIT';
          HideFieldMessageBox();
        }
        return false;
      }

      case 'ASK_CONFIRM_INIT': {
        // Hide hand cursor when asking confirm (= 1:1 décomp ClearStarterLabel).
        if (handSpriteId >= 0) {
          const handSprite = rt.gSprites.get(handSpriteId);
          if (handSprite) handSprite.invisible = true;
        }
        // Spawn StarterCircle halo behind chosen pokeball (= 1:1 décomp Task_HandleStarterChooseInput).
        const [cx, cy] = POKEBALL_COORDS[selection];
        circleSpriteId = rt.CreateSpriteFromTemplate('sSpriteTemplate_StarterCircle', cx, cy);
        // Phase 5.5d-bis : Spawn the chosen starter's front sprite ON TOP of the circle.
        if (starterFrontLoaded && starterFrontWH[selection]) {
          const tileId = (STARTER_FRONT_BYTE_OFFSET_BASE + selection * 0x800) / 32;
          const palBank = STARTER_FRONT_PALETTE_SLOT_BASE + selection;
          // Center sprite on pokeball coords. CreateSpriteAtOam takes top-left for OAM.
          // For a 64×64 sprite to be centered at (cx, cy), we offset by -32, -32.
          const spawn = rt.CreateSpriteAtOam({
            tileId,
            paletteBank: palBank,
            x: cx - 32, y: cy - 32,
            shape: 0, size: 3,  // 64×64
            priority: 1,  // above circle
          });
          monSpriteId = spawn.spriteId;
        }
        // 1:1 décomp `Task_AskConfirmStarter` (starter_choose.c:521-528) :
        //   PlayCry_Normal(GetStarterPokemon(...), 0);
        //   FillWindowPixelBuffer(0, PIXEL_FILL(1));
        //   AddTextPrinterParameterized(0, FONT_NORMAL, gText_ConfirmStarterChoice, ...);
        //   ScheduleBgCopyTilemapToVram(0);
        //   CreateYesNoMenu(sWindowTemplate_ConfirmStarter, 0x2A8, 0xD, 0);
        // Le species name + category sont déjà visibles via la label window
        // séparée (= sStarterLabelWindowId) — pas dans le dialog confirm.
        ShowFieldMessage(getString('gText_ConfirmStarterChoice'));
        state = 'ASK_CONFIRM_WAIT';
        return false;
      }

      case 'ASK_CONFIRM_WAIT': {
        if (IsFieldMessageBoxHidden()) {
          // E6 fix : 1:1 décomp `starter_choose.c:77-86` sWindowTemplate_ConfirmStarter
          //   { .bg=0, .tilemapLeft=24, .tilemapTop=9, .width=5, .height=4,
          //     .paletteNum=14, .baseBlock=0x0260 }.
          // Et 1:1 décomp `starter_choose.c:CreateYesNoMenu(..., 0x2A8, 0xD, 0)`.
          // Ancien : tilemapLeft=21/top=8/w=6/pal=15/base=0x125 + args (0x214, 14, 0) =
          // tous divergents → cadre YesNo décalé et palette wrong.
          const tmpl: WindowTemplate = {
            bg: 0,
            tilemapLeft: 24,
            tilemapTop: 9,
            width: 5,
            height: 4,
            paletteNum: 14,
            baseBlock: 0x0260,
          };
          CreateYesNoMenu(tmpl, 0x2A8, 0xD, 0);
          state = 'WAIT_CONFIRM';
        }
        return false;
      }

      case 'WAIT_CONFIRM': {
        const result = Menu_ProcessInputNoWrapClearOnChoose();
        if (result === -2 /* MENU_NOTHING_CHOSEN */) return false;
        const yesNo = result === 0 ? 0 : 1;
        // Cleanup yesno window.
        const wid = GetYesNoWindowId();
        if (wid >= 0) {
          ClearStdWindowAndFrame(wid, true);
          RemoveWindow(wid);
        }
        if (yesNo === 0) {
          chosenIdx = selection;
          state = 'COMMIT_INIT';
        } else {
          state = 'DECLINE_INIT';
        }
        return false;
      }

      case 'COMMIT_INIT': {
        // 1:1 décomp `Task_HandleConfirmStarterInput` case 0 (= YES) :
        //   gSpecialVar_Result = task.data[0];
        //   ResetAllPicSprites();
        //   SetMainCallback2(gMain.savedCallback);
        // Notre approche inline : addToParty + setVar + cry, puis directly CLEANUP
        // (= overworld restore). Pas de message custom "X est ton POKéMON" : c'est
        // le script overworld qui suit (= Birch dialog route 101) qui dit ça.
        try {
          const speciesEnum = STARTER_SPECIES[chosenIdx];
          const starter = createPokemonInstance(speciesEnum, 5);
          gameState.addToParty(starter);
          VarSet('VAR_RESULT', chosenIdx);
          VarSet('VAR_STARTER_MON', chosenIdx);
          gameState.setVar('VAR_RESULT', chosenIdx);
          gameState.setVar('VAR_STARTER_MON', chosenIdx);
          console.log(`[StarterChoose] commit ${speciesEnum} (idx=${chosenIdx}) → party size=${gameState.partySize}`);
          // Session 124 Bug 5b : 1:1 décomp Task_AskConfirmStarter
          // PlayCry_Normal(GetStarterPokemon(task.data[0]), 0).
          const cryName = speciesEnum.replace('SPECIES_', '').toLowerCase();
          void import('./music').then(({ playCry }) => playCry(cryName));
        } catch (e) {
          console.error('[StarterChoose] commit failed', e);
        }
        // Audit session 126 : 1:1 décomp `CB2_GiveStarter` (battle_setup.c:917)
        // → `CB2_StartFirstBattle:930-948` lance le first wild battle vs
        // ZIGZAGOON Lv 2 AVANT de retourner au field. Avant ce wire, on
        // sautait directement à FADE_OUT_BIRCH → CLEANUP → overworld sans
        // combat. Maintenant on launch le battle entre les 2.
        state = 'LAUNCH_FIRST_BATTLE';
        return false;
      }

      case 'LAUNCH_FIRST_BATTLE': {
        // 1:1 décomp `startBirchTutorialBattle()` = wild battle vs Zigzagoon
        // Lv 2. Le BattleFlow gère son propre fade-in/out, sprites, UI move
        // menu, damage calc. On le tick comme un sub-flow.
        if (!firstBattleFlow) {
          console.log('[StarterChoose] launching first wild battle vs Zigzagoon Lv 2');
          firstBattleFlow = startBirchTutorialBattle();
        }
        if (firstBattleFlow.tick()) {
          // Battle terminé (DONE state). Continuer le flow normal.
          firstBattleFlow = null;
          state = 'WAIT_FIRST_BATTLE';
        }
        return false;
      }

      case 'WAIT_FIRST_BATTLE': {
        // 1 frame buffer pour ensure overworld restore from battle est settled
        // avant notre propre fade-out + cleanup.
        state = 'FADE_OUT_BIRCH';
        return false;
      }

      case 'FADE_OUT_BIRCH': {
        // 1:1 décomp post-confirm : SetMainCallback2(savedCallback) qui include
        // un fade out vers black avant return overworld. Notre approche inline :
        // explicit fade out then CLEANUP behind black.
        rt.BeginNormalPaletteFade(0xFFFFFFFF, 0, 0, 16, 0);
        state = 'WAIT_FADE_OUT_BIRCH';
        return false;
      }

      case 'WAIT_FADE_OUT_BIRCH': {
        if (!rt.gPaletteFade.active) state = 'CLEANUP';
        return false;
      }

      case 'DECLINE_INIT': {
        // Cleanup circle + mon sprite + restore hand visibility.
        if (circleSpriteId >= 0) {
          rt.DestroySprite(circleSpriteId);
          circleSpriteId = -1;
        }
        if (monSpriteId >= 0) {
          rt.DestroySprite(monSpriteId);
          monSpriteId = -1;
        }
        if (handSpriteId >= 0) {
          const handSprite = rt.gSprites.get(handSpriteId);
          if (handSprite) handSprite.invisible = false;
        }
        lastSelection = -1;  // Force pokeball anim refresh.
        state = 'PROMPT_INIT';
        return false;
      }

      case 'CLEANUP': {
        // Destroy all sprites.
        for (const id of pokeballSpriteIds) {
          if (id >= 0) rt.DestroySprite(id);
        }
        if (handSpriteId >= 0) rt.DestroySprite(handSpriteId);
        if (circleSpriteId >= 0) rt.DestroySprite(circleSpriteId);
        if (monSpriteId >= 0) rt.DestroySprite(monSpriteId);
        // Phase 5.1 — restore overworld BGs après le scene switch Birch.
        // Hide nos BG2/BG3 with Birch tilemaps, restore overworld config + tile
        // graphics + tilemaps. 1:1 décomp `sOverworldBgTemplates`
        // (overworld-data.ts:34) : BG1 mapBase 29 prio 1, BG2 mapBase 28 prio 2,
        // BG3 mapBase 30 prio 3.
        try {
          HideBg(2); HideBg(3);
          InitBgFromTemplate({ bg: 1, charBaseIndex: 0, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 });
          InitBgFromTemplate({ bg: 2, charBaseIndex: 0, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 });
          InitBgFromTemplate({ bg: 3, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 });
          // Restore overworld VRAM tile graphics (= we overwrote charBase 0).
          if (gMapHeader) CopyMapTilesetsToVram(gMapHeader.mapLayout);
          // Restore overworld tilemaps (= flush from buffer to VRAM).
          flushOverworldTilemaps(rt);
          // Resume overworld tileset animations (= water/flower tile cycling).
          resumeTilesetAnimations();
          // Resume FieldUpdateBgTilemapScroll (= overworld camera scroll back on).
          setFieldCameraSuspended(false);
          ShowBg(1); ShowBg(2); ShowBg(3);
          // Restore visible OAM slots (= overworld NPCs, player avatar, etc.)
          // saved au SCENE_INIT avant notre hide-all.
          for (const i of savedVisibleOam) {
            rt.gba.oam[i].visible = true;
          }
          savedVisibleOam.clear();
          console.log('[StarterChoose] overworld BGs + OAM sprites restored');
        } catch (bgErr) {
          console.warn('[StarterChoose] overworld restore failed', bgErr);
        }
        // 1:1 décomp post-CB2_ChooseStarter return : overworld CB2 fade in
        // (= reveal restored overworld from black).
        rt.BeginNormalPaletteFade(0xFFFFFFFF, 0, 16, 0, 0);
        state = 'WAIT_FADE_IN_OVERWORLD';
        return false;
      }

      case 'WAIT_FADE_IN_OVERWORLD': {
        if (!rt.gPaletteFade.active) state = 'DONE';
        return false;
      }

      case 'DONE': {
        // Session 133 add : cleanup les state vars globales (= scope.starterChoose
        // retournera {active:false} après flow terminé).
        delete (globalThis as Record<string, unknown>).__starterChooseState;
        delete (globalThis as Record<string, unknown>).__starterChooseSelection;
        delete (globalThis as Record<string, unknown>).__starterChooseChosen;
        return true;
      }
    }
    return false;
  };

  return { tick };
}
