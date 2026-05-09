/**
 * Représentation runtime d'un Pokémon dans la party / les combats.
 *
 * On utilise @pkmn/dex pour lookup les base stats et les moves canoniques EN
 * (que @pkmn/sim consomme pour les combats). Les noms FR viennent de
 * `text-tables.json` via `data-tables.ts`.
 *
 * Pour MVP Vague 3 : struct simple, calc HP via formule Gen 3, moves choisis
 * "manuellement" depuis le learnset jusqu'au level. Évolutions / EXP / EVs /
 * IVs randomisés = TODO Vague suivante.
 */
import { Dex } from '@pkmn/dex';
import {
  getSpeciesId, getMoveId, getSpeciesNameFr, getMoveNameFr,
} from './data-tables';
import { Random } from './random';

/** Convertit `SPECIES_TREECKO` → `treecko` (id format @pkmn/dex). */
export function speciesEnumToDexId(speciesEnum: string): string {
  return speciesEnum.replace(/^SPECIES_/, '').toLowerCase().replace(/_/g, '');
}
export function moveEnumToDexId(moveEnum: string): string {
  return moveEnum.replace(/^MOVE_/, '').toLowerCase().replace(/_/g, '');
}
export function itemEnumToDexId(itemEnum: string): string {
  return itemEnum.replace(/^ITEM_/, '').toLowerCase().replace(/_/g, '');
}

export interface StatSpread {
  hp: number; atk: number; def: number; spa: number; spd: number; spe: number;
}

export interface PokemonInstance {
  /** Enum décomp ex. "SPECIES_TREECKO" */
  speciesEnum: string;
  /** Pokédex ID (1..386 pour Gen 3) */
  speciesId: number;
  /** Nom canonique EN pour @pkmn/sim ex. "Treecko" */
  speciesName: string;
  /** Nom FR ex. "ARCKO" */
  speciesNameFr: string;
  /** Nickname (par défaut = speciesNameFr) */
  nickname: string;
  level: number;
  currentHp: number;
  maxHp: number;
  /** 4 moves max — chaque move : id @pkmn/dex (ex. "tackle") + nom FR + PP */
  moves: Array<{ id: string; nameFr: string; pp: number; ppMax: number }>;
  ability: string;        // EN canonique
  heldItem: string;       // EN canonique ou "" si rien
  nature: string;         // EN canonique ex. "Hardy"
  ivs: StatSpread;
  evs: StatSpread;
  status?: 'PSN' | 'PAR' | 'BRN' | 'SLP' | 'FRZ' | 'TOX' | null;
  /** Session 124 : EXP cumul (= 1:1 décomp `MON_DATA_EXP`).
   *  Total XP accumulated since lvl 1. Initialized via `getExperienceForLevel`
   *  pour ce growthRate × level au create. Optional pour back-compat saves. */
  currentExp?: number;
  /** Growth rate (= 1:1 décomp `gSpeciesInfo[species].growthRate`).
   *  GROWTH_MEDIUM_FAST / FAST / MEDIUM_SLOW / SLOW / ERRATIC / FLUCTUATING.
   *  Cached at create pour éviter lookup species à chaque check level-up. */
  growthRate?: string;
}

const ZERO_STATS: StatSpread = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

/** 1:1 décomp `CreateBoxMon` (pokemon.c) : IVs computed from 2 Random() calls.
 *  Chaque Random() = u16 → 3 slices de 5-bit = 3 IVs. Total 2 Random()s = 6 IVs.
 *
 *  Décomp pseudocode :
 *    value = Random();
 *    iv = value & 0x1F;            (HP_IV)
 *    iv = (value >> 5) & 0x1F;     (ATK_IV)
 *    iv = (value >> 10) & 0x1F;    (DEF_IV)
 *    value = Random();
 *    iv = value & 0x1F;            (SPEED_IV)
 *    iv = (value >> 5) & 0x1F;     (SPATK_IV)
 *    iv = (value >> 10) & 0x1F;    (SPDEF_IV)
 *
 *  Notre struct StatSpread = hp/atk/def/spa/spd/spe (= notation Smogon).
 *  Mapping decomp -> notre struct :
 *    decomp HP    -> our hp
 *    decomp ATK   -> our atk
 *    decomp DEF   -> our def
 *    decomp SPEED -> our spe   (4eme decomp, 6eme notre struct)
 *    decomp SPATK -> our spa   (5eme decomp, 4eme notre struct)
 *    decomp SPDEF -> our spd   (6eme decomp, 5eme notre struct) */
function randomIVs(): StatSpread {
  const v1 = Random();
  const hp  =  v1        & 0x1F;
  const atk = (v1 >>  5) & 0x1F;
  const def = (v1 >> 10) & 0x1F;
  const v2 = Random();
  const spe =  v2        & 0x1F;  // decomp SPEED
  const spa = (v2 >>  5) & 0x1F;  // decomp SPATK
  const spd = (v2 >> 10) & 0x1F;  // decomp SPDEF
  return { hp, atk, def, spa, spd, spe };
}

/** Formule HP Gen 3 : ((2*base + iv + ev/4) * level / 100) + level + 10 */
function calcHp(base: number, iv: number, ev: number, level: number): number {
  return Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100) + level + 10;
}

/**
 * Sélectionne les 4 derniers moves de level-up pour ce species jusqu'au level.
 * Format @pkmn/dex learnset : `{ tackle: ['3L1', '4L1'], leer: ['3L1'], ... }`
 * où "3L1" = Gen 3 Level 1.
 */
function pickLevelUpMoves(speciesDexId: string, level: number): string[] {
  try {
    const species = Dex.species.get(speciesDexId);
    // @pkmn/dex learnsets sont async dans certaines versions. On fallback sur basics.
    const learnset = (Dex.species as unknown as { learnsets?: { get: (s: string) => { learnset?: Record<string, string[]> } } })
      .learnsets?.get(species.id);
    if (learnset?.learnset) {
      const acquired: Array<{ id: string; lvl: number }> = [];
      for (const [moveId, sources] of Object.entries(learnset.learnset)) {
        for (const src of sources) {
          // ex. "3L1" "3L7" — on prend la 1ère gen 3 level-up
          const m = src.match(/^3L(\d+)$/);
          if (m) {
            const lvl = Number(m[1]);
            if (lvl <= level) { acquired.push({ id: moveId, lvl }); break; }
          }
        }
      }
      acquired.sort((a, b) => b.lvl - a.lvl);
      return acquired.slice(0, 4).map(x => x.id);
    }
  } catch { /* fallback ci-dessous */ }
  // Fallback : moves universels
  return ['tackle', 'growl'];
}

/** Crée une instance Pokémon prête à être ajoutée à la party. */
export function createPokemonInstance(speciesEnum: string, level: number, opts?: {
  moves?: string[]; nickname?: string; nature?: string; ivs?: StatSpread; evs?: StatSpread;
  ability?: string; heldItem?: string;
}): PokemonInstance {
  const speciesId = getSpeciesId(speciesEnum) || 1; // fallback bulbasaur
  const dexId = speciesEnumToDexId(speciesEnum) || 'bulbasaur';
  const species = Dex.species.get(dexId);
  const speciesName = species.name;
  const speciesNameFr = getSpeciesNameFr(speciesEnum);
  const ivs = opts?.ivs ?? randomIVs();
  const evs = opts?.evs ?? ZERO_STATS;
  const baseHp = species.baseStats?.hp ?? 50;
  const maxHp = calcHp(baseHp, ivs.hp, evs.hp, level);
  const moveIds = opts?.moves ?? pickLevelUpMoves(dexId, level);
  const moves = moveIds.slice(0, 4).map(id => {
    const mv = Dex.moves.get(id);
    return {
      id: mv.id || id,
      nameFr: getMoveNameFr('MOVE_' + id.toUpperCase()) || mv.name || id,
      pp: mv.pp ?? 30,
      ppMax: mv.pp ?? 30,
    };
  });
  const ability = opts?.ability ?? (species.abilities?.[0] || '');
  // Session 124 : EXP/growth init via species data + experienceTables.
  const speciesInfo = (() => {
    try {
      const dataMod = (globalThis as { __game_data?: { getSpeciesInfo: (k: string) => { growthRate?: string } | undefined } }).__game_data;
      return dataMod?.getSpeciesInfo(speciesEnum);
    } catch { return undefined; }
  })();
  const growthRate = speciesInfo?.growthRate ?? 'GROWTH_MEDIUM_FAST';
  const currentExp = (() => {
    try {
      const dataMod = (globalThis as { __game_data?: { getExperienceForLevel: (rate: string, lvl: number) => number } }).__game_data;
      return dataMod?.getExperienceForLevel(growthRate, level) ?? 0;
    } catch { return 0; }
  })();
  return {
    speciesEnum, speciesId, speciesName, speciesNameFr,
    nickname: opts?.nickname ?? speciesNameFr,
    level, currentHp: maxHp, maxHp,
    moves, ability,
    heldItem: opts?.heldItem ?? '',
    nature: opts?.nature ?? 'Hardy',
    ivs, evs,
    status: null,
    currentExp,
    growthRate,
  };
}

/**
 * 1:1 décomp Gen 3 EXP gain formula (= pokemon.c:GiveMonExperience).
 *
 *   exp = (baseExp × defeatedLevel) / 7
 *
 * Plus boosts (= traded mon ×1.5, lucky egg ×1.5, etc.) — pour MVP : pas de
 * boost, formule de base.
 *
 * Returns le total exp gain.
 */
export function calculateExpGain(defeatedSpeciesEnum: string, defeatedLevel: number): number {
  try {
    const dataMod = (globalThis as { __game_data?: { getSpeciesInfo: (k: string) => { expYield?: number } | undefined } }).__game_data;
    const baseExp = dataMod?.getSpeciesInfo(defeatedSpeciesEnum)?.expYield ?? 0;
    return Math.floor((baseExp * defeatedLevel) / 7);
  } catch { return 0; }
}

/**
 * Award exp à un mon + recalc level/stats si nécessaire.
 *
 * Returns un object avec :
 *   - gained: number (= XP add)
 *   - leveledUp: boolean (= true si level changed)
 *   - newLevel: number (= level final, peut être > old)
 *   - newMaxHp: number (= maxHp recalculé si level changed)
 */
export function applyExpAward(mon: PokemonInstance, gained: number): {
  gained: number; leveledUp: boolean; newLevel: number; newMaxHp: number;
} {
  if (!mon.growthRate || mon.currentExp === undefined) {
    return { gained: 0, leveledUp: false, newLevel: mon.level, newMaxHp: mon.maxHp };
  }
  let dataMod;
  try {
    dataMod = (globalThis as { __game_data?: { getExperienceForLevel: (rate: string, lvl: number) => number; getSpeciesInfo: (k: string) => { stats?: { hp: number } } | undefined } }).__game_data;
  } catch { return { gained: 0, leveledUp: false, newLevel: mon.level, newMaxHp: mon.maxHp }; }
  if (!dataMod) return { gained: 0, leveledUp: false, newLevel: mon.level, newMaxHp: mon.maxHp };

  mon.currentExp = (mon.currentExp ?? 0) + gained;
  let leveledUp = false;
  // Loop : tant que le level peut monter (= max 100).
  while (mon.level < 100) {
    const expForNext = dataMod.getExperienceForLevel(mon.growthRate, mon.level + 1);
    if (mon.currentExp < expForNext) break;
    mon.level++;
    leveledUp = true;
  }
  if (leveledUp) {
    // Recalc maxHp via formule Gen 3 standard (= 1:1 calcHp helper).
    const baseHp = dataMod.getSpeciesInfo(mon.speciesEnum)?.stats?.hp ?? 50;
    const oldMaxHp = mon.maxHp;
    mon.maxHp = calcHp(baseHp, mon.ivs.hp, mon.evs.hp, mon.level);
    // Heal proportionally (= 1:1 décomp behavior : current_HP += (newMax - oldMax)).
    const hpDelta = mon.maxHp - oldMaxHp;
    if (hpDelta > 0) mon.currentHp += hpDelta;
  }
  return { gained, leveledUp, newLevel: mon.level, newMaxHp: mon.maxHp };
}

/** Convertit un PokemonInstance en set Showdown packé pour @pkmn/sim. */
export function pokemonToShowdownSet(p: PokemonInstance): {
  name: string; species: string; level: number; gender: string;
  moves: string[]; ability: string; item: string; nature: string;
  ivs: StatSpread; evs: StatSpread; shiny: boolean; happiness: number; pokeball: string;
} {
  return {
    name: p.nickname,
    species: p.speciesName,
    level: p.level,
    // gender '' : @pkmn/sim auto-detect via species genderRatio. Le décomp
    // calcule via `personality & 0xFF` vs `gBaseStats[species].genderRatio`.
    // TODO : extraire genderRatio par species si on veut shiny/personality 1:1.
    gender: '',
    moves: p.moves.map(m => m.id),
    ability: p.ability,
    item: p.heldItem,
    nature: p.nature,
    ivs: p.ivs,
    evs: p.evs,
    shiny: false,
    // Valeurs décomp-aligned (PAS du hardcode arbitraire) :
    //   `PARTY_MON_INIT_HAPPINESS = 70` (cf. include/constants/pokemon.h)
    //   `pokeball: 'pokeball'` = ITEM_POKE_BALL (ball par défaut au catch initial)
    happiness: 70,
    pokeball: 'pokeball',
  };
}
