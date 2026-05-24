/**
 * script-opcodes-warp.ts — opcodes warp 1:1 décomp `overworld.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c` :
 *   `ScrCmd_warp`            (l. 739-751)   : SetWarpDestination + DoWarp.
 *   `ScrCmd_warpsilent`      (l. 753-765)   : SetWarpDestination + DoTeleportWarp.
 *   `ScrCmd_warpdoor`        (l. 767-779)   : SetWarpDestination + DoDoorWarp.
 *   `ScrCmd_warphole`        (l. 781-797)   : SetWarpDest + DoFallWarp.
 *   `ScrCmd_warpteleport`    (l. 799-811)   : SetWarpDestination + DoTeleportTileWarp.
 *   `ScrCmd_warpmossdeepgym` (l. 813-825)   : SetWarpDestination + DoMossdeepGymWarp.
 *   `ScrCmd_setwarp`         (l. 827-837)   : SetWarpDestination.
 *   `ScrCmd_setdynamicwarp`  (l. 839-849)   : SetDynamicWarp.
 *   `ScrCmd_setdivewarp`     (l. 851-861)   : SetFixedDiveWarp.
 *   `ScrCmd_setholewarp`     (l. 863-873)   : SetFixedHoleWarp.
 *   `ScrCmd_setescapewarp`   (l. 875-885)   : SetEscapeWarp.
 *   `ScrCmd_setrespawn`      (l. 2005-2011) : SetLastHealLocationWarp.
 *   `ScrCmd_warpspinenter`   (l. 2241-2254) : SetWarpDest + DoSpinEnterWarp.
 *   `ScrCmd_warpwhitefade`   (l. 2295)      : SetWarpDestination + DoWhiteFadeWarp.
 */

import type { ScriptContext } from './script-runtime';
import { registerOpcode, getOpcodeHandler } from './script-runtime';
import { VarSet } from './script-vars';
import { setPendingWarp, SetDynamicWarp } from './warp-system';
import { gSaveBlock1Ptr } from './save-block-state';
import { parseValue } from './script-opcodes-helpers';

/**
 * Parse les args de warpsilent/warp selon la macro `formatwarp` (asm/macros/event.inc:425).
 *
 * 4 formes possibles (= nombre d'args APRÈS le map name) :
 *   - 0 arg     : warpId=NONE, x=-1, y=-1 (= use coords par default ?)
 *   - 1 arg     : warpId=arg, x=-1, y=-1 (= warpId-based warp standard)
 *   - 2 args    : warpId=NONE, x=arg0, y=arg1 (= coords-based warp explicit)
 *   - 3 args    : warpId=arg0, x=arg1, y=arg2 (= rare, warp sort out)
 *
 * NB : args[0] est destMap. Donc args.length-1 = nombre d'args formatwarp.
 */
function parseWarpArgs(args: string[]): { destMap: string; warpId: number; x: number; y: number } {
  const destMap = args[0] ?? '';
  const rest = args.slice(1);
  const WARP_ID_NONE = -1;
  let warpId: number, x: number, y: number;
  if (rest.length === 0) {
    warpId = WARP_ID_NONE; x = -1; y = -1;
  } else if (rest.length === 1) {
    warpId = parseInt(rest[0] ?? '0', 10); x = -1; y = -1;
  } else if (rest.length === 2) {
    // Coord pair : warpId=NONE, x=arg0, y=arg1.
    warpId = WARP_ID_NONE;
    x = parseInt(rest[0] ?? '0', 10);
    y = parseInt(rest[1] ?? '0', 10);
  } else {
    warpId = parseInt(rest[0] ?? '0', 10);
    x = parseInt(rest[1] ?? '0', 10);
    y = parseInt(rest[2] ?? '0', 10);
  }
  return { destMap, warpId, x, y };
}

registerOpcode('warpsilent', (_ctx, args) => {
  // 1:1 décomp `ScrCmd_warpsilent` : warp instantané sans fade.
  const { destMap, warpId, x, y } = parseWarpArgs(args);
  // Bug fix 2026-05-09 : préserve warpId = -1 (= WARP_ID_NONE) quand le script
  // utilise explicit coords (= form `warpsilent MAP, NONE, X, Y`). Avant on
  // forçait warpId = 0, ce qui faisait que executeWarp utilisait warps[0] de
  // la dest map au lieu des x/y explicites → tous les warps script-driven
  // arrivaient à la mauvaise position.
  setPendingWarp({ destMap, x, y, elevation: 0, warpId }, 'step');
  console.log(`[opcode warpsilent] ${destMap} warpId=${warpId} coords=(${x},${y})`);
  return false;
});

registerOpcode('warp', (_ctx, args) => {
  const { destMap, warpId, x, y } = parseWarpArgs(args);
  setPendingWarp({ destMap, x, y, elevation: 0, warpId }, 'step');
  console.log(`[opcode warp] ${destMap} warpId=${warpId} coords=(${x},${y})`);
  return false;
});

/** 1:1 décomp `ScrCmd_setrespawn` (scrcmd.c) :
 *    SetLastHealLocationWarp(VarGet(healLocationId));
 *  Set `gSaveBlock1Ptr->lastHealLocation` à la heal location passée en arg.
 *  Audit session 126 C1 : avant no-op → après defeat / poison KO, le player
 *  reste là où il était (= bug ROM-faithful majeur). */
registerOpcode('setrespawn', (_ctx, args) => {
  const healLocId = args[0] ?? '';
  // Le décomp resolve la heal location en (mapGroup, mapNum, x, y) via
  // sHealLocations[]. Notre table TS est dans heal_location-all-auto.ts mais
  // pas exposée comme lookup direct. Fallback : store la STRING ID, et le code
  // qui consume (= DoWhiteOut → SetWarpDestinationToLastHealLocation) résoudra
  // au moment du respawn.
  gSaveBlock1Ptr.respawnLocation = healLocId;
  return false;
});

/** 1:1 décomp `ScrCmd_warpwhitefade` (scrcmd.c) : warp avec white fade
 *  transition (= rare, used Sky Pillar etc.). Notre port : alias warp normal
 *  (= white fade effect post-MVP). */
registerOpcode('warpwhitefade', (ctx, args) => getOpcodeHandler('warp')?.(ctx, args) ?? false);

/** 1:1 décomp `ScrCmd_setdynamicwarp` (scrcmd.c:839-849) :
 *    SetDynamicWarp(VarGet(destMap), VarGet(x), VarGet(y)). */
registerOpcode('setdynamicwarp', (_ctx, args) => {
  const [destMap, xStr, yStr] = args;
  const x = parseInt(xStr ?? '0', 10);
  const y = parseInt(yStr ?? '0', 10);
  SetDynamicWarp(destMap, x, y);
  console.log(`[opcode setdynamicwarp] ${destMap} (${x},${y})`);
  return false;
});

/** 1:1 décomp `ScrCmd_warpdoor` (scrcmd.c:767-779) :
 *    SetWarpDestination(mapGroup, mapNum, warpId, x, y) + DoDoorWarp(). */
registerOpcode('warpdoor', (ctx, args) => {
  const handler = (globalThis as Record<string, unknown>).__opcodeWarp as
    ((ctx: ScriptContext, args: string[]) => boolean) | undefined;
  if (handler) return handler(ctx, args);
  // Fallback : same logic as 'warp' opcode (= we registered it earlier).
  // Use the warp-system directly.
  const dst = args[0] ?? '';
  setPendingWarp({
    destMap: dst,
    x: parseValue(args[2]),
    y: parseValue(args[3]),
    elevation: 0,
    warpId: -1,
  });
  return false;
});

/** 1:1 décomp `ScrCmd_setescapewarp` (scrcmd.c:875-885) :
 *    SetEscapeWarp(mapGroup, mapNum, warpId, x, y).
 *  Stocke la dest WHERE le player teleport quand ESCAPE rope ou defeat. */
registerOpcode('setescapewarp', (_ctx, args) => {
  const map = args[0] ?? '';
  const x = parseValue(args[2]);
  const y = parseValue(args[3]);
  const g = globalThis as Record<string, unknown>;
  g.__escapeWarp = { mapName: map.replace(/^MAP_/, ''), x, y };
  return false;
});

/** 1:1 décomp `ScrCmd_setwarp` (scrcmd.c:827-837) :
 *    SetWarpDestination(mapGroup, mapNum, warpId, x, y).
 *  Stocke seulement la destination ; le warp n'est pas exécuté. */
registerOpcode('setwarp', (_ctx, args) => {
  const { destMap, warpId, x, y } = parseWarpArgs(args);
  (globalThis as Record<string, unknown>).gSavedWarp = { destMap, warpId, x, y };
  console.log(`[opcode setwarp] ${destMap} warpId=${warpId} (${x},${y})`);
  return false;
});

/** 1:1 décomp `ScrCmd_setdivewarp` (scrcmd.c:851-861) :
 *    SetFixedDiveWarp(mapGroup, mapNum, warpId, x, y).
 *  Quand le player utilise dive depuis ce point, il warp vers cette destination. */
registerOpcode('setdivewarp', (_ctx, args) => {
  const { destMap, warpId, x, y } = parseWarpArgs(args);
  (globalThis as Record<string, unknown>).gDiveWarp = { destMap, warpId, x, y };
  return false;
});

/** 1:1 décomp `ScrCmd_setholewarp` (scrcmd.c:863-873) :
 *    SetFixedHoleWarp(mapGroup, mapNum, warpId, x, y).
 *  Quand player tombe par un trou (cracked floor) dans cette map, warp ici. */
registerOpcode('setholewarp', (_ctx, args) => {
  const { destMap, warpId, x, y } = parseWarpArgs(args);
  (globalThis as Record<string, unknown>).gHoleWarp = { destMap, warpId, x, y };
  return false;
});

/** 1:1 décomp `ScrCmd_warphole` (scrcmd.c:781-797) :
 *    PlayerGetDestCoords + SetWarpDestination (ou SetWarpDestinationTo
 *    FixedHoleWarp si MAP_UNDEFINED) + DoFallWarp + ResetInitialPlayer
 *    AvatarState. */
registerOpcode('warphole', (_ctx, args) => {
  const destMap = args[0] ?? 'MAP_UNDEFINED';
  const playerX = gSaveBlock1Ptr.pos.x ?? 0;
  const playerY = gSaveBlock1Ptr.pos.y ?? 0;
  if (destMap === 'MAP_UNDEFINED') {
    // SetWarpDestinationToFixedHoleWarp(x, y) : utilise gHoleWarp set par setholewarp.
    const holeWarp = (globalThis as Record<string, unknown>).gHoleWarp as
      { destMap?: string; warpId?: number; x?: number; y?: number } | undefined;
    if (holeWarp?.destMap) {
      setPendingWarp({
        destMap: holeWarp.destMap,
        warpId: -1,
        x: playerX,
        y: playerY,
        elevation: 0,
      }, 'fall');
    }
  } else {
    setPendingWarp({
      destMap,
      warpId: -1,
      x: playerX,
      y: playerY,
      elevation: 0,
    }, 'fall');
  }
  return true;  // wait state (DoFallWarp = animated fall)
});

/** 1:1 décomp `ScrCmd_warpteleport` (scrcmd.c:799-811) :
 *    SetWarpDestination + DoTeleportTileWarp.
 *  Effet fade out + warp (= différent de warpspinenter qui spin avant). */
registerOpcode('warpteleport', (ctx, args) => {
  return getOpcodeHandler('warp')?.(ctx, args) ?? false;
});

/** 1:1 décomp `ScrCmd_warpmossdeepgym` (scrcmd.c:813-825) :
 *    SetWarpDestination + DoMossdeepGymWarp.
 *  Animation spécifique au Mossdeep Gym tiles rotatifs (= warp avec spin). */
registerOpcode('warpmossdeepgym', (ctx, args) => {
  return getOpcodeHandler('warp')?.(ctx, args) ?? false;
});

/** 1:1 décomp `ScrCmd_warpspinenter` (scrcmd.c:2241-2254) :
 *    SetWarpDestination + SetSpinStartFacingDir + DoSpinEnterWarp.
 *  Animation spin avant warp (= Union Room entry, secret base entry). */
registerOpcode('warpspinenter', (ctx, args) => {
  return getOpcodeHandler('warp')?.(ctx, args) ?? false;
});

void VarSet;
