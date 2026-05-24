/**
 * script-opcodes-helpers.ts — utilitaires partagés entre les fichiers d'opcodes.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c` + fichiers
 * référencés par le module (`event_object_movement.c`, `event_data.c`, etc.).
 *
 * NE registre AUCUN opcode (= pas de side-effects à l'import). Les helpers sont
 * partagés entre les fichiers `script-opcodes-<section>.ts`.
 */

import type { ObjectEvent } from './object-events';
import { gObjectEvents } from './object-events';
import type { ObjectEventTemplate } from './map-loader';
import { gMapHeader, MAP_OFFSET } from './map-loader';
import { GetCurrentMap } from './load_save';
import { GetSaveBlock1 } from './save-system';
import { VarGet, gSelectedObjectEvent } from './script-vars';
import { gPlayerAvatar, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST } from './player-avatar';
import { resolveDecompConstant, reverseDecompConstant } from './decomp-constants';
import { getRuntime } from './decomp-globals';

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
    const resolved = reverseDecompConstant(num, 'LOCALID_');
    if (resolved) return resolved;
    // Fallback : match par numeric localId dans gMapHeader (= map.json local_id
    // assignment-order).
    const tplByLocalId = gMapHeader?.events?.objectEvents?.find(t => t.localId === num);
    if (tplByLocalId?.localIdRaw) return tplByLocalId.localIdRaw;
  }
  return arg;
}

/** 1:1 décomp `IsFreezePlayerFinished` (event_object_movement.c) :
 *  retourne TRUE quand le player a fini son current step (= safe to msgbox).
 *  Sans cette wait, un msgbox peut interrompre un walk mid-step → glitch
 *  visuel + désync facingDirection.
 *
 *  Fix Audit BIG section 2.3 : avant, `lock`/`lockall` retournaient false sans
 *  wait → script peut afficher dialog avant que le step end snap les coords. */
export function isPlayerStepFinished(): boolean {
  return gPlayerAvatar.stepFramesLeft <= 0
      && gPlayerAvatar.collideFramesLeft <= 0
      && gPlayerAvatar.turnFramesLeft <= 0
      && gPlayerAvatar.jumpFramesLeft <= 0
      && gPlayerAvatar.forceMovement === 0;  // DIR_NONE
}
