const fs = require('fs');

// Parse the user-provided CSV file with complete Korean names including form variants
const csvPath = 'C:\\Users\\win10\\Downloads\\pokemon_complete_korean_fixed_ver7.csv';
const lines = fs.readFileSync(csvPath, 'utf8').split('\n').slice(1); // skip header

const koMap = {};

for (const line of lines) {
  if (!line.trim()) continue;
  const parts = line.split(',');
  const nameEn = parts[1]?.trim();
  const nameKo = parts[2]?.trim();
  if (nameEn && nameKo) {
    koMap[nameEn] = nameKo;
  }
}

fs.writeFileSync('ko_pokemon.json', JSON.stringify(koMap, null, 2));
console.log(`Generated ko_pokemon.json with ${Object.keys(koMap).length} entries`);

// Preview some form variants
const tests = [
  'pikachu', 'bulbasaur', 'ogerpon-wellspring', 'ogerpon-hearthflame', 'ogerpon-cornerstone',
  'tauros-paldean-blaze', 'tauros-paldean-aqua', 'rotom-heat', 'rotom-wash',
  'giratina-altered', 'giratina-origin', 'darmanitan-galarian-standard',
  'iron-hands', 'great-tusk', 'charizard-mega-x', 'mewtwo-mega-y',
  'ho-oh', 'wo-chien', 'chi-yu', 'chien-pao', 'ting-lu'
];
for (const t of tests) {
  console.log(`  ${t} -> ${koMap[t] || '(not found)'}`);
}
