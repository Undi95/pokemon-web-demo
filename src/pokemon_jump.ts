/**
 * pokemon_jump.ts — miroir 1:1 PARTIEL de `src/pokemon_jump.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/pokemon_jump.c`.
 *
 * Ce module ne porte que la TRANCHE « éligibilité d'espèce » du mini-jeu Pokémon
 * Jump (le reste — boucle de jeu, GFX, link multijoueur — est un gros sous-système
 * déféré) :
 *   - `sPokeJumpMons` : table des 100 espèces autorisées (≤ 28 pouces, ne faisant pas
 *     QUE nager/creuser/voler) + leur jumpType ;
 *   - `GetPokemonJumpSpeciesIdx` / `IsSpeciesAllowedInPokemonJump` ;
 *   - `IsPokemonJumpSpeciesInParty` (special, pose VAR_RESULT) — appelé par le NPC qui
 *     vérifie l'éligibilité avant de lancer le jeu ; `IsSpeciesAllowedInPokemonJump`
 *     sert aussi au filtre de sélection du party menu (party_menu.c:1963).
 *
 *  Espèces résolues (noms décomp → numéros) en lazy via resolveDecompConstant.
 *  jumpType porté pour fidélité de la table (consommé par le mini-jeu déféré).
 */

import {
  gPlayerParty,
  GetMonData,
  MON_DATA_SANITY_HAS_SPECIES,
  MON_DATA_SPECIES_OR_EGG,
  PARTY_SIZE,
} from './engine/battle/party-storage';
import { VarSet } from './engine/script/script-vars';
import { resolveDecompConstant } from '../harness/runtime/decomp-constants';

// 1:1 décomp enum (pokemon_jump.c:61-64) : NORMAL=0, FAST=1, SLOW=2.
const JUMP_TYPE_NORMAL = 0;
const JUMP_TYPE_FAST = 1;
const JUMP_TYPE_SLOW = 2;

interface PokemonJumpMons { species: string; jumpType: number; }

/** 1:1 décomp `sPokeJumpMons[]` (pokemon_jump.c:429) — 100 espèces. */
const sPokeJumpMons: ReadonlyArray<PokemonJumpMons> = [
  { species: 'SPECIES_BULBASAUR', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_CHARMANDER', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_SQUIRTLE', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_CATERPIE', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_METAPOD', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_WEEDLE', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_KAKUNA', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_RATTATA', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_RATICATE', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_PIKACHU', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_SANDSHREW', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_NIDORAN_F', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_NIDORAN_M', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_CLEFAIRY', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_VULPIX', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_JIGGLYPUFF', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_ODDISH', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_PARAS', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_MEOWTH', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_PSYDUCK', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_MANKEY', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_GROWLITHE', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_POLIWAG', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_BELLSPROUT', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_SHELLDER', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_KRABBY', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_EXEGGCUTE', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_CUBONE', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_DITTO', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_EEVEE', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_OMANYTE', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_KABUTO', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_CHIKORITA', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_CYNDAQUIL', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_TOTODILE', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_SPINARAK', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_PICHU', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_CLEFFA', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_IGGLYBUFF', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_TOGEPI', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_MAREEP', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_BELLOSSOM', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_MARILL', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_SUNKERN', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_WOOPER', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_PINECO', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_SNUBBULL', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_SHUCKLE', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_TEDDIURSA', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_SLUGMA', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_SWINUB', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_HOUNDOUR', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_PHANPY', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_PORYGON2', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_TYROGUE', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_SMOOCHUM', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_ELEKID', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_MAGBY', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_LARVITAR', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_TREECKO', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_TORCHIC', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_MUDKIP', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_MARSHTOMP', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_POOCHYENA', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_ZIGZAGOON', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_LINOONE', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_WURMPLE', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_SILCOON', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_CASCOON', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_LOTAD', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_SEEDOT', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_RALTS', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_KIRLIA', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_SURSKIT', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_SHROOMISH', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_NINCADA', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_WHISMUR', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_AZURILL', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_SKITTY', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_SABLEYE', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_MAWILE', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_ARON', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_MEDITITE', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_ELECTRIKE', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_PLUSLE', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_MINUN', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_VOLBEAT', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_ILLUMISE', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_ROSELIA', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_GULPIN', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_NUMEL', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_TORKOAL', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_SPOINK', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_TRAPINCH', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_CACNEA', jumpType: JUMP_TYPE_SLOW },
  { species: 'SPECIES_ANORITH', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_WYNAUT', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_SNORUNT', jumpType: JUMP_TYPE_NORMAL },
  { species: 'SPECIES_CLAMPERL', jumpType: JUMP_TYPE_FAST },
  { species: 'SPECIES_BAGON', jumpType: JUMP_TYPE_FAST },
];

// Résolution lazy noms d'espèces → numéros (table ordonnée), pour le lookup par
// numéro. (resolveDecompConstant chargé au boot ; -1 si un nom ne résout pas.)
let _resolvedSpecies: number[] | null = null;
function _getResolvedSpecies(): number[] {
  if (_resolvedSpecies === null) {
    _resolvedSpecies = sPokeJumpMons.map((m) => {
      const v = resolveDecompConstant(m.species);
      return typeof v === 'number' ? v : -1;
    });
  }
  return _resolvedSpecies;
}

/** 1:1 décomp `GetPokemonJumpSpeciesIdx(species)` (pokemon_jump.c:645) : index dans
 *  sPokeJumpMons, ou -1 si l'espèce n'est pas autorisée. */
function GetPokemonJumpSpeciesIdx(species: number): number {
  const resolved = _getResolvedSpecies();
  for (let i = 0; i < resolved.length; i++) {
    if (resolved[i] === species) return i;
  }
  return -1;
}

/** 1:1 décomp `IsSpeciesAllowedInPokemonJump(species)` (pokemon_jump.c:2345). */
export function IsSpeciesAllowedInPokemonJump(species: number): boolean {
  return GetPokemonJumpSpeciesIdx(species) > -1;
}

/** 1:1 décomp `IsPokemonJumpSpeciesInParty(void)` (pokemon_jump.c:2350) : pose
 *  gSpecialVar_Result = TRUE si un mon du party a une espèce autorisée, sinon FALSE. */
export function IsPokemonJumpSpeciesInParty(): void {
  for (let i = 0; i < PARTY_SIZE; i++) {
    if (GetMonData(gPlayerParty[i], MON_DATA_SANITY_HAS_SPECIES)) {
      const species = GetMonData(gPlayerParty[i], MON_DATA_SPECIES_OR_EGG) as number;
      if (IsSpeciesAllowedInPokemonJump(species)) {
        VarSet('VAR_RESULT', 1 /* TRUE */);
        return;
      }
    }
  }
  VarSet('VAR_RESULT', 0 /* FALSE */);
}

// Hook globalThis (cycle-safe) consommé par le special IsPokemonJumpSpeciesInParty.
{
  const _g = globalThis as Record<string, unknown>;
  _g.__IsPokemonJumpSpeciesInParty = IsPokemonJumpSpeciesInParty;
  _g.__IsSpeciesAllowedInPokemonJump = IsSpeciesAllowedInPokemonJump;
}

// ─── Seeding new-game (ResetMiniGamesRecords, new_game.c:213) ────────────────

import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import type { PokemonJumpRecords } from './engine/save/save-blocks';

/** 1:1 décomp `static struct PokemonJumpRecords *GetPokeJumpRecords(void)`
 *  (pokemon_jump.c) : return &gSaveBlock2Ptr->pokeJump. */
function GetPokeJumpRecords(): PokemonJumpRecords {
  return gSaveBlock2Ptr.pokeJump;
}

/** 1:1 décomp `void ResetPokemonJumpRecords(void)` (pokemon_jump.c:4098-4107). */
export function ResetPokemonJumpRecords(): void {
  const records = GetPokeJumpRecords();
  records.jumpsInRow = 0;
  records.bestJumpScore = 0;
  records.excellentsInRow = 0;
  records.gamesWithMaxPlayers = 0;
  records.unused2 = 0;
  records.unused1 = 0;
}
