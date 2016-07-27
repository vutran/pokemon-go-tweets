const pokemon = require('pokemon');
const PokemonGO = require('pokemon-go-node-api');
const _ = require('lodash');

const SEARCH_TIMEOUT = 2500;

const username = process.env.GOOGLE_USERNAME;
const password = process.env.GOOGLE_PASSWORD;
const provider = 'google';
const api = new PokemonGO.Pokeio();

const getAllPokemon = exports.getAllPokemon = () => pokemon.all.map(p => p.toLowerCase());

const findMatching = exports.findMatching = (search) => {
  let searchArr = search;
  if (typeof search === 'string') {
    searchArr = search.toLowerCase().split(' ');
  }
  return _.intersection(searchArr, getAllPokemon());
};

const connect = exports.connect = location => new Promise(resolve => {
  const loc = location || { type: 'name', name: 'Santa Monica Pier' };
  api.init(username, password, loc, provider, err => {
    if (!err) {
      resolve(api);
    }
  });
});

const setLocation = exports.setLocation = location => new Promise(resolve => {
  api.SetLocation(location, (err1, newLoc) => {
    if (!err1) {
      // get access token
      api.GetAccessToken(username, password, err2 => {
        if (!err2) {
          // get endpiont
          api.GetApiEndpoint(err3 => {
            if (!err3) {
              resolve(newLoc);
            }
          });
        }
      });
    }
  });
});

const getPokemonDetails = id => api.pokemonlist[parseInt(id, 10) - 1];

const search = exports.search = () => new Promise(resolve => {
  console.info('------ Heartbeat');
  try {
    api.Heartbeat((err, hb) => {
      if (!err) {
        // go through cells
        hb.cells.forEach(cell => {
          console.log(cell.WildPokemon);
          if (cell.WildPokemon.length) {
            const wilds = cell.WildPokemon.map(p => {
              const pkmn = getPokemonDetails(p.pokemon.PokemonId);
              return Object.assign({}, pkmn, {
                location: {
                  latitude: p.Latitude,
                  longitude: p.Longitude,
                },
                expires_at: p.TimeTillHiddenMs,
              });
            });
            resolve(wilds);
          } else {
            resolve([]);
          }
        });
      } else {
        console.errl('HB ERR:', err);
      }
    });
  } catch (x) {
    console.error(x);
  }
});
