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
import { gameState } from './game-state';
import { setStringVar } from './string-buffers';

// ─── Phase 4.9 stubs minimaux (= early-game specials) ──────────────────────

/** 1:1 décomp `GetPlayerBigGuyGirlString` (string_util.c).
 *  Set sStringVar1 = "GRAND" (MALE) ou "GRANDE" (FEMALE) pour expand le
 *  placeholder {STR_VAR_1} dans dialogues type "Hum, salut, GRAND/GRANDE !".
 *  Used par e.g. LittlerootTown_Text_CanYouGoSeeWhatsHappening (= Twin NPC). */
registerSpecial('GetPlayerBigGuyGirlString', () => {
  const stringVar = gameState.gender === 'MALE' ? 'GRAND' : 'GRANDE';
  // 1:1 décomp : StringCopy(gStringVar1, gText_BigGuy/gText_BigGirl).
  // Notre version : stocke dans gameState pour expand par dialogue-box.ts.
  setStringVar(1, stringVar);
});

/** 1:1 décomp `BufferBigGuyOrBigGirlString` (string_util.c). Same que
 *  `GetPlayerBigGuyGirlString` mais pour expand dans un autre context. */
registerSpecial('BufferBigGuyOrBigGirlString', () => {
  const stringVar = gameState.gender === 'MALE' ? 'GRAND' : 'GRANDE';
  setStringVar(1, stringVar);
});

/** 1:1 décomp `HealPlayerParty` (party_menu.c:7144) :
 *  ```c
 *  void HealPlayerParty(void) {
 *      u8 i, j;
 *      for (i = 0; i < gPlayerPartyCount; i++) {
 *          u8 ppBonuses = GetMonData(&gPlayerParty[i], MON_DATA_PP_BONUSES);
 *          u16 hp = GetMonData(&gPlayerParty[i], MON_DATA_MAX_HP);
 *          SetMonData(&gPlayerParty[i], MON_DATA_HP, &hp);
 *          // Restore PP
 *          ...
 *          SetMonData(&gPlayerParty[i], MON_DATA_STATUS, &arg);
 *      }
 *  }
 *  ```
 *  Restore HP/PP de tous les Pokemon du joueur + clear status. Used par
 *  Pokemon Center NPCs + après défaite trainer + après ChooseStarter battle. */
registerSpecial('HealPlayerParty', () => {
  for (const mon of gameState.party) {
    if (!mon) continue;
    mon.currentHp = mon.maxHp;
    mon.status = null;
    // Restore PP de chaque move (= 1:1 décomp PpBonuses non implémenté pour
    // MVP, on restore à pp_max sans calcul bonus PP).
    for (const mv of mon.moves) {
      mv.pp = mv.ppMax;
    }
  }
  console.log(`[special HealPlayerParty] healed ${gameState.party.length} mons`);
});

/** 1:1 décomp `ChooseStarter` (battle_setup.c:911) :
 *  ```c
 *  void ChooseStarter(void) {
 *      SetMainCallback2(CB2_ChooseStarter);  // UI 3 pokeballs
 *      gMain.savedCallback = CB2_GiveStarter; // post-UI : give mon + battle
 *  }
 *  ```
 *  Notre impl Phase 3.2 minimum : auto-pick TREECKO (= idx 0) + give level 5
 *  + set VAR_RESULT/VAR_STARTER_MON. La cinematic UI starter selection sera
 *  Phase 5 (= besoin Phaser scene 3 pokeballs + transition). Le combat
 *  tutorial vs Poochyena est aussi Phase 5 (= BattleScene).
 *
 *  IMPORTANT : la script Route 101 fait `special ChooseStarter` SANS
 *  `waitstate` derrière, donc le décomp utilise SetMainCallback2 pour halt
 *  l'overworld (= pas le script). Notre special étant sync, la flow continue
 *  immédiatement → applymovement Birch + dialog. C'est OK pour MVP, plus
 *  rapide en démo (= skip UI). User feedback Phase 5+ pourrait vouloir l'UI. */
// Phase 5.5 : ChooseStarter handled directly in `special` opcode handler
// (= script-opcodes.ts) via state machine in starter-choose-flow.ts. NOT a
// registerSpecial here because we need access to `ctx` to call SetupNativeScript
// (= block script while UI runs). registerSpecial handlers don't have ctx access.

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

/** 1:1 décomp `CalculatePlayerPartyCount` (pokemon_util.c:CalculatePlayerPartyCount).
 *  Returns gPlayerPartyCount (= number of party slots filled, 0..6). */
registerSpecial('CalculatePlayerPartyCount', () => {
  return gameState.partySize;
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
