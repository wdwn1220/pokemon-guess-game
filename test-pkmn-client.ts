import { BattleStreams, Teams } from '@pkmn/sim';
import { TeamGenerators } from '@pkmn/randoms';
import { Battle } from '@pkmn/client';
import { Dex } from '@pkmn/dex';
import { Generations } from '@pkmn/data';

Teams.setGeneratorFactory(TeamGenerators);
const gens = new Generations(Dex);

const p1Team = Teams.generate('gen9randombattle');
const p2Team = Teams.generate('gen9randombattle');

const streams = BattleStreams.getPlayerStreams(new BattleStreams.BattleStream());
const spec = { formatid: 'gen9customgame' };

const battle = new Battle(gens);

(async () => {
    for await (const chunk of streams.p1) {
        battle.add(chunk);
        battle.update();
        
        console.log("WAIT?", battle.request?.requestType);
        
        if (battle.request?.requestType === 'team') {
             streams.p1.write('team 123');
        } else if (battle.request?.requestType === 'move') {
             // can pick move
             streams.p1.write('move 1');
        }
    }
})();

void streams.omniscient.write(`>start ${JSON.stringify(spec)}`);
void streams.omniscient.write(`>player p1 {"name":"Player","team":${JSON.stringify(Teams.pack(p1Team.slice(0, 3)))}}`);
void streams.omniscient.write(`>player p2 {"name":"Enemy","team":${JSON.stringify(Teams.pack(p2Team.slice(0, 1)))}}`);
