/**
 * game/battle_anim_mons.ts — Port MIROIR 1:1 de `battle_anim_mons.c`.
 *
 * Source de verite : `D:/Projet 1/decomps/pokeemeraude/src/battle_anim_mons.c`
 *
 * ⚠️ Port PARTIEL (battle_anim_mons.c = 2500+ l.). Cette premiere tranche = les
 * primitives de TRANSLATION d'arc/lineaire, PURES (n'operent que sur le sprite +
 * Sin), prerequis du port send-out (pokeball.c : InitAnimArcTranslation +
 * TranslateAnimHorizontalArc + AnimTranslateLinear). Les tranches suivantes y
 * ajouteront GetBattlerSpriteCoord + sBattlerCoords + le reste, dans l'ordre du
 * fichier decomp.
 *
 * Fonctions portees (tranche 1) :
 *   - InitAnimLinearTranslation (1065-1091)
 *   - InitAnimArcTranslation (785-792)
 *   - AnimTranslateLinear (1111-1139)
 *   - TranslateAnimHorizontalArc (794-801)
 *   - TranslateAnimVerticalArc (803-810)
 *   - SetSpritePrimaryCoordsFromSecondaryCoords (812-817)
 *   - StartAnimLinearTranslation / AnimTranslateLinear_WithFollowup (1093/1141)
 *   - StoreSpriteCallbackInData6 / SetCallbackToStoredInData6 (sprite.c) : callback
 *     stocke en data[6]/data[7] (adresse) en decomp → champ dedie `inData6Callback` ici.
 *
 * Adaptation HW-emu :
 *   - La decomp s'appuie sur les types `s16 data[]` / `u16` locaux pour le
 *     wraparound 16-bit implicite. Notre `DecompSprite.data` est `number[]` (non
 *     borne) → on reproduit le wraparound EXPLICITEMENT : `& 0xFFFF` a l'ecriture
 *     des deltas u16 (data[1]/data[2]/data[3]/data[4]/data[6]/data[7]) et a la
 *     lecture, `toS16()` la ou la decomp lit un `s16` (data[2]-data[1], data[5]).
 *     Les valeurs restent identiques bit-a-bit a la decomp.
 */

import type { DecompSprite } from '../engine/system/decomp-runtime';
import { Sin } from './trig';

// ─── gBattlerPositions + GetBattlerAtPosition/GetBattlerPosition (battle_anim_mons.c:858-859)
//     — 1:1 décomp, absorbé depuis ex-engine/battle/util.ts (grab-bag) 2026-06-13. ───
export const B_POSITION_PLAYER_LEFT    = 0;
export const B_POSITION_OPPONENT_LEFT  = 1;
export const B_POSITION_PLAYER_RIGHT   = 2;
export const B_POSITION_OPPONENT_RIGHT = 3;

/** 1:1 décomp `gBattlerPositions[MAX_BATTLERS_COUNT]` (single battle : identity). */
export const gBattlerPositions: number[] = [
  B_POSITION_PLAYER_LEFT,
  B_POSITION_OPPONENT_LEFT,
  B_POSITION_PLAYER_RIGHT,
  B_POSITION_OPPONENT_RIGHT,
];

/** 1:1 décomp `GetBattlerAtPosition(u8 position)` (battle_anim_mons.c:859). */
export function GetBattlerAtPosition(position: number): number {
  for (let i = 0; i < gBattlerPositions.length; i++) {
    if (gBattlerPositions[i] === position) return i;
  }
  return 0;
}

/** 1:1 décomp `GetBattlerPosition(u8 battler)` (battle_anim_mons.c:858). */
export function GetBattlerPosition(battler: number): number {
  return gBattlerPositions[battler] ?? 0;
}
import { gBattleTypeFlags, gBattlerPartyIndexes } from '../engine/battle/state';
import { BATTLE_TYPE_DOUBLE, B_SIDE_PLAYER, B_SIDE_OPPONENT } from '../engine/battle/constants';
import { gPlayerParty, gEnemyParty, GetMonData, MON_DATA_SPECIES } from '../engine/battle/party-storage';
import { reverseDecompConstant } from '../engine/system/decomp-constants';
import { getMonFrontPicCoords, getMonBackPicCoords } from './data/mon_pic_coords';

/** Reinterprete les 16 bits bas de `v` en s16 signe (= cast (s16) decomp). */
function toS16(v: number): number {
  return (v << 16) >> 16;
}

/** 1:1 decomp battle_anim_mons.c:1065 `void InitAnimLinearTranslation(struct Sprite *sprite)`.
 *  Pre-condition : data[0]=nbFrames, data[1]=startX, data[2]=destX, data[3]=startY,
 *  data[4]=destY. Post : data[1]=xDelta(u16), data[2]=yDelta(u16), data[3]=data[4]=0.
 *  Bit 0 de chaque delta encode le SIGNE (movingLeft/movingUp). */
export function InitAnimLinearTranslation(sprite: DecompSprite): void {
  const d = sprite.data;
  const x = toS16(d[2]) - toS16(d[1]);   // int x = data[2] - data[1];
  const y = toS16(d[4]) - toS16(d[3]);   // int y = data[4] - data[3];
  const movingLeft = x < 0;
  const movingUp = y < 0;
  let xDelta = (Math.abs(x) << 8) & 0xFFFF;   // u16 xDelta = abs(x) << 8;
  let yDelta = (Math.abs(y) << 8) & 0xFFFF;   // u16 yDelta = abs(y) << 8;
  xDelta = Math.floor(xDelta / d[0]) & 0xFFFF;   // xDelta /= data[0];
  yDelta = Math.floor(yDelta / d[0]) & 0xFFFF;   // yDelta /= data[0];
  if (movingLeft) xDelta |= 1; else xDelta &= ~1;
  if (movingUp) yDelta |= 1; else yDelta &= ~1;
  d[1] = xDelta & 0xFFFF;
  d[2] = yDelta & 0xFFFF;
  d[4] = 0;
  d[3] = 0;
}

/** 1:1 decomp battle_anim_mons.c:785 `void InitAnimArcTranslation(struct Sprite *sprite)`.
 *  Capture x/y courants comme depart, calcule les deltas lineaires, puis prepare
 *  l'increment de phase sinus data[6]=0x8000/nbFrames pour la bosse d'arc. */
export function InitAnimArcTranslation(sprite: DecompSprite): void {
  const d = sprite.data;
  d[1] = sprite.x;   // sprite->data[1] = sprite->x;
  d[3] = sprite.y;   // sprite->data[3] = sprite->y;
  InitAnimLinearTranslation(sprite);
  d[6] = Math.floor(0x8000 / d[0]) & 0xFFFF;   // data[6] = 0x8000 / data[0];
  d[7] = 0;
}

/** 1:1 decomp battle_anim_mons.c:1111 `bool8 AnimTranslateLinear(struct Sprite *sprite)`.
 *  Avance la translation lineaire d'un pas : pose x2/y2, decremente data[0].
 *  Retourne TRUE quand data[0]==0 (translation terminee). */
export function AnimTranslateLinear(sprite: DecompSprite): boolean {
  const d = sprite.data;
  if (!d[0]) return true;            // if (!sprite->data[0]) return TRUE;
  const v1 = d[1] & 0xFFFF;          // u16 v1 = data[1];
  const v2 = d[2] & 0xFFFF;          // u16 v2 = data[2];
  let x = d[3] & 0xFFFF;             // u16 x = data[3];
  let y = d[4] & 0xFFFF;             // u16 y = data[4];
  x = (x + v1) & 0xFFFF;             // x += v1;
  y = (y + v2) & 0xFFFF;             // y += v2;
  sprite.x2 = (v1 & 1) ? -(x >> 8) : (x >> 8);
  sprite.y2 = (v2 & 1) ? -(y >> 8) : (y >> 8);
  d[3] = x;                          // sprite->data[3] = x;
  d[4] = y;                          // sprite->data[4] = y;
  d[0]--;                            // sprite->data[0]--;
  return false;
}

/** 1:1 decomp battle_anim_mons.c:794 `bool8 TranslateAnimHorizontalArc(struct Sprite *sprite)`.
 *  Translation lineaire + bosse sinusoidale ajoutee a y2 (arc "horizontal" : la
 *  trajectoire monte/descend en cloche pendant le deplacement X). */
export function TranslateAnimHorizontalArc(sprite: DecompSprite): boolean {
  const d = sprite.data;
  if (AnimTranslateLinear(sprite)) return true;
  d[7] = (d[7] + d[6]) & 0xFFFF;     // sprite->data[7] += sprite->data[6];
  sprite.y2 += Sin((d[7] >> 8) & 0xFF, toS16(d[5]));   // y2 += Sin((u8)(data[7] >> 8), data[5]);
  return false;
}

/** 1:1 decomp battle_anim_mons.c:803 `bool8 TranslateAnimVerticalArc(struct Sprite *sprite)`.
 *  Translation lineaire + bosse sinusoidale ajoutee a x2. */
export function TranslateAnimVerticalArc(sprite: DecompSprite): boolean {
  const d = sprite.data;
  if (AnimTranslateLinear(sprite)) return true;
  d[7] = (d[7] + d[6]) & 0xFFFF;     // sprite->data[7] += sprite->data[6];
  sprite.x2 += Sin((d[7] >> 8) & 0xFF, toS16(d[5]));   // x2 += Sin((u8)(data[7] >> 8), data[5]);
  return false;
}

/** 1:1 decomp battle_anim_mons.c:812 `void SetSpritePrimaryCoordsFromSecondaryCoords(struct Sprite *sprite)`.
 *  Integre x2/y2 dans x/y (fige la position courante de l'arc) puis remet x2/y2 a 0. */
export function SetSpritePrimaryCoordsFromSecondaryCoords(sprite: DecompSprite): void {
  sprite.x += sprite.x2;
  sprite.y += sprite.y2;
  sprite.x2 = 0;
  sprite.y2 = 0;
}

/** 1:1 decomp sprite.c `void StoreSpriteCallbackInData6(struct Sprite *sprite, SpriteCallback callback)`.
 *  En decomp : split du pointeur 32-bit dans data[6]/data[7]. Nos callbacks etant des
 *  fonctions JS (pas des adresses), on les garde dans le champ dedie `inData6Callback`. */
export function StoreSpriteCallbackInData6(sprite: DecompSprite, callback: NonNullable<DecompSprite['callback']>): void {
  sprite.inData6Callback = callback;
}

/** 1:1 decomp sprite.c `void SetCallbackToStoredInData6(struct Sprite *sprite)`.
 *  Restaure le callback stocke par StoreSpriteCallbackInData6 (= reassemble data[6]|data[7]). */
export function SetCallbackToStoredInData6(sprite: DecompSprite): void {
  sprite.callback = sprite.inData6Callback ?? null;
}

/** 1:1 decomp battle_anim_mons.c:1141 `void AnimTranslateLinear_WithFollowup(struct Sprite *sprite)`.
 *  Avance la translation lineaire ; quand finie (data[0]==0), enchaine sur le callback stocke. */
export function AnimTranslateLinear_WithFollowup(sprite: DecompSprite): void {
  if (AnimTranslateLinear(sprite)) SetCallbackToStoredInData6(sprite);
}

/** 1:1 decomp battle_anim_mons.c:1093 `void StartAnimLinearTranslation(struct Sprite *sprite)`.
 *  Pre : data[0]=nbFrames, data[2]=destX, data[4]=destY (poses par l'appelant). Capture x/y de
 *  depart dans data[1]/data[3], calcule les deltas, installe AnimTranslateLinear_WithFollowup
 *  comme callback PUIS l'execute immediatement (= `sprite->callback(sprite)` du decomp). */
export function StartAnimLinearTranslation(sprite: DecompSprite): void {
  sprite.data[1] = sprite.x;
  sprite.data[3] = sprite.y;
  InitAnimLinearTranslation(sprite);
  sprite.callback = AnimTranslateLinear_WithFollowup;
  AnimTranslateLinear_WithFollowup(sprite);
}

// ════════════════════════════════════════════════════════════════════════════
// TRANCHE 2 (data, 2026-06-08) — fondation de GetBattlerSpriteCoord (#19).
// Tables PURES portees 1:1. Les fonctions GetBattlerSpriteCoord/Final_Y/YDelta/
// Elevation viendront APRES (besoin d'une source SYNCHRONE des y_offset par-espece
// = gMonFront/BackPicCoords, aujourd'hui seulement en JSON async). DORMANT.
// ════════════════════════════════════════════════════════════════════════════

// 1:1 decomp include/battle_anim.h:162-168 — enum coordType de GetBattlerSpriteCoord.
export const BATTLER_COORD_X = 0;
export const BATTLER_COORD_Y = 1;
export const BATTLER_COORD_X_2 = 2;
export const BATTLER_COORD_Y_PIC_OFFSET = 3;
export const BATTLER_COORD_Y_PIC_OFFSET_DEFAULT = 4;

/** 1:1 decomp gba/types.h `struct UCoords8 { u8 x, y; }`. */
export interface UCoords8 { x: number; y: number; }

// 1:1 decomp battle_anim_mons.c:38-52 `static const struct UCoords8 sBattlerCoords[][MAX_BATTLERS_COUNT]`.
// Indexe [IS_DOUBLE_BATTLE()][GetBattlerPosition(battler)] : position de base (px) du
// sprite de chaque battler (B_POSITION_PLAYER_LEFT/OPPONENT_LEFT/PLAYER_RIGHT/OPPONENT_RIGHT).
export const sBattlerCoords: ReadonlyArray<ReadonlyArray<UCoords8>> = [
  [ // [0] Single battle
    { x: 72, y: 80 },   // B_POSITION_PLAYER_LEFT
    { x: 176, y: 40 },  // B_POSITION_OPPONENT_LEFT
    { x: 48, y: 40 },   // B_POSITION_PLAYER_RIGHT
    { x: 112, y: 80 },  // B_POSITION_OPPONENT_RIGHT
  ],
  [ // [1] Double battle
    { x: 32, y: 80 },
    { x: 200, y: 40 },
    { x: 90, y: 88 },
    { x: 152, y: 32 },
  ],
];

// 1:1 decomp src/data/pokemon_graphics/enemy_mon_elevation.h (`#include` dans
// battle_anim_mons.c). `const u8 gEnemyMonElevation[NUM_SPECIES]` : de combien (px)
// le mon ADVERSE est remonte au-dessus de sa position normale en combat (especes
// volantes/flottantes). SPARSE : transcription 1:1 des 61 entrees non-nulles ; toutes
// les autres especes = 0. Cle = nom enum SPECIES_X (transcription verifiable
// directement vs la decomp). GetBattlerElevation (a venir) lira via species num ->
// nom (reverseDecompConstant), defaut 0. Cf. la table decomp indexee par num.
export const gEnemyMonElevation: Readonly<Record<string, number>> = {
  SPECIES_BUTTERFREE: 8, SPECIES_BEEDRILL: 8, SPECIES_PIDGEY: 16, SPECIES_PIDGEOT: 4,
  SPECIES_FEAROW: 6, SPECIES_ZUBAT: 8, SPECIES_GOLBAT: 8, SPECIES_VENOMOTH: 8,
  SPECIES_GEODUDE: 16, SPECIES_MAGNEMITE: 16, SPECIES_MAGNETON: 8, SPECIES_GASTLY: 4,
  SPECIES_HAUNTER: 4, SPECIES_VOLTORB: 10, SPECIES_ELECTRODE: 12, SPECIES_KOFFING: 8,
  SPECIES_WEEZING: 6, SPECIES_AERODACTYL: 7, SPECIES_ARTICUNO: 6, SPECIES_ZAPDOS: 8,
  SPECIES_MOLTRES: 5, SPECIES_DRAGONITE: 6, SPECIES_MEW: 8, SPECIES_LEDIAN: 8,
  SPECIES_CROBAT: 6, SPECIES_HOPPIP: 11, SPECIES_SKIPLOOM: 12, SPECIES_JUMPLUFF: 9,
  SPECIES_YANMA: 8, SPECIES_MISDREAVUS: 8, SPECIES_UNOWN: 8, SPECIES_GLIGAR: 6,
  SPECIES_LUGIA: 6, SPECIES_HO_OH: 6, SPECIES_CELEBI: 15, SPECIES_BEAUTIFLY: 8,
  SPECIES_DUSTOX: 10, SPECIES_NINJASK: 10, SPECIES_SHEDINJA: 8, SPECIES_WINGULL: 16,
  SPECIES_PELIPPER: 8, SPECIES_MASQUERAIN: 10, SPECIES_BALTOY: 4, SPECIES_CLAYDOL: 10,
  SPECIES_FLYGON: 7, SPECIES_GLALIE: 12, SPECIES_LUNATONE: 13, SPECIES_SOLROCK: 4,
  SPECIES_SWABLU: 12, SPECIES_ALTARIA: 8, SPECIES_DUSKULL: 9, SPECIES_SHUPPET: 12,
  SPECIES_BANETTE: 8, SPECIES_CASTFORM: 16, SPECIES_BELDUM: 8, SPECIES_RAYQUAZA: 6,
  SPECIES_LATIAS: 6, SPECIES_LATIOS: 6, SPECIES_JIRACHI: 12, SPECIES_DEOXYS: 8,
  SPECIES_CHIMECHO: 12,
};

// ════════════════════════════════════════════════════════════════════════════
// TRANCHE 3 (fonctions, 2026-06-08) — GetBattlerSpriteCoord & cascade (#19).
// Porte le graphe COMPLET battle_anim_mons.c:112-330. Les cas Unown/Castform/
// transform sont portes en STRUCTURE mais REDUITS a l'espece de BASE / forme
// NORMAL : le runtime ne modelise PAS les formes (gBattleMonForms) ni l'override
// Transform (gBattleSpritesDataPtr->battlerData.transformSpecies), et le chargement
// du sprite mon (battle-controller-opponent) utilise deja l'espece de BASE
// (reverseDecompConstant) -> GetBattlerSpriteCoord reste COHERENT avec la position
// reelle du sprite (1:1 quand ces features sont inactives ; dette = formes-lettres).
// ════════════════════════════════════════════════════════════════════════════

// 1:1 decomp battle_util.c — IsDoubleBattle() = gBattleTypeFlags & BATTLE_TYPE_DOUBLE.
function IsDoubleBattle(): boolean {
  return (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0;
}
// 1:1 decomp — GetBattlerSide(battler) = GetBattlerPosition(battler) & BIT_SIDE (BIT_SIDE=1).
function GetBattlerSide(battler: number): number {
  return GetBattlerPosition(battler) & 1;
}
// 1:1 decomp battle_anim.c:1102 IsContest() = !gMain.inBattle. Pas de mode contest dans
// ce jeu (post-camion) -> toujours false (= en combat). Cf. battle-anim-interpreter.ts:98.
function IsContest(): boolean {
  return false;
}
// species num -> nom enum SPECIES_X (cle de getMon*PicCoords / gEnemyMonElevation).
function _speciesName(species: number): string {
  return reverseDecompConstant(species, 'SPECIES_') ?? 'SPECIES_NONE';
}
// 1:1 decomp : species du battler via gEnemyParty/gPlayerParty[gBattlerPartyIndexes].
// transformSpecies (gBattleSpritesDataPtr->battlerData) non modelise -> pas d'override
// Transform (= branche !transformSpecies, 1:1 quand Transform inactif).
function _battlerSpecies(battler: number): number {
  const party = GetBattlerSide(battler) !== B_SIDE_PLAYER ? gEnemyParty : gPlayerParty;
  return GetMonData(party[gBattlerPartyIndexes[battler]] as never, MON_DATA_SPECIES) as number;
}

// Tables Castform (battle_anim_mons.c:55-78), indexees par gBattleMonForms[battler]
// (NORMAL/FIRE/WATER/ICE). Forme non modelisee runtime -> 0 (NORMAL).
const sCastformFrontYOffset: ReadonlyArray<number> = [17, 9, 9, 8];   // gCastformFrontSpriteCoords[].y_offset
const sCastformElevations: ReadonlyArray<number> = [13, 14, 13, 13];
const sCastformBackSpriteYCoords: ReadonlyArray<number> = [0, 0, 0, 0];

/** 1:1 decomp battle_anim_mons.c:172 `u8 GetBattlerYDelta(u8 battler, u16 species)`.
 *  Renvoie le y_offset (px) du pic du mon (back = joueur, front = adverse). */
export function GetBattlerYDelta(battler: number, species: number): number {
  const name = _speciesName(species);
  if (GetBattlerSide(battler) === B_SIDE_PLAYER || IsContest()) {
    // back pic (mon JOUEUR)
    if (name === 'SPECIES_UNOWN') {
      // 1:1 : forme-lettre via GET_UNOWN_LETTER(personality) -> gMonBackPicCoords[letter+SPECIES_UNOWN_B-1].
      // Formes Unown non modelisees (sprite charge en base) -> base. Dette : formes-lettres.
      return getMonBackPicCoords('SPECIES_UNOWN').yOffset;
    }
    if (name === 'SPECIES_CASTFORM') return sCastformBackSpriteYCoords[0];   // forme NORMAL
    return getMonBackPicCoords(name).yOffset;   // species > NUM_SPECIES -> SPECIES_NONE (fallback 1:1 [0])
  }
  // front pic (mon ADVERSE)
  if (name === 'SPECIES_UNOWN') return getMonFrontPicCoords('SPECIES_UNOWN').yOffset;
  if (name === 'SPECIES_CASTFORM') return sCastformFrontYOffset[0];
  return getMonFrontPicCoords(name).yOffset;
}

/** 1:1 decomp battle_anim_mons.c:251 `u8 GetBattlerElevation(u8 battler, u16 species)`.
 *  Hauteur (px) au-dessus de la position normale, mon ADVERSE uniquement (volant/flottant). */
export function GetBattlerElevation(battler: number, species: number): number {
  let ret = 0;
  if (GetBattlerSide(battler) === B_SIDE_OPPONENT) {
    if (!IsContest()) {
      const name = _speciesName(species);
      if (name === 'SPECIES_CASTFORM') ret = sCastformElevations[0];   // forme NORMAL
      else ret = gEnemyMonElevation[name] ?? 0;   // table sparse : defaut 0 (= gEnemyMonElevation[0])
    }
  }
  return ret;
}

/** 1:1 decomp battle_anim_mons.c:269 `u8 GetBattlerSpriteFinal_Y(u8 battler, u16 species, bool8 a3)`.
 *  y final = y_offset (- elevation cote adverse) + sBattlerCoords.y, avec clamp si a3. */
export function GetBattlerSpriteFinal_Y(battler: number, species: number, a3: boolean): number {
  let offset: number;
  if (GetBattlerSide(battler) === B_SIDE_PLAYER || IsContest()) {
    offset = GetBattlerYDelta(battler, species);
  } else {
    offset = GetBattlerYDelta(battler, species);
    offset -= GetBattlerElevation(battler, species);   // peut etre <0 ; +.y le ramene positif (= u8 1:1)
  }
  let y = offset + sBattlerCoords[IsDoubleBattle() ? 1 : 0][GetBattlerPosition(battler)].y;
  if (a3) {
    if (GetBattlerSide(battler) === B_SIDE_PLAYER) y += 8;
    // 1:1 : DISPLAY_HEIGHT(160) - MON_PIC_HEIGHT(64) + 8 = 104.
    if (y > 104) y = 104;
  }
  return y;
}

/** 1:1 decomp battle_anim_mons.c:112 `u8 GetBattlerSpriteCoord(u8 battler, u8 coordType)`.
 *  Position (px) du sprite du battler selon coordType (X/X_2/Y depuis sBattlerCoords ;
 *  Y_PIC_OFFSET via GetBattlerSpriteFinal_Y = grounding par espece). */
export function GetBattlerSpriteCoord(battler: number, coordType: number): number {
  let retVal: number;
  let ct = coordType;
  if (IsContest()) {
    if (ct === BATTLER_COORD_Y_PIC_OFFSET && battler === 3) ct = BATTLER_COORD_Y;
  }
  switch (ct) {
    case BATTLER_COORD_X:
    case BATTLER_COORD_X_2:
      retVal = sBattlerCoords[IsDoubleBattle() ? 1 : 0][GetBattlerPosition(battler)].x;
      break;
    case BATTLER_COORD_Y:
      retVal = sBattlerCoords[IsDoubleBattle() ? 1 : 0][GetBattlerPosition(battler)].y;
      break;
    case BATTLER_COORD_Y_PIC_OFFSET:
    case BATTLER_COORD_Y_PIC_OFFSET_DEFAULT:
    default: {
      const species = _battlerSpecies(battler);
      if (ct === BATTLER_COORD_Y_PIC_OFFSET) retVal = GetBattlerSpriteFinal_Y(battler, species, true);
      else retVal = GetBattlerSpriteFinal_Y(battler, species, false);
      break;
    }
  }
  return retVal;
}

/** 1:1 decomp battle_anim_mons.c:327 `u8 GetBattlerSpriteDefault_Y(u8 battler)`. */
export function GetBattlerSpriteDefault_Y(battler: number): number {
  return GetBattlerSpriteCoord(battler, BATTLER_COORD_Y_PIC_OFFSET_DEFAULT);
}

/** 1:1 decomp battle_anim_mons.c `RunStoredCallbackWhenAnimEnds(sprite)` —
 *  attend la fin de l'anim de frames puis bascule sur data[6/7]. */
export function RunStoredCallbackWhenAnimEnds(sprite: { animEnded?: boolean }): void {
  if (sprite.animEnded) SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 decomp battle_anim_mons.c:332 `u8 GetSubstituteSpriteDefault_Y(u8 battler)`
 *  — l'ancrage Y du doll Substitute (+16 adversaire / +17 joueur). Callers :
 *  battle_gfx_sfx_util.c:1078 (gfx swap) + reshow_battle_screen.c:215. */
export function GetSubstituteSpriteDefault_Y(battler: number): number {
  let y: number;
  if (GetBattlerSide(battler) !== B_SIDE_PLAYER) {
    y = GetBattlerSpriteCoord(battler, BATTLER_COORD_Y) + 16;
  } else {
    y = GetBattlerSpriteCoord(battler, BATTLER_COORD_Y) + 17;
  }
  return y & 0xFF;
}

// ─── Rot/Scale des sprites battler (battle_anim_mons.c:1260-1360) ──────────
// FIX user 2026-06-10 (« pas de retreci / pas d'anim ») : la 1re version
// ecrivait sprite.oam.affineMode — les sprites du MODELE PLAT n'ont PAS de
// champ .oam (l'OAM reel = rt.gba.oam[sprite.oamIndex] ; affineMode/matrixNum
// = champs PLATS) -> no-op silencieux. Reecrit sur le modele reel.

import { ObjAffineSet } from '../engine/system/decomp-bridge';
import { getRuntime } from '../engine/system/decomp-globals';
import { SetOamMatrix, AllocOamMatrix, CalcCenterToCornerVec } from '../engine/system/sprite';

type RotScaleSprite = {
  oamIndex: number; matrixNum?: number; affineMode?: number;
  affineAnimPaused?: boolean; invisible?: boolean;
  centerToCornerVecX?: number; centerToCornerVecY?: number;
};

function _shouldRotScaleSpeciesBeFlipped(): boolean { return false; }

/** 1:1 décomp `SetSpriteRotScale` (battle_anim_mons.c:1260) : ObjAffineSet →
 *  matrice OAM du sprite (slot sprite.matrixNum, champ PLAT). */
export function SetSpriteRotScale(spriteId: number, xScale: number, yScale: number, rotation: number): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.get(spriteId) as unknown as RotScaleSprite | undefined;
  if (!rt || !sprite) return;
  let sx = xScale;
  if (_shouldRotScaleSpeciesBeFlipped()) sx = -sx;
  const dst = [{ pa: 0x100, pb: 0, pc: 0, pd: 0x100 }];
  ObjAffineSet({ xScale: sx, yScale, rotation }, dst, 1, 2);
  const m = sprite.matrixNum ?? 0;
  SetOamMatrix(m, dst[0].pa, dst[0].pb, dst[0].pc, dst[0].pd);
}

/** 1:1 décomp `PrepareBattlerSpriteForRotScale` (battle_anim_mons.c:1295) :
 *  alloue/assigne une matrice + passe le sprite en affine double (champs PLATS
 *  + OamEntry hardware rt.gba.oam[oamIndex]). */
export function PrepareBattlerSpriteForRotScale(spriteId: number, objMode: number): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.get(spriteId) as unknown as RotScaleSprite | undefined;
  if (!rt || !sprite) return;
  sprite.invisible = false;
  sprite.affineAnimPaused = true;
  if (!sprite.affineMode || sprite.matrixNum === undefined || sprite.matrixNum < 0) {
    const m = AllocOamMatrix();
    sprite.matrixNum = m >= 0 ? m : 0;
  }
  sprite.affineMode = 3; // ST_OAM_AFFINE_DOUBLE
  const oam = (rt as unknown as { gba?: { oam?: Array<{ affineMode?: number; matrixNum?: number; objMode?: number }> } }).gba?.oam?.[sprite.oamIndex];
  if (oam) {
    oam.affineMode = 3;
    oam.matrixNum = sprite.matrixNum;
    oam.objMode = objMode;
  }
  const v = CalcCenterToCornerVec(0, 3, 3);
  sprite.centerToCornerVecX = v.centerToCornerVecX;
  sprite.centerToCornerVecY = v.centerToCornerVecY;
}

/** 1:1 décomp `ResetSpriteRotScale` (battle_anim_mons.c:1309). */
export function ResetSpriteRotScale(spriteId: number): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.get(spriteId) as unknown as RotScaleSprite | undefined;
  if (!rt || !sprite) return;
  SetSpriteRotScale(spriteId, 0x100, 0x100, 0);
  // 1:1 décomp : ST_OAM_AFFINE_NORMAL (1), PAS OFF — et CalcCenterToCornerVec
  // RECALCULÉ au mode normal. Notre version remettait 0 SANS recalc -> le c2c
  // -64 du Prepare (DOUBLE) restait À JAMAIS = le Wailord coupé en haut/
  // décalé -32px après son anim d'apparition (retours user ×4, sonde
  // c2c=-64 affine=0 persistant 2026-06-11).
  sprite.affineMode = 1; // ST_OAM_AFFINE_NORMAL
  sprite.affineAnimPaused = false;
  const oam = (rt as unknown as { gba?: { oam?: Array<{ affineMode?: number; objMode?: number; shape?: number; size?: number }> } }).gba?.oam?.[sprite.oamIndex];
  if (oam) {
    oam.affineMode = 1;
    oam.objMode = 0;
  }
  const v = CalcCenterToCornerVec(oam?.shape ?? 0, oam?.size ?? 3, 1);
  sprite.centerToCornerVecX = v.centerToCornerVecX;
  sprite.centerToCornerVecY = v.centerToCornerVecY;
}

/** 1:1 décomp `TrySetSpriteRotScale(sprite, recalcCenter, xScale, yScale, rotation)`
 *  (battle_anim_mons.c:1322) : ne pose la matrice QUE si le sprite est déjà
 *  affine (oam.affineMode & 1). */
export function TrySetSpriteRotScale(spriteId: number, recalcCenterVector: boolean, xScale: number, yScale: number, rotation: number): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.get(spriteId) as unknown as RotScaleSprite | undefined;
  if (!rt || !sprite) return;
  if (((sprite.affineMode ?? 0) & 1) === 0) return;
  sprite.affineAnimPaused = true;
  if (recalcCenterVector) {
    const v = CalcCenterToCornerVec(0, 3, 3);
    sprite.centerToCornerVecX = v.centerToCornerVecX;
    sprite.centerToCornerVecY = v.centerToCornerVecY;
  }
  SetSpriteRotScale(spriteId, xScale, yScale, rotation);
}

/** 1:1 décomp `ResetSpriteRotScale_PreserveAffine(sprite)` (battle_anim_mons.c:1356). */
export function ResetSpriteRotScale_PreserveAffine(spriteId: number): void {
  TrySetSpriteRotScale(spriteId, true, 0x100, 0x100, 0);
  const rt = getRuntime();
  const sprite = rt?.gSprites?.get(spriteId) as unknown as RotScaleSprite | undefined;
  if (sprite) sprite.affineAnimPaused = false;
}

/** 1:1 décomp `SetBattlerSpriteYOffsetFromRotation(spriteId)`
 *  (battle_anim_mons.c:1342) : y2 = |c| >> 3 de la matrice courante. */
export function SetBattlerSpriteYOffsetFromRotation(spriteId: number): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.get(spriteId) as unknown as (RotScaleSprite & { y2?: number }) | undefined;
  if (!rt || !sprite) return;
  const m = (rt as unknown as { gba?: { affineParams?: Array<{ pc?: number }> } }).gba?.affineParams?.[sprite.matrixNum ?? 0];
  let c = m?.pc ?? 0;
  if (c < 0) c = -c;
  sprite.y2 = c >> 3;
}

// ═══════════════════════════════════════════════════════════════════════════
// TranslateAnimSpriteToTargetMonLocation (battle_anim_mons.c) — C0 2026-06-11.
// LE projectile générique (Ember/Bubble/Swift/...). DÉPLACÉ depuis
// battle_anim_fire.ts (qui DOUBLONNAIT la chaîne linéaire : mons l'avait déjà,
// tranche 5a-1 — doublon supprimé, on branche sur l'EXISTANTE ci-dessus).
// ═══════════════════════════════════════════════════════════════════════════
function _projItf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimSprite?: (s: unknown) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _projBattlerSprite(battler: number): DecompSprite | undefined {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as {
    getBattlerMonSpriteId?: (b: number) => number;
  } | undefined;
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, DecompSprite> } | undefined;
  const id = co?.getBattlerMonSpriteId?.(battler);
  return id !== undefined && id >= 0 ? rt?.gSprites?.get(id) : undefined;
}

/** 1:1 `TranslateAnimSpriteToTargetMonLocation` : args [startXOff, startYOff,
 *  tgtXOff, tgtYOff, durée, flags]. Départ ATTAQUANT, arrivée CIBLE, destroy
 *  à l'arrivée (StoreSpriteCallbackInData6 → la chaîne linéaire existante). */
export function TranslateAnimSpriteToTargetMonLocation(sprite: DecompSprite): void {
  const args = _projItf().getArgs?.() ?? [0, 0, 0, 0, 20, 0];
  const atk = _projItf().getAttacker?.() ?? 0;
  const tgt = _projItf().getTarget?.() ?? 1;
  const monA = _projBattlerSprite(atk);
  if (monA) {
    sprite.x = monA.x + (monA.x2 ?? 0) + args[0];
    sprite.y = monA.y + (monA.y2 ?? 0) + args[1];
  }
  sprite.invisible = false;
  if ((atk & 1) !== 0 /* != B_SIDE_PLAYER */) args[2] = -args[2];
  const monT = _projBattlerSprite(tgt);
  sprite.data[0] = args[4] || 20;
  sprite.data[2] = ((monT ? monT.x + (monT.x2 ?? 0) : 120) + args[2]) & 0xFFFF;
  sprite.data[4] = ((monT ? monT.y + (monT.y2 ?? 0) : 80) + args[3]) & 0xFFFF;
  StoreSpriteCallbackInData6(sprite, ((s: DecompSprite) => { _projItf().DestroyAnimSprite?.(s); }) as never);
  StartAnimLinearTranslation(sprite);
}

// Surface lazy pour les AnimTasks d'autres modules (DeepInhale squish...).
(globalThis as Record<string, unknown>).__battleAnimMons = {
  SetSpriteRotScale, ResetSpriteRotScale, PrepareBattlerSpriteForRotScale,
  TrySetSpriteRotScale, ResetSpriteRotScale_PreserveAffine,
};

// ─── VAGUE F6 : CloneBattlerSpriteWithBlend (battle_anim_mons.c.c:1626) ───────────────────
// Copie le sprite du battler en clone OBJ_BLEND (traces/afterimages).
// 1:1-net : CreateSpriteInline + copie de l OAM du mon (tile/shape/size/pal).
export function CloneBattlerSpriteWithBlend(animBattler: number): number {
  const itf = _f1Itf();
  const b = animBattler === 0 ? (itf.getAttacker?.() ?? 0) : animBattler === 1 ? (itf.getTarget?.() ?? 1) : -1;
  if (b < 0) return -1;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  const sid = co?.getBattlerMonSpriteId?.(b);
  const rt = getRuntime() as unknown as { gSprites?: Map<number, { x: number; y: number; x2: number; y2: number; oamIndex: number; subpriority?: number }>; CreateSpriteInline?: (t: unknown, x: number, y: number, p: number) => number; gba?: { oam: Array<{ tileId: number; shape: number; size: number; paletteBank: number; priority: number; objMode: number; affineMode: number }> } } | null;
  const mon = sid !== undefined && sid !== 0xFF ? rt?.gSprites?.get(sid) : undefined;
  if (!mon || !rt) return -1;
  const monOam = rt.gba?.oam[mon.oamIndex];
  const cloneId = rt.CreateSpriteInline?.({ oam: { shape: monOam?.shape ?? 0, size: monOam?.size ?? 3, priority: monOam?.priority ?? 2 }, images: [] } as never, mon.x + mon.x2, mon.y + mon.y2, mon.subpriority ?? 3) ?? -1;
  if (cloneId < 0) return -1;
  const clone = rt.gSprites?.get(cloneId);
  const cloneOam = clone ? rt.gba?.oam[clone.oamIndex] : undefined;
  if (cloneOam && monOam) {
    cloneOam.tileId = monOam.tileId;
    cloneOam.paletteBank = monOam.paletteBank;
    cloneOam.objMode = 1; // ST_OAM_OBJ_BLEND
    // syncSpritesToOam écrase oam.objMode avec sprite.objMode chaque frame
    // (même classe que la copie OBJ_WINDOW, fix 2026-06-13).
    (clone as { objMode?: number }).objMode = 1;
  }
  return cloneId;
}
/** 1:1-net `DestroySpriteWithActiveSheet` : destroy simple (la sheet du mon
 *  reste vivante — c est le POINT de la fonction C). */
export function DestroySpriteWithActiveSheet(spriteOrId: number | object): void {
  const rt = getRuntime();
  if (!rt) return;
  let id = typeof spriteOrId === 'number' ? spriteOrId : -1;
  if (id < 0) {
    for (const [sid, sp] of rt.gSprites ?? new Map()) {
      if ((sp as unknown) === spriteOrId) { id = sid as number; break; }
    }
  }
  if (id >= 0) (rt as unknown as { DestroySprite?: (i: number) => void }).DestroySprite?.(id);
}

// ─── VAGUE F1 : AnimTask_BlendMonInAndOut (battle_anim_mons.c.c, 14 usages) ───────────────
// Le mon pulse vers une couleur (BlendPalette aller-retour x N).
import { BlendPalette as _f1Blend } from '../engine/system/decomp-globals';
type _F1Task = { taskId: number; data: number[]; func?: unknown };
function _f1Itf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _f1SpriteId(animBattler: number): number {
  const itf = _f1Itf();
  const b = animBattler === 0 ? (itf.getAttacker?.() ?? 0) : animBattler === 1 ? (itf.getTarget?.() ?? 1) : -1;
  if (b < 0) return 0xFF;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  return co?.getBattlerMonSpriteId?.(b) ?? 0xFF;
}
export function AnimTask_BlendMonInAndOut(task: _F1Task): void {
  const itf = _f1Itf();
  const args = itf.getArgs?.() ?? [];
  const spriteId = _f1SpriteId(args[0]);
  if (spriteId === 0xFF) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  const rt = getRuntime();
  const sp = rt?.gSprites?.get(spriteId) as { oamIndex: number } | undefined;
  const oam = sp ? (rt as unknown as { gba: { oam: Array<{ paletteBank: number }> } }).gba.oam[sp.oamIndex] : undefined;
  task.data[0] = 256 + (oam?.paletteBank ?? 0) * 16 + 1; // OBJ_PLTT_ID + 1
  AnimTask_BlendPalInAndOutSetup(task, args);
}
function AnimTask_BlendPalInAndOutSetup(task: _F1Task, args: number[]): void {
  task.data[1] = args[1];
  task.data[2] = 0;
  task.data[3] = args[2];
  task.data[4] = 0;
  task.data[5] = args[3];
  task.data[6] = 0;
  task.data[7] = args[4];
  task.func = AnimTask_BlendMonInAndOut_Step;
}
function AnimTask_BlendMonInAndOut_Step(task: _F1Task): void {
  if (++task.data[4] >= task.data[5]) {
    task.data[4] = 0;
    if (!task.data[6]) {
      task.data[2]++;
      _f1Blend(task.data[0], 15, task.data[2], task.data[1]);
      if (task.data[2] === task.data[3]) task.data[6] = 1;
    } else {
      task.data[2]--;
      _f1Blend(task.data[0], 15, task.data[2], task.data[1]);
      if (!task.data[2]) {
        if (--task.data[7]) { task.data[4] = 0; task.data[6] = 0; }
        else { _f1Itf().DestroyAnimVisualTask?.(task.taskId); }
      }
    }
  }
}
/** 1:1 `AnimTask_BlendPalInAndOutByTag` (battle_anim_mons.c.c:1774) : meme Setup mais la
 *  palette vient du TAG (args[0]) — data[0] = (palette*16)+0x101. */
export function AnimTask_BlendPalInAndOutByTag(task: _F1Task): void {
  const itf = _f1Itf();
  const args = itf.getArgs?.() ?? [];
  const spApi = (globalThis as Record<string, unknown>).__sprite as { IndexOfSpritePaletteTag?: (t: number | string) => number } | undefined;
  const palette = spApi?.IndexOfSpritePaletteTag?.(args[0]) ?? 0xFF;
  if (palette === 0xFF) {
    itf.DestroyAnimVisualTask?.(task.taskId);
    return;
  }
  task.data[0] = palette * 0x10 + 0x101; // = 256 + palette*16 + 1 (OBJ, couleur 1)
  AnimTask_BlendPalInAndOutSetup(task, args);
}
import { registerAnimTasks as _f1Reg } from '../engine/battle/battle-anim-registry';
_f1Reg({
  AnimTask_BlendMonInAndOut: AnimTask_BlendMonInAndOut as never,
  AnimTask_BlendPalInAndOutByTag: AnimTask_BlendPalInAndOutByTag as never,
});

// ─── Sous-système AFFINE-PAR-TASK (battle_anim_mons.c:2240-2330) ────────────
// PrepareAffineAnimInTaskData/RunAffineAnimFromTaskData — utilisé par ~30
// AnimTasks (Splash, GrowAndShrink, Minimize…). Le C stocke le ptr des cmds
// dans data[13..14] (StorePointerInVars) ; nous : side-table par taskId.
export type TaskAffineCmd = { xScale: number; yScale: number; rotation: number; duration: number };
export type TaskAffineTable = { frames: readonly TaskAffineCmd[]; terminator: string };
const _taskAffineCmds = new Map<number, TaskAffineTable>();
type _TaskLike = { taskId: number; data: number[] };

/** 1:1 `PrepareAffineAnimInTaskData(task, spriteId, cmds)`. */
export function PrepareAffineAnimInTaskData(task: _TaskLike, spriteId: number, cmds: TaskAffineTable): void {
  task.data[7] = 0;    // cmd index
  task.data[8] = 0;    // frame-in-cmd
  task.data[9] = 0;    // loop counter
  task.data[15] = spriteId;
  task.data[10] = 0x100; // xScale
  task.data[11] = 0x100; // yScale
  task.data[12] = 0;     // rotation
  _taskAffineCmds.set(task.taskId, cmds);
  PrepareBattlerSpriteForRotScale(spriteId, 0 /* ST_OAM_OBJ_NORMAL */);
}

/** 1:1 `SetBattlerSpriteYOffsetFromYScale(spriteId)` (battle_anim_mons.c.c) : y2 compense la
 *  réduction verticale (le mon « s'écrase » au sol, pas au centre). */
export function SetBattlerSpriteYOffsetFromYScale(spriteId: number): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.get(spriteId) as { y2: number; oamIndex: number } | undefined;
  if (!rt || !sprite) return;
  const MON_PIC_HEIGHT = 64;
  const v = MON_PIC_HEIGHT; // GetBattlerYDeltaFromSpriteId ≈ 0 (dette douce species delta)
  const m = (rt as unknown as { gOamMatrices?: Array<{ d: number }> }).gOamMatrices;
  const oam = (rt as unknown as { gba: { oam: Array<{ matrixNum?: number; affineParamIndex?: number }> } }).gba.oam[sprite.oamIndex];
  const d = m?.[oam?.matrixNum ?? oam?.affineParamIndex ?? 0]?.d ?? 0x100;
  let v2 = d !== 0 ? Math.trunc((v << 8) / d) : v * 2;
  if (v2 > MON_PIC_HEIGHT * 2) v2 = MON_PIC_HEIGHT * 2;
  sprite.y2 = Math.trunc((v - v2) / 2);
}

/** 1:1 `SetBattlerSpriteYOffsetFromOtherYScale(spriteId, otherSpriteId)`
 *  (battle_anim_mons.c:1886) — y2 = déplacement induit par la matrice de
 *  spriteId (échelle Y), base 64px (même dette douce species-delta que
 *  SetBattlerSpriteYOffsetFromYScale : GetBattlerYDeltaFromSpriteId ≈ 0). */
export function SetBattlerSpriteYOffsetFromOtherYScale(spriteId: number, _otherSpriteId: number): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.get(spriteId) as { y2: number; oamIndex: number } | undefined;
  if (!rt || !sprite) return;
  const MON_PIC_HEIGHT = 64;
  const v = MON_PIC_HEIGHT; // - GetBattlerYDeltaFromSpriteId(other)*2 (≈ 0)
  const m = (rt as unknown as { gOamMatrices?: Array<{ d: number }> }).gOamMatrices;
  const oam = (rt as unknown as { gba: { oam: Array<{ matrixNum?: number; affineParamIndex?: number }> } }).gba.oam[sprite.oamIndex];
  const d = m?.[oam?.matrixNum ?? oam?.affineParamIndex ?? 0]?.d ?? 0x100;
  let v2 = d !== 0 ? Math.trunc((v << 8) / d) : v * 2;
  if (v2 > MON_PIC_HEIGHT * 2) v2 = MON_PIC_HEIGHT * 2;
  sprite.y2 = Math.trunc((v - v2) / 2);
}

/** 1:1 `GetBattlerSpriteBGPriorityRank(battler)` (battle_anim_mons.c) :
 *  PLAYER_LEFT(0)/OPPONENT_RIGHT(3) → 2 (BG2), sinon → 1 (BG1). Contest → 1. */
export function GetBattlerSpriteBGPriorityRank(battler: number): number {
  if (!IsContest()) {
    const position = GetBattlerPosition(battler);
    if (position === 0 || position === 3) return 2;  // B_POSITION_PLAYER_LEFT | B_POSITION_OPPONENT_RIGHT
    return 1;
  }
  return 1;
}

/** 1:1 `RunAffineAnimFromTaskData(task)` — TRUE tant que l anim tourne. */
export function RunAffineAnimFromTaskData(task: _TaskLike): boolean {
  const table = _taskAffineCmds.get(task.taskId);
  if (!table) return false;
  const frames = table.frames;
  const idx = task.data[7];
  // END (terminator atteint)
  if (idx >= frames.length) {
    const term = table.terminator ?? 'END';
    if (term.startsWith('JUMP')) { task.data[7] = parseInt(term.slice(5), 10) || 0; return true; }
    if (term.startsWith('LOOP')) {
      // LOOP:n 1:1 : reboucler n fois (data[9] = compteur) puis END.
      const n = parseInt(term.slice(5), 10) || 0;
      if (n > 0) {
        if (task.data[9] === 0) task.data[9] = n;
        if (--task.data[9] > 0) { task.data[7] = 0; return true; }
        // compte epuise -> tomber au END ci-dessous
      } else {
        task.data[7] = 0;
        return true;
      }
    }
    const rt = getRuntime();
    const sprite = rt?.gSprites?.get(task.data[15]) as { y2: number } | undefined;
    if (sprite) sprite.y2 = 0;
    ResetSpriteRotScale(task.data[15]);
    _taskAffineCmds.delete(task.taskId);
    return false;
  }
  let cmd = frames[idx];
  if (!cmd.duration) {
    task.data[10] = cmd.xScale;
    task.data[11] = cmd.yScale;
    task.data[12] = cmd.rotation;
    task.data[7]++;
    cmd = frames[task.data[7]] ?? cmd;
    if (task.data[7] >= frames.length) return true;
  }
  task.data[10] += cmd.xScale;
  task.data[11] += cmd.yScale;
  task.data[12] += cmd.rotation;
  SetSpriteRotScale(task.data[15], task.data[10] & 0xFFFF, task.data[11] & 0xFFFF, task.data[12] & 0xFFFF);
  SetBattlerSpriteYOffsetFromYScale(task.data[15]);
  if (++task.data[8] >= cmd.duration) {
    task.data[8] = 0;
    task.data[7]++;
  }
  return true;
}

/** 1:1 `TranslateSpriteLinearFixedPoint` (battle_anim_mons.c:607) : mouvement
 *  8.8 fixed-point data[1]/data[2], duree data[0] -> stored callback. */
export function TranslateSpriteLinearFixedPoint(sprite: DecompSprite): void {
  if (sprite.data[0] > 0) {
    sprite.data[0]--;
    sprite.data[3] = (sprite.data[3] + sprite.data[1]) & 0xFFFF;
    sprite.data[4] = (sprite.data[4] + sprite.data[2]) & 0xFFFF;
    sprite.x2 = toS16(sprite.data[3]) >> 8;
    sprite.y2 = toS16(sprite.data[4]) >> 8;
  } else {
    SetCallbackToStoredInData6(sprite);
  }
}

/** 1:1 `SetSpriteCoordsToAnimAttackerCoords` (battle_anim_mons.c:755). */
export function SetSpriteCoordsToAnimAttackerCoords(sprite: { x: number; y: number }): void {
  const atk = _projItf().getAttacker?.() ?? 0;
  sprite.x = GetBattlerSpriteCoord(atk, 2 /* X_2 */);
  sprite.y = GetBattlerSpriteCoord(atk, 3 /* Y_PIC_OFFSET */);
}

/** 1:1 `TranslateSpriteLinearAndFlicker` (battle_anim_mons.c:681) : mouvement
 *  fixed-point + clignotement (invisible toggle tous les data[5] frames). */
export function TranslateSpriteLinearAndFlicker(sprite: DecompSprite): void {
  if (sprite.data[0] > 0) {
    sprite.data[0]--;
    sprite.x2 = toS16(sprite.data[2]) >> 8;
    sprite.data[2] = (sprite.data[2] + sprite.data[1]) & 0xFFFF;
    sprite.y2 = toS16(sprite.data[4]) >> 8;
    sprite.data[4] = (sprite.data[4] + sprite.data[3]) & 0xFFFF;
    if (sprite.data[5] && sprite.data[0] % sprite.data[5] === 0) {
      (sprite as { invisible?: boolean }).invisible = !(sprite as { invisible?: boolean }).invisible;
    }
  } else {
    SetCallbackToStoredInData6(sprite);
  }
}

/** 1:1 `AnimTranslateLinearAndFlicker` (:2358 — 3 templates générés) : args
 *  [x, y, durée, xVel, yVel, flickerPériode, animNum]. */
export function AnimTranslateLinearAndFlicker(sprite: DecompSprite): void {
  const itf = _projItf();
  const args = itf.getArgs?.() ?? [0, 0, 20, 0, 0, 0, 0];
  const atk = itf.getAttacker?.() ?? 0;
  let a3 = args[3] | 0;
  if ((atk & 1) !== 0 /* != B_SIDE_PLAYER */) {
    sprite.x -= args[0] | 0;
    a3 = -a3;
  } else {
    sprite.x += args[0] | 0;
  }
  sprite.y += args[1] | 0;
  (sprite as { invisible?: boolean }).invisible = false;
  sprite.data[0] = args[2] | 0;
  sprite.data[1] = a3;
  sprite.data[2] = 0;
  sprite.data[3] = args[4] | 0;
  sprite.data[4] = 0;
  sprite.data[5] = args[5] | 0;
  // StartSpriteAnim(args[6]) : la table generee est posee par Cmd_createsprite —
  // changer d'anim via animNum.
  const spA = sprite as unknown as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if (spA.anims && (args[6] | 0) > 0) { spA.animNum = args[6] | 0; spA.animBeginning = true; spA.animEnded = false; }
  StoreSpriteCallbackInData6(sprite, ((sp: DecompSprite) => { _projItf().DestroyAnimSprite?.(sp); }) as never);
  sprite.callback = TranslateSpriteLinearAndFlicker as never;
}

/** 1:1 `AnimTranslateLinearAndFlicker_Flipped` (battle_anim_mons.c:2335-2356)
 *  — callback de 2 templates status_effects (.c:64/:207) : ancre aux coords
 *  attaquant, hFlip + négation de la vélocité X côté adverse, puis
 *  TranslateSpriteLinearAndFlicker → DestroySpriteAndMatrix. */
export function AnimTranslateLinearAndFlicker_Flipped(sprite: DecompSprite): void {
  const itf = _projItf();
  const args = itf.getArgs?.() ?? [0, 0, 20, 0, 0, 0];
  const atk = itf.getAttacker?.() ?? 0;
  SetSpriteCoordsToAnimAttackerCoords(sprite as never);
  if ((atk & 1) !== 0 /* GetBattlerSide != B_SIDE_PLAYER */) {
    sprite.x -= args[0] | 0;
    // 1:1 .c:2341 : gBattleAnimArgs[3] = -gBattleAnimArgs[3] (mutation du
    // buffer vivant — relu juste après pour data[1]).
    args[3] = -(args[3] | 0);
    (sprite as { hFlip?: boolean }).hFlip = true;
  } else {
    sprite.x += args[0] | 0;
  }
  sprite.y += args[1] | 0;
  sprite.data[0] = args[2] | 0;
  sprite.data[1] = args[3] | 0;
  sprite.data[3] = args[4] | 0;
  sprite.data[5] = args[5] | 0;
  StoreSpriteCallbackInData6(sprite, DestroySpriteAndMatrix as never);
  sprite.callback = TranslateSpriteLinearAndFlicker as never;
}

/** 1:1 `AnimWeatherBallUp`(+_Step) (battle_anim_mons.c:2510) : la boule météo
 *  monte depuis l'attaquant (x/10, y/10 fixed-dixième, décélération) et sort
 *  par le haut. (Était LE skip « mons.ts gelé » de la mini-vague finale.) */
export function AnimWeatherBallUp(sprite: DecompSprite): void {
  const itf = _projItf();
  const atk = itf.getAttacker?.() ?? 0;
  sprite.x = GetBattlerSpriteCoord(atk, 2 /* X_2 */);
  sprite.y = GetBattlerSpriteCoord(atk, 3 /* Y_PIC_OFFSET */);
  (sprite as { invisible?: boolean }).invisible = false;
  sprite.data[0] = (atk & 1) === 0 ? 5 : -10;
  sprite.data[1] = -40;
  sprite.data[2] = 0;
  sprite.data[3] = 0;
  sprite.callback = AnimWeatherBallUp_Step as never;
}
function AnimWeatherBallUp_Step(sprite: DecompSprite): void {
  sprite.data[2] += sprite.data[0];
  sprite.data[3] += sprite.data[1];
  sprite.x2 = Math.trunc(sprite.data[2] / 10);
  sprite.y2 = Math.trunc(sprite.data[3] / 10);
  if (sprite.data[1] < -20) sprite.data[1]++;
  if (sprite.y + sprite.y2 < -32) _projItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimWeatherBallDown` (:2534 — 5 templates générés) : la boule météo
 *  tombe du haut de l'écran vers le point cible (linéaire). */
export function AnimWeatherBallDown(sprite: DecompSprite): void {
  const itf = _projItf();
  const args = itf.getArgs?.() ?? [0, 0, 20, 0, 0, 0];
  const tgt = itf.getTarget?.() ?? 1;
  sprite.data[0] = args[2] | 0;
  sprite.data[2] = (sprite.x + (args[4] | 0)) & 0xFFFF;
  sprite.data[4] = (sprite.y + (args[5] | 0)) & 0xFFFF;
  if ((tgt & 1) === 0 /* B_SIDE_PLAYER */) {
    const x = ((args[4] | 0) & 0xFFFF) + 30;
    sprite.x += x;
    sprite.y = (args[5] | 0) - 20;
  } else {
    const x = ((args[4] | 0) & 0xFFFF) - 30;
    sprite.x += x;
    sprite.y = (args[5] | 0) - 80;
  }
  (sprite as { invisible?: boolean }).invisible = false;
  StoreSpriteCallbackInData6(sprite, ((sp: DecompSprite) => { _projItf().DestroyAnimSprite?.(sp); }) as never);
  sprite.callback = StartAnimLinearTranslation as never;
  StartAnimLinearTranslation(sprite);
}

/** 1:1 `AnimThrowProjectile` (battle_anim_mons.c — 3 templates générés) :
 *  args [xOff, yOff, tgtXOff, tgtYOff, durée, arcAmplitude]. Départ attaquant,
 *  arc vers la cible, destroy. */
export function AnimThrowProjectile(sprite: DecompSprite): void {
  const itf = _projItf();
  const args = itf.getArgs?.() ?? [0, 0, 0, 0, 20, 20];
  const atk = itf.getAttacker?.() ?? 0;
  const tgt = itf.getTarget?.() ?? 1;
  InitSpritePosToAnimAttacker(sprite as never, true);
  (sprite as { invisible?: boolean }).invisible = false;
  let a2 = args[2] | 0;
  if ((atk & 1) !== 0) a2 = -a2;
  sprite.data[0] = args[4] | 0;
  sprite.data[2] = (GetBattlerSpriteCoord(tgt, 2 /* X_2 */) + a2) & 0xFFFF;
  sprite.data[4] = (GetBattlerSpriteCoord(tgt, 3 /* Y_PIC_OFFSET */) + (args[3] | 0)) & 0xFFFF;
  sprite.data[5] = args[5] | 0;
  InitAnimArcTranslation(sprite);
  sprite.callback = AnimThrowProjectile_Step as never;
}
function AnimThrowProjectile_Step(sprite: DecompSprite): void {
  if (TranslateAnimHorizontalArc(sprite)) _projItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `SetAnimSpriteInitialXOffset` (battle_anim_mons.c) : le signe de
 *  l'offset X suit le sens attaquant→cible. */
export function SetAnimSpriteInitialXOffset(sprite: { x: number }, xOffset: number): void {
  const atk = _projItf().getAttacker?.() ?? 0;
  const tgt = _projItf().getTarget?.() ?? 1;
  const attackerX = GetBattlerSpriteCoord(atk, 0 /* BATTLER_COORD_X */) & 0xFFFF;
  const targetX = GetBattlerSpriteCoord(tgt, 0) & 0xFFFF;
  if (attackerX > targetX) sprite.x -= xOffset;
  else if (attackerX < targetX) sprite.x += xOffset;
  else if ((atk & 1) !== 0 /* != B_SIDE_PLAYER */) sprite.x -= xOffset;
  else sprite.x += xOffset;
}

/** 1:1 `InitSpritePosToAnimTarget` (:820) — la base sprite est déjà au centre
 *  TARGET (Cmd_createsprite 1:1) ; respectMonPicOffsets=false → re-base X/Y purs. */
export function InitSpritePosToAnimTarget(sprite: { x: number; y: number }, respectMonPicOffsets: boolean): void {
  const tgt = _projItf().getTarget?.() ?? 1;
  const args = _projItf().getArgs?.() ?? [0, 0];
  if (!respectMonPicOffsets) {
    sprite.x = GetBattlerSpriteCoord(tgt, 0 /* X */);
    sprite.y = GetBattlerSpriteCoord(tgt, 1 /* Y */);
  }
  SetAnimSpriteInitialXOffset(sprite, args[0] | 0);
  sprite.y += args[1] | 0;
}

/** 1:1 `InitSpritePosToAnimAttacker` (:833). */
export function InitSpritePosToAnimAttacker(sprite: { x: number; y: number }, respectMonPicOffsets: boolean): void {
  const atk = _projItf().getAttacker?.() ?? 0;
  const args = _projItf().getArgs?.() ?? [0, 0];
  if (!respectMonPicOffsets) {
    sprite.x = GetBattlerSpriteCoord(atk, 0 /* X */);
    sprite.y = GetBattlerSpriteCoord(atk, 1 /* Y */);
  } else {
    sprite.x = GetBattlerSpriteCoord(atk, 2 /* X_2 */);
    sprite.y = GetBattlerSpriteCoord(atk, 3 /* Y_PIC_OFFSET */);
  }
  SetAnimSpriteInitialXOffset(sprite, args[0] | 0);
  sprite.y += args[1] | 0;
}

/** 1:1 `DestroySpriteAndMatrix` : FreeSpriteOamMatrix + DestroyAnimSprite. */
export function DestroySpriteAndMatrix(sprite: unknown): void {
  _projItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimSpriteOnMonPos` (battle_anim_mons.c) — LE callback générique des
 *  sprites « posés sur un mon » (13 templates générés !) :
 *  args [x, y, target?, ignorePicOffsets?] ; attend animEnded/affineAnimEnded
 *  (les tables ANIMCMD générées) → DestroySpriteAndMatrix. */
export function AnimSpriteOnMonPos(sprite: { data: number[]; x: number; y: number; invisible?: boolean; animEnded?: boolean; affineAnimEnded?: boolean; callback: unknown }): void {
  const args = _projItf().getArgs?.() ?? [0, 0, 0, 0];
  if (!sprite.data[0]) {
    const respect = !args[3];
    if (!args[2]) InitSpritePosToAnimAttacker(sprite, respect);
    else InitSpritePosToAnimTarget(sprite, respect);
    sprite.invisible = false;
    sprite.data[0]++;
    sprite.callback = AnimSpriteOnMonPos as never; // reste sur lui-même (1:1 état data[0])
  } else if (sprite.animEnded || sprite.affineAnimEnded) {
    DestroySpriteAndMatrix(sprite);
  }
}

// PHASE 1a : callbacks par nom C pour les templates generes.
import { registerAnimCallbacks as _regCb } from '../engine/battle/battle-anim-generated-bridge';
_regCb({
  TranslateAnimSpriteToTargetMonLocation: TranslateAnimSpriteToTargetMonLocation as never,
  AnimSpriteOnMonPos: AnimSpriteOnMonPos as never,
  SpriteCallbackDummy: ((_s: unknown) => { /* 1:1 vide */ }) as never,
  AnimThrowProjectile: AnimThrowProjectile as never,
  AnimTranslateLinearAndFlicker: AnimTranslateLinearAndFlicker as never,
  AnimTranslateLinearAndFlicker_Flipped: AnimTranslateLinearAndFlicker_Flipped as never,
  AnimWeatherBallDown: AnimWeatherBallDown as never,
  AnimWeatherBallUp: AnimWeatherBallUp as never,
});

// ─── VAGUE F36 : AttackerPunchWithTrace (battle_anim_mons.c.c:2408) + helpers ─────────────
// L'attaquant « punch » vers l'avant en laissant des clones-traces teintés
// (Mega/Comet Punch). + GetBattlerSpriteSubpriority + GetFrustrationPowerLevel.

/** 1:1 `GetBattlerSpriteSubpriority(battler)` (battle_anim_mons.c:2035) :
 *  PLAYER_LEFT 30, PLAYER_RIGHT 20, OPPONENT_LEFT 40, OPPONENT_RIGHT 50
 *  (single : player 30 / opponent 40). Contest → 30/40. */
export function GetBattlerSpriteSubpriority(battler: number): number {
  if (IsContest()) return battler === 2 ? 30 : 40;
  const position = GetBattlerPosition(battler);
  if (position === 0) return 30;       // B_POSITION_PLAYER_LEFT
  if (position === 2) return 20;       // B_POSITION_PLAYER_RIGHT
  if (position === 1) return 40;       // B_POSITION_OPPONENT_LEFT
  return 50;                           // B_POSITION_OPPONENT_RIGHT
}

type _PwTask = { taskId: number; data: number[]; func?: unknown };
function _pwItf(): { getArgs?: () => number[]; getAttacker?: () => number; getAnimFriendship?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _pwSpriteApi(): { AllocSpritePalette?: (tag: number) => number; FreeSpritePaletteByTag?: (tag: number) => void } {
  return ((globalThis as Record<string, unknown>).__sprite as never) ?? {};
}
function _pwAtkSpriteId(): number {
  const b = _pwItf().getAttacker?.() ?? 0;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  return co?.getBattlerMonSpriteId?.(b) ?? 0xFF;
}
const _PW_TAG_BENT_SPOON = 10097; // ANIM_TAG_BENT_SPOON (trace palette du C)

/** 1:1 `CreateBattlerTrace(task, taskId)` (battle_anim_mons.c.c:2474) — un clone blend
 *  teinté de 8 frames de vie, géré PAR LE SPRITE (sActiveTime). */
function _CreateBattlerTrace(task: _PwTask, taskId: number): void {
  const spriteId = CloneBattlerSpriteWithBlend(0);
  if (spriteId < 0) return;
  const rt = getRuntime();
  const clone = rt?.gSprites?.get(spriteId) as { data: number[]; x2: number; oamIndex: number; callback: unknown; subpriority?: number } | undefined;
  const atk = rt?.gSprites?.get(task.data[0]) as { x2: number } | undefined;
  if (!clone) return;
  const oam = (rt as unknown as { gba?: { oam: Array<{ priority: number; paletteBank: number }> } }).gba?.oam[clone.oamIndex];
  if (oam) {
    oam.priority = task.data[6];      // tPriority
    oam.paletteBank = task.data[4];    // tPaletteNum
  }
  clone.data[0] = 8;                  // sActiveTime
  clone.data[1] = taskId;             // sTaskId
  clone.data[2] = spriteId;           // sSpriteId
  clone.x2 = atk?.x2 ?? 0;
  clone.callback = _AnimBattlerTrace as never;
  task.data[5]++;                     // tNumTracesActive
}
/** 1:1 `AnimBattlerTrace` (battle_anim_mons.c.c:2491). */
function _AnimBattlerTrace(sprite: { data: number[] }): void {
  if (--sprite.data[0] === 0) {
    const rt = getRuntime();
    const task = (rt as unknown as { gTasks?: Map<number, _PwTask> }).gTasks?.get(sprite.data[1]);
    if (task) task.data[5]--;         // tNumTracesActive
    DestroySpriteWithActiveSheet(sprite.data[2]);
  }
}

/** 1:1 `AnimTask_AttackerPunchWithTrace` (battle_anim_mons.c.c:2408). arg0 = couleur blend,
 *  arg1 = coeff. */
function AnimTask_AttackerPunchWithTrace(task: _PwTask): void {
  const itf = _pwItf();
  const args = itf.getArgs?.() ?? [0, 0];
  const attacker = itf.getAttacker?.() ?? 0;
  task.data[0] = _pwAtkSpriteId();                                  // tBattlerSpriteId
  if (task.data[0] === 0xFF) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  task.data[1] = GetBattlerSide(attacker) !== 0 ? -8 : 8;           // tMoveSpeed
  task.data[2] = 0;                                                 // tState
  task.data[3] = 0;                                                 // tCounter
  const rt = getRuntime();
  const atkSp = rt?.gSprites?.get(task.data[0]) as { x2: number; oamIndex: number } | undefined;
  // 1:1 décomp (bug ROM conservé) : x2 -= spriteId.
  if (atkSp) atkSp.x2 -= task.data[0];
  task.data[4] = _pwSpriteApi().AllocSpritePalette?.(_PW_TAG_BENT_SPOON) ?? 0xFF;  // tPaletteNum
  task.data[5] = 0;                                                 // tNumTracesActive
  // priority de la trace selon la subpriority du battler (20/40 → 2 sinon 3)
  let prio = GetBattlerSpriteSubpriority(attacker);
  prio = (prio === 20 || prio === 40) ? 2 : 3;
  task.data[6] = prio;                                              // tPriority
  // CpuCopy32(Unfaded[src pal mon] → Faded[dest pal trace]) + BlendPalette
  const monOam = atkSp ? (rt as unknown as { gba?: { oam: Array<{ paletteBank: number }> } }).gba?.oam[atkSp.oamIndex] : undefined;
  const srcSlot = monOam?.paletteBank ?? 0;
  const destSlot = task.data[4] === 0xFF ? 0 : task.data[4];
  const bufs = rt as unknown as {
    gPlttBufferUnfaded?: { get: (i: number) => number };
    gPlttBufferFaded?: { set: (i: number, v: number) => void };
  };
  if (bufs.gPlttBufferUnfaded?.get && bufs.gPlttBufferFaded?.set) {
    for (let k = 0; k < 16; k++) {
      bufs.gPlttBufferFaded.set(256 + destSlot * 16 + k, bufs.gPlttBufferUnfaded.get(256 + srcSlot * 16 + k));
    }
  }
  _f1Blend(256 + destSlot * 16, 16, args[1] | 0, args[0] | 0);
  task.func = _AttackerPunchWithTrace_Step;
}
/** 1:1 `AnimTask_AttackerPunchWithTrace_Step` (battle_anim_mons.c.c:2437). */
function _AttackerPunchWithTrace_Step(task: _PwTask): void {
  const rt = getRuntime();
  const atkSp = rt?.gSprites?.get(task.data[0]) as { x2: number } | undefined;
  switch (task.data[2]) {
    case 0:
      _CreateBattlerTrace(task, task.taskId);
      if (atkSp) atkSp.x2 += task.data[1];
      if (++task.data[3] === 5) {
        task.data[3]--;
        task.data[2]++;
      }
      break;
    case 1:
      _CreateBattlerTrace(task, task.taskId);
      if (atkSp) atkSp.x2 -= task.data[1];
      if (--task.data[3] === 0) {
        if (atkSp) atkSp.x2 = 0;
        task.data[2]++;
      }
      break;
    case 2:
      if (task.data[5] === 0) {
        _pwSpriteApi().FreeSpritePaletteByTag?.(_PW_TAG_BENT_SPOON);
        _pwItf().DestroyAnimVisualTask?.(task.taskId);
      }
      break;
  }
}

/** 1:1 `AnimTask_GetFrustrationPowerLevel` (battle_anim_mons.c.c:1993) → gBattleAnimArgs[7]. */
function AnimTask_GetFrustrationPowerLevel(task: _PwTask): void {
  const itf = _pwItf();
  const friendship = itf.getAnimFriendship?.() ?? 0;
  let powerLevel: number;
  if (friendship <= 30) powerLevel = 0;
  else if (friendship <= 100) powerLevel = 1;
  else if (friendship <= 200) powerLevel = 2;
  else powerLevel = 3;
  const args = itf.getArgs?.();
  if (args) args[7] = powerLevel;  // ARG_RET_ID
  itf.DestroyAnimVisualTask?.(task.taskId);
}

import { registerAnimTasks as _pwRegT } from '../engine/battle/battle-anim-registry';
_pwRegT({
  AnimTask_AttackerPunchWithTrace: AnimTask_AttackerPunchWithTrace as never,
  AnimTask_GetFrustrationPowerLevel: AnimTask_GetFrustrationPowerLevel as never,
});

// ─── VAGUE F38 : AlphaFadeIn (battle_anim_mons.c.c:1654) + surface enrichie ───────────────
/** 1:1 `AnimTask_AlphaFadeIn` (battle_anim_mons.c.c:1654) : BLDALPHA progressif args
 *  [evaDébut, evbDébut, evaFin, evbFin, délai]. */
function AnimTask_AlphaFadeIn(task: _PwTask): void {
  const itf = _pwItf();
  const args = (itf.getArgs?.() ?? [0, 0, 0, 0, 0]).slice();
  let v1 = 0, v2 = 0;
  if (args[2] > args[0]) v2 = 1;
  if (args[2] < args[0]) v2 = -1;
  if (args[3] > args[1]) v1 = 1;
  if (args[3] < args[1]) v1 = -1;
  task.data[0] = 0;
  task.data[1] = args[4] | 0;
  task.data[2] = 0;
  task.data[3] = args[0] | 0;
  task.data[4] = args[1] | 0;
  task.data[5] = v2;
  task.data[6] = v1;
  task.data[7] = args[2] | 0;
  task.data[8] = args[3] | 0;
  const rt = getRuntime();
  (rt as unknown as { SetGpuReg?: (o: number, v: number) => void })?.SetGpuReg?.(0x52, (args[0] & 0xFFFF) | ((args[1] & 0xFF) << 8));
  task.func = _AlphaFadeIn_Step;
}
/** 1:1 `AnimTask_AlphaFadeIn_Step` (battle_anim_mons.c.c:1681). */
function _AlphaFadeIn_Step(task: _PwTask): void {
  if (++task.data[0] > task.data[1]) {
    task.data[0] = 0;
    if (++task.data[2] & 1) {
      if (task.data[3] !== task.data[7]) task.data[3] += task.data[5];
    } else {
      if (task.data[4] !== task.data[8]) task.data[4] += task.data[6];
    }
    const rt = getRuntime();
    (rt as unknown as { SetGpuReg?: (o: number, v: number) => void })?.SetGpuReg?.(0x52, (task.data[3] & 0xFFFF) | ((task.data[4] & 0xFF) << 8));
    if (task.data[3] === task.data[7] && task.data[4] === task.data[8]) {
      _pwItf().DestroyAnimVisualTask?.(task.taskId);
    }
  }
}
_pwRegT({ AnimTask_AlphaFadeIn: AnimTask_AlphaFadeIn as never });

// Surface enrichie (F38) — consommée par effects_2 Minimize & co.
{
  const surf = (globalThis as Record<string, unknown>).__battleAnimMons as Record<string, unknown>;
  surf.GetBattlerSpriteSubpriority = GetBattlerSpriteSubpriority;
  surf.SetBattlerSpriteYOffsetFromYScale = SetBattlerSpriteYOffsetFromYScale;
  surf.CloneBattlerSpriteWithBlend = CloneBattlerSpriteWithBlend;
  surf.DestroySpriteWithActiveSheet = DestroySpriteWithActiveSheet;
  surf.AllocOamMatrix = AllocOamMatrix;
}

// ─── VAGUE F40 : les MASKS de palettes (battle_anim_mons.c.c:1402-1508) ───────────────────
// Bits 0-15 = palettes BG, bits 16-31 = slots OBJ. La CLÉ de Flash/Moonlight/
// MorningSun/BlendNonAttacker/CopyPal (famille palettes-masks, triage 2026-06-12).
function _pmVisible(battler: number): boolean {
  // 1:1-net IsBattlerSpriteVisible : le sprite du battler existe et n'est pas invisible.
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
  const sid = co?.getBattlerMonSpriteId?.(battler);
  if (sid === undefined || sid === 0xFF) return false;
  const sp = getRuntime()?.gSprites?.get(sid) as { invisible?: boolean; inUse?: boolean } | undefined;
  return !!sp && sp.inUse !== false && !sp.invisible;
}
/** 1:1 `GetBattlePalettesMask` (battle_anim_mons.c.c:1402). */
export function GetBattlePalettesMask(
  battleBackground: boolean, attacker: boolean, target: boolean,
  attackerPartner: boolean, targetPartner: boolean, anim1: boolean, anim2: boolean,
): number {
  let selected = 0;
  const itf = _pwItf() as { getAttacker?: () => number; getTarget?: () => number };
  const atk = itf.getAttacker?.() ?? 0;
  const tgt = itf.getTarget?.() ?? 1;
  if (battleBackground) selected = 0xE; // palettes BG 1,2,3 (non-contest)
  if (attacker) selected |= 1 << (atk + 16);
  if (target) selected |= 1 << (tgt + 16);
  if (attackerPartner && _pmVisible(atk ^ 2)) selected |= 1 << ((atk ^ 2) + 16);
  if (targetPartner && _pmVisible(tgt ^ 2)) selected |= 1 << ((tgt ^ 2) + 16);
  if (anim1) selected |= 1 << 8;  // BG_ANIM_PAL_1 (slot monbg BG1)
  if (anim2) selected |= 1 << 9;  // BG_ANIM_PAL_2 (slot monbg BG2)
  return selected >>> 0;
}

/** 1:1 `GetBattleMonSpritePalettesMask` (battle_anim_mons.c.c:1455) — battlers VISIBLES par position. */
export function GetBattleMonSpritePalettesMask(
  playerLeft: number, playerRight: number, opponentLeft: number, opponentRight: number,
): number {
  let selected = 0;
  const add = (position: number): void => {
    const b = GetBattlerAtPosition(position);
    if (b !== 0xFF && _pmVisible(b)) selected |= 1 << (b + 16);
  };
  if (playerLeft) add(0);
  if (playerRight) add(2);
  if (opponentLeft) add(1);
  if (opponentRight) add(3);
  return selected >>> 0;
}
{
  const surf = (globalThis as Record<string, unknown>).__battleAnimMons as Record<string, unknown>;
  surf.GetBattlePalettesMask = GetBattlePalettesMask;
  surf.GetBattleMonSpritePalettesMask = GetBattleMonSpritePalettesMask;
}

// --- VAGUE F47 : sous-systeme ERUPT (battle_anim_mons.c.c:1958-1992) ----------------------
// Scales interpoles lineairement data[8..15] — partage WaterSpout/Eruption.
export function PrepareEruptAnimTaskData(
  task: _TaskLike, spriteId: number,
  xScaleStart: number, yScaleStart: number, xScaleEnd: number, yScaleEnd: number, duration: number,
): void {
  task.data[8] = duration;
  task.data[15] = spriteId;
  task.data[9] = xScaleStart;
  task.data[10] = yScaleStart;
  task.data[13] = xScaleEnd;
  task.data[14] = yScaleEnd;
  task.data[11] = Math.trunc((xScaleEnd - xScaleStart) / duration);
  task.data[12] = Math.trunc((yScaleEnd - yScaleStart) / duration);
}
export function UpdateEruptAnimTask(task: _TaskLike): number {
  if (!task.data[8]) return 0;
  if (--task.data[8] !== 0) {
    task.data[9] += task.data[11];
    task.data[10] += task.data[12];
  } else {
    task.data[9] = task.data[13];
    task.data[10] = task.data[14];
  }
  SetSpriteRotScale(task.data[15], task.data[9], task.data[10], 0);
  if (task.data[8]) {
    SetBattlerSpriteYOffsetFromYScale(task.data[15]);
  } else {
    const sp = getRuntime()?.gSprites?.get(task.data[15]) as { y2: number } | undefined;
    if (sp) sp.y2 = 0;
  }
  return task.data[8];
}
{
  const surf = (globalThis as Record<string, unknown>).__battleAnimMons as Record<string, unknown>;
  surf.PrepareEruptAnimTaskData = PrepareEruptAnimTaskData;
  surf.UpdateEruptAnimTask = UpdateEruptAnimTask;
}

// --- VAGUE F71 : CreateInvisibleSpriteCopy (battle_anim_mons.c.c:2323) --------------------
// Copie OAM complete du sprite du mon en ST_OAM_OBJ_WINDOW (objMode=2,
// priority 0) : le clone ne se DESSINE pas — il decoupe la fenetre OBJ
// (compositor computeWinObjScanline) a la silhouette du mon.
export function CreateInvisibleSpriteCopy(battler: number, spriteId: number, _species: number): number {
  const rt = getRuntime();
  void battler;
  const src = rt?.gSprites?.get(spriteId) as { x: number; y: number; x2: number; y2: number; oamIndex: number; subpriority?: number } | undefined;
  if (!rt || !src) return -1;
  const gba = (rt as unknown as { gba: { oam: Array<{ tileId: number; shape: number; size: number; paletteBank: number; priority: number; objMode: number; affineMode: number; hFlip?: boolean; vFlip?: boolean }> } }).gba;
  const srcOam = gba.oam[src.oamIndex];
  const newId = (rt as unknown as { CreateSpriteInline?: (t: unknown, x: number, y: number, p: number) => number }).CreateSpriteInline?.(
    { oam: { shape: srcOam?.shape ?? 0, size: srcOam?.size ?? 3, priority: 0 }, images: [] } as never,
    src.x, src.y, src.subpriority ?? 3,
  ) ?? -1;
  if (newId < 0) return -1;
  const clone = rt.gSprites?.get(newId) as { x2: number; y2: number; oamIndex: number; callback: unknown; objMode?: number } | undefined;
  const cloneOam = clone ? gba.oam[clone.oamIndex] : undefined;
  if (clone && cloneOam && srcOam) {
    clone.x2 = src.x2;
    clone.y2 = src.y2;
    cloneOam.tileId = srcOam.tileId;
    cloneOam.paletteBank = srcOam.paletteBank;
    cloneOam.shape = srcOam.shape;
    cloneOam.size = srcOam.size;
    cloneOam.priority = 0;
    cloneOam.objMode = 2; // ST_OAM_OBJ_WINDOW
    // ⚠ syncSpritesToOam (decomp-runtime:2499) ÉCRASE oam.objMode avec
    // sprite.objMode CHAQUE frame → poser AUSSI le champ du sprite logique,
    // sinon la fenêtre OBJ disparaît au tick suivant (anim stats invisible,
    // retour user 2026-06-13 — même classe que le piège affineMode).
    clone.objMode = 2;
    if (cloneOam.hFlip !== undefined && srcOam.hFlip !== undefined) cloneOam.hFlip = srcOam.hFlip;
    if (cloneOam.vFlip !== undefined && srcOam.vFlip !== undefined) cloneOam.vFlip = srcOam.vFlip;
    clone.callback = (() => { /* SpriteCallbackDummy */ }) as never;
  }
  return newId;
}
{
  const surf = (globalThis as Record<string, unknown>).__battleAnimMons as Record<string, unknown>;
  surf.CreateInvisibleSpriteCopy = CreateInvisibleSpriteCopy;
}

// --- VAGUE F73 : SetGrayscaleOrOriginalPalette (battle_anim_mons.c.c:1374) ----------------
// Grise une palette : moyenne r+g+b/3 lue depuis UNFADED, ecrite en FADED ;
// restore = recopie Unfaded -> Faded (CpuCopy32). paletteNum en slots GBA
// (16 + slot OBJ pour un mon). Unfaded/Faded sont des buffers SEPARES
// (verifie 2026-06-12 — l'hypothese « alias » de la vague F3 etait fausse).
export function SetGrayscaleOrOriginalPalette(paletteNum: number, restoreOriginalColor: boolean): void {
  const rt = getRuntime() as unknown as {
    gPlttBufferUnfaded?: { get: (i: number) => number };
    gPlttBufferFaded?: { get: (i: number) => number; set: (i: number, v: number) => void };
  } | null;
  const unfaded = rt?.gPlttBufferUnfaded;
  const faded = rt?.gPlttBufferFaded;
  if (!unfaded || !faded) return;
  const paletteOffset = paletteNum * 16; // PLTT_ID(paletteNum)
  if (!restoreOriginalColor) {
    for (let i = 0; i < 16; i++) {
      const original = unfaded.get(paletteOffset + i) ?? 0;
      const average = Math.trunc(((original & 0x1F) + ((original >> 5) & 0x1F) + ((original >> 10) & 0x1F)) / 3);
      const dest = faded.get(paletteOffset + i) ?? 0;
      // C : destColor->r/g/b = average (bit 15 conserve).
      faded.set(paletteOffset + i, (dest & 0x8000) | (average << 10) | (average << 5) | average);
    }
  } else {
    for (let i = 0; i < 16; i++) faded.set(paletteOffset + i, unfaded.get(paletteOffset + i) ?? 0);
  }
}
{
  const surf = (globalThis as Record<string, unknown>).__battleAnimMons as Record<string, unknown>;
  surf.SetGrayscaleOrOriginalPalette = SetGrayscaleOrOriginalPalette;
}

// --- VAGUE F77 : CreateAdditionalMonSpriteForMoveAnim (battle_anim_mons.c.c:2089) ---------
// Un sprite de MON supplémentaire (espèce arbitraire) pour les anims de move
// (Role Play, Transform-affichage…) : pic species chargé dans une alloc OBJ
// dédiée + palette species dans un slot alloué par tag. Divergence plateforme
// documentée : ASYNC (PNG pré-extrait vs LZ77 RAM synchrone) → les AnimTasks
// clientes attendent la résolution en machine à états (1-3 frames).
import { loadTileBin as _camLoadTiles, loadGbaPal as _camLoadPal } from '../engine/gba/png-loader';

// 1:1 sSpriteTemplates_MoveEffectMons tags (battle_anim_mons.c.c:2056-2086) : 2 slots dédiés.
const _CAM_TAGS: ReadonlyArray<number> = [55125, 55126]; // ANIM_TAG(s) MoveEffectMons

/** species num → dossier assets (pattern battle_gfx_sfx_util._speciesAssetFolder). */
function _camSpeciesFolder(species: number): string | null {
  const rev = (globalThis as Record<string, unknown>).__reverseDecompConstant as ((v: number, p: string) => string | undefined) | undefined;
  const enumName = rev ? rev(species, 'SPECIES_') : _hl2RevConst(species, 'SPECIES_');
  if (!enumName) return null;
  return enumName.replace(/^SPECIES_/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}
function _hl2RevConst(v: number, p: string): string | undefined {
  try {
    return reverseDecompConstant(v, p) ?? undefined;
  } catch {
    return undefined;
  }
}

/** 1:1 `CreateAdditionalMonSpriteForMoveAnim` (battle_anim_mons.c.c:2089) — async plateforme.
 *  Retourne le spriteId (ou -1). Le pic (frame 0, 0x800) est chargé en alloc
 *  inline (AllocSpriteTiles via CreateSpriteInline) ; palette species écrite
 *  dans un slot AllocSpritePalette(tag dédié id). */
export async function CreateAdditionalMonSpriteForMoveAnim(
  species: number, isBackpic: boolean, id: number,
  x: number, y: number, subpriority: number,
  _personality: number, _trainerId: number, _battler: number,
): Promise<number> {
  const folder = _camSpeciesFolder(species);
  if (!folder) return -1;
  const pic = isBackpic ? 'back.png' : 'anim_front.png';
  const [tiles, pal] = await Promise.all([
    _camLoadTiles(`/decomp/em/pokemon/${folder}/${pic}`, 4),
    _camLoadPal(`/decomp/em/pokemon/${folder}/normal.pal`),
  ]);
  if (!tiles || tiles.length < 0x800) return -1;
  const rt = getRuntime() as unknown as {
    CreateSpriteInline?: (t: unknown, x: number, y: number, p: number) => number;
    gSprites?: Map<number, { oamIndex: number }>;
    gba?: { oam: Array<{ paletteBank: number }> };
    gPlttBufferUnfaded?: { set: (i: number, v: number) => void };
    gPlttBufferFaded?: { set: (i: number, v: number) => void };
  } | null;
  const spApi = (globalThis as Record<string, unknown>).__sprite as { AllocSpritePalette?: (t: number) => number; FreeSpritePaletteByTag?: (t: number) => void } | undefined;
  const palSlot = spApi?.AllocSpritePalette?.(_CAM_TAGS[id & 1] ?? _CAM_TAGS[0]) ?? 0xFF;
  if (palSlot === 0xFF) return -1; // panne d'alloc palette = echec FRANC (pas de slot 0 silencieux)
  // pic coords : y += y_offset (front/back) — 1:1 battle_anim_mons.c.c:2135-2138.
  const enumName = _hl2RevConst(species, 'SPECIES_') ?? 'SPECIES_NONE';
  const coords = isBackpic ? getMonBackPicCoords(enumName) : getMonFrontPicCoords(enumName);
  const spriteId = rt?.CreateSpriteInline?.({
    oam: { shape: 0, size: 3, priority: 2, paletteNum: palSlot },
    images: [{ data: tiles.subarray(0, 0x800), size: 0x800 }],
    callback: null,
  } as never, x, y + (coords?.yOffset ?? 0), subpriority) ?? -1;
  if (spriteId < 0 || spriteId >= 64) return -1;
  // palette species → slot alloué (Unfaded + Faded, 1:1 LoadCompressedPalette).
  if (palSlot !== 0xFF && pal) {
    for (let i = 0; i < 16 && i < pal.length; i++) {
      rt?.gPlttBufferUnfaded?.set(256 + palSlot * 16 + i, pal[i]);
      rt?.gPlttBufferFaded?.set(256 + palSlot * 16 + i, pal[i]);
    }
  }
  return spriteId;
}
{
  const surf = (globalThis as Record<string, unknown>).__battleAnimMons as Record<string, unknown>;
  surf.CreateAdditionalMonSpriteForMoveAnim = CreateAdditionalMonSpriteForMoveAnim;
  surf.MoveEffectMonPaletteTags = _CAM_TAGS;
}

// --- VAGUE F84 (C0 placement miroir) : Translate* migres de fire.ts ---------
// Leurs maisons C : battle_anim_mons.c.c:468 / :593 / :551 / :1155. fire.ts (et tout autre
// fichier d'effets) consomme par import — zero transcription locale residuelle.
import { Sin as _tgSin, Cos as _tgCos } from './trig';
/** 1:1 TranslateSpriteInGrowingCircle (battle_anim_mons.c.c:468). */
export function TranslateSpriteInGrowingCircle(sprite: DecompSprite): void {
  const sp = sprite as unknown as { data: number[]; x2: number; y2: number };
  if (sp.data[3]) {
    sp.x2 = _tgSin(sp.data[0] & 0xFF, ((sp.data[5] << 16 >> 16) >> 8) + sp.data[1]);
    sp.y2 = _tgCos(sp.data[0] & 0xFF, ((sp.data[5] << 16 >> 16) >> 8) + sp.data[1]);
    sp.data[0] += sp.data[2];
    sp.data[5] = (sp.data[5] + sp.data[4]) << 16 >> 16;
    if (sp.data[0] >= 0x100) sp.data[0] -= 0x100;
    else if (sp.data[0] < 0) sp.data[0] += 0x100;
    sp.data[3]--;
  } else {
    SetCallbackToStoredInData6(sprite);
  }
}
/** 1:1 TranslateSpriteLinear (battle_anim_mons.c.c:593) — pixels entiers, pas 8.8. */
export function TranslateSpriteLinear(sprite: DecompSprite): void {
  const sp = sprite as unknown as { data: number[]; x2: number; y2: number };
  if (sp.data[0] > 0) {
    sp.data[0]--;
    sp.x2 += sp.data[1];
    sp.y2 += sp.data[2];
  } else {
    SetCallbackToStoredInData6(sprite);
  }
}
/** 1:1 WaitAnimForDuration (battle_anim_mons.c.c:551). */
export function WaitAnimForDuration(sprite: DecompSprite): void {
  const sp = sprite as unknown as { data: number[] };
  if (sp.data[0] > 0) sp.data[0]--;
  else SetCallbackToStoredInData6(sprite);
}
