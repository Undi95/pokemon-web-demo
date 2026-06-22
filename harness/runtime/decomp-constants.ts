/**
 * decomp-constants.ts — Flat lookup table for #define constants.
 *
 * Source de vérité : `src/engine/decomp-data/include/constants/*-data.ts`
 * (= auto-extraits depuis `D:/Projet 1/decomps/pokeemeraude/include/constants/*.h`).
 *
 * Pourquoi ce module :
 *   - parseValue (script-opcodes.ts) doit résoudre des arg strings comme
 *     `OBJ_EVENT_GFX_RIVAL_MAY_NORMAL` → 105, `HEAL_LOCATION_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F`
 *     → 1, etc. Avant ce module, parseValue ne connaissait que MALE/FEMALE/
 *     LOCALID_* et fallback à 0 → setvar des constantes inconnues stockait 0
 *     (= bugs silencieux : VAR_OBJ_GFX_ID_0 = 0 = OBJ_EVENT_GFX_BRENDAN_NORMAL
 *     au lieu du sprite rival genre opposé).
 *   - Importer chaque module à la demande dans parseValue serait du round-trip
 *     async pour un appel sync ; un import statique de tout est trop lourd
 *     (= ~50 modules constants). Solution : importer SEULEMENT les modules
 *     dont les constantes apparaissent dans les scripts game flow critique.
 *
 * Coverage Phase 3.4 (= early game = title → Birch → naming → truck →
 * Littleroot → Mom → lab → Route 101 → starter → Route 103 → rival) :
 *   - event_objects (= OBJ_EVENT_GFX_*)
 *   - flags (= FLAG_* — used as args to checkflag/setflag/clearflag)
 *   - heal_locations (= HEAL_LOCATION_* — used by setrespawn)
 *   - items (= ITEM_* — used by additem/giveitem)
 *   - moves (= MOVE_* — used by trainer parties + special handlers)
 *   - songs (= MUS_*, SE_*, ME_* — used by playbgm/playse)
 *   - species (= SPECIES_* — used by setwildbattle/special spawns)
 *   - trainers (= TRAINER_* — used by trainerbattle)
 *   - trainer_classes (= TRAINER_CLASS_* — rare)
 *   - vars (= VAR_* IDs as numeric — used directly as halfword IDs sometimes)
 *
 * Étendre quand un script référence une constante non couverte : import le
 * module + add à `_constantsTable`. Log warning si parseValue retourne 0 pour
 * une string non-MALE/FEMALE/numeric (= aide à détecter manquant).
 */

import * as eventObjects from '../../src/engine/decomp-data/include/constants/event_objects-data';
import * as flags from '../../src/engine/decomp-data/include/constants/flags-data';
import * as items from '../../src/engine/decomp-data/include/constants/items-data';
import * as moves from '../../src/engine/decomp-data/include/constants/moves-data';
import * as songs from '../../src/engine/decomp-data/include/constants/songs-data';
import * as species from '../../src/engine/decomp-data/include/constants/species-data';
import * as trainers from '../../src/engine/decomp-data/include/constants/trainers-data';
import * as battle from '../../src/engine/decomp-data/include/constants/battle-data';
// include/battle.h (≠ constants/battle.h) : MOVE_TARGET_* + B_ACTION_*.
// Orphelin (importé nulle part) → resolveDecompConstant('MOVE_TARGET_BOTH')
// échouait → move.target=0 pour TOUS les moves non-SELECTED (Surf/Séisme/
// Blizzard spread `/2` jamais appliqué en 2v2 + ciblage cassé). Mergé
// SI-ABSENT (jamais d'override = zéro régression) + dans _exprNamespaces.
import * as battleInclude from '../../src/engine/decomp-data/include/battle-data';
import * as global from '../../src/engine/decomp-data/include/constants/global-data';
import * as fieldEffects from '../../src/engine/decomp-data/include/constants/field_effects-data';
import * as opponents from '../../src/engine/decomp-data/include/constants/opponents-data';
import * as pokemon from '../../src/engine/decomp-data/include/constants/pokemon-data';
import * as abilities from '../../src/engine/decomp-data/include/constants/abilities-data';
import * as battleMoveEffects from '../../src/engine/decomp-data/include/constants/battle_move_effects-data';
import * as holdEffects from '../../src/engine/decomp-data/include/constants/hold_effects-data';
import * as vars from '../../src/engine/decomp-data/include/constants/vars-data';
// BERRY_STAGE_* + BERRY_TREES_COUNT + BERRY_TREE_ROUTE_* (include/constants/berry.h).
// Manquait → BerryTreeScript `switch VAR_0x8004` + `case BERRY_STAGE_BERRIES` ne
// résolvait pas la constante (parseValue→0) → aucun case ne matchait → le script
// d'interaction berry chutait vers `end` (récolte/arrosage/plantation muets).
import * as berryConstants from '../../src/engine/decomp-data/include/constants/berry-data';
// Audit session 125 : METATILE_*, MB_*, MAP_SCRIPT_ON_* manquaient → setmetatile
// resolved les NAMES à 0 → corruption tile (= bug exit truck après option menu).
// 1:1 décomp = ces constants sont resolved au compile-time (assembleur GBA), pas
// runtime ; donc on les charge dans la table pour que parseValue/VarGet fallback
// les resolve correctement quand un script les référence.
import * as metatileLabels from '../../src/engine/decomp-data/include/constants/metatile_labels-data';
import * as metatileBehaviors from '../../src/engine/decomp-data/include/constants/metatile_behaviors-data';
import * as mapScripts from '../../src/engine/decomp-data/include/constants/map_scripts-data';
// Audit session 126 LOT D2 : MULTI_* enum (= multichoice IDs script_menu.h).
// Used par opcode multichoice/multichoicedefault/multichoicegrid pour resolve
// les literals MULTI_TV_LATI / MULTI_BRINEY_ON_DEWFORD / etc en numeric ID.
import * as scriptMenu from '../../src/engine/decomp-data/include/constants/script_menu-data';
// GAME_STAT_* enum (= incrementgamestat opcode resolves names).
import * as gameStats from '../../src/engine/decomp-data/include/constants/game_stat-data';
// PLAYERS_HOUSE_TV_NONE/LATI/MOVIE — used by EventScript_TV path dispatch.
import * as tv from '../../src/engine/decomp-data/include/constants/tv-data';
// Misc per-screen constants (= title screen tile offsets, etc.) extraits
// dans `decomp-data/*-data.ts`. Pas dans `auto/include/constants/` car
// définis inline dans .c files. Inclus pour résoudre tileNum strings comme
// "VERSION_BANNER_RIGHT_TILEOFFSET" au runtime sprite anim.
import * as titleScreen from '../../src/engine/decomp-data/title-screen-data';
// HEAL_LOCATION_* sont définis comme enum dans heal_locations.h mais pas
// extraits dans nos auto-data — pour setrespawn opcode, on accepte la string
// raw (= var stocke le hash, lookup ailleurs).

/** Flat constants table : merged maps from all imported namespaces. Built once
 *  at module load. Lookup order : last-wins (= rare collisions, e.g. ITEM_NONE
 *  vs MOVE_NONE — both 0). */
const _constantsTable: Record<string, number> = {};

function _mergeConstants(ns: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(ns)) {
    if (typeof value === 'number') {
      _constantsTable[key] = value;
    }
  }
}

/** Comme _mergeConstants mais SANS override (= n'écrit que les clés absentes).
 *  Pour les namespaces ajoutés tardivement (ex. include/battle.h) : garantit
 *  zéro changement d'une résolution existante = strictement additif. */
function _mergeConstantsIfAbsent(ns: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(ns)) {
    if (typeof value === 'number' && _constantsTable[key] === undefined) {
      _constantsTable[key] = value;
    }
  }
}

_mergeConstants(eventObjects);
_mergeConstants(flags);
_mergeConstants(items);
_mergeConstants(moves);
_mergeConstants(songs);
_mergeConstants(species);
_mergeConstants(trainers);
_mergeConstants(battle);
_mergeConstants(global);
_mergeConstants(fieldEffects);
_mergeConstants(opponents);
_mergeConstants(pokemon);
_mergeConstants(abilities);
_mergeConstants(battleMoveEffects);
_mergeConstants(holdEffects);
_mergeConstants(vars);
// Berry constants — strictement additif (noms uniques BERRY_STAGE_*/BERRY_TREE_*).
_mergeConstantsIfAbsent(berryConstants);

// Manual constants — auto-extraction stocke ces FLAG_* comme `_EXPR` strings
// (= "(1 << 0)") qui ne résolvent pas en number. On force-load les valeurs
// numeric ici pour que battle-moves.ts puisse résoudre `flags: "FLAG_MAKES_CONTACT | ..."`.
// Source : `decomps/pokeemeraude/include/constants/pokemon.h:208-213`.
_constantsTable['FLAG_MAKES_CONTACT']        = 1 << 0;
_constantsTable['FLAG_PROTECT_AFFECTED']     = 1 << 1;
_constantsTable['FLAG_MAGIC_COAT_AFFECTED']  = 1 << 2;
_constantsTable['FLAG_SNATCH_AFFECTED']      = 1 << 3;
_constantsTable['FLAG_MIRROR_MOVE_AFFECTED'] = 1 << 4;
_constantsTable['FLAG_KINGS_ROCK_AFFECTED']  = 1 << 5;
_mergeConstants(titleScreen);
_mergeConstants(metatileLabels);
_mergeConstants(metatileBehaviors);
_mergeConstants(mapScripts);
_mergeConstants(scriptMenu);
_mergeConstants(gameStats);
_mergeConstants(tv);
// include/battle.h : MOVE_TARGET_SELECTED(=0) + B_ACTION_* — si-absent only.
_mergeConstantsIfAbsent(battleInclude);

// ─── Passe `*_EXPR` : l'auto-extraction émet `NAME_EXPR = "(1 << n)"` (string)
// pour les #define à expression bit-shift / OR (MOVE_TARGET_*, FLAG_*, …) →
// non mergés (pas number) → `resolveDecompConstant("MOVE_TARGET_BOTH")`
// échouait → move.target=0 pour TOUS les moves non-SELECTED (Surf/Séisme/
// Blizzard → spread `/2` jamais appliqué en 2v2 + ciblage cassé). Fix 1:1
// GÉNÉRAL & ADDITIF : évalue chaque `*_EXPR` (`(1<<n)`, OR, déc/hex, refs
// d'autres constantes) et l'enregistre sous le nom de base UNIQUEMENT s'il
// n'est pas déjà résolu (= ne peut PAS changer une résolution existante ;
// remplace le hardcode FLAG_* ci-dessus, conservé inoffensif/redondant).
function _evalExprConstant(expr: string): number | undefined {
  let s = expr.trim();
  // déballe les parenthèses englobant TOUTE l'expression
  while (s[0] === '(') {
    let d = 0, j = -1;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '(') d++;
      else if (s[i] === ')') { if (--d === 0) { j = i; break; } }
    }
    if (j === s.length - 1) s = s.slice(1, j).trim(); else break;
  }
  // split OR de profondeur 0
  const parts: string[] = []; let d = 0, st = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') d++; else if (s[i] === ')') d--;
    else if (s[i] === '|' && d === 0) { parts.push(s.slice(st, i)); st = i + 1; }
  }
  parts.push(s.slice(st));
  let acc = 0;
  for (let p of parts) {
    p = p.trim().replace(/^\(+|\)+$/g, '').trim();
    let mm;
    if ((mm = p.match(/^(\d+)\s*<<\s*(\d+)$/))) acc |= (Number(mm[1]) << Number(mm[2]));
    else if ((mm = p.match(/^0x[0-9a-fA-F]+$/))) acc |= parseInt(p, 16);
    else if ((mm = p.match(/^-?\d+$/))) acc |= parseInt(p, 10);
    else if (p in _constantsTable) acc |= _constantsTable[p];
    else return undefined; // terme non résolvable → on n'enregistre pas
  }
  return acc >>> 0;
}
{
  let _exprResolved = 0;
  // _constantsTable ne contient que des number → les `*_EXPR` (string) sont
  // dans les namespaces source. Re-scan des namespaces pour les strings `_EXPR`.
  const _exprNamespaces: Record<string, unknown>[] = [
    eventObjects, flags, items, moves, songs, species, trainers, battle,
    battleInclude, global, fieldEffects, opponents, pokemon, abilities,
    battleMoveEffects, holdEffects, vars, titleScreen, metatileLabels,
    metatileBehaviors, mapScripts, scriptMenu, gameStats, tv,
  ];
  for (const ns of _exprNamespaces) {
    for (const [key, value] of Object.entries(ns)) {
      if (typeof value !== 'string' || !key.endsWith('_EXPR')) continue;
      const base = key.slice(0, -5);
      if (_constantsTable[base] !== undefined) continue; // déjà résolu → ne pas toucher
      const v = _evalExprConstant(value);
      if (typeof v === 'number') { _constantsTable[base] = v; _exprResolved++; }
    }
  }
  if (typeof console !== 'undefined') {
    console.log(`[decomp-constants] ${_exprResolved} constantes *_EXPR évaluées (MOVE_TARGET_*, etc.)`);
  }
}

/** Resolve a constant name to its numeric value. Returns undefined si pas trouvé.
 *  Caller decide quoi faire (= fallback 0, log warning, etc.). */
export function resolveDecompConstant(name: string): number | undefined {
  return _constantsTable[name];
}

/** Reverse lookup avec filtre prefix : value → name. Plusieurs namespaces ont
 *  des collisions (= ITEM_NONE = MOVE_NONE = SPECIES_NONE = 0), donc le prefix
 *  est obligatoire. Returns undefined si pas trouvé.
 *
 *  Use case principal : OBJ_EVENT_GFX_VAR_N résolution. Les rival NPCs ont
 *  graphics_id="OBJ_EVENT_GFX_VAR_0". Au spawn, on lit VAR_OBJ_GFX_ID_0 (=
 *  e.g. 105 = OBJ_EVENT_GFX_RIVAL_MAY_NORMAL) puis reverse lookup pour avoir
 *  la string "OBJ_EVENT_GFX_RIVAL_MAY_NORMAL" qui indexe le catalog graphics.
 *
 *  ```ts
 *  reverseDecompConstant(105, 'OBJ_EVENT_GFX_') // → 'OBJ_EVENT_GFX_RIVAL_MAY_NORMAL'
 *  ``` */
export function reverseDecompConstant(value: number, prefix: string): string | undefined {
  for (const [name, v] of Object.entries(_constantsTable)) {
    if (v === value && name.startsWith(prefix)) return name;
  }
  return undefined;
}

/** Total constants loaded — utile pour debug + sanity check. */
export const _constantsCount = Object.keys(_constantsTable).length;

console.log(`[decomp-constants] loaded ${_constantsCount} constants from 17 namespaces`);

if (typeof window !== 'undefined') {
  // Debug : window.dev.audit.constant("OBJ_EVENT_GFX_RIVAL_MAY_NORMAL") → 105
  // Useful pour vérifier qu'une const est résolvable.
  (globalThis as Record<string, unknown>).__decompConstants = _constantsTable;
}
