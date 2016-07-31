// Credentials
exports.GOOGLE_USERNAME = process.env.GOOGLE_USERNAME;
exports.GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD;
exports.TWITTER_TRACK_TERM = process.env.TWITTER_TRACK_TERM;
exports.TWITTER_CONSUMER_ID = process.env.TWITTER_CONSUMER_ID;
exports.TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
exports.TWITTER_ACCESS_TOKEN_KEY = process.env.TWITTER_ACCESS_TOKEN_KEY;
exports.TWITTER_ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET;
exports.PGO_PROVIDER = 'google';

// App Configurations
exports.NUM_WORKERS = 1;
exports.SEARCH_TIMEOUT = 2500;
exports.DEFAULT_LOCATION = { type: 'name', name: 'Santa Monica Pier' };
exports.SCANNER_INTERVAL = 1000 * 60 * 5;

// Error Codes
exports.ERROR_NO_LOCATION = 100;
exports.ERROR_NO_FOUND_POKEMON = 200;
exports.ERROR_IGNORE_REPLIES = 300;
