#!/usr/bin/env node
/**
 * lib/expand-composites.cjs — expandeur de macros composites (byte-VM Phase 2).
 *
 * Déplie récursivement une invocation de macro au niveau source (ex.
 * `msgbox Text_X, MSGBOX_DEFAULT`) en une suite d'**opcodes réels** (ceux qui
 * émettent un octet de commande SCR_OP_*), exactement comme l'assembleur GBA :
 *   - substitution des paramètres `\param` (avec valeurs par défaut),
 *   - conditionnels `.if / .ifb / .ifnb / .elseif / .else / .endif`,
 *   - récursion (un composite peut invoquer d'autres composites).
 *
 * Sources : public/decomp/em/script-cmd-table.json (opcodes{} + composites{})
 *           + lib/decomp-constants.cjs (résolution des conditionnels).
 *
 * API : expand(name, args) -> [{name, args:[...]}]  (que des opcodes réels)
 *       expandLine("name a, b") -> idem.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const C = require('./decomp-constants.cjs');

const TABLE = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', '..', 'public/decomp/em/script-cmd-table.json'), 'utf8'));
const OPCODES = TABLE.opcodes;
const COMPOSITES = TABLE.composites;

/** "name a, b, c" -> {name, args:[...]}. Les args gardent leur forme brute. */
function parseInvocation(line) {
  const s = line.trim();
  const sp = s.search(/\s/);
  if (sp === -1) return { name: s, args: [] };
  const name = s.slice(0, sp);
  const rest = s.slice(sp + 1).trim();
  const args = splitArgs(rest);
  return { name, args };
}
/** split par virgules au top-level (respecte parenthèses). */
function splitArgs(s) {
  const out = []; let d = 0, st = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') d++; else if (c === ')') d--;
    else if (c === ',' && d === 0) { out.push(s.slice(st, i).trim()); st = i + 1; }
  }
  const last = s.slice(st).trim();
  if (last !== '' || out.length) out.push(last);
  return out.filter((x, i) => !(x === '' && i === out.length - 1 && out.length > 1) || x !== '');
}

/** Substitue les \param d'une string par leur valeur depuis `sub`. */
function substitute(str, sub) {
  return str.replace(/\\(\w+)/g, (m, p) => (sub[p] !== undefined ? sub[p] : ''));
}

/** Évalue une condition `.if`/`.elseif` (déjà substituée). */
function evalCondition(expr) {
  return evalOr(expr.trim());
}
/** retire toute paire de parenthèses englobant TOUTE la chaîne (répété). */
function stripParens(s) {
  s = s.trim();
  while (s[0] === '(') {
    let d = 0, j = -1;
    for (let i = 0; i < s.length; i++) { if (s[i] === '(') d++; else if (s[i] === ')') { if (--d === 0) { j = i; break; } } }
    if (j === s.length - 1) s = s.slice(1, -1).trim(); else break;
  }
  return s;
}
function evalOr(s) {
  s = stripParens(s);
  const parts = splitTop(s, '||');
  if (parts.length > 1) return parts.some((p) => evalOr(p));
  return evalAnd(s);
}
function evalAnd(s) {
  s = stripParens(s);
  const parts = splitTop(s, '&&');
  if (parts.length > 1) return parts.every((p) => evalOr(p));
  return evalCmp(s);
}
function evalCmp(s) {
  s = stripParens(s);
  // si après déballage il reste des opérateurs logiques top-level, remonter.
  if (splitTop(s, '||').length > 1 || splitTop(s, '&&').length > 1) return evalOr(s);
  const ops = ['==', '!=', '>=', '<=', '>', '<'];
  for (const op of ops) {
    const idx = topIndexOf(s, op);
    if (idx !== -1) {
      const l = num(s.slice(0, idx));
      const r = num(s.slice(idx + op.length));
      switch (op) {
        case '==': return l === r;
        case '!=': return l !== r;
        case '>=': return l >= r;
        case '<=': return l <= r;
        case '>': return l > r;
        case '<': return l < r;
      }
    }
  }
  // pas d'opérateur : vrai si non nul
  return num(s) !== 0;
}
function num(tok) {
  const v = C.resolve(String(tok).trim());
  return v === undefined ? NaN : v;
}
function splitTop(s, op) {
  const parts = []; let d = 0, st = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') d++; else if (s[i] === ')') d--;
    else if (d === 0 && s.startsWith(op, i)) { parts.push(s.slice(st, i)); st = i + op.length; i += op.length - 1; }
  }
  parts.push(s.slice(st));
  return parts.map((x) => x.trim());
}
function topIndexOf(s, op) {
  let d = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') d++; else if (s[i] === ')') d--;
    else if (d === 0 && s.startsWith(op, i)) {
      // ne pas confondre '>' avec '>=' / '<' avec '<='
      if ((op === '>' || op === '<') && s[i + 1] === '=') continue;
      return i;
    }
  }
  return -1;
}

/** Expanse une invocation -> liste d'opcodes réels. */
function expand(name, args, depth = 0) {
  if (depth > 40) throw new Error(`expansion trop profonde @ ${name}`);

  // Base : opcode réel (émet un SCR_OP_*). On le rend tel quel.
  if (OPCODES[name]) return [{ name, args: args.slice() }];

  const comp = COMPOSITES[name];
  if (!comp) {
    // ni opcode réel ni composite connu -> remonté tel quel (sera signalé en amont).
    return [{ name, args: args.slice(), unknown: true }];
  }

  // map params -> valeurs (défauts si arg absent)
  const sub = Object.create(null);
  comp.params.forEach((p, i) => {
    sub[p.name] = (args[i] !== undefined && args[i] !== '') ? args[i]
      : (p.def !== undefined ? p.def : '');
  });

  const out = [];
  // pile de conditionnels : {active, taken} (taken = une branche a déjà matché)
  const cond = [{ active: true, taken: true }];
  const isActive = () => cond.every((c) => c.active);

  for (const rawLine of comp.body) {
    // retire les commentaires `@ …` (ex. `@ no value provided`) + espaces
    const at = rawLine.indexOf('@');
    const line = (at === -1 ? rawLine : rawLine.slice(0, at)).trim();
    if (line === '') continue;

    // directives de contrôle conditionnel
    let m;
    if ((m = line.match(/^\.ifb\s+(.+)$/))) {
      const v = substitute(m[1].trim(), sub);
      const isBlank = v === '';
      cond.push({ active: isBlank, taken: isBlank });
      continue;
    }
    if ((m = line.match(/^\.ifnb\s+(.+)$/))) {
      const v = substitute(m[1].trim(), sub);
      const nonBlank = v !== '';
      cond.push({ active: nonBlank, taken: nonBlank });
      continue;
    }
    if ((m = line.match(/^\.if\s+(.+)$/))) {
      const r = isActiveParent() && evalCondition(substitute(m[1].trim(), sub));
      cond.push({ active: r, taken: r });
      continue;
    }
    if ((m = line.match(/^\.elseif\s+(.+)$/))) {
      const top = cond[cond.length - 1];
      if (top.taken) { top.active = false; }
      else { const r = isActiveParent() && evalCondition(substitute(m[1].trim(), sub)); top.active = r; top.taken = r; }
      continue;
    }
    if (/^\.else\b/.test(line)) {
      const top = cond[cond.length - 1];
      top.active = isActiveParent() && !top.taken;
      top.taken = true;
      continue;
    }
    if (/^\.endif\b/.test(line)) { cond.pop(); continue; }

    if (!isActive()) continue;

    // directives inertes
    if (/^\.(set|warning|error|align|global|purgem)\b/.test(line)) continue;

    // émission de données brutes dans un composite (rare : pokemartlistend)
    if (/^\.(byte|2byte|4byte)\b/.test(line)) {
      out.push({ name: '__raw', args: [line] });
      continue;
    }

    // invocation de (sous-)macro : substitue puis recurse
    const subbed = substitute(line, sub);
    const inv = parseInvocation(subbed);
    if (!inv.name) continue;
    for (const op of expand(inv.name, inv.args, depth + 1)) out.push(op);
  }
  return out;

  function isActiveParent() { return cond.slice(0, -1).every((c) => c.active); }
}

function expandLine(line) {
  const inv = parseInvocation(line);
  return expand(inv.name, inv.args);
}

module.exports = { expand, expandLine, OPCODES, COMPOSITES };

// Self-test
if (require.main === module) {
  const cases = [
    'msgbox AbandonedShip_Text_X, MSGBOX_DEFAULT',
    'goto_if_set FLAG_X, Some_Label',
    'goto_if_eq VAR_RESULT, TRUE, Some_Label',
    'goto_if_eq Some_Label',
    'giveitem ITEM_POTION, 5',
    'frontier_get FRONTIER_DATA_BATTLE_NUM',
    'frontier_set FRONTIER_DATA_CHALLENGE_STATUS, 1',
    'frontier_set FRONTIER_DATA_PAUSED',
    'register_matchcall TRAINER_X',
    'switch VAR_0x8004',
    'case 3, Some_Label',
    'trainerhill_start',
  ];
  for (const c of cases) {
    const ops = expandLine(c);
    const desc = ops.map((o) => o.unknown ? `?${o.name}` : `${o.name}(${o.args.join('|')})`).join('  ');
    console.log(`\n${c}\n  -> ${desc}`);
  }
}
