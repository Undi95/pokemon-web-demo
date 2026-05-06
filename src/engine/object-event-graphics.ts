/**
 * object-event-graphics.ts
 * ────────────────────────
 * 1:1 décomp `src/event_object_movement.c` + `data/object_events/object_event_graphics_info.h`.
 *
 * Foundation pour TOUT sprite NPC/player/rival/overworld du jeu :
 *   - Naming screen player icon (Brendan/May trainer south-stand walk-in-place)
 *   - Birch dans le speech intro
 *   - Phase 4 : tous les NPCs overworld + player avatar + objets statiques animés
 *   - Battle scenes : trainer back-pic / trainer-class fronts
 *
 * Architecture décomp :
 *   `OBJ_EVENT_GFX_X` (constant)
 *      → gObjectEventGraphicsInfoPointers[X]
 *      → const ObjectEventGraphicsInfo *
 *           ├── tileTag/paletteTag (= sprite sheet/palette identifiers)
 *           ├── shape/size (= OAM dimensions)
 *           ├── paletteSlot
 *           ├── anims = sAnimTable_Standard (= 4 directions × 4-step walk-cycle anims)
 *           ├── images = sPicTable_X (= mapping frame index → tile data offset)
 *           └── etc.
 *
 *   CreateObjectGraphicsSprite(gfxId, callback, x, y, subPriority) factory
 *      → resolve graphics info
 *      → load tiles + palette si pas déjà loaded
 *      → CreateSpriteAtOam + register anim state
 *      → return spriteId
 *
 *   StartSpriteAnim(spriteId, animIdx) (= existing runtime impl)
 *      → fetch anim table from spriteAnimStates → cycle through anim cmd table
 *
 * Décomp refs :
 *   - include/event_object_movement.h : OBJ_EVENT_GFX_* constants
 *   - data/object_events/object_event_graphics_info.h : gObjectEventGraphicsInfo_*
 *   - data/object_events/object_event_pic_tables.h : sPicTable_*
 *   - data/object_events/object_event_anims.h : gAnims_Standard*
 *   - src/data/object_events/sRivalAvatarGfxIds.h : sRivalAvatarGfxIds (field_player_avatar)
 *   - src/event_object_movement.c:CreateObjectGraphicsSprite (factory)
 */

import type { DecompRuntime, DecompSprite } from './decomp-runtime';
import { getRuntime } from './decomp-globals';
import { loadGbaPal, loadTileBin } from './gba/png-loader';

// ─── OBJ_EVENT_GFX_* constants (= subset; 1:1 décomp include/event_object_movement.h) ─

/** Player avatar variants (= used by sRivalAvatarGfxIds + naming screen). */
export const OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL = 0xF8;
export const OBJ_EVENT_GFX_RIVAL_MAY_NORMAL     = 0xF9;
// Note : OBJ_EVENT_GFX_PROFESSOR_BIRCH (= overworld walking sprite, 16x32)
// existe dans le décomp mais n'est PAS utilisé par le Birch speech, qui crée
// un sprite custom 64x64 via sSpriteTemplate_NewGameBirch (= AddNewGameBirchObject
// dans main-menu-impl.ts). Cette entry sera ajoutée au registry quand l'overworld
// Phase 4 démarre + a besoin du Birch NPC sur la map.

// ─── ANIM_STD_* constants (= indices into sAnimTable_Standard) ──────────────
// 1:1 décomp data/object_events/object_event_anims.h.
export const ANIM_STD_GO_SOUTH = 0;
export const ANIM_STD_GO_NORTH = 1;
export const ANIM_STD_GO_WEST  = 2;
export const ANIM_STD_GO_EAST  = 3;
// Higher anim indices (FACE_*, BERRY_TREE_*, FIELD_MOVE_*, etc.) — TODO Phase 4.

// ─── PLAYER_AVATAR_STATE_* (= sRivalAvatarGfxIds first index) ──────────────
export const PLAYER_AVATAR_STATE_NORMAL = 0;
export const PLAYER_AVATAR_STATE_MACH_BIKE = 1;
export const PLAYER_AVATAR_STATE_ACRO_BIKE = 2;
export const PLAYER_AVATAR_STATE_SURFING = 3;
export const PLAYER_AVATAR_STATE_UNDERWATER = 4;
export const PLAYER_AVATAR_STATE_FIELD_MOVE = 5;
export const PLAYER_AVATAR_STATE_FISHING = 6;
export const PLAYER_AVATAR_STATE_WATERING = 7;

// ─── Types ──────────────────────────────────────────────────────────────────

/** OAM size encoding shape × size → pixel dims. 1:1 décomp include/gba/types.h. */
export const enum SpriteShape { Square = 0, HRect = 1, VRect = 2 }

/** Per-frame tile range (= 1:1 décomp `struct SpriteFrameImage`). */
export interface SpriteFrameImage {
  /** Tile data offset within the sheet (= byte offset into the loaded .4bpp). */
  byteOffset: number;
  /** Bytes per frame (= numTiles × 32). */
  byteSize: number;
}

/** Anim cmd entry. 1:1 décomp `union AnimCmd { struct frame; struct cmd; }`.
 *  Notre format unifié : duration=0 marque END/JUMP via terminator. */
export interface AnimCmd {
  /** Tile offset from sprite.tileBase (= which 8 tiles to render). */
  tileNum: number;
  /** Frames before advancing to next cmd. */
  duration: number;
  /** Optional flags (= hflip/vflip per frame). */
  hFlip?: boolean;
  vFlip?: boolean;
}

export interface AnimDef {
  frames: ReadonlyArray<AnimCmd>;
  /** END = stop on last frame ; JUMP = loop back to `jumpTo`. */
  terminator: 'END' | 'JUMP';
  jumpTo?: number;
}

/** Anim table (= array of anim defs). 1:1 décomp `const union AnimCmd *const sAnims_*[]`. */
export interface AnimTable {
  anims: ReadonlyArray<string>;  // Names of AnimDef entries in registry
}

/** Object event graphics info (= 1:1 décomp `struct ObjectEventGraphicsInfo`).
 *  Subset des champs pertinents pour notre port; les champs unused (movement
 *  type, callback, etc.) seront ajoutés Phase 4 (overworld). */
export interface ObjectEventGraphicsInfo {
  /** OAM tile tag (= unique key for sprite sheet allocator). */
  tileTag: string;
  /** OBJ palette tag (= unique key for palette allocator). */
  paletteTag: string;
  /** Bytes total per frame (= numTiles × 32, e.g. 8 tiles × 32 = 256 for 16x32 trainer). */
  bytesPerFrame: number;
  /** Total frames in the sheet (= 9 for trainer walking, 1 for static). */
  totalFrames: number;
  /** OAM shape (= SQUARE/H_RECT/V_RECT). */
  shape: SpriteShape;
  /** OAM size 0-3. */
  size: number;
  /** Palette slot (= inanimate=FALSE means dynamic alloc, TRUE means pre-set). */
  paletteSlot: number;
  /** Anim table name (= key into anim registry). */
  animsTableName: string;
  /** Per-frame tile mapping (= sPicTable). undefined = use default sequential layout
   *  (frame N at tileBase + N*tilesPerFrame). */
  picTable?: ReadonlyArray<SpriteFrameImage>;
  /** Source paths (PNG + palette) for asset loading. */
  gfxUrl: string;
  palUrl: string;
}

// ─── Anim registry (= runtime mutable, distinct from auto-generated SPRITE_ANIMS) ─
// Permet d'ajouter dynamiquement des anim defs sans toucher le auto-generated
// `decomp-data/auto/src/sprite-system.ts`. tickSpriteAnims (decomp-runtime)
// consultera ce registry en fallback.

const _objectEventAnims = new Map<string, AnimDef>();
const _objectEventAnimTables = new Map<string, AnimTable>();

export function getObjectEventAnim(name: string): AnimDef | undefined {
  return _objectEventAnims.get(name);
}

export function getObjectEventAnimTable(name: string): AnimTable | undefined {
  return _objectEventAnimTables.get(name);
}

function registerAnim(name: string, def: AnimDef): void {
  _objectEventAnims.set(name, def);
}

function registerAnimTable(name: string, table: AnimTable): void {
  _objectEventAnimTables.set(name, table);
}

// ─── Standard 4-direction walk-in-place anims ───────────────────────────────
// 1:1 décomp data/object_events/object_event_anims.h sAnim_Standard{South,North,West,East}.
//
// Each direction = 4-step cycle :
//   stand(8) → walk1(8) → stand(8) → walk2(8) → JUMP back to step 0
//
// Frame index mapping (= sPicTable_X), per standard NPC walking sheet :
//   0=south_stand, 1=south_walk1, 2=south_walk2,
//   3=north_stand, 4=north_walk1, 5=north_walk2,
//   6=west_stand,  7=west_walk1,  8=west_walk2
// East = west sprites with hFlip=true (= GBA OAM hardware flip).
//
// `tileNum` here = tiles per frame × frame index (= 8 × N for 16x32 sprites).
// The factory loads frame data contiguously frame-major into OBJ VRAM, so
// tileNum directly maps to the correct frame.

const TILES_PER_TRAINER_FRAME = 8;  // 16x32 = 2×4 tiles

// 1:1 décomp `data/object_events/object_event_anims.h:202-236` sAnim_GoSouth/etc.
// Cycle order : walk1 → stand → walk2 → stand → JUMP back. Le pied part EN PREMIER
// puis revient (= pas stand→walk→stand→walk).
//
// Frame layout pokeemerald walking sheets 144x32 :
//   0=south stand, 1=north stand, 2=west stand,
//   3=south walk1, 4=south walk2,
//   5=north walk1, 6=north walk2,
//   7=west walk1,  8=west walk2

registerAnim('sAnim_Standard_GoSouth', {
  frames: [
    { tileNum: 3 * TILES_PER_TRAINER_FRAME, duration: 8 },  // frame 3 : south walk1
    { tileNum: 0 * TILES_PER_TRAINER_FRAME, duration: 8 },  // frame 0 : south stand
    { tileNum: 4 * TILES_PER_TRAINER_FRAME, duration: 8 },  // frame 4 : south walk2
    { tileNum: 0 * TILES_PER_TRAINER_FRAME, duration: 8 },  // frame 0 : south stand
  ],
  terminator: 'JUMP',
  jumpTo: 0,
});
registerAnim('sAnim_Standard_GoNorth', {
  frames: [
    { tileNum: 5 * TILES_PER_TRAINER_FRAME, duration: 8 },  // frame 5 : north walk1
    { tileNum: 1 * TILES_PER_TRAINER_FRAME, duration: 8 },  // frame 1 : north stand
    { tileNum: 6 * TILES_PER_TRAINER_FRAME, duration: 8 },  // frame 6 : north walk2
    { tileNum: 1 * TILES_PER_TRAINER_FRAME, duration: 8 },
  ],
  terminator: 'JUMP',
  jumpTo: 0,
});
registerAnim('sAnim_Standard_GoWest', {
  frames: [
    { tileNum: 7 * TILES_PER_TRAINER_FRAME, duration: 8 },  // frame 7 : west walk1
    { tileNum: 2 * TILES_PER_TRAINER_FRAME, duration: 8 },  // frame 2 : west stand
    { tileNum: 8 * TILES_PER_TRAINER_FRAME, duration: 8 },  // frame 8 : west walk2
    { tileNum: 2 * TILES_PER_TRAINER_FRAME, duration: 8 },
  ],
  terminator: 'JUMP',
  jumpTo: 0,
});
registerAnim('sAnim_Standard_GoEast', {
  // 1:1 décomp:229-236 : East = west frames avec hFlip (= GBA OAM hardware mirror).
  frames: [
    { tileNum: 7 * TILES_PER_TRAINER_FRAME, duration: 8, hFlip: true },
    { tileNum: 2 * TILES_PER_TRAINER_FRAME, duration: 8, hFlip: true },
    { tileNum: 8 * TILES_PER_TRAINER_FRAME, duration: 8, hFlip: true },
    { tileNum: 2 * TILES_PER_TRAINER_FRAME, duration: 8, hFlip: true },
  ],
  terminator: 'JUMP',
  jumpTo: 0,
});

registerAnimTable('sAnimTable_Standard', {
  anims: ['sAnim_Standard_GoSouth', 'sAnim_Standard_GoNorth', 'sAnim_Standard_GoWest', 'sAnim_Standard_GoEast'],
});

// ─── sRivalAvatarGfxIds (= 1:1 décomp src/field_player_avatar.c) ────────────
// Lookup [PLAYER_AVATAR_STATE_*][gender (0=MALE, 1=FEMALE)] → OBJ_EVENT_GFX_*.
// Currently NORMAL only (= naming screen needs). Bike/surf/fishing variants =
// TODO Phase 4.

export const sRivalAvatarGfxIds: ReadonlyArray<ReadonlyArray<number>> = [
  /* PLAYER_AVATAR_STATE_NORMAL  */ [OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL, OBJ_EVENT_GFX_RIVAL_MAY_NORMAL],
];

/** 1:1 décomp `GetRivalAvatarGraphicsIdByStateIdAndGender(stateId, gender)`. */
export function GetRivalAvatarGraphicsIdByStateIdAndGender(stateId: number, gender: number): number {
  const row = sRivalAvatarGfxIds[stateId];
  if (!row) return OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL;
  return row[gender] ?? row[0];
}

// ─── gObjectEventGraphicsInfoPointers registry ──────────────────────────────
// Décomp : `gObjectEventGraphicsInfoPointers[gfxId]` returns const pointer.
// Notre impl : Map<gfxId, ObjectEventGraphicsInfo>. Lazy populated par
// `defineObjectEventGraphicsInfo`.

const _gfxInfoRegistry = new Map<number, ObjectEventGraphicsInfo>();

export function defineObjectEventGraphicsInfo(gfxId: number, info: ObjectEventGraphicsInfo): void {
  _gfxInfoRegistry.set(gfxId, info);
}

export function getObjectEventGraphicsInfo(gfxId: number): ObjectEventGraphicsInfo | undefined {
  return _gfxInfoRegistry.get(gfxId);
}

// ─── Initial registrations ──────────────────────────────────────────────────
// 16x32 trainer walking sheets shared layout : 9 frames horizontal in 144x32
// PNG (= 18 tile cols × 4 tile rows). Each frame 16x32 = 2 cols × 4 rows = 8 tiles.

const TRAINER_WALKING_INFO = {
  bytesPerFrame: TILES_PER_TRAINER_FRAME * 32,
  totalFrames: 9,
  shape: SpriteShape.VRect,
  size: 2,
  paletteSlot: 0,
  animsTableName: 'sAnimTable_Standard',
} as const;

defineObjectEventGraphicsInfo(OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL, {
  ...TRAINER_WALKING_INFO,
  tileTag: 'GFXTAG_OBJ_EVENT_RIVAL_BRENDAN_NORMAL',
  paletteTag: 'PALTAG_OBJ_EVENT_RIVAL_BRENDAN_NORMAL',
  gfxUrl: '/decomp/em/object_events/people/brendan/walking.png',
  palUrl: '/decomp/em/object_events/palettes/brendan.pal',
});

defineObjectEventGraphicsInfo(OBJ_EVENT_GFX_RIVAL_MAY_NORMAL, {
  ...TRAINER_WALKING_INFO,
  tileTag: 'GFXTAG_OBJ_EVENT_RIVAL_MAY_NORMAL',
  paletteTag: 'PALTAG_OBJ_EVENT_RIVAL_MAY_NORMAL',
  gfxUrl: '/decomp/em/object_events/people/may/walking.png',
  palUrl: '/decomp/em/object_events/palettes/may.pal',
});

// Birch overworld 16x32 walking variant : TODO Phase 4 (= overworld map ajoute
// l'entry quand Birch apparaît sur la map de Littleroot). Le Birch speech utilise
// un sprite distinct 64x64 (cf. AddNewGameBirchObject in main-menu-impl.ts).

// ─── Asset loading + tile repacking ─────────────────────────────────────────
//
// Décomp : `LoadCompressedSpriteSheet` decompresses + writes to OBJ VRAM at
// nextSpriteSheetByteOffset. Frame layout in the .4bpp blob is FRAME-MAJOR
// (= each frame's tiles contiguous), produced by gbagfx with -mwidth 2 -mheight 4.
//
// Notre extraction `extract-png-indexed-tiles.mjs` produit ROW-MAJOR (= scan
// par tile rows of the source PNG). Pour le 16x32 frame layout, on doit
// repack au load time : pour frame N (col 2N..2N+1, all 4 rows), prendre
// les 8 non-contiguous tiles du row-major .bin et les écrire contigus dans
// OBJ VRAM.

const _loadedGfx = new Set<number>();

/** Load a graphics info's gfx + palette into OBJ VRAM/palette. Idempotent.
 *  Returns the tileBase (= tileId of frame 0) for sprite creation. */
export async function loadObjectEventGraphicsInfo(rt: DecompRuntime, gfxId: number): Promise<number> {
  const info = getObjectEventGraphicsInfo(gfxId);
  if (!info) {
    console.warn(`[object-event-graphics] Unknown gfxId 0x${gfxId.toString(16)}`);
    return 0;
  }
  // Already loaded → return registered tile base.
  if (_loadedGfx.has(gfxId)) {
    const existing = rt.spriteSheetTagToTileStart.get(info.tileTag);
    if (existing !== undefined) return existing;
  }
  // Load palette (= 16 entries × 2 bytes = 32 bytes, into OBJ palette slot N).
  if (!rt.paletteTagToSlot.has(info.paletteTag)) {
    const pal = await loadGbaPal(info.palUrl);
    const slot = rt.nextObjPalSlot++;
    for (let i = 0; i < Math.min(16, pal.length); i++) {
      rt.gPlttBufferUnfaded.set(256 + slot * 16 + i, pal[i]);
      rt.gPlttBufferFaded.set(256 + slot * 16 + i, pal[i]);
    }
    rt.paletteTagToSlot.set(info.paletteTag, slot);
  }
  // Load gfx + frame-major repack.
  if (!rt.spriteSheetTagToTileStart.has(info.tileTag)) {
    const sheet = await loadTileBin(info.gfxUrl, 4);
    const totalBytes = info.bytesPerFrame * info.totalFrames;
    const repacked = new Uint8Array(totalBytes);
    // Row-major source → frame-major dest. PNG width assumed = 144 (= 18 tiles).
    // Frame N (16x32) occupies tile cols [2N, 2N+1] all 4 rows. Source tile
    // index in row-major = r × SHEET_TILE_W + c.
    const SHEET_TILE_W = 18;
    const TILE_BYTES = 32;
    let dst = 0;
    for (let frame = 0; frame < info.totalFrames; frame++) {
      const colStart = frame * 2;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 2; c++) {
          const srcTileIdx = r * SHEET_TILE_W + (colStart + c);
          const srcOff = srcTileIdx * TILE_BYTES;
          if (srcOff + TILE_BYTES <= sheet.length) {
            repacked.set(sheet.subarray(srcOff, srcOff + TILE_BYTES), dst);
          }
          dst += TILE_BYTES;
        }
      }
    }
    const tileStart = rt.nextSpriteSheetByteOffset >> 5;
    const writeSize = Math.min(totalBytes, rt.gba.objVram.length - rt.nextSpriteSheetByteOffset);
    if (writeSize > 0) {
      rt.gba.objVram.set(repacked.subarray(0, writeSize), rt.nextSpriteSheetByteOffset);
    }
    rt.spriteSheetTagToTileStart.set(info.tileTag, tileStart);
    rt.nextSpriteSheetByteOffset += totalBytes;
  }
  _loadedGfx.add(gfxId);
  return rt.spriteSheetTagToTileStart.get(info.tileTag) ?? 0;
}

// ─── CreateObjectGraphicsSprite factory ─────────────────────────────────────
//
// 1:1 décomp `src/event_object_movement.c CreateObjectGraphicsSprite(gfxId, cb, x, y, subPriority)`.
//
// Décomp flow :
//   1. info = gObjectEventGraphicsInfoPointers[gfxId]
//   2. Allocate sprite via CreateSpriteAtEnd avec template construit from info
//   3. sprite->subspriteTables = info->subspriteTables
//   4. sprite->animPaused = false ; sprite->affineAnims = info->affineAnims
//   5. Return spriteId
//
// Notre impl :
//   1. Resolve info
//   2. Load gfx + palette (idempotent)
//   3. CreateSpriteAtOam avec dimensions calculated from info
//   4. Manually populate spriteAnimStates (= bypass static SPRITE_ANIM_TABLES
//      via runtime registry checked by tickSpriteAnims).
//   5. Set sprite.tileBase + callback + return spriteId

const _shapeSizeToWH: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  /* SQUARE */ [[8, 8], [16, 16], [32, 32], [64, 64]],
  /* H_RECT */ [[16, 8], [32, 8], [32, 16], [64, 32]],
  /* V_RECT */ [[8, 16], [8, 32], [16, 32], [32, 64]],
];

/** 1:1 décomp `CreateObjectGraphicsSprite(gfxId, cb, x, y, subPriority)`.
 *  Synchrone : assumes the gfx + palette are already loaded via
 *  `loadObjectEventGraphicsInfo(rt, gfxId)`. Caller responsibility (= scenes
 *  preload during CB2_Load* state machine, e.g. naming_screen.c case 5/6).
 *  Returns spriteId, or -1 on error (= unknown gfxId or assets not loaded). */
export function CreateObjectGraphicsSprite(
  gfxId: number,
  callback: ((sprite: DecompSprite, rt: DecompRuntime) => void) | null,
  x: number,
  y: number,
  subPriority: number,
  initialAnimIdx: number = ANIM_STD_GO_SOUTH,
): number {
  const rt = getRuntime();
  if (!rt) return -1;
  const info = getObjectEventGraphicsInfo(gfxId);
  if (!info) {
    console.warn(`[object-event-graphics] CreateObjectGraphicsSprite: unknown gfxId 0x${gfxId.toString(16)}`);
    return -1;
  }
  const tileBase = rt.spriteSheetTagToTileStart.get(info.tileTag);
  const palSlot = rt.paletteTagToSlot.get(info.paletteTag);
  if (tileBase === undefined || palSlot === undefined) {
    console.warn(`[object-event-graphics] gfxId 0x${gfxId.toString(16)} not loaded — call loadObjectEventGraphicsInfo first`);
    return -1;
  }
  // Bridge anim defs into runtime registry (idempotent set).
  _bridgeAnimsToRuntime(rt);
  // Create the OAM sprite at (x, y). Shape/size/priority widened à `number` dans
  // notre interface pour flexibilité de définition; OamData accepte literals 0-3.
  const { spriteId } = rt.CreateSpriteAtOam({
    tileId: tileBase,
    paletteBank: palSlot,
    x, y,
    shape: info.shape as 0 | 1 | 2,
    size: info.size as 0 | 1 | 2 | 3,
    priority: Math.max(0, Math.min(3, subPriority | 0)) as 0 | 1 | 2 | 3,
  });
  if (spriteId < 0) return -1;
  const sprite = rt.gSprites.get(spriteId);
  if (sprite) {
    sprite.tileBase = tileBase;
    if (callback) sprite.callback = callback;
  }
  // Register in spriteAnimStates → tickSpriteAnims will cycle frames per
  // sAnim_Standard_GoSouth/etc. cmd table (= 4-step cycle 0/1/0/2 dur 8 each).
  rt.spriteAnimStatesRegister(spriteId, info.animsTableName, initialAnimIdx, tileBase);
  return spriteId;
}

/** Bridge `_objectEventAnims` + `_objectEventAnimTables` → DecompRuntime's
 *  `_extraAnims` + `_extraAnimTables`. Idempotent : runtime Map.set par déduplication.
 *  Called lazily on first CreateObjectGraphicsSprite. */
let _bridgeApplied = false;
function _bridgeAnimsToRuntime(rt: DecompRuntime): void {
  if (_bridgeApplied) return;
  for (const [name, def] of _objectEventAnims) {
    rt.registerExtraAnim(name, def);
  }
  for (const [name, table] of _objectEventAnimTables) {
    rt.registerExtraAnimTable(name, table);
  }
  _bridgeApplied = true;
}
