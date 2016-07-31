const PokemonGO = require('pokemon-go-node-api');
const _ = require('lodash');

const api = exports.api = new PokemonGO.Pokeio();

/**
 * Connects to the PGO API and returns a Promise
 * with the API client
 *
 * @param {Object} options
 * @param {String} options.username
 * @param {String} options.password
 * @param {String} options.provider
 * @param {String} options.location
 * @return {Promise}
 */
const connect = exports.connect = options => new Promise(resolve => {
  api.init(options.username, options.password, options.location, options.provider, err => {
    if (!err) {
      resolve(api);
    }
  });
});

/**
 * Retrieve the Pokemon data object for the given Pokemon ID
 *
 * @param {Integer} id
 * @return {Object}
 */
const getPokemonDetails = exports.getPokemonDetails = id => api.pokemonlist[parseInt(id, 10) - 1];

/**
 * Updates the bot's location and returns a Promise
 * with the updated location
 *
 * @param {Object} location
 * @return {Promise}
 */
const setLocation = exports.setLocation = location => new Promise(resolve => {
  api.SetLocation(location, (err, newLoc) => {
    if (!err) {
      resolve(newLoc);
    }
  });
});

/**
 * Scans the area for Pokemon and returns a Promise
 * with the heartbeat payload
 *
 * @return {Promise}
 */
const scan = exports.scan = () => new Promise(resolve => {
  api.Heartbeat((err, heartbeat) => {
    if (!err) {
      resolve(heartbeat);
    }
  });
});

/**
 * Searches the specified location and returns a Promise
 * with a list of found Pokemons
 *
 * @param {Object} location
 * @return {Promise}
 */
const search = exports.search = location => new Promise(resolve => {
  setLocation(location)
    .then(scan)
    .then(heartbeat => {
      let wilds = [];
      let nearby = [];
      // find all wild and nearby
      heartbeat.cells.forEach(cell => {
        if (cell.WildPokemon.length) {
          wilds = cell.WildPokemon.map(p => {
            const pid = parseInt(p.pokemon.PokemonId, 10);
            const pkmn = getPokemonDetails(pid);
            pkmn.location = {
              latitude: p.Latitude,
              longitude: p.Longitude,
            };
            pkmn.expires_at = p.TimeTillHiddenMs;
            return pkmn;
          });
        }
        if (cell.NearbyPokemon.length) {
          nearby = cell.NearbyPokemon.map(p => {
            const pid = parseInt(p.PokedexNumber, 10);
            const pkmn = getPokemonDetails(pid);
            return pkmn;
          });
        }
      });
      const all = _.unionBy(wilds, nearby, 'id');
      resolve(all || []);
    });
});
