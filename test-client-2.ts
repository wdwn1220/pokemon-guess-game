import { BattleStreams, RandomPlayerAI, Teams } from '@pkmn/sim';
import { TeamGenerators } from '@pkmn/randoms';

Teams.setGeneratorFactory(TeamGenerators);
const p1Team = Teams.generate('gen9randombattle');
const p2Team = Teams.generate('gen9randombattle');

const spec = { formatid: 'gen9customgame' };
const p1spec = { name: 'Player', team: Teams.pack(p1Team.slice(0, 3)) };
const p2spec = { name: '???', team: Teams.pack(p2Team.slice(0, 1)) };

const streams = BattleStreams.getPlayerStreams(new BattleStreams.BattleStream());
const p2 = new RandomPlayerAI(streams.p2);
void p2.start();

(async () => {
    for await (const chunk of streams.p1) {
        console.log("CHUNK:", chunk);
        const lines = chunk.split('\n');
        for (const line of lines) {
            const parts = line.split('|');
            if (parts[1] === 'request' && parts[2]) {
                 const req = JSON.parse(parts[2]);
                 if (req.teamPreview) {
                     streams.p1.write('team 123');
                 }
            }
        }
    }
})();

void streams.omniscient.write(`>start ${JSON.stringify(spec)}`);
void streams.omniscient.write(`>player p1 ${JSON.stringify(p1spec)}`);
void streams.omniscient.write(`>player p2 ${JSON.stringify(p2spec)}`);
