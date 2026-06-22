/**
 * decoration-data.ts — Port 1:1 STRICT de la table `gDecorations[]` (= 121 entrées
 * dans `src/data/decoration/header.h` du décomp).
 *
 * Source de vérité (= 1:1 EXACT) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/data/decoration/header.h` (1454l)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/data/decoration/description.h` (585l)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/decoration.h` :
 *       `struct Decoration { u8 id; u8 name[16]; u8 permission; u8 shape;
 *                            u8 category; u16 price; const u8 *description;
 *                            const u16 *tiles; };`
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/decorations.h`
 *
 * Layout 1:1 :
 *   - 121 entrées indexées DECOR_NONE..DECOR_REGISTEEL_DOLL (= 0..120).
 *   - DECOR_NONE partage le payload de DECOR_SMALL_DESK (= intentionnel 1:1
 *     décomp, header.h:3-13).
 *   - `name` : récupéré dynamiquement via `getString('DecorDesc_*')` → non, le
 *     name FR est PORTÉ INLINE depuis `header.h` (= chaque entrée a son texte
 *     `_("PETIT BUREAU")` etc.). Le nom n'est pas dans strings.json gText_*.
 *   - `description` : pointer → résolu via `getString('DecorDesc_<KEY>')` au
 *     site d'accès (= les 120 strings FR sont déjà dans
 *     `public/decomp/em/strings.json` sous la clé `DecorDesc_*`). Stocké ici
 *     comme string identifier (= clé strings.json, ex: `"DecorDesc_SMALL_DESK"`).
 *     Pour DECOR_NONE : pointe vers `DecorDesc_SMALL_DESK` (1:1 décomp).
 *   - `tiles` : pointer u16* → stocké comme string identifier
 *     (ex: `"DecorGfx_SMALL_DESK"`). Résolution future quand `tiles.h` sera
 *     porté en assets. Pour l'instant : STUB null-friendly via string ID.
 *
 * Consommateurs (réels) :
 *   - `decoration-inventory.ts` : `.category` (= utilisé par CheckHasDecoration,
 *     DecorationAdd, DecorationCheckSpace, DecorationRemove).
 *   - `decoration.ts` (port futur) : `.name`, `.description`, `.shape`,
 *     `.permission`, `.price`, `.tiles`, `.id`.
 *   - `trader.c`, `shop.c`, `tv.c`, `scrcmd.c` (ports futurs) : idem.
 *
 * Dette honnête :
 *   - `tiles` : string identifier seulement. Quand `src/data/decoration/tiles.h`
 *     sera porté (= chantier asset), remplacer le type `string` par `Uint16Array`
 *     / `number[]` et résoudre via lookup map.
 *   - 1:1 TODO : porter `DecorGfx_*` arrays (`tiles.h:643l`) en assets binaires.
 */

import {
  DECOR_NONE,
  DECOR_SMALL_DESK,
  DECOR_POKEMON_DESK,
  DECOR_HEAVY_DESK,
  DECOR_RAGGED_DESK,
  DECOR_COMFORT_DESK,
  DECOR_PRETTY_DESK,
  DECOR_BRICK_DESK,
  DECOR_CAMP_DESK,
  DECOR_HARD_DESK,
  DECOR_SMALL_CHAIR,
  DECOR_POKEMON_CHAIR,
  DECOR_HEAVY_CHAIR,
  DECOR_PRETTY_CHAIR,
  DECOR_COMFORT_CHAIR,
  DECOR_RAGGED_CHAIR,
  DECOR_BRICK_CHAIR,
  DECOR_CAMP_CHAIR,
  DECOR_HARD_CHAIR,
  DECOR_RED_PLANT,
  DECOR_TROPICAL_PLANT,
  DECOR_PRETTY_FLOWERS,
  DECOR_COLORFUL_PLANT,
  DECOR_BIG_PLANT,
  DECOR_GORGEOUS_PLANT,
  DECOR_RED_BRICK,
  DECOR_YELLOW_BRICK,
  DECOR_BLUE_BRICK,
  DECOR_RED_BALLOON,
  DECOR_BLUE_BALLOON,
  DECOR_YELLOW_BALLOON,
  DECOR_RED_TENT,
  DECOR_BLUE_TENT,
  DECOR_SOLID_BOARD,
  DECOR_SLIDE,
  DECOR_FENCE_LENGTH,
  DECOR_FENCE_WIDTH,
  DECOR_TIRE,
  DECOR_STAND,
  DECOR_MUD_BALL,
  DECOR_BREAKABLE_DOOR,
  DECOR_SAND_ORNAMENT,
  DECOR_SILVER_SHIELD,
  DECOR_GOLD_SHIELD,
  DECOR_GLASS_ORNAMENT,
  DECOR_TV,
  DECOR_ROUND_TV,
  DECOR_CUTE_TV,
  DECOR_GLITTER_MAT,
  DECOR_JUMP_MAT,
  DECOR_SPIN_MAT,
  DECOR_C_LOW_NOTE_MAT,
  DECOR_D_NOTE_MAT,
  DECOR_E_NOTE_MAT,
  DECOR_F_NOTE_MAT,
  DECOR_G_NOTE_MAT,
  DECOR_A_NOTE_MAT,
  DECOR_B_NOTE_MAT,
  DECOR_C_HIGH_NOTE_MAT,
  DECOR_SURF_MAT,
  DECOR_THUNDER_MAT,
  DECOR_FIRE_BLAST_MAT,
  DECOR_POWDER_SNOW_MAT,
  DECOR_ATTRACT_MAT,
  DECOR_FISSURE_MAT,
  DECOR_SPIKES_MAT,
  DECOR_BALL_POSTER,
  DECOR_GREEN_POSTER,
  DECOR_RED_POSTER,
  DECOR_BLUE_POSTER,
  DECOR_CUTE_POSTER,
  DECOR_PIKA_POSTER,
  DECOR_LONG_POSTER,
  DECOR_SEA_POSTER,
  DECOR_SKY_POSTER,
  DECOR_KISS_POSTER,
  DECOR_PICHU_DOLL,
  DECOR_PIKACHU_DOLL,
  DECOR_MARILL_DOLL,
  DECOR_TOGEPI_DOLL,
  DECOR_CYNDAQUIL_DOLL,
  DECOR_CHIKORITA_DOLL,
  DECOR_TOTODILE_DOLL,
  DECOR_JIGGLYPUFF_DOLL,
  DECOR_MEOWTH_DOLL,
  DECOR_CLEFAIRY_DOLL,
  DECOR_DITTO_DOLL,
  DECOR_SMOOCHUM_DOLL,
  DECOR_TREECKO_DOLL,
  DECOR_TORCHIC_DOLL,
  DECOR_MUDKIP_DOLL,
  DECOR_DUSKULL_DOLL,
  DECOR_WYNAUT_DOLL,
  DECOR_BALTOY_DOLL,
  DECOR_KECLEON_DOLL,
  DECOR_AZURILL_DOLL,
  DECOR_SKITTY_DOLL,
  DECOR_SWABLU_DOLL,
  DECOR_GULPIN_DOLL,
  DECOR_LOTAD_DOLL,
  DECOR_SEEDOT_DOLL,
  DECOR_PIKA_CUSHION,
  DECOR_ROUND_CUSHION,
  DECOR_KISS_CUSHION,
  DECOR_ZIGZAG_CUSHION,
  DECOR_SPIN_CUSHION,
  DECOR_DIAMOND_CUSHION,
  DECOR_BALL_CUSHION,
  DECOR_GRASS_CUSHION,
  DECOR_FIRE_CUSHION,
  DECOR_WATER_CUSHION,
  DECOR_SNORLAX_DOLL,
  DECOR_RHYDON_DOLL,
  DECOR_LAPRAS_DOLL,
  DECOR_VENUSAUR_DOLL,
  DECOR_CHARIZARD_DOLL,
  DECOR_BLASTOISE_DOLL,
  DECOR_WAILMER_DOLL,
  DECOR_REGIROCK_DOLL,
  DECOR_REGICE_DOLL,
  DECOR_REGISTEEL_DOLL,
} from '../../../include/constants/decorations';
import {
  ENUM_DecorationPermission,
  ENUM_DecorationShape,
  ENUM_DecorationCategory,
} from '../../../include/decoration';

// ─── 1:1 décomp `enum DecorationPermission` (decoration.h:4-14) ──────────────
const DECORPERM_SOLID_FLOOR  = ENUM_DecorationPermission.DECORPERM_SOLID_FLOOR;  // 0
const DECORPERM_PASS_FLOOR   = ENUM_DecorationPermission.DECORPERM_PASS_FLOOR;   // 1
const DECORPERM_BEHIND_FLOOR = ENUM_DecorationPermission.DECORPERM_BEHIND_FLOOR; // 2
const DECORPERM_NA_WALL      = ENUM_DecorationPermission.DECORPERM_NA_WALL;      // 3
const DECORPERM_SPRITE       = ENUM_DecorationPermission.DECORPERM_SPRITE;       // 4

// ─── 1:1 décomp `enum DecorationShape` (decoration.h:16-28) ──────────────────
const DECORSHAPE_1x1 = ENUM_DecorationShape.DECORSHAPE_1x1; // 0
const DECORSHAPE_2x1 = ENUM_DecorationShape.DECORSHAPE_2x1; // 1
// DECORSHAPE_3x1 = 2 (unused)
const DECORSHAPE_4x2 = ENUM_DecorationShape.DECORSHAPE_4x2; // 3
const DECORSHAPE_2x2 = ENUM_DecorationShape.DECORSHAPE_2x2; // 4
const DECORSHAPE_1x2 = ENUM_DecorationShape.DECORSHAPE_1x2; // 5
// DECORSHAPE_1x3 = 6 (unused)
const DECORSHAPE_2x4 = ENUM_DecorationShape.DECORSHAPE_2x4; // 7
const DECORSHAPE_3x3 = ENUM_DecorationShape.DECORSHAPE_3x3; // 8
const DECORSHAPE_3x2 = ENUM_DecorationShape.DECORSHAPE_3x2; // 9

// ─── 1:1 décomp `enum DecorationCategory` (decoration.h:30-41) ───────────────
const DECORCAT_DESK     = ENUM_DecorationCategory.DECORCAT_DESK;     // 0
const DECORCAT_CHAIR    = ENUM_DecorationCategory.DECORCAT_CHAIR;    // 1
const DECORCAT_PLANT    = ENUM_DecorationCategory.DECORCAT_PLANT;    // 2
const DECORCAT_ORNAMENT = ENUM_DecorationCategory.DECORCAT_ORNAMENT; // 3
const DECORCAT_MAT      = ENUM_DecorationCategory.DECORCAT_MAT;      // 4
const DECORCAT_POSTER   = ENUM_DecorationCategory.DECORCAT_POSTER;   // 5
const DECORCAT_DOLL     = ENUM_DecorationCategory.DECORCAT_DOLL;     // 6
const DECORCAT_CUSHION  = ENUM_DecorationCategory.DECORCAT_CUSHION;  // 7

// ─── 1:1 décomp `struct Decoration` (decoration.h:43-53) ─────────────────────
//
// `description` et `tiles` sont des pointers en C ; en TS on stocke des string
// identifiers résolvables au runtime.
//
//   description: clé strings.json (= ex `"DecorDesc_SMALL_DESK"`). Lookup via
//     `getString(decor.description)`. Toutes les 120 clés FR sont présentes dans
//     `public/decomp/em/strings.json`.
//   tiles: clé d'asset (= ex `"DecorGfx_SMALL_DESK"`). STUB ; résolution future
//     quand `src/data/decoration/tiles.h` sera porté en binaires.

/** 1:1 décomp `struct Decoration`. */
export interface Decoration {
  /** `u8 id;` (= index dans gDecorations[]). */
  id: number;
  /** `u8 name[16];` Texte FR direct (= 1:1 décomp `_("...")`). */
  name: string;
  /** `u8 permission;` (= DECORPERM_*). */
  permission: number;
  /** `u8 shape;` (= DECORSHAPE_*). */
  shape: number;
  /** `u8 category;` (= DECORCAT_*). */
  category: number;
  /** `u16 price;`. */
  price: number;
  /** `const u8 *description;` → string identifier (clé strings.json). */
  description: string;
  /** `const u16 *tiles;` → string identifier (clé asset, STUB). */
  tiles: string;
}

// ─── 1:1 décomp `gDecorations[]` (header.h:1-1454) ───────────────────────────

export const gDecorations: Decoration[] = [];
gDecorations[DECOR_NONE] = {
  id: DECOR_NONE,
  name: 'PETIT BUREAU',
  permission: DECORPERM_SOLID_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DESK,
  price: 0,
  description: 'DecorDesc_SMALL_DESK',
  tiles: 'DecorGfx_SMALL_DESK',
};
gDecorations[DECOR_SMALL_DESK] = {
  id: DECOR_SMALL_DESK,
  name: 'PETIT BUREAU',
  permission: DECORPERM_SOLID_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DESK,
  price: 3000,
  description: 'DecorDesc_SMALL_DESK',
  tiles: 'DecorGfx_SMALL_DESK',
};
gDecorations[DECOR_POKEMON_DESK] = {
  id: DECOR_POKEMON_DESK,
  name: 'BUREAU POKéMON',
  permission: DECORPERM_SOLID_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DESK,
  price: 3000,
  description: 'DecorDesc_POKEMON_DESK',
  tiles: 'DecorGfx_POKEMON_DESK',
};
gDecorations[DECOR_HEAVY_DESK] = {
  id: DECOR_HEAVY_DESK,
  name: 'GRAND BUREAU',
  permission: DECORPERM_SOLID_FLOOR,
  shape: DECORSHAPE_3x2,
  category: DECORCAT_DESK,
  price: 6000,
  description: 'DecorDesc_HEAVY_DESK',
  tiles: 'DecorGfx_HEAVY_DESK',
};
gDecorations[DECOR_RAGGED_DESK] = {
  id: DECOR_RAGGED_DESK,
  name: 'BUREAU BRUT',
  permission: DECORPERM_SOLID_FLOOR,
  shape: DECORSHAPE_3x2,
  category: DECORCAT_DESK,
  price: 6000,
  description: 'DecorDesc_RAGGED_DESK',
  tiles: 'DecorGfx_RAGGED_DESK',
};
gDecorations[DECOR_COMFORT_DESK] = {
  id: DECOR_COMFORT_DESK,
  name: 'BUREAU COQUET',
  permission: DECORPERM_SOLID_FLOOR,
  shape: DECORSHAPE_3x2,
  category: DECORCAT_DESK,
  price: 6000,
  description: 'DecorDesc_COMFORT_DESK',
  tiles: 'DecorGfx_COMFORT_DESK',
};
gDecorations[DECOR_PRETTY_DESK] = {
  id: DECOR_PRETTY_DESK,
  name: 'JOLI BUREAU',
  permission: DECORPERM_SOLID_FLOOR,
  shape: DECORSHAPE_3x3,
  category: DECORCAT_DESK,
  price: 9000,
  description: 'DecorDesc_PRETTY_DESK',
  tiles: 'DecorGfx_PRETTY_DESK',
};
gDecorations[DECOR_BRICK_DESK] = {
  id: DECOR_BRICK_DESK,
  name: 'BUREAU BRIQUES',
  permission: DECORPERM_SOLID_FLOOR,
  shape: DECORSHAPE_3x3,
  category: DECORCAT_DESK,
  price: 9000,
  description: 'DecorDesc_BRICK_DESK',
  tiles: 'DecorGfx_BRICK_DESK',
};
gDecorations[DECOR_CAMP_DESK] = {
  id: DECOR_CAMP_DESK,
  name: 'BUREAU CAMPEUR',
  permission: DECORPERM_SOLID_FLOOR,
  shape: DECORSHAPE_3x3,
  category: DECORCAT_DESK,
  price: 9000,
  description: 'DecorDesc_CAMP_DESK',
  tiles: 'DecorGfx_CAMP_DESK',
};
gDecorations[DECOR_HARD_DESK] = {
  id: DECOR_HARD_DESK,
  name: 'BUREAU PIERRES',
  permission: DECORPERM_SOLID_FLOOR,
  shape: DECORSHAPE_3x3,
  category: DECORCAT_DESK,
  price: 9000,
  description: 'DecorDesc_HARD_DESK',
  tiles: 'DecorGfx_HARD_DESK',
};
gDecorations[DECOR_SMALL_CHAIR] = {
  id: DECOR_SMALL_CHAIR,
  name: 'PETITE CHAISE',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_CHAIR,
  price: 2000,
  description: 'DecorDesc_SMALL_CHAIR',
  tiles: 'DecorGfx_SMALL_CHAIR',
};
gDecorations[DECOR_POKEMON_CHAIR] = {
  id: DECOR_POKEMON_CHAIR,
  name: 'CHAISE POKéMON',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_CHAIR,
  price: 2000,
  description: 'DecorDesc_POKEMON_CHAIR',
  tiles: 'DecorGfx_POKEMON_CHAIR',
};
gDecorations[DECOR_HEAVY_CHAIR] = {
  id: DECOR_HEAVY_CHAIR,
  name: 'GRANDE CHAISE',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_CHAIR,
  price: 2000,
  description: 'DecorDesc_HEAVY_CHAIR',
  tiles: 'DecorGfx_HEAVY_CHAIR',
};
gDecorations[DECOR_PRETTY_CHAIR] = {
  id: DECOR_PRETTY_CHAIR,
  name: 'JOLIE CHAISE',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_CHAIR,
  price: 2000,
  description: 'DecorDesc_PRETTY_CHAIR',
  tiles: 'DecorGfx_PRETTY_CHAIR',
};
gDecorations[DECOR_COMFORT_CHAIR] = {
  id: DECOR_COMFORT_CHAIR,
  name: 'CHAISE COQUETTE',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_CHAIR,
  price: 2000,
  description: 'DecorDesc_COMFORT_CHAIR',
  tiles: 'DecorGfx_COMFORT_CHAIR',
};
gDecorations[DECOR_RAGGED_CHAIR] = {
  id: DECOR_RAGGED_CHAIR,
  name: 'CHAISE BRUTE',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_CHAIR,
  price: 2000,
  description: 'DecorDesc_RAGGED_CHAIR',
  tiles: 'DecorGfx_RAGGED_CHAIR',
};
gDecorations[DECOR_BRICK_CHAIR] = {
  id: DECOR_BRICK_CHAIR,
  name: 'CHAISE BRIQUES',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_CHAIR,
  price: 2000,
  description: 'DecorDesc_BRICK_CHAIR',
  tiles: 'DecorGfx_BRICK_CHAIR',
};
gDecorations[DECOR_CAMP_CHAIR] = {
  id: DECOR_CAMP_CHAIR,
  name: 'CHAISE CAMPEUR',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_CHAIR,
  price: 2000,
  description: 'DecorDesc_CAMP_CHAIR',
  tiles: 'DecorGfx_CAMP_CHAIR',
};
gDecorations[DECOR_HARD_CHAIR] = {
  id: DECOR_HARD_CHAIR,
  name: 'CHAISE PIERRES',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_CHAIR,
  price: 2000,
  description: 'DecorDesc_HARD_CHAIR',
  tiles: 'DecorGfx_HARD_CHAIR',
};
gDecorations[DECOR_RED_PLANT] = {
  id: DECOR_RED_PLANT,
  name: 'PLANTE ROUGE',
  permission: DECORPERM_BEHIND_FLOOR,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_PLANT,
  price: 3000,
  description: 'DecorDesc_RED_PLANT',
  tiles: 'DecorGfx_RED_PLANT',
};
gDecorations[DECOR_TROPICAL_PLANT] = {
  id: DECOR_TROPICAL_PLANT,
  name: 'PLANTE TROPIC',
  permission: DECORPERM_BEHIND_FLOOR,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_PLANT,
  price: 3000,
  description: 'DecorDesc_TROPICAL_PLANT',
  tiles: 'DecorGfx_TROPICAL_PLANT',
};
gDecorations[DECOR_PRETTY_FLOWERS] = {
  id: DECOR_PRETTY_FLOWERS,
  name: 'JOLIES FLEURS',
  permission: DECORPERM_BEHIND_FLOOR,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_PLANT,
  price: 3000,
  description: 'DecorDesc_PRETTY_FLOWERS',
  tiles: 'DecorGfx_PRETTY_FLOWERS',
};
gDecorations[DECOR_COLORFUL_PLANT] = {
  id: DECOR_COLORFUL_PLANT,
  name: 'PLANTE COLOREE',
  permission: DECORPERM_BEHIND_FLOOR,
  shape: DECORSHAPE_2x2,
  category: DECORCAT_PLANT,
  price: 5000,
  description: 'DecorDesc_COLORFUL_PLANT',
  tiles: 'DecorGfx_COLORFUL_PLANT',
};
gDecorations[DECOR_BIG_PLANT] = {
  id: DECOR_BIG_PLANT,
  name: 'GROSSE PLANTE',
  permission: DECORPERM_BEHIND_FLOOR,
  shape: DECORSHAPE_2x2,
  category: DECORCAT_PLANT,
  price: 5000,
  description: 'DecorDesc_BIG_PLANT',
  tiles: 'DecorGfx_BIG_PLANT',
};
gDecorations[DECOR_GORGEOUS_PLANT] = {
  id: DECOR_GORGEOUS_PLANT,
  name: 'BELLE PLANTE',
  permission: DECORPERM_BEHIND_FLOOR,
  shape: DECORSHAPE_2x2,
  category: DECORCAT_PLANT,
  price: 5000,
  description: 'DecorDesc_GORGEOUS_PLANT',
  tiles: 'DecorGfx_GORGEOUS_PLANT',
};
gDecorations[DECOR_RED_BRICK] = {
  id: DECOR_RED_BRICK,
  name: 'BRIQUE ROUGE',
  permission: DECORPERM_SOLID_FLOOR,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_ORNAMENT,
  price: 500,
  description: 'DecorDesc_RED_BRICK',
  tiles: 'DecorGfx_RED_BRICK',
};
gDecorations[DECOR_YELLOW_BRICK] = {
  id: DECOR_YELLOW_BRICK,
  name: 'BRIQUE JAUNE',
  permission: DECORPERM_SOLID_FLOOR,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_ORNAMENT,
  price: 500,
  description: 'DecorDesc_YELLOW_BRICK',
  tiles: 'DecorGfx_YELLOW_BRICK',
};
gDecorations[DECOR_BLUE_BRICK] = {
  id: DECOR_BLUE_BRICK,
  name: 'BRIQUE BLEUE',
  permission: DECORPERM_SOLID_FLOOR,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_ORNAMENT,
  price: 500,
  description: 'DecorDesc_BLUE_BRICK',
  tiles: 'DecorGfx_BLUE_BRICK',
};
gDecorations[DECOR_RED_BALLOON] = {
  id: DECOR_RED_BALLOON,
  name: 'BALLON ROUGE',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_ORNAMENT,
  price: 500,
  description: 'DecorDesc_RED_BALLOON',
  tiles: 'DecorGfx_RED_BALLOON',
};
gDecorations[DECOR_BLUE_BALLOON] = {
  id: DECOR_BLUE_BALLOON,
  name: 'BALLON BLEU',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_ORNAMENT,
  price: 500,
  description: 'DecorDesc_BLUE_BALLOON',
  tiles: 'DecorGfx_BLUE_BALLOON',
};
gDecorations[DECOR_YELLOW_BALLOON] = {
  id: DECOR_YELLOW_BALLOON,
  name: 'BALLON JAUNE',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_ORNAMENT,
  price: 500,
  description: 'DecorDesc_YELLOW_BALLOON',
  tiles: 'DecorGfx_YELLOW_BALLOON',
};
gDecorations[DECOR_RED_TENT] = {
  id: DECOR_RED_TENT,
  name: 'TENTE ROUGE',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_3x3,
  category: DECORCAT_ORNAMENT,
  price: 10000,
  description: 'DecorDesc_RED_TENT',
  tiles: 'DecorGfx_RED_TENT',
};
gDecorations[DECOR_BLUE_TENT] = {
  id: DECOR_BLUE_TENT,
  name: 'TENTE BLEUE',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_3x3,
  category: DECORCAT_ORNAMENT,
  price: 10000,
  description: 'DecorDesc_BLUE_TENT',
  tiles: 'DecorGfx_BLUE_TENT',
};
gDecorations[DECOR_SOLID_BOARD] = {
  id: DECOR_SOLID_BOARD,
  name: 'PLANCHE SOLIDE',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_ORNAMENT,
  price: 3000,
  description: 'DecorDesc_SOLID_BOARD',
  tiles: 'DecorGfx_SOLID_BOARD',
};
gDecorations[DECOR_SLIDE] = {
  id: DECOR_SLIDE,
  name: 'TOBOGGAN',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_2x4,
  category: DECORCAT_ORNAMENT,
  price: 8000,
  description: 'DecorDesc_SLIDE',
  tiles: 'DecorGfx_SLIDE',
};
gDecorations[DECOR_FENCE_LENGTH] = {
  id: DECOR_FENCE_LENGTH,
  name: 'BARRIERE HAUTE',
  permission: DECORPERM_SOLID_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_ORNAMENT,
  price: 500,
  description: 'DecorDesc_FENCE_LENGTH',
  tiles: 'DecorGfx_FENCE_LENGTH',
};
gDecorations[DECOR_FENCE_WIDTH] = {
  id: DECOR_FENCE_WIDTH,
  name: 'BARRIERE LARGE',
  permission: DECORPERM_SOLID_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_ORNAMENT,
  price: 500,
  description: 'DecorDesc_FENCE_WIDTH',
  tiles: 'DecorGfx_FENCE_WIDTH',
};
gDecorations[DECOR_TIRE] = {
  id: DECOR_TIRE,
  name: 'PNEU',
  permission: DECORPERM_SOLID_FLOOR,
  shape: DECORSHAPE_2x2,
  category: DECORCAT_ORNAMENT,
  price: 800,
  description: 'DecorDesc_TIRE',
  tiles: 'DecorGfx_TIRE',
};
gDecorations[DECOR_STAND] = {
  id: DECOR_STAND,
  name: 'ESTRADE',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_4x2,
  category: DECORCAT_ORNAMENT,
  price: 7000,
  description: 'DecorDesc_STAND',
  tiles: 'DecorGfx_STAND',
};
gDecorations[DECOR_MUD_BALL] = {
  id: DECOR_MUD_BALL,
  name: 'BOULE DE BOUE',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_ORNAMENT,
  price: 200,
  description: 'DecorDesc_MUD_BALL',
  tiles: 'DecorGfx_MUD_BALL',
};
gDecorations[DECOR_BREAKABLE_DOOR] = {
  id: DECOR_BREAKABLE_DOOR,
  name: 'PORTE CASSABLE',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_ORNAMENT,
  price: 3000,
  description: 'DecorDesc_BREAKABLE_DOOR',
  tiles: 'DecorGfx_BREAKABLE_DOOR',
};
gDecorations[DECOR_SAND_ORNAMENT] = {
  id: DECOR_SAND_ORNAMENT,
  name: 'DECO DE SABLE',
  permission: DECORPERM_BEHIND_FLOOR,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_ORNAMENT,
  price: 3000,
  description: 'DecorDesc_SAND_ORNAMENT',
  tiles: 'DecorGfx_SAND_ORNAMENT',
};
gDecorations[DECOR_SILVER_SHIELD] = {
  id: DECOR_SILVER_SHIELD,
  name: 'BOUCLIER ARGENT',
  permission: DECORPERM_BEHIND_FLOOR,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_ORNAMENT,
  price: 0,
  description: 'DecorDesc_SILVER_SHIELD',
  tiles: 'DecorGfx_SILVER_SHIELD',
};
gDecorations[DECOR_GOLD_SHIELD] = {
  id: DECOR_GOLD_SHIELD,
  name: 'BOUCLIER OR',
  permission: DECORPERM_BEHIND_FLOOR,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_ORNAMENT,
  price: 0,
  description: 'DecorDesc_GOLD_SHIELD',
  tiles: 'DecorGfx_GOLD_SHIELD',
};
gDecorations[DECOR_GLASS_ORNAMENT] = {
  id: DECOR_GLASS_ORNAMENT,
  name: 'ORNEMENT VERRE',
  permission: DECORPERM_BEHIND_FLOOR,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_ORNAMENT,
  price: 0,
  description: 'DecorDesc_GLASS_ORNAMENT',
  tiles: 'DecorGfx_GLASS_ORNAMENT',
};
gDecorations[DECOR_TV] = {
  id: DECOR_TV,
  name: 'TV',
  permission: DECORPERM_SOLID_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_ORNAMENT,
  price: 3000,
  description: 'DecorDesc_TV',
  tiles: 'DecorGfx_TV',
};
gDecorations[DECOR_ROUND_TV] = {
  id: DECOR_ROUND_TV,
  name: 'TV RONDE',
  permission: DECORPERM_SOLID_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_ORNAMENT,
  price: 4000,
  description: 'DecorDesc_ROUND_TV',
  tiles: 'DecorGfx_ROUND_TV',
};
gDecorations[DECOR_CUTE_TV] = {
  id: DECOR_CUTE_TV,
  name: 'JOLIE TV',
  permission: DECORPERM_SOLID_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_ORNAMENT,
  price: 4000,
  description: 'DecorDesc_CUTE_TV',
  tiles: 'DecorGfx_CUTE_TV',
};
gDecorations[DECOR_GLITTER_MAT] = {
  id: DECOR_GLITTER_MAT,
  name: 'TAPIS BRILLANT',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_MAT,
  price: 2000,
  description: 'DecorDesc_GLITTER_MAT',
  tiles: 'DecorGfx_GLITTER_MAT',
};
gDecorations[DECOR_JUMP_MAT] = {
  id: DECOR_JUMP_MAT,
  name: 'TAPIS SAUTEUR',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_MAT,
  price: 2000,
  description: 'DecorDesc_JUMP_MAT',
  tiles: 'DecorGfx_JUMP_MAT',
};
gDecorations[DECOR_SPIN_MAT] = {
  id: DECOR_SPIN_MAT,
  name: 'TAPIS TOURNANT',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_MAT,
  price: 2000,
  description: 'DecorDesc_SPIN_MAT',
  tiles: 'DecorGfx_SPIN_MAT',
};
gDecorations[DECOR_C_LOW_NOTE_MAT] = {
  id: DECOR_C_LOW_NOTE_MAT,
  name: 'TAPIS DO GRAVE',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_MAT,
  price: 500,
  description: 'DecorDesc_C_LOW_NOTE_MAT',
  tiles: 'DecorGfx_C_LOW_NOTE_MAT',
};
gDecorations[DECOR_D_NOTE_MAT] = {
  id: DECOR_D_NOTE_MAT,
  name: 'TAPIS RE',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_MAT,
  price: 500,
  description: 'DecorDesc_D_NOTE_MAT',
  tiles: 'DecorGfx_D_NOTE_MAT',
};
gDecorations[DECOR_E_NOTE_MAT] = {
  id: DECOR_E_NOTE_MAT,
  name: 'TAPIS MI',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_MAT,
  price: 500,
  description: 'DecorDesc_E_NOTE_MAT',
  tiles: 'DecorGfx_E_NOTE_MAT',
};
gDecorations[DECOR_F_NOTE_MAT] = {
  id: DECOR_F_NOTE_MAT,
  name: 'TAPIS FA',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_MAT,
  price: 500,
  description: 'DecorDesc_F_NOTE_MAT',
  tiles: 'DecorGfx_F_NOTE_MAT',
};
gDecorations[DECOR_G_NOTE_MAT] = {
  id: DECOR_G_NOTE_MAT,
  name: 'TAPIS SOL',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_MAT,
  price: 500,
  description: 'DecorDesc_G_NOTE_MAT',
  tiles: 'DecorGfx_G_NOTE_MAT',
};
gDecorations[DECOR_A_NOTE_MAT] = {
  id: DECOR_A_NOTE_MAT,
  name: 'TAPIS LA',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_MAT,
  price: 500,
  description: 'DecorDesc_A_NOTE_MAT',
  tiles: 'DecorGfx_A_NOTE_MAT',
};
gDecorations[DECOR_B_NOTE_MAT] = {
  id: DECOR_B_NOTE_MAT,
  name: 'TAPIS SI',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_MAT,
  price: 500,
  description: 'DecorDesc_B_NOTE_MAT',
  tiles: 'DecorGfx_B_NOTE_MAT',
};
gDecorations[DECOR_C_HIGH_NOTE_MAT] = {
  id: DECOR_C_HIGH_NOTE_MAT,
  name: 'TAPIS DO AIGU',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_MAT,
  price: 500,
  description: 'DecorDesc_C_HIGH_NOTE_MAT',
  tiles: 'DecorGfx_C_HIGH_NOTE_MAT',
};
gDecorations[DECOR_SURF_MAT] = {
  id: DECOR_SURF_MAT,
  name: 'TAPIS SURF',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_3x3,
  category: DECORCAT_MAT,
  price: 4000,
  description: 'DecorDesc_SURF_MAT',
  tiles: 'DecorGfx_SURF_MAT',
};
gDecorations[DECOR_THUNDER_MAT] = {
  id: DECOR_THUNDER_MAT,
  name: 'TA.FATAL-FOUDRE',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_3x3,
  category: DECORCAT_MAT,
  price: 4000,
  description: 'DecorDesc_THUNDER_MAT',
  tiles: 'DecorGfx_THUNDER_MAT',
};
gDecorations[DECOR_FIRE_BLAST_MAT] = {
  id: DECOR_FIRE_BLAST_MAT,
  name: 'TA.DEFLAGRATION',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_3x3,
  category: DECORCAT_MAT,
  price: 4000,
  description: 'DecorDesc_FIRE_BLAST_MAT',
  tiles: 'DecorGfx_FIRE_BLAST_MAT',
};
gDecorations[DECOR_POWDER_SNOW_MAT] = {
  id: DECOR_POWDER_SNOW_MAT,
  name: 'TAPIS POUDREUSE',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_3x3,
  category: DECORCAT_MAT,
  price: 4000,
  description: 'DecorDesc_POWDER_SNOW_MAT',
  tiles: 'DecorGfx_POWDER_SNOW_MAT',
};
gDecorations[DECOR_ATTRACT_MAT] = {
  id: DECOR_ATTRACT_MAT,
  name: 'TAP. ATTRACTION',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_3x3,
  category: DECORCAT_MAT,
  price: 4000,
  description: 'DecorDesc_ATTRACT_MAT',
  tiles: 'DecorGfx_ATTRACT_MAT',
};
gDecorations[DECOR_FISSURE_MAT] = {
  id: DECOR_FISSURE_MAT,
  name: 'TAPIS ABIME',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_3x3,
  category: DECORCAT_MAT,
  price: 4000,
  description: 'DecorDesc_FISSURE_MAT',
  tiles: 'DecorGfx_FISSURE_MAT',
};
gDecorations[DECOR_SPIKES_MAT] = {
  id: DECOR_SPIKES_MAT,
  name: 'TAPIS PICOTS',
  permission: DECORPERM_PASS_FLOOR,
  shape: DECORSHAPE_3x3,
  category: DECORCAT_MAT,
  price: 4000,
  description: 'DecorDesc_SPIKES_MAT',
  tiles: 'DecorGfx_SPIKES_MAT',
};
gDecorations[DECOR_BALL_POSTER] = {
  id: DECOR_BALL_POSTER,
  name: 'POSTER BALL',
  permission: DECORPERM_NA_WALL,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_POSTER,
  price: 1000,
  description: 'DecorDesc_BALL_POSTER',
  tiles: 'DecorGfx_BALL_POSTER',
};
gDecorations[DECOR_GREEN_POSTER] = {
  id: DECOR_GREEN_POSTER,
  name: 'POSTER VERT',
  permission: DECORPERM_NA_WALL,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_POSTER,
  price: 1000,
  description: 'DecorDesc_GREEN_POSTER',
  tiles: 'DecorGfx_GREEN_POSTER',
};
gDecorations[DECOR_RED_POSTER] = {
  id: DECOR_RED_POSTER,
  name: 'POSTER ROUGE',
  permission: DECORPERM_NA_WALL,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_POSTER,
  price: 1000,
  description: 'DecorDesc_RED_POSTER',
  tiles: 'DecorGfx_RED_POSTER',
};
gDecorations[DECOR_BLUE_POSTER] = {
  id: DECOR_BLUE_POSTER,
  name: 'POSTER BLEU',
  permission: DECORPERM_NA_WALL,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_POSTER,
  price: 1000,
  description: 'DecorDesc_BLUE_POSTER',
  tiles: 'DecorGfx_BLUE_POSTER',
};
gDecorations[DECOR_CUTE_POSTER] = {
  id: DECOR_CUTE_POSTER,
  name: 'JOLI POSTER',
  permission: DECORPERM_NA_WALL,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_POSTER,
  price: 1000,
  description: 'DecorDesc_CUTE_POSTER',
  tiles: 'DecorGfx_CUTE_POSTER',
};
gDecorations[DECOR_PIKA_POSTER] = {
  id: DECOR_PIKA_POSTER,
  name: 'POSTER PIKA',
  permission: DECORPERM_NA_WALL,
  shape: DECORSHAPE_2x1,
  category: DECORCAT_POSTER,
  price: 1500,
  description: 'DecorDesc_PIKA_POSTER',
  tiles: 'DecorGfx_PIKA_POSTER',
};
gDecorations[DECOR_LONG_POSTER] = {
  id: DECOR_LONG_POSTER,
  name: 'GRAND POSTER',
  permission: DECORPERM_NA_WALL,
  shape: DECORSHAPE_2x1,
  category: DECORCAT_POSTER,
  price: 1500,
  description: 'DecorDesc_LONG_POSTER',
  tiles: 'DecorGfx_LONG_POSTER',
};
gDecorations[DECOR_SEA_POSTER] = {
  id: DECOR_SEA_POSTER,
  name: 'POSTER OCEAN',
  permission: DECORPERM_NA_WALL,
  shape: DECORSHAPE_2x1,
  category: DECORCAT_POSTER,
  price: 1500,
  description: 'DecorDesc_SEA_POSTER',
  tiles: 'DecorGfx_SEA_POSTER',
};
gDecorations[DECOR_SKY_POSTER] = {
  id: DECOR_SKY_POSTER,
  name: 'POSTER CIEL',
  permission: DECORPERM_NA_WALL,
  shape: DECORSHAPE_2x1,
  category: DECORCAT_POSTER,
  price: 1500,
  description: 'DecorDesc_SKY_POSTER',
  tiles: 'DecorGfx_SKY_POSTER',
};
gDecorations[DECOR_KISS_POSTER] = {
  id: DECOR_KISS_POSTER,
  name: 'POSTER BAISER',
  permission: DECORPERM_NA_WALL,
  shape: DECORSHAPE_2x1,
  category: DECORCAT_POSTER,
  price: 1500,
  description: 'DecorDesc_KISS_POSTER',
  tiles: 'DecorGfx_KISS_POSTER',
};
gDecorations[DECOR_PICHU_DOLL] = {
  id: DECOR_PICHU_DOLL,
  name: 'POUPEE PICHU',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_PICHU_DOLL',
  tiles: 'DecorGfx_PICHU_DOLL',
};
gDecorations[DECOR_PIKACHU_DOLL] = {
  id: DECOR_PIKACHU_DOLL,
  name: 'POUPEE PIKACHU',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_PIKACHU_DOLL',
  tiles: 'DecorGfx_PIKACHU_DOLL',
};
gDecorations[DECOR_MARILL_DOLL] = {
  id: DECOR_MARILL_DOLL,
  name: 'POUPEE MARILL',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_MARILL_DOLL',
  tiles: 'DecorGfx_MARILL_DOLL',
};
gDecorations[DECOR_TOGEPI_DOLL] = {
  id: DECOR_TOGEPI_DOLL,
  name: 'POUPEE TOGEPI',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_TOGEPI_DOLL',
  tiles: 'DecorGfx_TOGEPI_DOLL',
};
gDecorations[DECOR_CYNDAQUIL_DOLL] = {
  id: DECOR_CYNDAQUIL_DOLL,
  name: 'POUP.HERICENDRE',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_CYNDAQUIL_DOLL',
  tiles: 'DecorGfx_CYNDAQUIL_DOLL',
};
gDecorations[DECOR_CHIKORITA_DOLL] = {
  id: DECOR_CHIKORITA_DOLL,
  name: 'POUP. GERMIGNON',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_CHIKORITA_DOLL',
  tiles: 'DecorGfx_CHIKORITA_DOLL',
};
gDecorations[DECOR_TOTODILE_DOLL] = {
  id: DECOR_TOTODILE_DOLL,
  name: 'POUPEE KAIMINUS',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_TOTODILE_DOLL',
  tiles: 'DecorGfx_TOTODILE_DOLL',
};
gDecorations[DECOR_JIGGLYPUFF_DOLL] = {
  id: DECOR_JIGGLYPUFF_DOLL,
  name: 'POUP. RONDOUDOU',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_JIGGLYPUFF_DOLL',
  tiles: 'DecorGfx_JIGGLYPUFF_DOLL',
};
gDecorations[DECOR_MEOWTH_DOLL] = {
  id: DECOR_MEOWTH_DOLL,
  name: 'POUPEE MIAOUSS',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_MEOWTH_DOLL',
  tiles: 'DecorGfx_MEOWTH_DOLL',
};
gDecorations[DECOR_CLEFAIRY_DOLL] = {
  id: DECOR_CLEFAIRY_DOLL,
  name: 'POUPEE MELOFEE',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_CLEFAIRY_DOLL',
  tiles: 'DecorGfx_CLEFAIRY_DOLL',
};
gDecorations[DECOR_DITTO_DOLL] = {
  id: DECOR_DITTO_DOLL,
  name: 'POUP. METAMORPH',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_DITTO_DOLL',
  tiles: 'DecorGfx_DITTO_DOLL',
};
gDecorations[DECOR_SMOOCHUM_DOLL] = {
  id: DECOR_SMOOCHUM_DOLL,
  name: 'POUPEE LIPPOUTI',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_SMOOCHUM_DOLL',
  tiles: 'DecorGfx_SMOOCHUM_DOLL',
};
gDecorations[DECOR_TREECKO_DOLL] = {
  id: DECOR_TREECKO_DOLL,
  name: 'POUPEE ARCKO',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_TREECKO_DOLL',
  tiles: 'DecorGfx_TREECKO_DOLL',
};
gDecorations[DECOR_TORCHIC_DOLL] = {
  id: DECOR_TORCHIC_DOLL,
  name: 'POUP.POUSSIFEU',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_TORCHIC_DOLL',
  tiles: 'DecorGfx_TORCHIC_DOLL',
};
gDecorations[DECOR_MUDKIP_DOLL] = {
  id: DECOR_MUDKIP_DOLL,
  name: 'POUPEE GOBOU',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_MUDKIP_DOLL',
  tiles: 'DecorGfx_MUDKIP_DOLL',
};
gDecorations[DECOR_DUSKULL_DOLL] = {
  id: DECOR_DUSKULL_DOLL,
  name: 'POUPEE SKELENOX',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_DUSKULL_DOLL',
  tiles: 'DecorGfx_DUSKULL_DOLL',
};
gDecorations[DECOR_WYNAUT_DOLL] = {
  id: DECOR_WYNAUT_DOLL,
  name: 'POUPEE OKEOKE',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_WYNAUT_DOLL',
  tiles: 'DecorGfx_WYNAUT_DOLL',
};
gDecorations[DECOR_BALTOY_DOLL] = {
  id: DECOR_BALTOY_DOLL,
  name: 'POUPEE BALBUTO',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_BALTOY_DOLL',
  tiles: 'DecorGfx_BALTOY_DOLL',
};
gDecorations[DECOR_KECLEON_DOLL] = {
  id: DECOR_KECLEON_DOLL,
  name: 'POUPEE KECLEON',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_KECLEON_DOLL',
  tiles: 'DecorGfx_KECLEON_DOLL',
};
gDecorations[DECOR_AZURILL_DOLL] = {
  id: DECOR_AZURILL_DOLL,
  name: 'POUPEE AZURILL',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_AZURILL_DOLL',
  tiles: 'DecorGfx_AZURILL_DOLL',
};
gDecorations[DECOR_SKITTY_DOLL] = {
  id: DECOR_SKITTY_DOLL,
  name: 'POUPEE SKITTY',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_SKITTY_DOLL',
  tiles: 'DecorGfx_SKITTY_DOLL',
};
gDecorations[DECOR_SWABLU_DOLL] = {
  id: DECOR_SWABLU_DOLL,
  name: 'POUPEE TYLTON',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_SWABLU_DOLL',
  tiles: 'DecorGfx_SWABLU_DOLL',
};
gDecorations[DECOR_GULPIN_DOLL] = {
  id: DECOR_GULPIN_DOLL,
  name: 'POUPEE GLOUPTI',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_GULPIN_DOLL',
  tiles: 'DecorGfx_GULPIN_DOLL',
};
gDecorations[DECOR_LOTAD_DOLL] = {
  id: DECOR_LOTAD_DOLL,
  name: 'POUPEE NENUPIOT',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_LOTAD_DOLL',
  tiles: 'DecorGfx_LOTAD_DOLL',
};
gDecorations[DECOR_SEEDOT_DOLL] = {
  id: DECOR_SEEDOT_DOLL,
  name: 'POUP.GRAINIPIOT',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_DOLL,
  price: 3000,
  description: 'DecorDesc_SEEDOT_DOLL',
  tiles: 'DecorGfx_SEEDOT_DOLL',
};
gDecorations[DECOR_PIKA_CUSHION] = {
  id: DECOR_PIKA_CUSHION,
  name: 'COUSSIN PIKACHU',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_CUSHION,
  price: 2000,
  description: 'DecorDesc_PIKA_CUSHION',
  tiles: 'DecorGfx_PIKA_CUSHION',
};
gDecorations[DECOR_ROUND_CUSHION] = {
  id: DECOR_ROUND_CUSHION,
  name: 'COUSSIN ROND',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_CUSHION,
  price: 2000,
  description: 'DecorDesc_ROUND_CUSHION',
  tiles: 'DecorGfx_ROUND_CUSHION',
};
gDecorations[DECOR_KISS_CUSHION] = {
  id: DECOR_KISS_CUSHION,
  name: 'COUSSIN BAISER',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_CUSHION,
  price: 2000,
  description: 'DecorDesc_KISS_CUSHION',
  tiles: 'DecorGfx_KISS_CUSHION',
};
gDecorations[DECOR_ZIGZAG_CUSHION] = {
  id: DECOR_ZIGZAG_CUSHION,
  name: 'COUSSIN ZIGZAG',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_CUSHION,
  price: 2000,
  description: 'DecorDesc_ZIGZAG_CUSHION',
  tiles: 'DecorGfx_ZIGZAG_CUSHION',
};
gDecorations[DECOR_SPIN_CUSHION] = {
  id: DECOR_SPIN_CUSHION,
  name: 'COUSSIN SPIRALE',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_CUSHION,
  price: 2000,
  description: 'DecorDesc_SPIN_CUSHION',
  tiles: 'DecorGfx_SPIN_CUSHION',
};
gDecorations[DECOR_DIAMOND_CUSHION] = {
  id: DECOR_DIAMOND_CUSHION,
  name: 'COUSSIN DIAMANT',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_CUSHION,
  price: 2000,
  description: 'DecorDesc_DIAMOND_CUSHION',
  tiles: 'DecorGfx_DIAMOND_CUSHION',
};
gDecorations[DECOR_BALL_CUSHION] = {
  id: DECOR_BALL_CUSHION,
  name: 'COUSSIN BALL',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_CUSHION,
  price: 2000,
  description: 'DecorDesc_BALL_CUSHION',
  tiles: 'DecorGfx_BALL_CUSHION',
};
gDecorations[DECOR_GRASS_CUSHION] = {
  id: DECOR_GRASS_CUSHION,
  name: 'COUSSIN PLANTE',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_CUSHION,
  price: 2000,
  description: 'DecorDesc_GRASS_CUSHION',
  tiles: 'DecorGfx_GRASS_CUSHION',
};
gDecorations[DECOR_FIRE_CUSHION] = {
  id: DECOR_FIRE_CUSHION,
  name: 'COUSSIN FEU',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_CUSHION,
  price: 2000,
  description: 'DecorDesc_FIRE_CUSHION',
  tiles: 'DecorGfx_FIRE_CUSHION',
};
gDecorations[DECOR_WATER_CUSHION] = {
  id: DECOR_WATER_CUSHION,
  name: 'COUSSIN EAU',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x1,
  category: DECORCAT_CUSHION,
  price: 2000,
  description: 'DecorDesc_WATER_CUSHION',
  tiles: 'DecorGfx_WATER_CUSHION',
};
gDecorations[DECOR_SNORLAX_DOLL] = {
  id: DECOR_SNORLAX_DOLL,
  name: 'POUPEE RONFLEX',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_DOLL,
  price: 10000,
  description: 'DecorDesc_SNORLAX_DOLL',
  tiles: 'DecorGfx_SNORLAX_DOLL',
};
gDecorations[DECOR_RHYDON_DOLL] = {
  id: DECOR_RHYDON_DOLL,
  name: 'POUP.RHINOFEROS',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_DOLL,
  price: 10000,
  description: 'DecorDesc_RHYDON_DOLL',
  tiles: 'DecorGfx_RHYDON_DOLL',
};
gDecorations[DECOR_LAPRAS_DOLL] = {
  id: DECOR_LAPRAS_DOLL,
  name: 'POUPEE LOKHLASS',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_DOLL,
  price: 10000,
  description: 'DecorDesc_LAPRAS_DOLL',
  tiles: 'DecorGfx_LAPRAS_DOLL',
};
gDecorations[DECOR_VENUSAUR_DOLL] = {
  id: DECOR_VENUSAUR_DOLL,
  name: 'POUP.FLORIZARRE',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_DOLL,
  price: 10000,
  description: 'DecorDesc_VENUSAUR_DOLL',
  tiles: 'DecorGfx_VENUSAUR_DOLL',
};
gDecorations[DECOR_CHARIZARD_DOLL] = {
  id: DECOR_CHARIZARD_DOLL,
  name: 'POUP. DRACAUFEU',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_DOLL,
  price: 10000,
  description: 'DecorDesc_CHARIZARD_DOLL',
  tiles: 'DecorGfx_CHARIZARD_DOLL',
};
gDecorations[DECOR_BLASTOISE_DOLL] = {
  id: DECOR_BLASTOISE_DOLL,
  name: 'POUPEE TORTANK',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_DOLL,
  price: 10000,
  description: 'DecorDesc_BLASTOISE_DOLL',
  tiles: 'DecorGfx_BLASTOISE_DOLL',
};
gDecorations[DECOR_WAILMER_DOLL] = {
  id: DECOR_WAILMER_DOLL,
  name: 'POUPEE WAILMER',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_DOLL,
  price: 10000,
  description: 'DecorDesc_WAILMER_DOLL',
  tiles: 'DecorGfx_WAILMER_DOLL',
};
gDecorations[DECOR_REGIROCK_DOLL] = {
  id: DECOR_REGIROCK_DOLL,
  name: 'POUPEE REGIROCK',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_DOLL,
  price: 10000,
  description: 'DecorDesc_REGIROCK_DOLL',
  tiles: 'DecorGfx_REGIROCK_DOLL',
};
gDecorations[DECOR_REGICE_DOLL] = {
  id: DECOR_REGICE_DOLL,
  name: 'POUPEE REGICE',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_DOLL,
  price: 10000,
  description: 'DecorDesc_REGICE_DOLL',
  tiles: 'DecorGfx_REGICE_DOLL',
};
gDecorations[DECOR_REGISTEEL_DOLL] = {
  id: DECOR_REGISTEEL_DOLL,
  name: 'POUP. REGISTEEL',
  permission: DECORPERM_SPRITE,
  shape: DECORSHAPE_1x2,
  category: DECORCAT_DOLL,
  price: 10000,
  description: 'DecorDesc_REGISTEEL_DOLL',
  tiles: 'DecorGfx_REGISTEEL_DOLL',
};
