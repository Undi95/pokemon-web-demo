/**
 * battle-flow.ts — Birch tutorial wild battle (1:1 décomp pragmatic port).
 *
 * Approche identique à `starter-choose-flow.ts` (= state machine inline dans
 * l'overworld via `SetupNativeScript`, pas de Phaser scene switch). Reuse les
 * systèmes engine 1:1 :
 *   - `gba-window-system.ts` (AddWindow, DrawStdFrameWithCustomTileAndPalette,
 *     FillWindowPixelBuffer, ClearStdWindowAndFrame) pour les HP windows + move menu
 *   - `gba-text-system.ts` (AddTextPrinterParameterized3) pour le texte 1:1 ROM font
 *   - `gba-menu-system.ts` (InitMenuInUpperLeftCornerNormal pattern) pour move menu
 *   - `field-message-box.ts` (ShowFieldMessage / IsFieldMessageBoxHidden) pour dialog
 *   - Runtime sprite primitives (LoadCompressedSpriteSheet + LoadPaletteObj +
 *     CreateSpriteAtOam) pour les Pokemon sprites
 *
 * Source de vérité décomp :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_setup.c:917-948` (CB2_GiveStarter
 *     + CB2_StartFirstBattle : starter levelé à 5 + opp Zigzagoon LV 2)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_controllers.c:43-79`
 *     (SetUpBattleVarsAndBirchZigzagoon : CreateMon SPECIES_ZIGZAGOON, 2)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/pokemon.c:3107+`
 *     (CalculateBaseDamage : damage = (atk * power * (2*lvl/5+2)) / def / 50)
 *
 * Pragmatic MVP scope :
 *   - 2 sprites (player back + opponent front) chargés à runtime depuis
 *     `public/decomp/em/pokemon/<species>/back.png|front.png`
 *   - HP bars en TEXTE dans 2 windows (= "ZIGZATON Lv2 PV: 12/12") au lieu
 *     de tiles HP bar 1:1. Phase 5.7 (real BattleScene) fera la vraie HP bar.
 *   - Move menu : window 4 cells avec 4 moves (ou moins) dans une grille,
 *     cursor via DPAD + A/B
 *   - Damage formula 1:1 décomp simplifiée (pas de items, abilities, type
 *     chart, crits — juste atk/def/level/power)
 *   - Pas d'AI : opp uses son 1er move
 *   - Pas de fuite, pas de switch, pas de bag (single mon, single battle)
 *
 * Battle outcome :
 *   - Win  : VAR_RESULT = 1 (= BATTLE_OUTCOME_WIN), gBattleOutcome = 1
 *   - Lose : VAR_RESULT = 2 (= BATTLE_OUTCOME_LOST). Tutorial est censé être
 *     winnable (Zigzagoon LV 2 vs starter LV 5), mais on supporte les 2 cas.
 *
 * Wiring :
 *   - Le special `StartBirchTutorialBattle` (= notre name custom, pas dans
 *     décomp directement car décomp utilise CB2 chain. On expose pour scripts
 *     futurs ou debug) startBirchTutorialBattle() ci-dessous.
 *   - Le `script-opcodes.ts` peut invoquer ce flow avec SetupNativeScript pour
 *     blocker le script jusqu'à fin du combat.
 */

import {
  AddWindow,
  RemoveWindow,
  ClearStdWindowAndFrame,
  FillWindowPixelBuffer,
  FillWindowPixelRect,
  CopyWindowToVram,
  PutWindowTilemap,
  ClearWindowTilemap,
  ShowBg,
  HideBg,
  type WindowTemplate,
} from '../ui/gba-window-system';
import { AddTextPrinterParameterized3, IsTextPrinterActive } from '../ui/gba-text-system';
import {
  HideFieldMessageBox,
} from '../field/field-message-box';
// Combat inline dans GameScene (pas de CB2 swap) → MainCB2_Overworld continue de
// tourner et TransferTilesetAnimsBuffer re-blit l'anim EAU du tileset general à
// VRAM byte 0x3600-0x39C0 chaque frame, écrasant la tile 448 (= window action
// prompt, byte 0x3800) → texte remplacé par des pixels d'eau. On pause l'anim
// pendant le combat (= émule le CB2 swap décomp), comme starter-choose-flow.
import { pauseTilesetAnimations, resumeTilesetAnimations } from '../field/tileset-anims';
// RB2 : message box battle 1:1 — B_WIN_MSG (baseBlock 0x90, sans chevauchement
// avec le menu action 0x190) + couleurs/font décomp (sTextOnWindowsInfo_Normal).
import {
  B_WIN_MSG,
  sStandardBattleWindowTemplates,
  sTextOnWindowsInfo_Normal,
} from './battle-windows';
import { getRuntime, BlendPalettes, PALETTES_ALL } from '../system/decomp-globals';
import { LoadSpritePalette, FreeAllSpritePalettes, FreeSpritePaletteByTag } from '../system/sprite';

/** Restaure gPlttBufferFaded ← gPlttBufferUnfaded INSTANT (= annule un
 *  FadeScreenBlack persistant sans fade progressif). 1:1 décomp équivalent :
 *  `BlendPalettes(PALETTES_ALL, 0, RGB_BLACK)` avec coeff 0 = 0% blend =
 *  Faded ← Unfaded pur. Les palettes battle réelles sont déjà dans Unfaded
 *  (LoadPalette écrit both buffers). */
function _restorePalettesFromUnfaded(): void {
  BlendPalettes(PALETTES_ALL, 0, 0 /* RGB_BLACK */);
}
import { OBJ_PLTT_ID } from '../system/decomp-runtime';
// gSineTable : 1:1 décomp `Sin(index, amplitude) = (gSineTable[index] * amplitude) >> 8`.
// Utilisé par le bounce healthbox+mon (DoBounceEffect, battle_main.c:2899-2979).
import { gSineTable } from '../system/decomp-helpers';
import { gSaveBlock1Ptr } from '../save/save-block-state';
import { createPokemonInstance, calculateExpGain, applyExpAward, getLevelUpMovesAtLevel, makeMoveSlot, type PokemonInstance } from '../pokemon/pokemon';
import { setupPartyForBattle, teardownPartyAfterBattle, fillActiveBattleMonsForBattleStart, fillBattleMonFromParty } from '../battle/party-storage';
import { startBattleTransitionSlice, tickBattleTransitionSlice, stopBattleTransition, startBattleIntroFlash, tickBattleIntroFlash } from './battle-transition';
import { setupBattleWindowForIntro, startBattleIntroSlide, tickBattleIntroSlide, resetBattleIntroWindow } from './battle-intro';
import { startBallThrow, tickBallThrow, stopBallThrow, isBallThrowActive } from './battle-ball-throw';
import { ComputeSingleBattleTurnOrder } from './ai/ai-script-commands';
import {
  createBattlerHealthboxSprites,
  destroyHealthboxSprite,
  setHealthboxVisible,
  updateHealthboxHpBar,
  updateHealthboxLevel,
  updateHealthboxHpDigits,
  updateHealthboxStatus,
  updateHealthboxExpBar,
  updateHealthboxNick,
  type HealthboxHandle,
} from './battle-healthbox';
import { getExperienceForLevel } from '../data/game-data';
import {
  runMoveScriptViaBytecode,
  runBattleTurnPassedViaBytecode,
  runHandleFaintedMonActionsViaBytecode,
  runSwitchInEventsViaBytecode,
  syncBattleMonsHpToInstances,
  chooseOpponentMoveViaAI,
} from '../battle/wire-bytecode-bridge';
import { VarSet } from '../script/script-vars';
import { getMove, getMoveName, loadGameData } from '../data/game-data';
import { moveDexIdToEnum } from '../battle/data/move-name-resolve';
import { Random } from '../system/random';
// Note : le hit blink (scintillement dégâts) N'EST PAS gaté par l'option
// battle-scene-off — 1:1 décomp/user : le scintillement est gardé même anims OFF,
// seules les MOVE animations sont coupées. (cf. battle-fixes-expboot-blink-textauto)
// E1 fix : flag BATTLE_TYPE_FIRST_BATTLE pour startBirchTutorialBattle (= 1:1
// décomp battle_setup.c:937 CB2_StartFirstBattle).
import { setBattleTypeFlags, gBattleTypeFlags } from '../battle/state';
import { BATTLE_TYPE_FIRST_BATTLE } from '../battle/constants';
import { TryRunFromBattle as _TryRunFromBattle, IsRunningFromBattleImpossible as _IsRunningFromBattleImpossible } from './try-run-from-battle';
import { setActiveBattler as setActiveBattlerForRun, gBattleCommunication as _gBattleCommunicationArr } from './state';
import { decodeBattleString } from './battle-string-decoder';
import {
  STRINGID_DONTLEAVEBIRCH, STRINGID_CANTESCAPE, STRINGID_PREVENTSESCAPE,
  STRINGID_NORUNNINGFROMTRAINERS, STRINGID_SUPEREFFECTIVE, STRINGID_NOTVERYEFFECTIVE,
  STRINGID_GOTAWAYSAFELY, STRINGID_ITDOESNTAFFECT,
} from '../decomp-data/include/constants/battle_string_ids-data';

// Wrapper helper pour accès à gBattleCommunication (= éviter capture closure
// du let import vs const array). Returns le reference array global.
function _gBattleCommunication(): readonly number[] { return _gBattleCommunicationArr; }

/** Helper : resolve battle string via decoder (= 1:1 décomp pattern
 *  PrepareStringBattle → BufferStringBattle → decoded FR text). Évite
 *  les hardcodes en utilisant la table gBattleStringsTable existante. */
function _resolveBattleString(stringId: number): string {
  // msgData minimal (= les buffs ne sont pas utilisés pour DONTLEAVEBIRCH etc.).
  const msgData = {
    currentMove: 0, originallyUsedMove: 0, lastItem: 0, lastAbility: 0,
    scrActive: 0, battlerAttacker: 0, battlerTarget: 0,
    bakScriptPartyIdx: 0, hpScale: 0, itemEffectBattler: 0,
    moveType: 0, abilities: [0, 0, 0, 0],
    textBuffs: [new Uint8Array(0), new Uint8Array(0), new Uint8Array(0)] as
      [Uint8Array, Uint8Array, Uint8Array],
  };
  return decodeBattleString(stringId, msgData);
}

// K8 + K10 + K12 + K13 side-effect imports : expose devtools globals
// (= window.__battleMainFunctions / __battleHpBar / __battleFaintAnim /
// __battleAnimNormal) et garantit le load au boot via battle-flow.ts qui
// est notre entry. Le wire fonctionnel complet (= K14) suit progressivement
// en remplaçant les states pragmatic actuels par les fns 1:1 strict portées.
import './battle-main-functions';
import {
  SetBattleBarStruct, MoveBattleBar, setMoveBattleBarGraphicallyHook,
  battleBars, HEALTH_BAR, EXP_BAR,
} from './battle-hp-bar';
import './battle-faint-anim';
import './battle-anim-normal';
import './battle-anim-throw';
import './battle-levelup-box';
import './battle-trainer-party';
import './battle-intro-events';
import './battle-turn-helpers';
import './battle-setup-helpers';
import './battle-vblank-helpers';
import './battle-sprite-callbacks';
import './battle-turn-dispatch';
import './battle-cb2';
import './battle-link-end';
import './battle-link-start';
import './battle-init';
import './battle-action-selection';
import './battle-controllers-ipc';
import './handle-action';
import './battle-controller-player';
import './battle-controller-opponent';
import './battle-controller-tick';

// R3 — IPC dispatch APIs pour replace state machine inline.
import {
  gBattleControllerExecFlags as ipcExecFlags,
  setBattleControllerExecFlags as ipcSetExecFlags,
  setActiveBattler as ipcSetActiveBattler,
} from './state';
import {
  gBattleBufferA as ipcBufferA, gBattleBufferB as ipcBufferB,
} from './battle-controllers-ipc';
import { gBitTable as ipcBitTable } from './battle-controllers';
// R3 fix : install PlayerBufferRunCommand comme gBattlerControllerFuncs[player]
// avant emit (= SetControllerToPlayer 1:1 décomp battle_controller_player.c:193).
import { SetControllerToPlayer as ipcSetControllerToPlayer } from './battle-controller-player';
// R4 fix : resolve mv.id string → numeric MOVE_X id pour ChooseMoveStruct.
import { resolveMoveDexId as _resolveMoveDexId } from './data/move-name-resolve';

// ─── GBA input keys (= 1:1 décomp gba/io_reg.h) — import depuis decomp-data
// (= A8 audit, pas hardcode).
import {
  A_BUTTON, B_BUTTON, DPAD_RIGHT, DPAD_LEFT, DPAD_UP, DPAD_DOWN,
} from '../decomp-data/include/gba/io_reg-data';

// ─── Battle outcome constants (= 1:1 décomp include/constants/battle.h) ────
export const BATTLE_OUTCOME_WIN     = 1;
export const BATTLE_OUTCOME_LOST    = 2;
export const BATTLE_OUTCOME_DREW    = 3;
export const BATTLE_OUTCOME_RAN     = 4;
export const BATTLE_OUTCOME_PLAYER_TELEPORTED = 5;
export const BATTLE_OUTCOME_MON_FLED = 6;
export const BATTLE_OUTCOME_CAUGHT  = 7;

// ─── Sprite layout ───────────────────────────────────────────────────────────
// 64x64 = 8x8 tiles = 64 tiles per Pokemon sprite. We allocate 2 contiguous
// blocks in OBJ VRAM. Tile size = 32 bytes. Sprite shape=square (0), size=3 (= 64x64).
const POKEMON_SPRITE_TILES = 64;       // 8×8 tiles
const POKEMON_SPRITE_BYTES = 64 * 32;  // 2048 bytes
const POKEMON_SPRITE_SHAPE: 0 | 1 | 2 = 0;
const POKEMON_SPRITE_SIZE: 0 | 1 | 2 | 3 = 3;

// Battle sprite OBJ VRAM byte offsets. Picked to NOT collide with overworld
// sprites loaded earlier (= overworld uses early offsets via TrySpawnObjectEvent).
// We park the battle sprites at offset 0x4000 (= ~halfway through 32 KiB OBJ VRAM).
// This is a pragmatic MVP — Phase 5.7 BattleScene will do proper VRAM management.
const BATTLE_OBJ_VRAM_BASE_BYTES = 0x4000;
const PLAYER_SPRITE_BYTE_OFFSET   = BATTLE_OBJ_VRAM_BASE_BYTES;
const OPPONENT_SPRITE_BYTE_OFFSET = BATTLE_OBJ_VRAM_BASE_BYTES + POKEMON_SPRITE_BYTES;

// OBJ palette slots for battle sprites (chosen high-end to avoid overworld clash).
/** 1:1 STRICT décomp `LoadSpritePalette` : slots dynamiquement alloués. */
const TAG_BATTLE_PLAYER_PAL = 'BATTLE_PLAYER_PAL';
const TAG_BATTLE_OPPONENT_PAL = 'BATTLE_OPPONENT_PAL';
let _battlePlayerPalSlot = -1;
let _battleOpponentPalSlot = -1;
const PLAYER_PALETTE_SLOT   = 13;  // legacy fallback
const OPPONENT_PALETTE_SLOT = 14;  // legacy fallback

// ─── Sprite positions (= roughly mimicking Gen 3 battle layout) ─────────────
// Screen is 240×160. Standard battle layout (= mimics décomp battle_main.c
// gBattlerCoords[]) :
//   - Opponent : upper-left, sprite center ~ (60, 40)
//   - Player   : lower-right, sprite center ~ (180, 100)
// Sprite x/y in our engine = CENTER coords (= 1:1 décomp src/sprite.c sprite struct).
// `syncSpritesToOam` adds centerToCornerVecX/Y to project to OAM corner pos
// (= -32 for 64x64 sprite). Cf. decomp-runtime.ts:2052.
// Phase 1.4 N1 : positions sprites 1:1 décomp battle_anim_mons.c:38 sBattlerCoords
// single battle :
//   - Player   center : (72, 80)   → top-left (40, 48) pour sprite 64x64
//   - Opponent center : (176, 40)  → top-left (144, 8) pour sprite 64x64
// Notre port utilise top-left coords pour CreateSpriteAtOam. Le décomp utilise
// CENTER coords (= sBattlerCoords) puis applique sprite->x -= half_width quand
// crée via CreateSprite. On soustrait directement ici pour alignement 1:1.
// Y player a +8 bonus 1:1 décomp GetBattlerSpriteFinal_Y (ll. 286-287) car
// player side a un offset visuel pour "élever" sur la plateforme.
// E1b : sBattlerCoords CENTRE (battle_anim_mons.c:38) single battle.
// X fixe par position (= sBattlerCoords center X) ; Y dépend du y_offset PAR
// ESPÈCE (= GetBattlerSpriteDefault_Y). 1:1 décomp battle_controller_*.c :
//   CreateSprite(tpl, GetBattlerSpriteCoord(BATTLER_COORD_X_2),
//                GetBattlerSpriteDefault_Y(battler), subpriority)
// → sprite.x/y = CENTRE. Notre `syncSpritesToOam` applique centerToCornerVec
//   (= -32 pour un 64x64) chaque frame : oam corner = center - 32. On passe donc
//   le CENTRE à CreateSpriteAtOam (surtout PAS le top-left, sinon double
//   soustraction → sprite 32px trop à gauche + trop haut).
const SBATTLER_COORD_X_OPPONENT = 176;  // sBattlerCoords[single][OPPONENT_LEFT].x
const SBATTLER_COORD_Y_OPPONENT = 40;   // sBattlerCoords[single][OPPONENT_LEFT].y
const SBATTLER_COORD_X_PLAYER   = 72;   // sBattlerCoords[single][PLAYER_LEFT].x
const SBATTLER_COORD_Y_PLAYER   = 80;   // sBattlerCoords[single][PLAYER_LEFT].y

// ─── E1b : mon-pic-coords loader (= gMonFrontPicCoords/gMonBackPicCoords) ──
/** 1:1 décomp `gMonFrontPicCoords[]` + `gMonBackPicCoords[]`
 *  (data/pokemon_graphics/{front,back}_pic_coordinates.h) : par espèce,
 *  { w, h, yOffset }. yOffset = pixels entre le bas des pixels dessinés et le
 *  bord bas du frame 64x64. Utilisé par GetBattlerSpriteFinal_Y pour aligner
 *  les pieds du pokémon sur la plateforme. */
interface MonPicCoord { w: number; h: number; yOffset: number; }
interface MonPicCoords { front: MonPicCoord; back: MonPicCoord; }
let _monPicCoords: Record<string, MonPicCoords> | null = null;
async function loadMonPicCoords(): Promise<Record<string, MonPicCoords>> {
  if (_monPicCoords) return _monPicCoords;
  const resp = await fetch('/decomp/em/mon-pic-coords.json');
  if (!resp.ok) throw new Error(`mon-pic-coords fetch failed: ${resp.status}`);
  _monPicCoords = await resp.json() as Record<string, MonPicCoords>;
  return _monPicCoords;
}

/** 1:1 décomp `GetBattlerSpriteDefault_Y(battler)` (battle_anim_mons.c:327-330)
 *  = `GetBattlerSpriteFinal_Y(battler, species, FALSE)` (ll. 269-292). C'est la
 *  fonction utilisée À LA CRÉATION du sprite battler (battle_controller_*.c :
 *  `CreateSprite(tpl, GetBattlerSpriteCoord(X_2), GetBattlerSpriteDefault_Y(), …)`).
 *  Retourne le Y CENTRE du sprite (= sprite.y ; l'OAM applique ensuite
 *  centerToCornerVec -32) :
 *    offset = yOffset (front opponent / back player)
 *    opponent : offset -= elevation (gEnemyMonElevation — dette R3 : 0 sauf
 *      gros pokémon Wailord/etc, à extraire de enemy_mon_elevation.h)
 *    y = offset + sBattlerCoords.y
 *  ⚠️ a3=FALSE : PAS de `+8` player ni de clamp (ceux-ci ne s'appliquent qu'à
 *  `BATTLER_COORD_Y_PIC_OFFSET` = animations, PAS au spawn). */
function _getBattlerSpriteFinalY(speciesEnum: string, isPlayer: boolean): number {
  const coords = _monPicCoords?.[speciesEnum];
  const baseY = isPlayer ? SBATTLER_COORD_Y_PLAYER : SBATTLER_COORD_Y_OPPONENT;
  if (!coords) {
    // Fallback : pas de pic-coords → centre sBattlerCoords (= offset 0).
    return baseY;
  }
  const yOffset = isPlayer ? coords.back.yOffset : coords.front.yOffset;
  // Dette R3 : elevation = 0 (gEnemyMonElevation non extrait — 0 pour ~99%
  // des espèces, seuls Wailord/legendaires gros ont >0). À extraire pour 1:1
  // complet des gros pokémon.
  const elevation = 0;
  return yOffset + baseY - (isPlayer ? 0 : elevation);
}

// ─── HP windows (= top-left for opp, bottom-right for player) ──────────────
const OPPONENT_HP_WINDOW: WindowTemplate = {
  bg: 0,
  tilemapLeft: 1, tilemapTop: 1,
  width: 12, height: 3,
  paletteNum: 15,
  baseBlock: 0x100,
};
const PLAYER_HP_WINDOW: WindowTemplate = {
  bg: 0,
  tilemapLeft: 17, tilemapTop: 9,
  width: 12, height: 3,
  paletteNum: 15,
  baseBlock: 0x130,
};
// 1:1 décomp `sStandardBattleWindowTemplates` B_WIN_ACTION_PROMPT + B_WIN_ACTION_MENU.
// `B_WIN_ACTION_PROMPT` = box VERTE gauche bas "Que doit faire X?" (paletteNum=0
// = palette textbox, couleurs comme B_WIN_MSG). `B_WIN_ACTION_MENU` = grille 2x2
// ATTAQUE/SAC/POKéMON/FUITE droite bas, cadre custom (paletteNum=5 = gBattleWindowTextPalette).
// VALEURS DÉCOMP STRICTES : top=35 (= révélé par scroll gBattle_BG0_Y=160 ; le
// graphisme textbox a les boxes prompt+menu à ces rows). baseBlock 0x1C0/0x190.
const ACTION_PROMPT_WINDOW: WindowTemplate = {
  bg: 0,
  tilemapLeft: 1, tilemapTop: 35,
  width: 14, height: 4,
  paletteNum: 0,
  baseBlock: 0x1C0,
};
const ACTION_MENU_WINDOW: WindowTemplate = {
  bg: 0,
  tilemapLeft: 17, tilemapTop: 35,
  width: 12, height: 4,
  paletteNum: 5,
  baseBlock: 0x190,
};
/** FLIP option 2 : le bytecode interpreter 1:1 décomp est le moteur de
 *  combat PAR DÉFAUT (combats simples ; quatuor précision + 12 audits +
 *  ~100 moves + formule/ciblage/AI doubles prouvés 1:1). Rollback
 *  réversible SANS rebuild :
 *    window.__USE_BYTECODE_FOR_DAMAGE__ = false        (no reload)
 *    localStorage.setItem('__USE_BYTECODE_FOR_DAMAGE__','0')  (reload)
 *  → chemin legacy MVP. Back-compat : `=true`/`='1'` force ON (inchangé). */
export function isBytecodeDamageEnabled(): boolean {
  const g = (globalThis as { __USE_BYTECODE_FOR_DAMAGE__?: boolean }).__USE_BYTECODE_FOR_DAMAGE__;
  const ls = typeof localStorage !== 'undefined'
    ? localStorage.getItem('__USE_BYTECODE_FOR_DAMAGE__') : null;
  // Désactivé UNIQUEMENT si opt-out explicite ; sinon défaut = ON (flip).
  return !(g === false || ls === '0');
}
// Observabilité (le user "surveille en jeu") : window.__isBytecodeDamageEnabled()
// → true (défaut/flip ON) | false (opt-out actif). Zéro import, pas de circular.
(globalThis as Record<string, unknown>).__isBytecodeDamageEnabled = isBytecodeDamageEnabled;

// Move menu legacy : 1 grosse window (= avant refactor N4 1:1 décomp).
// Conservée pour fallback / éventuel ROM A/B test mais non utilisée
// quand le bytecode est ON (= maintenant default chemin).
const MOVE_MENU_WINDOW: WindowTemplate = {
  bg: 0,
  tilemapLeft: 17, tilemapTop: 13,
  width: 12, height: 6,
  paletteNum: 15,
  baseBlock: 0x160,
};

// 1:1 décomp battle_bg.c:192-263 sStandardBattleWindowTemplates Move menu :
// 7 windows : 4 noms moves (grille 2x2) + PP label + PP digits + TYPE display.
// Layout pixel approximatif :
//   +--------+--------+----+-------+
//   | MOVE1  | MOVE2  | PP | xx/yy |   (= MOVE_NAME_1/_2/PP/PP_REMAINING)
//   +--------+--------+----+-------+
//   | MOVE3  | MOVE4  | TYPE/Type  |   (= MOVE_NAME_3/_4/MOVE_TYPE)
//   +--------+--------+----+-------+
// 1:1 décomp sStandardBattleWindowTemplates : top=55/57 (révélé par scroll
// gBattle_BG0_Y=320), paletteNum=5 (gBattleWindowTextPalette). baseBlock/left/width
// = valeurs décomp strictes. Les boxes (4 noms G + PP/type D) viennent du graphisme
// textbox aux rows 55-58 ; les windows posent le texte dessus (pas de DrawStdFrame).
const MOVE_NAME_1_WINDOW: WindowTemplate = {
  bg: 0, tilemapLeft: 2, tilemapTop: 55, width: 8, height: 2, paletteNum: 5, baseBlock: 0x300,
};
const MOVE_NAME_2_WINDOW: WindowTemplate = {
  bg: 0, tilemapLeft: 11, tilemapTop: 55, width: 8, height: 2, paletteNum: 5, baseBlock: 0x310,
};
const MOVE_NAME_3_WINDOW: WindowTemplate = {
  bg: 0, tilemapLeft: 2, tilemapTop: 57, width: 8, height: 2, paletteNum: 5, baseBlock: 0x320,
};
const MOVE_NAME_4_WINDOW: WindowTemplate = {
  bg: 0, tilemapLeft: 11, tilemapTop: 57, width: 8, height: 2, paletteNum: 5, baseBlock: 0x330,
};
const MOVE_PP_WINDOW: WindowTemplate = {
  bg: 0, tilemapLeft: 21, tilemapTop: 55, width: 4, height: 2, paletteNum: 5, baseBlock: 0x290,
};
const MOVE_PP_REMAINING_WINDOW: WindowTemplate = {
  bg: 0, tilemapLeft: 25, tilemapTop: 55, width: 4, height: 2, paletteNum: 5, baseBlock: 0x298,
};
const MOVE_TYPE_WINDOW: WindowTemplate = {
  bg: 0, tilemapLeft: 21, tilemapTop: 57, width: 8, height: 2, paletteNum: 5, baseBlock: 0x2A0,
};

// ─── Battle state ────────────────────────────────────────────────────────────
type State =
  | 'INIT' | 'TRANSITION_INTRO' | 'TRANSITION_SLICE' | 'INIT_FADE_WAIT'
  | 'LOAD_ASSETS' | 'WAIT_LOAD'
  | 'POST_SPAWN_FADE_IN' | 'POST_SPAWN_FADE_WAIT'
  | 'CLEANUP_FADE_OUT' | 'CLEANUP_FADE_WAIT'
  | 'SPAWN_SPRITES' | 'INIT_HP_WINDOWS' | 'BATTLE_INTRO_SLIDE'
  | 'INTRO_TEXT' | 'INTRO_WAIT'
  | 'PLAYER_TURN_PROMPT' | 'PLAYER_TURN_PROMPT_WAIT'
  | 'ACTION_MENU_INIT' | 'ACTION_MENU_INPUT'
  | 'ACTION_EMIT_CHOOSE' | 'ACTION_WAIT_CHOOSE_RESPONSE'
  | 'ACTION_FALLBACK_TEXT' | 'ACTION_FALLBACK_WAIT'
  | 'ACTION_RUN_TEXT' | 'ACTION_RUN_WAIT'
  | 'MOVE_MENU_INIT' | 'MOVE_MENU_INPUT'
  | 'MOVE_EMIT_CHOOSE' | 'MOVE_WAIT_CHOOSE_RESPONSE'
  | 'DETERMINE_TURN_ORDER' | 'ADVANCE_TURN'
  | 'PLAYER_USES_MOVE' | 'PLAYER_USES_MOVE_WAIT'
  | 'PLAYER_BYTECODE_MSG' | 'PLAYER_BYTECODE_MSG_WAIT'
  | 'PLAYER_DAMAGE_OPP' | 'PLAYER_DAMAGE_OPP_WAIT'
  | 'CHECK_OPP_FAINTED'
  | 'OPP_FAINTED_TEXT' | 'OPP_FAINTED_WAIT'
  | 'EXP_AWARD_TEXT' | 'EXP_AWARD_WAIT' | 'EXP_BAR_FILL_WAIT'
  | 'LEVEL_UP_TEXT' | 'LEVEL_UP_WAIT'
  | 'LEARN_MOVE_CHECK' | 'LEARN_MOVE_MSG_WAIT'
  | 'OPPONENT_USES_MOVE' | 'OPPONENT_USES_MOVE_WAIT'
  | 'OPPONENT_BYTECODE_MSG' | 'OPPONENT_BYTECODE_MSG_WAIT'
  | 'OPPONENT_DAMAGE_PLAYER' | 'OPPONENT_DAMAGE_PLAYER_WAIT'
  | 'CHECK_PLAYER_FAINTED'
  | 'PLAYER_FAINTED_TEXT' | 'PLAYER_FAINTED_WAIT'
  | 'PLAYER_SWITCH_LOAD' | 'PLAYER_SWITCH_SPAWN' | 'PLAYER_SWITCH_WAIT'
  | 'SWITCH_IN_EVENTS'
  | 'END_TURN_PROCESS' | 'END_TURN_MSG' | 'END_TURN_MSG_WAIT'
  | 'CLEANUP'
  | 'DONE';

export interface BattleFlow {
  /** Tick the battle state machine. Returns true when battle is done. */
  tick(): boolean;
  /** Public for debug : current state name. */
  getState(): string;
  /** R2 Controller IPC bridge : print text dans une window battle (= action
   *  prompt, action menu, message box, move names, etc.). Wire vers le
   *  rendering Phaser réel (= FillWindowPixelBuffer + AddTextPrinterParameterized3
   *  + CopyWindowToVram). Permet aux Controller IPC handlers (= L1..L14) de
   *  réutiliser le rendering existant battle-flow.ts state machine. */
  printText(windowId: number, text: string): void;
  /** R2 Controller IPC bridge : set action menu cursor position (0..3) +
   *  trigger re-render menu avec `>` au bon spot. Wire pour
   *  ActionSelectionCreateCursorAt. */
  setActionCursor(pos: number): void;
  /** R2 Controller IPC bridge : set move menu cursor position (0..3) +
   *  trigger re-render. Wire pour MoveSelectionCreateCursorAt. */
  setMoveCursor(pos: number): void;
  /** R2 Controller IPC bridge : trigger HP bar drain animation pour battler.
   *  Wire pour PlayerHandleHealthBarUpdate (= L6) qui appelle K10
   *  SetBattleBarStruct. */
  scheduleHpBarUpdate(battler: number, deltaHp: number): void;
}

interface BattleParams {
  /** Player Pokemon (= takes from gSaveBlock1Ptr.playerParty[0] by default). */
  playerMon?: PokemonInstance;
  /** Opponent species enum (= 'SPECIES_ZIGZAGOON' for tutorial). */
  opponentSpecies: string;
  /** Opponent level (= 2 for tutorial). */
  opponentLevel: number;
  /** 1:1 décomp : combat dresseur → BATTLE_TYPE_TRAINER → BattleAI scripts
   *  (sinon wild = move aléatoire). Set par trainer-battle-flow.ts. */
  isTrainerBattle?: boolean;
  /** Id numérique du dresseur (= gTrainerBattleOpponent_A), pour résoudre
   *  gTrainers[id].aiFlags dans BattleAI_SetupAIData. */
  trainerNumId?: number;
}

/** 1:1 décomp battle_util.c CalculateBaseDamage simplified.
 *
 *  Décomp formula (physical) :
 *    damage = attack * power
 *    damage *= (2 * level / 5 + 2)
 *    damage = damage / defense
 *    damage /= 50
 *    damage = max(damage, 1)
 *
 *  We omit type bonus, STAB, items, abilities, crits, badges. For tutorial
 *  (LV 5 starter atk ~13 vs LV 2 Zigzagoon def ~10, Tackle power 35) :
 *    damage = 13 * 35 * (2*5/5 + 2) / 10 / 50
 *           = 13 * 35 * 4 / 10 / 50 = 1820 / 500 = 3.64 → 3
 *  Realistic for Gen 3 actual gameplay. */
function calculateBaseDamage(
  attackerAtk: number, defenderDef: number,
  attackerLevel: number, movePower: number,
): number {
  if (movePower <= 0) return 0;  // status moves (= Growl) deal 0 damage
  let damage = attackerAtk * movePower;
  damage *= (2 * attackerLevel / 5 + 2);
  damage = Math.floor(damage / Math.max(1, defenderDef));
  damage = Math.floor(damage / 50);
  // 1:1 décomp pokemon.c:3282 : "Moves always do at least 1 damage."
  if (damage <= 0) damage = 1;
  // 1:1 décomp pokemon.c:3438+ : random factor 85-100% of damage.
  // damage = damage * (Random() % 16 + 85) / 100
  const rng = (Random() & 0xFF) % 16;  // 0-15
  damage = Math.floor(damage * (rng + 85) / 100);
  if (damage <= 0) damage = 1;
  return damage;
}

/** Compute Atk stat at this level. 1:1 décomp pokemon.c CalcStat formula
 *  (Gen 3) : ((2*base + iv + ev/4) * level / 100) + 5 */
function calcStat(base: number, iv: number, ev: number, level: number): number {
  return Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100) + 5;
}

/** Build species runtime stats for damage formula. Reads from
 *  `species-info.json` via game-data getSpeciesInfo. */
function getSpeciesStats(speciesEnum: string): { hp: number, atk: number, def: number, spa: number, spd: number, spe: number } {
  // Lazy import to avoid cycle (= game-data loads JSONs at boot).
  const dataMod = (globalThis as { __game_data?: { getSpeciesInfo: (k: string) => { stats?: { hp: number, atk: number, def: number, spe: number, spa: number, spd: number } } | undefined } }).__game_data;
  const info = dataMod?.getSpeciesInfo(speciesEnum);
  if (info?.stats) return info.stats;
  // Fallback Zigzagoon stats from species-info.json (= 1:1 décomp gSpeciesInfo).
  return { hp: 38, atk: 30, def: 41, spa: 30, spd: 41, spe: 60 };
}

/** Iter19 : get species types (= [type1, type2]) for type effectiveness. */
function getSpeciesTypes(speciesEnum: string): [string, string] {
  const dataMod = (globalThis as { __game_data?: { getSpeciesInfo: (k: string) => { types?: [string, string] } | undefined } }).__game_data;
  const info = dataMod?.getSpeciesInfo(speciesEnum);
  if (info?.types) return info.types;
  return ['TYPE_NORMAL', 'TYPE_NORMAL'];  // safe fallback
}

/** Iter19 : compute type effectiveness multiplier vs both defender types.
 *  Returns 0 (= immune), 0.25 / 0.5 (= not effective), 1 (= neutral),
 *  2 / 4 (= super effective). */
function getTypeEffectivenessMul(moveType: string, defType1: string, defType2: string): number {
  const dataMod = (globalThis as { __game_data?: { getTypeMultiplier: (att: string, def: string) => number } }).__game_data;
  if (!dataMod) return 1;
  const mul1 = dataMod.getTypeMultiplier(moveType, defType1);
  const mul2 = (defType1 === defType2) ? 1 : dataMod.getTypeMultiplier(moveType, defType2);
  return mul1 * mul2;
}

/** Build a fresh battle flow + return controller.
 *
 *  1:1 décomp `CB2_StartFirstBattle` (battle_setup.c:917-948) :
 *    gBattleTypeFlags = BATTLE_TYPE_FIRST_BATTLE;
 *    BattleTransition_Start(B_TRANSITION_BLUR);  // TODO non porté
 *    ...
 *
 *  Le flag `BATTLE_TYPE_FIRST_BATTLE` active :
 *    - FUITE → message FR "PROF. SEKO: Ne me laisse pas comme ça!"
 *      (battle_main.c:4078-4082) au lieu de BATTLE_RUN_SUCCESS
 *    - AI dispatch via BattleAI_ChooseMoveOrAction (battle_controller_opponent.c:1563)
 *    - Gates `Cmd_struggle` + AI scripts (cf. cmd-niveau-1.ts:357 qui check ce flag)
 *
 *  B_TRANSITION_BLUR (= transition blur tutorial spécifique) reste à porter —
 *  voir DEMO-AUDIT-FINDINGS.md E5. */
export function startBirchTutorialBattle(): BattleFlow {
  // 1:1 décomp : overwrite (pas OR) ; à cette étape gBattleTypeFlags = 0
  // car aucun autre combat en cours.
  setBattleTypeFlags(BATTLE_TYPE_FIRST_BATTLE >>> 0);
  // (Référence pour ts-prune : gBattleTypeFlags importé pour symmetrie même
  // si pas lu ici directement.)
  void gBattleTypeFlags;
  return startWildBattle({
    opponentSpecies: 'SPECIES_ZIGZAGOON',
    opponentLevel: 2,
  });
}

/** Generic wild battle (= reusable Phase 5.7). */
export function startWildBattle(params: BattleParams): BattleFlow {
  let state: State = 'INIT';

  // Battle data — mutated as the battle progresses.
  let playerMon: PokemonInstance | null = null;
  let opponentMon: PokemonInstance | null = null;

  // Sprite IDs (-1 = not spawned).
  let playerSpriteId   = -1;
  let opponentSpriteId = -1;

  // Window IDs (-1 = not allocated).
  let oppHpWindowId    = -1;
  let playerHpWindowId = -1;
  // Phase 1.4 N Q3 D1 : healthbox sprites OAM 1:1 décomp `CreateBattlerHealthboxSprites`.
  // Créés invisibles initialement (= 1:1 décomp ll. 942-948). Visibilité activée
  // quand le contenu dynamique sera porté en D3 (= digits HP/Lv) + D4 (status).
  // Pendant D1-D2, les windows AddWindow legacy ci-dessus (oppHpWindowId/playerHpWindowId)
  // restent visibles et continuent de render HP/Lv pour éviter régression.
  let opponentHealthbox: HealthboxHandle | null = null;
  let playerHealthbox:   HealthboxHandle | null = null;
  // 1:1 décomp battle_controller_player.c:HandleInputChooseAction.
  // gActionSelectionCursor[gActiveBattler] : 0..3 (TL/TR/BL/BR grille 2x2).
  let actionMenuWindowId   = -1;
  let actionPromptWindowId = -1;
  let actionMenuCursor     = 0;
  let _lastFallbackKind: string = '';  // 'SAC' ou 'POKéMON' pour le fallback msg
  // Phase 1.4 N7 : ball throw outcome stash (= set par tickBallThrow quand done).
  let _ballThrowOutcome: 'caught' | 'escaped' | null = null;
  let _ballThrowMessage: string | null = null;
  let moveMenuWindowId = -1;
  // 1:1 décomp Phase 1.4 N4 : 7 windows pour le move menu (= MOVE_NAME_1..4
  // + PP label + PP digits + MOVE_TYPE display).
  let moveName1WinId = -1;
  let moveName2WinId = -1;
  let moveName3WinId = -1;
  let moveName4WinId = -1;
  let movePpWinId = -1;
  let movePpRemainingWinId = -1;
  let moveTypeWinId = -1;
  // RB2 : window message box battle (= B_WIN_MSG 0x90). Lazy-créée au 1er message.
  let msgWindowId = -1;
  // Track si un message battle est en cours d'affichage (= équivalent
  // sFieldMessageBoxMode != HIDDEN). Passe à false quand le printer a fini.
  let _msgActive = false;
  // 1:1 décomp `Cmd_waitmessage` (battle_script_commands.c:2159) : compteur
  // d'auto-avance du message. `gPauseCounterBattle` côté décomp. Une fois le
  // texte affiché, on attend B_WAIT_TIME_LONG frames PUIS on avance tout seul
  // (le joueur peut presser A/B pour avancer immédiatement). Reset à chaque
  // nouveau message (showBattleMessage).
  let _msgWaitCounter = 0;
  const B_WAIT_TIME_LONG = 64;   // include/constants/battle.h:322

  // Async asset load tracking.
  let loadStarted = false;
  let loadDone = false;
  let loadFailed = false;
  let playerSpriteShape: 0 | 1 | 2 = POKEMON_SPRITE_SHAPE;
  let playerSpriteSize:  0 | 1 | 2 | 3 = POKEMON_SPRITE_SIZE;
  let oppSpriteShape:    0 | 1 | 2 = POKEMON_SPRITE_SHAPE;
  let oppSpriteSize:     0 | 1 | 2 | 3 = POKEMON_SPRITE_SIZE;

  // Move menu cursor (= 0..moves.length-1).
  let moveMenuCursor = 0;

  // Selected move for current turn (set by move menu). chosenMoveIndex = PLAYER's
  // move ; opponentMoveIndex = OPPONENT's move (séparés pour l'ordre du tour : si
  // l'adversaire frappe en premier, son move s'exécute avant celui du joueur).
  let chosenMoveIndex = 0;
  let opponentMoveIndex = 0;
  // 1:1 décomp turn order (GetWhoStrikesFirst) : file [premier, second] (0=player,
  // 1=opponent) + phase courante. Calculée à DETERMINE_TURN_ORDER après que les 2
  // moves sont choisis ; ADVANCE_TURN avance la phase entre les 2 movers.
  let _turnOrder: [number, number] = [0, 1];
  let _turnPhase = 0;
  // #10 faint→switch : slot party (index gSaveBlock1Ptr.playerParty) du mon joueur
  // actif + slot vers lequel switcher quand l'actif tombe K.O. (et qu'il reste des
  // mons valides). _switchLoad* = tracking du chargement async du nouveau back sprite.
  let _activePlayerSlot = 0;
  let _pendingSwitchSlot = -1;
  // Lot 3 : moves (enums MOVE_X) appris au level-up courant, à traiter un par un.
  let _movesToLearn: string[] = [];
  let _switchLoadStarted = false;
  let _switchLoadDone = false;
  let _switchLoadFailed = false;

  // Final outcome.
  let outcome = BATTLE_OUTCOME_WIN;

  // Turn counter for some text variation.
  let turnCount = 0;

  // Iter18 : track if player cry was played this battle (= once-only on first turn).
  let _playerCryPlayed = false;

  // Phase 1.4 N Q3 : flag async `_restoreOverworldFromMenu()` terminé au cleanup.
  // 1:1 décomp `CB2_ReturnToField` re-init overworld après le VRAM wipe battle.
  let _overworldRestoreDone = false;

  /** Refresh both HP windows with current HP text.
   *  IMPORTANT : doit appeler CopyWindowToVram après le draw pour pousser
   *  le contenu vers le BG (sinon HP text reste blanche / stale → bug iter11).
   *
   *  Bug 5d session 124 : add HP bar visuel sous le text (= simple rect
   *  green/yellow/red selon HP%). Plus pixel-perfect que tilemap mais
   *  donne le feedback visuel principal du décomp.
   */
  const drawHpBar = (windowId: number, x: number, y: number, hp: number, maxHp: number): void => {
    const barWidth = 48;
    const barHeight = 3;
    // Background : gris clair (= empty bar).
    FillWindowPixelRect(windowId, 0x11, x, y, barWidth, barHeight);
    // Foreground fill selon hp%.
    if (hp <= 0 || maxHp <= 0) return;
    const pct = Math.min(1, hp / maxHp);
    const fillW = Math.max(1, Math.floor(barWidth * pct));
    // 1:1 décomp battle_interface.c color thresholds :
    //   HP > 50%   → vert (color 3)
    //   HP > 20%   → jaune (color 2)
    //   HP <= 20%  → rouge (color 4 si dispo, sinon 2)
    const colorIdx = pct > 0.5 ? 3 : pct > 0.2 ? 2 : 4;
    const fill = (colorIdx | (colorIdx << 4)) & 0xFF;
    FillWindowPixelRect(windowId, fill, x, y, fillW, barHeight);
  };

  /** 1:1 décomp battle_interface.c : status icon rendering. Convert PokemonInstance.
   *  status ('PSN'|'PAR'|'BRN'|'SLP'|'FRZ'|'TOX'|null) en icon FR court (1:1 GBA
   *  text icon, e.g. STATUS_FR_ICONS dans le décomp italien/français). */
  const _statusToIcon = (status: string | null | undefined): string => {
    if (!status) return '';
    switch (status) {
      case 'PSN': return '[PSN]';
      case 'TOX': return '[TOX]';
      case 'PAR': return '[PAR]';
      case 'BRN': return '[BRN]';
      case 'SLP': return '[DOR]';  // 1:1 GBA Émeraude FR : "DORMIR" → DOR
      case 'FRZ': return '[GEL]';  // 1:1 GBA Émeraude FR : "GELE" → GEL
      default:    return '';
    }
  };

  /** 1:1 décomp battle_interface.c gender symbol (♂ male / ♀ female / blank si genderless).
   *  K6 : utilise GetGenderFromSpeciesAndPersonality + mon.monGender (déjà computed
   *  au createPokemonInstance). MON_MALE=0 → ♂, MON_FEMALE=254 → ♀, MON_GENDERLESS=255 → blank.
   *  Source : pokemon.c:3448-3469 GetMonGender. */
  const _genderSymbol = (mon: PokemonInstance | null): string => {
    if (!mon) return '';
    // mon.monGender est set par createPokemonInstance (pokemon.ts:GetGenderFromSpeciesAndPersonality).
    const g = (mon as { monGender?: number }).monGender;
    if (g === 0) return ' ♂';        // MON_MALE
    if (g === 254) return ' ♀';      // MON_FEMALE
    return '';                       // MON_GENDERLESS or undefined
  };

  const renderHpWindows = (): void => {
    if (oppHpWindowId >= 0 && opponentMon) {
      FillWindowPixelBuffer(oppHpWindowId, 0x11);  // both nibbles = bgColor 1
      const oppStatus = _statusToIcon(opponentMon.status);
      const oppGender = _genderSymbol(opponentMon);
      AddTextPrinterParameterized3(
        oppHpWindowId, 1, 1, 1, [1, 2, 3], 255 /* TEXT_SKIP_DRAW = sync */,
        `${opponentMon.nickname}${oppGender} ${oppStatus}\nLv${opponentMon.level} PV:${opponentMon.currentHp}/${opponentMon.maxHp}`,
      );
      // HP bar visuel en bas du text (= y=24 = sous 2 lignes ~10px chacune).
      drawHpBar(oppHpWindowId, 4, 28, opponentMon.currentHp, opponentMon.maxHp);
      CopyWindowToVram(oppHpWindowId, 2);
    }
    if (playerHpWindowId >= 0 && playerMon) {
      FillWindowPixelBuffer(playerHpWindowId, 0x11);
      const plStatus = _statusToIcon(playerMon.status);
      const plGender = _genderSymbol(playerMon);
      AddTextPrinterParameterized3(
        playerHpWindowId, 1, 1, 1, [1, 2, 3], 255,
        `${playerMon.nickname}${plGender} ${plStatus}\nLv${playerMon.level} PV:${playerMon.currentHp}/${playerMon.maxHp}`,
      );
      drawHpBar(playerHpWindowId, 4, 28, playerMon.currentHp, playerMon.maxHp);
      CopyWindowToVram(playerHpWindowId, 2);
    }
    // Phase 1.4 N Q3 D2 : update HP bar tile data sur les sprites OAM healthbox.
    // 1:1 décomp `MoveBattleBarGraphically` HEALTH_BAR case. Le tile data est
    // écrit même si les sprites sont invisibles (= prêt pour le D6 final qui
    // les rendra visible). Color tier GREEN > 50%, YELLOW > 20%, else RED.
    if (opponentHealthbox && opponentMon) {
      // Skip le blit de la barre si un drain est en cours pour ce battler (= le
      // tickHpDrain pilote la barre frame par frame ; sinon on la ferait sauter).
      if (!isHpDraining(1)) updateHealthboxHpBar(opponentHealthbox, opponentMon.currentHp, opponentMon.maxHp);
      // Phase 1.4 N Q3 D3 : Lv display (1:1 décomp UpdateLvlInHealthbox).
      updateHealthboxLevel(opponentHealthbox, opponentMon.level);
      // Phase 1.4 N Q3 D4 : status icon (1:1 décomp UpdateStatusIconInHealthbox).
      updateHealthboxStatus(opponentHealthbox, opponentMon.status);
    }
    if (playerHealthbox && playerMon) {
      if (!isHpDraining(0)) updateHealthboxHpBar(playerHealthbox, playerMon.currentHp, playerMon.maxHp);
      // Phase 1.4 N Q3 D3 : Lv + HP digits (1:1 décomp UpdateLvlInHealthbox + UpdateHpTextInHealthbox).
      updateHealthboxLevel(playerHealthbox, playerMon.level);
      updateHealthboxHpDigits(playerHealthbox, playerMon.currentHp, playerMon.maxHp);
      // Phase 1.4 N Q3 D4 : status icon (1:1 décomp UpdateStatusIconInHealthbox).
      updateHealthboxStatus(playerHealthbox, playerMon.status);
      // Phase 1.4 N Q3 D5 : EXP bar (1:1 décomp UpdateHealthboxAttribute HEALTHBOX_EXP_BAR ll. 2190-2206).
      // currExpBarValue = currentExp - currLevelExp ; maxExpBarValue = nextLevelExp - currLevelExp
      if (playerMon.growthRate && playerMon.currentExp !== undefined) {
        const currLevelExp = getExperienceForLevel(playerMon.growthRate, playerMon.level);
        const nextLevelExp = getExperienceForLevel(playerMon.growthRate, playerMon.level + 1);
        const currExpInLevel = playerMon.currentExp - currLevelExp;
        const expForLevel = nextLevelExp - currLevelExp;
        updateHealthboxExpBar(playerHealthbox, currExpInLevel, expForLevel, playerMon.level);
      }
    }
  };

  // ─── Move menu : 7 windows 1:1 décomp battle_controller_player.c ──────────
  //   - MoveSelectionDisplayMoveNames : print 4 move names dans MOVE_NAME_{1..4}
  //   - MoveSelectionDisplayPpString  : "PP" label dans MOVE_PP
  //   - MoveSelectionDisplayPpNumber  : "xx/yy" dans MOVE_PP_REMAINING (refresh sur cursor change)
  //   - MoveSelectionDisplayMoveType  : "TYPE/<TypeName>" dans MOVE_TYPE (refresh sur cursor change)
  //   - MoveSelectionCreateCursorAt / DestroyCursorAt : tile-based cursor (= "▶" sur le slot active)

  /** 1:1 décomp gText_MoveInterfacePP = "PP " (battle_message.c:1278). */
  const _MOVE_INTERFACE_PP_LABEL = 'PP';
  /** 1:1 décomp gText_MoveInterfaceType = "TYPE/" (battle_message.c:1279). */
  const _MOVE_INTERFACE_TYPE_LABEL = 'TYPE/';

  /** 1:1 décomp gTypeNames pour les types FR Émeraude. */
  const _typeNameFr = (typeStr: string | undefined | null): string => {
    if (!typeStr) return '???';
    const map: Record<string, string> = {
      'TYPE_NORMAL': 'NORMAL', 'TYPE_FIGHTING': 'COMBAT', 'TYPE_FLYING': 'VOL',
      'TYPE_POISON': 'POISON', 'TYPE_GROUND': 'SOL', 'TYPE_ROCK': 'ROCHE',
      'TYPE_BUG': 'INSECTE', 'TYPE_GHOST': 'SPECTRE', 'TYPE_STEEL': 'ACIER',
      'TYPE_FIRE': 'FEU', 'TYPE_WATER': 'EAU', 'TYPE_GRASS': 'PLANTE',
      'TYPE_ELECTRIC': 'ELECTRIK', 'TYPE_PSYCHIC': 'PSY', 'TYPE_ICE': 'GLACE',
      'TYPE_DRAGON': 'DRAGON', 'TYPE_DARK': 'TENEBRES',
    };
    return map[typeStr] ?? typeStr.replace('TYPE_', '');
  };

  /** 1:1 décomp ActionSelection/MoveSelectionCreateCursorAt + DestroyCursorAt :
   *  dessine le curseur ▶ (2 tiles verticales) DIRECTEMENT en tilemap BG0, séparé
   *  du texte → le curseur bouge SANS décaler le texte. `active` → ▶ (textbox tiles
   *  1 haut + 2 bas, palette 0) ; sinon → erase = tile 0x16 pal 1 (= décomp 0x1016,
   *  = la tile box bg de la position curseur, confirmée par le tilemap). */
  const _drawCursorTile = (col: number, row: number, active: boolean): void => {
    const r = getRuntime();
    if (!r) return;
    const tm = r.gba.bg(0).tilemap;
    const idxOf = (rr: number): number => (rr >= 32 ? 1024 : 0) + (rr % 32) * 32 + col;
    const top = active ? 1 : 0x16;
    const bot = active ? 2 : 0x16;
    const pal = active ? 0 : 1;
    const i0 = idxOf(row), i1 = idxOf(row + 1);
    if (i0 >= 0 && i0 < tm.length) tm[i0] = (top & 0x3FF) | (pal << 12);
    if (i1 >= 0 && i1 < tm.length) tm[i1] = (bot & 0x3FF) | (pal << 12);
  };

  /** Helper : print text dans une window move (paletteNum 5) avec clear avant.
   *  1:1 décomp sTextOnWindowsInfo_Normal : fillValue=PIXEL_FILL(0xE)=0xEE.
   *  fontId/colors par window (défaut = MOVE_NAME/MOVE_TYPE : FONT_NARROW +
   *  [bg=DYN_5(14), fg=DYN_4(13), shadow=DYN_6(15)] ; les windows PP passent
   *  FONT_NORMAL pour PP_REMAINING + couleurs PP [14, 12, 11]). */
  const _printToWindow = (
    winId: number, text: string,
    fontId: number = 7 /* FONT_NARROW */, colors: readonly number[] = [14, 13, 15],
  ): void => {
    if (winId < 0) return;
    FillWindowPixelBuffer(winId, 0xEE);
    AddTextPrinterParameterized3(winId, fontId, 0, 1, colors, 255, text);
    CopyWindowToVram(winId, 2);
  };

  /** 1:1 décomp MoveSelectionDisplayMoveNames + MoveSelectionCreateCursorAt :
   *  4 noms (SANS ">", positions fixes) + curseur ▶ dessiné séparément en tilemap
   *  (col 9*(pos&1)+1, row 55+(pos&2)) → bouge sans décaler les noms. */
  const refreshMoveNames = (): void => {
    if (!playerMon) return;
    const moves = playerMon.moves;
    const wins = [moveName1WinId, moveName2WinId, moveName3WinId, moveName4WinId];
    for (let i = 0; i < 4; i++) {
      const mv = moves[i];
      const name = mv ? mv.nameFr.toUpperCase() : '-';
      // 1:1 décomp sTextOnWindowsInfo_Normal[B_WIN_MOVE_NAME_*].fontId = FONT_NARROW
      // (battle_message.c:1513). Pas de défaut : on passe explicitement 7.
      _printToWindow(wins[i], name, 7 /* FONT_NARROW */);
    }
    for (let p = 0; p < 4; p++) {
      _drawCursorTile(9 * (p & 1) + 1, 55 + (p & 2), p === moveMenuCursor);
    }
  };

  /** 1:1 décomp MoveSelectionDisplayPpString (= "PP" label). B_WIN_PP : FONT_NARROW,
   *  couleurs [bg=DYN_5(14), fg=DYN_3(12), shadow=DYN_2(11)]. */
  const refreshMovePpLabel = (): void => {
    _printToWindow(movePpWinId, _MOVE_INTERFACE_PP_LABEL, 7 /* FONT_NARROW */, [14, 12, 11]);
  };

  /** 1:1 décomp MoveSelectionDisplayPpNumber (= currentPp/maxPp). B_WIN_PP_REMAINING :
   *  FONT_NORMAL (≠ les autres windows move), couleurs [bg=DYN_5(14), fg=DYN_3(12),
   *  shadow=DYN_2(11)]. */
  const refreshMovePpNumber = (): void => {
    if (!playerMon) return;
    const mv = playerMon.moves[moveMenuCursor];
    const cur = mv ? mv.pp : 0;
    const max = mv ? mv.ppMax : 0;
    _printToWindow(movePpRemainingWinId, `${String(cur).padStart(2, ' ')}/${String(max).padStart(2, ' ')}`, 1 /* FONT_NORMAL */, [14, 12, 11]);
  };

  /** 1:1 décomp MoveSelectionDisplayMoveType (= "TYPE/<TypeName>"). */
  const refreshMoveType = (): void => {
    if (!playerMon) return;
    const mv = playerMon.moves[moveMenuCursor];
    if (!mv) { _printToWindow(moveTypeWinId, _MOVE_INTERFACE_TYPE_LABEL); return; }
    // Lookup move type via getMove. Resolveur CANONIQUE moveDexIdToEnum
    // (= gère les noms composés SANS séparateur : "quickattack" →
    // MOVE_QUICK_ATTACK). L'ancien `'MOVE_'+id.toUpperCase().replace(/-/g,
    // '_')` donnait MOVE_QUICKATTACK (introuvable) → type affiché "???".
    const moveData = getMove(moveDexIdToEnum(mv.id));
    const typeFr = _typeNameFr(moveData?.type);
    // 1:1 décomp MoveSelectionDisplayMoveType : "TYPE/" (label, font window NARROW)
    // + EXT_CTRL_CODE_FONT FONT_NORMAL + nom du type (en FONT_NORMAL). Base = NARROW
    // pour le label "TYPE/" ; {FONT NORMAL} bascule le glyph-set pour le nom du type.
    _printToWindow(moveTypeWinId, `${_MOVE_INTERFACE_TYPE_LABEL}{FONT NORMAL}${typeFr}`, 7 /* FONT_NARROW base */, [14, 13, 15]);
  };

  /** Refresh tout le move menu (= cursor + names + PP + type). */
  const refreshMoveMenu = (): void => {
    refreshMoveNames();
    refreshMovePpLabel();
    refreshMovePpNumber();
    refreshMoveType();
  };

  /** Init les 7 windows du move menu. */
  const initMoveMenu = (): void => {
    if (!playerMon) return;
    if (moveName1WinId < 0)        moveName1WinId        = AddWindow(MOVE_NAME_1_WINDOW);
    if (moveName2WinId < 0)        moveName2WinId        = AddWindow(MOVE_NAME_2_WINDOW);
    if (moveName3WinId < 0)        moveName3WinId        = AddWindow(MOVE_NAME_3_WINDOW);
    if (moveName4WinId < 0)        moveName4WinId        = AddWindow(MOVE_NAME_4_WINDOW);
    if (movePpWinId < 0)           movePpWinId           = AddWindow(MOVE_PP_WINDOW);
    if (movePpRemainingWinId < 0)  movePpRemainingWinId  = AddWindow(MOVE_PP_REMAINING_WINDOW);
    if (moveTypeWinId < 0)         moveTypeWinId         = AddWindow(MOVE_TYPE_WINDOW);
    // Pose les entries tilemap (cells rows 55-58 → tiles window). PAS de DrawStdFrame :
    // le graphisme textbox fournit les boxes move (révélées par scroll BG0_Y=320).
    PutWindowTilemap(moveName1WinId);
    PutWindowTilemap(moveName2WinId);
    PutWindowTilemap(moveName3WinId);
    PutWindowTilemap(moveName4WinId);
    PutWindowTilemap(movePpWinId);
    PutWindowTilemap(movePpRemainingWinId);
    PutWindowTilemap(moveTypeWinId);
    // 1:1 décomp gBattle_BG0_Y = DISPLAY_HEIGHT*2(320) : révèle les boxes move.
    setBg0Scroll(320);
    refreshMoveMenu();
  };

  const drawMoveCursor = (): void => {
    // 1:1 décomp ll. 553-572 : after cursor move, also re-display PP + Type
    // (= car le slot active a changé).
    refreshMoveMenu();
  };

  /** Close all 7 move menu windows + re-scroll vers la position action/message. */
  const closeMoveMenu = (): void => {
    const wins = [moveName1WinId, moveName2WinId, moveName3WinId, moveName4WinId, movePpWinId, movePpRemainingWinId, moveTypeWinId];
    for (const w of wins) {
      if (w >= 0) {
        ClearWindowTilemap(w);
        CopyWindowToVram(w, 3);
        RemoveWindow(w);
      }
    }
    moveName1WinId = moveName2WinId = moveName3WinId = moveName4WinId = -1;
    movePpWinId = movePpRemainingWinId = moveTypeWinId = -1;
    // Retour position action menu (= 1:1 gBattle_BG0_Y = 160).
    setBg0Scroll(160);
    // Legacy : si l'ancien MOVE_MENU_WINDOW est encore actif (= fallback path), close.
    if (moveMenuWindowId >= 0) {
      ClearStdWindowAndFrame(moveMenuWindowId, true);
      RemoveWindow(moveMenuWindowId);
      moveMenuWindowId = -1;
    }
  };

  // ─── RB2 : message box battle 1:1 (B_WIN_MSG, baseBlock 0x90) ───────────
  // Remplace ShowFieldMessage (= overworld field box 0x194 qui chevauchait le
  // menu action 0x190 → garbling). 1:1 décomp `BattlePutTextOnWindow(text,
  // B_WIN_MSG)` (battle_message.c:3035) : FillWindowPixelBuffer(fillValue) +
  // AddTextPrinter avec font/couleurs de sTextOnWindowsInfo_Normal[B_WIN_MSG]
  // (fg=WHITE, bg=DYN_6, shadow=GREEN). Le fond box vert/rouge vient du graphisme
  // textbox chargé sur BG0 (loadBattleTextbox) ; la window pose le texte dessus.
  const _b = sStandardBattleWindowTemplates[B_WIN_MSG];
  const B_WIN_MSG_TEMPLATE: WindowTemplate = {
    bg: _b.bg, tilemapLeft: _b.tilemapLeft, tilemapTop: _b.tilemapTop,
    width: _b.width, height: _b.height, paletteNum: _b.paletteNum, baseBlock: _b.baseBlock,
  };
  /** 1:1 décomp `gBattle_BG0_Y` : scroll vertical BG0 pour révéler le bon groupe
   *  de boxes au bas de l'écran (0 = MSG, 160 = ACTION, 320 = MOVE). */
  const setBg0Scroll = (y: number): void => {
    const r = getRuntime();
    if (r) r.gba.bg(0).config.vofs = y;
  };
  const showBattleMessage = (text: string): void => {
    if (msgWindowId < 0) msgWindowId = AddWindow(B_WIN_MSG_TEMPLATE);
    const info = sTextOnWindowsInfo_Normal[B_WIN_MSG];
    // 1:1 décomp : box MSG révélée par scroll BG0_Y=0.
    setBg0Scroll(0);
    // Pose les entries tilemap (= cells rows 15-18 → tiles window baseBlock 0x90).
    PutWindowTilemap(msgWindowId);
    // 1:1 décomp : FillWindowPixelBuffer(fillValue) puis AddTextPrinter.
    FillWindowPixelBuffer(msgWindowId, info.fillValue);
    // colorArray [bg, fg, shadow] (cf. gba-text-system). speed 255 = sync
    // (TEXT_SKIP_DRAW) : rendu instant lisible ; isBattleMessageHidden attend
    // ensuite l'appui A/B (= 1:1 lecture joueur).
    AddTextPrinterParameterized3(
      msgWindowId, info.fontId, info.x, info.y,
      [info.bgColor, info.fgColor, info.shadowColor],
      255, text.replace(/\$$/, ''),
    );
    CopyWindowToVram(msgWindowId, 3);
    _msgActive = true;
    _msgWaitCounter = 0;   // 1:1 Cmd_waitmessage : reset gPauseCounterBattle au nouveau message.
    // Devtool : log des messages affichés (réutilisable pour vérif — texte décodé final).
    {
      const g = globalThis as { __battleMsgLog?: string[] };
      g.__battleMsgLog = [...(g.__battleMsgLog ?? []), text].slice(-12);
    }
  };
  /** Drop-in 1:1 de IsFieldMessageBoxHidden : true quand le message a fini de
   *  s'imprimer (= printer plus actif), comme field_message_box.c state 2. */
  const isBattleMessageHidden = (): boolean => {
    if (msgWindowId < 0 || !_msgActive) return true;
    if (!IsTextPrinterActive(msgWindowId)) { _msgActive = false; return true; }
    return false;
  };
  /** Clear la message box (= 1:1 HideFieldMessageBox avant d'ouvrir le menu). */
  const hideBattleMessage = (): void => {
    if (msgWindowId >= 0) {
      FillWindowPixelBuffer(msgWindowId, 0);
      ClearWindowTilemap(msgWindowId);
      CopyWindowToVram(msgWindowId, 3);
    }
    _msgActive = false;
  };
  /** 1:1 décomp `Cmd_waitmessage` (battle_script_commands.c:2159) : un message
   *  de combat s'auto-avance APRÈS que le texte est affiché (`isBattleMessageHidden`)
   *  + B_WAIT_TIME_LONG (64) frames écoulées — le joueur N'A PAS à presser un
   *  bouton (« du texte qui se passe tous seul »). Il PEUT presser A/B pour avancer
   *  immédiatement (skip du timer, via JOY_NEW pour éviter qu'un appui résiduel du
   *  menu ne saute le message). Remplace l'ancienne attente bloquante sur A/B à
   *  chaque message. */
  const messageWaitDone = (): boolean => {
    if (!isBattleMessageHidden()) { _msgWaitCounter = 0; return false; }
    const rt2 = getRuntime();
    const buttonSkip = rt2 ? (rt2.gMain.newKeys & (A_BUTTON | B_BUTTON)) !== 0 : false;
    if (buttonSkip) return true;
    if (++_msgWaitCounter >= B_WAIT_TIME_LONG) return true;
    return false;
  };

  // ─── Action menu (= FIGHT/BAG/POKEMON/RUN grille 2x2) 1:1 décomp ─────────
  // Source : battle_controller_player.c:HandleInputChooseAction + battle_message.c:1276
  // gText_BattleMenu = "ATTAQUE{CLEAR_TO 56}SAC\nPOKéMON{CLEAR_TO 56}FUITE"
  // gText_WhatWillPkmnDo = "Que doit faire\n{B_ACTIVE_NAME_WITH_PREFIX}?"

  /** Refresh action menu : texte 2x2 FIXE (1:1 gText_BattleMenu avec CLEAR_TO 56)
   *  + curseur ▶ dessiné séparément en tilemap (ne décale PAS le texte). */
  const refreshActionMenu = (): void => {
    if (actionMenuWindowId < 0) return;
    // 1:1 décomp B_WIN_ACTION_MENU : fillValue=PIXEL_FILL(0xE)=0xEE, couleurs
    // [bg=DYN_5(14), fg=DYN_4(13), shadow=DYN_6(15)] (paletteNum 5 = gBattleWindowTextPalette).
    FillWindowPixelBuffer(actionMenuWindowId, 0xEE);
    // 1:1 gText_BattleMenu : "ATTAQUE{CLEAR_TO 56}SAC\nPOKéMON{CLEAR_TO 56}FUITE".
    // PAS de ">" : le curseur est une tile ▶ séparée (cf. _drawCursorTile).
    AddTextPrinterParameterized3(
      actionMenuWindowId, 1, 0, 1, [14, 13, 15], 255 /* TEXT_SKIP_DRAW = sync */,
      'ATTAQUE{CLEAR_TO 56}SAC\nPOKéMON{CLEAR_TO 56}FUITE',
    );
    CopyWindowToVram(actionMenuWindowId, 2);
    // 1:1 ActionSelectionCreateCursorAt/DestroyCursorAt : curseur ▶ col 7*(c&1)+16,
    // row 35+(c&2). Dessiné APRÈS le texte, en tilemap → ne décale pas le texte.
    const c = actionMenuCursor;
    for (let p = 0; p < 4; p++) {
      _drawCursorTile(7 * (p & 1) + 16, 35 + (p & 2), p === c);
    }
  };

  /** Refresh action prompt window with "Que doit faire X?". */
  const refreshActionPrompt = (): void => {
    if (actionPromptWindowId < 0 || !playerMon) return;
    // 1:1 décomp B_WIN_ACTION_PROMPT : fillValue=0xFF, couleurs [bg=DYN_6(15),
    // fg=WHITE(1), shadow=GREEN(6)] (paletteNum 0 = palette textbox = box verte).
    FillWindowPixelBuffer(actionPromptWindowId, 0xFF);
    const promptText = `Que doit faire\n${playerMon.nickname.toUpperCase()}?`;
    AddTextPrinterParameterized3(
      actionPromptWindowId, 1, 0, 1, [15, 1, 6], 255 /* TEXT_SKIP_DRAW */, promptText,
    );
    CopyWindowToVram(actionPromptWindowId, 2);
  };

  /** Init action menu + prompt windows. 1:1 décomp PlayerHandleChooseAction :
   *  les boxes (prompt vert G + menu custom D) viennent du graphisme textbox aux
   *  rows 35-38, révélées par scroll BG0_Y=160. Pas de DrawStdFrame : la window
   *  pose juste le texte par-dessus la box du graphisme. */
  const initActionMenu = (): void => {
    if (!playerMon) return;
    // Clear la box message (= passe du mode message au mode action).
    hideBattleMessage();
    if (actionPromptWindowId < 0) actionPromptWindowId = AddWindow(ACTION_PROMPT_WINDOW);
    if (actionMenuWindowId < 0)   actionMenuWindowId   = AddWindow(ACTION_MENU_WINDOW);
    // Pose les entries tilemap (cells rows 35-38 → tiles window). PAS de frame :
    // le graphisme textbox fournit les bordures box (prompt vert + menu custom).
    PutWindowTilemap(actionPromptWindowId);
    PutWindowTilemap(actionMenuWindowId);
    // 1:1 décomp gBattle_BG0_Y = DISPLAY_HEIGHT(160) : révèle les boxes action.
    setBg0Scroll(160);
    refreshActionPrompt();
    refreshActionMenu();
  };

  /** Close both windows action menu + prompt + re-scroll vers la box message. */
  const closeActionMenu = (): void => {
    if (actionMenuWindowId >= 0) {
      ClearWindowTilemap(actionMenuWindowId);
      CopyWindowToVram(actionMenuWindowId, 3);
      RemoveWindow(actionMenuWindowId);
      actionMenuWindowId = -1;
    }
    if (actionPromptWindowId >= 0) {
      ClearWindowTilemap(actionPromptWindowId);
      CopyWindowToVram(actionPromptWindowId, 3);
      RemoveWindow(actionPromptWindowId);
      actionPromptWindowId = -1;
    }
    // Retour scroll position message (= 1:1 gBattle_BG0_Y = 0).
    setBg0Scroll(0);
  };

  /** 1:1 décomp `OpponentHandleChooseMove` (battle_controller_opponent.c:1551).
   *
   *  Bytecode = moteur PAR DÉFAUT (flip option 2, combats simples) → vrai
   *  comportement décomp via `chooseOpponentMoveViaAI` : combat sauvage =
   *  move ALÉATOIRE (skip MOVE_NONE) ; dresseur = scripts BattleAI 1:1.
   *  Rollback réversible : `window.__USE_BYTECODE_FOR_DAMAGE__ = false`
   *  OU `localStorage.setItem('__USE_BYTECODE_FOR_DAMAGE__','0')` →
   *  chemin legacy MVP. Si l'AI renvoie -1 (indispo) → fallback legacy. */
  /** Tracks AI flee decision. Birch tutorial : le Zigzaton fuit quand les PV de
   *  NOTRE mon (= AI_TARGET) sont ≤ 20% — PAS les siens (1:1 AI_FirstBattle :
   *  if_hp_equal/less_than AI_TARGET 20 → flee). C'est ce qui empêche la défaite. */
  let _opponentAiWantsToFlee = false;
  const pickOpponentMove = (): number => {
    _opponentAiWantsToFlee = false;
    if (!opponentMon || opponentMon.moves.length === 0) return 0;
    const useBytecode = isBytecodeDamageEnabled();
    if (useBytecode) {
      const r = chooseOpponentMoveViaAI({
        opponent: opponentMon,
        player: playerMon ?? opponentMon,
        // 1:1 décomp : dresseur → scripts BattleAI ; sauvage → move aléatoire.
        isTrainer: params.isTrainerBattle ?? false,
        trainerId: params.trainerNumId,
      });
      // 1:1 décomp AI_FirstBattle : tutorial flag set BATTLE_TYPE_FIRST_BATTLE
      // → AI_SCRIPT_FIRST_BATTLE → check if_hp_less_than 20 → flee.
      // Si l'AI retourne action 'flee', on bypass le move et le state machine
      // route vers WILD_MON_FLED (= "Le Zigzagton sauvage a fui !").
      if (r.action === 'flee') {
        _opponentAiWantsToFlee = true;
        return 0;  // No move chosen (= caller will check _opponentAiWantsToFlee).
      }
      if (r.index >= 0 && r.index < opponentMon.moves.length) return r.index;
      // index -1 (indispo) → fallback legacy ci-dessous.
    }
    // Legacy MVP (flag OFF ou AI indispo) : premier move offensif.
    for (let i = 0; i < opponentMon.moves.length; i++) {
      const mv = getMove(moveDexIdToEnum(opponentMon.moves[i].id));
      if (mv && mv.power > 0) return i;
    }
    return 0;
  };

  /** Pending bytecode messages : queue par applyMoveDamage en mode bytecode,
   *  consommée séquentiellement par les states USES_MOVE/DAMAGE_OPP pour
   *  afficher chaque message via ShowFieldMessage + wait input. */
  let _pendingBytecodeMessages: string[] = [];

  /** Events bruts du dernier `runMoveScriptViaBytecode`. Permet aux states qui
   *  consomment ce résultat (= PLAYER_USES_MOVE / OPPONENT_USES_MOVE) de
   *  inspecter si un CONTROLLER_HITANIMATION a été émis (= sprite shake 1:1
   *  décomp piloté par le bytecode au lieu de hardcoded `damage > 0`). */
  let _lastBytecodeEvents: import('../battle/battle-event-queue').BattleEvent[] = [];

  /** Helper : check si le dernier bytecode run a émis un CONTROLLER_HITANIMATION
   *  (= 0x29). Renvoie true pour les moves qui hit le defender (= excluant
   *  status moves comme Growl/Toxic + miss/no-effect). */
  const _bytecodeWantsHitAnim = (): boolean => {
    const HITANIM = 0x29;  // CONTROLLER_HITANIMATION
    for (let i = 0; i < _lastBytecodeEvents.length; i++) {
      if (_lastBytecodeEvents[i].type === HITANIM) return true;
    }
    return false;
  };

  /** Apply chosen move's damage from attacker to defender. Returns damage dealt + effectiveness mul.
   *
   *  Bytecode interpreter 1:1 décomp = moteur PAR DÉFAUT (flip option 2 ;
   *  645/645 scripts validés). Rollback réversible :
   *  `window.__USE_BYTECODE_FOR_DAMAGE__ = false` (no reload) ou
   *  `localStorage.setItem('__USE_BYTECODE_FOR_DAMAGE__','0')` (reload) →
   *  formule simplifiée ad-hoc legacy (= chemin tutorial parké).
   *
   *  Phase 1.4 J : capture aussi result.messages dans _pendingBytecodeMessages
   *  pour que la state machine puisse les afficher séquentiellement (= 1:1
   *  PRINTSTRING events décodés via battle-string-decoder). */
  const applyMoveDamage = (attacker: PokemonInstance, defender: PokemonInstance, moveIdx: number): { damage: number, typeMul: number } => {
    // FLIP option 2 : bytecode PAR DÉFAUT (opt-out réversible cf. helper).
    const useBytecode = isBytecodeDamageEnabled();

    if (useBytecode) {
      // Determine battler ids : attacker = 0 si playerMon, 1 si opponentMon.
      const attBId = attacker === playerMon ? 0 : 1;
      const defBId = defender === playerMon ? 0 : 1;
      const result = runMoveScriptViaBytecode({
        attacker, defender, attackerMoveIdx: moveIdx,
        attackerBattlerId: attBId, defenderBattlerId: defBId,
      });
      if (result.ok) {
        // Capture messages pour affichage séquentiel par state machine.
        if (result.messages && result.messages.length > 0) {
          _pendingBytecodeMessages = [..._pendingBytecodeMessages, ...result.messages];
        }
        // Capture events (= HIT_ANIMATION, PLAYSE, etc.) pour wirage 1:1 visual.
        _lastBytecodeEvents = result.events ?? [];
        return { damage: result.damage, typeMul: result.typeMul };
      }
      console.warn('[battle-flow] bytecode route failed:', result.reason, '— fallback to ad-hoc formula');
      _lastBytecodeEvents = [];  // reset si fallback
      // fall through to ad-hoc fallback.
    }
    _lastBytecodeEvents = [];  // reset si legacy formula

    // ─── Ad-hoc legacy formula (= conservé pour tutorial robuste) ──────
    const mv = attacker.moves[moveIdx];
    if (!mv) return { damage: 0, typeMul: 1 };
    // Resolveur canonique (noms composés) — l'ancien `'MOVE_'+id.toUpperCase()`
    // ratait "quickattack"/"thundershock"/etc → moveData undefined → type
    // fallback TYPE_NORMAL = dégâts faux pour move composé non-Normal (chemin
    // legacy ; bytecode = défaut, mais correct si rollback).
    const moveData = getMove(moveDexIdToEnum(mv.id));
    const power = moveData?.power ?? 0;
    if (power <= 0) return { damage: 0, typeMul: 1 };  // status moves
    // Stats : we recompute Atk/Def from species + level + IVs.
    const attackerStats = getSpeciesStats(attacker.speciesEnum);
    const defenderStats = getSpeciesStats(defender.speciesEnum);
    const attackerAtk = calcStat(attackerStats.atk, attacker.ivs.atk, attacker.evs.atk, attacker.level);
    const defenderDef = calcStat(defenderStats.def, defender.ivs.def, defender.evs.def, defender.level);
    let damage = calculateBaseDamage(attackerAtk, defenderDef, attacker.level, power);
    // Iter19 : STAB (Same Type Attack Bonus) — 1.5× if move type matches attacker type.
    const moveType = moveData?.type ?? 'TYPE_NORMAL';
    const [aType1, aType2] = getSpeciesTypes(attacker.speciesEnum);
    if (moveType === aType1 || moveType === aType2) {
      damage = Math.floor(damage * 1.5);
    }
    // Iter19 : Type effectiveness (= immune 0×, not eff 0.5×, neutral 1×, super 2×, double super 4×).
    const [dType1, dType2] = getSpeciesTypes(defender.speciesEnum);
    const typeMul = getTypeEffectivenessMul(moveType, dType1, dType2);
    damage = Math.floor(damage * typeMul);
    defender.currentHp = Math.max(0, defender.currentHp - damage);
    // Decrement PP.
    if (mv.pp > 0) mv.pp--;
    return { damage, typeMul };
  };

  // ─── Hit animation 1:1 décomp (CONTROLLER_HITANIMATION) ─────────────────
  // 1:1 décomp `PlayerHandleHitAnimation` (battle_controller_player.c:2877).
  // Déclenché par l'event CONTROLLER_HITANIMATION (0x29) émis par le bytecode
  // quand un move hit le defender. Deux effets SIMULTANÉS :
  //  1. Sprite blink (`DoHitAnimBlinkSpriteEffect`, ibid:1401) : data[1] compte
  //     0→32 ; toggle `invisible ^= 1` tous les 4 frames → le sprite SCINTILLE ;
  //     à 32 reset + invisible=false (re-visible). Skip si déjà invisible.
  //  2. Healthbox jiggle (`DoHitAnimHealthboxEffect`/`SpriteCB_HitAnimHealthox`
  //     Effect`, pokeball.c:1284) : y2 alterne +1/-1 chaque frame sur 21 frames
  //     → la healthbox tremble verticalement, puis x2/y2 reset à 0.
  // (Remplace l'ancien shake horizontal ad-hoc qui n'était PAS 1:1.)
  let _hitAnimSpriteId = -1;
  let _hitAnimData1 = 0;                              // sprite blink counter 0→32
  let _hitAnimHealthbox: HealthboxHandle | null = null;
  let _hitAnimHbY2 = 1;                               // healthbox data[0] : +1/-1
  let _hitAnimHbCount = 0;                            // healthbox counter 0→21
  const startHitAnim = (spriteId: number, healthbox: HealthboxHandle | null) => {
    const rt2 = getRuntime();
    const s = rt2 ? rt2.gSprites.get(spriteId) : null;
    // 1:1 décomp PlayerHandleHitAnimation : si le sprite est déjà invisible
    // (= ex. KO), aucun effet (ni blink ni healthbox).
    if (!s || s.invisible) return;
    _hitAnimSpriteId = spriteId;
    _hitAnimData1 = 0;
    _hitAnimHealthbox = healthbox;
    _hitAnimHbY2 = 1;
    _hitAnimHbCount = 0;
  };
  const _setHealthboxY2 = (rt2: ReturnType<typeof getRuntime>, hb: HealthboxHandle, y2: number, x2?: number): void => {
    if (!rt2) return;
    for (const id of [hb.leftSpriteId, hb.rightSpriteId, hb.healthbarSpriteId]) {
      const s = rt2.gSprites.get(id);
      if (s) { s.y2 = y2; if (x2 !== undefined) s.x2 = x2; }
    }
  };
  const tickHitAnim = (): void => {
    const rt2 = getRuntime();
    if (!rt2) return;
    // 1. Sprite blink (DoHitAnimBlinkSpriteEffect).
    if (_hitAnimSpriteId >= 0) {
      const s = rt2.gSprites.get(_hitAnimSpriteId);
      if (!s) {
        _hitAnimSpriteId = -1;
      } else if (_hitAnimData1 === 32) {
        _hitAnimData1 = 0;
        s.invisible = false;
        _hitAnimSpriteId = -1;
      } else {
        if (_hitAnimData1 % 4 === 0) s.invisible = !s.invisible;
        _hitAnimData1++;
      }
    }
    // 2. Healthbox jiggle (SpriteCB_HitAnimHealthoxEffect).
    if (_hitAnimHealthbox) {
      _setHealthboxY2(rt2, _hitAnimHealthbox, _hitAnimHbY2);
      _hitAnimHbY2 = -_hitAnimHbY2;
      _hitAnimHbCount++;
      if (_hitAnimHbCount === 21) {
        _setHealthboxY2(rt2, _hitAnimHealthbox, 0, 0);
        _hitAnimHealthbox = null;
        _hitAnimHbCount = 0;
      }
    }
  };

  // ─── Mon intro animation (1:1 décomp SpriteCB_WildMonAnimate) ────────────
  // 1:1 décomp `SpriteCB_WildMonAnimate` (battle_main.c:2698) → `BattleAnimateFrontSprite`
  // joue l'animation du sprite front du mon sauvage à son entrée. Notre version porte
  // l'alternance 2-frames (`HasTwoFramesAnimation` : le front pic anim_front.png a 2
  // poses ; frame 0 = tileBase, frame 1 = tileBase + 64 tiles 8x8 pour un sprite 64x64),
  // jouée quelques cycles à l'apparition puis settle sur frame 0. (L'anim scriptée
  // per-species `gMonFrontAnimsPtrTable` = port plus large, à venir ; le 2-frame donne
  // déjà la "vie" GBA à l'entrée du mon.)
  let _monAnimSpriteId = -1;
  let _monAnimBaseTile = 0;
  let _monAnimTimer = 0;
  let _monAnimElapsed = 0;
  const MON_ANIM_FRAME_TILES = 64;    // 64x64 sprite = 64 tiles 8x8
  const MON_ANIM_SWAP_INTERVAL = 8;   // frames par pose
  const MON_ANIM_DURATION = 64;       // durée totale (frames) de l'anim d'entrée
  const _setMonTile = (rt2: ReturnType<typeof getRuntime>, spriteId: number, tile: number): void => {
    if (!rt2) return;
    const s = rt2.gSprites.get(spriteId);
    if (!s) return;
    s.tileBase = tile;
    const oam = rt2.gba.oam[s.oamIndex];
    if (oam) oam.tileId = tile;
  };
  const startMonIntroAnim = (spriteId: number, baseTile: number): void => {
    if (spriteId < 0) return;
    _monAnimSpriteId = spriteId;
    _monAnimBaseTile = baseTile;
    _monAnimTimer = 0;
    _monAnimElapsed = 0;
  };
  const tickMonIntroAnim = (): void => {
    if (_monAnimSpriteId < 0) return;
    const rt2 = getRuntime();
    if (!rt2) { _monAnimSpriteId = -1; return; }
    _monAnimElapsed++;
    if (_monAnimElapsed >= MON_ANIM_DURATION) {
      _setMonTile(rt2, _monAnimSpriteId, _monAnimBaseTile);   // settle frame 0
      _monAnimSpriteId = -1;
      return;
    }
    if (++_monAnimTimer >= MON_ANIM_SWAP_INTERVAL) {
      _monAnimTimer = 0;
      const s = rt2.gSprites.get(_monAnimSpriteId);
      const cur = s ? s.tileBase : _monAnimBaseTile;
      const next = (cur === _monAnimBaseTile) ? _monAnimBaseTile + MON_ANIM_FRAME_TILES : _monAnimBaseTile;
      _setMonTile(rt2, _monAnimSpriteId, next);
    }
  };

  // ─── Faint animation 1:1 décomp ─────────────────────────────────────────
  // 1:1 décomp `SpriteCB_FaintSlideAnim` (battle_main.c:2881-2888) :
  //   sprite.x2 += sSpeedX (= 0 for player faint)
  //   sprite.y2 += sSpeedY (= 5 for player faint)
  // Continue jusqu'à sprite hors écran (= y dépasse DISPLAY_HEIGHT 160).
  //
  // Pour opponent : `SpriteCB_FaintOpponentMon` + `SpriteCB_AnimFaintOpponent`
  // (battle_main.c:2744-2811) : descend de 8px/frame ET erase progressively
  // les tile rows depuis le bas (= sprite se "vide" visuellement). Le port
  // tile-row erasure n'est pas faisable sans direct VRAM manipulation, donc
  // notre adapt fait juste glissement vers bas + fade alpha à la fin.
  let _faintSpriteId = -1;
  let _faintFramesLeft = 0;
  let _faintIsOpponent = false;
  /** Démarre l'animation faint sur le sprite donné. isOpponent = true pour
   *  utiliser le pattern décomp `SpriteCB_FaintOpponentMon` (= descend lent
   *  + invisible à la fin). false pour player (= descend rapide hors écran). */
  const startFaintAnim = (spriteId: number, isOpponent: boolean) => {
    _faintSpriteId = spriteId;
    _faintIsOpponent = isOpponent;
    // Player : descend ~64px (= hors écran) à 5px/frame ≈ 13 frames.
    // Opponent : descend ~64px à 4px/frame (= 8px tous les 2 frames) ≈ 16 frames.
    _faintFramesLeft = isOpponent ? 16 : 13;
  };
  const tickFaint = (): void => {
    if (_faintFramesLeft <= 0) return;
    const rt2 = getRuntime();
    if (!rt2) return;
    const sprite = rt2.gSprites.get(_faintSpriteId);
    if (!sprite) { _faintFramesLeft = 0; return; }
    if (_faintIsOpponent) {
      // 1:1 décomp `SpriteCB_AnimFaintOpponent` (ll. 2788-2811) : sprite y2
      // += 8 chaque 2 frames. Notre port simplifie en y2 += 4 par frame
      // (= équivalent visuel sans le tile-erasure).
      sprite.y2 += 4;
    } else {
      // 1:1 décomp `SpriteCB_FaintSlideAnim` (ll. 2881-2888) : y2 += sSpeedY (=5).
      sprite.y2 += 5;
    }
    _faintFramesLeft--;
    if (_faintFramesLeft === 0) {
      // Sprite hors écran ou totalement fade : hide.
      sprite.invisible = true;
      sprite.y2 = 0;
      _faintSpriteId = -1;
    }
  };

  // ─── Bounce healthbox + mon player 1:1 décomp ───────────────────────────
  // 1:1 décomp `DoBounceEffect`/`SpriteCB_BounceEffect` (battle_main.c:2899-2979) +
  // `HandleInputChooseAction` (battle_controller_player.c:233-238) : pendant que le
  // JOUEUR choisit (menu action/attaque), son healthbox (box+barre) ET son Pokémon
  // bobblent verticalement de ~1px via une onde sinus. L'adversaire NE bobble PAS.
  //   - DoBounceEffect(BOUNCE_HEALTHBOX, delta=7, amplitude=1) → sinIndex init 128
  //   - DoBounceEffect(BOUNCE_MON, delta=7, amplitude=1)       → sinIndex init 192
  //   - chaque frame : sprite.y2 = Sin(sinIndex, amplitude) + amplitude ;
  //                    sinIndex = (sinIndex + delta) & 0xFF
  //   - Sin(i, amp) = (gSineTable[i] * amp) >> 8  → amplitude 1 ⇒ y2 ∈ [0,2].
  // EndBounceEffect (= sortie de la phase de sélection) remet y2 = 0 (figé).
  // Notre combat inline : on pilote le bounce par l'ÉTAT (= states de sélection).
  // Le y2 du sprite barre se propage à ses subsprites via syncSubspriteOam
  // (oam.y = sprite.y + sprite.y2 + sub.y), donc box+barre bobblent ensemble.
  const BOUNCE_DELTA = 7;
  const BOUNCE_AMPLITUDE = 1;
  const _bounceSelectionStates = new Set<State>([
    'ACTION_MENU_INIT', 'ACTION_MENU_INPUT', 'ACTION_EMIT_CHOOSE', 'ACTION_WAIT_CHOOSE_RESPONSE',
    'MOVE_MENU_INIT', 'MOVE_MENU_INPUT', 'MOVE_EMIT_CHOOSE', 'MOVE_WAIT_CHOOSE_RESPONSE',
  ]);
  let _bounceActive = false;
  let _hbSinIndex = 128;
  let _monSinIndex = 192;
  const _bounceSinY2 = (sinIndex: number): number =>
    ((gSineTable(sinIndex) * BOUNCE_AMPLITUDE) >> 8) + BOUNCE_AMPLITUDE;
  const _setPlayerHealthboxY2 = (rt2: ReturnType<typeof getRuntime>, y2: number): void => {
    if (!rt2 || !playerHealthbox) return;
    for (const id of [playerHealthbox.leftSpriteId, playerHealthbox.rightSpriteId, playerHealthbox.healthbarSpriteId]) {
      const s = rt2.gSprites.get(id);
      if (s) s.y2 = y2;
    }
  };
  const tickBounce = (): void => {
    const rt2 = getRuntime();
    if (!rt2) return;
    const shouldBounce = _bounceSelectionStates.has(state);
    if (shouldBounce && !_bounceActive) {
      // DoBounceEffect start : reset sinIndex (1:1 décomp : 128 healthbox / 192 mon).
      _bounceActive = true;
      _hbSinIndex = 128;
      _monSinIndex = 192;
    } else if (!shouldBounce && _bounceActive) {
      // EndBounceEffect : y2 = 0 (figé).
      _bounceActive = false;
      _setPlayerHealthboxY2(rt2, 0);
      if (playerSpriteId >= 0) { const s = rt2.gSprites.get(playerSpriteId); if (s) s.y2 = 0; }
      return;
    }
    if (!_bounceActive) return;
    // SpriteCB_BounceEffect : oscille y2 + avance sinIndex.
    _setPlayerHealthboxY2(rt2, _bounceSinY2(_hbSinIndex));
    if (playerSpriteId >= 0) { const s = rt2.gSprites.get(playerSpriteId); if (s) s.y2 = _bounceSinY2(_monSinIndex); }
    _hbSinIndex = (_hbSinIndex + BOUNCE_DELTA) & 0xFF;
    _monSinIndex = (_monSinIndex + BOUNCE_DELTA) & 0xFF;
  };

  // ─── HP bar drain animation 1:1 décomp MoveBattleBar ────────────────────
  // 1:1 décomp `MoveBattleBar`/`CalcNewBarValue`/`MoveBattleBarGraphically`
  // (battle_interface.c:2238-2330) + `Cmd_healthbarupdate`/`Cmd_datahpupdate`.
  // Au lieu de faire SAUTER la barre HP au nouveau PV (renderHpWindows instantané),
  // on l'anime ~1px/frame de oldHp → newHp. Le hook graphique (= MoveBattleBarGraphically)
  // re-blitte les 6 tiles fill au `currValue` interpolé chaque frame (Q24.8 quand
  // maxHP < 48, cf. CalcNewBarValue). La progression du combat (messages d'efficacité,
  // check faint) est GATÉE tant que la barre se vide (= `waitforhealthbar` décomp).
  // battler 0 = player, 1 = opponent (single).
  const _hpDrainBattlers = new Set<number>();
  // 1:1 décomp : MoveBattleBarGraphically lit battleBars[battler].currValue. Notre
  // hook mappe battler → handle + convertit currValue (Q24.8 si maxValue<48) → PV réel.
  setMoveBattleBarGraphicallyHook((battler: number, whichBar: number) => {
    if (whichBar === HEALTH_BAR) {
      const handle = battler === 0 ? playerHealthbox : opponentHealthbox;
      if (!handle) return;
      const bar = battleBars[battler];
      const realHp = bar.maxValue < 48 ? bar.currValue / 256 : bar.currValue;
      updateHealthboxHpBar(handle, realHp, bar.maxValue);
      return;
    }
    if (whichBar === EXP_BAR) {
      // 1:1 décomp MoveBattleBarGraphically EXP_BAR : player only (battler 0).
      // currValue = exp DANS le niveau courant ; Q24.8 si expForLevel < 64
      // (= EXP scale 8*8), sinon entier (cf. CalcNewBarValue). updateHealthboxExpBar
      // re-blitte les 8 tiles fill au % interpolé.
      if (!playerHealthbox || !playerMon) return;
      const bar = battleBars[0];
      const realExp = bar.maxValue < 64 ? bar.currValue / 256 : bar.currValue;
      updateHealthboxExpBar(playerHealthbox, realExp, bar.maxValue, playerMon.level);
    }
  });
  /** Démarre le drain HP gradué (1:1 SetBattleBarStruct). `battler` 0/1 ; le hook
   *  graphique anime ensuite via tickHpDrain. Rendu immédiat à oldHp (anti-flash). */
  const startHpDrain = (battler: number, handle: HealthboxHandle | null, maxHp: number, oldHp: number, newHp: number): void => {
    if (!handle || oldHp === newHp) return;
    SetBattleBarStruct(battler, 0, maxHp, oldHp, oldHp - newHp);
    _hpDrainBattlers.add(battler);
    updateHealthboxHpBar(handle, oldHp, maxHp);  // évite le flash 1-frame au newHp
  };
  const tickHpDrain = (): void => {
    if (_hpDrainBattlers.size === 0) return;
    for (const battler of [..._hpDrainBattlers]) {
      // MoveBattleBar avance currValue d'1px ET appelle le hook graphique. -1 = fini.
      const ret = MoveBattleBar(battler, 0, HEALTH_BAR, 0);
      if (ret === -1) _hpDrainBattlers.delete(battler);
    }
  };
  const isHpDraining = (battler?: number): boolean =>
    battler === undefined ? _hpDrainBattlers.size > 0 : _hpDrainBattlers.has(battler);

  // ─── EXP bar fill animation 1:1 décomp MoveBattleBar EXP_BAR + Cmd_getexp ──
  // 1:1 décomp `Cmd_getexp` (battle_script_commands.c:3255) case 3/4/5 loop :
  // `BtlController_EmitExpUpdate` anime la barre EXP vers le seuil de niveau ; si
  // level-up, le controller renvoie le reste d'exp → boucle pour donner le reste
  // (barre reset à 0% pour le nouveau niveau). Notre port inline (pas de Controller
  // IPC) : on remplit la barre par CHUNK (1 chunk = jusqu'au prochain seuil de
  // niveau) via MoveBattleBar(EXP_BAR), puis applyExpAward(chunk) applique l'exp +
  // le level-up + recompute les stats. Player only (single mon, pas d'Exp.Share).
  let _expFilling = false;
  let _expToGive = 0;        // exp restante à distribuer (animée par chunk).
  let _expFillPending = 0;   // chunk en cours d'animation (appliqué à la fin du tick).
  const startExpFill = (maxExpInLevel: number, oldExpInLevel: number, newExpInLevel: number): void => {
    if (!playerHealthbox || newExpInLevel === oldExpInLevel) { _expFilling = false; return; }
    // receivedValue = old - new < 0 → CalcNewBarValue remplit la barre vers la droite (gain).
    SetBattleBarStruct(0, 0, maxExpInLevel, oldExpInLevel, oldExpInLevel - newExpInLevel);
    _expFilling = true;
    if (playerMon) updateHealthboxExpBar(playerHealthbox, oldExpInLevel, maxExpInLevel, playerMon.level);
  };
  const tickExpFill = (): void => {
    if (!_expFilling) return;
    const ret = MoveBattleBar(0, 0, EXP_BAR, 0);  // avance currValue + appelle le hook graphique
    if (ret === -1) _expFilling = false;
  };
  const isExpFilling = (): boolean => _expFilling;
  /** Démarre l'animation du prochain chunk d'exp (jusqu'au seuil de niveau courant).
   *  Retourne false si plus rien à animer (= reste 0, ou MAX_LEVEL). */
  const beginExpChunk = (): boolean => {
    if (!playerMon || _expToGive <= 0 || playerMon.level >= 100) return false;
    if (!playerMon.growthRate || playerMon.currentExp === undefined) return false;
    const currLevelExp = getExperienceForLevel(playerMon.growthRate, playerMon.level);
    const nextLevelExp = getExperienceForLevel(playerMon.growthRate, playerMon.level + 1);
    const currExpInLevel = playerMon.currentExp - currLevelExp;
    const expForLevel = nextLevelExp - currLevelExp;
    const expToNext = nextLevelExp - playerMon.currentExp;
    const chunk = Math.min(_expToGive, expToNext);
    if (chunk <= 0 || expForLevel <= 0) return false;
    _expFillPending = chunk;
    startExpFill(expForLevel, currExpInLevel, currExpInLevel + chunk);
    return true;
  };

  const tick = (): boolean => {
    const rt = getRuntime();
    if (!rt) return false;

    // R1 — Controller IPC tick : drive gBattlerControllerFuncs[i] chaque frame
    // si Controller IPC dispatch activé (= __USE_CONTROLLER_DISPATCH__). Pour
    // chaque battler dont gBattleControllerExecFlags bit set, call handler.
    // Permet les handlers L1..L14 (HandleInputChooseAction/Move, PlayerHandle
    // PrintString, HealthBar K10, etc.) d'être effectivement déclenchés quand
    // emit+flag set par engine.
    const tickModule = (globalThis as { __battleControllerTick?: { tickActiveBattlerController?: () => void } }).__battleControllerTick;
    tickModule?.tickActiveBattlerController?.();

    // Tick hit animation (= run regardless of state, so le blink/jiggle survit
    // aux text waits + transitions).
    tickHitAnim();
    tickMonIntroAnim();
    tickFaint();
    tickBounce();
    tickHpDrain();
    tickExpFill();
    // Devtool : expose l'état combat visuel (sprite ids + anims actives) pour
    // inspection (= dev.battle.* / probes). Rafraîchi chaque frame.
    (globalThis as { __battleDbg?: unknown }).__battleDbg = {
      playerSpriteId, opponentSpriteId,
      hitAnimActive: _hitAnimSpriteId >= 0,
      hitAnimData1: _hitAnimData1,
      hbJiggleActive: _hitAnimHealthbox !== null,
      hpDraining: isHpDraining(),
      expFilling: isExpFilling(),
      state,
    };
    // 1:1 décomp `Task_DoPokeballSendOutAnim` polling via sprite callback chain.
    // Notre tick centralisé invoke tickBallThrow() chaque frame ; le state machine
    // BALL_THROW polle l'outcome pour transition.
    if (isBallThrowActive()) {
      const r = tickBallThrow();
      if (r.done) {
        // Stash outcome + message pour BALL_THROW_RESULT state.
        _ballThrowOutcome = r.outcome;
        _ballThrowMessage = r.message;
      }
    }

    // NB : plus de re-hide/re-pause per-frame des sprites OW. Ils sont DÉTRUITS
    // au battle entry (LOAD_ASSETS, 1:1 ResetSpriteData) → ils n'existent plus
    // pendant le combat, donc UpdateObjectEvents (suspendu via
    // setObjectEventsSuspended au INIT) n'a rien à re-montrer et aucune
    // copy-request VRAM ne peut corrompre la healthbox.

    switch (state) {
      case 'INIT': {
        // R3 fix : reset field-message-box state au début de chaque combat.
        // Sans ça, sWindowId persistant cross-combat pointe vers un window id
        // obsolète (= effacé par battle VRAM init au battle start) → AddText
        // PrinterParameterized3 warn "window X not found" + text invisible.
        // 1:1 décomp partial : InitFieldMessageBox reset sFieldMessageBoxMode
        // = HIDDEN + sStateStep = 0 + sWindowId = -1 (= force re-AddWindow au
        // prochain ShowFieldMessage).
        void import('../field/field-message-box').then(({ InitFieldMessageBox }) => {
          InitFieldMessageBox();
        });
        // E1c : 1:1 décomp `CB2_InitBattleInternal` (battle_main.c:663-670) reset
        // gBattle_BG0/1/2/3_X/Y = 0. CRITIQUE : le combat tourne INLINE dans la
        // GameScene overworld, donc `FieldUpdateBgTilemapScroll` (field-camera.c)
        // ré-applique le scroll caméra (= vofs≈40) sur BG1/2/3 CHAQUE frame et
        // clobber le terrain battle (BG3) → plateformes décalées + tiles vides
        // (noir) en bas. Le décomp évite ça via SetMainCallback2(CB2_InitBattle)
        // qui swap le main callback (bypass FieldUpdateBgTilemapScroll). Notre
        // équivalent = setFieldCameraSuspended(true) (pattern ChooseStarter).
        // Réactivé au CLEANUP (retour overworld).
        for (let i = 0; i < 4; i++) { const c = rt.gba.bg(i as 0 | 1 | 2 | 3).config; c.hofs = 0; c.vofs = 0; }
        void import('../field/field-camera').then(({ setFieldCameraSuspended }) => {
          setFieldCameraSuspended(true);
        });
        // Combat inline : MainCB2_Overworld continue de tick UpdateObjectEvents()
        // chaque frame APRÈS le tick battle (= ScriptContext_RunScript en amont).
        // UpdateObjectEvents re-sync `sprite.invisible = npc.invisible` (= false
        // pour Birch + son sac) → ré-affiche les sprites OW par-dessus le combat
        // (silhouette noire + objet flottant) malgré le stash hide. Le décomp évite
        // ça via le CB2 swap qui stoppe tout le champ. Notre équivalent 1:1 :
        // setObjectEventsSuspended(true) (= UpdateObjectEvents early-return). NB :
        // cleanupScene() du starter flow remet (false) juste avant le combat, donc
        // le combat doit le re-suspendre lui-même. Réactivé au CLEANUP.
        void import('../field/object-events').then(({ setObjectEventsSuspended }) => {
          setObjectEventsSuspended(true);
        });
        // Stoppe l'anim EAU du tileset overworld (TransferTilesetAnimsBuffer re-blit
        // byte 0x3600+ chaque frame → écrase la tile 448 = window action prompt).
        pauseTilesetAnimations();
        // User feedback : "fond vers transparent du sac = vide" = entre
        // cleanupScene ChooseStarter et SPAWN_SPRITES battle, l'écran montre
        // OW pendant plusieurs frames. Fix 1:1 décomp `CB2_InitBattle` :
        // BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0x10, RGB_BLACK) = fade
        // vers noir instant (delay=0, startY=0, endY=16). L'écran reste noir
        // pendant LOAD_ASSETS, puis SPAWN_SPRITES setup BG3 grass + sprites
        // puis fade-in via tickHitAnim/tickFaint flow.
        try {
          rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 0, 16, 'RGB_BLACK');
        } catch { /* fallthrough */ }
        // Pick player Pokemon : first non-fainted from party.
        const party = gSaveBlock1Ptr.playerParty;
        // Slot du 1er mon non-KO = mon actif initial (1:1 : premier mon valide envoyé).
        const _initSlot = party.findIndex((m: PokemonInstance | null) => !!m && m.currentHp > 0);
        playerMon = params.playerMon
          ?? (_initSlot >= 0 ? party[_initSlot] : null)
          ?? null;
        _activePlayerSlot = params.playerMon ? party.indexOf(params.playerMon) : _initSlot;
        if (_activePlayerSlot < 0) _activePlayerSlot = 0;
        if (!playerMon) {
          console.warn('[battle-flow] no player Pokemon — auto-defeat');
          outcome = BATTLE_OUTCOME_LOST;
          state = 'CLEANUP';
          return false;
        }
        // Build opponent Pokemon (= 1:1 décomp battle_controllers.c
        // SetUpBattleVarsAndBirchZigzagoon : CreateMon SPECIES_ZIGZAGOON, 2).
        try {
          opponentMon = createPokemonInstance(params.opponentSpecies, params.opponentLevel);
        } catch (e) {
          console.error('[battle-flow] failed to create opponent', e);
          outcome = BATTLE_OUTCOME_LOST;
          state = 'CLEANUP';
          return false;
        }
        console.log(`[battle-flow] start : ${playerMon.nickname} Lv${playerMon.level} (${playerMon.currentHp}/${playerMon.maxHp}) vs ${opponentMon.nickname} Lv${opponentMon.level} (${opponentMon.currentHp}/${opponentMon.maxHp})`);
        // 1:1 décomp : fill gPlayerParty/gEnemyParty battle-side au début de
        // combat. Ainsi les opcodes du bytecode interpreter qui lisent
        // GetMonData(gPlayerParty[i], ...) ont les bonnes données.
        setupPartyForBattle(party.filter((m: PokemonInstance | null): m is PokemonInstance => !!m), [opponentMon]);
        // 1:1 décomp battle_main.c:BattleIntroGetMonsData : populate gBattleMons[0]
        // (player active) + gBattleMons[1] (enemy active) depuis party slot 0.
        // Cette init est requise pour que les opcodes bytecode lisent les vraies
        // stats au lieu de zéros.
        fillActiveBattleMonsForBattleStart();
        // 1:1 décomp `DoStandardWildBattle` (battle_setup.c:402-419) →
        // `CreateBattleStartTask(transition, song=0)` →
        // `PlayMapChosenOrBattleBGM(0)` qui :
        //   1. ResetMapMusic() + m4aMPlayAllStop() (= stop overworld BGM)
        //   2. PlayNewMapMusic(GetBattleBGM()) → MUS_VS_WILD pour wild battle
        // Donc le BGM combat doit start AVANT le slice transition (= il joue
        // PENDANT la transition).
        //
        // 1:1 décomp `GetBattleBGM` (pokemon.c:6394-6457) : pour wild battle
        // (= !TRAINER && !LINK && !KYOGRE_GROUDON && !REGI) → MUS_VS_WILD = 474.
        // Trainer/leader/champion variants viendront avec le trainer-battle-flow.
        //
        // On utilise `m4aSongNumStart(MUS_VS_WILD, true)` 1:1 décomp (= PlayBGM
        // dispatch via song table). Loop=true car MUS_VS_WILD a des loop markers
        // dans le .mid. `playMidiLoop` ne marchait pas car nécessite primeAudio
        // qui n'est pas appelé par notre code overworld (= m4aPrime suffit).
        import('../system/decomp-globals').then(({ m4aSongNumStart }) => {
          m4aSongNumStart(474 /* MUS_VS_WILD */, true);
        });
        // 1:1 décomp `Task_BattleTransition` (battle_transition.c:1063) :
        // une transition = PHASE 1 INTRO (flash) PUIS PHASE 2 MAIN (Slice).
        // `sTasks_Intro[B_TRANSITION_SLICE]` = `Task_Intro` → `CreateIntroTask(0,0,3,2,2)`
        // = 3 cycles de flash gris RGB(11,11,11) AVANT l'animation Slice.
        // Ce flash MANQUAIT (= user feedback "l'écran pop direct sans fade in").
        startBattleIntroFlash();
        state = 'TRANSITION_INTRO';
        return false;
      }

      case 'TRANSITION_INTRO': {
        // 1:1 décomp `Transition_StartIntro` + `Transition_WaitForIntro`
        // (battle_transition.c:1068-1096) : run le flash gris 3×, puis quand
        // `IsIntroTaskDone()` → lance le Main task (= Slice phase 2).
        if (tickBattleIntroFlash()) {
          // 1:1 décomp `Transition_StartMain` (l.1098) : CreateTask(sTasks_Main[SLICE]).
          startBattleTransitionSlice();
          state = 'TRANSITION_SLICE';
        }
        return false;
      }

      case 'TRANSITION_SLICE': {
        // 1:1 décomp `Task_Slice` polling (battle_transition.c:2716+).
        // Quand tickBattleTransitionSlice() retourne true → effectX >= WIDTH,
        // `Slice_End` a déjà fait `FadeScreenBlack()` = BlendPalettes(ALL, 16,
        // BLACK) = écran NOIR **INSTANT**. 1:1 décomp `Task_BattleStart` state 1 :
        // IsBattleTransitionDone → CleanupOverworld + SetMainCallback2(CB2_InitBattle).
        // PAS de fade progressif intermédiaire (= sinon on revoit l'overworld).
        // L'écran reste noir (palettes blendées) pendant le load assets.
        if (tickBattleTransitionSlice()) {
          state = 'LOAD_ASSETS';
        }
        return false;
      }

      case 'INIT_FADE_WAIT': {
        // (Legacy state conservé pour compat ad-hoc. Plus utilisé dans le flow
        // 1:1 standard : TRANSITION_SLICE → LOAD_ASSETS direct, l'écran est
        // déjà noir via FadeScreenBlack.)
        if (!rt.gPaletteFade.active) {
          state = 'LOAD_ASSETS';
        }
        return false;
      }

      case 'LOAD_ASSETS': {
        if (!loadStarted && playerMon && opponentMon) {
          loadStarted = true;
          // 1:1 décomp `CB2_InitBattleInternal` ll. 629-634 : setup WIN0 =
          // fente 1px au centre + WININ/WINOUT=0 (= tout masqué) AVANT le load
          // assets. L'écran est déjà noir (Slice_End FadeScreenBlack) ; ce
          // masque géométrique WIN0V tiendra le battle screen invisible pendant
          // que les palettes battle écrasent le noir, jusqu'à l'ouverture
          // `BattleIntroSlide` (= la fente s'ouvre du centre = "ouvre la map
          // en deux", effet 1:1 GBA observé par user).
          setupBattleWindowForIntro();
          (async () => {
            try {
              // Ensure game-data is loaded (= moves table for damage calc).
              await loadGameData();
              // E1b : charger mon-pic-coords (y_offset par espèce) pour
              // positionner les sprites 1:1 (GetBattlerSpriteFinal_Y).
              await loadMonPicCoords().catch(e => console.warn('[battle-flow E1b] mon-pic-coords load failed:', e));
              // Expose getSpeciesInfo via global for getSpeciesStats lookup.
              const gameData = await import('../data/game-data');
              (globalThis as { __game_data?: unknown }).__game_data = gameData;
              // 1:1 décomp `CB2_InitBattleInternal` (battle_main.c:681) :
              // FreeAllSpritePalettes(). CRITIQUE : l'overworld occupe les OBJ
              // palette slots 0-3. Sans free, LoadSpritePalette(player/opponent)
              // alloue les 1ers slots libres = 4 et 5. Or le healthbox utilise les
              // slots FIXES 5/6 → l'ennemi (slot 5) prend la palette healthbox →
              // sprite ennemi GARBLED. Free → mon sprites prennent 0/1, healthbox
              // 5/6, zéro collision. (Le décomp set ensuite gReservedSpritePaletteCount
              // = MAX_BATTLERS mais nos mon sprites passent par LoadSpritePalette,
              // donc on laisse reserved=0 pour qu'ils prennent 0/1.)
              FreeAllSpritePalettes();
              // Load player back sprite.
              const playerDexId = playerMon!.speciesEnum.replace('SPECIES_', '').toLowerCase();
              const playerUrl = `/decomp/em/pokemon/${playerDexId}/back.png`;
              const playerLoaded = await rt.LoadCompressedSpriteSheet(playerUrl, PLAYER_SPRITE_BYTE_OFFSET);
              _battlePlayerPalSlot = LoadSpritePalette({ data: playerLoaded.palette, tag: TAG_BATTLE_PLAYER_PAL });
              // Detect actual sprite dimensions (back sprite often 64x64 but can vary).
              const playerWH = await detectImageWH(playerUrl);
              if (playerWH) {
                const sized = oamShapeSizeFromWH(playerWH.w, playerWH.h);
                playerSpriteShape = sized.shape;
                playerSpriteSize  = sized.size;
              }

              // Load opponent front sprite.
              const oppDexId = opponentMon!.speciesEnum.replace('SPECIES_', '').toLowerCase();
              // 1:1 décomp : le mon sauvage utilise son front pic ANIMÉ (anim_front.png =
              // 2 poses 64x64 empilées, pour HasTwoFramesAnimation). detectImageWH renvoie
              // null si 404 → fallback front.png (statique) pour les espèces sans anim_front.
              const oppAnimUrl = `/decomp/em/pokemon/${oppDexId}/anim_front.png`;
              const oppStaticUrl = `/decomp/em/pokemon/${oppDexId}/front.png`;
              const oppAnimWH = await detectImageWH(oppAnimUrl);
              const oppUrl = oppAnimWH ? oppAnimUrl : oppStaticUrl;
              const oppLoaded = await rt.LoadCompressedSpriteSheet(oppUrl, OPPONENT_SPRITE_BYTE_OFFSET);
              _battleOpponentPalSlot = LoadSpritePalette({ data: oppLoaded.palette, tag: TAG_BATTLE_OPPONENT_PAL });
              const oppWH = oppAnimWH ?? await detectImageWH(oppUrl);
              if (oppWH) {
                const sized = oamShapeSizeFromWH(oppWH.w, oppWH.h);
                oppSpriteShape = sized.shape;
                oppSpriteSize  = sized.size;
              }
              // 1:1 décomp `LoadBattleTextboxAndBackground` (battle_bg.c:859-867).
              // Charge BG0 textbox + BG3 terrain selon l'environnement.
              // E1 fix : utiliser BattleSetup_GetEnvironmentId() 1:1 décomp
              // (= metatile behavior position player + mapType) au lieu du
              // hardcode GRASS. → terrain correct par lieu (grass/sand/water/
              // cave/building/etc). 1:1 décomp CB2_InitBattleInternal ll.672
              // `gBattleEnvironment = BattleSetup_GetEnvironmentId()`.
              const bgMod = await import('./battle-bg');
              const setupMod = await import('./battle-setup-helpers');
              const env = setupMod.BattleSetup_GetEnvironmentId();
              console.log('[battle-flow E1] BattleSetup_GetEnvironmentId →', env);
              await bgMod.loadBattleTextboxAndBackground(env);
              // 1:1 décomp `CB2_InitBattleInternal` (battle_main.c:678) :
              // `ResetSpriteData()` détruit TOUS les sprites juste après
              // LoadBattleTextboxAndBackground. Notre combat tourne INLINE (pas de
              // SetMainCallback2(CB2_InitBattle)), donc les sprites object-event OW
              // (player avatar + NPCs) survivaient au combat et partageaient la VRAM
              // OBJ avec les sprites combat : un sprite OW animé ré-écrivait sa VRAM
              // (ex avatar tile 144 = 0x1200) via RequestSpriteFrameImageCopy, ce qui
              // chevauche la région hardcodée healthbox → corruption "fleur" du groove
              // de la box adverse (user-flag 2026-05-30). FIX 1:1 : on détruit
              // explicitement les sprites OW ici. Les STRUCTS gObjectEvents[]/
              // gPlayerAvatar persistent (EWRAM) → re-spawn au retour OW via
              // `_restoreOverworldFromMenu` (= ResetSpriteData côté décomp, sprites
              // transients). ResetSpriteCopyRequests vide la queue de copy-requests
              // en attente (sinon une copy déjà queuée par un sprite détruit
              // s'exécuterait au VBlank et corromprait quand même la VRAM healthbox).
              const [oeMod, paMod, saMod] = await Promise.all([
                import('../field/object-events'),
                import('../field/player-avatar'),
                import('../system/sprite-animation'),
              ]);
              oeMod.destroyAllNpcSprites(rt);
              paMod.DestroyPlayerAvatar(rt);
              saMod.ResetSpriteCopyRequests();
              loadDone = true;
            } catch (e) {
              console.error('[battle-flow] sprite load failed', e);
              loadFailed = true;
            }
          })();
        }
        state = 'WAIT_LOAD';
        return false;
      }

      case 'WAIT_LOAD': {
        if (loadFailed) {
          // Fallback : auto-win to keep tutorial unblocked.
          outcome = BATTLE_OUTCOME_WIN;
          state = 'CLEANUP';
          return false;
        }
        if (loadDone) state = 'SPAWN_SPRITES';
        return false;
      }

      case 'SPAWN_SPRITES': {
        // Iter16 : hide overworld BGs (BG1=foreground, BG2=middleground,
        //   BG3=background tiles) during battle pour donner un fond noir.
        //   On garde BG0 visible car c'est là où nos windows (HP + dialog)
        //   sont rendues. La couleur de fond du screen (= backgroundColor
        //   du Phaser game = '#000000') sera visible sous les BGs cachés.
        // 1:1 décomp : hide BG1/BG2 (= overlays rarement utilisés), garde BG0
        // (= AddWindow windows) intact, et show BG3 (= terrain herbe 1:1 décomp).
        HideBg(1);
        HideBg(2);
        ShowBg(3);
        // Reset BG3 vofs/hofs qui pourraient avoir été set par overworld.
        rt.gba.bg(3).config.hofs = 0;
        rt.gba.bg(3).config.vofs = 0;
        // NB : les sprites OW (player avatar + NPCs) ont DÉJÀ été détruits à
        // LOAD_ASSETS (1:1 décomp ResetSpriteData, cf. commentaire là-bas). Plus
        // aucun stash/hide/animPaused : les sprites n'existent plus pendant le
        // combat → zéro corruption VRAM possible, re-spawn au CLEANUP.

        // Compute tileId for each sprite (= byteOffset / 32 bytes per tile).
        const playerTileId   = PLAYER_SPRITE_BYTE_OFFSET   / 32;
        const opponentTileId = OPPONENT_SPRITE_BYTE_OFFSET / 32;

        // 1:1 décomp battle_controller_*.c : on passe les coords CENTRE à
        // CreateSpriteAtOam (= sprite.x/y). `syncSpritesToOam` applique ensuite
        // centerToCornerVec (-32 pour 64x64) chaque frame → oam corner = center-32.
        //   X = GetBattlerSpriteCoord(BATTLER_COORD_X_2) = sBattlerCoords.x (centre)
        //   Y = GetBattlerSpriteDefault_Y(battler) = _getBattlerSpriteFinalY (centre)
        // E1b : force 64x64 (= tous les mon sprites sont des frames 64x64 dans le
        // décomp ; detectImageWH lisait la hauteur du SPRITESHEET 64x256/128 →
        // shape/size faux + affichage de tous les frames empilés).
        const oppCenterY = opponentMon ? _getBattlerSpriteFinalY(opponentMon.speciesEnum, false) : SBATTLER_COORD_Y_OPPONENT;
        const playerCenterY = playerMon ? _getBattlerSpriteFinalY(playerMon.speciesEnum, true) : SBATTLER_COORD_Y_PLAYER;
        const opp = rt.CreateSpriteAtOam({
          tileId: opponentTileId,
          paletteBank: _battleOpponentPalSlot,
          x: SBATTLER_COORD_X_OPPONENT, y: oppCenterY,
          shape: POKEMON_SPRITE_SHAPE, size: POKEMON_SPRITE_SIZE,
          // 1:1 décomp gOamData_BattleSpriteOpponentSide.priority = 2 : les sprites
          // pokémon sont DERRIÈRE les healthboxes (prio 1) → la box dessine par-dessus
          // (sinon le sprite ennemi cache le surnom/genre de la box joueur).
          priority: 2,
        });
        opponentSpriteId = opp.spriteId;
        const player = rt.CreateSpriteAtOam({
          tileId: playerTileId,
          paletteBank: _battlePlayerPalSlot,
          x: SBATTLER_COORD_X_PLAYER, y: playerCenterY,
          shape: POKEMON_SPRITE_SHAPE, size: POKEMON_SPRITE_SIZE,
          // 1:1 décomp gOamData_BattleSpritePlayerSide.priority = 2 (cf. opponent).
          priority: 2,
        });
        playerSpriteId = player.spriteId;
        // 1:1 décomp : après spawn des sprites + healthbox, le battle screen
        // est révélé par l'OUVERTURE de la fente WIN0V (`BattleIntroSlide`),
        // PAS par un fade palette. → INIT_HP_WINDOWS (créé healthbox, encore
        // masqués par WIN0V) → BATTLE_INTRO_SLIDE (ouvre la fente).
        state = 'INIT_HP_WINDOWS';
        return false;
      }

      case 'POST_SPAWN_FADE_IN':
      case 'POST_SPAWN_FADE_WAIT': {
        // Legacy (= ancien fade palette FAUX, remplacé par BattleIntroSlide
        // WIN0V 1:1 décomp). Conservé comme no-op redirect pour compat ad-hoc.
        state = 'INIT_HP_WINDOWS';
        return false;
      }

      case 'INIT_HP_WINDOWS': {
        // Phase 1.4 N Q3 D6 : reveal sprites OAM healthbox 1:1 décomp + cleanup
        // des AddWindow legacy. Le nickname rendering via tile-data dynamic est
        // une sous-phase suivante (= D6b deferred — nécessite text-to-tiles renderer).
        // L'oppHpWindowId / playerHpWindowId restent à -1 (= AddWindow plus créés).
        if (!opponentHealthbox) {
          void createBattlerHealthboxSprites('opponent').then(handle => {
            opponentHealthbox = handle;
            if (handle) {
              setHealthboxVisible(handle, true);  // 1:1 décomp : visible après init
              renderHpWindows();  // populate tile data dynamique immédiatement
              // 1:1 décomp UpdateHealthboxAttribute : surnom + genre (1 fois à l'init).
              if (opponentMon) updateHealthboxNick(handle, opponentMon.nickname, (opponentMon as { monGender?: number }).monGender ?? 255);
            }
          }).catch(e => console.warn('[battle-flow] opp healthbox create failed:', e));
        }
        if (!playerHealthbox) {
          void createBattlerHealthboxSprites('player').then(handle => {
            playerHealthbox = handle;
            if (handle) {
              setHealthboxVisible(handle, true);
              renderHpWindows();
              // 1:1 décomp UpdateHealthboxAttribute : surnom + genre (1 fois à l'init).
              if (playerMon) updateHealthboxNick(handle, playerMon.nickname, (playerMon as { monGender?: number }).monGender ?? 255);
            }
          }).catch(e => console.warn('[battle-flow] player healthbox create failed:', e));
        }
        // 1:1 décomp : à ce stade le décomp a les VRAIES couleurs battle
        // (LoadCompressedPalette dans CB2_InitBattle écrasent le noir du
        // FadeScreenBlack). Notre `Slice_End` a fait BlendPalettes(ALL,16,BLACK)
        // → gPlttBufferFaded NOIR persistant. On le restaure INSTANT (= coeff 0
        // → Faded ← Unfaded pur, PAS un fade progressif) avant l'ouverture.
        // Les palettes battle sont déjà dans Unfaded (LoadPalette écrit both).
        _restorePalettesFromUnfaded();
        // 1:1 décomp : healthbox + sprites créés (encore masqués par la fente
        // WIN0V). On lance `BattleIntroSlide` = l'ouverture verticale de la
        // fente du centre vers haut+bas ("ouvre la map en deux", 1:1 GBA).
        startBattleIntroSlide();
        state = 'BATTLE_INTRO_SLIDE';
        return false;
      }

      case 'BATTLE_INTRO_SLIDE': {
        // 1:1 décomp `BattleIntroSlide1` (battle_intro.c:154-237) : la fente
        // WIN0V s'ouvre du centre (state 2 lent -0xFF/frame jusqu'à top=48,
        // state 3 rapide -0x3FC/frame jusqu'à top=0) → battle screen révélé.
        if (tickBattleIntroSlide()) {
          state = 'INTRO_TEXT';
        }
        return false;
      }

      case 'INTRO_TEXT': {
        if (!opponentMon) { state = 'CLEANUP'; return false; }
        showBattleMessage(`Un ${opponentMon.nickname} sauvage\napparaît!`);
        // Iter18 : play opponent cry on appear (= 1:1 décomp behavior).
        // FIX : utiliser speciesName EN canonique (= "Poochyena"), PAS nickname FR
        // ("MEDHYENA"). Les fichiers cri sont `/cries/<speciesName>.wav` (= EN).
        // Avec nickname FR → medhyena.wav 404 → "cry fail EncodingError".
        void import('../system/music').then(({ playCry }) => {
          playCry(opponentMon!.speciesName);
        });
        // 1:1 décomp SpriteCB_WildMonAnimate : anim du front sprite du mon sauvage
        // à l'entrée (2-frames anim_front.png), jouée en même temps que le cri.
        startMonIntroAnim(opponentSpriteId, OPPONENT_SPRITE_BYTE_OFFSET / 32);
        state = 'INTRO_WAIT';
        return false;
      }

      case 'INTRO_WAIT': {
        if (messageWaitDone()) {
          HideFieldMessageBox();
          // 1:1 décomp : abilities/objets de SWITCH-IN (Intimidation, Crachin, Trace…)
          // se déclenchent après l'entrée des mons, avant le 1er tour.
          state = 'SWITCH_IN_EVENTS';
        }
        return false;
      }

      case 'SWITCH_IN_EVENTS': {
        // 1:1 décomp TryDoEventsBeforeFirstTurn : weather + ON_SWITCHIN (ordre vitesse)
        // + INTIMIDATE1/TRACE + objets switch-in. Les messages FR sont drainés via
        // END_TURN_MSG (qui finit à PLAYER_TURN_PROMPT). Gaté bytecode (défaut TRUE).
        if (isBytecodeDamageEnabled()) {
          const r = runSwitchInEventsViaBytecode();
          if (r.ok && r.messages && r.messages.length > 0) {
            _pendingBytecodeMessages = [..._pendingBytecodeMessages, ...r.messages];
          }
          // renderHpWindows : Intimidate baisse l'Atk (stat stage) — pas d'effet HP, mais
          // au cas où un objet switch-in (baie) soignerait, refléter l'état.
          renderHpWindows();
          state = _pendingBytecodeMessages.length > 0 ? 'END_TURN_MSG' : 'PLAYER_TURN_PROMPT';
        } else {
          state = 'PLAYER_TURN_PROMPT';
        }
        return false;
      }

      case 'PLAYER_TURN_PROMPT': {
        if (!playerMon) { state = 'CLEANUP'; return false; }
        // Iter18 : play player cry on first turn prompt (= when player mon
        // visually "comes out" of its ball). Only once per battle.
        if (!_playerCryPlayed) {
          _playerCryPlayed = true;
          void import('../system/music').then(({ playCry }) => {
            playCry(playerMon!.speciesName);  // EN canonique, PAS nickname FR
          });
        }
        // 1:1 décomp Phase 1.4 N : passage direct au menu action (FIGHT/BAG/
        // POKEMON/RUN) au lieu de ShowFieldMessage + wait input. Le prompt
        // "Que doit faire X?" est now dessiné dans sa propre window à côté du
        // menu et reste visible pendant la sélection.
        state = 'ACTION_MENU_INIT';
        return false;
      }

      case 'PLAYER_TURN_PROMPT_WAIT': {
        // Legacy : conservé pour compat ad-hoc (= si on revient ici depuis
        // un menu fallback). Just skip à ACTION_MENU_INIT.
        state = 'ACTION_MENU_INIT';
        return false;
      }

      // ─── ACTION MENU 1:1 décomp battle_controller_player.c:233 ──────────
      // R3 refactor : state machine inline replaced by Controller IPC dispatch.
      // ACTION_MENU_INIT init windows (= reuse infra battle-flow) puis emit
      // CONTROLLER_CHOOSEACTION (= PlayerHandleChooseAction L1 triggered via R1 tick).
      case 'ACTION_MENU_INIT': {
        if (!playerMon) { state = 'CLEANUP'; return false; }
        actionMenuCursor = 0;  // 1:1 décomp : reset cursor au début de chaque tour.
        initActionMenu();
        state = 'ACTION_EMIT_CHOOSE';
        return false;
      }

      // R3 — Emit CONTROLLER_CHOOSEACTION + MarkBattlerForControllerExec.
      // Le tick R1 (= battle-controller-tick.ts) appellera PlayerHandleChooseAction
      // (= L1) qui setup le rendering via R2 wires (setActionCursor) + install
      // HandleInputChooseAction loop chaque frame jusqu'à A_BUTTON pressé.
      case 'ACTION_EMIT_CHOOSE': {
        if (!playerMon) { state = 'CLEANUP'; return false; }
        // Activer Controller IPC dispatch (= R1 tick va appeler les handlers).
        (globalThis as { __USE_CONTROLLER_DISPATCH__?: boolean }).__USE_CONTROLLER_DISPATCH__ = true;
        // Set active battler = player (= 1:1 décomp gActiveBattler = 0).
        ipcSetActiveBattler(0);
        // R3 FIX : install PlayerBufferRunCommand comme controller func du
        // battler player (= 1:1 décomp SetControllerToPlayer
        // battle_controller_player.c:193-198). Sans ça gBattlerControllerFuncs[0]
        // est null et tick R1 ne peut pas dispatch les handlers.
        ipcSetControllerToPlayer();
        // Setup bufferA[0] = CONTROLLER_CHOOSEACTION (0x12). PlayerBufferRunCommand
        // (= L1 dispatcher) dispatcher to PlayerHandleChooseAction.
        const buf = ipcBufferA[0];
        buf[0] = 0x12; // CONTROLLER_CHOOSEACTION
        buf[1] = 0;    // not double battle
        buf[2] = 0; buf[3] = 0; // itemId (= 0 single battle)
        // Set exec flag bit 0 (= player battler) (= 1:1 décomp MarkBattlerForControllerExec).
        ipcSetExecFlags(ipcExecFlags | ipcBitTable[0]);
        // Clear response buffer.
        for (let i = 0; i < 4; i++) ipcBufferB[0][i] = 0;
        state = 'ACTION_WAIT_CHOOSE_RESPONSE';
        return false;
      }

      // R3 — Wait controller exec done = response disponible dans bufferB.
      // Quand PlayerHandleChooseAction termine via PlayerBufferExecCompleted,
      // gBattleControllerExecFlags bit cleared → on lit la réponse.
      case 'ACTION_WAIT_CHOOSE_RESPONSE': {
        if (ipcExecFlags & ipcBitTable[0]) {
          // Controller encore active (= HandleInputChooseAction loop, attend input).
          return false;
        }
        // Controller done : read response bufferB[0..3] :
        //   bufferB[0] = CONTROLLER_TWORETURNVALUES (0x21)
        //   bufferB[1] = action (B_ACTION_USE_MOVE=0/USE_ITEM=1/SWITCH=2/RUN=3)
        const action = ipcBufferB[0][1];
        // R3 désactiver flag pour les autres states pas encore refactor.
        (globalThis as { __USE_CONTROLLER_DISPATCH__?: boolean }).__USE_CONTROLLER_DISPATCH__ = false;
        closeActionMenu();
        // 1:1 décomp dispatch selon action :
        switch (action) {
          case 0 /* B_ACTION_USE_MOVE */: state = 'MOVE_MENU_INIT';      break;
          case 1 /* B_ACTION_USE_ITEM */: state = 'ACTION_FALLBACK_TEXT'; _lastFallbackKind = 'SAC'; break;
          case 2 /* B_ACTION_SWITCH */:   state = 'ACTION_FALLBACK_TEXT'; _lastFallbackKind = 'POKéMON'; break;
          case 3 /* B_ACTION_RUN */:      state = 'ACTION_RUN_TEXT';      break;
          default:
            // Cas inattendu : retour menu input direct (fallback safety).
            console.warn('[battle-flow R3] unexpected action response:', action);
            state = 'ACTION_MENU_INPUT';
            break;
        }
        return false;
      }

      case 'ACTION_MENU_INPUT': {
        // R3 LEGACY state — désormais non atteint en flow normal (= ACTION_EMIT_
        // CHOOSE + ACTION_WAIT_CHOOSE_RESPONSE remplace). Conservé pour fallback
        // safety + rollback éventuel via __USE_CONTROLLER_DISPATCH__ = false.
        if (!playerMon) { state = 'CLEANUP'; return false; }
        const newKeys = rt.gMain.newKeys;
        if (newKeys & DPAD_LEFT) {
          if (actionMenuCursor & 1) { actionMenuCursor ^= 1; refreshActionMenu(); }
        } else if (newKeys & DPAD_RIGHT) {
          if (!(actionMenuCursor & 1)) { actionMenuCursor ^= 1; refreshActionMenu(); }
        } else if (newKeys & DPAD_UP) {
          if (actionMenuCursor & 2) { actionMenuCursor ^= 2; refreshActionMenu(); }
        } else if (newKeys & DPAD_DOWN) {
          if (!(actionMenuCursor & 2)) { actionMenuCursor ^= 2; refreshActionMenu(); }
        } else if (newKeys & A_BUTTON) {
          closeActionMenu();
          switch (actionMenuCursor) {
            case 0: state = 'MOVE_MENU_INIT';      break;
            case 1: state = 'ACTION_FALLBACK_TEXT'; _lastFallbackKind = 'SAC'; break;
            case 2: state = 'ACTION_FALLBACK_TEXT'; _lastFallbackKind = 'POKéMON'; break;
            case 3: state = 'ACTION_RUN_TEXT';      break;
          }
        }
        return false;
      }

      // ─── ACTION_FALLBACK : SAC / POKéMON pas encore implémentés en combat ──
      case 'ACTION_FALLBACK_TEXT': {
        // Message gracieux qui ramène le user au menu action.
        showBattleMessage(`${_lastFallbackKind} pas encore\ndisponible en combat!`);
        state = 'ACTION_FALLBACK_WAIT';
        return false;
      }

      case 'ACTION_FALLBACK_WAIT': {
        if (messageWaitDone()) {
          HideFieldMessageBox();
          state = 'ACTION_MENU_INIT';  // retour au menu pour re-choisir
        }
        return false;
      }

      // ─── ACTION_RUN : fuite (= 1:1 décomp HandleAction_Run + TryRunFromBattle) ──
      case 'ACTION_RUN_TEXT': {
        // K14b — 1:1 strict décomp battle_main.c:4332-4346 : check trainer
        // battle FIRST (= No running from trainer battles!), puis Birch
        // tutorial via IsRunningFromBattleImpossible.
        // 1:1 décomp ll. 4332-4337 : BATTLE_TYPE_TRAINER && !LINK →
        // BattleScript_PrintCantRunFromTrainer = STRINGID_NORUNNINGFROMTRAINERS.
        if ((gBattleTypeFlags & 0x8 /* BATTLE_TYPE_TRAINER */)
            && !(gBattleTypeFlags & 0x4 /* BATTLE_TYPE_LINK */)) {
          // 1:1 décomp `BattleScript_PrintCantRunFromTrainer` :
          // STRINGID_NORUNNINGFROMTRAINERS via decoder → texte FR officiel.
          showBattleMessage(_resolveBattleString(STRINGID_NORUNNINGFROMTRAINERS));
          state = 'ACTION_RUN_WAIT';
          return false;
        }
        // K4 + K8 — 1:1 strict décomp : check IsRunningFromBattleImpossible
        // d'abord (= block Birch tutorial via BATTLE_TYPE_FIRST_BATTLE +
        // Shadow Tag/Arena Trap/Magnet Pull + status escape prevention).
        // Si SUCCESS → TryRunFromBattle qui fait :
        //   - holdEffect HOLD_EFFECT_CAN_ALWAYS_RUN → always escape (Smoke Ball)
        //   - ability ABILITY_RUN_AWAY → always escape (sauf Pyramid)
        //   - speed comparison + runTries multiplier → random check
        // Pour wild Zigzagoon LV2 vs starter LV5 : speed faster → always escape.
        // Pour Birch tutorial : forbidden → "Don't be a coward!".
        setActiveBattlerForRun(0);  // 1:1 décomp : check actif sur player.
        const runImpossible = _IsRunningFromBattleImpossible();
        if (runImpossible !== 0 /* BATTLE_RUN_SUCCESS */) {
          // Birch tutorial : message FR "Ne sois pas lâche!".
          // STATUS escape : "Impossible de fuir!".
          // Shadow Tag/Arena Trap : "X de Y empêche la fuite!".
          const chooser = _gBattleCommunication()[5 /* MULTISTRING_CHOOSER */] ?? 0;
          // 1:1 décomp `gNoEscapeStringIds[chooser]` (battle_message.c) →
          // [PreventsEscape, CantEscape, DontLeaveBirch, AttackerCantEscape] →
          // via decoder pour texte FR officiel (= pas de hardcode).
          let stringId: number;
          if (chooser === 2 /* B_MSG_DONT_LEAVE_BIRCH */) {
            stringId = STRINGID_DONTLEAVEBIRCH;
          } else if (chooser === 1 /* B_MSG_CANT_ESCAPE */) {
            stringId = STRINGID_CANTESCAPE;
          } else {
            stringId = STRINGID_PREVENTSESCAPE;
          }
          showBattleMessage(_resolveBattleString(stringId));
        } else {
          // Run permitted : roll TryRunFromBattle.
          const tryRunResult = _TryRunFromBattle(0);
          if (tryRunResult) {
            // 1:1 décomp `BattleScript_GotAwaySafely` (battle_scripts_1.s) :
            // STRINGID_GOTAWAYSAFELY = "Vous prenez la fuite !" via decoder.
            showBattleMessage(_resolveBattleString(STRINGID_GOTAWAYSAFELY));
            outcome = BATTLE_OUTCOME_RAN;
          } else {
            // 1:1 décomp : STRINGID_CANTESCAPE via decoder.
            showBattleMessage(_resolveBattleString(STRINGID_CANTESCAPE));
          }
        }
        state = 'ACTION_RUN_WAIT';
        return false;
      }

      case 'ACTION_RUN_WAIT': {
        if (messageWaitDone()) {
          HideFieldMessageBox();
          if (outcome === BATTLE_OUTCOME_RAN || outcome === BATTLE_OUTCOME_MON_FLED) {
            // Player ran ou wild mon fui (= K8 AI_FirstBattle tutorial bypass).
            state = 'CLEANUP_FADE_OUT';
          } else {
            // Run failed (= tutorial bypass + Birch message) → retour menu.
            state = 'ACTION_MENU_INIT';
          }
        }
        return false;
      }

      case 'MOVE_MENU_INIT': {
        moveMenuCursor = 0;
        initMoveMenu();
        // R4 — route vers Controller IPC dispatch au lieu de l'input loop inline.
        state = 'MOVE_EMIT_CHOOSE';
        return false;
      }

      // R4 — Emit CONTROLLER_CHOOSEMOVE + setup ChooseMoveStruct dans
      // bufferA[4..23]. Le tick R1 va appeler PlayerHandleChooseMove (= L2)
      // qui setup le menu via R2 wires + install HandleInputChooseMove loop
      // chaque frame jusqu'à A_BUTTON (= emit moveIdx) ou B_BUTTON (= 0xFFFF cancel).
      case 'MOVE_EMIT_CHOOSE': {
        if (!playerMon) { state = 'CLEANUP'; return false; }
        (globalThis as { __USE_CONTROLLER_DISPATCH__?: boolean }).__USE_CONTROLLER_DISPATCH__ = true;
        ipcSetActiveBattler(0);
        // R4 FIX : re-install PlayerBufferRunCommand (= ACTION_EMIT_CHOOSE l'a
        // fait, mais HandleInputChooseAction install HandleChooseActionAfterDma3
        // + HandleInputChooseAction. Quand le combat passe en MOVE_MENU_INIT,
        // gBattlerControllerFuncs[0] pointe encore vers HandleInputChooseAction
        // qui ne sait pas dispatch CONTROLLER_CHOOSEMOVE → tick noop infini.
        // Reset à PlayerBufferRunCommand pour dispatch correct du opcode 0x14.
        ipcSetControllerToPlayer();
        const buf = ipcBufferA[0];
        buf[0] = 0x14; // CONTROLLER_CHOOSEMOVE
        buf[1] = 0;    // not double battle
        buf[2] = 0;    // showPpDisplay = false (= ChooseMoveStruct[2] = 0)
        buf[3] = 0;    // dontDisplayCurrentMove (= 0)
        // ChooseMoveStruct dans bufferA[4..23] :
        //   moves[4] u16 LE at offset 4..11
        //   currentPp[4] u8 at 12..15
        //   maxPp[4] u8 at 16..19
        //   species u16 at 20..21 (= pas utilisé pour HandleInputChooseMove)
        //   monTypes[2] u8 at 22..23 (= TYPE_GHOST check Curse only)
        for (let i = 0; i < 4; i++) {
          const mv = playerMon.moves[i];
          // R4 FIX : mv.id est string ("tackle"), pas number. Convert via
          // resolveMoveDexId qui retourne le u16 id décomp (MOVE_TACKLE=33).
          // Sans ça tous les moveIds étaient 0 (= MOVE_NONE) → L2 voyait
          // 0 moves disponibles → cursor MOVE_MENU bloqué.
          const moveId = mv ? _resolveMoveDexId(String(mv.id)) : 0;
          buf[4 + i * 2] = moveId & 0xFF;
          buf[5 + i * 2] = (moveId >> 8) & 0xFF;
          buf[12 + i] = mv ? (mv.pp ?? 0) : 0;
          buf[16 + i] = mv ? (mv.ppMax ?? 0) : 0;
        }
        // Species + monTypes (Birch tutorial Mudkip/Treecko/Torchic = pas GHOST).
        buf[20] = (playerMon.speciesId ?? 0) & 0xFF;
        buf[21] = ((playerMon.speciesId ?? 0) >> 8) & 0xFF;
        buf[22] = 0; // TYPE_NORMAL (= placeholder, pas critique sauf Curse)
        buf[23] = 0;
        ipcSetExecFlags(ipcExecFlags | ipcBitTable[0]);
        for (let i = 0; i < 4; i++) ipcBufferB[0][i] = 0;
        state = 'MOVE_WAIT_CHOOSE_RESPONSE';
        return false;
      }

      case 'MOVE_WAIT_CHOOSE_RESPONSE': {
        if (ipcExecFlags & ipcBitTable[0]) return false;
        // Response bufferB[0..3] :
        //   [0] = CONTROLLER_TWORETURNVALUES (0x21)
        //   [1] = B_ACTION_EXEC_SCRIPT (10)
        //   [2..3] = ret16 = moveIdx | (target << 8) ; 0xFFFF = cancel.
        const ret16 = ipcBufferB[0][2] | (ipcBufferB[0][3] << 8);
        (globalThis as { __USE_CONTROLLER_DISPATCH__?: boolean }).__USE_CONTROLLER_DISPATCH__ = false;
        if (ret16 === 0xFFFF) {
          // B_BUTTON cancel → retour ACTION_MENU.
          closeMoveMenu();
          state = 'ACTION_MENU_INIT';
          return false;
        }
        const moveIdx = ret16 & 0xFF;
        chosenMoveIndex = moveIdx;
        closeMoveMenu();
        // 1:1 fix : fermer AUSSI le menu d'action (= scroll BG0 → 0 = MSG). Sinon
        // closeMoveMenu remet le scroll à 160 (= position ACTION) et le menu d'action
        // vide reste visible pendant le HP drain (PLAYER_BYTECODE_MSG attend la fin du
        // drain avant showBattleMessage, qui seul re-scroll à 0) → flash de boîtes vides.
        closeActionMenu();
        HideFieldMessageBox();
        state = 'DETERMINE_TURN_ORDER';
        return false;
      }

      case 'MOVE_MENU_INPUT': {
        if (!playerMon) { state = 'CLEANUP'; return false; }
        const newKeys = rt.gMain.newKeys;
        const numMoves = playerMon.moves.length;
        if (newKeys & DPAD_UP) {
          if (moveMenuCursor > 0) { moveMenuCursor--; drawMoveCursor(); }
        } else if (newKeys & DPAD_DOWN) {
          if (moveMenuCursor < Math.min(3, numMoves - 1)) { moveMenuCursor++; drawMoveCursor(); }
        } else if (newKeys & DPAD_LEFT) {
          if (moveMenuCursor >= 2) { moveMenuCursor -= 2; drawMoveCursor(); }
        } else if (newKeys & DPAD_RIGHT) {
          if (moveMenuCursor < numMoves - 2 && moveMenuCursor < 2) { moveMenuCursor += 2; drawMoveCursor(); }
        } else if (newKeys & A_BUTTON) {
          if (moveMenuCursor < numMoves) {
            chosenMoveIndex = moveMenuCursor;
            closeMoveMenu();
            closeActionMenu();  // 1:1 fix : scroll BG0 → 0 (MSG) ; évite le flash du menu d'action vide pendant le HP drain (cf. MOVE_WAIT_CHOOSE_RESPONSE).
            state = 'DETERMINE_TURN_ORDER';
          }
        }
        // No B-cancel for tutorial (= can't run from Birch tutorial battle).
        return false;
      }

      case 'DETERMINE_TURN_ORDER': {
        if (!playerMon || !opponentMon) { state = 'CLEANUP'; return false; }
        // 1:1 décomp : le move adverse (AI) est choisi MAINTENANT (les 2 moves
        // connus), puis `GetWhoStrikesFirst` décide qui frappe en premier (priorité
        // du move > vitesse × stage/météo/badge, paralysie ÷4, Quick Claw). pickOpponentMove
        // pose aussi `_opponentAiWantsToFlee` (Birch tutorial), géré à OPPONENT_USES_MOVE.
        opponentMoveIndex = pickOpponentMove();
        const playerFirst = ComputeSingleBattleTurnOrder(chosenMoveIndex, opponentMoveIndex);
        _turnOrder = playerFirst ? [0, 1] : [1, 0];
        _turnPhase = 0;
        state = _turnOrder[0] === 0 ? 'PLAYER_USES_MOVE' : 'OPPONENT_USES_MOVE';
        return false;
      }

      case 'ADVANCE_TURN': {
        // 1:1 décomp : après qu'un mover a agi (+ check faint du défenseur passé),
        // passer au mover suivant. Quand les 2 ont joué → end-of-turn `BattleTurnPassed`
        // (battle_main.c:3956 : field/per-battler effects, poison/burn tick, reset vars).
        // Mode bytecode → END_TURN_PROCESS (wrapper full) ; legacy → PLAYER_TURN_PROMPT.
        _turnPhase++;
        if (_turnPhase >= 2) {
          turnCount++;
          state = isBytecodeDamageEnabled() ? 'END_TURN_PROCESS' : 'PLAYER_TURN_PROMPT';
        } else {
          const nextMover = _turnOrder[_turnPhase];
          state = nextMover === 0 ? 'PLAYER_USES_MOVE' : 'OPPONENT_USES_MOVE';
        }
        return false;
      }

      case 'PLAYER_USES_MOVE': {
        if (!playerMon) { state = 'CLEANUP'; return false; }
        // Phase 1.4 J : si bytecode mode, applyMoveDamage immédiat → fills
        // queue + apply damage + shake → drain queue séquentiellement via
        // PLAYER_BYTECODE_MSG state. Sinon : hardcoded ShowFieldMessage legacy.
        // 1:1 fix : gating aligné sur isBytecodeDamageEnabled() (bytecode = moteur
        // PAR DÉFAUT, cf. applyMoveDamage). Avant, ce check inline défaut-FALSE
        // divergeait du check damage défaut-TRUE → les vrais messages bytecode
        // (textes + effets, 1:1 décodés des PRINTSTRING) étaient calculés puis JETÉS
        // au profit des messages legacy hardcodés. Aligné → affiche le 1:1 décomp.
        const useBytecodeMsgs = isBytecodeDamageEnabled();
        if (useBytecodeMsgs && opponentMon) {
          _pendingBytecodeMessages = [];
          const oppOldHp = opponentMon.currentHp;
          applyMoveDamage(playerMon, opponentMon, chosenMoveIndex);
          // 1:1 décomp ordre `BattleScript_EffectHit` : `attackstring` ("X utilise
          // MOVE!") AVANT `attackanimation`/`healthbarupdate` (drain). On affiche donc
          // le 1er message (USEDMOVE) AVANT de démarrer le drain → la boîte message
          // montre "X utilise MOVE!" PENDANT le drain au lieu d'être VIDE (le drain dure
          // plusieurs frames ; sans ça PLAYER_BYTECODE_MSG gate isHpDraining avant tout
          // message → boîte vide visible, bug user 2026-05-30).
          if (_pendingBytecodeMessages.length > 0) {
            showBattleMessage(_pendingBytecodeMessages.shift()!);
          }
          // 1:1 décomp `Cmd_healthbarupdate` : drain gradué oldHp→newHp. startHpDrain
          // AVANT renderHpWindows pour que renderHpWindows skip le blit barre (anti-saut).
          startHpDrain(1, opponentHealthbox, opponentMon.maxHp, oppOldHp, opponentMon.currentHp);
          renderHpWindows();
          // 1:1 décomp : sprite shake piloté par CONTROLLER_HITANIMATION event
          // émis par le bytecode (= move hit avec damage applied), pas par check
          // `damage > 0` hardcoded (= manque les status moves qui shake aussi).
          if (_bytecodeWantsHitAnim() && opponentSpriteId >= 0) {
            startHitAnim(opponentSpriteId, opponentHealthbox);
          }
          // 1er message affiché → _WAIT attend (fin du drain + A). Les messages suivants
          // (efficacité/effets) sont drainés ensuite par PLAYER_BYTECODE_MSG.
          state = 'PLAYER_BYTECODE_MSG_WAIT';
          return false;
        }
        // Legacy path : message hardcoded puis damage state.
        const mv = playerMon.moves[chosenMoveIndex];
        const moveName = mv?.nameFr.toUpperCase() ?? '?';
        showBattleMessage(`${playerMon.nickname} utilise\n${moveName}!`);
        state = 'PLAYER_USES_MOVE_WAIT';
        return false;
      }

      case 'PLAYER_USES_MOVE_WAIT': {
        if (messageWaitDone()) {
          HideFieldMessageBox();
          state = 'PLAYER_DAMAGE_OPP';
        }
        return false;
      }

      // Phase 1.4 J : drain bytecode messages séquentiellement. Chaque iteration
      // pop le next msg, ShowFieldMessage + wait input, loop until empty puis
      // CHECK_OPP_FAINTED. Préserve l'ordre 1:1 émis par le bytecode (= USEDMOVE
      // → effectiveness → status applied → etc.).
      case 'PLAYER_BYTECODE_MSG': {
        // 1:1 décomp `waitforhealthbar` : attendre la fin du drain barre AVANT
        // d'afficher le 1er message (efficacité) ou de checker le faint.
        if (isHpDraining()) return false;
        if (_pendingBytecodeMessages.length === 0) {
          state = 'CHECK_OPP_FAINTED';
          return false;
        }
        const msg = _pendingBytecodeMessages.shift()!;
        showBattleMessage(msg);
        state = 'PLAYER_BYTECODE_MSG_WAIT';
        return false;
      }

      case 'PLAYER_BYTECODE_MSG_WAIT': {
        // 1:1 `waitforhealthbar` : ne PAS dismisser le message ("X utilise MOVE!")
        // tant que le drain HP n'est pas fini → le message reste affiché PENDANT le
        // drain (au lieu d'une boîte vide), l'efficacité/effet suit après.
        if (isHpDraining()) return false;
        if (messageWaitDone()) {
          HideFieldMessageBox();
          state = 'PLAYER_BYTECODE_MSG';
        }
        return false;
      }

      case 'PLAYER_DAMAGE_OPP': {
        if (!playerMon || !opponentMon) { state = 'CLEANUP'; return false; }
        const oppOldHp = opponentMon.currentHp;
        const { damage, typeMul } = applyMoveDamage(playerMon, opponentMon, chosenMoveIndex);
        // 1:1 décomp `Cmd_healthbarupdate` : drain gradué (gaté par CHECK_OPP_FAINTED
        // + _WAIT = waitforhealthbar). startHpDrain AVANT renderHpWindows (anti-saut).
        startHpDrain(1, opponentHealthbox, opponentMon.maxHp, oppOldHp, opponentMon.currentHp);
        renderHpWindows();
        if (damage > 0) {
          // Hit blink (legacy path) : 1:1 DoHitAnimBlinkSpriteEffect. NON gaté par
          // l'option scene-off — le scintillement est gardé même anims OFF (user).
          if (opponentSpriteId >= 0) startHitAnim(opponentSpriteId, opponentHealthbox);
        }
        if (damage > 0) {
          // Iter19 : type effectiveness messages.
          if (typeMul === 0) {
            // 1:1 décomp STRINGID_ITDOESNTAFFECT (= "Ça n'a aucun effet !")
            // via decoder. Note : décomp utilise placeholder pour target nick
            // mais le decoder gère le pattern via gBattleTextBuff (= dette R3
            // pour le full wire ; pour now decoder text seul).
            showBattleMessage(_resolveBattleString(STRINGID_ITDOESNTAFFECT));
            state = 'PLAYER_DAMAGE_OPP_WAIT';
          } else if (typeMul >= 2) {
            // 1:1 décomp STRINGID_SUPEREFFECTIVE = "C'est super efficace !"
            showBattleMessage(_resolveBattleString(STRINGID_SUPEREFFECTIVE));
            state = 'PLAYER_DAMAGE_OPP_WAIT';
          } else if (typeMul > 0 && typeMul < 1) {
            // 1:1 décomp STRINGID_NOTVERYEFFECTIVE = "Ce n'est pas très efficace…"
            showBattleMessage(_resolveBattleString(STRINGID_NOTVERYEFFECTIVE));
            state = 'PLAYER_DAMAGE_OPP_WAIT';
          } else {
            // Neutral 1× damage — straight to fainted check.
            state = 'CHECK_OPP_FAINTED';
          }
        } else {
          // Status move (= Growl). Just acknowledge.
          showBattleMessage(`${opponentMon.nickname}\nest affaibli!`);
          state = 'PLAYER_DAMAGE_OPP_WAIT';
        }
        return false;
      }

      case 'PLAYER_DAMAGE_OPP_WAIT': {
        if (isHpDraining()) return false;  // 1:1 waitforhealthbar : barre vidée avant d'avancer
        if (messageWaitDone()) {
          HideFieldMessageBox();
          state = 'CHECK_OPP_FAINTED';
        }
        return false;
      }

      case 'CHECK_OPP_FAINTED': {
        // 1:1 décomp `waitforhealthbar` : la barre doit FINIR de se vider avant le
        // check faint (= sinon l'anim de faint démarre avec une barre encore pleine).
        if (isHpDraining()) return false;
        if (!opponentMon) { state = 'CLEANUP'; return false; }
        if (opponentMon.currentHp <= 0) {
          state = 'OPP_FAINTED_TEXT';
        } else {
          // 1:1 décomp : l'adversaire survit → c'est au mover SUIVANT de jouer
          // (ADVANCE_TURN décide selon l'ordre calculé, plus de joueur-toujours-1er).
          state = 'ADVANCE_TURN';
        }
        return false;
      }

      case 'OPP_FAINTED_TEXT': {
        if (!opponentMon) { state = 'CLEANUP'; return false; }
        showBattleMessage(`Le ${opponentMon.nickname} sauvage\nest K.O.!`);
        outcome = BATTLE_OUTCOME_WIN;
        state = 'OPP_FAINTED_WAIT';
        // 1:1 décomp `PlayerHandleFaintAnimation` (battle_controller_player.c:2408) :
        // au lieu de hide direct, lance SpriteCB_FaintOpponentMon → AnimFaintOpponent
        // qui fait descendre le sprite progressivement + le clear visuellement.
        if (opponentSpriteId >= 0) {
          startFaintAnim(opponentSpriteId, true /* isOpponent */);
        }
        // 1:1 décomp `battle_main.c:HandleEndTurn_BattleWon` (= wild) :
        // BattleStopLowHpSound + PlayBGM(MUS_VICTORY_WILD). User feedback :
        // "faudra mettre la musique de victoire avant le cut vers l'OW".
        // MUS_VICTORY_WILD = 353 (= 1:1 songs-data.ts). Trainer battle = 412
        // (MUS_VICTORY_TRAINER) → routera quand trainer-battle-flow porté.
        void import('../system/decomp-globals').then(({ m4aSongNumStart }) => {
          m4aSongNumStart(353 /* MUS_VICTORY_WILD */, true);
        });
        return false;
      }

      case 'OPP_FAINTED_WAIT': {
        if (messageWaitDone()) {
          HideFieldMessageBox();
          // Session 124 Bug 5 : EXP gain post-K.O. (= 1:1 décomp Gen 3 formula).
          state = 'EXP_AWARD_TEXT';
        }
        return false;
      }

      case 'EXP_AWARD_TEXT': {
        if (!opponentMon || !playerMon) { state = 'CLEANUP'; return false; }
        // 1:1 décomp Cmd_getexp case 1-2 : calc exp (= baseExp × defeatedLevel / 7)
        // + message STRINGID_PKMNGAINEDEXP.
        const gained = calculateExpGain(opponentMon.speciesEnum, opponentMon.level);
        showBattleMessage(`${playerMon.nickname} gagne\n${gained} POINTS D'EXP.!`);
        // 1:1 décomp case 3 : la barre EXP s'anime (EmitExpUpdate) pendant que le
        // message s'affiche. On distribue l'exp par CHUNK (jusqu'au seuil de niveau) ;
        // applyExpAward applique l'exp + le level-up à la fin de chaque chunk (cf.
        // EXP_BAR_FILL_WAIT). N'applique PLUS instantanément (= anti-saut de barre).
        _expToGive = gained;
        if (beginExpChunk()) {
          state = 'EXP_BAR_FILL_WAIT';
        } else {
          // MAX_LEVEL / rien à animer : apply instant + wait final.
          applyExpAward(playerMon, _expToGive);
          _expToGive = 0;
          renderHpWindows();
          state = 'EXP_AWARD_WAIT';
        }
        return false;
      }

      case 'EXP_BAR_FILL_WAIT': {
        // 1:1 `waitforexpbar` : attendre la fin de l'anim de remplissage du chunk
        // avant d'appliquer l'exp + checker le level-up.
        if (isExpFilling()) return false;
        if (!playerMon) { state = 'CLEANUP'; return false; }
        // Chunk animé fini → applique l'exp (+ level-up éventuel via applyExpAward).
        const r = applyExpAward(playerMon, _expFillPending);
        _expToGive -= _expFillPending;
        _expFillPending = 0;
        if (r.leveledUp) {
          // 1:1 décomp case 4 : level-up → message BattleScript_LevelUp + refresh HP
          // window (nouveau maxHp + level). La barre EXP reset à 0% du nouveau niveau,
          // re-remplie par le prochain chunk (LEVEL_UP_WAIT → beginExpChunk).
          renderHpWindows();
          state = 'LEVEL_UP_TEXT';
        } else {
          // Plus de level-up : chunk final consommé → wait A (sur le message "gagne EXP").
          state = 'EXP_AWARD_WAIT';
        }
        return false;
      }

      case 'EXP_AWARD_WAIT': {
        if (messageWaitDone()) {
          HideFieldMessageBox();
          // Bug 5e session 124 : fade-out avant cleanup.
          state = 'CLEANUP_FADE_OUT';
        }
        return false;
      }

      case 'LEVEL_UP_TEXT': {
        if (!playerMon) { state = 'CLEANUP'; return false; }
        // 1:1 décomp `BattleScript_LevelUp` (battle_scripts_1 ll. 3144) : `fanfare
        // MUS_LEVEL_UP` joue le jingle de montée de niveau AVANT le message. Slot
        // 'fanfare' dédié → ne coupe pas le BGM de victoire (MUS_VICTORY_WILD).
        void import('../system/decomp-globals').then(({ PlayFanfare }) => {
          PlayFanfare(367 /* MUS_LEVEL_UP */);
        });
        showBattleMessage(`${playerMon.nickname} monte au\nniveau ${playerMon.level}!`);
        state = 'LEVEL_UP_WAIT';
        return false;
      }

      case 'LEVEL_UP_WAIT': {
        if (messageWaitDone()) {
          HideFieldMessageBox();
          // 1:1 décomp : après "monte au niveau N", apprentissage des moves du nouveau
          // niveau (Cmd_handlelearnnewmove). LEARN_MOVE_CHECK gère la file PUIS la
          // continuation (exp restante / fin). playerMon.level = nouveau niveau ici.
          _movesToLearn = playerMon ? getLevelUpMovesAtLevel(playerMon.speciesEnum, playerMon.level) : [];
          state = 'LEARN_MOVE_CHECK';
        }
        return false;
      }

      case 'LEARN_MOVE_CHECK': {
        if (!playerMon) { state = 'CLEANUP'; return false; }
        // 1:1 décomp Cmd_handlelearnnewmove : traite chaque move appris. Skip ceux déjà
        // connus ; si <4 capacités → apprend (message) ; si 4 → message (le choix MANUEL
        // d'oublier une capacité = polish UI à venir, on garde les 4 actuelles pour l'instant).
        while (_movesToLearn.length > 0) {
          const moveEnum = _movesToLearn.shift()!;
          const slot = makeMoveSlot(moveEnum);
          if (playerMon.moves.some(m => m.id === slot.id)) continue;   // déjà connu
          if (playerMon.moves.length < 4) {
            playerMon.moves.push(slot);
            showBattleMessage(`${playerMon.nickname} apprend\n${slot.nameFr.toUpperCase()}!`);
          } else {
            showBattleMessage(`${playerMon.nickname} veut apprendre\n${slot.nameFr.toUpperCase()}, mais connaît\ndéjà 4 capacités!`);
          }
          state = 'LEARN_MOVE_MSG_WAIT';
          return false;
        }
        // File vide → continuation 1:1 case 5 (exp restante → fill, sinon fin).
        if (_expToGive > 0 && beginExpChunk()) {
          state = 'EXP_BAR_FILL_WAIT';
        } else {
          state = 'CLEANUP_FADE_OUT';
        }
        return false;
      }

      case 'LEARN_MOVE_MSG_WAIT': {
        if (messageWaitDone()) {
          HideFieldMessageBox();
          state = 'LEARN_MOVE_CHECK';
        }
        return false;
      }

      case 'OPPONENT_USES_MOVE': {
        if (!opponentMon || !playerMon) { state = 'CLEANUP'; return false; }
        // Move adverse déjà choisi à DETERMINE_TURN_ORDER (pour l'ordre du tour).
        const oppMoveIdx = opponentMoveIndex;
        // K8 + Birch tutorial : si l'AI a décidé de fuir (= AI_FirstBattle :
        // PV de NOTRE mon = AI_TARGET ≤ 20% → flee), wild mon fuit au lieu
        // d'attaquer → empêche la défaite du joueur.
        // 1:1 décomp HandleEndTurn_MonFled : message FR "Le X sauvage a fui !" +
        // outcome = B_OUTCOME_MON_FLED.
        if (_opponentAiWantsToFlee) {
          const monName = opponentMon.nickname.toUpperCase();
          showBattleMessage(`Le ${monName} sauvage a fui !`);
          outcome = 6 /* BATTLE_OUTCOME_MON_FLED */;
          state = 'ACTION_RUN_WAIT';  // reuse pour fade-out
          return false;
        }
        // Phase 1.4 J : bytecode mode → applyMoveDamage immédiat + drain via
        // OPPONENT_BYTECODE_MSG. Sinon : legacy hardcoded.
        // 1:1 fix : gating aligné sur isBytecodeDamageEnabled() (bytecode = moteur
        // PAR DÉFAUT, cf. applyMoveDamage). Avant, ce check inline défaut-FALSE
        // divergeait du check damage défaut-TRUE → les vrais messages bytecode
        // (textes + effets, 1:1 décodés des PRINTSTRING) étaient calculés puis JETÉS
        // au profit des messages legacy hardcodés. Aligné → affiche le 1:1 décomp.
        const useBytecodeMsgs = isBytecodeDamageEnabled();
        if (useBytecodeMsgs) {
          _pendingBytecodeMessages = [];
          const plOldHp = playerMon.currentHp;
          applyMoveDamage(opponentMon, playerMon, oppMoveIdx);
          // 1:1 décomp ordre BattleScript : `attackstring` ("L'ennemi X utilise MOVE!")
          // AVANT `healthbarupdate` (drain). Afficher le 1er message AVANT startHpDrain
          // → boîte message non-vide pendant le drain (cf. PLAYER_USES_MOVE, bug user
          // 2026-05-30).
          if (_pendingBytecodeMessages.length > 0) {
            showBattleMessage(_pendingBytecodeMessages.shift()!);
          }
          // 1:1 `Cmd_healthbarupdate` : drain gradué player.
          startHpDrain(0, playerHealthbox, playerMon.maxHp, plOldHp, playerMon.currentHp);
          renderHpWindows();
          // 1:1 décomp : sprite shake piloté par CONTROLLER_HITANIMATION event
          // émis par le bytecode au lieu de hardcoded `damage > 0`.
          if (_bytecodeWantsHitAnim() && playerSpriteId >= 0) {
            startHitAnim(playerSpriteId, playerHealthbox);
          }
          // (Plus de clobber de chosenMoveIndex : c'est le move du JOUEUR. Le move
          // adverse est dans opponentMoveIndex, utilisé par OPPONENT_DAMAGE_PLAYER.)
          state = 'OPPONENT_BYTECODE_MSG_WAIT';
          return false;
        }
        const mv = opponentMon.moves[oppMoveIdx];
        const moveName = mv?.nameFr.toUpperCase() ?? '?';
        showBattleMessage(`Le ${opponentMon.nickname} sauvage\nutilise ${moveName}!`);
        state = 'OPPONENT_USES_MOVE_WAIT';
        return false;
      }

      case 'OPPONENT_BYTECODE_MSG': {
        if (isHpDraining()) return false;  // 1:1 waitforhealthbar
        if (_pendingBytecodeMessages.length === 0) {
          state = 'CHECK_PLAYER_FAINTED';
          return false;
        }
        const msg = _pendingBytecodeMessages.shift()!;
        showBattleMessage(msg);
        state = 'OPPONENT_BYTECODE_MSG_WAIT';
        return false;
      }

      case 'OPPONENT_BYTECODE_MSG_WAIT': {
        // 1:1 `waitforhealthbar` : garder le message ("L'ennemi X utilise MOVE!")
        // affiché tant que le drain HP player n'est pas fini (au lieu d'une boîte vide).
        if (isHpDraining()) return false;
        if (messageWaitDone()) {
          HideFieldMessageBox();
          state = 'OPPONENT_BYTECODE_MSG';
        }
        return false;
      }

      case 'OPPONENT_USES_MOVE_WAIT': {
        if (messageWaitDone()) {
          HideFieldMessageBox();
          state = 'OPPONENT_DAMAGE_PLAYER';
        }
        return false;
      }

      case 'OPPONENT_DAMAGE_PLAYER': {
        if (!opponentMon || !playerMon) { state = 'CLEANUP'; return false; }
        const plOldHp = playerMon.currentHp;
        const { damage, typeMul } = applyMoveDamage(opponentMon, playerMon, opponentMoveIndex);
        // 1:1 `Cmd_healthbarupdate` : drain gradué player (gaté _WAIT + CHECK_PLAYER_FAINTED).
        startHpDrain(0, playerHealthbox, playerMon.maxHp, plOldHp, playerMon.currentHp);
        renderHpWindows();
        if (damage > 0) {
          // Hit blink (legacy path) : 1:1 DoHitAnimBlinkSpriteEffect. NON gaté par
          // l'option scene-off (scintillement gardé même anims OFF, user).
          if (playerSpriteId >= 0) startHitAnim(playerSpriteId, playerHealthbox);
        }
        if (damage > 0) {
          // Iter19 : type effectiveness messages (= same as player turn).
          if (typeMul === 0) {
            // 1:1 décomp STRINGID_ITDOESNTAFFECT via decoder.
            showBattleMessage(_resolveBattleString(STRINGID_ITDOESNTAFFECT));
            state = 'OPPONENT_DAMAGE_PLAYER_WAIT';
          } else if (typeMul >= 2) {
            showBattleMessage(_resolveBattleString(STRINGID_SUPEREFFECTIVE));
            state = 'OPPONENT_DAMAGE_PLAYER_WAIT';
          } else if (typeMul > 0 && typeMul < 1) {
            showBattleMessage(_resolveBattleString(STRINGID_NOTVERYEFFECTIVE));
            state = 'OPPONENT_DAMAGE_PLAYER_WAIT';
          } else {
            state = 'CHECK_PLAYER_FAINTED';
          }
        } else {
          state = 'CHECK_PLAYER_FAINTED';
        }
        return false;
      }

      case 'OPPONENT_DAMAGE_PLAYER_WAIT': {
        if (isHpDraining()) return false;  // 1:1 waitforhealthbar
        if (messageWaitDone()) {
          HideFieldMessageBox();
          state = 'CHECK_PLAYER_FAINTED';
        }
        return false;
      }

      case 'CHECK_PLAYER_FAINTED': {
        if (isHpDraining()) return false;  // 1:1 waitforhealthbar : barre vidée avant faint
        if (!playerMon) { state = 'CLEANUP'; return false; }
        if (playerMon.currentHp <= 0) {
          state = 'PLAYER_FAINTED_TEXT';
        } else {
          // 1:1 décomp : le joueur survit → on passe au mover SUIVANT (ADVANCE_TURN
          // décide selon l'ordre du tour ; end-of-turn quand les 2 ont joué).
          state = 'ADVANCE_TURN';
        }
        return false;
      }

      case 'PLAYER_FAINTED_TEXT': {
        if (!playerMon) { state = 'CLEANUP'; return false; }
        showBattleMessage(`${playerMon.nickname} est K.O.!`);
        // #10 1:1 décomp : si la party a un AUTRE mon valide → switch forcé (le combat
        // continue, pas de défaite). Sinon → défaite (whiteout). Le choix MANUEL via
        // l'écran party (Cmd_openpartyscreen PARTY_ACTION_SEND_OUT) = couche suivante ;
        // ici on prend le 1er mon valide suivant (switch-in fonctionnel + re-spawn 1:1).
        const _party = gSaveBlock1Ptr.playerParty;
        _pendingSwitchSlot = _party.findIndex(
          (m: PokemonInstance | null, i: number) => i !== _activePlayerSlot && !!m && m.currentHp > 0,
        );
        if (_pendingSwitchSlot < 0) {
          outcome = BATTLE_OUTCOME_LOST;   // plus aucun mon valide → défaite
        }
        state = 'PLAYER_FAINTED_WAIT';
        // 1:1 décomp `PlayerHandleFaintAnimation` (battle_controller_player.c:2408) :
        // sprite descend (y2 += 5/frame) hors écran avec SpriteCB_FaintSlideAnim.
        if (playerSpriteId >= 0) {
          startFaintAnim(playerSpriteId, false /* isOpponent=false → player */);
        }
        return false;
      }

      case 'PLAYER_FAINTED_WAIT': {
        if (messageWaitDone()) {
          HideFieldMessageBox();
          if (_pendingSwitchSlot >= 0) {
            // #10 : il reste un mon valide → switch-in (charge le sprite du nouveau).
            _switchLoadStarted = false;
            _switchLoadDone = false;
            _switchLoadFailed = false;
            state = 'PLAYER_SWITCH_LOAD';
          } else {
            // Plus aucun mon → défaite (fade-out avant cleanup propre).
            state = 'CLEANUP_FADE_OUT';
          }
        }
        return false;
      }

      case 'PLAYER_SWITCH_LOAD': {
        // Charge le back sprite + palette du nouveau mon (async). FreeSpritePaletteByTag
        // AVANT le load : LoadSpritePalette renvoie le slot existant sans recharger les
        // data si le tag existe → le nouveau mon prendrait la palette de l'ancien.
        if (!_switchLoadStarted) {
          _switchLoadStarted = true;
          const newMon = gSaveBlock1Ptr.playerParty[_pendingSwitchSlot];
          if (!newMon) { _switchLoadFailed = true; return false; }
          (async () => {
            try {
              const dexId = newMon.speciesEnum.replace('SPECIES_', '').toLowerCase();
              const url = `/decomp/em/pokemon/${dexId}/back.png`;
              const loaded = await rt.LoadCompressedSpriteSheet(url, PLAYER_SPRITE_BYTE_OFFSET);
              FreeSpritePaletteByTag(TAG_BATTLE_PLAYER_PAL);
              _battlePlayerPalSlot = LoadSpritePalette({ data: loaded.palette, tag: TAG_BATTLE_PLAYER_PAL });
              _switchLoadDone = true;
            } catch (e) {
              console.error('[battle-flow] switch sprite load failed', e);
              _switchLoadFailed = true;
            }
          })();
        }
        if (_switchLoadFailed) { outcome = BATTLE_OUTCOME_LOST; state = 'CLEANUP_FADE_OUT'; return false; }
        if (_switchLoadDone) state = 'PLAYER_SWITCH_SPAWN';
        return false;
      }

      case 'PLAYER_SWITCH_SPAWN': {
        const newSlot = _pendingSwitchSlot;
        const newMon = gSaveBlock1Ptr.playerParty[newSlot];
        if (!newMon) { state = 'CLEANUP'; return false; }
        // 1:1 switch : le nouveau mon devient l'actif.
        _activePlayerSlot = newSlot;
        playerMon = newMon;
        _pendingSwitchSlot = -1;
        // Re-fill gBattleMons[0] (player) depuis le nouveau slot battle-side.
        fillBattleMonFromParty(0, 'player', newSlot);
        // Détruire l'ancien sprite (mon K.O.) + créer celui du nouveau mon (back sprite
        // fraîchement chargé à PLAYER_SPRITE_BYTE_OFFSET).
        if (playerSpriteId >= 0) { rt.DestroySprite(playerSpriteId); playerSpriteId = -1; }
        const playerCenterY = _getBattlerSpriteFinalY(newMon.speciesEnum, true);
        const p = rt.CreateSpriteAtOam({
          tileId: PLAYER_SPRITE_BYTE_OFFSET / 32,
          paletteBank: _battlePlayerPalSlot,
          x: SBATTLER_COORD_X_PLAYER, y: playerCenterY,
          shape: POKEMON_SPRITE_SHAPE, size: POKEMON_SPRITE_SIZE,
          priority: 2,
        });
        playerSpriteId = p.spriteId;
        // Update healthbox content (surnom/genre + HP/level/exp) pour le nouveau mon.
        if (playerHealthbox) {
          updateHealthboxNick(playerHealthbox, newMon.nickname, (newMon as { monGender?: number }).monGender ?? 255);
        }
        renderHpWindows();
        // 1:1 STRINGID_GOPKMN : "En avant, {NAME}!" (envoi du mon).
        showBattleMessage(`En avant,\n${newMon.nickname.toUpperCase()}!`);
        state = 'PLAYER_SWITCH_WAIT';
        return false;
      }

      case 'PLAYER_SWITCH_WAIT': {
        if (messageWaitDone()) {
          HideFieldMessageBox();
          // Le switch a consommé le tour → tour suivant (sélection d'action).
          state = 'PLAYER_TURN_PROMPT';
        }
        return false;
      }

      // 1:1 décomp `BattleTurnPassed()` (battle_main.c:3956-4019) wirage :
      // exécute le full wrapper 16-step (= TurnValuesCleanUp + DoFieldEndTurnEffects
      // + DoBattlerEndTurnEffects + HandleWishPerishSongOnTurnEnd + reset HITMARKERs
      // + Palace/Arena specials). Capture les messages FR issus des PRINTSTRING
      // events bytecode pour les afficher séquentiellement (= 1:1 BufferStringBattle).
      // Si battleEnded === true (= outcome != 0 pendant end-turn), on cleanup direct.
      case 'END_TURN_PROCESS': {
        const result = runBattleTurnPassedViaBytecode();
        if (result.ok && result.messages && result.messages.length > 0) {
          _pendingBytecodeMessages = [..._pendingBytecodeMessages, ...result.messages];
        }
        // Run HandleFaintedMonActions pour propager Intimidate/Trace/Forecast/etc.
        // post end-turn (= 1:1 décomp battle_util.c:1877-1954). Skip si battleEnded.
        if (result.ok && !result.battleEnded) {
          const fr = runHandleFaintedMonActionsViaBytecode();
          if (fr.ok && fr.messages && fr.messages.length > 0) {
            _pendingBytecodeMessages = [..._pendingBytecodeMessages, ...fr.messages];
          }
        }
        // Sync HP/status post-end-turn (= POISON tick a modifié gBattleMons[i].hp).
        if (playerMon && opponentMon) {
          syncBattleMonsHpToInstances(playerMon, opponentMon);
          renderHpWindows();
        }
        // Re-check faint après end-turn (= POISON peut KO).
        if (playerMon && playerMon.currentHp <= 0) {
          state = 'PLAYER_FAINTED_TEXT';
          return false;
        }
        if (opponentMon && opponentMon.currentHp <= 0) {
          state = 'OPP_FAINTED_TEXT';
          return false;
        }
        if (result.battleEnded) {
          state = 'CLEANUP_FADE_OUT';
          return false;
        }
        state = 'END_TURN_MSG';
        return false;
      }

      case 'END_TURN_MSG': {
        if (_pendingBytecodeMessages.length === 0) {
          state = 'PLAYER_TURN_PROMPT';
          return false;
        }
        const msg = _pendingBytecodeMessages.shift()!;
        showBattleMessage(msg);
        state = 'END_TURN_MSG_WAIT';
        return false;
      }

      case 'END_TURN_MSG_WAIT': {
        if (messageWaitDone()) {
          HideFieldMessageBox();
          state = 'END_TURN_MSG';
        }
        return false;
      }

      case 'CLEANUP_FADE_OUT': {
        // Bug 5e session 124 : fade-out battle screen avant cleanup proper.
        // Évite le "snap" visuel violent quand on retourne overworld.
        rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 0, 16, 'RGB_BLACK');
        state = 'CLEANUP_FADE_WAIT';
        return false;
      }

      case 'CLEANUP_FADE_WAIT': {
        if (!rt.gPaletteFade.active) {
          state = 'CLEANUP';
        }
        return false;
      }

      case 'CLEANUP': {
        // R3 cleanup : désactiver Controller IPC dispatch flag pour éviter
        // que le tick R1 re-call les handlers Controller en sortie de combat.
        (globalThis as { __USE_CONTROLLER_DISPATCH__?: boolean }).__USE_CONTROLLER_DISPATCH__ = false;
        // R3 cleanup : reset gBattlerControllerFuncs[*] à null (= 1:1 décomp
        // FreeBattleResources qui clear les controller funcs).
        const playerExpose = (globalThis as { __battleControllerPlayer?: { sPlayerBufferCommands?: unknown[] } }).__battleControllerPlayer;
        if (playerExpose) {
          // Note : on ne reset pas sPlayerBufferCommands (= dispatch table reste
          // valid), juste gBattlerControllerFuncs (= via SetControllerToPlayer
          // l'install à PlayerBufferRunCommand au prochain combat).
        }
        // 1:1 décomp `PlayMapChosenOrBattleBGM(0)` (sound.c) : stop battle BGM
        // + restart map BGM. Sans ça → mus_vs_wild continue post-combat.
        void import('../m4a/player').then(({ stopSong }) => stopSong('bgm'));
        void import('../field/map-loader').then(({ gMapHeader: mh }) => {
          if (!mh?.music) return;
          // Lookup string → song id via SONG_ID_TO_NAME reverse map.
          return Promise.all([
            import('../decomp-data/src/song-table'),
            import('../system/decomp-globals'),
          ]).then(([{ SONG_ID_TO_NAME }, { m4aSongNumStart }]) => {
            const target = mh.music.toLowerCase();
            for (const [idStr, name] of Object.entries(SONG_ID_TO_NAME)) {
              if (name === target) {
                m4aSongNumStart(Number(idStr), true);
                break;
              }
            }
          });
        }).catch(e => console.warn('[battle-flow cleanup BGM] failed:', e));
        // Cleanup transition state si reste actif (= safety si state machine
        // bypass TRANSITION_SLICE).
        stopBattleTransition();
        // 1:1 décomp : reset WIN0 (= la fente d'intro) avant retour overworld.
        // Sinon la fente WIN0V resterait active → overworld masqué/clippé.
        resetBattleIntroWindow();
        // E1c : réactiver le scroll caméra overworld (suspendu au battle INIT).
        // Équivalent du retour de CB2_InitBattle → CB2_ReturnToField décomp.
        void import('../field/field-camera').then(({ setFieldCameraSuspended }) => {
          setFieldCameraSuspended(false);
        });
        // Réactiver UpdateObjectEvents (suspendu au battle INIT). DOIT être (false)
        // AVANT _restoreOverworldFromMenu (= re-init field + UpdateObjectEvents),
        // sinon le restore early-return → champ pas re-rendu.
        void import('../field/object-events').then(({ setObjectEventsSuspended }) => {
          setObjectEventsSuspended(false);
        });
        // Relance l'anim EAU du tileset overworld (= retour overworld).
        resumeTilesetAnimations();
        // Destroy sprites.
        if (playerSpriteId >= 0) rt.DestroySprite(playerSpriteId);
        if (opponentSpriteId >= 0) rt.DestroySprite(opponentSpriteId);
        playerSpriteId = -1;
        opponentSpriteId = -1;
        // Cleanup HP windows.
        if (oppHpWindowId >= 0) {
          ClearStdWindowAndFrame(oppHpWindowId, true);
          RemoveWindow(oppHpWindowId);
          oppHpWindowId = -1;
        }
        if (playerHpWindowId >= 0) {
          ClearStdWindowAndFrame(playerHpWindowId, true);
          RemoveWindow(playerHpWindowId);
          playerHpWindowId = -1;
        }
        // Phase 1.4 N Q3 D1 : destroy healthbox sprites OAM (= 1:1 décomp
        // `DestoryHealthboxSprite` battle_interface.c:1044-1049).
        if (opponentHealthbox) {
          destroyHealthboxSprite(opponentHealthbox);
          opponentHealthbox = null;
        }
        if (playerHealthbox) {
          destroyHealthboxSprite(playerHealthbox);
          playerHealthbox = null;
        }
        closeMoveMenu();
        closeActionMenu();  // Phase 1.4 N : cleanup action menu windows si encore actives
        // NB : plus de stash-restore des sprites OW. Ils ont été DÉTRUITS au battle
        // entry (LOAD_ASSETS, 1:1 ResetSpriteData) et sont RE-SPAWNÉS ci-dessous par
        // `_restoreOverworldFromMenu` (= loadAndInitMap returnToField → InitPlayerAvatar
        // + SpawnObjectEventsOnReturnToField, 1:1 InitObjectEventsReturnToField).
        // Set outcome vars (= 1:1 décomp battle_main.c gBattleOutcome + VAR_RESULT).
        VarSet('VAR_RESULT', outcome);
        VarSet('VAR_RESULT', outcome);
        // Track "is battle over" for GetBattleOutcome special read by scripts.
        (globalThis as { __gBattleOutcome?: number }).__gBattleOutcome = outcome;
        // 1:1 décomp : sync HP/status/exp depuis gPlayerParty vers PokemonInstance
        // pour persist au post-combat.
        teardownPartyAfterBattle(gSaveBlock1Ptr.playerParty.filter((m: PokemonInstance | null): m is PokemonInstance => !!m));
        console.log(`[battle-flow] battle done — outcome=${outcome} (1=WIN, 2=LOST), turnCount=${turnCount}`);
        // 1:1 décomp `CB2_EndWildBattle` (battle_setup.c:602-616) →
        // `SetMainCallback2(CB2_ReturnToField)` + `gFieldCallback = FieldCB_ReturnToFieldNoScriptCheckMusic`.
        // CRITIQUE : `CB2_InitBattleInternal` (battle_main.c:677-678) fait
        // `LoadBattleTextboxAndBackground()` qui charge le BG combat dans la VRAM,
        // écrasant les tilesets/tilemaps overworld + `ResetSpriteData()` qui détruit
        // les sprites OW (qu'on a portés au battle entry LOAD_ASSETS). Donc au retour
        // il faut RE-LOAD le field complet : le décomp le fait via CB2_ReturnToField,
        // notre équivalent = `globalThis._restoreOverworldFromMenu()` (exposé par
        // TestOverworldScene, 1:1 `ReturnToFieldLocal` : reconfig BG0-3
        // sOverworldBgTemplates + loadAndInitMap returnToField → re-load tilesets/
        // palettes/tilemaps + InitPlayerAvatar + SpawnObjectEventsOnReturnToField =
        // 1:1 InitObjectEventsReturnToField). Sans ce restore → écran noir post-combat
        // + aucun sprite OW re-spawné.
        {
          const restoreFn = (globalThis as Record<string, unknown>)._restoreOverworldFromMenu as (() => Promise<void>) | undefined;
          if (typeof restoreFn === 'function') {
            // 1:1 décomp : `SetMainCallback2(CB2_ReturnToField)` REMPLACE le
            // battle callback — le battle est fini IMMÉDIATEMENT, le field
            // callback prend le relais (async). Donc on fire-and-forget le
            // restore et on retourne DONE direct. NE PAS attendre : le restore
            // reset le script engine (ResetTasks) qui tick ce flow → si on
            // attendait, le flow resterait bloqué (= deadlock observé).
            restoreFn().catch(e => {
              console.error('[battle-flow] _restoreOverworldFromMenu THREW:', e);
            });
          } else {
            // Fallback (= si l'overworld n'a pas exposé le restore) : juste
            // re-show les BGs (= comportement legacy pré-VRAM-wipe).
            console.warn('[battle-flow] no _restoreOverworldFromMenu — fallback ShowBg');
            ShowBg(1); ShowBg(2); ShowBg(3);
          }
        }
        _overworldRestoreDone = true;  // (gardé pour compat introspection)
        state = 'DONE';
        return false;
      }

      case 'DONE':
        return true;
    }
    return false;
  };

  /** R2 Controller IPC bridge : map battle window ID (B_WIN_*) → notre
   *  closure-local window id (actionMenuWindowId, actionPromptWindowId, etc.).
   *  Permet à BattlePutTextOnWindow(decoded, B_WIN_MSG) de toucher la bonne
   *  window. */
  const _printTextToBattleWindow = (windowId: number, text: string): void => {
    // 1:1 décomp battle.h B_WIN_* mapping → battle-flow.ts closure window IDs.
    // ATTENTION : B_WIN_ACTION_PROMPT (1) + B_WIN_ACTION_MENU (2) sont SKIP
    // ici car le décomp les écrit avec des codes spéciaux non décodés par
    // notre AddTextPrinterParameterized3 :
    //   - gText_BattleMenu = "ATTAQUE{CLEAR_TO 56}SAC\nPOKéMON{CLEAR_TO 56}FUITE"
    //   - gText_WhatWillPkmnDo = "Que doit faire\n{B_ACTIVE_NAME_WITH_PREFIX}?"
    // Le rendering est déjà géré par refreshActionMenu (= spaces aligned
    // avec `>` cursor) et refreshActionPrompt (= playerMon.nickname résolu).
    // Le PlayerHandleChooseAction R3 wire appelle BattlePutTextOnWindow 1:1
    // strict mais nous skip pour éviter d'écraser le rendering correct.
    let localWinId = -1;
    switch (windowId) {
      case 0:  /* B_WIN_MSG */ showBattleMessage(text); return;  // RB2 : route 1:1 vers la box message
      case 1:  /* B_WIN_ACTION_PROMPT */ return; // skip : refreshActionPrompt gère
      case 2:  /* B_WIN_ACTION_MENU */ return;   // skip : refreshActionMenu gère
      case 3:  /* B_WIN_MOVE_NAME_1 */ localWinId = moveName1WinId; break;
      case 4:  /* B_WIN_MOVE_NAME_2 */ localWinId = moveName2WinId; break;
      case 5:  /* B_WIN_MOVE_NAME_3 */ localWinId = moveName3WinId; break;
      case 6:  /* B_WIN_MOVE_NAME_4 */ localWinId = moveName4WinId; break;
      case 7:  /* B_WIN_PP */ localWinId = movePpWinId; break;
      case 9:  /* B_WIN_PP_REMAINING */ localWinId = movePpRemainingWinId; break;
      case 10: /* B_WIN_MOVE_TYPE */ localWinId = moveTypeWinId; break;
    }
    if (localWinId < 0) return;  // window pas allouée encore
    // 1:1 décomp BattlePutTextOnWindow (battle_message.c:3035-3108) : font / x / y /
    // letterSpacing / lineSpacing / fgColor / bgColor / shadowColor / fillValue / speed
    // sont LUS PAR FENÊTRE depuis sTextOnWindowsInfo_Normal[windowId] — PAS des
    // défauts globaux. C'est ce qui distingue B_WIN_PP_REMAINING (FONT_NORMAL, x=2,
    // couleurs PP) des labels B_WIN_PP / B_WIN_MOVE_* (FONT_NARROW). colorArray
    // d'AddTextPrinterParameterized3 = [bg, fg, shadow].
    const info = sTextOnWindowsInfo_Normal[windowId];
    FillWindowPixelBuffer(localWinId, info.fillValue);
    AddTextPrinterParameterized3(
      localWinId, info.fontId, info.x, info.y,
      [info.bgColor, info.fgColor, info.shadowColor], info.speed, text,
    );
    CopyWindowToVram(localWinId, 2);
  };

  /** R2 Controller IPC bridge : set action cursor + refresh menu. */
  const _setActionCursorAndRefresh = (pos: number): void => {
    actionMenuCursor = (pos | 0) & 3;
    if (typeof refreshActionMenu === 'function') refreshActionMenu();
  };

  /** R2 Controller IPC bridge : set move cursor + refresh move menu. */
  const _setMoveCursorAndRefresh = (pos: number): void => {
    moveMenuCursor = (pos | 0) & 3;
    if (typeof refreshMoveNames === 'function') refreshMoveNames();
    if (typeof refreshMovePpNumber === 'function') refreshMovePpNumber();
    if (typeof refreshMoveType === 'function') refreshMoveType();
  };

  /** R2 Controller IPC bridge : trigger HP bar drain (= K10 cascade).
   *  Dette R3 : full progressive K10 animation drive. Pour now : direct HP
   *  apply + redraw via drawHpBar(winId, x, y, hp, maxHp). */
  const _scheduleHpBarUpdate = (battler: number, deltaHp: number): void => {
    // Battler 0 = player, 1 = opponent (single battle).
    if (battler === 0 && playerMon) {
      playerMon.currentHp = Math.max(0, Math.min(playerMon.maxHp, playerMon.currentHp + deltaHp));
      drawHpBar(playerHpWindowId, 0, 0, playerMon.currentHp, playerMon.maxHp);
    } else if (battler === 1 && opponentMon) {
      opponentMon.currentHp = Math.max(0, Math.min(opponentMon.maxHp, opponentMon.currentHp + deltaHp));
      drawHpBar(oppHpWindowId, 0, 0, opponentMon.currentHp, opponentMon.maxHp);
    }
  };

  const flow: BattleFlow = {
    tick,
    getState: () => state,
    printText: _printTextToBattleWindow,
    setActionCursor: _setActionCursorAndRefresh,
    setMoveCursor: _setMoveCursorAndRefresh,
    scheduleHpBarUpdate: _scheduleHpBarUpdate,
  };
  // Expose pour devtools introspection (= scope.battle.state() / window.__activeBattleFlow.getState()).
  // Évite d'avoir à toucher chaque call site (script-opcodes / starter-choose-flow / etc.).
  (globalThis as { __activeBattleFlow?: BattleFlow }).__activeBattleFlow = flow;
  return flow;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Detect PNG natural width/height before composing into OBJ VRAM.
 *  Avoids hardcoding 64x64 if we ever encounter different sprite sizes. */
async function detectImageWH(url: string): Promise<{ w: number, h: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/** Reproduce the runtime's oamShapeSizeFromWH (= internal helper that's not
 *  exported). Local copy avoids exposing internals. */
function oamShapeSizeFromWH(w: number, h: number): { shape: 0 | 1 | 2, size: 0 | 1 | 2 | 3 } {
  // Phase 1.4 N1 fix : les sprites Pokémon décomp sont des PNG sprite-sheets
  // verticaux (= 1er frame 64x64, frames empilées h=64*N). Si h est un multiple
  // de w (= sheet), use frame_height = w. Ex: 64x256 → frame 64x64.
  if (h > w && h % w === 0) {
    h = w;
  }
  if (w === h) {
    const map: Record<number, 0 | 1 | 2 | 3> = { 8: 0, 16: 1, 32: 2, 64: 3 };
    return { shape: 0, size: map[w] ?? 0 };
  } else if (w > h) {
    const key = `${w}x${h}`;
    const map: Record<string, 0 | 1 | 2 | 3> = { '16x8': 0, '32x8': 1, '32x16': 2, '64x32': 3 };
    return { shape: 1, size: map[key] ?? 0 };
  } else {
    const key = `${w}x${h}`;
    const map: Record<string, 0 | 1 | 2 | 3> = { '8x16': 0, '8x32': 1, '16x32': 2, '32x64': 3 };
    return { shape: 2, size: map[key] ?? 0 };
  }
}

// Re-export getMoveName for callers that want move display name (= UI helper).
export { getMoveName };
