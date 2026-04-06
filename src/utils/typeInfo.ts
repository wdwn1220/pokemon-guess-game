// Pokemon type info: Korean names + colors
export const TYPE_COLORS: Record<string, string> = {
  Normal: '#A8A878',
  Fire: '#F08030',
  Water: '#6890F0',
  Electric: '#F8D030',
  Grass: '#78C850',
  Ice: '#98D8D8',
  Fighting: '#C03028',
  Poison: '#A040A0',
  Ground: '#E0C068',
  Flying: '#A890F0',
  Psychic: '#F85888',
  Bug: '#A8B820',
  Rock: '#B8A038',
  Ghost: '#705898',
  Dragon: '#7038F8',
  Dark: '#705848',
  Steel: '#B8B8D0',
  Fairy: '#EE99AC',
};

export const TYPE_KO: Record<string, string> = {
  Normal: '노말',
  Fire: '불꽃',
  Water: '물',
  Electric: '전기',
  Grass: '풀',
  Ice: '얼음',
  Fighting: '격투',
  Poison: '독',
  Ground: '땅',
  Flying: '비행',
  Psychic: '에스퍼',
  Bug: '벌레',
  Rock: '바위',
  Ghost: '고스트',
  Dragon: '드래곤',
  Dark: '악',
  Steel: '강철',
  Fairy: '페어리',
};

export const CATEGORY_KO: Record<string, string> = {
  Physical: '물리',
  Special: '특수',
  Status: '변화',
};

export function getTypeColor(type: string): string {
  return TYPE_COLORS[type] ?? '#888';
}

export function getTypeKo(type: string): string {
  return TYPE_KO[type] ?? type;
}
