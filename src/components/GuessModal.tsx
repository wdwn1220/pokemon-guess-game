import { useState } from 'react';

interface GuessModalProps {
  onClose: () => void;
  onSubmit: (guess: string) => void;
  remainingGuesses: number;
  finalChance: boolean;
}

export default function GuessModal({ onClose, onSubmit, remainingGuesses, finalChance }: GuessModalProps) {
  const [guess, setGuess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim()) {
      onSubmit(guess.trim());
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>이 포켓몬은 누구?</h2>
        <p className="guesses-info">
          {finalChance 
            ? <span className="warning">배틀 종료! 마지막 기회입니다.</span> 
            : `남은 기회: ${remainingGuesses}번`}
        </p>
        
        <form onSubmit={handleSubmit} className="guess-form">
          <input 
            type="text" 
            placeholder="포켓몬 이름 입력 (예: 피카츄, Pikachu)" 
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            autoFocus
          />
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>취소</button>
            <button type="submit" className="btn-submit" disabled={!guess.trim()}>정답 제출</button>
          </div>
        </form>
      </div>
    </div>
  );
}
