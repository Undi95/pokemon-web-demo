#!/usr/bin/env node
/**
 * Parse les `.pal` JASC du décomp (text_window + autres) pour produire
 * public/decomp/em/palettes.json.
 *
 * Format JASC-PAL :
 *   JASC-PAL
 *   0100
 *   N
 *   R G B
 *   R G B
 *   ...
 *
 * Sortie :
 *   { "text_pal1": { colors: [[r,g,b], ...16 entries] }, ... }
 *
 * Cf. WINDOWS_BOXES_REFERENCE.md pour les palettes utilisées.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outPath = join(projectRoot, 'public', 'decomp', 'em', 'palettes.json');
mkdirSync(dirname(outPath), { recursive: true });

/** Parse un .pal JASC. Retourne null si format invalide. */
function parseJascPal(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines[0] !== 'JASC-PAL') return null;
  // lines[1] = '0100' (version), lines[2] = N (count)
  const count = Number(lines[2]);
  if (!Number.isInteger(count) || count <= 0 || count > 256) return null;
  const colors = [];
  for (let i = 3; i < 3 + count && i < lines.length; i++) {
    const [r, g, b] = lines[i].split(/\s+/).map(Number);
    if ([r, g, b].some(n => !Number.isFinite(n))) continue;
    colors.push([r, g, b]);
  }
  return { colors };
}

/** Parse un .gbapal binaire (16 couleurs × 2 octets = 32 bytes ; chaque
 *  couleur est un u16 little-endian au format BGR 5-bit (BBBBBGGGGGRRRRR)). */
function parseGbaPal(buf) {
  const colors = [];
  for (let i = 0; i + 1 < buf.length && colors.length < 16; i += 2) {
    const v = buf[i] | (buf[i + 1] << 8);
    const r = (v & 0x1F) << 3;
    const g = ((v >> 5) & 0x1F) << 3;
    const b = ((v >> 10) & 0x1F) << 3;
    colors.push([r, g, b]);
  }
  return { colors };
}

const out = {};

// Scan répertoires connus du décomp pour .pal et .gbapal
const SCAN_DIRS = [
  'graphics/text_window',
  'graphics/interface',
  'graphics/fonts',
];

for (const dir of SCAN_DIRS) {
  const full = join(decompPath, dir);
  if (!existsSync(full)) continue;
  for (const f of readdirSync(full)) {
    const ext = extname(f).toLowerCase();
    const name = basename(f, ext);
    const filePath = join(full, f);
    if (ext === '.pal') {
      const text = readFileSync(filePath, 'utf8');
      const pal = parseJascPal(text);
      if (pal) out[name] = pal;
    } else if (ext === '.gbapal') {
      const buf = readFileSync(filePath);
      const pal = parseGbaPal(buf);
      if (pal.colors.length > 0) out[name] = pal;
    }
  }
}

writeFileSync(outPath, JSON.stringify(out));
console.log('[palettes]', {
  count: Object.keys(out).length,
  sample: Object.keys(out).slice(0, 8),
  output: outPath
});
