/**
 * party_menu.ts — miroir 1:1 décomp `src/data/party_menu.h` (partiel : sTMHMMoves).
 * Ex-`engine/pokemon/tmhm-moves.ts` (unification lot 10) : la table vit dans le
 * header DATA du décomp (:1129, FOREACH_TM 50 + FOREACH_HM 8) → src/data/ chez
 * nous. Leaf pur (zéro import) — identifiants enum MOVE_* dans l'ordre exact
 * (1:1-sém : l'identifiant enum C EST notre clé, cf. modèle bag itemKey-string).
 */

/** 1:1 `sTMHMMoves[]` — copie byte-identique de l'ordre
 *  `include/constants/tms_hms.h` FOREACH_TM (50) puis FOREACH_HM (8).
 *  Valeurs = identifiants enum MOVE_* (1:1-sém de `MOVE_##id`). */
export const sTMHMMoves: readonly string[] = [
  // FOREACH_TM (tms_hms.h:4-54) — TM01..TM50
  'MOVE_FOCUS_PUNCH', 'MOVE_DRAGON_CLAW', 'MOVE_WATER_PULSE', 'MOVE_CALM_MIND',
  'MOVE_ROAR', 'MOVE_TOXIC', 'MOVE_HAIL', 'MOVE_BULK_UP', 'MOVE_BULLET_SEED',
  'MOVE_HIDDEN_POWER', 'MOVE_SUNNY_DAY', 'MOVE_TAUNT', 'MOVE_ICE_BEAM',
  'MOVE_BLIZZARD', 'MOVE_HYPER_BEAM', 'MOVE_LIGHT_SCREEN', 'MOVE_PROTECT',
  'MOVE_RAIN_DANCE', 'MOVE_GIGA_DRAIN', 'MOVE_SAFEGUARD', 'MOVE_FRUSTRATION',
  'MOVE_SOLAR_BEAM', 'MOVE_IRON_TAIL', 'MOVE_THUNDERBOLT', 'MOVE_THUNDER',
  'MOVE_EARTHQUAKE', 'MOVE_RETURN', 'MOVE_DIG', 'MOVE_PSYCHIC',
  'MOVE_SHADOW_BALL', 'MOVE_BRICK_BREAK', 'MOVE_DOUBLE_TEAM', 'MOVE_REFLECT',
  'MOVE_SHOCK_WAVE', 'MOVE_FLAMETHROWER', 'MOVE_SLUDGE_BOMB', 'MOVE_SANDSTORM',
  'MOVE_FIRE_BLAST', 'MOVE_ROCK_TOMB', 'MOVE_AERIAL_ACE', 'MOVE_TORMENT',
  'MOVE_FACADE', 'MOVE_SECRET_POWER', 'MOVE_REST', 'MOVE_ATTRACT',
  'MOVE_THIEF', 'MOVE_STEEL_WING', 'MOVE_SKILL_SWAP', 'MOVE_SNATCH',
  'MOVE_OVERHEAT',
  // FOREACH_HM (tms_hms.h:56-64) — HM01..HM08
  'MOVE_CUT', 'MOVE_FLY', 'MOVE_SURF', 'MOVE_STRENGTH', 'MOVE_FLASH',
  'MOVE_ROCK_SMASH', 'MOVE_WATERFALL', 'MOVE_DIVE',
];

