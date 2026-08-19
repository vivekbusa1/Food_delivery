/* Temporary helper (not part of the app) to boot the API against an in-memory MongoDB
 * so we can curl-verify routes without a local mongod/Docker daemon.
 * Usage: node scripts/start-with-memory-db.js
 */
require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URL = mongod.getUri('food_delivery');
  process.env.PORT = process.env.PORT || '5001';
  // eslint-disable-next-line no-console
  console.log('In-memory MongoDB URL:', process.env.MONGODB_URL);
  require('../src/server');
})();
