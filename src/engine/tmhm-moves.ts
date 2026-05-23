/**
 * tmhm-moves.ts — 1:1 décomp `src/data/party_menu.h` (sTMHMMoves) +
 * `src/party_menu.c:4688` (ItemIdToBattleMoveId)
 * ============================================================================
 * Chaînon MAILLON (méthode user "remonte la chaîne") : le SAC (bag-menu.ts
 * étape 5b `GetItemNameFromPocket`, poche TMHM) résout le nom via
 * `gMoveNames[ItemIdToBattleMoveId(itemId)]` — non porté. `ItemIdToBattleMoveId`
 * + sa table `sTMHMMoves` appartiennent à party_menu.c / src/data/party_menu.h
 * (sous-système PARTAGÉ : sac, boutique, item_use, field_specials). Leur
 * MAISON = ici (feuille pure, 0 import risqué — ≠ tirer party-screen.ts =
 * pas de cycle TDZ, leçon map-loader).
 *
 * 1:1 `src/data/party_menu.h:1129` :
 *   #define TMHM_MOVE(id) CAT(MOVE_, id),
 *   static const u16 sTMHMMoves[] = { FOREACH_TMHM(TMHM_MOVE) };
 * `FOREACH_TMHM = FOREACH_TM + FOREACH_HM` (include/constants/tms_hms.h:66) :
 * 50 TM puis 8 HM. La décomp stocke des u16 (valeurs MOVE_*) ; notre modèle
 * nom-de-move est clé-enum-string ("MOVE_X", move-names-fr.json) — on
 * matérialise donc sTMHMMoves comme le tableau des identifiants enum DANS
 * L'ORDRE EXACT du source (1:1-sémantique = même décision de modèle que
 * bag-pockets itemKey-string : l'identifiant enum C EST notre clé).
 */
import { ITEM_TM01 } from './decomp-data/include/constants/items-data';

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

/** 1:1 décomp `party_menu.c:4688` :
 *    u16 ItemIdToBattleMoveId(u16 item) {
 *      u16 tmNumber = item - ITEM_TM01;
 *      return sTMHMMoves[tmNumber];
 *    }
 *  Retour = identifiant enum move ("MOVE_X") 1:1-sém (cf. en-tête) ;
 *  `gMoveNames[...]` côté appelant = `getMoveName(thisResult)`. */
export function ItemIdToBattleMoveId(item: number): string {
  const tmNumber = item - ITEM_TM01;
  return sTMHMMoves[tmNumber];
}
