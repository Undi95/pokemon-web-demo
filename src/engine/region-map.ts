/**
 * region-map.ts — Port de la worldmap HOENN (= 1:1 décomp field_region_map.c).
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/field_region_map.c` (= FieldInitRegionMap +
 *     MCB2_FieldUpdateRegionMap state machine 7 états)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/region_map.c` (= InitRegionMap +
 *     LoadRegionMapGfx + ProcessRegionMapInput_Full + MoveRegionMapCursor_Full)
 *
 * Pattern HTML overlay (≠ CB2 swap wallclock) : crée un DOM overlay au-dessus
 * du canvas Phaser. Permet de porter la carte rapidement avec PNG direct sans
 * passer par le BG affine GBA. Aspect visuel 1:1 (= même image src), aspect
 * code = different (= DOM vs VRAM tilemap), tradeoff pragmatique acceptable
 * pour la démo.
 *
 * Flow :
 *   1. `OpenRegionMap()` ajoute overlay div au DOM (= au-dessus du canvas)
 *   2. State machine ticks via TickRegionMap() (= D-pad cursor + A/B exit)
 *   3. `CloseRegionMap()` retire overlay, fade in, restore field
 *
 * Constants 1:1 décomp region_map.c:41-46 :
 *   MAP_WIDTH = 28, MAP_HEIGHT = 15
 *   MAPCURSOR_X_MIN = 1, MAPCURSOR_X_MAX = 28 (= 1 + 28 - 1)
 *   MAPCURSOR_Y_MIN = 2, MAPCURSOR_Y_MAX = 16 (= 2 + 15 - 1)
 *
 * Cursor (= 16×16 sprite) positionné en pixels = (cursorPosX * 8, cursorPosY * 8).
 */

import { SignalWaitState } from './script-opcodes';
import { gameState } from './game-state';
import { gMapHeader } from './map-loader';
import { getMapNameFr } from '../data/map-names-fr';
import { getString } from './gba-strings';

// ─── Constants 1:1 décomp region_map.c ──────────────────────────────────────

const MAP_WIDTH = 28;
const MAP_HEIGHT = 15;
const MAPCURSOR_X_MIN = 1;
const MAPCURSOR_Y_MIN = 2;
const MAPCURSOR_X_MAX = MAPCURSOR_X_MIN + MAP_WIDTH - 1;
const MAPCURSOR_Y_MAX = MAPCURSOR_Y_MIN + MAP_HEIGHT - 1;

// Player → mapsec mapping (= 1:1 décomp `gRegionMapEntries` + `sMapSecIdAt`).
// Pour la démo : mapping mapId courant → mapsec name via map-names-fr.ts.

// ─── State ─────────────────────────────────────────────────────────────────

let sIsOpen = false;
let sCursorX = MAPCURSOR_X_MIN;
let sCursorY = MAPCURSOR_Y_MIN;
let sCurrentMapsecName = '';
let sOverlayRoot: HTMLDivElement | null = null;
let sCursorEl: HTMLDivElement | null = null;
let sMapsecNameEl: HTMLDivElement | null = null;
let sCursorMovementFrameCounter = 0;

// ─── API publique ──────────────────────────────────────────────────────────

export function IsRegionMapOpen(): boolean {
  return sIsOpen;
}

/** 1:1 décomp `FieldInitRegionMap(callback)` (field_region_map.c:92-99) :
 *    SetMainCallback2(MCB2_InitRegionMapRegisters);
 *  Setup carte HOENN. Init cursor au mapsec actuel du player. */
export function OpenRegionMap(): void {
  if (sIsOpen) return;
  sIsOpen = true;
  // 1:1 décomp `InitMapBasedOnPlayerLocation` : cursor au mapsec du player.
  // Pour démo : centre HOENN (= 15, 9 ~= Bourg-en-Vol area).
  sCursorX = 15;
  sCursorY = 9;
  sCurrentMapsecName = _getCurrentMapsecName();
  _spawnOverlay();
}

export function CloseRegionMap(): void {
  if (!sIsOpen) return;
  sIsOpen = false;
  _destroyOverlay();
  // 1:1 décomp `SetMainCallback2(callback)` (= retour field). Notre version :
  // SignalWaitState pour unblock le script `special FieldShowRegionMap`.
  SignalWaitState();
}

/** Tick called per-frame depuis MainCB2_Overworld (= overlay actif). */
export function TickRegionMap(): void {
  if (!sIsOpen) return;
  // 1:1 décomp `ProcessRegionMapInput_Full` (region_map.c:648-689) :
  //   if (JOY_HELD(DPAD_UP) && cursorPosY > MIN) cursorDeltaY = -1
  //   if (JOY_HELD(DPAD_DOWN) && cursorPosY < MAX) cursorDeltaY = +1
  //   if (JOY_HELD(DPAD_LEFT) && cursorPosX > MIN) cursorDeltaX = -1
  //   if (JOY_HELD(DPAD_RIGHT) && cursorPosX < MAX) cursorDeltaX = +1
  //   if (JOY_NEW(A) || JOY_NEW(B)) exit
  //   cursorMovementFrameCounter = 4 si move pour throttle (1 tile = 4 frames)

  // Le tick est driven by main loop. JOY_HELD vient de gMain.heldKeys.
  // newKeys pour A/B.
  const heldKeys = _getHeldKeys();
  const newKeys = _getNewKeys();

  // A/B = exit. 1:1 décomp lines 180-184 FieldUpdateRegionMap state 4.
  if (newKeys & 0x01) {  // A_BUTTON
    CloseRegionMap();
    return;
  }
  if (newKeys & 0x02) {  // B_BUTTON
    CloseRegionMap();
    return;
  }

  // Cursor move throttling (= 1:1 décomp cursorMovementFrameCounter = 4).
  if (sCursorMovementFrameCounter > 0) {
    sCursorMovementFrameCounter--;
    return;
  }

  let movedX = 0;
  let movedY = 0;
  if ((heldKeys & 0x40) && sCursorY > MAPCURSOR_Y_MIN) movedY = -1;  // UP
  if ((heldKeys & 0x80) && sCursorY < MAPCURSOR_Y_MAX) movedY = +1;  // DOWN
  if ((heldKeys & 0x20) && sCursorX > MAPCURSOR_X_MIN) movedX = -1;  // LEFT
  if ((heldKeys & 0x10) && sCursorX < MAPCURSOR_X_MAX) movedX = +1;  // RIGHT

  if (movedX !== 0 || movedY !== 0) {
    sCursorX += movedX;
    sCursorY += movedY;
    sCursorMovementFrameCounter = 4;  // 1:1 décomp throttle.
    _updateCursorPosition();
    // 1:1 décomp `MoveRegionMapCursor_Full` (region_map.c:715-721) : récupère
    // mapSecId à la nouvelle position cursor + update display.
    // Pour la démo, on n'a pas la table sMapSecIdAt complète, donc on garde
    // le mapsec name du player (= centre HOENN).
    _updateMapsecNameDisplay();
  }
}

// ─── Internal helpers ──────────────────────────────────────────────────────

function _getCurrentMapsecName(): string {
  const mapId = gMapHeader?.id ?? '';
  // 1:1 décomp `GetMapName(buffer, mapSecId, MAP_NAME_LENGTH)` : lookup
  // `gRegionMapEntries[mapSecId].name`. Notre version : utilise mapId →
  // regionMapSectionId mapping via map-names-fr.ts.
  const secId = gMapHeader?.regionMapSectionId ?? mapId;
  return getMapNameFr(secId) || getMapNameFr(mapId) || 'HOENN';
}

function _spawnOverlay(): void {
  if (sOverlayRoot) return;
  // Find Phaser canvas to position overlay above it.
  const canvas = document.querySelector('canvas');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();

  // Root overlay div positioned over canvas.
  sOverlayRoot = document.createElement('div');
  sOverlayRoot.style.position = 'fixed';
  sOverlayRoot.style.left = `${rect.left}px`;
  sOverlayRoot.style.top = `${rect.top}px`;
  sOverlayRoot.style.width = `${rect.width}px`;
  sOverlayRoot.style.height = `${rect.height}px`;
  sOverlayRoot.style.zIndex = '1000';
  sOverlayRoot.style.background = '#000';
  sOverlayRoot.style.pointerEvents = 'none';  // input via globalThis.gMain.
  sOverlayRoot.style.imageRendering = 'pixelated';

  // Background image = map.png (= 256x160 src image, scaled à canvas size).
  const bgImg = document.createElement('img');
  bgImg.src = '/decomp/em/region_map/map.png';
  bgImg.style.position = 'absolute';
  bgImg.style.left = '0';
  bgImg.style.top = '0';
  bgImg.style.width = '100%';
  bgImg.style.height = '100%';
  bgImg.style.objectFit = 'fill';
  bgImg.style.imageRendering = 'pixelated';
  sOverlayRoot.appendChild(bgImg);

  // Cursor (= cursor_small.png 16×16).
  const cursorImg = document.createElement('img');
  cursorImg.src = '/decomp/em/region_map/cursor_small.png';
  sCursorEl = document.createElement('div');
  sCursorEl.appendChild(cursorImg);
  cursorImg.style.width = '100%';
  cursorImg.style.height = '100%';
  cursorImg.style.imageRendering = 'pixelated';
  sCursorEl.style.position = 'absolute';
  sCursorEl.style.width = `${(16 / 240) * 100}%`;  // 16 px / 240 px screen.
  sCursorEl.style.height = `${(16 / 160) * 100}%`;
  sCursorEl.style.imageRendering = 'pixelated';
  sOverlayRoot.appendChild(sCursorEl);
  _updateCursorPosition();

  // Player icon (= brendan_icon.png ou may_icon.png selon gender).
  const playerIcon = document.createElement('img');
  playerIcon.src = gameState.gender === 'MALE'
    ? '/decomp/em/region_map/brendan_icon.png'
    : '/decomp/em/region_map/may_icon.png';
  playerIcon.style.position = 'absolute';
  playerIcon.style.width = `${(16 / 240) * 100}%`;
  playerIcon.style.height = `${(16 / 160) * 100}%`;
  // Player icon at center HOENN by default (= 1:1 InitMapBasedOnPlayerLocation
  // would compute exact pixel based on player current mapsec).
  playerIcon.style.left = `${(15 * 8 / 240) * 100}%`;
  playerIcon.style.top = `${(9 * 8 / 160) * 100}%`;
  playerIcon.style.imageRendering = 'pixelated';
  sOverlayRoot.appendChild(playerIcon);

  // Title window "HOENN" (= 1:1 décomp WIN_TITLE bg=0 top-right corner).
  const titleWin = document.createElement('div');
  titleWin.style.position = 'absolute';
  titleWin.style.right = '8px';
  titleWin.style.top = '8px';
  titleWin.style.padding = '4px 12px';
  titleWin.style.background = 'rgba(255, 255, 255, 0.95)';
  titleWin.style.border = '2px solid #333';
  titleWin.style.borderRadius = '4px';
  titleWin.style.fontFamily = 'monospace';
  titleWin.style.fontSize = '14px';
  titleWin.style.color = '#000';
  titleWin.textContent = getString('gText_Hoenn') || 'HOENN';
  sOverlayRoot.appendChild(titleWin);

  // Mapsec name window (= 1:1 décomp WIN_MAPSEC_NAME bottom-right).
  sMapsecNameEl = document.createElement('div');
  sMapsecNameEl.style.position = 'absolute';
  sMapsecNameEl.style.right = '8px';
  sMapsecNameEl.style.bottom = '8px';
  sMapsecNameEl.style.padding = '4px 12px';
  sMapsecNameEl.style.background = 'rgba(255, 255, 255, 0.95)';
  sMapsecNameEl.style.border = '2px solid #333';
  sMapsecNameEl.style.borderRadius = '4px';
  sMapsecNameEl.style.fontFamily = 'monospace';
  sMapsecNameEl.style.fontSize = '14px';
  sMapsecNameEl.style.color = '#000';
  sMapsecNameEl.textContent = sCurrentMapsecName;
  sOverlayRoot.appendChild(sMapsecNameEl);

  document.body.appendChild(sOverlayRoot);
}

function _destroyOverlay(): void {
  if (sOverlayRoot && sOverlayRoot.parentNode) {
    sOverlayRoot.parentNode.removeChild(sOverlayRoot);
  }
  sOverlayRoot = null;
  sCursorEl = null;
  sMapsecNameEl = null;
}

function _updateCursorPosition(): void {
  if (!sCursorEl) return;
  // 1:1 décomp cursor position = (cursorPosX * 8, cursorPosY * 8) pixels.
  // Le canvas est 240×160 logically, scaled à la window size.
  const xPct = (sCursorX * 8 / 240) * 100;
  const yPct = (sCursorY * 8 / 160) * 100;
  sCursorEl.style.left = `${xPct}%`;
  sCursorEl.style.top = `${yPct}%`;
}

function _updateMapsecNameDisplay(): void {
  if (!sMapsecNameEl) return;
  // 1:1 décomp `MoveRegionMapCursor_Full` : lookup mapsecName via GetMapSecIdAt
  // + GetMapName. Pour démo : montre nom approximatif basé sur position cursor.
  sMapsecNameEl.textContent = _getMapsecNameAtCursor();
}

function _getMapsecNameAtCursor(): string {
  // Mapping approximatif cursor pos → mapsec name pour démo. 1:1 décomp
  // utiliserait sMapSecIdAt table 30×16. Pour l'instant : centre = current
  // mapsec, sinon générique.
  if (Math.abs(sCursorX - 15) < 2 && Math.abs(sCursorY - 9) < 2) {
    return sCurrentMapsecName;
  }
  // Sections HOENN approximatives (= 1:1 mapping incomplet).
  if (sCursorX < 10 && sCursorY > 12) return 'ROSYERES';      // SW
  if (sCursorX < 10) return 'BOURG-EN-VOL';                    // W
  if (sCursorX > 20 && sCursorY < 5) return 'ATALANOPOLIS';   // NE
  if (sCursorX > 20) return 'ALGATIA';                         // E
  if (sCursorY < 5) return 'POIVRESSEL';                       // N
  if (sCursorY > 12) return 'NÉNUCRIQUE';                      // S
  return sCurrentMapsecName;
}

function _getHeldKeys(): number {
  const rt = (globalThis as { gMain?: { heldKeys?: number } }).gMain;
  return rt?.heldKeys ?? 0;
}

function _getNewKeys(): number {
  const rt = (globalThis as { gMain?: { newKeys?: number } }).gMain;
  return rt?.newKeys ?? 0;
}
