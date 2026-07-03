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
import { EnableNationalPokedex } from '../../src/event_data';

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

function _cheat_money(amount = 10000): void {
  const sb1 = gSaveBlock1Ptr as { money?: number };
  sb1.money = Math.min(999999, (sb1.money ?? 0) + amount);   // cap 1:1 MAX_MONEY
  console.log(`[cheat] Money → ${sb1.money}₽`);
}

function _cheat_nationalDex(): void {
  EnableNationalPokedex();   // 1:1 event_data.c:63 (magic + var + flag + mode)
  console.log('[cheat] Dex National activé');
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
    money: _cheat_money,
    nationalDex: _cheat_nationalDex,
    resetSave: _cheat_resetSave,
  };
}
