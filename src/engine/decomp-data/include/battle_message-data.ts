// AUTO-GENERATED from include/battle_message.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/battle_message.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `max(16, \` */
export const TEXT_BUFF_ARRAY_COUNT_EXPR = "max(16, \\";
export const B_TXT_BUFF1 = 0;
export const B_TXT_BUFF2 = 1;
export const B_TXT_COPY_VAR_1 = 2;
export const B_TXT_COPY_VAR_2 = 3;
export const B_TXT_COPY_VAR_3 = 4;
export const B_TXT_PLAYER_MON1_NAME = 5;
export const B_TXT_OPPONENT_MON1_NAME = 6;
export const B_TXT_PLAYER_MON2_NAME = 7;
export const B_TXT_OPPONENT_MON2_NAME = 8;
export const B_TXT_LINK_PLAYER_MON1_NAME = 9;
export const B_TXT_LINK_OPPONENT_MON1_NAME = 10;
export const B_TXT_LINK_PLAYER_MON2_NAME = 11;
export const B_TXT_LINK_OPPONENT_MON2_NAME = 12;
export const B_TXT_ATK_NAME_WITH_PREFIX_MON1 = 13;
export const B_TXT_ATK_PARTNER_NAME = 14;
export const B_TXT_ATK_NAME_WITH_PREFIX = 15;
export const B_TXT_DEF_NAME_WITH_PREFIX = 16;
export const B_TXT_EFF_NAME_WITH_PREFIX = 17;
export const B_TXT_ACTIVE_NAME_WITH_PREFIX = 18;
export const B_TXT_SCR_ACTIVE_NAME_WITH_PREFIX = 19;
export const B_TXT_CURRENT_MOVE = 20;
export const B_TXT_LAST_MOVE = 21;
export const B_TXT_LAST_ITEM = 22;
export const B_TXT_LAST_ABILITY = 23;
export const B_TXT_ATK_ABILITY = 24;
export const B_TXT_DEF_ABILITY = 25;
export const B_TXT_SCR_ACTIVE_ABILITY = 26;
export const B_TXT_EFF_ABILITY = 27;
export const B_TXT_TRAINER1_CLASS = 28;
export const B_TXT_TRAINER1_NAME = 29;
export const B_TXT_LINK_PLAYER_NAME = 30;
export const B_TXT_LINK_PARTNER_NAME = 31;
export const B_TXT_LINK_OPPONENT1_NAME = 32;
export const B_TXT_LINK_OPPONENT2_NAME = 33;
export const B_TXT_LINK_SCR_TRAINER_NAME = 34;
export const B_TXT_PLAYER_NAME = 35;
export const B_TXT_TRAINER1_LOSE_TEXT = 36;
export const B_TXT_TRAINER1_WIN_TEXT = 37;
export const B_TXT_26 = 38;
export const B_TXT_PC_CREATOR_NAME = 39;
export const B_TXT_ATK_PREFIX1 = 40;
export const B_TXT_DEF_PREFIX1 = 41;
export const B_TXT_ATK_PREFIX2 = 42;
export const B_TXT_DEF_PREFIX2 = 43;
export const B_TXT_ATK_PREFIX3 = 44;
export const B_TXT_DEF_PREFIX3 = 45;
export const B_TXT_TRAINER2_CLASS = 46;
export const B_TXT_TRAINER2_NAME = 47;
export const B_TXT_TRAINER2_LOSE_TEXT = 48;
export const B_TXT_TRAINER2_WIN_TEXT = 49;
export const B_TXT_PARTNER_CLASS = 50;
export const B_TXT_PARTNER_NAME = 51;
export const B_TXT_BUFF3 = 52;
export const B_BUFF_STRING = 0;
export const B_BUFF_NUMBER = 1;
export const B_BUFF_MOVE = 2;
export const B_BUFF_TYPE = 3;
export const B_BUFF_MON_NICK_WITH_PREFIX = 4;
export const B_BUFF_STAT = 5;
export const B_BUFF_SPECIES = 6;
export const B_BUFF_MON_NICK = 7;
export const B_BUFF_NEGATIVE_FLAVOR = 8;
export const B_BUFF_ABILITY = 9;
export const B_BUFF_ITEM = 10;
export const B_BUFF_PLACEHOLDER_BEGIN = 253;
export const B_BUFF_EOS = 255;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'BufferStringBattle', ret: "void", arity: 1, params: "u16 stringID" },
  { name: 'BattleStringExpandPlaceholdersToDisplayedString', ret: "u32", arity: 1, params: "const u8 *src" },
  { name: 'BattleStringExpandPlaceholders', ret: "u32", arity: 2, params: "const u8 *src, u8 *dst" },
  { name: 'BattlePutTextOnWindow', ret: "void", arity: 2, params: "const u8 *text, u8 windowId" },
  { name: 'SetPpNumbersPaletteInMoveSelection', ret: "void", arity: 0, params: "void" },
  { name: 'GetCurrentPpToMaxPpState', ret: "u8", arity: 2, params: "u8 currentPp, u8 maxPp" },
] as const;
