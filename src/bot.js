const constants = require('./constants');
const async = require('async');
const pgo = require('./pgo');
const pokemon = require('./pokemon');
const twitter = require('./twitter');
const hotspots = require('../data/hotspots');

/**
 * Handles the bot errors
 *
 * @param {null|Object} err
 * @param {Function} next
 * @param {Object} err
 */
const handleErrors = exports.handleErrors = (err, next) => {
  switch (err.code) {
    case constants.ERROR_NO_LOCATION: {
      const reply = {
        status: `@${err.tweet.user.screen_name} Please enable location in your tweet.`,
        in_reply_to_status_id: err.tweet.id_str,
      };
      twitter.post(reply).then(next);
      break;
    }
    case constants.ERROR_NO_FOUND_POKEMON: {
      const reply = {
        status: `@${err.tweet.user.screen_name} No Pokemon is found at your location.`,
        in_reply_to_status_id: err.tweet.id_str,
      };
      twitter.post(reply).then(next);
      break;
    }
    default:
      next();
      break;
  }
};

/**
 * Creates an error object with the given code and tweet
 *
 * @param {Integer} code
 * @param {Object} tweet
 * @return {Object}
 */
const createError = exports.createError = (code, tweet) => ({ code, tweet });

/**
 * Given a tweet, retrieve it's coordinates if available
 *
 * @see http://geojson.org/
 * @param {Object} tweet
 * @return {Boolean|Object}
 */
const getLocation = exports.getLocation = tweet => {
  let coords = false;
  if (tweet.coordinates && tweet.coordinates.type === 'Point') {
    coords = tweet.coordinates.coordinates;
  } else if (tweet.place) {
    coords = tweet.place.bounding_box.coordinates[0][0];
  }
  if (coords) {
    return {
      type: 'coords',
      coords: {
        latitude: coords[1],
        longitude: coords[0],
      },
    };
  }
  return false;
};

/**
 * Takes an incoming tweet and processes it and returns a Promise
 *
 * If the location doesn't exist in the tweet, the Promise is rejected
 * If there are no Pokemon found at the location, the Promise is rejected
 *
 * @param {Object} tweet
 * @return Promise
 */
const process = exports.process = tweet => new Promise((resolve, reject) => {
  const location = getLocation(tweet);
  if (tweet.in_reply_to_status_id) {
    // skip replies as this causes an infinite loop if the bot and tweeter is
    // of the same username because the bot will reply to the tweeter and
    // gets caught again by the stream.
    reject(createError(constants.ERROR_IGNORE_REPLIES, tweet));
  } else if (!location) {
    reject(createError(constants.ERROR_NO_LOCATION, tweet));
  } else {
    pgo.search(location)
      .then(found => {
        if (!found.length) {
          reject(createError(constants.ERROR_NO_FOUND_POKEMON, tweet));
        } else {
          const foundStr = found.map(p => p.name).join(', ');
          const reply = {
            status: `@${tweet.user.screen_name} ${foundStr} is available nearby.`,
            in_reply_to_status_id: tweet.id_str,
            display_coordinates: true,
            geo: {
              type: 'Point',
              lat: location.coords.latitude,
              long: location.coords.longitude,
              display_coordinates: true,
            },
          };
          twitter.post(reply)
            .then(() => {
              resolve();
            });
        }
      });
  }
});

/**
 * Processes a scan/lookup at the next hotspot
 *
 * @param {Object} location
 * @param {Function} next
 */
const processScanner = exports.processScanner = (location, next) => {
  setTimeout(() => {
    console.log('processing', location);
    pgo.search(location)
      .then(
        found => {
          const rarePokemons = found.map(p => p.name).filter(p => pokemon.isRare(p));
          if (rarePokemons.length) {
            const reply = {
              status: `${rarePokemons.join(', ')} is roaming aroun ${location.name}`,
              display_coordinates: true,
              geo: {
                type: 'Point',
                lat: location.coords.latitude,
                long: location.coords.longitude,
                display_coordinates: true,
              },
            };
            twitter.post(reply)
              .then(() => {
                next();
              });
          } else {
            next();
          }
        },
        () => {
          next();
        }
      );
  }, constants.SCANNER_INTERVAL);
};

/**
 * Starts a background scanner process to
 *  scan at hotspots
 */
const startScanner = exports.startScanner = () => {
  let scannerIndex = -1;
  async.forever(
    next => {
      scannerIndex++;
      if (scannerIndex >= hotspots.length) {
        scannerIndex = 0;
      }
      console.log('--- RUNNING WATCHER', scannerIndex);
      const spot = hotspots[scannerIndex];
      const location = {
        name: spot.name,
        type: 'coords',
        coords: {
          latitude: spot.coords[0],
          longitude: spot.coords[1],
        },
      };
      processScanner(location, next);
    },
    err => {
      if (err) {
        console.error('SCANNER ERROR:', err.message);
      }
    }
  );
};
