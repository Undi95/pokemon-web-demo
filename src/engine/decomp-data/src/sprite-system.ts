// sprite-system.ts — DISSOUS (2026-06-30, MIRROR 1:1 decomp-data).
//
// Ce fichier auto-généré contenait 8 registres SPRITE_* (résolution sprite par NOM string).
// Tous dissous : chaque scène définit désormais ses sSpriteTemplate_*/sOamData_*/sAnim(s)_*/
// sAffineAnim(s)_* comme OBJETS directs, et CreateSprite(template) prend la réf directe
// (game/sprite.ts `_CreateSpriteAtTemplate`), comme la décomp.
//
//   - SPRITE_AFFINE_ANIMS / SPRITE_AFFINE_ANIM_TABLES → registre EXTRA (sprite-affine-extras.ts)
//   - SPRITE_PALETTES / SPRITE_SHEETS                 → chargement direct LoadSpriteSheet/LoadSpritePalette
//   - SPRITE_ANIMS / SPRITE_ANIM_TABLES               → registre EXTRA (registerExtraAnim/Table)
//   - SPRITE_TEMPLATES / OAM_DATAS                    → objets SpriteTemplate directs par scène
//
// Plus aucun importeur → fichier vidé (conservé en tombstone le temps de retirer le scaffold
// d'extraction scripts/extract-sprite-system.mjs).
export {};
