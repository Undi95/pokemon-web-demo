// game/easy_chat.ts — portage 1:1 partiel de src/easy_chat.c.
//
// Pour l'instant : la chaîne de conversion words → texte (lecture seule),
// utilisée par le mail (BufferMailText). Le reste de easy_chat.c (l'écran de
// saisie) vit dans engine/ui/easy-chat-render.ts.
//
// Données : src/game/data/easy-chat-words.ts (AUTO-GÉNÉRÉ depuis le décomp FR
// via scripts/extract-easy-chat-words.cjs) = gEasyChatGroups[].wordData.words[].text.
// Groupes POKEMON/POKEMON_NATIONAL/MOVE_1/MOVE_2 → gSpeciesNames/gMoveNames (1:1).

import { gEasyChatWordsByGroup } from './data/easy-chat-words';
import { gSpeciesNames, gMoveNames } from '../engine/data/game-data';

// ─── 1:1 décomp include/constants/easy_chat.h ────────────────────────────────
const EC_MASK_BITS = 9;
const EC_MASK_INDEX = (1 << EC_MASK_BITS) - 1;
const EC_EMPTY_WORD = 0xFFFF;
const EC_GROUP_POKEMON = 0;
const EC_GROUP_MOVE_1 = 18;
const EC_GROUP_MOVE_2 = 19;
const EC_GROUP_POKEMON_NATIONAL = 21;
const EC_NUM_GROUPS = 22;

/** 1:1 décomp `EC_GROUP(word)` (easy_chat.h:1125). */
function EC_GROUP(word: number): number { return word >> EC_MASK_BITS; }
/** 1:1 décomp `EC_INDEX(word)` (easy_chat.h:1126). */
function EC_INDEX(word: number): number { return word & EC_MASK_INDEX; }

// 1:1 décomp gText_ThreeQuestionMarks (mot invalide).
const gText_ThreeQuestionMarks = '???';

/** Nombre de mots du groupe (= `gEasyChatGroups[g].numWords`, ou tables noms). */
function _numWordsInGroup(groupId: number): number {
  switch (groupId) {
    case EC_GROUP_POKEMON:
    case EC_GROUP_POKEMON_NATIONAL:
      return gSpeciesNames.length;
    case EC_GROUP_MOVE_1:
    case EC_GROUP_MOVE_2:
      return gMoveNames.length;
    default: {
      const arr = gEasyChatWordsByGroup[groupId];
      return arr ? arr.length : 0;
    }
  }
}

/** 1:1 décomp `static const u8 *GetEasyChatWord(u8 groupId, u16 index)` (easy_chat.c:5202). */
function GetEasyChatWord(groupId: number, index: number): string {
  switch (groupId) {
    case EC_GROUP_POKEMON:
    case EC_GROUP_POKEMON_NATIONAL:
      return gSpeciesNames[index] ?? '';
    case EC_GROUP_MOVE_1:
    case EC_GROUP_MOVE_2:
      return gMoveNames[index] ?? '';
    default: {
      const arr = gEasyChatWordsByGroup[groupId];
      return (arr && arr[index]) ?? '';
    }
  }
}

/** 1:1 décomp `bool8 IsEasyChatWordInvalid(u16 easyChatWord)` (easy_chat.c).
 *  EC_EMPTY_WORD est VALIDE (= mot vide, pas garbage). */
function IsEasyChatWordInvalid(easyChatWord: number): boolean {
  if (easyChatWord === EC_EMPTY_WORD) return false;
  const groupId = EC_GROUP(easyChatWord);
  const index = EC_INDEX(easyChatWord);
  if (groupId >= EC_NUM_GROUPS) return true;
  return index >= _numWordsInGroup(groupId);
}

/** 1:1 décomp `u8 *CopyEasyChatWord(u8 *dest, u16 easyChatWord)` (easy_chat.c:5219).
 *  Signature décomp `(dest, word)` conservée (= pointeur parserSingle du mail) ;
 *  port string-based → renvoie le TEXTE du mot ('???' si invalide, '' si
 *  EC_EMPTY_WORD) au lieu d'écrire dans dest + retourner le end-ptr. */
export function CopyEasyChatWord(_dest: Uint8Array | null, easyChatWord: number): string {
  if (IsEasyChatWordInvalid(easyChatWord)) return gText_ThreeQuestionMarks;
  if (easyChatWord !== EC_EMPTY_WORD) {
    return GetEasyChatWord(EC_GROUP(easyChatWord), EC_INDEX(easyChatWord));
  }
  return '';
}

/** 1:1 décomp `u8 *ConvertEasyChatWordsToString(u8 *dest, const u16 *src, u16 columns, u16 rows)`
 *  (easy_chat.c:5239). Words joints par CHAR_SPACE, lignes par CHAR_NEWLINE ; la
 *  dernière NEWLINE est remplacée par EOS.
 *
 *  Port : renvoie la string convertie (consommée par mail BufferMailText →
 *  message[i].__str). Écrit aussi `dest[0]` (marqueur EOS/non-EOS) pour le test
 *  de skip-ligne de PrintMailText (`buf[0] === EOS || CHAR_SPACE`). */
export function ConvertEasyChatWordsToString(
  dest: Uint8Array | null,
  src: ArrayLike<number>,
  columns: number,
  rows: number,
): string {
  const numColumns = columns - 1;
  let result = '';
  let s = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < numColumns; j++) {
      const word = src[s];
      result += CopyEasyChatWord(null, word);
      if (word !== EC_EMPTY_WORD) result += ' '; // CHAR_SPACE
      s++;
    }
    result += CopyEasyChatWord(null, src[s]);
    s++;
    result += '\n'; // CHAR_NEWLINE
  }
  // 1:1 décomp : dest--; *dest = EOS → retire la NEWLINE finale.
  if (result.length > 0) result = result.slice(0, -1);

  if (dest instanceof Uint8Array && dest.length > 0) {
    // PrintMailText skip si dest[0] == EOS(0xFF) ou CHAR_SPACE(0x00). On marque
    // dest[0] = 1 (texte présent) ou 0xFF (ligne vide).
    dest[0] = result.length === 0 ? 0xFF : 1;
  }
  return result;
}
