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
  DrawStdFrameWithCustomTileAndPalette,
  ClearStdWindowAndFrame,
  FillWindowPixelBuffer,
  FillWindowPixelRect,
  CopyWindowToVram,
  ShowBg,
  HideBg,
  type WindowTemplate,
} from './gba-window-system';
import { AddTextPrinterParameterized3 } from './gba-text-system';
import {
  ShowFieldMessage,
  IsFieldMessageBoxHidden,
  HideFieldMessageBox,
} from './field-message-box';
import { getRuntime, BlendPalettes, PALETTES_ALL } from './decomp-globals';

/** Restaure gPlttBufferFaded ← gPlttBufferUnfaded INSTANT (= annule un
 *  FadeScreenBlack persistant sans fade progressif). 1:1 décomp équivalent :
 *  `BlendPalettes(PALETTES_ALL, 0, RGB_BLACK)` avec coeff 0 = 0% blend =
 *  Faded ← Unfaded pur. Les palettes battle réelles sont déjà dans Unfaded
 *  (LoadPalette écrit both buffers). */
function _restorePalettesFromUnfaded(): void {
  BlendPalettes(PALETTES_ALL, 0, 0 /* RGB_BLACK */);
}
import { OBJ_PLTT_ID } from './decomp-runtime';
import { gameState } from './game-state';
import { createPokemonInstance, calculateExpGain, applyExpAward, type PokemonInstance } from './pokemon';
import { setupPartyForBattle, teardownPartyAfterBattle, fillActiveBattleMonsForBattleStart } from './battle/party-storage';
import { startBattleTransitionSlice, tickBattleTransitionSlice, stopBattleTransition, startBattleIntroFlash, tickBattleIntroFlash } from './battle-transition';
import { setupBattleWindowForIntro, startBattleIntroSlide, tickBattleIntroSlide, resetBattleIntroWindow } from './battle-intro';
import { startBallThrow, tickBallThrow, stopBallThrow, isBallThrowActive } from './battle-ball-throw';
import {
  createBattlerHealthboxSprites,
  destroyHealthboxSprite,
  setHealthboxVisible,
  updateHealthboxHpBar,
  updateHealthboxLevel,
  updateHealthboxHpDigits,
  updateHealthboxStatus,
  updateHealthboxExpBar,
  type HealthboxHandle,
} from './battle-healthbox';
import { getExperienceForLevel } from './data/game-data';
import {
  runMoveScriptViaBytecode,
  runBattleTurnPassedViaBytecode,
  runHandleFaintedMonActionsViaBytecode,
  syncBattleMonsHpToInstances,
  chooseOpponentMoveViaAI,
} from './battle/wire-bytecode-bridge';
import { VarSet } from './script-vars';
import { getMove, getMoveName, loadGameData } from './data/game-data';
import { Random } from './random';
import { IsBattleSceneOff } from './gba-menu-system';

// ─── GBA input keys (= 1:1 décomp gba/key.h) ─────────────────────────────────
const A_BUTTON   = 0x01;
const B_BUTTON   = 0x02;
const DPAD_RIGHT = 0x10;
const DPAD_LEFT  = 0x20;
const DPAD_UP    = 0x40;
const DPAD_DOWN  = 0x80;

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
const PLAYER_PALETTE_SLOT   = 13;
const OPPONENT_PALETTE_SLOT = 14;

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
const OPPONENT_X = 176 - 32;       // = 144
const OPPONENT_Y = 40 - 32;        // = 8
const PLAYER_X   = 72 - 32;        // = 40
const PLAYER_Y   = 80 - 32 + 8;    // = 56 (+8 player side bonus 1:1 décomp)

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
// 1:1 décomp battle_bg.c:174-191 B_WIN_ACTION_PROMPT + B_WIN_ACTION_MENU.
// `B_WIN_ACTION_PROMPT` est la window gauche bas qui affiche "Que doit faire X?"
// pendant que le user choisit (= tilemapLeft=1, top=15 dans notre adapt).
// `B_WIN_ACTION_MENU` est la grille 2x2 ATTAQUE/SAC/POKéMON/FUITE droite bas.
const ACTION_PROMPT_WINDOW: WindowTemplate = {
  bg: 0,
  tilemapLeft: 1, tilemapTop: 15,
  width: 14, height: 4,
  paletteNum: 15,
  baseBlock: 0x1C0,
};
const ACTION_MENU_WINDOW: WindowTemplate = {
  bg: 0,
  tilemapLeft: 17, tilemapTop: 15,
  width: 12, height: 4,
  paletteNum: 15,
  baseBlock: 0x190,
};
// Move menu legacy : 1 grosse window (= avant refactor N4 1:1 décomp).
// Conservée pour fallback / éventuel ROM A/B test mais non utilisée
// quand __USE_BYTECODE_FOR_DAMAGE__ est ON (= maintenant default chemin).
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
// Décomp coords adapt : on remappe le tilemapTop=55-57 (= hors-visible BG-scrolled
// dans GBA) à tilemapTop=15-17 (= zone visible). Width/positions identiques.
const MOVE_NAME_1_WINDOW: WindowTemplate = {
  bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 8, height: 2, paletteNum: 15, baseBlock: 0x300,
};
const MOVE_NAME_2_WINDOW: WindowTemplate = {
  bg: 0, tilemapLeft: 11, tilemapTop: 15, width: 8, height: 2, paletteNum: 15, baseBlock: 0x310,
};
const MOVE_NAME_3_WINDOW: WindowTemplate = {
  bg: 0, tilemapLeft: 2, tilemapTop: 17, width: 8, height: 2, paletteNum: 15, baseBlock: 0x320,
};
const MOVE_NAME_4_WINDOW: WindowTemplate = {
  bg: 0, tilemapLeft: 11, tilemapTop: 17, width: 8, height: 2, paletteNum: 15, baseBlock: 0x330,
};
const MOVE_PP_WINDOW: WindowTemplate = {
  bg: 0, tilemapLeft: 21, tilemapTop: 15, width: 4, height: 2, paletteNum: 15, baseBlock: 0x290,
};
const MOVE_PP_REMAINING_WINDOW: WindowTemplate = {
  bg: 0, tilemapLeft: 25, tilemapTop: 15, width: 4, height: 2, paletteNum: 15, baseBlock: 0x298,
};
const MOVE_TYPE_WINDOW: WindowTemplate = {
  bg: 0, tilemapLeft: 21, tilemapTop: 17, width: 8, height: 2, paletteNum: 15, baseBlock: 0x2A0,
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
  | 'ACTION_FALLBACK_TEXT' | 'ACTION_FALLBACK_WAIT'
  | 'ACTION_RUN_TEXT' | 'ACTION_RUN_WAIT'
  | 'MOVE_MENU_INIT' | 'MOVE_MENU_INPUT'
  | 'PLAYER_USES_MOVE' | 'PLAYER_USES_MOVE_WAIT'
  | 'PLAYER_BYTECODE_MSG' | 'PLAYER_BYTECODE_MSG_WAIT'
  | 'PLAYER_DAMAGE_OPP' | 'PLAYER_DAMAGE_OPP_WAIT'
  | 'CHECK_OPP_FAINTED'
  | 'OPP_FAINTED_TEXT' | 'OPP_FAINTED_WAIT'
  | 'EXP_AWARD_TEXT' | 'EXP_AWARD_WAIT'
  | 'LEVEL_UP_TEXT' | 'LEVEL_UP_WAIT'
  | 'OPPONENT_USES_MOVE' | 'OPPONENT_USES_MOVE_WAIT'
  | 'OPPONENT_BYTECODE_MSG' | 'OPPONENT_BYTECODE_MSG_WAIT'
  | 'OPPONENT_DAMAGE_PLAYER' | 'OPPONENT_DAMAGE_PLAYER_WAIT'
  | 'CHECK_PLAYER_FAINTED'
  | 'PLAYER_FAINTED_TEXT' | 'PLAYER_FAINTED_WAIT'
  | 'END_TURN_PROCESS' | 'END_TURN_MSG' | 'END_TURN_MSG_WAIT'
  | 'CLEANUP'
  | 'DONE';

export interface BattleFlow {
  /** Tick the battle state machine. Returns true when battle is done. */
  tick(): boolean;
  /** Public for debug : current state name. */
  getState(): string;
}

interface BattleParams {
  /** Player Pokemon (= takes from gameState.party[0] by default). */
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

/** Build a fresh battle flow + return controller. */
export function startBirchTutorialBattle(): BattleFlow {
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

  // Selected move for current turn (set by move menu).
  let chosenMoveIndex = 0;

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

  /** 1:1 décomp battle_interface.c gender symbol (♂ male / ♀ female / blank si genderless). */
  const _genderSymbol = (mon: PokemonInstance | null): string => {
    if (!mon) return '';
    // PokemonInstance n'expose pas directement le gender (= dérivé du personality).
    // Pour MVP, deferred. Décomp utilise GetMonGender(mon) qui lit MON_DATA_PERSONALITY.
    return '';
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
      updateHealthboxHpBar(opponentHealthbox, opponentMon.currentHp, opponentMon.maxHp);
      // Phase 1.4 N Q3 D3 : Lv display (1:1 décomp UpdateLvlInHealthbox).
      updateHealthboxLevel(opponentHealthbox, opponentMon.level);
      // Phase 1.4 N Q3 D4 : status icon (1:1 décomp UpdateStatusIconInHealthbox).
      updateHealthboxStatus(opponentHealthbox, opponentMon.status);
    }
    if (playerHealthbox && playerMon) {
      updateHealthboxHpBar(playerHealthbox, playerMon.currentHp, playerMon.maxHp);
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

  /** Helper : print text dans une window avec clear avant. */
  const _printToWindow = (winId: number, text: string): void => {
    if (winId < 0) return;
    FillWindowPixelBuffer(winId, 0x11);
    AddTextPrinterParameterized3(winId, 1, 0, 1, [1, 2, 3], 255, text);
    CopyWindowToVram(winId, 2);
  };

  /** 1:1 décomp MoveSelectionDisplayMoveNames (= 4 noms moves + cursor sur active). */
  const refreshMoveNames = (): void => {
    if (!playerMon) return;
    const moves = playerMon.moves;
    const wins = [moveName1WinId, moveName2WinId, moveName3WinId, moveName4WinId];
    for (let i = 0; i < 4; i++) {
      const mv = moves[i];
      const cursorMark = i === moveMenuCursor ? '>' : ' ';
      const name = mv ? mv.nameFr.toUpperCase() : '-';
      _printToWindow(wins[i], cursorMark + name);
    }
  };

  /** 1:1 décomp MoveSelectionDisplayPpString (= "PP" label fixed). */
  const refreshMovePpLabel = (): void => {
    _printToWindow(movePpWinId, _MOVE_INTERFACE_PP_LABEL);
  };

  /** 1:1 décomp MoveSelectionDisplayPpNumber (= currentPp/maxPp). */
  const refreshMovePpNumber = (): void => {
    if (!playerMon) return;
    const mv = playerMon.moves[moveMenuCursor];
    const cur = mv ? mv.pp : 0;
    const max = mv ? mv.ppMax : 0;
    _printToWindow(movePpRemainingWinId, `${String(cur).padStart(2, ' ')}/${String(max).padStart(2, ' ')}`);
  };

  /** 1:1 décomp MoveSelectionDisplayMoveType (= "TYPE/<TypeName>"). */
  const refreshMoveType = (): void => {
    if (!playerMon) return;
    const mv = playerMon.moves[moveMenuCursor];
    if (!mv) { _printToWindow(moveTypeWinId, _MOVE_INTERFACE_TYPE_LABEL); return; }
    // Lookup move type via getMove (= battle data table)
    const moveData = getMove('MOVE_' + mv.id.toUpperCase().replace(/-/g, '_'));
    const typeFr = _typeNameFr(moveData?.type);
    _printToWindow(moveTypeWinId, _MOVE_INTERFACE_TYPE_LABEL + typeFr);
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
    // Draw frame autour de chaque window (= 1:1 décomp standard battle frame).
    DrawStdFrameWithCustomTileAndPalette(moveName1WinId,       true, 0x214, 14);
    DrawStdFrameWithCustomTileAndPalette(moveName2WinId,       true, 0x214, 14);
    DrawStdFrameWithCustomTileAndPalette(moveName3WinId,       true, 0x214, 14);
    DrawStdFrameWithCustomTileAndPalette(moveName4WinId,       true, 0x214, 14);
    DrawStdFrameWithCustomTileAndPalette(movePpWinId,          true, 0x214, 14);
    DrawStdFrameWithCustomTileAndPalette(movePpRemainingWinId, true, 0x214, 14);
    DrawStdFrameWithCustomTileAndPalette(moveTypeWinId,        true, 0x214, 14);
    refreshMoveMenu();
  };

  const drawMoveCursor = (): void => {
    // 1:1 décomp ll. 553-572 : after cursor move, also re-display PP + Type
    // (= car le slot active a changé).
    refreshMoveMenu();
  };

  /** Close all 7 move menu windows. */
  const closeMoveMenu = (): void => {
    const wins = [moveName1WinId, moveName2WinId, moveName3WinId, moveName4WinId, movePpWinId, movePpRemainingWinId, moveTypeWinId];
    for (const w of wins) {
      if (w >= 0) {
        ClearStdWindowAndFrame(w, true);
        RemoveWindow(w);
      }
    }
    moveName1WinId = moveName2WinId = moveName3WinId = moveName4WinId = -1;
    movePpWinId = movePpRemainingWinId = moveTypeWinId = -1;
    // Legacy : si l'ancien MOVE_MENU_WINDOW est encore actif (= fallback path), close.
    if (moveMenuWindowId >= 0) {
      ClearStdWindowAndFrame(moveMenuWindowId, true);
      RemoveWindow(moveMenuWindowId);
      moveMenuWindowId = -1;
    }
  };

  // ─── Action menu (= FIGHT/BAG/POKEMON/RUN grille 2x2) 1:1 décomp ─────────
  // Source : battle_controller_player.c:HandleInputChooseAction + battle_message.c:1276
  // gText_BattleMenu = "ATTAQUE{CLEAR_TO 56}SAC\nPOKéMON{CLEAR_TO 56}FUITE"
  // gText_WhatWillPkmnDo = "Que doit faire\n{B_ACTIVE_NAME_WITH_PREFIX}?"

  /** Refresh action menu window with cursor `>` at the active 2x2 cell. */
  const refreshActionMenu = (): void => {
    if (actionMenuWindowId < 0) return;
    FillWindowPixelBuffer(actionMenuWindowId, 0x11);
    // Layout grille 2x2 :
    //   row 0 : [>]ATTAQUE   [>]SAC
    //   row 1 : [>]POKéMON   [>]FUITE
    // cursor pos : 0=TL, 1=TR, 2=BL, 3=BR. CLEAR_TO 56 → pad ~7 chars.
    const c = actionMenuCursor;
    const pad = (s: string, n: number): string => s + ' '.repeat(Math.max(0, n - s.length));
    const tl = (c === 0 ? '>' : ' ') + 'ATTAQUE';
    const tr = (c === 1 ? '>' : ' ') + 'SAC';
    const bl = (c === 2 ? '>' : ' ') + 'POKéMON';
    const br = (c === 3 ? '>' : ' ') + 'FUITE';
    const menuText = pad(tl, 9) + tr + '\n' + pad(bl, 9) + br;
    AddTextPrinterParameterized3(
      actionMenuWindowId, 1, 0, 1, [1, 2, 3], 255 /* TEXT_SKIP_DRAW = sync */, menuText,
    );
    CopyWindowToVram(actionMenuWindowId, 2);
  };

  /** Refresh action prompt window with "Que doit faire X?". */
  const refreshActionPrompt = (): void => {
    if (actionPromptWindowId < 0 || !playerMon) return;
    FillWindowPixelBuffer(actionPromptWindowId, 0x11);
    const promptText = `Que doit faire\n${playerMon.nickname.toUpperCase()}?`;
    AddTextPrinterParameterized3(
      actionPromptWindowId, 1, 0, 1, [1, 2, 3], 255 /* TEXT_SKIP_DRAW */, promptText,
    );
    CopyWindowToVram(actionPromptWindowId, 2);
  };

  /** Init action menu + prompt windows simultanément. Called au début du turn. */
  const initActionMenu = (): void => {
    if (!playerMon) return;
    if (actionPromptWindowId < 0) actionPromptWindowId = AddWindow(ACTION_PROMPT_WINDOW);
    if (actionMenuWindowId < 0)   actionMenuWindowId   = AddWindow(ACTION_MENU_WINDOW);
    DrawStdFrameWithCustomTileAndPalette(actionPromptWindowId, true, 0x214, 14);
    DrawStdFrameWithCustomTileAndPalette(actionMenuWindowId,   true, 0x214, 14);
    refreshActionPrompt();
    refreshActionMenu();
  };

  /** Close both windows action menu + prompt. */
  const closeActionMenu = (): void => {
    if (actionMenuWindowId >= 0) {
      ClearStdWindowAndFrame(actionMenuWindowId, true);
      RemoveWindow(actionMenuWindowId);
      actionMenuWindowId = -1;
    }
    if (actionPromptWindowId >= 0) {
      ClearStdWindowAndFrame(actionPromptWindowId, true);
      RemoveWindow(actionPromptWindowId);
      actionPromptWindowId = -1;
    }
  };

  /** 1:1 décomp `OpponentHandleChooseMove` (battle_controller_opponent.c:1551).
   *
   *  Mode bytecode (flag `__USE_BYTECODE_FOR_DAMAGE__`) → vrai comportement
   *  décomp via `chooseOpponentMoveViaAI` : combat sauvage = move ALÉATOIRE
   *  (skip MOVE_NONE), pas "premier move offensif" (= c'était une dérive MVP ;
   *  ROM Émeraude choisit aléatoirement pour les Pokémon sauvages).
   *  Flag OFF → comportement legacy inchangé (= chemin tutorial parké, zéro
   *  régression). Si l'AI renvoie -1 (indispo) → fallback legacy aussi. */
  const pickOpponentMove = (): number => {
    if (!opponentMon || opponentMon.moves.length === 0) return 0;
    const useBytecode =
      (globalThis as { __USE_BYTECODE_FOR_DAMAGE__?: boolean }).__USE_BYTECODE_FOR_DAMAGE__
      || (typeof localStorage !== 'undefined' && localStorage.getItem('__USE_BYTECODE_FOR_DAMAGE__') === '1');
    if (useBytecode) {
      const r = chooseOpponentMoveViaAI({
        opponent: opponentMon,
        player: playerMon ?? opponentMon,
        // 1:1 décomp : dresseur → scripts BattleAI ; sauvage → move aléatoire.
        isTrainer: params.isTrainerBattle ?? false,
        trainerId: params.trainerNumId,
      });
      if (r.index >= 0 && r.index < opponentMon.moves.length) return r.index;
      // index -1 (indispo) → fallback legacy ci-dessous.
    }
    // Legacy MVP (flag OFF ou AI indispo) : premier move offensif.
    for (let i = 0; i < opponentMon.moves.length; i++) {
      const mv = getMove('MOVE_' + opponentMon.moves[i].id.toUpperCase());
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
  let _lastBytecodeEvents: import('./battle/battle-event-queue').BattleEvent[] = [];

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
   *  Si flag global `__USE_BYTECODE_FOR_DAMAGE__` est set (= localStorage ou
   *  window var), on route via le bytecode interpreter 1:1 décomp (= 645/645
   *  scripts validés). Sinon, formule simplifiée ad-hoc (= legacy tutorial).
   *
   *  Pour activer : localStorage.setItem('__USE_BYTECODE_FOR_DAMAGE__', '1')
   *  puis reload, OU window.__USE_BYTECODE_FOR_DAMAGE__ = true (no reload).
   *
   *  Phase 1.4 J : capture aussi result.messages dans _pendingBytecodeMessages
   *  pour que la state machine puisse les afficher séquentiellement (= 1:1
   *  PRINTSTRING events décodés via battle-string-decoder). */
  const applyMoveDamage = (attacker: PokemonInstance, defender: PokemonInstance, moveIdx: number): { damage: number, typeMul: number } => {
    // Flag check : si bytecode mode activé, route via runMoveScriptViaBytecode.
    const useBytecode =
      (globalThis as { __USE_BYTECODE_FOR_DAMAGE__?: boolean }).__USE_BYTECODE_FOR_DAMAGE__
      || (typeof localStorage !== 'undefined' && localStorage.getItem('__USE_BYTECODE_FOR_DAMAGE__') === '1');

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
    const moveData = getMove('MOVE_' + mv.id.toUpperCase());
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

  // Session 124 Bug 5c : shake state pour feedback visuel "hit" damage.
  // 1:1 décomp pattern : `sprite.x2` / `sprite.y2` offsets temporaires.
  let _shakeSpriteId = -1;
  let _shakeFramesLeft = 0;
  const startShake = (spriteId: number, frames = 14) => {
    _shakeSpriteId = spriteId;
    _shakeFramesLeft = frames;
  };
  const tickShake = (): void => {
    if (_shakeFramesLeft <= 0) return;
    const rt2 = getRuntime();
    if (!rt2) return;
    const sprite = rt2.gSprites.get(_shakeSpriteId);
    if (!sprite) { _shakeFramesLeft = 0; return; }
    // Oscillation horizontale décroissante (= 4px → 0).
    const decay = _shakeFramesLeft / 14;
    const offset = Math.sin(_shakeFramesLeft * 1.2) * 4 * decay;
    sprite.x2 = Math.round(offset);
    _shakeFramesLeft--;
    if (_shakeFramesLeft === 0) {
      sprite.x2 = 0;
      sprite.y2 = 0;
      _shakeSpriteId = -1;
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

  const tick = (): boolean => {
    const rt = getRuntime();
    if (!rt) return false;

    // Tick shake animation (= run regardless of state, so shake survives
    // text waits + transitions).
    tickShake();
    tickFaint();
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

    // Iter16 : during battle, re-hide overworld sprites each frame because
    // UpdateObjectEvents() runs before our tick and re-shows them. Skip during
    // INIT/LOAD_ASSETS (= our battle sprites not yet spawned) and CLEANUP.
    const stashedSprites = (globalThis as { __battleSpriteStash?: Set<number> }).__battleSpriteStash;
    if (stashedSprites && state !== 'CLEANUP' && state !== 'DONE' && state !== 'INIT' && state !== 'LOAD_ASSETS' && state !== 'WAIT_LOAD') {
      for (const id of stashedSprites) {
        const sprite = rt.gSprites.get(id);
        if (sprite) sprite.invisible = true;
      }
    }

    switch (state) {
      case 'INIT': {
        // Pick player Pokemon : first non-fainted from party.
        const party = gameState.party;
        playerMon = params.playerMon
          ?? party.find((m) => m && m.currentHp > 0)
          ?? null;
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
        setupPartyForBattle(party.filter((m): m is PokemonInstance => !!m), [opponentMon]);
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
        import('./decomp-globals').then(({ m4aSongNumStart }) => {
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
              // Expose getSpeciesInfo via global for getSpeciesStats lookup.
              const gameData = await import('./data/game-data');
              (globalThis as { __game_data?: unknown }).__game_data = gameData;
              // Load player back sprite.
              const playerDexId = playerMon!.speciesEnum.replace('SPECIES_', '').toLowerCase();
              const playerUrl = `/decomp/em/pokemon/${playerDexId}/back.png`;
              const playerLoaded = await rt.LoadCompressedSpriteSheet(playerUrl, PLAYER_SPRITE_BYTE_OFFSET);
              rt.LoadPaletteObj(playerLoaded.palette, OBJ_PLTT_ID(PLAYER_PALETTE_SLOT));
              // Detect actual sprite dimensions (back sprite often 64x64 but can vary).
              const playerWH = await detectImageWH(playerUrl);
              if (playerWH) {
                const sized = oamShapeSizeFromWH(playerWH.w, playerWH.h);
                playerSpriteShape = sized.shape;
                playerSpriteSize  = sized.size;
              }

              // Load opponent front sprite.
              const oppDexId = opponentMon!.speciesEnum.replace('SPECIES_', '').toLowerCase();
              const oppUrl = `/decomp/em/pokemon/${oppDexId}/front.png`;
              const oppLoaded = await rt.LoadCompressedSpriteSheet(oppUrl, OPPONENT_SPRITE_BYTE_OFFSET);
              rt.LoadPaletteObj(oppLoaded.palette, OBJ_PLTT_ID(OPPONENT_PALETTE_SLOT));
              const oppWH = await detectImageWH(oppUrl);
              if (oppWH) {
                const sized = oamShapeSizeFromWH(oppWH.w, oppWH.h);
                oppSpriteShape = sized.shape;
                oppSpriteSize  = sized.size;
              }
              // 1:1 décomp `LoadBattleTextboxAndBackground` (battle_bg.c:859-867).
              // Charge BG0 textbox + BG2 terrain (= GRASS par défaut).
              // Fix B1-bis : helper dédié `_loadBattleTerrainTiles` qui supporte
              // 3 sub-palettes 48-color (= bug racine `loadIndexedPngStrict` ne
              // prend que 16 colors → pixels sub-pal 1/2 mappés à transparent).
              const bgMod = await import('./battle-bg');
              await bgMod.loadBattleTextboxAndBackground(bgMod.BATTLE_ENVIRONMENT_GRASS);
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
        // Iter16 : hide overworld OAM sprites (= player + NPCs) so they don't
        //   show on top of the battle. Stash their visibility for restore on
        //   cleanup. Iterate sprites par spriteId (= gSprites map) AVANT le
        //   spawn de nos sprites battle (= ceux-ci seront ajoutés ensuite).
        const stashSprites: Set<number> = new Set();
        for (const [spriteId, sprite] of rt.gSprites) {
          if (sprite && !sprite.invisible) {
            stashSprites.add(spriteId);
            sprite.invisible = true;
          }
        }
        (globalThis as { __battleSpriteStash?: Set<number> }).__battleSpriteStash = stashSprites;

        // Compute tileId for each sprite (= byteOffset / 32 bytes per tile).
        const playerTileId   = PLAYER_SPRITE_BYTE_OFFSET   / 32;
        const opponentTileId = OPPONENT_SPRITE_BYTE_OFFSET / 32;

        // Sprite x/y are CENTER coords in our engine, then CalcCenterToCornerVec
        // applies offset. We pass top-left here with adjustment.
        // Looking at CreateSpriteAtOam : it uses x/y as input directly to oam.x/y
        // (no auto-adjustment for non-affine sprites in our path?). Reading code
        // shows CalcCenterToCornerVec is computed but for OAM we keep x/y direct.
        // Practical : use top-left coords.
        const opp = rt.CreateSpriteAtOam({
          tileId: opponentTileId,
          paletteBank: OPPONENT_PALETTE_SLOT,
          x: OPPONENT_X, y: OPPONENT_Y,
          shape: oppSpriteShape, size: oppSpriteSize,
          priority: 0,
        });
        opponentSpriteId = opp.spriteId;
        const player = rt.CreateSpriteAtOam({
          tileId: playerTileId,
          paletteBank: PLAYER_PALETTE_SLOT,
          x: PLAYER_X, y: PLAYER_Y,
          shape: playerSpriteShape, size: playerSpriteSize,
          priority: 0,
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
            }
          }).catch(e => console.warn('[battle-flow] opp healthbox create failed:', e));
        }
        if (!playerHealthbox) {
          void createBattlerHealthboxSprites('player').then(handle => {
            playerHealthbox = handle;
            if (handle) {
              setHealthboxVisible(handle, true);
              renderHpWindows();
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
        ShowFieldMessage(`Un ${opponentMon.nickname} sauvage\napparaît!`);
        // Iter18 : play opponent cry on appear (= 1:1 décomp behavior).
        // FIX : utiliser speciesName EN canonique (= "Poochyena"), PAS nickname FR
        // ("MEDHYENA"). Les fichiers cri sont `/cries/<speciesName>.wav` (= EN).
        // Avec nickname FR → medhyena.wav 404 → "cry fail EncodingError".
        void import('./music').then(({ playCry }) => {
          playCry(opponentMon!.speciesName);
        });
        state = 'INTRO_WAIT';
        return false;
      }

      case 'INTRO_WAIT': {
        if (IsFieldMessageBoxHidden() && (rt.gMain.newKeys & (A_BUTTON | B_BUTTON))) {
          HideFieldMessageBox();
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
          void import('./music').then(({ playCry }) => {
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
      case 'ACTION_MENU_INIT': {
        if (!playerMon) { state = 'CLEANUP'; return false; }
        actionMenuCursor = 0;  // 1:1 décomp : reset cursor au début de chaque tour.
        initActionMenu();
        state = 'ACTION_MENU_INPUT';
        return false;
      }

      case 'ACTION_MENU_INPUT': {
        if (!playerMon) { state = 'CLEANUP'; return false; }
        const newKeys = rt.gMain.newKeys;
        // 1:1 décomp battle_controller_player.c:266-305 :
        // - DPAD_LEFT  : toggle bit 0 SI cursor & 1 (= right column → left)
        // - DPAD_RIGHT : toggle bit 0 SI !(cursor & 1) (= left column → right)
        // - DPAD_UP    : toggle bit 1 SI cursor & 2 (= bottom row → top)
        // - DPAD_DOWN  : toggle bit 1 SI !(cursor & 2) (= top row → bottom)
        if (newKeys & DPAD_LEFT) {
          if (actionMenuCursor & 1) { actionMenuCursor ^= 1; refreshActionMenu(); }
        } else if (newKeys & DPAD_RIGHT) {
          if (!(actionMenuCursor & 1)) { actionMenuCursor ^= 1; refreshActionMenu(); }
        } else if (newKeys & DPAD_UP) {
          if (actionMenuCursor & 2) { actionMenuCursor ^= 2; refreshActionMenu(); }
        } else if (newKeys & DPAD_DOWN) {
          if (!(actionMenuCursor & 2)) { actionMenuCursor ^= 2; refreshActionMenu(); }
        } else if (newKeys & A_BUTTON) {
          // 1:1 décomp : dispatch selon cursor :
          // 0 = B_ACTION_USE_MOVE   → MOVE_MENU_INIT
          // 1 = B_ACTION_USE_ITEM   → fallback msg (bag in-battle deferred)
          // 2 = B_ACTION_SWITCH     → fallback msg (party switch in-battle deferred)
          // 3 = B_ACTION_RUN        → run logic via TryRunFromBattle
          closeActionMenu();
          switch (actionMenuCursor) {
            case 0: state = 'MOVE_MENU_INIT';      break;
            case 1: state = 'ACTION_FALLBACK_TEXT'; _lastFallbackKind = 'SAC'; break;
            case 2: state = 'ACTION_FALLBACK_TEXT'; _lastFallbackKind = 'POKéMON'; break;
            case 3: state = 'ACTION_RUN_TEXT';      break;
          }
        }
        // No B-cancel for single battle (= 1:1 décomp ll. 306-325 only fires
        // en double battle PLAYER_RIGHT pour annuler partner choice).
        return false;
      }

      // ─── ACTION_FALLBACK : SAC / POKéMON pas encore implémentés en combat ──
      case 'ACTION_FALLBACK_TEXT': {
        // Message gracieux qui ramène le user au menu action.
        ShowFieldMessage(`${_lastFallbackKind} pas encore\ndisponible en combat!`);
        state = 'ACTION_FALLBACK_WAIT';
        return false;
      }

      case 'ACTION_FALLBACK_WAIT': {
        if (IsFieldMessageBoxHidden() && (rt.gMain.newKeys & (A_BUTTON | B_BUTTON))) {
          HideFieldMessageBox();
          state = 'ACTION_MENU_INIT';  // retour au menu pour re-choisir
        }
        return false;
      }

      // ─── ACTION_RUN : fuite simple (= wild battle uniquement, trainer skip) ──
      case 'ACTION_RUN_TEXT': {
        // 1:1 décomp : trainer battles can't run (= sText_CantEscape).
        // Pour wild : success immediate (= MVP simple, full TryRunFromBattle
        // avec speed math wired session ultérieure).
        ShowFieldMessage(`Vous prenez la fuite!`);
        outcome = BATTLE_OUTCOME_RAN;
        state = 'ACTION_RUN_WAIT';
        return false;
      }

      case 'ACTION_RUN_WAIT': {
        if (IsFieldMessageBoxHidden() && (rt.gMain.newKeys & (A_BUTTON | B_BUTTON))) {
          HideFieldMessageBox();
          state = 'CLEANUP_FADE_OUT';
        }
        return false;
      }

      case 'MOVE_MENU_INIT': {
        moveMenuCursor = 0;
        initMoveMenu();
        state = 'MOVE_MENU_INPUT';
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
            HideFieldMessageBox();
            state = 'PLAYER_USES_MOVE';
          }
        }
        // No B-cancel for tutorial (= can't run from Birch tutorial battle).
        return false;
      }

      case 'PLAYER_USES_MOVE': {
        if (!playerMon) { state = 'CLEANUP'; return false; }
        // Phase 1.4 J : si bytecode mode, applyMoveDamage immédiat → fills
        // queue + apply damage + shake → drain queue séquentiellement via
        // PLAYER_BYTECODE_MSG state. Sinon : hardcoded ShowFieldMessage legacy.
        const useBytecodeMsgs =
          (globalThis as { __USE_BYTECODE_FOR_DAMAGE__?: boolean }).__USE_BYTECODE_FOR_DAMAGE__
          || (typeof localStorage !== 'undefined' && localStorage.getItem('__USE_BYTECODE_FOR_DAMAGE__') === '1');
        if (useBytecodeMsgs && opponentMon) {
          _pendingBytecodeMessages = [];
          applyMoveDamage(playerMon, opponentMon, chosenMoveIndex);
          renderHpWindows();
          // 1:1 décomp : sprite shake piloté par CONTROLLER_HITANIMATION event
          // émis par le bytecode (= move hit avec damage applied), pas par check
          // `damage > 0` hardcoded (= manque les status moves qui shake aussi).
          if (_bytecodeWantsHitAnim() && opponentSpriteId >= 0 && !IsBattleSceneOff()) {
            startShake(opponentSpriteId);
          }
          state = 'PLAYER_BYTECODE_MSG';
          return false;
        }
        // Legacy path : message hardcoded puis damage state.
        const mv = playerMon.moves[chosenMoveIndex];
        const moveName = mv?.nameFr.toUpperCase() ?? '?';
        ShowFieldMessage(`${playerMon.nickname} utilise\n${moveName}!`);
        state = 'PLAYER_USES_MOVE_WAIT';
        return false;
      }

      case 'PLAYER_USES_MOVE_WAIT': {
        if (IsFieldMessageBoxHidden() && (rt.gMain.newKeys & (A_BUTTON | B_BUTTON))) {
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
        if (_pendingBytecodeMessages.length === 0) {
          state = 'CHECK_OPP_FAINTED';
          return false;
        }
        const msg = _pendingBytecodeMessages.shift()!;
        ShowFieldMessage(msg);
        state = 'PLAYER_BYTECODE_MSG_WAIT';
        return false;
      }

      case 'PLAYER_BYTECODE_MSG_WAIT': {
        if (IsFieldMessageBoxHidden() && (rt.gMain.newKeys & (A_BUTTON | B_BUTTON))) {
          HideFieldMessageBox();
          state = 'PLAYER_BYTECODE_MSG';
        }
        return false;
      }

      case 'PLAYER_DAMAGE_OPP': {
        if (!playerMon || !opponentMon) { state = 'CLEANUP'; return false; }
        const { damage, typeMul } = applyMoveDamage(playerMon, opponentMon, chosenMoveIndex);
        renderHpWindows();
        if (damage > 0) {
          // Bug 5c : shake opp sprite on damage.
          // 1:1 décomp battle_main.c:1073 : `if (gSaveBlock2Ptr->optionsBattleSceneOff == TRUE)
          //   gHitMarker |= HITMARKER_NO_ANIMATIONS` set au battle init. Notre simplification :
          // check IsBattleSceneOff() directement au site d'anim (= move shake équivalent
          // visuel des battle anims du décomp). User option ANIMAT. COMBAT = NON skip anims.
          if (opponentSpriteId >= 0 && !IsBattleSceneOff()) startShake(opponentSpriteId);
        }
        if (damage > 0) {
          // Iter19 : type effectiveness messages.
          if (typeMul === 0) {
            ShowFieldMessage(`Ça n'a aucun effet sur\n${opponentMon.nickname}...`);
            state = 'PLAYER_DAMAGE_OPP_WAIT';
          } else if (typeMul >= 2) {
            ShowFieldMessage(`C'est super efficace!`);
            state = 'PLAYER_DAMAGE_OPP_WAIT';
          } else if (typeMul > 0 && typeMul < 1) {
            ShowFieldMessage(`Ce n'est pas\ntrès efficace...`);
            state = 'PLAYER_DAMAGE_OPP_WAIT';
          } else {
            // Neutral 1× damage — straight to fainted check.
            state = 'CHECK_OPP_FAINTED';
          }
        } else {
          // Status move (= Growl). Just acknowledge.
          ShowFieldMessage(`${opponentMon.nickname}\nest affaibli!`);
          state = 'PLAYER_DAMAGE_OPP_WAIT';
        }
        return false;
      }

      case 'PLAYER_DAMAGE_OPP_WAIT': {
        if (IsFieldMessageBoxHidden() && (rt.gMain.newKeys & (A_BUTTON | B_BUTTON))) {
          HideFieldMessageBox();
          state = 'CHECK_OPP_FAINTED';
        }
        return false;
      }

      case 'CHECK_OPP_FAINTED': {
        if (!opponentMon) { state = 'CLEANUP'; return false; }
        if (opponentMon.currentHp <= 0) {
          state = 'OPP_FAINTED_TEXT';
        } else {
          state = 'OPPONENT_USES_MOVE';
        }
        return false;
      }

      case 'OPP_FAINTED_TEXT': {
        if (!opponentMon) { state = 'CLEANUP'; return false; }
        ShowFieldMessage(`Le ${opponentMon.nickname} sauvage\nest K.O.!`);
        outcome = BATTLE_OUTCOME_WIN;
        state = 'OPP_FAINTED_WAIT';
        // 1:1 décomp `PlayerHandleFaintAnimation` (battle_controller_player.c:2408) :
        // au lieu de hide direct, lance SpriteCB_FaintOpponentMon → AnimFaintOpponent
        // qui fait descendre le sprite progressivement + le clear visuellement.
        if (opponentSpriteId >= 0) {
          startFaintAnim(opponentSpriteId, true /* isOpponent */);
        }
        return false;
      }

      case 'OPP_FAINTED_WAIT': {
        if (IsFieldMessageBoxHidden() && (rt.gMain.newKeys & (A_BUTTON | B_BUTTON))) {
          HideFieldMessageBox();
          // Session 124 Bug 5 : EXP gain post-K.O. (= 1:1 décomp Gen 3 formula).
          state = 'EXP_AWARD_TEXT';
        }
        return false;
      }

      case 'EXP_AWARD_TEXT': {
        if (!opponentMon || !playerMon) { state = 'CLEANUP'; return false; }
        // 1:1 décomp `pokemon.c:GiveMonExperience` formula :
        //   exp = (baseExp × defeatedLevel) / 7
        const gained = calculateExpGain(opponentMon.speciesEnum, opponentMon.level);
        const result = applyExpAward(playerMon, gained);
        // Stash level-up flag for next state.
        chosenMoveIndex = result.leveledUp ? 1 : 0;  // reuse var as flag
        ShowFieldMessage(`${playerMon.nickname} gagne\n${gained} POINTS D'EXP.!`);
        state = 'EXP_AWARD_WAIT';
        return false;
      }

      case 'EXP_AWARD_WAIT': {
        if (IsFieldMessageBoxHidden() && (rt.gMain.newKeys & (A_BUTTON | B_BUTTON))) {
          HideFieldMessageBox();
          // Bug 5e session 124 : fade-out avant cleanup si pas de level up.
          state = chosenMoveIndex === 1 ? 'LEVEL_UP_TEXT' : 'CLEANUP_FADE_OUT';
        }
        return false;
      }

      case 'LEVEL_UP_TEXT': {
        if (!playerMon) { state = 'CLEANUP'; return false; }
        ShowFieldMessage(`${playerMon.nickname} monte au\nniveau ${playerMon.level}!`);
        // Refresh HP window pour refleter nouveau maxHp.
        renderHpWindows();
        state = 'LEVEL_UP_WAIT';
        return false;
      }

      case 'LEVEL_UP_WAIT': {
        if (IsFieldMessageBoxHidden() && (rt.gMain.newKeys & (A_BUTTON | B_BUTTON))) {
          HideFieldMessageBox();
          // Bug 5e session 124 : fade-out avant cleanup propre (= no visual snap).
          state = 'CLEANUP_FADE_OUT';
        }
        return false;
      }

      case 'OPPONENT_USES_MOVE': {
        if (!opponentMon || !playerMon) { state = 'CLEANUP'; return false; }
        const oppMoveIdx = pickOpponentMove();
        // Phase 1.4 J : bytecode mode → applyMoveDamage immédiat + drain via
        // OPPONENT_BYTECODE_MSG. Sinon : legacy hardcoded.
        const useBytecodeMsgs =
          (globalThis as { __USE_BYTECODE_FOR_DAMAGE__?: boolean }).__USE_BYTECODE_FOR_DAMAGE__
          || (typeof localStorage !== 'undefined' && localStorage.getItem('__USE_BYTECODE_FOR_DAMAGE__') === '1');
        if (useBytecodeMsgs) {
          _pendingBytecodeMessages = [];
          applyMoveDamage(opponentMon, playerMon, oppMoveIdx);
          renderHpWindows();
          // 1:1 décomp : sprite shake piloté par CONTROLLER_HITANIMATION event
          // émis par le bytecode au lieu de hardcoded `damage > 0`.
          if (_bytecodeWantsHitAnim() && playerSpriteId >= 0 && !IsBattleSceneOff()) {
            startShake(playerSpriteId);
          }
          chosenMoveIndex = oppMoveIdx;
          state = 'OPPONENT_BYTECODE_MSG';
          return false;
        }
        const mv = opponentMon.moves[oppMoveIdx];
        const moveName = mv?.nameFr.toUpperCase() ?? '?';
        ShowFieldMessage(`Le ${opponentMon.nickname} sauvage\nutilise ${moveName}!`);
        chosenMoveIndex = oppMoveIdx;
        state = 'OPPONENT_USES_MOVE_WAIT';
        return false;
      }

      case 'OPPONENT_BYTECODE_MSG': {
        if (_pendingBytecodeMessages.length === 0) {
          state = 'CHECK_PLAYER_FAINTED';
          return false;
        }
        const msg = _pendingBytecodeMessages.shift()!;
        ShowFieldMessage(msg);
        state = 'OPPONENT_BYTECODE_MSG_WAIT';
        return false;
      }

      case 'OPPONENT_BYTECODE_MSG_WAIT': {
        if (IsFieldMessageBoxHidden() && (rt.gMain.newKeys & (A_BUTTON | B_BUTTON))) {
          HideFieldMessageBox();
          state = 'OPPONENT_BYTECODE_MSG';
        }
        return false;
      }

      case 'OPPONENT_USES_MOVE_WAIT': {
        if (IsFieldMessageBoxHidden() && (rt.gMain.newKeys & (A_BUTTON | B_BUTTON))) {
          HideFieldMessageBox();
          state = 'OPPONENT_DAMAGE_PLAYER';
        }
        return false;
      }

      case 'OPPONENT_DAMAGE_PLAYER': {
        if (!opponentMon || !playerMon) { state = 'CLEANUP'; return false; }
        const { damage, typeMul } = applyMoveDamage(opponentMon, playerMon, chosenMoveIndex);
        renderHpWindows();
        if (damage > 0) {
          // Bug 5c : shake player sprite on damage.
          // 1:1 décomp HITMARKER_NO_ANIMATIONS check via IsBattleSceneOff() — cf
          // sibling PLAYER_DAMAGE_OPP case ci-dessus pour explanation.
          if (playerSpriteId >= 0 && !IsBattleSceneOff()) startShake(playerSpriteId);
        }
        if (damage > 0) {
          // Iter19 : type effectiveness messages (= same as player turn).
          if (typeMul === 0) {
            ShowFieldMessage(`Ça n'a aucun effet sur\n${playerMon.nickname}...`);
            state = 'OPPONENT_DAMAGE_PLAYER_WAIT';
          } else if (typeMul >= 2) {
            ShowFieldMessage(`C'est super efficace!`);
            state = 'OPPONENT_DAMAGE_PLAYER_WAIT';
          } else if (typeMul > 0 && typeMul < 1) {
            ShowFieldMessage(`Ce n'est pas\ntrès efficace...`);
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
        if (IsFieldMessageBoxHidden() && (rt.gMain.newKeys & (A_BUTTON | B_BUTTON))) {
          HideFieldMessageBox();
          state = 'CHECK_PLAYER_FAINTED';
        }
        return false;
      }

      case 'CHECK_PLAYER_FAINTED': {
        if (!playerMon) { state = 'CLEANUP'; return false; }
        if (playerMon.currentHp <= 0) {
          state = 'PLAYER_FAINTED_TEXT';
        } else {
          turnCount++;
          // 1:1 décomp `BattleTurnPassed()` (battle_main.c:3956-4019) : appelé
          // après les 2 moves du turn pour run end-of-turn effects (= field,
          // per-battler, wish/perish, special Palace/Arena) puis reset turn vars.
          // En mode bytecode, on route via le wrapper full ; en mode legacy on
          // skip directement à PLAYER_TURN_PROMPT (= comportement tutorial actuel).
          const useBytecode =
            (globalThis as { __USE_BYTECODE_FOR_DAMAGE__?: boolean }).__USE_BYTECODE_FOR_DAMAGE__
            || (typeof localStorage !== 'undefined' && localStorage.getItem('__USE_BYTECODE_FOR_DAMAGE__') === '1');
          state = useBytecode ? 'END_TURN_PROCESS' : 'PLAYER_TURN_PROMPT';
        }
        return false;
      }

      case 'PLAYER_FAINTED_TEXT': {
        if (!playerMon) { state = 'CLEANUP'; return false; }
        ShowFieldMessage(`${playerMon.nickname} est K.O.!`);
        outcome = BATTLE_OUTCOME_LOST;
        state = 'PLAYER_FAINTED_WAIT';
        // 1:1 décomp `PlayerHandleFaintAnimation` (battle_controller_player.c:2408) :
        // sprite descend (y2 += 5/frame) hors écran avec SpriteCB_FaintSlideAnim.
        if (playerSpriteId >= 0) {
          startFaintAnim(playerSpriteId, false /* isOpponent=false → player */);
        }
        return false;
      }

      case 'PLAYER_FAINTED_WAIT': {
        if (IsFieldMessageBoxHidden() && (rt.gMain.newKeys & (A_BUTTON | B_BUTTON))) {
          HideFieldMessageBox();
          // Bug 5e session 124 : fade-out avant cleanup propre.
          state = 'CLEANUP_FADE_OUT';
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
        ShowFieldMessage(msg);
        state = 'END_TURN_MSG_WAIT';
        return false;
      }

      case 'END_TURN_MSG_WAIT': {
        if (IsFieldMessageBoxHidden() && (rt.gMain.newKeys & (A_BUTTON | B_BUTTON))) {
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
        // Cleanup transition state si reste actif (= safety si state machine
        // bypass TRANSITION_SLICE).
        stopBattleTransition();
        // 1:1 décomp : reset WIN0 (= la fente d'intro) avant retour overworld.
        // Sinon la fente WIN0V resterait active → overworld masqué/clippé.
        resetBattleIntroWindow();
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
        // Iter16 : restore overworld sprites that were hidden at battle start.
        const stashRestore = (globalThis as { __battleSpriteStash?: Set<number> }).__battleSpriteStash;
        if (stashRestore) {
          for (const id of stashRestore) {
            const sprite = rt.gSprites.get(id);
            if (sprite) sprite.invisible = false;
          }
          (globalThis as { __battleSpriteStash?: Set<number> }).__battleSpriteStash = undefined;
        }
        // Set outcome vars (= 1:1 décomp battle_main.c gBattleOutcome + VAR_RESULT).
        VarSet('VAR_RESULT', outcome);
        gameState.setVar('VAR_RESULT', outcome);
        // Track "is battle over" for GetBattleOutcome special read by scripts.
        (globalThis as { __gBattleOutcome?: number }).__gBattleOutcome = outcome;
        // 1:1 décomp : sync HP/status/exp depuis gPlayerParty vers PokemonInstance
        // pour persist au post-combat.
        teardownPartyAfterBattle(gameState.party.filter((m): m is PokemonInstance => !!m));
        console.log(`[battle-flow] battle done — outcome=${outcome} (1=WIN, 2=LOST), turnCount=${turnCount}`);
        // 1:1 décomp `CB2_EndWildBattle` (battle_setup.c:602-616) →
        // `SetMainCallback2(CB2_ReturnToField)` + `gFieldCallback = FieldCB_ReturnToFieldNoScriptCheckMusic`.
        // CRITIQUE : on a fait `rt.gba.vram.fill(0)` au INIT (= 1:1 décomp
        // `CB2_InitBattleInternal` ll. 626). Donc l'overworld VRAM est WIPED.
        // Le décomp re-init l'overworld FULL via CB2_ReturnToField (= re-load
        // tilesets/palettes/tilemaps/NPCs). Notre équivalent =
        // `globalThis._restoreOverworldFromMenu()` (exposé par TestOverworldScene,
        // 1:1 décomp `ReturnToFieldLocal` : reconfig BG0-3 sOverworldBgTemplates
        // + loadAndInitMap + InitObjectEventsReturnToField).
        // Sans ce restore → écran noir / crash post-battle (VRAM vide).
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

  const flow: BattleFlow = {
    tick,
    getState: () => state,
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
