/**
 * game-state.ts — DEBUG compat wrapper minimal.
 *
 * **NON-1:1 décomp** : le décomp ne contient PAS de class GameState. Il
 * utilise `gSaveBlock1Ptr` + `gSaveBlock2Ptr` (globals) + helpers (FlagSet/
 * VarSet/etc) direct.
 *
 * Ce module fournit un **proxy minimaliste de debug** (= `window.gameState`)
 * qui delegate vers les helpers 1:1. Tous les anciens code paths qui utilisaient
 * `gameState.X` ont été migrés vers les helpers 1:1 directs. Ce module reste
 * uniquement pour :
 *   - Back-compat `window.gameState` debug expose (= dev console convenience).
 *   - Le cheat object (= side-effect import dev-cheat.ts).
 *   - Re-export `SetSaveLocked/IsSaveLocked` + `emptyBag` + `PokemonOptions`
 *     type + `DEFAULT_OPTIONS` + `TEXT_SPEED_FRAME_DELAYS` constants pour les
 *     callers existants (= migration future les déplacera vers leurs modules
 *     1:1 respectifs).
 *
 * Les accessors `gameState.X` dans le code engine ont été MIGRÉS vers helpers
 * 1:1 dans les sessions 2026-05-23. **NE PAS ajouter de nouveau call à
 * `gameState.X` dans le code engine** — utiliser les helpers 1:1 directs :
 *   gSaveBlock1Ptr, gSaveBlock2Ptr, FlagSet/Get, VarSet/Get, GetCurrentMap,
 *   GetDynamicWarp, SaveGame, GiveMonToPlayer, etc.
 */

import type { PokemonInstance } from './pokemon';
import { type Bag, type ItemSlot, emptyBag } from './bag';
import {
  LoadGameSave, TrySavingData, SaveGame, ResetSaveBlocks, HasValidSave,
  IsSaveLocked, SAVE_STATUS_OK,
} from './save-system';
import { SetCurrentMapLocation, GetCurrentMap, SetCurrentMap } from './load_save';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './save-block-state';
import { FlagSet, FlagClear, FlagGet, VarSet, VarGet } from './script-vars';
import { GetDynamicWarp, SetDynamicWarp } from './warp-system';
import { GetObjectXY, SetObjectXY, GetTakenItemBalls } from './web-overlays';
import { GiveMonToPlayer } from './pokemon';
// Side-effect import : installe `window.cheat` pour debug console.
import './dev-cheat';

// ─── PokemonOptions type + constants (1:1 décomp `struct OptionsRecord`) ────

/** 1:1 décomp `gSaveBlock2Ptr->options*` fields composite. */
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

/** 1:1 décomp `menu.c:77 sTextSpeedFrameDelays = {8, 4, 1}`. */
export const TEXT_SPEED_FRAME_DELAYS = [8, 4, 1] as const;

// Re-exports back-compat.
export { SetSaveLocked, IsSaveLocked } from './save-system';
export { emptyBag };

// ─── Debug compat object (`window.gameState`) ────────────────────────────────

/** Proxy minimaliste delegant vers les helpers 1:1. Permet de garder
 *  `window.gameState.bag / .playerName / etc` fonctionnel dans la console
 *  browser pour debugging. **Ne pas utiliser dans le code engine** — migrer
 *  les callers vers les helpers 1:1 directs. */
export const gameState = {
  // Save flow (= 1:1 helpers).
  load: (): boolean => LoadGameSave() === SAVE_STATUS_OK,
  save: (): void => { void SaveGame(); },
  reset: (): void => ResetSaveBlocks(),
  hasPersistedSave: (): boolean => HasValidSave(),
  setCurrentMapLocation: (mapId: string, x: number, y: number, warpId = -1): void =>
    SetCurrentMapLocation(mapId, x, y, warpId),

  // Flags + vars (= 1:1 event_data.c).
  setFlag: (name: string): void => FlagSet(name),
  clearFlag: (name: string): void => FlagClear(name),
  hasFlag: (name: string): boolean => FlagGet(name),
  setVar: (name: string, value: number): void => VarSet(name, value),
  getVar: (name: string): number => VarGet(name),

  // Identity (= gSaveBlock2Ptr fields).
  get playerName(): string { return gSaveBlock2Ptr.playerName ?? 'UNDI'; },
  set playerName(v: string) { gSaveBlock2Ptr.playerName = v; },
  get gender(): 'MALE' | 'FEMALE' {
    return gSaveBlock2Ptr.playerGender === 1 ? 'FEMALE' : 'MALE';
  },
  set gender(v: 'MALE' | 'FEMALE') {
    gSaveBlock2Ptr.playerGender = v === 'FEMALE' ? 1 : 0;
  },
  get trainerId(): number { return gSaveBlock2Ptr.playerTrainerId ?? 0; },
  setTrainerId: (value: number): void => {
    gSaveBlock2Ptr.playerTrainerId = value >>> 0;
  },

  // Map composite (= GetCurrentMap/SetCurrentMap helpers).
  get map(): { name: string; x: number; y: number; facing?: number } | undefined {
    return GetCurrentMap();
  },
  set map(v: { name: string; x: number; y: number; facing?: number } | undefined) {
    SetCurrentMap(v);
  },

  // Dynamic warp + respawn.
  setDynamicWarp: (mapId: string, x: number, y: number): void => SetDynamicWarp(mapId, x, y),
  get dynamicWarp(): { mapId: string; x: number; y: number } | undefined {
    return GetDynamicWarp();
  },
  setRespawn: (loc: string): void => { gSaveBlock1Ptr.respawnLocation = loc; },
  get respawn(): string | undefined { return gSaveBlock1Ptr.respawnLocation; },

  // Party (= gSaveBlock1Ptr fields + GiveMonToPlayer 1:1 décomp).
  get party(): PokemonInstance[] { return gSaveBlock1Ptr.playerParty; },
  get partySize(): number { return gSaveBlock1Ptr.playerPartyCount; },
  get lead(): PokemonInstance | undefined { return gSaveBlock1Ptr.playerParty[0]; },
  addToParty: (mon: PokemonInstance): boolean => GiveMonToPlayer(mon) === 0,

  // Bag composite virtuel (= gSaveBlock1Ptr.bagPocket_* fields séparés). */
  get bag(): Bag {
    const b1 = gSaveBlock1Ptr as unknown as Record<string, ItemSlot[]>;
    return {
      items: b1.bagPocket_Items ?? [],
      keyItems: b1.bagPocket_KeyItems ?? [],
      pokeBalls: b1.bagPocket_PokeBalls ?? [],
      tmHm: b1.bagPocket_TMHM ?? [],
      berries: b1.bagPocket_Berries ?? [],
    };
  },

  // PC items.
  get pcItems(): ItemSlot[] { return gSaveBlock1Ptr.pcItems; },

  // Options composite (= gSaveBlock2Ptr.options* fields).
  get options(): PokemonOptions {
    return {
      textSpeed: gSaveBlock2Ptr.optionsTextSpeed ?? 0,
      battleSceneOff: gSaveBlock2Ptr.optionsBattleSceneOff ?? 0,
      battleStyle: gSaveBlock2Ptr.optionsBattleStyle ?? 0,
      sound: gSaveBlock2Ptr.optionsSound ?? 0,
      buttonMode: gSaveBlock2Ptr.optionsButtonMode ?? 0,
      windowFrameType: gSaveBlock2Ptr.optionsWindowFrameType ?? 0,
    };
  },
  setOptions: (opts: Partial<PokemonOptions>): void => {
    if (opts.textSpeed !== undefined) gSaveBlock2Ptr.optionsTextSpeed = opts.textSpeed;
    if (opts.battleSceneOff !== undefined) gSaveBlock2Ptr.optionsBattleSceneOff = opts.battleSceneOff;
    if (opts.battleStyle !== undefined) gSaveBlock2Ptr.optionsBattleStyle = opts.battleStyle;
    if (opts.sound !== undefined) gSaveBlock2Ptr.optionsSound = opts.sound;
    if (opts.buttonMode !== undefined) gSaveBlock2Ptr.optionsButtonMode = opts.buttonMode;
    if (opts.windowFrameType !== undefined) gSaveBlock2Ptr.optionsWindowFrameType = opts.windowFrameType;
  },
  getTextSpeedFrameDelay: (): number => {
    const idx = Math.max(0, Math.min(2, gSaveBlock2Ptr.optionsTextSpeed ?? 0));
    return TEXT_SPEED_FRAME_DELAYS[idx];
  },

  // Object positions + taken item balls (= web-overlays).
  setObjectXY: (mapName: string, localId: string, x: number, y: number): void =>
    SetObjectXY(mapName, localId, x, y),
  getObjectXY: (mapName: string, localId: string): { x: number; y: number } | undefined =>
    GetObjectXY(mapName, localId),
  get takenItemBalls(): { has: (label: string) => boolean; add: (label: string) => void } {
    return GetTakenItemBalls();
  },

  // Reset for new game (= composite).
  resetForNewGame: (gender: 'MALE' | 'FEMALE', playerName: string): void => {
    ResetSaveBlocks();
    gSaveBlock2Ptr.playerGender = gender === 'FEMALE' ? 1 : 0;
    gSaveBlock2Ptr.playerName = playerName;
    void SaveGame();
  },

  // Heal helper (= 1:1 décomp HealPlayerParty inline).
  healAllParty: (): void => {
    for (const m of gSaveBlock1Ptr.playerParty as PokemonInstance[]) {
      m.currentHp = m.maxHp;
      m.status = null;
      for (const mv of m.moves) mv.pp = mv.ppMax;
    }
  },

  // Debug helpers.
  getAllFlagNames: (): string[] => Object.keys(gSaveBlock1Ptr.flags),
  getAllVars: (): Record<string, number> => ({ ...gSaveBlock1Ptr.vars }),
};

// Élimine warning unused var `TrySavingData` (= import preservé pour back-compat).
void TrySavingData;

// ─── Debug exposure ─────────────────────────────────────────────────────────
// `window.gameState` accessible depuis console browser pour debugging.
// Le `window.cheat` est installed par `dev-cheat.ts` (side-effect import).
if (typeof window !== 'undefined') {
  (window as unknown as { gameState: typeof gameState }).gameState = gameState;
}
