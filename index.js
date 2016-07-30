require('dotenv').config({ silent: true });
const async = require('async');
const twitter = require('./twitter');
const pokewatch = require('./pokewatch');
const pokemon = require('./data/pokemon');
const hotspots = require('./data/hotspots');

const NUM_WORKERS = 1;

const ERR_NO_LOCATION = 100;

const processTweet = ({ twitterClient, tweet }) => new Promise((resolve, reject) => {
  let coords = false;
  if (tweet.coordinates && tweet.coordinates.type === 'Point') {
    coords = tweet.coordinates.coordinates;
  } else if (tweet.place) {
    coords = tweet.place.bounding_box.coordinates[0][0];
  }
  if (coords) {
    const location = {
      type: 'coords',
      coords: {
        longitude: coords[0],
        latitude: coords[1],
      },
    };
    pokewatch.setLocation(location)
      .then(newLoc => {
        // search for pokemons!
        pokewatch.search()
          .then(wilds => {
            let reply = {
              status: `@${tweet.user.screen_name} No Pokemon is found at your location.`,
              in_reply_to_status_id: tweet.id_str,
              display_coordinates: true,
            };
            if (wilds.length) {
              const wildList = wilds.map(p => p.name).join(', ');
              reply = {
                status: `@${tweet.user.screen_name} ${wildList} is available nearby.`,
                in_reply_to_status_id: tweet.id_str,
                display_coordinates: true,
              };
            }
            try {
              twitterClient.post('statuses/update', reply, err2 => {
                if (!err2) {
                  console.info('------ REPLIED!');
                  resolve();
                }
              });
            } catch (x) {
              console.error(x);
            }
          });
      })
      .catch(err => {
        console.error('SEARCH ERR', err);
      });
  } else {
    reject({
      code: ERR_NO_LOCATION,
      twitterClient,
      tweet,
    });
  }
});

const q = async.queue((payload, callback) => {
  processTweet(payload)
    .then(() => {
      callback();
    })
    .catch(err => {
      switch (err.code) {
        case ERR_NO_LOCATION: {
          const reply = {
            status: `@${err.tweet.user.screen_name} Please enable location in your tweet.`,
            in_reply_to_status_id: err.tweet.id_str,
          };
          err.twitterClient.post('statuses/update', reply, err2 => {
            if (!err2) {
              console.info('------ REPLIED! (NO LOCATION)');
              callback();
            }
          });
          break;
        }
        default:
          callback();
          break;
      }
    });
}, NUM_WORKERS);

// assign a callback
q.drain = () => {
  console.log('------ QUEUE IS DRAINED!');
};

let watchIndex = -1;

const runServer = next => {
  setTimeout(() => {
    watchIndex++;
    if (watchIndex >= hotspots.length) {
      watchIndex = 0;
    }
    console.log('--- RUNNING WATCHER', watchIndex);
    const spot = hotspots[watchIndex];
    const loc = {
      type: 'coords',
      coords: {
        latitude: spot.coords[0],
        longitude: spot.coords[1],
      },
    };
    // process a tweet
    twitter
      .connect()
      .then(twitterClient => {
        pokewatch
          .connect(loc)
          .then(() => {
            // search for pokemons!
            pokewatch
              .search()
              .then(found => {
                const foundStr = found
                  .map(p => parseInt(p.id, 10))
                  .filter(id => {
                    const raresLower = pokemon.getRares().map(n => pokemon.getId(n));
                    return raresLower.indexOf(id) > -1;
                  })
                  .map(id => pokemon.getName(id))
                  .join(', ');
                if (foundStr.length) {
                  const tweet = {
                    status: `${foundStr} is roaming around ${spot.name}.`,
                    display_coordinates: true,
                    geo: {
                      type: 'Point',
                      lat: spot.coords[0],
                      long: spot.coords[1],
                      display_coordinates: true,
                    },
                  };
                  twitterClient.post('statuses/update', tweet, err => {
                    console.log(tweet);
                    next();
                  });
                } else {
                  next();
                }
              });
          });
      });
  }, 1000 * 60 * 5);
};

async.forever(runServer, err => {
  console.error('SERVER ERROR:', err.message);
});

// start the flow
twitter
  .connect()
  .then(twitterClient => {
    pokewatch
      .connect()
      .then(() => {
        console.log('------ LISTEN FOR TWEETS');
        try {
          // listen for the hashtags
          twitterClient.stream('statuses/filter', { track: process.env.TWITTER_TRACK_TERM }, stream => {
            stream
              .on('data', tweet => {
                q.push({ twitterClient, tweet });
              })
              .on('error', err => {
                console.error(err);
              });
          }); // end twitter stream
        } catch (err) {
          console.error(err);
        }
      })
      .catch(err => {
        console.error(err);
      });
  })
  .catch(err => {
    console.error(err);
  });
