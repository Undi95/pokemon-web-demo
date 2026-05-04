/**
 * gba-menu-system.ts
 * ------------------
 * Helpers menu GENERIQUES + persistence saveBlock. Tout ce qui est
 * spécifique main_menu.c vit dans `main-menu-impl.ts` (= split Phase C
 * audit session 83 pour respecter directive #1 "foundations unifiées").
 *
 * Architecture :
 *   - Constantes input keys (A_BUTTON, B_BUTTON, DPAD_*) — partagées
 *   - Menu cursor input générique (Menu_ProcessInputNoWrapClearOnChoose,
 *     Menu_GetCursorPos, InitMenuInUpperLeftCornerNormal)
 *   - Yes/No menu stubs (CreateYesNoMenuParameterized, CreateYesNoMenu)
 *   - Misc generic stubs (IsWirelessAdapterConnected, IsMysteryGiftEnabled,
 *     CanResetRTC, RtcGetErrorStatus, PlayBGM bridge)
 *   - gSaveBlock1Ptr / gSaveBlock2Ptr Proxy auto-persistant localStorage
 *   - gSaveFileStatus mutable global
 */
import { getRuntime } from './decomp-globals';

// ─── Menu cursor state ───────────────────────────────────────────────────────

let menuCursorPos = 0;
let menuNumItems = 0;
let menuActive = false;
let menuWindowId = 0;
void menuWindowId;  // reserved for future use (= window ref).

// ─── Input keys (= shared with main-menu-impl.ts) ────────────────────────────

export const A_BUTTON = 0x01;
export const B_BUTTON = 0x02;
export const DPAD_UP = 0x40;
export const DPAD_DOWN = 0x80;

// ─── Menu_ProcessInputNoWrapClearOnChoose + helpers ──────────────────────────

export function Menu_ProcessInputNoWrapClearOnChoose(): number {
  if (!menuActive) return -1;
  const newKeys = getRuntime()?.gMain.newKeys ?? 0;

  if (newKeys & A_BUTTON) {
    menuActive = false;
    return menuCursorPos;
  }
  if (newKeys & B_BUTTON) {
    menuActive = false;
    return -1; // MENU_B_PRESSED
  }
  if (newKeys & DPAD_UP) {
    if (menuCursorPos > 0) menuCursorPos--;
  }
  if (newKeys & DPAD_DOWN) {
    if (menuCursorPos < menuNumItems - 1) menuCursorPos++;
  }
  return -2; // still processing
}

export function Menu_GetCursorPos(): number {
  return menuCursorPos;
}

export function InitMenuInUpperLeftCornerNormal(windowId: number, numItems: number, cursorPos: number): void {
  menuWindowId = windowId;
  menuNumItems = numItems;
  menuCursorPos = cursorPos;
  menuActive = true;
}

// ─── Yes/No Menu stubs ───────────────────────────────────────────────────────
//
// Phase D audit session 83 : stubs en attendant l'implémentation du vrai
// Yes/No menu (= 1:1 décomp src/menu.c CreateYesNoMenu*). À implémenter pour
// le flow Birch speech (= confirmation du nom joueur).

export function CreateYesNoMenuParameterized(
  _windowId: number,
  _fontId: number,
  _frameTile: number,
  _cursorTile: number,
  _x: number,
  _y: number,
): void {
  // TODO Phase D : implementer le vrai Yes/No menu.
  menuNumItems = 2;
  menuCursorPos = 0;
  menuActive = true;
}

export function CreateYesNoMenu(
  _x: number,
  _y: number,
  _windowId: number,
): void {
  // TODO Phase D : implementer le vrai Yes/No menu.
  menuNumItems = 2;
  menuCursorPos = 0;
  menuActive = true;
}

// ─── Misc generic stubs ──────────────────────────────────────────────────────

/** 1:1 décomp src/link.c IsWirelessAdapterConnected. Notre engine web : pas
 *  de wireless adapter (= toujours false). Utilisé par main_menu.c pour les
 *  Mystery Gift / Mystery Events checks. */
export function IsWirelessAdapterConnected(): boolean {
  return false;
}

export function IsMysteryGiftEnabled(): boolean {
  return false;
}

export function CanResetRTC(): boolean {
  return false;
}

export function RtcGetErrorStatus(): number {
  return 0;
}

export function PlayBGM(_songNum: number): void {
  // TODO : bridge vers m4aSongNumStart (= système audio session 80 spessasynth).
}

// ─── Save block + persistence (= localStorage proxy) ─────────────────────────
//
// 1:1 décomp : gSaveBlock2Ptr est un struct EWRAM qui contient les options
// joueur (textSpeed, sound, frame style…) + identité player (gender, name).
// Décomp persiste via flash mem sur GBA. Notre engine : localStorage.
//
// Mécanique : `_saveBlock2Storage` est l'objet runtime. `gSaveBlock2Ptr` est
// un Proxy qui auto-persist toute écriture vers localStorage. Charge depuis
// localStorage au boot (= options préservées au refresh).

const SAVEBLOCK2_LSKEY = 'pokemon-web-demo:saveBlock2';

const _saveBlock2Defaults: Record<string, unknown> = {
  playerGender: 0,
  playerName: 'PLAYER',
  // Options (= 1:1 décomp save_data.c init values)
  optionsTextSpeed: 1,        // OPTIONS_TEXT_SPEED_MID
  optionsBattleSceneOff: 0,   // OPTIONS_BATTLE_SCENE_ON
  optionsBattleStyle: 0,      // OPTIONS_BATTLE_STYLE_SHIFT
  optionsSound: 0,            // OPTIONS_SOUND_MONO
  optionsButtonMode: 0,       // OPTIONS_BUTTON_MODE_NORMAL
  optionsWindowFrameType: 0,  // frame 1 (= classic blue rounded)
};

/** Charge depuis localStorage si dispo, sinon defaults. */
function _loadSaveBlock2(): Record<string, unknown> {
  const obj = { ..._saveBlock2Defaults };
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(SAVEBLOCK2_LSKEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      Object.assign(obj, parsed);
    }
  } catch (e) {
    console.warn('[gSaveBlock2Ptr] failed to load from localStorage:', e);
  }
  return obj;
}

const _saveBlock2Storage: Record<string, unknown> = _loadSaveBlock2();

/** Persist le storage actuel vers localStorage. */
function _persistSaveBlock2(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SAVEBLOCK2_LSKEY, JSON.stringify(_saveBlock2Storage));
    }
  } catch (e) {
    console.warn('[gSaveBlock2Ptr] failed to persist to localStorage:', e);
  }
}

export const gSaveBlock1Ptr = {} as any;

/** 1:1 décomp `gSaveBlock2Ptr` — Proxy auto-persistent vers localStorage.
 *  Toute écriture (e.g. `gSaveBlock2Ptr.optionsTextSpeed = 2` dans
 *  Task_OptionMenuSave) écrit immédiatement dans localStorage → préserve les
 *  options au refresh. */
export const gSaveBlock2Ptr: any = new Proxy(_saveBlock2Storage, {
  get(target, prop: string | symbol) {
    return target[prop as string];
  },
  set(target, prop: string | symbol, value: unknown) {
    target[prop as string] = value;
    _persistSaveBlock2();
    return true;
  },
});

export let gSaveFileStatus = 0; // SAVE_STATUS_EMPTY

export function SetSaveFileStatus(status: number): void {
  gSaveFileStatus = status;
}

// Synchronise gSaveFileStatus mutable export sur globalThis pour les
// callbacks auto-générés (= eval scope @ts-nocheck).
if (!('gSaveFileStatus' in globalThis)) {
  Object.defineProperty(globalThis, 'gSaveFileStatus', {
    get: () => gSaveFileStatus,
    set: (v) => { gSaveFileStatus = v as number; },
    enumerable: true,
    configurable: true,
  });
}
