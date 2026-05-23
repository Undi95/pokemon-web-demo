/**
 * field-effect-shadow.ts — 1:1 décomp shadow sous player.
 *
 * Source de vérité (1:1 décomp) :
 *   - `src/field_effect_helpers.c:233-274` (FldEff_Shadow + UpdateShadowFieldEffect)
 *   - `src/data/field_effects/field_effect_objects.h:30-63` (gFieldEffectObjectTemplate_ShadowMedium)
 *
 * Comportement 1:1 décomp :
 *   - Sprite shadow PERMANENT sous le player tracking sprite.x, sprite.y de
 *     façon "ground-locked" (= si player jump, shadow reste au sol).
 *   - Pendant ledge jump, shadow stays au point de départ visuel = donne
 *     effet 3D (= player jumps over shadow → over ledge).
 *   - Hidden quand player on tall grass / surf water / reflective tile.
 *
 * Asset : shadow_medium.png (= 16×8 = 2 tiles 4bpp) — match player width.
 * Palette : TAG_NONE → bank par défaut (= 0, partage avec player palette).
 *
 * Phase 4.10 first cut : shadow size MEDIUM hardcoded (= player size).
 * Pas de hide quand sur grass/water (= future). Pas d'anim multi-frame.
 */

import type { DecompRuntime } from './decomp-runtime';
import { loadIndexedPngStrict } from './gba/png-loader';
import { GetCameraTopLeftCoords, gTotalCamera, GetBgVofsBaseline } from './field-camera';
import { MAP_OFFSET } from './map-loader';
import { LoadSpriteSheet, IndexOfSpriteTileTag } from './sprite';

const SHADOW_PNG = '/decomp/em/field_effects/shadow_medium.png';

/** 1:1 STRICT décomp `LoadSpriteSheet(sFieldEffectObjectGfxInfo_ShadowMedium)`.
 *  Palette = bank 0 (TAG_NONE shared player). */
const TAG_SHADOW_GFX = 'FIELD_EFFECT_SHADOW_GFX';
let _shadowTileStart = -1;
const TILES_PER_SHADOW = 2;
const SHADOW_PALETTE_BANK = 0;  // TAG_NONE → shared with player

interface ShadowState {
  spriteId: number;
  oamIndex: number;
  active: boolean;
}

const _shadow: ShadowState = { spriteId: -1, oamIndex: -1, active: false };
let _initialized = false;

// ─── Reset hook : clear _shadow au ResetSpriteData ─────────────────────────
// 1:1 décomp : sprite.c:294 ResetSpriteData set tous sprite.inUse=FALSE. Notre
// port utilise un pool externe `_shadow` qui garde son spriteId stale apres
// gSprites.clear(). Au prochain DestroyShadowSprite, ce spriteId pointe vers
// un autre sprite (NPC respawn, etc.) -> set son inUse=false par erreur ->
// CreateSpriteAtOam reutilise le slot avec shape/size du shadow (16x8) ->
// ecrase ce sprite. Meme pattern bug que A1f/A1g.
(() => {
  const g = globalThis as Record<string, unknown>;
  const callbacks = (g.__spriteResetCallbacks as Array<() => void> | undefined) ?? [];
  callbacks.push(() => { _shadow.active = false; _shadow.spriteId = -1; _shadow.oamIndex = -1; });
  g.__spriteResetCallbacks = callbacks;
})();

function pngTo1dObjLayoutShadow(charData: Uint8Array): Uint8Array {
  // shadow_medium.png = 16×8 = 2×1 tiles row-major. PNG bytes already in
  // tile-major format from loadIndexedPngStrict. Direct copy.
  const TILE_BYTES = 32;
  const out = new Uint8Array(TILES_PER_SHADOW * TILE_BYTES);
  out.set(charData.subarray(0, TILES_PER_SHADOW * TILE_BYTES));
  return out;
}

let _initPromise: Promise<void> | null = null;

export function preloadShadowEffect(rt: DecompRuntime): Promise<void> {
  // 1:1 STRICT : check tag présent ; sinon re-load.
  const stillAlloc = _initialized && IndexOfSpriteTileTag(TAG_SHADOW_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_initPromise && !_initialized) return _initPromise;
  _initialized = false; _initPromise = null;
  _initPromise = (async () => {
    const png = await loadIndexedPngStrict(SHADOW_PNG, 4);
    const reordered = pngTo1dObjLayoutShadow(png.charData);
    _shadowTileStart = LoadSpriteSheet({
      data: reordered, size: reordered.length, tag: TAG_SHADOW_GFX,
    });
    _initialized = true;
  })();
  return _initPromise;
}

/** Crée le shadow sprite (= 1 instance permanente sous player). À call après
 *  InitPlayerAvatar pour avoir l'OAM player créé en premier (= z-ordering). */
export function CreateShadowSprite(rt: DecompRuntime): void {
  if (!_initialized) return;
  if (_shadow.active) DestroyShadowSprite(rt);
  const result = rt.CreateSpriteAtOam({
    tileId: _shadowTileStart,
    paletteBank: SHADOW_PALETTE_BANK,
    x: 0, y: 0,
    shape: 1, size: 0,  // 16×8 (= shape WIDE, size SMALL)
    priority: 2,         // = same as player, shadow drawn before via OAM order
    paletteMode: 0,
    affineMode: 0,
  });
  _shadow.spriteId = result.spriteId;
  _shadow.oamIndex = result.oamIndex;
  _shadow.active = true;
}

/** Update shadow position chaque frame APRÈS PlayerStep depuis MainCB2.
 *  1:1 décomp `UpdateShadowFieldEffect` (field_effect_helpers.c:262-263) :
 *    sprite->x = linkedSprite->x;
 *    sprite->y = linkedSprite->y + sprite->sYOffset;
 *  Shadow copy player sprite x DIRECTEMENT (= player à screen position fixe,
 *  pas worldX qui drift avec camera scroll). Y baseline = SCREEN_CENTER_Y + 8
 *  (= 80, mid-tile). Pas de jumpYOffset → reste au sol pendant l'arc.
 *
 *  @param playerSpriteId  gPlayerAvatar.spriteId (= pour lookup linked sprite). */
export function UpdateShadowSprite(rt: DecompRuntime, playerSpriteId: number): void {
  if (!_initialized || !_shadow.active) return;
  const shadowSprite = rt.gSprites.get(_shadow.spriteId);
  if (!shadowSprite) { _shadow.active = false; return; }
  const playerSprite = rt.gSprites.get(playerSpriteId);
  if (!playerSprite) return;
  // 1:1 décomp : copie player sprite x. Player est à fixed screen position
  // (= SCREEN_CENTER_X = 120) donc shadow.x = 120 toujours.
  shadowSprite.x = playerSprite.x;
  // sYOffset = (graphicsInfo->height >> 1) - gShadowVerticalOffsets[shadowSize].
  // Pour player 16×32 height + medium shadow → ~+8. Notre baseline player
  // sprite.y = 72 (= SCREEN_CENTER_Y), shadow ground level = 72 + 8 = 80.
  // Important : on utilise le BASELINE 72, PAS le sprite.y qui peut avoir
  // jumpYOffset → shadow reste ground-locked pendant le saut (= effet 3D).
  const PLAYER_BASELINE_Y = 72;
  // sYOffset = +12 → shadow ~à hauteur des feet du player (= sous lui, pas
  // chevauchant le corps). Décomp utilise gShadowVerticalOffsets[shadowSize]
  // qui varie selon graphics height ; medium ~12 px sous baseline.
  const SHADOW_Y_OFFSET = 12;
  shadowSprite.y = PLAYER_BASELINE_Y + SHADOW_Y_OFFSET;
  // void unused params (= API future si on track avec coords)
  void GetBgVofsBaseline;
  void gTotalCamera;
  void GetCameraTopLeftCoords;
  void MAP_OFFSET;
}

export function DestroyShadowSprite(rt: DecompRuntime): void {
  if (!_shadow.active) return;
  const sprite = rt.gSprites.get(_shadow.spriteId);
  if (sprite) {
    sprite.inUse = false;
    rt.gba.oam[_shadow.oamIndex].visible = false;
  }
  rt.gSprites.delete(_shadow.spriteId);
  _shadow.active = false;
  _shadow.spriteId = -1;
  _shadow.oamIndex = -1;
}
