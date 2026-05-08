/**
 * player-anim-sheets.ts — Lazy loader pour TOUTES les anim sheets player.
 *
 * Source de vérité (1:1 décomp) :
 *   - `graphics/object_events/pics/people/{brendan,may}/*.png` (10 sheets)
 *   - `src/data/object_events/object_event_pic_tables.h` (sPicTable_X[])
 *   - `src/data/object_events/object_event_anims.h` (sAnim_X[])
 *
 * Sheets extraits dans `public/decomp/em/object_events/people/{brendan,may}/` :
 *   - walking.png       (= 144×32, 9 frames : face_S, face_N, face_W, walk_S/N/W ×2)
 *   - running.png       (= 144×32, 9 frames même layout)
 *   - mach_bike.png     (= bike vélo course)
 *   - acro_bike.png     (= acro bike)
 *   - surfing.png       (= surf sur Pokémon)
 *   - fishing.png       (= pêche)
 *   - field_move.png    (= HM moves field — coupé, fly, etc.)
 *   - watering.png      (= arrosage — Mach Plant / Sun Stone events)
 *   - decorating.png    (= secret base décoration)
 *   - underwater.png    (= sous-marine)
 *
 * Usage :
 *   const sheet = await loadPlayerAnimSheet('MALE', 'surfing');
 *   // sheet.charData = 4bpp tile-arranged data prêt pour OBJ VRAM
 *   // sheet.palette = 16 colors RGB15
 *   // sheet.numFrames = 9 (= varie selon sheet)
 *
 * Phase 4.10 : assets ready, pas wirés au runtime sauf walking + running
 * (= déjà loadés par player-avatar.ts InitPlayerAvatar). Future features
 * (bike, surf, fishing, etc.) utiliseront ce loader.
 */

import { loadIndexedPngStrict } from './gba/png-loader';

export type PlayerGender = 'MALE' | 'FEMALE';
export type PlayerAnimKind =
  | 'walking' | 'running'
  | 'mach_bike' | 'acro_bike'
  | 'surfing' | 'fishing' | 'underwater'
  | 'field_move' | 'watering' | 'decorating';

const GENDER_DIR: Record<PlayerGender, string> = {
  MALE: 'brendan',
  FEMALE: 'may',
};

export interface PlayerAnimSheet {
  /** 4bpp tile-arranged data (= prêt pour OBJ VRAM upload). */
  charData: Uint8Array;
  /** 16 colors RGB15. */
  palette: Uint16Array;
  /** Width PNG en tiles (= e.g. 18 pour 144×32). */
  widthTiles: number;
  /** Height PNG en tiles (= e.g. 4 pour 144×32). */
  heightTiles: number;
  /** Nombre total de tiles (= width × height). */
  totalTiles: number;
}

const _cache = new Map<string, PlayerAnimSheet>();

/** Load (cache) une sheet specific. Idempotent. */
export async function loadPlayerAnimSheet(gender: PlayerGender, kind: PlayerAnimKind): Promise<PlayerAnimSheet> {
  const key = `${gender}:${kind}`;
  const cached = _cache.get(key);
  if (cached) return cached;
  const dir = GENDER_DIR[gender];
  const url = `/decomp/em/object_events/people/${dir}/${kind}.png`;
  const png = await loadIndexedPngStrict(url, 4);
  const sheet: PlayerAnimSheet = {
    charData: png.charData,
    palette: png.palette,
    widthTiles: png.widthTiles,
    heightTiles: png.heightTiles ?? Math.floor(png.charData.length / 32 / png.widthTiles),
    totalTiles: Math.floor(png.charData.length / 32),
  };
  _cache.set(key, sheet);
  return sheet;
}

/** Pre-load TOUTES les sheets (= warm cache). À call au boot ou première
 *  utilisation. Promise.all en parallèle. */
export async function preloadAllPlayerAnimSheets(gender: PlayerGender = 'MALE'): Promise<void> {
  const kinds: PlayerAnimKind[] = [
    'walking', 'running', 'mach_bike', 'acro_bike',
    'surfing', 'fishing', 'underwater',
    'field_move', 'watering', 'decorating',
  ];
  await Promise.all(kinds.map((k) => loadPlayerAnimSheet(gender, k)));
}

/** Returns sheet sync (= si cached). null sinon. */
export function getPlayerAnimSheetCached(gender: PlayerGender, kind: PlayerAnimKind): PlayerAnimSheet | null {
  return _cache.get(`${gender}:${kind}`) ?? null;
}

// ─── Anim timing tables 1:1 décomp ──────────────────────────────────────────
//
// Source : `src/data/object_events/object_event_anims.h`. Chaque sAnim_X est
// un sequence de ANIMCMD_FRAME(frameIdx, duration). Les frame indices pointent
// dans la sPicTable_X (= e.g. sPicTable_BrendanNormal[18] = walking + running).
//
// Phase 4.10 first cut : on n'extrait pas toutes les anim tables (= timing
// déjà géré inline par player-avatar.ts updateSpriteFrame). Cette section
// documente les anim names disponibles dans le décomp pour future extraction.

/** Décomp anim categories (cf. `data/object_events/object_event_anims.h`). */
export const PLAYER_ANIM_NAMES = {
  // Standard 4-direction movement.
  GO: ['GoSouth', 'GoNorth', 'GoWest', 'GoEast'],
  GO_SLOW: ['GoSlowSouth', 'GoSlowNorth', 'GoSlowWest', 'GoSlowEast'],
  GO_FAST: ['GoFastSouth', 'GoFastNorth', 'GoFastWest', 'GoFastEast'],
  GO_FASTER: ['GoFasterSouth', 'GoFasterNorth', 'GoFasterWest', 'GoFasterEast'],
  RUN: ['RunSouth', 'RunNorth', 'RunWest', 'RunEast'],
  // In-place actions.
  FACE: ['FaceSouth', 'FaceNorth', 'FaceWest', 'FaceEast'],
  WALK_IN_PLACE: ['WalkInPlaceSouth', 'WalkInPlaceNorth', 'WalkInPlaceWest', 'WalkInPlaceEast'],
  // Jump / ledge.
  JUMP_2: ['Jump2South', 'Jump2North', 'Jump2West', 'Jump2East'],
  JUMP: ['JumpSouth', 'JumpNorth', 'JumpWest', 'JumpEast'],
  JUMP_IN_PLACE: ['JumpInPlaceSouth', 'JumpInPlaceNorth', 'JumpInPlaceWest', 'JumpInPlaceEast'],
} as const;
