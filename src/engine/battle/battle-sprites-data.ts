/**
 * battle-sprites-data.ts — Port 1:1 strict de `gBattleSpritesDataPtr`
 * (struct BattleSpriteData, battle.h / battle_main.c).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/include/battle.h`
 *   struct BattleSpriteData {
 *     struct BattleSpriteInfo *battlerData;        // [MAX_BATTLERS_COUNT]
 *     struct BattleHealthboxInfo *healthBoxesData; // [MAX_BATTLERS_COUNT]
 *     struct BattleAnimationInfo *animationData;
 *     struct BattleBarInfo *battleBars;
 *   };
 *   struct BattleHealthboxInfo { u8 ... animationState; u8 specialAnimActive:1; u8 statusAnimActive:1; ... };
 *   struct BattleSpriteInfo { ... behindSubstitute:1; ... };
 *
 * Ce module BACKE les champs lus par les controllers (Player/Opponent
 * HandleFaintAnimation, StatusAnimation, etc.) qui jusqu'ici lisaient un
 * `globalThis.__battleSpritesData` JAMAIS défini → les state machines
 * court-circuitaient (`_healthBoxAnimStateWired()===false`). En définissant
 * le backing, les state machines 1:1 TOURNENT (= faint slide/drop animé).
 *
 * 1:1 STRICT : pas de logique inventée — juste le storage des champs struct +
 * les accessseurs que les controllers appellent (mêmes noms/sémantique).
 * Champs non encore utilisés (animationData/battleBars) = absents (les hooks
 * optionnels restent no-op via optional chaining côté caller).
 */

import { MAX_BATTLERS_COUNT } from './state';

// ─── struct BattleHealthboxInfo (champs utilisés) ───────────────────────────
const _animationState: number[] = new Array(MAX_BATTLERS_COUNT).fill(0);
const _specialAnimActive: boolean[] = new Array(MAX_BATTLERS_COUNT).fill(false);
const _statusAnimActive: boolean[] = new Array(MAX_BATTLERS_COUNT).fill(false);

// ─── struct BattleSpriteInfo (champs utilisés) ──────────────────────────────
const _behindSubstitute: boolean[] = new Array(MAX_BATTLERS_COUNT).fill(false);
// 1:1 `battlerData[b].invisible:1` — mémorise l'invisibilité du sprite mon (Vol/
// Tunnel…) ; écrit par CopyBattleSpriteInvisibility, RESTAURÉ par le reshow
// (reshow_battle_screen.c:272 CreateBattlerSprite). PAS touché par
// ClearSpritesHealthboxAnimData (battlerData ≠ healthBoxesData, 1:1).
const _battlerInvisible: boolean[] = new Array(MAX_BATTLERS_COUNT).fill(false);

// ─── struct BattleHealthboxInfo (send-out ball, pokeball.c) ─────────────────
// 1:1 `ballAnimActive:1` (TRUE pendant l'anim send-out d'un battler, posé par
// DoPokeballSendOutAnimation, levé par HandleBallAnimEnd) + `waitForCry:1` (TRUE
// tant que le cri du mon relâché joue, Task_PlayCryWhenReleasedFromBall).
const _ballAnimActive: boolean[] = new Array(MAX_BATTLERS_COUNT).fill(false);
const _waitForCry: boolean[] = new Array(MAX_BATTLERS_COUNT).fill(false);

// ─── struct BattleHealthboxInfo (bounce, battle_main.c DoBounceEffect/EndBounceEffect) ─
// 1:1 `healthboxIsBouncing:1` / `battlerIsBouncing:1` + `healthboxBounceSpriteId` /
// `battlerBounceSpriteId` (u8). Stocke en OBJET PAR BATTLER (pas arrays separes) car
// DoBounceEffect/EndBounceEffect MUTENT ces champs directement via le pointeur struct
// (`gBattleSpritesDataPtr->healthBoxesData[b].healthboxIsBouncing = 1`) -> il faut une
// reference stable et mutable, exactement comme le struct decomp.
interface BattleHealthboxBounceInfo {
  healthboxIsBouncing: number;
  battlerIsBouncing: number;
  healthboxBounceSpriteId: number;
  battlerBounceSpriteId: number;
}
const _healthBoxesData: BattleHealthboxBounceInfo[] = Array.from(
  { length: MAX_BATTLERS_COUNT },
  () => ({ healthboxIsBouncing: 0, battlerIsBouncing: 0, healthboxBounceSpriteId: 0, battlerBounceSpriteId: 0 }),
);

// ─── struct BattleHealthboxInfo (party summary, battle_interface.c) ─────────
// 1:1 `partyStatusSummaryShown:1` (barre+balls affichées pour ce battler),
// `partyStatusDelayTimer` (u8, EndDrawPartyStatusSummary attend >92),
// `opponentDrawPartyStatusSummaryDelay` (u8, l'adversaire attend 2 frames à l'intro).
const _partyStatusSummaryShown: boolean[] = new Array(MAX_BATTLERS_COUNT).fill(false);
const _partyStatusDelayTimer: number[] = new Array(MAX_BATTLERS_COUNT).fill(0);
const _opponentDrawPartyStatusSummaryDelay: number[] = new Array(MAX_BATTLERS_COUNT).fill(0);

// 1:1 `gBattleSpritesDataPtr->animationData->field_9_x1C` : compte les barres
// party-summary actives à l'intro — les RESSOURCES (tiles/pal par tag) ne sont
// libérées que quand il retombe à 0 (Task_HidePartyStatusSummary_BattleStart_2).
let _summaryBarsActive = 0;

// ─── struct BattleAnimationInfo (animationData, singleton) ──────────────────
// 1:1 `introAnimActive:1` (TRUE pendant l'intro d'envoi des deux camps en double).
let _introAnimActive = false;
// 1:1 `u8 numBallParticles` (battle.h:546) — compte les sprites d'étincelles
// d'ouverture de ball vivants ; quand il retombe à 0 ET qu'aucune task
// *OpenParticleAnimation n'est active, les 12 tags particules sont libérés
// (DestroyBallOpenAnimationParticle, battle_anim_throw.c:1998-2014).
let _numBallParticles = 0;

/** 1:1 `gBattleSpritesDataPtr->healthBoxesData[b].animationState`. */
export function getHealthBoxAnimationState(battler: number): number {
  return _animationState[battler] ?? 0;
}
export function setHealthBoxAnimationState(battler: number, v: number): void {
  _animationState[battler] = v & 0xFF;
}
/** 1:1 `gBattleSpritesDataPtr->healthBoxesData[b].specialAnimActive`. */
export function isSpecialAnimActive(battler: number): boolean {
  return !!_specialAnimActive[battler];
}
export function setSpecialAnimActive(battler: number, v: boolean): void {
  _specialAnimActive[battler] = v;
}
/** 1:1 `gBattleSpritesDataPtr->healthBoxesData[b].statusAnimActive`. */
export function isStatusAnimActive(battler: number): boolean {
  return !!_statusAnimActive[battler];
}
export function setStatusAnimActive(battler: number, v: boolean): void {
  _statusAnimActive[battler] = v;
}
/** 1:1 `gBattleSpritesDataPtr->battlerData[b].invisible`. */
export function isBattlerDataInvisible(battler: number): boolean {
  return !!_battlerInvisible[battler];
}
export function setBattlerDataInvisible(battler: number, v: boolean): void {
  _battlerInvisible[battler] = v;
}
/** 1:1 `gBattleSpritesDataPtr->battlerData[b].behindSubstitute`. */
export function isBehindSubstitute(battler: number): boolean {
  return !!_behindSubstitute[battler];
}
export function setBehindSubstitute(battler: number, v: boolean): void {
  _behindSubstitute[battler] = v;
}
/** 1:1 `gBattleSpritesDataPtr->battlerData[b].transformSpecies` (u16, SPECIES_NONE=0
 *  hors Transform). Écrit par HandleSpeciesGfxDataChange (Transform) ; LU par
 *  BattleLoad{Opponent,Player}MonSpriteGfx (le mon transformé garde le pic de la
 *  cible au reload) ; reset par ClearTemporarySpeciesSpriteData (switch/KO). */
const _transformSpecies: number[] = new Array(MAX_BATTLERS_COUNT).fill(0);
export function getTransformSpecies(battler: number): number {
  return _transformSpecies[battler] ?? 0;
}
export function setTransformSpecies(battler: number, species: number): void {
  _transformSpecies[battler] = species & 0xFFFF;
}
/** Reset transformSpecies (appelé par le reset complet du module). */
export function resetTransformSpecies(): void {
  _transformSpecies.fill(0);
}
/** 1:1 `gBattleSpritesDataPtr->healthBoxesData[b].ballAnimActive`. */
export function isBallAnimActive(battler: number): boolean {
  return !!_ballAnimActive[battler];
}
export function setBallAnimActive(battler: number, v: boolean): void {
  _ballAnimActive[battler] = v;
}
/** 1:1 `gBattleSpritesDataPtr->healthBoxesData[b].waitForCry`. */
export function isWaitForCry(battler: number): boolean {
  return !!_waitForCry[battler];
}
export function setWaitForCry(battler: number, v: boolean): void {
  _waitForCry[battler] = v;
}
/** 1:1 `gBattleSpritesDataPtr->healthBoxesData[b].partyStatusSummaryShown`. */
export function isPartyStatusSummaryShown(battler: number): boolean {
  return !!_partyStatusSummaryShown[battler];
}
export function setPartyStatusSummaryShown(battler: number, v: boolean): void {
  _partyStatusSummaryShown[battler] = v;
}
/** 1:1 `gBattleSpritesDataPtr->healthBoxesData[b].partyStatusDelayTimer`. */
export function getPartyStatusDelayTimer(battler: number): number {
  return _partyStatusDelayTimer[battler] ?? 0;
}
export function setPartyStatusDelayTimer(battler: number, v: number): void {
  _partyStatusDelayTimer[battler] = v & 0xFF;
}
/** 1:1 `gBattleSpritesDataPtr->healthBoxesData[b].opponentDrawPartyStatusSummaryDelay`. */
export function getOpponentDrawPartyStatusSummaryDelay(battler: number): number {
  return _opponentDrawPartyStatusSummaryDelay[battler] ?? 0;
}
export function setOpponentDrawPartyStatusSummaryDelay(battler: number, v: number): void {
  _opponentDrawPartyStatusSummaryDelay[battler] = v & 0xFF;
}
/** 1:1 `animationData->field_9_x1C` (compteur barres party-summary actives). */
export function incSummaryBarsActive(): void { _summaryBarsActive++; }
export function decSummaryBarsActive(): void { if (_summaryBarsActive > 0) _summaryBarsActive--; }
export function getSummaryBarsActive(): number { return _summaryBarsActive; }

/** 1:1 `gBattleSpritesDataPtr->animationData->introAnimActive`. */
export function isIntroAnimActive(): boolean {
  return _introAnimActive;
}
export function setIntroAnimActive(v: boolean): void {
  _introAnimActive = v;
}
/** 1:1 `gBattleSpritesDataPtr->animationData->numBallParticles` (u8 — le
 *  & 0xFF reproduit le wrap u8 du décrément C). */
export function getNumBallParticles(): number {
  return _numBallParticles;
}
export function setNumBallParticles(v: number): void {
  _numBallParticles = v & 0xFF;
}
/** 1:1 `&gBattleSpritesDataPtr->healthBoxesData[battler]` (sous-ensemble bounce). Retourne
 *  l'OBJET mutable par battler (DoBounceEffect/EndBounceEffect ecrivent dedans). null si OOB. */
export function getHealthBoxBounceData(battler: number): BattleHealthboxBounceInfo | null {
  return _healthBoxesData[battler] ?? null;
}

/** 1:1 décomp `void ClearSpritesHealthboxAnimData(void)` (battle_gfx_sfx_util.c) :
 *    memset(healthBoxesData, 0, …) ; memset(animationData, 0, …)
 *  = reset les champs HEALTHBOX (anim/special/status/ball/cry/bounce/party-summary)
 *  + ANIMATION (intro/summary count) — PAS battlerData (behindSubstitute survit au
 *  reshow : un mon derrière Clone le reste après le party menu) ni battleBars.
 *  Appelé par le reshow case 5 (reshow_battle_screen.c:79). */
export function ClearSpritesHealthboxAnimData(): void {
  _animationState.fill(0);
  _specialAnimActive.fill(false);
  _statusAnimActive.fill(false);
  _ballAnimActive.fill(false);
  _waitForCry.fill(false);
  _partyStatusSummaryShown.fill(false);
  _partyStatusDelayTimer.fill(0);
  _opponentDrawPartyStatusSummaryDelay.fill(0);
  _summaryBarsActive = 0;
  _introAnimActive = false;
  _numBallParticles = 0;
  for (const d of _healthBoxesData) {
    d.healthboxIsBouncing = 0; d.battlerIsBouncing = 0;
    d.healthboxBounceSpriteId = 0; d.battlerBounceSpriteId = 0;
  }
}

/** Reset complet (= alloc fraîche de gBattleSpritesDataPtr à chaque combat,
 *  battle_main.c BattleStartClearSetData → AllocateBattleResources). */
export function resetBattleSpritesData(): void {
  _animationState.fill(0);
  _specialAnimActive.fill(false);
  _statusAnimActive.fill(false);
  _behindSubstitute.fill(false);
  _battlerInvisible.fill(false);
  _transformSpecies.fill(0);
  _ballAnimActive.fill(false);
  _waitForCry.fill(false);
  _partyStatusSummaryShown.fill(false);
  _partyStatusDelayTimer.fill(0);
  _opponentDrawPartyStatusSummaryDelay.fill(0);
  _summaryBarsActive = 0;
  _introAnimActive = false;
  _numBallParticles = 0;
  // Mutation in-place (refs stables) : DoBounceEffect re-fetch chaque frame, mais
  // un bouncer en cours peut tenir une ref -> on remet a 0 sans recreer l'objet.
  for (const d of _healthBoxesData) {
    d.healthboxIsBouncing = 0; d.battlerIsBouncing = 0;
    d.healthboxBounceSpriteId = 0; d.battlerBounceSpriteId = 0;
  }
}

// ─── Enregistrement globalThis.__battleSpritesData (= surface lue par les
//     controllers via lazy lookup, pour éviter les cycles ESM). MERGE avec
//     tout backing existant (clearTemporarySpeciesSpriteData/gBattleControllerData
//     restent no-op si non définis ailleurs = optional chaining côté caller). ──
const _g = globalThis as Record<string, unknown>;
_g.__battleSpritesData = Object.assign(
  (_g.__battleSpritesData as Record<string, unknown> | undefined) ?? {},
  {
    getHealthBoxAnimationState, setHealthBoxAnimationState,
    isSpecialAnimActive, setSpecialAnimActive,
    isStatusAnimActive, setStatusAnimActive,
    isBehindSubstitute, setBehindSubstitute,
    // battlerData.invisible (consommé par AnimTask_SetAttackerInvisibleWaitForSignal
    // 1:1 — le flag LOGIQUE sauvé/restauré, pas sprite.invisible).
    isBattlerDataInvisible, setBattlerDataInvisible,
    isBallAnimActive, setBallAnimActive,
    getHealthBoxBounceData,
    // 1:1 décomp `ClearSpritesHealthboxAnimData` (reshow case 5) : reset les flags bounce
    // (healthboxIsBouncing/battlerIsBouncing). N'était PAS exposé -> le reshow l'appelait
    // en no-op -> au reshow, ResetSpriteData détruit les tickers de bounce mais les flags
    // restaient à 1 (ids périmés) -> DoBounceEffect au menu croyait le bounce actif et
    // SKIPPAIT -> bobbing mon+healthbox figé après un switch/retour de menu.
    resetBattleSpritesData,
  },
);
