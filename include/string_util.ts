/**
 * include/string_util.ts — miroir 1:1 de `decomp/include/string_util.h`.
 *
 * Surface SANS ÉTAT 100% portée (pures buffer + Convert*StringN + multibyte +
 * ext-ctrl-codes + japonais + braille). STAGE 0 (migration texte 1:1, 2026-06-05) :
 * le nœud À ÉTAT est porté byte-level — buffers EWRAM `gStringVar1-4` (Uint8Array)
 * + `StringExpandPlaceholders` (récursif) + `GetExpandedPlaceholder`. NON-BREAKING :
 * coexiste avec la voie ASCII `gba-text-system.ts` jusqu'au flip `__USE_DECOMP_TEXT__`
 * (Stages 1-5). cf. docs/TEXT-DATA-1TO1-MIGRATION-PLAN.md.
 */

/** 1:1 décomp `enum StringConvertMode` (string_util.h:9-14). */
export const STR_CONV_MODE_LEFT_ALIGN = 0;
export const STR_CONV_MODE_RIGHT_ALIGN = 1;
export const STR_CONV_MODE_LEADING_ZEROS = 2;

export {
  // Buffers EWRAM (1:1 `extern u8 gStringVarN[]`).
  gStringVar1, gStringVar2, gStringVar3, gStringVar4,
  StringCopy_Nickname, StringGet_Nickname, StringCopy_PlayerName,
  StringCopy, StringAppend, StringCopyN, StringAppendN,
  StringLength, StringCompare, StringCompareN, IsStringLengthAtLeast,
  StringFill, StringCopyPadded, StringFillWithTerminator,
  ConvertIntToDecimalStringN, ConvertUIntToDecimalStringN, ConvertIntToHexStringN,
  StringBraille, StringCopyN_Multibyte, StringLength_Multibyte,
  WriteColorChangeControlCode, IsStringJapanese, IsStringNJapanese,
  GetExtCtrlCodeLength, StringCompareWithoutExtCtrlCodes,
  ConvertInternationalString, StripExtCtrlCodes,
  StringExpandPlaceholders, GetExpandedPlaceholder,
} from '../src/string_util';
