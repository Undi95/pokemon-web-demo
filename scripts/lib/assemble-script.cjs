#!/usr/bin/env node
/**
 * lib/assemble-script.cjs — sérialiseur d'opcodes (byte-VM Phase 2/3).
 *
 * Transforme une liste d'OPCODES RÉELS (sortie de expand-composites) en octets,
 * via les `argLayout` du cmd-table. Archi (cf docs/BYTE-VM-PLAN.md) :
 *   - les scripts sont assemblés puis concaténés dans une IMAGE GLOBALE contiguë
 *     (préserve le fallthrough 1:1 : un script sans `end` tombe dans le suivant) ;
 *   - un pointeur `.4byte` vers un SCRIPT → RELOCATION (offset global du label,
 *     patché par le linker) = vrai offset, comme une adresse ROM ;
 *   - un pointeur `.4byte` vers une ressource externe irréplicable (texte/mouvement/
 *     mart/natif/RAM-global) → id de SYMBOLE synthétique (résolu au runtime par le
 *     handler : getText/getMovement/…) ;
 *   - `map` (2o) → id MapSymbols ; `stringvar` (1o) STR_VAR_*→0/1/2 ;
 *     `special` (2o) = id + waitstate conditionnel.
 *
 * Familles à layout variable (1:1 event.inc) : warp (formatwarp), trainerbattle
 * (byType), variants *AT (choix par arg `map`).
 *
 * API : assembleScript(realOps, env) -> { bytes:Uint8Array, relocs:[{pos,label}] }
 *   relocs = positions (dans le buffer du script) des pointeurs de script à patcher
 *            avec l'offset global du `label` cible.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const C = require('./decomp-constants.cjs');

const ROOT = path.join(__dirname, '..', '..');
const TABLE = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/decomp/em/script-cmd-table.json'), 'utf8'));
const SPECIALS = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/decomp/em/specials-table.json'), 'utf8'));
const OPCODES = TABLE.opcodes;

const WARP_FAMILY = new Set([
  'warp', 'warpsilent', 'warpdoor', 'warpteleport', 'setwarp', 'setdynamicwarp',
  'setdivewarp', 'setholewarp', 'setescapewarp', 'warpspinenter', 'warpmossdeepgym', 'warpwhitefade',
]);
const NATIVE_OPS = new Set(['callnative', 'gotonative']);

const u8 = (v) => [v & 0xFF];
const u16 = (v) => [v & 0xFF, (v >> 8) & 0xFF];
const u32 = (v) => [v & 0xFF, (v >> 8) & 0xFF, (v >> 16) & 0xFF, (v >>> 24) & 0xFF];

class SymbolTable {
  constructor() { this.byLabel = new Map(); this.list = []; }
  id(label, kind) {
    if (this.byLabel.has(label)) return this.byLabel.get(label);
    const id = this.list.length;
    this.list.push({ id, kind, label });
    this.byLabel.set(label, id);
    return id;
  }
}
class MapSymbols {
  constructor() { this.byName = new Map(); this.list = []; }
  id(mapConst) {
    if (this.byName.has(mapConst)) return this.byName.get(mapConst);
    const id = this.list.length;
    this.list.push({ id, mapConst });
    this.byName.set(mapConst, id);
    return id;
  }
}

/** env : classify(label)->kind ; isScript(label)->bool (label dans l'image globale) ;
 *  localIds : nom LOCALID_* -> numéro (par-map, mutable entre scripts). */
function makeEnv(classify, isScript, localIds) {
  const symbols = new SymbolTable();
  const mapSymbols = new MapSymbols();
  const env = {
    symbols, mapSymbols, classify, isScript, localIds,
    const(tok, ctx) {
      if (env.localIds && env.localIds[tok] !== undefined) return env.localIds[tok];
      const v = C.resolve(tok);
      if (v === undefined) throw new Error(`constante non résolue: '${tok}'${ctx ? ' @ ' + ctx : ''}`);
      return v;
    },
    sym(label, kind) { return symbols.id(label, kind || classify(label) || 'unknown'); },
    mapSym(mapConst) { return mapSymbols.id(mapConst); },
    special(name) { const e = SPECIALS.byName[name]; if (!e) throw new Error(`special inconnu: '${name}'`); return e; },
  };
  return env;
}

/** Émet un pointeur 4o dans `out` : valeur littérale, sinon reloc script, sinon symbole. */
function emitPtr(out, relocs, raw, env, opName) {
  const n = C.resolve(raw);
  if (n !== undefined) { out.push(...u32(n)); return; }               // valeur littérale/const
  if (NATIVE_OPS.has(opName)) { out.push(...u32(env.sym(raw, 'native'))); return; }
  if (env.isScript && env.isScript(raw)) {                            // pointeur de script -> reloc
    relocs.push({ pos: out.length, label: raw });
    out.push(0, 0, 0, 0);
    return;
  }
  out.push(...u32(env.sym(raw)));                                     // ressource externe -> symbole
}

/** Émet un opcode réel dans `out` (+ relocs). */
function emitOpcode(out, relocs, name, args, env) {
  const rec = OPCODES[name];
  if (!rec) throw new Error(`opcode réel inconnu: '${name}'`);

  if (WARP_FAMILY.has(name)) return emitWarp(out, rec, args, env);
  if (name === 'trainerbattle') return emitTrainerbattle(out, relocs, rec, args, env);

  let chosen = rec;
  if (rec.variants) {
    const provided = args.filter((a) => a !== undefined && a !== '').length;
    chosen = rec.variants.find((v) => v.args.length === provided)
      || rec.variants.reduce((a, b) => (b.args.length <= provided && b.args.length > a.args.length ? b : a), rec.variants[0]);
  }

  const defByName = Object.create(null);
  for (const p of (rec.params || [])) if (p.def !== undefined) defByName[p.name] = p.def;

  out.push(chosen.cmdId);
  let argIdx = 0;
  let appendWaitstate = false;

  for (const slot of chosen.args) {
    const isFixedLiteral = slot.fixed !== undefined && (slot.kind === 'u8' || slot.kind === 'u16' || slot.kind === 'u32');
    if (isFixedLiteral) { out.push(...byWidth(slot.width, env.const(slot.fixed, name))); continue; }

    let raw = args[argIdx];
    if ((raw === undefined || raw === '') && slot.name && defByName[slot.name] !== undefined) raw = defByName[slot.name];
    argIdx++;
    if (raw === undefined || raw === '') throw new Error(`arg manquant pour ${name}.${slot.name || '?'}`);

    switch (slot.kind) {
      case 'map': out.push(...u16(env.mapSym(raw))); break;
      case 'stringvar': out.push(...u8(stringvarId(raw, env))); break;
      case 'special': {
        const sp = env.special(raw); out.push(...u16(sp.id));
        if (rec.appendsWaitstate && sp.waitstate) appendWaitstate = true;
        break;
      }
      case 'u8': case 'u16': case 'u32':
        if (slot.width === 4) emitPtr(out, relocs, raw, env, name);
        else out.push(...byWidth(slot.width, env.const(raw, name)));
        break;
      default: throw new Error(`kind de slot inconnu: ${slot.kind} (${name})`);
    }
  }
  if (appendWaitstate) out.push(OPCODES['waitstate'].cmdId);
}

function byWidth(w, v) { return w === 1 ? u8(v) : w === 2 ? u16(v) : u32(v); }

function stringvarId(tok, env) {
  if (tok === 'STR_VAR_1') return 0;
  if (tok === 'STR_VAR_2') return 1;
  if (tok === 'STR_VAR_3') return 2;
  return env.const(tok, 'stringvar') & 0xFF;
}

/** formatwarp : map(2)+warpId(1)+x(2)+y(2). Pas de pointeur de script -> pas de reloc. */
function emitWarp(out, rec, args, env) {
  out.push(rec.cmdId);
  out.push(...u16(env.mapSym(args[0])));
  const extra = args.slice(1).filter((a) => a !== undefined && a !== '');
  const WARP_ID_NONE = C.resolve('WARP_ID_NONE');
  let warpId, x, y;
  if (extra.length === 0) { warpId = WARP_ID_NONE; x = -1; y = -1; }
  else if (extra.length === 1) { warpId = env.const(extra[0], 'warp'); x = -1; y = -1; }
  else if (extra.length === 2) { warpId = WARP_ID_NONE; x = env.const(extra[0], 'warp'); y = env.const(extra[1], 'warp'); }
  else { warpId = env.const(extra[0], 'warp'); x = env.const(extra[1], 'warp'); y = env.const(extra[2], 'warp'); }
  out.push(...u8(warpId), ...u16(x), ...u16(y));
}

/** trainerbattle : type(1)+trainer(2)+local_id(2)+N pointeurs (text OU script) selon le type. */
function emitTrainerbattle(out, relocs, rec, args, env) {
  out.push(rec.cmdId);
  const typeVal = env.const(args[0], 'trainerbattle.type');
  out.push(...u8(typeVal));
  out.push(...u16(env.const(args[1], 'trainerbattle.trainer')));
  out.push(...u16(env.const(args[2], 'trainerbattle.local_id')));
  let typeName = rec.byType[args[0]] ? args[0] : null;
  if (!typeName) for (const k of Object.keys(rec.byType)) if (C.resolve(k) === typeVal) { typeName = k; break; }
  const ptrs = (typeName && rec.byType[typeName]) || [];
  for (let i = 0; i < ptrs.length; i++) {
    const raw = args[3 + i];
    if (raw === undefined || raw === '') throw new Error(`trainerbattle: pointeur ${i} manquant (type ${typeName})`);
    emitPtr(out, relocs, raw, env, 'trainerbattle');   // text -> symbole, event script -> reloc
  }
}

/** Assemble une liste d'opcodes réels -> {bytes, relocs}. Lève sur toute irrésolution. */
function assembleScript(realOps, env) {
  const out = [];
  const relocs = [];
  for (const op of realOps) {
    if (op.name === '__raw') continue;
    emitOpcode(out, relocs, op.name, op.args, env);
  }
  return { bytes: Uint8Array.from(out), relocs };
}

module.exports = { assembleScript, emitOpcode, emitPtr, makeEnv, SymbolTable, MapSymbols, OPCODES, u8, u16, u32 };
