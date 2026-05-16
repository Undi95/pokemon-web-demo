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
import { getRuntime } from './decomp-globals';
import { OBJ_PLTT_ID } from './decomp-runtime';
import { gameState } from './game-state';
import { createPokemonInstance, calculateExpGain, applyExpAward, type PokemonInstance } from './pokemon';
import { setupPartyForBattle, teardownPartyAfterBattle, fillActiveBattleMonsForBattleStart } from './battle/party-storage';
import { runMoveScriptViaBytecode } from './battle/wire-bytecode-bridge';
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
const OPPONENT_X = 60;
const OPPONENT_Y = 60;
const PLAYER_X   = 180;
const PLAYER_Y   = 110;

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
// Move menu : 4 cells (= 2x2 grid via 1 column 4 rows for simplicity).
// Positioned bottom-right replacing player HP window briefly.
const MOVE_MENU_WINDOW: WindowTemplate = {
  bg: 0,
  tilemapLeft: 17, tilemapTop: 13,
  width: 12, height: 6,
  paletteNum: 15,
  baseBlock: 0x160,
};

// ─── Battle state ────────────────────────────────────────────────────────────
type State =
  | 'INIT' | 'INIT_FADE_WAIT'
  | 'LOAD_ASSETS' | 'WAIT_LOAD'
  | 'POST_SPAWN_FADE_IN' | 'POST_SPAWN_FADE_WAIT'
  | 'CLEANUP_FADE_OUT' | 'CLEANUP_FADE_WAIT'
  | 'SPAWN_SPRITES' | 'INIT_HP_WINDOWS'
  | 'INTRO_TEXT' | 'INTRO_WAIT'
  | 'PLAYER_TURN_PROMPT' | 'PLAYER_TURN_PROMPT_WAIT'
  | 'MOVE_MENU_INIT' | 'MOVE_MENU_INPUT'
  | 'PLAYER_USES_MOVE' | 'PLAYER_USES_MOVE_WAIT'
  | 'PLAYER_DAMAGE_OPP' | 'PLAYER_DAMAGE_OPP_WAIT'
  | 'CHECK_OPP_FAINTED'
  | 'OPP_FAINTED_TEXT' | 'OPP_FAINTED_WAIT'
  | 'EXP_AWARD_TEXT' | 'EXP_AWARD_WAIT'
  | 'LEVEL_UP_TEXT' | 'LEVEL_UP_WAIT'
  | 'OPPONENT_USES_MOVE' | 'OPPONENT_USES_MOVE_WAIT'
  | 'OPPONENT_DAMAGE_PLAYER' | 'OPPONENT_DAMAGE_PLAYER_WAIT'
  | 'CHECK_PLAYER_FAINTED'
  | 'PLAYER_FAINTED_TEXT' | 'PLAYER_FAINTED_WAIT'
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
  let moveMenuWindowId = -1;

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

  const renderHpWindows = (): void => {
    if (oppHpWindowId >= 0 && opponentMon) {
      FillWindowPixelBuffer(oppHpWindowId, 0x11);  // both nibbles = bgColor 1
      AddTextPrinterParameterized3(
        oppHpWindowId, 1, 1, 1, [1, 2, 3], 255 /* TEXT_SKIP_DRAW = sync */,
        `${opponentMon.nickname}\nLv${opponentMon.level} PV:${opponentMon.currentHp}/${opponentMon.maxHp}`,
      );
      // HP bar visuel en bas du text (= y=24 = sous 2 lignes ~10px chacune).
      drawHpBar(oppHpWindowId, 4, 28, opponentMon.currentHp, opponentMon.maxHp);
      CopyWindowToVram(oppHpWindowId, 2);
    }
    if (playerHpWindowId >= 0 && playerMon) {
      FillWindowPixelBuffer(playerHpWindowId, 0x11);
      AddTextPrinterParameterized3(
        playerHpWindowId, 1, 1, 1, [1, 2, 3], 255,
        `${playerMon.nickname}\nLv${playerMon.level} PV:${playerMon.currentHp}/${playerMon.maxHp}`,
      );
      drawHpBar(playerHpWindowId, 4, 28, playerMon.currentHp, playerMon.maxHp);
      CopyWindowToVram(playerHpWindowId, 2);
    }
  };

  /** Refresh the move menu window with the current cursor position drawn as `>`. */
  const refreshMoveMenu = (): void => {
    if (moveMenuWindowId < 0 || !playerMon) return;
    // Clear pixel buffer (= bg color 1, both nibbles).
    FillWindowPixelBuffer(moveMenuWindowId, 0x11);
    const moves = playerMon.moves;
    let menuText = '';
    for (let i = 0; i < 4; i++) {
      const mv = moves[i];
      const arrow = i === moveMenuCursor ? '>' : ' ';
      menuText += arrow + ' ' + (mv ? mv.nameFr.toUpperCase() : '-') + (i < 3 ? '\n' : '');
    }
    AddTextPrinterParameterized3(
      moveMenuWindowId, 1, 0, 1, [1, 2, 3], 255 /* TEXT_SKIP_DRAW = sync */, menuText,
    );
    CopyWindowToVram(moveMenuWindowId, 2);
  };

  /** Init the move menu window with 4 move slots. */
  const initMoveMenu = (): void => {
    if (!playerMon) return;
    if (moveMenuWindowId < 0) moveMenuWindowId = AddWindow(MOVE_MENU_WINDOW);
    DrawStdFrameWithCustomTileAndPalette(moveMenuWindowId, true, 0x214, 14);
    refreshMoveMenu();
  };

  const drawMoveCursor = (): void => {
    refreshMoveMenu();
  };

  const closeMoveMenu = (): void => {
    if (moveMenuWindowId >= 0) {
      ClearStdWindowAndFrame(moveMenuWindowId, true);
      RemoveWindow(moveMenuWindowId);
      moveMenuWindowId = -1;
    }
  };

  /** 1:1 décomp battle_main.c logic : pick opponent's move. MVP = AI_SCRIPT_FIRST_BATTLE
   *  always uses move 0 (= Tackle). Real décomp at LV 2 Zigzagoon learnset is
   *  [Tackle, Tail Whip] — we already pick those via createPokemonInstance. */
  const pickOpponentMove = (): number => {
    if (!opponentMon || opponentMon.moves.length === 0) return 0;
    // Prefer first damaging move (= power > 0). Tutorial AI is dumb.
    for (let i = 0; i < opponentMon.moves.length; i++) {
      const mv = getMove('MOVE_' + opponentMon.moves[i].id.toUpperCase());
      if (mv && mv.power > 0) return i;
    }
    return 0;
  };

  /** Apply chosen move's damage from attacker to defender. Returns damage dealt + effectiveness mul.
   *
   *  Si flag global `__USE_BYTECODE_FOR_DAMAGE__` est set (= localStorage ou
   *  window var), on route via le bytecode interpreter 1:1 décomp (= 639/639
   *  scripts validés). Sinon, formule simplifiée ad-hoc (= legacy tutorial).
   *
   *  Pour activer : localStorage.setItem('__USE_BYTECODE_FOR_DAMAGE__', '1')
   *  puis reload, OU window.__USE_BYTECODE_FOR_DAMAGE__ = true (no reload). */
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
        return { damage: result.damage, typeMul: result.typeMul };
      }
      console.warn('[battle-flow] bytecode route failed:', result.reason, '— fallback to ad-hoc formula');
      // fall through to ad-hoc fallback.
    }

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

  const tick = (): boolean => {
    const rt = getRuntime();
    if (!rt) return false;

    // Tick shake animation (= run regardless of state, so shake survives
    // text waits + transitions).
    tickShake();

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
        // Bug 5e session 124 : fade-out screen → black avant load battle assets.
        // 1:1 décomp `CB2_StartFirstBattle` chain via BattleStartTransition.
        // Notre version simplifiée : BeginNormalPaletteFade to black.
        rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 0, 16, 'RGB_BLACK');
        state = 'INIT_FADE_WAIT';
        return false;
      }

      case 'INIT_FADE_WAIT': {
        // Wait fade-out complete avant load assets.
        if (!rt.gPaletteFade.active) {
          state = 'LOAD_ASSETS';
        }
        return false;
      }

      case 'LOAD_ASSETS': {
        if (!loadStarted && playerMon && opponentMon) {
          loadStarted = true;
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
        HideBg(1);
        HideBg(2);
        HideBg(3);
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
        // Bug 5e session 124 : fade-IN to reveal battle après spawn sprites.
        state = 'POST_SPAWN_FADE_IN';
        return false;
      }

      case 'POST_SPAWN_FADE_IN': {
        // Trigger fade-in (= from black to color).
        rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 0, 'RGB_BLACK');
        state = 'POST_SPAWN_FADE_WAIT';
        return false;
      }

      case 'POST_SPAWN_FADE_WAIT': {
        if (!rt.gPaletteFade.active) {
          state = 'INIT_HP_WINDOWS';
        }
        return false;
      }

      case 'INIT_HP_WINDOWS': {
        oppHpWindowId    = AddWindow(OPPONENT_HP_WINDOW);
        playerHpWindowId = AddWindow(PLAYER_HP_WINDOW);
        DrawStdFrameWithCustomTileAndPalette(oppHpWindowId, true, 0x214, 14);
        DrawStdFrameWithCustomTileAndPalette(playerHpWindowId, true, 0x214, 14);
        renderHpWindows();
        state = 'INTRO_TEXT';
        return false;
      }

      case 'INTRO_TEXT': {
        if (!opponentMon) { state = 'CLEANUP'; return false; }
        ShowFieldMessage(`Un ${opponentMon.nickname} sauvage\napparaît!`);
        // Iter18 : play opponent cry on appear (= 1:1 décomp behavior).
        void import('./music').then(({ playCry }) => {
          playCry(opponentMon!.nickname);
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
            playCry(playerMon!.nickname);
          });
        }
        ShowFieldMessage(`Que doit faire\n${playerMon.nickname}?`);
        state = 'PLAYER_TURN_PROMPT_WAIT';
        return false;
      }

      case 'PLAYER_TURN_PROMPT_WAIT': {
        if (IsFieldMessageBoxHidden()) {
          state = 'MOVE_MENU_INIT';
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
        // Hide opponent sprite.
        if (opponentSpriteId >= 0) {
          const s = rt.gSprites.get(opponentSpriteId);
          if (s) s.invisible = true;
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
        const mv = opponentMon.moves[oppMoveIdx];
        const moveName = mv?.nameFr.toUpperCase() ?? '?';
        ShowFieldMessage(`Le ${opponentMon.nickname} sauvage\nutilise ${moveName}!`);
        // Stash for next state.
        chosenMoveIndex = oppMoveIdx;  // reuse var (= opp move idx now)
        state = 'OPPONENT_USES_MOVE_WAIT';
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
          // Loop back : ask player for next move.
          state = 'PLAYER_TURN_PROMPT';
        }
        return false;
      }

      case 'PLAYER_FAINTED_TEXT': {
        if (!playerMon) { state = 'CLEANUP'; return false; }
        ShowFieldMessage(`${playerMon.nickname} est K.O.!`);
        outcome = BATTLE_OUTCOME_LOST;
        state = 'PLAYER_FAINTED_WAIT';
        if (playerSpriteId >= 0) {
          const s = rt.gSprites.get(playerSpriteId);
          if (s) s.invisible = true;
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
        closeMoveMenu();
        // Iter16 : restore overworld BGs after battle.
        ShowBg(1);
        ShowBg(2);
        ShowBg(3);
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
        state = 'DONE';
        return false;
      }

      case 'DONE':
        return true;
    }
    return false;
  };

  return {
    tick,
    getState: () => state,
  };
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
