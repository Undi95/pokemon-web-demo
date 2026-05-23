/**
 * field-effect-emotes.ts — Port 1:1 STRICT du décomp trainer_see.c.
 *
 * Source unique de vérité (= ne JAMAIS diverger) :
 *   D:/Projet 1/decomps/pokeemeraude/src/trainer_see.c
 *
 * Structures portées 1:1 :
 *   - lignes 62-64    : sEmotion_ExclamationMarkGfx / QuestionMarkGfx / HeartGfx
 *   - lignes 113-128  : sOamData_Icons (shape 16x16, size 16x16, priority 1)
 *   - lignes 130-148  : sSpriteImageTable_ExclamationQuestionMark / HeartIcon
 *   - lignes 150-166  : sSpriteAnimTable_Icons (2 anims ANIMCMD_FRAME 60 frames)
 *   - lignes 168-188  : sSpriteTemplate_ExclamationQuestionMark / HeartIcon
 *                       (tileTag=TAG_NONE → branch `images` dans CreateSpriteAt)
 *   - lignes 696-729  : FldEff_ExclamationMarkIcon / QuestionMarkIcon / HeartIcon
 *   - lignes 731-743  : SetIconSpriteData
 *   - lignes 745-767  : SpriteCB_TrainerIcons (bounce + auto-destroy)
 *
 * Sprite allocation (= 1:1 décomp sprite.c:562-575 branch tileTag==TAG_NONE) :
 *   sprite->images = template->images;                                   ← SpriteFrameImage array
 *   tileNum = AllocSpriteTiles(images[0].size / TILE_SIZE_4BPP);         ← 4 tiles 4bpp
 *   if (tileNum == -1) { ResetSprite(); return MAX_SPRITES; }
 *   sprite->oam.tileNum = tileNum;
 *   sprite->usingSheet = FALSE;
 *
 * Sprite destroy (= 1:1 décomp sprite.c:622-628 branch !usingSheet) :
 *   for (i = sprite->oam.tileNum; i < tileEnd; i++) FREE_SPRITE_TILE(i);
 *
 * Pas de tag tile system, pas de pre-load tile range, pas de cache flag.
 * Chaque spawn → AllocSpriteTiles fresh. Chaque destroy → MarkObjTilesFree.
 *
 * Adaptation web justifiée :
 *   - PNG/PAL fetch async (= équivalent décomp INCGFX_U8 / general_0.pal static).
 *     Premier spawn lazy-load + skip cette frame. Frames suivants OK.
 *   - Palette OBJ via tag system (= 1:1 LoadObjectEventPalette pattern), pas
 *     de slot fixe hardcoded (= dynamique mais idempotent via IndexOfSpritePaletteTag).
 */

import type { DecompRuntime } from './decomp-runtime';
import { AllocSpriteTiles, MarkObjTilesFree, LoadSpritePalette, IndexOfSpritePaletteTag } from './sprite';
import { loadTileBin, loadGbaPal } from './gba/png-loader';
import { gObjectEvents, type ObjectEvent } from './object-events';
import { gPlayerAvatar } from './player-avatar';

// ─── Asset paths ────────────────────────────────────────────────────────────
// Équivalent décomp `static const u8 sEmotion_*Gfx[] = INCGFX_U8(...)` (= byte
// arrays statiques compilées dans le ROM). Notre port fetch async ces blobs au
// 1er spawn puis cache.

const EXCLAMATION_PNG = '/decomp/em/field_effects/emotion_exclamation.png';
const QUESTION_PNG    = '/decomp/em/field_effects/emotion_question.png';
const HEART_PNG       = '/decomp/em/field_effects/emotion_heart.png';
/** Palette dédiée OBJ. Source : `general_0.pal` (= 1:1 décomp
 *  `gFieldEffectObjectPalette0` loaded par LoadFieldEffectGraphics au boot). */
const EMOTE_PAL_BIN   = '/decomp/em/field_effects/emotion_exclamation.gbapal';

/** 1:1 décomp `FLDEFF_PAL_TAG_GENERAL_0` (event_object_movement_constants.h). */
const FLDEFF_PAL_TAG_GENERAL_0 = 'FLDEFF_PAL_TAG_GENERAL_0';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

const TILE_SIZE_4BPP = 32;
const TILES_PER_EMOTE = 4;                          // 16x16 = 2x2 tiles 4bpp
const EMOTE_SIZE_BYTES = TILES_PER_EMOTE * TILE_SIZE_4BPP;  // 128 bytes
/** 1:1 décomp `ANIMCMD_FRAME(N, 60)` → 60 game frames d'affichage avant END. */
const EMOTE_FRAMES_TTL = 60;

// ─── Types ──────────────────────────────────────────────────────────────────

/** Type d'emote (= 1:1 décomp FLDEFF_*_ICON enum). */
export type EmoteType = 'exclamation' | 'question' | 'heart';

interface EmoteState {
  /** OAM sprite ID alloué via CreateSpriteAtOam (= 1:1 décomp CreateSpriteAtEnd). */
  spriteId: number;
  /** Tile start dans le bitmap général (= 1:1 décomp sprite->oam.tileNum).
   *  Stocké pour libération via MarkObjTilesFree au destroy. */
  tileStart: number;
  /** localId du NPC qui porte cet emote (= pour tracking position). */
  npcLocalIdRaw: string;
  /** Frames restantes avant auto-destroy (= 1:1 décomp animEnded check). */
  framesRemaining: number;
  /** 1:1 décomp `sYVelocity` (= sprite->data[3]). Initial = -5. Incrémenté
   *  chaque frame quand sYOffset != 0 (= rebondit puis tombe). */
  yVelocity: number;
  /** 1:1 décomp `sYOffset` (= sprite->data[4]). Accumule yVelocity chaque
   *  frame. Utilisé comme y2 sprite offset. */
  yOffset: number;
}

const _activeEmotes: EmoteState[] = [];

// ─── Asset cache (= équivalent décomp INCGFX_U8 byte arrays statiques) ──────

let _gfxExclamation: Uint8Array | null = null;
let _gfxQuestion: Uint8Array | null = null;
let _gfxHeart: Uint8Array | null = null;
let _palData: Uint16Array | null = null;
let _assetsLoading: Promise<void> | null = null;

/** Fetch async les PNG + palette. Idempotent : si déjà loadé, no-op.
 *  Équivalent web du décomp `INCGFX_U8` (= byte arrays compilés dans ROM,
 *  immédiatement accessibles). Nous on fetch en async + cache.
 *
 *  IMPORTANT : ne dépend PAS de l'état du tag system. Les tiles VRAM sont
 *  alloués DYNAMIQUEMENT à chaque SpawnEmoteSprite (= 1:1 décomp). Ce cache
 *  ne tient que les BYTES SOURCE qui sont identiques à chaque appel. */
function _ensureAssetsLoaded(): Promise<void> {
  if (_gfxExclamation && _gfxQuestion && _gfxHeart && _palData) return Promise.resolve();
  if (_assetsLoading) return _assetsLoading;
  _assetsLoading = (async () => {
    try {
      const [excl, qst, hrt, pal] = await Promise.all([
        loadTileBin(EXCLAMATION_PNG, 4),
        loadTileBin(QUESTION_PNG, 4),
        loadTileBin(HEART_PNG, 4),
        loadGbaPal(EMOTE_PAL_BIN),
      ]);
      _gfxExclamation = excl.subarray(0, EMOTE_SIZE_BYTES);
      _gfxQuestion = qst.subarray(0, EMOTE_SIZE_BYTES);
      _gfxHeart = hrt.subarray(0, EMOTE_SIZE_BYTES);
      _palData = pal;
    } finally {
      _assetsLoading = null;
    }
  })();
  return _assetsLoading;
}

/** Returns le palette slot pour les emotes via tag system 1:1 décomp.
 *  Si tag déjà alloué (= persistant entre spawns), retourne le slot existant.
 *  Si clear (= ResetSpriteData entre temps), alloue un nouveau slot + écrit data.
 *  1:1 décomp pattern `LoadSpritePaletteIfTagExists` (sprite.c:2035). */
function _ensureEmotePaletteLoaded(): number {
  if (!_palData) return 0xFF;
  const existing = IndexOfSpritePaletteTag(FLDEFF_PAL_TAG_GENERAL_0);
  if (existing !== 0xFF) return existing;
  return LoadSpritePalette({ data: _palData, tag: FLDEFF_PAL_TAG_GENERAL_0 });
}

// ─── Public API 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `FldEff_ExclamationMarkIcon` (trainer_see.c:696-704) :
 *    u8 spriteId = CreateSpriteAtEnd(&sSpriteTemplate_ExclamationQuestionMark, 0, 0, 0x53);
 *    if (spriteId != MAX_SPRITES)
 *        SetIconSpriteData(&gSprites[spriteId], FLDEFF_EXCLAMATION_MARK_ICON, 0);
 *
 *  Pour le type 'question' :
 *  1:1 décomp `FldEff_QuestionMarkIcon` (trainer_see.c:706-714) idem + frame 1.
 *
 *  Pour le type 'heart' :
 *  1:1 décomp `FldEff_HeartIcon` (trainer_see.c:716-728) :
 *    spriteId = CreateSpriteAtEnd(&sSpriteTemplate_HeartIcon, 0, 0, 0x52);
 *    SetIconSpriteData(...); sprite->oam.paletteNum = 2;
 *
 *  Returns true si spawn OK, false sinon (= assets pas loadés OU OBJ VRAM
 *  saturé OU NPC introuvable). Le caller (= movement-system) ne re-essaie pas.
 */
export function SpawnEmoteSprite(rt: DecompRuntime, npcLocalIdRaw: string, type: EmoteType): boolean {
  if (!_gfxExclamation || !_gfxQuestion || !_gfxHeart || !_palData) {
    // Lazy load + skip cette frame (= défensif web, le décomp n'a pas ce cas
    // car les assets sont compilés dans le ROM).
    void _ensureAssetsLoaded();
    return false;
  }
  // 1:1 décomp sprite.c:562-575 branch tileTag==TAG_NONE :
  //   tileNum = AllocSpriteTiles(images[0].size / TILE_SIZE_4BPP);
  //   if (tileNum == -1) { ResetSprite(); return MAX_SPRITES; }
  const tileStart = AllocSpriteTiles(TILES_PER_EMOTE);
  if (tileStart < 0) {
    console.warn('[field-effect-emotes] AllocSpriteTiles saturé — emote skip');
    return false;
  }

  // Sélection du frame data + palette selon le type :
  //   - exclamation : sSpriteImageTable_ExclamationQuestionMark[0] (= sEmotion_ExclamationMarkGfx)
  //   - question    : sSpriteImageTable_ExclamationQuestionMark[1] (= sEmotion_QuestionMarkGfx)
  //   - heart       : sSpriteImageTable_HeartIcon[0] (= sEmotion_HeartGfx)
  let gfxData: Uint8Array;
  if (type === 'exclamation') gfxData = _gfxExclamation;
  else if (type === 'question') gfxData = _gfxQuestion;
  else gfxData = _gfxHeart;

  // 1:1 décomp : RequestSpriteFrameImageCopy copierait images[frame].data en
  // VRAM à tileNum*32 quand le sprite anim cycle. Comme les emotes n'ont pas
  // d'anim cycle (= 1 seul frame visible 60 frames), on copie directement ici
  // au spawn (= équivalent du 1er ProcessSpriteCopyRequests fire après
  // RequestSpriteFrameImageCopy au StartSpriteAnim).
  rt.gba.objVram.set(gfxData, tileStart * TILE_SIZE_4BPP);

  // Palette : 1:1 décomp sprite.c:585-586 :
  //   if (template->paletteTag != TAG_NONE)
  //       sprite->oam.paletteNum = IndexOfSpritePaletteTag(template->paletteTag);
  //
  // Template_ExclamationQuestionMark a paletteTag=TAG_NONE → le décomp utilise
  // la palette ambiante (= général_0 loadée par LoadFieldEffectGraphics au boot).
  // Template_HeartIcon a paletteTag=FLDEFF_PAL_TAG_GENERAL_0 → IndexOfSpritePaletteTag.
  // Puis FldEff_HeartIcon override avec paletteNum=2 (ligne 725).
  //
  // Notre port : on utilise LE MÊME slot pour les 3 emotes (= même palette
  // général_0.pal source) via tag system. Pas de différence paletteNum=2 car
  // notre slot est dynamique.
  const paletteSlot = _ensureEmotePaletteLoaded();
  if (paletteSlot === 0xFF) {
    // Palette saturé → free tiles + abort.
    MarkObjTilesFree(tileStart * TILE_SIZE_4BPP, TILES_PER_EMOTE * TILE_SIZE_4BPP);
    console.warn('[field-effect-emotes] palette OBJ saturé — emote skip');
    return false;
  }

  // Position initiale = sprite NPC déjà synchronisé (= 1:1 décomp `sprite->x =
  // objEventSprite->x; sprite->y = objEventSprite->y - 16`).
  const npc = _findNpc(npcLocalIdRaw);
  if (!npc) {
    MarkObjTilesFree(tileStart * TILE_SIZE_4BPP, TILES_PER_EMOTE * TILE_SIZE_4BPP);
    console.warn(`[field-effect-emotes] SpawnEmoteSprite: NPC ${npcLocalIdRaw} not found`);
    return false;
  }
  const npcSprite = npc.spriteId >= 0 ? rt.gSprites.get(npc.spriteId) : null;
  const spriteX = npcSprite?.x ?? 0;
  const spriteY = (npcSprite?.y ?? 0) - 16;

  // 1:1 STRICT décomp trainer_see.c:698 `CreateSpriteAtEnd` — alloue gSprites
  // slot depuis MAX_SPRITES-1 vers 0. Sans `fromEnd: true`, le sprite emote
  // prend slot bas (= occupé par NPCs) → écrase MOM avec 16x16 emote → "moitié
  // de maman" (bug user 2026-05-24).
  const result = rt.CreateSpriteAtOam({
    tileId: tileStart,
    paletteBank: paletteSlot,
    x: spriteX,
    y: spriteY,
    shape: 0,        // SPRITE_SHAPE(16x16) = SQUARE
    size: 1,         // SPRITE_SIZE(16x16)
    priority: 1,     // 1:1 décomp sOamData_Icons.priority = 1
    paletteMode: 0,  // ST_OAM_4BPP
    affineMode: 0,   // ST_OAM_AFFINE_OFF
    fromEnd: true,   // 1:1 décomp CreateSpriteAtEnd (sprite.c:513-522)
  });

  // 1:1 décomp SetIconSpriteData (trainer_see.c:731-743) : init data slots +
  // StartSpriteAnim. Notre port stocke la state dans _activeEmotes pour ticker.
  _activeEmotes.push({
    spriteId: result.spriteId,
    tileStart,
    npcLocalIdRaw,
    framesRemaining: EMOTE_FRAMES_TTL,  // 1:1 décomp ANIMCMD_FRAME(0, 60) → 60 frames.
    yVelocity: -5,                       // 1:1 décomp sprite->sYVelocity = -5.
    yOffset: 0,
  });
  return true;
}

/** 1:1 décomp `SpriteCB_TrainerIcons` (trainer_see.c:745-767) :
 *      sYOffset += sYVelocity;
 *      sprite->x = objEventSprite->x;        ← copie du sprite NPC (= déjà sync cam)
 *      sprite->y = objEventSprite->y - 16;
 *      sprite->x2 = objEventSprite->x2;
 *      sprite->y2 = objEventSprite->y2 + sYOffset;
 *      if (sYOffset) sYVelocity++;
 *      else sYVelocity = 0;
 *      → quand animEnded (= 60 frames), FieldEffectStop → DestroySprite.
 *
 *  Crucial 1:1 : on copie `objEventSprite->x/y`, pas `npc.worldX/Y`. La
 *  raison : `sprite.x/y` est la position FINALE post-camera-pan post-offset
 *  (cf. object-events.ts `sprite.x = npc.worldX + offX - panX + visualOffsetX`).
 *  Si on lit `worldX` directement, l'emote sera décalé du sprite NPC.
 *
 *  À call chaque frame depuis le main loop OW. */
export function tickEmoteSprites(rt: DecompRuntime): void {
  for (let i = _activeEmotes.length - 1; i >= 0; i--) {
    const emote = _activeEmotes[i];
    const npc = _findNpc(emote.npcLocalIdRaw);
    if (!npc || !npc.active) {
      // NPC disparu → cleanup sprite (= 1:1 décomp TryGetObjectEventIdByLocalIdAndMap fail).
      _destroyEmoteSprite(rt, emote);
      _activeEmotes.splice(i, 1);
      continue;
    }
    emote.framesRemaining--;
    if (emote.framesRemaining <= 0) {
      // animEnded (= 60 frames passées) → FieldEffectStop → DestroySprite.
      _destroyEmoteSprite(rt, emote);
      _activeEmotes.splice(i, 1);
      continue;
    }
    // 1:1 décomp : sYOffset += sYVelocity, puis sYVelocity++ si sYOffset != 0.
    emote.yOffset += emote.yVelocity;
    if (emote.yOffset !== 0) emote.yVelocity++;
    else emote.yVelocity = 0;
    // 1:1 décomp : sprite->x = objEventSprite->x; sprite->y = objEventSprite->y - 16
    // + sYOffset (= bounce). Copy depuis le sprite NPC déjà synchronisé.
    const sprite = rt.gSprites.get(emote.spriteId);
    const npcSprite = npc.spriteId >= 0 ? rt.gSprites.get(npc.spriteId) : null;
    if (sprite && npcSprite) {
      sprite.x = npcSprite.x;
      sprite.y = npcSprite.y - 16 + emote.yOffset;
    }
  }
}

/** Cleanup tous les emote sprites actifs. À call au map switch / scene close
 *  (= 1:1 décomp FieldEffectStop + destruction). */
export function DestroyAllEmoteSprites(rt: DecompRuntime): void {
  for (const emote of _activeEmotes) {
    _destroyEmoteSprite(rt, emote);
  }
  _activeEmotes.length = 0;
}

// ─── Internal helpers ──────────────────────────────────────────────────────

/** Lookup NPC ObjectEvent par localIdRaw, ou retourne un proxy player-shaped
 *  si localIdRaw == 'LOCALID_PLAYER' (= 1:1 décomp `gPlayerAvatar.objectEventId`
 *  pointe vers un slot dans gObjectEvents, mais notre TS player utilise une
 *  struct `gPlayerAvatar` séparée). On wrap `gPlayerAvatar` en mini-ObjectEvent
 *  pour que tickEmoteSprites puisse lire spriteId. */
function _findNpc(localIdRaw: string): ObjectEvent | null {
  if (localIdRaw === 'LOCALID_PLAYER') {
    return {
      active: true,
      spriteId: gPlayerAvatar.spriteId,
      localIdRaw: 'LOCALID_PLAYER',
    } as unknown as ObjectEvent;
  }
  for (const npc of gObjectEvents) {
    if (npc.active && npc.localIdRaw === localIdRaw) return npc;
  }
  return null;
}

/** 1:1 décomp DestroySprite sprite.c:618-631 branch !usingSheet :
 *    for (i = sprite->oam.tileNum; i < tileEnd; i++) FREE_SPRITE_TILE(i);
 *  Libère les 4 tiles dans `sSpriteTileAllocBitmap` pour ré-utilisation. */
function _destroyEmoteSprite(rt: DecompRuntime, emote: EmoteState): void {
  const sprite = rt.gSprites.get(emote.spriteId);
  if (sprite) {
    if (sprite.oamIndex >= 0) {
      rt.gba.oam[sprite.oamIndex].visible = false;
    }
    sprite.inUse = false;
  }
  // 1:1 décomp DestroySprite branch !usingSheet : free tiles.
  if (emote.tileStart >= 0) {
    MarkObjTilesFree(emote.tileStart * TILE_SIZE_4BPP, TILES_PER_EMOTE * TILE_SIZE_4BPP);
  }
}

// ─── Debug exposure ────────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__getActiveEmotes = () => [..._activeEmotes];

/** Dev helper : spawn un emote sur le player ou un NPC visible.
 *  Usage console : `testEmote()` (sur player), `testEmote('exclamation', 'LOCALID_PLAYERS_HOUSE_1F_MOM')`. */
(globalThis as Record<string, unknown>).testEmote = (
  type: EmoteType = 'exclamation',
  npcLocalIdRaw: string = 'LOCALID_PLAYER',
): boolean => {
  const rt = (globalThis as { getRuntime?: () => unknown }).getRuntime?.() as DecompRuntime | null;
  if (!rt) {
    console.warn('[testEmote] no runtime');
    return false;
  }
  return SpawnEmoteSprite(rt, npcLocalIdRaw, type);
};

/** Pre-load lazy : à call au boot field pour éviter le skip du 1er spawn.
 *  Idempotent : safe si déjà loadé. Le décomp load au boot via
 *  LoadFieldEffectGraphics, on offre la même API. */
export function LoadEmoteAssets(_rt: DecompRuntime): Promise<void> {
  return _ensureAssetsLoaded();
}
