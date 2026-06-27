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
  getSymbols, getMapSymbols, ScriptContext_SetupScript, ScriptContext_RunScript,
} from '../../src/script_bytevm';
import type { ScriptPtr } from '../../src/script_bytevm';
import { setPendingWarp, getPendingWarp } from '../../src/engine/field/warp-system';
import { GetMoney, AddMoney, RemoveMoney } from '../../src/money';
import { CheckBagHasItem, RemoveBagItem } from '../../src/engine/bag/bag';
import { MapGridGetMetatileIdAt, MapGridSetMetatileIdAt, MAP_OFFSET } from '../../src/fieldmap';
import { installByteVmHandlers, setSpecialNames } from '../../src/scrcmd_bytevm';
import { registerSpecial } from '../../src/scrcmd';
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
import { GetSavedWeather, SetSavedWeather } from '../../src/field_weather_effect';
import { WEATHER_RAIN, WEATHER_SUNNY } from '../../include/constants/weather';
import { MapGridGetMetatileBehaviorAt } from '../../src/fieldmap';
import { MB_ANIMATED_DOOR } from '../../src/engine/field/tilemap-loader';
import { isDoorAnimationStopped } from '../../src/scrcmd_door';

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

/** Exécute un script de l'image par label (contexte immédiat) — debug A/B. */
export function run(label: string): boolean {
  if (!isByteVmLoaded()) { console.warn('[byte-vm] image non chargée (appelle __byteVm.load())'); return false; }
  return RunScriptImmediatelyByLabel(label);
}

// Expose pour la console / A/B.
(globalThis as Record<string, unknown>).__byteVm = { load: loadAndInstall, test, testSpecials, testDialogue, testNpc, testMovement, testWarp, testMoney, testItem, testMetatile, testObject, testBuffers, testPlayer, testWeather, testDoor, testFieldEffect, run, VarGet, getScriptOffset };
