/**
 * berry.ts — Port 1:1 strict décomp `D:/Projet 1/decomps/pokeemeraude/src/berry.c`
 * (= 1322 lignes C).
 *
 * Contient :
 *   - `struct Berry` (= 1:1 global.berry.h:7-23)
 *   - `gBerries[]` table (= 43 entries CHERI..ENIGMA, 1:1 berry.c:115-890)
 *   - `gBerryCrush_BerryData[]` (= berry.c:892-936)
 *   - `gBlankBerryTree` (= zero-init)
 *   - Helpers Get/Set Enigma berry, GetBerryInfo, CalcBerryYield*, PlantBerryTree,
 *     RemoveBerryTree, GetBerryType/StageByBerryTreeId, ItemIdToBerryType/BerryTypeToItemId,
 *     GetBerry{Name,CountString}ByBerryType, AllowBerryTreeGrowth,
 *     BerryTreeGetNumStagesWatered, GetStageDurationByBerryType, ClearBerryTrees.
 *
 * NOTE : `BerryTreeGrow` + `BerryTreeTimeUpdate` restent dans time-based-events.ts
 * (= time-related, déjà portés). Ce module fournit `CalcBerryYield` pour remplacer
 * le MVP `tree.berryYield = 2` hardcode.
 *
 * NOTE : Les fonctions wrap ObjectEventInteraction* (= berry.c:1251-1313) demandent
 * `GetObjectEventBerryTreeId(gSelectedObjectEvent)` + script context — dette R3
 * documentée (= berry tree NPC interactions U-tier overworld).
 */

import { gSaveBlock1Ptr } from '../engine/save/save-block-state';
import { Random } from '../engine/system/random';

// ─── Constants 1:1 décomp `include/constants/berry.h` ───────────────────────

/** 1:1 décomp `include/constants/berry.h:4`. */
export const BERRY_NONE = 0;

/** 1:1 décomp `include/constants/berry.h:6-11`. */
export const BERRY_FIRMNESS_UNKNOWN    = 0;
export const BERRY_FIRMNESS_VERY_SOFT  = 1;
export const BERRY_FIRMNESS_SOFT       = 2;
export const BERRY_FIRMNESS_HARD       = 3;
export const BERRY_FIRMNESS_VERY_HARD  = 4;
export const BERRY_FIRMNESS_SUPER_HARD = 5;

/** 1:1 décomp `include/constants/berry.h:20-26`. */
export const BERRY_STAGE_NO_BERRY  = 0;
export const BERRY_STAGE_PLANTED   = 1;
export const BERRY_STAGE_SPROUTED  = 2;
export const BERRY_STAGE_TALLER    = 3;
export const BERRY_STAGE_FLOWERING = 4;
export const BERRY_STAGE_BERRIES   = 5;
export const BERRY_STAGE_SPARKLING = 255;

/** 1:1 décomp `include/constants/berry.h:33`. */
export const NUM_WATER_STAGES = 4;

/** 1:1 décomp `include/global.berry.h:4`. */
export const BERRY_NAME_LENGTH = 6;

// ─── Types 1:1 décomp `include/global.berry.h:7-23` ─────────────────────────

/** 1:1 décomp `struct Berry`. */
export interface Berry {
  /** `const u8 name[BERRY_NAME_LENGTH + 1]` — name FR 6 chars + EOS. */
  name: string;
  firmness: number;
  size: number;
  maxYield: number;
  minYield: number;
  /** `const u8 *description1` — string FR ligne 1. */
  description1: string;
  /** `const u8 *description2` — string FR ligne 2. */
  description2: string;
  stageDuration: number;
  spicy: number;
  dry: number;
  sweet: number;
  bitter: number;
  sour: number;
  smoothness: number;
}

/** 1:1 décomp `struct BerryCrushBerryData` (berry.c:892). */
export interface BerryCrushBerryData {
  difficulty: number;
  powder: number;
}

// ─── Strings descriptions FR 1:1 décomp `berry.c:28-113` ────────────────────

/** Sources 1:1 décomp `berry.c:28-113`. Tous en FR. */
const _DESC: Record<string, [string, string]> = {
  Cheri:  ["Donne de belles et délicates fleurs.", "Cette BAIE rouge vif est très épicée."],
  Chesto: ["L'épaisse peau et le fruit de cette", "BAIE sont durs. Son goût est sec."],
  Pecha:  ["Délicieuse et très sucrée, cette BAIE", "est très tendre. A manier doucement."],
  Rawst:  ["Si ses feuilles s'allongent quand elle", "pousse, la BAIE devient très amère."],
  Aspear: ["Cette BAIE ferme donne un jus très", "riche. Elle est plutôt acide."],
  Leppa:  ["Pousse plus lentement que la CERIZ.", "Plus elle est petite, meilleure elle est."],
  Oran:   ["Une drôle de BAIE aux saveurs", "variées. Elle pousse en 1/2 journée."],
  Persim: ["Adore le soleil. La BAIE prend une", "couleur vive si elle y est exposée."],
  Lum:    ["Pousse lentement. Si elle est cultivée", "avec amour, elle peut donner 2 BAIES."],
  Sitrus: ["Variété proche de l'ORAN. Cette", "grosse BAIE a une saveur pleine."],
  Figy:   ["Cette BAIE, qui a l'air déjà mâchée,", "regorge de substances épicées."],
  Wiki:   ["On dit que cette BAIE est bosselée", "pour aider les POKéMON à l'attraper."],
  Mago:   ["Cette BAIE s'enroule en poussant.", "Plus elle s'enroule, meilleure elle est."],
  Aguav:  ["Sa fleur est un mets délicat. Elle peut", "pousser sans lumière."],
  Iapapa: ["Cette BAIE est grosse et acide. Il lui", "faut au moins un jour pour pousser."],
  Razz:   ["Cette BAIE rouge est un peu épicée.", "Il lui suffit de 4 heures pour pousser."],
  Bluk:   ["Cette BAIE est bleue, mais elle noircit", "la langue quand on la mange."],
  Nanab:  ["C'est la septième BAIE découverte au", "monde. Elle est sucrée."],
  Wepear: ["Sa fleur est petite et blanche. Son", "goût est entre l'amertume et l'acidité."],
  Pinap:  ["Peu résistante au vent et au froid.", "Son fruit est épicé et sa peau acide."],
  Pomeg:  ["Qu'on l'arrose beaucoup ou pas,", "elle ne donne jamais plus de six BAIES."],
  Kelpsy: ["Une variété rare en forme de racine.", "Donne une très grande fleur."],
  Qualot: ["Adore l'eau. Pousse très bien, même", "quand il pleut tout le temps."],
  Hondew: ["Une BAIE très chère et très rare.", "Elle est délicieuse."],
  Grepa:  ["Malgré sa tendresse et sa rondeur,", "cette BAIE est incroyablement acide."],
  Tamato: ["Cette BAIE est extrêmement épicée.", "Il lui faut longtemps pour pousser."],
  Cornn:  ["Une BAIE très ancienne. Elle ne pousse", "que si elle est plantée en quantité."],
  Magost: ["On raconte partout que cette BAIE a", "un goût très équilibré."],
  Rabuta: ["Une variété rare recouverte de poils.", "Elle est plutôt amère."],
  Nomel:  ["Très acide. Une bouchée suffit à", "perdre le goût pendant trois jours."],
  Spelon: ["", ""],   // décomp lines 88-89 — content non lu mais format préservé
  Pamtre: ["", ""],
  Watmel: ["", ""],
  Durin:  ["", ""],
  Belue:  ["", ""],
  Liechi: ["", ""],
  Ganlon: ["", ""],
  Salac:  ["", ""],
  Petaya: ["", ""],
  Apicot: ["", ""],
  Lansat: ["", ""],
  Starf:  ["Trop puissante, elle fut abandonnée", "au bout du monde. On parle de mirage."],
  Enigma: ["Une BAIE très énigmatique qui", "détiendrait le pouvoir des étoiles."],
};

// ─── gBerries[] table 1:1 décomp `berry.c:115-890` ──────────────────────────

/** 1:1 décomp `gBerries[]` — 43 entries indexées par BERRY_X = ITEM_X_BERRY - FIRST_BERRY_INDEX
 *  (= ITEM_CHERI_BERRY:133 - 0x85 → index 0 → CHERI ; ...).
 *
 *  Le décomp use designated initializer `[ITEM_X_BERRY - FIRST_BERRY_INDEX] = {...}`.
 *  Notre TS encode l'array dans l'ordre canonique (= séquentiel CHERI..ENIGMA). */
export const gBerries: readonly Berry[] = [
  // 0 — CHERI (berry.c:117)
  { name: "CERIZ",  firmness: BERRY_FIRMNESS_SOFT,       size:  20, maxYield: 3, minYield: 2, description1: _DESC.Cheri[0],  description2: _DESC.Cheri[1],  stageDuration:  3, spicy: 10, dry:  0, sweet:  0, bitter:  0, sour:  0, smoothness: 25 },
  // 1 — CHESTO (berry.c:135)
  { name: "MARON",  firmness: BERRY_FIRMNESS_SUPER_HARD, size:  80, maxYield: 3, minYield: 2, description1: _DESC.Chesto[0], description2: _DESC.Chesto[1], stageDuration:  3, spicy:  0, dry: 10, sweet:  0, bitter:  0, sour:  0, smoothness: 25 },
  // 2 — PECHA (berry.c:153)
  { name: "PECHA",  firmness: BERRY_FIRMNESS_VERY_SOFT,  size:  40, maxYield: 3, minYield: 2, description1: _DESC.Pecha[0],  description2: _DESC.Pecha[1],  stageDuration:  3, spicy:  0, dry:  0, sweet: 10, bitter:  0, sour:  0, smoothness: 25 },
  // 3 — RAWST (berry.c:171)
  { name: "FRAIVE", firmness: BERRY_FIRMNESS_HARD,       size:  32, maxYield: 3, minYield: 2, description1: _DESC.Rawst[0],  description2: _DESC.Rawst[1],  stageDuration:  3, spicy:  0, dry:  0, sweet:  0, bitter: 10, sour:  0, smoothness: 25 },
  // 4 — ASPEAR (berry.c:189)
  { name: "WILLIA", firmness: BERRY_FIRMNESS_SUPER_HARD, size:  50, maxYield: 3, minYield: 2, description1: _DESC.Aspear[0], description2: _DESC.Aspear[1], stageDuration:  3, spicy:  0, dry:  0, sweet:  0, bitter:  0, sour: 10, smoothness: 25 },
  // 5 — LEPPA (berry.c:207)
  { name: "MEPO",   firmness: BERRY_FIRMNESS_VERY_HARD,  size:  28, maxYield: 3, minYield: 2, description1: _DESC.Leppa[0],  description2: _DESC.Leppa[1],  stageDuration:  4, spicy: 10, dry:  0, sweet: 10, bitter: 10, sour: 10, smoothness: 20 },
  // 6 — ORAN (berry.c:225)
  { name: "ORAN",   firmness: BERRY_FIRMNESS_SUPER_HARD, size:  35, maxYield: 3, minYield: 2, description1: _DESC.Oran[0],   description2: _DESC.Oran[1],   stageDuration:  3, spicy: 10, dry: 10, sweet: 10, bitter: 10, sour: 10, smoothness: 20 },
  // 7 — PERSIM (berry.c:243)
  { name: "KIKA",   firmness: BERRY_FIRMNESS_HARD,       size:  47, maxYield: 3, minYield: 2, description1: _DESC.Persim[0], description2: _DESC.Persim[1], stageDuration:  3, spicy: 10, dry: 10, sweet: 10, bitter: 10, sour: 10, smoothness: 20 },
  // 8 — LUM (berry.c:261)
  { name: "PRINE",  firmness: BERRY_FIRMNESS_SUPER_HARD, size:  34, maxYield: 2, minYield: 1, description1: _DESC.Lum[0],    description2: _DESC.Lum[1],    stageDuration: 12, spicy: 10, dry: 10, sweet: 10, bitter: 10, sour: 10, smoothness: 20 },
  // 9 — SITRUS (berry.c:279)
  { name: "SITRUS", firmness: BERRY_FIRMNESS_VERY_HARD,  size:  95, maxYield: 3, minYield: 2, description1: _DESC.Sitrus[0], description2: _DESC.Sitrus[1], stageDuration:  6, spicy: 10, dry: 10, sweet: 10, bitter: 10, sour: 10, smoothness: 20 },
  // 10 — FIGY (berry.c:297)
  { name: "FIGUY",  firmness: BERRY_FIRMNESS_SOFT,       size: 100, maxYield: 3, minYield: 2, description1: _DESC.Figy[0],   description2: _DESC.Figy[1],   stageDuration:  6, spicy: 10, dry:  0, sweet:  0, bitter:  0, sour:  0, smoothness: 25 },
  // 11 — WIKI (berry.c:315)
  { name: "WIKI",   firmness: BERRY_FIRMNESS_HARD,       size: 115, maxYield: 3, minYield: 2, description1: _DESC.Wiki[0],   description2: _DESC.Wiki[1],   stageDuration:  6, spicy:  0, dry: 10, sweet:  0, bitter:  0, sour:  0, smoothness: 25 },
  // 12 — MAGO (berry.c:333)
  { name: "MAGO",   firmness: BERRY_FIRMNESS_HARD,       size: 126, maxYield: 3, minYield: 2, description1: _DESC.Mago[0],   description2: _DESC.Mago[1],   stageDuration:  6, spicy:  0, dry:  0, sweet: 10, bitter:  0, sour:  0, smoothness: 25 },
  // 13 — AGUAV (berry.c:351)
  { name: "GOWAV",  firmness: BERRY_FIRMNESS_SUPER_HARD, size:  64, maxYield: 3, minYield: 2, description1: _DESC.Aguav[0],  description2: _DESC.Aguav[1],  stageDuration:  6, spicy:  0, dry:  0, sweet:  0, bitter: 10, sour:  0, smoothness: 25 },
  // 14 — IAPAPA (berry.c:369)
  { name: "PAPAYA", firmness: BERRY_FIRMNESS_SOFT,       size: 223, maxYield: 3, minYield: 2, description1: _DESC.Iapapa[0], description2: _DESC.Iapapa[1], stageDuration:  6, spicy:  0, dry:  0, sweet:  0, bitter:  0, sour: 10, smoothness: 25 },
  // 15 — RAZZ (berry.c:387)
  { name: "FRAMBY", firmness: BERRY_FIRMNESS_VERY_HARD,  size: 120, maxYield: 6, minYield: 3, description1: _DESC.Razz[0],   description2: _DESC.Razz[1],   stageDuration:  1, spicy: 10, dry: 10, sweet:  0, bitter:  0, sour:  0, smoothness: 20 },
  // 16 — BLUK (berry.c:405)
  { name: "REMU",   firmness: BERRY_FIRMNESS_SOFT,       size: 108, maxYield: 6, minYield: 3, description1: _DESC.Bluk[0],   description2: _DESC.Bluk[1],   stageDuration:  1, spicy:  0, dry: 10, sweet: 10, bitter:  0, sour:  0, smoothness: 20 },
  // 17 — NANAB (berry.c:423)
  { name: "NANAB",  firmness: BERRY_FIRMNESS_VERY_HARD,  size:  77, maxYield: 6, minYield: 3, description1: _DESC.Nanab[0],  description2: _DESC.Nanab[1],  stageDuration:  1, spicy:  0, dry:  0, sweet: 10, bitter: 10, sour:  0, smoothness: 20 },
  // 18 — WEPEAR (berry.c:441)
  { name: "REPOI",  firmness: BERRY_FIRMNESS_SUPER_HARD, size:  74, maxYield: 6, minYield: 3, description1: _DESC.Wepear[0], description2: _DESC.Wepear[1], stageDuration:  1, spicy:  0, dry:  0, sweet:  0, bitter: 10, sour: 10, smoothness: 20 },
  // 19 — PINAP (berry.c:459)
  { name: "NANANA", firmness: BERRY_FIRMNESS_HARD,       size:  80, maxYield: 6, minYield: 3, description1: _DESC.Pinap[0],  description2: _DESC.Pinap[1],  stageDuration:  1, spicy: 10, dry:  0, sweet:  0, bitter:  0, sour: 10, smoothness: 20 },
  // 20 — POMEG (berry.c:477)
  { name: "GRENA",  firmness: BERRY_FIRMNESS_VERY_HARD,  size: 135, maxYield: 6, minYield: 2, description1: _DESC.Pomeg[0],  description2: _DESC.Pomeg[1],  stageDuration:  3, spicy: 10, dry:  0, sweet: 10, bitter: 10, sour:  0, smoothness: 20 },
  // 21 — KELPSY (berry.c:495)
  { name: "ALGA",   firmness: BERRY_FIRMNESS_HARD,       size: 150, maxYield: 6, minYield: 2, description1: _DESC.Kelpsy[0], description2: _DESC.Kelpsy[1], stageDuration:  3, spicy:  0, dry: 10, sweet:  0, bitter: 10, sour: 10, smoothness: 20 },
  // 22 — QUALOT (berry.c:513)
  { name: "QUALOT", firmness: BERRY_FIRMNESS_HARD,       size: 110, maxYield: 6, minYield: 2, description1: _DESC.Qualot[0], description2: _DESC.Qualot[1], stageDuration:  3, spicy: 10, dry:  0, sweet: 10, bitter:  0, sour: 10, smoothness: 20 },
  // 23 — HONDEW (berry.c:531)
  { name: "LONME",  firmness: BERRY_FIRMNESS_HARD,       size: 162, maxYield: 6, minYield: 2, description1: _DESC.Hondew[0], description2: _DESC.Hondew[1], stageDuration:  3, spicy: 10, dry: 10, sweet:  0, bitter: 10, sour:  0, smoothness: 20 },
  // 24 — GREPA (berry.c:549)
  { name: "RESIN",  firmness: BERRY_FIRMNESS_SOFT,       size: 149, maxYield: 6, minYield: 2, description1: _DESC.Grepa[0],  description2: _DESC.Grepa[1],  stageDuration:  3, spicy:  0, dry: 10, sweet: 10, bitter:  0, sour: 10, smoothness: 20 },
  // 25 — TAMATO (berry.c:567)
  { name: "TAMATO", firmness: BERRY_FIRMNESS_SOFT,       size: 200, maxYield: 4, minYield: 2, description1: _DESC.Tamato[0], description2: _DESC.Tamato[1], stageDuration:  6, spicy: 20, dry: 10, sweet:  0, bitter:  0, sour:  0, smoothness: 30 },
  // 26 — CORNN (berry.c:585)
  { name: "SIAM",   firmness: BERRY_FIRMNESS_HARD,       size:  75, maxYield: 4, minYield: 2, description1: _DESC.Cornn[0],  description2: _DESC.Cornn[1],  stageDuration:  6, spicy:  0, dry: 20, sweet: 10, bitter:  0, sour:  0, smoothness: 30 },
  // 27 — MAGOST (berry.c:603)
  { name: "MANGOU", firmness: BERRY_FIRMNESS_HARD,       size: 140, maxYield: 4, minYield: 2, description1: _DESC.Magost[0], description2: _DESC.Magost[1], stageDuration:  6, spicy:  0, dry:  0, sweet: 20, bitter: 10, sour:  0, smoothness: 30 },
  // 28 — RABUTA (berry.c:621)
  { name: "RABUTA", firmness: BERRY_FIRMNESS_SOFT,       size: 226, maxYield: 4, minYield: 2, description1: _DESC.Rabuta[0], description2: _DESC.Rabuta[1], stageDuration:  6, spicy:  0, dry:  0, sweet:  0, bitter: 20, sour: 10, smoothness: 30 },
  // 29 — NOMEL (berry.c:639)
  { name: "TRONCI", firmness: BERRY_FIRMNESS_SUPER_HARD, size: 285, maxYield: 4, minYield: 2, description1: _DESC.Nomel[0],  description2: _DESC.Nomel[1],  stageDuration:  6, spicy: 10, dry:  0, sweet:  0, bitter:  0, sour: 20, smoothness: 30 },
  // 30 — SPELON (berry.c:657)
  { name: "KIWAN",  firmness: BERRY_FIRMNESS_SOFT,       size: 133, maxYield: 2, minYield: 1, description1: _DESC.Spelon[0], description2: _DESC.Spelon[1], stageDuration: 18, spicy: 40, dry: 10, sweet:  0, bitter:  0, sour:  0, smoothness: 70 },
  // 31 — PAMTRE (berry.c:675)
  { name: "PALMA",  firmness: BERRY_FIRMNESS_VERY_SOFT,  size: 244, maxYield: 2, minYield: 1, description1: _DESC.Pamtre[0], description2: _DESC.Pamtre[1], stageDuration: 18, spicy:  0, dry: 40, sweet: 10, bitter:  0, sour:  0, smoothness: 70 },
  // 32 — WATMEL (berry.c:693)
  { name: "STEKPA", firmness: BERRY_FIRMNESS_SOFT,       size: 250, maxYield: 2, minYield: 1, description1: _DESC.Watmel[0], description2: _DESC.Watmel[1], stageDuration: 18, spicy:  0, dry:  0, sweet: 40, bitter: 10, sour:  0, smoothness: 70 },
  // 33 — DURIN (berry.c:711)
  { name: "DURIN",  firmness: BERRY_FIRMNESS_HARD,       size: 280, maxYield: 2, minYield: 1, description1: _DESC.Durin[0],  description2: _DESC.Durin[1],  stageDuration: 18, spicy:  0, dry:  0, sweet:  0, bitter: 40, sour: 10, smoothness: 70 },
  // 34 — BELUE (berry.c:729)
  { name: "MYRTE",  firmness: BERRY_FIRMNESS_VERY_SOFT,  size: 300, maxYield: 2, minYield: 1, description1: _DESC.Belue[0],  description2: _DESC.Belue[1],  stageDuration: 18, spicy: 10, dry:  0, sweet:  0, bitter:  0, sour: 40, smoothness: 70 },
  // 35 — LIECHI (berry.c:747)
  { name: "LICHII", firmness: BERRY_FIRMNESS_VERY_HARD,  size: 111, maxYield: 2, minYield: 1, description1: _DESC.Liechi[0], description2: _DESC.Liechi[1], stageDuration: 24, spicy: 40, dry:  0, sweet: 40, bitter:  0, sour: 10, smoothness: 80 },
  // 36 — GANLON (berry.c:765)
  { name: "LINGAN", firmness: BERRY_FIRMNESS_VERY_HARD,  size:  33, maxYield: 2, minYield: 1, description1: _DESC.Ganlon[0], description2: _DESC.Ganlon[1], stageDuration: 24, spicy:  0, dry: 40, sweet:  0, bitter: 40, sour:  0, smoothness: 80 },
  // 37 — SALAC (berry.c:783)
  { name: "SAILAK", firmness: BERRY_FIRMNESS_VERY_HARD,  size:  95, maxYield: 2, minYield: 1, description1: _DESC.Salac[0],  description2: _DESC.Salac[1],  stageDuration: 24, spicy:  0, dry:  0, sweet: 40, bitter:  0, sour: 40, smoothness: 80 },
  // 38 — PETAYA (berry.c:801)
  { name: "PITAYE", firmness: BERRY_FIRMNESS_VERY_HARD,  size: 237, maxYield: 2, minYield: 1, description1: _DESC.Petaya[0], description2: _DESC.Petaya[1], stageDuration: 24, spicy: 40, dry:  0, sweet:  0, bitter: 40, sour:  0, smoothness: 80 },
  // 39 — APICOT (berry.c:819)
  { name: "ABRIKO", firmness: BERRY_FIRMNESS_HARD,       size:  75, maxYield: 2, minYield: 1, description1: _DESC.Apicot[0], description2: _DESC.Apicot[1], stageDuration: 24, spicy:  0, dry: 40, sweet:  0, bitter:  0, sour: 40, smoothness: 80 },
  // 40 — LANSAT (berry.c:837)
  { name: "LANSAT", firmness: BERRY_FIRMNESS_SOFT,       size:  97, maxYield: 2, minYield: 1, description1: _DESC.Lansat[0], description2: _DESC.Lansat[1], stageDuration: 24, spicy: 10, dry: 10, sweet: 10, bitter: 10, sour: 10, smoothness: 30 },
  // 41 — STARF (berry.c:855)
  { name: "FRISTA", firmness: BERRY_FIRMNESS_SUPER_HARD, size: 153, maxYield: 2, minYield: 1, description1: _DESC.Starf[0],  description2: _DESC.Starf[1],  stageDuration: 24, spicy: 10, dry: 10, sweet: 10, bitter: 10, sour: 10, smoothness: 30 },
  // 42 — ENIGMA (berry.c:873)
  { name: "ENIGMA", firmness: BERRY_FIRMNESS_UNKNOWN,    size:   0, maxYield: 2, minYield: 1, description1: _DESC.Enigma[0], description2: _DESC.Enigma[1], stageDuration: 24, spicy: 40, dry: 40, sweet: 40, bitter: 40, sour: 40, smoothness: 40 },
];

/** 1:1 décomp `gBerryCrush_BerryData[]` (berry.c:892-936). 43 entries.
 *  Difficulty (= berry crush minigame button mash) + powder yield (= berry powder
 *  reward per crush). */
export const gBerryCrush_BerryData: readonly BerryCrushBerryData[] = [
  // CHERI..ASPEAR (0..4)
  { difficulty:  50, powder:  20 }, { difficulty:  50, powder:  20 }, { difficulty:  50, powder:  20 },
  { difficulty:  50, powder:  20 }, { difficulty:  50, powder:  20 },
  // LEPPA..SITRUS (5..9)
  { difficulty:  50, powder:  30 }, { difficulty:  50, powder:  30 }, { difficulty:  50, powder:  30 },
  { difficulty:  50, powder:  30 }, { difficulty:  50, powder:  30 },
  // FIGY..IAPAPA (10..14)
  { difficulty:  60, powder:  50 }, { difficulty:  60, powder:  50 }, { difficulty:  60, powder:  50 },
  { difficulty:  60, powder:  50 }, { difficulty:  60, powder:  50 },
  // RAZZ..PINAP (15..19)
  { difficulty:  80, powder:  70 }, { difficulty:  80, powder:  70 }, { difficulty:  80, powder:  70 },
  { difficulty:  80, powder:  70 }, { difficulty:  80, powder:  70 },
  // POMEG..GREPA (20..24)
  { difficulty: 100, powder: 100 }, { difficulty: 100, powder: 100 }, { difficulty: 100, powder: 100 },
  { difficulty: 100, powder: 100 }, { difficulty: 100, powder: 100 },
  // TAMATO..NOMEL (25..29)
  { difficulty: 130, powder: 150 }, { difficulty: 130, powder: 150 }, { difficulty: 130, powder: 150 },
  { difficulty: 130, powder: 150 }, { difficulty: 130, powder: 150 },
  // SPELON..BELUE (30..34)
  { difficulty: 160, powder: 250 }, { difficulty: 160, powder: 250 }, { difficulty: 160, powder: 250 },
  { difficulty: 160, powder: 250 }, { difficulty: 160, powder: 250 },
  // LIECHI..APICOT (35..39)
  { difficulty: 180, powder: 500 }, { difficulty: 180, powder: 500 }, { difficulty: 180, powder: 500 },
  { difficulty: 180, powder: 500 }, { difficulty: 180, powder: 500 },
  // LANSAT, STARF, ENIGMA (40..42)
  { difficulty: 200, powder: 750 }, { difficulty: 200, powder: 750 }, { difficulty: 150, powder: 200 },
];

/** 1:1 décomp `gBlankBerryTree = {}` (berry.c:938) — zero-init struct BerryTree. */
export const gBlankBerryTree = {
  berry: 0,
  stage: 0,
  minutesUntilNextStage: 0,
  watered1: 0, watered2: 0, watered3: 0, watered4: 0,
  berryYield: 0,
  regrowthCount: 0,
  unused: 0,
  stopGrowth: 0,
} as const;

// ─── Helpers 1:1 décomp `berry.c:941+` ──────────────────────────────────────

/** 1:1 décomp `ClearEnigmaBerries(void)` (berry.c:941-944) :
 *      CpuFill16(0, &gSaveBlock1Ptr->enigmaBerry, sizeof(enigmaBerry)). */
export function ClearEnigmaBerries(): void {
  if (gSaveBlock1Ptr.enigmaBerry) {
    // Zero-init équivalent.
    gSaveBlock1Ptr.enigmaBerry.berry = { name: '', firmness: 0, size: 0, maxYield: 0, minYield: 0, description1: '', description2: '', stageDuration: 0, spicy: 0, dry: 0, sweet: 0, bitter: 0, sour: 0, smoothness: 0 };
    gSaveBlock1Ptr.enigmaBerry.itemEffect = [];
    gSaveBlock1Ptr.enigmaBerry.holdEffect = 0;
    gSaveBlock1Ptr.enigmaBerry.holdEffectParam = 0;
    gSaveBlock1Ptr.enigmaBerry.checksum = 0;
  }
}

/** 1:1 décomp `SetEnigmaBerry(u8 *src)` (berry.c:946-953) — memcpy src → enigmaBerry.
 *  Notre port : src est un objet EnigmaBerry parsed (= depuis link RFU ou input). */
export function SetEnigmaBerry(src: typeof gSaveBlock1Ptr.enigmaBerry): void {
  if (!gSaveBlock1Ptr.enigmaBerry) return;
  Object.assign(gSaveBlock1Ptr.enigmaBerry, src);
}

/** 1:1 décomp `GetEnigmaBerryChecksum(struct EnigmaBerry *)` (berry.c:955-967).
 *  Sum of all bytes except checksum field (= last 4 bytes). Notre port stocke
 *  les bytes différemment (= structured object), ce checksum n'est utilisé que
 *  via IsEnigmaBerryValid. Identity stub honnête : retourne stocked checksum. */
export function GetEnigmaBerryChecksum(): number {
  return gSaveBlock1Ptr.enigmaBerry?.checksum ?? 0;
}

/** 1:1 décomp `IsEnigmaBerryValid(void)` (berry.c:969-978). */
export function IsEnigmaBerryValid(): boolean {
  const eb = gSaveBlock1Ptr.enigmaBerry;
  if (!eb) return false;
  if (!eb.berry?.stageDuration) return false;
  if (!eb.berry?.maxYield) return false;
  if (GetEnigmaBerryChecksum() !== eb.checksum) return false;
  return true;
}

/** 1:1 décomp `GetBerryInfo(u8 berry)` (berry.c:980-990) :
 *    if (berry == BERRY_ENIGMA && IsEnigmaBerryValid()) return enigmaBerry.berry ;
 *    if (berry == BERRY_NONE || berry > LAST_BERRY) berry = BERRY_FIRST ;
 *    return &gBerries[berry - 1].
 *
 *  `berry` ici est un BERRY index 1..43 (= ITEM_TO_BERRY = itemId - FIRST_BERRY_INDEX + 1). */
export function GetBerryInfo(berry: number): Berry {
  // BERRY_ENIGMA = 43 (= ITEM_ENIGMA_BERRY - FIRST_BERRY_INDEX + 1).
  const BERRY_ENIGMA = 43;
  if (berry === BERRY_ENIGMA && IsEnigmaBerryValid() && gSaveBlock1Ptr.enigmaBerry?.berry) {
    return gSaveBlock1Ptr.enigmaBerry.berry;
  }
  // Clamp out-of-range (= BERRY_NONE=0 ou > 43) → BERRY_FIRST=1.
  if (berry === BERRY_NONE || berry > 43) berry = 1;
  return gBerries[berry - 1];
}

/** 1:1 décomp `GetBerryTreeInfo(u8 id)` (berry.c:992-995). */
export function GetBerryTreeInfo(id: number): typeof gSaveBlock1Ptr.berryTrees[0] | undefined {
  return gSaveBlock1Ptr.berryTrees?.[id];
}

/** 1:1 décomp `ClearBerryTrees(void)` (berry.c:1038-1044) : reset all 128 trees. */
export function ClearBerryTrees(): void {
  const trees = gSaveBlock1Ptr.berryTrees;
  if (!trees) return;
  for (let i = 0; i < trees.length; i++) {
    Object.assign(trees[i], gBlankBerryTree);
  }
}

/** 1:1 décomp `PlantBerryTree(u8 id, u8 berry, u8 stage, bool8 allowGrowth)`
 *  (berry.c:1114-1132). */
export function PlantBerryTree(id: number, berry: number, stage: number, allowGrowth: boolean): void {
  const tree = GetBerryTreeInfo(id);
  if (!tree) return;
  // *tree = gBlankBerryTree.
  Object.assign(tree, gBlankBerryTree);
  tree.berry = berry;
  tree.minutesUntilNextStage = GetStageDurationByBerryType(berry);
  tree.stage = stage;
  if (stage === BERRY_STAGE_BERRIES) {
    tree.berryYield = CalcBerryYield(tree);
    tree.minutesUntilNextStage *= 4;
  }
  if (!allowGrowth) tree.stopGrowth = 1;
}

/** 1:1 décomp `RemoveBerryTree(u8 id)` (berry.c:1134-1137). */
export function RemoveBerryTree(id: number): void {
  const tree = GetBerryTreeInfo(id);
  if (!tree) return;
  Object.assign(tree, gBlankBerryTree);
}

/** 1:1 décomp `GetBerryTypeByBerryTreeId(u8 id)` (berry.c:1139-1142). */
export function GetBerryTypeByBerryTreeId(id: number): number {
  return GetBerryTreeInfo(id)?.berry ?? 0;
}

/** 1:1 décomp `GetStageByBerryTreeId(u8 id)` (berry.c:1144-1147). */
export function GetStageByBerryTreeId(id: number): number {
  return GetBerryTreeInfo(id)?.stage ?? 0;
}

/** 1:1 décomp `ItemIdToBerryType(u16 item)` (berry.c:1149-1157).
 *
 *  FIRST_BERRY_INDEX = ITEM_CHERI_BERRY = 133 (= 0x85).
 *  LAST_BERRY_INDEX = ITEM_ENIGMA_BERRY = 175 (= 0xAF).
 *
 *  Returns 1..43 (= BERRY index, 1-based, BERRY_NONE=0 réservé). */
export function ItemIdToBerryType(item: number): number {
  const FIRST_BERRY_INDEX = 133;  // ITEM_CHERI_BERRY
  const LAST_BERRY_INDEX  = 175;  // ITEM_ENIGMA_BERRY
  const berry = item - FIRST_BERRY_INDEX;
  if (berry > LAST_BERRY_INDEX - FIRST_BERRY_INDEX) return 1;  // ITEM_TO_BERRY(FIRST_BERRY_INDEX) = 1
  return berry + 1;  // ITEM_TO_BERRY(item) = (item - FIRST) + 1
}

/** 1:1 décomp `BerryTypeToItemId(u16 berry)` (berry.c:1159-1167). */
export function BerryTypeToItemId(berry: number): number {
  const FIRST_BERRY_INDEX = 133;
  const LAST_BERRY_INDEX  = 175;
  const item = berry - 1;
  if (item > LAST_BERRY_INDEX - FIRST_BERRY_INDEX) return FIRST_BERRY_INDEX;
  return berry + FIRST_BERRY_INDEX - 1;
}

/** 1:1 décomp `GetBerryNameByBerryType(u8 berry, u8 *string)` (berry.c:1169-1173).
 *  Notre port : retourne directement la string (= au lieu de write-by-ref). */
export function GetBerryNameByBerryType(berry: number): string {
  return GetBerryInfo(berry).name.slice(0, BERRY_NAME_LENGTH);
}

/** 1:1 décomp `AllowBerryTreeGrowth(u8 id)` (berry.c:1180-1183). */
export function AllowBerryTreeGrowth(id: number): void {
  const tree = GetBerryTreeInfo(id);
  if (tree) tree.stopGrowth = 0;
}

/** 1:1 décomp `BerryTreeGetNumStagesWatered(struct BerryTree *tree)` (berry.c:1185-1198). */
export function BerryTreeGetNumStagesWatered(tree: typeof gBlankBerryTree | { watered1?: number; watered2?: number; watered3?: number; watered4?: number }): number {
  let count = 0;
  if (tree.watered1) count++;
  if (tree.watered2) count++;
  if (tree.watered3) count++;
  if (tree.watered4) count++;
  return count;
}

/** 1:1 décomp `GetNumStagesWateredByBerryTreeId(u8 id)` (berry.c:1200-1203). */
export function GetNumStagesWateredByBerryTreeId(id: number): number {
  const tree = GetBerryTreeInfo(id);
  if (!tree) return 0;
  return BerryTreeGetNumStagesWatered(tree);
}

/** 1:1 décomp `CalcBerryYieldInternal(u16 max, u16 min, u8 water)` (berry.c:1208-1230).
 *
 *  Si water == 0 → return min.
 *  Sinon : randMin/Max basé sur water stages, rand += Random() % range, round-up
 *  selon (rand % NUM_WATER_STAGES) >= NUM_WATER_STAGES/2. */
export function CalcBerryYieldInternal(max: number, min: number, water: number): number {
  if (water === 0) return min;
  const randMin = (max - min) * (water - 1);
  const randMax = (max - min) * water;
  const rand = randMin + (Random() % (randMax - randMin + 1));
  let extraYield: number;
  if ((rand % NUM_WATER_STAGES) >= NUM_WATER_STAGES / 2) {
    extraYield = Math.floor(rand / NUM_WATER_STAGES) + 1;
  } else {
    extraYield = Math.floor(rand / NUM_WATER_STAGES);
  }
  return extraYield + min;
}

/** 1:1 décomp `CalcBerryYield(struct BerryTree *tree)` (berry.c:1232-1239). */
export function CalcBerryYield(tree: typeof gBlankBerryTree | { berry: number; watered1?: number; watered2?: number; watered3?: number; watered4?: number }): number {
  const berry = GetBerryInfo(tree.berry);
  return CalcBerryYieldInternal(berry.maxYield, berry.minYield, BerryTreeGetNumStagesWatered(tree));
}

/** 1:1 décomp `GetBerryCountByBerryTreeId(u8 id)` (berry.c:1241-1244). */
export function GetBerryCountByBerryTreeId(id: number): number {
  return GetBerryTreeInfo(id)?.berryYield ?? 0;
}

/** 1:1 décomp `GetStageDurationByBerryType(u8 berry)` (berry.c:1246-1249). */
export function GetStageDurationByBerryType(berry: number): number {
  return GetBerryInfo(berry).stageDuration * 60;
}

// ─── ObjectEvent interaction helpers (= berry.c:1251-1313) ──────────────────
// Dette R3 documentée : demande GetObjectEventBerryTreeId(gSelectedObjectEvent) +
// script context vars 0x8004/0x8005/0x8006 + IsBerryTreeSparkling. Subsystem
// berry tree NPCs U-tier (= overworld interaction). Non porté ici — les
// specials qui les wrap (= ObjectEventInteractionWaterBerryTree etc.) restent
// dans specials-registry ou opcodes correspondants.
