import { BattleStreams, RandomPlayerAI, Teams } from '@pkmn/sim';
import { TeamGenerators } from '@pkmn/randoms';

Teams.setGeneratorFactory(TeamGenerators);

const p1Team = Teams.generate('gen9randombattle');
const p2Team = Teams.generate('gen9randombattle');

// Force P1 first Pokemon to have Explosion
p1Team[0].moves = ['explosion'];
p1Team[0].level = 100;

const streams = BattleStreams.getPlayerStreams(new BattleStreams.BattleStream());
const spec = { formatid: 'gen9customgame' };
const p1spec = { name: 'Player', team: Teams.pack(p1Team) };
const p2spec = { name: '???', team: Teams.pack(p2Team.slice(0, 3)) };

// Custom P2 AI that just attacks
const p2 = new RandomPlayerAI(streams.p2);
void p2.start();

let turn = 0;
(async () => {
    for await (const chunk of streams.p1) {
        const lines = chunk.split('\n');
        for (const line of lines) {
            console.log("LINE:", line);
            if (!line) continue;
            const parts = line.split('|');
            if (parts[1] === 'request' && parts[2]) {
                 const req = JSON.parse(parts[2]);
                 console.log("REQUEST JSON =>", JSON.stringify(req));
                 if (req.teamPreview) {
                     streams.p1.write('team 123');
                 } else if (req.forceSwitch) {
                     console.log("SENDING SWITCH!");
                     setTimeout(() => streams.p1.write('switch 2'), 500);
                 } else if (req.active && req.side) {
                     console.log("SENDING SWITCH INSTEAD!");
                     setTimeout(() => streams.p1.write('switch 2'), 500);
                 }
            }
            if (parts[1] === 'error') {
                 console.error("ERROR FROM SIMULATOR:", line);
                 process.exit(1);
            }
        }
    }
})();

setTimeout(() => {
    console.log("TEST FINISHED.");
    process.exit(0);
}, 3000);

void streams.omniscient.write(`>start ${JSON.stringify(spec)}`);
void streams.omniscient.write(`>player p1 ${JSON.stringify(p1spec)}`);
void streams.omniscient.write(`>player p2 ${JSON.stringify(p2spec)}`);
