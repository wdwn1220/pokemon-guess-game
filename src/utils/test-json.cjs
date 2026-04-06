const pokedex = require('./pokedex.json');
const moves = require('./moves.json');

console.log('pokedex length:', Object.keys(pokedex).length);
console.log('Pikachu:', pokedex['pikachu']);
console.log('Bulbasaur:', pokedex['bulbasaur']);

console.log('moves length:', Object.keys(moves).length);
console.log('Thunderbolt:', moves['thunderbolt']);
