#!/usr/bin/env node
/**
 * Decomp asset extractor.
 *
 * Usage:
 *   node scripts/extract-decomp.mjs <path-to-decomp> <region-prefix>
 *
 * Defaults:
 *   path:   ../decomps/pokeemeraude
 *   prefix: em
 *
 * Output goes to public/decomp/<prefix>/... so files are served as static
 * assets by Vite and fetched at runtime by the game. Nothing is copied into
 * src/ except the extraction summary.
 */
import {
  readFileSync, writeFileSync, mkdirSync, readdirSync,
  copyFileSync, statSync, existsSync
} from 'node:fs';
import { join, dirname, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const args = process.argv.slice(2);
const decompPath = resolve(args[0] ?? resolve(projectRoot, '..', 'decomps', 'pokeemeraude'));
const prefix = args[1] ?? 'em';
const outRoot = join(projectRoot, 'public', 'decomp', prefix);
const summaryPath = join(projectRoot, 'src', 'decomp', `${prefix}-summary.json`);

if (!existsSync(decompPath)) {
  console.error(`[extract] decomp path not found: ${decompPath}`);
  process.exit(1);
}
console.log(`[extract] source: ${decompPath}`);
console.log(`[extract] target: ${outRoot}`);

const ensure = (d) => mkdirSync(d, { recursive: true });
const copy = (from, to) => { ensure(dirname(to)); copyFileSync(from, to); };
const writeJson = (p, data) => { ensure(dirname(p)); writeFileSync(p, JSON.stringify(data, null, 2)); };

const stats = {
  maps: 0,
  layouts: 0,
  tilesetsPrimary: 0,
  tilesetsSecondary: 0,
  pokemonSprites: 0,
  npcSpriteSets: 0,
  trainerFrontPics: 0,
  trainerBackPics: 0,
  objectEventPalettes: 0,
  skipped: []
};

// 1. Layouts master index
const layoutsJsonPath = join(decompPath, 'data', 'layouts', 'layouts.json');
if (existsSync(layoutsJsonPath)) {
  const layoutsIndex = JSON.parse(readFileSync(layoutsJsonPath, 'utf8'));
  writeJson(join(outRoot, 'layouts-index.json'), layoutsIndex);
  console.log(`[extract] layouts-index: ${(layoutsIndex.layouts || []).length} layouts`);
} else {
  stats.skipped.push('layouts.json not found');
}

// 2. Per-layout binary data (map.bin + border.bin)
const layoutsDir = join(decompPath, 'data', 'layouts');
if (existsSync(layoutsDir)) {
  for (const name of readdirSync(layoutsDir)) {
    const srcDir = join(layoutsDir, name);
    if (!statSync(srcDir).isDirectory()) continue;
    const mapBin = join(srcDir, 'map.bin');
    if (!existsSync(mapBin)) continue;
    copy(mapBin, join(outRoot, 'layouts', name, 'map.bin'));
    const borderBin = join(srcDir, 'border.bin');
    if (existsSync(borderBin)) {
      copy(borderBin, join(outRoot, 'layouts', name, 'border.bin'));
    }
    stats.layouts++;
  }
}

// 3. Map events (map.json) — copied as-is, contains NPCs/warps/signs
// Aussi : construit un index MAP_ID → dir name pour que le runtime puisse
// résoudre les warps (dest_map est un MAP_ID constant).
const mapsDir = join(decompPath, 'data', 'maps');
const mapIdToDir = {};
if (existsSync(mapsDir)) {
  for (const name of readdirSync(mapsDir)) {
    const mapJsonPath = join(mapsDir, name, 'map.json');
    if (!existsSync(mapJsonPath)) continue;
    copy(mapJsonPath, join(outRoot, 'maps', `${name}.json`));
    stats.maps++;
    try {
      const parsed = JSON.parse(readFileSync(mapJsonPath, 'utf8'));
      if (parsed.id) mapIdToDir[parsed.id] = name;
    } catch { /* ignore malformed */ }
  }
  writeJson(join(outRoot, 'map-ids.json'), mapIdToDir);
}

// 4. Tilesets (primary + secondary)
function copyTileset(kind, name) {
  const src = join(decompPath, 'data', 'tilesets', kind, name);
  if (!existsSync(src) || !statSync(src).isDirectory()) return false;
  const dst = join(outRoot, 'tilesets', kind, name);
  let any = false;
  for (const f of ['tiles.png', 'metatiles.bin', 'metatile_attributes.bin']) {
    const srcFile = join(src, f);
    if (existsSync(srcFile)) { copy(srcFile, join(dst, f)); any = true; }
  }
  const palDir = join(src, 'palettes');
  if (existsSync(palDir)) {
    for (const p of readdirSync(palDir)) {
      const srcPal = join(palDir, p);
      if (statSync(srcPal).isFile()) copy(srcPal, join(dst, 'palettes', p));
    }
    any = true;
  }
  return any;
}
for (const kind of ['primary', 'secondary']) {
  const kdir = join(decompPath, 'data', 'tilesets', kind);
  if (!existsSync(kdir)) continue;
  for (const name of readdirSync(kdir)) {
    if (!statSync(join(kdir, name)).isDirectory()) continue;
    if (copyTileset(kind, name)) {
      if (kind === 'primary') stats.tilesetsPrimary++;
      else stats.tilesetsSecondary++;
    }
  }
}

// 5. Pokémon sprites + palettes
const monDir = join(decompPath, 'graphics', 'pokemon');
if (existsSync(monDir)) {
  for (const species of readdirSync(monDir)) {
    const src = join(monDir, species);
    if (!statSync(src).isDirectory()) continue;
    const dst = join(outRoot, 'pokemon', species);
    let any = false;
    for (const f of [
      'front.png', 'back.png', 'anim_front.png',
      'icon.png', 'footprint.png', 'normal.pal', 'shiny.pal'
    ]) {
      if (existsSync(join(src, f))) { copy(join(src, f), join(dst, f)); any = true; }
    }
    if (any) stats.pokemonSprites++;
  }
}

// 6. Object-event (overworld NPC) sprites — toutes les catégories
// pics/ contient : people/ + pokemon/ + berry_trees/ + dolls/ + cushions/ + misc/
// Le mapping object-event-graphics.json référence n'importe laquelle de ces catégories.
const picsRoot = join(decompPath, 'graphics', 'object_events', 'pics');
if (existsSync(picsRoot)) {
  for (const category of readdirSync(picsRoot)) {
    const catDir = join(picsRoot, category);
    if (!statSync(catDir).isDirectory()) continue;
    for (const name of readdirSync(catDir)) {
      const src = join(catDir, name);
      const st = statSync(src);
      if (st.isFile() && name.endsWith('.png')) {
        copy(src, join(outRoot, 'object_events', category, name));
        stats.npcSpriteSets++;
      } else if (st.isDirectory()) {
        const dst = join(outRoot, 'object_events', category, name);
        let any = false;
        for (const f of readdirSync(src)) {
          if (f.endsWith('.png')) { copy(join(src, f), join(dst, f)); any = true; }
        }
        if (any) stats.npcSpriteSets++;
      }
    }
  }
}
const oePalDir = join(decompPath, 'graphics', 'object_events', 'palettes');
if (existsSync(oePalDir)) {
  for (const p of readdirSync(oePalDir)) {
    const s = join(oePalDir, p);
    if (statSync(s).isFile()) { copy(s, join(outRoot, 'object_events', 'palettes', p)); stats.objectEventPalettes++; }
  }
}

// 7. Trainer front/back pics (portraits)
for (const kind of ['front_pics', 'back_pics']) {
  const src = join(decompPath, 'graphics', 'trainers', kind);
  if (!existsSync(src)) continue;
  for (const f of readdirSync(src)) {
    const full = join(src, f);
    if (statSync(full).isFile() && f.endsWith('.png')) {
      copy(full, join(outRoot, 'trainers', kind, f));
      if (kind === 'front_pics') stats.trainerFrontPics++;
      else stats.trainerBackPics++;
    }
  }
}

// 8. Music — MIDI files (ready to play in browser)
stats.midiFiles = 0;
const midiDir = join(decompPath, 'sound', 'songs', 'midi');
if (existsSync(midiDir)) {
  for (const f of readdirSync(midiDir)) {
    if (f.endsWith('.mid')) {
      copy(join(midiDir, f), join(outRoot, 'music', f));
      stats.midiFiles++;
    }
  }
}

// 8bis. UI — text_window frames, fonts, charmap (pour la dialogue authentique)
const tw = join(decompPath, 'graphics', 'text_window');
if (existsSync(tw)) {
  for (const f of readdirSync(tw)) {
    const s = join(tw, f);
    if (statSync(s).isFile() && f.endsWith('.png')) copy(s, join(outRoot, 'ui', 'text_window', f));
  }
}
const fontsDir = join(decompPath, 'graphics', 'fonts');
if (existsSync(fontsDir)) {
  for (const f of readdirSync(fontsDir)) {
    const s = join(fontsDir, f);
    if (statSync(s).isFile() && f.endsWith('.png')) copy(s, join(outRoot, 'ui', 'fonts', f));
  }
}
// UI interface complète (curseur, menus, etc.)
const uiDir = join(decompPath, 'graphics', 'interface');
if (existsSync(uiDir)) {
  for (const f of readdirSync(uiDir)) {
    const src = join(uiDir, f);
    if (statSync(src).isFile() && (f.endsWith('.png') || f.endsWith('.pal'))) {
      copy(src, join(outRoot, 'ui', 'interface', f));
    }
  }
}
// Assets de la séquence de boot (intro → title → main menu → birch → naming)
for (const section of ['intro', 'title_screen', 'birch_speech', 'naming_screen']) {
  const dir = join(decompPath, 'graphics', section);
  if (!existsSync(dir)) continue;
  function walkCopy(d, rel = '') {
    for (const f of readdirSync(d)) {
      const src = join(d, f);
      const st = statSync(src);
      if (st.isDirectory()) walkCopy(src, join(rel, f));
      else if (f.endsWith('.png') || f.endsWith('.pal') || f.endsWith('.bin')) {
        // .bin = tilemap raw (rayquaza.bin/clouds.bin/pokemon_logo.bin etc.)
        // Nécessaire pour rendu BG via engine GBA (pas juste PNG composés).
        copy(src, join(outRoot, 'boot', section, rel, f));
      }
    }
  }
  walkCopy(dir);
}
// Door animation sprites (16×96 chacune = 6 frames de 16×16)
const doorsDir = join(decompPath, 'graphics', 'door_anims');
if (existsSync(doorsDir)) {
  for (const f of readdirSync(doorsDir)) {
    const s = join(doorsDir, f);
    if (statSync(s).isFile() && f.endsWith('.png')) copy(s, join(outRoot, 'ui', 'doors', f));
  }
}
// Animations de tiles (flower, water, waterfall) — pour plus tard
for (const kind of ['primary', 'secondary']) {
  const kdir = join(decompPath, 'data', 'tilesets', kind);
  if (!existsSync(kdir)) continue;
  for (const tsName of readdirSync(kdir)) {
    const animDir = join(kdir, tsName, 'anim');
    if (!existsSync(animDir)) continue;
    for (const group of readdirSync(animDir)) {
      const gDir = join(animDir, group);
      if (!statSync(gDir).isDirectory()) continue;
      for (const f of readdirSync(gDir)) {
        if (f.endsWith('.png')) copy(join(gDir, f), join(outRoot, 'tilesets', kind, tsName, 'anim', group, f));
      }
    }
  }
}
const charmapPath = join(decompPath, 'charmap.txt');
if (existsSync(charmapPath)) {
  const text = readFileSync(charmapPath, 'utf8');
  const map = {};
  // Gère les caractères échappés comme '\'' (apostrophe) et '\\' (backslash).
  const re = /'(\\.|[^'])+'\s*=\s*([0-9A-Fa-f]{1,4})/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    let key = m[0].match(/'(\\.|[^']+)'/)?.[1] ?? '';
    if (key === "\\'") key = "'";
    else if (key === '\\\\') key = '\\';
    map[key] = parseInt(m[2], 16);
  }
  // Fallback : si l'apostrophe ASCII n'a pas été captée, la mapper vers la
  // version typographique "droite" (U+2019 = B4 dans Emeraude).
  if (map["'"] === undefined && map['\u2019'] !== undefined) map["'"] = map['\u2019'];
  writeJson(join(outRoot, 'ui', 'charmap.json'), map);
}

// 9. Sound effects — WAV samples
stats.wavSamples = 0;
const samplesDir = join(decompPath, 'sound', 'direct_sound_samples');
if (existsSync(samplesDir)) {
  for (const f of readdirSync(samplesDir)) {
    const full = join(samplesDir, f);
    if (statSync(full).isFile() && f.endsWith('.wav')) {
      copy(full, join(outRoot, 'sfx', f));
      stats.wavSamples++;
    }
  }
  // Cries (Pokémon voices) — in a subdir
  const criesDir = join(samplesDir, 'cries');
  if (existsSync(criesDir)) {
    stats.cryFiles = 0;
    for (const f of readdirSync(criesDir)) {
      if (f.endsWith('.wav') || f.endsWith('.aif')) {
        copy(join(criesDir, f), join(outRoot, 'cries', f));
        stats.cryFiles++;
      }
    }
  }
}

// 8. Summary
const summary = {
  ...stats,
  generatedAt: new Date().toISOString(),
  source: decompPath,
  prefix
};
writeJson(summaryPath, summary);
writeJson(join(outRoot, '_summary.json'), summary);

console.log('\n=== Extraction complete ===');
console.log(JSON.stringify({
  maps: stats.maps,
  layouts: stats.layouts,
  tilesetsPrimary: stats.tilesetsPrimary,
  tilesetsSecondary: stats.tilesetsSecondary,
  pokemonSprites: stats.pokemonSprites,
  npcSpriteSets: stats.npcSpriteSets,
  trainerFrontPics: stats.trainerFrontPics,
  trainerBackPics: stats.trainerBackPics,
  midiFiles: stats.midiFiles,
  wavSamples: stats.wavSamples,
  cryFiles: stats.cryFiles
}, null, 2));
console.log(`\nSummary written to: ${summaryPath}`);
console.log(`Assets in: ${outRoot}`);
