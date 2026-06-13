// Audit 1:1 de sprite.c (couche OBJ fondamentale) vs notre portage.
// Pour chaque fonction de sprite.c, cherche sa présence dans src/ et liste les fichiers.
const fs = require('fs');
const path = require('path');

const ROOT = 'D:/Projet 1/pokemon-web-demo/src';

// Fonctions DÉFINIES dans sprite.c (definitions, pas forward-decls).
const FNS = [
  'ResetSpriteData','AnimateSprites','BuildOamBuffer','UpdateOamCoords','BuildSpritePriorities',
  'SortSprites','CopyMatricesToOamBuffer','AddSpritesToOamBuffer','CreateSprite','CreateSpriteAtEnd',
  'CreateInvisibleSprite','CreateSpriteAt','CreateSpriteAndAnimate','DestroySprite','ResetOamRange',
  'LoadOam','ClearSpriteCopyRequests','ResetOamMatrices','SetOamMatrix','ResetSprite',
  'CalcCenterToCornerVec','AllocSpriteTiles','SpriteTileAllocBitmapOp','SpriteCallbackDummy',
  'ProcessSpriteCopyRequests','RequestSpriteFrameImageCopy','RequestSpriteCopy','CopyFromSprites',
  'CopyToSprites','ResetAllSprites','FreeSpriteTiles','FreeSpritePalette','FreeSpriteOamMatrix',
  'DestroySpriteAndFreeResources','AnimateSprite','BeginAnim','ContinueAnim','AnimCmd_frame',
  'AnimCmd_end','AnimCmd_jump','AnimCmd_loop','BeginAnimLoop','ContinueAnimLoop','JumpToTopOfAnimLoop',
  'BeginAffineAnim','ContinueAffineAnim','AffineAnimDelay','AffineAnimCmd_loop','BeginAffineAnimLoop',
  'ContinueAffineAnimLoop','JumpToTopOfAffineAnimLoop','AffineAnimCmd_jump','AffineAnimCmd_end',
  'AffineAnimCmd_frame','CopyOamMatrix','GetSpriteMatrixNum','SetSpriteMatrixAnchor','GetAnchorCoord',
  'UpdateSpriteMatrixAnchorPos','SetSpriteOamFlipBits','AffineAnimStateRestartAnim',
  'AffineAnimStateStartAnim','AffineAnimStateReset','ApplyAffineAnimFrameAbsolute',
  'DecrementAnimDelayCounter','DecrementAffineAnimDelayCounter','ApplyAffineAnimFrameRelativeAndUpdateMatrix',
  'ConvertScaleParam','GetAffineAnimFrame','ApplyAffineAnimFrame','StartSpriteAnim',
  'StartSpriteAnimIfDifferent','SeekSpriteAnim','StartSpriteAffineAnim','StartSpriteAffineAnimIfDifferent',
  'ChangeSpriteAffineAnim','ChangeSpriteAffineAnimIfDifferent','SetSpriteSheetFrameTileNum',
  'ResetAffineAnimData','AllocOamMatrix','FreeOamMatrix','InitSpriteAffineAnim',
  'SetOamMatrixRotationScaling','LoadSpriteSheet','LoadSpriteSheets','FreeSpriteTilesByTag',
  'FreeSpriteTileRanges','GetSpriteTileStartByTag','IndexOfSpriteTileTag','GetSpriteTileTagByTileStart',
  'AllocSpriteTileRange','FreeAllSpritePalettes','LoadSpritePalette','LoadSpritePalettes',
  'DoLoadSpritePalette','AllocSpritePalette','IndexOfSpritePaletteTag','GetSpritePaletteTagByPaletteNum',
  'FreeSpritePaletteByTag','SetSubspriteTables','AddSpriteToOamBuffer','AddSubspritesToOamBuffer',
];

// Collecte tous les .ts sous ROOT.
function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.ts')) acc.push(p);
  }
  return acc;
}
const files = walk(ROOT, []);
const contents = files.map(f => ({ f: path.relative(ROOT, f), txt: fs.readFileSync(f, 'utf8') }));

// Pour chaque fonction, repère où elle est DÉFINIE (function NAME / const NAME = / NAME(... ) {).
const defRe = (n) => new RegExp(`(function\\s+${n}\\b|\\b${n}\\s*[:=]\\s*(async\\s*)?(function|\\()|export\\s+(async\\s+)?function\\s+${n}\\b)`);
const results = { missing: [], present: [] };
for (const n of FNS) {
  const re = defRe(n);
  const hits = contents.filter(c => re.test(c.txt)).map(c => c.f);
  if (hits.length === 0) results.missing.push(n);
  else results.present.push({ n, hits });
}

console.log('=== MANQUANTES (aucune définition trouvée) : ' + results.missing.length + ' ===');
for (const n of results.missing) console.log('  ✗ ' + n);
console.log('');
console.log('=== PRÉSENTES : ' + results.present.length + ' / ' + FNS.length + ' ===');
for (const r of results.present) {
  const tag = r.hits.length > 1 ? ' [DUP ' + r.hits.length + ']' : '';
  console.log('  ✓ ' + r.n + tag + ' → ' + r.hits.join(', '));
}
