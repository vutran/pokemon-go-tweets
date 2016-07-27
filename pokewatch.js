const pokemon = require('pokemon');
const PokemonGO = require('pokemon-go-node-api');
const _ = require('lodash');

const username = process.env.GOOGLE_USERNAME;
const password = process.env.GOOGLE_PASSWORD;
const provider = 'google';
const api = new PokemonGO.Pokeio();

const getAllPokemon = exports.getAllPokemon = () => pokemon.all.map(p => p.toLowerCase());

const findMatching = exports.findMatching = (search) => {
  searchArr = search;
  if (typeof search === 'string') {
    searchArr = search.toLowerCase().split(' ');
  }
  return _.intersection(searchArr, getAllPokemon());
}

const connect = exports.connect = () => {
  return new Promise(resolve => {
    api.init(username, password, {}, provider, err => {
      resolve(api);
    });
  });
};

const setLocation = exports.setLocation = location => {
  return new Promise(resolve => {
    api.SetLocation(location, (err, newLoc) => {
      if (!err) {
        // get access token
        api.GetAccessToken(username, password, (err1, token) => {
          if (!err1) {
            // get endpiont
            api.GetApiEndpoint((err2, endpoint) => {
              if (!err2) {
                resolve(newLoc);
              }
            });
          }
        });
      }
    });
  });
};

const search = exports.search = lcoation => {
  return new Promise(resolve => {
    let t = setInterval(() => {
      console.info('----> Heartbeat');
      api.Heartbeat((err2, hb) => {
        // go through cells
        hb.cells.forEach(cell => {
          if (cell.NearbyPokemon.length) {
            // get the pokemon info
            const pokemon = getPokemonDetails(cell.NearbyPokemon[0].PokedexNumber);
            const distanceInMeters = cell.NearbyPokemon[0].DistanceMeters.toString();
            // clear interval
            clearInterval(t);
            resolve({pokemon, distanceInMeters});
          }
        });
      });
    }, 5000);
  });
};

const getPokemonDetails = id => api.pokemonlist[parseInt(id, 10) - 1];
