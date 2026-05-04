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

const SRC_DIR = path.resolve('src/engine/decomp-data/auto/src');
const FILE = path.resolve(SRC_DIR, 'intro-callbacks-auto.ts');

function patchIntroCallbacks() {
  let s = fs.readFileSync(FILE, 'utf8');
  const before = s;

  // PATCH 1a : Inject _data-tables-flat import (sGameFreakLetterData etc.)
  // si pas déjà présent. Idempotent par check distinct (le PATCH 1b decomp-globals
  // peut être appliqué sans ce data-tables-flat dans certains cas legacy).
  if (!s.includes(`from './_data-tables-flat'`)) {
    const dataFlatImport = `\nimport {\n  sGameFreakLetterData, sGameFreakLetterStartDelays, sGameFreakLettersMoveSpeed,\n  sPresentsLetterData, sSparkleCoords, sGroudonRockData, sKyogreBubbleData,\n} from './_data-tables-flat';`;
    s = s.replace(`} from '../../intro-data';`, `} from '../../intro-data';${dataFlatImport}`);
  }

  // PATCH 1b : Inject decomp-globals import block après l'import depuis intro-data.
  // Skip si déjà appliqué.
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
  CreateBicycleBgAnimationTask, SetIntroPart2BgCnt, CycleSceneryPalette,
  // Audio (Phase 1 Action 4 #1)
  m4aSongNumStart, MUS_INTRO, MUS_INTRO_BATTLE, PlaySE,
  // Scene 3 palette dyn (Phase 1 Action 4 #5)
  INTRO3_RAW_PTR,
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

  // PATCH 4b : Replace SEUL le PREMIER TODO sound par m4aSongNumStart(MUS_INTRO).
  // Le décomp `Task_Scene1_FadeIn` line 1216 = `m4aSongNumStart(MUS_INTRO)` →
  //   débloque la musique d'intro ✓
  // Le décomp `Task_Scene3_Load` line 1739 = `m4aSongNumStart(MUS_INTRO_BATTLE)` →
  //   Phase 2 : commenté pour l'instant car le swap song corrompt l'audio
  //   (TODO Phase 3 audit : implementer stopSong + cleanup voices proprement
  //   avant que le 2e song démarre).
  let soundReplaceCount = 0;
  s = s.replace(/\/\* TODO sound: m4aSongNumStart \*\/;/g, () => {
    soundReplaceCount++;
    if (soundReplaceCount === 1) return 'm4aSongNumStart(MUS_INTRO);';
    return `/* TODO sound: m4aSongNumStart #${soundReplaceCount} (Phase 3) */;`;
  });

  // PATCH 4c : Replace `/* TODO: INTRO3_RAW_PTR(X) */ new Uint16Array(0)` par
  // `INTRO3_RAW_PTR(X)` (= 1:1 décomp src/intro.c:1870 macro).
  s = s.replace(
    /\/\* TODO: INTRO3_RAW_PTR\(([^)]+)\) \*\/ new Uint16Array\(0\)/g,
    'INTRO3_RAW_PTR($1)',
  );

  // PATCH 4d : Replace TODO LZ77 dans Task_Scene3_Load par sIntroPokeball_Gfx → 0
  // (1:1 décomp src/intro.c:1724 `LZ77UnCompVram(sIntroPokeball_Gfx, (void *)VRAM)`).
  s = s.replace(
    /\/\* TODO LZ77UnCompVram — load via rt\.LZ77UnCompVram_\* at scene init \*\/;\s*\n(\s*LZ77UnCompVram\(sIntroPokeball_Tilemap)/g,
    'LZ77UnCompVram(sIntroPokeball_Gfx, 0);\n$1',
  );

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

function patchTitleScreenCallbacks() {
  const FILE = path.resolve(SRC_DIR, 'title_screen-callbacks-auto.ts');
  if (!fs.existsSync(FILE)) {
    console.log('[post-transpile-patches] title_screen-callbacks-auto.ts not found, skip');
    return;
  }
  let s = fs.readFileSync(FILE, 'utf8');
  const before = s;

  // PATCH T1 : (placeholder — sSpritePalette_PressStart correctement défini
  // comme array dans decomp-globals, le `[0]` du transpileur est correct).

  // PATCH T2 (session 81) : import CB2_InitCopyrightScreenAfterTitleScreen
  // depuis copyright-boot.ts (= défini hors decomp-data/auto).
  if (!s.includes("from '../../../copyright-boot'")) {
    s = s.replace(
      `import { CB2_InitMainMenu } from './main_menu-callbacks-auto';`,
      `import { CB2_InitMainMenu } from './main_menu-callbacks-auto';\nimport { CB2_InitCopyrightScreenAfterTitleScreen } from '../../../copyright-boot';`,
    );
  }

  // PATCH T3 (session 81) : demo loop quand MUS_TITLE finit (Phase3) → fade
  // + transition vers CB2_GoToCopyrightScreen. 1:1 décomp title_screen.c:818-822.
  s = s.replace(
    /(rt\.BeginNormalPaletteFade\("PALETTES_ALL", 0, 0, 16, "RGB_WHITEALPHA"\);\s*)\/\* TODO scene transition: SetMainCallback2\(CB2_GoToCopyrightScreen\) \*\/;/g,
    `$1// MANUAL FIX session 81\n              rt.SetMainCallback2(CB2_GoToCopyrightScreen);`,
  );

  // PATCH T4 (session 81) : CB2_GoToCopyrightScreen → CB2_InitCopyrightScreenAfterTitleScreen.
  // 1:1 décomp title_screen.c:832-836.
  s = s.replace(
    /(if \(!UpdatePaletteFade\(\)\)\s*)\/\* TODO scene transition: SetMainCallback2\(CB2_InitCopyrightScreenAfterTitleScreen\) \*\/;/g,
    `$1// MANUAL FIX session 81\n          rt.SetMainCallback2(CB2_InitCopyrightScreenAfterTitleScreen);`,
  );

  if (s !== before) {
    fs.writeFileSync(FILE, s, 'utf8');
    console.log('[post-transpile-patches] title_screen-callbacks-auto.ts patched');
  } else {
    console.log('[post-transpile-patches] title_screen-callbacks-auto.ts already patched (idempotent skip)');
  }
}

patchTitleScreenCallbacks();

// ─── Option menu (session 82) ────────────────────────────────────────────────

function patchOptionMenuCallbacks() {
  const FILE = path.resolve(SRC_DIR, 'option_menu-callbacks-auto.ts');
  if (!fs.existsSync(FILE)) {
    console.log('[post-transpile-patches] option_menu-callbacks-auto.ts not found, skip');
    return;
  }
  let s = fs.readFileSync(FILE, 'utf8');
  const before = s;

  // PATCH O1 (session 82) : case 10 du CB2_InitOptionMenu utilise `task.data[X]`
  // mais `task` n'existe pas dans le scope CB2 (= ReferenceError → state stuck
  // à 10 → CreateTask en boucle). Fix : utiliser le helper local `_gt(rt, taskId)`
  // au lieu de `task` direct.
  if (s.includes(`let taskId = rt.CreateTask((t) => Task_OptionMenuFadeIn(t, rt), 0);\n\n          task.data[0] = 0;`)) {
    s = s.replace(
      `let taskId = rt.CreateTask((t) => Task_OptionMenuFadeIn(t, rt), 0);\n\n          task.data[0] = 0;`,
      `const taskId = rt.CreateTask((t) => Task_OptionMenuFadeIn(t, rt), 0);\n          // ✅ FIX session 82 : \`task\` undefined dans CB2 scope → use _gt helper.\n          const task = _gt(rt, taskId);\n          task.data[0] = 0;`,
    );
  }

  // PATCH O2 (session 82) : case 11 a `/* TODO scene transition: SetMainCallback2(MainCB2) */`
  // → fade fire en boucle, pas de transition. Fix : appel réel.
  s = s.replace(
    /(rt\.BeginNormalPaletteFade\("PALETTES_ALL", 0, 16, 0, "RGB_BLACK"\);\s*\/\* noop SetVBlankCallback \*\/;\s*)\/\* TODO scene transition: SetMainCallback2\(MainCB2\) \*\/;/g,
    `$1// ✅ FIX session 82 : transition vers MainCB2 (= était \`/* TODO */\`).\n          rt.SetMainCallback2(MainCB2);`,
  );

  // PATCH O3 (session 82) : Task_OptionMenuFadeOut a `/* TODO scene transition:
  // SetMainCallback2(gMain.savedCallback) */` → bloqué sur écran noir. Fix : appel réel.
  s = s.replace(
    /(FreeAllWindowBuffers\(\);\s*)\/\* TODO scene transition: SetMainCallback2\(gMain\.savedCallback\) \*\/;/g,
    `$1// ✅ FIX session 82 : retour à l'appelant (= main menu CB2_ReinitMainMenu, ou field menu).\n          rt.SetMainCallback2(gMain.savedCallback ?? null);`,
  );

  // PATCH O5 (session 82) : DmaClear16 sur PLTT au case 1 (= était `/* TODO DmaClear16 */`).
  // Sans ça, palette précédente persiste pendant init → flash bright pendant fade-in.
  // 1:1 décomp option_menu.c:159.
  s = s.replace(
    /\/\* TODO DmaClear16 \(memory clear\) \*\/;/g,
    `// ✅ FIX session 82 : DmaClear16 sur PLTT (= 0x05000000-0x050003FF) pour effacer\n          // la palette HW dès l'init (= screen black during state 1-10 jusqu'au fade-in).\n          DmaClear16(3, 0x05000000, 0x400);`,
  );

  // PATCH O6 (session 82) : `/* noop SetVBlankCallback */` → `rt.SetVBlankCallback(NULL/VBlankCB)`.
  // Décomp `SetVBlankCallback(NULL)` au state 0 désactive PLTT transfer pendant init →
  // pas de flash. Réinstall au state 11 (= via VBlankCB) → fade-in propre.
  // Le transpileur convertit ces calls en TODO comments, on les réactive ici.
  // CASE 0 : SetVBlankCallback(NULL).
  s = s.replace(
    /(case 0:\s*)\/\* noop SetVBlankCallback \*\/;/g,
    `$1// ✅ FIX session 82 : disable VBlankCB pendant init pour pas de flash bright.\n          rt.SetVBlankCallback(null);`,
  );
  // CASE 11 : SetVBlankCallback(VBlankCB) — entre BeginNormalPaletteFade et SetMainCallback2.
  s = s.replace(
    /(rt\.BeginNormalPaletteFade\("PALETTES_ALL", 0, 16, 0, "RGB_BLACK"\);\s*)\/\* noop SetVBlankCallback \*\/;/g,
    `$1// ✅ FIX session 82 : réinstall VBlankCB → TransferPlttBuffer reprend → fade-in.\n          rt.SetVBlankCallback(VBlankCB);`,
  );

  // PATCH O4 (session 82) : ajout `export const MainCB2 + VBlankCB = (_rt) => {}` (= no-op,
  // notre runtime drive RunTasks/UpdatePaletteFade/TransferPlttBuffer auto). Le
  // transpileur omet ces exports, on les ajoute en fin de fichier.
  if (!s.includes('export const MainCB2: CB2Callback')) {
    s = s.trimEnd() + `\n\n/** Source: option_menu.c → MainCB2 (no-op chez nous, runtime drive RunTasks\n *  + UpdatePaletteFade automatiquement pour les callbacks \`MainCB2*\`).\n *  ⚠️ MANUAL FIX session 82 : transpileur omet ce export, ajouté in-place. */\nexport const MainCB2: CB2Callback = (_rt) => {\n  // No-op : runtime drives the rest.\n};\n`;
  }
  if (!s.includes('export const VBlankCB:')) {
    s = s.trimEnd() + `\n\n/** Source: option_menu.c → VBlankCB. 1:1 décomp call TransferPlttBuffer.\n *  Notre runtime factor le TransferPlttBuffer call quand vblankCallback non-null.\n *  ⚠️ MANUAL FIX session 82 : transpileur omet ce export, ajouté in-place. */\nexport const VBlankCB: () => void = () => {\n  // No-op : runtime calls TransferPlttBuffer when vblankCallback is set.\n};\n`;
  }

  if (s !== before) {
    fs.writeFileSync(FILE, s, 'utf8');
    console.log('[post-transpile-patches] option_menu-callbacks-auto.ts patched');
  } else {
    console.log('[post-transpile-patches] option_menu-callbacks-auto.ts already patched (idempotent skip)');
  }
}

patchOptionMenuCallbacks();

// ─── Main menu Mystery Gift/Event/EReader stubs (= unreachable sans wireless) ─

function patchMainMenuMysteryStubs() {
  const FILE = path.resolve(SRC_DIR, 'main_menu-callbacks-auto.ts');
  if (!fs.existsSync(FILE)) {
    console.log('[post-transpile-patches] main_menu-callbacks-auto.ts not found, skip');
    return;
  }
  let s = fs.readFileSync(FILE, 'utf8');
  const before = s;

  // PATCH M1 (audit session 83) : les 3 actions Mystery Gift/Event/EReader sont
  // gated par IsWirelessAdapterConnected (= toujours false chez nous, web pas
  // de wireless adapter) + IsMysteryGiftEnabled (= idem). Donc ces transitions
  // sont code mort qu'on ne peut pas atteindre dans le flow normal.
  // Pour 1:1 décomp + safe runtime : remplacer les TODOs par un console.warn
  // explicite (= pas de scene transition). Si quelqu'un trigger ces actions
  // (par dev tool), il verra un warning au lieu d'un silent fail.
  const mysteryReplacements = [
    {
      from: '/* TODO scene transition: SetMainCallback2(CB2_InitMysteryGift) */;',
      to: "console.warn('[main_menu] Mystery Gift unreachable (no wireless adapter in web build)');",
    },
    {
      from: '/* TODO scene transition: SetMainCallback2(CB2_InitMysteryEventMenu) */;',
      to: "console.warn('[main_menu] Mystery Events unreachable (no wireless adapter in web build)');",
    },
    {
      from: '/* TODO scene transition: SetMainCallback2(CB2_InitEReader) */;',
      to: "console.warn('[main_menu] EReader unreachable (no e-Reader cartridge in web build)');",
    },
  ];
  for (const { from, to } of mysteryReplacements) {
    if (s.includes(from)) {
      s = s.replace(from, `// ✅ FIX session 83 audit : action gated par IsWirelessAdapterConnected(false).\n                  ${to}`);
    }
  }

  // PATCH M2 (audit session 83) : retire 2× console.log debug noisy dans
  // CB2_MainMenu + CB2_InitMainMenu (= 1:1 décomp pure, le décomp n'a pas
  // ces logs). Le transpileur les avait laissés en debug.
  s = s.replace(
    /\s*if \(rt\.gIntroFrameCounter % 60 === 0\) \{\s*\n\s*console\.log\('\[CB2_MainMenu\][^\n]+\);\s*\n\s*\}/,
    '',
  );
  s = s.replace(
    /\s*console\.log\('\[CB2_InitMainMenu\] called'\);\s*\n/,
    '\n  ',
  );

  if (s !== before) {
    fs.writeFileSync(FILE, s, 'utf8');
    console.log('[post-transpile-patches] main_menu-callbacks-auto.ts mystery stubs patched');
  } else {
    console.log('[post-transpile-patches] main_menu-callbacks-auto.ts mystery stubs already patched (idempotent skip)');
  }
}

patchMainMenuMysteryStubs();

// ─── Generic patches (= s'appliquent à TOUS les *-callbacks-auto.ts) ─────────
//
// Architecture observation #1 (audit session 83) : le pattern transpileur
// `/* TODO scene transition: SetMainCallback2(X) */;` et
// `/* noop SetVBlankCallback */;` apparaissent dans 73 fichiers auto. Plutôt
// que dupliquer une fonction de patch par fichier, on factor le générique ici.
//
// Les 3 fonctions spécifiques (intro/title_screen/option_menu) ci-dessus
// patchent les cas particuliers AVANT, puis le générique ratisse le reste.
// Idempotent : les patterns recherchés (`/* TODO */`, `/* noop */`) ont
// disparu après replacement, donc re-run est safe.

/**
 * Apply generic patches that work on any *-callbacks-auto.ts file.
 * @param {string} content
 * @returns {{ content: string, changed: boolean, notes: string[] }}
 */
function applyGenericPatches(content) {
  let s = content;
  const notes = [];
  const before = s;

  // Extract import names to know which CB2_* are resolvable in this file.
  // Avoid runtime ReferenceError on unimplemented scenes by only patching
  // when the target is in scope (= imported, declared local, or in a known
  // safe-globals list like `gMain.savedCallback`).
  const importedSymbols = new Set();
  for (const match of s.matchAll(/import\s*(?:type\s*)?\{([^}]+)\}\s*from/g)) {
    for (const sym of match[1].split(',')) {
      const name = sym.trim().split(/\s+as\s+/)[0].trim();
      if (name) importedSymbols.add(name);
    }
  }
  // Local exports (`export const X`) aussi callable depuis le fichier.
  for (const match of s.matchAll(/export\s+(?:const|function)\s+(\w+)/g)) {
    importedSymbols.add(match[1]);
  }

  function isResolvable(target) {
    target = target.trim();
    // Always resolvable : property access on globals (gMain.X, etc.).
    if (target.startsWith('gMain.') || target.startsWith('gMain?.')) return true;
    // Identifier — check imports/exports.
    if (/^\w+$/.test(target)) return importedSymbols.has(target);
    return false;  // Complex expression — safer to skip.
  }

  // ─── G1 : /* TODO scene transition: SetMainCallback2(X) */; → rt.SetMainCallback2(X) ─
  let g1Patched = 0, g1Skipped = 0;
  s = s.replace(
    /\/\* TODO scene transition: SetMainCallback2\(([^)]+)\) \*\/;/g,
    (match, target) => {
      if (!isResolvable(target)) {
        g1Skipped++;
        return match;  // Leave TODO — target not in scope.
      }
      g1Patched++;
      // gMain.savedCallback peut être null → ?? null fallback.
      if (target.includes('savedCallback')) {
        return `rt.SetMainCallback2(${target} ?? null);`;
      }
      return `rt.SetMainCallback2(${target});`;
    },
  );
  if (g1Patched) notes.push(`G1 SetMainCallback2 ×${g1Patched}`);
  if (g1Skipped) notes.push(`G1 skipped ×${g1Skipped} (target not imported)`);

  // ─── G2 : /* noop SetVBlankCallback */; → rt.SetVBlankCallback(VBlankCB) ──
  // Notre runtime drive TransferPlttBuffer auto si vblankCallback non-null.
  // Le décomp pose `SetVBlankCallback(VBlankCB)` à la fin d'un init pour
  // réactiver le transfer. On suit ce comportement par défaut.
  // Cas spécifique (= disable VBlankCB pendant init pour pas de flash) géré
  // par les patches scene-spécifiques (cf. PATCH O6 option_menu) AVANT ce générique.
  let g2Patched = 0;
  s = s.replace(/\/\* noop SetVBlankCallback \*\/;/g, () => {
    g2Patched++;
    return 'rt.SetVBlankCallback(VBlankCB);';
  });
  if (g2Patched) notes.push(`G2 SetVBlankCallback(VBlankCB) ×${g2Patched}`);

  // ─── G3 : Inject `const VBlankCB` no-op si référencé mais pas défini ─────
  // Notre runtime fait TransferPlttBuffer auto, donc le VBlankCB scene-side
  // est essentiellement no-op (= sa présence non-null suffit à activer le transfer).
  if (s.includes('rt.SetVBlankCallback(VBlankCB)') &&
      !/(?:^|\n)(?:export\s+)?const\s+VBlankCB[\s:=]/.test(s) &&
      !importedSymbols.has('VBlankCB')) {
    s = s.trimEnd() + `

/** ⚠️ Generic patch (post-transpile-patches.mjs) — VBlankCB no-op.
 *  Notre runtime call TransferPlttBuffer auto si vblankCallback non-null,
 *  donc le scene-side VBlankCB est essentiellement un marqueur "transfer ON". */
const VBlankCB: () => void = () => { /* no-op */ };
`;
    notes.push('G3 added VBlankCB no-op');
  }

  return { content: s, changed: s !== before, notes };
}

function patchAllAutoFilesGeneric() {
  const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('-callbacks-auto.ts'));
  let totalPatched = 0;
  for (const fname of files) {
    const filePath = path.resolve(SRC_DIR, fname);
    const before = fs.readFileSync(filePath, 'utf8');
    const { content: after, changed, notes } = applyGenericPatches(before);
    if (changed) {
      fs.writeFileSync(filePath, after, 'utf8');
      totalPatched++;
      console.log(`[post-transpile-patches] [generic] ${fname} : ${notes.join(', ')}`);
    }
  }
  console.log(`[post-transpile-patches] [generic] ${totalPatched}/${files.length} auto files patched`);
}

patchAllAutoFilesGeneric();

console.log('[post-transpile-patches] done');
