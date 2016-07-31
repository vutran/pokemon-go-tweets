import test from 'ava';
import pokemon from '../src/pokemon';

test('get all Pokemon names', t => {
  t.true(pokemon.getAll().length > 0);
});

test('get the Pokemon name', t => {
  t.is(pokemon.getName(150), 'Mewtwo');
  t.is(pokemon.getName('150'), 'Mewtwo');
  t.is(pokemon.getName('0150'), 'Mewtwo');
  t.is(pokemon.getName(6), 'Charizard');
  t.is(pokemon.getName('6'), 'Charizard');
  t.is(pokemon.getName('00006'), 'Charizard');
});

test('get the Pokemon ID', t => {
  t.is(pokemon.getId('Mewtwo'), 150);
  t.is(pokemon.getId('Charizard'), 6);
});

test('get all Pokemon that is exactly matching the query', t => {
  const query = 'Charmander';
  const results = pokemon.getMatching(query);
  t.deepEqual(results, ['charmander']);
  t.notDeepEqual(results, ['charmeleon']);
});

test('find a single Pokemon mentions in the string', t => {
  const value = 'Find Pikachu';
  const expected = ['pikachu'];
  t.deepEqual(pokemon.findPokemonInString(value), expected);
  t.notDeepEqual(pokemon.findPokemonInString(value), ['raichu']);
});

test('find multiple Pokemon mentions in the string', t => {
  const value = 'Find Pikachu and Raichu';
  const results = pokemon.findPokemonInString(value);
  const expected = ['pikachu', 'raichu'];
  t.is(results.length, 2);
  t.true(results.indexOf('pikachu') > -1);
  t.true(results.indexOf('raichu') > -1);
  t.false(results.indexOf('charizard') > -1);
});

test('get a list of subjectively rare Pokemon names', t => {
  const rares = pokemon.getRares();
  t.true(rares.length > 0);
  t.true(rares.indexOf('Mewtwo') > -1);
  t.false(rares.indexOf('Pidgey') > -1);
});

test('checks if a Pokemon is rare', t => {
  t.true(pokemon.isRare('Mewtwo'));
  t.false(pokemon.isRare('Pidgey'));
});
