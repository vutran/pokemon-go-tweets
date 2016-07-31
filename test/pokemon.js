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
});

test('get a list of subjectively rare Pokemon names', t => {
  t.true(pokemon.getRares().length > 0);
  t.true(pokemon.getRares().indexOf('Mewtwo') > -1);
  t.false(pokemon.getRares().indexOf('Pidgey') > -1);
});

test('checks if a Pokemon is rare', t => {
  t.true(pokemon.isRare('Mewtwo'));
  t.false(pokemon.isRare('Pidgey'));
});
