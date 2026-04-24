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

export const PLAYER_TEAM: MonSpec[] = [
  {
    species: 'Pikachu',
    level: 12,
    moves: ['Thunder Shock', 'Quick Attack', 'Tail Whip', 'Growl'],
    ability: 'Static'
  }
];

export interface NpcDef {
  id: string;
  x: number;
  y: number;
  color: string;
  name: string;
  dialogue: string;
  team: MonSpec[];
}
