/**
 * script-opcodes.ts — registry des opcodes pour le script engine.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c`.
 *
 * Phase 4.5 MVP : opcodes minimums pour faire parler un NPC (= FatMan dans
 * Bourg-en-Vol) et exécuter OnTransition. Plus d'opcodes ajoutés au fur et
 * à mesure des besoins (= movement, warps, doors etc.).
 */

import {
  registerOpcode, type ScriptContext,
  ScriptJump, ScriptCall, ScriptReturn, StopScript,
  SetupNativeScript, getScript, getText, getOpcodeHandler,
} from './script-runtime';
import {
  FlagSet, FlagClear, FlagGet, VarSet, VarGet, Compare,
  gSpecialVar, gSelectedObjectEvent,
  COMPARE_LT, COMPARE_EQ, COMPARE_GT,
} from './script-vars';
import {
  ShowFieldMessage, IsFieldMessageBoxHidden, HideFieldMessageBox,
} from '../../field_message_box';
import {
  applyMovement, isAllMovementsDone, isMovementDone,
} from '../field/movement-system';
import { PlaySE } from '../system/decomp-globals';
import * as Songs from '../decomp-data/include/constants/songs-data';
import {
  gObjectEvents, type ObjectEvent, TrySpawnObjectEvent, FreezeObjectEvent, UnfreezeObjectEvent,
} from '../../event_object_movement';
import type { ObjectEventTemplate } from '../../fieldmap';
import { setPendingWarp, getPendingWarp, SetDynamicWarp } from '../field/warp-system';
import { GetCurrentMap, SetObjEventTemplateCoords } from '../save/load_save';
import { GetSaveBlock1 } from '../save/save-system';
import { gMapHeader, MapGridSetMetatileIdAt, MAP_OFFSET, MAPGRID_IMPASSABLE } from '../../fieldmap';
import { AddBagItem, RemoveBagItem, CheckBagHasItem } from '../bag/bag';
import {
  CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose, GetYesNoWindowId,
} from '../ui/gba-menu-system';
import type { WindowTemplate } from '../ui/gba-window-system';
import {
  ClearStdWindowAndFrame, RemoveWindow, AddWindow, PutWindowTilemap, CopyWindowToVram,
  DrawStdFrameWithCustomTileAndPalette,
} from '../ui/gba-window-system';
import { AddTextPrinterParameterized3 } from '../ui/gba-text-system';
import { InitMenuInUpperLeftCornerNormal } from '../ui/gba-menu-system';
import { getMultichoiceList } from '../system/multichoice-data';
import {
  gPlayerAvatar, GetPlayerFacingDirection, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST,
} from '../../field_player_avatar';
import { gSaveBlock1Ptr } from '../save/save-block-state';
import { getRuntime } from '../system/decomp-globals';
import { resolveDecompConstant, reverseDecompConstant } from '../system/decomp-constants';
import { RtcCalcLocalTime, gLocalTime, RtcInitLocalTimeOffset } from '../system/rtc';
import { setStringVar } from '../system/string-buffers';
import {
  getSpeciesNameFr, getMoveNameFr, getItemNameFr, getTrainerNameFr,
  getTrainerClassNameFr, getTrainer,
} from '../system/data-tables';
import {
  OPPOSITE_DIR, MALE_GENDER, FEMALE_GENDER,
  getSelectedNpc, isAOrBNewlyPressed, parseValue, resolveCount,
  findNpcByLocalId, findTemplateByLocalId, resolveObjectLocalIdRaw,
  isPlayerStepFinished,
} from './script-opcodes-helpers';
import { invokeSpecial as _invokeSpecial } from './script-opcodes-special';
import { spawnYesNoMenu } from './script-opcodes-menu';
// Re-export pour préserver les imports externes (= bedroom-pc.ts, wallclock-flow.ts,
// region-map.ts, specials-registry.ts).
export { SignalWaitState, registerSpecial } from './script-opcodes-special';

// ─── Helpers ─────────────────────────────────────────────────────────────────
// Helpers partagés exportés depuis `script-opcodes/helpers.ts` (= 1:1 décomp).
// Aliases legacy avec underscore préservés ci-dessous le temps du split D1.

const _findNpcByLocalId = findNpcByLocalId;
const _findTemplateByLocalId = findTemplateByLocalId;
const _resolveObjectLocalIdRaw = resolveObjectLocalIdRaw;
const _isPlayerStepFinished = isPlayerStepFinished;

// ─── Control flow / Conditional branches extraits vers `./script-opcodes-control-flow`
// (= 1:1 décomp script.c). end/return/goto/call/goto_if_*/call_if_*. ─────────

// ─── Variables / flags extraits vers `./script-opcodes-flag-var`
// (= 1:1 décomp event_data.c). setvar/addvar/subvar/copyvar.

// 1:1 décomp asm/macros/event.inc:730-823 — trainerbattle macros.
// Notre extracteur garde les macros user-level non-expandées (= trainerbattle_*
// arrivent dans les JSON tels quels, pas en `trainerbattle TYPE, ...`).
//
// Stub Phase 2 : log + continue (= BattleScene Phaser à venir Phase 5). Set
// VAR_RESULT = 1 (= victoire pour démo) afin que les scripts post-bataille
// (= rival defeated dialog) continuent leur flow.
//
// 6 variants couvrent ~600 usages combinés :
//   trainerbattle TYPE, trainer, localId, ptr1[, ptr2[, ptr3[, ptr4]]]
//   trainerbattle_single trainer, intro, lose [, event_script [, music]]
//   trainerbattle_double trainer, intro, lose, not_enough_text [, event_script [, music]]
//   trainerbattle_rematch trainer, intro, lose
//   trainerbattle_rematch_double trainer, intro, lose, not_enough_text
//   trainerbattle_no_intro trainer, lose_text  →  TRAINER_BATTLE_SINGLE_NO_INTRO_TEXT
// Trainer battle / wild battle opcodes (= trainerbattle/_single/_double/_rematch/
// _rematch_double/_no_intro, dotrainerbattle, gotopostbattlescript, gotobeatenscript,
// settrainerflag, cleartrainerflag, checktrainerflag, goto_if_defeated,
// goto_if_not_defeated, call_if_defeated, setwildbattle, dowildbattle)
// extraits vers `./script-opcodes-battle` (= 1:1 décomp battle_setup.c + trainer_see.c).

// 1:1 décomp asm/macros/event.inc:1914-1921 :
//
//   .macro switch var
//     copyvar VAR_0x8000, \var
//   .endm
//
//   .macro case condition, dest
//     compare VAR_0x8000, \condition
//     goto_if_eq \dest
//   .endm
//
// Notre extracteur garde les macros user-level (= switch/case) non-expandées.
// 337 usages `switch` + 1278 `case` (= biggest opcode gap). Bloquer `switch` =
// rival dispatch Route103 ne fonctionne pas (= match starter type).
// `switch` / `case` / `setflag` / `clearflag` / `checkflag` / `compare` extraits
// vers `./script-opcodes-flag-var`.

// `checkplayergender` extrait vers `./script-opcodes-player-avatar`.

// ─── Lock / Release / FacePlayer / Turnobject extraits vers `./script-opcodes-lock`
// (= 1:1 décomp event_object_lock.c). ─────────────────────────────────────────

// ─── Dialog / Message extraits vers `./script-opcodes-message`
// (= 1:1 décomp field_message_box.c). message/waitmessage/waitbuttonpress/closemessage.

// `msgbox` extrait vers `./script-opcodes-message` (= 1:1 décomp std_msgbox.inc state machine).

// 1:1 décomp scrcmd.c:1353-1370 ScrCmd_multichoice(left, top, multichoiceId, ignoreBPress) :
//   ScriptMenu_Multichoice(left, top, multichoiceId, ignoreBPress) → TRUE
//   ScriptContext_Stop ; user picks → VAR_RESULT = cursor pos (0..N-1) or
//   MULTI_B_PRESSED (0x7F) si B pressé et !ignoreBPress.
//
// Phase 2 STUB : sMultichoiceLists data table pas encore portée (= ~50 lists,
// gros boulot). Pour débloquer les scripts qui l'utilisent (= 117 usages dont
// starter selection Route101 indirectement via ChooseStarter), on retourne
// VAR_RESULT = 0 (= 1ère option par défaut). Real impl Phase 4+.
//
// Variantes : multichoicedefault (= same + initial cursor pos), multichoicegrid
// (= 2D grid layout).
// Multichoice menus + yesnobox extraits vers `./script-opcodes-menu`
// (= 1:1 décomp menu.c + script_menu.c). `spawnYesNoMenu` exporté pour msgbox.

// ─── Misc ────────────────────────────────────────────────────────────────────
// `delay` / `gettime` extraits vers `./script-opcodes-rtc-clock`.

// `waitstate` + `SignalWaitState` extraits vers `./script-opcodes-special`
// (= 1:1 décomp ScrCmd_waitstate). Re-export ci-dessous preserve les imports
// externes (bedroom-pc/wallclock-flow/region-map).

// ─── Special opcode dispatcher (= 1:1 décomp ScrCmd_special) ────────────────
// Extraits vers `./script-opcodes-special` (= ScrCmd_special + ScrCmd_specialvar
// + dispatchers UI ChooseStarter/StartBirchTutorialBattle/FieldShowRegionMap/
// BedroomPC/PlayerPC/Special_ViewWallClock/StartWallClock).
// `invokeSpecial` (anciennement `_invokeSpecial`) est désormais exporté depuis
// script-opcodes-special.ts pour que les sections frontier/seteventmon puissent
// l'appeler via import.

// Sound opcodes (playse/playbgm/savebgm/fadedefaultbgm/fadenewbgm/fadeoutbgm/
// fadeinbgm/playfanfare/waitfanfare) extraits vers `./script-opcodes-sound`
// (= 1:1 décomp sound.c).

// Standard NPC scripts utilitaires fréquemment appelés via `call` :
// Common_EventScript_SetupRivalGfxId, Common_EventScript_SaveGame, etc.
// On warn la 1ère fois seulement (= via dispatchOpcode default behavior).

// ─── Object events utility opcodes ───────────────────────────────────────────

// `_findNpcByLocalId` + `_findTemplateByLocalId` sont maintenant importés depuis
// `./script-opcodes/helpers` (= 1:1 décomp event_object_movement.c).

// Object events / movement opcodes (setobjectxy/setobjectxyperm/
// setobjectmovementtype/applymovement/waitmovement/map_script/addobject/
// removeobject) extraits vers `./script-opcodes-movement` (= 1:1 décomp
// event_object_movement.c + script_movement.c).

// `hideobject` / `showobject` / `hideplayer` / `showplayer` extraits vers
// `./script-opcodes-player-avatar` (= 1:1 décomp field_player_avatar.c).

// ─── Doors (= 1:1 décomp ScrCmd_opendoor etc.) ──────────────────────────────
// Extraits vers `./script-opcodes-door` (= 1:1 décomp field_door.c).

// `fadescreen` / `fadescreenspeed` / `fadescreenswapbuffers` extraits vers
// `./script-opcodes-screen-fx` (= 1:1 décomp field_screen_effect.c + palette.c).
// (fadescreenswapbuffers extrait vers `./script-opcodes-screen-fx`)

// `setmetatile` extrait vers `./script-opcodes-fieldmap` (= 1:1 décomp fieldmap.c).

// ─── Warp opcodes / setrespawn extraits vers `./script-opcodes-warp`
// (= 1:1 décomp overworld.c). ────────────────────────────────────────────────

// ─── Misc stubs (= unblock script flow without full implementation) ─────────

// `incrementgamestat` extrait vers `./script-opcodes-flag-var`.

// `playmoncry` extrait vers `./script-opcodes-sound`.

// `waitmoncry` : registration UNIQUE = la vraie impl 1:1 plus bas
// (SetupNativeScript + IsCryFinished, scrcmd.c:2028). L'ancien
// registerOpcode no-op redondant ici a été supprimé (Map.set → le
// dernier gagnait déjà, donc comportement INCHANGÉ ; retire du code mort
// + un faux positif audit:scrcmd dont la fenêtre 220c capturait le
// "Stub" du commentaire giveitem ci-dessous).

// `giveitem` extrait vers `./script-opcodes-item` (= 1:1 décomp item.c).

/** 1:1 décomp `givecoins` macro. Stub. */
// Money/coins opcodes (givecoins/givemoney/addmoney/takemoney/checkmoney/checkcoins/
// takecoins/addcoins/removemoney/removecoins/*moneybox/*coinsbox) extraits vers
// `./script-opcodes-money-coins` (= 1:1 décomp money.c + coins.c).

/** 1:1 décomp `ScrCmd_givemon` (scrcmd.c) :
 *    species = VarGet(args[0]); level = VarGet(args[1]); item = VarGet(args[2]);
 *    ScriptGiveMon(species, level, item, 0, 0, 0);
 *  Audit session 126 (post-test) : avant no-op → cadeaux Pokémon broken
 *  (= Wally Ralts, in-game trades, etc). Maintenant : créer mon + addToParty. */
// `givepokemon` extrait vers `./script-opcodes-party`.

// `checkmoney` extrait vers `./script-opcodes-money-coins`.

/** 1:1 décomp `startminigame_*` etc. Stubs no-op. */
// `cmd5e` extrait vers `./script-opcodes-control-flow`.

// `setweather` / `resetweather` / `doweather` extraits vers `./script-opcodes-weather`
// (= 1:1 décomp field_weather.c).

// `setstepcallback` / `setmaplayoutindex` extraits vers `./script-opcodes-fieldmap`.
// setobjectsubpriority / resetobjectsubpriority / createvobject / turnvobject
// early stubs extraits vers `./script-opcodes-movement`.
// HOTFIX 2026-05-09 : opendoor/closedoor/waitdooranim sont déjà registered avec
// les vraies implementations plus haut dans le fichier (lignes 1277-1313).
// Les stubs no-op qui étaient ici écrasaient les vraies fonctions → portes ne
// s'ouvrent plus pour le player. Reported by user. Removed.
// setdoor_opened/setdoor_closed sont des opcodes différents (= snake_case avec
// underscore), pas dupliqués, on les garde.
// Alias setdoor_opened/setdoor_closed → versions handled par setdooropen/setdoorclosed.
// 1:1 décomp scrcmd : these are just naming variants.
// `setdoor_opened` / `setdoor_closed` extraits vers `./script-opcodes-door`.
// `addelevmenuitem` / `showelevmenu` early stubs extraits vers `./script-opcodes-menu`.
// `checkcoins` / `takecoins` extraits vers `./script-opcodes-money-coins`.
// ─── Buffer opcodes extraits vers `./script-opcodes-string`
// (= 1:1 décomp string_util.c). Tous les buffer* + vbuffer + preparemsg. ─────
// `selectapproachingtrainer` / `lockfortrainer` early stubs extraits vers `./script-opcodes-lock`.
// HOTFIX 2026-05-09 : faceplayer/turnobject sont déjà registered avec les vraies
// implementations plus haut (lignes 496, 505). Les stubs no-op qui étaient ici
// écrasaient → NPCs ne se tournent plus vers le player. Reported by user. Removed.
// 1:1 décomp `ScrCmd_vmessage / vmsgbox / vbufferstring` (scrcmd.c) :
// Versions "v" prennent un VAR_X qui contient une string offset (= multi-language
// dynamic). Notre runtime est FR-only → traite comme alias des versions normales.
// `vmessage` / `vmsgbox` extraits vers `./script-opcodes-message`.
// `vbufferstring` extrait vers `./script-opcodes-string`.

// 1:1 décomp `ScrCmd_addcoins` (scrcmd.c) : gSaveBlock1Ptr.coins += amount, cap 9999.
// `addcoins` extrait vers `./script-opcodes-money-coins`.

// 1:1 décomp `ScrCmd_messageinstant` (scrcmd.c) : msgbox sans typewriter effect
// (= text appears all at once instead of char-by-char). MVP : alias message.
// `messageinstant` extrait vers `./script-opcodes-message`.

// `warpwhitefade` extrait vers `./script-opcodes-warp`.
// `checkpartymove` / `countpokemon` extraits vers `./script-opcodes-player-avatar`.

// `setdynamicwarp` extrait vers `./script-opcodes-warp`.

// Bag opcodes (additem/removeitem/checkitem/checkitemspace) extraits vers
// `./script-opcodes-item` (= 1:1 décomp item.c).

// ─── Helpers privés ──────────────────────────────────────────────────────────
// `parseValue` est maintenant importé depuis `./script-opcodes/helpers`.

// ─── Phase 5.7+ iteration 6 : field SE/audio extras + register_matchcall ─────
// `playsewithpan` / `loopsewithpan` / `waitse` / `waitplaysewithpan` extraits
// vers `./script-opcodes-sound`.

// `register_matchcall` extrait vers `./script-opcodes-match-call`.

// 1:1 décomp `ScrCmd_setbyte` (scrcmd.c) — set a byte var. Le decomp utilise ça
// rarement directement (= surtout pour battle script land). MVP no-op.
// `setbyte` extrait vers `./script-opcodes-control-flow`.

// `pause` extrait vers `./script-opcodes-rtc-clock`.

// `random` opcode : 1:1 décomp `random.c` — voir `./script-opcodes-random`.

// 1:1 décomp `ScrCmd_finditem` — field find item / `setvar VAR_RESULT` if found.
//   MVP : mark obtained as success (= not blocking flow but no real item).
/** 1:1 décomp `ScrCmd_finditem` (scrcmd.c) :
 *    itemId = VarGet(args[0]);
 *    amount = VarGet(args[1]);
 *    if (AddBagItem(itemId, amount)) gSpecialVar_Result = 0;
 *    else gSpecialVar_Result = 1;  // bag full
 *
 *  Audit session 126 LOT D4 : avant stub, maintenant vraie impl. Le UI
 *  "X obtained!" + SE_PIN est handled par le script qui appelle finditem
 *  (= il enchaîne avec msgbox + playse SE_PIN). On ne fait que add to bag. */
// `finditem` extrait vers `./script-opcodes-item`.

// 1:1 décomp `ScrCmd_pokemart` — open pokemart UI with mart list pointer.
//   MVP : log + skip (= no shop UI yet).
/** 1:1 décomp `ScrCmd_pokemart` (scrcmd.c) :
 *    products = (const u16 *)ScriptReadWord(ctx);
 *    CreatePokemartMenu(products);
 *    ScriptContext_Stop();
 *
 *  Audit session 126 LOT D3 : avant log + no-op, le shop UI complet est
 *  ~3000 lignes décomp (= shop.c). Pour MVP on tente d'invoquer
 *  CreatePokemartMenu via globalThis. Si non exposé : log + skip.
 *
 *  Note : `args[0]` est typiquement un POINTER LABEL (= "DewfordTown_Mart_
 *  Pokemart") qui est résolu au compile time vers une array de u16 itemIds.
 *  Notre runtime a probably la liste dans le scripts JSON sous ce label. */
// `pokemart` / `pokemartdecoration` / `pokemartdecoration2` extraits vers
// `./script-opcodes-shop` (= 1:1 décomp shop.c).

// `setberrytree` stub → real impl 1:1 décomp `berry.c` — voir `./script-opcodes-berry`.

// `braillemsgbox` / `braillemessage` / `brailleformat` / `messageautoscroll`
// extraits vers `./script-opcodes-message`.

// `dofieldeffect` extrait vers `./script-opcodes-fieldeffect` (= 1:1 décomp field_effect.c).

// `setfieldeffectargument` / `waitfieldeffect` early stubs extraits vers `./script-opcodes-fieldeffect`.

// 1:1 décomp `ScrCmd_jumpargeq` / `jumpifbyte` / `jumpifbytewasset` etc. —
//   alternate cond jumps. Treat as no-op fall-through.
// jumpargeq / jumpifbyte / jumpifbytewasset / setarg / endall / end2 / loadword /
// callstd / gotostd / callstd_if / gotostd_if extraits vers `./script-opcodes-control-flow`.

// `settrainerflag` / `cleartrainerflag` / `checktrainerflag` extraits vers `./script-opcodes-battle`.

// ─── Phase 5.7+ iter7 : early-game-specific gap fillers ─────────────────────
// Audit: scripts/audit-early-game-opcodes.mjs found 14 missing opcodes for the
// 20 maps the user actually traverses first.

// `goto_if_not_defeated` / `call_if_defeated` / `goto_if_defeated` extraits vers
// `./script-opcodes-battle`.

// `showmonpic` / `hidemonpic` extraits vers `./script-opcodes-menu` (= 1:1 décomp menu.c).

// 1:1 décomp `ScrCmd_givemon` — gives a Pokemon to player party. 3x usage in
//   early-game (= starter choose alternate path, gift Pokemon).
//   MVP : log + skip (= the actual `starter-choose-flow.ts` does the real work
//   for ChooseStarter, this stub is for other gift flows).
/** 1:1 décomp `ScrCmd_givemon` (scrcmd.c:1683) → `ScriptGiveMon`
 *  (script_pokemon_util.c:61) : species=VarGet(halfword), level=byte,
 *  item=VarGet(halfword) ; CreateMon + SetMonData HELD_ITEM ;
 *  sentToPc = GiveMonToPlayer ; gSpecialVar_Result = sentToPc
 *  (MON_GIVEN_TO_PARTY=0 / MON_GIVEN_TO_PC=1 / MON_CANT_GIVE=2).
 *  Le vrai impl existait sous le mauvais mnémonique `givepokemon` ;
 *  `givemon` (= mnémonique décomp réel) était un STUB qui le masquait
 *  → tous les events cadeau-mon cassés (fossiles/Beldum/in-game trades).
 *  Notre PC a toujours de la place (Émeraude 14 boxes×30) → party
 *  pleine ⇒ MON_GIVEN_TO_PC(1), jamais CANT(2) (= 1:1 comportement). */
// `givemon` extrait vers `./script-opcodes-party`.

// `copyobjectxytoperm` / `disable_jump_landing_ground_effect` extraits vers `./script-opcodes-movement`.

// `pokenavcall` extrait vers `./script-opcodes-message`.

// 1:1 décomp `ScrCmd_pokemartlistend` — data terminator for pokemart lists.
//   4x usage (= each shop has a list ending with this).
// `pokemartlistend` extrait vers `./script-opcodes-shop` (= 1:1 décomp shop.c).

// `setorcopyvar` extrait vers `./script-opcodes-flag-var`.

// `checkpcitem` extrait vers `./script-opcodes-pc-storage`.

// `warpdoor` extrait vers `./script-opcodes-warp`.

// `showobjectat` extrait vers `./script-opcodes-movement`.

// `getplayerxy` / `getpartysize` extraits vers `./script-opcodes-player-avatar`.

// `setescapewarp` extrait vers `./script-opcodes-warp`.

// `giveegg` extrait vers `./script-opcodes-party`.

// ─── Iter10 — bulk stubs for post-game / late-game opcodes ──────────────────
// These are scoped to post-game maps (Battle Frontier, Sootopolis, Mt Pyre,
// Casino, Secret Bases, etc.). Stubs prevent warnings if the user manages to
// reach those maps before we ship full implementations.

// Battle Frontier + Tower/Dome/Factory/Pike/Palace/Arena/Pyramid early stubs
// extraits vers `./script-opcodes-frontier`.

// Money / Coin UI :
// *moneybox / *coinsbox / removemoney early stubs extraits vers `./script-opcodes-money-coins`.

// Flash HM (Mt. Pyre, Granite Cave) :
// `setflashlevel` / `animateflash` early stubs extraits vers `./script-opcodes-screen-fx`.

// rotating-tile-puzzle opcodes extraits vers `./script-opcodes-rotating-tile-puzzle`.

// Secret Base décoration opcodes extraits vers `./script-opcodes-decoration`.

// Other late-game / minigames :
// `setdivewarp` / `setholewarp` extraits vers `./script-opcodes-warp`.
// `dofieldeffectsparkle` early stub extrait vers `./script-opcodes-fieldeffect`.
// `setwildbattle` / `dowildbattle` early stubs extraits vers `./script-opcodes-battle`.
// `dotimebasedevents` / `initclock` extraits vers `./script-opcodes-rtc-clock`.
// `showcontestpainting` extrait vers `./script-opcodes-contest`.
// `playslotmachine` extrait vers `./script-opcodes-slot-machine`.
// setvaddress / vgoto / vcall / vgoto_if_* / vcall_if_* extraits vers
// `./script-opcodes-control-flow`.

// More post-game / battle facility stubs (= further audit findings)
// `removecoins` early stub extrait vers `./script-opcodes-money-coins`.
// seteventmon / frontier_*/tower_*/dome_*/factory_*/pike_*/palace_*/arena_*/
// pyramid_*/tents early stubs extraits vers `./script-opcodes-frontier`.
// `adddecoration` extrait vers `./script-opcodes-decoration`.
// `setwarp` extrait vers `./script-opcodes-warp`.
// init_affine_anim / walk_*_affine / slide_face_* early stubs extraits vers
// `./script-opcodes-movement`.

// ════════════════════════════════════════════════════════════════════════════
// SESSION 131 — 1:1 décomp opcode completion. Reste à extraire :
// control-flow / setvaddress / loadword / setbyte / setarg / jump* / endall / end2.
//
// Source de vérité 1:1 :
//   - `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c` (= field opcodes)
//   - `D:/Projet 1/decomps/pokeemeraude/asm/macros/event.inc` (= macros)
//   - `D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_tent.inc`
//   - `D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_frontier/*.inc`
// ════════════════════════════════════════════════════════════════════════════

// ─── Module-level state (1:1 décomp globals) ────────────────────────────────

/** 1:1 décomp `sAddressOffset` (scrcmd.c:48). Set par `setvaddress`, utilisé
 *  par `vgoto/vcall/vmessage/vbufferstring`. Pour les scripts Mystery Event
 *  qui pointent vers du bytecode RAM relatif à un base addr. */
let _sAddressOffset = 0;

// `_sFieldEffectScriptId` + `_gFieldEffectArguments` extraits vers `./script-opcodes-fieldeffect`.

// `_gFlashLevel` extrait vers `./script-opcodes-screen-fx`.

/** Virtual objects (1:1 décomp `gVirtualObjects[VIRTUAL_OBJECT_COUNT]`).
 *  Sprites décoratifs non-interactifs (e.g., enfant qui court dans cutscene,
 *  pokemon dans une cage). Identifiés par `virtualObjId` 0..15. Notre port :
 *  map indexée par ID, stocke graphics + pos + direction. Le rendering OAM
 *  les ajoute après les ObjectEvents. */
interface VirtualObject {
  active: boolean;
  graphicsId: number;
  x: number;
  y: number;
  elevation: number;
  direction: number;
}
const _gVirtualObjects: Map<number, VirtualObject> = new Map();

/** 1:1 décomp `gApproachingTrainers` (trainer_see.c). Set par TrySetUpTrainerEncountersEvent quand
 *  un trainer voit le player. Le premier de la liste devient active. Notre port :
 *  pour l'instant on tracke juste le current approaching trainer object event id. */
let _sCurrentApproachingTrainerObjectEventId = 0;

/** 1:1 décomp `sBerryTrees[BERRY_TREES_COUNT]` (berry.c). Persisté dans
 *  gSaveBlock1Ptr->berryTrees. Notre port a déjà l'array dans save-blocks.ts. */
// `_berryTreesArr` extrait vers `./script-opcodes-berry`.

// ─── Helpers privés (1:1 décomp) ─────────────────────────────────────────────

function _vget(arg: string | undefined): number {
  return VarGet(arg ?? '0');
}

function _isInTrainerLink(): boolean {
  // 1:1 décomp `IsOverworldLinkActive` (overworld.c) : returns TRUE si le
  // player est dans un Union Room (= link battle). Notre port : pas de link
  // mode → toujours FALSE.
  return false;
}

// ─── Std scripts dispatch (1:1 décomp gStdScripts) ──────────────────────────
// gStdScripts[] (= event_scripts.s:95-107) :
//   STD_OBTAIN_ITEM (0)  → Std_ObtainItem
//   STD_FIND_ITEM (1)    → Std_FindItem
//   MSGBOX_NPC (2)       → Std_MsgboxNPC
//   MSGBOX_SIGN (3)      → Std_MsgboxSign
//   MSGBOX_DEFAULT (4)   → Std_MsgboxDefault
//   MSGBOX_YESNO (5)     → Std_MsgboxYesNo
//   MSGBOX_AUTOCLOSE (6) → Std_MsgboxAutoclose (= n'existe pas en décomp,
//                          alias de MSGBOX_DEFAULT)
//   STD_OBTAIN_DECORATION (7) → Std_ObtainDecoration
//   STD_REGISTER_MATCH_CALL (8) → Std_RegisteredInMatchCall
//   MSGBOX_GETPOINTS (9) → Std_MsgboxGetPoints
//   MSGBOX_POKENAV (10)  → Std_MsgboxPokenav (unused, alias de pokenavcall)
//
// Les std scripts sont des scripts SHARED (= called par MULTIPLE map scripts).
// Comme nos extracted scripts.json ne contient PAS les std scripts (= ils sont
// dans `data/scripts/std_msgbox.inc` séparément, pas dans `data/maps/X/scripts.inc`),
// notre opcode `callstd/gotostd` doit dispatch direct vers une impl inline.
//
// Note : la macro `msgbox TEXT, TYPE` du décomp compile à `loadword 0, TEXT
// + callstd TYPE`. Notre extracteur garde `msgbox TEXT, TYPE` direct (= notre
// opcode `msgbox` gère TYPE inline déjà). Donc callstd/gotostd ne sont appelés
// quasi-jamais (= 0 usages dans nos extracted scripts au 2026-05-15).
function _runStdScript(ctx: ScriptContext, stdIndex: number, isCall: boolean): boolean {
  void ctx;
  // Le std script utilise ctx->data[0] comme text pointer. Notre extracteur
  // ne préserve pas ctx->data, donc on ne peut pas display le msg. Mais on
  // peut au moins log et noter quel std fut appelé.
  // Future : si l'extracteur emet loadword + callstd, brancher data[0] → text.
  void isCall;
  switch (stdIndex) {
    case 0: case 7: case 8: case 9: case 10: {
      // STD_OBTAIN_ITEM/OBTAIN_DECORATION/REGISTER_MATCH_CALL/GETPOINTS/POKENAV.
      // Tous play un fanfare + display un msg. Sans ctx.data[0] on log juste.
      console.log(`[opcode std] dispatch ${stdIndex} (no text ctx — likely OK for 0-usage opcodes)`);
      return false;
    }
    case 1: {
      // STD_FIND_ITEM : lock + faceplayer 1:1 STRICT via FreezeObjectEvent
      // (= sinon anim sprite continue à cycler pendant le pickup).
      const npc = getSelectedNpc();
      if (npc) {
        FreezeObjectEvent(npc);
        npc.facingDirection = OPPOSITE_DIR[GetPlayerFacingDirection()] ?? DIR_SOUTH;
      }
      console.log('[opcode std] STD_FIND_ITEM dispatch');
      return false;
    }
    case 2: case 3: case 4: case 5: case 6: {
      // MSGBOX_NPC/SIGN/DEFAULT/YESNO/AUTOCLOSE : behaviour gérée par notre
      // opcode `msgbox` directement (= scripts emit `msgbox TEXT, TYPE` au lieu
      // de `loadword + callstd`). Log only.
      console.log(`[opcode std] MSGBOX_* dispatch (handled inline by msgbox opcode)`);
      return false;
    }
  }
  return false;
}

// Std scripts dispatch / virtual address / native function calls extraits vers
// `./script-opcodes-control-flow`.

// ─── RAM ops + battle anim opcodes extraits vers `./script-opcodes-control-flow` ─
// (loadword/setarg/jumpargeq/jumpifbyte/jumpifbytewasset/setptr/setptrbyte/
//  loadbyte/loadbytefromptr/copybyte/copylocal + battle anim _safeStubOpcodes).

// `preparemsg` extrait vers `./script-opcodes-string`.

// ─── Waits (1:1 décomp ScrCmd_wait*) ────────────────────────────────────────
// `waitse` / `waitplaysewithpan` / `waitmoncry` extraits vers `./script-opcodes-sound`.

// waitfieldeffect / setfieldeffectargument / dofieldeffectsparkle real impls
// extraits vers `./script-opcodes-fieldeffect`.

// ─── Pokemon picture extraits vers `./script-opcodes-menu`. ─────────────────

// `selectapproachingtrainer` / `lockfortrainer` real impls extraits vers `./script-opcodes-lock`.

// `setobjectsubpriority` / `resetobjectsubpriority` / `createvobject` /
// `turnvobject` real impls extraits vers `./script-opcodes-movement`.

// `setflashlevel` / `animateflash` real impls extraits vers `./script-opcodes-screen-fx`.

// `setmaplayoutindex` + `setstepcallback` extraits vers `./script-opcodes-fieldmap`
// (= 1:1 décomp fieldmap.c + field_tasks.c).

// ─── Berry tree (1:1 décomp ScrCmd_setberrytree) ────────────────────────────
// Real impl 1:1 décomp `berry.c` — voir `./script-opcodes-berry`.

// Money & coins real impls extraits vers `./script-opcodes-money-coins`
// (= 1:1 décomp money.c + coins.c).

// `dotimebasedevents` real impl extrait vers `./script-opcodes-rtc-clock`.

// ─── Special warps extraits vers `./script-opcodes-warp` ─────────────────
// setwarp / setdivewarp / setholewarp / warphole / warpteleport / warpmossdeepgym.

// `warpspinenter` extrait vers `./script-opcodes-warp`.

// ─── Decorations (1:1 décomp) ───────────────────────────────────────────────
// Decorations sont des items spéciaux placés dans la Secret Base. Système
// complet (DecorationAdd, CheckHasDecoration, etc.) est post-MVP, on stocke
// un placeholder array.

// Decorations (adddecoration/givedecoration/takedecoration/checkdecor/
// checkdecorspace/movedecoration) extraites vers `./script-opcodes-decoration`
// (= 1:1 décomp decoration.c + decoration_inventory.c).

// `pokemartdecoration` / `pokemartdecoration2` / `pokemartlistend` extraits vers
// `./script-opcodes-shop` (= 1:1 décomp shop.c).

// `braillemessage` / `brailleformat` real impls extraits vers `./script-opcodes-message`.

// ─── Rotating tile puzzles (Mossdeep Gym + Trick House) ─────────────────────

// rotating-tile-puzzle / playslotmachine / showcontestpainting real impls extraits
// vers `./script-opcodes-rotating-tile-puzzle` / `./script-opcodes-slot-machine` /
// `./script-opcodes-contest`.

// `addelevmenuitem` / `showelevmenu` extraits vers `./script-opcodes-menu`.

// ─── Wild battles real impls extraits vers `./script-opcodes-battle` ───────
// (Real impl dowildbattle extrait vers `./script-opcodes-battle`.)

// ─── Event Mon (= seteventmon) extrait vers `./script-opcodes-frontier`.

// `disable_jump_landing_ground_effect` / `hideobjectat` real impls extraits vers
// `./script-opcodes-movement`.

// ═══════════════════════════════════════════════════════════════════════════
// BATTLE FRONTIER / TENT MACROS (1:1 décomp expansion)
// ═══════════════════════════════════════════════════════════════════════════
// Ces opcodes sont des MACROS asm (= pas dans scrcmd.c). Chacune expand à :
//   setvar VAR_0x8004, FUNC_ID
//   [setvar VAR_0x8005, data]
//   [setvar VAR_0x8006, val]
//   special Call<Facility>Function
// Notre extracteur garde le nom de la macro. On reproduit l'expansion ici :
// vars set + special call.
//
// Le specials registry contient les CallXxxFunction handlers (= stubs pour
// l'instant, futurs full implementations).
// ═══════════════════════════════════════════════════════════════════════════

// Frontier opcodes (= frontier_util.c) extraits vers `./script-opcodes-frontier`.

// Battle Tower/Dome/Factory/Pike/Palace/Arena/Pyramid/Tents opcodes extraits
// vers `./script-opcodes-frontier`.

// ─── Movement actions (slide_face / walk_*_affine / init_affine_anim) ───────
// 1:1 décomp NOTE : ce ne sont PAS des opcodes script, mais des MOVEMENT
// ACTIONS (= bytes dans un movement script passé à `applymovement`). Nos
// scripts contiennent parfois ces tokens directement → on les expose comme
// opcodes no-op pour éviter les warnings (= leur effet réel est dans le
// movement system géré via applymovement + waitmovement).

// `slide_face_*` / `walk_*_affine` / `init_affine_anim` movement actions
// extraites vers `./script-opcodes-movement`.

// ═══════════════════════════════════════════════════════════════════════════
// MISSING DECOMP OPCODES (= toutes les entries de gScriptCmdTable manquantes)
// Source : `data/script_cmd_table.inc` (227 opcodes total, 0x00-0xE2).
// ═══════════════════════════════════════════════════════════════════════════

// nop/nop1/returnram/endram/RAM ops/compare_variants/goto_if/call_if extraits
// vers `./script-opcodes-control-flow`.

// ─── Movement at (variant avec mapGroup/mapNum) ─────────────────────────────

// `applymovementat` / `waitmovementat` / `removeobjectat` / `addobjectat` extraits
// vers `./script-opcodes-movement`.

// `dotrainerbattle` / `gotopostbattlescript` / `gotobeatenscript` extraits vers
// `./script-opcodes-battle`.

// ─── Item helpers extraits vers `./script-opcodes-item` ────────────────────

// `addpcitem` extrait vers `./script-opcodes-pc-storage`.

// `removedecoration` extrait vers `./script-opcodes-decoration`.

// ─── Box drawing (RS-era, removed in Emerald — all nop1) ────────────────────

// `drawbox` / `erasebox` / `drawboxtext` extraits vers `./script-opcodes-menu`.

// `setmonmove` / `setmonmetlocation` extraits vers `./script-opcodes-party`
// (= 1:1 décomp party_menu.c + script_pokemon_util.c).

// Contest opcodes (choose/start/show/link) extraits vers `./script-opcodes-contest`.

// ─── PokéNews / TV ─────────────────────────────────────────────────────────
// `getpokenewsactive` extrait vers `./script-opcodes-tv` (= 1:1 décomp tv.c).

// ─── Modern fateful encounter / Wonder Card / setworldmapflag ──────────────
// Extraits vers `./script-opcodes-mystery-event` (= 1:1 décomp mystery_event_script.c).

// ─── Braille extras ─────────────────────────────────────────────────────────

// `closebraillemessage` extrait vers `./script-opcodes-message`.

// `vbuffermessage` extrait vers `./script-opcodes-string`.

// `script_cmd_table_entry` extrait vers `./script-opcodes-control-flow`.

// NOTE : les opcodes ci-dessous (= `_safeStubOpcodes` + `_otherVmStubs`) ne sont
// PAS dans scrcmd.c — ce sont d'autres VMs (battle_anim_script.inc, battle_script.inc,
// battle_ai_script.inc, contest_ai.inc, fldeff.inc, movement.inc, etc.). Notre
// extracteur les collecte par regex (= via `scripts/extract-opcodes.mjs`) mais
// ils ne sont jamais exécutés par le field script VM. Le `for` loop ci-dessous
// les registre comme no-op safe pour éviter les warnings `[script-runtime] opcode
// 'X' not implemented`. Garder dans script-opcodes.ts (= pas de fichier décomp
// scrcmd.c à mapper). À porter dans leur runtime respectif (= battle-flow.ts,
// battle-anim.ts, etc.) en session dédiée si besoin.

const _safeStubOpcodes = [
  // Battle anim primitives (= battle_anim_script.inc) — différent VM.
  'createsprite', 'createvisualtask', 'step_end', 'waitforvisualfinish',
  'loadspritegfx', 'unloadspritegfx', 'monbg', 'clearmonbg', 'splitbgprio',
  'splitbgprio_all', 'monbg_static', 'clearmonbg_static', 'monbgprio_28',
  'jumpargeq', 'jumpargnoteq', 'jumpifcontest', 'jumprettrue', 'jumpreteq',
  'panse', 'panse_adjustnone', 'panse_adjustall', 'fadetobg', 'restorebg',
  'waitbgfadeout', 'waitbgfadein', 'fadetobgfromset', 'changebgattribute',
  'invert_screen_color', 'simple_palette_blend', 'complex_palette_blend',
  'blend_color_cycle', 'invert_palettes', 'monbg_22',
  'translatebattlebgpal', 'createsoundtask', 'doublebattle_2D',
  'doublebattle_2E', 'invertscreencolor', 'stopsound', 'stopanim',
  // Battle script (battle_script.inc) opcodes — VM different.
  'attackcanceler', 'attackstring', 'ppreduce', 'critcalc', 'damagecalc',
  'typecalc', 'adjustnormaldamage', 'adjustnormaldamage2', 'attackanimation',
  'waitanimation', 'healthbarupdate', 'datahpupdate', 'critmessage',
  'effectivenesssound', 'resultmessage', 'printstring', 'printfromtable',
  'setmoveeffect', 'setlowhealth', 'forcerandomswitch', 'metronome',
  'jumpifstatus2', 'jumpifstatus', 'jumpifability', 'jumpifstat',
  'jumpifmove', 'jumpifsubstituteblocks', 'jumpifbattletype',
  'tryfaintmon', 'statbuffchange', 'orword', 'andword', 'setbyte',
  'setwordfromptr', 'addbyte', 'subbyte', 'addhalfword', 'subhalfword',
  'addword', 'subword', 'sethalfword', 'setword', 'pause', 'playanimation',
  'playanimation2', 'cureifburnedparalyzedorpoisoned', 'volumeup',
  'volumedown', 'set_invisible', 'set_visible', 'showplayer', 'hideplayer',
  'updatestatusicon', 'rapidspinfree', 'getsecretpowereffect',
  'settypebasedhalvers', 'setweatherballtype', 'settypetoenvironment',
  'jumpifnopursuitswitchdmg', 'getbattlerfainted', 'drawlvlupbox',
  'yesnoboxlearnmove', 'yesnoboxstoplearningmove',
  'updatechoicemoveonlvlup', 'copyarraywithindex', 'weatherdamage',
  'setmagiccoattarget', 'snatchsetbattlers', 'trycastformdatachange',
  'docastformchangeanimation', 'trygetintimidatetarget',
  'seteffectsecondary', 'tryswapabilities', 'tryimprison', 'trysetgrudge',
  'trysetsnatch', 'weightdamagecalculation', 'tryconversiontypechange',
  'palacetryescapestatus', 'palaceflavortext', 'arenaopponentmonlost',
  'arenaplayermonlost', 'arenabothmonlost', 'forfeityesnobox',
  'jumpifplayerran', 'setatktoplayer0', 'atknameinbuff1',
  'resetintimidatetracebits', 'resetsentmonsvalue', 'resetplayerfainted',
  'cancelallactions', 'getmoneyreward', 'givepaydaymoney',
  'playtrainerdefeatbgm', 'printselectionstringfromtable',
  'trysetcaughtmondexflags', 'displaydexinfo', 'trygivecaughtmonnick',
  'updatebattlertypes', 'setgastroacidoff', 'setatkhppercent',
  'unfreezeincaseofmagmastorm', 'sethpdamagefrommetronome',
  'sketch', 'transformdataexecution', 'returnatktoball', 'restoreplayer',
  'jumpifcantswitchout', 'pursuit_relateddmg', 'pursuit_processstatuschange',
  'pursuit_setduplicate', 'pursuit_setdmgsource', 'restoreatktoball',
  'snatchsetstatus', 'cureifburnedstatus', 'jumpiftargetally',
  'jumpifsafeguardup', 'enduretrap', 'pursuit_setvalues',
  'jumpifabilitydefnotonfield', 'jumpifabilitydefonfield',
  'protectanduseendured', 'createbattlestartpaltask', 'playmagiccoatanim',
  'metronomeevent', 'snatchmove', 'maximize_atkstat', 'splashanimation',
  'displaybellsplash', 'mimicattackcopy', 'painsplitdmgcalc',
  'tryswapitems', 'trycopyability', 'trywish', 'trysetspikes',
  'trysetfutureattack', 'trydobeatup', 'setsemiinvulnerablebit',
  'clearsemiinvulnerablebit', 'tryencore', 'trycastform',
  'createremovedustsprite', 'flytarget_intro_anim', 'flytarget_invisible',
  'getswitchedmondata', 'switchindataupdate', 'switchinanim',
  'jumpifcantmakeasleep', 'stockpile', 'stockpiletobasedamage',
  'stockpiletohpheal', 'setdrainedhp', 'statbuffchange_b',
  'jumpiftype', 'jumpifabsent', 'jumpifsubstituteexists', 'tryrecycleitem',
  'pickup', 'getshouldswitchpartyforitem', 'switchindataupdate2',
  'switchinjmp', 'switchindataupdate3', 'sortstatchanges',
  'jumpifoneofstatlevelsbest', 'pickupone', 'pickupall',
  'jumpifusedheldpercentitem', 'snatchsetbattlers2', 'snatchmove2',
  'pickupanditem', 'pickupmoneyfound', 'pickuptally',
  'getbattlerfainted_calc', 'cureifburnedparalyzedorpoisoned_calc',
  'face_left', 'face_right', 'face_up', 'face_down',
  // Movement actions used in scripts but aren't really opcodes.
  'walk_up', 'walk_down', 'walk_left', 'walk_right',
  'walk_in_place_up', 'walk_in_place_down', 'walk_in_place_left', 'walk_in_place_right',
  'walk_in_place_faster_up', 'walk_in_place_faster_down', 'walk_in_place_faster_left', 'walk_in_place_faster_right',
  'walk_fast_up', 'walk_fast_down', 'walk_fast_left', 'walk_fast_right',
  'walk_faster_up', 'walk_faster_down', 'walk_faster_left', 'walk_faster_right',
  'walk_slow_up', 'walk_slow_down', 'walk_slow_left', 'walk_slow_right',
  'walk_slow_diag_northeast', 'walk_slow_diag_northwest',
  'walk_slow_diag_southeast', 'walk_slow_diag_southwest',
  'lock_facing_direction', 'unlock_facing_direction',
  'slide_up', 'slide_down', 'slide_left', 'slide_right',
  'slide_slow_up', 'slide_slow_down', 'slide_slow_left', 'slide_slow_right',
  'slide_fast_up', 'slide_fast_down', 'slide_fast_left', 'slide_fast_right',
  'jump_up', 'jump_down', 'jump_left', 'jump_right',
  'jump_in_place_up', 'jump_in_place_down', 'jump_in_place_left', 'jump_in_place_right',
  'jump_in_place_left_right', 'jump_in_place_up_down',
  'fly_up', 'fly_down',
  // Field effect script opcodes (= different VM).
  'field_eff_callnative', 'field_eff_end', 'field_eff_loadpal',
  'field_eff_loadfadedpal', 'field_eff_loadgfx_callnative',
  'field_eff_loadpal_callnative', 'field_eff_loadfadedpal_callnative',
  'field_eff_loadfadedpalblack', 'field_eff_loadfadedpalblack_callnative',
  // Contest AI script opcodes.
  'if_most_appealing_move', 'if_move_excitement_less_than',
  'if_move_used_count_more_than', 'if_would_finish_combo',
  'if_move_used_count_not_eq', 'if_not_combo_starter',
  'if_not_combo_finisher', 'if_not_last_appeal',
  'if_excitement_less_than', 'if_user_condition_less_than',
  'if_random_less_than', 'if_user_order_eq', 'if_user_order_not_eq',
  'if_target_faster', 'if_can_participate', 'if_in_bytes',
  'if_stat_level_more_than', 'if_stat_level_less_than',
  'if_stat_level_equal', 'if_hp_more_than', 'if_hp_less_than',
  'if_status', 'if_status2', 'if_type_effectiveness', 'if_move', 'if_effect',
  'if_effect_eq', 'if_equal', 'if_not_equal',
  'score', 'def_special', 'jumpifhalfword', 'jumpifword',
  'jumpifarrayequal', 'jumpifarraynotequal', 'jumpifbyteequal', 'jumpifbytenotequal',
  'jumpifbytewasset_inc', 'jumpifaiability', 'setstatchanger',
  'create_basic_hitsplat_sprite', 'create_overheat_flame_sprite',
  'create_razor_leaf_particle_sprite', 'create_absorption_orb_sprite',
  'create_power_absorption_orb_sprite', 'create_flashing_hitsplat_sprite',
  'create_outrage_flame_sprite', 'createmonscanline',
  'movewavetask', 'createmusicmovementeffect',
  'apprentice_msg', 'apprentice_random_msg',
  // Misc remaining stubs.
  'delay_4', 'delay_8', 'delay_16', 'delay_2',
  'get_ability', 'get_last_used_bank_move', 'setalpha', 'blendoff',
  'accuracycheck', 'damagecalc', 'maximize_def', 'haszero',
];
for (const op of _safeStubOpcodes) {
  // Ne PAS override les real impls. _handlersHas check via getOpcodeHandler.
  if (getOpcodeHandler(op) === undefined) {
    registerOpcode(op, (_ctx, _args) => false);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BULK SAFE STUBS — opcodes des AUTRES VMs (battle / anim / AI / contest /
// movement actions / field effect scripts). Notre extracteur les collecte par
// regex, mais ils ne sont JAMAIS exécutés par le field script VM (= chacun a
// son propre runtime ailleurs dans la décomp). Les registrer ici comme no-op
// safe évite les warnings `[script-runtime] opcode 'X' not implemented`.
//
// Source : les opcodes ci-dessous viennent de :
//   - `asm/macros/battle_script.inc` (= battle script VM, ~150 opcodes)
//   - `asm/macros/battle_anim_script.inc` (= battle anim VM, ~80 opcodes)
//   - `asm/macros/battle_ai_script.inc` (= AI script VM, ~70 opcodes)
//   - `asm/macros/contest_ai.inc` (= contest AI VM, ~50 opcodes)
//   - `asm/macros/fldeff.inc` (= field effect VM, ~10 opcodes)
//   - `asm/macros/movement.inc` (= movement actions, ~100 actions)
//   - `asm/macros/battle_frontier/*.inc` (= frontier facility extras)
// ═══════════════════════════════════════════════════════════════════════════

const _otherVmStubs: string[] = [
  // ─ Battle script VM ─
  'accuracycheck', 'attackcanceler', 'attackstring', 'ppreduce', 'critcalc',
  'damagecalc', 'typecalc', 'typecalc2', 'adjustnormaldamage',
  'adjustnormaldamage2', 'adjustsetdamage', 'attackanimation', 'waitanimation',
  'healthbarupdate', 'datahpupdate', 'critmessage', 'effectivenesssound',
  'resultmessage', 'printstring', 'printfromtable', 'setmoveeffect',
  'setlowhealth', 'forcerandomswitch', 'metronome', 'jumpifstatus',
  'jumpifstatus2', 'jumpifstatus3', 'jumpifability', 'jumpifabilitypresent',
  'jumpifstat', 'jumpifmove', 'jumpifnotmove', 'jumpiftype', 'jumpiftype2',
  'jumpifabsent', 'jumpifsubstituteblocks', 'jumpifbattletype', 'jumpifnotbattletype',
  'jumpifcantmakeasleep', 'jumpifcantswitch', 'jumpifcantswitchout',
  'jumpifconfusedandstatmaxed', 'jumpifhasnohp', 'jumpifmovehadnoeffect',
  'jumpifmoveturn', 'jumpifnexttargetvalid', 'jumpifnodamage', 'jumpifnostatus3',
  'jumpifnotfirstturn', 'jumpifnopursuitswitchdmg', 'jumpifside_affecting',
  'jumpifsideaffecting', 'jumpifusedheldpercentitem', 'jumpifword',
  'jumpifhalfword', 'jumpifbyteequal', 'jumpifbytenotequal', 'jumpifbytewasset',
  'jumpifbytewasset_inc', 'jumpifaiability', 'jumpifarrayequal',
  'jumpifarraynotequal', 'jumpifsubstituteexists', 'jumpiftargetally',
  'jumpifsafeguardup', 'jumpifabilitydefnotonfield', 'jumpifabilitydefonfield',
  'jumpiftargetnotally', 'tryfaintmon', 'tryfaintmon_spikes', 'tryfaintmon_calc',
  'statbuffchange', 'statbuffchange_b', 'orbyte', 'orword', 'andbyte', 'andword',
  'bicbyte', 'bicword', 'setbyte', 'setword', 'sethword', 'setwordfromptr',
  'addbyte', 'subbyte', 'addhalfword', 'subhalfword', 'addword', 'subword',
  'addhword', 'copyhword', 'copyword', 'copyarray', 'copyarraywithindex',
  'pause', 'playanimation', 'playanimation_var', 'playanimation2', 'playfaintcry',
  'playstatchangeanimation', 'playtrainerdefeatbgm', 'cureifburnedparalyzedorpoisoned',
  'cureifburnedstatus', 'cureifburnedparalyzedorpoisoned_calc', 'volumeup',
  'volumedown', 'set_invisible', 'set_visible', 'showplayer', 'hideplayer',
  'updatestatusicon', 'rapidspinfree', 'getsecretpowereffect',
  'settypebasedhalvers', 'setweatherballtype', 'settypetoenvironment',
  'settypetorandomresistance', 'getbattlerfainted', 'getbattlerfainted_calc',
  'drawlvlupbox', 'yesnoboxlearnmove', 'yesnoboxstoplearningmove',
  'updatechoicemoveonlvlup', 'weatherdamage', 'setmagiccoattarget',
  'snatchsetbattlers', 'snatchsetbattlers2', 'trycastformdatachange',
  'docastformchangeanimation', 'trygetintimidatetarget', 'seteffectsecondary',
  'seteffectprimary', 'seteffectwithchance', 'tryswapabilities', 'tryimprison',
  'trysetgrudge', 'trysetsnatch', 'trysetdestinybondtohappen', 'trysetencore',
  'trysetfutureattack', 'trysetspikes', 'trydobeatup', 'tryexplosion',
  'tryconversiontypechange', 'trychoosesleeptalkmove', 'tryconversion',
  'tryhealhalfhealth', 'trymirrormove', 'trywish', 'trycopyability',
  'trycastform', 'trymemento', 'tryinfatuating', 'trysethelpinghand',
  'trysetmagiccoat', 'trysetperishsong', 'trysetrest', 'trysetroots',
  'tryspiteppreduce', 'tryswapitems', 'tryrecycleitem', 'trysetcaughtmondexflags',
  'trygivecaughtmonnick', 'transformdataexecution', 'metronomeevent',
  'snatchmove', 'snatchmove2', 'snatchsetstatus', 'sketch',
  'weightdamagecalculation', 'magnitudedamagecalculation', 'painsplitdmgcalc',
  'mirrorcoatdamagecalculator', 'rolloutdamagecalculation', 'presentdamagecalculation',
  'furycuttercalc', 'hpthresholds', 'hpthresholds2', 'counterdamagecalculator',
  'friendshiptodamagecalculation', 'recoverbasedonsunlight', 'remaininghptopower',
  'scaledamagebyhealthratio', 'maxattackhalvehp', 'manipulatedamage',
  'negativedamage', 'damagetohalftargethp', 'setdamagetohealthdifference',
  'setdrainedhp', 'sethpdamagefrommetronome', 'hiddenpowercalc', 'dmgtolevel',
  'doubledamagedealtifdamaged', 'unfreezeincaseofmagmastorm',
  'palacetryescapestatus', 'palaceflavortext', 'arenaopponentmonlost',
  'arenaplayermonlost', 'arenabothmonlost', 'forfeityesnobox', 'jumpifplayerran',
  'setatktoplayer0', 'atknameinbuff1', 'resetintimidatetracebits',
  'resetsentmonsvalue', 'resetplayerfainted', 'cancelallactions',
  'getmoneyreward', 'givepaydaymoney', 'printselectionstringfromtable',
  'printselectionstring', 'displaydexinfo', 'pickup', 'pickupall', 'pickupone',
  'pickupanditem', 'pickupmoneyfound', 'pickuptally', 'sortstatchanges',
  'jumpifoneofstatlevelsbest', 'stockpile', 'stockpiletobasedamage',
  'stockpiletohpheal', 'statusanimation', 'status2animation',
  'chosenstatus2animation', 'splashanimation', 'displaybellsplash',
  'mimicattackcopy', 'getswitchedmondata', 'switchindataupdate',
  'switchindataupdate2', 'switchindataupdate3', 'switchinanim',
  'switchinjmp', 'switchineffects', 'switchoutabilities', 'switchhandleorder',
  'fadebackground', 'finishaction', 'finishturn', 'finishmove',
  'restoreatktoball', 'returnatktoball', 'returnopponentmon1toball',
  'returnopponentmon2toball', 'returntoball', 'restoreplayer',
  'cancelmultiturnmoves', 'cleareffectsonfaint', 'clearstatusfromeffect',
  'pursuit_relateddmg', 'pursuit_processstatuschange', 'pursuit_setduplicate',
  'pursuit_setdmgsource', 'pursuit_setvalues', 'protectanduseendured',
  'createbattlestartpaltask', 'playmagiccoatanim', 'flytarget_intro_anim',
  'flytarget_invisible', 'maximize_atkstat', 'enduretrap',
  'setsemiinvulnerablebit', 'clearsemiinvulnerablebit', 'tryencore',
  'createremovedustsprite', 'normalisebuffs', 'movevaluescleanup', 'moveendall',
  'moveendcase', 'moveendfrom', 'moveendfromto', 'moveendto', 'movewavetask',
  'createmusicmovementeffect', 'createmonscanline', 'createsoundtask',
  'callenvironmentattack', 'damageamttostorageinflict', 'damageamttoinflict',
  'damageamttodec', 'damageamttoset', 'changebg', 'fadetobgfromset',
  'fadetobg', 'restorebg', 'waitbgfadeout', 'waitbgfadein', 'changebgattribute',
  'invertscreencolor', 'translatebattlebgpal', 'invert_screen_color',
  'simple_palette_blend', 'complex_palette_blend', 'blend_color_cycle',
  'blend_color_cyclebytag', 'blend_color_cycleexclude', 'invert_palettes',
  'set_grayscale_pal', 'set_original_pal', 'flash_anim_tag_with_color',
  'metallic_shine', 'shrink_target_copy', 'shake_battle_platforms',
  'shake_mon_or_platform', 'trainerslidein', 'trainerslideout',
  'reveal_trainer', 'levitate', 'visible', 'invisible', 'makevisible',
  'lock_anim', 'disable_anim', 'clear_affine_anim', 'destroy_extra_task',
  'fanfare', 'waitcry', 'waitsound', 'stopsound', 'stopanim',
  'attacker_fade_from_invisible', 'attacker_fade_to_invisible',
  'getmovetarget', 'selectfirstvalidtarget', 'swapattackerwithtarget',
  'jumprettrue', 'jumpretfalse', 'jumpreteq', 'jumpifcontest',
  'jumptocalledmove', 'jumpargeq', 'jumpargnoteq',
  'monbg', 'monbg_static', 'monbg_22', 'clearmonbg', 'clearmonbg_static',
  'monbgprio_28', 'splitbgprio', 'splitbgprio_all', 'splitbgprio_foes',
  'doublebattle_2D', 'doublebattle_2E', 'setpan', 'panse', 'panse_adjustnone',
  'panse_adjustall', 'panse_1B', 'setalpha', 'blendoff', 'choosetwoturnanim',
  'setalreadystatusedmoveattempt', 'setalwayshitflag', 'setatkhppercent',
  'setatkhptozero', 'setbide', 'setcharge', 'setdefensecurlbit', 'setdestinybond',
  'setfocusenergy', 'setforcedtarget', 'setforesight', 'setgraphicalstatchangevalues',
  'sethail', 'setlightscreen', 'setminimize', 'setmist', 'setmultihit',
  'setmultihitcounter', 'setoutcomeonteleport', 'setprotectlike', 'setrain',
  'setreflect', 'setsafeguard', 'setsandstorm', 'setseeded', 'setsubstitute',
  'setsunny', 'settaunt', 'settorment', 'setyawn', 'cursetarget',
  'setatkhptozero', 'setgastroacidoff', 'haszero', 'maximize_def',
  'count_usable_party_mons', 'getshouldswitchpartyforitem', 'is_first_turn_for',
  'cut_tree', 'rock_smash_break', 'ride_water_current_up', 'nurse_joy_bow',
  'emote_exclamation_mark', 'emote_question_mark', 'emote_heart',
  'face_away_player', 'face_original_direction', 'face_player',
  'face_left', 'face_right', 'face_up', 'face_down',
  'lock_facing_direction', 'unlock_facing_direction',
  'createleechseedsprite', 'removelightscreenreflect',
  'updatebattlertypes', 'decrementmultihit', 'getexp',
  'getifcantrunfrombattle', 'handleballthrow', 'handlelearnnewmove',
  'healpartystatus', 'hidepartystatussummary', 'hitanimation', 'dofaintanimation',
  'drawpartystatussummary', 'flee', 'end3', 'endlinkbattle', 'endselectionscript',
  'givecaughtmon', 'initmultihitstring', 'openpartyscreen', 'useitemonopponent',
  'buffermovetolearn', 'assistattackselect',
  'callmove', 'copyfoestats', 'copymovepermanently', 'checkteamslost',
  'confuseifrepeatingattackends', 'disablelastusedattack',
  'get_ability', 'get_considered_move_effect', 'get_curr_move_type',
  'get_gender', 'get_hold_effect', 'get_how_powerful_move_is',
  'get_last_used_bank_move', 'get_move_effect_from_result',
  'get_move_power_from_result', 'get_move_type_from_result', 'get_protect_count',
  'get_stockpile_count', 'get_target_type1', 'get_target_type2',
  'get_turn_count', 'get_used_held_item', 'get_user_type1', 'get_user_type2',
  'get_weather', 'getswitchedmondata',
  // ─ Battle anim sprite creators ─
  'createsprite', 'createvisualtask', 'step_end', 'waitforvisualfinish',
  'loadspritegfx', 'unloadspritegfx', 'create_basic_hitsplat_sprite',
  'create_overheat_flame_sprite', 'create_razor_leaf_particle_sprite',
  'create_razor_leaf_cutter_sprite', 'create_absorption_orb_sprite',
  'create_power_absorption_orb_sprite', 'create_flashing_hitsplat_sprite',
  'create_clamp_jaw_sprite', 'create_claw_slash_sprite',
  'create_confusion_duck_sprite', 'create_constrict_binding_sprite',
  'create_cross_impact_sprite', 'create_dragon_breath_fire_sprite',
  'create_dragon_dance_orb_sprite', 'create_dragon_rage_fire_plume_sprite',
  'create_dragon_rage_fire_spit_sprite', 'create_frenzy_plant_root_sprite',
  'create_handle_invert_hitsplat_sprite', 'create_hyper_beam_orb_sprite',
  'create_ingrain_orb_sprite', 'create_ingrain_root_sprite',
  'create_item_steal_sprite', 'create_leaf_blade_task',
  'create_leech_life_needle_sprite', 'create_linear_stinger_sprite',
  'create_megahorn_horn_sprite', 'create_mimic_orb_sprite',
  'create_mon_edge_hitsplat_sprite', 'create_outrage_flame_sprite',
  'create_persist_hitsplat_sprite', 'create_petal_dance_big_flower_sprite',
  'create_petal_dance_small_flower_sprite', 'create_pin_missile_sprite',
  'create_poison_powder_particle_sprite', 'create_present_heal_particle_sprite',
  'create_present_sprite', 'create_random_pos_hitsplat_sprite',
  'create_sharp_teeth_sprite', 'create_sleep_powder_particle_sprite',
  'create_solar_beam_big_orb_sprite', 'create_spore_particle_sprite',
  'create_stockpile_absorption_orb_sprite', 'create_string_wrap_sprite',
  'create_stun_spore_particle_sprite', 'create_surf_wave',
  'create_swift_star_sprite', 'create_tail_glow_orb_sprite',
  'create_tear_drop_sprite', 'create_trick_bag_sprite',
  'create_twister_leaf_sprite', 'create_web_thread_sprite',
  // ─ AI script + contest AI ─
  'score', 'def_special', 'setstatchanger', 'if_random_safari_flee',
  'if_random_less_than', 'if_user_order_eq', 'if_user_order_not_eq',
  'if_user_order_more_than', 'if_target_faster', 'if_user_faster',
  'if_target_is_ally', 'if_target_not_taunted', 'if_can_participate',
  'if_cannot_participate', 'if_in_bytes', 'if_not_in_bytes', 'if_in_hwords',
  'if_not_in_hwords', 'if_stat_level_more_than', 'if_stat_level_less_than',
  'if_stat_level_equal', 'if_hp_more_than', 'if_hp_less_than',
  'if_hp_equal', 'if_hp_not_equal', 'if_status', 'if_status2', 'if_status3',
  'if_status_in_party', 'if_not_status', 'if_not_status2', 'if_not_status3',
  'if_type_effectiveness', 'if_type', 'if_no_type', 'if_move', 'if_effect',
  'if_effect_eq', 'if_effect_not_eq', 'if_not_effect',
  'if_effect_type_eq', 'if_effect_type_not_eq', 'if_equal', 'if_equal_',
  'if_not_equal', 'if_more_than', 'if_less_than',
  'if_ability', 'if_no_ability', 'if_holds_item', 'if_has_move',
  'if_has_move_with_effect', 'if_doesnt_have_move_with_effect',
  'if_user_has_exciting_move', 'if_user_has_no_attacking_moves',
  'if_user_doesnt_have_move', 'if_any_move_disabled', 'if_any_move_encored',
  'if_flash_fired', 'if_level_cond', 'if_can_faint', 'if_used_combo_starter',
  'if_not_used_combo_starter', 'if_completed_combo', 'if_not_completed_combo',
  'if_not_combo_starter', 'if_not_combo_finisher', 'if_not_double_battle',
  'if_side_affecting', 'if_appeal_num_eq', 'if_appeal_num_not_eq',
  'if_condition_eq', 'if_contest_type_eq', 'if_excitement_eq',
  'if_excitement_less_than', 'if_excitement_not_eq', 'if_move_excitement_eq',
  'if_move_excitement_less_than', 'if_move_used_count_eq',
  'if_move_used_count_more_than', 'if_move_used_count_not_eq',
  'if_most_appealing_move', 'if_would_finish_combo', 'if_last_appeal',
  'if_not_last_appeal', 'if_user_condition_eq', 'if_user_condition_less_than',
  // ─ Field effect script ─
  'field_eff_callnative', 'field_eff_end', 'field_eff_loadpal',
  'field_eff_loadfadedpal', 'field_eff_loadgfx_callnative',
  'field_eff_loadpal_callnative', 'field_eff_loadfadedpal_callnative',
  'field_eff_loadfadedpalblack', 'field_eff_loadfadedpalblack_callnative',
  // ─ Movement actions ─
  'walk_up', 'walk_down', 'walk_left', 'walk_right',
  'walk_in_place_up', 'walk_in_place_down', 'walk_in_place_left', 'walk_in_place_right',
  'walk_in_place_faster_up', 'walk_in_place_faster_down', 'walk_in_place_faster_left', 'walk_in_place_faster_right',
  'walk_in_place_fast_up', 'walk_in_place_fast_down', 'walk_in_place_fast_left', 'walk_in_place_fast_right',
  'walk_in_place_slow_left', 'walk_in_place_slow_right', 'walk_in_place_slow_up', 'walk_in_place_slow_down',
  'walk_fast_up', 'walk_fast_down', 'walk_fast_left', 'walk_fast_right',
  'walk_faster_up', 'walk_faster_down', 'walk_faster_left', 'walk_faster_right',
  'walk_slow_up', 'walk_slow_down', 'walk_slow_left', 'walk_slow_right',
  'walk_slow_diag_northeast', 'walk_slow_diag_northwest',
  'walk_slow_diag_southeast', 'walk_slow_diag_southwest',
  'walk_left_affine', 'walk_down_start_affine',
  'slide_up', 'slide_down', 'slide_left', 'slide_right',
  'slide_slow_up', 'slide_slow_down', 'slide_slow_left', 'slide_slow_right',
  'slide_fast_up', 'slide_fast_down', 'slide_fast_left', 'slide_fast_right',
  'jump_up', 'jump_down', 'jump_left', 'jump_right',
  'jump_2_up', 'jump_2_down', 'jump_2_left', 'jump_2_right',
  'jump_in_place_up', 'jump_in_place_down', 'jump_in_place_left', 'jump_in_place_right',
  'jump_in_place_left_right', 'jump_in_place_up_down', 'jump_in_place_down_up',
  'fly_up', 'fly_down', 'watch',
  // ─ Frontier extras ─
  'frontier_savebattle', 'frontier_saveparty', 'frontier_setbrainobj',
  'frontier_incrementstreak', 'frontier_isbattletype', 'frontier_gettrainername',
  'frontier_checkvisittrainer',
  // ─ Trainer Hill ─
  'trainerhill_allfloorsused', 'trainerhill_clearsaved', 'trainerhill_finaltime',
  'trainerhill_getownerstate', 'trainerhill_getsaved', 'trainerhill_getstatus',
  'trainerhill_gettime', 'trainerhill_getusingereader', 'trainerhill_getwon',
  'trainerhill_giveprize', 'trainerhill_inchallenge', 'trainerhill_lost',
  'trainerhill_postbattletext', 'trainerhill_resumetimer', 'trainerhill_setmode',
  'trainerhill_setsaved', 'trainerhill_settrainerflags', 'trainerhill_start',
  // ─ Dome ─
  'dome_compareseeds', 'dome_getopponentname', 'dome_getroundtext',
  'dome_getwinnersname', 'dome_init', 'dome_initopponentparty',
  'dome_initresultstree', 'dome_inittrainers', 'dome_reduceparty',
  'dome_resetsketch', 'dome_restorehelditems', 'dome_setopponent',
  'dome_setopponentgfx', 'dome_settrainers', 'dome_showopponentinfo',
  'dome_showprevtourneytree', 'dome_showstatictourneytree', 'dome_showtourneytree',
  // ─ Factory ─
  'factory_generateopponentmons', 'factory_generaterentalmons',
  'factory_getopponentmontype', 'factory_getopponentstyle', 'factory_init',
  'factory_rentmons', 'factory_resethelditems', 'factory_setopponentgfx',
  'factory_setopponentmons', 'factory_setparties', 'factory_swapmons',
  // ─ Battle Tents ─
  'fallarbortent_getopponentname', 'fallarbortent_getprize',
  'fallarbortent_giveprize', 'fallarbortent_init', 'fallarbortent_setrandomprize',
  'slateporttent_generateopponentmons', 'slateporttent_generaterentalmons',
  'slateporttent_getprize', 'slateporttent_giveprize', 'slateporttent_init',
  'slateporttent_rentmons', 'slateporttent_setrandomprize',
  'slateporttent_swapmons', 'verdanturftent_getprize', 'verdanturftent_giveprize',
  'verdanturftent_init', 'verdanturftent_setrandomprize',
  'battletent_getopponentintro',
  // ─ Pike ─
  'pike_cleartrainerids', 'pike_exitwildmonroom', 'pike_flashscreen',
  'pike_getbrainstatus', 'pike_gethint', 'pike_gethintroomid',
  'pike_getnpcmsg', 'pike_getroomtype', 'pike_getstatus', 'pike_getstatusmon',
  'pike_healonetwomons', 'pike_inchallenge', 'pike_init', 'pike_inwildmonroom',
  'pike_isfinalroom', 'pike_ispartyfullhealth', 'pike_nohealing',
  'pike_prequeenheal', 'pike_resethelditems', 'pike_savehelditems',
  'pike_sethintroom', 'pike_setnextroom', 'pike_setroomobjects',
  // ─ Pyramid ─
  'pyramid_clearhelditems', 'pyramid_getlocation', 'pyramid_hideitem',
  'pyramid_init', 'pyramid_resetparty', 'pyramid_seedfloor',
  'pyramid_setfloorpal', 'pyramid_setitem', 'pyramid_setprize',
  'pyramid_settrainers', 'pyramid_showhint', 'pyramid_updatelight',
  // ─ Palace ─
  'palace_getcomment', 'palace_incrementstreak', 'palace_init', 'palace_save',
  // ─ Arena ─
  'arena_gettrainername', 'arena_init', 'arenadrawreftextbox',
  'arenaerasereftextbox', 'arenajudgmentstring', 'arenajudgmentwindow',
  'arenawaitmessage',
  // ─ Tower ─
  'tower_closelink', 'tower_getopponentintro2', 'tower_giveribbons',
  'tower_loadlinkopponents', 'tower_loadpartners', 'tower_setbattlewon',
  'tower_setinterviewdata', 'tower_setpartnergfx',
  // ─ Apprentice ─
  'apprentice_answeredquestion', 'apprentice_buff', 'apprentice_freequestion',
  'apprentice_gavelvlmode', 'apprentice_getnumpartymons', 'apprentice_getquestion',
  'apprentice_initquestion', 'apprentice_menu', 'apprentice_msg',
  'apprentice_openbag', 'apprentice_randomizequestions', 'apprentice_reset',
  'apprentice_save', 'apprentice_setgfx', 'apprentice_setleadmon',
  'apprentice_setlvlmode', 'apprentice_setmove', 'apprentice_setpartymon',
  'apprentice_shiftsaved', 'apprentice_shouldcheckgone', 'apprentice_shouldleave',
  'apprentice_shufflespecies', 'apprentice_trysetitem', 'apprentice_random_msg',
  // ─ Vgoto extras ─
  'vgoto_if_ne', 'vbuffer',
  // ─ Other waits + control ─
  'enable_jump_landing_ground_effect', 'delay_2', 'delay_4', 'delay_8',
  'delay_16', 'fanfare', 'try', 'callmove', 'psywavedamageeffect',
];

for (const op of _otherVmStubs) {
  if (!_handlersHas(op)) {
    registerOpcode(op, (_ctx, _args) => false);
  }
}

/** Helper privé : check si un opcode est déjà registered. Utilise getOpcodeHandler
 *  qui returns undefined si pas trouvé. */
function _handlersHas(name: string): boolean {
  return getOpcodeHandler(name) !== undefined;
}

// ─── Side-effect imports : fichiers d'opcodes par section décomp ────────────
// Chaque module register ses opcodes au boot via registerOpcode side-effect.
// Order : APRÈS les opcodes définis dans ce fichier → real impls overwrites
// any earlier stub of same name défini ici.

import './script-opcodes-random';
import './script-opcodes-berry';
import './script-opcodes-tv';
import './script-opcodes-match-call';
import './script-opcodes-weather';
import './script-opcodes-fieldeffect';
import './script-opcodes-shop';
import './script-opcodes-mystery-event';
import './script-opcodes-rotating-tile-puzzle';
import './script-opcodes-slot-machine';
import './script-opcodes-contest';
import './script-opcodes-pc-storage';
import './script-opcodes-lilycove';
import './script-opcodes-door';
import './script-opcodes-fieldmap';
import './script-opcodes-warp';
import './script-opcodes-sound';
import './script-opcodes-decoration';
import './script-opcodes-money-coins';
import './script-opcodes-item';
import './script-opcodes-rtc-clock';
import './script-opcodes-player-avatar';
import './script-opcodes-string';
import './script-opcodes-party';
import './script-opcodes-flag-var';
import './script-opcodes-screen-fx';
import './script-opcodes-lock';
import './script-opcodes-battle';
import './script-opcodes-special';
import './script-opcodes-frontier';
import './script-opcodes-menu';
import './script-opcodes-message';
import './script-opcodes-movement';
import './script-opcodes-control-flow';

// ─── Mark module loaded (= for sanity check) ────────────────────────────────

console.log('[script-opcodes] registered Phase 4.5 MVP + iter6/7 stubs + session 131 1:1 décomp completion (all field opcodes + battle facility macros + other VM safe stubs) + D1 split');

// Lint-friendly export to avoid "unused imports".
export { COMPARE_LT, COMPARE_EQ, COMPARE_GT };
export type { ScriptContext };
