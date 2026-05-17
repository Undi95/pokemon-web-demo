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

import { getRuntime } from './decomp-globals';
import { loadIndexedPng } from './gba/png-loader';

// ─── Asset paths ────────────────────────────────────────────────────────────

const HEALTHBOX_PLAYER_PNG   = '/decomp/em/battle_interface/healthbox_singles_player.png';
const HEALTHBOX_OPPONENT_PNG = '/decomp/em/battle_interface/healthbox_singles_opponent.png';
const HPBAR_PNG              = '/decomp/em/battle_interface/hpbar.png';
const HPBAR_ANIM_PNG         = '/decomp/em/battle_interface/hpbar_anim.png';   // YELLOW + RED tile sets
const NUMBERS1_PNG           = '/decomp/em/battle_interface/numbers1.png';     // 11 tiles : [blank, 0..9]
const NUMBERS2_PNG           = '/decomp/em/battle_interface/numbers2.png';     // 12 tiles : [0..9, blank, slash/Lv]
const BALL_STATUS_BAR_PNG    = '/decomp/em/battle_interface/ball_status_bar.png';  // = palette HEALTHBOX
const BALL_DISPLAY_PNG       = '/decomp/em/battle_interface/ball_display.png';     // = palette HEALTHBAR

// ─── VRAM byte offsets (= OBJ VRAM, allocations pour healthbox tile data) ───

// Ces offsets correspondent à un LoadCompressedSpriteSheet style allocation
// dans notre runtime. Cohérent avec le layout existant :
//   - ball throw : tiles à 0x4000 (= tileId 512)
//   - player sprite : généralement OBJ VRAM "tiles dynamiques" allocated par notre
//     runtime au load. On choisit des offsets fixes qui n'entrent pas en conflit.
const HEALTHBOX_PLAYER_VRAM   = 0x0000;  // 0x1000 bytes = 128 tiles
const HEALTHBOX_OPPONENT_VRAM = 0x1000;  // 0x1000 bytes alloc (= 128 tiles, 64 used)
// 1:1 décomp : sSpriteSheets_HealthBar[player] alloc 0x100 bytes = 8 tiles.
// On utilise 8 tiles consécutifs pour 2 sprites adjacents 32×8 = 64×8 total bar.
// Layout : tiles 0..3 = bar left half (sub0), tiles 4..7 = bar right half (sub1).
// Update HP bar copy 6 fill tiles à offset tileNum+2..tileNum+7 (= 1:1 décomp).
const HPBAR_PLAYER_LEFT_VRAM   = 0x2000;  // 4 tiles
const HPBAR_PLAYER_RIGHT_VRAM  = 0x2080;  // 4 tiles (= continuous from LEFT)
const HPBAR_OPP_LEFT_VRAM      = 0x2100;  // 4 tiles
const HPBAR_OPP_RIGHT_VRAM     = 0x2180;  // 4 tiles

// ─── OBJ palette slots ──────────────────────────────────────────────────────

// 1:1 décomp `sSpritePalettes_HealthBoxHealthBar[]` :
//   - TAG_HEALTHBOX_PAL ← `gBattleInterface_BallStatusBarPal` (= ball_status_bar.png .gbapal)
//   - TAG_HEALTHBAR_PAL ← `gBattleInterface_BallDisplayPal`   (= ball_display.png .gbapal)
const HEALTHBOX_PALETTE_SLOT = 5;
const HEALTHBAR_PALETTE_SLOT = 6;

// ─── Asset loading (idempotent) ─────────────────────────────────────────────

let _assetsLoaded = false;

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
  if (_assetsLoaded) return;
  const rt = getRuntime();
  if (!rt) return;

  // ─── Player healthbox tile data ─────────────────────────────────────────
  // PNG 64×128 = 8w × 16t tiles. `-mwidth 8 -mheight 8` → 2 metatiles 8×8.
  // Comme metaW (8) === widthTiles (8), row-major == metatile order, no-op.
  const playerPng = await loadIndexedPng(HEALTHBOX_PLAYER_PNG);
  const playerTiles = _rearrangeToMetatileOrder(
    playerPng.charData, playerPng.widthTiles, playerPng.heightTiles, 8, 8,
  );
  await rt.LoadCompressedSpriteSheet(HEALTHBOX_PLAYER_PNG, HEALTHBOX_PLAYER_VRAM);
  // Note : LoadCompressedSpriteSheet écrit row-major. Pour player, c'est OK
  // (metaW === widthTiles). Mais on a écrit `playerTiles` (= identique
  // mathématiquement). On garde l'appel LoadCompressedSpriteSheet pour
  // bénéficier de la palette extraction.
  // Re-écrire avec notre rearranged dans le cas où le runtime fait du metadata
  // différemment :
  rt.gba.objVram.set(playerTiles, HEALTHBOX_PLAYER_VRAM);

  // ─── Opponent healthbox tile data ───────────────────────────────────────
  // PNG 128×32 = 16w × 4t tiles. `-mwidth 8 -mheight 4` → 2 metatiles 8×4
  // arrangés horizontalement (16 cols / 8 = 2 metatile cols).
  // metaW (8) !== widthTiles (16), donc on DOIT transposer.
  const oppPng = await loadIndexedPng(HEALTHBOX_OPPONENT_PNG);
  const oppTiles = _rearrangeToMetatileOrder(
    oppPng.charData, oppPng.widthTiles, oppPng.heightTiles, 8, 4,
  );
  rt.gba.objVram.set(oppTiles, HEALTHBOX_OPPONENT_VRAM);

  // ─── HP bar widget tile data ────────────────────────────────────────────
  // 1:1 décomp `gHealthboxElementsGfxTable[]` (graphics.c:358) concatène
  // plusieurs .4bpp files. Nous cachons les sous-blocs :
  //   - hpbar.png tiles 0..2     = "black bg" + "H" + "P" labels (= 3 tiles)
  //   - hpbar.png tiles 3..11    = GREEN bar 0..8 pixels remplis (= 9 tiles)
  //   - hpbar_anim.png tiles 0..8 = YELLOW bar 0..8 pixels (= 9 tiles)
  //   - hpbar_anim.png tiles 9..17 = RED bar 0..8 pixels (= 9 tiles)
  const hpbarPng = await loadIndexedPng(HPBAR_PNG);
  const hpbarAnimPng = await loadIndexedPng(HPBAR_ANIM_PNG);
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

  // ─── Numbers tile sets (= digits 0..9 pour Lv + HP display) ─────────────
  // 1:1 décomp graphics_file_rules.mk:90-91 :
  //   numbers1.4bpp = digits player (white)
  //   numbers2.4bpp = digits opp (yellow/contrast)
  const numbers1Png = await loadIndexedPng(NUMBERS1_PNG);
  const numbers2Png = await loadIndexedPng(NUMBERS2_PNG);
  _numbers1Tiles = numbers1Png.charData;  // 11 tiles
  _numbers2Tiles = numbers2Png.charData;  // 12 tiles

  // ─── Palettes ───────────────────────────────────────────────────────────
  // HEALTHBOX palette = ball_status_bar.png .gbapal
  const ballStatusBarPng = await loadIndexedPng(BALL_STATUS_BAR_PNG);
  rt.LoadPaletteObj(ballStatusBarPng.palette, 0x100 + HEALTHBOX_PALETTE_SLOT * 16);

  // HEALTHBAR palette = ball_display.png .gbapal
  const ballDisplayPng = await loadIndexedPng(BALL_DISPLAY_PNG);
  rt.LoadPaletteObj(ballDisplayPng.palette, 0x100 + HEALTHBAR_PALETTE_SLOT * 16);

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
  /** Sprite ID `healthbarLeftSpriteId` (= 32×8 sub-sprite gauche du bar widget).
   *  1:1 décomp `sHealthBar_Subsprites_*[0]` = tiles 0..3. */
  healthbarLeftSpriteId: number;
  /** Sprite ID `healthbarRightSpriteId` (= 32×8 sub-sprite droite du bar widget).
   *  1:1 décomp `sHealthBar_Subsprites_*[1]` = tiles 4..7. */
  healthbarRightSpriteId: number;
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

  if (side === 'player') {
    // 1:1 décomp ll. 880-887 player single :
    //   left  = CreateSprite(template[0], (DISPLAY_WIDTH=240, DISPLAY_HEIGHT=160), priority=1)
    //   right = CreateSpriteAtEnd(template[0], 240, 160, priority=1)
    //   left.shape  = ST_OAM_SQUARE (= override WIDE→SQUARE, keep size 3 → 64×64)
    //   right.shape = ST_OAM_SQUARE
    //   right.tileNum += 64
    //
    // Notre runtime CreateSpriteAtOam fait CalcCenterToCornerVec → l'oam.x
    // sera décalé de -32 par rapport à sprite.x (= center → top-left).
    // Position initiale décomp = (240, 160) puis UpdateSpritePos déplace à
    // (158, 88) plus tard. On créé directement à (158, 88).
    const centerX = 158;
    const centerY = 88;
    const left = rt.CreateSpriteAtOam({
      tileId: HEALTHBOX_PLAYER_VRAM / 32,
      paletteBank: HEALTHBOX_PALETTE_SLOT,
      x: centerX, y: centerY,
      shape: 0,  // = SQUARE (override SHAPE_WIDE du template)
      size: 3,   // = size 3 (SQUARE+size3 = 64×64)
      priority: 1,
    });
    const right = rt.CreateSpriteAtOam({
      tileId: HEALTHBOX_PLAYER_VRAM / 32 + 64,  // tileNum += 64 (= second 64x64 metatile)
      paletteBank: HEALTHBOX_PALETTE_SLOT,
      // `SpriteCB_HealthBoxOther` → sprite.x = leftSprite.x + 64. Donc oam.x
      // top-left = (158+64) - 32 = 190. On positionne directement.
      x: centerX + 64, y: centerY,
      shape: 0, size: 3,
      priority: 1,
    });
    // 1:1 décomp ll. 932 + `sHealthBar_Subsprites_Player[]` = 2 subsprites
    // 32×8 adjacents formant 64×8 total bar. Pour notre port, on crée 2 sprites
    // séparés au lieu de subsprite (= simpler, runtime sync manuel via setHealthboxPosition).
    //   - left sprite  : tiles 0..3 du bar VRAM (= "H/P" labels + first 2 fill tiles)
    //   - right sprite : tiles 4..7 du bar VRAM (= last 4 fill tiles)
    // Position décomp `SpriteCB_HealthBar` player : sprite.x = healthboxLeft.x + 16.
    const barLeft = rt.CreateSpriteAtOam({
      tileId: HPBAR_PLAYER_LEFT_VRAM / 32,
      paletteBank: HEALTHBAR_PALETTE_SLOT,
      x: centerX + 16, y: centerY,
      shape: 1, size: 1,  // WIDE+size1 = 32×8 = 4 tiles
      priority: 1,
    });
    const barRight = rt.CreateSpriteAtOam({
      tileId: HPBAR_PLAYER_LEFT_VRAM / 32 + 4,  // continuous tile range
      paletteBank: HEALTHBAR_PALETTE_SLOT,
      x: centerX + 16 + 32, y: centerY,  // 32 px à droite du sprite gauche
      shape: 1, size: 1,
      priority: 1,
    });
    return {
      leftSpriteId: left.spriteId,
      rightSpriteId: right.spriteId,
      healthbarLeftSpriteId: barLeft.spriteId,
      healthbarRightSpriteId: barRight.spriteId,
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
    // Healthbar opp = `sHealthBar_Subsprites_Opponent[]` = 2 subsprites 32×8 + 1 sprite 8×8
    // décomp (= 8 + 1 px séparé pour le frame end). Pour D2 on simplifie à 2 sprites 32×8
    // adjacents (= 64×8). Le frame end +8px viendra peut-être en polish ultérieur.
    // SpriteCB_HealthBar.x = mainSprite.x + 8 pour opp (data6 == 2 default).
    const barLeft = rt.CreateSpriteAtOam({
      tileId: HPBAR_OPP_LEFT_VRAM / 32,
      paletteBank: HEALTHBAR_PALETTE_SLOT,
      x: centerX + 8, y: centerY,
      shape: 1, size: 1,  // WIDE+size1 = 32×8
      priority: 1,
    });
    const barRight = rt.CreateSpriteAtOam({
      tileId: HPBAR_OPP_LEFT_VRAM / 32 + 4,
      paletteBank: HEALTHBAR_PALETTE_SLOT,
      x: centerX + 8 + 32, y: centerY,
      shape: 1, size: 1,
      priority: 1,
    });
    return {
      leftSpriteId: left.spriteId,
      rightSpriteId: right.spriteId,
      healthbarLeftSpriteId: barLeft.spriteId,
      healthbarRightSpriteId: barRight.spriteId,
      side: 'opponent',
      centerX, centerY,
    };
  }
}

/** Tous les sprite IDs d'un healthbox handle (4 sprites = left/right/barLeft/barRight). */
function _allSpriteIds(handle: HealthboxHandle): number[] {
  return [
    handle.leftSpriteId,
    handle.rightSpriteId,
    handle.healthbarLeftSpriteId,
    handle.healthbarRightSpriteId,
  ];
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

/** 1:1 décomp `DestoryHealthboxSprite` (ll. 1044-1049) : destroy tous les sprites. */
export function destroyHealthboxSprite(handle: HealthboxHandle): void {
  const rt = getRuntime();
  if (!rt) return;
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

/** 1:1 décomp `UpdateLvlInHealthbox` (battle_interface.c:1105-1137).
 *
 *  Display "Lv NN" (= up to 3 digits 0..100) dans le sprite OAM healthbox.
 *
 *  Offsets décomp (= relative à sprite tile data byte start) :
 *    - Player single : objVram += spriteTileNum + 0x820  (= byte 0x820 from healthbox left)
 *    - Opp single    : objVram += spriteTileNum + 0x400  (= byte 0x400 from healthbox left)
 *
 *  Notre layout : healthbox left sprite tileNum = HEALTHBOX_PLAYER_VRAM/32 = 0.
 *  Donc objVram absolu = HEALTHBOX_PLAYER_VRAM + 0x820 = byte 0x820 in OBJ VRAM.
 *  3 tiles consécutifs (= 3 digits max). */
export function updateHealthboxLevel(handle: HealthboxHandle, level: number): void {
  if (!_numbers1Tiles) return;
  const digits = _digitsToNumbers1Tiles(level, 3);
  if (handle.side === 'player') {
    // 1:1 décomp ll. 1126 : objVram += spriteTileNum + 0x820
    _writeTilesToVram(HEALTHBOX_PLAYER_VRAM + 0x820, digits, _numbers1Tiles);
  } else {
    // 1:1 décomp ll. 1133 : objVram += spriteTileNum + 0x400
    _writeTilesToVram(HEALTHBOX_OPPONENT_VRAM + 0x400, digits, _numbers1Tiles);
  }
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
export function updateHealthboxHpDigits(handle: HealthboxHandle, currHp: number, maxHp: number): void {
  if (handle.side !== 'player') return;  // Opp single doesn't display HP digits
  if (!_numbers1Tiles) return;
  const currDigits = _digitsToNumbers1Tiles(currHp, 3);
  const maxDigits  = _digitsToNumbers1Tiles(maxHp, 3);
  // HP current split : 1 tile @ 0x3E0 + 2 tiles @ 0xB00.
  // 1:1 décomp split for visual reasons (= the 3 digits span 2 sprite tile rows
  // due to the HP bar position between them).
  _writeTilesToVram(HEALTHBOX_PLAYER_VRAM + 0x3E0, [currDigits[0]], _numbers1Tiles);
  _writeTilesToVram(HEALTHBOX_PLAYER_VRAM + 0xB00, currDigits.slice(1), _numbers1Tiles);
  // HP max : 2 tiles (= dropping the leading digit for visual fit, decomp does
  // same with `windowTileData + 0x20` offset which skips first 32-byte chunk).
  _writeTilesToVram(HEALTHBOX_PLAYER_VRAM + 0xB40, maxDigits.slice(1), _numbers1Tiles);
}
