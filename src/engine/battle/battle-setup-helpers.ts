/**
 * battle/battle-setup-helpers.ts — Port 1:1 strict des helpers setup battle.
 *
 * Sources de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_controllers.c:43-79`
 *     (SetUpBattleVarsAndBirchZigzagoon)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_setup.c:636-`
 *     (BattleSetup_GetEnvironmentId)
 *
 * Fonctions portées 1:1 strict :
 *   - SetUpBattleVarsAndBirchZigzagoon (43-79) — setup battle vars + spawn
 *     Zigzagoon LV 2 wild si BATTLE_TYPE_FIRST_BATTLE (= Birch tutorial)
 *   - BattleSetup_GetEnvironmentId (636-) — determine battle environment
 *     (= GRASS / SAND / CAVE / WATER / etc.) depuis metatile behavior
 *
 * Dépendances :
 *   - state.ts : gActiveBattler, gActionSelectionCursor, gMoveSelectionCursor,
 *     gBattleTypeFlags, setBattleControllerExcFlags
 *   - constants.ts : MAX_BATTLERS_COUNT, BATTLE_TYPE_FIRST_BATTLE
 *   - battle-main-functions.ts : BeginBattleIntroDummy (K8 porté)
 *   - decomp-data : SPECIES_ZIGZAGOON, OT_ID_PLAYER_ID
 */

import {
  gActionSelectionCursor, gMoveSelectionCursor,
  gBattleTypeFlags, setBattleTypeFlags,
  setBattleControllerExecFlags, setActiveBattler,
  MAX_BATTLERS_COUNT,
  gBattlerControllerFuncs,
} from './state';
import { BATTLE_TYPE_FIRST_BATTLE, BATTLE_TYPE_TRAINER } from './constants';
// Namespace ESM (remplace require('./state') CommonJS, dormant → throw en navigateur).
import * as _stateNs from './state';
import { gBattlerPositions } from './util';
// E1 : MetatileBehavior_Is* sont des fonctions PURES (metatile-behavior.ts
// n'importe que des constantes MB_*, ZÉRO cycle avec battle). Import direct safe.
import {
  MetatileBehavior_IsTallGrass, MetatileBehavior_IsLongGrass,
  MetatileBehavior_IsSandOrDeepSand, MetatileBehavior_IsIndoorEncounter,
  MetatileBehavior_IsSurfableWaterOrUnderwater,
  MetatileBehavior_IsDeepOrOceanWater, MetatileBehavior_IsMountain,
} from '../field/metatile-behavior';
// Sélection de transition de combat (GetWildBattleTransition) : lecture niveaux party.
// Importé direct (usage RUNTIME uniquement, dans des fns → pas de TDZ même si cycle).
import { GetMonData, gPlayerParty, gEnemyParty, PARTY_SIZE, setupEnemyPartyForBattle } from './party-storage';
// Entrees voie L (scripted-wild) : enemy mon plein + boot de la VRAIE boucle decomp.
// Imports RUNTIME (usage en fonction -> pas de TDZ meme si cycle ESM ; battle-decomp-loop
// n'importe pas ce module en retour, il passe par un wire globalThis).
import { createPokemonInstance } from '../pokemon/pokemon';
import { reverseDecompConstant } from '../system/decomp-constants';
import { bootDecompBattleLoop } from './battle-decomp-loop';
// Fin de combat dresseur (lose_text) : expand placeholders + label->bytes.
import { StringExpandPlaceholders } from '../../game/string_util';
import { getText } from '../script/script-runtime';
// Constantes auto-extraites (règle [[feedback-no-hardcoded-decomp-values]]).
import { ENUM_TRANSITION_0 } from '../decomp-data/src/battle_setup-data';
import { ENUM_B_1 as B_TRANSITION } from '../decomp-data/include/battle_transition-data';
// SPECIES_ZIGZAGOON (= 288) depuis le leaf auto-extrait (règle [[feedback-no-hardcoded-decomp-values]]).
import { SPECIES_ZIGZAGOON } from '../decomp-data/include/constants/species-data';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

// (SPECIES_ZIGZAGOON importé du leaf species-data ci-dessus = 288. L'ancien
//  hardcode local `= 287` était FAUX : 287 = SPECIES_MIGHTYENA → la tuto Birch
//  spawnait un Médhyéna au lieu d'un Zigzaton. Décomp species.h:294 = 288.)

/** 1:1 décomp `OT_ID_PLAYER_ID` = 0 (= utilise gSaveBlock2Ptr->playerTrainerId). */
const OT_ID_PLAYER_ID = 0;

/** 1:1 décomp `USE_RANDOM_IVS` (pokemon.c) = MAX_PER_STAT_IVS + 1 = 32. */
const USE_RANDOM_IVS = 32;

/** 1:1 décomp `BATTLE_ENVIRONMENT_*` (constants/battle.h). */
export const BATTLE_ENVIRONMENT_GRASS = 0;
export const BATTLE_ENVIRONMENT_LONG_GRASS = 1;
export const BATTLE_ENVIRONMENT_SAND = 2;
export const BATTLE_ENVIRONMENT_UNDERWATER = 3;
export const BATTLE_ENVIRONMENT_WATER = 4;
export const BATTLE_ENVIRONMENT_POND = 5;
export const BATTLE_ENVIRONMENT_MOUNTAIN = 6;
export const BATTLE_ENVIRONMENT_CAVE = 7;
export const BATTLE_ENVIRONMENT_BUILDING = 8;
export const BATTLE_ENVIRONMENT_PLAIN = 9;

/** 1:1 décomp `MAP_TYPE_*` (constants/map_types.h). */
const MAP_TYPE_TOWN = 1;
const MAP_TYPE_CITY = 2;
const MAP_TYPE_ROUTE = 3;
const MAP_TYPE_UNDERGROUND = 4;
const MAP_TYPE_UNDERWATER = 5;
const MAP_TYPE_OCEAN_ROUTE = 6;
const MAP_TYPE_UNKNOWN = 7;
const MAP_TYPE_INDOOR = 8;
const MAP_TYPE_SECRET_BASE = 9;

/** 1:1 décomp `MON_DATA_HELD_ITEM` = 22. */
const MON_DATA_HELD_ITEM = 22;

// ─── Cascade helpers (= dette R3 documentée) ───────────────────────────────

/** 1:1 décomp `BattleControllerDummy` (battle_controllers.c). No-op callback.
 *  Posé dans la table partagée `gBattlerControllerFuncs` (state.ts) par
 *  SetUpBattleVarsAndBirchZigzagoon, remplacé ensuite par SetControllerTo* . */
function BattleControllerDummy(): void {
  // 1:1 : callback no-op (le battler n'a pas encore de controller assigné).
}

/** 1:1 décomp `HandleLinkBattleSetup()`. */
function HandleLinkBattleSetup(): void {
  // Dette R3 : link battle handshake. Notre port : noop (no link battle).
}

/** 1:1 décomp `ClearBattleAnimationVars()`. Wire vers battle-anim-interpreter K1. */
function ClearBattleAnimationVars(): void {
  const ba = (globalThis as Record<string, unknown>).__battleAnim as {
    ClearBattleAnimationVars?: () => void;
  } | undefined;
  ba?.ClearBattleAnimationVars?.();
}

/** 1:1 décomp `ClearBattleMonForms()`. */
function ClearBattleMonForms(): void {
  // Dette R3 : per-battler form tracker (Castform weather / Unown letter).
}

/** 1:1 décomp `BattleAI_HandleItemUseBeforeAISetup(itemMask)`. */
function BattleAI_HandleItemUseBeforeAISetup(_itemMask: number): void {
  // Dette R3 : trainer pre-battle items use (= X Attack / Guard Spec).
}

/** 1:1 décomp `ZeroEnemyPartyMons()`. */
function _ZeroEnemyPartyMons(): void {
  const stateMod = _stateNs as unknown as { gEnemyParty?: unknown[] };
  if (stateMod.gEnemyParty) {
    for (let i = 0; i < 6; i++) {
      stateMod.gEnemyParty[i] = null;
    }
  }
}

/** 1:1 décomp `CreateMon(...)`. */
function _CreateMon(
  monSlot: number, species: number, level: number, _fixedIV: number,
  _useRandomIvs: number, _personality: number, _otIdType: number, _otIdNum: number,
): void {
  const stateMod = _stateNs as unknown as { gEnemyParty?: unknown[] };
  if (stateMod.gEnemyParty) {
    stateMod.gEnemyParty[monSlot] = {
      species, level,
      moves: [0, 0, 0, 0], pp: [0, 0, 0, 0],
      heldItem: 0,
    };
  }
}

/** 1:1 décomp `SetMonData(mon, field, value)`. */
function _SetMonData(monSlot: number, field: number, value: number): void {
  const stateMod = _stateNs as unknown as { gEnemyParty?: Array<{ heldItem?: number }> };
  if (stateMod.gEnemyParty?.[monSlot] && field === MON_DATA_HELD_ITEM) {
    stateMod.gEnemyParty[monSlot].heldItem = value;
  }
}

// ─── SetUpBattleVarsAndBirchZigzagoon (battle_controllers.c:43-79) ─────────

/** 1:1 décomp `SetUpBattleVarsAndBirchZigzagoon()` (battle_controllers.c:43-79).
 *  Setup initial des vars battle + spawn Zigzagoon LV2 si tutorial Birch.
 *
 *  Appelé par CB2_InitBattleInternal (= battle_main.c:684). */
export function SetUpBattleVarsAndBirchZigzagoon(): void {
  // 1:1 décomp l. 47 : gBattleMainFunc = BeginBattleIntroDummy.
  const bmf = (globalThis as Record<string, unknown>).__battleMainFunctions as {
    setBattleMainFunc?: (fn: () => void) => void;
    BeginBattleIntroDummy?: () => void;
  } | undefined;
  if (bmf?.setBattleMainFunc && bmf.BeginBattleIntroDummy) {
    bmf.setBattleMainFunc(bmf.BeginBattleIntroDummy);
  }

  // 1:1 décomp ll. 49-55 : init controller funcs + positions + UI cursors.
  for (let i = 0; i < MAX_BATTLERS_COUNT; i++) {
    gBattlerControllerFuncs[i] = BattleControllerDummy;
    gBattlerPositions[i] = 0xFF;
    gActionSelectionCursor[i] = 0;
    gMoveSelectionCursor[i] = 0;
  }

  HandleLinkBattleSetup();
  setBattleControllerExecFlags(0);
  ClearBattleAnimationVars();
  ClearBattleMonForms();

  // 1:1 décomp ll. 61-65 : UBFIX active = reset gActiveBattler = 0.
  setActiveBattler(0);

  BattleAI_HandleItemUseBeforeAISetup(0xF);

  // 1:1 décomp ll. 68-74 : Birch tutorial = spawn Zigzagoon LV 2.
  // ZeroEnemyPartyMons + CreateMon(&gEnemyParty[0], SPECIES_ZIGZAGOON, 2, USE_RANDOM_IVS,...) +
  // SetMonData(HELD_ITEM, 0). Voie L : mon PLEIN via createPokemonInstance (= CreateMon réel :
  // stats/moves/IVs) dans le gEnemyParty que LIT la voie L (party-storage, = chemin wild prouvé).
  // L'ancien _CreateMon (state ns, simplifié sans stats/moves) = combat injouable en voie L.
  if (gBattleTypeFlags & BATTLE_TYPE_FIRST_BATTLE) {
    setupEnemyPartyForBattle([
      createPokemonInstance(reverseDecompConstant(SPECIES_ZIGZAGOON, 'SPECIES_') ?? 'SPECIES_ZIGZAGOON', 2),
    ]);
  }

  // 1:1 décomp ll. 77-78 : unused vars (never read).
  // gUnusedFirstBattleVar1 = 0; gUnusedFirstBattleVar2 = 0;
}

// ─── Scripted wild battle (battle_setup.c + scrcmd.c) — DORMANT (#suppr voie V) ──
// Port strict 1:1 des entrees scripted-wild de la voie L. DORMANT : pas encore
// cable aux opcodes setwildbattle/dowildbattle (le flip + A/B = etape suivante,
// cf. [[voie-v-suppression-plan]] GAP-3). Additif -> 0 regression.

/** 1:1 décomp `CreateScriptedWildMon(u16 species, u8 level, u16 item)` (battle_setup.c).
 *  ZeroEnemyPartyMons + CreateMon(&gEnemyParty[0], species, level, USE_RANDOM_IVS,...) +
 *  (si item) SetMonData(MON_DATA_HELD_ITEM, item). Notre port : `setupEnemyPartyForBattle`
 *  zéro gEnemyParty puis remplit le slot 0 avec un mon PLEIN (createPokemonInstance =
 *  CreateMon 1:1, stats/moves/IVs réels — PAS le _CreateMon simplifié de Birch).
 *  Appelé par ScrCmd_setwildbattle (scrcmd.c:1869). */
export function CreateScriptedWildMon(species: number, level: number, item: number): void {
  const speciesEnum = reverseDecompConstant(species, 'SPECIES_') ?? 'SPECIES_NONE';
  const heldItem = item ? (reverseDecompConstant(item, 'ITEM_') ?? undefined) : undefined;
  setupEnemyPartyForBattle([
    createPokemonInstance(speciesEnum, level, heldItem ? { heldItem } : undefined),
  ]);
}

/** 1:1 décomp `BattleSetup_StartScriptedWildBattle(void)` (battle_setup.c:489-499).
 *  LockPlayerFieldControls + `gMain.savedCallback = CB2_EndScriptedWildBattle` +
 *  `gBattleTypeFlags = 0` + `CreateBattleStartTask(GetWildBattleTransition(), 0)` +
 *  IncrementGameStat(TOTAL/WILD) + IncrementDailyWildBattles + TryUpdateGymLeaderRematchFromWild.
 *  Notre port : `bootDecompBattleLoop(true)` = CreateBattleStartTask (transition d'entrée)
 *  + PlayBattleBGM + swap CB2_InitBattle + retour OW (= équivalent du savedCallback). La
 *  CONTINUATION du script (CB2_EndScriptedWildBattle → CB2_ReturnToFieldContinueScript) est
 *  assurée par le poll `SetupNativeScript` du caller ScrCmd_dowildbattle (qui reprend le
 *  script quand la scène combat rend la main), 1:1 le `ScriptContext_Stop()` de scrcmd.c:1882.
 *  Appelé par ScrCmd_dowildbattle (scrcmd.c:1879). gEnemyParty[0] déjà posé par CreateScriptedWildMon. */
export function BattleSetup_StartScriptedWildBattle(): void {
  // 1:1 décomp l.493 : `gBattleTypeFlags = 0` (overwrite — combat sauvage scripté pur).
  setBattleTypeFlags(0);
  // 1:1 décomp l.494 : CreateBattleStartTask(GetWildBattleTransition(), 0) + (l.407 modèle)
  // gMain.savedCallback = retour OW. bootDecompBattleLoop(true) encapsule les deux (1:1 CreateWildMon).
  bootDecompBattleLoop(true);
  // DETTE 1:1 (hors démo) : IncrementGameStat(GAME_STAT_TOTAL_BATTLES/WILD_BATTLES) +
  // IncrementDailyWildBattles + TryUpdateGymLeaderRematchFromWild (stats/rematch) — non portés.
}

/** 1:1 décomp `CB2_StartFirstBattle` (battle_setup.c:930-948) — entrée du 1er combat
 *  (tutoriel Birch, Zigzagoon Lv2). `gBattleTypeFlags = BATTLE_TYPE_FIRST_BATTLE` +
 *  `gMain.savedCallback = CB2_EndFirstBattle` + `SetMainCallback2(CB2_InitBattle)`.
 *  L'ennemi Zigzagoon est spawné par SetUpBattleVarsAndBirchZigzagoon (appelé dans le boot
 *  CB2_InitBattleInternal, gate FIRST_BATTLE). Notre port : setBattleTypeFlags +
 *  bootDecompBattleLoop(true) (= CreateBattleStartTask + swap CB2_InitBattle + retour OW).
 *  Remplace la voie V `startBirchTutorialBattle` (suppression voie V). DETTE 1:1 : la
 *  transition décomp est B_TRANSITION_BLUR (CB2_GiveStarter) ; bootDecompBattleLoop fait
 *  un fallback SLICE (transitions visuelles pas toutes portées). */
export function StartFirstBattle(): void {
  setBattleTypeFlags(BATTLE_TYPE_FIRST_BATTLE >>> 0);
  bootDecompBattleLoop(true);
}

/** 1:1 décomp `BattleSetup_StartTrainerBattle` (battle_setup.c:1272-1325) — single, hors
 *  frontier/hill. `gBattleTypeFlags = BATTLE_TYPE_TRAINER` + `gMain.savedCallback =
 *  CB2_EndTrainerBattle` + `DoTrainerBattle` (459 = CreateBattleStartTask(GetTrainerBattleTransition,0))
 *  + `ScriptContext_Stop`. Voie L : `gTrainerBattleOpponent_A` déjà posé par le caller ;
 *  `CreateNPCTrainerParty` est appelé À L'INIT (CB2_InitBattleInternal, battle_main.ts:836) →
 *  peuple gEnemyParty. `bootDecompBattleLoop(true)` = CreateBattleStartTask + swap CB2_InitBattle
 *  + retour OW. DETTE 1:1 : IncrementGameStat(TOTAL/TRAINER_BATTLES) + TryUpdateGymLeaderRematchFromTrainer
 *  (stats) + GetTrainerBattleTransition (transition spécifique → fallback SLICE) — non portés. */
// 1:1 décomp battle_setup.c:102 (EWRAM `sTrainerADefeatSpeech`) — lose_text du macro
// trainerbattle (bytes charmap, deja encodes). NULL -> "" (gText_EmptyString2).
let sTrainerADefeatSpeech: Uint8Array | null = null;
export function setTrainerADefeatSpeech(s: Uint8Array | null): void { sTrainerADefeatSpeech = s; }
export function getTrainerADefeatSpeech(): Uint8Array | null { return sTrainerADefeatSpeech; }

/** 1:1 décomp `GetTrainerALoseText` (battle_setup.c:1517-1528, hors SECRET_BASE non géré voie L) :
 *  `string = sTrainerADefeatSpeech; StringExpandPlaceholders(gStringVar4, string); return gStringVar4;`
 *  ⚠️ StringExpandPlaceholders ECRIT dans `out` et RETOURNE le pointeur AVANCE (pas le buffer) ->
 *  on retourne `out` (= gStringVar4), pas le retour de l'appel. */
export function GetTrainerALoseText(): Uint8Array {
  const out = new Uint8Array(256);
  StringExpandPlaceholders(out, sTrainerADefeatSpeech ?? new Uint8Array([0xFF]));
  return out;
}

export function BattleSetup_StartTrainerBattle(defeatTextLabel?: string): void {
  setBattleTypeFlags(BATTLE_TYPE_TRAINER >>> 0);
  // 1:1 battle_setup.c:168 (TrainerBattleLoadArgs charge sTrainerADefeatSpeech depuis le lose_text
  // du macro). getText(label) = bytes charmap, undefined si absent -> null.
  setTrainerADefeatSpeech(defeatTextLabel ? (getText(defeatTextLabel) ?? null) : null);
  bootDecompBattleLoop(true);
}

// ─── BattleSetup_GetEnvironmentId (battle_setup.c:636) ─────────────────────

/** E1 wire 1:1 strict : `PlayerGetDestCoords` (field_player_avatar.c) lit
 *  gObjectEvents[playerObjId].currentCoords (= coords INTERNAL avec MAP_OFFSET).
 *  Lazy lookup via globalThis.__gObjectEvents pour éviter cycle ESM avec
 *  player-avatar/object-events (= hubs field). */
function _PlayerGetDestCoords(): { x: number; y: number } {
  const oes = (globalThis as { __gObjectEvents?: Array<{ active?: boolean; isPlayer?: boolean; currentCoordsX?: number; currentCoordsY?: number }> }).__gObjectEvents;
  if (oes) {
    // gObjectEvents[0] = player en single. Cherche le 1er actif isPlayer pour robustesse.
    for (const oe of oes) {
      if (oe?.active && oe.isPlayer) {
        return { x: oe.currentCoordsX ?? 0, y: oe.currentCoordsY ?? 0 };
      }
    }
    // Fallback slot 0.
    const p = oes[0];
    if (p) return { x: p.currentCoordsX ?? 0, y: p.currentCoordsY ?? 0 };
  }
  return { x: 0, y: 0 };
}

/** E1 wire : `MapGridGetMetatileBehaviorAt(x, y)` (map-loader.ts:1721) exposé
 *  global. Prend coords INTERNAL. */
function _MapGridGetMetatileBehaviorAt(x: number, y: number): number {
  const fn = (globalThis as { MapGridGetMetatileBehaviorAt?: (x: number, y: number) => number }).MapGridGetMetatileBehaviorAt;
  return fn ? fn(x, y) : 0;
}

/** E1 wire : `gMapHeader.mapType` (= STRING "MAP_TYPE_ROUTE" dans notre port)
 *  → number 1:1 décomp enum. */
const _MAP_TYPE_STR_TO_NUM: Record<string, number> = {
  MAP_TYPE_TOWN: MAP_TYPE_TOWN, MAP_TYPE_CITY: MAP_TYPE_CITY,
  MAP_TYPE_ROUTE: MAP_TYPE_ROUTE, MAP_TYPE_UNDERGROUND: MAP_TYPE_UNDERGROUND,
  MAP_TYPE_UNDERWATER: MAP_TYPE_UNDERWATER, MAP_TYPE_OCEAN_ROUTE: MAP_TYPE_OCEAN_ROUTE,
  MAP_TYPE_UNKNOWN: MAP_TYPE_UNKNOWN, MAP_TYPE_INDOOR: MAP_TYPE_INDOOR,
  MAP_TYPE_SECRET_BASE: MAP_TYPE_SECRET_BASE,
};
function _getMapType(): number {
  const mh = (globalThis as { gMapHeader?: { mapType?: number | string } }).gMapHeader;
  const mt = mh?.mapType;
  if (typeof mt === 'number') return mt;
  if (typeof mt === 'string') return _MAP_TYPE_STR_TO_NUM[mt] ?? MAP_TYPE_TOWN;
  return MAP_TYPE_TOWN;
}

/** 1:1 décomp `BattleSetup_GetEnvironmentId()` (battle_setup.c:636-).
 *  Returns le BATTLE_ENVIRONMENT_* depuis metatile behavior + map type. */
export function BattleSetup_GetEnvironmentId(): number {
  const { x, y } = _PlayerGetDestCoords();
  const tileBehavior = _MapGridGetMetatileBehaviorAt(x, y);

  if (MetatileBehavior_IsTallGrass(tileBehavior)) return BATTLE_ENVIRONMENT_GRASS;
  if (MetatileBehavior_IsLongGrass(tileBehavior)) return BATTLE_ENVIRONMENT_LONG_GRASS;
  if (MetatileBehavior_IsSandOrDeepSand(tileBehavior)) return BATTLE_ENVIRONMENT_SAND;

  const mapType = _getMapType();
  switch (mapType) {
    case MAP_TYPE_TOWN:
    case MAP_TYPE_CITY:
    case MAP_TYPE_ROUTE:
      break;
    case MAP_TYPE_UNDERGROUND:
      if (MetatileBehavior_IsIndoorEncounter(tileBehavior)) return BATTLE_ENVIRONMENT_BUILDING;
      if (MetatileBehavior_IsSurfableWaterOrUnderwater(tileBehavior)) return BATTLE_ENVIRONMENT_POND;
      return BATTLE_ENVIRONMENT_CAVE;
    case MAP_TYPE_INDOOR:
    case MAP_TYPE_SECRET_BASE:
      return BATTLE_ENVIRONMENT_BUILDING;
    case MAP_TYPE_UNDERWATER:
      return BATTLE_ENVIRONMENT_UNDERWATER;
    case MAP_TYPE_OCEAN_ROUTE:
      if (MetatileBehavior_IsSurfableWaterOrUnderwater(tileBehavior)) return BATTLE_ENVIRONMENT_WATER;
      return BATTLE_ENVIRONMENT_PLAIN;
  }

  if (MetatileBehavior_IsDeepOrOceanWater(tileBehavior)) return BATTLE_ENVIRONMENT_WATER;
  if (MetatileBehavior_IsSurfableWaterOrUnderwater(tileBehavior)) return BATTLE_ENVIRONMENT_POND;
  if (MetatileBehavior_IsMountain(tileBehavior)) return BATTLE_ENVIRONMENT_MOUNTAIN;

  return BATTLE_ENVIRONMENT_PLAIN;
}

// ─── Sélection de transition de combat (battle_setup.c:696-861) ─────────────
//
// 1:1 strict. Le décomp choisit le TYPE de transition (B_TRANSITION_*) à passer à
// `CreateBattleStartTask(transition, song)` selon : type de zone (normal/grotte/flash/
// eau) × difficulté (ennemi plus faible que le joueur ? table[0] : table[1]).
// L'exécuteur (battle-decomp-loop.ts `_makeBattleStartTransitionCB2`) consomme l'ID
// et fait un fallback gracieux vers SLICE pour les transitions pas encore implémentées
// (= 100% des non-SLICE = chantier VISUEL/A/B). Ici = la LOGIQUE déterministe « chaque cas ».

/** 1:1 décomp `MON_DATA_SPECIES_OR_EGG` (pokemon.h enum) = 65. */
const MON_DATA_SPECIES_OR_EGG = 65;
/** 1:1 décomp `MON_DATA_HP` = 39. */
const MON_DATA_HP = 39;
/** 1:1 décomp `MON_DATA_LEVEL` = 56. */
const MON_DATA_LEVEL = 56;
/** 1:1 décomp `SPECIES_NONE` = 0 / `SPECIES_EGG` = 412. */
const SPECIES_NONE = 0;
const SPECIES_EGG = 412;

const { TRANSITION_TYPE_NORMAL, TRANSITION_TYPE_CAVE, TRANSITION_TYPE_FLASH, TRANSITION_TYPE_WATER } = ENUM_TRANSITION_0;

/** 1:1 décomp `sBattleTransitionTable_Wild[][2]` (battle_setup.c:114-120). La 1re
 *  transition est utilisée si l'ennemi est de niveau INFÉRIEUR au joueur, sinon la 2e.
 *  (static const array — non auto-extrait ; transcrit 1:1 avec constantes ENUM_B_1.) */
const sBattleTransitionTable_Wild: Record<number, [number, number]> = {
  [TRANSITION_TYPE_NORMAL]: [B_TRANSITION.B_TRANSITION_SLICE,          B_TRANSITION.B_TRANSITION_WHITE_BARS_FADE],
  [TRANSITION_TYPE_CAVE]:   [B_TRANSITION.B_TRANSITION_CLOCKWISE_WIPE, B_TRANSITION.B_TRANSITION_GRID_SQUARES],
  [TRANSITION_TYPE_FLASH]:  [B_TRANSITION.B_TRANSITION_BLUR,           B_TRANSITION.B_TRANSITION_GRID_SQUARES],
  [TRANSITION_TYPE_WATER]:  [B_TRANSITION.B_TRANSITION_WAVE,           B_TRANSITION.B_TRANSITION_RIPPLE],
};

/** E1 wire : `GetFlashLevel()` (field_weather / overworld) — niveau d'obscurité Flash
 *  (grottes sans Flash). Exposé global best-effort ; défaut 0 (= pas de flash, 1:1 hors
 *  grotte). field-weather pas toujours câblé en voie L → défaut sûr. */
function _GetFlashLevel(): number {
  const fn = (globalThis as { GetFlashLevel?: () => number }).GetFlashLevel;
  return fn ? (fn() | 0) : 0;
}

/** 1:1 décomp `GetBattleTransitionTypeByMap()` (battle_setup.c:696-719). */
export function GetBattleTransitionTypeByMap(): number {
  const { x, y } = _PlayerGetDestCoords();
  const tileBehavior = _MapGridGetMetatileBehaviorAt(x, y);

  if (_GetFlashLevel()) return TRANSITION_TYPE_FLASH;
  if (MetatileBehavior_IsSurfableWaterOrUnderwater(tileBehavior)) return TRANSITION_TYPE_WATER;

  switch (_getMapType()) {
    case MAP_TYPE_UNDERGROUND: return TRANSITION_TYPE_CAVE;
    case MAP_TYPE_UNDERWATER:  return TRANSITION_TYPE_WATER;
    default:                   return TRANSITION_TYPE_NORMAL;
  }
}

/** 1:1 décomp `GetSumOfPlayerPartyLevel(numMons)` (battle_setup.c:721-738). Somme
 *  les niveaux des `numMons` premiers mons joueur non-œuf, non-K.O. */
export function GetSumOfPlayerPartyLevel(numMons: number): number {
  let sum = 0;
  let remaining = numMons;
  for (let i = 0; i < PARTY_SIZE; i++) {
    const mon = gPlayerParty[i] as never;
    const species = GetMonData(mon, MON_DATA_SPECIES_OR_EGG) as number;
    if (species !== SPECIES_EGG && species !== SPECIES_NONE && (GetMonData(mon, MON_DATA_HP) as number) !== 0) {
      sum += GetMonData(mon, MON_DATA_LEVEL) as number;
      if (--remaining === 0) break;
    }
  }
  return sum;
}

/** 1:1 décomp `GetWildBattleTransition()` (battle_setup.c:790-810). Retourne le
 *  `B_TRANSITION_*` pour une rencontre sauvage selon zone × niveau.
 *  (Branche `CurrentBattlePyramidLocation()` omise : Pyramide = Battle Frontier hors
 *  scope → équivaut toujours à PYRAMID_LOCATION_NONE.) */
export function GetWildBattleTransition(): number {
  const transitionType = GetBattleTransitionTypeByMap();
  const enemyLevel = GetMonData(gEnemyParty[0] as never, MON_DATA_LEVEL) as number;
  const playerLevel = GetSumOfPlayerPartyLevel(1);

  const row = sBattleTransitionTable_Wild[transitionType] ?? sBattleTransitionTable_Wild[TRANSITION_TYPE_NORMAL];
  return (enemyLevel < playerLevel) ? row[0] : row[1];
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleSetupHelpers = {
  SetUpBattleVarsAndBirchZigzagoon, BattleSetup_GetEnvironmentId,
  BATTLE_ENVIRONMENT_GRASS, BATTLE_ENVIRONMENT_LONG_GRASS,
  BATTLE_ENVIRONMENT_SAND, BATTLE_ENVIRONMENT_UNDERWATER,
  BATTLE_ENVIRONMENT_WATER, BATTLE_ENVIRONMENT_POND,
  BATTLE_ENVIRONMENT_MOUNTAIN, BATTLE_ENVIRONMENT_CAVE,
  BATTLE_ENVIRONMENT_BUILDING, BATTLE_ENVIRONMENT_PLAIN,
  // Sélection de transition (Phase 4) — exposé pour vérif harness déterministe.
  GetWildBattleTransition, GetBattleTransitionTypeByMap, GetSumOfPlayerPartyLevel,
};

void MAP_TYPE_UNKNOWN;
