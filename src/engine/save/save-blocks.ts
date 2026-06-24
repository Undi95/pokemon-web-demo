/**
 * save-blocks.ts — TypeScript interfaces 1:1 décomp `struct SaveBlock1` +
 * `struct SaveBlock2` + `struct PokemonStorage`.
 *
 * Source de vérité (= ne JAMAIS diverger sur les NOMS de fields) :
 *   - `D:/Projet 1/decomps/pokeemeraude/include/global.h` (SaveBlock1, SaveBlock2)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/global.fieldmap.h` (ObjectEvent, etc.)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/global.berry.h` (BerryTree, EnigmaBerry)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/global.tv.h` (TVShow, PokeNews, GabbyAndTy)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/pokemon_storage_system.h` (PokemonStorage)
 *
 * Stratégie web port (= user request : "importe TOUT") :
 *   On import TOUTES les structures du décomp, même celles qu'on n'utilise pas
 *   encore. Les NOMS de fields matchent 1:1 décomp pour faciliter futures
 *   features. Les types sémantiques (= number/string/array) au lieu du byte
 *   layout exact. Pas de bitfield packing — chaque field est en TS direct.
 *
 * Persistance : JSON.stringify dans localStorage via save-system.ts. Pas de
 * flash sectors réels (= contrainte hardware GBA non applicable).
 */

import type { PokemonInstance } from '../pokemon/pokemon';
import type { ItemSlot, Bag } from '../bag/bag';
import { EOS } from '../../../include/constants/characters';

// ─── Constants 1:1 décomp ────────────────────────────────────────────────────
// Cf. include/constants/global.h, vars.h, flags.h, berry.h, tv.h, etc.

export const PLAYER_NAME_LENGTH = 7;
export const POKEMON_NAME_LENGTH = 10;
export const TRAINER_ID_LENGTH = 4;
export const PARTY_SIZE = 6;
export const MULTI_PARTY_SIZE = 3;
export const MAX_MON_MOVES = 4;
export const PC_ITEMS_COUNT = 50;
export const BAG_ITEMS_COUNT = 30;
export const BAG_KEYITEMS_COUNT = 30;
export const BAG_POKEBALLS_COUNT = 16;
export const BAG_TMHM_COUNT = 64;
export const BAG_BERRIES_COUNT = 46;
export const POKEBLOCKS_COUNT = 40;
export const NUM_GAME_STATS = 64;
export const MAX_REMATCH_ENTRIES = 100;
export const OBJECT_EVENTS_COUNT = 16;
export const OBJECT_EVENT_TEMPLATES_COUNT = 64;
export const VARS_COUNT = 256;            // VARS_END - VARS_START + 1 = 0x40FF - 0x4000 + 1
/** FLAGS_COUNT = DAILY_FLAGS_END + 1 dans le décomp (≈ 1500). On round à 4096. */
export const FLAGS_COUNT_SAVE = 4096;
export const NUM_FLAG_BYTES = Math.ceil(FLAGS_COUNT_SAVE / 8);
/** NUM_DEX_FLAG_BYTES = ROUND_BITS_TO_BYTES(NUM_SPECIES = 412). */
export const NUM_DEX_FLAG_BYTES = 52;
export const BERRY_TREES_COUNT = 128;
export const SECRET_BASES_COUNT = 20;
export const DECOR_MAX_PLAYERS_HOUSE = 12;
export const DECOR_MAX_SECRET_BASE = 16;
export const TV_SHOWS_COUNT = 25;          // NUM_NORMAL_TVSHOW_SLOTS (5) + 20
export const POKE_NEWS_COUNT = 16;
export const EASY_CHAT_BATTLE_WORDS_COUNT = 6;
export const MAIL_COUNT = 16;              // 10 + PARTY_SIZE
export const NUM_TRENDY_SAYINGS = 33;
export const NUM_TRENDY_SAYING_BYTES = Math.ceil(NUM_TRENDY_SAYINGS / 8);
export const SAVED_TRENDS_COUNT = 5;
export const NUM_CONTEST_WINNERS = 13;
export const CONTEST_CATEGORIES_COUNT = 5;
export const CONTESTANT_COUNT = 4;
export const GIFT_RIBBONS_COUNT = 11;
export const UNION_ROOM_KB_ROW_COUNT = 10;
export const NUM_TRAINER_HILL_MODES = 4;
export const APPRENTICE_COUNT = 4;
export const APPRENTICE_MAX_QUESTIONS = 9;
export const FRONTIER_LVL_MODE_COUNT = 2;
export const FRONTIER_PARTY_SIZE = 3;
export const MAX_FRONTIER_PARTY_SIZE = 4;
export const HALL_FACILITIES_COUNT = 9;
export const HALL_RECORDS_COUNT = 3;
export const PYRAMID_BAG_ITEMS_COUNT = 10;
export const MAX_PYRAMID_TRAINERS = 8;
export const MAIL_WORDS_COUNT = 9;
export const DAYCARE_MON_COUNT = 2;
export const NUM_QUESTIONNAIRE_WORDS = 4;
export const MAX_STAMP_CARD_STAMPS = 7;
export const WONDER_CARD_TEXT_LENGTH = 40;
export const WONDER_NEWS_TEXT_LENGTH = 40;
export const WONDER_CARD_BODY_TEXT_LINES = 4;
export const WONDER_NEWS_BODY_TEXT_LINES = 10;
export const NUM_BARD_SONG_WORDS = 6;
export const NUM_STORYTELLER_TALES = 4;
export const NUM_TRADER_ITEMS = 4;
export const GIDDY_MAX_TALES = 10;
export const GIDDY_MAX_QUESTIONS = 8;
export const QUIZ_QUESTION_LEN = 9;
export const SMARTSHOPPER_NUM_ITEMS = 3;
export const TOTAL_BOXES_COUNT = 14;
export const IN_BOX_COUNT = 30;
export const BOX_NAME_LENGTH = 8;
export const BERRY_NAME_LENGTH = 6;
export const BERRY_ITEM_EFFECT_COUNT = 18;
export const NUM_STATS = 6;

// ─── Coords / Time ──────────────────────────────────────────────────────────

/** 1:1 décomp `struct Coords16 { s16 x, y }`. */
export interface Coords16 { x: number; y: number; }
/** 1:1 décomp `struct Coords8 { s8 x, y }`. */
export interface Coords8 { x: number; y: number; }

/** 1:1 décomp `struct WarpData { s8 mapGroup, mapNum; s8 warpId; s16 x, y }`. */
export interface WarpData {
  mapGroup: number;
  mapNum: number;
  warpId: number;
  x: number;
  y: number;
}

/** 1:1 décomp `struct Time { s16 days; s8 hours, minutes, seconds }`. */
export interface Time { days: number; hours: number; minutes: number; seconds: number; }

// ─── Pokedex ────────────────────────────────────────────────────────────────

/** 1:1 décomp `struct Pokedex` (global.h:212). */
export interface Pokedex {
  order: number;
  mode: number;
  /** Must equal 0xDA pour avoir National mode. */
  nationalMagic: number;
  unknown2: number;
  /** Set when player first sees Unown. */
  unownPersonality: number;
  /** Set when player first sees Spinda. */
  spindaPersonality: number;
  unknown3: number;
  /** Bitset NUM_DEX_FLAG_BYTES. true = species owned (caught). */
  owned: number[];
  /** Bitset NUM_DEX_FLAG_BYTES. true = species seen. */
  seen: number[];
}

// ─── Berry ──────────────────────────────────────────────────────────────────

/** 1:1 décomp `struct Berry2` (global.berry.h:27). */
export interface Berry2 {
  name: string;
  firmness: number;
  size: number;
  maxYield: number;
  minYield: number;
  description1: string;
  description2: string;
  stageDuration: number;
  spicy: number;
  dry: number;
  sweet: number;
  bitter: number;
  sour: number;
  smoothness: number;
}

/** 1:1 décomp `struct EnigmaBerry` (global.berry.h:46). */
export interface EnigmaBerry {
  berry: Berry2;
  itemEffect: number[];   // [BERRY_ITEM_EFFECT_COUNT]
  holdEffect: number;
  holdEffectParam: number;
  checksum: number;
}

/** 1:1 décomp `struct BerryTree` (global.berry.h:63). */
export interface BerryTree {
  berry: number;
  stage: number;          // 7 bits
  stopGrowth: number;     // 1 bit
  minutesUntilNextStage: number;
  berryYield: number;
  regrowthCount: number;  // 4 bits
  watered1: number;       // 1 bit
  watered2: number;       // 1 bit
  watered3: number;       // 1 bit
  watered4: number;       // 1 bit
}

// ─── Pokeblock ──────────────────────────────────────────────────────────────

/** 1:1 décomp `struct Pokeblock` (global.h:602). */
export interface Pokeblock {
  color: number;
  spicy: number;
  dry: number;
  sweet: number;
  bitter: number;
  sour: number;
  feel: number;
}

// ─── Battle Tower / Frontier ────────────────────────────────────────────────

/** 1:1 décomp `struct BattleTowerPokemon` (global.h:288). */
export interface BattleTowerPokemon {
  species: number;
  heldItem: number;
  moves: number[];        // [MAX_MON_MOVES]
  level: number;
  ppBonuses: number;
  hpEV: number;
  attackEV: number;
  defenseEV: number;
  speedEV: number;
  spAttackEV: number;
  spDefenseEV: number;
  otId: number;
  hpIV: number;
  attackIV: number;
  defenseIV: number;
  speedIV: number;
  spAttackIV: number;
  spDefenseIV: number;
  abilityNum: number;
  personality: number;
  nickname: string;
  friendship: number;
}

/** 1:1 décomp `struct EmeraldBattleTowerRecord` (global.h:315). */
export interface EmeraldBattleTowerRecord {
  lvlMode: number;
  facilityClass: number;
  winStreak: number;
  name: string;
  trainerId: number[];    // [TRAINER_ID_LENGTH]
  greeting: number[];     // [EASY_CHAT_BATTLE_WORDS_COUNT]
  speechWon: number[];
  speechLost: number[];
  party: BattleTowerPokemon[];
  language: number;
  checksum: number;
}

/** 1:1 décomp `struct BattleTowerInterview` (global.h:331). */
export interface BattleTowerInterview {
  playerSpecies: number;
  opponentSpecies: number;
  opponentName: string;
  opponentMonNickname: string;
  opponentLanguage: number;
}

/** 1:1 décomp `struct BattleTowerEReaderTrainer` (global.h:340). */
export interface BattleTowerEReaderTrainer {
  unk0: number;
  facilityClass: number;
  winStreak: number;
  name: string;
  trainerId: number[];
  greeting: number[];
  farewellPlayerLost: number[];
  farewellPlayerWon: number[];
  party: BattleTowerPokemon[];
  checksum: number;
}

/** 1:1 décomp `struct DomeMonData` (global.h:355). */
export interface DomeMonData {
  moves: number[];        // [MAX_MON_MOVES]
  evs: number[];          // [NUM_STATS]
  nature: number;
}

/** 1:1 décomp `struct RentalMon` (global.h:363). */
export interface RentalMon {
  monId: number;
  personality: number;
  ivs: number;
  abilityNum: number;
}

/** 1:1 décomp `struct BattleDomeTrainer` (global.h:373). */
export interface BattleDomeTrainer {
  trainerId: number;      // 10 bits
  isEliminated: number;   // 1 bit
  eliminatedAt: number;   // 2 bits
  forfeited: number;      // 3 bits
}

/** 1:1 décomp `struct PyramidBag` (global.h:250). */
export interface PyramidBag {
  itemId: number[][];     // [FRONTIER_LVL_MODE_COUNT][PYRAMID_BAG_ITEMS_COUNT]
  quantity: number[][];
}

/** 1:1 décomp `struct BattleFrontier` (global.h:384). 1264 bytes total. */
export interface BattleFrontier {
  towerPlayer: EmeraldBattleTowerRecord;
  towerRecords: EmeraldBattleTowerRecord[];
  towerInterview: BattleTowerInterview;
  ereaderTrainer: BattleTowerEReaderTrainer;
  challengeStatus: number;
  lvlMode: number;
  challengePaused: number;
  disableRecordBattle: number;
  selectedPartyMons: number[];
  curChallengeBattleNum: number;
  trainerIds: number[];
  winStreakActiveFlags: number;
  towerWinStreaks: number[][];      // [4][FRONTIER_LVL_MODE_COUNT]
  towerRecordWinStreaks: number[][];
  battledBrainFlags: number;
  towerSinglesStreak: number;
  towerNumWins: number;
  towerBattleOutcome: number;
  towerLvlMode: number;
  domeAttemptedSingles50: number;
  domeAttemptedSinglesOpen: number;
  domeHasWonSingles50: number;
  domeHasWonSinglesOpen: number;
  domeAttemptedDoubles50: number;
  domeAttemptedDoublesOpen: number;
  domeHasWonDoubles50: number;
  domeHasWonDoublesOpen: number;
  domeUnused: number;
  domeLvlMode: number;
  domeBattleMode: number;
  domeWinStreaks: number[][];
  domeRecordWinStreaks: number[][];
  domeTotalChampionships: number[][];
  domeTrainers: BattleDomeTrainer[];
  domeMonIds: number[][];           // [DOME_TOURNAMENT_TRAINERS_COUNT][FRONTIER_PARTY_SIZE]
  unused_DC4: number;
  palacePrize: number;
  palaceWinStreaks: number[][];
  palaceRecordWinStreaks: number[][];
  arenaPrize: number;
  arenaWinStreaks: number[];
  arenaRecordStreaks: number[];
  factoryWinStreaks: number[][];
  factoryRecordWinStreaks: number[][];
  factoryRentsCount: number[][];
  factoryRecordRentsCount: number[][];
  pikePrize: number;
  pikeWinStreaks: number[];
  pikeRecordStreaks: number[];
  pikeTotalStreaks: number[];
  pikeHintedRoomIndex: number;
  pikeHintedRoomType: number;
  pikeHealingRoomsDisabled: number;
  pikeHeldItemsBackup: number[];
  pyramidPrize: number;
  pyramidWinStreaks: number[];
  pyramidRecordStreaks: number[];
  pyramidRandoms: number[];
  pyramidTrainerFlags: number;
  pyramidBag: PyramidBag;
  pyramidLightRadius: number;
  verdanturfTentPrize: number;
  fallarborTentPrize: number;
  slateportTentPrize: number;
  rentalMons: RentalMon[];
  battlePoints: number;
  cardBattlePoints: number;
  battlesCount: number;
  domeWinningMoves: number[];
  trainerFlags: number;
  opponentNames: string[];
  opponentTrainerIds: number[][];
  unk_EF9: number;
  savedGame: number;
  unused_EFA: number;
  unused_EFB: number;
  domePlayerPartyData: DomeMonData[];
}

// ─── Apprentice ─────────────────────────────────────────────────────────────

/** 1:1 décomp `struct ApprenticeMon` (global.h:263). */
export interface ApprenticeMon {
  species: number;
  moves: number[];
  item: number;
}

/** 1:1 décomp `struct Apprentice` (global.h:272). */
export interface Apprentice {
  id: number;
  lvlMode: number;
  numQuestions: number;
  number: number;
  party: ApprenticeMon[];
  speechWon: number[];
  playerId: number[];
  playerName: string;
  language: number;
  checksum: number;
}

/** 1:1 décomp `struct ApprenticeQuestion` (global.h:469). */
export interface ApprenticeQuestion {
  questionId: number;
  monId: number;
  moveSlot: number;
  suggestedChange: number;
  data: number;
}

/** 1:1 décomp `struct PlayersApprentice` (global.h:479). */
export interface PlayersApprentice {
  id: number;
  lvlMode: number;
  questionsAnswered: number;
  leadMonId: number;
  party: number;
  saveId: number;
  unused: number;
  speciesIds: number[];
  questions: ApprenticeQuestion[];
}

/** 1:1 décomp `struct PokemonJumpRecords` (global.h:225). */
export interface PokemonJumpRecords {
  jumpsInRow: number;
  unused1: number;
  excellentsInRow: number;
  gamesWithMaxPlayers: number;
  unused2: number;
  bestJumpScore: number;
}

/** 1:1 décomp `struct BerryPickingResults` (global.h:235). */
export interface BerryPickingResults {
  bestScore: number;
  berriesPicked: number;
  berriesPickedInRow: number;
  field_8: number;
  field_9: number;
  field_A: number;
  field_B: number;
  field_C: number;
  field_D: number;
  field_E: number;
  field_F: number;
}

/** 1:1 décomp `struct BerryCrush` (global.h:256). */
export interface BerryCrush {
  pressingSpeeds: number[];
  berryPowderAmount: number;
  unk: number;
}

/** 1:1 décomp `struct RankingHall1P` (global.h:494). */
export interface RankingHall1P {
  id: number[];
  winStreak: number;
  name: string;
  language: number;
}

/** 1:1 décomp `struct RankingHall2P` (global.h:503). */
export interface RankingHall2P {
  id1: number[];
  id2: number[];
  winStreak: number;
  name1: string;
  name2: string;
  language: number;
}

// ─── Mauville Old Man (union) ───────────────────────────────────────────────

/** 1:1 décomp `union OldMan` (global.h:715). Discriminé par `id`. */
export type OldMan =
  | { id: number; kind: 'common'; }
  | {
      id: number;
      kind: 'bard';
      songLyrics: number[];
      newSongLyrics: number[];
      playerName: string;
      playerTrainerId: number[];
      hasChangedSong: number;
      language: number;
    }
  | {
      id: number;
      kind: 'storyteller';
      alreadyRecorded: number;
      gameStatIDs: number[];
      trainerNames: string[];
      statValues: number[][];
      language: number[];
    }
  | {
      id: number;
      kind: 'giddy';
      taleCounter: number;
      questionNum: number;
      randomWords: number[];
      questionList: number[];
      language: number;
    }
  | { id: number; kind: 'hipster'; taughtWord: number; language: number; }
  | {
      id: number;
      kind: 'trader';
      decorations: number[];
      playerNames: string[];
      alreadyTraded: number;
      language: number[];
    };

// ─── Lilycove Lady (union) ──────────────────────────────────────────────────

/** 1:1 décomp `union LilycoveLady` (global.h:846). */
export type LilycoveLady =
  | {
      id: number;
      kind: 'quiz';
      state: number;
      question: number[];
      correctAnswer: number;
      playerAnswer: number;
      playerName: string;
      playerTrainerId: number[];
      prize: number;
      waitingForChallenger: number;
      questionId: number;
      prevQuestionId: number;
      language: number;
    }
  | {
      id: number;
      kind: 'favor';
      state: number;
      likedItem: number;
      numItemsGiven: number;
      playerName: string;
      favorId: number;
      itemId: number;
      bestItem: number;
      language: number;
    }
  | {
      id: number;
      kind: 'contest';
      givenPokeblock: number;
      numGoodPokeblocksGiven: number;
      numOtherPokeblocksGiven: number;
      playerName: string;
      maxSheen: number;
      category: number;
      language: number;
    };

// ─── DewfordTrend ───────────────────────────────────────────────────────────

/** 1:1 décomp `struct DewfordTrend` (global.h:647). */
export interface DewfordTrend {
  trendiness: number;
  maxTrendiness: number;
  gainingTrendiness: number;
  rand: number;
  words: number[];
}

// ─── Mail / DaycareMail ─────────────────────────────────────────────────────

/** 1:1 décomp `struct Mail` (global.h:770). */
export interface Mail {
  words: number[];
  /** 1:1 décomp `u8 playerName[PLAYER_NAME_LENGTH + 1]` (charmap, EOS-terminé,
   *  padé CHAR_SPACE par PadNameString). `number[]` de bytes (round-trip JSON,
   *  cf. Stage 4b). Accès byte direct ; décodé à l'affichage (decodeOwBytes). */
  playerName: number[];
  trainerId: number[];
  species: number;
  itemId: number;
}

/** 1:1 décomp `struct DaycareMail` (global.h:779). */
export interface DaycareMail {
  message: Mail;
  otName: string;
  monName: string;
  gameLanguage: number;
  monLanguage: number;
}

// ─── BoxPokemon (= simplified pour daycare) ─────────────────────────────────

/** 1:1 décomp `struct BoxPokemon`. Nous utilisons PokemonInstance qui couvre
 *  les mêmes données sémantiquement. Pour daycare on garde juste un
 *  PokemonInstance compatible. */
export type BoxPokemonSlot = PokemonInstance | null;

/** 1:1 décomp `struct DaycareMon` (global.h:788). */
export interface DaycareMon {
  mon: BoxPokemonSlot;
  mail: DaycareMail;
  steps: number;
}

/** 1:1 décomp `struct DayCare` (global.h:795). */
export interface DayCare {
  mons: DaycareMon[];
  offspringPersonality: number;
  stepCounter: number;
}

// ─── ContestWinner ──────────────────────────────────────────────────────────

/** 1:1 décomp `struct ContestWinner` (global.h:758). */
export interface ContestWinner {
  personality: number;
  trainerId: number;
  species: number;
  contestCategory: number;
  monName: string;
  trainerName: string;
  contestRank: number;
}

// ─── LinkBattleRecords ──────────────────────────────────────────────────────

/** 1:1 décomp `struct LinkBattleRecord` (global.h:728). */
export interface LinkBattleRecord {
  name: string;
  trainerId: number;
  wins: number;
  losses: number;
  draws: number;
}

/** 1:1 décomp `struct LinkBattleRecords` (global.h:737). */
export interface LinkBattleRecords {
  entries: LinkBattleRecord[];
  languages: number[];
}

// ─── RecordMixingGift ───────────────────────────────────────────────────────

/** 1:1 décomp `struct RecordMixingGiftData` (global.h:744). */
export interface RecordMixingGiftData {
  unk0: number;
  quantity: number;
  itemId: number;
  filler4: number[];
}

/** 1:1 décomp `struct RecordMixingGift` (global.h:752). */
export interface RecordMixingGift {
  checksum: number;
  data: RecordMixingGiftData;
}

// ─── ExternalEventData / Flags ──────────────────────────────────────────────

/** 1:1 décomp `struct ExternalEventData` (global.h:946). */
export interface ExternalEventData {
  unknownExternalDataFields1: number[];
  unknownExternalDataFields2: number;
  currentPokeCoupons: number;
  gotGoldPokeCouponTitleReward: number;
  gotSilverPokeCouponTitleReward: number;
  gotBronzePokeCouponTitleReward: number;
  receivedAgetoCelebi: number;
  unknownExternalDataFields3: number;
  totalEarnedPokeCoupons: number;
  unknownExternalDataFields4: number[];
}

/** 1:1 décomp `struct ExternalEventFlags` (global.h:962). */
export interface ExternalEventFlags {
  usedBoxRS: number;
  boxRSEggsUnlocked: number;
  unknownFlag1: number;
  receivedGCNJirachi: number;
  unknownFlag3: number;
  unknownFlag4: number;
  unknownFlag5: number;
  unknownFlag6: number;
  unknownFlag7: number;
  unknownFlag8: number;
  unknownFlag9: number;
  unknownFlag10: number;
  unknownFlag11: number;
  unknownFlag12: number;
  unknownFlag13: number;
  unknownFlag14: number;
  unknownFlag15: number;
  unknownFlag16: number;
  unknownFlag17: number;
  unknownFlag18: number;
  unknownFlag19: number;
  unknownFlag20: number;
}

// ─── Roamer ─────────────────────────────────────────────────────────────────

/** 1:1 décomp `struct Roamer` (global.h:613). */
export interface Roamer {
  ivs: number;
  personality: number;
  species: number;
  hp: number;
  level: number;
  status: number;
  cool: number;
  beauty: number;
  cute: number;
  smart: number;
  tough: number;
  active: number;
}

// ─── RamScript ──────────────────────────────────────────────────────────────

/** 1:1 décomp `struct RamScriptData` (global.h:630). */
export interface RamScriptData {
  magic: number;
  mapGroup: number;
  mapNum: number;
  localId: number;
  /** 995 bytes max. */
  script: number[];
}

/** 1:1 décomp `struct RamScript` (global.h:640). */
export interface RamScript {
  checksum: number;
  data: RamScriptData;
}

// ─── SecretBase ─────────────────────────────────────────────────────────────

/** 1:1 décomp `struct SecretBaseParty` (global.h:552). */
export interface SecretBaseParty {
  personality: number[];
  moves: number[];        // [PARTY_SIZE * MAX_MON_MOVES]
  species: number[];
  heldItems: number[];
  levels: number[];
  EVs: number[];
}

/** 1:1 décomp `struct SecretBase` (global.h:562). */
export interface SecretBase {
  secretBaseId: number;
  toRegister: number;
  gender: number;
  battledOwnerToday: number;
  registryStatus: number;
  trainerName: string;
  trainerId: number[];
  language: number;
  numSecretBasesReceived: number;
  numTimesEntered: number;
  unused: number;
  decorations: number[];
  decorationPositions: number[];
  party: SecretBaseParty;
}

// ─── ObjectEvent / ObjectEventTemplate ──────────────────────────────────────

/** 1:1 décomp `struct ObjectEvent` (global.fieldmap.h:194). 0x24 bytes.
 *  Dans le décomp c'est runtime + saved (= save les positions courantes
 *  via SaveObjectEvents). Notre runtime ObjectEvent est dans `object-events.ts`
 *  avec des fields web-spécifiques (= spriteId, paletteBank, etc.). Cette
 *  interface est le subset SAVED, snapshot du runtime au save time. */
export interface ObjectEventSnapshot {
  active: number;
  singleMovementActive: number;
  triggerGroundEffectsOnMove: number;
  triggerGroundEffectsOnStop: number;
  disableCoveringGroundEffects: number;
  landingJump: number;
  heldMovementActive: number;
  heldMovementFinished: number;
  frozen: number;
  facingDirectionLocked: number;
  disableAnim: number;
  enableAnim: number;
  inanimate: number;
  invisible: number;
  offScreen: number;
  trackedByCamera: number;
  isPlayer: number;
  hasReflection: number;
  inShortGrass: number;
  inShallowFlowingWater: number;
  inSandPile: number;
  inHotSprings: number;
  hasShadow: number;
  spriteAnimPausedBackup: number;
  spriteAffineAnimPausedBackup: number;
  disableJumpLandingGroundEffect: number;
  fixedPriority: number;
  hideReflection: number;
  spriteId: number;
  graphicsId: number | string;     // string en TS pour preserve OBJ_EVENT_GFX_*
  movementType: number | string;
  trainerType: number;
  localId: number;
  mapNum: number;
  mapGroup: number;
  /** Web-port extension : map ID string (= mapping mapGroup+mapNum à mapId). */
  mapId?: string;
  currentElevation: number;
  previousElevation: number;
  initialCoords: Coords16;
  currentCoords: Coords16;
  previousCoords: Coords16;
  facingDirection: number;
  movementDirection: number;
  rangeX: number;
  rangeY: number;
  fieldEffectSpriteId: number;
  warpArrowSpriteId: number;
  movementActionId: number;
  trainerRange_berryTreeId: number;
  currentMetatileBehavior: number;
  previousMetatileBehavior: number;
  previousMovementDirection: number;
  directionSequenceIndex: number;
  playerCopyableMovement: number;
}

/** 1:1 décomp `struct ObjectEventTemplate` (global.fieldmap.h:92). 0x18 bytes.
 *  setobjectxyperm overlay : permet à un script de change la position default
 *  d'un NPC permanent (= persisted across saves). */
export interface ObjectEventTemplate {
  localId: number;
  graphicsId: number | string;
  kind: number;
  x: number;
  y: number;
  elevation: number;
  movementType: number | string;
  movementRangeX: number;
  movementRangeY: number;
  trainerType: number;
  trainerRange_berryTreeId: number;
  /** Pointeur script (= label string en TS). */
  script: string;
  flagId: number;
  /** Web-port : map ID pour identifier l'override. */
  mapId?: string;
}

// ─── TVShow / PokeNews / GabbyAndTy ─────────────────────────────────────────

/** 1:1 décomp `union TVShow`. 25 variants discriminés par `kind`.
 *  Pour MVP web port on stocke comme `unknown` — sera typed-up plus tard
 *  quand les TVShows seront implémentés. Le décomp utilise 0x24 bytes (= 36)
 *  par TVShow, on garde n'importe quel object compatible. */
export type TVShow = {
  kind: number;
  active: number;
  /** Raw payload bytes. Décomp utilise des accès field-specific via union ;
   *  notre version stocke en object générique. */
  data?: Record<string, unknown>;
};

/** 1:1 décomp `struct PokeNews` (global.tv.h:495). */
export interface PokeNews {
  kind: number;
  state: number;
  dayCountdown: number;
}

/** 1:1 décomp `struct GabbyAndTyData` (global.tv.h:502). */
export interface GabbyAndTyData {
  mon1: number;
  mon2: number;
  lastMove: number;
  quote: number[];
  mapnum: number;
  battleNum: number;
  battleTookMoreThanOneTurn: number;
  playerLostAMon: number;
  playerUsedHealingItem: number;
  playerThrewABall: number;
  onAir: number;
  valA_5: number;
  battleTookMoreThanOneTurn2: number;
  playerLostAMon2: number;
  playerUsedHealingItem2: number;
  playerThrewABall2: number;
  valB_4: number;
}

// ─── MysteryGift / Wonder Card / News ───────────────────────────────────────

/** 1:1 décomp `struct WonderNewsMetadata` (global.h:887). */
export interface WonderNewsMetadata {
  newsType: number;
  sentRewardCounter: number;
  rewardCounter: number;
  berry: number;
}

/** 1:1 décomp `struct WonderNews` (global.h:896). */
export interface WonderNews {
  id: number;
  sendType: number;
  bgType: number;
  titleText: string;
  bodyText: string[];
}

/** 1:1 décomp `struct WonderCard` (global.h:905). */
export interface WonderCard {
  flagId: number;
  iconSpecies: number;
  idNumber: number;
  type: number;
  bgType: number;
  sendType: number;
  maxStamps: number;
  titleText: string;
  subtitleText: string;
  bodyText: string[];
  footerLine1Text: string;
  footerLine2Text: string;
}

/** 1:1 décomp `struct WonderCardMetadata` (global.h:922). */
export interface WonderCardMetadata {
  battlesWon: number;
  battlesLost: number;
  numTrades: number;
  iconSpecies: number;
  stampData: number[][];
}

/** 1:1 décomp `struct MysteryGiftSave` (global.h:931). */
export interface MysteryGiftSave {
  newsCrc: number;
  news: WonderNews;
  cardCrc: number;
  card: WonderCard;
  cardMetadataCrc: number;
  cardMetadata: WonderCardMetadata;
  questionnaireWords: number[];
  newsMetadata: WonderNewsMetadata;
  trainerIds: number[][];
}

// ─── TrainerHill / Walda / TrainerNameRecord ────────────────────────────────

/** 1:1 décomp `struct TrainerHillSave` (global.h:871). */
export interface TrainerHillSave {
  timer: number;
  bestTime: number;
  unk_3D6C: number;
  unused: number;
  receivedPrize: number;
  checkedFinalTime: number;
  spokeToOwner: number;
  hasLost: number;
  maybeECardScanDuringChallenge: number;
  field_3D6E_0f: number;
  mode: number;
}

/** 1:1 décomp `struct WaldaPhrase` (global.h:855). */
export interface WaldaPhrase {
  colors: number[];
  text: string;
  iconId: number;
  patternId: number;
  patternUnlocked: number;
}

/** 1:1 décomp `struct TrainerNameRecord` (global.h:865). */
export interface TrainerNameRecord {
  trainerId: number;
  trainerName: string;
}

// ─── SaveBlock2 (1:1 décomp global.h:514) ───────────────────────────────────

export interface SaveBlock2 {
  /** 1:1 décomp `u8 playerName[PLAYER_NAME_LENGTH + 1]` (charmap, EOS-terminé).
   *  Stage 4 : `number[]` de bytes charmap (round-trip JSON.stringify, comme
   *  SaveBlock1->flags ; un Uint8Array ne round-trip pas). Accès via
   *  GetPlayerName / GetPlayerNameString / SetPlayerName (string-buffers.ts). */
  playerName: number[];
  /** 0 = MALE, 1 = FEMALE. */
  playerGender: number;
  /** Bit flags : SPECIAL_SAVE_WARP_FLAG_*. */
  specialSaveWarpFlags: number;
  /** 4 bytes : trainer ID. Stored as u32 little-endian. */
  playerTrainerId: number;
  /** Playtime tracking. */
  playTimeHours: number;
  playTimeMinutes: number;
  playTimeSeconds: number;
  playTimeVBlanks: number;
  /** Options (= 1:1 décomp packed bitfield, on flatten ici). */
  optionsButtonMode: number;
  optionsTextSpeed: number;
  optionsWindowFrameType: number;
  optionsSound: number;
  optionsBattleStyle: number;
  optionsBattleSceneOff: number;
  regionMapZoom: number;
  /** Pokédex. */
  pokedex: Pokedex;
  /** Filler (= 8 bytes). */
  filler_90: number[];
  /** Local time offset (= RTC). */
  /** 1:1 décomp `struct Time localTimeOffset` (global.h:535) — offset
   *  pile↔jeu, l'UNIQUE source (plus de champ ms parallèle, modèle rtc.c). */
  localTimeOffset: Time;
  /** Last RTC update for berry trees. */
  lastBerryTreeUpdate: Time;
  /** GCN link flags (= read by Pokémon Colosseum/XD). */
  gcnLinkFlags: number;
  /** Random key XOR'd avec money/coins/PIDs. */
  encryptionKey: number;
  /** Battle Frontier apprentice. */
  playerApprentice: PlayersApprentice;
  /** Past players' apprentices (= record mixing). */
  apprentices: Apprentice[];
  /** Berry crush minigame records. */
  berryCrush: BerryCrush;
  /** Pokémon Jump minigame records. */
  pokeJump: PokemonJumpRecords;
  /** Berry picking minigame records. */
  berryPick: BerryPickingResults;
  /** Battle Frontier ranking hall (1P) records. */
  hallRecords1P: RankingHall1P[][][];   // [HALL_FACILITIES][LVL_MODE][HALL_RECORDS]
  /** Battle Frontier ranking hall (2P) records. */
  hallRecords2P: RankingHall2P[][];     // [LVL_MODE][HALL_RECORDS]
  /** Contest link results. */
  contestLinkResults: number[][];       // [CONTEST_CATEGORIES][CONTESTANT]
  /** Battle Frontier complete data. */
  frontier: BattleFrontier;
}

// ─── SaveBlock1 (1:1 décomp global.h:990) ───────────────────────────────────

export interface SaveBlock1 {
  /** Position courante du joueur dans la map. */
  pos: Coords16;
  /** Map courante (= la map que le joueur visite actuellement). */
  location: WarpData;
  /** Continue game warp : map à recharger au "Continuer". */
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
  /** Weather ID. */
  weather: number;
  weatherCycleStage: number;
  /** Flash level (= dark caves). 0 = no flash. */
  flashLevel: number;
  /** Map layout ID. */
  mapLayoutId: number;
  /** Map view buffer (= 0x100 u16 = backup metatile snapshot). */
  mapView: number[];
  /** Player party (= 1-6 Pokémon). */
  playerPartyCount: number;
  playerParty: PokemonInstance[];
  /** Money (= XOR'd avec encryptionKey dans le décomp). */
  money: number;
  /** Casino coins. */
  coins: number;
  /** Item assigné au bouton SELECT (encoded as itemId number 1:1 décomp ;
   *  notre web port stocke aussi le string key dans `__registeredItemKey`). */
  registeredItem: number;
  /** PC items (= boîte du joueur, 50 slots). */
  pcItems: ItemSlot[];
  /** 1:1 décomp `gSaveBlock1Ptr->bagPocket_Items` (global.h:1012). 30 slots, max 99/slot. */
  bagPocket_Items: ItemSlot[];
  /** 1:1 décomp `gSaveBlock1Ptr->bagPocket_KeyItems` (global.h:1013). 30 slots, max 1/slot. */
  bagPocket_KeyItems: ItemSlot[];
  /** 1:1 décomp `gSaveBlock1Ptr->bagPocket_PokeBalls` (global.h:1014). 16 slots, max 99/slot. */
  bagPocket_PokeBalls: ItemSlot[];
  /** 1:1 décomp `gSaveBlock1Ptr->bagPocket_TMHM` (global.h:1015). 64 slots, max 99/slot, no dup. */
  bagPocket_TMHM: ItemSlot[];
  /** 1:1 décomp `gSaveBlock1Ptr->bagPocket_Berries` (global.h:1016). 46 slots, max 999/slot, no dup. */
  bagPocket_Berries: ItemSlot[];
  /** Pokéblocks (= 40 slots). */
  pokeblocks: Pokeblock[];
  /** Pokédex SEEN bits (= compact bit array). */
  seen1: number[];
  /** Berry blender records. */
  berryBlenderRecords: number[];
  /** Unused 6 bytes. */
  unused_9C2: number[];
  /** Trainer rematch step counter. */
  trainerRematchStepCounter: number;
  /** Trainer rematch tracking. */
  trainerRematches: number[];
  /** Object events state (= dynamic NPCs spawned/removed). */
  objectEvents: ObjectEventSnapshot[];
  /** Object event templates (= per-map customizations from setobjectxyperm). */
  objectEventTemplates: ObjectEventTemplate[];
  /** Flags bit-packés indexés par ID — 1:1 décomp `gSaveBlock1Ptr->flags[id/8]`
   *  (cf. src/game/event_data.ts). `number[]` (PAS Uint8Array : save=JSON.stringify
   *  → number[] round-trip ; typed array non). Taille NUM_FLAG_BYTES. (Migration miroir.) */
  flags: number[];
  /** Vars u16 indexées par (id − VARS_START) — 1:1 décomp `vars[id-0x4000]`. 256 entrées.
   *  (Les special vars 0x8000+ ne sont PAS ici = EWRAM séparé, non sauvé, cf. event_data.ts.) */
  vars: number[];
  /** Game stats (= 64 u32). Indexé par GAME_STAT_X enum. */
  gameStats: number[];
  /** Berry trees (= 128 entries). */
  berryTrees: BerryTree[];
  /** Secret bases (= 20 slots). */
  secretBases: SecretBase[];
  /** Player room decorations + positions. */
  playerRoomDecorations: number[];
  playerRoomDecorationPositions: number[];
  /** Decoration storage. */
  decorationDesks: number[];
  decorationChairs: number[];
  decorationPlants: number[];
  decorationOrnaments: number[];
  decorationMats: number[];
  decorationPosters: number[];
  decorationDolls: number[];
  decorationCushions: number[];
  /** TV shows (= 25 slots). */
  tvShows: TVShow[];
  /** Poké News (= 16 slots). */
  pokeNews: PokeNews[];
  /** Mass outbreak Pokémon. */
  outbreakPokemonSpecies: number;
  outbreakLocationMapNum: number;
  outbreakLocationMapGroup: number;
  outbreakPokemonLevel: number;
  outbreakUnused1: number;
  outbreakUnused2: number;
  outbreakPokemonMoves: number[];
  outbreakUnused3: number;
  outbreakPokemonProbability: number;
  outbreakDaysLeft: number;
  /** Gabby & Ty interview tracking. */
  gabbyAndTyData: GabbyAndTyData;
  /** Easy chat profile + battle words. */
  easyChatProfile: number[];
  easyChatBattleStart: number[];
  easyChatBattleWon: number[];
  easyChatBattleLost: number[];
  /** Mail (= 16 slots). */
  mail: Mail[];
  /** Trendy sayings unlocked bitset. */
  unlockedTrendySayings: number[];
  /** Mauville Old Man (Bard / Storyteller / Giddy / Hipster / Trader). */
  oldMan: OldMan;
  /** Dewford trends (= 5 entries). */
  dewfordTrends: DewfordTrend[];
  /** Contest winners (= 13 entries). */
  contestWinners: ContestWinner[];
  /** Day care. */
  daycare: DayCare;
  /** Link battle records. */
  linkBattleRecords: LinkBattleRecords;
  /** Gift ribbons (= 11 slots). */
  giftRibbons: number[];
  /** External event data (= GameCube link). */
  externalEventData: ExternalEventData;
  /** External event flags. */
  externalEventFlags: ExternalEventFlags;
  /** Roamer (= legendary Latios/Latias). */
  roamer: Roamer;
  /** Enigma berry. */
  enigmaBerry: EnigmaBerry;
  /** Mystery gift / Wonder Card. */
  mysteryGift: MysteryGiftSave;
  /** Unused 0x180 bytes. */
  unused_3598: number[];
  /** Trainer Hill best times. */
  trainerHillTimes: number[];
  /** RAM script (= mystery gift wonder mail). */
  ramScript: RamScript;
  /** Record mixing gift. */
  recordMixingGift: RecordMixingGift;
  /** Pokédex SEEN2 bits (= for link partner record mixing). */
  seen2: number[];
  /** Lilycove Lady (Quiz / Favor / Contest). */
  lilycoveLady: LilycoveLady;
  /** Trainer name records (= 20 entries). */
  trainerNameRecords: TrainerNameRecord[];
  /** Registered Union Room keyboard texts. */
  registeredTexts: string[];
  /** Unused 10 bytes. */
  unused_3D5A: number[];
  /** Trainer Hill save data. */
  trainerHill: TrainerHillSave;
  /** Walda phrase (= PC wallpaper unlock). */
  waldaPhrase: WaldaPhrase;

  // ─── Web-port custom fields (= preserve l'API existante) ─────────────────
  /** Heal location ID set par setrespawn opcode. */
  respawnLocation?: string;
  /** Web-port : mapId string courante (= bridge avec mapGroup/mapNum). */
  __mapId?: string;
  /** Web-port : facing direction au save. */
  __facing?: number;
  /** Web-port : dynamic warp mapId string. */
  __dynamicWarpMapId?: string;
  /** Web-port : registered item string key (= bridge avec registeredItem u16). */
  __registeredItemKey?: string;
  /** Web-port : object positions overlay (= setobjectxyperm cache). */
  __objectPositions?: Record<string, Record<string, { x: number; y: number }>>;
  /** Web-port : taken item balls labels. */
  __takenItemBalls?: string[];
}

// ─── PokemonStorage (1:1 décomp pokemon_storage_system.h:19) ────────────────

/** 1:1 décomp `struct PokemonStorage` (= 14 boxes × 30 slots = 420 BoxPokemon). */
export interface PokemonStorage {
  currentBox: number;
  /** [TOTAL_BOXES_COUNT][IN_BOX_COUNT] = 14 × 30. */
  boxes: BoxPokemonSlot[][];
  /** Box names [TOTAL_BOXES_COUNT][BOX_NAME_LENGTH + 1]. */
  boxNames: string[];
  /** Box wallpapers [TOTAL_BOXES_COUNT]. */
  boxWallpapers: number[];
}

// ─── Factories (= 1:1 décomp ClearSav1 / Sav2_ClearSetDefault) ──────────────

const emptyWarp = (): WarpData => ({ mapGroup: -1, mapNum: -1, warpId: -1, x: -1, y: -1 });
const emptyTime = (): Time => ({ days: 0, hours: 0, minutes: 0, seconds: 0 });
const emptyCoords = (): Coords16 => ({ x: 0, y: 0 });
const arr = <T>(n: number, fn: () => T): T[] => Array.from({ length: n }, fn);
const arr2 = <T>(n: number, m: number, fn: () => T): T[][] => arr(n, () => arr(m, fn));
const zeros = (n: number): number[] => arr(n, () => 0);

function emptyPokedex(): Pokedex {
  return {
    order: 0, mode: 0, nationalMagic: 0, unknown2: 0,
    unownPersonality: 0, spindaPersonality: 0, unknown3: 0,
    owned: zeros(NUM_DEX_FLAG_BYTES),
    seen: zeros(NUM_DEX_FLAG_BYTES),
  };
}

function emptyBerry2(): Berry2 {
  return {
    name: '', firmness: 0, size: 0, maxYield: 0, minYield: 0,
    description1: '', description2: '', stageDuration: 0,
    spicy: 0, dry: 0, sweet: 0, bitter: 0, sour: 0, smoothness: 0,
  };
}

function emptyBattleTowerPokemon(): BattleTowerPokemon {
  return {
    species: 0, heldItem: 0, moves: zeros(MAX_MON_MOVES), level: 0,
    ppBonuses: 0, hpEV: 0, attackEV: 0, defenseEV: 0, speedEV: 0,
    spAttackEV: 0, spDefenseEV: 0, otId: 0,
    hpIV: 0, attackIV: 0, defenseIV: 0, speedIV: 0,
    spAttackIV: 0, spDefenseIV: 0, abilityNum: 0, personality: 0,
    nickname: '', friendship: 0,
  };
}

function emptyEmeraldBattleTowerRecord(): EmeraldBattleTowerRecord {
  return {
    lvlMode: 0, facilityClass: 0, winStreak: 0, name: '',
    trainerId: zeros(TRAINER_ID_LENGTH),
    greeting: zeros(EASY_CHAT_BATTLE_WORDS_COUNT),
    speechWon: zeros(EASY_CHAT_BATTLE_WORDS_COUNT),
    speechLost: zeros(EASY_CHAT_BATTLE_WORDS_COUNT),
    party: arr(MAX_FRONTIER_PARTY_SIZE, emptyBattleTowerPokemon),
    language: 0, checksum: 0,
  };
}

function emptyBattleFrontier(): BattleFrontier {
  return {
    towerPlayer: emptyEmeraldBattleTowerRecord(),
    towerRecords: arr(5, emptyEmeraldBattleTowerRecord),
    towerInterview: { playerSpecies: 0, opponentSpecies: 0, opponentName: '', opponentMonNickname: '', opponentLanguage: 0 },
    ereaderTrainer: {
      unk0: 0, facilityClass: 0, winStreak: 0, name: '',
      trainerId: zeros(TRAINER_ID_LENGTH),
      greeting: zeros(EASY_CHAT_BATTLE_WORDS_COUNT),
      farewellPlayerLost: zeros(EASY_CHAT_BATTLE_WORDS_COUNT),
      farewellPlayerWon: zeros(EASY_CHAT_BATTLE_WORDS_COUNT),
      party: arr(FRONTIER_PARTY_SIZE, emptyBattleTowerPokemon),
      checksum: 0,
    },
    challengeStatus: 0, lvlMode: 0, challengePaused: 0, disableRecordBattle: 0,
    selectedPartyMons: zeros(MAX_FRONTIER_PARTY_SIZE),
    curChallengeBattleNum: 0, trainerIds: zeros(20),
    winStreakActiveFlags: 0,
    towerWinStreaks: arr2(4, FRONTIER_LVL_MODE_COUNT, () => 0),
    towerRecordWinStreaks: arr2(4, FRONTIER_LVL_MODE_COUNT, () => 0),
    battledBrainFlags: 0, towerSinglesStreak: 0, towerNumWins: 0,
    towerBattleOutcome: 0, towerLvlMode: 0,
    domeAttemptedSingles50: 0, domeAttemptedSinglesOpen: 0,
    domeHasWonSingles50: 0, domeHasWonSinglesOpen: 0,
    domeAttemptedDoubles50: 0, domeAttemptedDoublesOpen: 0,
    domeHasWonDoubles50: 0, domeHasWonDoublesOpen: 0,
    domeUnused: 0, domeLvlMode: 0, domeBattleMode: 0,
    domeWinStreaks: arr2(2, FRONTIER_LVL_MODE_COUNT, () => 0),
    domeRecordWinStreaks: arr2(2, FRONTIER_LVL_MODE_COUNT, () => 0),
    domeTotalChampionships: arr2(2, FRONTIER_LVL_MODE_COUNT, () => 0),
    domeTrainers: arr(16, () => ({ trainerId: 0, isEliminated: 0, eliminatedAt: 0, forfeited: 0 })),
    domeMonIds: arr2(16, FRONTIER_PARTY_SIZE, () => 0),
    unused_DC4: 0,
    palacePrize: 0,
    palaceWinStreaks: arr2(2, FRONTIER_LVL_MODE_COUNT, () => 0),
    palaceRecordWinStreaks: arr2(2, FRONTIER_LVL_MODE_COUNT, () => 0),
    arenaPrize: 0,
    arenaWinStreaks: zeros(FRONTIER_LVL_MODE_COUNT),
    arenaRecordStreaks: zeros(FRONTIER_LVL_MODE_COUNT),
    factoryWinStreaks: arr2(2, FRONTIER_LVL_MODE_COUNT, () => 0),
    factoryRecordWinStreaks: arr2(2, FRONTIER_LVL_MODE_COUNT, () => 0),
    factoryRentsCount: arr2(2, FRONTIER_LVL_MODE_COUNT, () => 0),
    factoryRecordRentsCount: arr2(2, FRONTIER_LVL_MODE_COUNT, () => 0),
    pikePrize: 0,
    pikeWinStreaks: zeros(FRONTIER_LVL_MODE_COUNT),
    pikeRecordStreaks: zeros(FRONTIER_LVL_MODE_COUNT),
    pikeTotalStreaks: zeros(FRONTIER_LVL_MODE_COUNT),
    pikeHintedRoomIndex: 0, pikeHintedRoomType: 0, pikeHealingRoomsDisabled: 0,
    pikeHeldItemsBackup: zeros(FRONTIER_PARTY_SIZE),
    pyramidPrize: 0,
    pyramidWinStreaks: zeros(FRONTIER_LVL_MODE_COUNT),
    pyramidRecordStreaks: zeros(FRONTIER_LVL_MODE_COUNT),
    pyramidRandoms: zeros(4),
    pyramidTrainerFlags: 0,
    pyramidBag: {
      itemId: arr2(FRONTIER_LVL_MODE_COUNT, PYRAMID_BAG_ITEMS_COUNT, () => 0),
      quantity: arr2(FRONTIER_LVL_MODE_COUNT, PYRAMID_BAG_ITEMS_COUNT, () => 0),
    },
    pyramidLightRadius: 0,
    verdanturfTentPrize: 0, fallarborTentPrize: 0, slateportTentPrize: 0,
    rentalMons: arr(FRONTIER_PARTY_SIZE * 2, () => ({ monId: 0, personality: 0, ivs: 0, abilityNum: 0 })),
    battlePoints: 0, cardBattlePoints: 0, battlesCount: 0,
    domeWinningMoves: zeros(16),
    trainerFlags: 0,
    opponentNames: arr(FRONTIER_LVL_MODE_COUNT, () => ''),
    opponentTrainerIds: arr2(FRONTIER_LVL_MODE_COUNT, TRAINER_ID_LENGTH, () => 0),
    unk_EF9: 0, savedGame: 0, unused_EFA: 0, unused_EFB: 0,
    domePlayerPartyData: arr(FRONTIER_PARTY_SIZE, () => ({
      moves: zeros(MAX_MON_MOVES), evs: zeros(NUM_STATS), nature: 0,
    })),
  };
}

function emptyApprentice(): Apprentice {
  return {
    id: 0, lvlMode: 0, numQuestions: 0, number: 0,
    party: arr(MULTI_PARTY_SIZE, () => ({ species: 0, moves: zeros(MAX_MON_MOVES), item: 0 })),
    speechWon: zeros(EASY_CHAT_BATTLE_WORDS_COUNT),
    playerId: zeros(TRAINER_ID_LENGTH),
    playerName: '', language: 0, checksum: 0,
  };
}

function emptyMail(): Mail {
  return {
    words: zeros(MAIL_WORDS_COUNT),
    playerName: [EOS],
    trainerId: zeros(TRAINER_ID_LENGTH),
    species: 0, itemId: 0,
  };
}

function emptyDaycareMail(): DaycareMail {
  return { message: emptyMail(), otName: '', monName: '', gameLanguage: 0, monLanguage: 0 };
}

function emptyDayCare(): DayCare {
  return {
    mons: arr(DAYCARE_MON_COUNT, () => ({ mon: null, mail: emptyDaycareMail(), steps: 0 })),
    offspringPersonality: 0, stepCounter: 0,
  };
}

function emptySecretBase(): SecretBase {
  return {
    secretBaseId: 0, toRegister: 0, gender: 0, battledOwnerToday: 0, registryStatus: 0,
    trainerName: '', trainerId: zeros(TRAINER_ID_LENGTH), language: 0,
    numSecretBasesReceived: 0, numTimesEntered: 0, unused: 0,
    decorations: zeros(DECOR_MAX_SECRET_BASE),
    decorationPositions: zeros(DECOR_MAX_SECRET_BASE),
    party: {
      personality: zeros(PARTY_SIZE), moves: zeros(PARTY_SIZE * MAX_MON_MOVES),
      species: zeros(PARTY_SIZE), heldItems: zeros(PARTY_SIZE),
      levels: zeros(PARTY_SIZE), EVs: zeros(PARTY_SIZE),
    },
  };
}

function emptyMysteryGift(): MysteryGiftSave {
  return {
    newsCrc: 0,
    news: { id: 0, sendType: 0, bgType: 0, titleText: '', bodyText: arr(WONDER_NEWS_BODY_TEXT_LINES, () => '') },
    cardCrc: 0,
    card: {
      flagId: 0, iconSpecies: 0, idNumber: 0, type: 0, bgType: 0, sendType: 0, maxStamps: 0,
      titleText: '', subtitleText: '',
      bodyText: arr(WONDER_CARD_BODY_TEXT_LINES, () => ''),
      footerLine1Text: '', footerLine2Text: '',
    },
    cardMetadataCrc: 0,
    cardMetadata: {
      battlesWon: 0, battlesLost: 0, numTrades: 0, iconSpecies: 0,
      stampData: arr2(2, MAX_STAMP_CARD_STAMPS, () => 0),
    },
    questionnaireWords: zeros(NUM_QUESTIONNAIRE_WORDS),
    newsMetadata: { newsType: 0, sentRewardCounter: 0, rewardCounter: 0, berry: 0 },
    trainerIds: arr2(2, 5, () => 0),
  };
}

function emptyEnigmaBerry(): EnigmaBerry {
  return {
    berry: emptyBerry2(),
    itemEffect: zeros(BERRY_ITEM_EFFECT_COUNT),
    holdEffect: 0, holdEffectParam: 0, checksum: 0,
  };
}

function emptyExternalEventData(): ExternalEventData {
  return {
    unknownExternalDataFields1: zeros(7),
    unknownExternalDataFields2: 0, currentPokeCoupons: 0,
    gotGoldPokeCouponTitleReward: 0, gotSilverPokeCouponTitleReward: 0,
    gotBronzePokeCouponTitleReward: 0, receivedAgetoCelebi: 0,
    unknownExternalDataFields3: 0, totalEarnedPokeCoupons: 0,
    unknownExternalDataFields4: zeros(5),
  };
}

function emptyExternalEventFlags(): ExternalEventFlags {
  return {
    usedBoxRS: 0, boxRSEggsUnlocked: 0,
    unknownFlag1: 0, receivedGCNJirachi: 0, unknownFlag3: 0,
    unknownFlag4: 0, unknownFlag5: 0, unknownFlag6: 0, unknownFlag7: 0,
    unknownFlag8: 0, unknownFlag9: 0, unknownFlag10: 0, unknownFlag11: 0,
    unknownFlag12: 0, unknownFlag13: 0, unknownFlag14: 0, unknownFlag15: 0,
    unknownFlag16: 0, unknownFlag17: 0, unknownFlag18: 0, unknownFlag19: 0,
    unknownFlag20: 0,
  };
}

function emptyTVShow(): TVShow { return { kind: 0, active: 0 }; }

function emptyOldMan(): OldMan { return { id: 0, kind: 'common' }; }

function emptyLilycoveLady(): LilycoveLady {
  return {
    id: 0, kind: 'quiz', state: 0,
    question: zeros(QUIZ_QUESTION_LEN),
    correctAnswer: 0, playerAnswer: 0, playerName: '',
    playerTrainerId: zeros(TRAINER_ID_LENGTH),
    prize: 0, waitingForChallenger: 0, questionId: 0, prevQuestionId: 0, language: 0,
  };
}

/** 1:1 décomp `Sav2_ClearSetDefault` (load_save.c). */
export function emptySaveBlock2(): SaveBlock2 {
  return {
    playerName: [EOS], playerGender: 0, specialSaveWarpFlags: 0, playerTrainerId: 0,
    playTimeHours: 0, playTimeMinutes: 0, playTimeSeconds: 0, playTimeVBlanks: 0,
    optionsButtonMode: 0, optionsTextSpeed: 1, optionsWindowFrameType: 0,
    optionsSound: 0, optionsBattleStyle: 0, optionsBattleSceneOff: 0, regionMapZoom: 0,
    pokedex: emptyPokedex(),
    filler_90: zeros(8),
    localTimeOffset: emptyTime(),
    lastBerryTreeUpdate: emptyTime(),
    gcnLinkFlags: 0, encryptionKey: 0,
    playerApprentice: {
      id: 0, lvlMode: 0, questionsAnswered: 0, leadMonId: 0, party: 0, saveId: 0, unused: 0,
      speciesIds: zeros(MULTI_PARTY_SIZE),
      questions: arr(APPRENTICE_MAX_QUESTIONS, () => ({
        questionId: 0, monId: 0, moveSlot: 0, suggestedChange: 0, data: 0,
      })),
    },
    apprentices: arr(APPRENTICE_COUNT, emptyApprentice),
    berryCrush: { pressingSpeeds: zeros(4), berryPowderAmount: 0, unk: 0 },
    pokeJump: { jumpsInRow: 0, unused1: 0, excellentsInRow: 0, gamesWithMaxPlayers: 0, unused2: 0, bestJumpScore: 0 },
    berryPick: {
      bestScore: 0, berriesPicked: 0, berriesPickedInRow: 0,
      field_8: 0, field_9: 0, field_A: 0, field_B: 0,
      field_C: 0, field_D: 0, field_E: 0, field_F: 0,
    },
    hallRecords1P: arr2(HALL_FACILITIES_COUNT, FRONTIER_LVL_MODE_COUNT, () => arr(HALL_RECORDS_COUNT, () => ({
      id: zeros(TRAINER_ID_LENGTH), winStreak: 0, name: '', language: 0,
    }))) as RankingHall1P[][][],
    hallRecords2P: arr(FRONTIER_LVL_MODE_COUNT, () => arr(HALL_RECORDS_COUNT, () => ({
      id1: zeros(TRAINER_ID_LENGTH), id2: zeros(TRAINER_ID_LENGTH),
      winStreak: 0, name1: '', name2: '', language: 0,
    }))) as RankingHall2P[][],
    contestLinkResults: arr2(CONTEST_CATEGORIES_COUNT, CONTESTANT_COUNT, () => 0),
    frontier: emptyBattleFrontier(),
  };
}

/** 1:1 décomp `ClearSav1` (load_save.c). Bag pockets init 1:1 strict
 *  (= 5 fields séparés `bagPocket_*`, capacités fixes BAG_*_COUNT depuis
 *  bag-types.ts). Plus de paramètre `emptyBag` (= ancien composite Bag retiré). */
export function emptySaveBlock1(): SaveBlock1 {
  // 1:1 décomp global.h:1012-1016 : 5 arrays séparés dans SaveBlock1.
  const emptyItemSlots = (n: number): ItemSlot[] =>
    Array.from({ length: n }, () => ({ itemKey: '', quantity: 0 }));
  return {
    pos: emptyCoords(),
    location: emptyWarp(),
    continueGameWarp: emptyWarp(),
    dynamicWarp: emptyWarp(),
    lastHealLocation: emptyWarp(),
    escapeWarp: emptyWarp(),
    savedMusic: 0, weather: 0, weatherCycleStage: 0, flashLevel: 0, mapLayoutId: 0,
    mapView: zeros(0x100),
    playerPartyCount: 0, playerParty: [],
    money: 0, coins: 0, registeredItem: 0,
    pcItems: arr(PC_ITEMS_COUNT, () => ({ itemKey: '', quantity: 0 })),
    // 1:1 décomp global.h:1012-1016 — 5 bagPocket_* arrays séparés.
    bagPocket_Items: emptyItemSlots(30),       // BAG_ITEMS_COUNT
    bagPocket_KeyItems: emptyItemSlots(30),    // BAG_KEYITEMS_COUNT
    bagPocket_PokeBalls: emptyItemSlots(16),   // BAG_POKEBALLS_COUNT
    bagPocket_TMHM: emptyItemSlots(64),        // BAG_TMHM_COUNT
    bagPocket_Berries: emptyItemSlots(46),     // BAG_BERRIES_COUNT
    pokeblocks: arr(POKEBLOCKS_COUNT, () => ({ color: 0, spicy: 0, dry: 0, sweet: 0, bitter: 0, sour: 0, feel: 0 })),
    seen1: zeros(NUM_DEX_FLAG_BYTES),
    berryBlenderRecords: zeros(3),
    unused_9C2: zeros(6),
    trainerRematchStepCounter: 0,
    trainerRematches: zeros(MAX_REMATCH_ENTRIES),
    objectEvents: [],
    objectEventTemplates: [],
    flags: new Array(NUM_FLAG_BYTES).fill(0),
    vars: new Array(256 /* VARS_COUNT 0x4000..0x40FF */).fill(0),
    gameStats: zeros(NUM_GAME_STATS),
    berryTrees: arr(BERRY_TREES_COUNT, () => ({
      berry: 0, stage: 0, stopGrowth: 0, minutesUntilNextStage: 0,
      berryYield: 0, regrowthCount: 0,
      watered1: 0, watered2: 0, watered3: 0, watered4: 0,
    })),
    secretBases: arr(SECRET_BASES_COUNT, emptySecretBase),
    playerRoomDecorations: zeros(DECOR_MAX_PLAYERS_HOUSE),
    playerRoomDecorationPositions: zeros(DECOR_MAX_PLAYERS_HOUSE),
    decorationDesks: zeros(10),
    decorationChairs: zeros(10),
    decorationPlants: zeros(10),
    decorationOrnaments: zeros(30),
    decorationMats: zeros(30),
    decorationPosters: zeros(10),
    decorationDolls: zeros(40),
    decorationCushions: zeros(10),
    tvShows: arr(TV_SHOWS_COUNT, emptyTVShow),
    pokeNews: arr(POKE_NEWS_COUNT, () => ({ kind: 0, state: 0, dayCountdown: 0 })),
    outbreakPokemonSpecies: 0, outbreakLocationMapNum: 0, outbreakLocationMapGroup: 0,
    outbreakPokemonLevel: 0, outbreakUnused1: 0, outbreakUnused2: 0,
    outbreakPokemonMoves: zeros(MAX_MON_MOVES),
    outbreakUnused3: 0, outbreakPokemonProbability: 0, outbreakDaysLeft: 0,
    gabbyAndTyData: {
      mon1: 0, mon2: 0, lastMove: 0, quote: zeros(1), mapnum: 0, battleNum: 0,
      battleTookMoreThanOneTurn: 0, playerLostAMon: 0,
      playerUsedHealingItem: 0, playerThrewABall: 0, onAir: 0, valA_5: 0,
      battleTookMoreThanOneTurn2: 0, playerLostAMon2: 0,
      playerUsedHealingItem2: 0, playerThrewABall2: 0, valB_4: 0,
    },
    easyChatProfile: zeros(EASY_CHAT_BATTLE_WORDS_COUNT),
    easyChatBattleStart: zeros(EASY_CHAT_BATTLE_WORDS_COUNT),
    easyChatBattleWon: zeros(EASY_CHAT_BATTLE_WORDS_COUNT),
    easyChatBattleLost: zeros(EASY_CHAT_BATTLE_WORDS_COUNT),
    mail: arr(MAIL_COUNT, emptyMail),
    unlockedTrendySayings: zeros(NUM_TRENDY_SAYING_BYTES),
    oldMan: emptyOldMan(),
    dewfordTrends: arr(SAVED_TRENDS_COUNT, () => ({
      trendiness: 0, maxTrendiness: 0, gainingTrendiness: 0, rand: 0, words: zeros(2),
    })),
    contestWinners: arr(NUM_CONTEST_WINNERS, () => ({
      personality: 0, trainerId: 0, species: 0, contestCategory: 0,
      monName: '', trainerName: '', contestRank: 0,
    })),
    daycare: emptyDayCare(),
    linkBattleRecords: {
      entries: arr(5, () => ({ name: '', trainerId: 0, wins: 0, losses: 0, draws: 0 })),
      languages: zeros(5),
    },
    giftRibbons: zeros(GIFT_RIBBONS_COUNT),
    externalEventData: emptyExternalEventData(),
    externalEventFlags: emptyExternalEventFlags(),
    roamer: { ivs: 0, personality: 0, species: 0, hp: 0, level: 0, status: 0, cool: 0, beauty: 0, cute: 0, smart: 0, tough: 0, active: 0 },
    enigmaBerry: emptyEnigmaBerry(),
    mysteryGift: emptyMysteryGift(),
    unused_3598: zeros(0x180),
    trainerHillTimes: zeros(NUM_TRAINER_HILL_MODES),
    ramScript: { checksum: 0, data: { magic: 0, mapGroup: 0, mapNum: 0, localId: 0, script: zeros(995) } },
    recordMixingGift: { checksum: 0, data: { unk0: 0, quantity: 0, itemId: 0, filler4: zeros(8) } },
    seen2: zeros(NUM_DEX_FLAG_BYTES),
    lilycoveLady: emptyLilycoveLady(),
    trainerNameRecords: arr(20, () => ({ trainerId: 0, trainerName: '' })),
    registeredTexts: arr(UNION_ROOM_KB_ROW_COUNT, () => ''),
    unused_3D5A: zeros(10),
    trainerHill: {
      timer: 0, bestTime: 0, unk_3D6C: 0, unused: 0,
      receivedPrize: 0, checkedFinalTime: 0, spokeToOwner: 0,
      hasLost: 0, maybeECardScanDuringChallenge: 0, field_3D6E_0f: 0, mode: 0,
    },
    waldaPhrase: { colors: zeros(2), text: '', iconId: 0, patternId: 0, patternUnlocked: 0 },
  };
}

// 1:1 décomp `MAX_DEFAULT_WALLPAPER` = `WALLPAPER_SAVANNA` = 3
// (data/wallpapers.h:21 + enum:1-5 FOREST=0/CITY=1/DESERT=2/SAVANNA=3).
// Pas exporté dans decomp-data → const locale citée (≠ hardcode aveugle).
const MAX_DEFAULT_WALLPAPER = 3;

/** 1:1 décomp `ResetPokemonStorageSystem(void)` (pokemon_storage_system.c
 *  :1729-1748) :
 *    SetCurrentBox(0) ;
 *    ZeroBoxMonAt(tous)            → slots `null` (= BoxPokemon zeroé,
 *                                     hasSpecies 0 = vide) ;
 *    boxNames[i] = gText_Box + ConvertIntToDecimalStringN(i+1, LEFT_ALIGN,2)
 *                = "BOITE " + (i+1)  (strings.c:944 gText_Box = _("BOITE "),
 *                  décomp FR) → "BOITE 1".."BOITE 14" ;
 *    boxWallpapers[i] = i % (MAX_DEFAULT_WALLPAPER + 1) = i % 4 ;
 *  (ResetWaldaWallpaper = subsystem Walda déféré, sans effet sur ce format). */
export function emptyPokemonStorage(): PokemonStorage {
  return {
    currentBox: 0,
    boxes: arr2(TOTAL_BOXES_COUNT, IN_BOX_COUNT, () => null as BoxPokemonSlot),
    boxNames: Array.from({ length: TOTAL_BOXES_COUNT }, (_, i) => `BOITE ${i + 1}`),
    boxWallpapers: Array.from({ length: TOTAL_BOXES_COUNT }, (_, i) => i % (MAX_DEFAULT_WALLPAPER + 1)),
  };
}
