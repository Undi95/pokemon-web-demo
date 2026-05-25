/**
 * script-opcodes-frontier.ts — opcodes Battle Frontier 1:1 décomp `frontier_util.c`
 * + battle facility (tower/dome/factory/pike/palace/arena/pyramid/tents).
 *
 * Source de vérité :
 *   `D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_frontier/frontier_util.inc`
 *   `D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_frontier/battle_tower.inc`
 *   `D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_frontier/battle_dome.inc`
 *   `D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_frontier/battle_factory.inc`
 *   `D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_frontier/battle_pike.inc`
 *   `D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_frontier/battle_palace.inc`
 *   `D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_frontier/battle_arena.inc`
 *   `D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_frontier/battle_pyramid.inc`
 *   `D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_tent.inc`
 *
 * Pattern macro 1:1 :
 *   <facility>_<verb> ARG → setvar VAR_0x8004, <funcId>
 *                          [setvar VAR_0x8005, <dataVal>]
 *                          [setvar VAR_0x8006, <val>]
 *                          special Call<Facility>Function
 *
 * Le specials registry contient les CallXxxFunction handlers (= stubs pour
 * l'instant, futurs full implementations).
 */

import { registerOpcode } from './script-runtime';
import { VarSet } from './script-vars';
import { invokeSpecial } from './script-opcodes-special';
import { parseValue } from './script-opcodes-helpers';

/** Expand un macro 'facility' opcode : set vars + call special.
 *  1:1 décomp pattern asm/macros/battle_frontier/*.inc. */
function _facilityCall(specialFn: string, funcId: number, dataVal?: number | string, val?: number | string): void {
  VarSet('VAR_0x8004', funcId);
  if (dataVal !== undefined) {
    const v = typeof dataVal === 'string' ? parseValue(dataVal) : dataVal;
    VarSet('VAR_0x8005', v);
  }
  if (val !== undefined) {
    const v = typeof val === 'string' ? parseValue(val) : val;
    VarSet('VAR_0x8006', v);
  }
  invokeSpecial(specialFn);
}

// ─── Frontier util (frontier_get/set/etc.) ──────────────────────────────────
// Source : asm/macros/battle_frontier/frontier_util.inc
// All map to FRONTIER_UTIL_FUNC_* and CallFrontierUtilFunc.

registerOpcode('frontier_getstatus', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 0 /* FRONTIER_UTIL_FUNC_GET_STATUS */);
  return false;
});

registerOpcode('frontier_get', (_ctx, args) => {
  _facilityCall('CallFrontierUtilFunc', 1 /* FRONTIER_UTIL_FUNC_GET_DATA */, args[0]);
  return false;
});

registerOpcode('frontier_set', (_ctx, args) => {
  _facilityCall('CallFrontierUtilFunc', 2 /* FRONTIER_UTIL_FUNC_SET_DATA */, args[0], args[1]);
  return false;
});

registerOpcode('frontier_reset', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 3 /* FRONTIER_UTIL_FUNC_RESET */);
  return false;
});

registerOpcode('frontier_setpartyorder', (_ctx, args) => {
  _facilityCall('CallFrontierUtilFunc', 4 /* FRONTIER_UTIL_FUNC_SET_PARTY_ORDER */, args[0]);
  return false;
});

registerOpcode('frontier_results', (_ctx, args) => {
  _facilityCall('CallFrontierUtilFunc', 5 /* FRONTIER_UTIL_FUNC_SHOW_RESULTS */, args[0]);
  return false;
});

registerOpcode('frontier_getsymbols', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 6 /* FRONTIER_UTIL_FUNC_GET_SYMBOLS */);
  return false;
});

registerOpcode('frontier_givesymbol', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 7 /* FRONTIER_UTIL_FUNC_GIVE_SYMBOL */);
  return false;
});

registerOpcode('frontier_checkairshow', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 8 /* FRONTIER_UTIL_FUNC_CHECK_AIR_SHOW */);
  return false;
});

registerOpcode('frontier_checkineligible', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 9 /* FRONTIER_UTIL_FUNC_CHECK_INELIGIBLE */);
  return false;
});

registerOpcode('frontier_getbrainstatus', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 10 /* FRONTIER_UTIL_FUNC_GET_BRAIN_STATUS */);
  return false;
});

registerOpcode('frontier_isbrain', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 11 /* FRONTIER_UTIL_FUNC_IS_BRAIN */);
  return false;
});

registerOpcode('frontier_givepoints', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 12 /* FRONTIER_UTIL_FUNC_GIVE_BATTLE_POINTS */);
  return false;
});

registerOpcode('frontier_settrainers', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 13 /* FRONTIER_UTIL_FUNC_SET_TRAINERS */);
  return false;
});

registerOpcode('frontier_resetsketch', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 14 /* FRONTIER_UTIL_FUNC_RESET_SKETCH_MOVES */);
  return false;
});

registerOpcode('frontier_restorehelditems', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 15 /* FRONTIER_UTIL_FUNC_RESTORE_HELD_ITEMS */);
  return false;
});

// ─── Battle Tower (tower_*) ─────────────────────────────────────────────────
// Source : asm/macros/battle_frontier/battle_tower.inc → CallBattleTowerFunc.

registerOpcode('tower_set', (_ctx, args) => {
  _facilityCall('CallBattleTowerFunc', 0 /* BATTLE_TOWER_FUNC_SET_DATA */, args[0], args[1]);
  return false;
});

registerOpcode('tower_get', (_ctx, args) => {
  _facilityCall('CallBattleTowerFunc', 1 /* BATTLE_TOWER_FUNC_GET_DATA */, args[0]);
  return false;
});

registerOpcode('tower_save', (_ctx, args) => {
  _facilityCall('CallBattleTowerFunc', 2 /* BATTLE_TOWER_FUNC_SAVE_DATA */, args[0]);
  return false;
});

registerOpcode('tower_setopponent', (_ctx, _args) => {
  _facilityCall('CallBattleTowerFunc', 3 /* BATTLE_TOWER_FUNC_SET_OPPONENT */);
  return false;
});

registerOpcode('tower_dopartnermsg', (_ctx, _args) => {
  _facilityCall('CallBattleTowerFunc', 4 /* BATTLE_TOWER_FUNC_DO_PARTNER_MSG */);
  return false;
});

registerOpcode('tower_getopponentintro', (_ctx, _args) => {
  _facilityCall('CallBattleTowerFunc', 5 /* BATTLE_TOWER_FUNC_GET_OPPONENT_INTRO */);
  return false;
});

registerOpcode('tower_init', (_ctx, _args) => {
  _facilityCall('CallBattleTowerFunc', 6 /* BATTLE_TOWER_FUNC_INIT */);
  return false;
});

// ─── Battle Dome (dome_*) ───────────────────────────────────────────────────

registerOpcode('dome_set', (_ctx, args) => {
  _facilityCall('CallBattleDomeFunction', 0 /* BATTLE_DOME_FUNC_SET_DATA */, args[0], args[1]);
  return false;
});

registerOpcode('dome_get', (_ctx, args) => {
  _facilityCall('CallBattleDomeFunction', 1 /* BATTLE_DOME_FUNC_GET_DATA */, args[0]);
  return false;
});

registerOpcode('dome_save', (_ctx, _args) => {
  _facilityCall('CallBattleDomeFunction', 2 /* BATTLE_DOME_FUNC_SAVE */);
  return false;
});

registerOpcode('dome_resolvewinners', (_ctx, _args) => {
  _facilityCall('CallBattleDomeFunction', 3 /* BATTLE_DOME_FUNC_RESOLVE_WINNERS */);
  return false;
});

// ─── Battle Factory (factory_*) ─────────────────────────────────────────────

registerOpcode('factory_set', (_ctx, args) => {
  _facilityCall('CallBattleFactoryFunction', 0 /* BATTLE_FACTORY_FUNC_SET_DATA */, args[0], args[1]);
  return false;
});

registerOpcode('factory_get', (_ctx, args) => {
  _facilityCall('CallBattleFactoryFunction', 1 /* BATTLE_FACTORY_FUNC_GET_DATA */, args[0]);
  return false;
});

registerOpcode('factory_save', (_ctx, _args) => {
  _facilityCall('CallBattleFactoryFunction', 2 /* BATTLE_FACTORY_FUNC_SAVE */);
  return false;
});

registerOpcode('factory_setswapped', (_ctx, _args) => {
  _facilityCall('CallBattleFactoryFunction', 3 /* BATTLE_FACTORY_FUNC_SET_SWAPPED */);
  return false;
});

// ─── Battle Pike (pike_*) ───────────────────────────────────────────────────

registerOpcode('pike_set', (_ctx, args) => {
  _facilityCall('CallBattlePikeFunction', 0 /* BATTLE_PIKE_FUNC_SET_DATA */, args[0], args[1]);
  return false;
});

registerOpcode('pike_get', (_ctx, args) => {
  _facilityCall('CallBattlePikeFunction', 1 /* BATTLE_PIKE_FUNC_GET_DATA */, args[0]);
  return false;
});

registerOpcode('pike_save', (_ctx, _args) => {
  _facilityCall('CallBattlePikeFunction', 2 /* BATTLE_PIKE_FUNC_SAVE */);
  return false;
});

registerOpcode('pike_gettrainerintro', (_ctx, _args) => {
  _facilityCall('CallBattlePikeFunction', 3 /* BATTLE_PIKE_FUNC_GET_TRAINER_INTRO */);
  return false;
});

// ─── Battle Palace (palace_*) ───────────────────────────────────────────────

registerOpcode('palace_set', (_ctx, args) => {
  _facilityCall('CallBattlePalaceFunction', 0 /* BATTLE_PALACE_FUNC_SET_DATA */, args[0], args[1]);
  return false;
});

registerOpcode('palace_get', (_ctx, args) => {
  _facilityCall('CallBattlePalaceFunction', 1 /* BATTLE_PALACE_FUNC_GET_DATA */, args[0]);
  return false;
});

registerOpcode('palace_getopponentintro', (_ctx, _args) => {
  _facilityCall('CallBattlePalaceFunction', 2 /* BATTLE_PALACE_FUNC_GET_OPPONENT_INTRO */);
  return false;
});

// ─── Battle Arena (arena_*) ─────────────────────────────────────────────────

registerOpcode('arena_set', (_ctx, args) => {
  _facilityCall('CallBattleArenaFunction', 0 /* BATTLE_ARENA_FUNC_SET_DATA */, args[0], args[1]);
  return false;
});

registerOpcode('arena_get', (_ctx, args) => {
  _facilityCall('CallBattleArenaFunction', 1 /* BATTLE_ARENA_FUNC_GET_DATA */, args[0]);
  return false;
});

registerOpcode('arena_save', (_ctx, _args) => {
  _facilityCall('CallBattleArenaFunction', 2 /* BATTLE_ARENA_FUNC_SAVE */);
  return false;
});

// ─── Battle Pyramid (pyramid_*) ─────────────────────────────────────────────

registerOpcode('pyramid_set', (_ctx, args) => {
  _facilityCall('CallBattlePyramidFunction', 0 /* BATTLE_PYRAMID_FUNC_SET_DATA */, args[0], args[1]);
  return false;
});

registerOpcode('pyramid_get', (_ctx, args) => {
  _facilityCall('CallBattlePyramidFunction', 1 /* BATTLE_PYRAMID_FUNC_GET_DATA */, args[0]);
  return false;
});

registerOpcode('pyramid_save', (_ctx, _args) => {
  _facilityCall('CallBattlePyramidFunction', 2 /* BATTLE_PYRAMID_FUNC_SAVE */);
  return false;
});

// ─── Battle Tents (verdanturf/fallarbor/slateport) ──────────────────────────
// Source : asm/macros/battle_tent.inc → CallVerdanturfTentFunction / etc.

registerOpcode('verdanturftent_save', (_ctx, args) => {
  _facilityCall('CallVerdanturfTentFunction', 4 /* VERDANTURF_TENT_FUNC_SAVE */, args[0]);
  return false;
});

registerOpcode('fallarbortent_save', (_ctx, args) => {
  _facilityCall('CallFallarborTentFunction', 3 /* FALLARBOR_TENT_FUNC_SAVE */, args[0]);
  return false;
});

registerOpcode('slateporttent_save', (_ctx, args) => {
  _facilityCall('CallSlateportTentFunction', 3 /* SLATEPORT_TENT_FUNC_SAVE */, args[0]);
  return false;
});

// ─── Event Mon (seteventmon macro) ──────────────────────────────────────────
// 1:1 décomp event.inc:1989 macro seteventmon species, level, item :
//   setvar VAR_0x8004, species ; setvar VAR_0x8005, level ;
//   setvar VAR_0x8006, item ; special CreateEnemyEventMon.

registerOpcode('seteventmon', (_ctx, args) => {
  const species = parseValue(args[0] ?? '0');
  const level = parseValue(args[1] ?? '5');
  const item = parseValue(args[2] ?? 'ITEM_NONE');
  VarSet('VAR_0x8004', species);
  VarSet('VAR_0x8005', level);
  VarSet('VAR_0x8006', item);
  invokeSpecial('CreateEnemyEventMon');
  return false;
});
