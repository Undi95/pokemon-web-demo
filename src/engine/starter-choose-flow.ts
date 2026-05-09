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
import { ClearStdWindowAndFrame, RemoveWindow, type WindowTemplate } from './gba-window-system';
import { getRuntime } from './decomp-globals';
import { gameState } from './game-state';
import { createPokemonInstance } from './pokemon';
import { VarSet } from './script-vars';
import { Sin } from './decomp-helpers';

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

// FR labels (= cf. species_names_fr).
const STARTER_NAMES: ReadonlyArray<string>      = ['ARCKO', 'POUSSIFEU', 'GOBOU'];
// 1:1 décomp pokedex-entries.json categories.
const STARTER_CATEGORIES: ReadonlyArray<string> = ['BOIS GECKO', 'POUSSIN', 'POISSONBOUE'];

// 1:1 décomp gText_BirchInTrouble.
const TEXT_BIRCH_IN_TROUBLE = 'Le PROF. SEKO a des ennuis!\nChoisis un POKéMON et sauve-le!';
// 1:1 décomp gText_ConfirmStarterChoice.
const TEXT_CONFIRM_STARTER = 'Prendre ce POKéMON?';

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
           | 'COMMIT_INIT' | 'COMMIT_WAIT'
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

  // Async preload state.
  let loadStarted = false;
  let loadDone = false;
  let loadFailed = false;

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
        ShowFieldMessage(TEXT_BIRCH_IN_TROUBLE);
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
        // Show confirm dialog with starter name + category.
        ShowFieldMessage(`${STARTER_NAMES[selection]}, ${STARTER_CATEGORIES[selection]}!\n${TEXT_CONFIRM_STARTER}`);
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
        try {
          const speciesEnum = STARTER_SPECIES[chosenIdx];
          const starter = createPokemonInstance(speciesEnum, 5);
          gameState.addToParty(starter);
          VarSet('VAR_RESULT', chosenIdx);
          VarSet('VAR_STARTER_MON', chosenIdx);
          gameState.setVar('VAR_RESULT', chosenIdx);
          gameState.setVar('VAR_STARTER_MON', chosenIdx);
          console.log(`[StarterChoose] commit ${speciesEnum} (idx=${chosenIdx}) → party size=${gameState.partySize}`);
        } catch (e) {
          console.error('[StarterChoose] commit failed', e);
        }
        ShowFieldMessage(`${STARTER_NAMES[chosenIdx]} est ton POKéMON !`);
        state = 'COMMIT_WAIT';
        return false;
      }

      case 'COMMIT_WAIT': {
        if (IsFieldMessageBoxHidden() && (rt.gMain.newKeys & (A_BUTTON | B_BUTTON))) {
          HideFieldMessageBox();
          state = 'CLEANUP';
        }
        return false;
      }

      case 'DECLINE_INIT': {
        state = 'PROMPT_INIT';
        return false;
      }

      case 'CLEANUP': {
        // Destroy all sprites.
        for (const id of pokeballSpriteIds) {
          if (id >= 0) rt.DestroySprite(id);
        }
        if (handSpriteId >= 0) rt.DestroySprite(handSpriteId);
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
