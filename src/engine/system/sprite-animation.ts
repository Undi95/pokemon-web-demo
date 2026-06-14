/**
 * sprite-animation.ts — Port 1:1 STRICT décomp sprite.c animation system.
 *
 * Source de vérité :
 *   D:/Projet 1/decomps/pokeemeraude/src/sprite.c (= AnimateSprite, BeginAnim,
 *     ContinueAnim, AnimCmd_*, RequestSpriteFrameImageCopy, ProcessSpriteCopyRequests)
 *   D:/Projet 1/decomps/pokeemeraude/include/sprite.h (= struct AnimCmd union)
 *
 * Architecture 1:1 décomp :
 *   - Chaque sprite a un animNum (= index dans sprite.anims[][]) qui pointe
 *     vers un tableau AnimCmd[].
 *   - Chaque frame, AnimateSprite (sprite.c:901) dispatch BeginAnim ou
 *     ContinueAnim selon le flag animBeginning.
 *   - ContinueAnim décrémente animDelayCounter. À 0, avance animCmdIndex+1
 *     et dispatch AnimCmd_frame/end/jump/loop selon cmd.type.
 *   - AnimCmd_frame : new frame, applique hFlip/vFlip, set duration, et
 *     RequestSpriteFrameImageCopy(imageValue, oam.tileNum, sprite.images)
 *     qui SCHEDULE une copy from images[imageValue].data → OBJ_VRAM[oam.tileNum].
 *   - ProcessSpriteCopyRequests (sprite.c:785) drain la queue chaque frame
 *     (= sync to VRAM).
 */

import type { DecompRuntime } from '../system/decomp-runtime';

// ─── struct AnimCmd union 1:1 décomp sprite.h:74-80 ─────────────────────────
/**
 * union AnimCmd {
 *     s16 type;
 *     struct AnimFrameCmd frame;
 *     struct AnimLoopCmd loop;
 *     struct AnimJumpCmd jump;
 * };
 *
 * Discriminé par type :
 *   type = -1 (0xFFFF, ANIMCMD_END) → end
 *   type = -2 (0xFFFE, ANIMCMD_JUMP) → jump to target
 *   type = -3 (0xFFFD, ANIMCMD_LOOP) → loop counter dec
 *   type >= 0 → frame (= imageValue)
 *
 * TS port : discriminated union avec kind explicite + données du cmd.
 */
export type AnimCmd =
  | { readonly kind: 'frame'; readonly imageValue: number; readonly duration: number; readonly hFlip: boolean; readonly vFlip: boolean }
  | { readonly kind: 'end' }
  | { readonly kind: 'jump'; readonly target: number }
  | { readonly kind: 'loop'; readonly count: number };

// ─── Macros décomp (port helpers) ───────────────────────────────────────────

/** 1:1 décomp `ANIMCMD_FRAME(imageValue, duration[, .hFlip=TRUE][, .vFlip=TRUE])`.
 *  Crée un AnimCmd frame avec duration et flips. */
export function ANIMCMD_FRAME(
  imageValue: number,
  duration: number,
  opts?: { hFlip?: boolean; vFlip?: boolean },
): AnimCmd {
  return {
    kind: 'frame',
    imageValue,
    duration,
    hFlip: opts?.hFlip ?? false,
    vFlip: opts?.vFlip ?? false,
  };
}

/** 1:1 décomp `ANIMCMD_END`. Terminator (type = -1). */
export const ANIMCMD_END: AnimCmd = { kind: 'end' };

/** 1:1 décomp `ANIMCMD_JUMP(target)`. Saut au cmd index `target` (type = -2). */
export function ANIMCMD_JUMP(target: number): AnimCmd {
  return { kind: 'jump', target };
}

/** 1:1 décomp `ANIMCMD_LOOP(count)`. Boucle count fois (type = -3). */
export function ANIMCMD_LOOP(count: number): AnimCmd {
  return { kind: 'loop', count };
}

// ─── struct SpriteFrameImage 1:1 décomp sprite.h:26-30 ──────────────────────
/**
 * struct SpriteFrameImage {
 *     const void *data;
 *     u16 size;
 * };
 *
 * `data` = bytes raw 4bpp pour 1 frame.
 * `size` = taille en bytes (= width_tiles * height_tiles * 32).
 */
export interface SpriteFrameImage {
  readonly data: Uint8Array;
  readonly size: number;
}

// ─── Queue sSpriteCopyRequests 1:1 décomp sprite.c:55-58 ─────────────────────
/**
 *  #define MAX_SPRITE_COPY_REQUESTS 64
 *  static u8 sSpriteCopyRequestCount;
 *  static struct SpriteCopyRequest sSpriteCopyRequests[MAX_SPRITE_COPY_REQUESTS];
 *
 * Queue de jobs VRAM copy à exécuter dans BuildOamBuffer (= ProcessSpriteCopy
 * Requests). Le port TS pose les bytes directement dans rt.gba.objVram au
 * lieu de scheduler async.
 */
const MAX_SPRITE_COPY_REQUESTS = 64;

interface SpriteCopyRequest {
  src: Uint8Array;
  destTileNum: number;
  size: number;
}

const sSpriteCopyRequests: SpriteCopyRequest[] = [];
let sSpriteCopyRequestCount = 0;

/** 1:1 décomp `RequestSpriteFrameImageCopy(u16 index, u16 tileNum,
 *  const struct SpriteFrameImage *images)` (sprite.c:802-811) :
 *      if (sSpriteCopyRequestCount < MAX_SPRITE_COPY_REQUESTS) {
 *          sSpriteCopyRequests[count].src  = images[index].data;
 *          sSpriteCopyRequests[count].dest = OBJ_VRAM0 + TILE_SIZE_4BPP * tileNum;
 *          sSpriteCopyRequests[count].size = images[index].size;
 *          sSpriteCopyRequestCount++;
 *      }
 *
 * En port TS : queue les requests, drain au prochain ProcessSpriteCopyRequests. */
export function RequestSpriteFrameImageCopy(
  index: number, tileNum: number, images: ReadonlyArray<SpriteFrameImage>,
): void {
  if (sSpriteCopyRequestCount >= MAX_SPRITE_COPY_REQUESTS) return;
  const img = images[index];
  if (!img) return;
  sSpriteCopyRequests[sSpriteCopyRequestCount] = {
    src: img.data,
    destTileNum: tileNum,
    size: img.size,
  };
  sSpriteCopyRequestCount++;
}

/** 1:1 décomp `ProcessSpriteCopyRequests` (sprite.c:785-800) :
 *      while (sSpriteCopyRequestCount > 0)
 *          CpuCopy16(src, dest, size); sSpriteCopyRequestCount--;
 *
 * Drain la queue dans rt.gba.objVram. À call depuis BuildOamBuffer (= main
 * frame end), avant la composition. */
export function ProcessSpriteCopyRequests(rt: DecompRuntime): void {
  for (let i = 0; i < sSpriteCopyRequestCount; i++) {
    const req = sSpriteCopyRequests[i];
    const TILE_SIZE_4BPP = 32;
    const destByte = req.destTileNum * TILE_SIZE_4BPP;
    rt.gba.objVram.set(req.src.subarray(0, req.size), destByte);
  }
  sSpriteCopyRequestCount = 0;
}

/** Reset queue (= au reset sprite system). */
export function ResetSpriteCopyRequests(): void {
  sSpriteCopyRequestCount = 0;
  sSpriteCopyRequests.length = 0;
}

// ─── Sprite Anim Helpers ────────────────────────────────────────────────────

interface AnimDispatchSprite {
  oamIndex: number;
  animNum: number;
  animCmdIndex: number;
  animDelayCounter: number;
  animLoopCounter: number;
  animBeginning: boolean;
  animPaused: boolean;
  animEnded: boolean;
  hFlip: boolean;
  vFlip: boolean;
  usingSheet: boolean;
  sheetTileStart: number;
  images: ReadonlyArray<SpriteFrameImage> | null;
  anims: ReadonlyArray<ReadonlyArray<AnimCmd>> | null;
}

/** 1:1 décomp `void SetSpriteOamFlipBits(struct Sprite *sprite, u8 hFlip,
 *  u8 vFlip)` : sync flip bits sur l'OAM si pas en affine. */
function SetSpriteOamFlipBits(rt: DecompRuntime, sprite: AnimDispatchSprite, hFlip: boolean, vFlip: boolean): void {
  sprite.hFlip = hFlip;
  sprite.vFlip = vFlip;
  const oam = rt.gba.oam[sprite.oamIndex];
  if (!oam) return;
  oam.flipH = hFlip;
  oam.flipV = vFlip;
}

/** Décrément le delay counter (= sprite.animDelayCounter--). */
function DecrementAnimDelayCounter(sprite: AnimDispatchSprite): void {
  sprite.animDelayCounter--;
}

/** Apply un frame cmd : load son imageValue → request VRAM copy (or set
 *  sheet tileNum), apply hFlip/vFlip, set animDelayCounter. */
function ApplyAnimFrame(rt: DecompRuntime, sprite: AnimDispatchSprite, cmd: AnimCmd): void {
  if (cmd.kind !== 'frame') return;
  let duration = cmd.duration;
  if (duration > 0) duration--;
  sprite.animDelayCounter = duration;
  const oam = rt.gba.oam[sprite.oamIndex];
  // 1:1 décomp (sprite.c:933 / 985 / 1019) : `if (!(oam.affineMode & ST_OAM_AFFINE_ON_MASK))
  // SetSpriteOamFlipBits(...)`. En mode affine (affineMode 1 ou 3), les bits hFlip/vFlip
  // de l'OAM servent au numéro de matrice → ne JAMAIS les écraser. (Bit 0 = AFFINE_ON.)
  if (oam && !(oam.affineMode & 1)) {
    SetSpriteOamFlipBits(rt, sprite, cmd.hFlip, cmd.vFlip);
  }
  // Sheet vs frame-image VRAM dispatch :
  if (sprite.usingSheet) {
    if (oam) oam.tileId = sprite.sheetTileStart + cmd.imageValue;
  } else if (sprite.images) {
    if (oam) RequestSpriteFrameImageCopy(cmd.imageValue, oam.tileId, sprite.images);
  }
}

/** 1:1 décomp `void BeginAnim(struct Sprite *sprite)` (sprite.c:909-941) :
 *      sprite->animCmdIndex = 0;
 *      sprite->animEnded = FALSE;
 *      sprite->animLoopCounter = 0;
 *      imageValue = sprite->anims[sprite->animNum][0].frame.imageValue;
 *      if (imageValue != -1) {
 *          sprite->animBeginning = FALSE;
 *          ApplyFrame(0);
 *      } */
export function BeginAnim(rt: DecompRuntime, sprite: AnimDispatchSprite): void {
  sprite.animCmdIndex = 0;
  sprite.animEnded = false;
  sprite.animLoopCounter = 0;
  if (!sprite.anims) return;
  const animTable = sprite.anims[sprite.animNum];
  if (!animTable) return;
  const firstCmd = animTable[0];
  if (!firstCmd || firstCmd.kind !== 'frame') return;
  // imageValue != -1 (= type != end). Si type=end, on n'avance pas (= 1:1
  // décomp test `imageValue != -1` sur l'union, équivalent à kind!='end').
  sprite.animBeginning = false;
  ApplyAnimFrame(rt, sprite, firstCmd);
}

/** 1:1 décomp `void ContinueAnim(struct Sprite *sprite)` (sprite.c:943-966) :
 *      if (animDelayCounter)  → just dec + sync flips
 *      else if (!animPaused)  → animCmdIndex++ + dispatch sur cmd.type. */
export function ContinueAnim(rt: DecompRuntime, sprite: AnimDispatchSprite): void {
  if (sprite.animDelayCounter > 0) {
    DecrementAnimDelayCounter(sprite);
    // Re-sync flips au cas où l'OAM a été reset entre-temps.
    if (!sprite.anims) return;
    const animTable = sprite.anims[sprite.animNum];
    if (!animTable) return;
    const cmd = animTable[sprite.animCmdIndex];
    if (cmd && cmd.kind === 'frame') {
      // 1:1 décomp sprite.c:952 : flip bits SEULEMENT si non-affine (cf. ApplyAnimFrame).
      const oam = rt.gba.oam[sprite.oamIndex];
      if (oam && !(oam.affineMode & 1)) SetSpriteOamFlipBits(rt, sprite, cmd.hFlip, cmd.vFlip);
    }
    return;
  }
  if (sprite.animPaused) return;
  sprite.animCmdIndex++;
  if (!sprite.anims) return;
  const animTable = sprite.anims[sprite.animNum];
  if (!animTable) return;
  const cmd = animTable[sprite.animCmdIndex];
  if (!cmd) return;
  switch (cmd.kind) {
    case 'frame': AnimCmd_frame(rt, sprite, cmd); break;
    case 'end':   AnimCmd_end(sprite); break;
    case 'jump':  AnimCmd_jump(rt, sprite, cmd.target); break;
    case 'loop':  AnimCmd_loop(rt, sprite, cmd.count); break;
  }
}

/** 1:1 décomp `void AnimCmd_frame(struct Sprite *sprite)` (sprite.c:968-992) :
 *      load anims[animNum][animCmdIndex].frame fields + apply. */
function AnimCmd_frame(rt: DecompRuntime, sprite: AnimDispatchSprite, cmd: Extract<AnimCmd, { kind: 'frame' }>): void {
  ApplyAnimFrame(rt, sprite, cmd);
}

/** 1:1 décomp `void AnimCmd_end(struct Sprite *sprite)` (sprite.c:994-998) :
 *      sprite->animCmdIndex--; sprite->animEnded = TRUE; */
function AnimCmd_end(sprite: AnimDispatchSprite): void {
  sprite.animCmdIndex--;
  sprite.animEnded = true;
}

/** 1:1 décomp `void AnimCmd_jump(struct Sprite *sprite)` (sprite.c:1000-1026) :
 *      sprite->animCmdIndex = anims[animNum][animCmdIndex].jump.target;
 *      apply frame at new index. */
function AnimCmd_jump(rt: DecompRuntime, sprite: AnimDispatchSprite, target: number): void {
  sprite.animCmdIndex = target;
  if (!sprite.anims) return;
  const animTable = sprite.anims[sprite.animNum];
  if (!animTable) return;
  const cmd = animTable[sprite.animCmdIndex];
  if (cmd && cmd.kind === 'frame') ApplyAnimFrame(rt, sprite, cmd);
}

/** 1:1 décomp `void AnimCmd_loop(struct Sprite *sprite)` (sprite.c:1028-1034) :
 *      if (animLoopCounter) ContinueAnimLoop(sprite);
 *      else                 BeginAnimLoop(sprite); */
function AnimCmd_loop(rt: DecompRuntime, sprite: AnimDispatchSprite, count: number): void {
  if (sprite.animLoopCounter > 0) {
    ContinueAnimLoop(rt, sprite);
  } else {
    BeginAnimLoop(rt, sprite, count);
  }
}

/** 1:1 décomp `void BeginAnimLoop(struct Sprite *sprite)` (sprite.c:1036-1040) :
 *      animLoopCounter = anims[animNum][animCmdIndex].loop.count;
 *      JumpToTopOfAnimLoop + ContinueAnim(sprite). */
function BeginAnimLoop(rt: DecompRuntime, sprite: AnimDispatchSprite, count: number): void {
  sprite.animLoopCounter = count;
  JumpToTopOfAnimLoop(sprite);
  ContinueAnim(rt, sprite);
}

/** 1:1 décomp `void ContinueAnimLoop(struct Sprite *sprite)` (sprite.c:1043-1048) :
 *      animLoopCounter--;
 *      JumpToTopOfAnimLoop + ContinueAnim(sprite). */
function ContinueAnimLoop(rt: DecompRuntime, sprite: AnimDispatchSprite): void {
  sprite.animLoopCounter--;
  JumpToTopOfAnimLoop(sprite);
  ContinueAnim(rt, sprite);
}

/** 1:1 décomp `void JumpToTopOfAnimLoop(struct Sprite *sprite)` (sprite.c:1050-1065) :
 *      if (sprite->animLoopCounter)
 *      {
 *          sprite->animCmdIndex--;
 *          while (anims[animNum][animCmdIndex - 1].type != -3) // -3 = ANIMCMD_LOOP
 *          {
 *              if (animCmdIndex == 0) break;
 *              animCmdIndex--;
 *          }
 *          animCmdIndex--;
 *      }
 *
 * Ne fait rien si animLoopCounter == 0 (= dernier passage → on tombe sur le cmd
 * suivant la boucle). Sinon : recule d'abord HORS du cmd LOOP courant, puis remonte
 * tant que le cmd PRÉCÉDENT (`[animCmdIndex-1]`) n'est pas un LOOP (= borne ouvrant
 * le bloc), enfin recule d'un cran de plus pour que le `animCmdIndex++` de ContinueAnim
 * retombe sur la 1re frame du bloc. La décomp lit `[idx-1]` (OOB lecture en idx=0, garde
 * par le break) ; en TS `animTable[-1]` = undefined (kind != 'loop'). */
function JumpToTopOfAnimLoop(sprite: AnimDispatchSprite): void {
  if (!sprite.anims) return;
  const animTable = sprite.anims[sprite.animNum];
  if (!animTable) return;
  if (sprite.animLoopCounter) {
    sprite.animCmdIndex--;
    while (animTable[sprite.animCmdIndex - 1]?.kind !== 'loop') {
      if (sprite.animCmdIndex === 0) break;
      sprite.animCmdIndex--;
    }
    sprite.animCmdIndex--;
  }
}

/** 1:1 décomp `void AnimateSprite(struct Sprite *sprite)` (sprite.c:901-907) :
 *      sAnimFuncs[sprite->animBeginning](sprite);
 *      // sAnimFuncs = [ContinueAnim, BeginAnim]
 *      // Donc : animBeginning=true → BeginAnim ; sinon ContinueAnim.
 *
 * Affine anim handler not yet ported here (= séparé). */
export function AnimateSprite(rt: DecompRuntime, sprite: AnimDispatchSprite): void {
  if (sprite.animBeginning) {
    BeginAnim(rt, sprite);
  } else {
    ContinueAnim(rt, sprite);
  }
}

// ─── StartSpriteAnim helpers 1:1 décomp sprite.c:1346-1371 ────────────────────

/** 1:1 décomp `void StartSpriteAnim(struct Sprite *sprite, u8 animNum)`
 *  (sprite.c:1346-1351) :
 *      sprite->animNum = animNum;
 *      sprite->animBeginning = TRUE;
 *      sprite->animEnded = FALSE; */
export function StartSpriteAnim(sprite: AnimDispatchSprite, animNum: number): void {
  sprite.animNum = animNum;
  sprite.animBeginning = true;
  sprite.animEnded = false;
}

/** 1:1 décomp `void StartSpriteAnimIfDifferent(struct Sprite *sprite, u8 animNum)`
 *  (sprite.c:1353-1357) : skip if déjà sur animNum. */
export function StartSpriteAnimIfDifferent(sprite: AnimDispatchSprite, animNum: number): void {
  if (sprite.animNum !== animNum) StartSpriteAnim(sprite, animNum);
}

/** 1:1 décomp `void SeekSpriteAnim(struct Sprite *sprite, u8 animCmdIndex)`
 *  (sprite.c:1359-1371) : set animCmdIndex + force ContinueAnim once. */
export function SeekSpriteAnim(rt: DecompRuntime, sprite: AnimDispatchSprite, animCmdIndex: number): void {
  const tempBeginning = sprite.animBeginning;
  const tempDelayCounter = sprite.animDelayCounter;
  sprite.animBeginning = false;
  sprite.animDelayCounter = 0;
  sprite.animCmdIndex = animCmdIndex - 1;
  ContinueAnim(rt, sprite);
  if (sprite.animEnded) {
    sprite.animBeginning = tempBeginning;
    sprite.animDelayCounter = tempDelayCounter;
  }
}
