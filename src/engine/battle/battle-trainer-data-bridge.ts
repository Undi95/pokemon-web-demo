/**
 * battle/battle-trainer-data-bridge.ts — peuple `globalThis.__gTrainers`
 * (table dresseur indexee par numId) que lit `CreateNPCTrainerParty`
 * (battle-trainer-party.ts:121 `_getTrainerData`).
 *
 * Pourquoi : la decomp fait `gTrainers[trainerNum]` (table statique indexee par
 * numId, data/trainers.h). Chez nous, l'extraction existe en STRING-keyed
 * (`public/decomp/em/trainer-parties.json`, cle = `TRAINER_X`). Ce bridge JOINT
 * les deux sources existantes -> Record<numId, TrainerData> 1:1 :
 *   - `opponents-data.ts` : `TRAINER_X` -> numId (= gTrainers index).
 *   - `trainer-parties.json` : `TRAINER_X` -> donnees party.
 *
 * Ne touche PAS CreateNPCTrainerParty (il lit deja `__gTrainers`). Tranche T1 du
 * port trainer 1:1 (cf. [[voie-v-suppression-plan]]). DORMANT jusqu'au reroute
 * de l'opcode trainerbattle (T4) qui appelle `ensureGTrainersLoaded()` avant le boot.
 *
 * DETTE 1:1 explicite :
 *   - `trainerName` = char codes FR (pas l'encodage GBA) -> nameHash determinISTE
 *     mais != ROM exact -> la NATURE (pid%25) peut diverger ; ability/gender/shiny
 *     restent corrects (derives de la base 0x88/0x78, byte-exacte). cf. blueprint S3.
 *   - `partyFlags` re-derive depuis la string `partyType` (data.h:67-70 / trainers.h:375).
 *   - champs non lus par CreateNPCTrainerParty (trainerClass/trainerPic/items/aiFlags)
 *     = poses a 0/[] (consommes ailleurs : sprite intro / AI, hors scope T1).
 *   - modes REMATCH/PYRAMID/HILL (gTrainerBattleOpponent_A reecrit) = hors scope.
 */

import { getSpeciesId } from '../../../harness/runtime/data-tables';
import { resolveDecompConstant } from '../../../harness/runtime/decomp-constants';
import * as _opponents from '../../../include/constants/opponents';

// 1:1 decomp `partyFlags` (include/data.h:67-70) — re-derive depuis la macro string `partyType`.
const PARTY_FLAGS_BY_TYPE: Record<string, number> = {
  NO_ITEM_DEFAULT_MOVES: 0,
  NO_ITEM_CUSTOM_MOVES: 1,   // F_TRAINER_PARTY_CUSTOM_MOVESET
  ITEM_DEFAULT_MOVES: 2,     // F_TRAINER_PARTY_HELD_ITEM
  ITEM_CUSTOM_MOVES: 3,      // F_TRAINER_PARTY_CUSTOM_MOVESET | F_TRAINER_PARTY_HELD_ITEM
};

// Forme JSON (public/decomp/em/trainer-parties.json, string-keyed) — sous-ensemble lu.
interface JsonTrainerMember {
  species: string; level: number; iv?: number;
  moves?: string[]; heldItem?: string;
}
interface JsonTrainer {
  trainerClass?: string; trainerPic?: string; name?: string; trainerName?: string;
  encounterMusic?: string; doubleBattle?: boolean; partyType?: string | null;
  party: JsonTrainerMember[];
}

// Cible : la forme `TrainerData` lue par CreateNPCTrainerParty (battle-trainer-party.ts:104).
interface BridgeMon { iv: number; lvl: number; species: number; moves?: number[]; heldItem?: number; }
interface BridgeTrainer {
  partyFlags: number; trainerClass: number; encounterMusic_gender: number;
  trainerPic: number; trainerName: number[]; items: number[];
  doubleBattle: boolean; aiFlags: number; partySize: number;
  party: {
    NoItemDefaultMoves?: BridgeMon[]; NoItemCustomMoves?: BridgeMon[];
    ItemDefaultMoves?: BridgeMon[]; ItemCustomMoves?: BridgeMon[];
  };
}

/** Résout une clé `TRAINER_X` -> numId (= gTrainers index), via opponents-data. 0 si inconnu. */
export function resolveTrainerNumId(key: string): number {
  const v = (_opponents as Record<string, unknown>)[key];
  return typeof v === 'number' ? v : 0;
}

// 1:1 decomp `gTrainers[numId].trainerPic` -> enum string "TRAINER_PIC_X" (= cle de
// trainer-pics.json, lue par showOpponentTrainerSprite). Le champ `trainerPic` de
// BridgeTrainer reste 0 (non lu par CreateNPCTrainerParty) ; on stocke l'ENUM string a
// part car le sprite intro adverse (OpponentHandleDrawTrainerPic) en a besoin pour
// DecompressTrainerFrontPic. Peuple par ensureGTrainersLoaded (en meme temps que __gTrainers).
const _trainerPicByNumId: Record<number, string> = {};

/** numId -> "TRAINER_PIC_X" (= gTrainers[numId].trainerPic). '' si inconnu / pas encore charge. */
export function getTrainerPicEnum(numId: number): string {
  return _trainerPicByNumId[numId] ?? '';
}

let _loadStarted = false;
let _loadDone = false;

/** 1:1 decomp : `trainerName` -> octets (pour nameHash battle_main.c:2000).
 *  DETTE : char codes FR (pas encodage GBA). */
function _nameBytes(name: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < name.length; i++) out.push(name.charCodeAt(i));
  return out;
}

function _buildMon(m: JsonTrainerMember): BridgeMon {
  const mon: BridgeMon = {
    iv: m.iv ?? 0,
    lvl: m.level,
    species: getSpeciesId(m.species) || 0,
  };
  if (m.moves && m.moves.length) mon.moves = m.moves.map((mv) => resolveDecompConstant(mv) ?? 0);
  if (m.heldItem) mon.heldItem = resolveDecompConstant(m.heldItem) ?? 0;
  return mon;
}

function _buildTrainer(j: JsonTrainer): BridgeTrainer {
  const partyFlags = PARTY_FLAGS_BY_TYPE[j.partyType ?? 'NO_ITEM_DEFAULT_MOVES'] ?? 0;
  const mons = (j.party ?? []).map(_buildMon);
  // 1:1 : seul le bit F_TRAINER_FEMALE (0x80) de encounterMusic_gender est lu (battle_main.c:1995).
  const encounterMusic_gender = (j.encounterMusic ?? '').includes('FEMALE') ? 0x80 : 0;
  const party: BridgeTrainer['party'] = {};
  switch (partyFlags) {
    case 0: party.NoItemDefaultMoves = mons; break;
    case 1: party.NoItemCustomMoves = mons; break;
    case 2: party.ItemDefaultMoves = mons; break;
    case 3: party.ItemCustomMoves = mons; break;
  }
  return {
    partyFlags,
    trainerClass: 0,                  // non lu par CreateNPCTrainerParty
    encounterMusic_gender,
    trainerPic: 0,                    // non lu ici
    trainerName: _nameBytes(j.name ?? j.trainerName ?? ''),
    items: [],                        // non lu ici
    doubleBattle: j.doubleBattle ?? false,
    aiFlags: 0,                       // non lu ici
    partySize: mons.length,
    party,
  };
}

/** Peuple `globalThis.__gTrainers` (numId -> TrainerData) en joignant opponents-data
 *  (numId<->cle) + trainer-parties.json (cle<->donnees). Idempotent + async (fetch JSON).
 *  A AWAIT avant qu'un combat dresseur ne boote (CreateNPCTrainerParty lit sync).
 *  ⚠️ COURSE corrigée (2026-06-12) : l'ancien `if (_loadStarted) return` faisait
 *  qu'un 2e appel pendant le fetch du 1er retournait IMMÉDIATEMENT sans attendre
 *  → DoTrainerBattle (.then) tournait AVANT que __gTrainers soit posé →
 *  GetTrainerBattleTransition lisait une table vide → sumEnemy=0 → la transition
 *  « joueur plus fort » (trail) jouait SYSTÉMATIQUEMENT au 1er combat dresseur.
 *  Tous les appelants partagent désormais LA même promesse. */
export function ensureGTrainersLoaded(): Promise<void> {
  if (!_loadPromise) _loadPromise = _doLoadGTrainers();
  return _loadPromise;
}
let _loadPromise: Promise<void> | null = null;
async function _doLoadGTrainers(): Promise<void> {
  if (_loadDone || _loadStarted) return;
  _loadStarted = true;
  try {
    const resp = await fetch('/decomp/em/trainer-parties.json');
    if (!resp.ok) { console.warn('[trainer-data-bridge] trainer-parties.json HTTP', resp.status); _loadDone = true; return; }
    const byKey = await resp.json() as Record<string, JsonTrainer>;

    const table: Record<number, BridgeTrainer> = {};
    for (const [key, numId] of Object.entries(_opponents)) {
      if (!key.startsWith('TRAINER_') || typeof numId !== 'number') continue;
      const j = byKey[key];
      if (!j || !j.party) continue;            // pas de data party pour ce dresseur -> skip (1:1 : gTrainers vide -> partySize 0)
      table[numId] = _buildTrainer(j);
      if (j.trainerPic) _trainerPicByNumId[numId] = j.trainerPic;   // enum "TRAINER_PIC_X" pour le sprite intro adverse
    }
    (globalThis as { __gTrainers?: Record<number, BridgeTrainer> }).__gTrainers = table;
    _loadDone = true;
  } catch (e) {
    console.warn('[trainer-data-bridge] load failed:', e);
    _loadDone = true;
  }
}
