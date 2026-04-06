const http = require('https');

function check(url) {
  http.get(url, (res) => {
    console.log(`${url} => ${res.statusCode}`);
  });
}

check('https://play.pokemonshowdown.com/sprites/gen5/hooh.png');
check('https://play.pokemonshowdown.com/sprites/dex/hooh.png');
check('https://play.pokemonshowdown.com/sprites/gen5/ho-oh.png');

check('https://play.pokemonshowdown.com/sprites/gen5/chienpao.png');
check('https://play.pokemonshowdown.com/sprites/dex/chienpao.png');

check('https://play.pokemonshowdown.com/sprites/gen5/ogerponwellspring.png');
check('https://play.pokemonshowdown.com/sprites/dex/ogerponwellspring.png');
check('https://play.pokemonshowdown.com/sprites/gen5/ogerpon-wellspring.png');

