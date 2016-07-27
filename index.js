require('dotenv').config({ silent: true });
const twitter = require('./twitter');
const pokewatch = require('./pokewatch');

twitter
  .connect()
  .then(twitterClient => {
    pokewatch
      .connect()
      .then(pokeApi => {
        // listen for the hashtags
        twitterClient.stream('statuses/filter', { track: process.env.TWITTER_TRACK_TERM }, stream => {
          stream.on('data', tweet => {
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
                  pokewatch.search(newLoc)
                    .then(({ pokemon, distanceInMeters }) => {
                      const reply = {
                        status: `@${tweet.user.screen_name} A ${pokemon.name} is within ${distanceInMeters} meters.`,
                        in_reply_to_status_id: tweet.id_str,
                        display_coordinates: true,
                      };
                      console.info('------ REPLY DATA');
                      console.info(reply);
                      twitterClient.post('statuses/update', reply, (err2, replyTweet) => {
                          if (!err2) {
                            console.info('------ REPLIED!');
                          }
                      });
                    });
                }); // end then
            }
          }); // end on stream data
        }); // end twitter stream
      })
      .catch(err => {
        console.error(err);
      });
  })
  .catch(err => {
    console.error(err);
  });
