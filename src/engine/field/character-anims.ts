/**
 * character-anims.ts — type de direction de personnage (down/up/left/right).
 *
 * NB : les helpers d'animation de strip NPC (setIdleFrame/playSingleStep/…) ont
 * été retirés (code mort orphelin après la migration mirror — l'animation des
 * object-events passe par event_object_movement.ts). Seul le type `Facing`
 * reste, consommé par tilemap-loader.ts.
 */

export type Facing = 'down' | 'up' | 'left' | 'right';
