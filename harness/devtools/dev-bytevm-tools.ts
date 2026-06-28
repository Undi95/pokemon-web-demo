/**
 * dev-bytevm-tools.ts — vérif déterministe du byte-VM (slice vertical, harness).
 *
 * Charge l'image bytecode + installe les handlers du slice, puis exécute de vrais
 * scripts de l'image et VÉRIFIE l'état du jeu (flags/vars) — prouve la chaîne
 * bytecode → VM → dispatch → handler → état, contrôle de flux inclus.
 *
 * NON câblé au jeu : exécute des scripts en isolation (contexte immédiat) sans
 * toucher la boucle overworld. Exposé sur window.__byteVm pour A/B via la console.
 */

import {
  loadByteVmImage, isByteVmLoaded, RunScriptImmediatelyByLabel, RunScriptImmediately, getScriptOffset,
  getSymbols, getMapSymbols, ScriptContext_SetupScript, ScriptContext_RunScript, getLabelAtOffset,
  _getGlobalContext, _getGlobalStatus, ArePlayerFieldControlsLocked as _BVAreLocked, ptrFromLabel,
} from '../../src/script';
import { GetMartItemList, IsShopMenuOpen } from '../../src/shop';
import type { ScriptPtr } from '../../src/script';
import { setPendingWarp, getPendingWarp } from '../../src/engine/field/warp-system';
import { GetMoney, AddMoney, RemoveMoney } from '../../src/money';
import { CheckBagHasItem, RemoveBagItem } from '../../src/engine/bag/bag';
import { MapGridGetMetatileIdAt, MapGridSetMetatileIdAt, MAP_OFFSET } from '../../src/fieldmap';
import { installByteVmHandlers, setSpecialNames, registerSpecial } from '../../src/scrcmd';
import { getText, loadMapScripts } from '../../src/script';
import { IsFieldMessageBoxHidden, HideFieldMessageBox } from '../../src/field_message_box';
import { VarGet, VarSet, FlagSet, FlagClear } from '../../src/event_data';
import { isMovementDone } from '../../src/engine/field/movement-system';
import { gObjectEvents } from '../../src/event_object_movement';
import { gPlayerAvatar } from '../../src/field_player_avatar';
import { resolveDecompConstant } from '../runtime/decomp-constants';
import { getStringVar } from '../../src/text';
import { getSpeciesNameFr, getItemNameFr } from '../runtime/data-tables';
import { CalculatePlayerPartyCount } from '../../src/engine/battle/party-storage';
import { gSaveBlock1Ptr } from '../../src/engine/save/save-block-state';
import { gSelectedObjectEvent } from '../../src/engine/script/script-vars';
import { LoadMessageBoxAndBorderGfx } from '../../src/menu';
import { GetSavedWeather, SetSavedWeather } from '../../src/field_weather_effect';
import { WEATHER_RAIN, WEATHER_SUNNY } from '../../include/constants/weather';
import { MapGridGetMetatileBehaviorAt } from '../../src/fieldmap';
import { MB_ANIMATED_DOOR } from '../../src/engine/field/tilemap-loader';
import { isDoorAnimationStopped } from '../../src/scrcmd_door';
import { findTemplateByLocalId } from '../../src/engine/script/script-opcodes-helpers';
import { getRuntime } from '../runtime/decomp-globals';
import { FadeScreen } from '../../src/field_weather';
import { GetBerryTypeByBerryTreeId } from '../../src/berry';
import { gBattleMons, gBattleOutcome, gBattleTypeFlags, gTrainerBattleOpponent_A, setTrainerBattleOpponentA } from '../../src/engine/battle/state';
import { gEnemyParty, gPlayerParty } from '../../src/engine/battle/party-storage';
import { GetMonData as _GetMonData, MON_DATA_SPECIES as _MON_DATA_SPECIES, MON_DATA_HP as _MON_DATA_HP, MON_DATA_LEVEL as _MON_DATA_LEVEL, MON_DATA_MET_LOCATION as _MON_DATA_MET_LOCATION, MON_DATA_MODERN_FATEFUL_ENCOUNTER as _MON_DATA_MODERN } from '../../src/engine/battle/party-storage';

let _installed = false;
let _enum: { cmdId: number; handler: string; op: string }[] = [];
let _specials: string[] = [];

/** Charge l'image + la cmd-table (enum) + la table des specials + installe les handlers. */
export async function loadAndInstall(): Promise<number> {
  await loadByteVmImage();
  let installed = 0;
  if (!_installed) {
    _enum = await (await fetch('/decomp/em/script-cmd-table.json')).json().then((t) => t.enum);
    _specials = await (await fetch('/decomp/em/specials-table.json')).json().then((t) => t.specials);
    setSpecialNames(_specials);
    installed = installByteVmHandlers(_enum);
    _installed = true;
    console.log(`[byte-vm] ${installed} handlers installés, ${_specials.length} specials`);
  }
  return installed;
}

function cmdIdOf(handler: string): number {
  const e = _enum.find((x) => x.handler === handler);
  if (!e) throw new Error(`cmdId introuvable pour ${handler}`);
  return e.cmdId;
}
const lo = (v: number) => v & 0xFF, hi = (v: number) => (v >> 8) & 0xFF;

const num = (name: string): number => {
  const v = resolveDecompConstant(name);
  if (v === undefined) throw new Error(`constante non résolue: ${name}`);
  return v;
};

/** Test déterministe de contrôle de flux entièrement dans le slice :
 *  AquaHideout_B2F_OnTransition = call_if_set FLAG, PreventMattNoticing ; end
 *    PreventMattNoticing = setvar VAR_TEMP_1, 1 ; return
 *  → checkflag + call_if (table de condition) + call (offset+stack) + setvar +
 *    return (pop) + end. Selon le flag, VAR_TEMP_1 vaut 1 ou reste 0. */
export async function test(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const VAR_TEMP_1 = num('VAR_TEMP_1');
  const FLAG = num('FLAG_TEAM_AQUA_ESCAPED_IN_SUBMARINE');
  const offT = getScriptOffset('AquaHideout_B2F_OnTransition');
  const offP = getScriptOffset('AquaHideout_B2F_EventScript_PreventMattNoticing');

  // Cas 1 : flag posé → branche prise → VAR_TEMP_1 = 1.
  FlagSet(FLAG); VarSet(VAR_TEMP_1, 0);
  RunScriptImmediatelyByLabel('AquaHideout_B2F_OnTransition');
  const v1 = VarGet(VAR_TEMP_1);

  // Cas 2 : flag absent → branche NON prise → VAR_TEMP_1 reste 0.
  FlagClear(FLAG); VarSet(VAR_TEMP_1, 0);
  RunScriptImmediatelyByLabel('AquaHideout_B2F_OnTransition');
  const v2 = VarGet(VAR_TEMP_1);

  // Cas 3 : exécution directe du script appelé (setvar + return).
  VarSet(VAR_TEMP_1, 0);
  RunScriptImmediatelyByLabel('AquaHideout_B2F_EventScript_PreventMattNoticing');
  const v3 = VarGet(VAR_TEMP_1);

  const pass = v1 === 1 && v2 === 0 && v3 === 1;
  const details = {
    'offset OnTransition': offT, 'offset PreventMattNoticing': offP,
    'cas1 flag=set → VAR_TEMP_1 (attendu 1)': v1,
    'cas2 flag=clear → VAR_TEMP_1 (attendu 0)': v2,
    'cas3 direct setvar → VAR_TEMP_1 (attendu 1)': v3,
  };
  console.log(`[byte-vm] TEST slice : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test déterministe de `special`/`specialvar` via bytecode SYNTHÉTIQUE :
 *  enregistre un special-sonde renvoyant 1234, l'ajoute à la table à un id connu,
 *  puis exécute `specialvar VAR_TEMP_1, <id> ; end` → VAR_TEMP_1 doit valoir 1234.
 *  Vérifie aussi le mapping id→nom (specials[0] = HealPlayerParty). */
export async function testSpecials(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const VAR_TEMP_1 = num('VAR_TEMP_1');
  // sonde : id = fin de table (n'écrase aucun special réel)
  const probeId = _specials.length;
  _specials.push('__byteVmProbe');
  setSpecialNames(_specials);
  registerSpecial('__byteVmProbe', () => 1234);

  const SPECIALVAR = cmdIdOf('ScrCmd_specialvar');
  const END = cmdIdOf('ScrCmd_end');
  // specialvar VAR_TEMP_1, probeId ; end
  const code = Uint8Array.from([SPECIALVAR, lo(VAR_TEMP_1), hi(VAR_TEMP_1), lo(probeId), hi(probeId), END]);

  VarSet(VAR_TEMP_1, 0);
  RunScriptImmediately({ buf: code, off: 0 });
  const v = VarGet(VAR_TEMP_1);

  const mapOk = _specials[0] === 'HealPlayerParty';
  const pass = v === 1234 && mapOk;
  const details = {
    'specialvar VAR_TEMP_1, sonde() → (attendu 1234)': v,
    'mapping id 0 → nom (attendu HealPlayerParty)': _specials[0],
    'nb specials': _specials.length - 1,
  };
  console.log(`[byte-vm] TEST specials : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test du chemin DIALOGUE via bytecode synthétique :
 *  loadword 0, <textSym> ; callstd MSGBOX_DEFAULT ; end
 *  → callstd saute vers Std_MsgboxDefault (offset image) → message NULL (data[0])
 *    → ShowFieldMessage → la boîte de message s'affiche. Vérifie : offset std
 *    résolu, texte résolu (getText non vide), et boîte non cachée après exécution. */
export async function testDialogue(mapName = 'LittlerootTown'): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  await loadMapScripts(mapName);   // charge les textes de la map

  // 1) offset du std script MSGBOX_DEFAULT
  const stdOff = getScriptOffset('Std_MsgboxDefault');

  // 2) trouve un symbole texte de cette map dont getText renvoie des octets
  let textSymId = -1; let textLabel = ''; let textLen = 0;
  const syms = getSymbols();
  for (let id = 1; id < syms.length; id++) {
    const s = syms[id];
    if (s.kind !== 'text' || !s.label.startsWith(mapName)) continue;
    const b = getText(s.label);
    if (b && b.length > 0) { textSymId = id; textLabel = s.label; textLen = b.length; break; }
  }

  let boxShown = false;
  if (textSymId >= 0 && stdOff !== undefined) {
    const LOADWORD = cmdIdOf('ScrCmd_loadword');
    const CALLSTD = cmdIdOf('ScrCmd_callstd');
    const END = cmdIdOf('ScrCmd_end');
    const MSGBOX_DEFAULT = (resolveDecompConstant('MSGBOX_DEFAULT') ?? 4);
    // loadword 0, textSym ; callstd MSGBOX_DEFAULT ; end
    const code = Uint8Array.from([
      LOADWORD, 0, lo(textSymId), hi(textSymId), ((textSymId >> 16) & 0xFF), ((textSymId >>> 24) & 0xFF),
      CALLSTD, MSGBOX_DEFAULT, END,
    ]);
    HideFieldMessageBox();
    const ptr: ScriptPtr = { buf: code, off: 0 };
    ScriptContext_SetupScript(ptr);
    for (let i = 0; i < 6; i++) ScriptContext_RunScript();
    boxShown = !IsFieldMessageBoxHidden();
    HideFieldMessageBox();
  }

  const pass = stdOff !== undefined && textSymId >= 0 && boxShown;
  const details = {
    'offset Std_MsgboxDefault': stdOff,
    'texte choisi': textLabel, 'octets texte': textLen,
    'boîte de message affichée après exécution': boxShown,
  };
  console.log(`[byte-vm] TEST dialogue : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test INTERACTION PNJ complète via bytecode synthétique :
 *  lock ; faceplayer ; loadword 0,<textSym> ; callstd MSGBOX_DEFAULT ; release ; end
 *  → prouve que lock + faceplayer + le chemin msgbox s'exécutent en séquence
 *    (la boîte de message s'affiche après que lock a rendu la main + faceplayer). */
export async function testNpc(mapName = 'LittlerootTown'): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  await loadMapScripts(mapName);
  let textSymId = -1, textLabel = '';
  const syms = getSymbols();
  for (let id = 1; id < syms.length; id++) {
    const s = syms[id];
    if (s.kind !== 'text' || !s.label.startsWith(mapName)) continue;
    const b = getText(s.label);
    if (b && b.length > 0) { textSymId = id; textLabel = s.label; break; }
  }
  const LOCK = cmdIdOf('ScrCmd_lock'), FACEPLAYER = cmdIdOf('ScrCmd_faceplayer');
  const LOADWORD = cmdIdOf('ScrCmd_loadword'), CALLSTD = cmdIdOf('ScrCmd_callstd');
  const RELEASE = cmdIdOf('ScrCmd_release'), END = cmdIdOf('ScrCmd_end');
  const MSGBOX_DEFAULT = resolveDecompConstant('MSGBOX_DEFAULT') ?? 4;
  const code = Uint8Array.from([
    LOCK, FACEPLAYER,
    LOADWORD, 0, lo(textSymId), hi(textSymId), (textSymId >> 16) & 0xFF, (textSymId >>> 24) & 0xFF,
    CALLSTD, MSGBOX_DEFAULT, RELEASE, END,
  ]);
  HideFieldMessageBox();
  ScriptContext_SetupScript({ buf: code, off: 0 } as ScriptPtr);
  for (let i = 0; i < 10; i++) ScriptContext_RunScript();
  const boxShown = !IsFieldMessageBoxHidden();
  HideFieldMessageBox();

  const pass = textSymId >= 0 && boxShown;
  const details = { 'texte': textLabel, 'lock+faceplayer+msgbox → boîte affichée': boxShown };
  console.log(`[byte-vm] TEST interaction PNJ : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test APPLYMOVEMENT via bytecode synthétique sur un VRAI objet de la map courante :
 *  applymovement <localId>, <movSym> ; end → après exécution, isMovementDone(localId)
 *  doit être false (mouvement en cours). Utilise un Common_Movement (toujours chargé). */
export async function testMovement(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const syms = getSymbols();
  // symbole de mouvement résolvable (Common_Movement_* chargé via _common)
  let movSym = -1, movLabel = '';
  for (let id = 1; id < syms.length; id++) {
    if (syms[id].kind === 'movement' && syms[id].label.startsWith('Common_Movement')) { movSym = id; movLabel = syms[id].label; break; }
  }
  // objet actif non-joueur sur la map courante
  let objLocalId = -1;
  for (let i = 0; i < gObjectEvents.length; i++) {
    const o = gObjectEvents[i];
    if (o && o.active && i !== gPlayerAvatar.objectEventId && typeof o.localId === 'number') { objLocalId = o.localId; break; }
  }
  let moving = false;
  if (movSym >= 0 && objLocalId >= 0) {
    const APPLY = cmdIdOf('ScrCmd_applymovement');
    const END = cmdIdOf('ScrCmd_end');
    // applymovement <localId>, <movSym> ; end
    const code = Uint8Array.from([
      APPLY, lo(objLocalId), hi(objLocalId),
      lo(movSym), hi(movSym), (movSym >> 16) & 0xFF, (movSym >>> 24) & 0xFF,
      END,
    ]);
    RunScriptImmediately({ buf: code, off: 0 } as ScriptPtr);
    moving = !isMovementDone(String(objLocalId));
  }
  const pass = movSym >= 0 && objLocalId >= 0 && moving;
  const details = { 'mouvement': movLabel, 'objet localId': objLocalId, 'isMovementDone=false (en cours)': moving };
  console.log(`[byte-vm] TEST applymovement : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test WARP via bytecode synthétique : warp <mapSym>, warpId, x, y ; end →
 *  setPendingWarp doit recevoir le bon destMap (MAP_*). */
export async function testWarp(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const mapSyms = getMapSymbols();
  let mapSymId = -1, mapConst = '';
  for (let id = 0; id < mapSyms.length; id++) { if (mapSyms[id] && mapSyms[id].startsWith('MAP_')) { mapSymId = id; mapConst = mapSyms[id]; break; } }
  let w: { destMap?: string; x?: number; y?: number; warpId?: number } | undefined;
  if (mapSymId >= 0) {
    const WARP = cmdIdOf('ScrCmd_warp'), END = cmdIdOf('ScrCmd_end');
    // warp <mapSym(u16)>, warpId=3 (u8), x=11 (u16), y=22 (u16) ; end
    const code = Uint8Array.from([WARP, lo(mapSymId), hi(mapSymId), 3, 11, 0, 22, 0, END]);
    setPendingWarp(null);
    RunScriptImmediately({ buf: code, off: 0 } as ScriptPtr);
    // getPendingWarp() renvoie { kind, warp:{destMap,x,y,warpId,...} }
    const pw = getPendingWarp() as { warp?: { destMap?: string; x?: number; y?: number; warpId?: number } } | null;
    w = pw?.warp;
    setPendingWarp(null); // nettoyage
  }
  const got = w;
  const pass = mapSymId >= 0 && !!got && got.destMap === mapConst && got.x === 11 && got.y === 22 && got.warpId === 3;
  const details = { 'mapSymbol': mapConst, 'pendingWarp': got };
  console.log(`[byte-vm] TEST warp : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test MONEY via bytecode synthétique : addmoney 1000,0 ; removemoney 400,0 ;
 *  checkmoney 100,0 ; end → money +600, VAR_RESULT=1 (≥100). */
export async function testMoney(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const ADDM = cmdIdOf('ScrCmd_addmoney'), REMM = cmdIdOf('ScrCmd_removemoney'), CHKM = cmdIdOf('ScrCmd_checkmoney'), END = cmdIdOf('ScrCmd_end');
  const w32 = (v: number) => [v & 0xFF, (v >> 8) & 0xFF, (v >> 16) & 0xFF, (v >>> 24) & 0xFF];
  const before = GetMoney();
  // addmoney 1000,0 ; removemoney 400,0 ; checkmoney 100,0 ; end
  const code = Uint8Array.from([
    ADDM, ...w32(1000), 0,
    REMM, ...w32(400), 0,
    CHKM, ...w32(100), 0,
    END,
  ]);
  const VAR_RESULT = num('VAR_RESULT');
  VarSet(VAR_RESULT, 0);
  RunScriptImmediately({ buf: code, off: 0 } as ScriptPtr);
  const after = GetMoney();
  const result = VarGet(VAR_RESULT);
  const delta = after - before;
  // remet la money d'origine
  if (delta > 0) RemoveMoney(delta); else if (delta < 0) AddMoney(-delta);
  const pass = delta === 600 && result === 1;
  const details = { 'money avant': before, 'money après (Δ attendu +600)': after, 'Δ': delta, 'checkmoney VAR_RESULT (attendu 1)': result };
  console.log(`[byte-vm] TEST money : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test ITEM via bytecode synthétique : additem ITEM_POTION, 5 ; end →
 *  VAR_RESULT=1 (ajouté) + bag a ≥5 potions. Nettoie après (removeitem). */
export async function testItem(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const ITEM_POTION = num('ITEM_POTION');
  const VAR_RESULT = num('VAR_RESULT');
  const ADDITEM = cmdIdOf('ScrCmd_additem'), END = cmdIdOf('ScrCmd_end');
  // additem ITEM_POTION (u16), 5 (u16) ; end
  const code = Uint8Array.from([ADDITEM, lo(ITEM_POTION), hi(ITEM_POTION), 5, 0, END]);
  VarSet(VAR_RESULT, 0);
  RunScriptImmediately({ buf: code, off: 0 } as ScriptPtr);
  const result = VarGet(VAR_RESULT);
  const has5 = CheckBagHasItem('ITEM_POTION', 5);
  RemoveBagItem('ITEM_POTION', 5);   // nettoyage
  const pass = result === 1 && has5;
  const details = { 'additem VAR_RESULT (attendu 1)': result, 'bag a ≥5 ITEM_POTION': has5 };
  console.log(`[byte-vm] TEST item : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test SETMETATILE via bytecode synthétique : setmetatile x,y,id,0 → la tile change.
 *  Lit l'ancienne valeur, pose une nouvelle, vérifie via MapGridGetMetatileIdAt, restaure. */
export async function testMetatile(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const X = 5, Y = 5;
  const gx = X + MAP_OFFSET, gy = Y + MAP_OFFSET;
  const orig = MapGridGetMetatileIdAt(gx, gy);
  const newId = (orig === 1 ? 2 : 1);
  const SETMT = cmdIdOf('ScrCmd_setmetatile'), END = cmdIdOf('ScrCmd_end');
  // setmetatile X, Y, newId, 0(impassable) ; end  (4 halfwords)
  const code = Uint8Array.from([SETMT, lo(X), hi(X), lo(Y), hi(Y), lo(newId), hi(newId), 0, 0, END]);
  RunScriptImmediately({ buf: code, off: 0 } as ScriptPtr);
  const after = MapGridGetMetatileIdAt(gx, gy);
  MapGridSetMetatileIdAt(gx, gy, orig);   // restaure
  const pass = after === newId;
  const details = { 'tile avant': orig, 'tile posée': newId, 'tile lue après': after };
  console.log(`[byte-vm] TEST setmetatile : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test OBJECT (setobjectxy) via bytecode synthétique sur un vrai objet :
 *  setobjectxy <localId>, x, y → l'objet bouge (currentCoordsX = x+MAP_OFFSET). Restaure. */
export async function testObject(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  let idx = -1;
  for (let i = 0; i < gObjectEvents.length; i++) {
    const o = gObjectEvents[i];
    if (o && o.active && i !== gPlayerAvatar.objectEventId && typeof o.localId === 'number') { idx = i; break; }
  }
  let moved = false; let localId = -1;
  if (idx >= 0) {
    const o = gObjectEvents[idx];
    localId = o.localId;
    const origCX = o.currentCoordsX, origCY = o.currentCoordsY;
    const newX = (o.currentCoordsX - MAP_OFFSET) + 1, newY = (o.currentCoordsY - MAP_OFFSET);
    const SX = cmdIdOf('ScrCmd_setobjectxy'), END = cmdIdOf('ScrCmd_end');
    // setobjectxy localId, newX, newY ; end (3 halfwords)
    const code = Uint8Array.from([SX, lo(localId), hi(localId), lo(newX), hi(newX), lo(newY), hi(newY), END]);
    RunScriptImmediately({ buf: code, off: 0 } as ScriptPtr);
    moved = gObjectEvents[idx].currentCoordsX === newX + MAP_OFFSET;
    // restaure
    gObjectEvents[idx].currentCoordsX = origCX; gObjectEvents[idx].currentCoordsY = origCY;
    gObjectEvents[idx].previousCoordsX = origCX; gObjectEvents[idx].previousCoordsY = origCY;
  }
  const pass = idx >= 0 && moved;
  const details = { 'objet localId': localId, 'setobjectxy → currentCoordsX déplacé': moved };
  console.log(`[byte-vm] TEST object (setobjectxy) : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test BUFFERS via bytecode synthétique :
 *  bufferspeciesname STR_VAR_2, SPECIES_PIKACHU ; bufferitemname STR_VAR_1, ITEM_POTION ;
 *  buffernumberstring STR_VAR_3, 42 ; end
 *  → gStringVar2 = nom espèce FR, gStringVar1 = nom item FR, gStringVar3 = "42".
 *  (les bytes stringVarId sont 0/1/2 = STR_VAR_1/2/3 ; VarGet(literal<VARS_START)=literal.) */
export async function testBuffers(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const SPECIES = num('SPECIES_PIKACHU'), ITEM = num('ITEM_POTION');
  const BSP = cmdIdOf('ScrCmd_bufferspeciesname'), BIT = cmdIdOf('ScrCmd_bufferitemname');
  const BNUM = cmdIdOf('ScrCmd_buffernumberstring'), END = cmdIdOf('ScrCmd_end');
  // bufferspeciesname STR_VAR_2(=1), SPECIES ; bufferitemname STR_VAR_1(=0), ITEM ;
  // buffernumberstring STR_VAR_3(=2), 42 ; end
  const code = Uint8Array.from([
    BSP, 1, lo(SPECIES), hi(SPECIES),
    BIT, 0, lo(ITEM), hi(ITEM),
    BNUM, 2, 42, 0,
    END,
  ]);
  RunScriptImmediately({ buf: code, off: 0 } as ScriptPtr);
  const sp = getStringVar(2), it = getStringVar(1), nb = getStringVar(3);
  const expSp = getSpeciesNameFr('SPECIES_PIKACHU'), expIt = getItemNameFr('ITEM_POTION');
  const pass = sp === expSp && expSp.length > 0 && it === expIt && expIt.length > 0 && nb === '42';
  const details = {
    'gStringVar2 espèce (attendu)': `${sp} / ${expSp}`,
    'gStringVar1 item (attendu)': `${it} / ${expIt}`,
    'gStringVar3 nombre (attendu 42)': nb,
  };
  console.log(`[byte-vm] TEST buffers : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test GETPLAYERXY + GETPARTYSIZE via bytecode synthétique :
 *  getplayerxy VAR_TEMP_1, VAR_TEMP_2 ; getpartysize ; end
 *  → VAR_TEMP_1=pos.x, VAR_TEMP_2=pos.y, VAR_RESULT=CalculatePlayerPartyCount(). */
export async function testPlayer(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const VT1 = num('VAR_TEMP_1'), VT2 = num('VAR_TEMP_2'), VR = num('VAR_RESULT');
  const GXY = cmdIdOf('ScrCmd_getplayerxy'), GSZ = cmdIdOf('ScrCmd_getpartysize'), END = cmdIdOf('ScrCmd_end');
  const code = Uint8Array.from([GXY, lo(VT1), hi(VT1), lo(VT2), hi(VT2), GSZ, END]);
  VarSet(VT1, 0); VarSet(VT2, 0); VarSet(VR, 0);
  RunScriptImmediately({ buf: code, off: 0 } as ScriptPtr);
  const gx = VarGet(VT1), gy = VarGet(VT2), sz = VarGet(VR);
  const expX = gSaveBlock1Ptr.pos.x & 0xFFFF, expY = gSaveBlock1Ptr.pos.y & 0xFFFF, expSz = CalculatePlayerPartyCount();
  const pass = gx === expX && gy === expY && sz === expSz;
  const details = {
    'getplayerxy → x (attendu)': `${gx} / ${expX}`,
    'getplayerxy → y (attendu)': `${gy} / ${expY}`,
    'getpartysize → VAR_RESULT (attendu)': `${sz} / ${expSz}`,
  };
  console.log(`[byte-vm] TEST player : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test WEATHER via bytecode synthétique : setweather WEATHER_RAIN ; end →
 *  GetSavedWeather()===WEATHER_RAIN ; idem WEATHER_SUNNY ; resetweather + doweather
 *  s'exécutent sans throw. Restaure la météo d'origine. */
export async function testWeather(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const SETW = cmdIdOf('ScrCmd_setweather'), RESETW = cmdIdOf('ScrCmd_resetweather'),
        DOW = cmdIdOf('ScrCmd_doweather'), END = cmdIdOf('ScrCmd_end');
  const RAIN = WEATHER_RAIN, SUNNY = WEATHER_SUNNY;
  const orig = GetSavedWeather();
  // setweather WEATHER_RAIN ; end
  RunScriptImmediately({ buf: Uint8Array.from([SETW, lo(RAIN), hi(RAIN), END]), off: 0 } as ScriptPtr);
  const w1 = GetSavedWeather();
  RunScriptImmediately({ buf: Uint8Array.from([SETW, lo(SUNNY), hi(SUNNY), END]), off: 0 } as ScriptPtr);
  const w2 = GetSavedWeather();
  let noThrow = true;
  try {
    RunScriptImmediately({ buf: Uint8Array.from([RESETW, END]), off: 0 } as ScriptPtr);
    RunScriptImmediately({ buf: Uint8Array.from([DOW, END]), off: 0 } as ScriptPtr);
  } catch { noThrow = false; }
  SetSavedWeather(orig);   // restaure
  const pass = w1 === RAIN && w2 === SUNNY && noThrow;
  const details = { 'setweather RAIN (attendu)': `${w1}/${RAIN}`, 'setweather SUNNY (attendu)': `${w2}/${SUNNY}`, 'reset+doweather sans throw': noThrow };
  console.log(`[byte-vm] TEST weather : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test DOORS via bytecode synthétique sur une VRAIE porte de la map courante :
 *  scanne la grille live pour un tile MB_ANIMATED_DOOR, puis opendoor <x>,<y> ; end
 *  → isDoorAnimationStopped()===false (anim démarrée). Puis setdoorclosed (no throw).
 *  Si aucune porte sur la map → fail explicite (lancer depuis une ville). */
export async function testDoor(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const player = gObjectEvents[gPlayerAvatar.objectEventId];
  const cx = player?.currentCoordsX ?? 20, cy = player?.currentCoordsY ?? 20;
  let door: { gx: number; gy: number } | null = null;
  for (let gy = cy - 30; gy <= cy + 30 && !door; gy++) {
    for (let gx = Math.max(0, cx - 30); gx <= cx + 30; gx++) {
      if (gy < 0) continue;
      if (MapGridGetMetatileBehaviorAt(gx, gy) === MB_ANIMATED_DOOR) { door = { gx, gy }; break; }
    }
  }
  let animStarted = false, noThrow = true;
  if (door) {
    const rawX = door.gx - MAP_OFFSET, rawY = door.gy - MAP_OFFSET;
    const OPEN = cmdIdOf('ScrCmd_opendoor'), CLOSE = cmdIdOf('ScrCmd_setdoorclosed'), END = cmdIdOf('ScrCmd_end');
    try {
      RunScriptImmediately({ buf: Uint8Array.from([OPEN, lo(rawX), hi(rawX), lo(rawY), hi(rawY), END]), off: 0 } as ScriptPtr);
      animStarted = !isDoorAnimationStopped();
      RunScriptImmediately({ buf: Uint8Array.from([CLOSE, lo(rawX), hi(rawX), lo(rawY), hi(rawY), END]), off: 0 } as ScriptPtr);
    } catch (e) { noThrow = false; console.warn('[testDoor]', e); }
  }
  const pass = !!door && animStarted && noThrow;
  const details = { 'porte trouvée (grille)': door, 'opendoor → anim active': animStarted, 'setdoorclosed sans throw': noThrow };
  console.log(`[byte-vm] TEST doors : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test FIELD EFFECTS via bytecode synthétique :
 *  setfieldeffectargument 0, 1234 ; setfieldeffectargument 1, 0xFFFF ; end
 *  → gFieldEffectArguments[0]===1234, [1]===-1 (cast s16). Puis dofieldeffect/
 *  waitfieldeffect s'exécutent sans throw. */
export async function testFieldEffect(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const SETARG = cmdIdOf('ScrCmd_setfieldeffectargument'), DOFX = cmdIdOf('ScrCmd_dofieldeffect'),
        WAITFX = cmdIdOf('ScrCmd_waitfieldeffect'), END = cmdIdOf('ScrCmd_end');
  // arg[0] depuis un littéral (1234) ; arg[1] depuis une VAR=0xFFFF → cast (s16)=-1.
  // (un immédiat ≥ VARS_START serait lu comme id de var par VarGet — donc le s16 ne
  //  se teste qu'avec une valeur venant d'une variable.)
  const VT1 = num('VAR_TEMP_1');
  VarSet(VT1, 0xFFFF);
  // setfieldeffectargument 0, 1234 ; setfieldeffectargument 1, VAR_TEMP_1 ; end
  RunScriptImmediately({ buf: Uint8Array.from([
    SETARG, 0, lo(1234), hi(1234),
    SETARG, 1, lo(VT1), hi(VT1),
    END,
  ]), off: 0 } as ScriptPtr);
  const args = (globalThis as Record<string, unknown>).gFieldEffectArguments as number[] | undefined;
  const a0 = args?.[0], a1 = args?.[1];
  // dofieldeffect <id absent de la liste active> ; waitfieldeffect <même id> ; end — no throw
  let noThrow = true;
  try {
    RunScriptImmediately({ buf: Uint8Array.from([WAITFX, lo(99), hi(99), END]), off: 0 } as ScriptPtr);
    RunScriptImmediately({ buf: Uint8Array.from([DOFX, lo(99), hi(99), END]), off: 0 } as ScriptPtr);
  } catch (e) { noThrow = false; console.warn('[testFieldEffect]', e); }
  const pass = a0 === 1234 && a1 === -1 && noThrow;
  const details = { 'gFieldEffectArguments[0] (attendu 1234)': a0, 'gFieldEffectArguments[1] (s16 0xFFFF→-1)': a1, 'do/waitfieldeffect sans throw': noThrow };
  console.log(`[byte-vm] TEST field-effect : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test VIRTUAL OBJECTS via bytecode synthétique + spy (prouve l'ordre de lecture
 *  des octets sans dépendre du renderer/gfx-load async) :
 *  createvobject GFX=7, VOBJ=3, x=10, y=12, elev=1, dir=2 → spy reçoit (7,3,10,12,1,2).
 *  turnvobject 3, 1 → spy reçoit (3,1). Restaure l'API réelle. */
export async function testVobject(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const g = globalThis as { __virtualObjects?: Record<string, unknown> };
  const api = g.__virtualObjects ?? (g.__virtualObjects = {});
  const realCreate = api.CreateVirtualObject, realTurn = api.TurnVirtualObject;
  let createArgs: number[] | null = null, turnArgs: number[] | null = null;
  api.CreateVirtualObject = (...a: number[]) => { createArgs = a; return Promise.resolve(1); };
  api.TurnVirtualObject = (...a: number[]) => { turnArgs = a; };
  try {
    const CV = cmdIdOf('ScrCmd_createvobject'), TV = cmdIdOf('ScrCmd_turnvobject'), END = cmdIdOf('ScrCmd_end');
    // createvobject 7,3,10,12,1,2 ; end  (u8 u8 u16 u16 u8 u8)
    RunScriptImmediately({ buf: Uint8Array.from([CV, 7, 3, lo(10), hi(10), lo(12), hi(12), 1, 2, END]), off: 0 } as ScriptPtr);
    // turnvobject 3,1 ; end
    RunScriptImmediately({ buf: Uint8Array.from([TV, 3, 1, END]), off: 0 } as ScriptPtr);
  } finally {
    api.CreateVirtualObject = realCreate; api.TurnVirtualObject = realTurn;
  }
  const ca = createArgs as number[] | null, ta = turnArgs as number[] | null;
  const createOk = !!ca && ca.join(',') === '7,3,10,12,1,2';
  const turnOk = !!ta && ta.join(',') === '3,1';
  const pass = createOk && turnOk;
  const details = { 'createvobject args (attendu 7,3,10,12,1,2)': ca, 'turnvobject args (attendu 3,1)': ta };
  console.log(`[byte-vm] TEST vobject : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test OBJECT MOVEMENT (turnobject/setobjectmovementtype/copyobjectxytoperm) sur un
 *  vrai NPC de la map : turnobject→facingDirection ; setobjectmovementtype id 7→
 *  movementType="MOVEMENT_TYPE_FACE_UP"+facing NORTH ; copyobjectxytoperm→template XY.
 *  Restaure l'état du NPC. */
export async function testObjectMovement(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  let idx = -1;
  for (let i = 0; i < gObjectEvents.length; i++) {
    const o = gObjectEvents[i];
    if (o && o.active && i !== gPlayerAvatar.objectEventId && typeof o.localId === 'number') { idx = i; break; }
  }
  if (idx < 0) { console.warn('[testObjectMovement] aucun NPC actif'); return { pass: false, details: { note: 'aucun NPC actif' } }; }
  const o = gObjectEvents[idx];
  const localId = o.localId as number;
  const origFacing = o.facingDirection, origMt = o.movementType, origStep = o.movementStep;
  const TURN = cmdIdOf('ScrCmd_turnobject'), SETMT = cmdIdOf('ScrCmd_setobjectmovementtype'),
        COPYP = cmdIdOf('ScrCmd_copyobjectxytoperm'), END = cmdIdOf('ScrCmd_end');
  // turnobject localId, 4(EAST) ; end
  RunScriptImmediately({ buf: Uint8Array.from([TURN, lo(localId), hi(localId), 4, END]), off: 0 } as ScriptPtr);
  const turnedEast = o.facingDirection === 4;
  // setobjectmovementtype localId, 7(MOVEMENT_TYPE_FACE_UP) ; end
  RunScriptImmediately({ buf: Uint8Array.from([SETMT, lo(localId), hi(localId), 7, END]), off: 0 } as ScriptPtr);
  const mtSet = o.movementType === 'MOVEMENT_TYPE_FACE_UP';
  const facedUp = o.facingDirection === 2;
  // copyobjectxytoperm localId ; end
  RunScriptImmediately({ buf: Uint8Array.from([COPYP, lo(localId), hi(localId), END]), off: 0 } as ScriptPtr);
  const tmpl = findTemplateByLocalId(String(localId));
  const permOk = !!tmpl && tmpl.x === o.currentCoordsX - MAP_OFFSET && tmpl.y === o.currentCoordsY - MAP_OFFSET;
  // restaure
  o.facingDirection = origFacing; o.movementType = origMt; o.movementStep = origStep;
  const pass = turnedEast && mtSet && facedUp && permOk;
  const details = {
    'turnobject EAST → facing=4': turnedEast,
    'setobjectmovementtype 7 → movementType (attendu MOVEMENT_TYPE_FACE_UP)': `${o.movementType === origMt ? '(restauré)' : ''}${mtSet}`,
    'setobjectmovementtype → facing NORTH=2': facedUp,
    'copyobjectxytoperm → template XY = current-MAP_OFFSET': permOk,
  };
  console.log(`[byte-vm] TEST object-movement : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test FADESCREEN via bytecode synthétique (ticks BORNÉS — pas RunScriptImmediately
 *  car le poll IsPaletteNotActive bouclerait : le fade n'avance qu'aux frames OW) :
 *  fadescreen FADE_TO_BLACK ; end → gPaletteFade.active devient true (fade démarré).
 *  Restaure ensuite via FadeScreen(FADE_FROM_BLACK) pour ne pas laisser l'écran noir. */
export async function testFade(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const FADE = cmdIdOf('ScrCmd_fadescreen'), END = cmdIdOf('ScrCmd_end');
  const FADE_TO_BLACK = 1, FADE_FROM_BLACK = 0;
  const code = Uint8Array.from([FADE, FADE_TO_BLACK, END]);
  ScriptContext_SetupScript({ buf: code, off: 0 } as ScriptPtr);
  for (let i = 0; i < 3; i++) ScriptContext_RunScript();
  const active = !!getRuntime()?.gPaletteFade?.active;
  FadeScreen(FADE_FROM_BLACK, 0);   // restaure (l'écran refade vers normal aux frames OW)
  const pass = active;
  const details = { 'fadescreen TO_BLACK → gPaletteFade.active': active };
  console.log(`[byte-vm] TEST fadescreen : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test LONG-TAIL 1 : random (déterministe) + setberrytree (état) + ALIGNEMENT du
 *  flux d'octets sur la chaîne money/coins box (un setvar marqueur final ne tombe
 *  juste que si chaque handler a consommé exactement ses octets). */
export async function testLongTail1(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const RAND = cmdIdOf('ScrCmd_random'), SETBT = cmdIdOf('ScrCmd_setberrytree'),
        SMB = cmdIdOf('ScrCmd_showmoneybox'), HMB = cmdIdOf('ScrCmd_hidemoneybox'),
        UCB = cmdIdOf('ScrCmd_updatecoinsbox'), SETVAR = cmdIdOf('ScrCmd_setvar'), END = cmdIdOf('ScrCmd_end');
  const VR = num('VAR_RESULT'), VT1 = num('VAR_TEMP_1');
  // random max=1 → VAR_RESULT toujours 0 (déterministe)
  VarSet(VR, 5);
  RunScriptImmediately({ buf: Uint8Array.from([RAND, lo(1), hi(1), END]), off: 0 } as ScriptPtr);
  const rnd1 = VarGet(VR);
  // random max=100 → [0,100)
  RunScriptImmediately({ buf: Uint8Array.from([RAND, lo(100), hi(100), END]), off: 0 } as ScriptPtr);
  const rnd100 = VarGet(VR);
  // setberrytree tree=0, berry=5, stage=3 → GetBerryTypeByBerryTreeId(0)===5
  RunScriptImmediately({ buf: Uint8Array.from([SETBT, 0, 5, 3, END]), off: 0 } as ScriptPtr);
  const berry = GetBerryTypeByBerryTreeId(0);
  // alignement : showmoneybox 1,2,0 ; hidemoneybox(+2 zéros=nops) ; updatecoinsbox 1,2 ;
  //              setvar VAR_TEMP_1, 0xBEEF ; end  → VAR_TEMP_1 doit valoir 0xBEEF.
  VarSet(VT1, 0);
  RunScriptImmediately({ buf: Uint8Array.from([
    SMB, 1, 2, 0,
    HMB, 0, 0,
    UCB, 1, 2,
    SETVAR, lo(VT1), hi(VT1), lo(0xBEEF), hi(0xBEEF),
    END,
  ]), off: 0 } as ScriptPtr);
  const aligned = VarGet(VT1) === 0xBEEF;
  const pass = rnd1 === 0 && rnd100 >= 0 && rnd100 < 100 && berry === 5 && aligned;
  const details = {
    'random max=1 → 0': rnd1, 'random max=100 ∈ [0,100)': rnd100,
    'setberrytree berry (attendu 5)': berry, 'alignement flux money/coins (setvar=0xBEEF)': aligned,
  };
  console.log(`[byte-vm] TEST long-tail 1 : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test LONG-TAIL 2 : checkpartymove(MOVE_NONE)→PARTY_SIZE + ALIGNEMENT du flux sur
 *  setvaddress (4o) + copybyte (8o) + dotimebasedevents (0o) via setvar marqueur final. */
export async function testLongTail2(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const CPM = cmdIdOf('ScrCmd_checkpartymove'), SETVADDR = cmdIdOf('ScrCmd_setvaddress'),
        COPYB = cmdIdOf('ScrCmd_copybyte'), DTBE = cmdIdOf('ScrCmd_dotimebasedevents'),
        SETVAR = cmdIdOf('ScrCmd_setvar'), END = cmdIdOf('ScrCmd_end');
  const VR = num('VAR_RESULT'), VT1 = num('VAR_TEMP_1');
  const w32 = (v: number) => [v & 0xFF, (v >> 8) & 0xFF, (v >> 16) & 0xFF, (v >>> 24) & 0xFF];
  // checkpartymove <move bidon 0xFFFE> → aucun mon ne le connaît → result = PARTY_SIZE(6).
  // (NB : MOVE_NONE(0) matcherait les slots de move VIDES → 1:1 décomp, donc pas un test net.)
  VarSet(VR, 0);
  RunScriptImmediately({ buf: Uint8Array.from([CPM, 0xFE, 0xFF, END]), off: 0 } as ScriptPtr);
  const noneResult = VarGet(VR);
  // alignement : setvaddress(4o) ; copybyte(4o+4o) ; dotimebasedevents(0o) ; setvar VT1,0xCAFE
  VarSet(VT1, 0);
  RunScriptImmediately({ buf: Uint8Array.from([
    SETVADDR, ...w32(0),
    COPYB, ...w32(0), ...w32(0),
    DTBE,
    SETVAR, lo(VT1), hi(VT1), lo(0xCAFE), hi(0xCAFE),
    END,
  ]), off: 0 } as ScriptPtr);
  const aligned = VarGet(VT1) === 0xCAFE;
  const pass = noneResult === 6 && aligned;
  const details = { 'checkpartymove MOVE_NONE → PARTY_SIZE(6)': noneResult, 'alignement setvaddress+copybyte+dotimebasedevents (setvar=0xCAFE)': aligned };
  console.log(`[byte-vm] TEST long-tail 2 : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test WARP VARIANTS via bytecode synthétique : setwarp/setdivewarp/setholewarp/
 *  setescapewarp posent leurs globals respectifs (gSavedWarp/gDiveWarp/gHoleWarp/
 *  __escapeWarp) ; setdynamicwarp s'exécute sans throw. Layout = 2map,u8,u16,u16. */
export async function testWarpVariants(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const mapSyms = getMapSymbols();
  let mapSymId = -1, mapConst = '';
  for (let id = 0; id < mapSyms.length; id++) { if (mapSyms[id] && mapSyms[id].startsWith('MAP_')) { mapSymId = id; mapConst = mapSyms[id]; break; } }
  const END = cmdIdOf('ScrCmd_end');
  const g = globalThis as Record<string, unknown>;
  // bytecode <OP> mapSym(u16), warpId=4, x=11(u16), y=22(u16) ; end
  const mk = (op: number) => Uint8Array.from([op, lo(mapSymId), hi(mapSymId), 4, 11, 0, 22, 0, END]);
  type W = { destMap?: string; warpId?: number; x?: number; y?: number };
  RunScriptImmediately({ buf: mk(cmdIdOf('ScrCmd_setwarp')), off: 0 } as ScriptPtr);
  const saved = g.gSavedWarp as W;
  RunScriptImmediately({ buf: mk(cmdIdOf('ScrCmd_setdivewarp')), off: 0 } as ScriptPtr);
  const dive = g.gDiveWarp as W;
  RunScriptImmediately({ buf: mk(cmdIdOf('ScrCmd_setholewarp')), off: 0 } as ScriptPtr);
  const hole = g.gHoleWarp as W;
  RunScriptImmediately({ buf: mk(cmdIdOf('ScrCmd_setescapewarp')), off: 0 } as ScriptPtr);
  const esc = g.__escapeWarp as { mapName?: string; x?: number; y?: number };
  let dynNoThrow = true;
  try { RunScriptImmediately({ buf: mk(cmdIdOf('ScrCmd_setdynamicwarp')), off: 0 } as ScriptPtr); } catch { dynNoThrow = false; }
  const okWarp = (w: W) => !!w && w.destMap === mapConst && w.warpId === 4 && w.x === 11 && w.y === 22;
  const savedOk = okWarp(saved), diveOk = okWarp(dive), holeOk = okWarp(hole);
  const escOk = !!esc && esc.mapName === mapConst.replace(/^MAP_/, '') && esc.x === 11 && esc.y === 22;
  const pass = mapSymId >= 0 && savedOk && diveOk && holeOk && escOk && dynNoThrow;
  const details = { map: mapConst, 'setwarp→gSavedWarp': savedOk, 'setdivewarp→gDiveWarp': diveOk, 'setholewarp→gHoleWarp': holeOk, 'setescapewarp→__escapeWarp': escOk, 'setdynamicwarp sans throw': dynNoThrow };
  console.log(`[byte-vm] TEST warp variants : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test LONG-TAIL 3 : getpokenewsactive→0, setobjectsubpriority/reset sur un vrai NPC
 *  (obj.subpriority=priority+83 puis reset), + ALIGNEMENT erasebox+messageautoscroll+
 *  savebgm via setvar marqueur 0xD00D. */
export async function testLongTail3(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const GPNA = cmdIdOf('ScrCmd_getpokenewsactive'), SOSP = cmdIdOf('ScrCmd_setobjectsubpriority'),
        ROSP = cmdIdOf('ScrCmd_resetobjectsubpriority'), ERASE = cmdIdOf('ScrCmd_erasebox'),
        MAS = cmdIdOf('ScrCmd_messageautoscroll'), SBGM = cmdIdOf('ScrCmd_savebgm'),
        SETVAR = cmdIdOf('ScrCmd_setvar'), END = cmdIdOf('ScrCmd_end');
  const VR = num('VAR_RESULT'), VT1 = num('VAR_TEMP_1');
  const w32 = (v: number) => [v & 0xFF, (v >> 8) & 0xFF, (v >> 16) & 0xFF, (v >>> 24) & 0xFF];
  // getpokenewsactive 1 → VAR_RESULT=0
  VarSet(VR, 9);
  RunScriptImmediately({ buf: Uint8Array.from([GPNA, 1, 0, END]), off: 0 } as ScriptPtr);
  const pokenews = VarGet(VR);
  // setobjectsubpriority sur un NPC réel : localId, map(u16 ignoré), priority=5 → subpriority=88
  let idx = -1;
  for (let i = 0; i < gObjectEvents.length; i++) { const o = gObjectEvents[i]; if (o && o.active && i !== gPlayerAvatar.objectEventId && typeof o.localId === 'number') { idx = i; break; } }
  let subOk = false, resetOk = false;
  if (idx >= 0) {
    const o = gObjectEvents[idx] as unknown as { localId: number; subpriority?: number; fixedPriority?: boolean };
    const origSub = o.subpriority, origFixed = o.fixedPriority;
    RunScriptImmediately({ buf: Uint8Array.from([SOSP, lo(o.localId), hi(o.localId), 0, 0, 5, END]), off: 0 } as ScriptPtr);
    subOk = o.subpriority === 88 && o.fixedPriority === true;
    RunScriptImmediately({ buf: Uint8Array.from([ROSP, lo(o.localId), hi(o.localId), 0, 0, END]), off: 0 } as ScriptPtr);
    resetOk = o.subpriority === undefined && o.fixedPriority === false;
    o.subpriority = origSub; o.fixedPriority = origFixed;   // restaure
  }
  // alignement : erasebox(4o) + messageautoscroll(4o) + savebgm(2o) + setvar VT1,0xD00D
  VarSet(VT1, 0);
  RunScriptImmediately({ buf: Uint8Array.from([
    ERASE, 1, 2, 3, 4,
    MAS, ...w32(0),
    SBGM, 0, 0,
    SETVAR, lo(VT1), hi(VT1), lo(0xD00D), hi(0xD00D),
    END,
  ]), off: 0 } as ScriptPtr);
  const aligned = VarGet(VT1) === 0xD00D;
  const pass = pokenews === 0 && idx >= 0 && subOk && resetOk && aligned;
  const details = { 'getpokenewsactive → 0': pokenews, 'setobjectsubpriority → subpriority 88+fixed': subOk, 'resetobjectsubpriority → reset': resetOk, 'alignement erase+autoscroll+savebgm (setvar=0xD00D)': aligned };
  console.log(`[byte-vm] TEST long-tail 3 : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test LONG-TAIL 4 : ALIGNEMENT du flux sur setmonmove(u8,u8,u16) + bufferboxname
 *  (u8,u16) + braillemessage(u32) + closebraillemessage(0) + fadenewbgm(u16) via setvar
 *  marqueur 0xBABE (setmonmove sur slot 5 vide = inoffensif). */
export async function testLongTail4(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const SETMM = cmdIdOf('ScrCmd_setmonmove'), BBN = cmdIdOf('ScrCmd_bufferboxname'),
        BMSG = cmdIdOf('ScrCmd_braillemessage'), CBMSG = cmdIdOf('ScrCmd_closebraillemessage'),
        FNB = cmdIdOf('ScrCmd_fadenewbgm'), SETVAR = cmdIdOf('ScrCmd_setvar'), END = cmdIdOf('ScrCmd_end');
  const VT1 = num('VAR_TEMP_1');
  const w32 = (v: number) => [v & 0xFF, (v >> 8) & 0xFF, (v >> 16) & 0xFF, (v >>> 24) & 0xFF];
  VarSet(VT1, 0);
  RunScriptImmediately({ buf: Uint8Array.from([
    SETMM, 5, 3, 0, 0,        // setmonmove partyIndex=5(slot vide), slot=3, move=0
    BBN, 0, 0, 0,             // bufferboxname stringvar=0, boxId=0
    BMSG, ...w32(0),          // braillemessage ptr=0
    CBMSG,                    // closebraillemessage (0 octet)
    FNB, 0, 0,                // fadenewbgm songId=0
    SETVAR, lo(VT1), hi(VT1), lo(0xBABE), hi(0xBABE),
    END,
  ]), off: 0 } as ScriptPtr);
  const aligned = VarGet(VT1) === 0xBABE;
  const pass = aligned;
  const details = { 'alignement setmonmove+bufferboxname+braille+fadenewbgm (setvar=0xBABE)': aligned };
  console.log(`[byte-vm] TEST long-tail 4 : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test FLASH (voie A) : setflashlevel 7→globalThis.gFlashLevel=7, 0→0 ; animateflash 5
 *  (poll auto-incrémenté → RunScriptImmediately termine en 16 itérations) → gFlashLevel=5.
 *  Restaure à 0. */
export async function testFlash(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const SFL = cmdIdOf('ScrCmd_setflashlevel'), AF = cmdIdOf('ScrCmd_animateflash'), END = cmdIdOf('ScrCmd_end');
  const g = globalThis as Record<string, unknown>;
  RunScriptImmediately({ buf: Uint8Array.from([SFL, 7, 0, END]), off: 0 } as ScriptPtr);
  const lvl7 = g.gFlashLevel;
  RunScriptImmediately({ buf: Uint8Array.from([SFL, 0, 0, END]), off: 0 } as ScriptPtr);
  const lvl0 = g.gFlashLevel;
  RunScriptImmediately({ buf: Uint8Array.from([AF, 5, END]), off: 0 } as ScriptPtr);
  const animated = g.gFlashLevel;
  RunScriptImmediately({ buf: Uint8Array.from([SFL, 0, 0, END]), off: 0 } as ScriptPtr);   // restaure
  const pass = lvl7 === 7 && lvl0 === 0 && animated === 5;
  const details = { 'setflashlevel 7 → gFlashLevel': lvl7, 'setflashlevel 0 → gFlashLevel': lvl0, 'animateflash 5 → gFlashLevel': animated };
  console.log(`[byte-vm] TEST flash : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test GIVEMON/GIVEEGG : alignement du flux (givemon = 14o d'args, giveegg = 2o) via
 *  setvar marqueur, avec species=SPECIES_NONE(0) → don no-op → party count INCHANGÉ
 *  (pas de pollution du save). VAR_RESULT posé async (mirror parsé). */
export async function testGiveMon(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const GM = cmdIdOf('ScrCmd_givemon'), GE = cmdIdOf('ScrCmd_giveegg'),
        SETVAR = cmdIdOf('ScrCmd_setvar'), END = cmdIdOf('ScrCmd_end');
  const VT1 = num('VAR_TEMP_1');
  const w32 = (v: number) => [v & 0xFF, (v >> 8) & 0xFF, (v >> 16) & 0xFF, (v >>> 24) & 0xFF];
  const before = CalculatePlayerPartyCount();
  // givemon species=0(NONE), level=5, item=0, 3 args fixes ; setvar VT1,0xF00D ; end
  VarSet(VT1, 0);
  RunScriptImmediately({ buf: Uint8Array.from([
    GM, lo(0), hi(0), 5, lo(0), hi(0), ...w32(0), ...w32(0), 0,
    SETVAR, lo(VT1), hi(VT1), lo(0xF00D), hi(0xF00D), END,
  ]), off: 0 } as ScriptPtr);
  const gmAligned = VarGet(VT1) === 0xF00D;
  // giveegg species=0 ; setvar VT1,0xEEEE ; end
  VarSet(VT1, 0);
  RunScriptImmediately({ buf: Uint8Array.from([GE, lo(0), hi(0), SETVAR, lo(VT1), hi(VT1), lo(0xEEEE), hi(0xEEEE), END]), off: 0 } as ScriptPtr);
  const geAligned = VarGet(VT1) === 0xEEEE;
  // laisse les imports dynamiques async se résoudre, puis vérifie : party count inchangé
  await new Promise((r) => setTimeout(r, 200));
  const after = CalculatePlayerPartyCount();
  const noMutation = after === before;
  const pass = gmAligned && geAligned && noMutation;
  const details = { 'givemon alignement (setvar=0xF00D)': gmAligned, 'giveegg alignement (setvar=0xEEEE)': geAligned, 'party count inchangé (SPECIES_NONE)': `${before}→${after}` };
  console.log(`[byte-vm] TEST givemon/giveegg : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** ORACLE D'ÉTAT COMBAT (inspecteur) — lit l'état combat LIVE par code : inBattle,
 *  flags, opponent, outcome, party ennemie (espèce/level/hp), battlers. Permet de
 *  vérifier « ce qui DEVRAIT être » (data décomp) vs « ce qui EST » sans test manuel. */
/** Diagnostic SWAP : état live du contexte byte-VM (status/mode/lock) — à lancer
 *  après un freeze pour voir si le lock est resté true alors que le contexte est SHUTDOWN. */
export function diag(): Record<string, unknown> {
  const ctx = _getGlobalContext();
  const STATUS = ['RUNNING', 'WAITING', 'SHUTDOWN'];
  const MODE = ['STOPPED', 'BYTECODE', 'NATIVE'];
  return {
    status: STATUS[_getGlobalStatus()] ?? _getGlobalStatus(),
    mode: MODE[ctx.mode] ?? ctx.mode,
    lock_byteVm: _BVAreLocked(),
    hasNativePoll: !!ctx.nativePtr,
    scriptPtrOff: ctx.scriptPtr?.off ?? null,
  };
}

export function battleState(): Record<string, unknown> {
  const rt = (globalThis as { __rt?: { gMain?: { inBattle?: boolean } } }).__rt;
  const enemyParty = gEnemyParty.slice(0, 6).map((m) => {
    const sp = _GetMonData(m, _MON_DATA_SPECIES) as number;
    return sp ? { species: sp, level: _GetMonData(m, _MON_DATA_LEVEL), hp: _GetMonData(m, _MON_DATA_HP) } : null;
  }).filter(Boolean);
  const battlers = gBattleMons.map((b) => (b && b.species ? { species: b.species, hp: b.hp, maxHP: b.maxHP, level: b.level } : null));
  return {
    inBattle: rt?.gMain?.inBattle ?? false,
    gBattleTypeFlags, gTrainerBattleOpponent_A, gBattleOutcome,
    enemyParty, battlers,
  };
}

/** Test TRAINERBATTLE (STEP 1 déterministe) : prouve que le byte-VM lit le layout
 *  BINAIRE byType (mode u8, opponent u16, localId u16, intro/defeat u32) → pose
 *  gTrainerBattleOpponent_A + saute dans EventScript_TryDoNormalTrainerBattle (1er
 *  tick = trainerbattle + lock qui attend). */
export async function testTrainerbattleArgs(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const TB = cmdIdOf('ScrCmd_trainerbattle'), END = cmdIdOf('ScrCmd_end');
  const tid = 42;
  // trainerbattle TRAINER_BATTLE_SINGLE(0), opponent=tid, localId=0, intro=NULL, defeat=NULL
  const buf = Uint8Array.from([TB, 0, lo(tid), hi(tid), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, END]);
  let threw = false;
  try {
    ScriptContext_SetupScript({ buf, off: 0 } as ScriptPtr);
    ScriptContext_RunScript();   // trainerbattle (pose opponent + jump) → lock (wait)
  } catch (e) { threw = true; console.warn('[testTrainerbattleArgs]', e); }
  const opp = (battleState().gTrainerBattleOpponent_A as number);
  const jumpResolves = getScriptOffset('EventScript_TryDoNormalTrainerBattle') !== undefined;
  const pass = !threw && opp === tid && jumpResolves;
  const details = { 'gTrainerBattleOpponent_A (attendu 42)': opp, 'event-script résolu': jumpResolves, 'sans throw': !threw };
  console.log(`[byte-vm] TEST trainerbattle args : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test LONG-TAIL 5 (batch niche) : setmonmetlocation/setmodernfatefulencounter posent les
 *  champs de gPlayerParty[0] ; warphole(map) pose un pending warp ; ALIGNEMENT octets du flux
 *  setmonmetlocation(3o)+setmodernfatefulencounter(2o)+fadeoutbgm(1o)+fadeinbgm(1o)+
 *  pokenavcall(4o)+messageinstant(4o) via setvar marqueur final 0xF00D. */
export async function testLongTail5(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const SMML = cmdIdOf('ScrCmd_setmonmetlocation'), SMFE = cmdIdOf('ScrCmd_setmodernfatefulencounter'),
        FOB = cmdIdOf('ScrCmd_fadeoutbgm'), FIB = cmdIdOf('ScrCmd_fadeinbgm'),
        PNC = cmdIdOf('ScrCmd_pokenavcall'), MI = cmdIdOf('ScrCmd_messageinstant'),
        WH = cmdIdOf('ScrCmd_warphole'), SETVAR = cmdIdOf('ScrCmd_setvar'), END = cmdIdOf('ScrCmd_end');
  const VT1 = num('VAR_TEMP_1');
  // setmonmetlocation idx=0(u16 literal), location=88 → gPlayerParty[0].metLocation=88
  RunScriptImmediately({ buf: Uint8Array.from([SMML, 0, 0, 88, END]), off: 0 } as ScriptPtr);
  const metLoc = _GetMonData(gPlayerParty[0], _MON_DATA_MET_LOCATION) as number;
  // setmodernfatefulencounter idx=0(u16 literal) → gPlayerParty[0].modernFatefulEncounter=1
  RunScriptImmediately({ buf: Uint8Array.from([SMFE, 0, 0, END]), off: 0 } as ScriptPtr);
  const modern = _GetMonData(gPlayerParty[0], _MON_DATA_MODERN) as number;
  // warphole map(u16 = 1er MAP_ symbole) → pending warp 'fall'
  const mapSyms = getMapSymbols();
  let mapSymId = -1, mapConst = '';
  for (let id = 0; id < mapSyms.length; id++) { if (mapSyms[id] && mapSyms[id].startsWith('MAP_')) { mapSymId = id; mapConst = mapSyms[id]; break; } }
  RunScriptImmediately({ buf: Uint8Array.from([WH, lo(mapSymId), hi(mapSymId), END]), off: 0 } as ScriptPtr);
  const pw = getPendingWarp();
  const warpOk = !!pw && pw.warp.destMap === mapConst && pw.kind === 'fall';
  // alignement octets : enchaîner toute la chaîne + setvar marqueur 0xF00D
  VarSet(VT1, 0);
  RunScriptImmediately({ buf: Uint8Array.from([
    SMML, 0, 0, 0,
    SMFE, 0, 0,
    FOB, 0,
    FIB, 0,
    PNC, 0, 0, 0, 0,
    MI, 0, 0, 0, 0,
    SETVAR, lo(VT1), hi(VT1), lo(0xF00D), hi(0xF00D),
    END,
  ]), off: 0 } as ScriptPtr);
  const aligned = VarGet(VT1) === 0xF00D;
  const pass = metLoc === 88 && modern === 1 && warpOk && aligned;
  const details = { 'setmonmetlocation → metLocation(88)': metLoc, 'setmodernfatefulencounter → modern(1)': modern, [`warphole → pending '${mapConst}'`]: warpOk, 'alignement flux niche (setvar=0xF00D)': aligned };
  console.log(`[byte-vm] TEST long-tail 5 (niche) : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test LONG-TAIL 6 (batch MEDIUM voie A) : checkitemtype(ITEM_POKE_BALL)→POCKET_POKE_BALLS(2)
 *  + checkitemtype(ITEM_POTION)→POCKET_ITEMS(1) ; setrespawn(3)→respawnLocation HEAL_LOCATION_
 *  PETALBURG_CITY ; selectapproachingtrainer→gSelectedObjectEvent.index = getter(stub 0) ;
 *  ALIGNEMENT octets checkitemtype(2o)+setrespawn(2o)+selectapproachingtrainer(0o) via marqueur. */
export async function testLongTail6(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const CIT = cmdIdOf('ScrCmd_checkitemtype'), SR = cmdIdOf('ScrCmd_setrespawn'),
        SAT = cmdIdOf('ScrCmd_selectapproachingtrainer'), SETVAR = cmdIdOf('ScrCmd_setvar'), END = cmdIdOf('ScrCmd_end');
  const VR = num('VAR_RESULT'), VT1 = num('VAR_TEMP_1');
  const pokeBall = num('ITEM_POKE_BALL'), potion = num('ITEM_POTION');
  // checkitemtype ITEM_POKE_BALL (literal < VARS_START → VarGet renvoie l'id) → POCKET_POKE_BALLS=2
  VarSet(VR, 0);
  RunScriptImmediately({ buf: Uint8Array.from([CIT, lo(pokeBall), hi(pokeBall), END]), off: 0 } as ScriptPtr);
  const pocketBall = VarGet(VR);
  RunScriptImmediately({ buf: Uint8Array.from([CIT, lo(potion), hi(potion), END]), off: 0 } as ScriptPtr);
  const pocketPotion = VarGet(VR);
  // setrespawn id=3 (HEAL_LOCATION_PETALBURG_CITY = index 2 +1) → respawnLocation string
  RunScriptImmediately({ buf: Uint8Array.from([SR, 3, 0, END]), off: 0 } as ScriptPtr);
  const respawn = (gSaveBlock1Ptr as { respawnLocation?: string }).respawnLocation;
  // selectapproachingtrainer → gSelectedObjectEvent.index = GetCurrentApproachingTrainerObjectEventId() (stub 0)
  const sel = (globalThis as { __selBefore?: number }); void sel;
  RunScriptImmediately({ buf: Uint8Array.from([SAT, END]), off: 0 } as ScriptPtr);
  const selIdx = gSelectedObjectEvent.index;
  // alignement octets : checkitemtype(2o) + setrespawn(2o) + selectapproachingtrainer(0o) + setvar 0xBA11
  VarSet(VT1, 0);
  RunScriptImmediately({ buf: Uint8Array.from([
    CIT, lo(potion), hi(potion),
    SR, 3, 0,
    SAT,
    SETVAR, lo(VT1), hi(VT1), lo(0xBA11), hi(0xBA11),
    END,
  ]), off: 0 } as ScriptPtr);
  const aligned = VarGet(VT1) === 0xBA11;
  const pass = pocketBall === 2 && pocketPotion === 1 && respawn === 'HEAL_LOCATION_PETALBURG_CITY' && selIdx === 0 && aligned;
  const details = { 'checkitemtype POKE_BALL → POCKET_POKE_BALLS(2)': pocketBall, 'checkitemtype POTION → POCKET_ITEMS(1)': pocketPotion, 'setrespawn(3) → respawnLocation': respawn, 'selectapproachingtrainer → index(stub 0)': selIdx, 'alignement (setvar=0xBA11)': aligned };
  console.log(`[byte-vm] TEST long-tail 6 (MEDIUM voie A) : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test LONG-TAIL 7 (batch UI + Tier B) : adddecoration/checkdecorspace (voie A décoration,
 *  VAR_RESULT + save block) ; buffercontestname (STR_VAR_1) ; checkpcitem (stub 0) ; ALIGNEMENT
 *  octets de toute la file niche (decoration + checkpcitem + showcontestpainting + showmonpic +
 *  rotating-tile + contest stubs + warpteleport) via marqueur final. */
export async function testLongTail7(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const ADD = cmdIdOf('ScrCmd_adddecoration'), CDS = cmdIdOf('ScrCmd_checkdecorspace'),
        BCN = cmdIdOf('ScrCmd_buffercontestname'), CPI = cmdIdOf('ScrCmd_checkpcitem'),
        SCP = cmdIdOf('ScrCmd_showcontestpainting'), SMP = cmdIdOf('ScrCmd_showmonpic'),
        IRT = cmdIdOf('ScrCmd_initrotatingtilepuzzle'), TRT = cmdIdOf('ScrCmd_turnrotatingtileobjects'),
        CCM = cmdIdOf('ScrCmd_choosecontestmon'), WT = cmdIdOf('ScrCmd_warpteleport'),
        SETVAR = cmdIdOf('ScrCmd_setvar'), END = cmdIdOf('ScrCmd_end');
  const VR = num('VAR_RESULT'), VT1 = num('VAR_TEMP_1');
  // adddecoration decorId=77 (literal u16) → VAR_RESULT=1 + decorations contient 77
  VarSet(VR, 0);
  RunScriptImmediately({ buf: Uint8Array.from([ADD, 77, 0, END]), off: 0 } as ScriptPtr);
  const addRes = VarGet(VR);
  const hasDecor = ((gSaveBlock1Ptr as { decorations?: number[] }).decorations ?? []).includes(77);
  // checkdecorspace → VAR_RESULT=1 (place dispo)
  RunScriptImmediately({ buf: Uint8Array.from([CDS, 77, 0, END]), off: 0 } as ScriptPtr);
  const spaceRes = VarGet(VR);
  // buffercontestname idx=0, category=0 (literal) → STR_VAR_1 = 'SANG-FROID'
  RunScriptImmediately({ buf: Uint8Array.from([BCN, 0, 0, 0, END]), off: 0 } as ScriptPtr);
  const contestName = getStringVar(1);
  // checkpcitem item, qty → VAR_RESULT=0 (stub)
  VarSet(VR, 9);
  RunScriptImmediately({ buf: Uint8Array.from([CPI, 13, 0, 1, 0, END]), off: 0 } as ScriptPtr);
  const pcRes = VarGet(VR);
  // ALIGNEMENT : enchaîner toute la file niche + setvar marqueur 0xDEC0
  VarSet(VT1, 0);
  RunScriptImmediately({ buf: Uint8Array.from([
    ADD, 1, 0,            // adddecoration (halfword)
    CDS, 1, 0,            // checkdecorspace (halfword)
    CPI, 13, 0, 1, 0,     // checkpcitem (2 halfwords)
    SCP, 0,               // showcontestpainting (byte)
    SMP, 1, 0, 4, 4,      // showmonpic (halfword + 2 bytes)
    IRT, 0, 0,            // initrotatingtilepuzzle (halfword)
    TRT,                  // turnrotatingtileobjects (0 arg)
    CCM,                  // choosecontestmon (0 arg)
    WT, 0, 0, 0, 0, 0, 0, 0,   // warpteleport (warp layout : u16 map + u8 + u16 + u16 = 8o)
    SETVAR, lo(VT1), hi(VT1), lo(0xDEC0), hi(0xDEC0),
    END,
  ]), off: 0 } as ScriptPtr);
  const aligned = VarGet(VT1) === 0xDEC0;
  const pass = addRes === 1 && hasDecor && spaceRes === 1 && contestName === 'SANG-FROID' && pcRes === 0 && aligned;
  const details = { 'adddecoration(77)→VAR_RESULT(1)': addRes, 'decorations contient 77': hasDecor, 'checkdecorspace→1': spaceRes, 'buffercontestname→STR_VAR_1': contestName, 'checkpcitem→0': pcRes, 'alignement file niche (setvar=0xDEC0)': aligned };
  console.log(`[byte-vm] TEST long-tail 7 (UI+Tier B) : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Test POKEMART (déterministe) : le ptr produits est un OFFSET reloc → getLabelAtOffset doit
 *  retrouver le label exact (round-trip), et GetMartItemList(label) doit renvoyer la liste
 *  d'items (mart-lists.json). Prouve "par code" le fix offset→label du handler byte-VM. */
export async function testPokemart(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const label = 'OldaleTown_Mart_Pokemart_Basic';
  const off = getScriptOffset(label);
  const roundTrip = off !== undefined ? getLabelAtOffset(off) : undefined;
  const items = GetMartItemList(label);
  const pass = off !== undefined && roundTrip === label && items.length > 0;
  const details = { 'getScriptOffset': off, 'getLabelAtOffset round-trip': roundTrip, 'GetMartItemList count': items.length, 'items[0..2]': items.slice(0, 3) };
  console.log(`[byte-vm] TEST pokemart (offset→label) : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Lance un script par LABEL via le byte-VM (contexte global, supporte les waitstates :
 *  dialogue/menus). Le pump OW continue le tick. Vérifier ensuite screenshot/dialog. */
export function launchScript(label: string): string {
  const ptr = ptrFromLabel(label);
  if (!ptr) return `byte-VM : label '${label}' absent de l'image`;
  ScriptContext_SetupScript(ptr);
  ScriptContext_RunScript();
  return `byte-VM script '${label}' lancé`;
}

/** Lance un `special <index>` via le byte-VM (contexte global) — teste les flows special
 *  inline (ChooseStarter/wallclock/PC/regionmap/rematch/berry) routés via special_flows. */
export function launchSpecial(specialIndex: number): string {
  const SP = cmdIdOf('ScrCmd_special'), END = cmdIdOf('ScrCmd_end');
  ScriptContext_SetupScript({ buf: Uint8Array.from([SP, lo(specialIndex), hi(specialIndex), END]), off: 0 } as ScriptPtr);
  ScriptContext_RunScript();
  return `byte-VM special #${specialIndex} lancé`;
}

/** Lance un MULTICHOICE via le byte-VM (preuve visuelle) : spawn le menu vertical réel
 *  (ScriptMenu_Multichoice). Vérifier ensuite preview_screenshot (le menu doit apparaître). */
export function launchMultichoice(multichoiceId: number): string {
  LoadMessageBoxAndBorderGfx();   // précondition in-game (message/init charge la bordure std)
  const MC = cmdIdOf('ScrCmd_multichoice'), END = cmdIdOf('ScrCmd_end');
  // multichoice left=1 top=1 id ignoreBPress=0
  ScriptContext_SetupScript({ buf: Uint8Array.from([MC, 1, 1, multichoiceId & 0xFF, 0, END]), off: 0 } as ScriptPtr);
  ScriptContext_RunScript();
  return `byte-VM multichoice id ${multichoiceId} lancé (screenshot pour voir le menu)`;
}

/** Lance un YESNOBOX via le byte-VM (preuve visuelle) : spawn la fenêtre OUI/NON. */
export function launchYesNo(): string {
  LoadMessageBoxAndBorderGfx();   // précondition in-game
  const YN = cmdIdOf('ScrCmd_yesnobox'), END = cmdIdOf('ScrCmd_end');
  ScriptContext_SetupScript({ buf: Uint8Array.from([YN, 20, 8, END]), off: 0 } as ScriptPtr);
  ScriptContext_RunScript();
  return 'byte-VM yesnobox lancé (screenshot pour voir OUI/NON)';
}

/** Lance un POKEMART via le byte-VM (preuve visuelle) : trouve un symbole de mart dans
 *  l'image, exécute pokemart <ptr u32> → doPokemart ouvre le shop. */
export function launchPokemart(martLabel = 'OldaleTown_Mart_Pokemart_Basic'): string {
  const PM = cmdIdOf('ScrCmd_pokemart'), END = cmdIdOf('ScrCmd_end');
  // Le ptr produits = OFFSET (reloc) du label mart dans l'image (pas un symbole synthétique).
  const off = getScriptOffset(martLabel);
  if (off === undefined) return `byte-VM pokemart : label '${martLabel}' absent de l'image`;
  const w = (v: number) => [v & 0xFF, (v >> 8) & 0xFF, (v >> 16) & 0xFF, (v >>> 24) & 0xFF];
  ScriptContext_SetupScript({ buf: Uint8Array.from([PM, ...w(off), END]), off: 0 } as ScriptPtr);
  ScriptContext_RunScript();
  return `byte-VM pokemart '${martLabel}' (@${off}) lancé (screenshot pour voir le shop)`;
}

/** Test SETWILDBATTLE (STEP 1 déterministe) : setwildbattle species(u16) level(u8) item(u16)
 *  → CreateScriptedWildMon peuple gEnemyParty[0] (species + level corrects). NE boote PAS le
 *  combat (pas de dowildbattle, qui swappe CB2). */
export async function testWildbattle(): Promise<{ pass: boolean; details: Record<string, unknown> }> {
  await loadAndInstall();
  const SWB = cmdIdOf('ScrCmd_setwildbattle'), END = cmdIdOf('ScrCmd_end');
  const species = num('SPECIES_POOCHYENA'), level = 7;
  // setwildbattle species(u16) level(u8) item(u16=ITEM_NONE) ; end
  RunScriptImmediately({ buf: Uint8Array.from([SWB, lo(species), hi(species), level, 0, 0, END]), off: 0 } as ScriptPtr);
  const sp = _GetMonData(gEnemyParty[0], _MON_DATA_SPECIES) as number;
  const lv = _GetMonData(gEnemyParty[0], _MON_DATA_LEVEL) as number;
  const pass = sp === species && lv === level;
  const details = { [`gEnemyParty[0].species (attendu ${species})`]: sp, 'level (attendu 7)': lv };
  console.log(`[byte-vm] TEST wildbattle (setwildbattle) : ${pass ? '✅ PASS' : '❌ FAIL'}`, details);
  return { pass, details };
}

/** Lance un combat SAUVAGE via le BYTE-VM (setwildbattle + dowildbattle) — preuve visuelle
 *  STEP 2 : peuple gEnemyParty[0] puis boote la boucle combat. Vérifier battleState()+screenshot. */
export function launchWild(species: number, level: number): string {
  const SWB = cmdIdOf('ScrCmd_setwildbattle'), DWB = cmdIdOf('ScrCmd_dowildbattle'), END = cmdIdOf('ScrCmd_end');
  ScriptContext_SetupScript({ buf: Uint8Array.from([SWB, lo(species), hi(species), level, 0, 0, DWB, END]), off: 0 } as ScriptPtr);
  ScriptContext_RunScript();   // setwildbattle (pose gEnemyParty[0]) → dowildbattle → BattleSetup_StartScriptedWildBattle (async)
  return `byte-VM wild battle lancé : species ${species} Lv${level}`;
}

/** Lance un combat dresseur via le BYTE-VM dotrainerbattle (preuve visuelle STEP 2) :
 *  pose l'opponent, exécute `dotrainerbattle` dans un contexte byte-VM → DoTrainerBattle
 *  (async) lance le combat via l'OW. Vérifier ensuite battleState() + screenshot. */
export function launchTB(trainerId: number): string {
  setTrainerBattleOpponentA(trainerId);
  const DTB = cmdIdOf('ScrCmd_dotrainerbattle'), END = cmdIdOf('ScrCmd_end');
  ScriptContext_SetupScript({ buf: Uint8Array.from([DTB, END]), off: 0 } as ScriptPtr);
  ScriptContext_RunScript();   // dotrainerbattle → startTrainerBattleAndGetPoll → DoTrainerBattle (async)
  return `byte-VM dotrainerbattle lancé vs trainer ${trainerId}`;
}

/** Exécute un script de l'image par label (contexte immédiat) — debug A/B. */
export function run(label: string): boolean {
  if (!isByteVmLoaded()) { console.warn('[byte-vm] image non chargée (appelle __byteVm.load())'); return false; }
  return RunScriptImmediatelyByLabel(label);
}

// Expose pour la console / A/B.
(globalThis as Record<string, unknown>).__byteVm = { load: loadAndInstall, test, testSpecials, testDialogue, testNpc, testMovement, testWarp, testMoney, testItem, testMetatile, testObject, testBuffers, testPlayer, testWeather, testDoor, testFieldEffect, testVobject, testObjectMovement, testFade, testLongTail1, testLongTail2, testWarpVariants, testLongTail3, testLongTail4, testFlash, testGiveMon, testTrainerbattleArgs, testWildbattle, testLongTail5, testLongTail6, testLongTail7, testPokemart, battleState, diag, launchTB, launchWild, launchMultichoice, launchYesNo, launchPokemart, launchSpecial, launchScript, run, VarGet, getScriptOffset };
