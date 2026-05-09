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
 *
 * Le flow tourne via SetupNativeScript polling depuis l'opcode `special` (= dans
 * script-opcodes.ts). Chaque tick avance la state machine.
 *
 * State machine (= 1:1 décomp src/starter_choose.c Task_StarterChoose suite) :
 *   PROMPT       : show "Le PROF. SEKO a des ennuis!\nChoisis un POKéMON et sauve-le!"
 *                  + show selection legend (= 1=Arcko / 2=Poussifeu / 3=Gobou)
 *   WAIT_INPUT   : poll arrows (gauche/droite) + A. Update label si changement.
 *   ASK_CONFIRM  : show "Prendre ce POKéMON?" + spawn YesNo menu
 *   WAIT_CONFIRM : poll Menu_ProcessInputNoWrapClearOnChoose
 *   COMMIT       : addToParty + setVar + cleanup → done
 *   DECLINE      : cleanup yesno → back to WAIT_INPUT
 *
 * 1:1 limitation : pas de sprites pokeball/hand visuels (= sScene Phaser
 * séparée violerait directive). Le user voit le dialog + arrow keys + yesno
 * comme un sign/NPC dialog. Pour avoir les sprites visuels 1:1, il faut
 * activer les auto-callbacks `starter_choose-callbacks-auto.ts` via le runtime
 * complet (= ~6h de bridging). Phase ultérieure.
 *
 * Cf. memory/upd2-progress.md Phase 5.5.
 */
import { ShowFieldMessage, IsFieldMessageBoxHidden, HideFieldMessageBox } from './field-message-box';
import { CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose, GetYesNoWindowId } from './gba-menu-system';
import { ClearStdWindowAndFrame, RemoveWindow, type WindowTemplate } from './gba-window-system';
import { getRuntime } from './decomp-globals';
import { gameState } from './game-state';
import { createPokemonInstance } from './pokemon';
import { VarSet } from './script-vars';

// 1:1 décomp `sStarterMon[]` (= public/decomp/em/static-tables/starter_choose.json).
const STARTER_SPECIES: ReadonlyArray<string> = [
  'SPECIES_TREECKO', 'SPECIES_TORCHIC', 'SPECIES_MUDKIP',
];
// FR labels (= cf. species_names_fr).
const STARTER_NAMES: ReadonlyArray<string>      = ['ARCKO', 'POUSSIFEU', 'GOBOU'];
// 1:1 décomp pokedex-entries.json categories.
const STARTER_CATEGORIES: ReadonlyArray<string> = ['BOIS GECKO', 'POUSSIN', 'POISSONBOUE'];

// 1:1 décomp gText_BirchInTrouble + selection legend.
const TEXT_BIRCH_IN_TROUBLE = 'Le PROF. SEKO a des ennuis!\nChoisis un POKéMON et sauve-le!';
// 1:1 décomp gText_ConfirmStarterChoice.
const TEXT_CONFIRM_STARTER = 'Prendre ce POKéMON?';

// GBA key masks (= 1:1 décomp gba/key.h).
const A_BUTTON   = 0x01;
const B_BUTTON   = 0x02;
const DPAD_RIGHT = 0x10;
const DPAD_LEFT  = 0x20;

type State = 'INIT' | 'PROMPT_WAIT' | 'PROMPT_DONE' | 'WAIT_INPUT'
           | 'ASK_CONFIRM_INIT' | 'ASK_CONFIRM_WAIT' | 'WAIT_CONFIRM'
           | 'COMMIT_INIT' | 'COMMIT_WAIT'
           | 'DECLINE_INIT' | 'DECLINE_WAIT'
           | 'DONE';

interface ChooseStarterFlow {
  /** Tick the state machine. Returns true when done (= script can resume). */
  tick(): boolean;
}

/** Build a fresh ChooseStarter flow + return the controller. */
export function startChooseStarterFlow(): ChooseStarterFlow {
  let state: State = 'INIT';
  let selection = 1;  // Default = TORCHIC (= 1:1 décomp middle pokeball).
  let chosenIdx = -1;

  const buildPromptText = (): string => {
    return `${TEXT_BIRCH_IN_TROUBLE}\n→ ${STARTER_NAMES[selection]} (${STARTER_CATEGORIES[selection]})`;
  };

  const tick = (): boolean => {
    const rt = getRuntime();
    if (!rt) return false;

    switch (state) {
      case 'INIT': {
        // Show initial dialog with current selection.
        ShowFieldMessage(buildPromptText());
        state = 'PROMPT_WAIT';
        return false;
      }

      case 'PROMPT_WAIT': {
        // Wait for message render done.
        if (IsFieldMessageBoxHidden()) {
          state = 'WAIT_INPUT';
        }
        return false;
      }

      case 'WAIT_INPUT': {
        const newKeys = rt.gMain.newKeys;
        // ←/→ : change selection, refresh dialog text.
        if ((newKeys & DPAD_LEFT) && selection > 0) {
          selection--;
          state = 'INIT';  // Re-render with new selection.
          HideFieldMessageBox();
        } else if ((newKeys & DPAD_RIGHT) && selection < STARTER_SPECIES.length - 1) {
          selection++;
          state = 'INIT';
          HideFieldMessageBox();
        } else if (newKeys & A_BUTTON) {
          state = 'ASK_CONFIRM_INIT';
          HideFieldMessageBox();
        } else if (newKeys & B_BUTTON) {
          // B doesn't cancel here (= no exit, must pick).
        }
        return false;
      }

      case 'ASK_CONFIRM_INIT': {
        // Show confirm dialog "Prendre ce POKéMON ?" + name.
        ShowFieldMessage(`${STARTER_NAMES[selection]}\n${TEXT_CONFIRM_STARTER}`);
        state = 'ASK_CONFIRM_WAIT';
        return false;
      }

      case 'ASK_CONFIRM_WAIT': {
        if (IsFieldMessageBoxHidden()) {
          // Spawn YesNo menu (= 1:1 décomp CreateYesNoMenu(sWindowTemplate_ConfirmStarter, 0x2A8, 0xD, 0)).
          // sWindowTemplate_ConfirmStarter from décomp : tilemapLeft=21, tilemapTop=8,
          // width=6, height=4, paletteNum=14, baseBlock=0x125.
          const tmpl: WindowTemplate = {
            bg: 0,
            tilemapLeft: 21,
            tilemapTop: 8,
            width: 6,
            height: 4,
            paletteNum: 15,    // DLG_WINDOW_PALETTE_NUM
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
        // 0 = OUI, 1 = NON, -1 = B pressed (treated as NON 1:1 décomp).
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
        // 1:1 décomp CB2_GiveStarter logic :
        //   *GetVarPointer(VAR_STARTER_MON) = gSpecialVar_Result;
        //   ScriptGiveMon(GetStarterPokemon(idx), 5, ITEM_NONE, 0, 0, 0);
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
        // Show one final dialog "X est ton POKéMON !" then close.
        ShowFieldMessage(`${STARTER_NAMES[chosenIdx]} est ton POKéMON !`);
        state = 'COMMIT_WAIT';
        return false;
      }

      case 'COMMIT_WAIT': {
        if (IsFieldMessageBoxHidden()) {
          // Wait for A press to close final message.
          if (rt.gMain.newKeys & (A_BUTTON | B_BUTTON)) {
            HideFieldMessageBox();
            state = 'DONE';
          }
        }
        return false;
      }

      case 'DECLINE_INIT': {
        // Back to selection prompt.
        state = 'INIT';
        return false;
      }

      case 'DECLINE_WAIT': {
        return false;  // unused
      }

      case 'DONE': {
        return true;
      }
    }
    return false;
  };

  return { tick };
}
