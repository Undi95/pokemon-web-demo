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

  let currentScript = null;
  let currentText = null;
  let textParts = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('@') || line.startsWith(';')) continue;

    // Script label : "LabelName::"
    let m = line.match(/^(\w+)::\s*$/);
    if (m) {
      if (currentText) { texts[currentText] = textParts.join(''); currentText = null; textParts = []; }
      currentScript = m[1];
      scripts[currentScript] = [];
      continue;
    }
    // Text label : "LabelName:"
    m = line.match(/^(\w+):\s*$/);
    if (m) {
      if (currentText) { texts[currentText] = textParts.join(''); }
      currentScript = null;
      currentText = m[1];
      textParts = [];
      continue;
    }

    if (currentText) {
      // .string "..."
      const sm = line.match(/^\.string\s+"(.*)"\s*$/);
      if (sm) {
        textParts.push(sm[1]);
      }
      // Note : d'autres directives .byte / .2byte / .4byte etc. sont ignorées ici
      continue;
    }

    if (currentScript) {
      // commande brute (un par ligne)
      scripts[currentScript].push(line);
    }
  }
  // flush trailing text
  if (currentText) texts[currentText] = textParts.join('');

  return { scripts, texts };
}

// --- main ---
const mapsDir = join(decompPath, 'data', 'maps');
if (!existsSync(mapsDir)) { console.error('maps dir not found'); process.exit(1); }

mkdirSync(outRoot, { recursive: true });

let ok = 0, totalScripts = 0, totalTexts = 0;
for (const mapName of readdirSync(mapsDir)) {
  const scriptsPath = join(mapsDir, mapName, 'scripts.inc');
  if (!existsSync(scriptsPath)) continue;
  const content = readFileSync(scriptsPath, 'utf8');
  const parsed = parseScriptsFile(content);
  writeFileSync(join(outRoot, `${mapName}.json`), JSON.stringify(parsed));
  totalScripts += Object.keys(parsed.scripts).length;
  totalTexts += Object.keys(parsed.texts).length;
  ok++;
}
console.log(`[extract-scripts] ${ok} maps, ${totalScripts} scripts, ${totalTexts} texts written.`);
