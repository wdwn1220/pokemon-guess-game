import { useState, useEffect } from 'react';
import { getDailyGameState } from './utils/dailyPokemon';
import type { DailyGameState } from './utils/dailyPokemon';
import TeamSelection from './components/TeamSelection';
import BattleScreen from './components/BattleScreen';
import PokemonImage from './components/PokemonImage';
import type { PokemonSet } from '@pkmn/sim';
import { getPokemonKo } from './utils/ko';
import { Dex } from '@pkmn/dex';

export type AppState = 'loading' | 'selection' | 'battle' | 'result';

function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [dailyState, setDailyState] = useState<DailyGameState | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<PokemonSet[]>([]);
  const [didWin, setDidWin] = useState<boolean>(false);

  useEffect(() => {
    const state = getDailyGameState();
    setDailyState(state);
    setAppState('selection');
  }, []);

  const handleTeamSelection = (team: PokemonSet[]) => {
    setSelectedTeam(team);
    setAppState('battle');
  };

  if (appState === 'loading' || !dailyState) {
    return <div className="loading">로딩 중...</div>;
  }

  const mysteryKoName = getPokemonKo(dailyState.mysteryPokemon.species);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>포켓몬 추리 게임</h1>
        <p>매일 새로운 포켓몬의 정체를 배틀로 추리하세요!</p>
      </header>
      
      <main className="app-main">
        {appState === 'selection' && (
          <TeamSelection 
            playerPool={dailyState.playerPool} 
            onSelect={handleTeamSelection} 
          />
        )}
        
        {appState === 'battle' && (
          <BattleScreen 
            mysteryPokemon={dailyState.mysteryPokemon}
            playerTeam={selectedTeam}
            onGameOver={(win: boolean) => {
              setDidWin(win);
              setAppState('result');
            }}
          />
        )}

        {appState === 'result' && (
          <div className="result-screen">
            <div className={`result-card ${didWin ? 'result-win' : 'result-loss'}`}>
              <div className="result-status">
                {didWin ? "🎉 GREAT GUESS!" : "💔 GAME OVER"}
              </div>
              
              <div className="result-pokemon">
                <PokemonImage species={dailyState.mysteryPokemon.species} className="result-image" />
                <div className="result-info">
                  <h2 className="mystery-name">{mysteryKoName}</h2>
                  <div className="mystery-species">({dailyState.mysteryPokemon.species})</div>
                  <div className="mystery-types">
                    {Dex.species.get(dailyState.mysteryPokemon.species).types.map((t: string) => (
                      <span key={t} className="type-dot" style={{ backgroundColor: `var(--type-${t.toLowerCase()})` }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="result-summary">
                {didWin 
                  ? "오늘의 정체를 정확히 맞히셨습니다!" 
                  : "조금 아쉽네요. 다음 기회에 도전해보세요."}
              </div>

              <div className="result-stats">
                <p>배틀 기록을 복사하여 친구들에게 공유해보세요!</p>
                <button 
                  className="btn-share" 
                  onClick={() => {
                    const text = `포켓몬 추리 게임 ${new Date().toLocaleDateString()}\n${didWin ? '✅' : '❌'} 오늘의 포켓몬: ${mysteryKoName}\n#포켓몬추리게임`;
                    navigator.clipboard.writeText(text);
                    alert('클립보드에 복사되었습니다!');
                  }}
                >
                  결과 공유하기
                </button>
              </div>
            </div>
            
            <p className="next-hint">내일 새로운 포켓몬이 여러분을 기다립니다!</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
