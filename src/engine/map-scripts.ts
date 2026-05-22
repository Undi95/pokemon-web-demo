import { runScript, type ParsedScripts, type ScriptContext } from './script-runner';

/**
 * Helpers pour les "map scripts" — scripts globaux d'une map déclarés dans le
 * bloc `<MapName>_MapScripts::` du décomp. Format :
 *
 *   <MapName>_MapScripts::
 *       map_script MAP_SCRIPT_ON_TRANSITION, <ScriptName>
 *       map_script MAP_SCRIPT_ON_FRAME_TABLE, <ScriptName>
 *       map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, <ScriptName>
 *       .byte 0
 *
 * Les types de map_script :
 *   ON_LOAD        — au chargement de la map (avant rendu)
 *   ON_TRANSITION  — quand le joueur entre via warp/connection
 *   ON_RESUME      — après une sauvegarde de chargement
 *   ON_FRAME_TABLE — table de scripts conditionnels (var-based) tournant à chaque frame
 *   ON_WARP_INTO_MAP_TABLE — table de scripts conditionnels lors d'un warp
 */

export type MapScriptType =
  | 'MAP_SCRIPT_ON_LOAD'
  | 'MAP_SCRIPT_ON_TRANSITION'
  | 'MAP_SCRIPT_ON_RESUME'
  | 'MAP_SCRIPT_ON_FRAME_TABLE'
  | 'MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE';

export function findMapScriptName(
  parsed: ParsedScripts,
  mapName: string,
  type: MapScriptType
): string | null {
  const headerScript = parsed.scripts[`${mapName}_MapScripts`];
  if (!headerScript) return null;
  for (const line of headerScript) {
    const m = line.match(/^map_script\s+(\w+),\s*(\w+)/);
    if (m && m[1] === type) return m[2];
  }
  return null;
}

export async function runMapScript(
  parsed: ParsedScripts,
  mapName: string,
  type: MapScriptType,
  ctx: ScriptContext
): Promise<void> {
  const name = findMapScriptName(parsed, mapName, type);
  if (!name) return;
  await runScript(name, parsed, ctx);
}

import { gameState } from './game-state';
import { VarGet } from './script-vars';

/**
 * Évalue le `MAP_SCRIPT_ON_FRAME_TABLE` qui contient des entrées :
 *   `map_script_2 VAR_NAME, VALUE, SCRIPT_NAME`
 * Pour chaque entrée où la variable courante == VALUE, exécute SCRIPT_NAME.
 *
 * Conçu pour StepOffTruckMale/Female qui se déclenchent au spawn quand
 * VAR_LITTLEROOT_INTRO_STATE vaut 1 ou 2.
 */
export async function runOnFrameTable(
  parsed: ParsedScripts,
  mapName: string,
  ctx: ScriptContext
): Promise<void> {
  const scriptName = findOnFrameMatch(parsed, mapName);
  if (!scriptName) return;
  await runScript(scriptName, parsed, ctx);
}

/**
 * Version SYNC qui retourne juste le scriptName du 1er match, ou null.
 * Utile pour décider sync s'il faut pré-lock le player avant d'exécuter
 * (cf. OverworldScene.tickOnFrameTable). Le décomp fait pareil dans
 * `MapHeaderCheckScriptTable` (script.c:299) — boucle sync jusqu'au 1er match.
 */
export function findOnFrameMatch(parsed: ParsedScripts, mapName: string): string | null {
  const tableName = findMapScriptName(parsed, mapName, 'MAP_SCRIPT_ON_FRAME_TABLE');
  if (!tableName) return null;
  const table = parsed.scripts[tableName];
  if (!table) return null;
  for (const line of table) {
    const m = line.match(/^map_script_2\s+(\w+)\s*,\s*(\w+)\s*,\s*(\w+)/);
    if (!m) continue;
    const [, varName, valueTok, scriptName] = m;
    const expected = /^\d+$/.test(valueTok) ? Number(valueTok) : 0;
    if (VarGet(varName) === expected) {
      return scriptName;
    }
  }
  return null;
}
