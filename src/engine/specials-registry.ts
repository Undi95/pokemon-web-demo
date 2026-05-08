/**
 * specials-registry.ts — Registry des specials scripts (= 1:1 décomp `gSpecials[]`).
 *
 * Source de vérité (1:1 décomp) :
 *   - `data/specials.inc` (= 527 def_special entries)
 *   - `src/scrcmd.c:118-132` (= ScrCmd_special / ScrCmd_specialvar dispatch)
 *
 * Architecture :
 *   - Décomp utilise `gSpecials[index]()` indexé par SPECIAL_xxx (= u16).
 *   - Notre impl utilise `registerSpecial(name, handler)` via string name. Les
 *     scripts JSON pré-extraits ont les noms (= e.g. "HealPlayerParty"), pas
 *     d'index numérique nécessaire.
 *   - Handler peut return `number | void`. Si return un nombre, opcode
 *     `specialvar` le store dans une variable.
 *
 * Quand register un nouveau special :
 *   - Si side-effect uniquement (= e.g. heal party) → return void.
 *   - Si retourne valeur read par script (= e.g. GetBattleOutcome) → return number.
 *   - Si pas encore implémenté → stub safe : `() => 0` (= fait scripts continuer
 *     sans crash, log warning vu `_invokeSpecial`).
 *
 * Phase 4.9 first cut : stubs minimaux pour scripts Bourg-en-Vol (= Mom dialogue,
 * Birch intro). À étendre au fur et à mesure quand on touche d'autres flows.
 *
 * NB : ce module a un side-effect au load (= registerSpecial calls). Doit être
 * importé une fois au boot (= TestOverworldScene ou main entry).
 */

import { registerSpecial } from './script-opcodes';

// ─── Phase 4.9 stubs minimaux (= early-game specials) ──────────────────────

/** 1:1 décomp `GetPlayerBigGuyGirlString` (string_util.c).
 *  Set un string buffer player gender → "BIG GUY" / "GIRL" pour expand
 *  dans dialogues. Stub : no-op (= dialogue placeholder reste tel quel). */
registerSpecial('GetPlayerBigGuyGirlString', () => {
  // TODO Phase 4.10 : set sStringVar1 = "BIG GUY" / "GIRL" via gender check.
});

/** 1:1 décomp `BufferBigGuyOrBigGirlString` similar. */
registerSpecial('BufferBigGuyOrBigGirlString', () => {
  // TODO Phase 4.10
});

/** 1:1 décomp `HealPlayerParty` (party_menu.c).
 *  Restore HP/PP de tous les Pokemon du joueur + réveille les KO. Used par les
 *  Pokemon Center NPCs + après défaite trainer. Stub no-op (= pas encore de
 *  party state à manipuler). */
registerSpecial('HealPlayerParty', () => {
  // TODO Phase 5+ : iter gPlayerParty, set HP=maxHP, status=0.
});

/** 1:1 décomp `ChooseStarter` (script_pokemon_util.c).
 *  Fire l'intro cinematic Birch starter selection. Stub no-op pour
 *  Phase 4.9 (= player skip-spawn directly). */
registerSpecial('ChooseStarter', () => {
  // TODO Phase 5+ : trigger starter selection cinematic + give Pokemon.
});

/** 1:1 décomp `BedroomPC` (mail.c).
 *  Open le PC interface. Stub no-op (= no PC UI yet). */
registerSpecial('BedroomPC', () => {
  // TODO Phase 6+ : open PC menu interface.
});

/** 1:1 décomp `GetBattleOutcome` (battle_util.c).
 *  Returns gBattleOutcome (= win/lose/run/draw). Stub return 1 (= WIN par
 *  défaut, fait progresser scripts post-battle sans crasher). */
registerSpecial('GetBattleOutcome', () => {
  return 1;  // BATTLE_OUTCOME_WIN
});

/** 1:1 décomp `CalculatePlayerPartyCount` (pokemon_util.c).
 *  Returns gPlayerPartyCount. Stub return 0 (= no party yet). */
registerSpecial('CalculatePlayerPartyCount', () => {
  return 0;
});

/** 1:1 décomp `ShouldTryRematchBattle` (rematch_setup.c).
 *  Returns TRUE si trainer rematch available. Stub return 0 (= pas de rematch). */
registerSpecial('ShouldTryRematchBattle', () => {
  return 0;
});

/** 1:1 décomp `IsEnoughForCostInVar0x8005` (field_specials.c).
 *  Check si player a assez d'argent. Stub return 0 (= pas assez). */
registerSpecial('IsEnoughForCostInVar0x8005', () => {
  return 0;
});

/** 1:1 décomp `SetCableClubWarp` / `DoCableClubWarp` (cable_club.c).
 *  Multiplayer link warp. Stubs no-op. */
registerSpecial('SetCableClubWarp', () => { /* no-op stub */ });
registerSpecial('DoCableClubWarp', () => { /* no-op stub */ });

/** Boot marker — confirme que le registry a été importé au boot.
 *  Utilisé par debug pour vérifier que le module est loaded. */
console.log('[specials-registry] loaded — 11 stubs registered (Phase 4.9 minimal)');
