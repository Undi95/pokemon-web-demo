/**
 * international_string_util.ts — port 1:1 de
 * `decomps/pokeemeraude/src/international_string_util.c`.
 *
 * Port PARTIEL (au besoin) : `PadNameString` (mail_data / battle_main / trade /
 * record_mixing) + `TVShowConvertInternationalString` (egg_hatch / TV). Les autres
 * fns int'l seront portées 1:1 quand un caller les tire.
 */

import { PLAYER_NAME_LENGTH } from '../include/constants/global';
import { EOS, EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_RESET_FONT } from '../include/constants/characters';
import { StringLength, StripExtCtrlCodes, StringCopy, ConvertInternationalString } from './string_util';

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

/** 1:1 décomp `void TVShowConvertInternationalString(u8 *dest, const u8 *src, int language)`
 *  (international_string_util.c:203). */
export function TVShowConvertInternationalString(dest: Uint8Array, src: Uint8Array, language: number): void {
  StringCopy(dest, src);
  ConvertInternationalString(dest, language);
}
