const pokemon = require('pokemon');
const _ = require('lodash');

/**
 * Retrieve an array of Pokemon names
 *
 * @return {String[]}
 */
const getAll = exports.getAll = () => pokemon.all.map(p => p.toLowerCase());

/**
 * Retrieve the Pokemon name
 *
 * @param {Number} id
 * @return {String}
 */
const getName = exports.getName = id => pokemon.getName(id);

/**
 * Retrieve the Pokemon ID
 *
 * @param {Name}
 * @return {Integer}
 */
const getId = exports.getId = name => pokemon.getId(name);

/**
 * Finds matching pokemon from input array by it's matching name
 *
 * @param {String|Array} search - A single Pokemon name or an array of names
 * @return {Array}
 */
const getMatching = exports.getMatching = (search) => {
  let searchArr = search;
  if (typeof search === 'string') {
    searchArr = search.toLowerCase().split(' ');
  }
  return _.intersection(searchArr, getAll());
};

/**
 * Return an array of (subjectively) rare Pokemons
 *
 * @return {Array}
 */
const getRares = exports.getRares = () => [
  'Charizard',
  'Venusaur',
  'Blastoise',
  'Clefable',
  'Wigglytuff',
  'Arcanine',
  'Vulpix',
  'Machamp',
  'Alakazam',
  'Tauros',
  'Kangaskhan',
  'Magmar',
  'Scyther',
  'Pinsir',
  'Jynx',
  'Mr. Mime',
  'Hitmonchan',
  'Hitmonlee',
  'Gyarados',
  'Lapras',
  'Ditto',
  'Jolteon',
  'Flareon',
  'Vaporeon',
  'Porygon',
  'Omanyte',
  'Omastar',
  'Kabuto',
  'Kabutops',
  'Aerodactyl',
  'Snorlax',
  'Articuno',
  'Zapdos',
  'Moltres',
  'Mewtwo',
  'Mew',
];

/**
 * Checks if the given Pokemon is rare by it's name
 *
 * @return {Boolean}
 */
const isRare = exports.isRare = name => getRares().map(p => p.toLowerCase()).indexOf(name.toLowerCase()) > -1;
