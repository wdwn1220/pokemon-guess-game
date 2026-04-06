import { BattleStreams, RandomPlayerAI, Teams } from '@pkmn/sim';
import { TeamGenerators } from '@pkmn/randoms';
import { Protocol } from '@pkmn/protocol';
import { Battle } from '@pkmn/client';
import { Generations } from '@pkmn/data';
import { Dex } from '@pkmn/dex';

Teams.setGeneratorFactory(TeamGenerators);
const gens = new Generations(Dex);

const p1Team = Teams.generate('gen9randombattle');
const p2Team = Teams.generate('gen9randombattle');

const streams = BattleStreams.getPlayerStreams(new BattleStreams.BattleStream());
const spec = {formatid: 'gen9randombattle'};
const p1spec = {name: 'Player', team: Teams.pack(p1Team)};
const p2spec = {name: '???', team: Teams.pack(p2Team)};

// P2 is AI
const p2 = new RandomPlayerAI(streams.p2);
void p2.start();

const battle = new Battle(gens);

(async () => {
  for await (const chunk of streams.p1) {
    for (const line of chunk.split('\n')) {
      if (!line) continue;
      const parsed = Protocol.parse(line);
      battle.add(parsed);
      // console.log(line);
    }
    battle.update(); // Update client state
    console.log("Player active:", battle.p1.active[0]?.name, "HP:", battle.p1.active[0]?.hp, "/", battle.p1.active[0]?.maxhp);
    console.log("Enemy active:", battle.p2.active[0]?.speciesForme, "HP:", battle.p2.active[0]?.hp, "/", battle.p2.active[0]?.maxhp);
    console.log("Choices:", battle.request?.active?.[0]?.moves.map(m => m.move));
    console.log("---------");
  }
})();

void streams.omniscient.write(`>start ${JSON.stringify(spec)}`);
void streams.omniscient.write(`>player p1 ${JSON.stringify(p1spec)}`);
void streams.omniscient.write(`>player p2 ${JSON.stringify(p2spec)}`);

setTimeout(() => {
    // try clicking first move
    console.log("Sending move 1!");
    streams.p1.write(`>p1 move 1`);
}, 1000);

setTimeout(() => {
    process.exit(0);
}, 2000);
