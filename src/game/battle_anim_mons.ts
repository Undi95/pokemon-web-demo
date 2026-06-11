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
  sprite.affineMode = 0;
  sprite.affineAnimPaused = false;
  const oam = (rt as unknown as { gba?: { oam?: Array<{ affineMode?: number; objMode?: number }> } }).gba?.oam?.[sprite.oamIndex];
  if (oam) {
    oam.affineMode = 0;
    oam.objMode = 0;
  }
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
