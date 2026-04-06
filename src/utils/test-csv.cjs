const fs = require('fs');
const lines = fs.readFileSync('pokemon_species_names.csv', 'utf8').split('\n');
console.log(lines.slice(0, 10));
