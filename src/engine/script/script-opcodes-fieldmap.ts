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
import { MapGridSetMetatileIdAt, MAP_OFFSET, MAPGRID_IMPASSABLE } from '../field/map-loader';
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
  const raw = args[0] ?? '0';
  void (async () => {
    const ft = await import('../../game/field_tasks');
    // 1:1 : l'arg est une constante STEP_CB_* (ex. "STEP_CB_ASH") OU une valeur numérique.
    // parseValue ne connaît PAS les STEP_CB_* (constants/field_tasks.h) → on les résout via
    // les exports de field_tasks (STEP_CB_DUMMY..STEP_CB_CRACKED_FLOOR). Sans ça la cendre
    // (Route113_OnResume = setstepcallback STEP_CB_ASH) activait STEP_CB_DUMMY (=0) → les
    // herbes ne réagissaient pas.
    const callbackId = (typeof raw === 'string' && raw in ft)
      ? (ft as unknown as Record<string, number>)[raw]
      : parseValue(raw);
    ft.ActivatePerStepCallback(callbackId);
  })();
  return false;
});
