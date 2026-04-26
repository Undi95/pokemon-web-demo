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
}

const ZERO_STATS: StatSpread = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
const PERFECT_IVS: StatSpread = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };

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
  const ivs = opts?.ivs ?? PERFECT_IVS;
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
  return {
    speciesEnum, speciesId, speciesName, speciesNameFr,
    nickname: opts?.nickname ?? speciesNameFr,
    level, currentHp: maxHp, maxHp,
    moves, ability,
    heldItem: opts?.heldItem ?? '',
    nature: opts?.nature ?? 'Hardy',
    ivs, evs,
    status: null,
  };
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
