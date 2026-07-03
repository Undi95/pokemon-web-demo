/**
 * international_string_util.ts — port 1:1 de
 * `decomps/pokeemeraude/src/international_string_util.c`.
 *
 * Port PARTIEL (au besoin) : `PadNameString` (mail_data / battle_main / trade /
 * record_mixing) + `TVShowConvertInternationalString` (egg_hatch / TV). Les autres
 * fns int'l seront portées 1:1 quand un caller les tire.
 */

import { LANGUAGE_ENGLISH, LANGUAGE_JAPANESE, PLAYER_NAME_LENGTH } from '../include/constants/global';
import { EOS, EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_JPN, EXT_CTRL_CODE_RESET_FONT } from '../include/constants/characters';
import { StringLength, StripExtCtrlCodes, StringCopy, ConvertInternationalString } from './string_util';
import { encodeOwText } from './text';

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
 *  (international_string_util.c:203). `src` accepte aussi une string JS (convention
 *  save : les noms des TV shows sont stockés en string — encodés à la frontière). */
export function TVShowConvertInternationalString(dest: Uint8Array, src: Uint8Array | string, language: number): void {
  StringCopy(dest, typeof src === 'string' ? encodeOwText(src) : src);
  ConvertInternationalString(dest, language);
}

/** 1:1 décomp `int GetNicknameLanguage(u8 *str)` (international_string_util.c:210) :
 *  JAPANESE si le nom commence par EXT_CTRL_CODE_BEGIN+EXT_CTRL_CODE_JPN, sinon
 *  ENGLISH. Accepte aussi une string JS (nickname save) — jamais JPN chez nous. */
export function GetNicknameLanguage(str: Uint8Array | string): number {
  if (typeof str === 'string') return LANGUAGE_ENGLISH;
  if (str[0] === EXT_CTRL_CODE_BEGIN && str[1] === EXT_CTRL_CODE_JPN)
    return LANGUAGE_JAPANESE;
  else
    return LANGUAGE_ENGLISH;
}
