/**
 * dev-cheat.ts — Cheat object exposé sur `window.cheat` pour debug.
 *
 * Pas 1:1 décomp — pure debug feature web port. Permet de skip l'intro,
 * heal la party, reset la save depuis la console browser.
 *
 * Helpers utilisés : 1:1 décomp direct (FlagSet, VarSet, GiveMonToPlayer,
 * SaveGame, ResetSaveBlocks, gSaveBlock1Ptr.playerParty).
 */

import { FlagSet, VarSet } from '../../src/engine/script/script-vars';
import { SaveGame, ResetSaveBlocks } from '../../src/save';
import { gSaveBlock1Ptr } from '../../src/engine/save/save-block-state';
import { MonRestorePP, type Pokemon } from '../../src/engine/battle/party-storage';

// ─── Cheat helpers (= dev convenience) ───────────────────────────────────────

function _cheat_skipIntro(): void {
  VarSet('VAR_LITTLEROOT_INTRO_STATE', 6);
  VarSet('VAR_LITTLEROOT_TOWN_STATE', 4);
  VarSet('VAR_BIRCH_LAB_STATE', 4);
  FlagSet('FLAG_RECEIVED_POKEDEX_FROM_BIRCH');
  FlagSet('FLAG_RECEIVED_POKEMON_FROM_BIRCH');
  FlagSet('FLAG_ADVENTURE_STARTED');
  FlagSet('FLAG_RESCUED_BIRCH');
  FlagSet('FLAG_SET_WALL_CLOCK');
  void SaveGame();
  console.log('[cheat] Intro skipped');
}

function _cheat_heal(): void {
  // 1:1 décomp HealPlayerParty (script_pokemon_util.c) : restore HP + PP +
  // status pour tous les mons de gPlayerParty.
  for (const m of (gSaveBlock1Ptr.playerParty as Pokemon[])) {
    if (!m.species) continue;
    m.hp = m.maxHP;
    m.status = 0;
    MonRestorePP(m);  // 1:1 décomp : restaure le PP de chaque move au max
  }
  console.log('[cheat] Party healed');
}

function _cheat_resetSave(): void {
  ResetSaveBlocks();
  void SaveGame();
  console.log('[cheat] Save reset');
}

// ─── Install on window ───────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  (window as unknown as { cheat: Record<string, unknown> }).cheat = {
    skipIntro: _cheat_skipIntro,
    heal: _cheat_heal,
    resetSave: _cheat_resetSave,
  };
}
