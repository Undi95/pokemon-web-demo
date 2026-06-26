/**
 * include/pokeball.ts — miroir 1:1 `include/pokeball.h`.
 *
 * Header NEUTRE (zéro import) : c'est ici que vivent les constantes BALL_* (et pas dans
 * battle_anim_throw.ts comme le port l'avait fait à tort → cycle ESM). battle_anim_throw.c
 * ET pokeball.c importent ces constantes depuis ce header → graphe acyclique 1:1.
 */

// 1:1 enum (pokeball.h:4) — IDs de Ball (index dans gBallSpriteSheets/Palettes/Templates).
export const BALL_POKE = 0;
export const BALL_GREAT = 1;
export const BALL_SAFARI = 2;
export const BALL_ULTRA = 3;
export const BALL_MASTER = 4;
export const BALL_NET = 5;
export const BALL_DIVE = 6;
export const BALL_NEST = 7;
export const BALL_REPEAT = 8;
export const BALL_TIMER = 9;
export const BALL_LUXURY = 10;
export const BALL_PREMIER = 11;
export const POKEBALL_COUNT = 12;

// 1:1 enum (pokeball.h:21) — affine anims de la Ball.
export const BALL_AFFINE_ANIM_0 = 0;
export const BALL_ROTATE_RIGHT = 1;
export const BALL_ROTATE_LEFT = 2;
export const BALL_AFFINE_ANIM_3 = 3;
export const BALL_AFFINE_ANIM_4 = 4;

// 1:1 #define (pokeball.h:33).
export const POKEBALL_PLAYER_SENDOUT = 0xFF;
export const POKEBALL_OPPONENT_SENDOUT = 0xFE;
