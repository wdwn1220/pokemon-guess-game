import { useState, useEffect, useRef } from 'react';
import type { PokemonSet } from '@pkmn/sim';
import { useBattleSimulator } from '../hooks/useBattleSimulator';
import GuessModal from './GuessModal';
import PokemonImage from './PokemonImage';
import { getPokemonKo, getMoveKo, getAbilityKo, isCorrectGuess, UI } from '../utils/ko';
import ToastContainer, { useToasts } from './Toast';

interface BattleScreenProps {
  mysteryPokemon: PokemonSet;
  playerTeam: PokemonSet[];
  onGameOver: (win: boolean) => void;
}

export default function BattleScreen({ mysteryPokemon, playerTeam, onGameOver }: BattleScreenProps) {
  const battle = useBattleSimulator(playerTeam, mysteryPokemon);
  const { toasts, addToast, removeToast } = useToasts();
  const [showGuessModal, setShowGuessModal] = useState(false);
  const [remainingGuesses, setRemainingGuesses] = useState(5);
  const [pastGuesses, setPastGuesses] = useState<{name: string, correct: boolean}[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const isBattleEnded = battle.playerFainted || battle.enemyFainted;
  const finalChance = isBattleEnded && remainingGuesses > 0;

  useEffect(() => {
    if (finalChance) {
      addToast('마지막 정답 기회입니다!', 'warning', 5000);
      setShowGuessModal(true);
      setRemainingGuesses(1);
    }
  }, [finalChance, addToast]);

  // Scroll to bottom of log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battle.log]);

  const handleGuessSubmit = (guess: string) => {
    const correct = isCorrectGuess(guess, mysteryPokemon.species);
    const koName = getPokemonKo(mysteryPokemon.species);
    
    setPastGuesses([...pastGuesses, { name: guess, correct }]);

    if (correct) {
      addToast(`정답! 이 포켓몬은 ${koName} 이었습니다!`, 'success', 0);
      setTimeout(() => onGameOver(true), 2500);
      return;
    }

    const newRemaining = remainingGuesses - 1;
    setRemainingGuesses(newRemaining);
    setShowGuessModal(false);

    if (newRemaining <= 0) {
      addToast(`게임 오버! 오늘의 포켓몬은 ${koName} 이었습니다.`, 'error', 0);
      setTimeout(() => onGameOver(false), 3000);
    } else {
      addToast(`틀렸습니다! ${guess}은(는) 아닙니다.`, 'warning');
    }
  };

  const playerKoName = battle.playerActive ? getPokemonKo(battle.playerActive.species) : '';

  const getHpClass = (hp: number, max: number) => {
    const ratio = hp / max;
    if (ratio <= 0.2) return ' health-fill hp-bar-low';
    if (ratio <= 0.5) return ' health-fill hp-bar-med';
    return ' health-fill';
  };

  return (
    <div className="battle-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="battle-header">
        <div className="past-guesses">
          {pastGuesses.map((g, i) => (
            <span key={i} className={`guess-badge ${g.correct ? 'correct' : 'wrong'}`}>{g.name}</span>
          ))}
        </div>
        <button className="btn-guess" onClick={() => setShowGuessModal(true)}>
          {UI.GUESS_SUBMIT} ({remainingGuesses}{UI.GUESS_REMAINING})
        </button>
      </div>

      <div className="battle-arena">
        {/* Enemy Side */}
        <div className="enemy-side">
          {battle.enemyActive ? (
            <>
               <div className="health-bar-container">
                  <div className="pokemon-info">
                     <span className="pkm-name">???</span>
                     <span className="pkm-level">{UI.LEVEL} 50</span>
                  </div>
                  <div className="health-bar">
                     <div 
                       className={getHpClass(battle.enemyActive.hp, battle.enemyActive.maxhp)}
                       style={{ width: `${(battle.enemyActive.hp / battle.enemyActive.maxhp) * 100}%` }}
                     ></div>
                  </div>
                  <div className="hp-numbers">{battle.enemyActive.hp} / {battle.enemyActive.maxhp}</div>
               </div>
               <div className={`pokemon-sprite silhouette action-${battle.enemyActive.action}`}>
                 <img src="https://play.pokemonshowdown.com/sprites/bw/substitute.png" alt="???" />
               </div>
            </>
          ) : (
            <div className="loading-mon">{UI.ENEMY_LOADING}</div>
          )}
        </div>

        {/* Player Side */}
        <div className="player-side">
          {battle.playerActive ? (
             <>
               <div className={`pokemon-sprite action-${battle.playerActive.action}`}>
                 <PokemonImage species={battle.playerActive.species} isBack={true} />
               </div>
               <div className="health-bar-container">
                  <div className="pokemon-info">
                     <span className="pkm-name">{playerKoName}</span>
                     <span className="pkm-level">{UI.LEVEL} 50</span>
                  </div>
                  <div className="health-bar">
                     <div 
                       className={getHpClass(battle.playerActive.hp, battle.playerActive.maxhp)}
                       style={{ width: `${(battle.playerActive.hp / battle.playerActive.maxhp) * 100}%` }}
                     ></div>
                  </div>
                  <div className="hp-numbers">{battle.playerActive.hp} / {battle.playerActive.maxhp}</div>
               </div>
             </>
          ) : (
            <div className="loading-mon">{UI.READY}</div>
          )}
        </div>
      </div>

      <div className="battle-controls">
        <div className="battle-log">
          {battle.log.map((line, i) => (
            <div key={i} className="log-line">{formatLog(line)}</div>
          ))}
          <div ref={logEndRef} />
        </div>
        
        <div className="battle-actions">
          {battle.canMove && !isBattleEnded ? (
             <div className="action-panels">
               {battle.moves.length > 0 && (
                 <div className="moves-grid">
                    {battle.moves.map((m, i) => (
                      <button key={i} onClick={() => battle.sendMove(i)} className="btn-move">
                        {getMoveKo(m.name)}
                      </button>
                    ))}
                 </div>
               )}
               <div className="switches-grid">
                  {battle.party.filter(p => !p.active && !p.condition.includes('fnt')).map((p) => (
                    <button key={p.slot} onClick={() => battle.sendSwitch(p.slot)} className="btn-switch">
                      {UI.SWITCH}: {getPokemonKo(p.name)}
                    </button>
                  ))}
               </div>
            </div>
          ) : (
             <div className="waiting-text">
               {isBattleEnded ? UI.BATTLE_END : UI.WAITING}
             </div>
          )}
        </div>
      </div>

      {showGuessModal && (
        <GuessModal 
          onClose={() => !finalChance && setShowGuessModal(false)} 
          onSubmit={handleGuessSubmit} 
          remainingGuesses={remainingGuesses}
          finalChance={finalChance}
        />
      )}
    </div>
  );
}

// Korean battle log formatter
function formatLog(line: string) {
  const parts = line.split('|');
  const type = parts[1];

  const getName = (raw: string) => {
    const species = raw.split(':')[1]?.trim() || raw;
    if (species === '???') return '???';
    return getPokemonKo(species);
  };

  if (type === 'move') {
    const who = getName(parts[2]);
    const moveName = getMoveKo(parts[3]);
    return `${who}(은)는 ${moveName}(을)를 사용했다!`;
  }
  if (type === '-damage') {
    const who = getName(parts[2]);
    const hpStr = parts[3];
    return `${who}에게 데미지! (${UI.HP}: ${hpStr})`;
  }
  if (type === '-heal') return `${getName(parts[2])}의 체력이 회복됐다!`;
  if (type === '-supereffective') return `효과가 굉장했다!`;
  if (type === '-resisted') return `효과가 별로였다...`;
  if (type === '-crit') return `급소에 맞았다!`;
  if (type === 'faint') return `${getName(parts[2])}이(가) 쓰러졌다!`;
  if (type === 'switch') {
    const who = getName(parts[2]);
    return `${who}(으)로 교체!`;
  }
  if (type === '-ability') {
    const who = getName(parts[2]);
    const ability = getAbilityKo(parts[3]);
    return `[특성] ${who}의 ${ability}`;
  }
  if (type === 'win') {
     return parts[2] === 'Player' ? '승리했습니다!' : '패배했습니다...';
  }
  
  return ''; // hide raw protocol lines
}
