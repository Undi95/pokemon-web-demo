// game/pokemon_icon.ts — portage 1:1 partiel de src/pokemon_icon.c.
//
// Pour l'instant : l'icône mon des mails BEAD/DREAM (GetIconSpeciesNoPersonality
// + LoadMonIconPalette + CreateMonIconNoPersonality + free). Le menu équipe garde
// sa propre voie inline (party-screen.ts) ; un câblage ultérieur pourra l'unifier.
//
// Assets : public/decomp/em/pokemon/<dexId>/icon.png (32×64 = 2 frames 32×32) +
// icon_palettes/icon_palette_<idx>.pal. Index palette = MON_ICON_PALETTE_INDICES
// (table partagée pokemon-icon-palettes.ts, 1:1 gMonIconPaletteIndices).

import { getRuntime } from '../harness/runtime/decomp-globals';
import { loadIndexedPngStrict, loadGbaPal } from '../harness/gba/png-loader';
import { LoadSpriteSheet, LoadSpritePalette, FreeSpritePaletteByTag, _freeSpriteTileRangeByTag, DestroySprite } from './sprite';
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';
import { MON_ICON_PALETTE_INDICES } from './engine/pokemon/pokemon-icon-palettes';
import { MailSpeciesToSpecies, NUM_SPECIES, SPECIES_UNOWN } from './mail_data';

// ─── 1:1 décomp constantes ───────────────────────────────────────────────────
const SPECIES_UNOWN_B = NUM_SPECIES + 1;       // species.h:422 (NUM_SPECIES + 1)
const INVALID_ICON_SPECIES = 260;              // pokemon_icon.c:9 = SPECIES_OLD_UNOWN_J
const ICON_TILES_PER_FRAME = 16;               // 32×32 4bpp = 16 tiles
const ICON_SHEET_TAG = 'mail_mon_icon';
const ICON_PAL_TAG = 'mail_mon_icon_pal';

// ─── 1:1 décomp GetIconSpecies / GetIconSpeciesNoPersonality ─────────────────
/** 1:1 décomp `u16 GetIconSpecies(u16 species, u32 personality)` (pokemon_icon.c:1072),
 *  chemin personality=0 (mail) : pas de lettre Unown. */
function GetIconSpecies(species: number): number {
  if (species === SPECIES_UNOWN) return SPECIES_UNOWN; // GetUnownLetterByPersonality(0)=0 → UNOWN
  return species > NUM_SPECIES ? INVALID_ICON_SPECIES : species;
}

/** 1:1 décomp `u16 GetIconSpeciesNoPersonality(u16 species)` (pokemon_icon.c:1104). */
export function GetIconSpeciesNoPersonality(species: number): number {
  const buf = { value: 0 };
  if (MailSpeciesToSpecies(species, buf) === SPECIES_UNOWN) {
    let value = buf.value;
    value += value === 0 ? SPECIES_UNOWN : SPECIES_UNOWN_B - 1;
    return value;
  }
  if (species > NUM_SPECIES) species = INVALID_ICON_SPECIES;
  return GetIconSpecies(species);
}

// ─── Chargement async des assets icône (pont M3 ROM→réseau, comme le mail) ───
interface IconAssets { tiles: Uint8Array; pal: Uint16Array; }
const _iconCache = new Map<number, IconAssets | null>(); // null = échec (gate release)
const _iconLoading = new Map<number, Promise<void>>();

export function IsMonIconLoaded(iconSpecies: number): boolean { return _iconCache.has(iconSpecies); }

/** Précharge (une fois) icon.png + palette du species dans le cache. Fire-and-forget :
 *  le mail GATE sur IsMonIconLoaded (case 8). */
export function PreloadMonIcon(iconSpecies: number): void {
  if (_iconCache.has(iconSpecies) || _iconLoading.has(iconSpecies)) return;
  const speciesEnum = reverseDecompConstant(iconSpecies, 'SPECIES_') ?? 'SPECIES_NONE';
  const dexId = speciesEnum.replace(/^SPECIES_/, '').toLowerCase();
  const palIdx = MON_ICON_PALETTE_INDICES[speciesEnum] ?? 0;
  const p = (async () => {
    try {
      const png = await loadIndexedPngStrict(`/decomp/em/pokemon/${dexId}/icon.png`, 4);
      const pal = await loadGbaPal(`/decomp/em/pokemon/icon_palettes/icon_palette_${palIdx}.pal`);
      _iconCache.set(iconSpecies, { tiles: png.charData, pal });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`[pokemon_icon] échec chargement icône ${dexId} :`, e);
      _iconCache.set(iconSpecies, null); // release le gate (pas d'icône, mail rendu sans)
    }
  })();
  _iconLoading.set(iconSpecies, p);
}

let _iconPalSlot = -1;

// NOTE 1:1 : les icônes créées via CreateMonIconNoPersonality avec
// SpriteCallbackDummy sont FIGÉES frame 0 en ROM — CreateMonIconSprite
// (pokemon_icon.c:1289-1290) pose animPaused=TRUE + animBeginning=FALSE, et
// sprite.c (ContinueAnim/DecrementAnimDelayCounter) est gaté sur animPaused.
// Seuls les écrans qui passent un callback per-frame (SpriteCB_MonIcon du
// party menu, trade, battle dome…) font bobber l'icône. Mail et naming screen
// = statiques.

/** 1:1 décomp `void LoadMonIconPalette(u16 species)` (pokemon_icon.c:1152). */
export function LoadMonIconPalette(iconSpecies: number): void {
  const entry = _iconCache.get(iconSpecies);
  if (!entry) return;
  _iconPalSlot = LoadSpritePalette({ data: entry.pal, tag: ICON_PAL_TAG });
}

/** Variante multi-icônes (écran BOÎTES du PC) : charge la palette dans un slot DÉDIÉ par index de
 *  palette (`MON_ICON_PALETTE_INDICES`), tag distinct par palIdx → plusieurs palettes coexistent
 *  (LoadMonIconPalette partage un seul tag = 1 slot). Renvoie le slot (-1 si icône non chargée). */
export function LoadMonIconPaletteToOwnSlot(iconSpecies: number): number {
  const entry = _iconCache.get(iconSpecies);
  if (!entry) return -1;
  const speciesEnum = reverseDecompConstant(iconSpecies, 'SPECIES_') ?? 'SPECIES_NONE';
  const palIdx = MON_ICON_PALETTE_INDICES[speciesEnum] ?? 0;
  return LoadSpritePalette({ data: entry.pal, tag: `mon_icon_pal_${palIdx}` });
}

/** 1:1 décomp `u8 CreateMonIconNoPersonality(species, callback, x, y, subpriority, handleDeoxys)`
 *  (pokemon_icon.c:1051). Port : sprite statique frame 0 via LoadSpriteSheet +
 *  CreateSpriteAtOam = comportement ROM exact pour un callback SpriteCallbackDummy
 *  (animPaused=TRUE à la création, cf. note en tête). Les 2 frames sont chargées
 *  pour les futurs écrans à SpriteCB_MonIcon (party menu, trade…). */
export function CreateMonIconNoPersonality(
  iconSpecies: number,
  _callback: ((sprite: unknown) => void) | null,
  x: number, y: number, subpriority: number, _handleDeoxys: boolean,
): number {
  const rt = getRuntime();
  const entry = _iconCache.get(iconSpecies);
  if (!rt || !entry) return 0xFF;
  // icon.png = 32×64 → 32 tiles (frame 0 = tiles 0..15, frame 1 = 16..31, contigus).
  const sheet = entry.tiles.subarray(0, ICON_TILES_PER_FRAME * 2 * 32);
  const tileStart = LoadSpriteSheet({ data: sheet, size: sheet.length, tag: ICON_SHEET_TAG });
  const spr = rt.CreateSpriteAtOam({
    x, y,
    shape: 0, size: 2,          // SPRITE_SHAPE(32x32) + SPRITE_SIZE(32x32) = 16 tiles
    tileId: tileStart,          // frame 0
    paletteBank: _iconPalSlot >= 0 ? _iconPalSlot : 0,
    priority: 1,
    subpriority,
  });
  return spr.spriteId;
}

/** 1:1 décomp `void FreeMonIconPalette(u16 species)` (pokemon_icon.c:1176). */
export function FreeMonIconPalette(_iconSpecies: number): void {
  FreeSpritePaletteByTag(ICON_PAL_TAG);
  _iconPalSlot = -1;
}

/** 1:1 décomp `void FreeAndDestroyMonIconSprite(struct Sprite *sprite)` (pokemon_icon.c:1129). */
export function FreeAndDestroyMonIconSprite(spriteId: number): void {
  const rt = getRuntime();
  if (!rt || spriteId === 0xFF) return;
  _freeSpriteTileRangeByTag(ICON_SHEET_TAG);
  DestroySprite(spriteId);
}
