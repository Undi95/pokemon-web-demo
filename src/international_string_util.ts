/**
 * international_string_util.ts — port 1:1 de
 * `decomps/pokeemeraude/src/international_string_util.c`.
 *
 * Port PARTIEL (au besoin) : pour l'instant `PadNameString` (utilisé par
 * mail_data / battle_main / trade / record_mixing). Les autres fns int'l
 * (ConvertInternationalString, etc.) seront portées 1:1 quand un caller les tire.
 */

import { PLAYER_NAME_LENGTH } from '../include/constants/global';
import { EOS, EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_RESET_FONT } from '../include/constants/characters';
import { StringLength, StripExtCtrlCodes } from './string_util';

/**
 * 1:1 décomp `void PadNameString(u8 *dest, u8 padChar)` (international_string_util.c:125).
 * Strip les ext-ctrl-codes, mesure la longueur (StringLength), puis pad le buffer
 * `dest` jusqu'à `PLAYER_NAME_LENGTH - 1` avec `padChar` — ou, si `padChar`
 * vaut `EXT_CTRL_CODE_BEGIN`, avec des paires `[EXT_CTRL_CODE_BEGIN, RESET_FONT]`
 * (usage record_mixing otName) — puis termine par `EOS`. Opère IN-PLACE sur le u8*.
 */
export function PadNameString(dest: Uint8Array, padChar: number): void {
  StripExtCtrlCodes(dest);
  let length = StringLength(dest);
  if (padChar === EXT_CTRL_CODE_BEGIN) {
    while (length < PLAYER_NAME_LENGTH - 1) {
      dest[length] = EXT_CTRL_CODE_BEGIN;
      dest[length + 1] = EXT_CTRL_CODE_RESET_FONT;
      length += 2;
    }
  } else {
    while (length < PLAYER_NAME_LENGTH - 1) {
      dest[length] = padChar;
      length++;
    }
  }
  dest[length] = EOS;
}
