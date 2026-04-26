export interface MonSpec {
  species: string;
  level: number;
  moves: string[];
  ability?: string;
  item?: string;
  nature?: string;
  evs?: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  ivs?: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
}

// (PLAYER_TEAM hardcoded supprimé : dead code. La party joueur vient de
// `gameState.party[]` populée par givemon/ChooseStarter.)

export interface NpcDef {
  id: string;
  x: number;
  y: number;
  color: string;
  name: string;
  dialogue: string;
  team: MonSpec[];
}
