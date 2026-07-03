/**
 * birch_pc.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/birch_pc.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/birch_pc.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { SPECIES_DEOXYS, SPECIES_JIRACHI } from '../include/constants/species';
import { SpeciesToNationalPokedexNum } from './engine/data/game-data';
import { FLAG_GET_CAUGHT, FLAG_GET_SEEN, GetHoennPokedexCount, GetNationalPokedexCount, GetSetPokedexFlag, HOENN_DEX_COUNT } from './engine/ui/pokedex-flags';
import { IsNationalPokedexEnabled, VarGet, VarSet } from './event_data';
import { ShowFieldMessage } from './field_message_box';
import { getText } from './script';

/** 1:1 `bool16 ScriptGetPokedexInfo(void)` (birch_pc.c:7-21). */
export function ScriptGetPokedexInfo(): boolean {
  if (VarGet(0x8004) /* gSpecialVar_0x8004 */ == 0)
  {
    VarSet(0x8005 /* gSpecialVar_0x8005 */, +(GetHoennPokedexCount(FLAG_GET_SEEN)));
    VarSet(0x8006 /* gSpecialVar_0x8006 */, +(GetHoennPokedexCount(FLAG_GET_CAUGHT)));
  }
  else
  {
    VarSet(0x8005 /* gSpecialVar_0x8005 */, +(GetNationalPokedexCount(FLAG_GET_SEEN)));
    VarSet(0x8006 /* gSpecialVar_0x8006 */, +(GetNationalPokedexCount(FLAG_GET_CAUGHT)));
  }
  return IsNationalPokedexEnabled();
}

// This shows your Hoenn Pokédex rating and not your National Dex.

/** 1:1 `const u8 *GetPokedexRatingText(u16 count)` (birch_pc.c:24-83). */
export function GetPokedexRatingText(count: number): string {
  if (count < 10)
    return 'gBirchDexRatingText_LessThan10';
  if (count < 20)
    return 'gBirchDexRatingText_LessThan20';
  if (count < 30)
    return 'gBirchDexRatingText_LessThan30';
  if (count < 40)
    return 'gBirchDexRatingText_LessThan40';
  if (count < 50)
    return 'gBirchDexRatingText_LessThan50';
  if (count < 60)
    return 'gBirchDexRatingText_LessThan60';
  if (count < 70)
    return 'gBirchDexRatingText_LessThan70';
  if (count < 80)
    return 'gBirchDexRatingText_LessThan80';
  if (count < 90)
    return 'gBirchDexRatingText_LessThan90';
  if (count < 100)
    return 'gBirchDexRatingText_LessThan100';
  if (count < 110)
    return 'gBirchDexRatingText_LessThan110';
  if (count < 120)
    return 'gBirchDexRatingText_LessThan120';
  if (count < 130)
    return 'gBirchDexRatingText_LessThan130';
  if (count < 140)
    return 'gBirchDexRatingText_LessThan140';
  if (count < 150)
    return 'gBirchDexRatingText_LessThan150';
  if (count < 160)
    return 'gBirchDexRatingText_LessThan160';
  if (count < 170)
    return 'gBirchDexRatingText_LessThan170';
  if (count < 180)
    return 'gBirchDexRatingText_LessThan180';
  if (count < 190)
    return 'gBirchDexRatingText_LessThan190';
  if (count < 200)
    return 'gBirchDexRatingText_LessThan200';
  if (count == 200)
  {
    if (GetSetPokedexFlag(SpeciesToNationalPokedexNum(SPECIES_JIRACHI), FLAG_GET_CAUGHT) || GetSetPokedexFlag(SpeciesToNationalPokedexNum(SPECIES_DEOXYS), FLAG_GET_CAUGHT))
      return 'gBirchDexRatingText_LessThan200';
    return 'gBirchDexRatingText_DexCompleted';
  }
  if (count == HOENN_DEX_COUNT - 1)
  {
    if (GetSetPokedexFlag(SpeciesToNationalPokedexNum(SPECIES_JIRACHI), FLAG_GET_CAUGHT) && GetSetPokedexFlag(SpeciesToNationalPokedexNum(SPECIES_DEOXYS), FLAG_GET_CAUGHT))
      return 'gBirchDexRatingText_LessThan200';
    return 'gBirchDexRatingText_DexCompleted';
  }
  if (count == HOENN_DEX_COUNT)
    return 'gBirchDexRatingText_DexCompleted';
  return 'gBirchDexRatingText_LessThan10';
}

/** 1:1 `void ShowPokedexRatingMessage(void)` (birch_pc.c:85-88). */
export function ShowPokedexRatingMessage(): void {
  ShowFieldMessage(getText(GetPokedexRatingText(VarGet(0x8004) /* gSpecialVar_0x8004 */))!);
}
