/**
 * include/battle_main.ts — miroir 1:1 de `include/battle_main.h` (constantes de header).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/include/battle_main.h`.
 * LEAF sans import (anti-cycle/TDZ, pattern include/window.ts lot 23).
 *
 * Structure de `gTypeEffectiveness` (u8[336], le tableau vit au foyer
 * src/battle_main.ts = bm.c:335-449) : triplets plats, accès décomp par macros
 * TYPE_EFFECT_ATK_TYPE(i)=[i+0] · TYPE_EFFECT_DEF_TYPE(i)=[i+1] ·
 * TYPE_EFFECT_MULTIPLIER(i)=[i+2] (battle_main.h:26-28 — les ports indexent
 * directement, macros non transcrites).
 */

// 1:1 décomp battle_main.h:31-34 — multiplicateurs de gTypeEffectiveness.
export const TYPE_MUL_NO_EFFECT       = 0;
export const TYPE_MUL_NOT_EFFECTIVE   = 5;
export const TYPE_MUL_NORMAL          = 10;
export const TYPE_MUL_SUPER_EFFECTIVE = 20;

// 1:1 décomp battle_main.h:37-38 — ids spéciaux de la table des types.
export const TYPE_FORESIGHT = 0xFE;
export const TYPE_ENDTABLE  = 0xFF;
