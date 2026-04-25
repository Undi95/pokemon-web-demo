#!/usr/bin/env node
/**
 * Parse scripts.inc de chaque map et sort un JSON consommable par le runtime :
 *   public/decomp/em/scripts/<MapName>.json
 *     {
 *       "scripts": {
 *         "LabelName": ["lock", "faceplayer", "msgbox TextLabel, MSGBOX_DEFAULT", "release", "end"]
 *       },
 *       "texts": {
 *         "LabelName": "Texte compilé avec \n et \p conservés"
 *       }
 *     }
 *
 * Format des scripts .inc :
 *   <Label>::        <- script label (double colon)
 *       <command>
 *       <command>
 *       end
 *
 *   <Label>:         <- text label (single colon)
 *       .string "...\p"
 *       .string "...\n"
 *       ...
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outRoot = join(projectRoot, 'public', 'decomp', 'em', 'scripts');

function parseScriptsFile(content) {
  const scripts = {};
  const texts = {};
  const lines = content.split(/\r?\n/);

  // Pokemerald : label `::` (global) ou `:` (local). Les DEUX peuvent être
  // soit script soit texte. On classe selon le contenu : si on voit .string,
  // c'est un texte, sinon c'est un script.
  let currentName = null;
  let buf = [];        // commands (script) ou string parts (text)
  let isText = false;

  const flush = () => {
    if (!currentName) return;
    if (isText) texts[currentName] = buf.join('');
    else if (buf.length > 0) scripts[currentName] = [...buf];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('@') || line.startsWith(';')) continue;

    // Label (simple ou double colon)
    const labelMatch = line.match(/^(\w+)::?\s*$/);
    if (labelMatch) {
      flush();
      currentName = labelMatch[1];
      buf = [];
      isText = false;
      continue;
    }
    if (!currentName) continue;

    const sm = line.match(/^\.string\s+"(.*)"\s*$/);
    if (sm) {
      isText = true;
      buf.push(sm[1]);
      continue;
    }
    // Autres directives .byte/.2byte/.4byte/.align etc. : ignorées
    if (line.startsWith('.')) continue;
    // Commande de script
    buf.push(line);
  }
  flush();

  return { scripts, texts };
}

// --- main ---
const mapsDir = join(decompPath, 'data', 'maps');
if (!existsSync(mapsDir)) { console.error('maps dir not found'); process.exit(1); }

mkdirSync(outRoot, { recursive: true });

// Pool global : le decomp utilise un namespace partagé entre fichiers
// (ex. MaysHouse_1F goto PlayersHouse_1F_EventScript_X défini dans BrendansHouse).
// On dédoublonne ici tous les labels de toutes les maps pour servir de fallback runtime.
const allScripts = {};
const allTexts = {};

let ok = 0, totalScripts = 0, totalTexts = 0;
for (const mapName of readdirSync(mapsDir)) {
  const scriptsPath = join(mapsDir, mapName, 'scripts.inc');
  if (!existsSync(scriptsPath)) continue;
  const content = readFileSync(scriptsPath, 'utf8');
  const parsed = parseScriptsFile(content);
  writeFileSync(join(outRoot, `${mapName}.json`), JSON.stringify(parsed));
  totalScripts += Object.keys(parsed.scripts).length;
  totalTexts += Object.keys(parsed.texts).length;
  Object.assign(allScripts, parsed.scripts);
  Object.assign(allTexts, parsed.texts);
  ok++;
}

// Common scripts : data/scripts/*.inc — partagés entre toutes les maps
const commonScripts = {};
const commonTexts = {};
const commonDir = join(decompPath, 'data', 'scripts');
if (existsSync(commonDir)) {
  function walkCommon(dir) {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      const st = statSync(p);
      if (st.isDirectory()) walkCommon(p);
      else if (entry.endsWith('.inc')) {
        const content = readFileSync(p, 'utf8');
        const parsed = parseScriptsFile(content);
        Object.assign(commonScripts, parsed.scripts);
        Object.assign(commonTexts, parsed.texts);
      }
    }
  }
  walkCommon(commonDir);
}
writeFileSync(join(outRoot, '_common.json'), JSON.stringify({ scripts: commonScripts, texts: commonTexts }));

// Pool global = commun + tous les scripts/textes de toutes les maps.
// Common a la priorité haute pour les conflits (data/scripts est canonical).
Object.assign(allScripts, commonScripts);
Object.assign(allTexts, commonTexts);
writeFileSync(join(outRoot, '_all.json'), JSON.stringify({ scripts: allScripts, texts: allTexts }));

console.log(`[extract-scripts] ${ok} maps, ${totalScripts} scripts, ${totalTexts} texts, ${Object.keys(commonScripts).length} common scripts, ${Object.keys(allScripts).length} pooled.`);
