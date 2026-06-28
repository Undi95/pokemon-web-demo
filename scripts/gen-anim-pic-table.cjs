// PIPELINE ANIMS « DECOMP-DIRECT » (directive user 2026-06-13 : « utiliser les
// palettes de la décomp — si ça pose problème, le problème c'est nous »).
// 1. COPIE AS-IS des sources (png + .pal JASC) de graphics/battle_anims/sprites/
//    vers public/decomp/em/battle_anims/sprites-src/ — ZÉRO conversion au build.
// 2. GÉNÈRE src/data/battle_anim.ts (miroir 1:1 src/data/battle_anim.h) depuis
//    gBattleAnimPicTable + gBattleAnimPaletteTable (src/data/battle_anim.h) :
//    tag → { gfxFile (png à décoder runtime), size (chargement ROM), palFile
//    (png→PLTE ou .pal JASC du PAL SYMBOL — recolors croisés résolus), concat }.
// Le décodage se fait AU RUNTIME par les décodeurs déjà éprouvés du jeu
// (png-loader.ts : loadTileBin/loadIndexedPngStrict — mêmes chemins que les
// mons/balls → convention couleur garantie cohérente avec le compositor).
// Usage : node scripts/gen-anim-pic-table.cjs
const fs = require('node:fs');
const path = require('node:path');

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const SRC_DIR = path.join(DECOMP, 'graphics', 'battle_anims', 'sprites');
const OUT_DIR = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/battle_anims/sprites-src';
// Chemin miroir 1:1 décomp (src/data/battle_anim.h → src/data/battle_anim.ts).
const TABLE_OUT = 'D:/Projet 1/pokemon-web-demo/src/data/battle_anim.ts';

// ── tables décomp ────────────────────────────────────────────────────────────
const dataH = fs.readFileSync(path.join(DECOMP, 'src', 'data', 'battle_anim.h'), 'utf8');
const picEntries = []; // ordre = tag value (ANIM_SPRITES_START + index)
for (const m of (/gBattleAnimPicTable\[\]\s*=\s*\{([\s\S]*?)\n\};/.exec(dataH))[1].matchAll(/\{(\w+),\s*(0x[0-9A-Fa-f]+|\d+),\s*(\w+)\}/g)) {
  picEntries.push({ gfxSym: m[1], size: parseInt(m[2], m[2].startsWith('0x') ? 16 : 10), tag: m[3] });
}
// ⚠ 1:1 : les DEUX tables C sont indexées PAR POSITION (GET_TRUE_SPRITE_INDEX),
// pas par nom — vanilla a même un copy-paste {gBattleAnimSpritePal_SapDrip2,
// ANIM_TAG_SAP_DRIP} à la position de SAP_DRIP_2 (battle_anim.h:1352). On zippe
// donc par INDEX (le tag-name de la palette table n'est PAS fiable).
const palByIndex = [];
for (const m of (/gBattleAnimPaletteTable\[\]\s*=\s*\{([\s\S]*?)\n\};/.exec(dataH))[1].matchAll(/\{(\w+),\s*(\w+)\}/g)) {
  palByIndex.push(m[1]);
}
// symbole → fichier source (graphics-data.ts, généré 1:1 de la décomp)
const gd = fs.readFileSync('D:/Projet 1/pokemon-web-demo/src/engine/decomp-data/src/graphics-data.ts', 'utf8');
const symToPath = new Map();
for (const m of gd.matchAll(/'(\w+)':\s*\{\s*path:\s*'([^']+)'/g)) {
  if (!symToPath.has(m[1])) symToPath.set(m[1], m[2]); // 1er gagne (doublons éventuels signalés)
}
// concats .mk (spark.4bpp = spark_0 + spark_1, etc.)
const mk = fs.readFileSync(path.join(DECOMP, 'graphics_file_rules.mk'), 'utf8');
const concats = new Map();
for (const m of mk.matchAll(/\$\(BTLANMSPRGFXDIR\)\/(\w+)\.4bpp:\s*((?:\$\(BTLANMSPRGFXDIR\)\/\w+\.4bpp\s*\\?\s*)+)/g)) {
  concats.set(m[1], [...m[2].matchAll(/\$\(BTLANMSPRGFXDIR\)\/(\w+)\.4bpp/g)].map((x) => x[1]));
}

// ── 1. copie AS-IS ───────────────────────────────────────────────────────────
fs.mkdirSync(OUT_DIR, { recursive: true });
let copied = 0;
for (const f of fs.readdirSync(SRC_DIR)) {
  if (!/\.(png|pal)$/.test(f)) continue;
  const src = path.join(SRC_DIR, f);
  const dst = path.join(OUT_DIR, f);
  const sb = fs.readFileSync(src);
  if (!fs.existsSync(dst) || !fs.readFileSync(dst).equals(sb)) { fs.writeFileSync(dst, sb); copied++; }
}

// ── 2. table TS ──────────────────────────────────────────────────────────────
const ANIM_SPRITES_START = 10000;
const lines = [];
const warns = [];
picEntries.forEach((e, idx) => {
  const tagValue = ANIM_SPRITES_START + idx;
  const gfxRel = symToPath.get(e.gfxSym);
  if (!gfxRel) { warns.push(`${e.tag}: gfxSym ${e.gfxSym} sans fichier (graphics-data)`); return; }
  const gfxBase = path.basename(gfxRel).replace(/\.(png|4bpp)$/, '');
  // gfx : png simple OU liste de png (concat .mk, ordre ROM)
  const gfxFiles = concats.has(gfxBase) ? concats.get(gfxBase).map((p) => p + '.png') : [path.basename(gfxRel)];
  for (const gf of gfxFiles) {
    if (!fs.existsSync(path.join(SRC_DIR, gf))) warns.push(`${e.tag}: source gfx ${gf} ABSENTE`);
  }
  const palSym = palByIndex[idx] ?? null;
  let palFile = null;
  if (palSym) {
    const palRel = symToPath.get(palSym);
    if (!palRel) warns.push(`${e.tag}: palSym ${palSym} sans fichier`);
    else {
      palFile = path.basename(palRel);
      if (!fs.existsSync(path.join(SRC_DIR, palFile))) warns.push(`${e.tag}: source pal ${palFile} ABSENTE`);
    }
  }
  lines.push(`  ${tagValue}: { tag: '${e.tag}', gfx: [${gfxFiles.map((f) => `'${f}'`).join(', ')}], size: 0x${e.size.toString(16)}, pal: ${palFile ? `'${palFile}'` : 'null'} },`);
});

const header = `// AUTO-GÉNÉRÉ par scripts/gen-anim-pic-table.cjs — NE PAS ÉDITER.
// 1:1 décomp src/data/battle_anim.h : gBattleAnimPicTable + gBattleAnimPaletteTable
// (+ graphics_file_rules.mk pour les gfx concaténés, ex. spark = spark_0+spark_1).
// gfx = png SOURCE décomp (copiés AS-IS dans public/decomp/em/battle_anims/sprites-src/),
// décodés AU RUNTIME par png-loader (la même chaîne couleur que les mons/balls).
// size = octets chargés par la ROM (LZ77 décompressé) — tronquer/padder le 4bpp.
// pal = fichier du PAL SYMBOL à la MÊME POSITION dans gBattleAnimPaletteTable
// (l'indexation C est par position — le tag-name de la palette table n'est pas
// fiable, cf. copy-paste vanilla {SapDrip2, ANIM_TAG_SAP_DRIP} :1352).

export interface AnimPicEntry {
  tag: string;
  gfx: readonly string[];
  size: number;
  pal: string | null;
}

export const G_BATTLE_ANIM_PIC_TABLE: Readonly<Record<number, AnimPicEntry>> = {
`;
fs.writeFileSync(TABLE_OUT, header + lines.join('\n') + '\n};\n');
console.log(`copiés/à jour: ${copied} fichiers → sprites-src/ · table: ${lines.length} entrées → src/data/battle_anim.ts`);
if (warns.length) { console.log('⚠ warnings:'); warns.forEach((w) => console.log('  ' + w)); }
