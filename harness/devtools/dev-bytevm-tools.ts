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
  getSymbols, ScriptContext_SetupScript, ScriptContext_RunScript,
} from '../../src/script_bytevm';
import type { ScriptPtr } from '../../src/script_bytevm';
import { installByteVmHandlers, setSpecialNames } from '../../src/scrcmd_bytevm';
import { registerSpecial } from '../../src/scrcmd';
import { getText, loadMapScripts } from '../../src/script';
import { IsFieldMessageBoxHidden, HideFieldMessageBox } from '../../src/field_message_box';
import { VarGet, VarSet, FlagSet, FlagClear } from '../../src/event_data';
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

/** Exécute un script de l'image par label (contexte immédiat) — debug A/B. */
export function run(label: string): boolean {
  if (!isByteVmLoaded()) { console.warn('[byte-vm] image non chargée (appelle __byteVm.load())'); return false; }
  return RunScriptImmediatelyByLabel(label);
}

// Expose pour la console / A/B.
(globalThis as Record<string, unknown>).__byteVm = { load: loadAndInstall, test, testSpecials, testDialogue, run, VarGet, getScriptOffset };
