#!/usr/bin/env node
'use strict';
/*
 * decomp-index.cjs — LA CARTE COMPLÈTE décomp × port (index exhaustif requêtable).
 *
 * Recense TOUS les symboles de la décomp (fonctions, #defines, membres d'enums,
 * struct/union/typedef, globals, labels asm data/ & sound/) avec fichier:ligne,
 * et croise CHAQUE symbole avec le port TS (src/ + harness/ + include/) :
 * déclaré (où), référencé (dont __wireTodo), ou absent. Les symboles déclarés
 * dans 2+ fichiers TS alimentent le rapport doublons (or de la dédup Phase C).
 *
 * Position vis-à-vis des oracles existants (NE PAS créer un 4e divergent) :
 *   - audit-callgraph-closure.cjs = FERMETURE du call-graph (dépendances non
 *     portées des fonctions portées). Son parseur FN_DEF/LABEL_DEF et son
 *     scanner stripCode sont REPRIS ICI À L'IDENTIQUE (mêmes totaux).
 *   - cartograph-1to1.cjs = vue PAR FICHIER .c (quel .ts héberge quel .c, %).
 *     Il SOUS-estime (documenté) ; ses catégories-domaines sont reprises ici.
 *   - build-ts-symbol-index.cjs = index des EXPORTS TS pour le transpileur.
 *   → decomp-index = l'INVENTAIRE par SYMBOLE, toutes catégories (pas que les
 *     fonctions), avec valeur/signature/ligne et statut port par symbole.
 *
 * Usage :
 *   node scripts/decomp-index.cjs                    # (re)génère tout + stats
 *   node scripts/decomp-index.cjs --sym <regex>      # fiche(s) symbole
 *   node scripts/decomp-index.cjs --sym <re> --kind function|define|func_macro|
 *                                        enum_member|struct|union|typedef|enum|
 *                                        global|data_label
 *   node scripts/decomp-index.cjs --file battle_main.c   # brief chantier
 *   node scripts/decomp-index.cjs --dupes             # rapport doublons (console)
 *   node scripts/decomp-index.cjs --regen --sym X     # forcer la régén avant requête
 *
 * Sorties (générées, régénérables, déterministes — deux runs = même octets) :
 *   audit-reports/DECOMP-INDEX.json      (machine, compact, 1 entrée/ligne)
 *   audit-reports/DECOMP-INDEX-dupes.md  (symboles déclarés dans 2+ .ts)
 * Doc : docs/DECOMP-MAP.md (mode d'emploi, écrite à la main).
 *
 * LECTURE SEULE sur la décomp et sur le port ; Node pur (fs/path), aucune dep.
 */

const fs = require('fs');
const path = require('path');

const DECOMP = process.env.DECOMP_ROOT || 'D:/Projet 1/decomps/pokeemeraude';
const REPO = path.resolve(__dirname, '..');
const OUT_JSON = path.join(REPO, 'audit-reports', 'DECOMP-INDEX.json');
const OUT_DUPES = path.join(REPO, 'audit-reports', 'DECOMP-INDEX-dupes.md');

// ─── CLI ─────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
function argVal(flag) { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; }
const symQuery = argVal('--sym');
const fileQuery = argVal('--file');
const kindFilter = argVal('--kind');
const dupesMode = argv.includes('--dupes');
const forceRegen = argv.includes('--regen');
const isQuery = !!(symQuery || fileQuery || dupesMode);

// ─── Helpers texte (stripCode/makeLineLookup/matchBrace REPRIS À L'IDENTIQUE
//     de audit-callgraph-closure.cjs — scanner un-passe, gère `//*p = x;`) ────
function stripCode(src, allowTemplate) {
  const out = src.split('');
  const n = src.length;
  let i = 0;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { let j = i; while (j < n && src[j] !== '\n') out[j++] = ' '; i = j; continue; }
    if (c === '/' && d === '*') {
      out[i] = out[i + 1] = ' '; let j = i + 2;
      while (j < n && !(src[j] === '*' && src[j + 1] === '/')) { if (src[j] !== '\n') out[j] = ' '; j++; }
      if (j < n) { out[j] = out[j + 1] = ' '; j += 2; }
      i = j; continue;
    }
    if (c === '"' || c === "'" || (allowTemplate && c === '`')) {
      out[i] = ' '; let j = i + 1;
      while (j < n) {
        if (src[j] === '\\') { if (src[j] !== '\n') out[j] = ' '; if (src[j + 1] !== '\n') out[j + 1] = ' '; j += 2; continue; }
        if (src[j] === c) { out[j] = ' '; j++; break; }
        if (c !== '`' && src[j] === '\n') break;
        if (src[j] !== '\n') out[j] = ' ';
        j++;
      }
      i = j; continue;
    }
    i++;
  }
  return out.join('');
}
function stripC(src) { return stripCode(src, false); }
function stripTs(src) { return stripCode(src, true); }
function makeLineLookup(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return (idx) => {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= idx) lo = mid; else hi = mid - 1; }
    return lo + 1;
  };
}
function matchBrace(text, open) {
  let d = 0;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === '{') d++;
    else if (c === '}') { d--; if (d === 0) return i; }
  }
  return text.length - 1;
}
// Marche récursive TRIÉE (déterminisme, style audit-engine-stubs.cjs).
function walk(dir, exts, out = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return out; }
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, exts, out);
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}
function lowerFirst(s) { return s[0].toLowerCase() + s.slice(1); }
// Blanke les directives préproc + leurs continuations `\` (longueur préservée)
// pour que les passes struct/enum/global ne trébuchent pas sur les corps de macros.
function blankPreproc(text) {
  const lines = text.split('\n');
  let cont = false;
  for (let i = 0; i < lines.length; i++) {
    const isDirective = /^[ \t]*#/.test(lines[i]);
    if (cont || isDirective) {
      cont = /\\[ \t]*$/.test(lines[i]);
      lines[i] = ' '.repeat(lines[i].length);
    } else {
      cont = false;
    }
  }
  return lines.join('\n');
}
// Blanke l'INTÉRIEUR d'un bloc {…} (accolades conservées pour matchBrace aval).
function blankInterior(chars, open, close) {
  for (let i = open + 1; i < close; i++) if (chars[i] !== '\n') chars[i] = ' ';
}

const C_KEYWORDS = new Set([
  'if', 'for', 'while', 'switch', 'return', 'sizeof', 'do', 'else', 'case', 'goto', 'defined', 'typedef',
  'void', 'int', 'char', 'short', 'long', 'unsigned', 'signed', 'float', 'double', 'bool',
  'u8', 'u16', 'u32', 'u64', 's8', 's16', 's32', 's64', 'vu8', 'vu16', 'vu32', 'vs8', 'vs16', 'vs32',
  'f32', 'size_t', 'static', 'const', 'extern', 'volatile', 'struct', 'union', 'enum', 'register',
  'inline', 'bool8', 'bool16', 'bool32', 'NULL', 'TRUE', 'FALSE',
  'EWRAM_DATA', 'IWRAM_DATA', 'COMMON_DATA', 'ALIGNED', 'UNUSED', 'NAKED', 'NOINLINE', 'NORETURN', 'ASM_DIRECT',
]);
const TS_KEYWORDS = new Set([
  'if', 'for', 'while', 'switch', 'catch', 'return', 'function', 'constructor', 'super', 'new',
  'typeof', 'await', 'yield', 'else', 'do', 'try', 'finally', 'throw', 'delete', 'in', 'of',
  'instanceof', 'const', 'let', 'var', 'class', 'interface', 'type', 'enum', 'async', 'export',
  'import', 'default', 'declare', 'abstract', 'extends', 'implements', 'from', 'as',
]);

// ─── Domaines (catégories REPRISES de cartograph-1to1.cjs, adaptées par fichier) ──
function categorize(name) {
  const n = name.toLowerCase();
  if (/(^link|librfu|rfu|union_room|^mevent\b|mystery_gift|mystery_event|wonder_news|wonder_mail|record_mixing|multiboot|cable_club|reshow_battle|ereader|net\b)/.test(n)) return 'Link/IO (N-A)';
  if (/(^m4a|^sound\b|^sound_|^cry\b|cry_|^bgm|^song|music|agb_pcm)/.test(n)) return 'Son';
  if (/(^save\b|^save_|load_save|reload_save|clear_save|^rtc\b|siirtc|reset_rtc|agb_flash|^flash\b|^clock\b|wallclock|play_time|time_events)/.test(n)) return 'Save/RTC';
  if (/(^main\b|^crt0|^libc|^malloc|^alloc\b|^gba\b|io_reg|^syscall|^dma\b|^bios|^task\b|^util\b|^trig\b|math_util|mini_printf|libisagbprn|sio|^intr|rom_header|digit_obj_util|confetti_util|international_string_util|decompress|^random\b)/.test(n)) return 'Système/GBA';
  if (/(^item\b|^item_|^bag\b|^bag_|^shop\b|pokemart|use_pokeblock|^coins\b|^money\b|give_gift)/.test(n)) return 'Item/Bag';
  if (/(battle|contest|^move\b|pokemon_animation|anim_mon|rayquaza_scene|^pokeball\b)/.test(n)) return 'Combat';
  if (/(^pokemon|party_menu|^evolution|^pokedex|pokeblock|^daycare|learn_move|move_relearner|^mon_|egg_hatch|^pokenav)/.test(n)) return 'Pokémon/Party';
  if (/(menu|window|^text\b|^text_|^string|^font|^sprite|^gpu|^bg\b|^blit|scanline|palette|^startup|^title|^intro\b|list_menu|^option|naming|^mail\b|image_proc|^credits|trainer_card|^diploma|hall_of_fame|^hof_|frontier_pass|^graphics\b|dynamic_placeholder|menu_helpers)/.test(n)) return 'UI/Menu/Gfx';
  if (/(overworld|field|fldeff|fieldmap|metatile|tileset|map_|event_object|object_event|^event_data|berry|trainer_see|item_use|secret_base|^scrcmd|script|coord_event|wild_encounter|region_map|^tv\b|^tv_|easy_chat|mauville|^bike\b|^roamer|safari_zone|new_game|heal_location|decoration|slot_machine|roulette|lottery|dewford_trend|lilycove_lady|apprentice|match_call|trainer_hill|mirage_tower|rotating_gate|rotating_tile|faraway_island|birch_pc|player_pc|starter_choose|landmark|walda|braille|gym_leader_rematch|frontier_util|trainer_pokemon_sprites|^trade\b|pokeblock_feed|berry_)/.test(n)) return 'Overworld/Field';
  if (/(^debug|^test_|sprite_test|^unk_)/.test(n)) return 'Debug';
  return 'Autre';
}
function domainOf(rel) {
  if (rel.startsWith('data/')) return 'Data (asm)';
  if (rel.startsWith('sound/')) return 'Sound (asm)';
  if (rel.startsWith('include/constants/')) return 'Constants (.h)';
  if (rel.startsWith('include/')) return 'Headers (.h)';
  const base = path.basename(rel).replace(/\.(c|h)$/, '');
  return categorize(base);
}

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 1 — parse DÉCOMP
// ═════════════════════════════════════════════════════════════════════════════
// FN_DEF REPRIS À L'IDENTIQUE de audit-callgraph-closure.cjs (mêmes totaux).
const FN_DEF = /^[A-Za-z_][A-Za-z0-9_ \t*]*[ \t*]([A-Za-z_]\w*)[ \t]*\(([^;{}]*?)\)[ \t]*\r?\n\{/gm;
const LABEL_DEF = /^([A-Za-z_]\w*)(::?)[ \t]*(?:@.*)?$/gm;
const GLOBAL_DIRECTIVE = /^[ \t]*\.global[ \t]+([A-Za-z_]\w*)[ \t]*$/gm;
const DEFINE_LINE = /^[ \t]*#[ \t]*define[ \t]+([A-Za-z_]\w*)(\()?/;
const ENUM_DEF = /(?:^|[^\w])enum(?:[ \t]+([A-Za-z_]\w*))?[ \t\r\n]*\{/g;
const SU_DEF = /(?:^|[^\w])(struct|union)[ \t]+([A-Za-z_]\w*)[ \t\r\n]*\{/g;

// entrées : {name, kind, file, line, extra}
const entries = { functions: [], defines: [], enums: [], types: [], globals: [], data: [] };
const seen = new Set(); // dédoublonnage exact (groupe|kind|name|file|line)
function addEntry(group, e) {
  const key = `${group}|${e.kind}|${e.name}|${e.file}|${e.line}`;
  if (seen.has(key)) return;
  seen.add(key);
  entries[group].push(e);
}

function truncate(s, n) { s = s.trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

// Résolution de valeur d'enum : littéral, ou expression numérique pure (<<, |, +…).
function resolveExpr(expr) {
  const e = expr.trim();
  if (!e) return null;
  const noHex = e.replace(/\b0[xX][0-9a-fA-F]+\b/g, '0');
  if (/[A-Za-z_]/.test(noHex)) return null;                    // identifiants → raw
  if (!/^[\d\s()+\-*/%<>|&^~]*$/.test(noHex)) return null;     // caractères sûrs uniquement
  try {
    const v = Function('"use strict"; return (' + e + ');')();
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  } catch { /* raw */ }
  return null;
}

// name du déclarateur d'un statement C aplati (sans corps {…}, sans préproc).
// La PREMIÈRE parenthèse (à gauche d'un éventuel `=`) décide : `(*` → variable
// fn-pointer (`u8 (*PollFlashStatus)(u8*)`) ; sinon `Nom(` → PROTOTYPE → skip
// (même si un PARAMÈTRE contient un fn-pointer : `void Setup(bool8 (*ptr)(void));`).
function declName(flatIn) {
  let flat = flatIn.replace(/\b(ALIGNED|UNUSED_ARG)[ \t]*\([^)]*\)/g, ' ');
  const eq = flat.indexOf('=');
  let left = eq >= 0 ? flat.slice(0, eq) : flat.replace(/;[\s\S]*$/, '');
  const paren = left.indexOf('(');
  if (paren >= 0) {
    const fp = left.slice(paren).match(/^\([ \t]*\*+[ \t]*(?:const[ \t]+|volatile[ \t]+)*([A-Za-z_]\w*)/);
    if (fp && !C_KEYWORDS.has(fp[1])) return { name: fp[1], fnptr: true };
    return null; // prototype de fonction → pas une variable
  }
  left = left.replace(/\[[^\]]*\]/g, ' ');
  const ids = left.match(/[A-Za-z_]\w*/g);
  if (!ids || !ids.length) return null;
  const name = ids[ids.length - 1];
  if (C_KEYWORDS.has(name)) return null;
  return { name };
}

function parseCFile(abs, rel) {
  const raw = fs.readFileSync(abs, 'utf8');
  const stripped = stripC(raw);
  const lineAt = makeLineLookup(stripped);

  // 1. #define (sur texte strippé, AVANT blankPreproc) — ligne à ligne.
  {
    const lines = stripped.split('\n');
    let cont = false;
    for (let i = 0; i < lines.length; i++) {
      const L = lines[i];
      if (!cont) {
        const m = L.match(DEFINE_LINE);
        if (m && !C_KEYWORDS.has(m[1])) {
          const isFn = !!m[2];
          const multiline = /\\[ \t]*$/.test(L);
          let value = null, params = null;
          const after = L.slice(L.indexOf(m[1]) + m[1].length);
          if (isFn) {
            const close = after.indexOf(')');
            params = close >= 0 ? truncate(after.slice(1, close), 60) : '';
            if (!multiline) value = truncate(after.slice(close + 1).replace(/\\[ \t]*$/, ''), 80);
          } else if (!multiline) {
            value = truncate(after.replace(/\\[ \t]*$/, ''), 80);
          }
          const extra = {};
          if (value !== null && value !== '') extra.value = value;
          if (multiline) extra.multiline = true;
          if (isFn && params) extra.params = params;
          addEntry('defines', { name: m[1], kind: isFn ? 'func_macro' : 'define', file: rel, line: i + 1, extra });
        }
      }
      cont = (cont || /^[ \t]*#/.test(L)) && /\\[ \t]*$/.test(L);
    }
  }

  const text = blankPreproc(stripped);
  const chars = text.split('');

  // 2. Fonctions (FN_DEF oracle) — spans mémorisés pour exclure leurs corps.
  const fnSpans = [];
  {
    let m;
    FN_DEF.lastIndex = 0;
    while ((m = FN_DEF.exec(text))) {
      const name = m[1];
      if (C_KEYWORDS.has(name)) continue;
      const bodyStart = m.index + m[0].length - 1;
      const bodyEnd = matchBrace(text, bodyStart);
      fnSpans.push([m.index, bodyEnd]);
      const sig = truncate(m[0].slice(0, m[0].length - 1).replace(/\s+/g, ' '), 110);
      const extra = { sig };
      if (/(^|[ \t])static([ \t]|$)/.test(sig.slice(0, sig.indexOf(name)))) extra.static = true;
      if (rel.endsWith('.h')) extra.header = true;
      addEntry('functions', { name, kind: 'function', file: rel, line: lineAt(m.index), extra });
    }
  }
  const inFn = (idx) => {
    for (const [a, b] of fnSpans) { if (idx >= a && idx <= b) return true; }
    return false;
  };

  // 3. Enums (membres + type nommé) — intérieur blanké ensuite.
  {
    let m;
    ENUM_DEF.lastIndex = 0;
    while ((m = ENUM_DEF.exec(text))) {
      const open = m.index + m[0].length - 1;
      if (inFn(m.index)) { blankInterior(chars, open, matchBrace(text, open)); continue; }
      const close = matchBrace(text, open);
      const enumName = m[1] || null;
      if (enumName) addEntry('types', { name: enumName, kind: 'enum', file: rel, line: lineAt(m.index), extra: {} });
      const body = text.slice(open + 1, close);
      const bodyOffset = open + 1;
      let counter = 0, counterKnown = true;
      let cursor = 0;
      for (const piece of body.split(',')) {
        const start = bodyOffset + cursor;
        cursor += piece.length + 1;
        const pm = piece.match(/^[\s]*([A-Za-z_]\w*)[\s]*(?:=([\s\S]*))?$/);
        if (!pm) continue;
        const name = pm[1];
        if (C_KEYWORDS.has(name)) continue;
        const nameIdx = start + piece.indexOf(name);
        const extra = {};
        if (enumName) extra.enum = enumName;
        if (pm[2] !== undefined) {
          const v = resolveExpr(pm[2]);
          if (v !== null) { extra.value = v; counter = v + 1; counterKnown = true; }
          else { extra.raw = truncate(pm[2].replace(/\s+/g, ' '), 60); counterKnown = false; }
        } else if (counterKnown) {
          extra.value = counter; counter++;
        } else {
          extra.raw = '(implicite après valeur non résolue)';
        }
        addEntry('enums', { name, kind: 'enum_member', file: rel, line: lineAt(nameIdx), extra });
      }
      blankInterior(chars, open, close);
    }
  }

  // 4. struct/union nommés (définitions) — intérieur blanké.
  {
    const t2 = chars.join(''); // enums blankés
    let m;
    SU_DEF.lastIndex = 0;
    while ((m = SU_DEF.exec(t2))) {
      if (inFn(m.index)) continue;
      const open = m.index + m[0].length - 1;
      const close = matchBrace(t2, open);
      addEntry('types', { name: m[2], kind: m[1], file: rel, line: lineAt(m.index + (m[0].startsWith(m[1]) ? 0 : 1)), extra: {} });
      blankInterior(chars, open, close);
    }
  }

  // 5. typedef + globals : statements col-0 hors fonctions.
  {
    const t3 = chars.join('');
    const consumed = [];
    const inConsumed = (idx) => {
      for (const [a, b] of consumed) { if (idx >= a && idx <= b) return true; }
      return false;
    };
    const stmtRe = /^[A-Za-z_]/gm;
    let m;
    while ((m = stmtRe.exec(t3))) {
      const start = m.index;
      if (inFn(start) || inConsumed(start)) continue;
      // extraire le statement : jusqu'au ';' de profondeur 0, en sautant {…}
      let i = start, flat = '', end = -1;
      while (i < t3.length) {
        const c = t3[i];
        if (c === '{') { const cl = matchBrace(t3, i); flat += '{}'; i = cl + 1; continue; }
        if (c === ';') { end = i; break; }
        flat += c;
        i++;
      }
      if (end < 0) continue;
      consumed.push([start, end]);
      const line = lineAt(start);
      if (/^typedef\b/.test(flat)) {
        const d = declName(flat.replace(/^typedef\b/, ' ').replace(/\{\}/g, ' '));
        if (d) addEntry('types', { name: d.name, kind: 'typedef', file: rel, line, extra: d.fnptr ? { fnptr: true } : {} });
        continue;
      }
      // pure déclaration de type (struct Foo {…}; déjà capté) → skip
      const flatNoBrace = flat.replace(/\{\}/g, ' ');
      const stripped2 = flatNoBrace.replace(/\b(static|const|extern|volatile|EWRAM_DATA|IWRAM_DATA|COMMON_DATA|UNUSED)\b/g, ' ').trim();
      if (/^(struct|union|enum)[ \t\r\n]+[A-Za-z_]\w*[\s]*$/.test(stripped2) || /^(struct|union|enum)[\s]*$/.test(stripped2)) continue;
      const d = declName(flatNoBrace);
      if (!d) continue; // prototype ou inextractible
      const extra = {};
      if (/\bstatic\b/.test(flatNoBrace)) extra.static = true;
      if (/\bextern\b/.test(flatNoBrace)) extra.extern = true;
      const st = flatNoBrace.match(/\b(EWRAM_DATA|IWRAM_DATA|COMMON_DATA)\b/);
      if (st) extra.storage = st[1].replace('_DATA', '');
      if (d.fnptr) extra.fnptr = true;
      if (rel.endsWith('.h') && !extra.extern) extra.header = true;
      addEntry('globals', { name: d.name, kind: 'global', file: rel, line, extra });
    }
  }
}

// Constantes GÉNÉRÉES au build (absentes des .h du source) — synthèse depuis les
// JSON, formule reprise de l'émetteur officiel :
//   MAP_<ID>    = (mapIdx | (groupIdx << 8))   — tools/mapjson/mapjson.cpp:554
//                 (mapIdx repart à 0 à chaque groupe, ordre = tableau du groupe)
//   LAYOUT_<ID> = index 1-basé dans layouts.json — tools/mapjson/mapjson.cpp:651
//                 (les entrées vides comptent dans l'index : `i++` hors du if)
//   MAP_GROUPS_COUNT = nombre de groupes        — tools/mapjson/mapjson.cpp:563
function lineOfFirst(raw, needle) {
  const i = raw.indexOf(needle);
  return i < 0 ? 1 : raw.slice(0, i).split('\n').length;
}
function synthesizeGeneratedConstants() {
  try {
    const groupsPath = path.join(DECOMP, 'data', 'maps', 'map_groups.json');
    const raw = fs.readFileSync(groupsPath, 'utf8');
    const groups = JSON.parse(raw);
    const order = groups.group_order || [];
    for (let gi = 0; gi < order.length; gi++) {
      const maps = groups[order[gi]] || [];
      for (let mi = 0; mi < maps.length; mi++) {
        const mapJsonRel = `data/maps/${maps[mi]}/map.json`;
        let id = null, line = 1;
        try {
          const mraw = fs.readFileSync(path.join(DECOMP, mapJsonRel), 'utf8');
          const m = mraw.match(/"id"\s*:\s*"([A-Za-z_]\w*)"/);
          if (m) { id = m[1]; line = lineOfFirst(mraw, m[0]); }
        } catch { /* map.json manquant → skip */ }
        if (!id) continue;
        addEntry('defines', {
          name: id, kind: 'define', file: mapJsonRel, line,
          extra: { value: `(${mi} | (${gi} << 8))`, generated: 'map_groups.h' },
        });
      }
    }
    addEntry('defines', {
      name: 'MAP_GROUPS_COUNT', kind: 'define', file: 'data/maps/map_groups.json',
      line: lineOfFirst(raw, '"group_order"'),
      extra: { value: String(order.length), generated: 'map_groups.h' },
    });
  } catch { /* décomp sans map_groups.json */ }
  try {
    const layoutsPath = path.join(DECOMP, 'data', 'layouts', 'layouts.json');
    const raw = fs.readFileSync(layoutsPath, 'utf8');
    const layouts = JSON.parse(raw).layouts || [];
    let i = 1;
    for (const l of layouts) {
      if (l && typeof l === 'object' && l.id) {
        addEntry('defines', {
          name: l.id, kind: 'define', file: 'data/layouts/layouts.json',
          line: lineOfFirst(raw, `"${l.id}"`),
          extra: { value: String(i), generated: 'layouts.h' },
        });
      }
      i++;
    }
  } catch { /* décomp sans layouts.json */ }
}

function parseAsmFile(abs, rel) {
  const raw = fs.readFileSync(abs, 'utf8');
  const lineAt = makeLineLookup(raw);
  const fileLabels = new Set();
  let m;
  LABEL_DEF.lastIndex = 0;
  while ((m = LABEL_DEF.exec(raw))) {
    const extra = {};
    if (m[2] === '::') extra.exported = true;
    fileLabels.add(m[1]);
    addEntry('data', { name: m[1], kind: 'data_label', file: rel, line: lineAt(m.index), extra });
  }
  GLOBAL_DIRECTIVE.lastIndex = 0;
  while ((m = GLOBAL_DIRECTIVE.exec(raw))) {
    if (fileLabels.has(m[1])) continue; // le label lui-même a déjà son entrée
    addEntry('data', { name: m[1], kind: 'data_label', file: rel, line: lineAt(m.index), extra: { globalDirective: true } });
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 2 — parse PORT TS (src/ + harness/ + include/ du repo web)
// ═════════════════════════════════════════════════════════════════════════════
// Déclarations FORTES et TOP-LEVEL uniquement (ancrées colonne 0 = module scope,
// comme DECL_RE de cartograph-1to1.cjs) : function/const/let/var/class/interface/
// type/enum. Les MÉTHODES de classe, clés d'objet et variables LOCALES (indentées)
// ne comptent PAS (contrat « declared » du rapport doublons). `const X =
// __wireTodo('X')` est une déclaration-STUB → comptée wireTodo, PAS declared.
const TS_DECL_RE = /^(?:export[ \t]+)?(?:default[ \t]+)?(?:declare[ \t]+)?(?:abstract[ \t]+)?(?:async[ \t]+)?(function|const|let|var|class|interface|type|enum)[ \t]+([A-Za-z_$][\w$]*)/gm;
const WIRE_TODO_RE = /__wireTodo\([ \t]*['"`]([A-Za-z_$][\w$]*)['"`]/g;
const TS_STR_RES = [/(['"])((?:\\.|(?!\1)[^\\\n])*)\1/g, /`((?:\\[\s\S]|[^`\\])*)`/g];
const ID_RE = /[A-Za-z_$][\w$]*/g;

const tsDecls = new Map();   // name → [{file, line}] (déclarations fortes, hors wireTodo)
const tsWire = new Map();    // name → [{file, line}] (const X = __wireTodo('X'))
const tsRefs = new Set();    // tous identifiants du code TS + littéraux de chaînes

function parseTsFile(abs, rel) {
  const raw = fs.readFileSync(abs, 'utf8');
  // identifiants dans les CHAÎNES (byte-VM référence les labels par nom en string)
  for (const re of TS_STR_RES) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(raw))) {
      const content = m[2] !== undefined ? m[2] : m[1];
      let im;
      ID_RE.lastIndex = 0;
      while ((im = ID_RE.exec(content))) tsRefs.add(im[0]);
    }
  }
  // wireTodo (sur brut : le nom est DANS une string)
  {
    let m;
    WIRE_TODO_RE.lastIndex = 0;
    while ((m = WIRE_TODO_RE.exec(raw))) {
      if (!tsWire.has(m[1])) tsWire.set(m[1], []);
      tsWire.get(m[1]).push({ file: rel, line: raw.slice(0, m.index).split('\n').length });
    }
  }
  const text = stripTs(raw);
  const lineAt = makeLineLookup(text);
  // identifiants du code
  {
    let im;
    ID_RE.lastIndex = 0;
    while ((im = ID_RE.exec(text))) tsRefs.add(im[0]);
  }
  // déclarations fortes
  {
    let m;
    TS_DECL_RE.lastIndex = 0;
    while ((m = TS_DECL_RE.exec(text))) {
      const name = m[2];
      if (TS_KEYWORDS.has(name)) continue;
      // déclaration-stub wireTodo ? (strings strippées → `= __wireTodo(`)
      const declTail = text.slice(m.index, Math.min(text.length, m.index + m[0].length + 160));
      if (/=[ \t]*__wireTodo[ \t]*\(/.test(declTail.split('\n')[0] + (declTail.split('\n')[1] || ''))) continue;
      if (!tsDecls.has(name)) tsDecls.set(name, []);
      tsDecls.get(name).push({ file: rel, line: lineAt(m.index + m[0].length - name.length) });
    }
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 3 — croisement port + PHASE 4 — sorties
// ═════════════════════════════════════════════════════════════════════════════
function portOf(name) {
  const decls = tsDecls.get(name);
  if (decls && decls.length) {
    return { status: 'declared', decls: fmtDecls(decls) };
  }
  for (const v of [name + '_Manual', '_' + name, '_' + lowerFirst(name)]) {
    if (v === name) continue;
    const vd = tsDecls.get(v);
    if (vd && vd.length) return { status: 'declared', variant: v, decls: fmtDecls(vd) };
  }
  if (tsWire.has(name)) return { status: 'referenced', wireTodo: true };
  if (tsRefs.has(name)) return { status: 'referenced' };
  return { status: 'absent' };
}
function fmtDecls(list) {
  const s = [...new Set(list.map((d) => `${d.file}:${d.line}`))];
  s.sort();
  return s;
}

const GROUPS = ['functions', 'defines', 'enums', 'types', 'globals', 'data'];

function generate() {
  const t0 = Date.now();
  if (!fs.existsSync(DECOMP)) { console.error(`Décomp introuvable : ${DECOMP}`); process.exit(1); }

  // — décomp —
  const cRoots = [
    [path.join(DECOMP, 'src'), ['.c', '.h']],
    [path.join(DECOMP, 'gflib'), ['.c', '.h']],   // absent dans CETTE décomp (layout ancien) — géré si présent
    [path.join(DECOMP, 'include'), ['.h']],
  ];
  let nCFiles = 0;
  for (const [root, exts] of cRoots) {
    for (const abs of walk(root, exts)) {
      nCFiles++;
      parseCFile(abs, path.relative(DECOMP, abs).replace(/\\/g, '/'));
    }
  }
  const asmRoots = [path.join(DECOMP, 'data'), path.join(DECOMP, 'sound')];
  let nAsmFiles = 0;
  for (const root of asmRoots) {
    for (const abs of walk(root, ['.inc', '.s'])) {
      nAsmFiles++;
      parseAsmFile(abs, path.relative(DECOMP, abs).replace(/\\/g, '/'));
    }
  }
  synthesizeGeneratedConstants();

  // — port —
  const tsRoots = ['src', 'harness', 'include'].map((d) => path.join(REPO, d));
  let nTsFiles = 0;
  for (const root of tsRoots) {
    for (const abs of walk(root, ['.ts'])) {
      if (abs.endsWith('.d.ts')) continue;
      nTsFiles++;
      parseTsFile(abs, path.relative(REPO, abs).replace(/\\/g, '/'));
    }
  }

  // — croisement + tri déterministe —
  const byteSort = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  for (const g of GROUPS) {
    for (const e of entries[g]) e.port = portOf(e.name);
    entries[g].sort((a, b) => byteSort(a.name, b.name) || byteSort(a.file, b.file) || (a.line - b.line));
  }

  // — stats —
  const counts = { decompFiles: { c_h: nCFiles, asm: nAsmFiles }, tsFiles: nTsFiles, byKind: {}, port: {} };
  for (const g of GROUPS) {
    counts.byKind[g] = entries[g].length;
    const p = { declared: 0, variant: 0, wireTodo: 0, referenced: 0, absent: 0 };
    const seenSym = new Set(); // par NOM (les homonymes multi-fichiers comptent 1)
    for (const e of entries[g]) {
      if (seenSym.has(e.name)) continue;
      seenSym.add(e.name);
      if (e.port.status === 'declared') { p.declared++; if (e.port.variant) p.variant++; }
      else if (e.port.wireTodo) p.wireTodo++;
      else if (e.port.status === 'referenced') p.referenced++;
      else p.absent++;
    }
    p.uniqueNames = seenSym.size;
    counts.port[g] = p;
  }

  // — doublons hors-décomp : symboles déclarés 2+ fois côté TS dont le NOM
  //   n'existe pas dans la décomp (inventions port-side type MainCB2_BagMenuRun,
  //   ou wrappers locaux `_Nom` du pattern transpileur) —
  const decompNames = new Set();
  for (const g of GROUPS) for (const e of entries[g]) decompNames.add(e.name);
  const upperFirst = (s) => s[0].toUpperCase() + s.slice(1);
  const tsOnlyDupes = [];
  for (const [name, list] of tsDecls) {
    if (decompNames.has(name)) continue;
    const decls = fmtDecls(list);
    const files = new Set(decls.map((d) => d.slice(0, d.lastIndexOf(':'))));
    if (files.size < 2) continue;
    const stripped = name.replace(/^_+/, '');
    const shim = name.startsWith('_') && (decompNames.has(stripped) || decompNames.has(upperFirst(stripped)));
    tsOnlyDupes.push({ name, decls, shim });
  }
  tsOnlyDupes.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  // — JSON compact déterministe (1 entrée par ligne : greppable, pas d'indentation) —
  const lines = [];
  lines.push('{"meta":' + JSON.stringify({
    generatedAt: 'REGEN', decomp: DECOMP.replace(/\\/g, '/'),
    portRoots: ['src', 'harness', 'include'], counts,
  }) + ',"index":{');
  GROUPS.forEach((g, gi) => {
    lines.push(JSON.stringify(g) + ':[');
    const arr = entries[g];
    for (let i = 0; i < arr.length; i++) lines.push(JSON.stringify(arr[i]) + (i < arr.length - 1 ? ',' : ''));
    lines.push(']' + (gi < GROUPS.length - 1 ? ',' : ''));
  });
  lines.push('},"tsOnlyDupes":[');
  for (let i = 0; i < tsOnlyDupes.length; i++) lines.push(JSON.stringify(tsOnlyDupes[i]) + (i < tsOnlyDupes.length - 1 ? ',' : ''));
  lines.push(']}');
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, lines.join('\n'), 'utf8');

  // — rapport doublons —
  const dupes = computeDupes(entries);
  fs.writeFileSync(OUT_DUPES, renderDupesMd(dupes, tsOnlyDupes), 'utf8');

  // — console —
  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`DECOMP-INDEX généré en ${dt}s — décomp : ${nCFiles} fichiers C/H + ${nAsmFiles} asm · port : ${nTsFiles} .ts`);
  console.log('');
  console.log('  groupe      entrées   noms uniq.  déclarés  (drift)  wireTodo  référencés  absents');
  for (const g of GROUPS) {
    const p = counts.port[g];
    console.log(`  ${g.padEnd(11)}${String(counts.byKind[g]).padStart(8)}${String(p.uniqueNames).padStart(12)}${String(p.declared).padStart(10)}${String(p.variant).padStart(9)}${String(p.wireTodo).padStart(10)}${String(p.referenced).padStart(12)}${String(p.absent).padStart(9)}`);
  }
  console.log('');
  // % porté par domaine (fonctions)
  const dom = new Map();
  const seenFn = new Set();
  for (const e of entries.functions) {
    const k = `${e.name}|${e.file}`;
    if (seenFn.has(k)) continue;
    seenFn.add(k);
    const d = domainOf(e.file);
    if (!dom.has(d)) dom.set(d, { total: 0, decl: 0 });
    const r = dom.get(d);
    r.total++;
    if (e.port.status === 'declared') r.decl++;
  }
  console.log('  Fonctions déclarées dans le port, par domaine :');
  for (const [d, r] of [...dom.entries()].sort((a, b) => b[1].total - a[1].total)) {
    console.log(`    ${d.padEnd(18)} ${String(r.decl).padStart(5)}/${String(r.total).padEnd(6)} (${Math.round(r.decl / r.total * 100)}%)`);
  }
  console.log('');
  console.log(`  Doublons TS (symboles déclarés dans 2+ fichiers) : ${dupes.total} — détail : ${path.relative(REPO, OUT_DUPES)}`);
  console.log(`  JSON : ${path.relative(REPO, OUT_JSON)}`);
  return { counts, dupes };
}

// ─── Doublons ────────────────────────────────────────────────────────────────
function isMirrorTs(f) { return f.startsWith('src/') || f.startsWith('include/'); }
function computeDupes(idx) {
  const byName = new Map(); // name → {kinds:Set, decomp:[], decls:Set}
  for (const g of GROUPS) {
    for (const e of idx[g]) {
      if (!e.port || e.port.status !== 'declared' || e.port.variant) continue;
      const files = new Set(e.port.decls.map((d) => d.slice(0, d.lastIndexOf(':'))));
      if (files.size < 2) continue;
      if (!byName.has(e.name)) byName.set(e.name, { kinds: new Set(), decomp: [], decls: e.port.decls });
      const r = byName.get(e.name);
      r.kinds.add(e.kind);
      if (r.decomp.length < 4) r.decomp.push(`${e.file}:${e.line}`);
      else if (r.decomp.length === 4) r.decomp.push('…');
    }
  }
  const rows = [...byName.entries()].map(([name, r]) => {
    const files = [...new Set(r.decls.map((d) => d.slice(0, d.lastIndexOf(':'))))];
    const mirror = files.filter(isMirrorTs).length;
    const cls = mirror >= 2 ? 'vraie' : mirror === 1 ? 'mixte' : 'harness';
    return { name, kinds: [...r.kinds].sort(), decomp: r.decomp, decls: r.decls, cls };
  });
  rows.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return {
    total: rows.length,
    vraies: rows.filter((r) => r.cls === 'vraie'),
    mixtes: rows.filter((r) => r.cls === 'mixte'),
    harness: rows.filter((r) => r.cls === 'harness'),
  };
}

function renderDupesMd(dupes, tsOnlyDupes) {
  const L = [];
  const P = (s) => L.push(s);
  P('# Doublons de déclaration TS — symboles décomp déclarés dans 2+ fichiers du port');
  P('');
  P('> Généré par `node scripts/decomp-index.cjs` (écrasé à chaque run, déterministe).');
  P('> Un « doublon » = un symbole de la DÉCOMP qui possède une déclaration forte');
  P('> (`function`/`const`/`let`/`var`/`class`/`interface`/`type`/`enum`) dans **2 fichiers TS ou plus**');
  P('> du port (`src/`, `include/`, `harness/`). Les stubs `const X = __wireTodo(\'X\')` ne comptent pas.');
  P('> C\'est la matière première de la **dédup Phase C** : chaque ligne est un candidat');
  P('> « quelle implémentation garde-t-on, laquelle devient re-export/meurt ».');
  P('');
  P(`**${dupes.total} symboles en doublon** — vraies dupes (2+ déclarations dans le MIRROIR `);
  P(`\`src/\`+\`include/\`) : **${dupes.vraies.length}** · miroir + harness (adaptation moteur, moins grave) : `);
  P(`**${dupes.mixtes.length}** · harness uniquement : **${dupes.harness.length}**.`);
  P('');
  const section = (title, rows, note) => {
    P(`## ${title} — ${rows.length}`);
    P('');
    if (note) { P(note); P(''); }
    if (!rows.length) { P('*(aucun)*'); P(''); return; }
    // fonctions/globals/data d'abord (l'or), constantes ensuite
    const heavy = rows.filter((r) => r.kinds.some((k) => k === 'function' || k === 'global' || k === 'data_label'));
    const consts = rows.filter((r) => !heavy.includes(r));
    const table = (rs) => {
      P('| symbole | kind décomp | décomp | déclarations TS |');
      P('|---|---|---|---|');
      for (const r of rs) {
        P(`| \`${r.name}\` | ${r.kinds.join(', ')} | ${r.decomp.map((d) => `\`${d}\``).join(' · ')} | ${r.decls.map((d) => `\`${d}\``).join(' · ')} |`);
      }
    };
    if (heavy.length) {
      P(`### Fonctions / globals / labels (${heavy.length}) — l'or de la dédup`);
      P('');
      table(heavy);
      P('');
    }
    if (consts.length) {
      P(`### Constantes (defines / enums / types) (${consts.length})`);
      P('');
      P('Constantes redéclarées localement au lieu d\'être importées du miroir de header —');
      P('dédup moins urgente mais source de désynchronisation de valeurs.');
      P('');
      table(consts);
      P('');
    }
  };
  section('1. VRAIES DUPES — 2+ déclarations dans des fichiers MIROIR (`src/` + `include/`)', dupes.vraies,
    'Deux implémentations concurrentes dans l\'arbre 1:1 : la classe de bugs « quelle version tourne ? ».');
  section('2. MIROIR + HARNESS — 1 déclaration miroir + 1+ harness (adaptation moteur)', dupes.mixtes,
    'Le harness héberge une adaptation du même symbole : à vérifier que le miroir délègue bien (pas deux vérités).');
  section('3. HARNESS UNIQUEMENT — 2+ déclarations toutes dans `harness/`', dupes.harness, null);

  // Section 4 : doublons HORS-DÉCOMP
  const inventions = tsOnlyDupes.filter((r) => !r.shim && !r.name.startsWith('_'));
  const shims = tsOnlyDupes.filter((r) => r.shim);
  const helpers = tsOnlyDupes.filter((r) => !r.shim && r.name.startsWith('_'));
  P(`## 4. HORS-DÉCOMP — ${tsOnlyDupes.length} symboles TS déclarés dans 2+ fichiers dont le nom N'EXISTE PAS dans la décomp`);
  P('');
  P('Noms inventés côté port (adaptations moteur) ou wrappers locaux. Un nom inventé déclaré');
  P('dans 2 fichiers = même classe de risque qu\'une vraie dupe (ex. `MainCB2_BagMenuRun`).');
  P('');
  P(`### 4a. Noms pleins inventés (${inventions.length}) — à examiner comme les vraies dupes`);
  P('');
  if (inventions.length) {
    P('| symbole | déclarations TS |');
    P('|---|---|');
    for (const r of inventions) P(`| \`${r.name}\` | ${r.decls.map((d) => `\`${d}\``).join(' · ')} |`);
  } else P('*(aucun)*');
  P('');
  P(`### 4b. Wrappers locaux \`_Nom\` d'un symbole décomp (${shims.length}) — pattern transpileur assumé (liste compacte)`);
  P('');
  P('Chaque fichier transpilé déclare ses propres alias préfixés `_` vers les symboles décomp');
  P('importés : dupes VOLONTAIRES par fichier, à résorber seulement lors des passes d\'unification.');
  P('');
  if (shims.length) {
    for (const r of shims) P(`- \`${r.name}\` × ${r.decls.length}`);
  } else P('*(aucun)*');
  P('');
  P(`### 4c. Helpers port \`_xxx\` sans homonyme décomp (${helpers.length}) — liste compacte`);
  P('');
  if (helpers.length) {
    for (const r of helpers) P(`- \`${r.name}\` × ${r.decls.length} (${[...new Set(r.decls.map((d) => d.split('/')[1] || d))].slice(0, 3).join(', ')}${r.decls.length > 3 ? ', …' : ''})`);
  } else P('*(aucun)*');
  P('');
  P('---');
  P(`_${dupes.total} doublons décomp + ${tsOnlyDupes.length} hors-décomp — régénération : \`node scripts/decomp-index.cjs\` · requête : \`--dupes\`._`);
  P('');
  return L.join('\n');
}

// ═════════════════════════════════════════════════════════════════════════════
// MODE REQUÊTE (charge le JSON existant ; le régénère s'il manque ou --regen)
// ═════════════════════════════════════════════════════════════════════════════
function loadIndex() {
  if (forceRegen || !fs.existsSync(OUT_JSON)) generate();
  return JSON.parse(fs.readFileSync(OUT_JSON, 'utf8'));
}
function portLabel(p) {
  if (p.status === 'declared') return p.variant ? `PORTÉ (drift → ${p.variant})` : 'PORTÉ (exact)';
  if (p.wireTodo) return 'RÉFÉRENCÉ (wireTodo — stub inerte)';
  if (p.status === 'referenced') return 'RÉFÉRENCÉ (sans déclaration)';
  return 'ABSENT';
}
function extraLabel(e) {
  const x = e.extra || {};
  const bits = [];
  if (x.sig) bits.push(x.sig);
  if (x.value !== undefined) bits.push(`= ${x.value}`);
  if (x.raw) bits.push(`raw: ${x.raw}`);
  if (x.params !== undefined) bits.push(`(${x.params})`);
  if (x.enum) bits.push(`enum ${x.enum}`);
  if (x.static) bits.push('static');
  if (x.extern) bits.push('extern');
  if (x.storage) bits.push(x.storage);
  if (x.fnptr) bits.push('fn-ptr');
  if (x.exported) bits.push('::');
  if (x.multiline) bits.push('multiline');
  if (x.header) bits.push('.h');
  return bits.join(' · ');
}

function querySym() {
  const idx = loadIndex();
  let re;
  try { re = new RegExp(symQuery); }
  catch (err) { console.error(`Regex invalide : ${err.message}`); process.exit(1); }
  let shown = 0, matched = 0;
  const MAX = 50;
  for (const g of GROUPS) {
    for (const e of idx.index[g]) {
      if (kindFilter && e.kind !== kindFilter) continue;
      if (!re.test(e.name)) continue;
      matched++;
      if (shown >= MAX) continue;
      shown++;
      console.log(`\n=== ${e.name} (${e.kind}) ===`);
      console.log(`  décomp : ${e.file}:${e.line}${extraLabel(e) ? `\n  détail : ${extraLabel(e)}` : ''}`);
      console.log(`  port   : ${portLabel(e.port)}`);
      if (e.port.decls) for (const d of e.port.decls) console.log(`           ${d}`);
    }
  }
  if (!matched) console.log(`Aucun symbole ne matche /${symQuery}/${kindFilter ? ` (kind=${kindFilter})` : ''}.`);
  else if (matched > shown) console.log(`\n(${matched} entrées au total — ${MAX} affichées ; affinez la regex ou ajoutez --kind)`);
}

function queryFile() {
  const idx = loadIndex();
  const want = fileQuery.replace(/\\/g, '/');
  const match = (f) => f === want || f.endsWith('/' + want) || path.basename(f) === want;
  const per = {};
  for (const g of GROUPS) per[g] = idx.index[g].filter((e) => match(e.file));
  const total = GROUPS.reduce((n, g) => n + per[g].length, 0);
  if (!total) { console.error(`Aucune entrée pour « ${fileQuery} » (nom exact ou basename attendu, ex. battle_main.c).`); process.exit(1); }
  const files = new Set();
  for (const g of GROUPS) for (const e of per[g]) files.add(e.file);
  console.log(`=== ${[...files].join(', ')} — brief chantier ===\n`);
  const st = { declared: 0, referenced: 0, absent: 0 };
  for (const e of per.functions) st[e.port.status]++;
  console.log(`Fonctions : ${per.functions.length} (portées ${st.declared} · référencées ${st.referenced} · absentes ${st.absent})`);
  for (const e of per.functions) {
    const mark = e.port.status === 'declared' ? (e.port.variant ? '≈' : '✓') : e.port.wireTodo ? '○' : e.port.status === 'referenced' ? '·' : '✗';
    const where = e.port.decls ? ` → ${e.port.decls[0]}${e.port.decls.length > 1 ? ` (+${e.port.decls.length - 1})` : ''}` : '';
    console.log(`  [${mark}] ${e.name} (:${e.line})${e.extra.static ? ' static' : ''}${where}`);
  }
  console.log('  (✓ déclaré exact · ≈ drift _nom/_Manual · ○ wireTodo · · référencé · ✗ absent)');
  for (const g of ['globals', 'defines', 'enums', 'types', 'data']) {
    if (!per[g].length) continue;
    const s = { declared: 0, referenced: 0, absent: 0 };
    for (const e of per[g]) s[e.port.status]++;
    console.log(`\n${g} : ${per[g].length} (portés ${s.declared} · référencés ${s.referenced} · absents ${s.absent})`);
    const absents = per[g].filter((e) => e.port.status === 'absent').slice(0, 15);
    for (const e of absents) console.log(`  [✗] ${e.name} (:${e.line})`);
    const nAbs = per[g].filter((e) => e.port.status === 'absent').length;
    if (nAbs > 15) console.log(`  … +${nAbs - 15} absents (voir --sym avec --kind)`);
  }
}

function queryDupes() {
  const idx = loadIndex();
  const dupes = computeDupes(idx.index);
  const tsOnly = idx.tsOnlyDupes || [];
  console.log(`Doublons TS : ${dupes.total} symboles décomp déclarés dans 2+ fichiers du port (+ ${tsOnly.length} hors-décomp)`);
  console.log(`  vraies dupes (2+ miroir) : ${dupes.vraies.length}`);
  console.log(`  miroir + harness         : ${dupes.mixtes.length}`);
  console.log(`  harness uniquement       : ${dupes.harness.length}`);
  console.log(`  hors-décomp (inventions) : ${tsOnly.filter((r) => !r.shim && !r.name.startsWith('_')).length} pleins + ${tsOnly.filter((r) => r.shim).length} wrappers _Nom + ${tsOnly.filter((r) => !r.shim && r.name.startsWith('_')).length} helpers\n`);
  const show = (title, rows) => {
    console.log(`--- ${title} (${rows.length}${rows.length > 40 ? ', 40 premiers' : ''}) ---`);
    for (const r of rows.slice(0, 40)) console.log(`  ${r.name} [${r.kinds.join(',')}]\n    ${r.decls.join('\n    ')}`);
    console.log('');
  };
  show('VRAIES DUPES', dupes.vraies.filter((r) => r.kinds.some((k) => k === 'function' || k === 'global' || k === 'data_label')));
  console.log(`Rapport complet (constantes incluses) : ${path.relative(REPO, OUT_DUPES)}`);
}

// ─── main ────────────────────────────────────────────────────────────────────
if (!isQuery) {
  generate();
} else if (symQuery) {
  querySym();
} else if (fileQuery) {
  queryFile();
} else if (dupesMode) {
  queryDupes();
}
