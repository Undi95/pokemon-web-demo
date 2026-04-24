import { BattleStreams, Teams, RandomPlayerAI } from '@pkmn/sim';
import type { MonSpec } from '../data/trainers';

export interface BattleEvent {
  type: 'log' | 'end';
  text: string;
  winner?: string;
}

function specToSet(spec: MonSpec): string {
  // Convert our compact spec to Showdown's "packed team" format
  return Teams.pack([
    {
      name: spec.species,
      species: spec.species,
      item: spec.item ?? '',
      ability: spec.ability ?? '',
      moves: spec.moves,
      nature: spec.nature ?? 'Hardy',
      gender: '',
      evs: spec.evs ?? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      ivs: spec.ivs ?? { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      level: spec.level,
      shiny: false,
      happiness: 255,
      pokeball: 'pokeball',
      hpType: ''
    }
  ])!;
}

function teamToPacked(team: MonSpec[]): string {
  return Teams.pack(team.map(spec => ({
    name: spec.species,
    species: spec.species,
    item: spec.item ?? '',
    ability: spec.ability ?? '',
    moves: spec.moves,
    nature: spec.nature ?? 'Hardy',
    gender: '',
    evs: spec.evs ?? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    ivs: spec.ivs ?? { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    level: spec.level,
    shiny: false,
    happiness: 255,
    pokeball: 'pokeball',
    hpType: ''
  })))!;
}

export async function runBattle(
  playerTeam: MonSpec[],
  npcTeam: MonSpec[],
  onEvent: (e: BattleEvent) => void
): Promise<string> {
  const stream = new BattleStreams.BattleStream();
  const streams = BattleStreams.getPlayerStreams(stream);

  const spec = { formatid: 'gen3customgame' };
  const p1spec = { name: 'Joueur', team: teamToPacked(playerTeam) };
  const p2spec = { name: 'Adversaire', team: teamToPacked(npcTeam) };

  // Random AIs for both sides — we just want a watchable battle for the demo
  const p1 = new RandomPlayerAI(streams.p1);
  const p2 = new RandomPlayerAI(streams.p2);

  void p1.start();
  void p2.start();

  let winner = '?';

  void streams.omniscient.write(
    `>start ${JSON.stringify(spec)}\n` +
    `>player p1 ${JSON.stringify(p1spec)}\n` +
    `>player p2 ${JSON.stringify(p2spec)}`
  );

  for await (const chunk of streams.omniscient) {
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (!line) continue;
      onEvent({ type: 'log', text: line });
      if (line.startsWith('|win|')) {
        winner = line.slice(5);
        onEvent({ type: 'end', text: `Vainqueur : ${winner}`, winner });
      }
      if (line.startsWith('|tie')) {
        winner = 'Tie';
        onEvent({ type: 'end', text: 'Match nul', winner });
      }
    }
  }
  return winner;
}
