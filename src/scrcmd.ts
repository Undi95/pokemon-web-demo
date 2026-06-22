/**
 * scrcmd.ts — miroir 1:1 de `decomp/src/scrcmd.c` (handlers de commandes script ScrCmd_*).
 *
 * FUSION de 34 modules side-effect `registerOpcode(...)` (anciennement
 * `src/engine/script/script-opcodes-*.ts`, une décompo maison par catégorie).
 * Chaque section ci-dessous = un ancien fichier ; tous enregistrent leurs
 * handlers dans le registre d'opcodes (`registerOpcode`) à l'import.
 *
 * Helpers/VM partagés (parseValue, registerOpcode, VarGet, …) restent dans
 * `engine/script/{script-runtime,script-vars,script-opcodes-helpers}.ts`
 * (= script.c / event_data.c / helpers ; merges séparés du marathon).
 */
import * as WeatherConstants from './engine/decomp-data/include/constants/weather-data';
import * as Songs from './engine/decomp-data/include/constants/songs-data';
import { getItem, getItemNameFr, getMoveNameFr, getSpeciesNameFr, getTrainer, getTrainerClassNameFr, getTrainerNameFr } from '../harness/runtime/data-tables';
import { resolveDecompConstant, reverseDecompConstant } from '../harness/runtime/decomp-constants';
import { PlaySE, getRuntime } from '../harness/runtime/decomp-globals';
import { encodeOwText } from '../include/text';
import { ScrCmd_dotrainerbattle, ScrCmd_gotobeatenscript, ScrCmd_gotopostbattlescript, ScrCmd_trainerbattle } from './battle_setup';
import { PlantBerryTree } from './berry';
import { AddCoins, GetCoins, RemoveCoins } from './coins';
import { AddBagItem, CheckBagHasItem, CheckBagHasSpace, RemoveBagItem } from './engine/bag/bag';
import { BattleSetup_StartScriptedWildBattle, CreateScriptedWildMon, StartFirstBattle } from './engine/battle/battle-setup-helpers';
import { CalculatePPWithBonus, GetMonData, MON_DATA_IS_EGG, MON_DATA_MET_LOCATION, MON_DATA_MOVE1, MON_DATA_PP1, MON_DATA_SPECIES, MonKnowsMove, SetMonData, gPlayerParty } from './engine/battle/party-storage';
import { MOVEMENT_ACTION_FACE_DOWN, MOVEMENT_ACTION_FACE_LEFT, MOVEMENT_ACTION_FACE_RIGHT, MOVEMENT_ACTION_FACE_UP } from './engine/decomp-data/include/constants/event_object_movement-data';
import { MAX_MON_MOVES, PARTY_SIZE } from './engine/decomp-data/include/constants/global-data';
import { applyMovement, isAllMovementsDone, isMovementDone } from './engine/field/movement-system';
import { SetDynamicWarp, getPendingWarp, setPendingWarp } from './engine/field/warp-system';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { FEMALE_GENDER, MALE_GENDER, OPPOSITE_DIR, findNpcByLocalId, findTemplateByLocalId, getSelectedNpc, isAOrBNewlyPressed, isPlayerStepFinished, parseValue, resolveCount, resolveObjectLocalIdRaw } from './engine/script/script-opcodes-helpers';
import { ScriptCall, ScriptJump, ScriptReturn, SetupNativeScript, StopScript, getOpcodeHandler, getScript, getText, registerOpcode } from './script';
import type { ScriptContext } from './script';
import { Compare, FlagClear, FlagGet, FlagSet, VarGet, VarSet, gSelectedObjectEvent, gSpecialVar } from './engine/script/script-vars';
import { getMultichoiceList } from './engine/system/multichoice-data';
import { setStringVar } from './engine/system/string-buffers';
import { CreateYesNoMenu, GetYesNoWindowId, InitMenuInUpperLeftCornerNormal, Menu_ProcessInputNoWrapClearOnChoose } from './engine/ui/gba-menu-system';
import { AddTextPrinterParameterized3 } from './engine/ui/gba-text-system';
import { AddWindow, ClearStdWindowAndFrame, CopyWindowToVram, DrawStdFrameWithCustomTileAndPalette, PutWindowTilemap, RemoveWindow } from './engine/ui/gba-window-system';
import type { WindowTemplate } from './engine/ui/gba-window-system';
import { FreezeObjectEvent, ObjectEventClearHeldMovementIfFinished, ObjectEventSetHeldMovement, SetObjectEventSpritePosToMapCoords, TrySpawnObjectEvent, UnfreezeObjectEvent, gObjectEvents } from './event_object_movement';
import { HideFieldMessageBox, IsFieldMessageBoxHidden, ShowFieldMessage } from './field_message_box';
import { DIR_EAST, DIR_NORTH, DIR_SOUTH, DIR_WEST, GetPlayerFacingDirection, gPlayerAvatar } from './field_player_avatar';
import { MAPGRID_IMPASSABLE, MAP_OFFSET, MapGridSetMetatileIdAt, gMapHeader } from './fieldmap';
import { GetCurrentMap, SetObjEventTemplateCoords } from './load_save';
import { Random } from './random';
import { RtcCalcLocalTime, RtcInitLocalTimeOffset, gLocalTime } from './rtc';
import { ScriptMovement_UnfreezeObjectEvents } from './script_movement';
import { DestroySprite } from './sprite';

// ─── helpers canoniques (étaient dupliqués à l'identique dans plusieurs sections) ───
function _vget(arg: string | undefined): number {
  return VarGet(arg ?? '0');
}

function _getFaceDirectionMovementAction(dir: number): number {
  switch (dir) {
    case DIR_SOUTH: return MOVEMENT_ACTION_FACE_DOWN;
    case DIR_NORTH: return MOVEMENT_ACTION_FACE_UP;
    case DIR_WEST:  return MOVEMENT_ACTION_FACE_LEFT;
    case DIR_EAST:  return MOVEMENT_ACTION_FACE_RIGHT;
    default:        return MOVEMENT_ACTION_FACE_DOWN;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « random » (ex src/engine/script/script-opcodes-random.ts)
// ═══════════════════════════════════════════════════════════════════════════
// 1:1 décomp `ScrCmd_random` (scrcmd.c:479-485) :
//   u16 max = VarGet(ScriptReadHalfword(ctx));
//   gSpecialVar_Result = Random() % max;
// `Random()` = LCG décomp (gRngValue, déterministe/reproductible) — PAS Math.random()
// (qui cassait le 1:1 RNG : audit opcodes pilote 2026-06-21).
registerOpcode('random', (_ctx, args) => {
  const max = VarGet(args[0] ?? '0');
  VarSet('VAR_RESULT', Random() % max);
  return false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « berry » (ex src/engine/script/script-opcodes-berry.ts)
// ═══════════════════════════════════════════════════════════════════════════
// 1:1 STRICT décomp `ScrCmd_setberrytree` (scrcmd.c:1923-1934) :
//   u8 treeId = ScriptReadByte(ctx);
//   u8 berry  = ScriptReadByte(ctx);
//   u8 growthStage = ScriptReadByte(ctx);
//   PlantBerryTree(treeId, berry, growthStage, FALSE);   // les 2 branches identiques
//   return FALSE;
// (Avant : un inline DIVERGENT mettait stopGrowth=0/berryYield=0/minutesUntilNextStage=0
//  au lieu d'appeler PlantBerryTree → baies non figées + yield faux.)
registerOpcode('setberrytree', (_ctx, args) => {
  const treeId = parseValue(args[0] ?? '0');
  const berry = parseValue(args[1] ?? '0');
  const growthStage = parseValue(args[2] ?? '0');
  PlantBerryTree(treeId, berry, growthStage, false);
  return false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « tv » (ex src/engine/script/script-opcodes-tv.ts)
// ═══════════════════════════════════════════════════════════════════════════
registerOpcode('getpokenewsactive', (_ctx, args) => {
  // 1:1 décomp ScrCmd_getpokenewsactive : gSpecialVar_Result = GetPokeNewsActive(channel).
  const _channel = parseValue(args[0] ?? '0');
  VarSet('VAR_RESULT', 0);  // pas de pokenews active par défaut
  return false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « match-call » (ex src/engine/script/script-opcodes-match-call.ts)
// ═══════════════════════════════════════════════════════════════════════════
// 1:1 décomp `register_matchcall` (= match_call.c) : sets `gMatchCallTrainerFlags`
// bit pour que le trainer puisse rappeler pour rematch.
registerOpcode('register_matchcall', (_ctx, args) => {
  const trainerName = args[0] ?? '';
  const g = globalThis as Record<string, unknown>;
  if (!g.__matchCallTrainers) g.__matchCallTrainers = new Set<string>();
  (g.__matchCallTrainers as Set<string>).add(trainerName);
  console.log(`[opcode register_matchcall] '${trainerName}' registered for rematch`);
  return false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « weather » (ex src/engine/script/script-opcodes-weather.ts)
// ═══════════════════════════════════════════════════════════════════════════
/** Résout un argument météo : valeur numérique, constante `WEATHER_*`/`COORD_EVENT_WEATHER_*`
 *  (via weather-data), ou nom de VAR (`VarGet`). ⚠️ `VarGet`/`resolveDecompConstant` ne
 *  connaissent PAS les `WEATHER_*` → sans ça `setweather WEATHER_VOLCANIC_ASH` posait 0
 *  (la météo Route 113 ne s'activait pas en entrant dans la zone). */
function _resolveWeatherArg(arg: string): number {
  if (/^-?\d+$/.test(arg)) return parseInt(arg, 10);
  const c = (WeatherConstants as unknown as Record<string, number>)[arg];
  if (typeof c === 'number') return c;
  return VarGet(arg);
}

/** 1:1 décomp `ScrCmd_setweather` (scrcmd.c) :
 *    SetSavedWeather(VarGet(weather));
 *  Stocke dans gSaveBlock1Ptr.weather (sync). Effet visuel appliqué par ResumePausedWeather
 *  (map-init) / doweather. ⚠️ dette mineure : TranslateWeatherNum (cycles Route119/123) +
 *  UpdateRainCounter de SetSavedWeather non appliqués ici (set direct) — cf. C-final. */
registerOpcode('setweather', (_ctx, args) => {
  const weather = _resolveWeatherArg(args[0] ?? '0');
  if (gSaveBlock1Ptr) gSaveBlock1Ptr.weather = weather;
  return false;
});

/** 1:1 décomp `ScrCmd_resetweather` (scrcmd.c) :
 *    SetSavedWeatherFromCurrMapHeader();
 *  = `SetSavedWeather(gMapHeader.weather)` = `gSaveBlock1Ptr.weather =
 *  gMapHeader.weather`. Restaure la météo SAUVEGARDÉE à celle PAR
 *  DÉFAUT de la map courante (= 1:1 field_weather.c). gMapHeader.weather
 *  est une string "WEATHER_*" → résolue en id numérique. Était MANQUANT
 *  (audit scrcmd) → la météo ne se reset pas en sortie de zone spéciale. */
registerOpcode('resetweather', (_ctx) => {
  const mhWeather = gMapHeader?.weather;
  const weatherId = typeof mhWeather === 'string'
    ? (resolveDecompConstant(mhWeather) ?? 0)
    : (typeof mhWeather === 'number' ? mhWeather : 0);
  if (gSaveBlock1Ptr) gSaveBlock1Ptr.weather = typeof weatherId === 'number' ? weatherId : 0;
  return false;
});

/** 1:1 décomp `ScrCmd_doweather` (scrcmd.c) :
 *    DoCurrentWeather();  // active le weather sauvegardé
 *
 *  Dette R3 documentée : DoCurrentWeather (field_weather_effect.c:2541) demande
 *  cascade weather subsystem entier non porté :
 *   - GetSavedWeather (lit gSaveBlock1Ptr.weather)
 *   - Task_DoAbnormalWeather + CreateAbnormalWeatherTask (= alternance random
 *     downpour/sandstorm pour WEATHER_ABNORMAL)
 *   - SetNextWeather (transition fade vers le weather state)
 *   - sCurrentAbnormalWeather global static
 *
 *  Notre engine n'affiche aucun weather VFX runtime (= rain/snow/sandstorm
 *  particles). doweather est donc un no-op honnête tant que ce subsystem
 *  reste U-tier. Le var gSaveBlock1Ptr.weather est synchronisé par
 *  setweather/resetweather opcodes pour persistance state. */
registerOpcode('doweather', (_ctx, _args) => {
  return false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « fieldeffect » (ex src/engine/script/script-opcodes-fieldeffect.ts)
// ═══════════════════════════════════════════════════════════════════════════
/** 1:1 décomp `sFieldEffectScriptId` (scrcmd.c:50). Set par `waitfieldeffect`. */
let _sFieldEffectScriptId = 0;

/** 1:1 décomp `gFieldEffectArguments[8]` (field_effect.c). Buffer s16 utilisé
 *  pour passer params aux field effects. Set par `setfieldeffectargument`
 *  opcode + utilisé par `dofieldeffect`. */
// ⚠️ MÊME array partagé que game/field_effect.ts (adopt-or-create via globalThis). Sinon le slot
// posé ici par `setfieldeffectargument`/`dofieldeffectsparkle` n'atteint pas les FldEff_* qui
// importent gFieldEffectArguments de field_effect.ts (bug surf freeze : tMonId=255 → gPlayerParty[255]
// undefined). Pas d'import statique (moteur script → game/) = pas de cycle ESM ; le 1er chargé crée.
const _gFieldEffectArguments: number[] =
  ((globalThis as Record<string, unknown>).gFieldEffectArguments as number[] | undefined) ?? new Array(8).fill(0);
(globalThis as Record<string, unknown>).gFieldEffectArguments = _gFieldEffectArguments;

/** _vget = VarGet avec fallback '0'. Local au fichier (= 1:1 décomp inline read). */


// 1:1 décomp `ScrCmd_dofieldeffect` (scrcmd.c:1973-1980) :
//   sFieldEffectScriptId = VarGet(effectId);
//   ScriptContext_Stop();
//   FieldEffectStart(effectId);
//
// Audit session 126 LOT C3 : avant strict no-op → Cut/Surf/Fly/Strength/
// Rock Smash all broken. Maintenant on dispatch via FieldEffectStart depuis
// l'auto-file (= field_effect-all-auto.ts).
registerOpcode('dofieldeffect', (_ctx, args) => {
  const effectId = VarGet(args[0] ?? '0');
  // ⚠️ NE PAS ajouter à la liste active ici : `FieldEffectStart` le fait désormais lui-même (1:1
  // décomp `FieldEffectStart` → `FieldEffectActiveListAdd`). Ajouter ici en PLUS = double-add (la
  // liste n'est pas idempotente) → `…Remove` ne retire qu'1 occurrence → `…Contains` reste true →
  // `waitfieldeffect` / les gates CS bloqueraient. (= 1:1 `ScrCmd_dofieldeffect` qui n'ajoute pas.)
  const fieldEffectStart = (globalThis as Record<string, unknown>).FieldEffectStart as
    ((id: number) => unknown) | undefined;
  if (typeof fieldEffectStart === 'function') {
    try {
      fieldEffectStart(effectId);
      console.log(`[opcode dofieldeffect] FLDEFF id=${effectId} dispatched`);
    } catch (e) {
      console.warn(`[opcode dofieldeffect] FLDEFF id=${effectId} threw:`, e);
    }
  } else {
    console.warn(`[opcode dofieldeffect] FieldEffectStart not exposed — FLDEFF id=${effectId} skipped (Cut/Surf/Fly/etc broken until wired)`);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_setfieldeffectargument` (scrcmd.c:1982-1996) :
 *    gFieldEffectArguments[argNum] = (s16)VarGet(value). */
registerOpcode('setfieldeffectargument', (_ctx, args) => {
  const argNum = parseValue(args[0] ?? '0');
  const value = _vget(args[1]);
  if (argNum >= 0 && argNum < 8) {
    // s16 cast (sign extension du 16-bit)
    let v = value & 0xFFFF;
    if (v & 0x8000) v -= 0x10000;
    _gFieldEffectArguments[argNum] = v;
  }
  // Expose pour le rendering field-effect.
  (globalThis as Record<string, unknown>).gFieldEffectArguments = _gFieldEffectArguments;
  return false;
});

/** 1:1 décomp `ScrCmd_waitfieldeffect` (scrcmd.c:1998-2003) :
 *    sFieldEffectScriptId = VarGet(arg);
 *    SetupNativeScript(ctx, WaitForFieldEffectFinish) ; return TRUE.
 *  WaitForFieldEffectFinish : return !FieldEffectActiveListContains(sFieldEffectScriptId).
 *  Session 132 : real tracking via field-effect-active-list.ts. */
registerOpcode('waitfieldeffect', (ctx, args) => {
  _sFieldEffectScriptId = _vget(args[0]);
  const poll = (): boolean => {
    const fa = (globalThis as { __fieldEffectActiveList?: { FieldEffectActiveListContains?: (id: number) => boolean } }).__fieldEffectActiveList;
    return !(fa?.FieldEffectActiveListContains?.(_sFieldEffectScriptId) ?? false);
  };
  SetupNativeScript(ctx, poll);
  return true;
});

/** 1:1 décomp macro `dofieldeffectsparkle x, y, priority` (event.inc:1974) :
 *    setfieldeffectargument 0, x ; setfieldeffectargument 1, y ;
 *    setfieldeffectargument 2, priority ; dofieldeffect FLDEFF_SPARKLE.
 *  Session 132 : trigger active list add pour tracking via waitfieldeffect. */
registerOpcode('dofieldeffectsparkle', (ctx, args) => {
  const x = _vget(args[0]);
  const y = _vget(args[1]);
  const priority = _vget(args[2]);
  _gFieldEffectArguments[0] = x;
  _gFieldEffectArguments[1] = y;
  _gFieldEffectArguments[2] = priority;
  (globalThis as Record<string, unknown>).gFieldEffectArguments = _gFieldEffectArguments;
  // FLDEFF_SPARKLE = 36 (= 1:1 décomp include/constants/field_effects.h).
  const FLDEFF_SPARKLE = 36;
  const fa = (globalThis as {
    __fieldEffectActiveList?: {
      FieldEffectActiveListRemove?: (id: number) => void;
    };
  }).__fieldEffectActiveList;
  // L'add est fait par dofieldeffect→FieldEffectStart ci-dessous (PAS ici = évite le double-add).
  // Dette R3 : sprite callback `FldEff_Sparkle` (= field_effect_helpers.c) pas encore porté → le
  // décomp wire l'auto-remove via FieldEffectStop à fin d'anim ; en attendant, scheduler local
  // setTimeout 500ms (~30 frames) pour matcher la durée visuelle attendue.
  setTimeout(() => fa?.FieldEffectActiveListRemove?.(FLDEFF_SPARKLE), 500);
  return getOpcodeHandler('dofieldeffect')?.(ctx, ['36']) ?? false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « shop » (ex src/engine/script/script-opcodes-shop.ts)
// ═══════════════════════════════════════════════════════════════════════════
/** 1:1 décomp `ScrCmd_pokemart` (scrcmd.c) :
 *    products = (const u16 *)ScriptReadWord(ctx);
 *    CreatePokemartMenu(products);
 *    ScriptContext_Stop();
 *
 *  Audit session 126 LOT D3 : le shop UI complet est ~3000 lignes décomp
 *  (= shop.c). Notre dispatch via globalThis.CreatePokemartMenu sera câblé
 *  quand le shop UI sera porté en TS.
 *
 *  Note : `args[0]` est typiquement un POINTER LABEL (= "DewfordTown_Mart_
 *  Pokemart") qui est résolu au compile time vers une array de u16 itemIds.
 *  Notre runtime a probably la liste dans le scripts JSON sous ce label. */
registerOpcode('pokemart', (_ctx, args) => {
  const productsLabel = args[0] ?? '';
  const createPokemartMenu = (globalThis as Record<string, unknown>).CreatePokemartMenu as
    ((items: unknown) => void) | undefined;
  if (typeof createPokemartMenu === 'function') {
    try {
      // Pour l'instant on passe le label string ; le auto-file expects un u16*.
      // À wire proprement : resolve label → array via map scripts data.
      createPokemartMenu(productsLabel);
      console.log(`[opcode pokemart] CreatePokemartMenu('${productsLabel}') dispatched`);
    } catch (e) {
      console.warn(`[opcode pokemart] CreatePokemartMenu threw:`, e);
    }
  } else {
    console.warn(`[opcode pokemart] '${productsLabel}' — CreatePokemartMenu not exposed (= shop UI ~3000 lignes décomp à wire)`);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_pokemartdecoration` (scrcmd.c) :
 *    products = (const u16 *)ScriptReadWord(ctx);
 *    CreateDecorationShop1Menu(products).
 *  Shop décoration mode 1. Notre port : delegate au pokemart standard
 *  (= CreateDecorationShop1Menu non encore exposé). */
registerOpcode('pokemartdecoration', (ctx, args) => {
  return getOpcodeHandler('pokemart')?.(ctx, args) ?? false;
});

/** 1:1 décomp `ScrCmd_pokemartdecoration2` (scrcmd.c) :
 *    CreateDecorationShop2Menu(products). */
registerOpcode('pokemartdecoration2', (ctx, args) => {
  return getOpcodeHandler('pokemart')?.(ctx, args) ?? false;
});

/** 1:1 décomp `event.inc:1158` `pokemartlistend` macro — c'est un MARQUEUR
 *  DE FIN dans une liste (= .2byte ITEM_NONE + release + end), pas un
 *  opcode actif. No-op safe. */
registerOpcode('pokemartlistend', (_ctx, _args) => {
  return false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « mystery-event » (ex src/engine/script/script-opcodes-mystery-event.ts)
// ═══════════════════════════════════════════════════════════════════════════
/** _vget = VarGet avec fallback '0'. Local au fichier (= 1:1 décomp inline read). */


/** 1:1 décomp `ScrCmd_setmysteryeventstatus` (scrcmd.c:296-302) :
 *    SetMysteryEventScriptStatus(ScriptReadByte(ctx)). */
registerOpcode('setmysteryeventstatus', (_ctx, args) => {
  const status = parseValue(args[0] ?? '0');
  (globalThis as Record<string, unknown>).gMysteryEventScriptStatus = status;
  return false;
});

/** 1:1 décomp `ScrCmd_setmodernfatefulencounter` (scrcmd.c:2210-2217) :
 *    SetMonData(&gPlayerParty[idx], MON_DATA_MODERN_FATEFUL_ENCOUNTER, &TRUE). */
registerOpcode('setmodernfatefulencounter', (_ctx, args) => {
  const partyIndex = _vget(args[0]);
  const party = gSaveBlock1Ptr.playerParty as Array<{ modernFatefulEncounter?: boolean }>;
  if (party && partyIndex >= 0 && partyIndex < party.length) {
    party[partyIndex].modernFatefulEncounter = true;
  }
  return false;
});

/** 1:1 décomp `ScrCmd_checkmodernfatefulencounter` (scrcmd.c:2219-2225) :
 *    gSpecialVar_Result = GetMonData(&gPlayerParty[idx], MON_DATA_MODERN_FATEFUL_ENCOUNTER). */
registerOpcode('checkmodernfatefulencounter', (_ctx, args) => {
  const partyIndex = _vget(args[0]);
  const party = gSaveBlock1Ptr.playerParty as Array<{ modernFatefulEncounter?: boolean }>;
  if (party && partyIndex >= 0 && partyIndex < party.length) {
    VarSet('VAR_RESULT', party[partyIndex].modernFatefulEncounter ? 1 : 0);
  } else {
    VarSet('VAR_RESULT', 0);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_trywondercardscript` (scrcmd.c:2227-2239) : execute saved
 *  RAM script si valid. Notre port : Mystery Event / Wonder Card non implémenté
 *  → no-op safe (= condition jamais vraie, jamais branche). */
registerOpcode('trywondercardscript', (_ctx, _args) => {
  return false;
});

/** RS-era `setworldmapflag` — nop1 dans Em (= retiré du décomp). */
registerOpcode('setworldmapflag', (_ctx, _args) => false);


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « rotating-tile-puzzle » (ex src/engine/script/script-opcodes-rotating-tile-puzzle.ts)
// ═══════════════════════════════════════════════════════════════════════════
registerOpcode('initrotatingtilepuzzle', (_ctx, args) => {
  // 1:1 décomp ScrCmd_initrotatingtilepuzzle (scrcmd.c) :
  //   InitRotatingTilePuzzle(isTrickHouse).
  const isTrickHouse = VarGet(args[0] ?? '0');
  (globalThis as Record<string, unknown>).gRotatingTilePuzzleState = {
    active: true,
    isTrickHouse: isTrickHouse !== 0,
  };
  return false;
});

registerOpcode('moverotatingtileobjects', (_ctx, args) => {
  // 1:1 décomp ScrCmd_moverotatingtileobjects (scrcmd.c) :
  //   sMovingNpcId = MoveRotatingTileObjects(puzzleNumber).
  const _puzzleNumber = VarGet(args[0] ?? '0');
  void _puzzleNumber;
  return false;
});

registerOpcode('turnrotatingtileobjects', (_ctx, _args) => {
  // 1:1 décomp ScrCmd_turnrotatingtileobjects (scrcmd.c) :
  //   TurnRotatingTileObjects().
  return false;
});

registerOpcode('freerotatingtilepuzzle', (_ctx, _args) => {
  // 1:1 décomp ScrCmd_freerotatingtilepuzzle (scrcmd.c) :
  //   FreeRotatingTilePuzzle().
  (globalThis as Record<string, unknown>).gRotatingTilePuzzleState = { active: false };
  return false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « slot-machine » (ex src/engine/script/script-opcodes-slot-machine.ts)
// ═══════════════════════════════════════════════════════════════════════════
registerOpcode('playslotmachine', (ctx, args) => {
  // 1:1 décomp ScrCmd_playslotmachine (scrcmd.c:1914-1921) :
  //   PlaySlotMachine(machineId, CB2_ReturnToFieldContinueScriptPlayMapMusic);
  //   ScriptContext_Stop();
  //   return TRUE;
  // Notre port : slot machine non implémentée (= slot_machine.c ~6000 lignes
  // décomp à porter en session dédiée). Wait state + return immédiatement.
  const _machineId = VarGet(args[0] ?? '0');
  void _machineId;
  let framesWaited = 0;
  const poll = (): boolean => {
    framesWaited++;
    return framesWaited >= 1;
  };
  SetupNativeScript(ctx, poll);
  return true;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « contest » (ex src/engine/script/script-opcodes-contest.ts)
// ═══════════════════════════════════════════════════════════════════════════
/** 1:1 décomp `ScrCmd_choosecontestmon` (scrcmd.c:1944-1950) :
 *    ChooseContestMon();  // ouvre le party menu en mode contest selection. */
registerOpcode('choosecontestmon', (_ctx, _args) => false);

/** 1:1 décomp `ScrCmd_startcontest` (scrcmd.c:1952-1957) :
 *    StartContest();  // CB2 swap vers contest scene. */
registerOpcode('startcontest', (_ctx, _args) => false);

/** 1:1 décomp `ScrCmd_showcontestresults` (scrcmd.c:1959-1964) :
 *    ShowContestResults();  // affichage des résultats du contest. */
registerOpcode('showcontestresults', (_ctx, _args) => false);

/** 1:1 décomp `ScrCmd_contestlinktransfer` (scrcmd.c:1966-1971) :
 *    ContestLinkTransfer();  // multi-link contest transfer. */
registerOpcode('contestlinktransfer', (_ctx, _args) => false);

/** 1:1 décomp `ScrCmd_showcontestpainting` (scrcmd.c:1468-1479) :
 *    SetContestWinnerForPainting(ScriptReadHalfword(ctx));
 *    ShowContestPainting();
 *  Affiche la peinture contest winner depuis gSaveBlock1Ptr.contestWinners[]. */
registerOpcode('showcontestpainting', (_ctx, args) => {
  const _contestWinnerId = parseValue(args[0] ?? '0');
  void _contestWinnerId;
  return false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « pc-storage » (ex src/engine/script/script-opcodes-pc-storage.ts)
// ═══════════════════════════════════════════════════════════════════════════
/** 1:1 décomp `ScrCmd_addpcitem` (scrcmd.c:531-539) :
 *    gSpecialVar_Result = AddPCItem(itemId, quantity);
 *  Ajoute des items au PC du joueur (= gSaveBlock1Ptr->pcItems, pas le bag).
 *  Délégué à `pc-items.ts:AddPCItem` (= port 1:1). */
registerOpcode('addpcitem', (_ctx, args) => {
  const itemKey = args[0] ?? '';
  const qty = parseValue(args[1]);
  // Lazy import to avoid circular dep with bedroom-pc → script-runtime → script-opcodes.
  void import('./engine/pokemon/pc-items').then(({ AddPCItem }) => {
    const ok = AddPCItem(itemKey, qty);
    VarSet('VAR_RESULT', ok ? 1 : 0);
  });
  return false;
});

/** 1:1 décomp `ScrCmd_checkpcitem` (scrcmd.c:540-547) :
 *    gSpecialVar_Result = CheckPCHasItem(itemId, quantity);
 *  Notre port : `CheckPCHasItem` pas encore porté → VAR_RESULT = 0 (= no PC items).
 *  Dette : porter `CheckPCHasItem` dans `pc-items.ts` 1:1 strict. */
registerOpcode('checkpcitem', (_ctx, _args) => {
  VarSet('VAR_RESULT', 0); // No PC items implemented
  return false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « lilycove » (ex src/engine/script/script-opcodes-lilycove.ts)
// ═══════════════════════════════════════════════════════════════════════════
// 1:1 décomp `sContestNames[]` (data/lilycove_lady.h:452, indexé
// CONTEST_CATEGORY_* global.h:86 = COOL 0/BEAUTY 1/CUTE 2/SMART 3/TOUGH 4)
// → gText_{Coolness,Beauty,Cuteness,Smartness,Toughness}Contest, strings FR
// décomp strings.c:616-620 (texte ROM FR cité ligne-par-ligne, PAS un enum
// dérivable → hardcode 1:1 documenté).
const sContestNames = [
  'SANG-FROID',   // [CONTEST_CATEGORY_COOL]   gText_CoolnessContest  strings.c:616
  'BEAUTE',       // [CONTEST_CATEGORY_BEAUTY] gText_BeautyContest    strings.c:617
  'GRACE',        // [CONTEST_CATEGORY_CUTE]   gText_CutenessContest  strings.c:618
  'INTELLIGENCE', // [CONTEST_CATEGORY_SMART]  gText_SmartnessContest strings.c:619
  'ROBUSTESSE',   // [CONTEST_CATEGORY_TOUGH]  gText_ToughnessContest strings.c:620
] as const;

// 1:1 décomp `ScrCmd_buffercontestname` (scrcmd.c:1635-1642).
// Mal classé auparavant dans _otherVmStubs (= no-op) alors que c'est un field
// scrcmd réel → {STR_VAR_N} restait vide dans les dialogs Contest.
registerOpcode('buffercontestname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  const category = parseValue(args[1]);
  setStringVar(n, sContestNames[category] ?? '');
  return false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « door » (ex src/engine/script/script-opcodes-door.ts)
// ═══════════════════════════════════════════════════════════════════════════
/** 1:1 décomp `sDoorAnimActive` (field_door.c interne, exposé via
 *  `IsDoorAnimationStopped`). True quand FieldAnimateDoorOpen/Close en cours. */
let _doorAnimActive = false;

// 1:1 décomp ScrCmd_opendoor (scrcmd.c:2050-2061) :
//   x = VarGet(ScriptReadHalfword(ctx));
//   y = VarGet(ScriptReadHalfword(ctx));
//   PlaySE(GetDoorSoundEffect(x, y));
//   FieldAnimateDoorOpen(x, y);   ← starts anim (= 16 frames)
//   return FALSE;  (= continue script immédiatement)
//
// `waitdooranim` ensuite halt le script jusqu'à anim fin via SetupNativeScript
// + IsDoorAnimationStopped (= `_doorAnimActive` polled).
registerOpcode('opendoor', (_ctx, args) => {
  const x = parseValue(args[0]);
  const y = parseValue(args[1]);
  void (async () => {
    try {
      const fdoor = await import('./field_door');
      const seId = fdoor.GetDoorSoundEffect(x, y);
      PlaySE(seId);
      _doorAnimActive = true;
      await fdoor.FieldAnimateDoorOpen(x, y);
      _doorAnimActive = false;
    } catch (e) {
      console.warn('[opcode opendoor] failed', e);
      _doorAnimActive = false;
    }
  })();
  return false;
});

// 1:1 décomp ScrCmd_closedoor (scrcmd.c:2062-2080) :
//   x = VarGet(ScriptReadHalfword(ctx));
//   y = VarGet(ScriptReadHalfword(ctx));
//   FieldAnimateDoorClose(x, y);
registerOpcode('closedoor', (_ctx, args) => {
  const x = parseValue(args[0]);
  const y = parseValue(args[1]);
  void (async () => {
    try {
      const fdoor = await import('./field_door');
      _doorAnimActive = true;
      await fdoor.FieldAnimateDoorClose(x, y);
      _doorAnimActive = false;
    } catch (e) {
      console.warn('[opcode closedoor] failed', e);
      _doorAnimActive = false;
    }
  })();
  return false;
});

// 1:1 décomp ScrCmd_waitdooranim (scrcmd.c:2081-2085) :
//   SetupNativeScript(IsDoorAnimationStopped).
// On poll _doorAnimActive jusqu'à false (= anim terminée). Si aucune anim
// n'a été démarrée par opendoor/closedoor (= behavior pas MB_ANIMATED_DOOR
// donc no-op), _doorAnimActive reste false → continue immédiatement.
registerOpcode('waitdooranim', (ctx) => {
  const tick = (): boolean => !_doorAnimActive;
  SetupNativeScript(ctx, tick);
  return true;
});

// 1:1 décomp ScrCmd_setdooropen (scrcmd.c:2087-2096) :
//   FieldSetDoorOpened(x, y) = instant draw open frame, no SE.
registerOpcode('setdooropen', (_ctx, args) => {
  const x = parseValue(args[0]);
  const y = parseValue(args[1]);
  void (async () => {
    try {
      const fdoor = await import('./field_door');
      await fdoor.FieldSetDoorOpened(x, y);
    } catch (e) { console.warn('[opcode setdooropen] failed', e); }
  })();
  return false;
});

// 1:1 décomp ScrCmd_setdoorclosed (scrcmd.c:2098-2108) :
//   FieldSetDoorClosed(x, y) = instant draw closed frame, no SE.
//   À porter 1:1 strict (= identique à setdooropen mais avec close frame).
registerOpcode('setdoorclosed', (_ctx, _args) => false);

// 1:1 décomp aliases naming variants — setdoor_opened/setdoor_closed sont des
// mêmes opcodes (= snake_case avec underscore) que setdooropen/setdoorclosed
// (= naming JSON extracteur).
registerOpcode('setdoor_opened', (ctx, args) => getOpcodeHandler('setdooropen')?.(ctx, args) ?? false);
registerOpcode('setdoor_closed', (ctx, args) => getOpcodeHandler('setdoorclosed')?.(ctx, args) ?? false);


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « fieldmap » (ex src/engine/script/script-opcodes-fieldmap.ts)
// ═══════════════════════════════════════════════════════════════════════════
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
    const ft = await import('./field_tasks');
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


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « warp » (ex src/engine/script/script-opcodes-warp.ts)
// ═══════════════════════════════════════════════════════════════════════════
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


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « sound » (ex src/engine/script/script-opcodes-sound.ts)
// ═══════════════════════════════════════════════════════════════════════════
registerOpcode('playse', (_ctx, args) => {
  // 1:1 décomp `ScrCmd_playse` (scrcmd.c) : PlaySE avec le SE constant string.
  // On lookup l'ID dans songs-data (= e.g. SE_LEDGE → 22).
  const seName = args[0] ?? '';
  const seId = (Songs as unknown as Record<string, number>)[seName];
  if (typeof seId === 'number') {
    PlaySE(seId);
  } else {
    console.warn(`[opcode playse] unknown SE '${seName}'`);
  }
  return false;
});

registerOpcode('playfanfare', (_ctx, args) => {
  // 1:1 décomp `ScrCmd_playfanfare` (scrcmd.c) :
  //   PlayFanfare(songNum); return FALSE;
  // PlayFanfare marque _audioEndTimeMs.fanfare = +3000ms → waitfanfare opcode
  // bloque jusqu'à fin (= "PLAYER reçoit STR_VAR_1!" tempo correct).
  const songName = args[0] ?? '';
  const songId = (Songs as unknown as Record<string, number>)[songName];
  if (typeof songId === 'number') {
    void import('../harness/runtime/decomp-globals').then(({ PlayFanfare }) => {
      PlayFanfare(songId);
    });
  } else {
    console.warn(`[opcode playfanfare] unknown fanfare '${songName}'`);
  }
  return false;
});

registerOpcode('waitfanfare', (ctx) => {
  // 1:1 décomp ScrCmd_waitfanfare (scrcmd.c:1187) :
  //   SetupNativeScript(ctx, WaitForFanfareFinish) ; return TRUE
  // WaitForFanfareFinish : return IsFanfareTaskInactive().
  const poll = (): boolean => {
    const dg = (globalThis as { __decompGlobals?: { IsFanfareTaskInactive?: () => boolean } }).__decompGlobals;
    return dg?.IsFanfareTaskInactive?.() ?? true;
  };
  SetupNativeScript(ctx, poll);
  return true;
});

/** 1:1 décomp `ScrCmd_playbgm` (scrcmd.c) : PlayBGM avec un song id + loop flag.
 *  Format args : args[0] = song name, args[1] = TRUE/FALSE for loop. */
registerOpcode('playbgm', (_ctx, args) => {
  const songName = args[0] ?? '';
  const songId = (Songs as unknown as Record<string, number>)[songName];
  if (typeof songId === 'number') {
    void import('../harness/runtime/decomp-globals').then(({ m4aSongNumStart }) => {
      m4aSongNumStart(songId, true);
    });
  } else {
    console.warn(`[opcode playbgm] unknown BGM '${songName}'`);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_savebgm` (scrcmd.c) :
 *    sSavedBgm = VarGet(arg);  // store song id for restore by fadedefaultbgm. */
let _savedBgmSongId = 0;
registerOpcode('savebgm', (_ctx, args) => {
  const songName = args[0] ?? '';
  const songId = (Songs as unknown as Record<string, number>)[songName];
  _savedBgmSongId = typeof songId === 'number' ? songId : VarGet(songName);
  return false;
});
void _savedBgmSongId;  // consumed by fadedefaultbgm (deferred lookup).

/** 1:1 décomp `ScrCmd_fadedefaultbgm` (scrcmd.c) :
 *    PlayNewMapMusic(GetCurrentMapMusic());  // restart map default BGM */
registerOpcode('fadedefaultbgm', (_ctx, _args) => {
  const mapMusic = gMapHeader?.music;
  let songId: number | undefined;
  if (typeof mapMusic === 'number' && mapMusic > 0) {
    songId = mapMusic;
  } else if (typeof mapMusic === 'string') {
    songId = (Songs as unknown as Record<string, number>)[mapMusic];
  }
  if (typeof songId === 'number' && songId > 0) {
    void import('../harness/runtime/decomp-globals').then(({ m4aSongNumStart }) => {
      m4aSongNumStart(songId!, true);
    });
  }
  return false;
});

/** 1:1 décomp `ScrCmd_fadenewbgm` (scrcmd.c) : fade to new BGM. */
registerOpcode('fadenewbgm', (_ctx, args) => {
  const songName = args[0] ?? '';
  const songId = (Songs as unknown as Record<string, number>)[songName];
  if (typeof songId === 'number') {
    void import('../harness/runtime/decomp-globals').then(({ m4aSongNumStart, FadeOutBGM }) => {
      FadeOutBGM(4);
      setTimeout(() => m4aSongNumStart(songId, true), 200);
    });
  }
  return false;
});

/** 1:1 décomp `ScrCmd_fadeoutbgm` (scrcmd.c) : fade out current BGM. */
registerOpcode('fadeoutbgm', (_ctx, args) => {
  const speed = parseInt(args[0] ?? '4', 10) || 4;
  void import('../harness/runtime/decomp-globals').then(({ FadeOutBGM }) => FadeOutBGM(speed));
  return false;
});

/** 1:1 décomp `ScrCmd_fadeinbgm` (scrcmd.c) : fade in current BGM. */
registerOpcode('fadeinbgm', (_ctx, args) => {
  const speed = parseInt(args[0] ?? '4', 10) || 4;
  void import('../harness/runtime/decomp-globals').then(({ FadeInBGM }) => FadeInBGM(speed));
  return false;
});

/** 1:1 décomp `ScrCmd_playmoncry` (scrcmd.c:2019-2027) : play Pokemon cry.
 *  Args : species (= "VAR_TEMP_1" ou "SPECIES_X"), mode (= 0 normal). */
registerOpcode('playmoncry', (_ctx, args) => {
  const speciesArg = args[0] ?? '';
  const speciesId = speciesArg.startsWith('VAR_') || speciesArg.startsWith('0x80')
    ? VarGet(speciesArg)
    : (resolveDecompConstant(speciesArg) ?? 0);
  void import('../harness/runtime/decomp-globals').then(({ PlayCryInternal }) => {
    PlayCryInternal(speciesId, 0, 64, 0, 0);
  }).catch(() => {});
  return false;
});

// ─── playsewithpan / loopsewithpan / waitse / waitplaysewithpan / waitmoncry ─

// 1:1 décomp scrcmd.c — alias to playse with stereo pan ignored (= we don't
// emulate stereo positioning). 1746x usage in scripts.
registerOpcode('playsewithpan', (_ctx, args) => {
  const seName = args[0] ?? '';
  const seId = (Songs as unknown as Record<string, number>)[seName];
  if (typeof seId === 'number') PlaySE(seId);
  return false;
});

// 1:1 décomp `ScrCmd_loopsewithpan` — looped SE. Same as playsewithpan for
// stub purpose. 194x usage.
registerOpcode('loopsewithpan', (_ctx, args) => {
  const seName = args[0] ?? '';
  const seId = (Songs as unknown as Record<string, number>)[seName];
  if (typeof seId === 'number') PlaySE(seId);
  return false;
});

// `waitse` — stub early enregistré pour overwrite par real impl ci-dessous.
registerOpcode('waitse', (_ctx) => false);

// `waitplaysewithpan` — stub early.
registerOpcode('waitplaysewithpan', (_ctx) => false);

registerOpcode('waitse', (ctx, _args) => {
  // 1:1 décomp ScrCmd_waitse (scrcmd.c:1162) :
  //   SetupNativeScript(ctx, WaitForSoundEffectFinish) ; return TRUE
  // WaitForSoundEffectFinish : return !IsSEPlaying().
  const poll = (): boolean => {
    const dg = (globalThis as { __decompGlobals?: { IsSEPlaying?: () => boolean } }).__decompGlobals;
    return !(dg?.IsSEPlaying?.() ?? false);  // poll returns TRUE when SE done
  };
  SetupNativeScript(ctx, poll);
  return true;
});

registerOpcode('waitplaysewithpan', (ctx, _args) => {
  // 1:1 décomp : alias de waitse (le 'pan' = stéréo, n'affecte pas le tracking).
  return getOpcodeHandler('waitse')?.(ctx, []) ?? false;
});

registerOpcode('waitmoncry', (ctx, _args) => {
  // 1:1 décomp ScrCmd_waitmoncry (scrcmd.c:1610) :
  //   SetupNativeScript(ctx, IsCryFinished) ; return TRUE
  // IsCryFinished : returns !IsCryPlaying.
  const poll = (): boolean => {
    const dg = (globalThis as { __decompGlobals?: { IsCryFinished?: () => boolean } }).__decompGlobals;
    return dg?.IsCryFinished?.() ?? true;  // poll returns TRUE when cry done
  };
  SetupNativeScript(ctx, poll);
  return true;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « decoration » (ex src/engine/script/script-opcodes-decoration.ts)
// ═══════════════════════════════════════════════════════════════════════════
/** _vget = VarGet avec fallback '0'. Local au fichier (= 1:1 décomp inline read). */


/** Decorations dans le SaveBlock1. 1:1 décomp gSaveBlock1Ptr->decorations[]. */
function _decorationsArr(): number[] {
  if (!gSaveBlock1Ptr) return [];
  if (!gSaveBlock1Ptr.decorations) gSaveBlock1Ptr.decorations = [];
  return gSaveBlock1Ptr.decorations;
}

// 1:1 décomp ScrCmd_adddecoration (scrcmd.c:549-555) :
//   gSpecialVar_Result = DecorationAdd(decorId).
registerOpcode('adddecoration', (_ctx, args) => {
  const decorId = _vget(args[0]);
  const arr = _decorationsArr();
  if (arr.length < 256) {
    arr.push(decorId);
    VarSet('VAR_RESULT', 1);
  } else {
    VarSet('VAR_RESULT', 0);
  }
  return false;
});

// 1:1 décomp macro `givedecoration decoration` (event.inc:1960) :
//   setorcopyvar VAR_0x8000, decoration ; callstd STD_OBTAIN_DECORATION.
// STD_OBTAIN_DECORATION = adddecoration + obtained msg.
registerOpcode('givedecoration', (_ctx, args) => {
  return getOpcodeHandler('adddecoration')?.(_ctx, args) ?? false;
});

// 1:1 décomp ScrCmd_removedecoration (scrcmd.c:557-563) :
//   gSpecialVar_Result = DecorationRemove(decorId).
registerOpcode('takedecoration', (_ctx, args) => {
  const decorId = _vget(args[0]);
  const arr = _decorationsArr();
  const idx = arr.indexOf(decorId);
  if (idx >= 0) {
    arr.splice(idx, 1);
    VarSet('VAR_RESULT', 1);
  } else {
    VarSet('VAR_RESULT', 0);
  }
  return false;
});

// `removedecoration` — alias takedecoration (= naming variant des scripts JSON).
registerOpcode('removedecoration', (_ctx, args) => {
  return getOpcodeHandler('takedecoration')?.(_ctx, args) ?? false;
});

// 1:1 décomp ScrCmd_checkdecor (scrcmd.c:573-579) :
//   gSpecialVar_Result = CheckHasDecoration(decorId).
registerOpcode('checkdecor', (_ctx, args) => {
  const decorId = _vget(args[0]);
  const arr = _decorationsArr();
  VarSet('VAR_RESULT', arr.includes(decorId) ? 1 : 0);
  return false;
});

// 1:1 décomp ScrCmd_checkdecorspace (scrcmd.c:565-571) :
//   gSpecialVar_Result = DecorationCheckSpace(decorId).
registerOpcode('checkdecorspace', (_ctx, args) => {
  const _decorId = _vget(args[0]);
  void _decorId;
  const arr = _decorationsArr();
  VarSet('VAR_RESULT', arr.length < 256 ? 1 : 0);
  return false;
});

// `movedecoration` — RS-era opcode, non-functional dans Em (= retiré du décomp Em).
registerOpcode('movedecoration', (_ctx, _args) => {
  return false;
});

// 1:1 décomp ScrCmd_bufferdecorationname (scrcmd.c:1598-1605) :
//   StringCopy(sScriptStringVars[stringVarIndex], gDecorations[decorId].name).
// Notre port : strip prefix DECOR_ pour récupérer le nom (= post-MVP, lookup
// dans gDecorations[] data à porter en session dédiée).
registerOpcode('bufferdecorationname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  setStringVar(n, args[1]?.replace(/^DECOR_/, '') ?? '');
  return false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « money-coins » (ex src/engine/script/script-opcodes-money-coins.ts)
// ═══════════════════════════════════════════════════════════════════════════
/** Alias non-canonique « givecoins » (la macro canonique = `addcoins`, cf. plus
 *  bas). Délègue à `AddCoins` 1:1 (coins.c) = même résultat que l'ancien
 *  `Math.min(MAX_COINS, …)`, sans toucher VAR_RESULT (contrat « give »). */
registerOpcode('givecoins', (_ctx, args) => {
  const amount = VarGet(args[0] ?? '0');
  AddCoins(amount);
  return false;
});

/** 1:1 décomp macro `givemoney value` (event.inc) : AddMoney(&money, value). */
registerOpcode('givemoney', (_ctx, args) => {
  const amount = VarGet(args[0] ?? '0');
  if (gSaveBlock1Ptr) {
    gSaveBlock1Ptr.money = Math.min(999999, (gSaveBlock1Ptr.money ?? 0) + amount);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_addmoney` (scrcmd.c:1733-1741) :
 *    amount = ScriptReadWord ; disable = ScriptReadByte ;
 *    if (!disable) AddMoney(&money, amount);
 *  AddMoney cap MAX_MONEY=999999 (= 1:1 décomp money.c). */
registerOpcode('addmoney', (_ctx, args) => {
  const amount = VarGet(args[0] ?? '0');
  const ignore = VarGet(args[1] ?? '0');
  if (!ignore) {
    if (gSaveBlock1Ptr) gSaveBlock1Ptr.money = Math.min(999999, (gSaveBlock1Ptr.money ?? 0) + amount);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_takemoney` (scrcmd.c:1743-1751) :
 *    RemoveMoney(&money, amount).  // sub from money, floor 0. */
registerOpcode('takemoney', (_ctx, args) => {
  const amount = VarGet(args[0] ?? '0');
  if (gSaveBlock1Ptr) {
    gSaveBlock1Ptr.money = Math.max(0, (gSaveBlock1Ptr.money ?? 0) - amount);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_checkmoney` (scrcmd.c:1753-1761) :
 *    gSpecialVar_Result = IsEnoughMoney(&money, amount). */
registerOpcode('checkmoney', (_ctx, args) => {
  const amount = VarGet(args[0] ?? '0');
  const has = (gSaveBlock1Ptr?.money ?? 0) >= amount;
  VarSet('VAR_RESULT', has ? 1 : 0);
  return false;
});

/** 1:1 décomp `ScrCmd_checkcoins` (scrcmd.c:2129-2134) :
 *    u16 *ptr = GetVarPointer(ScriptReadHalfword(ctx)); *ptr = GetCoins();
 *  Le résultat va dans la VAR passée en arg, pas VAR_RESULT. */
registerOpcode('checkcoins', (_ctx, args) => {
  const coins = GetCoins();
  const dst = args[0] ?? 'VAR_RESULT';
  if (dst.startsWith('VAR_')) VarSet(dst, coins);
  else VarSet('VAR_RESULT', coins);
  return false;
});

/** 1:1 décomp `ScrCmd_takecoins` (scrcmd.c) :
 *    SubtractCoins(VarGet(amount));  // gSaveBlock1Ptr.coins -= amount, floor 0. */
registerOpcode('takecoins', (_ctx, args) => {
  const amount = VarGet(args[0] ?? '0');
  if (gSaveBlock1Ptr) gSaveBlock1Ptr.coins = Math.max(0, (gSaveBlock1Ptr.coins ?? 0) - amount);
  return false;
});

/** 1:1 décomp `ScrCmd_addcoins` (scrcmd.c:2136-2145) :
 *    u16 coins = VarGet(ScriptReadHalfword(ctx));
 *    if (AddCoins(coins) == TRUE) gSpecialVar_Result = FALSE;
 *    else                          gSpecialVar_Result = TRUE;
 *  (= VAR_RESULT = !succès ; le cap MAX_COINS + le retour bool sont dans
 *  `AddCoins` 1:1, coins.c:57-77). */
registerOpcode('addcoins', (_ctx, args) => {
  const count = VarGet(args[0] ?? '0');
  VarSet('VAR_RESULT', AddCoins(count) ? 0 : 1);
  return false;
});

/** 1:1 décomp `ScrCmd_removemoney` (scrcmd.c:1743) : alias de takemoney. */
registerOpcode('removemoney', (ctx, args) => {
  return getOpcodeHandler('takemoney')?.(ctx, args) ?? false;
});

/** 1:1 décomp `ScrCmd_removecoins` (scrcmd.c:2147-2156) :
 *    u16 coins = VarGet(ScriptReadHalfword(ctx));
 *    if (RemoveCoins(coins) == TRUE) gSpecialVar_Result = FALSE;
 *    else                             gSpecialVar_Result = TRUE;
 *  (= VAR_RESULT = TRUE si remove a échoué, FALSE si succès). */
registerOpcode('removecoins', (_ctx, args) => {
  const count = VarGet(args[0] ?? '0');
  VarSet('VAR_RESULT', RemoveCoins(count) ? 0 : 1);
  return false;
});

// ─── Money/Coins box UI ─────────────────────────────────────────────────────

/** 1:1 décomp `ScrCmd_showmoneybox` (scrcmd.c:1763-1772) :
 *    if (!ignore) DrawMoneyBox(GetMoney(&money), x, y). */
registerOpcode('showmoneybox', (_ctx, args) => {
  const x = parseValue(args[0] ?? '0');
  const y = parseValue(args[1] ?? '0');
  const ignore = parseValue(args[2] ?? '0');
  if (ignore) return false;
  void (async () => {
    const ui = (globalThis as { __moneyBoxUI?: { DrawMoneyBox?: (amt: number, x: number, y: number) => void; _getMoney?: () => number } }).__moneyBoxUI;
    if (ui?.DrawMoneyBox && ui._getMoney) ui.DrawMoneyBox(ui._getMoney(), x, y);
  })();
  return false;
});

/** 1:1 décomp `ScrCmd_hidemoneybox` (scrcmd.c:1774-1781) :
 *    HideMoneyBox(). */
registerOpcode('hidemoneybox', (_ctx, _args) => {
  void (async () => {
    const ui = (globalThis as { __moneyBoxUI?: { HideMoneyBox?: () => void } }).__moneyBoxUI;
    ui?.HideMoneyBox?.();
  })();
  return false;
});

/** 1:1 décomp `ScrCmd_updatemoneybox` (scrcmd.c:1783-1792) :
 *    if (!ignore) ChangeAmountInMoneyBox(GetMoney(&money)). */
registerOpcode('updatemoneybox', (_ctx, args) => {
  const _x = parseValue(args[0] ?? '0');
  const _y = parseValue(args[1] ?? '0');
  const ignore = parseValue(args[2] ?? '0');
  void _x; void _y;
  if (ignore) return false;
  void (async () => {
    const ui = (globalThis as { __moneyBoxUI?: { ChangeAmountInMoneyBox?: (amt: number) => void; _getMoney?: () => number } }).__moneyBoxUI;
    if (ui?.ChangeAmountInMoneyBox && ui._getMoney) ui.ChangeAmountInMoneyBox(ui._getMoney());
  })();
  return false;
});

/** 1:1 décomp `ScrCmd_showcoinsbox` (scrcmd.c:1794-1801) :
 *    ShowCoinsWindow(GetCoins(), x, y). */
registerOpcode('showcoinsbox', (_ctx, args) => {
  const x = parseValue(args[0] ?? '0');
  const y = parseValue(args[1] ?? '0');
  void (async () => {
    const ui = (globalThis as { __moneyBoxUI?: { ShowCoinsWindow?: (amt: number, x: number, y: number) => void; _getCoins?: () => number } }).__moneyBoxUI;
    if (ui?.ShowCoinsWindow && ui._getCoins) ui.ShowCoinsWindow(ui._getCoins(), x, y);
  })();
  return false;
});

/** 1:1 décomp `ScrCmd_hidecoinsbox` (scrcmd.c:1803-1810) :
 *    HideCoinsWindow(). */
registerOpcode('hidecoinsbox', (_ctx, _args) => {
  void (async () => {
    const ui = (globalThis as { __moneyBoxUI?: { HideCoinsWindow?: () => void } }).__moneyBoxUI;
    ui?.HideCoinsWindow?.();
  })();
  return false;
});

/** 1:1 décomp `ScrCmd_updatecoinsbox` (scrcmd.c:1812-1819) :
 *    PrintCoinsString(GetCoins()). */
registerOpcode('updatecoinsbox', (_ctx, _args) => {
  void (async () => {
    const ui = (globalThis as { __moneyBoxUI?: { PrintCoinsString?: (amt: number) => void; _getCoins?: () => number } }).__moneyBoxUI;
    if (ui?.PrintCoinsString && ui._getCoins) ui.PrintCoinsString(ui._getCoins());
  })();
  return false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « item » (ex src/engine/script/script-opcodes-item.ts)
// ═══════════════════════════════════════════════════════════════════════════
/** 1:1 décomp `giveitem` macro = additem + msgbox + fanfare. On ne porte que
 *  additem (= les msgbox+fanfare sont déjà dans le script appelant). */
registerOpcode('giveitem', (_ctx, args) => {
  const itemKey = args[0] ?? '';
  const count = resolveCount(args[1] ?? '1');
  const ok = AddBagItem(itemKey, count);
  VarSet('VAR_RESULT', ok ? 1 : 0);
  console.log(`[opcode giveitem] ${itemKey} x${count} → ${ok ? 'ok' : 'failed'}`);
  return false;
});

/** 1:1 décomp `ScrCmd_additem` (scrcmd.c:487-494).
 *    `additem ITEMID, QUANTITY` → AddBagItem + set gSpecialVar_Result. */
registerOpcode('additem', (_ctx, args) => {
  const itemKey = args[0] ?? '';
  const count = resolveCount(args[1] ?? '1');
  const ok = AddBagItem(itemKey, count);
  // 1:1 décomp : gSpecialVar_Result = AddBagItem(...). On set VAR_RESULT.
  VarSet('VAR_RESULT', ok ? 1 : 0);
  console.log(`[opcode additem] ${itemKey} x${count} → ${ok ? 'ok' : 'FAILED (bag full?)'}`);
  return false;
});

/** 1:1 décomp `ScrCmd_removeitem` (scrcmd.c:496-503). L'item peut être un literal
 *  `ITEM_X` OU une var (`removeitem VAR_ITEM_ID` = la baie choisie via Bag_ChooseBerry)
 *  → résoudre VAR→id→itemKey (même pattern que checkitemspace/checkitemtype). */
registerOpcode('removeitem', (_ctx, args) => {
  const itemArg = args[0] ?? '';
  const count = resolveCount(args[1] ?? '1');
  let itemKey = itemArg;
  if (!itemKey.startsWith('ITEM_')) {
    const itemId = VarGet(itemArg);
    itemKey = reverseDecompConstant(itemId, 'ITEM_') ?? '';
  }
  const ok = RemoveBagItem(itemKey, count);
  VarSet('VAR_RESULT', ok ? 1 : 0);
  console.log(`[opcode removeitem] ${itemArg} (${itemKey}) x${count} → ${ok ? 'ok' : 'FAILED (not enough)'}`);
  return false;
});

/** 1:1 décomp `ScrCmd_checkitem` (scrcmd.c:514-521) : true si bag has au moins count. */
registerOpcode('checkitem', (_ctx, args) => {
  const itemKey = args[0] ?? '';
  const count = resolveCount(args[1] ?? '1');
  VarSet('VAR_RESULT', CheckBagHasItem(itemKey, count) ? 1 : 0);
  return false;
});

/** 1:1 décomp `ScrCmd_checkitemspace` (scrcmd.c:505-512) :
 *    gSpecialVar_Result = CheckBagHasSpace(item, qty);
 *  CheckBagHasSpace porté 1:1 item.c:179 dans bag.ts. */
registerOpcode('checkitemspace', (_ctx, args) => {
  const itemArg = args[0] ?? '';
  const count = resolveCount(args[1] ?? '1');
  // Resolve itemArg → itemKey (= si VAR_X, lookup vers ITEM_X).
  let itemKey = itemArg;
  if (!itemKey.startsWith('ITEM_')) {
    const itemId = VarGet(itemArg);
    itemKey = reverseDecompConstant(itemId, 'ITEM_') ?? '';
  }
  VarSet('VAR_RESULT', CheckBagHasSpace(itemKey, count) ? 1 : 0);
  return false;
});

/** 1:1 décomp `ScrCmd_checkitemtype` (scrcmd.c:523-529) :
 *    gSpecialVar_Result = GetPocketByItemId(itemId);
 *  Source POCKET_* enum (item.h:5-10) — 1-based :
 *    POCKET_NONE=0, POCKET_ITEMS=1, POCKET_POKE_BALLS=2, POCKET_TM_HM=3,
 *    POCKET_BERRIES=4, POCKET_KEY_ITEMS=5. */
registerOpcode('checkitemtype', (_ctx, args) => {
  const itemArg = args[0] ?? '';
  // Resolve itemArg : si literal ITEM_X → direct itemKey ; sinon VarGet → reverseDecompConstant.
  let itemKey = itemArg;
  if (!itemKey.startsWith('ITEM_')) {
    const itemId = VarGet(itemArg);
    itemKey = reverseDecompConstant(itemId, 'ITEM_') ?? '';
  }
  let pocketResult = 0;  // POCKET_NONE par défaut
  if (itemKey) {
    const item = getItem(itemKey);
    if (item && item.pocket) {
      // 1:1 mapping items.json pocket string → POCKET_* enum 1-based (item.h:5-10).
      switch (item.pocket) {
        case 'POCKET_ITEMS':       pocketResult = 1; break;
        case 'POCKET_POKE_BALLS':  pocketResult = 2; break;
        case 'POCKET_TM_HM':       pocketResult = 3; break;
        case 'POCKET_BERRIES':     pocketResult = 4; break;
        case 'POCKET_KEY_ITEMS':   pocketResult = 5; break;
        // POCKET_NONE → 0 (= default)
      }
    }
  }
  VarSet('VAR_RESULT', pocketResult);
  return false;
});

/** 1:1 décomp `ScrCmd_finditem` (= bspecialvar field_specials.c) :
 *    itemId = VarGet(args[0]);
 *    amount = VarGet(args[1]);
 *    if (AddBagItem(itemId, amount)) gSpecialVar_Result = 0;
 *    else gSpecialVar_Result = 1;  // bag full
 *
 *  Audit session 126 LOT D4 : avant stub, maintenant vraie impl. Le UI
 *  "X obtained!" + SE_PIN est handled par le script qui appelle finditem. */
registerOpcode('finditem', (_ctx, args) => {
  const itemArg = args[0] ?? '';
  const amount = parseValue(args[1] ?? '1') || 1;
  // Resolve itemId : si literal ITEM_X → resolveDecompConstant ; sinon VarGet.
  let itemId = 0;
  if (itemArg.startsWith('ITEM_')) {
    itemId = resolveDecompConstant(itemArg) ?? 0;
  } else {
    itemId = VarGet(itemArg);
  }
  if (itemId > 0 && AddBagItem(itemArg, amount)) {
    gSpecialVar.Result = 0;  // success
  } else {
    gSpecialVar.Result = 1;  // bag full / invalid
  }
  return false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « rtc-clock » (ex src/engine/script/script-opcodes-rtc-clock.ts)
// ═══════════════════════════════════════════════════════════════════════════
// 1:1 décomp `ScrCmd_delay` (scrcmd.c:674-679) :
//   SetupNativeScript(ctx, IsPauseTimerFinished); return TRUE;
// IsPauseTimerFinished : décrémente sPauseCounter, return !sPauseCounter.
registerOpcode('delay', (ctx, args) => {
  let frames = parseValue(args[0]);
  const tick = (): boolean => {
    if (frames <= 0) return true;
    frames--;
    return false;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

// 1:1 décomp `ScrCmd_pause` — alternate name for delay (= same arg semantic).
registerOpcode('pause', (ctx, args) => {
  let frames = parseValue(args[0]);
  const tick = (): boolean => {
    if (frames <= 0) return true;
    frames--;
    return false;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

/** 1:1 décomp `ScrCmd_gettime` (scrcmd.c:696-703) :
 *  ```c
 *  bool8 ScrCmd_gettime(struct ScriptContext *ctx) {
 *      RtcCalcLocalTime();
 *      gSpecialVar_0x8000 = gLocalTime.hours;
 *      gSpecialVar_0x8001 = gLocalTime.minutes;
 *      gSpecialVar_0x8002 = gLocalTime.seconds;
 *      return FALSE;
 *  }
 *  ```
 *  Notre `RtcCalcLocalTime` source-of-truth = `Date.now() + offsetMs` (cf. rtc.ts). */
registerOpcode('gettime', () => {
  RtcCalcLocalTime();
  VarSet('VAR_0x8000', gLocalTime.hours);
  VarSet('VAR_0x8001', gLocalTime.minutes);
  VarSet('VAR_0x8002', gLocalTime.seconds);
  return false;
});

/** 1:1 décomp `ScrCmd_initclock` (scrcmd.c:681-688) :
 *    RtcInitLocalTimeOffset(VarGet(hour), VarGet(minute));
 *  Set l'heure in-game initiale (= new-game / wall-clock confirm). */
registerOpcode('initclock', (_ctx, args) => {
  const hour = VarGet(args[0] ?? '0');
  const minute = VarGet(args[1] ?? '0');
  RtcInitLocalTimeOffset(hour, minute);
  return false;
});

/** 1:1 décomp `ScrCmd_dotimebasedevents` (scrcmd.c:690-694) :
 *    DoTimeBasedEvents();
 *  Trigger berry growth + tide cycle + Shoal Cave water level + etc.
 *  Session 132 : real impl via time-based-events.ts (= berry growth math
 *  1:1 décomp berry.c:BerryTreeTimeUpdate using RTC minutes delta). */
registerOpcode('dotimebasedevents', (_ctx, _args) => {
  void (async () => {
    try {
      const { DoTimeBasedEvents } = await import('./clock');
      DoTimeBasedEvents();
    } catch (e) {
      console.warn('[opcode dotimebasedevents] failed:', e);
    }
  })();
  return false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « player-avatar » (ex src/engine/script/script-opcodes-player-avatar.ts)
// ═══════════════════════════════════════════════════════════════════════════
// 1:1 décomp `ScrCmd_checkplayergender` (scrcmd.c:2013-2017) :
//   gSpecialVar_Result = gSaveBlock2Ptr->playerGender.
// MALE=0, FEMALE=1 (= include/constants/global.h).
registerOpcode('checkplayergender', (_ctx, _args) => {
  gSpecialVar.Result = gPlayerAvatar.gender === 'MALE' ? MALE_GENDER : FEMALE_GENDER;
  return false;
});

// 1:1 décomp `ScrCmd_setobjectinvisibility` (scrcmd.c) avec localId not LOCALID_PLAYER :
//   SetObjectInvisibility(localId, ..., TRUE).
registerOpcode('hideobject', (_ctx, args) => {
  const localIdRaw = args[0] ?? '';
  const npc = gObjectEvents.find(n => n.active && n.localIdRaw === localIdRaw);
  if (npc) npc.invisible = true;
  return false;
});

// 1:1 décomp `ScrCmd_setobjectinvisibility` avec FALSE :
//   SetObjectInvisibility(localId, ..., FALSE).
registerOpcode('showobject', (_ctx, args) => {
  const localIdRaw = args[0] ?? '';
  const npc = gObjectEvents.find(n => n.active && n.localIdRaw === localIdRaw);
  if (npc) npc.invisible = false;
  return false;
});

// 1:1 STRICT décomp `SetPlayerInvisibility(TRUE)` (field_player_avatar.c:1396) via
// le mnémonique `hideplayer` (= SCR_OP_HIDEOBJECTAT avec LOCALID_PLAYER) :
//   gObjectEvents[gPlayerAvatar.objectEventId].invisible = TRUE;
// ⚠️ FIX : on set le SLOT object-event, PAS le sprite. Depuis l'unification M3, le sprite
// joueur appartient au slot et UpdateObjectEvents resync `slot.invisible → sprite.invisible`
// CHAQUE frame → cacher le sprite directement était écrasé au frame suivant. Symptôme :
// le joueur ne disparaissait PAS dans la porte lors de l'entrée auto scriptée (GoInsideWithMom
// → applymovement PlayerEnterHouse puis `hideplayer`). Identique au fix SetPlayerVisibility.
// Cohérent avec hideobject/showobject ci-dessus (qui set déjà npc.invisible sur le slot).
registerOpcode('hideplayer', (_ctx) => {
  const slot = gObjectEvents[gPlayerAvatar.objectEventId];
  if (slot) slot.invisible = true;
  return false;
});

/** 1:1 décomp `ScrCmd_showobjectat` via le mnémonique `showplayer`
 *  (= SCR_OP_SHOWOBJECTAT avec LOCALID_PLAYER) : SetPlayerInvisibility(FALSE).
 *  Miroir exact de `hideplayer` — set le SLOT (cf. note ci-dessus). */
registerOpcode('showplayer', (_ctx) => {
  const slot = gObjectEvents[gPlayerAvatar.objectEventId];
  if (slot) slot.invisible = false;
  return false;
});

// 1:1 décomp `ScrCmd_getplayerxy` (scrcmd.c:887-895) — read player current XY into
// provided var pointers. Used in scripts qui ont besoin de la position player
// (= e.g. Rusturf Tunnel cave-in cinematic).
registerOpcode('getplayerxy', (_ctx, args) => {
  const xVar = args[0] ?? '';
  const yVar = args[1] ?? '';
  if (xVar) VarSet(xVar, GetCurrentMap()?.x ?? 0);
  if (yVar) VarSet(yVar, GetCurrentMap()?.y ?? 0);
  return false;
});

// 1:1 décomp `ScrCmd_getpartysize` (scrcmd.c:897-901) — read partySize into VAR_RESULT.
registerOpcode('getpartysize', (_ctx) => {
  VarSet('VAR_RESULT', gSaveBlock1Ptr.playerPartyCount);
  return false;
});

// `countpokemon` alias de getpartysize (= naming variant des scripts JSON).
registerOpcode('countpokemon', (_ctx) => {
  VarSet('VAR_RESULT', gSaveBlock1Ptr.playerPartyCount);
  return false;
});

// 1:1 STRICT décomp `ScrCmd_checkpartymove` (scrcmd.c:1712-1731) :
//   gSpecialVar_Result = PARTY_SIZE;
//   for (i = 0; i < PARTY_SIZE; i++) {
//       species = GetMonData(&gPlayerParty[i], MON_DATA_SPECIES);
//       if (!species) break;
//       if (!GetMonData(&gPlayerParty[i], MON_DATA_IS_EGG) && MonKnowsMove(&gPlayerParty[i], move)) {
//           gSpecialVar_Result = i; gSpecialVar_0x8004 = species; break;
//       }
//   }
// Le move arg est une halfword (enum décomp 'MOVE_*' → id numérique). VAR_RESULT = slot du 1er mon
// (non-œuf) qui connaît le move, ou PARTY_SIZE si aucun. Utilisé par les scripts de field move
// (EventScript_UseSurf/Cut/Fly/Strength/RockSmash…) pour choisir le mon + gater l'usage.
registerOpcode('checkpartymove', (_ctx, args) => {
  const move = resolveDecompConstant(args[0] ?? 'MOVE_NONE') ?? 0;
  const PARTY_SIZE = 6;
  let result = PARTY_SIZE;
  let species0x8004 = 0;
  for (let i = 0; i < PARTY_SIZE; i++) {
    const species = GetMonData(gPlayerParty[i], MON_DATA_SPECIES);
    if (!species) break;  // slot vide → fin de party
    if (!GetMonData(gPlayerParty[i], MON_DATA_IS_EGG) && MonKnowsMove(gPlayerParty[i], move)) {
      result = i;
      species0x8004 = typeof species === 'number' ? species : 0;
      break;
    }
  }
  VarSet('VAR_RESULT', result);
  VarSet('VAR_0x8004', species0x8004);
  return false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « string » (ex src/engine/script/script-opcodes-string.ts)
// ═══════════════════════════════════════════════════════════════════════════
/** 1:1 décomp `ScrCmd_bufferspeciesname` (scrcmd.c) :
 *    StringCopy(sScriptStringVars[N], gSpeciesNames[VarGet(species)]); */
registerOpcode('bufferspeciesname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  let speciesName = args[1] || '';
  if (!speciesName.startsWith('SPECIES_')) {
    const num = VarGet(args[1] || '');
    speciesName = reverseDecompConstant(num, 'SPECIES_') ?? `SPECIES_${num}`;
  }
  setStringVar(n, getSpeciesNameFr(speciesName));
  return false;
});

/** 1:1 décomp `ScrCmd_bufferleadmonspeciesname` (scrcmd.c) :
 *    species = GetMonData(&gPlayerParty[GetLeadMonIndex()], MON_DATA_SPECIES);
 *    StringCopy(dest, gSpeciesNames[species]); */
registerOpcode('bufferleadmonspeciesname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  const lead = gSaveBlock1Ptr.playerParty?.[0];
  const speciesName = lead?.speciesNameFr ?? (lead?.speciesEnum ? getSpeciesNameFr(lead.speciesEnum) : '');
  setStringVar(n, speciesName);
  return false;
});

/** 1:1 décomp `ScrCmd_buffertrainerclassname` (scrcmd.c:2272-2279) :
 *    StringCopy(sScriptStringVars[N], gTrainerClasses[VarGet(trainerId)].className). */
registerOpcode('buffertrainerclassname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  const t = getTrainer(args[1] || '');
  setStringVar(n, t ? getTrainerClassNameFr(t.trainerClass) : '');
  return false;
});

/** 1:1 décomp `ScrCmd_buffertrainername` (scrcmd.c:2281-2293) :
 *    StringCopy(sScriptStringVars[N], gTrainers[VarGet(trainerId)].trainerName). */
registerOpcode('buffertrainername', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  setStringVar(n, getTrainerNameFr(args[1] || ''));
  return false;
});

/** 1:1 décomp `ScrCmd_bufferpartymonnick` (scrcmd.c) :
 *    GetMonData(&gPlayerParty[VarGet(slot)], MON_DATA_NICKNAME, dest); */
registerOpcode('bufferpartymonnick', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  const slot = Math.max(0, Math.min(5, parseValue(args[1] || '0')));
  const mon = gSaveBlock1Ptr.playerParty?.[slot];
  setStringVar(n, mon?.nickname || mon?.speciesNameFr || '');
  return false;
});

/** 1:1 décomp `ScrCmd_bufferitemname` (scrcmd.c) :
 *    StringCopy(sScriptStringVars[N], gItems[VarGet(item)].name). */
registerOpcode('bufferitemname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  let itemName = args[1] || '';
  if (!itemName.startsWith('ITEM_')) {
    const num = VarGet(args[1] || '');
    itemName = reverseDecompConstant(num, 'ITEM_') ?? `ITEM_${num}`;
  }
  setStringVar(n, getItemNameFr(itemName));
  return false;
});

/** 1:1 décomp `ScrCmd_bufferitemnameplural` (scrcmd.c) :
 *    Si qty > 1 → utilise StringAppend (gString_s).
 *    Sinon → StringCopy gItems[item].name. */
registerOpcode('bufferitemnameplural', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  let itemName = args[1] || '';
  if (!itemName.startsWith('ITEM_')) {
    const num = VarGet(args[1] || '');
    itemName = reverseDecompConstant(num, 'ITEM_') ?? `ITEM_${num}`;
  }
  const qty = parseValue(args[2] || '0');
  const name = getItemNameFr(itemName);
  setStringVar(n, qty > 1 ? name + 's' : name);
  return false;
});

/** 1:1 décomp `ScrCmd_buffermovename` (scrcmd.c) :
 *    StringCopy(sScriptStringVars[N], gMoveNames[VarGet(move)]). */
registerOpcode('buffermovename', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  let moveName = args[1] || '';
  if (!moveName.startsWith('MOVE_')) {
    const num = VarGet(args[1] || '');
    moveName = reverseDecompConstant(num, 'MOVE_') ?? `MOVE_${num}`;
  }
  setStringVar(n, getMoveNameFr(moveName));
  return false;
});

/** Alias de `buffermovename` — macro user-level. */
registerOpcode('bufferattackname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  let moveName = args[1] || '';
  if (!moveName.startsWith('MOVE_')) {
    const num = VarGet(args[1] || '');
    moveName = reverseDecompConstant(num, 'MOVE_') ?? `MOVE_${num}`;
  }
  setStringVar(n, getMoveNameFr(moveName));
  return false;
});

/** 1:1 décomp `ScrCmd_buffernumberstring` (scrcmd.c) :
 *    ConvertIntToDecimalStringN(sScriptStringVars[N], VarGet(num), STR_CONV_MODE_LEFT_ALIGN, 5). */
registerOpcode('buffernumberstring', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  setStringVar(n, String(parseValue(args[1] || '0')));
  return false;
});

/** Macro user-level — buffer money amount (= number + $). */
registerOpcode('buffermoneyamount', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  const amount = parseValue(args[1] || '0');
  setStringVar(n, String(amount) + '$');
  return false;
});

/** 1:1 décomp `ScrCmd_bufferstdstring` (scrcmd.c) :
 *    StringCopy(sScriptStringVars[N], gStdStrings[VarGet(id)]). */
registerOpcode('bufferstdstring', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  // Pas de table std strings extraite — fallback vide pour ne pas afficher
  // `{STR_VAR_N}` brut dans les dialogs.
  setStringVar(n, '');
  void args;
  return false;
});

/** 1:1 décomp `ScrCmd_bufferstring` (scrcmd.c) :
 *    StringCopy(sScriptStringVars[N], ptr). */
registerOpcode('bufferstring', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  // Texte direct entre guillemets — extraire (peut contenir des espaces).
  const txt = (args.slice(1).join(' ') || '').replace(/^"/, '').replace(/"$/, '');
  setStringVar(n, txt);
  return false;
});

/** 1:1 décomp `ScrCmd_bufferboxname` (scrcmd.c:1672-1679) :
 *    GetBoxNamePtr(VarGet(boxId), dest). */
registerOpcode('bufferboxname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  setStringVar(n, '');
  void args;
  return false;
});

// RS-era opcodes (= retirés du décomp Em) :
registerOpcode('preparemsg', (_ctx, _args) => false);
registerOpcode('vbuffer', (_ctx, _args) => false);

/** 1:1 décomp `ScrCmd_vbufferstring` (scrcmd.c) :
 *    Alias de bufferstring (multi-lang variant). */
registerOpcode('vbufferstring', (ctx, args) => getOpcodeHandler('bufferstring')?.(ctx, args) ?? false);

/** 1:1 décomp `ScrCmd_vbuffermessage` (scrcmd.c) :
 *    Alias de bufferstring (= multi-lang resolve). */
registerOpcode('vbuffermessage', (ctx, args) => {
  return getOpcodeHandler('bufferstring')?.(ctx, args) ?? false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « party » (ex src/engine/script/script-opcodes-party.ts)
// ═══════════════════════════════════════════════════════════════════════════
/** _vget = VarGet avec fallback '0'. Local au fichier (= 1:1 décomp inline read). */


/** 1:1 décomp `ScrCmd_givemon` (scrcmd.c:1681-1692) :
 *    species = VarGet(args[0]); level = VarGet(args[1]); item = VarGet(args[2]);
 *    ScriptGiveMon(species, level, item, 0, 0, 0);
 *  Retours : 0=MON_GIVEN_TO_PARTY, 1=MON_GIVEN_TO_PC, 2=MON_CANT_GIVE. */
registerOpcode('givemon', (_ctx, args) => {
  const speciesArg = args[0] ?? '';
  const level = parseValue(args[1] ?? '5') || 5;
  let speciesName = speciesArg;
  if (!speciesName.startsWith('SPECIES_')) {
    const num = VarGet(speciesArg);
    speciesName = reverseDecompConstant(num, 'SPECIES_') ?? `SPECIES_${num}`;
  }
  // item : ITEM_* littéral, VAR_*, ou absent (ITEM_NONE).
  const itemArg = args[2];
  let heldItem: string | undefined;
  if (itemArg && itemArg !== 'ITEM_NONE' && itemArg !== '0') {
    heldItem = itemArg.startsWith('ITEM_')
      ? itemArg
      : (reverseDecompConstant(VarGet(itemArg), 'ITEM_') ?? undefined);
  }
  void (async () => {
    try {
      const { CreateMon, GiveMonToPlayer, MON_GIVEN_TO_PARTY } = await import('./engine/pokemon/pokemon');
      const mon = CreateMon(speciesName, level, heldItem ? { heldItem } : undefined);
      const result = GiveMonToPlayer(mon);
      const ok = result === MON_GIVEN_TO_PARTY;
      // 1:1 ScriptGiveMon : 0=MON_GIVEN_TO_PARTY, 1=MON_GIVEN_TO_PC.
      VarSet('VAR_RESULT', ok ? 0 : 1);
      console.log(`[opcode givemon] ${speciesName} Lv${level}${heldItem ? ' @' + heldItem : ''} → ${ok ? 'PARTY(0)' : 'PC(1)'}`);
    } catch (e) {
      console.warn('[opcode givemon] failed:', e);
      VarSet('VAR_RESULT', 2);  // MON_CANT_GIVE
    }
  })();
  return false;
});

/** `givepokemon` est un alias de `givemon` (= macro user-level). */
registerOpcode('givepokemon', (_ctx, args) => {
  const speciesArg = args[0] ?? '';
  const level = parseValue(args[1] ?? '5') || 5;
  let speciesName = speciesArg;
  if (!speciesName.startsWith('SPECIES_')) {
    const num = VarGet(speciesArg);
    speciesName = reverseDecompConstant(num, 'SPECIES_') ?? `SPECIES_${num}`;
  }
  void (async () => {
    try {
      const { CreateMon, GiveMonToPlayer, MON_GIVEN_TO_PARTY } = await import('./engine/pokemon/pokemon');
      const mon = CreateMon(speciesName, level);
      const result = GiveMonToPlayer(mon);
      const ok = result === MON_GIVEN_TO_PARTY;
      VarSet('VAR_RESULT', ok ? 0 : 2);  // 0=success, 1=full, 2=fail
      console.log(`[opcode givepokemon] ${speciesName} Lv${level} → ${ok ? 'added' : 'party full'}`);
    } catch (e) {
      console.warn('[opcode givepokemon] failed:', e);
      VarSet('VAR_RESULT', 2);
    }
  })();
  return false;
});

/** 1:1 décomp `ScrCmd_giveegg` (scrcmd.c:1694-1700) :
 *    ScriptGiveEgg(VarGet(species)). Donne un Pokemon egg à la party.
 *  Notre port : log + skip (= ScriptGiveEgg à porter 1:1 strict en session dédiée).
 *  Dette : implémenter ScriptGiveEgg via script_pokemon_util.c port. */
registerOpcode('giveegg', (_ctx, args) => {
  console.log(`[opcode giveegg] species=${args[0]} — TODO ScriptGiveEgg port`);
  return false;
});

/** 1:1 décomp `ScrCmd_setmonmove` (scrcmd.c:1702-1710) :
 *    ScriptSetMonMoveSlot(partyIndex, move, slot). */
registerOpcode('setmonmove', (_ctx, args) => {
  const partyIndex = parseValue(args[0] ?? '0');
  const slot = parseValue(args[1] ?? '0');
  const moveId = resolveDecompConstant(args[2] ?? 'MOVE_NONE') ?? 0;
  if (partyIndex >= 0 && partyIndex < PARTY_SIZE && slot >= 0 && slot < MAX_MON_MOVES) {
    const mon = gPlayerParty[partyIndex];
    // 1:1 décomp `ScriptSetMonMoveSlot`→`SetMonMoveSlot` (pokemon.c) : SetMonData
    // du move + PP plein (CalculatePPWithBonus, ppBonuses=0). Opère sur le NATIF
    // gPlayerParty (l'ancien `mon.moves[slot]=…` mutait une VUE nested = non propagé).
    SetMonData(mon, MON_DATA_MOVE1 + slot, moveId);
    SetMonData(mon, MON_DATA_PP1 + slot, CalculatePPWithBonus(moveId, 0, slot));
  }
  return false;
});

/** 1:1 décomp `ScrCmd_setmonmetlocation` (scrcmd.c:2256-2270) :
 *    SetMonData(&gPlayerParty[idx], MON_DATA_MET_LOCATION, &loc). */
registerOpcode('setmonmetlocation', (_ctx, args) => {
  const partyIndex = _vget(args[0]);
  const location = parseValue(args[1] ?? '0');
  // 1:1 décomp : SetMonData(&gPlayerParty[idx], MON_DATA_MET_LOCATION, &loc).
  if (partyIndex >= 0 && partyIndex < PARTY_SIZE) {
    SetMonData(gPlayerParty[partyIndex], MON_DATA_MET_LOCATION, location);
  }
  return false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « flag-var » (ex src/engine/script/script-opcodes-flag-var.ts)
// ═══════════════════════════════════════════════════════════════════════════
// ─── Variables ──────────────────────────────────────────────────────────────

registerOpcode('setvar', (_ctx, args) => {
  VarSet(args[0], parseValue(args[1]));
  return false;
});

registerOpcode('addvar', (_ctx, args) => {
  VarSet(args[0], (VarGet(args[0]) + parseValue(args[1])) & 0xFFFF);
  return false;
});

registerOpcode('subvar', (_ctx, args) => {
  VarSet(args[0], (VarGet(args[0]) - parseValue(args[1])) & 0xFFFF);
  return false;
});

registerOpcode('copyvar', (_ctx, args) => {
  VarSet(args[0], VarGet(args[1]));
  return false;
});

/** 1:1 décomp `ScrCmd_setorcopyvar` (scrcmd.c:374-388) — alt setvar that handles VAR_*. */
registerOpcode('setorcopyvar', (_ctx, args) => {
  const dst = args[0] ?? '';
  const src = args[1] ?? '';
  if (src && src.startsWith('VAR_')) {
    VarSet(dst, VarGet(src));
  } else {
    VarSet(dst, parseValue(src));
  }
  return false;
});

// ─── Switch / case (event.inc:1914-1921 macros) ─────────────────────────────

// 1:1 décomp asm/macros/event.inc:1914-1921 :
//
//   .macro switch var
//     copyvar VAR_0x8000, \var
//   .endm
//
//   .macro case condition, dest
//     compare VAR_0x8000, \condition
//     goto_if_eq \dest
//   .endm
//
// Notre extracteur garde les macros user-level (= switch/case) non-expandées.
// 337 usages `switch` + 1278 `case` (= biggest opcode gap).
registerOpcode('switch', (_ctx, args) => {
  // copyvar VAR_0x8000, args[0]
  VarSet('VAR_0x8000', VarGet(args[0]));
  return false;
});

registerOpcode('case', (ctx, args) => {
  // compare VAR_0x8000, args[0] + goto_if_eq args[1]
  const condition = parseValue(args[0]);
  const scratch = VarGet('VAR_0x8000');
  if (scratch === condition) {
    const target = getScript(args[1]);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

// ─── Flags ──────────────────────────────────────────────────────────────────

registerOpcode('setflag', (_ctx, args) => {
  FlagSet(args[0]);
  return false;
});

registerOpcode('clearflag', (_ctx, args) => {
  FlagClear(args[0]);
  return false;
});

registerOpcode('checkflag', (ctx, args) => {
  // 1:1 décomp : ctx.comparisonResult = FlagGet (= 0/1).
  ctx.comparisonResult = FlagGet(args[0]) ? 1 : 0;
  // gSpecialVar.Result aussi set par checkflag (= via VAR_RESULT).
  gSpecialVar.Result = ctx.comparisonResult;
  return false;
});

// ─── Compare ────────────────────────────────────────────────────────────────

registerOpcode('compare', (ctx, args) => {
  // 1:1 décomp : args peuvent être var noms, immediates, ou constantes
  // (MALE/FEMALE/LOCALID_X). parseValue les résout tous.
  const a = parseValue(args[0]);
  const b = parseValue(args[1]);
  ctx.comparisonResult = Compare(a, b);
  return false;
});

// ─── Game stats ─────────────────────────────────────────────────────────────

/** 1:1 décomp `ScrCmd_incrementgamestat` (scrcmd.c:599-603) :
 *    IncrementGameStat(stat);  // +1 à gSaveBlock1Ptr->gameStats[stat]. */
registerOpcode('incrementgamestat', (_ctx, args) => {
  const stat = VarGet(args[0] ?? '0');
  if (gSaveBlock1Ptr?.gameStats && stat >= 0 && stat < gSaveBlock1Ptr.gameStats.length) {
    gSaveBlock1Ptr.gameStats[stat] = (gSaveBlock1Ptr.gameStats[stat] ?? 0) + 1;
  }
  return false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « screen-fx » (ex src/engine/script/script-opcodes-screen-fx.ts)
// ═══════════════════════════════════════════════════════════════════════════
const FADE_MODE_FROM_BLACK = 0;
const FADE_MODE_TO_BLACK = 1;
const FADE_MODE_FROM_WHITE = 2;
const FADE_MODE_TO_WHITE = 3;

function _resolveFadeMode(arg: string): number {
  if (arg === 'FADE_FROM_BLACK') return FADE_MODE_FROM_BLACK;
  if (arg === 'FADE_TO_BLACK') return FADE_MODE_TO_BLACK;
  if (arg === 'FADE_FROM_WHITE') return FADE_MODE_FROM_WHITE;
  if (arg === 'FADE_TO_WHITE') return FADE_MODE_TO_WHITE;
  return parseValue(arg);
}

function _doFadeScreen(mode: number, _delay: number): void {
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp palette.c : start/end/color selon mode.
  const isToBlack = mode === FADE_MODE_TO_BLACK;
  const isToWhite = mode === FADE_MODE_TO_WHITE;
  const isFromBlack = mode === FADE_MODE_FROM_BLACK;
  const isFromWhite = mode === FADE_MODE_FROM_WHITE;
  const startY = (isFromBlack || isFromWhite) ? 0x10 : 0;
  const endY = (isToBlack || isToWhite) ? 0x10 : 0;
  const color = (isToWhite || isFromWhite) ? 'RGB_WHITEALPHA' : 'RGB_BLACK';
  rt.BeginNormalPaletteFade('PALETTES_ALL', 0, startY, endY, color);
}

// 1:1 décomp scrcmd.c:ScrCmd_fadescreen (lignes 626-631) :
//   FadeScreen(mode, 0); SetupNativeScript(ctx, IsPaletteNotActive);
registerOpcode('fadescreen', (ctx, args) => {
  const mode = _resolveFadeMode(args[0]);
  _doFadeScreen(mode, 0);
  // 1:1 décomp : SetupNativeScript(ctx, IsPaletteNotActive) — attend que le fade
  // soit terminé avant de continuer.
  const rt = getRuntime();
  SetupNativeScript(ctx, () => !rt?.gPaletteFade.active);
  return true;
});

registerOpcode('fadescreenspeed', (ctx, args) => {
  const mode = _resolveFadeMode(args[0]);
  const speed = parseValue(args[1]);
  _doFadeScreen(mode, speed);
  const rt = getRuntime();
  SetupNativeScript(ctx, () => !rt?.gPaletteFade.active);
  return true;
});

registerOpcode('fadescreenswapbuffers', (ctx, args) => {
  // 1:1 décomp scrcmd.c:643 — variante qui swap gPlttBufferUnfaded ↔
  // gPaletteDecompressionBuffer avant fade. Pour l'instant : same as fadescreen.
  // Dette : implémenter le swap buffer 1:1 strict palette.c.
  const mode = _resolveFadeMode(args[0]);
  _doFadeScreen(mode, 0);
  const rt = getRuntime();
  SetupNativeScript(ctx, () => !rt?.gPaletteFade.active);
  return true;
});

// ─── Flash (1:1 décomp ScrCmd_setflashlevel/animateflash) ───────────────────

/** 1:1 décomp `gFlashLevel` (overworld.c). 0 = pas d'obscurité, 7 = obscurité
 *  maximale (= ASTUCE FLASH HM). Affiche une mask noire avec un cercle
 *  transparent autour du player. Notre port stocke ici, le rendering field
 *  scene lit cette valeur pour appliquer le mask. */
let _gFlashLevel = 0;

/** 1:1 décomp `gMaxFlashLevel = ARRAY_COUNT(sFlashLevelToRadius) - 1 = 8`
 *  (field_screen_effect.c:54). Niveau 8 = noir total, 7 = plus petit cercle. */
export const gMaxFlashLevel = 8;

/** 1:1 décomp `SetFlashLevel(s32 flashLevel)` (overworld.c:981) :
 *    if (flashLevel < 0 || flashLevel > gMaxFlashLevel) flashLevel = 0;
 *    gSaveBlock1Ptr->flashLevel = flashLevel;
 *  Le port utilise `globalThis.gFlashLevel` comme source du masque (flash-mask.ts)
 *  ET `_gFlashLevel` comme niveau de départ de l'anim `animateflash` → on pose les
 *  DEUX (sinon animateflash lerp depuis un niveau périmé). */
export function SetFlashLevel(flashLevel: number): void {
  if (flashLevel < 0 || flashLevel > gMaxFlashLevel) flashLevel = 0;
  _gFlashLevel = flashLevel & 0xF;
  (globalThis as Record<string, unknown>).gFlashLevel = _gFlashLevel;
}
// Exposé pour SetDefaultFlashLevel (game/overworld.ts) sans import statique :
// overworld.ts → ce module fermait un cycle ESM (TDZ DIR_SOUTH au boot).
(globalThis as Record<string, unknown>).__SetFlashLevel = SetFlashLevel;

// `setflashlevel` early stub (= last-wins, real impl ci-dessous écrase).
registerOpcode('setflashlevel', (_ctx, _args) => false);

// `animateflash` early stub.
registerOpcode('animateflash', (_ctx, _args) => false);

// 1:1 décomp ScrCmd_setflashlevel (scrcmd.c:612-624) :
//   SetFlashLevel(VarGet(level)).
// Level 0 = pas d'obscurité (= salle illuminée), 7 = obscurité maximale.
registerOpcode('setflashlevel', (_ctx, args) => {
  SetFlashLevel(parseValue(args[0] ?? '0') & 0xF);
  return false;
});

// 1:1 décomp ScrCmd_animateflash (scrcmd.c:605-610) :
//   AnimateFlash(level) ; ScriptContext_Stop ; return TRUE.
// Fade animation entre l'ancien level et le nouveau (= radial transition).
registerOpcode('animateflash', (ctx, args) => {
  const targetLevel = parseValue(args[0] ?? '0') & 0xF;
  const startLevel = _gFlashLevel;
  let frame = 0;
  const totalFrames = 16;
  const poll = (): boolean => {
    frame++;
    // Lerp linéaire entre startLevel et targetLevel.
    _gFlashLevel = Math.round(startLevel + (targetLevel - startLevel) * (frame / totalFrames));
    (globalThis as Record<string, unknown>).gFlashLevel = _gFlashLevel;
    if (frame >= totalFrames) {
      _gFlashLevel = targetLevel;
      (globalThis as Record<string, unknown>).gFlashLevel = _gFlashLevel;
      return true;
    }
    return false;
  };
  SetupNativeScript(ctx, poll);
  return true;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « lock » (ex src/engine/script/script-opcodes-lock.ts)
// ═══════════════════════════════════════════════════════════════════════════
/** 1:1 décomp `sCurrentApproachingTrainerObjectEventId` (trainer_see.c).
 *  Set par `selectapproachingtrainer` à l'object event ID du trainer en
 *  approche, lu par `lockfortrainer`. */
let _sCurrentApproachingTrainerObjectEventId = 0;
void _sCurrentApproachingTrainerObjectEventId;  // exposed for cross-section consumer if needed.

/** 1:1 décomp `IsOverworldLinkActive` (overworld.c) : returns TRUE si le
 *  player est dans un Union Room (= link battle). Notre port : pas de link
 *  mode → toujours FALSE. */
function _isInTrainerLink(): boolean {
  return false;
}

// ─── Lock / Release / FacePlayer ─────────────────────────────────────────────

registerOpcode('lock', (ctx) => {
  // 1:1 décomp `ScrCmd_lock` (scrcmd.c:1217-1237) :
  //   FreezeObjects_WaitForPlayerAndSelected();
  //   SetupNativeScript(ctx, IsFreezeSelectedObjectAndPlayerFinished);
  // Freeze tous les NPCs sauf player + selected NPC. Player + selected sont
  // freeze APRÈS leur step courant termine.
  const npc = getSelectedNpc();
  // Freeze immediately tous sauf player/selected — 1:1 strict via FreezeObjectEvent
  // qui pause aussi sprite.animPaused (= sinon anim continue malgré frozen).
  for (const n of gObjectEvents) {
    if (n.active && n !== npc) FreezeObjectEvent(n);
  }
  // Wait pour player step end. Le selected NPC était déjà frozen ou en step ;
  // on freeze le selected aussi à la fin du wait.
  SetupNativeScript(ctx, () => {
    if (!isPlayerStepFinished()) return false;
    if (npc) FreezeObjectEvent(npc);
    return true;
  });
  return true;  // tells script-runtime to wait
});

registerOpcode('lockall', (ctx) => {
  // 1:1 STRICT décomp `ScrCmd_lockall` (scrcmd.c:1199-1213) :
  //   FreezeObjects_WaitForPlayer();
  //   SetupNativeScript(ctx, IsFreezePlayerFinished);
  // → FreezeObjectEvents() qui appelle FreezeObjectEvent par NPC, qui set
  //   frozen=true ET pause sprite.animPaused (= sinon anim cycle malgré frozen).
  for (const npc of gObjectEvents) {
    if (npc.active) FreezeObjectEvent(npc);
  }
  SetupNativeScript(ctx, () => isPlayerStepFinished());
  return true;
});

registerOpcode('release', (_ctx) => {
  // 1:1 STRICT décomp `ScrCmd_release` (scrcmd.c:1251-1263) :
  //   HideFieldMessageBox();
  //   if (gObjectEvents[gSelectedObjectEvent].active)
  //       ObjectEventClearHeldMovementIfFinished(&gObjectEvents[gSelectedObjectEvent]);
  //   playerObjectId = GetObjectEventIdByLocalIdAndMap(LOCALID_PLAYER, 0, 0);
  //   ObjectEventClearHeldMovementIfFinished(&gObjectEvents[playerObjectId]);
  //   ScriptMovement_UnfreezeObjectEvents();
  //   UnfreezeObjectEvents();
  HideFieldMessageBox();
  const selected = gObjectEvents[gSelectedObjectEvent.index];
  if (selected && selected.active) ObjectEventClearHeldMovementIfFinished(selected);
  const player = gObjectEvents[gPlayerAvatar.objectEventId];
  if (player) ObjectEventClearHeldMovementIfFinished(player);
  ScriptMovement_UnfreezeObjectEvents();
  for (const npc of gObjectEvents) {
    if (npc.active) UnfreezeObjectEvent(npc);
  }
  return false;
});

registerOpcode('releaseall', (_ctx) => {
  // 1:1 STRICT décomp `ScrCmd_releaseall` (scrcmd.c:1239-1249) :
  //   HideFieldMessageBox();
  //   playerObjectId = GetObjectEventIdByLocalIdAndMap(LOCALID_PLAYER, 0, 0);
  //   ObjectEventClearHeldMovementIfFinished(&gObjectEvents[playerObjectId]);
  //   ScriptMovement_UnfreezeObjectEvents();
  //   UnfreezeObjectEvents();
  HideFieldMessageBox();
  const player = gObjectEvents[gPlayerAvatar.objectEventId];
  if (player) ObjectEventClearHeldMovementIfFinished(player);
  ScriptMovement_UnfreezeObjectEvents();
  for (const npc of gObjectEvents) {
    if (npc.active) UnfreezeObjectEvent(npc);
  }
  return false;
});

/** 1:1 décomp `GetFaceDirectionMovementAction(direction)` :
 *  retourne MOVEMENT_ACTION_FACE_X selon direction. */


registerOpcode('faceplayer', (_ctx) => {
  // 1:1 STRICT décomp `ScrCmd_faceplayer` (scrcmd.c:1152-1156) :
  //   if (gObjectEvents[gSelectedObjectEvent].active)
  //       ObjectEventFaceOppositeDirection(&gObjectEvents[gSelectedObjectEvent], GetPlayerFacingDirection());
  //
  // `ObjectEventFaceOppositeDirection` (event_object_movement.c:4975) :
  //   return ObjectEventSetHeldMovement(objectEvent,
  //       GetFaceDirectionMovementAction(GetOppositeDirection(direction)));
  //
  // `ObjectEventSetHeldMovement` (4870) :
  //   UnfreezeObjectEvent(objectEvent);
  //   objectEvent->movementActionId = movementActionId;
  //   objectEvent->heldMovementActive = TRUE;
  //   objectEvent->heldMovementFinished = FALSE;
  //
  // Le prochain `UpdateObjectEventCurrentMovement` tick check
  // `ObjectEventIsHeldMovementActive` → exec `ObjectEventExecHeldMovementAction`
  // → dispatch sur `gMovementActionFuncs[movementActionId]` → exec
  // `MovementAction_FaceX_Step0` → `FaceDirection` → `SetObjectEventDirection`
  // + `StartSpriteAnim(GetFaceDirectionAnimNum(dir))`.
  //
  // Notre port full 1:1 G15 : heldMovement system dispatchable via
  // TickObjectEventMovements (object-events.ts:_execHeldMovementAction).
  const npc = getSelectedNpc();
  if (!npc) return false;
  const oppositeDir = OPPOSITE_DIR[GetPlayerFacingDirection()] ?? DIR_SOUTH;
  ObjectEventSetHeldMovement(npc, _getFaceDirectionMovementAction(oppositeDir));
  return false;
});

registerOpcode('turnobject', (_ctx, args) => {
  // 1:1 STRICT décomp `ScrCmd_turnobject` (scrcmd.c:1159-1166) :
  //   ObjectEventTurnByLocalIdAndMap(localId, mapNum, mapGroup, direction)
  //   → ObjectEventTurn (1867) → SetObjectEventDirection + StartSpriteAnim
  //   + SeekSpriteAnim(0)
  //
  // Note : `ScrCmd_turnobject` utilise `ObjectEventTurn` DIRECT (= pas held
  // movement). C'est immediate. Notre port appelle SetObjectEventDirection
  // via _npcSetFaceAnim wrapped helper (= équivalent fonctionnel).
  const localId = parseInt(args[0], 10) || 0;
  const dirArg = args[1];
  let dir = DIR_SOUTH;
  if (dirArg.includes('SOUTH') || dirArg.includes('DOWN')) dir = DIR_SOUTH;
  else if (dirArg.includes('NORTH') || dirArg.includes('UP')) dir = DIR_NORTH;
  else if (dirArg.includes('WEST') || dirArg.includes('LEFT')) dir = DIR_WEST;
  else if (dirArg.includes('EAST') || dirArg.includes('RIGHT')) dir = DIR_EAST;
  for (const npc of gObjectEvents) {
    if (npc.active && npc.localId === localId) {
      npc.facingDirection = dir;
      _npcTurnAnim(npc);
      break;
    }
  }
  return false;
});

/** 1:1 décomp `ObjectEventTurn` (event_object_movement.c:1867-1875) :
 *    SetObjectEventDirection(obj, dir);   ← caller fait déjà
 *    if (!obj->inanimate) {
 *        StartSpriteAnim(sprite, GetFaceDirectionAnimNum(dir));
 *        SeekSpriteAnim(sprite, 0);
 *    }
 *  Utilise le helper __npcSetFaceAnim exposé via globalThis par object-events.ts. */
function _npcTurnAnim(npc: { facingDirection: number; spriteId: number; inanimate: boolean }): void {
  const setFace = (globalThis as Record<string, unknown>).__npcSetFaceAnim as
    ((rt: unknown, npc: unknown) => void) | undefined;
  if (!setFace) return;
  try { setFace(getRuntime(), npc); } catch { /* rt not ready */ }
}

// ─── Trainers (1:1 décomp ScrCmd_selectapproachingtrainer + lockfortrainer) ──

// `selectapproachingtrainer` early stub (= last-wins, real impl ci-dessous).
registerOpcode('selectapproachingtrainer', (_ctx, _args) => false);
registerOpcode('lockfortrainer', (_ctx, _args) => false);

registerOpcode('selectapproachingtrainer', (_ctx, _args) => {
  // 1:1 décomp ScrCmd_selectapproachingtrainer (scrcmd.c:2186-2189) :
  //   gSelectedObjectEvent = GetCurrentApproachingTrainerObjectEventId().
  gSelectedObjectEvent.index = _sCurrentApproachingTrainerObjectEventId;
  return false;
});

registerOpcode('lockfortrainer', (ctx, _args) => {
  // 1:1 décomp ScrCmd_lockfortrainer (scrcmd.c:2192-2208) :
  //   if (IsOverworldLinkActive()) return FALSE ;
  //   if (gObjectEvents[gSelectedObjectEvent].active) {
  //     FreezeForApproachingTrainers() ;
  //     SetupNativeScript(ctx, IsFreezeObjectAndPlayerFinished) ;
  //   }
  //   return TRUE
  if (_isInTrainerLink()) return false;
  const npc = gObjectEvents[gSelectedObjectEvent.index];
  if (npc && npc.active) {
    // 1:1 STRICT décomp FreezeForApproachingTrainers (trainer_see.c) : freeze
    // tous les NPCs via FreezeObjectEvent (= pause sprite.animPaused = sinon
    // les autres trainers continuent à wander visuellement).
    for (const n of gObjectEvents) if (n.active) FreezeObjectEvent(n);
    const poll = (): boolean => {
      // 1:1 décomp IsFreezeObjectAndPlayerFinished (event_object_movement.c) :
      //   return !player.runningState !== MOVING && all NPCs stepFramesLeft === 0
      if (gPlayerAvatar.stepFramesLeft > 0) return false;
      for (const n of gObjectEvents) {
        if (!n.active) continue;
        const walking = (n as unknown as { walkFramesLeft?: number }).walkFramesLeft ?? 0;
        if (walking > 0) return false;
      }
      return true;
    };
    SetupNativeScript(ctx, poll);
    return true;
  }
  return false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « battle » (ex src/engine/script/script-opcodes-battle.ts)
// ═══════════════════════════════════════════════════════════════════════════
// ─── Trainerbattle variants — flux 1:1 BattleSetup_ConfigureTrainerBattle ────
// (port miroir game/battle_setup.ts, remplace l'ancien net-effect _runTrainerBattle.)
// Chaque macro haut-niveau (asm/macros/event.inc:730-823) est RE-DÉPLIÉE vers la
// forme générique `[mode, trainer, localId, ptr…]` que ConfigureTrainerBattle
// parse via les MÊMES tables TrainerBattleParameter que la ROM, puis JUMP vers
// le EventScript_* de trainer_battle.inc (transpilé) — intro speech, musique,
// flag déjà-battu, dotrainerbattle, lose_text et post-battle script suivent le
// script 1:1.

registerOpcode('trainerbattle', (ctx, args) => {
  // Forme générique déjà dépliée : [TYPE, trainer, localId, ptr1, ptr2, …].
  return ScrCmd_trainerbattle(ctx, args);
});

// trainerbattle_single trainer, intro, lose [, event_script [, music]]
// (event.inc : sans event_script → SINGLE ; avec → CONTINUE_SCRIPT(_NO_MUSIC)).
registerOpcode('trainerbattle_single', (ctx, args) => {
  const [trainer, intro, lose, eventScript, music] = args;
  if (eventScript && eventScript !== '0') {
    const mode = music === 'NO_MUSIC' ? 'TRAINER_BATTLE_CONTINUE_SCRIPT_NO_MUSIC' : 'TRAINER_BATTLE_CONTINUE_SCRIPT';
    return ScrCmd_trainerbattle(ctx, [String(mode === 'TRAINER_BATTLE_CONTINUE_SCRIPT' ? 2 : 1), trainer ?? '0', '0', intro ?? '0', lose ?? '0', eventScript]);
  }
  return ScrCmd_trainerbattle(ctx, ['0' /* TRAINER_BATTLE_SINGLE */, trainer ?? '0', '0', intro ?? '0', lose ?? '0']);
});

// trainerbattle_double trainer, intro, lose, not_enough [, event_script [, music]]
registerOpcode('trainerbattle_double', (ctx, args) => {
  const [trainer, intro, lose, notEnough, eventScript, music] = args;
  if (eventScript && eventScript !== '0') {
    const modeVal = music === 'NO_MUSIC' ? 8 /* CONTINUE_SCRIPT_DOUBLE_NO_MUSIC */ : 6 /* CONTINUE_SCRIPT_DOUBLE */;
    return ScrCmd_trainerbattle(ctx, [String(modeVal), trainer ?? '0', '0', intro ?? '0', lose ?? '0', notEnough ?? '0', eventScript]);
  }
  return ScrCmd_trainerbattle(ctx, ['4' /* TRAINER_BATTLE_DOUBLE */, trainer ?? '0', '0', intro ?? '0', lose ?? '0', notEnough ?? '0']);
});

// trainerbattle_rematch trainer, intro, lose
registerOpcode('trainerbattle_rematch', (ctx, args) => {
  return ScrCmd_trainerbattle(ctx, ['5' /* TRAINER_BATTLE_REMATCH */, args[0] ?? '0', '0', args[1] ?? '0', args[2] ?? '0']);
});

// trainerbattle_rematch_double trainer, intro, lose, not_enough
registerOpcode('trainerbattle_rematch_double', (ctx, args) => {
  return ScrCmd_trainerbattle(ctx, ['7' /* TRAINER_BATTLE_REMATCH_DOUBLE */, args[0] ?? '0', '0', args[1] ?? '0', args[2] ?? '0', args[3] ?? '0']);
});

// trainerbattle_no_intro trainer, lose_text
registerOpcode('trainerbattle_no_intro', (ctx, args) => {
  return ScrCmd_trainerbattle(ctx, ['3' /* TRAINER_BATTLE_SINGLE_NO_INTRO_TEXT */, args[0] ?? '0', '0', args[1] ?? '0']);
});

// ─── Trainer flags ───────────────────────────────────────────────────────────

// 1:1 décomp `ScrCmd_settrainerflag` (scrcmd.c:1853-1859) :
//   FlagSet(TRAINER_FLAGS_START + ScriptReadHalfword(ctx)).
// 1:1 strict (refactor B1) : FlagSet accepte un numeric id → on peut wire
// directement avec TRAINER_FLAGS_START + parseValue(trainerName).
// constants/flags.h : TRAINER_FLAGS_START = 1280.
registerOpcode('settrainerflag', (_ctx, args) => {
  const trainer = args[0] ?? '';
  const trainerId = parseValue(trainer);
  FlagSet(1280 + trainerId);
  return false;
});

// 1:1 décomp `ScrCmd_cleartrainerflag` (scrcmd.c:1861-1867) :
//   FlagClear(TRAINER_FLAGS_START + ScriptReadHalfword(ctx)).
registerOpcode('cleartrainerflag', (_ctx, args) => {
  const trainer = args[0] ?? '';
  const trainerId = parseValue(trainer);
  FlagClear(1280 + trainerId);
  return false;
});

// 1:1 décomp `ScrCmd_checktrainerflag` (scrcmd.c:1869-1875) :
//   ctx->comparisonResult = FlagGet(TRAINER_FLAGS_START + ScriptReadHalfword(ctx));
//   (= set VAR_RESULT comme le décomp set comparisonResult, qui est read par goto_if).
registerOpcode('checktrainerflag', (_ctx, args) => {
  const trainer = args[0] ?? '';
  const trainerId = parseValue(trainer);
  const has = FlagGet(1280 + trainerId);
  VarSet('VAR_RESULT', has ? 1 : 0);
  return false;
});

// Helper 1:1 strict : check trainer defeated via FlagGet(TRAINER_FLAGS_START + id).
// constants/flags.h : TRAINER_FLAGS_START = 1280. Aligned avec settrainerflag/
// cleartrainerflag/checktrainerflag (= refactor B1 numeric IDs).
function _isTrainerDefeated(trainerArg: string): boolean {
  const trainerId = parseValue(trainerArg);
  return FlagGet(1280 + trainerId);
}

// 1:1 décomp `ScrCmd_goto_if_not_defeated` (= macro event.inc) :
//   branch if trainer NOT defeated. Used 10x in early-game scripts.
registerOpcode('goto_if_not_defeated', (ctx, args) => {
  const trainer = args[0] ?? '';
  const target = args[1] ?? '';
  if (!_isTrainerDefeated(trainer)) {
    const sub = getScript(target);
    if (sub) ScriptJump(ctx, sub);
  }
  return false;
});

// 1:1 décomp `ScrCmd_call_if_defeated`. 7x usage.
registerOpcode('call_if_defeated', (ctx, args) => {
  const trainer = args[0] ?? '';
  const target = args[1] ?? '';
  if (_isTrainerDefeated(trainer)) {
    const sub = getScript(target);
    if (sub) ScriptCall(ctx, sub);
  }
  return false;
});

// 1:1 décomp `ScrCmd_goto_if_defeated`. Inverse de goto_if_not_defeated. 16x.
registerOpcode('goto_if_defeated', (ctx, args) => {
  const trainer = args[0] ?? '';
  const target = args[1] ?? '';
  if (_isTrainerDefeated(trainer)) {
    const sub = getScript(target);
    if (sub) ScriptJump(ctx, sub);
  }
  return false;
});

// ─── Wild battles (1:1 décomp ScrCmd_setwildbattle/dowildbattle) ────────────

// `setwildbattle` / `dowildbattle` early stubs (= last-wins overwrites).
registerOpcode('setwildbattle', (_ctx, _args) => false);
registerOpcode('dowildbattle', (_ctx, _args) => false);

/** 1:1 décomp `ScrCmd_setwildbattle` (scrcmd.c:1869-1877) :
 *    CreateScriptedWildMon(species, level, item). */
registerOpcode('setwildbattle', (_ctx, args) => {
  // 1:1 décomp ScrCmd_setwildbattle (scrcmd.c:1869-1877) : CreateScriptedWildMon(species, level, item).
  // Voie L : peuple gEnemyParty[0] avec un mon PLEIN (createPokemonInstance) — remplace le
  // stub global gScriptedWildMon de la voie V (suppression voie V).
  const speciesId = parseValue(args[0] ?? '');
  const level = parseValue(args[1] ?? '5');
  const itemId = parseValue(args[2] ?? 'ITEM_NONE');
  CreateScriptedWildMon(speciesId, level, itemId);
  return false;
});

/** 1:1 décomp `ScrCmd_dowildbattle` (scrcmd.c:1879-1884) :
 *    BattleSetup_StartScriptedWildBattle + ScriptContext_Stop. */
registerOpcode('dowildbattle', (ctx, _args) => {
  // 1:1 décomp ScrCmd_dowildbattle (scrcmd.c:1879-1884) :
  //   BattleSetup_StartScriptedWildBattle(); ScriptContext_Stop(); return TRUE;
  // Voie L : gEnemyParty[0] deja pose par setwildbattle -> CreateScriptedWildMon ;
  // BattleSetup_StartScriptedWildBattle pose flags=0 + boote la VRAIE boucle decomp
  // (CB2_InitBattle), remplace l'ad-hoc voie V startWildBattle (suppression voie V).
  BattleSetup_StartScriptedWildBattle();
  // ScriptContext_Stop() : le swap CB2 (boucle combat) prend la main pendant le combat ;
  // au retour OW (CB2_EndScriptedWildBattle -> ReturnToFieldContinueScript), le poll
  // reprend le script. (A/B : confirmer la reprise du script apres un dowildbattle.)
  let framesWaited = 0;
  const poll = (): boolean => {
    framesWaited++;
    return framesWaited >= 1;
  };
  SetupNativeScript(ctx, poll);
  return true;
});

// ─── Trainer battle internal opcodes (1:1 scrcmd.c:1827-1843, port miroir
//     game/battle_setup.ts — remplacent les anciens stubs no-op) ─────────────

/** 1:1 décomp `ScrCmd_dotrainerbattle` (scrcmd.c:1827) : DoTrainerBattle +
 *  ScriptContext_Stop (poll de fin + CB2_EndTrainerBattle flags). */
registerOpcode('dotrainerbattle', (ctx, _args) => ScrCmd_dotrainerbattle(ctx));

/** 1:1 décomp `ScrCmd_gotopostbattlescript` (scrcmd.c:1833) :
 *  jump BattleSetup_GetTrainerPostBattleScript(). */
registerOpcode('gotopostbattlescript', (ctx, _args) => ScrCmd_gotopostbattlescript(ctx));

/** 1:1 décomp `ScrCmd_gotobeatenscript` (scrcmd.c:1839) :
 *  jump BattleSetup_GetScriptAddrAfterBattle() (= reprise du script de map). */
registerOpcode('gotobeatenscript', (ctx, _args) => ScrCmd_gotobeatenscript(ctx));


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « special » (ex src/engine/script/script-opcodes-special.ts)
// ═══════════════════════════════════════════════════════════════════════════
// ─── waitstate / SignalWaitState ────────────────────────────────────────────

// Session 124 fix Bug 4 : signal generic pour UI flows (= wallclock, starter,
// future MartUI, etc.). Le décomp `waitstate` poll `ScriptContext_Stop` cleared
// par `ScriptContext_Enable()` appelé par le UI flow quand il finit. Notre
// equivalent : un latch booleen set par `SignalWaitState()`.
let _waitStateSignaled = false;

/** Call par les UI flows (= wallclock, starter, region map, etc.) quand ils
 *  ferment, pour débloquer le script bloqué sur `waitstate`. */
export function SignalWaitState(): void {
  _waitStateSignaled = true;
}

/** 1:1 décomp `ScrCmd_waitstate` (scrcmd.c:142-146) :
 *  ScriptContext_Stop jusqu'à ce qu'une autre routine (= warp completion,
 *  multichoice result, UI flow done) call ScriptContext_Enable. Utilisé
 *  après `warpsilent`, après `special X waitstate=1` (= wallclock, starter
 *  choose), etc. */
registerOpcode('waitstate', (ctx) => {
  // Si signaled UPSTREAM (= UI flow déjà terminé avant waitstate dispatch),
  // consume + continue immédiat.
  if (_waitStateSignaled) {
    _waitStateSignaled = false;
    return false;
  }
  const startMapId = gMapHeader?.id;
  const tick = (): boolean => {
    if (_waitStateSignaled) {
      _waitStateSignaled = false;
      return true;
    }
    // Warp path : poll warp consume + map switch (= 1:1 session 122 fix).
    if (getPendingWarp()) return false;
    const currentMapId = gMapHeader?.id;
    if (currentMapId && currentMapId !== startMapId) return true;
    return false;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

// ─── Special opcode dispatcher (= 1:1 décomp ScrCmd_special) ────────────────

/** 1:1 décomp `gSpecials[]` table (data/specials.inc, 527 entries).
 *  Décomp : array de function pointers indexés par SPECIAL_xxx. Notre version
 *  string-keyed pour matcher les script JSON pré-extraits. */
type SpecialHandler = () => number | void;
// `var` (hoisté, SANS initialiseur) + lazy-init dans registerSpecial/invokeSpecial :
// battle_setup.ts (importé par scrcmd) appelle registerSpecial à son init, AVANT que le
// corps de scrcmd n'ait tourné → un `const = {}` serait en TDZ (cycle ESM scrcmd↔battle_setup).
// Pas de réassignation au corps (sinon elle écraserait les registrations faites pendant le cycle).
var _specialHandlers: Record<string, SpecialHandler> | undefined;

/** Register un special handler. Le handler peut return un u16 qui est stored
 *  par opcode `specialvar` dans une variable. À call par les modules qui
 *  implémentent un special spécifique (= battle module → `HealPlayerParty`). */
export function registerSpecial(name: string, handler: SpecialHandler): void {
  (_specialHandlers ??= {})[name] = handler;
}

/** Internal : invoke un special handler. Returns 0 si pas registered + log
 *  warning. Utilisé par opcodes `special` et `specialvar`, et par les
 *  fichiers `script-opcodes-frontier` / `script-opcodes-seteventmon`
 *  (= via le facility call helper). */
export function invokeSpecial(name: string): number {
  const handler = (_specialHandlers ??= {})[name];
  if (!handler) {
    // Log les specials manquants pour wire au fur et à mesure.
    console.log(`[opcode special] '${name}' not registered yet — wire dans specials-registry.ts`);
    return 0;
  }
  return handler() ?? 0;
}

/** UI dispatcher inline pour les specials qui ouvrent une UI overlay.
 *  Helper séparé pour réutiliser le pattern. */
function _runUIOverlay(
  ctx: ScriptContext,
  open: () => Promise<{ isOpen: () => boolean }>,
): boolean {
  let opened = false;
  let isOpenChecker: (() => boolean) | null = null;
  void open().then(({ isOpen }) => {
    isOpenChecker = isOpen;
    opened = true;
  });
  SetupNativeScript(ctx, () => {
    if (!opened) return false;
    return !isOpenChecker!();
  });
  return true;
}

/** 1:1 décomp `ScrCmd_special` (scrcmd.c:118-124).
 *  ```c
 *  bool8 ScrCmd_special(struct ScriptContext *ctx) {
 *      u16 index = ScriptReadHalfword(ctx);
 *      gSpecials[index]();
 *      return FALSE;
 *  }
 *  ``` */
registerOpcode('special', (ctx, args) => {
  const name = args[0] as string;
  // Phase 5.5 : ChooseStarter UI INLINE dans l'overworld via state machine
  // utilisant nos systèmes engine (= ShowFieldMessage + CreateYesNoMenu, no scene switch).
  // 1:1 décomp Task_StarterChoose flow + Task_AskConfirmStarter.
  // Dynamic import : avoid circular dependency at load time.
  if (name === 'ChooseStarter') {
    let flowReady = false;
    let flow: { tick: () => boolean } | null = null;
    void import('./starter_choose').then((mod) => {
      flow = mod.startChooseStarterFlow();
      flowReady = true;
    });
    SetupNativeScript(ctx, () => {
      if (!flowReady) return false;
      return flow!.tick();
    });
    return true;
  }
  // Phase 5.6 : Birch tutorial wild battle flow.
  // 1:1 décomp battle_setup.c:CB2_GiveStarter chains starter give → CB2_StartFirstBattle
  // (= BATTLE_TYPE_FIRST_BATTLE vs SPECIES_ZIGZAGOON Lv 2). Notre version :
  // inline state machine via SetupNativeScript (= block script, no scene switch).
  if (name === 'StartBirchTutorialBattle') {
    // 1:1 décomp : CB2_GiveStarter -> CB2_StartFirstBattle. Voie L : boote la VRAIE boucle
    // decomp (StartFirstBattle), remplace l'ad-hoc voie V startBirchTutorialBattle. Le swap
    // CB2 prend la main ; au retour OW le poll reprend le script (1:1 ScriptContext block).
    StartFirstBattle();
    let framesWaited = 0;
    SetupNativeScript(ctx, () => { framesWaited++; return framesWaited >= 1; });
    return true;
  }
  // 1:1 décomp `FieldShowRegionMap` (field_specials.c:973) : CB2 swap vers
  // worldmap HOENN. Notre version utilise un overlay HTML (= region-map.ts)
  // qui se dessine au-dessus du field. Le special est `waitstate=1`
  // dans specials.inc:279 donc on bloque le script via SetupNativeScript
  // jusqu'à ce que la carte se ferme (= IsRegionMapOpen() false).
  if (name === 'FieldShowRegionMap') {
    return _runUIOverlay(ctx, async () => {
      const mod = await import('./engine/field/region-map');
      await mod.OpenRegionMap();
      return { isOpen: mod.IsRegionMapOpen };
    });
  }
  // 1:1 décomp player_pc.c (= BedroomPC + PlayerPC). Pattern overlay (= pas
  // de CB2 swap car le PC dessine au-dessus de l'overworld). OpenBedroomPC()
  // ouvre le main menu UI ; TickBedroomPC() est polled chaque frame depuis
  // TestOverworldScene main loop pour drive l'input. Le special est `waitstate=1`
  // dans specials.inc:277-278 donc on bloque le script via SetupNativeScript
  // jusqu'à ce que le PC se ferme (= IsBedroomPCOpen() false).
  if (name === 'BedroomPC' || name === 'PlayerPC') {
    const isBedroom = (name === 'BedroomPC');
    return _runUIOverlay(ctx, async () => {
      const mod = await import('./player_pc');
      mod.OpenBedroomPC(isBedroom);
      return { isOpen: mod.IsBedroomPCOpen };
    });
  }
  // 1:1 décomp port `wallclock.c` (session 2026-05-20) : CB2 swap via
  // SetMainCallback2(CB2_InitWallClock). Aiguilles affines via SetOamMatrix +
  // sClockHandCoords pivot offsets. Tilemap BG3 clock_start/clock_view depuis
  // graphics/wallclock/. AM/PM indicator anime entre 2 positions selon période.
  // `Special_ViewWallClock` = mode VIEW (RTC live + A/B = close).
  // `StartWallClock` = mode SET (D-pad ajuste hours/minutes, A = confirm via
  // RtcInitLocalTimeOffset, sauvegarde).
  if (name === 'Special_ViewWallClock' || name === 'StartWallClock') {
    const mode: 'VIEW' | 'SET' = name === 'StartWallClock' ? 'SET' : 'VIEW';
    return _runUIOverlay(ctx, async () => {
      const mod = await import('./engine/ui/wallclock');
      mod.OpenWallClock(mode);
      return { isOpen: mod.IsWallClockOpen };
    });
  }
  // 1:1 décomp `BattleSetup_StartRematchBattle` (battle_setup.c:1371-1376) :
  // DoTrainerBattle + ScriptContext_Stop — le script DOIT se suspendre pendant
  // le combat puis reprendre (releaseall/end APRÈS, = ContinueScript vanilla).
  // Interception avec ctx (les specials n'ont pas le ctx) ; le boot + poll de
  // fin (CB2_EndRematchBattle) vit dans battle_setup.ts (surface anti-cycle).
  if (name === 'BattleSetup_StartRematchBattle') {
    const bs = (globalThis as { __battleSetup?: { _bootRematchBattleForScript?: () => () => boolean } }).__battleSetup;
    if (bs?._bootRematchBattleForScript) {
      SetupNativeScript(ctx, bs._bootRematchBattleForScript());
      return true;
    }
  }
  // 1:1 décomp `Bag_ChooseBerry` (item_menu.c:577) = SetMainCallback2(CB2_ChooseBerry)
  // (ouvre le sac, poche BAIES verrouillée, sélection → gSpecialVar_ItemId).
  // `def_special Bag_ChooseBerry, waitstate=1` (specials.inc:63) → la macro `special`
  // émet un `waitstate` implicite. Notre script extrait (depuis le .inc SOURCE) ne
  // l'a PAS → on park le script ICI via SetupNativeScript (1:1 comportemental du
  // waitstate implicite). Le native tick n'est pollé QUE quand l'OW est actif (pas
  // pendant le CB2 du sac), donc le 1er poll arrive APRÈS le retour
  // (CB2_ReturnToFieldContinueScript) → reprise avec VAR_ITEM_ID frais (baie choisie
  // ou 0 si annulé). Même pattern prouvé que StartBirchTutorialBattle ci-dessus.
  if (name === 'Bag_ChooseBerry') {
    void import('./engine/bag/bag-menu').then((m) => m.CB2_ChooseBerry());
    let framesWaited = 0;
    SetupNativeScript(ctx, () => { framesWaited++; return framesWaited >= 1; });
    return true;
  }
  invokeSpecial(name);
  return false;
});

/** 1:1 décomp `ScrCmd_specialvar` (scrcmd.c:126-132).
 *  ```c
 *  bool8 ScrCmd_specialvar(struct ScriptContext *ctx) {
 *      u16 *var = GetVarPointer(ScriptReadHalfword(ctx));
 *      *var = gSpecials[ScriptReadHalfword(ctx)]();
 *      return FALSE;
 *  }
 *  ```
 *  Format args : args[0] = varId (= "VAR_RESULT" etc.), args[1] = special name. */
registerOpcode('specialvar', (_ctx, args) => {
  const varId = args[0] as string;
  const specialName = args[1] as string;
  const result = invokeSpecial(specialName);
  VarSet(varId, result);
  return false;
});


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « frontier » (ex src/engine/script/script-opcodes-frontier.ts)
// ═══════════════════════════════════════════════════════════════════════════
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


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « menu » (ex src/engine/script/script-opcodes-menu.ts)
// ═══════════════════════════════════════════════════════════════════════════
// ─── Multichoice menus 1:1 décomp `script_menu.c` ──────────────────────────
// Audit session 126 LOT D2 : avant stubs `VAR_RESULT = 0` → maintenant vraie
// UI window verticale + cursor + A/B input. Data depuis `multichoice-data.ts`
// (= extraite de `src/data/script_menu.h` via `extract-multichoice-lists.mjs`).

let _multichoiceWindowId = -1;

function _spawnMultichoiceMenu(left: number, top: number, items: (string | Uint8Array)[], cursorPos: number): void {
  const count = items.length;
  if (count === 0) return;
  // Estimate width : max len of items * 0.5 tile + 2 tiles margin (= rough).
  // 1:1 décomp utilise `DisplayTextAndGetWidth` + `ConvertPixelWidthToTileWidth`.
  let maxChars = 4;
  for (const t of items) {
    const len = (t ?? '').length;
    if (len > maxChars) maxChars = len;
  }
  const width = Math.max(5, Math.min(28, Math.ceil(maxChars * 0.7) + 2));
  const tmpl: WindowTemplate = {
    bg: 0,
    tilemapLeft: left,
    tilemapTop: top,
    width,
    height: count * 2,
    paletteNum: 15,
    baseBlock: 0x125,
  };
  _multichoiceWindowId = AddWindow(tmpl);
  DrawStdFrameWithCustomTileAndPalette(_multichoiceWindowId, true, 0x214, 14);
  // Print each item sur ligne i (= y = 1 + i * 16).
  for (let i = 0; i < count; i++) {
    AddTextPrinterParameterized3(
      _multichoiceWindowId, 1, 8, 1 + i * 16, [1, 2, 3], 255, items[i] ?? '',
    );
  }
  PutWindowTilemap(_multichoiceWindowId);
  CopyWindowToVram(_multichoiceWindowId, 3 /* COPYWIN_FULL */);
  // 1:1 décomp `InitMenuInUpperLeftCornerNormal(windowId, count, cursorPos)`.
  InitMenuInUpperLeftCornerNormal(_multichoiceWindowId, count, cursorPos);
}

function _cleanupMultichoiceMenu(): void {
  if (_multichoiceWindowId >= 0) {
    ClearStdWindowAndFrame(_multichoiceWindowId, true);
    RemoveWindow(_multichoiceWindowId);
    _multichoiceWindowId = -1;
  }
}

/** 1:1 décomp `ScrCmd_multichoice(left, top, multichoiceId, ignoreBPress)` :
 *    ScriptMenu_Multichoice(...) → spawn menu + waitstate.
 *    User picks → VAR_RESULT = cursor pos (0..N-1) ou MULTI_B_PRESSED (= 0x7F)
 *    si B pressed et !ignoreBPress, ou cursor pos final si ignoreBPress. */
registerOpcode('multichoice', (ctx, args) => {
  const left = parseValue(args[0] ?? '0');
  const top = parseValue(args[1] ?? '0');
  const multichoiceId = VarGet(args[2] ?? '0');  // resolves MULTI_X → number
  const ignoreBPress = parseValue(args[3] ?? '0') !== 0;
  const items = getMultichoiceList(multichoiceId, args[2]);
  if (items.length === 0) {
    console.warn(`[opcode multichoice] no items for id=${args[2]} (${multichoiceId}) — fallback VAR_RESULT=0`);
    gSpecialVar.Result = 0;
    return false;
  }
  _spawnMultichoiceMenu(left, top, items, 0);
  let menuActive = true;
  const tick = (): boolean => {
    if (!menuActive) return true;
    const result = Menu_ProcessInputNoWrapClearOnChoose();
    if (result === -2) return false;  // MENU_NOTHING_CHOSEN
    if (result === -1) {
      // B pressed
      gSpecialVar.Result = ignoreBPress ? items.length - 1 : 0x7F /* MULTI_B_PRESSED */;
    } else {
      gSpecialVar.Result = result;
    }
    _cleanupMultichoiceMenu();
    menuActive = false;
    return true;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

/** 1:1 décomp `ScrCmd_multichoicedefault` : multichoice avec cursor à
 *  defaultChoice initial. */
registerOpcode('multichoicedefault', (ctx, args) => {
  const left = parseValue(args[0] ?? '0');
  const top = parseValue(args[1] ?? '0');
  const multichoiceId = VarGet(args[2] ?? '0');
  const defaultChoice = parseValue(args[3] ?? '0');
  const ignoreBPress = parseValue(args[4] ?? '0') !== 0;
  const items = getMultichoiceList(multichoiceId, args[2]);
  if (items.length === 0) {
    console.warn(`[opcode multichoicedefault] no items for id=${args[2]} (${multichoiceId}) — fallback VAR_RESULT=${defaultChoice}`);
    gSpecialVar.Result = defaultChoice;
    return false;
  }
  _spawnMultichoiceMenu(left, top, items, defaultChoice);
  let menuActive = true;
  const tick = (): boolean => {
    if (!menuActive) return true;
    const result = Menu_ProcessInputNoWrapClearOnChoose();
    if (result === -2) return false;
    if (result === -1) {
      gSpecialVar.Result = ignoreBPress ? items.length - 1 : 0x7F;
    } else {
      gSpecialVar.Result = result;
    }
    _cleanupMultichoiceMenu();
    menuActive = false;
    return true;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

/** 1:1 décomp `ScrCmd_multichoicegrid` (scrcmd.c:1401) :
 *    ScriptMenu_MultichoiceGrid(left, top, multichoiceId, ignoreBPress, numColumns)
 *  Dette R3 doc : ScriptMenu_MultichoiceGrid (script_menu.c) demande grid layout
 *  N×M rendu (= au lieu de vertical), cascade UI substrate. Non critique démo
 *  (= seulement utilisé Fortree gym puzzle + elevator menus). Notre port fallback
 *  vertical multichoice (= perRow ignoré → 1 colonne au lieu de N). */
registerOpcode('multichoicegrid', (ctx, args) => {
  const left = parseValue(args[0] ?? '0');
  const top = parseValue(args[1] ?? '0');
  const multichoiceId = VarGet(args[2] ?? '0');
  const perRow = parseValue(args[3] ?? '1');
  const ignoreBPress = parseValue(args[4] ?? '0') !== 0;
  void perRow;  // dette R3 doc grid layout (= ignored, fallback vertical)
  const items = getMultichoiceList(multichoiceId, args[2]);
  if (items.length === 0) {
    console.warn(`[opcode multichoicegrid] no items for id=${args[2]} (${multichoiceId}) — fallback VAR_RESULT=0`);
    gSpecialVar.Result = 0;
    return false;
  }
  _spawnMultichoiceMenu(left, top, items, 0);
  let menuActive = true;
  const tick = (): boolean => {
    if (!menuActive) return true;
    const result = Menu_ProcessInputNoWrapClearOnChoose();
    if (result === -2) return false;
    if (result === -1) {
      gSpecialVar.Result = ignoreBPress ? items.length - 1 : 0x7F;
    } else {
      gSpecialVar.Result = result;
    }
    _cleanupMultichoiceMenu();
    menuActive = false;
    return true;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

// ─── YesNo ──────────────────────────────────────────────────────────────────

// 1:1 décomp scrcmd.c:1337-1351 ScrCmd_yesnobox(left, top) :
//   ScriptMenu_YesNo(left, top) → returns TRUE → ScriptContext_Stop
//   Wait until Menu_ProcessInputNoWrapClearOnChoose returns choice :
//     0 (OUI) → VAR_RESULT = 1 (= YES enum)
//     1 (NON) / B_PRESSED → VAR_RESULT = 0 (= NO enum)
//
// Window template 1:1 décomp menu.c:98-107 sYesNo_WindowTemplates :
//   { bg: 0, tilemapLeft: ?, tilemapTop: ?, width: 5, height: 4,
//     paletteNum: 15, baseBlock: 0x125 }
export function spawnYesNoMenu(left: number, top: number): void {
  // 1:1 décomp menu.c:1623 CreateYesNoMenu(window, baseTileNum, paletteNum, initialCursorPos).
  // STD_WINDOW_BASE_TILE_NUM=0x214, STD_WINDOW_PALETTE_NUM=14 (= cf. menu.c:25-27).
  const tmpl: WindowTemplate = {
    bg: 0,
    tilemapLeft: left,
    tilemapTop: top,
    width: 5,
    height: 4,
    paletteNum: 15,    // DLG_WINDOW_PALETTE_NUM
    baseBlock: 0x125,
  };
  CreateYesNoMenu(tmpl, 0x214, 14, 0);
}

registerOpcode('yesnobox', (ctx, args) => {
  const left = parseValue(args[0]);
  const top = parseValue(args[1]);
  spawnYesNoMenu(left, top);
  let menuActive = true;
  const tick = (): boolean => {
    if (!menuActive) return true;
    const result = Menu_ProcessInputNoWrapClearOnChoose();
    if (result === -2 /* MENU_NOTHING_CHOSEN */) return false;
    // 1:1 décomp `script_menu.c:Task_HandleYesNoInput` :
    //   case 0 (OUI top) → VAR_RESULT = 1 (= YES enum, event.inc:1932)
    //   case 1 / B_PRESSED → VAR_RESULT = 0 (= NO enum)
    const yesNoResult = result === 0 ? 1 : 0;
    gSpecialVar.Result = yesNoResult;
    // Cleanup yesno window (= 1:1 décomp EraseYesNoWindow déjà fait par
    // Menu_ProcessInputNoWrapClearOnChoose en interne).
    const wid = GetYesNoWindowId();
    if (wid >= 0) {
      ClearStdWindowAndFrame(wid, true);
      RemoveWindow(wid);
    }
    menuActive = false;
    return true;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

// ─── Mon pic (showmonpic/hidemonpic) ────────────────────────────────────────

/** 1:1 décomp `ScrCmd_showmonpic` (scrcmd.c:1446-1454) :
 *    ScriptMenu_ShowPokemonPic(species, x, y).
 *  Affiche un sprite Pokemon front dans une window. 10x usage in Birch lab +
 *  cinematic moments. Notre port : log + skip (= would integrate with
 *  starter-choose-flow style sprite). Dette : porter ScriptMenu_ShowPokemonPic. */
registerOpcode('showmonpic', (_ctx, args) => {
  console.log(`[opcode showmonpic] species=${args[0]} x=${args[1]} y=${args[2]} — dette R3 (cascade ScriptMenu_ShowPokemonPic U-tier sprite mon front)`);
  return false;
});

/** 1:1 décomp `ScrCmd_hidemonpic` (scrcmd.c:1456-1466) :
 *    func = ScriptMenu_HidePokemonPic();  // returns fn ptr
 *    if (func == NULL) return FALSE;
 *    SetupNativeScript(ctx, func); return TRUE.
 *  Notre port : pour l'instant le mon pic est fire-and-forget. Wait 8 frames
 *  (= petit délai pour fade out hypothétique). */
registerOpcode('hidemonpic', (ctx, _args) => {
  let framesWaited = 0;
  const poll = (): boolean => {
    framesWaited++;
    return framesWaited >= 8;
  };
  SetupNativeScript(ctx, poll);
  return true;
});

// ─── Drawbox / erasebox / drawboxtext (RS-era, removed in Emerald — all nop1) ─

registerOpcode('drawbox', (_ctx, _args) => false);
registerOpcode('erasebox', (_ctx, _args) => false);
registerOpcode('drawboxtext', (_ctx, _args) => false);

// ─── Elevator menu (addelevmenuitem / showelevmenu — stubbed in Em) ─────────

registerOpcode('addelevmenuitem', (_ctx, _args) => false);

registerOpcode('showelevmenu', (_ctx, _args) => false);


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « message » (ex src/engine/script/script-opcodes-message.ts)
// ═══════════════════════════════════════════════════════════════════════════
/** 1:1 décomp `GetFaceDirectionMovementAction(direction)` :
 *  retourne MOVEMENT_ACTION_FACE_X selon direction. Same helper que dans
 *  script-opcodes-lock.ts (= dupliqué pour éviter cycle ESM via lock import). */


// ─── Message ─────────────────────────────────────────────────────────────────

registerOpcode('message', (_ctx, args) => {
  // 1:1 décomp ScrCmd_message (scrcmd.c:1265-1273) : ShowFieldMessage(text).
  const label = args[0];
  const rawText = getText(label);
  if (!rawText) {
    console.warn(`[opcode message] text '${label}' not found`);
    return false;
  }
  ShowFieldMessage(rawText);
  return false;
});

registerOpcode('waitmessage', (ctx) => {
  // 1:1 décomp ScrCmd_waitmessage (scrcmd.c:1310-1314) :
  //   SetupNativeScript IsFieldMessageBoxHidden.
  SetupNativeScript(ctx, IsFieldMessageBoxHidden);
  return true;
});

registerOpcode('waitbuttonpress', (ctx) => {
  // 1:1 décomp ScrCmd_waitbuttonpress (scrcmd.c:1331-1335) :
  //   SetupNativeScript WaitForAorBPress.
  SetupNativeScript(ctx, isAOrBNewlyPressed);
  return true;
});

registerOpcode('closemessage', (_ctx) => {
  HideFieldMessageBox();
  return false;
});

/** msgbox = composite macro : équivalent à `loadword 0, text` + `callstd N`.
 *  Notre version : run la sequence complète inline (= équivalent fonctionnel
 *  des std scripts MSGBOX_NPC, MSGBOX_DEFAULT, MSGBOX_SIGN, MSGBOX_YESNO).
 *
 *  MSGBOX_NPC      = 2 → lock + faceplayer + message + waitmessage + waitbuttonpress + release
 *  MSGBOX_SIGN     = 3 → lockall + message + waitmessage + waitbuttonpress + releaseall
 *  MSGBOX_DEFAULT  = 4 → idem MSGBOX_NPC (= avec ou sans faceplayer selon variantes)
 *  MSGBOX_YESNO    = 5 → message + waitmessage + spawn yesnobox + wait selection
 *  MSGBOX_AUTOCLOSE= 6 → message + waitmessage + waitbuttonpress + closemessage
 *
 *  Implémenté via SetupNativeScript : state machine polling chaque frame. */
registerOpcode('msgbox', (ctx, args) => {
  const textLabel = args[0];
  const type = args[1] ?? 'MSGBOX_DEFAULT';
  // 1:1 décomp : le linker GBA garantit le label existe au compile time, donc le
  // décomp ne gère pas ce cas. Notre runtime fetch async les textes depuis JSON,
  // un label peut être absent si extract-scripts.mjs ne l'a pas récolté ou si la
  // map JSON est mal chargée. On affiche `[MISSING:label]` à l'écran avec le
  // flow msgbox normal → debug visible + halt jusqu'à A press.
  const lookupText = getText(textLabel);
  if (!lookupText) {
    console.error(`[opcode msgbox] text '${textLabel}' not found — showing [MISSING] placeholder`);
  }
  const rawText = lookupText ?? encodeOwText(`[MISSING:${textLabel}]`);

  // 1:1 décomp `data/scripts/std_msgbox.inc` semantics :
  //   MSGBOX_NPC      → lock + faceplayer + message + waitbuttonpress + release
  //   MSGBOX_SIGN     → lockall + message + waitbuttonpress + releaseall
  //   MSGBOX_DEFAULT  → message + waitbuttonpress + return (NO lock, NO facing)
  //   MSGBOX_AUTOCLOSE→ message + waitbuttonpress + closemessage
  //   MSGBOX_YESNO    → message + yesnobox
  const isSign = type === 'MSGBOX_SIGN';
  const isNpc = type === 'MSGBOX_NPC';
  const isYesNo = type === 'MSGBOX_YESNO';
  const isAutoclose = type === 'MSGBOX_AUTOCLOSE';

  let state = 0;

  const tick = (): boolean => {
    switch (state) {
      case 0: {
        // Lock + face NPC selon msgbox type.
        if (isSign) {
          // 1:1 STRICT décomp Std_MsgboxSign : lockall (= FreezeObjectEvents).
          // FreezeObjectEvent set frozen + pause sprite.animPaused (= sinon
          // anim continue à cycler face/walk visuellement malgré frozen).
          for (const n of gObjectEvents) if (n.active) FreezeObjectEvent(n);
        } else if (isNpc) {
          // 1:1 STRICT décomp `Std_MsgboxNPC` (data/scripts/std_msgbox.inc:1) :
          //   lock
          //   faceplayer
          //   message NULL
          //   ...
          //
          // `lock` (ScrCmd_lock scrcmd.c) : LockSelectedObjectEvent ; mais en
          // pratique le décomp `FreezeObjectEvents()` freeze ALL puis l'opcode
          // `release` les unfreeze. Notre TS freeze tous + select.
          //
          // `faceplayer` (ScrCmd_faceplayer scrcmd.c:1152) :
          //   ObjectEventFaceOppositeDirection(selected, playerFacing)
          //   → ObjectEventSetHeldMovement(selected,
          //       GetFaceDirectionMovementAction(GetOppositeDirection(playerFacing)))
          //   → UnfreezeObjectEvent(selected) + set heldMovementActive=TRUE
          //
          // Le prochain UpdateObjectEventCurrentMovement (= TickObjectEventMovements)
          // exec le heldMovement → MovementAction_FaceX_Step0 → FaceDirection
          // → SetObjectEventDirection + StartSpriteAnim(FACE_X).
          //
          // Sans ce path 1:1 (= G15 + G16) : NPCs WANDER/LOOK ne tournent pas
          // visuellement post-msgbox MSGBOX_NPC car set facingDirection direct
          // ne wire pas sprite.animNum (= user G16 bug "2 mecs sur la map ne
          // se tournent pas pendant le dialogue").
          const selected = getSelectedNpc();
          for (const n of gObjectEvents) {
            if (n.active && n !== selected) FreezeObjectEvent(n);
          }
          if (selected) {
            const oppositeDir = OPPOSITE_DIR[GetPlayerFacingDirection()] ?? DIR_SOUTH;
            ObjectEventSetHeldMovement(selected, _getFaceDirectionMovementAction(oppositeDir));
          }
        }
        // MSGBOX_DEFAULT / MSGBOX_AUTOCLOSE / MSGBOX_YESNO : pas de lock/face.
        ShowFieldMessage(rawText);
        state = 1;
        return false;
      }
      case 1: {
        // Wait for message done.
        if (IsFieldMessageBoxHidden()) {
          state = isYesNo ? 3 : 2;  // YesNo : skip waitbuttonpress, spawn menu directement.
        }
        return false;
      }
      case 2: {
        // Wait for A/B button press. 1:1 décomp `TextPrinterWait` (text.c:884)
        // qui PlaySE(SE_SELECT) sur A/B press → match comportement ROM.
        if (isAOrBNewlyPressed()) {
          // SE_SELECT = 5 (= 1:1 décomp constants/songs.h).
          void import('../harness/runtime/decomp-globals').then(({ PlaySE }) => PlaySE(5));
          HideFieldMessageBox();
          // 1:1 STRICT décomp `ScrCmd_release` (scrcmd.c:1251-1263) :
          //   HideFieldMessageBox()
          //   ObjectEventClearHeldMovementIfFinished(selected)
          //   ObjectEventClearHeldMovementIfFinished(player)
          //   UnfreezeObjectEvents()
          //
          // ⚠️ BUG FIX J19 : on faisait seulement UnfreezeObjectEvent (= clear
          // frozen flag), mais PAS ObjectEventClearHeldMovementIfFinished.
          // Du coup le NPC selected qui avait faceplayer set heldMovementActive=true
          // n'était jamais cleared → NPC stuck en "held face dir" → MovementType
          // WANDER_AROUND tick skip (= bloqué par ObjectEventIsHeldMovementActive
          // check dans TickObjectEventMovements). User bug : parler à FAT_MAN/BOY
          // → NPC se tourne + dialog + close → NPC freeze pour toujours.
          if (isSign) {
            for (const n of gObjectEvents) if (n.active) UnfreezeObjectEvent(n);
          } else if (isNpc) {
            const selected = getSelectedNpc();
            if (selected && selected.active) ObjectEventClearHeldMovementIfFinished(selected);
            const playerNpc = gObjectEvents[gPlayerAvatar.objectEventId];
            if (playerNpc) ObjectEventClearHeldMovementIfFinished(playerNpc);
            for (const n of gObjectEvents) if (n.active) UnfreezeObjectEvent(n);
          }
          void isAutoclose;  // future: AUTOCLOSE pourrait avoir comportement différent
          return true;  // resume bytecode
        }
        return false;
      }
      case 3: {
        // MSGBOX_YESNO : spawn YesNo menu (= 1:1 décomp std_msgbox_yesno script
        // qui call yesnobox + waitstate). Position 1:1 décomp menu.c:98-107
        // sYesNo_WindowTemplates : tilemapLeft=21, tilemapTop=9.
        spawnYesNoMenu(21, 9);
        state = 4;
        return false;
      }
      case 4: {
        // Wait yesnobox selection. Menu_ProcessInputNoWrapClearOnChoose returns
        // cursor pos (0=OUI top, 1=NON bottom), -1 (B pressed), -2 (no choice).
        // 1:1 décomp `script_menu.c:Task_HandleYesNoInput` :
        //   case 0 (OUI top)     → gSpecialVar_Result = 1 (= YES enum)
        //   case 1 / B_PRESSED  → gSpecialVar_Result = 0 (= NO enum)
        // event.inc:1932-1933 confirme : `YES = 1, NO = 0`.
        const result = Menu_ProcessInputNoWrapClearOnChoose();
        if (result === -2) return false;
        const yesNoResult = result === 0 ? 1 : 0;
        gSpecialVar.Result = yesNoResult;
        // Cleanup yesno window.
        const wid = GetYesNoWindowId();
        if (wid >= 0) {
          ClearStdWindowAndFrame(wid, true);
          RemoveWindow(wid);
        }
        // Release dialog + NPC 1:1 STRICT via UnfreezeObjectEvent (= restore
        // sprite.animPaused = backup, sinon anim stuck pause).
        // J19 FIX : aussi ClearHeldMovementIfFinished pour éviter NPC stuck post-yesno.
        HideFieldMessageBox();
        const npc = getSelectedNpc();
        if (npc && npc.active) {
          ObjectEventClearHeldMovementIfFinished(npc);
          UnfreezeObjectEvent(npc);
        }
        return true;
      }
    }
    return true;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

// ─── Aliases v* (= multi-lang) ──────────────────────────────────────────────

// 1:1 décomp `ScrCmd_vmessage / vmsgbox` (scrcmd.c) :
// Versions "v" prennent un VAR_X qui contient une string offset (= multi-language
// dynamic). Notre runtime est FR-only → traite comme alias des versions normales.
registerOpcode('vmessage', (ctx, args) => getOpcodeHandler('message')?.(ctx, args) ?? false);
registerOpcode('vmsgbox', (ctx, args) => getOpcodeHandler('msgbox')?.(ctx, args) ?? false);

// 1:1 décomp `ScrCmd_messageinstant` (scrcmd.c) : msgbox sans typewriter effect
// (= text appears all at once instead of char-by-char). Dette R3 doc : substrat
// msgbox actuel n'expose pas le flag "instant" → alias message (= typewriter
// effect quand-même). Pas critique gameplay (= seulement cosmétique typewriter
// speed).
registerOpcode('messageinstant', (ctx, args) => getOpcodeHandler('message')?.(ctx, args) ?? false);

// 1:1 décomp `ScrCmd_pokenavcall` (scrcmd.c:1275-1283) — initiates a PokéNav call.
//   2x usage in early-game (= Birch wakes you for ChooseStarter).
//   Dette R3 doc : ShowPokenavFieldMessage demande PokeNav UI subsystem entier
//   non porté (= avatar caller + frame + voice icon). Log + skip honnête.
registerOpcode('pokenavcall', (_ctx, args) => {
  console.log(`[opcode pokenavcall] '${args[0]}' — dette R3 (cascade PokeNav UI U-tier)`);
  return false;
});

// 1:1 décomp `ScrCmd_messageautoscroll` (scrcmd.c:1285-1296) — message that
// auto-scrolls. Dette R3 doc : demande msgbox + auto-advance timer (= sans
// A-press, frame counter cycle).
registerOpcode('messageautoscroll', (_ctx, args) => {
  console.log(`[opcode messageautoscroll] '${args[0]}' — dette R3 (cascade autoscroll timer U-tier)`);
  return false;
});

// ─── Braille ─────────────────────────────────────────────────────────────────

/** 1:1 décomp `ScrCmd_braillemsgbox` (= macro user-level event.inc) :
 *    affiche un message en braille font. 48x usage (Sealed Chamber, Regis caves).
 *  Dette R3 doc : braille font (= graphics/fonts/braille_font.4bpp) pas extrait
 *  côté assets ; demande font glyph rendering custom. Non critique démo Littleroot. */
registerOpcode('braillemsgbox', (_ctx, args) => {
  console.log(`[opcode braillemsgbox] '${args[0]}' — dette R3 (cascade braille font assets U-tier)`);
  return false;
});

/** 1:1 décomp `ScrCmd_braillemessage` (scrcmd.c:1481-1533) :
 *    LoadAndPrintBrailleMessage(text). Affiche un message en braille
 *    dans une fenêtre dimensionnée auto. */
registerOpcode('braillemessage', (_ctx, _args) => false);

/** 1:1 décomp `brailleformat` (event.inc:1024) — DATA marker dans le braille
 *  text payload (= 6 bytes data avant le texte braille). No-op safe. */
registerOpcode('brailleformat', (_ctx, _args) => false);

/** 1:1 décomp `ScrCmd_closebraillemessage` (scrcmd.c:1535-1539) :
 *    CloseBrailleWindow(). */
registerOpcode('closebraillemessage', (_ctx, _args) => false);


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « movement » (ex src/engine/script/script-opcodes-movement.ts)
// ═══════════════════════════════════════════════════════════════════════════
/** _vget = VarGet avec fallback '0'. Local au fichier (= 1:1 décomp inline read). */


// ─── setobjectxy / setobjectxyperm / copyobjectxytoperm ─────────────────────

registerOpcode('setobjectxy', (_ctx, args) => {
  const x = parseValue(args[1]);
  const y = parseValue(args[2]);
  const npc = findNpcByLocalId(args[0] ?? '');
  if (npc) {
    // 1:1 STRICT décomp `MoveObjectEventToMapCoords` (event_object_movement.c:2133) :
    //   SetObjectEventCoords(objectEvent, x, y);    ← update coords logiques
    //   SetSpritePosToMapCoords(...);                ← update sprite pixel pos
    //   sprite->centerToCornerVecX/Y = -(graphicsInfo->width/height >> 1);
    //   sprite->x += 8; sprite->y += 16 + ctcv;
    //   ResetObjectEventFldEffData(objectEvent);
    //
    // Sans le 2e step (sprite pixel pos), le SPRITE reste à sa position template
    // visuel même si les coords logiques changent → bug user "Birch spawn pas
    // au bon endroit" (= script setobjectxy LOCALID_ROUTE101_BIRCH, 0, 15 mais
    // sprite resta à (9, 13) = template visuel jusqu'au prochain walk).
    npc.currentCoordsX = x + MAP_OFFSET;
    npc.currentCoordsY = y + MAP_OFFSET;
    npc.previousCoordsX = x + MAP_OFFSET;
    npc.previousCoordsY = y + MAP_OFFSET;
    SetObjectEventSpritePosToMapCoords(npc, x, y);
    // Architecture web : gSaveBlock1Ptr.pos est la source UNIQUE de la position
    // player (caméra + collision isPlayerAt + re-spawn return-to-field via
    // InitPlayerAvatar). Le décomp garde pos et l'object event séparés (setobjectxy
    // ne touche pas pos ; le return-to-field PRÉSERVE l'object event), mais on a
    // unifié sur pos (CHANTIER-OW source unique). Donc un setobjectxy ciblant le
    // PLAYER doit AUSSI mettre pos à jour, sinon pos reste stale → post-combat
    // InitPlayerAvatar(pos) re-spawn le player à l'ancienne pos (bug Birch tutorial :
    // setobjectxy LOCALID_PLAYER, 6, 13 puis combat → player re-spawn au lieu de
    // déclenchement du sac au lieu de (6,13) devant le prof). La caméra se re-sync
    // au prochain frame stable (MainCB2_Overworld défensif cam≠pos → DrawWholeMapView).
    if (npc.isPlayer) {
      gSaveBlock1Ptr.pos.x = x;
      gSaveBlock1Ptr.pos.y = y;
    }
  }
  return false;
});

registerOpcode('setobjectxyperm', (_ctx, args) => {
  // 1:1 STRICT décomp `ScrCmd_setobjectxyperm` :
  //   u16 localId = VarGet(ScriptReadHalfword(ctx));
  //   u16 x = VarGet(ScriptReadHalfword(ctx));
  //   u16 y = VarGet(ScriptReadHalfword(ctx));
  //   SetObjEventTemplateCoords(localId, x, y);
  //
  // Et SetObjEventTemplateCoords (overworld.c:490) écrit dans
  // `gSaveBlock1Ptr->objectEventTemplates[]` (= PERSISTENT cross-map reload).
  const x = parseValue(args[1]);
  const y = parseValue(args[2]);
  const localIdRaw = args[0] ?? '';
  const currentMapId = gMapHeader?.id ?? GetCurrentMap()?.name ?? '';
  SetObjEventTemplateCoords(currentMapId, localIdRaw, x, y);
  // 1:1 STRICT décomp : NE PAS muter `gMapHeader.events.objectEvents` (= ROM
  // read-only dans le décomp). Seul `gSaveBlock1Ptr.objectEventTemplates` est
  // muté via SetObjEventTemplateCoords (= writable saveblock memory).
  const npc = findNpcByLocalId(args[0] ?? '');
  if (npc) {
    // Post R3 refactor : initialCoords/currentCoords INTERNAL (= +MAP_OFFSET).
    npc.initialCoordsX = x + MAP_OFFSET;
    npc.initialCoordsY = y + MAP_OFFSET;
    // Audit session 126 C6 : aussi sync `currentCoordsX/Y` + `previousCoordsX/Y`
    // pour 1:1 visuel sur les changements en cours de game.
    npc.currentCoordsX = x + MAP_OFFSET;
    npc.currentCoordsY = y + MAP_OFFSET;
    npc.previousCoordsX = x + MAP_OFFSET;
    npc.previousCoordsY = y + MAP_OFFSET;
    // 1:1 STRICT décomp `MoveObjectEventToMapCoords` (event_object_movement.c:2133) :
    // sprite pixel pos doit être recalculé avec camera offset, PAS un simple `x * 16`
    // qui ignore gFieldCamera/gTotalCamera/sFieldCameraOffset.
    SetObjectEventSpritePosToMapCoords(npc, x, y);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_copyobjectxytoperm` (scrcmd.c:1103-1109) :
 *    persist NPC current XY to template (= so NPC doesn't reset on map reload). */
registerOpcode('copyobjectxytoperm', (_ctx, args) => {
  const npc = findNpcByLocalId(args[0] ?? '');
  const tmpl = findTemplateByLocalId(args[0] ?? '');
  if (npc && tmpl) {
    tmpl.x = npc.currentCoordsX - MAP_OFFSET;
    tmpl.y = npc.currentCoordsY - MAP_OFFSET;
  }
  return false;
});

// ─── setobjectmovementtype ──────────────────────────────────────────────────

registerOpcode('setobjectmovementtype', (_ctx, args) => {
  const movementType = args[1];
  // 1:1 décomp : modifie le TEMPLATE pour que le NPC respawn avec ce movement.
  const tpl = findTemplateByLocalId(args[0] ?? '');
  if (tpl) tpl.movementTypeRaw = movementType;
  const npc = findNpcByLocalId(args[0] ?? '');
  if (npc) {
    npc.movementType = movementType;
    npc.movementStep = 0;
    // 1:1 décomp : update facingDirection en sync avec movement type pour que
    // FACE_UP/DOWN/LEFT/RIGHT applique son facing IMMÉDIATEMENT, même quand
    // le NPC est `frozen` (= lockall) et ne tick pas son movement handler.
    if (movementType) {
      const m = movementType.toUpperCase();
      let newFacing = 0;
      if (m.endsWith('_FACE_UP') || m === 'MOVEMENT_TYPE_FACE_UP') newFacing = 2;       // DIR_NORTH
      else if (m.endsWith('_FACE_DOWN') || m === 'MOVEMENT_TYPE_FACE_DOWN') newFacing = 1; // DIR_SOUTH
      else if (m.endsWith('_FACE_LEFT') || m === 'MOVEMENT_TYPE_FACE_LEFT') newFacing = 3; // DIR_WEST
      else if (m.endsWith('_FACE_RIGHT') || m === 'MOVEMENT_TYPE_FACE_RIGHT') newFacing = 4; // DIR_EAST
      else if (m.includes('WALK_IN_PLACE_DOWN')) newFacing = 1;
      else if (m.includes('WALK_IN_PLACE_UP')) newFacing = 2;
      else if (m.includes('WALK_IN_PLACE_LEFT')) newFacing = 3;
      else if (m.includes('WALK_IN_PLACE_RIGHT')) newFacing = 4;
      if (newFacing > 0) npc.facingDirection = newFacing;
    }
  }
  return false;
});

// ─── applymovement / waitmovement + variants ────────────────────────────────

/** 1:1 décomp `ScrCmd_applymovement` (scrcmd.c:992-1000) :
 *  enqueue movement actions pour l'object event ciblé (= localId arg). */
registerOpcode('applymovement', (_ctx, args) => {
  const localId = args[0] ?? '';
  const movementLabel = args[1] ?? '';
  if (!localId || !movementLabel) {
    console.warn(`[opcode applymovement] bad args : ${args.join(',')}`);
    return false;
  }
  applyMovement(localId, movementLabel);
  return false;  // Continue script tick — waitmovement bloque si nécessaire.
});

/** 1:1 décomp `ScrCmd_waitmovement` (scrcmd.c:1019-1029) :
 *    SetupNativeScript callback qui returns TRUE quand movements done.
 *    waitmovement 0 = wait pour TOUTES les queues actives.
 *    waitmovement LOCALID_X = wait pour cette queue specific. */
registerOpcode('waitmovement', (ctx, args) => {
  const target = args[0] ?? '0';
  if (target === '0' || target === '') {
    SetupNativeScript(ctx, isAllMovementsDone);
  } else {
    SetupNativeScript(ctx, () => isMovementDone(target));
  }
  return true;  // pause script ; SetupNativeScript reprendra quand done.
});

/** 1:1 décomp `ScrCmd_applymovementat` (scrcmd.c:1002-1017) :
 *    applymovement mais sur object dans (mapGroup, mapNum). Notre port :
 *    si même map → delegate à applymovement. */
registerOpcode('applymovementat', (ctx, args) => {
  return getOpcodeHandler('applymovement')?.(ctx, args) ?? false;
});

/** 1:1 décomp `ScrCmd_waitmovementat` (scrcmd.c:1031-1045) :
 *    waitmovement mais sur map spécifique. */
registerOpcode('waitmovementat', (ctx, args) => {
  return getOpcodeHandler('waitmovement')?.(ctx, args) ?? false;
});

// ─── Map scripts triggers (= map_script + map_script_2) ─────────────────────
// Ces opcodes apparaissent dans les tables OnTransition / OnFrame, pas dans
// les scripts exécutables. Les ignorer si rencontrés pendant une exécution.

registerOpcode('map_script', () => false);
registerOpcode('map_script_2', () => false);

// ─── Object event manipulation (= 1:1 décomp ScrCmd_addobject etc.) ─────────

/** 1:1 décomp `ScrCmd_addobject` (scrcmd.c:1065-1071) :
 *    TrySpawnObjectEvent(localId, mapNum, mapGroup) qui ClearFlag + spawn
 *    directement le NPC. Sans le spawn immédiat, le NPC attendrait le
 *    prochain tile cross pour apparaitre. */
registerOpcode('addobject', (_ctx, args) => {
  const localIdRaw = resolveObjectLocalIdRaw(args[0] ?? '');
  const tpl = gMapHeader?.events?.objectEvents?.find(t => t.localIdRaw === localIdRaw);
  if (tpl?.flagId) FlagClear(tpl.flagId);
  // Spawn immédiat (= 1:1 décomp behavior).
  const rt = getRuntime();
  if (rt) {
    const ok = TrySpawnObjectEvent(localIdRaw, rt);
    console.log(`[opcode addobject] ${args[0]} → ${localIdRaw} → ${ok ? 'spawned' : 'failed'}`);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_removeobject` (scrcmd.c:1047-1053) :
 *    SetFlag(flagId) + remove sprite via FreeAndDestroyObjectEventSprite. */
registerOpcode('removeobject', (_ctx, args) => {
  const localIdRaw = resolveObjectLocalIdRaw(args[0] ?? '');
  const tpl = gMapHeader?.events?.objectEvents?.find(t => t.localIdRaw === localIdRaw);
  if (tpl?.flagId) FlagSet(tpl.flagId);
  // Find active NPC + destroy sprite + mark inactive.
  const npc = gObjectEvents.find(n => n.active && n.localIdRaw === localIdRaw);
  if (npc) {
    if (npc.spriteId >= 0) {
      try {
        const rt = getRuntime();
        DestroySprite(rt, npc.spriteId);
      } catch (e) {
        console.warn(`[opcode removeobject] DestroySprite ${npc.spriteId} threw:`, e);
      }
      npc.spriteId = -1;
    }
    npc.active = false;
    npc.invisible = true;
  }
  return false;
});

/** 1:1 décomp `ScrCmd_addobjectat` (scrcmd.c:1073-1081) :
 *    addobject sur map spécifique. */
registerOpcode('addobjectat', (ctx, args) => {
  return getOpcodeHandler('addobject')?.(ctx, args) ?? false;
});

/** 1:1 décomp `ScrCmd_removeobjectat` (scrcmd.c:1055-1063) :
 *    removeobject sur map spécifique. */
registerOpcode('removeobjectat', (ctx, args) => {
  return getOpcodeHandler('removeobject')?.(ctx, args) ?? false;
});

/** 1:1 décomp `ScrCmd_showobjectat` (scrcmd.c:1111-1119) :
 *    SetObjectInvisibility(localId, ..., FALSE). */
registerOpcode('showobjectat', (_ctx, args) => {
  const npc = findNpcByLocalId(args[0] ?? '');
  if (npc) npc.invisible = false;
  return false;
});

/** 1:1 décomp `ScrCmd_hideobjectat` (scrcmd.c:1121-1129) :
 *    SetObjectInvisibility(localId, mapNum, mapGroup, TRUE).
 *  `SetObjectInvisibility` (event_object_movement.c:1939) :
 *    if (!TryGetObjectEventIdByLocalIdAndMap(...,&id))  // = SI TROUVÉ
 *      gObjectEvents[id].invisible = invisible.
 *  objet chargé → invisible=TRUE ; non chargé → NO-OP. */
registerOpcode('hideobjectat', (_ctx, args) => {
  const localId = _vget(args[0]);
  const obj = gObjectEvents.find(o => o.active && (o as unknown as { localId?: number }).localId === localId);
  if (obj) obj.invisible = true;
  return false;
});

// ─── Object subpriority (1:1 décomp ScrCmd_setobjectsubpriority) ────────────

/** 1:1 décomp ScrCmd_setobjectsubpriority (scrcmd.c:1131-1140) :
 *    SetObjectSubpriority(localId, mapNum, mapGroup, priority + 83).
 *  event_object_movement.c:SetObjectSubpriority :
 *    sprite->subpriority = priority + 83;
 *    sprite->coordOffsetEnabled = TRUE;  // = fixedPriority flag */
registerOpcode('setobjectsubpriority', (_ctx, args) => {
  const localId = _vget(args[0]);
  const _mapGroup = parseValue(args[1] ?? '0');
  const _mapNum = parseValue(args[2] ?? '0');
  const priority = parseValue(args[3] ?? '0');
  void _mapGroup; void _mapNum;
  const effective = (priority + 83) & 0xFF;
  const obj = gObjectEvents.find(o => o.active && (o as unknown as { localId?: number }).localId === localId);
  if (obj) {
    (obj as unknown as { subpriority?: number; fixedPriority?: boolean }).subpriority = effective;
    (obj as unknown as { fixedPriority?: boolean }).fixedPriority = true;
    const rt = getRuntime();
    const spriteId = (obj as unknown as { spriteId?: number }).spriteId;
    if (rt && typeof spriteId === 'number' && spriteId >= 0) {
      const spr = rt.gSprites[spriteId];
      if (spr) spr.subpriority = effective;
    }
  }
  return false;
});

/** 1:1 décomp ScrCmd_resetobjectsubpriority (scrcmd.c:1142-1150) :
 *    ResetObjectSubpriority(localId, mapNum, mapGroup).
 *  event_object_movement.c:ResetObjectSubpriority :
 *    sprite->subpriority = 0;
 *    sprite->coordOffsetEnabled = FALSE. */
registerOpcode('resetobjectsubpriority', (_ctx, args) => {
  const localId = _vget(args[0]);
  const obj = gObjectEvents.find(o => o.active && (o as unknown as { localId?: number }).localId === localId);
  if (obj) {
    (obj as unknown as { subpriority?: number; fixedPriority?: boolean }).subpriority = undefined;
    (obj as unknown as { fixedPriority?: boolean }).fixedPriority = false;
    const rt = getRuntime();
    const spriteId = (obj as unknown as { spriteId?: number }).spriteId;
    if (rt && typeof spriteId === 'number' && spriteId >= 0) {
      const spr = rt.gSprites[spriteId];
      if (spr) spr.subpriority = 0xFF;
    }
  }
  return false;
});

// ─── Virtual objects (createvobject / turnvobject) ──────────────────────────

/** 1:1 décomp ScrCmd_createvobject (scrcmd.c:1177-1188) :
 *    CreateVirtualObject(graphicsId, virtualObjId, x, y, elevation, direction). */
registerOpcode('createvobject', (_ctx, args) => {
  const graphicsId = parseValue(args[0] ?? '0');
  const virtualObjId = parseValue(args[1] ?? '0');
  const x = _vget(args[2]);
  const y = _vget(args[3]);
  const elevation = parseValue(args[4] ?? '0');
  const direction = parseValue(args[5] ?? '0');
  void (async () => {
    const vo = (globalThis as { __virtualObjects?: { CreateVirtualObject?: (g: number, id: number, x: number, y: number, e: number, d: number) => Promise<number> } }).__virtualObjects;
    if (vo?.CreateVirtualObject) {
      await vo.CreateVirtualObject(graphicsId, virtualObjId, x, y, elevation, direction);
    }
  })();
  return false;
});

/** 1:1 décomp ScrCmd_turnvobject (scrcmd.c:1190-1199) :
 *    TurnVirtualObject(virtualObjId, direction). */
registerOpcode('turnvobject', (_ctx, args) => {
  const virtualObjId = parseValue(args[0] ?? '0');
  const direction = parseValue(args[1] ?? '0');
  const vo = (globalThis as { __virtualObjects?: { TurnVirtualObject?: (id: number, d: number) => void } }).__virtualObjects;
  vo?.TurnVirtualObject?.(virtualObjId, direction);
  return false;
});

// ─── Disable jump landing ground effect ─────────────────────────────────────

/** 1:1 décomp `ScrCmd_disable_jump_landing_ground_effect` :
 *    flag sur ObjectEvent qui empêche le dust effect au landing après jump.
 *    Set sur le SELECTED object. */
registerOpcode('disable_jump_landing_ground_effect', (_ctx, _args) => {
  const npc = getSelectedNpc();
  if (npc) {
    (npc as unknown as { disableJumpLandingGroundEffect?: boolean }).disableJumpLandingGroundEffect = true;
  }
  return false;
});

// ─── Movement actions (slide_face / walk_*_affine / init_affine_anim) ──────
// 1:1 décomp NOTE : ce ne sont PAS des opcodes script, mais des MOVEMENT
// ACTIONS (= bytes dans un movement script passé à `applymovement`). Nos
// scripts contiennent parfois ces tokens directement → on les expose comme
// opcodes no-op pour éviter les warnings (= leur effet réel est dans le
// movement system géré via applymovement + waitmovement).

registerOpcode('slide_face_up', (_ctx, _args) => false);
registerOpcode('slide_face_down', (_ctx, _args) => false);
registerOpcode('slide_face_left', (_ctx, _args) => false);
registerOpcode('slide_face_right', (_ctx, _args) => false);
registerOpcode('walk_up_affine', (_ctx, _args) => false);
registerOpcode('walk_down_affine', (_ctx, _args) => false);
registerOpcode('init_affine_anim', (_ctx, _args) => false);


// ═══════════════════════════════════════════════════════════════════════════
// scrcmd.c — section « control-flow » (ex src/engine/script/script-opcodes-control-flow.ts)
// ═══════════════════════════════════════════════════════════════════════════
// ─── Control flow ────────────────────────────────────────────────────────────

registerOpcode('end', (ctx) => {
  StopScript(ctx);
  return false;  // run loop sees mode === STOPPED, exits
});

registerOpcode('return', (ctx) => {
  ScriptReturn(ctx);
  return false;
});

registerOpcode('goto', (ctx, args) => {
  const label = args[0];
  const target = getScript(label);
  if (!target) {
    console.warn(`[opcode goto] target '${label}' not found`);
    StopScript(ctx);
    return false;
  }
  ScriptJump(ctx, target);
  return false;
});

registerOpcode('call', (ctx, args) => {
  const label = args[0];
  const target = getScript(label);
  if (!target) {
    console.warn(`[opcode call] target '${label}' not found`);
    return false;
  }
  ScriptCall(ctx, target);
  return false;
});

// ─── Conditional branches ────────────────────────────────────────────────────

/** `goto_if_eq A, B, label` — A et B peuvent être var noms, immediates, OU
 *  constantes nommées (MALE/FEMALE/LOCALID_X/etc.).
 *  1:1 décomp event_data.c:VarGet : retourne le var value si id < SPECIAL_VARS,
 *  sinon retourne id (= immediate constants are passed-through). */
registerOpcode('goto_if_eq', (ctx, args) => {
  const a = parseValue(args[0]);
  const b = parseValue(args[1]);
  if (a === b) {
    const label = args[2];
    const target = getScript(label);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

registerOpcode('goto_if_ne', (ctx, args) => {
  const a = parseValue(args[0]);
  const b = parseValue(args[1]);
  if (a !== b) {
    const label = args[2];
    const target = getScript(label);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

registerOpcode('goto_if_lt', (ctx, args) => {
  if (parseValue(args[0]) < parseValue(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

registerOpcode('goto_if_gt', (ctx, args) => {
  if (parseValue(args[0]) > parseValue(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

registerOpcode('goto_if_set', (ctx, args) => {
  const flag = args[0];
  const label = args[1];
  if (FlagGet(flag)) {
    const target = getScript(label);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

registerOpcode('goto_if_unset', (ctx, args) => {
  const flag = args[0];
  const label = args[1];
  if (!FlagGet(flag)) {
    const target = getScript(label);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

registerOpcode('call_if_eq', (ctx, args) => {
  if (parseValue(args[0]) === parseValue(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptCall(ctx, target);
  }
  return false;
});

registerOpcode('call_if_ne', (ctx, args) => {
  if (parseValue(args[0]) !== parseValue(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptCall(ctx, target);
  }
  return false;
});

registerOpcode('call_if_set', (ctx, args) => {
  if (FlagGet(args[0])) {
    const target = getScript(args[1]);
    if (target) ScriptCall(ctx, target);
  }
  return false;
});

registerOpcode('call_if_unset', (ctx, args) => {
  if (!FlagGet(args[0])) {
    const target = getScript(args[1]);
    if (target) ScriptCall(ctx, target);
  }
  return false;
});

// 1:1 décomp scrcmd.c ScrCmd_callstdif / ScrCmd_gotostdif via cond comparators.
// _le / _ge complètent _lt / _gt + _eq / _ne déjà implémentés.

registerOpcode('goto_if_le', (ctx, args) => {
  if (parseValue(args[0]) <= parseValue(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

registerOpcode('goto_if_ge', (ctx, args) => {
  if (parseValue(args[0]) >= parseValue(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

registerOpcode('call_if_lt', (ctx, args) => {
  if (parseValue(args[0]) < parseValue(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptCall(ctx, target);
  }
  return false;
});

registerOpcode('call_if_gt', (ctx, args) => {
  if (parseValue(args[0]) > parseValue(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptCall(ctx, target);
  }
  return false;
});

registerOpcode('call_if_le', (ctx, args) => {
  if (parseValue(args[0]) <= parseValue(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptCall(ctx, target);
  }
  return false;
});

registerOpcode('call_if_ge', (ctx, args) => {
  if (parseValue(args[0]) >= parseValue(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptCall(ctx, target);
  }
  return false;
});

// ─── End variants (= end2/endall, alias of end) ─────────────────────────────

// 1:1 décomp `ScrCmd_endall` — like end but bypasses cleanup. Same effect.
registerOpcode('endall', (ctx) => {
  StopScript(ctx);
  return false;
});

// 1:1 décomp `ScrCmd_end2` — alternate end (= same semantic).
registerOpcode('end2', (ctx) => {
  StopScript(ctx);
  return false;
});

// ─── No-ops (1:1 décomp ScrCmd_nop/nop1) ────────────────────────────────────
registerOpcode('nop', (_ctx, _args) => false);
registerOpcode('nop1', (_ctx, _args) => false);

// ─── RAM scripts (returnram, endram) ────────────────────────────────────────

/** 1:1 décomp ScrCmd_returnram (scrcmd.c) :
 *    ScriptJump(ctx, gRamScriptRetAddr).
 *  gRamScriptRetAddr set par trywondercardscript. Notre port : pas de RAM
 *  script bytecode → équivalent à end (= stop script). */
registerOpcode('returnram', (ctx, _args) => {
  StopScript(ctx);
  return false;
});

/** 1:1 décomp ScrCmd_endram : RamScript_StopAndClear() + ScriptContext_Stop. */
registerOpcode('endram', (ctx, _args) => {
  StopScript(ctx);
  return false;
});

// ─── RAM ops (loadword / setbyte / setarg / loadbyte / setptr / etc.) ───────
// Note : ctx->data[8] (u32 array) n'existe pas dans notre ScriptContext (= on
// est label-based, pas pointer-based). Ces opcodes deviennent largely no-ops
// safe. setarg/setbyte/jumpargeq/jumpifbyte/waitplaysewithpan sont en réalité
// des battle_anim_script opcodes (= différent VM, pas le field VM) — ils
// apparaissent dans nos extracted scripts via battle anim data.

registerOpcode('loadword', (_ctx, _args) => false);
registerOpcode('setbyte', (_ctx, _args) => false);
registerOpcode('setarg', (_ctx, _args) => false);
registerOpcode('loadbyte', (_ctx, _args) => false);
registerOpcode('setptr', (_ctx, _args) => false);
registerOpcode('setptrbyte', (_ctx, _args) => false);
registerOpcode('loadbytefromptr', (_ctx, _args) => false);
registerOpcode('copybyte', (_ctx, _args) => false);
registerOpcode('copylocal', (_ctx, _args) => false);
registerOpcode('jumpargeq', (_ctx, _args) => false);
registerOpcode('jumpifbyte', (_ctx, _args) => false);
registerOpcode('jumpifbytewasset', (_ctx, _args) => false);

// ─── cmd5e (= startminigame_* etc., RS-era no-op dans Em) ───────────────────
registerOpcode('cmd5e', (_ctx, _args) => false);

// ─── Compare variants (1:1 décomp ScrCmd_compare_*) ─────────────────────────
// Notre opcode `compare` gère `var → value`. Les 6 autres variants existent
// pour comparer local-to-local, local-to-ptr, etc. Pour notre extracteur, seul
// `compare var value` est utilisé en pratique. Tous délèguent à `compare`.

registerOpcode('compare_local_to_local', (ctx, args) => getOpcodeHandler('compare')?.(ctx, args) ?? false);
registerOpcode('compare_local_to_value', (ctx, args) => getOpcodeHandler('compare')?.(ctx, args) ?? false);
registerOpcode('compare_local_to_ptr', (ctx, args) => getOpcodeHandler('compare')?.(ctx, args) ?? false);
registerOpcode('compare_ptr_to_local', (ctx, args) => getOpcodeHandler('compare')?.(ctx, args) ?? false);
registerOpcode('compare_ptr_to_value', (ctx, args) => getOpcodeHandler('compare')?.(ctx, args) ?? false);
registerOpcode('compare_ptr_to_ptr', (ctx, args) => getOpcodeHandler('compare')?.(ctx, args) ?? false);
registerOpcode('compare_var_to_value', (ctx, args) => getOpcodeHandler('compare')?.(ctx, args) ?? false);
registerOpcode('compare_var_to_var', (ctx, args) => getOpcodeHandler('compare')?.(ctx, args) ?? false);

// ─── Goto/call if (single condition byte, used internally by gotostd_if) ────

registerOpcode('goto_if', (ctx, args) => {
  // 1:1 décomp ScrCmd_goto_if : depends sur ctx->comparisonResult + condition byte.
  // condition: 0=LT, 1=EQ, 2=GT, 3=LE, 4=GE, 5=NE.
  // Notre extracteur emet goto_if_eq/_ne/etc. directement → cette forme générique
  // rarely used. Safe stub.
  void ctx; void args;
  return false;
});

registerOpcode('call_if', (ctx, args) => {
  void ctx; void args;
  return false;
});

// ─── Std scripts dispatch (1:1 décomp gStdScripts) ──────────────────────────
// gStdScripts[] (= event_scripts.s:95-107) :
//   STD_OBTAIN_ITEM (0)         → Std_ObtainItem
//   STD_FIND_ITEM (1)           → Std_FindItem
//   MSGBOX_NPC (2)              → Std_MsgboxNPC
//   MSGBOX_SIGN (3)             → Std_MsgboxSign
//   MSGBOX_DEFAULT (4)          → Std_MsgboxDefault
//   MSGBOX_YESNO (5)            → Std_MsgboxYesNo
//   MSGBOX_AUTOCLOSE (6)        → Std_MsgboxAutoclose (= trainer_battle.inc)
//   STD_OBTAIN_DECORATION (7)   → Std_ObtainDecoration
//   STD_REGISTER_MATCH_CALL (8) → Std_RegisteredInMatchCall
//   MSGBOX_GETPOINTS (9)        → Std_MsgboxGetPoints
//   MSGBOX_POKENAV (10)         → Std_MsgboxPokenav (unused — pokenavcall direct)
//
// 1:1 strict scrcmd.c:236-253 FetchScriptStdPointer + ScrCmd_gotostd/callstd :
//   const u8 *FetchScriptStdPointer(ctx, index) {
//     if (index >= NELEMS(gStdScripts)) return NULL;
//     return gStdScripts[index];
//   }
//   static bool8 ScrCmd_gotostd(ctx) {
//     u8 index = ScriptReadByte(ctx);
//     const u8 *script = FetchScriptStdPointer(ctx, index);
//     if (script != NULL) ScriptJump(ctx, script);
//     return FALSE;
//   }
//   ScrCmd_callstd idem avec ScriptCall.

const gStdScripts: readonly string[] = [
  'Std_ObtainItem',             // 0 STD_OBTAIN_ITEM
  'Std_FindItem',               // 1 STD_FIND_ITEM
  'Std_MsgboxNPC',              // 2 MSGBOX_NPC
  'Std_MsgboxSign',             // 3 MSGBOX_SIGN
  'Std_MsgboxDefault',          // 4 MSGBOX_DEFAULT
  'Std_MsgboxYesNo',            // 5 MSGBOX_YESNO
  'Std_MsgboxAutoclose',        // 6 MSGBOX_AUTOCLOSE
  'Std_ObtainDecoration',       // 7 STD_OBTAIN_DECORATION
  'Std_RegisteredInMatchCall',  // 8 STD_REGISTER_MATCH_CALL
  'Std_MsgboxGetPoints',        // 9 MSGBOX_GETPOINTS
  'Std_MsgboxPokenav',          // 10 MSGBOX_POKENAV
] as const;

/** 1:1 décomp scrcmd.c:236 `FetchScriptStdPointer`. */
function _fetchScriptStdPointer(stdIndex: number): string | null {
  if (stdIndex < 0 || stdIndex >= gStdScripts.length) return null;
  return gStdScripts[stdIndex];
}

function _runStdScript(ctx: ScriptContext, stdIndex: number, isCall: boolean): boolean {
  // 1:1 décomp scrcmd.c:238 ScrCmd_gotostd / 248 ScrCmd_callstd.
  const label = _fetchScriptStdPointer(stdIndex);
  if (!label) return false;
  const target = getScript(label);
  if (!target) {
    // Notre extracteur emet `msgbox TEXT, TYPE` direct (= macro expansion
    // partielle) au lieu de `loadword + callstd MSGBOX_X`. Le `msgbox`
    // opcode inline tout pour MSGBOX_NPC/SIGN/DEFAULT/YESNO/AUTOCLOSE.
    // Si on arrive ici sans label extrait pour un MSGBOX_*, c'est OK — log.
    if (stdIndex >= 2 && stdIndex <= 6) {
      // MSGBOX_* sans loadword préalable = comportement undefined dans décomp
      // (= message NULL). Notre msgbox inline les couvre.
      return false;
    }
    console.warn(`[opcode std] script ${label} (index=${stdIndex}) not extracted`);
    return false;
  }
  if (isCall) ScriptCall(ctx, target);
  else ScriptJump(ctx, target);
  return false;
}

registerOpcode('gotostd', (ctx, args) => {
  // 1:1 décomp ScrCmd_gotostd (scrcmd.c:235). Resolve std index → dispatch.
  const stdIndex = parseValue(args[0] ?? '0');
  return _runStdScript(ctx, stdIndex, false);
});

registerOpcode('callstd', (ctx, args) => {
  // 1:1 décomp ScrCmd_callstd (scrcmd.c:245).
  const stdIndex = parseValue(args[0] ?? '0');
  return _runStdScript(ctx, stdIndex, true);
});

// 1:1 décomp `sScriptConditionTable[6][3]` (scrcmd.c:76-85). Lignes = condition byte
// {0:'<', 1:'=', 2:'>', 3:'<=', 4:'>=', 5:'!='} ; colonnes = ctx.comparisonResult
// {0:LESS, 1:EQUAL, 2:GREATER, cf. Compare/COMPARE_LT/EQ/GT}. Vaut 1 si la branche est prise.
const sScriptConditionTable: ReadonlyArray<readonly number[]> = [
  [1, 0, 0], // <
  [0, 1, 0], // =
  [0, 0, 1], // >
  [1, 1, 0], // <=
  [0, 1, 1], // >=
  [1, 0, 1], // !=
];

registerOpcode('gotostd_if', (ctx, args) => {
  // 1:1 décomp `ScrCmd_gotostd_if` (scrcmd.c:255-267) : ne JUMP vers le std-script QUE si
  // sScriptConditionTable[condition][comparisonResult] == 1 (sinon no-op). Le `compare`
  // précédent a posé ctx.comparisonResult.
  const condition = parseValue(args[0] ?? '0');
  const stdIndex = parseValue(args[1] ?? '0');
  if (sScriptConditionTable[condition]?.[ctx.comparisonResult] === 1) {
    return _runStdScript(ctx, stdIndex, false);
  }
  return false;
});

registerOpcode('callstd_if', (ctx, args) => {
  // 1:1 décomp `ScrCmd_callstd_if` (scrcmd.c:269-281) : ne CALL le std-script QUE si
  // sScriptConditionTable[condition][comparisonResult] == 1 (sinon no-op).
  const condition = parseValue(args[0] ?? '0');
  const stdIndex = parseValue(args[1] ?? '0');
  if (sScriptConditionTable[condition]?.[ctx.comparisonResult] === 1) {
    return _runStdScript(ctx, stdIndex, true);
  }
  return false;
});

// ─── Virtual address scripts (Mystery Event) ─────────────────────────────────

/** 1:1 décomp `sAddressOffset` (scrcmd.c:48). Set par `setvaddress`, utilisé
 *  par `vgoto/vcall/vmessage/vbufferstring`. Pour les scripts Mystery Event
 *  qui pointent vers du bytecode RAM relatif à un base addr. */
let _sAddressOffset = 0;

registerOpcode('setvaddress', (_ctx, args) => {
  // 1:1 décomp ScrCmd_setvaddress (scrcmd.c:190). Pour scripts WonderCard / RAM
  // qui contiennent du bytecode chargé dynamiquement avec addr relative.
  // Notre port : scripts sont label-based (string), pas pointer-based. On
  // stocke l'offset pour cohérence mais ne l'utilise pas en pratique.
  _sAddressOffset = parseInt(args[0] ?? '0', 10);
  return false;
});
void _sAddressOffset;  // exposed for future Mystery Event impl.

registerOpcode('vgoto', (ctx, args) => {
  // 1:1 décomp ScrCmd_vgoto : ScriptJump(ctx, addr - sAddressOffset).
  // Notre port : args[0] est un label string, le offset ne s'applique pas.
  return getOpcodeHandler('goto')?.(ctx, args) ?? false;
});

registerOpcode('vcall', (ctx, args) => {
  // 1:1 décomp ScrCmd_vcall : ScriptCall(ctx, addr - sAddressOffset).
  return getOpcodeHandler('call')?.(ctx, args) ?? false;
});

registerOpcode('vgoto_if_eq', (ctx, args) => {
  return getOpcodeHandler('goto_if_eq')?.(ctx, args) ?? false;
});

registerOpcode('vgoto_if_set', (ctx, args) => {
  return getOpcodeHandler('goto_if_set')?.(ctx, args) ?? false;
});

registerOpcode('vgoto_if_unset', (ctx, args) => {
  return getOpcodeHandler('goto_if_unset')?.(ctx, args) ?? false;
});

registerOpcode('vcall_if_eq', (ctx, args) => {
  return getOpcodeHandler('call_if_eq')?.(ctx, args) ?? false;
});

registerOpcode('vcall_if_set', (ctx, args) => {
  return getOpcodeHandler('call_if_set')?.(ctx, args) ?? false;
});

registerOpcode('vcall_if_unset', (ctx, args) => {
  return getOpcodeHandler('call_if_unset')?.(ctx, args) ?? false;
});

// ─── Native function calls (callnative/gotonative) ──────────────────────────

registerOpcode('callnative', (_ctx, args) => {
  // 1:1 décomp ScrCmd_callnative (scrcmd.c:134-140). Called function pointer
  // directement avec aucun arg. Dans notre port, args[0] est le nom de la
  // fonction (e.g., "CleanupVariableScripts"). Dispatch via specials registry.
  const funcName = args[0] ?? '';
  if (!funcName) return false;
  invokeSpecial(funcName);
  return false;
});

registerOpcode('gotonative', (ctx, args) => {
  // 1:1 décomp ScrCmd_gotonative (scrcmd.c:110-116). SetupNativeScript(ctx, addr).
  // Native fn polled every frame jusqu'à return TRUE.
  const funcName = args[0] ?? '';
  if (!funcName) return false;
  let done = false;
  const poll = (): boolean => {
    if (!done) {
      done = true;
      invokeSpecial(funcName);
    }
    return true;  // resume after 1 frame
  };
  SetupNativeScript(ctx, poll);
  return true;
});

// ─── Script cmd table entry marker (= pas un opcode actif) ──────────────────
registerOpcode('script_cmd_table_entry', (_ctx, _args) => false);

// NOTE : les opcodes battle anim / battle script / AI / contest restent dans
// `script-opcodes.ts` (= `_safeStubOpcodes` + `_otherVmStubs`). Ils ne sont
// PAS dans scrcmd.c — ce sont d'autres VMs (battle_anim_script.inc,
// battle_script.inc, etc.). Notre extracteur les collecte par regex mais
// ils ne sont jamais exécutés par le field script VM.

