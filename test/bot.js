import test from 'ava';
import bot from '../src/bot';

test('creates an error object', t => {
  const code = 100;
  const tweet = {
    coordinates: {
      type: 'Point',
      coordinates: [10, 10],
    },
  };
  const expected = {
    code,
    tweet,
  };
  t.deepEqual(bot.createError(code, tweet), expected);
});

test('gets the location of a tweet', t => {
  const long = 10;
  const lat = 20;
  const tweet = {
    coordinates: {
      type: 'Point',
      coordinates: [long, lat],
    },
  };
  const expected = {
    type: 'coords',
    coords: {
      latitude: lat,
      longitude: long,
    },
  };
  t.deepEqual(bot.getLocation(tweet), expected);
});
