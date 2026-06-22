/**
 * mail.ts — port 1:1 STRICT de `src/mail.c` (753 lignes décomp).
 *
 * Source de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/mail.c`
 *   - `D:/Projet 1/decomps/pokeemeraude/include/mail.h`
 *   - `D:/Projet 1/decomps/pokeemeraude/include/global.h:770` (struct Mail)
 *
 * Rôle dans le port :
 *   - ReadMail(mail, exitCallback, hasText) : entry point CB2 swap qui affiche
 *     un mail tenu par un Pokémon (= contexte party menu → "READ MAIL" item
 *     menu → cette CB2 swap, key A/B → restore exitCallback).
 *   - sMailGraphics[12] table palette/tiles/tilemap par type de mail.
 *   - sMailLayouts_Wide / sMailLayouts_Tall : positional data par mail type.
 *   - Pipeline VBlank + sprite icon (BEAD = poke icon @96/128, DREAM @40/128).
 *
 * Dépendances déférées 1:1 (stubs explicites, runtime warn) :
 *   - easy_chat.c : `CopyEasyChatWord`, `ConvertEasyChatWordsToString` — déjà
 *     stub dans decomp-bridge (throw NI). On les wrap pour exposer un warn
 *     non-throw (= mail readable avec placeholder, pas crash).
 *   - pokemon_icon.c : `GetIconSpeciesNoPersonality`, `LoadMonIconPalette`,
 *     `CreateMonIconNoPersonality`, `FreeMonIconPalette`,
 *     `FreeAndDestroyMonIconSprite` — pas portés. Stubs no-op (= mail bead/dream
 *     affiché sans l'icône Pokémon, fond/texte 1:1).
 *   - scanline_effect.c : `ScanlineEffect_Stop` — stub runtime no-op (engine
 *     ne modélise pas les scanline effects pour les menus statiques).
 *   - international_string_util.c : `ConvertInternationalPlayerName` — stub
 *     no-op (= player name déjà UTF-8 dans notre port).
 *   - text_window.c : `LoadMessageBoxGfx` non requis ici (= mail.c utilise
 *     directement GetOverworldTextboxPalettePtr, pas un message box frame).
 *
 * Assets graphiques (DETTE) :
 *   - Aucun asset mail extrait dans `public/decomp/em/mail/`. Les 12 mail
 *     designs (orange/harbor/glitter/mech/wood/wave/bead/shadow/tropic/dream/
 *     fab/retro) ont chacun palette + tiles + tilemap dans
 *     `graphics/mail/<name>/{palette.gbapal, tiles.4bpp.lz, tilemap.bin.lz}`
 *     du décomp source. À extraire avec le script existant
 *     `scripts/extract_emerald_assets.py` ; tant que ce n'est pas fait,
 *     `sMailGraphics[*].tiles/tileMap/palette` retournent null et le BG est
 *     vide (= chemin happy path A/B = wireframe testable mais pas pixel-perfect).
 *   - Le pipeline est cependant 1:1 : DecompressAndCopyTileDataToVram +
 *     CopyToBgTilemapBuffer + LoadPalette sont appelés, ils seront effectifs
 *     dès que les assets seront présents (= zero diff de code à faire).
 *
 *
 *  Conventions TS / 1:1 :
 *   - `sMailRead` est notre EWRAM (= seul singleton module-local autorisé).
 *   - Les state machine cases (= MailReadBuildGraphics switch state++) sont
 *     préservées intégralement.
 *   - Les callbacks (CB2_*, VBlankCB_*) sont des fonctions module-level.
 */

import {
  getRuntime,
  LoadPalette,
  ResetPaletteFade,
  ResetTasks,
  ScanlineEffect_Stop,
  FreeAllSpritePalettes,
  PALETTES_ALL,
  MALE, FEMALE,
  CpuFill16, OAM_SIZE, OAM,
} from '../system/decomp-globals';
import {
  AllocZeroed,
  BeginNormalPaletteFade,
  UpdatePaletteFade,
  SetVBlankCallback,
  SetGpuReg,
  ResetSpriteData,
  GetOverworldTextboxPalettePtr,
} from '../system/decomp-bridge';
import { JOY_NEW, AnimateSprites, BuildOamBuffer } from '../system/decomp-globals';
import {
  InitWindows,
  PutWindowTilemap,
  FillWindowPixelBuffer,
  CopyWindowToVram,
  FreeAllWindowBuffers,
  type WindowTemplate,
} from './gba-window-system';
import { ShowBg, FillBgTilemapBufferRect_Palette0, CopyToBgTilemapBuffer, CopyBgTilemapBufferToVram, ResetBgsAndClearDma3BusyFlags, InitBgsFromTemplates } from './gba-window-system';
import { loadTileBin, loadGbaPal, loadTilemapBin } from '../../../harness/gba/png-loader';
import { ConvertEasyChatWordsToString, CopyEasyChatWord } from '../../easy_chat';
import { GetIconSpeciesNoPersonality, LoadMonIconPalette, CreateMonIconNoPersonality, FreeMonIconPalette, FreeAndDestroyMonIconSprite, PreloadMonIcon, IsMonIconLoaded, UpdateMailMonIcon } from '../../pokemon_icon';
import {
  AddTextPrinterParameterized3,
  RunTextPrinters,
  DeactivateAllTextPrinters,
  FONT_NORMAL,
  GetStringCenterAlignXOffset,
} from './gba-text-system';
import { StringCopy, StringLength } from '../system/decomp-bridge';
import { RGB, RGB_BLACK, RGB_WHITE, PLTT_SIZE_4BPP } from '../system/decomp-helpers';
import { BG_PLTT_ID, REG_OFFSET_DISPCNT, REG_OFFSET_BG0HOFS, REG_OFFSET_BG0VOFS, REG_OFFSET_BG1HOFS, REG_OFFSET_BG1VOFS, REG_OFFSET_BG2HOFS, REG_OFFSET_BG2VOFS, REG_OFFSET_BG3HOFS, REG_OFFSET_BG3VOFS, REG_OFFSET_BLDCNT, REG_OFFSET_BLDALPHA, DISPCNT_OBJ_ON, DISPCNT_OBJ_1D_MAP } from '../system/decomp-runtime';
import { gSaveBlock2Ptr } from '../save/save-block-state';
import { TEXT_COLOR_TRANSPARENT, TEXT_DYNAMIC_COLOR_1, TEXT_DYNAMIC_COLOR_2 } from '../battle/battle-windows';
import { PIXEL_FILL } from '../system/decomp-globals';
import { A_BUTTON, B_BUTTON } from './gba-menu-system';
import type { Mail } from '../save/save-blocks';
import { DISPLAY_WIDTH, DISPLAY_HEIGHT, TILE_WIDTH, TILE_HEIGHT } from '../decomp-data/include/gba/defines-data';
import { GENDER_COUNT, LANGUAGE_FRENCH } from '../decomp-data/include/constants/global-data';
import {
  ITEM_ORANGE_MAIL, ITEM_HARBOR_MAIL, ITEM_GLITTER_MAIL, ITEM_MECH_MAIL,
  ITEM_WOOD_MAIL, ITEM_WAVE_MAIL, ITEM_BEAD_MAIL, ITEM_SHADOW_MAIL,
  ITEM_TROPIC_MAIL, ITEM_DREAM_MAIL, ITEM_FAB_MAIL, ITEM_RETRO_MAIL,
  FIRST_MAIL_INDEX, ITEM_TO_MAIL,
  SPECIES_NONE, NUM_SPECIES,
  MailSpeciesToSpecies,
} from '../../mail_data';

// ─── Type aliases 1:1 décomp ─────────────────────────────────────────────────

/** 1:1 décomp `typedef void (*MainCallback)(void)` (main.h). */
export type MainCallback = (() => void) | null;

// ─── Constantes locales 1:1 décomp ───────────────────────────────────────────

/** 1:1 décomp `gba/defines.h:75-76` — `DISPLAY_TILE_WIDTH = (DISPLAY_WIDTH / TILE_WIDTH)`. */
const DISPLAY_TILE_WIDTH = DISPLAY_WIDTH / TILE_WIDTH;    // = 240/8 = 30
const DISPLAY_TILE_HEIGHT = DISPLAY_HEIGHT / TILE_HEIGHT; // = 160/8 = 20

/** 1:1 décomp `window.h:24` — `enum { COPYWIN_NONE, COPYWIN_MAP, COPYWIN_GFX, COPYWIN_FULL }`. */
const COPYWIN_FULL = 3;

/** 1:1 décomp `mail.c:24-28` — `enum { ICON_TYPE_NONE, ICON_TYPE_BEAD, ICON_TYPE_DREAM }`. */
const ICON_TYPE_NONE = 0;
const ICON_TYPE_BEAD = 1;
const ICON_TYPE_DREAM = 2;

/** 1:1 décomp `include/constants/global.h:25` — `#define GENDER_COUNT 2`.
 *  Migré vers import decomp-data global-data.ts (cleanup B7). */

/** 1:1 décomp `include/constants/global.h:8` — `#define GAME_LANGUAGE LANGUAGE_FRENCH (=3)`.
 *  Notre port FR : on aligne 1:1 sur GAME_LANGUAGE = LANGUAGE_FRENCH = 3.
 *  Migré vers import decomp-data global-data.ts (cleanup B7). */
const GAME_LANGUAGE = LANGUAGE_FRENCH;

// ─── Types internes 1:1 décomp ───────────────────────────────────────────────

/** 1:1 décomp `mail.c:30-35` `struct MailLineLayout`.
 *
 *  numEasyChatWords:2 + xOffset:6 = 1 byte ; height = 1 byte.
 *  TS : pas de bitfield → 2 numbers.
 */
interface MailLineLayout {
  numEasyChatWords: number;
  xOffset: number;
  height: number;
}

/** 1:1 décomp `mail.c:37-45` `struct MailLayout`. */
interface MailLayout {
  numLines: number;
  signatureYPos: number;
  signatureWidth: number;
  wordsYPos: number;
  wordsXPos: number;
  lines: readonly MailLineLayout[];
}

/** 1:1 décomp `mail.c:47-55` `struct MailGraphics`.
 *
 *  Les palette/tiles/tileMap sont des `const u16 *` / `const u32 *` en décomp
 *  (= symboles asset). En TS port, on stocke directement les
 *  `Uint16Array | Uint8Array` pré-chargés (ou `null` tant que l'asset n'est
 *  pas extrait dans `public/decomp/em/mail/`).
 */
interface MailGraphics {
  palette: Uint16Array | null;
  tiles: Uint8Array | null;
  tileMap: Uint16Array | null;
  unused: number;
  textColor: number;
  textShadow: number;
}

/** 1:1 décomp `mail.c:57-76` `struct MailRead`. EWRAM runtime state. */
interface MailRead {
  /*0x0000*/ message: Uint8Array[];      // [8][64] — buffer text per line
  /*0x0200*/ playerName: string;          // [12] décomp ; TS : string
  /*0x020C*/ exitCallback: MainCallback;
  /*0x0210*/ callback: (() => void) | null;
  /*0x0214*/ mail: Mail | null;
  /*0x0218*/ hasText: boolean;
  /*0x0219*/ signatureWidth: number;
  /*0x021a*/ mailType: number;
  /*0x021b*/ iconType: number;
  /*0x021c*/ monIconSpriteId: number;
  /*0x021d*/ language: number;
  /*0x021e*/ international: boolean;
  /*0x0220*/ parserSingle: ((dest: any, word: number) => any) | null;
  /*0x0224*/ parserMultiple: ((dest: any, src: number[] | Uint16Array, length1: number, length2: number) => any) | null;
  /*0x0228*/ layout: MailLayout | null;
  /*0x022c*/ bg1TilemapBuffer: Uint8Array;  // [0x1000]
  /*0x122c*/ bg2TilemapBuffer: Uint8Array;  // [0x1000]
}

// ─── EWRAM (= module-local singleton) ────────────────────────────────────────

/** 1:1 décomp `static EWRAM_DATA struct MailRead *sMailRead = NULL;` (mail.c:78). */
let sMailRead: MailRead | null = null;

// ─── BG / Window templates 1:1 décomp ────────────────────────────────────────

/** 1:1 décomp `static const struct BgTemplate sBgTemplates[]` (mail.c:89-106). */
const sBgTemplates = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
] as const;

/** 1:1 décomp `static const struct WindowTemplate sWindowTemplates[]` (mail.c:108-119).
 *  Suivi de `DUMMY_WIN_TEMPLATE` (= sentinelle `bg == 0xFF`, cf.
 *  gba-window-system.ts:155 InitWindows). */
const sWindowTemplates: readonly WindowTemplate[] = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 3, width: 26, height: 15, paletteNum: 15, baseBlock: 1 },
  // 1:1 décomp DUMMY_WIN_TEMPLATE — bg = 0xFF sentinel stoppe l'allocation.
  { bg: 0xFF, tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0 },
];

/** 1:1 décomp `static const u8 sTextColors[]` (mail.c:121-125). */
const sTextColors: readonly number[] = [
  TEXT_COLOR_TRANSPARENT,
  TEXT_DYNAMIC_COLOR_1,
  TEXT_DYNAMIC_COLOR_2,
];

/** 1:1 décomp `static const u16 sBgColors[GENDER_COUNT][2]` (mail.c:129-132).
 *  Alternating bars dark/light. MALE = blue, FEMALE = red.
 *
 *    [MALE]   = { RGB(13, 22, 26), RGB(5, 13, 20) },
 *    [FEMALE] = { RGB(28, 15, 17), RGB(20, 6, 14) }
 */
const sBgColors: readonly (readonly number[])[] = (() => {
  const out: number[][] = new Array(GENDER_COUNT);
  out[MALE] = [RGB(13, 22, 26), RGB(5, 13, 20)];
  out[FEMALE] = [RGB(28, 15, 17), RGB(20, 6, 14)];
  return out;
})();

// ─── sMailGraphics[12] 1:1 décomp (mail.c:134-231) ───────────────────────────
//
// Les assets `gMailPalette_*`, `gMailTiles_*`, `gMailTilemap_*` sont des
// symboles `extern const ...` du décomp pointant vers `graphics/mail/<name>/`.
// Le décomp les a EN ROM (synchrone) ; nous on les charge depuis le réseau
// (async) via `_mailLoadGraphics(mailType)` au premier hit du case 8 de
// `MailReadBuildGraphics`. Les champs partent à `null` (valeur initiale) et
// sont remplis une fois le fetch fini → le case 8 GATE (return false) le temps
// du chargement. Déviation M3 minimale (1 ligne de gate), sinon 1:1.

function _stubAsset(_name: string): null {
  // Valeur initiale `null` (rempli async par _mailLoadGraphics). Le nom du
  // symbole décomp est gardé pour la traçabilité 1:1.
  return null;
}

const sMailGraphics: readonly MailGraphics[] = [
  // [ITEM_TO_MAIL(ITEM_ORANGE_MAIL)] = 0
  {
    palette: _stubAsset('gMailPalette_Orange'),
    tiles: _stubAsset('gMailTiles_Orange'),
    tileMap: _stubAsset('gMailTilemap_Orange'),
    unused: 0x2C0,
    textColor: RGB(10, 10, 10),
    textShadow: RGB(25, 25, 25),
  },
  // [ITEM_TO_MAIL(ITEM_HARBOR_MAIL)] = 1
  {
    palette: _stubAsset('gMailPalette_Harbor'),
    tiles: _stubAsset('gMailTiles_Harbor'),
    tileMap: _stubAsset('gMailTilemap_Harbor'),
    unused: 0x2E0,
    textColor: RGB_WHITE,
    textShadow: RGB(17, 17, 17),
  },
  // [ITEM_TO_MAIL(ITEM_GLITTER_MAIL)] = 2
  {
    palette: _stubAsset('gMailPalette_Glitter'),
    tiles: _stubAsset('gMailTiles_Glitter'),
    tileMap: _stubAsset('gMailTilemap_Glitter'),
    unused: 0x400,
    textColor: RGB(10, 10, 10),
    textShadow: RGB(25, 25, 25),
  },
  // [ITEM_TO_MAIL(ITEM_MECH_MAIL)] = 3
  {
    palette: _stubAsset('gMailPalette_Mech'),
    tiles: _stubAsset('gMailTiles_Mech'),
    tileMap: _stubAsset('gMailTilemap_Mech'),
    unused: 0x1E0,
    textColor: RGB_WHITE,
    textShadow: RGB(17, 17, 17),
  },
  // [ITEM_TO_MAIL(ITEM_WOOD_MAIL)] = 4
  {
    palette: _stubAsset('gMailPalette_Wood'),
    tiles: _stubAsset('gMailTiles_Wood'),
    tileMap: _stubAsset('gMailTilemap_Wood'),
    unused: 0x2E0,
    textColor: RGB_WHITE,
    textShadow: RGB(17, 17, 17),
  },
  // [ITEM_TO_MAIL(ITEM_WAVE_MAIL)] = 5
  {
    palette: _stubAsset('gMailPalette_Wave'),
    tiles: _stubAsset('gMailTiles_Wave'),
    tileMap: _stubAsset('gMailTilemap_Wave'),
    unused: 0x300,
    textColor: RGB(10, 10, 10),
    textShadow: RGB(25, 25, 25),
  },
  // [ITEM_TO_MAIL(ITEM_BEAD_MAIL)] = 6
  {
    palette: _stubAsset('gMailPalette_Bead'),
    tiles: _stubAsset('gMailTiles_Bead'),
    tileMap: _stubAsset('gMailTilemap_Bead'),
    unused: 0x140,
    textColor: RGB_WHITE,
    textShadow: RGB(17, 17, 17),
  },
  // [ITEM_TO_MAIL(ITEM_SHADOW_MAIL)] = 7
  {
    palette: _stubAsset('gMailPalette_Shadow'),
    tiles: _stubAsset('gMailTiles_Shadow'),
    tileMap: _stubAsset('gMailTilemap_Shadow'),
    unused: 0x300,
    textColor: RGB_WHITE,
    textShadow: RGB(17, 17, 17),
  },
  // [ITEM_TO_MAIL(ITEM_TROPIC_MAIL)] = 8
  {
    palette: _stubAsset('gMailPalette_Tropic'),
    tiles: _stubAsset('gMailTiles_Tropic'),
    tileMap: _stubAsset('gMailTilemap_Tropic'),
    unused: 0x220,
    textColor: RGB(10, 10, 10),
    textShadow: RGB(25, 25, 25),
  },
  // [ITEM_TO_MAIL(ITEM_DREAM_MAIL)] = 9
  {
    palette: _stubAsset('gMailPalette_Dream'),
    tiles: _stubAsset('gMailTiles_Dream'),
    tileMap: _stubAsset('gMailTilemap_Dream'),
    unused: 0x340,
    textColor: RGB(10, 10, 10),
    textShadow: RGB(25, 25, 25),
  },
  // [ITEM_TO_MAIL(ITEM_FAB_MAIL)] = 10
  {
    palette: _stubAsset('gMailPalette_Fab'),
    tiles: _stubAsset('gMailTiles_Fab'),
    tileMap: _stubAsset('gMailTilemap_Fab'),
    unused: 0x2a0,
    textColor: RGB(10, 10, 10),
    textShadow: RGB(25, 25, 25),
  },
  // [ITEM_TO_MAIL(ITEM_RETRO_MAIL)] = 11
  {
    palette: _stubAsset('gMailPalette_Retro'),
    tiles: _stubAsset('gMailTiles_Retro'),
    tileMap: _stubAsset('gMailTilemap_Retro'),
    unused: 0x520,
    textColor: RGB(10, 10, 10),
    textShadow: RGB(25, 25, 25),
  },
];

// ─── Chargement async des graphismes mail (pont M3 ROM→réseau) ───────────────
//
// Le décomp lit `sMailGraphics[t].{tiles,tileMap,palette}` direct depuis la ROM.
// Ici on fetch les assets extraits (`public/decomp/em/mail/<design>/`) :
//   - tiles.png   → loadTileBin (charge le `.4bpp.bin` sibling = indices bruts ;
//                   taille = champ `unused` du décomp, vérifié byte-exact)
//   - palette.pal → loadGbaPal (= gMailPalette_<design>, 16 RGB15 ; == PLTE 16/16)
//   - map.bin     → loadTilemapBin (Uint16Array d'entries tilemap)
// Une fois chargés, on remplit les champs (mutables) de la table → le case 8 de
// MailReadBuildGraphics débloque (gate). Idempotent (guard _mailGfxLoading).

/** Dossiers `graphics/mail/<design>/` indexés par mailType (= ITEM_TO_MAIL). */
const sMailDesignDirs = [
  'orange', 'harbor', 'glitter', 'mech', 'wood', 'wave',
  'bead', 'shadow', 'tropic', 'dream', 'fab', 'retro',
] as const;

const _mailGfxLoaded: boolean[] = new Array(sMailDesignDirs.length).fill(false);
const _mailGfxLoading: Array<Promise<void> | null> = new Array(sMailDesignDirs.length).fill(null);
// M3 : set par le case 8 quand il GATE sur le fetch async → signale à
// CB2_InitMailRead de yield la frame (sinon son do-while solo spin → freeze).
let _mailGfxWaiting = false;

/** Charge (une fois) tiles/palette/tileMap du design `mailType` dans la table.
 *  Fire-and-forget : le case 8 gate sur `_mailGfxLoaded[mailType]`. En cas
 *  d'échec réseau, release quand même le gate → mail rendu wireframe (= ancien
 *  fallback), jamais de freeze. */
function _mailLoadGraphics(mailType: number): void {
  if (mailType < 0 || mailType >= sMailDesignDirs.length) return;
  if (_mailGfxLoaded[mailType] || _mailGfxLoading[mailType]) return;
  const dir = sMailDesignDirs[mailType];
  const base = `/decomp/em/mail/${dir}`;
  _mailGfxLoading[mailType] = (async () => {
    try {
      const [tiles, palette, tileMap] = await Promise.all([
        loadTileBin(`${base}/tiles.png`, 4),
        loadGbaPal(`${base}/palette.pal`),
        loadTilemapBin(`${base}/map.bin`),
      ]);
      const g = sMailGraphics[mailType];
      g.tiles = tiles;
      g.palette = palette;
      g.tileMap = tileMap;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`[mail] échec chargement graphismes ${dir} (mail rendu wireframe) :`, e);
    } finally {
      _mailGfxLoaded[mailType] = true; // release le gate (succès → réel, échec → wireframe)
    }
  })();
}

// ─── sLineLayouts_Wide / sMailLayouts_Wide 1:1 décomp ────────────────────────

/** 1:1 décomp `static const struct MailLineLayout sLineLayouts_Wide[]`
 *  (mail.c:233-237). 3 lines × 3 easy chat words. */
const sLineLayouts_Wide: readonly MailLineLayout[] = [
  { numEasyChatWords: 3, xOffset: 0, height: 16 },
  { numEasyChatWords: 3, xOffset: 0, height: 16 },
  { numEasyChatWords: 3, xOffset: 0, height: 16 },
];

/** 1:1 décomp `static const struct MailLayout sMailLayouts_Wide[]`
 *  (mail.c:239-336). 12 entries, indexed par ITEM_TO_MAIL(ITEM_*_MAIL).
 *
 *  Tous ont `numLines = 3`, `wordsYPos = 2`. Diffs : Fab a `signatureYPos = 8`,
 *  Retro a `wordsXPos = 0` (vs 4 pour tous les autres). */
const sMailLayouts_Wide: readonly MailLayout[] = [
  // Orange (0)
  { numLines: sLineLayouts_Wide.length, signatureYPos: 0, signatureWidth: 0, wordsYPos: 2, wordsXPos: 4, lines: sLineLayouts_Wide },
  // Harbor (1)
  { numLines: sLineLayouts_Wide.length, signatureYPos: 0, signatureWidth: 0, wordsYPos: 2, wordsXPos: 4, lines: sLineLayouts_Wide },
  // Glitter (2)
  { numLines: sLineLayouts_Wide.length, signatureYPos: 0, signatureWidth: 0, wordsYPos: 2, wordsXPos: 4, lines: sLineLayouts_Wide },
  // Mech (3)
  { numLines: sLineLayouts_Wide.length, signatureYPos: 0, signatureWidth: 0, wordsYPos: 2, wordsXPos: 4, lines: sLineLayouts_Wide },
  // Wood (4)
  { numLines: sLineLayouts_Wide.length, signatureYPos: 0, signatureWidth: 0, wordsYPos: 2, wordsXPos: 4, lines: sLineLayouts_Wide },
  // Wave (5)
  { numLines: sLineLayouts_Wide.length, signatureYPos: 0, signatureWidth: 0, wordsYPos: 2, wordsXPos: 4, lines: sLineLayouts_Wide },
  // Bead (6)
  { numLines: sLineLayouts_Wide.length, signatureYPos: 0, signatureWidth: 0, wordsYPos: 2, wordsXPos: 4, lines: sLineLayouts_Wide },
  // Shadow (7)
  { numLines: sLineLayouts_Wide.length, signatureYPos: 0, signatureWidth: 0, wordsYPos: 2, wordsXPos: 4, lines: sLineLayouts_Wide },
  // Tropic (8)
  { numLines: sLineLayouts_Wide.length, signatureYPos: 0, signatureWidth: 0, wordsYPos: 2, wordsXPos: 4, lines: sLineLayouts_Wide },
  // Dream (9)
  { numLines: sLineLayouts_Wide.length, signatureYPos: 0, signatureWidth: 0, wordsYPos: 2, wordsXPos: 4, lines: sLineLayouts_Wide },
  // Fab (10) — signatureYPos = 8
  { numLines: sLineLayouts_Wide.length, signatureYPos: 8, signatureWidth: 0, wordsYPos: 2, wordsXPos: 4, lines: sLineLayouts_Wide },
  // Retro (11) — wordsXPos = 0
  { numLines: sLineLayouts_Wide.length, signatureYPos: 0, signatureWidth: 0, wordsYPos: 2, wordsXPos: 0, lines: sLineLayouts_Wide },
];

// ─── sLineLayouts_Tall / sMailLayouts_Tall 1:1 décomp ────────────────────────

/** 1:1 décomp `static const struct MailLineLayout sLineLayouts_Tall[]`
 *  (mail.c:338-344). 5 lines : 4× 2 words puis 1× 1 word. */
const sLineLayouts_Tall: readonly MailLineLayout[] = [
  { numEasyChatWords: 2, xOffset: 0, height: 16 },
  { numEasyChatWords: 2, xOffset: 0, height: 16 },
  { numEasyChatWords: 2, xOffset: 0, height: 16 },
  { numEasyChatWords: 2, xOffset: 0, height: 16 },
  { numEasyChatWords: 1, xOffset: 0, height: 16 },
];

/** 1:1 décomp `static const struct MailLayout sMailLayouts_Tall[]`
 *  (mail.c:346-443). Tous `wordsXPos = 30`, diffs sur signatureYPos /
 *  signatureWidth / wordsYPos. */
const sMailLayouts_Tall: readonly MailLayout[] = [
  // Orange (0)
  { numLines: sLineLayouts_Tall.length, signatureYPos: 7,  signatureWidth: 88,  wordsYPos: 11, wordsXPos: 30, lines: sLineLayouts_Tall },
  // Harbor (1)
  { numLines: sLineLayouts_Tall.length, signatureYPos: 10, signatureWidth: 96,  wordsYPos: 9,  wordsXPos: 30, lines: sLineLayouts_Tall },
  // Glitter (2)
  { numLines: sLineLayouts_Tall.length, signatureYPos: 12, signatureWidth: 104, wordsYPos: 5,  wordsXPos: 30, lines: sLineLayouts_Tall },
  // Mech (3)
  { numLines: sLineLayouts_Tall.length, signatureYPos: 5,  signatureWidth: 96,  wordsYPos: 8,  wordsXPos: 30, lines: sLineLayouts_Tall },
  // Wood (4)
  { numLines: sLineLayouts_Tall.length, signatureYPos: 10, signatureWidth: 96,  wordsYPos: 9,  wordsXPos: 30, lines: sLineLayouts_Tall },
  // Wave (5)
  { numLines: sLineLayouts_Tall.length, signatureYPos: 9,  signatureWidth: 112, wordsYPos: 5,  wordsXPos: 30, lines: sLineLayouts_Tall },
  // Bead (6)
  { numLines: sLineLayouts_Tall.length, signatureYPos: 12, signatureWidth: 104, wordsYPos: 9,  wordsXPos: 30, lines: sLineLayouts_Tall },
  // Shadow (7)
  { numLines: sLineLayouts_Tall.length, signatureYPos: 13, signatureWidth: 104, wordsYPos: 13, wordsXPos: 30, lines: sLineLayouts_Tall },
  // Tropic (8)
  { numLines: sLineLayouts_Tall.length, signatureYPos: 9,  signatureWidth: 96,  wordsYPos: 9,  wordsXPos: 30, lines: sLineLayouts_Tall },
  // Dream (9)
  { numLines: sLineLayouts_Tall.length, signatureYPos: 9,  signatureWidth: 96,  wordsYPos: 9,  wordsXPos: 30, lines: sLineLayouts_Tall },
  // Fab (10)
  { numLines: sLineLayouts_Tall.length, signatureYPos: 17, signatureWidth: 104, wordsYPos: 15, wordsXPos: 30, lines: sLineLayouts_Tall },
  // Retro (11)
  { numLines: sLineLayouts_Tall.length, signatureYPos: 9,  signatureWidth: 96,  wordsYPos: 5,  wordsXPos: 30, lines: sLineLayouts_Tall },
];

// ─── ReadMail entry point 1:1 décomp (mail.c:445-499) ────────────────────────

/** 1:1 décomp `void ReadMail(struct Mail *mail, MainCallback exitCallback, bool8 hasText)`.
 *
 *  Entry point public : alloue sMailRead, fixe les parsers easy_chat, calcule
 *  le mailType / iconType / layout, puis swap CB2 vers CB2_InitMailRead. */
export function ReadMail(mail: Mail, exitCallback: MainCallback, hasText: boolean): void {
  // u16 buffer[2]; u16 species;
  const buffer = new Uint16Array(2);
  let species: number;

  sMailRead = AllocZeroed<MailRead>(0x222C) as unknown as MailRead;
  // AllocZeroed donne un objet vide ; on initialise les champs runtime
  // explicitement (= équivalent C `AllocZeroed(sizeof(*sMailRead))`
  // zero-fill puis ReadMail set les champs ci-dessous).
  _initMailReadStruct(sMailRead);

  sMailRead.language = GAME_LANGUAGE;
  sMailRead.international = true;
  sMailRead.parserSingle = CopyEasyChatWord;
  sMailRead.parserMultiple = ConvertEasyChatWordsToString;

  if (IS_ITEM_MAIL(mail.itemId)) {
    sMailRead.mailType = ITEM_TO_MAIL(mail.itemId);
  } else {
    sMailRead.mailType = ITEM_TO_MAIL(FIRST_MAIL_INDEX);
    hasText = false;
  }

  switch (sMailRead.international as unknown as number) {
    case 0: // FALSE
    default:
      // Never reached. JP only?
      sMailRead.layout = sMailLayouts_Wide[sMailRead.mailType];
      break;
    case 1: // TRUE
      sMailRead.layout = sMailLayouts_Tall[sMailRead.mailType];
      break;
  }

  species = MailSpeciesToSpecies(mail.species, buffer);
  if (species > SPECIES_NONE && species < NUM_SPECIES) {
    switch (sMailRead.mailType) {
      default:
        sMailRead.iconType = ICON_TYPE_NONE;
        break;
      case ITEM_TO_MAIL(ITEM_BEAD_MAIL):
        sMailRead.iconType = ICON_TYPE_BEAD;
        break;
      case ITEM_TO_MAIL(ITEM_DREAM_MAIL):
        sMailRead.iconType = ICON_TYPE_DREAM;
        break;
    }
  } else {
    sMailRead.iconType = ICON_TYPE_NONE;
  }

  sMailRead.mail = mail;
  sMailRead.exitCallback = exitCallback;
  sMailRead.hasText = hasText;
  SetMainCallback2(CB2_InitMailRead);
}

// ─── State machine builder 1:1 décomp (mail.c:501-625) ───────────────────────

/** Module-local state pour MailReadBuildGraphics state machine.
 *  1:1 décomp `gMain.state` partagé entre les CB2_Init scenes ; ici on garde
 *  un local séparé (= pas de pollution gMain.state entre scenes). Reset à 0
 *  au début de chaque ReadMail via _initMailReadStruct. */
let _gMailState = 0;

/** 1:1 décomp `static bool8 MailReadBuildGraphics(void)` (mail.c:501-625).
 *
 *  State machine 0..18 : pipeline complet d'init de la scène mail.
 *  Retourne TRUE quand done (cases default ou 18).
 *
 *  Cf. décomp pour le détail de chaque case. */
function MailReadBuildGraphics(): boolean {
  const rt = getRuntime();
  if (!sMailRead || !rt) return false;
  let icon: number;

  switch (_gMailState) {
    case 0:
      SetVBlankCallback(null);
      ScanlineEffect_Stop();
      SetGpuReg(REG_OFFSET_DISPCNT, 0);
      break;
    case 1:
      // CpuFill16(0, (void *)OAM, OAM_SIZE).
      CpuFill16(0, OAM, OAM_SIZE);
      break;
    case 2:
      ResetPaletteFade();
      break;
    case 3:
      ResetTasks();
      break;
    case 4:
      ResetSpriteData();
      break;
    case 5:
      FreeAllSpritePalettes();
      ResetTempTileDataBuffers();
      SetGpuReg(REG_OFFSET_BG0HOFS, 0);
      SetGpuReg(REG_OFFSET_BG0VOFS, 0);
      SetGpuReg(REG_OFFSET_BG1HOFS, 0);
      SetGpuReg(REG_OFFSET_BG1VOFS, 0);
      SetGpuReg(REG_OFFSET_BG2VOFS, 0);
      SetGpuReg(REG_OFFSET_BG2HOFS, 0);
      SetGpuReg(REG_OFFSET_BG3HOFS, 0);
      SetGpuReg(REG_OFFSET_BG3VOFS, 0);
      SetGpuReg(REG_OFFSET_BLDCNT,  0);
      SetGpuReg(REG_OFFSET_BLDALPHA, 0);
      break;
    case 6:
      ResetBgsAndClearDma3BusyFlags(0);
      InitBgsFromTemplates(0, sBgTemplates as any, sBgTemplates.length);
      // 1:1 décomp : SetBgTilemapBuffer(1, sMailRead->bg1TilemapBuffer)
      //              SetBgTilemapBuffer(2, sMailRead->bg2TilemapBuffer)
      // Notre engine : les buffers sont des Uint8Array module-local que
      // _bgScheduleCopy copie vers VRAM ; on n'enregistre pas un pointer
      // (cf. pattern bag-menu.ts _bagScheduleBgCopy).
      SetBgTilemapBuffer(1, sMailRead.bg1TilemapBuffer);
      SetBgTilemapBuffer(2, sMailRead.bg2TilemapBuffer);
      break;
    case 7:
      InitWindows(sWindowTemplates);
      DeactivateAllTextPrinters();
      break;
    case 8: {
      // M3 : les assets sont chargés async (ROM→réseau). Kick-off au 1er hit +
      // GATE (return false → reste au même state) le temps du fetch. On attend
      // le design ET (pour BEAD/DREAM) l'icône mon → cases 8/10/12 = design,
      // case 17 = icône, tous synchrones une fois chargés.
      const mt = sMailRead.mailType;
      const needIcon = sMailRead.iconType !== ICON_TYPE_NONE && sMailRead.mail !== null;
      const iconSpecies = needIcon ? GetIconSpeciesNoPersonality(sMailRead.mail!.species) : -1;
      if (!_mailGfxLoaded[mt] || (needIcon && !IsMonIconLoaded(iconSpecies))) {
        _mailLoadGraphics(mt);
        if (needIcon) PreloadMonIcon(iconSpecies);
        _mailGfxWaiting = true; // → CB2_InitMailRead yield la frame
        return false;
      }
      const tiles = sMailGraphics[mt].tiles;
      // 1:1 décomp : DecompressAndCopyTileDataToVram(1, gMailGraphics[t].tiles, 0, 0, 0).
      // Si tiles == null (échec réseau), on no-op (= mail wireframe).
      if (tiles) DecompressAndCopyTileDataToVram(1, tiles, 0, 0, 0);
      break;
    }
    case 9:
      // 1:1 décomp : if (FreeTempTileDataBuffersIfPossible()) return FALSE;
      // Notre engine ne défère pas les uploads tile-data → toujours done.
      if (FreeTempTileDataBuffersIfPossible()) return false;
      break;
    case 10: {
      FillBgTilemapBufferRect_Palette0(0, 0, 0, 0, DISPLAY_TILE_WIDTH, DISPLAY_TILE_HEIGHT);
      FillBgTilemapBufferRect_Palette0(2, 1, 0, 0, DISPLAY_TILE_WIDTH, DISPLAY_TILE_HEIGHT);
      // 1:1 décomp : CopyToBgTilemapBuffer(1, gMailGraphics[t].tileMap, 0, 0).
      const tileMap = sMailGraphics[sMailRead.mailType].tileMap;
      if (tileMap) {
        CopyToBgTilemapBuffer(1, tileMap, 0, 0);
      }
      break;
    }
    case 11:
      CopyBgTilemapBufferToVram(0);
      CopyBgTilemapBufferToVram(1);
      CopyBgTilemapBufferToVram(2);
      break;
    case 12: {
      // 1:1 décomp :
      //  LoadPalette(GetOverworldTextboxPalettePtr(), BG_PLTT_ID(15), PLTT_SIZE_4BPP);
      //  gPlttBufferUnfaded[BG_PLTT_ID(15) + 10] = sMailGraphics[t].textColor;
      //  gPlttBufferFaded  [BG_PLTT_ID(15) + 10] = sMailGraphics[t].textColor;
      //  gPlttBufferUnfaded[BG_PLTT_ID(15) + 11] = sMailGraphics[t].textShadow;
      //  gPlttBufferFaded  [BG_PLTT_ID(15) + 11] = sMailGraphics[t].textShadow;
      const overworldTextPal = GetOverworldTextboxPalettePtr();
      if (overworldTextPal) {
        LoadPalette(overworldTextPal, BG_PLTT_ID(15), PLTT_SIZE_4BPP);
      }
      const gfx = sMailGraphics[sMailRead.mailType];
      rt.gPlttBufferUnfaded.set(BG_PLTT_ID(15) + 10, gfx.textColor);
      rt.gPlttBufferFaded.set(BG_PLTT_ID(15) + 10, gfx.textColor);
      rt.gPlttBufferUnfaded.set(BG_PLTT_ID(15) + 11, gfx.textShadow);
      rt.gPlttBufferFaded.set(BG_PLTT_ID(15) + 11, gfx.textShadow);

      // 1:1 décomp : LoadPalette(sMailGraphics[t].palette, BG_PLTT_ID(0), PLTT_SIZE_4BPP);
      if (gfx.palette) {
        LoadPalette(gfx.palette, BG_PLTT_ID(0), PLTT_SIZE_4BPP);
      }
      const gender = (gSaveBlock2Ptr as any).playerGender as number;
      const colors = sBgColors[gender] ?? sBgColors[MALE];
      rt.gPlttBufferUnfaded.set(BG_PLTT_ID(0) + 10, colors[0]);
      rt.gPlttBufferFaded.set(BG_PLTT_ID(0) + 10, colors[0]);
      rt.gPlttBufferUnfaded.set(BG_PLTT_ID(0) + 11, colors[1]);
      rt.gPlttBufferFaded.set(BG_PLTT_ID(0) + 11, colors[1]);
      break;
    }
    case 13:
      if (sMailRead.hasText) BufferMailText();
      break;
    case 14:
      if (sMailRead.hasText) {
        PrintMailText();
        RunTextPrinters();
      }
      break;
    case 15:
      // 1:1 décomp : if (Overworld_IsRecvQueueAtMax() == TRUE) return FALSE;
      // Single player : link queue jamais saturée → return false (= done).
      if (Overworld_IsRecvQueueAtMax()) return false;
      break;
    case 16:
      SetVBlankCallback(VBlankCB_MailRead);
      // 1:1 décomp : gPaletteFade.bufferTransferDisabled = TRUE;
      rt.gPaletteFade.bufferTransferDisabled = true;
      break;
    case 17:
      // 1:1 décomp sprite icon BEAD/DREAM. Stubs no-op tant que pokemon_icon
      // n'est pas porté (= mail s'affiche sans l'icône Pokémon).
      icon = GetIconSpeciesNoPersonality(sMailRead.mail!.species);
      switch (sMailRead.iconType) {
        case ICON_TYPE_BEAD:
          LoadMonIconPalette(icon);
          sMailRead.monIconSpriteId = CreateMonIconNoPersonality(icon, SpriteCallbackDummy, 96, 128, 0, false);
          break;
        case ICON_TYPE_DREAM:
          LoadMonIconPalette(icon);
          sMailRead.monIconSpriteId = CreateMonIconNoPersonality(icon, SpriteCallbackDummy, 40, 128, 0, false);
          break;
      }
      break;
    case 18:
      SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);
      ShowBg(0); ShowBg(1); ShowBg(2);
      BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);
      rt.gPaletteFade.bufferTransferDisabled = false;
      sMailRead.callback = CB2_WaitForPaletteExitOnKeyPress;
      return true;
    default:
      return false;
  }
  _gMailState++;
  return false;
}

// ─── CB2_InitMailRead 1:1 décomp (mail.c:627-637) ────────────────────────────

/** 1:1 décomp `static void CB2_InitMailRead(void)`.
 *
 *    do { if (MailReadBuildGraphics() == TRUE) { SetMainCallback2(CB2_MailRead); break; } }
 *    while (MenuHelpers_IsLinkActive() != TRUE);
 */
function CB2_InitMailRead(): void {
  do {
    _mailGfxWaiting = false;
    if (MailReadBuildGraphics()) {
      SetMainCallback2(CB2_MailRead);
      break;
    }
    // M3 : le décomp boucle tous les states en 1 frame (assets ROM). Nous, le
    // case 8 GATE sur un fetch async → on YIELD la frame (break) pour laisser
    // les microtasks du loader résoudre, sinon ce do-while solo spin → freeze.
    // Les autres states restent 1:1 (spin synchrone dans la même frame).
    if (_mailGfxWaiting) break;
  } while (MenuHelpers_IsLinkActive() !== true);
}

// ─── BufferMailText / PrintMailText 1:1 décomp (mail.c:639-697) ──────────────

/** 1:1 décomp `static void BufferMailText(void)` (mail.c:639-666).
 *
 *  Convertit les easy_chat words en strings ligne par ligne dans
 *  sMailRead->message[i] puis bufferize la signature playerName. */
function BufferMailText(): void {
  if (!sMailRead || !sMailRead.layout || !sMailRead.mail) return;
  let numWords = 0;
  for (let i = 0; i < sMailRead.layout.numLines; i++) {
    // 1:1 décomp ConvertEasyChatWordsToString(sMailRead->message[i],
    //   &sMailRead->mail->words[numWords],
    //   sMailRead->layout->lines[i].numEasyChatWords, 1).
    const wordsSlice = sMailRead.mail.words.slice(numWords, numWords + sMailRead.layout.lines[i].numEasyChatWords);
    const converted = ConvertEasyChatWordsToString(
      sMailRead.message[i],
      wordsSlice,
      sMailRead.layout.lines[i].numEasyChatWords,
      1,
    );
    // Conversion → string : on encode dans message[i] (Uint8Array)
    // pour préserver le buffer décomp ; AddTextPrinterParameterized3 prendra
    // soit la string soit le buffer (l'engine TS accepte string direct).
    if (typeof converted === 'string') {
      // Stocke aussi la string sur le buffer (custom field — récupéré par PrintMailText)
      (sMailRead.message[i] as any).__str = converted;
    }
    numWords += sMailRead.layout.lines[i].numEasyChatWords;
  }

  // 1:1 décomp : ptr = StringCopy(sMailRead->playerName, sMailRead->mail->playerName);
  sMailRead.playerName = StringCopy(null, sMailRead.mail.playerName);
  if (!sMailRead.international) {
    // 1:1 décomp Never reached. JP-only. Conservé pour fidélité totale.
    sMailRead.playerName = StringCopy(null, sMailRead.playerName + GetText_FromSpace());
    sMailRead.signatureWidth = sMailRead.layout.signatureWidth - (StringLength(sMailRead.playerName) * 8 - 96);
  } else {
    ConvertInternationalPlayerName(sMailRead.playerName);
    sMailRead.signatureWidth = sMailRead.layout.signatureWidth;
  }
}

/** 1:1 décomp `static void PrintMailText(void)` (mail.c:668-697).
 *
 *  Print les lignes message[i] sur window 0 (BG0) puis la signature centrée
 *  via GetStringCenterAlignXOffset + offsets (signatureYPos + 88, x = center
 *  + 104). */
function PrintMailText(): void {
  if (!sMailRead || !sMailRead.layout) return;
  let y = 0;
  PutWindowTilemap(0);
  PutWindowTilemap(1);
  FillWindowPixelBuffer(0, PIXEL_FILL(0));
  FillWindowPixelBuffer(1, PIXEL_FILL(0));

  for (let i = 0; i < sMailRead.layout.numLines; i++) {
    // 1:1 décomp : si premier char EOS ou CHAR_SPACE → skip line.
    const buf = sMailRead.message[i];
    const str: string = (buf as any).__str ?? '';
    const first = buf[0];
    if (first === 0xFF /* EOS */ || first === 0x00 /* CHAR_SPACE */) continue;
    if (!str || str.length === 0) continue;

    AddTextPrinterParameterized3(
      0,
      FONT_NORMAL,
      sMailRead.layout.lines[i].xOffset + sMailRead.layout.wordsXPos,
      y + sMailRead.layout.wordsYPos,
      sTextColors as any,
      0,
      str,
    );
    y += sMailRead.layout.lines[i].height;
  }

  // 1:1 décomp :
  //   bufptr = StringCopy(signature, gText_FromSpace);   // = "" en EN+FR
  //   StringCopy(bufptr, sMailRead->playerName);
  //   box_x = GetStringCenterAlignXOffset(FONT_NORMAL, signature, sMailRead->signatureWidth) + 104;
  //   box_y = sMailRead->layout->signatureYPos + 88;
  //   AddTextPrinterParameterized3(0, FONT_NORMAL, box_x, box_y, sTextColors, 0, signature);
  const signature = GetText_FromSpace() + sMailRead.playerName;
  // 1:1 décomp signature : `GetStringCenterAlignXOffset(FONT_NORMAL, signature,
  //   sMailRead->signatureWidth)`. Notre TS port omet `fontId` (= FONT_NORMAL
  //   implicite) — équivalent fonctionnel 1:1, cf. gba-text-system.ts:146.
  const boxX = GetStringCenterAlignXOffset(signature, sMailRead.signatureWidth) + 104;
  const boxY = sMailRead.layout.signatureYPos + 88;
  AddTextPrinterParameterized3(0, FONT_NORMAL, boxX, boxY, sTextColors as any, 0, signature);

  CopyWindowToVram(0, COPYWIN_FULL);
  CopyWindowToVram(1, COPYWIN_FULL);
}

// ─── VBlankCB_MailRead 1:1 décomp (mail.c:699-704) ───────────────────────────

/** 1:1 décomp `static void VBlankCB_MailRead(void)`. */
function VBlankCB_MailRead(): void {
  LoadOam();
  ProcessSpriteCopyRequests();
  TransferPlttBuffer();
}

// ─── CB2_MailRead 1:1 décomp (mail.c:706-714) ────────────────────────────────

/** 1:1 décomp `static void CB2_MailRead(void)`.
 *
 *    if (sMailRead->iconType != ICON_TYPE_NONE) { AnimateSprites(); BuildOamBuffer(); }
 *    sMailRead->callback();
 */
function CB2_MailRead(): void {
  if (!sMailRead) return;
  if (sMailRead.iconType !== ICON_TYPE_NONE) {
    // M3 : avance le bob de l'icône mon (le décomp le fait via le système d'anim
    // sprite dans AnimateSprites ; notre sprite CreateSpriteAtOam n'a pas d'anim).
    UpdateMailMonIcon();
    AnimateSprites();
    BuildOamBuffer();
  }
  if (sMailRead.callback) sMailRead.callback();
}

// ─── CB2_WaitForPaletteExitOnKeyPress 1:1 décomp (mail.c:716-722) ────────────

function CB2_WaitForPaletteExitOnKeyPress(): void {
  if (!sMailRead) return;
  if (!UpdatePaletteFade()) {
    sMailRead.callback = CB2_ExitOnKeyPress;
  }
}

// ─── CB2_ExitOnKeyPress 1:1 décomp (mail.c:724-731) ──────────────────────────

function CB2_ExitOnKeyPress(): void {
  if (!sMailRead) return;
  if (JOY_NEW(A_BUTTON | B_BUTTON)) {
    BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
    sMailRead.callback = CB2_ExitMailReadFreeVars;
  }
}

// ─── CB2_ExitMailReadFreeVars 1:1 décomp (mail.c:733-753) ────────────────────

function CB2_ExitMailReadFreeVars(): void {
  if (!sMailRead) return;
  if (!UpdatePaletteFade()) {
    SetMainCallback2(sMailRead.exitCallback);
    switch (sMailRead.iconType) {
      case ICON_TYPE_BEAD:
      case ICON_TYPE_DREAM: {
        const icon = GetIconSpeciesNoPersonality(sMailRead.mail ? sMailRead.mail.species : 0);
        FreeMonIconPalette(icon);
        FreeAndDestroyMonIconSprite(sMailRead.monIconSpriteId);
        break;
      }
    }
    // 1:1 décomp : memset(sMailRead, 0, sizeof(*sMailRead)); ResetPaletteFade();
    //              UnsetBgTilemapBuffer(0); UnsetBgTilemapBuffer(1);
    //              ResetBgsAndClearDma3BusyFlags(0); FreeAllWindowBuffers();
    //              FREE_AND_SET_NULL(sMailRead);
    _zeroMailReadStruct(sMailRead);
    ResetPaletteFade();
    UnsetBgTilemapBuffer(0);
    UnsetBgTilemapBuffer(1);
    ResetBgsAndClearDma3BusyFlags(0);
    FreeAllWindowBuffers();
    sMailRead = null;
  }
}

// ─── Internal helpers (= init/zero pour AllocZeroed) ─────────────────────────

function _initMailReadStruct(s: MailRead): void {
  // 1:1 décomp : AllocZeroed → struct zero-init. _gMailState reset à 0 pour
  // que la state machine MailReadBuildGraphics démarre clean.
  _gMailState = 0;
  s.message = new Array(8);
  for (let i = 0; i < 8; i++) s.message[i] = new Uint8Array(64);
  s.playerName = '';
  s.exitCallback = null;
  s.callback = null;
  s.mail = null;
  s.hasText = false;
  s.signatureWidth = 0;
  s.mailType = 0;
  s.iconType = ICON_TYPE_NONE;
  s.monIconSpriteId = 0xFF;
  s.language = 0;
  s.international = false;
  s.parserSingle = null;
  s.parserMultiple = null;
  s.layout = null;
  s.bg1TilemapBuffer = new Uint8Array(0x1000);
  s.bg2TilemapBuffer = new Uint8Array(0x1000);
}

function _zeroMailReadStruct(s: MailRead): void {
  // 1:1 décomp memset(sMailRead, 0, sizeof(*sMailRead)).
  s.bg1TilemapBuffer.fill(0);
  s.bg2TilemapBuffer.fill(0);
  for (const buf of s.message) buf.fill(0);
  s.exitCallback = null;
  s.callback = null;
  s.mail = null;
  s.layout = null;
  s.parserSingle = null;
  s.parserMultiple = null;
}

// ─── Helpers macros 1:1 décomp ───────────────────────────────────────────────

/** 1:1 décomp `IS_ITEM_MAIL(itemId)` macro (mail.h:6-17). */
function IS_ITEM_MAIL(itemId: number): boolean {
  return (
    itemId === ITEM_ORANGE_MAIL ||
    itemId === ITEM_HARBOR_MAIL ||
    itemId === ITEM_GLITTER_MAIL ||
    itemId === ITEM_MECH_MAIL ||
    itemId === ITEM_WOOD_MAIL ||
    itemId === ITEM_WAVE_MAIL ||
    itemId === ITEM_BEAD_MAIL ||
    itemId === ITEM_SHADOW_MAIL ||
    itemId === ITEM_TROPIC_MAIL ||
    itemId === ITEM_DREAM_MAIL ||
    itemId === ITEM_FAB_MAIL ||
    itemId === ITEM_RETRO_MAIL
  );
}

// ─── Stubs explicites pour dépendances non portées 1:1 ───────────────────────

let _warnedSetMainCallback2 = false;
/** 1:1 décomp `SetMainCallback2(cb)` — déjà dans le runtime, on wrap pour ne
 *  pas créer un cycle d'import via decomp-bridge. */
function SetMainCallback2(cb: MainCallback | (() => void) | null): void {
  const rt = getRuntime();
  if (!rt) {
    if (!_warnedSetMainCallback2) {
      _warnedSetMainCallback2 = true;
      // eslint-disable-next-line no-console
      console.warn('[mail] SetMainCallback2 called without runtime ready.');
    }
    return;
  }
  rt.SetMainCallback2(cb as any);
}

let _warnedSetBgTilemapBuffer = false;
/** 1:1 décomp `SetBgTilemapBuffer(bg, buffer)` (bg.c) — décomp enregistre le
 *  buffer pointer pour copy ultérieures. Notre engine fait la copy via
 *  CopyBgTilemapBufferToVram explicite + le buffer est dans sMailRead, donc
 *  setBgTilemapBuffer = no-op (= équivalent fonctionnel 1:1, pas une
 *  divergence : juste pas de pointer-stash car le buffer est connu). */
function SetBgTilemapBuffer(_bg: number, _buffer: Uint8Array): void {
  if (!_warnedSetBgTilemapBuffer) {
    _warnedSetBgTilemapBuffer = true;
    // eslint-disable-next-line no-console
    console.debug('[mail] SetBgTilemapBuffer : no-op (buffer = sMailRead.bg{1,2}TilemapBuffer module-local, copy via CopyBgTilemapBufferToVram).');
  }
}

let _warnedUnsetBgTilemapBuffer = false;
/** 1:1 décomp `UnsetBgTilemapBuffer(bg)`. Pendant du SetBg ci-dessus : no-op. */
function UnsetBgTilemapBuffer(_bg: number): void {
  if (!_warnedUnsetBgTilemapBuffer) {
    _warnedUnsetBgTilemapBuffer = true;
    // eslint-disable-next-line no-console
    console.debug('[mail] UnsetBgTilemapBuffer : no-op (pendant SetBgTilemapBuffer).');
  }
}

let _warnedResetTempTileDataBuffers = false;
/** 1:1 TODO : `bg.c ResetTempTileDataBuffers()`. Notre engine ne défère pas
 *  les uploads tile-data (DecompressAndCopyTileDataToVram copy direct), donc
 *  ResetTempTileDataBuffers = no-op. */
function ResetTempTileDataBuffers(): void {
  if (!_warnedResetTempTileDataBuffers) {
    _warnedResetTempTileDataBuffers = true;
    // eslint-disable-next-line no-console
    console.debug('[mail] ResetTempTileDataBuffers : no-op (engine = direct upload, pas de defer queue).');
  }
}

/** 1:1 TODO : `bg.c FreeTempTileDataBuffersIfPossible()` — retourne TRUE si
 *  encore en defer, FALSE si done. Notre engine = upload synchrone → done. */
function FreeTempTileDataBuffersIfPossible(): boolean {
  return false;
}

let _warnedDecompressAndCopyTileDataToVram = false;
/** 1:1 TODO : `bg.c DecompressAndCopyTileDataToVram(bg, src, size, offset, mode)`.
 *
 *  Notre engine : sMailGraphics[t].tiles est déjà décompressé (= asset extraction
 *  donne du raw 4bpp). Donc on copy direct dans VRAM charBase du BG selon le
 *  template. Tant que les assets ne sont pas extraits, src == null = no-op. */
function DecompressAndCopyTileDataToVram(
  bg: number,
  src: Uint8Array | null,
  _size: number,
  _offset: number,
  _mode: number,
): void {
  if (!src) return;
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp : copy raw tile bytes vers VRAM @ charBase * 0x4000 du BG.
  const bgTmpl = sBgTemplates[bg];
  if (!bgTmpl) {
    if (!_warnedDecompressAndCopyTileDataToVram) {
      _warnedDecompressAndCopyTileDataToVram = true;
      // eslint-disable-next-line no-console
      console.warn('[mail] DecompressAndCopyTileDataToVram : bg index out of range');
    }
    return;
  }
  const dest = bgTmpl.charBaseIndex * 0x4000;
  rt.gba.vram.set(src.subarray(0, Math.min(src.length, rt.gba.vram.length - dest)), dest);
}

let _warnedLoadOam = false;
function LoadOam(): void {
  // 1:1 décomp `sprite.c LoadOam()` — engine VBlank gère déjà cela.
  if (!_warnedLoadOam) {
    _warnedLoadOam = true;
    // eslint-disable-next-line no-console
    console.debug('[mail] LoadOam : no-op (engine VBlank).');
  }
}

let _warnedProcessSpriteCopyRequests = false;
function ProcessSpriteCopyRequests(): void {
  if (!_warnedProcessSpriteCopyRequests) {
    _warnedProcessSpriteCopyRequests = true;
    // eslint-disable-next-line no-console
    console.debug('[mail] ProcessSpriteCopyRequests : no-op (engine direct copy).');
  }
}

function TransferPlttBuffer(): void {
  // 1:1 décomp : copy gPlttBufferFaded → PLTT register. Engine fait
  // automatiquement à chaque VBlank tick. No-op ici.
}

// AnimateSprites / BuildOamBuffer : 1:1 décomp helpers globaux (sprite.c).
// Importés depuis decomp-globals (re-export de game/sprite.ts), comme
// CB2_MainMenu / overworld-welcome — plus de copie locale (chantier D dédup).
// Note : l'ancienne copie locale appelait `animateAllSprites` (méthode inexistante
// → no-op) ; la globale tique réellement l'icône mon (bead/dream) = 1:1 correct.

// ─── Pokemon icon : importé de game/pokemon_icon.ts (1:1 pokemon_icon.c) ──────
// GetIconSpeciesNoPersonality / LoadMonIconPalette / CreateMonIconNoPersonality /
// FreeMonIconPalette / FreeAndDestroyMonIconSprite + PreloadMonIcon/IsMonIconLoaded
// (chargement async des assets icône, gaté par le case 8 comme les graphismes).

function SpriteCallbackDummy(_sprite: any): void {
  // 1:1 décomp : no-op callback.
}

// ─── Easy chat : ConvertEasyChatWordsToString importé de game/easy_chat.ts ────
// (1:1 décomp easy_chat.c, données FR src/game/data/easy-chat-words.ts).
// L'ancien stub renvoyait '' (mail content vide) ; maintenant le vrai texte.

let _warnedConvertIntlName = false;
/** 1:1 TODO : `international_string_util.c ConvertInternationalPlayerName`.
 *  Pour notre port FR : player name déjà en UTF-8, no-op acceptable. */
function ConvertInternationalPlayerName(_name: string): void {
  if (_warnedConvertIntlName) return;
  _warnedConvertIntlName = true;
  // eslint-disable-next-line no-console
  console.debug('[mail] ConvertInternationalPlayerName : no-op (player name UTF-8).');
}

// ─── Overworld / MenuHelpers stubs ───────────────────────────────────────────

/** 1:1 décomp `Overworld_IsRecvQueueAtMax()` — link queue saturée. Single
 *  player port : toujours false. */
function Overworld_IsRecvQueueAtMax(): boolean {
  return false;
}

// MenuHelpers_IsLinkActive : RELOCALISÉ dans le miroir `src/game/menu_helpers.ts`
// (1:1 menu_helpers.c:298, single-player → false). Import hoisté.
import { MenuHelpers_IsLinkActive } from '../../menu_helpers';

// ─── Texte FR : gText_FromSpace = "" (1:1 décomp strings.c:1587) ─────────────

/** 1:1 décomp `const u8 gText_FromSpace[] = _("")` (strings.c:1587).
 *  Note `mail.c:658` commentaire décomp : "Odd, 'From' text is already
 *  printed in PrintMailText". Le texte est volontairement vide (= juste un
 *  prefix qui se résume à zero char). */
function GetText_FromSpace(): string {
  return '';
}
