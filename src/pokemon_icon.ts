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
import { MailSpeciesToSpecies, SPECIES_UNOWN } from './mail_data';
// NUM_SPECIES : depuis le header-miroir (leaf) — la const de mail_data.ts arrivait
// APRÈS pokemon_icon dans le cycle d'éval (TDZ boot, lot 12b/14).
import { NUM_SPECIES } from '../include/constants/species';

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

// ─── gMonIconPaletteIndices 1:1 (pokemon_icon.c:468) — ex-engine/pokemon/pokemon-icon-palettes.ts (lot 12b) ──
/** 1:1 décomp `gMonIconPaletteIndices[]` (pokemon_icon.c:468). Map species enum
 *  → 1 of 3 icon palettes (icon_palette_0/1/2.pal). 440 entries Gen 1-3. */
export const MON_ICON_PALETTE_INDICES: Record<string, number> = {
  SPECIES_NONE: 0,
  SPECIES_BULBASAUR: 1,
  SPECIES_IVYSAUR: 1,
  SPECIES_VENUSAUR: 1,
  SPECIES_CHARMANDER: 0,
  SPECIES_CHARMELEON: 0,
  SPECIES_CHARIZARD: 0,
  SPECIES_SQUIRTLE: 0,
  SPECIES_WARTORTLE: 2,
  SPECIES_BLASTOISE: 2,
  SPECIES_CATERPIE: 1,
  SPECIES_METAPOD: 1,
  SPECIES_BUTTERFREE: 0,
  SPECIES_WEEDLE: 1,
  SPECIES_KAKUNA: 2,
  SPECIES_BEEDRILL: 2,
  SPECIES_PIDGEY: 0,
  SPECIES_PIDGEOTTO: 0,
  SPECIES_PIDGEOT: 0,
  SPECIES_RATTATA: 2,
  SPECIES_RATICATE: 1,
  SPECIES_SPEAROW: 0,
  SPECIES_FEAROW: 0,
  SPECIES_EKANS: 2,
  SPECIES_ARBOK: 2,
  SPECIES_PIKACHU: 2,
  SPECIES_RAICHU: 0,
  SPECIES_SANDSHREW: 2,
  SPECIES_SANDSLASH: 2,
  SPECIES_NIDORAN_F: 2,
  SPECIES_NIDORINA: 2,
  SPECIES_NIDOQUEEN: 2,
  SPECIES_NIDORAN_M: 2,
  SPECIES_NIDORINO: 2,
  SPECIES_NIDOKING: 2,
  SPECIES_CLEFAIRY: 0,
  SPECIES_CLEFABLE: 0,
  SPECIES_VULPIX: 2,
  SPECIES_NINETALES: 1,
  SPECIES_JIGGLYPUFF: 0,
  SPECIES_WIGGLYTUFF: 0,
  SPECIES_ZUBAT: 2,
  SPECIES_GOLBAT: 2,
  SPECIES_ODDISH: 1,
  SPECIES_GLOOM: 0,
  SPECIES_VILEPLUME: 0,
  SPECIES_PARAS: 0,
  SPECIES_PARASECT: 0,
  SPECIES_VENONAT: 0,
  SPECIES_VENOMOTH: 2,
  SPECIES_DIGLETT: 2,
  SPECIES_DUGTRIO: 2,
  SPECIES_MEOWTH: 1,
  SPECIES_PERSIAN: 1,
  SPECIES_PSYDUCK: 1,
  SPECIES_GOLDUCK: 2,
  SPECIES_MANKEY: 1,
  SPECIES_PRIMEAPE: 2,
  SPECIES_GROWLITHE: 0,
  SPECIES_ARCANINE: 0,
  SPECIES_POLIWAG: 0,
  SPECIES_POLIWHIRL: 0,
  SPECIES_POLIWRATH: 0,
  SPECIES_ABRA: 2,
  SPECIES_KADABRA: 2,
  SPECIES_ALAKAZAM: 2,
  SPECIES_MACHOP: 0,
  SPECIES_MACHOKE: 2,
  SPECIES_MACHAMP: 0,
  SPECIES_BELLSPROUT: 1,
  SPECIES_WEEPINBELL: 1,
  SPECIES_VICTREEBEL: 1,
  SPECIES_TENTACOOL: 2,
  SPECIES_TENTACRUEL: 2,
  SPECIES_GEODUDE: 1,
  SPECIES_GRAVELER: 1,
  SPECIES_GOLEM: 1,
  SPECIES_PONYTA: 0,
  SPECIES_RAPIDASH: 0,
  SPECIES_SLOWPOKE: 0,
  SPECIES_SLOWBRO: 0,
  SPECIES_MAGNEMITE: 0,
  SPECIES_MAGNETON: 0,
  SPECIES_FARFETCHD: 1,
  SPECIES_DODUO: 2,
  SPECIES_DODRIO: 2,
  SPECIES_SEEL: 2,
  SPECIES_DEWGONG: 2,
  SPECIES_GRIMER: 2,
  SPECIES_MUK: 2,
  SPECIES_SHELLDER: 2,
  SPECIES_CLOYSTER: 2,
  SPECIES_GASTLY: 2,
  SPECIES_HAUNTER: 2,
  SPECIES_GENGAR: 2,
  SPECIES_ONIX: 2,
  SPECIES_DROWZEE: 2,
  SPECIES_HYPNO: 1,
  SPECIES_KRABBY: 2,
  SPECIES_KINGLER: 2,
  SPECIES_VOLTORB: 0,
  SPECIES_ELECTRODE: 0,
  SPECIES_EXEGGCUTE: 0,
  SPECIES_EXEGGUTOR: 1,
  SPECIES_CUBONE: 1,
  SPECIES_MAROWAK: 1,
  SPECIES_HITMONLEE: 2,
  SPECIES_HITMONCHAN: 2,
  SPECIES_LICKITUNG: 1,
  SPECIES_KOFFING: 2,
  SPECIES_WEEZING: 2,
  SPECIES_RHYHORN: 1,
  SPECIES_RHYDON: 1,
  SPECIES_CHANSEY: 0,
  SPECIES_TANGELA: 0,
  SPECIES_KANGASKHAN: 1,
  SPECIES_HORSEA: 0,
  SPECIES_SEADRA: 0,
  SPECIES_GOLDEEN: 0,
  SPECIES_SEAKING: 0,
  SPECIES_STARYU: 2,
  SPECIES_STARMIE: 2,
  SPECIES_MR_MIME: 0,
  SPECIES_SCYTHER: 1,
  SPECIES_JYNX: 2,
  SPECIES_ELECTABUZZ: 1,
  SPECIES_MAGMAR: 0,
  SPECIES_PINSIR: 2,
  SPECIES_TAUROS: 2,
  SPECIES_MAGIKARP: 0,
  SPECIES_GYARADOS: 0,
  SPECIES_LAPRAS: 2,
  SPECIES_DITTO: 2,
  SPECIES_EEVEE: 2,
  SPECIES_VAPOREON: 0,
  SPECIES_JOLTEON: 0,
  SPECIES_FLAREON: 0,
  SPECIES_PORYGON: 0,
  SPECIES_OMANYTE: 0,
  SPECIES_OMASTAR: 0,
  SPECIES_KABUTO: 2,
  SPECIES_KABUTOPS: 2,
  SPECIES_AERODACTYL: 0,
  SPECIES_SNORLAX: 1,
  SPECIES_ARTICUNO: 0,
  SPECIES_ZAPDOS: 0,
  SPECIES_MOLTRES: 0,
  SPECIES_DRATINI: 0,
  SPECIES_DRAGONAIR: 0,
  SPECIES_DRAGONITE: 2,
  SPECIES_MEWTWO: 2,
  SPECIES_MEW: 0,
  SPECIES_CHIKORITA: 1,
  SPECIES_BAYLEEF: 1,
  SPECIES_MEGANIUM: 1,
  SPECIES_CYNDAQUIL: 1,
  SPECIES_QUILAVA: 1,
  SPECIES_TYPHLOSION: 1,
  SPECIES_TOTODILE: 2,
  SPECIES_CROCONAW: 2,
  SPECIES_FERALIGATR: 2,
  SPECIES_SENTRET: 2,
  SPECIES_FURRET: 2,
  SPECIES_HOOTHOOT: 2,
  SPECIES_NOCTOWL: 2,
  SPECIES_LEDYBA: 0,
  SPECIES_LEDIAN: 0,
  SPECIES_SPINARAK: 1,
  SPECIES_ARIADOS: 0,
  SPECIES_CROBAT: 2,
  SPECIES_CHINCHOU: 2,
  SPECIES_LANTURN: 0,
  SPECIES_PICHU: 0,
  SPECIES_CLEFFA: 0,
  SPECIES_IGGLYBUFF: 1,
  SPECIES_TOGEPI: 2,
  SPECIES_TOGETIC: 2,
  SPECIES_NATU: 0,
  SPECIES_XATU: 0,
  SPECIES_MAREEP: 2,
  SPECIES_FLAAFFY: 0,
  SPECIES_AMPHAROS: 0,
  SPECIES_BELLOSSOM: 1,
  SPECIES_MARILL: 2,
  SPECIES_AZUMARILL: 2,
  SPECIES_SUDOWOODO: 1,
  SPECIES_POLITOED: 1,
  SPECIES_HOPPIP: 1,
  SPECIES_SKIPLOOM: 1,
  SPECIES_JUMPLUFF: 2,
  SPECIES_AIPOM: 2,
  SPECIES_SUNKERN: 1,
  SPECIES_SUNFLORA: 1,
  SPECIES_YANMA: 1,
  SPECIES_WOOPER: 0,
  SPECIES_QUAGSIRE: 0,
  SPECIES_ESPEON: 2,
  SPECIES_UMBREON: 2,
  SPECIES_MURKROW: 2,
  SPECIES_SLOWKING: 0,
  SPECIES_MISDREAVUS: 0,
  SPECIES_UNOWN: 0,
  SPECIES_WOBBUFFET: 0,
  SPECIES_GIRAFARIG: 1,
  SPECIES_PINECO: 0,
  SPECIES_FORRETRESS: 2,
  SPECIES_DUNSPARCE: 2,
  SPECIES_GLIGAR: 2,
  SPECIES_STEELIX: 0,
  SPECIES_SNUBBULL: 0,
  SPECIES_GRANBULL: 2,
  SPECIES_QWILFISH: 0,
  SPECIES_SCIZOR: 0,
  SPECIES_SHUCKLE: 1,
  SPECIES_HERACROSS: 2,
  SPECIES_SNEASEL: 0,
  SPECIES_TEDDIURSA: 0,
  SPECIES_URSARING: 2,
  SPECIES_SLUGMA: 0,
  SPECIES_MAGCARGO: 0,
  SPECIES_SWINUB: 2,
  SPECIES_PILOSWINE: 2,
  SPECIES_CORSOLA: 0,
  SPECIES_REMORAID: 0,
  SPECIES_OCTILLERY: 0,
  SPECIES_DELIBIRD: 0,
  SPECIES_MANTINE: 2,
  SPECIES_SKARMORY: 0,
  SPECIES_HOUNDOUR: 0,
  SPECIES_HOUNDOOM: 0,
  SPECIES_KINGDRA: 0,
  SPECIES_PHANPY: 0,
  SPECIES_DONPHAN: 0,
  SPECIES_PORYGON2: 0,
  SPECIES_STANTLER: 2,
  SPECIES_SMEARGLE: 1,
  SPECIES_TYROGUE: 2,
  SPECIES_HITMONTOP: 2,
  SPECIES_SMOOCHUM: 1,
  SPECIES_ELEKID: 1,
  SPECIES_MAGBY: 1,
  SPECIES_MILTANK: 1,
  SPECIES_BLISSEY: 1,
  SPECIES_RAIKOU: 0,
  SPECIES_ENTEI: 2,
  SPECIES_SUICUNE: 0,
  SPECIES_LARVITAR: 1,
  SPECIES_PUPITAR: 0,
  SPECIES_TYRANITAR: 1,
  SPECIES_LUGIA: 0,
  SPECIES_HO_OH: 1,
  SPECIES_CELEBI: 1,
  SPECIES_OLD_UNOWN_B: 0,
  SPECIES_OLD_UNOWN_C: 0,
  SPECIES_OLD_UNOWN_D: 0,
  SPECIES_OLD_UNOWN_E: 0,
  SPECIES_OLD_UNOWN_F: 0,
  SPECIES_OLD_UNOWN_G: 0,
  SPECIES_OLD_UNOWN_H: 0,
  SPECIES_OLD_UNOWN_I: 0,
  SPECIES_OLD_UNOWN_J: 0,
  SPECIES_OLD_UNOWN_K: 0,
  SPECIES_OLD_UNOWN_L: 0,
  SPECIES_OLD_UNOWN_M: 0,
  SPECIES_OLD_UNOWN_N: 0,
  SPECIES_OLD_UNOWN_O: 0,
  SPECIES_OLD_UNOWN_P: 0,
  SPECIES_OLD_UNOWN_Q: 0,
  SPECIES_OLD_UNOWN_R: 0,
  SPECIES_OLD_UNOWN_S: 0,
  SPECIES_OLD_UNOWN_T: 0,
  SPECIES_OLD_UNOWN_U: 0,
  SPECIES_OLD_UNOWN_V: 0,
  SPECIES_OLD_UNOWN_W: 0,
  SPECIES_OLD_UNOWN_X: 0,
  SPECIES_OLD_UNOWN_Y: 0,
  SPECIES_OLD_UNOWN_Z: 0,
  SPECIES_TREECKO: 1,
  SPECIES_GROVYLE: 0,
  SPECIES_SCEPTILE: 1,
  SPECIES_TORCHIC: 0,
  SPECIES_COMBUSKEN: 0,
  SPECIES_BLAZIKEN: 0,
  SPECIES_MUDKIP: 0,
  SPECIES_MARSHTOMP: 0,
  SPECIES_SWAMPERT: 0,
  SPECIES_POOCHYENA: 2,
  SPECIES_MIGHTYENA: 2,
  SPECIES_ZIGZAGOON: 2,
  SPECIES_LINOONE: 2,
  SPECIES_WURMPLE: 0,
  SPECIES_SILCOON: 2,
  SPECIES_BEAUTIFLY: 0,
  SPECIES_CASCOON: 2,
  SPECIES_DUSTOX: 1,
  SPECIES_LOTAD: 1,
  SPECIES_LOMBRE: 1,
  SPECIES_LUDICOLO: 1,
  SPECIES_SEEDOT: 1,
  SPECIES_NUZLEAF: 1,
  SPECIES_SHIFTRY: 0,
  SPECIES_NINCADA: 1,
  SPECIES_NINJASK: 1,
  SPECIES_SHEDINJA: 1,
  SPECIES_TAILLOW: 2,
  SPECIES_SWELLOW: 2,
  SPECIES_SHROOMISH: 1,
  SPECIES_BRELOOM: 1,
  SPECIES_SPINDA: 1,
  SPECIES_WINGULL: 0,
  SPECIES_PELIPPER: 0,
  SPECIES_SURSKIT: 2,
  SPECIES_MASQUERAIN: 0,
  SPECIES_WAILMER: 2,
  SPECIES_WAILORD: 0,
  SPECIES_SKITTY: 0,
  SPECIES_DELCATTY: 2,
  SPECIES_KECLEON: 1,
  SPECIES_BALTOY: 1,
  SPECIES_CLAYDOL: 0,
  SPECIES_NOSEPASS: 0,
  SPECIES_TORKOAL: 1,
  SPECIES_SABLEYE: 2,
  SPECIES_BARBOACH: 0,
  SPECIES_WHISCASH: 0,
  SPECIES_LUVDISC: 0,
  SPECIES_CORPHISH: 0,
  SPECIES_CRAWDAUNT: 0,
  SPECIES_FEEBAS: 2,
  SPECIES_MILOTIC: 0,
  SPECIES_CARVANHA: 0,
  SPECIES_SHARPEDO: 0,
  SPECIES_TRAPINCH: 1,
  SPECIES_VIBRAVA: 1,
  SPECIES_FLYGON: 1,
  SPECIES_MAKUHITA: 2,
  SPECIES_HARIYAMA: 1,
  SPECIES_ELECTRIKE: 1,
  SPECIES_MANECTRIC: 0,
  SPECIES_NUMEL: 1,
  SPECIES_CAMERUPT: 0,
  SPECIES_SPHEAL: 2,
  SPECIES_SEALEO: 2,
  SPECIES_WALREIN: 0,
  SPECIES_CACNEA: 1,
  SPECIES_CACTURNE: 1,
  SPECIES_SNORUNT: 2,
  SPECIES_GLALIE: 0,
  SPECIES_LUNATONE: 1,
  SPECIES_SOLROCK: 0,
  SPECIES_AZURILL: 2,
  SPECIES_SPOINK: 0,
  SPECIES_GRUMPIG: 2,
  SPECIES_PLUSLE: 0,
  SPECIES_MINUN: 0,
  SPECIES_MAWILE: 2,
  SPECIES_MEDITITE: 0,
  SPECIES_MEDICHAM: 0,
  SPECIES_SWABLU: 0,
  SPECIES_ALTARIA: 0,
  SPECIES_WYNAUT: 0,
  SPECIES_DUSKULL: 0,
  SPECIES_DUSCLOPS: 0,
  SPECIES_ROSELIA: 0,
  SPECIES_SLAKOTH: 2,
  SPECIES_VIGOROTH: 2,
  SPECIES_SLAKING: 1,
  SPECIES_GULPIN: 1,
  SPECIES_SWALOT: 2,
  SPECIES_TROPIUS: 1,
  SPECIES_WHISMUR: 0,
  SPECIES_LOUDRED: 2,
  SPECIES_EXPLOUD: 2,
  SPECIES_CLAMPERL: 0,
  SPECIES_HUNTAIL: 0,
  SPECIES_GOREBYSS: 0,
  SPECIES_ABSOL: 0,
  SPECIES_SHUPPET: 0,
  SPECIES_BANETTE: 0,
  SPECIES_SEVIPER: 2,
  SPECIES_ZANGOOSE: 0,
  SPECIES_RELICANTH: 1,
  SPECIES_ARON: 2,
  SPECIES_LAIRON: 2,
  SPECIES_AGGRON: 2,
  SPECIES_CASTFORM: 0,
  SPECIES_VOLBEAT: 0,
  SPECIES_ILLUMISE: 2,
  SPECIES_LILEEP: 2,
  SPECIES_CRADILY: 0,
  SPECIES_ANORITH: 0,
  SPECIES_ARMALDO: 0,
  SPECIES_RALTS: 1,
  SPECIES_KIRLIA: 1,
  SPECIES_GARDEVOIR: 1,
  SPECIES_BAGON: 2,
  SPECIES_SHELGON: 2,
  SPECIES_SALAMENCE: 0,
  SPECIES_BELDUM: 0,
  SPECIES_METANG: 0,
  SPECIES_METAGROSS: 0,
  SPECIES_REGIROCK: 2,
  SPECIES_REGICE: 2,
  SPECIES_REGISTEEL: 2,
  SPECIES_KYOGRE: 2,
  SPECIES_GROUDON: 0,
  SPECIES_RAYQUAZA: 1,
  SPECIES_LATIAS: 0,
  SPECIES_LATIOS: 2,
  SPECIES_JIRACHI: 0,
  SPECIES_DEOXYS: 0,
  SPECIES_CHIMECHO: 0,
  SPECIES_EGG: 1,
  SPECIES_UNOWN_B: 0,
  SPECIES_UNOWN_C: 0,
  SPECIES_UNOWN_D: 0,
  SPECIES_UNOWN_E: 0,
  SPECIES_UNOWN_F: 0,
  SPECIES_UNOWN_G: 0,
  SPECIES_UNOWN_H: 0,
  SPECIES_UNOWN_I: 0,
  SPECIES_UNOWN_J: 0,
  SPECIES_UNOWN_K: 0,
  SPECIES_UNOWN_L: 0,
  SPECIES_UNOWN_M: 0,
  SPECIES_UNOWN_N: 0,
  SPECIES_UNOWN_O: 0,
  SPECIES_UNOWN_P: 0,
  SPECIES_UNOWN_Q: 0,
  SPECIES_UNOWN_R: 0,
  SPECIES_UNOWN_S: 0,
  SPECIES_UNOWN_T: 0,
  SPECIES_UNOWN_U: 0,
  SPECIES_UNOWN_V: 0,
  SPECIES_UNOWN_W: 0,
  SPECIES_UNOWN_X: 0,
  SPECIES_UNOWN_Y: 0,
  SPECIES_UNOWN_Z: 0,
  SPECIES_UNOWN_EMARK: 0,
  SPECIES_UNOWN_QMARK: 0,
};
