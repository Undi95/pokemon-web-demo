/**
 * player-avatar.ts — moteur du player avatar overworld 1:1 décomp.
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/field_player_avatar.c` (= state
 *     machine PlayerStep + MovePlayerNotOnBike + PlayerWalkNormal etc.)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/global.fieldmap.h` (= struct
 *     PlayerAvatar fields + enums NOT_MOVING/TURN_DIRECTION/MOVING)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/event_object_movement.c` (= step
 *     timings, sprite anim cycles)
 *
 * Phase 4.3 MVP — simplifications :
 *   - Pas de bike (= MovePlayerOnBike skip)
 *   - Pas de surf / underwater
 *   - Pas de forced movement (= escalators, ice, etc.)
 *   - Pas de ledge jumping
 *   - Pas de running (= no B button speed boost) — Phase 4.3+ ajoutera
 *   - Pas d'object event collision (= NPCs, Phase 4.4)
 *
 * Implémenté :
 *   - Walk normal (= 16 frames per metatile à speed 1 = 1:1 ROM walk speed)
 *   - 4 directions (down/up/left/right) + face/turn/walk states
 *   - Collision via MapGridGetCollisionAt (= map block collision bits)
 *   - Camera follow (= gFieldCamera.movementSpeedX/Y set during walk)
 *   - Sprite anim cycle (= 3 frames par direction, alternate walk1/walk2)
 *
 * Sprite layout :
 *   - walking.png 144×32 = 18×4 tiles (= 9 frames × 8 tiles each en 16×32 OBJ)
 *   - 9 frames PNG :
 *     0=face_down, 1=walk_down1, 2=walk_down2,
 *     3=face_up, 4=walk_up1, 5=walk_up2,
 *     6=face_right, 7=walk_right1, 8=walk_right2 (= mirror H pour left)
 *   - Loaded en OBJ 1D map mode (= 8 tiles sequential per frame)
 */
import type { DecompRuntime } from './decomp-runtime';
import { loadIndexedPngStrict, extractPngPlte } from './gba/png-loader';
import {
  MapGridGetCollisionAt,
  MapGridGetMetatileBehaviorAt,
  MAP_OFFSET,
} from './map-loader';
import {
  gFieldCamera,
  SetCameraTopLeftCoords,
  GetCameraTopLeftCoords,
} from './field-camera';

// ─── Constants 1:1 décomp ────────────────────────────────────────────────────

/** Direction enum 1:1 décomp `enum Direction` (include/global.fieldmap.h:308). */
export const DIR_NONE  = 0;
export const DIR_SOUTH = 1;  // = down
export const DIR_NORTH = 2;  // = up
export const DIR_WEST  = 3;  // = left
export const DIR_EAST  = 4;  // = right

/** 1:1 décomp `enum running states` (global.fieldmap.h:328-331). */
export const NOT_MOVING     = 0;
export const TURN_DIRECTION = 1;
export const MOVING         = 2;

/** 1:1 décomp `enum tile transition states` (global.fieldmap.h:336-340). */
export const T_NOT_MOVING      = 0;
export const T_TILE_TRANSITION = 1;
export const T_TILE_CENTER     = 2;

/** 1:1 décomp `MOVE_SPEED_NORMAL` = 16 frames per tile = walk speed.
 *  Notre engine : speed 1 px/frame = 16 frames per metatile (= 16 px). */
const WALK_SPEED_PX_PER_FRAME = 1;

/** Sprite anim frames pour la marche (PNG indices) :
 *  Pour chaque direction : [face, walk_step_a, walk_step_b].
 *  La séquence walk anim = [walk_a, face, walk_b, face] (= 4 frames cycle). */
const SPRITE_FRAMES = {
  [DIR_SOUTH]: { face: 0, walk1: 1, walk2: 2, hFlip: false },
  [DIR_NORTH]: { face: 3, walk1: 4, walk2: 5, hFlip: false },
  [DIR_EAST]:  { face: 6, walk1: 7, walk2: 8, hFlip: false },
  [DIR_WEST]:  { face: 6, walk1: 7, walk2: 8, hFlip: true },  // mirror right
} as const;

// ─── Player Avatar struct (= simplified gPlayerAvatar) ──────────────────────

interface PlayerAvatar {
  /** Player position en map coords (= 0-indexed dans original map). */
  x: number;
  y: number;
  /** Direction face actuelle (1=south/down, 2=north/up, 3=west/left, 4=east/right). */
  facing: number;
  /** 1:1 décomp gPlayerAvatar.runningState (NOT_MOVING / TURN_DIRECTION / MOVING). */
  runningState: number;
  /** 1:1 décomp gPlayerAvatar.tileTransitionState. */
  tileTransitionState: number;
  /** Frames remaining in current step (= 0..15 décrémente). 0 = pas de step actif. */
  stepFramesLeft: number;
  /** Direction de la step en cours (utilisé pour cleanup). */
  stepDirection: number;
  /** Sprite ID dans rt.gSprites. */
  spriteId: number;
  /** Walk anim : alternate walk1/walk2 sur step suivant. */
  walkAnimAlt: 0 | 1;
  /** Player gender ('MALE' = Brendan, 'FEMALE' = May). */
  gender: 'MALE' | 'FEMALE';
}

/** 1:1 décomp `EWRAM_DATA struct PlayerAvatar gPlayerAvatar` (global.fieldmap.h:374). */
export const gPlayerAvatar: PlayerAvatar = {
  x: 0,
  y: 0,
  facing: DIR_SOUTH,
  runningState: NOT_MOVING,
  tileTransitionState: T_NOT_MOVING,
  stepFramesLeft: 0,
  stepDirection: DIR_NONE,
  spriteId: -1,
  walkAnimAlt: 0,
  gender: 'MALE',
};

// ─── OBJ VRAM allocation (= player sprite occupe les 1ères tiles) ──────────

/** Player sprite occupe OBJ tiles 0..71 (= 9 frames × 8 tiles each).
 *  Phase 4.4 (NPCs) allouera depuis tile 72. */
const PLAYER_OBJ_TILE_START = 0;
const TILES_PER_FRAME = 8;  // 16x32 sprite = 2x4 tiles 4bpp
const PLAYER_PALETTE_BANK = 0;

// ─── Async loader : sprite + palette ────────────────────────────────────────

/** Reorganise PNG charData (= row-major par tile sur 18×4 grid) en OBJ 1D
 *  layout (= 8 tiles sequential par sprite frame).
 *
 *  PNG layout : tiles 0..71 row-major (= row 0: tiles 0..17, row 1: tiles 18..35, etc.)
 *  Frame F (0..8) occupe PNG tile cols 2F, 2F+1 sur 4 rows = 8 tiles :
 *    PNG tile indices: 2F, 2F+1, 18+2F, 19+2F, 36+2F, 37+2F, 54+2F, 55+2F
 *  OBJ 1D layout : frame F starts at OBJ tile (F*8). Sequential 8 tiles. */
function pngTo1dObjLayout(pngCharData: Uint8Array, numFrames: number, pngWidthTiles: number): Uint8Array {
  const TILE_BYTES = 32;  // 4bpp 8x8
  const out = new Uint8Array(numFrames * TILES_PER_FRAME * TILE_BYTES);
  const FRAME_W_TILES = 2;
  const FRAME_H_TILES = 4;
  for (let f = 0; f < numFrames; f++) {
    for (let row = 0; row < FRAME_H_TILES; row++) {
      for (let col = 0; col < FRAME_W_TILES; col++) {
        // PNG tile index (row-major sur 18 cols)
        const pngTileIdx = row * pngWidthTiles + (f * FRAME_W_TILES) + col;
        // OBJ 1D tile index dans frame
        const objTileIdx = f * TILES_PER_FRAME + row * FRAME_W_TILES + col;
        out.set(
          pngCharData.subarray(pngTileIdx * TILE_BYTES, (pngTileIdx + 1) * TILE_BYTES),
          objTileIdx * TILE_BYTES
        );
      }
    }
  }
  return out;
}

/** 1:1 décomp `InitPlayerAvatar(x, y, direction, gender)` (field_player_avatar.c:1364).
 *  Charge le sprite walking.png → OBJ VRAM, charge la palette → OBJ palette bank,
 *  crée le sprite OAM au centre de l'écran, init gPlayerAvatar struct.
 *
 *  @param mapX     Player position en map coord X (= 0-indexed)
 *  @param mapY     Player position en map coord Y
 *  @param direction Initial facing direction (DIR_*)
 *  @param gender   'MALE' = Brendan, 'FEMALE' = May
 *  @param rt       DecompRuntime (= for OAM allocation + palette)
 */
export async function InitPlayerAvatar(
  mapX: number, mapY: number, direction: number,
  gender: 'MALE' | 'FEMALE',
  rt: DecompRuntime,
): Promise<void> {
  gPlayerAvatar.x = mapX;
  gPlayerAvatar.y = mapY;
  gPlayerAvatar.facing = direction;
  gPlayerAvatar.runningState = NOT_MOVING;
  gPlayerAvatar.tileTransitionState = T_NOT_MOVING;
  gPlayerAvatar.stepFramesLeft = 0;
  gPlayerAvatar.stepDirection = DIR_NONE;
  gPlayerAvatar.gender = gender;
  gPlayerAvatar.walkAnimAlt = 0;

  // Load walking.png (= 144×32, 4bpp indexed PLTE).
  const name = gender === 'FEMALE' ? 'may' : 'brendan';
  const url = `/decomp/em/object_events/people/${name}/walking.png`;
  const png = await loadIndexedPngStrict(url, 4);
  // PNG = 144 / 8 = 18 tiles wide × 32 / 8 = 4 tiles tall = 72 tiles total = 9 frames.
  const numFrames = 9;
  const reordered = pngTo1dObjLayout(png.charData, numFrames, png.widthTiles);

  // Write to OBJ VRAM at PLAYER_OBJ_TILE_START.
  // Notre engine : objVram = Uint8Array, offset = tile * 32 bytes.
  const objVram = rt.gba.objVram;
  objVram.set(reordered, PLAYER_OBJ_TILE_START * 32);

  // Load palette → OBJ palette bank PLAYER_PALETTE_BANK (= bank 0 of OBJ).
  // gPlttBufferFaded entries 256..271 = OBJ bank 0.
  const palette = png.palette;
  const objPaletteSlot = 256 + PLAYER_PALETTE_BANK * 16;
  for (let i = 0; i < Math.min(16, palette.length); i++) {
    rt.gPlttBufferFaded.set(objPaletteSlot + i, palette[i]);
    rt.gPlttBufferUnfaded.set(objPaletteSlot + i, palette[i]);
  }
  rt.gPlttBufferFaded.flushTo();

  // Create OAM sprite at SCREEN CENTER. Le player visuel reste fixe au centre
  // de l'écran ; le BG scroll donne l'illusion de movement.
  //
  // Position : player visible à view (col 7, row 5) avec FEET aligned sur la
  // BG metatile boundary. FieldUpdateBgTilemapScroll applique vofs +8 (= 1:1
  // décomp field_camera.c:78) qui shift le BG content UP de 8px. Pour que le
  // sprite soit visuellement on-grid :
  //   BG row 5 visible aux screen y 72..88 (= 5*16-8 .. 6*16-8)
  //   Player feet = bottom of sprite à screen y 88 (= bottom of row 5)
  //   Sprite 16×32 → top at y = 88-32 = 56
  //
  // Sans le -8 alignment, le sprite à y=64 aurait feet à y=96 = MID de row 6
  // → "player entre 2 cases". Le -8 le snap sur la grid avec le vofs décomp.
  const SCREEN_CENTER_X = 7 * 16;       // = 112
  const SCREEN_CENTER_Y = 4 * 16 - 8;   // = 56 (= align with vofs+8 grid)
  const initialFrame = SPRITE_FRAMES[direction as keyof typeof SPRITE_FRAMES];

  const result = rt.CreateSpriteAtOam({
    tileId: PLAYER_OBJ_TILE_START + initialFrame.face * TILES_PER_FRAME,
    paletteBank: PLAYER_PALETTE_BANK,
    x: SCREEN_CENTER_X,
    y: SCREEN_CENTER_Y,
    shape: 2,    // tall
    size: 2,     // 16×32
    priority: 2, // entre BG2 (priority 2) et BG3 (priority 3)
    paletteMode: 0,  // 4bpp
    affineMode: 0,
  });
  gPlayerAvatar.spriteId = result.spriteId;

  // Apply initial flip selon direction (= west = mirror right).
  if (gPlayerAvatar.spriteId >= 0) {
    rt.gba.oam[result.oamIndex].flipH = initialFrame.hFlip;
  }

  // Set camera focus = player position. Pour player au view (7, 5) :
  //   gBackupMapLayout topmost drawn = mapY - 5 (view rows above feet) + MAP_OFFSET (7)
  //                                 = mapY + 2
  //   gBackupMapLayout leftmost drawn = mapX - 7 (view cols left of player) + MAP_OFFSET
  //                                  = mapX (= 0 nett offset car player at view col 7
  //                                    avec MAP_OFFSET=7)
  // Sans ce +2 vertical, player visible at view row 7 → camera Y de 2 rows trop haut.
  SetCameraTopLeftCoords(mapX, mapY + 2);
}

// ─── Direction → (dx, dy) en map coords ─────────────────────────────────────

const DIR_TO_DX: Record<number, number> = {
  [DIR_SOUTH]: 0, [DIR_NORTH]: 0, [DIR_WEST]: -1, [DIR_EAST]: 1,
};
const DIR_TO_DY: Record<number, number> = {
  [DIR_SOUTH]: 1, [DIR_NORTH]: -1, [DIR_WEST]: 0, [DIR_EAST]: 0,
};

/** Convertit la direction map en mouvement camera en pixels par frame.
 *  Camera move SAME direction qu le player visuel (= player static, BG scroll). */
function dirToCameraSpeed(direction: number): { x: number; y: number } {
  return {
    x: DIR_TO_DX[direction] ?? 0,
    y: DIR_TO_DY[direction] ?? 0,
  };
}

// ─── Sprite frame update ─────────────────────────────────────────────────────

/** Set la sprite frame courante (face/walk1/walk2) selon direction + state. */
function updateSpriteFrame(rt: DecompRuntime): void {
  if (gPlayerAvatar.spriteId < 0) return;
  const sprite = rt.gSprites.get(gPlayerAvatar.spriteId);
  if (!sprite) return;
  const oam = rt.gba.oam[sprite.oamIndex];
  const cfg = SPRITE_FRAMES[gPlayerAvatar.facing as keyof typeof SPRITE_FRAMES];
  if (!cfg) return;

  let frameIdx: number;
  if (gPlayerAvatar.runningState === MOVING && gPlayerAvatar.stepFramesLeft > 0) {
    // Walk anim 1:1 décomp `sAnim_StdGoSouth` (data/object_events/object_event_anims.h) :
    //   FRAME 0 (face) duration 8
    //   FRAME 1 (walk_a) duration 8
    //   FRAME 0 (face) duration 8
    //   FRAME 2 (walk_b) duration 8
    // = 32 game-frames total = 2 metatile steps. Chaque step = 16 frames =
    // face (8) + walk (8). walkAnimAlt alterne entre walk_a et walk_b.
    //
    // stepFramesLeft DECREMENTS de 16→1 sur les 16 frames de la step.
    // Frames 0-7 (= stepFramesLeft 15..8) : face
    // Frames 8-15 (= stepFramesLeft 7..0) : walk_a OR walk_b alternating
    // Note `>= 8` pas `> 8` (= 8 frames face exact, 8 frames walk exact).
    if (gPlayerAvatar.stepFramesLeft >= 8) {
      frameIdx = cfg.face;
    } else {
      frameIdx = gPlayerAvatar.walkAnimAlt === 0 ? cfg.walk1 : cfg.walk2;
    }
  } else {
    frameIdx = cfg.face;
  }

  oam.tileId = PLAYER_OBJ_TILE_START + frameIdx * TILES_PER_FRAME;
  oam.flipH = cfg.hFlip;
}

// ─── Collision check ────────────────────────────────────────────────────────

/** 1:1 décomp `MoveCoords(direction, x, y)` (event_object_movement.c).
 *  Modifie x, y selon la direction. */
function moveCoords(direction: number, x: number, y: number): { x: number; y: number } {
  return { x: x + (DIR_TO_DX[direction] ?? 0), y: y + (DIR_TO_DY[direction] ?? 0) };
}

/** Simplification Phase 4.3 : on check juste MapGridGetCollisionAt.
 *  Phase 4.4 ajoutera object event collision (= NPCs).
 *  Returns COLLISION_NONE (0) ou COLLISION_IMPASSABLE (2). */
function checkPlayerCollision(direction: number): number {
  const { x: dx, y: dy } = moveCoords(direction, gPlayerAvatar.x, gPlayerAvatar.y);
  // 1:1 décomp : MapGridGetCollisionAt prend gBackupMapLayout coords.
  // Player est en map coords (= 0-indexed) → ajoute MAP_OFFSET.
  const collision = MapGridGetCollisionAt(dx + MAP_OFFSET, dy + MAP_OFFSET);
  return collision > 0 ? 2 : 0;  // COLLISION_IMPASSABLE if any collision bit set
}

// ─── PlayerStep state machine ────────────────────────────────────────────────

/** Convertit GBA keys → direction (priority order : down/up/left/right comme décomp).
 *  GBA keys : A=0x001, B=0x002, SELECT=0x004, START=0x008, RIGHT=0x010, LEFT=0x020,
 *  UP=0x040, DOWN=0x080. */
function getInputDirection(heldKeys: number): number {
  if (heldKeys & 0x80) return DIR_SOUTH;  // DOWN
  if (heldKeys & 0x40) return DIR_NORTH;  // UP
  if (heldKeys & 0x20) return DIR_WEST;   // LEFT
  if (heldKeys & 0x10) return DIR_EAST;   // RIGHT
  return DIR_NONE;
}

/** 1:1 décomp `PlayerStep(direction, newKeys, heldKeys)` (field_player_avatar.c:332).
 *  À call une fois par frame depuis le main loop overworld. Drive toute la
 *  logique : input → state machine → camera + sprite update.
 *
 *  @param heldKeys  Touches actuellement maintenues
 *  @param newKeys   Touches qui viennent d'être pressées (= front montant)
 *  @param rt        DecompRuntime
 */
export function PlayerStep(heldKeys: number, _newKeys: number, rt: DecompRuntime): void {
  if (gPlayerAvatar.spriteId < 0) return;

  const inputDir = getInputDirection(heldKeys);

  // Si une step est en cours : tick frames, advance, et finir au tile boundary.
  if (gPlayerAvatar.runningState === MOVING && gPlayerAvatar.stepFramesLeft > 0) {
    gPlayerAvatar.stepFramesLeft--;
    if (gPlayerAvatar.stepFramesLeft === 0) {
      // Step complete : update player position en map coords, stop camera.
      const { x: nx, y: ny } = moveCoords(gPlayerAvatar.stepDirection, gPlayerAvatar.x, gPlayerAvatar.y);
      gPlayerAvatar.x = nx;
      gPlayerAvatar.y = ny;
      gPlayerAvatar.runningState = NOT_MOVING;
      gPlayerAvatar.tileTransitionState = T_NOT_MOVING;
      gPlayerAvatar.stepDirection = DIR_NONE;
      gFieldCamera.movementSpeedX = 0;
      gFieldCamera.movementSpeedY = 0;
      // Switch walk anim alt for next step (= alternate walk1/walk2).
      gPlayerAvatar.walkAnimAlt = (gPlayerAvatar.walkAnimAlt ^ 1) as 0 | 1;
    }
    updateSpriteFrame(rt);
    return;
  }

  // 1:1 décomp `CheckMovementInputNotOnBike` (line 588) :
  //   - direction == DIR_NONE → NOT_MOVING (= face current direction)
  //   - direction != currentFacing && runningState != MOVING → TURN_DIRECTION
  //   - else → MOVING

  if (inputDir === DIR_NONE) {
    gPlayerAvatar.runningState = NOT_MOVING;
    updateSpriteFrame(rt);
    return;
  }

  if (inputDir !== gPlayerAvatar.facing) {
    // 1:1 décomp `PlayerNotOnBikeTurningInPlace` → PlayerTurnInPlace.
    // Le player change face direction sans bouger. Décomp prend ~8 frames pour
    // turn anim, mais simplification Phase 4.3 : turn instantané (= 1 frame).
    gPlayerAvatar.facing = inputDir;
    gPlayerAvatar.runningState = TURN_DIRECTION;
    updateSpriteFrame(rt);
    return;
  }

  // Direction matches current facing → check collision + walk.
  const collision = checkPlayerCollision(inputDir);
  if (collision !== 0) {
    // 1:1 décomp `PlayerNotOnBikeCollide` : show collision bump (= just stay
    // facing this direction). Pas de step, pas de camera move.
    gPlayerAvatar.runningState = NOT_MOVING;
    updateSpriteFrame(rt);
    return;
  }

  // 1:1 décomp `PlayerWalkNormal` : start a 16-frame step in direction.
  gPlayerAvatar.runningState = MOVING;
  gPlayerAvatar.tileTransitionState = T_TILE_TRANSITION;
  gPlayerAvatar.stepFramesLeft = 16;  // = 1:1 ROM walk speed
  gPlayerAvatar.stepDirection = inputDir;
  // Camera move la SAME direction = player visual stays at center.
  // Speed 1 px/frame × 16 frames = 16 px = 1 metatile. ✓
  const speed = dirToCameraSpeed(inputDir);
  gFieldCamera.movementSpeedX = speed.x * WALK_SPEED_PX_PER_FRAME;
  gFieldCamera.movementSpeedY = speed.y * WALK_SPEED_PX_PER_FRAME;
  updateSpriteFrame(rt);
}

/** Reset le player avatar (= cleanup OAM + state). À call lors d'un map switch.
 *  Phase 4.6 (warps) wirera ça. */
export function DestroyPlayerAvatar(rt: DecompRuntime): void {
  if (gPlayerAvatar.spriteId < 0) return;
  const sprite = rt.gSprites.get(gPlayerAvatar.spriteId);
  if (sprite) {
    rt.gba.oam[sprite.oamIndex].visible = false;
    sprite.inUse = false;
  }
  gPlayerAvatar.spriteId = -1;
  gPlayerAvatar.runningState = NOT_MOVING;
  gPlayerAvatar.stepFramesLeft = 0;
}
