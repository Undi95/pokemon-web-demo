/**
 * save-blocks.ts — TypeScript interfaces 1:1 décomp `struct SaveBlock1` +
 * `struct SaveBlock2` + `struct PokemonStorage`.
 *
 * Source de vérité (= ne JAMAIS diverger sur les NOMS de fields) :
 *   - `D:/Projet 1/decomps/pokeemeraude/include/global.h` (SaveBlock1, SaveBlock2)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/pokemon_storage_system.h` (PokemonStorage)
 *
 * Stratégie web port :
 *   On ne match PAS le byte layout exact (= pas de offsets). On match les NOMS
 *   et types sémantiques. Les fields Gen 3 spécifiques (= TVShows, GabbyAndTy,
 *   DewfordTrend, etc.) sont stubs / placeholders pour MVP — pourront être
 *   complétés au fur et à mesure que les features sont implémentées.
 *
 * Persistance : JSON.stringify dans localStorage via save-system.ts. Pas de
 * flash sectors réels (= contrainte hardware GBA non applicable). MAIS on
 * conserve la structure logique : 14 sectors / slot, 2 slots, alternation.
 */

import type { PokemonInstance } from './pokemon';
import type { ItemSlot, Bag } from './bag';

// ─── Constants 1:1 décomp (= include/constants/global.h, vars.h, flags.h) ───

export const PLAYER_NAME_LENGTH = 7;
export const TRAINER_ID_LENGTH = 4;
export const PARTY_SIZE = 6;
export const PC_ITEMS_COUNT = 50;
export const POKEBLOCKS_COUNT = 40;
export const NUM_GAME_STATS = 64;
export const MAX_REMATCH_ENTRIES = 100;
export const OBJECT_EVENTS_COUNT_SAVE = 16;
export const VARS_COUNT = 256;
/** FLAGS_COUNT = DAILY_FLAGS_END + 1 dans le décomp (= ~1500 flags). On round
 *  up à 4096 pour avoir un buffer confortable. */
export const FLAGS_COUNT_SAVE = 4096;
export const NUM_FLAG_BYTES = Math.ceil(FLAGS_COUNT_SAVE / 8);

// ─── Sub-structures ─────────────────────────────────────────────────────────

/** 1:1 décomp `struct Coords16 { s16 x, y }`. */
export interface Coords16 {
  x: number;
  y: number;
}

/** 1:1 décomp `struct WarpData { s8 mapGroup, mapNum; s8 warpId; s16 x, y }`. */
export interface WarpData {
  mapGroup: number;
  mapNum: number;
  warpId: number;
  x: number;
  y: number;
}

/** 1:1 décomp `struct Time { s16 days; s8 hours, minutes, seconds }`. */
export interface Time {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// ─── SaveBlock2 (= 0xF2C bytes dans le décomp) ──────────────────────────────

/** 1:1 décomp `struct SaveBlock2` (global.h). Données globales : identité
 *  joueur, options, Pokédex, playtime, etc.
 *
 *  Pour MVP : seuls les fields utilisés par notre engine sont remplis. Les
 *  autres (apprentices, hallRecords, frontier, etc.) sont placeholders. */
export interface SaveBlock2 {
  /** 7 chars + null terminator. Stored as string en TS. */
  playerName: string;
  /** 0 = MALE, 1 = FEMALE. */
  playerGender: number;
  /** Bit flags : SPECIAL_SAVE_WARP_FLAG_*. Default 0. */
  specialSaveWarpFlags: number;
  /** 4 bytes : trainer ID. Stored as u32 (= little-endian). */
  playerTrainerId: number;
  /** Playtime tracking. */
  playTimeHours: number;
  playTimeMinutes: number;
  playTimeSeconds: number;
  playTimeVBlanks: number;
  /** Options (= 1:1 décomp packed bitfield, on flatten ici). */
  optionsButtonMode: number;       // 0=NORMAL, 1=LR, 2=L_EQUALS_A
  optionsTextSpeed: number;        // 0=SLOW, 1=MID, 2=FAST
  optionsWindowFrameType: number;  // 0..19 (= 20 frame styles)
  optionsSound: number;            // 0=MONO, 1=STEREO
  optionsBattleStyle: number;      // 0=SHIFT, 1=SET
  optionsBattleSceneOff: number;   // 0=ON, 1=OFF
  regionMapZoom: number;           // 0=zoomed out, 1=zoomed in

  /** Pokédex. MVP : caught/seen flags + ordering. */
  pokedex: {
    /** Index 0..386. true si caught. */
    caught: Record<number, boolean>;
    /** Index 0..386. true si seen. */
    seen: Record<number, boolean>;
    /** National dex unlocked ? */
    nationalDex: boolean;
  };

  /** RTC offset (= 1:1 décomp localTimeOffset). Used pour day/night cycle. */
  localTimeOffset: Time;
  /** Last RTC update for berry trees. */
  lastBerryTreeUpdate: Time;
  /** Used pour Pokémon Colosseum/XD GameCube link. MVP : 0. */
  gcnLinkFlags: number;
  /** Random key XOR'd avec money/coins/PIDs (= obfuscation). MVP : 0. */
  encryptionKey: number;
}

// ─── SaveBlock1 (= ~14000 bytes dans le décomp) ─────────────────────────────

/** 1:1 décomp `struct SaveBlock1` (global.h). Données partie courante :
 *  position, party, bag, flags, vars, etc. */
export interface SaveBlock1 {
  /** Position courante du joueur dans la map. */
  pos: Coords16;
  /** Map courante (= la map que le joueur visite actuellement). */
  location: WarpData;
  /** Continue game warp : map à recharger au "Continuer" (= dernière save). */
  continueGameWarp: WarpData;
  /** Dynamic warp : destination next pour MAP_DYNAMIC. Set par
   *  `setdynamicwarp` opcode. */
  dynamicWarp: WarpData;
  /** Last heal location : où le joueur respawn après white-out. */
  lastHealLocation: WarpData;
  /** Escape warp : pour Dig + Escape Rope. */
  escapeWarp: WarpData;

  /** Music ID currently playing. */
  savedMusic: number;
  /** Weather (= rain, sandstorm, etc.). */
  weather: number;
  weatherCycleStage: number;
  /** Flash level (= dark caves). 0 = no flash. */
  flashLevel: number;
  /** Map layout ID. */
  mapLayoutId: number;

  /** Map view buffer (= 0x100 u16 = backup metatile snapshot pour cross-border).
   *  MVP : array vide ; sera populé quand on implémente SaveMapView. */
  mapView: number[];

  /** Player party (= 1-6 Pokémon). */
  playerPartyCount: number;
  playerParty: PokemonInstance[];

  /** Money (= XOR'd avec encryptionKey dans le décomp pour obfuscation). */
  money: number;
  /** Casino coins. */
  coins: number;
  /** Item assigné au bouton SELECT pour usage rapide. */
  registeredItem: string;

  /** PC items (= boîte du joueur, ~50 slots). */
  pcItems: ItemSlot[];

  /** Bag (= 5 pockets). 1:1 décomp split en bagPocket_Items + _KeyItems +
   *  _PokeBalls + _TMHM + _Berries. Notre Bag déjà fait. */
  bag: Bag;

  /** Pokéblocks (= 40 slots). MVP : array vide. */
  pokeblocks: unknown[];

  /** Pokédex SEEN bits (= compact bit array). MVP : utiliser SaveBlock2.pokedex. */
  seen1: number[];

  /** Berry blender records. MVP : zeros. */
  berryBlenderRecords: number[];

  /** Trainer rematch tracking. */
  trainerRematchStepCounter: number;
  trainerRematches: number[];

  /** Object events state (= dynamic NPCs spawned/removed). MVP : empty. */
  objectEvents: unknown[];

  /** Object event templates (= per-map customizations from setobjectxyperm).
   *  MVP : empty ; sera populé quand setobjectxyperm écrit. */
  objectEventTemplates: unknown[];

  /** Flags bitset (= 4096 bits = 512 bytes). Stored as Record<string, true>
   *  en TS pour facilité (= keys = 'FLAG_X' strings). Le décomp utilise un
   *  bitset numérique avec FlagSet/FlagGet bit ops. */
  flags: Record<string, true>;

  /** Vars (= 256 u16). Stored as Record<string, number> en TS (= keys = 'VAR_X'
   *  strings). Le décomp utilise un array indexé par (varId - VARS_START). */
  vars: Record<string, number>;

  /** Game stats (= 64 u32). Indexé par GAME_STAT_X enum. */
  gameStats: number[];

  // ─── Stubs for unimplemented features ────────────────────────────────────
  // Berry trees, secret bases, decorations, TVShows, PokeNews, mail,
  // dewford trends, day care, link battle records, gift ribbons, roamer, etc.
  // MVP : laissés vides (= pas accédés tant que feature pas implémentée).

  /** Heal location ID set par setrespawn (= heal point custom). */
  respawnLocation?: string;
}

// ─── Factories (= 1:1 décomp ClearSav1 / Sav2_ClearSetDefault) ──────────────

/** 1:1 décomp `Sav2_ClearSetDefault` (load_save.c) — initial values pour SaveBlock2. */
export function emptySaveBlock2(): SaveBlock2 {
  return {
    playerName: '',
    playerGender: 0,  // MALE
    specialSaveWarpFlags: 0,
    playerTrainerId: 0,
    playTimeHours: 0,
    playTimeMinutes: 0,
    playTimeSeconds: 0,
    playTimeVBlanks: 0,
    // Options defaults 1:1 décomp (= save_data.c init values).
    optionsButtonMode: 0,        // OPTIONS_BUTTON_MODE_NORMAL
    optionsTextSpeed: 1,         // OPTIONS_TEXT_SPEED_MID
    optionsWindowFrameType: 0,   // frame 1 (= classic blue rounded)
    optionsSound: 0,             // OPTIONS_SOUND_MONO
    optionsBattleStyle: 0,       // OPTIONS_BATTLE_STYLE_SHIFT
    optionsBattleSceneOff: 0,    // OPTIONS_BATTLE_SCENE_ON
    regionMapZoom: 0,
    pokedex: { caught: {}, seen: {}, nationalDex: false },
    localTimeOffset: { days: 0, hours: 0, minutes: 0, seconds: 0 },
    lastBerryTreeUpdate: { days: 0, hours: 0, minutes: 0, seconds: 0 },
    gcnLinkFlags: 0,
    encryptionKey: 0,
  };
}

/** 1:1 décomp `ClearSav1` (load_save.c) — zero-init complet de SaveBlock1. */
export function emptySaveBlock1(emptyBag: Bag): SaveBlock1 {
  const emptyWarp: WarpData = { mapGroup: -1, mapNum: -1, warpId: -1, x: -1, y: -1 };
  return {
    pos: { x: 0, y: 0 },
    location: { ...emptyWarp },
    continueGameWarp: { ...emptyWarp },
    dynamicWarp: { ...emptyWarp },
    lastHealLocation: { ...emptyWarp },
    escapeWarp: { ...emptyWarp },
    savedMusic: 0,
    weather: 0,
    weatherCycleStage: 0,
    flashLevel: 0,
    mapLayoutId: 0,
    mapView: [],
    playerPartyCount: 0,
    playerParty: [],
    money: 0,
    coins: 0,
    registeredItem: '',
    pcItems: Array.from({ length: PC_ITEMS_COUNT }, () => ({ itemKey: '', quantity: 0 })),
    bag: emptyBag,
    pokeblocks: [],
    seen1: new Array(NUM_FLAG_BYTES).fill(0),
    berryBlenderRecords: [0, 0, 0],
    trainerRematchStepCounter: 0,
    trainerRematches: new Array(MAX_REMATCH_ENTRIES).fill(0),
    objectEvents: [],
    objectEventTemplates: [],
    flags: {},
    vars: {},
    gameStats: new Array(NUM_GAME_STATS).fill(0),
  };
}
