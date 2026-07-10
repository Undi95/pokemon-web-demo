/**
 * scripts/m4a-data/mplay-assembler.cjs — mini-assembleur GNU as pour les .s
 * de chansons mp2k générés par mid2agb (directives effectivement émises :
 * .include/.equ/.section/.global/.align/.byte/.word/.end + labels + @comm).
 * Résout les symboles de sound/MPlayDef.s (chaîne de .equ) et les externes
 * (voicegroupXXX) via une map fournie par l'appelant.
 *
 * API : assemble(sText, { mplayDefText, headerAddr, externs })
 *   → { bytes: Buffer, base, headerOffset, size, labels: Map }
 * headerAddr = adresse ROM du label .global (le SongHeader) ; la base du blob
 * est déduite : base = headerAddr - offset(label global). Les labels/word
 * valent base+offset (adresses ROM absolues, identiques au link décomp).
 */
'use strict';

// Évalue une expression gas : ident | nombre | expr (+|-|*|/) expr,
// précédence C (* / avant + -), associativité gauche, division entière.
function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (c === ' ' || c === '\t') { i++; continue; }
    if (c === '+' || c === '-' || c === '*' || c === '/') { tokens.push(c); i++; continue; }
    if (/[0-9]/.test(c)) {
      let j = i;
      if (expr.startsWith('0x', i) || expr.startsWith('0X', i)) {
        j = i + 2;
        while (j < expr.length && /[0-9a-fA-F]/.test(expr[j])) j++;
        tokens.push(parseInt(expr.slice(i, j), 16));
      } else {
        while (j < expr.length && /[0-9]/.test(expr[j])) j++;
        tokens.push(parseInt(expr.slice(i, j), 10));
      }
      i = j;
      continue;
    }
    if (/[A-Za-z_.]/.test(c)) {
      let j = i;
      while (j < expr.length && /[A-Za-z0-9_.]/.test(expr[j])) j++;
      tokens.push({ ident: expr.slice(i, j) });
      i = j;
      continue;
    }
    throw new Error(`assembler: caractère inattendu '${c}' dans "${expr}"`);
  }
  return tokens;
}

function evalExpr(expr, lookup) {
  const tokens = tokenize(expr);
  let pos = 0;

  function primary() {
    let sign = 1;
    while (tokens[pos] === '+' || tokens[pos] === '-') {
      if (tokens[pos] === '-') sign = -sign;
      pos++;
    }
    const t = tokens[pos++];
    if (typeof t === 'number') return sign * t;
    if (t && typeof t === 'object') return sign * lookup(t.ident);
    throw new Error(`assembler: expression invalide "${expr}"`);
  }

  function term() {
    let v = primary();
    while (tokens[pos] === '*' || tokens[pos] === '/') {
      const op = tokens[pos++];
      const rhs = primary();
      v = op === '*' ? v * rhs : Math.trunc(v / rhs);
    }
    return v;
  }

  function sum() {
    let v = term();
    while (tokens[pos] === '+' || tokens[pos] === '-') {
      const op = tokens[pos++];
      const rhs = term();
      v = op === '+' ? v + rhs : v - rhs;
    }
    return v;
  }

  const v = sum();
  if (pos !== tokens.length) throw new Error(`assembler: reste après expression "${expr}"`);
  return v;
}

// Retire le commentaire gas (@ jusqu'à fin de ligne).
function stripComment(line) {
  const at = line.indexOf('@');
  return (at >= 0 ? line.slice(0, at) : line).trim();
}

// Parse un fichier de .equ (MPlayDef.s) dans une map name→value.
function parseEquFile(text, symbols) {
  for (const raw of text.split('\n')) {
    const line = stripComment(raw);
    if (!line) continue;
    const m = line.match(/^\.equ\s+([A-Za-z_][A-Za-z0-9_]*)\s*,\s*(.+)$/);
    if (!m) continue; // MPlayDef.s ne contient que des .equ et commentaires
    symbols.set(m[1], evalExpr(m[2], (name) => {
      if (!symbols.has(name)) throw new Error(`assembler: symbole inconnu ${name} (MPlayDef)`);
      return symbols.get(name);
    }));
  }
}

function assemble(sText, { mplayDefText, headerAddr, externs = {} }) {
  const symbols = new Map(); // .equ (MPlayDef + locaux) — valeurs immédiates
  const labels = new Map(); // label → offset
  let globalLabel = null;

  // Directives dans l'ordre, pour la passe 2 : {kind, exprs|expr|n}
  const items = [];
  let offset = 0;

  const pendingEqus = []; // .equ locaux référencant des externes → différés

  for (const raw of sText.split('\n')) {
    const line = stripComment(raw);
    if (!line) continue;

    const labelMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*):$/);
    if (labelMatch) {
      labels.set(labelMatch[1], offset);
      continue;
    }

    if (line.startsWith('.include')) {
      parseEquFile(mplayDefText, symbols);
      continue;
    }

    const equMatch = line.match(/^\.equ\s+([A-Za-z_][A-Za-z0-9_]*)\s*,\s*(.+)$/);
    if (equMatch) {
      // Différé : peut référencer un externe (voicegroup) ou un symbole MPlayDef
      // pas encore inclus — résolu en passe 2.
      pendingEqus.push([equMatch[1], equMatch[2]]);
      continue;
    }

    if (line.startsWith('.global')) {
      globalLabel = line.replace('.global', '').trim();
      continue;
    }
    if (line.startsWith('.section') || line.startsWith('.end')) continue;

    const alignMatch = line.match(/^\.align\s+(\d+)$/);
    if (alignMatch) {
      const align = 1 << parseInt(alignMatch[1], 10);
      const pad = (align - (offset % align)) % align;
      if (pad) {
        items.push({ kind: 'pad', n: pad });
        offset += pad;
      }
      continue;
    }

    const byteMatch = line.match(/^\.byte\s+(.*)$/);
    if (byteMatch) {
      const exprs = byteMatch[1].split(',').map((s) => s.trim()).filter((s) => s.length);
      items.push({ kind: 'byte', exprs });
      offset += exprs.length;
      continue;
    }

    const wordMatch = line.match(/^\.word\s+(.*)$/);
    if (wordMatch) {
      items.push({ kind: 'word', expr: wordMatch[1].trim() });
      offset += 4;
      continue;
    }

    throw new Error(`assembler: ligne non reconnue "${line}"`);
  }

  if (!globalLabel || !labels.has(globalLabel))
    throw new Error('assembler: label .global absent');

  const size = offset;
  const headerOffset = labels.get(globalLabel);
  const base = headerAddr - headerOffset;

  // Résolution complète : locaux différés puis émission.
  const lookup = (name) => {
    if (symbols.has(name)) return symbols.get(name);
    if (labels.has(name)) return base + labels.get(name);
    if (name in externs) return externs[name];
    throw new Error(`assembler: symbole inconnu ${name}`);
  };
  for (const [name, expr] of pendingEqus) symbols.set(name, evalExpr(expr, lookup));

  const bytes = Buffer.alloc(size);
  let o = 0;
  for (const item of items) {
    if (item.kind === 'pad') {
      o += item.n; // déjà zéro
    } else if (item.kind === 'byte') {
      for (const expr of item.exprs) bytes[o++] = evalExpr(expr, lookup) & 0xFF;
    } else {
      bytes.writeUInt32LE(evalExpr(item.expr, lookup) >>> 0, o);
      o += 4;
    }
  }

  return { bytes, base, headerOffset, size, labels };
}

module.exports = { assemble, evalExpr };
