/**
 * battle-healthbox.ts — Port 1:1 décomp `src/battle_interface.c`
 * `CreateBattlerHealthboxSprites` (ll. 869-951) + assets graphiques.
 *
 * Les HP boxes en GBA Émeraude ne sont **PAS** des windows BG via AddWindow.
 * Ce sont des **sprites OAM** créés par `CreateBattlerHealthboxSprites`,
 * composés de 3 sprites par battler :
 *   - `healthboxLeftSprite` (= "healthboxMain") : sprite principal qui contient
 *     le nickname, level, gender symbol, et (côté player) le label "HP"
 *   - `healthboxRightSprite` (= "healthboxOther") : sprite collé à droite qui
 *     contient le HP bar widget (8x widgets de 8 pixels), le label numérique
 *     HP courant/max, et l'icone de status condition
 *   - `healthbarSprite` (= "healthBar") : sprite séparé pour la barre verte/
 *     jaune/rouge dynamique (= 0..48 pixels horizontalement)
 *
 * Tile data assets pré-extraits :
 *   - `/decomp/em/battle_interface/healthbox_singles_player.png`   (64×128)
 *   - `/decomp/em/battle_interface/healthbox_singles_opponent.png` (128×32)
 *   - `/decomp/em/battle_interface/hpbar.png`                      (96×8)
 *   - `/decomp/em/battle_interface/ball_status_bar.png`            (palette HEALTHBOX)
 *   - `/decomp/em/battle_interface/ball_display.png`               (palette HEALTHBAR)
 *
 * Sources de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_interface.c:869-951`
 *     `CreateBattlerHealthboxSprites`
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_interface.c:1072-1103`
 *     `InitBattlerHealthboxCoords` → positions player (158, 88) / opp (44, 30)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_gfx_sfx_util.c:45-84`
 *     `sSpriteSheet_SinglesPlayerHealthbox` + sSpriteSheets_HealthBar + palettes
 *   - `D:/Projet 1/decomps/pokeemeraude/src/graphics.c:628-629`
 *     `gHealthboxSinglesPlayerGfx` `-mwidth 8 -mheight 8`
 *     `gHealthboxSinglesOpponentGfx` `-mwidth 8 -mheight 4`
 *
 * D1 scope (= cette session) : juste les sprites + tile data + visibilité.
 * D2 (HP bar dynamique), D3 (digits Lv/HP), D4 (status icons), D5 (exp bar),
 * D6 (gender symbols) sont des sous-modules suivants.
 */

import { getRuntime, SetSubspriteTables, clearSubspriteTable, FreeSpriteTilesByTag, type NamingSubsprite } from '../system/decomp-globals';
import { loadIndexedPng, loadIndexedPngStrict, extractPngPlte, loadIndexedPngRawIndices } from '../gba/png-loader';
import { MarkObjTilesAllocated, LoadSpritePalette, AllocSpriteTiles, AllocSpriteTileRange } from '../system/sprite';
// Pipeline texte→OBJ healthbox (1:1 décomp AddTextPrinterAndCreateWindowOnHealthbox).
// UI modules bas-niveau (une seule direction d'import : battle-healthbox → ui/*),
// déjà dans le graphe d'import early via battle-flow → pas de cycle/TDZ nouveau.
import { AddWindow, RemoveWindow, FillWindowPixelBuffer, GetWindowPixelBuffer } from '../ui/gba-window-system';
import { AddTextPrinterParameterized4, FONT_SMALL, TEXT_SKIP_DRAW } from '../ui/gba-text-system';

/** RGB888 → RGB555 (= GBA palette format). Inline pour ÉVITER l'import de
 *  `./gba/types` qui introduit un cycle de modules (battle-healthbox est importé
 *  tôt via battle-flow → TDZ `BG_SCREEN_SIZE before initialization` au HMR). */
function _rgba8ToRgb15(r: number, g: number, b: number): number {
  return ((r >> 3) & 0x1F) | (((g >> 3) & 0x1F) << 5) | (((b >> 3) & 0x1F) << 10);
}

/** 1:1 décomp macro `RGB(r,g,b)` : composantes 0..31 → u16 RGB555 (= GBA palette).
 *  Utilisé pour `sStatusIconColors` (battle_interface.c:751-757). */
function _rgb555(r: number, g: number, b: number): number {
  return (r & 0x1F) | ((g & 0x1F) << 5) | ((b & 0x1F) << 10);
}

/** Charge un PNG indexed multi-sub-palette en tile data 4bpp avec indices LOCAUX
 *  (= `pltteIdx % 16`). Pattern identique à `_loadBattleTerrainTiles` (battle-bg.ts).
 *
 *  Nécessaire pour `status.png` : 5 status icons (PSN/PRZ/SLP/FRZ/BRN) partagent
 *  la MÊME tile data mais chaque status utilise une sub-palette différente. Le PNG
 *  indexé a une PLTE 80-color (= 5 sub-palettes 16) et les pixels utilisent des
 *  indices globaux (2,3,12 / 28 / 44 / 60 / 76 = même local 12 dans sub-pal 0..4).
 *
 *  1:1 décomp : `status.4bpp` contient des indices LOCAUX 0..15 ; la couleur est
 *  appliquée au runtime via la palette OBJ du sprite healthbox (= paletteBank).
 *  `loadIndexedPngStrict` ne prend que les 16 premières PLTE colors → les pixels
 *  sub-pal 1..4 (439 px) non mappés → transparent (warning + icônes invisibles). */
async function _loadMultiSubPalTiles(url: string): Promise<Uint8Array> {
  // Lecture des indices PNG RAW (= parse IDAT, PAS le canvas). La voie canvas
  // (drawImage → getImageData → reverse-lookup RGB→PLTE) échouait sur status.png :
  // les couleurs des 5 sous-palettes (PSN/PRZ/SLP/FRZ/BRN) entrent en collision RGB
  // ou le canvas resample → indices faux (spread) → icône status rendue avec des
  // couleurs healthbox arbitraires ("BRU bleu", user 2026-05-30). La voie raw
  // préserve l'index réel : status.png utilise raw {2,3,12+16*row} → %16 = {2,3,12}
  // (1:1 `status.4bpp` décomp : index 12 = couleur status remplie par FillPalette).
  const { widthPx, heightPx, indices } = await loadIndexedPngRawIndices(url);
  const widthTiles = widthPx / 8;
  const heightTiles = heightPx / 8;

  const charData = new Uint8Array(widthTiles * heightTiles * 32);
  for (let ty = 0; ty < heightTiles; ty++) {
    for (let tx = 0; tx < widthTiles; tx++) {
      const tileBaseOffset = (ty * widthTiles + tx) * 32;
      for (let row = 0; row < 8; row++) {
        for (let pairCol = 0; pairCol < 4; pairCol++) {
          // %16 = index LOCAL dans la sous-palette (= 1:1 décomp .4bpp).
          const px1 = indices[(ty * 8 + row) * widthPx + (tx * 8 + pairCol * 2)] % 16;
          const px2 = indices[(ty * 8 + row) * widthPx + (tx * 8 + pairCol * 2 + 1)] % 16;
          charData[tileBaseOffset + row * 4 + pairCol] = (px1 & 0xF) | ((px2 & 0xF) << 4);
        }
      }
    }
  }
  return charData;
}

// ─── Asset paths ────────────────────────────────────────────────────────────

const HEALTHBOX_PLAYER_PNG   = '/decomp/em/battle_interface/healthbox_singles_player.png';
const HEALTHBOX_OPPONENT_PNG = '/decomp/em/battle_interface/healthbox_singles_opponent.png';
const HPBAR_PNG              = '/decomp/em/battle_interface/hpbar.png';
const HPBAR_ANIM_PNG         = '/decomp/em/battle_interface/hpbar_anim.png';   // YELLOW + RED tile sets
const NUMBERS1_PNG           = '/decomp/em/battle_interface/numbers1.png';     // 11 tiles : [blank, 0..9]
const NUMBERS2_PNG           = '/decomp/em/battle_interface/numbers2.png';     // 12 tiles : [0..9, blank, slash/Lv]
const STATUS_PNG             = '/decomp/em/battle_interface/status.png';       // 15 tiles : PSN/PRZ/SLP/FRZ/BRN (3 tiles each)
const MISC_PNG               = '/decomp/em/battle_interface/misc.png';         // 11 tiles : GFX_36..46 ; tile 3 = GFX_39 "blank health window" (= groove cream)
const EXPBAR_PNG             = '/decomp/em/battle_interface/expbar.png';       // 9 tiles : exp bar levels 0..8 pixels filled
const BALL_STATUS_BAR_PNG    = '/decomp/em/battle_interface/ball_status_bar.png';  // = palette HEALTHBOX
const BALL_DISPLAY_PNG       = '/decomp/em/battle_interface/ball_display.png';     // = palette HEALTHBAR

// ─── VRAM byte offsets (= OBJ VRAM, allocations pour healthbox tile data) ───
//
// #VRAM 1:1 (étape 2c) : ALLOUÉS via le tile allocator OBJ (AllocSpriteTiles),
// exactement comme la décomp (LoadCompressedSpriteSheet → AllocTilesForSpriteSheet
// → AllocSpriteTiles). Fini les offsets EN DUR 0x0000-0x2200 (qui imposaient un
// setReservedSpriteTileCount(272) côté battle-flow + risquaient le chevauchement
// si le combat ré-utilisait la VRAM). Ces `let` sont (re)calculés à CHAQUE combat
// dans ensureHealthboxAssets (= byte offset du 1er tile alloué). TOUS les sites
// lecteurs (tileId = VRAM/32, offsets VRAM+0xNN) marchent INCHANGÉS car ils lisent
// ces variables au runtime (après l'allocation).
//
// Tailles 1:1 décomp (battle_gfx_sfx_util.c:45-78, champ `size` des sprite sheets) :
//   - sSpriteSheet_SinglesPlayerHealthbox   = 0x1000 → 128 tiles
//   - sSpriteSheet_SinglesOpponentHealthbox = 0x1000 → 128 tiles (64 utilisés, 1:1 réserve 128)
//   - sSpriteSheets_HealthBar[player]        = 0x100  → 8 tiles
//   - sSpriteSheets_HealthBar[opponent]      = 0x120  → 9 tiles (la 9e = frame-end, différée)
const HEALTHBOX_PLAYER_TILE_COUNT   = 0x1000 / 32;  // 128
const HEALTHBOX_OPPONENT_TILE_COUNT = 0x1000 / 32;  // 128
const HPBAR_PLAYER_TILE_COUNT       = 0x100 / 32;   // 8
const HPBAR_OPP_TILE_COUNT          = 0x120 / 32;   // 9
// Tags allocateur (= 1:1 TAG_HEALTHBOX_*1_TILE / TAG_HEALTHBAR_*1_TILE décomp).
const TAG_HB_PLAYER    = 'BATTLE_HB_PLAYER';
const TAG_HB_OPP       = 'BATTLE_HB_OPP';
const TAG_HPBAR_PLAYER = 'BATTLE_HPBAR_PLAYER';
const TAG_HPBAR_OPP    = 'BATTLE_HPBAR_OPP';
let HEALTHBOX_PLAYER_VRAM   = 0x0000;  // = AllocSpriteTiles(128) * 32  (recalculé /combat)
let HEALTHBOX_OPPONENT_VRAM = 0x1000;  // = AllocSpriteTiles(128) * 32
// 1:1 décomp : sSpriteSheets_HealthBar[player] alloc 0x100 = 8 tiles. La barre HP
// est UN sprite à sous-sprites (tileOffset 0 & 4) → LEFT = base. *_RIGHT_VRAM (=
// LEFT+0x80, +4 tiles) gardés pour doc/sécurité (plus lus : la table subsprite
// indexe via tileOffset). Update HP bar copie 6 fill tiles à tileNum+2..+7 (1:1).
let HPBAR_PLAYER_LEFT_VRAM   = 0x2000;  // = AllocSpriteTiles(8) * 32
let HPBAR_PLAYER_RIGHT_VRAM  = 0x2080;  // = LEFT + 0x80
let HPBAR_OPP_LEFT_VRAM      = 0x2100;  // = AllocSpriteTiles(9) * 32
let HPBAR_OPP_RIGHT_VRAM     = 0x2180;  // = LEFT + 0x80

// ─── OBJ palette slots ──────────────────────────────────────────────────────

// 1:1 décomp `sSpritePalettes_HealthBoxHealthBar[]` :
//   - TAG_HEALTHBOX_PAL ← `gBattleInterface_BallStatusBarPal` (= ball_status_bar.png .gbapal)
//   - TAG_HEALTHBAR_PAL ← `gBattleInterface_BallDisplayPal`   (= ball_display.png .gbapal)
// 1:1 décomp tags (battle_interface.h:47-48) : TAG_HEALTHBOX_PAL = TAG_HEALTHBOX_PLAYER1_TILE
// (0xD6FF), TAG_HEALTHBAR_PAL = TAG_HEALTHBAR_PLAYER1_TILE (0xD704).
const TAG_HEALTHBOX_PAL = 0xD6FF;
const TAG_HEALTHBAR_PAL = 0xD704;
// 1:1 décomp `sSpritePalettes_HealthBoxHealthBar` (battle_gfx_sfx_util.c:80) chargé via
// `LoadSpritePalette` (sprite.c:1591) → l'allocateur OBJ alloue+TAGUE un slot DYNAMIQUEMENT
// (sSpritePaletteTags) ET écrit gPlttBufferFaded → flush live par TransferPlttBuffer (= modèle
// BUFFERISÉ décomp, PLUS de live-direct LoadPaletteObj ni de workaround MarkObjPaletteAllocated).
// Le slot est donc dynamique (réservé nativement par le tag → la palette ball ne l'écrase plus,
// 1:1). Ré-alloué chaque combat (FreeAllSpritePalettes clear les tags à l'init → réalloc).
let HEALTHBOX_PALETTE_SLOT = -1;
let HEALTHBAR_PALETTE_SLOT = -1;

// ─── HP bar subsprite tables : 1:1 décomp sHealthBar_Subsprites_* (battle_interface.c:467-531) ─
// Le décomp rend la barre HP comme UN sprite avec une table de sous-sprites :
// chaque pièce devient une entrée OAM à `sprite.x + sub.x`, `sprite.y + sub.y`,
// SANS center-to-corner (cf. AddSubspritesToOamBuffer : baseX = oam.x - ctcvX =
// sprite.x). Conséquence : le TOP des pièces est à sprite.y (=88), et non
// sprite.y-4 comme un sprite 32×8 normal via ctcv → c'était le résidu de 4px
// "barre trop haute". `tileOffset` indexe dans la région VRAM barre (= tileBase
// du sprite) : pièce 0 = tiles 0..3 (label "PV" + 2 fill), pièce 1 = tiles 4..7.
const HEALTHBAR_SUBSPRITES_PLAYER: readonly NamingSubsprite[] = [
  { x: -16, y: 0, shape: 1, size: 1, tileOffset: 0, priority: 1 },  // 32×8 ; décomp .x=DISPLAY_WIDTH→s8 -16
  { x: 16, y: 0, shape: 1, size: 1, tileOffset: 4, priority: 1 },   // 32×8 ; décomp .x=16
];
// 1:1 décomp sHealthBar_Subsprites_Opponent = 2×32×8 + 1×8×8 (frame-end à x=-32,
// tileOffset 8). La 3e pièce 8×8 nécessite une 9e tile de gfx dans la région
// HPBAR_OPP (non chargée actuellement) → DIFFÉRÉE ; on garde les 2 pièces 32×8
// (= rendu adverse inchangé + le fix de hauteur). TODO 1:1 : charger la tile
// frame-end + ajouter `{ x:-32, y:0, shape:0, size:0, tileOffset:8, priority:1 }`.
const HEALTHBAR_SUBSPRITES_OPPONENT: readonly NamingSubsprite[] = [
  { x: -16, y: 0, shape: 1, size: 1, tileOffset: 0, priority: 1 },
  { x: 16, y: 0, shape: 1, size: 1, tileOffset: 4, priority: 1 },
];

// ─── Asset loading (idempotent) ─────────────────────────────────────────────

let _assetsLoaded = false;
// #VRAM 1:1 (étape 2c) : garde-fou d'allocation PAR COMBAT. ensureHealthboxAssets
// est appelé 2× par combat (player + opp via createBattlerHealthboxSprites) mais
// les 4 régions VRAM healthbox ne doivent être allouées qu'1× ; reset à false au
// teardown (resetHealthboxAllocation) pour que le combat SUIVANT ré-alloue —
// l'allocateur OBJ se reset entre combats (decomp-runtime FreeSpriteTileRanges).
let _hbAllocatedThisBattle = false;

/** #VRAM 1:1 (étape 2c) : libère les 4 régions VRAM healthbox (par tag) + arme la
 *  ré-allocation au combat suivant. À appeler au teardown du combat (battle-flow),
 *  à côté des FreeSpriteTilesByTag des mons. Les offsets du prochain combat seront
 *  potentiellement différents (allocateur dynamique) — tous les sites les relisent. */
export function resetHealthboxAllocation(): void {
  FreeSpriteTilesByTag(TAG_HB_PLAYER);
  FreeSpriteTilesByTag(TAG_HB_OPP);
  FreeSpriteTilesByTag(TAG_HPBAR_PLAYER);
  FreeSpriteTilesByTag(TAG_HPBAR_OPP);
  _hbAllocatedThisBattle = false;
}

// Cache des 2 palettes OBJ healthbox (vues 16-color). Ré-appliquées à CHAQUE
// combat même sur cache hit (cf. ensureHealthboxAssets) : en vrai flow OW→combat,
// OBJ pal HEALTHBOX/HEALTHBAR sont effacées (battle-init/transition) → healthbox noir.
let _hbPalette: Uint16Array | null = null;
let _hbarPalette: Uint16Array | null = null;
// Cache des tiles box healthbox (player/opp). Re-blittées à CHAQUE combat (cf.
// ensureHealthboxAssets cache-hit) : le battle-init wipe la VRAM + l'allocateur
// OBJ se reset au restore du champ entre combats → la région VRAM healthbox est
// écrasée par les tiles NPC → healthbox CORROMPUE dès le 2e combat consécutif
// (user-flag 2026-05-29 : "healthbox garbled combat 2+"). Cache hit ré-applique
// palette + re-blit ces tiles pour restaurer la région.
let _hbPlayerTiles: Uint8Array | null = null;
let _hbOppTiles: Uint8Array | null = null;

// 1:1 décomp `gHealthboxElementsGfxTable[]` (graphics.c:358-370) cache pour les
// 3 tiers de couleur HP bar. Chaque tier = 9 tiles (= 0..8 pixels remplis).
// Lus par updateHealthboxHpBar pour copier le bon tile dans OBJ VRAM dynamiquement.
const TILE_BYTES = 32;
let _hpBarTilesGreen:  Uint8Array | null = null;  // 9 tiles (= 288 bytes)
let _hpBarTilesYellow: Uint8Array | null = null;  // 9 tiles
let _hpBarTilesRed:    Uint8Array | null = null;  // 9 tiles
let _hpBarBaseTiles:   Uint8Array | null = null;  // 3 tiles = "blank/H/P" frame tiles 0..2 hpbar.png

// 1:1 décomp `numbers1.4bpp` (= player digits) + `numbers2.4bpp` (= opp digits).
// Tile layouts (= empirical inspection) :
//   - numbers1.png : tile 0 = blank, tiles 1..10 = digits 0..9
//   - numbers2.png : tiles 0..9 = digits 0..9, tile 10 = blank, tile 11 = "Lv" prefix or slash
let _numbers1Tiles: Uint8Array | null = null;
let _numbers2Tiles: Uint8Array | null = null;

// 1:1 décomp `status.4bpp` (= player single status icons) : 15 tiles arranged
// as 5 status types × 3 tiles each. Tile offsets dans le PNG :
//   - PSN : tiles 0..2
//   - PRZ : tiles 3..5
//   - SLP : tiles 6..8
//   - FRZ : tiles 9..11
//   - BRN : tiles 12..14
// For opp single nous utilisons status.png aussi (= les tile data sont identiques,
// la palette utilisée change la couleur d'affichage).
let _statusTiles: Uint8Array | null = null;

// 1:1 décomp `misc.4bpp` (= gHealthboxElementsGfxTable GFX_36..46). On cache le
// bloc entier ; le tile 3 (= HEALTHBOX_GFX_39 "blank health window") est le fond
// du groove (= tout index 2 = cream) que UpdateStatusIconInHealthbox recopie sur
// l'emplacement de l'icône status quand il n'y a PAS de status (= efface l'icône
// précédente SANS laisser un trou transparent qui laisserait voir le BG combat).
let _miscTiles: Uint8Array | null = null;

// 1:1 décomp `expbar.4bpp` : 9 tiles avec 9 niveaux "0..8 pixels remplis".
// Player single only (= opp single n'affiche pas d'exp bar).
let _expBarTiles: Uint8Array | null = null;

/** Re-arrange row-major tile data en metatile order.
 *
 *  Le décomp `-mwidth W -mheight H` réorganise le PNG en metatiles WxH (chacun
 *  W*H tiles). Notre `loadIndexedPng` retourne le tile data en row-major
 *  pixel-order. Pour les PNG dont `metaW * cols_metatiles == widthTiles`,
 *  les deux ordres coïncident. Sinon (e.g. opponent PNG 128×32 avec metatile
 *  8×4 = 2 metatiles horizontaux), il faut transposer.
 *
 *  PNG  : layout row-major par tile, dim = widthTiles × heightTiles
 *  Out  : metatiles séquentiels, chacun en row-major interne (= GBA OBJ VRAM
 *         layout attendu par OAM avec tileNum offset par metatile).
 */
function _rearrangeToMetatileOrder(
  charData: Uint8Array,
  widthTiles: number,
  heightTiles: number,
  metaW: number,
  metaH: number,
): Uint8Array {
  const TILE_BYTES = 32;
  if (widthTiles % metaW !== 0 || heightTiles % metaH !== 0) {
    throw new Error(`metatile dims mismatch: png ${widthTiles}×${heightTiles}, meta ${metaW}×${metaH}`);
  }
  // Si metaW === widthTiles → metatile order == row-major order, no-op.
  if (metaW === widthTiles) return charData;
  const totalTiles = widthTiles * heightTiles;
  const out = new Uint8Array(totalTiles * TILE_BYTES);
  const metaCols = widthTiles / metaW;
  const metaRows = heightTiles / metaH;
  let outIdx = 0;
  for (let mr = 0; mr < metaRows; mr++) {
    for (let mc = 0; mc < metaCols; mc++) {
      for (let r = 0; r < metaH; r++) {
        for (let c = 0; c < metaW; c++) {
          const srcTileIdx = (mr * metaH + r) * widthTiles + (mc * metaW + c);
          out.set(
            charData.subarray(srcTileIdx * TILE_BYTES, (srcTileIdx + 1) * TILE_BYTES),
            outIdx * TILE_BYTES,
          );
          outIdx++;
        }
      }
    }
  }
  return out;
}

/** Charge tous les assets healthbox 1 fois (= LoadBattleHealthboxGfx pattern).
 *
 *  À appeler une fois au début du battle scene SPAWN. Idempotent.
 *
 *  Mappings 1:1 décomp :
 *    - sSpriteSheet_SinglesPlayerHealthbox = (gHealthboxSinglesPlayerGfx, 0x1000, TAG_HEALTHBOX_PLAYER1_TILE)
 *    - sSpriteSheet_SinglesOpponentHealthbox = (gHealthboxSinglesOpponentGfx, 0x1000, TAG_HEALTHBOX_OPPONENT1_TILE)
 *    - sSpriteSheets_HealthBar[0] = (gBlankGfxCompressed, 0x100, TAG_HEALTHBAR_PLAYER1_TILE) → updated dynamically par UpdateHpBar
 *    - sSpriteSheets_HealthBar[1] = (gBlankGfxCompressed, 0x120, TAG_HEALTHBAR_OPPONENT1_TILE)
 *    - sSpritePalettes_HealthBoxHealthBar = palettes HEALTHBOX + HEALTHBAR */
export async function ensureHealthboxAssets(): Promise<void> {
  const rt = getRuntime();
  if (!rt) return;

  // ─── Allocation VRAM healthbox (1× PAR COMBAT) ──────────────────────────
  // 1:1 décomp : LoadBattleSpritesGfx charge les sprite sheets healthbox via
  // LoadCompressedSpriteSheet → le tile allocator OBJ (AllocSpriteTiles). On
  // réplique : on alloue les 4 régions et on fixe les byte offsets dynamiques.
  // Ordre décomp (battle_gfx_sfx_util.c:747-760) : player box → opp box →
  // HealthBar[player] → HealthBar[opp]. Garde-fou `_hbAllocatedThisBattle` :
  // l'appel #2 (opp) + le re-blit cache-hit réutilisent ces mêmes offsets.
  if (!_hbAllocatedThisBattle) {
    const hbPlayerStart = AllocSpriteTiles(HEALTHBOX_PLAYER_TILE_COUNT);
    AllocSpriteTileRange(TAG_HB_PLAYER, hbPlayerStart, HEALTHBOX_PLAYER_TILE_COUNT);
    HEALTHBOX_PLAYER_VRAM = hbPlayerStart * TILE_BYTES;

    const hbOppStart = AllocSpriteTiles(HEALTHBOX_OPPONENT_TILE_COUNT);
    AllocSpriteTileRange(TAG_HB_OPP, hbOppStart, HEALTHBOX_OPPONENT_TILE_COUNT);
    HEALTHBOX_OPPONENT_VRAM = hbOppStart * TILE_BYTES;

    const hpbarPlayerStart = AllocSpriteTiles(HPBAR_PLAYER_TILE_COUNT);
    AllocSpriteTileRange(TAG_HPBAR_PLAYER, hpbarPlayerStart, HPBAR_PLAYER_TILE_COUNT);
    HPBAR_PLAYER_LEFT_VRAM  = hpbarPlayerStart * TILE_BYTES;
    HPBAR_PLAYER_RIGHT_VRAM = HPBAR_PLAYER_LEFT_VRAM + 0x80;

    const hpbarOppStart = AllocSpriteTiles(HPBAR_OPP_TILE_COUNT);
    AllocSpriteTileRange(TAG_HPBAR_OPP, hpbarOppStart, HPBAR_OPP_TILE_COUNT);
    HPBAR_OPP_LEFT_VRAM  = hpbarOppStart * TILE_BYTES;
    HPBAR_OPP_RIGHT_VRAM = HPBAR_OPP_LEFT_VRAM + 0x80;

    _hbAllocatedThisBattle = true;
  }

  if (_assetsLoaded) {
    // Cache hit : on a déjà fetch+converti les PNG (= pas de re-fetch). MAIS contrairement
    // à l'ancienne hypothèse, la VRAM OBJ NE SURVIT PAS entre combats : le battle-init
    // wipe la VRAM + l'allocateur OBJ se reset au restore du champ → la région VRAM
    // healthbox est écrasée par les tiles NPC → healthbox NOIRE (palette) ET CORROMPUE
    // (tiles) dès le 2e combat consécutif (user-flag 2026-05-29 : "garbled combat 2+").
    // On ré-applique donc palettes + RE-BLIT les tiles box+hpbar à chaque appel.
    // createBattlerHealthboxSprites() appelle ceci au spawn (= APRÈS le clear init).
    // 1:1 LoadSpritePalette : alloc dynamique + tag + écrit faded (→ flush live).
    if (_hbPalette) HEALTHBOX_PALETTE_SLOT = LoadSpritePalette({ data: _hbPalette, tag: TAG_HEALTHBOX_PAL });
    if (_hbarPalette) HEALTHBAR_PALETTE_SLOT = LoadSpritePalette({ data: _hbarPalette, tag: TAG_HEALTHBAR_PAL });
    if (_hbPlayerTiles) {
      rt.gba.objVram.set(_hbPlayerTiles, HEALTHBOX_PLAYER_VRAM);
      MarkObjTilesAllocated(HEALTHBOX_PLAYER_VRAM, _hbPlayerTiles.length);
    }
    if (_hbOppTiles) {
      rt.gba.objVram.set(_hbOppTiles, HEALTHBOX_OPPONENT_VRAM);
      MarkObjTilesAllocated(HEALTHBOX_OPPONENT_VRAM, _hbOppTiles.length);
    }
    if (_hpBarTilesGreen && _hpBarBaseTiles) {
      const fullGreen = _hpBarTilesGreen.subarray(8 * TILE_BYTES, 9 * TILE_BYTES);
      for (let i = 2; i < 8; i++) {
        rt.gba.objVram.set(fullGreen, HPBAR_PLAYER_LEFT_VRAM + i * TILE_BYTES);
        rt.gba.objVram.set(fullGreen, HPBAR_OPP_LEFT_VRAM + i * TILE_BYTES);
      }
      rt.gba.objVram.set(_hpBarBaseTiles.subarray(1 * TILE_BYTES, 3 * TILE_BYTES), HPBAR_PLAYER_LEFT_VRAM);
      rt.gba.objVram.set(_hpBarBaseTiles.subarray(1 * TILE_BYTES, 3 * TILE_BYTES), HPBAR_OPP_LEFT_VRAM);
      MarkObjTilesAllocated(HPBAR_PLAYER_LEFT_VRAM, 8 * TILE_BYTES);
      MarkObjTilesAllocated(HPBAR_OPP_LEFT_VRAM, 8 * TILE_BYTES);
    }
    return;
  }

  // ─── Player healthbox tile data ─────────────────────────────────────────
  // PNG 64×128 = 8w × 16t tiles. `-mwidth 8 -mheight 8` → 2 metatiles 8×8.
  // Comme metaW (8) === widthTiles (8), row-major == metatile order, no-op.
  //
  // CRITIQUE : utilise `loadIndexedPngStrict` qui lit la PLTE PNG (= palette
  // canonique partagée avec ball_status_bar.png). Sinon `loadIndexedPng`
  // reconstruct palette via canvas pixel order qui peut diverger de la PLTE
  // originale → mismatch entre tile data indices + palette colors → corruption.
  const playerPng = await loadIndexedPngStrict(HEALTHBOX_PLAYER_PNG, 4);
  const playerTiles = _rearrangeToMetatileOrder(
    playerPng.charData, playerPng.widthTiles, playerPng.heightTiles, 8, 8,
  );
  rt.gba.objVram.set(playerTiles, HEALTHBOX_PLAYER_VRAM);
  _hbPlayerTiles = playerTiles;  // cache pour re-blit cache-hit (cf. ensureHealthboxAssets)
  // 1:1 STRICT bitmap allocator sync : ces tiles healthbox sont hardcodées
  // au début d'OBJ VRAM (= 0x0000..) → si on ne marque pas, AllocSpriteTiles
  // les voit free et les re-attribue (= corruption).
  MarkObjTilesAllocated(HEALTHBOX_PLAYER_VRAM, playerTiles.length);

  // ─── Opponent healthbox tile data ───────────────────────────────────────
  // PNG 128×32 = 16w × 4t tiles. `-mwidth 8 -mheight 4` → 2 metatiles 8×4
  // arrangés horizontalement (16 cols / 8 = 2 metatile cols).
  // metaW (8) !== widthTiles (16), donc on DOIT transposer.
  const oppPng = await loadIndexedPngStrict(HEALTHBOX_OPPONENT_PNG, 4);
  const oppTiles = _rearrangeToMetatileOrder(
    oppPng.charData, oppPng.widthTiles, oppPng.heightTiles, 8, 4,
  );
  rt.gba.objVram.set(oppTiles, HEALTHBOX_OPPONENT_VRAM);
  _hbOppTiles = oppTiles;  // cache pour re-blit cache-hit (cf. ensureHealthboxAssets)
  MarkObjTilesAllocated(HEALTHBOX_OPPONENT_VRAM, oppTiles.length);

  // ─── HP bar widget tile data ────────────────────────────────────────────
  // 1:1 décomp `gHealthboxElementsGfxTable[]` (graphics.c:358) concatène
  // plusieurs .4bpp files. Nous cachons les sous-blocs :
  //   - hpbar.png tiles 0..2     = "black bg" + "H" + "P" labels (= 3 tiles)
  //   - hpbar.png tiles 3..11    = GREEN bar 0..8 pixels remplis (= 9 tiles)
  //   - hpbar_anim.png tiles 0..8 = YELLOW bar 0..8 pixels (= 9 tiles)
  //   - hpbar_anim.png tiles 9..17 = RED bar 0..8 pixels (= 9 tiles)
  const hpbarPng = await loadIndexedPngStrict(HPBAR_PNG, 4);
  const hpbarAnimPng = await loadIndexedPngStrict(HPBAR_ANIM_PNG, 4);
  _hpBarBaseTiles  = hpbarPng.charData.subarray(0, 3 * TILE_BYTES);              // tiles 0..2
  _hpBarTilesGreen = hpbarPng.charData.subarray(3 * TILE_BYTES, 12 * TILE_BYTES); // tiles 3..11
  _hpBarTilesYellow = hpbarAnimPng.charData.subarray(0, 9 * TILE_BYTES);          // tiles 0..8
  _hpBarTilesRed    = hpbarAnimPng.charData.subarray(9 * TILE_BYTES, 18 * TILE_BYTES); // tiles 9..17

  // Initial state : bar pleine GREEN (= 8 pixels par tile, tile data GREEN+8).
  // updateHealthboxHpBar override this dès qu'on a un mon avec HP/maxHp.
  const fullGreen = _hpBarTilesGreen.subarray(8 * TILE_BYTES, 9 * TILE_BYTES); // tile = 8 pixels filled
  // Bar layout (= 8 tiles per side, but only middle 6 tiles utilized for fill).
  // tiles 0..1 reserved pour "H/P" labels (= ne pas remplir avec fill data).
  // tiles 2..7 = les 6 fill tiles (= updated by updateHealthboxHpBar).
  for (let i = 2; i < 8; i++) {
    rt.gba.objVram.set(fullGreen, HPBAR_PLAYER_LEFT_VRAM + i * TILE_BYTES);
    rt.gba.objVram.set(fullGreen, HPBAR_OPP_LEFT_VRAM + i * TILE_BYTES);
  }
  // tiles 0..1 = labels "H" "P" depuis hpbar.png tile 1 + 2 (= "H" + "P").
  rt.gba.objVram.set(_hpBarBaseTiles.subarray(1 * TILE_BYTES, 3 * TILE_BYTES), HPBAR_PLAYER_LEFT_VRAM);
  rt.gba.objVram.set(_hpBarBaseTiles.subarray(1 * TILE_BYTES, 3 * TILE_BYTES), HPBAR_OPP_LEFT_VRAM);
  // 1:1 STRICT bitmap allocator sync : HP bars couvrent 8 tiles continus
  // (= LEFT+RIGHT) chacune côté player et opp.
  MarkObjTilesAllocated(HPBAR_PLAYER_LEFT_VRAM, 8 * TILE_BYTES);
  MarkObjTilesAllocated(HPBAR_OPP_LEFT_VRAM, 8 * TILE_BYTES);

  // ─── Numbers tile sets (= digits 0..9 pour Lv + HP display) ─────────────
  // 1:1 décomp graphics_file_rules.mk:90-91 :
  //   numbers1.4bpp = digits player (white)
  //   numbers2.4bpp = digits opp (yellow/contrast)
  // numbers1.png / numbers2.png sont en mode "L" (grayscale) sans PLTE chunk.
  // Utilise `loadIndexedPng` (= reconstruct palette depuis pixel order).
  // Les indices résultants correspondront aux grayscale levels du PNG (= 0..N).
  // L'usage dans le décomp suppose que ces indices matchent les colors de la
  // palette HEALTHBAR (= ball_display.png .gbapal). Tile data sera readable
  // avec cette palette.
  const numbers1Png = await loadIndexedPng(NUMBERS1_PNG);
  const numbers2Png = await loadIndexedPng(NUMBERS2_PNG);
  _numbers1Tiles = numbers1Png.charData;  // 11 tiles
  _numbers2Tiles = numbers2Png.charData;  // 12 tiles

  // ─── Status icons tile data ─────────────────────────────────────────────
  // 1:1 décomp `status.4bpp` (= 24×40 = 15 tiles : 5 status × 3 tiles each).
  // Used pour player single + opp single (= even though decomp has status2/3/4
  // pour battler 1/2/3 doubles, en single ils utilisent tous status.png).
  // status.png = multi-sub-palette (PLTE 80-color, 5 sub-pal). Lire avec
  // indices LOCAUX `% 16` (= 1:1 décomp status.4bpp). loadIndexedPngStrict
  // ne prendrait que sub-pal 0 → 439 px (sub-pal 1..4) unmapped → transparent.
  _statusTiles = await _loadMultiSubPalTiles(STATUS_PNG);

  // ─── misc tile data (= GFX_36..46) ──────────────────────────────────────
  // 1:1 décomp `misc.4bpp` (88×8 = 11 tiles, palette HEALTHBOX simple 16-color).
  // On a besoin du tile 3 (= HEALTHBOX_GFX_39) pour le "no status" fill (cf.
  // updateHealthboxStatus). loadIndexedPngStrict suffit (PNG mono-sub-palette).
  const miscPng = await loadIndexedPngStrict(MISC_PNG, 4);
  _miscTiles = miscPng.charData;

  // ─── EXP bar tile data ──────────────────────────────────────────────────
  // 1:1 décomp `expbar.4bpp` 72×8 = 9 tiles avec progressive fill 0..8 pixels.
  const expbarPng = await loadIndexedPngStrict(EXPBAR_PNG, 4);
  _expBarTiles = expbarPng.charData;

  // ─── Palettes ───────────────────────────────────────────────────────────
  // CRITIQUE : utilise `extractPngPlte` qui lit la PLTE PNG raw (= 16 colors
  // dans l'ordre canonique). Le décomp utilise `INCGFX_U16("ball_status_bar.png", ".gbapal")`
  // qui extract la même PLTE. C'est CETTE palette qui doit être loadée dans
  // OBJ palette slot 5, et les tile data des healthboxes utilisent les indices
  // correspondants à cette palette.
  //
  // HEALTHBOX palette = ball_status_bar.png .gbapal (= 16 colors).
  const ballStatusBarPlte = await extractPngPlte(BALL_STATUS_BAR_PNG);
  if (!ballStatusBarPlte) throw new Error(`PLTE missing: ${BALL_STATUS_BAR_PNG}`);
  _hbPalette = ballStatusBarPlte.subarray(0, 16);
  HEALTHBOX_PALETTE_SLOT = LoadSpritePalette({ data: _hbPalette, tag: TAG_HEALTHBOX_PAL });

  // HEALTHBAR palette = ball_display.png .gbapal.
  const ballDisplayPlte = await extractPngPlte(BALL_DISPLAY_PNG);
  if (!ballDisplayPlte) throw new Error(`PLTE missing: ${BALL_DISPLAY_PNG}`);
  _hbarPalette = ballDisplayPlte.subarray(0, 16);
  HEALTHBAR_PALETTE_SLOT = LoadSpritePalette({ data: _hbarPalette, tag: TAG_HEALTHBAR_PAL });

  _assetsLoaded = true;
}

/** Pour test/devtools : reset le cache (= force re-load). */
export function resetHealthboxAssetsCache(): void {
  _assetsLoaded = false;
}

// ─── Healthbox handle (= spriteIds des 3 sprites) ───────────────────────────

export interface HealthboxHandle {
  /** Sprite ID `healthboxLeftSpriteId` (= 64×64 SQUARE player, 64×32 WIDE opp). */
  leftSpriteId: number;
  /** Sprite ID `healthboxRightSpriteId` (= 64×64 SQUARE player, 64×32 WIDE opp). */
  rightSpriteId: number;
  /** Sprite ID du `healthbarSprite` = UN sprite à sous-sprites (1:1 décomp
   *  `sHealthBar_SubspriteTables`). Les pièces (2 joueur / 2 adverse) sont des
   *  child OAM gérés par `SetSubspriteTables` (positionnés sans ctcv). */
  healthbarSpriteId: number;
  /** Quel side : 'player' / 'opponent'. */
  side: 'player' | 'opponent';
  /** Position center du sprite left (= UpdateSpritePos `sprite.x`, `sprite.y`).
   *  Player : (158, 88). Opp : (44, 30). */
  centerX: number;
  centerY: number;
}

// ─── Sprite creation 1:1 décomp ─────────────────────────────────────────────

/** 1:1 décomp `CreateBattlerHealthboxSprites` (battle_interface.c:869-951)
 *  pour single battle. Retourne handle avec 3 spriteIds.
 *
 *  Position défaut = `InitBattlerHealthboxCoords` (battle_interface.c:1072-1103) :
 *    - Player single : (158, 88)
 *    - Opponent single : (44, 30) */
export async function createBattlerHealthboxSprites(
  side: 'player' | 'opponent',
): Promise<HealthboxHandle | null> {
  await ensureHealthboxAssets();
  const rt = getRuntime();
  if (!rt) return null;

  // 1:1 décomp CreateBattlerHealthboxSprites (battle_interface.c:880-886) : le
  // player healthbox est créé avec le template WIDE (`sOamData_64x32`), donc
  // `CalcCenterToCornerVec` calcule ctcv pour 64×32 = (-32, -16). PUIS le décomp
  // force `gSprites[id].oam.shape = ST_OAM_SQUARE` (→ 64×64) SANS recalculer le
  // ctcv (sprite.c ne recompute PAS le ctcv sur un set direct de oam.shape).
  // Donc le sprite s'affiche en 64×64 mais reste positionné avec ctcvY = -16.
  // CRITIQUE : créer directement en SQUARE donnerait ctcvY = -32 → box 16px trop
  // haute (= bug user 2026-05-29 "barres de vie décalées" : box recess 12px au-
  // dessus de la barre). Ce helper reproduit l'override 1:1.
  const forceSquareKeepWideCtcv = (h: { spriteId: number; oamIndex: number }): void => {
    const oam = rt.gba.oam[h.oamIndex];
    if (oam) oam.shape = 0;  // ST_OAM_SQUARE (64×64 render), size reste 3
    const sp = rt.gSprites.get(h.spriteId);
    if (sp) sp.shape = 0;    // garde centerToCornerVec calculé pour WIDE
  };

  if (side === 'player') {
    // 1:1 décomp ll. 880-887 player single :
    //   left  = CreateSprite(template WIDE sOamData_64x32, …, priority=1)
    //   right = CreateSpriteAtEnd(template WIDE, …, priority=1)
    //   left.oam.shape  = ST_OAM_SQUARE  (override sans recalc ctcv)
    //   right.oam.shape = ST_OAM_SQUARE
    //   right.tileNum  += 64
    // Position décomp (240,160) puis UpdateSpritePos → (158, 88) ; on crée direct.
    const centerX = 158;
    const centerY = 88;
    const left = rt.CreateSpriteAtOam({
      tileId: HEALTHBOX_PLAYER_VRAM / 32,
      paletteBank: HEALTHBOX_PALETTE_SLOT,
      x: centerX, y: centerY,
      shape: 1,  // WIDE (= template sOamData_64x32) → ctcv (-32, -16)
      size: 3,   // 64×32
      priority: 1,
    });
    forceSquareKeepWideCtcv(left);  // → render 64×64, ctcvY conservé à -16
    const right = rt.CreateSpriteAtOam({
      tileId: HEALTHBOX_PLAYER_VRAM / 32 + 64,  // tileNum += 64 (= second 64x64 metatile)
      paletteBank: HEALTHBOX_PALETTE_SLOT,
      // `SpriteCB_HealthBoxOther` → sprite.x = leftSprite.x + 64.
      x: centerX + 64, y: centerY,
      shape: 1, size: 3,  // WIDE → ctcv (-32, -16)
      priority: 1,
    });
    forceSquareKeepWideCtcv(right);
    // 1:1 décomp ll. 932-947 + `sHealthBar_SubspriteTables[B_SIDE_PLAYER]` : la
    // barre HP = UN sprite (`healthbarSprite`) avec table de sous-sprites (2 pièces
    // 32×8). SpriteCB_HealthBar player (data6=0) → sprite.x = healthbox.x + 16.
    // Les pièces sont posées à sprite.x+sub.x, sprite.y+sub.y SANS ctcv → top à
    // sprite.y=88 (et non 84). `tileBase` = région VRAM barre ; les pièces lisent
    // tileBase+tileOffset, et le fill (updateHealthboxHpBar) écrit dans cette
    // même région (tiles 2..7).
    const bar = rt.CreateSpriteAtOam({
      tileId: HPBAR_PLAYER_LEFT_VRAM / 32,
      paletteBank: HEALTHBAR_PALETTE_SLOT,
      x: centerX + 16, y: centerY,
      shape: 1, size: 1,  // primary oam (caché en mode subsprite)
      priority: 1,
    });
    const barSp = rt.gSprites.get(bar.spriteId);
    if (barSp) barSp.tileBase = HPBAR_PLAYER_LEFT_VRAM / 32;
    SetSubspriteTables(bar.spriteId, HEALTHBAR_SUBSPRITES_PLAYER);
    return {
      leftSpriteId: left.spriteId,
      rightSpriteId: right.spriteId,
      healthbarSpriteId: bar.spriteId,
      side: 'player',
      centerX, centerY,
    };
  } else {
    // 1:1 décomp ll. 890-896 opponent single :
    //   left  = CreateSprite(template[0], 240, 160, 1)  // WIDE+size3 = 64×32
    //   right = CreateSpriteAtEnd(template[0], 240, 160, 1)
    //   right.tileNum += 32
    //   (no shape override → reste WIDE = 64×32)
    //   data6 = 2 (= utilisé par SpriteCB_HealthBar.x = mainSprite.x + 8)
    const centerX = 44;
    const centerY = 30;
    const left = rt.CreateSpriteAtOam({
      tileId: HEALTHBOX_OPPONENT_VRAM / 32,
      paletteBank: HEALTHBOX_PALETTE_SLOT,
      x: centerX, y: centerY,
      shape: 1,  // = WIDE
      size: 3,   // = WIDE+size3 = 64×32
      priority: 1,
    });
    const right = rt.CreateSpriteAtOam({
      tileId: HEALTHBOX_OPPONENT_VRAM / 32 + 32,
      paletteBank: HEALTHBOX_PALETTE_SLOT,
      x: centerX + 64, y: centerY,
      shape: 1, size: 3,
      priority: 1,
    });
    // 1:1 décomp `sHealthBar_SubspriteTables[B_SIDE_OPPONENT]` : barre = UN sprite
    // à sous-sprites. SpriteCB_HealthBar opp (data6=2) → sprite.x = healthbox.x + 8.
    const bar = rt.CreateSpriteAtOam({
      tileId: HPBAR_OPP_LEFT_VRAM / 32,
      paletteBank: HEALTHBAR_PALETTE_SLOT,
      x: centerX + 8, y: centerY,
      shape: 1, size: 1,
      priority: 1,
    });
    const barSp = rt.gSprites.get(bar.spriteId);
    if (barSp) barSp.tileBase = HPBAR_OPP_LEFT_VRAM / 32;
    SetSubspriteTables(bar.spriteId, HEALTHBAR_SUBSPRITES_OPPONENT);
    return {
      leftSpriteId: left.spriteId,
      rightSpriteId: right.spriteId,
      healthbarSpriteId: bar.spriteId,
      side: 'opponent',
      centerX, centerY,
    };
  }
}

/** Sprite IDs d'un healthbox handle (3 gSprites = box left/right + barre). Les
 *  pièces de la barre sont des child OAM (pas des gSprites) gérés à part. */
function _allSpriteIds(handle: HealthboxHandle): number[] {
  return [handle.leftSpriteId, handle.rightSpriteId, handle.healthbarSpriteId];
}

/** 1:1 décomp `SetHealthboxSpriteVisible/Invisible` (ll. 1024-1036) :
 *  toggle visibility de tous les sprites du healthbox (left/right + bar L/R) ensemble. */
export function setHealthboxVisible(handle: HealthboxHandle, visible: boolean): void {
  const rt = getRuntime();
  if (!rt) return;
  for (const spriteId of _allSpriteIds(handle)) {
    const sprite = rt.gSprites.get(spriteId);
    if (sprite) {
      sprite.invisible = !visible;
      const oam = rt.gba.oam[sprite.oamIndex];
      if (oam) oam.visible = visible;
    }
  }
}

// ─── Slide-in du healthbox (1:1 StartHealthboxSlideIn pokeball.c:1241) ──────
// La box (left/right = sprites normaux) suit son x2 via syncSpritesToOam ; la
// barre HP (subsprite) suit le x2 du parent via syncSubspriteOam (oam.x = x+x2+sub.x,
// déjà câblé pour le bounce y2). Donc poser x2 sur les 3 sprites + décrémenter
// jusqu'à 0 fait glisser tout le healthbox d'un bloc.
interface _HbSlideState { handle: HealthboxHandle; speedX: number; }
const _hbSlides: _HbSlideState[] = [];
let _hbSlideLastFc = -1;

/** 1:1 StartHealthboxSlideIn(battler) : x2 = 0x73 (115), sSpeedX = 5 ; côté
 *  ADVERSE (non-player) négativés (x2 = -115, sSpeedX = -5 → entre par la gauche).
 *  Rend le healthbox visible + lance le slide (tickHealthboxSlideIn fait x2 -= sSpeedX). */
export function startHealthboxSlideIn(handle: HealthboxHandle): void {
  const rt = getRuntime();
  if (!rt) return;
  const isPlayer = handle.side === 'player';
  const startX2 = isPlayer ? 0x73 : -0x73;   // 1:1 : x2 = 0x73, négativé côté opp
  const speedX = isPlayer ? 5 : -5;          // 1:1 : sSpeedX = 5, négativé côté opp
  for (const spriteId of _allSpriteIds(handle)) {
    const sprite = rt.gSprites.get(spriteId);
    if (!sprite) continue;
    sprite.x2 = startX2;
    sprite.y2 = 0;
    sprite.invisible = false;
    const oam = rt.gba.oam[sprite.oamIndex];
    if (oam) oam.visible = true;
  }
  // Remplace une éventuelle slide en cours sur le même handle.
  const i = _hbSlides.findIndex(s => s.handle === handle);
  if (i >= 0) _hbSlides.splice(i, 1);
  _hbSlides.push({ handle, speedX });
}

/** Tick per-frame (gated ~60fps). 1:1 SpriteCB_HealthboxSlideIn : x2 -= sSpeedX
 *  jusqu'à x2 == 0 (= ~23 frames à 5px). No-op si aucune slide active. */
export function tickHealthboxSlideIn(): void {
  if (_hbSlides.length === 0) return;
  const rt = getRuntime();
  if (!rt) { _hbSlides.length = 0; return; }
  // 1:1 timing : avance ≤1 step / FRAME LOGIQUE (gIntroFrameCounter, 60Hz tickFixed),
  // pas sur le mur d'horloge — lockstep avec la logique + déterministe au frame-step.
  const fc = rt.gIntroFrameCounter;
  if (fc === _hbSlideLastFc) return;
  _hbSlideLastFc = fc;
  for (let s = _hbSlides.length - 1; s >= 0; s--) {
    const { handle, speedX } = _hbSlides[s];
    let done = false;
    for (const spriteId of _allSpriteIds(handle)) {
      const sprite = rt.gSprites.get(spriteId);
      if (!sprite) continue;
      let x2 = (sprite.x2 ?? 0) - speedX;   // 1:1 : x2 -= sSpeedX
      // clamp au passage par 0 (évite l'overshoot avec un pas de 5).
      if ((speedX > 0 && x2 <= 0) || (speedX < 0 && x2 >= 0)) { x2 = 0; done = true; }
      sprite.x2 = x2;
    }
    if (done) _hbSlides.splice(s, 1);
  }
}

/** Annule toutes les slides en cours (= teardown combat). */
export function stopHealthboxSlideIn(): void { _hbSlides.length = 0; _hbSlideLastFc = -1; }

/** 1:1 décomp `DestoryHealthboxSprite` (ll. 1044-1049) : destroy tous les sprites. */
export function destroyHealthboxSprite(handle: HealthboxHandle): void {
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 : libère d'abord les child OAM des sous-sprites de la barre (sinon ils
  // fuient = OAM visibles orphelins au combat suivant).
  clearSubspriteTable(handle.healthbarSpriteId);
  for (const spriteId of _allSpriteIds(handle)) rt.DestroySprite(spriteId);
}

/** 1:1 décomp `UpdateOamPriorityInAllHealthboxes` (ll. 1056-1070) : update
 *  priority des sprites pour un battler. */
export function setHealthboxPriority(handle: HealthboxHandle, priority: number): void {
  const rt = getRuntime();
  if (!rt) return;
  for (const spriteId of _allSpriteIds(handle)) {
    const sprite = rt.gSprites.get(spriteId);
    if (!sprite) continue;
    const oam = rt.gba.oam[sprite.oamIndex];
    if (oam) oam.priority = priority;
  }
}

// ─── HP bar widget : 1:1 décomp MoveBattleBarGraphically (D2) ───────────────

/** 1:1 décomp `CalcBarFilledPixels` (battle_interface.c:2413-2459).
 *
 *  Compute la décomposition de la HP courante en `scale` tiles de 8 pixels
 *  chacun. Retourne :
 *    - `filledPixels` (0..scale*8) : total pixels remplis
 *    - `pixelsArray[i]` (0..8) : pixels remplis dans tile i
 *
 *  Spécial : si HP > 0 et filledPixels == 0 → force 1 pixel (= "almost dead"
 *  display tier "≥1 pixel"). */
function _calcBarFilledPixels(currHp: number, maxHp: number, scale: number): { filled: number; array: number[] } {
  const array = new Array<number>(scale).fill(0);
  if (maxHp <= 0) return { filled: 0, array };
  const totalPixels = scale * 8;
  let pixels = Math.floor(currHp * totalPixels / maxHp);
  let filledPixels = pixels;
  if (filledPixels === 0 && currHp > 0) {
    array[0] = 1;
    filledPixels = 1;
  } else {
    for (let i = 0; i < scale; i++) {
      if (pixels >= 8) {
        array[i] = 8;
      } else {
        array[i] = pixels;
        break;
      }
      pixels -= 8;
    }
  }
  return { filled: filledPixels, array };
}

/** 1:1 décomp `MoveBattleBarGraphically` HEALTH_BAR case (battle_interface.c:2275-2308).
 *
 *  Update les 6 fill tiles du HP bar widget à OBJ VRAM. Choisit le tier
 *  GREEN/YELLOW/RED selon `filledPixels` :
 *    - > 50% (= > 24 pixels) → GREEN
 *    - > 20% (= > 9.6 pixels) → YELLOW
 *    - else → RED
 *
 *  Pour chaque i de 0..5, copie `tiers[barTier][array[i]]` (= 32 bytes tile)
 *  à VRAM tile offset `barTileNumStart + 2 + i` (= les 6 fill tiles au milieu
 *  du bar widget, après les 2 tiles "H/P" labels au début). */
export function updateHealthboxHpBar(handle: HealthboxHandle, currHp: number, maxHp: number): void {
  const rt = getRuntime();
  if (!rt) return;
  if (!_hpBarTilesGreen || !_hpBarTilesYellow || !_hpBarTilesRed) {
    // Assets not yet loaded — silent skip (= will be retried next update).
    return;
  }

  // 1:1 décomp `B_HEALTHBAR_PIXELS = 48`, scale = 6 tiles.
  const { filled, array } = _calcBarFilledPixels(currHp, maxHp, 6);

  // 1:1 décomp ll. 2291-2296 : color tier selection.
  let tiles: Uint8Array;
  if (filled > 48 * 50 / 100) tiles = _hpBarTilesGreen;
  else if (filled > 48 * 20 / 100) tiles = _hpBarTilesYellow;
  else tiles = _hpBarTilesRed;

  // 1:1 décomp ll. 2298-2307 : copy 6 fill tiles à OBJ VRAM at offset
  // `barTileNumStart + 2 + i`. tileNumStart = OBJ VRAM byte / 32.
  // For our 2-sprite bar layout, tiles 0..3 are in HPBAR_*_LEFT_VRAM,
  // tiles 4..7 are in HPBAR_*_RIGHT_VRAM (which is contiguous from LEFT + 4 tiles).
  // So we just write to (HPBAR_*_LEFT_VRAM + (2 + i) * 32) for all i=0..5.
  const baseVram = handle.side === 'player' ? HPBAR_PLAYER_LEFT_VRAM : HPBAR_OPP_LEFT_VRAM;
  for (let i = 0; i < 6; i++) {
    const pixels = array[i];
    const srcOffset = pixels * TILE_BYTES;
    const destOffset = baseVram + (2 + i) * TILE_BYTES;
    rt.gba.objVram.set(tiles.subarray(srcOffset, srcOffset + TILE_BYTES), destOffset);
  }
}

// ─── Digits (Lv / HP) : D3 1:1 décomp UpdateLvlInHealthbox / UpdateHpTextInHealthbox ─

/** Convertit un nombre en array de tile indices `numbers1.png`.
 *  - numbers1.png tile 0 = blank
 *  - numbers1.png tiles 1..10 = digits 0..9 (= correspondance digit+1)
 *
 *  Right-align : pour `num=42` avec `len=3` → `[blank, '4', '2']` = `[0, 5, 3]`. */
function _digitsToNumbers1Tiles(num: number, len: number): number[] {
  const str = String(Math.max(0, Math.min(num, 999))).padStart(len, ' ');
  return str.split('').map(c => c === ' ' ? 0 : Number(c) + 1);
}

/** Convertit un nombre en array de tile indices `numbers2.png`.
 *  - numbers2.png tiles 0..9 = digits 0..9 (= digit directe)
 *  - numbers2.png tile 10 = blank
 *  - numbers2.png tile 11 = "Lv" prefix / slash special */
function _digitsToNumbers2Tiles(num: number, len: number): number[] {
  const str = String(Math.max(0, Math.min(num, 999))).padStart(len, ' ');
  return str.split('').map(c => c === ' ' ? 10 : Number(c));
}

/** Write N tiles à OBJ VRAM à partir d'un tile source array. */
function _writeTilesToVram(vramByteOffset: number, tileIndices: number[], tileSource: Uint8Array): void {
  const rt = getRuntime();
  if (!rt) return;
  for (let i = 0; i < tileIndices.length; i++) {
    const tileIdx = tileIndices[i];
    rt.gba.objVram.set(
      tileSource.subarray(tileIdx * TILE_BYTES, (tileIdx + 1) * TILE_BYTES),
      vramByteOffset + i * TILE_BYTES,
    );
  }
}

// ─── Pipeline texte → healthbox OBJ : 1:1 décomp (battle_interface.c:2551-2604) ─
//
// Le décomp ne dessine PAS le texte healthbox (nickname / "N." niveau / "cur/max"
// PV) avec des tiles pré-cuits : il rend le texte via le système de POLICE dans une
// window temporaire (FONT_SMALL), puis copie les tiles glyphes obtenus dans l'OBJ
// VRAM du sprite healthbox. C'est le port de ce pipeline ("D6b text-to-tiles renderer"
// déféré historiquement). Débloque surnom + préfixe niveau "N." + slash PV.

/** 1:1 décomp `sHealthboxWindowTemplate` (battle_interface.c:760-768) : window temp
 *  8×2 tiles (= 64×16 px) servant de canvas glyphes. */
const sHealthboxWindowTemplate = {
  bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 8, height: 2, paletteNum: 0, baseBlock: 0,
} as const;

/** 1:1 décomp `AddTextPrinterAndCreateWindowOnHealthbox` (battle_interface.c:2551).
 *  Crée la window temp, fond = PIXEL_FILL(bgColor), rend `str` en FONT_SMALL avec
 *  color = [bgColor, 1, 3]. TEXT_SKIP_DRAW = render synchrone dans le pixelBuffer. */
function _addTextPrinterAndCreateWindowOnHealthbox(str: string, x: number, y: number, bgColor: number): number {
  const winId = AddWindow(sHealthboxWindowTemplate);
  FillWindowPixelBuffer(winId, (bgColor << 4) | bgColor);  // = PIXEL_FILL(bgColor)
  AddTextPrinterParameterized4(winId, FONT_SMALL, x, y, 0, 0, [bgColor, 1, 3], TEXT_SKIP_DRAW, str);
  return winId;
}

/** Convertit le pixelBuffer linéaire (1 byte/pixel idx 0-15) de la window en tile
 *  data 4bpp tile-packed GBA — soit l'équivalent de ce que renvoie côté décomp
 *  `GetWindowAttribute(winId, WINDOW_TILE_DATA)`. Layout : tiles row-major, 32
 *  bytes/tile, 4 bytes/row, low nibble = pixel gauche. Window 8×2 → 512 bytes.
 *  Permet d'appliquer les `CpuCopy32` du décomp (offsets +256 / +20) à l'identique
 *  vers l'OBJ VRAM (qui est lui aussi 4bpp tile-packed). */
function _windowTextDataTo4bpp(winId: number): Uint8Array {
  const widthTiles = sHealthboxWindowTemplate.width;
  const heightTiles = sHealthboxWindowTemplate.height;
  const widthPx = widthTiles * 8;
  const out = new Uint8Array(widthTiles * heightTiles * TILE_BYTES);
  const pb = GetWindowPixelBuffer(winId);
  if (!pb) return out;
  for (let ty = 0; ty < heightTiles; ty++) {
    for (let tx = 0; tx < widthTiles; tx++) {
      const tileBase = (ty * widthTiles + tx) * TILE_BYTES;
      for (let row = 0; row < 8; row++) {
        const srcRow = (ty * 8 + row) * widthPx + tx * 8;
        for (let pc = 0; pc < 4; pc++) {
          const px1 = pb[srcRow + pc * 2] & 0xF;
          const px2 = pb[srcRow + pc * 2 + 1] & 0xF;
          out[tileBase + row * 4 + pc] = px1 | (px2 << 4);
        }
      }
    }
  }
  return out;
}

/** 1:1 décomp `TextIntoHealthboxObject` (battle_interface.c:2585-2598).
 *  Copie le bottom tile-row (windowData @ src+256) → dest+256 (windowWidth tiles),
 *  puis pour chaque tile du top-row, 12 bytes @ +20 → dest+20 (dé-interleave qui
 *  évite de copier les 4 lignes de pixels vides du haut du sHealthboxWindowTemplate). */
function _textIntoHealthboxObject(destOff: number, windowData: Uint8Array, srcOff: number, windowWidth: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const vram = rt.gba.objVram;
  vram.set(windowData.subarray(srcOff + 256, srcOff + 256 + windowWidth * TILE_BYTES), destOff + 256);
  for (let i = 0; i < windowWidth; i++) {
    vram.set(windowData.subarray(srcOff + i * 32 + 20, srcOff + i * 32 + 32), destOff + i * 32 + 20);
  }
}

/** 1:1 décomp `HpTextIntoHealthboxObject` (battle_interface.c:2580-2583).
 *  Copie SEULEMENT le bottom tile-row (windowData @ src+256) → dest (pas de +256). */
function _hpTextIntoHealthboxObject(destOff: number, windowData: Uint8Array, srcOff: number, windowWidth: number): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.gba.objVram.set(windowData.subarray(srcOff + 256, srcOff + 256 + windowWidth * TILE_BYTES), destOff);
}

/** 1:1 décomp `ConvertIntToDecimalStringN(buf, n, STR_CONV_MODE_RIGHT_ALIGN, width)`
 *  côté chaîne : nombre right-aligned padé d'espaces à `width`. */
function _convIntRightAlign(num: number, width: number): string {
  return String(Math.max(0, Math.min(num, 999))).padStart(width, ' ');
}

/** 1:1 décomp `UpdateLvlInHealthbox` (battle_interface.c:1105-1137).
 *
 *  Rend "{LV_2}NN" (= glyphe niveau "N." FR + chiffres left-align) via la police,
 *  puis copie 3 tiles dans le sprite OAM healthbox.
 *
 *  Offsets décomp (relative à spriteTileNum) : player += 0x820, opp += 0x400 (single).
 *  Notre layout : spriteTileNum = HEALTHBOX_*_VRAM (tileNum * 32). */
export function updateHealthboxLevel(handle: HealthboxHandle, level: number): void {
  // 1:1 décomp ll.1113-1117 : text = CHAR_EXTRA_SYMBOL + CHAR_LV_2 + left-align(lvl,3).
  // {LV_2} encode CHAR_EXTRA_SYMBOL(0xF9)+0x05 = le glyphe niveau "N." du décomp FR.
  const lvStr = String(Math.max(0, Math.min(level, 999)));
  const text = `{LV_2}${lvStr}`;
  const xPos = 5 * (3 - lvStr.length);  // 1:1 décomp l.1117.
  const winId = _addTextPrinterAndCreateWindowOnHealthbox(text, xPos, 3, 2);
  const windowData = _windowTextDataTo4bpp(winId);
  // 1:1 décomp ll.1122-1134 : player += 0x820, opp += 0x400.
  const destOff = handle.side === 'player'
    ? HEALTHBOX_PLAYER_VRAM + 0x820
    : HEALTHBOX_OPPONENT_VRAM + 0x400;
  _textIntoHealthboxObject(destOff, windowData, 0, 3);
  RemoveWindow(winId);
}

/** 1:1 décomp `UpdateHpTextInHealthbox` (battle_interface.c:1139-1172) player single.
 *
 *  Display "currHp/maxHp" (= 7 chars max : "999/999") dans le sprite OAM healthbox.
 *  Opp single n'affiche PAS de HP digits (= juste la bar + status).
 *
 *  Offsets décomp player single :
 *    - HP current (3 digits) : split
 *      · 1 tile à spriteTileNum + 0x3E0 (= byte 0x3E0)
 *      · 2 tiles à spriteTileNum + 0xB00 (= byte 0xB00 + 0x20)
 *    - HP max (3 digits) : 2 tiles à spriteTileNum + 0xB40 */
// ─── Status icons : D4 1:1 décomp UpdateStatusIconInHealthbox ───────────────

/** 1:1 décomp `UpdateStatusIconInHealthbox` (battle_interface.c:1993-2072).
 *
 *  Affiche l'icone de status (= 3 tiles 8×8 horizontaux) sur le sprite OAM
 *  healthbox. Tile data depuis status.png arrangé en 5 types × 3 tiles each :
 *    - PSN : tiles 0..2
 *    - PRZ : tiles 3..5
 *    - SLP : tiles 6..8
 *    - FRZ : tiles 9..11
 *    - BRN : tiles 12..14
 *
 *  Tile offsets dans le sprite OAM (= 1:1 décomp ll. 2007-2015) :
 *    - Player single : tileNumAdder = 0x1A (= tile 26 = byte 0x340 from healthbox left)
 *    - Opp single    : tileNumAdder = 0x11 (= tile 17 = byte 0x220 from healthbox left)
 *
 *  Si status null/none : copy `HEALTHBOX_GFX_39` (= blank tile) à la même position
 *  pour effacer l'icone précédent. */
export function updateHealthboxStatus(handle: HealthboxHandle, status: string | null | undefined): void {
  const rt = getRuntime();
  if (!rt || !_statusTiles) return;

  // 1:1 décomp ll. 2007-2015 : tile offsets différents par side.
  const baseVram = handle.side === 'player' ? HEALTHBOX_PLAYER_VRAM : HEALTHBOX_OPPONENT_VRAM;
  const tileNumAdder = handle.side === 'player' ? 0x1A : 0x11;
  const destVram = baseVram + tileNumAdder * TILE_BYTES;

  // 1:1 décomp ll. 2018-2055 : status → tile offset dans status.png.
  // Notre PokemonInstance.status format : 'PSN' | 'PAR' | 'BRN' | 'SLP' | 'FRZ' | 'TOX'
  // (TOX = STATUS1_PSN_ANY = same icon PSN).
  let statusTileStart: number;
  // 1:1 décomp `sStatusIconColors[]` (battle_interface.c:751-757) : couleur RGB555
  // appliquée à l'entrée palette de l'icône status via FillPalette (cf. plus bas).
  let statusPalColor: number;
  switch (status) {
    case 'PSN': case 'TOX': statusTileStart = 0;  statusPalColor = _rgb555(24, 12, 24); break; // PSN
    case 'PAR':             statusTileStart = 3;  statusPalColor = _rgb555(23, 23, 3);  break; // PRZ
    case 'SLP':             statusTileStart = 6;  statusPalColor = _rgb555(20, 20, 17); break; // SLP
    case 'FRZ':             statusTileStart = 9;  statusPalColor = _rgb555(17, 22, 28); break; // FRZ
    case 'BRN':             statusTileStart = 12; statusPalColor = _rgb555(28, 14, 10); break; // BRN
    default: {
      // 1:1 décomp ll. 2043-2048 : no status → copie HEALTHBOX_GFX_39 (= misc.4bpp
      // tile 3) sur les 3 tiles de l'emplacement de l'icône status. GFX_39 =
      // "blank health window" = tout index 2 = FOND du groove (cream), PAS un tile
      // transparent. L'emplacement status (tileNumAdder 0x11 côté opp) chevauche la
      // rangée groove de la box (tile-row 2, tiles 17..19 du sprite box-left) : avec
      // des zéros (ancien bug), ces tiles devenaient transparentes → aux rangées
      // transparentes haut/bas de la barre HP on voyait le BG combat (vert) au lieu
      // du cream du groove (user-flag 2026-05-30 "vert au lieu de cream, ultra subtil").
      if (!_miscTiles) return;
      const blankWindowTile = _miscTiles.subarray(3 * TILE_BYTES, 4 * TILE_BYTES); // = HEALTHBOX_GFX_39
      for (let i = 0; i < 3; i++) {
        rt.gba.objVram.set(blankWindowTile, destVram + i * TILE_BYTES);
      }
      return;
    }
  }

  // 1:1 décomp ll. 2057-2062 : la couleur de l'icône status est appliquée via
  // FillPalette sur l'entrée OBJ palette slot 5 index (12 + battler). Le gfx
  // status.4bpp utilise l'index LOCAL 12 (cf. _loadMultiSubPalTiles : raw {2,3,12}).
  // Sans ce fill, l'icône rend avec l'index 12 = placeholder BLEU de la palette
  // healthbox → "BRU bleu" (user 2026-05-30). Décomp = pltAdder = paletteNum*16 +
  // battler + 12 → index 12 (player) / 13 (opponent), SÉPARÉS pour permettre 2
  // status simultanés de couleurs différentes. Côté adverse on remap donc le gfx
  // 12→13 pour matcher l'entrée 13 (sinon il lirait l'entrée 12 = couleur joueur).
  const battlerIndex = handle.side === 'player' ? 0 : 1;
  const palColorIndex = 12 + battlerIndex;  // index LOCAL dans slot 5 (12 player / 13 opp)

  let tileData: Uint8Array = _statusTiles.subarray(
    statusTileStart * TILE_BYTES, (statusTileStart + 3) * TILE_BYTES,
  );
  if (palColorIndex !== 12) {
    const remapped = new Uint8Array(tileData);
    for (let i = 0; i < remapped.length; i++) {
      let lo = remapped[i] & 0xF;
      let hi = (remapped[i] >> 4) & 0xF;
      if (lo === 12) lo = palColorIndex;
      if (hi === 12) hi = palColorIndex;
      remapped[i] = lo | (hi << 4);
    }
    tileData = remapped;
  }
  // Copy 3 tiles consécutifs (= 96 bytes = 3 × 32) à OBJ VRAM.
  rt.gba.objVram.set(tileData, destVram);

  // FillPalette (= 1:1 décomp FillPalette + CpuCopy16 sur OBJ_PLTT) : 1 couleur.
  // 1:1 décomp FillPalette : écrit le buffer FADED (→ TransferPlttBuffer) à l'index OBJ du slot
  // healthbox + palColorIndex. Faded (pas live-direct) sinon le flush du modèle bufferisé
  // écraserait la couleur de statut par la palette de base.
  const _statusIdx = 0x100 + HEALTHBOX_PALETTE_SLOT * 16 + palColorIndex;
  rt.gPlttBufferFaded.set(_statusIdx, statusPalColor);
  rt.gPlttBufferUnfaded.set(_statusIdx, statusPalColor);
}

// ─── EXP bar : D5 1:1 décomp MoveBattleBarGraphically EXP_BAR ───────────────

/** 1:1 décomp `MoveBattleBarGraphically` EXP_BAR case (battle_interface.c:2309-2330).
 *
 *  Update les 8 fill tiles de l'EXP bar widget à OBJ VRAM. Player single uniquement.
 *
 *  Tile offsets décomp :
 *    - i=0..3 : tile slots [tileNum+0x24..tileNum+0x27] (= bytes 0x480..0x500)
 *    - i=4..7 : tile slots [tileNum+0x60..tileNum+0x63] (= bytes 0xC00..0xC80)
 *
 *  Si `level == MAX_LEVEL` (= 100), tous les array[i] sont mis à 0 (= bar vide).
 *
 *  `B_EXPBAR_PIXELS = 64` (= 8 tiles × 8 pixels), scale = 8 tiles. */
export function updateHealthboxExpBar(
  handle: HealthboxHandle,
  currExp: number,
  nextLevelExp: number,
  level: number,
): void {
  if (handle.side !== 'player') return;  // Opp single doesn't have EXP bar
  if (!_expBarTiles) return;
  const rt = getRuntime();
  if (!rt) return;

  // 1:1 décomp ll. 2316-2320 : si MAX_LEVEL, all zeros (= bar vide).
  let array: number[];
  if (level >= 100) {
    array = new Array(8).fill(0);
  } else {
    // 1:1 décomp ll. 2310-2314 : CalcBarFilledPixels with scale=8 (B_EXPBAR_PIXELS/8).
    const { array: arr } = _calcBarFilledPixels(currExp, Math.max(1, nextLevelExp), 8);
    array = arr;
  }

  // 1:1 décomp ll. 2321-2329 : write 8 fill tiles à OBJ VRAM.
  // Tile slots player healthbox left sprite (tileNum=0) :
  //   - i=0..3 : (0 + 0x24 + i) * 32 = bytes 0x480, 0x4A0, 0x4C0, 0x4E0
  //   - i=4..7 : 0xB80 + (i + 0) * 32 = bytes 0xC80, 0xCA0, 0xCC0, 0xCE0
  //     WAIT recalc: 0xB80 + i * 32 for i=4..7 = 0xC00, 0xC20, 0xC40, 0xC60
  // Recalc: i=4 → OBJ_VRAM0 + 0xB80 + (4 + 0) * 32 = 0xB80 + 0x80 = 0xC00
  //         i=5 → 0xB80 + 5*32 = 0xC20
  //         i=6 → 0xC40
  //         i=7 → 0xC60
  const baseVram = HEALTHBOX_PLAYER_VRAM;
  for (let i = 0; i < 8; i++) {
    const pixels = array[i];
    const srcOffset = pixels * TILE_BYTES;
    const destOffset = i < 4
      ? baseVram + (0x24 + i) * TILE_BYTES
      : baseVram + 0xB80 + i * TILE_BYTES;
    rt.gba.objVram.set(
      _expBarTiles.subarray(srcOffset, srcOffset + TILE_BYTES),
      destOffset,
    );
  }
}

/** 1:1 décomp `UpdateHpTextInHealthbox` (battle_interface.c:1139-1172) player single.
 *  Rend "cur/max" via la police (RIGHT_ALIGN 3 + CHAR_SLASH) puis copie dans l'OBJ
 *  VRAM. Opp single n'affiche PAS le PV numérique (= juste bar + status). */
export function updateHealthboxHpDigits(handle: HealthboxHandle, currHp: number, maxHp: number): void {
  if (handle.side !== 'player') return;  // 1:1 décomp l.1146 : player single only.
  const baseVram = HEALTHBOX_PLAYER_VRAM;
  // ── HP courant : 1:1 décomp ll.1158-1170 (RIGHT_ALIGN 3 + CHAR_SLASH, x=4). ──
  {
    const text = `${_convIntRightAlign(currHp, 3)}/`;
    const winId = _addTextPrinterAndCreateWindowOnHealthbox(text, 4, 5, 2);
    const windowData = _windowTextDataTo4bpp(winId);
    _hpTextIntoHealthboxObject(baseVram + 0x3E0, windowData, 0, 1);     // 1 tile @ 0x3E0
    _hpTextIntoHealthboxObject(baseVram + 0xB00, windowData, 0x20, 2);  // 2 tiles @ 0xB00 (windowData+0x20)
    RemoveWindow(winId);
  }
  // ── HP max : 1:1 décomp ll.1149-1156 (RIGHT_ALIGN 3, x=0). ──
  {
    const text = _convIntRightAlign(maxHp, 3);
    const winId = _addTextPrinterAndCreateWindowOnHealthbox(text, 0, 5, 2);
    const windowData = _windowTextDataTo4bpp(winId);
    _hpTextIntoHealthboxObject(baseVram + 0xB40, windowData, 0, 2);     // 2 tiles @ 0xB40
    RemoveWindow(winId);
  }
}

/** 1:1 décomp `UpdateHealthboxAttribute` branche nickname (battle_interface.c:1910-1968).
 *  Rend "{HIGHLIGHT 2}<nick><gender>" via la police puis copie dans l'OBJ VRAM.
 *  - gender 0 (MON_MALE) → "{COLOR 11}♂" (bleu) ; 254 (MON_FEMALE) → "{COLOR 10}♀"
 *    (rose) ; sinon (genderless / Nidoran ambigu = 100) → "{COLOR 11}" sans symbole.
 *  - player single : 6 tiles @ 0x40 + 1 tile @ 0x800 (windowData+0xC0).
 *  - opponent single : 7 tiles @ 0x20. */
export function updateHealthboxNick(handle: HealthboxHandle, nickname: string, gender: number): void {
  let genderSuffix: string;
  if (gender === 0) genderSuffix = '{COLOR DYNAMIC_COLOR_2}♂';        // MON_MALE → idx 11 (bleu)
  else if (gender === 254) genderSuffix = '{COLOR DYNAMIC_COLOR_1}♀'; // MON_FEMALE → idx 10 (rose)
  else genderSuffix = '{COLOR DYNAMIC_COLOR_2}';                      // None / genderless
  const str = `{HIGHLIGHT DARK_GRAY}${nickname}${genderSuffix}`;
  const winId = _addTextPrinterAndCreateWindowOnHealthbox(str, 0, 3, 2);
  const windowData = _windowTextDataTo4bpp(winId);
  if (handle.side === 'player') {
    // 1:1 décomp ll.1954-1960 : player single (6 tiles @ 0x40 + 1 tile @ 0x800).
    _textIntoHealthboxObject(HEALTHBOX_PLAYER_VRAM + 0x40, windowData, 0, 6);
    _textIntoHealthboxObject(HEALTHBOX_PLAYER_VRAM + 0x800, windowData, 0xC0, 1);
  } else {
    // 1:1 décomp l.1964 : opponent single (7 tiles @ 0x20).
    _textIntoHealthboxObject(HEALTHBOX_OPPONENT_VRAM + 0x20, windowData, 0, 7);
  }
  RemoveWindow(winId);
}
