// @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs)
/**
 * pokenav_ribbons_summary.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/pokenav_ribbons_summary.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/pokenav_ribbons_summary.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { LoadCompressedSpriteSheet, SpriteCallbackDummy } from '../harness/runtime/decomp-globals';
import { ST_OAM_4BPP, ST_OAM_OBJ_NORMAL } from '../harness/runtime/decomp-helpers';
import { CHAR_EXTRA_SYMBOL, CHAR_LV_2, CHAR_SLASH, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_LIGHT_GRAY, TEXT_COLOR_RED } from '../include/constants/characters';
import { ARTIST_RIBBON, BEAUTY_RIBBON_NORMAL, CHAMPION_RIBBON, COOL_RIBBON_NORMAL, COUNTRY_RIBBON, CUTE_RIBBON_NORMAL, EARTH_RIBBON, EFFORT_RIBBON, LAND_RIBBON, MARINE_RIBBON, MON_FEMALE, MON_MALE, NATIONAL_RIBBON, SKY_RIBBON, SMART_RIBBON_NORMAL, TOUGH_RIBBON_NORMAL, VICTORY_RIBBON, WINNING_RIBBON, WORLD_RIBBON } from '../include/constants/pokemon';
import { SE_SELECT } from '../include/constants/songs';
import { A_BUTTON, B_BUTTON, DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT, DPAD_UP } from '../include/gba/io_reg';
import { MON_DATA_NICKNAME, MON_DATA_OT_ID, MON_DATA_PERSONALITY, MON_DATA_RIBBONS, MON_DATA_RIBBON_COUNT, MON_DATA_SPECIES } from '../include/pokemon';
import { ST_OAM_AFFINE_NORMAL, TAG_NONE } from '../include/sprite';
import { STR_CONV_MODE_LEFT_ALIGN, STR_CONV_MODE_RIGHT_ALIGN } from '../include/string_util';
import { FONT_NORMAL, TEXT_SKIP_DRAW } from '../include/text';
import { IsDma3ManagerBusyWithBgCopy } from './dma3_manager';
import { JOY_NEW, JOY_REPEAT, PlaySE } from './battle_controllers';
import { DynamicPlaceholderTextUtil_ExpandPlaceholders, DynamicPlaceholderTextUtil_Reset, DynamicPlaceholderTextUtil_SetPlaceholderPtr } from './dynamic_placeholder_text_util';
import { PIXEL_FILL } from './window';
import { GetMonData } from './engine/battle/party-storage';
import { StartSpriteAffineAnim } from './engine/decomp-impls/sprite-engine-impl';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { TOTAL_BOXES_COUNT } from './engine/save/save-blocks';
import { getString } from '../harness/runtime/decomp-strings';
import { GetStringCenterAlignXOffset } from './international_string_util';
import { AddTextPrinterParameterized3 } from './menu';
import { BG_PLTT_ID } from './palette';
import { GetBoxMonGender, GetLevelFromBoxMonExp, GetLevelFromMonExp, GetMonGender, gPlayerParty } from './pokemon';
import { GetBoxedMonPtr } from './pokemon_storage_system';
import { CreateSprite, DestroySprite, FreeSpriteOamMatrix, FreeSpritePaletteByTag, FreeSpriteTilesByTag, GetSpriteTileStartByTag, IndexOfSpritePaletteTag, PLTT_SIZE_4BPP, gDummySpriteAnimTable, gSprites } from './sprite';
import { ConvertIntToDecimalStringN, StringCopy, StringGet_Nickname, gStringVar1, gStringVar3, gStringVar4 } from './string_util';
import { AddTextPrinterParameterized, encodeOwText } from './text';
import { CreateMonPicSprite_HandleDeoxys, FreeAndDestroyMonPicSprite, ResetAllPicSprites, _registerMonPicSubstrate } from './trainer_pokemon_sprites';
import { AddWindow, COPYWIN_GFX, ChangeBgX, ChangeBgY, CopyBgTilemapBufferToVram, CopyToBgTilemapBuffer, CopyToBgTilemapBufferRect, CopyWindowToVram, FillBgTilemapBufferRect_Palette0, FillWindowPixelBuffer, HideBg, PutWindowTilemap, RemoveWindow, SetBgTilemapBuffer, ShowBg } from './window';
import type { DecompSprite } from '../harness/runtime/decomp-runtime';
import type { Pokemon } from './engine/battle/party-storage';
import type {  SpriteTemplate } from './sprite';
import type { WindowTemplate } from './window';

// ═══ wire-transpiled (auto) : imports résolus par l'index ═══
import type { OamData } from '../include/gba/types';
import { CreateLoopedTask, IsLoopedTaskActive } from './pokenav_looped_task';
import { AllocSubstruct, FreePokenavSubstruct, GetSubstructPtr } from './pokenav_resources';
// ─── Câblage (ex-__wireTodo) ───
// 1:1 include/sprite.h:130,136 — builders `union AffineAnimCmd` (défaut local, à consolider include/).
const AFFINEANIMCMD_END = { type: 0x7FFF /* AFFINEANIMCMDTYPE_END */ };
const AFFINEANIMCMD_FRAME = (xScale: number, yScale: number, rotation: number, duration: number) => ({ frame: { xScale, yScale, rotation, duration } });
// helpers déjà portés (pokenav_main_menu / decomp-globals / decomp-runtime / png-loader)
import { CopyPaletteIntoBufferUnfaded, DecompressAndCopyTileDataToVram, FreeTempTileDataBuffersIfPossible, InitBgTemplates, IsPaletteFadeActive, PokenavFadeScreen, PokenavFillPalette, Pokenav_AllocAndLoadPalettes, PrintHelpBarText } from './pokenav_main_menu';
import { BgDmaFill } from '../harness/runtime/decomp-globals';
import { gKeyRepeat } from '../harness/runtime/decomp-runtime';
import { loadTileBin, loadTilemapBin, extractPngPlte, loadGbaPal, loadIndexedPngStrict } from '../harness/gba/png-loader';
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';
import { GetBoxMonDataAt } from './pokemon_storage_system'; // câblé (ex-__wireTodo)

// 1:1 décomp `GetBoxMonData` (pokemon.c) : modèle unifié BoxPokemon→Pokemon → GetMonData couvre
//  les champs box (NICKNAME/SPECIES/RIBBONS…). Alias (précédent mail_data.ts:43).
const GetBoxMonData = GetMonData;

// ── Assets bg (INCGFX graphics.c:1497-1499) — le décomp a tout en ROM ; le port fetch async
//    (preload au fade d'ouverture). Populés par _loadRibbonsSummaryAssets(). ──
let gPokenavRibbonsSummaryBg_Gfx: Uint8Array | null = null;     // summary_bg.png .4bpp.lz (décompressé)
let gPokenavRibbonsSummaryBg_Tilemap: Uint16Array | null = null; // summary_bg.bin.lz (décompressé)
let gPokenavRibbonsSummaryBg_Pal: Uint16Array | null = null;     // summary_bg.png .gbapal

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST = 13; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_SUBSTRUCT_MON_LIST = 18; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_RIBBONS_RETURN_TO_MON_LIST = 100014; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const FIRST_GIFT_RIBBON = 25; // 1:1 include/constants/pokemon.h:130 (= MARINE_RIBBON) (à consolider include/)
const NUM_GIFT_RIBBONS = 7;   // 1:1 include/constants/pokemon.h:132 (= 1 + WORLD_RIBBON - MARINE_RIBBON)
const POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU = 14; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const LT_INC_AND_PAUSE = 0; // 1:1 include/pokenav.h:58 (à consolider dans include/)
const LT_PAUSE = 2; // 1:1 include/pokenav.h:60 (à consolider dans include/)
const LT_INC_AND_CONTINUE = 1; // 1:1 include/pokenav.h:59 (à consolider dans include/)
const HELPBAR_RIBBONS_LIST = 10; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const BG_COORD_SET = 0; // 1:1 include/bg.h:0 (à consolider dans include/)
const POKENAV_FADE_FROM_BLACK = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const LT_FINISH = 4; // 1:1 include/pokenav.h:62 (à consolider dans include/)
const POKENAV_FADE_TO_BLACK = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const HELPBAR_RIBBONS_CHECK = 11; // 1:1 include/pokenav.h:0 (à consolider dans include/)

// enum pokenav_ribbons_summary.c:17
const RIBBONS_SUMMARY_FUNC_NONE = 0;
const RIBBONS_SUMMARY_FUNC_SWITCH_MONS = 1;
const RIBBONS_SUMMARY_FUNC_SELECT_RIBBON = 2;
const RIBBONS_SUMMARY_FUNC_EXPANDED_CURSOR_MOVE = 3;
const RIBBONS_SUMMARY_FUNC_EXPANDED_CANCEL = 4;
const RIBBONS_SUMMARY_FUNC_EXIT = 5;

const GFXTAG_RIBBON_ICONS_BIG = 9; // 1:1 pokenav_ribbons_summary.c:27

const PALTAG_RIBBON_ICONS_1 = 15; // 1:1 pokenav_ribbons_summary.c:29

const PALTAG_RIBBON_ICONS_2 = 16; // 1:1 pokenav_ribbons_summary.c:30

const PALTAG_RIBBON_ICONS_3 = 17; // 1:1 pokenav_ribbons_summary.c:31

const PALTAG_RIBBON_ICONS_4 = 18; // 1:1 pokenav_ribbons_summary.c:32

const PALTAG_RIBBON_ICONS_5 = 19; // 1:1 pokenav_ribbons_summary.c:33

const RIBBONS_PER_ROW = 9; // 1:1 pokenav_ribbons_summary.c:35

const GIFT_RIBBON_ROW = (1 + Math.trunc(FIRST_GIFT_RIBBON / RIBBONS_PER_ROW)); // Gift ribbons start on a new row after the normal ribbons. — division ENTIÈRE C (25/9=2) ; 1:1 pokenav_ribbons_summary.c:36

const GIFT_RIBBON_START_POS = (RIBBONS_PER_ROW * GIFT_RIBBON_ROW); // 1:1 pokenav_ribbons_summary.c:37

const MON_SPRITE_X_ON = 40; // 1:1 pokenav_ribbons_summary.c:39

const MON_SPRITE_X_OFF = -32; // 1:1 pokenav_ribbons_summary.c:40

const MON_SPRITE_Y = 104; // 1:1 pokenav_ribbons_summary.c:41

/** 1:1 `struct Pokenav_RibbonsSummaryList` (pokenav_ribbons_summary.c:43). */
interface Pokenav_RibbonsSummaryList {
  unused1: Uint8Array;
  monList: any;
  selectedPos: number;
  normalRibbonLastRowStart: number;
  numNormalRibbons: number;
  numGiftRibbons: number;
  ribbonIds: Uint32Array;
  giftRibbonIds: Uint32Array;
  unused2: number;
  callback: ((...args: any[]) => any) | null;
}

/** 1:1 `struct Pokenav_RibbonsSummaryMenu` (pokenav_ribbons_summary.c:57). */
interface Pokenav_RibbonsSummaryMenu {
  callback: ((...args: any[]) => any) | null;
  loopedTaskId: number;
  nameWindowId: number;
  ribbonCountWindowId: number;
  listIdxWindowId: number;
  unusedWindowId: number;
  monSpriteId: number;
  bigRibbonSprite: DecompSprite | null;
  unused: number;
  tilemapBuffers: Uint8Array;
}

// Used for the initial drawing of the ribbons

/** 1:1 (pokenav_ribbons_summary.c:72) */
let sRibbonDraw_Total = 0;

/** 1:1 (pokenav_ribbons_summary.c:73) */
let sRibbonDraw_Current = 0;

/** 1:1 struct RibbonData `{ u8 numBits; u8 numRibbons; u8 ribbonId; bool8 isGiftRibbon; }`
 *  (pokenav_ribbons_summary.c:117-142). numBits = bits pour représenter numRibbons ; numRibbons
 *  jamais lu (contest = 4, autres = 1). */
export const sRibbonData = [
  { numBits: 1, numRibbons: 1, ribbonId: CHAMPION_RIBBON,      isGiftRibbon: false },
  { numBits: 3, numRibbons: 4, ribbonId: COOL_RIBBON_NORMAL,   isGiftRibbon: false },
  { numBits: 3, numRibbons: 4, ribbonId: BEAUTY_RIBBON_NORMAL, isGiftRibbon: false },
  { numBits: 3, numRibbons: 4, ribbonId: CUTE_RIBBON_NORMAL,   isGiftRibbon: false },
  { numBits: 3, numRibbons: 4, ribbonId: SMART_RIBBON_NORMAL,  isGiftRibbon: false },
  { numBits: 3, numRibbons: 4, ribbonId: TOUGH_RIBBON_NORMAL,  isGiftRibbon: false },
  { numBits: 1, numRibbons: 1, ribbonId: WINNING_RIBBON,       isGiftRibbon: false },
  { numBits: 1, numRibbons: 1, ribbonId: VICTORY_RIBBON,       isGiftRibbon: false },
  { numBits: 1, numRibbons: 1, ribbonId: ARTIST_RIBBON,        isGiftRibbon: false },
  { numBits: 1, numRibbons: 1, ribbonId: EFFORT_RIBBON,        isGiftRibbon: false },
  { numBits: 1, numRibbons: 1, ribbonId: MARINE_RIBBON,        isGiftRibbon: true },
  { numBits: 1, numRibbons: 1, ribbonId: LAND_RIBBON,          isGiftRibbon: true },
  { numBits: 1, numRibbons: 1, ribbonId: SKY_RIBBON,           isGiftRibbon: true },
  { numBits: 1, numRibbons: 1, ribbonId: COUNTRY_RIBBON,       isGiftRibbon: true },
  { numBits: 1, numRibbons: 1, ribbonId: NATIONAL_RIBBON,      isGiftRibbon: true },
  { numBits: 1, numRibbons: 1, ribbonId: EARTH_RIBBON,         isGiftRibbon: true },
  { numBits: 1, numRibbons: 1, ribbonId: WORLD_RIBBON,         isGiftRibbon: true },
];

// ═══ 1:1 data/text/ribbon_descriptions.h (inclus dans pokenav_ribbons_summary.c:144) ═══
const gRibbonDescriptionPart1_Champion = encodeOwText("RUBAN d'appartenance");
const gRibbonDescriptionPart2_Champion = encodeOwText("au PANTHEON");
const gRibbonDescriptionPart1_CoolContest = encodeOwText("CONCOURS DE SANG-FROID");
const gRibbonDescriptionPart1_BeautyContest = encodeOwText("CONCOURS DE BEAUTE");
const gRibbonDescriptionPart1_CuteContest = encodeOwText("CONCOURS DE GRACE");
const gRibbonDescriptionPart1_SmartContest = encodeOwText("CONCOURS D'INTEL.");
const gRibbonDescriptionPart1_ToughContest = encodeOwText("CONCOURS DE ROBUS.");
const gRibbonDescriptionPart2_NormalRank = encodeOwText("Gagnant catég. NORMAL!");
const gRibbonDescriptionPart2_SuperRank = encodeOwText("Gagnant catég. SUPER!");
const gRibbonDescriptionPart2_HyperRank = encodeOwText("Gagnant catég. HYPER!");
const gRibbonDescriptionPart2_MasterRank = encodeOwText("Gagnant catég. MASTER!");
const gRibbonDescriptionPart1_Winning = encodeOwText("RUBAN de victoire N.50");
const gRibbonDescriptionPart2_Winning = encodeOwText("à la TOUR DE COMBAT.");
const gRibbonDescriptionPart1_Victory = encodeOwText("RUBAN de Niveau libre");
const gRibbonDescriptionPart2_Victory = encodeOwText("à la TOUR DE COMBAT.");
const gRibbonDescriptionPart1_Artist = encodeOwText("RUBAN pour les modèles");
const gRibbonDescriptionPart2_Artist = encodeOwText("exposés au musée.");
const gRibbonDescriptionPart1_Effort = encodeOwText("RUBAN pour récompenser");
const gRibbonDescriptionPart2_Effort = encodeOwText("un dur travail.");

/** 1:1 `const u8 *const gRibbonDescriptionPointers[][2]` (ribbon_descriptions.h:21). Indexé par ribbon id (0..24). */
const gRibbonDescriptionPointers = [
  [gRibbonDescriptionPart1_Champion,      gRibbonDescriptionPart2_Champion],   // [CHAMPION_RIBBON]
  [gRibbonDescriptionPart1_CoolContest,   gRibbonDescriptionPart2_NormalRank], // [COOL_RIBBON_NORMAL]
  [gRibbonDescriptionPart1_CoolContest,   gRibbonDescriptionPart2_SuperRank],  // [COOL_RIBBON_SUPER]
  [gRibbonDescriptionPart1_CoolContest,   gRibbonDescriptionPart2_HyperRank],  // [COOL_RIBBON_HYPER]
  [gRibbonDescriptionPart1_CoolContest,   gRibbonDescriptionPart2_MasterRank], // [COOL_RIBBON_MASTER]
  [gRibbonDescriptionPart1_BeautyContest, gRibbonDescriptionPart2_NormalRank], // [BEAUTY_RIBBON_NORMAL]
  [gRibbonDescriptionPart1_BeautyContest, gRibbonDescriptionPart2_SuperRank],  // [BEAUTY_RIBBON_SUPER]
  [gRibbonDescriptionPart1_BeautyContest, gRibbonDescriptionPart2_HyperRank],  // [BEAUTY_RIBBON_HYPER]
  [gRibbonDescriptionPart1_BeautyContest, gRibbonDescriptionPart2_MasterRank], // [BEAUTY_RIBBON_MASTER]
  [gRibbonDescriptionPart1_CuteContest,   gRibbonDescriptionPart2_NormalRank], // [CUTE_RIBBON_NORMAL]
  [gRibbonDescriptionPart1_CuteContest,   gRibbonDescriptionPart2_SuperRank],  // [CUTE_RIBBON_SUPER]
  [gRibbonDescriptionPart1_CuteContest,   gRibbonDescriptionPart2_HyperRank],  // [CUTE_RIBBON_HYPER]
  [gRibbonDescriptionPart1_CuteContest,   gRibbonDescriptionPart2_MasterRank], // [CUTE_RIBBON_MASTER]
  [gRibbonDescriptionPart1_SmartContest,  gRibbonDescriptionPart2_NormalRank], // [SMART_RIBBON_NORMAL]
  [gRibbonDescriptionPart1_SmartContest,  gRibbonDescriptionPart2_SuperRank],  // [SMART_RIBBON_SUPER]
  [gRibbonDescriptionPart1_SmartContest,  gRibbonDescriptionPart2_HyperRank],  // [SMART_RIBBON_HYPER]
  [gRibbonDescriptionPart1_SmartContest,  gRibbonDescriptionPart2_MasterRank], // [SMART_RIBBON_MASTER]
  [gRibbonDescriptionPart1_ToughContest,  gRibbonDescriptionPart2_NormalRank], // [TOUGH_RIBBON_NORMAL]
  [gRibbonDescriptionPart1_ToughContest,  gRibbonDescriptionPart2_SuperRank],  // [TOUGH_RIBBON_SUPER]
  [gRibbonDescriptionPart1_ToughContest,  gRibbonDescriptionPart2_HyperRank],  // [TOUGH_RIBBON_HYPER]
  [gRibbonDescriptionPart1_ToughContest,  gRibbonDescriptionPart2_MasterRank], // [TOUGH_RIBBON_MASTER]
  [gRibbonDescriptionPart1_Winning,       gRibbonDescriptionPart2_Winning],    // [WINNING_RIBBON]
  [gRibbonDescriptionPart1_Victory,       gRibbonDescriptionPart2_Victory],    // [VICTORY_RIBBON]
  [gRibbonDescriptionPart1_Artist,        gRibbonDescriptionPart2_Artist],     // [ARTIST_RIBBON]
  [gRibbonDescriptionPart1_Effort,        gRibbonDescriptionPart2_Effort],     // [EFFORT_RIBBON]
];

// ═══ 1:1 data/text/gift_ribbon_descriptions.h (inclus :145) ═══
const gGiftRibbonDescriptionPart1_2003RegionalTourney = encodeOwText("TOURNOI REGIONAL 2003");
const gGiftRibbonDescriptionPart2_Champion = encodeOwText("RUBAN MAITRE");
const gGiftRibbonDescriptionPart1_2003NationalTourney = encodeOwText("TOURNOI NATIONAL 2003");
const gGiftRibbonDescriptionPart1_2003GlobalCup = encodeOwText("COUPE GLOBALE 2003");
const gGiftRibbonDescriptionPart2_RunnerUp = encodeOwText("RUBAN 2{SUPER_E} place");
const gGiftRibbonDescriptionPart2_Semifinalist = encodeOwText("RUBAN demi-finaliste");
const gGiftRibbonDescriptionPart1_2004RegionalTourney = encodeOwText("TOURNOI REGIONAL 2004");
const gGiftRibbonDescriptionPart1_2004NationalTourney = encodeOwText("TOURNOI NATIONAL 2004");
const gGiftRibbonDescriptionPart1_2004GlobalCup = encodeOwText("COUPE GLOBALE 2004");
const gGiftRibbonDescriptionPart1_2005RegionalTourney = encodeOwText("TOURNOI REGIONAL 2005");
const gGiftRibbonDescriptionPart1_2005NationalTourney = encodeOwText("TOURNOI NATIONAL 2005");
const gGiftRibbonDescriptionPart1_2005GlobalCup = encodeOwText("COUPE GLOBALE 2005");
const gGiftRibbonDescriptionPart1_PokemonBattleCup = encodeOwText("COUPE COMBAT POKéMON");
const gGiftRibbonDescriptionPart2_Participation = encodeOwText("RUBAN de participation");
const gGiftRibbonDescriptionPart1_PokemonLeague = encodeOwText("LIGUE POKéMON");
const gGiftRibbonDescriptionPart1_AdvanceCup = encodeOwText("COUPE ADVANCE");
const gGiftRibbonDescriptionPart1_PokemonTournament = encodeOwText("Tournoi POKéMON");
const gGiftRibbonDescriptionPart2_Participation2 = encodeOwText("RUBAN de participation");
const gGiftRibbonDescriptionPart1_PokemonEvent = encodeOwText("Evènement POKéMON");
const gGiftRibbonDescriptionPart1_PokemonFestival = encodeOwText("Festival POKéMON");
const gGiftRibbonDescriptionPart1_DifficultyClearing = encodeOwText("RUBAN commémoratif pour");
const gGiftRibbonDescriptionPart2_Commemorative = encodeOwText("avoir tout réussi.");
const gGiftRibbonDescriptionPart1_ClearingAllChallenges = encodeOwText("RUBAN pour le triomphe");
const gGiftRibbonDescriptionPart2_ClearingAllChallenges = encodeOwText("face aux difficultés.");
const gGiftRibbonDescriptionPart1_100StraightWin = encodeOwText("100 victoires à la suite");
const gGiftRibbonDescriptionPart1_DarknessTower = encodeOwText("Succès TOUR OBSCURE");
const gGiftRibbonDescriptionPart1_RedTower = encodeOwText("Succès TOUR ROUGE");
const gGiftRibbonDescriptionPart1_BlackironTower = encodeOwText("Succès TOUR FER NOIR");
const gGiftRibbonDescriptionPart1_FinalTower = encodeOwText("Succès TOUR FINALE");
const gGiftRibbonDescriptionPart1_LegendMaking = encodeOwText("A contribué à la légende");
const gGiftRibbonDescriptionPart1_PokemonCenterTokyo = encodeOwText("CENTRE POKéMON TOKYO");
const gGiftRibbonDescriptionPart1_PokemonCenterOsaka = encodeOwText("CENTRE POKéMON OSAKA");
const gGiftRibbonDescriptionPart1_PokemonCenterNagoya = encodeOwText("CENTRE POKéMON NAGOYA");
const gGiftRibbonDescriptionPart1_PokemonCenterNY = encodeOwText("CENTRE POKéMON NY");
const gGiftRibbonDescriptionPart1_SummerHolidays = encodeOwText("RUBAN vacances d'été");
const gGiftRibbonDescriptionPart2_EmptyString = encodeOwText("");
const gGiftRibbonDescriptionPart1_WinterHolidays = encodeOwText("RUBAN vacances d'hiver");
const gGiftRibbonDescriptionPart1_SpringHolidays = encodeOwText("RUBAN vac. de printemps");
const gGiftRibbonDescriptionPart1_Evergreen = encodeOwText("RUBAN feuilles persist.");
const gGiftRibbonDescriptionPart1_SpecialHoliday = encodeOwText("RUBAN vac. spéciales");
const gGiftRibbonDescriptionPart1_HardWorker = encodeOwText("RUBAN travailleur");
const gGiftRibbonDescriptionPart1_LotsOfFriends = encodeOwText("RUBAN amitié");
const gGiftRibbonDescriptionPart1_FullOfEnergy = encodeOwText("RUBAN énergie");
const gGiftRibbonDescriptionPart1_LovedPokemon = encodeOwText("RUBAN souvenir pour");
const gGiftRibbonDescriptionPart2_LovedPokemon = encodeOwText("un POKéMON bien-aimé.");
const gGiftRibbonDescriptionPart1_LoveForPokemon = encodeOwText("RUBAN qui montre l'amour");
const gGiftRibbonDescriptionPart2_LoveForPokemon = encodeOwText("porté à un POKéMON.");

/** 1:1 `const u8 *const gGiftRibbonDescriptionPointers[MAX_GIFT_RIBBON][2]` (gift_ribbon_descriptions.h:49). */
const gGiftRibbonDescriptionPointers = [
  [gGiftRibbonDescriptionPart1_2003RegionalTourney,   gGiftRibbonDescriptionPart2_Champion],
  [gGiftRibbonDescriptionPart1_2003NationalTourney,   gGiftRibbonDescriptionPart2_Champion],
  [gGiftRibbonDescriptionPart1_2003GlobalCup,         gGiftRibbonDescriptionPart2_Champion],
  [gGiftRibbonDescriptionPart1_2003RegionalTourney,   gGiftRibbonDescriptionPart2_RunnerUp],
  [gGiftRibbonDescriptionPart1_2003NationalTourney,   gGiftRibbonDescriptionPart2_RunnerUp],
  [gGiftRibbonDescriptionPart1_2003GlobalCup,         gGiftRibbonDescriptionPart2_RunnerUp],
  [gGiftRibbonDescriptionPart1_2003RegionalTourney,   gGiftRibbonDescriptionPart2_Semifinalist],
  [gGiftRibbonDescriptionPart1_2003NationalTourney,   gGiftRibbonDescriptionPart2_Semifinalist],
  [gGiftRibbonDescriptionPart1_2003GlobalCup,         gGiftRibbonDescriptionPart2_Semifinalist],
  [gGiftRibbonDescriptionPart1_2004RegionalTourney,   gGiftRibbonDescriptionPart2_Champion],
  [gGiftRibbonDescriptionPart1_2004NationalTourney,   gGiftRibbonDescriptionPart2_Champion],
  [gGiftRibbonDescriptionPart1_2004GlobalCup,         gGiftRibbonDescriptionPart2_Champion],
  [gGiftRibbonDescriptionPart1_2004RegionalTourney,   gGiftRibbonDescriptionPart2_RunnerUp],
  [gGiftRibbonDescriptionPart1_2004NationalTourney,   gGiftRibbonDescriptionPart2_RunnerUp],
  [gGiftRibbonDescriptionPart1_2004GlobalCup,         gGiftRibbonDescriptionPart2_RunnerUp],
  [gGiftRibbonDescriptionPart1_2004RegionalTourney,   gGiftRibbonDescriptionPart2_Semifinalist],
  [gGiftRibbonDescriptionPart1_2004NationalTourney,   gGiftRibbonDescriptionPart2_Semifinalist],
  [gGiftRibbonDescriptionPart1_2004GlobalCup,         gGiftRibbonDescriptionPart2_Semifinalist],
  [gGiftRibbonDescriptionPart1_2005RegionalTourney,   gGiftRibbonDescriptionPart2_Champion],
  [gGiftRibbonDescriptionPart1_2005NationalTourney,   gGiftRibbonDescriptionPart2_Champion],
  [gGiftRibbonDescriptionPart1_2005GlobalCup,         gGiftRibbonDescriptionPart2_Champion],
  [gGiftRibbonDescriptionPart1_2005RegionalTourney,   gGiftRibbonDescriptionPart2_RunnerUp],
  [gGiftRibbonDescriptionPart1_2005NationalTourney,   gGiftRibbonDescriptionPart2_RunnerUp],
  [gGiftRibbonDescriptionPart1_2005GlobalCup,         gGiftRibbonDescriptionPart2_RunnerUp],
  [gGiftRibbonDescriptionPart1_2005RegionalTourney,   gGiftRibbonDescriptionPart2_Semifinalist],
  [gGiftRibbonDescriptionPart1_2005NationalTourney,   gGiftRibbonDescriptionPart2_Semifinalist],
  [gGiftRibbonDescriptionPart1_2005GlobalCup,         gGiftRibbonDescriptionPart2_Semifinalist],
  [gGiftRibbonDescriptionPart1_PokemonBattleCup,      gGiftRibbonDescriptionPart2_Champion],
  [gGiftRibbonDescriptionPart1_PokemonBattleCup,      gGiftRibbonDescriptionPart2_RunnerUp],
  [gGiftRibbonDescriptionPart1_PokemonBattleCup,      gGiftRibbonDescriptionPart2_Semifinalist],
  [gGiftRibbonDescriptionPart1_PokemonBattleCup,      gGiftRibbonDescriptionPart2_Participation],
  [gGiftRibbonDescriptionPart1_PokemonLeague,         gGiftRibbonDescriptionPart2_Champion],
  [gGiftRibbonDescriptionPart1_PokemonLeague,         gGiftRibbonDescriptionPart2_RunnerUp],
  [gGiftRibbonDescriptionPart1_PokemonLeague,         gGiftRibbonDescriptionPart2_Semifinalist],
  [gGiftRibbonDescriptionPart1_PokemonLeague,         gGiftRibbonDescriptionPart2_Participation],
  [gGiftRibbonDescriptionPart1_AdvanceCup,            gGiftRibbonDescriptionPart2_Champion],
  [gGiftRibbonDescriptionPart1_AdvanceCup,            gGiftRibbonDescriptionPart2_RunnerUp],
  [gGiftRibbonDescriptionPart1_AdvanceCup,            gGiftRibbonDescriptionPart2_Semifinalist],
  [gGiftRibbonDescriptionPart1_AdvanceCup,            gGiftRibbonDescriptionPart2_Participation],
  [gGiftRibbonDescriptionPart1_PokemonTournament,     gGiftRibbonDescriptionPart2_Participation2],
  [gGiftRibbonDescriptionPart1_PokemonEvent,          gGiftRibbonDescriptionPart2_Participation2],
  [gGiftRibbonDescriptionPart1_PokemonFestival,       gGiftRibbonDescriptionPart2_Participation2],
  [gGiftRibbonDescriptionPart1_DifficultyClearing,    gGiftRibbonDescriptionPart2_Commemorative],
  [gGiftRibbonDescriptionPart1_ClearingAllChallenges, gGiftRibbonDescriptionPart2_ClearingAllChallenges],
  [gGiftRibbonDescriptionPart1_100StraightWin,        gGiftRibbonDescriptionPart2_Commemorative],
  [gGiftRibbonDescriptionPart1_DarknessTower,         gGiftRibbonDescriptionPart2_Commemorative],
  [gGiftRibbonDescriptionPart1_RedTower,              gGiftRibbonDescriptionPart2_Commemorative],
  [gGiftRibbonDescriptionPart1_BlackironTower,        gGiftRibbonDescriptionPart2_Commemorative],
  [gGiftRibbonDescriptionPart1_FinalTower,            gGiftRibbonDescriptionPart2_Commemorative],
  [gGiftRibbonDescriptionPart1_LegendMaking,          gGiftRibbonDescriptionPart2_Commemorative],
  [gGiftRibbonDescriptionPart1_PokemonCenterTokyo,    gGiftRibbonDescriptionPart2_Commemorative],
  [gGiftRibbonDescriptionPart1_PokemonCenterOsaka,    gGiftRibbonDescriptionPart2_Commemorative],
  [gGiftRibbonDescriptionPart1_PokemonCenterNagoya,   gGiftRibbonDescriptionPart2_Commemorative],
  [gGiftRibbonDescriptionPart1_PokemonCenterNY,       gGiftRibbonDescriptionPart2_Commemorative],
  [gGiftRibbonDescriptionPart1_SummerHolidays,        gGiftRibbonDescriptionPart2_EmptyString],
  [gGiftRibbonDescriptionPart1_WinterHolidays,        gGiftRibbonDescriptionPart2_EmptyString],
  [gGiftRibbonDescriptionPart1_SpringHolidays,        gGiftRibbonDescriptionPart2_EmptyString],
  [gGiftRibbonDescriptionPart1_Evergreen,             gGiftRibbonDescriptionPart2_EmptyString],
  [gGiftRibbonDescriptionPart1_SpecialHoliday,        gGiftRibbonDescriptionPart2_EmptyString],
  [gGiftRibbonDescriptionPart1_HardWorker,            gGiftRibbonDescriptionPart2_EmptyString],
  [gGiftRibbonDescriptionPart1_LotsOfFriends,         gGiftRibbonDescriptionPart2_EmptyString],
  [gGiftRibbonDescriptionPart1_FullOfEnergy,          gGiftRibbonDescriptionPart2_EmptyString],
  [gGiftRibbonDescriptionPart1_LovedPokemon,          gGiftRibbonDescriptionPart2_LovedPokemon],
  [gGiftRibbonDescriptionPart1_LoveForPokemon,        gGiftRibbonDescriptionPart2_LoveForPokemon],
];

// TRANSPILER-TODO INCGFX : sRibbonIcons1_Pal ← graphics/pokenav/ribbons/icons1.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sRibbonIcons1_Pal: any = null;

// TRANSPILER-TODO INCGFX : sRibbonIcons2_Pal ← graphics/pokenav/ribbons/icons2.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sRibbonIcons2_Pal: any = null;

// TRANSPILER-TODO INCGFX : sRibbonIcons3_Pal ← graphics/pokenav/ribbons/icons3.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sRibbonIcons3_Pal: any = null;

// TRANSPILER-TODO INCGFX : sRibbonIcons4_Pal ← graphics/pokenav/ribbons/icons4.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sRibbonIcons4_Pal: any = null;

// TRANSPILER-TODO INCGFX : sRibbonIcons5_Pal ← graphics/pokenav/ribbons/icons5.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sRibbonIcons5_Pal: any = null;

// TRANSPILER-TODO INCGFX : sMonInfo_Pal ← graphics/pokenav/ribbons/mon_info.pal (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sMonInfo_Pal: any = null;

// palette for Pokémon's name/gender/level text

// TRANSPILER-TODO INCGFX : sRibbonIconsSmall_Gfx ← graphics/pokenav/ribbons/icons.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sRibbonIconsSmall_Gfx: any = null;

// TRANSPILER-TODO INCGFX : sRibbonIconsBig_Gfx ← graphics/pokenav/ribbons/icons_big.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sRibbonIconsBig_Gfx: any = null;

/** 1:1 (pokenav_ribbons_summary.c:156) */
const sBgTemplates = [
  {
    bg: 1, /* :2 */
    charBaseIndex: 3, /* :2 */
    mapBaseIndex: 0x07, /* :5 */
    screenSize: 0, /* :2 */
    paletteMode: 0, /* :1 */
    priority: 1, /* :2 */
    baseTile: 0, /* :10 */
  },
  {
    bg: 2, /* :2 */
    charBaseIndex: 1, /* :2 */
    mapBaseIndex: 0x06, /* :5 */
    screenSize: 0, /* :2 */
    paletteMode: 0, /* :1 */
    priority: 2, /* :2 */
    baseTile: 0, /* :10 */
  },
];

/** 1:1 (pokenav_ribbons_summary.c:178) */
const sRibbonsSummaryMenuLoopTaskFuncs = [
  null, // [RIBBONS_SUMMARY_FUNC_NONE]
  LoopedTask_SwitchRibbonsSummaryMon, // [RIBBONS_SUMMARY_FUNC_SWITCH_MONS]
  LoopedTask_ExpandSelectedRibbon, // [RIBBONS_SUMMARY_FUNC_SELECT_RIBBON]
  LoopedTask_MoveRibbonsCursorExpanded, // [RIBBONS_SUMMARY_FUNC_EXPANDED_CURSOR_MOVE]
  LoopedTask_ShrinkExpandedRibbon, // [RIBBONS_SUMMARY_FUNC_EXPANDED_CANCEL]
  LoopedTask_ExitRibbonsSummaryMenu, // [RIBBONS_SUMMARY_FUNC_EXIT]
];

/** 1:1 `bool32 PokenavCallback_Init_RibbonsSummaryMenu(void)` (pokenav_ribbons_summary.c:188-203). */
export function PokenavCallback_Init_RibbonsSummaryMenu(): boolean {
  let list = AllocSubstruct(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_RibbonsSummaryList) */);
  if (list == null)
    return false;
  // ADAPTATION MOTEUR : `u32 ribbonIds[FIRST_GIFT_RIBBON]` / `giftRibbonIds[NUM_GIFT_RIBBONS]` sont des
  // arrays inline zéro-init en C ; AllocSubstruct rend {} → init explicite (sinon ribbonIds[i]= crash).
  list.ribbonIds = new Uint32Array(FIRST_GIFT_RIBBON);   // 25
  list.giftRibbonIds = new Uint32Array(NUM_GIFT_RIBBONS); // 7
  list.monList = GetSubstructPtr(POKENAV_SUBSTRUCT_MON_LIST);
  if (list.monList == null)
    return false;
  GetMonRibbons(list);
  list.callback = RibbonsSummaryHandleInput;
  gKeyRepeat.continueDelay = 3; // 1:1 `gKeyRepeatContinueDelay = 3` (global mutable → conteneur gKeyRepeat)
  gKeyRepeat.startDelay = 10;   // 1:1 `gKeyRepeatStartDelay = 10`
  // ADAPTATION MOTEUR (async asset) : préchauffe la front pic du mon courant (ROM sync côté décomp) —
  // gate au case 6 de LoopedTask_OpenRibbonsSummaryMenu (cf. pokenav_list case 3).
  _prefetchRibbonsSummaryMonPic(list);
  return true;
}

/** 1:1 `u32 GetRibbonsSummaryMenuCallback(void)` (pokenav_ribbons_summary.c:205-209). */
export function GetRibbonsSummaryMenuCallback(): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
  return list.callback(list);
}

/** 1:1 `void FreeRibbonsSummaryScreen1(void)` (pokenav_ribbons_summary.c:211-214). */
export function FreeRibbonsSummaryScreen1(): void {
  FreePokenavSubstruct(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
}

// Handles input when a specific ribbon is not currently selected

/** 1:1 `static u32 RibbonsSummaryHandleInput(struct Pokenav_RibbonsSummaryList *list)` (pokenav_ribbons_summary.c:217-248). */
function RibbonsSummaryHandleInput(list: Pokenav_RibbonsSummaryList): number {
  // Handle Up/Down movement to select a new Pokémon to show ribbons for
  if (JOY_REPEAT(DPAD_UP) && list.monList.currIndex != 0)
  {
    list.monList.currIndex--;
    list.selectedPos = 0;
    GetMonRibbons(list);
    return RIBBONS_SUMMARY_FUNC_SWITCH_MONS;
  }
  if (JOY_REPEAT(DPAD_DOWN) && list.monList.currIndex < list.monList.listCount - 1)
  {
    list.monList.currIndex++;
    list.selectedPos = 0;
    GetMonRibbons(list);
    return RIBBONS_SUMMARY_FUNC_SWITCH_MONS;
  }
  if (JOY_NEW(A_BUTTON))
  {
    // Enter ribbon selection
    list.callback = HandleExpandedRibbonInput;
    return RIBBONS_SUMMARY_FUNC_SELECT_RIBBON;
  }
  if (JOY_NEW(B_BUTTON))
  {
    // Exit ribbon summary menu
    list.callback = ReturnToRibbonsListFromSummary;
    return RIBBONS_SUMMARY_FUNC_EXIT;
  }
  return RIBBONS_SUMMARY_FUNC_NONE;
}

// Handles input when a ribbon is selected

/** 1:1 `static u32 HandleExpandedRibbonInput(struct Pokenav_RibbonsSummaryList *list)` (pokenav_ribbons_summary.c:251-270). */
function HandleExpandedRibbonInput(list: Pokenav_RibbonsSummaryList): number {
  // Handle movement while a ribbon is selected
  if (JOY_REPEAT(DPAD_UP) && TrySelectRibbonUp(list))
    return RIBBONS_SUMMARY_FUNC_EXPANDED_CURSOR_MOVE;
  if (JOY_REPEAT(DPAD_DOWN) && TrySelectRibbonDown(list))
    return RIBBONS_SUMMARY_FUNC_EXPANDED_CURSOR_MOVE;
  if (JOY_REPEAT(DPAD_LEFT) && TrySelectRibbonLeft(list))
    return RIBBONS_SUMMARY_FUNC_EXPANDED_CURSOR_MOVE;
  if (JOY_REPEAT(DPAD_RIGHT) && TrySelectRibbonRight(list))
    return RIBBONS_SUMMARY_FUNC_EXPANDED_CURSOR_MOVE;
  if (JOY_NEW(B_BUTTON))
  {
    // Exit ribbon selection
    list.callback = RibbonsSummaryHandleInput;
    return RIBBONS_SUMMARY_FUNC_EXPANDED_CANCEL;
  }
  return RIBBONS_SUMMARY_FUNC_NONE;
}

/** 1:1 `static u32 ReturnToRibbonsListFromSummary(struct Pokenav_RibbonsSummaryList *list)` (pokenav_ribbons_summary.c:272-275). */
function ReturnToRibbonsListFromSummary(list: Pokenav_RibbonsSummaryList): number {
  return POKENAV_RIBBONS_RETURN_TO_MON_LIST;
}

/** 1:1 `static bool32 TrySelectRibbonUp(struct Pokenav_RibbonsSummaryList *list)` (pokenav_ribbons_summary.c:277-300). */
function TrySelectRibbonUp(list: Pokenav_RibbonsSummaryList): boolean {
  if (list.selectedPos < FIRST_GIFT_RIBBON)
  {
    // In normal ribbons, try to move up a row
    if (list.selectedPos < RIBBONS_PER_ROW)
      return false;
    list.selectedPos -= RIBBONS_PER_ROW;
    return true;
  }
  if (list.numNormalRibbons != 0)
  {
    // In gift ribbons, try to move up into normal ribbons
    // If there's > 1 row of gift ribbons (not normally possible)
    // it's impossible to move up between them
    let ribbonPos = list.selectedPos - GIFT_RIBBON_START_POS;
    list.selectedPos = ribbonPos + list.normalRibbonLastRowStart;
    if (list.selectedPos >= list.numNormalRibbons)
      list.selectedPos = list.numNormalRibbons - 1;
    return true;
  }
  return false;
}

/** 1:1 `static bool32 TrySelectRibbonDown(struct Pokenav_RibbonsSummaryList *list)` (pokenav_ribbons_summary.c:302-325). */
function TrySelectRibbonDown(list: Pokenav_RibbonsSummaryList): boolean {
  if (list.selectedPos >= FIRST_GIFT_RIBBON)
    return false;
  if (list.selectedPos < list.normalRibbonLastRowStart)
  {
    // Not in last row of normal ribbons, advance to next row
    list.selectedPos += RIBBONS_PER_ROW;
    if (list.selectedPos >= list.numNormalRibbons)
      list.selectedPos = list.numNormalRibbons - 1;
    return true;
  }
  if (list.numGiftRibbons != 0)
  {
    // In/beyond last of row of normal ribbons and gift ribbons present, move down to gift ribbon row
    let ribbonPos = list.selectedPos - list.normalRibbonLastRowStart;
    if (ribbonPos >= list.numGiftRibbons)
      ribbonPos = list.numGiftRibbons - 1;
    list.selectedPos = ribbonPos + GIFT_RIBBON_START_POS;
    return true;
  }
  return false;
}

/** 1:1 `static bool32 TrySelectRibbonLeft(struct Pokenav_RibbonsSummaryList *list)` (pokenav_ribbons_summary.c:327-337). */
function TrySelectRibbonLeft(list: Pokenav_RibbonsSummaryList): boolean {
  let column = list.selectedPos % RIBBONS_PER_ROW;
  if (column != 0)
  {
    list.selectedPos--;
    return true;
  }
  return false;
}

/** 1:1 `static bool32 TrySelectRibbonRight(struct Pokenav_RibbonsSummaryList *list)` (pokenav_ribbons_summary.c:339-365). */
function TrySelectRibbonRight(list: Pokenav_RibbonsSummaryList): boolean {
  let column = list.selectedPos % RIBBONS_PER_ROW;
  if (column >= RIBBONS_PER_ROW - 1)
    return false;
  if (list.selectedPos < GIFT_RIBBON_START_POS)
  {
    // Move right in normal ribbon row
    if (list.selectedPos < list.numNormalRibbons - 1)
    {
      list.selectedPos++;
      return true;
    }
  }
  else
  {
    // Move right in gift ribbon row
    if (column < list.numGiftRibbons - 1)
    {
      list.selectedPos++;
      return true;
    }
  }
  return false;
}

/** 1:1 `static u32 GetRibbonsSummaryCurrentIndex(void)` (pokenav_ribbons_summary.c:367-371). */
function GetRibbonsSummaryCurrentIndex(): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
  return list.monList.currIndex;
}

/** 1:1 `static u32 GetRibbonsSummaryMonListCount(void)` (pokenav_ribbons_summary.c:373-377). */
function GetRibbonsSummaryMonListCount(): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
  return list.monList.listCount;
}

/** 1:1 `static void GetMonNicknameLevelGender(u8 *nick, u8 *level, u8 *gender)` (pokenav_ribbons_summary.c:379-402). */
function GetMonNicknameLevelGender(nick: Uint8Array, level: { v: number }, gender: { v: number }): void {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
  let mons = list.monList;
  let monInfo = mons.monData[mons.currIndex] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  if (monInfo.boxId == TOTAL_BOXES_COUNT)
  {
    // Get info for party mon
    let mon = gPlayerParty[monInfo.monId];
    GetMonData(mon, MON_DATA_NICKNAME, nick);
    level.v = GetLevelFromMonExp(mon);
    gender.v = GetMonGender(mon);
  }
  else
  {
    // Get info for PC box mon
    let boxMon = GetBoxedMonPtr(monInfo.boxId, monInfo.monId);
    gender.v = GetBoxMonGender(boxMon);
    level.v = GetLevelFromBoxMonExp(boxMon);
    GetBoxMonData(boxMon, MON_DATA_NICKNAME, nick);
  }
  StringGet_Nickname(nick);
}

/** 1:1 `static void GetMonSpeciesPersonalityOtId(u16 *species, u32 *personality, u32 *otId)` (pokenav_ribbons_summary.c:404-426). */
function GetMonSpeciesPersonalityOtId(species: { v: number }, personality: { v: number }, otId: { v: number }): void {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
  let mons = list.monList;
  let monInfo = mons.monData[mons.currIndex] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  if (monInfo.boxId == TOTAL_BOXES_COUNT)
  {
    // Get info for party mon
    let mon = gPlayerParty[monInfo.monId];
    species.v = GetMonData(mon, MON_DATA_SPECIES);
    personality.v = GetMonData(mon, MON_DATA_PERSONALITY);
    otId.v = GetMonData(mon, MON_DATA_OT_ID);
  }
  else
  {
    // Get info for PC box mon
    let boxMon = GetBoxedMonPtr(monInfo.boxId, monInfo.monId);
    species.v = GetBoxMonData(boxMon, MON_DATA_SPECIES);
    personality.v = GetBoxMonData(boxMon, MON_DATA_PERSONALITY);
    otId.v = GetBoxMonData(boxMon, MON_DATA_OT_ID);
  }
}

/** 1:1 `static u32 GetCurrMonRibbonCount(void)` (pokenav_ribbons_summary.c:428-438). */
function GetCurrMonRibbonCount(): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
  let mons = list.monList;
  let monInfo = mons.monData[mons.currIndex] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  if (monInfo.boxId == TOTAL_BOXES_COUNT)
    return GetMonData(gPlayerParty[monInfo.monId], MON_DATA_RIBBON_COUNT);
  else
    return GetBoxMonDataAt(monInfo.boxId, monInfo.monId, MON_DATA_RIBBON_COUNT);
}

/** 1:1 `static void GetMonRibbons(struct Pokenav_RibbonsSummaryList *list)` (pokenav_ribbons_summary.c:440-483). */
function GetMonRibbons(list: Pokenav_RibbonsSummaryList): void {
  let ribbonFlags = 0;
  let i = 0;
  let j = 0;
  let mons = list.monList;
  let monInfo = mons.monData[mons.currIndex] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  if (monInfo.boxId == TOTAL_BOXES_COUNT)
    ribbonFlags = GetMonData(gPlayerParty[monInfo.monId], MON_DATA_RIBBONS);
  else
    ribbonFlags = GetBoxMonDataAt(monInfo.boxId, monInfo.monId, MON_DATA_RIBBONS);
  list.numNormalRibbons = 0;
  list.numGiftRibbons = 0;
  for (i = 0; i < sRibbonData.length; i++)
  {
    // For all non-contest ribbons, numRibbons will be 1 if they have it, 0 if they don't
    // For contest ribbons, numRibbons will be 0-4
    let numRibbons = ((1 << sRibbonData[i].numBits) - 1) & ribbonFlags;
    if (!sRibbonData[i].isGiftRibbon)
    {
      for (j = 0; j < numRibbons; j++)
        list.ribbonIds[list.numNormalRibbons++] = sRibbonData[i].ribbonId + j;
    }
    else
    {
      for (j = 0; j < numRibbons; j++)
        list.giftRibbonIds[list.numGiftRibbons++] = sRibbonData[i].ribbonId + j;
    }
    ribbonFlags >>= sRibbonData[i].numBits;
  }
  if (list.numNormalRibbons != 0)
  {
    list.normalRibbonLastRowStart = (Math.trunc((list.numNormalRibbons - 1) / RIBBONS_PER_ROW)) * RIBBONS_PER_ROW;
    list.selectedPos = 0;
  }
  else
  {
    // There are no normal ribbons, move cursor to first gift ribbon
    list.normalRibbonLastRowStart = 0;
    list.selectedPos = GIFT_RIBBON_START_POS;
  }
}

/** 1:1 `static u32 *GetNormalRibbonIds(u32 *size)` (pokenav_ribbons_summary.c:485-490). */
function GetNormalRibbonIds(size: { v: number }): Uint32Array | null {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
  size.v = list.numNormalRibbons;
  return list.ribbonIds;
}

/** 1:1 `static u32 *GetGiftRibbonIds(u32 *size)` (pokenav_ribbons_summary.c:492-497). */
function GetGiftRibbonIds(size: { v: number }): Uint32Array | null {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
  size.v = list.numGiftRibbons;
  return list.giftRibbonIds;
}

/** 1:1 `static u16 GetSelectedPosition(void)` (pokenav_ribbons_summary.c:499-503). */
function GetSelectedPosition(): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
  return list.selectedPos;
}

/** 1:1 `static u32 GetRibbonId(void)` (pokenav_ribbons_summary.c:505-513). */
function GetRibbonId(): number {
  let list = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST);
  let ribbonPos = list.selectedPos;
  if (ribbonPos < FIRST_GIFT_RIBBON)
    return list.ribbonIds[ribbonPos];
  else
    return list.giftRibbonIds[ribbonPos - GIFT_RIBBON_START_POS];
}

/** 1:1 `bool32 OpenRibbonsSummaryMenu(void)` (pokenav_ribbons_summary.c:515-524). */
export function OpenRibbonsSummaryMenu(): boolean {
  let menu = AllocSubstruct(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_RibbonsSummaryMenu) */);
  if (menu == null)
    return false;
  // ADAPTATION MOTEUR : `u8 tilemapBuffers[2][BG_SCREEN_SIZE]` inline zéro-init en C ; AllocSubstruct
  // rend {} → init explicite des 2 buffers tilemap (sinon SetBgTilemapBuffer(2, menu.tilemapBuffers[0]) NaN).
  menu.tilemapBuffers = [new Uint8Array(0x800), new Uint8Array(0x800)];
  menu.loopedTaskId = CreateLoopedTask(LoopedTask_OpenRibbonsSummaryMenu, 1);
  menu.callback = GetCurrentLoopedTaskActive;
  return true;
}

/** 1:1 `void CreateRibbonsSummaryLoopedTask(s32 id)` (pokenav_ribbons_summary.c:526-531). */
export function CreateRibbonsSummaryLoopedTask(id: number): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU);
  menu.loopedTaskId = CreateLoopedTask(sRibbonsSummaryMenuLoopTaskFuncs[id], 1);
  menu.callback = GetCurrentLoopedTaskActive;
}

/** 1:1 `u32 IsRibbonsSummaryLoopedTaskActive(void)` (pokenav_ribbons_summary.c:533-537). */
export function IsRibbonsSummaryLoopedTaskActive(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU);
  return menu.callback();
}

/** 1:1 `void FreeRibbonsSummaryScreen2(void)` (pokenav_ribbons_summary.c:539-558). */
export function FreeRibbonsSummaryScreen2(): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU);
  RemoveWindow(menu.ribbonCountWindowId);
  RemoveWindow(menu.nameWindowId);
  RemoveWindow(menu.listIdxWindowId);
  RemoveWindow(menu.unusedWindowId);
  // Removing window, but window id is never set
  DestroyRibbonsMonFrontPic(menu);
  FreeSpriteTilesByTag(GFXTAG_RIBBON_ICONS_BIG);
  FreeSpritePaletteByTag(PALTAG_RIBBON_ICONS_1);
  FreeSpritePaletteByTag(PALTAG_RIBBON_ICONS_2);
  FreeSpritePaletteByTag(PALTAG_RIBBON_ICONS_3);
  FreeSpritePaletteByTag(PALTAG_RIBBON_ICONS_4);
  FreeSpritePaletteByTag(PALTAG_RIBBON_ICONS_5);
  FreeSpriteOamMatrix(menu.bigRibbonSprite);
  DestroySprite(menu.bigRibbonSprite);
  FreePokenavSubstruct(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU);
}

/** 1:1 `static bool32 GetCurrentLoopedTaskActive(void)` (pokenav_ribbons_summary.c:560-564). */
function GetCurrentLoopedTaskActive(): boolean {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU);
  return IsLoopedTaskActive(menu.loopedTaskId);
}

/** 1:1 `static u32 LoopedTask_OpenRibbonsSummaryMenu(s32 state)` (pokenav_ribbons_summary.c:566-651). */
function LoopedTask_OpenRibbonsSummaryMenu(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU);
  switch (state) {
    case 0:
      // ADAPTATION MOTEUR (async asset) : summary_bg + icons en ROM côté décomp ; le port fetch →
      // gate le case 0 tant que non fetché (sanctionné, cf. pokenav_list case 3). `_settled` = loaded OU 404.
      if (!_ribbonsSummaryAssetsSettled) { _loadRibbonsSummaryAssets(); return LT_PAUSE; }
      InitBgTemplates(sBgTemplates, sBgTemplates.length);
      DecompressAndCopyTileDataToVram(2, gPokenavRibbonsSummaryBg_Gfx, 0, 0, 0);
      SetBgTilemapBuffer(2, menu.tilemapBuffers[0]);
      CopyToBgTilemapBuffer(2, gPokenavRibbonsSummaryBg_Tilemap, 0, 0);
      CopyPaletteIntoBufferUnfaded(gPokenavRibbonsSummaryBg_Pal, BG_PLTT_ID(1), PLTT_SIZE_4BPP);
      CopyBgTilemapBufferToVram(2);
      return LT_INC_AND_PAUSE;
    case 1:
      if (!FreeTempTileDataBuffersIfPossible())
      {
        BgDmaFill(1, 0, 0, 1);
        DecompressAndCopyTileDataToVram(1, sRibbonIconsSmall_Gfx, 0, 1, 0);
        SetBgTilemapBuffer(1, menu.tilemapBuffers[1]);
        FillBgTilemapBufferRect_Palette0(1, 0, 0, 0, 32, 20);
        CopyPaletteIntoBufferUnfaded(sRibbonIcons1_Pal, BG_PLTT_ID(2), 5 * PLTT_SIZE_4BPP);
        CopyPaletteIntoBufferUnfaded(sMonInfo_Pal, BG_PLTT_ID(10), sMonInfo_Pal ? sMonInfo_Pal.length * 2 : 0 /* sizeof = octets */);
        CopyBgTilemapBufferToVram(1);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 2:
      if (!FreeTempTileDataBuffersIfPossible())
      {
        AddRibbonCountWindow(menu);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 3:
      if (!FreeTempTileDataBuffersIfPossible())
      {
        AddRibbonSummaryMonNameWindow(menu);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 4:
      if (!FreeTempTileDataBuffersIfPossible())
      {
        AddRibbonListIndexWindow(menu);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 5:
      if (!IsDma3ManagerBusyWithBgCopy())
      {
        CopyBgTilemapBufferToVram(2);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 6:
      if (!IsDma3ManagerBusyWithBgCopy())
      {
        // ADAPTATION MOTEUR (async asset) : la front pic du mon est fetchée async → gate jusqu'à
        // ce que son chargement soit réglé (loaded OU 404) avant de dessiner (jamais de crash/freeze).
        if (!_isRibbonsSummaryMonPicSettled()) return LT_PAUSE;
        ResetSpritesAndDrawMonFrontPic(menu);
        return LT_INC_AND_CONTINUE;
      }
      return LT_PAUSE;
    case 7:
      DrawAllRibbonsSmall(menu);
      PrintHelpBarText(HELPBAR_RIBBONS_LIST);
      return LT_INC_AND_PAUSE;
    case 8:
      if (!IsDma3ManagerBusyWithBgCopy())
      {
        CreateBigRibbonSprite(menu);
        ChangeBgX(1, 0, BG_COORD_SET);
        ChangeBgY(1, 0, BG_COORD_SET);
        ChangeBgX(2, 0, BG_COORD_SET);
        ChangeBgY(2, 0, BG_COORD_SET);
        ShowBg(1);
        ShowBg(2);
        HideBg(3);
        PokenavFadeScreen(POKENAV_FADE_FROM_BLACK);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 9:
      if (IsPaletteFadeActive())
        return LT_PAUSE;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_ExitRibbonsSummaryMenu(s32 state)` (pokenav_ribbons_summary.c:653-667). */
function LoopedTask_ExitRibbonsSummaryMenu(state: number): number {
  switch (state) {
    case 0:
      PlaySE(SE_SELECT);
      PokenavFadeScreen(POKENAV_FADE_TO_BLACK);
      return LT_INC_AND_PAUSE;
    case 1:
      if (IsPaletteFadeActive())
        return LT_PAUSE;
      return LT_FINISH;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_SwitchRibbonsSummaryMon(s32 state)` (pokenav_ribbons_summary.c:669-706). */
function LoopedTask_SwitchRibbonsSummaryMon(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU);
  switch (state) {
    case 0:
      PlaySE(SE_SELECT);
      // ADAPTATION MOTEUR (async asset) : préchauffe la front pic du NOUVEAU mon (currIndex déjà mis à
      // jour par RibbonsSummaryHandleInput) pendant le slide-off — gate au case 5 (SlideMonSpriteOn).
      _prefetchRibbonsSummaryMonPic(GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_LIST) as any);
      SlideMonSpriteOff(menu);
      return LT_INC_AND_PAUSE;
    case 1:
      if (!IsMonSpriteAnimating(menu))
      {
        PrintRibbbonsSummaryMonInfo(menu);
        return LT_INC_AND_CONTINUE;
      }
      return LT_PAUSE;
    case 2:
      DrawAllRibbonsSmall(menu);
      return LT_INC_AND_CONTINUE;
    case 3:
      PrintRibbonsMonListIndex(menu);
      return LT_INC_AND_CONTINUE;
    case 4:
      PrintCurrentMonRibbonCount(menu);
      return LT_INC_AND_CONTINUE;
    case 5:
      if (!IsDma3ManagerBusyWithBgCopy())
      {
        if (!_isRibbonsSummaryMonPicSettled()) return LT_PAUSE; // gate async asset (front pic du nouveau mon)
        SlideMonSpriteOn(menu);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 6:
      if (IsMonSpriteAnimating(menu))
        return LT_PAUSE;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_ExpandSelectedRibbon(s32 state)` (pokenav_ribbons_summary.c:708-730). */
function LoopedTask_ExpandSelectedRibbon(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU);
  switch (state) {
    case 0:
      PlaySE(SE_SELECT);
      UpdateAndZoomInSelectedRibbon(menu);
      return LT_INC_AND_PAUSE;
    case 1:
      if (!IsRibbonAnimating(menu))
      {
        PrintRibbonNameAndDescription(menu);
        PrintHelpBarText(HELPBAR_RIBBONS_CHECK);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 2:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_MoveRibbonsCursorExpanded(s32 state)` (pokenav_ribbons_summary.c:732-760). */
function LoopedTask_MoveRibbonsCursorExpanded(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU);
  switch (state) {
    case 0:
      PlaySE(SE_SELECT);
      ZoomOutSelectedRibbon(menu);
      return LT_INC_AND_PAUSE;
    case 1:
      if (!IsRibbonAnimating(menu))
      {
        UpdateAndZoomInSelectedRibbon(menu);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 2:
      if (!IsRibbonAnimating(menu))
      {
        PrintRibbonNameAndDescription(menu);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 3:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
  }
  return LT_FINISH;
}

/** 1:1 `static u32 LoopedTask_ShrinkExpandedRibbon(s32 state)` (pokenav_ribbons_summary.c:762-784). */
function LoopedTask_ShrinkExpandedRibbon(state: number): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_RIBBONS_SUMMARY_MENU);
  switch (state) {
    case 0:
      PlaySE(SE_SELECT);
      ZoomOutSelectedRibbon(menu);
      return LT_INC_AND_PAUSE;
    case 1:
      if (!IsRibbonAnimating(menu))
      {
        PrintCurrentMonRibbonCount(menu);
        PrintHelpBarText(HELPBAR_RIBBONS_LIST);
        return LT_INC_AND_PAUSE;
      }
      return LT_PAUSE;
    case 2:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
  }
  return LT_FINISH;
}

/** 1:1 (pokenav_ribbons_summary.c:786) */
const sRibbonCountWindowTemplate = {
  bg: 2,
  tilemapLeft: 12,
  tilemapTop: 13,
  width: 16,
  height: 4,
  paletteNum: 1,
  baseBlock: 0x14 };

/** 1:1 `static void AddRibbonCountWindow(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:797-802). */
function AddRibbonCountWindow(menu: Pokenav_RibbonsSummaryMenu): void {
  menu.ribbonCountWindowId = AddWindow(sRibbonCountWindowTemplate);
  PutWindowTilemap(menu.ribbonCountWindowId);
  PrintCurrentMonRibbonCount(menu);
}

/** 1:1 `static void PrintCurrentMonRibbonCount(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:804-815). */
function PrintCurrentMonRibbonCount(menu: Pokenav_RibbonsSummaryMenu): void {
  const color = Uint8Array.from([
  TEXT_COLOR_RED,
  TEXT_COLOR_DARK_GRAY,
  TEXT_COLOR_LIGHT_GRAY,
]);
  ConvertIntToDecimalStringN(gStringVar1, GetCurrMonRibbonCount(), STR_CONV_MODE_LEFT_ALIGN, 2);
  DynamicPlaceholderTextUtil_Reset();
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(0, gStringVar1);
  // 1:1 pokenav_ribbons_summary.c:811 `DynamicPlaceholderTextUtil_ExpandPlaceholders(gStringVar4, gText_RibbonsF700)`.
  // gText_RibbonsF700 = `const u8[]` (buffer EOS-terminé) ; getString rend une STRING JS. Le helper scanne
  // `while (src[s] !== EOS)` (EOS = 0xFF numérique) → sur une string JS, src[s] (char/undefined) n'est JAMAIS
  // === 0xFF → BOUCLE INFINIE synchrone (freeze dur, sans throw). encodeOwText encode {DYNAMIC 0}→[0xF7,0x00]
  // et termine par EOS. Précédent : pokemon_summary_screen.ts:1167 (`encodeOwText(text)`).
  DynamicPlaceholderTextUtil_ExpandPlaceholders(gStringVar4, encodeOwText(getString('gText_RibbonsF700')));
  FillWindowPixelBuffer(menu.ribbonCountWindowId, PIXEL_FILL(4));
  AddTextPrinterParameterized3(menu.ribbonCountWindowId, FONT_NORMAL, 0, 1, color, TEXT_SKIP_DRAW, gStringVar4);
  CopyWindowToVram(menu.ribbonCountWindowId, COPYWIN_GFX);
}

/** 1:1 `static void PrintRibbonNameAndDescription(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:817-848). */
function PrintRibbonNameAndDescription(menu: Pokenav_RibbonsSummaryMenu): void {
  let i = 0;
  let ribbonId = GetRibbonId();
  const color = Uint8Array.from([
  TEXT_COLOR_RED,
  TEXT_COLOR_DARK_GRAY,
  TEXT_COLOR_LIGHT_GRAY,
]);
  FillWindowPixelBuffer(menu.ribbonCountWindowId, PIXEL_FILL(4));
  if (ribbonId < FIRST_GIFT_RIBBON)
  {
    // Print normal ribbon name/description
    for (i = 0; i < 2; i++)
      AddTextPrinterParameterized3(menu.ribbonCountWindowId, FONT_NORMAL, 0, (i * 16) + 1, color, TEXT_SKIP_DRAW, gRibbonDescriptionPointers[ribbonId][i]);
  }
  else
  {
    // ribbonId here is one of the 'gift' ribbon slots, used to read
    // its actual value from giftRibbons to determine which specific
    // gift ribbon it is
    ribbonId = gSaveBlock1Ptr.giftRibbons[ribbonId - FIRST_GIFT_RIBBON];
    // If 0, this gift ribbon slot is unoccupied
    if (ribbonId == 0)
      return;
    // Print gift ribbon name/description
    ribbonId--;
    for (i = 0; i < 2; i++)
      AddTextPrinterParameterized3(menu.ribbonCountWindowId, FONT_NORMAL, 0, (i * 16) + 1, color, TEXT_SKIP_DRAW, gGiftRibbonDescriptionPointers[ribbonId][i]);
  }
  CopyWindowToVram(menu.ribbonCountWindowId, COPYWIN_GFX);
}

/** 1:1 (pokenav_ribbons_summary.c:850) */
const sRibbonSummaryMonNameWindowTemplate = {
  bg: 2,
  tilemapLeft: 14,
  tilemapTop: 1,
  width: 13,
  height: 2,
  paletteNum: 10,
  baseBlock: 0x54 };

/** 1:1 `static void AddRibbonSummaryMonNameWindow(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:861-866). */
function AddRibbonSummaryMonNameWindow(menu: Pokenav_RibbonsSummaryMenu): void {
  menu.nameWindowId = AddWindow(sRibbonSummaryMonNameWindowTemplate);
  PutWindowTilemap(menu.nameWindowId);
  PrintRibbbonsSummaryMonInfo(menu);
}

/** 1:1 (pokenav_ribbons_summary.c:868) */
const sMaleIconString = encodeOwText("{COLOR_HIGHLIGHT_SHADOW}{LIGHT_RED}{WHITE}{GREEN}♂{COLOR_HIGHLIGHT_SHADOW}{DARK_GRAY}{WHITE}{LIGHT_GRAY}");

/** 1:1 (pokenav_ribbons_summary.c:869) */
const sFemaleIconString = encodeOwText("{COLOR_HIGHLIGHT_SHADOW}{LIGHT_GREEN}{WHITE}{BLUE}♀{COLOR_HIGHLIGHT_SHADOW}{DARK_GRAY}{WHITE}{LIGHT_GRAY}");

/** 1:1 (pokenav_ribbons_summary.c:870) */
const sGenderlessIconString = encodeOwText("{UNK_SPACER}");

/** 1:1 `static void PrintRibbbonsSummaryMonInfo(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:872-902). */
function PrintRibbbonsSummaryMonInfo(menu: Pokenav_RibbonsSummaryMenu): void {
  let genderTxt: any = null;
  let txtPtr: any = null;
  const level = { v: 0 }; // TRANSPILER: &level pris → box
  const gender = { v: 0 }; // TRANSPILER: &gender pris → box
  let windowId = menu.nameWindowId;
  FillWindowPixelBuffer(windowId, PIXEL_FILL(1));
  GetMonNicknameLevelGender(gStringVar3, level, gender);
  AddTextPrinterParameterized(windowId, FONT_NORMAL, gStringVar3, 0, 1, TEXT_SKIP_DRAW, null);
  switch (gender.v) {
    case MON_MALE:
      genderTxt = sMaleIconString;
      break;
    case MON_FEMALE:
      genderTxt = sFemaleIconString;
      break;
    default:
      genderTxt = sGenderlessIconString;
      break;
  }
  txtPtr = StringCopy(gStringVar1, genderTxt);
  txtPtr[0] = CHAR_SLASH; txtPtr = txtPtr.subarray(1);         // 1:1 `*(txtPtr++) = CHAR_SLASH`
  txtPtr[0] = CHAR_EXTRA_SYMBOL; txtPtr = txtPtr.subarray(1);  // 1:1 `*(txtPtr++) = CHAR_EXTRA_SYMBOL`
  txtPtr[0] = CHAR_LV_2; txtPtr = txtPtr.subarray(1);          // 1:1 `*(txtPtr++) = CHAR_LV_2`
  ConvertIntToDecimalStringN(txtPtr, level.v, STR_CONV_MODE_LEFT_ALIGN, 3);
  AddTextPrinterParameterized(windowId, FONT_NORMAL, gStringVar1, 60, 1, TEXT_SKIP_DRAW, null);
  CopyWindowToVram(windowId, COPYWIN_GFX);
}

/** 1:1 (pokenav_ribbons_summary.c:904) */
const sRibbonMonListIndexWindowTemplate = [
  {
    bg: 2,
    tilemapLeft: 1,
    tilemapTop: 5,
    width: 7,
    height: 2,
    paletteNum: 1,
    baseBlock: 0x6E },
  [

  ],
];

/** 1:1 `static void AddRibbonListIndexWindow(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:918-924). */
function AddRibbonListIndexWindow(menu: Pokenav_RibbonsSummaryMenu): void {
  menu.listIdxWindowId = AddWindow(sRibbonMonListIndexWindowTemplate);
  FillWindowPixelBuffer(menu.listIdxWindowId, PIXEL_FILL(1));
  PutWindowTilemap(menu.listIdxWindowId);
  PrintRibbonsMonListIndex(menu);
}

/** 1:1 `static void PrintRibbonsMonListIndex(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:926-939). */
function PrintRibbonsMonListIndex(menu: Pokenav_RibbonsSummaryMenu): void {
  let x = 0;
  let txtPtr: any = null;
  let id = GetRibbonsSummaryCurrentIndex() + 1;
  let count = GetRibbonsSummaryMonListCount();
  txtPtr = ConvertIntToDecimalStringN(gStringVar1, id, STR_CONV_MODE_RIGHT_ALIGN, 3);
  txtPtr[0] = CHAR_SLASH; txtPtr = txtPtr.subarray(1); // 1:1 `*(txtPtr++) = CHAR_SLASH`
  ConvertIntToDecimalStringN(txtPtr, count, STR_CONV_MODE_RIGHT_ALIGN, 3);
  x = GetStringCenterAlignXOffset(FONT_NORMAL, gStringVar1, 56);
  AddTextPrinterParameterized(menu.listIdxWindowId, FONT_NORMAL, gStringVar1, x, 1, TEXT_SKIP_DRAW, null);
  CopyWindowToVram(menu.listIdxWindowId, COPYWIN_GFX);
}

/** 1:1 `static void ResetSpritesAndDrawMonFrontPic(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:941-950). */
function ResetSpritesAndDrawMonFrontPic(menu: Pokenav_RibbonsSummaryMenu): void {
  const species = { v: 0 }; // TRANSPILER: &species pris → box
  const personality = { v: 0 }; // TRANSPILER: &personality pris → box
  const otId = { v: 0 }; // TRANSPILER: &otId pris → box
  GetMonSpeciesPersonalityOtId(species, personality, otId);
  ResetAllPicSprites();
  menu.monSpriteId = DrawRibbonsMonFrontPic(MON_SPRITE_X_ON, MON_SPRITE_Y);
  PokenavFillPalette(15, 0);
}

/** 1:1 `static void DestroyRibbonsMonFrontPic(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:952-955). */
function DestroyRibbonsMonFrontPic(menu: Pokenav_RibbonsSummaryMenu): void {
  FreeAndDestroyMonPicSprite(menu.monSpriteId);
}

// x and y arguments are ignored

// y is always given as MON_SPRITE_Y

// x is given as either MON_SPRITE_X_ON or MON_SPRITE_X_OFF (but ignored and MON_SPRITE_X_ON is used)

/** 1:1 `static u16 DrawRibbonsMonFrontPic(s32 x, s32 y)` (pokenav_ribbons_summary.c:960-969). */
function DrawRibbonsMonFrontPic(x: number, y: number): number {
  const species = { v: 0 }; // TRANSPILER: &species pris → box
  let spriteId = 0;
  const personality = { v: 0 }; // TRANSPILER: &personality pris → box
  const otId = { v: 0 }; // TRANSPILER: &otId pris → box
  GetMonSpeciesPersonalityOtId(species, personality, otId);
  spriteId = CreateMonPicSprite_HandleDeoxys(species.v, otId.v, personality.v, true, MON_SPRITE_X_ON, MON_SPRITE_Y, 15, TAG_NONE);
  // ADAPTATION MOTEUR (async asset) : la ROM garantit un spriteId valide (DecompressPic sync) ; notre
  // front pic est fetchée async → 0xFFFF si absente/404. Garde le déréférencement (jamais de crash).
  if (spriteId !== 0xFFFF && gSprites[spriteId])
    gSprites[spriteId].oam.priority = 0;
  return spriteId;
}

/** 1:1 `static void SlideMonSpriteOff(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:971-974). */
function SlideMonSpriteOff(menu: Pokenav_RibbonsSummaryMenu): void {
  const s = gSprites[menu.monSpriteId]; // garde async asset : sprite absent (0xFFFF) → no-op (jamais de crash)
  if (s) StartMonSpriteSlide(s, MON_SPRITE_X_ON, MON_SPRITE_X_OFF, 6);
}

/** 1:1 `static void SlideMonSpriteOn(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:976-984). */
function SlideMonSpriteOn(menu: Pokenav_RibbonsSummaryMenu): void {
  // Switch to new mon sprite
  FreeAndDestroyMonPicSprite(menu.monSpriteId);
  menu.monSpriteId = DrawRibbonsMonFrontPic(MON_SPRITE_X_OFF, MON_SPRITE_Y);
  // Slide on
  const s = gSprites[menu.monSpriteId]; // garde async asset : sprite absent (0xFFFF) → no-op
  if (s) StartMonSpriteSlide(s, MON_SPRITE_X_OFF, MON_SPRITE_X_ON, 6);
}

// Is Pokémon summary sprite still sliding off/on

/** 1:1 `static bool32 IsMonSpriteAnimating(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:987-990). */
function IsMonSpriteAnimating(menu: Pokenav_RibbonsSummaryMenu): boolean {
  const s = gSprites[menu.monSpriteId]; // garde async asset : sprite absent → « pas en anim » (débloque le task)
  return s ? (s.callback != SpriteCallbackDummy) : false;
}

// #define sCurrX data[0]  (alias — expansé aux usages)

// #define sMoveIncr data[1]  (alias — expansé aux usages)

// #define sTime data[2]  (alias — expansé aux usages)

// #define sDestX data[3]  (alias — expansé aux usages)

/** 1:1 `static void StartMonSpriteSlide(struct Sprite *sprite, s32 startX, s32 destX, s32 time)` (pokenav_ribbons_summary.c:997-1008). */
function StartMonSpriteSlide(sprite: DecompSprite, startX: number, destX: number, time: number): void {
  let delta = destX - startX;
  sprite.x = startX;
  sprite.data[0] /* sCurrX */ = startX << 4;
  sprite.data[1] /* sMoveIncr */ = Math.trunc((delta << 4) / time);
  sprite.data[2] /* sTime */ = time;
  sprite.data[3] /* sDestX */ = destX;
  sprite.callback = SpriteCB_MonSpriteSlide;
}

/** 1:1 `static void SpriteCB_MonSpriteSlide(struct Sprite *sprite)` (pokenav_ribbons_summary.c:1010-1027). */
function SpriteCB_MonSpriteSlide(sprite: DecompSprite): void {
  if (sprite.data[2] /* sTime */ != 0)
  {
    sprite.data[2] /* sTime */--;
    sprite.data[0] /* sCurrX */ += sprite.data[1] /* sMoveIncr */;
    sprite.x = sprite.data[0] /* sCurrX */ >> 4;
    if (sprite.x <= MON_SPRITE_X_OFF)
      sprite.invisible = true;
    else
      sprite.invisible = false;
  }
  else
  {
    sprite.x = sprite.data[3] /* sDestX */;
    sprite.callback = SpriteCallbackDummy;
  }
}

/** 1:1 `static void DrawAllRibbonsSmall(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:1034-1049). */
function DrawAllRibbonsSmall(menu: Pokenav_RibbonsSummaryMenu): void {
  void menu;
  let ribbonIds: any = null;
  let ri = 0;                // 1:1 parcours pointeur `*ribbonIds++`
  const size = { v: 0 };     // 1:1 `&sRibbonDraw_Total` (out-param) → box, recopié dans le global
  ClearRibbonsSummaryBg();
  ribbonIds = GetNormalRibbonIds(size); sRibbonDraw_Total = size.v;
  for (ri = 0, sRibbonDraw_Current = 0; sRibbonDraw_Current < sRibbonDraw_Total; sRibbonDraw_Current++)
    DrawRibbonSmall(sRibbonDraw_Current, ribbonIds[ri++]); // 1:1 `*ribbonIds++`
  ribbonIds = GetGiftRibbonIds(size); sRibbonDraw_Total = size.v;
  for (ri = 0, sRibbonDraw_Current = 0; sRibbonDraw_Current < sRibbonDraw_Total; sRibbonDraw_Current++)
    DrawRibbonSmall(sRibbonDraw_Current + GIFT_RIBBON_START_POS, ribbonIds[ri++]); // 1:1 `*ribbonIds++`
  CopyBgTilemapBufferToVram(1);
}

// Redundant, the same FillBg is called in LoopedTask_OpenRibbonsSummaryMenu

/** 1:1 `static void ClearRibbonsSummaryBg(void)` (pokenav_ribbons_summary.c:1052-1055). */
function ClearRibbonsSummaryBg(): void {
  FillBgTilemapBufferRect_Palette0(1, 0, 0, 0, 32, 20);
}

/** 1:1 `static void DrawRibbonSmall(u32 i, u32 ribbonId)` (pokenav_ribbons_summary.c:1057-1065). */
function DrawRibbonSmall(i: number, ribbonId: number): void {
  const bgData = new Uint16Array(4);
  let destX = (i % RIBBONS_PER_ROW) * 2 + 11;
  let destY = (Math.trunc(i / RIBBONS_PER_ROW)) * 2 + 4;
  BufferSmallRibbonGfxData(bgData, ribbonId);
  CopyToBgTilemapBufferRect(1, bgData, destX, destY, 2, 2);
}

// Below correspond to a ribbon icon in ribbons/icons.png and ribbons/icons_big.png; 0 at top, 11 at bottom

// enum pokenav_ribbons_summary.c:1068
const RIBBONGFX_CHAMPION = 0;
const RIBBONGFX_CONTEST_NORMAL = 1;
const RIBBONGFX_CONTEST_SUPER = 2;
const RIBBONGFX_CONTEST_HYPER = 3;
const RIBBONGFX_CONTEST_MASTER = 4;
const RIBBONGFX_WINNING = 5;
const RIBBONGFX_VICTORY = 6;
const RIBBONGFX_ARTIST = 7;
const RIBBONGFX_EFFORT = 8;
const RIBBONGFX_GIFT_1 = 9;
const RIBBONGFX_GIFT_2 = 10;
const RIBBONGFX_GIFT_3 = 11;

const TO_PAL_OFFSET = (palNum: number) => ((palNum) - PALTAG_RIBBON_ICONS_1); // 1:1 macro pokenav_ribbons_summary.c:1083

/** 1:1 struct `{ u16 tileNumOffset; u16 palNumOffset; }` sRibbonGfxData[] (pokenav_ribbons_summary.c:1085-1123). */
export const sRibbonGfxData = [
  { tileNumOffset: RIBBONGFX_CHAMPION,       palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_1) }, // [CHAMPION_RIBBON]
  { tileNumOffset: RIBBONGFX_CONTEST_NORMAL, palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_1) }, // [COOL_RIBBON_NORMAL]
  { tileNumOffset: RIBBONGFX_CONTEST_SUPER,  palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_1) }, // [COOL_RIBBON_SUPER]
  { tileNumOffset: RIBBONGFX_CONTEST_HYPER,  palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_1) }, // [COOL_RIBBON_HYPER]
  { tileNumOffset: RIBBONGFX_CONTEST_MASTER, palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_1) }, // [COOL_RIBBON_MASTER]
  { tileNumOffset: RIBBONGFX_CONTEST_NORMAL, palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_2) }, // [BEAUTY_RIBBON_NORMAL]
  { tileNumOffset: RIBBONGFX_CONTEST_SUPER,  palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_2) }, // [BEAUTY_RIBBON_SUPER]
  { tileNumOffset: RIBBONGFX_CONTEST_HYPER,  palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_2) }, // [BEAUTY_RIBBON_HYPER]
  { tileNumOffset: RIBBONGFX_CONTEST_MASTER, palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_2) }, // [BEAUTY_RIBBON_MASTER]
  { tileNumOffset: RIBBONGFX_CONTEST_NORMAL, palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_3) }, // [CUTE_RIBBON_NORMAL]
  { tileNumOffset: RIBBONGFX_CONTEST_SUPER,  palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_3) }, // [CUTE_RIBBON_SUPER]
  { tileNumOffset: RIBBONGFX_CONTEST_HYPER,  palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_3) }, // [CUTE_RIBBON_HYPER]
  { tileNumOffset: RIBBONGFX_CONTEST_MASTER, palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_3) }, // [CUTE_RIBBON_MASTER]
  { tileNumOffset: RIBBONGFX_CONTEST_NORMAL, palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_4) }, // [SMART_RIBBON_NORMAL]
  { tileNumOffset: RIBBONGFX_CONTEST_SUPER,  palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_4) }, // [SMART_RIBBON_SUPER]
  { tileNumOffset: RIBBONGFX_CONTEST_HYPER,  palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_4) }, // [SMART_RIBBON_HYPER]
  { tileNumOffset: RIBBONGFX_CONTEST_MASTER, palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_4) }, // [SMART_RIBBON_MASTER]
  { tileNumOffset: RIBBONGFX_CONTEST_NORMAL, palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_5) }, // [TOUGH_RIBBON_NORMAL]
  { tileNumOffset: RIBBONGFX_CONTEST_SUPER,  palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_5) }, // [TOUGH_RIBBON_SUPER]
  { tileNumOffset: RIBBONGFX_CONTEST_HYPER,  palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_5) }, // [TOUGH_RIBBON_HYPER]
  { tileNumOffset: RIBBONGFX_CONTEST_MASTER, palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_5) }, // [TOUGH_RIBBON_MASTER]
  { tileNumOffset: RIBBONGFX_WINNING,        palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_1) }, // [WINNING_RIBBON]
  { tileNumOffset: RIBBONGFX_VICTORY,        palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_1) }, // [VICTORY_RIBBON]
  { tileNumOffset: RIBBONGFX_ARTIST,         palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_2) }, // [ARTIST_RIBBON]
  { tileNumOffset: RIBBONGFX_EFFORT,         palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_3) }, // [EFFORT_RIBBON]
  { tileNumOffset: RIBBONGFX_GIFT_1,         palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_2) }, // [MARINE_RIBBON]
  { tileNumOffset: RIBBONGFX_GIFT_1,         palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_4) }, // [LAND_RIBBON]
  { tileNumOffset: RIBBONGFX_GIFT_1,         palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_5) }, // [SKY_RIBBON]
  { tileNumOffset: RIBBONGFX_GIFT_2,         palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_4) }, // [COUNTRY_RIBBON]
  { tileNumOffset: RIBBONGFX_GIFT_2,         palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_5) }, // [NATIONAL_RIBBON]
  { tileNumOffset: RIBBONGFX_GIFT_3,         palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_1) }, // [EARTH_RIBBON]
  { tileNumOffset: RIBBONGFX_GIFT_3,         palNumOffset: TO_PAL_OFFSET(PALTAG_RIBBON_ICONS_2) }, // [WORLD_RIBBON]
];

/** 1:1 `static void BufferSmallRibbonGfxData(u16 *dst, u32 ribbonId)` (pokenav_ribbons_summary.c:1127-1136). */
function BufferSmallRibbonGfxData(dst: Uint16Array, ribbonId: number): void {
  let palNum = sRibbonGfxData[ribbonId].palNumOffset + 2;
  let tileNum = (sRibbonGfxData[ribbonId].tileNumOffset * 2) + 1;
  dst[0] = tileNum | (palNum << 12);
  dst[1] = tileNum | (palNum << 12) | 0x400;
  dst[2] = (tileNum + 1) | (palNum << 12);
  dst[3] = (tileNum + 1) | (palNum << 12) | 0x400;
}

/** 1:1 (pokenav_ribbons_summary.c:1138) */
const sSpriteSheet_RibbonIconsBig = {
  data: sRibbonIconsBig_Gfx,
  size: 0x1800,
  tag: GFXTAG_RIBBON_ICONS_BIG };

/** 1:1 (pokenav_ribbons_summary.c:1143) */
const sSpritePalettes_RibbonIcons = [
  {
    data: sRibbonIcons1_Pal,
    tag: PALTAG_RIBBON_ICONS_1 },
  {
    data: sRibbonIcons2_Pal,
    tag: PALTAG_RIBBON_ICONS_2 },
  {
    data: sRibbonIcons3_Pal,
    tag: PALTAG_RIBBON_ICONS_3 },
  {
    data: sRibbonIcons4_Pal,
    tag: PALTAG_RIBBON_ICONS_4 },
  {
    data: sRibbonIcons5_Pal,
    tag: PALTAG_RIBBON_ICONS_5 },
  [

  ],
];

/** 1:1 (pokenav_ribbons_summary.c:1153) */
const sOamData_RibbonIconBig = {
  y: 0, /* :8 */
  affineMode: ST_OAM_AFFINE_NORMAL, /* :2 */
  objMode: ST_OAM_OBJ_NORMAL, /* :2 */
  mosaic: 0, /* :1 */
  bpp: ST_OAM_4BPP, /* :1 */
  shape: 0, /* :2 */
  /* SPRITE_SHAPE(32x32) */
  x: 0, /* :9 */
  matrixNum: 0, /* :5 */
  size: 2, /* :2 */
  /* SPRITE_SIZE(32x32) */
  tileNum: 0, /* :10 */
  priority: 1, /* :2 */
  paletteNum: 0, /* :4 */
  affineParam: 0 };

/** 1:1 (pokenav_ribbons_summary.c:1170) */
const sAffineAnim_RibbonIconBig_Normal = {
  type: AFFINEANIMCMD_FRAME(128, 128, 0, 0),
  frame: AFFINEANIMCMD_END };

/** 1:1 (pokenav_ribbons_summary.c:1176) */
const sAffineAnim_RibbonIconBig_ZoomIn = {
  type: AFFINEANIMCMD_FRAME(128, 128, 0, 0),
  frame: AFFINEANIMCMD_FRAME(32, 32, 0, 4),
  loop: AFFINEANIMCMD_END };

/** 1:1 (pokenav_ribbons_summary.c:1183) */
const sAffineAnim_RibbonIconBig_ZoomOut = {
  type: AFFINEANIMCMD_FRAME(256, 256, 0, 0),
  frame: AFFINEANIMCMD_FRAME(-32, -32, 0, 4),
  loop: AFFINEANIMCMD_END };

// enum pokenav_ribbons_summary.c:1190
const RIBBONANIM_NORMAL = 0;
const RIBBONANIM_ZOOM_IN = 1;
const RIBBONANIM_ZOOM_OUT = 2;

/** 1:1 (pokenav_ribbons_summary.c:1196) */
const sAffineAnims_RibbonIconBig = [
  sAffineAnim_RibbonIconBig_Normal, // [RIBBONANIM_NORMAL]
  sAffineAnim_RibbonIconBig_ZoomIn, // [RIBBONANIM_ZOOM_IN]
  sAffineAnim_RibbonIconBig_ZoomOut, // [RIBBONANIM_ZOOM_OUT]
];

/** 1:1 (pokenav_ribbons_summary.c:1203) */
const sSpriteTemplate_RibbonIconBig = {
  tileTag: GFXTAG_RIBBON_ICONS_BIG,
  paletteTag: PALTAG_RIBBON_ICONS_1,
  oam: sOamData_RibbonIconBig,
  anims: gDummySpriteAnimTable,
  images: null,
  affineAnims: sAffineAnims_RibbonIconBig,
  callback: SpriteCallbackDummy };

// Create dummy sprite to be used for the zoomed in version of the selected ribbon

/** 1:1 `static void CreateBigRibbonSprite(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:1215-1225). */
function CreateBigRibbonSprite(menu: Pokenav_RibbonsSummaryMenu): void {
  let spriteId = 0;
  LoadCompressedSpriteSheet(sSpriteSheet_RibbonIconsBig);
  Pokenav_AllocAndLoadPalettes(sSpritePalettes_RibbonIcons);
  spriteId = CreateSprite(sSpriteTemplate_RibbonIconBig, 0, 0, 0);
  menu.bigRibbonSprite = gSprites[spriteId];
  menu.bigRibbonSprite.invisible = true;
}

// #define sInvisibleWhenDone data[0]  (alias — expansé aux usages)

/** 1:1 `static void UpdateAndZoomInSelectedRibbon(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:1229-1249). */
function UpdateAndZoomInSelectedRibbon(menu: Pokenav_RibbonsSummaryMenu): void {
  let ribbonId = 0;
  let position = GetSelectedPosition();
  let x = (position % RIBBONS_PER_ROW) * 16 + 96;
  let y = (Math.trunc(position / RIBBONS_PER_ROW)) * 16 + 40;
  menu.bigRibbonSprite.x = x;
  menu.bigRibbonSprite.y = y;
  // Set new selected ribbon's gfx data
  ribbonId = GetRibbonId();
  menu.bigRibbonSprite.oam.tileNum = (sRibbonGfxData[ribbonId].tileNumOffset * 16) + GetSpriteTileStartByTag(GFXTAG_RIBBON_ICONS_BIG);
  menu.bigRibbonSprite.oam.paletteNum = IndexOfSpritePaletteTag(sRibbonGfxData[ribbonId].palNumOffset + PALTAG_RIBBON_ICONS_1);
  // Start zoom in animation
  StartSpriteAffineAnim(menu.bigRibbonSprite, RIBBONANIM_ZOOM_IN);
  menu.bigRibbonSprite.invisible = false;
  menu.bigRibbonSprite.data[0] /* sInvisibleWhenDone */ = false;
  menu.bigRibbonSprite.callback = SpriteCB_WaitForRibbonAnimation;
}

// Start animation to zoom out of selected ribbon

/** 1:1 `static void ZoomOutSelectedRibbon(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:1252-1257). */
function ZoomOutSelectedRibbon(menu: Pokenav_RibbonsSummaryMenu): void {
  menu.bigRibbonSprite.data[0] /* sInvisibleWhenDone */ = true;
  StartSpriteAffineAnim(menu.bigRibbonSprite, RIBBONANIM_ZOOM_OUT);
  menu.bigRibbonSprite.callback = SpriteCB_WaitForRibbonAnimation;
}

/** 1:1 `static bool32 IsRibbonAnimating(struct Pokenav_RibbonsSummaryMenu *menu)` (pokenav_ribbons_summary.c:1259-1262). */
function IsRibbonAnimating(menu: Pokenav_RibbonsSummaryMenu): boolean {
  return (menu.bigRibbonSprite.callback != SpriteCallbackDummy);
}

/** 1:1 `static void SpriteCB_WaitForRibbonAnimation(struct Sprite *sprite)` (pokenav_ribbons_summary.c:1264-1271). */
function SpriteCB_WaitForRibbonAnimation(sprite: DecompSprite): void {
  if (sprite.affineAnimEnded)
  {
    sprite.invisible = sprite.data[0] /* sInvisibleWhenDone */;
    sprite.callback = SpriteCallbackDummy;
  }
}

// ═══ ADAPTATION MOTEUR (async assets) — le décomp a tout en ROM (INCGFX instantané) ; le port
//     fetch async au fade d'ouverture. Gate sur `_settled` (loaded OU 404) dans les looped tasks
//     (jamais de freeze). Réinjecte les data dans les structs sprite capturées null au module-init. ══

let _ribbonsSummaryAssetsLoaded = false;
let _ribbonsSummaryAssetsSettled = false;  // loaded OU échec (404) — débloque le gate même en cas de manque
let _ribbonsSummaryAssetsLoadStarted = false;
/** Préchauffe summary_bg + icons (small/big) + les 6 palettes (idempotent). */
export function PrefetchRibbonsSummaryAssets(): void { _loadRibbonsSummaryAssets(); }
function _loadRibbonsSummaryAssets(): void {
  if (_ribbonsSummaryAssetsLoadStarted) return;
  _ribbonsSummaryAssetsLoadStarted = true;
  void (async () => {
    try {
      const base = '/decomp/em/pokenav/ribbons/';
      const [bgGfx, bgTilemap, bgPal, iconsSmall, iconsBig, p1, p2, p3, p4, p5, monInfo] = await Promise.all([
        loadTileBin(base + 'summary_bg.png', 4),
        loadTilemapBin(base + 'summary_bg.bin'),
        extractPngPlte(base + 'summary_bg.png'),
        loadTileBin(base + 'icons.png', 4),
        loadTileBin(base + 'icons_big.png', 4),
        loadGbaPal(base + 'icons1.pal'),
        loadGbaPal(base + 'icons2.pal'),
        loadGbaPal(base + 'icons3.pal'),
        loadGbaPal(base + 'icons4.pal'),
        loadGbaPal(base + 'icons5.pal'),
        loadGbaPal(base + 'mon_info.pal'),
      ]);
      gPokenavRibbonsSummaryBg_Gfx = bgGfx;
      gPokenavRibbonsSummaryBg_Tilemap = bgTilemap;
      gPokenavRibbonsSummaryBg_Pal = bgPal;
      sRibbonIconsSmall_Gfx = iconsSmall;
      sRibbonIconsBig_Gfx = iconsBig;
      // 1:1 ROM : les 5 pals icons sont CONTIGUËS ; le bg copy (case 1) lit 5*PLTT_SIZE_4BPP depuis
      // sRibbonIcons1_Pal → concat en 80 couleurs (le sprite pal tag 1 n'en lit que les 16 premières = icons1).
      const combined = new Uint16Array(80);
      combined.set(p1.subarray(0, 16), 0);
      combined.set(p2.subarray(0, 16), 16);
      combined.set(p3.subarray(0, 16), 32);
      combined.set(p4.subarray(0, 16), 48);
      combined.set(p5.subarray(0, 16), 64);
      sRibbonIcons1_Pal = combined;
      sRibbonIcons2_Pal = p2.subarray(0, 16);
      sRibbonIcons3_Pal = p3.subarray(0, 16);
      sRibbonIcons4_Pal = p4.subarray(0, 16);
      sRibbonIcons5_Pal = p5.subarray(0, 16);
      sMonInfo_Pal = monInfo;
      // réinjecte dans les structs sprite (data = null au module-init, cf. pokenav_list).
      (sSpriteSheet_RibbonIconsBig as any).data = sRibbonIconsBig_Gfx;
      (sSpritePalettes_RibbonIcons[0] as any).data = sRibbonIcons1_Pal;
      (sSpritePalettes_RibbonIcons[1] as any).data = sRibbonIcons2_Pal;
      (sSpritePalettes_RibbonIcons[2] as any).data = sRibbonIcons3_Pal;
      (sSpritePalettes_RibbonIcons[3] as any).data = sRibbonIcons4_Pal;
      (sSpritePalettes_RibbonIcons[4] as any).data = sRibbonIcons5_Pal;
      _ribbonsSummaryAssetsLoaded = true;
    } catch (e) {
      console.error('[pokenav_ribbons_summary] chargement assets ribbons ÉCHOUÉ', e);
    } finally {
      _ribbonsSummaryAssetsSettled = true;
    }
  })();
}

// ── Préchargement front pic du mon (= ROM `DecompressPic` sync côté décomp) ──
let _monPicLoadingKey = '';                       // clé (enumName) en cours de fetch ('' = aucun → réglé)
const _monPicSettledKeys = new Set<string>();     // clés dont le substrat est prêt (ou 404)
/** Préchauffe le substrat mon-pic (tiles + palette) du mon courant de la summary list. */
function _prefetchRibbonsSummaryMonPic(list: Pokenav_RibbonsSummaryList): void {
  if (list == null || list.monList == null) return;
  const mons = list.monList;
  const monInfo = mons.monData[mons.currIndex];
  if (monInfo == null) return;
  let species = 0;
  if (monInfo.boxId == TOTAL_BOXES_COUNT)
    species = GetMonData(gPlayerParty[monInfo.monId], MON_DATA_SPECIES) as number;
  else
    species = GetBoxMonDataAt(monInfo.boxId, monInfo.monId, MON_DATA_SPECIES) as number;
  const key = reverseDecompConstant(species, 'SPECIES_') ?? 'SPECIES_NONE';
  if (_monPicSettledKeys.has(key) || _monPicLoadingKey === key) return;
  _monPicLoadingKey = key;
  const folder = key.replace('SPECIES_', '').toLowerCase();
  void (async () => {
    try {
      const [front, pal] = await Promise.all([
        loadIndexedPngStrict(`/decomp/em/pokemon/${folder}/front.png`, 4),
        loadGbaPal(`/decomp/em/pokemon/${folder}/normal.pal`),
      ]);
      _registerMonPicSubstrate(key, front.charData, pal.subarray(0, 16));
    } catch (e) {
      console.error('[pokenav_ribbons_summary] front pic préload KO', key, e);
    } finally {
      _monPicSettledKeys.add(key);
      if (_monPicLoadingKey === key) _monPicLoadingKey = '';
    }
  })();
}
/** true quand aucun fetch de front pic n'est en cours (loaded OU 404 → jamais de freeze). */
function _isRibbonsSummaryMonPicSettled(): boolean {
  return _monPicLoadingKey === '';
}
