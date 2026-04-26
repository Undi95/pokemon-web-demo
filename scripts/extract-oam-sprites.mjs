#!/usr/bin/env node
/**
 * Extrait les définitions OAM (sprites GBA) du décomp Pokémon Émeraude.
 *
 * Pattern omniprésent dans le décomp :
 *
 *   static const struct OamData sOamData_X = {
 *     .shape = SPRITE_SHAPE(32x64),
 *     .size  = SPRITE_SIZE(32x64),
 *     .bpp   = ST_OAM_4BPP,
 *     ...
 *   };
 *   static const union AnimCmd sAnim_X[] = {
 *     ANIMCMD_FRAME(128, 8),  // tile index, duration
 *     ANIMCMD_END,
 *   };
 *   static const struct SpriteTemplate sSpriteTemplate_X = {
 *     .tileTag = GFXTAG_X,
 *     .paletteTag = PALTAG_X,
 *     .oam = &sOamData_X,
 *     .anims = sAnims_X,
 *     ...
 *   };
 *
 * Pour chaque SpriteTemplate, on résout :
 *   - shape (W, H) depuis OamData.size
 *   - bpp (4 ou 8) depuis OamData.bpp
 *   - tileNum depuis 1er ANIMCMD_FRAME OU OamData.tileNum
 *   - tileTag + paletteTag (constantes symboliques, à mapper côté runtime)
 *
 * Sortie : `public/decomp/em/oam-sprites.json`
 *
 *   {
 *     "GameFreakLogo": {
 *       "shape": [32, 64], "bpp": 4, "tileNum": 128,
 *       "tileTag": "GFXTAG_DROPS_LOGO", "paletteTag": "PALTAG_LOGO",
 *       "source": "src/intro.c"
 *     },
 *     ...
 *   }
 *
 * Côté runtime (`util/oam-sprite.ts`), un mapping `tileTag → atlas_file` permet
 * de résoudre l'atlas final + calculer atlasRect = (0, tileNum/strideTiles*8, W, H).
 *
 * Cf. AUTOMATION_BACKLOG #2 (priorité HAUTE ⭐, découvert session 35).
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const srcDir = join(decompPath, 'src');
// 2 sorties :
//   - src/decomp/em/ pour `import` statique TS (consommé par util/oam-sprite.ts)
//   - public/decomp/em/ pour servabilité runtime (debug, inspection)
const outDirSrc = join(projectRoot, 'src', 'decomp', 'em');
const outDirPub = join(projectRoot, 'public', 'decomp', 'em');

mkdirSync(outDirSrc, { recursive: true });
mkdirSync(outDirPub, { recursive: true });

// --- 1. Walk src/ recursive pour trouver tous les .c ---
function walkC(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fp = join(dir, entry.name);
    if (entry.isDirectory()) walkC(fp, out);
    else if (entry.isFile() && entry.name.endsWith('.c')) out.push(fp);
  }
  return out;
}
const cFiles = walkC(srcDir);

// --- 2. Parser per-file ---
const oamDatas = {};       // name → { shape: [w,h], bpp, tileNum }
const animCmds = {};       // name → first FRAME tile index
const spriteTemplates = {}; // name → { tileTag, paletteTag, oamRef, animsRef, source }

const RE_OAM = /static\s+const\s+struct\s+OamData\s+(\w+)\s*=\s*\{([^}]+)\}/g;
const RE_ANIM = /static\s+const\s+union\s+AnimCmd\s+(\w+)\[\]\s*=\s*\{([^}]+)\}/g;
const RE_TMPL = /static\s+const\s+struct\s+SpriteTemplate\s+(\w+)\s*=\s*\{([^}]+)\}/g;

function extractField(body, name) {
  const m = body.match(new RegExp(`\\.${name}\\s*=\\s*([^,\\n]+)`));
  return m ? m[1].trim() : null;
}

function parseSpriteSize(expr) {
  // SPRITE_SIZE(32x64) → [32, 64]
  const m = expr.match(/SPRITE_SIZE\s*\(\s*(\d+)x(\d+)\s*\)/);
  return m ? [parseInt(m[1]), parseInt(m[2])] : null;
}

let nFiles = 0;
for (const file of cFiles) {
  const text = readFileSync(file, 'utf8');
  const relSrc = file.replace(decompPath + '\\', '').replace(/\\/g, '/');

  // Reset regex states (global flag)
  RE_OAM.lastIndex = 0;
  RE_ANIM.lastIndex = 0;
  RE_TMPL.lastIndex = 0;

  let m;
  while ((m = RE_OAM.exec(text)) !== null) {
    const name = m[1], body = m[2];
    const shape = parseSpriteSize(extractField(body, 'size') || '');
    if (!shape) continue;
    const bpp = (extractField(body, 'bpp') || '').includes('8BPP') ? 8 : 4;
    const tileNumStr = extractField(body, 'tileNum');
    const tileNum = tileNumStr ? parseInt(tileNumStr) : 0;
    oamDatas[name] = { shape, bpp, tileNum, source: relSrc };
  }

  while ((m = RE_ANIM.exec(text)) !== null) {
    const name = m[1], body = m[2];
    const f = body.match(/ANIMCMD_FRAME\s*\(\s*(\d+)\s*,/);
    if (f) animCmds[name] = parseInt(f[1]);
  }

  while ((m = RE_TMPL.exec(text)) !== null) {
    const name = m[1], body = m[2];
    const tileTag = extractField(body, 'tileTag');
    const paletteTag = extractField(body, 'paletteTag');
    const oamRef = extractField(body, 'oam'); // typically "&sOamData_X"
    const animsRef = extractField(body, 'anims'); // typically "sAnims_X"
    spriteTemplates[name] = {
      tileTag, paletteTag,
      oamRef: oamRef ? oamRef.replace(/^&/, '') : null,
      animsRef,
      source: relSrc,
    };
  }
  nFiles++;
}

// --- 3. Link SpriteTemplate → OamData + AnimCmd → final shape + tileNum ---
const sprites = {};
for (const [tplName, tpl] of Object.entries(spriteTemplates)) {
  const oam = tpl.oamRef ? oamDatas[tpl.oamRef] : null;
  if (!oam) continue; // pas d'OamData résolu, skip

  // Cherche le 1er AnimCmd associé (anims = sAnims_X qui contient un tableau de pointeurs
  // vers sAnim_X_*). On essaye plusieurs heuristiques.
  let tileNum = oam.tileNum;
  if (tpl.animsRef) {
    // Heuristique : sAnims_X → premier élément = sAnim_X_<first>
    // Pour MVP, on essaye de trouver un AnimCmd au nom proche du SpriteTemplate
    const baseTplName = tplName.replace(/^sSpriteTemplate_/, '');
    // Match sAnim_<baseTplName>... ou sAnim_<baseTplName>_<letter>
    const candidate = Object.keys(animCmds).find(n =>
      n === `sAnim_${baseTplName}` || n.startsWith(`sAnim_${baseTplName}_`)
    );
    if (candidate) tileNum = animCmds[candidate];
  }

  // Strip prefix sSpriteTemplate_ pour le nom final
  const cleanName = tplName.replace(/^sSpriteTemplate_/, '').replace(/^gSpriteTemplate_/, '');

  sprites[cleanName] = {
    shape: oam.shape,
    bpp: oam.bpp,
    tileNum,
    tileTag: tpl.tileTag,
    paletteTag: tpl.paletteTag,
    source: tpl.source,
  };
}

const json = JSON.stringify(sprites, null, 0);
writeFileSync(join(outDirSrc, 'oam-sprites.json'), json);
writeFileSync(join(outDirPub, 'oam-sprites.json'), json);

console.log(`[oam-sprites] ${nFiles} .c parsés`);
console.log(`  OamData defs       : ${Object.keys(oamDatas).length}`);
console.log(`  AnimCmd defs       : ${Object.keys(animCmds).length}`);
console.log(`  SpriteTemplates    : ${Object.keys(spriteTemplates).length}`);
console.log(`  Sprites résolus    : ${Object.keys(sprites).length}`);
// Sanity check : quelques sprites connus
for (const k of ['GameFreakLogo', 'GameFreakLetter', 'PresentsLetter', 'FlygonSilhouette']) {
  if (sprites[k]) console.log(`  ✓ ${k}:`, JSON.stringify(sprites[k]));
}
