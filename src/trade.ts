// ─────────────────────────────────────────────────────────────────────────────
// trade.ts — port 1:1 du CHEMIN SOLO de decomp `src/trade.c` (in-game trades).
//
// Périmètre porté (VIS-25) : les ~5 échanges PNJ in-game (PIPIO→RALTS,
// SIPO→VOLBEAT, HYPY→BAGON, GNAGNAA→SKITTY). On transcrit ligne-à-ligne :
//   - struct InGameTrade + data sIngameTrades / sIngameTradeMail
//   - GetInGameTradeSpeciesInfo / BufferInGameTradeMonName
//   - CreateInGameTradePokemonInternal / CreateInGameTradePokemon
//   - GetInGameTradeMail / GetTradeSpecies
//   - TradeMons / UpdatePokedexForReceivedMon / TryEnableNationalDexFromLinkPartner
//
// EXCLU (LINK / anim complète) : toute la séquence d'animation CB2_InitInGameTrade
// / DoTradeAnim / LoadTradeMonPic / sprite-sheets / VBlankCB_TradeAnim (~1500 l.,
// OAM/DMA/affine) N'EST PAS portée ici. Le spec autorise, si l'anim est trop
// grosse : « échange de données 1:1 + fondu simple PRÉCÉDENTÉ + signale l'anim en
// reste ». → PerformInGameTradeDataExchange() ci-bas exécute l'extrait DONNÉES du
// case STATE_TRY_EVOLUTION (trade.c:3873) : TradeMons + evolution check. L'anim
// visuelle reste à porter (voir note en bas de fichier).
//
// specials-registry.ts est VERROUILLÉ : les 4 specials (GetInGameTradeSpeciesInfo,
// GetTradeSpecies, CreateInGameTradePokemon, DoInGameTradeScene) sont exportés ici
// et à câbler côté registry (cf. note fin de fichier).
// ─────────────────────────────────────────────────────────────────────────────

import type { Pokemon } from './pokemon';
import {
  gPlayerParty, gEnemyParty, CreateMon, CopyMon, createEmptyPokemon,
  GetMonData, SetMonData, CalculateMonStats, GetEvolutionTargetSpecies,
  SpeciesToNationalPokedexNum, HandleSetPokedexFlag,
} from './pokemon';
import {
  MON_DATA_LEVEL, MON_DATA_HP_IV, MON_DATA_ATK_IV, MON_DATA_DEF_IV,
  MON_DATA_SPEED_IV, MON_DATA_SPATK_IV, MON_DATA_SPDEF_IV, MON_DATA_NICKNAME,
  MON_DATA_OT_NAME, MON_DATA_OT_GENDER, MON_DATA_ABILITY_NUM, MON_DATA_BEAUTY,
  MON_DATA_CUTE, MON_DATA_COOL, MON_DATA_SMART, MON_DATA_TOUGH, MON_DATA_SHEEN,
  MON_DATA_MET_LOCATION, MON_DATA_MAIL, MON_DATA_HELD_ITEM, MON_DATA_IS_EGG,
  MON_DATA_SPECIES, MON_DATA_PERSONALITY, MON_DATA_FRIENDSHIP,
} from '../include/pokemon';
import { OT_ID_PRESET, EVO_MODE_TRADE, NUM_STATS } from '../include/constants/pokemon';
import {
  PARTY_SIZE, CONTEST_CATEGORIES_COUNT, MAIL_WORDS_COUNT,
  MALE, FEMALE, PLAYER_NAME_LENGTH,
} from '../include/constants/global';
import { ITEM_NONE, ITEM_CHESTO_BERRY, ITEM_WOOD_MAIL, ITEM_WAVE_MAIL, ITEM_RETRO_MAIL } from '../include/constants/items';
import {
  SPECIES_SEEDOT, SPECIES_PLUSLE, SPECIES_HORSEA, SPECIES_MEOWTH,
  SPECIES_RALTS, SPECIES_VOLBEAT, SPECIES_BAGON, SPECIES_SKITTY,
} from '../include/constants/species';
import { METLOC_IN_GAME_TRADE } from '../include/constants/region_map_sections';
import { EOS } from '../include/constants/characters';
import { CHAR_SPACE, ItemIsMail, ClearMail, GiveMailToMon } from './mail_data';
import type { Mail } from './engine/save/save-blocks';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { StringCopy, StringLength } from './string_util';
import { PadNameString } from './international_string_util';
import { encodeOwText } from './text';
import { setStringVar } from './text';
import { gSpeciesNames } from './engine/data/game-data';
import { GetSetPokedexFlag } from './pokedex';
import { FLAG_SET_SEEN, FLAG_SET_CAUGHT } from '../include/pokedex';
import { TradeEvolutionScene, SetCB2AfterEvolution } from './evolution_scene';
import { VarGet } from './engine/script/script-vars';

// ─── Constantes trade (1:1 include/constants/trade.h) ────────────────────────
export const TRADE_PLAYER = 0;
export const TRADE_PARTNER = 1;

export const INGAME_TRADE_SEEDOT = 0;
export const INGAME_TRADE_PLUSLE = 1;
export const INGAME_TRADE_HORSEA = 2;
export const INGAME_TRADE_MEOWTH = 3;

// ─── Easy-chat encoders (1:1 include/constants/easy_chat.h) ──────────────────
// Les macros EC_WORD/EC_POKEMON du décomp ne sont pas exportées par easy_chat.ts ;
// on les recalcule ici avec les MÊMES valeurs numériques que decomp easy_chat.h
// (EC_MASK_BITS 9 ; EC_GROUP_* :31-52). C'est le calcul décomp à l'identique.
const EC_MASK_BITS = 9;
const EC_GROUP_POKEMON = 0;
const EC_GROUP_STATUS = 2;
const EC_GROUP_GREETINGS = 4;
const EC_GROUP_VOICES = 6;
const EC_GROUP_SPEECH = 7;
const EC_GROUP_ENDINGS = 8;
const EC_GROUP_FEELINGS = 9;
const EC_GROUP_ACTIONS = 11;
const EC_GROUP_EVENTS = 17;
const EC_GROUP_POKEMON_NATIONAL = 21;
const EC_WORD = (group: number, idx: number): number => ((group << EC_MASK_BITS) | idx) >>> 0;
const EC_POKEMON = (species: number): number => EC_WORD(EC_GROUP_POKEMON, species);
const EC_POKEMON_NATIONAL = (species: number): number => EC_WORD(EC_GROUP_POKEMON_NATIONAL, species);
const EC_EMPTY_WORD = 0xFFFF;

// Mots easy-chat utilisés par sIngameTradeMail (1:1 easy_chat.h, index cité).
const EC_WORD_TOUGH = EC_WORD(EC_GROUP_STATUS, 51);
const EC_WORD_THANK_YOU = EC_WORD(EC_GROUP_GREETINGS, 17);
const EC_WORD_EXCL = EC_WORD(EC_GROUP_VOICES, 0);
const EC_WORD_CRY = EC_WORD(EC_GROUP_VOICES, 25);
const EC_WORD_AND = EC_WORD(EC_GROUP_SPEECH, 21);
const EC_WORD_EVEN_SO = EC_WORD(EC_GROUP_SPEECH, 31);
const EC_WORD_FANTASTIC = EC_WORD(EC_GROUP_SPEECH, 59);
const EC_WORD_IS = EC_WORD(EC_GROUP_ENDINGS, 11);
const EC_WORD_LET_S = EC_WORD(EC_GROUP_ENDINGS, 13);
const EC_WORD_A = EC_WORD(EC_GROUP_ENDINGS, 32);
const EC_WORD_FOR = EC_WORD(EC_GROUP_ENDINGS, 43);
const EC_WORD_WITH = EC_WORD(EC_GROUP_ENDINGS, 48);
const EC_WORD_NICE = EC_WORD(EC_GROUP_FEELINGS, 50);
const EC_WORD_PLEASE = EC_WORD(EC_GROUP_ACTIONS, 17);
const EC_WORD_TRAINS = EC_WORD(EC_GROUP_ACTIONS, 25);
const EC_WORD_SUPER = EC_WORD(EC_GROUP_EVENTS, 7);

// ─── struct InGameTrade (1:1 trade.c:150) ────────────────────────────────────
// Adaptation modèle PLAT : nickname/otName = string JS (le modèle Pokemon stocke
// les noms en string, cf. daycare.ts:253 qui ré-encode) ; l'octet-source `_()`
// du décomp est ré-obtenu par encodeOwText() quand un chemin byte l'exige
// (GetInGameTradeMail). ivs/conditions = number[] (u8[]).
export interface InGameTrade {
  nickname: string;                 // u8 nickname[POKEMON_NAME_LENGTH + 1]
  species: number;                  // u16
  ivs: number[];                    // u8 ivs[NUM_STATS]
  abilityNum: number;               // u8
  otId: number;                     // u32
  conditions: number[];             // u8 conditions[CONTEST_CATEGORIES_COUNT]
  personality: number;              // u32
  heldItem: number;                 // u16
  mailNum: number;                  // u8  (0xFF / -1 = pas de mail)
  otName: string;                   // u8 otName[TRAINER_NAME_LENGTH + 1]
  otGender: number;                 // u8
  sheen: number;                    // u8
  requestedSpecies: number;         // u16
}

// ─── sIngameTrades (1:1 data/trade.h:985) ────────────────────────────────────
const sIngameTrades: InGameTrade[] = [];
sIngameTrades[INGAME_TRADE_SEEDOT] = {
  nickname: 'PIPIO',
  species: SPECIES_SEEDOT,
  ivs: [5, 4, 5, 4, 4, 4],
  abilityNum: 1,
  otId: 38726,
  conditions: [30, 5, 5, 5, 5],
  personality: 0x84,
  heldItem: ITEM_CHESTO_BERRY,
  mailNum: 0xFF,                     // -1 (u8) — pas de mail
  otName: 'KOBE',
  otGender: MALE,
  sheen: 10,
  requestedSpecies: SPECIES_RALTS,
};
sIngameTrades[INGAME_TRADE_PLUSLE] = {
  nickname: 'SIPO',
  species: SPECIES_PLUSLE,
  ivs: [4, 4, 4, 5, 5, 4],
  abilityNum: 0,
  otId: 73996,
  conditions: [5, 5, 30, 5, 5],
  personality: 0x6F,
  heldItem: ITEM_WOOD_MAIL,
  mailNum: 0,
  otName: 'ALBAN',
  otGender: MALE,
  sheen: 10,
  requestedSpecies: SPECIES_VOLBEAT,
};
sIngameTrades[INGAME_TRADE_HORSEA] = {
  nickname: 'HYPY',
  species: SPECIES_HORSEA,
  ivs: [5, 4, 4, 4, 5, 4],
  abilityNum: 0,
  otId: 46285,
  conditions: [5, 5, 5, 5, 30],
  personality: 0x7F,
  heldItem: ITEM_WAVE_MAIL,
  mailNum: 1,
  otName: 'LUDOVIC',
  otGender: MALE,
  sheen: 10,
  requestedSpecies: SPECIES_BAGON,
};
sIngameTrades[INGAME_TRADE_MEOWTH] = {
  nickname: 'GNAGNAA',
  species: SPECIES_MEOWTH,
  ivs: [4, 5, 4, 5, 4, 4],
  abilityNum: 0,
  otId: 91481,
  conditions: [5, 5, 5, 30, 5],
  personality: 0x8B,
  heldItem: ITEM_RETRO_MAIL,
  mailNum: 2,
  otName: 'ISIS',
  otGender: FEMALE,
  sheen: 10,
  requestedSpecies: SPECIES_SKITTY,
};

// ─── sIngameTradeMail (1:1 data/trade.h:1053) ────────────────────────────────
// u16[][MAIL_WORDS_COUNT + 1] — les mails attachés aux 3 mons échangés qui
// tiennent un courrier (Plusle/Horsea/Meowth).
const sIngameTradeMail: number[][] = [
  [
    EC_WORD_LET_S,
    EC_WORD_NICE,
    EC_WORD_WITH,
    EC_POKEMON(SPECIES_PLUSLE),
    EC_WORD_AND,
    EC_POKEMON(SPECIES_VOLBEAT),
    EC_WORD_IS,
    EC_WORD_FANTASTIC,
    EC_EMPTY_WORD,
  ],
  [
    EC_POKEMON(SPECIES_BAGON),
    EC_WORD_IS,
    EC_WORD_TOUGH,
    EC_WORD_EXCL,
    EC_WORD_TRAINS,
    EC_POKEMON(SPECIES_HORSEA),
    EC_WORD_PLEASE,
    EC_WORD_EXCL,
    EC_EMPTY_WORD,
  ],
  [
    EC_WORD_THANK_YOU,
    EC_WORD_FOR,
    EC_POKEMON(SPECIES_SKITTY),
    EC_EMPTY_WORD,
    EC_POKEMON_NATIONAL(SPECIES_MEOWTH),
    EC_WORD_EVEN_SO,
    EC_WORD_A,
    EC_WORD_SUPER,
    EC_WORD_CRY,
  ],
];

// ─── gTradeMail (1:1 pokemon.c `struct Mail gTradeMail[PARTY_SIZE]`) ─────────
// Tampon des courriers reçus lors d'un trade (in-game & link). Écrit par
// CreateInGameTradePokemonInternal, lu par TradeMons via GiveMailToMon.
function emptyTradeMail(): Mail {
  return {
    words: new Array(MAIL_WORDS_COUNT).fill(EC_EMPTY_WORD),
    playerName: [EOS],
    trainerId: [0, 0, 0, 0],
    species: 0,
    itemId: ITEM_NONE,
  };
}
export const gTradeMail: Mail[] = Array.from({ length: PARTY_SIZE }, emptyTradeMail);

// gSelectedTradeMonPositions[2] (1:1 trade.c:176). Positions player/partner du
// mon échangé — pour l'in-game trade, [TRADE_PLAYER] = gSpecialVar_0x8005.
export const gSelectedTradeMonPositions: number[] = [0, 0];

// gSpecialVar_0x8004 / 0x8005 — routés vers les vars script (comme registry).
const g0x8004 = (): number => VarGet('VAR_0x8004');
const g0x8005 = (): number => VarGet('VAR_0x8005');

// ─── GetInGameTradeSpeciesInfo (1:1 trade.c:4532) ────────────────────────────
export function GetInGameTradeSpeciesInfo(): number {
  const inGameTrade = sIngameTrades[g0x8004()];
  // 1:1 : StringCopy(gStringVar1, gSpeciesNames[inGameTrade->requestedSpecies]).
  setStringVar(1, gSpeciesNames[inGameTrade.requestedSpecies] ?? '');
  setStringVar(2, gSpeciesNames[inGameTrade.species] ?? '');
  return inGameTrade.requestedSpecies;
}

// ─── BufferInGameTradeMonName (1:1 trade.c:4540, static) ─────────────────────
export function BufferInGameTradeMonName(): void {
  const inGameTrade = sIngameTrades[g0x8004()];
  // 1:1 : GetMonData(&gPlayerParty[gSpecialVar_0x8005], MON_DATA_NICKNAME, nickname);
  //       StringCopy_Nickname(gStringVar1, nickname);
  const nickname = GetMonData(gPlayerParty[g0x8005()], MON_DATA_NICKNAME) as string;
  setStringVar(1, nickname);
  setStringVar(2, gSpeciesNames[inGameTrade.species] ?? '');
}

// ─── CreateInGameTradePokemonInternal (1:1 trade.c:4549, static) ─────────────
function CreateInGameTradePokemonInternal(whichPlayerMon: number, whichInGameTrade: number): void {
  const inGameTrade = sIngameTrades[whichInGameTrade];
  const level = GetMonData(gPlayerParty[whichPlayerMon], MON_DATA_LEVEL) as number;

  const mail: Mail = emptyTradeMail();
  const metLocation = METLOC_IN_GAME_TRADE;
  let mailNum: number;
  const pokemon = gEnemyParty[0];

  // 1:1 : CreateMon(pokemon, species, level, USE_RANDOM_IVS(32), TRUE, personality,
  //                 OT_ID_PRESET, otId).
  CreateMon(pokemon, inGameTrade.species, level, 32 /* USE_RANDOM_IVS */, true, inGameTrade.personality, OT_ID_PRESET, inGameTrade.otId);

  SetMonData(pokemon, MON_DATA_HP_IV, inGameTrade.ivs[0]);
  SetMonData(pokemon, MON_DATA_ATK_IV, inGameTrade.ivs[1]);
  SetMonData(pokemon, MON_DATA_DEF_IV, inGameTrade.ivs[2]);
  SetMonData(pokemon, MON_DATA_SPEED_IV, inGameTrade.ivs[3]);
  SetMonData(pokemon, MON_DATA_SPATK_IV, inGameTrade.ivs[4]);
  SetMonData(pokemon, MON_DATA_SPDEF_IV, inGameTrade.ivs[5]);
  SetMonData(pokemon, MON_DATA_NICKNAME, inGameTrade.nickname);
  SetMonData(pokemon, MON_DATA_OT_NAME, inGameTrade.otName);
  SetMonData(pokemon, MON_DATA_OT_GENDER, inGameTrade.otGender);
  SetMonData(pokemon, MON_DATA_ABILITY_NUM, inGameTrade.abilityNum);
  SetMonData(pokemon, MON_DATA_BEAUTY, inGameTrade.conditions[1]);
  SetMonData(pokemon, MON_DATA_CUTE, inGameTrade.conditions[2]);
  SetMonData(pokemon, MON_DATA_COOL, inGameTrade.conditions[0]);
  SetMonData(pokemon, MON_DATA_SMART, inGameTrade.conditions[3]);
  SetMonData(pokemon, MON_DATA_TOUGH, inGameTrade.conditions[4]);
  SetMonData(pokemon, MON_DATA_SHEEN, inGameTrade.sheen);
  SetMonData(pokemon, MON_DATA_MET_LOCATION, metLocation);

  mailNum = 0;
  if (inGameTrade.heldItem !== ITEM_NONE) {
    if (ItemIsMail(inGameTrade.heldItem)) {
      GetInGameTradeMail(mail, inGameTrade);
      // 1:1 : gTradeMail[0] = mail (struct copy).
      copyMailInto(gTradeMail[0], mail);
      SetMonData(pokemon, MON_DATA_MAIL, mailNum);
      SetMonData(pokemon, MON_DATA_HELD_ITEM, inGameTrade.heldItem);
    } else {
      SetMonData(pokemon, MON_DATA_HELD_ITEM, inGameTrade.heldItem);
    }
  }
  CalculateMonStats(gEnemyParty[0]);
}

// Copie struct Mail champ-à-champ (= affectation `*dst = *src` du décomp).
function copyMailInto(dst: Mail, src: Mail): void {
  for (let i = 0; i < MAIL_WORDS_COUNT; i++) dst.words[i] = src.words[i];
  dst.playerName = src.playerName.slice();
  for (let i = 0; i < 4; i++) dst.trainerId[i] = src.trainerId[i];
  dst.species = src.species;
  dst.itemId = src.itemId;
}

// ─── GetInGameTradeMail (1:1 trade.c:4597, static) ───────────────────────────
function GetInGameTradeMail(mail: Mail, trade: InGameTrade): void {
  for (let i = 0; i < MAIL_WORDS_COUNT; i++) {
    mail.words[i] = sIngameTradeMail[trade.mailNum][i];
  }

  // 1:1 : StringCopy(mail->playerName, trade->otName); PadNameString(..., CHAR_SPACE).
  // otName décomp = octets `_()` → ré-encodé ici ; playerName Mail = number[].
  const nameBuf = new Uint8Array(PLAYER_NAME_LENGTH + 1).fill(EOS);
  StringCopy(nameBuf, encodeOwText(trade.otName));
  PadNameString(nameBuf, CHAR_SPACE);
  mail.playerName = Array.from(nameBuf.subarray(0, StringLength(nameBuf) + 1));

  // 1:1 : trainerId big-endian (>>24, >>16, >>8, raw) — spécifique au mail trade.
  mail.trainerId[0] = (trade.otId >>> 24) & 0xFF;
  mail.trainerId[1] = (trade.otId >>> 16) & 0xFF;
  mail.trainerId[2] = (trade.otId >>> 8) & 0xFF;
  mail.trainerId[3] = trade.otId & 0xFF;
  mail.species = trade.species;
  mail.itemId = trade.heldItem;
}

// ─── GetTradeSpecies (1:1 trade.c:4615) ──────────────────────────────────────
export function GetTradeSpecies(): number {
  if (GetMonData(gPlayerParty[g0x8005()], MON_DATA_IS_EGG) as number) {
    return 0; // SPECIES_NONE
  }
  return GetMonData(gPlayerParty[g0x8005()], MON_DATA_SPECIES) as number;
}

// ─── CreateInGameTradePokemon (1:1 trade.c:4622) ─────────────────────────────
export function CreateInGameTradePokemon(): void {
  CreateInGameTradePokemonInternal(g0x8005(), g0x8004());
}

// ─── UpdatePokedexForReceivedMon (1:1 trade.c:3079, static) ──────────────────
function UpdatePokedexForReceivedMon(partyIdx: number): void {
  const mon = gPlayerParty[partyIdx];

  if (!(GetMonData(mon, MON_DATA_IS_EGG) as number)) {
    let species = GetMonData(mon, MON_DATA_SPECIES) as number;
    const personality = GetMonData(mon, MON_DATA_PERSONALITY) as number;
    species = SpeciesToNationalPokedexNum(species);
    GetSetPokedexFlag(species, FLAG_SET_SEEN);
    HandleSetPokedexFlag(species, FLAG_SET_CAUGHT, personality);
  }
}

// ─── TryEnableNationalDexFromLinkPartner (1:1 trade.c:3094, static) ──────────
// « Functionally nop after commented code » — bloc Ruby commenté. Nop 1:1.
function TryEnableNationalDexFromLinkPartner(): void {
  // gReceivedRemoteLinkPlayers est toujours 0 en solo → jamais appelé (cf. TradeMons).
}

// ─── TradeMons (1:1 trade.c:3102, static) ────────────────────────────────────
// Échange le mon joueur (gPlayerParty[playerPartyIdx]) avec le mon partenaire
// (gEnemyParty[partnerPartyIdx]). SWAP via CopyMon + tempMon (= sTradeAnim->tempMon).
function TradeMons(playerPartyIdx: number, partnerPartyIdx: number): void {
  let friendship: number;

  const playerMon = gPlayerParty[playerPartyIdx];
  const playerMail = GetMonData(playerMon, MON_DATA_MAIL) as number;

  const partnerMon = gEnemyParty[partnerPartyIdx];
  const partnerMail = GetMonData(partnerMon, MON_DATA_MAIL) as number;

  // Le mail attaché au mon envoyé n'existe plus dans votre sauvegarde.
  if (playerMail !== 0xFF /* MAIL_NONE */) {
    ClearMail(gSaveBlock1Ptr.mail[playerMail] as Mail);
  }

  // 1:1 : SWAP(*playerMon, *partnerMon, sTradeAnim->tempMon).
  const tempMon = createEmptyPokemon();
  CopyMon(tempMon, playerMon);
  CopyMon(playerMon, partnerMon);
  CopyMon(partnerMon, tempMon);

  // 70 d'Amitié par défaut sur un mon reçu (sauf œuf : Amitié = cycles d'œuf).
  friendship = 70;
  if (!(GetMonData(playerMon, MON_DATA_IS_EGG) as number)) {
    SetMonData(playerMon, MON_DATA_FRIENDSHIP, friendship);
  }

  if (partnerMail !== 0xFF /* MAIL_NONE */) {
    GiveMailToMon(playerMon, gTradeMail[partnerMail]);
  }

  UpdatePokedexForReceivedMon(playerPartyIdx);
  // gReceivedRemoteLinkPlayers = 0 en solo → TryEnableNationalDexFromLinkPartner
  // jamais appelé (branche LINK). Référencé pour le miroir.
  void TryEnableNationalDexFromLinkPartner;
}

// ─── DoInGameTradeScene — chemin DONNÉES (extrait STATE_TRY_EVOLUTION) ───────
// Le vrai DoInGameTradeScene (trade.c:4845) lance l'anim visuelle
// (CB2_InitInGameTrade → DoTradeAnim → STATE_TRY_EVOLUTION). L'ANIM COMPLÈTE
// N'EST PAS PORTÉE (voir note fin de fichier). PerformInGameTradeDataExchange()
// exécute l'extrait DONNÉES du case STATE_TRY_EVOLUTION (trade.c:3873-3879) :
// l'échange effectif + le check d'évolution par trade. À appeler après l'anim
// (ou après un fondu simple précédenté, cf. DoInGameTradeScene ci-dessous).
export function PerformInGameTradeDataExchange(afterEvolutionCb: (() => void) | null): void {
  // 1:1 CB2_InitInGameTrade case 0 : positions du mon échangé.
  gSelectedTradeMonPositions[TRADE_PLAYER] = g0x8005();
  gSelectedTradeMonPositions[TRADE_PARTNER] = PARTY_SIZE;

  // 1:1 STATE_TRY_EVOLUTION (trade.c:3873) :
  TradeMons(g0x8005(), 0);
  SetCB2AfterEvolution(afterEvolutionCb);
  const evoTarget = GetEvolutionTargetSpecies(gPlayerParty[gSelectedTradeMonPositions[TRADE_PLAYER]], EVO_MODE_TRADE, ITEM_NONE);
  if (evoTarget !== 0 /* SPECIES_NONE */) {
    // preEvoSpriteId (sTradeAnim->monSpriteIds[TRADE_PARTNER]) indisponible sans
    // l'anim → -1 sentinelle. TradeEvolutionScene gère l'affichage 1:1 côté
    // evolution_scene.ts (déjà porté).
    TradeEvolutionScene(gPlayerParty[gSelectedTradeMonPositions[TRADE_PLAYER]], evoTarget, -1, gSelectedTradeMonPositions[TRADE_PLAYER]);
  }
}

// ─── RESTE À PORTER (anim visuelle du trade in-game) ─────────────────────────
// DoInGameTradeScene (trade.c:4845) + Task_InGameTrade + CB2_InitInGameTrade +
// DoTradeAnim (state-machine complète) + LoadTradeMonPic + TradeAnimInit_LoadGfx
// + VBlankCB_TradeAnim + sprite sheets/palettes (gTradeGba_Gfx, sPokeBallSpriteSheet…)
// = ~1500 l. OAM/DMA/affine, NON PORTÉ (échafaudage anim). Le câblage pilote doit,
// pour l'instant, lancer un fondu simple (BeginNormalPaletteFade PALETTES_ALL vers
// RGB_BLACK — précédent : evolution_scene.ts / overworld warp) puis appeler
// PerformInGameTradeDataExchange, puis rendre la main au field
// (FieldCB_ContinueScriptHandleMusic).
