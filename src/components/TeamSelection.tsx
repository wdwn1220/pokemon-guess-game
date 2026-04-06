import { useState } from 'react';
import type { PokemonSet } from '@pkmn/sim';
import { Dex } from '@pkmn/dex';
import PokemonImage from './PokemonImage';
import TypeBadge from './TypeBadge';
import { getPokemonKo, getMoveKo, getAbilityKo } from '../utils/ko';
import { CATEGORY_KO } from '../utils/typeInfo';

interface TeamSelectionProps {
  playerPool: PokemonSet[];
  onSelect: (team: PokemonSet[]) => void;
}

function getPokemonInfo(p: PokemonSet) {
  const species = Dex.species.get(p.species);
  const baseStats = species.baseStats || { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 };
  const moves = (p.moves || []).map(moveName => {
    const move = Dex.moves.get(moveName);
    return {
      id: moveName,
      koName: getMoveKo(moveName),
      type: move.type || 'Normal',
      power: move.basePower || 0,
      accuracy: move.accuracy === true ? '—' : (move.accuracy || '—'),
      pp: move.pp || 0,
      category: move.category || 'Status',
    };
  });
  return {
    types: species.types || ['Normal'],
    baseStats,
    ability: getAbilityKo(p.ability || species.abilities[0] || ''),
    moves,
  };
}

export default function TeamSelection({ playerPool, onSelect }: TeamSelectionProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleSelection = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      if (selectedIndices.length < 3) {
        setSelectedIndices([...selectedIndices, index]);
      }
    }
  };

  const toggleExpand = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleStart = () => {
    if (selectedIndices.length === 3) {
      const selectedTeam = selectedIndices.map((i) => playerPool[i]);
      onSelect(selectedTeam);
    }
  };

  return (
    <div className="team-selection">
      <h2>포켓몬 선택 (3마리)</h2>
      <p style={{ color: 'var(--text-dim)' }}>배틀에 참가할 포켓몬을 3마리 선택하세요.</p>
      <div className="pokemon-pool">
        {playerPool.map((p, index) => {
          const isSelected = selectedIndices.includes(index);
          const isExpanded = expandedIndex === index;
          const koName = getPokemonKo(p.species);
          const info = getPokemonInfo(p);

          return (
            <div
              key={index}
              className={`pokemon-card ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}`}
              onClick={() => toggleSelection(index)}
            >
              {/* Main card content */}
              <PokemonImage species={p.species} />
              <div className="pokemon-name">{koName}</div>
              <div className="pokemon-name-en">{p.species}</div>
              
              {/* Type badges */}
              <div className="type-badges">
                {info.types.map(t => <TypeBadge key={t} type={t} small />)}
              </div>

              <div className="card-footer">
                <span className="pokemon-level">Lv. {p.level ?? 50}</span>
                <button
                  className="btn-info-toggle"
                  onClick={(e) => toggleExpand(e, index)}
                  title="상세 정보"
                >
                  {isExpanded ? '▲ 접기' : '▼ 정보'}
                </button>
              </div>

              {/* Expanded detail panel */}
              {isExpanded && (
                <div className="pokemon-detail" onClick={e => e.stopPropagation()}>
                  {/* Base stats */}
                  <div className="detail-section">
                    <div className="detail-title">특성</div>
                    <div className="ability-name">{info.ability}</div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-title">기본 능력치</div>
                    <div className="stats-grid">
                      {info.baseStats && Object.entries({
                        HP: info.baseStats.hp,
                        공격: info.baseStats.atk,
                        방어: info.baseStats.def,
                        특공: info.baseStats.spa,
                        특방: info.baseStats.spd,
                        스피드: info.baseStats.spe,
                      }).map(([stat, val]) => (
                        <div key={stat} className="stat-row">
                          <span className="stat-name">{stat}</span>
                          <div className="stat-bar-wrap">
                            <div className="stat-bar" style={{ width: `${Math.min(100, (val / 255) * 100)}%` }} />
                          </div>
                          <span className="stat-val">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-title">기술</div>
                    <div className="moves-list">
                      {info.moves.map(m => (
                        <div key={m.id} className="move-row">
                          <TypeBadge type={m.type} small />
                          <span className="move-name">{m.koName}</span>
                          <span className="move-cat">{CATEGORY_KO[m.category] ?? m.category}</span>
                          <span className="move-power">{m.power > 0 ? `위력 ${m.power}` : '변화'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        className="start-button"
        disabled={selectedIndices.length !== 3}
        onClick={handleStart}
      >
        {selectedIndices.length === 3 ? "배틀 시작!" : `${3 - selectedIndices.length}마리 더 선택하세요`}
      </button>
    </div>
  );
}
