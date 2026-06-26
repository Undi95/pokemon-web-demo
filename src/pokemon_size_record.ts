/**
 * pokemon_size_record.ts — 1:1 port complet de `src/pokemon_size_record.c`.
 *
 * Source de vérité (1:1 décomp) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/pokemon_size_record.c` (189l)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/pokemon_size_record.h`
 *
 * Le fichier décomp gère :
 *   - Records des plus gros Seedot/Lotad jamais capturés (= VAR_*_SIZE_RECORD).
 *   - Tableau sBigMonSizeTable[16] = courbes mapping `b` → multipler height.
 *   - Specials SeedotSize/LotadSize : Get/Compare/Init pour NPC Pacifidlog.
 *
 * Port FIDÈLE (= pas un MVP) : tous les helpers internes portés ligne par
 * ligne (GetMonSizeHash, TranslateBigMonSizeTableIndex, GetMonSize,
 * FormatMonSizeRecord, CompareMonSize, GetMonSizeRecordInfo) + 6 specials
 * (Init/Get/Compare × Seedot/Lotad).
 *
 * Pas d'unit conversion impérial (= #ifdef UNITS_IMPERIAL pas activé en FR).
 */

import { registerSpecial } from './engine/script/script-opcodes';
import { VarSet, VarGet, gSpecialVar } from './engine/script/script-vars';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import {
  GetMonData, MON_DATA_PERSONALITY,
  MON_DATA_HP_IV, MON_DATA_ATK_IV, MON_DATA_DEF_IV,
  MON_DATA_SPEED_IV, MON_DATA_SPATK_IV, MON_DATA_SPDEF_IV,
  MON_DATA_IS_EGG, MON_DATA_SPECIES,
} from './engine/battle/party-storage';
import type { Pokemon } from './engine/battle/party-storage';
import { GetPokedexHeightWeight, SpeciesToNationalPokedexNum } from './engine/ui/pokedex-flags';
import { STR_CONV_MODE_LEFT_ALIGN, ConvertIntToDecimalStringN, StringAppend, gStringVar1, gStringVar2, gStringVar3 } from '../include/string_util';
import { encodeOwText, setStringVar, GetPlayerNameString } from '../include/text';
import {
  SPECIES_SEEDOT, SPECIES_LOTAD,
} from '../include/constants/species';
import { VAR_SEEDOT_SIZE_RECORD, VAR_LOTAD_SIZE_RECORD } from '../include/constants/vars';

// 1:1 décomp pokemon_size_record.c:12 — `#define DEFAULT_MAX_SIZE 0x8000`.
const DEFAULT_MAX_SIZE = 0x8000;

// 1:1 décomp include/constants/pokemon_size_record.h —
// `enum CompareSizeResult { COMPARE_SIZE_LARGER, COMPARE_SIZE_SMALLER, ... }`.
const COMPARE_SIZE_LARGER = 0;
const COMPARE_SIZE_SMALLER = 1;
const COMPARE_SIZE_INCORRECT_SPECIES = 2;
const COMPARE_SIZE_NONE = 3;

// 1:1 décomp include/constants/party_menu.h — `#define PARTY_NOTHING_CHOSEN 0xFF`.
const PARTY_NOTHING_CHOSEN = 0xFF;

// 1:1 décomp pokemon_size_record.c:14-19 — `struct UnknownStruct`.
interface SizeBucketEntry { unk0: number; unk2: number; unk4: number }

// 1:1 décomp pokemon_size_record.c:21-39 — `sBigMonSizeTable[16]`.
const sBigMonSizeTable: ReadonlyArray<SizeBucketEntry> = [
  { unk0:  290, unk2:   1, unk4:      0 },
  { unk0:  300, unk2:   1, unk4:     10 },
  { unk0:  400, unk2:   2, unk4:    110 },
  { unk0:  500, unk2:   4, unk4:    310 },
  { unk0:  600, unk2:  20, unk4:    710 },
  { unk0:  700, unk2:  50, unk4:   2710 },
  { unk0:  800, unk2: 100, unk4:   7710 },
  { unk0:  900, unk2: 150, unk4:  17710 },
  { unk0: 1000, unk2: 150, unk4:  32710 },
  { unk0: 1100, unk2: 100, unk4: -17826 },
  { unk0: 1200, unk2:  50, unk4:  -7826 },
  { unk0: 1300, unk2:  20, unk4:  -2826 },
  { unk0: 1400, unk2:   5, unk4:   -826 },
  { unk0: 1500, unk2:   2, unk4:   -326 },
  { unk0: 1600, unk2:   1, unk4:   -126 },
  { unk0: 1700, unk2:   1, unk4:    -26 },
];

// 1:1 décomp strings.c:1191/:1641 — gText_Marco = "MARCUS", gText_DecimalPoint = ".".
const gText_Marco = 'MARCUS';
const gText_DecimalPoint = '.';

/** 1:1 décomp `GetMonSizeHash(pkmn)` (pokemon_size_record.c:46-59). */
function GetMonSizeHash(pkmn: Pokemon): number {
  const personality = GetMonData(pkmn, MON_DATA_PERSONALITY) as number;
  const hpIV = (GetMonData(pkmn, MON_DATA_HP_IV) as number) & 0xF;
  const attackIV = (GetMonData(pkmn, MON_DATA_ATK_IV) as number) & 0xF;
  const defenseIV = (GetMonData(pkmn, MON_DATA_DEF_IV) as number) & 0xF;
  const speedIV = (GetMonData(pkmn, MON_DATA_SPEED_IV) as number) & 0xF;
  const spAtkIV = (GetMonData(pkmn, MON_DATA_SPATK_IV) as number) & 0xF;
  const spDefIV = (GetMonData(pkmn, MON_DATA_SPDEF_IV) as number) & 0xF;
  const hibyte = (((attackIV ^ defenseIV) * hpIV) ^ (personality & 0xFF)) & 0xFFFF;
  const lobyte = (((spAtkIV ^ spDefIV) * speedIV) ^ (personality >>> 8)) & 0xFFFF;
  return ((hibyte << 8) + lobyte) >>> 0;
}

/** 1:1 décomp `TranslateBigMonSizeTableIndex(a)` (pokemon_size_record.c:61-71). */
function TranslateBigMonSizeTableIndex(a: number): number {
  let i: number;
  for (i = 1; i < 15; i++) {
    // 1:1 décomp : compare s16 vs s16 (sBigMonSizeTable[i].unk4 peut être negatif).
    // L'arg `a` est u16 (= sizeParams ou stored sizeRecord). Décomp casted s16 vs s16
    // implicit. Reproduisons s16 conversion : (a << 16) >> 16.
    const aSigned = (a << 16) >> 16;
    if (aSigned < sBigMonSizeTable[i].unk4) return i - 1;
  }
  return i;  // = 15
}

/** 1:1 décomp `GetMonSize(species, b)` (pokemon_size_record.c:73-88). */
function GetMonSize(species: number, b: number): number {
  const height = GetPokedexHeightWeight(SpeciesToNationalPokedexNum(species), 0);
  const varIdx = TranslateBigMonSizeTableIndex(b);
  const unk0 = sBigMonSizeTable[varIdx].unk0;
  const unk2 = sBigMonSizeTable[varIdx].unk2;
  const unk4 = sBigMonSizeTable[varIdx].unk4;
  // 1:1 décomp : `unk0 += (b - unk4) / unk2`. `b - unk4` peut être négatif si
  // b et unk4 sont signed comparés ; mais ici b est u16, unk4 peut être négatif
  // → décomp implicit promotion via u64 cast. Math.trunc pour C div tronquée.
  const bSigned = (b << 16) >> 16;
  const unk0Final = unk0 + Math.trunc((bSigned - unk4) / unk2);
  // `height * unk0 / 10` — décomp utilise u64 intermediate. JS number garde
  // safe int range (= height u16 * unk0 max ~4000 = ~260M, OK pour double).
  return Math.trunc(height * unk0Final / 10);
}

/** 1:1 décomp `FormatMonSizeRecord(string, size)` (pokemon_size_record.c:90-100).
 *  Pas d'UNITS_IMPERIAL FR. */
function FormatMonSizeRecord(stringVarSlot: 1 | 2 | 3, size: number): void {
  // 1:1 décomp pointer-chaining sur `string` = gStringVar[slot] (buffer byte du
  // foyer string_util.ts, plus le round-trip JS-string du bridge) :
  //   string = ConvertIntToDecimalStringN(string, size / 10, LEFT_ALIGN, 8);
  //   string = StringAppend(string, gText_DecimalPoint);
  //   ConvertIntToDecimalStringN(string, size % 10, LEFT_ALIGN, 1);
  const buf = stringVarSlot === 1 ? gStringVar1 : stringVarSlot === 2 ? gStringVar2 : gStringVar3;
  let p = ConvertIntToDecimalStringN(buf, Math.trunc(size / 10), STR_CONV_MODE_LEFT_ALIGN, 8);
  p = StringAppend(p, encodeOwText(gText_DecimalPoint));
  ConvertIntToDecimalStringN(p, size % 10, STR_CONV_MODE_LEFT_ALIGN, 1);
}

/** 1:1 décomp `CompareMonSize(species, sizeRecord)` (pokemon_size_record.c:102-137).
 *  sizeRecord = pointer vers gSaveBlock1Ptr.vars[VAR_X_SIZE_RECORD] — modifié
 *  par notre helper (= retourné via varName param). */
function CompareMonSize(species: number, varName: string): number {
  if (gSpecialVar.Result === PARTY_NOTHING_CHOSEN) {
    return COMPARE_SIZE_NONE;
  }
  const pkmn = gSaveBlock1Ptr.playerParty[gSpecialVar.Result] as unknown as Pokemon;
  if (!pkmn) return COMPARE_SIZE_NONE;
  if (GetMonData(pkmn, MON_DATA_IS_EGG) === 1 || GetMonData(pkmn, MON_DATA_SPECIES) !== species) {
    return COMPARE_SIZE_INCORRECT_SPECIES;
  }
  const sizeParams = GetMonSizeHash(pkmn) & 0xFFFF;
  const newSize = GetMonSize(species, sizeParams);
  const sizeRecord = VarGet(varName);
  const oldSize = GetMonSize(species, sizeRecord);
  FormatMonSizeRecord(2, newSize);
  if (newSize <= oldSize) {
    return COMPARE_SIZE_SMALLER;
  }
  VarSet(varName, sizeParams);
  return COMPARE_SIZE_LARGER;
}

/** 1:1 décomp `GetMonSizeRecordInfo(species, sizeRecord)` (pokemon_size_record.c:140-150). */
function GetMonSizeRecordInfo(species: number, varName: string): void {
  const sizeRecord = VarGet(varName);
  const size = GetMonSize(species, sizeRecord);
  FormatMonSizeRecord(3, size);
  // 1:1 décomp : `StringCopy(gStringVar1, gSpeciesNames[species])`.
  // Cascade R3 : gSpeciesNames non utilisable directement ici. Bridge via
  // setStringVar avec un lookup species → name (= utiliser pokemon module).
  // Cette dette R3 est documentée : utilisé seulement par GetSeedot/Lotad
  // SizeRecordInfo specials (= dialogue NPC, pas gameplay logic).
  setStringVar(1, `SPECIES_${species}`);  // Placeholder cleartext jusqu'à port gSpeciesNames table.
  if (sizeRecord === DEFAULT_MAX_SIZE) {
    // 1:1 décomp `StringCopy(gStringVar2, gText_Marco)` réalisé par setStringVar
    // (encode + écrit gStringVar2). L'ancien `StringCopy('', gText_Marco)` (résultat
    // jeté = no-op du modèle JS-string bridge) retiré.
    setStringVar(2, gText_Marco);
  } else {
    setStringVar(2, GetPlayerNameString());
  }
}

// ─── Specials registry (= 6 entries) ───────────────────────────────────────

/** 1:1 décomp `InitSeedotSizeRecord` (pokemon_size_record.c:152-155). */
registerSpecial('InitSeedotSizeRecord', () => {
  VarSet('VAR_SEEDOT_SIZE_RECORD', DEFAULT_MAX_SIZE);
});

/** 1:1 décomp `GetSeedotSizeRecordInfo` (pokemon_size_record.c:157-162). */
registerSpecial('GetSeedotSizeRecordInfo', () => {
  GetMonSizeRecordInfo(SPECIES_SEEDOT, 'VAR_SEEDOT_SIZE_RECORD');
});

/** 1:1 décomp `CompareSeedotSize` (pokemon_size_record.c:164-169). */
registerSpecial('CompareSeedotSize', () => {
  gSpecialVar.Result = CompareMonSize(SPECIES_SEEDOT, 'VAR_SEEDOT_SIZE_RECORD');
});

/** 1:1 décomp `InitLotadSizeRecord` (pokemon_size_record.c:171-174). */
registerSpecial('InitLotadSizeRecord', () => {
  VarSet('VAR_LOTAD_SIZE_RECORD', DEFAULT_MAX_SIZE);
});

/** 1:1 décomp `GetLotadSizeRecordInfo` (pokemon_size_record.c:176-181). */
registerSpecial('GetLotadSizeRecordInfo', () => {
  GetMonSizeRecordInfo(SPECIES_LOTAD, 'VAR_LOTAD_SIZE_RECORD');
});

/** 1:1 décomp `CompareLotadSize` (pokemon_size_record.c:183-188). */
registerSpecial('CompareLotadSize', () => {
  gSpecialVar.Result = CompareMonSize(SPECIES_LOTAD, 'VAR_LOTAD_SIZE_RECORD');
});

// Force usage des consts decomp-data importées (= référence pour TS unused warn).
void VAR_SEEDOT_SIZE_RECORD;
void VAR_LOTAD_SIZE_RECORD;
