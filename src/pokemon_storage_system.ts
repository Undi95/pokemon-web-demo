/**
 * pokemon_storage_system.ts — miroir 1:1 PARTIEL de `src/pokemon_storage_system.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/pokemon_storage_system.c`.
 *
 * Porte les helpers de comptage/espace (CheckFreePokemonStorageSpace, StorageGetCurrentBox,
 * AnyStorageMonWithMove, CountStorageNonEggMons, CountPartyAliveNonEggMonsExcept…) —
 * le système PC complet (UI boîtes, dépôt/retrait) est un gros sous-système déféré.
 * La struct PokemonStorage (14×30 BoxPokemon) existe déjà dans le save block (sectors 5-13).
 */

import { GetPokemonStorage } from './save';
import { TOTAL_BOXES_COUNT, IN_BOX_COUNT } from './engine/save/save-blocks';
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';
import {
  gPlayerParty, GetMonData, MON_DATA_SPECIES, MON_DATA_IS_EGG, MON_DATA_HP,
} from './engine/battle/party-storage';
// CopyMon/ZeroMonData : foyer pokemon.c (pokemon.ts n'importe PAS ce module —
// il passe par le hook __getPokemonStorage — donc pas de cycle).
import { CopyMon, ZeroMonData } from './pokemon';
import { VarGet } from './event_data';
import { PARTY_SIZE } from '../include/constants/global';
// ─── PC MAIN MENU (phase 1) : helpers UI portés ────────────────────────────
import { getRuntime, gMain } from '../harness/runtime/decomp-globals';
import { AddWindow, RemoveWindow, FillWindowPixelBuffer, CopyWindowToVram } from './window';
import {
  DrawStdWindowFrame, PrintMenuTable, InitMenuInUpperLeftCornerNormal, Menu_ProcessInput,
  Menu_MoveCursor, Menu_GetCursorPos, LoadMessageBoxAndBorderGfx, DrawDialogueFrame,
  ClearStdWindowAndFrame, AddTextPrinterParameterized2,
} from './menu';
import type { MenuAction } from './menu';
import { GetMaxWidthInMenuTable } from './international_string_util';
import { CleanupOverworldWindowsAndTilemaps } from './overworld';
import { CalculatePlayerPartyCount } from './pokemon';
import { LockPlayerFieldControls, UnlockPlayerFieldControls } from './script';

/** 1:1 décomp `CheckFreePokemonStorageSpace(void)` (pokemon_storage_system.c:9572) :
 *    for (i = 0; i < TOTAL_BOXES_COUNT; i++)
 *      for (j = 0; j < IN_BOX_COUNT; j++)
 *        if (!GetBoxMonData(&boxes[i][j], MON_DATA_SANITY_HAS_SPECIES))
 *          return TRUE;
 *    return FALSE;
 *  Renvoie TRUE dès qu'un slot de boîte PC est libre. Nos slots sont `PokemonInstance
 *  | null` → libre = `null` (ou speciesId 0, = SPECIES_NONE). */
export function CheckFreePokemonStorageSpace(): boolean {
  const boxes = GetPokemonStorage().boxes;
  for (let i = 0; i < TOTAL_BOXES_COUNT; i++) {
    for (let j = 0; j < IN_BOX_COUNT; j++) {
      const slot = boxes[i]?.[j];
      if (!slot || !slot.species) return true;
    }
  }
  return false;
}

/** 1:1 décomp `u8 StorageGetCurrentBox(void)` (pokemon_storage_system.c:9404) :
 *  `return gPokemonStoragePtr->currentBox;` — la boîte PC actuellement pointée
 *  par le curseur. Utilisé par ShouldShowBoxWasFullMessage (field_specials.c). */
export function StorageGetCurrentBox(): number {
  return GetPokemonStorage().currentBox;
}

/** 1:1 décomp `struct BoxPokemon *GetBoxedMonPtr(u8 boxId, u8 boxPosition)`
 *  (pokemon_storage_system.c:9450) : `&gPokemonStoragePtr->boxes[boxId][boxPosition]`.
 *  Nos slots = Pokemon | null (modèle unifié Pokemon == BoxPokemon). */
export function GetBoxedMonPtr(boxId: number, boxPosition: number) {
  return GetPokemonStorage().boxes[boxId]?.[boxPosition] ?? null;
}

/** 1:1 décomp `void SetBoxMonNickAt(u8 boxId, u8 boxPosition, const u8 *nick)`
 *  (pokemon_storage_system.c:9461) : SetBoxMonDataAt(MON_DATA_NICKNAME). Nos
 *  nicknames save = string JS. */
export function SetBoxMonNickAt(boxId: number, boxPosition: number, nick: string): void {
  const mon = GetPokemonStorage().boxes[boxId]?.[boxPosition];
  if (mon) mon.nickname = nick;
}

/** 1:1 décomp `bool8 AnyStorageMonWithMove(u16 move)` (pokemon_storage_system.c:9636) :
 *  ```c
 *  for (i < TOTAL_BOXES_COUNT) for (j < IN_BOX_COUNT)
 *      if (HAS_SPECIES && !IS_EGG && GetBoxMonData(KNOWN_MOVES, {move, MOVES_COUNT}))
 *          return TRUE;
 *  return FALSE;
 *  ```
 *  TRUE si AU MOINS un Pokémon (non-œuf) du PC connaît `move`. Utilisé par
 *  IsLastMonThatKnowsSurf (anti-softlock : on ne bloque l'oubli que si AUCUN mon
 *  party NI PC ne connaît le move). Box mons = Pokemon NUMÉRIQUES : `move` (id décomp)
 *  comparé direct à `mon.moves[]` (number[]). */
export function AnyStorageMonWithMove(move: number): boolean {
  const boxes = GetPokemonStorage().boxes;
  for (let i = 0; i < TOTAL_BOXES_COUNT; i++) {
    for (let j = 0; j < IN_BOX_COUNT; j++) {
      const mon = boxes[i]?.[j];
      if (mon && mon.species && !mon.isEgg && mon.moves.includes(move)) {
        return true;
      }
    }
  }
  return false;
}

/** 1:1 décomp `u32 CountStorageNonEggMons(void)` (pokemon_storage_system.c:9600) :
 *  ```c
 *  for (i < TOTAL_BOXES_COUNT) for (j < IN_BOX_COUNT)
 *      if (HAS_SPECIES && !IS_EGG) count++;
 *  ```
 *  Compte les Pokémon (non-œuf) rangés dans les boîtes PC. Utilisé par
 *  CountPartyAliveNonEggMons (= PC + party), consommé par les scripts de pension. */
export function CountStorageNonEggMons(): number {
  const boxes = GetPokemonStorage().boxes;
  let count = 0;
  for (let i = 0; i < TOTAL_BOXES_COUNT; i++) {
    for (let j = 0; j < IN_BOX_COUNT; j++) {
      const mon = boxes[i]?.[j];
      if (mon && mon.species && !mon.isEgg) count++;
    }
  }
  return count;
}

/** 1:1 décomp `s16 CompactPartySlots(void)` (pokemon_storage_system.c:6734-6757) :
 *  ```c
 *  for (i = 0, last = 0; i < PARTY_SIZE; i++) {
 *      u16 species = GetMonData(&gPlayerParty[i], MON_DATA_SPECIES);
 *      if (species != SPECIES_NONE) {
 *          if (i != last) gPlayerParty[last] = gPlayerParty[i];
 *          last++;
 *      } else if (retVal == -1) retVal = i;
 *  }
 *  for (; last < PARTY_SIZE; last++) ZeroMonData(&gPlayerParty[last]);
 *  ```
 *  Compacte les slots party (mons valides remontés en tête, queue zérotée) ;
 *  retourne l'index du 1er slot qui était vide (-1 si aucun). La copie de struct
 *  `gPlayerParty[last] = gPlayerParty[i]` = CopyMon (copie par VALEUR — les slots
 *  gPlayerParty sont des objets fixes, jamais réassignés par référence). */
export function CompactPartySlots(): number {
  let retVal = -1;
  let last = 0;
  for (let i = 0; i < PARTY_SIZE; i++) {
    const species = GetMonData(gPlayerParty[i], MON_DATA_SPECIES) as number;
    if (species !== 0 /* SPECIES_NONE */) {
      if (i !== last) CopyMon(gPlayerParty[last], gPlayerParty[i]);
      last++;
    } else if (retVal === -1) {
      retVal = i;
    }
  }
  for (; last < PARTY_SIZE; last++) ZeroMonData(gPlayerParty[last]);
  return retVal;
}

/** 1:1 décomp `u8 CountPartyAliveNonEggMonsExcept(u8 slotToIgnore)`
 *  (pokemon_storage_system.c:1440) : compte les mons party vivants (HP>0), non-œufs,
 *  hors slot `slotToIgnore` (PARTY_SIZE = aucun slot ignoré). */
export function CountPartyAliveNonEggMonsExcept(slotToIgnore: number): number {
  let count = 0;
  for (let i = 0; i < 6 /* PARTY_SIZE */; i++) {
    const mon = gPlayerParty[i];
    if (i !== slotToIgnore
      && (GetMonData(mon, MON_DATA_SPECIES) as number) !== 0 /* SPECIES_NONE */
      && !(GetMonData(mon, MON_DATA_IS_EGG) as number)
      && (GetMonData(mon, MON_DATA_HP) as number) !== 0) {
      count++;
    }
  }
  return count;
}

/** 1:1 décomp `u16 CountPartyAliveNonEggMons_IgnoreVar0x8004Slot(void)`
 *  (pokemon_storage_system.c:1458) — special (pension : « dernier mon valide ? »). */
export function CountPartyAliveNonEggMons_IgnoreVar0x8004Slot(): number {
  return CountPartyAliveNonEggMonsExcept(VarGet(0x8004) /* gSpecialVar_0x8004 */);
}

// ═══════════════════════════════════════════════════════════════════════════
// PC MAIN MENU (pokemon_storage_system.c:1524-1696) — PHASE 1 : le menu
// RETIRER / DÉPOSER / DÉPLACER / RANGER OBJETS / AU REVOIR obtenu en accédant au PC
// (script « PC POKéMON »). L'écran des boîtes (EnterPokeStorage) = phase 2 (stub).
// ═══════════════════════════════════════════════════════════════════════════

// 1:1 enum options (pokemon_storage_system.c:54-60)
const OPTION_WITHDRAW = 0, OPTION_DEPOSIT = 1, OPTION_EXIT = 4, OPTIONS_COUNT = 5;
// 1:1 enum états (:1524)
const STATE_LOAD = 0, STATE_FADE_IN = 1, STATE_HANDLE_INPUT = 2, STATE_ERROR_MSG = 3;
// Menu_ProcessInput sentinelles (menu.ts) + touches GBA (io_reg) + text/window (text.ts)
const MENU_NOTHING_CHOSEN = -2, MENU_B_PRESSED = -1;
const DPAD_UP = 0x0040, DPAD_DOWN = 0x0080, A_BUTTON = 0x0001, B_BUTTON = 0x0002;
const FONT_NORMAL = 1, TEXT_COLOR_DARK_GRAY = 2, TEXT_COLOR_WHITE = 1, TEXT_COLOR_LIGHT_GRAY = 3;
const COPYWIN_FULL = 3, TEXT_SKIP_DRAW = 0xFF, PIXEL_FILL_1 = 0x11;

/** 1:1 `sMainMenuTexts` (:882) — {text=libellé menu, desc=description}. Libellés FR ≈ gText_*
 *  du décomp (à câbler sur les vraies strings gba au raffinement). */
const sMainMenuTexts: ReadonlyArray<{ text: string; desc: string }> = [
  // 1:1 strings.c:932-941 (décomp FR) — libellés (gText_*) + descriptions (gText_*Description).
  { text: 'RETIRER POKéMON', desc: "Intégrer dans l'équipe des POKéMON se\ntrouvant dans les BOITES." },   // OPTION_WITHDRAW
  { text: 'DEPOSER POKéMON', desc: "Déposer des POKéMON de l'équipe\ndans des BOITES." },                   // OPTION_DEPOSIT
  { text: 'DEPLACER POKéMON', desc: "Organiser les POKéMON dans les BOITES\net dans l'équipe." },           // OPTION_MOVE_MONS
  { text: 'DEPLACER OBJETS', desc: "Déplacer des objets tenus\ndans une BOITE ou par l'équipe." },          // OPTION_MOVE_ITEMS
  { text: 'SALUT!', desc: 'Retour au menu précédent.' },                                                    // OPTION_EXIT
];
// 1:1 `sWindowTemplate_MainMenu` (:891)
const sWindowTemplate_MainMenu = { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 17, height: 10, paletteNum: 15, baseBlock: 0x1 };

// task data (:1532) : tState=data[0] tSelectedOption=data[1] tInput=data[2] tNextOption=data[3] tWindowId=data[15]

function _mainMenuActions(): MenuAction[] {
  return sMainMenuTexts.map((t) => ({ text: t.text, func: () => {} } as unknown as MenuAction));
}

function _printDesc(option: number, skipDraw: number): void {
  FillWindowPixelBuffer(0, PIXEL_FILL_1);
  AddTextPrinterParameterized2(0, FONT_NORMAL, sMainMenuTexts[option].desc, skipDraw, null as never, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);
}

/** 1:1 `CreateMainMenu` (pokemon_storage_system.c:1678). */
function CreateMainMenu(whichMenu: number): number {
  const template = { ...sWindowTemplate_MainMenu };
  template.width = GetMaxWidthInMenuTable(_mainMenuActions(), OPTIONS_COUNT);
  const windowId = AddWindow(template as never);
  DrawStdWindowFrame(windowId, false);
  PrintMenuTable(windowId, OPTIONS_COUNT, _mainMenuActions());
  InitMenuInUpperLeftCornerNormal(windowId, OPTIONS_COUNT, whichMenu);
  return windowId;
}

/** 1:1 `Task_PCMainMenu` (pokemon_storage_system.c:1538). */
function Task_PCMainMenu(taskId: number): void {
  const rt = getRuntime(); if (!rt) return;
  const task = rt.gTasks[taskId];
  switch (task.data[0] /* tState */) {
    case STATE_LOAD:
      task.data[15] = CreateMainMenu(task.data[1]);  // tWindowId ← tSelectedOption
      LoadMessageBoxAndBorderGfx();
      DrawDialogueFrame(0, false);
      _printDesc(task.data[1], TEXT_SKIP_DRAW);
      CopyWindowToVram(0, COPYWIN_FULL);
      CopyWindowToVram(task.data[15], COPYWIN_FULL);
      task.data[0]++;
      break;
    case STATE_FADE_IN:
      // 1:1 IsWeatherNotFadingIn() — hors OW, pas de fondu météo → on avance (net-effect).
      task.data[0]++;
      break;
    case STATE_HANDLE_INPUT: {
      task.data[2] = Menu_ProcessInput();  // tInput
      const input = task.data[2];
      if (input === MENU_NOTHING_CHOSEN) {
        task.data[3] = task.data[1];  // tNextOption ← tSelectedOption
        if ((gMain.newKeys & DPAD_UP) && --task.data[3] < 0) task.data[3] = OPTIONS_COUNT - 1;
        if ((gMain.newKeys & DPAD_DOWN) && ++task.data[3] > OPTIONS_COUNT - 1) task.data[3] = 0;
        if (task.data[1] !== task.data[3]) {
          task.data[1] = task.data[3];
          _printDesc(task.data[1], 0);
        }
      } else if (input === MENU_B_PRESSED || input === OPTION_EXIT) {
        ClearStdWindowAndFrame(task.data[15], true);
        UnlockPlayerFieldControls();
        RemoveWindow(task.data[15]);
        rt.DestroyTask(taskId);
      } else if (input === OPTION_WITHDRAW && CalculatePlayerPartyCount() === PARTY_SIZE) {
        FillWindowPixelBuffer(0, PIXEL_FILL_1);
        AddTextPrinterParameterized2(0, FONT_NORMAL, 'Ton équipe est pleine !', 0, null as never, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);
        task.data[0] = STATE_ERROR_MSG;
      } else if (input === OPTION_DEPOSIT && CalculatePlayerPartyCount() === 1) {
        FillWindowPixelBuffer(0, PIXEL_FILL_1);
        AddTextPrinterParameterized2(0, FONT_NORMAL, "Il n'y a qu'un POKéMON !", 0, null as never, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);
        task.data[0] = STATE_ERROR_MSG;
      } else {
        // Enter PC — phase 2 (écran boîtes) = stub : on referme proprement pour l'instant.
        EnterPokeStorage(input);
        ClearStdWindowAndFrame(task.data[15], true);
        UnlockPlayerFieldControls();
        RemoveWindow(task.data[15]);
        rt.DestroyTask(taskId);
      }
      break;
    }
    case STATE_ERROR_MSG:
      if (gMain.newKeys & (A_BUTTON | B_BUTTON)) {
        _printDesc(task.data[1], 0);
        task.data[0] = STATE_HANDLE_INPUT;
      } else if (gMain.newKeys & DPAD_UP) {
        if (--task.data[1] < 0) task.data[1] = OPTIONS_COUNT - 1;
        Menu_MoveCursor(-1);
        task.data[1] = Menu_GetCursorPos();
        _printDesc(task.data[1], 0);
        task.data[0] = STATE_HANDLE_INPUT;
      } else if (gMain.newKeys & DPAD_DOWN) {
        if (++task.data[1] >= OPTIONS_COUNT - 1) task.data[1] = 0;
        Menu_MoveCursor(1);
        task.data[1] = Menu_GetCursorPos();
        _printDesc(task.data[1], 0);
        task.data[0] = STATE_HANDLE_INPUT;
      }
      break;
  }
}

/** 1:1 `ShowPokemonStorageSystemPC` (pokemon_storage_system.c:1650) — point d'entrée du PC. */
export function ShowPokemonStorageSystemPC(): void {
  const rt = getRuntime(); if (!rt) return;
  const taskId = rt.CreateTask((t) => Task_PCMainMenu(t.taskId), 80);
  rt.gTasks[taskId].data[0] = 0;  // tState
  rt.gTasks[taskId].data[1] = 0;  // tSelectedOption
  LockPlayerFieldControls();
}

/** STUB phase 2 : l'écran des boîtes (EnterPokeStorage/CB2_EnterPokeStorage :1998) — à porter. */
function EnterPokeStorage(_boxOption: number): void {
  console.log('[PC] EnterPokeStorage (écran boîtes) — phase 2 non encore portée');
}

// Pont dev/déclencheur : ouvrir le menu PC (le script « PC POKéMON » l'appellera au câblage).
(globalThis as Record<string, unknown>).__ShowPokemonStorageSystemPC = ShowPokemonStorageSystemPC;

// Exposition dev (sonde déterministe), sans effet sur le jeu.
(globalThis as Record<string, unknown>).__CheckFreePokemonStorageSpace = CheckFreePokemonStorageSpace;
(globalThis as Record<string, unknown>).__AnyStorageMonWithMove = AnyStorageMonWithMove;
(globalThis as Record<string, unknown>).__CountStorageNonEggMons = CountStorageNonEggMons;
// __getPokemonStorage : accès au storage PC sans importer save.ts (cycle-break).
// Utilisé par la sonde déterministe ET par CopyMonToPC (party-storage.ts).
(globalThis as Record<string, unknown>).__getPokemonStorage = GetPokemonStorage;
