// Korean translation utility
// Built from PokeAPI CSV data (1025 pokemon, 843 moves, 276 abilities)
import koPokemonRaw from './ko_pokemon.json';
import koMovesRaw from './ko_moves.json';
import koAbilitiesRaw from './ko_abilities.json';

const koPokemon: Record<string, string> = koPokemonRaw;
const koMoves: Record<string, string> = koMovesRaw;
const koAbilities: Record<string, string> = koAbilitiesRaw;

// Manual mapping for forms/variants that might missing in base PokeAPI ids
const specialForms: Record<string, string> = {
  'ogerpon-wellspring': '오거폰(우물)',
  'ogerpon-hearthflame': '오거폰(화덕)',
  'ogerpon-cornerstone': '오거폰(주춧돌)',
  'tauros-paldea-combat': '켄타로스(팔데아)',
  'tauros-paldea-blaze': '켄타로스(팔데아 불꽃)',
  'tauros-paldea-aqua': '켄타로스(팔데아 워터)',
  'iron-hands': '무쇠손',
  'iron-valiant': '무쇠무인',
  'iron-jugulis': '무쇠머리',
  'iron-treads': '무쇠바퀴',
  'iron-thorns': '무쇠가시',
  'iron-bundle': '무쇠보따리',
  'iron-moth': '무쇠독나방',
  'great-tusk': '위대한엄니',
  'scream-tail': '우렁찬꼬리',
  'brute-bonnet': '사나운버섯',
  'flutter-mane': '날개치는머리',
  'slither-wing': '땅을기어가는날개',
  'sandy-shocks': '모래털가죽',
  'roaring-moon': '고동치는달',
  'walking-wake': '굽이치는물결',
  'iron-leaves': '무쇠잎새',
  'gouging-fire': '굽이치는불',
  'raging-bolt': '날뛰는우레',
  'iron-crown': '무쇠감로',
  'iron-boulder': '무쇠암석',
  'terapagos-stellar': '테라파고스(스텔라)',
};

/**
 * Convert a Showdown species name to Korean.
 */
export function getPokemonKo(species: string): string {
  const key = species.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  if (specialForms[key]) return specialForms[key];
  if (koPokemon[key]) return koPokemon[key];
  
  // Try fallback for Paradox/special forms using normalized base
  const baseKey = key.split('-')[0];
  if (koPokemon[baseKey] && key.includes('-')) {
    // If it's a Mega, Gmax or common form
    if (key.endsWith('-mega')) return `${koPokemon[baseKey]}(메가)`;
    if (key.endsWith('-gmax')) return `${koPokemon[baseKey]}(거다이맥스)`;
    if (key.endsWith('-alola')) return `${koPokemon[baseKey]}(알로라)`;
    if (key.endsWith('-galar')) return `${koPokemon[baseKey]}(가라르)`;
    if (key.endsWith('-hisui')) return `${koPokemon[baseKey]}(히스이)`;
    if (key.endsWith('-paldea')) return `${koPokemon[baseKey]}(팔데아)`;
    return koPokemon[baseKey];
  }

  return koPokemon[baseKey] || species;
}

/**
 * Convert a Showdown move name to Korean.
 */
export function getMoveKo(move: string): string {
  const key = move.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  return koMoves[key] || move;
}

/**
 * Convert a Showdown ability name to Korean.
 */
export function getAbilityKo(ability: string): string {
  const key = ability.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  return koAbilities[key] || ability;
}

/**
 * Try to match a user's guess (Korean or English) against the target species.
 */
export function isCorrectGuess(guess: string, species: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[\s\-]/g, '').replace(/[^a-z0-9가-힣]/g, '');
  const normalizedGuess = normalize(guess);
  const koName = getPokemonKo(species);
  
  return (
    normalizedGuess === normalize(species) ||
    normalizedGuess === normalize(koName) ||
    normalizedGuess === normalize(species.replace(/-.*/,'')) || // base form fallback
    normalizedGuess === normalize(koName.split('(')[0]) // base Ko name fallback
  );
}

/**
 * UI Localization
 */
export const UI = {
  LEVEL: 'Lv.',
  HP: 'HP',
  GUESS_SUBMIT: '정답 맞추기!',
  GUESS_REMAINING: '남음',
  BACK: '뒤로',
  LOADING: '로딩 중...',
  READY: '준비 중...',
  ENEMY_LOADING: '상대 포켓몬 로드 중...',
  BATTLE_END: '배틀 종료',
  WAITING: '대기 중...',
  SWITCH: '교체',
};
