const Twitter = require('twitter');

let api = false;

/**
 * Creates a new Twitter API client and returns a Promise
 * with the API client
 *
 * @param {Object} options
 * @param {String} options.consumer_key
 * @param {String} options.consumer_id
 * @param {String} options.access_token_key
 * @param {String} options.access_token_secret
 * @return {Promise}
 */
const connect = exports.connect = (options) => new Promise(resolve => {
  api = new Twitter({
    consumer_key: options.consumer_key,
    consumer_secret: options.consumer_secret,
    access_token_key: options.access_token_key,
    access_token_secret: options.access_token_secret,
  });
  resolve(api);
});

/**
 * Listens to a given tracked keyword and runs the callback
 *
 * @param {String} track - The keyword to track
 * @param {Function} callback - The callback function when a tweet is found; args: (tweet)
 */
const listen = exports.listen = (track, callback) => {
  api.stream('statuses/filter', { track }, stream => {
    stream.on('data', callback);
  });
};

 /**
  * Posts a new tweet and returns a Promise
  * with the tweet object
  *
  * @param {Object} tweet
  * @return {Promise}
  */
const post = exports.post = tweet => new Promise(resolve => {
  console.log('TWEET:', tweet);
  api.post('statuses/update', tweet, () => {
    resolve(tweet);
  });
});
