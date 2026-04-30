/**
 * Charge un sprite OAM du décomp Pokémon Émeraude depuis l'atlas associé.
 *
 * Pattern GBA : un atlas PNG contient toutes les tiles 8×8 en mode 1D_MAP
 * (linéaire ligne par ligne). Chaque sprite OAM occupe N tiles à partir d'un
 * `tileNum` donné, avec une shape (W×H) qui détermine combien de tiles forment
 * un rectangle au sein de l'atlas.
 *
 * Les définitions sont extraites par `scripts/extract-oam-sprites.mjs` dans
 * `oam-sprites.json` (235 sprites du décomp). Chaque entry a :
 *   - shape: [W, H] en pixels
 *   - bpp: 4 ou 8
 *   - tileNum: index de tile de départ dans l'atlas
 *   - tileTag: GFXTAG_X (= identifiant logique du graphics, à mapper en URL)
 *   - paletteTag: PALTAG_X
 *
 * Calcul atlasRect dans le PNG :
 *   - atlas est en mode 1D_MAP : tiles 8×8 alignées sur stride = atlas.width/8
 *   - tileRow = floor(tileNum / atlasStrideTiles)
 *   - atlasX  = (tileNum % atlasStrideTiles) * 8
 *   - atlasY  = tileRow * 8
 *   - atlasRect = (atlasX, atlasY, W, H)
 *
 * En 8bpp chaque tile fait 64 bytes au lieu de 32, donc le tileNum compte 2×
 * plus dans le ROM. MAIS dans le PNG (déjà décompressé), les tiles font toujours
 * 8×8 px. On ajuste si besoin via `bpp === 8`.
 */
import Phaser from 'phaser';
import oamSpritesJson from '../decomp/em/oam-sprites.json' with { type: 'json' };

interface OamSpriteDef {
  shape: [number, number];
  bpp: 4 | 8;
  tileNum: number;
  tileTag: string;
  paletteTag: string;
  source: string;
}

const OAM_SPRITES = oamSpritesJson as unknown as Record<string, OamSpriteDef>;

/**
 * Enregistre un sprite OAM comme sub-frame de l'atlas Phaser, et retourne le
 * nom de la frame à utiliser dans `scene.add.image(x, y, atlasKey, frameName)`.
 *
 * @param scene Phaser scene
 * @param spriteName nom du sprite dans oam-sprites.json (sans préfixe sSpriteTemplate_)
 * @param atlasKey clé Phaser de l'atlas PNG déjà chargé via this.load.image()
 * @param tileOffset offset additionnel à appliquer au tileNum (utile pour les
 *   sprites multi-frames ou les variantes de lettres GAME FREAK)
 * @returns le nom de la frame Phaser créée (= spriteName + tileOffset)
 */
export function loadOamSprite(
  scene: Phaser.Scene,
  spriteName: string,
  atlasKey: string,
  tileOffset = 0
): string {
  const def = OAM_SPRITES[spriteName];
  if (!def) {
    console.warn(`[oam-sprite] '${spriteName}' inconnu dans oam-sprites.json`);
    return '__missing__';
  }

  const atlas = scene.textures.get(atlasKey).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
  const atlasStrideTiles = Math.floor(atlas.width / 8);
  const effectiveTileNum = def.tileNum + tileOffset;
  const tileRow = Math.floor(effectiveTileNum / atlasStrideTiles);
  const atlasX = (effectiveTileNum % atlasStrideTiles) * 8;
  const atlasY = tileRow * 8;
  const [w, h] = def.shape;

  const frameName = `oam-${spriteName}-${tileOffset}`;
  const tex = scene.textures.get(atlasKey);
  if (!tex.has(frameName)) {
    tex.add(frameName, 0, atlasX, atlasY, w, h);
  }
  return frameName;
}

/** Helper : retourne la def OAM brute (utile pour positionner avec offset). */
export function getOamDef(spriteName: string): OamSpriteDef | undefined {
  return OAM_SPRITES[spriteName];
}
