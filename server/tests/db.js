/**
 * Test database helper.
 * - In CI we point MONGO_URI_TEST at a real MongoDB service container.
 * - Locally (no env var) we spin up an in-memory MongoDB with mongodb-memory-server.
 */
const mongoose = require('mongoose');

let memoryServer;

async function connect() {
  let uri = process.env.MONGO_URI_TEST;
  if (!uri) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
  }
  await mongoose.connect(uri, {
    dbName: `shoplite-test-${process.env.JEST_WORKER_ID || 1}`,
    // The MongoDB driver loads `os` with a dynamic import(), which fails inside Jest's
    // CommonJS sandbox and leaves the handshake without client metadata (the server then
    // rejects it). Passing the module in directly avoids that.
    runtimeAdapters: { os: require('os') },
  });
  // Make sure indexes (e.g. the text index used by ?search=) exist before tests run.
  await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
}

async function clear() {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}

async function close() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}

module.exports = { connect, clear, close };
