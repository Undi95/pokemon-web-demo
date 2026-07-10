/**
 * field_poison.ts — miroir 1:1 de `src/field_poison.c` (partie white-out).
 *
 * Source de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/field_poison.c`
 *   - `D:/Projet 1/decomps/pokeemeraude/data/scripts/field_poison.inc`
 *     (EventScript_FieldPoison : lockall → special TryFieldPoisonWhiteOut →
 *      goto_if_eq VAR_RESULT, FLDPSN_WHITEOUT/FLDPSN_FRONTIER_WHITEOUT)
 *
 * Concept :
 *   Quand un mon de l'équipe tombe à 0 PV à cause du poison de terrain (un pas sur
 *   ~4, géré par `DoPoisonFieldEffect` inliné dans `field_control_avatar.ts:
 *   UpdatePoisonStepCounter`), le script `EventScript_FieldPoison` invoque le special
 *   `TryFieldPoisonWhiteOut`. Ce special lance `Task_TryFieldPoisonWhiteOut`, qui :
 *     1. parcourt l'équipe, et pour CHAQUE mon K.O. par poison :
 *        - `FaintFromFieldPoison` : AdjustFriendship(FAINT_FIELD_PSN) + efface le
 *          statut + copie le surnom dans gStringVar1 ;
 *        - affiche « <surnom> est K.O… » (ShowFieldMessage) et attend le bouton ;
 *     2. quand toute l'équipe est passée : pose `VAR_RESULT` (= gSpecialVar_Result) à
 *        FLDPSN_WHITEOUT si TOUTE l'équipe est K.O. (→ EventScript_FieldWhiteOut, déjà
 *        porté), sinon FLDPSN_NO_WHITEOUT, puis ré-active le script et se détruit.
 *
 *  ⚠️ DoPoisonFieldEffect (= dégât du pas) reste inliné dans UpdatePoisonStepCounter
 *  (field_control_avatar.ts) — chemin existant qui marche, non touché ici (zéro dup :
 *  ce module ne le réécrit pas). Déviation 1:1 mineure pré-existante.
 *
 *  ⚠️ Branche Battle Frontier (CurrentBattlePyramidLocation / InBattlePike /
 *  InTrainerHillChallenge → FLDPSN_FRONTIER_WHITEOUT) DÉFÉRÉE : ces sous-systèmes ne
 *  sont pas portés et ne sont pas atteignables en jeu normal (jamais en Frontier →
 *  toujours FLDPSN_WHITEOUT). 1:1-correct pour tout le jeu hors Frontier.
 */

import type { DecompTask } from '../harness/runtime/decomp-runtime';
import { CreateTask, DestroyTask } from './task';
import {
  gPlayerParty,
  AdjustFriendship,
  PARTY_SIZE,
} from './engine/battle/party-storage';
import { STATUS1_POISON, STATUS1_TOXIC_POISON } from './engine/battle/constants';
import { ShowFieldMessage, IsFieldMessageBoxHidden } from './field_message_box';
import { ScriptContext_Stop, ScriptContext_Enable } from './script';
import { VarSet } from './engine/script/script-vars';
import { gStringVar1, StringCopy } from './string_util';
import { encodeOwText } from './text';
import { getString } from '../harness/runtime/decomp-strings';

// ─── Constantes 1:1 décomp ───────────────────────────────────────────────────

/** 1:1 décomp include/constants/pokemon.h:182 `FRIENDSHIP_EVENT_FAINT_FIELD_PSN`. */
const FRIENDSHIP_EVENT_FAINT_FIELD_PSN = 7;

/** 1:1 décomp include/constants/field_poison.h. */
const FLDPSN_NO_WHITEOUT = 0;
const FLDPSN_WHITEOUT = 1;

/** 1:1 décomp include/constants/field_poison.h — codes de retour de DoPoisonFieldEffect. */
const FLDPSN_NONE = 0;
const FLDPSN_PSN = 1;
const FLDPSN_FNT = 2;

// gText_PkmnFainted_FldPsn (strings.c:1190) « {STR_VAR_1} est K.O…\p\n » : tiré de
// getString() au point d'usage (anti-hardcode ; la map strings est peuplée async au boot).

// ─── Helpers 1:1 décomp ──────────────────────────────────────────────────────

/** 1:1 décomp `IsMonValidSpecies(mon)` (field_poison.c:20) : species != SPECIES_NONE
 *  && species != SPECIES_EGG (= MON_DATA_SPECIES_OR_EGG). On lit le struct numérique
 *  (gPlayerParty) directement (= même accès que UpdatePoisonStepCounter). */
function IsMonValidSpecies(partyIdx: number): boolean {
  const mon = gPlayerParty[partyIdx];
  if (!mon) return false;
  if (mon.species === 0 || mon.isEgg) return false;
  return true;
}

/** 1:1 décomp `AllMonsFainted(void)` (field_poison.c:29) : FALSE dès qu'un mon valide
 *  a des PV > 0 ; TRUE si tous les mons valides sont K.O. */
function AllMonsFainted(): boolean {
  for (let i = 0; i < PARTY_SIZE; i++) {
    if (IsMonValidSpecies(i) && gPlayerParty[i].hp !== 0) return false;
  }
  return true;
}

/** 1:1 décomp `FaintFromFieldPoison(partyIdx)` (field_poison.c:42) :
 *    AdjustFriendship(FRIENDSHIP_EVENT_FAINT_FIELD_PSN) ;
 *    SetMonData(MON_DATA_STATUS, STATUS1_NONE) ;
 *    GetMonData(MON_DATA_NICKNAME, gStringVar1) ; StringGet_Nickname(gStringVar1).
 *  Opère sur le struct numérique gPlayerParty (SOURCE, = friendship/status raw). */
function FaintFromFieldPoison(partyIdx: number): void {
  const mon = gPlayerParty[partyIdx];
  AdjustFriendship(mon, FRIENDSHIP_EVENT_FAINT_FIELD_PSN);
  mon.status = 0 /* STATUS1_NONE */;
  // 1:1 : surnom (JS string clean) → gStringVar1 en bytes charmap, pour {STR_VAR_1}.
  StringCopy(gStringVar1, encodeOwText(String(mon.nickname ?? '')));
}

/** 1:1 décomp `MonFaintedFromPoison(partyIdx)` (field_poison.c:51) : mon valide +
 *  PV == 0 + statut poison (AILMENT_PSN ⟺ STATUS1_POISON | STATUS1_TOXIC_POISON). */
function MonFaintedFromPoison(partyIdx: number): boolean {
  const mon = gPlayerParty[partyIdx];
  if (IsMonValidSpecies(partyIdx) && mon.hp === 0
      && ((mon.status >>> 0) & (STATUS1_POISON | STATUS1_TOXIC_POISON))) {
    return true;
  }
  return false;
}

/** 1:1 décomp `DoPoisonFieldEffect(void)` (field_poison.c:120-154) :
 *  ```c
 *  for (i = 0; i < PARTY_SIZE; i++) {
 *      if (GetMonData(MON_DATA_SANITY_HAS_SPECIES) && GetAilmentFromStatus(status) == AILMENT_PSN) {
 *          hp = GetMonData(MON_DATA_HP);
 *          if (hp == 0 || --hp == 0) numFainted++;
 *          SetMonData(MON_DATA_HP, &hp);
 *          numPoisoned++;
 *      }
 *  }
 *  if (numFainted || numPoisoned) FldEffPoison_Start();
 *  if (numFainted) return FLDPSN_FNT;
 *  if (numPoisoned) return FLDPSN_PSN;
 *  return FLDPSN_NONE;
 *  ```
 *  Décrémente 1 PV à chaque mon empoisonné de l'équipe. Appelée par
 *  UpdatePoisonStepCounter (field_control_avatar.c) tous les 4 pas.
 *
 *  ⚠️ Itère gPlayerParty (SOURCE Pokemon numérique : species/status/hp), PAS les
 *  VUES PokemonInstance (status STRING → le check raw échouerait). AILMENT_PSN ⟺
 *  STATUS1_POISON | STATUS1_TOXIC_POISON. Le flash écran FldEffPoison_Start
 *  (= fldeff_misc.c, UI) reste DÉFÉRÉ (non porté). */
export function DoPoisonFieldEffect(): number {
  let numPoisoned = 0;
  let numFainted = 0;
  for (let i = 0; i < PARTY_SIZE; i++) {
    const mon = gPlayerParty[i];
    if (mon && mon.species !== 0
        && ((mon.status >>> 0) & (STATUS1_POISON | STATUS1_TOXIC_POISON))) {
      let hp = mon.hp;
      if (hp === 0 || --hp === 0) numFainted++;
      mon.hp = hp;
      numPoisoned++;
    }
  }
  // 1:1 : FldEffPoison_Start() (flash écran) si numFainted || numPoisoned — DÉFÉRÉ (UI non portée).
  if (numFainted !== 0) return FLDPSN_FNT;
  if (numPoisoned !== 0) return FLDPSN_PSN;
  return FLDPSN_NONE;
}

// ─── Task + special 1:1 décomp ───────────────────────────────────────────────

// data: tState = data[0], tPartyIdx = data[1] (1:1 décomp #define tState/tPartyIdx).
/** 1:1 décomp `Task_TryFieldPoisonWhiteOut(taskId)` (field_poison.c:64). */
function Task_TryFieldPoisonWhiteOut(task: DecompTask): void {
  const data = task.data;
  switch (data[0] /* tState */) {
    case 0:
      // 1:1 : parcourt l'équipe ; au 1er mon K.O. par poison → faint + message.
      for (; data[1] /* tPartyIdx */ < PARTY_SIZE; data[1]++) {
        if (MonFaintedFromPoison(data[1])) {
          FaintFromFieldPoison(data[1]);
          ShowFieldMessage(encodeOwText(getString('gText_PkmnFainted_FldPsn')));
          data[0]++;
          return;
        }
      }
      data[0] = 2; // Finished checking party
      break;
    case 1:
      // 1:1 : attend la fin du message « <mon> est K.O… », puis reprend la boucle.
      if (IsFieldMessageBoxHidden()) data[0]--;
      break;
    case 2:
      // 1:1 : white-out si TOUTE l'équipe est K.O. (sinon NO_WHITEOUT). Branche
      // Frontier (FLDPSN_FRONTIER_WHITEOUT) déférée (non portée, hors jeu normal).
      VarSet('VAR_RESULT', AllMonsFainted() ? FLDPSN_WHITEOUT : FLDPSN_NO_WHITEOUT);
      ScriptContext_Enable();
      DestroyTask(task.taskId);
      break;
  }
}

/** 1:1 décomp `TryFieldPoisonWhiteOut(void)` (field_poison.c:115) :
 *    CreateTask(Task_TryFieldPoisonWhiteOut, 80) ; ScriptContext_Stop().
 *  Appelée par le special du même nom (EventScript_FieldPoison). */
export function TryFieldPoisonWhiteOut(): void {
  CreateTask(Task_TryFieldPoisonWhiteOut, 80);
  ScriptContext_Stop();
}

// Hook globalThis (cycle-safe) consommé par specials-registry — même approche que
// `__RockSmashWildEncounter` (le registry est lourd : import statique risque un cycle).
(globalThis as Record<string, unknown>).__TryFieldPoisonWhiteOut = TryFieldPoisonWhiteOut;
(globalThis as Record<string, unknown>).__DoPoisonFieldEffect = DoPoisonFieldEffect;
