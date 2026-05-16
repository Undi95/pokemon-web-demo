/**
 * battle/text-buffers.ts — gBattleTextBuff1/2/3 + PREPARE_*_BUFFER macros.
 *
 * Sources de vérité (1:1 décomp) :
 *   - `D:/Projet 1/decomps/pokeemeraude/include/battle_message.h` (macros + constants)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c:137-139` (EWRAM_DATA u8 buffs)
 *
 * Rationale : les opcodes battle utilisent ces buffers comme placeholders dans
 * les strings — les macros PREPARE_*_BUFFER écrivent un mini-format (0xFD opcode
 * + type tag + data bytes + 0xFF EOS) que BattleStringExpand consomme à l'écriture
 * au framebuffer. Notre port permet aux opcodes d'appeler PREPARE_*_BUFFER tout
 * en restant 1:1 strict avec l'encoding décomp.
 */

// ─── Sizes (battle_message.h:6-8) ──────────────────────────────────────────

// MOVE_NAME_LENGTH = 12 (constants/moves.h), POKEMON_NAME_LENGTH = 10.
// TEXT_BUFF_ARRAY_COUNT = max(16, max(MOVE_NAME_LENGTH+2, POKEMON_NAME_LENGTH+1)) = 16.
export const TEXT_BUFF_ARRAY_COUNT = 16;

// ─── B_TXT_* IDs (battle_message.h:10-63) — for 0xFD placeholder in strings ─

export const B_TXT_BUFF1 = 0x0;
export const B_TXT_BUFF2 = 0x1;
export const B_TXT_COPY_VAR_1 = 0x2;
export const B_TXT_COPY_VAR_2 = 0x3;
export const B_TXT_COPY_VAR_3 = 0x4;
export const B_TXT_PLAYER_MON1_NAME = 0x5;
export const B_TXT_OPPONENT_MON1_NAME = 0x6;
export const B_TXT_PLAYER_MON2_NAME = 0x7;
export const B_TXT_OPPONENT_MON2_NAME = 0x8;
export const B_TXT_LINK_PLAYER_MON1_NAME = 0x9;
export const B_TXT_LINK_OPPONENT_MON1_NAME = 0xA;
export const B_TXT_LINK_PLAYER_MON2_NAME = 0xB;
export const B_TXT_LINK_OPPONENT_MON2_NAME = 0xC;
export const B_TXT_ATK_NAME_WITH_PREFIX_MON1 = 0xD;
export const B_TXT_ATK_PARTNER_NAME = 0xE;
export const B_TXT_ATK_NAME_WITH_PREFIX = 0xF;
export const B_TXT_DEF_NAME_WITH_PREFIX = 0x10;
export const B_TXT_EFF_NAME_WITH_PREFIX = 0x11;
export const B_TXT_ACTIVE_NAME_WITH_PREFIX = 0x12;
export const B_TXT_SCR_ACTIVE_NAME_WITH_PREFIX = 0x13;
export const B_TXT_CURRENT_MOVE = 0x14;
export const B_TXT_LAST_MOVE = 0x15;
export const B_TXT_LAST_ITEM = 0x16;
export const B_TXT_LAST_ABILITY = 0x17;
export const B_TXT_ATK_ABILITY = 0x18;
export const B_TXT_DEF_ABILITY = 0x19;
export const B_TXT_SCR_ACTIVE_ABILITY = 0x1A;
export const B_TXT_EFF_ABILITY = 0x1B;
export const B_TXT_TRAINER1_CLASS = 0x1C;
export const B_TXT_TRAINER1_NAME = 0x1D;
export const B_TXT_LINK_PLAYER_NAME = 0x1E;
export const B_TXT_LINK_PARTNER_NAME = 0x1F;
export const B_TXT_LINK_OPPONENT1_NAME = 0x20;
export const B_TXT_LINK_OPPONENT2_NAME = 0x21;
export const B_TXT_LINK_SCR_TRAINER_NAME = 0x22;
export const B_TXT_PLAYER_NAME = 0x23;
export const B_TXT_TRAINER1_LOSE_TEXT = 0x24;
export const B_TXT_TRAINER1_WIN_TEXT = 0x25;
export const B_TXT_26 = 0x26;
export const B_TXT_PC_CREATOR_NAME = 0x27;
export const B_TXT_ATK_PREFIX1 = 0x28;
export const B_TXT_DEF_PREFIX1 = 0x29;
export const B_TXT_ATK_PREFIX2 = 0x2A;
export const B_TXT_DEF_PREFIX2 = 0x2B;
export const B_TXT_ATK_PREFIX3 = 0x2C;
export const B_TXT_DEF_PREFIX3 = 0x2D;
export const B_TXT_TRAINER2_CLASS = 0x2E;
export const B_TXT_TRAINER2_NAME = 0x2F;
export const B_TXT_TRAINER2_LOSE_TEXT = 0x30;
export const B_TXT_TRAINER2_WIN_TEXT = 0x31;
export const B_TXT_PARTNER_CLASS = 0x32;
export const B_TXT_PARTNER_NAME = 0x33;
export const B_TXT_BUFF3 = 0x34;

// ─── B_BUFF_* type tags (battle_message.h:67-80) ────────────────────────────

export const B_BUFF_STRING               = 0;
export const B_BUFF_NUMBER               = 1;
export const B_BUFF_MOVE                 = 2;
export const B_BUFF_TYPE                 = 3;
export const B_BUFF_MON_NICK_WITH_PREFIX = 4;
export const B_BUFF_STAT                 = 5;
export const B_BUFF_SPECIES              = 6;
export const B_BUFF_MON_NICK             = 7;
export const B_BUFF_NEGATIVE_FLAVOR      = 8;
export const B_BUFF_ABILITY              = 9;
export const B_BUFF_ITEM                 = 10;

export const B_BUFF_PLACEHOLDER_BEGIN = 0xFD;
export const B_BUFF_EOS               = 0xFF;

// ─── EWRAM_DATA buffers (battle_main.c:137-139) — 1:1 décomp ───────────────

/** 1:1 décomp `EWRAM_DATA u8 gBattleTextBuff1[TEXT_BUFF_ARRAY_COUNT]`. */
export const gBattleTextBuff1: Uint8Array = new Uint8Array(TEXT_BUFF_ARRAY_COUNT);
/** 1:1 décomp `EWRAM_DATA u8 gBattleTextBuff2[TEXT_BUFF_ARRAY_COUNT]`. */
export const gBattleTextBuff2: Uint8Array = new Uint8Array(TEXT_BUFF_ARRAY_COUNT);
/** 1:1 décomp `EWRAM_DATA u8 gBattleTextBuff3[TEXT_BUFF_ARRAY_COUNT]`. */
export const gBattleTextBuff3: Uint8Array = new Uint8Array(TEXT_BUFF_ARRAY_COUNT);

// ─── PREPARE_*_BUFFER (battle_message.h:82-200) — 1:1 décomp ───────────────

/** 1:1 décomp `PREPARE_FLAVOR_BUFFER(textVar, flavorId)`. */
export function PREPARE_FLAVOR_BUFFER(textVar: Uint8Array, flavorId: number): void {
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_NEGATIVE_FLAVOR;
  textVar[2] = flavorId;
  textVar[3] = B_BUFF_EOS;
}

/** 1:1 décomp `PREPARE_STAT_BUFFER(textVar, statId)`. */
export function PREPARE_STAT_BUFFER(textVar: Uint8Array, statId: number): void {
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_STAT;
  textVar[2] = statId;
  textVar[3] = B_BUFF_EOS;
}

/** 1:1 décomp `PREPARE_ABILITY_BUFFER(textVar, abilityId)`. */
export function PREPARE_ABILITY_BUFFER(textVar: Uint8Array, abilityId: number): void {
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_ABILITY;
  textVar[2] = abilityId;
  textVar[3] = B_BUFF_EOS;
}

/** 1:1 décomp `PREPARE_TYPE_BUFFER(textVar, typeId)`. */
export function PREPARE_TYPE_BUFFER(textVar: Uint8Array, typeId: number): void {
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_TYPE;
  textVar[2] = typeId;
  textVar[3] = B_BUFF_EOS;
}

/** 1:1 décomp `PREPARE_BYTE_NUMBER_BUFFER(textVar, maxDigits, number)`. */
export function PREPARE_BYTE_NUMBER_BUFFER(textVar: Uint8Array, maxDigits: number, num: number): void {
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_NUMBER;
  textVar[2] = 1;
  textVar[3] = maxDigits;
  textVar[4] = num & 0xFF;
  textVar[5] = B_BUFF_EOS;
}

/** 1:1 décomp `PREPARE_HWORD_NUMBER_BUFFER(textVar, maxDigits, number)`. */
export function PREPARE_HWORD_NUMBER_BUFFER(textVar: Uint8Array, maxDigits: number, num: number): void {
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_NUMBER;
  textVar[2] = 2;
  textVar[3] = maxDigits;
  textVar[4] = num & 0xFF;
  textVar[5] = (num & 0x0000FF00) >> 8;
  textVar[6] = B_BUFF_EOS;
}

/** 1:1 décomp `PREPARE_WORD_NUMBER_BUFFER(textVar, maxDigits, number)`. */
export function PREPARE_WORD_NUMBER_BUFFER(textVar: Uint8Array, maxDigits: number, num: number): void {
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_NUMBER;
  textVar[2] = 4;
  textVar[3] = maxDigits;
  textVar[4] = num & 0xFF;
  textVar[5] = (num & 0x0000FF00) >> 8;
  textVar[6] = (num & 0x00FF0000) >> 16;
  textVar[7] = ((num >>> 24) & 0xFF);
  textVar[8] = B_BUFF_EOS;
}

/** 1:1 décomp `PREPARE_STRING_BUFFER(textVar, stringId)`. */
export function PREPARE_STRING_BUFFER(textVar: Uint8Array, stringId: number): void {
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_STRING;
  textVar[2] = stringId & 0xFF;
  textVar[3] = (stringId & 0xFF00) >> 8;
  textVar[4] = B_BUFF_EOS;
}

/** 1:1 décomp `PREPARE_MOVE_BUFFER(textVar, move)`. */
export function PREPARE_MOVE_BUFFER(textVar: Uint8Array, move: number): void {
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_MOVE;
  textVar[2] = move & 0xFF;
  textVar[3] = (move & 0xFF00) >> 8;
  textVar[4] = B_BUFF_EOS;
}

/** 1:1 décomp `PREPARE_ITEM_BUFFER(textVar, item)`. */
export function PREPARE_ITEM_BUFFER(textVar: Uint8Array, item: number): void {
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_ITEM;
  textVar[2] = item & 0xFF;
  textVar[3] = (item & 0xFF00) >> 8;
  textVar[4] = B_BUFF_EOS;
}

/** 1:1 décomp `PREPARE_SPECIES_BUFFER(textVar, species)`. */
export function PREPARE_SPECIES_BUFFER(textVar: Uint8Array, species: number): void {
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_SPECIES;
  textVar[2] = species & 0xFF;
  textVar[3] = (species & 0xFF00) >> 8;
  textVar[4] = B_BUFF_EOS;
}

/** 1:1 décomp `PREPARE_MON_NICK_WITH_PREFIX_BUFFER(textVar, battler, partyId)`. */
export function PREPARE_MON_NICK_WITH_PREFIX_BUFFER(
  textVar: Uint8Array, battler: number, partyId: number,
): void {
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_MON_NICK_WITH_PREFIX;
  textVar[2] = battler;
  textVar[3] = partyId;
  textVar[4] = B_BUFF_EOS;
}

/** 1:1 décomp `PREPARE_MON_NICK_BUFFER(textVar, battler, partyId)`. */
export function PREPARE_MON_NICK_BUFFER(
  textVar: Uint8Array, battler: number, partyId: number,
): void {
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_MON_NICK;
  textVar[2] = battler;
  textVar[3] = partyId;
  textVar[4] = B_BUFF_EOS;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Clear le buffer (= reset à 0 tous les bytes). Utilisé pour debug. */
export function clearTextBuffer(buf: Uint8Array): void {
  buf.fill(0);
}
