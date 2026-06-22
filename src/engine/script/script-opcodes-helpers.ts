/**
 * script-opcodes-helpers.ts — utilitaires partagés entre les fichiers d'opcodes.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c` + fichiers
 * référencés par le module (`event_object_movement.c`, `event_data.c`, etc.).
 *
 * NE registre AUCUN opcode (= pas de side-effects à l'import). Les helpers sont
 * partagés entre les fichiers `script-opcodes-<section>.ts`.
 */

import type { ObjectEvent } from '../../event_object_movement';
import { gObjectEvents } from '../../event_object_movement';
import type { ObjectEventTemplate } from '../../fieldmap';
import { gMapHeader, MAP_OFFSET } from '../../fieldmap';
import { GetCurrentMap } from '../../load_save';
import { GetSaveBlock1 } from '../save/save-system';
import { VarGet, gSelectedObjectEvent } from './script-vars';
import { gPlayerAvatar, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST, T_TILE_TRANSITION } from '../../field_player_avatar';
import { resolveDecompConstant, reverseDecompConstant } from '../../../harness/runtime/decomp-constants';
import { getRuntime } from '../../../harness/runtime/decomp-globals';

void MAP_OFFSET;
void GetCurrentMap;
void GetSaveBlock1;
void getRuntime;

/** 1:1 décomp event_object_movement.c : direction opposée. */
export const OPPOSITE_DIR: Record<number, number> = {
  [DIR_SOUTH]: DIR_NORTH,
  [DIR_NORTH]: DIR_SOUTH,
  [DIR_WEST]: DIR_EAST,
  [DIR_EAST]: DIR_WEST,
};

/** A_BUTTON = 0x01 (= 1:1 décomp gba/key.h). */
export const A_BUTTON = 0x01;
export const B_BUTTON = 0x02;

/** 1:1 décomp checkplayergender : 0 = MALE, 1 = FEMALE. */
export const MALE_GENDER = 0;
export const FEMALE_GENDER = 1;

/** Retourne le NPC sélectionné par le script courant (= via gSelectedObjectEvent),
 *  ou null si l'index est invalide ou inactif. */
export function getSelectedNpc(): ObjectEvent | null {
  const idx = gSelectedObjectEvent.index;
  if (idx < 0 || idx >= gObjectEvents.length) return null;
  const npc = gObjectEvents[idx];
  if (!npc.active) return null;
  return npc;
}

/** True ssi le frame courant a vu un nouveau press de A ou B (= 1:1 gMain.newKeys). */
export function isAOrBNewlyPressed(): boolean {
  const rt = getRuntime();
  if (!rt) return false;
  return (rt.gMain.newKeys & (A_BUTTON | B_BUTTON)) !== 0;
}

/** Parse un arg de bytecode comme nombre. Si VAR_*, lit la value courante. Si
 *  LOCALID_X, résout via les templates de la map courante. Si MALE/FEMALE/autres
 *  constantes connues, retourne le numeric value 1:1 décomp.
 *  Pour les constantes inconnues, return 0 (= safe default). */
export function parseValue(arg: string | undefined): number {
  if (!arg) return 0;
  if (/^-?\d+$/.test(arg)) return parseInt(arg, 10);
  if (/^0x[0-9a-fA-F]+$/.test(arg)) return parseInt(arg, 16);
  if (arg.startsWith('VAR_')) return VarGet(arg);
  // 1:1 décomp constants : MALE = 0, FEMALE = 1 (= include/constants/global.h).
  if (arg === 'MALE') return MALE_GENDER;
  if (arg === 'FEMALE') return FEMALE_GENDER;
  // 1:1 décomp asm/macros/event.inc:1932-1933 : YES = 1, NO = 0 (convention FIELD
  // yesnobox, stocke dans VAR_RESULT). ⚠️ FIX inversion : YES/NO ne sont PAS dans les
  // namespaces include/constants de decomp-constants.ts -> resolveDecompConstant renvoie
  // undefined -> fallback `return 0` (l.90) -> `goto_if_eq VAR_RESULT, YES` matchait quand
  // Result=0 (NON) -> OUI/NON inverses (tuto Birch : OUI repete, NON avance). TRUE/FALSE
  // ajoutes par coherence (global.h). Corrobore src/script_menu.c:241 (case 0 -> Result=1).
  if (arg === 'YES' || arg === 'TRUE') return 1;
  if (arg === 'NO' || arg === 'FALSE') return 0;
  // 1:1 décomp asm/macros/event.inc : STR_VAR_1/2/3 = index du buffer string
  // destination (sScriptStringVars, 0-indexé décomp). Notre setStringVar est
  // 1-indexé (1→gStringVar1) → on mappe STR_VAR_N → N. Sans ça, parseValue
  // renvoyait 0 → tous les `buffernumberstring STR_VAR_2/3` écrivaient gStringVar1
  // (via `|| 1`) en laissant gStringVar2/3 vierges → `{STR_VAR_2}` gelait (boucle
  // StringCopy sur buffer non terminé).
  if (arg === 'STR_VAR_1') return 1;
  if (arg === 'STR_VAR_2') return 2;
  if (arg === 'STR_VAR_3') return 3;
  // 1:1 décomp LOCALID_X : look up index dans les templates de la map courante.
  // LOCALID_PLAYER = 255, LOCALID_NONE = 0, LOCALID_CAMERA = 127.
  if (arg === 'LOCALID_PLAYER') return 255;
  if (arg === 'LOCALID_NONE') return 0;
  if (arg === 'LOCALID_CAMERA') return 127;
  if (arg.startsWith('LOCALID_')) {
    const templates = gMapHeader?.events?.objectEvents ?? [];
    const idx = templates.findIndex(t => t.localIdRaw === arg);
    if (idx >= 0) return idx + 1;  // 1-based, matches localId assigned au load.
    console.warn(`[parseValue] LOCALID '${arg}' not found in map templates`);
    return 0;
  }
  // 1:1 décomp constants lookup (= OBJ_EVENT_GFX_*, ITEM_*, MOVE_*, SPECIES_*,
  // TRAINER_*, FLAG_* numeric ID etc.). Cf. decomp-constants.ts pour list des
  // namespaces couverts. Sans ça, setvar VAR_OBJ_GFX_ID_0, OBJ_EVENT_GFX_RIVAL_*
  // stockait 0 → rival NPC sprite wrong (= toujours Brendan = 0).
  const constValue = resolveDecompConstant(arg);
  if (constValue !== undefined) return constValue;
  return 0;
}

/** Helper : resolve un arg "VAR_X" ou "ITEM_Y" ou number en numeric quantity. */
export function resolveCount(arg: string): number {
  if (!arg) return 1;
  // Si VAR_*, lire la valeur. Sinon parseInt.
  if (arg.startsWith('VAR_') || arg.startsWith('0x80')) {
    return VarGet(arg);
  }
  const n = parseInt(arg, 10);
  return Number.isNaN(n) ? 1 : n;
}

/** Helper : match NPC par localIdRaw (= string, ex 'LOCALID_PLAYERS_HOUSE_1F_MOM').
 *  Supporte aussi VAR_X (= lit la value, match par localId number) et
 *  numeric arg (= match par localId number). */
export function findNpcByLocalId(arg: string): typeof gObjectEvents[number] | null {
  if (!arg) return null;
  // 1:1 décomp : si VAR_*, lire la value (= un number qui matche localId).
  if (arg.startsWith('VAR_')) {
    const n = VarGet(arg);
    for (const npc of gObjectEvents) {
      if (npc.active && npc.localId === n) return npc;
    }
    return null;
  }
  // Match par localIdRaw (= string) en priorité.
  for (const npc of gObjectEvents) {
    if (npc.active && npc.localIdRaw === arg) return npc;
  }
  // Fallback : parseInt (= si arg est numérique).
  const n = parseInt(arg, 10);
  if (!Number.isNaN(n)) {
    for (const npc of gObjectEvents) {
      if (npc.active && npc.localId === n) return npc;
    }
  }
  return null;
}

/** Helper : trouve un template dans le SAVEBLOCK (= 1:1 strict décomp
 *  `GetBaseTemplateForObjectEvent` event_object_movement.c:2462 itère
 *  `gSaveBlock1Ptr->objectEventTemplates`). Le saveblock est populé au map
 *  switch par `LoadObjEventTemplatesFromHeader` (= copy from mapHeader),
 *  puis muté par setobjectxyperm/setobjectmovementtype/copyobjectxytoperm. */
export function findTemplateByLocalId(arg: string): ObjectEventTemplate | null {
  if (!arg) return null;
  const currentMapId = gMapHeader?.id ?? GetCurrentMap()?.name ?? '';
  const block1 = GetSaveBlock1();
  for (const t of block1.objectEventTemplates) {
    if ((t as { mapId?: string }).mapId !== currentMapId) continue;
    if ((t as { localIdRaw?: string }).localIdRaw === arg) return t as unknown as ObjectEventTemplate;
  }
  return null;
}

/** Helper : resolve un identifier d'objet en `localIdRaw` (= string LOCALID_*).
 *
 *  Audit session 126 fix Mom invisible 2F : le décomp `ScrCmd_addobject` fait
 *  `objectId = VarGet(...)` (= number), puis match template par `objectId` numérique.
 *  Notre impl matchait par `localIdRaw` (string), ce qui marche pour les
 *  literals `LOCALID_X` mais PAS pour les VAR_0x8008 que les scripts comme
 *  `PlayersHouse_2F_EventScript_MomComesUpstairsFemale` utilisent :
 *      setvar VAR_0x8008, LOCALID_PLAYERS_HOUSE_2F_MOM
 *      addobject VAR_0x8008
 *  Avant : `addobject VAR_0x8008` était traité comme localIdRaw = "VAR_0x8008"
 *  → template introuvable → no-op → Mom invisible.
 *  Maintenant : si arg starts with `VAR_`, on VarGet → number, puis on resolve
 *  via `reverseDecompConstant(num, 'LOCALID_')` pour retrouver le LOCALID_X. */
export function resolveObjectLocalIdRaw(arg: string): string {
  if (arg.startsWith('LOCALID_')) return arg;
  if (arg.startsWith('VAR_') || /^-?\d+$/.test(arg) || /^0x[0-9a-fA-F]+$/.test(arg)) {
    const num = VarGet(arg);
    // Match par numeric localId dans la map COURANTE d'ABORD (= match EXACT 1:1 décomp : localId
    // est l'index 1-based de l'object event de CETTE map). Prioritaire sur reverseDecompConstant
    // qui est AMBIGU (chaque map a ses propres LOCALID_X = 1, 2, … → renvoie le 1er trouvé global,
    // souvent le mauvais objet). Avec le localIdRaw synthétique `__LOCALID_<n>` (map-loader), ce
    // lookup retourne toujours un localIdRaw non vide → removeobject/applymovement matchent l'objet.
    const tplByLocalId = gMapHeader?.events?.objectEvents?.find(t => t.localId === num);
    if (tplByLocalId?.localIdRaw) return tplByLocalId.localIdRaw;
    // Fallback (objet hors map courante) : reverseDecompConstant.
    const resolved = reverseDecompConstant(num, 'LOCALID_');
    if (resolved) return resolved;
  }
  return arg;
}

/** 1:1 STRICT décomp `IsPlayerStandingStill` (event_object_lock.c:11) :
 *    if (gPlayerAvatar.tileTransitionState == T_TILE_TRANSITION) return FALSE; else return TRUE;
 *  C'est la condition de `Task_FreezePlayer` (event_object_lock.c:20) → `IsFreezePlayerFinished`
 *  (event_object_lock.c:29), le wait que `lock`/`lockall` posent via SetupNativeScript : on attend
 *  que le joueur soit centré sur sa tuile (pas en transition) avant de freeze + afficher le msgbox.
 *  Sans cette wait, un msgbox peut interrompre un walk mid-step → glitch visuel + désync facing.
 *
 *  ⚠️ Depuis la ré-écriture 1:1 de `PlayerStep` (étape 1b-iii), les compteurs maison
 *  stepFramesLeft/turnFramesLeft/collideFramesLeft/jumpFramesLeft ne sont PLUS posés sur le
 *  chemin déverrouillé (le pas est piloté par le held movement). La source de vérité 1:1 est
 *  `tileTransitionState`, maintenu par `UpdatePlayerAvatarTransitionState` depuis le held —
 *  exactement ce que lit le décomp. T_TILE_TRANSITION couvre walk/dash/turn/collide/ledge-jump
 *  (held actif et pas centré). On garde le check `forceMovement` (door-walk = stand-in tasks). */
export function isPlayerStepFinished(): boolean {
  return gPlayerAvatar.tileTransitionState !== T_TILE_TRANSITION
      && gPlayerAvatar.forceMovement === 0;  // DIR_NONE
}
