/**
 * include/constants/sound.ts — miroir 1:1 de include/constants/sound.h.
 */

export const FANFARE_LEVEL_UP = 0;
export const FANFARE_OBTAIN_ITEM = 1;
export const FANFARE_EVOLVED = 2;
export const FANFARE_OBTAIN_TMHM = 3;
export const FANFARE_HEAL = 4;
export const FANFARE_OBTAIN_BADGE = 5;
export const FANFARE_MOVE_DELETED = 6;
export const FANFARE_OBTAIN_BERRY = 7;
export const FANFARE_AWAKEN_LEGEND = 8;
export const FANFARE_SLOTS_JACKPOT = 9;
export const FANFARE_SLOTS_WIN = 10;
export const FANFARE_TOO_BAD = 11;
export const FANFARE_RG_POKE_FLUTE = 12;
export const FANFARE_RG_OBTAIN_KEY_ITEM = 13;
export const FANFARE_RG_DEX_RATING = 14;
export const FANFARE_OBTAIN_B_POINTS = 15;
export const FANFARE_OBTAIN_SYMBOL = 16;
export const FANFARE_REGISTER_MATCH_CALL = 17;

export const CRY_MODE_NORMAL = 0; // Default
export const CRY_MODE_DOUBLES = 1; // Shortened cry for double battles
export const CRY_MODE_ENCOUNTER = 2; // Used when starting a static encounter, or when a Pokémon is "aggressive"
export const CRY_MODE_HIGH_PITCH = 3; // Highest pitch mode, used exclusively by the move Howl
export const CRY_MODE_ECHO_START = 4; // For 1st half of cry used by the move Hyper Voice. Played in reverse
export const CRY_MODE_FAINT = 5; // Used when a Pokémon faints
export const CRY_MODE_ECHO_END = 6; // For 2nd half of cry used by the move Hyper Voice
export const CRY_MODE_ROAR_1 = 7; // For 1st cry used by the move Roar
export const CRY_MODE_ROAR_2 = 8; // For 2nd cry used by the move Roar
export const CRY_MODE_GROWL_1 = 9; // For 1st cry used by the move Growl. Played in reverse
export const CRY_MODE_GROWL_2 = 10; // For 2nd cry used by the move Growl
export const CRY_MODE_WEAK = 11; // Used when a Pokémon is unhealthy
export const CRY_MODE_WEAK_DOUBLES = 12; // Equivalent to CRY_MODE_DOUBLES for CRY_MODE_WEAK

// Given to SoundTask_PlayDoubleCry to determine which cry mode to use. Values are arbitrary
export const DOUBLE_CRY_ROAR = 2;
export const DOUBLE_CRY_GROWL = 255;

export const CRY_PRIORITY_NORMAL = 10;
export const CRY_PRIORITY_AMBIENT = 1;

// Cry volume was changed from 125 in R/S to 120 for FRLG/Em, but was (accidentally?) not updated outside of sound.c
export const CRY_VOLUME = 120;
export const CRY_VOLUME_RS = 125;
