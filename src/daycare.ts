/**
 * daycare.ts — 1:1 port partiel de `D:/Projet 1/decomps/pokeemeraude/src/daycare.c`.
 *
 * Source de vérité (1:1 décomp) : `decomps/pokeemeraude/src/daycare.c`.
 *
 * Subset porté pour l'instant : `CreateEgg` (appelé par `ScriptGiveEgg`,
 * script_pokemon_util.c → opcode `giveegg`). Le reste de daycare.c (pension,
 * compatibilité de reproduction, génération d'œuf, hérédité des IV/moves) =
 * chantier dédié.
 */

import { CreateMon } from './engine/pokemon/pokemon';
import {
  SetMonData,
  MON_DATA_POKEBALL, MON_DATA_NICKNAME, MON_DATA_FRIENDSHIP,
  MON_DATA_MET_LEVEL, MON_DATA_LANGUAGE, MON_DATA_MET_LOCATION, MON_DATA_IS_EGG,
} from './engine/battle/party-storage';
import type { Pokemon } from './engine/battle/party-storage';
import { gSpeciesInfo } from './engine/data/game-data';
import { getString } from './engine/ui/gba-strings';
import { LANGUAGE_JAPANESE } from '../include/constants/global';
import { ITEM_POKE_BALL } from '../include/constants/items';

/** 1:1 décomp `#define EGG_HATCH_LEVEL 5` (constants/daycare.h:17). */
export const EGG_HATCH_LEVEL = 5;

/** 1:1 décomp `#define METLOC_SPECIAL_EGG 0xFD` (constants/region_map_sections.h). */
const METLOC_SPECIAL_EGG = 0xFD;

/** 1:1 décomp `void CreateEgg(struct Pokemon *mon, u16 species, bool8 setHotSpringsLocation)`
 *  (daycare.c:828-853) :
 *  ```c
 *  CreateMon(mon, species, EGG_HATCH_LEVEL, USE_RANDOM_IVS, FALSE, 0, OT_ID_PLAYER_ID, 0);
 *  metLevel = 0; ball = ITEM_POKE_BALL; language = LANGUAGE_JAPANESE;
 *  SetMonData(mon, MON_DATA_POKEBALL, &ball);
 *  SetMonData(mon, MON_DATA_NICKNAME, sJapaneseEggNickname);
 *  SetMonData(mon, MON_DATA_FRIENDSHIP, &gSpeciesInfo[species].eggCycles);
 *  SetMonData(mon, MON_DATA_MET_LEVEL, &metLevel);
 *  SetMonData(mon, MON_DATA_LANGUAGE, &language);
 *  if (setHotSpringsLocation) SetMonData(mon, MON_DATA_MET_LOCATION, &METLOC_SPECIAL_EGG);
 *  isEgg = TRUE; SetMonData(mon, MON_DATA_IS_EGG, &isEgg);
 *  ```
 *  Adaptations modèle :
 *   - `CreateMon` retourne le mon (au lieu d'écrire un pointeur sortie).
 *   - Le nickname œuf = `getString('gText_EggNickname')` ("OEUF") au lieu du
 *     `sJapaneseEggNickname` (タマゴ) du décomp : notre modèle est FR/UTF-8 et
 *     l'affichage spécialise déjà `isEgg` → "OEUF" (cf. party-screen.ts:666),
 *     donc le nickname stocké est cohérent avec ce qui s'affiche.
 *   - `eggCycles` lu via `gSpeciesInfo[mon.species]` (table id-indexée). */
export function CreateEgg(speciesEnum: string, setHotSpringsLocation: boolean): Pokemon {
  const mon = CreateMon(speciesEnum, EGG_HATCH_LEVEL);
  SetMonData(mon, MON_DATA_POKEBALL, ITEM_POKE_BALL);
  SetMonData(mon, MON_DATA_NICKNAME, getString('gText_EggNickname'));
  SetMonData(mon, MON_DATA_FRIENDSHIP, gSpeciesInfo[mon.species]?.eggCycles ?? 0);
  SetMonData(mon, MON_DATA_MET_LEVEL, 0);
  SetMonData(mon, MON_DATA_LANGUAGE, LANGUAGE_JAPANESE);
  if (setHotSpringsLocation) {
    SetMonData(mon, MON_DATA_MET_LOCATION, METLOC_SPECIAL_EGG);
  }
  SetMonData(mon, MON_DATA_IS_EGG, 1);
  return mon;
}
