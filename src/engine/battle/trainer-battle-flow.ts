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
import { getRuntime } from '../system/decomp-globals';
import { FlagSet, VarSet } from '../script/script-vars';
import { ShowBg, HideBg } from '../ui/gba-window-system';

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

/** Start trainer battle for given trainer ID. Reads party from JSON.
 *  Falls back to stub VAR_RESULT=1 if trainer not found. */
export function startTrainerBattle(trainerId: string): TrainerBattleFlow {
  // Eagerly start the data load.
  void _ensureTrainerDataLoaded();

  type State = 'WAIT_DATA' | 'INTRO_TEXT' | 'INTRO_WAIT' | 'NEXT_BATTLE'
             | 'IN_BATTLE' | 'BETWEEN_BATTLES' | 'WIN_TEXT' | 'WIN_WAIT'
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
        state = 'INTRO_TEXT';
        return false;
      }

      case 'INTRO_TEXT': {
        // Hide overworld BGs pour l'intro "X veut combattre!".
        HideBg(1);
        HideBg(2);
        HideBg(3);
        // 1:1 décomp ResetSpriteData (cf. battle-flow LOAD_ASSETS) : on DÉTRUIT les
        // sprites OW (player avatar + NPCs) pour l'intro trainer plutôt que de les
        // stasher (ancien hack invisible + per-tick re-hide, source des bugs de
        // corruption healthbox). Les structs gObjectEvents/gPlayerAvatar persistent
        // → re-spawn au CLEANUP de l'inner battle (_restoreOverworldFromMenu).
        // setObjectEventsSuspended(true) empêche UpdateObjectEvents de tiquer les
        // sprites détruits pendant INTRO_WAIT (l'inner battle CLEANUP le remet false).
        void Promise.all([
          import('../field/object-events'),
          import('../field/player-avatar'),
          import('../system/sprite-animation'),
        ]).then(([oe, pa, sa]) => {
          const rt2 = getRuntime();
          if (!rt2) return;
          oe.setObjectEventsSuspended(true);
          oe.destroyAllNpcSprites(rt2);
          pa.DestroyPlayerAvatar(rt2);
          sa.ResetSpriteCopyRequests();
        });
        const name = trainerData!.trainerName ?? 'Adversaire';
        ShowFieldMessage(`${name} veut combattre!`);
        state = 'INTRO_WAIT';
        return false;
      }

      case 'INTRO_WAIT': {
        if (IsFieldMessageBoxHidden() && (rt.gMain.newKeys & (A_BUTTON | B_BUTTON))) {
          HideFieldMessageBox();
          state = 'NEXT_BATTLE';
        }
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
        const name = trainerData!.trainerName ?? 'Adversaire';
        ShowFieldMessage(`${name} a perdu!`);
        VarSet('VAR_RESULT', 1);
        VarSet('VAR_RESULT', 1);
        // 1:1 strict (B1) : FlagSet(TRAINER_FLAGS_START + trainerId numeric).
        // constants/flags.h : TRAINER_FLAGS_START = 1280.
        FlagSet(1280 + _resolveTrainerNumId(trainerId));
        (globalThis as { __gBattleOutcome?: number }).__gBattleOutcome = BATTLE_OUTCOME_WIN;
        state = 'WIN_WAIT';
        return false;
      }

      case 'WIN_WAIT': {
        if (IsFieldMessageBoxHidden() && (rt.gMain.newKeys & (A_BUTTON | B_BUTTON))) {
          HideFieldMessageBox();
          state = 'DONE';
        }
        return false;
      }

      case 'LOSE_TEXT': {
        ShowFieldMessage('Tu as été vaincu!');
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
