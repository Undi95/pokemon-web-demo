/**
 * battle-healthbox-l.ts — Couche VOIE L du healthbox combat, modèle décomp STRICT.
 *
 * 1:1 décomp `src/battle_interface.c` : `gHealthboxSpriteIds[battler]` (= u8 sprite id
 * du healthbox LEFT) + `CreateBattlerHealthboxSprites` + `SpriteCB_HealthBar` /
 * `SpriteCB_HealthBoxOther` + `SetHealthboxSpriteVisible/Invisible` +
 * `InitBattlerHealthboxCoords` + `UpdateHealthboxAttribute` + `MoveBattleBarGraphically`.
 *
 * Les sprites sont liés par DATA FIELDS (1:1 décomp), pas par un struct "handle" :
 *   - LEFT  : data[5] = healthbar sprite id (hMain_HealthBarSpriteId)
 *             data[6] = battler             (hMain_Battler)
 *             data[7] = right sprite id     (décomp = oam.affineParam ; le runtime n'a
 *                                            pas de affineParam-comme-u8 → data[7])
 *   - RIGHT : data[5] = left sprite id      (hOther_HealthBoxSpriteId)
 *   - BAR   : data[5] = left sprite id      (hBar_HealthBoxSpriteId)
 *             data[6] = data6               (hBar_Data6 ; 0=player, 2=opponent single)
 *
 * Réutilise les PRIMITIVES DE RENDU 1:1 de battle-healthbox.ts (draw tiles barre/
 * digits/niveau/statut/nick/exp) + la logique de barre 1:1 de battle-hp-bar.ts
 * (MoveBattleBar/CalcNewBarValue). Le `HealthboxHandle` n'est utilisé que comme
 * BUNDLE TRANSIENT (reconstruit depuis les data fields à chaque appel) pour appeler
 * ces primitives — il n'est PAS l'état persistant (= gHealthboxSpriteIds l'est).
 *
 * La voie V (battle-flow.ts, handle persistant + hook) reste INTACTE = path
 * production des vraies rencontres. Dette explicite : à supprimer quand voie V part.
 *
 * Module à IMPORT TARDIF (boot voie L) : il s'auto-enregistre sur
 * `globalThis.__battleHealthbox` (que les controllers lisent déjà via
 * `_gHealthboxSpriteId` / `_UpdateHealthboxAttribute`). Pas de cycle TDZ (cf. warning
 * en tête de battle-healthbox.ts) car personne ne l'importe statiquement tôt.
 */

import { getRuntime } from '../system/decomp-globals';
import {
  createBattlerHealthboxSprites, setHealthboxVisible,
  updateHealthboxHpBar, updateHealthboxLevel, updateHealthboxStatus,
  updateHealthboxNick, updateHealthboxHpDigits, updateHealthboxExpBar,
  type HealthboxHandle,
} from './battle-healthbox';
import {
  SetBattleBarStruct, MoveBattleBar, setMoveBattleBarGraphicallyHook,
  battleBars, HEALTH_BAR, EXP_BAR,
} from './battle-hp-bar';
import {
  gPlayerParty, gEnemyParty, GetMonData,
  MON_DATA_HP, MON_DATA_MAX_HP, MON_DATA_LEVEL, MON_DATA_STATUS,
  MON_DATA_SPECIES, MON_DATA_NICKNAME,
} from './party-storage';
import { gBattlerPartyIndexes } from './state';
import { getExpForLevel } from './data/experience-tables';
import { getSpeciesGrowthRate, GetGenderFromSpeciesAndPersonality } from './data/species-runtime';
import { GetBattlerPosition } from './util';

/** Type du paramètre mon de GetMonData (= Pokemon). Évite d'importer le type
 *  Pokemon (cycle potentiel) ; le bord hook __battleHealthbox passe `unknown`. */
type Mon = Parameters<typeof GetMonData>[0];

// ─── HEALTHBOX_* element ids (1:1 décomp include/battle_interface.h:52-63) ──────
const HEALTHBOX_ALL = 0;
const HEALTHBOX_CURRENT_HP = 1;
const HEALTHBOX_MAX_HP = 2;
const HEALTHBOX_LEVEL = 3;
const HEALTHBOX_NICK = 4;
const HEALTHBOX_HEALTH_BAR = 5;
const HEALTHBOX_EXP_BAR = 6;
const HEALTHBOX_STATUS_ICON = 9;

// ─── 1:1 décomp `gHealthboxSpriteIds[MAX_BATTLERS]` (battle_main.c) ─────────────
/** Sprite id du healthbox LEFT par battler (= ce que retourne CreateBattlerHealthboxSprites).
 *  -1 = pas encore créé. Lu par les controllers via `__battleHealthbox.gHealthboxSpriteIds`. */
export const gHealthboxSpriteIds: number[] = [-1, -1, -1, -1];

/** Side d'un battler (1:1 `GetBattlerSide` : position & BIT_SIDE). Single :
 *  position pair (0/2) = joueur, impair (1/3) = adversaire. */
function _sideOf(battler: number): 'player' | 'opponent' {
  return (GetBattlerPosition(battler) & 1) === 0 ? 'player' : 'opponent';
}

function _partyMon(battler: number): Mon {
  const party = _sideOf(battler) === 'player' ? gPlayerParty : gEnemyParty;
  return party[gBattlerPartyIndexes[battler]] as Mon;
}

/** Reconstruit un HealthboxHandle TRANSIENT depuis les data fields du sprite LEFT
 *  (1:1 décomp : les fonctions de rendu lisent gSprites[healthboxSpriteId].hMain_*).
 *  Le handle n'est PAS persistant — il bundle juste les 3 ids pour les primitives. */
function _handleFromSpriteId(healthboxSpriteId: number): HealthboxHandle | null {
  const rt = getRuntime();
  if (!rt) return null;
  const left = rt.gSprites.get(healthboxSpriteId);
  if (!left || !left.data) return null;
  const battler = left.data[6] | 0;
  return {
    leftSpriteId: healthboxSpriteId,
    rightSpriteId: left.data[7] | 0,
    healthbarSpriteId: left.data[5] | 0,
    side: _sideOf(battler),
    centerX: left.x,
    centerY: left.y,
  };
}

// ─── 1:1 décomp `SpriteCB_HealthBar` (battle_interface.c:979-1002) ──────────────
/** La barre HP suit le healthbox LEFT chaque frame (x = box.x + offset selon data6). */
function SpriteCB_HealthBar(sprite: { data: number[]; x: number; y: number; x2: number; y2: number }): void {
  const rt = getRuntime();
  if (!rt) return;
  const box = rt.gSprites.get(sprite.data[5] | 0);
  if (!box) return;
  const data6 = sprite.data[6] | 0;
  // 1:1 décomp : case 0/1 → +16 ; case 2 (opp) → +8.
  sprite.x = box.x + (data6 === 2 ? 8 : 16);
  sprite.y = box.y;
  sprite.x2 = box.x2;
  sprite.y2 = box.y2;
}

// ─── 1:1 décomp `SpriteCB_HealthBoxOther` (battle_interface.c:1004-1013) ─────────
/** Le sprite RIGHT du healthbox suit le LEFT (x = left.x + 64). */
function SpriteCB_HealthBoxOther(sprite: { data: number[]; x: number; y: number; x2: number; y2: number }): void {
  const rt = getRuntime();
  if (!rt) return;
  const main = rt.gSprites.get(sprite.data[5] | 0);
  if (!main) return;
  sprite.x = main.x + 64;
  sprite.y = main.y;
  sprite.x2 = main.x2;
  sprite.y2 = main.y2;
}

// ─── 1:1 décomp `CreateBattlerHealthboxSprites` (battle_interface.c:869-951) ─────
/** Crée le healthbox d'un battler, lie les 3 sprites par data fields + callbacks,
 *  pose `gHealthboxSpriteIds[battler]`, retourne le sprite id LEFT.
 *
 *  ASYNC : la création de sprites (createBattlerHealthboxSprites) attend les assets
 *  (ensureHealthboxAssets). Le décomp est sync (assets pré-chargés) ; côté voie L on
 *  attend. Le caller (_BattleInitAllSprites, state machine) gère l'attente. */
export async function CreateBattlerHealthboxSprites(battler: number): Promise<number> {
  const rt = getRuntime();
  if (!rt) return -1;
  const side = _sideOf(battler);
  const handle = await createBattlerHealthboxSprites(side);
  if (!handle) return -1;

  const data6 = side === 'player' ? 0 : 2;  // 1:1 décomp single (player=0, opp=2)
  const left = rt.gSprites.get(handle.leftSpriteId);
  const right = rt.gSprites.get(handle.rightSpriteId);
  const bar = rt.gSprites.get(handle.healthbarSpriteId);

  // 1:1 décomp ll. 940-948 : liens par data fields (= remplace handle persistant).
  if (left && left.data) {
    left.data[5] = handle.healthbarSpriteId;  // hMain_HealthBarSpriteId
    left.data[6] = battler;                   // hMain_Battler
    left.data[7] = handle.rightSpriteId;      // (décomp oam.affineParam → data[7])
    left.invisible = true;
  }
  if (right && right.data) {
    right.data[5] = handle.leftSpriteId;       // hOther_HealthBoxSpriteId
    right.callback = SpriteCB_HealthBoxOther as never;
    right.invisible = true;
  }
  if (bar && bar.data) {
    bar.data[5] = handle.leftSpriteId;         // hBar_HealthBoxSpriteId
    bar.data[6] = data6;                       // hBar_Data6
    bar.callback = SpriteCB_HealthBar as never;
    bar.invisible = true;
  }

  gHealthboxSpriteIds[battler] = handle.leftSpriteId;
  return handle.leftSpriteId;
}

// ─── 1:1 décomp `InitBattlerHealthboxCoords` (battle_interface.c:1072-1103) ──────
/** Pose la position du healthbox (single : player (158,88) / opp (44,30)). La
 *  création place déjà les sprites à ces coords ; cette fonction les ré-affirme 1:1. */
export function InitBattlerHealthboxCoords(battler: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const spriteId = gHealthboxSpriteIds[battler];
  if (spriteId < 0) return;
  const left = rt.gSprites.get(spriteId);
  if (!left) return;
  const isPlayer = _sideOf(battler) === 'player';
  left.x = isPlayer ? 158 : 44;
  left.y = isPlayer ? 88 : 30;
}

// ─── 1:1 décomp `SetHealthboxSpriteVisible/Invisible` (ll. 1024-1036) ───────────
export function SetHealthboxSpriteVisible(healthboxSpriteId: number): void {
  const handle = _handleFromSpriteId(healthboxSpriteId);
  if (handle) setHealthboxVisible(handle, true);
}
export function SetHealthboxSpriteInvisible(healthboxSpriteId: number): void {
  const handle = _handleFromSpriteId(healthboxSpriteId);
  if (handle) setHealthboxVisible(handle, false);
}

// ─── 1:1 décomp `StartHealthboxSlideIn` + callbacks (pokeball.c:1241-1278) ───────
// Le healthbox glisse depuis le côté à la sortie du mon (joueur : depuis la droite ;
// adversaire : depuis la gauche). data fields (1:1) : sSpeedX = data[0], sSpeedY =
// data[1] (slide) ; sDelayTimer = data[1] (variante PLAYER_RIGHT, double battle). Les
// 3 sprites (box LEFT / barre / right) glissent ensemble : barre et right copient
// box.x2 via leurs callbacks SpriteCB_HealthBar / SpriteCB_HealthBoxOther.
const B_POSITION_PLAYER_RIGHT = 2;  // 1:1 include/battle.h

/** 1:1 décomp `SpriteCallbackDummy` (sprite.c) : callback au repos du box LEFT. */
function SpriteCallbackDummy(_sprite: unknown): void { /* empty 1:1 */ }

/** 1:1 décomp `SpriteCB_HealthboxSlideIn(sprite)` (pokeball.c:1272-1278). */
function SpriteCB_HealthboxSlideIn(sprite: { data: number[]; x2: number; y2: number; callback?: unknown }): void {
  sprite.x2 -= sprite.data[0];  // sSpeedX
  sprite.y2 -= sprite.data[1];  // sSpeedY
  if (sprite.x2 === 0 && sprite.y2 === 0)
    sprite.callback = SpriteCallbackDummy as never;
}

/** 1:1 décomp `SpriteCB_HealthboxSlideInDelayed(sprite)` (pokeball.c:1262-1270).
 *  Attend 20 frames avant de lancer le slide (= partenaire droit, double battle). */
function SpriteCB_HealthboxSlideInDelayed(sprite: { data: number[]; callback?: unknown }): void {
  sprite.data[1]++;  // sDelayTimer
  if (sprite.data[1] === 20) {
    sprite.data[1] = 0;
    sprite.callback = SpriteCB_HealthboxSlideIn as never;
  }
}

/** 1:1 décomp `StartHealthboxSlideIn(battler)` (pokeball.c:1241-1260). Le box LEFT
 *  part offset de ±0x73 px et glisse vers sa position home (vitesse ±5/frame, ~23 frames). */
export function StartHealthboxSlideIn(battler: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const spriteId = gHealthboxSpriteIds[battler];
  if (spriteId < 0) return;
  const healthboxSprite = rt.gSprites.get(spriteId);
  if (!healthboxSprite || !healthboxSprite.data) return;

  healthboxSprite.data[0] = 5;     // sSpeedX
  healthboxSprite.data[1] = 0;     // sSpeedY
  healthboxSprite.x2 = 0x73;
  healthboxSprite.y2 = 0;
  healthboxSprite.callback = SpriteCB_HealthboxSlideIn as never;
  if (_sideOf(battler) !== 'player') {
    healthboxSprite.data[0] = -healthboxSprite.data[0];
    healthboxSprite.data[1] = -healthboxSprite.data[1];
    healthboxSprite.x2 = -healthboxSprite.x2;
    healthboxSprite.y2 = -healthboxSprite.y2;
  }
  // 1:1 décomp l.1257 : kick le callback de la barre (data[5] = bar id) → sync x2 frame 1.
  const bar = rt.gSprites.get((healthboxSprite.data[5] | 0));
  if (bar && typeof bar.callback === 'function') (bar.callback as (s: unknown) => void)(bar);
  if (GetBattlerPosition(battler) === B_POSITION_PLAYER_RIGHT)
    healthboxSprite.callback = SpriteCB_HealthboxSlideInDelayed as never;
}

// ─── 1:1 décomp `MoveBattleBarGraphically` (battle_interface.c:2275-2330) ────────
/** Re-dessine les tuiles fill de la barre (HP ou EXP) au currValue interpolé. Lit
 *  battleBars[battler] (currValue Q24.8) → primitive de rendu 1:1. Appelé DIRECTEMENT
 *  par MoveBattleBar via le hook (= la seule indirection, cycle-safe ; sémantique
 *  identique à l'appel direct du décomp). */
function MoveBattleBarGraphically(battler: number, whichBar: number): void {
  const spriteId = gHealthboxSpriteIds[battler];
  if (spriteId < 0) return;
  const handle = _handleFromSpriteId(spriteId);
  if (!handle) return;
  const bar = battleBars[battler];
  if (whichBar === HEALTH_BAR) {
    // Q24.8 quand maxValue < 48 (= B_HEALTHBAR_PIXELS), sinon entier (cf. CalcNewBarValue).
    const realHp = bar.maxValue < 48 ? bar.currValue / 256 : bar.currValue;
    updateHealthboxHpBar(handle, realHp, bar.maxValue);
  } else {
    // EXP : Q24.8 quand maxValue < 64 (= B_EXPBAR_PIXELS). Player only.
    const realExp = bar.maxValue < 64 ? bar.currValue / 256 : bar.currValue;
    const level = GetMonData(_partyMon(battler), MON_DATA_LEVEL) as number;
    updateHealthboxExpBar(handle, realExp, bar.maxValue, level);
  }
}

// ─── 1:1 décomp `UpdateHealthboxAttribute` (battle_interface.c:2163-2233) ────────
/** Dispatcher : dessine l'élément demandé (ALL = tout) sur le healthbox. Lit le mon
 *  via GetMonData (1:1). Réutilise les primitives de rendu 1:1. */
export function UpdateHealthboxAttribute(healthboxSpriteId: number, monRaw: unknown, elementId: number): void {
  const handle = _handleFromSpriteId(healthboxSpriteId);
  if (!handle) return;
  const mon = monRaw as Mon;
  const battler = (() => {
    const rt = getRuntime();
    const left = rt?.gSprites.get(healthboxSpriteId);
    return left?.data ? (left.data[6] | 0) : 0;
  })();
  const isPlayer = handle.side === 'player';

  if (isPlayer) {
    if (elementId === HEALTHBOX_LEVEL || elementId === HEALTHBOX_ALL)
      updateHealthboxLevel(handle, GetMonData(mon, MON_DATA_LEVEL) as number);
    if (elementId === HEALTHBOX_CURRENT_HP || elementId === HEALTHBOX_MAX_HP || elementId === HEALTHBOX_ALL)
      updateHealthboxHpDigits(handle, GetMonData(mon, MON_DATA_HP) as number, GetMonData(mon, MON_DATA_MAX_HP) as number);
    if (elementId === HEALTHBOX_HEALTH_BAR || elementId === HEALTHBOX_ALL) {
      const maxHp = GetMonData(mon, MON_DATA_MAX_HP) as number;
      const currHp = GetMonData(mon, MON_DATA_HP) as number;
      SetBattleBarStruct(battler, healthboxSpriteId, maxHp, currHp, 0);
      MoveBattleBar(battler, healthboxSpriteId, HEALTH_BAR, 0);  // → MoveBattleBarGraphically (hook)
    }
    if (elementId === HEALTHBOX_EXP_BAR || elementId === HEALTHBOX_ALL) {
      // 1:1 décomp ll. 2197-2205 : currExpBarValue = exp - currLevelExp ;
      // maxExpBarValue = nextLevelExp - currLevelExp (via gExperienceTables).
      const species = GetMonData(mon, MON_DATA_SPECIES) as number;
      const level = GetMonData(mon, MON_DATA_LEVEL) as number;
      const exp = GetMonData(mon, 25 /* MON_DATA_EXP */) as number;
      const gr = getSpeciesGrowthRate(species);
      const currLevelExp = getExpForLevel(gr, level);
      const currExpBarValue = exp - currLevelExp;
      const maxExpBarValue = getExpForLevel(gr, level + 1) - currLevelExp;
      SetBattleBarStruct(battler, healthboxSpriteId, maxExpBarValue, currExpBarValue, 0);
      MoveBattleBar(battler, healthboxSpriteId, EXP_BAR, 0);
    }
    if (elementId === HEALTHBOX_NICK || elementId === HEALTHBOX_ALL)
      updateHealthboxNick(handle, _nick(mon), _gender(mon));
    if (elementId === HEALTHBOX_STATUS_ICON || elementId === HEALTHBOX_ALL)
      updateHealthboxStatus(handle, _statusString(mon));
  } else {
    if (elementId === HEALTHBOX_LEVEL || elementId === HEALTHBOX_ALL)
      updateHealthboxLevel(handle, GetMonData(mon, MON_DATA_LEVEL) as number);
    if (elementId === HEALTHBOX_HEALTH_BAR || elementId === HEALTHBOX_ALL) {
      const maxHp = GetMonData(mon, MON_DATA_MAX_HP) as number;
      const currHp = GetMonData(mon, MON_DATA_HP) as number;
      SetBattleBarStruct(battler, healthboxSpriteId, maxHp, currHp, 0);
      MoveBattleBar(battler, healthboxSpriteId, HEALTH_BAR, 0);
    }
    if (elementId === HEALTHBOX_NICK || elementId === HEALTHBOX_ALL)
      updateHealthboxNick(handle, _nick(mon), _gender(mon));
    if (elementId === HEALTHBOX_STATUS_ICON || elementId === HEALTHBOX_ALL)
      updateHealthboxStatus(handle, _statusString(mon));
  }
}

function _nick(mon: Mon): string {
  return (GetMonData(mon, MON_DATA_NICKNAME) as string) ?? '';
}

function _gender(mon: Mon): number {
  const species = GetMonData(mon, MON_DATA_SPECIES) as number;
  const personality = (mon as { personality?: number }).personality ?? 0;
  return GetGenderFromSpeciesAndPersonality(species, personality);
}

/** Convertit status1 (bitmask) → string attendu par updateHealthboxStatus
 *  ('PSN'/'PAR'/'SLP'/'FRZ'/'BRN'/null). 1:1 priorité décomp. */
function _statusString(mon: Mon): string | null {
  const s = (GetMonData(mon, MON_DATA_STATUS) as number) | 0;
  if (s & 0x07) return 'SLP';          // STATUS1_SLEEP (compteur bits 0-2)
  if (s & 0x08) return 'PSN';          // STATUS1_POISON
  if (s & 0x10) return 'BRN';          // STATUS1_BURN
  if (s & 0x20) return 'FRZ';          // STATUS1_FREEZE
  if (s & 0x40) return 'PAR';          // STATUS1_PARALYSIS
  if (s & 0x80) return 'PSN';          // STATUS1_TOXIC_POISON (icône PSN)
  return null;
}

/** Helper voie-L : crée le healthbox d'un battler, dessine TOUT (HEALTHBOX_ALL),
 *  puis le rend INVISIBLE. 1:1 décomp `BattleInitAllSprites` case 5
 *  (battle_gfx_sfx_util.c:886-892) : UpdateHealthboxAttribute(ALL) +
 *  SetHealthboxSpriteInvisible. Le healthbox est ensuite MONTRÉ + glissé au SEND-OUT
 *  du mon via ShowHealthboxOnSendOut (P1b — appelé par les handlers controller). */
export async function initBattlerHealthbox(battler: number): Promise<void> {
  const spriteId = await CreateBattlerHealthboxSprites(battler);
  if (spriteId < 0) return;
  InitBattlerHealthboxCoords(battler);
  UpdateHealthboxAttribute(spriteId, _partyMon(battler), HEALTHBOX_ALL);
  SetHealthboxSpriteInvisible(spriteId);  // 1:1 case 5 : créé caché, montré au send-out
}

/** 1:1 décomp : montre le healthbox d'un battler à la SORTIE du mon (send-out).
 *  Reproduit `Intro_TryShinyAnimShowHealthbox` (battle_controller_opponent.c:320-322 /
 *  battle_controller_player.c:1006-1008) : UpdateHealthboxAttribute(ALL) +
 *  StartHealthboxSlideIn + SetHealthboxSpriteVisible. Appelé par les handlers
 *  controller send-out (Player/Opponent HandleIntroTrainerBallThrow). Gate
 *  `_healthboxSlideInStarted` = 1:1 flag `healthboxSlideInStarted`. Le wait multi-frame
 *  du décomp (ball/shiny/cry anim) est collapsé ici = Dette R3 (intro simplifiée). */
const _healthboxSlideInStarted: boolean[] = [false, false, false, false];
export function ShowHealthboxOnSendOut(battler: number): void {
  const spriteId = gHealthboxSpriteIds[battler];
  if (spriteId < 0) return;
  if (_healthboxSlideInStarted[battler]) return;
  _healthboxSlideInStarted[battler] = true;
  UpdateHealthboxAttribute(spriteId, _partyMon(battler), HEALTHBOX_ALL);
  StartHealthboxSlideIn(battler);
  SetHealthboxSpriteVisible(spriteId);
}

// État de la state machine d'init (= 1:1 décomp BattleInitAllSprites étalé sur frames).
// 0 = pas lancé, 1 = création async en cours, 2 = fini.
let _hbInitState = 0;

/** State machine appelée par `_BattleInitAllSprites` (case 18) : kick off la création
 *  ASYNC des healthboxes des 2 battlers une fois, retourne false tant que pas fini,
 *  true ensuite. 1:1 esprit décomp (BattleInitAllSprites étale la création sur frames). */
export function initAllHealthboxes(): boolean {
  if (_hbInitState === 0) {
    _hbInitState = 1;
    void Promise.all([initBattlerHealthbox(0), initBattlerHealthbox(1)])
      .then(() => { _hbInitState = 2; })
      .catch((e) => { console.error('[healthbox-l] initAllHealthboxes THREW:', e); _hbInitState = 2; });
    return false;
  }
  return _hbInitState === 2;
}

/** Reset par combat (1:1 : sprites détruits par ResetSpriteData à CB2_InitBattle).
 *  À appeler au battle-start (BattleStartClearSetData) pour re-créer proprement. */
export function resetHealthboxL(): void {
  for (let i = 0; i < gHealthboxSpriteIds.length; i++) gHealthboxSpriteIds[i] = -1;
  for (let i = 0; i < _healthboxSlideInStarted.length; i++) _healthboxSlideInStarted[i] = false;
  _hbInitState = 0;
}

// ─── 1:1 décomp `UpdateHpTextInHealthbox` (battle_interface.c:1139-1172) ─────────
const HP_CURRENT = 0, HP_MAX = 1;  // 1:1 battle_interface.h
/** Met à jour les digits PV du healthbox (player single ; l'adversaire n'en a pas).
 *  hpId = HP_CURRENT/HP_MAX. Utilisé par CompleteOnHealthbarDone pour animer les
 *  digits AVEC la barre pendant le drain (value = valeur courante de MoveBattleBar).
 *  L'autre valeur (max si on update current, et inverse) vient du mon. */
export function UpdateHpTextInHealthbox(healthboxSpriteId: number, value: number, hpId: number): void {
  const handle = _handleFromSpriteId(healthboxSpriteId);
  if (!handle || handle.side !== 'player') return;
  const rt = getRuntime();
  const left = rt?.gSprites.get(healthboxSpriteId);
  const battler = left?.data ? (left.data[6] | 0) : 0;
  const mon = _partyMon(battler);
  const currHp = hpId === HP_CURRENT ? value : (GetMonData(mon, MON_DATA_HP) as number);
  const maxHp = hpId === HP_MAX ? value : (GetMonData(mon, MON_DATA_MAX_HP) as number);
  updateHealthboxHpDigits(handle, currHp, maxHp);
}

// ─── Enregistrement global (lu par les controllers via __battleHealthbox) ───────
(globalThis as Record<string, unknown>).__battleHealthbox = {
  gHealthboxSpriteIds,
  CreateBattlerHealthboxSprites,
  InitBattlerHealthboxCoords,
  SetHealthboxSpriteVisible,
  SetHealthboxSpriteInvisible,
  updateHealthboxAttribute: UpdateHealthboxAttribute,  // nom hook attendu par battle-controller-player._UpdateHealthboxAttribute
  UpdateHealthboxAttribute,
  initBattlerHealthbox,
  initAllHealthboxes,
  resetHealthboxL,
  UpdateHpTextInHealthbox,
  StartHealthboxSlideIn,
  ShowHealthboxOnSendOut,
};

// 1:1 décomp : MoveBattleBar appelle MoveBattleBarGraphically. En TS, MoveBattleBar
// (battle-hp-bar.ts) est dans un autre module → on branche via le hook (cycle-safe).
// Pour la voie L c'est NOTRE MoveBattleBarGraphically (modèle gHealthboxSpriteIds).
setMoveBattleBarGraphicallyHook(MoveBattleBarGraphically);
