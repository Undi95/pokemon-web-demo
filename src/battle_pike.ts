/**
 * battle_pike.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/battle_pike.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/battle_pike.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { BlendPalettes, FindTaskIdByFunc } from '../harness/runtime/decomp-globals';
import { RGB } from '../harness/runtime/decomp-helpers';
import { ABILITY_IMMUNITY, ABILITY_INSOMNIA, ABILITY_INTIMIDATE, ABILITY_KEEN_EYE, ABILITY_LIMBER, ABILITY_MAGMA_ARMOR, ABILITY_VITAL_SPIRIT, ABILITY_WATER_VEIL } from '../include/constants/abilities';
import { FRONTIER_FACILITY_PIKE, FRONTIER_MAX_LEVEL_50, FRONTIER_MIN_LEVEL_OPEN, FRONTIER_STAGES_PER_CHALLENGE, MAX_STREAK } from '../include/constants/battle_frontier';
import { OBJ_EVENT_GFX_BLACK_BELT, OBJ_EVENT_GFX_BUG_CATCHER, OBJ_EVENT_GFX_CYCLING_TRIATHLETE_M, OBJ_EVENT_GFX_DUSCLOPS, OBJ_EVENT_GFX_EXPERT_M, OBJ_EVENT_GFX_FAT_MAN, OBJ_EVENT_GFX_FISHERMAN, OBJ_EVENT_GFX_GENTLEMAN, OBJ_EVENT_GFX_GIRL_3, OBJ_EVENT_GFX_HIKER, OBJ_EVENT_GFX_KIRLIA, OBJ_EVENT_GFX_LASS, OBJ_EVENT_GFX_LINK_RECEPTIONIST, OBJ_EVENT_GFX_LITTLE_BOY, OBJ_EVENT_GFX_LITTLE_GIRL, OBJ_EVENT_GFX_MANIAC, OBJ_EVENT_GFX_MAN_1, OBJ_EVENT_GFX_MAN_3, OBJ_EVENT_GFX_MAN_5, OBJ_EVENT_GFX_NINJA_BOY, OBJ_EVENT_GFX_OLD_WOMAN, OBJ_EVENT_GFX_POKEFAN_F, OBJ_EVENT_GFX_RUNNING_TRIATHLETE_F, OBJ_EVENT_GFX_RUNNING_TRIATHLETE_M, OBJ_EVENT_GFX_SCHOOL_KID_M, OBJ_EVENT_GFX_TUBER_F, OBJ_EVENT_GFX_WOMAN_2, OBJ_EVENT_GFX_WOMAN_3 } from '../include/constants/event_objects';
import { FRONTIER_LVL_50, FRONTIER_PARTY_SIZE, MAX_MON_MOVES } from '../include/constants/global';
import { MOVE_BODY_SLAM, MOVE_COUNTER, MOVE_DESTINY_BOND, MOVE_ENCORE, MOVE_EXPLOSION, MOVE_FOCUS_ENERGY, MOVE_GLARE, MOVE_HELPING_HAND, MOVE_HIDDEN_POWER, MOVE_HYPNOSIS, MOVE_ICE_BEAM, MOVE_MEAN_LOOK, MOVE_MIRROR_COAT, MOVE_POISON_FANG, MOVE_POISON_POWDER, MOVE_SAFEGUARD, MOVE_SELF_DESTRUCT, MOVE_SHADOW_PUNCH, MOVE_SHEER_COLD, MOVE_SLUDGE_BOMB, MOVE_SPORE, MOVE_STUN_SPORE, MOVE_SURF, MOVE_TACKLE, MOVE_THUNDER, MOVE_TOXIC, MOVE_WILL_O_WISP } from '../include/constants/moves';
import { AILMENT_NONE } from '../include/constants/party_menu';
import { TYPE_ELECTRIC, TYPE_FIRE, TYPE_GROUND, TYPE_ICE, TYPE_POISON, TYPE_STEEL } from '../include/constants/pokemon';
import { SPECIES_BRELOOM, SPECIES_DUSCLOPS, SPECIES_ELECTRODE, SPECIES_MILOTIC, SPECIES_SEVIPER, SPECIES_WOBBUFFET } from '../include/constants/species';
import { VAR_OBJ_GFX_ID_0, VAR_OBJ_GFX_ID_1, VAR_TEMP_CHALLENGE_STATUS } from '../include/constants/vars';
import { MON_DATA_ABILITY_NUM, MON_DATA_EXP, MON_DATA_HELD_ITEM, MON_DATA_HP, MON_DATA_LEVEL, MON_DATA_MAX_HP, MON_DATA_MOVE1, MON_DATA_PP1, MON_DATA_PP_BONUSES, MON_DATA_SANITY_IS_EGG, MON_DATA_SPECIES, MON_DATA_STATUS } from '../include/pokemon';
import { TASK_NONE } from '../include/task';
import { EC_EMPTY_WORD } from './easy_chat';
import { STATUS1_BURN, STATUS1_FREEZE, STATUS1_PARALYSIS, STATUS1_SLEEP, STATUS1_TOXIC_POISON } from './engine/battle/constants';
import { gExperienceTables } from './data/pokemon/experience_tables';
import { GetMonData } from './engine/battle/party-storage';
import { gBattleOutcome, gTrainerBattleOpponent_A, gTrainerBattleOpponent_B, setBattleOutcome, setTrainerBattleOpponentA, setTrainerBattleOpponentB } from './engine/battle/state';
import { gSpeciesInfo } from './engine/data/game-data';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { VarGet, VarSet } from './event_data';
import { SaveMapView, gMapHeader } from './fieldmap';
import { PALETTES_ALL } from './palette';
import { CalculateMonStats, CalculatePPWithBonus, GetMonAbility, SetMonData, SetMonMoveSlot, gEnemyParty, gPlayerParty } from './pokemon';
import { Random } from './random';
import { TrySavingData } from './save';
import { ScriptContext_Enable } from './script';
import { CreateTask, DestroyTask, gTasks } from './task';
import { resolveDecompConstant } from '../harness/runtime/decomp-constants';
import type { DecompTask } from '../harness/runtime/decomp-runtime';
import type { Pokemon } from './engine/battle/party-storage';

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const EC_WORD_I_AM = 2601; // 1:1 include/constants/easy_chat.h:346 (à consolider dans include/)
const EC_WORD_LOST = 1584; // 1:1 include/constants/easy_chat.h:244 (à consolider dans include/)
const EC_WORD_GIVE_ME = 2058; // 1:1 include/constants/easy_chat.h:271 (à consolider dans include/)
const EC_WORD_A = 4128; // 1:1 include/constants/easy_chat.h:541 (à consolider dans include/)
const EC_WORD_EXCL = 3072; // 1:1 include/constants/easy_chat.h:382 (à consolider dans include/)
const EC_WORD_HIM = 2585; // 1:1 include/constants/easy_chat.h:330 (à consolider dans include/)
const EC_WORD_ALSO = 3625; // 1:1 include/constants/easy_chat.h:488 (à consolider dans include/)
const EC_WORD_YOU_RE = 2566; // 1:1 include/constants/easy_chat.h:311 (à consolider dans include/)
const EC_WORD_QUES = 3075; // 1:1 include/constants/easy_chat.h:385 (à consolider dans include/)
const EC_WORD_THAT = 7700; // 1:1 include/constants/easy_chat.h:972 (à consolider dans include/)
const EC_WORD_MAKE = 5662; // 1:1 include/constants/easy_chat.h:752 (à consolider dans include/)
const EC_WORD_NOW = 7194; // 1:1 include/constants/easy_chat.h:931 (à consolider dans include/)
const EC_WORD_IT_S = 2609; // 1:1 include/constants/easy_chat.h:354 (à consolider dans include/)
const EC_WORD_RECOMMEND = 3589; // 1:1 include/constants/easy_chat.h:452 (à consolider dans include/)
const EC_WORD_EXCITING = 8207; // 1:1 include/constants/easy_chat.h:1011 (à consolider dans include/)
const EC_WORD_FOR = 4139; // 1:1 include/constants/easy_chat.h:552 (à consolider dans include/)
const EC_WORD_ME = 2580; // 1:1 include/constants/easy_chat.h:325 (à consolider dans include/)
const EC_WORD_WHOM = 4122; // 1:1 include/constants/easy_chat.h:535 (à consolider dans include/)
const EC_WORD_DIDN_T = 4156; // 1:1 include/constants/easy_chat.h:569 (à consolider dans include/)
const EC_WORD_AN = 4129; // 1:1 include/constants/easy_chat.h:542 (à consolider dans include/)
const EC_WORD_MISTAKE = 5182; // 1:1 include/constants/easy_chat.h:713 (à consolider dans include/)
const EC_WORD_REALLY = 3628; // 1:1 include/constants/easy_chat.h:491 (à consolider dans include/)
const EC_WORD_MEAN = 3586; // 1:1 include/constants/easy_chat.h:449 (à consolider dans include/)
const EC_WORD_THERE = 4131; // 1:1 include/constants/easy_chat.h:544 (à consolider dans include/)
const EC_WORD_NEED = 5135; // 1:1 include/constants/easy_chat.h:666 (à consolider dans include/)
const EC_WORD_WONDER = 4100; // 1:1 include/constants/easy_chat.h:513 (à consolider dans include/)
const EC_WORD_NAP = 6696; // 1:1 include/constants/easy_chat.h:889 (à consolider dans include/)
const EC_WORD_ELLIPSIS = 3076; // 1:1 include/constants/easy_chat.h:386 (à consolider dans include/)
const EC_WORD_SOMEONE = 2604; // 1:1 include/constants/easy_chat.h:349 (à consolider dans include/)
const EC_WORD_EVER = 4146; // 1:1 include/constants/easy_chat.h:559 (à consolider dans include/)
const EC_WORD_A_LOT = 3602; // 1:1 include/constants/easy_chat.h:465 (à consolider dans include/)
const EC_WORD_THIS = 7695; // 1:1 include/constants/easy_chat.h:967 (à consolider dans include/)
const EC_WORD_CHALLENGE = 1567; // 1:1 include/constants/easy_chat.h:227 (à consolider dans include/)
const EC_WORD_LOOKS = 5699; // 1:1 include/constants/easy_chat.h:789 (à consolider dans include/)
const EC_WORD_WILL = 4096; // 1:1 include/constants/easy_chat.h:509 (à consolider dans include/)
const EC_WORD_WIN = 1542; // 1:1 include/constants/easy_chat.h:202 (à consolider dans include/)
const EC_WORD_READY = 3621; // 1:1 include/constants/easy_chat.h:484 (à consolider dans include/)
const EC_WORD_EVEN_SO = 3615; // 1:1 include/constants/easy_chat.h:478 (à consolider dans include/)
const EC_WORD_GIVE_UP = 1581; // 1:1 include/constants/easy_chat.h:241 (à consolider dans include/)
const EC_WORD_MY = 2600; // 1:1 include/constants/easy_chat.h:345 (à consolider dans include/)
const EC_WORD_SMALL = 5160; // 1:1 include/constants/easy_chat.h:691 (à consolider dans include/)
const EC_WORD_OH = 3101; // 1:1 include/constants/easy_chat.h:411 (à consolider dans include/)
const EC_WORD_WHO = 2603; // 1:1 include/constants/easy_chat.h:348 (à consolider dans include/)
const EC_WORD_DOES = 4121; // 1:1 include/constants/easy_chat.h:534 (à consolider dans include/)
const EC_WORD_SINCE = 4147; // 1:1 include/constants/easy_chat.h:560 (à consolider dans include/)
const EC_WORD_MOOD = 3634; // 1:1 include/constants/easy_chat.h:497 (à consolider dans include/)
const EC_WORD_DAYS = 7177; // 1:1 include/constants/easy_chat.h:914 (à consolider dans include/)
const EC_WORD_I = 2561; // 1:1 include/constants/easy_chat.h:306 (à consolider dans include/)
const EC_WORD_THINKS = 5670; // 1:1 include/constants/easy_chat.h:760 (à consolider dans include/)
const EC_WORD_COULD = 4104; // 1:1 include/constants/easy_chat.h:517 (à consolider dans include/)
const EC_WORD_WITH = 4144; // 1:1 include/constants/easy_chat.h:557 (à consolider dans include/)
const EC_WORD_FEELING = 3593; // 1:1 include/constants/easy_chat.h:456 (à consolider dans include/)
const EC_WORD_ON = 4140; // 1:1 include/constants/easy_chat.h:553 (à consolider dans include/)
const EC_WORD_LISTEN = 3584; // 1:1 include/constants/easy_chat.h:447 (à consolider dans include/)
const EC_WORD_OF = 4148; // 1:1 include/constants/easy_chat.h:561 (à consolider dans include/)
const EC_WORD_COOL = 1045; // 1:1 include/constants/easy_chat.h:106 (à consolider dans include/)
const EC_WORD_FIGHT = 1577; // 1:1 include/constants/easy_chat.h:237 (à consolider dans include/)
const EC_WORD_TODAY = 7181; // 1:1 include/constants/easy_chat.h:918 (à consolider dans include/)
const EC_WORD_WEAK = 1593; // 1:1 include/constants/easy_chat.h:253 (à consolider dans include/)
const EC_WORD_THE = 3597; // 1:1 include/constants/easy_chat.h:460 (à consolider dans include/)
const EC_WORD_TIME = 7187; // 1:1 include/constants/easy_chat.h:924 (à consolider dans include/)
const EC_WORD_IS = 4107; // 1:1 include/constants/easy_chat.h:520 (à consolider dans include/)
const EC_WORD_GREAT = 4672; // 1:1 include/constants/easy_chat.h:644 (à consolider dans include/)
const EC_WORD_EXCL_EXCL = 3073; // 1:1 include/constants/easy_chat.h:383 (à consolider dans include/)
const EC_WORD_NOT = 4130; // 1:1 include/constants/easy_chat.h:543 (à consolider dans include/)
const EC_WORD_LAY = 3588; // 1:1 include/constants/easy_chat.h:451 (à consolider dans include/)
const EC_WORD_OTHER = 4110; // 1:1 include/constants/easy_chat.h:523 (à consolider dans include/)
const EC_WORD_TRAINER = 523; // 1:1 include/constants/easy_chat.h:67 (à consolider dans include/)
const EC_WORD_LEFT = 7720; // 1:1 include/constants/easy_chat.h:992 (à consolider dans include/)
const EC_WORD_SOON = 7190; // 1:1 include/constants/easy_chat.h:927 (à consolider dans include/)
const EC_WORD_END = 7178; // 1:1 include/constants/easy_chat.h:915 (à consolider dans include/)
const EC_WORD_EASY = 1592; // 1:1 include/constants/easy_chat.h:252 (à consolider dans include/)
const EC_WORD_APOLOGIZE = 2060; // 1:1 include/constants/easy_chat.h:273 (à consolider dans include/)
const EC_WORD_DAUGHTER = 2588; // 1:1 include/constants/easy_chat.h:333 (à consolider dans include/)
const EC_WORD_SURRENDER = 1555; // 1:1 include/constants/easy_chat.h:215 (à consolider dans include/)
const EC_WORD_REFUSE = 5666; // 1:1 include/constants/easy_chat.h:756 (à consolider dans include/)
const EC_WORD_TOO_WEAK = 1594; // 1:1 include/constants/easy_chat.h:254 (à consolider dans include/)
const EC_WORD_ISN_T = 4115; // 1:1 include/constants/easy_chat.h:528 (à consolider dans include/)
const EC_WORD_PLUS = 1107; // 1:1 include/constants/easy_chat.h:168 (à consolider dans include/)
const EC_WORD_WHO_WAS = 2605; // 1:1 include/constants/easy_chat.h:350 (à consolider dans include/)
const EC_WORD_WHEN_I_WIN = 1545; // 1:1 include/constants/easy_chat.h:205 (à consolider dans include/)
const EC_WORD_FOREVER = 7176; // 1:1 include/constants/easy_chat.h:913 (à consolider dans include/)
const EC_WORD_MISS = 3598; // 1:1 include/constants/easy_chat.h:461 (à consolider dans include/)
const EC_WORD_CASE = 3596; // 1:1 include/constants/easy_chat.h:459 (à consolider dans include/)
const EC_WORD_POKEMON = 526; // 1:1 include/constants/easy_chat.h:70 (à consolider dans include/)
const EC_WORD_STEEL = 1094; // 1:1 include/constants/easy_chat.h:155 (à consolider dans include/)
const EC_WORD_AWESOME = 8215; // 1:1 include/constants/easy_chat.h:1019 (à consolider dans include/)
const EC_WORD_BEST = 5180; // 1:1 include/constants/easy_chat.h:711 (à consolider dans include/)
const EC_WORD_HARD = 4655; // 1:1 include/constants/easy_chat.h:627 (à consolider dans include/)
const EC_WORD_BUT = 3594; // 1:1 include/constants/easy_chat.h:457 (à consolider dans include/)
const EC_WORD_ENTERTAINING = 5144; // 1:1 include/constants/easy_chat.h:675 (à consolider dans include/)
const EC_WORD_AND = 3605; // 1:1 include/constants/easy_chat.h:468 (à consolider dans include/)
const EC_WORD_RATHER = 3635; // 1:1 include/constants/easy_chat.h:498 (à consolider dans include/)
const EC_WORD_CONFUSED = 7718; // 1:1 include/constants/easy_chat.h:990 (à consolider dans include/)
const EC_WORD_GOOD_BYE = 2064; // 1:1 include/constants/easy_chat.h:277 (à consolider dans include/)
const EC_WORD_HOME = 6145; // 1:1 include/constants/easy_chat.h:803 (à consolider dans include/)
const EC_WORD_NO_MATCH = 1548; // 1:1 include/constants/easy_chat.h:208 (à consolider dans include/)
const EC_WORD_FIGHTING = 1040; // 1:1 include/constants/easy_chat.h:101 (à consolider dans include/)
const EC_WORD_PROBABLY = 3608; // 1:1 include/constants/easy_chat.h:471 (à consolider dans include/)
const EC_WORD_UP = 7707; // 1:1 include/constants/easy_chat.h:979 (à consolider dans include/)
const EC_WORD_RIGHT = 7721; // 1:1 include/constants/easy_chat.h:993 (à consolider dans include/)
const EC_WORD_NO = 2077; // 1:1 include/constants/easy_chat.h:290 (à consolider dans include/)
const EC_WORD_JUST = 3614; // 1:1 include/constants/easy_chat.h:477 (à consolider dans include/)
const EC_WORD_WHO_IS = 2608; // 1:1 include/constants/easy_chat.h:353 (à consolider dans include/)
const EC_WORD_ARE = 4111; // 1:1 include/constants/easy_chat.h:524 (à consolider dans include/)
const EC_WORD_VERY = 3610; // 1:1 include/constants/easy_chat.h:473 (à consolider dans include/)
const EC_WORD_NEVER = 4638; // 1:1 include/constants/easy_chat.h:610 (à consolider dans include/)
const EC_WORD_VERSUS = 1564; // 1:1 include/constants/easy_chat.h:224 (à consolider dans include/)
const EC_WORD_POISON = 1084; // 1:1 include/constants/easy_chat.h:145 (à consolider dans include/)
const EC_WORD_LALALA = 3129; // 1:1 include/constants/easy_chat.h:439 (à consolider dans include/)
const EC_WORD_THIN = 8211; // 1:1 include/constants/easy_chat.h:1015 (à consolider dans include/)
const EC_WORD_AWFUL = 5174; // 1:1 include/constants/easy_chat.h:705 (à consolider dans include/)
const PIKE_HINT_PEOPLE = 3; // 1:1 include/constants/battle_pike.h:24 (à consolider dans include/)
const PIKE_HINT_WHISPERING = 1; // 1:1 include/constants/battle_pike.h:22 (à consolider dans include/)
const PIKE_HINT_NOSTALGIA = 0; // 1:1 include/constants/battle_pike.h:21 (à consolider dans include/)
const PIKE_HINT_POKEMON = 2; // 1:1 include/constants/battle_pike.h:23 (à consolider dans include/)
const PIKE_HINT_BRAIN = 4; // 1:1 include/constants/battle_pike.h:25 (à consolider dans include/)
const STREAK_PIKE_50 = 1024; // 1:1 include/constants/frontier_util.h:58 (à consolider dans include/)
const STREAK_PIKE_OPEN = 2048; // 1:1 include/constants/frontier_util.h:59 (à consolider dans include/)
const PIKE_ROOM_SINGLE_BATTLE = 0; // 1:1 include/constants/battle_pike.h:6 (à consolider dans include/)
const PIKE_ROOM_HEAL_FULL = 1; // 1:1 include/constants/battle_pike.h:7 (à consolider dans include/)
const PIKE_ROOM_NPC = 2; // 1:1 include/constants/battle_pike.h:8 (à consolider dans include/)
const PIKE_ROOM_STATUS = 3; // 1:1 include/constants/battle_pike.h:9 (à consolider dans include/)
const PIKE_STATUSMON_DUSCLOPS = 1; // 1:1 include/constants/battle_pike.h:29 (à consolider dans include/)
const PIKE_ROOM_HEAL_PART = 4; // 1:1 include/constants/battle_pike.h:10 (à consolider dans include/)
const PIKE_ROOM_WILD_MONS = 5; // 1:1 include/constants/battle_pike.h:11 (à consolider dans include/)
const PIKE_ROOM_HARD_BATTLE = 6; // 1:1 include/constants/battle_pike.h:12 (à consolider dans include/)
const PIKE_ROOM_DOUBLE_BATTLE = 7; // 1:1 include/constants/battle_pike.h:13 (à consolider dans include/)
const PIKE_ROOM_BRAIN = 8; // 1:1 include/constants/battle_pike.h:14 (à consolider dans include/)
const PIKE_DATA_PRIZE = 0; // 1:1 include/constants/battle_pike.h:68 (à consolider dans include/)
const PIKE_DATA_WIN_STREAK = 1; // 1:1 include/constants/battle_pike.h:69 (à consolider dans include/)
const PIKE_DATA_RECORD_STREAK = 2; // 1:1 include/constants/battle_pike.h:70 (à consolider dans include/)
const PIKE_DATA_TOTAL_STREAKS = 3; // 1:1 include/constants/battle_pike.h:71 (à consolider dans include/)
const PIKE_DATA_WIN_STREAK_ACTIVE = 4; // 1:1 include/constants/battle_pike.h:72 (à consolider dans include/)
const NUM_PIKE_ROOMS = 14; // 1:1 include/constants/battle_pike.h:4 (à consolider dans include/)
const SAVE_LINK = 1; // 1:1 include/save.h:0 (à consolider dans include/)
const PIKE_STATUS_FREEZE = 0; // 1:1 include/constants/battle_pike.h:31 (à consolider dans include/)
const PIKE_STATUS_BURN = 1; // 1:1 include/constants/battle_pike.h:32 (à consolider dans include/)
const PIKE_STATUS_TOXIC = 2; // 1:1 include/constants/battle_pike.h:33 (à consolider dans include/)
const PIKE_STATUS_PARALYSIS = 3; // 1:1 include/constants/battle_pike.h:34 (à consolider dans include/)
const PIKE_STATUS_SLEEP = 4; // 1:1 include/constants/battle_pike.h:35 (à consolider dans include/)
const PIKE_STATUSMON_KIRLIA = 0; // 1:1 include/constants/battle_pike.h:28 (à consolider dans include/)
const NUM_PIKE_ROOM_TYPES = 9; // 1:1 include/constants/battle_pike.h:15 (à consolider dans include/)
const FRONTIER_TRAINERS_COUNT = 300; // 1:1 include/constants/battle_frontier_trainers.h:305 (à consolider dans include/)
const FRONTIER_BRAIN_NOT_READY = 0; // 1:1 include/constants/frontier_util.h:9 (à consolider dans include/)
const FRONTIER_BRAIN_STREAK = 3; // 1:1 include/constants/frontier_util.h:12 (à consolider dans include/)
const FRONTIER_BRAIN_STREAK_LONG = 4; // 1:1 include/constants/frontier_util.h:13 (à consolider dans include/)

// ─── Adaptations de représentation (port) ─────────────────────────────────────
// Le port type `gMapHeader.mapLayoutId` en STRING (fieldmap.ts:288) → les constantes
// LAYOUT_* sont des littéraux string (précédent overworld.ts:1427, battle_factory.ts:64).
const LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_THREE_PATH_ROOM = 'LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_THREE_PATH_ROOM'; // 1:1 constants/layouts.h
const LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_ROOM_NORMAL = 'LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_ROOM_NORMAL'; // 1:1 constants/layouts.h
const LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_ROOM_WILD_MONS = 'LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_ROOM_WILD_MONS'; // 1:1 constants/layouts.h
const LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_ROOM_UNUSED = 'LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_ROOM_UNUSED'; // 1:1 constants/layouts.h

// ─── Macros Easy Chat MOVE (constants/easy_chat.h) — pures → transcrites ───────
// EC_MOVE/EC_MOVE2 = mot Easy Chat encodant un MOVE_* (groupes 18/19). easy_chat.ts garde
// EC_WORD/EC_GROUP_MOVE_* en portée module (non exportés, easy_chat.ts:343-368) → constantes
// ré-inlinées 1:1 (précédent : « constantes décomp inlinées » ci-dessus).
const EC_MASK_BITS = 9; // 1:1 include/constants/easy_chat.h:47
const EC_GROUP_MOVE_1 = 18; // 1:1 include/constants/easy_chat.h:49
const EC_GROUP_MOVE_2 = 19; // 1:1 include/constants/easy_chat.h:50
/** 1:1 macro `EC_MOVE(move)` (constants/easy_chat.h) = EC_WORD(EC_GROUP_MOVE_1, MOVE_##move). */
function EC_MOVE(move: number): number { return (EC_GROUP_MOVE_1 << EC_MASK_BITS) | move; }
/** 1:1 macro `EC_MOVE2(move)` (constants/easy_chat.h) = EC_WORD(EC_GROUP_MOVE_2, MOVE_##move). */
function EC_MOVE2(move: number): number { return (EC_GROUP_MOVE_2 << EC_MASK_BITS) | move; }

// ─── Socle Battle Frontier NON PORTÉ ──────────────────────────────────────────
// Fichier INERTE (importé nulle part). Les symboles du socle Frontier (battle_tower.c,
// frontier_util.c) et GetAilmentFromStatus (party_menu.c) ne sont pas encore portés →
// références locales qui LÈVENT à tout accès/appel (Règle 3 : pas de stub muet ; le câblage
// futur du Frontier / party_menu forcera la réconciliation).
function socleFrontierRef(name: string): any {
  return new Proxy({}, {
    get: () => { throw new Error(`non porté : ${name} (socle battle_tower/frontier_util)`); },
    set: () => { throw new Error(`non porté : ${name} (socle battle_tower/frontier_util)`); },
  });
}
/** 1:1 pointeur de façade `gFacilityTrainers` (battle_tower.c). */
let gFacilityTrainers: any = socleFrontierRef('gFacilityTrainers');
/** 1:1 table source `gBattleFrontierTrainers[]` (data + battle_tower.c). */
const gBattleFrontierTrainers: any = socleFrontierRef('gBattleFrontierTrainers');
/** NON PORTÉ — 1:1 `void SetBattleFacilityTrainerGfxId(u16 trainerId, u8 arrayId)` (battle_tower.c). */
function SetBattleFacilityTrainerGfxId(_trainerId: number, _arrayId: number): void {
  throw new Error('non porté : SetBattleFacilityTrainerGfxId (socle battle_tower)');
}
/** NON PORTÉ — 1:1 `u16 GetRandomScaledFrontierTrainerId(u8 challengeNum, u8 battleNum)` (battle_tower.c). */
function GetRandomScaledFrontierTrainerId(_challengeNum: number, _battleNum: number): number {
  throw new Error('non porté : GetRandomScaledFrontierTrainerId (socle battle_tower)');
}
/** NON PORTÉ — 1:1 `void SetFrontierBrainObjEventGfx(u8 facility)` (frontier_util.c). */
function SetFrontierBrainObjEventGfx(_facility: number): void {
  throw new Error('non porté : SetFrontierBrainObjEventGfx (socle frontier_util)');
}
/** NON PORTÉ — 1:1 `void FrontierSpeechToString(const u16 *words)` (battle_tower.c). */
function FrontierSpeechToString(_words: any): void {
  throw new Error('non porté : FrontierSpeechToString (socle battle_tower)');
}
/** NON PORTÉ — 1:1 `u8 GetPlayerSymbolCountForFacility(u8 facility)` (frontier_util.c). */
function GetPlayerSymbolCountForFacility(_facility: number): number {
  throw new Error('non porté : GetPlayerSymbolCountForFacility (socle frontier_util)');
}
/** NON PORTÉ — 1:1 `s32 GetHighestLevelInPlayerParty(void)` (battle_tower.c). */
function GetHighestLevelInPlayerParty(): number {
  throw new Error('non porté : GetHighestLevelInPlayerParty (socle battle_tower)');
}
/** NON PORTÉ — 1:1 `u8 GetAilmentFromStatus(u32 status)` (party_menu.c). */
function GetAilmentFromStatus(_status: number): number {
  throw new Error('non porté : GetAilmentFromStatus (party_menu.c)');
}

/** 1:1 `struct PikeRoomNPC` (battle_pike.c:27). */
interface PikeRoomNPC {
  graphicsId: number;
  speechId1: number;
  speechId2: number;
  speechId3: number;
}

/** 1:1 `struct PikeWildMon` (battle_pike.c:35). */
interface PikeWildMon {
  species: number;
  levelDelta: number;
  moves: Uint16Array;
}

// IWRAM bss

/** 1:1 (battle_pike.c:43) */
let sRoomType = 0;

/** 1:1 (battle_pike.c:44) */
let sStatusMon = 0;

/** 1:1 (battle_pike.c:45) */
let sInWildMonRoom = false;

/** 1:1 (battle_pike.c:46) */
let sStatusFlags = 0;

/** 1:1 (battle_pike.c:47) */
let sNpcId = 0;

// This file's functions.

// Const rom data.

/** 1:1 (battle_pike.c:93) */
const sLvl50_Mons1 = [
  {
    species: SPECIES_SEVIPER,
    levelDelta: 4,
    moves: [
      MOVE_TOXIC,
      MOVE_GLARE,
      MOVE_BODY_SLAM,
      MOVE_SLUDGE_BOMB,
    ],
  },
  {
    species: SPECIES_MILOTIC,
    levelDelta: 4,
    moves: [
      MOVE_TOXIC,
      MOVE_HYPNOSIS,
      MOVE_BODY_SLAM,
      MOVE_SURF,
    ],
  },
  {
    species: SPECIES_DUSCLOPS,
    levelDelta: 5,
    moves: [
      MOVE_WILL_O_WISP,
      MOVE_MEAN_LOOK,
      MOVE_TOXIC,
      MOVE_SHADOW_PUNCH,
    ],
  },
];

/** 1:1 (battle_pike.c:112) */
const sLvl50_Mons2 = [
  {
    species: SPECIES_SEVIPER,
    levelDelta: 4,
    moves: [
      MOVE_TOXIC,
      MOVE_GLARE,
      MOVE_BODY_SLAM,
      MOVE_SLUDGE_BOMB,
    ],
  },
  {
    species: SPECIES_MILOTIC,
    levelDelta: 4,
    moves: [
      MOVE_TOXIC,
      MOVE_HYPNOSIS,
      MOVE_BODY_SLAM,
      MOVE_SURF,
    ],
  },
  {
    species: SPECIES_ELECTRODE,
    levelDelta: 5,
    moves: [
      MOVE_EXPLOSION,
      MOVE_SELF_DESTRUCT,
      MOVE_THUNDER,
      MOVE_TOXIC,
    ],
  },
];

/** 1:1 (battle_pike.c:131) */
const sLvl50_Mons3 = [
  {
    species: SPECIES_SEVIPER,
    levelDelta: 4,
    moves: [
      MOVE_TOXIC,
      MOVE_GLARE,
      MOVE_BODY_SLAM,
      MOVE_SLUDGE_BOMB,
    ],
  },
  {
    species: SPECIES_MILOTIC,
    levelDelta: 4,
    moves: [
      MOVE_TOXIC,
      MOVE_HYPNOSIS,
      MOVE_BODY_SLAM,
      MOVE_SURF,
    ],
  },
  {
    species: SPECIES_BRELOOM,
    levelDelta: 5,
    moves: [
      MOVE_SPORE,
      MOVE_STUN_SPORE,
      MOVE_POISON_POWDER,
      MOVE_HIDDEN_POWER,
    ],
  },
];

/** 1:1 (battle_pike.c:150) */
const sLvl50_Mons4 = [
  {
    species: SPECIES_SEVIPER,
    levelDelta: 4,
    moves: [
      MOVE_TOXIC,
      MOVE_GLARE,
      MOVE_BODY_SLAM,
      MOVE_SLUDGE_BOMB,
    ],
  },
  {
    species: SPECIES_MILOTIC,
    levelDelta: 4,
    moves: [
      MOVE_TOXIC,
      MOVE_HYPNOSIS,
      MOVE_BODY_SLAM,
      MOVE_SURF,
    ],
  },
  {
    species: SPECIES_WOBBUFFET,
    levelDelta: 5,
    moves: [
      MOVE_COUNTER,
      MOVE_MIRROR_COAT,
      MOVE_SAFEGUARD,
      MOVE_DESTINY_BOND,
    ],
  },
];

/** 1:1 (battle_pike.c:169) */
const sLvl50Mons = [
  sLvl50_Mons1,
  sLvl50_Mons2,
  sLvl50_Mons3,
  sLvl50_Mons4,
];

/** 1:1 (battle_pike.c:177) */
const sLvlOpen_Mons1 = [
  {
    species: SPECIES_SEVIPER,
    levelDelta: 4,
    moves: [
      MOVE_TOXIC,
      MOVE_GLARE,
      MOVE_POISON_FANG,
      MOVE_SLUDGE_BOMB,
    ],
  },
  {
    species: SPECIES_MILOTIC,
    levelDelta: 4,
    moves: [
      MOVE_TOXIC,
      MOVE_HYPNOSIS,
      MOVE_BODY_SLAM,
      MOVE_ICE_BEAM,
    ],
  },
  {
    species: SPECIES_DUSCLOPS,
    levelDelta: 5,
    moves: [
      MOVE_WILL_O_WISP,
      MOVE_MEAN_LOOK,
      MOVE_TOXIC,
      MOVE_ICE_BEAM,
    ],
  },
];

/** 1:1 (battle_pike.c:196) */
const sLvlOpen_Mons2 = [
  {
    species: SPECIES_SEVIPER,
    levelDelta: 4,
    moves: [
      MOVE_TOXIC,
      MOVE_GLARE,
      MOVE_POISON_FANG,
      MOVE_SLUDGE_BOMB,
    ],
  },
  {
    species: SPECIES_MILOTIC,
    levelDelta: 4,
    moves: [
      MOVE_TOXIC,
      MOVE_HYPNOSIS,
      MOVE_BODY_SLAM,
      MOVE_ICE_BEAM,
    ],
  },
  {
    species: SPECIES_ELECTRODE,
    levelDelta: 5,
    moves: [
      MOVE_EXPLOSION,
      MOVE_SELF_DESTRUCT,
      MOVE_THUNDER,
      MOVE_TOXIC,
    ],
  },
];

/** 1:1 (battle_pike.c:215) */
const sLvlOpen_Mons3 = [
  {
    species: SPECIES_SEVIPER,
    levelDelta: 4,
    moves: [
      MOVE_TOXIC,
      MOVE_GLARE,
      MOVE_POISON_FANG,
      MOVE_SLUDGE_BOMB,
    ],
  },
  {
    species: SPECIES_MILOTIC,
    levelDelta: 4,
    moves: [
      MOVE_TOXIC,
      MOVE_HYPNOSIS,
      MOVE_BODY_SLAM,
      MOVE_ICE_BEAM,
    ],
  },
  {
    species: SPECIES_BRELOOM,
    levelDelta: 5,
    moves: [
      MOVE_SPORE,
      MOVE_STUN_SPORE,
      MOVE_POISON_POWDER,
      MOVE_HIDDEN_POWER,
    ],
  },
];

/** 1:1 (battle_pike.c:234) */
const sLvlOpen_Mons4 = [
  {
    species: SPECIES_SEVIPER,
    levelDelta: 4,
    moves: [
      MOVE_TOXIC,
      MOVE_GLARE,
      MOVE_POISON_FANG,
      MOVE_SLUDGE_BOMB,
    ],
  },
  {
    species: SPECIES_MILOTIC,
    levelDelta: 4,
    moves: [
      MOVE_TOXIC,
      MOVE_HYPNOSIS,
      MOVE_BODY_SLAM,
      MOVE_ICE_BEAM,
    ],
  },
  {
    species: SPECIES_WOBBUFFET,
    levelDelta: 5,
    moves: [
      MOVE_COUNTER,
      MOVE_MIRROR_COAT,
      MOVE_SAFEGUARD,
      MOVE_ENCORE,
    ],
  },
];

/** 1:1 (battle_pike.c:253) */
const sLvlOpenMons = [
  sLvlOpen_Mons1,
  sLvlOpen_Mons2,
  sLvlOpen_Mons3,
  sLvlOpen_Mons4,
];

/** 1:1 (battle_pike.c:261) */
const sWildMons = [
  sLvl50Mons, // [FRONTIER_LVL_50]
  sLvlOpenMons, // [FRONTIER_LVL_OPEN]
];

/** 1:1 (battle_pike.c:267) */
const sNPCTable = [
  {
    graphicsId: OBJ_EVENT_GFX_POKEFAN_F,
    speechId1: 3,
    speechId2: 5,
    speechId3: 6,
  },
  {
    graphicsId: OBJ_EVENT_GFX_NINJA_BOY,
    speechId1: 13,
    speechId2: 32,
    speechId3: 37,
  },
  {
    graphicsId: OBJ_EVENT_GFX_FAT_MAN,
    speechId1: 8,
    speechId2: 11,
    speechId3: 12,
  },
  {
    graphicsId: OBJ_EVENT_GFX_BUG_CATCHER,
    speechId1: 34,
    speechId2: 30,
    speechId3: 33,
  },
  {
    graphicsId: OBJ_EVENT_GFX_EXPERT_M,
    speechId1: 0,
    speechId2: 0,
    speechId3: 0,
  },
  {
    graphicsId: OBJ_EVENT_GFX_OLD_WOMAN,
    speechId1: 1,
    speechId2: 1,
    speechId3: 1,
  },
  {
    graphicsId: OBJ_EVENT_GFX_BLACK_BELT,
    speechId1: 22,
    speechId2: 23,
    speechId3: 27,
  },
  {
    graphicsId: OBJ_EVENT_GFX_HIKER,
    speechId1: 8,
    speechId2: 22,
    speechId3: 31,
  },
  {
    graphicsId: OBJ_EVENT_GFX_GIRL_3,
    speechId1: 13,
    speechId2: 39,
    speechId3: 21,
  },
  {
    graphicsId: OBJ_EVENT_GFX_WOMAN_2,
    speechId1: 2,
    speechId2: 4,
    speechId3: 17,
  },
  {
    graphicsId: OBJ_EVENT_GFX_CYCLING_TRIATHLETE_M,
    speechId1: 30,
    speechId2: 20,
    speechId3: 36,
  },
  {
    graphicsId: OBJ_EVENT_GFX_MAN_5,
    speechId1: 28,
    speechId2: 34,
    speechId3: 25,
  },
  {
    graphicsId: OBJ_EVENT_GFX_SCHOOL_KID_M,
    speechId1: 23,
    speechId2: 38,
    speechId3: 26,
  },
  {
    graphicsId: OBJ_EVENT_GFX_FISHERMAN,
    speechId1: 23,
    speechId2: 30,
    speechId3: 11,
  },
  {
    graphicsId: OBJ_EVENT_GFX_LASS,
    speechId1: 15,
    speechId2: 19,
    speechId3: 14,
  },
  {
    graphicsId: OBJ_EVENT_GFX_MANIAC,
    speechId1: 2,
    speechId2: 29,
    speechId3: 26,
  },
  {
    graphicsId: OBJ_EVENT_GFX_RUNNING_TRIATHLETE_M,
    speechId1: 37,
    speechId2: 12,
    speechId3: 32,
  },
  {
    graphicsId: OBJ_EVENT_GFX_MAN_3,
    speechId1: 24,
    speechId2: 23,
    speechId3: 38,
  },
  {
    graphicsId: OBJ_EVENT_GFX_WOMAN_3,
    speechId1: 5,
    speechId2: 22,
    speechId3: 4,
  },
  {
    graphicsId: OBJ_EVENT_GFX_LITTLE_BOY,
    speechId1: 41,
    speechId2: 37,
    speechId3: 35,
  },
  {
    graphicsId: OBJ_EVENT_GFX_TUBER_F,
    speechId1: 39,
    speechId2: 14,
    speechId3: 13,
  },
  {
    graphicsId: OBJ_EVENT_GFX_GENTLEMAN,
    speechId1: 10,
    speechId2: 7,
    speechId3: 9,
  },
  {
    graphicsId: OBJ_EVENT_GFX_LITTLE_GIRL,
    speechId1: 40,
    speechId2: 20,
    speechId3: 16,
  },
  {
    graphicsId: OBJ_EVENT_GFX_RUNNING_TRIATHLETE_F,
    speechId1: 18,
    speechId2: 13,
    speechId3: 21,
  },
  {
    graphicsId: OBJ_EVENT_GFX_MAN_1,
    speechId1: 22,
    speechId2: 31,
    speechId3: 27,
  },
];

/** 1:1 (battle_pike.c:421) */
const sNPCSpeeches: number[][] = [
  [
    EC_WORD_I_AM,
    EC_WORD_LOST,
    EC_WORD_GIVE_ME,
    EC_WORD_A,
    EC_MOVE2(MOVE_HELPING_HAND),
    EC_WORD_EXCL,
  ],
  [
    EC_WORD_HIM,
    EC_WORD_ALSO,
    EC_WORD_YOU_RE,
    EC_EMPTY_WORD,
    EC_WORD_LOST,
    EC_WORD_QUES,
  ],
  [
    EC_WORD_THAT,
    EC_WORD_MAKE,
    EC_WORD_NOW,
    EC_WORD_QUES,
    EC_EMPTY_WORD,
    EC_EMPTY_WORD,
  ],
  [
    EC_WORD_IT_S,
    EC_WORD_RECOMMEND,
    EC_WORD_EXCITING,
    EC_WORD_FOR,
    EC_WORD_ME,
    EC_WORD_EXCL,
  ],
  [
    EC_WORD_WHOM,
    EC_WORD_DIDN_T,
    EC_WORD_AN,
    EC_EMPTY_WORD,
    EC_WORD_MISTAKE,
    EC_WORD_QUES,
  ],
  [
    EC_WORD_IT_S,
    EC_WORD_REALLY,
    EC_WORD_RECOMMEND,
    EC_WORD_MEAN,
    EC_WORD_THERE,
    EC_WORD_EXCL,
  ],
  [
    EC_WORD_NEED,
    EC_EMPTY_WORD,
    EC_WORD_WONDER,
    EC_WORD_AN,
    EC_WORD_NAP,
    EC_WORD_ELLIPSIS,
  ],
  [
    EC_WORD_SOMEONE,
    EC_WORD_EVER,
    EC_WORD_A_LOT,
    EC_WORD_THIS,
    EC_WORD_CHALLENGE,
    EC_WORD_EXCL,
  ],
  [
    EC_WORD_LOOKS,
    EC_EMPTY_WORD,
    EC_WORD_WILL,
    EC_EMPTY_WORD,
    EC_WORD_WIN,
    EC_WORD_ELLIPSIS,
  ],
  [
    EC_WORD_READY,
    EC_WORD_EVEN_SO,
    EC_WORD_GIVE_UP,
    EC_WORD_MY,
    EC_WORD_SMALL,
    EC_WORD_QUES,
  ],
  [
    EC_WORD_OH,
    EC_WORD_ELLIPSIS,
    EC_WORD_WHO,
    EC_WORD_ELLIPSIS,
    EC_WORD_DOES,
    EC_WORD_QUES,
  ],
  [
    EC_WORD_I_AM,
    EC_WORD_THERE,
    EC_WORD_SINCE,
    EC_WORD_MOOD,
    EC_WORD_DAYS,
    EC_WORD_ELLIPSIS,
  ],
  [
    EC_WORD_I,
    EC_WORD_THINKS,
    EC_WORD_THAT,
    EC_WORD_WILL,
    EC_WORD_GIVE_UP,
    EC_WORD_EXCL,
  ],
  [
    EC_WORD_THAT,
    EC_EMPTY_WORD,
    EC_WORD_MAKE,
    EC_WORD_QUES,
    EC_EMPTY_WORD,
    EC_EMPTY_WORD,
  ],
  [
    EC_WORD_I,
    EC_WORD_COULD,
    EC_WORD_WIN,
    EC_WORD_WITH,
    EC_WORD_FEELING,
    EC_MOVE(MOVE_SHEER_COLD),
  ],
  [
    EC_WORD_I,
    EC_WORD_ON,
    EC_WORD_LISTEN,
    EC_WORD_OF,
    EC_WORD_COOL,
    EC_WORD_EXCL,
  ],
  [
    EC_WORD_FIGHT,
    EC_WORD_ELLIPSIS,
    EC_WORD_IT_S,
    EC_WORD_REALLY,
    EC_WORD_MEAN,
    EC_WORD_EXCL,
  ],
  [
    EC_WORD_TODAY,
    EC_WORD_ELLIPSIS,
    EC_WORD_I_AM,
    EC_EMPTY_WORD,
    EC_WORD_WEAK,
    EC_WORD_ELLIPSIS,
  ],
  [
    EC_WORD_THE,
    EC_WORD_TIME,
    EC_WORD_IS,
    EC_EMPTY_WORD,
    EC_WORD_GREAT,
    EC_WORD_EXCL_EXCL,
  ],
  [
    EC_WORD_NOT,
    EC_WORD_LAY,
    EC_WORD_A,
    EC_WORD_OTHER,
    EC_WORD_TRAINER,
    EC_WORD_ELLIPSIS,
  ],
  [
    EC_WORD_I,
    EC_WORD_THINKS,
    EC_WORD_THAT,
    EC_WORD_IT_S,
    EC_WORD_EVEN_SO,
    EC_WORD_LEFT,
  ],
  [
    EC_WORD_IT_S,
    EC_EMPTY_WORD,
    EC_WORD_SOON,
    EC_WORD_FEELING,
    EC_WORD_END,
    EC_WORD_QUES,
  ],
  [
    EC_WORD_IT_S,
    EC_WORD_REALLY,
    EC_WORD_RECOMMEND,
    EC_EMPTY_WORD,
    EC_WORD_EASY,
    EC_WORD_EXCL,
  ],
  [
    EC_WORD_APOLOGIZE,
    EC_WORD_I,
    EC_MOVE2(MOVE_TACKLE),
    EC_WORD_DAUGHTER,
    EC_MOVE(MOVE_FOCUS_ENERGY),
    EC_WORD_EXCL,
  ],
  [
    EC_WORD_SURRENDER,
    EC_WORD_QUES,
    EC_WORD_I,
    EC_EMPTY_WORD,
    EC_WORD_REFUSE,
    EC_WORD_EXCL,
  ],
  [
    EC_WORD_I_AM,
    EC_WORD_A_LOT,
    EC_WORD_TOO_WEAK,
    EC_EMPTY_WORD,
    EC_WORD_TODAY,
    EC_WORD_ELLIPSIS,
  ],
  [
    EC_WORD_I,
    EC_WORD_ISN_T,
    EC_WORD_COULD,
    EC_WORD_PLUS,
    EC_WORD_WHO_WAS,
    EC_WORD_WHEN_I_WIN,
  ],
  [
    EC_WORD_A,
    EC_WORD_TRAINER,
    EC_WORD_FOREVER,
    EC_EMPTY_WORD,
    EC_WORD_MISS,
    EC_WORD_OTHER,
  ],
  [
    EC_WORD_CASE,
    EC_WORD_POKEMON,
    EC_WORD_STEEL,
    EC_WORD_ELLIPSIS,
    EC_WORD_IT_S,
    EC_WORD_AWESOME,
  ],
  [
    EC_WORD_THERE,
    EC_WORD_ELLIPSIS,
    EC_WORD_I_AM,
    EC_WORD_THE,
    EC_WORD_BEST,
    EC_WORD_TRAINER,
  ],
  [
    EC_WORD_IT_S,
    EC_WORD_HARD,
    EC_WORD_BUT,
    EC_WORD_IT_S,
    EC_WORD_ENTERTAINING,
    EC_WORD_EXCL_EXCL,
  ],
  [
    EC_WORD_AND,
    EC_EMPTY_WORD,
    EC_WORD_FOREVER,
    EC_WORD_QUES,
    EC_EMPTY_WORD,
    EC_EMPTY_WORD,
  ],
  [
    EC_WORD_I_AM,
    EC_WORD_RATHER,
    EC_WORD_CONFUSED,
    EC_WORD_ELLIPSIS,
    EC_EMPTY_WORD,
    EC_EMPTY_WORD,
  ],
  [
    EC_WORD_GOOD_BYE,
    EC_WORD_ELLIPSIS,
    EC_WORD_WILL,
    EC_WORD_EVEN_SO,
    EC_WORD_FEELING,
    EC_WORD_HOME,
  ],
  [
    EC_WORD_IT_S,
    EC_WORD_REALLY,
    EC_WORD_NO_MATCH,
    EC_EMPTY_WORD,
    EC_WORD_THERE,
    EC_WORD_EXCL,
  ],
  [
    EC_WORD_A,
    EC_WORD_FIGHTING,
    EC_WORD_IT_S,
    EC_WORD_PROBABLY,
    EC_WORD_EXCITING,
    EC_WORD_EXCL,
  ],
  [
    EC_WORD_I_AM,
    EC_WORD_UP,
    EC_WORD_THAT,
    EC_WORD_IT_S,
    EC_WORD_EVEN_SO,
    EC_WORD_RIGHT,
  ],
  [
    EC_WORD_NO,
    EC_WORD_EXCL,
    EC_WORD_IT_S,
    EC_WORD_NOT,
    EC_WORD_JUST,
    EC_WORD_ELLIPSIS,
  ],
  [
    EC_WORD_WHO_IS,
    EC_WORD_POKEMON,
    EC_WORD_ARE,
    EC_WORD_VERY,
    EC_WORD_NEVER,
    EC_WORD_EXCL,
  ],
  [
    EC_WORD_WHO_IS,
    EC_WORD_POKEMON,
    EC_WORD_ARE,
    EC_WORD_VERSUS,
    EC_WORD_THE,
    EC_WORD_POISON,
  ],
  [
    EC_WORD_LALALA,
    EC_WORD_LALALA,
    EC_WORD_I_AM,
    EC_WORD_THIN,
    EC_WORD_LALALA,
    EC_WORD_EXCL,
  ],
  [
    EC_MOVE2(MOVE_TOXIC),
    EC_WORD_IT_S,
    EC_WORD_REALLY,
    EC_EMPTY_WORD,
    EC_WORD_AWFUL,
    EC_WORD_EXCL,
  ],
];

// Table duplicated from frontier_util, only Battle Pike entry used

/** 1:1 (battle_pike.c:468) */
const sFrontierBrainStreakAppearances: number[][] = [
  [
    35,
    70,
    35,
    1,
  ], // [FRONTIER_FACILITY_TOWER]
  [
    4,
    9,
    5,
    0,
  ], // [FRONTIER_FACILITY_DOME]
  [
    21,
    42,
    21,
    1,
  ], // [FRONTIER_FACILITY_PALACE]
  [
    28,
    56,
    28,
    1,
  ], // [FRONTIER_FACILITY_ARENA]
  [
    21,
    42,
    21,
    1,
  ], // [FRONTIER_FACILITY_FACTORY]
  [
    28,
    140,
    56,
    1,
  ], // [FRONTIER_FACILITY_PIKE]
  [
    21,
    70,
    35,
    0,
  ], // [FRONTIER_FACILITY_PYRAMID]
];

/** 1:1 (battle_pike.c:479) */
const sBattlePikeFunctions: Array<(...args: any[]) => any> = [
  SetRoomType, // [BATTLE_PIKE_FUNC_SET_ROOM_TYPE]
  GetBattlePikeData, // [BATTLE_PIKE_FUNC_GET_DATA]
  SetBattlePikeData, // [BATTLE_PIKE_FUNC_SET_DATA]
  IsNextRoomFinal, // [BATTLE_PIKE_FUNC_IS_FINAL_ROOM]
  SetupRoomObjectEvents, // [BATTLE_PIKE_FUNC_SET_ROOM_OBJECTS]
  GetRoomType, // [BATTLE_PIKE_FUNC_GET_ROOM_TYPE]
  SetInWildMonRoom, // [BATTLE_PIKE_FUNC_SET_IN_WILD_MON_ROOM]
  ClearInWildMonRoom, // [BATTLE_PIKE_FUNC_CLEAR_IN_WILD_MON_ROOM]
  SavePikeChallenge, // [BATTLE_PIKE_FUNC_SAVE]
  PikeDummy1, // [BATTLE_PIKE_FUNC_DUMMY_1]
  PikeDummy2, // [BATTLE_PIKE_FUNC_DUMMY_2]
  GetRoomInflictedStatus, // [BATTLE_PIKE_FUNC_GET_ROOM_STATUS]
  GetRoomInflictedStatusMon, // [BATTLE_PIKE_FUNC_GET_ROOM_STATUS_MON]
  HealOneOrTwoMons, // [BATTLE_PIKE_FUNC_HEAL_ONE_TWO_MONS]
  BufferNPCMessage, // [BATTLE_PIKE_FUNC_BUFFER_NPC_MSG]
  StatusInflictionScreenFlash, // [BATTLE_PIKE_FUNC_STATUS_SCREEN_FLASH]
  GetInBattlePike, // [BATTLE_PIKE_FUNC_IS_IN]
  SetHintedRoom, // [BATTLE_PIKE_FUNC_SET_HINT_ROOM]
  GetHintedRoomIndex, // [BATTLE_PIKE_FUNC_GET_HINT_ROOM_ID]
  GetRoomTypeHint, // [BATTLE_PIKE_FUNC_GET_ROOM_TYPE_HINT]
  ClearPikeTrainerIds, // [BATTLE_PIKE_FUNC_CLEAR_TRAINER_IDS]
  BufferTrainerIntro, // [BATTLE_PIKE_FUNC_GET_TRAINER_INTRO]
  GetCurrentRoomPikeQueenFightType, // [BATTLE_PIKE_FUNC_GET_QUEEN_FIGHT_TYPE]
  HealSomeMonsBeforePikeQueen, // [BATTLE_PIKE_FUNC_HEAL_MONS_BEFORE_QUEEN]
  SetHealingroomTypesDisabled, // [BATTLE_PIKE_FUNC_SET_HEAL_ROOMS_DISABLED]
  IsPartyFullHealed, // [BATTLE_PIKE_FUNC_IS_PARTY_FULL_HEALTH]
  SaveMonHeldItems, // [BATTLE_PIKE_FUNC_SAVE_HELD_ITEMS]
  RestoreMonHeldItems, // [BATTLE_PIKE_FUNC_RESET_HELD_ITEMS]
  InitPikeChallenge, // [BATTLE_PIKE_FUNC_INIT]
];

/** 1:1 (battle_pike.c:512) */
const sRoomTypeHints = Uint8Array.from([
  PIKE_HINT_PEOPLE,
  // PIKE_ROOM_SINGLE_BATTLE
  PIKE_HINT_PEOPLE,
  // PIKE_ROOM_HEAL_FULL
  PIKE_HINT_WHISPERING,
  // PIKE_ROOM_NPC
  PIKE_HINT_NOSTALGIA,
  // PIKE_ROOM_STATUS
  PIKE_HINT_NOSTALGIA,
  // PIKE_ROOM_HEAL_PART
  PIKE_HINT_POKEMON,
  // PIKE_ROOM_WILD_MONS
  PIKE_HINT_POKEMON,
  // PIKE_ROOM_HARD_BATTLE
  PIKE_HINT_WHISPERING,
  // PIKE_ROOM_DOUBLE_BATTLE
  PIKE_HINT_BRAIN,
  // PIKE_ROOM_BRAIN
]);

/** 1:1 (battle_pike.c:524) */
const sNumMonsToHealBeforePikeQueen: number[][] = [
  [
    2,
    1,
    0,
  ],
  [
    2,
    0,
    1,
  ],
  [
    1,
    2,
    0,
  ],
  [
    1,
    0,
    2,
  ],
  [
    0,
    2,
    1,
  ],
  [
    0,
    1,
    2,
  ],
];

/** 1:1 (battle_pike.c:534) */
const sStatusInflictionScreenFlashFuncs: Array<(...args: any[]) => any> = [
  StatusInflictionFadeOut,
  StatusInflictionFadeIn,
];

/** 1:1 (battle_pike.c:539) */
const sWinStreakFlags = Uint32Array.from([
  STREAK_PIKE_50,
  STREAK_PIKE_OPEN,
]);

// code

/** 1:1 `void CallBattlePikeFunction(void)` (battle_pike.c:542-545). */
export function CallBattlePikeFunction(): void {
  sBattlePikeFunctions[VarGet(0x8004) /* gSpecialVar_0x8004 */]();
}

/** 1:1 `static void SetRoomType(void)` (battle_pike.c:547-551). */
function SetRoomType(): void {
  let roomType = GetNextRoomType();
  sRoomType = roomType;
}

/** 1:1 `static void SetupRoomObjectEvents(void)` (battle_pike.c:553-616). */
function SetupRoomObjectEvents(): void {
  let setObjGfx1 = false;
  let setObjGfx2 = false;
  let objGfx1 = 0;
  let objGfx2 = 0;
  VarSet(VAR_OBJ_GFX_ID_0, OBJ_EVENT_GFX_LINK_RECEPTIONIST);
  VarSet(VAR_OBJ_GFX_ID_1, OBJ_EVENT_GFX_DUSCLOPS);
  setObjGfx1 = true;
  setObjGfx2 = false;
  objGfx1 = 0;
  objGfx2 = 0;
  switch (sRoomType) {
    case PIKE_ROOM_SINGLE_BATTLE:
      PrepareOneTrainer(false);
      setObjGfx1 = false;
      break;
    case PIKE_ROOM_HEAL_FULL:
      objGfx1 = OBJ_EVENT_GFX_LINK_RECEPTIONIST;
      break;
    case PIKE_ROOM_NPC:
      objGfx1 = ((GetNPCRoomGraphicsId()) & 0xFF);
      break;
    case PIKE_ROOM_STATUS:
      objGfx1 = OBJ_EVENT_GFX_GENTLEMAN;
      if (sStatusMon == PIKE_STATUSMON_DUSCLOPS)
        objGfx2 = OBJ_EVENT_GFX_DUSCLOPS;
      else
        objGfx2 = OBJ_EVENT_GFX_KIRLIA;
      setObjGfx2 = true;
      break;
    case PIKE_ROOM_HEAL_PART:
      objGfx1 = OBJ_EVENT_GFX_GENTLEMAN;
      break;
    case PIKE_ROOM_WILD_MONS:
      setObjGfx1 = false;
      break;
    case PIKE_ROOM_HARD_BATTLE:
      PrepareOneTrainer(true);
      objGfx2 = OBJ_EVENT_GFX_LINK_RECEPTIONIST;
      setObjGfx1 = false;
      setObjGfx2 = true;
      break;
    case PIKE_ROOM_DOUBLE_BATTLE:
      PrepareTwoTrainers();
      setObjGfx1 = false;
      break;
    case PIKE_ROOM_BRAIN:
      SetFrontierBrainObjEventGfx(FRONTIER_FACILITY_PIKE);
      objGfx2 = OBJ_EVENT_GFX_LINK_RECEPTIONIST;
      setObjGfx1 = false;
      setObjGfx2 = true;
      break;
    default:
      return;
  }
  if (setObjGfx1 == true)
    VarSet(VAR_OBJ_GFX_ID_0, objGfx1);
  if (setObjGfx2 == true)
    VarSet(VAR_OBJ_GFX_ID_1, objGfx2);
}

/** 1:1 `static void GetBattlePikeData(void)` (battle_pike.c:618-643). */
function GetBattlePikeData(): void {
  let lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  switch (VarGet(0x8005) /* gSpecialVar_0x8005 */) {
    case PIKE_DATA_PRIZE:
      VarSet(0x800D /* gSpecialVar_Result */, +(gSaveBlock2Ptr.frontier.pikePrize));
      break;
    case PIKE_DATA_WIN_STREAK:
      VarSet(0x800D /* gSpecialVar_Result */, +(gSaveBlock2Ptr.frontier.pikeWinStreaks[gSaveBlock2Ptr.frontier.lvlMode]));
      break;
    case PIKE_DATA_RECORD_STREAK:
      VarSet(0x800D /* gSpecialVar_Result */, +(gSaveBlock2Ptr.frontier.pikeRecordStreaks[gSaveBlock2Ptr.frontier.lvlMode]));
      break;
    case PIKE_DATA_TOTAL_STREAKS:
      VarSet(0x800D /* gSpecialVar_Result */, +(gSaveBlock2Ptr.frontier.pikeTotalStreaks[gSaveBlock2Ptr.frontier.lvlMode]));
      break;
    case PIKE_DATA_WIN_STREAK_ACTIVE:
      if (lvlMode != FRONTIER_LVL_50)
        VarSet(0x800D /* gSpecialVar_Result */, +(gSaveBlock2Ptr.frontier.winStreakActiveFlags & STREAK_PIKE_OPEN));
      else
        VarSet(0x800D /* gSpecialVar_Result */, +(gSaveBlock2Ptr.frontier.winStreakActiveFlags & STREAK_PIKE_50));
      break;
  }
}

/** 1:1 `static void SetBattlePikeData(void)` (battle_pike.c:645-683). */
function SetBattlePikeData(): void {
  let lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  switch (VarGet(0x8005) /* gSpecialVar_0x8005 */) {
    case PIKE_DATA_PRIZE:
      gSaveBlock2Ptr.frontier.pikePrize = VarGet(0x8006) /* gSpecialVar_0x8006 */;
      break;
    case PIKE_DATA_WIN_STREAK:
      if (VarGet(0x8006) /* gSpecialVar_0x8006 */ <= MAX_STREAK)
        gSaveBlock2Ptr.frontier.pikeWinStreaks[gSaveBlock2Ptr.frontier.lvlMode] = VarGet(0x8006) /* gSpecialVar_0x8006 */;
      break;
    case PIKE_DATA_RECORD_STREAK:
      if (VarGet(0x8006) /* gSpecialVar_0x8006 */ <= MAX_STREAK && gSaveBlock2Ptr.frontier.pikeRecordStreaks[gSaveBlock2Ptr.frontier.lvlMode] < VarGet(0x8006) /* gSpecialVar_0x8006 */)
        gSaveBlock2Ptr.frontier.pikeRecordStreaks[gSaveBlock2Ptr.frontier.lvlMode] = VarGet(0x8006) /* gSpecialVar_0x8006 */;
      break;
    case PIKE_DATA_TOTAL_STREAKS:
      if (VarGet(0x8006) /* gSpecialVar_0x8006 */ <= MAX_STREAK)
        gSaveBlock2Ptr.frontier.pikeTotalStreaks[gSaveBlock2Ptr.frontier.lvlMode] = VarGet(0x8006) /* gSpecialVar_0x8006 */;
      break;
    case PIKE_DATA_WIN_STREAK_ACTIVE:
      if (lvlMode != FRONTIER_LVL_50)
      {
        if (VarGet(0x8006) /* gSpecialVar_0x8006 */)
          gSaveBlock2Ptr.frontier.winStreakActiveFlags |= STREAK_PIKE_OPEN;
        else
          gSaveBlock2Ptr.frontier.winStreakActiveFlags &= ~(STREAK_PIKE_OPEN);
      }
      else
      {
        if (VarGet(0x8006) /* gSpecialVar_0x8006 */)
          gSaveBlock2Ptr.frontier.winStreakActiveFlags |= STREAK_PIKE_50;
        else
          gSaveBlock2Ptr.frontier.winStreakActiveFlags &= ~(STREAK_PIKE_50);
      }
      break;
  }
}

/** 1:1 `static void IsNextRoomFinal(void)` (battle_pike.c:685-691). */
function IsNextRoomFinal(): void {
  if (gSaveBlock2Ptr.frontier.curChallengeBattleNum > NUM_PIKE_ROOMS)
    VarSet(0x800D /* gSpecialVar_Result */, +(true));
  else
    VarSet(0x800D /* gSpecialVar_Result */, +(false));
}

/** 1:1 `static void GetRoomType(void)` (battle_pike.c:693-696). */
function GetRoomType(): void {
  VarSet(0x800D /* gSpecialVar_Result */, +(sRoomType));
}

/** 1:1 `static void SetInWildMonRoom(void)` (battle_pike.c:698-701). */
function SetInWildMonRoom(): void {
  sInWildMonRoom = true;
}

/** 1:1 `static void ClearInWildMonRoom(void)` (battle_pike.c:703-706). */
function ClearInWildMonRoom(): void {
  sInWildMonRoom = false;
}

/** 1:1 `static void SavePikeChallenge(void)` (battle_pike.c:708-715). */
function SavePikeChallenge(): void {
  gSaveBlock2Ptr.frontier.challengeStatus = VarGet(0x8005) /* gSpecialVar_0x8005 */;
  VarSet(VAR_TEMP_CHALLENGE_STATUS, 0);
  gSaveBlock2Ptr.frontier.challengePaused = true;
  SaveMapView();
  TrySavingData(); // 1:1 TrySavingData(SAVE_LINK) — port save web (signature 0-arg, save.ts:642)
}

/** 1:1 `static void PikeDummy1(void)` (battle_pike.c:717-720). */
function PikeDummy1(): void {
}

/** 1:1 `static void PikeDummy2(void)` (battle_pike.c:722-725). */
function PikeDummy2(): void {
}

/** 1:1 `static void GetRoomInflictedStatus(void)` (battle_pike.c:727-747). */
function GetRoomInflictedStatus(): void {
  switch (sStatusFlags) {
    case STATUS1_FREEZE:
      VarSet(0x800D /* gSpecialVar_Result */, +(PIKE_STATUS_FREEZE));
      break;
    case STATUS1_BURN:
      VarSet(0x800D /* gSpecialVar_Result */, +(PIKE_STATUS_BURN));
      break;
    case STATUS1_TOXIC_POISON:
      VarSet(0x800D /* gSpecialVar_Result */, +(PIKE_STATUS_TOXIC));
      break;
    case STATUS1_PARALYSIS:
      VarSet(0x800D /* gSpecialVar_Result */, +(PIKE_STATUS_PARALYSIS));
      break;
    case STATUS1_SLEEP:
      VarSet(0x800D /* gSpecialVar_Result */, +(PIKE_STATUS_SLEEP));
      break;
  }
}

/** 1:1 `static void GetRoomInflictedStatusMon(void)` (battle_pike.c:749-752). */
function GetRoomInflictedStatusMon(): void {
  VarSet(0x800D /* gSpecialVar_Result */, +(sStatusMon));
}

/** 1:1 `static void HealOneOrTwoMons(void)` (battle_pike.c:754-759). */
function HealOneOrTwoMons(): void {
  let toHeal = (Random() % 2) + 1;
  TryHealMons(toHeal);
  VarSet(0x800D /* gSpecialVar_Result */, +(toHeal));
}

/** 1:1 `static void BufferNPCMessage(void)` (battle_pike.c:761-773). */
function BufferNPCMessage(): void {
  let speechId = 0;
  if (gSaveBlock2Ptr.frontier.curChallengeBattleNum <= 4)
    speechId = sNPCTable[sNpcId].speechId1;
  else if (gSaveBlock2Ptr.frontier.curChallengeBattleNum <= 10)
    speechId = sNPCTable[sNpcId].speechId2;
  else
    speechId = sNPCTable[sNpcId].speechId3;
  FrontierSpeechToString(sNPCSpeeches[speechId]);
}

/** 1:1 `static void StatusInflictionScreenFlash(void)` (battle_pike.c:775-778). */
function StatusInflictionScreenFlash(): void {
  CreateTask((t: { taskId: number }) => Task_DoStatusInflictionScreenFlash(t.taskId), 2);
}

/** 1:1 `static void HealMon(struct Pokemon *mon)` (battle_pike.c:780-808). */
function HealMon(mon: Pokemon): void {
  let i = 0;
  let hp = 0;
  let ppBonuses = 0;
  const data = new Uint8Array(4);
  for (i = 0; i < 4; i++)
    data[i] = 0;
  hp = GetMonData(mon, MON_DATA_MAX_HP) as number;
  data[0] = hp;
  data[1] = hp >> 8;
  // port pokemon.ts:1509 : SetMonData scalaire (modèle plat) — u8[2] LE reconstruit en u16.
  SetMonData(mon, MON_DATA_HP, data[0] | (data[1] << 8));
  ppBonuses = GetMonData(mon, MON_DATA_PP_BONUSES) as number;
  for (i = 0; i < MAX_MON_MOVES; i++)
  {
    let move = GetMonData(mon, MON_DATA_MOVE1 + i) as number;
    data[0] = CalculatePPWithBonus(move, ppBonuses, i);
    SetMonData(mon, MON_DATA_PP1 + i, data[0]);
  }
  data[0] = 0;
  data[1] = 0;
  data[2] = 0;
  data[3] = 0;
  // port : SetMonData scalaire — u8[4] LE reconstruit (ici 0).
  SetMonData(mon, MON_DATA_STATUS, data[0] | (data[1] << 8) | (data[2] << 16) | (data[3] << 24));
}

/** 1:1 `static bool8 DoesAbilityPreventStatus(struct Pokemon *mon, u32 status)` (battle_pike.c:810-839). */
function DoesAbilityPreventStatus(mon: Pokemon, status: number): boolean {
  let ability = GetMonAbility(mon);
  let ret = false;
  switch (status) {
    case STATUS1_FREEZE:
      if (ability == ABILITY_MAGMA_ARMOR)
        ret = true;
      break;
    case STATUS1_BURN:
      if (ability == ABILITY_WATER_VEIL)
        ret = true;
      break;
    case STATUS1_PARALYSIS:
      if (ability == ABILITY_LIMBER)
        ret = true;
      break;
    case STATUS1_SLEEP:
      if (ability == ABILITY_INSOMNIA || ability == ABILITY_VITAL_SPIRIT)
        ret = true;
      break;
    case STATUS1_TOXIC_POISON:
      if (ability == ABILITY_IMMUNITY)
        ret = true;
      break;
  }
  return ret;
}

/** 1:1 `static bool8 DoesTypePreventStatus(u16 species, u32 status)` (battle_pike.c:841-869). */
function DoesTypePreventStatus(species: number, status: number): boolean {
  let ret = false;
  // port : gSpeciesInfo[].types[] = noms de types (string) → resolveDecompConstant → n° (précédent battle_factory.ts:903).
  switch (status) {
    case STATUS1_TOXIC_POISON:
      if (resolveDecompConstant(gSpeciesInfo[species].types[0]) == TYPE_STEEL || resolveDecompConstant(gSpeciesInfo[species].types[0]) == TYPE_POISON || resolveDecompConstant(gSpeciesInfo[species].types[1]) == TYPE_STEEL || resolveDecompConstant(gSpeciesInfo[species].types[1]) == TYPE_POISON)
        ret = true;
      break;
    case STATUS1_FREEZE:
      if (resolveDecompConstant(gSpeciesInfo[species].types[0]) == TYPE_ICE || resolveDecompConstant(gSpeciesInfo[species].types[1]) == TYPE_ICE)
        ret = true;
      break;
    case STATUS1_PARALYSIS:
      if (resolveDecompConstant(gSpeciesInfo[species].types[0]) == TYPE_GROUND || resolveDecompConstant(gSpeciesInfo[species].types[0]) == TYPE_ELECTRIC || resolveDecompConstant(gSpeciesInfo[species].types[1]) == TYPE_GROUND || resolveDecompConstant(gSpeciesInfo[species].types[1]) == TYPE_ELECTRIC)
        ret = true;
      break;
    case STATUS1_BURN:
      if (resolveDecompConstant(gSpeciesInfo[species].types[0]) == TYPE_FIRE || resolveDecompConstant(gSpeciesInfo[species].types[1]) == TYPE_FIRE)
        ret = true;
      break;
    case STATUS1_SLEEP:
      break;
  }
  return ret;
}

/** 1:1 `static bool8 TryInflictRandomStatus(void)` (battle_pike.c:871-980). */
function TryInflictRandomStatus(): boolean {
  let j = 0;
  let i = 0;
  let count = 0;
  const indices = new Uint8Array(FRONTIER_PARTY_SIZE);
  let status = 0;
  let species = 0;
  let statusChosen = false;
  let mon: any = null;
  for (i = 0; i < FRONTIER_PARTY_SIZE; i++)
    indices[i] = i;
  for (j = 0; j < 10; j++)
  {
    let temp = 0;
    let id = 0;
    i = Random() % FRONTIER_PARTY_SIZE;
    id = Random() % FRONTIER_PARTY_SIZE;
    [indices[i], indices[id]] = [indices[id], indices[i]]; // 1:1 SWAP(indices[i], indices[id], temp)
    void temp;
  }
  if (gSaveBlock2Ptr.frontier.curChallengeBattleNum <= 4)
    count = 1;
  else if (gSaveBlock2Ptr.frontier.curChallengeBattleNum <= 9)
    count = 2;
  else
    count = 3;
  status = 0;
  do
  {
    let rand = 0;
    statusChosen = false;
    rand = Random() % 100;
    if (rand < 35)
      sStatusFlags = STATUS1_TOXIC_POISON;
    else if (rand < 60)
      sStatusFlags = STATUS1_FREEZE;
    else if (rand < 80)
      sStatusFlags = STATUS1_PARALYSIS;
    else if (rand < 90)
      sStatusFlags = STATUS1_SLEEP;
    else
      sStatusFlags = STATUS1_BURN;
    if (status != sStatusFlags)
    {
      status = sStatusFlags;
      j = 0;
      for (i = 0; i < FRONTIER_PARTY_SIZE; i++)
      {
        mon = gPlayerParty[indices[i]];
        if (GetAilmentFromStatus(GetMonData(mon, MON_DATA_STATUS) as number) == AILMENT_NONE && GetMonData(mon, MON_DATA_HP) != 0)
        {
          j++;
          species = GetMonData(mon, MON_DATA_SPECIES) as number;
          if (!DoesTypePreventStatus(species, sStatusFlags))
          {
            statusChosen = true;
            break;
          }
        }
        if (j == count)
          break;
      }
      if (j == 0)
        return false;
    }
  }
  while (!statusChosen);
  switch (sStatusFlags) {
    case STATUS1_FREEZE:
      sStatusMon = PIKE_STATUSMON_DUSCLOPS;
      break;
    case STATUS1_BURN:
      if (Random() % 2 != 0)
        sStatusMon = PIKE_STATUSMON_DUSCLOPS;
      else
        sStatusMon = PIKE_STATUSMON_KIRLIA;
      break;
    case STATUS1_PARALYSIS:
    case STATUS1_SLEEP:
    case STATUS1_TOXIC_POISON:
    default:
      sStatusMon = PIKE_STATUSMON_KIRLIA;
      break;
  }
  j = 0;
  for (i = 0; i < FRONTIER_PARTY_SIZE; i++)
  {
    mon = gPlayerParty[indices[i]];
    if (GetAilmentFromStatus(GetMonData(mon, MON_DATA_STATUS) as number) == AILMENT_NONE && GetMonData(mon, MON_DATA_HP) != 0)
    {
      j++;
      species = GetMonData(mon, MON_DATA_SPECIES) as number;
      if (!DoesAbilityPreventStatus(mon, sStatusFlags) && !DoesTypePreventStatus(species, sStatusFlags))
        SetMonData(mon, MON_DATA_STATUS, sStatusFlags);
    }
    if (j == count)
      break;
  }
  return true;
}

/** 1:1 `static bool8 AtLeastOneHealthyMon(void)` (battle_pike.c:982-1012). */
function AtLeastOneHealthyMon(): boolean {
  let i = 0;
  let healthyMonsCount = 0;
  let count = 0;
  if (gSaveBlock2Ptr.frontier.curChallengeBattleNum <= 4)
    count = 1;
  else if (gSaveBlock2Ptr.frontier.curChallengeBattleNum <= 9)
    count = 2;
  else
    count = 3;
  healthyMonsCount = 0;
  for (i = 0; i < FRONTIER_PARTY_SIZE; i++)
  {
    let mon = gPlayerParty[i];
    if (GetAilmentFromStatus(GetMonData(mon, MON_DATA_STATUS) as number) == AILMENT_NONE && GetMonData(mon, MON_DATA_HP) != 0)
    {
      healthyMonsCount++;
    }
    if (healthyMonsCount == count)
      break;
  }
  if (healthyMonsCount == 0)
    return false;
  else
    return true;
}

/** 1:1 `static u8 GetNextRoomType(void)` (battle_pike.c:1014-1092). */
function GetNextRoomType(): number {
  // 1:1 `bool8 roomTypesDisabled[NUM_PIKE_ROOM_TYPES - 1]` — excludes Brain room, which cant be disabled.
  const roomTypesDisabled = new Uint8Array(NUM_PIKE_ROOM_TYPES - 1);
  let i = 0;
  let nextRoomType = 0;
  let roomHint = 0;
  let numRoomCandidates = 0;
  let roomCandidates: any = null;
  let id = 0;
  if (gSaveBlock2Ptr.frontier.pikeHintedRoomType == PIKE_ROOM_BRAIN)
    return gSaveBlock2Ptr.frontier.pikeHintedRoomType;
  // Check if the player walked into the same room that the lady gave a hint about.
  if (VarGet(0x8007) /* gSpecialVar_0x8007 */ == gSaveBlock2Ptr.frontier.pikeHintedRoomIndex)
  {
    if (gSaveBlock2Ptr.frontier.pikeHintedRoomType == PIKE_ROOM_STATUS)
      TryInflictRandomStatus();
    return gSaveBlock2Ptr.frontier.pikeHintedRoomType;
  }
  for (i = 0; i < roomTypesDisabled.length; i++)
    roomTypesDisabled[i] = 0;
  numRoomCandidates = NUM_PIKE_ROOM_TYPES - 1;
  // The other two room types cannot be the same type as the one associated with the lady's hint
  roomHint = sRoomTypeHints[gSaveBlock2Ptr.frontier.pikeHintedRoomType];
  for (i = 0; i < roomTypesDisabled.length; i++)
  {
    if (sRoomTypeHints[i] == roomHint)
    {
      roomTypesDisabled[i] = 1;
      numRoomCandidates--;
    }
  }
  // Remove room type candidates that would have no effect on the player's party.
  if (roomTypesDisabled[PIKE_ROOM_DOUBLE_BATTLE] != 1 && !AtLeastTwoAliveMons())
  {
    roomTypesDisabled[PIKE_ROOM_DOUBLE_BATTLE] = 1;
    numRoomCandidates--;
  }
  if (roomTypesDisabled[PIKE_ROOM_STATUS] != 1 && !AtLeastOneHealthyMon())
  {
    roomTypesDisabled[PIKE_ROOM_STATUS] = 1;
    numRoomCandidates--;
  }
  // Remove healing room type candidates if healing rooms are disabled.
  if (gSaveBlock2Ptr.frontier.pikeHealingRoomsDisabled)
  {
    if (roomTypesDisabled[PIKE_ROOM_HEAL_FULL] != 1)
    {
      roomTypesDisabled[PIKE_ROOM_HEAL_FULL] = 1;
      numRoomCandidates--;
    }
    if (roomTypesDisabled[PIKE_ROOM_HEAL_PART] != 1)
    {
      roomTypesDisabled[PIKE_ROOM_HEAL_PART] = 1;
      numRoomCandidates--;
    }
  }
  roomCandidates = new Uint8Array(numRoomCandidates); // 1:1 AllocZeroed(numRoomCandidates)
  id = 0;
  for (i = 0; i < roomTypesDisabled.length; i++)
  {
    if (roomTypesDisabled[i] == 0)
      roomCandidates[id++] = i;
  }
  nextRoomType = roomCandidates[Random() % numRoomCandidates];
  void roomCandidates /* Free — GC */;
  if (nextRoomType == PIKE_ROOM_STATUS)
    TryInflictRandomStatus();
  return nextRoomType;
}

/** 1:1 `static u16 GetNPCRoomGraphicsId(void)` (battle_pike.c:1094-1098). */
function GetNPCRoomGraphicsId(): number {
  sNpcId = Random() % sNPCTable.length;
  return sNPCTable[sNpcId].graphicsId;
}

/** 1:1 `static bool8 GetInWildMonRoom(void)` (battle_pike.c:1100-1103). */
function GetInWildMonRoom(): boolean {
  return sInWildMonRoom;
}

/** 1:1 `bool32 TryGenerateBattlePikeWildMon(bool8 checkKeenEyeIntimidate)` (battle_pike.c:1105-1152). */
export function TryGenerateBattlePikeWildMon(checkKeenEyeIntimidate: boolean): boolean {
  let i = 0;
  let monLevel = 0;
  let headerId = GetBattlePikeWildMonHeaderId();
  let lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  let wildMons = sWildMons[lvlMode];
  let abilityNum = 0;
  let pikeMonId = GetMonData(gEnemyParty[0], MON_DATA_SPECIES) as number;
  pikeMonId = SpeciesToPikeMonId(pikeMonId);
  if (gSaveBlock2Ptr.frontier.lvlMode != FRONTIER_LVL_50)
  {
    monLevel = GetHighestLevelInPlayerParty();
    if (monLevel < FRONTIER_MIN_LEVEL_OPEN)
    {
      monLevel = FRONTIER_MIN_LEVEL_OPEN;
    }
    else
    {
      monLevel -= wildMons[headerId][pikeMonId].levelDelta;
      if (monLevel < FRONTIER_MIN_LEVEL_OPEN)
        monLevel = FRONTIER_MIN_LEVEL_OPEN;
    }
  }
  else
  {
    monLevel = FRONTIER_MAX_LEVEL_50 - wildMons[headerId][pikeMonId].levelDelta;
  }
  if (checkKeenEyeIntimidate == true && !CanEncounterWildMon(monLevel))
    return false;
  // port : SetMonData scalaire — &gExperienceTables[growthRate][monLevel] (u32 exp) lu par valeur.
  // gSpeciesInfo[].growthRate = nom string (GROWTH_*) dans le port → resolveDecompConstant → index (précédent types).
  SetMonData(gEnemyParty[0], MON_DATA_EXP, gExperienceTables[resolveDecompConstant(gSpeciesInfo[wildMons[headerId][pikeMonId].species].growthRate) ?? 0][monLevel]);
  if (gSpeciesInfo[wildMons[headerId][pikeMonId].species].abilities[1])
    abilityNum = Random() % 2;
  else
    abilityNum = 0;
  SetMonData(gEnemyParty[0], MON_DATA_ABILITY_NUM, abilityNum);
  for (i = 0; i < MAX_MON_MOVES; i++)
    SetMonMoveSlot(gEnemyParty[0], wildMons[headerId][pikeMonId].moves[i], i);
  CalculateMonStats(gEnemyParty[0]);
  return true;
}

/** 1:1 `u8 GetBattlePikeWildMonHeaderId(void)` (battle_pike.c:1154-1170). */
export function GetBattlePikeWildMonHeaderId(): number {
  let headerId = 0;
  let lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  let winStreak = gSaveBlock2Ptr.frontier.pikeWinStreaks[lvlMode];
  if (winStreak <= 20 * NUM_PIKE_ROOMS)
    headerId = 0;
  else if (winStreak <= 40 * NUM_PIKE_ROOMS)
    headerId = 1;
  else if (winStreak <= 60 * NUM_PIKE_ROOMS)
    headerId = 2;
  else
    headerId = 3;
  return headerId;
}

/** 1:1 `static void DoStatusInflictionScreenFlash(u8 taskId)` (battle_pike.c:1172-1175). */
function DoStatusInflictionScreenFlash(taskId: number): void {
  while (sStatusInflictionScreenFlashFuncs[gTasks[taskId].data[0]](gTasks[taskId]))
    ;
}

/** 1:1 `static bool8 StatusInflictionFadeOut(struct Task *task)` (battle_pike.c:1177-1194). */
function StatusInflictionFadeOut(task: DecompTask): boolean {
  if (task.data[6] == 0 || --task.data[6] == 0)
  {
    task.data[6] = task.data[1];
    task.data[7] += task.data[4];
    if (task.data[7] > 16)
      task.data[7] = 16;
    BlendPalettes(PALETTES_ALL, task.data[7], RGB(11, 11, 11));
  }
  if (task.data[7] >= 16)
  {
    task.data[0]++;
    task.data[6] = task.data[2];
  }
  return false;
}

/** 1:1 `static bool8 StatusInflictionFadeIn(struct Task *task)` (battle_pike.c:1196-1220). */
function StatusInflictionFadeIn(task: DecompTask): boolean {
  if (task.data[6] == 0 || --task.data[6] == 0)
  {
    task.data[6] = task.data[2];
    task.data[7] -= task.data[5];
    if (task.data[7] < 0)
      task.data[7] = 0;
    BlendPalettes(PALETTES_ALL, task.data[7], RGB(11, 11, 11));
  }
  if (task.data[7] == 0)
  {
    if (--task.data[3] == 0)
    {
      DestroyTask(FindTaskIdByFunc(DoStatusInflictionScreenFlash));
    }
    else
    {
      task.data[6] = task.data[1];
      task.data[0] = 0;
    }
  }
  return false;
}

/** 1:1 `static void StartStatusInflictionScreenFlash(s16 fadeOutDelay, s16 fadeInDelay, s16 numFades, s16 fadeOutSpeed, s16 fadeInSpped)` (battle_pike.c:1222-1232). */
function StartStatusInflictionScreenFlash(fadeOutDelay: number, fadeInDelay: number, numFades: number, fadeOutSpeed: number, fadeInSpped: number): void {
  let taskId = CreateTask((t: { taskId: number }) => DoStatusInflictionScreenFlash(t.taskId), 3);
  gTasks[taskId].data[1] = fadeOutDelay;
  gTasks[taskId].data[2] = fadeInDelay;
  gTasks[taskId].data[3] = numFades;
  gTasks[taskId].data[4] = fadeOutSpeed;
  gTasks[taskId].data[5] = fadeInSpped;
  gTasks[taskId].data[6] = fadeOutDelay;
}

/** 1:1 `static bool8 IsStatusInflictionScreenFlashTaskFinished(void)` (battle_pike.c:1234-1240). */
function IsStatusInflictionScreenFlashTaskFinished(): boolean {
  if (FindTaskIdByFunc(DoStatusInflictionScreenFlash) == TASK_NONE)
    return true;
  else
    return false;
}

/** 1:1 `static void Task_DoStatusInflictionScreenFlash(u8 taskId)` (battle_pike.c:1242-1257). */
function Task_DoStatusInflictionScreenFlash(taskId: number): void {
  if (gTasks[taskId].data[0] == 0)
  {
    gTasks[taskId].data[0]++;
    StartStatusInflictionScreenFlash(0, 0, 3, 2, 2);
  }
  else
  {
    if (IsStatusInflictionScreenFlashTaskFinished())
    {
      ScriptContext_Enable();
      DestroyTask(taskId);
    }
  }
}

/** 1:1 `static void TryHealMons(u8 healCount)` (battle_pike.c:1259-1319). */
function TryHealMons(healCount: number): void {
  let j = 0;
  let i = 0;
  let k = 0;
  const indices = new Uint8Array(FRONTIER_PARTY_SIZE);
  if (healCount == 0)
    return;
  for (i = 0; i < FRONTIER_PARTY_SIZE; i++)
    indices[i] = i;
  // Only 'healCount' number of Pokémon will be healed.
  // The order in which they're (attempted to be) healed is random,
  // and determined by performing 10 random swaps to this index array.
  for (k = 0; k < 10; k++)
  {
    let temp = 0;
    i = Random() % FRONTIER_PARTY_SIZE;
    j = Random() % FRONTIER_PARTY_SIZE;
    [indices[i], indices[j]] = [indices[j], indices[i]]; // 1:1 SWAP(indices[i], indices[j], temp)
    void temp;
  }
  for (i = 0; i < FRONTIER_PARTY_SIZE; i++)
  {
    let canBeHealed = false;
    let mon = gPlayerParty[indices[i]];
    let curr = GetMonData(mon, MON_DATA_HP) as number;
    let max = GetMonData(mon, MON_DATA_MAX_HP) as number;
    if (curr < max)
    {
      canBeHealed = true;
    }
    else if (GetAilmentFromStatus(GetMonData(mon, MON_DATA_STATUS) as number) != AILMENT_NONE)
    {
      canBeHealed = true;
    }
    else
    {
      let ppBonuses = GetMonData(mon, MON_DATA_PP_BONUSES) as number;
      for (j = 0; j < MAX_MON_MOVES; j++)
      {
        let move = GetMonData(mon, MON_DATA_MOVE1 + j) as number;
        max = CalculatePPWithBonus(move, ppBonuses, j);
        curr = GetMonData(mon, MON_DATA_PP1 + j) as number;
        if (curr < max)
        {
          canBeHealed = true;
          break;
        }
      }
    }
    if (canBeHealed == true)
    {
      HealMon(gPlayerParty[indices[i]]);
      if (--healCount == 0)
        break;
    }
  }
}

/** 1:1 `static void GetInBattlePike(void)` (battle_pike.c:1321-1324). */
function GetInBattlePike(): void {
  VarSet(0x800D /* gSpecialVar_Result */, +(InBattlePike()));
}

/** 1:1 `bool8 InBattlePike(void)` (battle_pike.c:1326-1332). */
export function InBattlePike(): boolean {
  return gMapHeader?.mapLayoutId == LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_THREE_PATH_ROOM || gMapHeader?.mapLayoutId == LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_ROOM_NORMAL || gMapHeader?.mapLayoutId == LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_ROOM_WILD_MONS || gMapHeader?.mapLayoutId == LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_ROOM_UNUSED;
}

/** 1:1 `static void SetHintedRoom(void)` (battle_pike.c:1334-1375). */
function SetHintedRoom(): void {
  let i = 0;
  let count = 0;
  let id = 0;
  let roomCandidates: any = null;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  if (GetPikeQueenFightType(1))
  {
    VarSet(0x800D /* gSpecialVar_Result */, +(true));
    gSaveBlock2Ptr.frontier.pikeHintedRoomIndex = Random() % 6;
    gSaveBlock2Ptr.frontier.pikeHintedRoomType = PIKE_ROOM_BRAIN;
  }
  else
  {
    gSaveBlock2Ptr.frontier.pikeHintedRoomIndex = Random() % 3;
    if (gSaveBlock2Ptr.frontier.pikeHealingRoomsDisabled)
      count = NUM_PIKE_ROOM_TYPES - 3;
    else
      count = NUM_PIKE_ROOM_TYPES - 1;
    // exclude Brain room
    roomCandidates = new Uint8Array(count); // 1:1 AllocZeroed(count)
    for ((i = 0, id = 0); i < count; i++)
    {
      if (gSaveBlock2Ptr.frontier.pikeHealingRoomsDisabled)
      {
        if (i != PIKE_ROOM_HEAL_FULL && i != PIKE_ROOM_HEAL_PART)
          roomCandidates[id++] = i;
      }
      else
      {
        roomCandidates[i] = i;
      }
    }
    gSaveBlock2Ptr.frontier.pikeHintedRoomType = roomCandidates[Random() % count];
    void roomCandidates /* Free — GC */;
    if (gSaveBlock2Ptr.frontier.pikeHintedRoomType == PIKE_ROOM_STATUS && !AtLeastOneHealthyMon())
      gSaveBlock2Ptr.frontier.pikeHintedRoomType = PIKE_ROOM_NPC;
    if (gSaveBlock2Ptr.frontier.pikeHintedRoomType == PIKE_ROOM_DOUBLE_BATTLE && !AtLeastTwoAliveMons())
      gSaveBlock2Ptr.frontier.pikeHintedRoomType = PIKE_ROOM_NPC;
  }
}

/** 1:1 `static void GetHintedRoomIndex(void)` (battle_pike.c:1377-1380). */
function GetHintedRoomIndex(): void {
  VarSet(0x800D /* gSpecialVar_Result */, +(gSaveBlock2Ptr.frontier.pikeHintedRoomIndex));
}

/** 1:1 `static void GetRoomTypeHint(void)` (battle_pike.c:1382-1385). */
function GetRoomTypeHint(): void {
  VarSet(0x800D /* gSpecialVar_Result */, +(sRoomTypeHints[gSaveBlock2Ptr.frontier.pikeHintedRoomType]));
}

/** 1:1 `static void PrepareOneTrainer(bool8 difficult)` (battle_pike.c:1387-1417). */
function PrepareOneTrainer(difficult: boolean): void {
  let i = 0;
  let lvlMode = 0;
  let battleNum = 0;
  let challengeNum = 0;
  let trainerId = 0;
  if (!difficult)
    battleNum = 1;
  else
    battleNum = FRONTIER_STAGES_PER_CHALLENGE - 1;
  lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  challengeNum = Math.trunc(gSaveBlock2Ptr.frontier.pikeWinStreaks[lvlMode] / NUM_PIKE_ROOMS);
  do
  {
    trainerId = GetRandomScaledFrontierTrainerId(challengeNum, battleNum);
    for (i = 0; i < gSaveBlock2Ptr.frontier.curChallengeBattleNum - 1; i++)
    {
      if (gSaveBlock2Ptr.frontier.trainerIds[i] == trainerId)
        break;
    }
  }
  while (i != gSaveBlock2Ptr.frontier.curChallengeBattleNum - 1);
  setTrainerBattleOpponentA(trainerId);
  gFacilityTrainers = gBattleFrontierTrainers;
  SetBattleFacilityTrainerGfxId(gTrainerBattleOpponent_A, 0);
  if (gSaveBlock2Ptr.frontier.curChallengeBattleNum < NUM_PIKE_ROOMS)
    gSaveBlock2Ptr.frontier.trainerIds[gSaveBlock2Ptr.frontier.curChallengeBattleNum - 1] = gTrainerBattleOpponent_A;
}

/** 1:1 `static void PrepareTwoTrainers(void)` (battle_pike.c:1419-1458). */
function PrepareTwoTrainers(): void {
  let i = 0;
  let trainerId = 0;
  let lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  let challengeNum = Math.trunc(gSaveBlock2Ptr.frontier.pikeWinStreaks[lvlMode] / NUM_PIKE_ROOMS);
  gFacilityTrainers = gBattleFrontierTrainers;
  do
  {
    // Pick the 1st trainer, making sure it's not one that's been encountered yet in this challenge.
    trainerId = GetRandomScaledFrontierTrainerId(challengeNum, 1);
    for (i = 0; i < gSaveBlock2Ptr.frontier.curChallengeBattleNum - 1; i++)
    {
      if (gSaveBlock2Ptr.frontier.trainerIds[i] == trainerId)
        break;
    }
  }
  while (i != gSaveBlock2Ptr.frontier.curChallengeBattleNum - 1);
  setTrainerBattleOpponentA(trainerId);
  SetBattleFacilityTrainerGfxId(gTrainerBattleOpponent_A, 0);
  if (gSaveBlock2Ptr.frontier.curChallengeBattleNum <= NUM_PIKE_ROOMS)
    gSaveBlock2Ptr.frontier.trainerIds[gSaveBlock2Ptr.frontier.curChallengeBattleNum - 1] = gTrainerBattleOpponent_A;
  do
  {
    // Pick the 2nd trainer, making sure it's not one that's been encountered yet in this challenge.
    trainerId = GetRandomScaledFrontierTrainerId(challengeNum, 1);
    for (i = 0; i < gSaveBlock2Ptr.frontier.curChallengeBattleNum; i++)
    {
      if (gSaveBlock2Ptr.frontier.trainerIds[i] == trainerId)
        break;
    }
  }
  while (i != gSaveBlock2Ptr.frontier.curChallengeBattleNum);
  setTrainerBattleOpponentB(trainerId);
  SetBattleFacilityTrainerGfxId(gTrainerBattleOpponent_B, 1);
  if (gSaveBlock2Ptr.frontier.curChallengeBattleNum < NUM_PIKE_ROOMS)
    gSaveBlock2Ptr.frontier.trainerIds[gSaveBlock2Ptr.frontier.curChallengeBattleNum - 2] = gTrainerBattleOpponent_B;
}

/** 1:1 `static void ClearPikeTrainerIds(void)` (battle_pike.c:1460-1466). */
function ClearPikeTrainerIds(): void {
  let i = 0;
  for (i = 0; i < NUM_PIKE_ROOMS; i++)
    gSaveBlock2Ptr.frontier.trainerIds[i] = 0xFFFF;
}

/** 1:1 `static void BufferTrainerIntro(void)` (battle_pike.c:1468-1480). */
function BufferTrainerIntro(): void {
  if (VarGet(0x8005) /* gSpecialVar_0x8005 */ == 0)
  {
    if (gTrainerBattleOpponent_A < FRONTIER_TRAINERS_COUNT)
      FrontierSpeechToString(gFacilityTrainers[gTrainerBattleOpponent_A].speechBefore);
  }
  else if (VarGet(0x8005) /* gSpecialVar_0x8005 */ == 1)
  {
    if (gTrainerBattleOpponent_B < FRONTIER_TRAINERS_COUNT)
      FrontierSpeechToString(gFacilityTrainers[gTrainerBattleOpponent_B].speechBefore);
  }
}

/** 1:1 `static bool8 AtLeastTwoAliveMons(void)` (battle_pike.c:1482-1499). */
function AtLeastTwoAliveMons(): boolean {
  let mon: any = null;
  let i = 0;
  let countDead = 0;
  mon = gPlayerParty[0];
  countDead = 0;
  // 1:1 `mon = &gPlayerParty[0]; ...; mon++` — le pointeur marche en pas avec i sur gPlayerParty.
  for (i = 0; i < FRONTIER_PARTY_SIZE; (i++, mon = gPlayerParty[i]))
  {
    if (GetMonData(mon, MON_DATA_HP) == 0)
      countDead++;
  }
  if (countDead >= 2)
    return false;
  else
    return true;
}

/** 1:1 `static u8 GetPikeQueenFightType(u8 nextRoom)` (battle_pike.c:1501-1531). */
function GetPikeQueenFightType(nextRoom: number): number {
  let numPikeSymbols = 0;
  let facility = FRONTIER_FACILITY_PIKE;
  let ret = FRONTIER_BRAIN_NOT_READY;
  let lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  let winStreak = gSaveBlock2Ptr.frontier.pikeWinStreaks[lvlMode];
  winStreak += nextRoom;
  numPikeSymbols = GetPlayerSymbolCountForFacility(FRONTIER_FACILITY_PIKE);
  switch (numPikeSymbols) {
    case 0:
    case 1:
      if (winStreak == sFrontierBrainStreakAppearances[facility][numPikeSymbols] - sFrontierBrainStreakAppearances[facility][3])
        ret = numPikeSymbols + 1;
      // FRONTIER_BRAIN_SILVER and FRONTIER_BRAIN_GOLD
      break;
    case 2:
    default:
      if (winStreak == sFrontierBrainStreakAppearances[facility][0] - sFrontierBrainStreakAppearances[facility][3])
        ret = FRONTIER_BRAIN_STREAK;
      else if (winStreak == sFrontierBrainStreakAppearances[facility][1] - sFrontierBrainStreakAppearances[facility][3] || (winStreak > sFrontierBrainStreakAppearances[facility][1] && (winStreak - sFrontierBrainStreakAppearances[facility][1] + sFrontierBrainStreakAppearances[facility][3]) % sFrontierBrainStreakAppearances[facility][2] == 0))
        ret = FRONTIER_BRAIN_STREAK_LONG;
      break;
  }
  return ret;
}

/** 1:1 `static void GetCurrentRoomPikeQueenFightType(void)` (battle_pike.c:1533-1536). */
function GetCurrentRoomPikeQueenFightType(): void {
  VarSet(0x800D /* gSpecialVar_Result */, +(GetPikeQueenFightType(0)));
}

/** 1:1 `static void HealSomeMonsBeforePikeQueen(void)` (battle_pike.c:1538-1544). */
function HealSomeMonsBeforePikeQueen(): void {
  let toHealCount = sNumMonsToHealBeforePikeQueen[gSaveBlock2Ptr.frontier.pikeHintedRoomIndex][VarGet(0x8007) /* gSpecialVar_0x8007 */];
  TryHealMons(toHealCount);
  VarSet(0x800D /* gSpecialVar_Result */, +(toHealCount));
}

/** 1:1 `static void SetHealingroomTypesDisabled(void)` (battle_pike.c:1546-1549). */
function SetHealingroomTypesDisabled(): void {
  gSaveBlock2Ptr.frontier.pikeHealingRoomsDisabled = VarGet(0x8005) /* gSpecialVar_0x8005 */;
}

/** 1:1 `static void IsPartyFullHealed(void)` (battle_pike.c:1551-1588). */
function IsPartyFullHealed(): void {
  let i = 0;
  let j = 0;
  VarSet(0x800D /* gSpecialVar_Result */, +(true));
  for (i = 0; i < FRONTIER_PARTY_SIZE; i++)
  {
    let canBeHealed = false;
    let mon = gPlayerParty[i];
    let curr = GetMonData(mon, MON_DATA_HP) as number;
    let max = GetMonData(mon, MON_DATA_MAX_HP) as number;
    if (curr >= max && GetAilmentFromStatus(GetMonData(mon, MON_DATA_STATUS) as number) == AILMENT_NONE)
    {
      let ppBonuses = GetMonData(mon, MON_DATA_PP_BONUSES) as number;
      for (j = 0; j < MAX_MON_MOVES; j++)
      {
        let move = GetMonData(mon, MON_DATA_MOVE1 + j) as number;
        max = CalculatePPWithBonus(move, ppBonuses, j);
        curr = GetMonData(mon, MON_DATA_PP1 + j) as number;
        if (curr < max)
        {
          canBeHealed = true;
          break;
        }
      }
    }
    else
    {
      canBeHealed = true;
    }
    if (canBeHealed == true)
    {
      VarSet(0x800D /* gSpecialVar_Result */, +(false));
      break;
    }
  }
}

/** 1:1 `static void SaveMonHeldItems(void)` (battle_pike.c:1590-1600). */
function SaveMonHeldItems(): void {
  let i = 0;
  for (i = 0; i < FRONTIER_PARTY_SIZE; i++)
  {
    // 1:1 GetMonData(&gSaveBlock1Ptr->playerParty[...]) — playerParty[] = tableau d'objets Pokemon (le & disparaît).
    let heldItem = GetMonData(gSaveBlock1Ptr.playerParty[gSaveBlock2Ptr.frontier.selectedPartyMons[i] - 1], MON_DATA_HELD_ITEM);
    gSaveBlock2Ptr.frontier.pikeHeldItemsBackup[i] = heldItem;
  }
}

/** 1:1 `static void RestoreMonHeldItems(void)` (battle_pike.c:1602-1612). */
function RestoreMonHeldItems(): void {
  let i = 0;
  for (i = 0; i < FRONTIER_PARTY_SIZE; i++)
  {
    // 1:1 SetMonData(&gPlayerParty[...], MON_DATA_HELD_ITEM, &pikeHeldItemsBackup[i]) — port SetMonData scalaire.
    SetMonData(gPlayerParty[gSaveBlock2Ptr.frontier.selectedPartyMons[i] - 1], MON_DATA_HELD_ITEM, gSaveBlock2Ptr.frontier.pikeHeldItemsBackup[i]);
  }
}

/** 1:1 `static void InitPikeChallenge(void)` (battle_pike.c:1614-1626). */
function InitPikeChallenge(): void {
  let lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  gSaveBlock2Ptr.frontier.challengeStatus = 0;
  gSaveBlock2Ptr.frontier.curChallengeBattleNum = 0;
  gSaveBlock2Ptr.frontier.challengePaused = false;
  if (!(gSaveBlock2Ptr.frontier.winStreakActiveFlags & sWinStreakFlags[lvlMode]))
    gSaveBlock2Ptr.frontier.pikeWinStreaks[lvlMode] = 0;
  setTrainerBattleOpponentA(0);
  setBattleOutcome(0);
}

/** 1:1 `static bool8 CanEncounterWildMon(u8 enemyMonLevel)` (battle_pike.c:1628-1642). */
function CanEncounterWildMon(enemyMonLevel: number): boolean {
  if (!GetMonData(gPlayerParty[0], MON_DATA_SANITY_IS_EGG))
  {
    let monAbility = GetMonAbility(gPlayerParty[0]);
    if (monAbility == ABILITY_KEEN_EYE || monAbility == ABILITY_INTIMIDATE)
    {
      let playerMonLevel = GetMonData(gPlayerParty[0], MON_DATA_LEVEL) as number;
      if (playerMonLevel > 5 && enemyMonLevel <= playerMonLevel - 5 && Random() % 2 == 0)
        return false;
    }
  }
  return true;
}

/** 1:1 `static u8 SpeciesToPikeMonId(u16 species)` (battle_pike.c:1644-1656). */
function SpeciesToPikeMonId(species: number): number {
  let ret = 0;
  if (species == SPECIES_SEVIPER)
    ret = 0;
  else if (species == SPECIES_MILOTIC)
    ret = 1;
  else
    ret = 2;
  return ret;
}
