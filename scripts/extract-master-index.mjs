#!/usr/bin/env node
/**
 * Master index : pour CHAQUE map, lie tileset/tilemap/palette + tous les NPCs
 * (graphics_id, scripts, dialogues FR) + tous les events.
 *
 * Source de vérité unique pour debug/exploration. Évite de grep le décomp à
 * chaque question "qu'est-ce qu'il y a sur cette map ?".
 *
 * Sortie : `public/decomp/em/master-index.json` (~10-15 MB attendu).
 *
 * Cf. DEV_LOG session 48 + MASTER_PLAN §2.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const DECOMP_EM = path.join(PROJECT_ROOT, 'public', 'decomp', 'em');
const DECOMP_SOURCE = path.resolve(PROJECT_ROOT, '..', 'decomps', 'pokeemeraude');

const stats = {
  totalMaps: 0,
  mapsWithScripts: 0,
  totalNpcs: 0,
  totalDialoguesExtracted: 0,
  warnings: [],
};

function warn(msg) {
  if (stats.warnings.length < 50) stats.warnings.push(msg);
}

function loadJSON(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch (e) { warn(`load JSON fail ${filePath}: ${e.message}`); return null; }
}

function loadFile(filePath) {
  try { return fs.readFileSync(filePath, 'utf8'); }
  catch { return null; }
}

console.log('Loading reference data...');
const mapIds = loadJSON(path.join(DECOMP_EM, 'map-ids.json')) || {};
const mapNamesFr = loadJSON(path.join(DECOMP_EM, 'map-names-fr.json')) || {};
const layoutsIndex = loadJSON(path.join(DECOMP_EM, 'layouts-index.json')) || { layouts: [] };
const inanimateGfx = loadJSON(path.join(DECOMP_EM, 'inanimate-graphics.json')) || {};

const layoutLookup = {};
const layoutsArr = Array.isArray(layoutsIndex) ? layoutsIndex : (layoutsIndex.layouts || []);
for (const layout of layoutsArr) {
  if (layout && layout.id) layoutLookup[layout.id] = layout;
}

// Load text labels from decomp /data/text/*.inc
const textLabelsMap = new Map();
function loadTextLabels() {
  const textDir = path.join(DECOMP_SOURCE, 'data', 'text');
  if (!fs.existsSync(textDir)) { warn(`text dir absent: ${textDir}`); return; }
  const files = fs.readdirSync(textDir).filter(f => f.endsWith('.inc'));
  for (const file of files) {
    const content = loadFile(path.join(textDir, file));
    if (!content) continue;
    const lines = content.split('\n');
    let currentLabel = null;
    let textBuffer = '';
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed.endsWith('::') && !trimmed.startsWith('@') && !trimmed.startsWith('.')) {
        if (currentLabel && textBuffer) textLabelsMap.set(currentLabel, textBuffer.trim());
        currentLabel = trimmed.replace('::', '');
        textBuffer = '';
      } else if (currentLabel && trimmed.startsWith('.string ')) {
        const m = trimmed.match(/\.string\s+"([^"]+)"/);
        if (m) textBuffer += m[1] + ' ';
      }
    }
    if (currentLabel && textBuffer) textLabelsMap.set(currentLabel, textBuffer.trim());
  }
}
loadTextLabels();
console.log(`Loaded ${textLabelsMap.size} text labels from decomp`);

// Aussi : text labels embarqués dans scripts.inc (cas LittlerootTown_Text_X
// déclaré directement dans data/maps/<Map>/scripts.inc, pas dans data/text).
function loadEmbeddedTextLabels(scriptsContent) {
  const lines = scriptsContent.split('\n');
  let currentLabel = null;
  let textBuffer = '';
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.endsWith(':') && !trimmed.startsWith('@')) {
      if (currentLabel && textBuffer) textLabelsMap.set(currentLabel, textBuffer.trim());
      currentLabel = trimmed.replace(/:+$/, '');
      textBuffer = '';
    } else if (currentLabel && trimmed.startsWith('.string ')) {
      const m = trimmed.match(/\.string\s+"([^"]+)"/);
      if (m) textBuffer += m[1] + ' ';
    }
  }
  if (currentLabel && textBuffer) textLabelsMap.set(currentLabel, textBuffer.trim());
}

function extractScriptContent(mapFolderName) {
  const scriptsFile = path.join(DECOMP_SOURCE, 'data', 'maps', mapFolderName, 'scripts.inc');
  const content = loadFile(scriptsFile);
  if (!content) return {};
  loadEmbeddedTextLabels(content);
  const scriptMap = {};
  const lines = content.split('\n');
  let currentScript = null;
  let scriptLines = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if ((trimmed.endsWith('::') || trimmed.endsWith(':'))
        && !trimmed.startsWith('@') && !trimmed.startsWith('.')) {
      if (currentScript) scriptMap[currentScript] = scriptLines;
      currentScript = trimmed.replace(/:+$/, '');
      scriptLines = [];
    } else if (currentScript && trimmed && !trimmed.startsWith('@') && !trimmed.startsWith('.')) {
      scriptLines.push(trimmed);
    }
  }
  if (currentScript) scriptMap[currentScript] = scriptLines;
  return scriptMap;
}

function extractDialogueReferences(scriptLines, limit = 5) {
  const dialogues = [];
  const seen = new Set();
  for (const line of scriptLines) {
    if (dialogues.length >= limit) break;
    let m = line.match(/msgbox\s+(\w+)/i)
         || line.match(/message\s+(\w+)/i)
         || line.match(/bufferstring\s+\d+,\s*(\w+)/i);
    if (m) {
      const label = m[1];
      if (!seen.has(label)) {
        seen.add(label);
        const text = textLabelsMap.get(label);
        if (text) {
          dialogues.push({ label, text: text.length > 150 ? text.slice(0, 150) + '...' : text });
          stats.totalDialoguesExtracted++;
        } else {
          dialogues.push({ label, text: null });
        }
      }
    }
  }
  return dialogues;
}

console.log('\nExtracting master index...');
const masterIndex = { maps: {} };
const mapFiles = fs.readdirSync(path.join(DECOMP_EM, 'maps')).filter(f => f.endsWith('.json'));
console.log(`Found ${mapFiles.length} maps to process`);

for (let idx = 0; idx < mapFiles.length; idx++) {
  if ((idx + 1) % 100 === 0) console.log(`  Processed ${idx + 1}/${mapFiles.length}...`);
  const file = mapFiles[idx];
  const mapName = file.replace('.json', '');
  const mapJson = loadJSON(path.join(DECOMP_EM, 'maps', file));
  if (!mapJson) continue;
  const mapId = mapJson.id;
  if (!mapId) continue;
  const mapFolderName = mapIds[mapId] || mapName;
  stats.totalMaps++;

  const layoutId = mapJson.layout;
  const layoutInfo = layoutLookup[layoutId];
  let tileset = null;
  if (layoutInfo) {
    tileset = {
      primary: layoutInfo.primary_tileset || layoutInfo.primaryTileset || 'unknown',
      secondary: layoutInfo.secondary_tileset || layoutInfo.secondaryTileset || 'unknown',
    };
    tileset.pairKey = `${tileset.primary}+${tileset.secondary}`;
  }
  const dimensions = layoutInfo
    ? { width: layoutInfo.width, height: layoutInfo.height }
    : null;

  const scriptMap = extractScriptContent(mapFolderName);
  const mapScripts = {
    ON_TRANSITION: null,
    ON_FRAME_TABLE: null,
    ON_LOAD: null,
    ON_RESUME: null,
    ON_DIVE_WARP: null,
  };
  if (Object.keys(scriptMap).length > 0) {
    stats.mapsWithScripts++;
    const findFirst = (kw) => Object.keys(scriptMap).find(k => k.includes(kw));
    const trans = findFirst('OnTransition');
    const frame = findFirst('OnFrame');
    const load = findFirst('OnLoad');
    const resume = findFirst('OnResume');
    if (trans) mapScripts.ON_TRANSITION = { label: trans, scriptLines: scriptMap[trans].slice(0, 15) };
    if (frame) mapScripts.ON_FRAME_TABLE = { label: frame, scriptLines: scriptMap[frame].slice(0, 10) };
    if (load) mapScripts.ON_LOAD = { label: load, scriptLines: scriptMap[load].slice(0, 10) };
    if (resume) mapScripts.ON_RESUME = { label: resume, scriptLines: scriptMap[resume].slice(0, 10) };
  }

  const objectEvents = [];
  for (const obj of mapJson.object_events || []) {
    const hasScript = obj.script && obj.script !== '0x0';
    if (hasScript) stats.totalNpcs++;
    const scriptLines = hasScript ? (scriptMap[obj.script] || []) : [];
    const dialogues = hasScript ? extractDialogueReferences(scriptLines, 3) : [];
    objectEvents.push({
      localId: obj.local_id || null,
      graphicsId: obj.graphics_id,
      x: obj.x, y: obj.y,
      elevation: obj.elevation || 0,
      movementType: obj.movement_type,
      scriptLabel: hasScript ? obj.script : null,
      scriptLines: scriptLines.slice(0, 8),
      dialoguesReferenced: dialogues,
      flag: obj.flag && obj.flag !== '0' ? obj.flag : null,
      inanimate: !!inanimateGfx[obj.graphics_id],
      trainerType: obj.trainer_type || 'TRAINER_TYPE_NONE',
    });
  }

  const warpEvents = (mapJson.warp_events || []).map(w => ({
    x: w.x, y: w.y, elevation: w.elevation || 0,
    destMap: w.dest_map, destWarpId: w.dest_warp_id,
  }));

  const coordEvents = [];
  for (const c of mapJson.coord_events || []) {
    const scriptLines = c.script ? (scriptMap[c.script] || []) : [];
    const dialogues = c.script ? extractDialogueReferences(scriptLines, 2) : [];
    coordEvents.push({
      type: c.type,
      x: c.x, y: c.y,
      elevation: c.elevation || 0,
      var: c.var, varValue: c.var_value,
      scriptLabel: c.script || null,
      scriptLines: scriptLines.slice(0, 5),
      dialoguesReferenced: dialogues,
    });
  }

  const bgEvents = [];
  for (const b of mapJson.bg_events || []) {
    const scriptLines = b.script ? (scriptMap[b.script] || []) : [];
    const dialogues = b.script ? extractDialogueReferences(scriptLines, 1) : [];
    bgEvents.push({
      type: b.type,
      x: b.x, y: b.y,
      elevation: b.elevation || 0,
      playerFacingDir: b.player_facing_dir,
      scriptLabel: b.script || null,
      dialoguesReferenced: dialogues,
    });
  }

  const mapsecKey = mapId.replace('MAP_', 'MAPSEC_');
  masterIndex.maps[mapId] = {
    folder: mapFolderName,
    id: mapId,
    name: mapName,
    nameFr: mapNamesFr[mapsecKey] || mapNamesFr[mapId] || null,
    layout: layoutId,
    music: mapJson.music || null,
    weather: mapJson.weather || null,
    battleScene: mapJson.battle_scene || null,
    showMapName: !!mapJson.show_map_name,
    allowCycling: !!mapJson.allow_cycling,
    allowEscaping: !!mapJson.allow_escaping,
    allowRunning: !!mapJson.allow_running,
    requiresFlash: !!mapJson.requires_flash,
    mapType: mapJson.map_type || null,
    tileset, dimensions,
    connections: mapJson.connections || [],
    objectEvents, warpEvents, coordEvents, bgEvents,
    mapScripts,
  };
}

masterIndex.summary = {
  extractedAt: new Date().toISOString(),
  totalMaps: stats.totalMaps,
  mapsWithScripts: stats.mapsWithScripts,
  totalNpcs: stats.totalNpcs,
  totalDialoguesExtracted: stats.totalDialoguesExtracted,
  textLabelsLoaded: textLabelsMap.size,
  warnings: stats.warnings.length > 0 ? stats.warnings.slice(0, 10) : null,
};

const outputPath = path.join(DECOMP_EM, 'master-index.json');
fs.writeFileSync(outputPath, JSON.stringify(masterIndex));  // pas indenté pour size
const sizeMB = fs.statSync(outputPath).size / (1024 * 1024);

console.log(`\n[extract-master-index] DONE`);
console.log(`  Output: ${outputPath} (${sizeMB.toFixed(2)} MB)`);
console.log(`  Maps: ${stats.totalMaps} (${stats.mapsWithScripts} with scripts)`);
console.log(`  NPCs indexed: ${stats.totalNpcs}`);
console.log(`  Dialogues extracted: ${stats.totalDialoguesExtracted}`);
console.log(`  Text labels: ${textLabelsMap.size}`);
console.log(`  Warnings: ${stats.warnings.length}`);
