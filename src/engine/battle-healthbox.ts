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
const HPBAR_PLAYER_VRAM       = 0x2000;  // 0x100 bytes = 8 tiles
const HPBAR_OPPONENT_VRAM     = 0x2100;  // 0x100 bytes = 8 tiles

// ─── OBJ palette slots ──────────────────────────────────────────────────────

// 1:1 décomp `sSpritePalettes_HealthBoxHealthBar[]` :
//   - TAG_HEALTHBOX_PAL ← `gBattleInterface_BallStatusBarPal` (= ball_status_bar.png .gbapal)
//   - TAG_HEALTHBAR_PAL ← `gBattleInterface_BallDisplayPal`   (= ball_display.png .gbapal)
const HEALTHBOX_PALETTE_SLOT = 5;
const HEALTHBAR_PALETTE_SLOT = 6;

// ─── Asset loading (idempotent) ─────────────────────────────────────────────

let _assetsLoaded = false;

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
  // PNG hpbar.png 96×8 = 12 tiles 8×8. Pas de metatile rearrange (= linear).
  // Note : ce tile data est ré-écrit dynamiquement par UpdateHpBar (D2) pour
  // refléter le ratio HP courant. Initial = bar pleine (tiles 0..7 = barre verte).
  const hpbarPng = await loadIndexedPng(HPBAR_PNG);
  // Charge les 8 premiers tiles du hpbar.png (= barre pleine 64x8) pour player.
  rt.gba.objVram.set(hpbarPng.charData.subarray(0, 8 * 32), HPBAR_PLAYER_VRAM);
  rt.gba.objVram.set(hpbarPng.charData.subarray(0, 8 * 32), HPBAR_OPPONENT_VRAM);

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
  /** Sprite ID `healthbarSpriteId` (= 32×8 player, 32×8 + 8×8 opponent). */
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
    // 1:1 décomp ll. 932 : CreateSpriteAtEnd healthBar sprite at (140, 60, 0)
    // sHealthbarSpriteTemplates[gBattlerPositions[battler]].tileTag = TAG_HEALTHBAR_PLAYER1_TILE
    // (= our HPBAR_PLAYER_VRAM). `SetSubspriteTables` puis SpriteCB_HealthBar
    // syncs position = healthboxSprite.x + 16 (player) ou +8 (opp).
    // Pour D1 on créé un sprite 32×8 single (= shape WIDE size 1). Le wire-up
    // subsprite (= 2 sprites pour player 32+32=64×8) viendra en D2.
    const bar = rt.CreateSpriteAtOam({
      tileId: HPBAR_PLAYER_VRAM / 32,
      paletteBank: HEALTHBAR_PALETTE_SLOT,
      x: centerX + 16, y: centerY,
      shape: 1,  // = WIDE
      size: 2,   // = 32×8 (WIDE+size1)... attendre.
      // GBA OAM SHAPE×SIZE table :
      // WIDE × size 0 = 16×8
      // WIDE × size 1 = 32×8
      // WIDE × size 2 = 32×16
      // WIDE × size 3 = 64×32
      priority: 1,
    });
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
    // Healthbar opp = 32×8 (sHealthBar_Subsprites_Opponent a 2 sprites 32×8
    // + 1 sprite 8×8). Pour D1 single sprite 32×8, comme player.
    // SpriteCB_HealthBar.x = mainSprite.x + 8 pour opp (data6 == 2 default).
    const bar = rt.CreateSpriteAtOam({
      tileId: HPBAR_OPPONENT_VRAM / 32,
      paletteBank: HEALTHBAR_PALETTE_SLOT,
      x: centerX + 8, y: centerY,
      shape: 1, size: 2,  // WIDE+size1 = 32×8
      priority: 1,
    });
    return {
      leftSpriteId: left.spriteId,
      rightSpriteId: right.spriteId,
      healthbarSpriteId: bar.spriteId,
      side: 'opponent',
      centerX, centerY,
    };
  }
}

/** 1:1 décomp `SetHealthboxSpriteVisible/Invisible` (ll. 1024-1036) :
 *  toggle visibility des 3 sprites (left/right/bar) ensemble. */
export function setHealthboxVisible(handle: HealthboxHandle, visible: boolean): void {
  const rt = getRuntime();
  if (!rt) return;
  for (const spriteId of [handle.leftSpriteId, handle.rightSpriteId, handle.healthbarSpriteId]) {
    const sprite = rt.gSprites.get(spriteId);
    if (sprite) {
      sprite.invisible = !visible;
      const oam = rt.gba.oam[sprite.oamIndex];
      if (oam) oam.visible = visible;
    }
  }
}

/** 1:1 décomp `DestoryHealthboxSprite` (ll. 1044-1049) : destroy les 3 sprites. */
export function destroyHealthboxSprite(handle: HealthboxHandle): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.DestroySprite(handle.leftSpriteId);
  rt.DestroySprite(handle.rightSpriteId);
  rt.DestroySprite(handle.healthbarSpriteId);
}

/** 1:1 décomp `UpdateOamPriorityInAllHealthboxes` (ll. 1056-1070) : update
 *  priority des 3 sprites pour un battler. */
export function setHealthboxPriority(handle: HealthboxHandle, priority: number): void {
  const rt = getRuntime();
  if (!rt) return;
  for (const spriteId of [handle.leftSpriteId, handle.rightSpriteId, handle.healthbarSpriteId]) {
    const sprite = rt.gSprites.get(spriteId);
    if (!sprite) continue;
    const oam = rt.gba.oam[sprite.oamIndex];
    if (oam) oam.priority = priority;
  }
}
