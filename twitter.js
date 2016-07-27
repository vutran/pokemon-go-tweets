const Twitter = require('twitter');

/**
 * Creates a new Twitter API client
 *
 * @return {Promise}
 */
exports.connect = () => new Promise(resolve => {
  const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_ID,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });
  resolve(client);
});
