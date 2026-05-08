/**
 * game-state.ts — État global de partie + bridge vers save-system 1:1 décomp.
 *
 * Phase 4.10 refactor (= user request session 121 "vrai système de save 1:1") :
 *   - Données stockées dans SaveBlock1 + SaveBlock2 (= 1:1 décomp global.h).
 *   - Persistence via save-system.ts (= sectors + checksum + slot alternation).
 *   - L'API publique `gameState.flags / vars / bag / playerName / etc.` reste
 *     stable pour tout le code existant — chaque accessor délègue aux blocks.
 *
 * Ancien storage `em_save_v1` (= JSON ad-hoc) migré automatiquement par
 * save-system au 1er load.
 */

import type { PokemonInstance } from './pokemon';
import { type Bag, emptyBag } from './bag';
import {
  GetSaveBlock1, GetSaveBlock2, LoadGameSave, TrySavingData,
  ResetSaveBlocks, HasValidSave,
  SAVE_STATUS_OK,
} from './save-system';

/**
 * Options menu state — 1:1 décomp `gSaveBlock2Ptr->options*`. Backed par
 * SaveBlock2 fields directement.
 */
export interface PokemonOptions {
  textSpeed: number;
  battleSceneOff: number;
  battleStyle: number;
  sound: number;
  buttonMode: number;
  windowFrameType: number;
}

export const DEFAULT_OPTIONS: PokemonOptions = {
  textSpeed: 1, battleSceneOff: 0, battleStyle: 0,
  sound: 0, buttonMode: 0, windowFrameType: 0,
};

/** Frames per char selon textSpeed (cf. menu.c:77 sTextSpeedFrameDelays). */
export const TEXT_SPEED_FRAME_DELAYS = [8, 4, 1] as const;

class GameState {
  load(): boolean {
    const status = LoadGameSave();
    return status === SAVE_STATUS_OK;
  }

  save(): void {
    TrySavingData();
  }

  reset(): void {
    ResetSaveBlocks();
  }

  // ===== Flags ========================================================
  setFlag(name: string): void {
    GetSaveBlock1().flags[name] = true;
  }
  clearFlag(name: string): void {
    delete GetSaveBlock1().flags[name];
  }
  hasFlag(name: string): boolean {
    return !!GetSaveBlock1().flags[name];
  }

  // ===== Vars =========================================================
  setVar(name: string, value: number): void {
    GetSaveBlock1().vars[name] = value & 0xFFFF;
  }
  getVar(name: string): number {
    return GetSaveBlock1().vars[name] ?? 0;
  }

  // ===== Player identity ==============================================
  get playerName(): string { return GetSaveBlock2().playerName ?? 'UNDI'; }
  set playerName(v: string) { GetSaveBlock2().playerName = v; }
  get gender(): 'MALE' | 'FEMALE' {
    return GetSaveBlock2().playerGender === 1 ? 'FEMALE' : 'MALE';
  }
  set gender(v: 'MALE' | 'FEMALE') {
    GetSaveBlock2().playerGender = v === 'FEMALE' ? 1 : 0;
  }
  /** 1:1 décomp `gSaveBlock2Ptr->playerTrainerId` (= u32 trainer ID).
   *  Set par `InitPlayerTrainerId()` au new game (= Random()<<16 | sTrainerId).
   *  Read par CheckPokemonOwnership / Pokemon nickname display / battle UI. */
  get trainerId(): number { return GetSaveBlock2().playerTrainerId ?? 0; }
  setTrainerId(value: number): void {
    GetSaveBlock2().playerTrainerId = value >>> 0;
  }

  // ===== Position / map ===============================================
  /** Position courante. Cf. SaveBlock1.pos + location. */
  get map(): { name: string; x: number; y: number; facing?: number } | undefined {
    const block1 = GetSaveBlock1();
    // continueGameWarp est l'équivalent décomp de "saved map".
    const w = block1.continueGameWarp;
    if (w.warpId === -1 && w.x === -1 && w.y === -1) return undefined;
    // Map name n'est pas stocké directement — on stocke un mapId externe.
    const mapId = (block1 as { __mapId?: string }).__mapId;
    if (!mapId) return undefined;
    return { name: mapId, x: w.x, y: w.y, facing: (block1 as { __facing?: number }).__facing };
  }
  set map(v: { name: string; x: number; y: number; facing?: number } | undefined) {
    const block1 = GetSaveBlock1();
    if (!v) {
      // Clear → set warp invalide pour signal "no saved map".
      block1.continueGameWarp = { mapGroup: -1, mapNum: -1, warpId: -1, x: -1, y: -1 };
      delete (block1 as { __mapId?: string }).__mapId;
      delete (block1 as { __facing?: number }).__facing;
      return;
    }
    block1.continueGameWarp = { mapGroup: 0, mapNum: 0, warpId: 0, x: v.x, y: v.y };
    block1.pos = { x: v.x, y: v.y };
    (block1 as { __mapId?: string }).__mapId = v.name;
    (block1 as { __facing?: number }).__facing = v.facing;
  }

  // ===== Dynamic warp + respawn =======================================
  setDynamicWarp(mapId: string, x: number, y: number): void {
    const block1 = GetSaveBlock1();
    block1.dynamicWarp = { mapGroup: 0, mapNum: 0, warpId: -1, x, y };
    (block1 as { __dynamicWarpMapId?: string }).__dynamicWarpMapId = mapId;
  }
  get dynamicWarp(): { mapId: string; x: number; y: number } | undefined {
    const block1 = GetSaveBlock1();
    const w = block1.dynamicWarp;
    const mapId = (block1 as { __dynamicWarpMapId?: string }).__dynamicWarpMapId;
    if (!mapId) return undefined;
    return { mapId, x: w.x, y: w.y };
  }
  setRespawn(loc: string): void {
    GetSaveBlock1().respawnLocation = loc;
  }
  get respawn(): string | undefined {
    return GetSaveBlock1().respawnLocation;
  }

  // ===== Party ========================================================
  get party(): PokemonInstance[] {
    return GetSaveBlock1().playerParty;
  }
  get partySize(): number {
    return GetSaveBlock1().playerParty.length;
  }
  get lead(): PokemonInstance | undefined {
    return GetSaveBlock1().playerParty[0];
  }
  addToParty(mon: PokemonInstance): boolean {
    const party = GetSaveBlock1().playerParty;
    if (party.length >= 6) return false;
    party.push(mon);
    GetSaveBlock1().playerPartyCount = party.length;
    return true;
  }

  // ===== Bag ==========================================================
  get bag(): Bag {
    return GetSaveBlock1().bag;
  }

  // ===== Options ======================================================
  get options(): PokemonOptions {
    const b2 = GetSaveBlock2();
    return {
      textSpeed: b2.optionsTextSpeed,
      battleSceneOff: b2.optionsBattleSceneOff,
      battleStyle: b2.optionsBattleStyle,
      sound: b2.optionsSound,
      buttonMode: b2.optionsButtonMode,
      windowFrameType: b2.optionsWindowFrameType,
    };
  }
  setOptions(opts: Partial<PokemonOptions>): void {
    const b2 = GetSaveBlock2();
    if (opts.textSpeed !== undefined) b2.optionsTextSpeed = opts.textSpeed;
    if (opts.battleSceneOff !== undefined) b2.optionsBattleSceneOff = opts.battleSceneOff;
    if (opts.battleStyle !== undefined) b2.optionsBattleStyle = opts.battleStyle;
    if (opts.sound !== undefined) b2.optionsSound = opts.sound;
    if (opts.buttonMode !== undefined) b2.optionsButtonMode = opts.buttonMode;
    if (opts.windowFrameType !== undefined) b2.optionsWindowFrameType = opts.windowFrameType;
  }
  getTextSpeedFrameDelay(): number {
    const idx = Math.max(0, Math.min(2, this.options.textSpeed));
    return TEXT_SPEED_FRAME_DELAYS[idx];
  }

  // ===== Object positions (= setobjectxyperm overlay) ================
  setObjectXY(mapName: string, localId: string, x: number, y: number): void {
    const block1 = GetSaveBlock1() as { __objectPositions?: Record<string, Record<string, { x: number; y: number }>> };
    if (!block1.__objectPositions) block1.__objectPositions = {};
    if (!block1.__objectPositions[mapName]) block1.__objectPositions[mapName] = {};
    block1.__objectPositions[mapName][localId] = { x, y };
  }
  getObjectXY(mapName: string, localId: string): { x: number; y: number } | undefined {
    const block1 = GetSaveBlock1() as { __objectPositions?: Record<string, Record<string, { x: number; y: number }>> };
    return block1.__objectPositions?.[mapName]?.[localId];
  }

  // ===== Item balls already taken =====================================
  get takenItemBalls(): { has: (label: string) => boolean; add: (label: string) => void } {
    const block1 = GetSaveBlock1() as { __takenItemBalls?: string[] };
    if (!block1.__takenItemBalls) block1.__takenItemBalls = [];
    const arr = block1.__takenItemBalls;
    return {
      has: (label) => arr.includes(label),
      add: (label) => { if (!arr.includes(label)) arr.push(label); },
    };
  }

  // ===== Reset for new game ===========================================
  resetForNewGame(gender: 'MALE' | 'FEMALE', playerName: string): void {
    this.reset();
    this.gender = gender;
    this.playerName = playerName;
    this.save();
  }

  // ===== Heal =========================================================
  healAllParty(): void {
    for (const m of GetSaveBlock1().playerParty) {
      m.currentHp = m.maxHp;
      m.status = null;
      for (const mv of m.moves) mv.pp = mv.ppMax;
    }
  }

  // ===== Save existence check =========================================
  hasPersistedSave(): boolean {
    return HasValidSave();
  }

  // ===== Debug helpers ================================================
  getAllFlagNames(): string[] {
    return Object.keys(GetSaveBlock1().flags);
  }
  getAllVars(): Record<string, number> {
    return { ...GetSaveBlock1().vars };
  }
}

export const gameState = new GameState();

// ===== Debug helpers exposés en window pour console =====
if (typeof window !== 'undefined') {
  (window as unknown as { gameState: GameState }).gameState = gameState;
  (window as unknown as { cheat: Record<string, unknown> }).cheat = {
    skipIntro: () => {
      gameState.setVar('VAR_LITTLEROOT_INTRO_STATE', 6);
      gameState.setVar('VAR_LITTLEROOT_TOWN_STATE', 4);
      gameState.setVar('VAR_BIRCH_LAB_STATE', 4);
      gameState.setFlag('FLAG_RECEIVED_POKEDEX_FROM_BIRCH');
      gameState.setFlag('FLAG_RECEIVED_POKEMON_FROM_BIRCH');
      gameState.setFlag('FLAG_ADVENTURE_STARTED');
      gameState.setFlag('FLAG_RESCUED_BIRCH');
      gameState.setFlag('FLAG_SET_WALL_CLOCK');
      gameState.save();
      console.log('[cheat] Intro skipped');
    },
    heal: () => { gameState.healAllParty(); console.log('[cheat] Party healed'); },
    resetSave: () => { gameState.reset(); gameState.save(); console.log('[cheat] Save reset'); },
  };
}

// Helper exposed for empty bag (= used by save-blocks emptySaveBlock1).
export { emptyBag };
