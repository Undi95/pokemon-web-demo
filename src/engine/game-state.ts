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

import type { PokemonInstance } from './pokemon';

const STORAGE_KEY = 'em_save_v1';

/**
 * Options menu state — 1:1 décomp `gSaveBlock2Ptr->options*` (cf. include/global.h
 * SaveBlock2 + src/option_menu.c). Valeurs par défaut depuis new_game.c.
 */
export interface PokemonOptions {
  textSpeed: number;       // 0=SLOW, 1=MID, 2=FAST (OPTIONS_TEXT_SPEED_*). Default MID.
  battleSceneOff: number;  // 0=ON (anims), 1=OFF (skip). Default 0.
  battleStyle: number;     // 0=SHIFT, 1=SET. Default 0.
  sound: number;           // 0=MONO, 1=STEREO. Default 0.
  buttonMode: number;      // 0=NORMAL, 1=LR, 2=L_EQUALS_A. Default 0.
  windowFrameType: number; // 0-19 → frame text_window/{N+1}.png. Default 0.
}

export const DEFAULT_OPTIONS: PokemonOptions = {
  textSpeed: 1, battleSceneOff: 0, battleStyle: 0,
  sound: 0, buttonMode: 0, windowFrameType: 0,
};

/** Frames per char selon textSpeed (cf. menu.c:77 sTextSpeedFrameDelays). */
export const TEXT_SPEED_FRAME_DELAYS = [8, 4, 1] as const;

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
  party: PokemonInstance[];
  /** Item balls déjà ramassées (script labels). Persisté pour ne pas réapparaître. */
  takenItemBalls?: string[];
  /** Options menu (text speed, sound, frame, etc). */
  options?: PokemonOptions;
  created: number;
}

function emptySave(): SaveData {
  return {
    flags: {}, vars: {}, objectPositions: {},
    playerName: 'UNDI', gender: 'MALE',
    party: [],
    options: { ...DEFAULT_OPTIONS },
    created: Date.now()
  };
}

class GameState {
  private data: SaveData = emptySave();

  load(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      // Migration : merge avec emptySave pour garantir tous les champs présents
      // (saves antérieures peuvent manquer `options`, `takenItemBalls`, etc.)
      const empty = emptySave();
      this.data = {
        ...empty,
        ...parsed,
        flags: parsed.flags ?? {},
        vars: parsed.vars ?? {},
        objectPositions: parsed.objectPositions ?? {},
        party: parsed.party ?? [],
        options: { ...empty.options!, ...(parsed.options ?? {}) },
      };
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

  // Item balls : tracking persistant des pokeballs au sol déjà ramassées
  get takenItemBalls(): { has: (label: string) => boolean; add: (label: string) => void } {
    if (!this.data.takenItemBalls) this.data.takenItemBalls = [];
    const arr = this.data.takenItemBalls;
    return {
      has: (label) => arr.includes(label),
      add: (label) => { if (!arr.includes(label)) { arr.push(label); this.save(); } },
    };
  }

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

  // ===== Party management =====
  get party(): PokemonInstance[] { return this.data.party; }
  get partySize(): number { return this.data.party.length; }
  get lead(): PokemonInstance | undefined { return this.data.party[0]; }
  addToParty(mon: PokemonInstance): boolean {
    if (this.data.party.length >= 6) return false;
    this.data.party.push(mon);
    return true;
  }
  // ===== Options =====
  // Persistées dans la save mais aussi readables sans save loaded (default).
  get options(): PokemonOptions {
    if (!this.data.options) this.data.options = { ...DEFAULT_OPTIONS };
    return this.data.options;
  }
  setOptions(opts: Partial<PokemonOptions>) {
    this.data.options = { ...this.options, ...opts };
    this.save();
  }
  /** Frames de delay entre chars selon textSpeed (1:1 menu.c:77). */
  getTextSpeedFrameDelay(): number {
    const idx = Math.max(0, Math.min(2, this.options.textSpeed));
    return TEXT_SPEED_FRAME_DELAYS[idx];
  }

  /** Heal HP + PP de tous les Pokémon (Centre Pokémon, special HealPlayerParty). */
  healAllParty() {
    for (const m of this.data.party) {
      m.currentHp = m.maxHp;
      m.status = null;
      for (const mv of m.moves) mv.pp = mv.ppMax;
    }
  }
}

export const gameState = new GameState();

// ===== Debug helpers exposés en window pour console =====
// Usage : ouvrir la console F12, taper `gameState.party` ou `cheat.skipIntro()`
// pour débloquer la sortie de Littleroot sans avoir à passer par Birch's Lab.
// import { createPokemonInstance } from './pokemon'; // TODO: restore when pokemon.ts available
if (typeof window !== 'undefined') {
  (window as unknown as { gameState: GameState }).gameState = gameState;
  (window as unknown as { cheat: Record<string, unknown> }).cheat = {
    /** Avance l'intro pour permettre de sortir de Bourg-en-Vol vers Route 101.
     *  Set les vars et flags clés que les scripts décomp checkent pour autoriser
     *  la sortie. */
    skipIntro: () => {
      gameState.setVar('VAR_LITTLEROOT_INTRO_STATE', 6);
      gameState.setVar('VAR_LITTLEROOT_TOWN_STATE', 4);
      gameState.setVar('VAR_BIRCH_LAB_STATE', 4);
      gameState.setFlag('FLAG_RECEIVED_POKEDEX_FROM_BIRCH');
      gameState.setFlag('FLAG_RECEIVED_POKEMON_FROM_BIRCH');
      gameState.setFlag('FLAG_ADVENTURE_STARTED');
      gameState.setFlag('FLAG_RESCUED_BIRCH');
      gameState.setFlag('FLAG_SET_WALL_CLOCK');
      gameState.save();
      console.log('[cheat] Intro skipped — sortie de Littleroot débloquée. Recharge la map (sortir/rentrer de la maison).');
    },
    /** Donne un Pokémon arbitraire (via SPECIES_X enum). */
    giveMon: (speciesEnum: string, level = 5) => {
      // const m = createPokemonInstance(speciesEnum, level);
      // const ok = gameState.addToParty(m);
      // console.log(ok ? `[cheat] ${m.speciesNameFr} lv${level} ajouté` : '[cheat] Party pleine');
      // return m;
      console.log('[cheat] giveMon disabled — pokemon.ts not available');
      return null;
    },
    /** Heal complet de la party. */
    heal: () => { gameState.healAllParty(); console.log('[cheat] Party healed'); },
    /** Reset complet de la save (debug : repartir de zéro). */
    resetSave: () => { gameState.reset(); gameState.save(); console.log('[cheat] Save reset — recharge la page'); },
    /** Inspection du WorldRenderer (current map + adjacents loaded). */
    world: () => {
      const w = (window as unknown as { __overworldWorld?: { currentMapName: string; loaded: Map<string, { mapName: string; worldOffsetX: number; worldOffsetY: number }> } }).__overworldWorld;
      if (!w) return '[cheat] WorldRenderer pas init (overworld pas encore loaded)';
      return {
        current: w.currentMapName,
        loaded: Array.from(w.loaded.values()).map(i => ({
          name: i.mapName, offX: i.worldOffsetX, offY: i.worldOffsetY,
        })),
      };
    },
  };
}
