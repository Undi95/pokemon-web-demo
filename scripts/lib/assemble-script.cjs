#!/usr/bin/env node
/**
 * lib/assemble-script.cjs — sérialiseur d'opcodes (byte-VM Phase 2, dernière pièce).
 *
 * Transforme une liste d'OPCODES RÉELS (sortie de expand-composites) en octets,
 * via les `argLayout` du cmd-table. Archi (décidée, cf docs/BYTE-VM-PLAN.md) :
 *   - chaque script compile en son PROPRE buffer d'octets,
 *   - les pointeurs `.4byte` (goto/call/message/applymovement/pokemart/callnative…)
 *     deviennent des IDs SYNTHÉTIQUES u32 dans un registre `SymbolTable`
 *     (id -> {kind:'script'|'text'|'movement'|'mart'|'native', label}),
 *   - les références de map (2o) -> id u16 dans `MapSymbols` (id -> mapName/MAP_*),
 *   ⇒ VM byte-fidèle (ScriptRead* lit de vrais octets) compatible identité STRING.
 *
 * Familles à layout variable (gérées à part, 1:1 event.inc) :
 *   - warp & co (formatwarp) : map(2) + warpId(1) + x(2) + y(2), valeurs selon nb d'args,
 *   - trainerbattle : type/trainer/local_id + N pointeurs selon TRAINER_BATTLE_*,
 *   - variants *AT (applymovement/waitmovement/addobject/removeobject) : choix par arg `map`,
 *   - special/specialvar : id(2) + waitstate conditionnel.
 *
 * API : assembleScript(realOps, env) -> Uint8Array, où env fournit const/sym/mapSym/special.
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

// ── helpers octets little-endian ─────────────────────────────────────────────
const u8 = (v) => [v & 0xFF];
const u16 = (v) => [v & 0xFF, (v >> 8) & 0xFF];
const u32 = (v) => [v & 0xFF, (v >> 8) & 0xFF, (v >> 16) & 0xFF, (v >>> 24) & 0xFF];

/** SymbolTable : alloue des ids u32 stables pour (label) avec un kind. */
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

/** Construit l'environnement de sérialisation pour une map. classify(label)->kind.
 *  localIds : Map nom LOCALID_* -> numéro (1-basé), spécifique à la map courante. */
function makeEnv(classify, localIds) {
  const symbols = new SymbolTable();
  const mapSymbols = new MapSymbols();
  return {
    symbols, mapSymbols, classify, localIds,
    const(tok, ctx) {
      if (localIds && localIds[tok] !== undefined) return localIds[tok];
      const v = C.resolve(tok);
      if (v === undefined) throw new Error(`constante non résolue: '${tok}'${ctx ? ' @ ' + ctx : ''}`);
      return v;
    },
    sym(label, kindHint) {
      const kind = kindHint || classify(label) || 'script';
      return symbols.id(label, kind);
    },
    mapSym(mapConst) { return mapSymbols.id(mapConst); },
    special(name) {
      const e = SPECIALS.byName[name];
      if (!e) throw new Error(`special inconnu: '${name}'`);
      return e;
    },
  };
}

/** Émet un opcode réel -> tableau d'octets. */
function emitOpcode(name, args, env) {
  const rec = OPCODES[name];
  if (!rec) throw new Error(`opcode réel inconnu: '${name}'`);

  if (WARP_FAMILY.has(name)) return emitWarp(rec, args, env);
  if (name === 'trainerbattle') return emitTrainerbattle(rec, args, env);

  // variant *AT : choisir par nombre d'args fournis
  let chosen = rec;
  if (rec.variants) {
    const provided = args.filter((a) => a !== undefined && a !== '').length;
    chosen = rec.variants.find((v) => v.args.length === provided)
      || rec.variants.reduce((a, b) => (b.args.length <= provided && b.args.length > a.args.length ? b : a), rec.variants[0]);
  }

  const params = rec.params || [];
  const defByName = Object.create(null);
  for (const p of params) if (p.def !== undefined) defByName[p.name] = p.def;

  const bytes = [chosen.cmdId];
  let argIdx = 0;
  let appendWaitstate = false;

  for (const slot of chosen.args) {
    const isFixedLiteral = slot.fixed !== undefined && (slot.kind === 'u8' || slot.kind === 'u16' || slot.kind === 'u32');
    if (isFixedLiteral) {
      const v = env.const(slot.fixed, name);
      bytes.push(...byWidth(slot.width, v));
      continue;
    }
    // slot consommant un arg
    let raw = args[argIdx];
    if ((raw === undefined || raw === '') && slot.name && defByName[slot.name] !== undefined) raw = defByName[slot.name];
    argIdx++;
    if (raw === undefined || raw === '') throw new Error(`arg manquant pour ${name}.${slot.name || '?'}`);

    switch (slot.kind) {
      case 'map':
        bytes.push(...u16(env.mapSym(raw)));
        break;
      case 'stringvar':
        bytes.push(...u8(stringvarId(raw, env)));
        break;
      case 'special': {
        const sp = env.special(raw);
        bytes.push(...u16(sp.id));
        if (rec.appendsWaitstate && sp.waitstate) appendWaitstate = true;
        break;
      }
      case 'u8': case 'u16': case 'u32': {
        if (slot.width === 4) {
          const n = C.resolve(raw);
          if (n !== undefined) bytes.push(...u32(n));                     // valeur littérale/const
          else bytes.push(...u32(env.sym(raw, NATIVE_OPS.has(name) ? 'native' : undefined))); // pointeur
        } else {
          bytes.push(...byWidth(slot.width, env.const(raw, name)));
        }
        break;
      }
      default:
        throw new Error(`kind de slot inconnu: ${slot.kind} (${name})`);
    }
  }
  if (appendWaitstate) bytes.push(OPCODES['waitstate'].cmdId);
  return bytes;
}

function byWidth(w, v) { return w === 1 ? u8(v) : w === 2 ? u16(v) : u32(v); }

/** STR_VAR_1/2/3 -> 0/1/2 ; sinon valeur littérale (1:1 macro stringvar). */
function stringvarId(tok, env) {
  if (tok === 'STR_VAR_1') return 0;
  if (tok === 'STR_VAR_2') return 1;
  if (tok === 'STR_VAR_3') return 2;
  return env.const(tok, 'stringvar') & 0xFF;
}

/** formatwarp : map(2) + warpId(1) + x(2) + y(2) — valeurs selon le nb d'args. */
function emitWarp(rec, args, env) {
  const bytes = [rec.cmdId];
  bytes.push(...u16(env.mapSym(args[0])));
  const extra = args.slice(1).filter((a) => a !== undefined && a !== '');
  const WARP_ID_NONE = C.resolve('WARP_ID_NONE');
  let warpId, x, y;
  if (extra.length === 0) { warpId = WARP_ID_NONE; x = -1; y = -1; }
  else if (extra.length === 1) { warpId = env.const(extra[0], 'warp'); x = -1; y = -1; }
  else if (extra.length === 2) { warpId = WARP_ID_NONE; x = env.const(extra[0], 'warp'); y = env.const(extra[1], 'warp'); }
  else { warpId = env.const(extra[0], 'warp'); x = env.const(extra[1], 'warp'); y = env.const(extra[2], 'warp'); }
  bytes.push(...u8(warpId), ...u16(x), ...u16(y));
  return bytes;
}

/** trainerbattle : type(1) + trainer(2) + local_id(2) + N pointeurs selon le type. */
function emitTrainerbattle(rec, args, env) {
  const bytes = [rec.cmdId];
  const typeVal = env.const(args[0], 'trainerbattle.type');
  bytes.push(...u8(typeVal));
  bytes.push(...u16(env.const(args[1], 'trainerbattle.trainer')));
  bytes.push(...u16(env.const(args[2], 'trainerbattle.local_id')));
  // nom du type pour choisir la liste de pointeurs
  let typeName = rec.byType[args[0]] ? args[0] : null;
  if (!typeName) for (const k of Object.keys(rec.byType)) if (C.resolve(k) === typeVal) { typeName = k; break; }
  const ptrs = (typeName && rec.byType[typeName]) || [];
  for (let i = 0; i < ptrs.length; i++) {
    const raw = args[3 + i];
    if (raw === undefined || raw === '') throw new Error(`trainerbattle: pointeur ${i} manquant (type ${typeName})`);
    const n = C.resolve(raw);
    bytes.push(...(n !== undefined ? u32(n) : u32(env.sym(raw))));
  }
  return bytes;
}

/** Assemble une liste d'opcodes réels -> Uint8Array. Lève sur toute irrésolution. */
function assembleScript(realOps, env) {
  const out = [];
  for (const op of realOps) {
    if (op.name === '__raw') continue;   // données brutes (pokemartlistend) — non rencontré en script
    for (const b of emitOpcode(op.name, op.args, env)) out.push(b);
  }
  return Uint8Array.from(out);
}

module.exports = { assembleScript, emitOpcode, makeEnv, SymbolTable, MapSymbols, OPCODES };
