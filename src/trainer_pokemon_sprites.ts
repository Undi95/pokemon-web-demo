/**
 * src/trainer_pokemon_sprites.ts — port 1:1 décomp `src/trainer_pokemon_sprites.c` (395l).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/trainer_pokemon_sprites.c`
 *                  + `include/trainer_pokemon_sprites.h`.
 *
 * Système mon-pic / trainer-pic : décompresse une image (mon front/back ou trainer pic),
 * alloue des tiles OBJ VRAM **INLINE** (`tileTag = TAG_NONE`) via `CreateSprite`, charge la
 * palette (slot direct ou tag system), crée le sprite, et track le tout dans `sSpritePics[]`
 * pour un free PROPRE :
 *   - `FreeAndDestroyMonPicSprite(spriteId)` → free palette (si taggée) + `DestroySprite`
 *     (qui libère les tiles inline — 1:1 sprite.c:622-628) + Free(framePics/images).
 *
 * C'est CE système (pas un tag ad-hoc / slot hardcodé bricolé) qui gère le mon-pic du
 * starter_choose, du pokédex, des écrans de combat, etc. → ÉLIMINE l'ancien
 * `CreatePokemonFrontSprite` ad-hoc (qui posait `__sprite.AllocSpriteTiles` sans jamais
 * poser `sprite.images` → `DestroySprite` ne libérait rien → fuite → mon invisible au re-select).
 *
 * ── Divergence hardware-exempt (ASSET) ──
 * Le décomp `DecompressPic` lit la ROM (sync via `LZ77UnComp`/`LoadSpecialPokePic`). Nous
 * fetchons les PNG en async → un **substrat sync** `_monPicSubstrate` (Map species→{tileData,
 * palette}) est pré-rempli par le caller (preload async) AVANT `CreateMonPicSprite_Affine`
 * (sync, 1:1). Le reste (CreateSprite inline, palette slot, registry sSpritePics, free) est
 * 1:1 strict. Cf. [[hardware-non-1to1-exemptions]] (assets = chargement propre).
 */
import type { DecompRuntime } from '../harness/runtime/decomp-runtime';
import { getRuntime } from '../harness/runtime/decomp-globals';
import {
  DestroySprite, FreeSpritePaletteByTag, GetSpritePaletteTagByPaletteNum,
  DoLoadSpritePalette, LoadSpritePalette, _CreateSpriteAtTemplate, AllocOamMatrix,
  TAG_NONE, MAX_SPRITES, type SpriteTemplate,
} from './sprite';
import { StartSpriteAffineAnim } from './engine/decomp-impls/sprite-engine-impl';
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';

// ─── Constantes 1:1 décomp ──────────────────────────────────────────────────
/** 1:1 décomp `#define PICS_COUNT 8` (trainer_pokemon_sprites.c:12). */
const PICS_COUNT = 8;
/** 1:1 décomp `#define MAX_MON_PIC_FRAMES 4` (constants/pokemon.h:275). */
const MAX_MON_PIC_FRAMES = 4;
/** 1:1 décomp `MON_PIC_SIZE = MON_PIC_WIDTH * MON_PIC_HEIGHT / 2` = 64×64/2 = 2048 (4bpp). */
const MON_PIC_SIZE = 2048;

// 1:1 décomp include/trainer_pokemon_sprites.h:5-8 (flags de CreateMonPicSprite_Affine).
export const MON_PIC_AFFINE_BACK = 0;
export const MON_PIC_AFFINE_FRONT = 1;
export const MON_PIC_AFFINE_NONE = 3;
export const F_MON_PIC_NO_AFFINE = 1 << 7;

// ─── struct PicData (1:1 décomp trainer_pokemon_sprites.c:18-25) ─────────────
/**
 * struct PicData {
 *     u8 *frames;
 *     struct SpriteFrameImage *images;
 *     u16 paletteTag;
 *     u8 spriteId;
 *     u8 active;
 * };
 */
interface PicData {
  frames: Uint8Array | null;
  images: Array<{ data: Uint8Array; size: number }> | null;
  paletteTag: number;
  spriteId: number;
  active: boolean;
}

/** 1:1 décomp `static EWRAM_DATA struct PicData sSpritePics[PICS_COUNT]` (c:28). */
const sSpritePics: PicData[] = Array.from({ length: PICS_COUNT }, () => ({
  frames: null, images: null, paletteTag: TAG_NONE, spriteId: 0, active: false,
}));

// ─── Substrat asset sync (hardware-exempt — équivalent ROM `DecompressPic`) ──
interface MonPicSubstrate { tileData: Uint8Array; palette: Uint16Array; }
const _monPicSubstrate = new Map<string, MonPicSubstrate>();

/** Pré-remplit le substrat sync (= ROM-resident equivalent) pour `species`. Appelé par le
 *  caller (preload async) AVANT `CreateMonPicSprite_Affine` (sync). `tileData` = front pic 4bpp
 *  décompressé (64×64 = 2048 octets), `palette` = 16 couleurs RGB15. */
export function _registerMonPicSubstrate(species: string, tileData: Uint8Array, palette: Uint16Array): void {
  _monPicSubstrate.set(species, { tileData, palette });
}

// ─── ResetAllPicSprites (1:1 décomp c:50-58) ────────────────────────────────
/**
 * bool16 ResetAllPicSprites(void) {
 *     for (i = 0; i < PICS_COUNT; i++) sSpritePics[i] = sDummyPicData;
 *     return FALSE;
 * }
 */
export function ResetAllPicSprites(): boolean {
  for (let i = 0; i < PICS_COUNT; i++) {
    sSpritePics[i].frames = null;
    sSpritePics[i].images = null;
    sSpritePics[i].paletteTag = TAG_NONE;
    sSpritePics[i].spriteId = 0;
    sSpritePics[i].active = false;
  }
  return false;
}

// ─── CreateMonPicSprite_Affine (1:1 décomp c:213-288) ───────────────────────
/**
 * u16 CreateMonPicSprite_Affine(u16 species, u32 otId, u32 personality, u8 flags,
 *                               s16 x, s16 y, u8 paletteSlot, u16 paletteTag)
 *
 * 1:1 STRICT : find free sSpritePics slot → DecompressPic (substrat sync) → images[] →
 * sCreatingSpriteTemplate (tileTag=TAG_NONE inline + affineAnims selon `type`) →
 * LoadPicPaletteByTagOrSlot → CreateSprite (voie inline) → si paletteTag==TAG_NONE :
 * oam.paletteNum = paletteSlot → register sSpritePics.
 */
export function CreateMonPicSprite_Affine(
  species: string, _otId: number, _personality: number, flags: number,
  x: number, y: number, paletteSlot: number, paletteTag: number,
): number {
  const rt: DecompRuntime = getRuntime();

  // 1:1 décomp c:222-228 : find free sSpritePics slot.
  let i = 0;
  for (; i < PICS_COUNT; i++) if (!sSpritePics[i].active) break;
  if (i === PICS_COUNT) return 0xFFFF;

  // 1:1 décomp DecompressPic (c:60-101) : framePics = pic data décompressé. Substrat sync.
  const sub = _monPicSubstrate.get(species);
  if (!sub) {
    console.warn(`[trainer_pokemon_sprites] CreateMonPicSprite_Affine: no substrate for ${species} (preload manquant)`);
    return 0xFFFF;
  }
  const framePics = sub.tileData;

  // 1:1 décomp c:234-242 : résolution `type` depuis flags.
  let type: number;
  if (flags & F_MON_PIC_NO_AFFINE) {
    type = MON_PIC_AFFINE_NONE;
  } else {
    type = flags;
  }

  // 1:1 décomp c:254-258 : découpe framePics en MAX_MON_PIC_FRAMES images de MON_PIC_SIZE.
  // Notre substrat = la frame 0 (front pic). CreateSprite (voie inline) utilise images[0].size
  // pour AllocSpriteTiles → on alloue exactement MON_PIC_SIZE/32 = 64 tiles (= 1 frame 64×64).
  const frameSize = Math.min(MON_PIC_SIZE, framePics.length);
  const images: Array<{ data: Uint8Array; size: number }> = [{ data: framePics, size: frameSize }];
  void MAX_MON_PIC_FRAMES;  // (les frames d'anim mon ne sont pas chargées : front pic statique)

  // 1:1 décomp c:259-277 : sCreatingSpriteTemplate (tileTag=TAG_NONE inline, oam + affineAnims).
  const affineMode = (type === MON_PIC_AFFINE_FRONT || type === MON_PIC_AFFINE_BACK) ? 1 : 0;
  const affineAnimsName = type === MON_PIC_AFFINE_FRONT ? 'gAffineAnims_BattleSpriteOpponentSide'
    : type === MON_PIC_AFFINE_BACK ? 'gAffineAnims_BattleSpritePlayerSide'
    : null;
  const template: SpriteTemplate = {
    // tileTag omis = TAG_NONE → voie inline `_CreateSpriteAtTemplate` (sprite.ts).
    oam: { shape: 0, size: 3, priority: 1, affineMode: affineMode as 0 | 1, paletteNum: paletteSlot },
    images,
    anims: null,
    affineAnims: affineAnimsName,
    callback: null,
  };

  // 1:1 décomp LoadPicPaletteByTagOrSlot (c:108-136) — !isTrainer :
  //   paletteTag == TAG_NONE → LoadCompressedPalette(...) à OBJ_PLTT_ID(paletteSlot)  [PAS tag-registré]
  //   sinon                  → LoadCompressedSpritePalette(...) (tag system)
  if (paletteTag === TAG_NONE) {
    // OBJ_PLTT_ID(slot) = slot × 16 (DoLoadSpritePalette ajoute OBJ_PLTT_OFFSET).
    DoLoadSpritePalette(sub.palette, paletteSlot * 16);
  } else {
    LoadSpritePalette({ data: sub.palette, tag: paletteTag });
  }

  // 1:1 décomp c:279 : spriteId = CreateSprite(&sCreatingSpriteTemplate, x, y, 0). Voie inline.
  const spriteId = _CreateSpriteAtTemplate(rt, template, x, y, 0);
  if (spriteId < 0 || spriteId >= MAX_SPRITES) {
    return 0xFFFF;
  }
  const sprite = rt.gSprites[spriteId];

  // 1:1 décomp c:280-281 : if (paletteTag == TAG_NONE) gSprites[spriteId].oam.paletteNum = paletteSlot.
  if (sprite && paletteTag === TAG_NONE) {
    rt.gba.oam[sprite.oamIndex].paletteBank = paletteSlot;
  }

  // Affine : alloue la matrice OAM + démarre l'affine anim. 1:1 décomp CreateSpriteAt appelle
  // InitSpriteAffineAnim (alloue matrice, affineAnimBeginning=TRUE) pour les sprites affine inline.
  // Notre voie inline ne le fait pas → on le complète ici (le caller peut ensuite override la table).
  if (sprite && affineMode !== 0) {
    const mNum = AllocOamMatrix();
    if (mNum > 0) {
      sprite.matrixNum = mNum;
      const oam = rt.gba.oam[sprite.oamIndex];
      oam.affineParamIndex = mNum;
      oam.affineMode = affineMode as 0 | 1 | 2 | 3;
    }
    sprite.affineAnimsTableName = affineAnimsName;
    StartSpriteAffineAnim(sprite as never, 0);
  }

  // 1:1 décomp c:282-286 : register sSpritePics.
  sSpritePics[i].frames = framePics;
  sSpritePics[i].images = images;
  sSpritePics[i].paletteTag = paletteTag;
  sSpritePics[i].spriteId = spriteId;
  sSpritePics[i].active = true;
  return spriteId;
}

// ─── FreeAndDestroyPicSpriteInternal (1:1 décomp c:290-313) ──────────────────
/**
 * static u16 FreeAndDestroyPicSpriteInternal(u16 spriteId) {
 *     ... find sSpritePics[i] by spriteId ...
 *     if (sSpritePics[i].paletteTag != TAG_NONE)
 *         FreeSpritePaletteByTag(GetSpritePaletteTagByPaletteNum(gSprites[spriteId].oam.paletteNum));
 *     DestroySprite(&gSprites[spriteId]);   // libère les tiles inline (usingSheet=FALSE)
 *     Free(framePics); Free(images);
 *     sSpritePics[i] = sDummyPicData;
 *     return 0;
 * }
 */
function FreeAndDestroyPicSpriteInternal(spriteId: number): number {
  const rt: DecompRuntime = getRuntime();
  let i = 0;
  for (; i < PICS_COUNT; i++) if (sSpritePics[i].spriteId === spriteId) break;
  if (i === PICS_COUNT) return 0xFFFF;

  // 1:1 décomp c:306-307 : si la palette est taggée, la libérer (sinon slot direct laissé).
  if (sSpritePics[i].paletteTag !== TAG_NONE) {
    const sprite = rt.gSprites[spriteId];
    if (sprite) {
      const oam = rt.gba.oam[sprite.oamIndex];
      FreeSpritePaletteByTag(GetSpritePaletteTagByPaletteNum(oam.paletteBank));
    }
  }
  // 1:1 décomp c:308 : DestroySprite → libère les tiles INLINE (usingSheet=FALSE).
  DestroySprite(spriteId);
  // Free(framePics)/Free(images) : GC en JS (déréférence) + reset slot (= sDummyPicData).
  sSpritePics[i].frames = null;
  sSpritePics[i].images = null;
  sSpritePics[i].paletteTag = TAG_NONE;
  sSpritePics[i].spriteId = 0;
  sSpritePics[i].active = false;
  return 0;
}

/** 1:1 décomp `u16 FreeAndDestroyMonPicSprite(u16 spriteId)` (c:349-352). */
export function FreeAndDestroyMonPicSprite(spriteId: number): number {
  return FreeAndDestroyPicSpriteInternal(spriteId);
}

/** 1:1 décomp `u16 FreeAndDestroyTrainerPicSprite(u16 spriteId)` (c:370-373). */
export function FreeAndDestroyTrainerPicSprite(spriteId: number): number {
  return FreeAndDestroyPicSpriteInternal(spriteId);
}

// ─── CreatePicSprite (voie NON-affine) + wrappers (1:1 décomp c:165-347) ─────
/**
 * 1:1 décomp `static u16 CreatePicSprite(u16 species, u32 otId, u32 personality, bool8 isFrontPic,
 *   s16 x, s16 y, u8 paletteSlot, u16 paletteTag, bool8 isTrainer, bool8 ignoreDeoxys)`
 * (trainer_pokemon_sprites.c:165-206) — voie NON-affine (sOamData_Normal, DummyPicSpriteCallback,
 * AssignSpriteAnimsTable). Parallèle strict à `CreateMonPicSprite_Affine` (type MON_PIC_AFFINE_NONE)
 * mais SANS matrice OAM. Substrat sync (= ROM `DecompressPic`) : le caller doit avoir pré-rempli
 * `_monPicSubstrate` (preload async) AVANT cet appel. `species` accepte l'id numérique décomp
 * (converti en clé enumName via reverseDecompConstant) ou directement la clé enumName.
 */
function CreatePicSprite(
  species: number | string, _otId: number, _personality: number, _isFrontPic: boolean,
  x: number, y: number, paletteSlot: number, paletteTag: number, _isTrainer: boolean, _ignoreDeoxys: boolean,
): number {
  const rt: DecompRuntime = getRuntime();
  const key = typeof species === 'number' ? (reverseDecompConstant(species, 'SPECIES_') ?? 'SPECIES_NONE') : species;

  // 1:1 décomp c:172-178 : find free sSpritePics slot.
  let i = 0;
  for (; i < PICS_COUNT; i++) if (!sSpritePics[i].active) break;
  if (i === PICS_COUNT) return 0xFFFF;

  // 1:1 décomp DecompressPic (substrat sync). Absent = pic pas encore fetché → 0xFFFF (le caller
  // gère l'échec comme la ROM gère un decompress KO : return 0xFFFF, cf. c:180-184).
  const sub = _monPicSubstrate.get(key);
  if (!sub) {
    console.warn(`[trainer_pokemon_sprites] CreatePicSprite: no substrate for ${key} (preload manquant)`);
    return 0xFFFF;
  }
  const framePics = sub.tileData;

  // 1:1 décomp c:185-195 : images[] + template inline (tileTag=TAG_NONE, sOamData_Normal, dummy anims).
  const frameSize = Math.min(MON_PIC_SIZE, framePics.length);
  const images: Array<{ data: Uint8Array; size: number }> = [{ data: framePics, size: frameSize }];
  const template: SpriteTemplate = {
    oam: { shape: 0, size: 3, priority: 1, affineMode: 0, paletteNum: paletteSlot },
    images,
    anims: null,
    affineAnims: null,
    callback: null,
  };

  // 1:1 décomp c:196 LoadPicPaletteByTagOrSlot (!isTrainer) : slot direct (TAG_NONE) ou tag system.
  if (paletteTag === TAG_NONE) {
    DoLoadSpritePalette(sub.palette, paletteSlot * 16);
  } else {
    LoadSpritePalette({ data: sub.palette, tag: paletteTag });
  }

  // 1:1 décomp c:197-199 : CreateSprite (voie inline) + paletteNum = paletteSlot si TAG_NONE.
  const spriteId = _CreateSpriteAtTemplate(rt, template, x, y, 0);
  if (spriteId < 0 || spriteId >= MAX_SPRITES) return 0xFFFF;
  const sprite = rt.gSprites[spriteId];
  if (sprite && paletteTag === TAG_NONE) {
    rt.gba.oam[sprite.oamIndex].paletteBank = paletteSlot;
  }

  // 1:1 décomp c:200-205 : register sSpritePics.
  sSpritePics[i].frames = framePics;
  sSpritePics[i].images = images;
  sSpritePics[i].paletteTag = paletteTag;
  sSpritePics[i].spriteId = spriteId;
  sSpritePics[i].active = true;
  return spriteId;
}

/** 1:1 décomp `static u16 CreateMonPicSprite(u16 species, u32 otId, u32 personality, bool8 isFrontPic,
 *  s16 x, s16 y, u8 paletteSlot, u16 paletteTag, bool8 ignoreDeoxys)` (c:339-342). */
function CreateMonPicSprite(
  species: number | string, otId: number, personality: number, isFrontPic: boolean,
  x: number, y: number, paletteSlot: number, paletteTag: number, ignoreDeoxys: boolean,
): number {
  return CreatePicSprite(species, otId, personality, isFrontPic, x, y, paletteSlot, paletteTag, false, ignoreDeoxys);
}

/** 1:1 décomp `u16 CreateMonPicSprite_HandleDeoxys(u16 species, u32 otId, u32 personality,
 *  bool8 isFrontPic, s16 x, s16 y, u8 paletteSlot, u16 paletteTag)` (c:344-347). */
export function CreateMonPicSprite_HandleDeoxys(
  species: number | string, otId: number, personality: number, isFrontPic: boolean,
  x: number, y: number, paletteSlot: number, paletteTag: number,
): number {
  return CreateMonPicSprite(species, otId, personality, isFrontPic, x, y, paletteSlot, paletteTag, false);
}

// NOTE mirror : CreateTrainerPicSprite / CreateTrainerCard* (voie window blit) restent à porter
// quand un écran les utilisera (substrat trainer-pic non câblé). Squelette 1:1 conservé ci-dessus.
