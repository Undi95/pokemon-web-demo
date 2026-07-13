/**
 * dev-damage-probe.ts — banc de test DÉTERMINISTE du calcul de dégâts (dev, hors 1:1).
 *
 * Pourquoi : diagnostiquer « Arcko Lv12 encaisse Surf de Léviator Lv100 » (dégâts ~15× trop
 * faibles) SANS piloter un combat live (l'onglet de test est throttlé en arrière-plan → 0-10 fps,
 * impilotable). Ici on pose la scène EN DUR (attaquant/défenseur depuis la party ?debug + globals
 * single-battle sains) et on déroule le VRAI pipeline (runDamagecalc → crit/dmgMult → TypecalcImpl
 * → ApplyRandomDmgMultiplier), en logguant chaque intermédiaire. Verdict :
 *   - résultat ~correct (~300-400) → le CODE est bon ; le bug d'un vrai combat = une VALEUR d'état
 *     posée de travers PENDANT le combat (statStage / dmgMultiplier / crit) → à traquer côté état.
 *   - résultat ~24 avec des inputs sains → bug DANS le pipeline (visible ici, étape par étape).
 *
 * Usage console (après boot ?debug) :
 *   __testDamage(2, 0, 57)   // attaquant = party slot 2 (Léviator), Surf (move 57), cible = slot 0 (Arcko)
 */
import { fillBattleMonFromParty } from '../../src/engine/battle/party-storage';
import { runDamagecalc } from '../../src/pokemon';
import { TypecalcImpl, ApplyRandomDmgMultiplier } from '../../src/battle_script_commands';
import {
  gBattleMons, gBattleScripting, gBattleMoveDamage,
  setBattlerAttacker, setBattlerTarget, setCurrentMove, setBattleMoveDamage,
  setCritMultiplier, setBattleTypeFlags, setBattleWeather,
  setDynamicBasePower, setDynamicMoveType,
} from '../../src/engine/battle/state';

interface StatSnap {
  species: number; level: number; hp: number; maxHP: number;
  attack: number; defense: number; spAttack: number; spDefense: number;
  type1: number; type2: number; ability: number; statStages: number[];
}

function _snap(b: number): StatSnap | null {
  const m = gBattleMons[b];
  if (!m) return null;
  return {
    species: m.species, level: m.level, hp: m.hp, maxHP: m.maxHP,
    attack: m.attack, defense: m.defense, spAttack: m.spAttack, spDefense: m.spDefense,
    type1: m.type1, type2: m.type2, ability: m.ability,
    statStages: Array.isArray(m.statStages) ? [...m.statStages] : [],
  };
}

/** Calcule les dégâts d'un move (attaquant/défenseur = slots de la party joueur) sans combat.
 *  Retourne le détail étape par étape pour localiser toute perte anormale. */
function testDamage(atkIdx = 2, defIdx = 0, moveId = 57, typeFlags = 0): Record<string, unknown> {
  // 1. Attaquant → battler 0, défenseur → battler 1 (depuis gPlayerParty).
  fillBattleMonFromParty(0, 'player', atkIdx);
  fillBattleMonFromParty(1, 'player', defIdx);

  // 2. Scène saine (pas de crit, pas de météo, pas de puissance dynamique).
  //    typeFlags = 0 (single) par défaut ; passer 1 (BATTLE_TYPE_DOUBLE) pour tester la zone.
  setBattlerAttacker(0);
  setBattlerTarget(1);
  setCurrentMove(moveId);
  setCritMultiplier(1);
  setBattleTypeFlags(typeFlags);
  setBattleWeather(0);
  setDynamicBasePower(0);
  setDynamicMoveType(0);
  setBattleMoveDamage(0);
  gBattleScripting.dmgMultiplier = 1;

  const atk = _snap(0);
  const def = _snap(1);

  // 3. Déroulé du VRAI pipeline, étape par étape.
  const base = runDamagecalc(0, 0, 0);                                 // CalculateBaseDamage (pré-crit)
  const afterCritDmgMult = base * 1 /* gCritMultiplier */ * gBattleScripting.dmgMultiplier; // Cmd_damagecalc
  setBattleMoveDamage(afterCritDmgMult);
  TypecalcImpl();                                                       // STAB + efficacité de type
  const afterStabType = gBattleMoveDamage;                             // live binding (state.ts)
  ApplyRandomDmgMultiplier();                                           // ×(100-rand%16)/100
  const final = gBattleMoveDamage;

  const out = {
    atk, def,
    moveId,
    base, afterCritDmgMult, afterStabType, final,
    dmgMultiplier: gBattleScripting.dmgMultiplier,
  };
  console.log('[testDamage]', JSON.stringify(out));
  return out;
}

(globalThis as Record<string, unknown>).__testDamage = testDamage;
