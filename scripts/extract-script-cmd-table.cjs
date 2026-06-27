#!/usr/bin/env node
/**
 * extract-script-cmd-table.cjs — FONDATION du byte-VM (Phase 1).
 *
 * Parse les 2 sources canoniques de la décomp pour produire la table de commandes
 * du moteur de script bytecode 1:1 :
 *   1. data/script_cmd_table.inc  → SCR_OP_* → cmdId (ordre enum, 0x00..0xE2)
 *   2. asm/macros/event.inc       → macro → layout d'octets des arguments
 *
 * Sortie : public/decomp/em/script-cmd-table.json
 *   {
 *     meta:    { counts... },
 *     enum:    [ { op, cmdId, handler }, ... ]              // 227 entrées ordonnées
 *     opcodes: { <macroName>: { op, cmdId, handler, args:[{name,width,kind,fixed?}],
 *                               totalBytes, appendsWaitstate?, variants?, byType? }, ... }
 *     composites: { <macroName>: { params:[...], body:[lines] } }   // macros sans cmd-byte
 *   }
 *
 * "kind" d'un slot d'argument :
 *   u8 / u16 / u32   → .byte / .2byte / .4byte (valeur ou pointeur ; voir name pour le rôle)
 *   map              → 2 octets séquentiels (group, num) émis par la macro `map`
 *   stringvar        → 1 octet (index STR_VAR_*) émis par la macro `stringvar`
 *   special          → 2 octets = SPECIAL_<fn> (id du special, voir data/specials.inc)
 *
 * Le but : un fichier dont le compilateur (Phase 2) ET le byte VM (Phase 3) tirent
 * la vérité — combien d'octets lire/écrire par opcode, et dans quel ordre.
 *
 * Outil de build (non 1:1) — déterministe, ré-exécutable.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const CMD_TABLE_INC = path.join(DECOMP, 'data/script_cmd_table.inc');
const EVENT_INC = path.join(DECOMP, 'asm/macros/event.inc');
const OUT = path.join(__dirname, '..', 'public/decomp/em/script-cmd-table.json');

// Fichiers de macros à parser. event.inc = source des opcodes réels (.byte SCR_OP_*).
// Les autres ne définissent QUE des composites (frontier/trainer hill) qui s'expandent
// vers des opcodes event.inc (setvar + special CallFrontierUtilFunc, etc.). Utilisés
// dans les maps Battle Frontier / Battle Tent / Trainer Hill.
const MACRO_FILES = [
  EVENT_INC,
  path.join(DECOMP, 'asm/macros/battle_frontier/frontier_util.inc'),
  path.join(DECOMP, 'asm/macros/battle_frontier/apprentice.inc'),
  path.join(DECOMP, 'asm/macros/battle_frontier/battle_arena.inc'),
  path.join(DECOMP, 'asm/macros/battle_frontier/battle_dome.inc'),
  path.join(DECOMP, 'asm/macros/battle_frontier/battle_factory.inc'),
  path.join(DECOMP, 'asm/macros/battle_frontier/battle_palace.inc'),
  path.join(DECOMP, 'asm/macros/battle_frontier/battle_pike.inc'),
  path.join(DECOMP, 'asm/macros/battle_frontier/battle_pyramid.inc'),
  path.join(DECOMP, 'asm/macros/battle_frontier/battle_tower.inc'),
  path.join(DECOMP, 'asm/macros/battle_tent.inc'),
  path.join(DECOMP, 'asm/macros/trainer_hill.inc'),
];

// ─────────────────────────────────────────────────────────────────────────────
// PASS 1 — script_cmd_table.inc : SCR_OP_* → cmdId (ordre enum)
// ─────────────────────────────────────────────────────────────────────────────
function parseCmdTable() {
  const txt = fs.readFileSync(CMD_TABLE_INC, 'utf8');
  const lines = txt.split(/\r?\n/);
  const entries = [];        // { op, handler, cmdId, declaredHex }
  const opToId = new Map();
  const re = /^\s*script_cmd_table_entry\s+(SCR_OP_\w+)\s+(\w+)\s*@\s*0x([0-9a-fA-F]+)/;
  for (const line of lines) {
    const m = line.match(re);
    if (!m) continue;
    const op = m[1];
    const handler = m[2];
    const declaredHex = parseInt(m[3], 16);
    const cmdId = entries.length;       // enum order = position
    if (cmdId !== declaredHex) {
      throw new Error(`cmdId mismatch: ${op} position=${cmdId} but comment says 0x${m[3]}`);
    }
    opToId.set(op, cmdId);
    entries.push({ op, handler, cmdId, declaredHex });
  }
  return { entries, opToId };
}

// ─────────────────────────────────────────────────────────────────────────────
// PASS 2 — event.inc : extraire chaque .macro … .endm
// ─────────────────────────────────────────────────────────────────────────────
/** Découpe un fichier .inc en blocs de macro. Retourne [{name, params, body, srcFile}]. */
function parseMacrosFile(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const lines = txt.split(/\r?\n/);
  const macros = [];
  let cur = null;
  const short = path.basename(file);
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const code = stripComment(raw);
    const mStart = code.match(/^\s*\.macro\s+(\w+)\s*(.*)$/);
    if (mStart && !cur) {
      cur = { name: mStart[1], params: parseParams(mStart[2]), body: [], line: i + 1, srcFile: short };
      continue;
    }
    if (/^\s*\.endm\b/.test(code) && cur) {
      macros.push(cur);
      cur = null;
      continue;
    }
    if (cur) cur.body.push(raw);
  }
  return macros;
}

/** Concatène les macros de tous les MACRO_FILES (event.inc en tête). Détecte les doublons. */
function parseMacros() {
  const all = [];
  const seen = new Map();
  for (const f of MACRO_FILES) {
    for (const m of parseMacrosFile(f)) {
      if (seen.has(m.name)) console.warn(`⚠️  macro dupliquée: ${m.name} (${seen.get(m.name)} + ${m.srcFile})`);
      else seen.set(m.name, m.srcFile);
      all.push(m);
    }
  }
  return all;
}

/** Retire un commentaire `@ …` (hors chaîne — il n'y a pas de chaîne ici). */
function stripComment(line) {
  const at = line.indexOf('@');
  return at === -1 ? line : line.slice(0, at);
}

/** "destination:req, value:req, warn=TRUE" → [{name:'destination'}, {name:'value'}, {name:'warn',def:'TRUE'}]. */
function parseParams(s) {
  s = s.trim();
  if (!s) return [];
  return s.split(',').map((p) => {
    p = p.trim();
    let def = undefined;
    const eq = p.indexOf('=');
    if (eq !== -1) { def = p.slice(eq + 1).trim(); p = p.slice(0, eq).trim(); }
    p = p.replace(/:req$/, '').trim();
    return def === undefined ? { name: p } : { name: p, def };
  }).filter((x) => x.name);
}

// ─────────────────────────────────────────────────────────────────────────────
// Analyse du corps d'une macro
// ─────────────────────────────────────────────────────────────────────────────

/** Une ligne de corps → directive structurée, ou null si vide/commentaire/contrôle inerte. */
function parseDirective(rawLine) {
  const code = stripComment(rawLine).trim();
  if (code === '') return null;
  // Directives de contrôle / inertes (n'émettent aucun octet de données).
  if (/^\.(warning|error|set|align|global|ifndef|ifdef|endif|else|elseif|if|ifb|ifnb|ifc|ifeq|ifne|purgem)\b/.test(code)) {
    return { kind: 'control', code };
  }
  let m;
  if ((m = code.match(/^\.byte\s+(.+)$/)))  return { kind: 'emit', dir: 'byte',  width: 1, arg: m[1].trim() };
  if ((m = code.match(/^\.2byte\s+(.+)$/))) return { kind: 'emit', dir: '2byte', width: 2, arg: m[1].trim() };
  if ((m = code.match(/^\.4byte\s+(.+)$/))) return { kind: 'emit', dir: '4byte', width: 4, arg: m[1].trim() };
  // Sous-émetteurs (autres macros qui produisent des octets).
  if ((m = code.match(/^map\s+(.+)$/)))        return { kind: 'call', sub: 'map', arg: m[1].trim() };
  if ((m = code.match(/^formatwarp\b\s*(.*)$/))) return { kind: 'call', sub: 'formatwarp', arg: m[1].trim() };
  if ((m = code.match(/^stringvar\s+(.+)$/)))  return { kind: 'call', sub: 'stringvar', arg: m[1].trim() };
  if (/^waitstate\b/.test(code))               return { kind: 'call', sub: 'waitstate' };
  return { kind: 'unknown', code };
}

/** arg "\foo" → 'foo' (param ref), sinon retourne tel quel (littéral/const). */
function refName(arg) {
  const m = arg.match(/^\\(\w+)$/);
  return m ? m[1] : null;
}

/** Construit un slot d'argument à partir d'une directive .byte/.2byte/.4byte. */
function slotFromEmit(d) {
  const ref = refName(d.arg);
  const width = d.width;
  let kind = width === 1 ? 'u8' : width === 2 ? 'u16' : 'u32';
  // SPECIAL_<fn> dans un .2byte → id de special.
  if (width === 2 && /^SPECIAL_/.test(d.arg)) kind = 'special';
  const slot = { width, kind };
  if (ref) slot.name = ref;
  else slot.fixed = d.arg;          // littéral / constante (ex: showplayer `.byte 0`)
  return slot;
}

/** Expansion d'un sous-émetteur en slots. */
function slotsFromCall(d) {
  switch (d.sub) {
    case 'map':
      return [{ width: 2, kind: 'map', name: refName(d.arg) || d.arg }];   // 2 octets: group, num
    case 'stringvar':
      return [{ width: 1, kind: 'stringvar', name: refName(d.arg) || d.arg }];
    case 'formatwarp':
      // map \map ; .byte warpId ; .2byte x ; .2byte y  (cf. event.inc formatwarp)
      return [
        { width: 2, kind: 'map', name: 'map' },
        { width: 1, kind: 'u8', name: 'warpId' },
        { width: 2, kind: 'u16', name: 'x' },
        { width: 2, kind: 'u16', name: 'y' },
      ];
    case 'waitstate':
      return [];   // géré à part (appendsWaitstate)
    default:
      throw new Error(`sous-émetteur inconnu: ${d.sub}`);
  }
}

/** Corps STRAIGHT-LINE (sans .if) → {op, args, appendsWaitstate, unknown[]}. */
function analyzeStraightLine(macro, dirs) {
  let op = null;
  const args = [];
  let appendsWaitstate = false;
  const unknown = [];
  for (const d of dirs) {
    if (d.kind === 'control') continue;
    if (d.kind === 'unknown') { unknown.push(d.code); continue; }
    if (d.kind === 'emit') {
      // Le 1er .byte SCR_OP_* = l'octet de commande.
      if (op === null && d.dir === 'byte' && /^SCR_OP_/.test(d.arg)) { op = d.arg.trim(); continue; }
      args.push(slotFromEmit(d));
      continue;
    }
    if (d.kind === 'call') {
      if (d.sub === 'waitstate') { appendsWaitstate = true; continue; }
      for (const s of slotsFromCall(d)) args.push(s);
      continue;
    }
  }
  return { op, args, appendsWaitstate, unknown };
}

/** Split d'un corps avec UN bloc conditionnel de premier niveau `.ifb \X / .else / .endif`. */
function splitIfb(dirsRaw) {
  // dirsRaw = lignes brutes du corps. On travaille au niveau texte pour les .ifb.
  const trueLines = [], falseLines = [], prefix = [];
  let state = 'prefix';
  let ifbVar = null;
  for (const raw of dirsRaw) {
    const code = stripComment(raw).trim();
    let m;
    if ((m = code.match(/^\.ifb\s+\\(\w+)/)) && state === 'prefix') { state = 'true'; ifbVar = m[1]; continue; }
    if (/^\.else\b/.test(code) && state === 'true') { state = 'false'; continue; }
    if (/^\.endif\b/.test(code) && (state === 'true' || state === 'false')) { state = 'done'; continue; }
    if (state === 'prefix') prefix.push(raw);
    else if (state === 'true') trueLines.push(raw);
    else if (state === 'false') falseLines.push(raw);
    else prefix.push(raw); // après endif
  }
  return { ifbVar, prefix, trueLines, falseLines };
}

/** trainerbattle : préfixe fixe + pointeurs variables par TRAINER_BATTLE_*. */
function analyzeTrainerbattle(macro) {
  // Préfixe : .byte SCR_OP_TRAINERBATTLE / .byte type / .2byte trainer / .2byte local_id
  const args = [
    { width: 1, kind: 'u8', name: 'type' },
    { width: 2, kind: 'u16', name: 'trainer' },
    { width: 2, kind: 'u16', name: 'local_id' },
  ];
  // Parse les branches .if \type == X … (chacune une suite de .4byte pointeurs)
  const byType = {};
  let curType = null;
  for (const raw of macro.body) {
    const code = stripComment(raw).trim();
    let m;
    if ((m = code.match(/^\.(?:if|elseif)\s+\\type\s*==\s*(\w+)/))) { curType = m[1]; byType[curType] = []; continue; }
    if (/^\.endif\b/.test(code)) { curType = null; continue; }
    if (curType && (m = code.match(/^\.4byte\s+\\(\w+)/))) byType[curType].push(m[1]);
  }
  return { op: 'SCR_OP_TRAINERBATTLE', args, byType };
}

// ─────────────────────────────────────────────────────────────────────────────
// Driver
// ─────────────────────────────────────────────────────────────────────────────
function main() {
  const { entries, opToId } = parseCmdTable();
  const macros = parseMacros();

  const opcodes = {};
  const composites = {};
  const flagged = [];        // macros réelles avec directive inconnue
  const emittersByOp = new Map(); // SCR_OP → [macroNames]

  const VARIANT_MACROS = new Set(['applymovement', 'waitmovement', 'removeobject', 'addobject']);

  function recordEmitter(op, name) {
    if (!emittersByOp.has(op)) emittersByOp.set(op, []);
    emittersByOp.get(op).push(name);
  }
  function resolveId(op, macroName) {
    if (!opToId.has(op)) throw new Error(`SCR_OP introuvable dans la cmd-table: ${op} (macro ${macroName})`);
    return opToId.get(op);
  }
  function handlerOf(op) {
    const e = entries.find((x) => x.op === op);
    return e ? e.handler : null;
  }

  for (const macro of macros) {
    const dirs = macro.body.map(parseDirective).filter(Boolean);
    const hasCmdByte = dirs.some((d) => d.kind === 'emit' && d.dir === 'byte' && /^SCR_OP_/.test(d.arg));
    const hasConditional = macro.body.some((l) => /^\s*\.(if|ifb|ifnb|ifc|elseif)\b/.test(stripComment(l)));

    if (!hasCmdByte) {
      // Composite / helper : pas d'octet de commande propre → on garde le corps brut.
      composites[macro.name] = {
        src: macro.srcFile,
        params: macro.params,
        body: macro.body.map((l) => l.replace(/\t/g, '    ').replace(/\s+$/, '')).filter((l) => l.trim() !== ''),
      };
      continue;
    }

    // ── trainerbattle (layout variable par type) ──
    if (macro.name === 'trainerbattle') {
      const tb = analyzeTrainerbattle(macro);
      const cmdId = resolveId(tb.op, macro.name);
      opcodes[macro.name] = { op: tb.op, cmdId, handler: handlerOf(tb.op), params: macro.params, args: tb.args, byType: tb.byType };
      recordEmitter(tb.op, macro.name);
      continue;
    }

    // ── variants *AT (map optionnel) ──
    if (VARIANT_MACROS.has(macro.name) && hasConditional) {
      const { ifbVar, prefix, trueLines, falseLines } = splitIfb(macro.body);
      const aTrue = analyzeStraightLine(macro, [...prefix, ...trueLines].map(parseDirective).filter(Boolean));
      const aFalse = analyzeStraightLine(macro, [...prefix, ...falseLines].map(parseDirective).filter(Boolean));
      // trueLines = branche `.ifb \map` (map ABSENT) ; falseLines = `.else` (map présent).
      const variants = [
        { when: `${ifbVar}_absent`, op: aTrue.op, cmdId: resolveId(aTrue.op, macro.name), handler: handlerOf(aTrue.op),
          args: aTrue.args, totalBytes: totalBytes(aTrue.args) },
        { when: `${ifbVar}_present`, op: aFalse.op, cmdId: resolveId(aFalse.op, macro.name), handler: handlerOf(aFalse.op),
          args: aFalse.args, totalBytes: totalBytes(aFalse.args) },
      ];
      opcodes[macro.name] = { selectedBy: ifbVar, params: macro.params, variants };
      recordEmitter(aTrue.op, macro.name);
      recordEmitter(aFalse.op, macro.name);
      const unk = [...aTrue.unknown, ...aFalse.unknown];
      if (unk.length) flagged.push({ macro: macro.name, unknown: unk });
      continue;
    }

    // ── cas général (straight-line ; les .if inertes type warn/special sont ignorés) ──
    const a = analyzeStraightLine(macro, dirs);
    if (!a.op) { flagged.push({ macro: macro.name, error: 'aucun SCR_OP détecté' }); continue; }
    const cmdId = resolveId(a.op, macro.name);
    const rec = { op: a.op, cmdId, handler: handlerOf(a.op), params: macro.params, args: a.args, totalBytes: totalBytes(a.args) };
    if (a.appendsWaitstate) rec.appendsWaitstate = true;
    opcodes[macro.name] = rec;
    recordEmitter(a.op, macro.name);
    if (a.unknown.length) flagged.push({ macro: macro.name, unknown: a.unknown });
  }

  // ── Validation : chaque cmdId est-il couvert par ≥1 macro émettrice ? ──
  const uncovered = entries.filter((e) => !emittersByOp.has(e.op)).map((e) => `${e.op} (0x${e.cmdId.toString(16)})`);

  const out = {
    meta: {
      note: 'Généré par scripts/extract-script-cmd-table.cjs — FONDATION byte-VM (Phase 1). NE PAS éditer à la main.',
      cmdTableEntries: entries.length,
      realOpcodes: Object.keys(opcodes).length,
      composites: Object.keys(composites).length,
    },
    enum: entries.map((e) => ({ op: e.op, cmdId: e.cmdId, handler: e.handler })),
    opcodes,
    composites,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');

  // ── Rapport ──
  console.log(`=== extract-script-cmd-table ===`);
  console.log(`cmd-table entries : ${entries.length}  (0x00..0x${(entries.length - 1).toString(16)})`);
  console.log(`real opcodes      : ${Object.keys(opcodes).length}`);
  console.log(`composites/helpers: ${Object.keys(composites).length}`);
  console.log(`écrit             : ${path.relative(path.join(__dirname, '..'), OUT)}`);
  if (uncovered.length) {
    console.log(`\n⚠️  cmdId NON couverts par une macro émettrice (${uncovered.length}) :`);
    for (const u of uncovered) console.log(`   - ${u}`);
  } else {
    console.log(`\n✅ Tous les ${entries.length} cmdId sont couverts par ≥1 macro.`);
  }
  if (flagged.length) {
    console.log(`\n⚠️  macros avec directive inconnue / problème (${flagged.length}) :`);
    for (const f of flagged) console.log(`   - ${f.macro}: ${JSON.stringify(f.unknown || f.error)}`);
  } else {
    console.log(`✅ Aucune directive inconnue dans les opcodes réels.`);
  }
}

function totalBytes(args) {
  return args.reduce((n, s) => n + (s.width || 0), 0);
}

main();
