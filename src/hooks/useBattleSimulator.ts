import { useState, useEffect, useRef } from 'react';
import { BattleStreams, RandomPlayerAI, Teams } from '@pkmn/sim';
import type { PokemonSet } from '@pkmn/sim';
import { Dex } from '@pkmn/dex';

export interface MoveInfo {
  name: string;
  type: string;
  power: number;
  category: string;
}

export interface BattleState {
  log: string[];
  playerActive: { species: string; hp: number; maxhp: number; action: 'idle' | 'attack' | 'hit' | 'faint' } | null;
  enemyActive: { species: string; hp: number; maxhp: number; action: 'idle' | 'attack' | 'hit' | 'faint' } | null;
  moves: MoveInfo[];      // Active moves player can select
  canMove: boolean;
  playerFainted: boolean;
  enemyFainted: boolean;
  choices: any[];
  party: { name: string; condition: string; active: boolean; slot: number }[];
}

export function useBattleSimulator(playerTeam: PokemonSet[], mysteryPokemon: PokemonSet) {
  const [battleState, setBattleState] = useState<BattleState>({
    log: [],
    playerActive: null,
    enemyActive: null,
    moves: [],
    canMove: false,
    playerFainted: false,
    enemyFainted: false,
    choices: [],
    party: []
  });

  const p1StreamRef = useRef<any>(null);
  const logRef = useRef<string[]>([]);
  const stateRef = useRef<BattleState>({} as BattleState); // mirror to update without dependency cycle

  const updateState = (updater: Partial<BattleState>) => {
    setBattleState((prev) => {
      const next = { ...prev, ...updater };
      stateRef.current = next;
      return next;
    });
  };

  useEffect(() => {
    if (!playerTeam.length) return;

    // init stream
    const streams = BattleStreams.getPlayerStreams(new BattleStreams.BattleStream());
    p1StreamRef.current = streams.p1;

    const spec = { formatid: 'gen9customgame' };
    const p1spec = { name: 'Player', team: Teams.pack(playerTeam) };
    const p2spec = { name: '???', team: Teams.pack([mysteryPokemon]) };

    const p2 = new RandomPlayerAI(streams.p2);
    void p2.start();

    // name masking
    const secretSpecies = mysteryPokemon.species;
    const secretName = mysteryPokemon.name;
    const mask = (text: string) => {
      // mask the exact species string case insensitively
      let res = text;
      if (secretSpecies) res = res.replace(new RegExp(secretSpecies, 'gi'), '???');
      if (secretName) res = res.replace(new RegExp(secretName, 'gi'), '???');
      return res;
    };

    (async () => {
      for await (const chunk of streams.p1) {
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line) continue;
          
          const parts = line.split('|');
          const type = parts[1];

          if (type === 'error') {
             updateState({ canMove: true });
          }

          if (type === 'request') {
            const requestJSON = parts[2];
            if (requestJSON) {
              const req = JSON.parse(requestJSON);
              if (req.wait) {
                updateState({ canMove: false, moves: [], choices: [] });
              } else if (req.teamPreview) {
                p1StreamRef.current.write('team 123');
              } else {
                // Active moves or Force Switch
                const activeMoves = req.active?.[0]?.moves || [];
                const moveInfos: MoveInfo[] = activeMoves
                  .filter((m: any) => !m.disabled)
                  .map((m: any) => {
                    const dexMove = Dex.moves.get(m.move);
                    return {
                      name: m.move,
                      type: dexMove.type || 'Normal',
                      power: dexMove.basePower || 0,
                      category: dexMove.category || 'Status',
                    };
                  });
                
                updateState({ 
                  canMove: true, 
                  moves: moveInfos,
                  choices: activeMoves 
                });
              }
              
              // track player party from request
              if (req.side && req.side.pokemon) {
                 const activePmg = req.side.pokemon.find((p:any) => p.active) || req.side.pokemon[0];
                 const condition = activePmg.condition || '100/100';
                 
                 const mappedParty = req.side.pokemon.map((p: any, idx: number) => ({
                    name: p.details.split(',')[0],
                    condition: p.condition,
                    active: !!p.active,
                    slot: idx
                 }));

                 updateState({
                   playerActive: {
                     species: activePmg.details.split(',')[0],
                     hp: condition.includes('fnt') ? 0 : parseInt(condition.split('/')[0]) || 0,
                     maxhp: condition.includes('fnt') ? 100 : (parseInt(condition.split('/')[1]?.split(' ')[0]) || 100),
                     action: condition.includes('fnt') ? 'faint' : (stateRef.current.playerActive?.action === 'hit' ? 'hit' : 'idle')
                   },
                   party: mappedParty
                 });
                 if (req.side.pokemon.every((p:any) => p.condition.includes('fnt'))) {
                   updateState({ playerFainted: true });
                 }
              }
            }
          }

          // simple damage/heal tracker for enemy
          if ((type === '-damage' || type === '-heal' || type === 'switch') && parts[2].startsWith('p2')) {
             const condition = type === 'switch' ? parts[4] : parts[3];
             if (condition) {
                const hp = condition.startsWith('0 fnt') ? 0 : parseInt(condition.split('/')[0]) || 0;
                const maxhp = condition.includes('/') ? parseInt(condition.split('/')[1].split(' ')[0]) : 100;
                
                updateState({
                   enemyActive: {
                     species: '???',
                     hp,
                     maxhp,
                     action: hp === 0 ? 'faint' : (stateRef.current.enemyActive?.action === 'hit' ? 'hit' : 'idle')
                   }
                });
                
                if (hp === 0) {
                   updateState({ enemyFainted: true });
                }
             }
          }

          // filtering for text log
          if (['move', '-damage', '-heal', '-supereffective', '-resisted', '-crit', 'faint', 'switch', 'drag', '-ability', '-weather', '-fieldstart'].includes(type) || type === 'win') {
            const maskedLog = mask(line);
            logRef.current = [...logRef.current, maskedLog];
            updateState({ log: [...logRef.current] });

            // Handle CSS animation states with specific delays
            if (type === 'move') {
              const isP1 = parts[2].startsWith('p1');
              if (isP1) {
                updateState({ playerActive: { ...stateRef.current.playerActive!, action: 'attack' } });
              } else {
                updateState({ enemyActive: { ...stateRef.current.enemyActive!, action: 'attack' } });
              }
              await new Promise(r => setTimeout(r, 600)); // wait for attack lunge
            }

            if (type === '-damage') {
              const targetP1 = parts[2].startsWith('p1');
              if (targetP1) {
                updateState({ playerActive: { ...stateRef.current.playerActive!, action: 'hit' } });
              } else {
                updateState({ enemyActive: { ...stateRef.current.enemyActive!, action: 'hit' } });
              }
              await new Promise(r => setTimeout(r, 400));
            }

            if (type === 'faint') {
              const targetP1 = parts[2].startsWith('p1');
              if (targetP1) {
                updateState({ playerActive: { ...stateRef.current.playerActive!, action: 'faint' } });
              } else {
                updateState({ enemyActive: { ...stateRef.current.enemyActive!, action: 'faint' } });
              }
              await new Promise(r => setTimeout(r, 800));
            }

            // Always reset action state to idle (unless faint) after any event
            if (stateRef.current.playerActive && stateRef.current.playerActive.action !== 'faint') {
               updateState({ playerActive: { ...stateRef.current.playerActive, action: 'idle' } });
            }
            if (stateRef.current.enemyActive && stateRef.current.enemyActive.action !== 'faint') {
               updateState({ enemyActive: { ...stateRef.current.enemyActive, action: 'idle' } });
            }

            // Default delay between log lines for readability
            await new Promise(resolve => setTimeout(resolve, 600));
          }
        }
      }
    })();

    void streams.omniscient.write(`>start ${JSON.stringify(spec)}`);
    void streams.omniscient.write(`>player p1 ${JSON.stringify(p1spec)}`);
    void streams.omniscient.write(`>player p2 ${JSON.stringify(p2spec)}`);

    return () => {
       // cleanup logic if unmounting
    };
  }, [playerTeam, mysteryPokemon]);

  const sendMove = (moveIndex: number) => {
    if (p1StreamRef.current) {
      updateState({ canMove: false, moves: [] });
      p1StreamRef.current.write(`move ${moveIndex + 1}`);
    }
  };

  const sendSwitch = (slotIndex: number) => {
    if (p1StreamRef.current) {
      updateState({ canMove: false });
      p1StreamRef.current.write(`switch ${slotIndex + 1}`);
    }
  };

  return { ...battleState, sendMove, sendSwitch };
}
