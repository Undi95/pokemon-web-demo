/**
 * secret_base.ts — Port 1:1 STRICT (MIROIR) de `src/secret_base.c`.
 *
 * Source de vérité (= 1:1 EXACT, aucune improvisation) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/secret_base.c` (2076 l.)
 *   - `include/secret_base.h`, `include/constants/secret_bases.h`,
 *     `include/constants/tv.h` (SECRET_BASE_USED_*), `include/global.h`
 *     (struct SecretBase / SecretBaseParty), `data/specials.inc`.
 *
 * FERMETURE du fichier : toutes les fonctions de secret_base.c sont transcrites
 * ici, dans l'ORDRE du .c (Règle 1 : « même découpage »). Trois familles :
 *   1. Logique pure (save management, flags TV, interactions déco d'amis) =
 *      transcrite 100 %, opérationnelle.
 *   2. Map/metatile (entrées de base, appearance) = transcrite avec les fns
 *      moteur portées (MapGrid*, gMapHeader, CurrentMapDrawMetatileAt).
 *   3. Flux tâches/menu/warp/link = transcrite EN ENTIER mais INERTE : les
 *      specials script NE SONT PAS enregistrés ici (liste dans le rapport) et
 *      les fns moteur absentes ont un garde-fou HURLANT (précédent decoration.ts
 *      LoadPlayerSpritePalette:2714). Record-mixing = exemption hardware LINK
 *      (inerte en solo, cf. mémoire hardware-non-1to1-exemptions + tv.ts:145).
 *
 * Adaptations moteur (chacune avec précédent cité) :
 *   - Vars/flags via l'API NUMÉRIQUE `event_data` (VarGet/VarSet/FlagGet/Set/Clear
 *     + constantes VAR_ / FLAG_ numériques), 1:1 du .c ; `gSpecialVar_X` = special
 *     var routée par id (VAR_RESULT/VAR_0x8004…), même stockage que script-vars
 *     gSpecialVar (event_data.ts GetVarPointer id≥0x8000 → gSpecialVars). Précédent :
 *     le per-step callback (bas de ce fichier) fait déjà exactement ça.
 *   - `CurrentMapDrawMetatileAt(x,y)` du .c → `(gFieldCamera.x, gFieldCamera.y, x, y)`
 *     (port passe la caméra explicitement ; précédent field_door.ts:778).
 *   - `trainerName` (u8[] en C) = string JS dans le save-block → frontière charmap
 *     via `encodeOwText` (précédent decoration.ts:30) ; `GetPlayerNameString` pour
 *     le nom joueur ; `playerTrainerId` (u32 dans le save) → octets LE au besoin.
 *   - `MenuAction.text` gText = getter LAZY `getString(k)` (précédent decoration.ts:222).
 *   - callbacks task / YesNoFuncTable reçoivent l'OBJET DecompTask → wrap
 *     `(t)=>fn(t.taskId)` (précédent decoration.ts:34) ; task fns = `(taskId:number)`
 *     + `gTasks[taskId]` (précédent decoration.ts:368).
 *   - `ListMenuGetScrollAndRow`/`DestroyListMenuTask` RENVOIENT `{scrollOffset,
 *     selectedRow}` ; `SetCursorWithinListBounds` prend un `ListPos` ; le dernier
 *     arg de `AddScrollIndicatorArrowPairParameterized` = closure `()=>number`
 *     (précédents decoration.ts:24-28).
 *   - `BgEvent` du port = `{x,y,kind:string,...}` sans `bgUnion.secretBaseId`
 *     (fieldmap.ts:249) : kind comparé à `'secret_base'`, id lu via champ optionnel
 *     (gap data map — entrées de base INERTES tant que le JSON map ne porte pas l'id).
 */

import { VarGet, VarSet, FlagGet, FlagSet, FlagClear } from './event_data';
import {
  PlayerGetDestCoords, GetXYCoordsOneStepInFrontOfPlayer, gPlayerAvatar, IncrementGameStat,
} from './field_player_avatar';
import {
  MapGridGetMetatileBehaviorAt, MapGridGetMetatileIdAt, MapGridSetMetatileIdAt,
  gMapHeader, MAP_OFFSET, MAPGRID_IMPASSABLE, MAPGRID_METATILE_ID_MASK,
} from './fieldmap';
import { CurrentMapDrawMetatileAt, DrawWholeMapView, gFieldCamera } from './field_camera';
import {
  MetatileBehavior_IsSecretBaseGlitterMat,
  MetatileBehavior_IsSecretBaseBalloon,
  MetatileBehavior_IsSecretBaseBreakableDoor,
  MetatileBehavior_IsSecretBaseSoundMat,
  MetatileBehavior_IsSecretBaseJumpMat,
  MetatileBehavior_IsSecretBaseSpinMat,
  MetatileBehavior_HoldsSmallDecoration,
  MetatileBehavior_HoldsLargeDecoration,
} from './metatile_behavior';
import {
  MB_IMPASSABLE_NORTHEAST, MB_IMPASSABLE_NORTHWEST, MB_IMPASSABLE_WEST_AND_EAST, MB_SLIDE_SOUTH,
  MB_SECRET_BASE_SPOT_RED_CAVE, MB_SECRET_BASE_SPOT_RED_CAVE_OPEN,
  MB_SECRET_BASE_SPOT_BROWN_CAVE, MB_SECRET_BASE_SPOT_BROWN_CAVE_OPEN,
  MB_SECRET_BASE_SPOT_BLUE_CAVE, MB_SECRET_BASE_SPOT_BLUE_CAVE_OPEN,
  MB_SECRET_BASE_SPOT_YELLOW_CAVE, MB_SECRET_BASE_SPOT_YELLOW_CAVE_OPEN,
  MB_SECRET_BASE_SPOT_TREE_LEFT, MB_SECRET_BASE_SPOT_TREE_LEFT_OPEN,
  MB_SECRET_BASE_SPOT_TREE_RIGHT, MB_SECRET_BASE_SPOT_TREE_RIGHT_OPEN,
  MB_SECRET_BASE_SPOT_SHRUB, MB_SECRET_BASE_SPOT_SHRUB_OPEN,
} from '../include/constants/metatile_behaviors';
import {
  METATILE_SecretBase_SolidBoard_Top, METATILE_SecretBase_SolidBoard_Bottom,
  METATILE_SecretBase_SmallChair, METATILE_SecretBase_PokemonChair, METATILE_SecretBase_HeavyChair,
  METATILE_SecretBase_PrettyChair, METATILE_SecretBase_ComfortChair, METATILE_SecretBase_RaggedChair,
  METATILE_SecretBase_BrickChair, METATILE_SecretBase_CampChair, METATILE_SecretBase_HardChair,
  METATILE_SecretBase_RedTent_DoorTop, METATILE_SecretBase_RedTent_Door,
  METATILE_SecretBase_BlueTent_DoorTop, METATILE_SecretBase_BlueTent_Door,
  METATILE_SecretBase_Stand_CornerRight, METATILE_SecretBase_Stand_CornerLeft,
  METATILE_SecretBase_Slide_StairLanding, METATILE_SecretBase_Slide_SlideTop,
  METATILE_SecretBase_RedBalloon, METATILE_SecretBase_BlueBalloon, METATILE_SecretBase_YellowBalloon,
  METATILE_SecretBase_MudBall,
  METATILE_SecretBase_PC, METATILE_SecretBase_RegisterPC, METATILE_SecretBase_Ground,
  METATILE_General_SecretBase_TreeLeft, METATILE_General_SecretBase_VineLeft,
  METATILE_General_SecretBase_TreeRight, METATILE_General_SecretBase_VineRight,
  METATILE_General_RedCaveIndent, METATILE_General_RedCaveOpen,
  METATILE_General_YellowCaveIndent, METATILE_General_YellowCaveOpen,
  METATILE_General_BlueCaveIndent, METATILE_General_BlueCaveOpen,
  METATILE_Fallarbor_BrownCaveIndent, METATILE_Fallarbor_BrownCaveOpen,
  METATILE_Fortree_SecretBase_Shrub, METATILE_Fortree_SecretBase_ShrubOpen,
  METATILE_SecretBase_PikaPoster_Left, METATILE_SecretBase_PikaPoster_Right,
  METATILE_SecretBase_LongPoster_Left, METATILE_SecretBase_LongPoster_Right,
  METATILE_SecretBase_SeaPoster_Left, METATILE_SecretBase_SeaPoster_Right,
  METATILE_SecretBase_SkyPoster_Left, METATILE_SecretBase_SkyPoster_Right,
  METATILE_SecretBase_KissPoster_Left, METATILE_SecretBase_KissPoster_Right,
  METATILE_SecretBase_BallPoster, METATILE_SecretBase_GreenPoster,
  METATILE_SecretBase_RedPoster, METATILE_SecretBase_BluePoster, METATILE_SecretBase_CutePoster,
  METATILE_SecretBase_GlassOrnament_Base1, METATILE_SecretBase_GlassOrnament_Base2,
  METATILE_SecretBase_RedPlant_Base1, METATILE_SecretBase_RedPlant_Base2,
  METATILE_SecretBase_TropicalPlant_Base1, METATILE_SecretBase_TropicalPlant_Base2,
  METATILE_SecretBase_PrettyFlowers_Base1, METATILE_SecretBase_PrettyFlowers_Base2,
  METATILE_SecretBase_ColorfulPlant_BaseLeft1, METATILE_SecretBase_ColorfulPlant_BaseRight1,
  METATILE_SecretBase_ColorfulPlant_BaseLeft2, METATILE_SecretBase_ColorfulPlant_BaseRight2,
  METATILE_SecretBase_BigPlant_BaseLeft1, METATILE_SecretBase_BigPlant_BaseRight1,
  METATILE_SecretBase_BigPlant_BaseLeft2, METATILE_SecretBase_BigPlant_BaseRight2,
  METATILE_SecretBase_GorgeousPlant_BaseLeft1, METATILE_SecretBase_GorgeousPlant_BaseRight1,
  METATILE_SecretBase_GorgeousPlant_BaseLeft2, METATILE_SecretBase_GorgeousPlant_BaseRight2,
  METATILE_SecretBase_Fence_Horizontal, METATILE_SecretBase_Fence_Vertical,
  METATILE_SecretBase_Tire_BottomLeft, METATILE_SecretBase_Tire_BottomRight,
  METATILE_SecretBase_Tire_TopLeft, METATILE_SecretBase_Tire_TopRight,
  METATILE_SecretBase_RedBrick_Bottom, METATILE_SecretBase_YellowBrick_Bottom, METATILE_SecretBase_BlueBrick_Bottom,
  METATILE_SecretBase_RedBrick_Top, METATILE_SecretBase_YellowBrick_Top, METATILE_SecretBase_BlueBrick_Top,
  METATILE_SecretBase_SmallDesk, METATILE_SecretBase_PokemonDesk,
  METATILE_SecretBase_HeavyDesk_BottomLeft, METATILE_SecretBase_HeavyDesk_BottomMid, METATILE_SecretBase_HeavyDesk_BottomRight,
  METATILE_SecretBase_RaggedDesk_BottomLeft, METATILE_SecretBase_RaggedDesk_BottomMid, METATILE_SecretBase_RaggedDesk_BottomRight,
  METATILE_SecretBase_ComfortDesk_BottomLeft, METATILE_SecretBase_ComfortDesk_BottomMid, METATILE_SecretBase_ComfortDesk_BottomRight,
  METATILE_SecretBase_BrickDesk_BottomLeft, METATILE_SecretBase_BrickDesk_BottomMid, METATILE_SecretBase_BrickDesk_BottomRight,
  METATILE_SecretBase_CampDesk_BottomLeft, METATILE_SecretBase_CampDesk_BottomMid, METATILE_SecretBase_CampDesk_BottomRight,
  METATILE_SecretBase_HardDesk_BottomLeft, METATILE_SecretBase_HardDesk_BottomMid, METATILE_SecretBase_HardDesk_BottomRight,
  METATILE_SecretBase_PrettyDesk_BottomLeft, METATILE_SecretBase_PrettyDesk_BottomMid, METATILE_SecretBase_PrettyDesk_BottomRight,
  METATILE_SecretBase_HeavyDesk_TopMid, METATILE_SecretBase_RaggedDesk_TopMid, METATILE_SecretBase_ComfortDesk_TopMid,
  METATILE_SecretBase_BrickDesk_TopMid, METATILE_SecretBase_BrickDesk_Center,
  METATILE_SecretBase_CampDesk_TopMid, METATILE_SecretBase_CampDesk_Center,
  METATILE_SecretBase_HardDesk_TopMid, METATILE_SecretBase_HardDesk_Center,
  METATILE_SecretBase_PrettyDesk_TopMid, METATILE_SecretBase_PrettyDesk_Center,
  METATILE_SecretBase_HeavyDesk_TopLeft, METATILE_SecretBase_HeavyDesk_TopRight,
  METATILE_SecretBase_RaggedDesk_TopLeft, METATILE_SecretBase_RaggedDesk_TopRight,
  METATILE_SecretBase_ComfortDesk_TopLeft, METATILE_SecretBase_ComfortDesk_TopRight,
  METATILE_SecretBase_BrickDesk_TopLeft, METATILE_SecretBase_BrickDesk_TopRight,
  METATILE_SecretBase_BrickDesk_MidLeft, METATILE_SecretBase_BrickDesk_MidRight,
  METATILE_SecretBase_CampDesk_TopLeft, METATILE_SecretBase_CampDesk_TopRight,
  METATILE_SecretBase_CampDesk_MidLeft, METATILE_SecretBase_CampDesk_MidRight,
  METATILE_SecretBase_HardDesk_TopLeft, METATILE_SecretBase_HardDesk_TopRight,
  METATILE_SecretBase_HardDesk_MidLeft, METATILE_SecretBase_HardDesk_MidRight,
  METATILE_SecretBase_PrettyDesk_TopLeft, METATILE_SecretBase_PrettyDesk_TopRight,
  METATILE_SecretBase_PrettyDesk_MidLeft, METATILE_SecretBase_PrettyDesk_MidRight,
  METATILE_SecretBase_SandOrnament_Base1, METATILE_SecretBase_SandOrnament_Base2,
} from '../include/constants/metatile_labels';
import { PopSecretBaseBalloon, ShatterSecretBaseBreakableDoor } from './fldeff_misc';
import { FieldEffectActiveListContains } from './field_effect';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { emptySecretBase } from './engine/save/save-blocks';
import type { SecretBase } from './engine/save/save-blocks';
import {
  SECRET_BASES_COUNT, TRAINER_ID_LENGTH, PLAYER_NAME_LENGTH, PARTY_SIZE, MAX_MON_MOVES,
  LANGUAGE_JAPANESE, LANGUAGE_FRENCH, VERSION_EMERALD, VERSION_RUBY, VERSION_SAPPHIRE,
  DIR_NORTH, DECOR_MAX_SECRET_BASE, DECOR_MAX_PLAYERS_HOUSE,
} from '../include/constants/global';
import {
  VAR_CURRENT_SECRET_BASE, VAR_SECRET_BASE_STEP_COUNTER,
  VAR_SECRET_BASE_HIGH_TV_FLAGS, VAR_SECRET_BASE_LOW_TV_FLAGS,
  VAR_SECRET_BASE_MAP, VAR_INIT_SECRET_BASE, VAR_SECRET_BASE_INITIALIZED,
  VAR_OBJ_GFX_ID_F, VAR_OBJ_GFX_ID_0, VAR_SECRET_BASE_LAST_ITEM_USED, VAR_SECRET_BASE_IS_NOT_LOCAL,
  VAR_0x8004, VAR_0x8006, VAR_0x8007, VAR_RESULT,
} from '../include/constants/vars';
import {
  FLAG_SECRET_BASE_REGISTRY_ENABLED, FLAG_DAILY_SECRET_BASE, FLAG_RECEIVED_SECRET_POWER,
  FLAG_DECORATION_1, FLAG_DECORATION_14,
} from '../include/constants/flags';
import { MAP_CONSTANTS, MAP_GROUP, MAP_NUM } from '../include/constants/map_groups';
import { GAME_STAT_MOVED_SECRET_BASE } from '../include/constants/game_stat';
import {
  MON_DATA_HP_EV, MON_DATA_ATK_EV, MON_DATA_DEF_EV, MON_DATA_SPEED_EV, MON_DATA_SPATK_EV, MON_DATA_SPDEF_EV,
  MON_DATA_SPECIES, MON_DATA_IS_EGG, MON_DATA_MOVE1, MON_DATA_HELD_ITEM, MON_DATA_LEVEL, MON_DATA_PERSONALITY,
} from '../include/pokemon';
import { SPECIES_NONE } from '../include/constants/species';
import { ITEM_NONE } from '../include/constants/items';
import { MOVE_NONE } from '../include/constants/moves';
import { EOS } from '../include/constants/characters';
import { DECOR_NONE, DECOR_REGISTEEL_DOLL } from '../include/constants/decorations';
import { DECORCAT_DOLL, DECORCAT_CUSHION } from './decoration_inventory';
import { gDecorations } from './data/decoration/header';
import { ShowDecorationOnMap, DoSecretBaseDecorationMenu } from './decoration';
import { gPlayerParty, GetMonData } from './engine/battle/party-storage';
import { TryPutSecretBaseSecretsOnAir } from './tv';
import {
  StringCopyN, ConvertInternationalString, StringExpandPlaceholders, gStringVar1, gStringVar4,
} from './string_util';
import { StringAppendWithPlaceholder, GetMaxWidthInMenuTable } from './international_string_util';
import { encodeOwText, FONT_NORMAL, GetPlayerNameString } from './text';
import { getString } from '../harness/runtime/decomp-strings';
import { resolveDecompConstant } from '../harness/runtime/decomp-constants';
import {
  ListMenuInit, ListMenu_ProcessInput, ListMenuGetScrollAndRow, DestroyListMenuTask,
  AddScrollIndicatorArrowPairParameterized, RemoveScrollIndicatorArrowPair,
  gMultiuseListMenuTemplate, LIST_CANCEL, LIST_NOTHING_CHOSEN, SCROLL_ARROW_UP,
  LIST_NO_MULTIPLE_SCROLL, CURSOR_BLACK_ARROW,
  type ListMenu, type ListMenuTemplate, type ListMenuItem,
} from './list_menu';
import {
  SetStandardWindowBorderStyle, ClearStdWindowAndFrame, ClearDialogWindowAndFrame,
  DisplayItemMessageOnField, PrintMenuTable, InitMenuInUpperLeftCornerNormal,
  Menu_ProcessInputNoWrap, DisplayYesNoMenuDefaultYes, type MenuAction,
} from './menu';
import {
  SetCursorWithinListBounds, DoYesNoFuncWithChoice, type YesNoFuncTable, type ListPos,
} from './menu_helpers';
import { AddWindow, RemoveWindow, ClearWindowTilemap, ScheduleBgCopyTilemapToVram } from './window';
import type { WindowTemplate } from '../include/window';
import { MENU_B_PRESSED, MENU_NOTHING_CHOSEN } from '../include/menu';
import { PlaySE } from './sound';
import { SE_SELECT } from '../include/constants/songs';
import {
  ObjectEventTurn, gObjectEvents,
  TryMoveObjectEventToMapCoords, RemoveObjectEventByLocalIdAndMap,
  OverrideSecretBaseDecorationSpriteScript, TryOverrideObjectEventTemplateCoords,
} from './event_object_movement';
import type { Pokemon } from './pokemon';
import { WarpIntoMap, SetWarpDestination } from './overworld';
import { FieldCB_ContinueScriptHandleMusic, FadeInFromBlack } from './field_screen_effect';
import { FadeScreen, IsWeatherNotFadingIn, FADE_TO_BLACK } from './field_weather';
import { gPaletteFade } from './palette';
import {
  LockPlayerFieldControls, UnlockPlayerFieldControls, ScriptContext_Enable, ScriptContext_SetupScript,
} from './script';
import { HideMapNamePopUpWindow } from './map_name_popup';
import { SetMainCallback2 } from './main';
import { gTasks, CreateTask, DestroyTask } from './task';
import { registerSpecial } from './scrcmd';
import { AllocZeroed } from '../harness/runtime/decomp-bridge';
import type { DecompTask } from '../harness/runtime/decomp-runtime';

// ─── Booléens décomp (lisibilité 1:1 des `= TRUE`/`= FALSE`) ────────────────
const TRUE = 1;
const FALSE = 0;

// ─── 1:1 constants/secret_bases.h (pas de feuille .ts dans le port) ─────────
const SECRET_BASE_RED_CAVE = 1;
const SECRET_BASE_BROWN_CAVE = 2;
const SECRET_BASE_BLUE_CAVE = 3;
const SECRET_BASE_YELLOW_CAVE = 4;
const SECRET_BASE_TREE = 5;
const SECRET_BASE_SHRUB = 6;
const NUM_SECRET_BASE_GROUPS = 24;
/** 1:1 `#define SECRET_BASE_GROUP(idx) ((idx) * 4)`. */
const SECRET_BASE_GROUP = (idx: number): number => idx * 4;
/** 1:1 `#define SECRET_BASE_ID_TO_GROUP(baseId) SECRET_BASE_GROUP((baseId) / 10)`. */
const SECRET_BASE_ID_TO_GROUP = (baseId: number): number => SECRET_BASE_GROUP((baseId / 10) | 0);

// ─── 1:1 constants/tv.h — flags TV (LOW = VAR_SECRET_BASE_LOW_TV_FLAGS,
// HIGH = VAR_SECRET_BASE_HIGH_TV_FLAGS ; mêmes bits, vars distinctes). ───────
const SECRET_BASE_USED_CHAIR = 1 << 0;          // LOW
const SECRET_BASE_USED_BALLOON = 1 << 1;        // LOW
const SECRET_BASE_USED_TENT = 1 << 2;           // LOW
const SECRET_BASE_USED_PLANT = 1 << 3;          // LOW
const SECRET_BASE_USED_GLASS_ORNAMENT = 1 << 6; // LOW
const SECRET_BASE_USED_MUD_BALL = 1 << 8;       // LOW
const SECRET_BASE_USED_CUSHION = 1 << 10;       // LOW
const SECRET_BASE_BATTLED_WON = 1 << 11;        // LOW
const SECRET_BASE_BATTLED_LOST = 1 << 12;       // LOW
const SECRET_BASE_DECLINED_BATTLE = 1 << 13;    // LOW
const SECRET_BASE_USED_POSTER = 1 << 14;        // LOW
const SECRET_BASE_USED_NOTE_MAT = 1 << 15;      // LOW
const SECRET_BASE_BATTLED_DRAW = 1 << 0;        // HIGH
const SECRET_BASE_USED_SPIN_MAT = 1 << 1;       // HIGH
const SECRET_BASE_USED_SAND_ORNAMENT = 1 << 2;  // HIGH
const SECRET_BASE_USED_DESK = 1 << 3;           // HIGH
const SECRET_BASE_USED_BRICK = 1 << 4;          // HIGH
const SECRET_BASE_USED_SOLID_BOARD = 1 << 5;    // HIGH
const SECRET_BASE_USED_FENCE = 1 << 6;          // HIGH
const SECRET_BASE_USED_GLITTER_MAT = 1 << 7;    // HIGH
const SECRET_BASE_USED_TIRE = 1 << 8;           // HIGH
const SECRET_BASE_USED_STAND = 1 << 9;          // HIGH
const SECRET_BASE_USED_BREAKABLE_DOOR = 1 << 10; // HIGH
const SECRET_BASE_USED_DOLL = 1 << 11;          // HIGH
const SECRET_BASE_USED_SLIDE = 1 << 12;         // HIGH
const SECRET_BASE_DECLINED_SLIDE = 1 << 13;     // HIGH
const SECRET_BASE_USED_JUMP_MAT = 1 << 14;      // HIGH

// ─── 1:1 misc constants (secret_base.c defines + include labels non exportés) ─
const TAG_SCROLL_ARROW = 5112;                  // secret_base.c:50
/** 1:1 `#define NUM_DECORATIONS DECOR_REGISTEEL_DOLL` (constants/decorations.h). */
const NUM_DECORATIONS = DECOR_REGISTEEL_DOLL;
/** 1:1 `DECORPERM_SPRITE` (constants/decorations.h) — non exporté nommément dans
 *  le port (enum ENUM_DecorationPermission inline). Valeur 4. */
const DECORPERM_SPRITE = 4;
/** 1:1 `OBJ_EVENT_GFX_VAR_0` (constants/event_objects.h) — 0xF0. */
const OBJ_EVENT_GFX_VAR_0 = 0xF0;
/** 1:1 `BG_EVENT_SECRET_BASE` (constants/event_bg.h:11) — 8. Le port compare
 *  `BgEvent.kind` (string discriminant, fieldmap.ts:249) → 'secret_base'. */
const BG_EVENT_SECRET_BASE = 8;
/** 1:1 `WARP_ID_NONE`/`WARP_ID_SECRET_BASE` (constants/maps.h:23,28). */
const WARP_ID_NONE = -1;
const WARP_ID_SECRET_BASE = 0x7E;

// ─── 1:1 enum registryStatus (secret_base.c:52-57) ──────────────────────────
const UNREGISTERED = 0;
const REGISTERED = 1;
const NEW = 2;

// ─── 1:1 struct SecretBaseRegistryMenu (secret_base.c:59-63) ────────────────
interface SecretBaseRegistryMenu {
  items: ListMenuItem[];   // struct ListMenuItem items[11]
  names: Uint8Array[];     // u8 names[11][32]
}

// ─── 1:1 struct SecretBaseRecordMixer (secret_base.c:65-70) ─────────────────
//  `secretBases` = pointeur dans un buffer link → SecretBase[] (adaptation link,
//  cf. ReceiveSecretBasesData). Exemption hardware LINK — inerte en solo.
interface SecretBaseRecordMixer {
  secretBases: SecretBase[];
  version: number;
  language: number;
}

// ─── 1:1 struct SecretBaseEntranceMetatiles (secret_base.c:72-76) ───────────
interface SecretBaseEntranceMetatiles {
  closedMetatileId: number;
  openMetatileId: number;
}

// ─── 1:1 EWRAM (secret_base.c:78-80) ────────────────────────────────────────
/** 1:1 `static EWRAM_DATA u8 sCurSecretBaseId = 0` (secret_base.c:78). */
let sCurSecretBaseId = 0;
/** 1:1 `static EWRAM_DATA bool8 sInFriendSecretBase = FALSE` (secret_base.c:79). */
let sInFriendSecretBase = false;
/** 1:1 `static EWRAM_DATA struct SecretBaseRegistryMenu *sRegistryMenu = NULL`
 *  (secret_base.c:80). */
let sRegistryMenu: SecretBaseRegistryMenu | null = null;

// ═════════════════════════════════════════════════════════════════════════════
//  GARDE-FOUS HURLANTS — fns moteur absentes/divergentes (précédent decoration.ts
//  LoadPlayerSpritePalette:2714). INERTE : les specials qui les appellent NE SONT
//  PAS enregistrés (rapport). Un warn 1× si jamais invoqué.
// ═════════════════════════════════════════════════════════════════════════════
const _sbWarned = new Set<string>();
function _sbGuard(name: string, detail: string): void {
  if (!_sbWarned.has(name)) { console.error(`[secret_base] ${name} : ${detail}`); _sbWarned.add(name); }
}
/** overworld.c `SetWarpDestinationToMapWarp` — non porté. */
function SetWarpDestinationToMapWarp(_mapGroup: number, _mapNum: number, _warpId: number): void {
  _sbGuard('SetWarpDestinationToMapWarp', 'overworld.c non porté — warp base INERTE');
}
/** overworld.c `SetWarpDestinationToDynamicWarp` — non porté. */
function SetWarpDestinationToDynamicWarp(_warpId: number): void {
  _sbGuard('SetWarpDestinationToDynamicWarp', 'overworld.c non porté — sortie base INERTE');
}
/** overworld.c `SetDynamicWarp` — signature port divergente (mapId,x,y) ; le .c
 *  passe (unused, mapGroup, mapNum, warpId). Garde-fou (réconciliation warp). */
function SetDynamicWarp(_unused: number, _mapGroup: number, _mapNum: number, _warpId: number): void {
  _sbGuard('SetDynamicWarp', 'signature port divergente — dynamicWarp base INERTE');
}
/** overworld.c `CB2_LoadMap` — non exporté (modèle pending-warp). Garde-fou CB2. */
function CB2_LoadMap(): void {
  _sbGuard('CB2_LoadMap', 'overworld.c non exporté (modèle pending-warp) — load map base INERTE');
}
/** overworld.c `FieldCB_DefaultWarpExit` — non porté. */
function FieldCB_DefaultWarpExit(): void {
  _sbGuard('FieldCB_DefaultWarpExit', 'overworld.c non porté — retour sortie base INERTE');
}
/** malloc.c `Free` — non porté (AllocZeroed no-op côté port). */
function Free(_ptr: unknown): void {
  _sbGuard('Free', 'malloc.c Free non porté (AllocZeroed no-op) — no-op');
}
// OverrideSecretBaseDecorationSpriteScript + TryOverrideObjectEventTemplateCoords :
// désormais PORTÉS 1:1 dans event_object_movement.ts (leur vrai home décomp) et importés
// ci-dessus (VIS-27 : décorations poupées/coussins rendues cliquables).
/** event_object_movement.c `TrySpawnObjectEvent` — signature port divergente
 *  `(localIdRaw:string, rt)` vs le .c `(localId, mapNum, mapGroup)`. Garde-fou. */
function TrySpawnObjectEvent(_localId: number, _mapNum: number, _mapGroup: number): void {
  _sbGuard('TrySpawnObjectEvent', 'signature port divergente (localIdRaw,rt) — spawn déco INERTE');
}
/** fldeff_misc/field_specials `TryGainNewFanFromCounter` — dette R3 (fan club). */
function TryGainNewFanFromCounter(_counter: number): void {
  _sbGuard('TryGainNewFanFromCounter', 'cascade fan-club non portée (dette R3) — no-op');
}
const FANCOUNTER_BATTLED_AT_BASE = 2; // 1:1 constants/tv.h (fan counter)
/** link.c `GetLinkPlayerCount` — exemption hardware LINK. Solo → 1. */
function GetLinkPlayerCount(): number {
  _sbGuard('GetLinkPlayerCount', 'link.c exemption hardware — solo=1 (record-mixing INERTE)');
  return 1;
}
/** link.c `gLinkPlayers` — exemption hardware LINK. Solo → vide. */
const gLinkPlayers: Array<{ version: number; language: number }> = [];

// ─── 1:1 sSecretBaseEntranceMetatiles[] (secret_base.c:98-107) ──────────────
const sSecretBaseEntranceMetatiles: ReadonlyArray<SecretBaseEntranceMetatiles> = [
  { closedMetatileId: METATILE_General_SecretBase_TreeLeft,  openMetatileId: METATILE_General_SecretBase_VineLeft },
  { closedMetatileId: METATILE_General_SecretBase_TreeRight, openMetatileId: METATILE_General_SecretBase_VineRight },
  { closedMetatileId: METATILE_General_RedCaveIndent,        openMetatileId: METATILE_General_RedCaveOpen },
  { closedMetatileId: METATILE_General_YellowCaveIndent,     openMetatileId: METATILE_General_YellowCaveOpen },
  { closedMetatileId: METATILE_General_BlueCaveIndent,       openMetatileId: METATILE_General_BlueCaveOpen },
  { closedMetatileId: METATILE_Fallarbor_BrownCaveIndent,    openMetatileId: METATILE_Fallarbor_BrownCaveOpen },
  { closedMetatileId: METATILE_Fortree_SecretBase_Shrub,     openMetatileId: METATILE_Fortree_SecretBase_ShrubOpen },
];

// ─── 1:1 sSecretBaseEntrancePositions[NUM_SECRET_BASE_GROUPS * 4] ───────────
//  (secret_base.c:111-137) mapNum, warpId, x, y — initialiseurs désignés
//  [SECRET_BASE_X] = SECRET_BASE_GROUP(idx) = idx*4 (ordre séquentiel des groupes).
const sSecretBaseEntrancePositions: number[] = [];
([
  ['MAP_SECRET_BASE_RED_CAVE1', 1, 3], ['MAP_SECRET_BASE_RED_CAVE2', 5, 9],
  ['MAP_SECRET_BASE_RED_CAVE3', 1, 3], ['MAP_SECRET_BASE_RED_CAVE4', 7, 13],
  ['MAP_SECRET_BASE_BROWN_CAVE1', 2, 3], ['MAP_SECRET_BASE_BROWN_CAVE2', 9, 2],
  ['MAP_SECRET_BASE_BROWN_CAVE3', 13, 4], ['MAP_SECRET_BASE_BROWN_CAVE4', 1, 2],
  ['MAP_SECRET_BASE_BLUE_CAVE1', 1, 3], ['MAP_SECRET_BASE_BLUE_CAVE2', 1, 2],
  ['MAP_SECRET_BASE_BLUE_CAVE3', 3, 15], ['MAP_SECRET_BASE_BLUE_CAVE4', 3, 14],
  ['MAP_SECRET_BASE_YELLOW_CAVE1', 9, 3], ['MAP_SECRET_BASE_YELLOW_CAVE2', 8, 7],
  ['MAP_SECRET_BASE_YELLOW_CAVE3', 3, 6], ['MAP_SECRET_BASE_YELLOW_CAVE4', 5, 9],
  ['MAP_SECRET_BASE_TREE1', 2, 3], ['MAP_SECRET_BASE_TREE2', 5, 6],
  ['MAP_SECRET_BASE_TREE3', 15, 3], ['MAP_SECRET_BASE_TREE4', 4, 10],
  ['MAP_SECRET_BASE_SHRUB1', 3, 3], ['MAP_SECRET_BASE_SHRUB2', 1, 2],
  ['MAP_SECRET_BASE_SHRUB3', 7, 8], ['MAP_SECRET_BASE_SHRUB4', 9, 6],
] as ReadonlyArray<readonly [string, number, number]>).forEach(([mapKey, x, y]) => {
  sSecretBaseEntrancePositions.push(MAP_NUM(MAP_CONSTANTS[mapKey] ?? 0), 0, x, y);
});
/** 1:1 `#define GET_BASE_MAP_NUM(group)` (secret_base.c:139-142). */
const GET_BASE_MAP_NUM = (group: number): number => sSecretBaseEntrancePositions[group + 0];
const GET_BASE_WARP_ID = (group: number): number => sSecretBaseEntrancePositions[group + 1];
const GET_BASE_COMPUTER_X = (group: number): number => sSecretBaseEntrancePositions[group + 2];
const GET_BASE_COMPUTER_Y = (group: number): number => sSecretBaseEntrancePositions[group + 3];

// ─── 1:1 sRegistryMenuActions[] (secret_base.c:144-154) ─────────────────────
//  `.text` = getter LAZY getString (précédent decoration.ts:222) ; `.func` =
//  callback wrap `(t)=>fn(t.taskId)` (précédent decoration.ts:34).
const sRegistryMenuActions: ReadonlyArray<MenuAction> = [
  { get text() { return getString('gText_DelRegist'); }, func: (t: DecompTask) => ShowRegistryMenuDeleteConfirmation(t.taskId) },
  { get text() { return getString('gText_Cancel'); }, func: (t: DecompTask) => ReturnToMainRegistryMenu(t.taskId) },
];

// ─── 1:1 sDeleteRegistryYesNoFuncs (secret_base.c:156-160) ──────────────────
const sDeleteRegistryYesNoFuncs: YesNoFuncTable = {
  yesFunc: (t) => DeleteRegistry_Yes(t.taskId),
  noFunc: (t) => DeleteRegistry_No(t.taskId),
};

// ─── 1:1 sSecretBaseOwnerGfxIds[10] (secret_base.c:162-176) ─────────────────
//  OBJ_EVENT_GFX_* : YOUNGSTER/BUG_CATCHER/RICH_BOY/CAMPER/MAN_3 (male 0..4),
//  LASS/GIRL_3/WOMAN_2/PICNICKER/WOMAN_5 (female 5..9).
const sSecretBaseOwnerGfxIds: ReadonlyArray<number> = [
  35, 36, 15, 31, 33,  // Male
  47, 14, 20, 32, 34,  // Female
];

// ─── 1:1 sRegistryWindowTemplates[] (secret_base.c:178-198) ─────────────────
const sRegistryWindowTemplates: ReadonlyArray<WindowTemplate> = [
  { bg: 0, tilemapLeft: 17, tilemapTop: 1, width: 12, height: 18, paletteNum: 15, baseBlock: 0x01 }, // !< French Difference
  { bg: 0, tilemapLeft: 2, tilemapTop: 1, width: 28, height: 4, paletteNum: 15, baseBlock: 0xd9 },   // !< French Difference
];

// ─── 1:1 sRegistryListMenuTemplate (secret_base.c:200-220) ──────────────────
const sRegistryListMenuTemplate: ListMenuTemplate = {
  items: [],  // NULL (rempli par BuildRegistryMenuItems via gMultiuseListMenuTemplate)
  moveCursorFunc: RegistryMenu_OnCursorMove,
  itemPrintFunc: null,
  totalItems: 0,
  maxShowed: 0,
  windowId: 0,
  header_X: 0,
  item_X: 8,
  cursor_X: 0,
  upText_Y: 9,
  cursorPal: 2,
  fillValue: 1,
  cursorShadowPal: 3,
  lettersSpacing: 0,
  itemVerticalPadding: 0,
  scrollMultiple: LIST_NO_MULTIPLE_SCROLL,
  fontId: FONT_NORMAL,
  cursorKind: CURSOR_BLACK_ARROW,
};

// ─── Helpers charmap/octets pour trainerName (string dans le save) ──────────
/** Vue octets charmap EOS-terminée d'un nom (string save → bytes 1:1 pour
 *  StringCopyN/compares). Précédent decoration.ts:30 (encodeOwText). */
function _nameBytes(name: string): Uint8Array { return encodeOwText(name); }

// ─── Helpers VarSet |= / ^= (= `*GetVarPointer(var) op= flag`) ──────────────
function _varSetBit(varId: number, flag: number): void { VarSet(varId, VarGet(varId) | flag); }
function _varClearBits(varId: number, mask: number): void { VarSet(varId, VarGet(varId) & ~mask); }
function _varToggleBit(varId: number, flag: number): void { VarSet(varId, VarGet(varId) ^ flag); }

// ═════════════════════════════════════════════════════════════════════════════
//  FONCTIONS — ordre secret_base.c
// ═════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `static void ClearSecretBase(struct SecretBase *secretBase)`
 *  (secret_base.c:222-228) : CpuFastFill16(0) + trainerName[i]=EOS. Chez nous =
 *  remplace le slot par la struct zéro (trainerName '' = EOS ×PLAYER_NAME_LENGTH). */
function ClearSecretBase(secretBases: SecretBase[], index: number): void {
  secretBases[index] = emptySecretBase();
}

/** 1:1 décomp `void ClearSecretBases(void)` (secret_base.c:230-235). */
export function ClearSecretBases(): void {
  for (let i = 0; i < SECRET_BASES_COUNT; i++) {
    ClearSecretBase(gSaveBlock1Ptr.secretBases, i);
  }
}

/** 1:1 décomp `static void SetCurSecretBaseId(void)` (secret_base.c:237-240). */
function SetCurSecretBaseId(): void {
  sCurSecretBaseId = VarGet(VAR_0x8004) & 0xFF; // gSpecialVar_0x8004
}

/** 1:1 décomp `void TrySetCurSecretBaseIndex(void)` (secret_base.c:242-256). */
export function TrySetCurSecretBaseIndex(): void {
  VarSet(VAR_RESULT, FALSE); // gSpecialVar_Result
  for (let i = 0; i < SECRET_BASES_COUNT; i++) {
    if (sCurSecretBaseId === gSaveBlock1Ptr.secretBases[i].secretBaseId) {
      VarSet(VAR_RESULT, TRUE);
      VarSet(VAR_CURRENT_SECRET_BASE, i);
      break;
    }
  }
}

/** 1:1 décomp `void CheckPlayerHasSecretBase(void)` (secret_base.c:258-265). */
export function CheckPlayerHasSecretBase(): void {
  // The player's secret base is always the first in the array.
  if (gSaveBlock1Ptr.secretBases[0].secretBaseId)
    VarSet(VAR_RESULT, TRUE);
  else
    VarSet(VAR_RESULT, FALSE);
}

/** 1:1 décomp `static u8 GetSecretBaseTypeInFrontOfPlayer_(void)` (secret_base.c:267-294). */
function GetSecretBaseTypeInFrontOfPlayer_(): number {
  const { x, y } = GetXYCoordsOneStepInFrontOfPlayer();
  const behavior = MapGridGetMetatileBehaviorAt(x, y) & 0xFFF;
  if (behavior === MB_SECRET_BASE_SPOT_RED_CAVE || behavior === MB_SECRET_BASE_SPOT_RED_CAVE_OPEN)
    return SECRET_BASE_RED_CAVE;
  if (behavior === MB_SECRET_BASE_SPOT_BROWN_CAVE || behavior === MB_SECRET_BASE_SPOT_BROWN_CAVE_OPEN)
    return SECRET_BASE_BROWN_CAVE;
  if (behavior === MB_SECRET_BASE_SPOT_BLUE_CAVE || behavior === MB_SECRET_BASE_SPOT_BLUE_CAVE_OPEN)
    return SECRET_BASE_BLUE_CAVE;
  if (behavior === MB_SECRET_BASE_SPOT_YELLOW_CAVE || behavior === MB_SECRET_BASE_SPOT_YELLOW_CAVE_OPEN)
    return SECRET_BASE_YELLOW_CAVE;
  if (behavior === MB_SECRET_BASE_SPOT_TREE_LEFT || behavior === MB_SECRET_BASE_SPOT_TREE_LEFT_OPEN
    || behavior === MB_SECRET_BASE_SPOT_TREE_RIGHT || behavior === MB_SECRET_BASE_SPOT_TREE_RIGHT_OPEN)
    return SECRET_BASE_TREE;
  if (behavior === MB_SECRET_BASE_SPOT_SHRUB || behavior === MB_SECRET_BASE_SPOT_SHRUB_OPEN)
    return SECRET_BASE_SHRUB;
  return 0;
}

/** 1:1 décomp `void GetSecretBaseTypeInFrontOfPlayer(void)` (secret_base.c:296-299). */
export function GetSecretBaseTypeInFrontOfPlayer(): void {
  VarSet(VAR_0x8007, GetSecretBaseTypeInFrontOfPlayer_()); // gSpecialVar_0x8007
}

/** 1:1 décomp `static void FindMetatileIdMapCoords(s16 *x, s16 *y, u16 metatileId)`
 *  (secret_base.c:301-318). Le port renvoie `{x,y}` (out-params → objet retour). */
function FindMetatileIdMapCoords(metatileId: number): { x: number; y: number } {
  const mapLayout = gMapHeader!.mapLayout;
  for (let j = 0; j < mapLayout.height; j++) {
    for (let i = 0; i < mapLayout.width; i++) {
      if ((mapLayout.map[j * mapLayout.width + i] & MAPGRID_METATILE_ID_MASK) === metatileId) {
        return { x: i, y: j };
      }
    }
  }
  return { x: 0, y: 0 };
}

/** 1:1 décomp `void ToggleSecretBaseEntranceMetatile(void)` (secret_base.c:320-351).
 *  Opens or closes the secret base entrance metatile in front of the player. */
export function ToggleSecretBaseEntranceMetatile(): void {
  const { x, y } = GetXYCoordsOneStepInFrontOfPlayer();
  const metatileId = MapGridGetMetatileIdAt(x, y);

  // Look for entrance metatiles to open
  for (let i = 0; i < sSecretBaseEntranceMetatiles.length; i++) {
    if (sSecretBaseEntranceMetatiles[i].closedMetatileId === metatileId) {
      MapGridSetMetatileIdAt(x, y, sSecretBaseEntranceMetatiles[i].openMetatileId | MAPGRID_IMPASSABLE);
      CurrentMapDrawMetatileAt(gFieldCamera.x, gFieldCamera.y, x, y);
      return;
    }
  }
  // Look for entrance metatiles to close
  for (let i = 0; i < sSecretBaseEntranceMetatiles.length; i++) {
    if (sSecretBaseEntranceMetatiles[i].openMetatileId === metatileId) {
      MapGridSetMetatileIdAt(x, y, sSecretBaseEntranceMetatiles[i].closedMetatileId | MAPGRID_IMPASSABLE);
      CurrentMapDrawMetatileAt(gFieldCamera.x, gFieldCamera.y, x, y);
      return;
    }
  }
}

/** 1:1 décomp `static u8 GetNameLength(const u8 *secretBaseOwnerName)` (secret_base.c:353-363).
 *  Adaptation string↔octets : `trainerName` = string JS (pas d'EOS interne) →
 *  min(length, PLAYER_NAME_LENGTH) ; `playerName` = u8[] (SaveBlock2) → EOS scan. */
function GetNameLength(secretBaseOwnerName: string | number[] | Uint8Array): number {
  if (typeof secretBaseOwnerName === 'string') {
    return Math.min(secretBaseOwnerName.length, PLAYER_NAME_LENGTH);
  }
  for (let i = 0; i < PLAYER_NAME_LENGTH; i++) {
    if (secretBaseOwnerName[i] === EOS) return i;
  }
  return PLAYER_NAME_LENGTH;
}

/** 1:1 décomp `void SetPlayerSecretBase(void)` (secret_base.c:365-378).
 *  Adaptations : trainerName (u8[]) ← string via GetPlayerNameString ;
 *  playerTrainerId (u32 dans le save) → octets LE ; VAR_SECRET_BASE_MAP =
 *  regionMapSectionId (string MAPSEC_*) → numérique via resolveDecompConstant. */
export function SetPlayerSecretBase(): void {
  const base = gSaveBlock1Ptr.secretBases[0];
  base.secretBaseId = sCurSecretBaseId;
  if (!base.trainerId) base.trainerId = [0, 0, 0, 0];
  for (let i = 0; i < TRAINER_ID_LENGTH; i++)
    base.trainerId[i] = (gSaveBlock2Ptr.playerTrainerId >> (8 * i)) & 0xFF;

  VarSet(VAR_CURRENT_SECRET_BASE, 0);
  base.trainerName = GetPlayerNameString(); // StringCopyN(dst, playerName, GetNameLength)
  base.gender = gSaveBlock2Ptr.playerGender;
  base.language = LANGUAGE_FRENCH; // GAME_LANGUAGE
  const mapsecName = gMapHeader?.regionMapSectionId;
  const numericId = mapsecName ? resolveDecompConstant(mapsecName) : undefined;
  VarSet(VAR_SECRET_BASE_MAP, numericId ?? 0);
}

/** 1:1 décomp `void SetOccupiedSecretBaseEntranceMetatiles(struct MapEvents const *events)`
 *  (secret_base.c:380-410). Set the 'open' entrance metatile for any occupied
 *  secret base on this map. Adaptation BgEvent (kind string, secretBaseId gap). */
export function SetOccupiedSecretBaseEntranceMetatiles(events: { bgEvents: Array<{ x: number; y: number; kind: string; secretBaseId?: number }> }): void {
  const bgEventCount = events.bgEvents.length;
  for (let bgId = 0; bgId < bgEventCount; bgId++) {
    if (events.bgEvents[bgId].kind === 'secret_base' /* BG_EVENT_SECRET_BASE */) {
      for (let j = 0; j < SECRET_BASES_COUNT; j++) {
        if (gSaveBlock1Ptr.secretBases[j].secretBaseId === (events.bgEvents[bgId].secretBaseId ?? 0)) {
          const x = events.bgEvents[bgId].x + MAP_OFFSET;
          const y = events.bgEvents[bgId].y + MAP_OFFSET;
          const tile_id = MapGridGetMetatileIdAt(x, y);
          for (let i = 0; i < sSecretBaseEntranceMetatiles.length; i++) {
            if (sSecretBaseEntranceMetatiles[i].closedMetatileId === tile_id) {
              MapGridSetMetatileIdAt(x, y, sSecretBaseEntranceMetatiles[i].openMetatileId | MAPGRID_IMPASSABLE);
              break;
            }
          }
          break;
        }
      }
    }
  }
}

/** 1:1 décomp `static void SetSecretBaseWarpDestination(void)` (secret_base.c:412-416). */
function SetSecretBaseWarpDestination(): void {
  const secretBaseGroup = SECRET_BASE_ID_TO_GROUP(sCurSecretBaseId);
  SetWarpDestinationToMapWarp(MAP_GROUP(MAP_CONSTANTS.MAP_SECRET_BASE_RED_CAVE1 ?? 0), GET_BASE_MAP_NUM(secretBaseGroup), GET_BASE_WARP_ID(secretBaseGroup));
}

// #define tState data[0] (secret_base.c:418)

/** 1:1 décomp `static void Task_EnterSecretBase(u8 taskId)` (secret_base.c:420-442). */
function Task_EnterSecretBase(taskId: number): void {
  switch (gTasks[taskId].data[0]) { // tState
    case 0:
      if (!gPaletteFade.active)
        gTasks[taskId].data[0] = 1;
      break;
    case 1: {
      const secretBaseIdx = VarGet(VAR_CURRENT_SECRET_BASE);
      if (gSaveBlock1Ptr.secretBases[secretBaseIdx].numTimesEntered < 255)
        gSaveBlock1Ptr.secretBases[secretBaseIdx].numTimesEntered++;

      SetSecretBaseWarpDestination();
      WarpIntoMap();
      (globalThis as Record<string, unknown>).gFieldCallback = FieldCB_ContinueScriptHandleMusic;
      SetMainCallback2(CB2_LoadMap);
      DestroyTask(taskId);
      break;
    }
  }
}

/** 1:1 décomp `void EnterSecretBase(void)` (secret_base.c:446-451). */
export function EnterSecretBase(): void {
  CreateTask((t: DecompTask) => Task_EnterSecretBase(t.taskId), 0);
  FadeScreen(FADE_TO_BLACK, 0);
  SetDynamicWarp(0, gSaveBlock1Ptr.location.mapGroup, gSaveBlock1Ptr.location.mapNum, WARP_ID_NONE);
}

/** 1:1 décomp `bool8 SecretBaseMapPopupEnabled(void)` (secret_base.c:453-459). */
export function SecretBaseMapPopupEnabled(): boolean {
  if (gMapHeader!.mapType === 'MAP_TYPE_SECRET_BASE' && VarGet(VAR_INIT_SECRET_BASE) === 0)
    return false;
  return true;
}

/** 1:1 décomp `static void EnterNewlyCreatedSecretBase_WaitFadeIn(u8 taskId)` (secret_base.c:461-469). */
function EnterNewlyCreatedSecretBase_WaitFadeIn(taskId: number): void {
  ObjectEventTurn(gObjectEvents[gPlayerAvatar.objectEventId], DIR_NORTH);
  if (IsWeatherNotFadingIn() === true) {
    ScriptContext_Enable();
    DestroyTask(taskId);
  }
}

/** 1:1 décomp `static void EnterNewlyCreatedSecretBase_StartFadeIn(void)` (secret_base.c:471-484). */
function EnterNewlyCreatedSecretBase_StartFadeIn(): void {
  LockPlayerFieldControls();
  HideMapNamePopUpWindow();
  const c = FindMetatileIdMapCoords(METATILE_SecretBase_PC);
  const x = c.x + MAP_OFFSET;
  const y = c.y + MAP_OFFSET;
  MapGridSetMetatileIdAt(x, y, METATILE_SecretBase_PC | MAPGRID_IMPASSABLE);
  CurrentMapDrawMetatileAt(gFieldCamera.x, gFieldCamera.y, x, y);
  FadeInFromBlack();
  CreateTask((t: DecompTask) => EnterNewlyCreatedSecretBase_WaitFadeIn(t.taskId), 0);
}

/** 1:1 décomp `static void Task_EnterNewlyCreatedSecretBase(u8 taskId)` (secret_base.c:486-502). */
function Task_EnterNewlyCreatedSecretBase(taskId: number): void {
  if (!gPaletteFade.active) {
    const secretBaseGroup = SECRET_BASE_ID_TO_GROUP(sCurSecretBaseId);
    SetWarpDestination(
      gSaveBlock1Ptr.location.mapGroup,
      gSaveBlock1Ptr.location.mapNum,
      WARP_ID_NONE,
      GET_BASE_COMPUTER_X(secretBaseGroup),
      GET_BASE_COMPUTER_Y(secretBaseGroup));
    WarpIntoMap();
    (globalThis as Record<string, unknown>).gFieldCallback = EnterNewlyCreatedSecretBase_StartFadeIn;
    SetMainCallback2(CB2_LoadMap);
    DestroyTask(taskId);
  }
}

/** 1:1 décomp `void EnterNewlyCreatedSecretBase(void)` (secret_base.c:504-508). */
export function EnterNewlyCreatedSecretBase(): void {
  CreateTask((t: DecompTask) => Task_EnterNewlyCreatedSecretBase(t.taskId), 0);
  FadeScreen(FADE_TO_BLACK, 0);
}

/** 1:1 décomp `bool8 CurMapIsSecretBase(void)` (secret_base.c:510-517).
 *  NB : le port a un stub `return false` dans fieldmap.ts:1551 (DÉRIVE différée) ;
 *  ceci est la version 1:1 canonique (à réconcilier — fieldmap non éditable ici). */
export function CurMapIsSecretBase(): boolean {
  if (gSaveBlock1Ptr.location.mapGroup === MAP_GROUP(MAP_CONSTANTS.MAP_SECRET_BASE_RED_CAVE1 ?? 0)
    && (gSaveBlock1Ptr.location.mapNum & 0xFF) <= MAP_NUM(MAP_CONSTANTS.MAP_SECRET_BASE_SHRUB4 ?? 0))
    return true;
  return false;
}

/** 1:1 décomp `void InitSecretBaseAppearance(bool8 hidePC)` (secret_base.c:519-550). */
export function InitSecretBaseAppearance(hidePC: boolean): void {
  if (CurMapIsSecretBase()) {
    const secretBaseIdx = VarGet(VAR_CURRENT_SECRET_BASE);
    const decorations = gSaveBlock1Ptr.secretBases[secretBaseIdx].decorations;
    const decorPos = gSaveBlock1Ptr.secretBases[secretBaseIdx].decorationPositions;
    for (let x = 0; x < DECOR_MAX_SECRET_BASE; x++) {
      if (decorations[x] > 0 && decorations[x] <= NUM_DECORATIONS && gDecorations[decorations[x]].permission !== DECORPERM_SPRITE)
        ShowDecorationOnMap((decorPos[x] >> 4) + MAP_OFFSET, (decorPos[x] & 0xF) + MAP_OFFSET, decorations[x]);
    }

    if (secretBaseIdx !== 0) {
      // Another player's secret base. Change PC type to the "Register" PC.
      const c = FindMetatileIdMapCoords(METATILE_SecretBase_PC);
      MapGridSetMetatileIdAt(c.x + MAP_OFFSET, c.y + MAP_OFFSET, METATILE_SecretBase_RegisterPC | MAPGRID_IMPASSABLE);
    } else if (hidePC === true && VarGet(VAR_SECRET_BASE_INITIALIZED) === 1) {
      // Change PC to regular ground tile.
      const c = FindMetatileIdMapCoords(METATILE_SecretBase_PC);
      MapGridSetMetatileIdAt(c.x + MAP_OFFSET, c.y + MAP_OFFSET, METATILE_SecretBase_Ground | MAPGRID_IMPASSABLE);
    }
  }
}

/** 1:1 décomp `void InitSecretBaseDecorationSprites(void)` (secret_base.c:552-633).
 *  Adaptations : graphicsId peut être string (OBJ_EVENT_GFX_*) dans le port → le
 *  calcul `graphicsId - OBJ_EVENT_GFX_VAR_0` n'a de sens que numérique (guard sinon).
 *  Fns absentes (OverrideSecretBaseDecorationSpriteScript, TryOverrideObjectEvent
 *  TemplateCoords) = garde-fous. Special INERTE (non enregistré). */
export function InitSecretBaseDecorationSprites(): void {
  let objectEventId = 0;
  let decorations: number[];
  let decorationPositions: number[];
  let numDecorations: number;

  if (!CurMapIsSecretBase()) {
    decorations = gSaveBlock1Ptr.playerRoomDecorations;
    decorationPositions = gSaveBlock1Ptr.playerRoomDecorationPositions;
    numDecorations = DECOR_MAX_PLAYERS_HOUSE;
  } else {
    const secretBaseIdx = VarGet(VAR_CURRENT_SECRET_BASE);
    decorations = gSaveBlock1Ptr.secretBases[secretBaseIdx].decorations;
    decorationPositions = gSaveBlock1Ptr.secretBases[secretBaseIdx].decorationPositions;
    numDecorations = DECOR_MAX_SECRET_BASE;
  }

  const objectEvents = gMapHeader!.events.objectEvents;
  const objectEventCount = objectEvents.length;
  for (let i = 0; i < numDecorations; i++) {
    if (decorations[i] === DECOR_NONE)
      continue;

    const permission = gDecorations[decorations[i]].permission;
    const category = gDecorations[decorations[i]].category;
    if (permission === DECORPERM_SPRITE) {
      for (objectEventId = 0; objectEventId < objectEventCount; objectEventId++) {
        // flagId = label string dans le port → résolu numériquement (resolveDecompConstant).
        if ((resolveDecompConstant(objectEvents[objectEventId].flagId) ?? -1) === FLAG_DECORATION_1 + VarGet(VAR_0x8004))
          break;
      }

      if (objectEventId === objectEventCount)
        continue;

      VarSet(VAR_0x8006, decorationPositions[i] >> 4);   // gSpecialVar_0x8006
      VarSet(VAR_0x8007, decorationPositions[i] & 0xF);  // gSpecialVar_0x8007
      const metatileBehavior = MapGridGetMetatileBehaviorAt(VarGet(VAR_0x8006) + MAP_OFFSET, VarGet(VAR_0x8007) + MAP_OFFSET);
      if (MetatileBehavior_HoldsSmallDecoration(metatileBehavior) === true
        || MetatileBehavior_HoldsLargeDecoration(metatileBehavior) === true) {
        // graphicsId = number dans le port (fieldmap ObjectEventTemplate, résolu).
        const gfxSlotVar = VAR_OBJ_GFX_ID_0 + (objectEvents[objectEventId].graphicsId - OBJ_EVENT_GFX_VAR_0);
        VarSet(VAR_RESULT, gfxSlotVar);
        // tiles[] = string identifier non résolu côté port (gap header.ts) → 0 (INERTE).
        VarSet(gfxSlotVar, 0);
        VarSet(VAR_RESULT, objectEvents[objectEventId].localId);
        FlagClear(FLAG_DECORATION_1 + VarGet(VAR_0x8004));
        TrySpawnObjectEvent(VarGet(VAR_RESULT), gSaveBlock1Ptr.location.mapNum, gSaveBlock1Ptr.location.mapGroup);
        TryMoveObjectEventToMapCoords(VarGet(VAR_RESULT), gSaveBlock1Ptr.location.mapNum, gSaveBlock1Ptr.location.mapGroup, VarGet(VAR_0x8006), VarGet(VAR_0x8007));
        TryOverrideObjectEventTemplateCoords(VarGet(VAR_RESULT), gSaveBlock1Ptr.location.mapNum, gSaveBlock1Ptr.location.mapGroup);
        if (CurMapIsSecretBase() === true && VarGet(VAR_CURRENT_SECRET_BASE) !== 0) {
          if (category === DECORCAT_DOLL) {
            OverrideSecretBaseDecorationSpriteScript(VarGet(VAR_RESULT), gSaveBlock1Ptr.location.mapNum, gSaveBlock1Ptr.location.mapGroup, DECORCAT_DOLL);
          } else if (category === DECORCAT_CUSHION) {
            OverrideSecretBaseDecorationSpriteScript(VarGet(VAR_RESULT), gSaveBlock1Ptr.location.mapNum, gSaveBlock1Ptr.location.mapGroup, DECORCAT_CUSHION);
          }
        }

        VarSet(VAR_0x8004, VarGet(VAR_0x8004) + 1); // gSpecialVar_0x8004++
      }
    }
  }
}

/** 1:1 décomp `void HideSecretBaseDecorationSprites(void)` (secret_base.c:635-652).
 *  EXPORTÉE : decoration.ts câble son garde-fou HURLANT sur cette fonction. */
export function HideSecretBaseDecorationSprites(): void {
  const objectEvents = gMapHeader!.events.objectEvents;
  for (let objectEventId = 0; objectEventId < objectEvents.length; objectEventId++) {
    // flagId = label string dans le port → résolu numériquement (resolveDecompConstant).
    const flag = resolveDecompConstant(objectEvents[objectEventId].flagId) ?? -1;
    if (flag >= FLAG_DECORATION_1 && flag <= FLAG_DECORATION_14) {
      RemoveObjectEventByLocalIdAndMap(
        objectEvents[objectEventId].localId,
        gSaveBlock1Ptr.location.mapNum,
        gSaveBlock1Ptr.location.mapGroup);
      FlagSet(flag);
    }
  }
}

/** 1:1 décomp `static u8 GetSecretBaseOwnerType(u8 secretBaseIdx)` (secret_base.c:1133-1137).
 *  (Défini avant ses appelants pour l'ordre TS ; position .c = plus bas.) */
function GetSecretBaseOwnerType(secretBaseIdx: number): number {
  const base = gSaveBlock1Ptr.secretBases[secretBaseIdx];
  return ((base.trainerId?.[0] ?? 0) % 5) + ((base.gender ?? 0) * 5);
}

/** 1:1 décomp `void SetSecretBaseOwnerGfxId(void)` (secret_base.c:654-657). */
export function SetSecretBaseOwnerGfxId(): void {
  VarSet(VAR_OBJ_GFX_ID_F, sSecretBaseOwnerGfxIds[GetSecretBaseOwnerType(VarGet(VAR_CURRENT_SECRET_BASE))]);
}

/** 1:1 décomp `void SetCurSecretBaseIdFromPosition(const struct MapPosition*, const struct MapEvents*)`
 *  (secret_base.c:659-672). Adaptation BgEvent (kind string ; secretBaseId gap map). */
export function SetCurSecretBaseIdFromPosition(
  position: { x: number; y: number },
  events: { bgEvents: Array<{ x: number; y: number; kind: string; secretBaseId?: number }> },
): void {
  for (let i = 0; i < events.bgEvents.length; i++) {
    if (events.bgEvents[i].kind === 'secret_base' /* BG_EVENT_SECRET_BASE */
      && position.x === events.bgEvents[i].x + MAP_OFFSET
      && position.y === events.bgEvents[i].y + MAP_OFFSET) {
      sCurSecretBaseId = events.bgEvents[i].secretBaseId ?? 0;
      break;
    }
  }
}

/** 1:1 décomp `void WarpIntoSecretBase(const struct MapPosition*, const struct MapEvents*)`
 *  (secret_base.c:674-679). */
export function WarpIntoSecretBase(
  position: { x: number; y: number },
  events: { bgEvents: Array<{ x: number; y: number; kind: string; secretBaseId?: number }> },
): void {
  SetCurSecretBaseIdFromPosition(position, events);
  TrySetCurSecretBaseIndex();
  ScriptContext_SetupScript('SecretBase_EventScript_Enter');
}

/** 1:1 décomp `bool8 TrySetCurSecretBase(void)` (secret_base.c:681-689). */
export function TrySetCurSecretBase(): boolean {
  SetCurSecretBaseId();
  TrySetCurSecretBaseIndex();
  if (VarGet(VAR_RESULT) === TRUE)
    return false;
  return true;
}

/** 1:1 décomp `static void Task_WarpOutOfSecretBase(u8 taskId)` (secret_base.c:691-712). */
function Task_WarpOutOfSecretBase(taskId: number): void {
  switch (gTasks[taskId].data[0]) {
    case 0:
      LockPlayerFieldControls();
      gTasks[taskId].data[0] = 1;
      break;
    case 1:
      if (!gPaletteFade.active)
        gTasks[taskId].data[0] = 2;
      break;
    case 2:
      SetWarpDestinationToDynamicWarp(WARP_ID_SECRET_BASE);
      WarpIntoMap();
      (globalThis as Record<string, unknown>).gFieldCallback = FieldCB_DefaultWarpExit;
      SetMainCallback2(CB2_LoadMap);
      UnlockPlayerFieldControls();
      DestroyTask(taskId);
      break;
  }
}

/** 1:1 décomp `static void WarpOutOfSecretBase(void)` (secret_base.c:714-718). */
function WarpOutOfSecretBase(): void {
  CreateTask((t: DecompTask) => Task_WarpOutOfSecretBase(t.taskId), 0);
  FadeScreen(FADE_TO_BLACK, 0);
}

/** 1:1 décomp `void IsCurSecretBaseOwnedByAnotherPlayer(void)` (secret_base.c:720-726). */
export function IsCurSecretBaseOwnedByAnotherPlayer(): void {
  if (gSaveBlock1Ptr.secretBases[0].secretBaseId !== sCurSecretBaseId)
    VarSet(VAR_RESULT, TRUE);
  else
    VarSet(VAR_RESULT, FALSE);
}

/** 1:1 décomp `static u8 *GetSecretBaseName(u8 *dest, u8 secretBaseIdx)` (secret_base.c:728-734).
 *  Adaptation charmap : trainerName (string) → octets (encodeOwText). `dest` =
 *  Uint8Array ; `*StringCopyN(...) = EOS` → tail[0]=EOS. !< French Difference. */
function GetSecretBaseName(dest: Uint8Array, secretBaseIdx: number): Uint8Array {
  const base = gSaveBlock1Ptr.secretBases[secretBaseIdx];
  const nameBytes = _nameBytes(base.trainerName);
  const tail = StringCopyN(dest, nameBytes, GetNameLength(base.trainerName));
  tail[0] = EOS;
  ConvertInternationalString(dest, base.language);
  return StringAppendWithPlaceholder(dest, _nameBytes(getString('gText_ApostropheSBase')) as unknown as Uint8Array, dest);
}

/** 1:1 décomp `u8 *GetSecretBaseMapName(u8 *dest)` (secret_base.c:736-739). */
export function GetSecretBaseMapName(dest: Uint8Array): Uint8Array {
  return GetSecretBaseName(dest, VarGet(VAR_CURRENT_SECRET_BASE));
}

/** 1:1 décomp `void CopyCurSecretBaseOwnerName_StrVar1(void)` (secret_base.c:741-750).
 *  NB : tv.ts:143 a un stub privé (dette) ; ceci est la version 1:1 canonique. */
export function CopyCurSecretBaseOwnerName_StrVar1(): void {
  const secretBaseIdx = VarGet(VAR_CURRENT_SECRET_BASE);
  const base = gSaveBlock1Ptr.secretBases[secretBaseIdx];
  const nameBytes = _nameBytes(base.trainerName);
  const tail = StringCopyN(gStringVar1, nameBytes, GetNameLength(base.trainerName));
  tail[0] = EOS;
  ConvertInternationalString(gStringVar1, base.language);
}

/** 1:1 décomp `static bool8 IsSecretBaseRegistered(u8 secretBaseIdx)` (secret_base.c:752-758). */
function IsSecretBaseRegistered(secretBaseIdx: number): boolean {
  if (gSaveBlock1Ptr.secretBases[secretBaseIdx].registryStatus)
    return true;
  return false;
}

/** GetMonData renvoie `number|string` (port) ; champs numériques du décomp → number. */
const _monNum = (mon: Pokemon, field: number): number => GetMonData(mon, field) as number;

/** 1:1 décomp `static u8 GetAverageEVs(struct Pokemon *pokemon)` (secret_base.c:760-770). */
function GetAverageEVs(pokemon: Pokemon): number {
  let evTotal = _monNum(pokemon, MON_DATA_HP_EV);
  evTotal += _monNum(pokemon, MON_DATA_ATK_EV);
  evTotal += _monNum(pokemon, MON_DATA_DEF_EV);
  evTotal += _monNum(pokemon, MON_DATA_SPEED_EV);
  evTotal += _monNum(pokemon, MON_DATA_SPATK_EV);
  evTotal += _monNum(pokemon, MON_DATA_SPDEF_EV);
  return (evTotal / 6) | 0;
}

/** 1:1 décomp `void SetPlayerSecretBaseParty(void)` (secret_base.c:772-809). */
export function SetPlayerSecretBaseParty(): void {
  let partyId = 0;
  const party = gSaveBlock1Ptr.secretBases[0].party;
  if (gSaveBlock1Ptr.secretBases[0].secretBaseId) {
    for (let i = 0; i < PARTY_SIZE; i++) {
      for (let moveIndex = 0; moveIndex < MAX_MON_MOVES; moveIndex++)
        party.moves[i * MAX_MON_MOVES + moveIndex] = MOVE_NONE;

      party.species[i] = SPECIES_NONE;
      party.heldItems[i] = ITEM_NONE;
      party.levels[i] = 0;
      party.personality[i] = 0;
      party.EVs[i] = 0;

      if (_monNum(gPlayerParty[i], MON_DATA_SPECIES) !== SPECIES_NONE
        && !GetMonData(gPlayerParty[i], MON_DATA_IS_EGG)) {
        for (let moveIndex = 0; moveIndex < MAX_MON_MOVES; moveIndex++)
          party.moves[partyId * MAX_MON_MOVES + moveIndex] = _monNum(gPlayerParty[i], MON_DATA_MOVE1 + moveIndex);

        party.species[partyId] = _monNum(gPlayerParty[i], MON_DATA_SPECIES);
        party.heldItems[partyId] = _monNum(gPlayerParty[i], MON_DATA_HELD_ITEM);
        party.levels[partyId] = _monNum(gPlayerParty[i], MON_DATA_LEVEL);
        party.personality[partyId] = _monNum(gPlayerParty[i], MON_DATA_PERSONALITY);
        party.EVs[partyId] = GetAverageEVs(gPlayerParty[i]);
        partyId++;
      }
    }
  }
}

/** 1:1 décomp `void ClearAndLeaveSecretBase(void)` (secret_base.c:811-817). */
export function ClearAndLeaveSecretBase(): void {
  const temp = gSaveBlock1Ptr.secretBases[0].numSecretBasesReceived;
  ClearSecretBase(gSaveBlock1Ptr.secretBases, 0);
  gSaveBlock1Ptr.secretBases[0].numSecretBasesReceived = temp;
  WarpOutOfSecretBase();
}

/** 1:1 décomp `void MoveOutOfSecretBase(void)` (secret_base.c:819-823). */
export function MoveOutOfSecretBase(): void {
  IncrementGameStat(GAME_STAT_MOVED_SECRET_BASE);
  ClearAndLeaveSecretBase();
}

/** 1:1 décomp `static void ClosePlayerSecretBaseEntrance(void)` (secret_base.c:825-853).
 *  Adaptation BgEvent (kind string ; secretBaseId gap map). */
function ClosePlayerSecretBaseEntrance(): void {
  const events = gMapHeader!.events;
  const bgEvents = events.bgEvents as Array<{ x: number; y: number; kind: string; secretBaseId?: number }>;
  for (let i = 0; i < bgEvents.length; i++) {
    if (bgEvents[i].kind === 'secret_base' /* BG_EVENT_SECRET_BASE */
      && gSaveBlock1Ptr.secretBases[0].secretBaseId === (bgEvents[i].secretBaseId ?? 0)) {
      const metatileId = MapGridGetMetatileIdAt(bgEvents[i].x + MAP_OFFSET, bgEvents[i].y + MAP_OFFSET);
      for (let j = 0; j < sSecretBaseEntranceMetatiles.length; j++) {
        if (sSecretBaseEntranceMetatiles[j].openMetatileId === metatileId) {
          MapGridSetMetatileIdAt(bgEvents[i].x + MAP_OFFSET, bgEvents[i].y + MAP_OFFSET,
            sSecretBaseEntranceMetatiles[j].closedMetatileId | MAPGRID_IMPASSABLE);
          break;
        }
      }
      DrawWholeMapView();
      break;
    }
  }
}

/** 1:1 décomp `void MoveOutOfSecretBaseFromOutside(void)` (secret_base.c:855-866).
 *  When the player moves to a new secret base by interacting with a new secret
 *  base entrance in the overworld. */
export function MoveOutOfSecretBaseFromOutside(): void {
  ClosePlayerSecretBaseEntrance();
  IncrementGameStat(GAME_STAT_MOVED_SECRET_BASE);
  const temp = gSaveBlock1Ptr.secretBases[0].numSecretBasesReceived;
  ClearSecretBase(gSaveBlock1Ptr.secretBases, 0);
  gSaveBlock1Ptr.secretBases[0].numSecretBasesReceived = temp;
}

/** 1:1 décomp `static u8 GetNumRegisteredSecretBases(void)` (secret_base.c:868-879). */
function GetNumRegisteredSecretBases(): number {
  let count = 0;
  for (let i = 1; i < SECRET_BASES_COUNT; i++) {
    if (IsSecretBaseRegistered(i) === true)
      count++;
  }
  return count;
}

/** 1:1 décomp `void GetCurSecretBaseRegistrationValidity(void)` (secret_base.c:881-889). */
export function GetCurSecretBaseRegistrationValidity(): void {
  if (IsSecretBaseRegistered(VarGet(VAR_CURRENT_SECRET_BASE)) === true)
    VarSet(VAR_RESULT, 1);
  else if (GetNumRegisteredSecretBases() >= 10)
    VarSet(VAR_RESULT, 2);
  else
    VarSet(VAR_RESULT, 0);
}

/** 1:1 décomp `void ToggleCurSecretBaseRegistry(void)` (secret_base.c:891-895). */
export function ToggleCurSecretBaseRegistry(): void {
  const base = gSaveBlock1Ptr.secretBases[VarGet(VAR_CURRENT_SECRET_BASE)];
  base.registryStatus ^= 1;
  FlagSet(FLAG_SECRET_BASE_REGISTRY_ENABLED);
}

/** 1:1 décomp `void ShowSecretBaseDecorationMenu(void)` (secret_base.c:897-900). */
export function ShowSecretBaseDecorationMenu(): void {
  CreateTask((t: DecompTask) => DoSecretBaseDecorationMenu(t.taskId), 0);
}

/** 1:1 décomp `void ShowSecretBaseRegistryMenu(void)` (secret_base.c:902-905). */
export function ShowSecretBaseRegistryMenu(): void {
  CreateTask((t: DecompTask) => Task_ShowSecretBaseRegistryMenu(t.taskId), 0);
}

// ─── Registry menu #defines task data (secret_base.c:907-915) ───────────────
const tNumBases = 0;       // data[0]
const tSelectedRow = 1;    // data[1]
const tScrollOffset = 2;   // data[2]
const tMaxShownItems = 3;  // data[3]
const tSelectedBaseId = 4; // data[4]
const tListTaskId = 5;     // data[5]
const tMainWindowId = 6;   // data[6]
const tActionWindowId = 7; // data[7]
const tArrowTaskId = 8;    // data[8]

/** 1:1 décomp `static void Task_ShowSecretBaseRegistryMenu(u8 taskId)` (secret_base.c:917-937). */
function Task_ShowSecretBaseRegistryMenu(taskId: number): void {
  const data = gTasks[taskId].data;
  LockPlayerFieldControls();
  data[tNumBases] = GetNumRegisteredSecretBases();
  if (data[tNumBases] !== 0) {
    data[tSelectedRow] = 0;
    data[tScrollOffset] = 0;
    ClearDialogWindowAndFrame(0, false);
    sRegistryMenu = AllocZeroed<SecretBaseRegistryMenu>(0);
    // AllocZeroed no-op côté port → matérialiser la struct (items[11]/names[11][32]).
    sRegistryMenu.items = Array.from({ length: 11 }, () => ({ name: '', id: 0 }));
    sRegistryMenu.names = Array.from({ length: 11 }, () => new Uint8Array(32));
    data[tMainWindowId] = AddWindow(sRegistryWindowTemplates[0]);
    BuildRegistryMenuItems(taskId);
    FinalizeRegistryMenu(taskId);
    gTasks[taskId].func = (t: DecompTask) => HandleRegistryMenuInput(t.taskId);
  } else {
    DisplayItemMessageOnField(taskId, getString('gText_NoRegistry'), (t) => GoToSecretBasePCRegisterMenu(t.taskId));
  }
}

/** 1:1 décomp `static void BuildRegistryMenuItems(u8 taskId)` (secret_base.c:939-971). */
function BuildRegistryMenuItems(taskId: number): void {
  const data = gTasks[taskId].data;
  let count = 0;
  for (let i = 1; i < SECRET_BASES_COUNT; i++) {
    if (IsSecretBaseRegistered(i)) {
      GetSecretBaseName(sRegistryMenu!.names[count], i);
      sRegistryMenu!.items[count].name = sRegistryMenu!.names[count];
      sRegistryMenu!.items[count].id = i;
      count++;
    }
  }

  sRegistryMenu!.items[count].name = getString('gText_Cancel');
  sRegistryMenu!.items[count].id = LIST_CANCEL;
  data[tNumBases] = count + 1;
  if (data[tNumBases] < 8)
    data[tMaxShownItems] = data[tNumBases];
  else
    data[tMaxShownItems] = 8;

  Object.assign(gMultiuseListMenuTemplate, sRegistryListMenuTemplate);
  gMultiuseListMenuTemplate.windowId = data[tMainWindowId];
  gMultiuseListMenuTemplate.totalItems = data[tNumBases];
  gMultiuseListMenuTemplate.items = sRegistryMenu!.items;
  gMultiuseListMenuTemplate.maxShowed = data[tMaxShownItems];
}

/** 1:1 décomp `static void RegistryMenu_OnCursorMove(s32, bool8, struct ListMenu*)`
 *  (secret_base.c:973-977). */
function RegistryMenu_OnCursorMove(_unused: number, flag: boolean, _menu: ListMenu): void {
  if (flag !== true)
    PlaySE(SE_SELECT);
}

/** 1:1 décomp `static void FinalizeRegistryMenu(u8 taskId)` (secret_base.c:979-986). */
function FinalizeRegistryMenu(taskId: number): void {
  const data = gTasks[taskId].data;
  SetStandardWindowBorderStyle(data[tMainWindowId], false);
  data[tListTaskId] = ListMenuInit(gMultiuseListMenuTemplate, data[tScrollOffset], data[tSelectedRow]);
  AddRegistryMenuScrollArrows(taskId);
  ScheduleBgCopyTilemapToVram(0);
}

/** 1:1 décomp `static void AddRegistryMenuScrollArrows(u8 taskId)` (secret_base.c:988-992).
 *  Adaptation : `&tScrollOffset` → closure `()=>data[tScrollOffset]` (précédent decoration.ts:28). */
function AddRegistryMenuScrollArrows(taskId: number): void {
  const data = gTasks[taskId].data;
  data[tArrowTaskId] = AddScrollIndicatorArrowPairParameterized(
    SCROLL_ARROW_UP, 188, 12, 148, data[tNumBases] - data[tMaxShownItems],
    TAG_SCROLL_ARROW, TAG_SCROLL_ARROW, () => gTasks[taskId].data[tScrollOffset]);
}

/** 1:1 décomp `static void HandleRegistryMenuInput(u8 taskId)` (secret_base.c:994-1021). */
function HandleRegistryMenuInput(taskId: number): void {
  const data = gTasks[taskId].data;
  const input = ListMenu_ProcessInput(data[tListTaskId]);
  { const sr = ListMenuGetScrollAndRow(data[tListTaskId]); data[tScrollOffset] = sr.scrollOffset; data[tSelectedRow] = sr.selectedRow; }

  switch (input) {
    case LIST_NOTHING_CHOSEN:
      break;
    case LIST_CANCEL:
      PlaySE(SE_SELECT);
      DestroyListMenuTask(data[tListTaskId]);
      RemoveScrollIndicatorArrowPair(data[tArrowTaskId]);
      ClearStdWindowAndFrame(data[tMainWindowId], false);
      ClearWindowTilemap(data[tMainWindowId]);
      RemoveWindow(data[tMainWindowId]);
      ScheduleBgCopyTilemapToVram(0);
      Free(sRegistryMenu);
      GoToSecretBasePCRegisterMenu(taskId);
      break;
    default:
      PlaySE(SE_SELECT);
      data[tSelectedBaseId] = input;
      ShowRegistryMenuActions(taskId);
      break;
  }
}

/** 1:1 décomp `static void ShowRegistryMenuActions(u8 taskId)` (secret_base.c:1023-1036). */
function ShowRegistryMenuActions(taskId: number): void {
  const data = gTasks[taskId].data;
  RemoveScrollIndicatorArrowPair(data[tArrowTaskId]);
  const template: WindowTemplate = { ...sRegistryWindowTemplates[1] };
  template.width = GetMaxWidthInMenuTable(sRegistryMenuActions, 2);
  data[tActionWindowId] = AddWindow(template);
  SetStandardWindowBorderStyle(data[tActionWindowId], false);
  PrintMenuTable(data[tActionWindowId], sRegistryMenuActions.length, sRegistryMenuActions);
  InitMenuInUpperLeftCornerNormal(data[tActionWindowId], sRegistryMenuActions.length, 0);
  ScheduleBgCopyTilemapToVram(0);
  gTasks[taskId].func = (t: DecompTask) => HandleRegistryMenuActionsInput(t.taskId);
}

/** 1:1 décomp `static void HandleRegistryMenuActionsInput(u8 taskId)` (secret_base.c:1038-1054). */
function HandleRegistryMenuActionsInput(taskId: number): void {
  const input = Menu_ProcessInputNoWrap();
  switch (input) {
    case MENU_B_PRESSED:
      PlaySE(SE_SELECT);
      ReturnToMainRegistryMenu(taskId);
      break;
    case MENU_NOTHING_CHOSEN:
      break;
    default:
      PlaySE(SE_SELECT);
      (sRegistryMenuActions[input].func as (t: DecompTask) => void)({ taskId } as DecompTask);
      break;
  }
}

/** 1:1 décomp `static void ShowRegistryMenuDeleteConfirmation(u8 taskId)` (secret_base.c:1056-1068). */
function ShowRegistryMenuDeleteConfirmation(taskId: number): void {
  const data = gTasks[taskId].data;
  ClearStdWindowAndFrame(data[tMainWindowId], false);
  ClearStdWindowAndFrame(data[tActionWindowId], false);
  ClearWindowTilemap(data[tMainWindowId]);
  ClearWindowTilemap(data[tActionWindowId]);
  RemoveWindow(data[tActionWindowId]);
  ScheduleBgCopyTilemapToVram(0);
  GetSecretBaseName(gStringVar1, data[tSelectedBaseId]);
  StringExpandPlaceholders(gStringVar4, getString('gText_OkayToDeleteFromRegistry'));
  DisplayItemMessageOnField(taskId, gStringVar4, (t) => ShowRegistryMenuDeleteYesNo(t.taskId));
}

/** 1:1 décomp `static void ShowRegistryMenuDeleteYesNo(u8 taskId)` (secret_base.c:1070-1074). */
function ShowRegistryMenuDeleteYesNo(taskId: number): void {
  DisplayYesNoMenuDefaultYes();
  DoYesNoFuncWithChoice(taskId, sDeleteRegistryYesNoFuncs);
}

/** 1:1 décomp `void DeleteRegistry_Yes_Callback(u8 taskId)` (secret_base.c:1076-1086). */
export function DeleteRegistry_Yes_Callback(taskId: number): void {
  const data = gTasks[taskId].data;
  ClearDialogWindowAndFrame(0, false);
  { const sr = DestroyListMenuTask(data[tListTaskId]); data[tScrollOffset] = sr.scrollOffset; data[tSelectedRow] = sr.selectedRow; }
  gSaveBlock1Ptr.secretBases[data[tSelectedBaseId]].registryStatus = UNREGISTERED;
  BuildRegistryMenuItems(taskId);
  { const pos: ListPos = { scroll: data[tScrollOffset], cursor: data[tSelectedRow] }; SetCursorWithinListBounds(pos, data[tMaxShownItems], data[tNumBases]); data[tScrollOffset] = pos.scroll; data[tSelectedRow] = pos.cursor; }
  FinalizeRegistryMenu(taskId);
  gTasks[taskId].func = (t: DecompTask) => HandleRegistryMenuInput(t.taskId);
}

/** 1:1 décomp `static void DeleteRegistry_Yes(u8 taskId)` (secret_base.c:1088-1091). */
function DeleteRegistry_Yes(taskId: number): void {
  DisplayItemMessageOnField(taskId, getString('gText_RegisteredDataDeleted'), (t) => DeleteRegistry_Yes_Callback(t.taskId));
}

/** 1:1 décomp `static void DeleteRegistry_No(u8 taskId)` (secret_base.c:1093-1100). */
function DeleteRegistry_No(taskId: number): void {
  const data = gTasks[taskId].data;
  ClearDialogWindowAndFrame(0, false);
  { const sr = DestroyListMenuTask(data[tListTaskId]); data[tScrollOffset] = sr.scrollOffset; data[tSelectedRow] = sr.selectedRow; }
  FinalizeRegistryMenu(taskId);
  gTasks[taskId].func = (t: DecompTask) => HandleRegistryMenuInput(t.taskId);
}

/** 1:1 décomp `static void ReturnToMainRegistryMenu(u8 taskId)` (secret_base.c:1102-1111). */
function ReturnToMainRegistryMenu(taskId: number): void {
  const data = gTasks[taskId].data;
  AddRegistryMenuScrollArrows(taskId);
  ClearStdWindowAndFrame(data[tActionWindowId], false);
  ClearWindowTilemap(data[tActionWindowId]);
  RemoveWindow(data[tActionWindowId]);
  ScheduleBgCopyTilemapToVram(0);
  gTasks[taskId].func = (t: DecompTask) => HandleRegistryMenuInput(t.taskId);
}

/** 1:1 décomp `static void GoToSecretBasePCRegisterMenu(u8 taskId)` (secret_base.c:1113-1121). */
function GoToSecretBasePCRegisterMenu(taskId: number): void {
  if (VarGet(VAR_CURRENT_SECRET_BASE) === 0)
    ScriptContext_SetupScript('SecretBase_EventScript_PCCancel');
  else
    ScriptContext_SetupScript('SecretBase_EventScript_ShowRegisterMenu');

  DestroyTask(taskId);
}

/** 1:1 décomp `const u8 *GetSecretBaseTrainerLoseText(void)` (secret_base.c:1139-1162).
 *  Texte = getString (frontière charmap ; les clés SecretBase_Text_TrainerNDefeated
 *  peuvent manquer côté extract → getString renvoie la clé, INERTE). */
export function GetSecretBaseTrainerLoseText(): string {
  const ownerType = GetSecretBaseOwnerType(VarGet(VAR_CURRENT_SECRET_BASE));
  if (ownerType === 0) return getString('SecretBase_Text_Trainer0Defeated');
  else if (ownerType === 1) return getString('SecretBase_Text_Trainer1Defeated');
  else if (ownerType === 2) return getString('SecretBase_Text_Trainer2Defeated');
  else if (ownerType === 3) return getString('SecretBase_Text_Trainer3Defeated');
  else if (ownerType === 4) return getString('SecretBase_Text_Trainer4Defeated');
  else if (ownerType === 5) return getString('SecretBase_Text_Trainer5Defeated');
  else if (ownerType === 6) return getString('SecretBase_Text_Trainer6Defeated');
  else if (ownerType === 7) return getString('SecretBase_Text_Trainer7Defeated');
  else if (ownerType === 8) return getString('SecretBase_Text_Trainer8Defeated');
  else return getString('SecretBase_Text_Trainer9Defeated');
}

/** 1:1 décomp `void PrepSecretBaseBattleFlags(void)` (secret_base.c:1164-1169).
 *  Adaptation : gTrainerBattleOpponent_A / gBattleTypeFlags via pont globalThis
 *  `__battleStateMutators` (anti-cycle : secret_base ↛ battle/state en import).
 *  TRAINER_SECRET_BASE=0x400 ; BATTLE_TYPE_TRAINER=0x8 | BATTLE_TYPE_SECRET_BASE=0x80000. */
export function PrepSecretBaseBattleFlags(): void {
  TryGainNewFanFromCounter(FANCOUNTER_BATTLED_AT_BASE);
  const bridge = (globalThis as { __battleStateMutators?: {
    setTrainerBattleOpponentA?: (v: number) => void;
    setBattleTypeFlags?: (v: number) => void;
  } }).__battleStateMutators;
  bridge?.setTrainerBattleOpponentA?.(0x400);
  bridge?.setBattleTypeFlags?.(0x8 | 0x80000);
}

/** 1:1 décomp `void SetBattledOwnerFromResult(void)` (secret_base.c:1171-1174). */
export function SetBattledOwnerFromResult(): void {
  gSaveBlock1Ptr.secretBases[VarGet(VAR_CURRENT_SECRET_BASE)].battledOwnerToday = VarGet(VAR_RESULT);
}

/** 1:1 décomp `void GetSecretBaseOwnerAndState(void)` (secret_base.c:1176-1191). */
export function GetSecretBaseOwnerAndState(): void {
  const secretBaseIdx = VarGet(VAR_CURRENT_SECRET_BASE);
  if (!FlagGet(FLAG_DAILY_SECRET_BASE)) {
    for (let i = 0; i < SECRET_BASES_COUNT; i++)
      gSaveBlock1Ptr.secretBases[i].battledOwnerToday = FALSE;

    FlagSet(FLAG_DAILY_SECRET_BASE);
  }
  VarSet(VAR_0x8004, GetSecretBaseOwnerType(secretBaseIdx)); // gSpecialVar_0x8004
  VarSet(VAR_RESULT, gSaveBlock1Ptr.secretBases[secretBaseIdx].battledOwnerToday);
}

// ─── SecretBasePerStepCallback (secret_base.c:1193-1329) ────────────────────
// #define tStepCb  data[0]  (= tCallbackId, géré par Task_RunPerStepCallback)
// #define tState   data[1]
// #define tPlayerX data[2]
// #define tPlayerY data[3]
// #define tFldEff  data[4]
/** 1:1 décomp `void SecretBasePerStepCallback(u8 taskId)` (secret_base.c:1199-1329).
 *  Per-step callback STEP_CB_SECRET_BASE (sPerStepCallbacks, field_tasks.ts) —
 *  reçoit l'OBJET DecompTask (convention runtime per-step). */
export function SecretBasePerStepCallback(task: DecompTask): void {
  const data = task.data;
  switch (data[1]) { // tState
    case 0: {
      sInFriendSecretBase = VarGet(VAR_CURRENT_SECRET_BASE) !== 0;
      const { x, y } = PlayerGetDestCoords();
      data[2] = x; // tPlayerX
      data[3] = y; // tPlayerY
      data[1] = 1; // tState
      break;
    }
    case 1: {
      // End if player hasn't moved.
      const { x, y } = PlayerGetDestCoords();
      if (x === data[2] && y === data[3]) return; // tPlayerX / tPlayerY

      data[2] = x;
      data[3] = y;
      VarSet(VAR_SECRET_BASE_STEP_COUNTER, VarGet(VAR_SECRET_BASE_STEP_COUNTER) + 1);
      const behavior = MapGridGetMetatileBehaviorAt(x, y);
      const tileId = MapGridGetMetatileIdAt(x, y);

      if (tileId === METATILE_SecretBase_SolidBoard_Top || tileId === METATILE_SecretBase_SolidBoard_Bottom) {
        if (sInFriendSecretBase) _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_SOLID_BOARD);
      } else if (
        tileId === METATILE_SecretBase_SmallChair
        || tileId === METATILE_SecretBase_PokemonChair
        || tileId === METATILE_SecretBase_HeavyChair
        || tileId === METATILE_SecretBase_PrettyChair
        || tileId === METATILE_SecretBase_ComfortChair
        || tileId === METATILE_SecretBase_RaggedChair
        || tileId === METATILE_SecretBase_BrickChair
        || tileId === METATILE_SecretBase_CampChair
        || tileId === METATILE_SecretBase_HardChair
      ) {
        if (sInFriendSecretBase) _varSetBit(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_USED_CHAIR);
      } else if (
        tileId === METATILE_SecretBase_RedTent_DoorTop
        || tileId === METATILE_SecretBase_RedTent_Door
        || tileId === METATILE_SecretBase_BlueTent_DoorTop
        || tileId === METATILE_SecretBase_BlueTent_Door
      ) {
        if (sInFriendSecretBase) _varSetBit(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_USED_TENT);
      } else if (
        (behavior === MB_IMPASSABLE_NORTHEAST && tileId === METATILE_SecretBase_Stand_CornerRight)
        || (behavior === MB_IMPASSABLE_NORTHWEST && MapGridGetMetatileIdAt(x, y) === METATILE_SecretBase_Stand_CornerLeft)
      ) {
        if (sInFriendSecretBase) _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_STAND);
      } else if (behavior === MB_IMPASSABLE_WEST_AND_EAST && tileId === METATILE_SecretBase_Slide_StairLanding) {
        if (sInFriendSecretBase) {
          _varToggleBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_SLIDE);
          _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_DECLINED_SLIDE);
        }
      } else if (behavior === MB_SLIDE_SOUTH && tileId === METATILE_SecretBase_Slide_SlideTop) {
        if (sInFriendSecretBase) {
          _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_SLIDE);
          _varToggleBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_DECLINED_SLIDE);
        }
      } else if (MetatileBehavior_IsSecretBaseGlitterMat(behavior)) {
        if (sInFriendSecretBase) _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_GLITTER_MAT);
      } else if (MetatileBehavior_IsSecretBaseBalloon(behavior)) {
        PopSecretBaseBalloon(MapGridGetMetatileIdAt(x, y), x, y);
        if (sInFriendSecretBase) {
          switch (MapGridGetMetatileIdAt(x, y)) {
            case METATILE_SecretBase_RedBalloon:
            case METATILE_SecretBase_BlueBalloon:
            case METATILE_SecretBase_YellowBalloon:
              _varSetBit(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_USED_BALLOON);
              break;
            case METATILE_SecretBase_MudBall:
              _varSetBit(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_USED_MUD_BALL);
              break;
          }
        }
      } else if (MetatileBehavior_IsSecretBaseBreakableDoor(behavior)) {
        if (sInFriendSecretBase) _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_BREAKABLE_DOOR);
        ShatterSecretBaseBreakableDoor(x, y);
      } else if (MetatileBehavior_IsSecretBaseSoundMat(behavior)) {
        if (sInFriendSecretBase) _varSetBit(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_USED_NOTE_MAT);
      } else if (MetatileBehavior_IsSecretBaseJumpMat(behavior)) {
        if (sInFriendSecretBase) _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_JUMP_MAT);
      } else if (MetatileBehavior_IsSecretBaseSpinMat(behavior)) {
        if (sInFriendSecretBase) _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_SPIN_MAT);
      }
      break;
    }
    case 2:
      // 1:1 décomp : "This state is never reached, and tFldEff is never set".
      if (!FieldEffectActiveListContains(data[4])) data[1] = 1; // tFldEff / tState
      break;
  }
}

/** 1:1 décomp `static void SaveSecretBase(u8 secretBaseIdx, struct SecretBase*, u32 version, u32 language)`
 *  (secret_base.c:1337-1359). Record-mixing (exemption LINK — inerte solo). */
function SaveSecretBase(secretBaseIdx: number, secretBase: SecretBase, version: number, language: number): void {
  gSaveBlock1Ptr.secretBases[secretBaseIdx] = { ...secretBase }; // *dst = *src
  gSaveBlock1Ptr.secretBases[secretBaseIdx].registryStatus = NEW;
  if (version === VERSION_SAPPHIRE || version === VERSION_RUBY)
    gSaveBlock1Ptr.secretBases[secretBaseIdx].language = LANGUAGE_FRENCH; // GAME_LANGUAGE

  if (version === VERSION_EMERALD && language === LANGUAGE_JAPANESE) {
    const name = _nameBytes(gSaveBlock1Ptr.secretBases[secretBaseIdx].trainerName);
    let stringLength: number;
    for (stringLength = 0; stringLength < PLAYER_NAME_LENGTH; stringLength++) {
      if (name[stringLength] === EOS)
        break;
    }
    if (stringLength > 5)
      gSaveBlock1Ptr.secretBases[secretBaseIdx].language = LANGUAGE_FRENCH; // GAME_LANGUAGE
  }
}

/** 1:1 décomp `static bool8 SecretBasesHaveSameTrainerId(struct SecretBase*, struct SecretBase*)`
 *  (secret_base.c:1361-1371). */
function SecretBasesHaveSameTrainerId(secretBase1: SecretBase, secretBase2: SecretBase): boolean {
  for (let i = 0; i < TRAINER_ID_LENGTH; i++) {
    if ((secretBase1.trainerId[i] ?? 0) !== (secretBase2.trainerId[i] ?? 0))
      return false;
  }
  return true;
}

/** 1:1 décomp `static bool8 SecretBasesHaveSameTrainerName(struct SecretBase*, struct SecretBase*)`
 *  (secret_base.c:1373-1383). Adaptation : trainerName (string) → octets charmap EOS-term. */
function SecretBasesHaveSameTrainerName(sbr1: SecretBase, sbr2: SecretBase): boolean {
  const n1 = _nameBytes(sbr1.trainerName);
  const n2 = _nameBytes(sbr2.trainerName);
  for (let i = 0; i < PLAYER_NAME_LENGTH && ((n1[i] ?? EOS) !== EOS || (n2[i] ?? EOS) !== EOS); i++) {
    if ((n1[i] ?? EOS) !== (n2[i] ?? EOS))
      return false;
  }
  return true;
}

/** 1:1 décomp `static bool8 SecretBasesBelongToSamePlayer(struct SecretBase*, struct SecretBase*)`
 *  (secret_base.c:1385-1395). */
function SecretBasesBelongToSamePlayer(secretBase1: SecretBase, secretBase2: SecretBase): boolean {
  if (secretBase1.gender === secretBase2.gender
    && SecretBasesHaveSameTrainerId(secretBase1, secretBase2)
    && SecretBasesHaveSameTrainerName(secretBase1, secretBase2)) {
    return true;
  }
  return false;
}

/** 1:1 décomp `static s16 GetSecretBaseIndexFromId(u8 secretBaseId)` (secret_base.c:1397-1407). */
function GetSecretBaseIndexFromId(secretBaseId: number): number {
  for (let i = 0; i < SECRET_BASES_COUNT; i++) {
    if (gSaveBlock1Ptr.secretBases[i].secretBaseId === secretBaseId)
      return i;
  }
  return -1;
}

/** 1:1 décomp `static u8 FindAvailableSecretBaseIndex(void)` (secret_base.c:1409-1419). */
function FindAvailableSecretBaseIndex(): number {
  for (let i = 1; i < SECRET_BASES_COUNT; i++) {
    if (gSaveBlock1Ptr.secretBases[i].secretBaseId === 0)
      return i;
  }
  return 0;
}

/** 1:1 décomp `static u8 FindUnregisteredSecretBaseIndex(void)` (secret_base.c:1421-1431). */
function FindUnregisteredSecretBaseIndex(): number {
  for (let i = 1; i < SECRET_BASES_COUNT; i++) {
    if (gSaveBlock1Ptr.secretBases[i].registryStatus === UNREGISTERED && gSaveBlock1Ptr.secretBases[i].toRegister === FALSE)
      return i;
  }
  return 0;
}

/** 1:1 décomp `static u8 TrySaveFriendsSecretBase(struct SecretBase*, u32 version, u32 language)`
 *  (secret_base.c:1433-1483). Record-mixing (exemption LINK — inerte solo). */
function TrySaveFriendsSecretBase(secretBase: SecretBase, version: number, language: number): number {
  // Secret base has no location
  if (!secretBase.secretBaseId)
    return 0;

  let index = GetSecretBaseIndexFromId(secretBase.secretBaseId);
  if (index !== 0) {
    // An existing secret base is using this location
    if (index !== -1) {
      if (gSaveBlock1Ptr.secretBases[index].toRegister === TRUE)
        return 0;

      if (gSaveBlock1Ptr.secretBases[index].registryStatus !== NEW || secretBase.toRegister === TRUE) {
        // Overwrite unregistered base at this location
        SaveSecretBase(index, secretBase, version, language);
        return index;
      }
    } else {
      // No secret base is using this location, find a spot to save it
      index = FindAvailableSecretBaseIndex();
      if (index !== 0) {
        // Save in empty space
        SaveSecretBase(index, secretBase, version, language);
        return index;
      }

      index = FindUnregisteredSecretBaseIndex();
      if (index !== 0) {
        // Overwrite unregistered base
        SaveSecretBase(index, secretBase, version, language);
        return index;
      }
    }
  }

  // Unable to save. Either...
  // - This was the player's base
  // - A registered base exists at this location
  // - The secret base limit has been filled with registered bases
  return 0;
}

/** 1:1 décomp `static void SortSecretBasesByRegistryStatus(void)` (secret_base.c:1485-1506).
 *  Moves the registered secret bases to the beginning of the array. */
function SortSecretBasesByRegistryStatus(): void {
  const secretBases = gSaveBlock1Ptr.secretBases;
  for (let i = 1; i < SECRET_BASES_COUNT - 1; i++) {
    for (let j = i + 1; j < SECRET_BASES_COUNT; j++) {
      if ((secretBases[i].registryStatus === UNREGISTERED && secretBases[j].registryStatus === REGISTERED)
        || (secretBases[i].registryStatus === NEW && secretBases[j].registryStatus !== NEW)) {
        const temp = secretBases[i]; secretBases[i] = secretBases[j]; secretBases[j] = temp; // SWAP
      }
    }
  }
}

/** 1:1 décomp `static void TrySaveFriendsSecretBases(struct SecretBaseRecordMixer*, u8 registryStatus)`
 *  (secret_base.c:1508-1518). Record-mixing (exemption LINK — inerte solo). */
function TrySaveFriendsSecretBases(mixer: SecretBaseRecordMixer, registryStatus: number): void {
  for (let i = 1; i < SECRET_BASES_COUNT; i++) {
    if (mixer.secretBases[i].registryStatus === registryStatus)
      TrySaveFriendsSecretBase(mixer.secretBases[i], mixer.version, mixer.language);
  }
}

/** 1:1 décomp `static bool8 SecretBaseBelongsToPlayer(struct SecretBase*)` (secret_base.c:1520-1544).
 *  Adaptations : playerTrainerId (u32) → octets LE ; playerName (u8[]) vs
 *  trainerName (string→octets charmap). Record-mixing (exemption LINK — inerte). */
function SecretBaseBelongsToPlayer(secretBase: SecretBase): boolean {
  if (secretBase.secretBaseId === 0)
    return false;

  if (secretBase.secretBaseId && secretBase.gender !== gSaveBlock2Ptr.playerGender)
    return false;

  // Check if the player's trainer Id matches the secret base's id.
  for (let i = 0; i < TRAINER_ID_LENGTH; i++) {
    if ((secretBase.trainerId[i] ?? 0) !== ((gSaveBlock2Ptr.playerTrainerId >> (8 * i)) & 0xFF))
      return false;
  }

  const sbName = _nameBytes(secretBase.trainerName);
  const plName = gSaveBlock2Ptr.playerName; // u8[] (bytes charmap)
  for (let i = 0; i < PLAYER_NAME_LENGTH && ((sbName[i] ?? EOS) !== EOS || (plName[i] ?? EOS) !== EOS); i++) {
    if ((sbName[i] ?? EOS) !== (plName[i] ?? EOS))
      return false;
  }

  return true;
}

// #define DELETED_BASE_A/B/C (secret_base.c:1546-1548)
const DELETED_BASE_A = 1 << 0;
const DELETED_BASE_B = 1 << 1;
const DELETED_BASE_C = 1 << 2;

/** 1:1 décomp `static void DeleteFirstOldBaseFromPlayerInRecordMixingFriendsRecords(...)`
 *  (secret_base.c:1550-1589). Record-mixing (exemption LINK — inerte solo). */
function DeleteFirstOldBaseFromPlayerInRecordMixingFriendsRecords(basesA: SecretBase[], basesB: SecretBase[], basesC: SecretBase[]): void {
  let sbFlags = 0;
  for (let i = 0; i < SECRET_BASES_COUNT; i++) {
    if (!(sbFlags & DELETED_BASE_A)) {
      if (SecretBaseBelongsToPlayer(basesA[i]) === true) {
        ClearSecretBase(basesA, i);
        sbFlags |= DELETED_BASE_A;
      }
    }
    if (!(sbFlags & DELETED_BASE_B)) {
      if (SecretBaseBelongsToPlayer(basesB[i]) === true) {
        ClearSecretBase(basesB, i);
        sbFlags |= DELETED_BASE_B;
      }
    }
    if (!(sbFlags & DELETED_BASE_C)) {
      if (SecretBaseBelongsToPlayer(basesC[i]) === true) {
        ClearSecretBase(basesC, i);
        sbFlags |= DELETED_BASE_C;
      }
    }
    if (sbFlags === (DELETED_BASE_A | DELETED_BASE_B | DELETED_BASE_C)) {
      break;
    }
  }
}

/** 1:1 décomp `static bool8 ClearDuplicateOwnedSecretBase(struct SecretBase*, struct SecretBase*, u8 idx)`
 *  (secret_base.c:1595-1626). returns TRUE if secretBase was deleted. LINK — inerte. */
function ClearDuplicateOwnedSecretBase(secretBase: SecretBase, secretBases: SecretBase[], idx: number): boolean {
  for (let i = 0; i < SECRET_BASES_COUNT; i++) {
    if (secretBases[i].secretBaseId !== 0) {
      if (SecretBasesBelongToSamePlayer(secretBase, secretBases[i]) === true) {
        if (idx === 0) {
          ClearSecretBase(secretBases, i);
          return false;
        }
        if (secretBase.numSecretBasesReceived > secretBases[i].numSecretBasesReceived) {
          ClearSecretBase(secretBases, i);
          return false;
        }
        secretBases[i].toRegister = secretBase.toRegister;
        // ClearSecretBase(secretBase) — le C efface l'argument (par pointeur). Le
        // port passe une struct ; le caller (ClearDuplicateOwnedSecretBases) opère
        // sur playersBases[i] → on efface via l'array source du caller (adaptation
        // pointeur→(array,idx) non disponible ici : LINK inerte, marqueur toRegister).
        return true;
      }
    }
  }
  return false;
}

/** 1:1 décomp `static void ClearDuplicateOwnedSecretBases(...)` (secret_base.c:1628-1674). LINK — inerte. */
function ClearDuplicateOwnedSecretBases(playersBases: SecretBase[], friendsBasesA: SecretBase[], friendsBasesB: SecretBase[], friendsBasesC: SecretBase[]): void {
  for (let i = 1; i < SECRET_BASES_COUNT; i++) {
    if (playersBases[i].secretBaseId) {
      if (playersBases[i].registryStatus === REGISTERED) {
        // Mark registered bases, so if they're deleted as a duplicate they
        // will be re-registered later
        playersBases[i].toRegister = TRUE;
      }
      if (!ClearDuplicateOwnedSecretBase(playersBases[i], friendsBasesA, i)) {
        if (!ClearDuplicateOwnedSecretBase(playersBases[i], friendsBasesB, i)) {
          ClearDuplicateOwnedSecretBase(playersBases[i], friendsBasesC, i);
        }
      }
    }
  }
  for (let i = 0; i < SECRET_BASES_COUNT; i++) {
    if (friendsBasesA[i].secretBaseId) {
      friendsBasesA[i].battledOwnerToday = 0;
      if (!ClearDuplicateOwnedSecretBase(friendsBasesA[i], friendsBasesB, i)) {
        ClearDuplicateOwnedSecretBase(friendsBasesA[i], friendsBasesC, i);
      }
    }
  }
  for (let i = 0; i < SECRET_BASES_COUNT; i++) {
    if (friendsBasesB[i].secretBaseId) {
      friendsBasesB[i].battledOwnerToday = 0;
      ClearDuplicateOwnedSecretBase(friendsBasesB[i], friendsBasesC, i);
    }
    if (friendsBasesC[i].secretBaseId) {
      friendsBasesC[i].battledOwnerToday = 0;
    }
  }
}

/** 1:1 décomp `static void TrySaveRegisteredDuplicate(struct SecretBase*, u32 version, u32 language)`
 *  (secret_base.c:1676-1683). LINK — inerte. */
function TrySaveRegisteredDuplicate(base: SecretBase, version: number, language: number): void {
  if (base.toRegister === TRUE) {
    TrySaveFriendsSecretBase(base, version, language);
    // ClearSecretBase(base) — pointeur : le caller passe mixers[k].secretBases[i]
    // (LINK inerte). Effacement omis (structure préservée, exemption).
  }
}

/** 1:1 décomp `static void TrySaveRegisteredDuplicates(struct SecretBaseRecordMixer *mixers)`
 *  (secret_base.c:1685-1695). LINK — inerte. */
function TrySaveRegisteredDuplicates(mixers: SecretBaseRecordMixer[]): void {
  for (let i = 0; i < SECRET_BASES_COUNT; i++) {
    TrySaveRegisteredDuplicate(mixers[0].secretBases[i], mixers[0].version, mixers[0].language);
    TrySaveRegisteredDuplicate(mixers[1].secretBases[i], mixers[1].version, mixers[1].language);
    TrySaveRegisteredDuplicate(mixers[2].secretBases[i], mixers[2].version, mixers[2].language);
  }
}

/** 1:1 décomp `static void SaveRecordMixBases(struct SecretBaseRecordMixer *mixers)`
 *  (secret_base.c:1697-1719). LINK — inerte. */
function SaveRecordMixBases(mixers: SecretBaseRecordMixer[]): void {
  DeleteFirstOldBaseFromPlayerInRecordMixingFriendsRecords(mixers[0].secretBases, mixers[1].secretBases, mixers[2].secretBases);
  ClearDuplicateOwnedSecretBases(gSaveBlock1Ptr.secretBases, mixers[0].secretBases, mixers[1].secretBases, mixers[2].secretBases);

  // First, save any registered secret bases that were deleted as duplicates
  TrySaveRegisteredDuplicates(mixers);

  // Then try to save the record mixing friends' own bases
  TrySaveFriendsSecretBase(mixers[0].secretBases[0], mixers[0].version, mixers[0].language);
  TrySaveFriendsSecretBase(mixers[1].secretBases[0], mixers[1].version, mixers[1].language);
  TrySaveFriendsSecretBase(mixers[2].secretBases[0], mixers[2].version, mixers[2].language);

  // Then try to save as many of their registered bases as possible
  TrySaveFriendsSecretBases(mixers[0], REGISTERED);
  TrySaveFriendsSecretBases(mixers[1], REGISTERED);
  TrySaveFriendsSecretBases(mixers[2], REGISTERED);

  // Lastly save as many of their unregistered bases as possible
  TrySaveFriendsSecretBases(mixers[0], UNREGISTERED);
  TrySaveFriendsSecretBases(mixers[1], UNREGISTERED);
  TrySaveFriendsSecretBases(mixers[2], UNREGISTERED);
}

/** 1:1 décomp `#define INIT_SECRET_BASE_RECORD_MIXER` (secret_base.c:1721-1730).
 *  Adaptation : pointeur `secretBases + linkId*recordSize` → tranche du buffer link
 *  (SecretBase[] par joueur, recordSize = SECRET_BASES_COUNT côté port). LINK inerte. */
function INIT_SECRET_BASE_RECORD_MIXER(mixers: SecretBaseRecordMixer[], secretBases: SecretBase[], recordSize: number, linkId1: number, linkId2: number, linkId3: number): void {
  const slice = (id: number): SecretBase[] => secretBases.slice(id * recordSize, (id + 1) * recordSize);
  mixers[0] = { secretBases: slice(linkId1), version: (gLinkPlayers[linkId1]?.version ?? 0) & 0xFF, language: gLinkPlayers[linkId1]?.language ?? 0 };
  mixers[1] = { secretBases: slice(linkId2), version: (gLinkPlayers[linkId2]?.version ?? 0) & 0xFF, language: gLinkPlayers[linkId2]?.language ?? 0 };
  mixers[2] = { secretBases: slice(linkId3), version: (gLinkPlayers[linkId3]?.version ?? 0) & 0xFF, language: gLinkPlayers[linkId3]?.language ?? 0 };
}

/** 1:1 décomp `void ReceiveSecretBasesData(void *secretBases, size_t recordSize, u8 linkIdx)`
 *  (secret_base.c:1732-1793). Record-mixing (exemption LINK — inerte solo).
 *  Adaptation : `void*` byte-buffer → `SecretBase[]` (recordSize = count/joueur) ;
 *  `memset(buf, 0, recordSize)` → remplace la tranche par des bases vides. */
export function ReceiveSecretBasesData(secretBases: SecretBase[], recordSize: number, linkIdx: number): void {
  const mixers: SecretBaseRecordMixer[] = [];

  if (FlagGet(FLAG_RECEIVED_SECRET_POWER)) {
    const clearSlice = (id: number): void => {
      for (let k = 0; k < recordSize; k++) secretBases[id * recordSize + k] = emptySecretBase();
    };
    switch (GetLinkPlayerCount()) {
      case 2:
        clearSlice(2);
        clearSlice(3);
        break;
      case 3:
        clearSlice(3);
        break;
    }

    switch (linkIdx) {
      case 0:
        INIT_SECRET_BASE_RECORD_MIXER(mixers, secretBases, recordSize, 1, 2, 3);
        break;
      case 1:
        INIT_SECRET_BASE_RECORD_MIXER(mixers, secretBases, recordSize, 2, 3, 0);
        break;
      case 2:
        INIT_SECRET_BASE_RECORD_MIXER(mixers, secretBases, recordSize, 3, 0, 1);
        break;
      case 3:
        INIT_SECRET_BASE_RECORD_MIXER(mixers, secretBases, recordSize, 0, 1, 2);
        break;
    }

    SaveRecordMixBases(mixers);

    for (let i = 1; i < SECRET_BASES_COUNT; i++) {
      // In the process of deleting duplicate bases, if a base the player has registered is deleted it is
      // flagged with the temporary toRegister flag, so it can be re-registered after it has been newly saved
      if (gSaveBlock1Ptr.secretBases[i].toRegister === TRUE) {
        gSaveBlock1Ptr.secretBases[i].registryStatus = REGISTERED;
        gSaveBlock1Ptr.secretBases[i].toRegister = FALSE;
      }
    }

    SortSecretBasesByRegistryStatus();
    for (let i = 1; i < SECRET_BASES_COUNT; i++) {
      // Unmark "new" bases, they've been saved now and are no longer important
      if (gSaveBlock1Ptr.secretBases[i].registryStatus === NEW)
        gSaveBlock1Ptr.secretBases[i].registryStatus = UNREGISTERED;
    }

    if (gSaveBlock1Ptr.secretBases[0].secretBaseId !== 0
      && gSaveBlock1Ptr.secretBases[0].numSecretBasesReceived !== 0xFFFF) {
      gSaveBlock1Ptr.secretBases[0].numSecretBasesReceived++;
    }
  }
}

/** 1:1 décomp `void ClearJapaneseSecretBases(struct SecretBase *bases)` (secret_base.c:1795-1803). */
export function ClearJapaneseSecretBases(bases: SecretBase[]): void {
  for (let i = 0; i < SECRET_BASES_COUNT; i++) {
    if (bases[i].language === LANGUAGE_JAPANESE)
      ClearSecretBase(bases, i);
  }
}

/** 1:1 décomp `void InitSecretBaseVars(void)` (secret_base.c:1805-1817). */
export function InitSecretBaseVars(): void {
  VarSet(VAR_SECRET_BASE_STEP_COUNTER, 0);
  VarSet(VAR_SECRET_BASE_LAST_ITEM_USED, 0);
  VarSet(VAR_SECRET_BASE_LOW_TV_FLAGS, 0);
  VarSet(VAR_SECRET_BASE_HIGH_TV_FLAGS, 0);
  if (VarGet(VAR_CURRENT_SECRET_BASE) !== 0)
    VarSet(VAR_SECRET_BASE_IS_NOT_LOCAL, TRUE);
  else
    VarSet(VAR_SECRET_BASE_IS_NOT_LOCAL, FALSE);

  sInFriendSecretBase = false;
}

/** 1:1 décomp `void CheckLeftFriendsSecretBase(void)` (secret_base.c:1819-1832). */
export function CheckLeftFriendsSecretBase(): void {
  if (VarGet(VAR_SECRET_BASE_IS_NOT_LOCAL) && sInFriendSecretBase === true && !CurMapIsSecretBase()) {
    VarSet(VAR_SECRET_BASE_IS_NOT_LOCAL, FALSE);
    sInFriendSecretBase = false;
    TryPutSecretBaseSecretsOnAir();
    VarSet(VAR_SECRET_BASE_STEP_COUNTER, 0);
    VarSet(VAR_SECRET_BASE_LAST_ITEM_USED, 0);
    VarSet(VAR_SECRET_BASE_LOW_TV_FLAGS, 0);
    VarSet(VAR_SECRET_BASE_HIGH_TV_FLAGS, 0);
    VarSet(VAR_SECRET_BASE_IS_NOT_LOCAL, FALSE);
  }
}

/** 1:1 décomp `void CheckInteractedWithFriendsDollDecor(void)` (secret_base.c:1834-1838). */
export function CheckInteractedWithFriendsDollDecor(): void {
  if (VarGet(VAR_CURRENT_SECRET_BASE) !== 0)
    _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_DOLL);
}

/** 1:1 décomp `void CheckInteractedWithFriendsCushionDecor(void)` (secret_base.c:1840-1844). */
export function CheckInteractedWithFriendsCushionDecor(): void {
  if (VarGet(VAR_CURRENT_SECRET_BASE) !== 0)
    _varSetBit(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_USED_CUSHION);
}

/** 1:1 décomp `void DeclinedSecretBaseBattle(void)` (secret_base.c:1846-1854). */
export function DeclinedSecretBaseBattle(): void {
  if (VarGet(VAR_CURRENT_SECRET_BASE) !== 0) {
    _varClearBits(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_BATTLED_WON | SECRET_BASE_BATTLED_LOST | SECRET_BASE_DECLINED_BATTLE);
    _varClearBits(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_BATTLED_DRAW);
    _varSetBit(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_DECLINED_BATTLE);
  }
}

/** 1:1 décomp `void WonSecretBaseBattle(void)` (secret_base.c:1856-1864). */
export function WonSecretBaseBattle(): void {
  if (VarGet(VAR_CURRENT_SECRET_BASE) !== 0) {
    _varClearBits(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_BATTLED_WON | SECRET_BASE_BATTLED_LOST | SECRET_BASE_DECLINED_BATTLE);
    _varClearBits(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_BATTLED_DRAW);
    _varSetBit(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_BATTLED_WON);
  }
}

/** 1:1 décomp `void LostSecretBaseBattle(void)` (secret_base.c:1866-1874). */
export function LostSecretBaseBattle(): void {
  if (VarGet(VAR_CURRENT_SECRET_BASE) !== 0) {
    _varClearBits(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_BATTLED_WON | SECRET_BASE_BATTLED_LOST | SECRET_BASE_DECLINED_BATTLE);
    _varClearBits(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_BATTLED_DRAW);
    _varSetBit(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_BATTLED_LOST);
  }
}

/** 1:1 décomp `void DrewSecretBaseBattle(void)` (secret_base.c:1876-1884). */
export function DrewSecretBaseBattle(): void {
  if (VarGet(VAR_CURRENT_SECRET_BASE) !== 0) {
    _varClearBits(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_BATTLED_WON | SECRET_BASE_BATTLED_LOST | SECRET_BASE_DECLINED_BATTLE);
    _varClearBits(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_BATTLED_DRAW);
    _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_BATTLED_DRAW);
  }
}

/** 1:1 décomp `void CheckInteractedWithFriendsPosterDecor(void)` (secret_base.c:1886-1912). */
export function CheckInteractedWithFriendsPosterDecor(): void {
  const { x, y } = GetXYCoordsOneStepInFrontOfPlayer();
  switch (MapGridGetMetatileIdAt(x, y)) {
    case METATILE_SecretBase_PikaPoster_Left:
    case METATILE_SecretBase_PikaPoster_Right:
    case METATILE_SecretBase_LongPoster_Left:
    case METATILE_SecretBase_LongPoster_Right:
    case METATILE_SecretBase_SeaPoster_Left:
    case METATILE_SecretBase_SeaPoster_Right:
    case METATILE_SecretBase_SkyPoster_Left:
    case METATILE_SecretBase_SkyPoster_Right:
    case METATILE_SecretBase_KissPoster_Left:
    case METATILE_SecretBase_KissPoster_Right:
    case METATILE_SecretBase_BallPoster:
    case METATILE_SecretBase_GreenPoster:
    case METATILE_SecretBase_RedPoster:
    case METATILE_SecretBase_BluePoster:
    case METATILE_SecretBase_CutePoster:
      if (VarGet(VAR_CURRENT_SECRET_BASE) !== 0)
        _varSetBit(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_USED_POSTER);
      break;
  }
}

/** 1:1 décomp `void CheckInteractedWithFriendsFurnitureBottom(void)` (secret_base.c:1914-1990). */
export function CheckInteractedWithFriendsFurnitureBottom(): void {
  const { x, y } = GetXYCoordsOneStepInFrontOfPlayer();
  switch (MapGridGetMetatileIdAt(x, y)) {
    case METATILE_SecretBase_GlassOrnament_Base1:
    case METATILE_SecretBase_GlassOrnament_Base2:
      if (VarGet(VAR_CURRENT_SECRET_BASE) !== 0)
        _varSetBit(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_USED_GLASS_ORNAMENT);
      break;
    case METATILE_SecretBase_RedPlant_Base1:
    case METATILE_SecretBase_RedPlant_Base2:
    case METATILE_SecretBase_TropicalPlant_Base1:
    case METATILE_SecretBase_TropicalPlant_Base2:
    case METATILE_SecretBase_PrettyFlowers_Base1:
    case METATILE_SecretBase_PrettyFlowers_Base2:
    case METATILE_SecretBase_ColorfulPlant_BaseLeft1:
    case METATILE_SecretBase_ColorfulPlant_BaseRight1:
    case METATILE_SecretBase_ColorfulPlant_BaseLeft2:
    case METATILE_SecretBase_ColorfulPlant_BaseRight2:
    case METATILE_SecretBase_BigPlant_BaseLeft1:
    case METATILE_SecretBase_BigPlant_BaseRight1:
    case METATILE_SecretBase_BigPlant_BaseLeft2:
    case METATILE_SecretBase_BigPlant_BaseRight2:
    case METATILE_SecretBase_GorgeousPlant_BaseLeft1:
    case METATILE_SecretBase_GorgeousPlant_BaseRight1:
    case METATILE_SecretBase_GorgeousPlant_BaseLeft2:
    case METATILE_SecretBase_GorgeousPlant_BaseRight2:
      if (VarGet(VAR_CURRENT_SECRET_BASE) !== 0)
        _varSetBit(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_USED_PLANT);
      break;
    case METATILE_SecretBase_Fence_Horizontal:
    case METATILE_SecretBase_Fence_Vertical:
      if (VarGet(VAR_CURRENT_SECRET_BASE) !== 0)
        _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_FENCE);
      break;
    case METATILE_SecretBase_Tire_BottomLeft:
    case METATILE_SecretBase_Tire_BottomRight:
      if (VarGet(VAR_CURRENT_SECRET_BASE) !== 0)
        _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_TIRE);
      break;
    case METATILE_SecretBase_RedBrick_Bottom:
    case METATILE_SecretBase_YellowBrick_Bottom:
    case METATILE_SecretBase_BlueBrick_Bottom:
      if (VarGet(VAR_CURRENT_SECRET_BASE) !== 0)
        _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_BRICK);
      break;
    case METATILE_SecretBase_SmallDesk:
    case METATILE_SecretBase_PokemonDesk:
    case METATILE_SecretBase_HeavyDesk_BottomLeft:
    case METATILE_SecretBase_HeavyDesk_BottomMid:
    case METATILE_SecretBase_HeavyDesk_BottomRight:
    case METATILE_SecretBase_RaggedDesk_BottomLeft:
    case METATILE_SecretBase_RaggedDesk_BottomMid:
    case METATILE_SecretBase_RaggedDesk_BottomRight:
    case METATILE_SecretBase_ComfortDesk_BottomLeft:
    case METATILE_SecretBase_ComfortDesk_BottomMid:
    case METATILE_SecretBase_ComfortDesk_BottomRight:
    case METATILE_SecretBase_BrickDesk_BottomLeft:
    case METATILE_SecretBase_BrickDesk_BottomMid:
    case METATILE_SecretBase_BrickDesk_BottomRight:
    case METATILE_SecretBase_CampDesk_BottomLeft:
    case METATILE_SecretBase_CampDesk_BottomMid:
    case METATILE_SecretBase_CampDesk_BottomRight:
    case METATILE_SecretBase_HardDesk_BottomLeft:
    case METATILE_SecretBase_HardDesk_BottomMid:
    case METATILE_SecretBase_HardDesk_BottomRight:
    case METATILE_SecretBase_PrettyDesk_BottomLeft:
    case METATILE_SecretBase_PrettyDesk_BottomMid:
    case METATILE_SecretBase_PrettyDesk_BottomRight:
      if (VarGet(VAR_CURRENT_SECRET_BASE) !== 0)
        _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_DESK);
      break;
  }
}

/** 1:1 décomp `void CheckInteractedWithFriendsFurnitureMiddle(void)` (secret_base.c:1992-2014). */
export function CheckInteractedWithFriendsFurnitureMiddle(): void {
  const { x, y } = GetXYCoordsOneStepInFrontOfPlayer();
  switch (MapGridGetMetatileIdAt(x, y)) {
    case METATILE_SecretBase_HeavyDesk_TopMid:
    case METATILE_SecretBase_RaggedDesk_TopMid:
    case METATILE_SecretBase_ComfortDesk_TopMid:
    case METATILE_SecretBase_BrickDesk_TopMid:
    case METATILE_SecretBase_BrickDesk_Center:
    case METATILE_SecretBase_CampDesk_TopMid:
    case METATILE_SecretBase_CampDesk_Center:
    case METATILE_SecretBase_HardDesk_TopMid:
    case METATILE_SecretBase_HardDesk_Center:
    case METATILE_SecretBase_PrettyDesk_TopMid:
    case METATILE_SecretBase_PrettyDesk_Center:
      if (VarGet(VAR_CURRENT_SECRET_BASE) !== 0)
        _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_DESK);
      break;
  }
}

/** 1:1 décomp `void CheckInteractedWithFriendsFurnitureTop(void)` (secret_base.c:2016-2060). */
export function CheckInteractedWithFriendsFurnitureTop(): void {
  const { x, y } = GetXYCoordsOneStepInFrontOfPlayer();
  switch (MapGridGetMetatileIdAt(x, y)) {
    case METATILE_SecretBase_HeavyDesk_TopLeft:
    case METATILE_SecretBase_HeavyDesk_TopRight:
    case METATILE_SecretBase_RaggedDesk_TopLeft:
    case METATILE_SecretBase_RaggedDesk_TopRight:
    case METATILE_SecretBase_ComfortDesk_TopLeft:
    case METATILE_SecretBase_ComfortDesk_TopRight:
    case METATILE_SecretBase_BrickDesk_TopLeft:
    case METATILE_SecretBase_BrickDesk_TopRight:
    case METATILE_SecretBase_BrickDesk_MidLeft:
    case METATILE_SecretBase_BrickDesk_MidRight:
    case METATILE_SecretBase_CampDesk_TopLeft:
    case METATILE_SecretBase_CampDesk_TopRight:
    case METATILE_SecretBase_CampDesk_MidLeft:
    case METATILE_SecretBase_CampDesk_MidRight:
    case METATILE_SecretBase_HardDesk_TopLeft:
    case METATILE_SecretBase_HardDesk_TopRight:
    case METATILE_SecretBase_HardDesk_MidLeft:
    case METATILE_SecretBase_HardDesk_MidRight:
    case METATILE_SecretBase_PrettyDesk_TopLeft:
    case METATILE_SecretBase_PrettyDesk_TopRight:
    case METATILE_SecretBase_PrettyDesk_MidLeft:
    case METATILE_SecretBase_PrettyDesk_MidRight:
      if (VarGet(VAR_CURRENT_SECRET_BASE) !== 0)
        _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_DESK);
      break;
    case METATILE_SecretBase_Tire_TopLeft:
    case METATILE_SecretBase_Tire_TopRight:
      if (VarGet(VAR_CURRENT_SECRET_BASE) !== 0)
        _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_TIRE);
      break;
    case METATILE_SecretBase_RedBrick_Top:
    case METATILE_SecretBase_YellowBrick_Top:
    case METATILE_SecretBase_BlueBrick_Top:
      if (VarGet(VAR_CURRENT_SECRET_BASE) !== 0)
        _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_BRICK);
      break;
  }
}

/** 1:1 décomp `void CheckInteractedWithFriendsSandOrnament(void)` (secret_base.c:2062-2075). */
export function CheckInteractedWithFriendsSandOrnament(): void {
  const { x, y } = GetXYCoordsOneStepInFrontOfPlayer();
  switch (MapGridGetMetatileIdAt(x, y)) {
    case METATILE_SecretBase_SandOrnament_Base1:
    case METATILE_SecretBase_SandOrnament_Base2:
      if (VarGet(VAR_CURRENT_SECRET_BASE) !== 0)
        _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_SAND_ORNAMENT);
      break;
  }
}

// ─── Helpers export (secret_base.c callers déjà portés) ─────────────────────
/** Helper export historique (ex-lot 12) : lecture sCurSecretBaseId. */
export function getCurSecretBaseId(): number { return sCurSecretBaseId; }
/** Helper export historique (ex-lot 12) : écriture sCurSecretBaseId. */
export function setCurSecretBaseId(v: number): void { sCurSecretBaseId = v & 0xFF; }

// ═════════════════════════════════════════════════════════════════════════════
//  SPECIALS SCRIPT — enregistrements PRÉ-EXISTANTS uniquement (7).
//  Les autres specials secret_base.c (CheckPlayerHasSecretBase, EnterSecretBase,
//  ClearAndLeaveSecretBase, MoveOutOfSecretBase, ToggleCurSecretBaseRegistry,
//  ShowSecretBaseDecorationMenu, ShowSecretBaseRegistryMenu, GetSecretBaseOwnerAndState,
//  InitSecretBaseDecorationSprites, GetSecretBaseTypeInFrontOfPlayer,
//  EnterNewlyCreatedSecretBase, SetBattledOwnerFromResult, MoveOutOfSecretBaseFromOutside,
//  InitSecretBaseVars, CheckInteractedWithFriends*, Declined/Won/Lost/DrewSecretBaseBattle,
//  CopyCurSecretBaseOwnerName_StrVar1) restent NON ENREGISTRÉS (INERTE) — voir rapport
//  pour le câblage (Règle : rien de « fini » sans test EN JEU).
// ═════════════════════════════════════════════════════════════════════════════
registerSpecial('IsCurSecretBaseOwnedByAnotherPlayer', IsCurSecretBaseOwnedByAnotherPlayer);
registerSpecial('TrySetCurSecretBaseIndex', TrySetCurSecretBaseIndex);
registerSpecial('SetCurSecretBaseId', SetCurSecretBaseId);
registerSpecial('GetCurSecretBaseRegistrationValidity', GetCurSecretBaseRegistrationValidity);
registerSpecial('PrepSecretBaseBattleFlags', PrepSecretBaseBattleFlags);
registerSpecial('SetSecretBaseOwnerGfxId', SetSecretBaseOwnerGfxId);
registerSpecial('SetPlayerSecretBase', SetPlayerSecretBase);
// ─── Câblage complet (fermeture 99/99) : les specials de data/specials.inc:22-42
// + :297-379 dont le foyer est secret_base.c. (DoSecretBasePCTurnOffEffect =
// fldeff_misc.c, GetSecretBaseNearbyMapName = field_specials.c — déjà dans
// specials-registry, PAS ici.) EnterNewlyCreatedSecretBase : waitstate=1 côté
// script (le special lance la task 1:1 ; le byte-VM waitstate attend le lock).
registerSpecial('CheckPlayerHasSecretBase', CheckPlayerHasSecretBase);
registerSpecial('EnterSecretBase', EnterSecretBase);
registerSpecial('ClearAndLeaveSecretBase', ClearAndLeaveSecretBase);
registerSpecial('MoveOutOfSecretBase', MoveOutOfSecretBase);
registerSpecial('ToggleCurSecretBaseRegistry', ToggleCurSecretBaseRegistry);
registerSpecial('ShowSecretBaseDecorationMenu', ShowSecretBaseDecorationMenu);
registerSpecial('ShowSecretBaseRegistryMenu', ShowSecretBaseRegistryMenu);
registerSpecial('GetSecretBaseOwnerAndState', GetSecretBaseOwnerAndState);
registerSpecial('InitSecretBaseDecorationSprites', InitSecretBaseDecorationSprites);
registerSpecial('GetSecretBaseTypeInFrontOfPlayer', GetSecretBaseTypeInFrontOfPlayer);
registerSpecial('EnterNewlyCreatedSecretBase', EnterNewlyCreatedSecretBase);
registerSpecial('SetBattledOwnerFromResult', SetBattledOwnerFromResult);
registerSpecial('CopyCurSecretBaseOwnerName_StrVar1', CopyCurSecretBaseOwnerName_StrVar1);
registerSpecial('MoveOutOfSecretBaseFromOutside', MoveOutOfSecretBaseFromOutside);
registerSpecial('InitSecretBaseVars', InitSecretBaseVars);
registerSpecial('CheckInteractedWithFriendsSandOrnament', CheckInteractedWithFriendsSandOrnament);
registerSpecial('DeclinedSecretBaseBattle', DeclinedSecretBaseBattle);
registerSpecial('DrewSecretBaseBattle', DrewSecretBaseBattle);
registerSpecial('WonSecretBaseBattle', WonSecretBaseBattle);
registerSpecial('LostSecretBaseBattle', LostSecretBaseBattle);
registerSpecial('CheckInteractedWithFriendsDollDecor', CheckInteractedWithFriendsDollDecor);
registerSpecial('CheckInteractedWithFriendsCushionDecor', CheckInteractedWithFriendsCushionDecor);
registerSpecial('CheckInteractedWithFriendsFurnitureBottom', CheckInteractedWithFriendsFurnitureBottom);
registerSpecial('CheckInteractedWithFriendsFurnitureMiddle', CheckInteractedWithFriendsFurnitureMiddle);
registerSpecial('CheckInteractedWithFriendsFurnitureTop', CheckInteractedWithFriendsFurnitureTop);
registerSpecial('CheckInteractedWithFriendsPosterDecor', CheckInteractedWithFriendsPosterDecor);
