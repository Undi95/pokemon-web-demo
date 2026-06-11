// extract-battle-anim-sprites.mjs — PHASE 0 roadmap anims 1:1 (2026-06-11).
// Extrait AUTOMATIQUEMENT depuis la décomp (zéro recopie manuelle) :
//   - les tables AnimCmd (ANIMCMD_FRAME/END/END_ALT/JUMP/LOOP, flags .hFlip/.vFlip)
//   - les tables AffineAnimCmd (AFFINEANIMCMD_FRAME/END/END_ALT/JUMP/LOOP)
//   - les ref-tables (AnimCmd *const / AffineAnimCmd *const)
//   - les SpriteTemplates (const struct SpriteTemplate gXxx/sXxx — static OU non)
//   - les OamData partagés (src/data/battle_anim.h : gOamData_*)
// des 26 fichiers battle_anim_*.c + src/data/battle_anim.h.
// Émission : src/engine/decomp-data/auto/src/battle-anim-sprites.ts
//   aux FORMATS DES MOTEURS EXISTANTS (sprite-animation.ts AnimCmd /
//   sprite-affine-extras.ts AffineAnim) ; templates avec refs PAR NOM
//   (callback résolu au runtime par le registry).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompRoot = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outDir = resolve(projectRoot, 'src', 'engine', 'decomp-data', 'auto', 'src');
const outFile = join(outDir, 'battle-anim-sprites.ts');

const SOURCES = [
  'src/battle_anim.c',
  'src/battle_anim_mons.c',
  'src/battle_anim_mon_movement.c',
  'src/battle_anim_effects_1.c',
  'src/battle_anim_effects_2.c',
  'src/battle_anim_effects_3.c',
  'src/battle_anim_normal.c',
  'src/battle_anim_fire.c',
  'src/battle_anim_water.c',
  'src/battle_anim_electric.c',
  'src/battle_anim_ice.c',
  'src/battle_anim_fight.c',
  'src/battle_anim_poison.c',
  'src/battle_anim_ground.c',
  'src/battle_anim_flying.c',
  'src/battle_anim_psychic.c',
  'src/battle_anim_bug.c',
  'src/battle_anim_rock.c',
  'src/battle_anim_ghost.c',
  'src/battle_anim_dragon.c',
  'src/battle_anim_dark.c',
  'src/battle_anim_utility_funcs.c',
  'src/battle_anim_sound_tasks.c',
  'src/battle_anim_status_effects.c',
  'src/battle_anim_throw.c',
  'src/battle_anim_smokescreen.c',
  'src/data/battle_anim.h',
];

mkdirSync(outDir, { recursive: true });

// ─── Helpers ────────────────────────────────────────────────────────────────
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}
function findMatchingBrace(src, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) return i; }
  }
  return -1;
}
function* iterDecls(src, re) {
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(src)) !== null) {
    const open = src.indexOf('{', re.lastIndex - 1);
    if (open < 0) continue;
    const close = findMatchingBrace(src, open);
    if (close < 0) continue;
    yield { name: m[1], body: src.slice(open + 1, close) };
    re.lastIndex = close;
  }
}
function parseFields(body) {
  const out = {};
  const re = /\.(\w+)\s*=\s*([^,}]+)/g;
  let m;
  while ((m = re.exec(body)) !== null) out[m[1]] = m[2].trim();
  return out;
}
function num(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  if (/^-?0x[0-9a-fA-F]+$/.test(s)) return parseInt(s, 16);
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  // expressions simples a/b ou a*b (les vitesses 32/10 des scripts ne passent
  // pas ici — les tables C n'en ont pas ; garde-fou quand même)
  const div = s.match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if (div) return Math.trunc(parseInt(div[1], 10) / parseInt(div[2], 10));
  return null;
}

// ─── AnimCmd ────────────────────────────────────────────────────────────────
// static const union AnimCmd NAME[] = / const union AnimCmd NAME[] =
const RE_ANIM = /(?:static\s+)?const\s+union\s+AnimCmd\s+(\w+)\s*\[\s*\]\s*=\s*/g;
function parseAnimCmds(body, name) {
  const cmds = [];
  const re = /(ANIMCMD_FRAME|ANIMCMD_END_ALT|ANIMCMD_END|ANIMCMD_JUMP|ANIMCMD_LOOP)\s*(?:\(\s*([^)]*)\s*\))?/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const op = m[1];
    const args = (m[2] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    if (op === 'ANIMCMD_FRAME') {
      const imageValue = num(args[0]);
      const duration = num(args[1]);
      if (imageValue === null || duration === null) {
        console.warn(`[anim ${name}] args non num: ${args.join(',')}`);
        continue;
      }
      const hFlip = args.some((a) => /\.hFlip\s*=\s*TRUE/.test(a) || a === 'TRUE' && args.indexOf(a) === 2);
      const vFlip = args.some((a) => /\.vFlip\s*=\s*TRUE/.test(a));
      cmds.push({ kind: 'frame', imageValue, duration, hFlip, vFlip });
    } else if (op === 'ANIMCMD_END' || op === 'ANIMCMD_END_ALT') {
      cmds.push({ kind: 'end' });
    } else if (op === 'ANIMCMD_JUMP') {
      cmds.push({ kind: 'jump', target: num(args[0]) ?? 0 });
    } else if (op === 'ANIMCMD_LOOP') {
      cmds.push({ kind: 'loop', count: num(args[0]) ?? 0 });
    }
  }
  return cmds;
}

// ─── AffineAnimCmd ──────────────────────────────────────────────────────────
const RE_AFFINE = /(?:static\s+)?const\s+union\s+AffineAnimCmd\s+(\w+)\s*\[\s*\]\s*=\s*/g;
function parseAffineCmds(body, name) {
  const frames = [];
  let terminator = 'END';
  const re = /(AFFINEANIMCMD_FRAME|AFFINEANIMCMD_END_ALT|AFFINEANIMCMD_END|AFFINEANIMCMD_JUMP|AFFINEANIMCMD_LOOP)\s*(?:\(\s*([^)]*)\s*\))?/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const op = m[1];
    const args = (m[2] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    if (op === 'AFFINEANIMCMD_FRAME') {
      const xScale = num(args[0]);
      const yScale = num(args[1]);
      const rotation = num(args[2]);
      const duration = num(args[3]);
      if ([xScale, yScale, rotation, duration].some((v) => v === null)) {
        console.warn(`[affine ${name}] args non num: ${args.join(',')}`);
        continue;
      }
      frames.push({ xScale, yScale, rotation, duration });
    } else if (op === 'AFFINEANIMCMD_JUMP') {
      terminator = `JUMP:${num(args[0]) ?? 0}`;
    } else if (op === 'AFFINEANIMCMD_LOOP') {
      terminator = `LOOP:${num(args[0]) ?? 0}`;
    } else {
      terminator = 'END';
    }
  }
  return { frames, terminator };
}

// ─── Ref tables (AnimCmd *const / AffineAnimCmd *const) ────────────────────
const RE_ANIM_TABLE = /(?:static\s+)?const\s+union\s+AnimCmd\s*\*\s*const\s+(\w+)\s*\[[^\]]*\]\s*=\s*/g;
const RE_AFFINE_TABLE = /(?:static\s+)?const\s+union\s+AffineAnimCmd\s*\*\s*const\s+(\w+)\s*\[[^\]]*\]\s*=\s*/g;
function parseRefTable(body) {
  return body.split(',').map((s) => s.trim()).filter((s) => /^\w+$/.test(s));
}

// ─── SpriteTemplates ────────────────────────────────────────────────────────
const RE_TEMPLATE = /(?:static\s+)?const\s+struct\s+SpriteTemplate\s+(\w+)\s*=\s*/g;

// ─── OamData ────────────────────────────────────────────────────────────────
const RE_OAM = /(?:static\s+)?const\s+struct\s+OamData\s+(\w+)\s*=\s*/g;
function parseOam(body) {
  const f = parseFields(body);
  const out = { affineMode: f.affineMode ?? null, objMode: f.objMode ?? null, shape: null, size: null };
  const sh = (f.shape ?? '').match(/SPRITE_SHAPE\s*\(\s*(\d+)x(\d+)\s*\)/);
  const sz = (f.size ?? '').match(/SPRITE_SIZE\s*\(\s*(\d+)x(\d+)\s*\)/);
  if (sh) {
    const [w, h] = [parseInt(sh[1], 10), parseInt(sh[2], 10)];
    out.shape = w === h ? 0 : (w > h ? 1 : 2);
  }
  if (sz) {
    const [w, h] = [parseInt(sz[1], 10), parseInt(sz[2], 10)];
    const maxd = Math.max(w, h);
    out.size = maxd >= 64 ? 3 : (maxd >= 32 ? 2 : (maxd >= 16 ? 1 : 0));
  }
  return out;
}

// ─── Extraction ─────────────────────────────────────────────────────────────
const anims = {};        // name → AnimCmd[]
const animTables = {};   // name → [animNames]
const affines = {};      // name → {frames, terminator}
const affineTables = {}; // name → [affineNames]
const templates = {};    // name → fields (refs par NOM)
const oams = {};         // name → {shape,size,affineMode,objMode}
const perFile = {};

for (const rel of SOURCES) {
  const path = join(decompRoot, rel);
  let src;
  try { src = stripComments(readFileSync(path, 'utf8')); }
  catch { console.warn(`[skip] ${rel} introuvable`); continue; }
  const stats = { anims: 0, animTables: 0, affines: 0, affineTables: 0, templates: 0, oams: 0 };

  for (const d of iterDecls(src, RE_ANIM)) {
    anims[d.name] = parseAnimCmds(d.body, d.name);
    stats.anims++;
  }
  for (const d of iterDecls(src, RE_ANIM_TABLE)) {
    animTables[d.name] = parseRefTable(d.body);
    stats.animTables++;
  }
  for (const d of iterDecls(src, RE_AFFINE)) {
    affines[d.name] = parseAffineCmds(d.body, d.name);
    stats.affines++;
  }
  for (const d of iterDecls(src, RE_AFFINE_TABLE)) {
    affineTables[d.name] = parseRefTable(d.body);
    stats.affineTables++;
  }
  for (const d of iterDecls(src, RE_TEMPLATE)) {
    const f = parseFields(d.body);
    templates[d.name] = {
      tileTag: f.tileTag ?? null,
      paletteTag: f.paletteTag ?? null,
      oam: (f.oam ?? '').replace(/^&/, '') || null,
      anims: f.anims ?? null,
      affineAnims: f.affineAnims ?? null,
      callback: f.callback ?? null,
      file: rel,
    };
    stats.templates++;
  }
  for (const d of iterDecls(src, RE_OAM)) {
    oams[d.name] = parseOam(d.body);
    stats.oams++;
  }
  perFile[rel] = stats;
}

// ─── Émission TS ────────────────────────────────────────────────────────────
const header = `// AUTO-GÉNÉRÉ par scripts/extract-battle-anim-sprites.mjs — NE PAS ÉDITER.
// Phase 0 roadmap anims 1:1 (docs/ROADMAP-ANIMS-1TO1.md) : les tables const
// des 26 battle_anim_*.c + battle_anim.h, extraites de la décomp (zéro recopie).
// Formats : AnimCmd = sprite-animation.ts ; AffineAnim = sprite-affine-extras.ts.
/* eslint-disable */
`;
let body = '';
body += `export const BATTLE_ANIM_ANIMS = ${JSON.stringify(anims)} as const;\n\n`;
body += `export const BATTLE_ANIM_ANIM_TABLES = ${JSON.stringify(animTables)} as const;\n\n`;
body += `export const BATTLE_ANIM_AFFINE_ANIMS = ${JSON.stringify(affines)} as const;\n\n`;
body += `export const BATTLE_ANIM_AFFINE_TABLES = ${JSON.stringify(affineTables)} as const;\n\n`;
body += `export const BATTLE_ANIM_TEMPLATES = ${JSON.stringify(templates)} as const;\n\n`;
body += `export const BATTLE_ANIM_OAMS = ${JSON.stringify(oams)} as const;\n`;
writeFileSync(outFile, header + body);

// ─── Bilan ──────────────────────────────────────────────────────────────────
const t = (o) => Object.keys(o).length;
console.log('─'.repeat(60));
console.log(`AnimCmd:        ${t(anims)} tables`);
console.log(`AnimTables:     ${t(animTables)}`);
console.log(`AffineAnimCmd:  ${t(affines)}`);
console.log(`AffineTables:   ${t(affineTables)}`);
console.log(`SpriteTemplates:${t(templates)}`);
console.log(`OamData:        ${t(oams)}`);
console.log(`→ ${outFile}`);
