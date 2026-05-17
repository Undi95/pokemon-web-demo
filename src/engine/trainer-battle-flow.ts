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
import { gameState } from './game-state';
import { ShowFieldMessage, IsFieldMessageBoxHidden, HideFieldMessageBox } from './field-message-box';
import { getRuntime } from './decomp-globals';
import { VarSet } from './script-vars';
import { ShowBg, HideBg } from './gba-window-system';

interface TrainerPartyMember {
  species: string;
  level: number;
  iv?: number;
}

interface TrainerData {
  trainerClass: string;
  trainerName: string;
  trainerPic: string;
  encounterMusic: string;
  party: TrainerPartyMember[];
}

interface TrainerBattleFlow {
  tick(): boolean;
  getState(): string;
}

const A_BUTTON = 0x01;
const B_BUTTON = 0x02;

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
    const mod = await import('./decomp-data/auto/include/constants/opponents-data');
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

    // Iter17 : re-hide stashed overworld sprites each tick during all states
    // BETWEEN INTRO_TEXT and DONE (= UpdateObjectEvents un-hides them per
    // frame). startWildBattle's tick also does this when delegated.
    if (state !== 'WAIT_DATA' && state !== 'DONE') {
      const stashTick = (globalThis as { __battleSpriteStash?: Set<number> }).__battleSpriteStash;
      if (stashTick) {
        for (const id of stashTick) {
          const sprite = rt.gSprites.get(id);
          if (sprite) sprite.invisible = true;
        }
      }
    }

    switch (state) {
      case 'WAIT_DATA': {
        if (!_trainerDataLoadDone) return false;
        trainerData = _trainerDataCache?.[trainerId] ?? null;
        if (!trainerData || !trainerData.party || trainerData.party.length === 0) {
          console.warn(`[trainer-battle-flow] trainer ${trainerId} not found or empty party — fallback WIN`);
          VarSet('VAR_RESULT', 1);
          gameState.setVar('VAR_RESULT', 1);
          (globalThis as { __gBattleOutcome?: number }).__gBattleOutcome = BATTLE_OUTCOME_WIN;
          state = 'DONE';
          return false;
        }
        state = 'INTRO_TEXT';
        return false;
      }

      case 'INTRO_TEXT': {
        // Iter17 : hide overworld BGs + sprites already AT INTRO_TEXT (= avant
        // le startWildBattle qui les cache aussi). Sinon le user voit le
        // overworld pendant l'intro "BRICE veut combattre!".
        HideBg(1);
        HideBg(2);
        HideBg(3);
        const stash: Set<number> = new Set();
        const rt2 = getRuntime();
        if (rt2) {
          for (const [id, sprite] of rt2.gSprites) {
            if (sprite && !sprite.invisible) {
              stash.add(id);
              sprite.invisible = true;
            }
          }
        }
        (globalThis as { __battleSpriteStash?: Set<number> }).__battleSpriteStash = stash;
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
        currentBattle = startWildBattle({
          opponentSpecies: member.species,
          opponentLevel: member.level,
          // 1:1 décomp : combat dresseur → BattleAI scripts (pas wild random).
          isTrainerBattle: true,
          trainerNumId: _resolveTrainerNumId(trainerId),
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
        gameState.setVar('VAR_RESULT', 1);
        gameState.setFlag(`__defeated_${trainerId}`);
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
        gameState.setVar('VAR_RESULT', 2);
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
        // Iter17 : restore BGs + sprites (= might have been hidden by trainer
        // INTRO_TEXT but not yet restored if startWildBattle was never called
        // due to early WIN_TEXT/LOSE_TEXT). Idempotent — startWildBattle's
        // CLEANUP also does this.
        ShowBg(1);
        ShowBg(2);
        ShowBg(3);
        const stash = (globalThis as { __battleSpriteStash?: Set<number> }).__battleSpriteStash;
        if (stash) {
          const rt3 = getRuntime();
          if (rt3) {
            for (const id of stash) {
              const sprite = rt3.gSprites.get(id);
              if (sprite) sprite.invisible = false;
            }
          }
          (globalThis as { __battleSpriteStash?: Set<number> }).__battleSpriteStash = undefined;
        }
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
    const gsMod = await import('./game-state');
    if (gsMod.gameState.partySize === 0) {
      const pokeMod = await import('./pokemon');
      const starter = pokeMod.createPokemonInstance('SPECIES_TREECKO', 8);
      gsMod.gameState.addToParty(starter);
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
