/**
 * item-icon.ts — 1:1 décomp `src/item_icon.c` (169 l)
 * ============================================================================
 * Sous-système sprite icône d'objet. La décomp lit `gItemIconTable[itemId]
 * [0|1]` (tiles LZ + palette LZ depuis la ROM, memory-mapped → accès SYNC),
 * `LZDecompressWram` → `CopyItemIconPicTo4x4Buffer` (reshuffle 24×24 → 32×32
 * 4 tuiles) → `LoadSpriteSheet`/`LoadCompressedSpritePalette` → `CreateSprite
 * (gItemIconSpriteTemplate)`.
 *
 * Notre forme décomp 1:1 (PAS le raccourci .png, INTERDIT) : les tiles sont
 * extraites en `public/decomp/em/items/icons/<slug>.4bpp.bin` (288 o = 0x120
 * = `gItemIconDecompressionBuffer Alloc(0x120)`, item_icon.c:58) DÉJÀ
 * décompressées (extraction = décompression nette, = 1:1-sém de
 * `LZDecompressWram`), palettes en `icon_palettes/<palSlug>.pal` (=
 * `gItemIconTable[id][1]`). `item-icon-map.json` / `item-palette-map.json`
 * matérialisent `gItemIconTable` (itemKey → slug). Comme la décomp est SYNC
 * (ROM mappée) et que `BagMenu_MoveCursorCallback` appelle `AddBagItemIcon
 * Sprite` en nav synchrone, on PRÉCHARGE les buffers (preloadItemIconAssets,
 * await dans _bagLoadAssets) → AddItemIconSprite reste synchrone 1:1.
 *
 * Création sprite : la décomp `CreateSprite(&adHocTemplate)` (template copié
 * de gItemIconSpriteTemplate, tileTag/paletteTag posés au runtime). Notre
 * substrat = voie sprite DYNAMIQUE prouvée (list_menu.c red-cursor,
 * list-menu.ts:1126-1164) : LoadCompressedSpriteSheet/LoadSpritePalette
 * keyent spriteSheetTagToTileStart/paletteTagToSlot par String(tag) →
 * CreateSpriteAtOam(tileId=tag→tileStart, paletteBank=tag→slot). Net-1:1
 * (gItemIconSpriteTemplate = oam 32×32 4bpp prio1, anim 1 frame, cb dummy).
 */
import { assetCache, getRuntime, LoadCompressedSpriteSheet, LoadSpritePalette } from '../system/decomp-globals';
import { CpuCopy16 } from '../system/decomp-bridge';
import { loadTileBin, loadGbaPal } from '../../../harness/gba/png-loader';
import { IndexOfSpritePaletteTag, GetSpriteTileStartByTag } from '../../sprite';

// 1:1 décomp `#define MAX_SPRITES 64` (sprite.h) — retour échec AddItemIcon.
export const MAX_SPRITES = 64;

// gItemIconTable matérialisé : itemKey ('ITEM_POTION') → slug fichier.
let _iconSlugMap: Record<string, string> = {};
let _palSlugMap: Record<string, string> = {};
let _mapsLoaded = false;

// Buffers bruts préchargés (= ROM memory-mapped 1:1) : itemKey →
// { tiles: 0x120 (288o, .4bpp.bin), pal: Uint16Array (16 couleurs .pal/.gbapal) }.
const _iconAssets = new Map<string, { tiles: Uint8Array; pal: Uint16Array }>();

/** 1:1-sém `gItemIconTable[itemId][0]` chemin tiles (forme décomp .4bpp.bin,
 *  PAS .png). Slug via item-icon-map ; fallbacks TM/HM/return-arrow 1:1. */
function _iconBinUrl(itemKey: string): string {
  if (itemKey === 'ITEM_LIST_END' || itemKey === 'ITEM_RETURN_TO_FIELD')
    return '/decomp/em/items/icons/return_to_field_arrow.4bpp.bin';
  const mapped = _iconSlugMap[itemKey];
  if (mapped) return `/decomp/em/items/icons/${mapped}.4bpp.bin`;
  if (itemKey.startsWith('ITEM_TM')) return '/decomp/em/items/icons/tm_normal.4bpp.bin';
  if (itemKey.startsWith('ITEM_HM')) return '/decomp/em/items/icons/tm_hm.4bpp.bin';
  const slug = itemKey.replace(/^ITEM_/, '').toLowerCase();
  return `/decomp/em/items/icons/${slug}.4bpp.bin`;
}
/** 1:1-sém `gItemIconTable[itemId][1]` (palette). icon_palettes/<palSlug>.pal,
 *  sinon la .gbapal jumelle du .4bpp.bin (forme décomp). */
function _iconPalUrl(itemKey: string): string {
  const palSlug = _palSlugMap[itemKey];
  if (palSlug) return `/decomp/em/items/icon_palettes/${palSlug}.pal`;
  const binUrl = _iconBinUrl(itemKey);
  return binUrl.replace(/\.4bpp\.bin$/, '.gbapal');
}

async function _loadMaps(): Promise<void> {
  if (_mapsLoaded) return;
  try {
    const [i, p] = await Promise.all([
      fetch('/decomp/em/items/item-icon-map.json'),
      fetch('/decomp/em/items/item-palette-map.json'),
    ]);
    if (i.ok) _iconSlugMap = await i.json();
    if (p.ok) _palSlugMap = await p.json();
  } catch (e) {
    console.warn('[item-icon] icon/palette map load failed', e);
  }
  _mapsLoaded = true;
}

async function _preloadOne(itemKey: string): Promise<void> {
  if (_iconAssets.has(itemKey)) return;
  try {
    const [tiles, pal] = await Promise.all([
      loadTileBin(_iconBinUrl(itemKey), 4),
      loadGbaPal(_iconPalUrl(itemKey)),
    ]);
    _iconAssets.set(itemKey, { tiles, pal });
  } catch {
    /* asset manquant pour cet item → AddItemIconSprite renverra MAX_SPRITES
       (honnête : pas d'icône blanche fake). Non bloquant nav. */
  }
}

/** Précharge TOUS les buffers icône (maps + .4bpp.bin + .pal) pour que
 *  `AddItemIconSprite` soit SYNC 1:1 (la décomp lit la ROM mappée).
 *  Idempotent ; await dans _bagLoadAssets. + return-to-field arrow. */
export async function preloadItemIconAssets(): Promise<void> {
  await _loadMaps();
  const keys = new Set<string>(Object.keys(_iconSlugMap));
  keys.add('ITEM_LIST_END');
  await Promise.all([...keys].map(_preloadOne));
}

/** 1:1 décomp `CopyItemIconPicTo4x4Buffer` (item_icon.c:78-84) :
 *  `for (i=0;i<3;i++) CpuCopy16(src + i*96, dest + i*128, 0x60)`
 *  (24×24 px 4bpp = 288 o → 32×32 4 tuiles = 0x200, lignes décalées). */
function CopyItemIconPicTo4x4Buffer(src: Uint8Array, dest: Uint8Array): void {
  for (let i = 0; i < 3; i++)
    CpuCopy16(src.subarray(i * 96), dest.subarray(i * 128), 0x60);
}

/** 1:1-sém `GetItemIconPicOrPalette(itemId, which)` (item_icon.c:155) :
 *  ITEM_LIST_END → dernière icône (flèche retour) ; sinon buffer préchargé. */
function _getIconAsset(itemKey: string): { tiles: Uint8Array; pal: Uint16Array } | undefined {
  return _iconAssets.get(itemKey) ?? _iconAssets.get('ITEM_LIST_END');
}

/** 1:1 décomp `AddItemIconSprite(tilesTag, paletteTag, itemId)`
 *  (item_icon.c:86-130). itemId → itemKey (notre modèle string). Retour =
 *  spriteId, ou MAX_SPRITES si asset absent (= échec Alloc décomp, honnête). */
export function AddItemIconSprite(tilesTag: number, paletteTag: number, itemKey: string): number {
  const asset = _getIconAsset(itemKey);
  if (!asset) return MAX_SPRITES; // 1:1 :88 `if (!AllocItemIconTemporaryBuffers()) return MAX_SPRITES`
  // 1:1 :108-110 LZDecompressWram(pic, gItemIconDecompressionBuffer) [= asset.tiles
  // déjà décompressé] + CopyItemIconPicTo4x4Buffer → gItemIcon4x4Buffer (0x200).
  const buf4x4 = new Uint8Array(0x200);
  CopyItemIconPicTo4x4Buffer(asset.tiles, buf4x4);
  // 1:1 :111-117 spriteSheet{data=gItemIcon4x4Buffer,size=0x200,tag=tilesTag}
  // LoadSpriteSheet ; spritePalette{data=pic[1],tag} LoadCompressedSpritePalette.
  // Notre LoadCompressedSpriteSheet/LoadSpritePalette résolvent `data` via
  // assetCache (getAsset) → on y enregistre les buffers sous une clé du tag.
  const tilesKey = `__itemIconTiles_${tilesTag}`;
  const palKey = `__itemIconPal_${paletteTag}`;
  assetCache.set(tilesKey, buf4x4);
  assetCache.set(palKey, asset.pal);
  LoadCompressedSpriteSheet({ data: tilesKey, size: 0x200, tag: tilesTag });
  LoadSpritePalette({ data: palKey, tag: paletteTag });
  // 1:1 :119-126 spriteTemplate = gItemIconSpriteTemplate (copie) ; tileTag/
  // paletteTag custom ; CreateSprite(&tpl,0,0,0). Substrat = voie dynamique
  // prouvée : tag → tileStart/palBank → CreateSpriteAtOam. sOamData_ItemIcon
  // (item_icon.c:23) = SPRITE_SHAPE(32x32)=square(0) SIZE(32x32)=2 4BPP prio1.
  const rt = getRuntime() as unknown as {
    CreateSpriteAtOam: (c: Record<string, number>) => { spriteId: number };
  } | null;
  if (!rt) return MAX_SPRITES;
  // 1:1 STRICT lookups via array primary (sprite.c:1542 + :1637).
  const tileStartRaw = GetSpriteTileStartByTag(tilesTag);
  const tileStart = tileStartRaw === 0xFFFF ? 0 : tileStartRaw;
  const palBankRaw = IndexOfSpritePaletteTag(paletteTag);
  const palBank = palBankRaw === 0xFF ? 0 : palBankRaw;
  const { spriteId } = rt.CreateSpriteAtOam({
    tileId: tileStart, paletteBank: palBank,
    x: 0, y: 0, shape: 0, size: 2, priority: 1, subpriority: 0,
  });
  return spriteId;
}
