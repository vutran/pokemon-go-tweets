require('dotenv').config({ silent: true });
const async = require('async');
const twitter = require('./twitter');
const pokewatch = require('./pokewatch');

const NUM_WORKERS = 1;

const processTweet = ({ twitterClient, tweet }) => new Promise(resolve => {
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
    resolve();
  }
});

const q = async.queue((payload, callback) => {
  processTweet(payload).then(() => {
    callback();
  });
}, NUM_WORKERS);

// assign a callback
q.drain = () => {
  console.log('------ QUEUE IS DRAINED!');
};

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
