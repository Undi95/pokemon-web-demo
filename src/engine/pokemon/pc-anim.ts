/**
 * pc-anim.ts — Port 1:1 décomp `DoPCTurnOnEffect` / `DoPCTurnOffEffect`
 *              (field_specials.c:986-1111).
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/field_specials.c:986-1111`
 *
 * DoPCTurnOnEffect spawn une task qui flicker le metatile PC 5 fois (ON→OFF
 * alternance, finit sur ON). Notre port utilise une mini state machine
 * ticked depuis TestOverworldScene main loop. TickPCAnim() = 1 frame.
 *
 * Le metatile à modifier dépend de :
 *   - `gSpecialVar_0x8004` (= PC_LOCATION_OTHER/BRENDANS_HOUSE/MAYS_HOUSE)
 *   - Direction face du player (NORTH/WEST/EAST) → offset (dx, dy)
 *
 * PC est TOUJOURS dy = -1 (= au-dessus du player). dx = 0 si NORTH,
 * -1 si WEST, +1 si EAST.
 */

import { MapGridSetMetatileIdAt, MAP_OFFSET, gMapHeader } from '../map-loader';
import { GetPlayerFacingDirection } from '../player-avatar';
import { gSaveBlock1Ptr } from '../save/save-block-state';
import { VarGet } from '../script/script-vars';
import { DrawWholeMapView } from '../field/field-camera';
import {
  METATILE_Building_PC_On, METATILE_Building_PC_Off,
  METATILE_BrendansMaysHouse_BrendanPC_On, METATILE_BrendansMaysHouse_BrendanPC_Off,
  METATILE_BrendansMaysHouse_MayPC_On, METATILE_BrendansMaysHouse_MayPC_Off,
} from '../decomp-data/include/constants/metatile_labels-data';
import {
  PC_LOCATION_OTHER, PC_LOCATION_BRENDANS_HOUSE, PC_LOCATION_MAYS_HOUSE,
} from '../decomp-data/include/constants/field_specials-data';
import { DIR_NORTH, DIR_WEST, DIR_EAST } from '../direction-coords';

/** 1:1 décomp `include/fieldmap.h:24` :
 *    #define MAPGRID_IMPASSABLE 0x800
 *  Set le bit `impassable` sur le tile (= collision activé). */
const MAPGRID_IMPASSABLE = 0x800;

interface PCAnimState {
  active: boolean;
  flickerCount: number;
  timer: number;
  isScreenOn: boolean;
}

const _state: PCAnimState = {
  active: false,
  flickerCount: 0,
  timer: 0,
  isScreenOn: false,
};

/** 1:1 décomp `DoPCTurnOnEffect` (field_specials.c:986-997). */
export function StartPCTurnOnEffect(): void {
  if (_state.active) return;  // 1:1 FuncIsActiveTask check (already running)
  _state.active = true;
  _state.flickerCount = 0;
  _state.timer = 0;
  _state.isScreenOn = false;
}

export function IsPCAnimRunning(): boolean {
  return _state.active;
}

/** 1:1 décomp `Task_PCTurnOnEffect` (field_specials.c:999-1004) + `PCTurnOnEffect`
 *  (1006-1044). Ticked chaque frame. Toggle metatile every 6 frames pendant 5
 *  flickers, finit sur ON. */
export function TickPCAnim(): void {
  if (!_state.active) return;
  if (_state.timer === 6) {
    _state.timer = 0;

    const dxdy = _computeDxDy();
    if (!dxdy) {
      // Direction non-supportée (= player faces SOUTH?). Skip frame.
      return;
    }
    const { dx, dy } = dxdy;
    _setPCMetatile(_state.isScreenOn, dx, dy);
    // 1:1 décomp `DrawWholeMapView()` (field_specials.c:1035) — re-render le BG
    // overworld après la modif metatile. Signature 1:1 = no args (lit
    // gSaveBlock1Ptr->pos.x/y + gMapHeader.mapLayout internally). Avant on
    // passait `gPlayerAvatar.x/y` → décalage 1 case visuel quand player ≠
    // camera focus (user-flag "Utiliser le PC nous bouge temporairement d'une
    // case a droite" 2026-05-21).
    DrawWholeMapView();

    _state.isScreenOn = !_state.isScreenOn;
    _state.flickerCount++;
    if (_state.flickerCount === 5) {
      _state.active = false;
    }
  }
  _state.timer++;
}

/** 1:1 décomp `DoPCTurnOffEffect` (field_specials.c:1073-1111). Pas de flicker.
 *  Refresh BG via DrawWholeMapView (= 1:1 décomp DrawWholeMapView() post setMetatile). */
export function DoPCTurnOffEffect(): void {
  const dxdy = _computeDxDy();
  if (!dxdy) return;
  const { dx, dy } = dxdy;
  _setPCMetatileToOff(dx, dy);
  DrawWholeMapView();
}

// ─── Internal helpers ──────────────────────────────────────────────────────

/** 1:1 décomp `PCTurnOnEffect` (lines 1015-1031) : compute dx/dy depuis player dir. */
function _computeDxDy(): { dx: number; dy: number } | null {
  const facing = GetPlayerFacingDirection();
  if (facing === DIR_NORTH) return { dx: 0, dy: -1 };
  if (facing === DIR_WEST)  return { dx: -1, dy: -1 };
  if (facing === DIR_EAST)  return { dx: 1, dy: -1 };
  // DIR_SOUTH ou autres : décomp pas de case → dx=0, dy=0 (= modifie le tile player).
  // 1:1 décomp : dx=0 dy=0 par défaut (= initial values du switch sans match).
  return { dx: 0, dy: 0 };
}

function _setPCMetatile(isScreenOn: boolean, dx: number, dy: number): void {
  // 1:1 décomp `PCTurnOnEffect_SetMetatile` (lines 1046-1070).
  const pcLocation = _getCurrentPCLocation();
  let metatileId = 0;
  if (isScreenOn) {
    // Currently ON, set to OFF
    if (pcLocation === PC_LOCATION_OTHER)            metatileId = METATILE_Building_PC_Off;
    else if (pcLocation === PC_LOCATION_BRENDANS_HOUSE) metatileId = METATILE_BrendansMaysHouse_BrendanPC_Off;
    else if (pcLocation === PC_LOCATION_MAYS_HOUSE)  metatileId = METATILE_BrendansMaysHouse_MayPC_Off;
  } else {
    // Currently OFF, set to ON
    if (pcLocation === PC_LOCATION_OTHER)            metatileId = METATILE_Building_PC_On;
    else if (pcLocation === PC_LOCATION_BRENDANS_HOUSE) metatileId = METATILE_BrendansMaysHouse_BrendanPC_On;
    else if (pcLocation === PC_LOCATION_MAYS_HOUSE)  metatileId = METATILE_BrendansMaysHouse_MayPC_On;
  }
  // 1:1 décomp : x + dx + MAP_OFFSET, y + dy + MAP_OFFSET.
  MapGridSetMetatileIdAt(
    gSaveBlock1Ptr.pos.x + dx + MAP_OFFSET,
    gSaveBlock1Ptr.pos.y + dy + MAP_OFFSET,
    metatileId | MAPGRID_IMPASSABLE,
  );
}

function _setPCMetatileToOff(dx: number, dy: number): void {
  const pcLocation = _getCurrentPCLocation();
  let metatileId = 0;
  if (pcLocation === PC_LOCATION_OTHER)            metatileId = METATILE_Building_PC_Off;
  else if (pcLocation === PC_LOCATION_BRENDANS_HOUSE) metatileId = METATILE_BrendansMaysHouse_BrendanPC_Off;
  else if (pcLocation === PC_LOCATION_MAYS_HOUSE)  metatileId = METATILE_BrendansMaysHouse_MayPC_Off;
  MapGridSetMetatileIdAt(
    gSaveBlock1Ptr.pos.x + dx + MAP_OFFSET,
    gSaveBlock1Ptr.pos.y + dy + MAP_OFFSET,
    metatileId | MAPGRID_IMPASSABLE,
  );
}

/** Read VAR_0x8004 = PC_LOCATION_*. Le décomp lit gSpecialVar_0x8004 que le
 *  script setvar avant le special. Pour PlayerPC (= 0 / OTHER) le script setvar
 *  pas (= default 0). */
function _getCurrentPCLocation(): number {
  // Le script setvar VAR_0x8004 just before special DoPCTurnOnEffect.
  // Lecture via gameState.getVar.
  const v = VarGet('VAR_0x8004');
  // Fallback : si non-set explicitly, regarde la mapId pour deviner.
  if (v === 0) {
    const mapId = gMapHeader?.id ?? '';
    if (mapId === 'MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F') return PC_LOCATION_BRENDANS_HOUSE;
    if (mapId === 'MAP_LITTLEROOT_TOWN_MAYS_HOUSE_2F') return PC_LOCATION_MAYS_HOUSE;
  }
  return v;
}
