// post-transpile-patches.mjs — applique les patches manuels session 68
// après chaque regen `transpile-callbacks.mjs`.
//
// Pourquoi : le transpileur de base ne sait pas (encore) :
// - Auto-injecter les imports decomp-globals (helpers + symbols + constants)
// - Déclarer les EWRAM vars en `let` local (ES modules ne permettent pas write
//   sur import binding)
// - Remplacer les `/* TODO LZ77UnCompVram */` par les vrais appels
// - Retirer le param `rt: DecompRuntime` des helpers locaux qui prennent la
//   mauvaise signature
//
// Ce script post-process applique ces patches AUTO. Lancé en bout de
// `transpile-callbacks.mjs`. Re-runnable safely (idempotent : skip si patch
// déjà appliqué).
//
// TODO Phase 2 : intégrer ces transformations directement dans le transpileur
// pour rendre le post-process inutile.

import fs from 'node:fs';
import path from 'node:path';

const FILE = path.resolve('src/engine/decomp-data/auto/src/intro-callbacks-auto.ts');

function patchIntroCallbacks() {
  let s = fs.readFileSync(FILE, 'utf8');
  const before = s;

  // PATCH 1 : Inject decomp-globals import block après l'import depuis intro-data.
  // Skip si déjà appliqué (= "from '../../../decomp-globals'" présent).
  if (!s.includes(`from '../../../decomp-globals'`)) {
    const importMarker = `} from '../../intro-data';`;
    if (s.includes(importMarker)) {
      const decompGlobalsImport = `} from '../../intro-data';
// MANUAL FIX session 68 phase 0b — auto-injected by post-transpile-patches.mjs
// Helpers globaux décomp + symbols + constants depuis decomp-globals.ts.
import {
  // Helpers globaux (équivalent extern décomp)
  LZ77UnCompVram, LoadPalette, DmaClear16, CpuFill16, CpuFill32,
  LoadCompressedSpriteSheet, LoadSpritePalettes,
  LoadIntroPart2Graphics, FreeAllSpritePalettes,
  // Runtime singleton accessor (pour helpers qui prenaient rt en param)
  getRuntime as _getRuntime,
  // Global tables extern (cross-module)
  gTitleScreenAlphaBlend,
  // Symbol-name strings (= keys vers assetCache)
  sIntro1Bg_Gfx, sIntro1Bg_Pal,
  sIntro1Bg0_Tilemap, sIntro1Bg1_Tilemap, sIntro1Bg2_Tilemap, sIntro1Bg3_Tilemap,
  sIntroDropsLogo_Gfx, sIntroDrops_Pal, sIntroLogo_Pal, sIntroFlygonSilhouette_Pal,
  gIntroSparkle_Gfx, gIntroFlygonSilhouette_Gfx, gIntroGameFreakTextFade_Pal,
  gIntroBrendan_Gfx, gIntroMay_Gfx, gIntroBicycle_Gfx, gIntroFlygon_Gfx,
  gIntroVolbeat_Gfx, gIntroTorchic_Gfx, gIntroManectric_Gfx,
  gIntroVolbeat_Pal, gIntroTorchic_Pal, gIntroManectric_Pal,
  sIntroPokeball_Pal, sIntroPokeball_Tilemap, sIntroPokeball_Gfx,
  sIntroStreaks_Pal, sIntroStreaks_Gfx, sIntroStreaks_Tilemap,
  sIntroRayquzaOrb_Pal, sIntroMisc_Pal, sIntroMisc_Gfx, sIntroLati_Gfx,
  gIntroLightning_Gfx, gIntroLightning_Pal, gIntroBubbles_Gfx, gIntroBubbles_Pal,
  // Scene 2 stubs (Phase 0b minimum viable)
  sSpriteSheet_RunningPokemon, sAnims_PlayerBicycle,
  CreateIntroBrendanSprite, CreateIntroMaySprite, CreateIntroFlygonSprite,
  CreateBicycleBgAnimationTask, SetIntroPart2BgCnt,
  // Constants
  BG_SCREEN_SIZE, PALETTES_ALL,
  // Display + addressing
  BG_PLTT_ID, OBJ_PLTT_ID, BG_CHAR_ADDR, BG_SCREEN_ADDR,
  DISPLAY_WIDTH, DISPLAY_HEIGHT,
  // REG_OFFSET_*
  REG_OFFSET_DISPCNT,
  REG_OFFSET_BG0CNT, REG_OFFSET_BG1CNT, REG_OFFSET_BG2CNT, REG_OFFSET_BG3CNT,
  REG_OFFSET_BG0HOFS, REG_OFFSET_BG0VOFS,
  REG_OFFSET_BG1HOFS, REG_OFFSET_BG1VOFS,
  REG_OFFSET_BG2HOFS, REG_OFFSET_BG2VOFS,
  REG_OFFSET_BG3HOFS, REG_OFFSET_BG3VOFS,
  REG_OFFSET_WIN0H, REG_OFFSET_WIN1H, REG_OFFSET_WIN0V, REG_OFFSET_WIN1V,
  REG_OFFSET_WININ, REG_OFFSET_WINOUT,
  REG_OFFSET_BLDCNT, REG_OFFSET_BLDALPHA, REG_OFFSET_BLDY,
  // BGCNT_*
  BGCNT_PRIORITY, BGCNT_CHARBASE, BGCNT_SCREENBASE,
  BGCNT_16COLOR, BGCNT_256COLOR,
  BGCNT_TXT256x256, BGCNT_TXT512x256, BGCNT_TXT256x512, BGCNT_TXT512x512,
  BGCNT_AFF128x128, BGCNT_AFF256x256, BGCNT_AFF512x512, BGCNT_AFF1024x1024,
  // DISPCNT_*
  DISPCNT_MODE_0, DISPCNT_MODE_1, DISPCNT_MODE_2, DISPCNT_OBJ_1D_MAP,
  DISPCNT_BG0_ON, DISPCNT_BG1_ON, DISPCNT_BG2_ON, DISPCNT_BG3_ON,
  DISPCNT_OBJ_ON, DISPCNT_WIN0_ON, DISPCNT_BG_ALL_ON,
  // BLDCNT_*
  BLDCNT_TGT1_BG0, BLDCNT_TGT1_BG1, BLDCNT_TGT1_BG2, BLDCNT_TGT1_BG3,
  BLDCNT_TGT1_OBJ, BLDCNT_TGT1_BD,
  BLDCNT_EFFECT_NONE, BLDCNT_EFFECT_BLEND, BLDCNT_EFFECT_LIGHTEN, BLDCNT_EFFECT_DARKEN,
  BLDCNT_TGT2_BG0, BLDCNT_TGT2_BG1, BLDCNT_TGT2_BG2, BLDCNT_TGT2_BG3,
  BLDCNT_TGT2_OBJ, BLDCNT_TGT2_BD,
} from '../../../decomp-globals';

// EWRAM_DATA vars locales au scope module (1:1 décomp src/intro.c +
// src/intro_credits_graphics.c). Local pour permettre l'assignment direct
// (ES modules ne permet pas write sur import binding).
let sIntroCharacterGender = 0;
let sFlygonYOffset = 0;
let gIntroCredits_MovingSceneryVBase = 0;
let gIntroCredits_MovingSceneryVOffset = 0;
let gIntroCredits_MovingSceneryState = 0;
`;
      s = s.replace(importMarker, decompGlobalsImport);
    } else {
      console.warn('[post-transpile-patches] import marker not found, skipping import injection');
    }
  }

  // PATCH 2 : Replace TODO LZ77UnCompVram(sIntro1Bg_Gfx, VRAM) ligne avant Bg0_Tilemap
  // Pattern : `/* TODO LZ77UnCompVram — load via rt.LZ77UnCompVram_* at scene init */;` suivi
  // dans les 2 lignes suivantes par `LZ77UnCompVram(sIntro1Bg0_Tilemap`.
  s = s.replace(
    /\/\* TODO LZ77UnCompVram — load via rt\.LZ77UnCompVram_\* at scene init \*\/;\s*\n(\s*LZ77UnCompVram\(sIntro1Bg0_Tilemap)/g,
    'LZ77UnCompVram(sIntro1Bg_Gfx, 0);\n$1',
  );

  // PATCH 3 : Replace TODOs LoadCompressedSpriteSheet/LoadSpritePalettes Scene 1
  // par les vrais appels avec data + tag (1:1 décomp src/intro.c:1192-1196)
  s = s.replace(
    /\/\* TODO LoadCompressedSpriteSheet — load via rt\.LoadCompressedSpriteSheetsFromTable \*\/;\s*\n\s*\/\* TODO LoadCompressedSpriteSheet — load via rt\.LoadCompressedSpriteSheetsFromTable \*\/;\s*\n\s*\/\* TODO LoadSpritePalettes — load via rt\.LoadSpritePalettesFromTable \*\/;\s*\n\s*\/\* TODO LoadCompressedSpriteSheet — load via rt\.LoadCompressedSpriteSheetsFromTable \*\/;\s*\n\s*\/\* TODO LoadSpritePalettes — load via rt\.LoadSpritePalettesFromTable \*\/;/,
    `LoadCompressedSpriteSheet({ data: sIntroDropsLogo_Gfx, size: 0, tag: 'GFXTAG_DROPS_LOGO' });
      LoadCompressedSpriteSheet({ data: gIntroFlygonSilhouette_Gfx, size: 0, tag: 'TAG_FLYGON_SILHOUETTE' });
      LoadSpritePalettes([
        { data: sIntroDrops_Pal, tag: 'PALTAG_DROPS' },
        { data: sIntroLogo_Pal, tag: 'PALTAG_LOGO' },
      ]);
      LoadCompressedSpriteSheet({ data: gIntroSparkle_Gfx, size: 0, tag: 'GFXTAG_SPARKLE' });
      LoadSpritePalettes([
        { data: 'gIntroSparkle_Pal', tag: 'PALTAG_SPARKLE' },
      ]);`,
  );

  // PATCH 4 : Helpers signature — retirer `rt: DecompRuntime` du param + ajouter
  // `const rt = _getRuntime();` au début. 5 helpers concernés.
  const helpersToFix = [
    'CreateGameFreakLogoSprites',
    'CreateWaterDrop',
    'CreateGroudonRockSprites',
    'CreateKyogreBubbleSprites_Body',
    'CreateKyogreBubbleSprites_Fins',
  ];
  for (const helper of helpersToFix) {
    // export function HELPER(rt: DecompRuntime, x, y, ...): TYPE { → export function HELPER(x, y, ...): TYPE { const rt = _getRuntime();
    const re = new RegExp(`(export function ${helper}\\()rt: DecompRuntime,?\\s*([^)]*)\\)(\\s*:[^{]+)\\{`, 'g');
    s = s.replace(re, (_, prefix, args, retType) => {
      const cleanArgs = args.replace(/^\s*,\s*/, '').replace(/\s+/g, ' ').trim();
      return `${prefix}${cleanArgs})${retType}{\n  const rt = _getRuntime();`;
    });
  }

  // PATCH 5 : Bug transpileur "N (...)" → "N * (...)" multiplications
  // 3 occurrences SpriteCB_WaterDrop_Ripple + ligne CreateWaterDrop SetOamMatrix
  s = s.replace(
    /sprite\.data\[3\] = 8 \(sprite\.data\[1\] & 3\);/g,
    'sprite.data[3] = 8 * (sprite.data[1] & 3);',
  );
  s = s.replace(
    /SetOamMatrix\(rt\.gba, d \+ 2, c \+ 32, 0, 0, 2 \(c \+ 32\)\);/g,
    'SetOamMatrix(rt.gba, d + 2, c + 32, 0, 0, 2 * (c + 32));',
  );

  if (s !== before) {
    fs.writeFileSync(FILE, s, 'utf8');
    console.log('[post-transpile-patches] intro-callbacks-auto.ts patched');
  } else {
    console.log('[post-transpile-patches] intro-callbacks-auto.ts already patched (idempotent skip)');
  }
}

patchIntroCallbacks();
console.log('[post-transpile-patches] done');
