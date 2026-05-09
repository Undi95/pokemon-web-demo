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
import { ClearStdWindowAndFrame, RemoveWindow, ShowBg, HideBg, InitBgFromTemplate, type WindowTemplate } from './gba-window-system';
import { getRuntime, LoadPalette } from './decomp-globals';
import { OBJ_PLTT_ID } from './decomp-runtime';
import { gameState } from './game-state';
import { createPokemonInstance } from './pokemon';
import { VarSet } from './script-vars';
import { Sin } from './decomp-helpers';
import { loadTileBin, loadGbaPal } from './gba/png-loader';
import { CopyMapTilesetsToVram, flushOverworldTilemaps, gMapHeader } from './map-loader';
import { pauseTilesetAnimations, resumeTilesetAnimations } from './tileset-anims';
import { getString, initStringsFromDecomp } from './gba-strings';
import { getSpeciesNameFr } from './data-tables';

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
// keyed par NATIONAL_DEX_* (= SPECIES_TORCHIC → NATIONAL_DEX_TORCHIC).
let _pokedexEntries: Record<string, { category: string }> | null = null;
async function getDexCategoryFr(speciesEnum: string): Promise<string> {
  if (!_pokedexEntries) {
    const resp = await fetch('/decomp/em/pokedex-entries.json');
    if (resp.ok) _pokedexEntries = await resp.json() as Record<string, { category: string }>;
  }
  const dexKey = 'NATIONAL_DEX_' + speciesEnum.replace(/^SPECIES_/, '');
  return _pokedexEntries?.[dexKey]?.category ?? '';
}

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

type State = 'LOAD_ASSETS' | 'WAIT_LOAD' | 'SPAWN_SPRITES'
           | 'PROMPT_INIT' | 'PROMPT_WAIT' | 'WAIT_INPUT'
           | 'ASK_CONFIRM_INIT' | 'ASK_CONFIRM_WAIT' | 'WAIT_CONFIRM'
           | 'COMMIT_INIT'
           | 'DECLINE_INIT'
           | 'CLEANUP'
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

  // 1:1 décomp `ResetSpriteData()` setup : save visible OAM slots avant hide,
  // pour restore au cleanup. Notre approche inline ne destroy pas les overworld
  // sprites (= NPCs, player avatar, follow Mom, etc.) — juste hide leur OAM
  // visibility flag pendant Birch BG, restore au cleanup.
  const savedVisibleOam = new Set<number>();

  // Hand bob timer.
  let handBobTimer = 0;
  let lastSelection = -1;

  const tick = (): boolean => {
    const rt = getRuntime();
    if (!rt) return false;

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

              // Phase 5.1 — Birch BG scene switch (= 1:1 décomp `CB2_ChooseStarter`
              // setup BG2 + BG3 avec birch_bag tilemap + birch_grass tilemap).
              // Replace l'overworld background avec la scène ROM authentique
              // pendant le starter choice. Assets : tiles.4bpp.bin (= 256 tiles
              // 4bpp packed) + tiles.gbapal (= 32 colors split en 2 sub-palettes,
              // tilemap encodes via bits 12-15 quel sub-palette par tile).
              try {
                const [tilesData, palette, birchBagBin, birchGrassBin] = await Promise.all([
                  loadTileBin('/decomp/em/starter_choose/tiles.png', 4),
                  loadGbaPal('/decomp/em/starter_choose/tiles.gbapal'),
                  fetch('/decomp/em/starter_choose/birch_bag.bin').then(r => r.arrayBuffer()),
                  fetch('/decomp/em/starter_choose/birch_grass.bin').then(r => r.arrayBuffer()),
                ]);
                // 1:1 décomp `ResetSpriteData()` : hide all OAM sprites avant
                // de spawn nos pokeballs/hand. Notre approche inline est non-
                // destructive : save les visible slots overworld pour restore
                // au cleanup (= NPCs, player avatar, follow Mom restent spawned
                // côté engine, juste OAM visibility off le temps de Birch BG).
                for (let i = 0; i < 128; i++) {
                  if (rt.gba.oam[i].visible) savedVisibleOam.add(i);
                  rt.gba.oam[i].visible = false;
                }
                // Hide overworld BG1/BG2/BG3 (= keep BG0 pour windows dialog).
                HideBg(1); HideBg(2); HideBg(3);
                // Pause overworld tileset animations : sinon TilesetAnim_General
                // réécrit les water/flower tiles à VRAM 0x3000-0x3800 chaque frame
                // et clobbe nos tilemaps Birch (BG3 mapBase 6 = 0x3000, BG2 mapBase 7
                // = 0x3800). Cf. tileset-anims.ts:312 UpdateTilesetAnimations.
                pauseTilesetAnimations();
                // Reset BG scroll (= overworld camera vofs/hofs leftover).
                rt.gba.bg(2).config.vofs = 0;
                rt.gba.bg(2).config.hofs = 0;
                rt.gba.bg(3).config.vofs = 0;
                rt.gba.bg(3).config.hofs = 0;
                // Write tile graphics → VRAM offset 0 (= charBase 0 shared).
                rt.gba.vram.set(tilesData, 0);
                // Write tilemaps → mapBase 6 (BG3 birch_bag) + 7 (BG2 birch_grass).
                rt.gba.vram.set(new Uint8Array(birchBagBin), 6 * 0x800);
                rt.gba.vram.set(new Uint8Array(birchGrassBin), 7 * 0x800);
                // Load 32-entry palette → BG_PLTT_ID(0) (= flow into sub-pal 0+1).
                LoadPalette(palette, 0, palette.length * 2);
                // Init BG2 (charBase 0, mapBase 7, priority 3 = grass behind)
                // et BG3 (charBase 0, mapBase 6, priority 1 = bag in front).
                // 1:1 décomp `sBgTemplates[1..2]` (starter_choose.c:131-149).
                InitBgFromTemplate({ bg: 2, charBaseIndex: 0, mapBaseIndex: 7, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 });
                InitBgFromTemplate({ bg: 3, charBaseIndex: 0, mapBaseIndex: 6, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 });
                ShowBg(2); ShowBg(3);
                console.log('[StarterChoose] Birch BG scene loaded (32-color palette, sub-palettes 0+1)');
              } catch (bgErr) {
                console.warn('[StarterChoose] Birch BG load failed (non-fatal)', bgErr);
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
        if (loadDone) state = 'SPAWN_SPRITES';
        return false;
      }

      case 'SPAWN_SPRITES': {
        // Spawn 3 pokeballs at sPokeballCoords (= 1:1 décomp).
        for (let i = 0; i < 3; i++) {
          const [x, y] = POKEBALL_COORDS[i];
          pokeballSpriteIds[i] = rt.CreateSpriteFromTemplate('sSpriteTemplate_Pokeball', x, y);
        }
        // Spawn hand cursor.
        const [hx, hy] = CURSOR_COORDS[selection];
        handSpriteId = rt.CreateSpriteFromTemplate('sSpriteTemplate_Hand', hx, hy);
        state = 'PROMPT_INIT';
        return false;
      }

      case 'PROMPT_INIT': {
        // 1:1 décomp `AddTextPrinterParameterized(0, FONT_NORMAL, gText_BirchInTrouble, ...)`.
        ShowFieldMessage(getString('gText_BirchInTrouble'));
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
        // others = anim 0 (= still).
        if (selection !== lastSelection) {
          for (let i = 0; i < 3; i++) {
            if (pokeballSpriteIds[i] >= 0) {
              rt.StartSpriteAnim(pokeballSpriteIds[i], i === selection ? 1 : 0);
            }
          }
          lastSelection = selection;
        }

        const newKeys = rt.gMain.newKeys;
        if ((newKeys & DPAD_LEFT) && selection > 0) {
          selection--;
        } else if ((newKeys & DPAD_RIGHT) && selection < STARTER_SPECIES.length - 1) {
          selection++;
        } else if (newKeys & A_BUTTON) {
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
        // 1:1 décomp `CreateStarterPokemonLabel(selection)` + Task_AskConfirmStarter :
        // species name (= gSpeciesNames[species]) + category (= CopyMonCategoryText)
        // dans une label window séparée, puis gText_ConfirmStarterChoice dans le
        // main dialog. Notre approche inline concatène en un seul message en
        // attendant l'implémentation full sStarterLabelWindowId.
        const speciesEnum = STARTER_SPECIES[selection];
        const speciesName = getSpeciesNameFr(speciesEnum);
        const category = starterCategories[selection];
        const confirmText = getString('gText_ConfirmStarterChoice');
        ShowFieldMessage(`${speciesName}, ${category}!\n${confirmText}`);
        state = 'ASK_CONFIRM_WAIT';
        return false;
      }

      case 'ASK_CONFIRM_WAIT': {
        if (IsFieldMessageBoxHidden()) {
          // 1:1 décomp `CreateYesNoMenu(sWindowTemplate_ConfirmStarter, 0x2A8, 0xD, 0)`.
          // sWindowTemplate_ConfirmStarter from décomp : tilemapLeft=21, tilemapTop=8,
          // width=6, height=4, paletteNum=14, baseBlock=0x125.
          const tmpl: WindowTemplate = {
            bg: 0,
            tilemapLeft: 21,
            tilemapTop: 8,
            width: 6,
            height: 4,
            paletteNum: 15,
            baseBlock: 0x125,
          };
          CreateYesNoMenu(tmpl, 0x214, 14, 0);
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
        state = 'CLEANUP';
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
          ShowBg(1); ShowBg(2); ShowBg(3);
          // Restore visible OAM slots (= overworld NPCs, player avatar, etc.)
          // saved au LOAD_ASSETS avant notre hide-all.
          for (const i of savedVisibleOam) {
            rt.gba.oam[i].visible = true;
          }
          savedVisibleOam.clear();
          console.log('[StarterChoose] overworld BGs + OAM sprites restored');
        } catch (bgErr) {
          console.warn('[StarterChoose] overworld restore failed', bgErr);
        }
        state = 'DONE';
        return false;
      }

      case 'DONE': {
        return true;
      }
    }
    return false;
  };

  return { tick };
}
