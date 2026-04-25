/**
 * État global de partie : flags + variables + persistance localStorage.
 *
 * Les flags et vars viennent de `flags-vars.json` (775 flags + 185 vars
 * extraits par `extract-flags-vars.mjs`). Par défaut tous à 0 / non-set,
 * modifiés par les scripts de map.
 *
 * API minimale (cf. script-runner.ts pour les ops) :
 *   gameState.setFlag('FLAG_X')
 *   gameState.clearFlag('FLAG_X')
 *   gameState.hasFlag('FLAG_X')
 *   gameState.setVar('VAR_X', value)
 *   gameState.getVar('VAR_X') // 0 si jamais set
 *   gameState.save() / load() / reset()
 */

const STORAGE_KEY = 'em_save_v1';

interface SaveData {
  flags: Record<string, true>;
  vars: Record<string, number>;
  /** Positions permanentes d'NPCs définies via setobjectxyperm (par mapName → localId → {x,y}) */
  objectPositions: Record<string, Record<string, { x: number; y: number }>>;
  playerName: string;
  gender: 'MALE' | 'FEMALE';
  map?: { name: string; x: number; y: number };
  /** Spawn dynamique défini par `setdynamicwarp` (utilisé pour le tout 1er spawn de la partie) */
  dynamicWarp?: { mapId: string; x: number; y: number };
  /** Heal location définie par `setrespawn` (où on revient après un blackout) */
  respawn?: string;
  party: unknown[]; // TODO : structure Pokémon
  created: number;
}

function emptySave(): SaveData {
  return {
    flags: {}, vars: {}, objectPositions: {},
    playerName: 'UNDI', gender: 'MALE',
    party: [],
    created: Date.now()
  };
}

class GameState {
  private data: SaveData = emptySave();

  load(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      this.data = JSON.parse(raw);
      return true;
    } catch { return false; }
  }

  save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); }
    catch (e) { console.warn('save failed', e); }
  }

  reset() { this.data = emptySave(); }

  setFlag(name: string) { this.data.flags[name] = true; }
  clearFlag(name: string) { delete this.data.flags[name]; }
  hasFlag(name: string): boolean { return !!this.data.flags[name]; }

  setVar(name: string, value: number) { this.data.vars[name] = value; }
  getVar(name: string): number { return this.data.vars[name] ?? 0; }

  setObjectXY(mapName: string, localId: string, x: number, y: number) {
    if (!this.data.objectPositions[mapName]) this.data.objectPositions[mapName] = {};
    this.data.objectPositions[mapName][localId] = { x, y };
  }
  getObjectXY(mapName: string, localId: string): { x: number; y: number } | undefined {
    return this.data.objectPositions[mapName]?.[localId];
  }

  get playerName() { return this.data.playerName; }
  set playerName(v: string) { this.data.playerName = v; }
  get gender() { return this.data.gender; }
  set gender(v: 'MALE' | 'FEMALE') { this.data.gender = v; }
  get map() { return this.data.map; }
  set map(v: SaveData['map']) { this.data.map = v; }

  /**
   * Reset minimal : gender + name. AUCUN flag/var hardcodé : tout l'init
   * (flags d'introduction, dynamic warp, respawn) vient de
   * `runNewGameInit()` qui exécute les vrais scripts du décomp.
   */
  resetForNewGame(gender: 'MALE' | 'FEMALE', playerName: string) {
    this.reset();
    this.data.gender = gender;
    this.data.playerName = playerName;
    this.save();
  }

  setDynamicWarp(mapId: string, x: number, y: number) {
    this.data.dynamicWarp = { mapId, x, y };
  }
  get dynamicWarp() { return this.data.dynamicWarp; }
  setRespawn(loc: string) { this.data.respawn = loc; }
  get respawn() { return this.data.respawn; }
}

export const gameState = new GameState();
