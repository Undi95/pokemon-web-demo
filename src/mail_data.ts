/**
 * mail_data.ts — port 1:1 STRICT de `src/mail_data.c` (206 lignes décomp).
 *
 * Source de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/mail_data.c`
 *   - `D:/Projet 1/decomps/pokeemeraude/include/mail.h` (déclarations)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/global.h:770` (struct Mail)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/items.h` (item mail ids,
 *     FIRST_MAIL_INDEX=ITEM_ORANGE_MAIL, ITEM_TO_MAIL macro, MAIL_NONE=0xFF)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/easy_chat.h:1129`
 *     `#define EC_EMPTY_WORD 0xFFFF`
 *
 * Rôle dans le port :
 *   - Helpers manipulation Mail : ClearAllMail, ClearMail, MonHasMail,
 *     GiveMailToMon(ByItemId), TakeMailFromMon, SpeciesToMailSpecies,
 *     MailSpeciesToSpecies, ClearMailItemId, TakeMailFromMonAndSave, ItemIsMail.
 *   - Constantes ITEM_*MAIL + FIRST_MAIL_INDEX + MAIL_NONE + ITEM_TO_MAIL macro
 *     (re-déclarées ici 1:1 décomp pour éviter import depuis decomp-data/auto/,
 *     cf. user-feedback `feedback-no-hardcoded-decomp-values` : on dérive des
 *     constantes manuelles du décomp source de vérité, jamais d'auto-data).
 *
 * Note : la struct Mail elle-même est déjà déclarée dans `save-blocks.ts:564`
 * (= 1:1 décomp global.h:770) et stockée dans `gSaveBlock1Ptr.mail[MAIL_COUNT]`
 * (= 1:1 décomp global.h:1059). Ce module ne redéfinit pas la struct, il
 * réexporte le type pour les callers.
 */

import { GET_UNOWN_LETTER } from '../include/pokemon';
import { GetPlayerName } from '../include/text';
import type { Mail } from './engine/save/save-blocks';
import { MAIL_COUNT, MAIL_WORDS_COUNT, PLAYER_NAME_LENGTH, TRAINER_ID_LENGTH, PARTY_SIZE } from './engine/save/save-blocks';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { StringLength } from './string_util';
import { PadNameString } from './international_string_util';
import {
  GetMonData, SetMonData,
  MON_DATA_HELD_ITEM, MON_DATA_MAIL, MON_DATA_SPECIES, MON_DATA_PERSONALITY,
  type Pokemon,
} from './engine/battle/party-storage';
// 1:1 décomp `GetBoxMonData` n'a PAS d'équivalent TS : notre `GetMonData` couvre
// le pattern (= party Pokemon, format non-Box). `mail.c::GiveMailToMon` opère
// sur un `struct Pokemon *` (= party), pas BoxPokemon → `GetMonData` 1:1 valide.
const GetBoxMonData = GetMonData;

export type { Mail };

// ─── Constantes 1:1 décomp `include/constants/items.h` ────────────────────────
//
// `#define ITEM_ORANGE_MAIL 121` ... `#define ITEM_RETRO_MAIL 132`
// `#define FIRST_MAIL_INDEX ITEM_ORANGE_MAIL`
// `#define ITEM_TO_MAIL(itemId) ((itemId) - FIRST_MAIL_INDEX)`
// `#define MAIL_NONE 0xFF`

export const ITEM_NONE = 0;
export const ITEM_ORANGE_MAIL  = 121;
export const ITEM_HARBOR_MAIL  = 122;
export const ITEM_GLITTER_MAIL = 123;
export const ITEM_MECH_MAIL    = 124;
export const ITEM_WOOD_MAIL    = 125;
export const ITEM_WAVE_MAIL    = 126;
export const ITEM_BEAD_MAIL    = 127;
export const ITEM_SHADOW_MAIL  = 128;
export const ITEM_TROPIC_MAIL  = 129;
export const ITEM_DREAM_MAIL   = 130;
export const ITEM_FAB_MAIL     = 131;
export const ITEM_RETRO_MAIL   = 132;

export const FIRST_MAIL_INDEX = ITEM_ORANGE_MAIL;
export const MAIL_NONE = 0xFF;

/** 1:1 décomp macro `ITEM_TO_MAIL(itemId)` (items.h:446). */
export function ITEM_TO_MAIL(itemId: number): number {
  return itemId - FIRST_MAIL_INDEX;
}

// ─── Constantes 1:1 décomp `include/pokemon.h` & `include/constants/...` ─────

export const SPECIES_NONE = 0;
export const SPECIES_BULBASAUR = 1;
export const SPECIES_UNOWN = 201;
/** 1:1 décomp pokemon.h:362 `#define NUM_UNOWN_FORMS 28`. */
export const NUM_UNOWN_FORMS = 28;
export const NUM_SPECIES = 412;

/** 1:1 décomp easy_chat.h:1129 `#define EC_EMPTY_WORD 0xFFFF`. */
export const EC_EMPTY_WORD = 0xFFFF;

/** 1:1 décomp string.h `#define EOS 0xFF`. */
export const EOS = 0xFF;

/** 1:1 décomp string.h `#define CHAR_SPACE 0x00`. */
export const CHAR_SPACE = 0x00;

/** 1:1 décomp mail_data.c:9 `#define UNOWN_OFFSET 30000`. */
const UNOWN_OFFSET = 30000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** 1:1 décomp `void ClearAllMail(void)` (mail_data.c:11).
 *
 *    for (i = 0; i < MAIL_COUNT; i++)
 *        ClearMail(&gSaveBlock1Ptr->mail[i]);
 */
export function ClearAllMail(): void {
  for (let i = 0; i < MAIL_COUNT; i++) {
    ClearMail(gSaveBlock1Ptr.mail[i] as Mail);
  }
}

/** 1:1 décomp `void ClearMail(struct Mail *mail)` (mail_data.c:19).
 *
 *    for (i = 0; i < MAIL_WORDS_COUNT; i++)
 *        mail->words[i] = EC_EMPTY_WORD;
 *    for (i = 0; i < PLAYER_NAME_LENGTH + 1; i++)
 *        mail->playerName[i] = EOS;
 *    for (i = 0; i < TRAINER_ID_LENGTH; i++)
 *        mail->trainerId[i] = 0;
 *    mail->species = SPECIES_BULBASAUR;
 *    mail->itemId = ITEM_NONE;
 *
 *  Caveat TS : `playerName` est une `string` (= notre Mail interface, voir
 *  save-blocks.ts:567), pas un `u8[8]`. Le décomp remplit le buffer u8
 *  d'EOS (terminator) sur PLAYER_NAME_LENGTH+1 = 8 octets ; en TS l'équivalent
 *  est `playerName = ''` (= string vide). Les `trainerId` et `words` restent
 *  des `number[]` 1:1 décomp.
 */
export function ClearMail(mail: Mail): void {
  for (let i = 0; i < MAIL_WORDS_COUNT; i++) {
    mail.words[i] = EC_EMPTY_WORD;
  }
  // 1:1 décomp : for (i = 0; i < PLAYER_NAME_LENGTH + 1; i++) mail->playerName[i] = EOS.
  mail.playerName = new Array(PLAYER_NAME_LENGTH + 1).fill(EOS);
  for (let i = 0; i < TRAINER_ID_LENGTH; i++) {
    mail.trainerId[i] = 0;
  }
  mail.species = SPECIES_BULBASAUR;
  mail.itemId = ITEM_NONE;
}

/** 1:1 décomp `bool8 MonHasMail(struct Pokemon *mon)` (mail_data.c:36).
 *
 *    u16 heldItem = GetMonData(mon, MON_DATA_HELD_ITEM);
 *    if (ItemIsMail(heldItem) && GetMonData(mon, MON_DATA_MAIL) != MAIL_NONE)
 *        return TRUE;
 *    else
 *        return FALSE;
 */
export function MonHasMail(mon: Pokemon): boolean {
  const heldItem = GetMonData(mon, MON_DATA_HELD_ITEM) as number;
  if (ItemIsMail(heldItem) && (GetMonData(mon, MON_DATA_MAIL) as number) !== MAIL_NONE) {
    return true;
  }
  return false;
}

/** 1:1 décomp `u8 GiveMailToMonByItemId(struct Pokemon *mon, u16 itemId)`
 *  (mail_data.c:45).
 *
 *  Trouve le premier slot mail[0..PARTY_SIZE-1] libre, le remplit avec :
 *    - words[*] = EC_EMPTY_WORD
 *    - playerName = gSaveBlock2Ptr->playerName (padded CHAR_SPACE)
 *    - trainerId[4] = gSaveBlock2Ptr->playerTrainerId[4]
 *    - species = SpeciesToMailSpecies(box species, personality)
 *    - itemId = itemId argument
 *  Puis MON_DATA_MAIL = id + MON_DATA_HELD_ITEM = itemId via SetMonData.
 *  Retourne `id` (= index slot 0..PARTY_SIZE-1) ou MAIL_NONE si plein.
 */
export function GiveMailToMonByItemId(mon: Pokemon, itemId: number): number {
  // u8 heldItem[2] = { itemId, itemId >> 8 } — packed u16 little endian.
  // En TS on passe directement itemId u16 (cf. SetMonData party-storage:316
  // qui fait `mon.heldItem = v & 0xFFFF`).
  for (let id = 0; id < PARTY_SIZE; id++) {
    const slot = gSaveBlock1Ptr.mail[id] as Mail;
    if (slot.itemId === ITEM_NONE) {
      for (let i = 0; i < MAIL_WORDS_COUNT; i++) {
        slot.words[i] = EC_EMPTY_WORD;
      }
      // 1:1 décomp :
      //   for (i = 0; i < PLAYER_NAME_LENGTH; i++)
      //       gSaveBlock1Ptr->mail[id].playerName[i] = gSaveBlock2Ptr->playerName[i];
      //   gSaveBlock1Ptr->mail[id].playerName[i] = EOS;
      //   PadNameString(gSaveBlock1Ptr->mail[id].playerName, CHAR_SPACE);
      // Stage 4b byte charmap : GetPlayerName() = bytes EOS-terminés ; copie le nom
      // dans un buffer u8[PLAYER_NAME_LENGTH+1], pad CHAR_SPACE, stocke en number[].
      const pn = GetPlayerName();
      const nameBuf = new Uint8Array(PLAYER_NAME_LENGTH + 1).fill(EOS);
      for (let k = 0; k < PLAYER_NAME_LENGTH && pn[k] !== undefined && pn[k] !== EOS; k++) {
        nameBuf[k] = pn[k];
      }
      PadNameString(nameBuf, CHAR_SPACE);
      slot.playerName = Array.from(nameBuf.subarray(0, StringLength(nameBuf) + 1));

      const playerTrainerId = (gSaveBlock2Ptr as any).playerTrainerId as number[] | undefined;
      for (let i = 0; i < TRAINER_ID_LENGTH; i++) {
        slot.trainerId[i] = playerTrainerId ? (playerTrainerId[i] ?? 0) : 0;
      }

      const species = GetBoxMonData(mon as any, MON_DATA_SPECIES) as number;
      const personality = GetBoxMonData(mon as any, MON_DATA_PERSONALITY) as number;
      slot.species = SpeciesToMailSpecies(species, personality);
      slot.itemId = itemId;
      SetMonData(mon, MON_DATA_MAIL, id);
      SetMonData(mon, MON_DATA_HELD_ITEM, itemId);
      return id;
    }
  }
  return MAIL_NONE;
}

/** 1:1 décomp `u16 SpeciesToMailSpecies(u16 species, u32 personality)`
 *  (mail_data.c:83).
 *
 *    if (species == SPECIES_UNOWN)
 *    {
 *        u32 species = GetUnownLetterByPersonality(personality) + UNOWN_OFFSET;
 *        return species;
 *    }
 *    return species;
 */
export function SpeciesToMailSpecies(species: number, personality: number): number {
  if (species === SPECIES_UNOWN) {
    return GetUnownLetterByPersonality(personality) + UNOWN_OFFSET;
  }
  return species;
}

/** 1:1 décomp `u16 MailSpeciesToSpecies(u16 mailSpecies, u16 *buffer)`
 *  (mail_data.c:94).
 *
 *    if (mailSpecies >= UNOWN_OFFSET && mailSpecies < UNOWN_OFFSET + NUM_UNOWN_FORMS)
 *    {
 *        result = SPECIES_UNOWN;
 *        *buffer = mailSpecies - UNOWN_OFFSET;
 *    }
 *    else
 *    {
 *        result = mailSpecies;
 *    }
 *    return result;
 *
 *  Caveat TS : `buffer` C est `u16 *`. En TS on accepte un objet `{ value }`
 *  (= mutable container) ou un Uint16Array de length>=1. Si null/undefined,
 *  le caller ne se soucie pas du letter (cas mail.c:475 utilise un `u16
 *  buffer[2]` local, valeur écrasée immédiatement).
 */
export function MailSpeciesToSpecies(
  mailSpecies: number,
  buffer: { value?: number } | Uint16Array | number[] | null | undefined,
): number {
  let result: number;
  if (mailSpecies >= UNOWN_OFFSET && mailSpecies < UNOWN_OFFSET + NUM_UNOWN_FORMS) {
    result = SPECIES_UNOWN;
    const letter = mailSpecies - UNOWN_OFFSET;
    if (buffer) {
      if (buffer instanceof Uint16Array || Array.isArray(buffer)) {
        buffer[0] = letter;
      } else {
        buffer.value = letter;
      }
    }
  } else {
    result = mailSpecies;
  }
  return result;
}

/** 1:1 décomp `u8 GiveMailToMon(struct Pokemon *mon, struct Mail *mail)`
 *  (mail_data.c:111).
 *
 *    u16 itemId = mail->itemId;
 *    u8 mailId = GiveMailToMonByItemId(mon, itemId);
 *    if (mailId == MAIL_NONE) return MAIL_NONE;
 *    gSaveBlock1Ptr->mail[mailId] = *mail;
 *    SetMonData(mon, MON_DATA_MAIL, &mailId);
 *    SetMonData(mon, MON_DATA_HELD_ITEM, heldItem);  // = itemId packed u8[2]
 *    return mailId;
 */
export function GiveMailToMon(mon: Pokemon, mail: Mail): number {
  const itemId = mail.itemId;
  const mailId = GiveMailToMonByItemId(mon, itemId);
  if (mailId === MAIL_NONE) return MAIL_NONE;

  // 1:1 décomp `gSaveBlock1Ptr->mail[mailId] = *mail;` (struct copy).
  // En TS : copy field-by-field pour préserver le slot.
  const slot = gSaveBlock1Ptr.mail[mailId] as Mail;
  for (let i = 0; i < MAIL_WORDS_COUNT; i++) slot.words[i] = mail.words[i];
  slot.playerName = mail.playerName.slice();
  for (let i = 0; i < TRAINER_ID_LENGTH; i++) slot.trainerId[i] = mail.trainerId[i];
  slot.species = mail.species;
  slot.itemId = mail.itemId;

  SetMonData(mon, MON_DATA_MAIL, mailId);
  SetMonData(mon, MON_DATA_HELD_ITEM, itemId);
  return mailId;
}

/** 1:1 décomp `void TakeMailFromMon(struct Pokemon *mon)` (mail_data.c:137).
 *
 *    if (MonHasMail(mon))
 *    {
 *        mailId = GetMonData(mon, MON_DATA_MAIL);
 *        gSaveBlock1Ptr->mail[mailId].itemId = ITEM_NONE;
 *        mailId = MAIL_NONE;
 *        heldItem[0] = ITEM_NONE; heldItem[1] = ITEM_NONE << 8;
 *        SetMonData(mon, MON_DATA_MAIL, &mailId);
 *        SetMonData(mon, MON_DATA_HELD_ITEM, heldItem);
 *    }
 */
/** 1:1 décomp `DummyMailFunc` (mail_data.c:132-135).
 *  `static UNUSED` — dead-code non référencé ; porté pour le miroir intégral. */
function DummyMailFunc(): boolean {
  return false;
}

export function TakeMailFromMon(mon: Pokemon): void {
  if (MonHasMail(mon)) {
    const mailId = GetMonData(mon, MON_DATA_MAIL) as number;
    (gSaveBlock1Ptr.mail[mailId] as Mail).itemId = ITEM_NONE;
    SetMonData(mon, MON_DATA_MAIL, MAIL_NONE);
    SetMonData(mon, MON_DATA_HELD_ITEM, ITEM_NONE);
  }
}

/** 1:1 décomp `void ClearMailItemId(u8 mailId)` (mail_data.c:154). */
export function ClearMailItemId(mailId: number): void {
  (gSaveBlock1Ptr.mail[mailId] as Mail).itemId = ITEM_NONE;
}

/** 1:1 décomp `u8 TakeMailFromMonAndSave(struct Pokemon *mon)`
 *  (mail_data.c:159).
 *
 *  Déplace le mail du Pokémon vers le 1er slot libre des mails "stockés"
 *  (= mail[PARTY_SIZE..MAIL_COUNT-1], les 10 slots stockés au PC). Retourne
 *  l'index du nouveau slot ou MAIL_NONE si plein.
 *
 *    for (i = PARTY_SIZE; i < MAIL_COUNT; i++)
 *        if (gSaveBlock1Ptr->mail[i].itemId == ITEM_NONE) {
 *            memcpy(&gSaveBlock1Ptr->mail[i], &gSaveBlock1Ptr->mail[GetMonData(...)], sizeof(struct Mail));
 *            gSaveBlock1Ptr->mail[GetMonData(...)].itemId = ITEM_NONE;
 *            SetMonData(mon, MON_DATA_MAIL, &newMailId);   // = MAIL_NONE
 *            SetMonData(mon, MON_DATA_HELD_ITEM, newHeldItem); // = ITEM_NONE
 *            return i;
 *        }
 *    return MAIL_NONE;
 */
export function TakeMailFromMonAndSave(mon: Pokemon): number {
  for (let i = PARTY_SIZE; i < MAIL_COUNT; i++) {
    const dest = gSaveBlock1Ptr.mail[i] as Mail;
    if (dest.itemId === ITEM_NONE) {
      const monMailId = GetMonData(mon, MON_DATA_MAIL) as number;
      const src = gSaveBlock1Ptr.mail[monMailId] as Mail;
      // 1:1 décomp memcpy(struct Mail).
      for (let j = 0; j < MAIL_WORDS_COUNT; j++) dest.words[j] = src.words[j];
      dest.playerName = src.playerName.slice();
      for (let j = 0; j < TRAINER_ID_LENGTH; j++) dest.trainerId[j] = src.trainerId[j];
      dest.species = src.species;
      dest.itemId = src.itemId;
      // Free le slot source + clear pokemon data.
      src.itemId = ITEM_NONE;
      SetMonData(mon, MON_DATA_MAIL, MAIL_NONE);
      SetMonData(mon, MON_DATA_HELD_ITEM, ITEM_NONE);
      return i;
    }
  }
  // No space to save mail.
  return MAIL_NONE;
}

/** 1:1 décomp `bool8 ItemIsMail(u16 itemId)` (mail_data.c:185).
 *
 *  switch sur les 12 ITEM_*_MAIL ; default = FALSE.
 */
export function ItemIsMail(itemId: number): boolean {
  switch (itemId) {
    case ITEM_ORANGE_MAIL:
    case ITEM_HARBOR_MAIL:
    case ITEM_GLITTER_MAIL:
    case ITEM_MECH_MAIL:
    case ITEM_WOOD_MAIL:
    case ITEM_WAVE_MAIL:
    case ITEM_BEAD_MAIL:
    case ITEM_SHADOW_MAIL:
    case ITEM_TROPIC_MAIL:
    case ITEM_DREAM_MAIL:
    case ITEM_FAB_MAIL:
    case ITEM_RETRO_MAIL:
      return true;
    default:
      return false;
  }
}

// Stage 4b : le stub local `PadNameString(string)` est retiré — remplacé par le
// port 1:1 byte `PadNameString(Uint8Array)` (src/international_string_util.ts).

/** 1:1 décomp `GetUnownLetterByPersonality` (pokemon_icon.c) = `return GET_UNOWN_LETTER(personality)`.
 *  Délègue à la macro `GET_UNOWN_LETTER` du miroir `src/game/include/pokemon.ts`
 *  (source unique ; le calcul bitwise était inliné ici, maintenant consolidé). */
function GetUnownLetterByPersonality(personality: number): number {
  return GET_UNOWN_LETTER(personality);
}
