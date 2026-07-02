/**
 * union_room_chat.ts — Port 1:1 STRICT (MIROIR partiel) de `src/union_room_chat.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/union_room_chat.c`.
 *
 * Périmètre porté : `InitUnionRoomChatRegisteredTexts` (seeding new-game des
 * 10 messages rapides du clavier Union Room). L'écran de chat lui-même =
 * feature link sans-fil, exempt ([[hardware-non-1to1-exemptions]]).
 */

import { gSaveBlock1Ptr } from './engine/save/save-block-state';

/** 1:1 décomp `void InitUnionRoomChatRegisteredTexts(void)` (union_room_chat.c:2011-2023) :
 *  StringCopy des 10 gText_* — strings FR ROM (strings.json build FR, texte
 *  cité 1:1). `{EMOJI_BIGSMILE}` = placeholder charmap du décomp, conservé. */
export function InitUnionRoomChatRegisteredTexts(): void {
  gSaveBlock1Ptr.registeredTexts[0] = 'SALUT';                    // gText_Hello
  gSaveBlock1Ptr.registeredTexts[1] = 'POKéMON';                  // gText_Pokemon2
  gSaveBlock1Ptr.registeredTexts[2] = 'ECHANGE';                  // gText_Trade
  gSaveBlock1Ptr.registeredTexts[3] = 'COMBAT';                   // gText_Battle
  gSaveBlock1Ptr.registeredTexts[4] = 'ÇA VA?';                   // gText_Lets
  gSaveBlock1Ptr.registeredTexts[5] = 'OK!';                      // gText_Ok
  gSaveBlock1Ptr.registeredTexts[6] = 'DESOLE';                   // gText_Sorry
  gSaveBlock1Ptr.registeredTexts[7] = 'OUAIS{EMOJI_BIGSMILE}';    // gText_YaySmileEmoji
  gSaveBlock1Ptr.registeredTexts[8] = 'MERCI';                    // gText_ThankYou
  gSaveBlock1Ptr.registeredTexts[9] = 'BYE-BYE!';                 // gText_ByeBye
}
