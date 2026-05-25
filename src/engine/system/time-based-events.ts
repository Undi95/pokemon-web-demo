/**
 * time-based-events.ts — 1:1 décomp `src/berry.c:BerryTreeTimeUpdate` +
 * `src/overworld.c:DoTimeBasedEvents`.
 *
 * Source de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/berry.c:1076-1112` (BerryTreeTimeUpdate)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/overworld.c:DoTimeBasedEvents`
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/berry.h` (BERRY_STAGE_*)
 *
 * Concept :
 *   Tous les berries trees ont un timer `minutesUntilNextStage`. Au step 256
 *   intervals OU au script-driven `dotimebasedevents`, on calc le delta
 *   minutes RTC depuis le last update + on advance les trees concerned.
 *
 *   Stages : SOWN (0) → SPROUTED (1) → TALLER (2) → BLOOMING (3) → BERRIES (4).
 *   Quand BERRIES atteint : minutesUntilNextStage *= 4 (= 4× withering time).
 *   Si 71 stages × duration > minutes : tree wilt (= reset to gBlankBerryTree).
 *
 * Most berries : stageDuration = 3 hours = 180 minutes per stage (data/berry.h).
 */

import { RtcGetMinuteCount } from '../system/rtc';
import { gSaveBlock1Ptr } from '../save/save-block-state';
import { CalcBerryYield } from '../pokemon/berry';

// ─── Constants 1:1 décomp ────────────────────────────────────────────────────

export const BERRY_STAGE_NO_BERRY = 0;
export const BERRY_STAGE_PLANTED = 1;
export const BERRY_STAGE_SPROUTED = 2;
export const BERRY_STAGE_TALLER = 3;
export const BERRY_STAGE_FLOWER = 4;
export const BERRY_STAGE_BERRIES = 5;
export const BERRY_STAGE_SOWN = BERRY_STAGE_PLANTED;

// ─── Helper : berry stage duration ──────────────────────────────────────────

/** 1:1 décomp `GetStageDurationByBerryType(berry)` (berry.c:1246) :
 *    return GetBerryInfo(berry)->stageDuration * 60;
 *  La majorité des berries ont stageDuration = 3 (= 3h × 60 = 180min/stage).
 *  Quelques-uns ont 2/4/6/12 hours. Pour MVP on retourne 180. */
function _stageDurationMinutes(_berry: number): number {
  // Future : map berry id → real stageDuration via data/berry.h gBerries[].
  return 180;
}

// ─── Berry tree growth 1:1 décomp ────────────────────────────────────────────

interface BerryTree {
  berry: number;
  stage: number;
  minutesUntilNextStage: number;
  berryYield: number;
  regrowthCount: number;
  watered1: number;
  watered2: number;
  watered3: number;
  watered4: number;
  stopGrowth: number;
}

function _berryTreesArr(): BerryTree[] | undefined {
  // 1:1 décomp `gSaveBlock1Ptr->berryTrees[]`.
  return gSaveBlock1Ptr.berryTrees as BerryTree[] | undefined;
}

const _gBlankBerryTree: BerryTree = {
  berry: 0, stage: 0, minutesUntilNextStage: 0, berryYield: 0,
  regrowthCount: 0, watered1: 0, watered2: 0, watered3: 0, watered4: 0,
  stopGrowth: 0,
};

/** 1:1 décomp `BerryTreeGrow(tree)` (berry.c:1046-1074) : advance le tree d'un
 *  stage. Returns FALSE si on arrive à une stage terminal qu'on devrait stopper.
 *
 *  Structure 1:1 stricte avec fallthrough décomp (FLOWERING → PLANTED/SPROUTED/
 *  TALLER unified stage++) :
 *      case NO_BERRY: return FALSE
 *      case FLOWERING: tree->berryYield = CalcBerryYield(tree)
 *      case PLANTED/SPROUTED/TALLER: tree->stage++; break  // fallthrough cible
 *      case BERRIES: clear watered + reset to SPROUTED + regrowth++ */
function _BerryTreeGrow(tree: BerryTree): boolean {
  if (tree.stopGrowth) return false;
  switch (tree.stage) {
    case BERRY_STAGE_NO_BERRY:
      return false;
    case BERRY_STAGE_FLOWER:
      // 1:1 décomp :1055-1056 : berryYield calc à la transition FLOWERING → BERRIES.
      // Décomp use fallthrough vers case PLANTED/SPROUTED/TALLER `tree->stage++`.
      // En TS strict (noFallthroughCasesInSwitch=true) on ne peut pas fallthrough
      // direct → duplique `tree.stage++` ici. Sémantique 1:1 préservée.
      tree.berryYield = CalcBerryYield(tree);
      tree.stage++;
      break;
    case BERRY_STAGE_PLANTED:
    case BERRY_STAGE_SPROUTED:
    case BERRY_STAGE_TALLER:
      tree.stage++;
      break;
    case BERRY_STAGE_BERRIES:
      // 1:1 :1062-1071 : withering → clear watered + back to SPROUTED + regrowth++.
      tree.watered1 = 0;
      tree.watered2 = 0;
      tree.watered3 = 0;
      tree.watered4 = 0;
      tree.berryYield = 0;
      tree.stage = BERRY_STAGE_SPROUTED;
      if (++tree.regrowthCount === 10) {
        Object.assign(tree, _gBlankBerryTree);
      }
      break;
  }
  return true;
}

/** 1:1 décomp `BerryTreeTimeUpdate(minutes)` (berry.c:1076).
 *  Advance tous les berry trees actifs selon le delta minutes passé. */
export function BerryTreeTimeUpdate(minutes: number): void {
  const trees = _berryTreesArr();
  if (!trees) return;
  for (let i = 0; i < trees.length; i++) {
    const tree = trees[i];
    if (tree.berry && tree.stage && !tree.stopGrowth) {
      // 1:1 décomp : si > 71 × stageDuration minutes passed, le tree wilts complet
      // (= blank). 71 stages = trees abandonnés depuis longtemps.
      if (minutes >= _stageDurationMinutes(tree.berry) * 71) {
        Object.assign(tree, _gBlankBerryTree);
      } else {
        let time = minutes;
        while (time !== 0) {
          if (tree.minutesUntilNextStage > time) {
            tree.minutesUntilNextStage -= time;
            break;
          }
          time -= tree.minutesUntilNextStage;
          tree.minutesUntilNextStage = _stageDurationMinutes(tree.berry);
          if (!_BerryTreeGrow(tree)) break;
          // Stage BERRIES : duration ×4 (= longer to wither).
          if (tree.stage === BERRY_STAGE_BERRIES) {
            tree.minutesUntilNextStage *= 4;
          }
        }
      }
    }
  }
}

// ─── DoTimeBasedEvents 1:1 décomp ────────────────────────────────────────────

/** 1:1 décomp `DoTimeBasedEvents` (overworld.c) :
 *    - Read gSaveBlock1Ptr->lastBerryTreeUpdate
 *    - Calc minutes diff vs RtcGetMinuteCount()
 *    - Call BerryTreeTimeUpdate(diff)
 *    - Store new lastBerryTreeUpdate
 *    - Also : daily flag clear, weather rotation, etc.
 *  Notre version : utilise minutes since RTC anchor (s32) à la place de struct Time. */
export function DoTimeBasedEvents(): void {
  // 1:1 décomp `gSaveBlock1Ptr->lastBerryTreeUpdate` (= u16 sur ROM, on stocke
  // en s32 minutes-since-anchor).
  const minuteNow = RtcGetMinuteCount();
  const lastUpdate = (gSaveBlock1Ptr.lastBerryTreeUpdateMin as number | undefined) ?? minuteNow;
  const diff = minuteNow - lastUpdate;

  gSaveBlock1Ptr.lastBerryTreeUpdateMin = minuteNow;

  if (diff > 0) {
    BerryTreeTimeUpdate(diff);
  }

  // Future :
  // - ClearDailyFlagsAfterChallenge if day changed
  // - Rotate Mass Outbreaks
  // - Weather rotation (Route 119/123)
  // - Mirage Island calc
}
