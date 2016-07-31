require('dotenv').config({ silent: true });
const async = require('async');
const twitter = require('./src/twitter');
const pgo = require('./src/pgo');
const pokemon = require('./src/pokemon');
const constants = require('./src/constants');
const bot = require('./src/bot');
const hotspots = require('./data/hotspots');

const q = async.queue((tweet, next) => {
  bot.process(tweet)
    .then(next)
    .catch(err => {
      bot.handleErrors(err, next);
    });
}, constants.NUM_WORKERS);

// assign a callback
q.drain = () => {
  console.log('----- QUEUE IS DRAINED!');
};

const main = () => {
  const connectTwitter = twitter.connect({
    consumer_key: constants.TWITTER_CONSUMER_ID,
    consumer_secret: constants.TWITTER_CONSUMER_SECRET,
    access_token_key: constants.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: constants.TWITTER_ACCESS_TOKEN_SECRET,
  });
  const connectPGO = pgo.connect({
    username: constants.GOOGLE_USERNAME,
    password: constants.GOOGLE_PASSWORD,
    provider: constants.PGO_PROVIDER,
    location: constants.DEFAULT_LOCATION,
  });

  Promise.all([connectTwitter, connectPGO])
    .then(values => {
      // starts the scanner
      bot.startScanner();
      // listen to the track term
      twitter.listen(constants.TWITTER_TRACK_TERM, tweet => {
        q.push(tweet);
      });
    });
};

main();
