/**
 * field-effect-grass.ts — 1:1 décomp tall grass rustle anim.
 *
 * Source de vérité (1:1 décomp) :
 *   - `src/data/field_effects/field_effect_objects.h:71-100` (sPicTable_TallGrass + sAnim_TallGrass + gFieldEffectObjectTemplate_TallGrass)
 *   - `src/event_object_movement.c:7815` (GroundEffect_StepOnTallGrass)
 *   - `src/field_effect_helpers.c:291` (FldEff_TallGrass)
 *
 * Comportement 1:1 décomp :
 *   - Player walks INTO tile MB_TALL_GRASS → sprite 16×16 anime 5 frames
 *     (= rustle effect) puis disparaît.
 *   - Sprite tracks player tile (= reste visible tant que player sur tile,
 *     mais Phase 4.10 first cut : auto-destruct après 50 game frames).
 *
 * Anim 1:1 décomp `sAnim_TallGrass` (field_effect_objects.h:81-89) :
 *   ANIMCMD_FRAME(1, 10), ANIMCMD_FRAME(2, 10), ANIMCMD_FRAME(3, 10),
 *   ANIMCMD_FRAME(4, 10), ANIMCMD_FRAME(0, 10), ANIMCMD_END.
 *   Total = 50 game frames @ 60fps ≈ 0.83 sec.
 *
 * PNG layout : tall_grass.png = 80×16 = 5 frames × 16×16. 4 tiles per frame.
 * Total = 20 tiles. Allocate at OBJ tile 952..971 (= just before warp arrow 992).
 *
 * Phase 4.10 simplification (vs décomp) :
 *   - Pas de tracking par-NPC (= décomp tracks via objEvent localId/mapNum).
 *     Notre impl : sprite spawn + anim + auto-destroy par timer.
 *   - Pas de SeekSpriteAnim "skip to end" pour spawn cases.
 *   - Multi-instance : pool de 4 sprites pour permettre overlap (= player walks
 *     fast through grass, plusieurs effects actifs simultanément).
 */

import type { DecompRuntime } from '../system/decomp-runtime';
import { LoadSpriteSheet, LoadSpritePalette, IndexOfSpriteTileTag } from '../system/sprite';
import { loadIndexedPngStrict } from '../gba/png-loader';
import { SetSpritePosToOffsetMapCoords } from './field-camera';
import { MAP_OFFSET, MapGridGetMetatileBehaviorAt } from './map-loader';
import { gObjectEvents, type ObjectEvent, TryGetObjectEventIdByLocalIdAndMap } from './object-events';
import { MetatileBehavior_IsTallGrass } from '../../game/metatile_behavior';

/** 1:1 décomp LOCALID_PLAYER (= 0xFF). Owner par défaut du grass effect (chemin
 *  player-avatar ad-hoc), tracké via TryGetObjectEventIdByLocalIdAndMap(0xFF, 0, 0). */
const LOCALID_PLAYER = 0xFF;

const TALL_GRASS_PNG = '/decomp/em/field_effects/tall_grass.png';
const GENERAL_1_PAL  = '/decomp/em/field_effects/general_1.pal';

// ─── OBJ allocation (= 20 tiles avant warp arrow 992) ──────────────────────

/** 1:1 STRICT décomp `LoadSpriteSheet(sFieldEffectObjectGfxInfo_TallGrass)`
 *  + `LoadSpritePalette(sFieldEffectObjectPaletteInfo_General1)`. Tag system
 *  bitmap-based honore reserved zone. */
const TAG_TALL_GRASS_GFX = 'FIELD_EFFECT_TALL_GRASS_GFX';
const TAG_TALL_GRASS_PAL = 'FIELD_EFFECT_TALL_GRASS_PAL';
let _tallGrassTileStart = -1;
let _tallGrassPalSlot = -1;
const TILES_PER_FRAME = 4;  // 16×16 = 2x2 tiles 4bpp
const NUM_FRAMES = 5;

// ─── Anim spec 1:1 décomp ──────────────────────────────────────────────────

/** sAnim_TallGrass : (frameIdx, gameFramesDuration) sequence. */
const ANIM_SEQUENCE: ReadonlyArray<{ frameIdx: number; duration: number }> = [
  { frameIdx: 1, duration: 10 },
  { frameIdx: 2, duration: 10 },
  { frameIdx: 3, duration: 10 },
  { frameIdx: 4, duration: 10 },
  { frameIdx: 0, duration: 10 },
];

// ─── Module state ─────────────────────────────────────────────────────────

interface GrassEffectState {
  spriteId: number;
  oamIndex: number;
  /** Game frame counter. L'anim cycle 5 frames @10 (= 50f) puis HOLD frame 0
   *  (= 1:1 décomp sAnim_TallGrass END), PAS de despawn auto à 50f. */
  ticks: number;
  /** 1:1 décomp `sprite->sX/sY` : tuile de l'herbe en coords INTERNAL (= currentCoords
   *  du joueur au moment du spawn). Sert au despawn conditionnel. */
  tileX: number;
  tileY: number;
  /** 1:1 décomp `sprite->sObjectMoved` : passe TRUE quand l'OWNER (player OU NPC) a
   *  quitté la tuile (current ET previous coords != tile). Despawn = objectMoved && animEnded. */
  objectMoved: boolean;
  /** 1:1 décomp `sprite->sLocalId/sMapNum/sMapGroup` : identité de l'object event qui a
   *  déclenché l'effet (= gFieldEffectArguments[4..5]). UpdateTallGrassFieldEffect track
   *  CET objet (via TryGetObjectEventIdByLocalIdAndMap), pas le player en dur → un NPC qui
   *  marche dans l'herbe laisse un rustle persistant 1:1. localId 0xFF = LOCALID_PLAYER. */
  localId: number;
  mapNum: number;
  mapGroup: number;
  active: boolean;
}

/** Pool de 4 effects (= overlap quand player run dans grass). */
const POOL_SIZE = 4;
const _pool: GrassEffectState[] = [];
let _initialized = false;

// ─── Reset hook : clear _pool au ResetSpriteData ───────────────────────────
// 1:1 décomp : sprite.c:294 ResetSpriteData set tous sprite.inUse=FALSE. Notre
// port utilise un pool externe `_pool` qui garde ses spriteIds stale apres
// gSprites.clear(). Au prochain tick/destroy, ces spriteIds pointent vers
// d'autres sprites -> ecrasement par erreur. Meme pattern bug que A1f/A1g.
(() => {
  const g = globalThis as Record<string, unknown>;
  const callbacks = (g.__spriteResetCallbacks as Array<() => void> | undefined) ?? [];
  callbacks.push(() => { _pool.length = 0; });
  g.__spriteResetCallbacks = callbacks;
})();

// ─── PNG loader (= 5 frames concaténés en OBJ 1D layout) ──────────────────

/** PNG layout 80×16 = 10×2 tiles row-major. Each frame F (= 0..4) occupe
 *  PNG cols 2F, 2F+1 sur 2 rows = 4 tiles. */
function pngTo1dObjLayoutGrass(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32;
  const FRAME_W_TILES = 2;
  const FRAME_H_TILES = 2;
  const PNG_WIDTH_TILES = 10;
  const out = new Uint8Array(NUM_FRAMES * TILES_PER_FRAME * TILE_BYTES);
  for (let f = 0; f < NUM_FRAMES; f++) {
    for (let row = 0; row < FRAME_H_TILES; row++) {
      for (let col = 0; col < FRAME_W_TILES; col++) {
        const pngTileIdx = row * PNG_WIDTH_TILES + (f * FRAME_W_TILES) + col;
        const objTileIdx = f * TILES_PER_FRAME + row * FRAME_W_TILES + col;
        out.set(
          charData.subarray(pngTileIdx * TILE_BYTES, (pngTileIdx + 1) * TILE_BYTES),
          objTileIdx * TILE_BYTES,
        );
      }
    }
  }
  return out;
}

/** Parse une .pal file format JASC 16 colors → Uint16Array RGB15. */
async function loadGeneralPal1(): Promise<Uint16Array> {
  const text = await fetch(GENERAL_1_PAL).then(r => r.text());
  const lines = text.split(/\r?\n/);
  // JASC-PAL lines 4..19 = 16 colors "R G B" 0-255.
  const out = new Uint16Array(16);
  for (let i = 0; i < 16; i++) {
    const line = lines[3 + i] ?? '';
    const m = line.match(/^\s*(\d+)\s+(\d+)\s+(\d+)/);
    if (!m) continue;
    const r = Number(m[1]) >> 3;
    const g = Number(m[2]) >> 3;
    const b = Number(m[3]) >> 3;
    out[i] = r | (g << 5) | (b << 10);
  }
  return out;
}

// ─── Init ──────────────────────────────────────────────────────────────────

let _initPromise: Promise<void> | null = null;

export function preloadTallGrassEffect(rt: DecompRuntime): Promise<void> {
  // 1:1 STRICT : check tag présent ; sinon re-load.
  const stillAlloc = _initialized && IndexOfSpriteTileTag(TAG_TALL_GRASS_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_initPromise && !_initialized) return _initPromise;
  _initialized = false; _initPromise = null;
  _initPromise = (async () => {
    const png = await loadIndexedPngStrict(TALL_GRASS_PNG, 4);
    const reordered = pngTo1dObjLayoutGrass(png.charData);
    // 1:1 STRICT décomp LoadSpriteSheet via bitmap allocator.
    _tallGrassTileStart = LoadSpriteSheet({
      data: reordered, size: reordered.length, tag: TAG_TALL_GRASS_GFX,
    });

    // Load palette : prefer general_1.pal (= 1:1 décomp). Fallback PNG palette.
    let palette: Uint16Array;
    try {
      palette = await loadGeneralPal1();
    } catch {
      palette = png.palette;
    }
    // 1:1 STRICT décomp LoadSpritePalette : scan first-free.
    _tallGrassPalSlot = LoadSpritePalette({ data: palette, tag: TAG_TALL_GRASS_PAL });
    // 1:1 décomp : NE PAS flushTo inline (= cf. player-avatar.ts:InitPlayerAvatar
    // pour rationale détaillée). Auto-flushTo VBlank (= TransferPlttBuffer) gere
    // ça en respectant `bufferTransferDisabled` pour gater le palette transfer
    // pendant un warp load. Sans gate, preloadTallGrassEffect leak les NEW grass
    // colors qui contribuent au flash visible avant fade-in dest map.

    // Init pool : tous slots à -1 (= libre).
    for (let i = 0; i < POOL_SIZE; i++) {
      _pool[i] = {
        spriteId: -1, oamIndex: -1, ticks: 0,
        tileX: 0, tileY: 0, objectMoved: false,
        localId: LOCALID_PLAYER, mapNum: 0, mapGroup: 0, active: false,
      };
    }
    _initialized = true;
  })();
  return _initPromise;
}

// ─── Spawn ─────────────────────────────────────────────────────────────────

/** Trouve un slot libre dans le pool. -1 si pool full. */
function findFreeSlot(): number {
  for (let i = 0; i < POOL_SIZE; i++) {
    if (!_pool[i].active) return i;
  }
  return -1;
}

/** 1:1 décomp `FldEff_TallGrass` (field_effect_helpers.c:291).
 *  Spawn un sprite tall grass effect à la position LOGICAL (mapX, mapY).
 *  Auto-destroy après 50 game frames (= anim cycle complet).
 *  Caller (= player-avatar) passe gPlayerAvatar.x/y pour éviter circular import. */
export function SpawnTallGrassEffect(
  rt: DecompRuntime, mapX: number, mapY: number, spawnStatic = false,
  localId: number = LOCALID_PLAYER, mapNum = 0, mapGroup = 0,
): void {
  if (!_initialized) return;
  // 1:1 décomp : éviter les doublons — si un effet est déjà actif sur cette tuile
  // (= GroundEffect re-déclenché alors que l'effet vit encore), ne pas re-spawn.
  const tileX = mapX + MAP_OFFSET, tileY = mapY + MAP_OFFSET;
  for (const e of _pool) {
    if (e.active && e.tileX === tileX && e.tileY === tileY) return;
  }
  const slot = findFreeSlot();
  if (slot < 0) return;  // pool full = silently drop (= no overflow)

  // 1:1 décomp `SetSpritePosToOffsetMapCoords(&x, &y, 8, 8)` : tile center + 8 dans
  // les 2 axes → coords MONDE fixes (= tile mid, niveau corps du player) ;
  // `coordOffsetEnabled` fait suivre la caméra via gSpriteCoordOffset (syncSpritesToOam).
  const npcGBackupCol = mapX + MAP_OFFSET;
  const npcGBackupRow = mapY + MAP_OFFSET;
  const world = SetSpritePosToOffsetMapCoords(npcGBackupCol, npcGBackupRow, 8, 8);

  const result = rt.CreateSpriteAtOam({
    tileId: _tallGrassTileStart + 1 * TILES_PER_FRAME,  // start at frame 1
    paletteBank: _tallGrassPalSlot,
    x: world.x, y: world.y,
    shape: 0, size: 1,  // 16x16 (= shape SQUARE, size SMALL)
    priority: 2,         // = behind player (player priority 2 too, but tall grass derrière BG2)
    paletteMode: 0,
    affineMode: 0,
  });
  // 1:1 décomp `sprite->coordOffsetEnabled = TRUE` (field_effect_helpers.c:299).
  const sprite = rt.gSprites.get(result.spriteId);
  if (sprite) { sprite.x = world.x; sprite.y = world.y; sprite.coordOffsetEnabled = true; }

  const state = _pool[slot];
  state.spriteId = result.spriteId;
  state.oamIndex = result.oamIndex;
  // 1:1 décomp `if (gFieldEffectArguments[7]) SeekSpriteAnim(sprite, 4)` : au SPAWN
  // (retour de combat/menu sur tuile herbe, GroundEffect_SpawnOnTallGrass) l'anim
  // est sautée à la fin → overlay STATIQUE sans rustle. Au PAS (StepOnTallGrass)
  // elle joue depuis le début. ticks=50 = anim terminée → hold frame 0.
  state.ticks = spawnStatic ? 50 : 0;
  // 1:1 décomp `sprite->sX/sY = gFieldEffectArguments[0/1]` = tuile INTERNAL.
  state.tileX = npcGBackupCol;
  state.tileY = npcGBackupRow;
  state.objectMoved = false;
  // 1:1 décomp `sprite->sLocalId/sMapNum/sMapGroup = gFieldEffectArguments[4..5]`.
  state.localId = localId;
  state.mapNum = mapNum;
  state.mapGroup = mapGroup;
  state.active = true;
}

/** 1:1 décomp `GroundEffect_SpawnOnTallGrass` (event_object_movement.c:7807) +
 *  `GetAllGroundEffectFlags_OnSpawn` : au RETOUR au field (sortie de combat ou de
 *  menu), si le joueur (re)spawn sur une tuile d'herbe haute, ré-affiche l'overlay
 *  STATIQUE (anim figée, pas de rustle). Sans ça, après un combat le joueur est
 *  « dessus » l'herbe sans overlay jusqu'à ce qu'il bouge (bug signalé). À call à
 *  la fin de la restauration OW (_restoreOverworldFromMenu). px/py = LOGICAL. */
export function TrySpawnTallGrassOnReturnToField(rt: DecompRuntime, px: number, py: number): void {
  if (!_initialized) return;
  const behavior = MapGridGetMetatileBehaviorAt(px + MAP_OFFSET, py + MAP_OFFSET);
  if (MetatileBehavior_IsTallGrass(behavior)) {
    SpawnTallGrassEffect(rt, px, py, true);
  }
}

// ─── Update (= per-frame anim + position tracking) ─────────────────────────

/** 1:1 décomp `UpdateTallGrassFieldEffect` (field_effect_helpers.c:316) — le
 *  sprite.callback de l'effet, ré-implémenté ici car notre engine n'applique pas
 *  `coordOffsetEnabled` dans BuildOamBuffer (→ tracking caméra manuel comme arrow/
 *  emote). À call chaque frame APRÈS PlayerStep depuis MainCB2_Overworld.
 *
 *  Comportement 1:1 : l'anim 5 frames (sAnim_TallGrass @10 = 50f) joue UNE FOIS
 *  puis HOLD la dernière frame (= ANIMCMD_END). L'effet RESTE tant que le joueur
 *  est sur la tuile (= herbe sous le joueur immobile) ; il despawn quand le joueur
 *  a quitté la tuile (`sObjectMoved`) ET l'anim est finie, OU si la tuile n'est
 *  plus de l'herbe haute. (Avant : despawn fixe à 50f → l'herbe disparaissait sous
 *  le joueur qui restait dedans = le bug signalé.) */
export function UpdateTallGrassEffects(rt: DecompRuntime): void {
  if (!_initialized) return;
  const lastFrame = ANIM_SEQUENCE[ANIM_SEQUENCE.length - 1].frameIdx;

  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (!sprite) { s.active = false; continue; }

    // ── Anim : 5 frames puis HOLD la dernière (= 1:1 sAnim_TallGrass + END). ──
    let acc = 0;
    let frameIdx = lastFrame;   // défaut = anim finie → hold dernière frame.
    let animEnded = true;
    for (const step of ANIM_SEQUENCE) {
      acc += step.duration;
      if (s.ticks < acc) { frameIdx = step.frameIdx; animEnded = false; break; }
    }
    const oam = rt.gba.oam[s.oamIndex];
    oam.tileId = _tallGrassTileStart + frameIdx * TILES_PER_FRAME;
    // sprite.x/y (coords MONDE) posés à la création ; `coordOffsetEnabled` +
    // `syncSpritesToOam` ajoutent `gSpriteCoordOffset` → suit la caméra.
    s.ticks++;

    // ── Despawn conditionnel 1:1 décomp `UpdateTallGrassFieldEffect` (335-356). ──
    // Track l'OWNER (player OU NPC) via son localId/map, PAS le player en dur → un NPC
    // qui marche dans l'herbe laisse un rustle persistant (despawn quand IL quitte la
    // tuile + anim finie), 1:1 décomp. localId 0xFF = player.
    const tileBehavior = MapGridGetMetatileBehaviorAt(s.tileX, s.tileY);
    const { notFound, objectEventId } = TryGetObjectEventIdByLocalIdAndMap(s.localId, s.mapNum, s.mapGroup);
    if (notFound
        || !MetatileBehavior_IsTallGrass(tileBehavior)
        || (s.objectMoved && animEnded)) {
      // 1:1 FieldEffectStop → DestroySprite. Hard-delete du Map + reset OAM.
      sprite.inUse = false;
      oam.visible = false;
      rt.gSprites.delete(s.spriteId);
      oam.tileId = 0;
      oam.flipH = false;
      oam.flipV = false;
      s.active = false;
      s.spriteId = -1;
      s.oamIndex = -1;
    } else {
      // 1:1 : l'objet a-t-il quitté la tuile ? (current ET previous != tile).
      const objEvent: ObjectEvent = gObjectEvents[objectEventId];
      if ((objEvent.currentCoordsX !== s.tileX || objEvent.currentCoordsY !== s.tileY)
       && (objEvent.previousCoordsX !== s.tileX || objEvent.previousCoordsY !== s.tileY))
        s.objectMoved = true;
    }
  }
}

/** Cleanup au map switch. */
export function DestroyAllTallGrassEffects(rt: DecompRuntime): void {
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (sprite) {
      sprite.inUse = false;
      rt.gba.oam[s.oamIndex].visible = false;
    }
    s.active = false;
    s.spriteId = -1;
  }
}
