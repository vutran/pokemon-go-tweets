const pokemon = require('pokemon');
const _ = require('lodash');

const getAll = exports.getAll = () => pokemon.all.map(p => p.toLowerCase());

const getName = exports.getName = id => pokemon.getName(id);

const getId = exports.getId = name => pokemon.getId(name);

/**
 * Finds matching pokemon from input array by name
 *
 * @param {String|Array} search - A single Pokemon name or an array of names
 * @return {Array}
 */
const getMatching = exports.getMatching = (search) => {
  let searchArr = search;
  if (typeof search === 'string') {
    searchArr = search.toLowerCase().split(' ');
  }
  return _.intersection(searchArr, pokemon.getAll());
};

/**
 * Return an array of (subjectively) rare Pokemons
 *
 * @return {Array}
 */
const getRares = exports.getRares = () => [
  'Charmander',
  'Charmeleon',
  'Charizard',
  'Bulbasaur',
  'Ivysaur',
  'Venusaur',
  'Squirtle',
  'Wartortle',
  'Blastoise',
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
