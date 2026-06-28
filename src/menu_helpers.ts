/**
 * menu_helpers.ts — miroir 1:1 de `decomp/src/menu_helpers.c` (sous-ensemble
 * autonome : logique de liste/curseur, input L/R + quantité, checks d'items).
 *
 * Sous-système PARTAGÉ (bag, PC, shop, party, list menus). Ce module est LA
 * maison 1:1 (↔ menu_helpers.c) ; les anciens fichiers engine re-exportent.
 *
 * Sémantique pointeur 1:1 : la décomp prend des `u16 *`/`s16 *` (mutés en place).
 * JS n'a pas de pointeur → objets `ListPos { scroll, cursor }` / `IntRef { value }`
 * mutés en place (= pattern déjà établi, cf. list-menu.ts pour `u16 *`).
 *
 * HORS-SCOPE (frontières, PAS de la dette) :
 *  - HW (regs VRAM/OAM/BG, sprites de swap-line, tasks YesNo, DisplayMessage…) =
 *    fourni par engine ; non porté ici.
 *  - link/union (link.c/union_room.c) = single-player FR post-camion → inactif
 *    (conditions toujours fausses). Maps Trade Center / Union Room injoignables.
 */
import { getRuntime, PlaySE } from '../harness/runtime/decomp-globals';
import { SE_SELECT } from './engine/decomp-data/_common-constants';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
// OPTIONS_BUTTON_MODE_LR = 1:1 `include/constants/global.h` (constante) — importée
// de sa source décomp-data, PAS de gba-menu-system (évite le cycle menu→menu_helpers
// →gba-menu-system→menu qui cassait l'init quand menu.ts est devenu foundational).
import { OPTIONS_BUTTON_MODE_LR } from '../include/constants/global';
import { ItemIsMail } from './mail_data';
// Yes/No à callbacks (menu_helpers.c:150-177). CreateYesNoMenu + Menu_ProcessInputNoWrapClearOnChoose
// vivent dans le miroir `menu.ts` (foundational). menu.ts importe `menu_helpers-data` (data),
// PAS ce fichier → pas de cycle. Usage runtime (dans les fns) → pas de TDZ.
import {
  CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose,
  DrawDialogFrameWithCustomTileAndPalette, AddTextPrinterParameterized2,
} from './menu';
import { MENU_B_PRESSED } from './engine/decomp-data/include/menu-data';
import { RunTextPrinters, IsTextPrinterActive } from './text';
import { StringExpandPlaceholders, gStringVar4 } from '../include/string_util';
import { gTextFlags, TEXT_COLOR } from './text';
import type { WindowTemplate } from './window';
import type { DecompTask } from '../harness/runtime/decomp-runtime';
// ─── Imports pour le sous-système swap line (menu_helpers.c:393-453) ──────────
import { assetCache, LoadCompressedSpriteSheet, LoadSpritePalette } from '../harness/runtime/decomp-globals';
import { DestroySprite, IndexOfSpritePaletteTag, GetSpriteTileStartByTag, setSpriteAnims } from './sprite';
import { loadTileBin, loadGbaPal } from '../harness/gba/png-loader';
import { MAX_SPRITES } from '../include/sprite';

// ─── Constantes 1:1 ──────────────────────────────────────────────────────────

/** 1:1 décomp `include/menu_helpers.h:7-8`. */
export const MENU_L_PRESSED = 1;
export const MENU_R_PRESSED = 2;

// 1:1 décomp `include/gba/io_reg.h:703-713` (bits de touches GBA). À consolider à
// terme dans `src/game/include/gba/io_reg.ts` (couche HW) ; locaux ici pour l'instant.
const DPAD_RIGHT = 0x0010;
const DPAD_LEFT = 0x0020;
const DPAD_UP = 0x0040;
const DPAD_DOWN = 0x0080;
const DPAD_ANY = DPAD_RIGHT | DPAD_LEFT | DPAD_UP | DPAD_DOWN;
const R_BUTTON = 0x0100;
const L_BUTTON = 0x0200;

/** 1:1 `#define ITEM_NONE 0` (constants/items.h). */
const ITEM_NONE = 0;

// ─── Input (1:1 JOY_NEW / JOY_REPEAT, global.h:134/137) ──────────────────────
// JOY_NEW(b)    = gMain.newKeys & b ; JOY_REPEAT(b) = gMain.newAndRepeatedKeys & b
// (TEST_BUTTON = `(field) & (button)`). Lecture du runtime (= gMain global décomp).

function _joyNew(): number {
  const rt = getRuntime();
  return rt ? (rt.gMain.newKeys | 0) : 0;
}
function _joyRepeat(): number {
  const rt = getRuntime();
  if (!rt) return 0;
  const m = rt.gMain as unknown as { newAndRepeatedKeys?: number; newKeys: number };
  return (m.newAndRepeatedKeys ?? m.newKeys) | 0;
}

// ─── Réfs mutables 1:1-sémantiques (pointeurs décomp) ────────────────────────

/** Réf de `(u16 *scrollOffset, u16 *cursorPos)`. */
export interface ListPos { scroll: number; cursor: number; }
/** Réf d'un `s16 *` (ex. `*quantity`). */
export interface IntRef { value: number; }

// ─── Quantité (1:1 menu_helpers.c:180) ───────────────────────────────────────

/** 1:1 décomp `AdjustQuantityAccordingToDPadInput(s16 *quantity, u16 max)`.
 *  UP +1 (wrap→1), DOWN −1 (wrap→max), RIGHT +10 (clamp max), LEFT −10 (clamp 1).
 *  PlaySE(SE_SELECT) + retourne TRUE si la valeur a changé. `quantity.value` muté. */
export function AdjustQuantityAccordingToDPadInput(quantity: IntRef, max: number): boolean {
  const valBefore = quantity.value;
  const dpad = _joyRepeat() & DPAD_ANY;

  if (dpad === DPAD_UP) {
    quantity.value++;
    if (quantity.value > max) quantity.value = 1;
  } else if (dpad === DPAD_DOWN) {
    quantity.value--;
    if (quantity.value <= 0) quantity.value = max;
  } else if (dpad === DPAD_RIGHT) {
    quantity.value += 10;
    if (quantity.value > max) quantity.value = max;
  } else if (dpad === DPAD_LEFT) {
    quantity.value -= 10;
    if (quantity.value <= 0) quantity.value = 1;
  } else {
    return false;
  }

  if (quantity.value === valBefore) return false;
  PlaySE(SE_SELECT);
  return true;
}

// ─── Touches L/R (1:1 menu_helpers.c:252/265) ────────────────────────────────

/** 1:1 décomp `GetLRKeysPressed(void)` : MENU_L/R_PRESSED si optionsButtonMode==LR. */
export function GetLRKeysPressed(): number {
  if ((gSaveBlock2Ptr.optionsButtonMode as number | undefined) === OPTIONS_BUTTON_MODE_LR) {
    const k = _joyNew();
    if (k & L_BUTTON) return MENU_L_PRESSED;
    if (k & R_BUTTON) return MENU_R_PRESSED;
  }
  return 0;
}

/** 1:1 décomp `GetLRKeysPressedAndHeld(void)` : idem mais JOY_REPEAT (hold). */
export function GetLRKeysPressedAndHeld(): number {
  if ((gSaveBlock2Ptr.optionsButtonMode as number | undefined) === OPTIONS_BUTTON_MODE_LR) {
    const k = _joyRepeat();
    if (k & L_BUTTON) return MENU_L_PRESSED;
    if (k & R_BUTTON) return MENU_R_PRESSED;
  }
  return 0;
}

// ─── Checks d'items (1:1 menu_helpers.c:278/290) ─────────────────────────────

/** 1:1 décomp `IsHoldingItemAllowed(u16 itemId)` : Enigma Berry interdite en zone
 *  link (Trade Center / Union Room). Single-player FR → ces conditions sont
 *  toujours FAUSSES (maps link injoignables + InUnionRoom()=false) → l'AND est
 *  faux quel que soit l'item → TRUE. */
export function IsHoldingItemAllowed(_itemId: number): boolean {
  return true;
}

/** 1:1 décomp `IsWritingMailAllowed(u16 itemId)` : interdit d'écrire du courrier en
 *  zone link. Single-player → link inactif → TRUE (ItemIsMail gardé pour la
 *  fidélité de la condition). */
export function IsWritingMailAllowed(itemId: number): boolean {
  // (IsOverworldLinkActive() || InUnionRoom()) == false en single-player.
  if (false && ItemIsMail(itemId)) return false;
  return true;
}

// ─── Link (1:1 menu_helpers.c:298/314) — single-player → inactif ─────────────

/** 1:1 décomp `MenuHelpers_IsLinkActive(void)`. Single-player FR → false
 *  (IsOverworldLinkActive() || gReceivedRemoteLinkPlayers==1 = false). */
export function MenuHelpers_IsLinkActive(): boolean {
  return false;
}

/** 1:1 décomp `MenuHelpers_ShouldWaitForLinkRecv(void)`. Single-player → false. */
export function MenuHelpers_ShouldWaitForLinkRecv(): boolean {
  return false;
}

// ─── Listes / curseur (1:1 menu_helpers.c:322/343/357) ───────────────────────

/** 1:1 décomp `SetItemListPerPageCount(struct ItemSlot *slots, u8 slotsCount,
 *  u8 *pageItems, u8 *totalItems, u8 maxPerPage)`. Compte les slots non vides
 *  (+1 pour « ANNULER ») et clamp à maxPerPage. Retourne `{ pageItems, totalItems }`
 *  (= les 2 out-params `u8 *`). */
export function SetItemListPerPageCount(
  slots: ReadonlyArray<{ itemId: number }>, slotsCount: number, maxPerPage: number,
): { pageItems: number; totalItems: number } {
  let totalItems = 0;
  for (let i = 0; i < slotsCount; i++) {
    if (slots[i] && slots[i].itemId !== ITEM_NONE) totalItems++;
  }
  totalItems++; // + 1 pour « ANNULER »
  const pageItems = totalItems > maxPerPage ? maxPerPage : totalItems;
  return { pageItems, totalItems };
}

/** 1:1 décomp `SetCursorWithinListBounds(u16 *scrollOffset, u16 *cursorPos,
 *  u8 maxShownItems, u8 totalItems)`. Clampe scroll+curseur dans [0, totalItems). */
export function SetCursorWithinListBounds(pos: ListPos, maxShownItems: number, totalItems: number): void {
  if (pos.scroll !== 0 && pos.scroll + maxShownItems > totalItems)
    pos.scroll = totalItems - maxShownItems;

  if (pos.scroll + pos.cursor >= totalItems) {
    if (totalItems === 0)
      pos.cursor = 0;
    else
      pos.cursor = totalItems - 1;
  }
}

/** 1:1 décomp `SetCursorScrollWithinListBounds(u16 *scrollOffset, u16 *cursorPos,
 *  u8 shownItems, u8 totalItems, u8 maxShownItems)`. Recentre le curseur ~milieu
 *  de la fenêtre visible (parité de maxShownItems = 2 branches strictement 1:1). */
export function SetCursorScrollWithinListBounds(
  pos: ListPos, shownItems: number, totalItems: number, maxShownItems: number,
): void {
  let i: number;
  if (maxShownItems % 2 !== 0) {
    // Is cursor at least halfway down visible list
    if (pos.cursor >= Math.floor(maxShownItems / 2)) {
      for (i = 0; i < pos.cursor - Math.floor(maxShownItems / 2); i++) {
        // Stop if reached end of list
        if (pos.scroll + shownItems === totalItems) break;
        pos.cursor--;
        pos.scroll++;
      }
    }
  } else {
    // Is cursor at least halfway down visible list
    if (pos.cursor >= Math.floor(maxShownItems / 2) + 1) {
      for (i = 0; i <= pos.cursor - Math.floor(maxShownItems / 2); i++) {
        // Stop if reached end of list
        if (pos.scroll + shownItems === totalItems) break;
        pos.cursor--;
        pos.scroll++;
      }
    }
  }
}

// ─── Yes/No à callbacks (1:1 menu_helpers.c:150-177) ─────────────────────────
// LA primitive partagée OUI/NON : ~10 écrans décomp l'appellent (shop, player_pc,
// item_menu, secret_base, decoration…). On donne une fenêtre + 2 callbacks → la task
// appelante est reroutée (témoin `gTasks[taskId].func`) vers Task_CallYesOrNoCallback,
// qui lit le choix et appelle yesFunc/noFunc (qui repointent le témoin vers la suite).
// Avant : non porté → chaque écran re-câblait un dispatch yes/no à la main.

/** 1:1 décomp `struct YesNoFuncTable` (menu.h) : `{ TaskFunc yesFunc; TaskFunc noFunc }`.
 *  Nos TaskFunc reçoivent l'OBJET task (convention runtime), pas le `u8 taskId`. */
export interface YesNoFuncTable {
  yesFunc: (task: DecompTask) => void;
  noFunc: (task: DecompTask) => void;
}

/** 1:1 décomp `static struct YesNoFuncTable sYesNo` (menu_helpers.c:25). */
let sYesNo: YesNoFuncTable = { yesFunc: () => { /* noop */ }, noFunc: () => { /* noop */ } };

/** 1:1 décomp `Task_CallYesOrNoCallback(taskId)` (menu_helpers.c:163) : lit le choix
 *  (0=OUI, 1/MENU_B_PRESSED=NON) et appelle le callback correspondant. */
function Task_CallYesOrNoCallback(task: DecompTask): void {
  switch (Menu_ProcessInputNoWrapClearOnChoose()) {
    case 0:
      PlaySE(SE_SELECT);
      sYesNo.yesFunc(task);
      break;
    case 1:
    case MENU_B_PRESSED:
      PlaySE(SE_SELECT);
      sYesNo.noFunc(task);
      break;
  }
}

/** 1:1 décomp `DoYesNoFuncWithChoice(taskId, data)` (menu_helpers.c:150) : pose les
 *  callbacks + reroute la task (la boîte OUI/NON est DÉJÀ affichée). */
export function DoYesNoFuncWithChoice(taskId: number, data: YesNoFuncTable): void {
  sYesNo = data;
  const rt = getRuntime();
  if (rt) rt.gTasks[taskId].func = Task_CallYesOrNoCallback;
}

/** 1:1 décomp `CreateYesNoMenuWithCallbacks(taskId, template, unused1, unused2, unused3,
 *  tileStart, palette, yesNo)` (menu_helpers.c:156) : crée la boîte OUI/NON + pose les
 *  callbacks + reroute la task vers Task_CallYesOrNoCallback. */
export function CreateYesNoMenuWithCallbacks(
  taskId: number, template: WindowTemplate, _unused1: number, _unused2: number,
  _unused3: number, tileStart: number, palette: number, yesNo: YesNoFuncTable,
): void {
  CreateYesNoMenu(template, tileStart, palette, 0);
  sYesNo = yesNo;
  const rt = getRuntime();
  if (rt) rt.gTasks[taskId].func = Task_CallYesOrNoCallback;
}

// ─── Message à continuation (1:1 menu_helpers.c:124-148) ─────────────────────
// LA primitive partagée « message animé + enchaîne une task quand le printer a fini ».
// Repointe le témoin `gTasks[taskId].func` vers Task_ContinueTaskAfterMessagePrints qui,
// chaque frame, tick le printer ; quand fini, appelle taskFunc (qui repointe le témoin
// vers la suite). Avant : chaque écran recodait ce wait-printer-then-continue à la main.

/** 1:1 décomp `static u8 sMessageWindowId` / `static TaskFunc sMessageNextTask`. */
let sMessageWindowId = 0;
let sMessageNextTask: (task: DecompTask) => void = () => { /* noop */ };

/** 1:1 décomp `RunTextPrintersRetIsActive(textPrinterId)` (menu_helpers.c:138). */
export function RunTextPrintersRetIsActive(textPrinterId: number): boolean {
  RunTextPrinters();
  return IsTextPrinterActive(textPrinterId);
}

/** 1:1 décomp `Task_ContinueTaskAfterMessagePrints(taskId)` (menu_helpers.c:144). */
function Task_ContinueTaskAfterMessagePrints(task: DecompTask): void {
  if (!RunTextPrintersRetIsActive(sMessageWindowId))
    sMessageNextTask(task);
}

/** 1:1 décomp `DisplayMessageAndContinueTask(taskId, windowId, tileNum, paletteNum,
 *  fontId, textSpeed, string, taskFunc)` (menu_helpers.c:124) : cadre dialogue + message
 *  ANIMÉ (canABSpeedUpPrint) + repointe le témoin vers Task_ContinueTaskAfterMessagePrints. */
export function DisplayMessageAndContinueTask(
  taskId: number, windowId: number, tileNum: number, paletteNum: number,
  fontId: number, textSpeed: number, str: string | Uint8Array,
  taskFunc: (task: DecompTask) => void,
): void {
  sMessageWindowId = windowId;
  DrawDialogFrameWithCustomTileAndPalette(windowId, true, tileNum, paletteNum);
  // 1:1 : `if (string != gStringVar4) StringExpandPlaceholders(gStringVar4, string)`.
  if (str !== gStringVar4) StringExpandPlaceholders(gStringVar4, str);
  gTextFlags.canABSpeedUpPrint = true;
  AddTextPrinterParameterized2(windowId, fontId, gStringVar4, textSpeed, null,
    TEXT_COLOR.DARK_GRAY, TEXT_COLOR.WHITE, TEXT_COLOR.LIGHT_GRAY);
  sMessageNextTask = taskFunc;
  const rt = getRuntime();
  if (rt) rt.gTasks[taskId].func = Task_ContinueTaskAfterMessagePrints;
}

// ═════════════════════════════════════════════════════════════════════════════
// Swap line sprites — 1:1 décomp `src/menu_helpers.c:393-453` (+ anims :47-69,
// TAG_SWAP_LINE :20). Barre grise horizontale avec flèche ▶ rouge à gauche,
// affichée pendant que le user re-ordonne des items (bag SELECT swap, PC item
// storage, Pokéblock). 8 sprites SIZE(16x16) côte à côte :
//  - sprite[0]   : anim 0 = ▶ rouge (sAnim_SwapLine_RightArrow, tile 0)
//  - sprite[1+]  : anim 1 = barre grise (sAnim_SwapLine_Line, tile 4)
// Assets : `graphics/interface/swap_line.png` 4bpp 0x100 octets (8 tiles).
// ═════════════════════════════════════════════════════════════════════════════

// 1:1 décomp menu_helpers.c:20 — TAG_SWAP_LINE 109.
const TAG_SWAP_LINE = 109;
// 1:1 décomp menu_helpers.h:10 — bit flag posable sur `count` pour décaler
// le dernier sprite (= côté liste avec marge droite).
export const SWAP_LINE_HAS_MARGIN = 1 << 7;

const SWAP_LINE_SPRITE_NONE = 0xFF;

// 1:1 décomp menu_helpers.c:47-69 — anims du swap line sprite.
const ANIM_TABLE_NAME = 'sAnims_SwapLine';
const ANIM_RIGHT_ARROW = 0; // sAnim_SwapLine_RightArrow : ANIMCMD_FRAME(0, 0)
const ANIM_LINE        = 1; // sAnim_SwapLine_Line       : ANIMCMD_FRAME(4, 0)
// ANIM_LEFT_ARROW (= 2, hFlip=TRUE) non utilisé par le bag — défini pour PC
// item storage qui utilise StartSpriteAnim(..., 2). Activable plus tard.

let _swapLineAnimsRegistered = false;
function _registerSwapLineAnimsIfNeeded(): void {
  if (_swapLineAnimsRegistered) return;
  const rt = getRuntime() as unknown as {
    registerExtraAnim: (n: string, def: { frames: ReadonlyArray<{ tileNum: number; duration: number }>; terminator: 'END' | 'JUMP'; jumpTo?: number }) => void;
    registerExtraAnimTable: (n: string, t: { anims: ReadonlyArray<string> }) => void;
  } | null;
  if (!rt) return;
  _swapLineAnimsRegistered = true;
  rt.registerExtraAnim('sAnim_SwapLine_RightArrow', {
    frames: [{ tileNum: 0, duration: 0 }],
    terminator: 'END',
  });
  rt.registerExtraAnim('sAnim_SwapLine_Line', {
    frames: [{ tileNum: 4, duration: 0 }],
    terminator: 'END',
  });
  rt.registerExtraAnimTable(ANIM_TABLE_NAME, {
    anims: ['sAnim_SwapLine_RightArrow', 'sAnim_SwapLine_Line'],
  });
}

/** Précharge les assets dans assetCache (= clés `__swapLineTiles` / Pal).
 *  À appeler une fois au setup d'une scène qui utilise le swap line. */
export async function preloadSwapLineAssets(): Promise<void> {
  if (assetCache.has('__swapLineTiles') && assetCache.has('__swapLinePal')) return;
  try {
    const [tiles, pal] = await Promise.all([
      loadTileBin('/decomp/em/interface/swap_line.4bpp.bin', 4),
      loadGbaPal('/decomp/em/interface/swap_line.gbapal'),
    ]);
    assetCache.set('__swapLineTiles', tiles);
    assetCache.set('__swapLinePal', pal);
  } catch (e) {
    console.warn('[swap-line] preload failed', e);
  }
}

/** 1:1 décomp `LoadListMenuSwapLineGfx` (menu_helpers.c:393).
 *  LoadCompressedSpriteSheet + LoadCompressedSpritePalette pour TAG_SWAP_LINE.
 *  À appeler une fois après preloadSwapLineAssets, avant CreateSwapLineSprites. */
export function LoadListMenuSwapLineGfx(): void {
  LoadCompressedSpriteSheet({ data: '__swapLineTiles', size: 0x100, tag: TAG_SWAP_LINE });
  LoadSpritePalette({ data: '__swapLinePal', tag: TAG_SWAP_LINE });
}

/** 1:1 décomp `CreateSwapLineSprites` (menu_helpers.c:399).
 *  Alloue N sprites SIZE(16x16) à positions (i*16, 0), avec anim 1 sauf le
 *  1er (anim 0 = ▶ rouge), tous invisibles à la création.
 *  `baseIdx` simule l'arithmétique pointer du décomp : `&spriteIds[baseIdx]`
 *  → écrit dans spriteIds[baseIdx + i] (= 1:1 sémantique slot dans gBagMenu
 *  .spriteIds[ITEMMENUSPRITE_SWAP_LINE..]). */
export function CreateSwapLineSprites(spriteIds: number[], baseIdx: number, count: number): void {
  _registerSwapLineAnimsIfNeeded();
  const rt = getRuntime() as unknown as {
    CreateSpriteAtOam: (c: Record<string, number>) => { spriteId: number };
    setSpriteInvisible: (id: number, invisible: boolean) => void;
  } | null;
  if (!rt) return;
  // 1:1 STRICT lookups via array primary (sprite.c:1542 + :1637).
  const tileStartRaw = GetSpriteTileStartByTag(TAG_SWAP_LINE);
  const tileStart = tileStartRaw === 0xFFFF ? 0 : tileStartRaw;
  const palBankRaw = IndexOfSpritePaletteTag(TAG_SWAP_LINE);
  const palBank = palBankRaw === 0xFF ? 0 : palBankRaw;
  for (let i = 0; i < count; i++) {
    const r = rt.CreateSpriteAtOam({
      tileId: tileStart, paletteBank: palBank,
      x: i * 16, y: 0, shape: 0, size: 1, priority: 0, subpriority: 0,
    });
    spriteIds[baseIdx + i] = r.spriteId;
    if (r.spriteId === MAX_SPRITES) continue;
    // 1:1 :406-407 — i != 0 → StartSpriteAnim(.., 1) = anim Line.
    // i == 0 → reste sur anim 0 (RightArrow = ▶).
    // CONVERGENCE 1:1 : sprite.anims (inline) au lieu de spriteAnimStates (legacy), modèle sheet.
    setSpriteAnims(getRuntime(), spriteIds[baseIdx + i], ANIM_TABLE_NAME, i === 0 ? ANIM_RIGHT_ARROW : ANIM_LINE, tileStart);
    if (i !== 0) getRuntime().StartSpriteAnim(spriteIds[baseIdx + i], ANIM_LINE);
    // 1:1 :409 — invisible à la création.
    rt.setSpriteInvisible(spriteIds[baseIdx + i], true);
  }
}

/** 1:1 décomp `DestroySwapLineSprites` (menu_helpers.c:413). */
export function DestroySwapLineSprites(spriteIds: number[], baseIdx: number, count: number): void {
  for (let i = 0; i < count; i++) {
    const id = spriteIds[baseIdx + i];
    if (id !== SWAP_LINE_SPRITE_NONE && id !== MAX_SPRITES) {
      DestroySprite(id);
      spriteIds[baseIdx + i] = SWAP_LINE_SPRITE_NONE;
    }
  }
}

/** 1:1 décomp `SetSwapLineSpritesInvisibility` (menu_helpers.c:426). */
export function SetSwapLineSpritesInvisibility(spriteIds: number[], baseIdx: number, count: number, invisible: boolean): void {
  const rt = getRuntime();
  if (!rt) return;
  const n = count & ~SWAP_LINE_HAS_MARGIN;
  for (let i = 0; i < n; i++) {
    const id = spriteIds[baseIdx + i];
    if (id !== SWAP_LINE_SPRITE_NONE && id !== MAX_SPRITES) {
      rt.setSpriteInvisible(id, invisible);
    }
  }
}

/** 1:1 décomp `UpdateSwapLineSpritesPos` (menu_helpers.c:434).
 *  `count` peut être OR avec SWAP_LINE_HAS_MARGIN (= 0x80) → le DERNIER sprite
 *  se positionne à `x - 8` au lieu de `x` (= reste dans la marge droite).
 *  sprite.x2 = additif, sprite.y = absolu (+1 px pour alignement pixel décomp). */
export function UpdateSwapLineSpritesPos(spriteIds: number[], baseIdx: number, count: number, x: number, y: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const hasMargin = (count & SWAP_LINE_HAS_MARGIN) !== 0;
  const n = count & ~SWAP_LINE_HAS_MARGIN;
  for (let i = 0; i < n; i++) {
    const spr = rt.gSprites[spriteIds[baseIdx + i]];
    if (!spr) continue;
    // 1:1 :446-449 — last sprite avec margin → x-8 ; sinon x.
    spr.x2 = (i === n - 1 && hasMargin) ? x - 8 : x;
    spr.y = 1 + y; // 1:1 :451.
  }
}
