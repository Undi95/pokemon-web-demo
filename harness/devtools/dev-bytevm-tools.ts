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
import { installByteVmHandlers, setSpecialNames } from '../../src/scrcmd_bytevm';
import { registerSpecial } from '../../src/scrcmd';
import { getText, loadMapScripts } from '../../src/script';
import { IsFieldMessageBoxHidden, HideFieldMessageBox } from '../../src/field_message_box';
import { VarGet, VarSet, FlagSet, FlagClear } from '../../src/event_data';
import { isMovementDone } from '../../src/engine/field/movement-system';
import { gObjectEvents } from '../../src/event_object_movement';
import { gPlayerAvatar } from '../../src/field_player_avatar';
import { resolveDecompConstant } from '../runtime/decomp-constants';

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

/** Exécute un script de l'image par label (contexte immédiat) — debug A/B. */
export function run(label: string): boolean {
  if (!isByteVmLoaded()) { console.warn('[byte-vm] image non chargée (appelle __byteVm.load())'); return false; }
  return RunScriptImmediatelyByLabel(label);
}

// Expose pour la console / A/B.
(globalThis as Record<string, unknown>).__byteVm = { load: loadAndInstall, test, testSpecials, testDialogue, testNpc, testMovement, testWarp, testMoney, run, VarGet, getScriptOffset };
