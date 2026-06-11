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
import { GetBattlerPosition } from '../engine/battle/util';
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

// ─── VAGUE F1 : AnimTask_BlendMonInAndOut (mons.c, 14 usages) ───────────────
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
  const oam = sp ? (rt as unknown as { gba: { oam: Array<{ paletteNum: number }> } }).gba.oam[sp.oamIndex] : undefined;
  task.data[0] = 256 + (oam?.paletteNum ?? 0) * 16 + 1; // OBJ_PLTT_ID + 1
  _BlendPalInAndOutSetup(task, args);
}
function _BlendPalInAndOutSetup(task: _F1Task, args: number[]): void {
  task.data[1] = args[1];
  task.data[2] = 0;
  task.data[3] = args[2];
  task.data[4] = 0;
  task.data[5] = args[3];
  task.data[6] = 0;
  task.data[7] = args[4];
  task.func = _BlendMonInAndOut_Step;
}
function _BlendMonInAndOut_Step(task: _F1Task): void {
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
import { registerAnimTasks as _f1Reg } from '../engine/battle/battle-anim-registry';
_f1Reg({ AnimTask_BlendMonInAndOut: AnimTask_BlendMonInAndOut as never });

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

/** 1:1 `SetBattlerSpriteYOffsetFromYScale(spriteId)` (mons.c) : y2 compense la
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
    if (term.startsWith('LOOP')) { task.data[7] = 0; return true; } // net : reboucle
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
  sprite.callback = _WeatherBallUp_Step as never;
}
function _WeatherBallUp_Step(sprite: DecompSprite): void {
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
  sprite.callback = _ThrowProjectile_Step as never;
}
function _ThrowProjectile_Step(sprite: DecompSprite): void {
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
  AnimWeatherBallDown: AnimWeatherBallDown as never,
  AnimWeatherBallUp: AnimWeatherBallUp as never,
});
