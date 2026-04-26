/**
 * Lookup metatile behaviors (240 MB_*) auto-extracts depuis le décomp.
 *
 * Source : `scripts/extract-metatile-behaviors.mjs` qui parse
 * `include/constants/metatile_behaviors.h` et catégorise par patterns.
 *
 * Catégories disponibles :
 *   - collision : passable / impassable
 *   - warp      : door / arrow / transport (ladder/escalator/hole)
 *   - terrain   : grass (encounter) / water (surfable) / sand / cave / special / seaweed
 *   - ledge     : jump / walk / slide
 *   - bridge    : plain
 *   - interactive : screen (PC, TV) / furniture (bookshelf, sink, fridge) / machine (slot, roulette) / misc
 *   - secret_base : block
 *   - other / unused
 *
 * Cf. MAP_MECHANICS_REFERENCE.md §2.5.
 */
import behaviorsJson from '../decomp/em/metatile-behaviors.json' with { type: 'json' };

export interface BehaviorInfo {
  name: string;
  value: number;
  category: 'collision' | 'warp' | 'terrain' | 'ledge' | 'bridge' | 'interactive' | 'secret_base' | 'unused' | 'other';
  subtype: string;
  encounter?: boolean;  // terrain.grass
  surfable?: boolean;   // terrain.water
}

const BEHAVIORS = behaviorsJson as unknown as Record<string, BehaviorInfo>;

/** Lookup par byte (0x00-0xEF). Retourne null si inconnu. */
export function getBehaviorInfo(byte: number): BehaviorInfo | null {
  const hex = '0x' + byte.toString(16).padStart(2, '0').toUpperCase();
  return BEHAVIORS[hex] ?? null;
}

/** True si la tile déclenche encounter sauvage (herbe haute, etc.) */
export function isEncounterTile(byte: number): boolean {
  return getBehaviorInfo(byte)?.encounter === true;
}

/** True si la tile est de l'eau surfable. */
export function isSurfableWater(byte: number): boolean {
  const info = getBehaviorInfo(byte);
  return info?.category === 'terrain' && info.subtype === 'water' && info.surfable === true;
}

/** True si la tile est un ledge à sauter (saut auto vers la direction). */
export function isJumpLedge(byte: number): boolean {
  return getBehaviorInfo(byte)?.subtype === 'jump';
}

/** Direction du jump ledge ('down' / 'left' / 'right' / 'up' / 'south_west' etc.) ou null. */
export function getJumpLedgeDirection(byte: number): string | null {
  const info = getBehaviorInfo(byte);
  if (info?.subtype !== 'jump') return null;
  // Nom format MB_JUMP_<DIR> → 'south', 'east', etc.
  const m = info.name.match(/^MB_JUMP_(\w+)$/);
  return m ? m[1].toLowerCase() : null;
}

/** Direction décodée d'un nom MB_*_<DIR> standardisée vers Facing.
 *  Retourne null si le nom n'a pas de direction cardinale extractible. */
export function decodeBehaviorDirection(name: string): 'down' | 'up' | 'left' | 'right' | null {
  const m = name.match(/_(NORTH|SOUTH|EAST|WEST)(?:_AND_\w+)?$/);
  if (!m) return null;
  switch (m[1]) {
    case 'NORTH': return 'up';
    case 'SOUTH': return 'down';
    case 'EAST':  return 'right';
    case 'WEST':  return 'left';
  }
  return null;
}

/** True si la tile est une "walk ledge" (escalator-like : marche auto vers une direction). */
export function isWalkLedge(byte: number): boolean {
  return getBehaviorInfo(byte)?.subtype === 'walk';
}
export function getWalkLedgeDirection(byte: number): 'down' | 'up' | 'left' | 'right' | null {
  const info = getBehaviorInfo(byte);
  if (info?.subtype !== 'walk') return null;
  return decodeBehaviorDirection(info.name);
}

/** True si la tile est une "slide" (glace) : continue dans la direction. */
export function isSlideLedge(byte: number): boolean {
  return getBehaviorInfo(byte)?.subtype === 'slide';
}
export function getSlideLedgeDirection(byte: number): 'down' | 'up' | 'left' | 'right' | null {
  const info = getBehaviorInfo(byte);
  if (info?.subtype !== 'slide') return null;
  return decodeBehaviorDirection(info.name);
}

/** Direction du jump ledge en Facing. Décomp `MB_JUMP_SOUTH` = saut vers le bas. */
export function getJumpLedgeFacing(byte: number): 'down' | 'up' | 'left' | 'right' | null {
  const info = getBehaviorInfo(byte);
  if (info?.subtype !== 'jump') return null;
  return decodeBehaviorDirection(info.name);
}

/** True si tile interactive (PC, TV, bookshelf...). */
export function isInteractiveTile(byte: number): boolean {
  return getBehaviorInfo(byte)?.category === 'interactive';
}

/** Sous-type interactive pour dispatcher l'action (PC → menu, BOOKSHELF → texte). */
export function getInteractiveSubtype(byte: number): string | null {
  const info = getBehaviorInfo(byte);
  return info?.category === 'interactive' ? info.subtype : null;
}
