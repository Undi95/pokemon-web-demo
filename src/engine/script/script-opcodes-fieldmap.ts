/**
 * script-opcodes-fieldmap.ts — opcodes `setmetatile` / `setmaplayoutindex` /
 * `setstepcallback` 1:1 décomp `fieldmap.c` + `field_tasks.c`.
 *
 * Source de vérité :
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:2034-2048` :
 *     `ScrCmd_setmetatile` : MapGridSetMetatileIdAt(x+MAP_OFFSET, y+MAP_OFFSET, id|impassable).
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:731-737` :
 *     `ScrCmd_setmaplayoutindex` : SetCurrentMapLayout(VarGet(layout)).
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:725-729` :
 *     `ScrCmd_setstepcallback` : ActivatePerStepCallback(callbackId).
 */

import { registerOpcode } from './script-runtime';
import { VarGet } from './script-vars';
import { MapGridSetMetatileIdAt, MAP_OFFSET, MAPGRID_IMPASSABLE } from '../map-loader';
import { parseValue } from './script-opcodes-helpers';

// 1:1 décomp scrcmd.c:ScrCmd_setmetatile (lignes 2034-2048).
//   x += MAP_OFFSET ; y += MAP_OFFSET ;
//   if (!isImpassable) MapGridSetMetatileIdAt(x, y, metatileId)
//   else MapGridSetMetatileIdAt(x, y, metatileId | MAPGRID_IMPASSABLE)
//
// Args : x, y, metatileId, isImpassable. Tous peuvent être var noms ou immediates.
// 595 usages dans les scripts (= portes dynamiques, escaliers, hidden items, etc.).
registerOpcode('setmetatile', (_ctx, args) => {
  const x = VarGet(args[0]) + MAP_OFFSET;
  const y = VarGet(args[1]) + MAP_OFFSET;
  const metatileId = VarGet(args[2]);
  const isImpassable = VarGet(args[3]);
  if (!isImpassable) {
    MapGridSetMetatileIdAt(x, y, metatileId);
  } else {
    MapGridSetMetatileIdAt(x, y, metatileId | MAPGRID_IMPASSABLE);
  }
  return false;
});

// 1:1 décomp ScrCmd_setmaplayoutindex (scrcmd.c:731-737) :
//   SetCurrentMapLayout(VarGet(layout)).
// Change le layout (= tile data + collisions) de la map active sans recharger
// toute la map (= utilisé pour Birch lab post-starter, Pacifidlog day/night,
// Sootopolis ice cracks, ShoalCave tide, SkyPillar dust, Route 111 desert).
registerOpcode('setmaplayoutindex', (_ctx, args) => {
  const layoutIdx = VarGet(args[0] ?? '0');
  void (async () => {
    const swap = (globalThis as { __mapLayoutSwap?: { SetCurrentMapLayout?: (idx: number) => Promise<void> } }).__mapLayoutSwap;
    await swap?.SetCurrentMapLayout?.(layoutIdx);
  })();
  return false;
});

// 1:1 décomp ScrCmd_setstepcallback (scrcmd.c:725-729) :
//   ActivatePerStepCallback(callbackId).
// Active une callback exécutée à chaque step du player.
// Session 132 : real dispatch via step-callbacks.ts (= 8 callback handlers
// 1:1 décomp gPerStepCallbacks[]).
registerOpcode('setstepcallback', (_ctx, args) => {
  const callbackId = parseValue(args[0] ?? '0');
  void (async () => {
    const { ActivatePerStepCallback } = await import('../step-callbacks');
    ActivatePerStepCallback(callbackId);
  })();
  return false;
});
