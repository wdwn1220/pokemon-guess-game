const fs = require('fs');
const https = require('https');

// Download a URL to a file
function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

async function main() {
  // Download PokeAPI CSVs
  console.log('Downloading CSVs...');
  await download('https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_species_names.csv', 'pokemon_species_names.csv');
  await download('https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/move_names.csv', 'move_names.csv');
  await download('https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/ability_names.csv', 'ability_names.csv');
  await download('https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_species.csv', 'pokemon_species.csv');

  console.log('Parsing...');

  // Parse pokemon species names (lang=3 is Korean)
  const speciesLines = fs.readFileSync('pokemon_species_names.csv', 'utf8').split('\n').slice(1);
  const pokemonKo = {}; // { species_id: korean_name }
  for (const line of speciesLines) {
    const parts = line.split(',');
    if (parts[1] === '3') { // Korean language_id
      pokemonKo[parts[0]] = parts[2];
    }
  }

  // Parse move names (lang=3)
  const moveLines = fs.readFileSync('move_names.csv', 'utf8').split('\n').slice(1);
  const moveKo = {}; // { move_id: korean_name }
  for (const line of moveLines) {
    const parts = line.split(',');
    if (parts[1] === '3') {
      moveKo[parts[0]] = parts[2];
    }
  }

  // Parse ability names (lang=3)
  const abilityLines = fs.readFileSync('ability_names.csv', 'utf8').split('\n').slice(1);
  const abilityKo = {}; // { ability_id: korean_name }
  for (const line of abilityLines) {
    const parts = line.split(',');
    if (parts[1] === '3') {
      abilityKo[parts[0]] = parts[2];
    }
  }

  // Map species ID -> identifier from pokemon_species.csv
  const speciesIdMap = {}; // { identifier: species_id }
  const speciesIdentLines = fs.readFileSync('pokemon_species.csv', 'utf8').split('\n').slice(1);
  for (const line of speciesIdentLines) {
    const parts = line.split(',');
    if (parts[0] && parts[1]) {
      speciesIdMap[parts[1]] = parts[0]; // identifier -> id
    }
  }

  // Build final ko_pokemon.json: { "pikachu": "피카츄" }
  const koPokemon = {};
  for (const [identifier, id] of Object.entries(speciesIdMap)) {
    if (pokemonKo[id]) {
      koPokemon[identifier] = pokemonKo[id];
    }
  }

  // Download and parse moves identifier map
  await download('https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/moves.csv', 'moves.csv');
  const moveIdentLines = fs.readFileSync('moves.csv', 'utf8').split('\n').slice(1);
  const moveIdMap = {}; // { identifier: id }
  for (const line of moveIdentLines) {
    const parts = line.split(',');
    if (parts[0] && parts[1]) {
      moveIdMap[parts[1]] = parts[0];
    }
  }
  const koMoves = {};
  for (const [identifier, id] of Object.entries(moveIdMap)) {
    if (moveKo[id]) {
      koMoves[identifier] = moveKo[id];
    }
  }

  // Download and parse abilities identifier map
  await download('https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/abilities.csv', 'abilities.csv');
  const abilityIdentLines = fs.readFileSync('abilities.csv', 'utf8').split('\n').slice(1);
  const abilityIdMap = {};
  for (const line of abilityIdentLines) {
    const parts = line.split(',');
    if (parts[0] && parts[1]) {
      abilityIdMap[parts[1]] = parts[0];
    }
  }
  const koAbilities = {};
  for (const [identifier, id] of Object.entries(abilityIdMap)) {
    if (abilityKo[id]) {
      koAbilities[identifier] = abilityKo[id];
    }
  }

  // Save JSON files
  fs.writeFileSync('ko_pokemon.json', JSON.stringify(koPokemon, null, 2));
  fs.writeFileSync('ko_moves.json', JSON.stringify(koMoves, null, 2));
  fs.writeFileSync('ko_abilities.json', JSON.stringify(koAbilities, null, 2));

  console.log(`Generated ko_pokemon.json (${Object.keys(koPokemon).length} entries)`);
  console.log(`Generated ko_moves.json (${Object.keys(koMoves).length} entries)`);
  console.log(`Generated ko_abilities.json (${Object.keys(koAbilities).length} entries)`);

  // Preview
  console.log('\nSample pokemon:', { pikachu: koPokemon['pikachu'], bulbasaur: koPokemon['bulbasaur'], 'iron-hands': koPokemon['iron-hands'] });
  console.log('Sample move:', { thunderbolt: koMoves['thunderbolt'], 'close-combat': koMoves['close-combat'] });
}

main().catch(console.error);
