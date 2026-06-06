/**
 * trainer-battle-flow.ts — Phase 5.7 Trainer battle wrapper around battle-flow.
 *
 * Architecture identique à `battle-flow.ts` (= state machine inline overworld
 * via SetupNativeScript). Reuse 100% l'engine existant. Étend `startWildBattle`
 * pour supporter :
 *   - Trainer party (= multiple opponents in sequence)
 *   - Intro text trainer-specific ("BRICE veut combattre!")
 *   - Loop through party on faint
 *
 * Source de vérité décomp :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_setup.c:DoTrainerBattle`
 *   - `data/trainers.h` + `gTrainerParties` arrays
 *   - JSON : `public/decomp/em/trainer-parties.json`
 *
 * MVP scope (= rival Brendan/May Route 103, LV 5 unique) :
 *   - 1 trainer = 1 party array
 *   - Each party member = 1 wild battle instance (= chain via continuation)
 *   - Win all = trainer defeated, VAR_RESULT = 1
 *   - Lose any = player defeated, VAR_RESULT = 2
 *
 * Future Phase 5.8 : multi-mon trainers (= gym leaders, etc.).
 */
import { startWildBattle, BATTLE_OUTCOME_WIN } from './battle-flow';
import { getSpeciesNameFr } from '../system/data-tables';
import { ShowFieldMessage, IsFieldMessageBoxHidden, HideFieldMessageBox } from '../field/field-message-box';
import { encodeOwText } from '../../game/include/text';  // préproc : littéral FR → bytes (ShowFieldMessage byte)
import { getRuntime } from '../system/decomp-globals';
import { FlagSet, VarSet } from '../script/script-vars';
import { getText } from '../script/script-runtime';
import { ShowBg } from '../ui/gba-window-system';

interface TrainerPartyMember {
  species: string;
  level: number;
  iv?: number;
  /** 1:1 F_TRAINER_PARTY_CUSTOM_MOVESET : moveset imposé (sinon défaut niveau). */
  moves?: string[];
  /** 1:1 F_TRAINER_PARTY_HELD_ITEM : objet tenu. */
  heldItem?: string;
}

interface TrainerData {
  trainerClass: string;
  /** JSON : champ `name` (nom du dresseur, peut être vide). */
  name?: string;
  trainerName?: string;
  trainerPic: string;
  encounterMusic: string;
  /** 1:1 partyFlags : NO_ITEM_DEFAULT_MOVES / NO_ITEM_CUSTOM_MOVES /
   *  ITEM_DEFAULT_MOVES / ITEM_CUSTOM_MOVES. */
  partyType?: string | null;
  doubleBattle?: boolean;
  party: TrainerPartyMember[];
}

interface TrainerBattleFlow {
  tick(): boolean;
  getState(): string;
}

// 1:1 strict A8 audit : import GBA keys depuis decomp-data.
import { A_BUTTON, B_BUTTON } from '../decomp-data/include/gba/io_reg-data';

// Lazy-loaded trainer data.
let _trainerDataCache: Record<string, TrainerData> | null = null;
let _trainerDataLoadStarted = false;
let _trainerDataLoadDone = false;

async function _ensureTrainerDataLoaded(): Promise<void> {
  if (_trainerDataLoadDone) return;
  if (_trainerDataLoadStarted) return;
  _trainerDataLoadStarted = true;
  try {
    const resp = await fetch('/decomp/em/trainer-parties.json');
    if (resp.ok) {
      _trainerDataCache = await resp.json() as Record<string, TrainerData>;
      _trainerDataLoadDone = true;
    } else {
      console.warn('[trainer-battle-flow] failed to load trainer-parties.json');
      _trainerDataCache = {};
      _trainerDataLoadDone = true;
    }
  } catch (e) {
    console.warn('[trainer-battle-flow] error loading trainer parties:', e);
    _trainerDataCache = {};
    _trainerDataLoadDone = true;
  }
}

// 1:1 décomp : id numérique du dresseur (= gTrainerBattleOpponent_A) résolu
// depuis la clé 'TRAINER_X' via les constantes auto-extraites opponents-data.
let _trainerKeyToNum: Record<string, number> | null = null;
void (async function _loadTrainerNumIds(): Promise<void> {
  if (_trainerKeyToNum) return;
  try {
    const mod = await import('../decomp-data/include/constants/opponents-data');
    const map: Record<string, number> = {};
    for (const [k, v] of Object.entries(mod)) {
      if (k.startsWith('TRAINER_') && typeof v === 'number') map[k] = v;
    }
    _trainerKeyToNum = map;
  } catch {
    _trainerKeyToNum = {};
  }
})();

function _resolveTrainerNumId(trainerKey: string): number {
  return _trainerKeyToNum?.[trainerKey] ?? 0;
}

/** 1:1 décomp `CreateNPCTrainerParty` (battle_main.c:1993-2069) : calcule les
 *  données DÉTERMINISTES d'un mon dresseur (PID name-hash, IV fixe, moveset
 *  custom, objet tenu) à passer à createPokemonInstance (= CreateMon).
 *
 *  PID (1:1 :1993-2001) : `personalityValue = base + (nameHash << 8)` où
 *  base = doubleBattle?0x80 : female?0x78 : 0x88 (TOUJOURS pair → ability slot 0
 *  1:1 + gender dérivé de `base` 1:1) et nameHash = somme des octets du nom
 *  dresseur + du nom d'espèce. DETTE : on somme les codes FR (pas l'encodage gba
 *  exact, faute d'encodeur) → la NATURE (pid%25) est déterministe mais peut
 *  différer du ROM ; ability(slot0)+gender restent byte-exact (déterminés par base). */
function _computeTrainerMonData(td: TrainerData, member: TrainerPartyMember): {
  personality: number; fixedIV: number; moves?: string[]; heldItem?: string;
} {
  const isFemale = (td.encounterMusic ?? '').includes('FEMALE');
  const base = td.doubleBattle ? 0x80 : (isFemale ? 0x78 : 0x88);
  let nameHash = 0;
  const tname = td.name ?? td.trainerName ?? '';
  for (let i = 0; i < tname.length; i++) nameHash += tname.charCodeAt(i);
  const sname = getSpeciesNameFr(member.species) ?? '';
  for (let i = 0; i < sname.length; i++) nameHash += sname.charCodeAt(i);
  const personality = (base + (nameHash << 8)) >>> 0;
  // 1:1 :2009 fixedIV = iv * MAX_PER_STAT_IVS(31) / 255.
  const fixedIV = Math.floor(((member.iv ?? 0) * 31) / 255);

  const out: { personality: number; fixedIV: number; moves?: string[]; heldItem?: string } =
    { personality, fixedIV };
  const pt = td.partyType ?? '';
  // partyType : *_CUSTOM_MOVES → moveset imposé ; ITEM_* (≠ NO_ITEM_*) → objet tenu.
  if (pt.includes('CUSTOM_MOVES') && member.moves && member.moves.length > 0) out.moves = member.moves;
  if (pt.startsWith('ITEM_') && member.heldItem) out.heldItem = member.heldItem;
  return out;
}

// 1:1 décomp `gTrainerMoneyTable` (battle_main.c:474-532) : facteur d'argent par classe.
// Toute classe absente → 5 (sentinelle {0xFF, 5}).
const TRAINER_MONEY_TABLE: Record<string, number> = {
  TRAINER_CLASS_TEAM_AQUA: 5, TRAINER_CLASS_AQUA_ADMIN: 10, TRAINER_CLASS_AQUA_LEADER: 20,
  TRAINER_CLASS_AROMA_LADY: 10, TRAINER_CLASS_RUIN_MANIAC: 15, TRAINER_CLASS_INTERVIEWER: 12,
  TRAINER_CLASS_TUBER_F: 1, TRAINER_CLASS_TUBER_M: 1, TRAINER_CLASS_SIS_AND_BRO: 3,
  TRAINER_CLASS_COOLTRAINER: 12, TRAINER_CLASS_HEX_MANIAC: 6, TRAINER_CLASS_LADY: 50,
  TRAINER_CLASS_BEAUTY: 20, TRAINER_CLASS_RICH_BOY: 50, TRAINER_CLASS_POKEMANIAC: 15,
  TRAINER_CLASS_SWIMMER_M: 2, TRAINER_CLASS_BLACK_BELT: 8, TRAINER_CLASS_GUITARIST: 8,
  TRAINER_CLASS_KINDLER: 8, TRAINER_CLASS_CAMPER: 4, TRAINER_CLASS_OLD_COUPLE: 10,
  TRAINER_CLASS_BUG_MANIAC: 15, TRAINER_CLASS_PSYCHIC: 6, TRAINER_CLASS_GENTLEMAN: 20,
  TRAINER_CLASS_ELITE_FOUR: 25, TRAINER_CLASS_LEADER: 25, TRAINER_CLASS_SCHOOL_KID: 5,
  TRAINER_CLASS_SR_AND_JR: 4, TRAINER_CLASS_POKEFAN: 20, TRAINER_CLASS_EXPERT: 10,
  TRAINER_CLASS_YOUNGSTER: 4, TRAINER_CLASS_CHAMPION: 50, TRAINER_CLASS_FISHERMAN: 10,
  TRAINER_CLASS_TRIATHLETE: 10, TRAINER_CLASS_DRAGON_TAMER: 12, TRAINER_CLASS_BIRD_KEEPER: 8,
  TRAINER_CLASS_NINJA_BOY: 3, TRAINER_CLASS_BATTLE_GIRL: 6, TRAINER_CLASS_PARASOL_LADY: 10,
  TRAINER_CLASS_SWIMMER_F: 2, TRAINER_CLASS_PICNICKER: 4, TRAINER_CLASS_TWINS: 3,
  TRAINER_CLASS_SAILOR: 8, TRAINER_CLASS_COLLECTOR: 15, TRAINER_CLASS_RIVAL: 15,
  TRAINER_CLASS_PKMN_BREEDER: 10, TRAINER_CLASS_PKMN_RANGER: 12, TRAINER_CLASS_TEAM_MAGMA: 5,
  TRAINER_CLASS_MAGMA_ADMIN: 10, TRAINER_CLASS_MAGMA_LEADER: 20, TRAINER_CLASS_LASS: 4,
  TRAINER_CLASS_BUG_CATCHER: 4, TRAINER_CLASS_HIKER: 10, TRAINER_CLASS_YOUNG_COUPLE: 8,
  TRAINER_CLASS_WINSTRATE: 10,
};

/** 1:1 décomp `GetTrainerMoneyToGive` (single battle) + `Cmd_getmoneyreward` :
 *  `4 * lastMonLevel * moneyMultiplier(=1) * value[class]`. lastMonLevel = niveau du
 *  DERNIER mon de la party. moneyMultiplier = 1 (Pièce Rune non gérée = dette documentée). */
function _computeTrainerPrize(td: TrainerData): number {
  if (!td.party || td.party.length === 0) return 0;
  const lastMonLevel = td.party[td.party.length - 1].level;
  const value = TRAINER_MONEY_TABLE[td.trainerClass] ?? 5;
  return 4 * lastMonLevel * 1 * value;
}

/** Start trainer battle for given trainer ID. Reads party from JSON.
 *  Falls back to stub VAR_RESULT=1 if trainer not found. */
export function startTrainerBattle(trainerId: string, opts?: { defeatText?: string }): TrainerBattleFlow {
  // Eagerly start the data load.
  void _ensureTrainerDataLoaded();

  // 1:1 décomp : `lose_text` du macro trainerbattle = réplique de défaite
  // PERSONNELLE du dresseur, affichée sur l'OW après la victoire du joueur
  // (en plus du générique "Vous avez battu CLASSE NOM!" affiché dans le combat).
  const defeatTextLabel = opts?.defeatText;

  type State = 'WAIT_DATA' | 'NEXT_BATTLE'
             | 'IN_BATTLE' | 'BETWEEN_BATTLES' | 'WIN_TEXT' | 'WIN_DEFEAT_WAIT'
             | 'LOSE_TEXT' | 'LOSE_WAIT' | 'DONE';

  let state: State = 'WAIT_DATA';
  let trainerData: TrainerData | null = null;
  let partyIndex = 0;
  let currentBattle: ReturnType<typeof startWildBattle> | null = null;
  let allWon = true;

  const tick = (): boolean => {
    const rt = getRuntime();
    if (!rt) return false;

    // NB : plus de re-hide per-tick des sprites OW. Ils sont DÉTRUITS à INTRO_TEXT
    // (1:1 ResetSpriteData) et re-spawnés au CLEANUP de l'inner battle → rien à
    // re-cacher.

    switch (state) {
      case 'WAIT_DATA': {
        if (!_trainerDataLoadDone) return false;
        trainerData = _trainerDataCache?.[trainerId] ?? null;
        if (!trainerData || !trainerData.party || trainerData.party.length === 0) {
          console.warn(`[trainer-battle-flow] trainer ${trainerId} not found or empty party — fallback WIN`);
          VarSet('VAR_RESULT', 1);
          VarSet('VAR_RESULT', 1);
          (globalThis as { __gBattleOutcome?: number }).__gBattleOutcome = BATTLE_OUTCOME_WIN;
          state = 'DONE';
          return false;
        }
        // 1:1 : le combat commence EN COMBAT (transition + scène), PAS sur l'OW. Plus de
        // field message ici : battle-flow fait la transition (flash/fente), détruit les
        // sprites OW (LOAD_ASSETS = ResetSpriteData) et affiche "Un combat est lancé par
        // CLASSE NOM!" DANS le combat (TRAINER_WANTS_BATTLE) après le slide-in des dresseurs.
        state = 'NEXT_BATTLE';
        return false;
      }

      case 'NEXT_BATTLE': {
        if (partyIndex >= trainerData!.party.length) {
          // Won all — trainer defeated.
          state = 'WIN_TEXT';
          return false;
        }
        const member = trainerData!.party[partyIndex];
        // 1:1 CreateMon : données déterministes du mon dresseur (PID/IV/moves/objet).
        const monData = _computeTrainerMonData(trainerData!, member);
        currentBattle = startWildBattle({
          opponentSpecies: member.species,
          opponentLevel: member.level,
          // 1:1 décomp : combat dresseur → BattleAI scripts (pas wild random).
          isTrainerBattle: true,
          trainerNumId: _resolveTrainerNumId(trainerId),
          opponentPersonality: monData.personality,
          opponentFixedIV: monData.fixedIV,
          opponentMoves: monData.moves,
          opponentHeldItem: monData.heldItem,
          // 1:1 OpponentHandleDrawTrainerPic : sprite FRONT du dresseur (slide-in + lancer).
          opponentTrainerPic: trainerData!.trainerPic,
          // 1:1 BattleIntroPrintTrainerWantsToBattle = 1 seule fois (1er mon) ; les suivants
          // (multi-mon) skippent "veut se battre" (chemin chaîné = dette connue).
          trainerIntroSuppressWants: partyIndex > 0,
          // 1:1 Cmd_getmoneyreward : argent gagné, affiché à la victoire du DERNIER mon.
          trainerWinPrize: (partyIndex === trainerData!.party.length - 1)
            ? _computeTrainerPrize(trainerData!) : undefined,
        });
        state = 'IN_BATTLE';
        return false;
      }

      case 'IN_BATTLE': {
        if (!currentBattle) {
          state = 'NEXT_BATTLE';
          return false;
        }
        const battleDone = currentBattle.tick();
        if (!battleDone) return false;
        // Read outcome from gBattleOutcome stash (= set by battle-flow on cleanup).
        const outcome = (globalThis as { __gBattleOutcome?: number }).__gBattleOutcome ?? BATTLE_OUTCOME_WIN;
        if (outcome === BATTLE_OUTCOME_WIN) {
          // Beat this opponent. Move to next.
          partyIndex++;
          state = 'BETWEEN_BATTLES';
        } else {
          // Player lost — trainer wins.
          allWon = false;
          state = 'LOSE_TEXT';
        }
        currentBattle = null;
        return false;
      }

      case 'BETWEEN_BATTLES': {
        // Could show "BRICE envoie X !" message here. For MVP single-mon Brendan
        // rival, this state is a passthrough.
        if (partyIndex < trainerData!.party.length) {
          state = 'NEXT_BATTLE';
        } else {
          state = 'WIN_TEXT';
        }
        return false;
      }

      case 'WIN_TEXT': {
        // 1:1 : la défaite générique ("Vous avez battu CLASSE NOM!") + l'argent gagné sont
        // affichés DANS le combat (battle-flow TRAINER_WON_*). Ce state finalise le résultat
        // + pose le flag dresseur-battu (1:1 B1 : TRAINER_FLAGS_START=1280), PUIS affiche la
        // réplique de défaite PERSONNELLE du dresseur sur l'OW (lose_text du macro), 1:1 décomp.
        VarSet('VAR_RESULT', 1);
        FlagSet(1280 + _resolveTrainerNumId(trainerId));
        (globalThis as { __gBattleOutcome?: number }).__gBattleOutcome = BATTLE_OUTCOME_WIN;
        const defeatText = defeatTextLabel ? getText(defeatTextLabel) : undefined;
        if (defeatText) {
          ShowFieldMessage(defeatText);
          state = 'WIN_DEFEAT_WAIT';
        } else {
          state = 'DONE';
        }
        return false;
      }

      case 'WIN_DEFEAT_WAIT': {
        // Attend fin d'impression + A/B (= même pattern que LOSE_WAIT).
        if (IsFieldMessageBoxHidden() && (rt.gMain.newKeys & (A_BUTTON | B_BUTTON))) {
          HideFieldMessageBox();
          state = 'DONE';
        }
        return false;
      }

      case 'LOSE_TEXT': {
        ShowFieldMessage(encodeOwText('Tu as été vaincu!'));
        VarSet('VAR_RESULT', 2);
        VarSet('VAR_RESULT', 2);
        (globalThis as { __gBattleOutcome?: number }).__gBattleOutcome = 2;
        state = 'LOSE_WAIT';
        return false;
      }

      case 'LOSE_WAIT': {
        if (IsFieldMessageBoxHidden() && (rt.gMain.newKeys & (A_BUTTON | B_BUTTON))) {
          HideFieldMessageBox();
          state = 'DONE';
        }
        return false;
      }

      case 'DONE': {
        // Re-show BGs (idempotent — l'inner battle CLEANUP les a déjà re-montrés
        // via _restoreOverworldFromMenu, qui a aussi re-spawné les sprites OW
        // détruits à INTRO_TEXT). Plus de stash sprite à restaurer.
        ShowBg(1);
        ShowBg(2);
        ShowBg(3);
        return true;
      }
    }
    return false;
  };

  return { tick, getState: () => state };
}

// ─── Devtool exposure ───────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  const w = window as { dev?: Record<string, unknown> };
  w.dev = w.dev ?? {};
  const dev = w.dev as Record<string, any>;
  dev.battle = dev.battle ?? {};
  dev.battle.startTrainer = async (trainerId: string) => {
    // Auto-add starter Pokemon if party is empty (= dev convenience).
    const sbsMod = await import('../save/save-block-state');
    if (sbsMod.gSaveBlock1Ptr.playerPartyCount === 0) {
      const pokeMod = await import('../pokemon/pokemon');
      const starter = pokeMod.createPokemonInstance('SPECIES_TREECKO', 8);
      pokeMod.GiveMonToPlayer(starter);
      console.log('[dev.battle.startTrainer] auto-added Treecko Lv8 (party était vide)');
    }
    const flow = startTrainerBattle(trainerId);
    const interval = setInterval(() => {
      if (flow.tick()) {
        clearInterval(interval);
        console.log(`[dev.battle.startTrainer] ${trainerId} done, outcome=${(globalThis as { __gBattleOutcome?: number }).__gBattleOutcome}`);
      }
    }, 16);
    return flow;
  };
}
