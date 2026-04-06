import { PRNG, Teams, Dex } from '@pkmn/sim';
import { TeamGenerators } from '@pkmn/randoms';

Teams.setGeneratorFactory(TeamGenerators);

const dateStr = "2026-04-06";
// convert dateStr to 4 numbers for PRNG seed
const seed = [
  parseInt(dateStr.slice(0, 4)),
  parseInt(dateStr.slice(5, 7)),
  parseInt(dateStr.slice(8, 10)),
  0
];

const prng = new PRNG(seed);
const team1 = Teams.generate('gen9randombattle', { prng });
const team2 = Teams.generate('gen9randombattle', { prng });

console.log("Team 1 (Mystery pool):");
console.log(team1.slice(0, 1).map(p => p.name));

console.log("\nTeam 2 (Player pool):");
console.log(team2.map(p => p.name));
