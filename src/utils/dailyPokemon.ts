import { PRNG, Teams } from '@pkmn/sim';
import type { PokemonSet } from '@pkmn/sim';
import { TeamGenerators } from '@pkmn/randoms';

Teams.setGeneratorFactory(TeamGenerators);

function getDailySeed(): [number, number, number, number] {
  const d = new Date();
  return [
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    0
  ];
}

export interface DailyGameState {
  mysteryPokemon: PokemonSet;
  playerPool: PokemonSet[];
}

export function getDailyGameState(): DailyGameState {
  const prng = new PRNG(getDailySeed() as any);
  
  // We want format that gives single normal pokemon sets
  // gen9randombattle is good
  const enemyTeam = Teams.generate('gen9randombattle', { prng } as any);
  const playerTeam = Teams.generate('gen9randombattle', { prng } as any);

  enemyTeam.forEach(p => p.level = 50);
  playerTeam.forEach(p => p.level = 50);

  return {
    mysteryPokemon: enemyTeam[0],
    playerPool: playerTeam.slice(0, 6) // randomly generated 6 pokemon
  };
}
