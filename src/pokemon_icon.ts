// game/pokemon_icon.ts — portage 1:1 partiel de src/pokemon_icon.c.
//
// Pour l'instant : l'icône mon des mails BEAD/DREAM (GetIconSpeciesNoPersonality
// + LoadMonIconPalette + CreateMonIconNoPersonality + free). Le menu équipe garde
// sa propre voie inline (party-screen.ts) ; un câblage ultérieur pourra l'unifier.
//
// Assets : public/decomp/em/pokemon/<dexId>/icon.png (32×64 = 2 frames 32×32) +
// icon_palettes/icon_palette_<idx>.pal. Index palette = MON_ICON_PALETTE_INDICES
// (table partagée pokemon-icon-palettes.ts, 1:1 gMonIconPaletteIndices).

import { getRuntime, LoadPalette } from '../harness/runtime/decomp-globals';
import { loadIndexedPngStrict, loadGbaPal } from '../harness/gba/png-loader';
import { LoadSpriteSheet, LoadSpritePalette, FreeSpritePaletteByTag, _freeSpriteTileRangeByTag, DestroySprite, IndexOfSpritePaletteTag } from './sprite';
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';
import { MON_ICON_PALETTE_INDICES } from './engine/pokemon/pokemon-icon-palettes';
import { MailSpeciesToSpecies, NUM_SPECIES, SPECIES_UNOWN } from './mail_data';

// ─── 1:1 décomp constantes ───────────────────────────────────────────────────
const SPECIES_UNOWN_B = NUM_SPECIES + 1;       // species.h:422 (NUM_SPECIES + 1)
const INVALID_ICON_SPECIES = 260;              // pokemon_icon.c:9 = SPECIES_OLD_UNOWN_J
const SPECIES_DEOXYS = 410;                    // species.h:416
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

// ─── Voie « 3 palettes partagées » 1:1 (PC storage, party menu…) ─────────────
// Le décomp charge les 3 palettes d'icônes (gMonIconPaletteTable) sous les tags
// POKE_ICON_BASE_PAL_TAG+0..2 ; chaque icône résout sa palette par palIdx.
const POKE_ICON_BASE_PAL_TAG = 56000;
const _monIconPals = new Map<number, Uint16Array | null>();  // palIdx → palette (null = en cours)

/** Adaptation ROM→réseau : précharge les 3 icon_palette_<idx>.pal (fire-and-forget, gate via
 *  AreMonIconPalettesLoaded — même pattern que PreloadMonIcon). */
export function PreloadMonIconPalettes(): void {
  for (let palIdx = 0; palIdx < 3; palIdx++) {
    if (_monIconPals.has(palIdx)) continue;
    _monIconPals.set(palIdx, null);
    void (async () => {
      const pal = await loadGbaPal(`/decomp/em/pokemon/icon_palettes/icon_palette_${palIdx}.pal`);
      _monIconPals.set(palIdx, pal);
    })().catch((e) => console.error('[pokemon_icon] icon_palette', palIdx, e));
  }
}
export function AreMonIconPalettesLoaded(): boolean {
  for (let palIdx = 0; palIdx < 3; palIdx++) if (!_monIconPals.get(palIdx)) return false;
  return true;
}

/** 1:1 décomp `void LoadMonIconPalettes(void)` (pokemon_icon.c:1144) — charge les 3 palettes
 *  partagées sous POKE_ICON_BASE_PAL_TAG+idx (préchargées par PreloadMonIconPalettes). */
export function LoadMonIconPalettes(): void {
  for (let palIdx = 0; palIdx < 3; palIdx++) {
    const pal = _monIconPals.get(palIdx);
    if (pal) LoadSpritePalette({ data: pal, tag: POKE_ICON_BASE_PAL_TAG + palIdx });
    else console.error(`[pokemon_icon] LoadMonIconPalettes : palette ${palIdx} pas préchargée (PreloadMonIconPalettes manquant ?)`);
  }
}

// ─── 1:1 décomp helpers icône « tiles + palette BG » (PC MultiMove) ───────────
/** 1:1 décomp `const u8 *GetMonIconTiles(u16 species, bool32 handleDeoxys)`
 *  (pokemon_icon.c:1188) : renvoie les tiles 4bpp de l'espèce (frame courante).
 *  DEOXYS + handleDeoxys → forme Speed (offset 0x400 bytes = 32 tiles plus loin).
 *  Nos tiles sont dans `_iconCache` (chargées async) ; null si pas prêtes. */
export function GetMonIconTiles(iconSpecies: number, handleDeoxys: boolean): Uint8Array | null {
  const entry = _iconCache.get(iconSpecies);
  if (!entry) return null;
  let iconSprite = entry.tiles;
  if (iconSpecies === SPECIES_DEOXYS && handleDeoxys === true)
    iconSprite = iconSprite.subarray(0x400); // forme Deoxys spécifique (Speed)
  return iconSprite;
}

/** 1:1 décomp `const u8 *GetMonIconPtr(u16 species, u32 personality,
 *  bool32 handleDeoxys)` (pokemon_icon.c:1124). */
export function GetMonIconPtr(species: number, personality: number, handleDeoxys: boolean): Uint8Array | null {
  return GetMonIconTiles(GetIconSpeciesFull(species, personality), handleDeoxys);
}

/** 1:1 décomp `u8 GetValidMonIconPalIndex(u16 species)` (pokemon_icon.c:1216) :
 *  clampe species hors-borne à INVALID_ICON_SPECIES puis renvoie l'index palette
 *  (`gMonIconPaletteIndices[species]` → MON_ICON_PALETTE_INDICES[speciesEnum]). */
export function GetValidMonIconPalIndex(species: number): number {
  if (species > NUM_SPECIES) species = INVALID_ICON_SPECIES;
  const speciesEnum = reverseDecompConstant(species, 'SPECIES_') ?? 'SPECIES_NONE';
  return MON_ICON_PALETTE_INDICES[speciesEnum] ?? 0;
}

/** 1:1 décomp `void TryLoadAllMonIconPalettesAtOffset(u16 offset)`
 *  (pokemon_icon.c:1198) : charge les 3 palettes d'icônes (gMonIconPaletteTable)
 *  dans la palette BG à offset, offset+0x10, offset+0x20 (16 couleurs chacune,
 *  0x20 bytes) SSI offset ≤ BG_PLTT_ID(13)=208 (place pour 3 palettes). Boucle
 *  descendante décomp (3 tours, pointeur + offset croissants). */
export function TryLoadAllMonIconPalettesAtOffset(offset: number): void {
  if (offset <= 13 * 16) { // BG_PLTT_ID(16 - ARRAY_COUNT(gMonIconPaletteTable)=3) = BG_PLTT_ID(13)
    let ptr = 0;
    for (let i = 3 - 1; i >= 0; i--) {
      const pal = _monIconPals.get(ptr);
      if (pal) LoadPalette(pal, offset, 0x20);
      else console.error(`[pokemon_icon] TryLoadAllMonIconPalettesAtOffset : palette ${ptr} pas préchargée`);
      offset += 0x10;
      ptr++;
    }
  }
}

/** 1:1 décomp `u8 GetUnownLetterByPersonality(u32 personality)` (pokemon.c). */
function GetUnownLetterByPersonality(personality: number): number {
  return (((personality & 0x3000000) >> 18) | ((personality & 0x30000) >> 12)
    | ((personality & 0x300) >> 6) | (personality & 0x3)) % 28;
}
/** 1:1 décomp `u16 GetIconSpecies(u16 species, u32 personality)` (pokemon_icon.c:1072) —
 *  version complète avec lettres Unown. */
function GetIconSpeciesFull(species: number, personality: number): number {
  if (species === SPECIES_UNOWN) {
    const letter = GetUnownLetterByPersonality(personality);
    return letter === 0 ? SPECIES_UNOWN : SPECIES_UNOWN_B + letter - 1;
  }
  return species > NUM_SPECIES ? INVALID_ICON_SPECIES : species;
}

/** 1:1 décomp `u8 CreateMonIconSprite(...)` via `u8 CreateMonIcon(species, callback, x, y,
 *  subpriority, personality, handleDeoxys)` (pokemon_icon.c:1115) — l'icône du PC/party :
 *  sprite statique frame 0 (callback SpriteCallbackDummy, cf. note animPaused en tête),
 *  `oam.priority` = param, palette = tag partagé POKE_ICON_BASE_PAL_TAG + palIdx du species. */
export function CreateMonIconSprite(
  species: number, personality: number, x: number, y: number, priority: number, subpriority: number,
): number {
  const rt = getRuntime();
  const iconSpecies = GetIconSpeciesFull(species, personality);
  const entry = _iconCache.get(iconSpecies);
  if (!rt || !entry) return 0xFF;
  const sheet = entry.tiles.subarray(0, ICON_TILES_PER_FRAME * 2 * 32);
  const tileStart = LoadSpriteSheet({ data: sheet, size: sheet.length, tag: ICON_SHEET_TAG });
  const speciesEnum = reverseDecompConstant(iconSpecies, 'SPECIES_') ?? 'SPECIES_NONE';
  const palIdx = MON_ICON_PALETTE_INDICES[speciesEnum] ?? 0;
  const palSlot = IndexOfSpritePaletteTag(POKE_ICON_BASE_PAL_TAG + palIdx);
  const spr = rt.CreateSpriteAtOam({
    x, y,
    shape: 0, size: 2,          // 32×32
    tileId: tileStart,
    paletteBank: palSlot !== 0xFF ? palSlot : 0,
    priority,
    subpriority,
  });
  return spr.spriteId;
}

/** 1:1 décomp `void FreeAndDestroyMonIconSprite(struct Sprite *sprite)` (pokemon_icon.c:1129). */
export function FreeAndDestroyMonIconSprite(spriteId: number): void {
  const rt = getRuntime();
  if (!rt || spriteId === 0xFF) return;
  _freeSpriteTileRangeByTag(ICON_SHEET_TAG);
  DestroySprite(spriteId);
}
